const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  transcription: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    default: 'en'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  metadata: {
    speakers: [{
      id: Number,
      name: String
    }],
    paragraphs: [{
      start: Number,
      end: Number,
      speaker: Number,
      text: String
    }],
    keywords: [String],
    sentiment: String
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
transcriptionSchema.index({ user: 1, createdAt: -1 });
transcriptionSchema.index({ title: 'text', transcription: 'text' });

// Update updatedAt timestamp
// DISABLED: Causing issues with Transcription.create()
// transcriptionSchema.pre('save', function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

const Transcription = mongoose.model('Transcription', transcriptionSchema);
module.exports = Transcription;