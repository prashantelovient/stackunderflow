import { ChatUser, Conversation, Message } from './types';

export const currentUser: ChatUser = {
  id: 'current-user',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  role: 'admin',
  status: 'online',
};

export const mockUsers: ChatUser[] = [
  {
    id: '1',
    name: 'Sarah Instructor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'instructor',
    status: 'online',
  },
  {
    id: '2',
    name: 'Alex Student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'student',
    status: 'offline',
    lastSeen: '2h ago',
  },
  {
    id: '3',
    name: 'Admin Support',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Support',
    role: 'admin',
    status: 'online',
  },
  {
    id: '4',
    name: 'Jessica Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    role: 'student',
    status: 'online',
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', senderId: '1', text: 'Hey, did you review the lesson?', timestamp: '10:30 AM', status: 'seen' },
    { id: 'm2', senderId: 'current-user', text: 'Yes, looking good. Just need to update the slides.', timestamp: '10:35 AM', status: 'seen' },
    { id: 'm3', senderId: '1', text: 'Great! Let me know if you need help.', timestamp: '10:36 AM', status: 'seen' },
  ],
  'conv-2': [
    { id: 'm4', senderId: '2', text: 'I have a question about the task.', timestamp: 'Yesterday', status: 'seen' },
    { id: 'm5', senderId: 'current-user', text: 'Go ahead, what is it?', timestamp: 'Yesterday', status: 'seen' },
  ],
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0]],
    lastMessage: mockMessages['conv-1'][2],
    unreadCount: 0,
  },
  {
    id: 'conv-2',
    participants: [mockUsers[1]],
    lastMessage: mockMessages['conv-2'][1],
    unreadCount: 2,
  },
  {
    id: 'conv-3',
    participants: [mockUsers[2]],
    lastMessage: { id: 'm6', senderId: '3', text: 'System update coming at midnight.', timestamp: '2 days ago', status: 'seen' },
    unreadCount: 0,
  },
];
