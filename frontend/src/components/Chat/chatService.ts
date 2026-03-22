import axios from 'axios';
import { Conversation, Message } from './types';

const API_BASE_URL = 'http://localhost:5000/api/messages'; // Or project environment variable

const getAuthToken = () => {
  const authStore = JSON.parse(localStorage.getItem('vault-auth') || '{}');
  return authStore.state?.token || '';
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  getConversations: async (userId: string): Promise<Conversation[]> => {
    const response = await api.get(`/conversations?userId=${userId}`);
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/?conversationId=${conversationId}`);
    return response.data;
  },

  sendMessage: async (messageData: {
    conversationId: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    senderModel: string;
    text: string;
  }): Promise<Message> => {
    const response = await api.post('/', messageData);
    return response.data.data;
  },

  createConversation: async (participants: Array<{ userId: string; role: string; name: string; roleModel: string }>): Promise<Conversation> => {
    const response = await api.post('/conversations', participants);
    return response.data;
  }
};
