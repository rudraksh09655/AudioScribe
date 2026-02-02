import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Settings as SettingsIcon,
    Volume2,
    FileText,
    Bell,
    Palette,
    Shield,
    Save,
    Loader2,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';

export default function Settings({ isOpen, onClose }) {
    const { theme, accentColor, updateTheme, updateAccentColor } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('audio');
    const [settings, setSettings] = useState({
        // Audio Settings
        defaultLanguage: 'en',
        audioQuality: 'high',
        autoSave: true,

        // Transcription Settings
        speakerDetection: false,
        timestamps: true,
        autoPunctuation: true,

        // Notification Settings
        emailNotifications: true,
        browserNotifications: false,

        // Theme Settings (these will be synced with context)
        theme: theme,
        accentColor: accentColor
    });

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/user/settings');
            setSettings({ ...settings, ...(res.data.data || res.data) });
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/user/settings', settings);
            toast.success(
                <div className="flex items-center gap-3">
                    <Check className="w-5 h-5" />
                    <p className="font-medium">Settings saved successfully!</p>
                </div>
            );
            onClose();
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'audio', label: 'Audio', icon: Volume2 },
        { id: 'transcription', label: 'Transcription', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme', icon: Palette },
        { id: 'account', label: 'Account', icon: Shield }
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' }
    ];

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
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <SettingsIcon className="w-8 h-8" />
                                    <div>
                                        <h2 className="text-2xl font-bold">Settings</h2>
                                        <p className="text-purple-100">Customize your experience</p>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                </div>
                            ) : (
                                <div className="flex">
                                    {/* Sidebar Tabs */}
                                    <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${activeTab === tab.id
                                                        ? 'bg-purple-100 text-purple-700 font-medium'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span>{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                        {/* Audio Settings */}
                                        {activeTab === 'audio' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Settings</h3>

                                                {/* Default Language */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Default Language
                                                    </label>
                                                    <select
                                                        value={settings.defaultLanguage}
                                                        onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                                    >
                                                        {languages.map((lang) => (
                                                            <option key={lang.code} value={lang.code}>
                                                                {lang.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Audio Quality */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Audio Quality
                                                    </label>
                                                    <select
                                                        value={settings.audioQuality}
                                                        onChange={(e) => setSettings({ ...settings, audioQuality: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                                    >
                                                        <option value="low">Low (Faster processing)</option>
                                                        <option value="medium">Medium (Balanced)</option>
                                                        <option value="high">High (Best accuracy)</option>
                                                    </select>
                                                </div>

                                                {/* Auto-save */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Auto-save Transcriptions</p>
                                                        <p className="text-sm text-gray-600">Automatically save completed transcriptions</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.autoSave ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Transcription Settings */}
                                        {activeTab === 'transcription' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcription Settings</h3>

                                                {/* Speaker Detection */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Speaker Detection</p>
                                                        <p className="text-sm text-gray-600">Identify different speakers in audio</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, speakerDetection: !settings.speakerDetection })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.speakerDetection ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.speakerDetection ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Timestamps */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Show Timestamps</p>
                                                        <p className="text-sm text-gray-600">Display timestamps in transcriptions</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, timestamps: !settings.timestamps })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.timestamps ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.timestamps ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Auto Punctuation */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Auto Punctuation</p>
                                                        <p className="text-sm text-gray-600">Automatically add punctuation</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, autoPunctuation: !settings.autoPunctuation })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.autoPunctuation ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.autoPunctuation ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notification Settings */}
                                        {activeTab === 'notifications' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>

                                                {/* Email Notifications */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                                        <p className="text-sm text-gray-600">Receive updates via email</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>

                                                {/* Browser Notifications */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">Browser Notifications</p>
                                                        <p className="text-sm text-gray-600">Show notifications in browser</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSettings({ ...settings, browserNotifications: !settings.browserNotifications })}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${settings.browserNotifications ? 'bg-purple-600' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Theme Settings */}
                                        {activeTab === 'theme' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Settings</h3>

                                                {/* Theme */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Appearance
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                            onClick={() => {
                                                                setSettings({ ...settings, theme: 'light' });
                                                                updateTheme('light');
                                                                toast.success('Theme changed to Light');
                                                            }}
                                                            className={`p-4 border-2 rounded-lg transition ${settings.theme === 'light'
                                                                ? 'border-purple-500 bg-purple-50'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <div className="w-full h-20 bg-white rounded mb-2 border border-gray-200"></div>
                                                            <p className="font-medium text-gray-900">Light</p>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSettings({ ...settings, theme: 'dark' });
                                                                updateTheme('dark');
                                                                toast.success('Theme changed to Dark');
                                                            }}
                                                            className={`p-4 border-2 rounded-lg transition ${settings.theme === 'dark'
                                                                ? 'border-purple-500 bg-purple-50'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            <div className="w-full h-20 bg-gray-900 rounded mb-2 border border-gray-700"></div>
                                                            <p className="font-medium text-gray-900">Dark</p>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Accent Color */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Accent Color
                                                    </label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {['blue', 'purple', 'green', 'orange'].map((color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() => setSettings({ ...settings, accentColor: color })}
                                                                className={`h-12 rounded-lg border-2 transition ${settings.accentColor === color
                                                                    ? 'border-gray-900 scale-110'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                                    } bg-${color}-500`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Account Settings */}
                                        {activeTab === 'account' && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>

                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>Note:</strong> Password change and account deletion features coming soon!
                                                    </p>
                                                </div>

                                                <button
                                                    className="w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                                                    disabled
                                                >
                                                    Change Password (Coming Soon)
                                                </button>

                                                <button
                                                    className="w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                                                    disabled
                                                >
                                                    Delete Account (Coming Soon)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            {!loading && (
                                <div className="border-t border-gray-200 p-4 flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Settings
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
