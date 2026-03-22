import mongoose from 'mongoose';
import { applySchemaTransform } from './helpers.js';

const PurchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

applySchemaTransform(PurchaseSchema);

export default mongoose.model('Purchase', PurchaseSchema);
