'use client';

/**
 * VITAL Platform - ProgressiveAccordion Component
 *
 * Progressive disclosure accordion for autonomous mission output.
 * Organizes complex agent output into collapsible, scannable sections:
 * - Reasoning chain
 * - Tools used
 * - Sources found
 * - Artifacts generated
 * - Quality scores
 *
 * Supports auto-expansion for new content and manual collapse.
 *
 * Design System: VITAL Brand v6.0 (Purple Theme #9055E0)
 * Phase 3 Implementation - December 11, 2025
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  Brain,
  Wrench,
  Link2,
  FileText,
  BarChart3,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  content: React.ReactNode;
  defaultExpanded?: boolean;
  autoExpand?: boolean; // Auto-expand when new content arrives
  priority?: number; // Higher priority sections appear first
}

export interface ProgressiveAccordionProps {
  /** Array of accordion sections */
  sections: AccordionSection[];
  /** Allow multiple sections to be expanded */
  allowMultiple?: boolean;
  /** Auto-collapse other sections when one expands (only when allowMultiple=false) */
  autoCollapse?: boolean;
  /** Show expand/collapse all button */
  showExpandAll?: boolean;
  /** Animate section content */
  animated?: boolean;
  /** Compact mode (smaller padding) */
  compact?: boolean;
  /** Custom class names */
  className?: string;
  /** Callback when a section is toggled */
  onToggle?: (sectionId: string, isExpanded: boolean) => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  section: AccordionSection;
  isExpanded: boolean;
  onToggle: () => void;
  compact: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  isExpanded,
  onToggle,
  compact,
}) => (
  <button
    onClick={onToggle}
    className={cn(
      'w-full flex items-center justify-between transition-colors group',
      compact ? 'p-2' : 'p-3',
      isExpanded
        ? 'bg-purple-500/10 border-purple-500/30'
        : 'bg-neutral-800/50 hover:bg-neutral-800 border-transparent',
      'border-b rounded-t-lg'
    )}
  >
    <div className="flex items-center gap-2">
      <span className={cn(
        'transition-colors',
        isExpanded ? 'text-purple-400' : 'text-neutral-400 group-hover:text-purple-400'
      )}>
        {section.icon}
      </span>
      <span className={cn(
        'font-medium transition-colors',
        compact ? 'text-sm' : 'text-sm',
        isExpanded ? 'text-white' : 'text-neutral-300'
      )}>
        {section.title}
      </span>
      {section.badge !== undefined && (
        <span
          className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            section.badgeColor || 'bg-purple-500/20 text-purple-300'
          )}
        >
          {section.badge}
        </span>
      )}
    </div>

    <motion.div
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <ChevronDown
        className={cn(
          'w-4 h-4 transition-colors',
          isExpanded ? 'text-purple-400' : 'text-neutral-500 group-hover:text-neutral-300'
        )}
      />
    </motion.div>
  </button>
);

interface SectionContentProps {
  content: React.ReactNode;
  animated: boolean;
  compact: boolean;
}

const SectionContent: React.FC<SectionContentProps> = ({
  content,
  animated,
  compact,
}) => {
  if (animated) {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className={cn(
          'bg-neutral-900/50 border-x border-b border-neutral-700/50 rounded-b-lg',
          compact ? 'p-2' : 'p-3'
        )}>
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn(
      'bg-neutral-900/50 border-x border-b border-neutral-700/50 rounded-b-lg',
      compact ? 'p-2' : 'p-3'
    )}>
      {content}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ProgressiveAccordion: React.FC<ProgressiveAccordionProps> = ({
  sections,
  allowMultiple = true,
  autoCollapse = false,
  showExpandAll = true,
  animated = true,
  compact = false,
  className,
  onToggle,
}) => {
  // Track expanded sections
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach(s => {
      if (s.defaultExpanded) initial.add(s.id);
    });
    return initial;
  });

  // Track previous section content for auto-expand
  const prevSectionsRef = useRef<AccordionSection[]>(sections);

  // Auto-expand sections with new content
  useEffect(() => {
    const prevSections = prevSectionsRef.current;

    sections.forEach(section => {
      if (section.autoExpand) {
        const prevSection = prevSections.find(s => s.id === section.id);

        // If badge changed (new content), auto-expand
        if (prevSection && section.badge !== prevSection.badge) {
          setExpandedIds(prev => new Set(prev).add(section.id));
        }
      }
    });

    prevSectionsRef.current = sections;
  }, [sections]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      const isCurrentlyExpanded = next.has(sectionId);

      if (isCurrentlyExpanded) {
        next.delete(sectionId);
      } else {
        if (!allowMultiple && autoCollapse) {
          next.clear();
        }
        next.add(sectionId);
      }

      onToggle?.(sectionId, !isCurrentlyExpanded);
      return next;
    });
  }, [allowMultiple, autoCollapse, onToggle]);

  // Expand all sections
  const expandAll = useCallback(() => {
    setExpandedIds(new Set(sections.map(s => s.id)));
  }, [sections]);

  // Collapse all sections
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const allExpanded = expandedIds.size === sections.length;
  const anyExpanded = expandedIds.size > 0;

  // Sort sections by priority
  const sortedSections = [...sections].sort((a, b) =>
    (b.priority || 0) - (a.priority || 0)
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Expand/Collapse All */}
      {showExpandAll && sections.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {allExpanded ? (
              <>
                <EyeOff className="w-3 h-3" />
                Collapse All
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Expand All
              </>
            )}
          </button>
        </div>
      )}

      {/* Sections */}
      {sortedSections.map(section => {
        const isExpanded = expandedIds.has(section.id);

        return (
          <div key={section.id} className="rounded-lg overflow-hidden">
            <SectionHeader
              section={section}
              isExpanded={isExpanded}
              onToggle={() => toggleSection(section.id)}
              compact={compact}
            />

            <AnimatePresence mode="wait">
              {isExpanded && (
                <SectionContent
                  content={section.content}
                  animated={animated}
                  compact={compact}
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No content yet</p>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// PRE-BUILT SECTION HELPERS
// =============================================================================

/**
 * Create a reasoning section for the accordion
 */
export const createReasoningSection = (
  steps: Array<{ step: number; content: string }>,
  isActive: boolean = false
): AccordionSection => ({
  id: 'reasoning',
  title: 'Reasoning Chain',
  icon: <Brain className="w-4 h-4" />,
  badge: steps.length,
  badgeColor: isActive ? 'bg-purple-500/30 text-purple-300' : undefined,
  defaultExpanded: true,
  autoExpand: true,
  priority: 10,
  content: (
    <div className="space-y-2">
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="flex gap-3 p-2 bg-neutral-800/50 rounded-lg"
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center">
            {step.step}
          </span>
          <p className="text-sm text-neutral-300">{step.content}</p>
        </div>
      ))}
    </div>
  ),
});

/**
 * Create a tools section for the accordion
 */
export const createToolsSection = (
  tools: Array<{ name: string; status: 'pending' | 'active' | 'complete'; result?: string }>
): AccordionSection => ({
  id: 'tools',
  title: 'Tools Used',
  icon: <Wrench className="w-4 h-4" />,
  badge: tools.length,
  priority: 8,
  content: (
    <div className="space-y-2">
      {tools.map((tool, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg"
        >
          <span className="text-sm text-neutral-300">{tool.name}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded',
            tool.status === 'complete' ? 'bg-green-500/20 text-green-300' :
            tool.status === 'active' ? 'bg-purple-500/20 text-purple-300' :
            'bg-neutral-700 text-neutral-400'
          )}>
            {tool.status}
          </span>
        </div>
      ))}
    </div>
  ),
});

/**
 * Create a sources section for the accordion
 */
export const createSourcesSection = (
  sources: Array<{ title: string; url?: string; type: string }>
): AccordionSection => ({
  id: 'sources',
  title: 'Sources Found',
  icon: <Link2 className="w-4 h-4" />,
  badge: sources.length,
  badgeColor: sources.length > 0 ? 'bg-blue-500/20 text-blue-300' : undefined,
  autoExpand: true,
  priority: 6,
  content: (
    <div className="space-y-2">
      {sources.map((source, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-lg"
        >
          <Link2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-sm text-neutral-300 truncate flex-1">
            {source.title}
          </span>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Open
            </a>
          )}
        </div>
      ))}
    </div>
  ),
});

/**
 * Create an artifacts section for the accordion
 */
export const createArtifactsSection = (
  artifacts: Array<{ name: string; type: string; format?: string }>
): AccordionSection => ({
  id: 'artifacts',
  title: 'Generated Artifacts',
  icon: <FileText className="w-4 h-4" />,
  badge: artifacts.length,
  badgeColor: artifacts.length > 0 ? 'bg-green-500/20 text-green-300' : undefined,
  autoExpand: true,
  priority: 4,
  content: (
    <div className="grid grid-cols-2 gap-2">
      {artifacts.map((artifact, idx) => (
        <div
          key={idx}
          className="p-2 bg-neutral-800/50 rounded-lg"
        >
          <p className="text-sm font-medium text-green-300">{artifact.name}</p>
          <p className="text-xs text-neutral-400">{artifact.type}</p>
          {artifact.format && (
            <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-neutral-700 text-neutral-300 rounded">
              {artifact.format}
            </span>
          )}
        </div>
      ))}
    </div>
  ),
});

/**
 * Create a quality scores section for the accordion
 */
export const createQualitySection = (
  scores: Record<string, number>
): AccordionSection => ({
  id: 'quality',
  title: 'Quality Scores',
  icon: <BarChart3 className="w-4 h-4" />,
  badge: Object.keys(scores).length > 0 ? 'Available' : undefined,
  badgeColor: 'bg-amber-500/20 text-amber-300',
  priority: 2,
  content: (
    <div className="space-y-2">
      {Object.entries(scores).map(([metric, score]) => (
        <div key={metric} className="flex items-center justify-between">
          <span className="text-sm text-neutral-400 capitalize">{metric}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  score >= 0.8 ? 'bg-green-500' :
                  score >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${score * 100}%` }}
              />
            </div>
            <span className={cn(
              'text-xs font-medium w-10 text-right',
              score >= 0.8 ? 'text-green-400' :
              score >= 0.6 ? 'text-amber-400' : 'text-red-400'
            )}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
});

export default ProgressiveAccordion;
