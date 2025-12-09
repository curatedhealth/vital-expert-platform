/**
 * VITAL AI UI - Data & Visualization Components (Domain D)
 * 
 * Components for displaying data tables, metrics, charts, and token usage.
 * 
 * Components (3):
 * - VitalDataTable: Data table with sorting/filtering
 * - VitalMetricCard: Key metric display cards
 * - VitalTokenContext: AI model token usage display
 */

export { VitalDataTable, default as DataTable } from './VitalDataTable';
export { VitalMetricCard, VitalMetricGrid, default as MetricCard } from './VitalMetricCard';

// Token Context (AI model usage display)
export {
  VitalTokenContext,
  VitalTokenContextTrigger,
  VitalTokenContextContent,
  VitalTokenContextContentHeader,
  VitalTokenContextContentBody,
  VitalTokenContextContentFooter,
  VitalTokenContextInputUsage,
  VitalTokenContextOutputUsage,
  VitalTokenContextReasoningUsage,
  VitalTokenContextCacheUsage,
  // Aliases matching ai-elements naming
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
  // Hook
  useTokenContext,
} from './VitalTokenContext';

// Re-export types
export type {
  LanguageModelUsage,
  ModelId,
  VitalTokenContextProps,
  VitalTokenContextTriggerProps,
  VitalTokenContextContentProps,
  VitalTokenContextContentHeaderProps,
  VitalTokenContextContentBodyProps,
  VitalTokenContextContentFooterProps,
  VitalTokenContextInputUsageProps,
  VitalTokenContextOutputUsageProps,
  VitalTokenContextReasoningUsageProps,
  VitalTokenContextCacheUsageProps,
} from './VitalTokenContext';
