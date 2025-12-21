/**
 * @vital/ai-ui/v0 - v0 AI Generation Components
 * 
 * Components for integrating Vercel's v0 AI-powered UI generation
 * into the VITAL platform. Enables natural language UI creation
 * for workflow nodes, agent cards, panels, and more.
 * 
 * Domain K: v0 AI Generation (5 components)
 * 
 * Components:
 * - VitalV0GeneratorPanel - Complete generation interface
 * - VitalV0PreviewFrame - iframe preview with controls
 * - VitalV0PromptInput - Natural language input with examples
 * - VitalV0TypeSelector - Generation type selection
 * - VitalV0HistoryPanel - Generation history (future)
 * 
 * Usage:
 * ```tsx
 * import { VitalV0GeneratorPanel } from '@vital/ai-ui/v0';
 * 
 * <VitalV0GeneratorPanel
 *   defaultType="workflow-node"
 *   workflowContext={{
 *     name: 'KOL Engagement',
 *     domain: 'Medical Affairs',
 *     existingNodes: ['start', 'agent']
 *   }}
 *   onGenerationComplete={(result) => {
 *     // Handle generated component
 *   }}
 * />
 * ```
 * 
 * @package @vital/ai-ui
 * @since 1.1.0
 */

// Types
export type {
  V0GenerationType,
  V0GenerationStatus,
  V0WorkflowContext,
  V0AgentContext,
  V0PanelContext,
  V0GenerationContext,
  V0GenerationRequest,
  V0GenerationResponse,
  V0GenerationHistoryEntry,
  V0PromptExample,
  V0GenerationTypeConfig,
  V0GenerationState,
  VitalV0PreviewFrameProps,
  VitalV0GeneratorPanelProps,
  VitalV0PromptInputProps,
  VitalV0TypeSelectorProps,
  VitalV0HistoryPanelProps,
} from './types';

// Components
export { VitalV0GeneratorPanel, default as V0GeneratorPanel } from './VitalV0GeneratorPanel';
export { VitalV0PreviewFrame, default as V0PreviewFrame } from './VitalV0PreviewFrame';
export { VitalV0PromptInput, default as V0PromptInput } from './VitalV0PromptInput';
export { 
  VitalV0TypeSelector, 
  getV0TypeConfig,
  getV0TypeIcon,
  default as V0TypeSelector 
} from './VitalV0TypeSelector';

// Hooks
export { useV0Generation, default as useV0 } from './useV0Generation';
export type { UseV0GenerationOptions, UseV0GenerationReturn } from './useV0Generation';

// Re-export commonly used utilities
export { getV0TypeConfig as getTypeConfig } from './VitalV0TypeSelector';



















