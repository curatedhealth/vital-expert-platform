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
import { flushSync } from 'react-dom';
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
  ExpertInfo,
  DebateTurn,
  OrchestratorState,
  OrchestratorMessage,
  TopicAnalysis,
} from './panelStreamReducer';

// Re-export types for consumers
export type {
  PanelStreamState,
  ExpertResponse,
  ConsensusState,
  PanelCheckpoint,
  FinalOutput,
  OrchestratorState,
  OrchestratorMessage,
  TopicAnalysis,
};

// =============================================================================
// TYPES
// =============================================================================

export interface UsePanelMissionOptions {
  /** User ID for saving panel to history */
  userId?: string;
  /** Whether to automatically save completed panels to history */
  autoSave?: boolean;
  onError?: (error: Error) => void;
  onCheckpoint?: (checkpoint: PanelCheckpoint) => void;
  onRoundComplete?: (round: number, responses: ExpertResponse[]) => void;
  onConsensusUpdate?: (consensus: ConsensusState) => void;
  onMissionComplete?: (output: FinalOutput) => void;
  onExpertsSelected?: (experts: PanelMissionExpert[]) => void;
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onSaved?: (conversationId: string) => void;
  // === Token streaming callbacks ===
  onExpertStreamStart?: (expertId: string, expertName: string) => void;
  onExpertToken?: (expertId: string, token: string) => void;
  onExpertStreamEnd?: (expertId: string) => void;
  // === Debate-specific callbacks ===
  onTurnStarted?: (turn: DebateTurn) => void;
  onArgument?: (response: ExpertResponse) => void;
  onRebuttal?: (response: ExpertResponse) => void;
  onDebateSynthesis?: (response: ExpertResponse) => void;
  // === Orchestrator callbacks ===
  onOrchestratorThinking?: (message: string, phase?: string) => void;
  onOrchestratorMessage?: (message: string, phase?: string) => void;
  onOrchestratorDecision?: (message: string, experts?: string[], rationale?: string[]) => void;
  onOrchestratorIntervention?: (message: string, reason: string) => void;
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
  connectToMission: (missionId: string, streamUrl: string, panelType?: PanelType, goal?: string) => void;
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
    userId,
    autoSave = true,
    onError,
    onCheckpoint,
    onRoundComplete,
    onConsensusUpdate,
    onMissionComplete,
    onExpertsSelected,
    onNotification,
    onSaved,
    // Token streaming callbacks
    onExpertStreamStart,
    onExpertToken,
    onExpertStreamEnd,
    // Debate callbacks
    onTurnStarted,
    onArgument,
    onRebuttal,
    onDebateSynthesis,
    // Orchestrator callbacks
    onOrchestratorThinking,
    onOrchestratorMessage,
    onOrchestratorDecision,
    onOrchestratorIntervention,
  } = options;

  // State management
  const [state, dispatch] = useReducer(panelStreamReducer, initialPanelStreamState);
  const [isLoading, setIsLoading] = useState(false);

  // Keep a ref to state for use in callbacks (avoids stale closure)
  const stateRef = useRef(state);
  stateRef.current = state;

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

  // Save panel to history
  const savePanelToHistory = useCallback(
    async (
      finalOutput: FinalOutput,
      missionState: PanelStreamState,
      totalCost?: number,
      qualityScore?: number
    ) => {
      if (!autoSave) {
        console.log('[usePanelMission] Auto-save disabled, skipping history save');
        return;
      }

      if (!userId) {
        console.warn('[usePanelMission] No userId provided, cannot save to history');
        return;
      }

      try {
        const response = await fetch('/api/ask-panel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            missionId: missionState.missionId,
            goal: missionState.goal,
            panelType: missionState.panelType,
            experts: missionState.experts,
            responses: panelStreamSelectors.getAllResponses(missionState),
            consensus: missionState.consensus,
            finalOutput,
            totalCost,
            qualityScore,
            executionTimeMs: panelStreamSelectors.getDuration(missionState),
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('[usePanelMission] Panel saved to history:', data.conversationId);
          onSaved?.(data.conversationId);
        } else {
          console.error('[usePanelMission] Failed to save panel:', data.error);
        }
      } catch (error) {
        console.error('[usePanelMission] Error saving panel to history:', error);
      }
    },
    [userId, autoSave, onSaved]
  );

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
            // Map topology from backend to frontend type
            const topologyValue = data.topology === 'debate' ? 'debate' : 'parallel';
            dispatch(
              panelStreamActions.panelStarted(
                data.mission_id || data.missionId,
                panelType,
                goal,
                missionOptions?.maxRounds,
                topologyValue
              )
            );
            onNotification?.('Panel discussion started', 'info');
          },

          onExpertsSelected: (data) => {
            const experts = data.experts || [];
            const mappedExperts = experts.map((e: any) => ({
              id: e.id,
              name: e.name,
              model: e.model,
              role: e.role,
              position: e.position, // For debate panels
            }));

            // Check if this is a debate panel by looking at expert positions
            const hasDebatePositions = experts.some((e: any) =>
              e.position === 'pro' || e.position === 'con' || e.position === 'moderator'
            );

            // Also check panel type from current state
            const isDebate = stateRef.current.panelType === 'adversarial' ||
                            stateRef.current.topology === 'debate' ||
                            hasDebatePositions;

            if (isDebate && hasDebatePositions) {
              // Partition experts by position for debate topology
              const proExperts = mappedExperts.filter((e: any) => e.position === 'pro');
              const conExperts = mappedExperts.filter((e: any) => e.position === 'con');
              const moderatorExperts = mappedExperts.filter((e: any) => e.position === 'moderator');

              dispatch(
                panelStreamActions.debateExpertsAssigned(proExperts, conExperts, moderatorExperts)
              );
              onNotification?.(
                `Debate panel: ${proExperts.length} PRO, ${conExperts.length} CON, ${moderatorExperts.length} MOD`,
                'info'
              );
            } else {
              // Standard parallel topology
              dispatch(
                panelStreamActions.expertsSelected(mappedExperts, data.selection_method || 'fusion')
              );
              onNotification?.(`${experts.length} experts selected`, 'info');
            }

            onExpertsSelected?.(experts);
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
                round: data.round || stateRef.current.currentRound,
                position: data.position,
                vote: data.vote,
                timestamp: data.timestamp || new Date().toISOString(),
              })
            );
          },

          onRoundComplete: (data) => {
            const responses = data.responses || [];
            dispatch(panelStreamActions.roundComplete(data.round || stateRef.current.currentRound, responses));
            onRoundComplete?.(data.round || stateRef.current.currentRound, responses);
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
              roundCount: data.round_count || data.roundCount || stateRef.current.currentRound,
              expertCount: data.expert_count || data.expertCount || stateRef.current.expertCount,
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
            const currentState = stateRef.current;
            const finalOutput: FinalOutput = {
              content: data.final_output?.content || data.content || '',
              expertCount: data.expert_count || currentState.expertCount,
              roundCount: data.round_count || currentState.currentRound,
              consensus: currentState.consensus ?? undefined,
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

            // Save panel to history (use stateRef to get current state)
            savePanelToHistory(
              finalOutput,
              currentState,
              data.total_cost || data.totalCost,
              data.quality_score || data.qualityScore
            );
          },

          onPanelPaused: () => {
            dispatch(panelStreamActions.panelPaused());
            onNotification?.('Panel paused', 'info');
          },

          onPanelCancelled: (data) => {
            dispatch(panelStreamActions.panelCancelled(data?.reason));
            onNotification?.('Panel cancelled', 'info');
          },

          // === Token streaming callbacks (using flushSync for immediate DOM updates) ===
          onExpertStreamStart: (data) => {
            // Use flushSync to bypass React 18 batching for real-time streaming
            flushSync(() => {
              dispatch(
                panelStreamActions.expertStreamStart(
                  data.expert_id || data.expertId,
                  data.expert_name || data.expertName,
                  data.round || stateRef.current.currentRound,
                  data.position
                )
              );
            });
            onExpertStreamStart?.(
              data.expert_id || data.expertId,
              data.expert_name || data.expertName
            );
          },

          onExpertToken: (data) => {
            // CRITICAL: flushSync ensures each token is rendered immediately
            // without this, React 18 would batch multiple tokens together
            flushSync(() => {
              dispatch(
                panelStreamActions.expertTokenAppend(
                  data.expert_id || data.expertId,
                  data.token || data.content || ''
                )
              );
            });
            onExpertToken?.(
              data.expert_id || data.expertId,
              data.token || data.content || ''
            );
          },

          onExpertStreamEnd: (data) => {
            flushSync(() => {
              dispatch(
                panelStreamActions.expertStreamEnd(
                  data.expert_id || data.expertId,
                  data.confidence
                )
              );
            });
            onExpertStreamEnd?.(data.expert_id || data.expertId);
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

          // === Debate-specific callbacks ===
          onTurnStarted: (data) => {
            dispatch(
              panelStreamActions.turnStarted(
                data.position,
                data.round,
                data.is_rebuttal || data.isRebuttal || false,
                data.responding_to || data.respondingTo
              )
            );
            onTurnStarted?.({
              position: data.position,
              round: data.round,
              isRebuttal: data.is_rebuttal || data.isRebuttal || false,
              respondingTo: data.responding_to || data.respondingTo,
              timestamp: data.timestamp || new Date().toISOString(),
            });
          },

          onArgument: (data) => {
            const response: ExpertResponse = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.8,
              round: data.round || stateRef.current.currentRound,
              position: data.position || 'pro',
              timestamp: data.timestamp || new Date().toISOString(),
            };
            dispatch(panelStreamActions.argument(response));
            onArgument?.(response);
          },

          onRebuttal: (data) => {
            const response: ExpertResponse & { respondingTo: 'pro' | 'con' } = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.8,
              round: data.round || stateRef.current.currentRound,
              position: data.position || 'con',
              timestamp: data.timestamp || new Date().toISOString(),
              respondingTo: data.responding_to || data.respondingTo || 'pro',
            };
            dispatch(panelStreamActions.rebuttal(response));
            onRebuttal?.(response);
          },

          onDebateSynthesis: (data) => {
            const response: ExpertResponse = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.9,
              round: data.round || stateRef.current.currentRound,
              position: 'moderator',
              timestamp: data.timestamp || new Date().toISOString(),
            };
            dispatch(panelStreamActions.synthesis(response));
            onDebateSynthesis?.(response);
          },

          // === Orchestrator callbacks ===
          onOrchestratorThinking: (data) => {
            dispatch(
              panelStreamActions.orchestratorThinking(
                data.message,
                data.phase
              )
            );
            onOrchestratorThinking?.(data.message, data.phase);
          },

          onOrchestratorMessage: (data) => {
            dispatch(
              panelStreamActions.orchestratorMessage(
                data.message,
                data.phase,
                data.metadata
              )
            );
            onOrchestratorMessage?.(data.message, data.phase);
          },

          onOrchestratorDecision: (data) => {
            dispatch(
              panelStreamActions.orchestratorDecision(
                data.message,
                data.phase,
                data.experts,
                data.rationale
              )
            );
            onOrchestratorDecision?.(data.message, data.experts, data.rationale);
          },

          onOrchestratorIntervention: (data) => {
            dispatch(
              panelStreamActions.orchestratorIntervention(
                data.message,
                data.reason
              )
            );
            onOrchestratorIntervention?.(data.message, data.reason);
          },

          onTopicAnalysis: (data) => {
            dispatch(
              panelStreamActions.topicAnalysis({
                domain: data.domain || 'General',
                complexity: data.complexity || 'Medium',
                keyStakeholders: data.key_stakeholders || data.keyStakeholders || [],
                criticalFactors: data.critical_factors || data.criticalFactors || [],
                recommendedExpertise: data.recommended_expertise || data.recommendedExpertise || [],
                discussionFocus: data.discussion_focus || data.discussionFocus || '',
              })
            );
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
      savePanelToHistory,
      onError,
      onCheckpoint,
      onRoundComplete,
      onConsensusUpdate,
      onMissionComplete,
      onExpertsSelected,
      onNotification,
      onTurnStarted,
      onArgument,
      onRebuttal,
      onDebateSynthesis,
      onOrchestratorThinking,
      onOrchestratorMessage,
      onOrchestratorDecision,
      onOrchestratorIntervention,
    ]
  );

  // Connect to an existing mission stream (from wizard)
  const connectToMission = useCallback(
    async (missionId: string, streamUrl: string, panelType?: PanelType, goal?: string) => {
      try {
        setIsLoading(true);
        dispatch(panelStreamActions.streamConnect());

        // Set initial state with mission info
        dispatch(
          panelStreamActions.panelStarted(
            missionId,
            panelType || 'structured',
            goal || 'Wizard-created panel',
            3
          )
        );

        // Cancel any existing stream
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const client = getClient();

        onNotification?.('Connecting to panel discussion...', 'info');

        // Connect to the existing stream
        await client.connectToMissionStream(streamUrl, {
          onPanelStarted: (data) => {
            // Prioritize the full goal passed from wizard over the potentially truncated one from SSE
            // Map topology from backend to frontend type
            const topologyValue = data.topology === 'debate' ? 'debate' : 'parallel';
            dispatch(
              panelStreamActions.panelStarted(
                data.mission_id || data.missionId || missionId,
                data.panel_type || panelType || 'structured',
                goal || data.goal || 'Panel discussion',
                data.max_rounds || 3,
                topologyValue
              )
            );
            onNotification?.('Panel discussion started', 'info');
          },

          onExpertsSelected: (data) => {
            const experts = data.experts || [];
            const mappedExperts = experts.map((e: any) => ({
              id: e.id,
              name: e.name,
              model: e.model,
              role: e.role,
              position: e.position, // For debate panels
            }));

            // Check if this is a debate panel by looking at expert positions
            const hasDebatePositions = experts.some((e: any) =>
              e.position === 'pro' || e.position === 'con' || e.position === 'moderator'
            );

            // Also check panel type from current state
            const isDebate = stateRef.current.panelType === 'adversarial' ||
                            stateRef.current.topology === 'debate' ||
                            hasDebatePositions;

            if (isDebate && hasDebatePositions) {
              // Partition experts by position for debate topology
              const proExperts = mappedExperts.filter((e: any) => e.position === 'pro');
              const conExperts = mappedExperts.filter((e: any) => e.position === 'con');
              const moderatorExperts = mappedExperts.filter((e: any) => e.position === 'moderator');

              dispatch(
                panelStreamActions.debateExpertsAssigned(proExperts, conExperts, moderatorExperts)
              );
              onNotification?.(
                `Debate panel: ${proExperts.length} PRO, ${conExperts.length} CON, ${moderatorExperts.length} MOD`,
                'info'
              );
            } else {
              // Standard parallel topology
              dispatch(
                panelStreamActions.expertsSelected(mappedExperts, data.selection_method || 'wizard')
              );
              onNotification?.(`${experts.length} experts selected`, 'info');
            }

            onExpertsSelected?.(experts);
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
                round: data.round || stateRef.current.currentRound,
                position: data.position,
                vote: data.vote,
                timestamp: data.timestamp || new Date().toISOString(),
              })
            );
          },

          onRoundComplete: (data) => {
            const responses = data.responses || [];
            dispatch(panelStreamActions.roundComplete(data.round || stateRef.current.currentRound, responses));
            onRoundComplete?.(data.round || stateRef.current.currentRound, responses);
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
              roundCount: data.round_count || data.roundCount || stateRef.current.currentRound,
              expertCount: data.expert_count || data.expertCount || stateRef.current.expertCount,
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
            const currentState = stateRef.current;
            const finalOutput: FinalOutput = {
              content: data.final_output?.content || data.content || '',
              expertCount: data.expert_count || currentState.expertCount,
              roundCount: data.round_count || currentState.currentRound,
              consensus: currentState.consensus ?? undefined,
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

            // Save panel to history (use stateRef to get current state)
            savePanelToHistory(
              finalOutput,
              currentState,
              data.total_cost || data.totalCost,
              data.quality_score || data.qualityScore
            );
          },

          onPanelPaused: () => {
            dispatch(panelStreamActions.panelPaused());
            onNotification?.('Panel paused', 'info');
          },

          onPanelCancelled: (data) => {
            dispatch(panelStreamActions.panelCancelled(data?.reason));
            onNotification?.('Panel cancelled', 'info');
          },

          // === Token streaming callbacks (using flushSync for immediate DOM updates) ===
          onExpertStreamStart: (data) => {
            // Use flushSync to bypass React 18 batching for real-time streaming
            flushSync(() => {
              dispatch(
                panelStreamActions.expertStreamStart(
                  data.expert_id || data.expertId,
                  data.expert_name || data.expertName,
                  data.round || stateRef.current.currentRound,
                  data.position
                )
              );
            });
            onExpertStreamStart?.(
              data.expert_id || data.expertId,
              data.expert_name || data.expertName
            );
          },

          onExpertToken: (data) => {
            // CRITICAL: flushSync ensures each token is rendered immediately
            // without this, React 18 would batch multiple tokens together
            flushSync(() => {
              dispatch(
                panelStreamActions.expertTokenAppend(
                  data.expert_id || data.expertId,
                  data.token || data.content || ''
                )
              );
            });
            onExpertToken?.(
              data.expert_id || data.expertId,
              data.token || data.content || ''
            );
          },

          onExpertStreamEnd: (data) => {
            flushSync(() => {
              dispatch(
                panelStreamActions.expertStreamEnd(
                  data.expert_id || data.expertId,
                  data.confidence
                )
              );
            });
            onExpertStreamEnd?.(data.expert_id || data.expertId);
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

          // === Debate-specific callbacks ===
          onTurnStarted: (data) => {
            dispatch(
              panelStreamActions.turnStarted(
                data.position,
                data.round,
                data.is_rebuttal || data.isRebuttal || false,
                data.responding_to || data.respondingTo
              )
            );
            onTurnStarted?.({
              position: data.position,
              round: data.round,
              isRebuttal: data.is_rebuttal || data.isRebuttal || false,
              respondingTo: data.responding_to || data.respondingTo,
              timestamp: data.timestamp || new Date().toISOString(),
            });
          },

          onArgument: (data) => {
            const response: ExpertResponse = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.8,
              round: data.round || stateRef.current.currentRound,
              position: data.position || 'pro',
              timestamp: data.timestamp || new Date().toISOString(),
            };
            dispatch(panelStreamActions.argument(response));
            onArgument?.(response);
          },

          onRebuttal: (data) => {
            const response: ExpertResponse & { respondingTo: 'pro' | 'con' } = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.8,
              round: data.round || stateRef.current.currentRound,
              position: data.position || 'con',
              timestamp: data.timestamp || new Date().toISOString(),
              respondingTo: data.responding_to || data.respondingTo || 'pro',
            };
            dispatch(panelStreamActions.rebuttal(response));
            onRebuttal?.(response);
          },

          onDebateSynthesis: (data) => {
            const response: ExpertResponse = {
              expertId: data.expert_id || data.expertId,
              expertName: data.expert_name || data.expertName,
              content: data.content,
              confidence: data.confidence || 0.9,
              round: data.round || stateRef.current.currentRound,
              position: 'moderator',
              timestamp: data.timestamp || new Date().toISOString(),
            };
            dispatch(panelStreamActions.synthesis(response));
            onDebateSynthesis?.(response);
          },

          // === Orchestrator callbacks ===
          onOrchestratorThinking: (data) => {
            dispatch(
              panelStreamActions.orchestratorThinking(
                data.message,
                data.phase
              )
            );
            onOrchestratorThinking?.(data.message, data.phase);
          },

          onOrchestratorMessage: (data) => {
            dispatch(
              panelStreamActions.orchestratorMessage(
                data.message,
                data.phase,
                data.metadata
              )
            );
            onOrchestratorMessage?.(data.message, data.phase);
          },

          onOrchestratorDecision: (data) => {
            dispatch(
              panelStreamActions.orchestratorDecision(
                data.message,
                data.phase,
                data.experts,
                data.rationale
              )
            );
            onOrchestratorDecision?.(data.message, data.experts, data.rationale);
          },

          onOrchestratorIntervention: (data) => {
            dispatch(
              panelStreamActions.orchestratorIntervention(
                data.message,
                data.reason
              )
            );
            onOrchestratorIntervention?.(data.message, data.reason);
          },

          onTopicAnalysis: (data) => {
            dispatch(
              panelStreamActions.topicAnalysis({
                domain: data.domain || 'General',
                complexity: data.complexity || 'Medium',
                keyStakeholders: data.key_stakeholders || data.keyStakeholders || [],
                criticalFactors: data.critical_factors || data.criticalFactors || [],
                recommendedExpertise: data.recommended_expertise || data.recommendedExpertise || [],
                discussionFocus: data.discussion_focus || data.discussionFocus || '',
              })
            );
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
      savePanelToHistory,
      onError,
      onCheckpoint,
      onRoundComplete,
      onConsensusUpdate,
      onMissionComplete,
      onExpertsSelected,
      onNotification,
      onTurnStarted,
      onArgument,
      onRebuttal,
      onDebateSynthesis,
      onOrchestratorThinking,
      onOrchestratorMessage,
      onOrchestratorDecision,
      onOrchestratorIntervention,
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
    connectToMission,
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
