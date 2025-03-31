const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getAllResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getResourceStats
} = require('../controllers/resourceController');

// Protect all routes after this middleware
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getAllResources);
router.get('/stats/:department', getResourceStats);
router.get('/:id', getResource);

// Routes restricted to DDU and IoT managers
router.use(restrictTo('dduAssetManager', 'iotAssetManager', 'admin'));
router.post('/', createResource);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);

module.exports = router;