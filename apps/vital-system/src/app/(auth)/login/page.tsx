'use client';

/**
 * Login Page - Brand v6.0 Compliant
 *
 * Uses @vital/ui shadcn components for consistency
 * Colors: Purple primary, Stone neutrals, warm backgrounds
 * Tagline: "Human Genius, Amplified"
 */

import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@vital/ui';
import { login } from './actions';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [redirectTo, setRedirectTo] = useState('/dashboard');

  // Get redirect parameter from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        setRedirectTo(redirect);
      }
    }
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setError('');
    formData.append('redirectTo', redirectTo);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-stone-50 to-purple-50/50 flex items-center justify-center p-4">
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
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-stone-900">Welcome back</CardTitle>
            <CardDescription className="text-stone-600">
              Sign in to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  disabled={isPending}
                  className="h-12 border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    disabled={isPending}
                    className="h-12 border-stone-200 focus:border-purple-500 focus:ring-purple-500/20 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-400 hover:text-stone-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-stone-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link href="/" className="inline-flex items-center text-sm text-stone-500 hover:text-stone-700 transition-colors">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
