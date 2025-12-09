'use client';

/**
 * VitalEdge - React Flow Edge Components
 * 
 * Pre-styled edge types for React Flow canvases: Temporary for dashed
 * temporary connections and Animated for connections with animated indicators.
 * 
 * Features:
 * - Two distinct edge types: Temporary and Animated
 * - Temporary edges use dashed lines with ring color
 * - Animated edges include a moving circle indicator
 * - Automatic handle position calculation
 * - Smart offset calculation based on handle type and position
 * - Uses Bezier curves for smooth, natural-looking connections
 * - Fully compatible with React Flow's edge system
 * - Type-safe implementation with TypeScript
 * 
 * @see https://reactflow.dev/api-reference/types/edge-props
 * 
 * @example
 * ```tsx
 * import { VitalCanvas, VitalEdge } from '@vital/ai-ui';
 * 
 * const edgeTypes = {
 *   temporary: VitalEdge.Temporary,
 *   animated: VitalEdge.Animated,
 * };
 * 
 * <VitalCanvas
 *   nodes={nodes}
 *   edges={edges}
 *   edgeTypes={edgeTypes}
 * />
 * ```
 */

import {
  BaseEdge,
  type EdgeProps,
  getBezierPath,
  getSimpleBezierPath,
  type InternalNode,
  type Node,
  Position,
  useInternalNode,
} from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

export type VitalEdgeTemporaryProps = EdgeProps;
export type VitalEdgeAnimatedProps = EdgeProps;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get handle coordinates by position
 */
const getHandleCoordsByPosition = (
  node: InternalNode<Node>,
  handlePosition: Position
) => {
  // Choose the handle type based on position - Left is for target, Right is for source
  const handleType = handlePosition === Position.Left ? 'target' : 'source';

  const handle = node.internals.handleBounds?.[handleType]?.find(
    (h) => h.position === handlePosition
  );

  if (!handle) {
    return [0, 0] as const;
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // Tiny detail to make the markerEnd of an edge visible
  // Handle position has origin top-left, so depending on side we add offset
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
    default:
      throw new Error(`Invalid handle position: ${handlePosition}`);
  }

  const x = node.internals.positionAbsolute.x + handle.x + offsetX;
  const y = node.internals.positionAbsolute.y + handle.y + offsetY;

  return [x, y] as const;
};

/**
 * Get edge parameters from source and target nodes
 */
const getEdgeParams = (
  source: InternalNode<Node>,
  target: InternalNode<Node>
) => {
  const sourcePos = Position.Right;
  const [sx, sy] = getHandleCoordsByPosition(source, sourcePos);
  const targetPos = Position.Left;
  const [tx, ty] = getHandleCoordsByPosition(target, targetPos);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
};

// ============================================================================
// Temporary Edge (Dashed)
// ============================================================================

/**
 * Dashed edge for temporary/preview connections
 */
const Temporary = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) => {
  const [edgePath] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      className="stroke-1 stroke-ring"
      id={id}
      path={edgePath}
      style={{
        strokeDasharray: '5, 5',
      }}
    />
  );
};

Temporary.displayName = 'VitalEdge.Temporary';

// ============================================================================
// Animated Edge
// ============================================================================

/**
 * Solid edge with animated circle indicator
 */
const Animated = ({ id, source, target, markerEnd, style }: EdgeProps) => {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!(sourceNode && targetNode)) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
      <circle fill="var(--primary)" r="4">
        <animateMotion dur="2s" path={edgePath} repeatCount="indefinite" />
      </circle>
    </>
  );
};

Animated.displayName = 'VitalEdge.Animated';

// ============================================================================
// Combined Export
// ============================================================================

/**
 * VitalEdge - Edge type variants for React Flow
 */
export const VitalEdge = {
  /** Dashed edge for temporary/preview connections */
  Temporary,
  /** Solid edge with animated circle indicator */
  Animated,
};

// ============================================================================
// Aliases (ai-elements compatibility)
// ============================================================================

/** @alias VitalEdge */
export const Edge = VitalEdge;
export const EdgeTemporary = Temporary;
export const EdgeAnimated = Animated;

export default VitalEdge;
