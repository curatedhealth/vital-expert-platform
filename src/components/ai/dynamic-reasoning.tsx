'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, CheckCircle, Brain, Zap, BarChart3, Target, Search, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReasoningStep {
  id: string;
  text: string;
  completed: boolean;
  active: boolean;
  timestamp: number;
  agent?: string;
  metadata?: any;
}

interface DynamicReasoningProps {
  isStreaming: boolean;
  reasoningEvents: Array<{
    type: string;
    step: string;
    description: string;
    data: any;
  }>;
  className?: string;
}

export function DynamicReasoning({ isStreaming, reasoningEvents, className }: DynamicReasoningProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Update steps based on real reasoning events
  useEffect(() => {
    if (!isStreaming || reasoningEvents.length === 0) return;

    const latestEvent = reasoningEvents[reasoningEvents.length - 1];
    let stepIndex = 0;
    
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      
      // Find existing step or create new one
      stepIndex = newSteps.findIndex(step => step.id === latestEvent.step);
      
      if (stepIndex === -1) {
        // Create new step
        const newStep: ReasoningStep = {
          id: latestEvent.step,
          text: latestEvent.description,
          completed: false,
          active: true,
          timestamp: latestEvent.data?.timestamp || Date.now(),
          agent: latestEvent.data?.agent,
          metadata: latestEvent.data
        };
        newSteps.push(newStep);
        stepIndex = newSteps.length - 1;
      } else {
        // Update existing step
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          text: latestEvent.description,
          active: true,
          agent: latestEvent.data?.agent,
          metadata: latestEvent.data
        };
      }
      
      // Mark previous steps as completed
      newSteps.forEach((step, index) => {
        if (index < stepIndex) {
          step.completed = true;
          step.active = false;
        } else if (index > stepIndex) {
          step.active = false;
        }
      });
      
      return newSteps;
    });
    
    setCurrentStep(stepIndex);
    setProgress((stepIndex + 1) / Math.max(steps.length + 1, 1)) * 100;
  }, [reasoningEvents, isStreaming]);

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  const getStepIcon = (step: ReasoningStep) => {
    if (step.completed) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (step.active) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
    
    // Icon based on step type
    switch (step.id) {
      case 'routing':
        return <Search className="w-4 h-4 text-gray-400" />;
      case 'awaiting_selection':
        return <Target className="w-4 h-4 text-gray-400" />;
      case 'tool_selection':
        return <Wrench className="w-4 h-4 text-gray-400" />;
      case 'agent_selected':
        return <Zap className="w-4 h-4 text-gray-400" />;
      case 'context_retrieved':
      case 'context_analysis':
        return <Brain className="w-4 h-4 text-gray-400" />;
      case 'tool_execution':
        return <Wrench className="w-4 h-4 text-gray-400" />;
      case 'response_generated':
        return <BarChart3 className="w-4 h-4 text-gray-400" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const formatDuration = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 1000) return `${diff}ms`;
    return `${(diff / 1000).toFixed(1)}s`;
  };

  if (!isStreaming && steps.length === 0) {
    return null;
  }

  return (
    <div className={cn('border border-gray-200 rounded-lg bg-white', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
        aria-controls="dynamic-reasoning-content"
      >
        <div className="flex items-center gap-3">
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <span className="text-gray-700 font-medium">
            Reasoning...
          </span>
          {isStreaming && (
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      <div
        id="dynamic-reasoning-content"
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: isOpen ? 'auto' : 0,
        }}
      >
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                  step.completed ? 'bg-green-50 text-green-700' :
                  step.active ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                )}
              >
                {getStepIcon(step)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm',
                      step.completed ? 'font-medium' :
                      step.active ? 'font-medium' : 'font-normal'
                    )}>
                      {step.text}
                    </span>
                    {step.timestamp && (
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDuration(step.timestamp)}
                      </span>
                    )}
                  </div>
                  {step.agent && step.agent !== 'System' && (
                    <div className="text-xs text-gray-500 mt-1">
                      via {step.agent}
                    </div>
                  )}
                  {step.metadata?.contextLength && (
                    <div className="text-xs text-gray-500 mt-1">
                      Context: {step.metadata.contextLength} characters
                    </div>
                  )}
                  {step.metadata?.toolCount && (
                    <div className="text-xs text-gray-500 mt-1">
                      Tools: {step.metadata.toolCount} executed
                    </div>
                  )}
                </div>
                {step.active && (
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
