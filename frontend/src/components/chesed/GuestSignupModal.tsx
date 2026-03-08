'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';

interface GuestSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (guestInfo: GuestInfo) => void;
    trainTitle?: string;
}

interface GuestInfo {
    name: string;
    phone: string;
    email?: string;
    verified: boolean;
}

type Step = 'info' | 'verify' | 'success';

export function GuestSignupModal({
    isOpen,
    onClose,
    onSuccess,
    trainTitle,
}: GuestSignupModalProps) {
    const [step, setStep] = useState<Step>('info');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skipVerification, setSkipVerification] = useState(false);

    const resetForm = () => {
        setStep('info');
        setName('');
        setPhone('');
        setEmail('');
        setVerificationCode('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmitInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!phone.trim()) {
            setError('Please enter your phone number');
            return;
        }

        // Format phone number
        const formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        if (skipVerification) {
            // Skip verification and proceed directly
            onSuccess({
                name,
                phone: formattedPhone,
                email: email || undefined,
                verified: false,
            });
            handleClose();
            return;
        }

        setIsLoading(true);

        try {
            await api.createGuestSession({
                identifier: formattedPhone,
                identifierType: 'phone',
            });
            setStep('verify');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!verificationCode.trim() || verificationCode.length < 4) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);

        try {
            await api.verifyGuestSession({
                identifier: phone.replace(/\D/g, ''),
                identifierType: 'phone',
                verificationCode,
            });

            onSuccess({
                name,
                phone: phone.replace(/\D/g, ''),
                email: email || undefined,
                verified: true,
            });

            setStep('success');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipVerification = () => {
        onSuccess({
            name,
            phone: phone.replace(/\D/g, ''),
            email: email || undefined,
            verified: false,
        });
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Quick Signup</h2>
                            {trainTitle && (
                                <p className="text-sm text-white/80">Sign up for: {trainTitle}</p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className={`flex items-center gap-2 ${step === 'info' ? 'text-primary-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'info' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>1</div>
                        <span className="text-sm font-medium">Your Info</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 mx-3" />
                    <div className={`flex items-center gap-2 ${step === 'verify' ? 'text-primary-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'verify' ? 'bg-primary-600 text-white' : step === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                            {step === 'success' ? '✓' : '2'}
                        </div>
                        <span className="text-sm font-medium">Verify</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'info' && (
                        <form onSubmit={handleSubmitInfo} className="space-y-4">
                            <p className="text-gray-600 text-sm">
                                No account needed! Just enter your info to sign up.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(555) 555-5555"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    We'll send you a verification code (optional)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={skipVerification}
                                    onChange={(e) => setSkipVerification(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600">Skip phone verification</span>
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Sending code...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'verify' && (
                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">📱</span>
                                </div>
                                <p className="text-gray-600">
                                    We sent a verification code to
                                </p>
                                <p className="font-semibold text-gray-900">{phone}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className="w-full text-center text-2xl tracking-widest py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length < 4}
                                className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => setStep('info')}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkipVerification}
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    Skip verification
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h3>
                            <p className="text-gray-600">
                                Thank you for signing up, {name}!
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500">
                    <p>
                        Already have an account?{' '}
                        <a href="/login" className="text-primary-600 hover:underline">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GuestSignupModal;
