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
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Loader2,
  MessageSquare,
  HelpCircle,
  Users,
  MessageCircle,
  Lightbulb,
  X,
  type LucideIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Streaming infrastructure
import { streamReducer, initialStreamState, streamActions, type StreamState } from '../hooks/streamReducer';
import { useSSEStream, type TokenEvent, type ReasoningEvent, type CitationEvent, type ToolCallEvent, type DoneEvent, type ErrorEvent } from '../hooks/useSSEStream';

// Components
import { ExpertPicker, type Expert } from '../components/interactive/ExpertPicker';
import { FusionSelector } from '../components/interactive/FusionSelector';
import { ExpertHeader } from '../components/interactive/ExpertHeader';
import { VitalMessage, type Message } from '../components/interactive/VitalMessage';
import { StreamingMessage } from '../components/interactive/StreamingMessage';
import { VitalSuggestionChips, type Suggestion } from '../components/interactive/VitalSuggestionChips';

// Use enhanced VitalPromptInput from vital-ai-ui (AI enhance, drag-drop, character counter)
import { VitalPromptInput } from '@/components/vital-ai-ui/conversation/VitalPromptInput';

// Shared breadcrumb component for navigation context
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';

// HITL Components (Human-in-the-Loop)
import { HITLCheckpointModal, type CheckpointData, type CheckpointDecision } from '../components/interactive/HITLCheckpointModal';
import { PlanApprovalCard, type ExecutionPlan } from '../components/interactive/PlanApprovalCard';
import { SubAgentDelegationCard, type SubAgentDelegation } from '../components/interactive/SubAgentDelegationCard';
import { ToolExecutionFeedback, type ToolExecution } from '../components/interactive/ToolExecutionFeedback';

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
// DYNAMIC ICON LOOKUP - No hardcoding, uses LucideIcons namespace
// =============================================================================

/**
 * Dynamically resolve Lucide icon from string name (returned by API).
 * Falls back to MessageSquare if icon name not found.
 */
function getPromptStarterIcon(iconName: string | undefined): LucideIcon {
  if (!iconName) return MessageSquare;
  // Dynamic lookup from LucideIcons namespace - no hardcoding needed
  const Icon = (LucideIcons as Record<string, LucideIcon>)[iconName];
  return Icon || MessageSquare;
}

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

  // HITL state
  const [activeCheckpoint, setActiveCheckpoint] = useState<CheckpointData | null>(null);
  const [activePlan, setActivePlan] = useState<ExecutionPlan | null>(null);
  const [activeDelegations, setActiveDelegations] = useState<SubAgentDelegation[]>([]);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

  // Prompt starters state
  const [promptStarters, setPromptStarters] = useState<Array<{
    text: string;
    description: string;
    fullPrompt: string;
    color: string;
    icon: string;
  }>>([]);
  const [isLoadingPromptStarters, setIsLoadingPromptStarters] = useState(false);

  // User guide state (shown during selection phase)
  const [showUserGuide, setShowUserGuide] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // SSE STREAM HOOK
  // =========================================================================

  const { connect, disconnect, isStreaming, error: connectionError } = useSSEStream({
    url: mode === 'mode1'
      ? '/api/expert/mode1/stream'
      : '/api/expert/mode2/stream',

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

  // Listen for expert selection from sidebar (Mode 1)
  // This wires the global sidebar's expert selection to InteractiveView
  useEffect(() => {
    // Skip if Mode 2 (auto-select) or if we already have an initial expert
    if (mode === 'mode2') return;

    interface ExpertSelectedEvent {
      expertId: string;
      expert: { id: string; name: string; level: string; specialty: string };
    }

    const handleExpertSelected = (event: CustomEvent<ExpertSelectedEvent>) => {
      const { expert } = event.detail;

      // Create Expert object from sidebar event data
      // Maps sidebar event fields to ExpertPicker's Expert type
      const selectedExpertFromSidebar: Expert = {
        id: expert.id,
        name: expert.name,
        slug: expert.id, // Use ID as slug fallback
        domain: expert.specialty || '',
        level: (expert.level as 'L1' | 'L2' | 'L3' | 'L4' | 'L5') || 'L2',
        tier: parseInt(expert.level?.replace('L', '') || '2', 10),
        status: 'active',
        expertise: expert.specialty ? [expert.specialty] : [],
      };

      setSelectedExpert(selectedExpertFromSidebar);
      setPhase('conversation');
    };

    window.addEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);

    // Request current selection from sidebar on mount (in case already selected)
    window.dispatchEvent(new CustomEvent('ask-expert:request-selection'));

    return () => {
      window.removeEventListener('ask-expert:expert-selected', handleExpertSelected as EventListener);
    };
  }, [mode]);

  // Fetch prompt starters when expert changes
  useEffect(() => {
    if (!selectedExpert?.id) {
      setPromptStarters([]);
      return;
    }

    const fetchPromptStarters = async () => {
      setIsLoadingPromptStarters(true);
      try {
        const response = await fetch(`/api/agents/${selectedExpert.id}/prompt-starters`);
        if (response.ok) {
          const data = await response.json();
          setPromptStarters(data || []);
        } else {
          setPromptStarters([]);
        }
      } catch (error) {
        console.error('Error fetching prompt starters:', error);
        setPromptStarters([]);
      } finally {
        setIsLoadingPromptStarters(false);
      }
    };

    fetchPromptStarters();
  }, [selectedExpert?.id]);

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
  }, []);

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage = createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    // Reset stream state and start thinking IMMEDIATELY (optimistic UI)
    dispatch(streamActions.reset());
    dispatch(streamActions.connect());

    // CRITICAL: Trigger thinking state IMMEDIATELY before backend responds
    // This provides instant visual feedback while waiting for SSE connection
    dispatch({
      type: 'THINKING_START',
      payload: { phase: 'analyzing' as const }
    });

    // Add initial optimistic reasoning step (will be replaced by real backend events)
    dispatch(streamActions.addReasoning({
      id: `initial-${Date.now()}`,
      step: 'Analyzing your question...',
      stepIndex: 0,
      agentLevel: selectedExpert?.level || 'L2',
      agentId: selectedExpert?.id || 'orchestrator',
      agentName: selectedExpert?.name || 'AI Expert',
      content: 'Processing query and preparing response',
      status: 'thinking',
    }));

    // Connect to stream
    await connect({
      agent_id: selectedExpert?.id,
      message: content,
      tenant_id: tenantId,
      session_id: sessionId,
    });
  }, [selectedExpert, tenantId, sessionId, connect]);

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    handleSend(suggestion.text);
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
  // HITL HANDLERS
  // =========================================================================

  const handleCheckpointDecision = useCallback((
    checkpointId: string,
    decision: CheckpointDecision,
    data?: unknown
  ) => {
    // Send decision to backend
    console.log('Checkpoint decision:', checkpointId, decision, data);
    // Close the modal
    setActiveCheckpoint(null);
    // TODO: Send to backend via API or SSE response
  }, []);

  const handleCheckpointTimeout = useCallback((checkpointId: string) => {
    console.log('Checkpoint timed out:', checkpointId);
    setActiveCheckpoint(null);
  }, []);

  const handleCheckpointExtend = useCallback((checkpointId: string, additionalSeconds: number) => {
    console.log('Extending checkpoint:', checkpointId, 'by', additionalSeconds, 'seconds');
    // TODO: Notify backend of extension
  }, []);

  const handlePlanApprove = useCallback((planId: string) => {
    console.log('Plan approved:', planId);
    setActivePlan(null);
    // TODO: Send approval to backend
  }, []);

  const handlePlanReject = useCallback((planId: string, reason?: string) => {
    console.log('Plan rejected:', planId, reason);
    setActivePlan(null);
    // TODO: Send rejection to backend
  }, []);

  const handlePlanModify = useCallback((planId: string, modifications: string) => {
    console.log('Plan modified:', planId, modifications);
    setActivePlan(null);
    // TODO: Send modifications to backend
  }, []);

  const handleDelegationApprove = useCallback((delegationId: string) => {
    setActiveDelegations(prev =>
      prev.map(d =>
        d.id === delegationId ? { ...d, status: 'approved' as const } : d
      )
    );
    // TODO: Send approval to backend
  }, []);

  const handleDelegationReject = useCallback((delegationId: string, reason?: string) => {
    setActiveDelegations(prev =>
      prev.map(d =>
        d.id === delegationId ? { ...d, status: 'rejected' as const } : d
      )
    );
    // TODO: Send rejection to backend
  }, []);

  const handleToolCancel = useCallback((executionId: string) => {
    setToolExecutions(prev =>
      prev.map(e =>
        e.id === executionId ? { ...e, status: 'cancelled' as const } : e
      )
    );
    // TODO: Send cancellation to backend
  }, []);

  // AI Prompt Enhancement handler for VitalPromptInput
  const handlePromptEnhance = useCallback(async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/prompt-enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          context: selectedExpert ? {
            expertName: selectedExpert.name,
            domain: selectedExpert.domain,
            expertise: selectedExpert.expertise,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      return data.enhanced || message;
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      return message; // Return original on error
    }
  }, [selectedExpert]);

  // =========================================================================
  // RENDER
  // =========================================================================

  // Build dynamic breadcrumb items based on mode and phase
  const breadcrumbItems = [
    { label: 'Ask Expert', href: '/ask-expert' },
    {
      label: mode === 'mode1' ? 'Expert Consultation' : 'Smart Copilot',
      href: phase === 'selection' ? undefined : `/ask-expert/${mode}`,
    },
    // Add expert name when in conversation phase
    ...(phase === 'conversation' && selectedExpert
      ? [{ label: selectedExpert.name }]
      : []
    ),
  ];

  return (
    <div className={cn(
      'flex flex-col h-full bg-white',
      // Interactive mode uses blue accent
      'interactive-view--blue-theme',
      className
    )}>
      {/* Breadcrumb Navigation */}
      <VitalBreadcrumb
        showHome
        homeHref="/dashboard"
        items={breadcrumbItems}
        className="px-4 pt-3 pb-2"
      />

      {/* User Guide Banner (Selection Phase Only - Mode 1) */}
      {phase === 'selection' && mode === 'mode1' && (
        <AnimatePresence>
          {showUserGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-4 mb-3"
            >
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-blue-900">
                        How Expert Consultation Works
                      </h3>
                      <button
                        onClick={() => setShowUserGuide(false)}
                        className="p-1 rounded-md hover:bg-blue-100 transition-colors"
                        aria-label="Dismiss guide"
                      >
                        <X className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                      </button>
                    </div>
                    <ul className="space-y-1.5 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Select an expert</strong> from the grid below based on your topic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Ask questions</strong> directly to get specialized insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Not sure which expert?</strong> Try <button onClick={() => onModeChange?.('mode2')} className="text-blue-600 underline hover:text-blue-800">Smart Copilot</button> mode for AI-guided selection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
            {selectedExpert && (
              <ExpertHeader
                expert={selectedExpert}
                mode={mode}
                onSwitchExpert={messages.length === 0 ? handleBackToSelection : undefined}
              />
            )}

            {/* Message List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Prompt Starters (shown when no messages yet) */}
              {messages.length === 0 && selectedExpert && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                  {isLoadingPromptStarters ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <p className="text-sm text-muted-foreground">Loading suggestions...</p>
                    </div>
                  ) : promptStarters.length > 0 ? (
                    <div className="w-full max-w-3xl space-y-4">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-2">
                          <Sparkles className="h-4 w-4" />
                          Get Started
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Choose a topic or type your own question below
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Limit to 4 prompt starters for cleaner UX in Mode 1 & Mode 2 */}
                        {promptStarters.slice(0, 4).map((starter, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSend(starter.fullPrompt || starter.text)}
                            className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all text-left"
                          >
                            <div className="flex items-start gap-3">
                              {(() => {
                                const IconComponent = getPromptStarterIcon(starter.icon);
                                return <IconComponent className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />;
                              })()}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                                  {starter.text}
                                </p>
                                {starter.description && (
                                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                    {starter.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-sm font-medium mb-2">
                        <Sparkles className="h-4 w-4" />
                        Ready to Chat
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Type your question below to get started
                      </p>
                    </div>
                  )}
                </div>
              )}

              {messages.map((message) => (
                <VitalMessage
                  key={message.id}
                  message={message}
                  expert={selectedExpert}
                />
              ))}

              {/* Tool Execution Feedback (visible during streaming) */}
              {toolExecutions.length > 0 && (
                <ToolExecutionFeedback
                  executions={toolExecutions}
                  compact={false}
                  maxVisible={5}
                  allowCancel={true}
                  onCancel={handleToolCancel}
                  className="mb-4"
                />
              )}

              {/* Active Plan Approval Card */}
              {activePlan && (
                <PlanApprovalCard
                  plan={activePlan}
                  onApprove={handlePlanApprove}
                  onReject={handlePlanReject}
                  onModify={handlePlanModify}
                  className="mb-4"
                />
              )}

              {/* Active Sub-Agent Delegations */}
              {activeDelegations.filter(d => d.status === 'pending_approval' || d.status === 'in_progress').map(delegation => (
                <SubAgentDelegationCard
                  key={delegation.id}
                  delegation={delegation}
                  onApprove={handleDelegationApprove}
                  onReject={handleDelegationReject}
                  requiresApproval={delegation.status === 'pending_approval'}
                  className="mb-4"
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
            {!isStreaming && streamState.status === 'idle' && messages.length > 0 && streamState.suggestions && streamState.suggestions.length > 0 && (
              <VitalSuggestionChips
                suggestions={streamState.suggestions}
                onSelect={handleSuggestionSelect}
                maxVisible={4}
                layout="wrap"
              />
            )}

            {/* Chat Input - Enhanced with AI prompt enhancement */}
            <VitalPromptInput
              onSubmit={handleSend}
              onEnhance={handlePromptEnhance}
              isLoading={isStreaming}
              onStop={() => disconnect()}
              placeholder={
                selectedExpert
                  ? `Ask ${selectedExpert.name}...`
                  : 'Type your question...'
              }
              showAttachments={true}
              showEnhance={!!selectedExpert}
              maxLength={4000}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* HITL Checkpoint Modal (floats above everything) */}
      <HITLCheckpointModal
        checkpoint={activeCheckpoint}
        isOpen={activeCheckpoint !== null}
        onDecision={handleCheckpointDecision}
        onExtend={handleCheckpointExtend}
        onTimeout={handleCheckpointTimeout}
      />
    </div>
  );
}

export default InteractiveView;
