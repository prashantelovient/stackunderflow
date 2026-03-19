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
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const playlistsCount = await db.collection('playlists').countDocuments();
        const coursesCount = await db.collection('courses').countDocuments();
        const videosCount = await db.collection('videos').countDocuments();

        console.log(`Playlists: ${playlistsCount}`);
        console.log(`Courses: ${coursesCount}`);
        console.log(`Videos: ${videosCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
check();
