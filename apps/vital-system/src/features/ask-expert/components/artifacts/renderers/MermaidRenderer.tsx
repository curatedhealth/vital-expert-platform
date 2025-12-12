'use client';

/**
 * VITAL Platform - MermaidRenderer Component
 *
 * Renders Mermaid diagrams (flowcharts, sequence diagrams, class diagrams, etc.)
 * with dynamic theming, export capabilities, and error handling.
 *
 * Security: SVG output is sanitized using DOMPurify to prevent XSS attacks.
 *
 * Supported Mermaid Diagram Types:
 * - flowchart/graph: Process flows, decision trees
 * - sequenceDiagram: API interactions, system communications
 * - classDiagram: Data models, class hierarchies
 * - stateDiagram: State machines, lifecycle flows
 * - erDiagram: Entity-relationship for database schemas
 * - gantt: Project timelines
 * - pie: Pie charts (simpler alternative to ChartRenderer)
 * - mindmap: Concept organization
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useState, useCallback, useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  AlertCircle,
  GitBranch,
  Code,
  Eye,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DOMPurify from 'dompurify';

// =============================================================================
// TYPES
// =============================================================================

export interface MermaidRendererProps {
  /** Mermaid diagram content (raw mermaid syntax) */
  content: string;
  /** Diagram title */
  title?: string;
  /** Theme: dark or light */
  theme?: 'dark' | 'light';
  /** Custom class names */
  className?: string;
  /** Max height before scrolling */
  maxHeight?: number | string;
  /** Show source code toggle */
  showSource?: boolean;
  /** Called when copy is clicked */
  onCopy?: () => void;
  /** Called when export is clicked */
  onExport?: (format: 'svg' | 'png') => void;
  /** Called when regenerate is requested */
  onRegenerate?: () => void;
}

// =============================================================================
// MERMAID CONFIGURATION
// =============================================================================

const MERMAID_THEMES = {
  light: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#9055E0',
      primaryTextColor: '#1e1e1e',
      primaryBorderColor: '#7C3AED',
      lineColor: '#57534e',
      secondaryColor: '#f5f5f4',
      tertiaryColor: '#fafaf9',
      background: '#ffffff',
      mainBkg: '#ffffff',
      nodeBorder: '#9055E0',
      clusterBkg: '#f5f5f4',
      clusterBorder: '#d6d3d1',
      titleColor: '#1e1e1e',
      edgeLabelBackground: '#ffffff',
      nodeTextColor: '#1e1e1e',
    },
  },
  dark: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#9055E0',
      primaryTextColor: '#fafaf9',
      primaryBorderColor: '#A78BFA',
      lineColor: '#a8a29e',
      secondaryColor: '#292524',
      tertiaryColor: '#1c1917',
      background: '#1c1917',
      mainBkg: '#1c1917',
      nodeBorder: '#9055E0',
      clusterBkg: '#292524',
      clusterBorder: '#44403c',
      titleColor: '#fafaf9',
      edgeLabelBackground: '#292524',
      nodeTextColor: '#fafaf9',
    },
  },
};

// =============================================================================
// DIAGRAM TYPE DETECTION
// =============================================================================

type MermaidDiagramType =
  | 'flowchart'
  | 'sequenceDiagram'
  | 'classDiagram'
  | 'stateDiagram'
  | 'erDiagram'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'unknown';

function detectDiagramType(content: string): MermaidDiagramType {
  const trimmed = content.trim().toLowerCase();

  if (trimmed.startsWith('flowchart') || trimmed.startsWith('graph')) return 'flowchart';
  if (trimmed.startsWith('sequencediagram')) return 'sequenceDiagram';
  if (trimmed.startsWith('classdiagram')) return 'classDiagram';
  if (trimmed.startsWith('statediagram')) return 'stateDiagram';
  if (trimmed.startsWith('erdiagram')) return 'erDiagram';
  if (trimmed.startsWith('gantt')) return 'gantt';
  if (trimmed.startsWith('pie')) return 'pie';
  if (trimmed.startsWith('mindmap')) return 'mindmap';

  return 'unknown';
}

const DIAGRAM_TYPE_LABELS: Record<MermaidDiagramType, string> = {
  flowchart: 'Flowchart',
  sequenceDiagram: 'Sequence Diagram',
  classDiagram: 'Class Diagram',
  stateDiagram: 'State Diagram',
  erDiagram: 'ER Diagram',
  gantt: 'Gantt Chart',
  pie: 'Pie Chart',
  mindmap: 'Mind Map',
  unknown: 'Diagram',
};

// =============================================================================
// SVG SANITIZATION
// =============================================================================

/**
 * Sanitize SVG content using DOMPurify to prevent XSS attacks.
 * Configured to allow SVG-specific elements and attributes.
 */
function sanitizeSvg(svgContent: string): string {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['foreignObject'],
    ADD_ATTR: ['xmlns', 'xmlns:xlink', 'viewBox', 'preserveAspectRatio'],
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MermaidRenderer = memo(function MermaidRenderer({
  content,
  title,
  theme: initialTheme = 'light',
  className,
  maxHeight = '600px',
  showSource = true,
  onCopy,
  onExport,
  onRegenerate,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  const mermaidId = `mermaid-${uniqueId.replace(/:/g, '-')}`;

  const [theme, setTheme] = useState(initialTheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showingSource, setShowingSource] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Detect diagram type
  const diagramType = detectDiagramType(content);
  const diagramLabel = DIAGRAM_TYPE_LABELS[diagramType];

  // Render mermaid diagram
  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (!content || !containerRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;

        // Initialize mermaid with theme
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'Inter, system-ui, sans-serif',
          ...MERMAID_THEMES[theme],
        });

        // Render the diagram
        const { svg } = await mermaid.render(mermaidId, content);

        if (isMounted) {
          // Sanitize SVG output to prevent XSS
          const sanitizedSvg = sanitizeSvg(svg);
          setRenderedSvg(sanitizedSvg);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mermaid rendering error:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [content, theme, mermaidId]);

  // Update SVG container safely using DOM API instead of dangerouslySetInnerHTML
  useEffect(() => {
    if (svgContainerRef.current && renderedSvg && !showingSource && !isLoading) {
      // Clear previous content
      svgContainerRef.current.innerHTML = '';
      // Set sanitized SVG
      svgContainerRef.current.innerHTML = renderedSvg;
    }
  }, [renderedSvg, showingSource, isLoading]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content, onCopy]);

  const handleExportSvg = useCallback(() => {
    if (!renderedSvg) return;

    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.('svg');
  }, [renderedSvg, title, onExport]);

  const handleExportPng = useCallback(async () => {
    if (!renderedSvg || !containerRef.current) return;

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Set canvas size (2x for retina)
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);

        // White background
        ctx.fillStyle = theme === 'dark' ? '#1c1917' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Download
        const link = document.createElement('a');
        link.download = `${title || 'diagram'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        URL.revokeObjectURL(url);
        onExport?.('png');
      };

      img.src = url;
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  }, [renderedSvg, title, theme, onExport]);

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 bg-red-50',
          className
        )}
        style={{ minHeight: 200 }}
      >
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-sm font-medium text-red-600 mb-2">Diagram Error</p>
        <p className="text-xs text-red-500 text-center max-w-md mb-4">{error}</p>

        {showSource && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowingSource(true)}
            className="mb-2"
          >
            <Code className="h-4 w-4 mr-2" />
            View Source
          </Button>
        )}

        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        )}

        {showingSource && (
          <pre className="mt-4 p-3 text-xs bg-red-100 rounded overflow-auto max-w-full">
            {content}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border',
        theme === 'dark' ? 'border-stone-700 bg-stone-900' : 'border-stone-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          theme === 'dark' ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
        )}
      >
        {/* Title and type badge */}
        <div className="flex items-center gap-3">
          <GitBranch className="h-5 w-5 text-[var(--ae-accent-primary,#9055E0)]" />
          {title && (
            <h3 className={cn('font-medium', theme === 'dark' ? 'text-stone-100' : 'text-stone-800')}>
              {title}
            </h3>
          )}
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              theme === 'dark'
                ? 'bg-[var(--ae-accent-primary,#9055E0)]/20 text-[var(--ae-accent-primary,#9055E0)]'
                : 'bg-[var(--ae-accent-primary,#9055E0)]/10 text-[var(--ae-accent-primary,#9055E0)]'
            )}
          >
            {diagramLabel}
          </span>
        </div>

        {/* Actions */}
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            {/* View toggle */}
            {showSource && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowingSource(!showingSource)}
                    className={cn(
                      'h-7 w-7',
                      theme === 'dark'
                        ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
                      showingSource && (theme === 'dark' ? 'bg-stone-700' : 'bg-stone-200')
                    )}
                    aria-label={showingSource ? 'View diagram' : 'View source'}
                  >
                    {showingSource ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showingSource ? 'View diagram' : 'View source'}</TooltipContent>
              </Tooltip>
            )}

            {/* Theme toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</TooltipContent>
            </Tooltip>

            {/* Expand/collapse */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
            </Tooltip>

            {/* Export SVG */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportSvg}
                  disabled={!renderedSvg}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Export SVG"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export SVG</TooltipContent>
            </Tooltip>

            {/* Copy source */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={cn(
                    'h-7 w-7',
                    theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-stone-700'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  )}
                  aria-label="Copy source"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy source'}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className={cn(
          'overflow-auto',
          theme === 'dark' ? 'bg-stone-900' : 'bg-white'
        )}
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-[var(--ae-accent-primary,#9055E0)]" />
            <span className={cn('ml-2 text-sm', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
              Rendering diagram...
            </span>
          </div>
        ) : showingSource ? (
          <pre
            className={cn(
              'p-4 text-xs font-mono overflow-auto',
              theme === 'dark' ? 'text-stone-300' : 'text-stone-700'
            )}
          >
            {content}
          </pre>
        ) : (
          <div
            ref={svgContainerRef}
            className="p-4 flex items-center justify-center [&_svg]:max-w-full"
            aria-label={`${diagramLabel}: ${title || 'Mermaid diagram'}`}
          />
        )}
      </div>
    </div>
  );
});

export default MermaidRenderer;
