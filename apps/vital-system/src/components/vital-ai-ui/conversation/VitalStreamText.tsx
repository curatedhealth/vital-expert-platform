'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Streamdown } from 'streamdown';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
} from '@/components/ui/shadcn-io/ai/inline-citation';

// =============================================================================
// TYPES
// =============================================================================

export interface CitationData {
  id: string;
  index: number;
  source: string;
  title: string;
  excerpt?: string;
  url?: string;
  confidence?: number;
  authors?: string[];
  date?: string;
  metadata?: Record<string, unknown>;
}

interface VitalStreamTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  onComplete?: () => void;
  /**
   * Enable syntax highlighting with Shiki
   * @default true
   */
  highlightCode?: boolean;
  /**
   * Enable Mermaid diagram rendering
   * @default true
   */
  enableMermaid?: boolean;
  /**
   * Show copy controls for code blocks and tables
   * @default true
   */
  showControls?: boolean;
  /**
   * Citation data to render as interactive inline pills
   * When provided, [1], [2], etc. markers in content become hoverable citation pills
   */
  citations?: CitationData[];
  /**
   * Whether to render citations inline in the markdown text (true)
   * or as a separate strip below the content (false)
   * @default true
   */
  inlineCitations?: boolean;
}

// =============================================================================
// CITATION MARKER REGEX
// =============================================================================

// Matches citation markers like [1], [2], [1,2,3], [1-3], etc.
const CITATION_MARKER_REGEX = /\[(\d+(?:[,\-]\d+)*)\]/g;

/**
 * Parse citation marker string to array of indices
 * Examples: "1" -> [1], "1,2,3" -> [1,2,3], "1-3" -> [1,2,3]
 */
function parseCitationMarker(marker: string): number[] {
  const indices: number[] = [];
  const parts = marker.split(',');

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }
    } else {
      indices.push(Number(part));
    }
  }

  return indices;
}

// =============================================================================
// INLINE CITATION PROCESSING FOR STREAMDOWN
// =============================================================================

/**
 * Processes text content and replaces citation markers [1], [2], etc.
 * with InlineCitation hover card components.
 *
 * This recursive function handles:
 * - String content: splits by citation markers and inserts InlineCitation components
 * - React elements: recursively processes their children
 * - Arrays: processes each child element
 */
function processCitationsInText(
  content: React.ReactNode,
  citationMap: Map<number, CitationData>
): React.ReactNode {
  // Handle string content - find and replace citation markers
  if (typeof content === 'string') {
    const parts = content.split(/(\[\d+(?:[,\-]\d+)*\])/g);

    return parts.map((part, index) => {
      const citationMatch = part.match(/\[(\d+(?:[,\-]\d+)*)\]/);

      if (citationMatch) {
        const markerIndices = parseCitationMarker(citationMatch[1]);
        // Get citations for all indices in marker (e.g., [1,2] gets citations 1 and 2)
        const citationData = markerIndices
          .map((idx) => citationMap.get(idx))
          .filter((c): c is CitationData => c !== undefined);

        if (citationData.length > 0) {
          const sourceUrls = citationData.map((c) => c.url || '#');

          return (
            <InlineCitation key={`cite-${index}`}>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={sourceUrls}>
                  {part}
                </InlineCitationCardTrigger>
                <InlineCitationCardBody align="start">
                  <InlineCitationCarousel>
                    <InlineCitationCarouselContent>
                      {citationData.map((citation, sourceIndex) => (
                        <InlineCitationCarouselItem key={sourceIndex}>
                          <InlineCitationSource
                            url={citation.url || '#'}
                            title={citation.title}
                            description={citation.excerpt}
                            date={citation.date}
                            authors={citation.authors}
                            excerpt={citation.excerpt}
                            index={citation.index - 1}
                          />
                        </InlineCitationCarouselItem>
                      ))}
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          );
        }
      }
      return part;
    });
  }

  // Handle React elements - recursively process their children
  if (React.isValidElement(content)) {
    const element = content as React.ReactElement<any>;
    if (element.props?.children) {
      return React.cloneElement(
        element,
        { ...element.props },
        processCitationsInText(element.props.children, citationMap)
      );
    }
  }

  // Handle arrays - process each child
  if (Array.isArray(content)) {
    return content.map((child, index) => (
      <React.Fragment key={index}>
        {processCitationsInText(child, citationMap)}
      </React.Fragment>
    ));
  }

  return content;
}

/**
 * Creates custom Streamdown components that process citation markers inline.
 * Each text-containing element (p, li, h1-h6, etc.) will have its content
 * processed to replace [1], [2], etc. with hoverable InlineCitation components.
 */
function createCitationComponents(citationMap: Map<number, CitationData>) {
  const processChildren = (children: React.ReactNode) =>
    processCitationsInText(children, citationMap);

  return {
    p: ({ children, ...props }: any) => (
      <p {...props}>{processChildren(children)}</p>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 {...props}>{processChildren(children)}</h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 {...props}>{processChildren(children)}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 {...props}>{processChildren(children)}</h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 {...props}>{processChildren(children)}</h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 {...props}>{processChildren(children)}</h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 {...props}>{processChildren(children)}</h6>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props}>{processChildren(children)}</li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong {...props}>{processChildren(children)}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em {...props}>{processChildren(children)}</em>
    ),
    td: ({ children, ...props }: any) => (
      <td {...props}>{processChildren(children)}</td>
    ),
    th: ({ children, ...props }: any) => (
      <th {...props}>{processChildren(children)}</th>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote {...props}>{processChildren(children)}</blockquote>
    ),
  };
}

/**
 * VitalStreamText - Jitter-free streaming markdown component
 *
 * Uses Streamdown (https://streamdown.ai/) for:
 * - Jitter-free AI streaming with parseIncompleteMarkdown
 * - Built-in syntax highlighting with Shiki
 * - GitHub Flavored Markdown (GFM)
 * - Mermaid diagram rendering
 * - Unterminated block parsing during streaming
 * - Math expressions with KaTeX
 *
 * Now with inline citation pill support:
 * - Pass citations array to enable interactive citation markers
 * - [1], [2], etc. become hoverable pills with source preview
 *
 * @see https://streamdown.ai/
 */
export function VitalStreamText({
  content,
  isStreaming,
  className,
  onComplete,
  highlightCode = true,
  enableMermaid = true,
  showControls = true,
  citations = [],
  inlineCitations = true,
}: VitalStreamTextProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<string>('');

  // Build citation index map for quick lookup
  const citationMap = useMemo(() => {
    const map = new Map<number, CitationData>();
    citations.forEach((c) => {
      map.set(c.index, c);
    });
    return map;
  }, [citations]);

  // Create custom Streamdown components for inline citation rendering
  // Only created when citations exist and inline mode is enabled
  const citationComponents = useMemo(() => {
    if (!inlineCitations || citations.length === 0) {
      return undefined;
    }
    return createCitationComponents(citationMap);
  }, [inlineCitations, citations.length, citationMap]);

  // Track content changes for completion callback
  useEffect(() => {
    if (!isStreaming && content !== contentRef.current) {
      contentRef.current = content;
      onComplete?.();
    }
  }, [content, isStreaming, onComplete]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div className={cn('relative group', className)}>
      {/* Copy entire response button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-background/80 backdrop-blur-sm'
        )}
        onClick={handleCopy}
        title="Copy entire response"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      <div
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-p:leading-relaxed prose-p:my-2',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-pre:my-3',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-primary prose-blockquote:not-italic',
          'prose-table:text-sm',
          'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
          // Streamdown-specific styling
          '[&_.streamdown-code-block]:relative [&_.streamdown-code-block]:my-3',
          '[&_.streamdown-mermaid]:my-4 [&_.streamdown-mermaid]:flex [&_.streamdown-mermaid]:justify-center',
        )}
      >
        <Streamdown
          parseIncompleteMarkdown={isStreaming}
          isAnimating={isStreaming}
          shikiTheme={['github-light', 'github-dark']}
          controls={showControls ? { code: true, table: true, mermaid: enableMermaid } : false}
          mermaidConfig={{
            theme: 'neutral',
            securityLevel: 'strict',
          }}
          // Pass custom components for inline citation processing
          // When enabled, [1], [2] markers become interactive hover pills
          components={citationComponents}
        >
          {content || '\u00A0'}
        </Streamdown>
      </div>

      {/* Streaming cursor indicator */}
      {isStreaming && (
        <span
          className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-baseline"
          aria-hidden="true"
        />
      )}

      {/* Citation pills strip - only show when inline mode is disabled */}
      {/* When inlineCitations={true}, markers are rendered inline within text via Streamdown components */}
      {!inlineCitations && citations.length > 0 && (
        <CitationPillsStrip
          citations={citations}
          citationMap={citationMap}
          content={content}
          isStreaming={isStreaming}
        />
      )}
    </div>
  );
}

// =============================================================================
// CITATION PILLS STRIP COMPONENT
// =============================================================================

interface CitationPillsStripProps {
  citations: CitationData[];
  citationMap: Map<number, CitationData>;
  content: string;
  isStreaming: boolean;
}

/**
 * Renders inline citation pills as a strip below the content.
 * Each pill opens a hover card with full source details.
 */
function CitationPillsStrip({
  citations,
  citationMap,
  content,
  isStreaming,
}: CitationPillsStripProps) {
  // Extract which citation indices are actually referenced in the content
  const referencedIndices = useMemo(() => {
    const indices = new Set<number>();
    const matches = content.matchAll(CITATION_MARKER_REGEX);

    for (const match of matches) {
      const parsedIndices = parseCitationMarker(match[1]);
      parsedIndices.forEach((idx) => indices.add(idx));
    }

    return Array.from(indices).sort((a, b) => a - b);
  }, [content]);

  // Filter citations to only those referenced in content
  const activeCitations = useMemo(() => {
    if (referencedIndices.length === 0) {
      // If no markers found in content, show all citations
      return citations;
    }
    return referencedIndices
      .map((idx) => citationMap.get(idx))
      .filter((c): c is CitationData => c !== undefined);
  }, [referencedIndices, citationMap, citations]);

  if (activeCitations.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'mt-3 pt-3 border-t border-muted/50',
        'flex flex-wrap items-center gap-2',
        isStreaming && 'opacity-75'
      )}
    >
      <span className="text-xs text-muted-foreground font-medium mr-1">
        Sources:
      </span>
      {activeCitations.map((citation) => (
        <InlineCitationPill key={citation.id} citation={citation} />
      ))}
    </div>
  );
}

// =============================================================================
// INLINE CITATION PILL COMPONENT
// =============================================================================

interface InlineCitationPillProps {
  citation: CitationData;
}

/**
 * Single citation pill with hover card preview.
 * Uses the InlineCitation components from shadcn-io/ai.
 */
function InlineCitationPill({ citation }: InlineCitationPillProps) {
  const sourceUrl = citation.url || '#';
  const sourceUrls = [sourceUrl];

  return (
    <InlineCitation>
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={sourceUrls}>
          [{citation.index}]
        </InlineCitationCardTrigger>
        <InlineCitationCardBody align="start">
          <InlineCitationCarousel>
            <InlineCitationCarouselContent>
              <InlineCitationCarouselItem>
                <InlineCitationSource
                  url={sourceUrl}
                  title={citation.title}
                  description={citation.excerpt}
                  date={citation.date}
                  authors={citation.authors}
                  excerpt={citation.excerpt}
                  index={citation.index - 1}
                />
              </InlineCitationCarouselItem>
            </InlineCitationCarouselContent>
          </InlineCitationCarousel>
        </InlineCitationCardBody>
      </InlineCitationCard>
    </InlineCitation>
  );
}

/**
 * Streaming text with AI SDK integration
 * Use this when working with Vercel AI SDK's useChat or useCompletion
 */
export function VitalAIStreamText({
  content,
  status,
  className,
  onComplete,
}: {
  content: string;
  status: 'idle' | 'loading' | 'streaming' | 'error';
  className?: string;
  onComplete?: () => void;
}) {
  const isStreaming = status === 'streaming' || status === 'loading';

  return (
    <VitalStreamText
      content={content}
      isStreaming={isStreaming}
      className={className}
      onComplete={onComplete}
    />
  );
}

export type { VitalStreamTextProps };
