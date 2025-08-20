import { chatAPI } from './api.js';

// Chat Service for managing chat rooms and messages
export const chatService = {
  // Chat Rooms
  getAllChatRooms: async (params = {}) => {
    try {
      const response = await chatAPI.getRooms(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  getChatRoomById: async (roomId) => {
    try {
      const response = await chatAPI.getRoomById(roomId);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  },

  createChatRoom: async (roomData) => {
    try {
      const response = await chatAPI.createRoom(roomData);
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },

  updateChatRoom: async (roomId, roomData) => {
    try {
      const response = await chatAPI.updateRoom(roomId, roomData);
      return response.data;
    } catch (error) {
      console.error('Error updating chat room:', error);
      throw error;
    }
  },

  deleteChatRoom: async (roomId) => {
    try {
      await chatAPI.deleteRoom(roomId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting chat room:', error);
      throw error;
    }
  },

  // Chat Messages
  getAllMessages: async (params = {}) => {
    try {
      const response = await chatAPI.getAllMessages(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  getMessageById: async (messageId) => {
    try {
      const response = await chatAPI.getMessageById(messageId);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  getMessagesByRoom: async (roomId) => {
    try {
      const response = await chatAPI.getMessagesByRoom(roomId);
      return response.data;
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    try {
      const response = await chatAPI.sendMessage(messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  updateMessage: async (messageId, messageData) => {
    try {
      const response = await chatAPI.updateMessage(messageId, messageData);
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Helper methods for common chat operations
  createConversation: async (participantIds, roomName = null) => {
    try {
      const roomData = {
        participantIds,
        roomName: roomName || `Chat Room ${Date.now()}`,
        roomType: 'direct', // or 'group'
        isActive: true
      };
      
      const response = await chatAPI.createRoom(roomData);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  sendTextMessage: async (roomId, senderId, text) => {
    try {
      const messageData = {
        chatRoomId: roomId,
        senderId,
        messageType: 'text',
        content: text,
        isRead: false,
        isDelivered: false
      };
      
      const response = await chatAPI.sendMessage(messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      const messageData = {
        isRead: true,
        readAt: new Date().toISOString()
      };
      
      const response = await chatAPI.updateMessage(messageId, messageData);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  markMessageAsDelivered: async (messageId) => {
    try {
      const messageData = {
        isDelivered: true,
        deliveredAt: new Date().toISOString()
      };
      
      const response = await chatAPI.updateMessage(messageId, messageData);
      return response.data;
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  },

  // Get conversations for a specific user
  getUserConversations: async (userId) => {
    try {
      const params = {
        participantId: userId,
        includeMessages: false
      };
      
      const response = await chatAPI.getRooms(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  },

  // Get conversation with messages
  getConversationWithMessages: async (roomId) => {
    try {
      const [room, messages] = await Promise.all([
        chatAPI.getRoomById(roomId),
        chatAPI.getMessagesByRoom(roomId)
      ]);
      
      return {
        room: room.data,
        messages: messages.data
      };
    } catch (error) {
      console.error('Error fetching conversation with messages:', error);
      throw error;
    }
  }
};

export default chatService;
