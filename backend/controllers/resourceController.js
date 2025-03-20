const Resource = require('../models/Resource');
const Transfer = require('../models/Transfer');

const VALID_DEPARTMENTS = ['DDU', 'IoT'];
const VALID_RESOURCE_TYPES = ['room_furniture', 'equipment', 'software', 'office_supplies', 'it_resources'];

exports.createResource = async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const {
      department,
      assetName,
      serialNumber,
      assetClass,
      assetType,
      assetModel,
      quantity,
      unitPrice,
      totalPrice,
      location,
      remarks,
      registryInfo
    } = req.body;

    // Validate department
    if (!department || !VALID_DEPARTMENTS.includes(department)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`
      });
    }

    // Validate required fields
    if (!assetName) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset name is required'
      });
    }

    if (!assetClass) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset class is required'
      });
    }

    if (!assetType) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset type is required'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1'
      });
    }

    if (!unitPrice || !unitPrice.birr || unitPrice.birr < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Unit price (Birr) must be provided and non-negative'
      });
    }

    // Validate registry info
    if (!registryInfo) {
      return res.status(400).json({
        status: 'error',
        message: 'Registry information is required'
      });
    }

    const requiredRegistryFields = [
      'expenditureRegistryNo',
      'incomingGoodsRegistryNo',
      'stockClassification',
      'storeNo',
      'shelfNo',
      'outgoingGoodsRegistryNo',
      'orderNo',
      'dateOf'
    ];

    for (const field of requiredRegistryFields) {
      if (!registryInfo[field]) {
        return res.status(400).json({
          status: 'error',
          message: `Registry information: ${field} is required`
        });
      }
    }

    // Create the resource
    const resourceData = {
      department,
      assetName,
      serialNumber: serialNumber || '',
      assetClass,
      assetType,
      assetModel: assetModel || '',
      quantity: parseInt(quantity),
      unitPrice,
      totalPrice: totalPrice || {
        birr: quantity * (unitPrice.birr || 0),
        cents: quantity * (unitPrice.cents || 0)
      },
      location: location || 'In Office',
      remarks: remarks || '',
      registryInfo,
      registeredBy: req.user._id,
      status: 'Not Assigned'
    };

    console.log('Creating resource with data:', JSON.stringify(resourceData, null, 2));

    const resource = await Resource.create(resourceData);

    console.log('Created resource:', JSON.stringify(resource, null, 2));

    res.status(201).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    
    // Check for validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check for duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 'error',
        message: `This ${field} is already in use`
      });
    }

    res.status(400).json({
      status: 'error',
      message: error.message || 'Error creating resource'
    });
  }
};

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .populate('registeredBy', 'name');

    res.status(200).json({
      status: 'success',
      results: resources.length,
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get resource stats for IoT department
exports.getIoTStats = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      { $match: { department: 'IoT' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { 
            $sum: { 
              $add: [
                { $multiply: ['$quantity', '$unitPrice.birr'] },
                { $multiply: ['$quantity', { $divide: ['$unitPrice.cents', 100] }] }
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get resource stats for DDU department
exports.getDDUStats = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      { $match: { department: 'DDU' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { 
            $sum: { 
              $add: [
                { $multiply: ['$quantity', '$unitPrice.birr'] },
                { $multiply: ['$quantity', { $divide: ['$unitPrice.cents', 100] }] }
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
