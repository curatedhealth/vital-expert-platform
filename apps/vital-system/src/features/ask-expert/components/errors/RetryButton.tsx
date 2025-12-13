'use client';

/**
 * VITAL Platform - Retry Button Component
 *
 * Smart retry button with exponential backoff and loading state.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface RetryButtonProps {
  /** Async function to retry */
  onRetry: () => Promise<void>;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Initial delay in ms (doubles with each retry) */
  initialDelayMs?: number;
  /** Button text variants */
  labels?: {
    idle?: string;
    retrying?: string;
    success?: string;
    failed?: string;
  };
  /** Custom class names */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Variant */
  variant?: 'primary' | 'secondary' | 'ghost';
}

type RetryState = 'idle' | 'retrying' | 'success' | 'failed';

// =============================================================================
// COMPONENT
// =============================================================================

export function RetryButton({
  onRetry,
  maxRetries = 3,
  initialDelayMs = 1000,
  labels = {},
  className,
  disabled = false,
  compact = false,
  variant = 'primary',
}: RetryButtonProps) {
  const [state, setState] = useState<RetryState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const defaultLabels = {
    idle: 'Try Again',
    retrying: 'Retrying...',
    success: 'Success!',
    failed: 'Failed',
    ...labels,
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Reset after success/failure
  useEffect(() => {
    if (state === 'success' || state === 'failed') {
      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, 2000);
    }
  }, [state]);

  const handleRetry = useCallback(async () => {
    if (state === 'retrying' || disabled) return;

    setState('retrying');

    try {
      await onRetry();
      setState('success');
      setRetryCount(0);
    } catch (error) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount < maxRetries) {
        // Schedule auto-retry with exponential backoff
        const delay = initialDelayMs * Math.pow(2, newRetryCount - 1);
        setCountdown(Math.ceil(delay / 1000));

        // Update countdown every second
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Auto-retry after delay
        timeoutRef.current = setTimeout(() => {
          handleRetry();
        }, delay);
      } else {
        setState('failed');
      }
    }
  }, [state, disabled, onRetry, retryCount, maxRetries, initialDelayMs]);

  const getButtonStyles = () => {
    const base = cn(
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all',
      compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    );

    const variants = {
      primary: cn(
        base,
        state === 'success' && 'bg-green-600 text-white',
        state === 'failed' && 'bg-red-600 text-white',
        state === 'idle' && 'bg-purple-600 text-white hover:bg-purple-700',
        state === 'retrying' && 'bg-purple-500 text-white'
      ),
      secondary: cn(
        base,
        'border',
        state === 'success' && 'border-green-300 bg-green-50 text-green-700',
        state === 'failed' && 'border-red-300 bg-red-50 text-red-700',
        state === 'idle' && 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        state === 'retrying' && 'border-purple-200 bg-purple-50 text-purple-700'
      ),
      ghost: cn(
        base,
        state === 'success' && 'text-green-600 hover:bg-green-50',
        state === 'failed' && 'text-red-600 hover:bg-red-50',
        state === 'idle' && 'text-slate-600 hover:bg-slate-100',
        state === 'retrying' && 'text-purple-600'
      ),
    };

    return variants[variant];
  };

  const getIcon = () => {
    switch (state) {
      case 'retrying':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    if (state === 'retrying' && countdown > 0) {
      return `Retrying in ${countdown}s...`;
    }
    return defaultLabels[state];
  };

  return (
    <button
      onClick={handleRetry}
      disabled={disabled || state === 'retrying'}
      className={cn(getButtonStyles(), className)}
    >
      {getIcon()}
      {!compact && <span>{getLabel()}</span>}
      {!compact && retryCount > 0 && state === 'idle' && (
        <span className="text-xs opacity-70">
          ({retryCount}/{maxRetries})
        </span>
      )}
    </button>
  );
}

export default RetryButton;
