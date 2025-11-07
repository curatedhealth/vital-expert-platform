'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  Lightbulb, 
  Search, 
  CheckCircle2,
  Loader2,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation' | 'conclusion';
  content: string;
  confidence?: number;
  timestamp?: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
}

interface AIReasoningPanelProps {
  // Streaming state
  isStreaming?: boolean;
  
  // Reasoning data
  reasoningSteps?: ReasoningStep[];
  workflowSteps?: WorkflowStep[];
  reasoning?: string | string[];
  
  // Display options
  className?: string;
  defaultExpanded?: boolean;
  showTimestamps?: boolean;
  
  // Auto-expansion: expands during streaming, allows collapse after
  autoExpand?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStepIcon = (type: ReasoningStep['type'] | 'workflow', status?: WorkflowStep['status']) => {
  if (type === 'workflow') {
    if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === 'failed') return <Zap className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  }
  
  switch (type) {
    case 'thought':
      return <Brain className="h-4 w-4 text-purple-600" />;
    case 'action':
      return <Zap className="h-4 w-4 text-blue-600" />;
    case 'observation':
      return <Search className="h-4 w-4 text-orange-600" />;
    case 'conclusion':
      return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    default:
      return <Brain className="h-4 w-4 text-gray-600" />;
  }
};

const formatTimestamp = (date?: Date): string => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  isStreaming = false,
  reasoningSteps = [],
  workflowSteps = [],
  reasoning,
  className,
  defaultExpanded = false,
  showTimestamps = true,
  autoExpand = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reasoning']));

  // Parse reasoning string/array into steps
  const parsedReasoningSteps = React.useMemo(() => {
    if (reasoningSteps.length > 0) return reasoningSteps;
    
    const reasoningArray = Array.isArray(reasoning) 
      ? reasoning 
      : typeof reasoning === 'string' 
        ? [reasoning] 
        : [];
    
    return reasoningArray
      .filter(step => step && step.trim() && step !== 'Thinking...' && step !== 'Processing your request...')
      .map((step, idx) => ({
        id: `reasoning-${idx}`,
        type: 'thought' as const,
        content: step,
        timestamp: new Date(),
      }));
  }, [reasoning, reasoningSteps]);

  // Auto-expand during streaming, allow manual control after
  useEffect(() => {
    if (autoExpand && isStreaming) {
      setIsExpanded(true);
    }
  }, [isStreaming, autoExpand]);

  // Calculate total items
  const totalItems = parsedReasoningSteps.length + workflowSteps.length;
  
  // Don't render if no content
  if (totalItems === 0) return null;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            AI Reasoning
          </span>
          {isStreaming && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? 'step' : 'steps'}
          </span>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-900">
          {/* Workflow Steps Section */}
          {workflowSteps.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toggleSection('workflow')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workflow Steps
                  </span>
                  <span className="text-xs text-gray-500">
                    ({workflowSteps.length})
                  </span>
                </div>
                {expandedSections.has('workflow') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedSections.has('workflow') && (
                <div className="px-4 py-2 space-y-2">
                  {workflowSteps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStepIcon('workflow', step.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {step.name}
                          </span>
                          {showTimestamps && step.startTime && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(step.startTime)}
                            </span>
                          )}
                        </div>
                        {step.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                        )}
                        {step.progress !== undefined && step.status === 'running' && (
                          <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reasoning Steps Section */}
          {parsedReasoningSteps.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('reasoning')}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reasoning Steps
                  </span>
                  <span className="text-xs text-gray-500">
                    ({parsedReasoningSteps.length})
                  </span>
                </div>
                {expandedSections.has('reasoning') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedSections.has('reasoning') && (
                <div className="px-4 py-2 space-y-2 max-h-96 overflow-y-auto">
                  {parsedReasoningSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Step {idx + 1}
                          </span>
                          {showTimestamps && step.timestamp && (
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(step.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {step.content}
                        </p>
                        {step.confidence !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-24">
                              <div
                                className={cn(
                                  'h-full transition-all duration-300',
                                  step.confidence >= 0.8 ? 'bg-green-600' :
                                  step.confidence >= 0.6 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                )}
                                style={{ width: `${step.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(step.confidence * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIReasoningPanel;

