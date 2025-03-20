const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['DDU', 'IoT']
  },
  assetName: {
    type: String,
    required: [true, 'Asset name is required']
  },
  serialNumber: {
    type: String,
    trim: true
  },
  assetClass: {
    type: String,
    required: [true, 'Asset class is required'],
    enum: {
      values: [
        'Furniture',
        'IT Resources',
        'Laboratory Equipment',
        'Office Equipment',
        'Teaching Materials',
        'Library Resources',
        'Sports Equipment',
        'Audio/Visual Equipment',
        'Research Equipment',
        'Software Licenses',
        'Network Infrastructure',
        'Security Equipment',
        'Maintenance Tools',
        'Medical Equipment',
        'Other Resources'
      ],
      message: '{VALUE} is not a valid asset class'
    }
  },
  assetType: {
    type: String,
    required: [true, 'Asset type is required'],
    enum: {
      values: ['Tangible', 'Intangible'],
      message: '{VALUE} is not a valid asset type'
    }
  },
  assetModel: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    birr: {
      type: Number,
      required: [true, 'Unit price (Birr) is required'],
      min: [0, 'Unit price cannot be negative']
    },
    cents: {
      type: Number,
      default: 0,
      min: [0, 'Cents cannot be negative'],
      max: [99, 'Cents must be less than 100']
    }
  },
  totalPrice: {
    birr: {
      type: Number,
      required: [true, 'Total price (Birr) is required'],
      min: [0, 'Total price cannot be negative']
    },
    cents: {
      type: Number,
      default: 0,
      min: [0, 'Cents cannot be negative'],
      max: [99, 'Cents must be less than 100']
    }
  },
  location: {
    type: String,
    default: 'In Office'
  },
  status: {
    type: String,
    enum: ['Not Assigned', 'Assigned', 'Damaged', 'Archived'],
    default: 'Not Assigned'
  },
  remarks: String,
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
    },
    storeKeeperSignature: {
      name: {
        type: String,
        required: [true, 'Store keeper name is required']
      },
      date: {
        type: Date,
        required: [true, 'Store keeper signature date is required']
      }
    },
    recipientSignature: {
      name: {
        type: String,
        required: [true, 'Recipient name is required']
      },
      date: {
        type: Date,
        required: [true, 'Recipient signature date is required']
      }
    }
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for unique asset identification
resourceSchema.index({ department: 1, serialNumber: 1 }, { unique: true, sparse: true });

// Virtual for formatted price
resourceSchema.virtual('formattedUnitPrice').get(function() {
  return `${this.unitPrice.birr}.${this.unitPrice.cents.toString().padStart(2, '0')} Birr`;
});

resourceSchema.virtual('formattedTotalPrice').get(function() {
  return `${this.totalPrice.birr}.${this.totalPrice.cents.toString().padStart(2, '0')} Birr`;
});

// Auto-generate total price before saving
resourceSchema.pre('save', async function(next) {
  // Calculate total price
  const unitPriceTotal = this.unitPrice.birr + (this.unitPrice.cents / 100);
  const totalPriceValue = unitPriceTotal * this.quantity;
  
  this.totalPrice.birr = Math.floor(totalPriceValue);
  this.totalPrice.cents = Math.round((totalPriceValue % 1) * 100);

  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
