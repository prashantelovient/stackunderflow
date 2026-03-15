import prisma from '../utils/db.js';

export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, thumbnail, categoryId } = req.body;

    const playlist = await prisma.playlist.create({
      data: {
        title,
        description,
        thumbnail,
        categoryId: categoryId || null,
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        category: true,
        videos: true
      }
    });
    
    const formatted = playlists.map(p => ({
      ...p,
      category: p.category ? p.category.name : 'Uncategorized',
      videoCount: p.videos ? p.videos.length : 0
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    const p = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        videos: true
      }
    });
    
    if (!p) return res.status(404).json({ message: 'Playlist not found' });
    
    const formatted = {
      ...p,
      category: p.category ? p.category.name : 'Uncategorized',
      videoCount: p.videos ? p.videos.length : 0
    };
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { title, description, thumbnail, categoryId } = req.body;
    
    const playlist = await prisma.playlist.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        thumbnail,
        categoryId: categoryId || null,
      },
    });
    
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    await prisma.playlist.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
