import { getPresignedUploadUrl } from '../utils/minioClient.js';
import crypto from 'crypto';

export const getUploadUrl = async (req, res, next) => {
    try {
        const { fileName, contentType, folder = 'uploads' } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ message: 'fileName and contentType are required' });
        }

        // Standard check: only admins or instructors can upload
        if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions for upload.' });
        }

        // Generate a unique key for the file to prevent collisions
        const fileId = crypto.randomUUID();
        const extension = fileName.split('.').pop();
        const key = `${folder}/${fileId}.${extension}`;

        const url = await getPresignedUploadUrl(key, contentType);

        res.json({
            url,
            key,
            fileName,
        });
    } catch (error) {
        next(error);
    }
};

export const getThumbnail = async (req, res, next) => {
    try {
        const { key } = req.query; // e.g. thumbnails/abc.png

        if (!key) return res.status(400).json({ message: 'Thumbnail key is required' });

        const { downloadFile } = await import('../utils/minioClient.js');
        const stream = await downloadFile(key);

        // Guess content type
        let contentType = 'image/png';
        if (key.endsWith('.jpg') || key.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (key.endsWith('.webp')) contentType = 'image/webp';

        res.setHeader('Content-Type', contentType);
        stream.pipe(res);
    } catch (error) {
        next(error);
    }
};

