'use client';

/**
 * VITAL Platform - InteractiveView Component
 *
 * Master view for Modes 1 & 2 (Interactive Chat modes):
 * - Mode 1 (Expert Chat): User manually selects an expert via the sidebar, then chats
 * - Mode 2 (Smart Copilot): User types query → Backend FusionSelector auto-selects best expert
 *
 * Architecture:
 * - Mode 1: User picks expert from sidebar → conversation starts
 * - Mode 2: User types first message → Backend uses FusionSelector/GraphRAG to auto-select → conversation starts
 * - BOTH modes share identical conversation UI (same view, same components)
 * - Uses streamReducer for centralized SSE state management
 * - Purple theme for VITAL brand consistency
 *
 * Backend Agent Selection (Mode 2):
 * - FusionSelector runs on backend via /api/expert/mode2/stream
 * - Uses 3-method GraphRAG fusion: PostgreSQL (30%) + Pinecone (50%) + Neo4j (20%)
 * - Selected agent is returned in stream metadata
 *
 * Design System: VITAL Brand v6.0 (#9055E0)
 * Updated: December 15, 2025 - Unified Mode 1 & 2 to identical UI
 */

import { useState, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useHeaderActions } from '@/contexts/header-actions-context';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Loader2,
  MessageSquare,
  Users,
  ArrowLeft,
  Bot,
  Circle,
  type LucideIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Streaming infrastructure
import { streamReducer, initialStreamState, streamActions, type StreamState } from '../hooks/streamReducer';
import { useSSEStream, type TokenEvent, type ReasoningEvent, type CitationEvent, type ToolCallEvent, type DoneEvent, type ErrorEvent } from '../hooks/useSSEStream';

// Components
import { type Expert } from '../components/interactive/ExpertPicker';
// FusionSelector UI component removed from frontend - Mode 2 uses backend FusionSelector for auto-selection
// Mode 1: User manually selects agent from sidebar
// Mode 2: Backend uses FusionSelector/GraphRAG to auto-select best agent
// Both modes share identical conversation UI
// ExpertHeader no longer used - expert info now injected into global header via HeaderActionsContext
import { VitalMessage, type Message } from '../components/interactive/VitalMessage';
import { StreamingMessage } from '../components/interactive/StreamingMessage';
import { VitalSuggestionChips, type Suggestion } from '../components/interactive/VitalSuggestionChips';

// Use enhanced VitalPromptInput from vital-ai-ui (AI enhance, drag-drop, character counter)
import { VitalPromptInput } from '@/components/vital-ai-ui/conversation/VitalPromptInput';

// Note: Breadcrumb is handled globally by DashboardHeader - no local import needed

// HITL Components (Human-in-the-Loop)
import { HITLCheckpointModal, type CheckpointData, type CheckpointDecision } from '../components/interactive/HITLCheckpointModal';
import { PlanApprovalCard, type ExecutionPlan } from '../components/interactive/PlanApprovalCard';
import { SubAgentDelegationCard, type SubAgentDelegation } from '../components/interactive/SubAgentDelegationCard';
import { ToolExecutionFeedback, type ToolExecution } from '../components/interactive/ToolExecutionFeedback';

// =============================================================================
// TYPES
// =============================================================================

export type InteractiveMode = 'mode1' | 'mode2';

/** Loaded conversation data for continuing an existing chat */
export interface LoadedConversation {
  id: string;
  title: string;
  metadata?: {
    agent_id?: string;
    mode?: string;
  };
  context?: {
    messages?: Array<{
      role: string;
      content: string;
      timestamp?: string;
    }>;
  };
  agent?: {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface InteractiveViewProps {
  /** Mode 1 = manual expert selection, Mode 2 = AI selection */
  mode: InteractiveMode;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Optional pre-selected agent ID (skips selection phase) */
  initialAgentId?: string;
  /** @deprecated Use initialAgentId instead */
  initialExpertId?: string;
  /** Session ID for conversation continuity */
  sessionId?: string;
  /** Custom class names */
  className?: string;
  /** Callback when mode changes */
  onModeChange?: (mode: InteractiveMode) => void;
  /** Pre-loaded conversation to continue */
  initialConversation?: LoadedConversation;
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
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];
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
  initialAgentId,
  initialExpertId, // Deprecated - use initialAgentId
  sessionId: initialSessionId,
  className,
  onModeChange,
  initialConversation,
}: InteractiveViewProps) {
  // Resolve effective agent ID (initialAgentId takes precedence over deprecated initialExpertId)
  const effectiveInitialAgentId = initialAgentId || initialExpertId;

  // Auth context for user ID (needed for message persistence)
  const { user } = useAuth();

  // Header actions context - allows injecting expert info into global header
  const { setActions: setHeaderActions } = useHeaderActions();

  // =========================================================================
  // STATE
  // =========================================================================

  // Session management
  const [sessionId] = useState(() => initialSessionId || uuidv4());

  // Conversation metadata for display
  const [conversationMeta, setConversationMeta] = useState<{
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
  } | null>(null);

  // Phase management
  // BOTH Mode 1 and Mode 2 now start in conversation phase
  // Mode 1: User picks expert from sidebar → Chats
  // Mode 2: User types message → Backend auto-selects expert → Chats (same UI as Mode 1)
  const [phase, setPhase] = useState<ViewPhase>(() => {
    // Skip selection if we have a loaded conversation or initial agent ID
    if (initialConversation || effectiveInitialAgentId) return 'conversation';
    // Both modes now start directly in conversation phase
    // Mode 1: User picks expert from sidebar
    // Mode 2: User types first message, backend auto-selects
    return 'conversation';
  });

  // Expert state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(() => {
    // If we have a loaded conversation with agent data, pre-populate expert
    if (initialConversation?.agent) {
      const agent = initialConversation.agent;
      return {
        id: agent.id,
        name: agent.display_name || agent.name,
        slug: agent.id,
        domain: agent.description || '',
        level: 'L2' as const,
        tier: 2,
        status: 'active',
        expertise: [],
        avatarUrl: agent.avatar_url,
      };
    }
    return null;
  });

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

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const lastScrollPositionRef = useRef(0);

  // =========================================================================
  // SSE STREAM HOOK
  // =========================================================================

  const { connect, disconnect, isStreaming, error: connectionError } = useSSEStream({
    url: mode === 'mode1'
      ? '/api/expert/mode1/stream'
      : '/api/expert/mode2/stream',

    // Token streaming - flushSync bypasses React 18 batching for real-time updates
    onToken: useCallback((event: TokenEvent) => {
      flushSync(() => {
        dispatch(streamActions.appendContent(event));
      });
    }, []),

    // Reasoning/thinking updates - flushSync for real-time thinking display
    onReasoning: useCallback((event: ReasoningEvent) => {
      flushSync(() => {
        dispatch(streamActions.addReasoning(event));
      });
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

    // Mode 2: Fusion auto-selected agent
    // Sets selectedExpert state when backend selects an agent via Fusion Search
    onAgentSelected: useCallback((event: { agent: { id: string; name: string; avatar_url?: string; department?: string; score?: number }; timestamp: number }) => {
      if (mode === 'mode2' && event.agent) {
        const fusionSelectedExpert: Expert = {
          id: event.agent.id,
          name: event.agent.name,
          slug: event.agent.id,
          domain: event.agent.department || '',
          level: 'L2', // Default level for Fusion-selected experts
          tier: 2,
          status: 'active',
          expertise: [],
          avatar: event.agent.avatar_url,
        };
        setSelectedExpert(fusionSelectedExpert);
        setPhase('conversation');
      }
    }, [mode]),

    // Auto-reconnect for robustness
    autoReconnect: true,
    maxReconnectAttempts: 3,
    reconnectDelayMs: 1000,
  });

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Set header actions with selected expert info
  // This injects expert info into the global header row
  useEffect(() => {
    if (selectedExpert && phase === 'conversation') {
      setHeaderActions(
        <div className="flex items-center gap-2">
          {/* Avatar with Lucide icon fallback */}
          <div className="relative flex items-center justify-center">
            {selectedExpert.avatar || (selectedExpert as Expert & { avatarUrl?: string }).avatarUrl ? (
              <img
                src={selectedExpert.avatar || (selectedExpert as Expert & { avatarUrl?: string }).avatarUrl}
                alt={selectedExpert.name}
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            {/* Online status indicator using Lucide Circle */}
            <Circle className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-green-500 fill-green-500 stroke-white stroke-[3]" />
          </div>
          {/* Name and level badge */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{selectedExpert.name}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {selectedExpert.level}
            </span>
          </div>
        </div>
      );
    } else {
      setHeaderActions(null);
    }

    // Cleanup on unmount
    return () => {
      setHeaderActions(null);
    };
  }, [selectedExpert, phase, setHeaderActions]);

  // Load initial conversation messages and metadata when provided
  useEffect(() => {
    if (!initialConversation) return;

    // Set conversation metadata for display (time, date, etc.)
    const contextMessages = initialConversation.context?.messages || [];
    setConversationMeta({
      title: initialConversation.title || 'Conversation',
      createdAt: initialConversation.created_at,
      updatedAt: initialConversation.updated_at,
      messageCount: contextMessages.length,
    });

    // Convert stored messages to Message type with timestamps
    const loadedMessages: Message[] = contextMessages.map((msg, index) => ({
      id: `loaded-${index}-${Date.now()}`,
      role: msg.role === 'human' || msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(initialConversation.created_at),
      // If assistant message, attach expert info
      ...(msg.role !== 'human' && msg.role !== 'user' && selectedExpert ? {
        expert: selectedExpert,
      } : {}),
    }));

    setMessages(loadedMessages);
  }, [initialConversation, selectedExpert]);

  // Listen for expert selection from sidebar (Mode 1)
  // This wires the global sidebar's expert selection to InteractiveView
  useEffect(() => {
    // Skip if Mode 2 (auto-select) or if we already have an initial expert
    if (mode === 'mode2') return;

    interface ExpertSelectedEvent {
      agentId: string;          // Primary field name (standardized)
      expertId?: string;        // Backwards compatibility
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

  // =========================================================================
  // SMART SCROLL LOGIC
  // =========================================================================

  // Track scroll position to detect if user is near bottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "near bottom" if within 150px of bottom
    isNearBottomRef.current = distanceFromBottom < 150;
    lastScrollPositionRef.current = scrollTop;
  }, []);

  // Attach scroll listener to messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smart auto-scroll: only scroll when user is near bottom
  // Uses scrollTop for smoother updates during streaming (no animation jitter)
  useEffect(() => {
    if (!isNearBottomRef.current) return; // Don't auto-scroll if user scrolled up

    const container = messagesContainerRef.current;
    if (!container) return;

    // Use requestAnimationFrame for smooth scroll during streaming
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [streamState.content]);

  // When new messages are added (not streaming), scroll to bottom with smooth animation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Reset near-bottom flag after adding new messages
    isNearBottomRef.current = true;
  }, [messages.length]);

  // =========================================================================
  // MESSAGE PERSISTENCE (must be defined before stream completion effect)
  // =========================================================================

  /**
   * Track if we've created the conversation in the database
   * This enables upsert logic: POST for new, PUT for existing
   */
  const [conversationCreated, setConversationCreated] = useState(!!initialConversation);

  /**
   * Persist messages to database via POST (create) or PUT (update)
   * This enables chat history to be displayed in sidebar and restored on click
   *
   * Upsert Logic:
   * - If initialConversation exists OR conversationCreated is true -> PUT to update
   * - Otherwise -> POST to create, then set conversationCreated=true
   */
  const persistMessages = useCallback(async (updatedMessages: Message[]) => {
    // Need user ID and session ID to persist
    if (!user?.id || !sessionId) {
      console.warn('[InteractiveView] Cannot persist messages: missing user or session ID');
      return;
    }

    try {
      // Convert Message[] to format expected by API (role, content, timestamp)
      const messagesForApi = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

      // Generate title from first user message if available
      const firstUserMessage = updatedMessages.find(m => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '')
        : 'New Conversation';

      // Determine if we need to CREATE (POST) or UPDATE (PUT)
      const isExistingConversation = !!initialConversation || conversationCreated;
      const method = isExistingConversation ? 'PUT' : 'POST';
      const conversationId = initialConversation?.id || sessionId;

      const requestBody = isExistingConversation
        ? {
            // PUT request body - requires conversationId
            userId: user.id,
            conversationId,
            title,
            messages: messagesForApi,
            agentId: selectedExpert?.id,
            mode: mode,
          }
        : {
            // POST request body - creates new conversation
            userId: user.id,
            title,
            messages: messagesForApi,
            agentId: selectedExpert?.id,
            mode: mode,
          };

      const response = await fetch('/api/conversations', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[InteractiveView] Failed to ${method} messages:`, errorText);

        // If PUT fails because conversation doesn't exist, try POST
        if (method === 'PUT' && response.status === 404) {
          console.log('[InteractiveView] Conversation not found, creating new one...');
          const createResponse = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              title,
              messages: messagesForApi,
              agentId: selectedExpert?.id,
              mode: mode,
            }),
          });

          if (createResponse.ok) {
            setConversationCreated(true);
          } else {
            console.error('[InteractiveView] Failed to create conversation:', await createResponse.text());
          }
        }
      } else {
        // Successfully persisted - mark as created for future updates
        if (method === 'POST') {
          setConversationCreated(true);
        }
      }
    } catch (error) {
      console.error('[InteractiveView] Error persisting messages:', error);
    }
  }, [user?.id, sessionId, initialConversation, conversationCreated, selectedExpert?.id, mode]);

  // Finalize assistant message when stream completes (with or without content)
  useEffect(() => {
    if (streamState.status === 'complete') {
      // Only create message if we have content OR reasoning (shows partial response)
      if (streamState.content || streamState.reasoning.length > 0) {
        const assistantMessage = createAssistantMessage(
          streamState.content || '(Response generation completed without content)',
          selectedExpert,
          streamState
        );
        setMessages(prev => {
          const updatedMessages = [...prev, assistantMessage];
          // Persist messages to database for sidebar history
          // Using setTimeout to ensure state update completes first
          setTimeout(() => persistMessages(updatedMessages), 100);
          return updatedMessages;
        });
      }
      // Reset stream state for next message
      dispatch(streamActions.reset());
    }
  }, [streamState.status, streamState.content, streamState.reasoning.length, selectedExpert, persistMessages]);

  // Handle stream errors - add error message to conversation
  useEffect(() => {
    if (streamState.status === 'error' && streamState.error) {
      console.error('[InteractiveView] Stream error:', streamState.error);

      // Create error message for the conversation
      const errorContent = `**Error:** ${streamState.error.message || 'An unexpected error occurred'}${
        streamState.error.recoverable ? '\n\n*You can try sending your message again.*' : ''
      }`;

      const errorMessage = createAssistantMessage(
        errorContent,
        selectedExpert,
        streamState
      );

      setMessages(prev => [...prev, errorMessage]);
      dispatch(streamActions.reset());
    }
  }, [streamState.status, streamState.error, selectedExpert]);

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

  // Note: Breadcrumb navigation is now handled globally by DashboardHeader
  // This provides consistent breadcrumb behavior across all pages

  // Helper to format conversation date/time for display
  const formatConversationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-white',
      // Interactive mode uses blue accent
      'interactive-view--blue-theme',
      className
    )}>
      {/* Breadcrumb removed - now handled by global DashboardHeader */}

      {/* Conversation Metadata Header (shown when loading existing conversation) */}
      {conversationMeta && (
        <div className="border-b bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedExpert && (
                <div className="flex items-center gap-2">
                  {(selectedExpert as Expert & { avatarUrl?: string }).avatarUrl ? (
                    <img
                      src={(selectedExpert as Expert & { avatarUrl?: string }).avatarUrl}
                      alt={selectedExpert.name}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedExpert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedExpert.domain}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs text-muted-foreground">
                Started {formatConversationDate(conversationMeta.createdAt)}
              </span>
              {conversationMeta.createdAt !== conversationMeta.updatedAt && (
                <span className="text-xs text-muted-foreground/70">
                  Last updated {formatConversationDate(conversationMeta.updatedAt)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60">
                {conversationMeta.messageCount} messages
              </span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════
            CONVERSATION PHASE (Identical UI for Mode 1 & 2)
            Mode 1: User picks expert from sidebar → Chats
            Mode 2: User types question → Backend auto-selects → Chats
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'conversation' && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            {/* Expert Header removed - now injected into global header via HeaderActionsContext */}

            {/* Message List - Centered container like Claude/ChatGPT */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-auto"
            >
              {/* Centered content wrapper for narrower, focused chat experience */}
              {/* flex-1 flex flex-col enables child empty states to expand with flex-1 */}
              <div className="max-w-4xl mx-auto p-4 space-y-4 min-h-full flex flex-col">
              {/* Empty state for Mode 1 (no expert): Guide user to pick expert from sidebar */}
              {mode === 'mode1' && !selectedExpert && messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center max-w-md"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                      <ArrowLeft className="h-8 w-8 text-purple-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      Select an Expert
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Browse and select an AI expert from the sidebar to start your conversation.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-purple-600 bg-purple-50 rounded-lg px-4 py-2">
                      <Users className="h-4 w-4" />
                      <span>Experts are organized by specialty</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  EMPTY STATE: Mode 2 (Auto-Select) - Prompt Input at TOP
                  User types question, backend auto-selects best expert
                  Same UI as Mode 1 with expert, but shows Fusion Intelligence branding
                  ═══════════════════════════════════════════════════════════════ */}
              {mode === 'mode2' && !selectedExpert && messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full max-w-3xl space-y-6">
                    {/* Welcome Header - Fusion Intelligence branding */}
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900 mb-2">
                        Ask Anything
                      </h2>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Describe your question and our Fusion Intelligence will automatically connect you with the best expert.
                      </p>
                    </div>

                    {/* Prompt Input for Mode 2 Auto-Select */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="w-full"
                    >
                      <VitalPromptInput
                        onSubmit={handleSend}
                        onEnhance={handlePromptEnhance}
                        isLoading={isStreaming}
                        onStop={() => disconnect()}
                        placeholder="What would you like help with today?"
                        showAttachments={true}
                        showEnhance={false}
                        maxLength={4000}
                      />
                    </motion.div>

                    {/* Mode indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Fusion Intelligence • Auto Expert Selection</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  EMPTY STATE: Prompt Starters + Input at TOP
                  (shown when expert selected but no messages yet)
                  ═══════════════════════════════════════════════════════════════ */}
              {messages.length === 0 && selectedExpert && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                  {isLoadingPromptStarters ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <p className="text-sm text-muted-foreground">Loading suggestions...</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-3xl space-y-6">
                      {/* Welcome Header */}
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-2">
                          <Sparkles className="h-4 w-4" />
                          {promptStarters.length > 0 ? 'Get Started' : 'Ready to Chat'}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {promptStarters.length > 0
                            ? 'Choose a topic or type your own question below'
                            : `Ask ${selectedExpert.name} anything`
                          }
                        </p>
                      </div>

                      {/* Prompt Starters Grid */}
                      {promptStarters.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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
                      )}

                      {/* ═══════════════════════════════════════════════════════════
                          PROMPT INPUT AT TOP - Centered under prompt starters
                          ═══════════════════════════════════════════════════════════ */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="w-full"
                      >
                        <VitalPromptInput
                          onSubmit={handleSend}
                          onEnhance={handlePromptEnhance}
                          isLoading={isStreaming}
                          onStop={() => disconnect()}
                          placeholder={`Ask ${selectedExpert.name}...`}
                          showAttachments={true}
                          showEnhance={true}
                          maxLength={4000}
                        />
                      </motion.div>
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
            </div>

            {/* Suggestion Chips (after stream completes) */}
            {!isStreaming && streamState.status === 'idle' && messages.length > 0 && streamState.suggestions && streamState.suggestions.length > 0 && (
              <div className="max-w-4xl mx-auto px-4">
                <VitalSuggestionChips
                  suggestions={streamState.suggestions}
                  onSelect={handleSuggestionSelect}
                  maxVisible={4}
                  layout="wrap"
                />
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                CHAT INPUT AT BOTTOM - Only shown after messages exist
                (Input starts at TOP under prompt starters, then moves here)
                ═══════════════════════════════════════════════════════════════ */}
            {/* For Mode 1: Only show input when expert is selected (from sidebar) */}
            {/* For Mode 2: Always show input once in conversation phase */}
            {/* IMPORTANT: Only show at bottom when messages.length > 0 (input moves from top) */}
            {messages.length > 0 && (mode === 'mode2' || selectedExpert) && (
              <div className="border-t bg-white/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-4xl mx-auto"
                >
                  <VitalPromptInput
                  onSubmit={handleSend}
                  onEnhance={handlePromptEnhance}
                  isLoading={isStreaming}
                  onStop={() => disconnect()}
                  placeholder={
                    selectedExpert
                      ? `Continue chatting with ${selectedExpert.name}...`
                      : 'Type your question...'
                  }
                  showAttachments={true}
                  showEnhance={!!selectedExpert}
                  maxLength={4000}
                />
                </motion.div>
              </div>
            )}
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
