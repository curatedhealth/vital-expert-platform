'use client';

/**
 * VITAL Platform - Panel Stream State Reducer
 *
 * Centralized state management for Panel Mission SSE events.
 * Handles multi-expert parallel execution, consensus building,
 * and HITL checkpoints.
 *
 * Event Types Handled:
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
}

export interface ExpertResponse {
  expertId: string;
  expertName: string;
  content: string;
  confidence: number;
  round: number;
  position?: string;
  vote?: number;
  timestamp: string;
}

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

export interface PanelStreamState {
  // Mission identity
  missionId: string | null;
  panelType: PanelType;
  goal: string;

  // Mission status
  status: PanelMissionStatus;
  progress: number;

  // Expert team
  experts: ExpertInfo[];
  expertCount: number;
  selectionMethod: 'manual' | 'fusion' | null;

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
  | { type: 'PANEL_STARTED'; payload: { missionId: string; panelType: PanelType; goal: string; maxRounds?: number } }
  | { type: 'PANEL_STATUS'; payload: { status: PanelMissionStatus; progress?: number } }
  | { type: 'PANEL_COMPLETED'; payload: { finalOutput?: FinalOutput; totalCost?: number; qualityScore?: number } }
  | { type: 'PANEL_PAUSED' }
  | { type: 'PANEL_RESUMED' }
  | { type: 'PANEL_CANCELLED'; payload?: { reason?: string } }

  // Expert team
  | { type: 'EXPERTS_SELECTED'; payload: { experts: ExpertInfo[]; selectionMethod: 'manual' | 'fusion' } }

  // Discussion rounds
  | { type: 'ROUND_STARTED'; payload: { round: number } }
  | { type: 'EXPERT_RESPONSE'; payload: ExpertResponse }
  | { type: 'ROUND_COMPLETE'; payload: { round: number; responses: ExpertResponse[] } }

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
  | { type: 'STREAM_RESET' };

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialPanelStreamState: PanelStreamState = {
  // Mission identity
  missionId: null,
  panelType: 'structured',
  goal: '',

  // Mission status
  status: 'pending',
  progress: 0,

  // Expert team
  experts: [],
  expertCount: 0,
  selectionMethod: null,

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
      return {
        ...state,
        missionId: action.payload.missionId,
        panelType: action.payload.panelType,
        goal: action.payload.goal,
        maxRounds: action.payload.maxRounds ?? 3,
        status: 'planning',
        progress: 5,
        startedAt: Date.now(),
        error: null,
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
        _updateTrigger: Date.now(),
      };

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
    maxRounds?: number
  ): PanelStreamAction => ({
    type: 'PANEL_STARTED',
    payload: { missionId, panelType, goal, maxRounds },
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
};
