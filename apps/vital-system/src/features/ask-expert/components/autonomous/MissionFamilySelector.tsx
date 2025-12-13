'use client';

/**
 * VITAL Platform - MissionFamilySelector Component
 *
 * Entry point for Mode 3 (Deep Research) - Select mission family first
 * Instead of selecting agents, users pick a mission type/family.
 *
 * 8 Mission Families:
 * - DEEP_RESEARCH: Comprehensive research missions
 * - EVALUATION: Assessment and benchmarking
 * - INVESTIGATION: Due diligence, forensics
 * - STRATEGY: Strategic planning and decisions
 * - PREPARATION: Case building, document prep
 * - MONITORING: Ongoing surveillance
 * - PROBLEM_SOLVING: Finding alternatives, solutions
 * - GENERIC: Fallback for unmatched queries
 *
 * Design System: VITAL Brand v6.0 (Purple theme)
 * Phase 3 Implementation - December 13, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  BookOpen,
  BarChart3,
  FileSearch2,
  Lightbulb,
  FileText,
  Eye,
  Wrench,
  HelpCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Sparkles,
  Target,
} from 'lucide-react';

import type { MissionFamily, MissionTemplate } from '../../types/mission-runners';
import { DEFAULT_MISSION_TEMPLATES, FAMILY_COLORS } from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface MissionFamilyConfig {
  family: MissionFamily;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  templateCount: number;
  estimatedDuration: string;
  useCases: string[];
}

export interface MissionFamilySelectorProps {
  /** Called when a family is selected */
  onSelectFamily: (family: MissionFamily) => void;
  /** Called when a specific template is selected (optional shortcut) */
  onSelectTemplate?: (template: MissionTemplate) => void;
  /** Current research goal (optional, for context) */
  researchGoal?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MISSION_FAMILY_CONFIG: Record<MissionFamily, Omit<MissionFamilyConfig, 'family' | 'templateCount'>> = {
  DEEP_RESEARCH: {
    name: 'Deep Research',
    description: 'Comprehensive multi-source research with evidence synthesis and cross-referencing',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-purple-600',
    bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    estimatedDuration: '45-180 min',
    useCases: ['Literature reviews', 'Market analysis', 'Scientific deep dives'],
  },
  EVALUATION: {
    name: 'Evaluation',
    description: 'Assessment, benchmarking, and quality analysis with structured criteria',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-purple-600',
    bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    estimatedDuration: '20-120 min',
    useCases: ['Competitive benchmarking', 'Feasibility studies', 'Quality reviews'],
  },
  INVESTIGATION: {
    name: 'Investigation',
    description: 'Due diligence, root cause analysis, and forensic investigation',
    icon: <FileSearch2 className="w-6 h-6" />,
    color: 'text-red-600',
    bgGradient: 'bg-gradient-to-br from-red-500 to-red-700',
    estimatedDuration: '45-240 min',
    useCases: ['Due diligence', 'Failure analysis', 'Compliance investigation'],
  },
  STRATEGY: {
    name: 'Strategy',
    description: 'Strategic planning, decision framing, and scenario analysis',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'text-amber-600',
    bgGradient: 'bg-gradient-to-br from-amber-500 to-amber-700',
    estimatedDuration: '30-120 min',
    useCases: ['Decision making', 'Scenario planning', 'Risk assessment'],
  },
  PREPARATION: {
    name: 'Preparation',
    description: 'Document drafting, case building, and presentation creation',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgGradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    estimatedDuration: '25-80 min',
    useCases: ['Case building', 'Document drafting', 'Presentation creation'],
  },
  MONITORING: {
    name: 'Monitoring',
    description: 'Continuous intelligence monitoring and alert generation',
    icon: <Eye className="w-6 h-6" />,
    color: 'text-cyan-600',
    bgGradient: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    estimatedDuration: '20-50 min',
    useCases: ['Competitive watch', 'Regulatory monitoring', 'Trend tracking'],
  },
  PROBLEM_SOLVING: {
    name: 'Problem Solving',
    description: 'Finding alternatives, gap analysis, and solution identification',
    icon: <Wrench className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    estimatedDuration: '25-60 min',
    useCases: ['Alternative finding', 'Gap analysis', 'Solution design'],
  },
  GENERIC: {
    name: 'Quick Query',
    description: 'Fast answers to specific questions without deep analysis',
    icon: <HelpCircle className="w-6 h-6" />,
    color: 'text-slate-600',
    bgGradient: 'bg-gradient-to-br from-slate-500 to-slate-700',
    estimatedDuration: '5-30 min',
    useCases: ['Quick answers', 'General queries', 'Simple lookups'],
  },
};

// Order families by most commonly used
const FAMILY_ORDER: MissionFamily[] = [
  'DEEP_RESEARCH',
  'EVALUATION',
  'STRATEGY',
  'INVESTIGATION',
  'PREPARATION',
  'PROBLEM_SOLVING',
  'MONITORING',
  'GENERIC',
];

// =============================================================================
// COMPONENT
// =============================================================================

export function MissionFamilySelector({
  onSelectFamily,
  onSelectTemplate,
  researchGoal,
  className,
}: MissionFamilySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFamily, setHoveredFamily] = useState<MissionFamily | null>(null);

  // Calculate template counts per family
  const familyTemplates = useMemo(() => {
    const counts: Record<MissionFamily, number> = {
      DEEP_RESEARCH: 0,
      EVALUATION: 0,
      INVESTIGATION: 0,
      STRATEGY: 0,
      PREPARATION: 0,
      MONITORING: 0,
      PROBLEM_SOLVING: 0,
      GENERIC: 0,
    };

    DEFAULT_MISSION_TEMPLATES.forEach((template) => {
      if (template.family) {
        counts[template.family]++;
      }
    });

    return counts;
  }, []);

  // Filter families based on search
  const filteredFamilies = useMemo(() => {
    if (!searchQuery) return FAMILY_ORDER;

    const query = searchQuery.toLowerCase();
    return FAMILY_ORDER.filter((family) => {
      const config = MISSION_FAMILY_CONFIG[family];
      return (
        config.name.toLowerCase().includes(query) ||
        config.description.toLowerCase().includes(query) ||
        config.useCases.some(uc => uc.toLowerCase().includes(query))
      );
    });
  }, [searchQuery]);

  const handleFamilyClick = useCallback((family: MissionFamily) => {
    onSelectFamily(family);
  }, [onSelectFamily]);

  // Get suggested family based on research goal (simple keyword matching)
  const suggestedFamily = useMemo((): MissionFamily | null => {
    if (!researchGoal) return null;

    const goal = researchGoal.toLowerCase();

    if (goal.includes('research') || goal.includes('literature') || goal.includes('review')) {
      return 'DEEP_RESEARCH';
    }
    if (goal.includes('benchmark') || goal.includes('compare') || goal.includes('evaluate')) {
      return 'EVALUATION';
    }
    if (goal.includes('investigate') || goal.includes('due diligence') || goal.includes('failure')) {
      return 'INVESTIGATION';
    }
    if (goal.includes('strategy') || goal.includes('decision') || goal.includes('plan')) {
      return 'STRATEGY';
    }
    if (goal.includes('prepare') || goal.includes('document') || goal.includes('presentation')) {
      return 'PREPARATION';
    }
    if (goal.includes('monitor') || goal.includes('watch') || goal.includes('track')) {
      return 'MONITORING';
    }
    if (goal.includes('solve') || goal.includes('alternative') || goal.includes('gap')) {
      return 'PROBLEM_SOLVING';
    }

    return null;
  }, [researchGoal]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Select Your Mission Type
            </h2>
            <p className="text-slate-600 mt-1">
              Choose the type of research mission you want to run
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search mission types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Research Goal Context (if provided) */}
        {researchGoal && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-700">
              <span className="font-medium">Your goal:</span> {researchGoal}
            </p>
            {suggestedFamily && (
              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Suggested: <span className="font-medium">{MISSION_FAMILY_CONFIG[suggestedFamily].name}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mission Family Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredFamilies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No mission types found</h3>
            <p className="text-slate-600 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFamilies.map((family) => {
              const config = MISSION_FAMILY_CONFIG[family];
              const templateCount = familyTemplates[family];
              const isHovered = hoveredFamily === family;
              const isSuggested = suggestedFamily === family;

              return (
                <motion.button
                  key={family}
                  onClick={() => handleFamilyClick(family)}
                  onMouseEnter={() => setHoveredFamily(family)}
                  onMouseLeave={() => setHoveredFamily(null)}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative p-5 rounded-xl border-2 text-left transition-all',
                    'hover:shadow-lg',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                    isSuggested
                      ? 'border-purple-400 bg-purple-50/50 ring-2 ring-purple-200'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  )}
                >
                  {/* Suggested Badge */}
                  {isSuggested && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5">
                        Suggested
                      </Badge>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3',
                    config.bgGradient
                  )}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-slate-900 mb-1">{config.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {config.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {config.estimatedDuration}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {templateCount} template{templateCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Use Cases (on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-xs font-medium text-slate-500 mb-2">Common use cases:</p>
                          <div className="flex flex-wrap gap-1">
                            {config.useCases.map((useCase, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                              >
                                {useCase}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Select Arrow */}
                  <div className="flex items-center justify-end mt-2 text-purple-600">
                    <span className="text-sm font-medium">Select</span>
                    <ChevronRight className={cn(
                      'w-4 h-4 transition-transform',
                      isHovered && 'translate-x-1'
                    )} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MissionFamilySelector;
