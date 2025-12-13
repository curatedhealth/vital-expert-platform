'use client';

/**
 * VITAL Platform - Ask Expert Error Boundary
 *
 * React Error Boundary for catching and handling errors in Ask Expert components.
 * Provides graceful degradation, retry logic, and user-friendly error messages.
 *
 * Features:
 * - Catches React render errors
 * - Classifies errors (transient vs permanent)
 * - Auto-retry for transient errors
 * - User-friendly fallback UI
 * - Error telemetry logging
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type ErrorType = 'network' | 'validation' | 'auth' | 'server' | 'unknown';
export type ErrorSeverity = 'transient' | 'permanent' | 'critical';

export interface ClassifiedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  originalError: Error;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: ClassifiedError, errorInfo: ErrorInfo) => void;
  /** Called when user clicks retry */
  onRetry?: () => void;
  /** Maximum auto-retry attempts for transient errors */
  maxRetries?: number;
  /** Delay between retries in ms */
  retryDelayMs?: number;
  /** Component name for error reporting */
  componentName?: string;
  /** Custom class names */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: ClassifiedError | null;
  retryCount: number;
  isRetrying: boolean;
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

function classifyError(error: Error): ClassifiedError {
  const message = error.message.toLowerCase();

  // Network errors (transient, retryable)
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    error.name === 'NetworkError' ||
    error.name === 'AbortError'
  ) {
    return {
      type: 'network',
      severity: 'transient',
      message: error.message,
      userMessage: 'Network connection issue. Please check your internet connection.',
      recoverable: true,
      retryable: true,
      originalError: error,
    };
  }

  // Auth errors (permanent, not retryable without action)
  if (
    message.includes('unauthorized') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('auth') ||
    message.includes('token')
  ) {
    return {
      type: 'auth',
      severity: 'permanent',
      message: error.message,
      userMessage: 'Session expired. Please log in again.',
      recoverable: true,
      retryable: false,
      originalError: error,
    };
  }

  // Server errors (transient, retryable)
  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('server')
  ) {
    return {
      type: 'server',
      severity: 'transient',
      message: error.message,
      userMessage: 'Server is temporarily unavailable. Please try again.',
      recoverable: true,
      retryable: true,
      originalError: error,
    };
  }

  // Validation errors (permanent, need user action)
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return {
      type: 'validation',
      severity: 'permanent',
      message: error.message,
      userMessage: 'Please check your input and try again.',
      recoverable: true,
      retryable: false,
      originalError: error,
    };
  }

  // Unknown errors (critical, may or may not be retryable)
  return {
    type: 'unknown',
    severity: 'critical',
    message: error.message,
    userMessage: 'Something went wrong. Our team has been notified.',
    recoverable: false,
    retryable: true,
    originalError: error,
  };
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  static defaultProps = {
    maxRetries: 3,
    retryDelayMs: 1000,
    componentName: 'AskExpert',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: classifyError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const classifiedError = classifyError(error);

    // Log error to console (in production, send to telemetry)
    console.error('[ErrorBoundary] Caught error:', {
      component: this.props.componentName,
      type: classifiedError.type,
      severity: classifiedError.severity,
      message: classifiedError.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call onError callback
    this.props.onError?.(classifiedError, errorInfo);

    // Auto-retry for transient errors
    if (classifiedError.retryable && this.state.retryCount < (this.props.maxRetries ?? 3)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  scheduleRetry = (): void => {
    const delay = (this.props.retryDelayMs ?? 1000) * Math.pow(2, this.state.retryCount);

    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
        isRetrying: false,
      }));
    }, delay);
  };

  handleManualRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    });
    this.props.onRetry?.();
  };

  handleGoHome = (): void => {
    window.location.href = '/ask-expert';
  };

  render(): ReactNode {
    const { hasError, error, retryCount, isRetrying } = this.state;
    const { children, fallback, maxRetries, className } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center min-h-[400px] p-8',
            'bg-gradient-to-b from-red-50 to-white rounded-xl border border-red-100',
            className
          )}
        >
          {/* Error Icon */}
          <div className="w-16 h-16 mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {error.severity === 'critical' ? 'Something went wrong' : 'Temporary issue'}
          </h2>
          <p className="text-slate-600 text-center max-w-md mb-6">
            {error.userMessage}
          </p>

          {/* Retry Status */}
          {isRetrying && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mb-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                Retrying automatically... (attempt {retryCount + 1}/{maxRetries})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {error.retryable && (
              <button
                onClick={this.handleManualRetry}
                disabled={isRetrying}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-purple-600 text-white hover:bg-purple-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            <button
              onClick={this.handleGoHome}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                'border border-slate-200 text-slate-700 hover:bg-slate-50'
              )}
            >
              <Home className="w-4 h-4" />
              Go to Ask Expert
            </button>
          </div>

          {/* Technical Details (collapsed) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 w-full max-w-md">
              <summary className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                <Bug className="w-4 h-4" />
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 overflow-auto">
                {JSON.stringify(
                  {
                    type: error.type,
                    severity: error.severity,
                    message: error.message,
                    retryCount,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
