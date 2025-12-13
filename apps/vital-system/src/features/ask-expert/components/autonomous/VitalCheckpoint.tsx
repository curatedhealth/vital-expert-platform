'use client';

/**
 * VITAL Platform - VitalCheckpoint Component
 *
 * Human-in-the-Loop (HITL) checkpoint component for autonomous missions.
 * Pauses mission execution to request human approval for:
 * - Plan approval (before starting execution)
 * - Tool usage (before using sensitive tools)
 * - Subagent delegation (before spawning agents)
 * - Critical decisions (important junctures)
 * - Final review (before completing mission)
 *
 * Aligned with: services/ai-engine/docs/FRONTEND_INTEGRATION_REFERENCE.md
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  Shield,
  Wrench,
  Users,
  Flag,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

import type { CheckpointType } from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface CheckpointDecision {
  action: 'approve' | 'reject' | 'modify';
  feedback?: string;
  modifications?: Record<string, unknown>;
}

export interface VitalCheckpointProps {
  /** Unique checkpoint ID */
  id: string;
  /** Checkpoint name */
  name: string;
  /** Type of checkpoint */
  type: CheckpointType;
  /** Detailed description */
  description: string;
  /** Context information to help user decide */
  context?: {
    summary?: string;
    details?: Array<{ label: string; value: string }>;
    preview?: string;
    warnings?: string[];
    impact?: 'low' | 'medium' | 'high';
  };
  /** Available options (for quality/approval checkpoints) */
  options?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  /** Timeout in seconds (auto-approve after timeout) */
  timeout?: number;
  /** Whether auto-approve is enabled */
  autoApprove?: boolean;
  /** Called when user makes a decision */
  onDecision: (decision: CheckpointDecision) => void;
  /** Called when timeout occurs */
  onTimeout?: () => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * TYPE_CONFIG - v5 Spec Aligned Checkpoint Types
 *
 * 5 canonical HITL checkpoint types with fail-closed semantics:
 * - plan_approval: Review generated plan before execution
 * - tool_approval: Authorize sensitive tool usage (external APIs, data access)
 * - sub_agent_approval: Authorize L3/L4 subagent spawning
 * - critical_decision: Pause at important decision junctures
 * - final_review: Review deliverables before mission completion
 */
const TYPE_CONFIG: Record<CheckpointType, {
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  urgency: 'low' | 'medium' | 'high';
  helpText: string;
}> = {
  plan_approval: {
    icon: FileText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    title: 'Plan Approval',
    urgency: 'medium',
    helpText: 'Review the proposed plan before execution begins',
  },
  tool_approval: {
    icon: Wrench,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    title: 'Tool Usage Approval',
    urgency: 'high',
    helpText: 'Authorize sensitive tool or external API usage',
  },
  sub_agent_approval: {
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    title: 'Subagent Delegation',
    urgency: 'medium',
    helpText: 'Approve spawning of specialist subagents',
  },
  critical_decision: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    title: 'Critical Decision',
    urgency: 'high',
    helpText: 'Important decision point requiring human judgment',
  },
  final_review: {
    icon: Flag,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    title: 'Final Review',
    urgency: 'low',
    helpText: 'Review deliverables before mission completion',
  },
};

const IMPACT_CONFIG = {
  low: { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Low Impact' },
  medium: { color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Medium Impact' },
  high: { color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'High Impact' },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TimeoutBarProps {
  timeout: number;
  onTimeout: () => void;
}

const TimeoutBar: React.FC<TimeoutBarProps> = ({ timeout, onTimeout }) => {
  const [remaining, setRemaining] = useState(timeout);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Handle timeout completion
    if (remaining <= 0) {
      onTimeout();
      return;
    }

    // Set up countdown timer
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          // Clear timer when reaching zero to prevent race condition
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount or dependency change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [remaining, onTimeout]);

  const percentage = timeout > 0 ? (remaining / timeout) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Auto-approve in
        </span>
        <span className={cn(
          remaining <= 10 ? 'text-red-400' : 'text-neutral-400'
        )}>
          {remaining}s
        </span>
      </div>
      <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full',
            remaining <= 10 ? 'bg-red-500' : 'bg-purple-500'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

interface FeedbackInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FeedbackInput: React.FC<FeedbackInputProps> = ({
  value,
  onChange,
  placeholder = 'Add feedback or instructions...',
}) => (
  <div className="mt-4">
    <label className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
      <MessageSquare className="w-3 h-3" />
      Feedback (optional)
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
      rows={2}
    />
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const VitalCheckpoint: React.FC<VitalCheckpointProps> = ({
  id,
  name,
  type,
  description,
  context,
  options,
  timeout,
  autoApprove = false,
  onDecision,
  onTimeout,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const handleDecision = useCallback(async (action: 'approve' | 'reject' | 'modify') => {
    setIsSubmitting(true);

    try {
      // Brief delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      onDecision({
        action,
        feedback: feedback.trim() || undefined,
      });
    } catch (error) {
      console.error('Failed to submit checkpoint decision:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, onDecision]);

  const handleTimeout = useCallback(() => {
    if (autoApprove) {
      onDecision({ action: 'approve' });
    }
    onTimeout?.();
  }, [autoApprove, onDecision, onTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              config.bgColor
            )}
          >
            <Icon className={cn('w-5 h-5', config.color)} />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('text-sm font-semibold', config.color)}>
                {config.title}
              </h3>
              {context?.impact && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  IMPACT_CONFIG[context.impact].bgColor,
                  IMPACT_CONFIG[context.impact].color
                )}>
                  {IMPACT_CONFIG[context.impact].label}
                </span>
              )}
            </div>
            <h4 className="text-white font-medium">{name}</h4>
            <p className="text-sm text-neutral-300 mt-1">{description}</p>
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-neutral-700/50">
              {/* Timeout Bar */}
              {timeout && autoApprove && (
                <div className="pt-4">
                  <TimeoutBar timeout={timeout} onTimeout={handleTimeout} />
                </div>
              )}

              {/* Context Section */}
              {context && (
                <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                  {context.summary && (
                    <p className="text-sm text-neutral-300 mb-3">
                      {context.summary}
                    </p>
                  )}

                  {context.details && context.details.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {context.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-400">{detail.label}:</span>
                          <span className="text-white font-medium">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {context.preview && (
                    <div className="mt-3 p-2 bg-neutral-900 rounded text-xs text-neutral-400 font-mono whitespace-pre-wrap">
                      {context.preview}
                    </div>
                  )}

                  {context.warnings && context.warnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {context.warnings.map((warning, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-amber-400">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Options (for quality checkpoints) */}
              {options && options.length > 0 && (
                <div className="mt-4 space-y-2">
                  {options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => onDecision({ action: 'approve', modifications: { selectedOption: option.id } })}
                      className="w-full p-3 text-left bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-purple-500/50 rounded-lg transition-colors group"
                    >
                      <span className="text-sm text-white group-hover:text-purple-300 transition-colors">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Feedback Input */}
              <FeedbackInput
                value={feedback}
                onChange={setFeedback}
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={() => handleDecision('approve')}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>

                <Button
                  onClick={() => handleDecision('modify')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modify
                </Button>

                <Button
                  onClick={() => handleDecision('reject')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-neutral-500 text-center mt-3">
                {config.helpText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VitalCheckpoint;
