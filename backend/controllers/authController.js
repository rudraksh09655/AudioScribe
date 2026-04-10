const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    // Create user (password is hashed by User model pre-save hook)
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        transcriptionsCount: user.transcriptionsCount,
        settings: user.settings
      }
    });

  } catch (error) {
    // Better error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Update last login
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        transcriptionsCount: user.transcriptionsCount,
        settings: user.settings
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update settings
    user.settings = { ...user.settings, ...settings };
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully',
      settings: user.settings
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token (optional)
// @route   POST /api/auth/refresh-token
// @access  Private
exports.refreshToken = async (req, res, next) => {
  try {
    // If you want to implement token refresh later
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const newToken = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};