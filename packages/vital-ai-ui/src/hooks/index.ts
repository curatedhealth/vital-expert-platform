/**
 * VITAL AI UI - Custom Hooks
 * 
 * Hooks for integrating with Vercel AI SDK and backend services.
 * 
 * @see https://ai-sdk.dev/
 */

export {
  useAskExpert,
  useExpertCompletion,
} from './useAskExpert';

export type {
  AskExpertMode,
  AskExpertOptions,
  AgentInfo,
  FusionEvidence,
  ReasoningStep,
} from './useAskExpert';
