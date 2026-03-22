import React from 'react';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStore } from './useChatStore';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { cn } from '@/lib/utils';
import { useChat } from './useChat';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { isOpen, toggleChat, activeConversationId, setActiveConversation } = useChatStore();
  const { conversations } = useChat(activeConversationId);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Calculate unread? (Optional, if seenBy is implemented)
  const unreadTotal = 0; 

  const handleFullView = () => {
    const basePath = location.pathname.split('/')[1];
    if (['admin', 'instructor', 'student'].includes(basePath)) {
        navigate(`/${basePath}/messages`);
    } else {
        navigate('/instructor/messages');
    }
    toggleChat(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="w-[26rem] h-[34rem] bg-background/60 backdrop-blur-2xl border border-border/80 rounded-[2.5rem] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col mb-4 pointer-events-auto"
          >
            {/* Header / Global Controls */}
            <div className="p-4 flex items-center justify-between border-b border-border/40 bg-background/40 backdrop-blur-3xl z-30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-[1.25rem] shadow-sm">
                  <MessageCircle size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] leading-tight flex items-center gap-2">
                    Vault Chat
                    {unreadTotal > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg animate-pulse">{unreadTotal}</span>}
                  </h3>
                  <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{activeConversationId ? 'Chatting' : 'Select Thread'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                {activeConversationId && (
                    <button 
                        onClick={() => setActiveConversation(null)} 
                        className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-all"
                        title="Back to List"
                    >
                        <Minimize2 size={18} />
                    </button>
                )}
                <button 
                    onClick={handleFullView} 
                    className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-all"
                    title="Full View"
                >
                    <Maximize2 size={18} />
                </button>
                <button 
                    onClick={() => toggleChat(false)} 
                    className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all active:scale-95"
                    title="Close"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex relative">
                <div className={cn(
                    "flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    activeConversationId ? "-translateX-1/2" : "translateX-0"
                )}>
                    <div className="w-1/2 h-full">
                        <ChatList />
                    </div>
                    <div className="w-1/2 h-full">
                        <ChatWindow />
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        onClick={() => toggleChat()}
        className={cn(
            "w-16 h-16 rounded-[2rem] bg-gradient-to-br from-primary to-cosmic-secondary text-white shadow-[0_16px_32px_-8px_rgba(0,0,0,0.3)] flex items-center justify-center relative pointer-events-auto transition-all transition-shadow",
            isOpen ? "shadow-[0_4px_16px_rgba(0,0,0,0.2)] scale-90" : "hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            >
              <Minimize2 size={28} className="stroke-[2.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              className="relative"
            >
              <MessageCircle size={28} className="stroke-[2.5]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
