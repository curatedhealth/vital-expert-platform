/**
 * VitalAgentMetrics - Agent Performance Metrics Display
 * 
 * Displays agent performance metrics including success rate,
 * response time, rating, and consultation count.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  Zap,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import type { AgentMetrics } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalAgentMetricsProps {
  /** Agent metrics data */
  metrics: AgentMetrics;
  
  /** Display layout */
  layout?: 'horizontal' | 'vertical' | 'grid';
  
  /** Display size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Which metrics to show (defaults to all available) */
  show?: Array<'success_rate' | 'response_time' | 'rating' | 'tasks' | 'consultations' | 'confidence' | 'error_rate'>;
  
  /** Show icons */
  showIcons?: boolean;
  
  /** Show labels */
  showLabels?: boolean;
  
  /** Compact mode - minimal text */
  compact?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    wrapper: 'gap-2',
    icon: 'h-3 w-3',
    value: 'text-sm font-semibold',
    label: 'text-[10px]',
    subtext: 'text-[10px]',
  },
  md: {
    wrapper: 'gap-3',
    icon: 'h-4 w-4',
    value: 'text-base font-semibold',
    label: 'text-xs',
    subtext: 'text-xs',
  },
  lg: {
    wrapper: 'gap-4',
    icon: 'h-5 w-5',
    value: 'text-lg font-bold',
    label: 'text-sm',
    subtext: 'text-sm',
  },
} as const;

// ============================================================================
// METRIC ITEM COMPONENT
// ============================================================================

/**
 * Individual metric display item
 */
export function MetricItem({
  icon,
  label,
  value,
  subtext,
  color,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
}: MetricItemProps) {
  const sizeConfig = SIZE_CONFIG[size];
  
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <span className={cn(sizeConfig.icon, color || 'text-muted-foreground')}>
            {icon}
          </span>
        )}
        <span className={cn(sizeConfig.value, color)}>{value}</span>
        {subtext && (
          <span className={cn(sizeConfig.subtext, 'text-muted-foreground')}>
            {subtext}
          </span>
        )}
      </div>
      {showLabel && (
        <span className={cn(sizeConfig.label, 'text-muted-foreground mt-0.5')}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN METRICS COMPONENT
// ============================================================================

/**
 * VitalAgentMetrics displays agent performance metrics in various layouts.
 * 
 * Features:
 * - Multiple layout options (horizontal, vertical, grid)
 * - Configurable metric visibility
 * - Color-coded values based on thresholds
 * - Responsive sizing
 * 
 * @example
 * ```tsx
 * <VitalAgentMetrics
 *   metrics={{
 *     success_rate: 95,
 *     avg_response_time: 2.3,
 *     rating: 4.8,
 *     tasks_completed: 234,
 *   }}
 *   layout="grid"
 * />
 * ```
 */
export function VitalAgentMetrics({
  metrics,
  layout = 'horizontal',
  size = 'md',
  show,
  showIcons = true,
  showLabels = true,
  compact = false,
  className,
}: VitalAgentMetricsProps) {
  const sizeConfig = SIZE_CONFIG[size];
  
  // Helper to get color based on value thresholds
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (rate >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const getResponseTimeColor = (time: number) => {
    if (time <= 2) return 'text-emerald-600 dark:text-emerald-400';
    if (time <= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-amber-500';
    if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };
  
  // Build metrics array based on available data and show filter
  const metricItems: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
  }> = [];
  
  const shouldShow = (key: string) => !show || show.includes(key as any);
  
  // Success Rate
  if (metrics.success_rate !== undefined && shouldShow('success_rate')) {
    metricItems.push({
      key: 'success_rate',
      icon: <TrendingUp />,
      label: compact ? 'Success' : 'Success Rate',
      value: `${metrics.success_rate}%`,
      color: getSuccessRateColor(metrics.success_rate),
    });
  }
  
  // Response Time
  if (metrics.avg_response_time !== undefined && shouldShow('response_time')) {
    metricItems.push({
      key: 'response_time',
      icon: <Clock />,
      label: compact ? 'Avg Time' : 'Avg Response',
      value: metrics.avg_response_time.toFixed(1),
      subtext: 's',
      color: getResponseTimeColor(metrics.avg_response_time),
    });
  }
  
  // Rating
  if (metrics.rating !== undefined && shouldShow('rating')) {
    metricItems.push({
      key: 'rating',
      icon: <Star className="fill-current" />,
      label: 'Rating',
      value: metrics.rating.toFixed(1),
      subtext: '/ 5',
      color: getRatingColor(metrics.rating),
    });
  }
  
  // Tasks Completed
  if (metrics.tasks_completed !== undefined && shouldShow('tasks')) {
    metricItems.push({
      key: 'tasks',
      icon: <CheckCircle2 />,
      label: compact ? 'Tasks' : 'Completed',
      value: metrics.tasks_completed.toLocaleString(),
      color: 'text-emerald-600 dark:text-emerald-400',
    });
  }
  
  // Consultations
  if (metrics.total_consultations !== undefined && shouldShow('consultations')) {
    metricItems.push({
      key: 'consultations',
      icon: <MessageSquare />,
      label: compact ? 'Consults' : 'Consultations',
      value: metrics.total_consultations.toLocaleString(),
      color: 'text-blue-600 dark:text-blue-400',
    });
  }
  
  // Confidence Score
  if (metrics.confidence_score !== undefined && shouldShow('confidence')) {
    metricItems.push({
      key: 'confidence',
      icon: <BarChart3 />,
      label: 'Confidence',
      value: `${metrics.confidence_score}%`,
      color: metrics.confidence_score >= 80 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : 'text-amber-600 dark:text-amber-400',
    });
  }
  
  // Error Rate
  if (metrics.error_rate !== undefined && shouldShow('error_rate')) {
    metricItems.push({
      key: 'error_rate',
      icon: <AlertTriangle />,
      label: 'Error Rate',
      value: `${metrics.error_rate}%`,
      color: metrics.error_rate <= 5 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : 'text-red-600 dark:text-red-400',
    });
  }
  
  if (metricItems.length === 0) {
    return null;
  }
  
  // Layout classes
  const layoutClasses = {
    horizontal: 'flex flex-wrap items-center',
    vertical: 'flex flex-col',
    grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };
  
  return (
    <div
      className={cn(
        layoutClasses[layout],
        sizeConfig.wrapper,
        className
      )}
    >
      {metricItems.map((item) => (
        <MetricItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          value={item.value}
          subtext={item.subtext}
          color={item.color}
          size={size}
          showIcon={showIcons}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================

export interface VitalAgentRatingProps {
  /** Rating value (0-5) */
  rating: number;
  
  /** Maximum stars */
  max?: number;
  
  /** Star size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show numeric value */
  showValue?: boolean;
  
  /** Show review count */
  reviewCount?: number;
  
  /** Interactive (for input) */
  interactive?: boolean;
  
  /** On rating change (for interactive mode) */
  onRatingChange?: (rating: number) => void;
  
  /** Additional CSS classes */
  className?: string;
}

const STAR_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

/**
 * Star rating display/input component
 */
export function VitalAgentRating({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  interactive = false,
  onRatingChange,
  className,
}: VitalAgentRatingProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  
  const displayRating = hoverRating ?? rating;
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(displayRating);
          
          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              className={cn(
                STAR_SIZES[size],
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
              onClick={() => interactive && onRatingChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
            >
              <Star
                className={cn(
                  'w-full h-full',
                  isFilled 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-muted-foreground/30'
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
      
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          {reviewCount.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentMetrics;
