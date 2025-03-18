const Resource = require('../models/Resource');
const Transfer = require('../models/Transfer');

// Helper function to determine resource type based on description
const determineResourceType = (description, department) => {
  description = description.toLowerCase();
  
  if (department === 'DDU') {
    if (description.includes('furniture') || description.includes('chair') || description.includes('table')) {
      return 'room_furniture';
    } else if (description.includes('software') || description.includes('license')) {
      return 'non-tangible';
    }
    return 'tangible';
  } else if (department === 'IoT') {
    if (description.includes('software') || description.includes('license')) {
      return 'software';
    } else if (description.includes('computer') || description.includes('device') || description.includes('sensor')) {
      return 'equipment';
    }
    return 'it_resources';
  }
  return 'tangible';
};

exports.createResource = async (req, res) => {
  try {
    const {
      expenditureRegistryNo,
      incomingGoodsRegistryNo,
      stockClassification,
      storeNo,
      shelfNo,
      outgoingGoodsRegistryNo,
      orderNo,
      dateOf,
      items,
      department
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one item is required'
      });
    }

    // Process each item and create resources
    const resources = await Promise.all(items.map(async (item) => {
      // Calculate prices
      const quantity = parseFloat(item.quantity);
      const unitPriceBirr = parseFloat(item.unitPriceBirr || '0');
      const unitPriceCents = parseFloat(item.unitPriceCents || '0');
      const unitPrice = unitPriceBirr + (unitPriceCents / 100);
      const totalPrice = quantity * unitPrice;

      if (isNaN(quantity) || isNaN(unitPrice) || isNaN(totalPrice)) {
        throw new Error('Invalid numeric values provided for quantity or prices');
      }

      // Create the resource
      return await Resource.create({
        department: department.toUpperCase(),
        registryInfo: {
          expenditureRegistryNo,
          incomingGoodsRegistryNo,
          stockClassification,
          storeNo,
          shelfNo,
          outgoingGoodsRegistryNo,
          orderNo,
          dateOf: new Date(dateOf)
        },
        description: item.description,
        model: item.model || '',
        serial: item.serial || '',
        fromNo: item.fromNo || '',
        toNo: item.toNo || '',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        remarks: item.remarks || '',
        resourceType: determineResourceType(item.description, department),
        registeredBy: req.user._id,
        status: 'active'
      });
    }));

    console.log('Resources created:', {
      count: resources.length,
      department: department,
      registeredBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Error creating resource'
    });
  }
};

exports.createDDUResource = async (req, res) => {
  try {
    if (req.user.department !== 'DDU') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only register DDU resources'
      });
    }
    req.body.department = 'DDU';
    await exports.createResource(req, res);
  } catch (error) {
    console.error('DDU resource creation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.createIoTResource = async (req, res) => {
  try {
    if (req.user.department !== 'IoT') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only register IoT resources'
      });
    }
    req.body.department = 'IoT';
    await exports.createResource(req, res);
  } catch (error) {
    console.error('IoT resource creation error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('registeredBy', 'fullName email department');

    res.status(200).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getDDUResources = async (req, res) => {
  try {
    const resources = await Resource.find({ department: 'DDU' })
      .populate('registeredBy', 'fullName email department');

    res.status(200).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getIoTResources = async (req, res) => {
  try {
    const resources = await Resource.find({ department: 'IoT' })
      .populate('registeredBy', 'fullName email department');

    res.status(200).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('registeredBy', 'fullName email department');

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
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to update this resource
    if (req.user.role !== 'admin' && resource.department !== req.user.department) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update resources in your department'
      });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('registeredBy', 'fullName email department');

    res.status(200).json({
      status: 'success',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to delete this resource
    if (req.user.role !== 'admin' && resource.department !== req.user.department) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete resources in your department'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.transferResource = async (req, res) => {
  try {
    const { recipientId, reason } = req.body;
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if user has permission to transfer this resource
    if (resource.department !== req.user.department) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only transfer resources from your department'
      });
    }

    const transfer = await Transfer.create({
      resource: resourceId,
      from: req.user._id,
      to: recipientId,
      reason,
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: {
        transfer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
