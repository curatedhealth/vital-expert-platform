'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { VitalStreamText } from './VitalStreamText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

type MessageRole = 'user' | 'assistant' | 'system';

interface AgentInfo {
  id: string;
  name: string;
  avatar?: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  domain?: string;
}

interface Citation {
  id: string;
  index: number;
  title: string;
  source: string;
  url?: string;
  excerpt: string;
  confidence: number;
}

interface VitalMessageProps {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  agent?: AgentInfo;
  timestamp?: Date;
  reasoningSteps?: string[];
  citations?: Citation[];
  children?: ReactNode;
  className?: string;
}

/**
 * VitalMessage - Universal message container for all message types
 * 
 * Supports user and assistant messages with agent info, reasoning steps,
 * citations, and custom children for generative UI.
 */
export function VitalMessage({
  role,
  content,
  isStreaming = false,
  agent,
  timestamp,
  reasoningSteps,
  citations,
  children,
  className
}: VitalMessageProps) {
  const isUser = role === 'user';
  const isSystem = role === 'system';
  
  // Level color mapping
  const levelColors: Record<string, string> = {
    L1: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    L2: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    L3: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    L4: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    L5: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  
  return (
    <div
      className={cn(
        "flex gap-4 p-4",
        isUser ? "flex-row-reverse" : "flex-row",
        isSystem && "bg-muted/50 rounded-lg",
        className
      )}
      role="article"
      aria-label={`${role} message`}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        {agent?.avatar ? (
          <AvatarImage src={agent.avatar} alt={agent.name} />
        ) : (
          <AvatarFallback className={cn(
            isUser ? "bg-primary" : "bg-secondary",
            "text-primary-foreground"
          )}>
            {isUser ? 'U' : agent?.name?.[0] || 'A'}
          </AvatarFallback>
        )}
      </Avatar>
      
      {/* Content */}
      <div className={cn(
        "flex flex-col gap-2 max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Agent info header */}
        {agent && !isUser && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{agent.name}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              levelColors[agent.level] || 'bg-secondary'
            )}>
              {agent.level}
            </span>
            {agent.domain && (
              <span className="text-xs text-muted-foreground">
                · {agent.domain}
              </span>
            )}
          </div>
        )}
        
        {/* Reasoning steps (if available) */}
        {reasoningSteps && reasoningSteps.length > 0 && (
          <ReasoningPreview steps={reasoningSteps} />
        )}
        
        {/* Message content */}
        <div className={cn(
          "rounded-lg px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted",
          isSystem && "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <VitalStreamText 
              content={content} 
              isStreaming={isStreaming} 
            />
          )}
        </div>
        
        {/* Citations */}
        {citations && citations.length > 0 && (
          <CitationList citations={citations} />
        )}
        
        {/* Additional content (generative UI) */}
        {children}
        
        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * ReasoningPreview - Compact reasoning steps preview
 */
function ReasoningPreview({ steps }: { steps: string[] }) {
  return (
    <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 max-w-full">
      <span className="font-medium">Thinking: </span>
      <span className="truncate">{steps[steps.length - 1]}</span>
      {steps.length > 1 && (
        <span className="ml-1 text-muted-foreground/60">
          (+{steps.length - 1} more)
        </span>
      )}
    </div>
  );
}

/**
 * CitationList - Horizontal list of citation badges
 */
function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {citations.map((citation) => (
        <a
          key={citation.id}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center",
            "h-5 min-w-5 px-1.5 rounded text-xs font-medium",
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            "hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors",
            "cursor-pointer"
          )}
          title={citation.title}
        >
          {citation.index}
        </a>
      ))}
    </div>
  );
}

export default VitalMessage;
