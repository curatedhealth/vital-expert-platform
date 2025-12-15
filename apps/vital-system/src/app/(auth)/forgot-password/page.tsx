'use client';

/**
 * Forgot Password Page - Brand v6.0 Compliant
 *
 * Uses @vital/ui shadcn components for consistency
 * Colors: Purple primary, Stone neutrals, warm backgrounds
 * Tagline: "Human Genius, Amplified"
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@vital/ui';
import { createClient } from '@/lib/supabase/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (resetError) {
        throw resetError;
      }
      
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-stone-50 to-purple-50/50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-stone-900">Check your email</CardTitle>
            <CardDescription className="text-stone-600">
              We've sent you a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-stone-500">
                If an account with that email exists, we've sent you a link to reset your password.
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-stone-200 text-stone-700 hover:bg-stone-50"
              >
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-stone-50 to-purple-50/50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo Section - Brand v6.0 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
            VITAL Expert
          </h1>
          <p className="text-stone-600 text-sm">Human Genius, Amplified</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-stone-900">Reset your password</CardTitle>
            <CardDescription className="text-stone-600">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className="w-full pl-10 border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center transition-colors"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-stone-500">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
