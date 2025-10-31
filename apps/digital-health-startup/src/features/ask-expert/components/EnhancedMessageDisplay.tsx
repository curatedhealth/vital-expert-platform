'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Edit,
  ExternalLink, ChevronDown, ChevronUp,
  Sparkles, BookOpen, AlertCircle, Info, Bookmark, Share2, Wrench, GitBranch
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import { AgentAvatar } from '@vital/ui';
import { Avatar, AvatarFallback } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';
import { Response as AIResponse } from '@/components/ai/response';
import {
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai/sources';
import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
} from '@/components/ai/branch';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselControls,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationQuote,
  InlineCitationSource,
} from '@/components/ai/inline-citation';
import type { Components } from 'react-markdown';
import type { PluggableList } from 'unified';

interface Source {
  id: string;
  title: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  url?: string;
  metadata?: Record<string, any>;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D'; // A=high quality, B=good, C=moderate, D=low
  sourceType?: 'fda_guidance' | 'clinical_trial' | 'research_paper' | 'regulatory_filing' | 'company_document' | 'other';
  organization?: string;
  reliabilityScore?: number; // 0-1
  lastUpdated?: Date | string;
}

interface Citation {
  number: number;
  text: string;
  sourceId?: string;
  sources?: Source[];
}

interface MessageBranch {
  id: string;
  content: string;
  confidence: number;
  citations?: Citation[];
  sources?: Source[];
  createdAt: Date;
  reasoning?: string;
}

interface MessageMetadata {
  sources?: Source[];
  citations?: Citation[];
  ragSummary?: {
    totalSources: number;
    strategy?: string;
    domains?: string[];
    cacheHit?: boolean;
    warning?: string;
    retrievalTimeMs?: number;
  };
  toolSummary?: {
    allowed: string[];
    used: string[];
    totals: {
      calls: number;
      success: number;
      failure: number;
      totalTimeMs: number;
    };
  };
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  confidence?: number;
  reasoning?: string[];
  artifacts?: any[];
}

interface EnhancedMessageDisplayProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
  agentName?: string;
  agentAvatar?: string;
  isStreaming?: boolean;
  branches?: MessageBranch[];
  currentBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onEdit?: () => void;
  className?: string;
  allowRegenerate?: boolean;
}

function createInlineCitationRemarkPlugin(citationMap: Map<number, Source[]>) {
  return function inlineCitations() {
    return function transformer(tree: any) {
      transformNode(tree);
    };
  };

  function transformNode(node: any) {
    if (!node || !Array.isArray(node.children)) {
      return;
    }

    if (['link', 'code', 'inlineCode', 'image'].includes(node.type)) {
      return;
    }

    const transformed: any[] = [];

    node.children.forEach((child: any) => {
      if (child?.type === 'citation') {
        transformed.push(child);
        return;
      }

      if (child?.type === 'text' && typeof child.value === 'string') {
        const value = child.value;
        const regex = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(value)) !== null) {
          const preceding = value.slice(lastIndex, match.index);
          if (preceding) {
            transformed.push({ type: 'text', value: preceding });
          }

          const numbers = match[1]
            .split(',')
            .map((part) => parseInt(part.trim(), 10))
            .filter((num) => Number.isFinite(num));

          const needsLeadingSpace = (() => {
            if (transformed.length === 0) {
              return true;
            }
            const last = transformed[transformed.length - 1];
            return last.type !== 'text' || !/\s$/.test(last.value as string);
          })();

          if (needsLeadingSpace) {
            if (
              transformed.length > 0 &&
              transformed[transformed.length - 1].type === 'text'
            ) {
              transformed[transformed.length - 1].value += ' ';
            } else {
              transformed.push({ type: 'text', value: ' ' });
            }
          }

          numbers.forEach((number, idx) => {
            const sources = citationMap.get(number) ?? [];
            if (sources.length === 0) {
              transformed.push({ type: 'text', value: `[${number}]` });
            } else {
              transformed.push({
                type: 'citation',
                data: {
                  citationNumber: String(number),
                  sources,
                  hName: 'citation',
                  hProperties: {
                    citationNumber: String(number),
                    sources,
                  },
                },
                children: [],
              });
            }

            if (idx < numbers.length - 1) {
              transformed.push({ type: 'text', value: ' ' });
            }
          });

          lastIndex = match.index + match[0].length;
        }

        const trailing = value.slice(lastIndex);
        if (trailing) {
          transformed.push({ type: 'text', value: trailing });
        }
      } else {
        transformNode(child);
        transformed.push(child);
      }
    });

    node.children = transformed;
  }
}

function deriveSourceTag(source: Source | undefined): string | null {
  if (!source) {
    return null;
  }

  const domain = source.domain || source.metadata?.domain;
  const organization = source.organization || source.metadata?.organization;
  const collection = source.metadata?.collection || source.metadata?.dataset;
  const provider = source.metadata?.provider || source.metadata?.sourceName;

  const normalize = (value: string) =>
    value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();

  if (collection && /digital\s*health/i.test(collection)) {
    return 'Digital Health';
  }

  if (provider) {
    if (/digital\s*health/i.test(provider)) {
      return 'Digital Health';
    }
    return normalize(provider);
  }

  if (domain) {
    if (/digital\s*health/i.test(domain)) {
      return 'Digital Health';
    }
    return normalize(domain);
  }

  if (organization) {
    return normalize(organization);
  }

  if (source.url) {
    try {
      const hostname = new URL(source.url).hostname.replace(/^www\./, '');
      if (hostname) {
        return normalize(hostname.split('.')[0]);
      }
    } catch {
      // ignore
    }
  }

  if (source.sourceType) {
    return normalize(source.sourceType);
  }

  return null;
}

export function EnhancedMessageDisplay({
  id,
  role,
  content,
  timestamp,
  metadata,
  agentName,
  agentAvatar,
  isStreaming = false,
  branches,
  currentBranch = 0,
  onBranchChange,
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit,
  className,
  allowRegenerate = true,
}: EnhancedMessageDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [activeBranch, setActiveBranch] = useState(currentBranch);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const messageRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isUser = role === 'user';

  const resolvedAgentName = useMemo(() => {
    if (isUser) {
      return 'You';
    }
    if (!agentName) {
      return 'AI Assistant';
    }
    if (/\s/.test(agentName)) {
      return agentName.trim();
    }
    const cleaned = agentName.replace(/[_-]+/g, ' ').trim();
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  }, [agentName, isUser]);

  // Get active branch content or fallback to main content
  const displayContent = branches && branches[activeBranch] 
    ? branches[activeBranch].content 
    : content;

  useEffect(() => {
    setActiveBranch(currentBranch);
  }, [currentBranch]);

  const handleBranchChange = useCallback((index: number) => {
    setActiveBranch(index);
    onBranchChange?.(index);
  }, [onBranchChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }, [displayContent, onCopy]);

  const handleFeedback = useCallback((type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback?.(type);
  }, [onFeedback]);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    if (!displayContent) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: resolvedAgentName || 'VITAL Expert Response',
          text: displayContent,
        });
      } else {
        await navigator.clipboard.writeText(displayContent);
      }
      setShareStatus('success');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (error) {
      console.error('[EnhancedMessageDisplay] Share failed:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  }, [displayContent, resolvedAgentName]);

  const formatTimestamp = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const keyInsightKeywords = useMemo(
    () => ['key insight', 'key takeaway', 'important', 'critical', 'must', 'note that', 'remember'],
    []
  );

  const keyInsights = useMemo(() => {
    if (isUser) {
      return [];
    }
    const sentences = displayContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    return sentences
      .filter((sentence) =>
        keyInsightKeywords.some((keyword) =>
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 3);
  }, [displayContent, isUser, keyInsightKeywords]);

  const activeBranchMeta = branches?.[activeBranch];
  const showBranchSelector = !isUser && Array.isArray(branches) && branches.length > 1;
  const ragSummary = metadata?.ragSummary;
  const toolSummary = metadata?.toolSummary;
  const toolTotals = toolSummary?.totals ?? { calls: 0, success: 0, failure: 0, totalTimeMs: 0 };
  const toolUsed = toolSummary?.used ?? [];
  const hasToolUsage = !!toolSummary && (toolTotals.calls > 0 || toolUsed.length > 0);

  const scrollToSource = useCallback((sourceId: string) => {
    requestAnimationFrame(() => {
      const element = sourceRefs.current[sourceId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-blue-400');
        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-400'), 1200);
      }
    });
  }, []);

  const citationSources = metadata?.sources ?? [];

  const citationNumberMap = useMemo(() => {
    const map = new Map<number, Source[]>();

    citationSources.forEach((source, index) => {
      if (source) {
        map.set(index + 1, [source]);
      }
    });

    metadata?.citations?.forEach((citation) => {
      const number = citation.number;
      if (!Number.isFinite(number)) {
        return;
      }

      const bucket = map.get(number) ?? [];
      const addSource = (candidate?: Source) => {
        if (!candidate) {
          return;
        }
        if (!bucket.some((existing) => existing?.id === candidate.id && existing?.url === candidate.url)) {
          bucket.push(candidate);
        }
      };

      if (citation.sourceId) {
        const resolvedById = citationSources.find((source) => source?.id === citation.sourceId);
        addSource(resolvedById);
      }

      if (Array.isArray(citation.sources)) {
        citation.sources.forEach(addSource);
      }

      // Fallback to sequential source list if nothing matched
      if (!bucket.length) {
        addSource(citationSources[number - 1]);
      }

      if (bucket.length) {
        map.set(number, bucket);
      }
    });

    return map;
  }, [citationSources, metadata?.citations]);

  const normalizedContent = useMemo(() => {
    if (!displayContent) {
      return displayContent;
    }

    let text = displayContent;

    text = text.replace(/\[\s*Source\s+([\d,\s]+)\s*\]/gi, '[$1]');
    text = text.replace(/\((?:source|Source)\s+([\d,\s]+)\)/gi, '[$1]');
    text = text.replace(/Source\s+([\d,\s]+)/gi, '[$1]');

    text = text.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');

    return text;
  }, [displayContent]);

  const citationRemarkPlugins = useMemo<PluggableList | undefined>(() => {
    if (!citationSources.length) {
      return undefined;
    }
    return [createInlineCitationRemarkPlugin(citationNumberMap)];
  }, [citationNumberMap]);

  const citationComponents = useMemo<Partial<Components>>(() => ({
    citation({ node }) {
      const data = (node as any)?.data ?? {};
      const props = data.hProperties ?? data;
      const number = props.citationNumber as string | undefined;
      const sources: Source[] = Array.isArray(props.sources)
        ? props.sources
        : Array.isArray(data.sources)
          ? data.sources
          : [];
      const primarySourceId: string | undefined = sources[0]?.id;
      const triggerLabel =
        sources
          .map((src) => deriveSourceTag(src))
          .find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? undefined;

      if (!sources.length) {
        return <sup className="text-blue-600">[{number || '?'}]</sup>;
      }

      return (
        <InlineCitation>
          <span className="text-blue-600">[{number || '?'}]</span>
          <InlineCitationCard>
            <InlineCitationCardTrigger
              sources={sources.map((source) => source.url || '')}
              label={triggerLabel}
              onClick={() => {
                if (primarySourceId) {
                  scrollToSource(primarySourceId);
                }
              }}
            />
            <InlineCitationCardBody>
              <InlineCitationCarousel>
                <InlineCitationCarouselHeader>
                  <InlineCitationCarouselIndex />
                  <InlineCitationCarouselControls />
                </InlineCitationCarouselHeader>
                <InlineCitationCarouselContent>
                  {sources.map((source, idx) => (
                    <InlineCitationCarouselItem key={source.id || idx}>
                      <InlineCitationSource
                        title={source.title || `Source ${number || idx + 1}`}
                        url={source.url || '#'}
                        description={source.excerpt || source.organization || source.domain || undefined}
                        tag={deriveSourceTag(source)}
                      />
                      {source.excerpt && (
                        <InlineCitationQuote>{source.excerpt}</InlineCitationQuote>
                      )}
                    </InlineCitationCarouselItem>
                  ))}
                </InlineCitationCarouselContent>
              </InlineCitationCarousel>
            </InlineCitationCardBody>
          </InlineCitationCard>
        </InlineCitation>
      );
    },
  }), [scrollToSource, citationNumberMap]);

  useEffect(() => {
    setShareStatus('idle');
    setCopied(false);
  }, [id, activeBranch, displayContent]);

  const canShowRegenerate = !!onRegenerate && allowRegenerate && !isUser;
  const showFeedbackControls = !!onFeedback && !isUser;
  const showShare = !isUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative",
        isUser ? "flex justify-end" : "flex justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-3xl rounded-2xl px-5 py-4 transition-colors",
          isUser
            ? "bg-white text-gray-900 shadow-none"
            : "bg-white text-gray-900 shadow-sm"
        )}
      >
        {/* Message Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="mt-0.5">
            {isUser ? (
              <Avatar className="h-8 w-8 bg-gray-200 text-gray-700">
                <AvatarFallback>
                  {resolvedAgentName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <AgentAvatar
                avatar={agentAvatar}
                name={resolvedAgentName}
                size="list"
                className="rounded-full"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isUser ? "text-gray-900" : "text-gray-900"
                  )}
                >
                  {resolvedAgentName}
                </span>
                {!isUser && metadata?.confidence && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(metadata.confidence * 100)}% confident
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI confidence in this response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatTimestamp(timestamp)}
              </span>
            </div>

            {/* Reasoning Section */}
            {!isUser && metadata?.reasoning && metadata.reasoning.length > 0 && (
              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-xs mb-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {showReasoning ? 'Hide' : 'Show'} AI Reasoning
                  {showReasoning ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>

                <AnimatePresence>
                  {showReasoning && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      {metadata.reasoning.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg bg-white/90 p-2 text-xs text-gray-700 dark:bg-gray-800/70 dark:text-gray-200"
                        >
                          <Info className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Message Content */}
            <div ref={messageRef}>
              {isUser ? (
                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                  {displayContent}
                </div>
              ) : (
                <AIResponse
                  className={cn(
                    'prose prose-sm max-w-none dark:prose-invert leading-relaxed text-gray-800'
                  )}
                  remarkPlugins={citationRemarkPlugins}
                  components={citationComponents}
                >
                  {normalizedContent}
                </AIResponse>
              )}

              {isStreaming && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm"
                />
              )}
            </div>

            {/* Inline citations now rendered in-line; no separate block required */}

            {showBranchSelector && branches && (
              <Branch
                className="mt-3"
                currentBranch={activeBranch}
                totalBranches={branches.length}
                onBranchChange={handleBranchChange}
              >
                <BranchMessages className="hidden">
                  {branches.map((branch) => (
                    <span key={branch.id} />
                  ))}
                </BranchMessages>
                <BranchSelector
                  from="assistant"
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5 text-blue-500 dark:text-blue-300" />
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        Alternate responses
                      </span>
                      <BranchPage className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800/60 dark:text-gray-200" />
                    </div>
                    <div className="flex items-center gap-1">
                      <BranchPrevious className="h-7 w-7 rounded-full border border-gray-200 bg-white p-0 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200" />
                      <BranchNext className="h-7 w-7 rounded-full border border-gray-200 bg-white p-0 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200" />
                    </div>
                  </div>
                  {(activeBranchMeta?.confidence !== undefined || activeBranchMeta?.createdAt) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 dark:text-gray-300">
                      {activeBranchMeta?.confidence !== undefined && (
                        <span>
                          Confidence {Math.round(activeBranchMeta.confidence * 100)}%
                        </span>
                      )}
                      {activeBranchMeta?.createdAt && (
                        <span>
                          Generated {new Date(activeBranchMeta.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}
                </BranchSelector>
              </Branch>
            )}

            {!isUser && ragSummary && metadata?.sources && metadata.sources.length > 0 && (
              <Sources
                className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 text-xs dark:border-gray-700 dark:bg-gray-900/40"
                sources={metadata.sources.map((source, index) => ({
                  id: source.id || `source-${index}`,
                  title: source.title || `Source ${index + 1}`,
                  url: source.url,
                  excerpt: source.excerpt,
                  similarity: source.similarity,
                }))}
              >
                <SourcesTrigger className="px-4 py-3 text-blue-700 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    <span>
                      Evidence summary: {ragSummary.totalSources ?? metadata.sources.length} source
                      {(ragSummary.totalSources ?? metadata.sources.length) === 1 ? '' : 's'}
                      {ragSummary.strategy ? ` • ${ragSummary.strategy}` : ''}
                    </span>
                    {typeof ragSummary.retrievalTimeMs === 'number' && (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {Math.round(ragSummary.retrievalTimeMs)} ms
                      </span>
                    )}
                    {ragSummary.cacheHit && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        Cache hit
                      </span>
                    )}
                  </div>
                </SourcesTrigger>
                <SourcesContent className="bg-white/95">
                  {Array.isArray(ragSummary.domains) && ragSummary.domains.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      {Array.from(new Set(ragSummary.domains.filter(Boolean))).map((domain) => (
                        <span
                          key={domain as string}
                          className="rounded-full border border-gray-200 bg-white px-2 py-0.5 dark:border-gray-600 dark:bg-gray-900/70"
                        >
                          {domain as string}
                        </span>
                      ))}
                    </div>
                  )}
                  {(ragSummary.warning || (!ragSummary.totalSources || ragSummary.totalSources === 0)) && (
                    <div className="mb-3 flex items-start gap-2 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span>{ragSummary.warning || 'Evidence required: add supporting documents, broaden the query, or explicitly allow model-only answers.'}</span>
                    </div>
                  )}
                  <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    {metadata.sources.map((source, idx) => {
                      const evidenceLevelConfig = {
                        A: { badge: 'bg-green-100 text-green-700 border-green-200', label: 'High quality' },
                        B: { badge: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Good' },
                        C: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Moderate' },
                        D: { badge: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Low' },
                      } as const;

                      const evidenceConfig = source.evidenceLevel
                        ? evidenceLevelConfig[source.evidenceLevel as keyof typeof evidenceLevelConfig] ?? {
                            badge: 'bg-gray-100 text-gray-600 border-gray-200',
                            label: 'Unrated',
                          }
                        : { badge: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Unrated' };

                      return (
                        <Card
                          key={source.id || `source-${idx}`}
                          ref={(el) => {
                            if (el) {
                              sourceRefs.current[source.id || `source-${idx}`] = el;
                            } else {
                              delete sourceRefs.current[source.id || `source-${idx}`];
                            }
                          }}
                          className="border border-gray-100 bg-white/90 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
                        >
                          <CardContent className="flex flex-col gap-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[11px]">
                                    [{idx + 1}]
                                  </Badge>
                                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {source.title || `Source ${idx + 1}`}
                                  </p>
                                  {(() => {
                                    const tag = deriveSourceTag(source);
                                    if (!tag) {
                                      return null;
                                    }
                                    return (
                                      <Badge variant="secondary" className="text-[11px] bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                        {tag}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                {source.excerpt && (
                                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                                    {source.excerpt}
                                  </p>
                                )}
                              </div>
                              {source.url && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                              {source.sourceType && (
                                <Badge variant="outline" className="text-[11px]">
                                  {source.sourceType.replace(/_/g, ' ')}
                                </Badge>
                              )}
                              {source.organization && (
                                <Badge variant="secondary" className="text-[11px]">
                                  {source.organization}
                                </Badge>
                              )}
                              {source.domain && (
                                <Badge variant="secondary" className="text-[11px]">
                                  {source.domain}
                                </Badge>
                              )}
                              <Badge variant="outline" className={cn('text-[11px]', evidenceConfig.badge)}>
                                {evidenceConfig.label}
                              </Badge>
                              {typeof source.similarity === 'number' && (
                                <span>{Math.round(source.similarity * 100)}% match</span>
                              )}
                              {typeof source.reliabilityScore === 'number' && (
                                <span>Reliability {Math.round(source.reliabilityScore * 100)}%</span>
                              )}
                              {source.lastUpdated && (
                                <span>Updated {new Date(source.lastUpdated).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </SourcesContent>
              </Sources>
            )}

            {!isUser && hasToolUsage && toolSummary && (
              <div className="mt-3 space-y-2 rounded-xl border border-purple-200/60 bg-purple-50/40 p-3 text-xs dark:border-purple-900/60 dark:bg-purple-900/20">
                <div className="flex flex-wrap items-center gap-2 text-purple-700 dark:text-purple-200">
                  <Wrench className="h-3 w-3 flex-shrink-0" />
                  <span className="font-medium">Tool usage</span>
                  <span className="text-[11px] text-purple-600/80 dark:text-purple-200/80">
                    {toolTotals.calls} call{toolTotals.calls === 1 ? '' : 's'} • {toolTotals.success} success / {toolTotals.failure} fail
                    {toolTotals.totalTimeMs ? ` • ${Math.round(toolTotals.totalTimeMs)} ms` : ''}
                  </span>
                </div>
                {toolUsed.length > 0 ? (
                  <div className="flex flex-wrap gap-1 text-[11px] text-purple-700/80 dark:text-purple-200/80">
                    {toolUsed.map((toolName) => (
                      <span
                        key={toolName}
                        className="rounded-full border border-purple-200 bg-white px-2 py-0.5 dark:border-purple-800/60 dark:bg-purple-900/50"
                      >
                        {toolName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-purple-600/80 dark:text-purple-200/80">
                    Tools were invoked but no successful outputs were returned.
                  </div>
                )}
              </div>
            )}

            {/* Key Insights Callout */}
            {!isUser && (keyInsights.length > 0 || (metadata?.confidence ?? 0) > 0.85) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-blue-900 mb-1">Key Insight</h4>
                    {keyInsights.length > 0 ? (
                      <ul className="space-y-1 text-xs text-blue-800 list-disc list-inside">
                        {keyInsights.map((insight, idx) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-blue-800">
                        High confidence response ({Math.round((metadata?.confidence ?? 0) * 100)}%) based on {metadata?.sources?.length || 0} verified source{metadata?.sources && metadata.sources.length !== 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Token Usage */}
            {!isUser && metadata?.sources && metadata.sources.length > 0 && (
              <div className="mt-3 text-xs text-gray-500 flex gap-2">
                <span>Sources cited: {metadata.sources.length}</span>
                {metadata.citations && metadata.citations.length > 0 && (
                  <span>Inline citations: {metadata.citations.length}</span>
                )}
              </div>
            )}

            {!isUser && metadata?.tokenUsage && (
              <div className="mt-3 text-xs text-gray-500">
                Tokens: {metadata.tokenUsage.total.toLocaleString()}
                {' '}
                ({metadata.tokenUsage.prompt.toLocaleString()} prompt +{' '}
                {metadata.tokenUsage.completion.toLocaleString()} completion)
              </div>
            )}
          </div>
        </div>

        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "justify-end" : "justify-start"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "h-7 w-7 p-0",
                    isUser ? "text-blue-100 hover:text-white" : ""
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                      >
                        <Copy className="h-3 w-3" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className={cn(
                    "h-7 w-7 p-0",
                    isFavorite && "text-yellow-500"
                  )}
                  aria-pressed={isFavorite}
                >
                  <Bookmark className={cn(
                    "h-3 w-3",
                    isFavorite && "fill-yellow-500"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? 'Remove from favorites' : 'Save to favorites'}</TooltipContent>
            </Tooltip>

            {showShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-7 w-7 p-0"
                  >
                    {shareStatus === 'success' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : shareStatus === 'error' ? (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    ) : (
                      <Share2 className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {shareStatus === 'success'
                    ? 'Shared!'
                    : shareStatus === 'error'
                      ? 'Share failed'
                      : 'Share response'}
                </TooltipContent>
              </Tooltip>
            )}

            {canShowRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-7 w-7 p-0"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate response</TooltipContent>
              </Tooltip>
            )}

            {showFeedbackControls && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('positive')}
                      className={cn(
                        "h-7 w-7 p-0",
                        feedback === 'positive' && "text-green-600"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Helpful response</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('negative')}
                      className={cn(
                        "h-7 w-7 p-0",
                        feedback === 'negative' && "text-red-600"
                      )}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Not helpful</TooltipContent>
                </Tooltip>
              </>
            )}

            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className={cn(
                      "h-7 w-7 p-0",
                      isUser ? "text-blue-100 hover:text-white" : ""
                    )}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit message</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
}
