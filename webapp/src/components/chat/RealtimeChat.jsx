import {
  Check,
  CheckCheck,
  Clock,
  File,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  getChatRoomMeta,
  getDoctorChatRooms,
  markMessagesDelivered,
  markMessagesRead,
  sendFileMessage,
  sendImageMessage,
  sendTextMessage,
  subscribeToMessages
} from '../../services/firebaseChatService';
import { Button, LoadingSpinner, ProfileAvatar } from '../ui';

const RealtimeChat = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [roomCreatedAt, setRoomCreatedAt] = useState(null);
  const unsubscribeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load chat rooms based on user role
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setLoading(true);
        let rooms = [];
        
        if (user?.role === 'doctor') {
          // Doctors see their conversations with patients
          rooms = await getDoctorChatRooms(user.userId);
        } else if (user?.role === 'admin') {
          // Admins see limited chat information (no actual messages)
          // For now, show empty state - admins shouldn't access patient-doctor chats
          rooms = [];
        } else {
          // Fallback - should not happen in webapp
          rooms = [];
        }
        
        setChatRooms(rooms);
      } catch (error) {
        console.error('Error loading chat rooms:', error);
        toast.error('Failed to load chat rooms');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadChatRooms();
    }
  }, [user]);

  // Subscribe to messages when a room is selected
  useEffect(() => {
    if (selectedRoom) {
      // Unsubscribe from previous room
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Subscribe to new room
      unsubscribeRef.current = subscribeToMessages(selectedRoom.id, (firebaseMessages) => {
        const formattedMessages = firebaseMessages.map(msg => ({
          id: msg.id,
          sender: {
            id: msg.senderId,
            name: msg.senderId === user.userId ? `${user.firstName} ${user.lastName}` : 'Other User',
            role: msg.senderId === user.userId ? user.role : 'other'
          },
          content: msg.content,
          type: msg.type,
          imageUrl: msg.imageUrl,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          timestamp: msg.createdAt?.toDate?.() || new Date(),
          status: msg.senderId === user.userId
            ? (msg.isRead ? 'read' : msg.delivered ? 'delivered' : 'sent')
            : 'received'
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        markMessagesRead(selectedRoom.id, user.userId);
        markMessagesDelivered(selectedRoom.id, user.userId);
      });

      // Get room metadata
      getChatRoomMeta(selectedRoom.id).then(meta => {
        setRoomCreatedAt(meta.createdAt?.toDate?.());
      });

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [selectedRoom, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await sendTextMessage(selectedRoom.id, user.userId, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedRoom) return;

    setSending(true);
    try {
      if (file.type.startsWith('image/')) {
        await sendImageMessage(selectedRoom.id, user.userId, file);
      } else {
        await sendFileMessage(selectedRoom.id, user.userId, file);
      }
      toast.success('File sent successfully');
    } catch (error) {
      console.error('Error sending file:', error);
      toast.error('Failed to send file');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    const roomName = room.patientId || room.doctorId || 'Chat Room';
    const lastMessage = room.lastMessage || '';
    return roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRoomDisplayName = (room) => {
    if (user?.role === 'doctor') {
      // For doctors, show patient name/ID
      return room.patientId || 'Patient';
    } else if (user?.role === 'admin') {
      // For admins, show limited info
      return 'Patient-Doctor Chat';
    } else {
      // Fallback
      return 'Chat Room';
    }
  };

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading chat..." />;
  }

  // Show appropriate message for admins
  if (user?.role === 'admin') {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center p-8">
          <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Access Restricted</h3>
          <p className="text-gray-600 mb-4">
            Patient-doctor conversations are confidential and not accessible to administrators.
          </p>
          <p className="text-sm text-gray-500">
            Only doctors can access their patient conversations for medical purposes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'doctor' ? 'Patient Messages' : 'Messages'}
          </h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                                         <ProfileAvatar 
                       user={{ 
                         first_name: getRoomDisplayName(room).split(' ')[0] || 'User',
                         last_name: getRoomDisplayName(room).split(' ').slice(1).join(' ') || 'Unknown',
                         email: 'user@example.com'
                       }} 
                       size="md" 
                     />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                                           <h3 className="text-sm font-medium text-gray-900 truncate">
                       {getRoomDisplayName(room)}
                     </h3>
                      <span className="text-xs text-gray-500">
                        {room.updatedAt ? formatTime(room.updatedAt.toDate()) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {room.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ProfileAvatar 
                  user={{ 
                    first_name: getRoomDisplayName(selectedRoom).split(' ')[0] || 'User',
                    last_name: getRoomDisplayName(selectedRoom).split(' ').slice(1).join(' ') || 'Unknown',
                    email: 'user@example.com'
                  }} 
                  size="md" 
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getRoomDisplayName(selectedRoom)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {roomCreatedAt ? `Created ${formatDate(roomCreatedAt)}` : 'Chat room'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Phone}
                >
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Video}
                >
                  Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={MoreVertical}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.role === user.role ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender.role === user.role ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.sender.role === user.role 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.type === 'image' && (
                        <div>
                          <img 
                            src={message.imageUrl} 
                            alt="Shared image" 
                            className="max-w-full rounded"
                          />
                        </div>
                      )}
                      {message.type === 'file' && (
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{message.fileName || 'File'}</span>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center space-x-1 mt-1 ${
                      message.sender.role === user.role ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender.role === user.role && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={Paperclip}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:opacity-50"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeChat;
