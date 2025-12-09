'use client';

/**
 * VitalToolbar - React Flow Node Toolbar Component
 * 
 * A positioned toolbar that attaches to nodes in React Flow canvases.
 * Wraps @xyflow/react NodeToolbar with modern card styling.
 * 
 * Features:
 * - Attaches to any React Flow node
 * - Bottom positioning by default
 * - Rounded card design with border
 * - Theme-aware background styling
 * - Flexbox layout with gap spacing
 * - Full TypeScript support
 * - Compatible with all React Flow NodeToolbar features
 * 
 * @see https://reactflow.dev/api-reference/components/node-toolbar
 * 
 * @example
 * ```tsx
 * import { VitalNode, VitalToolbar } from '@vital/ai-ui';
 * 
 * // Inside a custom node component
 * function CustomNode({ data }) {
 *   return (
 *     <VitalNode handles={{ target: true, source: true }}>
 *       <VitalNodeHeader>
 *         <VitalNodeTitle>{data.label}</VitalNodeTitle>
 *       </VitalNodeHeader>
 *       <VitalToolbar>
 *         <button>Edit</button>
 *         <button>Delete</button>
 *       </VitalToolbar>
 *     </VitalNode>
 *   );
 * }
 * ```
 */

import { cn } from '../lib/utils';
import { NodeToolbar, Position } from '@xyflow/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalToolbarProps = ComponentProps<typeof NodeToolbar>;

// ============================================================================
// Component
// ============================================================================

/**
 * Styled React Flow NodeToolbar component
 */
export const VitalToolbar = ({ className, ...props }: VitalToolbarProps) => (
  <NodeToolbar
    className={cn(
      'flex items-center gap-1 rounded-sm border bg-background p-1.5',
      className
    )}
    position={Position.Bottom}
    {...props}
  />
);

VitalToolbar.displayName = 'VitalToolbar';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalToolbar */
export const Toolbar = VitalToolbar;
export const NodeToolbarStyled = VitalToolbar;

export default VitalToolbar;
