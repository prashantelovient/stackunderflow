import mongoose from 'mongoose';
import { Blog } from '../models/index.js';

export const createBlog = async (req, res, next) => {
  try {
    const { title, slug, thumbnail, content, status } = req.body;

    const blog = await Blog.create({
      title,
      slug,
      thumbnail,
      content,
      status: status || 'draft',
    });

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().exec();
    const formatted = blogs.map(b => ({
      ...b.toObject(),
      publishDate: b.createdAt,
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const blog = await Blog.findById(req.params.id).exec();
    
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    res.json({
      ...blog.toObject(),
      publishDate: blog.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { title, slug, thumbnail, content, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        thumbnail,
        content,
        status,
      },
      { new: true }
    ).exec();
    
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    await Blog.findByIdAndDelete(req.params.id).exec();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};
