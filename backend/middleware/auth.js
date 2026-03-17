const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Verified ID:', verified?.id);
    
    if (!verified) {
      return res.status(401).json({ message: 'Token verification failed, authorization denied.' });
    }

    const user = await User.findById(verified.id).select('-password');
    if (!user) {
      console.log('Auth middleware - User not found for ID:', verified.id);
      return res.status(401).json({ message: 'User not found, authorization denied.' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token, authorization denied.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role?.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = { auth, admin };
