'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { Card, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get('token');

    if (!tokenParam) {
      setError('Invalid or missing reset token');
      setIsValidatingToken(false);
      return;
    }

    setToken(tokenParam);
    setIsValidatingToken(false);
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      setError(null);
      await api.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password reset successful!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to reset password. The link may have expired.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="w-full">
        <Card className="shadow-lg">
          <CardBody className="p-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Validating reset link...</p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="w-full">
        <Card className="shadow-lg">
          <CardBody className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/forgot-password')}
              >
                Request New Reset Link
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="shadow-lg">
        <CardBody className="p-8">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiLock className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600">
                  Enter your new password below
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">
                      Password reset failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Password Input */}
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Create a strong password"
                  leftIcon={<FiLock className="w-5 h-5" />}
                  error={errors.password?.message}
                  helperText="Must be at least 8 characters with uppercase, lowercase, and numbers"
                  disabled={isSubmitting}
                  {...register('password')}
                />

                {/* Confirm Password Input */}
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your password"
                  leftIcon={<FiLock className="w-5 h-5" />}
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Reset Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    Redirecting you to the sign in page...
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  Go to Sign In
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
