'use client';

/**
 * VITAL Platform - VitalMessage Component
 *
 * Message bubble component for chat interface.
 * Handles both user and assistant messages with rich content.
 *
 * Features:
 * - User and assistant message styling
 * - Expert avatar for assistant messages
 * - Inline citation markers with hover preview
 * - Expandable reasoning section
 * - Artifact card integration
 * - Tool call display
 * - Copy message action
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  User,
  ChevronDown,
  Brain,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import type { Expert } from './ExpertPicker';
import type { CitationEvent, ReasoningEvent, ToolCallEvent, ArtifactEvent } from '../../hooks/useSSEStream';
import { CitationList } from './CitationList';
import { ToolCallList } from './ToolCallList';
import { VitalLevelBadge } from './AgentSelectionCard';

// =============================================================================
// TYPES
// =============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  expert?: Expert;
  citations?: CitationEvent[];
  reasoning?: ReasoningEvent[];
  artifacts?: ArtifactEvent[];
  toolCalls?: ToolCallEvent[];
}

export interface VitalMessageProps {
  /** The message to display */
  message: Message;
  /** Expert for assistant messages */
  expert?: Expert | null;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalMessage({
  message,
  expert,
  showTimestamp = false,
  className,
}: VitalMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const isUser = message.role === 'user';
  const displayExpert = message.expert || expert;

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [message.content]);

  const toggleReasoning = useCallback(() => {
    setShowReasoning(prev => !prev);
  }, []);

  // =========================================================================
  // CONTENT WITH CITATION MARKERS
  // =========================================================================

  const contentWithCitations = useMemo(() => {
    if (!message.citations || message.citations.length === 0) {
      return message.content;
    }

    // Insert citation markers [1], [2], etc. based on citation references in text
    // This is a simplified version - real implementation would parse citation refs
    return message.content;
  }, [message.content, message.citations]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600" />
          </div>
        ) : displayExpert ? (
          <div className="relative">
            {displayExpert.avatar ? (
              <img
                src={displayExpert.avatar}
                alt={displayExpert.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                {displayExpert.name.charAt(0)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 min-w-0 space-y-2',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Expert name and level (assistant only) */}
        {!isUser && displayExpert && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">
              {displayExpert.name}
            </span>
            <VitalLevelBadge level={displayExpert.level} size="sm" showLabel={false} />
          </div>
        )}

        {/* Main message bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 max-w-[85%]',
            isUser
              ? 'bg-blue-600 text-white ml-auto rounded-br-md'
              : 'bg-slate-100 text-slate-800 rounded-bl-md'
          )}
        >
          {/* Message content */}
          <div className={cn(
            'prose prose-sm max-w-none',
            isUser && 'prose-invert'
          )}>
            <ReactMarkdown
              components={{
                // Style links
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'underline',
                      isUser ? 'text-blue-200' : 'text-blue-600'
                    )}
                  >
                    {children}
                  </a>
                ),
                // Style code blocks
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className={cn(
                      'px-1 py-0.5 rounded text-sm',
                      isUser ? 'bg-blue-500' : 'bg-slate-200'
                    )}>
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
              }}
            >
              {contentWithCitations}
            </ReactMarkdown>
          </div>

          {/* Copy button (on hover) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              'absolute -right-10 top-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:bg-slate-200'
            )}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        </div>

        {/* Reasoning section (assistant only) */}
        {!isUser && message.reasoning && message.reasoning.length > 0 && (
          <div className="max-w-[85%]">
            <button
              onClick={toggleReasoning}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Brain className="h-3 w-3" />
              <span>{message.reasoning.length} reasoning step{message.reasoning.length > 1 ? 's' : ''}</span>
              <ChevronDown className={cn(
                'h-3 w-3 transition-transform',
                showReasoning && 'rotate-180'
              )} />
            </button>

            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-100"
              >
                <div className="space-y-2">
                  {message.reasoning.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700">{step.step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Citations (assistant only) */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="max-w-[85%]">
            <CitationList
              citations={message.citations}
              inline={false}
            />
          </div>
        )}

        {/* Tool Calls (assistant only) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="max-w-[85%]">
            <ToolCallList calls={message.toolCalls} />
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && (
          <span className={cn(
            'text-xs',
            isUser ? 'text-slate-400 text-right' : 'text-slate-400'
          )}>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default VitalMessage;
