'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheck, FiAlertCircle, FiMail } from 'react-icons/fi';
import { Card, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setError('Invalid or missing verification token');
        toast.error('Invalid verification link');
        return;
      }

      try {
        await api.verifyEmail(token);
        setStatus('success');
        toast.success('Email verified successfully!');

        // Start countdown for redirect
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          'Failed to verify email. The link may have expired.';
        setStatus('error');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    try {
      await api.resendVerification();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      toast.error('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <Card className="shadow-lg">
        <CardBody className="p-8">
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Spinner size="lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your email has been verified. You can now access all features of your account.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Redirecting you to your dashboard in{' '}
                  <span className="font-bold text-blue-700">{countdown}</span>{' '}
                  {countdown === 1 ? 'second' : 'seconds'}...
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'We couldn\'t verify your email address.'}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FiMail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-amber-900 font-medium mb-1">
                      Need a new verification link?
                    </p>
                    <p className="text-sm text-amber-800">
                      The link may have expired. You can request a new verification email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
