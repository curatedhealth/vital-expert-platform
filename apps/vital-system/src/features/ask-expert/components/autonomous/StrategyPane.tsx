'use client';

/**
 * VITAL Platform - StrategyPane Component
 *
 * Displays the AI's planned strategy before and during mission execution.
 * Shows:
 * - Overall approach and reasoning
 * - Planned steps with estimated resources
 * - Expected outputs and artifacts
 * - Risk assessments and contingencies
 *
 * This provides transparency into the agent's "thinking" and supports
 * VITAL's HITL philosophy for autonomous operations.
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Target,
  Lightbulb,
  Clock,
  Zap,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  Brain,
  Route,
  Package,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface StrategyStep {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  estimatedTokens?: number;
  tools?: string[];
  status: 'pending' | 'active' | 'complete' | 'skipped';
  reasoning?: string;
}

export interface StrategyOutput {
  id: string;
  name: string;
  type: 'document' | 'analysis' | 'data' | 'summary' | 'visualization';
  description: string;
  format?: string;
}

export interface StrategyRisk {
  id: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface Strategy {
  overview: string;
  approach: string;
  steps: StrategyStep[];
  expectedOutputs: StrategyOutput[];
  risks?: StrategyRisk[];
  estimatedTotalDuration: string;
  estimatedTotalTokens?: number;
  confidence: number; // 0-100
}

export interface StrategyPaneProps {
  strategy: Strategy | null;
  isLoading?: boolean;
  isExpanded?: boolean;
  currentStepId?: string;
  onToggleExpand?: () => void;
  className?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getStatusIcon = (status: StrategyStep['status']) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'active':
      return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
    case 'skipped':
      return <Circle className="w-4 h-4 text-neutral-400 line-through" />;
    default:
      return <Circle className="w-4 h-4 text-neutral-400" />;
  }
};

const getRiskColor = (level: StrategyRisk['level']) => {
  switch (level) {
    case 'high':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'medium':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    default:
      return 'text-green-500 bg-green-500/10 border-green-500/20';
  }
};

const getOutputIcon = (type: StrategyOutput['type']) => {
  switch (type) {
    case 'document':
      return <FileText className="w-4 h-4" />;
    case 'analysis':
      return <Brain className="w-4 h-4" />;
    case 'data':
      return <Package className="w-4 h-4" />;
    case 'visualization':
      return <Target className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  badge,
  isExpanded,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className="flex items-center justify-between w-full py-2 text-left group"
  >
    <div className="flex items-center gap-2">
      <span className="text-purple-400">{icon}</span>
      <span className="text-sm font-medium text-white">{title}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <motion.div
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
    </motion.div>
  </button>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const StrategyPane: React.FC<StrategyPaneProps> = ({
  strategy,
  isLoading = false,
  isExpanded = true,
  currentStepId,
  onToggleExpand,
  className,
}) => {
  // Section expansion states
  const [expandedSections, setExpandedSections] = useState({
    approach: true,
    steps: true,
    outputs: false,
    risks: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate progress
  const progress = useMemo(() => {
    if (!strategy?.steps.length) return 0;
    const completed = strategy.steps.filter(s => s.status === 'complete').length;
    return Math.round((completed / strategy.steps.length) * 100);
  }, [strategy?.steps]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-neutral-900/50 rounded-xl border border-purple-500/20 p-4', className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          <div>
            <p className="text-sm font-medium text-white">Generating Strategy...</p>
            <p className="text-xs text-neutral-400">Analyzing mission requirements</p>
          </div>
        </div>
      </div>
    );
  }

  // No strategy state
  if (!strategy) {
    return (
      <div className={cn('bg-neutral-900/50 rounded-xl border border-neutral-700/50 p-4', className)}>
        <div className="flex items-center gap-3 text-neutral-400">
          <Route className="w-5 h-5" />
          <p className="text-sm">Strategy will appear once mission begins</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-neutral-900/50 rounded-xl border border-purple-500/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Mission Strategy</h3>
            <p className="text-xs text-neutral-400">
              {strategy.confidence}% confidence • {strategy.estimatedTotalDuration}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-neutral-400">Progress</p>
            <p className="text-sm font-medium text-white">{progress}%</p>
          </div>
          <div className="w-24 h-2 bg-neutral-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Overview */}
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-neutral-200 whitespace-pre-wrap">
                  {strategy.overview}
                </p>
              </div>

              {/* Approach Section */}
              <div className="border border-neutral-700/50 rounded-lg overflow-hidden">
                <SectionHeader
                  icon={<Brain className="w-4 h-4" />}
                  title="Approach"
                  isExpanded={expandedSections.approach}
                  onToggle={() => toggleSection('approach')}
                />
                <AnimatePresence>
                  {expandedSections.approach && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">
                          {strategy.approach}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Steps Section */}
              <div className="border border-neutral-700/50 rounded-lg overflow-hidden">
                <SectionHeader
                  icon={<Route className="w-4 h-4" />}
                  title="Execution Steps"
                  badge={`${strategy.steps.length} steps`}
                  isExpanded={expandedSections.steps}
                  onToggle={() => toggleSection('steps')}
                />
                <AnimatePresence>
                  {expandedSections.steps && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {strategy.steps.map((step, index) => (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg transition-colors',
                              step.id === currentStepId
                                ? 'bg-purple-500/20 border border-purple-500/30'
                                : 'bg-neutral-800/50 hover:bg-neutral-800',
                              step.status === 'complete' && 'opacity-70'
                            )}
                          >
                            <div className="pt-0.5">
                              {getStatusIcon(step.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn(
                                  'text-sm font-medium',
                                  step.status === 'complete' ? 'text-neutral-400' : 'text-white'
                                )}>
                                  {index + 1}. {step.name}
                                </p>
                                <span className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {step.estimatedDuration}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-400 mt-1">
                                {step.description}
                              </p>
                              {step.tools && step.tools.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {step.tools.map(tool => (
                                    <span
                                      key={tool}
                                      className="px-2 py-0.5 text-xs bg-neutral-700/50 text-neutral-300 rounded"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {step.reasoning && step.status === 'active' && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs text-purple-300 mt-2 italic"
                                >
                                  "{step.reasoning}"
                                </motion.p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expected Outputs Section */}
              <div className="border border-neutral-700/50 rounded-lg overflow-hidden">
                <SectionHeader
                  icon={<Package className="w-4 h-4" />}
                  title="Expected Outputs"
                  badge={`${strategy.expectedOutputs.length} artifacts`}
                  isExpanded={expandedSections.outputs}
                  onToggle={() => toggleSection('outputs')}
                />
                <AnimatePresence>
                  {expandedSections.outputs && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-2">
                          {strategy.expectedOutputs.map(output => (
                            <div
                              key={output.id}
                              className="flex items-start gap-2 p-2 bg-neutral-800/50 rounded-lg"
                            >
                              <span className="text-purple-400 mt-0.5">
                                {getOutputIcon(output.type)}
                              </span>
                              <div>
                                <p className="text-sm text-white">{output.name}</p>
                                <p className="text-xs text-neutral-400">
                                  {output.description}
                                </p>
                                {output.format && (
                                  <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded">
                                    {output.format}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Risks Section (if any) */}
              {strategy.risks && strategy.risks.length > 0 && (
                <div className="border border-neutral-700/50 rounded-lg overflow-hidden">
                  <SectionHeader
                    icon={<AlertTriangle className="w-4 h-4" />}
                    title="Risk Assessment"
                    badge={`${strategy.risks.length} identified`}
                    isExpanded={expandedSections.risks}
                    onToggle={() => toggleSection('risks')}
                  />
                  <AnimatePresence>
                    {expandedSections.risks && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {strategy.risks.map(risk => (
                            <div
                              key={risk.id}
                              className={cn(
                                'p-3 rounded-lg border',
                                getRiskColor(risk.level)
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">
                                  {risk.level} Risk
                                </span>
                              </div>
                              <p className="text-sm text-neutral-200">
                                {risk.description}
                              </p>
                              <p className="text-xs text-neutral-400 mt-2">
                                <span className="font-medium">Mitigation:</span> {risk.mitigation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Resource Estimates */}
              {strategy.estimatedTotalTokens && (
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs">Estimated Resources</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-300">
                      ~{strategy.estimatedTotalTokens.toLocaleString()} tokens
                    </span>
                    <span className="text-xs text-neutral-300">
                      ~{strategy.estimatedTotalDuration}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      {onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="w-full py-2 border-t border-neutral-700/50 text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-3 h-3" />
              Collapse Strategy
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3" />
              Expand Strategy
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

export default StrategyPane;
