import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from './chatService';
import { useAuthStore } from '@/auth/store/authStore';
import { useEffect, useCallback, useState } from 'react';
import { Message, Conversation } from './types';
import { useChatSocket } from './ChatContext';

export const useChat = (activeConversationId: string | null = null) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { socket, typingUsers, sendTyping: sendTypingSocket, joinConversation, leaveConversation } = useChatSocket();

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

  // ── Socket Handler for active conversation ────────────────────────────────────
  useEffect(() => {
    if (!socket || !activeConversationId) return;

    joinConversation(activeConversationId);

    const onMessageReceived = (message: any) => {
      const msgId = message.id || message._id;
      if (message.conversationId === activeConversationId) {
        queryClient.setQueryData(['messages', activeConversationId], (old: Message[] = []) => {
          const isDuplicate = old.some(m => (m.id || (m as any)._id) === msgId);
          if (isDuplicate) return old;
          return [...old, message];
        });
      }
    };

    socket.on('message-received', onMessageReceived);

    return () => {
      leaveConversation(activeConversationId);
      socket.off('message-received', onMessageReceived);
    };
  }, [activeConversationId, socket, joinConversation, leaveConversation, queryClient]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (activeConversationId) {
      sendTypingSocket(activeConversationId, isTyping);
    }
  }, [activeConversationId, sendTypingSocket]);

  return {
    currentUser,
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    typingUsers: Object.values(typingUsers).filter((u: any) => u.conversationId === activeConversationId && u.isTyping !== false),
    sendTyping
  };
};
