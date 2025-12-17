/**
 * JobProgressCard Component
 * 
 * Displays real-time job progress with:
 * - Progress bar
 * - Step indicators
 * - Status badge
 * - Cancel button
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  Play,
} from 'lucide-react';
import type { JobStatus, JobProgress } from '../hooks/useJobStatus';

interface JobProgressCardProps {
  jobId: string;
  jobType?: string;
  status: JobStatus | null;
  progress: JobProgress | null;
  error: string | null;
  isLoading: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

const statusConfig: Record<JobStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}> = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    label: 'Running',
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    label: 'Failed',
  },
  cancelled: {
    icon: Ban,
    color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300',
    label: 'Cancelled',
  },
};

export function JobProgressCard({
  jobId,
  jobType = 'Job',
  status,
  progress,
  error,
  isLoading,
  onCancel,
  onRetry,
  className,
}: JobProgressCardProps) {
  const config = status ? statusConfig[status] : null;
  const Icon = config?.icon || AlertCircle;
  const isTerminal = status && ['completed', 'failed', 'cancelled'].includes(status);
  const canCancel = status && ['pending', 'running'].includes(status);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{jobType}</CardTitle>
          {config && (
            <Badge className={cn('gap-1', config.color)}>
              <Icon className={cn('h-3 w-3', status === 'running' && 'animate-spin')} />
              {config.label}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          ID: {jobId}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.currentStepDescription || `Step ${progress.currentStep}`}
              </span>
              <span className="font-medium">
                {progress.percentComplete !== undefined
                  ? `${Math.round(progress.percentComplete)}%`
                  : progress.totalSteps
                  ? `${progress.currentStep}/${progress.totalSteps}`
                  : `Step ${progress.currentStep}`}
              </span>
            </div>
            <Progress
              value={progress.percentComplete || (
                progress.totalSteps
                  ? (progress.currentStep / progress.totalSteps) * 100
                  : undefined
              )}
              className="h-2"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !progress && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading job status...</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Steps Timeline (if available) */}
        {progress?.totalSteps && progress.totalSteps > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: progress.totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  index < progress.currentStep
                    ? 'bg-green-500'
                    : index === progress.currentStep
                    ? 'bg-blue-500'
                    : 'bg-stone-200 dark:bg-stone-700'
                )}
              />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 ml-auto">
          {canCancel && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <Ban className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          {status === 'failed' && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <Play className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}











