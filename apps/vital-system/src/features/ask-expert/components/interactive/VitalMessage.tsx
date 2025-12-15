'use client';

/**
 * VITAL Platform - VitalMessage Component
 *
 * Chat message component for the interactive Ask Expert view.
 * Handles both user and assistant messages with rich content.
 *
 * Features:
 * - User and assistant message styling
 * - Expert avatar for assistant messages
 * - Inline citation markers with hover preview (via VitalStreamText)
 * - Expandable reasoning section
 * - Artifact card integration
 * - Tool call display
 * - Copy message action
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 * Updated: December 12, 2025 - Unified rendering with VitalStreamText for consistent formatting
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
import { logger } from '@vital/utils';

import type { Expert } from './ExpertPicker';
import type { CitationEvent, ReasoningEvent, ToolCallEvent, ArtifactEvent } from '../../hooks/useSSEStream';
import { CitationList } from './CitationList';
import { ToolCallList } from './ToolCallList';
import { VitalLevelBadge } from './AgentSelectionCard';
import { VitalStreamText, type CitationData } from '@/components/vital-ai-ui/conversation/VitalStreamText';

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
      logger.error('Failed to copy message content', { error: err });
    }
  }, [message.content]);

  const toggleReasoning = useCallback(() => {
    setShowReasoning(prev => !prev);
  }, []);

  // =========================================================================
  // CITATIONS CONVERSION FOR VITASTREAMTEXT
  // =========================================================================

  /**
   * Convert CitationEvent[] to CitationData[] for VitalStreamText
   * This ensures consistent rendering between streaming and completed messages
   *
   * CitationEvent has: id, index, source, title, excerpt, url, confidence, metadata
   * CitationData needs: id, index, source, title, excerpt?, url?, confidence?, authors?, date?
   */
  const citationsForStreamText = useMemo((): CitationData[] => {
    if (!message.citations || message.citations.length === 0) {
      return [];
    }

    return message.citations.map((citation, idx) => ({
      id: citation.id || `citation-${idx}`,
      index: citation.index ?? idx + 1,
      source: citation.source || 'Unknown Source',
      title: citation.title || 'Untitled',
      excerpt: citation.excerpt,
      url: citation.url,
      confidence: citation.confidence,
      // Extract authors and date from metadata if available
      authors: (citation.metadata?.authors as string[]) || undefined,
      date: (citation.metadata?.date as string) || (citation.metadata?.publication_date as string) || undefined,
      metadata: citation.metadata,
    }));
  }, [message.citations]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 w-full items-start group',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-1">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {displayExpert.name.charAt(0)}
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 min-w-0 space-y-2',
        'text-left'
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

        {/* Main message container - flat layout for both user and assistant (no filled bubbles) */}
        <div
          className={cn(
            'relative min-w-0 pr-10 px-4 py-2 rounded-xl border border-slate-200/70 bg-transparent max-w-4xl mx-auto',
            isUser ? 'text-slate-900' : 'text-stone-800'
          )}
        >
          {/* Message content - Using VitalStreamText for unified rendering */}
          {/* This ensures consistent formatting between streaming and completed messages */}
          {isUser ? (
            // User messages - simple text display
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            // Assistant messages - rich rendering with VitalStreamText
            // Provides: syntax highlighting, Mermaid diagrams, inline citation pills
            <VitalStreamText
              content={message.content}
              isStreaming={false} // Completed message, not streaming
              highlightCode={true}
              enableMermaid={true}
              showControls={false} // No copy controls inside bubble (we have our own)
              citations={citationsForStreamText}
              inlineCitations={true}
              className={cn(
                'w-full text-left ml-auto text-base',
                // Override prose colors for the slate background
                '[&_.prose]:prose-slate',
                '[&_a]:text-purple-600 [&_a:hover]:underline'
              )}
            />
          )}

          {/* Copy button (on hover) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              'absolute top-0 right-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
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
          <div>
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
                className="mt-2 p-3 rounded-lg bg-purple-50 border border-purple-100"
              >
                <div className="space-y-2">
                  {message.reasoning.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-purple-200 text-purple-700 text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-stone-700">{step.step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Citations list (assistant only) - Shows as footer when there are many citations */}
        {/* Note: Inline citations are handled by VitalStreamText above */}
        {!isUser && message.citations && message.citations.length > 3 && (
          <div>
            <CitationList
              citations={message.citations}
              inline={false}
            />
          </div>
        )}

        {/* Tool Calls (assistant only) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div>
            <ToolCallList calls={message.toolCalls as unknown as import('./ToolCallList').ToolCall[]} />
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
