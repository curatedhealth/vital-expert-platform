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
  DollarSign,
  Settings
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
  const [showAllSteps, setShowAllSteps] = useState(true); // Show all steps by default

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

  const displaySteps = steps; // Always show all steps for full transparency

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={cn("reasoning-message", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          AI Reasoning Process
        </span>
        <span className="text-xs text-gray-500">
          ({steps.length} step{steps.length !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Streaming Text Flow */}
      <div className="space-y-1 text-sm">
        {displaySteps.map((step, index) => {
          const phaseInfo = phaseConfig[step.phase as keyof typeof phaseConfig] || phaseConfig.think;
          const statusInfo = statusConfig[step.status];
          const PhaseIcon = phaseInfo.icon;
          const StatusIcon = statusInfo.icon;

          return (
            <div key={step.id} className="flex items-start gap-2 py-1">
              {/* Step Number & Icon */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                  step.status === 'completed' ? "bg-green-500 text-white" : 
                  step.status === 'in_progress' ? "bg-blue-500 text-white" :
                  step.status === 'failed' ? "bg-red-500 text-white" :
                  "bg-gray-300 text-gray-700"
                )}>
                  {index + 1}
                </div>
                <PhaseIcon className={cn("w-3 h-3", phaseInfo.color)} />
                <StatusIcon className={cn("w-3 h-3", statusInfo.color)} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900 text-base">
                    {step.content.description}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(step.timestamp)}
                  </span>
                </div>

                {/* Detailed Content - Clean Flow */}
                <div className="ml-7 space-y-3 text-sm text-gray-700">
                  {/* Reasoning Process */}
                  {step.content.reasoning && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800">Reasoning:</span>
                      </div>
                      <p className="text-gray-700 italic ml-6">{step.content.reasoning}</p>
                    </div>
                  )}

                  {/* Key Insights */}
                  {step.content.insights && step.content.insights.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-gray-800">Key Insights:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {step.content.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions Considered */}
                  {step.content.questions && step.content.questions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-800">Questions Considered:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {step.content.questions.map((question, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Decisions Made */}
                  {step.content.decisions && step.content.decisions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-800">Decisions Made:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {step.content.decisions.map((decision, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{decision}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Gathered */}
                  {step.content.evidence && step.content.evidence.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-800">Evidence Gathered:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {step.content.evidence.map((evidence, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Results - Special Highlight */}
                  {step.phase === 'completion' && step.content.reasoning && (
                    <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-800 text-lg">🎯 Final Results</span>
                      </div>
                      <p className="text-emerald-700 font-medium ml-7">{step.content.reasoning}</p>
                      {step.content.insights && step.content.insights.length > 0 && (
                        <div className="ml-7">
                          <h4 className="font-semibold text-emerald-800 mb-2">Key Findings:</h4>
                          <div className="space-y-1">
                            {step.content.insights.map((insight, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-emerald-700">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {step.content.decisions && step.content.decisions.length > 0 && (
                        <div className="ml-7">
                          <h4 className="font-semibold text-emerald-800 mb-2">Recommendations:</h4>
                          <div className="space-y-1">
                            {step.content.decisions.map((decision, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-emerald-700">{decision}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata - Clean Format */}
                  <div className="ml-6 text-xs text-gray-500 space-y-1">
                    {step.metadata.confidence && (
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        <span>Confidence: {Math.round(step.metadata.confidence * 100)}%</span>
                      </div>
                    )}
                    {step.metadata.cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        <span>Cost: ${step.metadata.cost.toFixed(4)}</span>
                      </div>
                    )}
                    {step.metadata.tokensUsed && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span>Tokens: {step.metadata.tokensUsed.toLocaleString()}</span>
                      </div>
                    )}
                    {step.metadata.toolsUsed && step.metadata.toolsUsed.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        <span>Tools: {step.metadata.toolsUsed.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Agent is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
