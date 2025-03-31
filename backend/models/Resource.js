const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['DDU', 'IoT']
  },
  assetName: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  assetType: {
    type: String,
    required: [true, 'Asset type is required'],
    enum: ['Consumable', 'Non-Consumable']
  },
  assetClass: {
    type: String,
    required: [true, 'Asset class is required'],
    validate: {
      validator: function(value) {
        const consumableTypes = [
          'Office Supplies',
          'Lab Supplies',
          'Cleaning Supplies',
          'Medical Supplies',
          'IT Supplies'
        ];
        const nonConsumableTypes = [
          'Technology',
          'Furniture',
          'Laboratory Equipment',
          'Library Resources',
          'Facilities and Infrastructure'
        ];
        
        if (this.assetType === 'Consumable') {
          return consumableTypes.includes(value);
        } else {
          return nonConsumableTypes.includes(value);
        }
      },
      message: props => `${props.value} is not a valid asset class for the selected asset type`
    }
  },
  assetModel: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Not Assigned', 'Assigned', 'In Maintenance', 'Retired'],
    default: 'Not Assigned'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be greater than 0']
  },
  unitPrice: {
    birr: {
      type: Number,
      required: [true, 'Unit price (Birr) is required'],
      min: [0, 'Unit price cannot be negative']
    },
    cents: {
      type: Number,
      required: [true, 'Unit price (Cents) is required'],
      min: [0, 'Cents cannot be negative'],
      max: [99, 'Cents cannot be more than 99']
    }
  },
  totalPrice: {
    birr: {
      type: Number,
      required: true
    },
    cents: {
      type: Number,
      required: true,
      min: 0,
      max: 99
    }
  },
  registryInfo: {
    expenditureRegistryNo: {
      type: String,
      trim: true
    },
    incomingGoodsRegistryNo: {
      type: String,
      trim: true
    },
    stockClassification: {
      type: String,
      trim: true
    },
    storeNo: {
      type: String,
      trim: true
    },
    shelfNo: {
      type: String,
      trim: true
    },
    outgoingGoodsRegistryNo: {
      type: String,
      trim: true
    },
    orderNo: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    },
    storeKeeperName: {
      type: String,
      trim: true
    },
    storeKeeperSignDate: {
      type: Date
    },
    recipientName: {
      type: String,
      trim: true
    },
    recipientSignDate: {
      type: Date
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total price before saving
resourceSchema.pre('save', function(next) {
  const totalBirr = this.quantity * this.unitPrice.birr;
  const totalCents = this.quantity * this.unitPrice.cents;
  
  // Convert excess cents to birr
  const extraBirr = Math.floor(totalCents / 100);
  const remainingCents = totalCents % 100;
  
  this.totalPrice = {
    birr: totalBirr + extraBirr,
    cents: remainingCents
  };
  
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;