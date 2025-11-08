/**
 * Connection Status Component
 * 
 * Shows real-time connection status for SSE streaming.
 * Displays connection health and provides manual reconnect option.
 * 
 * Features:
 * - Real-time status indicator
 * - Auto-reconnect with exponential backoff
 * - Manual reconnect button
 * - Connection error display
 * - Minimal, non-intrusive UI
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ConnectionStatusProps {
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Number of reconnection attempts */
  reconnectAttempts?: number;
  
  /** Maximum reconnection attempts before giving up */
  maxReconnectAttempts?: number;
  
  /** Last error message */
  error?: string;
  
  /** Callback to manually reconnect */
  onReconnect?: () => void;
  
  /** Show detailed information */
  showDetails?: boolean;
  
  /** Compact mode (smaller display) */
  compact?: boolean;
  
  /** Additional className */
  className?: string;
}

export function ConnectionStatusComponent({
  status,
  reconnectAttempts = 0,
  maxReconnectAttempts = 3,
  error,
  onReconnect,
  showDetails = false,
  compact = false,
  className,
}: ConnectionStatusProps) {
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'connecting':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'connecting':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return reconnectAttempts > 0 
          ? `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`
          : 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };
  
  // Compact mode - single line badge
  if (compact) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-1.5 text-xs',
          getStatusColor(),
          className
        )}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>
    );
  }
  
  // Don't show card if connected and not showing details
  if (status === 'connected' && !showDetails) {
    return null;
  }
  
  // Full display mode
  return (
    <Card className={cn('border-l-4', className, {
      'border-l-green-500': status === 'connected',
      'border-l-blue-500': status === 'connecting',
      'border-l-yellow-500': status === 'disconnected',
      'border-l-red-500': status === 'error',
    })}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Status Info */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-1.5 rounded-full',
              status === 'connected' && 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
              status === 'connecting' && 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
              (status === 'disconnected' || status === 'error') && 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
            )}>
              {status === 'connected' && <Wifi className="h-4 w-4" />}
              {status === 'connecting' && <RefreshCw className="h-4 w-4 animate-spin" />}
              {(status === 'disconnected' || status === 'error') && <WifiOff className="h-4 w-4" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {getStatusText()}
                </span>
                
                {reconnectAttempts > 0 && status === 'connecting' && (
                  <Badge variant="outline" className="text-xs">
                    Attempt {reconnectAttempts}/{maxReconnectAttempts}
                  </Badge>
                )}
              </div>
              
              {/* Error message */}
              {error && (
                <div className="flex items-start gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">
                    {error}
                  </p>
                </div>
              )}
              
              {/* Connecting message */}
              {status === 'connecting' && !error && (
                <p className="text-xs text-muted-foreground mt-1">
                  Establishing connection to AI engine...
                </p>
              )}
              
              {/* Disconnected message */}
              {status === 'disconnected' && !error && (
                <p className="text-xs text-muted-foreground mt-1">
                  Connection lost. Will retry automatically.
                </p>
              )}
            </div>
          </div>
          
          {/* Reconnect Button */}
          {(status === 'disconnected' || status === 'error') && onReconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              className="flex items-center gap-1 text-xs h-7"
            >
              <RefreshCw className="h-3 w-3" />
              Reconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for managing connection status
export function useConnectionStatus() {
  const [status, setStatus] = React.useState<ConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0);
  const [error, setError] = React.useState<string>();
  const [maxReconnectAttempts] = React.useState(3);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout>();
  
  const connect = React.useCallback(() => {
    setStatus('connecting');
    setError(undefined);
  }, []);
  
  const connected = React.useCallback(() => {
    setStatus('connected');
    setReconnectAttempts(0);
    setError(undefined);
  }, []);
  
  const disconnect = React.useCallback((errorMessage?: string) => {
    if (errorMessage) {
      setStatus('error');
      setError(errorMessage);
    } else {
      setStatus('disconnected');
    }
  }, []);
  
  const reconnect = React.useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setStatus('error');
      setError('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }
    
    setReconnectAttempts(prev => prev + 1);
    setStatus('connecting');
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 4000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      // Trigger reconnection in parent component
      setStatus('connecting');
    }, delay);
  }, [reconnectAttempts, maxReconnectAttempts]);
  
  const reset = React.useCallback(() => {
    setStatus('disconnected');
    setReconnectAttempts(0);
    setError(undefined);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    status,
    reconnectAttempts,
    maxReconnectAttempts,
    error,
    connect,
    connected,
    disconnect,
    reconnect,
    reset,
  };
}

