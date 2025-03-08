const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const DB = process.env.DATABASE_ONLINE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const createAdmin = async () => {
  try {
    await mongoose.connect(DB);
    console.log('DB connection successful');

    const adminData = {
      fullName: 'Admin User',
      email: 'admin@ddu.edu.et',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      isApproved: true,
      department: 'Administration'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    // Create new admin
    await User.create(adminData);
    console.log('Admin user created successfully');
    console.log('Email: admin@ddu.edu.et');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
  process.exit();
};

createAdmin();
