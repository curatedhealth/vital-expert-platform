'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Edit,
  FileText, ExternalLink, Code, ChevronDown, ChevronUp,
  Sparkles, BookOpen, AlertCircle, Info, Bookmark, Share2
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { Avatar, AvatarFallback, AvatarImage } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

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
  const [showSources, setShowSources] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [activeBranch, setActiveBranch] = useState(currentBranch);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const messageRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }, [content, onCopy]);

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
          title: agentName || 'VITAL Expert Response',
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
  }, [agentName, displayContent]);

  const formatTimestamp = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const keyInsightKeywords = useMemo(
    () => ['key insight', 'key takeaway', 'important', 'critical', 'must', 'note that', 'remember'],
    []
  );

  const keyInsights = useMemo(() => {
    if (role === 'user') {
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
  }, [displayContent, keyInsightKeywords, role]);

  // Parse content for inline citations like [1], [2]
  const contentWithCitations = useMemo(() => {
    const textToUse = displayContent;
    if (!metadata?.sources || metadata.sources.length === 0) {
      return textToUse;
    }

    return textToUse.replace(/\[(\d+)\]/g, (match, num) => {
      const source = metadata.sources?.[parseInt(num) - 1];
      if (source) {
        return `<sup class="citation-link cursor-pointer text-blue-600" data-source-id="${source.id}">[${num}]</sup>`;
      }
      return match;
    });
  }, [displayContent, metadata?.sources]);

  const scrollToSource = useCallback((sourceId: string) => {
    setShowSources(true);
    requestAnimationFrame(() => {
      const element = sourceRefs.current[sourceId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-blue-400');
        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-400'), 1200);
      }
    });
  }, []);

  useEffect(() => {
    if (!messageRef.current) {
      return;
    }

    const citationElements = Array.from(
      messageRef.current.querySelectorAll<HTMLElement>('.citation-link')
    );

    const handler = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const sourceId = el.dataset.sourceId;
      if (sourceId) {
        scrollToSource(sourceId);
      }
    };

    citationElements.forEach((el) => el.addEventListener('click', handler));

    return () => {
      citationElements.forEach((el) => el.removeEventListener('click', handler));
    };
  }, [contentWithCitations, scrollToSource]);

  useEffect(() => {
    setShareStatus('idle');
    setCopied(false);
  }, [id, activeBranch, displayContent]);

  const canShowRegenerate = !!onRegenerate && allowRegenerate && role !== 'user';
  const showFeedbackControls = !!onFeedback && role !== 'user';
  const showShare = role !== 'user';

  // Custom markdown components
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative group">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-md my-4"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => navigator.clipboard.writeText(String(children))}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm", className)} {...props}>
          {children}
        </code>
      );
    },
    a({ children, href, ...props }: any) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
          {...props}
        >
          {children}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
    table({ children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 border" {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ children, ...props }: any) {
      return (
        <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }: any) {
      return (
        <td className="px-4 py-2 border-t text-sm text-gray-900" {...props}>
          {children}
        </td>
      );
    },
  };

  const isUser = role === 'user';

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
          "max-w-3xl rounded-lg p-4 shadow-sm",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-200"
        )}
      >
        {/* Message Header */}
        <div className="flex items-start gap-3 mb-2">
          {!isUser && agentAvatar && (
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={agentAvatar} />
              <AvatarFallback>{agentName?.[0] || 'AI'}</AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isUser ? "text-blue-100" : "text-gray-900"
                )}>
                  {isUser ? 'You' : agentName || 'AI Assistant'}
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
              <span className={cn(
                "text-xs",
                isUser ? "text-blue-200" : "text-gray-500"
              )}>
                {formatTimestamp(timestamp)}
              </span>
            </div>

            {/* Branch Selector (for assistant messages with multiple branches) */}
            {!isUser && branches && branches.length > 1 && (
              <div className="flex items-center gap-2 mb-3 pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-muted-foreground">Alternatives:</span>
                <div className="flex gap-1">
                  {branches.map((branch, idx) => (
                    <TooltipProvider key={branch.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={activeBranch === idx ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-7 w-7 p-0 text-xs font-medium transition-all",
                              activeBranch === idx && "ring-2 ring-blue-600"
                            )}
                            onClick={() => handleBranchChange(idx)}
                          >
                            {idx + 1}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Branch {idx + 1}</p>
                            {branch.confidence !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Confidence: {Math.round(branch.confidence * 100)}%
                              </p>
                            )}
                            {branch.reasoning && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {branch.reasoning}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}

            {/* Message Content */}
            <div
              ref={messageRef}
              className={cn(
              "prose prose-sm max-w-none",
              isUser ? "prose-invert" : "prose-gray"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {contentWithCitations}
              </ReactMarkdown>

              {isStreaming && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-block w-2 h-4 bg-current ml-1 animate-pulse rounded-sm"
                />
              )}
            </div>

            {/* Reasoning Section */}
            {!isUser && metadata?.reasoning && metadata.reasoning.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-xs"
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
                      className="mt-2 space-y-2"
                    >
                      {metadata.reasoning.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded"
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

            {/* Sources Section */}
            {!isUser && metadata?.sources && metadata.sources.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSources(!showSources)}
                  className="text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  {metadata.sources.length} Source{metadata.sources.length > 1 ? 's' : ''}
                  {showSources ? (
                    <ChevronUp className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  )}
                </Button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-2"
                    >
                      {metadata.sources.map((source, idx) => {
                        // Get evidence level color
                        const evidenceLevelConfig = {
                          'A': { color: 'bg-green-100 text-green-700 border-green-300', label: 'High Quality' },
                          'B': { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Good' },
                          'C': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Moderate' },
                          'D': { color: 'bg-orange-100 text-orange-700 border-orange-300', label: 'Low' },
                        };
                        
                        const evidenceConfig = source.evidenceLevel 
                          ? evidenceLevelConfig[source.evidenceLevel]
                          : { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Unknown' };

                        const sourceTypeConfig: Record<string, { label: string; prefix: string }> = {
                          fda_guidance: { label: 'FDA Guidance', prefix: '🏛️' },
                          clinical_trial: { label: 'Clinical Trial', prefix: '🔬' },
                          research_paper: { label: 'Research Paper', prefix: '📄' },
                          guideline: { label: 'Guideline', prefix: '📋' },
                          regulatory_filing: { label: 'Regulation', prefix: '⚖️' },
                          company_document: { label: 'Company Document', prefix: '🏢' },
                        };

                        const sourceType = source.sourceType ? sourceTypeConfig[source.sourceType] : undefined;

                        return (
                          <Card
                            key={source.id}
                            ref={(el) => {
                              if (el) {
                                sourceRefs.current[source.id] = el;
                              } else {
                                delete sourceRefs.current[source.id];
                              }
                            }}
                            className="overflow-hidden border-l-4 transition-all"
                            style={{
                            borderLeftColor: source.evidenceLevel === 'A' ? '#10b981' :
                                           source.evidenceLevel === 'B' ? '#3b82f6' :
                                           source.evidenceLevel === 'C' ? '#eab308' : '#f97316'
                          }}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs shrink-0">
                                      [{idx + 1}]
                                    </Badge>
                                    <h4 className="text-sm font-medium truncate">
                                      {source.title}
                                    </h4>
                                  </div>

                                  {/* Source Type and Evidence Level */}
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    {sourceType && (
                                      <Badge variant="outline" className={cn("text-xs flex items-center gap-1", evidenceConfig.color)}>
                                        <span>{sourceType.prefix}</span>
                                        <span>{sourceType.label}</span>
                                      </Badge>
                                    )}
                                    {source.evidenceLevel && (
                                      <Badge variant="outline" className={cn("text-xs", evidenceConfig.color)}>
                                        Level {source.evidenceLevel}: {evidenceConfig.label}
                                      </Badge>
                                    )}
                                  </div>

                                  {source.excerpt && (
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                      {source.excerpt}
                                    </p>
                                  )}

                                  {/* Metadata Row */}
                                  <div className="flex items-center gap-2 flex-wrap mt-2">
                                    {source.organization && (
                                      <Badge variant="secondary" className="text-xs">
                                        {source.organization}
                                      </Badge>
                                    )}
                                    {source.domain && (
                                      <Badge variant="secondary" className="text-xs">
                                        {source.domain}
                                      </Badge>
                                    )}
                                    {source.similarity !== undefined && (
                                      <span className="text-xs text-gray-500">
                                        {Math.round(source.similarity * 100)}% match
                                      </span>
                                    )}
                                    {source.reliabilityScore !== undefined && (
                                      <span className="text-xs text-gray-500">
                                        Reliability: {Math.round(source.reliabilityScore * 100)}%
                                      </span>
                                    )}
                                    {source.lastUpdated && (
                                      <span className="text-xs text-gray-500">
                                        Updated: {new Date(source.lastUpdated).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {source.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Key Insights Callout */}
            {!isUser && (keyInsights.length > 0 || (metadata?.confidence ?? 0) > 0.85) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
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
