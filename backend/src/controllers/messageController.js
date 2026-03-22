import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { getIO } from '../socket/chatSocket.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ status: 'error', message: 'conversationId is required' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const {
      conversationId,
      senderId,
      senderRole,
      senderName,
      senderModel,
      text,
    } = req.body;

    const message = new Message({
      conversationId,
      senderId,
      senderRole,
      senderName,
      senderModel,
      text,
    });

    await message.save();

    // Update conversation last message and updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text,
        senderId,
        timestamp: new Date(),
      },
      updatedAt: new Date(),
    });

    const io = getIO();
    if (io) {
      // Emit back to the conversation room
      io.to(conversationId).emit('message-received', message);
      // Also emit update to participants' list
      io.emit('conversation-updated', { conversationId, lastMessage: message });
    }

    res.status(201).json({ status: 'success', data: message });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
