'use client';

/**
 * VITAL Platform - Sub-Agent Delegation Card
 *
 * Displays when the orchestrator delegates a task to a specialist sub-agent.
 * Shows the delegation flow, sub-agent details, and allows user intervention.
 *
 * Used in HITL workflows to provide visibility into agent collaboration
 * and allow users to approve/reject delegations to specialists.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type DelegationStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type AgentTier = 1 | 2 | 3 | 4 | 5;

export interface SubAgentInfo {
  id: string;
  name: string;
  displayName: string;
  tier: AgentTier;
  specialization: string;
  avatar?: string;
  capabilities?: string[];
  confidenceScore?: number;
  estimatedCost?: number;
  estimatedDuration?: string;
}

export interface DelegationContext {
  reason: string;
  taskDescription: string;
  expectedOutput?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SubAgentDelegation {
  id: string;
  fromAgent: SubAgentInfo;
  toAgent: SubAgentInfo;
  context: DelegationContext;
  status: DelegationStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
}

export interface SubAgentDelegationCardProps {
  /** The delegation to display */
  delegation: SubAgentDelegation;
  /** Called when user approves the delegation */
  onApprove?: (delegationId: string) => void;
  /** Called when user rejects the delegation */
  onReject?: (delegationId: string, reason?: string) => void;
  /** Whether approval is required (HITL mode) */
  requiresApproval?: boolean;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

// Brand v6.0 Purple-centric tier colors
function getTierInfo(tier: AgentTier) {
  const tiers: Record<AgentTier, { label: string; color: string; icon: React.ReactNode }> = {
    1: { label: 'L1', color: 'bg-purple-100 text-purple-600 border-purple-200', icon: <Bot className="w-3 h-3" /> },
    2: { label: 'L2', color: 'bg-violet-100 text-violet-600 border-violet-200', icon: <Zap className="w-3 h-3" /> },
    3: { label: 'L3', color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200', icon: <Star className="w-3 h-3" /> },
    4: { label: 'L4', color: 'bg-pink-100 text-pink-600 border-pink-200', icon: <Sparkles className="w-3 h-3" /> },
    5: { label: 'L5', color: 'bg-stone-100 text-stone-600 border-stone-200', icon: <Shield className="w-3 h-3" /> },
  };
  return tiers[tier] || tiers[1];
}

function getStatusInfo(status: DelegationStatus) {
  const statuses: Record<DelegationStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending_approval: {
      label: 'Awaiting Approval',
      color: 'bg-amber-100 text-amber-700',
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      label: 'Approved',
      color: 'bg-green-100 text-green-700',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-700',
      icon: <XCircle className="w-4 h-4" />,
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-purple-100 text-purple-700',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    completed: {
      label: 'Completed',
      color: 'bg-emerald-100 text-emerald-700',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    failed: {
      label: 'Failed',
      color: 'bg-red-100 text-red-700',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  };
  return statuses[status] || statuses.pending_approval;
}

// Brand v6.0 Purple-centric priority colors
function getPriorityColor(priority?: 'low' | 'normal' | 'high' | 'urgent') {
  const colors = {
    low: 'text-stone-500',
    normal: 'text-purple-500',
    high: 'text-amber-500',
    urgent: 'text-red-500',
  };
  return colors[priority || 'normal'];
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface AgentBadgeProps {
  agent: SubAgentInfo;
  side: 'from' | 'to';
}

function AgentBadge({ agent, side }: AgentBadgeProps) {
  const tierInfo = getTierInfo(agent.tier);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-lg bg-white border',
      side === 'to' ? 'border-purple-200' : 'border-stone-200'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold',
        side === 'to' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'
      )}>
        {agent.avatar && !avatarError ? (
          <img
            src={agent.avatar}
            alt={agent.displayName}
            className="w-full h-full rounded-lg object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          agent.displayName.charAt(0)
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate text-sm">
            {agent.displayName}
          </span>
          <span className={cn('px-1.5 py-0.5 text-xs font-medium rounded border', tierInfo.color)}>
            {tierInfo.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">
          {agent.specialization}
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SubAgentDelegationCard({
  delegation,
  onApprove,
  onReject,
  requiresApproval = false,
  compact = false,
  className,
}: SubAgentDelegationCardProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const statusInfo = getStatusInfo(delegation.status);
  const isPending = delegation.status === 'pending_approval';
  const isActive = delegation.status === 'in_progress';

  const handleApprove = useCallback(() => {
    onApprove?.(delegation.id);
  }, [delegation.id, onApprove]);

  const handleReject = useCallback(() => {
    if (showRejectInput && rejectReason.trim()) {
      onReject?.(delegation.id, rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  }, [delegation.id, onReject, showRejectInput, rejectReason]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden',
        isPending ? 'border-amber-200' : 'border-slate-200',
        isActive && 'border-purple-200 ring-1 ring-purple-100',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'p-4 border-b',
        isPending ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
      )}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Agent Delegation</h3>
          </div>
          <span className={cn('flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full', statusInfo.color)}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Delegation Flow */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <AgentBadge agent={delegation.fromAgent} side="from" />
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isActive ? 'bg-purple-100' : 'bg-stone-100'
            )}>
              {isActive ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <span className="text-xs text-slate-400 mt-1">delegates to</span>
          </div>

          <div className="flex-1">
            <AgentBadge agent={delegation.toAgent} side="to" />
          </div>
        </div>

        {/* Context toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1.5 mt-4 text-sm text-slate-600 hover:text-slate-900"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showDetails ? 'Hide details' : 'Show details'}
        </button>

        {/* Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-3">
                {/* Reason */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Reason for Delegation
                  </label>
                  <p className="text-sm text-slate-700 mt-1">
                    {delegation.context.reason}
                  </p>
                </div>

                {/* Task */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Task Description
                  </label>
                  <p className="text-sm text-slate-700 mt-1">
                    {delegation.context.taskDescription}
                  </p>
                </div>

                {/* Expected output */}
                {delegation.context.expectedOutput && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expected Output
                    </label>
                    <p className="text-sm text-slate-700 mt-1">
                      {delegation.context.expectedOutput}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex gap-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  {delegation.context.priority && (
                    <span className={cn('flex items-center gap-1', getPriorityColor(delegation.context.priority))}>
                      <Zap className="w-3 h-3" />
                      {delegation.context.priority} priority
                    </span>
                  )}
                  {delegation.toAgent.estimatedCost !== undefined && (
                    <span>Est. cost: ${delegation.toAgent.estimatedCost.toFixed(2)}</span>
                  )}
                  {delegation.toAgent.estimatedDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {delegation.toAgent.estimatedDuration}
                    </span>
                  )}
                  {delegation.toAgent.confidenceScore !== undefined && (
                    <span>Confidence: {Math.round(delegation.toAgent.confidenceScore * 100)}%</span>
                  )}
                </div>

                {/* Capabilities */}
                {delegation.toAgent.capabilities && delegation.toAgent.capabilities.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Agent Capabilities
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {delegation.toAgent.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result (if completed) */}
                {delegation.status === 'completed' && delegation.result && (
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                    <label className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Result
                    </label>
                    <p className="text-sm text-emerald-800 mt-1">
                      {delegation.result}
                    </p>
                  </div>
                )}

                {/* Error (if failed) */}
                {delegation.status === 'failed' && delegation.error && (
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <label className="text-xs font-medium text-red-700 uppercase tracking-wider">
                      Error
                    </label>
                    <p className="text-sm text-red-800 mt-1">
                      {delegation.error}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rejection reason input */}
      <AnimatePresence>
        {showRejectInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <label className="text-sm font-medium text-red-800">
                Why are you rejecting this delegation?
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason..."
                className="w-full mt-2 p-2 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                rows={2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions (only if pending and requires approval) */}
      {requiresApproval && isPending && (
        <div className="p-4 bg-slate-50 border-t flex items-center justify-end gap-2">
          <button
            onClick={handleReject}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'border border-red-200 text-red-600 hover:bg-red-50',
              showRejectInput && rejectReason.trim() && 'bg-red-600 text-white hover:bg-red-700 border-red-600'
            )}
          >
            <XCircle className="w-4 h-4" />
            {showRejectInput && rejectReason.trim() ? 'Confirm Reject' : 'Reject'}
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Delegation
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default SubAgentDelegationCard;
