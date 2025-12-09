/**
 * VITAL Protocol
 * 
 * Shared type definitions and contracts between VITAL frontend and backend.
 * 
 * This package is the SINGLE SOURCE OF TRUTH for:
 * - Workflow definitions (React Flow ↔ LangGraph)
 * - API request/response schemas
 * - Event types for SSE streaming
 * - Node type definitions
 * 
 * @example
 * ```typescript
 * import { WorkflowSchema, validateWorkflow } from '@vital/protocol';
 * 
 * const workflow = validateWorkflow(jsonData);
 * ```
 */

// Re-export all schemas
export * from './schemas';

// Re-export all constants
export * from './constants';

// Re-export types (generated from schemas)
export * from './types';
