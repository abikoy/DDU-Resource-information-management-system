const Resource = require('../models/Resource');

exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    let query = Resource.find().populate('assignedTo', 'fullName email');
    
    // If user is staff, only show their assigned resources
    if (req.user.role === 'staff') {
      query = query.find({ assignedTo: req.user._id });
    }

    const resources = await query;

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

exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check if staff member has access to this resource
    if (req.user.role === 'staff' && 
        resource.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this resource'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.transferResource = async (req, res) => {
  try {
    const { newAssigneeId } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Verify current user owns the resource or is admin/asset manager
    if (req.user.role === 'staff' && 
        resource.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to transfer this resource'
      });
    }

    resource.assignedTo = newAssigneeId;
    await resource.save();

    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
