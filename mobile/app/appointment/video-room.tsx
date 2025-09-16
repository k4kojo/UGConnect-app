import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function VideoCallWaitingScreen() {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Camera permission UI
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={{ color: "#fff" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Button handlers
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    Alert.alert(
      "Minimize",
      "Call minimized (implement PiP or navigation here)."
    );
    // You can implement PiP or navigation logic here
  };

  const handleAddPerson = () => {
    Alert.alert("Add Person", "Open add participant modal or screen.");
  };

  const handleMoreOptions = () => {
    Alert.alert("More Options", "Show more call options here.");
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled((prev) => !prev);
    Alert.alert("Speaker", "Speaker toggled (implement real audio routing).");
  };

  const handleEndCall = () => {
    Alert.alert("Call Ended", "You have ended the call.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera as background */}
      <CameraView facing={facing} style={StyleSheet.absoluteFill} />

      {/* Top action buttons */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.circleBtn} onPress={handleMinimize}>
          <MaterialIcons name="fullscreen-exit" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.calleeName}>Dr. Kwame Asante</Text>
          <Text style={styles.callingText}>Calling...</Text>
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
          onPress={() => setIsVideoEnabled((prev) => !prev)}
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
          onPress={() => setIsAudioEnabled((prev) => !prev)}
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
