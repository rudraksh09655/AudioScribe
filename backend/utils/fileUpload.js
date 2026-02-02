// backend/utils/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('📝 File upload attempt details:', {
    name: file.originalname,
    mimetype: file.mimetype, // CRITICAL: This is what the browser sends
    size: file.size,
    encoding: file.encoding
  });

  // Accept audio files
  const allowedMimes = [
    'audio/mpeg',      // mp3
    'audio/wav',       // wav
    'audio/x-wav',     // wav
    'audio/mp4',       // m4a
    'audio/x-m4a',     // m4a
    'audio/webm',      // webm
    'audio/ogg',       // ogg
    'audio/x-mpeg',    // mp3
    'audio/mp3',       // mp3
    'application/octet-stream' // Sometimes wavs are sent as this
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.error('❌ REJECTED file type:', file.mimetype);
    cb(new Error(`Unsupported file type: "${file.mimetype}". Allowed: ${allowedMimes.join(', ')}`), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only one file
  }
});

// Cleanup old files function
const cleanupOldFiles = () => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  fs.readdir(uploadDir, (err, files) => {
    if (err) return;

    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stat) => {
        if (err) return;

        if (Date.now() - stat.mtime.getTime() > maxAge) {
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting old file:', err);
          });
        }
      });
    });
  });
};

module.exports = {
  upload,
  cleanupOldFiles
};