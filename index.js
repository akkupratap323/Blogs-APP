const express = require('express');
const path = require('path');
const  exphbs = require('express-handlebars'); // Updated import
const userRoute = require('./routes/user');
const  {engine} = require('express-handlebars'); // Updated import
const helpers = require('handlebars-helpers');
const cookieParser = require('cookie-parser');
const { authenticationCookie } = require('./middlewares/authentication');

const mongoose = require('mongoose');

const app = express();

app.engine('hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(authenticationCookie('token'));

// Connect to MongoDB
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/blog')
 
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));



// Route to render the index.hbs file

app.get('/', (req, res) => {
  res.render('index', {
    
    user: req.user,
    title: 'Blogging App',
    message: 'Welcome to Blogging App',
  });
  console.log(req.user);
});

app.use('/user', userRoute)

// Start the server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));