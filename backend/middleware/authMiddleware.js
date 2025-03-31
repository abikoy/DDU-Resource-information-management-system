const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verification:', decoded);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Log user details for debugging
      console.log('Auth middleware - User found:', {
        id: user._id,
        role: user.role,
        department: user.department
      });

      // Set user info in request
      req.user = {
        _id: user._id,
        role: user.role.toLowerCase(), // Normalize role to lowercase
        department: user.department?.toUpperCase() // Normalize department to uppercase
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error in auth middleware'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    console.log('Checking role access:', {
      userRole,
      allowedRoles,
      userId: req.user._id
    });

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
