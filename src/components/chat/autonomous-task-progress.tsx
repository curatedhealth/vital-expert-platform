'use client';

import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Brain, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  tools: string[];
  evidence?: string[];
  error?: string;
}

interface AutonomousTaskProgressProps {
  isVisible: boolean;
  goal: string;
  tasks: Task[];
  currentTask?: Task;
  progress: {
    completed: number;
    total: number;
    successRate: number;
  };
  metrics: {
    iterations: number;
    cost: number;
    duration: number;
  };
  evidence: {
    count: number;
    verified: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  className?: string;
}

export function AutonomousTaskProgress({
  isVisible,
  goal,
  tasks,
  currentTask,
  progress,
  metrics,
  evidence,
  className
}: AutonomousTaskProgressProps) {
  if (!isVisible) return null;

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEvidenceQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Autonomous Progress</CardTitle>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              {progress.completed}/{progress.total} tasks
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(progress.successRate * 100)}% success rate
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Goal Display */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Goal:</span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">{goal}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
          </div>
          <Progress 
            value={(progress.completed / progress.total) * 100} 
            className="h-2"
          />
        </div>

        {/* Current Task */}
        {currentTask && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Currently Working On:</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{currentTask.description}</p>
            {currentTask.tools.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-6">
                {currentTask.tools.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tasks</span>
            <Badge variant="outline">
              {tasks.filter(t => t.status === 'completed').length} completed
            </Badge>
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start space-x-3 p-2 rounded-lg border",
                    task.status === 'completed' && "bg-green-50 border-green-200",
                    task.status === 'in_progress' && "bg-blue-50 border-blue-200",
                    task.status === 'failed' && "bg-red-50 border-red-200",
                    task.status === 'pending' && "bg-gray-50 border-gray-200"
                  )}
                >
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{task.description}</p>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tools.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {task.error && (
                      <p className="text-xs text-red-600 mt-1">{task.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.iterations}</div>
            <div className="text-xs text-muted-foreground">Iterations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">${metrics.cost.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Cost</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{Math.round(metrics.duration)}s</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Evidence Quality</span>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getEvidenceQualityColor(evidence.quality))}
            >
              {evidence.quality.toUpperCase()}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {evidence.verified}/{evidence.count} verified pieces of evidence
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
