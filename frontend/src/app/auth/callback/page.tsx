'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';
import { Card, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';

type CallbackStatus = 'processing' | 'success' | 'error';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract token and user data from URL parameters
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const userParam = searchParams.get('user');

        // Check for errors in the callback
        if (error) {
          setStatus('error');
          setError(decodeURIComponent(error));
          toast.error(decodeURIComponent(error));
          return;
        }

        // Validate required parameters
        if (!token || !userParam) {
          setStatus('error');
          setError('Invalid authentication response. Missing credentials.');
          toast.error('Authentication failed');
          return;
        }

        // Parse user data
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userParam));
        } catch (parseError) {
          setStatus('error');
          setError('Invalid user data received');
          toast.error('Authentication failed');
          return;
        }

        // Store authentication data
        setToken(token);
        setUser(user);

        // Update status and show success message
        setStatus('success');
        toast.success(`Welcome back, ${user.name}!`);

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err.message || 'An unexpected error occurred during authentication');
        toast.error('Authentication failed');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, setToken, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardBody className="p-8">
            {status === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Spinner size="lg" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Completing Sign In
                </h2>
                <p className="text-gray-600">
                  Please wait while we complete your authentication...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Authentication Successful!
                </h2>
                <p className="text-gray-600">
                  Redirecting you to your dashboard...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Authentication Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'We couldn\'t complete your authentication.'}
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-900">
                    <strong>What happened?</strong> There was an issue during the authentication process. This could be due to:
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1 text-left">
                    <li>• Cancelled authentication</li>
                    <li>• Network connectivity issues</li>
                    <li>• Invalid or expired authentication data</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => router.push('/login')}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/')}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
