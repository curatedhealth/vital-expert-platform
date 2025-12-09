/**
 * User Prompt Modal
 *
 * Modal for entering a goal/prompt when using autonomous modes (Mode 3/4).
 * Provides:
 * - Goal input with character count
 * - HITL safety level selection
 * - Context/constraints input
 * - Expected deliverables checklist
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  ListChecks,
  MessageSquare,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
  Gauge,
  Settings,
} from 'lucide-react';

interface DeliverableOption {
  id: string;
  label: string;
  description: string;
  default?: boolean;
}

const DEFAULT_DELIVERABLES: DeliverableOption[] = [
  {
    id: 'summary',
    label: 'Executive Summary',
    description: 'High-level overview of findings',
    default: true,
  },
  {
    id: 'analysis',
    label: 'Detailed Analysis',
    description: 'In-depth examination with supporting evidence',
    default: true,
  },
  {
    id: 'recommendations',
    label: 'Recommendations',
    description: 'Actionable next steps and suggestions',
    default: true,
  },
  {
    id: 'sources',
    label: 'Source Citations',
    description: 'References and supporting documentation',
    default: false,
  },
  {
    id: 'timeline',
    label: 'Timeline/Roadmap',
    description: 'Suggested implementation schedule',
    default: false,
  },
];

type HITLSafetyLevel = 'strict' | 'balanced' | 'permissive';

interface HITLLevelConfig {
  id: HITLSafetyLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const HITL_LEVELS: HITLLevelConfig[] = [
  {
    id: 'strict',
    label: 'Strict',
    description: 'Approve every major decision. Maximum oversight.',
    icon: <Shield className="w-4 h-4" />,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/50',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Approve high-impact decisions only. Recommended.',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/50',
  },
  {
    id: 'permissive',
    label: 'Permissive',
    description: 'Minimal checkpoints. Trust the agent.',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/50',
  },
];

interface UserPromptModalProps {
  isOpen: boolean;
  agentName?: string;
  /** Pre-filled goal from chat input (if provided, goal input is hidden) */
  goal?: string;
  /** Default values from agent config (fetched from database) */
  agentDefaults?: {
    hitl_enabled?: boolean;
    hitl_safety_level?: HITLSafetyLevel;
    max_goal_iterations?: number;
    confidence_threshold?: number;
  };
  onSubmit: (data: {
    goal: string;
    context: string;
    hitlEnabled: boolean;
    hitlLevel: HITLSafetyLevel;
    maxIterations: number;
    deliverables: string[];
  }) => void;
  onClose: () => void;
}

export function UserPromptModal({
  isOpen,
  agentName,
  goal: prefilledGoal,
  agentDefaults,
  onSubmit,
  onClose,
}: UserPromptModalProps) {
  // If goal is prefilled from chat input, we're in "config-only" mode
  const isConfigOnly = Boolean(prefilledGoal);
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  // HITL controls - initialize from agent defaults
  const [hitlEnabled, setHitlEnabled] = useState(agentDefaults?.hitl_enabled ?? true);
  const [hitlLevel, setHitlLevel] = useState<HITLSafetyLevel>(
    agentDefaults?.hitl_safety_level ?? 'balanced'
  );
  // Max iterations for goal loop (1-20)
  const [maxIterations, setMaxIterations] = useState(agentDefaults?.max_goal_iterations ?? 5);
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>(
    DEFAULT_DELIVERABLES.filter((d) => d.default).map((d) => d.id)
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update state when agent defaults change
  React.useEffect(() => {
    if (agentDefaults) {
      if (agentDefaults.hitl_enabled !== undefined) setHitlEnabled(agentDefaults.hitl_enabled);
      if (agentDefaults.hitl_safety_level) setHitlLevel(agentDefaults.hitl_safety_level);
      if (agentDefaults.max_goal_iterations) setMaxIterations(agentDefaults.max_goal_iterations);
    }
  }, [agentDefaults]);

  if (!isOpen) return null;

  const toggleDeliverable = (id: string) => {
    setSelectedDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Use prefilled goal if available, otherwise use local goal
    const finalGoal = prefilledGoal || goal.trim();
    if (!finalGoal) return;
    onSubmit({
      goal: finalGoal,
      context: context.trim(),
      hitlEnabled,
      hitlLevel,
      maxIterations,
      deliverables: selectedDeliverables,
    });
    // Reset form
    setGoal('');
    setContext('');
    setHitlEnabled(agentDefaults?.hitl_enabled ?? true);
    setHitlLevel(agentDefaults?.hitl_safety_level ?? 'balanced');
    setMaxIterations(agentDefaults?.max_goal_iterations ?? 5);
    setSelectedDeliverables(DEFAULT_DELIVERABLES.filter((d) => d.default).map((d) => d.id));
    setShowAdvanced(false);
  };

  const charCount = goal.length;
  const maxChars = 2000;

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
          className="w-full max-w-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-zinc-700/50 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                {isConfigOnly ? (
                  <Settings className="w-5 h-5 text-primary" />
                ) : (
                  <Target className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isConfigOnly ? 'Configure Execution' : 'Define Your Goal'}
                </h2>
                {agentName && (
                  <p className="text-sm text-zinc-400">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {agentName} will work autonomously to achieve this
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Goal Section - Show prefilled goal or input */}
            {isConfigOnly ? (
              /* Config-only mode: Show the prefilled goal as read-only */
              <div className="space-y-2 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <MessageSquare className="w-4 h-4" />
                  Your Goal
                </label>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  {prefilledGoal}
                </p>
              </div>
            ) : (
              /* Full mode: Editable goal input */
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <MessageSquare className="w-4 h-4" />
                  What do you want to achieve?
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value.slice(0, maxChars))}
                  placeholder="Describe your goal in detail. Be specific about what you want to accomplish..."
                  className="w-full h-32 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Be specific for better results</span>
                  <span className={charCount > maxChars * 0.9 ? 'text-amber-400' : ''}>
                    {charCount}/{maxChars}
                  </span>
                </div>
              </div>
            )}

            {/* Autonomy Controls */}
            <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Gauge className="w-4 h-4" />
                Autonomy Controls
              </div>

              {/* Max Iterations Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Max Iterations
                  </label>
                  <span className="text-sm font-medium text-primary">{maxIterations}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Quick (1)</span>
                  <span>Standard (5)</span>
                  <span>Thorough (20)</span>
                </div>
              </div>

              {/* HITL Enable/Disable Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {hitlEnabled ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="text-sm text-zinc-300">Human-in-the-Loop Checkpoints</span>
                </div>
                <button
                  onClick={() => setHitlEnabled(!hitlEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    hitlEnabled ? 'bg-emerald-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      hitlEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {!hitlEnabled && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Agent will run without approval checkpoints
                </p>
              )}
            </div>

            {/* HITL Safety Level (only shown when HITL is enabled) */}
            {hitlEnabled && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Shield className="w-4 h-4" />
                  Approval Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {HITL_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setHitlLevel(level.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        hitlLevel === level.id
                          ? level.color + ' border-current'
                          : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {level.icon}
                        <span className="font-medium text-sm">{level.label}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <Info className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* Context/Constraints */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Info className="w-4 h-4" />
                      Additional Context (Optional)
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Any constraints, preferences, or background information..."
                      className="w-full h-20 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Expected Deliverables */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <ListChecks className="w-4 h-4" />
                      Expected Deliverables
                    </label>
                    <div className="space-y-2">
                      {DEFAULT_DELIVERABLES.map((deliverable) => (
                        <button
                          key={deliverable.id}
                          onClick={() => toggleDeliverable(deliverable.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            selectedDeliverables.includes(deliverable.id)
                              ? 'border-primary/50 bg-primary/10'
                              : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedDeliverables.includes(deliverable.id)
                                ? 'border-primary bg-primary'
                                : 'border-zinc-600'
                            }`}
                          >
                            {selectedDeliverables.includes(deliverable.id) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-300">
                              {deliverable.label}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {deliverable.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-zinc-700/50 bg-zinc-900/50 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isConfigOnly && !goal.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isConfigOnly || goal.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isConfigOnly ? 'Send' : 'Start Mission'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UserPromptModal;
