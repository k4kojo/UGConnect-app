import { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoCallData {
  id: string;
  chatRoomId: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  roomSid: string;
  roomId: string;
  roomName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  duration?: number;
}

export interface CreateVideoCallRequest {
  chatRoomId: string;
  appointmentId?: string;
}

export interface JoinVideoCallResponse {
  roomId: string;
  roomInfo: {
    id: string;
    status: string;
    participantCount: number;
    participants: string[];
  };
  userId: string;
}

class VideoCallService {
  private async getAuthToken(): Promise<string> {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new video call for a chat room
   */
  async createVideoCall(data: CreateVideoCallRequest): Promise<VideoCallData> {
    try {
      console.log('Creating video call:', data);
      const result = await this.makeRequest('/api/v0/video-calls', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('Video call created:', result);
      return result;
    } catch (error) {
      console.error('Failed to create video call:', error);
      throw error;
    }
  }

  /**
   * Join an existing video call
   */
  async joinVideoCall(callId: string): Promise<JoinVideoCallResponse> {
    try {
      console.log('Joining video call:', callId);
      const result = await this.makeRequest(`/api/v0/video-calls/${callId}/join`, {
        method: 'POST',
      });
      console.log('Joined video call:', result);
      return result;
    } catch (error) {
      console.error('Failed to join video call:', error);
      throw error;
    }
  }

  /**
   * End a video call
   */
  async endVideoCall(callId: string): Promise<{ message: string }> {
    try {
      console.log('Ending video call:', callId);
      const result = await this.makeRequest(`/api/v0/video-calls/${callId}/end`, {
        method: 'POST',
      });
      console.log('Video call ended:', result);
      return result;
    } catch (error) {
      console.error('Failed to end video call:', error);
      throw error;
    }
  }

  /**
   * Update video call status
   */
  async updateCallStatus(
    callId: string, 
    status: VideoCallData['status'], 
    duration?: number
  ): Promise<{ message: string }> {
    try {
      console.log('Updating call status:', { callId, status, duration });
      const result = await this.makeRequest(`/api/v0/video-calls/${callId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, duration }),
      });
      console.log('Call status updated:', result);
      return result;
    } catch (error) {
      console.error('Failed to update call status:', error);
      throw error;
    }
  }

  /**
   * Create video call from appointment data
   */
  async createVideoCallFromAppointment(
    appointmentId: string,
    doctorId: string,
    patientId: string
  ): Promise<VideoCallData> {
    try {
      // First, ensure chat room exists (this should be handled by the chat service)
      // For now, we'll create a chat room ID based on the participants
      const chatRoomId = `${patientId}_${doctorId}`;
      
      return await this.createVideoCall({
        chatRoomId,
        appointmentId,
      });
    } catch (error) {
      console.error('Failed to create video call from appointment:', error);
      throw error;
    }
  }

  /**
   * Get video call by chat room ID (helper method)
   */
  async getVideoCallByChatRoom(chatRoomId: string): Promise<VideoCallData | null> {
    try {
      // This would need to be implemented in the backend
      // For now, we'll return null and handle creation on demand
      return null;
    } catch (error) {
      console.error('Failed to get video call by chat room:', error);
      return null;
    }
  }
}

export const videoCallService = new VideoCallService();
export default videoCallService;
