'use client';

import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@vital/ui';
import { Card } from '@vital/ui';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Application Error
            </h1>
            <p className="text-sm text-muted-foreground">
              Something went wrong in the application. Your data is safe.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="w-full p-3 bg-muted rounded-md text-left">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Button
              onClick={() => reset()}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
