import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  ArrowRight,
  Sparkles,
  Headphones,
  ChevronRight
} from "lucide-react";

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!isLogin && formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setIsLoading(true);

  const toastId = toast.loading(
    isLogin ? "Signing in..." : "Creating your account..."
  );

  try {
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

    const res = await api.post(endpoint, payload);

    // Save token from backend
    localStorage.setItem("stt_token", res.data.token);

    toast.success(
      isLogin ? "Welcome back!" : "Account created successfully!",
      { id: toastId }
    );

    if (onAuthSuccess) onAuthSuccess();

    navigate("/dashboard");
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Authentication failed",
      { id: toastId }
    );
  } finally {
    setIsLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center p-4 md:p-8">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Brand & Info */}
        <div className="lg:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full flex flex-col justify-between"
          >
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">AudioScribe</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Speech Transcription</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                {isLogin ? "Welcome Back!" : "Join Our Community"}
              </h2>
              
              <p className="text-lg opacity-90">
                {isLogin 
                  ? "Sign in to access your dashboard and continue transcribing audio with cutting-edge AI."
                  : "Create an account to start converting audio to perfect text in seconds."
                }
              </p>

              {/* Feature List */}
              <ul className="space-y-4">
                {[
                  "🎯 99% Transcription Accuracy",
                  "⚡ Real-time Processing",
                  "🌍 50+ Languages Supported",
                  "🔒 End-to-end Encryption",
                  "💾 Unlimited History Storage",
                  "🎙️ Live Recording Feature"
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs opacity-80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-xs opacity-80">Transcriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99%</div>
                <div className="text-xs opacity-80">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="lg:w-3/5 p-8 md:p-12 lg:p-16">
          <div className="max-w-md mx-auto">
            {/* Form Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isLogin ? "Sign In" : "Create Account"}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {isLogin 
                      ? "Enter your credentials to continue"
                      : "Fill in your details to get started"
                    }
                  </p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 flex items-center justify-center">
                    {isLogin ? (
                      <Lock className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <User className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Steps (for signup) */}
              {!isLogin && (
                <div className="flex items-center justify-between mb-8">
                  {["Account", "Profile", "Verify"].map((step, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {index + 1}
                      </div>
                      <div className="ml-2 text-sm font-medium text-gray-700">{step}</div>
                      {index < 2 && (
                        <div className="w-12 h-0.5 bg-gray-300 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Name Field (only for signup) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                        required={!isLogin}
                        disabled={isLoading}
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full p-4 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full p-4 pl-12 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500">
                      Minimum 8 characters with letters and numbers
                    </p>
                  )}
                </div>

                {/* Confirm Password Field (only for signup) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full p-4 pl-12 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                        required={!isLogin}
                        disabled={isLoading}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password (only for login) */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      onClick={() => toast("Password reset feature coming soon!")}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms & Conditions (only for signup) */}
                {!isLogin && (
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <button type="button" className="text-indigo-600 hover:underline">
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-indigo-600 hover:underline">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toast("Google login coming soon!")}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => toast("GitHub login coming soon!")}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>

            {/* Toggle Auth Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={toggleAuthMode}
                  disabled={isLoading}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 group"
                >
                  {isLogin ? "Sign up for free" : "Sign in here"}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </p>
            </motion.div>

            {/* Demo Account Info */}
            {/*<div className="mt-10 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700 text-center">
                {/*<span className="font-semibold">Demo Account:</span> demo@audioscribe.com / demo123
              </p>
            </div>*/}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
        
      </div>
    </div>
  );
}