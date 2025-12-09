'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

interface ConfidenceBreakdown {
  label: string;
  value: number;
  description?: string;
}

interface VitalConfidenceMeterProps {
  confidence: number;
  breakdown?: ConfidenceBreakdown[];
  showLabel?: boolean;
  showPercentage?: boolean;
  variant?: 'bar' | 'circular' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * VitalConfidenceMeter - Confidence indicator component
 * 
 * Displays confidence scores with visual indicators,
 * optional breakdown details, and contextual colors.
 */
export function VitalConfidenceMeter({
  confidence,
  breakdown,
  showLabel = true,
  showPercentage = true,
  variant = 'bar',
  size = 'md',
  className
}: VitalConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);
  
  const getConfidenceLevel = (value: number) => {
    if (value >= 0.8) return { label: 'High', color: 'green', icon: CheckCircle };
    if (value >= 0.5) return { label: 'Medium', color: 'yellow', icon: HelpCircle };
    return { label: 'Low', color: 'red', icon: AlertCircle };
  };
  
  const level = getConfidenceLevel(confidence);
  const Icon = level.icon;
  
  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      border: 'border-green-500',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-400',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      border: 'border-yellow-500',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      border: 'border-red-500',
    },
  };
  
  const colors = colorClasses[level.color as keyof typeof colorClasses];
  
  const sizeClasses = {
    sm: { bar: 'h-1', text: 'text-xs', icon: 'h-3 w-3', circular: 'h-12 w-12' },
    md: { bar: 'h-2', text: 'text-sm', icon: 'h-4 w-4', circular: 'h-16 w-16' },
    lg: { bar: 'h-3', text: 'text-base', icon: 'h-5 w-5', circular: 'h-20 w-20' },
  };
  
  const sizes = sizeClasses[size];
  
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full",
              colors.badge,
              className
            )}>
              <Icon className={sizes.icon} />
              <span className={cn("font-medium", sizes.text)}>
                {showPercentage ? `${percentage}%` : level.label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">{level.label} Confidence</div>
              {breakdown && (
                <div className="text-xs space-y-0.5">
                  {breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <span>{item.label}</span>
                      <span>{Math.round(item.value * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (confidence * circumference);
    
    return (
      <div className={cn("relative", sizes.circular, className)}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={colors.text}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizes.text)}>{percentage}%</span>
          {showLabel && (
            <span className="text-xs text-muted-foreground">{level.label}</span>
          )}
        </div>
      </div>
    );
  }
  
  // Bar variant (default)
  return (
    <div className={cn("space-y-1", className)}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <div className="flex items-center gap-1.5">
              <Icon className={cn(sizes.icon, colors.text)} />
              <span className={cn("font-medium", sizes.text, colors.text)}>
                {level.label} Confidence
              </span>
            </div>
          )}
          {showPercentage && (
            <span className={cn("font-medium", sizes.text)}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      <Progress 
        value={percentage} 
        className={cn(sizes.bar, `[&>div]:${colors.bg}`)}
      />
      
      {breakdown && breakdown.length > 0 && (
        <div className="space-y-1 pt-1">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex-1">
                {item.label}
              </span>
              <Progress 
                value={item.value * 100} 
                className="h-1 w-20"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(item.value * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VitalConfidenceMeter;
