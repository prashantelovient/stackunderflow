import prisma from '../utils/db.js';
import { processVideoToHLS } from '../workers/videoProcessor.js';

export const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, duration, playlistId } = req.body;
    
    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const rawVideoPath = videoFile.path;
    const thumbnailPath = thumbnailFile ? `/thumbnails/${thumbnailFile.filename}` : null;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoPath: '', // Will be updated by the worker
        thumbnail: thumbnailPath,
        duration: duration ? parseInt(duration) : null,
        playlistId: playlistId || null,
        status: 'processing'
      },
    });

    // Run HLS conversion worker in background
    processVideoToHLS(video.id, rawVideoPath).catch(console.error);

    res.status(201).json({ ...video, message: 'Video is uploading and processing.' });
  } catch (error) {
    next(error);
  }
};

export const getVideos = async (req, res, next) => {
  try {
    const videos = await prisma.video.findMany({
      include: {
        playlist: true
      }
    });
    
    const formatted = videos.map(v => ({
      ...v,
      playlistTitle: v.playlist ? v.playlist.title : 'No Playlist',
      uploadDate: v.createdAt,
      duration: v.duration ? `${Math.floor(v.duration/60)}:${(v.duration%60).toString().padStart(2, '0')}` : '0:00'
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getVideoById = async (req, res, next) => {
  try {
    const v = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        playlist: true
      }
    });
    
    if (!v) return res.status(404).json({ message: 'Video not found' });
    
    const formatted = {
      ...v,
      playlistTitle: v.playlist ? v.playlist.title : 'No Playlist',
      uploadDate: v.createdAt,
      duration: v.duration ? `${Math.floor(v.duration/60)}:${(v.duration%60).toString().padStart(2, '0')}` : '0:00'
    };
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { title, description, duration, playlistId } = req.body;
    
    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        duration: duration ? parseInt(duration) : undefined,
        playlistId: playlistId || null,
      },
    });
    
    res.json(video);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    await prisma.video.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};
