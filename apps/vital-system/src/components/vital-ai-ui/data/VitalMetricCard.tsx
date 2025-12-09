'use client';

import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

type TrendDirection = 'up' | 'down' | 'neutral';
type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';

interface VitalMetricCardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  changeValue?: string | number;
  changePercent?: number;
  trend?: TrendDirection;
  status?: MetricStatus;
  icon?: React.ReactNode;
  description?: string;
  format?: 'number' | 'currency' | 'percent' | 'duration';
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-muted-foreground',
};

const statusColors: Record<MetricStatus, string> = {
  success: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  error: 'border-l-red-500',
  neutral: 'border-l-slate-300',
};

/**
 * VitalMetricCard - Key metric display component
 * 
 * Shows a single metric with optional trend indicator,
 * change values, and status coloring.
 */
export function VitalMetricCard({
  label,
  value,
  previousValue,
  changeValue,
  changePercent,
  trend = 'neutral',
  status = 'neutral',
  icon,
  description,
  format = 'number',
  variant = 'default',
  className
}: VitalMetricCardProps) {
  const TrendIcon = trendIcons[trend];
  
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'duration':
        if (val < 1) return `${(val * 1000).toFixed(0)}ms`;
        if (val < 60) return `${val.toFixed(1)}s`;
        return `${(val / 60).toFixed(1)}m`;
      default:
        return val.toLocaleString();
    }
  };
  
  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center justify-between p-2 rounded-lg bg-muted/50",
        className
      )}>
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatValue(value)}</span>
          {changePercent !== undefined && (
            <span className={cn("text-xs flex items-center", trendColors[trend])}>
              {trend === 'up' && <ArrowUp className="h-3 w-3" />}
              {trend === 'down' && <ArrowDown className="h-3 w-3" />}
              {Math.abs(changePercent).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'large') {
    return (
      <div className={cn(
        "border rounded-lg p-6 border-l-4",
        statusColors[status],
        className
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
              {description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>{description}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-muted">
              {icon}
            </div>
          )}
        </div>
        
        <div className="text-4xl font-bold mb-2">{formatValue(value)}</div>
        
        {(changeValue !== undefined || changePercent !== undefined) && (
          <div className="flex items-center gap-2">
            <TrendIcon className={cn("h-4 w-4", trendColors[trend])} />
            <span className={cn("text-sm", trendColors[trend])}>
              {changeValue !== undefined && (
                <span className="font-medium">{formatValue(changeValue)}</span>
              )}
              {changePercent !== undefined && (
                <span className="ml-1">({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)</span>
              )}
            </span>
            {previousValue !== undefined && (
              <span className="text-sm text-muted-foreground">
                vs {formatValue(previousValue)}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={cn(
      "border rounded-lg p-4 border-l-4",
      statusColors[status],
      className
    )}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      
      <div className="text-2xl font-bold">{formatValue(value)}</div>
      
      {(changeValue !== undefined || changePercent !== undefined) && (
        <div className="flex items-center gap-1 mt-1">
          <TrendIcon className={cn("h-3 w-3", trendColors[trend])} />
          <span className={cn("text-xs", trendColors[trend])}>
            {changePercent !== undefined && (
              <>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</>
            )}
            {changeValue !== undefined && changePercent !== undefined && ' · '}
            {changeValue !== undefined && formatValue(changeValue)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * VitalMetricGrid - Grid of metric cards
 */
export function VitalMetricGrid({
  children,
  columns = 4,
  className
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };
  
  return (
    <div className={cn(
      "grid gap-4",
      `sm:${colClasses[Math.min(columns, 2) as 2]}`,
      `md:${colClasses[Math.min(columns, 3) as 3]}`,
      `lg:${colClasses[columns]}`,
      className
    )}>
      {children}
    </div>
  );
}

export default VitalMetricCard;
