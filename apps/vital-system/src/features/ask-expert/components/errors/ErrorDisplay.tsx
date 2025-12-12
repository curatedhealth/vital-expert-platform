'use client';

/**
 * VITAL Platform - Error Display Component
 *
 * Displays user-friendly error messages with appropriate styling
 * based on error type and severity.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle, Wifi, Shield, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ErrorType, ErrorSeverity } from './ErrorBoundary';

// =============================================================================
// TYPES
// =============================================================================

export interface ErrorDisplayProps {
  /** Error type determines icon and color */
  type?: ErrorType;
  /** Severity determines styling */
  severity?: ErrorSeverity;
  /** Main error title */
  title?: string;
  /** Detailed error message */
  message: string;
  /** Additional details or guidance */
  details?: string;
  /** Action buttons */
  actions?: ReactNode;
  /** Custom class names */
  className?: string;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Dismissable */
  onDismiss?: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function getErrorIcon(type: ErrorType, className: string) {
  const icons: Record<ErrorType, ReactNode> = {
    network: <Wifi className={className} />,
    auth: <Shield className={className} />,
    server: <Server className={className} />,
    validation: <AlertTriangle className={className} />,
    unknown: <AlertCircle className={className} />,
  };
  return icons[type] || icons.unknown;
}

function getErrorColors(severity: ErrorSeverity) {
  const colors: Record<ErrorSeverity, { bg: string; border: string; text: string; icon: string }> = {
    transient: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-600',
    },
    permanent: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
    },
    critical: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-900',
      icon: 'text-red-700',
    },
  };
  return colors[severity] || colors.permanent;
}

function getDefaultTitle(type: ErrorType, severity: ErrorSeverity): string {
  if (severity === 'transient') {
    return 'Temporary Issue';
  }

  const titles: Record<ErrorType, string> = {
    network: 'Connection Error',
    auth: 'Authentication Required',
    server: 'Server Error',
    validation: 'Invalid Input',
    unknown: 'Error',
  };
  return titles[type] || 'Error';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ErrorDisplay({
  type = 'unknown',
  severity = 'permanent',
  title,
  message,
  details,
  actions,
  className,
  compact = false,
  onDismiss,
}: ErrorDisplayProps) {
  const colors = getErrorColors(severity);
  const displayTitle = title || getDefaultTitle(type, severity);

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          colors.bg,
          colors.border,
          'border',
          className
        )}
      >
        {getErrorIcon(type, cn('w-4 h-4 flex-shrink-0', colors.icon))}
        <span className={cn('text-sm', colors.text)}>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('ml-auto p-1 rounded hover:bg-white/50', colors.text)}
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', colors.icon)}>
          {getErrorIcon(type, 'w-5 h-5')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={cn('font-semibold', colors.text)}>
            {displayTitle}
          </h3>

          {/* Message */}
          <p className={cn('mt-1 text-sm', colors.text, 'opacity-90')}>
            {message}
          </p>

          {/* Details */}
          {details && (
            <p className={cn('mt-2 text-xs', colors.text, 'opacity-70')}>
              {details}
            </p>
          )}

          {/* Actions */}
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors',
              colors.text
            )}
            aria-label="Dismiss"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorDisplay;
