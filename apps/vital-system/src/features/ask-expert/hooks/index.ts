/**
 * Ask Expert - Service-Specific Hooks
 * 
 * Hooks for the Ask Expert 4-Mode system. These wrap the shared
 * @vital/ai-ui hooks with Ask Expert specific logic.
 * 
 * Phase 4: Integration & Streaming
 */

// =============================================================================
// BASE SSE STREAMING HOOK
// =============================================================================

export {
  useSSEStream,
  type SSEEventType,
  type SSEEvent,
  type TokenEvent,
  type ReasoningEvent,
  type CitationEvent,
  type ToolCallEvent,
  type DelegationEvent,
  type CheckpointEvent,
  type ProgressEvent,
  type FusionEvent,
  type CostEvent,
  type ErrorEvent,
  type DoneEvent,
  type UseSSEStreamOptions,
  type UseSSEStreamReturn,
} from './useSSEStream';

// =============================================================================
// MODE-SPECIFIC HOOKS
// =============================================================================

export {
  useMode1Chat,
  type Message as Mode1Message,
  type Expert as Mode1Expert,
  type UseMode1ChatOptions,
  type UseMode1ChatReturn,
} from './useMode1Chat';

export {
  useMode2Chat,
  type Mode2Message,
  type SelectedExpert as Mode2SelectedExpert,
  type UseMode2ChatOptions,
  type UseMode2ChatReturn,
} from './useMode2Chat';

export {
  useMode3Mission,
  type MissionStep,
  type MissionResult,
  type MissionArtifact,
  type Expert as Mode3Expert,
  type CheckpointState,
  type UseMode3MissionOptions,
  type UseMode3MissionReturn,
  type StartMissionOptions,
} from './useMode3Mission';

export {
  useMode4Background,
  type MissionStatus,
  type PreFlightCheck,
  type BackgroundMission,
  type SelectedExpert as Mode4SelectedExpert,
  type MissionArtifact as Mode4MissionArtifact,
  type MissionNotification,
  type MissionStep as Mode4MissionStep,
  type UseMode4BackgroundOptions,
  type UseMode4BackgroundReturn,
  type CreateMissionOptions,
} from './useMode4Background';

// =============================================================================
// HITL CHECKPOINT HOOK
// =============================================================================

export {
  useCheckpoint,
  type UseCheckpointOptions,
  type UseCheckpointReturn,
} from './useCheckpoint';

// =============================================================================
// LEGACY MODE SELECTION HOOK
// =============================================================================

export {
  useAskExpertMode,
  MODE_CONFIGS,
  type ModeConfig,
  type UseAskExpertModeOptions,
  type AskExpertMode,
} from './useAskExpertMode';

// =============================================================================
// RE-EXPORT SHARED HOOKS FOR CONVENIENCE
// =============================================================================

export {
  useAskExpert,
  useExpertCompletion,
  type AskExpertOptions,
  type AgentInfo,
  type FusionEvidence,
  type ReasoningStep,
} from '@vital/ai-ui/hooks';

// Mission stream (shared)
export { useMissionStream } from '@/features/missions/hooks';
