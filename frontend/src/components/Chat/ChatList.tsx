import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Conversation, Participant } from './types';
import { useChat } from './useChat';
import { useChatStore } from './useChatStore';

const ChatList: React.FC = () => {
  const { activeConversationId, setActiveConversation } = useChatStore();
  const { conversations, currentUser, loadingConversations } = useChat(activeConversationId);
  const [search, setSearch] = useState('');

  const getOppositeParticipant = (conv: Conversation): any => {
    if (conv.isGlobal) return { name: conv.name || 'Global Chat', role: 'community' };
    return conv.participants.find(p => p.userId !== currentUser?.id);
  };

  const filtered = conversations.filter((conv) => {
    if (conv.isGlobal) return true; // Always show Global or filter based on search
    const p = getOppositeParticipant(conv);
    return p?.name.toLowerCase().includes(search.toLowerCase());
  });

  if (loadingConversations) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-secondary rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-secondary rounded" />
              <div className="w-24 h-3 bg-secondary rounded opacity-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border/50">
      <div className="p-4 space-y-4 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <button className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            className="w-full bg-secondary/50 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60 text-foreground"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-3 opacity-50 grayscale">
            <MessageSquare size={40} className="stroke-[1.5]" />
            <p className="text-sm text-center">No conversations yet</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const participant = getOppositeParticipant(conv);
            const isActive = activeConversationId === conv.id;
            
            if (!participant) return null;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3 py-3 rounded-[1.25rem] transition-all group relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : conv.isGlobal
                      ? "bg-primary/5 hover:bg-primary/10 border border-primary/10 text-foreground"
                      : "hover:bg-accent/50 text-foreground"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className={cn(
                      "w-12 h-12 rounded-[1rem] flex items-center justify-center font-bold text-lg ring-2 ring-transparent transition-all",
                      isActive 
                        ? "ring-white/30 text-white bg-white/20" 
                        : conv.isGlobal
                          ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md"
                          : "bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:ring-primary/20 group-hover:scale-105"
                  )}>
                    {conv.isGlobal ? <Users size={22} className={isActive ? "text-white" : ""} /> : participant.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={cn(
                      "font-semibold text-[15px] truncate",
                      isActive ? "text-white" : "text-foreground"
                    )}>
                      {participant.name}
                    </span>
                    {conv.isGlobal && !isActive && (
                       <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-black uppercase tracking-widest border border-indigo-500/20">All Roles</span>
                    )}
                    <span className={cn(
                      "text-[10px] whitespace-nowrap opacity-60 ml-2",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-xs truncate max-w-[140px] opacity-80",
                      isActive ? "text-white/90" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
