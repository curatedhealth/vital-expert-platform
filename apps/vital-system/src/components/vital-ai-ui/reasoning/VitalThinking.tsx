'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Brain, CheckCircle2, Loader2, Clock } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

interface ReasoningStep {
  id: string;
  step: string;
  content: string;
  status: 'pending' | 'processing' | 'complete';
  duration?: number;
  agentLevel?: string;
  agentName?: string;
}

interface VitalThinkingProps {
  steps: ReasoningStep[];
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  showTimings?: boolean;
  className?: string;
}

/**
 * VitalThinking - Chain-of-Thought visualization component
 * 
 * Visualizes agent reasoning steps with status indicators,
 * agent level badges, and duration tracking.
 */
export function VitalThinking({
  steps,
  isExpanded: controlledExpanded,
  onExpandChange,
  showTimings = true,
  className
}: VitalThinkingProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  const isExpanded = controlledExpanded ?? internalExpanded;
  
  const handleExpandChange = (value: boolean) => {
    setInternalExpanded(value);
    onExpandChange?.(value);
  };
  
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const isComplete = completedSteps === steps.length && steps.length > 0;
  const isProcessing = steps.some(s => s.status === 'processing');
  const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={handleExpandChange}
      className={cn(
        "border rounded-lg bg-muted/30",
        isProcessing && "border-yellow-500/50",
        isComplete && "border-green-500/30",
        className
      )}
    >
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 hover:bg-muted/50 transition-colors rounded-lg">
        <div className={cn(
          "p-1 rounded",
          isComplete ? "bg-green-100 dark:bg-green-900" : "bg-purple-100 dark:bg-purple-900"
        )}>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
          ) : (
            <Brain className={cn(
              "h-4 w-4",
              isComplete ? "text-green-600" : "text-purple-600"
            )} />
          )}
        </div>
        
        <span className="text-sm font-medium">
          {isComplete ? 'Reasoning complete' : isProcessing ? 'Thinking...' : 'Reasoning'}
        </span>
        
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">
            {completedSteps}/{steps.length} steps
          </span>
          
          {showTimings && totalDuration > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(totalDuration / 1000).toFixed(1)}s
            </span>
          )}
          
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform text-muted-foreground",
            isExpanded && "rotate-180"
          )} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-3 pt-0 space-y-2">
          {steps.map((step, index) => (
            <StepItem 
              key={step.id} 
              step={step} 
              index={index}
              showTimings={showTimings}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * StepItem - Individual reasoning step display
 */
function StepItem({ 
  step, 
  index,
  showTimings 
}: { 
  step: ReasoningStep; 
  index: number;
  showTimings: boolean;
}) {
  const levelColors: Record<string, string> = {
    L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    L5: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded transition-colors",
        step.status === 'processing' && "bg-yellow-500/10",
        step.status === 'complete' && "bg-green-500/5"
      )}
    >
      {/* Status indicator */}
      <div className="mt-0.5 shrink-0">
        {step.status === 'pending' && (
          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
        )}
        {step.status === 'processing' && (
          <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
        )}
        {step.status === 'complete' && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">
            Step {index + 1}
          </span>
          
          {step.agentLevel && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              levelColors[step.agentLevel] || 'bg-secondary'
            )}>
              {step.agentLevel}
              {step.agentName && ` · ${step.agentName}`}
            </span>
          )}
          
          {showTimings && step.duration && step.status === 'complete' && (
            <span className="text-xs text-muted-foreground ml-auto">
              {step.duration}ms
            </span>
          )}
        </div>
        
        <p className="text-sm font-medium mt-0.5">{step.step}</p>
        
        {step.status !== 'pending' && step.content && (
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
            {step.content}
          </p>
        )}
      </div>
    </div>
  );
}

export default VitalThinking;
