const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { verifyEmail, resendVerificationEmail } = require('../controllers/verificationController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (require authentication)
router.get('/me', authMiddleware, authController.getMe);
router.put('/settings', authMiddleware, authController.updateSettings);
router.post('/resend-verification', authMiddleware, resendVerificationEmail);
router.delete('/delete', authMiddleware, authController.deleteUser);
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;