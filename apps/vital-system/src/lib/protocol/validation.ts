/**
 * Protocol Validation Utilities
 * 
 * Frontend validation using Protocol Zod schemas.
 * Ensures data integrity before API calls.
 */

import { z } from 'zod';
import {
  WorkflowSchema,
  WorkflowCreateSchema,
  ExpertRequestSchema,
  WorkflowNodeSchema,
  WorkflowEdgeSchema,
} from '@vital-path/protocol';

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Validate a workflow definition against the Protocol schema.
 */
export function validateWorkflow(workflow: unknown): ValidationResult {
  try {
    const result = WorkflowSchema.safeParse(workflow);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : 'Unknown error' }],
    };
  }
}

/**
 * Validate a workflow creation request.
 */
export function validateWorkflowCreate(data: unknown): ValidationResult {
  try {
    const result = WorkflowCreateSchema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : 'Unknown error' }],
    };
  }
}

/**
 * Validate an expert request.
 */
export function validateExpertRequest(request: unknown): ValidationResult {
  try {
    const result = ExpertRequestSchema.safeParse(request);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : 'Unknown error' }],
    };
  }
}

/**
 * Validate a workflow node.
 */
export function validateNode(node: unknown): ValidationResult {
  try {
    const result = WorkflowNodeSchema.safeParse(node);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : 'Unknown error' }],
    };
  }
}

/**
 * Validate a workflow edge.
 */
export function validateEdge(edge: unknown): ValidationResult {
  try {
    const result = WorkflowEdgeSchema.safeParse(edge);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      errors: [{ path: '', message: err instanceof Error ? err.message : 'Unknown error' }],
    };
  }
}

/**
 * Type guard for workflow nodes.
 */
export function isValidWorkflowNode(node: unknown): boolean {
  return WorkflowNodeSchema.safeParse(node).success;
}

/**
 * Type guard for workflow edges.
 */
export function isValidWorkflowEdge(edge: unknown): boolean {
  return WorkflowEdgeSchema.safeParse(edge).success;
}

/**
 * Format validation errors for display.
 */
export function formatValidationErrors(
  errors: Array<{ path: string; message: string }>
): string {
  return errors
    .map(e => e.path ? `${e.path}: ${e.message}` : e.message)
    .join('\n');
}











