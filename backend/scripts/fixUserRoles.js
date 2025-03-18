const mongoose = require('mongoose');
const User = require('../models/User');

const fixUserRoles = async () => {
  try {
    // Connect to MongoDB Atlas
    const dbUrl = 'mongodb+srv://mydb:abcd1234@cluster0.l8qjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Update assetManager to proper role based on department
    const assetManagers = await User.find({ role: 'assetManager' });
    console.log(`Found ${assetManagers.length} users with old assetManager role`);

    for (const user of assetManagers) {
      // Determine the correct role based on department
      let newRole;
      if (user.department.toLowerCase().includes('iot')) {
        newRole = 'iotAssetManager';
      } else {
        newRole = 'dduAssetManager';
      }

      // Update the user's role
      user.role = newRole;
      await user.save({ validateBeforeSave: false });
      console.log(`Updated ${user.email} role from assetManager to ${newRole}`);
    }

    // List all users with their current roles
    const allUsers = await User.find();
    console.log('\nCurrent user roles:');
    allUsers.forEach(user => {
      console.log({
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: user.isApproved
      });
    });

    console.log('\nRole update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUserRoles();
