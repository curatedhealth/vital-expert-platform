'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Zap, CheckCircle, Circle, Play, Pause,
  ChevronDown, ChevronUp, AlertCircle, Info, Sparkles
} from 'lucide-react';
import { useState, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
  timestamp: Date;
}

interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

interface AdvancedStreamingWindowProps {
  workflowSteps?: WorkflowStep[];
  reasoningSteps?: ReasoningStep[];
  metrics?: StreamingMetrics;
  isStreaming?: boolean;
  canPause?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export function AdvancedStreamingWindow({
  workflowSteps = [],
  reasoningSteps = [],
  metrics,
  isStreaming = false,
  canPause = false,
  onPause,
  onResume,
  className
}: AdvancedStreamingWindowProps) {
  const [showWorkflow, setShowWorkflow] = useState(true);
  const [showReasoning, setShowReasoning] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  }, [isPaused, onPause, onResume]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getReasoningIcon = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'thought':
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'action':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'observation':
        return <Info className="h-4 w-4 text-green-600" />;
    }
  };

  const currentStep = workflowSteps.find(step => step.status === 'running');
  const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
  const totalSteps = workflowSteps.length;
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  if (!isStreaming && workflowSteps.length === 0 && reasoningSteps.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn("space-y-3", className)}
    >
      {/* Header with Controls */}
      {isStreaming && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-5 w-5 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    {isPaused ? 'Streaming Paused' : 'AI Processing...'}
                  </h3>
                  {currentStep && (
                    <p className="text-xs text-blue-700">{currentStep.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canPause && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseToggle}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </>
                    )}
                  </Button>
                )}
                <Badge variant="secondary">
                  {completedSteps}/{totalSteps} steps
                </Badge>
              </div>
            </div>

            {totalSteps > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Steps */}
      {workflowSteps.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              onClick={() => setShowWorkflow(!showWorkflow)}
              className="w-full justify-between p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Workflow Steps</span>
              {showWorkflow ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <AnimatePresence>
              {showWorkflow && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t"
                >
                  <div className="p-4 space-y-3">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium">{step.name}</h4>
                            {step.status === 'running' && step.progress !== undefined && (
                              <span className="text-xs text-gray-500">
                                {step.progress}%
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-xs text-gray-600 mb-2">
                              {step.description}
                            </p>
                          )}
                          {step.status === 'running' && step.progress !== undefined && (
                            <Progress value={step.progress} className="h-1" />
                          )}
                          {step.status === 'completed' && step.startTime && step.endTime && (
                            <span className="text-xs text-gray-500">
                              Completed in{' '}
                              {formatDuration(
                                step.endTime.getTime() - step.startTime.getTime()
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Live Reasoning */}
      {reasoningSteps.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Live AI Reasoning</span>
                {isStreaming && (
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                )}
              </div>
              {showReasoning ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t"
                >
                  <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {reasoningSteps.map((step) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-lg",
                            step.type === 'thought' && "bg-purple-50",
                            step.type === 'action' && "bg-blue-50",
                            step.type === 'observation' && "bg-green-50"
                          )}
                        >
                          {getReasoningIcon(step.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs capitalize",
                                  step.type === 'thought' && "border-purple-300 text-purple-700",
                                  step.type === 'action' && "border-blue-300 text-blue-700",
                                  step.type === 'observation' && "border-green-300 text-green-700"
                                )}
                              >
                                {step.type}
                              </Badge>
                              {step.confidence !== undefined && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(step.confidence * 100)}% confident
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">{step.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Streaming Metrics */}
      {metrics && (
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              onClick={() => setShowMetrics(!showMetrics)}
              className="w-full justify-between p-4 hover:bg-gray-50"
            >
              <span className="text-sm font-medium">Performance Metrics</span>
              {showMetrics ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <AnimatePresence>
              {showMetrics && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t"
                >
                  <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tokens Generated</span>
                      <p className="font-medium">{metrics.tokensGenerated.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Speed</span>
                      <p className="font-medium">{metrics.tokensPerSecond.toFixed(1)} tok/s</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Elapsed Time</span>
                      <p className="font-medium">{formatDuration(metrics.elapsedTime)}</p>
                    </div>
                    {metrics.estimatedTimeRemaining !== undefined && (
                      <div>
                        <span className="text-gray-600">Est. Remaining</span>
                        <p className="font-medium">
                          {formatDuration(metrics.estimatedTimeRemaining)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
