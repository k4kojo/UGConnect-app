import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Settings,
  Users,
  Clock,
  User
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentAPI } from '../../services/api.js';
import WebRTCService from '../../services/webrtcService.js';

const VideoSession = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [appointment, setAppointment] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [participants, setParticipants] = useState([]);
  
  // Media state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const sessionStartTime = useRef(Date.now());
  const webrtcService = useRef(null);
  
  // Get initial data from navigation state
  const initialAppointment = location.state?.appointment;
  const roomId = location.state?.roomId || `room_${appointmentId}_${Date.now()}`;

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize WebRTC
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        setIsLoadingMedia(true);
        
        // Initialize WebRTC service
        const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws') || 'ws://localhost:5000';
        webrtcService.current = new WebRTCService(serverUrl);
        
        // Set up event handlers
        webrtcService.current.onLocalStream = (stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        };
        
        webrtcService.current.onRemoteStream = (userId, stream) => {
          setRemoteStreams(prev => new Map(prev.set(userId, stream)));
          
          // Set stream to video element
          const videoElement = remoteVideoRefs.current.get(userId);
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        };
        
        webrtcService.current.onRemoteStreamRemoved = (userId) => {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        };
        
        webrtcService.current.onConnectionStateChange = (state) => {
          setConnectionStatus(state);
        };
        
        webrtcService.current.onParticipantJoined = (participant) => {
          setParticipants(prev => [...prev, participant.userId]);
        };
        
        webrtcService.current.onParticipantLeft = (userId) => {
          setParticipants(prev => prev.filter(id => id !== userId));
        };
        
        webrtcService.current.onError = (error) => {
          console.error('WebRTC Error:', error);
          toast.error(`Connection Error: ${error.message}`);
        };

        // Connect to signaling server
        webrtcService.current.connect();
        
        // Initialize local stream
        await webrtcService.current.initializeLocalStream({
          video: true,
          audio: true
        });
        
        // Join room
        const userId = `doctor_${Date.now()}`;
        await webrtcService.current.joinRoom(roomId, userId);
        
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        toast.error('Failed to initialize video call');
      } finally {
        setIsLoadingMedia(false);
      }
    };

    initializeWebRTC();

    // Cleanup on unmount
    return () => {
      if (webrtcService.current) {
        webrtcService.current.destroy();
      }
    };
  }, [roomId]);

  // Load appointment details
  useEffect(() => {
    const loadAppointment = async () => {
      if (initialAppointment) {
        setAppointment(initialAppointment);
      } else if (appointmentId) {
        try {
          const response = await appointmentAPI.getById(appointmentId);
          setAppointment(response.data);
        } catch (error) {
          console.error('Error loading appointment:', error);
          toast.error('Failed to load appointment details');
        }
      }
    };

    loadAppointment();
  }, [appointmentId, initialAppointment]);

  const toggleCamera = () => {
    const newCameraState = !cameraEnabled;
    setCameraEnabled(newCameraState);
    if (webrtcService.current) {
      webrtcService.current.toggleVideo(newCameraState);
    }
  };

  const toggleMic = () => {
    const newMicState = !micEnabled;
    setMicEnabled(newMicState);
    if (webrtcService.current) {
      webrtcService.current.toggleAudio(newMicState);
    }
  };

  const endSession = async () => {
    try {
      // Update appointment status to completed
      if (appointmentId) {
        await appointmentAPI.update(appointmentId, { status: 'completed' });
      }
      
      // Leave WebRTC room and cleanup
      if (webrtcService.current) {
        await webrtcService.current.leaveRoom();
      }
      
      setIsSessionActive(false);
      toast.success('Session ended successfully');
      
      // Navigate back to dashboard
      navigate('/doctor', { replace: true });
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Error ending session');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <PhoneOff className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
          <p className="text-gray-300">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="font-medium">
              {appointment?.patientName || 'Patient'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Session</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">{formatDuration(sessionDuration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">1 participant</span>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* Local Video (Doctor) */}
        <div className="flex-1 relative bg-black">
          {isLoadingMedia ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Initializing camera...</p>
              </div>
            </div>
          ) : (
            <>
              {cameraEnabled && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <VideoOff className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Doctor label */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
                <span className="text-sm font-medium">You (Doctor)</span>
              </div>
            </>
          )}
        </div>

        {/* Remote Video Streams */}
        <div className="w-1/3 bg-gray-800 relative border-l border-gray-700">
          {remoteStreams.size > 0 ? (
            <div className="grid grid-cols-1 gap-2 p-2 h-full">
              {Array.from(remoteStreams.entries()).map(([userId, stream], index) => (
                <div key={userId} className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current.set(userId, el);
                        el.srcObject = stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Participant {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg mb-2">
                  {connectionStatus === 'connected' ? 'Waiting for patient' : 'Connecting...'}
                </p>
                <p className="text-sm">
                  {connectionStatus === 'connected' 
                    ? 'Patient will appear here when they join'
                    : 'Establishing connection...'
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Connection status */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
            <span className="text-sm font-medium">
              {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex justify-center space-x-4">
          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              cameraEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            } transition-colors`}
            title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          {/* Microphone Toggle */}
          <button
            onClick={toggleMic}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              micEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-600 hover:bg-red-500 text-white'
            } transition-colors`}
            title={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {micEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          {/* Settings */}
          <button
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* End Session */}
          <button
            onClick={endSession}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
            title="End session"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
        
        {/* Status indicators */}
        <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            {cameraEnabled ? (
              <Video className="h-4 w-4 text-green-400" />
            ) : (
              <VideoOff className="h-4 w-4 text-red-400" />
            )}
            <span>Camera {cameraEnabled ? 'On' : 'Off'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {micEnabled ? (
              <Mic className="h-4 w-4 text-green-400" />
            ) : (
              <MicOff className="h-4 w-4 text-red-400" />
            )}
            <span>Microphone {micEnabled ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSession;
