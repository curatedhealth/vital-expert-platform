'use client';

/**
 * VITAL Platform - MissionTemplateSelector Component
 *
 * Gallery of mission templates for autonomous modes.
 * Allows filtering by category, complexity, and expert capabilities.
 *
 * Features:
 * - Grid layout with template cards
 * - Category filtering (research, analysis, report, review, synthesis)
 * - Complexity badges (simple, moderate, complex)
 * - Duration estimates
 * - Step preview on hover
 * - Keyboard navigation
 *
 * Design System: VITAL Brand v6.0 (Purple theme)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
  BarChart3,
  FileText,
  CheckSquare,
  Sparkles,
  Filter,
  X,
} from 'lucide-react';

import type { Expert } from '../interactive/ExpertPicker';
import type { MissionTemplate, MissionTask, MissionComplexity } from '../../types/mission-runners';
import { DEFAULT_MISSION_TEMPLATES } from '../../types/mission-runners';

// =============================================================================
// HELPERS - Bridge between canonical and display schemas
// =============================================================================

// Get tasks from template (canonical uses 'tasks', not 'steps')
function getTemplateTasks(template: MissionTemplate): MissionTask[] {
  return template.tasks || [];
}

// Format duration from canonical min/max to display string
function formatDuration(template: MissionTemplate): string {
  const min = template.estimatedDurationMin || 0;
  const max = template.estimatedDurationMax || min;
  if (min === max) return `${min} min`;
  return `${min}-${max} min`;
}

// Map canonical complexity to local display type
type DisplayComplexity = 'simple' | 'moderate' | 'complex';
function mapComplexityToDisplay(canonical: MissionComplexity): DisplayComplexity {
  const map: Record<MissionComplexity, DisplayComplexity> = {
    low: 'simple',
    medium: 'moderate',
    high: 'complex',
    critical: 'complex', // Map critical to complex for display
  };
  return map[canonical] || 'moderate';
}

// Check if template matches display complexity filter
function matchesComplexityFilter(template: MissionTemplate, filter: TemplateComplexity): boolean {
  if (filter === 'all') return true;
  return mapComplexityToDisplay(template.complexity) === filter;
}

// =============================================================================
// TYPES
// =============================================================================

export interface MissionTemplateSelectorProps {
  /** Selected expert (for filtering compatible templates) */
  expert: Expert | null;
  /** Available templates */
  templates?: MissionTemplate[];
  /** Called when a template is selected */
  onSelect: (template: MissionTemplate) => void;
  /** Called when back is clicked */
  onBack?: () => void;
  /** Custom class names */
  className?: string;
}

type TemplateCategory = 'all' | 'research' | 'analysis' | 'report' | 'review' | 'synthesis';
type TemplateComplexity = 'all' | 'simple' | 'moderate' | 'complex';

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; icon: typeof BookOpen; color: string }> = {
  all: { label: 'All Templates', icon: Layers, color: 'text-slate-600' },
  research: { label: 'Research', icon: BookOpen, color: 'text-blue-600' },
  analysis: { label: 'Analysis', icon: BarChart3, color: 'text-purple-600' },
  report: { label: 'Reports', icon: FileText, color: 'text-green-600' },
  review: { label: 'Reviews', icon: CheckSquare, color: 'text-amber-600' },
  synthesis: { label: 'Synthesis', icon: Sparkles, color: 'text-pink-600' },
};

const COMPLEXITY_CONFIG: Record<Exclude<TemplateComplexity, 'all'>, { label: string; color: string; bgColor: string }> = {
  simple: { label: 'Simple', color: 'text-green-700', bgColor: 'bg-green-100' },
  moderate: { label: 'Moderate', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  complex: { label: 'Complex', color: 'text-red-700', bgColor: 'bg-red-100' },
};

// Note: Uses DEFAULT_MISSION_TEMPLATES from mission-runners.ts as fallback
// The canonical templates use the new schema with tasks, estimatedDurationMin/Max, etc.

// =============================================================================
// COMPONENT
// =============================================================================

export function MissionTemplateSelector({
  expert,
  templates = DEFAULT_MISSION_TEMPLATES,
  onSelect,
  onBack,
  className,
}: MissionTemplateSelectorProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<TemplateComplexity>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // =========================================================================
  // FILTERED TEMPLATES
  // =========================================================================

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Category filter
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }

      // Complexity filter (uses helper to map canonical → display values)
      if (!matchesComplexityFilter(template, selectedComplexity)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesDescription = template.description.toLowerCase().includes(query);
        const matchesTags = (template.tags || []).some(tag => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [templates, selectedCategory, selectedComplexity, searchQuery]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleTemplateClick = useCallback((template: MissionTemplate) => {
    onSelect(template);
  }, [onSelect]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedComplexity('all');
  }, []);

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedComplexity !== 'all';

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-white">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 mb-4"
          >
            ← Back to expert selection
          </button>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Select Mission Template
            </h2>
            <p className="text-slate-600 mt-1">
              {expert
                ? `Choose a mission type for ${expert.name}`
                : 'Choose the type of autonomous task to run'}
            </p>
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>

        {/* Search and Filters */}
        <div className={cn(
          'mt-4 space-y-4',
          !showFilters && 'hidden md:block'
        )}>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_CONFIG) as TemplateCategory[]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Complexity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Complexity:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedComplexity('all')}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium transition-all',
                  selectedComplexity === 'all'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                All
              </button>
              {(Object.keys(COMPLEXITY_CONFIG) as Exclude<TemplateComplexity, 'all'>[]).map((complexity) => {
                const config = COMPLEXITY_CONFIG[complexity];
                return (
                  <button
                    key={complexity}
                    onClick={() => setSelectedComplexity(complexity)}
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium transition-all',
                      selectedComplexity === complexity
                        ? `${config.bgColor} ${config.color}`
                        : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No templates found</h3>
            <p className="text-slate-600 mt-1">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isHovered={hoveredTemplate === template.id}
                onHover={() => setHoveredTemplate(template.id)}
                onLeave={() => setHoveredTemplate(null)}
                onClick={() => handleTemplateClick(template)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TemplateCardProps {
  template: MissionTemplate;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function TemplateCard({ template, isHovered, onHover, onLeave, onClick }: TemplateCardProps) {
  // Map canonical complexity to display type, then get config
  const displayComplexity = mapComplexityToDisplay(template.complexity);
  const complexityConfig = COMPLEXITY_CONFIG[displayComplexity];
  const categoryConfig = CATEGORY_CONFIG[template.category];
  const CategoryIcon = categoryConfig.icon;

  // Get tasks using helper (canonical uses 'tasks' not 'steps')
  const tasks = getTemplateTasks(template);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all w-full',
        'hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10',
        'border-slate-200 bg-white',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{template.description}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge variant="outline" className="text-xs gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(template)}
        </Badge>
        <Badge className={cn('text-xs', complexityConfig.bgColor, complexityConfig.color)}>
          {complexityConfig.label}
        </Badge>
        <Badge variant="outline" className={cn('text-xs gap-1', categoryConfig.color)}>
          <CategoryIcon className="w-3 h-3" />
          {categoryConfig.label}
        </Badge>
      </div>

      {/* Tasks Preview (on hover) */}
      <AnimatePresence>
        {isHovered && tasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}:
              </p>
              <div className="space-y-1">
                {tasks.slice(0, 3).map((task, index) => (
                  <div key={task.id || index} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-medium">
                      {index + 1}
                    </span>
                    <span className="truncate">{task.name}</span>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-xs text-slate-400 pl-6">
                    +{tasks.length - 3} more {tasks.length - 3 === 1 ? 'task' : 'tasks'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select Arrow */}
      <div className="flex items-center justify-end mt-3 text-purple-600">
        <span className="text-sm font-medium">Select</span>
        <ChevronRight className={cn(
          'w-4 h-4 transition-transform',
          isHovered && 'translate-x-1'
        )} />
      </div>
    </motion.button>
  );
}

export default MissionTemplateSelector;
