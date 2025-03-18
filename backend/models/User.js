const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: [true, 'Please provide a user ID'],
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Please provide your full name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return v.endsWith('@ddu.edu.et');
      },
      message: 'Please use your DDU email address (@ddu.edu.et)'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'dduAssetManager', 'iotAssetManager', 'staff', 'assetManager'],
    default: 'staff'
  },
  department: {
    type: String,
    required: [true, 'Please provide your department']
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Use a consistent salt rounds value of 12
    const salt = 12;
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully for:', this.email);
  } catch (error) {
    console.error('Error hashing password:', error);
    return next(error);
  }
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error('No password found for user:', this.email);
      return false;
    }

    // Log password details for debugging
    console.log('Password check:', {
      email: this.email,
      hashedPasswordLength: this.password.length,
      candidatePasswordLength: candidatePassword.length
    });

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    console.log('Password verification result:', {
      email: this.email,
      isMatch,
      passwordExists: !!this.password
    });

    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', {
      error: error.message,
      email: this.email
    });
    return false;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
