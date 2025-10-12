'use client';

import React from 'react';

import { StreamingMessage as StreamingMessageType } from '@/hooks/useStreamingResponse';

interface StreamingMessageProps {
  message: StreamingMessageType;
  className?: string;
}

export function StreamingMessage({ message, className }: StreamingMessageProps) {

    const iconMap: Record<string, string> = {
      'clinical-trial-designer': '🧪',
      'digital-therapeutics-expert': '📱',
      'medical-safety-officer': '🛡️',
      'fda-regulatory-strategist': '📋',
      'ai-ml-clinical-specialist': '🧠',
      'health-economics-analyst': '📊',
      'biomedical-informatics-specialist': '🔬',
      'market-access-strategist': '🎯',
      'default': '🤖'
    };
    return iconMap[agentType || 'default'] || iconMap.default;
  };

  return (
    <div className={`flex gap-3 p-4 ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm">
          {message.role === 'user' ? '👤' : getAgentIcon(message.agentType)}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">
            {message.role === 'user' ? 'You' : message.agentType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'AI Assistant'}
          </span>
          {message.agentType && (
            <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              {message.agentType.replace(/-/g, ' ')}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-foreground">
          <div className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse rounded-sm" />
            )}
          </div>
        </div>

        {/* Streaming Indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Generating response...</span>
          </div>
        )}

        {/* Metadata */}
        {message.metadata && Object.keys(message.metadata).length > 0 && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(message.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}