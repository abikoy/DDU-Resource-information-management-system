const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Profile routes (available to all authenticated users)
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// Admin only routes
router.use(authController.restrictTo('admin'));

// Get pending and approved users
router.get('/pending', userController.getPendingUsers);
router.get('/approved', userController.getApprovedUsers);

// Approve and reject users
router.patch('/:id/approve', userController.approveUser);
router.delete('/:id', userController.deleteUser);

// User management routes
router.patch('/:id', userController.updateUser); 

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router;
