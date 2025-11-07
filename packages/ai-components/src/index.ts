/**
 * @vital/ai-components
 * 
 * TAG: SHARED_AI_COMPONENTS_PACKAGE
 * 
 * Shared AI components for VITAL platform
 * 
 * Used across:
 * - Ask Expert (all 4 modes)
 * - Ask Panel
 * - Pharma Intelligence
 * - Other VITAL services
 * 
 * Benefits:
 * - Fix once, use everywhere
 * - Consistent UX across all services
 * - Easy testing
 * - Fast development
 * 
 * Usage:
 * ```tsx
 * import { KeyInsights, References } from '@vital/ai-components';
 * 
 * function MyComponent({ content, sources }) {
 *   return (
 *     <>
 *       <KeyInsights content={content} />
 *       <References sources={sources} />
 *     </>
 *   );
 * }
 * ```
 */

// Components
export { KeyInsights, useKeyInsights } from './components/KeyInsights';
export { References, useSourceScroll } from './components/References';
export { AIReasoning } from './components/AIReasoning';

// Types
export type {
  Source,
  ReasoningStep,
  MessageMetadata,
  ComponentBaseProps,
  KeyInsightsProps,
  ReferencesProps,
  InlineCitationProps,
} from './types';

// Re-export AIReasoning types
export type { AIReasoningProps } from './components/AIReasoning';

// Note: InlineCitation components are from Shadcn AI
// They should be imported directly from the Shadcn AI library:
// - import { InlineCitation, InlineCitationCard, ... } from '@/components/ui/shadcn-io/ai/inline-citation'

