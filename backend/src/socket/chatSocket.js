import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

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
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

    socket.on('join-chat', () => {
      socket.join('global-chat');
      console.log(`User ${socket.user.id} joined global chat`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { message, senderName, senderRole, senderId, senderModel } = data;

        if (!message || message.trim() === '') return;

        const newMessage = await Message.create({
          message,
          senderId: senderId || socket.user.id,
          senderName: senderName || socket.user.name,
          senderRole: senderRole || socket.user.role,
          senderModel: senderModel || (socket.user.role.charAt(0).toUpperCase() + socket.user.role.slice(1)),
        });

        io.to('global-chat').emit('new-message', newMessage);
      } catch (error) {
        console.error('Socket error sending message:', error);
      }
    });

    socket.on('typing', (data) => {
      socket.to('global-chat').emit('user-typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        role: socket.user.role,
        isTyping: data.isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
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
