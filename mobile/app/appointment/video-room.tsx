import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Conditional import for WebRTC components
let RTCView: any;
try {
  RTCView = require("react-native-webrtc").RTCView;
} catch (error) {
  // RTCView not available in Expo Go
  RTCView = View; // Fallback to regular View
}

import WebRTCService, { WebRTCAvailable } from "../../services/webrtcService";
import { API_BASE_URL } from "../../services/api";

const { width } = Dimensions.get("window");

export default function VideoCallWaitingScreen() {
  const params = useLocalSearchParams();
  const { roomId, callId, userId } = params;
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [participants, setParticipants] = useState<string[]>([]);
  
  const webrtcService = useRef<WebRTCService | null>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, any>>(new Map());

  // Initialize WebRTC service
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        // Initialize WebRTC service
        webrtcService.current = new WebRTCService(API_BASE_URL.replace('http', 'ws'));
        
        // Set up event handlers
        webrtcService.current.onLocalStream = (stream) => {
          setLocalStream(stream);
        };
        
        webrtcService.current.onRemoteStream = (userId, stream) => {
          setRemoteStreams(prev => new Map(prev.set(userId, stream)));
        };
        
        webrtcService.current.onRemoteStreamRemoved = (userId) => {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        };
        
        webrtcService.current.onConnectionStateChange = (state) => {
          setConnectionStatus(state);
        };
        
        webrtcService.current.onParticipantJoined = (participant) => {
          setParticipants(prev => [...prev, participant.userId]);
        };
        
        webrtcService.current.onParticipantLeft = (userId) => {
          setParticipants(prev => prev.filter(id => id !== userId));
        };
        
        webrtcService.current.onError = (error) => {
          console.error('WebRTC Error:', error);
          Alert.alert('Connection Error', error.message);
        };

        // Connect to signaling server
        webrtcService.current.connect();
        
        // Initialize local stream
        await webrtcService.current.initializeLocalStream({
          video: true,
          audio: true
        });
        
        // Join room if parameters are provided
        if (roomId && userId) {
          await webrtcService.current.joinRoom(roomId as string, userId as string);
        }
        
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        Alert.alert('Error', 'Failed to initialize video call');
      }
    };

    initializeWebRTC();

    // Cleanup on unmount
    return () => {
      if (webrtcService.current) {
        webrtcService.current.destroy();
      }
    };
  }, [roomId, userId]);

  // Button handlers
  const toggleCameraFacing = () => {
    if (webrtcService.current) {
      webrtcService.current.switchCamera();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    Alert.alert(
      "Minimize",
      "Call minimized (implement PiP or navigation here)."
    );
  };

  const handleAddPerson = () => {
    Alert.alert("Add Person", "Open add participant modal or screen.");
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "Show more call options here.");
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled((prev) => !prev);
    // TODO: Implement speaker routing
  };

  const handleToggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    if (webrtcService.current) {
      webrtcService.current.toggleVideo(newVideoState);
    }
  };

  const handleToggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    if (webrtcService.current) {
      webrtcService.current.toggleAudio(newAudioState);
    }
  };

  const handleEndCall = async () => {
    try {
      if (webrtcService.current) {
        await webrtcService.current.leaveRoom();
      }
      Alert.alert("Call Ended", "You have ended the call.");
      router.back();
    } catch (error) {
      console.error('Error ending call:', error);
      router.back();
    }
  };

  // Show message if WebRTC is not available (running in Expo Go)
  if (!WebRTCAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>WebRTC Not Available</Text>
          <Text style={styles.messageText}>
            Video calling requires a development build. You're currently running in Expo Go.
          </Text>
          <Text style={styles.messageText}>
            To use video calling, please create a development build:
          </Text>
          <Text style={styles.codeText}>
            npx eas build --profile development --platform android
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Local video stream */}
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror={true}
        />
      )}

      {/* Remote video streams */}
      {Array.from(remoteStreams.entries()).map(([userId, stream], index) => (
        <View key={userId} style={[styles.remoteVideo, { top: 100 + index * 200 }]}>
          <RTCView
            streamURL={stream.toURL()}
            style={styles.remoteVideoView}
            objectFit="cover"
          />
          <Text style={styles.participantLabel}>Participant {index + 1}</Text>
        </View>
      ))}

      {/* Connection status indicator */}
      <View style={styles.statusIndicator}>
        <Text style={styles.statusText}>
          {connectionStatus === 'connected' ? 'Connected' : 
           connectionStatus === 'connecting' ? 'Connecting...' : 
           'Disconnected'}
        </Text>
        <Text style={styles.participantCount}>
          {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
        </Text>
      </View>

      {/* Top action buttons */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={handleMinimize}>
          <MaterialIcons name="fullscreen-exit" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.calleeName}>Video Call</Text>
          <Text style={styles.callingText}>
            {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
        <View style={{ flexDirection: "column", gap: 16 }}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleAddPerson}>
            <Ionicons name="person-add" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom control bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBtn} onPress={handleMoreOptions}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={handleToggleVideo}
        >
          <Ionicons
            name={isVideoEnabled ? "videocam" : "videocam-off"}
            size={24}
            color={isVideoEnabled ? "#fff" : "#888"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={handleToggleSpeaker}
        >
          <Ionicons
            name={isSpeakerEnabled ? "volume-high" : "volume-mute"}
            size={24}
            color={isSpeakerEnabled ? "#fff" : "#888"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtn}
          onPress={handleToggleAudio}
        >
          <Ionicons
            name={isAudioEnabled ? "mic" : "mic-off"}
            size={24}
            color={isAudioEnabled ? "#fff" : "#888"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomBtn, styles.endCallBtn]}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  messageTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  messageText: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  codeText: {
    color: "#4ade80",
    fontSize: 14,
    fontFamily: "monospace",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  permissionBtn: {
    marginTop: 20,
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  remoteVideo: {
    position: "absolute",
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
    zIndex: 5,
  },
  remoteVideoView: {
    flex: 1,
  },
  participantLabel: {
    position: "absolute",
    bottom: 4,
    left: 4,
    color: "#fff",
    fontSize: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusIndicator: {
    position: "absolute",
    top: 60,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  participantCount: {
    color: "#bbb",
    fontSize: 10,
    marginTop: 2,
  },
  topRow: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(40,40,40,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  calleeName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  callingText: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginTop: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 32,
    left: width * 0.05,
    width: width * 0.9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(30,30,30,0.85)",
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  bottomBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(80,80,80,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  endCallBtn: {
    backgroundColor: "#e11d48",
  },
});
