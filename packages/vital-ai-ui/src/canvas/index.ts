/**
 * Domain K: Canvas & Visualization Components
 * 
 * React Flow-based components for building interactive node-based interfaces.
 * Used in Mode 3/4 Mission Control and workflow visualization.
 * 
 * All components are wrappers around @xyflow/react primitives with VITAL styling.
 * 
 * Components (9):
 * - VitalCanvas: Pre-configured React Flow canvas
 * - VitalNode: Card-based node with handles
 * - VitalEdge: Edge types (Temporary, Animated)
 * - VitalConnection: Connection line component
 * - VitalControls: Zoom/pan controls
 * - VitalPanel: Positioned overlay panel
 * - VitalToolbar: Node toolbar
 * - VitalGraphCanvas: High-level graph visualization
 * - VitalFlow: Workflow editor
 * - VitalAgentHierarchyTree: Agent hierarchy display
 * 
 * @see https://reactflow.dev/
 */

// ============================================================================
// Core React Flow Wrappers (ai-elements compatible)
// ============================================================================

// Canvas (ReactFlow wrapper)
export { 
  VitalCanvas, 
  Canvas,
} from './VitalCanvas';

export type { VitalCanvasProps } from './VitalCanvas';

// Node components
export {
  VitalNode,
  VitalNodeHeader,
  VitalNodeTitle,
  VitalNodeDescription,
  VitalNodeAction,
  VitalNodeContent,
  VitalNodeFooter,
  // Aliases
  Node,
  NodeHeader,
  NodeTitle,
  NodeDescription,
  NodeAction,
  NodeContent,
  NodeFooter,
} from './VitalNode';

export type {
  HandleConfig,
  VitalNodeProps,
  VitalNodeHeaderProps,
  VitalNodeTitleProps,
  VitalNodeDescriptionProps,
  VitalNodeActionProps,
  VitalNodeContentProps,
  VitalNodeFooterProps,
} from './VitalNode';

// Edge components
export {
  VitalEdge,
  Edge,
  EdgeTemporary,
  EdgeAnimated,
} from './VitalEdge';

export type {
  VitalEdgeTemporaryProps,
  VitalEdgeAnimatedProps,
} from './VitalEdge';

// Connection line
export {
  VitalConnection,
  Connection,
  ConnectionLine,
} from './VitalConnection';

export type { VitalConnectionProps } from './VitalConnection';

// Controls
export {
  VitalControls,
  Controls,
  CanvasControls,
} from './VitalControls';

export type { VitalControlsProps } from './VitalControls';

// Panel
export {
  VitalPanel,
  Panel,
} from './VitalPanel';

export type { VitalPanelProps } from './VitalPanel';

// Toolbar
export {
  VitalToolbar,
  Toolbar,
  NodeToolbarStyled,
} from './VitalToolbar';

export type { VitalToolbarProps } from './VitalToolbar';

// ============================================================================
// High-Level Visualization Components
// ============================================================================

export { VitalGraphCanvas, default as GraphCanvas } from './VitalGraphCanvas';
export { VitalFlow, default as Flow } from './VitalFlow';
export { VitalAgentHierarchyTree, default as AgentHierarchyTree } from './VitalAgentHierarchyTree';

// Re-export types for high-level components
export type {
  GraphNode,
  GraphEdge,
  VitalGraphCanvasProps,
} from './VitalGraphCanvas';

export type {
  FlowNode,
  FlowNodeStatus,
  FlowNodeType,
  FlowConnection,
  VitalFlowProps,
} from './VitalFlow';

export type {
  AgentNode,
  AgentStatus,
  AgentLevel,
  VitalAgentHierarchyTreeProps,
} from './VitalAgentHierarchyTree';
