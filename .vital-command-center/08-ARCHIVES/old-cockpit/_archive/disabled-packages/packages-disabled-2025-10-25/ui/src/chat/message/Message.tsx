/**
 * Enhanced Message Component with Branch Navigation
 * World-class message system supporting multiple response variations
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Clock,
  Zap
} from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type { Message as MessageType, Agent } from '@/types/chat.types';

import { CollaborationPanel } from '../agents/CollaborationPanel';
import { Citations } from '../response/Citations';
import { Sources } from '../response/Sources';
import { StreamingMarkdown } from '../response/StreamingMarkdown';

import { MessageActions } from './MessageActions';
import { MessageStatus } from './MessageStatus';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
  onBranchChange?: (branchIndex: number) => void;
  onRegenerateResponse?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onShare?: (message: MessageType) => void;
  onFeedback?: (messageId: string, feedback: { rating: number; helpful: boolean; comment?: string }) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

  messageAppear: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  branchSwitch: {
    exit: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    transition: { duration: 0.2 }
  },
  thinkingPulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

const Message: React.FC<MessageProps> = ({
  message,
  isLast = false,
  onBranchChange,
  onRegenerateResponse,
  onCopy,
  onShare,
  onFeedback,
  onEditMessage
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullReasoning, setShowFullReasoning] = useState(false);

    if (message.currentBranch > 0) {
      onBranchChange?.(message.currentBranch - 1);
    }
  }, [message.currentBranch, onBranchChange]);

    if (message.currentBranch < message.branches.length - 1) {
      onBranchChange?.(message.currentBranch + 1);
    }
  }, [message.currentBranch, message.branches.length, onBranchChange]);

    onCopy?.(content);
  }, [currentBranch, message.content, onCopy]);

    if (!agent) return null;

    const iconMap: Record<string, string> = {
      'digital-therapeutics-expert': '💊',
      'fda-regulatory-strategist': '🏛️',
      'clinical-trial-designer': '🔬',
      'medical-safety-officer': '🛡️',
      'ai-ml-clinical-specialist': '🤖'
    };

    return iconMap[agent.type] || '👨‍⚕️';
  };

    if (!ms) return null;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      ref={messageRef}
      className={cn(
        "group mb-6 flex items-start space-x-4",
        isUser && "flex-row-reverse space-x-reverse",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...animations.messageAppear}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0",
        isUser ? "order-2" : "order-1"
      )}>
        <Avatar className={cn(
          "h-8 w-8 border-2 transition-all duration-200",
          isUser ? "border-primary" : "border-muted",
          message.status === 'thinking' && "animate-pulse"
        )}>
          <AvatarFallback className={cn(
            "text-xs font-medium",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {isUser ? "U" : getAgentIcon(message.agent) || "AI"}
          </AvatarFallback>
          {message.agent?.icon && (
            <AvatarImage src={message.agent.icon} alt={message.agent.name} />
          )}
        </Avatar>

        {/* Status indicator */}
        {message.status === 'thinking' && (
          <motion.div
            className="mt-1 h-2 w-2 bg-blue-500 rounded-full mx-auto"
            {...animations.thinkingPulse}
          />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "flex-1 space-y-2 min-w-0",
        isUser ? "order-1" : "order-2"
      )}>
        {/* Header with agent info and timestamp */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser ? "justify-end" : "justify-start"
        )}>
          {message.agent && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {message.agent.name}
              </Badge>
              {message.agent.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round(message.agent.confidence * 100)}% confident
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>

          {message.responseTime && (
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {formatResponseTime(message.responseTime)}
            </div>
          )}
        </div>

        {/* Branch navigation */}
        {hasBranches && (
          <div className={cn(
            "flex items-center gap-2 py-1",
            isUser ? "justify-end" : "justify-start"
          )}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevBranch}
                    disabled={message.currentBranch === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous response</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-xs text-muted-foreground">
              {message.currentBranch + 1} of {message.branches.length}
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextBranch}
                    disabled={message.currentBranch >= message.branches.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next response</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerateResponse?.(message.id)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate new response</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Message bubble */}
        <Card className={cn(
          "relative transition-all duration-200",
          isUser ? "bg-primary text-primary-foreground ml-12" : "bg-card mr-12",
          isHovered && "shadow-md",
          message.status === 'error' && "border-destructive"
        )}>
          <CardContent className="p-4">
            {/* Thinking/Reasoning indicator */}
            {message.reasoning && (
              <div className="mb-3 p-2 bg-muted/30 rounded-md border-l-2 border-blue-500">
                <button
                  onClick={() => setShowFullReasoning(!showFullReasoning)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  {showFullReasoning ? 'Hide reasoning' : 'Show reasoning'}
                </button>

                <AnimatePresence>
                  {showFullReasoning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 text-sm text-muted-foreground"
                    >
                      {message.reasoning}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Message status */}
            <MessageStatus
              status={message.status}
              loadingStage={message.loadingStage}
              isStreaming={message.status === 'streaming'}
            />

            {/* Main content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${message.id}-${message.currentBranch}`}
                {...animations.branchSwitch}
              >
                <StreamingMarkdown
                  content={currentBranch?.content || message.content}
                  isStreaming={message.status === 'streaming'}
                  citations={currentBranch?.citations || message.citations}
                  className={cn(
                    "prose prose-sm max-w-none",
                    isUser ? "prose-invert" : "prose-slate dark:prose-invert"
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {/* Collaboration panel for multi-agent messages */}
            {message.isCollaborative && message.collaborationState && (
              <div className="mt-4">
                <CollaborationPanel
                  state={message.collaborationState}
                  consensus={message.consensus}
                />
              </div>
            )}

            {/* Citations */}
            {(currentBranch?.citations?.length || message.citations?.length) ? (
              <div className="mt-4">
                <Citations
                  citations={currentBranch?.citations || message.citations || []}
                />
              </div>
            ) : null}

            {/* Sources */}
            {(currentBranch?.sources?.length || message.sources?.length) ? (
              <div className="mt-3">
                <Sources
                  sources={currentBranch?.sources || message.sources || []}
                />
              </div>
            ) : null}

            {/* User feedback for assistant messages */}
            {!isUser && message.status === 'completed' && (
              <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.(message.id, { rating: 1, helpful: true })}
                  className="h-6 w-6 p-0"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.(message.id, { rating: -1, helpful: false })}
                  className="h-6 w-6 p-0"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>

          {/* Message actions - shown on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute top-2 flex items-center gap-1 p-1 bg-background border rounded-md shadow-sm",
                  isUser ? "left-2" : "right-2"
                )}
              >
                <MessageActions
                  message={message}
                  onCopy={handleCopyContent}
                  onShare={() => onShare?.(message)}
                  onEdit={onEditMessage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Branch quality indicators */}
        {hasBranches && currentBranch && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}>
            {currentBranch.confidence && (
              <span>Confidence: {Math.round(currentBranch.confidence * 100)}%</span>
            )}
            {currentBranch.userRating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{currentBranch.userRating}/5</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;