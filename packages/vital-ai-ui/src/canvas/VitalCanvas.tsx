'use client';

/**
 * VitalCanvas - React Flow Canvas Component
 * 
 * A pre-configured React Flow canvas for building interactive node-based interfaces.
 * Comes with sensible defaults optimized for AI applications.
 * 
 * Features:
 * - Pre-configured React Flow canvas with AI-optimized defaults
 * - Pan on scroll enabled for intuitive navigation
 * - Selection on drag for multi-node operations
 * - Customizable background color using CSS variables
 * - Delete key support (Backspace and Delete keys)
 * - Auto-fit view to show all nodes
 * - Disabled double-click zoom for better UX
 * - Disabled pan on drag to prevent accidental canvas movement
 * - Fully compatible with React Flow props and API
 * 
 * @see https://reactflow.dev/
 * 
 * @example
 * ```tsx
 * import { VitalCanvas, VitalNode, VitalControls } from '@vital/ai-ui';
 * 
 * <VitalCanvas
 *   nodes={nodes}
 *   edges={edges}
 *   nodeTypes={nodeTypes}
 *   edgeTypes={edgeTypes}
 *   onNodesChange={onNodesChange}
 * >
 *   <VitalControls />
 *   <VitalPanel position="top-right">
 *     <button>Custom Action</button>
 *   </VitalPanel>
 * </VitalCanvas>
 * ```
 */

import { Background, ReactFlow, type ReactFlowProps } from '@xyflow/react';
import type { ReactNode } from 'react';
import '@xyflow/react/dist/style.css';

// ============================================================================
// Types
// ============================================================================

export type VitalCanvasProps = ReactFlowProps & {
  /** Child components like Background, Controls, MiniMap, or Panel */
  children?: ReactNode;
  /** Background color (CSS variable or color value) */
  backgroundColor?: string;
  /** Whether to show the background grid */
  showBackground?: boolean;
};

// ============================================================================
// Component
// ============================================================================

/**
 * Pre-configured React Flow canvas with AI-optimized defaults
 */
export const VitalCanvas = ({ 
  children, 
  backgroundColor = 'var(--sidebar)',
  showBackground = true,
  ...props 
}: VitalCanvasProps) => (
  <ReactFlow
    deleteKeyCode={['Backspace', 'Delete']}
    fitView
    panOnDrag={false}
    panOnScroll
    selectionOnDrag={true}
    zoomOnDoubleClick={false}
    {...props}
  >
    {showBackground && <Background bgColor={backgroundColor} />}
    {children}
  </ReactFlow>
);

VitalCanvas.displayName = 'VitalCanvas';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalCanvas */
export const Canvas = VitalCanvas;

export default VitalCanvas;
