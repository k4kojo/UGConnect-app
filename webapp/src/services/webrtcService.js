import { io } from 'socket.io-client';

export class WebRTCService {
  constructor(serverUrl) {
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: false,
    });
    
    this.peerConnections = new Map();
    this.localStream = null;
    this.remoteStreams = new Map();
    this.roomId = null;
    this.userId = null;
    this.isConnected = false;

    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    // Event callbacks
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onRemoteStreamRemoved = null;
    this.onConnectionStateChange = null;
    this.onError = null;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;

    this.setupSocketListeners();
  }

  setupSocketListeners() {
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

    this.socket.on('user-joined', async (data) => {
      console.log('User joined:', data.userId);
      await this.createPeerConnection(data.socketId, true);
      this.onParticipantJoined?.({ userId: data.userId, socketId: data.socketId });
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data.userId);
      this.closePeerConnection(data.socketId);
      this.remoteStreams.delete(data.userId);
      this.onParticipantLeft?.(data.userId);
      this.onRemoteStreamRemoved?.(data.userId);
    });

    this.socket.on('existing-participants', async (data) => {
      console.log('Existing participants:', data.participants);
      for (const participantId of data.participants) {
        await this.createPeerConnection(participantId, false);
      }
    });

    this.socket.on('offer', async (data) => {
      console.log('Received offer from:', data.sender);
      await this.handleOffer(data.offer, data.sender);
    });

    this.socket.on('answer', async (data) => {
      console.log('Received answer from:', data.sender);
      await this.handleAnswer(data.answer, data.sender);
    });

    this.socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate from:', data.sender);
      await this.handleIceCandidate(data.candidate, data.sender);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error.message);
      this.onError?.(new Error(error.message));
    });
  }

  async initializeLocalStream(constraints = { video: true, audio: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.onLocalStream?.(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      this.onError?.(error);
      throw error;
    }
  }

  async joinRoom(roomId, userId) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.roomId = roomId;
    this.userId = userId;

    this.socket.emit('join-room', { roomId, userId });
  }

  async leaveRoom() {
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

  async createPeerConnection(socketId, isInitiator) {
    try {
      const peerConnection = new RTCPeerConnection(this.config);
      this.peerConnections.set(socketId, peerConnection);

      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Remote stream added from:', socketId);
        const [remoteStream] = event.streams;
        this.remoteStreams.set(socketId, remoteStream);
        this.onRemoteStream?.(socketId, remoteStream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
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
      this.onError?.(error);
    }
  }

  async handleOffer(offer, sender) {
    try {
      let peerConnection = this.peerConnections.get(sender);
      if (!peerConnection) {
        await this.createPeerConnection(sender, false);
        peerConnection = this.peerConnections.get(sender);
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
      this.onError?.(error);
    }
  }

  async handleAnswer(answer, sender) {
    try {
      const peerConnection = this.peerConnections.get(sender);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      this.onError?.(error);
    }
  }

  async handleIceCandidate(candidate, sender) {
    try {
      const peerConnection = this.peerConnections.get(sender);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.onError?.(error);
    }
  }

  closePeerConnection(socketId) {
    const peerConnection = this.peerConnections.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(socketId);
    }
  }

  // Media control methods
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  // Getters
  getLocalStream() {
    return this.localStream;
  }

  getRemoteStreams() {
    return this.remoteStreams;
  }

  isRoomJoined() {
    return this.roomId !== null;
  }

  connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  destroy() {
    this.leaveRoom();
    this.disconnect();
    this.peerConnections.clear();
    this.remoteStreams.clear();
  }
}

export default WebRTCService;
