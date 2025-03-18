const mongoose = require('mongoose');
const User = require('../models/User');

const fixUserIds = async () => {
  try {
    // Connect to MongoDB Atlas
    const dbUrl = 'mongodb+srv://mydb:abcd1234@cluster0.l8qjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Find all users without userId
    const users = await User.find({ userId: { $exists: false } });
    console.log(`Found ${users.length} users without userId`);

    // Update each user with a new userId starting from 1000
    let nextUserId = 1000;
    for (const user of users) {
      user.userId = nextUserId++;
      await user.save({ validateBeforeSave: false }); // Skip validation for this update
      console.log(`Updated ${user.email} with userId: ${user.userId}`);
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUserIds();
