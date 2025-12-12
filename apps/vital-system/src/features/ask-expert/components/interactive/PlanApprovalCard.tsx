'use client';

/**
 * VITAL Platform - Plan Approval Card
 *
 * Displays an execution plan for user approval before AI proceeds.
 * Shows plan steps, estimated cost/time, and allows approve/modify/reject.
 *
 * Used in HITL workflows when the AI generates a multi-step plan
 * that requires user confirmation before execution.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  AlertCircle,
  Zap,
  Bot,
  Database,
  Search,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type PlanStepType =
  | 'search'
  | 'analyze'
  | 'generate'
  | 'tool_call'
  | 'delegate'
  | 'aggregate'
  | 'review';

export type PlanStatus = 'pending' | 'approved' | 'rejected' | 'modified';

export interface PlanStep {
  id: string;
  order: number;
  type: PlanStepType;
  title: string;
  description: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  toolName?: string;
  agentName?: string;
  dependencies?: string[];
  isOptional?: boolean;
}

export interface ExecutionPlan {
  id: string;
  title: string;
  summary: string;
  steps: PlanStep[];
  totalEstimatedCost?: number;
  totalEstimatedDuration?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface PlanApprovalCardProps {
  /** The execution plan to display */
  plan: ExecutionPlan;
  /** Called when user approves the plan */
  onApprove: (planId: string) => void;
  /** Called when user rejects the plan */
  onReject: (planId: string, reason?: string) => void;
  /** Called when user wants to modify the plan */
  onModify: (planId: string, modifications: string) => void;
  /** Whether the card is in a loading state */
  isLoading?: boolean;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getStepIcon(type: PlanStepType) {
  const icons: Record<PlanStepType, React.ReactNode> = {
    search: <Search className="w-4 h-4" />,
    analyze: <FileText className="w-4 h-4" />,
    generate: <Zap className="w-4 h-4" />,
    tool_call: <Database className="w-4 h-4" />,
    delegate: <Bot className="w-4 h-4" />,
    aggregate: <ListOrdered className="w-4 h-4" />,
    review: <CheckCircle2 className="w-4 h-4" />,
  };
  return icons[type] || icons.analyze;
}

function getStepColor(type: PlanStepType) {
  const colors: Record<PlanStepType, string> = {
    search: 'text-blue-600 bg-blue-50',
    analyze: 'text-purple-600 bg-purple-50',
    generate: 'text-amber-600 bg-amber-50',
    tool_call: 'text-green-600 bg-green-50',
    delegate: 'text-indigo-600 bg-indigo-50',
    aggregate: 'text-slate-600 bg-slate-50',
    review: 'text-emerald-600 bg-emerald-50',
  };
  return colors[type] || colors.analyze;
}

function getRiskBadge(level: 'low' | 'medium' | 'high') {
  const styles = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };
  return styles[level];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PlanApprovalCard({
  plan,
  onApprove,
  onReject,
  onModify,
  isLoading = false,
  compact = false,
  className,
}: PlanApprovalCardProps) {
  const [showAllSteps, setShowAllSteps] = useState(!compact);
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modificationText, setModificationText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const visibleSteps = showAllSteps ? plan.steps : plan.steps.slice(0, 3);
  const hasMoreSteps = plan.steps.length > 3;

  const handleApprove = useCallback(() => {
    if (!isLoading) {
      onApprove(plan.id);
    }
  }, [plan.id, onApprove, isLoading]);

  const handleReject = useCallback(() => {
    if (!isLoading) {
      if (showRejectInput && rejectionReason.trim()) {
        onReject(plan.id, rejectionReason);
        setShowRejectInput(false);
        setRejectionReason('');
      } else {
        setShowRejectInput(true);
      }
    }
  }, [plan.id, onReject, isLoading, showRejectInput, rejectionReason]);

  const handleModify = useCallback(() => {
    if (!isLoading) {
      if (showModifyInput && modificationText.trim()) {
        onModify(plan.id, modificationText);
        setShowModifyInput(false);
        setModificationText('');
      } else {
        setShowModifyInput(true);
      }
    }
  }, [plan.id, onModify, isLoading, showModifyInput, modificationText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden',
        isLoading && 'opacity-70 pointer-events-none',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{plan.title}</h3>
              <p className="text-sm text-slate-600">{plan.summary}</p>
            </div>
          </div>

          {plan.riskLevel && (
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded border',
                getRiskBadge(plan.riskLevel)
              )}
            >
              {plan.riskLevel} risk
            </span>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex gap-4 mt-3 text-sm text-slate-600">
          {plan.totalEstimatedDuration && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{plan.totalEstimatedDuration}</span>
            </div>
          )}
          {plan.totalEstimatedCost !== undefined && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>${plan.totalEstimatedCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4" />
            <span>{plan.steps.length} steps</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4">
        <div className="space-y-2">
          {visibleSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                step.isOptional
                  ? 'border-dashed border-slate-200 bg-slate-50/50'
                  : 'border-slate-200 bg-white'
              )}
            >
              {/* Step number */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                {step.order}
              </div>

              {/* Step icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                  getStepColor(step.type)
                )}
              >
                {getStepIcon(step.type)}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {step.title}
                  </span>
                  {step.isOptional && (
                    <span className="text-xs text-slate-500">(optional)</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                  {step.description}
                </p>

                {/* Step metadata */}
                <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                  {step.estimatedDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.estimatedDuration}
                    </span>
                  )}
                  {step.toolName && (
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {step.toolName}
                    </span>
                  )}
                  {step.agentName && (
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {step.agentName}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show more/less toggle */}
        {hasMoreSteps && (
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className="flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            {showAllSteps ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {plan.steps.length - 3} more steps
              </>
            )}
          </button>
        )}
      </div>

      {/* Modification Input */}
      <AnimatePresence>
        {showModifyInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <label className="text-sm font-medium text-amber-800">
                How should we modify the plan?
              </label>
              <textarea
                value={modificationText}
                onChange={(e) => setModificationText(e.target.value)}
                placeholder="Describe your modifications..."
                className="w-full mt-2 p-2 text-sm border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                rows={2}
              />
            </div>
          </motion.div>
        )}

        {showRejectInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <label className="text-sm font-medium text-red-800">
                Why are you rejecting this plan?
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason (optional)..."
                className="w-full mt-2 p-2 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                rows={2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="p-4 bg-slate-50 border-t flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <AlertCircle className="w-4 h-4" />
          <span>Review plan before proceeding</span>
        </div>

        <div className="flex gap-2">
          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border border-red-200 text-red-600 hover:bg-red-50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              showRejectInput && rejectionReason.trim() && 'bg-red-600 text-white hover:bg-red-700 border-red-600'
            )}
          >
            <XCircle className="w-4 h-4" />
            {showRejectInput && rejectionReason.trim() ? 'Confirm Reject' : 'Reject'}
          </button>

          {/* Modify */}
          <button
            onClick={handleModify}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border border-amber-200 text-amber-600 hover:bg-amber-50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              showModifyInput && modificationText.trim() && 'bg-amber-600 text-white hover:bg-amber-700 border-amber-600'
            )}
          >
            <Edit3 className="w-4 h-4" />
            {showModifyInput && modificationText.trim() ? 'Submit Changes' : 'Modify'}
          </button>

          {/* Approve */}
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default PlanApprovalCard;
