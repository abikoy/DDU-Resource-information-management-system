const express = require('express');
const resourceController = require('../controllers/resourceController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(resourceController.getAllResources)
  .post(
    authController.restrictTo('admin', 'assetManager'),
    resourceController.createResource
  );

router
  .route('/:id')
  .get(resourceController.getResource)
  .patch(
    authController.restrictTo('admin', 'assetManager'),
    resourceController.updateResource
  )
  .delete(
    authController.restrictTo('admin', 'assetManager'),
    resourceController.deleteResource
  );

router
  .route('/:id/transfer')
  .post(resourceController.transferResource);

module.exports = router;
