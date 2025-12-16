/**
 * StreamingChatMessage Component
 * 
 * Renders a chat message with streaming support, including:
 * - Token-by-token rendering animation
 * - Thinking steps display for Mode 3/4
 * - Citation display
 * - Loading states
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Brain,
  User,
  Bot,
  Sparkles,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ChatMessage } from '../hooks/useStreamingChat';

interface StreamingChatMessageProps {
  message: ChatMessage;
  agentName?: string;
  agentAvatar?: string;
  showThinking?: boolean;
  className?: string;
}

export function StreamingChatMessage({
  message,
  agentName = 'AI Assistant',
  agentAvatar,
  showThinking = true,
  className,
}: StreamingChatMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedThinking, setExpandedThinking] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState(false);

  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const thinking = message.metadata?.thinking || [];
  const citations = message.metadata?.citations || [];
  const mode = message.metadata?.mode;

  // Auto-scroll when streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [message.content, isStreaming]);

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={agentAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col gap-2 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{isUser ? 'You' : agentName}</span>
          {mode && (
            <Badge variant="outline" className="text-xs">
              Mode {mode}
            </Badge>
          )}
          {isStreaming && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Streaming
            </Badge>
          )}
        </div>

        {/* Thinking Steps (for Mode 3/4) */}
        {showThinking && thinking.length > 0 && (
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <button
              onClick={() => setExpandedThinking(!expandedThinking)}
              className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300 w-full"
            >
              <Brain className="h-4 w-4" />
              <span>Reasoning Steps ({thinking.length})</span>
              {expandedThinking ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
            </button>
            
            {expandedThinking && (
              <div className="mt-2 space-y-1">
                {thinking.map((step, index) => (
                  <div
                    key={index}
                    className="text-xs text-amber-600 dark:text-amber-400 pl-6"
                  >
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Main Content */}
        <Card
          ref={contentRef}
          className={cn(
            'p-4 max-w-full overflow-hidden',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
          
          {/* Loading state for empty streaming message */}
          {isStreaming && !message.content && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </Card>

        {/* Citations */}
        {citations.length > 0 && (
          <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <button
              onClick={() => setExpandedCitations(!expandedCitations)}
              className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 w-full"
            >
              <BookOpen className="h-4 w-4" />
              <span>Sources ({citations.length})</span>
              {expandedCitations ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
            </button>
            
            {expandedCitations && (
              <div className="mt-2 space-y-2">
                {citations.map((citation, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 bg-white dark:bg-neutral-900 rounded border"
                  >
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      [{index + 1}] {citation.source}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {citation.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString()}
          {message.metadata?.tokens && (
            <span className="ml-2">• {message.metadata.tokens} tokens</span>
          )}
        </div>
      </div>
    </div>
  );
}










