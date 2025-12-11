'use client';

/**
 * VITAL Platform - VitalStreamErrorBoundary Component
 *
 * Error boundary specialized for SSE streaming errors.
 * Provides graceful degradation and recovery options.
 *
 * Features:
 * - Catches streaming errors without crashing the app
 * - Differentiates error types: network, timeout, server, rate limit
 * - Auto-retry with exponential backoff option
 * - Manual retry button
 * - Fallback UI that maintains layout
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 *
 * Audit Fixes Applied (December 11, 2025):
 * - Added isMounted flag to prevent setState after unmount
 * - Proper cleanup in componentWillUnmount
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Clock,
  ServerCrash,
  Gauge,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type StreamErrorType =
  | 'network'      // Connection lost
  | 'timeout'      // Request timed out
  | 'server'       // 5xx server error
  | 'rate_limit'   // 429 Too Many Requests
  | 'parse'        // Failed to parse SSE
  | 'unknown';     // Catch-all

export interface StreamError extends Error {
  type?: StreamErrorType;
  statusCode?: number;
  retryAfter?: number;
  recoverable?: boolean;
}

export interface VitalStreamErrorBoundaryProps {
  children: ReactNode;
  /** Called when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when user clicks retry */
  onRetry?: () => void;
  /** Enable auto-retry with exponential backoff */
  autoRetry?: boolean;
  /** Max auto-retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms (default: 1000) */
  baseDelay?: number;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Custom class names */
  className?: string;
}

interface State {
  hasError: boolean;
  error: StreamError | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
}

// =============================================================================
// ERROR TYPE CONFIG
// =============================================================================

const ERROR_CONFIG: Record<StreamErrorType, {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  network: {
    icon: WifiOff,
    title: 'Connection Lost',
    description: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  timeout: {
    icon: Clock,
    title: 'Request Timed Out',
    description: 'The server is taking too long to respond. Please try again.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  server: {
    icon: ServerCrash,
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  rate_limit: {
    icon: Gauge,
    title: 'Rate Limited',
    description: 'Too many requests. Please wait a moment before trying again.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  parse: {
    icon: AlertTriangle,
    title: 'Data Error',
    description: 'Received unexpected data from the server.',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  unknown: {
    icon: HelpCircle,
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export class VitalStreamErrorBoundary extends Component<
  VitalStreamErrorBoundaryProps,
  State
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private isMounted = false;

  static defaultProps = {
    autoRetry: false,
    maxRetries: 3,
    baseDelay: 1000,
  };

  constructor(props: VitalStreamErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    };
  }

  componentDidMount() {
    this.isMounted = true;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error: error as StreamError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const streamError = error as StreamError;

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error details
    console.error('[VitalStreamErrorBoundary] Caught error:', {
      type: streamError.type || 'unknown',
      message: error.message,
      statusCode: streamError.statusCode,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Auto-retry if enabled and error is recoverable
    if (
      this.props.autoRetry &&
      streamError.recoverable !== false &&
      this.state.retryCount < (this.props.maxRetries || 3)
    ) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  private getErrorType(): StreamErrorType {
    const error = this.state.error;
    if (!error) return 'unknown';

    if (error.type) return error.type;

    // Infer type from status code
    if (error.statusCode) {
      if (error.statusCode === 429) return 'rate_limit';
      if (error.statusCode >= 500) return 'server';
    }

    // Infer from error message
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('timeout') || message.includes('timed out')) return 'timeout';
    if (message.includes('parse') || message.includes('json')) return 'parse';

    return 'unknown';
  }

  private scheduleRetry() {
    // Guard against scheduling retry after unmount
    if (!this.isMounted) return;

    const delay = this.calculateBackoffDelay();

    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  }

  private calculateBackoffDelay(): number {
    const { baseDelay = 1000 } = this.props;
    const { retryCount, error } = this.state;

    // Use server-provided retry-after if available
    if (error?.retryAfter) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30s
  }

  private handleRetry = () => {
    // Guard against setState after unmount
    if (!this.isMounted) return;

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
      isRetrying: false,
    }));

    this.props.onRetry?.();
  };

  private handleManualRetry = () => {
    // Guard against setState after unmount
    if (!this.isMounted) return;

    this.setState({
      retryCount: 0, // Reset retry count for manual retry
    });
    this.handleRetry();
  };

  private toggleDetails = () => {
    // Guard against setState after unmount
    if (!this.isMounted) return;
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, isRetrying, showDetails, retryCount } = this.state;
    const { children, fallback, className, maxRetries = 3 } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const errorType = this.getErrorType();
    const config = ERROR_CONFIG[errorType];
    const Icon = config.icon;
    const canRetry = retryCount < maxRetries;

    return (
      <Card
        className={cn(
          'border-2',
          config.bgColor,
          `border-${config.color.replace('text-', '')}/30`,
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', config.bgColor)}>
              <Icon className={cn('h-6 w-6', config.color)} aria-hidden="true" />
            </div>

            <div className="flex-1">
              <h3 className={cn('text-lg font-semibold', config.color)}>
                {config.title}
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                {config.description}
              </p>

              {/* Status Code */}
              {error?.statusCode && (
                <p className="text-xs text-stone-500 mt-2">
                  Status: {error.statusCode}
                </p>
              )}

              {/* Retry Status */}
              {isRetrying && (
                <p className="text-sm text-stone-500 mt-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying automatically...
                </p>
              )}

              {/* Retry Count */}
              {retryCount > 0 && !isRetrying && (
                <p className="text-xs text-stone-500 mt-2">
                  Retry attempts: {retryCount}/{maxRetries}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={this.handleManualRetry}
              disabled={isRetrying}
              className={cn(
                'bg-[var(--ae-accent-primary,#9055E0)]',
                'hover:bg-[var(--ae-accent-hover,#7C3AED)]'
              )}
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')}
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>

            {/* Show Details Toggle */}
            <Button
              variant="outline"
              onClick={this.toggleDetails}
              className="text-stone-600"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 mr-2 transition-transform',
                  showDetails && 'rotate-180'
                )}
              />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Error Details (Collapsible) */}
          {showDetails && (
            <div className="mt-4 p-4 bg-white rounded-lg border text-sm font-mono overflow-x-auto">
              <p className="text-stone-800 font-semibold mb-2">Error Details:</p>
              <pre className="text-xs text-stone-600 whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    type: errorType,
                    message: error?.message,
                    statusCode: error?.statusCode,
                    retryAfter: error?.retryAfter,
                    recoverable: error?.recoverable,
                  },
                  null,
                  2
                )}
              </pre>

              {errorInfo?.componentStack && (
                <>
                  <p className="text-stone-800 font-semibold mt-4 mb-2">
                    Component Stack:
                  </p>
                  <pre className="text-xs text-stone-500 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

// =============================================================================
// FUNCTIONAL WRAPPER (for hooks support)
// =============================================================================

export interface UseStreamErrorBoundaryReturn {
  showBoundary: (error: StreamError) => void;
}

/**
 * Custom hook to imperatively trigger the error boundary
 * Usage: const { showBoundary } = useStreamErrorBoundary();
 */
export function createStreamError(
  message: string,
  options: {
    type?: StreamErrorType;
    statusCode?: number;
    retryAfter?: number;
    recoverable?: boolean;
  } = {}
): StreamError {
  const error = new Error(message) as StreamError;
  error.type = options.type;
  error.statusCode = options.statusCode;
  error.retryAfter = options.retryAfter;
  error.recoverable = options.recoverable ?? true;
  return error;
}

export default VitalStreamErrorBoundary;
