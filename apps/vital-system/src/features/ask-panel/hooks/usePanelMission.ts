'use client';

/**
 * VITAL Platform - Panel Mission Hook
 *
 * Mode 4: Autonomous Panel Discussion
 * - Multi-expert parallel execution with consensus building
 * - Iterative refinement loops (confidence gate)
 * - HITL checkpoints for approval
 * - Quality gates (RACE/FACT metrics)
 * - Fusion Intelligence for expert auto-selection
 * - SSE streaming for real-time updates
 *
 * Panel Types:
 * - structured: Formal structured analysis
 * - open: Free-form discussion
 * - socratic: Question-based exploration
 * - adversarial: Devil's advocate approach
 * - delphi: Anonymous expert consensus
 * - hybrid: Combined approach with HITL
 */

import { useCallback, useReducer, useRef, useState } from 'react';
import {
  getPanelMissionClient,
  PanelMissionClient,
  CreatePanelMissionRequest,
  PanelType,
  PanelMissionExpert,
} from '@/lib/api/panel-client';
import {
  panelStreamReducer,
  initialPanelStreamState,
  panelStreamActions,
  panelStreamSelectors,
  PanelStreamState,
  ExpertResponse,
  ConsensusState,
  PanelCheckpoint,
  FinalOutput,
} from './panelStreamReducer';

// Re-export types for consumers
export type {
  PanelStreamState,
  ExpertResponse,
  ConsensusState,
  PanelCheckpoint,
  FinalOutput,
};

// =============================================================================
// TYPES
// =============================================================================

export interface UsePanelMissionOptions {
  onError?: (error: Error) => void;
  onCheckpoint?: (checkpoint: PanelCheckpoint) => void;
  onRoundComplete?: (round: number, responses: ExpertResponse[]) => void;
  onConsensusUpdate?: (consensus: ConsensusState) => void;
  onMissionComplete?: (output: FinalOutput) => void;
  onExpertsSelected?: (experts: PanelMissionExpert[]) => void;
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export interface StartPanelMissionOptions {
  context?: string;
  experts?: PanelMissionExpert[];
  maxRounds?: number;
  consensusThreshold?: number;
  budgetLimit?: number;
  autoApproveCheckpoints?: boolean;
}

export interface UsePanelMissionReturn {
  // State
  state: PanelStreamState;
  isLoading: boolean;
  isStreaming: boolean;
  isCheckpointPending: boolean;

  // Computed values
  progress: number;
  currentRound: number;
  expertCount: number;
  consensusScore: number | null;

  // Actions
  startMission: (goal: string, panelType: PanelType, options?: StartPanelMissionOptions) => void;
  resolveCheckpoint: (action: 'approve' | 'reject' | 'modify', feedback?: string) => Promise<void>;
  pauseMission: () => Promise<void>;
  resumeMission: () => Promise<void>;
  cancelMission: () => Promise<void>;
  reset: () => void;

  // Selectors
  getRoundResponses: (round: number) => ExpertResponse[];
  getAllResponses: () => ExpertResponse[];
  getDuration: () => number | null;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function usePanelMission(options: UsePanelMissionOptions = {}): UsePanelMissionReturn {
  const {
    onError,
    onCheckpoint,
    onRoundComplete,
    onConsensusUpdate,
    onMissionComplete,
    onExpertsSelected,
    onNotification,
  } = options;

  // State management
  const [state, dispatch] = useReducer(panelStreamReducer, initialPanelStreamState);
  const [isLoading, setIsLoading] = useState(false);

  // Client and abort controller refs
  const clientRef = useRef<PanelMissionClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get or create client
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = getPanelMissionClient();
    }
    return clientRef.current;
  }, []);

  // Start a new panel mission
  const startMission = useCallback(
    async (goal: string, panelType: PanelType, missionOptions?: StartPanelMissionOptions) => {
      try {
        setIsLoading(true);
        dispatch(panelStreamActions.streamConnect());

        // Cancel any existing stream
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const client = getClient();

        const request: CreatePanelMissionRequest = {
          goal,
          panel_type: panelType,
          context: missionOptions?.context,
          experts: missionOptions?.experts,
          options: {
            max_rounds: missionOptions?.maxRounds,
            consensus_threshold: missionOptions?.consensusThreshold,
            budget_limit: missionOptions?.budgetLimit,
            auto_approve_checkpoints: missionOptions?.autoApproveCheckpoints,
          },
        };

        // Stream mission with callbacks
        await client.streamMission(request, {
          onPanelStarted: (data) => {
            dispatch(
              panelStreamActions.panelStarted(
                data.mission_id || data.missionId,
                panelType,
                goal,
                missionOptions?.maxRounds
              )
            );
            onNotification?.('Panel discussion started', 'info');
          },

          onExpertsSelected: (data) => {
            const experts = data.experts || [];
            dispatch(
              panelStreamActions.expertsSelected(
                experts.map((e: any) => ({
                  id: e.id,
                  name: e.name,
                  model: e.model,
                  role: e.role,
                })),
                data.selection_method || 'fusion'
              )
            );
            onExpertsSelected?.(experts);
            onNotification?.(`${experts.length} experts selected`, 'info');
          },

          onRoundStarted: (data) => {
            dispatch(panelStreamActions.roundStarted(data.round || 1));
            onNotification?.(`Round ${data.round || 1} started`, 'info');
          },

          onExpertResponse: (data) => {
            dispatch(
              panelStreamActions.expertResponse({
                expertId: data.expert_id || data.expertId,
                expertName: data.expert_name || data.expertName,
                content: data.content,
                confidence: data.confidence || 0.8,
                round: data.round || state.currentRound,
                position: data.position,
                vote: data.vote,
                timestamp: data.timestamp || new Date().toISOString(),
              })
            );
          },

          onRoundComplete: (data) => {
            const responses = data.responses || [];
            dispatch(panelStreamActions.roundComplete(data.round || state.currentRound, responses));
            onRoundComplete?.(data.round || state.currentRound, responses);
          },

          onConsensusUpdate: (data) => {
            const consensus: Partial<ConsensusState> = {
              consensusScore: data.consensus_score || data.consensusScore,
              consensusLevel: data.consensus_level || data.consensusLevel,
              agreementPoints: data.agreement_points || data.agreementPoints,
              divergentPoints: data.divergent_points || data.divergentPoints,
              keyThemes: data.key_themes || data.keyThemes,
              recommendation: data.recommendation,
            };
            dispatch(panelStreamActions.consensusUpdate(consensus));
            if (
              consensus.consensusScore !== undefined &&
              consensus.consensusLevel !== undefined
            ) {
              onConsensusUpdate?.(consensus as ConsensusState);
            }
          },

          onCheckpointReached: (data) => {
            const checkpoint: PanelCheckpoint = {
              id: data.checkpoint_id || data.checkpointId || `cp_${Date.now()}`,
              type: data.type || 'approval',
              title: data.title || 'Review Panel Results',
              description: data.description || 'Please review the panel discussion and approve or provide feedback.',
              options: data.options || ['Approve', 'Request Changes', 'Cancel'],
              consensusScore: data.consensus_score || data.consensusScore || 0,
              roundCount: data.round_count || data.roundCount || state.currentRound,
              expertCount: data.expert_count || data.expertCount || state.expertCount,
              timestamp: data.timestamp || new Date().toISOString(),
            };
            dispatch(panelStreamActions.checkpointReached(checkpoint));
            onCheckpoint?.(checkpoint);
            onNotification?.('Checkpoint reached - your input required', 'warning');
          },

          onSynthesisComplete: (data) => {
            dispatch(
              panelStreamActions.synthesisComplete(data.content || '', data.artifacts)
            );
          },

          onPanelCompleted: (data) => {
            const finalOutput: FinalOutput = {
              content: data.final_output?.content || data.content || '',
              expertCount: data.expert_count || state.expertCount,
              roundCount: data.round_count || state.currentRound,
              consensus: state.consensus ?? undefined,
              artifacts: data.artifacts,
            };
            dispatch(
              panelStreamActions.panelCompleted(
                finalOutput,
                data.total_cost || data.totalCost,
                data.quality_score || data.qualityScore
              )
            );
            onMissionComplete?.(finalOutput);
            onNotification?.('Panel discussion completed successfully', 'success');
          },

          onPanelPaused: () => {
            dispatch(panelStreamActions.panelPaused());
            onNotification?.('Panel paused', 'info');
          },

          onPanelCancelled: (data) => {
            dispatch(panelStreamActions.panelCancelled(data?.reason));
            onNotification?.('Panel cancelled', 'info');
          },

          onError: (data) => {
            dispatch(
              panelStreamActions.streamError(
                data.code || 'UNKNOWN_ERROR',
                data.message || 'An error occurred',
                data.recoverable
              )
            );
            onError?.(new Error(data.message || 'An error occurred'));
            onNotification?.(data.message || 'An error occurred', 'error');
          },
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        dispatch(panelStreamActions.streamError('STREAM_ERROR', err.message, false));
        onError?.(err);
        onNotification?.(err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [
      getClient,
      onError,
      onCheckpoint,
      onRoundComplete,
      onConsensusUpdate,
      onMissionComplete,
      onExpertsSelected,
      onNotification,
      state.currentRound,
      state.expertCount,
      state.consensus,
    ]
  );

  // Resolve checkpoint
  const resolveCheckpoint = useCallback(
    async (action: 'approve' | 'reject' | 'modify', feedback?: string) => {
      if (!state.missionId || !state.checkpoint) {
        onError?.(new Error('No active checkpoint to resolve'));
        return;
      }

      try {
        const client = getClient();
        await client.resolveCheckpoint(
          state.missionId,
          state.checkpoint.id,
          action,
          feedback
        );
        dispatch(panelStreamActions.checkpointResolved(state.checkpoint.id, action));
        onNotification?.(`Checkpoint ${action}d`, 'success');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to resolve checkpoint');
        onError?.(err);
        onNotification?.(err.message, 'error');
      }
    },
    [state.missionId, state.checkpoint, getClient, onError, onNotification]
  );

  // Pause mission
  const pauseMission = useCallback(async () => {
    if (!state.missionId) {
      onError?.(new Error('No active mission to pause'));
      return;
    }

    try {
      const client = getClient();
      await client.pauseMission(state.missionId);
      dispatch(panelStreamActions.panelPaused());
      onNotification?.('Panel paused', 'info');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to pause mission');
      onError?.(err);
      onNotification?.(err.message, 'error');
    }
  }, [state.missionId, getClient, onError, onNotification]);

  // Resume mission
  const resumeMission = useCallback(async () => {
    if (!state.missionId) {
      onError?.(new Error('No active mission to resume'));
      return;
    }

    try {
      const client = getClient();
      await client.resumeMission(state.missionId);
      dispatch(panelStreamActions.panelResumed());
      onNotification?.('Panel resumed', 'info');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to resume mission');
      onError?.(err);
      onNotification?.(err.message, 'error');
    }
  }, [state.missionId, getClient, onError, onNotification]);

  // Cancel mission
  const cancelMission = useCallback(async () => {
    if (!state.missionId) {
      onError?.(new Error('No active mission to cancel'));
      return;
    }

    try {
      // Abort any active stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const client = getClient();
      await client.cancelMission(state.missionId);
      dispatch(panelStreamActions.panelCancelled('User cancelled'));
      onNotification?.('Panel cancelled', 'info');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to cancel mission');
      onError?.(err);
      onNotification?.(err.message, 'error');
    }
  }, [state.missionId, getClient, onError, onNotification]);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    dispatch(panelStreamActions.streamReset());
  }, []);

  // Computed values
  const isStreaming = panelStreamSelectors.isActive(state);
  const isCheckpointPending = panelStreamSelectors.hasActiveCheckpoint(state);

  return {
    // State
    state,
    isLoading,
    isStreaming,
    isCheckpointPending,

    // Computed values
    progress: state.progress,
    currentRound: state.currentRound,
    expertCount: state.expertCount,
    consensusScore: state.consensus?.consensusScore ?? null,

    // Actions
    startMission,
    resolveCheckpoint,
    pauseMission,
    resumeMission,
    cancelMission,
    reset,

    // Selectors
    getRoundResponses: (round: number) => panelStreamSelectors.getRoundResponses(state, round),
    getAllResponses: () => panelStreamSelectors.getAllResponses(state),
    getDuration: () => panelStreamSelectors.getDuration(state),
  };
}

export default usePanelMission;
