const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { createToken } = require('../services/authentication');


// Signup Route (GET)
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

// Signup Route (POST)
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('signup', { error: 'Email already exists' });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Redirect to the login page after successful signup
    res.redirect('/user/signin');
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).render('signup', { error: 'Internal Server Error' });
  }
});

// Signin Route (GET)
router.get('/signin', (req, res) => {
  const error = req.query.error || null; // Get error from query params
  res.render('signin', { title: 'Sign In', error });
});

// Signin Route (POST)
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect('/user/signin?error=Invalid email or password');  
    }

    // Compare the password
    const isMatch = await user.comparePassword(password); // Only pass the password
    if (!isMatch) {
      return res.redirect('/user/signin?error=Invalid email or password');
    }

    // Generate a token (assuming you have a method for this)
    const token = createToken(user); // Example method to generate a token

    console.log('Token:', token);

    // Set the token in a cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    }).redirect('/');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).render('signin', { error: 'Internal Server Error' });
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  // Redirect to the home page
  res.redirect('/');
});

module.exports = router;