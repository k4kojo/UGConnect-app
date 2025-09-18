import React, { useState, useEffect, useRef } from 'react';

const VideoCallTest = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [participants, setParticipants] = useState([]);
  
  // Room state
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('doctor_web_test');
  const [isInCall, setIsInCall] = useState(false);
  
  // Media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  
  // Refs
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  
  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = () => {
      try {
        // Connect to the backend Socket.IO server
        const wsUrl = 'http://localhost:5000'; // Adjust based on your backend URL
        
        // For Socket.IO, we need to use the Socket.IO client library
        // Since we don't have it imported, we'll use a simple WebSocket for now
        // In production, you should use socket.io-client
        socketRef.current = new WebSocket('ws://localhost:5000/socket.io/?EIO=4&transport=websocket');
        
        socketRef.current.onopen = () => {
          console.log('Connected to signaling server');
          setIsConnected(true);
          setConnectionStatus('connected');
        };
        
        socketRef.current.onclose = () => {
          console.log('Disconnected from signaling server');
          setIsConnected(false);
          setConnectionStatus('disconnected');
        };
        
        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
        };
        
        socketRef.current.onmessage = handleSignalingMessage;
        
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setConnectionStatus('error');
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Handle signaling messages
  const handleSignalingMessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received signaling message:', data);
      
      switch (data.type) {
        case 'user-joined':
          handleUserJoined(data);
          break;
        case 'user-left':
          handleUserLeft(data);
          break;
        case 'offer':
          handleOffer(data);
          break;
        case 'answer':
          handleAnswer(data);
          break;
        case 'ice-candidate':
          handleIceCandidate(data);
          break;
        case 'existing-participants':
          handleExistingParticipants(data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  };

  // Initialize local media stream
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      throw error;
    }
  };

  // Create peer connection
  const createPeerConnection = (participantId) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from:', participantId);
      setRemoteStreams(prev => new Map(prev.set(participantId, event.streams[0])));
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          target: participantId,
          candidate: event.candidate
        }));
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId}:`, peerConnection.connectionState);
      setConnectionStatus(peerConnection.connectionState);
    };
    
    peerConnectionsRef.current.set(participantId, peerConnection);
    return peerConnection;
  };

  // Handle user joined
  const handleUserJoined = async ({ userId: newUserId, socketId }) => {
    console.log('User joined:', newUserId);
    setParticipants(prev => [...prev, newUserId]);
    
    // Create offer for new participant
    const peerConnection = createPeerConnection(socketId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'offer',
        target: socketId,
        offer: offer
      }));
    }
  };

  // Handle user left
  const handleUserLeft = ({ userId: leftUserId, socketId }) => {
    console.log('User left:', leftUserId);
    setParticipants(prev => prev.filter(id => id !== leftUserId));
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(socketId);
      return newMap;
    });
    
    // Close peer connection
    const peerConnection = peerConnectionsRef.current.get(socketId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(socketId);
    }
  };

  // Handle offer
  const handleOffer = async ({ offer, sender }) => {
    console.log('Received offer from:', sender);
    const peerConnection = createPeerConnection(sender);
    
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'answer',
        target: sender,
        answer: answer
      }));
    }
  };

  // Handle answer
  const handleAnswer = async ({ answer, sender }) => {
    console.log('Received answer from:', sender);
    const peerConnection = peerConnectionsRef.current.get(sender);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async ({ candidate, sender }) => {
    console.log('Received ICE candidate from:', sender);
    const peerConnection = peerConnectionsRef.current.get(sender);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  // Handle existing participants
  const handleExistingParticipants = ({ participants: existingParticipants }) => {
    console.log('Existing participants:', existingParticipants);
    setParticipants(existingParticipants);
  };

  // Join room
  const joinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    
    try {
      // Initialize local stream first
      await initializeLocalStream();
      
      // Join room via signaling server
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'join-room',
          roomId: roomId.trim(),
          userId: userId
        }));
        
        setIsInCall(true);
        console.log('Joined room:', roomId);
      } else {
        throw new Error('Not connected to signaling server');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room: ' + error.message);
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'leave-room',
        roomId: roomId,
        userId: userId
      }));
    }
    
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Reset state
    setIsInCall(false);
    setParticipants([]);
    setRemoteStreams(new Map());
    
    console.log('Left room');
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            📹 WebRTC Video Call Test (Web App)
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(connectionStatus)}`}>
              {connectionStatus.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              Signaling Server: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Room Controls */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room ID (e.g., room_123_456)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isInCall}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isInCall}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!isInCall ? (
              <button 
                onClick={joinRoom} 
                disabled={!isConnected}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Join Room
              </button>
            ) : (
              <button 
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Leave Room
              </button>
            )}
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span className="text-sm">
              Participants ({participants.length + (isInCall ? 1 : 0)}):
            </span>
            <div className="flex gap-1">
              {isInCall && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">You</span>}
              {participants.map(participant => (
                <span key={participant} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                  {participant}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {isInCall && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Local Video */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Your Video (Doctor)</h3>
            </div>
            <div className="p-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">📹</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-blue-500 text-white rounded text-sm">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remote Videos */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Remote Video (Patient)</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {Array.from(remoteStreams.entries()).map(([participantId, stream]) => (
                  <div key={participantId} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      ref={(video) => {
                        if (video && stream) {
                          video.srcObject = stream;
                        }
                      }}
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-sm">
                        Patient ({participantId.slice(0, 8)})
                      </span>
                    </div>
                  </div>
                ))}
                {remoteStreams.size === 0 && (
                  <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <span className="text-4xl mb-2 block">👥</span>
                      <p>Waiting for patient to join...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {isInCall && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isAudioEnabled 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isAudioEnabled ? '🎤 Mic On' : '🎤 Mic Off'}
              </button>
              <button
                onClick={toggleVideo}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isVideoEnabled 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isVideoEnabled ? '📹 Video On' : '📹 Video Off'}
              </button>
              <button 
                onClick={leaveRoom} 
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                📞 End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. Make sure your backend server is running on localhost:5000</p>
              <p>2. Enter a room ID (should match the one created by mobile app)</p>
              <p>3. Click "Join Room" to start the video call</p>
              <p>4. Use the mobile app to join the same room for cross-platform testing</p>
              <p>5. Test audio/video controls and verify real-time communication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallTest;
