'use client';

/**
 * @vital/ai-components/references
 * 
 * TAG: REFERENCES_SHARED_COMPONENT
 * 
 * Displays Chicago-style references with badges and metadata
 * 
 * Used by:
 * - Ask Expert (Mode 1, 2, 3, 4)
 * - Ask Panel
 * - Pharma Intelligence
 * - Any service with citations
 * 
 * Features:
 * - Chicago citation format
 * - Clickable hyperlinks
 * - Source type badges
 * - Similarity scores
 * - Excerpt preview
 * - Dark mode support
 * - Scroll-to-source functionality
 */

import { useRef, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { Badge } from '@vital/ui';
import type { ReferencesProps, Source } from '../types';

export function References({ 
  sources, 
  onSourceClick,
  className = ''
}: ReferencesProps) {
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const scrollToSource = useCallback((sourceId: string) => {
    const element = sourceRefs.current[sourceId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      onSourceClick?.(sourceId);
    }
  }, [onSourceClick]);
  
  if (!sources || sources.length === 0) {
    return null;
  }
  
  return (
    <div className={`mt-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <BookOpen className="h-4 w-4" />
        <span>References ({sources.length})</span>
      </div>
      
      {/* Reference list */}
      <div className="space-y-3">
        {sources.map((source, idx) => (
          <div
            key={source.id || `source-${idx}`}
            ref={(el) => {
              if (el) {
                sourceRefs.current[source.id] = el;
              } else {
                delete sourceRefs.current[source.id];
              }
            }}
            className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 dark:border-gray-800"
          >
            {/* Number badge - Clean style without brackets */}
            <Badge 
              variant="outline" 
              className="shrink-0 h-5 min-w-[24px] text-[10px] font-semibold mt-0.5 rounded-full"
            >
              {idx + 1}
            </Badge>
            
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Chicago Citation */}
              <ChicagoCitation source={source} />
              
              {/* Metadata badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {source.sourceType && (
                  <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {formatSourceType(source.sourceType)}
                  </Badge>
                )}
                {typeof source.similarity === 'number' && source.similarity > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {Math.round(source.similarity * 100)}% match
                  </Badge>
                )}
              </div>
              
              {/* Excerpt (optional) */}
              {source.excerpt && (
                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {source.excerpt}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chicago Citation sub-component
 * Format: Organization. "Title." Domain, Year.
 */
function ChicagoCitation({ source }: { source: Source }) {
  return (
    <div className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
      {/* Author/Organization */}
      {(source.organization || source.author) && (
        <span className="font-semibold">
          {source.organization || source.author}
        </span>
      )}
      
      {/* Title (as clickable link if URL available) */}
      {source.title && (
        <>
          {(source.organization || source.author) && '. '}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              &ldquo;{source.title}&rdquo;
            </a>
          ) : (
            <span>&ldquo;{source.title}&rdquo;</span>
          )}
        </>
      )}
      
      {/* Domain */}
      {source.domain && (
        <>
          {'. '}
          <span className="italic text-gray-600 dark:text-gray-400">
            {source.domain}
          </span>
        </>
      )}
      
      {/* Publication Date */}
      {source.publicationDate && (() => {
        const date = new Date(source.publicationDate);
        const year = date.getFullYear();
        if (!isNaN(year)) {
          return (
            <span className="text-gray-600 dark:text-gray-400">
              , {year}
            </span>
          );
        }
        return null;
      })()}
      
      {'.'}
    </div>
  );
}

/**
 * Formats source type for display
 * Example: 'fda_guidance' -> 'FDA Guidance'
 */
function formatSourceType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Hook for scrolling to sources
 * Useful for custom implementations
 */
export function useSourceScroll() {
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const scrollToSource = useCallback((sourceId: string) => {
    const element = sourceRefs.current[sourceId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);
  
  return { sourceRefs, scrollToSource };
}

