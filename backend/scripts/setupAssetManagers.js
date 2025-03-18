const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful'));

const assetManagers = [
  {
    userId: 1001,
    fullName: 'DDU Asset Manager',
    email: 'ddu.asset@ddu.edu.et',
    password: 'password123',
    department: 'DDU',
    role: 'dduAssetManager',
    isApproved: true
  },
  {
    userId: 1002,
    fullName: 'IoT Asset Manager',
    email: 'iot.asset@ddu.edu.et',
    password: 'password123',
    department: 'IoT',
    role: 'iotAssetManager',
    isApproved: true
  }
];

const setupAssetManagers = async () => {
  try {
    for (const manager of assetManagers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: manager.email });
      if (!existingUser) {
        await User.create(manager);
        console.log(`Created ${manager.role} with email ${manager.email}`);
      } else {
        console.log(`${manager.role} already exists`);
      }
    }
  } catch (error) {
    console.error('Error setting up asset managers:', error);
  } finally {
    mongoose.connection.close();
  }
};

setupAssetManagers();