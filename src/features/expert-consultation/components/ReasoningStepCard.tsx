/**
 * Reasoning Step Card Component
 * Displays individual reasoning steps with detailed information
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Zap,
  Target,
  Eye,
  Lightbulb
} from 'lucide-react';
import type { ReasoningStepCardProps } from '@/types/reasoning';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Pending'
  },
  in_progress: {
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'In Progress'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Completed'
  },
  failed: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Failed'
  },
  skipped: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    label: 'Skipped'
  }
};

const priorityConfig = {
  low: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
  medium: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  high: { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { color: 'text-red-600', bgColor: 'bg-red-100' }
};

export function ReasoningStepCard({ 
  step, 
  stepNumber, 
  isLatest, 
  showDetails = false,
  onStepClick 
}: ReasoningStepCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  
  const statusInfo = statusConfig[step.status];
  const StatusIcon = statusInfo.icon;
  const priorityInfo = priorityConfig[step.metadata.priority || 'medium'];

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  return (
    <Card 
      className={cn(
        "reasoning-step-card transition-all duration-200",
        isLatest && "ring-2 ring-blue-200 shadow-md",
        step.status === 'failed' && "border-red-200 bg-red-50",
        step.status === 'completed' && "border-green-200 bg-green-50"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className={cn(
              "cursor-pointer hover:bg-gray-50 transition-colors",
              onStepClick && "hover:bg-blue-50"
            )}
            onClick={() => onStepClick?.(step)}
          >
            <div className="flex items-start gap-3">
              {/* Step Number */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                isLatest ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              )}>
                {stepNumber}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {step.content.description}
                  </h4>
                  
                  {/* Status Badge */}
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs",
                      statusInfo.color,
                      statusInfo.bgColor
                    )}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>

                  {/* Priority Badge */}
                  {step.metadata.priority && step.metadata.priority !== 'medium' && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        priorityInfo.color,
                        priorityInfo.bgColor
                      )}
                    >
                      {step.metadata.priority}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(step.timestamp)}
                  </span>
                  
                  <span>Iteration {step.iteration}</span>
                  
                  {step.metadata.estimatedDuration && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {formatDuration(step.metadata.estimatedDuration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Reasoning Content */}
              {step.content.reasoning && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Reasoning
                  </h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {step.content.reasoning}
                  </p>
                </div>
              )}

              {/* Insights */}
              {step.content.insights && step.content.insights.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Key Insights
                  </h5>
                  <ul className="space-y-1">
                    {step.content.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions */}
              {step.content.questions && step.content.questions.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Questions Considered
                  </h5>
                  <ul className="space-y-1">
                    {step.content.questions.map((question, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decisions */}
              {step.content.decisions && step.content.decisions.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Decisions Made
                  </h5>
                  <ul className="space-y-1">
                    {step.content.decisions.map((decision, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {/* Confidence */}
                {step.metadata.confidence !== undefined && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Confidence</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.metadata.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(step.metadata.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Cost */}
                {step.metadata.cost && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Cost</span>
                    <div className="flex items-center gap-1 mt-1">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        ${step.metadata.cost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tokens */}
                {step.metadata.tokensUsed && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Tokens</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {step.metadata.tokensUsed.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tools Used */}
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
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}