'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Zap,
  Activity,
  Bot,
  Brain,
  X
} from 'lucide-react';
import type { JTBD, DetailedJTBD } from '@/lib/jtbd/jtbd-service';

interface ExecutionProgress {
  execution_id: number;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  status: 'Running' | 'Paused' | 'Completed' | 'Failed';
  current_step_name: string;
  estimated_remaining_minutes: number;
  step_results: StepResult[];
  live_updates: string[];
}

interface StepResult {
  step_number: number;
  status: 'Completed' | 'Failed' | 'Skipped' | 'User_Input_Required';
  agent_used?: string;
  execution_time_minutes: number;
  output_data?: any;
  error_message?: string;
  user_feedback_required?: boolean;
  next_step_recommendations?: string[];
}

interface JTBDExecutionModalProps {
  jtbd: JTBD | DetailedJTBD;
  executionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const JTBDExecutionModal: React.FC<JTBDExecutionModalProps> = ({
  jtbd,
  executionId,
  isOpen,
  onClose
}) => {
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch execution progress
  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/jtbd/execute?execution_id=${executionId}`);
      const data = await response.json();

      if (data.success) {
        setProgress(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch execution progress');
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  // Auto-refresh progress
  useEffect(() => {
    if (!isOpen) return;

    fetchProgress();

    const interval = setInterval(() => {
      if (progress?.status === 'Running') {
        fetchProgress();
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [fetchProgress, isOpen, progress?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'User_Input_Required': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'Skipped': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAgentIcon = (agentUsed?: string) => {
    if (!agentUsed) return <Brain className="h-4 w-4 text-gray-500" />;
    if (agentUsed.includes('llm')) return <Brain className="h-4 w-4 text-purple-500" />;
    return <Bot className="h-4 w-4 text-blue-500" />;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = Math.round(minutes % 60);
    return `${hours}h ${remainingMins}m`;
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading execution progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Execution Error</h3>
          </div>
          <div className="text-center py-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProgress} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {getStatusIcon(progress.status)}
            <span className="text-lg font-semibold">Executing: {jtbd.title}</span>
            <Badge variant={progress.status === 'Running' ? 'default' : 'secondary'}>
              {progress.status}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Step {progress.current_step} of {progress.total_steps}</span>
                    <span className="font-medium">{progress.progress_percentage}%</span>
                  </div>
                  <Progress value={progress.progress_percentage} className="h-3" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Est. remaining: {formatTime(progress.estimated_remaining_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span>Current: {progress.current_step_name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Results */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Step Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {progress.step_results.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Activity className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p>Execution starting...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progress.step_results.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStepStatusIcon(step.status)}
                              <span className="font-medium">Step {step.step_number}</span>
                              {step.agent_used && (
                                <div className="flex items-center gap-1">
                                  {getAgentIcon(step.agent_used)}
                                  <span className="text-xs text-gray-500">{step.agent_used}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant={step.status === 'Completed' ? 'default' : 'destructive'}>
                              {step.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 mb-2">
                            Duration: {formatTime(step.execution_time_minutes)}
                          </div>

                          {step.error_message && (
                            <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                              {step.error_message}
                            </div>
                          )}

                          {step.output_data && (
                            <div className="mt-2">
                              <details className="text-xs">
                                <summary className="cursor-pointer font-medium text-gray-700">
                                  View Output
                                </summary>
                                <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(step.output_data, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}

                          {step.next_step_recommendations && step.next_step_recommendations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {step.next_step_recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Live Updates & Controls */}
          <div className="space-y-6">
            {/* Live Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {progress.live_updates.map((update, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {update}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* JTBD Info */}
            <Card>
              <CardHeader>
                <CardTitle>JTBD Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Goal</p>
                  <p className="text-sm">{jtbd.goal}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Function</p>
                  <Badge variant="outline">{jtbd.function}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Complexity</p>
                  <Badge variant="outline">{jtbd.complexity}</Badge>
                </div>
                {jtbd.business_value && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Business Value</p>
                    <p className="text-xs text-gray-600">{jtbd.business_value}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  {progress.status === 'Running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(true)}
                      disabled={isPaused}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}

                  {progress.status === 'Paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(false)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProgress}
                  >
                    Refresh
                  </Button>

                  {(progress.status === 'Completed' || progress.status === 'Failed') && (
                    <Button onClick={onClose} className="w-full">
                      Close
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Execution ID: {executionId}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};