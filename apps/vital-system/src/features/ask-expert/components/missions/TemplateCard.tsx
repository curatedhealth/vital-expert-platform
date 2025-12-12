'use client';

/**
 * VITAL Platform - Mission Template Card
 *
 * Displays a single mission template in the gallery with rich metadata.
 * Shows complexity, duration, cost estimates, and quick actions.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  DollarSign,
  Zap,
  ChevronRight,
  Star,
  Info,
  Users,
  Play,
  FlaskConical,
  BarChart3,
  Search,
  Target,
  FileEdit,
  Eye,
  Lightbulb,
  Settings,
  type LucideIcon,
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

export interface TemplateCardData {
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
  popularityScore?: number;
  minAgents?: number;
  maxAgents?: number;
  exampleQueries?: string[];
}

export interface TemplateCardProps {
  /** Template data */
  template: TemplateCardData;
  /** Called when user selects this template */
  onSelect: (templateId: string) => void;
  /** Called when user wants to preview this template */
  onPreview?: (templateId: string) => void;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDuration(min: number, max: number): string {
  if (min === max) {
    return min < 60 ? `${min}m` : `${Math.round(min / 60)}h`;
  }
  const minStr = min < 60 ? `${min}m` : `${Math.round(min / 60)}h`;
  const maxStr = max < 60 ? `${max}m` : `${Math.round(max / 60)}h`;
  return `${minStr}-${maxStr}`;
}

function formatCost(min: number, max: number): string {
  if (min === max) {
    return `$${min.toFixed(2)}`;
  }
  return `$${min.toFixed(2)}-$${max.toFixed(2)}`;
}

// =============================================================================
// MISSION FAMILY ICONS - Lucide React components only (no emojis)
// =============================================================================

const FAMILY_ICONS: Record<MissionFamily, LucideIcon> = {
  DEEP_RESEARCH: FlaskConical,
  EVALUATION: BarChart3,
  INVESTIGATION: Search,
  STRATEGY: Target,
  PREPARATION: FileEdit,
  MONITORING: Eye,
  PROBLEM_SOLVING: Lightbulb,
  GENERIC: Settings,
};

function getFamilyIcon(family: MissionFamily): LucideIcon {
  return FAMILY_ICONS[family] || FAMILY_ICONS.GENERIC;
}

function getFamilyLabel(family: MissionFamily): string {
  const labels: Record<MissionFamily, string> = {
    DEEP_RESEARCH: 'Research',
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

// =============================================================================
// COMPONENT
// =============================================================================

export function TemplateCard({
  template,
  onSelect,
  onPreview,
  isSelected = false,
  compact = false,
  className,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const complexityStyle = COMPLEXITY_BADGES[template.complexity];
  const familyColor = FAMILY_COLORS[template.family];

  const handleSelect = useCallback(() => {
    onSelect(template.id);
  }, [template.id, onSelect]);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template.id);
  }, [template.id, onPreview]);

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
          isSelected
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50',
          className
        )}
      >
        {/* Icon */}
        {(() => {
          const FamilyIcon = getFamilyIcon(template.family);
          return <FamilyIcon className={cn('w-6 h-6', familyColor)} />;
        })()}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">
              {template.name}
            </span>
            <span className={cn('px-1.5 py-0.5 text-xs rounded', complexityStyle.bg, complexityStyle.text)}>
              {template.complexity}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">
            {template.description}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(template.estimatedDurationMin, template.estimatedDurationMax)}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {formatCost(template.estimatedCostMin, template.estimatedCostMax)}
          </span>
        </div>

        <ChevronRight className={cn(
          'w-5 h-5 text-slate-300 transition-colors',
          isHovered && 'text-purple-500'
        )} />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px -10px rgba(0,0,0,0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-xl border cursor-pointer transition-all',
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-200'
          : 'border-slate-200 hover:border-purple-300',
        className
      )}
    >
      {/* Gradient header */}
      <div className={cn('h-2', familyColor)} />

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {(() => {
              const FamilyIcon = getFamilyIcon(template.family);
              return <FamilyIcon className={cn('w-6 h-6', familyColor)} />;
            })()}
            <div>
              <h3 className="font-semibold text-slate-900">{template.name}</h3>
              <span className="text-xs text-slate-500">{getFamilyLabel(template.family)}</span>
            </div>
          </div>

          {/* Popularity indicator */}
          {template.popularityScore !== undefined && template.popularityScore > 80 && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-xs font-medium">Popular</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={cn('px-2 py-1 text-xs font-medium rounded', complexityStyle.bg, complexityStyle.text)}>
            {template.complexity}
          </span>

          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
            <Clock className="w-3 h-3" />
            {formatDuration(template.estimatedDurationMin, template.estimatedDurationMax)}
          </span>

          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
            <DollarSign className="w-3 h-3" />
            {formatCost(template.estimatedCostMin, template.estimatedCostMax)}
          </span>

          {template.minAgents !== undefined && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
              <Users className="w-3 h-3" />
              {template.minAgents === template.maxAgents
                ? `${template.minAgents} agent${template.minAgents !== 1 ? 's' : ''}`
                : `${template.minAgents}-${template.maxAgents} agents`}
            </span>
          )}
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">
                +{template.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {onPreview && (
            <button
              onClick={handlePreview}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              Preview
            </button>
          )}

          <button
            onClick={handleSelect}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              'bg-purple-600 text-white hover:bg-purple-700',
              'group-hover:scale-105'
            )}
          >
            <Play className="w-4 h-4" />
            Use Template
          </button>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TemplateCard;
