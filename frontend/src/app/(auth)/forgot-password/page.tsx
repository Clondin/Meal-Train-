'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Card, CardBody } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: data.email,
      });
      setIsSuccess(true);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleResend = async () => {
    const email = getValues('email');
    if (email) {
      try {
        await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
        toast.success('Reset email resent!');
      } catch (err: any) {
        toast.error('Failed to resend email. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      <Card className="shadow-lg">
        <CardBody className="p-8">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  No worries, we&apos;ll send you reset instructions
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">
                      Error sending reset email
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Input */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<FiMail className="w-5 h-5" />}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  helperText="Enter the email address associated with your account"
                  {...register('email')}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Reset Instructions
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium group"
                >
                  <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent password reset instructions to{' '}
                  <span className="font-medium text-gray-900">
                    {getValues('email')}
                  </span>
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Didn&apos;t receive the email?</strong> Check your
                    spam folder or{' '}
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      click here to resend
                    </button>
                  </p>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => (window.location.href = '/login')}
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
