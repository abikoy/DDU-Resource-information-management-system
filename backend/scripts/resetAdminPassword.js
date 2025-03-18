const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const resetAdminPassword = async () => {
  try {
    // Connect to database
    const dbUrl = 'mongodb+srv://mydb:abcd1234@cluster0.l8qjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(dbUrl);
    console.log('Database connection successful');

    // Find the latest userId
    const latestUser = await User.findOne().sort({ userId: -1 });
    const nextUserId = latestUser ? latestUser.userId + 1 : 1000;

    // Find admin user
    let admin = await User.findOne({ email: 'admin@ddu.edu.et' });
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin with all required fields
      admin = await User.create({
        userId: nextUserId,
        fullName: 'System Admin',
        email: 'admin@ddu.edu.et',
        password: 'admin1234', // Will be hashed by the pre-save middleware
        role: 'admin',
        department: 'DDU',
        isApproved: true
      });
      
      console.log('New admin user created successfully:', {
        email: admin.email,
        userId: admin.userId,
        role: admin.role,
        isApproved: admin.isApproved
      });
    } else {
      // Update existing admin's password
      admin.password = 'admin1234'; // Will be hashed by the pre-save middleware
      await admin.save();
      
      console.log('Admin password updated successfully:', {
        email: admin.email,
        userId: admin.userId,
        role: admin.role,
        isApproved: admin.isApproved
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
