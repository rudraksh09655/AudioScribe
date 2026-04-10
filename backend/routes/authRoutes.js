const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getMe);
router.put('/settings', authMiddleware, authController.updateSettings);
router.delete('/delete', authMiddleware, authController.deleteUser);
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;