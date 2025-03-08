const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'public/uploads/avatars';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

exports.uploadAvatar = upload.single('avatar');

// Middleware to restrict routes to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// User Management Controllers

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get pending users (admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select('-password');
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get approved users (admin only)
exports.getApprovedUsers = async (req, res) => {
  try {
    console.log('Fetching approved users...');
    const users = await User.find({ isApproved: true }).select('-password');
    console.log('Found users:', users);
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error fetching approved users:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Approve user (admin only)
exports.approveUser = async (req, res) => {
  try {
    console.log('Approving user with ID:', req.params.id);
    
    // Find user first to get their current data including password
    const existingUser = await User.findById(req.params.id).select('+password');
    
    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    console.log('Found user:', {
      email: existingUser.email,
      role: existingUser.role,
      hasPassword: !!existingUser.password
    });

    // Update user with approval status while preserving their password
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
        approvedAt: Date.now(),
        approvedBy: req.user._id,
        password: existingUser.password // Preserve the original hashed password
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    console.log('User approved successfully:', {
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved
    });

    res.status(200).json({
      status: 'success',
      message: 'User approved successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete/Reject user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that ID'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// User Profile Controllers

// Get user profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, department, role } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, email, department, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email, department },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update current user profile
exports.updateCurrentUser = async (req, res) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'This route is not for password updates. Please use /updateMyPassword.'
      });
    }

    // 2) Filter out unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Error updating current user:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User approved successfully',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
