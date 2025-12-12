'use client';

/**
 * VITAL Platform - Mission Template Preview
 *
 * Displays a detailed preview of a mission template before selection.
 * Shows full description, expected inputs/outputs, time estimates,
 * agent requirements, example queries, and one-click launch.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  DollarSign,
  Users,
  Zap,
  FileText,
  MessageSquare,
  Target,
  ChevronRight,
  Play,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  ArrowRight,
  Sparkles,
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

export interface TemplatePreviewData {
  id: string;
  name: string;
  family: MissionFamily;
  category: string;
  description: string;
  longDescription?: string;
  complexity: MissionComplexity;
  estimatedDurationMin: number;
  estimatedDurationMax: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  tags: string[];
  minAgents?: number;
  maxAgents?: number;
  exampleQueries?: string[];
  expectedInputs?: ExpectedInput[];
  expectedOutputs?: ExpectedOutput[];
  prerequisites?: string[];
  limitations?: string[];
  bestPractices?: string[];
}

export interface ExpectedInput {
  name: string;
  type: 'text' | 'file' | 'url' | 'selection';
  description: string;
  required: boolean;
  example?: string;
}

export interface ExpectedOutput {
  name: string;
  type: 'report' | 'analysis' | 'summary' | 'data' | 'recommendation';
  description: string;
  format?: string;
}

export interface TemplatePreviewProps {
  /** Template data to preview */
  template: TemplatePreviewData | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when user closes the preview */
  onClose: () => void;
  /** Called when user wants to use this template */
  onUseTemplate: (templateId: string) => void;
  /** Called when user wants to customize the template */
  onCustomize?: (templateId: string) => void;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(min: number, max: number): string {
  if (min === max) {
    return min < 60 ? `${min} minutes` : `${Math.round(min / 60)} hour${Math.round(min / 60) !== 1 ? 's' : ''}`;
  }
  const minStr = min < 60 ? `${min}min` : `${Math.round(min / 60)}h`;
  const maxStr = max < 60 ? `${max}min` : `${Math.round(max / 60)}h`;
  return `${minStr} - ${maxStr}`;
}

function formatCost(min: number, max: number): string {
  if (min === max) {
    return `$${min.toFixed(2)}`;
  }
  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
}

function getFamilyIcon(family: MissionFamily): string {
  const icons: Record<MissionFamily, string> = {
    DEEP_RESEARCH: '🔬',
    EVALUATION: '📊',
    INVESTIGATION: '🔍',
    STRATEGY: '🎯',
    PREPARATION: '📝',
    MONITORING: '👁️',
    PROBLEM_SOLVING: '💡',
    GENERIC: '⚙️',
  };
  return icons[family] || icons.GENERIC;
}

function getFamilyLabel(family: MissionFamily): string {
  const labels: Record<MissionFamily, string> = {
    DEEP_RESEARCH: 'Deep Research',
    EVALUATION: 'Evaluation',
    INVESTIGATION: 'Investigation',
    STRATEGY: 'Strategy',
    PREPARATION: 'Preparation',
    MONITORING: 'Monitoring',
    PROBLEM_SOLVING: 'Problem Solving',
    GENERIC: 'General',
  };
  return labels[family] || family;
}

function getOutputIcon(type: ExpectedOutput['type']): React.ReactNode {
  const icons = {
    report: <FileText className="w-4 h-4" />,
    analysis: <Target className="w-4 h-4" />,
    summary: <MessageSquare className="w-4 h-4" />,
    data: <Zap className="w-4 h-4" />,
    recommendation: <Lightbulb className="w-4 h-4" />,
  };
  return icons[type] || <FileText className="w-4 h-4" />;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TemplatePreview({
  template,
  isOpen,
  onClose,
  onUseTemplate,
  onCustomize,
  className,
}: TemplatePreviewProps) {
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  const handleCopyQuery = useCallback((query: string) => {
    navigator.clipboard.writeText(query);
    setCopiedQuery(query);
    setTimeout(() => setCopiedQuery(null), 2000);
  }, []);

  const handleUseTemplate = useCallback(() => {
    if (template) {
      onUseTemplate(template.id);
    }
  }, [template, onUseTemplate]);

  const handleCustomize = useCallback(() => {
    if (template && onCustomize) {
      onCustomize(template.id);
    }
  }, [template, onCustomize]);

  if (!template) return null;

  const complexityStyle = COMPLEXITY_BADGES[template.complexity];
  const familyColor = FAMILY_COLORS[template.family];

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed inset-4 md:inset-8 lg:inset-16 z-50',
              'bg-white rounded-2xl shadow-2xl overflow-hidden',
              'flex flex-col',
              className
            )}
          >
            {/* Header with gradient */}
            <div className={cn('relative', familyColor)}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="relative px-6 py-5 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getFamilyIcon(template.family)}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{template.name}</h2>
                      <p className="text-white/80 text-sm mt-0.5">
                        {getFamilyLabel(template.family)} • {template.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick stats bar */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
                  <span className={cn('px-2.5 py-1 text-sm font-medium rounded', complexityStyle.bg, complexityStyle.text)}>
                    {template.complexity}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/90">
                    <Clock className="w-4 h-4" />
                    {formatDuration(template.estimatedDurationMin, template.estimatedDurationMax)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/90">
                    <DollarSign className="w-4 h-4" />
                    {formatCost(template.estimatedCostMin, template.estimatedCostMax)}
                  </span>
                  {template.minAgents !== undefined && (
                    <span className="flex items-center gap-1.5 text-sm text-white/90">
                      <Users className="w-4 h-4" />
                      {template.minAgents === template.maxAgents
                        ? `${template.minAgents} agent${template.minAgents !== 1 ? 's' : ''}`
                        : `${template.minAgents}-${template.maxAgents} agents`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Description */}
                <section>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-purple-500" />
                    About this Template
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {template.longDescription || template.description}
                  </p>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs bg-purple-50 text-purple-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {/* Expected Inputs */}
                {template.expectedInputs && template.expectedInputs.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                      What You'll Provide
                    </h3>
                    <div className="space-y-3">
                      {template.expectedInputs.map((input, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{input.name}</span>
                              {input.required && (
                                <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded font-medium">
                                  Required
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded">
                                {input.type}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{input.description}</p>
                            {input.example && (
                              <p className="text-xs text-slate-400 mt-1 italic">
                                Example: {input.example}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Expected Outputs */}
                {template.expectedOutputs && template.expectedOutputs.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      What You'll Receive
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {template.expectedOutputs.map((output, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            {getOutputIcon(output.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-900">{output.name}</span>
                            <p className="text-sm text-slate-600 mt-0.5">{output.description}</p>
                            {output.format && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded">
                                Format: {output.format}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Example Queries */}
                {template.exampleQueries && template.exampleQueries.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-500" />
                      Example Prompts
                    </h3>
                    <div className="space-y-2">
                      {template.exampleQueries.map((query, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100 hover:bg-amber-50 transition-colors"
                        >
                          <span className="flex-1 text-sm text-slate-700">{query}</span>
                          <button
                            onClick={() => handleCopyQuery(query)}
                            className="flex-shrink-0 p-1.5 rounded hover:bg-amber-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy to clipboard"
                          >
                            {copiedQuery === query ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Prerequisites */}
                {template.prerequisites && template.prerequisites.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Prerequisites
                    </h3>
                    <ul className="space-y-2">
                      {template.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <ChevronRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Best Practices */}
                {template.bestPractices && template.bestPractices.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Best Practices
                    </h3>
                    <ul className="space-y-2">
                      {template.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Limitations */}
                {template.limitations && template.limitations.length > 0 && (
                  <section className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-400" />
                      Limitations
                    </h3>
                    <ul className="space-y-1">
                      {template.limitations.map((limitation, index) => (
                        <li key={index} className="text-sm text-slate-500 flex items-start gap-2">
                          <span className="text-slate-300">•</span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <p className="text-sm text-slate-500">
                  Ready to start? Choose an option below.
                </p>
                <div className="flex items-center gap-3">
                  {onCustomize && (
                    <button
                      onClick={handleCustomize}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                        'border border-purple-200 text-purple-700 hover:bg-purple-50',
                        'transition-colors'
                      )}
                    >
                      <Zap className="w-4 h-4" />
                      Customize First
                    </button>
                  )}
                  <button
                    onClick={handleUseTemplate}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium',
                      'bg-purple-600 text-white hover:bg-purple-700',
                      'transition-colors shadow-lg shadow-purple-200'
                    )}
                  >
                    <Play className="w-4 h-4" />
                    Use This Template
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

export default TemplatePreview;
