import Message from '../models/Message.js';
import { getIO } from '../socket/chatSocket.js';

export const getMessages = async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;
    const query = before ? { timestamp: { $lt: new Date(before) } } : {};

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    // Reverse to get chronological order for the client
    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (req, res, next) => {
  try {
    const { message, senderId, senderName, senderRole, senderModel } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = await Message.create({
      message,
      senderId,
      senderName,
      senderRole,
      senderModel,
    });

    try {
      const io = getIO();
      io.to('global-chat').emit('new-message', newMessage);
    } catch (err) {
      console.warn('Socket.IO not initialized, skipping emit');
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};
