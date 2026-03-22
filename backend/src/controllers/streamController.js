import fs from 'fs';
import path from 'path';
import { Video } from '../models/index.js';
import { downloadFile, getPresignedDownloadUrl } from '../utils/minioClient.js';

export const streamPlaylist = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId).exec();

    if (!video) {
      return res.status(404).json({ message: 'Video record not found' });
    }

    // --- CASE 1: S3 STORAGE ---
    if (video.videoPath && video.videoPath.startsWith('videos/')) {
      const s3Key = video.videoPath;
      const body = await downloadFile(s3Key);

      // Read stream into string
      const chunks = [];
      for await (let chunk of body) chunks.push(chunk);
      const m3u8Content = Buffer.concat(chunks).toString('utf-8');

      const lines = m3u8Content.split('\n');
      const modifiedLines = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.endsWith('.ts')) {
          const segmentKey = `videos/hls/${videoId}/${trimmed}`;
          const signedUrl = await getPresignedDownloadUrl(segmentKey);
          modifiedLines.push(signedUrl);
        } else if (trimmed.includes('URI="encryption.key"')) {
          const keyUrl = await getPresignedDownloadUrl(`videos/hls/${videoId}/encryption.key`);
          modifiedLines.push(`#EXT-X-KEY:METHOD=AES-128,URI="${keyUrl}"`);
        } else {
          modifiedLines.push(line);
        }
      }

      res.setHeader('Content-Type', 'application/x-mpegURL');
      return res.send(modifiedLines.join('\n'));
    }

    // --- CASE 2: LOCAL STORAGE FALLBACK ---
    const m3u8Path = path.join('uploads', 'hls', videoId, 'index.m3u8');
    if (!fs.existsSync(m3u8Path)) {
      return res.status(404).json({ message: 'Video stream not ready or not found' });
    }

    const m3u8Content = fs.readFileSync(m3u8Path, 'utf-8');
    const lines = m3u8Content.split('\n');
    const modifiedLines = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.endsWith('.ts')) {
        modifiedLines.push(`/api/stream/${videoId}/${trimmedLine}`);
      } else if (trimmedLine.includes('URI="encryption.key"')) {
        modifiedLines.push(`#EXT-X-KEY:METHOD=AES-128,URI="/api/stream/${videoId}/key"`);
      } else {
        modifiedLines.push(line);
      }
    }

    res.setHeader('Content-Type', 'application/x-mpegURL');
    res.send(modifiedLines.join('\n'));

  } catch (error) {
    next(error);
  }
};

export const streamKey = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const keyPath = path.join('uploads', 'hls', videoId, 'encryption.key');

    if (!fs.existsSync(keyPath)) {
      return res.status(404).json({ message: 'Key not found' });
    }

    const stat = fs.statSync(keyPath);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size
    });

    fs.createReadStream(keyPath).pipe(res);
  } catch (error) {
    next(error);
  }
};

export const streamSegment = async (req, res, next) => {
  try {
    const { videoId, segment } = req.params;
    const segmentPath = path.join('uploads', 'hls', videoId, segment);

    if (!fs.existsSync(segmentPath)) {
      return res.status(404).json({ message: 'Segment not found' });
    }

    const stat = fs.statSync(segmentPath);
    res.writeHead(200, {
      'Content-Type': 'video/MP2T',
      'Content-Length': stat.size
    });

    fs.createReadStream(segmentPath).pipe(res);
  } catch (error) {
    next(error);
  }
};

