import AsyncStorage from "@react-native-async-storage/async-storage";
import api from './api';

export type ChatRoom = {
  chatRoomId: string;
  patientId: string;
  doctorId: string;
  hasActiveCall?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: number;
  chatRoomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  messageType?: string;
  fileUrl?: string | null;
};

export const chatService = {
  // List all chat rooms for current user
  listChatRooms: async (): Promise<ChatRoom[]> => {
    const res = await api.get("/api/v0/chat-rooms");
    return res.data as ChatRoom[];
  },

  // Get messages for a specific chat room
  listRoomMessages: async (chatRoomId: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/api/v0/chat-messages/room/${chatRoomId}`);
    return res.data as ChatMessage[];
  },

  // Send a message to a chat room
  sendRoomMessage: async (payload: {
    chatRoomId: string;
    content: string;
  }): Promise<ChatMessage> => {
    const raw = await AsyncStorage.getItem("authUser");
    const me = raw ? JSON.parse(raw) : null;
    const senderId = me?.userId;
    const body = { ...payload, senderId };
    const res = await api.post("/api/v0/chat-messages", body);
    return res.data as ChatMessage;
  },

  // Create a new chat room
  createChatRoom: async (payload: {
    patientId: string;
    doctorId: string;
  }): Promise<ChatRoom> => {
    const res = await api.post("/api/v0/chat-rooms", payload);
    return res.data;
  },

  // Get chat room by ID
  getChatRoomById: async (chatRoomId: string): Promise<ChatRoom> => {
    const res = await api.get(`/api/v0/chat-rooms/${chatRoomId}`);
    return res.data;
  },

  // Mark message as read
  markMessageAsRead: async (messageId: number): Promise<void> => {
    await api.put(`/api/v0/chat-messages/${messageId}/read`);
  },

  // Mark all messages in room as read
  markRoomMessagesAsRead: async (chatRoomId: string): Promise<void> => {
    await api.put(`/api/v0/chat-messages/room/${chatRoomId}/read`);
  },

  // Delete a message
  deleteMessage: async (messageId: number): Promise<void> => {
    await api.delete(`/api/v0/chat-messages/${messageId}`);
  },
};
