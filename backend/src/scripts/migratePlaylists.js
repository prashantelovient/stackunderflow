import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/videolearn';

// Define schemas locally for the migration
const OldPlaylistSchema = new mongoose.Schema({
    title: String,
    description: String,
    thumbnail: String,
    categoryId: mongoose.Schema.Types.ObjectId,
}, { strict: false, collection: 'playlists' });

const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    thumbnail: String,
    categoryId: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
}, { strict: false, collection: 'courses' });

const ModuleSchema = new mongoose.Schema({
    title: String,
    description: String,
    courseId: mongoose.Schema.Types.ObjectId,
    order: { type: Number, default: 0 },
}, { strict: false, collection: 'modules' });

const LectureSchema = new mongoose.Schema({
    title: String,
    description: String,
    moduleId: mongoose.Schema.Types.ObjectId,
    type: { type: String, enum: ['video', 'resource', 'material'], default: 'video' },
    videoId: mongoose.Schema.Types.ObjectId,
    order: { type: Number, default: 0 },
}, { strict: false, collection: 'lectures' });

const VideoSchema = new mongoose.Schema({
    title: String,
    playlistId: mongoose.Schema.Types.ObjectId, // Old field
    courseId: mongoose.Schema.Types.ObjectId, // New field
}, { strict: false, collection: 'videos' });

const StudentSchema = new mongoose.Schema({
    name: String,
    enrolledPlaylists: [mongoose.Schema.Types.ObjectId], // Old field
    enrolledCourses: [mongoose.Schema.Types.ObjectId], // New field
}, { strict: false, collection: 'students' });

const Playlist = mongoose.model('OldPlaylist', OldPlaylistSchema);
const Course = mongoose.model('Course', CourseSchema);
const Module = mongoose.model('Module', ModuleSchema);
const Lecture = mongoose.model('Lecture', LectureSchema);
const Video = mongoose.model('Video', VideoSchema);
const Student = mongoose.model('Student', StudentSchema);

async function migrate() {
    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Connected to MongoDB');

        const playlists = await Playlist.find({});
        console.log(`Found ${playlists.length} playlists to migrate.`);

        for (const playlist of playlists) {
            console.log(`Migrating playlist: ${playlist.title}`);

            // 1. Create Course
            const course = await Course.create({
                title: playlist.title,
                description: playlist.description || '',
                thumbnail: playlist.thumbnail || null,
                categoryId: playlist.categoryId || null,
            });

            // 2. Create Default Module
            const mainModule = await Module.create({
                title: 'General',
                description: `Default module for ${playlist.title}`,
                courseId: course._id,
                order: 0,
            });

            // 3. Find and Migrated Videos
            // Some videos might have playlistId in them
            const videos = await Video.find({
                $or: [
                    { playlistId: playlist._id }, // Old field
                    { courseId: playlist._id }    // Maybe some already updated incorrectly or to playlistId
                ]
            });

            console.log(`  - Found ${videos.length} videos in this playlist.`);

            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];

                // 4. Create Lecture for each video
                await Lecture.create({
                    title: video.title,
                    description: video.description || '',
                    moduleId: mainModule._id,
                    type: 'video',
                    videoId: video._id,
                    order: i,
                });

                // 5. Update Video reference
                await Video.updateOne({ _id: video._id }, {
                    $set: { courseId: course._id },
                    $unset: { playlistId: 1 }
                });
            }

            // 6. Update Student Enrollments that point to this playlist
            // This is complex as we need to find students having this playlistId in enrolledPlaylists
            const students = await Student.find({ enrolledPlaylists: playlist._id });
            console.log(`  - Updating enrollment for ${students.length} students.`);

            for (const student of students) {
                await Student.updateOne({ _id: student._id }, {
                    $addToSet: { enrolledCourses: course._id },
                    $pull: { enrolledPlaylists: playlist._id }
                });
            }
        }

        // Final cleanup for students who might have empty old fields
        await Student.updateMany({}, { $unset: { enrolledPlaylists: 1 } });
        // Final cleanup for videos who might have empty old fields
        await Video.updateMany({}, { $unset: { playlistId: 1 } });

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
