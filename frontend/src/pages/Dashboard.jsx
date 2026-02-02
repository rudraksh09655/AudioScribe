import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";
import Profile from "../components/Profile";
import SettingsModal from "../components/Settings";
import {
  Mic,
  Square,
  Upload,
  FileText,
  LogOut,
  CheckCircle,
  Download,
  Copy,
  History,
  Play,
  Pause,
  User,
  Search,
  Loader2,
  Clock,
  Volume2,
  Trash2,
  ChevronRight,
  Sparkles,
  Settings,
  Check,
  X,
  Filter,
  MoreVertical
} from "lucide-react";

export default function Dashboard({ onLogout }) {
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Mock data for empty state
  /* ===============================
     FETCH HISTORY FROM BACKEND
  =============================== */
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await api.get("/transcribe/history");
        console.log("✅ Fetched transcription history:", res.data);
        // Backend returns: { status: 'success', data: { transcriptions: [...], pagination: {...} } }
        const transcriptions = res.data?.data?.transcriptions || res.data || [];
        const historyData = Array.isArray(transcriptions) ? transcriptions : [];
        setHistory(historyData);
      } catch (err) {
        console.error("❌ Error fetching history:", err);
        // Don't crash the component, just set empty history
        setHistory([]);
        // Only show toast error if it's not a network/auth error that would redirect anyway
        if (err?.response?.status !== 401) {
          toast.error("Failed to load transcription history");
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  /* ===============================
     RECORDING TIMER
  =============================== */
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /* ===============================
     RECORDING (UI ONLY)
  =============================== */
  const toggleRecording = () => {
    if (!isRecording) {
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <div>
            <p className="font-medium">Recording started</p>
            <p className="text-sm opacity-80">Speak clearly into your microphone</p>
          </div>
        </div>
      );
      setRecordingTime(0);
    } else {
      toast(
        <div className="flex items-center gap-3">
          <Square className="w-5 h-5" />
          <div>
            <p className="font-medium">Recording stopped</p>
            <p className="text-sm opacity-80">Duration: {formatTime(recordingTime)}</p>
          </div>
        </div>
      );
    }
    setIsRecording(!isRecording);
  };

  /* ===============================
     FILE UPLOAD
  =============================== */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid audio file (MP3, WAV, M4A)');
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 100MB');
      return;
    }

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setIsPlaying(false);

    toast.success(
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-500" />
        <div>
          <p className="font-medium">File uploaded successfully!</p>
          <p className="text-sm opacity-80">{file.name}</p>
        </div>
      </div>
    );
  };

  /* ===============================
     TRANSCRIBE - REAL UPLOAD FIXED VERSION
  =============================== */
  const handleGenerate = async () => {
    if (!audioFile && !isRecording) {
      toast.error("Please upload an audio file or start recording first");
      return;
    }

    setIsTranscribing(true);
    const toastId = toast.loading(
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <div>
          <p className="font-medium">Starting transcription...</p>
          <p className="text-sm opacity-80">Preparing file upload</p>
        </div>
      </div>
    );

    try {
      // Stop recording if active
      if (isRecording) {
        setIsRecording(false);
        // For now, recording needs separate handling
        toast.error("Please upload a file for transcription", { id: toastId });
        setIsTranscribing(false);
        return;
      }

      // Validate file
      if (!audioFile || !(audioFile instanceof File)) {
        throw new Error("No valid file selected");
      }

      console.log("🔄 Starting real upload for:", audioFile.name);

      // CRITICAL FIX: Create FormData PROPERLY
      const formData = new FormData();

      // Method 1: Try this first (with filename)
      formData.append("audio", audioFile, audioFile.name);

      // Add metadata as separate fields (not in the file)
      formData.append("title", audioFile.name.replace(/\.[^/.]+$/, ""));
      formData.append("language", "en");
      formData.append("action", "transcribe");

      console.log("📤 FormData created. Checking entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }

      // IMPORTANT: Use fetch directly instead of axios to avoid issues
      const token = localStorage.getItem('stt_token');

      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // DO NOT set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });

      console.log("📥 Response received. Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Server error ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Success response:", data);

      // Extract transcription
      let transcriptText = "";

      if (data.data?.transcription?.transcription) {
        transcriptText = data.data.transcription.transcription;
      } else if (data.transcription) {
        transcriptText = data.transcription;
      } else if (data.text) {
        transcriptText = data.text;
      } else if (data.message) {
        transcriptText = data.message;
      } else {
        transcriptText = JSON.stringify(data, null, 2);
      }

      setTranscription(transcriptText);

      toast.success(
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium">✓ Real Transcription Complete!</p>
            <p className="text-sm opacity-80">
              {data.data?.transcription?.wordCount
                ? `${data.data.transcription.wordCount} words transcribed`
                : 'File processed successfully'}
            </p>
          </div>
        </div>,
        { id: toastId }
      );

      // Try to refresh history
      try {
        const historyResponse = await fetch('http://localhost:5000/api/transcribe/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.data?.transcriptions) {
            setHistory(historyData.data.transcriptions);
          }
        }
      } catch (historyErr) {
        console.log("History refresh skipped:", historyErr.message);
      }

    } catch (error) {
      console.error("❌ REAL UPLOAD ERROR:", {
        message: error.message,
        stack: error.stack
      });

      // More specific error messages
      let errorMessage = "Upload failed";
      let suggestion = "Check console for details";

      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to server";
        suggestion = "Make sure backend is running on localhost:5000";
      } else if (error.message.includes("401") || error.message.includes("403")) {
        errorMessage = "Authentication failed";
        suggestion = "Try logging out and back in";
      } else if (error.message.includes("413")) {
        errorMessage = "File too large";
        suggestion = "Try a smaller file (max 100MB)";
      } else if (error.message.includes("415")) {
        errorMessage = "Invalid file type";
        suggestion = "Use MP3, WAV, or M4A files only";
      }

      // Show error but also show a demo so UI works
      const demoTranscript = `[ERROR] ${errorMessage}
    
[00:00] **System:** Attempted to transcribe: "${audioFile?.name}"
[00:15] **System:** Error: ${error.message}
[00:30] **System:** ${suggestion}

[01:00] **Sample:** This area would show your actual transcription.
[01:30] **Sample:** When working, AI would convert speech to text here.`;

      setTranscription(demoTranscript);

      toast.error(
        <div className="flex items-center gap-3">
          <X className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium">{errorMessage}</p>
            <p className="text-sm opacity-80">{suggestion}</p>
          </div>
        </div>,
        { id: toastId }
      );
    } finally {
      setIsTranscribing(false);
      setRecordingTime(0);
    }
  };
  /* ===============================
     COPY + DOWNLOAD
  =============================== */
  const handleCopyText = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);

    toast.success(
      <div className="flex items-center gap-3">
        <Check className="w-5 h-5" />
        <p className="font-medium">Copied to clipboard!</p>
      </div>
    );

    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5" />
        <p className="font-medium">Download started!</p>
      </div>
    );
  };

  /* ===============================
     AUDIO PREVIEW
  =============================== */
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /* ===============================
     HISTORY ITEM SELECTION
  =============================== */
  const handleSelectHistory = (item) => {
    console.log("📋 Selected history item:", item);
    setSelectedHistory(item);
    // Set the transcription text from the selected history item
    setTranscription(item.transcription || "");
    // Show success toast
    toast.success(
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5" />
        <p className="font-medium">Loaded: {item.title}</p>
      </div>
    );
  };

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogoutClick = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout API error:", err);
    }

    localStorage.removeItem("stt_token");

    toast(
      <div className="flex items-center gap-3">
        <LogOut className="w-5 h-5" />
        <div>
          <p className="font-medium">Logged out successfully</p>
          <p className="text-sm opacity-80">See you soon!</p>
        </div>
      </div>
    );

    if (onLogout) onLogout();
    navigate("/");
  };

  const filteredHistory = history.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.transcription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* ================= SIDEBAR ================= */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="hidden lg:flex lg:w-80 flex-col border-r border-gray-200 bg-white/80 backdrop-blur-sm"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">History</h2>
                <p className="text-sm text-gray-500">{history.length} transcriptions</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {filteredHistory.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    onClick={() => handleSelectHistory(item)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedHistory?._id === item._id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                      : "bg-white border border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {item.wordCount || 0} words
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 ${selectedHistory?._id === item._id ? "text-blue-500" : ""
                        }`} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => toast("Clear all history")}
            className="w-full p-3 flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <Trash2 className="w-5 h-5" />
            Clear All History
          </button>
        </div>
      </motion.aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-lg">🎙️</span>
                  </motion.div>
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600"
                    >
                      AudioScribe
                    </motion.h1>
                    <p className="text-xs text-gray-500">AI Transcription Dashboard</p>
                  </div>
                </div>
              </div>

              {/* User & Actions */}
              <div className="flex items-center gap-4">
                {/* File Info */}
                {audioFile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {audioFile.name.split('.')[0]}
                    </span>
                  </motion.div>
                )}

                {/* Recording Timer */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-700">
                      {formatTime(recordingTime)}
                    </span>
                  </motion.div>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer hover:from-blue-200 hover:to-indigo-300 transition"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600">
                Convert your audio files to perfect text using advanced AI transcription.
              </p>
            </motion.div>

            {/* Action Cards Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Record Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Record Audio</h3>
                    <p className="text-gray-600">Record live audio for real-time transcription</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Mic className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Timer Display */}
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 bg-blue-50 rounded-xl"
                    >
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording...</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Record Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleRecording}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isRecording
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                      }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isRecording ? (
                        <>
                          <Square className="w-6 h-6" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-6 h-6" />
                          Start Recording
                        </>
                      )}
                    </div>
                  </motion.button>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                    <div>
                      <div className="font-semibold">Max</div>
                      <div>60 min</div>
                    </div>
                    <div>
                      <div className="font-semibold">Format</div>
                      <div>MP3</div>
                    </div>
                    <div>
                      <div className="font-semibold">Quality</div>
                      <div>128 kbps</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upload Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Audio</h3>
                    <p className="text-gray-600">Upload existing audio files for transcription</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Upload className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* File Upload Area */}
                  <label className="block">
                    <input
                      type="file"
                      accept="audio/*"
                      hidden
                      onChange={handleFileUpload}
                    />
                    <div className={`border-2 border-dashed ${audioFile
                      ? "border-green-400 bg-green-50"
                      : "border-purple-300 hover:border-purple-400"
                      } rounded-xl p-8 text-center cursor-pointer transition-colors`}>
                      <div className="flex flex-col items-center gap-4">
                        {audioFile ? (
                          <>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{audioFile.name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to transcribe
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-purple-400" />
                            <div>
                              <p className="font-semibold text-gray-900">Drop audio file here</p>
                              <p className="text-sm text-gray-600 mt-1">
                                or click to browse • MP3, WAV, M4A up to 100MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* File Info */}
                  {audioFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File Type:</span>
                        <span className="font-medium">{audioFile.type.split('/')[1].toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Modified:</span>
                        <span className="font-medium">Today</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={handleGenerate}
                disabled={(!audioFile && !isRecording) || isTranscribing}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${(!audioFile && !isRecording) || isTranscribing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  } text-white`}
              >
                {isTranscribing ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Transcribing with AI...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Transcript</span>
                  </div>
                )}
              </button>
            </motion.div>

            {/* Transcription Output */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Transcription</h3>
                      <p className="text-sm text-gray-600">
                        {transcription ? "Click actions below to copy or download" : "Your transcript will appear here"}
                      </p>
                    </div>
                  </div>
                  {transcription && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {transcription.split(' ').length} words
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {transcription ? (
                  <div className="space-y-6">
                    {/* Audio Preview */}
                    {audioUrl && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={toggleAudioPlay}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-indigo-600 transition"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Audio Preview</p>
                            <audio ref={audioRef} src={audioUrl} className="w-full mt-2" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transcription Text */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <pre className="text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {transcription}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyText}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium ${copied
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                          } transition-all`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            Copy Text
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadTxt}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 hover:from-indigo-200 hover:to-blue-200 border border-indigo-200 rounded-xl font-medium transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Download TXT
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast("Share feature coming soon!")}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 border border-purple-200 rounded-xl font-medium transition-all"
                      >
                        <span className="text-lg">🔗</span>
                        Share Link
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      No transcription yet
                    </h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Upload an audio file or start recording to generate your first transcript.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}