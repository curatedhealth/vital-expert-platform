/**
 * VITAL AI UI - Fusion Intelligence Components (Domain H)
 * 
 * Components for displaying Fusion Intelligence evidence and decisions.
 * These are KEY DIFFERENTIATORS showing WHY teams were selected.
 * 5 components total.
 */

export { VitalFusionExplanation, default as FusionExplanation } from './VitalFusionExplanation';
export { VitalDecisionTrace, DecisionTraceSummary, default as DecisionTrace } from './VitalDecisionTrace';
export { VitalRRFVisualization, default as RRFVisualization } from './VitalRRFVisualization';
export { VitalTeamRecommendation, default as TeamRecommendation } from './VitalTeamRecommendation';
export { VitalRetrieverResults } from './VitalRetrieverResults';

// Re-export types
export type {
  RetrieverType,
  RetrieverResult,
  RetrieverData,
  VitalRetrieverResultsProps,
} from './VitalRetrieverResults';
