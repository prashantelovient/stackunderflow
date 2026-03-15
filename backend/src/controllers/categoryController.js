import prisma from '../utils/db.js';

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        playlists: {
          include: {
            videos: true
          }
        }
      }
    });
    
    const formatted = categories.map(c => {
      let videoCount = 0;
      if (c.playlists) {
        c.playlists.forEach(p => {
          if (p.videos) videoCount += p.videos.length;
        });
      }
      return {
        ...c,
        slug: c.name.toLowerCase().replace(/ /g, '-'),
        videoCount
      };
    });
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name },
    });
    
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
