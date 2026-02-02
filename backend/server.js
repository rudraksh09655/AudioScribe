const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const userRoutes = require('./routes/userRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ✅✅✅ CRITICAL FIX: Add body parsing middleware FIRST
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Debug middleware to log requests to /api/transcribe
app.use('/api/transcribe', (req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcribe', transcriptionRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// 404 handler
app.all(/(.*)/, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Error handling middleware (MUST BE LAST)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    🚀 Server Information:
    ======================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV}
    Database: ${process.env.MONGODB_URI}
    API Base: http://localhost:${PORT}/api
    Health: http://localhost:${PORT}/api/health
    Client: ${process.env.CLIENT_URL}
    ======================
    `);
});

module.exports = app;
