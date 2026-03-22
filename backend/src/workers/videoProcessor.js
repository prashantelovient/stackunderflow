import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import crypto from 'crypto';
import { Video } from '../models/index.js';

ffmpeg.setFfmpegPath(ffmpegPath);

import { minioClient, downloadFile, uploadFile } from '../utils/minioClient.js';
import { pipeline } from 'stream/promises';

export const processVideoToHLS = async (videoId, sourcePath, isS3Source = false) => {
  let localRawPath = sourcePath;
  const hlsDir = path.join('uploads', 'hls', videoId);

  try {
    if (!fs.existsSync(hlsDir)) {
      fs.mkdirSync(hlsDir, { recursive: true });
    }

    // 1. If S3, download to local temp
    if (isS3Source) {
      console.log(`Starting S3 download for video: ${videoId}`);
      const tempId = crypto.randomUUID();
      const tempPath = path.join('uploads', `tmp_${tempId}_${path.basename(sourcePath)}`);
      const s3Stream = await downloadFile(sourcePath);
      const writeStream = fs.createWriteStream(tempPath);
      await pipeline(s3Stream, writeStream);
      localRawPath = tempPath;
      console.log(`S3 Download complete: ${localRawPath}`);
    }

    // 2. Encryption Setup
    const key = crypto.randomBytes(16);
    const keyPath = path.join(hlsDir, 'encryption.key');
    fs.writeFileSync(keyPath, key);

    const keyInfoPath = path.join(hlsDir, 'key_info');
    const keyURI = `encryption.key`;
    const keyInfoContent = `${keyURI}\n${keyPath}`;
    fs.writeFileSync(keyInfoPath, keyInfoContent);

    const outputPath = path.join(hlsDir, 'index.m3u8');
    const segmentFilenamePath = path.join(hlsDir, 'segment_%03d.ts');

    // 3. Run FFmpeg
    console.log(`Starting FFmpeg HLS conversion for: ${videoId}`);
    await new Promise((resolve, reject) => {
      ffmpeg(localRawPath)
        .outputOptions([
          '-hls_time 10',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${segmentFilenamePath}`,
          `-hls_key_info_file ${keyInfoPath}`,
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    console.log(`HLS conversion finished for video ${videoId}. Preparing S3 sync...`);

    // 4. Sync HLS folder to S3
    const files = fs.readdirSync(hlsDir);
    for (const file of files) {
      const filePath = path.join(hlsDir, file);
      const fileKey = `videos/hls/${videoId}/${file}`;
      const body = fs.readFileSync(filePath);

      let contentType = 'application/octet-stream';
      if (file.endsWith('.m3u8')) contentType = 'application/x-mpegURL';
      else if (file.endsWith('.ts')) contentType = 'video/MP2T';
      else if (file.endsWith('.key')) contentType = 'application/octet-stream';

      await uploadFile(fileKey, body, contentType);
    }

    // 5. Update DB
    await Video.findByIdAndUpdate(
      videoId,
      {
        status: 'ready',
        videoPath: `videos/hls/${videoId}/index.m3u8`, // Store S3 path
        isS3: true
      },
      { new: true }
    ).exec();

    // 6. Cleanup Local Storage
    try {
      if (localRawPath && fs.existsSync(localRawPath)) fs.unlinkSync(localRawPath);
      // Delete the whole HLS dir since it's and in S3 now
      fs.rmSync(hlsDir, { recursive: true, force: true });
    } catch (cleanErr) {
      console.error('Cleanup warning:', cleanErr);
    }

    console.log(`Pipeline complete for video ${videoId}. Asset stored in S3.`);

  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    try {
      await Video.findByIdAndUpdate(videoId, { status: 'failed' }).exec();
      if (localRawPath && fs.existsSync(localRawPath)) fs.unlinkSync(localRawPath);
      if (fs.existsSync(hlsDir)) fs.rmSync(hlsDir, { recursive: true, force: true });
    } catch (e) { }
    throw error;
  }
};

