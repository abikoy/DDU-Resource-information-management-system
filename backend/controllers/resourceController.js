const Resource = require('../models/Resource');
const Transfer = require('../models/Transfer');

const VALID_DEPARTMENTS = ['DDU', 'IoT'];
const VALID_RESOURCE_TYPES = ['room_furniture', 'equipment', 'software', 'office_supplies', 'it_resources'];

// Get all resources
exports.getAllResources = async (req, res) => {
  try {
    // Build query based on user role and department
    let query = {};
    
    // Map user roles to departments
    const departmentMap = {
      'dduAssetManager': 'DDU',
      'iotAssetManager': 'IoT'
    };

    // If user is not admin, filter by their department
    if (req.user.role !== 'admin') {
      const userDepartment = departmentMap[req.user.role];
      if (!userDepartment) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid user role or department mapping'
        });
      }
      query.department = userDepartment;
    }

    console.log('Fetching resources with query:', {
      userRole: req.user.role,
      userDepartment: req.user.department,
      mappedDepartment: query.department,
      query
    });

    // First check if any resources exist at all
    const totalCount = await Resource.countDocuments({});
    console.log('Total resources in database:', totalCount);

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .select('-__v')
      .populate('createdBy', 'name email');

    console.log('Found resources:', {
      count: resources.length,
      resources: resources.map(r => ({
        id: r._id,
        department: r.department,
        assetName: r.assetName,
        assetType: r.assetType
      }))
    });

    res.status(200).json({
      status: 'success',
      results: resources.length,
      data: {
        resources
      }
    });
  } catch (error) {
    console.error('Error in getAllResources:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching resources'
    });
  }
};

// Get a single resource
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Error in getResource:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching resource'
    });
  }
};

// Create a new resource
exports.createResource = async (req, res) => {
  try {
    console.log('Create resource request:', {
      user: {
        id: req.user._id,
        role: req.user.role,
        department: req.user.department
      },
      body: req.body
    });

    // Check if user has permission to create resources
    const isAssetManager = req.user.role.includes('assetmanager');
    const isStoreKeeper = req.user.role.includes('storekeeper');
    
    if (!isAssetManager && !isStoreKeeper) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to create resources'
      });
    }

    // Validate department
    const requestDepartment = (req.body.department || '').toUpperCase();
    const userDepartment = req.user.department;

    if (!VALID_DEPARTMENTS.includes(requestDepartment)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}`
      });
    }

    if (requestDepartment !== userDepartment) {
      return res.status(403).json({
        status: 'error',
        message: `You can only create resources for ${userDepartment} department`
      });
    }

    // Validate price fields
    const unitPrice = req.body.unitPrice || {};
    const birr = parseInt(unitPrice.birr) || 0;
    const cents = parseInt(unitPrice.cents) || 0;

    if (cents < 0 || cents > 99) {
      return res.status(400).json({
        status: 'error',
        message: 'Cents must be between 0 and 99'
      });
    }

    if (birr < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price cannot be negative'
      });
    }

    // Format dates
    const registryInfo = req.body.registryInfo || {};
    const formattedRegistryInfo = {
      ...registryInfo,
      date: registryInfo.date ? new Date(registryInfo.date) : new Date(),
      storeKeeperSignDate: registryInfo.storeKeeperSignDate ? new Date(registryInfo.storeKeeperSignDate) : new Date(),
      recipientSignDate: registryInfo.recipientSignDate ? new Date(registryInfo.recipientSignDate) : new Date()
    };

    // Prepare resource data
    const resourceData = {
      ...req.body,
      department: userDepartment,
      status: req.body.status || 'Not Assigned',
      unitPrice: {
        birr,
        cents
      },
      registryInfo: formattedRegistryInfo,
      createdBy: req.user._id
    };

    // Create resource
    const resource = await Resource.create(resourceData);

    console.log('Resource created successfully:', {
      id: resource._id,
      department: resource.department,
      assetName: resource.assetName,
      totalPrice: resource.totalPrice
    });

    res.status(201).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Error in createResource:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid resource data',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'A resource with this serial number already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating resource'
    });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    // Map user roles to departments
    const departmentMap = {
      'dduAssetManager': 'DDU',
      'iotAssetManager': 'IoT'
    };

    const userDepartment = departmentMap[req.user.role];
    if (!userDepartment) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user role or department mapping'
      });
    }

    // Find the resource first
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to update this resource
    if (resource.department !== userDepartment) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update resources from your own department'
      });
    }

    // Format dates if present
    const registryInfo = req.body.registryInfo || {};
    const formattedRegistryInfo = {
      ...registryInfo,
      date: registryInfo.date ? new Date(registryInfo.date) : resource.registryInfo?.date,
      storeKeeperSignDate: registryInfo.storeKeeperSignDate ? new Date(registryInfo.storeKeeperSignDate) : resource.registryInfo?.storeKeeperSignDate,
      recipientSignDate: registryInfo.recipientSignDate ? new Date(registryInfo.recipientSignDate) : resource.registryInfo?.recipientSignDate
    };

    // Format price fields
    const unitPrice = req.body.unitPrice || resource.unitPrice;
    const birr = parseInt(unitPrice.birr) || 0;
    const cents = parseInt(unitPrice.cents) || 0;

    if (cents < 0 || cents > 99) {
      return res.status(400).json({
        status: 'error',
        message: 'Cents must be between 0 and 99'
      });
    }

    if (birr < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price cannot be negative'
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      department: resource.department, // Keep original department
      unitPrice: {
        birr,
        cents
      },
      registryInfo: formattedRegistryInfo
    };

    // Calculate total price
    const quantity = parseInt(updateData.quantity) || resource.quantity;
    const totalInCents = (birr * 100 + cents) * quantity;
    updateData.totalPrice = {
      birr: Math.floor(totalInCents / 100),
      cents: totalInCents % 100
    };

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    console.log('Resource updated:', {
      id: updatedResource._id,
      department: updatedResource.department,
      assetName: updatedResource.assetName,
      assetType: updatedResource.assetType,
      status: updatedResource.status,
      totalPrice: updatedResource.totalPrice
    });

    res.status(200).json({
      status: 'success',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    console.error('Error in updateResource:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid resource data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'A resource with this serial number already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Error updating resource'
    });
  }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
  try {
    // Map user roles to departments
    const departmentMap = {
      'dduAssetManager': 'DDU',
      'iotAssetManager': 'IoT'
    };

    const userDepartment = departmentMap[req.user.role];
    if (!userDepartment) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user role or department mapping'
      });
    }

    // Find the resource first
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to delete this resource
    if (resource.department !== userDepartment) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete resources from your own department'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteResource:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting resource'
    });
  }
};

// Get resource stats for a specific department
exports.getResourceStats = async (req, res) => {
  try {
    const { department } = req.params;
    const upperDepartment = department.toUpperCase();

    // Validate department
    if (!['DDU', 'IOT'].includes(upperDepartment)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid department specified'
      });
    }

    // Check if user has permission to access this department's stats
    const userRole = req.user.role.toLowerCase();
    const userDepartment = req.user.department?.toUpperCase();
    
    if (userRole !== 'admin' && userDepartment !== upperDepartment) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access these statistics'
      });
    }

    // Get resources for the specified department
    const resources = await Resource.find({ department: upperDepartment });

    // Calculate stats
    const stats = {
      totalResources: resources.length,
      totalValue: resources.reduce((acc, curr) => acc + (curr.unitPrice.birr * curr.quantity + curr.unitPrice.cents * curr.quantity / 100), 0),
      byType: {},
      byStatus: {}
    };

    // Group by resource type
    resources.forEach(resource => {
      if (!stats.byType[resource.resourceType]) {
        stats.byType[resource.resourceType] = {
          count: 0,
          value: 0
        };
      }
      stats.byType[resource.resourceType].count++;
      stats.byType[resource.resourceType].value += resource.unitPrice.birr * resource.quantity + resource.unitPrice.cents * resource.quantity / 100;
    });

    // Group by status
    resources.forEach(resource => {
      if (!stats.byStatus[resource.status]) {
        stats.byStatus[resource.status] = {
          count: 0,
          value: 0
        };
      }
      stats.byStatus[resource.status].count++;
      stats.byStatus[resource.status].value += resource.unitPrice.birr * resource.quantity + resource.unitPrice.cents * resource.quantity / 100;
    });

    res.status(200).json({
      status: 'success',
      data: {
        department: upperDepartment,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting resource stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting resource statistics'
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
