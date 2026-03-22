import Conversation from '../models/Conversation.js';

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = userId || req.user.userId;

    // First ensure global chat exists
    let globalChat = await Conversation.findOne({ isGlobal: true });
    if (!globalChat) {
      globalChat = new Conversation({
        name: 'Global Community',
        type: 'group',
        isGlobal: true,
        participants: [], // Everyone is a participant in global
      });
      await globalChat.save();
    }

    const conversations = await Conversation.find({
      $or: [
        { 'participants.userId': currentUserId },
        { isGlobal: true }
      ]
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body; // Array of { userId, role, name, roleModel }

    // Check if conversation already exists between these users (only for 2 participants for now)
    const participantIds = participants.map(p => p.userId).sort();
    
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: participantIds },
      participants: { $size: participantIds.length }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants
      });
      await conversation.save();
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
