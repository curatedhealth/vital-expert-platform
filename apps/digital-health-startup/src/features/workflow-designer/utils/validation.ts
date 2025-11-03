/**
 * Workflow Validation Utilities
 * 
 * Validates workflow definitions for correctness and completeness
 */

import type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types/workflow';

/**
 * Validate a complete workflow definition
 */
export function validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required fields
  if (!workflow.name || workflow.name.trim() === '') {
    errors.push({
      type: 'error',
      message: 'Workflow name is required',
      field: 'name',
    });
  }

  if (!workflow.framework) {
    errors.push({
      type: 'error',
      message: 'Framework is required',
      field: 'framework',
    });
  }

  // Validate nodes
  const nodeValidation = validateNodes(workflow.nodes);
  errors.push(...nodeValidation.errors);
  warnings.push(...nodeValidation.warnings);

  // Validate edges
  const edgeValidation = validateEdges(workflow.edges, workflow.nodes);
  errors.push(...edgeValidation.errors);
  warnings.push(...edgeValidation.warnings);

  // Validate workflow structure
  const structureValidation = validateWorkflowStructure(workflow.nodes, workflow.edges);
  errors.push(...structureValidation.errors);
  warnings.push(...structureValidation.warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate workflow nodes
 */
function validateNodes(nodes: WorkflowNode[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (nodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have at least one node',
    });
    return { valid: false, errors, warnings };
  }

  // Check for start node
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have a START node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one START node',
    });
  }

  // Check for end node
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    warnings.push({
      type: 'warning',
      message: 'Workflow should have an END node',
      suggestion: 'Add an END node to properly terminate the workflow',
    });
  }

  // Validate individual nodes
  nodes.forEach(node => {
    // Check required fields
    if (!node.id) {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: 'Node is missing ID',
      });
    }

    if (!node.label || node.label.trim() === '') {
      errors.push({
        type: 'error',
        nodeId: node.id,
        message: 'Node label is required',
        field: 'label',
      });
    }

    // Validate agent nodes
    if (node.type === 'agent') {
      if (!node.config.systemPrompt || node.config.systemPrompt.trim() === '') {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: 'Agent node is missing system prompt',
          suggestion: 'Add a system prompt to define agent behavior',
        });
      }

      if (!node.config.model) {
        errors.push({
          type: 'error',
          nodeId: node.id,
          message: 'Agent node must specify a model',
          field: 'model',
        });
      }

      if (node.config.temperature !== undefined && 
          (node.config.temperature < 0 || node.config.temperature > 2)) {
        errors.push({
          type: 'error',
          nodeId: node.id,
          message: 'Temperature must be between 0 and 2',
          field: 'temperature',
        });
      }
    }

    // Validate tool nodes
    if (node.type === 'tool') {
      if (!node.config.toolName || node.config.toolName.trim() === '') {
        errors.push({
          type: 'error',
          nodeId: node.id,
          message: 'Tool node must specify a tool name',
          field: 'toolName',
        });
      }
    }

    // Validate condition nodes
    if (node.type === 'condition') {
      if (!node.config.conditionExpression || node.config.conditionExpression.trim() === '') {
        errors.push({
          type: 'error',
          nodeId: node.id,
          message: 'Condition node must have a condition expression',
          field: 'conditionExpression',
        });
      }
    }

    // Validate parallel nodes
    if (node.type === 'parallel') {
      if (!node.config.parallelBranches || node.config.parallelBranches.length === 0) {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: 'Parallel node has no branches defined',
          suggestion: 'Add branches to execute in parallel',
        });
      }
    }

    // Validate human nodes
    if (node.type === 'human') {
      if (!node.config.humanInstructions || node.config.humanInstructions.trim() === '') {
        warnings.push({
          type: 'warning',
          nodeId: node.id,
          message: 'Human node should have instructions',
          suggestion: 'Add instructions for the human reviewer',
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate workflow edges
 */
function validateEdges(edges: WorkflowEdge[], nodes: WorkflowNode[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const nodeIds = new Set(nodes.map(n => n.id));

  edges.forEach(edge => {
    // Check if source node exists
    if (!nodeIds.has(edge.source)) {
      errors.push({
        type: 'error',
        edgeId: edge.id,
        message: `Edge references non-existent source node: ${edge.source}`,
      });
    }

    // Check if target node exists
    if (!nodeIds.has(edge.target)) {
      errors.push({
        type: 'error',
        edgeId: edge.id,
        message: `Edge references non-existent target node: ${edge.target}`,
      });
    }

    // Check if edge creates self-loop
    if (edge.source === edge.target) {
      errors.push({
        type: 'error',
        edgeId: edge.id,
        message: 'Edge cannot connect a node to itself',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate workflow structure (graph topology)
 */
function validateWorkflowStructure(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Build adjacency list
  const adjList = new Map<string, string[]>();
  nodes.forEach(node => adjList.set(node.id, []));
  edges.forEach(edge => {
    adjList.get(edge.source)?.push(edge.target);
  });

  // Check for cycles (excluding allowed feedback loops)
  const hasCycle = detectCycle(adjList);
  if (hasCycle) {
    warnings.push({
      type: 'warning',
      message: 'Workflow contains a cycle',
      suggestion: 'Cycles may cause infinite loops. Ensure proper exit conditions.',
    });
  }

  // Check for disconnected nodes
  const startNode = nodes.find(n => n.type === 'start');
  if (startNode) {
    const reachable = getReachableNodes(startNode.id, adjList);
    const unreachableNodes = nodes.filter(n => !reachable.has(n.id) && n.type !== 'start');
    
    unreachableNodes.forEach(node => {
      warnings.push({
        type: 'warning',
        nodeId: node.id,
        message: `Node "${node.label}" is not reachable from START`,
        suggestion: 'Connect this node to the workflow or remove it',
      });
    });
  }

  // Check for dead-end nodes (no path to END)
  const endNode = nodes.find(n => n.type === 'end');
  if (endNode) {
    const reverseAdjList = new Map<string, string[]>();
    nodes.forEach(node => reverseAdjList.set(node.id, []));
    edges.forEach(edge => {
      reverseAdjList.get(edge.target)?.push(edge.source);
    });

    const reachableFromEnd = getReachableNodes(endNode.id, reverseAdjList);
    const deadEndNodes = nodes.filter(n => 
      !reachableFromEnd.has(n.id) && n.type !== 'end' && n.type !== 'start'
    );

    deadEndNodes.forEach(node => {
      warnings.push({
        type: 'warning',
        nodeId: node.id,
        message: `Node "${node.label}" does not lead to END`,
        suggestion: 'Connect this node to an END node or it may cause incomplete execution',
      });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detect cycles in directed graph using DFS
 */
function detectCycle(adjList: Map<string, string[]>): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of adjList.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

/**
 * Get all nodes reachable from a given node using BFS
 */
function getReachableNodes(startNode: string, adjList: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>();
  const queue = [startNode];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (reachable.has(node)) continue;
    
    reachable.add(node);
    const neighbors = adjList.get(node) || [];
    queue.push(...neighbors);
  }

  return reachable;
}

/**
 * Validate connection between two nodes
 */
export function validateConnection(
  sourceNode: WorkflowNode,
  targetNode: WorkflowNode
): { valid: boolean; message?: string } {
  // START node can't be a target
  if (targetNode.type === 'start') {
    return {
      valid: false,
      message: 'Cannot connect to START node',
    };
  }

  // END node can't be a source
  if (sourceNode.type === 'end') {
    return {
      valid: false,
      message: 'Cannot connect from END node',
    };
  }

  // All other connections are valid
  return { valid: true };
}

