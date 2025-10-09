'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { AuthLoadingScreen, AuthErrorScreen } from './auth-loading-screen';
import { AuthErrorBoundary } from './auth-error-boundary';

interface ClientAuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

export function ClientAuthWrapper({ 
  children, 
  requireAuth = false,
  fallback 
}: ClientAuthWrapperProps) {
  const { user, loading, error, isInitialized } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Handle hydration mismatch by only rendering on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading screen while initializing
  if (!isClient || loading || !isInitialized) {
    return <AuthLoadingScreen message="Initializing authentication..." />;
  }

  // Show error screen if there's an authentication error
  if (error) {
    return (
      <AuthErrorScreen 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  // Show fallback if authentication is required but user is not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">
            Please log in to access this page.
          </p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  return (
    <AuthErrorBoundary>
      <ClientAuthWrapper requireAuth={true} fallback={fallback}>
        {children}
      </ClientAuthWrapper>
    </AuthErrorBoundary>
  );
}

interface PublicPageWrapperProps {
  children: ReactNode;
}

export function PublicPageWrapper({ children }: PublicPageWrapperProps) {
  return (
    <AuthErrorBoundary>
      <ClientAuthWrapper requireAuth={false}>
        {children}
      </ClientAuthWrapper>
    </AuthErrorBoundary>
  );
}
