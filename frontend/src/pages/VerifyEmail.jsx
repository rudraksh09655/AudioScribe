import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        verifyEmailToken(token);
    }, [searchParams]);

    const verifyEmailToken = async (token) => {
        try {
            setStatus('verifying');
            const res = await api.get(`/auth/verify-email/${token}`);

            setStatus('success');
            setMessage(res.data.message || 'Email verified successfully!');

            toast.success('Email verified! Redirecting to dashboard...');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
            toast.error('Verification failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                {status === 'verifying' && (
                    <>
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verifying Your Email
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we verify your email address...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Email Verified!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to dashboard...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verification Failed
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Back to Login
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition font-medium"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
