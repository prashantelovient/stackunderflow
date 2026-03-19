import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/videolearn';

async function check() {
    try {
        await mongoose.connect(DATABASE_URL);
        const db = mongoose.connection.db;

        const adminCount = await db.collection('admins').countDocuments();
        const categoryCount = await db.collection('categories').countDocuments();
        const studentsCount = await db.collection('students').countDocuments();

        console.log(`Admins: ${adminCount}`);
        console.log(`Categories: ${categoryCount}`);
        console.log(`Students: ${studentsCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
