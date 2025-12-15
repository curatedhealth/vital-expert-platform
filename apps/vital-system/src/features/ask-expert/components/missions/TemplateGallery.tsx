'use client';

import React from 'react';

/**
 * VITAL Platform - Mission Template Gallery
 *
 * Displays a filterable, searchable gallery of mission templates.
 * Supports category tabs, complexity filters, and grid/list views.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid3X3,
  List,
  Filter,
  X,
  ChevronDown,
  Clock,
  DollarSign,
  Sparkles,
  FlaskConical,
  BarChart3,
  Target,
  FileEdit,
  Eye,
  Lightbulb,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateCard } from './TemplateCard';
import type { TemplateCardData } from './TemplateCard';
import {
  type MissionFamily,
  type MissionComplexity,
  FAMILY_COLORS,
  COMPLEXITY_BADGES,
} from '../../types/mission-runners';

// =============================================================================
// TYPES
// =============================================================================

export interface TemplateGalleryProps {
  /** List of templates to display */
  templates: TemplateCardData[];
  /** Called when user selects a template */
  onSelect: (templateId: string) => void;
  /** Called when user wants to preview a template */
  onPreview?: (templateId: string) => void;
  /** Currently selected template ID */
  selectedTemplateId?: string;
  /** Whether to show search bar */
  showSearch?: boolean;
  /** Whether to show category tabs */
  showCategories?: boolean;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Initial view mode */
  initialViewMode?: 'grid' | 'list';
  /** Custom class names */
  className?: string;
}

interface FilterState {
  families: MissionFamily[];
  complexities: MissionComplexity[];
  maxDuration: number | null;
  maxCost: number | null;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FAMILY_TABS: { family: MissionFamily; label: string; icon: LucideIcon }[] = [
  { family: 'DEEP_RESEARCH', label: 'Research', icon: FlaskConical },
  { family: 'EVALUATION', label: 'Evaluation', icon: BarChart3 },
  { family: 'INVESTIGATION', label: 'Investigation', icon: Search },
  { family: 'STRATEGY', label: 'Strategy', icon: Target },
  { family: 'PREPARATION', label: 'Preparation', icon: FileEdit },
  { family: 'MONITORING', label: 'Monitoring', icon: Eye },
  { family: 'PROBLEM_SOLVING', label: 'Problem Solving', icon: Lightbulb },
  { family: 'GENERIC', label: 'General', icon: Settings },
];

const COMPLEXITY_OPTIONS: MissionComplexity[] = ['low', 'medium', 'high', 'critical'];

// =============================================================================
// COMPONENT
// =============================================================================

export function TemplateGallery({
  templates,
  onSelect,
  onPreview,
  selectedTemplateId,
  showSearch = true,
  showCategories = true,
  showFilters = true,
  initialViewMode = 'grid',
  className,
}: TemplateGalleryProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamily, setActiveFamily] = useState<MissionFamily | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    families: [],
    complexities: [],
    maxDuration: null,
    maxCost: null,
  });

  // Get unique families from templates
  const availableFamilies = useMemo(() => {
    const families = new Set(templates.map((t) => t.family));
    return FAMILY_TABS.filter((tab) => families.has(tab.family));
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Family tab filter
    if (activeFamily !== 'all') {
      result = result.filter((t) => t.family === activeFamily);
    }

    // Advanced filters
    if (filters.families.length > 0) {
      result = result.filter((t) => filters.families.includes(t.family));
    }

    if (filters.complexities.length > 0) {
      result = result.filter((t) => filters.complexities.includes(t.complexity));
    }

    if (filters.maxDuration !== null) {
      result = result.filter((t) => t.estimatedDurationMax <= filters.maxDuration!);
    }

    if (filters.maxCost !== null) {
      result = result.filter((t) => t.estimatedCostMax <= filters.maxCost!);
    }

    // Sort by popularity, then name
    result.sort((a, b) => {
      if (a.popularityScore !== undefined && b.popularityScore !== undefined) {
        return b.popularityScore - a.popularityScore;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [templates, searchQuery, activeFamily, filters]);

  // Handlers
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      families: [],
      complexities: [],
      maxDuration: null,
      maxCost: null,
    });
  }, []);

  const toggleComplexityFilter = useCallback((complexity: MissionComplexity) => {
    setFilters((prev) => ({
      ...prev,
      complexities: prev.complexities.includes(complexity)
        ? prev.complexities.filter((c) => c !== complexity)
        : [...prev.complexities, complexity],
    }));
  }, []);

  const hasActiveFilters =
    filters.families.length > 0 ||
    filters.complexities.length > 0 ||
    filters.maxDuration !== null ||
    filters.maxCost !== null;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 space-y-4 pb-4">
        {/* Title and view toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Mission Templates
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose a template to start your mission
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter button */}
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  showFilterPanel || hasActiveFilters
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                    {filters.complexities.length + (filters.maxDuration !== null ? 1 : 0) + (filters.maxCost !== null ? 1 : 0)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, description, or tag..."
              className={cn(
                'w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg',
                'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                'placeholder:text-slate-400'
              )}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Category tabs */}
        {showCategories && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFamily('all')}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeFamily === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All ({templates.length})
            </button>
            {availableFamilies.map((tab) => {
              const count = templates.filter((t) => t.family === tab.family).length;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.family}
                  onClick={() => setActiveFamily(tab.family)}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    activeFamily === tab.family
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Filter panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Advanced Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Complexity filter */}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Complexity
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COMPLEXITY_OPTIONS.map((complexity) => {
                      const style = COMPLEXITY_BADGES[complexity];
                      const isActive = filters.complexities.includes(complexity);
                      return (
                        <button
                          key={complexity}
                          onClick={() => toggleComplexityFilter(complexity)}
                          className={cn(
                            'px-3 py-1 text-sm font-medium rounded-lg border-2 transition-all',
                            isActive
                              ? `${style.bg} ${style.text} border-current`
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          {complexity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration filter */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Max Duration
                    </label>
                    <select
                      value={filters.maxDuration ?? ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxDuration: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">Any</option>
                      <option value="30">30 min</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Max Cost
                    </label>
                    <select
                      value={filters.maxCost ?? ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxCost: e.target.value ? parseFloat(e.target.value) : null,
                        }))
                      }
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">Any</option>
                      <option value="2">$2</option>
                      <option value="5">$5</option>
                      <option value="10">$10</option>
                      <option value="25">$25</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template grid/list */}
      <div className="flex-1 overflow-auto">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">No templates match your criteria</p>
            <button
              onClick={() => {
                handleClearSearch();
                handleClearFilters();
                setActiveFamily('all');
              }}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-2'
            )}
          >
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onSelect}
                onPreview={onPreview}
                isSelected={template.id === selectedTemplateId}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex-shrink-0 pt-4 border-t border-slate-100 text-sm text-slate-500 text-center">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>
  );
}

export default TemplateGallery;
