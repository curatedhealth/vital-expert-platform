'use client';

/**
 * VITAL Platform - VitalHITLCheckpoint Component
 *
 * Human-in-the-Loop checkpoint component for autonomous mode (Modes 3&4).
 * Implements fail-closed semantics with countdown timer.
 *
 * Features:
 * - 5 checkpoint types: plan_approval, agent_selection, tool_execution, output_review, cost_approval
 * - Countdown timer with visual urgency
 * - Keyboard shortcuts: Enter (approve), Escape (reject)
 * - Accessibility: ARIA live regions, focus management
 * - Brand v6.0 styling with warm purple accent
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Wrench,
  Eye,
  DollarSign,
  Timer,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type CheckpointType =
  | 'plan_approval'
  | 'agent_selection'
  | 'tool_execution'
  | 'output_review'
  | 'cost_approval';

export interface CheckpointContext {
  task?: string;
  reason?: string;
  estimatedCost?: number;
  estimatedTime?: number;
  agentName?: string;
  agentLevel?: string;
  toolName?: string;
  outputPreview?: string;
}

export interface VitalHITLCheckpointProps {
  /** Checkpoint ID */
  id: string;
  /** Type of checkpoint */
  type: CheckpointType;
  /** Title override */
  title?: string;
  /** Description override */
  description?: string;
  /** Additional context */
  context?: CheckpointContext;
  /** Timeout in seconds (default: 30) */
  timeoutSeconds?: number;
  /** Called when user approves */
  onApprove?: (checkpointId: string, option?: string) => void;
  /** Called when user rejects */
  onReject?: (checkpointId: string, reason?: string) => void;
  /** Called when user requests more time */
  onExtend?: (checkpointId: string) => void;
  /** Called when timeout expires */
  onTimeout?: (checkpointId: string) => void;
  /** Custom class names */
  className?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

// =============================================================================
// CHECKPOINT METADATA
// =============================================================================

const CHECKPOINT_META: Record<CheckpointType, { icon: typeof AlertCircle; label: string; color: string }> = {
  plan_approval: {
    icon: FileText,
    label: 'Plan Approval',
    color: 'text-[var(--ae-accent-primary,#9055E0)]',
  },
  agent_selection: {
    icon: Users,
    label: 'Agent Selection',
    color: 'text-blue-600',
  },
  tool_execution: {
    icon: Wrench,
    label: 'Tool Execution',
    color: 'text-amber-600',
  },
  output_review: {
    icon: Eye,
    label: 'Output Review',
    color: 'text-emerald-600',
  },
  cost_approval: {
    icon: DollarSign,
    label: 'Cost Approval',
    color: 'text-rose-600',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalHITLCheckpoint({
  id,
  type,
  title,
  description,
  context,
  timeoutSeconds = 30,
  onApprove,
  onReject,
  onExtend,
  onTimeout,
  className,
  autoFocus = true,
}: VitalHITLCheckpointProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const approveButtonRef = useRef<HTMLButtonElement>(null);

  const meta = CHECKPOINT_META[type];
  const Icon = meta.icon;

  // Default title/description based on type
  const displayTitle = title || meta.label;
  const displayDescription = description || getDefaultDescription(type, context);

  // ==========================================================================
  // COUNTDOWN TIMER
  // ==========================================================================

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      onTimeout?.(id);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, id, onTimeout]);

  // ==========================================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExpired) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleApprove();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpired]);

  // ==========================================================================
  // AUTO-FOCUS
  // ==========================================================================

  useEffect(() => {
    if (autoFocus && approveButtonRef.current) {
      approveButtonRef.current.focus();
    }
  }, [autoFocus]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleApprove = useCallback(() => {
    if (!isExpired) {
      onApprove?.(id);
    }
  }, [id, isExpired, onApprove]);

  const handleReject = useCallback(() => {
    if (!isExpired) {
      onReject?.(id);
    }
  }, [id, isExpired, onReject]);

  const handleExtend = useCallback(() => {
    setTimeRemaining((prev) => prev + 30);
    onExtend?.(id);
  }, [id, onExtend]);

  // ==========================================================================
  // URGENCY LEVEL
  // ==========================================================================

  const urgencyLevel = getUrgencyLevel(timeRemaining, timeoutSeconds);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <Card
      ref={containerRef}
      className={cn(
        'ae-checkpoint',
        'border-2 transition-all duration-300',
        // Urgency-based border colors
        urgencyLevel === 'critical' && 'border-red-400 bg-red-50 animate-pulse',
        urgencyLevel === 'warning' && 'border-amber-400 bg-amber-50',
        urgencyLevel === 'normal' && 'border-[var(--ae-accent-primary,#9055E0)]/40 bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
        isExpired && 'border-stone-300 bg-stone-100 opacity-75',
        className
      )}
      role="alertdialog"
      aria-labelledby={`checkpoint-title-${id}`}
      aria-describedby={`checkpoint-desc-${id}`}
      aria-live="assertive"
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg',
            urgencyLevel === 'critical' && 'bg-red-100',
            urgencyLevel === 'warning' && 'bg-amber-100',
            urgencyLevel === 'normal' && 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]'
          )}
        >
          <Icon className={cn('h-5 w-5', meta.color)} aria-hidden="true" />
        </div>

        {/* Title & Timer */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle
              id={`checkpoint-title-${id}`}
              className="text-base font-semibold text-stone-800"
            >
              {displayTitle}
            </CardTitle>

            {/* Countdown Timer */}
            {!isExpired && (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium tabular-nums',
                  urgencyLevel === 'critical' && 'bg-red-200 text-red-800',
                  urgencyLevel === 'warning' && 'bg-amber-200 text-amber-800',
                  urgencyLevel === 'normal' && 'bg-stone-200 text-stone-700'
                )}
                role="timer"
                aria-label={`${timeRemaining} seconds remaining`}
              >
                <Timer className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{timeRemaining}s</span>
              </div>
            )}

            {isExpired && (
              <span className="text-sm text-red-600 font-medium">Expired</span>
            )}
          </div>

          {/* Subtitle with context */}
          {context?.agentName && (
            <p className="text-xs text-stone-500 mt-0.5">
              Requested by {context.agentName}
              {context.agentLevel && ` (${context.agentLevel})`}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p
          id={`checkpoint-desc-${id}`}
          className="text-sm text-stone-600 leading-relaxed"
        >
          {displayDescription}
        </p>

        {/* Context Details */}
        {context && (
          <div className="flex flex-wrap gap-3 text-xs text-stone-500">
            {context.estimatedCost !== undefined && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" aria-hidden="true" />
                Est. ${context.estimatedCost.toFixed(2)}
              </span>
            )}
            {context.estimatedTime !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                ~{context.estimatedTime}s
              </span>
            )}
            {context.toolName && (
              <span className="flex items-center gap-1">
                <Wrench className="h-3 w-3" aria-hidden="true" />
                {context.toolName}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            ref={approveButtonRef}
            size="sm"
            onClick={handleApprove}
            disabled={isExpired}
            className={cn(
              'bg-[var(--ae-accent-primary,#9055E0)] hover:bg-[var(--ae-accent-hover,#7C3AED)]',
              'focus-visible:ring-[var(--ae-accent-primary,#9055E0)]'
            )}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Approve
            <kbd className="ml-2 text-xs opacity-70">Enter</kbd>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExtend}
            disabled={isExpired}
            className="text-stone-700"
          >
            <Clock className="h-4 w-4 mr-1.5" aria-hidden="true" />
            +30s
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isExpired}
            className="text-stone-600 hover:text-red-600 hover:border-red-300"
          >
            <XCircle className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Reject
            <kbd className="ml-2 text-xs opacity-70">Esc</kbd>
          </Button>
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite">
          {urgencyLevel === 'warning' && `Warning: ${timeRemaining} seconds remaining`}
          {urgencyLevel === 'critical' && `Critical: Only ${timeRemaining} seconds remaining`}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getDefaultDescription(type: CheckpointType, context?: CheckpointContext): string {
  switch (type) {
    case 'plan_approval':
      return context?.task
        ? `Review and approve the proposed plan for: ${context.task}`
        : 'Review and approve the proposed execution plan before proceeding.';
    case 'agent_selection':
      return context?.agentName
        ? `Confirm delegation to ${context.agentName} for this task.`
        : 'Confirm the selected agent is appropriate for this task.';
    case 'tool_execution':
      return context?.toolName
        ? `Approve execution of the ${context.toolName} tool.`
        : 'Approve the tool execution before it runs.';
    case 'output_review':
      return 'Review the generated output before it is finalized.';
    case 'cost_approval':
      return context?.estimatedCost
        ? `Approve estimated cost of $${context.estimatedCost.toFixed(2)} to continue.`
        : 'Approve the cost estimate before proceeding.';
    default:
      return 'Review and approve before continuing.';
  }
}

function getUrgencyLevel(
  timeRemaining: number,
  total: number
): 'normal' | 'warning' | 'critical' {
  const percentage = timeRemaining / total;
  if (percentage <= 0.2 || timeRemaining <= 5) return 'critical';
  if (percentage <= 0.4 || timeRemaining <= 10) return 'warning';
  return 'normal';
}

export default VitalHITLCheckpoint;
