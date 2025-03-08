const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/protect');

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/signup', authController.signup); // Allow public signup

// Protected routes that require authentication
router.use(protect);

module.exports = router;
