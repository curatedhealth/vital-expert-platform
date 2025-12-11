'use client';

/**
 * VITAL Platform - Stream State Reducer
 *
 * Centralized state management for all 15 SSE event types.
 * Provides type-safe actions and predictable state transitions.
 *
 * Event Types Handled:
 * 1. content/token - Streaming text content
 * 2. thinking - Agent reasoning/thinking process
 * 3. reasoning - Detailed reasoning steps
 * 4. citation - Evidence citations
 * 5. source - Source references
 * 6. artifact - Generated artifacts
 * 7. tool_start - Tool invocation start
 * 8. tool_result - Tool execution result
 * 9. agent_selected - Agent selection event
 * 10. delegation - Agent delegation
 * 11. progress - Progress updates
 * 12. checkpoint - HITL checkpoints
 * 13. complete - Stream completion
 * 14. error - Error events
 * 15. cost - Cost tracking
 */

import type {
  TokenEvent,
  ReasoningEvent,
  CitationEvent,
  ToolCallEvent,
  DelegationEvent,
  CheckpointEvent,
  ProgressEvent,
  FusionEvent,
  CostEvent,
  DoneEvent,
  ErrorEvent,
  ArtifactEvent,
  PlanEvent,
} from './useSSEStream';

// =============================================================================
// STREAM STATE SHAPE
// =============================================================================

export interface StreamState {
  // Content accumulation
  content: string;
  contentTokens: number;

  // Reasoning/Thinking (glass box transparency)
  reasoning: ReasoningEvent[];
  isThinking: boolean;
  thinkingPhase: 'idle' | 'analyzing' | 'planning' | 'executing' | 'synthesizing';

  // Evidence collection
  citations: CitationEvent[];
  sources: SourceEvent[];

  // Tool execution
  toolCalls: ToolCallEvent[];
  activeToolId: string | null;

  // Agent orchestration
  selectedAgent: AgentSelectedEvent | null;
  delegations: DelegationEvent[];

  // Artifacts (horizontal capability)
  artifacts: ArtifactEvent[];

  // Progress tracking
  progress: ProgressEvent | null;
  plan: PlanEvent | null;

  // HITL checkpoints
  checkpoint: CheckpointEvent | null;
  checkpointHistory: CheckpointEvent[];

  // Fusion Intelligence (Mode 2/4)
  fusion: FusionEvent | null;

  // Cost tracking
  cost: CostEvent | null;
  accumulatedCost: number;

  // Stream lifecycle
  status: StreamStatus;
  error: StreamError | null;
  startedAt: number | null;
  completedAt: number | null;

  // Completion data
  completion: DoneEvent | null;
}

export type StreamStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'thinking'
  | 'checkpoint_pending'
  | 'paused'
  | 'complete'
  | 'error';

export interface StreamError {
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: number;
}

export interface SourceEvent {
  id: string;
  type: 'pubmed' | 'fda' | 'clinical_trial' | 'web' | 'document' | 'rag';
  title: string;
  url?: string;
  relevance: number;
}

export interface AgentSelectedEvent {
  agentId: string;
  agentName: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  domain: string;
  confidence: number;
  selectionReason?: string;
}

// =============================================================================
// ACTION TYPES (All 15 SSE Events + Control Actions)
// =============================================================================

export type StreamAction =
  // Content events
  | { type: 'CONTENT_APPEND'; payload: TokenEvent }
  | { type: 'CONTENT_RESET' }

  // Thinking/Reasoning events
  | { type: 'THINKING_START'; payload: { phase: StreamState['thinkingPhase'] } }
  | { type: 'THINKING_UPDATE'; payload: ReasoningEvent }
  | { type: 'THINKING_END' }
  | { type: 'REASONING_ADD'; payload: ReasoningEvent }

  // Evidence events
  | { type: 'CITATION_ADD'; payload: CitationEvent }
  | { type: 'SOURCE_ADD'; payload: SourceEvent }

  // Artifact events
  | { type: 'ARTIFACT_ADD'; payload: ArtifactEvent }
  | { type: 'ARTIFACT_UPDATE'; payload: Partial<ArtifactEvent> & { id: string } }

  // Tool events
  | { type: 'TOOL_START'; payload: ToolCallEvent }
  | { type: 'TOOL_RESULT'; payload: ToolCallEvent }

  // Agent events
  | { type: 'AGENT_SELECTED'; payload: AgentSelectedEvent }
  | { type: 'DELEGATION_ADD'; payload: DelegationEvent }

  // Progress events
  | { type: 'PROGRESS_UPDATE'; payload: ProgressEvent }
  | { type: 'PLAN_SET'; payload: PlanEvent }

  // HITL events
  | { type: 'CHECKPOINT_RECEIVED'; payload: CheckpointEvent }
  | { type: 'CHECKPOINT_RESPONDED'; payload: { checkpointId: string; response: 'approve' | 'reject' | 'modify' } }
  | { type: 'CHECKPOINT_TIMEOUT'; payload: { checkpointId: string } }

  // Fusion Intelligence
  | { type: 'FUSION_UPDATE'; payload: FusionEvent }

  // Cost tracking
  | { type: 'COST_UPDATE'; payload: CostEvent }

  // Stream lifecycle
  | { type: 'STREAM_CONNECT' }
  | { type: 'STREAM_COMPLETE'; payload: DoneEvent }
  | { type: 'STREAM_ERROR'; payload: ErrorEvent }
  | { type: 'STREAM_RESET' }
  | { type: 'STREAM_PAUSE' }
  | { type: 'STREAM_RESUME' };

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialStreamState: StreamState = {
  // Content
  content: '',
  contentTokens: 0,

  // Reasoning
  reasoning: [],
  isThinking: false,
  thinkingPhase: 'idle',

  // Evidence
  citations: [],
  sources: [],

  // Tools
  toolCalls: [],
  activeToolId: null,

  // Agents
  selectedAgent: null,
  delegations: [],

  // Artifacts
  artifacts: [],

  // Progress
  progress: null,
  plan: null,

  // Checkpoints
  checkpoint: null,
  checkpointHistory: [],

  // Fusion
  fusion: null,

  // Cost
  cost: null,
  accumulatedCost: 0,

  // Lifecycle
  status: 'idle',
  error: null,
  startedAt: null,
  completedAt: null,
  completion: null,
};

// =============================================================================
// REDUCER
// =============================================================================

export function streamReducer(state: StreamState, action: StreamAction): StreamState {
  switch (action.type) {
    // =========================================================================
    // CONTENT EVENTS
    // =========================================================================
    case 'CONTENT_APPEND':
      return {
        ...state,
        content: state.content + action.payload.content,
        contentTokens: state.contentTokens + 1,
        status: 'streaming',
      };

    case 'CONTENT_RESET':
      return {
        ...state,
        content: '',
        contentTokens: 0,
      };

    // =========================================================================
    // THINKING/REASONING EVENTS
    // =========================================================================
    case 'THINKING_START':
      return {
        ...state,
        isThinking: true,
        thinkingPhase: action.payload.phase,
        status: 'thinking',
      };

    case 'THINKING_UPDATE':
      return {
        ...state,
        reasoning: updateOrAppendReasoning(state.reasoning, action.payload),
        isThinking: action.payload.status === 'thinking',
      };

    case 'THINKING_END':
      return {
        ...state,
        isThinking: false,
        thinkingPhase: 'idle',
        status: state.checkpoint ? 'checkpoint_pending' : 'streaming',
      };

    case 'REASONING_ADD':
      return {
        ...state,
        reasoning: updateOrAppendReasoning(state.reasoning, action.payload),
      };

    // =========================================================================
    // EVIDENCE EVENTS
    // =========================================================================
    case 'CITATION_ADD':
      // Deduplicate by ID
      if (state.citations.some((c) => c.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        citations: [...state.citations, action.payload],
      };

    case 'SOURCE_ADD':
      if (state.sources.some((s) => s.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        sources: [...state.sources, action.payload],
      };

    // =========================================================================
    // ARTIFACT EVENTS
    // =========================================================================
    case 'ARTIFACT_ADD':
      if (state.artifacts.some((a) => a.id === action.payload.id)) {
        // Update existing artifact
        return {
          ...state,
          artifacts: state.artifacts.map((a) =>
            a.id === action.payload.id ? { ...a, ...action.payload } : a
          ),
        };
      }
      return {
        ...state,
        artifacts: [...state.artifacts, action.payload],
      };

    case 'ARTIFACT_UPDATE':
      return {
        ...state,
        artifacts: state.artifacts.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        ),
      };

    // =========================================================================
    // TOOL EVENTS
    // =========================================================================
    case 'TOOL_START':
      return {
        ...state,
        toolCalls: updateOrAppendToolCall(state.toolCalls, action.payload),
        activeToolId: action.payload.id,
      };

    case 'TOOL_RESULT':
      return {
        ...state,
        toolCalls: updateOrAppendToolCall(state.toolCalls, action.payload),
        activeToolId: action.payload.status === 'success' || action.payload.status === 'error'
          ? null
          : state.activeToolId,
      };

    // =========================================================================
    // AGENT EVENTS
    // =========================================================================
    case 'AGENT_SELECTED':
      return {
        ...state,
        selectedAgent: action.payload,
      };

    case 'DELEGATION_ADD':
      return {
        ...state,
        delegations: [...state.delegations, action.payload],
      };

    // =========================================================================
    // PROGRESS EVENTS
    // =========================================================================
    case 'PROGRESS_UPDATE':
      return {
        ...state,
        progress: action.payload,
      };

    case 'PLAN_SET':
      return {
        ...state,
        plan: action.payload,
      };

    // =========================================================================
    // HITL CHECKPOINT EVENTS
    // =========================================================================
    case 'CHECKPOINT_RECEIVED':
      return {
        ...state,
        checkpoint: action.payload,
        checkpointHistory: [...state.checkpointHistory, action.payload],
        status: 'checkpoint_pending',
      };

    case 'CHECKPOINT_RESPONDED':
      return {
        ...state,
        checkpoint: null,
        status: 'streaming',
        checkpointHistory: state.checkpointHistory.map((cp) =>
          cp.id === action.payload.checkpointId
            ? { ...cp, status: action.payload.response === 'approve' ? 'approved' : 'rejected' }
            : cp
        ),
      };

    case 'CHECKPOINT_TIMEOUT':
      return {
        ...state,
        checkpoint: null,
        status: 'error',
        error: {
          code: 'CHECKPOINT_TIMEOUT',
          message: 'Checkpoint timed out without response',
          recoverable: false,
          timestamp: Date.now(),
        },
      };

    // =========================================================================
    // FUSION INTELLIGENCE
    // =========================================================================
    case 'FUSION_UPDATE':
      return {
        ...state,
        fusion: action.payload,
      };

    // =========================================================================
    // COST TRACKING
    // =========================================================================
    case 'COST_UPDATE':
      return {
        ...state,
        cost: action.payload,
        accumulatedCost: action.payload.currentCost, // Use currentCost from CostEvent
      };

    // =========================================================================
    // STREAM LIFECYCLE
    // =========================================================================
    case 'STREAM_CONNECT':
      return {
        ...state,
        status: 'connecting',
        startedAt: Date.now(),
        error: null,
      };

    case 'STREAM_COMPLETE':
      return {
        ...state,
        status: 'complete',
        completedAt: Date.now(),
        completion: action.payload,
        isThinking: false,
        checkpoint: null,
      };

    case 'STREAM_ERROR':
      return {
        ...state,
        status: 'error',
        error: {
          code: action.payload.code,
          message: action.payload.message,
          recoverable: action.payload.recoverable,
          timestamp: Date.now(),
        },
        isThinking: false,
      };

    case 'STREAM_RESET':
      return initialStreamState;

    case 'STREAM_PAUSE':
      return {
        ...state,
        status: 'paused',
      };

    case 'STREAM_RESUME':
      return {
        ...state,
        status: state.checkpoint ? 'checkpoint_pending' : 'streaming',
      };

    default:
      return state;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function updateOrAppendReasoning(
  existing: ReasoningEvent[],
  newEvent: ReasoningEvent
): ReasoningEvent[] {
  const index = existing.findIndex((r) => r.id === newEvent.id);
  if (index >= 0) {
    const updated = [...existing];
    updated[index] = newEvent;
    return updated;
  }
  return [...existing, newEvent];
}

function updateOrAppendToolCall(
  existing: ToolCallEvent[],
  newEvent: ToolCallEvent
): ToolCallEvent[] {
  const index = existing.findIndex((t) => t.id === newEvent.id);
  if (index >= 0) {
    const updated = [...existing];
    updated[index] = newEvent;
    return updated;
  }
  return [...existing, newEvent];
}

// =============================================================================
// SELECTORS (Memoization-friendly)
// =============================================================================

export const streamSelectors = {
  /** Get all active thinking steps */
  getActiveThinking: (state: StreamState): ReasoningEvent[] =>
    state.reasoning.filter((r) => r.status === 'thinking'),

  /** Get completed reasoning with duration */
  getCompletedReasoning: (state: StreamState): ReasoningEvent[] =>
    state.reasoning.filter((r) => r.status === 'complete'),

  /** Get citations sorted by confidence */
  getSortedCitations: (state: StreamState): CitationEvent[] =>
    [...state.citations].sort((a, b) => b.confidence - a.confidence),

  /** Check if any checkpoint is pending */
  hasActiveCheckpoint: (state: StreamState): boolean =>
    state.checkpoint !== null,

  /** Get total duration in ms */
  getDuration: (state: StreamState): number | null => {
    if (!state.startedAt) return null;
    const end = state.completedAt || Date.now();
    return end - state.startedAt;
  },

  /** Is stream actively processing */
  isActive: (state: StreamState): boolean =>
    ['connecting', 'streaming', 'thinking'].includes(state.status),

  /** Get artifacts by type */
  getArtifactsByType: (state: StreamState, artifactType: string): ArtifactEvent[] =>
    state.artifacts.filter((a) => a.artifactType === artifactType),
};

// =============================================================================
// ACTION CREATORS (Type-safe dispatchers)
// =============================================================================

export const streamActions = {
  appendContent: (payload: TokenEvent): StreamAction => ({
    type: 'CONTENT_APPEND',
    payload,
  }),

  addReasoning: (payload: ReasoningEvent): StreamAction => ({
    type: 'REASONING_ADD',
    payload,
  }),

  addCitation: (payload: CitationEvent): StreamAction => ({
    type: 'CITATION_ADD',
    payload,
  }),

  addArtifact: (payload: ArtifactEvent): StreamAction => ({
    type: 'ARTIFACT_ADD',
    payload,
  }),

  startTool: (payload: ToolCallEvent): StreamAction => ({
    type: 'TOOL_START',
    payload,
  }),

  toolResult: (payload: ToolCallEvent): StreamAction => ({
    type: 'TOOL_RESULT',
    payload,
  }),

  selectAgent: (payload: AgentSelectedEvent): StreamAction => ({
    type: 'AGENT_SELECTED',
    payload,
  }),

  addDelegation: (payload: DelegationEvent): StreamAction => ({
    type: 'DELEGATION_ADD',
    payload,
  }),

  updateProgress: (payload: ProgressEvent): StreamAction => ({
    type: 'PROGRESS_UPDATE',
    payload,
  }),

  setPlan: (payload: PlanEvent): StreamAction => ({
    type: 'PLAN_SET',
    payload,
  }),

  receiveCheckpoint: (payload: CheckpointEvent): StreamAction => ({
    type: 'CHECKPOINT_RECEIVED',
    payload,
  }),

  respondToCheckpoint: (
    checkpointId: string,
    response: 'approve' | 'reject' | 'modify'
  ): StreamAction => ({
    type: 'CHECKPOINT_RESPONDED',
    payload: { checkpointId, response },
  }),

  updateFusion: (payload: FusionEvent): StreamAction => ({
    type: 'FUSION_UPDATE',
    payload,
  }),

  updateCost: (payload: CostEvent): StreamAction => ({
    type: 'COST_UPDATE',
    payload,
  }),

  connect: (): StreamAction => ({ type: 'STREAM_CONNECT' }),

  complete: (payload: DoneEvent): StreamAction => ({
    type: 'STREAM_COMPLETE',
    payload,
  }),

  error: (payload: ErrorEvent): StreamAction => ({
    type: 'STREAM_ERROR',
    payload,
  }),

  reset: (): StreamAction => ({ type: 'STREAM_RESET' }),

  pause: (): StreamAction => ({ type: 'STREAM_PAUSE' }),

  resume: (): StreamAction => ({ type: 'STREAM_RESUME' }),
};
