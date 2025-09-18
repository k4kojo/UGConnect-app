import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import TopHeader from '@/components/top-header.component';
import EmptyState from '@/components/EmptyState';
import SkeletonLoader from '@/components/SkeletonLoader';
import {
  getChatRoomsForDoctor,
  getChatRoomsForPatient,
  EnrichedChatRoom,
} from '@/firebase/chatService';
import { userService } from '@/services/userService';
import Avatar from '@/components/avatar.component';

const ChatRoomsScreen = () => {
  const { theme } = useThemeContext();
  const { t } = useLanguage();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  const [chatRooms, setChatRooms] = useState<EnrichedChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load current user and chat rooms
  const loadChatRooms = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get current user
      const user = await userService.getStoredUser();
      if (!user) {
        Alert.alert('Authentication Error', 'Please sign in to view chats.');
        return;
      }

      setCurrentUser(user);

      // Load chat rooms based on user role
      if (user.role === 'doctor') {
        console.log('Loading chat rooms for doctor:', user.userId);
        const rooms = await getChatRoomsForDoctor(user.userId);
        console.log('Doctor chat rooms loaded:', rooms.length);
        setChatRooms(rooms);
      } else if (user.role === 'patient') {
        console.log('Loading chat rooms for patient:', user.userId);
        const rooms = await getChatRoomsForPatient(user.userId);
        console.log('Patient chat rooms loaded:', rooms.length);
        setChatRooms(rooms);
      } else {
        // For other roles (admin, etc.)
        console.log('User role not supported for chat rooms:', user.role);
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      Alert.alert('Error', 'Failed to load chat rooms. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  const handleRefresh = () => {
    loadChatRooms(true);
  };

  const handleChatRoomPress = (room: EnrichedChatRoom) => {
    // Navigate to individual chat screen
    // For doctors viewing patient chats, pass doctor info
    // For patients, they would chat with doctors
    if (currentUser?.role === 'doctor') {
      router.push({
        pathname: '/appointment/chat' as any,
        params: {
          doctorId: room.doctorId,
          doctorName: `Dr. ${currentUser.firstName} ${currentUser.lastName}`,
        },
      });
    } else if (currentUser?.role === 'patient') {
      // For patients chatting with doctors
      router.push({
        pathname: '/appointment/chat' as any,
        params: {
          doctorId: room.doctorId,
          doctorName: room.doctorName || 'Doctor',
        },
      });
    }
  };

  const formatLastMessageTime = (updatedAt: any) => {
    if (!updatedAt) return '';
    
    const date = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderChatRoom = ({ item }: { item: EnrichedChatRoom }) => (
    <TouchableOpacity
      style={[styles.chatRoomCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      onPress={() => handleChatRoomPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.chatRoomContent}>
        {/* Avatar */}
        <Avatar 
            imageUrl={undefined} 
            fullName={currentUser?.role === 'doctor' 
              ? (item.patientName || `Patient ${item.patientId}`)
              : (item.doctorName || `Doctor ${item.doctorId}`)
            } 
            size={40} 
            border
            containerStyle={{ backgroundColor: brandColors.primary + '15', borderColor: brandColors.primary + '30' }}
        />

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.patientName, { color: themeColors.text }]} numberOfLines={1}>
              {currentUser?.role === 'doctor' 
                ? (item.patientName || `Patient ${item.patientId}`)
                : (item.doctorName || `Doctor ${item.doctorId}`)
              }
            </Text>
            <Text style={[styles.timestamp, { color: themeColors.subText }]}>
              {formatLastMessageTime(item.updatedAt)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text style={[styles.lastMessage, { color: themeColors.subText }]} numberOfLines={1}>
              {item.lastMessage || 'No messages yet'}
            </Text>
            {((currentUser?.role === 'doctor' && item.patientEmail) || 
              (currentUser?.role === 'patient' && item.doctorEmail)) && (
              <View style={styles.statusIndicator}>
                <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    let title = "No Chat Rooms";
    let description = "No active conversations found.";
    
    if (currentUser?.role === 'doctor') {
      title = "No Patient Conversations";
      description = "You don't have any patient conversations yet. Chat rooms will appear here when patients message you through the appointment system.";
    } else if (currentUser?.role === 'patient') {
      title = "No Doctor Conversations";
      description = "You don't have any active conversations with doctors. Start a chat from your appointments screen or contact your healthcare provider.";
    }

    return (
      <EmptyState
        icon="chatbubbles-outline"
        title={title}
        subtitle={description}
      />
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={[styles.skeletonCard, { backgroundColor: themeColors.card }]}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={styles.skeletonContent}>
            <SkeletonLoader width="60%" height={16} borderRadius={8} />
            <SkeletonLoader width="80%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader screen="chat" />
      
      <View style={styles.content}>
        {loading ? (
          renderSkeletonLoader()
        ) : chatRooms.length > 0 ? (
          <FlatList
            data={chatRooms}
            renderItem={renderChatRoom}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.brand.primary]}
                tintColor={Colors.brand.primary}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  chatRoomCard: {
    borderWidth: 1,
    // marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatRoomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Skeleton styles
  skeletonContainer: {
    paddingTop: 20,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
});

export default ChatRoomsScreen;
