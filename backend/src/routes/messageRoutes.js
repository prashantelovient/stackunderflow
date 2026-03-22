import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import { getConversations, createConversation } from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection to all routes
router.use(authMiddleware);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

// Messages
router.get('/', getMessages);
router.post('/', createMessage);

export default router;
