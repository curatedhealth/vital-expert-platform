'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { cn } from '../lib/utils';
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Code,
  Download,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import type { VitalV0PreviewFrameProps } from './types';

/**
 * VitalV0PreviewFrame - v0 Generated Component Preview
 * 
 * Renders an iframe preview of v0-generated components with controls
 * for fullscreen, refresh, external open, and code extraction.
 * 
 * Features:
 * - Sandboxed iframe for security
 * - Loading and error states
 * - Fullscreen toggle
 * - URL copy functionality
 * - Code extraction placeholder
 * 
 * @example
 * ```tsx
 * <VitalV0PreviewFrame
 *   previewUrl="https://v0.dev/chat/abc123"
 *   chatId="abc123"
 *   title="KOL Influence Scorer Node"
 *   onOpenExternal={(url) => window.open(url, '_blank')}
 * />
 * ```
 * 
 * @package @vital/ai-ui/v0
 */
export const VitalV0PreviewFrame = memo(function VitalV0PreviewFrame({
  previewUrl,
  chatId,
  title = 'v0 Preview',
  isLoading = false,
  fullscreen = false,
  onFullscreenChange,
  onOpenExternal,
  onRefresh,
  className,
}: VitalV0PreviewFrameProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset loading state when URL changes
  useEffect(() => {
    if (previewUrl) {
      setIframeLoading(true);
      setIframeError(false);
    }
  }, [previewUrl]);

  const handleCopyUrl = useCallback(async () => {
    if (previewUrl) {
      try {
        await navigator.clipboard.writeText(previewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  }, [previewUrl]);

  const handleRefresh = useCallback(() => {
    setIframeLoading(true);
    setIframeError(false);
    
    // Force iframe reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
    
    onRefresh?.();
  }, [onRefresh]);

  const handleOpenExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      onOpenExternal?.(previewUrl);
    }
  }, [previewUrl, onOpenExternal]);

  const handleToggleFullscreen = useCallback(() => {
    onFullscreenChange?.(!fullscreen);
  }, [fullscreen, onFullscreenChange]);

  // Loading skeleton
  if (isLoading || !previewUrl) {
    return (
      <div className={cn('rounded-lg border overflow-hidden bg-muted', className)}>
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center space-y-3">
            <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto animate-pulse" />
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Generating preview...' : 'No preview available'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'rounded-lg border overflow-hidden bg-background',
        fullscreen && 'fixed inset-4 z-50 shadow-2xl',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="gap-1 text-xs shrink-0">
            <Sparkles className="h-3 w-3" />
            v0
          </Badge>
          <span className="text-sm font-medium truncate text-muted-foreground">
            {title}
          </span>
          {chatId && (
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
              #{chatId.slice(-6)}
            </span>
          )}
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-1">
            {/* Copy URL */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? 'Copied!' : 'Copy URL'}
              </TooltipContent>
            </Tooltip>

            {/* Refresh */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRefresh}
                  disabled={iframeLoading}
                >
                  <RefreshCw className={cn(
                    'h-4 w-4',
                    iframeLoading && 'animate-spin'
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            {/* External Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleOpenExternal}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in new tab</TooltipContent>
            </Tooltip>

            {/* Fullscreen Toggle */}
            {onFullscreenChange && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleFullscreen}
                  >
                    {fullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Preview Area */}
      <div className={cn(
        'relative bg-white dark:bg-neutral-950',
        fullscreen ? 'h-[calc(100%-48px)]' : 'aspect-video min-h-[300px]'
      )}>
        {/* Loading Overlay */}
        {iframeLoading && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <div className="text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="text-center space-y-3 max-w-sm px-4">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <div>
                <p className="text-sm font-medium">Preview unavailable</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The preview couldn't be loaded. Try opening it in a new tab.
                </p>
              </div>
              <Button size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in v0.dev
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={() => setIframeLoading(false)}
          onError={() => {
            setIframeLoading(false);
            setIframeError(true);
          }}
          title={title}
          loading="lazy"
        />
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Generated by v0.dev
        </span>
        <span className="font-mono text-[10px]">
          {new URL(previewUrl).pathname.split('/').pop()}
        </span>
      </div>
    </div>
  );
});

export default VitalV0PreviewFrame;



















