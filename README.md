# 🎙️ AudioScribe — AI-Powered Speech-to-Text Transcription

[![Live Demo](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://audio-scribe-phi.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://audioscribe-2.onrender.com)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

**AudioScribe** is a full-stack web application that converts audio into accurate text using **Deepgram's Nova-2 AI model**. Users can upload audio files for batch transcription or record live audio directly from the browser with **real-time streaming transcription** powered by WebSockets.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration** with name, email, and password
- **User Login** with JWT-based authentication (7-day token expiry)

- **Password Hashing** using bcryptjs with salt rounds
- **Token Refresh** endpoint for extending sessions
- **Account Deletion** — users can permanently delete their account
- **Profile Management** — update name, bio, and view account stats
- **User Settings** — customizable preferences for language, audio quality, theme, accent color, speaker detection, timestamps, auto-punctuation, and notifications

### 🎤 Audio Transcription
- **File Upload Transcription** — upload MP3, WAV, or M4A files (up to 100MB) and get accurate transcription via Deepgram's Nova-2 model
- **Live Recording with Real-Time Transcription** — record audio directly from the browser microphone; transcription appears word-by-word in real-time using WebSocket streaming through a backend proxy to Deepgram's live API
- **Transcription History** — all transcriptions are saved to the database with title, word count, duration, accuracy, language, and timestamps
- **Search & Filter** — search through past transcriptions by title or content
- **Copy & Download** — copy transcription text to clipboard or download as a `.txt` file
- **Transcription Statistics** — view total transcriptions, total words, total duration, average accuracy, and most-used language

### 🎨 UI/UX
- **Landing Page** with Navbar, Hero section, Features showcase, "How It Works" guide, and Footer
- **Animated Auth Page** with login/signup toggle, progress steps, social login placeholders, and form validation
- **Dashboard** with sidebar history panel, recording controls, file upload drag-and-drop, live transcription area with interim text preview, and action buttons
- **Profile Modal** — view and edit user profile
- **Settings Modal** — configure audio, transcription, notification, and theme preferences
- **Dark/Light Theme** support via ThemeContext
- **Responsive Design** — works on desktop, tablet, and mobile
- **Smooth Animations** — powered by Framer Motion
- **Toast Notifications** — real-time feedback via react-hot-toast

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | UI component library |
| **Vite** | 7.2.4 | Build tool & dev server |
| **React Router DOM** | 7.13.0 | Client-side routing |
| **Axios** | 1.13.4 | HTTP client for API calls |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Framer Motion** | 12.29.0 | Animation library |
| **Lucide React** | 0.562.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **React Intersection Observer** | 10.0.2 | Scroll-based animations |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Express** | 5.2.1 | Node.js web framework |
| **Mongoose** | 9.1.5 | MongoDB ODM |
| **Deepgram SDK** | 4.11.3 | AI speech-to-text (Nova-2 model) |
| **ws** | 8.20.0 | WebSocket server for live transcription streaming |
| **JSON Web Token** | 9.0.3 | JWT authentication |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Multer** | 2.0.2 | File upload handling |

| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **dotenv** | 17.2.3 | Environment variable management |

### Infrastructure

| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Vercel** | Frontend hosting & deployment |
| **Render** | Backend hosting & deployment |
| **Deepgram** | AI transcription engine (pre-recorded & live streaming) |


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  React + Vite + Tailwind CSS (hosted on Vercel)                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Landing Page │  │   Auth Page  │  │      Dashboard        │ │
│  │  - Navbar     │  │  - Login     │  │  - File Upload        │ │
│  │  - Hero       │  │  - Register  │  │  - Live Recording     │ │
│  │  - Features   │  │  - Validation│  │  - Transcription View │ │
│  │  - HowItWorks │  │              │  │  - History Sidebar    │ │
│  │  - Footer     │  │              │  │  - Profile/Settings   │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│           │                │                    │    │          │
│           │         HTTP (Axios)          WebSocket  │          │
│           │                │              (recording)│          │
└───────────┼────────────────┼────────────────────┼────┼──────────┘
            │                │                    │    │
            ▼                ▼                    ▼    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Render)                       │
│                                                                 │
│  Express.js + HTTP Server + WebSocket Server                    │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  REST API        │  │  WebSocket       │  │  Middleware     │ │
│  │  /api/auth/*     │  │  /ws/transcribe  │  │  - JWT Auth    │ │
│  │  /api/transcribe │  │  (live streaming │  │  - CORS        │ │
│  │  /api/user/*     │  │   proxy)         │  │  - Error       │ │
│  │  /api/health     │  │                  │  │    Handler     │ │
│  └────────┬────────┘  └────────┬─────────┘  │  - Multer      │ │
│           │                    │             └────────────────┘ │
│           │                    │                                 │
│           ▼                    ▼                                 │
│  ┌─────────────────┐  ┌──────────────────┐                     │
│  │   MongoDB Atlas  │  │  Deepgram API    │                     │
│  │   (Users,        │  │  - Pre-recorded  │                     │
│  │    Transcriptions)│  │  - Live Stream   │                     │
│  └─────────────────┘  │    (WebSocket)   │                     │
│                        └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow — File Upload Transcription

1. User uploads an audio file on the Dashboard
2. Frontend sends the file as `multipart/form-data` via `POST /api/transcribe`
3. Backend saves the file temporarily using Multer
4. Backend reads the file buffer and sends it to **Deepgram's pre-recorded API** (Nova-2 model)
5. Deepgram returns the transcription result
6. Backend saves the transcription to **MongoDB** and returns it to the frontend
7. Temporary file is deleted from the server

### Data Flow — Live Recording & Real-Time Transcription

1. User clicks "Start Recording" on the Dashboard
2. Browser requests microphone permission via `navigator.mediaDevices.getUserMedia`
3. Frontend opens a **WebSocket** connection to `wss://backend/ws/transcribe?token=JWT`
4. Backend authenticates the JWT, then opens a **WebSocket** connection to **Deepgram's live streaming API**
5. `MediaRecorder` captures audio in 250ms chunks and sends them to the backend WebSocket
6. Backend forwards audio chunks to Deepgram in real-time
7. Deepgram sends back **interim** (in-progress) and **final** (confirmed) transcript segments
8. Backend forwards these results to the frontend
9. Frontend displays **final text** in normal style and **interim text** in blue italics
10. When the user stops recording, the WebSocket is closed and the full recorded audio is available for playback

---

## 📁 Project Structure

```
AudioScribe/
├── README.md
│
├── backend/
│   ├── .env                          # Environment variables (not committed)
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                     # Express + HTTP + WebSocket server
│   │
│   ├── config/
│   │   └── database.js               # MongoDB connection via Mongoose
│   │
│   ├── controllers/
│   │   ├── authController.js          # Register, login, getMe, settings, delete, refresh
│   │   ├── transcriptionController.js # Transcribe, history, CRUD, stats
│   │   ├── userController.js          # Profile, stats, settings
│   │   └── verificationController.js  # (disabled — stub only)
│   │
│   ├── middleware/
│   │   ├── auth.js                    # JWT authentication middleware
│   │   └── errorHandler.js            # Global error handler (Mongoose, Multer, JWT)
│   │
│   ├── models/
│   │   ├── User.js                    # User schema (name, email, password, settings, etc.)
│   │   └── Transcription.js           # Transcription schema (text, metadata, tags, etc.)
│   │
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth/* routes
│   │   ├── transcriptionRoutes.js     # /api/transcribe/* routes
│   │   └── userRoutes.js              # /api/user/* routes
│   │
│   ├── utils/
│   │   ├── deepgram.js                # Deepgram SDK wrapper (Nova-2, pre-recorded)
│   │   ├── emailService.js            # Email service (disabled — stub only)
│   │   ├── fileUpload.js              # Multer config (file type/size validation, cleanup)
│   │   └── jwt.js                     # JWT generate, verify, decode
│   │
│   └── uploads/                       # Temporary file storage (auto-cleaned)
│
└── frontend/
    ├── .env                           # VITE_API_BASE_URL
    ├── .gitignore
    ├── vercel.json                    # Vercel SPA rewrite rules
    ├── index.html                     # HTML entry point
    ├── vite.config.js                 # Vite configuration
    ├── eslint.config.js               # ESLint configuration
    ├── package.json
    │
    └── src/
        ├── main.jsx                   # React entry point (ThemeProvider, Toaster)
        ├── App.jsx                    # Router setup (Landing, Auth, Dashboard)
        ├── index.css                  # Global styles & Tailwind imports
        │
        ├── api/
        │   └── axios.js               # Axios instance with base URL & JWT interceptor
        │
        ├── context/
        │   └── ThemeContext.jsx        # Dark/light theme context provider
        │
        ├── components/
        │   ├── Navbar.jsx             # Navigation bar with sign-in CTA
        │   ├── Hero.jsx               # Hero section with headline & CTA
        │   ├── Features.jsx           # Features grid section
        │   ├── HowItWorks.jsx         # Step-by-step guide section
        │   ├── Footer.jsx             # Footer with links & credits
        │   ├── Profile.jsx            # User profile modal (view/edit)
        │   └── Settings.jsx           # Settings modal (audio, transcription, theme)
        │
        └── pages/
            ├── Landing.jsx            # Landing page (Navbar + Hero + Features + HowItWorks + Footer)
            ├── Auth.jsx               # Login/Register page with animations
            └── Dashboard.jsx          # Main dashboard (record, upload, transcribe, history)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (free tier works)
- **Deepgram** API key (free at [console.deepgram.com](https://console.deepgram.com/signup))

### Environment Variables

#### Backend (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# JWT Configuration
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRE=7d

# Deepgram API Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

The backend server will start on `http://localhost:5000`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## 📡 API Reference

### Authentication Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login with email & password, returns JWT |
| `GET` | `/me` | ✅ | Get current authenticated user details |
| `PUT` | `/settings` | ✅ | Update user settings |
| `DELETE` | `/delete` | ✅ | Permanently delete user account |
| `POST` | `/refresh-token` | ✅ | Refresh JWT token |

### Transcription Routes — `/api/transcribe`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ | Upload audio file and transcribe it |
| `POST` | `/existing` | ✅ | Transcribe a previously uploaded file |
| `GET` | `/history` | ✅ | Get paginated transcription history (supports `?search=`, `?page=`, `?limit=`, `?sortBy=`) |
| `GET` | `/stats` | ✅ | Get transcription statistics (totals, averages) |
| `GET` | `/:id` | ✅ | Get a single transcription by ID |
| `PUT` | `/:id` | ✅ | Update transcription title, text, or tags |
| `DELETE` | `/:id` | ✅ | Delete a transcription |

### User Routes — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/profile` | ✅ | Get user profile data |
| `PUT` | `/profile` | ✅ | Update name and bio |
| `GET` | `/stats` | ✅ | Get user statistics |
| `GET` | `/settings` | ✅ | Get user settings |
| `PUT` | `/settings` | ✅ | Update user settings |

### WebSocket — `/ws/transcribe`

| Protocol | Endpoint | Auth | Description |
|----------|----------|------|-------------|
| `WSS` | `/ws/transcribe?token=JWT` | ✅ (query param) | Live audio streaming with real-time transcription |

**WebSocket Message Types (server → client):**

| Type | Fields | Description |
|------|--------|-------------|
| `status` | `message: "ready"` | Deepgram connection established, ready for audio |
| `transcript` | `text`, `is_final`, `speech_final` | Transcription result (interim or final) |
| `speech_started` | — | Voice activity detected |
| `error` | `message` | Error occurred |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns server status and timestamp |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect the repository to [Vercel](https://vercel.com)
3. Set the **Root Directory** to `frontend`
4. Set the **Framework Preset** to `Vite`
5. Add environment variable: `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
6. The `vercel.json` file handles SPA routing rewrites automatically

### Backend (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `backend/.env`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `DEEPGRAM_API_KEY`
   - `CLIENT_URL` = `https://your-frontend.vercel.app` (no trailing slash!)
   - `MAX_FILE_SIZE`
   - `NODE_ENV` = `production`

> ⚠️ **Important**: The `CLIENT_URL` must **not** have a trailing slash, or CORS will fail.

---

## 👤 Author

**Rudraksh Gupta**

- GitHub: [@rudraksh09655](https://github.com/rudraksh09655)

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  <p>Built with ❤️ using React, Express, Deepgram AI, and MongoDB</p>
</div>
