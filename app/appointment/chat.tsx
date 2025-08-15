import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type Message = {
  id: string;
  from: "user" | "doctor";
  text?: string;
  image?: string;
  audio?: string;
  timestamp: string;
  status: "seen" | "delivered";
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      from: "doctor",
      text: "Hello, my name is Dr. Jane. How may I assist you today?",
      timestamp: "9:40 AM",
      status: "seen",
    },
    {
      id: "2",
      from: "user",
      text: "Hello, doctor",
      timestamp: "9:41 AM",
      status: "seen",
    },
    {
      id: "3",
      from: "user",
      text: "Hi, my name is Sylvester. I’ve been having pains in my chest region whenever I cough.",
      timestamp: "9:42 AM",
      status: "seen",
    },
  ]);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const [input, setInput] = useState("");
  // Removed: const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const handleSend = () => {
    if (input.trim() === "") return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (editingId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingId ? { ...msg, text: input, timestamp } : msg
        )
      );
      setEditingId(null);
    } else {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: "user",
        text: input,
        timestamp,
        status: "delivered",
      };
      setMessages((prev) => [...prev, newMessage]);
    }

    setInput("");
  };

  const handleLongPress = (msg: Message) => {
    if (msg.from !== "user") return;

    Alert.alert("Message Options", "Choose an action", [
      {
        text: "Edit",
        onPress: () => {
          setInput(msg.text || "");
          setEditingId(msg.id);
        },
      },
      {
        text: "Delete",
        onPress: () => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        },
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newMessage: Message = {
        id: Date.now().toString(),
        from: "user",
        image: result.assets[0].uri,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "delivered",
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const handleRecord = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          const newMessage: Message = {
            id: Date.now().toString(),
            from: "user",
            audio: uri,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "delivered",
          };
          setMessages((prev) => [...prev, newMessage]);
        }
        return;
      }
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error("Recording failed", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.brand.primary }]}>
        <TouchableOpacity onPress={() => router.push("/tabs/appointment")}>
          <Text>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/doctor_1.jpg")}
          style={styles.avatar}
        />
        <View style={{ flexDirection: "column" }}>
          <Text style={styles.doctorName}>Dr. Jane Doe</Text>
          {isTyping && (
            <Text
              style={{ fontStyle: "italic", marginBottom: 5, color: "#fff" }}
            >
              Typing...
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/appointment/video-room" })}
        >
          <Text>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContainer}
        >
          {messages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              onLongPress={() => handleLongPress(msg)}
              activeOpacity={0.8}
              style={[
                styles.messageBubble,
                msg.from === "user"
                  ? [
                      styles.userBubble,
                      { backgroundColor: Colors.brand.primary },
                    ]
                  : styles.doctorBubble,
              ]}
            >
              {msg.text && (
                <Text style={[styles.messageText, { color: "#fff" }]}>
                  {msg.text}
                </Text>
              )}
              {msg.image && (
                <Image
                  source={{ uri: msg.image }}
                  style={{ width: 200, height: 200, borderRadius: 10 }}
                />
              )}
              {msg.audio && (
                <Text style={{ color: "#fff", marginTop: 5 }}>
                  [Voice message]
                </Text>
              )}
              <Text style={styles.timestamp}>
                {msg.timestamp}{" "}
                {msg.from === "user" &&
                  (msg.status === "seen" ? (
                    <Ionicons name="checkmark" size={15} color="#fff" />
                  ) : (
                    <Ionicons
                      name="checkmark-done-outline"
                      size={15}
                      color="#fff"
                    />
                  ))}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: Colors.brand.accentDark,
              borderColor: themeColors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={() => console.log("Attachment options")}>
            <Ionicons
              name="attach-outline"
              size={24}
              color={themeColors.border}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              },
            ]}
            value={input}
            placeholder="Type a message"
            onChangeText={(text) => {
              setInput(text);
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 1000);
            }}
          />

          {/* Conditional rendering for camera/mic or send button */}
          {input.length > 0 ? (
            // Show send button if there's text in the input
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={24} color={Colors.brand.primary} />
            </TouchableOpacity>
          ) : (
            // Show camera and mic if no text
            <>
              <TouchableOpacity onPress={pickImage}>
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={themeColors.border}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRecord}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name={recording ? "stop-circle" : "mic-outline"}
                  size={24}
                  color={recording ? "red" : themeColors.border}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
    marginRight: 10,
  },
  doctorName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  chatContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  doctorBubble: {
    backgroundColor: "#444",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
  },
  timestamp: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    fontSize: 11,
    color: "#ddd",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
