/**
 * HITL Checkpoint Modal
 *
 * Displays Human-in-the-Loop approval requests for Mode 3
 * Allows users to approve, reject, or modify execution plans
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Bot,
  Wrench,
  FileText,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  HITLCheckpoint,
  HITLCheckpointType,
  HITLResponse,
  ExecutionPlan,
} from '../types';

interface HITLCheckpointModalProps {
  checkpoint: HITLCheckpoint;
  isOpen: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onModify?: (modifications: Record<string, unknown>) => void;
  onClose: () => void;
  userId?: string;
}

const CHECKPOINT_ICONS: Record<HITLCheckpointType, React.ReactNode> = {
  plan: <FileText className="w-5 h-5" />,
  tool: <Wrench className="w-5 h-5" />,
  subagent: <Bot className="w-5 h-5" />,
  decision: <Brain className="w-5 h-5" />,
  final: <CheckCircle2 className="w-5 h-5" />,
};

const CHECKPOINT_COLORS: Record<HITLCheckpointType, string> = {
  plan: 'from-blue-500 to-blue-600',
  tool: 'from-amber-500 to-orange-600',
  subagent: 'from-purple-500 to-violet-600',
  decision: 'from-rose-500 to-pink-600',
  final: 'from-emerald-500 to-green-600',
};

const CHECKPOINT_LABELS: Record<HITLCheckpointType, string> = {
  plan: 'Execution Plan Approval',
  tool: 'Tool Execution Approval',
  subagent: 'Agent Spawning Approval',
  decision: 'Decision Approval',
  final: 'Final Response Approval',
};

export function HITLCheckpointModal({
  checkpoint,
  isOpen,
  onApprove,
  onReject,
  onModify,
  onClose,
  userId,
}: HITLCheckpointModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !checkpoint) return null;

  const { request } = checkpoint;
  const checkpointType = checkpoint.checkpoint_type;
  const timeoutMs = (request?.timeout_seconds || 180) * 1000;
  const createdAt = new Date(checkpoint.created_at).getTime();
  const timeRemaining = Math.max(0, Math.ceil((timeoutMs - (Date.now() - createdAt)) / 1000));

  const handleApprove = () => {
    onApprove();
    setShowRejectInput(false);
    setRejectReason('');
  };

  const handleReject = () => {
    if (showRejectInput && rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/50';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-zinc-700/50 overflow-hidden"
        >
          {/* Header with gradient */}
          <div
            className={`bg-gradient-to-r ${CHECKPOINT_COLORS[checkpointType]} p-4`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {CHECKPOINT_ICONS[checkpointType]}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  {CHECKPOINT_LABELS[checkpointType]}
                </h2>
                <p className="text-sm text-white/80">
                  {request?.title || 'Approval Required'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white">
                  {timeRemaining}s
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Description */}
            <div className="text-sm text-zinc-300 leading-relaxed">
              {request?.description || 'Please review and approve this action.'}
            </div>

            {/* Risk Assessment */}
            {request?.risk_assessment && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskBadgeColor(
                    request.risk_assessment.overall_risk
                  )}`}
                >
                  {request.risk_assessment.overall_risk.toUpperCase()}
                </span>
              </div>
            )}

            {/* Expandable Details */}
            {request?.details && (
              <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-zinc-300">
                    View Details
                  </span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-zinc-700/50"
                    >
                      <div className="p-3 bg-zinc-800/30 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono">
                          {JSON.stringify(request.details, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Reject Reason Input */}
            <AnimatePresence>
              {showRejectInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    rows={3}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 border-t border-zinc-700/50 bg-zinc-900/50">
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {showRejectInput ? 'Confirm Reject' : 'Reject'}
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default HITLCheckpointModal;
