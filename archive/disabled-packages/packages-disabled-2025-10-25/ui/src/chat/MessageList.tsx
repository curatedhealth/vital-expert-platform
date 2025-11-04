/**
 * MessageList - Chat Messages Display Component
 * Renders messages with healthcare-specific features like citations, compliance indicators
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Copy,
  RotateCcw,
  Share,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Shield,
  Clock,
  Activity
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type { Message } from '@/types/chat.types';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRegenerateResponse: (messageId: string) => void;
  onBranchChange: (messageId: string, branchIndex: number) => void;
}

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const MessageBubble: React.FC<{
  message: Message;
  onRegenerateResponse: (messageId: string) => void;
  onBranchChange: (messageId: string, branchIndex: number) => void;
}> = ({ message, onRegenerateResponse, onBranchChange }) => {

    navigator.clipboard.writeText(message.content);
  };

    // TODO: Implement sharing functionality
    // };

    // TODO: Implement feedback functionality
    // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div className={cn(
        "flex gap-4 max-w-4xl",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
              ? "bg-yellow-100 text-yellow-700"
              : "bg-muted"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : isSystem ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex-1 space-y-2",
          isUser ? "items-end" : "items-start"
        )}>
          {/* Message Header */}
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="font-medium">
              {isUser ? 'You' : message.agent?.name || 'VITAL Path AI'}
            </span>
            <span>{formatTimestamp(message.timestamp)}</span>
            {message.metadata?.complianceChecked && (
              <Tooltip>
                <TooltipTrigger>
                  <Shield className="h-3 w-3 text-green-600" />
                </TooltipTrigger>
                <TooltipContent>HIPAA Compliance Verified</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Message Bubble */}
          <div className={cn(
            "rounded-2xl px-4 py-3 max-w-none prose prose-sm",
            isUser
              ? "bg-primary text-primary-foreground ml-8"
              : isSystem
                ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                : "bg-muted"
          )}>
            {/* Agent Badge */}
            {message.agent && !isUser && (
              <div className="flex items-center gap-2 mb-3 not-prose">
                <Badge variant="outline" className="text-xs">
                  {message.agent.specialty}
                </Badge>
                {message.metadata?.confidenceScore && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(message.metadata.confidenceScore * 100)}% confidence
                  </Badge>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-4 not-prose">
                <div className="text-xs font-medium text-muted-foreground mb-2">References:</div>
                <div className="space-y-2">
                  {message.citations.map((citation) => (
                    <div
                      key={citation.id}
                      className="text-xs p-2 bg-background/50 rounded border"
                    >
                      <div className="font-medium">[{citation.number}] {citation.title}</div>
                      <div className="text-muted-foreground">
                        {citation.authors.join(', ')} • {citation.year}
                        {citation.journal && ` • ${citation.journal}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regulatory Flags */}
            {message.metadata?.regulatoryFlags && message.metadata.regulatoryFlags.length > 0 && (
              <div className="mt-3 not-prose">
                <div className="flex flex-wrap gap-2">
                  {message.metadata.regulatoryFlags.map((flag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!isUser && (
            <div className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
              "text-muted-foreground"
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy message</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerateResponse(message.id)}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate response</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 px-2"
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share message</TooltipContent>
              </Tooltip>

              <div className="w-px h-4 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('positive')}
                    className="h-8 px-2"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Good response</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback('negative')}
                    className="h-8 px-2"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Poor response</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Processing Metadata */}
          {message.metadata && !isUser && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-4">
                {message.metadata.processingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{message.metadata.processingTime}ms</span>
                  </div>
                )}
                {message.metadata.tokensUsed && (
                  <span>{message.metadata.tokensUsed} tokens</span>
                )}
                {message.metadata.model && (
                  <span>via {message.metadata.model}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LoadingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 max-w-4xl mr-auto"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <Bot className="h-4 w-4" />
    </div>

    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">VITAL Path AI</span>
        <Activity className="h-3 w-3 animate-pulse" />
      </div>

      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
          </div>
          <span>AI experts analyzing your query...</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onRegenerateResponse,
  onBranchChange
}) => {
  return (
    <div className="space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerateResponse={onRegenerateResponse}
            onBranchChange={onBranchChange}
          />
        ))}

        {isLoading && <LoadingIndicator />}
      </AnimatePresence>

      {messages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Start a conversation with VITAL Path AI
          </p>
        </div>
      )}
    </div>
  );
};