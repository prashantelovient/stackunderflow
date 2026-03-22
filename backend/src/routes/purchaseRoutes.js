import express from 'express';
import { createFakePurchase, getUserPurchases } from '../controllers/purchaseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/fake-purchase', createFakePurchase);
router.get('/my-purchases', getUserPurchases);

export default router;
