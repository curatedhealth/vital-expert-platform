'use client';

/**
 * VITAL Platform - VitalThinking Component
 *
 * Glass box AI reasoning visualization (Claude.ai style).
 * Shows the AI's thinking process in a collapsible, styled container.
 *
 * Features:
 * - Progressive step reveal during streaming
 * - Collapsible after completion
 * - Animated thinking indicator
 * - Step icons and timestamps
 * - Color-coded step types
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Brain,
  ChevronDown,
  Lightbulb,
  Search,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Target,
  BookOpen,
  Scale,
} from 'lucide-react';

// Note: ReasoningEvent type from useSSEStream is not used directly here
// ThinkingStep has different type values for UI display purposes

// =============================================================================
// TYPES
// =============================================================================

/**
 * ThinkingStep interface for UI display.
 * Note: This is intentionally NOT extending ReasoningEvent because
 * we have different type values and optional/required semantics for UI display.
 */
export interface ThinkingStep {
  id: string;
  step: string;
  type?: 'analysis' | 'search' | 'calculation' | 'warning' | 'conclusion' | 'insight' | 'comparison' | 'research';
  timestamp?: Date;
  confidence?: number;
  duration?: number; // milliseconds
  // Optional fields from ReasoningEvent for compatibility
  stepIndex?: number;
  agentLevel?: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  agentId?: string;
  agentName?: string;
  content?: string;
  status?: 'thinking' | 'complete' | 'error';
  durationMs?: number;
}

export interface VitalThinkingProps {
  /** Reasoning steps to display */
  steps: ThinkingStep[];
  /** Whether thinking is actively happening */
  isActive?: boolean;
  /** Whether the container should be expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onToggle?: (expanded: boolean) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// STEP TYPE CONFIG - Maps semantic types to icons
// =============================================================================

const STEP_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  analysis: { icon: Brain, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  search: { icon: Search, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  research: { icon: BookOpen, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  calculation: { icon: Calculator, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  warning: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  conclusion: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
  insight: { icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  comparison: { icon: Scale, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  target: { icon: Target, color: 'text-rose-600', bgColor: 'bg-rose-50' },
};

// =============================================================================
// WORKFLOW STEP NAME MAPPING - Converts backend step names to user-friendly labels with icons
// =============================================================================

interface WorkflowStepMapping {
  label: string;
  type: keyof typeof STEP_TYPE_CONFIG;
}

const WORKFLOW_STEP_MAPPING: Record<string, WorkflowStepMapping> = {
  // Input Processing
  'process_input': { label: 'Analyzing your question', type: 'analysis' },
  'analyze_query': { label: 'Understanding your request', type: 'analysis' },
  'parse_input': { label: 'Processing input', type: 'analysis' },

  // Session & Tenant
  'load_session': { label: 'Loading context', type: 'analysis' },
  'validate_tenant': { label: 'Verifying access', type: 'target' },
  'authenticate': { label: 'Authenticating', type: 'target' },

  // Agent Loading
  'load_agent': { label: 'Preparing expert', type: 'insight' },
  'select_agent': { label: 'Selecting expert', type: 'insight' },
  'agent_selected': { label: 'Expert assigned', type: 'conclusion' },

  // Orchestration
  'l3_orchestrate': { label: 'Orchestrating specialists', type: 'analysis' },
  'orchestrate': { label: 'Coordinating response', type: 'analysis' },
  'delegate': { label: 'Delegating task', type: 'comparison' },

  // RAG & Research
  'rag_retrieval': { label: 'Searching knowledge base', type: 'search' },
  'retrieve': { label: 'Retrieving information', type: 'search' },
  'search_documents': { label: 'Searching documents', type: 'research' },
  'search_pubmed': { label: 'Searching PubMed', type: 'research' },
  'search_clinical_trials': { label: 'Searching clinical trials', type: 'research' },

  // Execution
  'execute_expert': { label: 'Expert analyzing', type: 'insight' },
  'execute': { label: 'Processing', type: 'analysis' },
  'run_tool': { label: 'Running tool', type: 'calculation' },

  // Response Generation
  'generate_response': { label: 'Generating response', type: 'insight' },
  'synthesize': { label: 'Synthesizing findings', type: 'conclusion' },
  'format_output': { label: 'Formatting response', type: 'analysis' },

  // Saving & Completion
  'save_message': { label: 'Saving to history', type: 'conclusion' },
  'complete': { label: 'Completing', type: 'conclusion' },
  'done': { label: 'Done', type: 'conclusion' },

  // Error & Validation
  'validate': { label: 'Validating', type: 'target' },
  'error': { label: 'Error occurred', type: 'warning' },
  'retry': { label: 'Retrying', type: 'warning' },
};

/**
 * Converts a backend workflow step name to a user-friendly label and type
 */
function mapWorkflowStep(stepName: string): WorkflowStepMapping {
  // Check direct mapping first
  const mapping = WORKFLOW_STEP_MAPPING[stepName.toLowerCase()];
  if (mapping) return mapping;

  // Try to match partial patterns
  const lowerStep = stepName.toLowerCase();

  if (lowerStep.includes('search') || lowerStep.includes('retriev')) {
    return { label: 'Searching...', type: 'search' };
  }
  if (lowerStep.includes('load') || lowerStep.includes('session')) {
    return { label: 'Loading...', type: 'analysis' };
  }
  if (lowerStep.includes('agent') || lowerStep.includes('expert')) {
    return { label: 'Expert working...', type: 'insight' };
  }
  if (lowerStep.includes('generat') || lowerStep.includes('response')) {
    return { label: 'Generating...', type: 'insight' };
  }
  if (lowerStep.includes('save') || lowerStep.includes('complete')) {
    return { label: 'Finishing...', type: 'conclusion' };
  }
  if (lowerStep.includes('valid') || lowerStep.includes('check')) {
    return { label: 'Validating...', type: 'target' };
  }
  if (lowerStep.includes('error') || lowerStep.includes('fail')) {
    return { label: 'Issue detected', type: 'warning' };
  }

  // Fallback: humanize the step name
  const humanized = stepName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());

  return { label: humanized || 'Processing...', type: 'analysis' };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalThinking({
  steps,
  isActive = false,
  isExpanded: propExpanded,
  onToggle,
  className,
}: VitalThinkingProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastStepRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled expansion
  const isExpanded = propExpanded ?? internalExpanded;

  // Auto-expand when new steps arrive during active thinking
  useEffect(() => {
    if (isActive && steps.length > 0) {
      if (propExpanded === undefined) {
        setInternalExpanded(true);
      }
      // Scroll to latest step
      lastStepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [steps.length, isActive, propExpanded]);

  // Auto-collapse after thinking completes (with delay)
  useEffect(() => {
    if (!isActive && steps.length > 0 && propExpanded === undefined) {
      const timer = setTimeout(() => {
        setInternalExpanded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, steps.length, propExpanded]);

  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    if (propExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  }, [isExpanded, propExpanded, onToggle]);

  if (steps.length === 0 && !isActive) {
    return null;
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'rounded-xl overflow-hidden',
        'border border-blue-200',
        'bg-gradient-to-br from-blue-50/80 to-white',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full px-4 py-3 flex items-center gap-3',
          'hover:bg-blue-50/50 transition-colors',
          'text-left'
        )}
        aria-expanded={isExpanded}
        aria-controls="thinking-steps"
      >
        {/* Thinking indicator */}
        <div
          className={cn(
            'relative p-2 rounded-lg',
            isActive ? 'bg-blue-100' : 'bg-slate-100'
          )}
          aria-hidden="true"
        >
          {isActive ? (
            <>
              <Brain className="h-4 w-4 text-blue-600" />
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-blue-400"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          ) : (
            <Sparkles className="h-4 w-4 text-slate-500" />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium',
              isActive ? 'text-blue-700' : 'text-slate-700'
            )}>
              {isActive ? 'Thinking...' : 'Reasoning Complete'}
            </span>
            {isActive && (
              <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
            )}
          </div>
          <span className="text-xs text-slate-500">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Expand/collapse chevron */}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Steps List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              id="thinking-steps"
              className="px-4 pb-4 space-y-2 max-h-[300px] overflow-y-auto"
              aria-live={isActive ? 'polite' : 'off'}
              aria-label="AI reasoning steps"
            >
              {steps.map((step, index) => (
                <ThinkingStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isLast={index === steps.length - 1}
                  ref={index === steps.length - 1 ? lastStepRef : undefined}
                />
              ))}

              {/* Active thinking placeholder */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-blue-50/50"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600">Processing...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ThinkingStepCardProps {
  step: ThinkingStep;
  index: number;
  isLast: boolean;
}

const ThinkingStepCard = forwardRef<HTMLDivElement, ThinkingStepCardProps>(
  function ThinkingStepCard({ step, index, isLast }, ref) {
    // Map workflow step name to user-friendly label and type
    const mappedStep = mapWorkflowStep(step.step);

    // Use mapped type to get icon config, fallback to explicit type if provided
    const config = STEP_TYPE_CONFIG[step.type || mappedStep.type] || STEP_TYPE_CONFIG.analysis;
    const Icon = config.icon;

    // Use content if available (for real-time LLM tokens), otherwise use mapped label
    const displayText = step.content && step.content.length > 0
      ? step.content
      : mappedStep.label;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-start gap-3"
      >
        {/* Step icon (no numbers - just adaptive icons) */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center',
            config.bgColor
          )}>
            <Icon className={cn('h-3.5 w-3.5', config.color)} />
          </div>
          {!isLast && (
            <div className="w-px h-full min-h-[20px] bg-slate-200" />
          )}
        </div>

        {/* Step content - shows user-friendly label or real LLM content */}
        <div className="flex-1 min-w-0 pb-2">
          <p className="text-sm text-slate-700">
            {displayText}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1">
            {step.timestamp && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(step.timestamp)}
              </span>
            )}
            {step.duration !== undefined && (
              <span className="text-xs text-slate-400">
                {step.duration < 1000
                  ? `${step.duration}ms`
                  : `${(step.duration / 1000).toFixed(1)}s`}
              </span>
            )}
            {step.confidence !== undefined && (
              <span className={cn(
                'text-xs',
                step.confidence >= 0.8 ? 'text-green-600' :
                step.confidence >= 0.6 ? 'text-amber-600' : 'text-red-600'
              )}>
                {Math.round(step.confidence * 100)}% confident
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

// =============================================================================
// HELPERS
// =============================================================================

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// =============================================================================
// COMPACT VARIANT (for inline use)
// =============================================================================

export interface VitalThinkingCompactProps {
  /** Current thinking step text */
  currentStep?: string;
  /** Whether actively thinking */
  isActive?: boolean;
  /** Custom class names */
  className?: string;
}

export function VitalThinkingCompact({
  currentStep,
  isActive = false,
  className,
}: VitalThinkingCompactProps) {
  if (!isActive && !currentStep) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-blue-50 border border-blue-200',
        className
      )}
    >
      {isActive ? (
        <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
      ) : (
        <Brain className="h-3 w-3 text-blue-500" />
      )}
      <span className="text-xs text-blue-700 max-w-[200px] truncate">
        {currentStep || 'Thinking...'}
      </span>
    </motion.div>
  );
}

export default VitalThinking;
