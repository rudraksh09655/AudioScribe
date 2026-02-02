const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    getUserProfile,
    updateUserProfile,
    getUserStats,
    getUserSettings,
    updateUserSettings
} = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Statistics route
router.get('/stats', getUserStats);

// Settings routes
router.get('/settings', getUserSettings);
router.put('/settings', updateUserSettings);

module.exports = router;
