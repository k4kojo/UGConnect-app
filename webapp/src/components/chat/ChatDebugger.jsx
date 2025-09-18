import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDoctorChatRooms, subscribeToMessages, enrichChatRoomsWithPatientNames } from '../../services/firebaseChatService';
import { patientsService } from '../../services/patientsService';
import firebaseAuthService from '../../services/firebaseAuthService';

const ChatDebugger = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({
    firebaseAuth: false,
    chatRooms: [],
    selectedRoom: null,
    messages: [],
    error: null
  });

  useEffect(() => {
    const debugChat = async () => {
      if (!user || user.role !== 'doctor') {
        setDebugInfo(prev => ({ ...prev, error: 'User is not a doctor or not logged in' }));
        return;
      }

      try {
        // Step 1: Test Firebase authentication
        console.log('🔐 Testing Firebase authentication...');
        const authResult = await firebaseAuthService.authenticateWithBackend(user);
        
        if (!authResult.success) {
          setDebugInfo(prev => ({ 
            ...prev, 
            error: `Firebase auth failed: ${authResult.error}`,
            firebaseAuth: false 
          }));
          return;
        }

        console.log('✅ Firebase authentication successful');
        setDebugInfo(prev => ({ ...prev, firebaseAuth: true }));

        // Step 2: Test loading chat rooms
        console.log('📋 Loading chat rooms...');
        const rooms = await getDoctorChatRooms(user.userId);
        console.log('📋 Chat rooms loaded:', rooms);
        
        // Step 2.5: Enrich with patient names
        console.log('👤 Fetching patient names...');
        const enrichedRooms = await enrichChatRoomsWithPatientNames(rooms, patientsService);
        console.log('👤 Patient names loaded:', enrichedRooms);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          chatRooms: enrichedRooms,
          selectedRoom: enrichedRooms[0] || null
        }));

        // Step 3: Test message subscription for first room
        if (enrichedRooms.length > 0) {
          const firstRoom = enrichedRooms[0];
          console.log('📨 Subscribing to messages for room:', firstRoom.id);
          
          const unsubscribe = subscribeToMessages(firstRoom.id, (messages) => {
            console.log('📨 Messages received:', messages);
            setDebugInfo(prev => ({ ...prev, messages }));
          });

          // Cleanup function
          return () => unsubscribe();
        }

      } catch (error) {
        console.error('❌ Debug error:', error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      }
    };

    debugChat();
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800">No User</h3>
        <p className="text-yellow-700">Please log in to debug chat functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔍 Chat Debug Information</h3>
      
      <div className="space-y-4">
        {/* User Info */}
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-gray-900">👤 Current User</h4>
          <p className="text-sm text-gray-600">
            ID: {user.userId} | Role: {user.role} | Name: {user.firstName} {user.lastName}
          </p>
        </div>

        {/* Firebase Auth Status */}
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-gray-900">🔐 Firebase Authentication</h4>
          <p className={`text-sm ${debugInfo.firebaseAuth ? 'text-green-600' : 'text-red-600'}`}>
            Status: {debugInfo.firebaseAuth ? '✅ Connected' : '❌ Not Connected'}
          </p>
        </div>

        {/* Chat Rooms */}
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-gray-900">📋 Chat Rooms ({debugInfo.chatRooms.length})</h4>
          {debugInfo.chatRooms.length > 0 ? (
            <div className="mt-2 space-y-1">
              {debugInfo.chatRooms.map((room, index) => (
                <div key={room.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  <strong>Room {index + 1}:</strong> {room.id}
                  <br />
                  <span className="text-xs">
                    Patient: {room.patientName || room.patientId} 
                    {room.patientEmail && ` (${room.patientEmail})`} | Doctor: {room.doctorId}
                  </span>
                  <br />
                  <span className="text-xs">Last Message: {room.lastMessage || 'None'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No chat rooms found</p>
          )}
        </div>

        {/* Messages */}
        <div className="p-3 bg-white rounded border">
          <h4 className="font-medium text-gray-900">📨 Messages ({debugInfo.messages.length})</h4>
          {debugInfo.selectedRoom && (
            <p className="text-xs text-gray-500 mb-2">From room: {debugInfo.selectedRoom.id}</p>
          )}
          {debugInfo.messages.length > 0 ? (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.messages.map((msg, index) => (
                <div key={msg.id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">
                      {msg.senderId === user.userId ? '👨‍⚕️ You' : '👤 Patient'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {msg.createdAt?.toDate?.()?.toLocaleTimeString() || 'No time'}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">
                    {msg.type === 'text' ? msg.content : `[${msg.type.toUpperCase()}]`}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {msg.delivered ? '✅ Delivered' : '⏳ Pending'} | 
                    Read: {msg.isRead ? '✅ Read' : '❌ Unread'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No messages found</p>
          )}
        </div>

        {/* Error Display */}
        {debugInfo.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-800">❌ Error</h4>
            <p className="text-sm text-red-700">{debugInfo.error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800">💡 Testing Instructions</h4>
          <div className="text-sm text-blue-700 mt-1 space-y-1">
            <p>1. Make sure you're logged in as a doctor</p>
            <p>2. Ensure Firebase is configured correctly</p>
            <p>3. Have a patient send messages from the mobile app</p>
            <p>4. Check if messages appear in the debug info above</p>
            <p>5. Verify real-time updates are working</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDebugger;
