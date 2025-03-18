const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  department: {
    type: String,
    enum: ['DDU', 'IoT'],
    required: [true, 'Department is required']
  },
  registryInfo: {
    expenditureRegistryNo: {
      type: String,
      required: [true, 'Expenditure registry number is required']
    },
    incomingGoodsRegistryNo: {
      type: String,
      required: [true, 'Incoming goods registry number is required']
    },
    stockClassification: {
      type: String,
      required: [true, 'Stock classification is required']
    },
    storeNo: {
      type: String,
      required: [true, 'Store number is required']
    },
    shelfNo: {
      type: String,
      required: [true, 'Shelf number is required']
    },
    outgoingGoodsRegistryNo: {
      type: String,
      required: [true, 'Outgoing goods registry number is required']
    },
    orderNo: {
      type: String,
      required: [true, 'Order number is required']
    },
    dateOf: {
      type: Date,
      required: [true, 'Date is required']
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  model: {
    type: String,
    default: ''
  },
  serial: {
    type: String,
    default: ''
  },
  fromNo: {
    type: String,
    default: ''
  },
  toNo: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  remarks: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    enum: ['room_furniture', 'equipment', 'software', 'office_supplies', 'it_resources'],
    required: [true, 'Resource type is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'disposed'],
    default: 'active'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Registered by user is required']
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to format data
resourceSchema.pre('save', function(next) {
  // Convert department to proper case
  if (this.department) {
    if (this.department.toLowerCase() === 'ddu') {
      this.department = 'DDU';
    } else if (this.department.toLowerCase() === 'iot') {
      this.department = 'IoT';
    }
  }

  // Calculate total price if not set
  if (this.quantity && this.unitPrice && !this.totalPrice) {
    this.totalPrice = this.quantity * this.unitPrice;
  }

  next();
});

// Virtual for formatted prices
resourceSchema.virtual('formattedUnitPrice').get(function() {
  if (!this.unitPrice) return { birr: 0, cents: 0 };
  const birr = Math.floor(this.unitPrice);
  const cents = Math.round((this.unitPrice - birr) * 100);
  return { birr, cents };
});

resourceSchema.virtual('formattedTotalPrice').get(function() {
  if (!this.totalPrice) return { birr: 0, cents: 0 };
  const birr = Math.floor(this.totalPrice);
  const cents = Math.round((this.totalPrice - birr) * 100);
  return { birr, cents };
});

// Enable virtuals in JSON
resourceSchema.set('toJSON', { virtuals: true });
resourceSchema.set('toObject', { virtuals: true });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
