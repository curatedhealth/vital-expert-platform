'use client';

/**
 * VITAL Platform - InteractiveView Component
 *
 * Master view for Modes 1 & 2 (Interactive Chat modes):
 * - Mode 1 (Expert Chat): User manually selects an expert via ExpertPicker
 * - Mode 2 (Smart Copilot): User types query → FusionSelector AI picks expert
 *
 * Architecture:
 * - Two phases: Selection → Conversation
 * - Uses streamReducer for centralized SSE state management
 * - Blue theme for interactive modes (vs purple for autonomous)
 *
 * Note: FusionSelector is SHARED between Mode 2 and Mode 4:
 * - Mode 2: FusionSelector → Interactive conversation
 * - Mode 4: FusionSelector → Autonomous background execution
 * The difference is what happens AFTER expert selection.
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// Streaming infrastructure
import { streamReducer, initialStreamState, streamActions, type StreamState } from '../hooks/streamReducer';
import { useSSEStream, type TokenEvent, type ReasoningEvent, type CitationEvent, type ToolCallEvent, type DoneEvent, type ErrorEvent } from '../hooks/useSSEStream';

// Components (will be created next)
import { ExpertPicker, type Expert } from '../components/interactive/ExpertPicker';
import { FusionSelector } from '../components/interactive/FusionSelector';
import { ExpertHeader } from '../components/interactive/ExpertHeader';
import { VitalMessage, type Message } from '../components/interactive/VitalMessage';
import { StreamingMessage } from '../components/interactive/StreamingMessage';
import { VitalSuggestionChips } from '../components/interactive/VitalSuggestionChips';
import { ChatInput } from '../components/interactive/ChatInput';

// =============================================================================
// TYPES
// =============================================================================

export type InteractiveMode = 'mode1' | 'mode2';

export interface InteractiveViewProps {
  /** Mode 1 = manual expert selection, Mode 2 = AI selection */
  mode: InteractiveMode;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Optional pre-selected expert ID (skips selection phase) */
  initialExpertId?: string;
  /** Session ID for conversation continuity */
  sessionId?: string;
  /** Custom class names */
  className?: string;
  /** Callback when mode changes */
  onModeChange?: (mode: InteractiveMode) => void;
}

export type ViewPhase = 'selection' | 'conversation';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createUserMessage(content: string): Message {
  return {
    id: uuidv4(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
}

function createAssistantMessage(
  content: string,
  expert: Expert | null,
  streamState: StreamState
): Message {
  return {
    id: uuidv4(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    expert: expert || undefined,
    citations: streamState.citations,
    reasoning: streamState.reasoning,
    artifacts: streamState.artifacts,
    toolCalls: streamState.toolCalls,
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export function InteractiveView({
  mode,
  tenantId,
  initialExpertId,
  sessionId: initialSessionId,
  className,
  onModeChange,
}: InteractiveViewProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  // Session management
  const [sessionId] = useState(() => initialSessionId || uuidv4());

  // Phase management
  const [phase, setPhase] = useState<ViewPhase>(() => {
    // Skip selection if we have an initial expert ID
    if (initialExpertId) return 'conversation';
    // Mode 1 always starts with selection
    if (mode === 'mode1') return 'selection';
    // Mode 2 starts with selection (for query input)
    return 'selection';
  });

  // Expert state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Message history
  const [messages, setMessages] = useState<Message[]>([]);

  // Stream state (centralized via reducer)
  const [streamState, dispatch] = useReducer(streamReducer, initialStreamState);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // =========================================================================
  // SSE STREAM HOOK
  // =========================================================================

  const { connect, disconnect, isStreaming, error: connectionError } = useSSEStream({
    url: mode === 'mode1'
      ? '/api/ask-expert/mode-1/stream'
      : '/api/ask-expert/mode-2/stream',

    // Token streaming
    onToken: useCallback((event: TokenEvent) => {
      dispatch(streamActions.appendContent(event));
    }, []),

    // Reasoning/thinking updates
    onReasoning: useCallback((event: ReasoningEvent) => {
      dispatch(streamActions.addReasoning(event));
    }, []),

    // Citations
    onCitation: useCallback((event: CitationEvent) => {
      dispatch(streamActions.addCitation(event));
    }, []),

    // Tool calls
    onToolCall: useCallback((event: ToolCallEvent) => {
      if (event.status === 'calling') {
        dispatch(streamActions.startTool(event));
      } else {
        dispatch(streamActions.toolResult(event));
      }
    }, []),

    // Stream completion
    onDone: useCallback((event: DoneEvent) => {
      dispatch(streamActions.complete(event));
    }, []),

    // Error handling
    onError: useCallback((event: ErrorEvent) => {
      dispatch(streamActions.error(event));
    }, []),

    // Auto-reconnect for robustness
    autoReconnect: true,
    maxReconnectAttempts: 3,
    reconnectDelayMs: 1000,
  });

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamState.content]);

  // Finalize assistant message when stream completes
  useEffect(() => {
    if (streamState.status === 'complete' && streamState.content) {
      const assistantMessage = createAssistantMessage(
        streamState.content,
        selectedExpert,
        streamState
      );
      setMessages(prev => [...prev, assistantMessage]);
      // Reset stream state for next message
      dispatch(streamActions.reset());
    }
  }, [streamState.status, streamState.content, selectedExpert]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleExpertSelect = useCallback((expert: Expert) => {
    setSelectedExpert(expert);
    setPhase('conversation');
    // Focus input after transition
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage = createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    // Reset stream state
    dispatch(streamActions.reset());
    dispatch(streamActions.connect());

    // Connect to stream
    await connect({
      agent_id: selectedExpert?.id,
      message: content,
      tenant_id: tenantId,
      session_id: sessionId,
    });
  }, [selectedExpert, tenantId, sessionId, connect]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    handleSend(suggestion);
  }, [handleSend]);

  const handleBackToSelection = useCallback(() => {
    // Only allow going back if no messages yet
    if (messages.length === 0) {
      setPhase('selection');
      setSelectedExpert(null);
    }
  }, [messages.length]);

  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'mode1' ? 'mode2' : 'mode1';
    onModeChange?.(newMode);
  }, [mode, onModeChange]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn(
      'flex flex-col h-full bg-white',
      // Interactive mode uses blue accent
      'interactive-view--blue-theme',
      className
    )}>
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════
            SELECTION PHASE
            Mode 1: ExpertPicker (manual grid selection)
            Mode 2: FusionSelector (query-first, AI selects)
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-auto"
          >
            {mode === 'mode1' ? (
              <ExpertPicker
                tenantId={tenantId}
                onSelect={handleExpertSelect}
                onModeSwitch={handleModeSwitch}
              />
            ) : (
              <FusionSelector
                tenantId={tenantId}
                onQuerySubmit={(query) => {
                  // In Mode 2, submitting a query starts the fusion process
                  // The expert will be auto-selected based on the query
                  handleSend(query);
                  setPhase('conversation');
                }}
                onExpertSelected={handleExpertSelect}
                onModeSwitch={handleModeSwitch}
              />
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            CONVERSATION PHASE (Identical UI for Mode 1 & 2)
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'conversation' && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            {/* Expert Header */}
            <ExpertHeader
              expert={selectedExpert}
              mode={mode}
              sessionId={sessionId}
              onBack={messages.length === 0 ? handleBackToSelection : undefined}
            />

            {/* Message List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((message) => (
                <VitalMessage
                  key={message.id}
                  message={message}
                  expert={selectedExpert}
                />
              ))}

              {/* Streaming Message (while receiving) */}
              {isStreaming && (
                <StreamingMessage
                  state={streamState}
                  expert={selectedExpert}
                  mode={mode}
                />
              )}

              {/* Error State */}
              {streamState.error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{streamState.error.message}</p>
                  {streamState.error.recoverable && (
                    <button
                      onClick={() => dispatch(streamActions.reset())}
                      className="mt-2 text-sm text-red-600 underline hover:no-underline"
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips (after stream completes) */}
            {!isStreaming && streamState.status === 'idle' && messages.length > 0 && (
              <VitalSuggestionChips
                context={messages[messages.length - 1]?.content || ''}
                expertDomain={selectedExpert?.domain}
                onSelect={handleSuggestionSelect}
              />
            )}

            {/* Chat Input */}
            <ChatInput
              ref={inputRef}
              onSend={handleSend}
              disabled={isStreaming}
              placeholder={
                selectedExpert
                  ? `Ask ${selectedExpert.name}...`
                  : 'Type your question...'
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InteractiveView;
