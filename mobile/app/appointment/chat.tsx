import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";

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
  Linking,
  PanResponder,
  Keyboard,
} from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatBackground from "@/components/backgrounds/ChatBackground";
import {
  ensureChatRoom,
  subscribeToMessages,
  sendTextMessage,
  sendImageMessage,
  sendAudioMessage,
  sendFileMessage,
  markMessagesRead,
  markMessagesDelivered,
  FireMessage,
  updateTextMessage,
  deleteMessage,
  getChatRoomMeta,
} from "@/firebase/chatService";
import { ensureFirebaseAuth } from "@/services/authService";

type Message = {
  id: string;
  from: "user" | "doctor";
  text?: string;
  image?: string;
  audio?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  timestamp: string;
  status: "sent" | "delivered" | "seen";
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ doctorId?: string; doctorName?: string }>();
  const doctorId = String(params.doctorId || "");
  const doctorName = String(params.doctorName || "Doctor");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const unsubRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isRecordingUI, setIsRecordingUI] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [gestureLocked, setGestureLocked] = useState(false);
  const [gestureCancelling, setGestureCancelling] = useState(false);
  const recordTimerRef = useRef<number | null>(null);
  const [playbackPos, setPlaybackPos] = useState(0);
  const [playbackDur, setPlaybackDur] = useState(0);
  const [attachSheetVisible, setAttachSheetVisible] = useState(false);
  const [roomCreatedAt, setRoomCreatedAt] = useState<Date | null>(null);

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatInitiationLabel = (date: Date) => {
    const now = new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((today.getTime() - start.getTime()) / oneDay);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // Init: load my user, ensure room, subscribe to messages
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Load current app user (backend auth)
        const raw = await AsyncStorage.getItem("authUser");
        let me: any = null;
        try {
          me = raw ? JSON.parse(raw) : null;
        } catch (err) {
          console.warn("authUser parse failed", err);
          me = null;
        }
        console.log("Chat init: raw authUser present?", Boolean(raw), "parsed user:", me);
        console.log("Chat init: received doctorId param:", doctorId, typeof doctorId);
        const uid = me?.userId ? String(me.userId) : null;
        if (!uid) {
          Alert.alert("Not signed in", "Please sign in to chat.");
          return;
        }
        if (!doctorId) {
          Alert.alert("Missing doctor", "Doctor not specified.");
          return;
        }
        // Ensure Firebase Auth session is active (custom token)
        await ensureFirebaseAuth();
        if (!mounted) return;
        setMyUserId(uid);
        // Ensure room exists and subscribe
        console.log("Chat init: ensuring room", { uid, doctorId: String(doctorId) });
        const rid = await ensureChatRoom(uid, String(doctorId));
        console.log("Chat init: room ensured", rid);
        if (!mounted) return;
        setRoomId(rid);
        // Get room meta (createdAt)
        try {
          const meta = await getChatRoomMeta(rid);
          if (!mounted) return;
          setRoomCreatedAt(meta.createdAt?.toDate?.() ?? null);
        } catch (e) {
          console.warn("Failed to load room meta", e);
        }
        // Subscribe
        unsubRef.current?.();
        console.log("Chat init: subscribing to messages for room", rid);
        unsubRef.current = subscribeToMessages(rid, (fmsgs: FireMessage[]) => {
          console.log("Chat messages snapshot:", fmsgs?.length ?? 0);
          setMessages((prev) => {
            const mapped: Message[] = fmsgs.map((m) => ({
              id: m.id,
              from: m.senderId === uid ? "user" : "doctor",
              text: m.type === "text" ? m.content : undefined,
              image: m.type === "image" ? (m.imageUrl ?? undefined) : undefined,
              audio: m.type === "audio" ? (m.audioUrl ?? undefined) : undefined,
              fileUrl: m.type === "file" ? (m.fileUrl ?? undefined) : undefined,
              fileName: m.type === "file" ? (m.fileName ?? undefined) : undefined,
              mimeType: m.type === "file" ? (m.mimeType ?? undefined) : undefined,
              timestamp: formatTime(m.createdAt?.toDate?.() ?? new Date()),
              status:
                m.senderId === uid
                  ? m.isRead
                    ? "seen"
                    : m.delivered
                    ? "delivered"
                    : "sent"
                  : "seen",
            }));
            return mapped;
          });
        });
      } catch (e) {
        console.error("Chat init error", e);
        Alert.alert("Chat init failed", "Please try again.");
      }
    })();
    return () => {
      mounted = false;
      unsubRef.current?.();
    };
  }, [doctorId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!roomId || !myUserId) return;
    try {
      if (editingId) {
        await updateTextMessage(roomId, editingId, myUserId, text);
      } else {
        await sendTextMessage(roomId, myUserId, text);
      }
    } catch (e) {
      Alert.alert(editingId ? "Failed to update message" : "Failed to send message");
    } finally {
      setEditingId(null);
      setInput("");
    }
  };

  const handleLongPress = (msg: Message) => {
    if (msg.from !== "user") return;

    const actions: Array<{ text: string; onPress?: () => void; style?: any }> = [];
    if (msg.text) {
      actions.push({
        text: "Edit",
        onPress: () => {
          setInput(msg.text || "");
          setEditingId(msg.id);
        },
      });
    }
    actions.push({
      text: "Delete",
      onPress: () => {
        if (!roomId || !myUserId) return;
        // Firestore delete with permission check
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        deleteMessage(roomId, msg.id, myUserId).catch(() =>
          Alert.alert("Failed to delete message")
        );
      },
      style: "destructive",
    });
    actions.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Message Options", "Choose an action", actions as any);
  };

  // Attachment options
  const openAttachmentOptions = () => {
    if (attachSheetVisible) {
      setAttachSheetVisible(false);
    } else {
      Keyboard.dismiss();
      setAttachSheetVisible(true);
    }
  };

  const closeAttachmentOptions = () => setAttachSheetVisible(false);

  const pickFromLibrary = async () => {
    if (!roomId || !myUserId) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Library access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled) {
      try {
        await sendImageMessage(roomId, myUserId, result.assets[0].uri);
      } catch (e) {
        Alert.alert("Failed to send image");
      }
    }
    closeAttachmentOptions();
  };

  const pickDocument = async () => {
    if (!roomId || !myUserId) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset) return;
      await sendFileMessage(roomId, myUserId, asset.uri, {
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      });
    } catch (e) {
      Alert.alert("Failed to send file");
    }
    closeAttachmentOptions();
  };

  const pickImage = async () => {
    if (!roomId || !myUserId) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        await sendImageMessage(roomId, myUserId, result.assets[0].uri);
      } catch (e) {
        Alert.alert("Failed to send image");
      }
    }
    closeAttachmentOptions();
  };

  // WhatsApp-like audio recording helpers
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecordingUI(true);
      setRecordMs(0);
      setGestureLocked(false);
      setGestureCancelling(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current as any);
      recordTimerRef.current = (setInterval(
        () => setRecordMs((ms) => ms + 1000),
        1000
      ) as any) as number;
    } catch (err) {
      console.error("startRecording failed", err);
      setIsRecordingUI(false);
    }
  };

  const stopAndSendRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current as any);
        recordTimerRef.current = null;
      }
      setIsRecordingUI(false);
      const toSend = uri;
      setGestureLocked(false);
      setGestureCancelling(false);
      if (toSend && roomId && myUserId) {
        try {
          await sendAudioMessage(roomId, myUserId, toSend);
        } catch (e) {
          Alert.alert("Failed to send audio");
        }
      }
    } catch (err) {
      console.error("stopAndSendRecording failed", err);
    } finally {
      setRecordMs(0);
    }
  };

  const cancelRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
    } catch {}
    setRecording(null);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current as any);
      recordTimerRef.current = null;
    }
    setIsRecordingUI(false);
    setGestureLocked(false);
    setGestureCancelling(false);
    setRecordMs(0);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          startRecording();
        },
        onPanResponderMove: (_evt, gesture) => {
          if (gesture.dx < -50) setGestureCancelling(true);
          else setGestureCancelling(false);
          if (gesture.dy < -70) setGestureLocked(true);
        },
        onPanResponderRelease: () => {
          if (gestureLocked) return; // wait for explicit stop
          if (gestureCancelling) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cancelRecording();
          } else {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            stopAndSendRecording();
          }
        },
        onPanResponderTerminate: () => {
          if (!gestureLocked) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cancelRecording();
          }
        },
      }),
    [gestureLocked, gestureCancelling]
  );

  const handlePlayAudio = async (msg: Message) => {
    try {
      // Toggle off if the same message is playing
      if (playingId === msg.id) {
        await soundRef.current?.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
        setPlaybackPos(0);
        setPlaybackDur(0);
        return;
      }
      // Stop any existing sound
      try {
        await soundRef.current?.unloadAsync();
      } catch {}
      soundRef.current = null;
      if (!msg.audio) return;
      const { sound } = await Audio.Sound.createAsync(
        { uri: msg.audio },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setPlayingId(msg.id);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (!status?.isLoaded) return;
        if (typeof status.positionMillis === "number") {
          setPlaybackPos(status.positionMillis);
        }
        if (typeof status.durationMillis === "number") {
          setPlaybackDur(status.durationMillis);
        }
        if (status.didJustFinish) {
          setPlayingId(null);
          soundRef.current?.unloadAsync().catch(() => {});
          soundRef.current = null;
          setPlaybackPos(0);
          setPlaybackDur(0);
        }
      });
    } catch (e) {
      console.warn("Audio playback failed", e);
      setPlayingId(null);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
    // Mark other-party messages as read
    if (roomId && myUserId) {
      // fire and forget
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      markMessagesRead(roomId, myUserId);
      // Mark delivered for messages I received
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      markMessagesDelivered(roomId, myUserId);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      // Cleanup audio resources
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current as any);
        recordTimerRef.current = null;
      }
    };
  }, []);


  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Decorative background */}
      <ChatBackground mode={theme as "light" | "dark"} coverage={1} density="dense" />
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
          <Text style={styles.doctorName}>{doctorName}</Text>
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
          onPress={() => {
            if (!roomId) {
              Alert.alert(t("videoRoom.roomNotReady"));
              return;
            }
            router.push({ pathname: "/appointment/video-room", params: { roomId, doctorName } });
          }}
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
          {roomCreatedAt && (
            <View style={styles.initHeader}>
              <Text style={styles.initHeaderText}>{formatInitiationLabel(roomCreatedAt)}</Text>
            </View>
          )}
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
                <TouchableOpacity
                  onPress={() => handlePlayAudio(msg)}
                  style={{ marginTop: 5, flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name={playingId === msg.id ? "pause-circle" : "play-circle"}
                    size={22}
                    color="#fff"
                  />
                  <Text style={{ color: "#fff" }}>
                    {playingId === msg.id
                      ? `${formatDuration(playbackPos)} / ${formatDuration(playbackDur)}`
                      : "Play audio"}
                  </Text>
                </TouchableOpacity>
              )}
              {msg.fileUrl && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(msg.fileUrl!)}
                  style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons name="document-attach-outline" size={20} color="#fff" />
                  <Text style={{ color: "#fff", textDecorationLine: "underline" }} numberOfLines={1}>
                    {msg.fileName || "Attachment"}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={styles.timestamp}>
                {msg.timestamp}{" "}
                {msg.from === "user" && (
                  msg.status === "seen" ? (
                    <Ionicons name="checkmark-done" size={15} color="#34B7F1" />
                  ) : msg.status === "delivered" ? (
                    <Ionicons name="checkmark-done-outline" size={15} color="#ddd" />
                  ) : (
                    <Ionicons name="checkmark" size={15} color="#ddd" />
                  )
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {attachSheetVisible && (
          <View style={[styles.attachSheetInline, { backgroundColor: Colors.brand.accentDark }]}> 
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {/* Photos */}
              <TouchableOpacity style={styles.attachItem} onPress={pickFromLibrary}>
                <View style={[styles.attachIconCircle, { backgroundColor: themeColors.card }]}>
                  <Ionicons name="image-outline" size={24} color={themeColors.border} />
                </View>
                <Text style={styles.attachLabel}>Photos</Text>
              </TouchableOpacity>
              {/* Camera */}
              <TouchableOpacity style={styles.attachItem} onPress={pickImage}>
                <View style={[styles.attachIconCircle, { backgroundColor: themeColors.card }]}>
                  <Ionicons name="camera-outline" size={24} color={themeColors.border} />
                </View>
                <Text style={styles.attachLabel}>Camera</Text>
              </TouchableOpacity>
              {/* Document */}
              <TouchableOpacity style={styles.attachItem} onPress={pickDocument}>
                <View style={[styles.attachIconCircle, { backgroundColor: themeColors.card }]}>
                  <Ionicons name="document-text-outline" size={24} color={themeColors.border} />
                </View>
                <Text style={styles.attachLabel}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
          <TouchableOpacity onPress={openAttachmentOptions}>
            <Ionicons
              name="attach-outline"
              size={24}
              color={themeColors.border}
            />
          </TouchableOpacity>
          {isRecordingUI ? (
            <>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginHorizontal: 8 }}>
                <Ionicons
                  name={gestureCancelling ? "close-circle" : gestureLocked ? "lock-closed-outline" : "mic-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                  {gestureCancelling
                    ? "Release to cancel"
                    : gestureLocked
                    ? "Recording locked"
                    : "Slide left to cancel • Slide up to lock"}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={{ color: "#fff" }}>{formatDuration(recordMs)}</Text>
              </View>
              {gestureLocked && (
                <TouchableOpacity onPress={stopAndSendRecording}>
                  <Ionicons name="stop-circle" size={24} color="red" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: themeColors.text,
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
                value={input}
                placeholder={editingId ? "Edit message" : "Type a message"}
                placeholderTextColor={themeColors.placeholder}
                onChangeText={(text) => {
                  setInput(text);
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1000);
                }}
              />
              {input.length > 0 ? (
                <TouchableOpacity onPress={handleSend}>
                  <Ionicons name="send" size={24} color={Colors.brand.primary} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={pickImage}>
                    <Ionicons name="camera-outline" size={24} color={themeColors.border} />
                  </TouchableOpacity>
                  <View {...panResponder.panHandlers} style={{ marginLeft: 8 }}>
                    <Ionicons name="mic-outline" size={24} color={themeColors.border} />
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {isRecordingUI && (
        <View style={styles.recordHud} pointerEvents="none">
          <Text style={styles.recordTimer}>{formatDuration(recordMs)}</Text>
          <Text style={styles.recordHint}>
            {gestureCancelling ? "release to cancel" : "slide to cancel <"}
          </Text>
        </View>
      )}
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
  initBanner: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  initBannerText: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 12,
  },
  // New: inline header for chat initiation date (inside list)
  initHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  initHeaderText: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 12,
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
    marginHorizontal: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  attachOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  attachSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  attachItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
  },
  attachIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  attachLabel: {
    color: "#fff",
    fontSize: 12,
  },
  // New: inline attachment sheet that replaces keyboard area
  attachSheetInline: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  // New: recording HUD overlay at bottom (timer + hint)
  recordHud: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
  },
  recordTimer: {
    color: "#fff",
    fontSize: 18,
    fontVariant: ["tabular-nums"],
  },
  recordHint: {
    color: "#ddd",
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
});
