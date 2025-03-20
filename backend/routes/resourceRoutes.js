const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createResource,
  getAllResources,
  getIoTStats,
  getDDUStats
} = require('../controllers/resourceController');

// Resource registration routes
router.post('/', protect, createResource);

// Get all resources
router.get('/', protect, getAllResources);

// Get department stats
router.get('/stats/iot', protect, getIoTStats);
router.get('/stats/ddu', protect, getDDUStats);

module.exports = router;
