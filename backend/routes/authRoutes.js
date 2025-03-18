const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(authController.protect);

// Role verification route
router.get('/verify-role', authController.verifyRole);

// Admin only routes
router.use('/admin', authController.restrictTo('admin'));

module.exports = router;
