const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  createToken: (user) => {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret-key',
      { expiresIn: '24h' }
    );
  },
  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
  }
};