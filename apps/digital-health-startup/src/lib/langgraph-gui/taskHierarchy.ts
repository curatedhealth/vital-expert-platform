import { Node, Edge } from 'reactflow';
import { WorkflowDefinition } from '../types/workflow';

/**
 * Represents a node in the task hierarchy tree
 */
export interface TaskHierarchyNode {
  node: Node;
  children: TaskHierarchyNode[];
  level: number;
  hasChildren: boolean;
  parentId?: string;
}

/**
 * Builds a hierarchical structure from workflow nodes
 * Extracts subflows from task nodes recursively
 */
export function buildTaskHierarchy(
  nodes: Node[],
  edges: Edge[],
  parentNodeId?: string
): TaskHierarchyNode[] {
  // Filter nodes at current level
  // If parentNodeId is provided, get nodes from that parent's subflow
  // Otherwise, get root-level nodes (task nodes that aren't in any subflow)
  let currentLevelNodes: Node[] = [];

  if (parentNodeId) {
    // Get subflow nodes from parent
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (parentNode && parentNode.type === 'task') {
      const subflow = parentNode.data?.subflow || parentNode.data?.subworkflow;
      if (subflow) {
        // Handle both WorkflowDefinition and simple {nodes, edges} format
        const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
        // Filter out input/output boundary nodes and cast to Node[]
        currentLevelNodes = (subflowNodes as Node[]).filter(
          (n: Node) => n.id !== 'task-input' && n.id !== 'task-output' && n.type === 'task'
        );
      }
    }
  } else {
    // Root level: get all task nodes that aren't in any subflow
    currentLevelNodes = nodes.filter(n => {
      // Only include task nodes
      if (n.type !== 'task') return false;
      
      // Check if this node is inside any other node's subflow
      const isInSubflow = nodes.some(parentNode => {
        if (parentNode.type !== 'task' || parentNode.id === n.id) return false;
        const subflow = parentNode.data?.subflow || parentNode.data?.subworkflow;
        if (subflow) {
          const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
          return (subflowNodes as Node[]).some((sn: Node) => sn.id === n.id);
        }
        return false;
      });
      
      return !isInSubflow;
    });
  }

  // Build hierarchy nodes
  return currentLevelNodes.map(node => {
    const subflow = node.data?.subflow || node.data?.subworkflow;
    const hasSubflow = subflow && (
      ((subflow as WorkflowDefinition).nodes?.length > 0) ||
      ((subflow as any).nodes?.length > 0)
    );

    const children = hasSubflow
      ? buildTaskHierarchy(nodes, edges, node.id)
      : [];

    return {
      node,
      children,
      level: parentNodeId ? (getNodeLevel(nodes, parentNodeId) + 1) : 0,
      hasChildren: children.length > 0,
      parentId: parentNodeId,
    };
  });
}

/**
 * Get the level/depth of a node in the hierarchy
 */
function getNodeLevel(nodes: Node[], nodeId: string, level: number = 0): number {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return level;

  // Find parent node
  const parentNode = nodes.find(parent => {
    if (parent.type !== 'task' || parent.id === nodeId) return false;
    const subflow = parent.data?.subflow || parent.data?.subworkflow;
    if (subflow) {
      const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
      return (subflowNodes as Node[]).some((sn: Node) => sn.id === nodeId);
    }
    return false;
  });

  if (parentNode) {
    return getNodeLevel(nodes, parentNode.id, level + 1);
  }

  return level;
}

/**
 * Get all nodes at a specific level in the hierarchy
 */
export function getNodesAtLevel(
  nodes: Node[],
  edges: Edge[],
  path: string[]
): Node[] {
  if (path.length === 0) {
    // Root level
    return buildTaskHierarchy(nodes, edges).map(h => h.node);
  }

  // Navigate through path to get to the target level
  let currentNodes = nodes;
  for (const nodeId of path) {
    const parentNode = currentNodes.find(n => n.id === nodeId);
    if (!parentNode || parentNode.type !== 'task') {
      return [];
    }

    const subflow = parentNode.data?.subflow || parentNode.data?.subworkflow;
    if (!subflow) {
      return [];
    }

    const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
    currentNodes = (subflowNodes as Node[]).filter(
      (n: Node) => n.id !== 'task-input' && n.id !== 'task-output'
    );
  }

  // Filter to only task nodes at this level
  return currentNodes.filter(n => n.type === 'task');
}

/**
 * Get breadcrumb path names from node IDs
 */
export function getBreadcrumbPath(
  nodes: Node[],
  path: string[]
): Array<{ id: string; name: string }> {
  const breadcrumbs: Array<{ id: string; name: string }> = [
    { id: 'root', name: 'Workflow' },
  ];

  let currentNodes = nodes;
  for (const nodeId of path) {
    const node = currentNodes.find(n => n.id === nodeId);
    if (node) {
      const taskName = node.data?.task?.name || node.data?.label || node.id;
      breadcrumbs.push({ id: nodeId, name: taskName });

      // Navigate into subflow for next iteration
      const subflow = node.data?.subflow || node.data?.subworkflow;
      if (subflow) {
        const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
        currentNodes = subflowNodes as Node[];
      }
    }
  }

  return breadcrumbs;
}

/**
 * Check if a node has nested sub-tasks
 */
export function hasNestedTasks(node: Node): boolean {
  if (node.type !== 'task') return false;
  
  const subflow = node.data?.subflow || node.data?.subworkflow;
  if (!subflow) return false;

  const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
  // Check if there are any task nodes (excluding input/output)
  return (subflowNodes as Node[]).some(
    (n: Node) => n.type === 'task' && n.id !== 'task-input' && n.id !== 'task-output'
  );
}

/**
 * Get count of nested tasks
 */
export function getNestedTaskCount(node: Node): number {
  if (!hasNestedTasks(node)) return 0;
  
  const subflow = node.data?.subflow || node.data?.subworkflow;
  if (!subflow) return 0;

  const subflowNodes = (subflow as WorkflowDefinition).nodes || (subflow as any).nodes || [];
  return (subflowNodes as Node[]).filter(
    (n: Node) => n.type === 'task' && n.id !== 'task-input' && n.id !== 'task-output'
  ).length;
}

