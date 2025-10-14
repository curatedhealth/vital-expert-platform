'use client';

import React from 'react';
import { User, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat.types';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  // AUDIT FIX: Safe JSON parsing
  const parseMetadata = (metadata: any) => {
    try {
      return typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
    } catch {
      return {};
    }
  };

  const metadata = parseMetadata(message.metadata);
  const agent = metadata?.agent || metadata?.selectedAgent;

  return (
    <div className={cn(
      "flex gap-3",
      isUser && "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-600 text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="w-8 h-8">
            <AvatarImage 
              src={agent?.avatarUrl || agent?.avatar || ''} 
              alt={agent?.display_name || agent?.name || 'AI Agent'} 
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser && "flex flex-col items-end"
      )}>
        {/* Agent Info for Assistant Messages */}
        {isAssistant && agent && (
          <div className="mb-1">
            <Badge variant="secondary" className="text-xs">
              {agent.display_name || agent.name}
            </Badge>
          </div>
        )}

        {/* Message Card */}
        <Card className={cn(
          "max-w-[80%]",
          isUser && "bg-blue-600 text-white",
          isAssistant && "bg-white border",
          isSystem && "bg-gray-100 border-gray-200"
        )}>
          <CardContent className="p-3">
            {/* Loading State */}
            {message.isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            {/* Error State */}
            {message.error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error: {message.error}</span>
              </div>
            )}

            {/* Content */}
            {message.content && (
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className={cn(
                    "mb-2 last:mb-0",
                    isUser && "text-white"
                  )}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Success State */}
            {!message.isLoading && !message.error && message.content && (
              <div className="flex items-center justify-end mt-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamp */}
        <div className={cn(
          "text-xs text-gray-500 mt-1",
          isUser && "text-right"
        )}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
