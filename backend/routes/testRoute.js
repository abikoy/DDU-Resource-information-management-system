const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/test-db', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        console.log('Found users:', users);
        res.json({ 
            status: 'success',
            message: 'Database connection successful',
            userCount: users.length,
            roles: users.map(u => u.role)
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

module.exports = router;
