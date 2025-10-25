'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Edit,
  FileText, ExternalLink, Code, ChevronDown, ChevronUp,
  Sparkles, BookOpen, AlertCircle, Info
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  title: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  url?: string;
  metadata?: Record<string, any>;
}

interface Citation {
  number: number;
  text: string;
  sourceId?: string;
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
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onEdit?: () => void;
  className?: string;
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
  onCopy,
  onRegenerate,
  onFeedback,
  onEdit,
  className
}: EnhancedMessageDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

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

  const formatTimestamp = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Parse content for inline citations like [1], [2]
  const contentWithCitations = useMemo(() => {
    if (!metadata?.sources || metadata.sources.length === 0) {
      return content;
    }

    return content.replace(/\[(\d+)\]/g, (match, num) => {
      const source = metadata.sources?.[parseInt(num) - 1];
      if (source) {
        return `<sup class="citation-link" data-source-id="${source.id}">[${num}]</sup>`;
      }
      return match;
    });
  }, [content, metadata?.sources]);

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

            {/* Message Content */}
            <div className={cn(
              "prose prose-sm max-w-none",
              isUser ? "prose-invert" : "prose-gray"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
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
                      {metadata.sources.map((source, idx) => (
                        <Card key={source.id} className="overflow-hidden">
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
                                {source.excerpt && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {source.excerpt}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {source.domain && (
                                    <Badge variant="secondary" className="text-xs">
                                      {source.domain}
                                    </Badge>
                                  )}
                                  {source.similarity && (
                                    <span className="text-xs text-gray-500">
                                      {Math.round(source.similarity * 100)}% match
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
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy message</TooltipContent>
            </Tooltip>

            {!isUser && onRegenerate && (
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

            {!isUser && onFeedback && (
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
