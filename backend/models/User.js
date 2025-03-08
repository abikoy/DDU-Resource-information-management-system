const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
      validator: function(value) {
        return value.endsWith('@ddu.edu.et');
      },
      message: 'Email must be a valid DDU email address (@ddu.edu.et)'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // This ensures password isn't returned by default
  },
  department: {
    type: String,
    required: [true, 'Please provide your department']
  },
  role: {
    type: String,
    enum: ['admin', 'assetManager', 'staff'],
    default: 'staff'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  registeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to handle email case and trimming
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  console.log('Pre-save middleware running...');
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing');
    return next();
  }

  try {
    console.log('Hashing password...');
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Pre-update middleware to hash password if it's being updated
userSchema.pre('findOneAndUpdate', async function(next) {
  console.log('Pre-update middleware running...');
  const update = this.getUpdate();
  
  // If password is being updated
  if (update.password && !update.password.startsWith('$2a$')) {
    try {
      console.log('Hashing updated password...');
      update.password = await bcrypt.hash(update.password, 12);
      console.log('Updated password hashed successfully');
    } catch (error) {
      console.error('Error hashing updated password:', error);
      return next(error);
    }
  } else {
    console.log('Password not being updated or already hashed');
  }
  
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword) {
  console.log('Checking password...');
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
