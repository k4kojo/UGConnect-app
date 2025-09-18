import { Ionicons } from "@expo/vector-icons";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";

import ChatBackground from "@/components/backgrounds/ChatBackground";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import {
  deleteMessage,
  ensureChatRoom,
  FireMessage,
  getChatRoomMeta,
  markMessagesDelivered,
  markMessagesRead,
  sendAudioMessage,
  sendFileMessage,
  sendImageMessage,
  sendTextMessage,
  subscribeToMessages,
  subscribeToRoom,
  setTyping,
  updateTextMessage,
  getPatientName,
} from "@/firebase/chatService";
import { ensureFirebaseAuth } from "@/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import videoCallService from "@/services/videoCallService";
import Avatar from "@/components/avatar.component";

type Message = {
  id: string;
  from: "user" | "doctor";
  senderId: string; // Add senderId to track who sent the message
  text?: string;
  image?: string;
  audio?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  timestamp: string;
  status: "sent" | "delivered" | "seen";
  reactions?: { [userId: string]: string };
  replyTo?: string;
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ 
    doctorId?: string; 
    doctorName?: string;
    appointmentId?: string;
  }>();
  const doctorId = String(params.doctorId || "");
  const doctorName = String(params.doctorName || "Doctor");
  const appointmentId = params.appointmentId;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const unsubRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const [input, setInput] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Audio hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const audioPlayer = useAudioPlayer();
  const [isRecordingUI, setIsRecordingUI] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [gestureLocked, setGestureLocked] = useState(false);
  const [gestureCancelling, setGestureCancelling] = useState(false);
  const recordTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const roomUnsubRef = useRef<ReturnType<typeof subscribeToRoom> | null>(null);
  const [playbackPos, setPlaybackPos] = useState(0);
  const [playbackDur, setPlaybackDur] = useState(0);
  const [attachSheetVisible, setAttachSheetVisible] = useState(false);
  const [roomCreatedAt, setRoomCreatedAt] = useState<Date | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});

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

  // Get display name for message sender
  const getSenderDisplayName = (msg: Message, senderId: string): string => {
    if (msg.from === "user") {
      return "You";
    } else if (msg.from === "doctor") {
      // If this is a patient message (not from current user or doctor), show patient name
      if (senderId !== myUserId && senderId !== String(doctorId)) {
        return patientNames[senderId] || `Patient ${senderId}`;
      }
      return doctorName;
    }
    return "Unknown";
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
        unsubRef.current = subscribeToMessages(rid, async (fmsgs: FireMessage[]) => {
          console.log("Chat messages snapshot:", fmsgs?.length ?? 0);
          
          // Collect unique patient IDs from messages
          const patientIds = new Set<string>();
          fmsgs.forEach((m) => {
            if (m.senderId !== uid && m.senderId !== String(doctorId)) {
              patientIds.add(m.senderId);
            }
          });

          // Fetch patient names for any new patient IDs
          const newPatientNames: Record<string, string> = {};
          for (const patientId of patientIds) {
            if (!patientNames[patientId]) {
              try {
                const name = await getPatientName(patientId);
                newPatientNames[patientId] = name;
              } catch (error) {
                console.warn(`Failed to fetch name for patient ${patientId}:`, error);
                newPatientNames[patientId] = `Patient ${patientId}`;
              }
            }
          }

          // Update patient names state if we have new names
          if (Object.keys(newPatientNames).length > 0) {
            setPatientNames(prev => ({ ...prev, ...newPatientNames }));
          }

          setMessages((prev) => {
            const mapped: Message[] = fmsgs.map((m) => ({
              id: m.id,
              from: m.senderId === uid ? "user" : "doctor",
              senderId: m.senderId, // Store the actual sender ID
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
        }, { limit: 200 });
        // Subscribe to room (typing indicators, metadata)
        roomUnsubRef.current?.();
        roomUnsubRef.current = subscribeToRoom(rid, (room) => {
          try {
            const map = room?.typingBy || {};
            const now = Date.now();
            const someoneTyping = Object.entries(map).some(([uid, ts]: any) => {
              if (!ts || !ts.toMillis) return false;
              if (String(uid) === String(myUserId || "")) return false;
              return now - ts.toMillis() < 4000; // consider typing active if updated within last 4s
            });
            setPeerTyping(someoneTyping);
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        console.error("Chat init error", e);
        Alert.alert("Chat init failed", "Please try again.");
      }
    })();
    return () => {
      mounted = false;
      unsubRef.current?.();
      roomUnsubRef.current?.();
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
    const actions: Array<{ text: string; onPress?: () => void; style?: any }> = [];
    
    // Reply option for all messages
    actions.push({
      text: "Reply",
      onPress: () => {
        setReplyingTo(msg);
      },
    });

    // React option for all messages
    actions.push({
      text: "React",
      onPress: () => {
        setShowReactions(msg.id);
      },
    });

    // Edit and Delete only for user's own messages
    if (msg.from === "user") {
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
    }
    
    actions.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Message Options", "Choose an action", actions as any);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // TODO: Implement reaction functionality with Firebase
    console.log(`Adding reaction ${emoji} to message ${messageId}`);
    setShowReactions(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
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
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }
      
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
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
      if (!isRecording) return;
      audioRecorder.stop();
      const uri = audioRecorder.uri;
      setIsRecording(false);
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
      if (isRecording) {
        audioRecorder.stop();
      }
    } catch {}
    setIsRecording(false);
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
        try {
          audioPlayer.pause();
        } catch (pauseError) {
          console.warn("Failed to pause audio player:", pauseError);
        }
        setPlayingId(null);
        setPlaybackPos(0);
        setPlaybackDur(0);
        return;
      }
      
      if (!msg.audio) return;
      
      // Load and play the audio
      await audioPlayer.replace({ uri: msg.audio });
      await audioPlayer.play();
      setPlayingId(msg.id);
      
      // Set up playback status updates
      const updatePlaybackStatus = () => {
        if (audioPlayer) {
          setPlaybackPos(audioPlayer.currentTime || 0);
          setPlaybackDur(audioPlayer.duration || 0);
          
          if (audioPlayer.playing) {
            requestAnimationFrame(updatePlaybackStatus);
          } else if (audioPlayer.currentTime >= audioPlayer.duration) {
            // Audio finished
            setPlayingId(null);
            setPlaybackPos(0);
            setPlaybackDur(0);
          }
        }
      };
      updatePlaybackStatus();
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
      try {
        audioPlayer.pause();
      } catch (cleanupError) {
        console.warn("Failed to pause audio player during cleanup:", cleanupError);
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current as any);
        recordTimerRef.current = null;
      }
    };
  }, []);

  // Ensure typing flag is cleared when leaving the room or unmounting
  // Typing animation effect
  useEffect(() => {
    if (peerTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [peerTyping, slideAnim]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current as any);
        typingTimerRef.current = null;
      }
      if (roomId && myUserId) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        setTyping(roomId, myUserId, false);
      }
    };
  }, [roomId, myUserId]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Decorative background */}
      <ChatBackground mode={theme as "light" | "dark"} coverage={1} density="dense" />
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: Colors.brand.primary }]}>
        <TouchableOpacity 
          onPress={() => router.push("/tabs/appointment")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            <Avatar
            imageUrl={undefined} 
            fullName={doctorName} 
            size={40} 
            border
            containerStyle={{ backgroundColor: brandColors.primary + '15', borderColor: brandColors.primary + '30' }}
          />
            <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            {peerTyping ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingDots}>
                  <Animated.View style={[styles.typingDot, { opacity: slideAnim }]} />
                  <Animated.View style={[styles.typingDot, { opacity: slideAnim }]} />
                  <Animated.View style={[styles.typingDot, { opacity: slideAnim }]} />
                </View>
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            ) : (
              <Text style={styles.statusText}>Online • Tap for info</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => {
              // Add phone call functionality
              Alert.alert("Voice Call", "Voice calling feature coming soon!");
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={async () => {
              if (!roomId || !myUserId || !doctorId) {
                Alert.alert("Error", "Chat room not ready. Please try again.");
                return;
              }
              
              try {
                // Create video call for this chat room
                const videoCall = await videoCallService.createVideoCall({
                  chatRoomId: roomId,
                });
                
                console.log("Video call created from chat:", videoCall);
                
                // Navigate to video room with proper parameters
                router.push({
                  pathname: "/appointment/video-room",
                  params: {
                    roomId: videoCall.roomId,
                    callId: videoCall.id,
                    userId: myUserId,
                    doctorName: doctorName
                  }
                });
              } catch (error) {
                console.error("Failed to create video call from chat:", error);
                Alert.alert(
                  "Connection Failed",
                  "Unable to start video call. Please try again."
                );
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
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
          {messages.map((msg, index) => {
            const isUser = msg.from === "user";
            const showAvatar = !isUser && (index === 0 || messages[index - 1]?.from !== msg.from);
            const isLastInGroup = index === messages.length - 1 || messages[index + 1]?.from !== msg.from;
            
            return (
              <View key={msg.id} style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.doctorMessageContainer]}>
                {/* Reply indicator */}
                {msg.replyTo && (
                  <View style={[styles.replyIndicator, isUser ? styles.userReplyIndicator : styles.doctorReplyIndicator]}>
                    <View style={styles.replyLine} />
                    <Text style={styles.replyText}>Replying to message</Text>
                  </View>
                )}
                
                <View style={styles.messageRow}>
                  {/* Doctor avatar */}
                  {showAvatar && !isUser && (
                    <View style={styles.messageAvatar}>
                      <Image
                        source={require("@/assets/images/doctor_1.jpg")}
                        style={styles.messageAvatarImage}
                      />
                    </View>
                  )}
                  {!showAvatar && !isUser && <View style={styles.messageAvatarSpacer} />}
                  
                  <TouchableOpacity
                    onLongPress={() => handleLongPress(msg)}
                    activeOpacity={0.8}
                    style={[
                      styles.messageBubble,
                      isUser ? styles.userBubble : styles.doctorBubble,
                      isUser 
                        ? { backgroundColor: Colors.brand.primary }
                        : { backgroundColor: themeColors.card },
                      !isLastInGroup && styles.groupedBubble,
                      isLastInGroup && (isUser ? styles.lastUserBubble : styles.lastDoctorBubble)
                    ]}
                  >
                    {/* Sender name for non-user messages */}
                    {!isUser && showAvatar && (
                      <Text style={[
                        styles.senderName, 
                        { color: themeColors.subText }
                      ]}>
                        {getSenderDisplayName(msg, msg.senderId)}
                      </Text>
                    )}
                    
                    {msg.text && (
                      <Text style={[
                        styles.messageText, 
                        { color: isUser ? "#fff" : themeColors.text }
                      ]}>
                        {msg.text}
                      </Text>
                    )}
                    
                    {msg.image && (
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: msg.image }}
                          style={styles.messageImage}
                        />
                      </View>
                    )}
                    
                    {msg.audio && (
                      <TouchableOpacity
                        onPress={() => handlePlayAudio(msg)}
                        style={styles.audioContainer}
                      >
                        <View style={styles.audioButton}>
                          <Ionicons
                            name={playingId === msg.id ? "pause" : "play"}
                            size={18}
                            color={isUser ? "#fff" : Colors.brand.primary}
                          />
                        </View>
                        <View style={styles.audioInfo}>
                          <Text style={[styles.audioText, { color: isUser ? "#fff" : themeColors.text }]}>
                            {playingId === msg.id
                              ? `${formatDuration(playbackPos)} / ${formatDuration(playbackDur)}`
                              : "Voice message"}
                          </Text>
                          <View style={[styles.audioWaveform, { backgroundColor: isUser ? "rgba(255,255,255,0.3)" : "rgba(37,99,235,0.3)" }]}>
                            {/* Simplified waveform visualization */}
                            {[...Array(12)].map((_, i) => (
                              <View 
                                key={i} 
                                style={[
                                  styles.waveformBar,
                                  { 
                                    height: Math.random() * 16 + 4,
                                    backgroundColor: isUser ? "rgba(255,255,255,0.6)" : "rgba(37,99,235,0.6)"
                                  }
                                ]} 
                              />
                            ))}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {msg.fileUrl && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(msg.fileUrl!)}
                        style={styles.fileContainer}
                      >
                        <View style={[styles.fileIcon, { backgroundColor: isUser ? "rgba(255,255,255,0.2)" : "rgba(37,99,235,0.2)" }]}>
                          <Ionicons name="document-text" size={20} color={isUser ? "#fff" : Colors.brand.primary} />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={[styles.fileName, { color: isUser ? "#fff" : themeColors.text }]} numberOfLines={1}>
                            {msg.fileName || "Document"}
                          </Text>
                          <Text style={[styles.fileSize, { color: isUser ? "rgba(255,255,255,0.7)" : themeColors.subText }]}>
                            Tap to open
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    
                    {/* Message reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <View style={styles.reactionsContainer}>
                        {Object.entries(msg.reactions).map(([userId, emoji]) => (
                          <View key={userId} style={styles.reactionBubble}>
                            <Text style={styles.reactionEmoji}>{emoji}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    <View style={styles.messageFooter}>
                      <Text style={[styles.timestamp, { color: isUser ? "rgba(255,255,255,0.7)" : themeColors.subText }]}>
                        {msg.timestamp}
                      </Text>
                      {isUser && (
                        <View style={styles.statusIndicator}>
                          {msg.status === "seen" ? (
                            <Ionicons name="checkmark-done" size={14} color="#34B7F1" />
                          ) : msg.status === "delivered" ? (
                            <Ionicons name="checkmark-done-outline" size={14} color="rgba(255,255,255,0.7)" />
                          ) : (
                            <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.7)" />
                          )}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
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

        {/* Reply Bar */}
        {replyingTo && (
          <View style={[styles.replyBar, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.replyBarContent}>
              <Ionicons name="return-down-forward" size={16} color={Colors.brand.primary} />
              <View style={styles.replyBarText}>
                <Text style={[styles.replyBarLabel, { color: Colors.brand.primary }]}>
                  Replying to {replyingTo.from === "user" ? "You" : doctorName}
                </Text>
                <Text style={[styles.replyBarMessage, { color: themeColors.subText }]} numberOfLines={1}>
                  {replyingTo.text || replyingTo.audio ? "Voice message" : replyingTo.image ? "Image" : "File"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={cancelReply} style={styles.replyBarClose}>
              <Ionicons name="close" size={20} color={themeColors.subText} />
            </TouchableOpacity>
          </View>
        )}

        {/* Reaction Picker */}
        {showReactions && (
          <View style={[styles.reactionPicker, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.reactionPickerTitle, { color: themeColors.text }]}>React to message</Text>
            <View style={styles.reactionOptions}>
              {['❤️', '👍', '👎', '😂', '😮', '😢', '😡'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionOption}
                  onPress={() => handleReaction(showReactions, emoji)}
                >
                  <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.reactionPickerClose}
              onPress={() => setShowReactions(null)}
            >
              <Text style={[styles.reactionPickerCloseText, { color: themeColors.subText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Input */}
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
                  if (roomId && myUserId) {
                    // Fire-and-forget typing signal with debounce
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    setTyping(roomId, myUserId, true);
                    if (typingTimerRef.current) {
                      clearTimeout(typingTimerRef.current as any);
                    }
                    typingTimerRef.current = (setTimeout(() => {
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      setTyping(roomId, myUserId, false);
                    }, 2500) as any) as number;
                  }
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  statusText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "400",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDots: {
    flexDirection: "row",
    marginRight: 6,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginHorizontal: 1,
  },
  typingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontStyle: "italic",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  chatContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  // Message Container Styles
  messageContainer: {
    marginBottom: 4,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  doctorMessageContainer: {
    alignItems: "flex-start",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageAvatarSpacer: {
    width: 36,
  },
  // Enhanced Message Bubble Styles
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 2,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  doctorBubble: {
    borderBottomLeftRadius: 6,
  },
  groupedBubble: {
    marginBottom: 2,
  },
  lastUserBubble: {
    borderBottomRightRadius: 6,
  },
  lastDoctorBubble: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.8,
  },
  // Reply Indicator Styles
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  userReplyIndicator: {
    justifyContent: "flex-end",
  },
  doctorReplyIndicator: {
    justifyContent: "flex-start",
    marginLeft: 36,
  },
  replyLine: {
    width: 3,
    height: 16,
    backgroundColor: Colors.brand.primary,
    borderRadius: 2,
    marginRight: 8,
  },
  replyText: {
    fontSize: 12,
    color: Colors.brand.primary,
    fontWeight: "500",
  },
  // Media Content Styles
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  // Audio Message Styles
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  audioInfo: {
    flex: 1,
  },
  audioText: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  audioWaveform: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  waveformBar: {
    width: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 1,
    borderRadius: 1,
  },
  // File Attachment Styles
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
  },
  // Reaction Styles
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 4,
  },
  reactionBubble: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  // Message Footer Styles
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  statusIndicator: {
    marginLeft: 4,
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
  // Reply Bar Styles
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  replyBarContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  replyBarText: {
    flex: 1,
    marginLeft: 8,
  },
  replyBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  replyBarMessage: {
    fontSize: 13,
  },
  replyBarClose: {
    padding: 4,
  },
  // Reaction Picker Styles
  reactionPicker: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  reactionPickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  reactionOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  reactionOption: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(37,99,235,0.1)",
  },
  reactionOptionEmoji: {
    fontSize: 24,
  },
  reactionPickerClose: {
    alignItems: "center",
    paddingVertical: 8,
  },
  reactionPickerCloseText: {
    fontSize: 14,
    fontWeight: "500",
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
