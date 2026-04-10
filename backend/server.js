const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/database');
const jwt = require('./utils/jwt');

const app = express();

connectDB();

// ✅ CORS MUST BE FIRST
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Body parsing after CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcribe', transcriptionRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.all(/(.*)/, (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Error handler (always last)
app.use(errorHandler);

// ========================================
// HTTP Server + WebSocket Server
// ========================================
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws/transcribe' });

wss.on('connection', (ws, req) => {
  console.log('🎙️ WebSocket client connected for live transcription');

  // Extract token from query string
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
    ws.close(4001, 'Authentication required');
    return;
  }

  // Verify JWT token
  const decoded = jwt.verifyToken(token);
  if (!decoded) {
    ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
    ws.close(4001, 'Invalid token');
    return;
  }

  console.log(`✅ Authenticated user: ${decoded.id}`);

  let deepgramWs = null;

  // Connect to Deepgram's live transcription API
  const deepgramUrl = 'wss://api.deepgram.com/v1/listen?' + new URLSearchParams({
    model: 'nova-2',
    language: 'en',
    smart_format: 'true',
    punctuate: 'true',
    interim_results: 'true',
    endpointing: '300',
    vad_events: 'true',
  }).toString();

  deepgramWs = new WebSocket(deepgramUrl, {
    headers: {
      'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
    },
  });

  deepgramWs.on('open', () => {
    console.log('✅ Connected to Deepgram live transcription');
    ws.send(JSON.stringify({ type: 'status', message: 'ready' }));
  });

  deepgramWs.on('message', (data) => {
    try {
      const result = JSON.parse(data.toString());

      // Handle speech started event
      if (result.type === 'SpeechStarted') {
        ws.send(JSON.stringify({ type: 'speech_started' }));
        return;
      }

      // Handle transcription results
      if (result.type === 'Results') {
        const transcript = result.channel?.alternatives?.[0]?.transcript || '';
        if (transcript) {
          ws.send(JSON.stringify({
            type: 'transcript',
            text: transcript,
            is_final: result.is_final,
            speech_final: result.speech_final,
          }));
        }
      }

      // Handle metadata 
      if (result.type === 'Metadata') {
        console.log('Deepgram metadata:', result);
      }
    } catch (err) {
      console.error('Deepgram message parse error:', err);
    }
  });

  deepgramWs.on('close', (code, reason) => {
    console.log(`Deepgram connection closed: ${code} ${reason}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'status', message: 'deepgram_closed' }));
    }
  });

  deepgramWs.on('error', (err) => {
    console.error('Deepgram WebSocket error:', err.message);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'error', message: 'Transcription service error' }));
    }
  });

  // Forward audio data from client to Deepgram
  ws.on('message', (data, isBinary) => {
    if (isBinary && deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
      deepgramWs.send(data);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
      // Send close frame to Deepgram
      deepgramWs.send(JSON.stringify({ type: 'CloseStream' }));
      setTimeout(() => {
        if (deepgramWs.readyState === WebSocket.OPEN) {
          deepgramWs.close();
        }
      }, 500);
    }
  });

  ws.on('error', (err) => {
    console.error('Client WebSocket error:', err.message);
    if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
      deepgramWs.close();
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/transcribe`);
});

module.exports = app;