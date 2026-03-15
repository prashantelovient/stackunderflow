import mongoose from 'mongoose';
import { Playlist } from '../models/index.js';

export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, thumbnail, categoryId } = req.body;

    const categoryObjectId = categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null;

    const playlist = await Playlist.create({
      title,
      description,
      thumbnail,
      categoryId: categoryObjectId,
    });

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find()
      .populate('categoryId', 'name')
      .populate('videos')
      .exec();
    
    const formatted = playlists.map(p => ({
      ...p.toObject(),
      categoryId: p.categoryId ? (p.categoryId.id || p.categoryId._id?.toString?.()) : null,
      category: p.categoryId ? p.categoryId.name : 'Uncategorized',
      videoCount: p.videos ? p.videos.length : 0,
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const p = await Playlist.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('videos')
      .exec();
    
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    
    const formatted = {
      ...p.toObject(),
      categoryId: p.categoryId ? (p.categoryId.id || p.categoryId._id?.toString?.()) : null,
      category: p.categoryId ? p.categoryId.name : 'Uncategorized',
      videoCount: p.videos ? p.videos.length : 0,
    };
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { title, description, thumbnail, categoryId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const categoryObjectId = categoryId && mongoose.Types.ObjectId.isValid(categoryId) ? categoryId : null;

    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        thumbnail,
        categoryId: categoryObjectId,
      },
      { new: true }
    ).exec();
    
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    await Playlist.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
