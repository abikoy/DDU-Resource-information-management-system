const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to database'));

async function resetAdminPassword() {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash('admin1234', 12);
    
    // Update admin user password
    const result = await User.findOneAndUpdate(
      { email: 'admin@ddu.edu.et' },
      { 
        $set: { 
          password: hashedPassword,
          isApproved: true,
          role: 'admin'
        } 
      },
      { new: true }
    );

    if (result) {
      console.log('Admin password reset successfully');
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetAdminPassword();
