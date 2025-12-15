'use client';

/**
 * VITAL Platform - MarkdownRenderer (Artifact Wrapper)
 *
 * Artifact-specific wrapper around VitalStreamText for document artifacts.
 * Adds artifact metadata handling, version tracking, and approval integration.
 *
 * ARCHITECTURE: Wraps VitalStreamText (Streamdown) for core rendering
 * - VitalStreamText handles: markdown parsing, syntax highlighting, streaming
 * - This wrapper adds: artifact metadata, version display, export, approval UI
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 4 Implementation - December 11, 2025
 */

import { memo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { VitalStreamText } from '@/components/vital-ai-ui/conversation/VitalStreamText';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Download,
  FileText,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { logger } from '@vital/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Is content currently streaming */
  isStreaming?: boolean;
  /** Document title */
  title?: string;
  /** Version number */
  version?: number;
  /** Last modified timestamp */
  lastModified?: Date;
  /** Maximum height before scrolling */
  maxHeight?: number | string;
  /** Show toolbar with actions */
  showToolbar?: boolean;
  /** Enable syntax highlighting for code blocks */
  highlightCode?: boolean;
  /** Custom class names */
  className?: string;
  /** Called when streaming completes */
  onComplete?: () => void;
  /** Called when content is copied */
  onCopy?: () => void;
  /** Called when export is requested */
  onExport?: (format: 'md' | 'html' | 'pdf') => void;
  /** Called when regenerate is requested */
  onRegenerate?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming = false,
  title,
  version,
  lastModified,
  maxHeight = '600px',
  showToolbar = true,
  highlightCode = true,
  className,
  onComplete,
  onCopy,
  onExport,
  onRegenerate,
}: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy markdown content', { error: err });
    }
  }, [content, onCopy]);

  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.('md');
  }, [content, title, onExport]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className={cn('rounded-lg border border-stone-200 bg-white', className)}>
      {/* Header / Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[var(--ae-accent-primary,#9055E0)]" />
            {title && <h3 className="font-medium text-stone-800">{title}</h3>}
            {version && (
              <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-500">
                v{version}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span>{wordCount} words</span>
              {lastModified && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lastModified.toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Actions */}
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-1">
                {onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRegenerate}
                        disabled={isStreaming}
                        className="h-8 w-8 text-stone-500 hover:text-stone-900"
                      >
                        <RefreshCw className={cn('h-4 w-4', isStreaming && 'animate-spin')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleExportMarkdown}
                      className="h-8 w-8 text-stone-500 hover:text-stone-900"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download .md</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8 text-stone-500 hover:text-stone-900"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Content - Uses VitalStreamText for rendering */}
      <div
        className="overflow-auto"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <div className="p-4">
          <VitalStreamText
            content={content}
            isStreaming={isStreaming}
            highlightCode={highlightCode}
            onComplete={onComplete}
            className="prose-sm"
          />
        </div>
      </div>
    </div>
  );
});

export default MarkdownRenderer;
