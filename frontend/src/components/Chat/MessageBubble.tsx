import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { useAuthStore } from '@/auth/store/authStore';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuthStore();
  const currentUserId = user?.id || user?._id;
  const isOwn = String(message.senderId) === String(currentUserId);

  return (
    <div className={cn(
      "flex flex-col mb-4 space-y-1",
      isOwn ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all duration-300",
        isOwn 
          ? "bg-primary text-primary-foreground rounded-br-none shadow-md shadow-primary/20" 
          : "bg-secondary text-secondary-foreground rounded-bl-none border border-border/50"
      )}>
        {message.text}
      </div>
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-muted-foreground font-medium">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {!isOwn && (
           <span className="text-[10px] text-primary/60 font-black uppercase tracking-tighter">
              • {message.senderRole}
           </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
