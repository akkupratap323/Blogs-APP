const express = require('express');
const router = express.Router();
const { createToken } = require('../services/authentication');
const User = require('../models/user');
const csrf = require('csurf');

// Initialize CSRF protection
const csrfProtection = csrf({ cookie: true });

// Signup routes
router.get('/signup', csrfProtection, (req, res) => {
  res.render('signup', {
    title: 'Sign Up',
    csrfToken: req.csrfToken(),
    error: req.flash('error'),
    formData: req.flash('formData')[0] || {}
  });
});

router.post('/signup', csrfProtection, async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      req.flash('error', 'All fields are required');
      req.flash('formData', { username, email });
      return res.redirect('/user/signup');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      req.flash('formData', { username, email });
      return res.redirect('/user/signup');
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      req.flash('error', 'Email or username already exists');
      req.flash('formData', { username, email });
      return res.redirect('/user/signup');
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = createToken(user);
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    req.flash('success', 'Account created successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    req.flash('error', err.message);
    res.redirect('/user/signup');
  }
});

// Login routes
router.get('/signin', csrfProtection, (req, res) => {
  res.render('signin', {
    title: 'Sign In',
    csrfToken: req.csrfToken(),
    error: req.flash('error'),
    formData: req.flash('formData')[0] || {}
  });
});

router.post('/signin', csrfProtection, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      req.flash('error', 'Email and password are required');
      return res.redirect('/user/signin');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid credentials');
      req.flash('formData', { email });
      return res.redirect('/user/signin');
    }

    const token = createToken(user);
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    req.flash('success', 'Logged in successfully!');
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Login failed');
    res.redirect('/user/signin');
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'You have been logged out');
  res.redirect('/');
});

module.exports = router;