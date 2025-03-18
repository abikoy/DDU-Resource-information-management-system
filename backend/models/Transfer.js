const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Resource is required']
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transfer source is required']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Transfer recipient is required']
  },
  reason: {
    type: String,
    required: [true, 'Transfer reason is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to validate departments
transferSchema.pre('save', async function(next) {
  try {
    await this.populate([
      { path: 'resource', select: 'department' },
      { path: 'from', select: 'department role' },
      { path: 'to', select: 'department role' }
    ]);

    // Ensure the sender is from the resource's department
    if (this.from.department !== this.resource.department) {
      throw new Error('Transfer source must be from the same department as the resource');
    }

    // Update timestamps
    this.updatedAt = new Date();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update resource status when transfer is completed
transferSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const Resource = mongoose.model('Resource');
    await Resource.findByIdAndUpdate(doc.resource, {
      department: doc.to.department,
      updatedAt: new Date()
    });
  }
});

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;