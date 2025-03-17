const express = require('express');
const router = express.Router();
const Blog = require('../models/blog'); // Assuming you have a Blog model
const { authenticationCookie } = require('../middlewares/authentication');

// Render the blog creation form (GET /blog/create)
router.get('/create', authenticationCookie('token'), (req, res) => {
  res.render('blog', {
    title: 'Create Blog',
    user: req.user, // Pass the authenticated user to the template
  });
});

// Handle blog creation form submission (POST /blog/create)
router.post('/create', authenticationCookie('token'), async (req, res) => {
  const { title, content } = req.body;
  const author = req.user._id; // Get the authenticated user's ID

  try {
    // Create a new blog post
    const newBlog = new Blog({ title, content, author });
    await newBlog.save();

    // Redirect to the home page or the newly created blog post
    res.redirect('/');
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).render('blog', {
      title: 'Create Blog',
      user: req.user,
      error: 'Failed to create blog. Please try again.',
    });
  }
});

module.exports = router;