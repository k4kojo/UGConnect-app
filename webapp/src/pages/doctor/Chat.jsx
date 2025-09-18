import React from 'react';
import ChatTest from '../../components/chat/ChatTest';
import RealtimeChat from '../../components/chat/RealtimeChat';
import ChatDebugger from '../../components/chat/ChatDebugger';

const DoctorChat = () => {
  return (
    <div className="space-y-4">
      {/* Debug component - remove in production */}
      <ChatDebugger />
      
      <ChatTest />
      <RealtimeChat />
    </div>
  );
};

export default DoctorChat;
