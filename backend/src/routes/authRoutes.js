import express from 'express';
import { unifiedLogin, unifiedRegister } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', unifiedLogin);
router.post('/register', unifiedRegister);

export default router;
