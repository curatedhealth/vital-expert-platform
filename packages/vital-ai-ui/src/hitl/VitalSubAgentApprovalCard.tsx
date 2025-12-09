/**
 * Sub-Agent Approval Card
 *
 * Displays sub-agent spawn request for HITL approval.
 * Shows:
 * - Agent info (name, role, capabilities)
 * - Spawn justification
 * - Expected contributions
 * - Approve/Reject actions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

interface AgentCapability {
  name: string;
  description: string;
}

interface SubAgentRequest {
  id: string;
  agentName: string;
  agentRole: string;
  level: 'L2' | 'L3' | 'L4' | 'L5';
  justification: string;
  capabilities: AgentCapability[];
  expectedOutput: string;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedTokens?: number;
}

interface SubAgentApprovalCardProps {
  request: SubAgentRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  className?: string;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  L2: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  L3: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  L4: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  L5: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500/50' },
};

const LEVEL_LABELS: Record<string, string> = {
  L2: 'Expert',
  L3: 'Specialist',
  L4: 'Worker',
  L5: 'Tool',
};

const RISK_ICONS: Record<string, React.ReactNode> = {
  low: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  medium: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  high: <AlertTriangle className="w-4 h-4 text-orange-400" />,
};

export function SubAgentApprovalCard({
  request,
  onApprove,
  onReject,
  className = '',
}: SubAgentApprovalCardProps) {
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const levelColors = LEVEL_COLORS[request.level];

  const handleReject = () => {
    if (showRejectInput && rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 border-purple-500/50 bg-purple-500/10 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{request.agentName}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${levelColors.bg} ${levelColors.text}`}>
                  {request.level} {LEVEL_LABELS[request.level]}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-0.5">{request.agentRole}</p>
            </div>
          </div>

          {/* Risk & Token Estimate */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {RISK_ICONS[request.riskLevel]}
              <span className="text-xs text-zinc-400">{request.riskLevel} risk</span>
            </div>
            {request.estimatedTokens && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Zap className="w-3 h-3" />
                <span>~{request.estimatedTokens.toLocaleString()} tokens</span>
              </div>
            )}
          </div>
        </div>

        {/* Justification */}
        <div className="mt-3 p-3 bg-zinc-800/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-zinc-500 mb-1">Why spawn this agent?</p>
              <p className="text-sm text-zinc-300">{request.justification}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Toggle */}
      <button
        onClick={() => setShowCapabilities(!showCapabilities)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">
            Capabilities ({request.capabilities.length})
          </span>
        </div>
        {showCapabilities ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {/* Capabilities Content */}
      <AnimatePresence>
        {showCapabilities && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-700/30 overflow-hidden"
          >
            <div className="p-4 space-y-2 bg-zinc-900/50">
              {request.capabilities.map((cap, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-zinc-800/30 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-zinc-300">{cap.name}</span>
                    <p className="text-xs text-zinc-500">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expected Output */}
      <div className="px-4 py-3 border-t border-zinc-700/30 bg-zinc-900/30">
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Expected contribution</p>
            <p className="text-sm text-zinc-300">{request.expectedOutput}</p>
          </div>
        </div>
      </div>

      {/* Reject Reason Input */}
      <AnimatePresence>
        {showRejectInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2"
          >
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why reject spawning this agent?"
              className="w-full p-2 bg-zinc-800/50 border border-red-500/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
              rows={2}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-700/30">
        <button
          onClick={handleReject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          {showRejectInput ? 'Confirm' : 'Reject'}
        </button>
        <button
          onClick={onApprove}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors"
        >
          <Bot className="w-4 h-4" />
          Spawn Agent
        </button>
      </div>
    </motion.div>
  );
}

export default SubAgentApprovalCard;
