const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const { authenticationCookie } = require('../middlewares/authentication');
const upload = require('../middlewares/upload');

// Validate ObjectId middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash('error', 'Invalid blog ID');
    return res.redirect('/');
  }
  next();
};

// Blog creation routes
router.get('/create', authenticationCookie('token'), (req, res) => {
  res.render('blog', {
    title: 'Create Blog'
  });
});

router.post('/create', 
  authenticationCookie('token'),
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, body } = req.body;
      
      if (!title || !body) {
        req.flash('error', 'Title and content are required');
        return res.redirect('/blog/create');
      }

      const blog = new Blog({
        title,
        body,
        author: req.user._id,
        image: req.file ? `/uploads/${req.file.filename}` : null
      });

      await blog.save();
      req.flash('success', 'Blog post created successfully!');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create blog post');
      res.redirect('/blog/create');
    }
  }
);

// View single blog
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profileImg')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username profileImg' }
      })
      .lean();

    if (!blog) {
      req.flash('error', 'Blog not found');
      return res.redirect('/');
    }

    res.render('blog-details', {
      title: blog.title,
      blog,
      isAuthor: req.user && blog.author && req.user._id.toString() === blog.author._id.toString()
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading blog post');
    res.redirect('/');
  }
});

// Delete blog
router.post('/:id/delete', 
  authenticationCookie('token'),
  validateObjectId,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/');
      }

      if (!req.user || blog.author.toString() !== req.user._id.toString()) {
        req.flash('error', 'You do not have permission to delete this blog');
        return res.redirect('/');
      }

      await blog.remove();
      req.flash('success', 'Blog post deleted successfully');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to delete blog post');
      res.redirect(`/blog/${req.params.id}`);
    }
  }
);

module.exports = router;