'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  FileText,
  Globe,
  Database,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type SourceType = 'document' | 'web' | 'database' | 'academic' | 'internal';

export interface Source {
  id: string;
  title: string;
  type: SourceType;
  url?: string;
  confidence: number; // 0-100
  excerpt?: string;
  author?: string;
  date?: string;
  verified?: boolean;
  citationNumber?: number;
}

export interface VitalSourceListProps {
  /** Array of sources used in the response */
  sources: Source[];
  /** Title for the source list */
  title?: string;
  /** Whether to show confidence scores */
  showConfidence?: boolean;
  /** Whether to show verification status */
  showVerification?: boolean;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  /** Maximum sources to show before "Show more" */
  maxVisible?: number;
  /** Callback when source is clicked */
  onSourceClick?: (source: Source) => void;
  /** Callback to open Red Pen verification panel */
  onVerify?: (source: Source) => void;
  /** Custom class name */
  className?: string;
}

const sourceTypeConfig: Record<SourceType, { icon: typeof FileText; label: string; color: string }> = {
  document: { icon: FileText, label: 'Document', color: 'text-blue-500' },
  web: { icon: Globe, label: 'Web', color: 'text-green-500' },
  database: { icon: Database, label: 'Database', color: 'text-purple-500' },
  academic: { icon: BookOpen, label: 'Academic', color: 'text-amber-500' },
  internal: { icon: Database, label: 'Internal', color: 'text-slate-500' },
};

/**
 * VitalSourceList - Bibliography Component
 * 
 * Bottom-of-message list of all sources used by the AI.
 * Click opens the "Red Pen" verification panel.
 * 
 * @example
 * ```tsx
 * <VitalSourceList
 *   sources={[
 *     { id: '1', title: 'FDA Guidelines 2024', type: 'document', confidence: 95 },
 *     { id: '2', title: 'PubMed Study', type: 'academic', confidence: 87 }
 *   ]}
 *   onVerify={(source) => openRedPenPanel(source)}
 * />
 * ```
 */
export function VitalSourceList({
  sources,
  title = 'Sources',
  showConfidence = true,
  showVerification = true,
  defaultExpanded = true,
  maxVisible = 5,
  onSourceClick,
  onVerify,
  className,
}: VitalSourceListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const visibleSources = showAll ? sources : sources.slice(0, maxVisible);
  const hasMore = sources.length > maxVisible;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  if (sources.length === 0) return null;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={cn('rounded-lg border bg-card', className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{title}</span>
            <Badge variant="secondary" className="text-xs">
              {sources.length}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-2">
          {visibleSources.map((source, index) => {
            const config = sourceTypeConfig[source.type];
            const Icon = config.icon;

            return (
              <div
                key={source.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-md',
                  'bg-muted/30 hover:bg-muted/50 transition-colors',
                  'cursor-pointer group'
                )}
                onClick={() => onSourceClick?.(source)}
              >
                {/* Citation Number */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                  {source.citationNumber ?? index + 1}
                </div>

                {/* Source Icon */}
                <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Source Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {source.title}
                      </p>
                      {(source.author || source.date) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {source.author}
                          {source.author && source.date && ' • '}
                          {source.date}
                        </p>
                      )}
                      {source.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          "{source.excerpt}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {showConfidence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs font-mono',
                                  getConfidenceColor(source.confidence)
                                )}
                              >
                                {source.confidence}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Confidence Score</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {showVerification && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVerify?.(source);
                                }}
                              >
                                {source.verified ? (
                                  <Shield className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{source.verified ? 'Verified' : 'Click to verify'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {source.url && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(source.url, '_blank');
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open source</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : `Show ${sources.length - maxVisible} more`}
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default VitalSourceList;
