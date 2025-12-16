'use client';

/**
 * VITAL Platform - CitationList Component
 *
 * Displays citations from AI responses with hover previews.
 * Supports both inline (streaming) and block (completed) display modes.
 * Uses shared VitalSources component with Chicago style citation formatting.
 *
 * Features:
 * - Citation badges with source type icons
 * - Hover preview showing excerpt and metadata
 * - Animated entry during streaming
 * - Expandable full citation list
 * - External link handling with safety
 * - Chicago style citation formatting (17th edition)
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 * Updated: December 16, 2025 - Chicago style + VitalSources integration
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

// Import shared VitalSources component from vital-ai-ui package
import {
  VitalSources,
  VitalSourcesTrigger,
  VitalSourcesContent,
  VitalSource,
  type SourceCategory,
} from '@/components/vital-ai-ui/reasoning/VitalSources';

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
  /** Citation style format - 'chicago' for academic style */
  citationStyle?: 'default' | 'chicago';
  /** Custom class names */
  className?: string;
}

// =============================================================================
// SOURCE TYPE CONFIG
// =============================================================================

// Brand v6.0 Purple-centric source type colors
const SOURCE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  pubmed: { icon: GraduationCap, color: 'text-green-700', bgColor: 'bg-green-50', label: 'PubMed' },
  journal: { icon: BookOpen, color: 'text-purple-700', bgColor: 'bg-purple-50', label: 'Journal' },
  guideline: { icon: Building2, color: 'text-violet-700', bgColor: 'bg-violet-50', label: 'Guideline' },
  web: { icon: Globe, color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-50', label: 'Web' },
  document: { icon: FileText, color: 'text-stone-700', bgColor: 'bg-stone-50', label: 'Document' },
  database: { icon: Database, color: 'text-pink-700', bgColor: 'bg-pink-50', label: 'Database' },
  internal: { icon: Link2, color: 'text-rose-700', bgColor: 'bg-rose-50', label: 'Internal' },
  news: { icon: Newspaper, color: 'text-orange-700', bgColor: 'bg-orange-50', label: 'News' },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Map Citation type to SourceCategory for VitalSource component
 */
function mapTypeToCategory(type?: string): SourceCategory | undefined {
  const mapping: Record<string, SourceCategory> = {
    'pubmed': 'Medical Literature',
    'journal': 'Medical Literature',
    'web': 'Web',
    'document': 'Knowledge Base',
    'database': 'Drug Database',
    'guideline': 'Guidelines',
    'internal': 'Internal',
    'news': 'Web',
  };
  return type ? mapping[type] : undefined;
}

export function CitationList({
  citations,
  inline = false,
  isStreaming = false,
  maxVisible = 5,
  citationStyle = 'chicago', // Default to Chicago style
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
  // BLOCK MODE - Collapsible Sources with Chicago style numbered references
  // =========================================================================

  // Count sources by type for trigger display
  const ragCount = citations.filter(c => isRAGSource(c)).length;
  const webCount = citations.filter(c => !isRAGSource(c)).length;

  return (
    <VitalSources defaultOpen={false} className={className}>
      {/* Collapsible trigger - "Used X sources" with breakdown */}
      <VitalSourcesTrigger count={citations.length} />

      {/* Expandable content - numbered reference list */}
      <VitalSourcesContent>
        {/* Source type breakdown */}
        <div className="flex items-center gap-2 pt-2 pb-1 text-xs text-slate-500">
          {ragCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
              <Database className="h-3 w-3" />
              {ragCount} RAG
            </span>
          )}
          {webCount > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
              <Globe className="h-3 w-3" />
              {webCount} Web
            </span>
          )}
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {visibleCitations.map((citation, index) => {
              // Format Chicago style citation
              const chicagoRef = formatChicagoCitation(citation);
              const hasUrl = Boolean(citation.url);
              const isRag = isRAGSource(citation);

              return (
                <motion.div
                  key={citation.id}
                  initial={isStreaming ? { opacity: 0, y: 5 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-md text-sm text-slate-700"
                >
                  {/* Number */}
                  <span className="text-slate-500 font-medium shrink-0">
                    [{index + 1}]
                  </span>

                  {/* Source type badge */}
                  <span className={cn(
                    'shrink-0 inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium',
                    isRag
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  )}>
                    {isRag ? (
                      <><Database className="h-2.5 w-2.5" /> RAG</>
                    ) : (
                      <><Globe className="h-2.5 w-2.5" /> WEB</>
                    )}
                  </span>

                  {/* Citation text - plain text */}
                  <span className="flex-1">
                    {chicagoRef}
                  </span>

                  {/* Link icon - clickable when URL exists */}
                  {hasUrl ? (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 rounded hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Open source"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="shrink-0 p-1 text-slate-300" title="No link available">
                      <Link2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="text-slate-500 hover:text-slate-700 px-0 mt-2"
          >
            <ChevronDown className={cn(
              'h-4 w-4 mr-1 transition-transform',
              isExpanded && 'rotate-180'
            )} />
            {isExpanded ? 'Show less' : `+${citations.length - maxVisible} more`}
          </Button>
        )}
      </VitalSourcesContent>
    </VitalSources>
  );
}

/**
 * Determine if a citation is from RAG (internal knowledge base) vs Web search
 * RAG sources: pubmed, journal, document, database, guideline, internal
 * Web sources: web, news, or anything with http URL without internal markers
 */
function isRAGSource(citation: Citation): boolean {
  // Check explicit type
  if (citation.type) {
    const ragTypes = ['pubmed', 'journal', 'document', 'database', 'guideline', 'internal'];
    if (ragTypes.includes(citation.type)) return true;
    if (citation.type === 'web' || citation.type === 'news') return false;
  }

  // Check metadata for retriever type
  const retrieverType = citation.metadata?.retriever_type as string | undefined;
  if (retrieverType) {
    if (['vector', 'graph', 'relational'].includes(retrieverType)) return true;
    if (retrieverType === 'web') return false;
  }

  // Heuristics: check URL pattern
  if (citation.url) {
    // Internal/RAG sources often don't have URLs or have internal paths
    if (citation.url.startsWith('/') || citation.url.includes('internal')) return true;
    // Common web search sources
    if (citation.url.includes('google.com') || citation.url.includes('bing.com')) return false;
  }

  // Default: if it has a URL starting with http, assume web
  if (citation.url?.startsWith('http')) return false;

  // Default to RAG for sources without URLs (likely internal)
  return true;
}

/**
 * Format citation in Chicago style (17th edition) - Returns string for compact display
 * Format: Author(s). "Title." Source (Year).
 */
function formatChicagoCitation(citation: Citation): string {
  const parts: string[] = [];

  // Authors
  if (citation.authors && citation.authors.length > 0) {
    if (citation.authors.length === 1) {
      parts.push(citation.authors[0]);
    } else if (citation.authors.length === 2) {
      parts.push(`${citation.authors[0]} and ${citation.authors[1]}`);
    } else {
      parts.push(`${citation.authors[0]} et al.`);
    }
  }

  // Title (in quotes for articles)
  if (citation.title) {
    parts.push(`"${citation.title}"`);
  }

  // Source/Journal
  if (citation.source && citation.source !== citation.title) {
    parts.push(citation.source);
  }

  // Year
  if (citation.year) {
    parts.push(`(${citation.year})`);
  }

  return parts.join('. ').replace(/\.\./g, '.') || citation.title || 'Untitled';
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
        <div className="text-xs text-purple-600 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Click to open source
        </div>
      )}
    </div>
  );
}

export default CitationList;
