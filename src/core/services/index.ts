/**
 * Core Services - Central export for all core services
 * 
 * This file provides a clean interface for importing core services
 * throughout the application, following clean architecture principles.
 */

// Agent Orchestrator
export * from './agent-orchestrator';

// Workflow Engine
export * from './workflow-engine';

// Re-export commonly used types
export type {
  AgentSelectionResult,
  AgentScoringResult,
  AgentSelectionContext,
  WorkflowState,
  WorkflowInput,
  WorkflowEvent,
  WorkflowResult
} from './agent-orchestrator';
