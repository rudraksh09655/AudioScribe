const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ... (Your fields remain exactly the same)
  name: { type: String, required: [true, 'Please provide a name'], trim: true },
  email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Please provide a password'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  bio: { type: String, default: '', maxlength: [500, 'Bio cannot be more than 500 characters'] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  transcriptionsCount: { type: Number, default: 0 },
  totalTranscriptionTime: { type: Number, default: 0 },

  // Email Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },

  settings: {
    // Audio Settings
    defaultLanguage: { type: String, default: 'en' },
    audioQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
    autoSave: { type: Boolean, default: true },

    // Transcription Settings
    speakerDetection: { type: Boolean, default: false },
    timestamps: { type: Boolean, default: true },
    autoPunctuation: { type: Boolean, default: true },

    // Notification Settings
    emailNotifications: { type: Boolean, default: true },
    browserNotifications: { type: Boolean, default: false },

    // Theme Settings
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    accentColor: { type: String, enum: ['blue', 'purple', 'green', 'orange'], default: 'blue' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ FIX 1: Modern Async Pre-save Hook (No next() needed)
userSchema.pre('save', async function () {
  // Update timestamp
  this.updatedAt = Date.now();

  // Hash password if modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;