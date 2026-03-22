import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/auth/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { Message } from './types';

interface ChatContextType {
  socket: Socket | null;
  typingUsers: Record<string, any>;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  const currentUser = user ? {
    id: user.id || user._id || '',
    name: user.name,
    role: user.role,
  } : null;

  useEffect(() => {
    if (!currentUser?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Initialize socket once
    const newSocket = io('http://localhost:5000', {
      auth: { token: JSON.parse(localStorage.getItem('vault-auth') || '{}').state?.token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
        console.log('Chat socket connected:', newSocket.id);
    });

    newSocket.on('conversation-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
    });

    newSocket.on('user-typing', (data: any) => {
      const key = `${data.userId}-${data.conversationId}`;
      if (data.userId !== currentUser.id) {
        if (data.isTyping === false) {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        } else {
          setTypingUsers(prev => ({ ...prev, [key]: data }));
          // Backup auto-clear
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }, 5000);
        }
      }
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [currentUser?.id, queryClient]);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing', { conversationId, isTyping });
    }
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ socket, typingUsers, sendTyping, joinConversation, leaveConversation }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatSocket = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatSocket must be used within a ChatProvider');
  }
  return context;
};
