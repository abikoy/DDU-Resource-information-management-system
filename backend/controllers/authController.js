const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, department, role } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    console.log('Signup attempt:', { email: lowerEmail, role, department });

    // Check if user already exists
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    // Get the latest user ID with proper error handling
    let nextUserId = 1000; // Default starting ID
    try {
      const latestUser = await User.findOne({}, { userId: 1 }).sort({ userId: -1 });
      if (latestUser && typeof latestUser.userId === 'number') {
        nextUserId = latestUser.userId + 1;
      }
    } catch (err) {
      console.error('Error generating userId:', err);
      // Continue with default ID if there's an error
    }

    // Check if request is from admin
    const authHeader = req.headers.authorization;
    let isAdminCreated = false;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      isAdminCreated = decoded.role === 'admin';
    }

    // Create new user
    const newUser = await User.create({
      userId: nextUserId,
      fullName,
      email: lowerEmail,
      password,
      department,
      role: role || 'staff',
      isApproved: isAdminCreated || role === 'admin', // Auto-approve admin users
    });

    console.log('User created successfully:', {
      userId: newUser.userId,
      email: newUser.email,
      role: newUser.role,
      isApproved: newUser.isApproved
    });

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: isAdminCreated || role === 'admin'
        ? 'User created and approved successfully✅✅' 
        : 'Registration successful. Waiting for admin approval⏳',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    console.log('Login attempt details:', { 
      email: lowerEmail,
      passwordLength: password ? password.length : 0 
    });

    // Special handling for admin user
    if (lowerEmail === 'admin@ddu.edu.et') {
      // Check if admin exists
      let admin = await User.findOne({ email: lowerEmail });
      
      // Create admin if doesn't exist
      if (!admin) {
        console.log('Admin user not found. Creating default admin...');
        const latestUser = await User.findOne().sort({ userId: -1 });
        const nextUserId = latestUser ? latestUser.userId + 1 : 1000;
        
        admin = await User.create({
          userId: nextUserId,
          fullName: 'System Admin',
          email: lowerEmail,
          password: 'admin1234',
          role: 'admin',
          department: 'DDU',
          isApproved: true
        });
        console.log('Default admin created successfully');
      }
    }

    // Find user with password
    const user = await User.findOne({ email: lowerEmail }).select('+password');
    
    // Detailed user lookup logging
    if (user) {
      console.log('User found:', {
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    } else {
      console.log('No user found with email:', lowerEmail);
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // Detailed password verification logging
    console.log('Attempting password verification for:', {
      email: user.email,
      inputPasswordLength: password.length,
      storedPasswordLength: user.password.length
    });

    // Use the model's correctPassword method
    const isPasswordCorrect = await user.correctPassword(password);
    console.log('Password verification result:', { 
      isCorrect: isPasswordCorrect,
      email: user.email 
    });

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // For non-admin users, check if they are approved
    if (user.role !== 'admin' && !user.isApproved) {
      console.log('Unapproved user login attempt:', { 
        email: user.email, 
        role: user.role 
      });
      return res.status(401).json({
        status: 'error',
        message: 'Your account is pending admin approval'
      });
    }

    // Generate JWT token with role information
    const token = signToken(user._id, user.role);

    // Remove sensitive data
    user.password = undefined;

    console.log('Login successful:', {
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      tokenGenerated: !!token
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Login error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.'
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'You are not logged in' 
      });
    }

    // Verify token and extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verification:', decoded);

    const user = await User.findById(decoded.id);
    console.log('User found:', user ? {
      id: user._id,
      role: user.role,
      tokenRole: decoded.role
    } : 'No user found');

    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'User no longer exists' 
      });
    }

    // Add user and role to request
    req.user = user;
    req.user.role = decoded.role;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      status: 'error', 
      message: 'Invalid token' 
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('Checking role access:', {
      userRole: req.user.role,
      allowedRoles: roles,
      userId: req.user._id
    });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `This action requires one of these roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

exports.verifyRole = async (req, res) => {
  try {
    // User object is already attached by protect middleware
    const user = req.user;

    // Return role information
    res.status(200).json({
      status: 'success',
      data: {
        userId: user._id,
        role: user.role,
        department: user.department,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Role verification error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
