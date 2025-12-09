/**
 * VITAL Protocol - Edge Schemas
 * 
 * Defines edge types for connections between nodes in the Visual Workflow Designer.
 */

import { z } from 'zod';

// ============================================================================
// EDGE TYPES
// ============================================================================

export const EDGE_TYPES = {
  /** Standard edge - simple connection */
  DEFAULT: 'default',
  
  /** Conditional edge - has a condition label */
  CONDITIONAL: 'conditional',
  
  /** Animated edge - shows flow direction */
  ANIMATED: 'animated',
} as const;

export type EdgeType = typeof EDGE_TYPES[keyof typeof EDGE_TYPES];

// ============================================================================
// EDGE SCHEMAS
// ============================================================================

/**
 * Base edge properties
 */
const BaseEdgeSchema = z.object({
  /** Unique edge identifier */
  id: z.string().min(1),
  
  /** Source node ID */
  source: z.string().min(1),
  
  /** Target node ID */
  target: z.string().min(1),
  
  /** Source handle ID (for nodes with multiple outputs) */
  sourceHandle: z.string().nullable().optional(),
  
  /** Target handle ID (for nodes with multiple inputs) */
  targetHandle: z.string().nullable().optional(),
  
  /** Edge type */
  type: z.enum(['default', 'conditional', 'animated']).default('default'),
  
  /** Whether edge is animated */
  animated: z.boolean().optional(),
  
  /** Edge label */
  label: z.string().optional(),
  
  /** Edge style overrides */
  style: z.object({
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    strokeDasharray: z.string().optional(),
  }).optional(),
  
  /** Whether edge is selected */
  selected: z.boolean().optional(),
});

/**
 * Default Edge - Simple connection
 */
export const DefaultEdgeSchema = BaseEdgeSchema.extend({
  type: z.literal('default').default('default'),
});

/**
 * Conditional Edge - Connection with condition
 */
export const ConditionalEdgeSchema = BaseEdgeSchema.extend({
  type: z.literal('conditional'),
  data: z.object({
    /** Condition that must be true to follow this edge */
    condition: z.string(),
    
    /** Priority (lower = higher priority) */
    priority: z.number().int().min(0).default(0),
  }),
});

/**
 * Animated Edge - Shows flow direction
 */
export const AnimatedEdgeSchema = BaseEdgeSchema.extend({
  type: z.literal('animated'),
  animated: z.literal(true),
});

/**
 * Union of all edge schemas
 */
export const EdgeSchema = z.union([
  DefaultEdgeSchema,
  ConditionalEdgeSchema,
  AnimatedEdgeSchema,
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DefaultEdge = z.infer<typeof DefaultEdgeSchema>;
export type ConditionalEdge = z.infer<typeof ConditionalEdgeSchema>;
export type AnimatedEdge = z.infer<typeof AnimatedEdgeSchema>;
export type WorkflowEdge = z.infer<typeof EdgeSchema>;
