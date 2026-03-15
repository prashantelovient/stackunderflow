import fs from 'fs';
import path from 'path';

export const streamPlaylist = async (req, res, next) => {
  try {
    const { videoId } = req.params;
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
        // Return URL to chunk endpoint
        modifiedLines.push(`/api/stream/${videoId}/${trimmedLine}`);
      } 
      else if (trimmedLine.includes('URI="encryption.key"')) {
        modifiedLines.push(`#EXT-X-KEY:METHOD=AES-128,URI="/api/stream/${videoId}/key"`);
      } 
      else {
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
    
    const readStream = fs.createReadStream(keyPath);
    readStream.pipe(res);
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
    
    const readStream = fs.createReadStream(segmentPath);
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
