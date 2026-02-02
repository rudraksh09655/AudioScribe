const User = require('../models/User');
const Transcription = require('../models/Transcription');
const mongoose = require('mongoose');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const { name, bio } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user.id);

        // Get total transcriptions count
        const totalTranscriptions = await Transcription.countDocuments({ user: req.user.id });

        // Calculate total audio time
        const audioTimeResult = await Transcription.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, totalTime: { $sum: '$duration' } } }
        ]);
        const totalAudioTime = audioTimeResult.length > 0 ? audioTimeResult[0].totalTime : 0;

        // Calculate average accuracy
        const accuracyResult = await Transcription.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
        ]);
        const averageAccuracy = accuracyResult.length > 0 ? accuracyResult[0].avgAccuracy : 0;

        // Find most used language
        const languageResult = await Transcription.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostUsedLanguage = languageResult.length > 0 ? languageResult[0]._id : 'en';

        // Return statistics
        res.status(200).json({
            status: 'success',
            data: {
                totalTranscriptions,
                totalAudioTime,
                averageAccuracy,
                mostUsedLanguage
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user settings
// @route   GET /api/user/settings
// @access  Private
exports.getUserSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: user.settings || {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user settings
// @route   PUT /api/user/settings
// @access  Private
exports.updateUserSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update settings (merge with existing to preserve unmodified fields)
        user.settings = { ...user.settings.toObject(), ...req.body };
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Settings updated successfully',
            data: user.settings
        });
    } catch (error) {
        next(error);
    }
};
