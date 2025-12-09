'use client';

import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  XCircle,
  Zap,
  Settings,
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../ui/alert';
import { Progress } from '../../ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../ui/tooltip';

type TimeoutSeverity = 'warning' | 'critical' | 'expired';
type TimeoutAction = 'wait' | 'retry' | 'cancel' | 'extend';

interface TimeoutContext {
  operation: string;
  agent?: {
    name: string;
    level: string;
  };
  startedAt: Date;
  estimatedDuration?: number;
  reason?: string;
}

interface VitalTimeoutWarningProps {
  severity: TimeoutSeverity;
  elapsedMs: number;
  timeoutMs: number;
  context: TimeoutContext;
  onRetry?: () => void;
  onCancel?: () => void;
  onExtend?: (additionalMs: number) => void;
  onDismiss?: () => void;
  showProgress?: boolean;
  autoExtendEnabled?: boolean;
  className?: string;
}

const severityConfig: Record<
  TimeoutSeverity,
  { icon: typeof Clock; color: string; bgColor: string; label: string }
> = {
  warning: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Taking longer than expected',
  },
  critical: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Operation may timeout soon',
  },
  expired: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Operation timed out',
  },
};

export function VitalTimeoutWarning({
  severity,
  elapsedMs,
  timeoutMs,
  context,
  onRetry,
  onCancel,
  onExtend,
  onDismiss,
  showProgress = true,
  autoExtendEnabled = false,
  className,
}: VitalTimeoutWarningProps) {
  const [currentElapsed, setCurrentElapsed] = useState(elapsedMs);
  const config = severityConfig[severity];
  const Icon = config.icon;

  const progress = Math.min((currentElapsed / timeoutMs) * 100, 100);
  const remainingMs = Math.max(timeoutMs - currentElapsed, 0);
  const isExpired = severity === 'expired' || remainingMs === 0;

  // Update elapsed time in real-time
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setCurrentElapsed((prev) => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  // Sync with props
  useEffect(() => {
    setCurrentElapsed(elapsedMs);
  }, [elapsedMs]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getProgressColor = (): string => {
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-orange-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Alert
      className={cn(
        'relative overflow-hidden',
        config.bgColor,
        className
      )}
    >
      {/* Progress bar at top */}
      {showProgress && !isExpired && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30">
          <div
            className={cn('h-full transition-all duration-1000', getProgressColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5', config.color)} />

        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center gap-2">
            {config.label}
            {autoExtendEnabled && !isExpired && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    <Zap className="h-3 w-3" />
                    Auto-extend
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Timeout will be automatically extended if progress is detected
                </TooltipContent>
              </Tooltip>
            )}
          </AlertTitle>

          <AlertDescription className="mt-2 space-y-3">
            {/* Context info */}
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Operation:</span> {context.operation}
              </p>
              {context.agent && (
                <p className="text-muted-foreground">
                  Agent: {context.agent.name} ({context.agent.level})
                </p>
              )}
              {context.reason && (
                <p className="text-muted-foreground">
                  Reason: {context.reason}
                </p>
              )}
            </div>

            {/* Time stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Elapsed: {formatDuration(currentElapsed)}</span>
              </div>
              {!isExpired && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Remaining: {formatDuration(remainingMs)}</span>
                </div>
              )}
              {context.estimatedDuration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Est: {formatDuration(context.estimatedDuration)}</span>
                </div>
              )}
            </div>

            {/* Progress bar (detailed) */}
            {showProgress && (
              <div className="space-y-1">
                <Progress
                  value={progress}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0s</span>
                  <span className={cn(progress >= 75 && 'font-medium', config.color)}>
                    {Math.round(progress)}%
                  </span>
                  <span>{formatDuration(timeoutMs)}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              )}
              {onExtend && !isExpired && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExtend(30000)}
                  className="h-8"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  +30s
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Cancel
                </Button>
              )}
              {onDismiss && isExpired && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-8 ml-auto"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

// Compact inline variant
export function VitalTimeoutBadge({
  elapsedMs,
  timeoutMs,
  severity,
  onClick,
  className,
}: {
  elapsedMs: number;
  timeoutMs: number;
  severity: TimeoutSeverity;
  onClick?: () => void;
  className?: string;
}) {
  const progress = Math.min((elapsedMs / timeoutMs) * 100, 100);
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        'border transition-colors',
        config.bgColor,
        config.color,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{Math.round(elapsedMs / 1000)}s</span>
      <span className="text-muted-foreground">/</span>
      <span>{Math.round(timeoutMs / 1000)}s</span>
      <div className="w-8 h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            progress >= 90 ? 'bg-red-500' : progress >= 75 ? 'bg-orange-500' : 'bg-current'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
}

export type {
  TimeoutSeverity,
  TimeoutAction,
  TimeoutContext,
  VitalTimeoutWarningProps,
};
