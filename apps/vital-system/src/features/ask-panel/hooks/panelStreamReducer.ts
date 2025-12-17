'use client';

/**
 * VITAL Platform - Panel Stream State Reducer
 *
 * Centralized state management for Panel Mission SSE events.
 * Supports both parallel execution and turn-based debate topologies.
 *
 * Event Types Handled:
 * === Parallel Panel Events ===
 * 1. panel_started - Panel discussion begins
 * 2. panel_status - Status updates
 * 3. experts_selected - Expert team assembled
 * 4. round_started - Discussion round begins
 * 5. expert_response - Individual expert response
 * 6. round_complete - Discussion round complete
 * 7. consensus_update - Consensus analysis update
 * 8. checkpoint_reached - HITL checkpoint
 * 9. checkpoint_resolved - Checkpoint resolved
 * 10. synthesis_complete - Final synthesis done
 * 11. panel_completed - Panel mission successful
 * 12. panel_paused - Panel paused
 * 13. panel_resumed - Panel resumed
 * 14. panel_cancelled - Panel cancelled
 * 15. error - Error events
 *
 * === Debate Panel Events (NEW) ===
 * 16. turn_started - A position (PRO/CON/MODERATOR) begins speaking
 * 17. argument - PRO presents initial argument
 * 18. rebuttal - Expert directly responds to opposition
 * 19. synthesis - Moderator synthesizes the debate
 * 20. debate_exchange - Complete exchange (argument + rebuttal pair)
 */

import type { PanelType, PanelMissionStatus } from '@/lib/api/panel-client';

// =============================================================================
// STATE SHAPE
// =============================================================================

export interface ExpertInfo {
  id: string;
  name: string;
  model?: string;
  role?: 'expert' | 'moderator' | 'advocate';
  position?: 'pro' | 'con' | 'moderator'; // For debate panels
}

export interface ExpertResponse {
  expertId: string;
  expertName: string;
  content: string;
  confidence: number;
  round: number;
  position?: 'pro' | 'con' | 'moderator';
  vote?: number;
  timestamp: string;
  isRebuttal?: boolean;      // True if responding to opposition
  respondingTo?: 'pro' | 'con'; // Which side this responds to
  isStreaming?: boolean;     // True if response is being streamed token by token
}

// Debate-specific types
export interface DebateExchange {
  round: number;
  proArgument: ExpertResponse | null;
  conRebuttal: ExpertResponse | null;
  moderatorSynthesis: ExpertResponse | null;
  timestamp: string;
}

export interface DebateTurn {
  position: 'pro' | 'con' | 'moderator';
  round: number;
  isRebuttal: boolean;
  respondingTo?: 'pro' | 'con';
  timestamp: string;
}

export type GraphTopology = 'parallel' | 'debate';

export interface ConsensusState {
  consensusScore: number;
  consensusLevel: 'high' | 'medium' | 'low';
  agreementPoints: string[];
  divergentPoints: string[];
  keyThemes: string[];
  recommendation: string;
}

export interface PanelCheckpoint {
  id: string;
  type: 'approval' | 'review' | 'feedback';
  title: string;
  description: string;
  options: string[];
  consensusScore: number;
  roundCount: number;
  expertCount: number;
  timestamp: string;
}

export interface FinalOutput {
  content: string;
  expertCount: number;
  roundCount: number;
  consensus?: ConsensusState;
  artifacts?: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
  }>;
}

export interface StreamingExpert {
  expertId: string;
  expertName: string;
  round: number;
  position?: 'pro' | 'con' | 'moderator';
  content: string;       // Accumulated tokens
  startedAt: number;
}

// =============================================================================
// ORCHESTRATOR TYPES
// =============================================================================

export interface OrchestratorMessage {
  id: string;
  type: 'thinking' | 'message' | 'decision' | 'intervention';
  message: string;
  phase?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TopicAnalysis {
  domain: string;
  complexity: 'Low' | 'Medium' | 'High';
  keyStakeholders: string[];
  criticalFactors: string[];
  recommendedExpertise: string[];
  discussionFocus: string;
}

export interface OrchestratorState {
  name: string;
  avatar: string;
  isThinking: boolean;
  currentPhase: string;
  messages: OrchestratorMessage[];
  topicAnalysis: TopicAnalysis | null;
  expertSelectionRationale: string[];
}

export interface PanelStreamState {
  // Mission identity
  missionId: string | null;
  panelType: PanelType;
  goal: string;

  // Graph topology (determines how responses are structured)
  topology: GraphTopology;

  // Mission status
  status: PanelMissionStatus;
  progress: number;

  // Expert team
  experts: ExpertInfo[];
  expertCount: number;
  selectionMethod: 'manual' | 'fusion' | null;

  // Token streaming state (tracks experts currently streaming)
  streamingExperts: Map<string, StreamingExpert>;

  // === Debate-specific state ===
  // Experts by position (for debate topology)
  proExperts: ExpertInfo[];
  conExperts: ExpertInfo[];
  moderatorExperts: ExpertInfo[];

  // Current turn tracking (for debate topology)
  currentTurn: DebateTurn | null;

  // Debate exchanges (for debate topology)
  debateExchanges: DebateExchange[];

  // Debate log (chronological events for UI animation)
  debateLog: Array<{
    type: 'turn_started' | 'argument' | 'rebuttal' | 'synthesis';
    position: 'pro' | 'con' | 'moderator';
    expertName?: string;
    content?: string;
    round: number;
    isRebuttal?: boolean;
    respondingTo?: 'pro' | 'con';
    timestamp: string;
  }>;

  // === Common state ===
  // Discussion rounds
  currentRound: number;
  maxRounds: number;
  roundResponses: ExpertResponse[][];

  // Consensus
  consensus: ConsensusState | null;

  // Checkpoint (HITL)
  checkpoint: PanelCheckpoint | null;
  checkpointHistory: PanelCheckpoint[];

  // Final output
  finalOutput: FinalOutput | null;

  // Cost and metrics
  totalCost: number;
  qualityScore: number | null;

  // Stream lifecycle
  error: PanelStreamError | null;
  startedAt: number | null;
  completedAt: number | null;

  // === Orchestrator State (NEW) ===
  orchestrator: OrchestratorState;

  // Force React re-render trigger
  _updateTrigger: number;
}

export interface PanelStreamError {
  code: string;
  message: string;
  recoverable: boolean;
  timestamp: number;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export type PanelStreamAction =
  // Panel lifecycle
  | { type: 'PANEL_STARTED'; payload: { missionId: string; panelType: PanelType; goal: string; maxRounds?: number; topology?: GraphTopology } }
  | { type: 'PANEL_STATUS'; payload: { status: PanelMissionStatus; progress?: number } }
  | { type: 'PANEL_COMPLETED'; payload: { finalOutput?: FinalOutput; totalCost?: number; qualityScore?: number } }
  | { type: 'PANEL_PAUSED' }
  | { type: 'PANEL_RESUMED' }
  | { type: 'PANEL_CANCELLED'; payload?: { reason?: string } }

  // Expert team (parallel topology)
  | { type: 'EXPERTS_SELECTED'; payload: { experts: ExpertInfo[]; selectionMethod: 'manual' | 'fusion' } }

  // Expert team (debate topology)
  | { type: 'DEBATE_EXPERTS_ASSIGNED'; payload: { proExperts: ExpertInfo[]; conExperts: ExpertInfo[]; moderatorExperts: ExpertInfo[] } }

  // Discussion rounds (parallel topology)
  | { type: 'ROUND_STARTED'; payload: { round: number } }
  | { type: 'EXPERT_RESPONSE'; payload: ExpertResponse }
  | { type: 'ROUND_COMPLETE'; payload: { round: number; responses: ExpertResponse[] } }

  // Token streaming (real-time expert responses)
  | { type: 'EXPERT_STREAM_START'; payload: { expertId: string; expertName: string; round: number; position?: 'pro' | 'con' | 'moderator' } }
  | { type: 'EXPERT_TOKEN_APPEND'; payload: { expertId: string; token: string } }
  | { type: 'EXPERT_STREAM_END'; payload: { expertId: string; confidence?: number } }

  // === Debate-specific actions (NEW) ===
  // Turn tracking
  | { type: 'TURN_STARTED'; payload: { position: 'pro' | 'con' | 'moderator'; round: number; isRebuttal: boolean; respondingTo?: 'pro' | 'con' } }

  // Arguments and rebuttals
  | { type: 'ARGUMENT'; payload: ExpertResponse }
  | { type: 'REBUTTAL'; payload: ExpertResponse & { respondingTo: 'pro' | 'con' } }
  | { type: 'SYNTHESIS'; payload: ExpertResponse }

  // Consensus
  | { type: 'CONSENSUS_UPDATE'; payload: Partial<ConsensusState> }

  // Checkpoints (HITL)
  | { type: 'CHECKPOINT_REACHED'; payload: PanelCheckpoint }
  | { type: 'CHECKPOINT_RESOLVED'; payload: { checkpointId: string; action: 'approve' | 'reject' | 'modify' } }

  // Synthesis
  | { type: 'SYNTHESIS_COMPLETE'; payload: { content: string; artifacts?: FinalOutput['artifacts'] } }

  // Stream lifecycle
  | { type: 'STREAM_CONNECT' }
  | { type: 'STREAM_ERROR'; payload: { code: string; message: string; recoverable?: boolean } }
  | { type: 'STREAM_RESET' }

  // === Orchestrator actions (NEW) ===
  | { type: 'ORCHESTRATOR_THINKING'; payload: { message: string; phase?: string } }
  | { type: 'ORCHESTRATOR_MESSAGE'; payload: { message: string; phase?: string; metadata?: Record<string, unknown> } }
  | { type: 'ORCHESTRATOR_DECISION'; payload: { message: string; phase?: string; experts?: string[]; rationale?: string[] } }
  | { type: 'ORCHESTRATOR_INTERVENTION'; payload: { message: string; reason: string } }
  | { type: 'TOPIC_ANALYSIS'; payload: TopicAnalysis };

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialPanelStreamState: PanelStreamState = {
  // Mission identity
  missionId: null,
  panelType: 'structured',
  goal: '',

  // Graph topology
  topology: 'parallel',

  // Mission status
  status: 'pending',
  progress: 0,

  // Expert team
  experts: [],
  expertCount: 0,
  selectionMethod: null,

  // Token streaming state
  streamingExperts: new Map(),

  // Debate-specific state
  proExperts: [],
  conExperts: [],
  moderatorExperts: [],
  currentTurn: null,
  debateExchanges: [],
  debateLog: [],

  // Discussion rounds
  currentRound: 0,
  maxRounds: 3,
  roundResponses: [],

  // Consensus
  consensus: null,

  // Checkpoint
  checkpoint: null,
  checkpointHistory: [],

  // Final output
  finalOutput: null,

  // Cost and metrics
  totalCost: 0,
  qualityScore: null,

  // Stream lifecycle
  error: null,
  startedAt: null,
  completedAt: null,

  // Orchestrator state
  orchestrator: {
    name: 'Panel Orchestrator',
    avatar: '/icons/png/avatars/avatar_0001.png',
    isThinking: false,
    currentPhase: '',
    messages: [],
    topicAnalysis: null,
    expertSelectionRationale: [],
  },

  // Update trigger
  _updateTrigger: 0,
};

// =============================================================================
// REDUCER
// =============================================================================

export function panelStreamReducer(
  state: PanelStreamState,
  action: PanelStreamAction
): PanelStreamState {
  switch (action.type) {
    // =========================================================================
    // PANEL LIFECYCLE
    // =========================================================================
    case 'PANEL_STARTED':
      // Determine topology from panel type or explicit payload
      const inferredTopology: GraphTopology = action.payload.topology ??
        (action.payload.panelType === 'adversarial' ? 'debate' : 'parallel');

      return {
        ...state,
        missionId: action.payload.missionId,
        panelType: action.payload.panelType,
        goal: action.payload.goal,
        topology: inferredTopology,
        maxRounds: action.payload.maxRounds ?? 3,
        status: 'planning',
        progress: 5,
        startedAt: Date.now(),
        error: null,
        // Reset debate state for new panel
        proExperts: [],
        conExperts: [],
        moderatorExperts: [],
        currentTurn: null,
        debateExchanges: [],
        debateLog: [],
        _updateTrigger: Date.now(),
      };

    case 'PANEL_STATUS':
      return {
        ...state,
        status: action.payload.status,
        progress: action.payload.progress ?? state.progress,
        _updateTrigger: Date.now(),
      };

    case 'PANEL_COMPLETED':
      return {
        ...state,
        status: 'completed',
        progress: 100,
        completedAt: Date.now(),
        finalOutput: action.payload.finalOutput ?? state.finalOutput,
        totalCost: action.payload.totalCost ?? state.totalCost,
        qualityScore: action.payload.qualityScore ?? state.qualityScore,
        checkpoint: null,
        _updateTrigger: Date.now(),
      };

    case 'PANEL_PAUSED':
      return {
        ...state,
        status: 'paused',
        _updateTrigger: Date.now(),
      };

    case 'PANEL_RESUMED':
      return {
        ...state,
        status: state.checkpoint ? 'checkpoint' : 'executing',
        _updateTrigger: Date.now(),
      };

    case 'PANEL_CANCELLED':
      return {
        ...state,
        status: 'cancelled',
        completedAt: Date.now(),
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // EXPERT TEAM
    // =========================================================================
    case 'EXPERTS_SELECTED':
      return {
        ...state,
        experts: action.payload.experts,
        expertCount: action.payload.experts.length,
        selectionMethod: action.payload.selectionMethod,
        status: 'executing',
        progress: 15,
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // DISCUSSION ROUNDS
    // =========================================================================
    case 'ROUND_STARTED':
      return {
        ...state,
        currentRound: action.payload.round,
        status: 'executing',
        // Progress: 15% base + up to 55% for rounds (15-70%)
        progress: Math.min(15 + (action.payload.round - 1) * 18, 70),
        _updateTrigger: Date.now(),
      };

    case 'EXPERT_RESPONSE': {
      const round = action.payload.round;
      const newRoundResponses = [...state.roundResponses];

      // Ensure we have an array for this round
      while (newRoundResponses.length < round) {
        newRoundResponses.push([]);
      }

      // Add response to the correct round (1-indexed to 0-indexed)
      const roundIndex = round - 1;
      if (!newRoundResponses[roundIndex]) {
        newRoundResponses[roundIndex] = [];
      }

      // Check if response from this expert already exists
      const existingIndex = newRoundResponses[roundIndex].findIndex(
        (r) => r.expertId === action.payload.expertId
      );

      if (existingIndex >= 0) {
        // Update existing response
        newRoundResponses[roundIndex][existingIndex] = action.payload;
      } else {
        // Add new response
        newRoundResponses[roundIndex].push(action.payload);
      }

      return {
        ...state,
        roundResponses: newRoundResponses,
        _updateTrigger: Date.now(),
      };
    }

    case 'ROUND_COMPLETE':
      return {
        ...state,
        status: 'consensus',
        // Update currentRound from round_complete event
        currentRound: action.payload.round || state.currentRound,
        // Progress: rounds complete at 70%
        progress: 70,
        // Clear any remaining streaming experts
        streamingExperts: new Map(),
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // TOKEN STREAMING - Real-time expert response streaming
    // =========================================================================
    case 'EXPERT_STREAM_START': {
      const newStreamingExperts = new Map(state.streamingExperts);
      newStreamingExperts.set(action.payload.expertId, {
        expertId: action.payload.expertId,
        expertName: action.payload.expertName,
        round: action.payload.round,
        position: action.payload.position,
        content: '',
        startedAt: Date.now(),
      });

      // Also add a placeholder response to roundResponses
      const newRoundResponses = [...state.roundResponses];
      const roundIndex = action.payload.round - 1;
      while (newRoundResponses.length <= roundIndex) {
        newRoundResponses.push([]);
      }
      if (!newRoundResponses[roundIndex]) {
        newRoundResponses[roundIndex] = [];
      }

      // Add streaming placeholder if not exists
      const existingIdx = newRoundResponses[roundIndex].findIndex(
        (r) => r.expertId === action.payload.expertId
      );
      if (existingIdx < 0) {
        newRoundResponses[roundIndex].push({
          expertId: action.payload.expertId,
          expertName: action.payload.expertName,
          content: '',
          confidence: 0,
          round: action.payload.round,
          position: action.payload.position,
          timestamp: new Date().toISOString(),
          isStreaming: true,
        });
      }

      return {
        ...state,
        streamingExperts: newStreamingExperts,
        roundResponses: newRoundResponses,
        _updateTrigger: Date.now(),
      };
    }

    case 'EXPERT_TOKEN_APPEND': {
      const streamingExpert = state.streamingExperts.get(action.payload.expertId);
      if (!streamingExpert) {
        // Expert not streaming, ignore token
        return state;
      }

      // Update streaming expert content
      const newStreamingExperts = new Map(state.streamingExperts);
      const updatedExpert = {
        ...streamingExpert,
        content: streamingExpert.content + action.payload.token,
      };
      newStreamingExperts.set(action.payload.expertId, updatedExpert);

      // Update the response in roundResponses with accumulated content
      const newRoundResponses = [...state.roundResponses];
      const roundIndex = streamingExpert.round - 1;
      if (newRoundResponses[roundIndex]) {
        const responseIdx = newRoundResponses[roundIndex].findIndex(
          (r) => r.expertId === action.payload.expertId
        );
        if (responseIdx >= 0) {
          newRoundResponses[roundIndex] = [...newRoundResponses[roundIndex]];
          newRoundResponses[roundIndex][responseIdx] = {
            ...newRoundResponses[roundIndex][responseIdx],
            content: updatedExpert.content,
          };
        }
      }

      return {
        ...state,
        streamingExperts: newStreamingExperts,
        roundResponses: newRoundResponses,
        _updateTrigger: Date.now(),
      };
    }

    case 'EXPERT_STREAM_END': {
      const streamingExpert = state.streamingExperts.get(action.payload.expertId);
      if (!streamingExpert) {
        return state;
      }

      // Remove from streaming experts
      const newStreamingExperts = new Map(state.streamingExperts);
      newStreamingExperts.delete(action.payload.expertId);

      // Finalize the response in roundResponses
      const newRoundResponses = [...state.roundResponses];
      const roundIndex = streamingExpert.round - 1;
      if (newRoundResponses[roundIndex]) {
        const responseIdx = newRoundResponses[roundIndex].findIndex(
          (r) => r.expertId === action.payload.expertId
        );
        if (responseIdx >= 0) {
          newRoundResponses[roundIndex] = [...newRoundResponses[roundIndex]];
          newRoundResponses[roundIndex][responseIdx] = {
            ...newRoundResponses[roundIndex][responseIdx],
            content: streamingExpert.content,
            confidence: action.payload.confidence ?? 0.8,
            isStreaming: false,
          };
        }
      }

      return {
        ...state,
        streamingExperts: newStreamingExperts,
        roundResponses: newRoundResponses,
        _updateTrigger: Date.now(),
      };
    }

    // =========================================================================
    // DEBATE TOPOLOGY - Expert Assignment
    // =========================================================================
    case 'DEBATE_EXPERTS_ASSIGNED': {
      const allExperts = [
        ...action.payload.proExperts.map(e => ({ ...e, position: 'pro' as const })),
        ...action.payload.conExperts.map(e => ({ ...e, position: 'con' as const })),
        ...action.payload.moderatorExperts.map(e => ({ ...e, position: 'moderator' as const })),
      ];

      return {
        ...state,
        topology: 'debate',
        proExperts: action.payload.proExperts,
        conExperts: action.payload.conExperts,
        moderatorExperts: action.payload.moderatorExperts,
        experts: allExperts,
        expertCount: allExperts.length,
        status: 'executing',
        progress: 15,
        _updateTrigger: Date.now(),
      };
    }

    // =========================================================================
    // DEBATE TOPOLOGY - Turn Tracking
    // =========================================================================
    case 'TURN_STARTED': {
      const turn: DebateTurn = {
        position: action.payload.position,
        round: action.payload.round,
        isRebuttal: action.payload.isRebuttal,
        respondingTo: action.payload.respondingTo,
        timestamp: new Date().toISOString(),
      };

      // Add to debate log
      const logEntry = {
        type: 'turn_started' as const,
        position: action.payload.position,
        round: action.payload.round,
        isRebuttal: action.payload.isRebuttal,
        respondingTo: action.payload.respondingTo,
        timestamp: new Date().toISOString(),
      };

      return {
        ...state,
        currentTurn: turn,
        currentRound: action.payload.round,
        debateLog: [...state.debateLog, logEntry],
        status: 'executing',
        _updateTrigger: Date.now(),
      };
    }

    // =========================================================================
    // DEBATE TOPOLOGY - Arguments & Rebuttals
    // =========================================================================
    case 'ARGUMENT': {
      // PRO presents initial argument
      const response: ExpertResponse = {
        ...action.payload,
        isRebuttal: false,
      };

      // Add to round responses
      const newResponses = [...state.roundResponses];
      const roundIdx = response.round - 1;
      while (newResponses.length <= roundIdx) {
        newResponses.push([]);
      }
      newResponses[roundIdx] = [...(newResponses[roundIdx] || []), response];

      // Add to debate log
      const logEntry = {
        type: 'argument' as const,
        position: response.position || 'pro',
        expertName: response.expertName,
        content: response.content,
        round: response.round,
        isRebuttal: false,
        timestamp: response.timestamp,
      };

      return {
        ...state,
        roundResponses: newResponses,
        debateLog: [...state.debateLog, logEntry],
        _updateTrigger: Date.now(),
      };
    }

    case 'REBUTTAL': {
      // CON responds to PRO's argument
      const response: ExpertResponse = {
        ...action.payload,
        isRebuttal: true,
        respondingTo: action.payload.respondingTo,
      };

      // Add to round responses
      const newResponses = [...state.roundResponses];
      const roundIdx = response.round - 1;
      while (newResponses.length <= roundIdx) {
        newResponses.push([]);
      }
      newResponses[roundIdx] = [...(newResponses[roundIdx] || []), response];

      // Add to debate log
      const logEntry = {
        type: 'rebuttal' as const,
        position: response.position || 'con',
        expertName: response.expertName,
        content: response.content,
        round: response.round,
        isRebuttal: true,
        respondingTo: action.payload.respondingTo,
        timestamp: response.timestamp,
      };

      return {
        ...state,
        roundResponses: newResponses,
        debateLog: [...state.debateLog, logEntry],
        _updateTrigger: Date.now(),
      };
    }

    case 'SYNTHESIS': {
      // Moderator synthesizes the debate
      const response: ExpertResponse = {
        ...action.payload,
        position: 'moderator',
      };

      // Add to round responses
      const newResponses = [...state.roundResponses];
      const roundIdx = response.round - 1;
      while (newResponses.length <= roundIdx) {
        newResponses.push([]);
      }
      newResponses[roundIdx] = [...(newResponses[roundIdx] || []), response];

      // Add to debate log
      const logEntry = {
        type: 'synthesis' as const,
        position: 'moderator' as const,
        expertName: response.expertName,
        content: response.content,
        round: response.round,
        timestamp: response.timestamp,
      };

      return {
        ...state,
        roundResponses: newResponses,
        debateLog: [...state.debateLog, logEntry],
        currentTurn: null, // Clear turn after moderator speaks
        _updateTrigger: Date.now(),
      };
    }

    // =========================================================================
    // CONSENSUS
    // =========================================================================
    case 'CONSENSUS_UPDATE':
      return {
        ...state,
        consensus: {
          consensusScore: action.payload.consensusScore ?? state.consensus?.consensusScore ?? 0,
          consensusLevel: action.payload.consensusLevel ?? state.consensus?.consensusLevel ?? 'low',
          agreementPoints: action.payload.agreementPoints ?? state.consensus?.agreementPoints ?? [],
          divergentPoints: action.payload.divergentPoints ?? state.consensus?.divergentPoints ?? [],
          keyThemes: action.payload.keyThemes ?? state.consensus?.keyThemes ?? [],
          recommendation: action.payload.recommendation ?? state.consensus?.recommendation ?? '',
        },
        progress: 80,
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // CHECKPOINTS (HITL)
    // =========================================================================
    case 'CHECKPOINT_REACHED':
      return {
        ...state,
        checkpoint: action.payload,
        checkpointHistory: [...state.checkpointHistory, action.payload],
        status: 'checkpoint',
        progress: 85,
        _updateTrigger: Date.now(),
      };

    case 'CHECKPOINT_RESOLVED':
      return {
        ...state,
        checkpoint: null,
        status: 'synthesizing',
        checkpointHistory: state.checkpointHistory.map((cp) =>
          cp.id === action.payload.checkpointId
            ? { ...cp, type: action.payload.action === 'approve' ? 'approval' : 'review' as const }
            : cp
        ),
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // SYNTHESIS
    // =========================================================================
    case 'SYNTHESIS_COMPLETE':
      return {
        ...state,
        status: 'synthesizing',
        progress: 95,
        finalOutput: {
          content: action.payload.content,
          expertCount: state.expertCount,
          roundCount: state.currentRound,
          consensus: state.consensus ?? undefined,
          artifacts: action.payload.artifacts,
        },
        _updateTrigger: Date.now(),
      };

    // =========================================================================
    // STREAM LIFECYCLE
    // =========================================================================
    case 'STREAM_CONNECT':
      return {
        ...state,
        status: 'pending',
        error: null,
        startedAt: Date.now(),
        _updateTrigger: Date.now(),
      };

    case 'STREAM_ERROR':
      return {
        ...state,
        status: 'failed',
        error: {
          code: action.payload.code,
          message: action.payload.message,
          recoverable: action.payload.recoverable ?? false,
          timestamp: Date.now(),
        },
        _updateTrigger: Date.now(),
      };

    case 'STREAM_RESET':
      return initialPanelStreamState;

    // =========================================================================
    // ORCHESTRATOR EVENTS (NEW)
    // =========================================================================
    case 'ORCHESTRATOR_THINKING': {
      const newMessage: OrchestratorMessage = {
        id: `orch-${Date.now()}`,
        type: 'thinking',
        message: action.payload.message,
        phase: action.payload.phase,
        timestamp: new Date().toISOString(),
      };

      return {
        ...state,
        orchestrator: {
          ...state.orchestrator,
          isThinking: true,
          currentPhase: action.payload.phase || state.orchestrator.currentPhase,
          messages: [...state.orchestrator.messages, newMessage],
        },
        _updateTrigger: Date.now(),
      };
    }

    case 'ORCHESTRATOR_MESSAGE': {
      const newMessage: OrchestratorMessage = {
        id: `orch-${Date.now()}`,
        type: 'message',
        message: action.payload.message,
        phase: action.payload.phase,
        timestamp: new Date().toISOString(),
        metadata: action.payload.metadata,
      };

      return {
        ...state,
        orchestrator: {
          ...state.orchestrator,
          isThinking: false,
          currentPhase: action.payload.phase || state.orchestrator.currentPhase,
          messages: [...state.orchestrator.messages, newMessage],
        },
        _updateTrigger: Date.now(),
      };
    }

    case 'ORCHESTRATOR_DECISION': {
      const newMessage: OrchestratorMessage = {
        id: `orch-${Date.now()}`,
        type: 'decision',
        message: action.payload.message,
        phase: action.payload.phase,
        timestamp: new Date().toISOString(),
        metadata: {
          experts: action.payload.experts,
          rationale: action.payload.rationale,
        },
      };

      return {
        ...state,
        orchestrator: {
          ...state.orchestrator,
          isThinking: false,
          currentPhase: action.payload.phase || state.orchestrator.currentPhase,
          messages: [...state.orchestrator.messages, newMessage],
          expertSelectionRationale: action.payload.rationale || state.orchestrator.expertSelectionRationale,
        },
        _updateTrigger: Date.now(),
      };
    }

    case 'ORCHESTRATOR_INTERVENTION': {
      const newMessage: OrchestratorMessage = {
        id: `orch-${Date.now()}`,
        type: 'intervention',
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        metadata: { reason: action.payload.reason },
      };

      return {
        ...state,
        orchestrator: {
          ...state.orchestrator,
          isThinking: false,
          messages: [...state.orchestrator.messages, newMessage],
        },
        _updateTrigger: Date.now(),
      };
    }

    case 'TOPIC_ANALYSIS': {
      return {
        ...state,
        orchestrator: {
          ...state.orchestrator,
          topicAnalysis: action.payload,
        },
        _updateTrigger: Date.now(),
      };
    }

    default:
      return state;
  }
}

// =============================================================================
// ACTION CREATORS
// =============================================================================

export const panelStreamActions = {
  panelStarted: (
    missionId: string,
    panelType: PanelType,
    goal: string,
    maxRounds?: number,
    topology?: GraphTopology
  ): PanelStreamAction => ({
    type: 'PANEL_STARTED',
    payload: { missionId, panelType, goal, maxRounds, topology },
  }),

  panelStatus: (status: PanelMissionStatus, progress?: number): PanelStreamAction => ({
    type: 'PANEL_STATUS',
    payload: { status, progress },
  }),

  panelCompleted: (
    finalOutput?: FinalOutput,
    totalCost?: number,
    qualityScore?: number
  ): PanelStreamAction => ({
    type: 'PANEL_COMPLETED',
    payload: { finalOutput, totalCost, qualityScore },
  }),

  panelPaused: (): PanelStreamAction => ({ type: 'PANEL_PAUSED' }),

  panelResumed: (): PanelStreamAction => ({ type: 'PANEL_RESUMED' }),

  panelCancelled: (reason?: string): PanelStreamAction => ({
    type: 'PANEL_CANCELLED',
    payload: { reason },
  }),

  expertsSelected: (
    experts: ExpertInfo[],
    selectionMethod: 'manual' | 'fusion'
  ): PanelStreamAction => ({
    type: 'EXPERTS_SELECTED',
    payload: { experts, selectionMethod },
  }),

  roundStarted: (round: number): PanelStreamAction => ({
    type: 'ROUND_STARTED',
    payload: { round },
  }),

  expertResponse: (response: ExpertResponse): PanelStreamAction => ({
    type: 'EXPERT_RESPONSE',
    payload: response,
  }),

  roundComplete: (round: number, responses: ExpertResponse[]): PanelStreamAction => ({
    type: 'ROUND_COMPLETE',
    payload: { round, responses },
  }),

  consensusUpdate: (consensus: Partial<ConsensusState>): PanelStreamAction => ({
    type: 'CONSENSUS_UPDATE',
    payload: consensus,
  }),

  checkpointReached: (checkpoint: PanelCheckpoint): PanelStreamAction => ({
    type: 'CHECKPOINT_REACHED',
    payload: checkpoint,
  }),

  checkpointResolved: (
    checkpointId: string,
    action: 'approve' | 'reject' | 'modify'
  ): PanelStreamAction => ({
    type: 'CHECKPOINT_RESOLVED',
    payload: { checkpointId, action },
  }),

  synthesisComplete: (
    content: string,
    artifacts?: FinalOutput['artifacts']
  ): PanelStreamAction => ({
    type: 'SYNTHESIS_COMPLETE',
    payload: { content, artifacts },
  }),

  streamConnect: (): PanelStreamAction => ({ type: 'STREAM_CONNECT' }),

  streamError: (
    code: string,
    message: string,
    recoverable?: boolean
  ): PanelStreamAction => ({
    type: 'STREAM_ERROR',
    payload: { code, message, recoverable },
  }),

  streamReset: (): PanelStreamAction => ({ type: 'STREAM_RESET' }),

  // === Token streaming action creators ===

  expertStreamStart: (
    expertId: string,
    expertName: string,
    round: number,
    position?: 'pro' | 'con' | 'moderator'
  ): PanelStreamAction => ({
    type: 'EXPERT_STREAM_START',
    payload: { expertId, expertName, round, position },
  }),

  expertTokenAppend: (expertId: string, token: string): PanelStreamAction => ({
    type: 'EXPERT_TOKEN_APPEND',
    payload: { expertId, token },
  }),

  expertStreamEnd: (expertId: string, confidence?: number): PanelStreamAction => ({
    type: 'EXPERT_STREAM_END',
    payload: { expertId, confidence },
  }),

  // === Debate-specific action creators ===

  debateExpertsAssigned: (
    proExperts: ExpertInfo[],
    conExperts: ExpertInfo[],
    moderatorExperts: ExpertInfo[]
  ): PanelStreamAction => ({
    type: 'DEBATE_EXPERTS_ASSIGNED',
    payload: { proExperts, conExperts, moderatorExperts },
  }),

  turnStarted: (
    position: 'pro' | 'con' | 'moderator',
    round: number,
    isRebuttal: boolean,
    respondingTo?: 'pro' | 'con'
  ): PanelStreamAction => ({
    type: 'TURN_STARTED',
    payload: { position, round, isRebuttal, respondingTo },
  }),

  argument: (response: ExpertResponse): PanelStreamAction => ({
    type: 'ARGUMENT',
    payload: response,
  }),

  rebuttal: (response: ExpertResponse & { respondingTo: 'pro' | 'con' }): PanelStreamAction => ({
    type: 'REBUTTAL',
    payload: response,
  }),

  synthesis: (response: ExpertResponse): PanelStreamAction => ({
    type: 'SYNTHESIS',
    payload: response,
  }),

  // === Orchestrator action creators (NEW) ===

  orchestratorThinking: (message: string, phase?: string): PanelStreamAction => ({
    type: 'ORCHESTRATOR_THINKING',
    payload: { message, phase },
  }),

  orchestratorMessage: (
    message: string,
    phase?: string,
    metadata?: Record<string, unknown>
  ): PanelStreamAction => ({
    type: 'ORCHESTRATOR_MESSAGE',
    payload: { message, phase, metadata },
  }),

  orchestratorDecision: (
    message: string,
    phase?: string,
    experts?: string[],
    rationale?: string[]
  ): PanelStreamAction => ({
    type: 'ORCHESTRATOR_DECISION',
    payload: { message, phase, experts, rationale },
  }),

  orchestratorIntervention: (message: string, reason: string): PanelStreamAction => ({
    type: 'ORCHESTRATOR_INTERVENTION',
    payload: { message, reason },
  }),

  topicAnalysis: (analysis: TopicAnalysis): PanelStreamAction => ({
    type: 'TOPIC_ANALYSIS',
    payload: analysis,
  }),
};

// =============================================================================
// SELECTORS
// =============================================================================

export const panelStreamSelectors = {
  /** Get all responses for a specific round */
  getRoundResponses: (state: PanelStreamState, round: number): ExpertResponse[] =>
    state.roundResponses[round - 1] ?? [],

  /** Get all responses flattened */
  getAllResponses: (state: PanelStreamState): ExpertResponse[] =>
    state.roundResponses.flat(),

  /** Get response count for current round */
  getCurrentRoundResponseCount: (state: PanelStreamState): number =>
    state.roundResponses[state.currentRound - 1]?.length ?? 0,

  /** Check if checkpoint is pending */
  hasActiveCheckpoint: (state: PanelStreamState): boolean =>
    state.checkpoint !== null,

  /** Get total duration in ms */
  getDuration: (state: PanelStreamState): number | null => {
    if (!state.startedAt) return null;
    const end = state.completedAt ?? Date.now();
    return end - state.startedAt;
  },

  /** Is panel actively processing */
  isActive: (state: PanelStreamState): boolean =>
    ['pending', 'planning', 'selecting', 'executing', 'consensus', 'synthesizing'].includes(
      state.status
    ),

  /** Is panel awaiting user action */
  isAwaitingUser: (state: PanelStreamState): boolean =>
    state.status === 'checkpoint' || state.status === 'paused',

  /** Get consensus level as number (0-100) */
  getConsensusPercent: (state: PanelStreamState): number =>
    (state.consensus?.consensusScore ?? 0) * 100,

  // === Token streaming selectors ===

  /** Get all currently streaming experts */
  getStreamingExperts: (state: PanelStreamState): StreamingExpert[] =>
    Array.from(state.streamingExperts.values()),

  /** Check if any expert is currently streaming */
  hasStreamingExperts: (state: PanelStreamState): boolean =>
    state.streamingExperts.size > 0,

  /** Get streaming content for a specific expert */
  getStreamingContent: (state: PanelStreamState, expertId: string): string | null =>
    state.streamingExperts.get(expertId)?.content ?? null,

  /** Get responses that are currently streaming */
  getStreamingResponses: (state: PanelStreamState): ExpertResponse[] =>
    state.roundResponses.flat().filter((r) => r.isStreaming === true),

  // === Debate-specific selectors ===

  /** Check if this is a debate topology */
  isDebate: (state: PanelStreamState): boolean =>
    state.topology === 'debate',

  /** Get current turn info */
  getCurrentTurn: (state: PanelStreamState): DebateTurn | null =>
    state.currentTurn,

  /** Get PRO arguments for a specific round */
  getProArguments: (state: PanelStreamState, round?: number): ExpertResponse[] => {
    const allResponses = state.roundResponses.flat();
    return allResponses.filter(
      (r) => r.position === 'pro' && (round === undefined || r.round === round)
    );
  },

  /** Get CON arguments for a specific round */
  getConArguments: (state: PanelStreamState, round?: number): ExpertResponse[] => {
    const allResponses = state.roundResponses.flat();
    return allResponses.filter(
      (r) => r.position === 'con' && (round === undefined || r.round === round)
    );
  },

  /** Get moderator syntheses */
  getModeratorSyntheses: (state: PanelStreamState): ExpertResponse[] => {
    const allResponses = state.roundResponses.flat();
    return allResponses.filter((r) => r.position === 'moderator');
  },

  /** Get debate log (chronological events) */
  getDebateLog: (state: PanelStreamState) => state.debateLog,

  /** Get debate exchanges structured by round */
  getDebateExchangesByRound: (state: PanelStreamState): Map<number, DebateExchange> => {
    const exchanges = new Map<number, DebateExchange>();
    const allResponses = state.roundResponses.flat();

    for (let round = 1; round <= state.currentRound; round++) {
      const proArg = allResponses.find((r) => r.position === 'pro' && r.round === round) || null;
      const conArg = allResponses.find((r) => r.position === 'con' && r.round === round) || null;
      const modSyn = allResponses.find((r) => r.position === 'moderator' && r.round === round) || null;

      exchanges.set(round, {
        round,
        proArgument: proArg,
        conRebuttal: conArg,
        moderatorSynthesis: modSyn,
        timestamp: proArg?.timestamp || new Date().toISOString(),
      });
    }

    return exchanges;
  },
};
