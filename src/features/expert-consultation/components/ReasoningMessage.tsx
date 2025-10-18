/**
 * Reasoning Message Component
 * Displays reasoning steps directly in the chat message flow like AutoGPT
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Lightbulb,
  Target,
  Zap,
  DollarSign
} from 'lucide-react';
import type { ReasoningStep } from '@/types/reasoning';

interface ReasoningMessageProps {
  steps: ReasoningStep[];
  isStreaming?: boolean;
  className?: string;
}

const phaseConfig = {
  initialization: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Brain },
  goal_extraction: { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Target },
  task_generation: { color: 'text-green-600', bgColor: 'bg-green-100', icon: Lightbulb },
  task_execution: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Zap },
  synthesize: { color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: Brain },
  completion: { color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle },
  think: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Brain },
  plan: { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Target },
  act: { color: 'text-green-600', bgColor: 'bg-green-100', icon: Zap },
  observe: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertCircle },
  reflect: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Brain },
};

const statusConfig = {
  pending: { color: 'text-gray-500', icon: Clock },
  in_progress: { color: 'text-blue-500', icon: Brain },
  completed: { color: 'text-green-500', icon: CheckCircle },
  failed: { color: 'text-red-500', icon: AlertCircle },
  skipped: { color: 'text-yellow-500', icon: AlertCircle },
};

export function ReasoningMessage({ steps, isStreaming = false, className }: ReasoningMessageProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showAllSteps, setShowAllSteps] = useState(false);

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const displaySteps = showAllSteps ? steps : steps.slice(-3); // Show last 3 steps by default

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={cn("reasoning-message", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            AI Reasoning Process
          </span>
          <Badge variant="outline" className="text-xs">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {steps.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="text-xs"
          >
            {showAllSteps ? 'Show Less' : `Show All ${steps.length}`}
          </Button>
        )}
      </div>

      {/* Reasoning Steps */}
      <div className="space-y-2">
        {displaySteps.map((step, index) => {
          const phaseInfo = phaseConfig[step.phase as keyof typeof phaseConfig] || phaseConfig.think;
          const statusInfo = statusConfig[step.status];
          const isExpanded = expandedSteps.has(step.id);
          const PhaseIcon = phaseInfo.icon;
          const StatusIcon = statusInfo.icon;

          return (
            <Card 
              key={step.id}
              className={cn(
                "reasoning-step-card transition-all duration-200",
                step.status === 'completed' && "border-green-200 bg-green-50",
                step.status === 'failed' && "border-red-200 bg-red-50",
                step.status === 'in_progress' && "border-blue-200 bg-blue-50"
              )}
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleStep(step.id)}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Step Number & Phase */}
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                          step.status === 'completed' ? "bg-green-500 text-white" : 
                          step.status === 'in_progress' ? "bg-blue-500 text-white" :
                          "bg-gray-200 text-gray-700"
                        )}>
                          {index + 1}
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                          phaseInfo.color,
                          phaseInfo.bgColor
                        )}>
                          <PhaseIcon className="w-3 h-3" />
                          <span className="capitalize">{step.phase.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {step.content.description}
                          </p>
                          <StatusIcon className={cn("w-3 h-3", statusInfo.color)} />
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatTimestamp(step.timestamp)}</span>
                          {step.metadata.confidence && (
                            <span>Confidence: {Math.round(step.metadata.confidence * 100)}%</span>
                          )}
                          {step.metadata.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${step.metadata.cost.toFixed(4)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Reasoning Content */}
                      {step.content.reasoning && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Reasoning</h5>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {step.content.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Insights */}
                      {step.content.insights && step.content.insights.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Key Insights</h5>
                          <ul className="space-y-1">
                            {step.content.insights.map((insight, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Questions */}
                      {step.content.questions && step.content.questions.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Questions Considered</h5>
                          <ul className="space-y-1">
                            {step.content.questions.map((question, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Decisions */}
                      {step.content.decisions && step.content.decisions.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Decisions Made</h5>
                          <ul className="space-y-1">
                            {step.content.decisions.map((decision, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {decision}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        {step.metadata.toolsUsed && step.metadata.toolsUsed.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Tools Used</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.metadata.toolsUsed.map((tool, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {step.metadata.tokensUsed && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Tokens</span>
                            <div className="flex items-center gap-1 mt-1">
                              <Zap className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {step.metadata.tokensUsed.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Agent is thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
