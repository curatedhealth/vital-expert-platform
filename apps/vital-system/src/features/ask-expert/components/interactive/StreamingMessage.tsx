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
 * - Inline citations as they arrive
 * - Tool call progress display
 * - Cursor animation
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import type { Expert } from './ExpertPicker';
import type { StreamState } from '../../hooks/streamReducer';
import type { InteractiveMode } from '../../views/InteractiveView';
import { AgentSelectionCard } from './AgentSelectionCard';
import { VitalThinking } from './VitalThinking';
import { CitationList } from './CitationList';
import { ToolCallList } from './ToolCallList';
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
  const [showCursor, setShowCursor] = useState(true);

  // Blink cursor while streaming
  useEffect(() => {
    if (state.status !== 'streaming') {
      setShowCursor(false);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [state.status]);

  // Auto-scroll content into view
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.content]);

  const isThinking = state.isThinking || state.status === 'thinking';
  const isStreaming = state.status === 'streaming';
  const hasContent = state.content.length > 0;

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
            {expert.name.charAt(0)}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Expert name */}
        {expert && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {expert.name}
            </span>
            <VitalLevelBadge level={expert.level} size="sm" showLabel={false} />
            {isThinking && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                thinking...
              </span>
            )}
          </div>
        )}

        {/* Glass Box Thinking (Claude.ai style) */}
        <AnimatePresence>
          {state.reasoning.length > 0 && (
            <VitalThinking
              steps={state.reasoning}
              isExpanded={false}
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

        {/* Streaming Content */}
        {(hasContent || isStreaming) && (
          <div
            ref={contentRef}
            className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 max-w-[85%]"
          >
            <div className="prose prose-sm max-w-none text-slate-800">
              <ReactMarkdown
                components={{
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-1 py-0.5 rounded bg-slate-200 text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                }}
              >
                {state.content}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && (
                <span
                  className={cn(
                    'inline-block w-2 h-4 bg-slate-600 ml-0.5 align-text-bottom',
                    showCursor ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        )}

        {/* Loading state when no content yet */}
        {!hasContent && isStreaming && (
          <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 max-w-[85%]">
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Generating response...</span>
            </div>
          </div>
        )}

        {/* Inline Citations (as they arrive) */}
        <AnimatePresence>
          {state.citations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[85%]"
            >
              <CitationList
                citations={state.citations}
                inline={true}
                isStreaming={isStreaming}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool Calls (as they execute) */}
        <AnimatePresence>
          {state.toolCalls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[85%]"
            >
              <ToolCallList
                calls={state.toolCalls}
                activeToolId={state.activeToolId}
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
