'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Chat Error:', error, errorInfo);
    
    // Check if it's our specific error
    if (error.message?.includes('isAutomaticMode') || error.message?.includes('isAutonomousMode')) {
      console.log('🔧 Detected chat mode error, attempting to fix...');
      // Clear corrupted state
      try {
        localStorage.removeItem('chat-store');
        console.log('✅ Cleared corrupted chat store');
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
    }
  }

  handleReset = () => {
    try {
      // Clear all chat-related localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('chat') || key.includes('store')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Cleared all chat-related storage');
      this.setState({ hasError: false, error: undefined });
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to reset:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred in the chat system'}
            </p>
            
            {this.state.error?.message?.includes('isAutomaticMode') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  This appears to be a chat mode configuration error. The system will reset your chat settings.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset and Reload
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;