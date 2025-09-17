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
  
  // Media state
  const [localStream, setLocalStream] = useState(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const localVideoRef = useRef(null);
  const sessionStartTime = useRef(Date.now());
  
  // Get initial data from navigation state
  const initialAppointment = location.state?.appointment;
  const initialStream = location.state?.initialStream;

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setIsLoadingMedia(true);
        
        // Use initial stream if available, otherwise request new one
        let stream = initialStream;
        
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
        }
        
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Set initial states based on stream tracks
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        if (videoTrack) {
          setCameraEnabled(videoTrack.enabled);
        }
        if (audioTrack) {
          setMicEnabled(audioTrack.enabled);
        }
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Failed to access camera/microphone');
      } finally {
        setIsLoadingMedia(false);
      }
    };

    initializeMedia();

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initialStream]);

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
    console.debug('Toggling camera in session');
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
        
        if (videoTrack.enabled) {
          toast.success('Camera is on');
        } else {
          toast.success('Camera is off');
        }
      }
    }
  };

  const toggleMic = () => {
    console.debug('Toggling microphone in session');
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
        
        if (audioTrack.enabled) {
          toast.success('Microphone is on');
        } else {
          toast.success('Microphone is off');
        }
      }
    }
  };

  const endSession = async () => {
    try {
      // Update appointment status to completed
      if (appointmentId) {
        await appointmentAPI.update(appointmentId, { status: 'completed' });
      }
      
      // Stop media streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
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

        {/* Patient Video Placeholder */}
        <div className="w-1/3 bg-gray-800 relative border-l border-gray-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg mb-2">Waiting for patient</p>
              <p className="text-sm">Patient will appear here when they join</p>
            </div>
          </div>
          
          {/* Patient label */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md">
            <span className="text-sm font-medium">
              {appointment?.patientName || 'Patient'}
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
