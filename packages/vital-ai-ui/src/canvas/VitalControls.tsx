'use client';

/**
 * VitalControls - React Flow Controls Component
 * 
 * Interactive zoom and fit view controls for React Flow canvases.
 * Wraps @xyflow/react Controls with modern, themed design.
 * 
 * Features:
 * - Zoom in/out controls
 * - Fit view button to center and scale content
 * - Rounded pill design with backdrop blur
 * - Theme-aware card background
 * - Subtle drop shadow for depth
 * - Full TypeScript support
 * - Compatible with all React Flow control features
 * 
 * @see https://reactflow.dev/api-reference/components/controls
 * 
 * @example
 * ```tsx
 * import { VitalCanvas, VitalControls } from '@vital/ai-ui';
 * 
 * <VitalCanvas nodes={nodes} edges={edges}>
 *   <VitalControls />
 * </VitalCanvas>
 * 
 * // With options
 * <VitalCanvas nodes={nodes} edges={edges}>
 *   <VitalControls 
 *     showZoom={true}
 *     showFitView={true}
 *     showInteractive={false}
 *     position="bottom-right"
 *   />
 * </VitalCanvas>
 * ```
 */

import { cn } from '../lib/utils';
import { Controls as ControlsPrimitive } from '@xyflow/react';
import type { ComponentProps } from 'react';

// ============================================================================
// Types
// ============================================================================

export type VitalControlsProps = ComponentProps<typeof ControlsPrimitive>;

// ============================================================================
// Component
// ============================================================================

/**
 * Styled React Flow Controls component
 */
export const VitalControls = ({ className, ...props }: VitalControlsProps) => (
  <ControlsPrimitive
    className={cn(
      'gap-px overflow-hidden rounded-md border bg-card p-1 shadow-none!',
      '[&>button]:rounded-md [&>button]:border-none! [&>button]:bg-transparent! [&>button]:hover:bg-secondary!',
      className
    )}
    {...props}
  />
);

VitalControls.displayName = 'VitalControls';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalControls */
export const Controls = VitalControls;
export const CanvasControls = VitalControls;

export default VitalControls;
