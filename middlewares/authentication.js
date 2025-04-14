const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = {
  authenticationCookie: (cookieName) => async (req, res, next) => {
    try {
      const token = req.cookies[cookieName];
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        res.clearCookie(cookieName);
        return next();
      }
      
      req.user = user;
      res.locals.currentUser = user;
      next();
    } catch (err) {
      res.clearCookie(cookieName);
      next();
    }
  }
};