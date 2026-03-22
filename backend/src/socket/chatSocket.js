import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

let io;

export const initChatSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { conversationId, text, senderName, senderRole, senderId, senderModel } = data;

        if (!text || text.trim() === '') return;

        const newMessage = new Message({
          conversationId,
          text,
          senderId: senderId || socket.userId,
          senderName: senderName || socket.userName,
          senderRole: senderRole || socket.userRole,
          senderModel: senderModel || (socket.userRole.charAt(0).toUpperCase() + socket.userRole.slice(1)),
        });

        await newMessage.save();

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text,
            senderId: socket.userId,
            timestamp: new Date(),
          },
          updatedAt: new Date(),
        });

        io.to(conversationId).emit('message-received', newMessage);
        io.emit('conversation-updated', { conversationId, lastMessage: newMessage });
      } catch (error) {
        console.error('Socket error sending message:', error);
      }
    });

    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(conversationId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        role: socket.userRole,
        isTyping,
        conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
