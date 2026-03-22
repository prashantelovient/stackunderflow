export type Role = 'admin' | 'instructor' | 'student';

export interface Participant {
  userId: string;
  role: Role;
  name: string;
  roleModel: string; // 'Admin' | 'Instructor' | 'Student'
}

export interface Conversation {
  id: string;
  _id?: string;
  participants: Participant[];
  type: 'private' | 'group';
  isGlobal: boolean;
  name?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
  };
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: Role;
  senderName: string;
  text: string;
  createdAt: string;
  seenBy: string[];
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  role: Role;
  email?: string;
  avatar?: string;
}
