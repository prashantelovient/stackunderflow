import prisma from '../utils/db.js';

export const createBlog = async (req, res, next) => {
  try {
    const { title, slug, thumbnail, content, status } = req.body;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        thumbnail,
        content,
        status: status || 'draft',
      },
    });

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany();
    const formatted = blogs.map(b => ({
      ...b,
      publishDate: b.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
    });
    
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    res.json({
      ...blog,
      publishDate: blog.createdAt
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, slug, thumbnail, content, status } = req.body;
    
    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        title,
        slug,
        thumbnail,
        content,
        status,
      },
    });
    
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await prisma.blog.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};
