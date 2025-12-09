'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Database,
  Network,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

type RetrieverType = 'vector' | 'graph' | 'relational';

interface RetrieverResult {
  id: string;
  score: number;
  normalizedScore: number; // 0-100 scale
  rank: number;
  content: string;
  metadata: {
    source?: string;
    title?: string;
    url?: string;
    timestamp?: Date;
    [key: string]: unknown;
  };
}

interface RetrieverData {
  type: RetrieverType;
  results: RetrieverResult[];
  queryTimeMs: number;
  totalFound: number;
  weight: number;
}

interface VitalRetrieverResultsProps {
  retrievers: RetrieverData[];
  query: string;
  showRawScores?: boolean;
  maxResultsPerRetriever?: number;
  onResultClick?: (result: RetrieverResult, retrieverType: RetrieverType) => void;
  className?: string;
}

const retrieverConfig: Record<
  RetrieverType,
  { icon: typeof Database; color: string; bgColor: string; label: string; description: string }
> = {
  vector: {
    icon: Database,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Vector',
    description: 'Semantic similarity search using embeddings',
  },
  graph: {
    icon: Network,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Graph',
    description: 'Relationship paths in knowledge graph',
  },
  relational: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Historical',
    description: 'Patterns from past queries and outcomes',
  },
};

export function VitalRetrieverResults({
  retrievers,
  query,
  showRawScores = false,
  maxResultsPerRetriever = 5,
  onResultClick,
  className,
}: VitalRetrieverResultsProps) {
  const [expandedRetrievers, setExpandedRetrievers] = useState<Set<RetrieverType>>(
    new Set(['vector']) // Vector expanded by default
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRetriever = (type: RetrieverType) => {
    setExpandedRetrievers((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalTime = retrievers.reduce((sum, r) => sum + r.queryTimeMs, 0);
  const totalResults = retrievers.reduce((sum, r) => sum + r.results.length, 0);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Retriever Results</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{totalResults} results</span>
            <span>•</span>
            <span>{totalTime.toFixed(0)}ms total</span>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          <span className="font-medium">Query:</span>
          <span className="truncate">&quot;{query}&quot;</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Weight distribution */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">Weights:</span>
          <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-muted">
            {retrievers.map((r) => {
              const config = retrieverConfig[r.type];
              return (
                <Tooltip key={r.type}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-full transition-all',
                        r.type === 'vector' && 'bg-blue-500',
                        r.type === 'graph' && 'bg-green-500',
                        r.type === 'relational' && 'bg-orange-500'
                      )}
                      style={{ width: `${r.weight * 100}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {config.label}: {(r.weight * 100).toFixed(0)}%
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Retriever sections */}
        <div className="space-y-3">
          {retrievers.map((retriever) => {
            const config = retrieverConfig[retriever.type];
            const Icon = config.icon;
            const isExpanded = expandedRetrievers.has(retriever.type);

            return (
              <Collapsible
                key={retriever.type}
                open={isExpanded}
                onOpenChange={() => toggleRetriever(retriever.type)}
              >
                <div
                  className={cn(
                    'border rounded-lg overflow-hidden',
                    config.bgColor
                  )}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 hover:bg-black/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-1.5 rounded', 'bg-white/80')}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {config.label}
                            <Badge variant="secondary" className="text-xs">
                              {(retriever.weight * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{retriever.results.length} results</div>
                          <div>{retriever.queryTimeMs.toFixed(0)}ms</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t bg-white/50">
                      <ScrollArea className="max-h-[300px]">
                        <div className="p-2 space-y-2">
                          {retriever.results
                            .slice(0, maxResultsPerRetriever)
                            .map((result, index) => (
                              <ResultCard
                                key={result.id}
                                result={result}
                                index={index}
                                retrieverType={retriever.type}
                                showRawScore={showRawScores}
                                isCopied={copiedId === result.id}
                                onCopy={() => copyToClipboard(result.content, result.id)}
                                onClick={() => onResultClick?.(result, retriever.type)}
                              />
                            ))}
                          {retriever.results.length > maxResultsPerRetriever && (
                            <div className="text-center py-2 text-xs text-muted-foreground">
                              +{retriever.results.length - maxResultsPerRetriever} more
                              results
                            </div>
                          )}
                          {retriever.results.length === 0 && (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              No results from this retriever
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultCard({
  result,
  index,
  retrieverType,
  showRawScore,
  isCopied,
  onCopy,
  onClick,
}: {
  result: RetrieverResult;
  index: number;
  retrieverType: RetrieverType;
  showRawScore: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onClick?: () => void;
}) {
  const config = retrieverConfig[retrieverType];

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-3 space-y-2',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded text-xs font-medium',
              config.bgColor,
              config.color
            )}
          >
            {index + 1}
          </span>
          {result.metadata.title && (
            <span className="font-medium text-sm truncate max-w-[200px]">
              {result.metadata.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Score */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Progress
                  value={result.normalizedScore}
                  className="w-12 h-1.5"
                />
                <span
                  className={cn(
                    'text-xs font-mono font-medium',
                    getScoreColor(result.normalizedScore)
                  )}
                >
                  {result.normalizedScore}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Score: {result.normalizedScore}/100
              {showRawScore && (
                <div className="text-xs text-muted-foreground">
                  Raw: {result.score.toFixed(6)}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {result.metadata.source && (
            <Badge variant="outline" className="text-xs">
              {result.metadata.source}
            </Badge>
          )}
          {result.metadata.timestamp && (
            <span>
              {new Date(result.metadata.timestamp).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy content</TooltipContent>
          </Tooltip>
          {result.metadata.url && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={result.metadata.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open source</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

export type {
  RetrieverType,
  RetrieverResult,
  RetrieverData,
  VitalRetrieverResultsProps,
};
