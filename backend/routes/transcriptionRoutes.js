const express = require('express');
const router = express.Router();
const transcriptionController = require('../controllers/transcriptionController');
const auth = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

// Apply authentication to all transcription routes
router.use(auth);

// Test route (optional - can remove later)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Transcription routes working!',
    userId: req.user.id
  });
});

// Main transcription endpoint
router.post('/', transcriptionController.transcribeAudio);

// In transcriptionRoutes.js, add this line after your other routes:
router.post('/existing', auth, transcriptionController.transcribeExistingAudio);

// Get user's transcription history
router.get('/history', transcriptionController.getHistory);

// Get transcription statistics
router.get('/stats', transcriptionController.getStats);

// Get single transcription by ID
router.get('/:id', transcriptionController.getTranscription);

// Update transcription
router.put('/:id', transcriptionController.updateTranscription);

// Delete transcription
router.delete('/:id', transcriptionController.deleteTranscription);

module.exports = router;