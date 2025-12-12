'use client';

/**
 * VITAL Platform - HITL Checkpoint Modal
 *
 * Modal dialog for Human-in-the-Loop checkpoint approval/rejection.
 * Displays checkpoint details, options, and countdown timer.
 *
 * Checkpoint Types:
 * - plan_approval: Review and approve execution plan
 * - tool_approval: Approve tool/API calls
 * - sub_agent_approval: Approve delegation to sub-agent
 * - critical_decision: High-stakes decision point
 * - final_review: Final output review before completion
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  AlertTriangle,
  Shield,
  Zap,
  FileText,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type CheckpointType =
  | 'plan_approval'
  | 'tool_approval'
  | 'sub_agent_approval'
  | 'critical_decision'
  | 'final_review';

export type CheckpointDecision = 'approve' | 'reject' | 'modify';

export interface CheckpointOption {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

export interface CheckpointData {
  id: string;
  type: CheckpointType;
  title: string;
  description: string;
  details?: string;
  options?: CheckpointOption[];
  metadata?: {
    agentName?: string;
    toolName?: string;
    estimatedCost?: number;
    estimatedDuration?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  timeoutSeconds: number;
  defaultDecision?: CheckpointDecision;
  canModify?: boolean;
}

export interface HITLCheckpointModalProps {
  /** Checkpoint data */
  checkpoint: CheckpointData | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when user makes a decision */
  onDecision: (checkpointId: string, decision: CheckpointDecision, data?: unknown) => void;
  /** Called when user requests time extension */
  onExtend?: (checkpointId: string, additionalSeconds: number) => void;
  /** Called when modal is dismissed (auto-timeout) */
  onTimeout?: (checkpointId: string) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getCheckpointIcon(type: CheckpointType) {
  const icons: Record<CheckpointType, React.ReactNode> = {
    plan_approval: <FileText className="w-6 h-6" />,
    tool_approval: <Zap className="w-6 h-6" />,
    sub_agent_approval: <Bot className="w-6 h-6" />,
    critical_decision: <AlertTriangle className="w-6 h-6" />,
    final_review: <Shield className="w-6 h-6" />,
  };
  return icons[type] || icons.plan_approval;
}

function getCheckpointColor(type: CheckpointType) {
  const colors: Record<CheckpointType, { bg: string; border: string; icon: string }> = {
    plan_approval: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    tool_approval: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    sub_agent_approval: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    critical_decision: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
    final_review: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  };
  return colors[type] || colors.plan_approval;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HITLCheckpointModal({
  checkpoint,
  isOpen,
  onDecision,
  onExtend,
  onTimeout,
  className,
}: HITLCheckpointModalProps) {
  // State
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [modificationNotes, setModificationNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer when checkpoint changes
  useEffect(() => {
    if (checkpoint && isOpen) {
      setTimeRemaining(checkpoint.timeoutSeconds);
      setSelectedOption(null);
      setModificationNotes('');
      setShowDetails(false);
      setIsSubmitting(false);
    }
  }, [checkpoint?.id, isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !checkpoint || timeRemaining <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired - apply default decision or notify
          if (timerRef.current) clearInterval(timerRef.current);
          if (checkpoint.defaultDecision) {
            onDecision(checkpoint.id, checkpoint.defaultDecision);
          } else {
            onTimeout?.(checkpoint.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, checkpoint, timeRemaining, onDecision, onTimeout]);

  // Handlers
  const handleApprove = useCallback(async () => {
    if (!checkpoint || isSubmitting) return;
    setIsSubmitting(true);

    const data = selectedOption ? { selectedOption } : undefined;
    onDecision(checkpoint.id, 'approve', data);
  }, [checkpoint, selectedOption, onDecision, isSubmitting]);

  const handleReject = useCallback(async () => {
    if (!checkpoint || isSubmitting) return;
    setIsSubmitting(true);

    onDecision(checkpoint.id, 'reject', { reason: modificationNotes || 'User rejected' });
  }, [checkpoint, modificationNotes, onDecision, isSubmitting]);

  const handleModify = useCallback(async () => {
    if (!checkpoint || isSubmitting || !modificationNotes.trim()) return;
    setIsSubmitting(true);

    onDecision(checkpoint.id, 'modify', {
      modifications: modificationNotes,
      selectedOption,
    });
  }, [checkpoint, modificationNotes, selectedOption, onDecision, isSubmitting]);

  const handleExtend = useCallback(() => {
    if (!checkpoint) return;
    onExtend?.(checkpoint.id, 60);
    setTimeRemaining((prev) => prev + 60);
  }, [checkpoint, onExtend]);

  // Don't render if no checkpoint
  if (!checkpoint) return null;

  const colors = getCheckpointColor(checkpoint.type);
  const isLowTime = timeRemaining < 30;
  const isCriticalTime = timeRemaining < 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => {}} // Prevent accidental dismiss
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-lg mx-4',
              className
            )}
          >
            <div className={cn(
              'bg-white rounded-2xl shadow-2xl overflow-hidden',
              'border-2',
              colors.border
            )}>
              {/* Header */}
              <div className={cn('p-6 border-b', colors.bg)}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    'bg-white shadow-sm',
                    colors.icon
                  )}>
                    {getCheckpointIcon(checkpoint.type)}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {checkpoint.title}
                    </h2>
                    <p className="text-slate-600 mt-1">
                      {checkpoint.description}
                    </p>
                  </div>

                  {/* Timer */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                    isCriticalTime && 'bg-red-100 text-red-700 animate-pulse',
                    isLowTime && !isCriticalTime && 'bg-amber-100 text-amber-700',
                    !isLowTime && 'bg-slate-100 text-slate-600'
                  )}>
                    <Clock className="w-4 h-4" />
                    <span className="font-mono font-medium">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                {checkpoint.metadata && (
                  <div className="flex gap-4 mt-4 text-sm">
                    {checkpoint.metadata.agentName && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Bot className="w-4 h-4" />
                        <span>{checkpoint.metadata.agentName}</span>
                      </div>
                    )}
                    {checkpoint.metadata.estimatedCost !== undefined && (
                      <div className="text-slate-600">
                        Est. cost: ${checkpoint.metadata.estimatedCost.toFixed(2)}
                      </div>
                    )}
                    {checkpoint.metadata.riskLevel && (
                      <div className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        checkpoint.metadata.riskLevel === 'high' && 'bg-red-100 text-red-700',
                        checkpoint.metadata.riskLevel === 'medium' && 'bg-amber-100 text-amber-700',
                        checkpoint.metadata.riskLevel === 'low' && 'bg-green-100 text-green-700'
                      )}>
                        {checkpoint.metadata.riskLevel} risk
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Details (collapsible) */}
                {checkpoint.details && (
                  <div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                    >
                      {showDetails ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {showDetails ? 'Hide' : 'Show'} details
                    </button>
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                            {checkpoint.details}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Options */}
                {checkpoint.options && checkpoint.options.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Select an option:
                    </label>
                    <div className="space-y-2">
                      {checkpoint.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOption(option.id)}
                          className={cn(
                            'w-full p-3 rounded-lg border-2 text-left transition-all',
                            selectedOption === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-900">
                              {option.label}
                            </span>
                            {option.recommended && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                                Recommended
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {option.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modification Notes */}
                {checkpoint.canModify !== false && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Notes (optional):
                    </label>
                    <textarea
                      value={modificationNotes}
                      onChange={(e) => setModificationNotes(e.target.value)}
                      placeholder="Add notes or modifications..."
                      className={cn(
                        'w-full mt-2 p-3 rounded-lg border border-slate-200',
                        'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                        'resize-none'
                      )}
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t flex items-center justify-between gap-3">
                {/* Extend Time Button */}
                {onExtend && (
                  <button
                    onClick={handleExtend}
                    disabled={isSubmitting}
                    className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
                  >
                    + 1 min
                  </button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto">
                  {/* Reject */}
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      'border border-red-200 text-red-600 hover:bg-red-50',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>

                  {/* Modify (if notes provided) */}
                  {checkpoint.canModify !== false && modificationNotes.trim() && (
                    <button
                      onClick={handleModify}
                      disabled={isSubmitting}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                        'border border-amber-200 text-amber-600 hover:bg-amber-50',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      <Edit3 className="w-4 h-4" />
                      Modify
                    </button>
                  )}

                  {/* Approve */}
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      'bg-green-600 text-white hover:bg-green-700',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default HITLCheckpointModal;
