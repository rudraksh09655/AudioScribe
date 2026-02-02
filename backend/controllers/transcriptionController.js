const Transcription = require('../models/Transcription');
const User = require('../models/User');
const deepgramService = require('../utils/deepgram');
const { upload, cleanupOldFiles } = require('../utils/fileUpload');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose'); // Added for stats

// @desc    Transcribe audio file
// @route   POST /api/transcriptions/transcribe
// @access  Private
exports.transcribeAudio = async (req, res, next) => {
  try {
    // Handle file upload
    const uploadMiddleware = upload.single('audio');

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error('Upload Error:', err); // Debug log
        return res.status(400).json({
          status: 'error',
          message: err.message,
          error: err.toString() // Send back specific error info
        });
      }

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'No audio file uploaded'
        });
      }

      try {
        const { title, language } = req.body;
        const userId = req.user.id;

        console.log(`📁 Processing file: ${req.file.originalname}`);

        // Read the audio file
        const audioBuffer = fs.readFileSync(req.file.path);

        // Transcribe using Deepgram with NEW syntax
        const transcriptionResult = await deepgramService.transcribeAudio(
          audioBuffer, // Pass buffer instead of path
          {
            language: language || 'en',
            mimetype: req.file.mimetype
          }
        );

        if (!transcriptionResult.success) {
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          return res.status(500).json({
            status: 'error',
            message: 'Transcription failed',
            error: transcriptionResult.error,
            // Fallback transcript if available
            transcript: transcriptionResult.transcript || ''
          });
        }

        // Calculate word count and duration
        const transcriptText = transcriptionResult.transcript || transcriptionResult.transcription;
        const wordCount = transcriptText ? transcriptText.split(/\s+/).length : 0;

        // For duration, you might want to extract from Deepgram response or estimate
        // Since Deepgram v2 response doesn't always have duration easily, we'll estimate
        // A rough estimate: ~150 words per minute
        const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

        // Create transcription record
        const transcription = await Transcription.create({
          user: userId,
          title: title || `Transcription ${new Date().toLocaleDateString()}`,
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          transcription: transcriptText, // Using transcript from new Deepgram response
          duration: transcriptionResult.duration || estimatedDuration,
          language: language || 'en',
          wordCount: wordCount,
          accuracy: (transcriptionResult.accuracy || 0.95) * 100, // Convert decimal to percentage
          metadata: transcriptionResult.metadata || transcriptionResult.fullResponse || {},
          tags: [language || 'en', 'transcription', req.file.mimetype.split('/')[0]]
        });

        // Update user's transcription count
        await User.findByIdAndUpdate(userId, {
          $inc: {
            transcriptionsCount: 1,
            totalTranscriptionTime: Math.ceil(transcription.duration)
          }
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Schedule cleanup of old files (optional)
        cleanupOldFiles();

        res.status(201).json({
          status: 'success',
          message: 'Transcription completed successfully',
          data: {
            transcription: {
              id: transcription._id,
              title: transcription.title,
              transcription: transcription.transcription,
              duration: transcription.duration,
              wordCount: transcription.wordCount,
              accuracy: transcription.accuracy,
              language: transcription.language,
              metadata: transcription.metadata,
              createdAt: transcription.createdAt
            }
          }
        });

      } catch (error) {
        console.error('Transcription error:', error);
        // Clean up uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
          status: 'error',
          message: 'Transcription process failed',
          error: error.message
        });
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transcription history
// @route   GET /api/transcriptions/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search, sortBy = '-createdAt' } = req.query;

    // Build query
    const query = { user: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { transcription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Transcription.countDocuments(query);

    // Get transcriptions
    const transcriptions = await Transcription.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .select('-__v -metadata.paragraphs'); // Don't include full paragraphs in list

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.status(200).json({
      status: 'success',
      data: {
        transcriptions,
        pagination: {
          total,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasNext,
          hasPrev
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single transcription
// @route   GET /api/transcriptions/:id
// @access  Private
exports.getTranscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transcription = await Transcription.findOne({
      _id: id,
      user: userId
    });

    if (!transcription) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcription not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { transcription }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update transcription
// @route   PUT /api/transcriptions/:id
// @access  Private
exports.updateTranscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, transcription: newTranscription, tags, isPublic } = req.body;

    const transcription = await Transcription.findOne({
      _id: id,
      user: userId
    });

    if (!transcription) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcription not found'
      });
    }

    // Update fields
    if (title) transcription.title = title;
    if (newTranscription) transcription.transcription = newTranscription;
    if (tags) transcription.tags = tags;
    if (isPublic !== undefined) transcription.isPublic = isPublic;

    await transcription.save();

    res.status(200).json({
      status: 'success',
      message: 'Transcription updated successfully',
      data: { transcription }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete transcription
// @route   DELETE /api/transcriptions/:id
// @access  Private
exports.deleteTranscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transcription = await Transcription.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!transcription) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcription not found'
      });
    }

    // Update user's transcription count
    await User.findByIdAndUpdate(userId, {
      $inc: {
        transcriptionsCount: -1,
        totalTranscriptionTime: -Math.ceil(transcription.duration)
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Transcription deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get transcription statistics
// @route   GET /api/transcriptions/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // For MongoDB version compatibility
    const userIdObject = mongoose.Types.ObjectId ?
      new mongoose.Types.ObjectId(userId) :
      new mongoose.ObjectId(userId);

    const stats = await Transcription.aggregate([
      { $match: { user: userIdObject } },
      {
        $group: {
          _id: null,
          totalTranscriptions: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          totalDuration: { $sum: '$duration' },
          averageAccuracy: { $avg: '$accuracy' },
          byLanguage: {
            $addToSet: '$language'
          }
        }
      }
    ]);

    // Get recent transcriptions
    const recent = await Transcription.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .select('title createdAt duration wordCount language');

    // Format stats
    const formattedStats = stats[0] || {
      totalTranscriptions: 0,
      totalWords: 0,
      totalDuration: 0,
      averageAccuracy: 0,
      byLanguage: []
    };

    // Calculate additional stats
    const avgWordsPerTranscription = formattedStats.totalTranscriptions > 0
      ? Math.round(formattedStats.totalWords / formattedStats.totalTranscriptions)
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          ...formattedStats,
          avgWordsPerTranscription,
          avgDurationPerTranscription: formattedStats.totalTranscriptions > 0
            ? Math.round(formattedStats.totalDuration / formattedStats.totalTranscriptions)
            : 0
        },
        recent
      }
    });


  } catch (error) {
    console.error('Stats error:', error);
    next(error);
  }
};
// @desc    Transcribe existing audio file (already uploaded)
// @route   POST /api/transcriptions/existing
// @access  Private
exports.transcribeExistingAudio = async (req, res, next) => {
  try {
    const { fileName, title, language } = req.body;
    const userId = req.user.id;

    if (!fileName) {
      return res.status(400).json({
        status: 'error',
        message: 'fileName is required'
      });
    }

    // Check if file exists in uploads folder
    const filePath = path.join(__dirname, '../uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: `File ${fileName} not found in uploads directory`
      });
    }

    // Read the existing file
    const audioBuffer = fs.readFileSync(filePath);

    // Determine MIME type from file extension
    let mimetype = 'audio/wav'; // default
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.mp3') mimetype = 'audio/mpeg';
    if (ext === '.m4a') mimetype = 'audio/mp4';

    // Transcribe using Deepgram
    const transcriptionResult = await deepgramService.transcribeAudio(
      audioBuffer,
      {
        language: language || 'en',
        mimetype: mimetype
      }
    );

    if (!transcriptionResult.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Transcription failed',
        error: transcriptionResult.error,
        transcript: transcriptionResult.transcript || ''
      });
    }

    // Calculate word count and duration
    const transcriptText = transcriptionResult.transcript || transcriptionResult.transcription;
    const wordCount = transcriptText ? transcriptText.split(/\s+/).length : 0;

    // Estimate duration
    const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

    // Create transcription record
    const transcription = await Transcription.create({
      user: userId,
      title: title || `Transcription ${new Date().toLocaleDateString()}`,
      filename: fileName,
      originalName: fileName,
      fileSize: fs.statSync(filePath).size,
      fileType: mimetype,
      transcription: transcriptText,
      duration: transcriptionResult.duration || estimatedDuration,
      language: language || 'en',
      wordCount: wordCount,
      accuracy: (transcriptionResult.accuracy || 0.95) * 100, // Convert decimal to percentage
      metadata: transcriptionResult.metadata || transcriptionResult.fullResponse || {},
      tags: [language || 'en', 'transcription', mimetype.split('/')[0]]
    });

    // Update user's transcription count
    await User.findByIdAndUpdate(userId, {
      $inc: {
        transcriptionsCount: 1,
        totalTranscriptionTime: Math.ceil(transcription.duration)
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Transcription completed successfully',
      data: {
        transcription: {
          id: transcription._id,
          title: transcription.title,
          transcription: transcription.transcription,
          duration: transcription.duration,
          wordCount: transcription.wordCount,
          accuracy: transcription.accuracy,
          language: transcription.language,
          metadata: transcription.metadata,
          createdAt: transcription.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Existing audio transcription error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Transcription process failed',
      error: error.message
    });
  }
};