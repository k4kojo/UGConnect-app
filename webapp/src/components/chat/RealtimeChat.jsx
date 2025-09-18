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
  Video,
  Trash2,
  UserX,
  Flag,
  Download,
  Archive,
  AlertTriangle
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import firebaseAuthService from '../../services/firebaseAuthService';
import {
  deleteChatRoom,
  enrichChatRoomsWithPatientNames,
  getChatRoomMeta,
  getDoctorChatRooms,
  markMessagesDelivered,
  markMessagesRead,
  sendFileMessage,
  sendImageMessage,
  sendTextMessage,
  subscribeToMessages
} from '../../services/firebaseChatService';
import { patientsService } from '../../services/patientsService';
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
  const [firebaseAuthenticated, setFirebaseAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const unsubscribeRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Authenticate with Firebase and load chat rooms
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAuthError(null);

        // First, authenticate with Firebase if user is a doctor
        if (user.role === 'doctor') {
          console.log('Authenticating doctor with Firebase...');
          const authResult = await firebaseAuthService.authenticateWithBackend(user);
          
          if (!authResult.success) {
            setAuthError(authResult.error);
            toast.error(`Firebase authentication failed: ${authResult.error}`);
            setFirebaseAuthenticated(false);
            setChatRooms([]);
            return;
          }
          
          setFirebaseAuthenticated(true);
          console.log('Firebase authentication successful');

          // Now load chat rooms
          console.log('Loading doctor chat rooms...');
          const rooms = await getDoctorChatRooms(user.userId);
          console.log('Chat rooms loaded:', rooms.length);
          
          // Enrich rooms with patient names
          console.log('Fetching patient names...');
          const enrichedRooms = await enrichChatRoomsWithPatientNames(rooms, patientsService);
          console.log('Patient names loaded:', enrichedRooms);
          setChatRooms(enrichedRooms);
          
        } else if (user.role === 'admin') {
          // Admins see limited chat information (no actual messages)
          // For now, show empty state - admins shouldn't access patient-doctor chats
          setChatRooms([]);
          setFirebaseAuthenticated(false);
        } else {
          // Fallback - should not happen in webapp
          setChatRooms([]);
          setFirebaseAuthenticated(false);
        }
        
      } catch (error) {
        console.error('Error initializing chat:', error);
        setAuthError(error.message);
        toast.error(`Failed to load chats: ${error.message}`);
        setChatRooms([]);
        setFirebaseAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
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
        const formattedMessages = firebaseMessages.map(msg => {
          const isFromDoctor = msg.senderId === user.userId;
          const senderName = isFromDoctor 
            ? `Dr. ${user.firstName} ${user.lastName}` 
            : selectedRoom.patientName || `Patient ${selectedRoom.patientId || 'Unknown'}`;
          
          return {
            id: msg.id,
            sender: {
              id: msg.senderId,
              name: senderName,
              role: isFromDoctor ? 'doctor' : 'patient'
            },
            content: msg.content,
            type: msg.type,
            imageUrl: msg.imageUrl,
            audioUrl: msg.audioUrl,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            timestamp: msg.createdAt?.toDate?.() || new Date(),
            status: isFromDoctor
              ? (msg.isRead ? 'read' : msg.delivered ? 'delivered' : 'sent')
              : 'received'
          };
        });
        
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

  // Handle clicks outside the more menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMoreMenu]);

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

  // Menu action handlers
  const handleExportChat = () => {
    if (!selectedRoom || messages.length === 0) {
      toast.error('No messages to export');
      return;
    }

    try {
      // Create chat export data
      const chatData = {
        roomId: selectedRoom.id,
        patientName: selectedRoom.patientName || 'Unknown Patient',
        doctorName: `Dr. ${user.firstName} ${user.lastName}`,
        exportDate: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map(msg => ({
          sender: msg.sender.name,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          type: msg.type
        }))
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${selectedRoom.patientName || selectedRoom.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Chat exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export chat');
    }
    setShowMoreMenu(false);
  };

  const handleArchiveChat = () => {
    if (!selectedRoom) {
      toast.error('No chat selected');
      return;
    }
    
    // TODO: Implement actual archive functionality with backend
    toast.success(`Chat with ${selectedRoom.patientName || 'patient'} archived`);
    setShowMoreMenu(false);
  };

  const handleClearChat = () => {
    if (!selectedRoom) {
      toast.error('No chat selected');
      return;
    }

    const patientName = selectedRoom.patientName || 'this patient';
    if (window.confirm(`Are you sure you want to clear the chat with ${patientName}? This action cannot be undone.`)) {
      // TODO: Implement actual clear chat functionality with backend
      setMessages([]);
      toast.success('Chat cleared successfully');
    }
    setShowMoreMenu(false);
  };

  const handleDeleteChatRoom = async () => {
    if (!selectedRoom) {
      toast.error('No chat selected');
      return;
    }

    const patientName = selectedRoom.patientName || 'this patient';
    const confirmMessage = `⚠️ DANGER: Delete entire chat room with ${patientName}?\n\nThis will permanently delete:\n• All messages in this conversation\n• The chat room itself\n• All chat history\n\nThis action CANNOT be undone!\n\nType "DELETE" to confirm:`;
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput !== 'DELETE') {
      if (userInput !== null) { // User didn't cancel
        toast.error('Chat room deletion cancelled - incorrect confirmation');
      }
      setShowMoreMenu(false);
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Deleting chat room with ${patientName}...`);
      
      // Delete the chat room and all messages
      await deleteChatRoom(selectedRoom.id);
      
      // Update UI
      setChatRooms(prevRooms => prevRooms.filter(room => room.id !== selectedRoom.id));
      setSelectedRoom(null);
      setMessages([]);
      
      // Success feedback
      toast.dismiss(loadingToast);
      toast.success(`Chat room with ${patientName} deleted permanently`);
      
    } catch (error) {
      console.error('Error deleting chat room:', error);
      toast.error(`Failed to delete chat room: ${error.message}`);
    }
    
    setShowMoreMenu(false);
  };

  const handleReportIssue = () => {
    if (!selectedRoom) {
      toast.error('No chat selected');
      return;
    }
    
    // TODO: Implement report issue functionality
    const patientName = selectedRoom.patientName || 'Unknown Patient';
    toast.info(`Report functionality for chat with ${patientName} will be implemented soon`);
    setShowMoreMenu(false);
  };

  const filteredRooms = chatRooms.filter(room => {
    const roomName = room.patientName || room.patientId || room.doctorId || 'Chat Room';
    const lastMessage = room.lastMessage || '';
    return roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getRoomDisplayName = (room) => {
    if (user?.role === 'doctor') {
      // For doctors, show patient name if available, otherwise patient ID
      return room.patientName || `Patient ${room.patientId || 'Unknown'}`;
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
          {loading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="md" text="Loading chats..." />
            </div>
          ) : authError ? (
            <div className="p-4 text-center text-red-500">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm mt-1">{authError}</p>
              <Button 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              {firebaseAuthenticated ? (
                <div>
                  <p>No conversations found</p>
                  <p className="text-sm mt-1">Start chatting with patients to see conversations here</p>
                </div>
              ) : (
                <div>
                  <p>Unable to load conversations</p>
                  <p className="text-sm mt-1">Firebase authentication required</p>
                </div>
              )}
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
                        first_name: room.patientName ? room.patientName.split(' ')[0] : 'Patient',
                        last_name: room.patientName ? room.patientName.split(' ').slice(1).join(' ') : room.patientId || 'Unknown',
                        email: room.patientEmail || 'patient@example.com'
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
                    {room.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </div>
                    )}
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
                    first_name: selectedRoom.patientName ? selectedRoom.patientName.split(' ')[0] : 'Patient',
                    last_name: selectedRoom.patientName ? selectedRoom.patientName.split(' ').slice(1).join(' ') : selectedRoom.patientId || 'Unknown',
                    email: selectedRoom.patientEmail || 'patient@example.com'
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
                <div className="relative" ref={moreMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={MoreVertical}
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                  />
                  {showMoreMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Chat Actions
                      </div>
                      <button
                        onClick={handleExportChat}
                        disabled={!selectedRoom || messages.length === 0}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Export Chat</div>
                        </div>
                      </button>
                      <button
                        onClick={handleArchiveChat}
                        disabled={!selectedRoom}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Archive className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Archive Chat</div>
                        </div>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleClearChat}
                        disabled={!selectedRoom}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Clear Chat</div>
                        </div>
                      </button>
                      <button
                        onClick={handleDeleteChatRoom}
                        disabled={!selectedRoom}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l-4 border-red-500"
                      >
                        <AlertTriangle className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Delete Chat</div>
                        </div>
                      </button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleReportIssue}
                        disabled={!selectedRoom}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Flag className="h-4 w-4 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">Report Issue</div>
                          <div className="text-xs text-gray-500">Report a problem</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation with your patient</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isFromDoctor = message.sender.role === 'doctor';
                  const isFromCurrentUser = message.sender.id === user.userId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                        {/* Sender name for patient messages */}
                        {!isFromCurrentUser && (
                          <div className="mb-1">
                            <span className="text-xs text-gray-600 font-medium">
                              {message.sender.name}
                            </span>
                          </div>
                        )}
                        
                        <div className={`rounded-lg px-4 py-2 ${
                          isFromCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : isFromDoctor
                              ? 'bg-green-100 text-green-900 border border-green-200'
                              : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.type === 'text' && (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          {message.type === 'image' && (
                            <div>
                              <img 
                                src={message.imageUrl} 
                                alt="Shared image" 
                                className="max-w-full rounded cursor-pointer hover:opacity-90"
                                onClick={() => window.open(message.imageUrl, '_blank')}
                              />
                              {message.content && (
                                <p className="text-sm mt-2">{message.content}</p>
                              )}
                            </div>
                          )}
                          {message.type === 'audio' && (
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">🎵</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Voice Message</p>
                                <audio controls className="mt-1">
                                  <source src={message.audioUrl} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </div>
                          )}
                          {message.type === 'file' && (
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{message.fileName || 'File'}</p>
                                {message.fileUrl && (
                                  <a 
                                    href={message.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Download
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center space-x-1 mt-1 ${
                          isFromCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                          {isFromCurrentUser && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
