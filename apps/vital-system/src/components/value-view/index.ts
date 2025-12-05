/**
 * Value View Components
 *
 * Interactive visualization components for VITAL's 8-layer semantic ontology.
 * Based on the VITAL Enterprise OS Ontology Handbook specifications.
 */

export { LayerStack } from './LayerStack'
export { OpportunityRadar } from './OpportunityRadar'
export { OpportunityDetailPanel } from './OpportunityDetailPanel'
export { ValueMetrics } from './ValueMetrics'
export { OntologyFilterStack } from './OntologyFilterStack'
export { GlobalFilters } from './GlobalFilters'
export { AIPoweredInsight } from './AIPoweredInsight'

// Re-export types from store for convenience
export type {
  LayerKey,
  LayerData,
  LayerItem,
  ODIOpportunity,
  ODITier,
  VPANESScores,
  ValueMetrics as ValueMetricsType,
  PersonaArchetype,
  ArchetypeKey,
  ViewMode,
  FilterState,
  FilterOption,
  FilterOptions,
} from '@/stores/valueViewStore'
