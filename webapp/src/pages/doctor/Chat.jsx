import React from 'react';
import ChatTest from '../../components/chat/ChatTest';
import RealtimeChat from '../../components/chat/RealtimeChat';

const DoctorChat = () => {
  return (
    <div className="space-y-4">
      <ChatTest />
      <RealtimeChat />
    </div>
  );
};

export default DoctorChat;
