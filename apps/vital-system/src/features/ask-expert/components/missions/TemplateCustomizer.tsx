'use client';

/**
 * VITAL Platform - Mission Template Customizer
 *
 * Allows users to customize a mission template before launching.
 * Users can adjust parameters, set budget limits, configure agent preferences,
 * and modify execution settings.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  DollarSign,
  Users,
  Zap,
  Settings,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Brain,
  Timer,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type MissionFamily,
  type MissionComplexity,
  FAMILY_COLORS,
  COMPLEXITY_BADGES,
} from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface TemplateCustomizerData {
  id: string;
  name: string;
  family: MissionFamily;
  complexity: MissionComplexity;
  description: string;
  estimatedDurationMin: number;
  estimatedDurationMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  minAgents?: number;
  maxAgents?: number;
}

export interface MissionCustomizations {
  // Budget & Time
  maxBudget: number | null;
  maxDuration: number | null; // in minutes
  priorityLevel: 'low' | 'normal' | 'high' | 'urgent';

  // Agent Configuration
  agentCount: number;
  /** 5-level agent hierarchy: L1 (Masters) → L5 (Tools) */
  preferredAgentLevels: ('L1' | 'L2' | 'L3' | 'L4' | 'L5')[];
  requireHumanApproval: boolean;

  // Execution Settings
  parallelExecution: boolean;
  enableCaching: boolean;
  verboseOutput: boolean;

  // Quality Settings
  thoroughnessLevel: 'quick' | 'standard' | 'thorough' | 'exhaustive';
  citationRequirement: 'none' | 'minimal' | 'standard' | 'comprehensive';
  confidenceThreshold: number; // 0-100

  // Custom Instructions
  additionalInstructions: string;
}

export interface TemplateCustomizerProps {
  /** Template data */
  template: TemplateCustomizerData | null;
  /** Whether the customizer is open */
  isOpen: boolean;
  /** Called when user closes the customizer */
  onClose: () => void;
  /** Called when user launches the mission with customizations */
  onLaunch: (templateId: string, customizations: MissionCustomizations) => void;
  /** Initial customizations (for editing) */
  initialCustomizations?: Partial<MissionCustomizations>;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CUSTOMIZATIONS: MissionCustomizations = {
  maxBudget: null,
  maxDuration: null,
  priorityLevel: 'normal',
  agentCount: 3,
  preferredAgentLevels: ['L2', 'L3'], // L2 Experts + L3 Specialists by default
  requireHumanApproval: true,
  parallelExecution: true,
  enableCaching: true,
  verboseOutput: false,
  thoroughnessLevel: 'standard',
  citationRequirement: 'standard',
  confidenceThreshold: 80,
  additionalInstructions: '',
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Background processing, longer wait times acceptable' },
  { value: 'normal', label: 'Normal', description: 'Standard processing priority' },
  { value: 'high', label: 'High', description: 'Faster processing, may cost more' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate priority, premium pricing' },
] as const;

const THOROUGHNESS_OPTIONS = [
  { value: 'quick', label: 'Quick', description: 'Fast results, surface-level analysis', icon: Zap },
  { value: 'standard', label: 'Standard', description: 'Balanced depth and speed', icon: Target },
  { value: 'thorough', label: 'Thorough', description: 'Comprehensive analysis', icon: Brain },
  { value: 'exhaustive', label: 'Exhaustive', description: 'Maximum depth, all sources', icon: Shield },
] as const;

const CITATION_OPTIONS = [
  { value: 'none', label: 'None', description: 'No citations required' },
  { value: 'minimal', label: 'Minimal', description: 'Key claims only' },
  { value: 'standard', label: 'Standard', description: 'Major points cited' },
  { value: 'comprehensive', label: 'Comprehensive', description: 'All claims cited' },
] as const;

/** 5-Level Agent Hierarchy (replaces old tier1/tier2/tier3 system) */
const LEVEL_OPTIONS = [
  { value: 'L1', label: 'L1 - Masters', description: 'Domain leaders - strategic oversight' },
  { value: 'L2', label: 'L2 - Experts', description: 'Expert agents - deep domain expertise' },
  { value: 'L3', label: 'L3 - Specialists', description: 'Specialized knowledge - focused tasks' },
  { value: 'L4', label: 'L4 - Workers', description: 'Task execution - operational efficiency' },
  { value: 'L5', label: 'L5 - Tools', description: 'Utility functions - fast, cost-effective' },
] as const;

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium text-slate-900">
          {icon}
          {title}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors',
          checked ? 'bg-purple-600' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors">
          {label}
        </span>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TemplateCustomizer({
  template,
  isOpen,
  onClose,
  onLaunch,
  initialCustomizations,
  className,
}: TemplateCustomizerProps) {
  const [customizations, setCustomizations] = useState<MissionCustomizations>(() => ({
    ...DEFAULT_CUSTOMIZATIONS,
    ...initialCustomizations,
    agentCount: template?.minAgents ?? DEFAULT_CUSTOMIZATIONS.agentCount,
  }));

  const updateCustomization = useCallback(<K extends keyof MissionCustomizations>(
    key: K,
    value: MissionCustomizations[K]
  ) => {
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setCustomizations({
      ...DEFAULT_CUSTOMIZATIONS,
      agentCount: template?.minAgents ?? DEFAULT_CUSTOMIZATIONS.agentCount,
    });
  }, [template]);

  const handleLaunch = useCallback(() => {
    if (template) {
      onLaunch(template.id, customizations);
    }
  }, [template, customizations, onLaunch]);

  const toggleLevel = useCallback((level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5') => {
    setCustomizations((prev) => {
      const levels = prev.preferredAgentLevels.includes(level)
        ? prev.preferredAgentLevels.filter((l) => l !== level)
        : [...prev.preferredAgentLevels, level];
      return { ...prev, preferredAgentLevels: levels.length > 0 ? levels : [level] };
    });
  }, []);

  // Estimate impact of customizations
  const estimatedImpact = useMemo(() => {
    if (!template) return { costMultiplier: 1, timeMultiplier: 1 };

    let costMultiplier = 1;
    let timeMultiplier = 1;

    // Priority impact
    if (customizations.priorityLevel === 'high') {
      costMultiplier *= 1.25;
      timeMultiplier *= 0.75;
    } else if (customizations.priorityLevel === 'urgent') {
      costMultiplier *= 1.5;
      timeMultiplier *= 0.5;
    } else if (customizations.priorityLevel === 'low') {
      costMultiplier *= 0.85;
      timeMultiplier *= 1.5;
    }

    // Thoroughness impact
    if (customizations.thoroughnessLevel === 'quick') {
      costMultiplier *= 0.6;
      timeMultiplier *= 0.5;
    } else if (customizations.thoroughnessLevel === 'thorough') {
      costMultiplier *= 1.4;
      timeMultiplier *= 1.5;
    } else if (customizations.thoroughnessLevel === 'exhaustive') {
      costMultiplier *= 2;
      timeMultiplier *= 2.5;
    }

    // Level impact (L1-L2 = premium, L4-L5 = cost-effective)
    const hasHighLevels = customizations.preferredAgentLevels.some(l => ['L1', 'L2'].includes(l));
    const hasLowLevels = customizations.preferredAgentLevels.some(l => ['L4', 'L5'].includes(l));
    if (hasHighLevels && !hasLowLevels) {
      costMultiplier *= 1.3; // Higher cost for expert agents only
    } else if (hasLowLevels && !hasHighLevels) {
      costMultiplier *= 0.7; // Lower cost for worker/tool agents only
    }

    // Agent count impact
    const baseAgents = template.minAgents ?? 3;
    costMultiplier *= customizations.agentCount / baseAgents;

    return { costMultiplier, timeMultiplier };
  }, [template, customizations]);

  if (!template) return null;

  const familyColor = FAMILY_COLORS[template.family];
  const estimatedCost = template.estimatedCostMax * estimatedImpact.costMultiplier;
  const estimatedTime = template.estimatedDurationMax * estimatedImpact.timeMultiplier;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-full max-w-xl z-50',
              'bg-white shadow-2xl overflow-hidden flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className={cn('flex-shrink-0', familyColor)}>
              <div className="px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6" />
                    <div>
                      <h2 className="text-lg font-semibold">Customize Mission</h2>
                      <p className="text-sm text-white/80">{template.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {/* Budget & Time Section */}
              <CollapsibleSection
                title="Budget & Time"
                icon={<DollarSign className="w-5 h-5 text-green-500" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Budget ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={customizations.maxBudget ?? ''}
                      onChange={(e) => updateCustomization('maxBudget', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="No limit"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Duration (min)
                    </label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={customizations.maxDuration ?? ''}
                      onChange={(e) => updateCustomization('maxDuration', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="No limit"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateCustomization('priorityLevel', option.value)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-all',
                          customizations.priorityLevel === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <span className="font-medium text-sm text-slate-900">{option.label}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              {/* Agent Configuration */}
              <CollapsibleSection
                title="Agent Configuration"
                icon={<Users className="w-5 h-5 text-blue-500" />}
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Agents: {customizations.agentCount}
                  </label>
                  <input
                    type="range"
                    min={template.minAgents ?? 1}
                    max={template.maxAgents ?? 10}
                    value={customizations.agentCount}
                    onChange={(e) => updateCustomization('agentCount', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{template.minAgents ?? 1}</span>
                    <span>{template.maxAgents ?? 10}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Agent Levels
                  </label>
                  <div className="space-y-2">
                    {LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => toggleLevel(level.value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                          customizations.preferredAgentLevels.includes(level.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded flex items-center justify-center',
                          customizations.preferredAgentLevels.includes(level.value)
                            ? 'bg-purple-500 text-white'
                            : 'border border-slate-300'
                        )}>
                          {customizations.preferredAgentLevels.includes(level.value) && (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm text-slate-900">{level.label}</span>
                          <p className="text-xs text-slate-500">{level.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <ToggleSwitch
                  label="Require Human Approval"
                  description="Pause for approval at key decision points"
                  checked={customizations.requireHumanApproval}
                  onChange={(v) => updateCustomization('requireHumanApproval', v)}
                />
              </CollapsibleSection>

              {/* Quality Settings */}
              <CollapsibleSection
                title="Quality Settings"
                icon={<Sparkles className="w-5 h-5 text-amber-500" />}
                defaultOpen={false}
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Thoroughness Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {THOROUGHNESS_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateCustomization('thoroughnessLevel', option.value)}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all',
                            customizations.thoroughnessLevel === option.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <Icon className={cn(
                            'w-5 h-5',
                            customizations.thoroughnessLevel === option.value ? 'text-purple-500' : 'text-slate-400'
                          )} />
                          <div>
                            <span className="font-medium text-sm text-slate-900">{option.label}</span>
                            <p className="text-[10px] text-slate-500">{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Citation Requirements
                  </label>
                  <select
                    value={customizations.citationRequirement}
                    onChange={(e) => updateCustomization('citationRequirement', e.target.value as MissionCustomizations['citationRequirement'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {CITATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confidence Threshold: {customizations.confidenceThreshold}%
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={customizations.confidenceThreshold}
                    onChange={(e) => updateCustomization('confidenceThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum confidence level for agent outputs
                  </p>
                </div>
              </CollapsibleSection>

              {/* Execution Settings */}
              <CollapsibleSection
                title="Execution Settings"
                icon={<Sliders className="w-5 h-5 text-purple-500" />}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    label="Parallel Execution"
                    description="Run independent tasks simultaneously"
                    checked={customizations.parallelExecution}
                    onChange={(v) => updateCustomization('parallelExecution', v)}
                  />
                  <ToggleSwitch
                    label="Enable Caching"
                    description="Reuse results from similar previous queries"
                    checked={customizations.enableCaching}
                    onChange={(v) => updateCustomization('enableCaching', v)}
                  />
                  <ToggleSwitch
                    label="Verbose Output"
                    description="Show detailed reasoning and intermediate steps"
                    checked={customizations.verboseOutput}
                    onChange={(v) => updateCustomization('verboseOutput', v)}
                  />
                </div>
              </CollapsibleSection>

              {/* Additional Instructions */}
              <CollapsibleSection
                title="Additional Instructions"
                icon={<Brain className="w-5 h-5 text-teal-500" />}
                defaultOpen={false}
              >
                <textarea
                  value={customizations.additionalInstructions}
                  onChange={(e) => updateCustomization('additionalInstructions', e.target.value)}
                  placeholder="Add any specific instructions or context for this mission..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
              </CollapsibleSection>
            </div>

            {/* Footer with estimates */}
            <div className="flex-shrink-0 border-t border-slate-200">
              {/* Estimated impact */}
              <div className="px-6 py-3 bg-slate-50 flex items-center justify-between text-sm">
                <span className="text-slate-600">Estimated Impact:</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4 text-slate-400" />
                    ~{Math.round(estimatedTime)} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    ~${estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-4 flex items-center justify-between bg-white">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
                <button
                  onClick={handleLaunch}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium',
                    'bg-purple-600 text-white hover:bg-purple-700',
                    'transition-colors shadow-lg shadow-purple-200'
                  )}
                >
                  <Play className="w-4 h-4" />
                  Launch Mission
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TemplateCustomizer;
