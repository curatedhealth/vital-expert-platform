'use client';

/**
 * VITAL Platform - VitalThinking Component
 *
 * Glass box transparency component for visualizing AI reasoning.
 * Shows chain-of-thought steps with the 5-level agent hierarchy.
 *
 * Features:
 * - Glass box effect with warm purple accent (#9055E0)
 * - thinking-pulse animation during active processing
 * - 5-level agent hierarchy visualization (L1-L5)
 * - Collapsible with smooth transitions
 * - Accessibility: keyboard navigation, ARIA labels, focus states
 *
 * Design System: VITAL Brand v6.0
 */

import { useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Brain, CheckCircle2, Loader2, Clock, Sparkles } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// =============================================================================
// TYPES
// =============================================================================

export interface ReasoningStep {
  id: string;
  step: string;
  content: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  duration?: number;
  agentLevel?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  agentName?: string;
  agentId?: string;
  stepIndex?: number;
}

export interface VitalThinkingProps {
  /** Reasoning steps to display */
  steps: ReasoningStep[];
  /** Controlled expanded state */
  isExpanded?: boolean;
  /** Callback when expanded state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Show duration timings */
  showTimings?: boolean;
  /** Show agent level badges */
  showAgentLevels?: boolean;
  /** Variant: 'default' | 'compact' | 'detailed' */
  variant?: 'default' | 'compact' | 'detailed';
  /** Custom class names */
  className?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// =============================================================================
// AGENT LEVEL COLORS (5-Level Hierarchy)
// =============================================================================

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  L1: {
    bg: 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
    text: 'text-[var(--ae-accent-primary,#9055E0)]',
    border: 'border-[var(--ae-accent-primary,#9055E0)]/30',
  },
  L2: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  L3: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  L4: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  L5: {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-300',
  },
};

const LEVEL_LABELS: Record<string, string> = {
  L1: 'Master',
  L2: 'Expert',
  L3: 'Specialist',
  L4: 'Worker',
  L5: 'Tool',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalThinking({
  steps,
  isExpanded: controlledExpanded,
  onExpandChange,
  showTimings = true,
  showAgentLevels = true,
  variant = 'default',
  className,
  'aria-label': ariaLabel,
}: VitalThinkingProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const headingId = useId();
  const contentId = useId();

  const isExpanded = controlledExpanded ?? internalExpanded;

  const handleExpandChange = (value: boolean) => {
    setInternalExpanded(value);
    onExpandChange?.(value);
  };

  // Computed states
  const completedSteps = steps.filter((s) => s.status === 'complete').length;
  const isComplete = completedSteps === steps.length && steps.length > 0;
  const isProcessing = steps.some((s) => s.status === 'processing');
  const hasError = steps.some((s) => s.status === 'error');
  const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

  // Get the current processing step for display
  const currentStep = steps.find((s) => s.status === 'processing');

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={handleExpandChange}
      className={cn(
        // Base glass box styling
        'ae-thinking-box',
        'border rounded-xl',
        'bg-gradient-to-br from-[var(--ae-bg-surface,#F5F5F4)] to-transparent',
        'backdrop-blur-sm',
        'transition-all duration-200',

        // State-based styling
        isProcessing && [
          'border-[var(--ae-accent-primary,#9055E0)]/40',
          'animate-thinking-pulse',
          'shadow-[0_0_15px_rgba(144,85,224,0.1)]',
        ],
        isComplete && 'border-emerald-300/50',
        hasError && 'border-red-300/50',
        !isProcessing && !isComplete && !hasError && 'border-[var(--ae-border,#E7E5E4)]',

        // Variant styles
        variant === 'compact' && 'text-sm',
        variant === 'detailed' && 'p-1',

        className
      )}
      aria-label={ariaLabel || 'AI reasoning steps'}
    >
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-3 w-full p-3',
          'hover:bg-stone-100/50 transition-colors rounded-xl',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--ae-accent-primary,#9055E0)] focus-visible:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        id={headingId}
      >
        {/* Icon */}
        <div
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isProcessing && 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
            isComplete && 'bg-emerald-100',
            hasError && 'bg-red-100',
            !isProcessing && !isComplete && !hasError && 'bg-stone-100'
          )}
        >
          {isProcessing ? (
            <Sparkles
              className="h-4 w-4 text-[var(--ae-accent-primary,#9055E0)] animate-pulse"
              aria-hidden="true"
            />
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          ) : hasError ? (
            <Brain className="h-4 w-4 text-red-600" aria-hidden="true" />
          ) : (
            <Brain className="h-4 w-4 text-stone-500" aria-hidden="true" />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-stone-800">
            {isComplete
              ? 'Reasoning complete'
              : isProcessing
                ? currentStep?.step || 'Thinking...'
                : hasError
                  ? 'Reasoning error'
                  : 'Reasoning'}
          </span>

          {/* Current agent indicator when processing */}
          {isProcessing && currentStep?.agentLevel && showAgentLevels && (
            <span
              className={cn(
                'ml-2 text-xs px-1.5 py-0.5 rounded-md font-medium',
                LEVEL_COLORS[currentStep.agentLevel]?.bg,
                LEVEL_COLORS[currentStep.agentLevel]?.text
              )}
            >
              {currentStep.agentLevel}
              {currentStep.agentName && ` - ${currentStep.agentName}`}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2">
          {/* Progress counter */}
          <span className="text-xs text-stone-500 tabular-nums" aria-label={`${completedSteps} of ${steps.length} steps completed`}>
            {completedSteps}/{steps.length}
          </span>

          {/* Duration */}
          {showTimings && totalDuration > 0 && (
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span className="tabular-nums">{(totalDuration / 1000).toFixed(1)}s</span>
            </span>
          )}

          {/* Expand indicator */}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-stone-400 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent id={contentId} aria-labelledby={headingId}>
        <div className="px-3 pb-3 space-y-2">
          {/* Divider */}
          <div className="h-px bg-[var(--ae-border,#E7E5E4)] mx-1" />

          {/* Steps */}
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              showTimings={showTimings}
              showAgentLevels={showAgentLevels}
              variant={variant}
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
  showTimings,
  showAgentLevels,
  variant,
}: {
  step: ReasoningStep;
  index: number;
  showTimings: boolean;
  showAgentLevels: boolean;
  variant: 'default' | 'compact' | 'detailed';
}) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-2 rounded-lg transition-all duration-200',
        step.status === 'processing' && [
          'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
          'border border-[var(--ae-accent-primary,#9055E0)]/20',
        ],
        step.status === 'complete' && 'bg-emerald-50/50',
        step.status === 'error' && 'bg-red-50/50',
        step.status === 'pending' && 'opacity-60'
      )}
      role="listitem"
      aria-current={step.status === 'processing' ? 'step' : undefined}
    >
      {/* Status indicator */}
      <div className="mt-0.5 shrink-0">
        {step.status === 'pending' && (
          <div
            className="h-4 w-4 rounded-full border-2 border-stone-300"
            aria-label="Pending step"
          />
        )}
        {step.status === 'processing' && (
          <Loader2
            className="h-4 w-4 animate-spin text-[var(--ae-accent-primary,#9055E0)]"
            aria-label="Processing"
          />
        )}
        {step.status === 'complete' && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Complete" />
        )}
        {step.status === 'error' && (
          <div
            className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center"
            aria-label="Error"
          >
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-stone-500">
            Step {step.stepIndex ?? index + 1}
          </span>

          {showAgentLevels && step.agentLevel && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-md font-medium',
                LEVEL_COLORS[step.agentLevel]?.bg,
                LEVEL_COLORS[step.agentLevel]?.text
              )}
            >
              {step.agentLevel}
              {step.agentName && ` - ${step.agentName}`}
            </span>
          )}

          {showTimings && step.duration !== undefined && step.status === 'complete' && (
            <span className="text-xs text-stone-400 ml-auto tabular-nums">
              {step.duration}ms
            </span>
          )}
        </div>

        <p className={cn('font-medium mt-0.5 text-stone-800', isCompact ? 'text-xs' : 'text-sm')}>
          {step.step}
        </p>

        {/* Content - only show for processing/complete/error, not pending */}
        {step.status !== 'pending' && step.content && (
          <p
            className={cn(
              'mt-1 whitespace-pre-wrap text-stone-600',
              isCompact ? 'text-xs' : 'text-sm',
              step.status === 'processing' && 'animate-pulse-subtle'
            )}
          >
            {step.content}
          </p>
        )}
      </div>
    </div>
  );
}

export default VitalThinking;
export type { ReasoningStep, VitalThinkingProps };
