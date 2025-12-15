/**
 * Tool Execution Card
 *
 * Displays tool execution request for HITL approval.
 * Shows:
 * - Tool name and description
 * - Input parameters
 * - Risk assessment
 * - Approve/Reject actions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Info,
} from 'lucide-react';

interface ToolParameter {
  name: string;
  value: unknown;
  type: string;
  sensitive?: boolean;
}

interface ToolExecutionRequest {
  id: string;
  toolName: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskReason?: string;
  estimatedDuration?: string;
}

interface ToolExecutionCardProps {
  request: ToolExecutionRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
  className?: string;
}

const RISK_STYLES: Record<string, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
  low: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  },
  medium: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  },
  high: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  },
  critical: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: <XCircle className="w-4 h-4 text-red-400" />,
  },
};

export function ToolExecutionCard({
  request,
  onApprove,
  onReject,
  className = '',
}: ToolExecutionCardProps) {
  const [showParams, setShowParams] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const riskStyles = RISK_STYLES[request.riskLevel];

  const handleReject = () => {
    if (showRejectInput && rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  };

  const formatValue = (value: unknown, sensitive?: boolean): string => {
    if (sensitive) return '••••••••';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 ${riskStyles.border} ${riskStyles.bg} overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800/50 rounded-lg">
              <Wrench className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{request.toolName}</h3>
                <span className="px-2 py-0.5 text-xs bg-zinc-700/50 text-zinc-400 rounded">
                  {request.category}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-0.5">{request.description}</p>
            </div>
          </div>

          {/* Risk Badge */}
          <div className="flex items-center gap-2">
            {riskStyles.icon}
            <span className={`text-sm font-medium ${riskStyles.text}`}>
              {request.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Risk Reason */}
        {request.riskReason && (
          <div className="mt-3 flex items-start gap-2 p-2 bg-zinc-800/30 rounded-lg">
            <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-400">{request.riskReason}</p>
          </div>
        )}
      </div>

      {/* Parameters Toggle */}
      <button
        onClick={() => setShowParams(!showParams)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">
            Parameters ({request.parameters.length})
          </span>
        </div>
        {showParams ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {/* Parameters Content */}
      <AnimatePresence>
        {showParams && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-700/30 overflow-hidden"
          >
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto bg-zinc-900/50">
              {request.parameters.map((param, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 bg-zinc-800/30 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-300">{param.name}</span>
                      <span className="text-xs text-zinc-500">({param.type})</span>
                      {param.sensitive && (
                        <Shield className="w-3 h-3 text-amber-400" title="Sensitive" />
                      )}
                    </div>
                    <pre className="mt-1 text-xs text-zinc-400 whitespace-pre-wrap font-mono overflow-hidden">
                      {formatValue(param.value, param.sensitive)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              placeholder="Why are you rejecting this tool execution?"
              className="w-full p-2 bg-zinc-800/50 border border-red-500/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
              rows={2}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-700/30 bg-zinc-900/30">
        {request.estimatedDuration && (
          <span className="text-xs text-zinc-500 mr-auto">
            Est. duration: {request.estimatedDuration}
          </span>
        )}
        <button
          onClick={handleReject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          {showRejectInput ? 'Confirm' : 'Reject'}
        </button>
        <button
          onClick={onApprove}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Execute
        </button>
      </div>
    </motion.div>
  );
}

export default ToolExecutionCard;
