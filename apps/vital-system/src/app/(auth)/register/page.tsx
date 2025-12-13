'use client';

/**
 * Register Page - Brand v6.0 Compliant
 *
 * Uses @vital/ui shadcn components for consistency
 * Colors: Purple primary, Stone neutrals, warm backgrounds
 * Tagline: "Human Genius, Amplified"
 */

import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@vital/ui';
import { supabase } from '@vital/sdk/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl || supabaseUrl === 'undefined') {
        // Development mode - use mock registration
        console.log('Development mode: Using mock registration');

        const mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          user_metadata: {
            name: fullName,
            organization: organization
          }
        };

        localStorage.setItem('vital-mock-user', JSON.stringify(mockUser));
        localStorage.setItem('vital-mock-session', JSON.stringify({ user: mockUser }));

        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Production mode - use real Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              organization: organization,
            },
          },
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess(true);
          if (data.user && !data.user.email_confirmed_at) {
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-stone-900">Welcome to VITAL Expert!</CardTitle>
              <CardDescription className="text-stone-600">
                Your account has been created successfully. You're being redirected to your dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-semibold text-stone-900">Create your account</CardTitle>
            <CardDescription className="text-stone-600">
              Join professionals transforming their organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-stone-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    className="border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium text-stone-700">
                    Organization
                  </Label>
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Company Inc"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    disabled={loading}
                    className="border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-stone-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="border-stone-200 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-stone-400 hover:text-stone-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-stone-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-stone-600">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors">
                  Sign in
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
