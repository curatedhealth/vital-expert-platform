'use client';

import React from 'react';
import { User, Bot, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  isLoading?: boolean;
  error?: boolean;
  metadata?: {
    agent?: {
      name: string;
      display_name?: string;
    };
    reasoning?: string[];
  };
}

interface MessageBubbleProps {
  message: Message;
  isLastMessage?: boolean;
  isLoading?: boolean;
  agent?: any; // Agent object for assistant messages
}

export const MessageBubble = React.memo(({ message, isLastMessage, isLoading, agent }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isError = message.error;
  const isProcessing = isLoading || message.isLoading;

  const getStatusIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
    }
    if (isError) {
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
    if (isAssistant && !isProcessing) {
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    }
    return null;
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI Assistant Avatar - only on the left */}
      {!isUser && (
        <div className="h-8 w-8 flex-shrink-0" key="ai-avatar">
          {agent ? (
            <AgentAvatar 
              agent={agent} 
              size="sm" 
              className="rounded-full"
            />
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src="" 
                alt="AI Assistant" 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                AI
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Agent info for assistant messages */}
        {isAssistant && message.metadata?.agent && (
          <div className="mb-1">
            <Badge variant="outline" className="text-xs">
              {message.metadata.agent.display_name || message.metadata.agent.name}
            </Badge>
          </div>
        )}

        {/* Message content */}
        <Card className={cn(
          "px-4 py-3",
          isUser 
            ? "bg-blue-600 text-white" 
            : isError 
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-gray-50 border-gray-200",
          isProcessing && "animate-pulse"
        )}>
          <CardContent className="p-0">
            <div className="whitespace-pre-wrap text-sm">
              {message.content || (isProcessing ? 'Thinking...' : '')}
            </div>
          </CardContent>
        </Card>

        {/* Timestamp and status */}
        <div className={cn(
          "flex items-center gap-2 mt-1 text-xs text-gray-500",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTimestamp(message.timestamp)}</span>
          {getStatusIcon()}
        </div>
      </div>

      {/* User Avatar - only on the right */}
      {isUser && (
        <div className="h-8 w-8 flex-shrink-0" key="user-avatar">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src="" 
              alt="User" 
            />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content &&
         prevProps.isLoading === nextProps.isLoading;
});