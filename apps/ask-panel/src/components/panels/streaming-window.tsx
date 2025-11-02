'use client';

import { useState, useEffect } from 'react';
import { Loader2, Pause, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  step: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  duration?: number;
}

interface StreamingWindowProps {
  workflowSteps?: WorkflowStep[];
  reasoningSteps?: string[];
  isStreaming: boolean;
  canPause?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export function StreamingWindow({
  workflowSteps = [],
  reasoningSteps = [],
  isStreaming,
  canPause = false,
  onPause,
  onResume,
  className,
}: StreamingWindowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate progress
  const completedSteps = workflowSteps.filter(s => s.status === 'complete').length;
  const totalSteps = workflowSteps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handlePauseToggle = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  if (!isStreaming) return null;

  return (
    <Card className={cn("border-green-200 bg-green-50/50 shadow-sm", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Loader2 className={cn(
              "w-4 h-4 text-green-600",
              !isPaused && "animate-spin"
            )} />
            <span className="text-sm font-medium text-green-900">
              {isPaused ? 'Streaming Paused' : 'Streaming Response'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {completedSteps}/{totalSteps} steps
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {canPause && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePauseToggle}
                className="h-7 px-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                )}
              </Button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-green-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-green-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-green-600" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalSteps > 0 && (
          <div className="mb-3">
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-3">
            {/* Workflow Steps */}
            {workflowSteps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-900">Workflow</h4>
                {workflowSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    {step.status === 'complete' && (
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {step.status === 'active' && (
                      <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    {step.status === 'error' && (
                      <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    <span className={cn(
                      "text-sm",
                      step.status === 'complete' && "text-gray-600",
                      step.status === 'active' && "text-green-900 font-medium",
                      step.status === 'pending' && "text-gray-400",
                      step.status === 'error' && "text-red-600"
                    )}>
                      {step.step}
                    </span>
                    {step.duration && step.status === 'complete' && (
                      <span className="text-xs text-gray-500">
                        ({step.duration}ms)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Live Reasoning */}
            {reasoningSteps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-900">Live Reasoning</h4>
                <div className="bg-white rounded-lg p-3 border border-green-100 max-h-32 overflow-y-auto">
                  {reasoningSteps.map((step, index) => (
                    <p key={index} className="text-xs text-gray-600 leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

