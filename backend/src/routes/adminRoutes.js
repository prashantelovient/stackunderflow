import express from 'express';
import { login, register } from '../controllers/adminController.js';
import { validate } from '../middleware/validator.js';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  query: z.any(),
  params: z.any()
});

router.post('/login', validate(loginSchema), login);
// Example route to register initial admin, might not be public in actual app
router.post('/register', validate(loginSchema), register);

export default router;
