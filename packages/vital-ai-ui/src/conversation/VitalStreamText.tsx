'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../ui/button';
import Streamdown from 'streamdown';

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
   * Allow images from these origins (security)
   * @default []
   */
  allowedImageOrigins?: string[];
  /**
   * Allow links to these origins (security)
   * @default []
   */
  allowedLinkOrigins?: string[];
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
  allowedImageOrigins = [],
  allowedLinkOrigins = [],
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
      {/* Copy button */}
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

      {/* Streamdown component for jitter-free streaming */}
      <Streamdown
        content={content}
        className={cn(
          'prose prose-slate dark:prose-invert max-w-none',
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-p:leading-relaxed',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-primary prose-blockquote:not-italic',
          'prose-table:text-sm',
          isStreaming && 'animate-pulse-subtle'
        )}
        // Security: restrict image and link origins
        allowedImageOrigins={allowedImageOrigins}
        allowedLinkOrigins={allowedLinkOrigins}
      />

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
