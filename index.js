require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const moment = require('moment');

// Import models
require('./models/user');
require('./models/blog');

// Import middleware
const { authenticationCookie } = require('./middlewares/authentication');

const app = express();

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Handlebars setup
const hbs = exphbs.create({
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (date) => moment(date).format('MMMM Do YYYY, h:mm a'),
    fromNow: (date) => moment(date).fromNow()
  },
  defaultLayout: 'main',
  extname: '.hbs',
  partialsDir: [
    path.join(__dirname, 'views', 'partials')
  ],
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware - ORDER IS CRUCIAL
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authenticationCookie('token'));

// CSRF Protection
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  }
});
app.use(csrfProtection);

// Flash messages
app.use(flash());

// Make variables available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/user', require('./routes/user'));
app.use('/blog', require('./routes/blog'));

// Home Route
app.get('/', async (req, res) => {
  try {
    const blogs = await mongoose.model('Blog').find()
      .populate('author', 'username profileImg')
      .sort({ createdAt: -1 })
      .lean();

    res.render('index', {
      title: 'Blogging App',
      blogs
    });
  } catch (err) {
    console.error('Error:', err);
    req.flash('error', 'Failed to load blogs');
    res.redirect('/');
  }
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Error:', err);
    req.flash('error', 'Session expired. Please refresh the page and try again.');
    return res.redirect(req.headers.referer || '/');
  }
  next(err);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash('error', 'An unexpected error occurred');
  res.status(500).redirect('/');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});