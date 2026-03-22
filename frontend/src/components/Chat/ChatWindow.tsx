import React, { useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Send } from 'lucide-react';
import { useChatStore } from './useChatStore';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from './useChat';

const ChatWindow: React.FC = () => {
  const { activeConversationId } = useChatStore();
  const { 
    conversations, 
    messages, 
    currentUser, 
    loadingMessages, 
    sendMessage, 
    isSending,
    typingUsers,
    sendTyping
  } = useChat(activeConversationId);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const participant = activeConversation?.participants.find(p => p.userId !== currentUser?.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-background/40 backdrop-blur-3xl">
        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-xl shadow-primary/10">
          <Send size={48} className="text-primary rotate-[-45deg] scale-110" />
        </div>
        <div className="space-y-2 text-foreground">
          <h3 className="text-2xl font-bold tracking-tight">Your Inbox</h3>
          <p className="max-w-[340px] text-sm text-muted-foreground leading-relaxed font-medium">
            Select a conversation from the sidebar to start messaging. Your messages are secure and encrypted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background/50 backdrop-blur-2xl relative overflow-hidden transition-all duration-500 ease-in-out">
      {/* Header */}
      <header className="p-4 border-b border-border/50 flex items-center justify-between bg-background/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-11 h-11 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border-2 border-primary/20 transition-all">
                {participant?.name?.charAt(0) || '?'}
             </div>
          </div>
          <div>
            <h3 className="font-bold text-[15px] leading-tight flex items-center gap-2 text-foreground">
                {participant?.name}
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground font-bold uppercase tracking-wider">{participant?.role}</span>
            </h3>
            <p className="text-[11px] font-medium text-green-500">
               Active in this conversation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-muted-foreground hover:bg-secondary/50 rounded-xl transition-all hover:scale-105 active:scale-95"><Phone size={18} /></button>
          <button className="p-2.5 text-muted-foreground hover:bg-secondary/50 rounded-xl transition-all hover:scale-105 active:scale-95"><Video size={18} /></button>
          <button className="p-2.5 text-muted-foreground hover:bg-secondary/50 rounded-xl transition-all hover:scale-105 active:scale-95"><MoreVertical size={18} /></button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full opacity-50">Loading history...</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary/70 animate-pulse ml-2 mb-4">
              <span className="flex gap-1">
                 <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {typingUsers[0].userName} is typing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={(text: string) => sendMessage(text)} 
        disabled={isSending}
        onType={(isTyping) => sendTyping(isTyping)}
      />
    </div>
  );
};

export default ChatWindow;
