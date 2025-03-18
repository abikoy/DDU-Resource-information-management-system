const express = require('express');
const resourceController = require('../controllers/resourceController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Department-specific routes
router.get('/ddu', 
  authController.restrictTo('dduAssetManager', 'admin'),
  resourceController.getDDUResources
);

router.get('/iot', 
  authController.restrictTo('iotAssetManager', 'admin'),
  resourceController.getIoTResources
);

// Resource registration routes
router.post('/register/ddu',
  authController.restrictTo('dduAssetManager'),
  resourceController.createDDUResource
);

router.post('/register/iot',
  authController.restrictTo('iotAssetManager'),
  resourceController.createIoTResource
);

// General resource routes with role-based access
router.route('/')
  .get(resourceController.getAllResources)
  .post(
    authController.restrictTo('dduAssetManager', 'iotAssetManager', 'admin'),
    resourceController.createResource
  );

router.route('/:id')
  .get(resourceController.getResource)
  .patch(
    authController.restrictTo('dduAssetManager', 'iotAssetManager', 'admin'),
    resourceController.updateResource
  )
  .delete(
    authController.restrictTo('dduAssetManager', 'iotAssetManager', 'admin'),
    resourceController.deleteResource
  );

// Transfer routes
router.post('/:id/transfer',
  authController.restrictTo('dduAssetManager', 'iotAssetManager'),
  resourceController.transferResource
);

module.exports = router;
