import mongoose from 'mongoose';
import { Category, Playlist, Video } from '../models/index.js';

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await Category.create({ name });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().exec();
    const categoryIds = categories.map(c => c._id);

    const playlists = await Playlist.find({ categoryId: { $in: categoryIds } })
      .select('_id categoryId')
      .exec();

    const playlistIds = playlists.map(p => p._id);

    const videos = await Video.find({ playlistId: { $in: playlistIds } })
      .select('playlistId')
      .exec();

    const playlistToCategory = new Map();
    playlists.forEach(p => {
      if (p.categoryId) {
        playlistToCategory.set(p._id.toString(), p.categoryId.toString());
      }
    });

    const categoryVideoCount = new Map();
    videos.forEach(v => {
      const playlistId = v.playlistId ? v.playlistId.toString() : null;
      const categoryId = playlistId ? playlistToCategory.get(playlistId) : null;
      if (categoryId) {
        categoryVideoCount.set(categoryId, (categoryVideoCount.get(categoryId) || 0) + 1);
      }
    });

    const formatted = categories.map(c => ({
      ...c.toObject(),
      slug: c.name.toLowerCase().replace(/ /g, '-'),
      videoCount: categoryVideoCount.get(c.id) || 0,
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    ).exec();
    
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await Category.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
