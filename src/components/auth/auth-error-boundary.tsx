'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authErrorRecovery } from '@/error-recovery';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    // Clear retry counts before retrying
    authErrorRecovery.resetAllRetryCounts();
    this.setState({ hasError: false, error: undefined });
    // Reload the page to reinitialize auth
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong with the authentication system. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-muted-foreground">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
              )}
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}