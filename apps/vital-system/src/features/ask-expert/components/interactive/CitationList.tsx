'use client';

/**
 * VITAL Platform - CitationList Component
 *
 * Displays citations from AI responses with hover previews.
 * Supports both inline (streaming) and block (completed) display modes.
 *
 * Features:
 * - Citation badges with source type icons
 * - Hover preview showing excerpt and metadata
 * - Animated entry during streaming
 * - Expandable full citation list
 * - External link handling with safety
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  FileText,
  Globe,
  Database,
  ExternalLink,
  ChevronDown,
  Link2,
  GraduationCap,
  Building2,
  Newspaper,
  Quote,
} from 'lucide-react';

// Note: CitationEvent type from useSSEStream has different source/type values
// than our UI Citation interface which includes 'journal', 'guideline', 'internal'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Citation interface for UI display.
 * Note: This is intentionally NOT extending CitationEvent because
 * the type values differ (UI includes 'journal'/'guideline'/'internal' vs SSE has different source types)
 * and we need different optional/required field semantics.
 */
export interface Citation {
  id: string;
  title: string;
  source?: string;
  url?: string;
  excerpt?: string;
  authors?: string[];
  year?: number;
  type?: 'pubmed' | 'web' | 'document' | 'database' | 'journal' | 'guideline' | 'internal';
  confidence?: number;
  pageNumber?: number;
  // Optional fields from CitationEvent for compatibility
  index?: number;
  metadata?: Record<string, unknown>;
}

export interface CitationListProps {
  /** Citations to display */
  citations: Citation[];
  /** Display mode - inline shows compact badges, block shows full list */
  inline?: boolean;
  /** Whether currently streaming (enables animations) */
  isStreaming?: boolean;
  /** Maximum citations to show before "show more" */
  maxVisible?: number;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// SOURCE TYPE CONFIG
// =============================================================================

const SOURCE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pubmed: { icon: GraduationCap, color: 'text-emerald-700', bgColor: 'bg-emerald-50', label: 'PubMed' },
  journal: { icon: BookOpen, color: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Journal' },
  guideline: { icon: Building2, color: 'text-purple-700', bgColor: 'bg-purple-50', label: 'Guideline' },
  web: { icon: Globe, color: 'text-amber-700', bgColor: 'bg-amber-50', label: 'Web' },
  document: { icon: FileText, color: 'text-slate-700', bgColor: 'bg-slate-50', label: 'Document' },
  database: { icon: Database, color: 'text-cyan-700', bgColor: 'bg-cyan-50', label: 'Database' },
  internal: { icon: Link2, color: 'text-rose-700', bgColor: 'bg-rose-50', label: 'Internal' },
  news: { icon: Newspaper, color: 'text-orange-700', bgColor: 'bg-orange-50', label: 'News' },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function CitationList({
  citations,
  inline = false,
  isStreaming = false,
  maxVisible = 5,
  className,
}: CitationListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleCitations = isExpanded ? citations : citations.slice(0, maxVisible);
  const hasMore = citations.length > maxVisible;

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // =========================================================================
  // INLINE MODE (Compact badges for streaming)
  // =========================================================================

  if (inline) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className={cn('flex flex-wrap gap-1.5', className)}>
          <AnimatePresence mode="popLayout">
            {visibleCitations.map((citation, index) => (
              <CitationBadge
                key={citation.id}
                citation={citation}
                index={index}
                isStreaming={isStreaming}
              />
            ))}
          </AnimatePresence>

          {hasMore && !isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleToggleExpand}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              +{citations.length - maxVisible} more
            </motion.button>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // =========================================================================
  // BLOCK MODE (Full citation list)
  // =========================================================================

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Quote className="h-4 w-4" />
        <span className="font-medium">Sources ({citations.length})</span>
      </div>

      {/* Citation List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleCitations.map((citation, index) => (
            <CitationCard
              key={citation.id}
              citation={citation}
              index={index}
              isStreaming={isStreaming}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpand}
          className="w-full text-slate-600 hover:text-slate-800"
        >
          <ChevronDown className={cn(
            'h-4 w-4 mr-1 transition-transform',
            isExpanded && 'rotate-180'
          )} />
          {isExpanded ? 'Show less' : `Show ${citations.length - maxVisible} more sources`}
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CitationBadgeProps {
  citation: Citation;
  index: number;
  isStreaming?: boolean;
}

function CitationBadge({ citation, index, isStreaming }: CitationBadgeProps) {
  const config = SOURCE_TYPE_CONFIG[citation.type || 'web'] || SOURCE_TYPE_CONFIG.web;
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={isStreaming ? { opacity: 0, scale: 0.8, y: 5 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
            'border transition-all cursor-pointer',
            config.bgColor,
            config.color,
            'border-transparent hover:border-current',
            'hover:shadow-sm'
          )}
          onClick={(e) => {
            if (!citation.url) {
              e.preventDefault();
            }
          }}
        >
          <Icon className="h-3 w-3" />
          <span className="font-medium">[{index + 1}]</span>
        </motion.a>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs p-3"
      >
        <CitationPreview citation={citation} />
      </TooltipContent>
    </Tooltip>
  );
}

interface CitationCardProps {
  citation: Citation;
  index: number;
  isStreaming?: boolean;
}

function CitationCard({ citation, index, isStreaming }: CitationCardProps) {
  const config = SOURCE_TYPE_CONFIG[citation.type || 'web'] || SOURCE_TYPE_CONFIG.web;
  const Icon = config.icon;

  return (
    <motion.div
      initial={isStreaming ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-3 rounded-lg border',
        config.bgColor,
        'border-slate-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Index badge */}
        <div className={cn(
          'shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
          'bg-white border',
          config.color
        )}>
          <span className="text-xs font-semibold">{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-medium text-slate-900 line-clamp-2">
              {citation.title}
            </h4>
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Badge variant="outline" className={cn('px-1.5 py-0', config.color, config.bgColor)}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {citation.source && (
              <span className="truncate">{citation.source}</span>
            )}
            {citation.year && (
              <span>({citation.year})</span>
            )}
            {citation.authors && citation.authors.length > 0 && (
              <span className="truncate">
                {citation.authors[0]}{citation.authors.length > 1 && ' et al.'}
              </span>
            )}
          </div>

          {/* Excerpt */}
          {citation.excerpt && (
            <p className="mt-2 text-xs text-slate-600 line-clamp-2 italic">
              "{citation.excerpt}"
            </p>
          )}

          {/* Confidence indicator */}
          {citation.confidence !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    citation.confidence >= 0.8 ? 'bg-green-500' :
                    citation.confidence >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${citation.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {Math.round(citation.confidence * 100)}% match
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CitationPreviewProps {
  citation: Citation;
}

function CitationPreview({ citation }: CitationPreviewProps) {
  const config = SOURCE_TYPE_CONFIG[citation.type || 'web'] || SOURCE_TYPE_CONFIG.web;
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      {/* Title */}
      <h4 className="font-medium text-slate-900 text-sm line-clamp-2">
        {citation.title}
      </h4>

      {/* Source info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className={cn('h-3 w-3', config.color)} />
        <span>{config.label}</span>
        {citation.year && <span>• {citation.year}</span>}
      </div>

      {/* Excerpt */}
      {citation.excerpt && (
        <p className="text-xs text-slate-600 line-clamp-3">
          {citation.excerpt}
        </p>
      )}

      {/* Link hint */}
      {citation.url && (
        <div className="text-xs text-blue-600 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Click to open source
        </div>
      )}
    </div>
  );
}

export default CitationList;
