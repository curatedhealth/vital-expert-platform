'use client';

import { cn } from '../../lib/utils';
import { 
  CheckCircle, 
  Circle, 
  Loader2, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'skipped';

interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
  timestamp?: Date;
  duration?: number;
  agent?: {
    name: string;
    level: string;
  };
}

interface VitalProgressTimelineProps {
  steps: TimelineStep[];
  currentStepId?: string;
  orientation?: 'vertical' | 'horizontal';
  showTimestamps?: boolean;
  showDuration?: boolean;
  className?: string;
}

const statusConfig: Record<StepStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  lineColor: string;
}> = {
  pending: { 
    icon: Circle, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    lineColor: 'bg-muted'
  },
  active: { 
    icon: Loader2, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    lineColor: 'bg-blue-500'
  },
  complete: { 
    icon: CheckCircle, 
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
    lineColor: 'bg-green-500'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900',
    lineColor: 'bg-red-500'
  },
  skipped: { 
    icon: AlertTriangle, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    lineColor: 'bg-orange-500'
  },
};

/**
 * VitalProgressTimeline - Workflow progress timeline component
 * 
 * Displays workflow steps with status indicators, timestamps,
 * and agent information in vertical or horizontal orientation.
 */
export function VitalProgressTimeline({
  steps,
  currentStepId,
  orientation = 'vertical',
  showTimestamps = true,
  showDuration = true,
  className
}: VitalProgressTimelineProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };
  
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  
  if (orientation === 'horizontal') {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;
            const isLast = index === steps.length - 1;
            const isCurrent = step.id === currentStepId;
            
            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center",
                  !isLast && "flex-1"
                )}
              >
                {/* Step */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    config.bgColor,
                    isCurrent && "ring-2 ring-offset-2 ring-blue-500"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      config.color,
                      step.status === 'active' && "animate-spin"
                    )} />
                  </div>
                  <span className={cn(
                    "mt-2 text-xs font-medium text-center max-w-20",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                
                {/* Connector */}
                {!isLast && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    step.status === 'complete' ? config.lineColor : 'bg-muted'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Vertical orientation
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;
        const isCurrent = step.id === currentStepId;
        
        return (
          <div key={step.id} className="flex gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                config.bgColor,
                isCurrent && "ring-2 ring-offset-2 ring-blue-500"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  config.color,
                  step.status === 'active' && "animate-spin"
                )} />
              </div>
              {!isLast && (
                <div className={cn(
                  "w-0.5 flex-1 min-h-8",
                  step.status === 'complete' ? config.lineColor : 'bg-muted'
                )} />
              )}
            </div>
            
            {/* Content */}
            <div className={cn(
              "pb-6",
              isLast && "pb-0"
            )}>
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-medium text-sm",
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {step.title}
                </h4>
                {step.agent && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {step.agent.level} · {step.agent.name}
                  </span>
                )}
              </div>
              
              {step.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {showTimestamps && step.timestamp && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(step.timestamp)}
                  </span>
                )}
                {showDuration && step.duration !== undefined && (
                  <span>{formatDuration(step.duration)}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VitalProgressTimeline;
