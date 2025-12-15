'use client';

/**
 * VITAL Platform - StreamingMessage Component
 *
 * Real-time streaming message display with live updates.
 * Shows content as it arrives via SSE with thinking indicators.
 *
 * Features:
 * - Live token streaming with typing effect
 * - Glass box thinking visualization
 * - Agent selection card (Mode 2)
 * - Inline citations using ai-elements HoverCard components
 * - Sources section at end of response
 * - Tool call progress display
 * - Cursor animation
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 12, 2025
 */

import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react';

// Use VitalStreamText for jitter-free markdown streaming with Streamdown
import { VitalStreamText } from '@/components/vital-ai-ui/conversation/VitalStreamText';

// Sources section at end of response
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from '@/components/ai-elements/sources';

import type { Expert } from './ExpertPicker';
import type { StreamState } from '../../hooks/streamReducer';
import type { InteractiveMode } from '../../views/InteractiveView';
import { AgentSelectionCard } from './AgentSelectionCard';
import { VitalThinking } from './VitalThinking';
import { ToolCallList, ToolCall } from './ToolCallList';
import { VitalLevelBadge } from './AgentSelectionCard';

// =============================================================================
// TYPES
// =============================================================================

export interface StreamingMessageProps {
  /** Current stream state from reducer */
  state: StreamState;
  /** Expert handling the response */
  expert?: Expert | null;
  /** Current mode (for theming) */
  mode?: InteractiveMode;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function StreamingMessage({
  state,
  expert,
  mode = 'mode1',
  className,
}: StreamingMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll content into view
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.content]);

  const isThinking = state.isThinking || state.status === 'thinking';
  // CRITICAL: isStreaming should be true for ALL active states (thinking OR streaming)
  // This enables VitalStreamText's parseIncompleteMarkdown during the entire response
  const isStreaming = state.status === 'streaming' || state.status === 'thinking';
  const isComplete = state.status === 'complete';
  const hasContent = state.content.length > 0;

  // Debug: trace StreamingMessage render state (first 5 tokens only)
  if (process.env.NODE_ENV !== 'production' && state.contentTokens <= 5) {
    // eslint-disable-next-line no-console
    console.debug('[StreamingMessage] render:', {
      status: state.status,
      contentLength: state.content.length,
      hasContent,
      isStreaming,
      contentPreview: state.content.slice(0, 50),
    });
  }

  // Convert CitationEvents to CitationData for VitalStreamText inline pills
  const inlineCitations = useMemo(() => {
    return state.citations.map((c) => ({
      id: c.id,
      index: c.index,
      source: c.source,
      title: c.title,
      excerpt: c.excerpt,
      url: c.url || `https://${c.source}.gov/citation/${c.id}`,
      confidence: c.confidence,
      authors: c.metadata?.authors as string[] | undefined,
      date: c.metadata?.date as string | undefined,
      metadata: c.metadata,
    }));
  }, [state.citations]);

  // Combine citations + sources for the Sources section
  const allSources = useMemo(() => {
    const fromCitations = state.citations.map((c) => ({
      id: c.id,
      title: c.title,
      url: c.url || `https://${c.source}.gov/citation/${c.id}`,
      type: c.source,
    }));
    const fromSources = state.sources.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url || '#',
      type: s.type,
    }));
    // Deduplicate by ID
    const seen = new Set<string>();
    return [...fromCitations, ...fromSources].filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [state.citations, state.sources]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', className)}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {expert?.avatar ? (
          <img
            src={expert.avatar}
            alt={expert.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : expert ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {expert.name.charAt(0)}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Expert name - no inline spinner (VitalThinking box is the primary indicator) */}
        {expert && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {expert.name}
            </span>
            <VitalLevelBadge level={expert.level} size="sm" showLabel={false} />
          </div>
        )}

        {/* Glass Box Thinking (Claude.ai style) - Auto-expands during streaming */}
        <AnimatePresence>
          {state.reasoning.length > 0 && (
            <VitalThinking
              steps={state.reasoning}
              isExpanded={isStreaming || isThinking}
              isActive={isThinking}
            />
          )}
        </AnimatePresence>

        {/* Agent Selection Card (Mode 2 - AI selected expert) */}
        <AnimatePresence>
          {state.selectedAgent && mode === 'mode2' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AgentSelectionCard
                agent={state.selectedAgent}
                compact={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming Content - Uses VitalStreamText for proper markdown rendering */}
        {/* Clean flat design: no bubble styling for a modern chat experience */}
        {(hasContent || isStreaming) && (
          <div
            ref={contentRef}
            className="py-2"
          >
            <VitalStreamText
              content={state.content || '\u00A0'}
              isStreaming={isStreaming}
              highlightCode={true}
              enableMermaid={true}
              showControls={true}
              citations={inlineCitations}
            />
          </div>
        )}

        {/* Loading state when no content AND no thinking steps yet (fallback only) */}
        {!hasContent && isStreaming && state.reasoning.length === 0 && (
          <div className="py-2">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating response...</span>
            </div>
          </div>
        )}

        {/* Sources Section - Shows at end of response when complete */}
        <AnimatePresence>
          {isComplete && allSources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-3"
            >
              <Sources>
                <SourcesTrigger count={allSources.length} />
                <SourcesContent>
                  {allSources.map((source) => (
                    <Source
                      key={source.id}
                      href={source.url}
                      title={source.title}
                    />
                  ))}
                </SourcesContent>
              </Sources>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool Calls (as they execute) */}
        <AnimatePresence>
          {state.toolCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ToolCallList
                calls={state.toolCalls as unknown as ToolCall[]}
                activeToolId={state.activeToolId ?? undefined}
                isStreaming={isStreaming}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default StreamingMessage;
