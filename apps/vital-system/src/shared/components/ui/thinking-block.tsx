'use client';

import { ChevronDown, ChevronRight, Brain, Lightbulb, Search, Target, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@vital/ui';
import { Card } from '@vital/ui';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@vital/ui';
import { cn } from '@/shared/services/utils';

// 🧠 Thinking Step Types
interface ThinkingStep {
  id: string;
  type: 'analysis' | 'reasoning' | 'decision' | 'agent_selection' | 'planning' | 'execution';
  title: string;
  content: string;
  timestamp?: Date;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

interface ThinkingBlockProps {
  steps: ThinkingStep[];
  title?: string;
  isExpanded?: boolean;
  showTimestamps?: boolean;
  showConfidence?: boolean;
  className?: string;
}

// 🎯 Step Type Icons

  switch (type) {
    case 'analysis':
      return <Search className="h-3 w-3" />;
    case 'reasoning':
      return <Brain className="h-3 w-3" />;
    case 'decision':
      return <Target className="h-3 w-3" />;
    case 'agent_selection':
      return <Zap className="h-3 w-3" />;
    case 'planning':
      return <Lightbulb className="h-3 w-3" />;
    case 'execution':
      return <ChevronRight className="h-3 w-3" />;
    default:
      return <Brain className="h-3 w-3" />;
  }
};

// 🎨 Step Type Colors

  switch (type) {
    case 'analysis':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'reasoning':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'decision':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'agent_selection':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'planning':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'execution':
      return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    default:
      return 'bg-neutral-50 text-neutral-700 border-neutral-200';
  }
};

// 🎭 Confidence Indicator
const ConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {

    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-1">
      <div className="w-12 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getConfidenceColor(confidence))}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-xs text-neutral-500">
        {(confidence * 100).toFixed(0)}%
      </span>
    </div>
  );
};

// 🕒 Timestamp Display
const TimestampDisplay: React.FC<{ timestamp: Date }> = ({ timestamp }) => {

    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 1
    } as unknown);
  };

  return (
    <span className="text-xs text-neutral-400 font-mono">
      {formatTime(timestamp)}
    </span>
  );
};

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  steps,
  title = "🧠 Thinking",
  isExpanded = false,
  showTimestamps = true,
  showConfidence = true,
  className
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

    .filter(step => step.confidence !== undefined)
    .reduce((acc, step) => acc + (step.confidence || 0), 0) /
    steps.filter(step => step.confidence !== undefined).length;

  return (
    <Card className={cn(
      'mb-4 border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-transparent',
      className
    )}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="w-full p-4 hover:bg-neutral-50/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-500" />
                )}
                <span className="font-medium text-neutral-900 text-left">
                  {title}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {totalSteps} step{totalSteps !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {showConfidence && !isNaN(avgConfidence) && (
                <ConfidenceIndicator confidence={avgConfidence} />
              )}
              <div className="flex space-x-1">
                {steps.slice(0, 3).map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      step.type === 'analysis' && 'bg-blue-400',
                      step.type === 'reasoning' && 'bg-purple-400',
                      step.type === 'decision' && 'bg-green-400',
                      step.type === 'agent_selection' && 'bg-orange-400',
                      step.type === 'planning' && 'bg-yellow-400',
                      step.type === 'execution' && 'bg-neutral-400'
                    )}
                  />
                ))}
                {totalSteps > 3 && (
                  <div className="w-2 h-2 rounded-full bg-neutral-300" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'relative p-3 rounded-lg border border-dashed transition-all duration-200 hover:border-solid',
                  getStepColor(step.type)
                )}
              >
                {/* Step Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/80">
                      {getStepIcon(step.type)}
                    </div>
                    <span className="font-medium text-sm capitalize">
                      {step.type.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs h-4">
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {showConfidence && step.confidence && (
                      <ConfidenceIndicator confidence={step.confidence} />
                    )}
                    {showTimestamps && step.timestamp && (
                      <TimestampDisplay timestamp={step.timestamp} />
                    )}
                  </div>
                </div>

                {/* Step Title */}
                <h4 className="font-medium text-sm mb-1">
                  {step.title}
                </h4>

                {/* Step Content */}
                <div className="text-sm text-neutral-600 leading-relaxed">
                  {step.content}
                </div>

                {/* Step Metadata */}
                {step.metadata && Object.keys(step.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-200/50">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(step.metadata).map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="text-xs h-4"
                        >
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// 🔄 Hook for building thinking steps
export const __useThinkingSteps = () => {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);

    const newStep: ThinkingStep = {
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setSteps(prev => [...prev, newStep]);
    return newStep.id;
  };

    setSteps(prev => prev.map(step =>
      step.id === id ? { ...step, ...updates } : step
    ));
  };

    setSteps([]);
  };

  return {
    steps,
    addStep,
    updateStep,
    clearSteps
  };
};

export default ThinkingBlock;