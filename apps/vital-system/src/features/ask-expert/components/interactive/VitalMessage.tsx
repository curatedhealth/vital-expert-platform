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
  Brain,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { logger } from '@vital/utils';

import type { Expert } from './ExpertPicker';
import type { CitationEvent, ReasoningEvent, ToolCallEvent, ArtifactEvent } from '../../hooks/useSSEStream';
import { CitationList } from './CitationList';
import { ToolCallList } from './ToolCallList';
import { VitalLevelBadge } from './AgentSelectionCard';
import { VitalStreamText, type CitationData } from '@/components/vital-ai-ui/conversation/VitalStreamText';
import { VitalThinking } from './VitalThinking';

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
  const [avatarError, setAvatarError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  /**
   * Parse references from message content when no structured citations exist
   * Extracts [1] Title - Source patterns from "References" section
   */
  const parsedCitationsFromContent = useMemo((): CitationEvent[] => {
    // If we already have structured citations, don't parse
    if (message.citations && message.citations.length > 0) {
      return [];
    }

    // Look for References section in content
    const referencesMatch = message.content.match(/(?:References|Sources|Citations)\s*\n([\s\S]*?)(?:\n\n|$)/i);
    if (!referencesMatch) {
      return [];
    }

    const referencesText = referencesMatch[1];
    const citations: CitationEvent[] = [];

    // Parse [1] Title - Source patterns using matchAll (not exec)
    const refPattern = /\[(\d+)\]\s*([^\n]+)/g;
    const matches = Array.from(referencesText.matchAll(refPattern));

    for (const match of matches) {
      const index = parseInt(match[1], 10);
      const fullText = match[2].trim();

      // Try to split "Title - Source"
      const parts = fullText.split(' - ');
      const title = parts[0]?.trim() || fullText;
      const source = parts.length > 1 ? parts.slice(1).join(' - ').trim() : undefined;

      citations.push({
        id: `parsed-citation-${index}`,
        index,
        title,
        source,
        url: undefined,
        excerpt: undefined,
        confidence: undefined,
        metadata: {},
      });
    }

    return citations;
  }, [message.content, message.citations]);

  /**
   * Get effective citations - either structured or parsed from content
   */
  const effectiveCitations = useMemo(() => {
    if (message.citations && message.citations.length > 0) {
      return message.citations;
    }
    return parsedCitationsFromContent;
  }, [message.citations, parsedCitationsFromContent]);

  /**
   * Strip "References" section from message content when we have citations (structured or parsed)
   * This prevents duplicate display of references (once as text, once as CitationList)
   */
  const displayContent = useMemo(() => {
    // Only strip if we have citations to display
    if (effectiveCitations.length === 0) {
      return message.content;
    }

    // Remove "References" or "Sources" section from the end of the content
    // Common patterns: "References\n[1]...", "## References", "**References**"
    const referencesPatterns = [
      /\n\n(?:#{1,3}\s*)?(?:\*\*)?(?:References|Sources|Citations)(?:\*\*)?\s*\n\[\d+\][\s\S]*$/i,
      /\n\n(?:References|Sources|Citations):\s*\n\[\d+\][\s\S]*$/i,
      /\n\nReferences\s*\n[\s\S]*$/i,
    ];

    let cleanContent = message.content;
    for (const pattern of referencesPatterns) {
      cleanContent = cleanContent.replace(pattern, '');
    }

    return cleanContent.trim();
  }, [message.content, effectiveCitations]);

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
            {displayExpert.avatar && !avatarError ? (
              <img
                src={displayExpert.avatar}
                alt={displayExpert.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setAvatarError(true)}
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

        {/* Reasoning section ABOVE content (assistant only) - Uses unified VitalThinking component */}
        {/* Positioned at TOP like Claude/ChatGPT thinking indicators */}
        {/* Note: NOT passing isExpanded so component uses internal state and user can toggle */}
        {!isUser && message.reasoning && message.reasoning.length > 0 && (
          <VitalThinking
            steps={message.reasoning}
            isActive={false}
          />
        )}

        {/* Main message container - flat layout for both user and assistant (no filled bubbles) */}
        <div
          className={cn(
            'relative min-w-0 pr-16 pl-6 py-2 rounded-xl border border-slate-200/70 bg-transparent max-w-4xl mx-auto',
            isUser ? 'text-slate-900' : 'text-stone-800'
          )}
        >
          {/* Collapse/Expand chevron on the left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 opacity-40 hover:opacity-100 transition-opacity',
              'hover:bg-slate-100'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            )}
          </Button>

          {/* Message content - Using VitalStreamText for unified rendering */}
          {/* This ensures consistent formatting between streaming and completed messages */}
          {isCollapsed ? (
            // Collapsed preview - show first line/truncated content
            <p className="text-sm text-slate-500 truncate">
              {message.content.split('\n')[0].slice(0, 100)}
              {message.content.length > 100 && '...'}
            </p>
          ) : isUser ? (
            // User messages - simple text display
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            // Assistant messages - rich rendering with VitalStreamText
            // Provides: syntax highlighting, Mermaid diagrams, inline citation pills
            // Uses displayContent (with References section stripped when we have structured citations)
            <VitalStreamText
              content={displayContent}
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

        {/* Citations list (assistant only) - Collapsible Sources component */}
        {/* Uses effectiveCitations (structured or parsed from content) */}
        {/* Displays "Used X sources" trigger with Chicago style references */}
        {!isUser && effectiveCitations.length > 0 && (
          <div className="mt-3">
            <CitationList
              citations={effectiveCitations}
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
