import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from './chatService';
import { useAuthStore } from '@/auth/store/authStore';
import { useEffect, useCallback, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, Conversation } from './types';

export const useChat = (activeConversationId: string | null = null) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});

  const currentUser = user ? {
    id: user.id || user._id || '',
    name: user.name,
    role: user.role,
    roleModel: user.role.charAt(0).toUpperCase() + user.role.slice(1)
  } : null;

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: () => chatService.getConversations(currentUser!.id),
    enabled: !!currentUser?.id,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => chatService.getMessages(activeConversationId!),
    enabled: !!activeConversationId && !!currentUser?.id,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => {
      if (!activeConversationId || !currentUser || !currentUser.id) return Promise.reject('No conversation or user');
      return chatService.sendMessage({
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: currentUser.name,
        senderModel: currentUser.roleModel,
        text,
      });
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', activeConversationId], (old: Message[] = []) => {
        const msgId = newMessage.id || (newMessage as any)._id;
        const exists = old.some(m => (m.id || (m as any)._id) === msgId);
        if (exists) return old;
        return [...old, newMessage];
      });
    },
  });

  // ── Socket.io Setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = io('http://localhost:5000', {
      auth: { token: JSON.parse(localStorage.getItem('vault-auth') || '{}').state?.token }
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected'));
    
    // Global updates
    socket.on('conversation-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, queryClient]);

  // Join/Leave active conversation
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;

    socket.emit('join-conversation', activeConversationId);

    socket.on('message-received', (message: any) => {
      const msgId = message.id || message._id;
      if (message.conversationId === activeConversationId) {
        queryClient.setQueryData(['messages', activeConversationId], (old: Message[] = []) => {
          // Robust duplicate check
          const isDuplicate = old.some(m => (m.id || (m as any)._id) === msgId);
          if (isDuplicate) return old;
          return [...old, message];
        });
      }
    });

    socket.on('user-typing', (data: any) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data }));
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }, 3000);
      }
    });

    return () => {
      socket.emit('leave-conversation', activeConversationId);
      socket.off('message-received');
      socket.off('user-typing');
    };
  }, [activeConversationId, currentUser?.id, queryClient]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && activeConversationId) {
      socketRef.current.emit('typing', { conversationId: activeConversationId, isTyping });
    }
  }, [activeConversationId]);

  return {
    currentUser,
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    typingUsers: Object.values(typingUsers),
    sendTyping
  };
};
