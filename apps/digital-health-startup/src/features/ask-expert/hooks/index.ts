/**
 * Custom Hooks Index
 * 
 * Exports all custom hooks from the ask-expert feature.
 * This provides a clean import path for components.
 */

// Phase 1: Core hooks
export { useMessageManagement } from './useMessageManagement';
export { useModeLogic } from './useModeLogic';
export { useStreamingConnection } from './useStreamingConnection';
export { useToolOrchestration } from './useToolOrchestration';
export { useRAGIntegration } from './useRAGIntegration';

// Phase 2: Streaming improvements
export { useTokenStreaming } from './useTokenStreaming';
export { useStreamingProgress } from './useStreamingProgress';
export { useConnectionQuality } from './useConnectionQuality';
export { useTypingIndicator, useTimeEstimation } from './useTypingIndicator';
export { useStreamingMetrics } from './useStreamingMetrics';

// Export types
export type { Message, Source, CitationMeta, Conversation, AttachmentInfo } from '../types';
