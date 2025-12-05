/**
 * Plan Approval Modal
 *
 * Full-screen modal for reviewing and approving execution plans.
 * Shows:
 * - Plan overview with steps
 * - Step details with edit capability
 * - Risk assessment per step
 * - Approve/Reject/Modify actions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  ChevronRight,
  Shield,
  Clock,
  Bot,
  Wrench,
  Database,
  Send,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface PlanStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'tool' | 'agent' | 'analysis' | 'output';
  estimatedTime?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
  editable?: boolean;
}

interface ExecutionPlan {
  id: string;
  title: string;
  description: string;
  steps: PlanStep[];
  totalEstimatedTime?: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

interface PlanApprovalModalProps {
  isOpen: boolean;
  plan: ExecutionPlan | null;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onModify?: (modifiedPlan: ExecutionPlan) => void;
  onClose: () => void;
}

const STEP_TYPE_ICONS: Record<PlanStep['type'], React.ReactNode> = {
  tool: <Wrench className="w-4 h-4" />,
  agent: <Bot className="w-4 h-4" />,
  analysis: <Database className="w-4 h-4" />,
  output: <Send className="w-4 h-4" />,
};

const RISK_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  low: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    badge: 'bg-green-500 text-white',
  },
  medium: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500 text-black',
  },
  high: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-white',
  },
  critical: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white',
  },
};

export function PlanApprovalModal({
  isOpen,
  plan,
  onApprove,
  onReject,
  onModify,
  onClose,
}: PlanApprovalModalProps) {
  const [selectedStep, setSelectedStep] = useState<PlanStep | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editedSteps, setEditedSteps] = useState<Record<string, Partial<PlanStep>>>({});

  if (!isOpen || !plan) return null;

  const riskColors = RISK_COLORS[plan.overallRisk];

  const handleReject = () => {
    if (showRejectInput && rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  };

  const handleStepEdit = (stepId: string, field: keyof PlanStep, value: string) => {
    setEditedSteps((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value,
      },
    }));
  };

  const getStepWithEdits = (step: PlanStep): PlanStep => ({
    ...step,
    ...editedSteps[step.id],
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-4xl h-[80vh] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-zinc-700/50 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`p-4 border-b ${riskColors.border} ${riskColors.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{plan.title}</h2>
                  <p className="text-sm text-white/70">{plan.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Risk Badge */}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${riskColors.badge}`}>
                  {plan.overallRisk.toUpperCase()} RISK
                </span>
                {/* Time Estimate */}
                {plan.totalEstimatedTime && (
                  <div className="flex items-center gap-1.5 text-sm text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>{plan.totalEstimatedTime}</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Steps List */}
            <div className="w-1/2 border-r border-zinc-700/50 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Execution Steps ({plan.steps.length})
              </h3>
              <div className="space-y-2">
                {plan.steps.map((step, index) => {
                  const displayStep = getStepWithEdits(step);
                  const stepRisk = RISK_COLORS[displayStep.riskLevel];
                  const isSelected = selectedStep?.id === step.id;

                  return (
                    <motion.button
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-primary/20 border border-primary/50'
                          : 'bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50'
                      }`}
                    >
                      {/* Step Number */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{STEP_TYPE_ICONS[displayStep.type]}</span>
                          <span className="font-medium text-zinc-200 truncate">{displayStep.title}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{displayStep.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-1.5 py-0.5 text-xs rounded ${stepRisk.bg} ${stepRisk.text}`}>
                            {displayStep.riskLevel}
                          </span>
                          {displayStep.estimatedTime && (
                            <span className="text-xs text-zinc-500">{displayStep.estimatedTime}</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-zinc-600'}`} />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step Details */}
            <div className="w-1/2 overflow-y-auto p-4">
              {selectedStep ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{getStepWithEdits(selectedStep).title}</h3>
                    {selectedStep.editable && (
                      <button
                        onClick={() => setEditingStep(editingStep === selectedStep.id ? null : selectedStep.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          editingStep === selectedStep.id
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {editingStep === selectedStep.id ? (
                    <textarea
                      value={editedSteps[selectedStep.id]?.description || selectedStep.description}
                      onChange={(e) => handleStepEdit(selectedStep.id, 'description', e.target.value)}
                      className="w-full h-32 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="text-sm text-zinc-400">{getStepWithEdits(selectedStep).description}</p>
                  )}

                  {/* Step Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-800/30 rounded-lg">
                      <p className="text-xs text-zinc-500 mb-1">Type</p>
                      <div className="flex items-center gap-2">
                        {STEP_TYPE_ICONS[selectedStep.type]}
                        <span className="text-sm text-zinc-300 capitalize">{selectedStep.type}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-800/30 rounded-lg">
                      <p className="text-xs text-zinc-500 mb-1">Risk Level</p>
                      <span className={`text-sm font-medium ${RISK_COLORS[selectedStep.riskLevel].text}`}>
                        {selectedStep.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    {selectedStep.estimatedTime && (
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Estimated Time</p>
                        <span className="text-sm text-zinc-300">{selectedStep.estimatedTime}</span>
                      </div>
                    )}
                    {selectedStep.dependencies && selectedStep.dependencies.length > 0 && (
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Dependencies</p>
                        <span className="text-sm text-zinc-300">{selectedStep.dependencies.length} steps</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  <p>Select a step to view details</p>
                </div>
              )}
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
                  placeholder="Enter reason for rejection..."
                  className="w-full p-3 bg-zinc-800/50 border border-red-500/50 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  rows={2}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-zinc-700/50 bg-zinc-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 font-medium transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                {showRejectInput ? 'Confirm Reject' : 'Reject'}
              </button>
              <button
                onClick={onApprove}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve Plan
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PlanApprovalModal;
