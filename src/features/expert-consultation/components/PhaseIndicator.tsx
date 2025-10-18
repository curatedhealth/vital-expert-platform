/**
 * Phase Indicator Component
 * Shows the current phase of the autonomous agent's reasoning process
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import type { PhaseIndicatorProps } from '@/types/reasoning';

const phaseConfig = {
  think: {
    label: 'Thinking',
    color: 'bg-blue-500',
    icon: Brain,
    description: 'Analyzing the problem and considering approaches'
  },
  plan: {
    label: 'Planning',
    color: 'bg-purple-500',
    icon: Brain,
    description: 'Creating a structured plan of action'
  },
  act: {
    label: 'Acting',
    color: 'bg-green-500',
    icon: CheckCircle,
    description: 'Executing planned actions and gathering information'
  },
  observe: {
    label: 'Observing',
    color: 'bg-yellow-500',
    icon: AlertCircle,
    description: 'Analyzing results and gathering feedback'
  },
  reflect: {
    label: 'Reflecting',
    color: 'bg-orange-500',
    icon: Brain,
    description: 'Evaluating outcomes and learning from experience'
  },
  synthesize: {
    label: 'Synthesizing',
    color: 'bg-indigo-500',
    icon: CheckCircle,
    description: 'Combining insights into final conclusions'
  },
  goal_extraction: {
    label: 'Goal Extraction',
    color: 'bg-cyan-500',
    icon: Brain,
    description: 'Identifying and extracting key objectives'
  },
  task_generation: {
    label: 'Task Generation',
    color: 'bg-pink-500',
    icon: Brain,
    description: 'Creating actionable tasks to achieve goals'
  },
  task_execution: {
    label: 'Task Execution',
    color: 'bg-emerald-500',
    icon: CheckCircle,
    description: 'Executing tasks and gathering results'
  },
  completion: {
    label: 'Complete',
    color: 'bg-green-600',
    icon: CheckCircle,
    description: 'Analysis completed successfully'
  }
};

export function PhaseIndicator({ 
  phase, 
  isActive, 
  progress = 0, 
  estimatedTimeRemaining 
}: PhaseIndicatorProps) {
  const config = phaseConfig[phase as keyof typeof phaseConfig] || {
    label: phase,
    color: 'bg-gray-500',
    icon: Brain,
    description: 'Processing...'
  };

  const Icon = config.icon;

  return (
    <div className="phase-indicator">
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
        {/* Phase Icon */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-300",
          config.color,
          isActive && "animate-pulse"
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Phase Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {config.label}
            </h4>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
              )}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {config.description}
          </p>

          {/* Progress Bar */}
          {isActive && progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <Progress 
                value={progress * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Time Remaining */}
          {estimatedTimeRemaining && isActive && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                ~{Math.round(estimatedTimeRemaining / 1000)}s remaining
              </span>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-end gap-1">
          {isActive && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Processing</span>
            </div>
          )}
          
          {phase === 'completion' && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3 h-3" />
              <span>Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}