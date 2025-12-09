'use client';

/**
 * VitalPanel - React Flow Panel Component
 * 
 * A positioned container for custom UI elements on React Flow canvases.
 * Wraps @xyflow/react Panel with modern card styling.
 * 
 * Features:
 * - Flexible positioning (top-left, top-right, bottom-left, bottom-right, top-center, bottom-center)
 * - Rounded pill design with backdrop blur
 * - Theme-aware card background
 * - Flexbox layout for easy content alignment
 * - Subtle drop shadow for depth
 * - Full TypeScript support
 * - Compatible with React Flow's panel system
 * 
 * @see https://reactflow.dev/api-reference/components/panel
 * 
 * @example
 * ```tsx
 * import { VitalCanvas, VitalPanel } from '@vital/ai-ui';
 * 
 * <VitalCanvas nodes={nodes} edges={edges}>
 *   <VitalPanel position="top-right">
 *     <button>Zoom In</button>
 *     <button>Zoom Out</button>
 *   </VitalPanel>
 *   <VitalPanel position="bottom-left">
 *     <span>5 nodes • 3 edges</span>
 *   </VitalPanel>
 * </VitalCanvas>
 * ```
 */

import { cn } from '../lib/utils';
import { Panel as PanelPrimitive } from '@xyflow/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalPanelProps = ComponentProps<typeof PanelPrimitive>;

// ============================================================================
// Component
// ============================================================================

/**
 * Styled React Flow Panel component
 */
export const VitalPanel = ({ className, ...props }: VitalPanelProps) => (
  <PanelPrimitive
    className={cn(
      'm-4 overflow-hidden rounded-md border bg-card p-1',
      className
    )}
    {...props}
  />
);

VitalPanel.displayName = 'VitalPanel';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalPanel */
export const Panel = VitalPanel;

export default VitalPanel;
