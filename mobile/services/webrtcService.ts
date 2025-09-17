import { io, Socket } from 'socket.io-client';

// Check if WebRTC is available (development build vs Expo Go)
let WebRTCAvailable = true;
let RTCPeerConnection: any;
let RTCIceCandidate: any;
let RTCSessionDescription: any;
let MediaStream: any;
let mediaDevices: any;
let RTCView: any;
let RTCPeerConnectionIceEvent: any;

try {
  const WebRTC = require('react-native-webrtc');
  RTCPeerConnection = WebRTC.RTCPeerConnection;
  RTCIceCandidate = WebRTC.RTCIceCandidate;
  RTCSessionDescription = WebRTC.RTCSessionDescription;
  MediaStream = WebRTC.MediaStream;
  mediaDevices = WebRTC.mediaDevices;
  RTCView = WebRTC.RTCView;
  RTCPeerConnectionIceEvent = WebRTC.RTCPeerConnectionIceEvent;
} catch (error) {
  console.warn('WebRTC not available - running in Expo Go? You need a development build for WebRTC functionality.');
  WebRTCAvailable = false;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface Participant {
  userId: string;
  socketId: string;
  stream?: MediaStream;
}

export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private roomId: string | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;

  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Event callbacks
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (userId: string, stream: MediaStream) => void;
  public onRemoteStreamRemoved?: (userId: string) => void;
  public onConnectionStateChange?: (state: string) => void;
  public onError?: (error: Error) => void;
  public onParticipantJoined?: (participant: Participant) => void;
  public onParticipantLeft?: (userId: string) => void;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: false,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.isConnected = true;
      this.onConnectionStateChange?.('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      this.isConnected = false;
      this.onConnectionStateChange?.('disconnected');
    });

    this.socket.on('user-joined', async (data: { userId: string; socketId: string }) => {
      console.log('User joined:', data.userId);
      await this.createPeerConnection(data.socketId, true);
      this.onParticipantJoined?.({ userId: data.userId, socketId: data.socketId });
    });

    this.socket.on('user-left', (data: { userId: string; socketId: string }) => {
      console.log('User left:', data.userId);
      this.closePeerConnection(data.socketId);
      this.remoteStreams.delete(data.userId);
      this.onParticipantLeft?.(data.userId);
      this.onRemoteStreamRemoved?.(data.userId);
    });

    this.socket.on('existing-participants', async (data: { participants: string[] }) => {
      console.log('Existing participants:', data.participants);
      // Create peer connections for existing participants
      for (const participantId of data.participants) {
        await this.createPeerConnection(participantId, false);
      }
    });

    this.socket.on('offer', async (data: { offer: RTCSessionDescription; sender: string }) => {
      console.log('Received offer from:', data.sender);
      await this.handleOffer(data.offer, data.sender);
    });

    this.socket.on('answer', async (data: { answer: RTCSessionDescription; sender: string }) => {
      console.log('Received answer from:', data.sender);
      await this.handleAnswer(data.answer, data.sender);
    });

    this.socket.on('ice-candidate', async (data: { candidate: RTCIceCandidate; sender: string }) => {
      console.log('Received ICE candidate from:', data.sender);
      await this.handleIceCandidate(data.candidate, data.sender);
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      this.onError?.(new Error(error.message));
    });
  }

  async initializeLocalStream(constraints: { video: boolean; audio: boolean }): Promise<MediaStream> {
    if (!WebRTCAvailable) {
      const error = new Error('WebRTC not available. Please use a development build instead of Expo Go.');
      this.onError?.(error);
      throw error;
    }

    try {
      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.onLocalStream?.(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.roomId = roomId;
    this.userId = userId;

    this.socket.emit('join-room', { roomId, userId });
  }

  async leaveRoom(): Promise<void> {
    if (!this.socket || !this.roomId || !this.userId) return;

    this.socket.emit('leave-room', { roomId: this.roomId, userId: this.userId });

    // Close all peer connections
    this.peerConnections.forEach((pc, socketId) => {
      this.closePeerConnection(socketId);
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStreams.clear();
    this.roomId = null;
    this.userId = null;
  }

  private async createPeerConnection(socketId: string, isInitiator: boolean): Promise<void> {
    try {
      const peerConnection = new RTCPeerConnection(this.config);
      this.peerConnections.set(socketId, peerConnection);

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream!);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Remote track added from:', socketId);
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          this.remoteStreams.set(socketId, remoteStream);
          this.onRemoteStream?.(socketId, remoteStream);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && this.socket) {
          this.socket.emit('ice-candidate', {
            candidate: event.candidate,
            target: socketId,
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        this.onConnectionStateChange?.(peerConnection.connectionState);
      };

      // Create offer if initiator
      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        if (this.socket) {
          this.socket.emit('offer', {
            offer,
            target: socketId,
          });
        }
      }
    } catch (error) {
      console.error('Error creating peer connection:', error);
      this.onError?.(error as Error);
    }
  }

  private async handleOffer(offer: RTCSessionDescription, sender: string): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(sender);
      if (!peerConnection) {
        await this.createPeerConnection(sender, false);
        return this.handleOffer(offer, sender);
      }

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (this.socket) {
        this.socket.emit('answer', {
          answer,
          target: sender,
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      this.onError?.(error as Error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescription, sender: string): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(sender);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError?.(error as Error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidate, sender: string): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(sender);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.onError?.(error as Error);
    }
  }

  private closePeerConnection(socketId: string): void {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(socketId);
    }
  }

  // Media control methods
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  switchCamera(): void {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // @ts-ignore - React Native WebRTC specific method
        videoTrack._switchCamera();
      }
    }
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  isRoomJoined(): boolean {
    return this.roomId !== null;
  }

  connect(): void {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  destroy(): void {
    this.leaveRoom();
    this.disconnect();
    this.peerConnections.clear();
    this.remoteStreams.clear();
  }
}

export { WebRTCAvailable };
export default WebRTCService;
