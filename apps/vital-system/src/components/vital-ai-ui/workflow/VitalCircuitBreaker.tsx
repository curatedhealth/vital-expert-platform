'use client';

import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  XCircle, 
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitStats {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  lastFailure?: Date;
  consecutiveFailures: number;
}

interface VitalCircuitBreakerProps {
  state: CircuitState;
  stats?: CircuitStats;
  errorMessage?: string;
  onRetry?: () => void;
  onReset?: () => void;
  retryCountdown?: number;
  maxRetries?: number;
  currentRetry?: number;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

const stateConfig: Record<CircuitState, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = {
  closed: {
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    label: 'Healthy',
    description: 'System operating normally'
  },
  open: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    label: 'Circuit Open',
    description: 'Service temporarily unavailable'
  },
  'half-open': {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    label: 'Recovery Mode',
    description: 'Testing service availability'
  },
};

/**
 * VitalCircuitBreaker - Circuit breaker status display
 * 
 * Shows circuit breaker state with retry options and
 * failure statistics for system resilience visibility.
 */
export function VitalCircuitBreaker({
  state,
  stats,
  errorMessage,
  onRetry,
  onReset,
  retryCountdown,
  maxRetries,
  currentRetry,
  variant = 'card',
  className
}: VitalCircuitBreakerProps) {
  const config = stateConfig[state];
  const Icon = config.icon;
  
  const failureRate = stats && stats.totalRequests > 0
    ? (stats.failedRequests / stats.totalRequests) * 100
    : 0;
  
  if (variant === 'inline') {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
        config.bgColor,
        className
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="font-medium">{config.label}</span>
        {state === 'open' && retryCountdown && (
          <span className="text-xs text-muted-foreground">
            Retry in {retryCountdown}s
          </span>
        )}
      </div>
    );
  }
  
  if (variant === 'banner') {
    if (state === 'closed') return null;
    
    return (
      <div className={cn(
        "flex items-center justify-between p-3 border rounded-lg",
        config.bgColor,
        className
      )}>
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", config.color)} />
          <div>
            <span className="font-medium">{config.label}</span>
            <span className="text-muted-foreground ml-2">—</span>
            <span className="text-muted-foreground ml-2">{config.description}</span>
          </div>
        </div>
        
        {onRetry && state !== 'closed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={retryCountdown !== undefined && retryCountdown > 0}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryCountdown ? `Retry in ${retryCountdown}s` : 'Retry'}
          </Button>
        )}
      </div>
    );
  }
  
  // Card variant
  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4",
      config.bgColor,
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            state === 'closed' ? 'bg-green-100 dark:bg-green-900' :
            state === 'open' ? 'bg-red-100 dark:bg-red-900' :
            'bg-yellow-100 dark:bg-yellow-900'
          )}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <h4 className="font-medium">{config.label}</h4>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        {state === 'open' && retryCountdown && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Retry in {retryCountdown}s</span>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && state !== 'closed' && (
        <div className="text-sm bg-background rounded p-3 border">
          <span className="font-medium text-red-600">Error: </span>
          {errorMessage}
        </div>
      )}
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulRequests}
            </div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.failedRequests}
            </div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      )}
      
      {/* Failure rate */}
      {stats && stats.totalRequests > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Failure Rate</span>
            <span className={cn(
              "font-medium",
              failureRate > 50 ? "text-red-600" : 
              failureRate > 20 ? "text-yellow-600" : 
              "text-green-600"
            )}>
              {failureRate.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={failureRate} 
            className={cn(
              "h-2",
              failureRate > 50 ? "[&>div]:bg-red-500" :
              failureRate > 20 ? "[&>div]:bg-yellow-500" :
              "[&>div]:bg-green-500"
            )}
          />
        </div>
      )}
      
      {/* Retry progress */}
      {maxRetries && currentRetry !== undefined && state !== 'closed' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          <span>Retry attempt {currentRetry} of {maxRetries}</span>
        </div>
      )}
      
      {/* Actions */}
      {(onRetry || onReset) && state !== 'closed' && (
        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={retryCountdown !== undefined && retryCountdown > 0}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCountdown ? `Retry in ${retryCountdown}s` : 'Retry Now'}
            </Button>
          )}
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
            >
              Reset Circuit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default VitalCircuitBreaker;
