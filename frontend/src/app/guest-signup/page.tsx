'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { writeStoredGuestSession } from '@/lib/guest-session';

function GuestSignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';

    const [identifier, setIdentifier] = useState('');
    const [type, setType] = useState<'phone' | 'email'>('email');
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.createGuestSession({ identifier, identifierType: type });
            setStep('verify');
            toast.success('Verification code sent!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const session = await api.verifyGuestSession({
                identifier,
                identifierType: type,
                verificationCode: code
            });

            writeStoredGuestSession(session);

            toast.success('Successfully verified!');
            router.push(returnUrl);
        } catch (error: any) {
            toast.error(error.message || 'Invalid code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 border-none shadow-2xl rounded-3xl bg-white">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl text-2xl mb-4">
                        {step === 'request' ? '👋' : '🔐'}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {step === 'request' ? 'Quick Sign Up' : 'Verify Your Identity'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {step === 'request'
                            ? 'Enter your email or phone to get started with Chesed Train.'
                            : `We sent a code to ${identifier}`}
                    </p>
                </div>

                {step === 'request' ? (
                    <form onSubmit={handleRequest} className="space-y-6">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType('email')}
                                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${type === 'email' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                EMAIL
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('phone')}
                                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${type === 'phone' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                            >
                                PHONE
                            </button>
                        </div>

                        <Input
                            label={type === 'email' ? 'Email Address' : 'Phone Number'}
                            placeholder={type === 'email' ? 'you@example.com' : '(555) 000-0000'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            type={type === 'email' ? 'email' : 'tel'}
                            className="rounded-xl"
                        />

                        <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary-100" isLoading={isLoading}>
                            Send Verification Code
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <Input
                            label="Verification Code"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="rounded-xl text-center tracking-widest text-lg font-black"
                        />

                        <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary-100" isLoading={isLoading}>
                            Verify & Continue
                        </Button>

                        <button
                            type="button"
                            onClick={() => setStep('request')}
                            className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors"
                        >
                            Back to change {type}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                        Safe & Secure • No Password Required
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default function GuestSignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <GuestSignupContent />
        </Suspense>
    );
}
