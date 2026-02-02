const User = require('../models/User');
const emailService = require('../utils/emailService');

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Find user with valid verification token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send confirmation email (non-blocking)
        emailService.sendEmail(
            user.email,
            'Email Verified Successfully!',
            emailService.getVerificationSuccessEmail(user.name)
        ).then(result => {
            if (result.success) {
                console.log('✅ Verification success email sent to:', user.email);
            }
        }).catch(err => {
            console.error('❌ Email service error:', err);
        });

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerificationEmail = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = emailService.generateVerificationToken();
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // Send verification email
        const result = await emailService.sendEmail(
            user.email,
            'Verify Your Email - Speech-to-Text',
            emailService.getWelcomeEmail(user.name, verificationToken)
        );

        if (result.success) {
            console.log('✅ Verification email resent to:', user.email);
            if (result.previewUrl) {
                console.log('📧 Preview:', result.previewUrl);
            }
        }

        res.status(200).json({
            status: 'success',
            message: 'Verification email sent! Please check your inbox.'
        });

    } catch (error) {
        next(error);
    }
};
