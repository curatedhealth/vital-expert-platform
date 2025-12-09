'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  X, 
  Download, 
  Copy, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

type ArtifactType = 
  | 'code' 
  | 'document' 
  | 'chart' 
  | 'table' 
  | 'image' 
  | 'diagram' 
  | 'html' 
  | 'json'
  | 'csv'
  | 'markdown';

interface VitalArtifactProps {
  title: string;
  description?: string;
  type: ArtifactType;
  language?: string;
  children: ReactNode;
  onClose?: () => void;
  onDownload?: () => void;
  onCopy?: () => void;
  onOpenExternal?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

const typeLabels: Record<ArtifactType, string> = {
  code: 'Code',
  document: 'Document',
  chart: 'Chart',
  table: 'Table',
  image: 'Image',
  diagram: 'Diagram',
  html: 'HTML',
  json: 'JSON',
  csv: 'CSV',
  markdown: 'Markdown',
};

/**
 * VitalArtifact - Generated artifact container
 * 
 * Enhanced version of the legacy artifact component with support
 * for multiple content types, actions, and expansion.
 * Reusable across all services.
 */
export function VitalArtifact({
  title,
  description,
  type,
  language,
  children,
  onClose,
  onDownload,
  onCopy,
  onOpenExternal,
  onRefresh,
  isLoading = false,
  isExpandable = true,
  defaultExpanded = true,
  className
}: VitalArtifactProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div className={cn(
      "flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm",
      isFullscreen && "fixed inset-4 z-50",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          {isExpandable && !isFullscreen && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  !isExpanded && "-rotate-90"
                )} />
              </Button>
            </CollapsibleTrigger>
          )}
          <div>
            <p className="font-medium text-sm">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {language || typeLabels[type]}
          </span>
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4",
                      isLoading && "animate-spin"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            )}

            {onCopy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
              </Tooltip>
            )}

            {onDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            )}

            {onOpenExternal && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onOpenExternal}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open External</TooltipContent>
              </Tooltip>
            )}

            {isExpandable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </TooltipContent>
              </Tooltip>
            )}

            {onClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Content */}
      <CollapsibleContent forceMount className={cn(!isExpanded && "hidden")}>
        <div className={cn(
          "flex-1 overflow-auto p-4",
          isFullscreen && "h-[calc(100%-56px)]"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            children
          )}
        </div>
      </CollapsibleContent>
    </div>
  );

  if (isExpandable && !isFullscreen) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {content}
      </Collapsible>
    );
  }

  return content;
}

/**
 * VitalArtifactHeader - Standalone header for custom artifacts
 */
export function VitalArtifactHeader({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between border-b bg-muted/50 px-4 py-3",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * VitalArtifactContent - Standalone content wrapper
 */
export function VitalArtifactContent({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex-1 overflow-auto p-4", className)}>
      {children}
    </div>
  );
}

export default VitalArtifact;
