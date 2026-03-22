import React from 'react';
import ChatList from '@/components/Chat/ChatList';
import ChatWindow from '@/components/Chat/ChatWindow';

const ChatDashboardPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-160px)] min-h-[500px] flex overflow-hidden rounded-3xl border border-border shadow-xl bg-background/40 backdrop-blur-md">
      <div className="w-[320px] lg:w-[380px] h-full shrink-0 border-r border-border">
        <ChatList />
      </div>
      <div className="flex-1 h-full min-w-0">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatDashboardPage;
