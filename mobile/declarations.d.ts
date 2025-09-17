// declare module "*.png" {
//   const value: string;
//   export default value;
// }

declare module "expo-apple-authentication";
declare module "expo-auth-session/providers/google";

// Type declarations for react-native-webrtc
declare module 'react-native-webrtc' {
  export interface RTCIceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
  }

  export interface RTCConfiguration {
    iceServers?: RTCIceServer[];
    iceTransportPolicy?: 'all' | 'relay';
    bundlePolicy?: 'balanced' | 'max-compat' | 'max-bundle';
  }

  export interface RTCTrackEvent {
    streams: MediaStream[];
    track: MediaStreamTrack;
  }

  export interface RTCPeerConnectionIceEvent {
    candidate: RTCIceCandidate | null;
  }

  export class RTCPeerConnection {
    constructor(configuration?: RTCConfiguration);
    
    // Properties
    connectionState: string;
    iceConnectionState: string;
    iceGatheringState: string;
    signalingState: string;
    localDescription: RTCSessionDescription | null;
    remoteDescription: RTCSessionDescription | null;
    
    // Event handlers
    ontrack: ((event: RTCTrackEvent) => void) | null;
    onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
    onconnectionstatechange: (() => void) | null;
    oniceconnectionstatechange: (() => void) | null;
    onicegatheringstatechange: (() => void) | null;
    onsignalingstatechange: (() => void) | null;
    
    // Methods
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;
    createOffer(options?: any): Promise<RTCSessionDescription>;
    createAnswer(options?: any): Promise<RTCSessionDescription>;
    setLocalDescription(description: RTCSessionDescription): Promise<void>;
    setRemoteDescription(description: RTCSessionDescription): Promise<void>;
    addIceCandidate(candidate: RTCIceCandidate): Promise<void>;
    close(): void;
  }

  export class RTCSessionDescription {
    constructor(init: { type: string; sdp: string });
    type: string;
    sdp: string;
  }

  export class RTCIceCandidate {
    constructor(init: { candidate: string; sdpMLineIndex?: number; sdpMid?: string });
    candidate: string;
    sdpMLineIndex: number | null;
    sdpMid: string | null;
  }

  export class MediaStream {
    constructor(tracks?: MediaStreamTrack[]);
    id: string;
    getTracks(): MediaStreamTrack[];
    getAudioTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
    toURL(): string;
  }

  export class MediaStreamTrack {
    id: string;
    kind: string;
    enabled: boolean;
    stop(): void;
    _switchCamera?(): void; // React Native WebRTC specific
  }

  export interface MediaDevices {
    getUserMedia(constraints: {
      video?: boolean | { frameRate?: number; facingMode?: string };
      audio?: boolean;
    }): Promise<MediaStream>;
    enumerateDevices(): Promise<any[]>;
  }

  export const mediaDevices: MediaDevices;

  export interface RTCViewProps {
    streamURL: string;
    style?: any;
    objectFit?: 'contain' | 'cover';
    mirror?: boolean;
  }

  export const RTCView: React.ComponentType<RTCViewProps>;
}