/**
 * Workflow Engine - Central export for workflow orchestration services
 * 
 * This file provides a clean interface for importing workflow engine
 * services and types throughout the application.
 */

export { 
  WorkflowEngine,
  type WorkflowState,
  type WorkflowInput,
  type WorkflowEvent,
  type WorkflowResult
} from './workflow-engine.service';
