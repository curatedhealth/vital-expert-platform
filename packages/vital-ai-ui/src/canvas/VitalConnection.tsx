'use client';

/**
 * VitalConnection - React Flow Connection Line Component
 * 
 * A styled connection line for React Flow canvases. Renders an animated 
 * bezier curve with a circle indicator at the target end.
 * 
 * Features:
 * - Smooth bezier curve animation for connection lines
 * - Visual indicator circle at the target position
 * - Theme-aware styling using CSS variables
 * - Cubic bezier curve calculation for natural flow
 * - Lightweight implementation with minimal props
 * - Full TypeScript support with React Flow types
 * - Compatible with React Flow's connection system
 * 
 * @see https://reactflow.dev/api-reference/types/connection-line-component
 * 
 * @example
 * ```tsx
 * import { VitalCanvas, VitalConnection } from '@vital/ai-ui';
 * 
 * <VitalCanvas
 *   nodes={nodes}
 *   edges={edges}
 *   connectionLineComponent={VitalConnection}
 * />
 * ```
 */

import type { ConnectionLineComponent } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

export type VitalConnectionProps = Parameters<ConnectionLineComponent>[0];

// ============================================================================
// Constants
// ============================================================================

const HALF = 0.5;

// ============================================================================
// Component
// ============================================================================

/**
 * Connection line with bezier curve and end indicator
 * 
 * Implements ConnectionLineComponent interface from @xyflow/react
 */
export const VitalConnection: ConnectionLineComponent = ({
  fromX,
  fromY,
  toX,
  toY,
}) => (
  <g>
    <path
      className="animated"
      d={`M${fromX},${fromY} C ${fromX + (toX - fromX) * HALF},${fromY} ${fromX + (toX - fromX) * HALF},${toY} ${toX},${toY}`}
      fill="none"
      stroke="var(--color-ring)"
      strokeWidth={1}
    />
    <circle
      cx={toX}
      cy={toY}
      fill="#fff"
      r={3}
      stroke="var(--color-ring)"
      strokeWidth={1}
    />
  </g>
);

VitalConnection.displayName = 'VitalConnection';

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalConnection */
export const Connection = VitalConnection;
export const ConnectionLine = VitalConnection;

export default VitalConnection;
