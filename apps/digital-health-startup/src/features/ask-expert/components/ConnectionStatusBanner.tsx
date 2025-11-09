/**
 * ConnectionStatusBanner Component
 * 
 * Displays connection quality with detailed metrics and actionable messages.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { ConnectionQuality } from '../hooks/useConnectionQuality';

export interface ConnectionStatusBannerProps {
  quality: ConnectionQuality;
  latencyMs?: number | null;
  packetLoss?: number;
  uptimePercent?: number;
  errorMessage?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const QUALITY_CONFIG: Record<ConnectionQuality, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  message: string;
}> = {
  excellent: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    message: 'Excellent connection',
  },
  good: {
    icon: <Wifi className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    message: 'Good connection',
  },
  fair: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    message: 'Fair connection - may be slow',
  },
  poor: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    message: 'Poor connection - experiencing delays',
  },
  offline: {
    icon: <WifiOff className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    message: 'Connection lost - attempting to reconnect',
  },
};

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  quality,
  latencyMs,
  packetLoss,
  uptimePercent,
  errorMessage,
  showDetails = false,
  onRetry,
  onDismiss,
  className = '',
}) => {
  const config = QUALITY_CONFIG[quality];
  
  // Don't show for excellent connections unless there's an error
  if (quality === 'excellent' && !errorMessage) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`connection-status-banner ${className}`}
    >
      <div className={`flex items-start gap-3 rounded-lg border p-4 ${config.bgColor}`}>
        <div className={`flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-medium ${config.color}`}>
              {errorMessage || config.message}
            </p>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {showDetails && (latencyMs || packetLoss || uptimePercent) && (
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              {latencyMs !== null && latencyMs !== undefined && (
                <span>Latency: {Math.round(latencyMs)}ms</span>
              )}
              {packetLoss !== undefined && packetLoss > 0 && (
                <span>Loss: {packetLoss.toFixed(1)}%</span>
              )}
              {uptimePercent !== undefined && (
                <span>Uptime: {uptimePercent.toFixed(1)}%</span>
              )}
            </div>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Try reconnecting
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

