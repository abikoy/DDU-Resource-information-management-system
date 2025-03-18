const mongoose = require('mongoose');
const User = require('../models/User');

const verifyUsers = async () => {
  try {
    // Connect to MongoDB Atlas
    const dbUrl = 'mongodb+srv://mydb:abcd1234@cluster0.l8qjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Find all users
    const users = await User.find().select('+password');
    
    console.log('\nExisting users in database:');
    users.forEach(user => {
      console.log({
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: user.isApproved,
        userId: user.userId,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyUsers();
