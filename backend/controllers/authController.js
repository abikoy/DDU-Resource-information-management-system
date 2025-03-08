const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    console.log('Signup attempt for:', req.body.email);
    console.log('Request body:', req.body);

    const { fullName, email, password, department, role } = req.body;

    // Convert email to lowercase and trim
    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    let isApproved = false;
    let registeredById = null;

    // Check if an admin is making the request
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (adminUser && adminUser.role === 'admin') {
          isApproved = true; // Admins can approve new users immediately
          registeredById = adminUser._id;
        }
      } catch (error) {
        console.log('Invalid token in signup, treating as self-registration');
      }
    }

    // Admins registering themselves don't need approval
    if (role === 'admin') {
      isApproved = true;
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      email: lowerEmail,
      password, // Password will be hashed by pre-save middleware
      department,
      role: role || 'staff',
      isApproved,
      registeredBy: registeredById
    });

    // Remove password from output
    newUser.password = undefined;

    // Send appropriate response
    console.log('Signup successful for:', lowerEmail);
    res.status(201).json({
      status: 'success',
      message: isApproved
        ? 'User registered successfully'
        : 'Registration successful. Waiting for admin approval',
      data: {
        user: newUser
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during signup'
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Convert email to lowercase for case-insensitive comparison
    const lowerEmail = email.toLowerCase().trim();
    console.log('Searching for email (lowercase):', lowerEmail);

    // Check if user exists and include password in the result
    const user = await User.findOne({ email: lowerEmail }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found for email:', lowerEmail);
      return res.status(401).json({
        status: 'error',
        message: 'User with this email does not exist'
      });
    }

    // Check if password is correct using the model method
    const isPasswordCorrect = await user.correctPassword(password);
    console.log('Password check result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password'
      });
    }

    // For non-admin users, check if they are approved
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account is pending approval from admin'
      });
    }

    // If everything is ok, send token
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    // Log successful login
    console.log('Login successful for:', lowerEmail, 'Role:', user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // Get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

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
