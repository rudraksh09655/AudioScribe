import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Calendar,
    FileText,
    Clock,
    BarChart3,
    Award,
    Camera,
    Save,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Profile({ isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Fetch user profile
            const userRes = await api.get('/user/profile');
            setUserData(userRes.data.data || userRes.data);
            setName(userRes.data.data?.name || userRes.data.name || '');
            setBio(userRes.data.data?.bio || userRes.data.bio || '');

            // Fetch statistics
            const statsRes = await api.get('/user/stats');
            setStats(statsRes.data.data || statsRes.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/user/profile', { name, bio });
            toast.success('Profile updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0min';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h2 className="text-2xl font-bold mb-1">Your Profile</h2>
                                <p className="text-blue-100">Manage your account information</p>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : (
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                    {/* Profile Picture Section */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                                {name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition">
                                                <Camera className="w-4 h-4 text-blue-600" />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mt-4">{name}</h3>
                                        <p className="text-gray-600 text-sm">{userData?.email}</p>
                                        <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">
                                            {userData?.plan || 'Free'} Plan
                                        </span>
                                    </div>

                                    {/* User Information */}
                                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>

                                        <div className="space-y-4">
                                            {/* Name Input */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <User className="w-4 h-4" />
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    placeholder="Enter your name"
                                                />
                                            </div>

                                            {/* Email (Read-only) */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <Mail className="w-4 h-4" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={userData?.email || ''}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Member Since */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Member Since
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formatDate(userData?.createdAt)}
                                                    disabled
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Bio */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                    <FileText className="w-4 h-4" />
                                                    Bio
                                                </label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                                    placeholder="Tell us about yourself..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                            Usage Statistics
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Total Transcriptions */}
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {stats?.totalTranscriptions || userData?.transcriptionsCount || 0}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Transcriptions</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total Time */}
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {formatDuration(stats?.totalAudioTime || userData?.totalTranscriptionTime || 0)}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Audio Processed</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Average Accuracy */}
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                        <Award className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {stats?.averageAccuracy ? `${Math.round(stats.averageAccuracy)}%` : 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Avg Accuracy</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Most Used Language */}
                                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                                        {stats?.mostUsedLanguage?.toUpperCase() || 'EN'}
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {stats?.mostUsedLanguage?.toUpperCase() || 'EN'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Most Used</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
