import mongoose from 'mongoose';
import { Category, Course, Video } from '../models/index.js';

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

    const courses = await Course.find({ categoryId: { $in: categoryIds } })
      .select('_id categoryId')
      .exec();

    const courseIds = courses.map(c => c._id);

    const videos = await Video.find({ courseId: { $in: courseIds } })
      .select('courseId')
      .exec();

    const courseToCategory = new Map();
    courses.forEach(c => {
      if (c.categoryId) {
        courseToCategory.set(c._id.toString(), c.categoryId.toString());
      }
    });

    const categoryVideoCount = new Map();
    videos.forEach(v => {
      const cId = v.courseId ? v.courseId.toString() : null;
      const categoryId = cId ? courseToCategory.get(cId) : null;
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
