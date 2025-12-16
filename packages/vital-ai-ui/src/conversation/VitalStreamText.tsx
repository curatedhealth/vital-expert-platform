'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '@vital/ui';
import { Streamdown } from 'streamdown';

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
}

/**
 * VitalStreamText - Jitter-free streaming markdown component
 * 
 * Uses Streamdown (https://streamdown.ai/) for:
 * - Jitter-free AI streaming
 * - Built-in syntax highlighting with Shiki
 * - GitHub Flavored Markdown (GFM)
 * - CJK language support
 * - Security hardening (origin restrictions)
 * - Unterminated block parsing
 * - Math expressions with KaTeX
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
}: VitalStreamTextProps) {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<string>('');

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
      {/* Copy button - only shown when showControls is true */}
      {showControls && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
            'bg-background/80 backdrop-blur-sm'
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      )}

      {/* Streamdown component for jitter-free streaming */}
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
          controls={{ code: true, table: true, mermaid: true }}
          mermaidConfig={{
            theme: 'neutral',
            securityLevel: 'strict',
          }}
        >
          {content || '\u00A0'}
        </Streamdown>
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
      )}
    </div>
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
