import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { createPatientDoctorChat, sendTextMessage } from '../../services/firebaseChatService';
import { Button } from '../ui';

const ChatTest = () => {
  const { user } = useAuth();
  const [testRoomId, setTestRoomId] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from webapp!');

  const createTestRoom = async () => {
    try {
      // Create a test chat room between a test patient and current doctor
      const testPatientId = 'test_patient_123';
      const roomId = await createPatientDoctorChat(testPatientId, user.userId);
      setTestRoomId(roomId);
      toast.success(`Test room created: ${roomId}`);
    } catch (error) {
      console.error('Error creating test room:', error);
      toast.error('Failed to create test room');
    }
  };

  const sendTestMessage = async () => {
    if (!testRoomId) {
      toast.error('Please create a test room first');
      return;
    }

    try {
      await sendTextMessage(testRoomId, user.userId, testMessage);
      toast.success('Test message sent!');
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Failed to send test message');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Firebase Chat Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Doctor: {user?.firstName} {user?.lastName} ({user?.role})</p>
          <p className="text-sm text-gray-600">Doctor ID: {user?.userId}</p>
        </div>

        <div className="space-y-2">
          <Button onClick={createTestRoom} variant="primary">
            Create Test Chat Room
          </Button>
          
          {testRoomId && (
            <div className="p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">Room ID: {testRoomId}</p>
            </div>
          )}
        </div>

        {testRoomId && (
          <div className="space-y-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={sendTestMessage} variant="secondary">
              Send Test Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTest;
