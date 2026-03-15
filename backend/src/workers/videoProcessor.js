import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import crypto from 'crypto';
import { Video } from '../models/index.js';

ffmpeg.setFfmpegPath(ffmpegPath);

export const processVideoToHLS = (videoId, rawVideoPath) => {
  return new Promise((resolve, reject) => {
    try {
      const hlsDir = path.join('uploads', 'hls', videoId);
      if (!fs.existsSync(hlsDir)) {
        fs.mkdirSync(hlsDir, { recursive: true });
      }

      const key = crypto.randomBytes(16);
      const keyPath = path.join(hlsDir, 'encryption.key');
      fs.writeFileSync(keyPath, key);

      const keyInfoPath = path.join(hlsDir, 'key_info');
      const keyURI = `encryption.key`;
      const keyInfoContent = `${keyURI}\n${keyPath}`;
      fs.writeFileSync(keyInfoPath, keyInfoContent);

      const outputPath = path.join(hlsDir, 'index.m3u8');
      
      const segmentFilenamePath = path.join(hlsDir, 'segment_%03d.ts');
      
      ffmpeg(rawVideoPath)
        .outputOptions([
          '-hls_time 10',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${segmentFilenamePath}`,
          `-hls_key_info_file ${keyInfoPath}`,
        ])
        .output(outputPath)
        .on('end', async () => {
          console.log(`HLS conversion finished for video ${videoId}, saving locally...`);
          try {
            await Video.findByIdAndUpdate(
              videoId,
              { status: 'ready', videoPath: `/uploads/hls/${videoId}/index.m3u8` },
              { new: true }
            ).exec();
            
            // Cleanup only local raw file
            try {
              fs.unlinkSync(rawVideoPath); 
            } catch(cleanErr) {
              console.error('Failed to clean up raw file:', cleanErr);
            }

            resolve(outputPath);
          } catch(err) {
            console.error('Failed to save to db', err);
            reject(err);
          }
        })
        .on('error', async (err) => {
          console.error(`Error processing video ${videoId}:`, err);
          try {
            await Video.findByIdAndUpdate(
              videoId,
              { status: 'failed' },
              { new: true }
            ).exec();
          } catch(e) {}
          reject(err);
        })
        .run();
    } catch (error) {
      reject(error);
    }
  });
};
