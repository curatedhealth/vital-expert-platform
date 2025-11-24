import { Node, Edge } from 'reactflow';

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  startX?: number;
  startY?: number;
}

/**
 * Calculate hierarchical levels for nodes based on edges
 */
function calculateLevels(nodes: Node[], edges: Edge[]): Map<string, number> {
  const levels = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  
  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outgoing.set(node.id, []);
  });
  
  // Calculate in-degrees and build adjacency list
  edges.forEach(edge => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);
    
    const targets = outgoing.get(edge.source) || [];
    targets.push(edge.target);
    outgoing.set(edge.source, targets);
  });
  
  // Find root nodes (nodes with no incoming edges)
  const queue: Array<{ id: string; level: number }> = [];
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push({ id: node.id, level: 0 });
      levels.set(node.id, 0);
    }
  });
  
  // BFS to assign levels
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const targets = outgoing.get(id) || [];
    
    targets.forEach(targetId => {
      const currentInDegree = inDegree.get(targetId)!;
      inDegree.set(targetId, currentInDegree - 1);
      
      if (currentInDegree === 1) {
        const newLevel = level + 1;
        levels.set(targetId, newLevel);
        queue.push({ id: targetId, level: newLevel });
      }
    });
  }
  
  // Assign level 0 to any unassigned nodes (isolated nodes)
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0);
    }
  });
  
  return levels;
}

/**
 * Group nodes by their level
 */
function groupNodesByLevel(nodes: Node[], levels: Map<string, number>): Map<number, Node[]> {
  const groups = new Map<number, Node[]>();
  
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!groups.has(level)) {
      groups.set(level, []);
    }
    groups.get(level)!.push(node);
  });
  
  // Sort each group by node id for consistent ordering
  groups.forEach((group, level) => {
    groups.set(level, group.sort((a, b) => a.id.localeCompare(b.id)));
  });
  
  return groups;
}

/**
 * Calculate positions for nodes in a hierarchical layout
 */
export function calculateHierarchicalLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    horizontalSpacing = 250,
    verticalSpacing = 200,
    startX = 100,
    startY = 100,
  } = options;
  
  // Calculate levels
  const levels = calculateLevels(nodes, edges);
  const groups = groupNodesByLevel(nodes, levels);
  
  // Position nodes
  const positionedNodes = nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const levelNodes = groups.get(level) || [];
    const indexInLevel = levelNodes.findIndex(n => n.id === node.id);
    const nodesInLevel = levelNodes.length;
    
    // Calculate x position (center nodes in level)
    let x: number;
    if (nodesInLevel === 1) {
      x = startX;
    } else {
      const totalWidth = (nodesInLevel - 1) * horizontalSpacing;
      const startXForLevel = startX - (totalWidth / 2);
      x = startXForLevel + (indexInLevel * horizontalSpacing);
    }
    
    // Calculate y position based on level
    const y = startY + (level * verticalSpacing);
    
    return {
      ...node,
      position: { x, y },
    };
  });
  
  return positionedNodes;
}

/**
 * Identify expert nodes (resource nodes that should be grouped with their users)
 */
function identifyExpertNodes(nodes: Node[]): Set<string> {
  const expertNodeIds = new Set<string>();
  nodes.forEach(node => {
    const taskId = (node.data as any)?.task?.id;
    const taskName = (node.data as any)?.task?.name || (node.data as any)?.label || '';
    const nodeId = node.id.toLowerCase();
    
    // Check if this is an expert node
    if (taskId === 'expert_agent' || 
        taskName.toLowerCase().includes('expert') ||
        nodeId.includes('expert')) {
      expertNodeIds.add(node.id);
    }
  });
  return expertNodeIds;
}

/**
 * Find the level where experts should be positioned (same as moderator or first phase)
 */
function findExpertLevel(
  nodes: Node[],
  levels: Map<string, number>
): number {
  // Find moderator or first workflow phase node
  const moderatorNode = nodes.find(n => 
    (n.data as any)?.task?.id === 'moderator' ||
    ((n.data as any)?.task?.name || (n.data as any)?.label || '').toLowerCase().includes('moderator')
  );
  
  if (moderatorNode) {
    return levels.get(moderatorNode.id) || 1;
  }
  
  // Find first phase node (opening statements, initialize, etc.)
  const phaseNode = nodes.find(n => {
    const taskId = (n.data as any)?.task?.id || '';
    const taskName = ((n.data as any)?.task?.name || (n.data as any)?.label || '').toLowerCase();
    return taskId.includes('opening') || 
           taskId.includes('initialize') ||
           taskName.includes('opening') ||
           taskName.includes('initialize');
  });
  
  if (phaseNode) {
    const phaseLevel = levels.get(phaseNode.id) || 1;
    return phaseLevel;
  }
  
  // Default to level 1
  return 1;
}

/**
 * Auto-layout nodes when workflow is loaded or created
 */
export function autoLayoutWorkflow(nodes: Node[], edges: Edge[]): Node[] {
  // Check if this is a panel workflow (has input/output nodes)
  const hasInputOutput = nodes.some(n => 
    n.id === 'panel-input' || 
    n.id === 'panel-output' || 
    n.id === 'task-input' || 
    n.id === 'task-output' ||
    n.type === 'input' ||
    n.type === 'output'
  );
  
  // Calculate levels first
  const levels = calculateLevels(nodes, edges);
  const expertNodeIds = identifyExpertNodes(nodes);
  
  // If we have expert nodes, position them at the same level as moderator/first phase
  if (expertNodeIds.size > 0 && hasInputOutput) {
    const expertLevel = findExpertLevel(nodes, levels);
    const groups = groupNodesByLevel(nodes, levels);
    
    // Get non-expert nodes at expert level
    const levelNodes = groups.get(expertLevel) || [];
    const nonExpertNodes = levelNodes.filter(n => !expertNodeIds.has(n.id));
    
    // Calculate positions
    const horizontalSpacing = 280;
    const verticalSpacing = 180;
    const startX = 500;
    const startY = 100;
    
    const positionedNodes = nodes.map(node => {
      const isExpert = expertNodeIds.has(node.id);
      const level = isExpert ? expertLevel : (levels.get(node.id) || 0);
      
      // Get all nodes at this level (including experts if this is expert level)
      let levelNodes: Node[];
      if (isExpert) {
        // Include experts with non-experts at expert level
        levelNodes = [...nonExpertNodes, ...Array.from(expertNodeIds).map(id => 
          nodes.find(n => n.id === id)!
        ).filter(Boolean)];
      } else {
        levelNodes = groups.get(level) || [];
      }
      
      const indexInLevel = levelNodes.findIndex(n => n.id === node.id);
      const nodesInLevel = levelNodes.length;
      
      // Calculate x position (center nodes in level)
      let x: number;
      if (nodesInLevel === 1) {
        x = startX;
      } else {
        const totalWidth = (nodesInLevel - 1) * horizontalSpacing;
        const startXForLevel = startX - (totalWidth / 2);
        x = startXForLevel + (indexInLevel * horizontalSpacing);
      }
      
      // Calculate y position based on level
      const y = startY + (level * verticalSpacing);
      
      return {
        ...node,
        position: { x, y },
      };
    });
    
    return positionedNodes;
  }
  
  // Standard hierarchical layout
  if (hasInputOutput) {
    return calculateHierarchicalLayout(nodes, edges, {
      horizontalSpacing: 280,
      verticalSpacing: 180,
      startX: 500,
      startY: 100,
    });
  }
  
  // For Mode 1 and other linear workflows, use better spacing
  // Check if this is a Mode 1 workflow (has start/end nodes and linear flow)
  const hasStartEnd = nodes.some(n => n.id === 'start' || n.type === 'input') && 
                      nodes.some(n => n.id === 'end' || n.type === 'output');
  
  if (hasStartEnd) {
    // Mode 1 workflow - use vertical layout with better spacing
    return calculateHierarchicalLayout(nodes, edges, {
      horizontalSpacing: 400,
      verticalSpacing: 150,
      startX: 400,
      startY: 50,
    });
  }
  
  // For other workflows, use a simpler layout
  return calculateHierarchicalLayout(nodes, edges, {
    horizontalSpacing: 300,
    verticalSpacing: 200,
    startX: 400,
    startY: 100,
  });
}

/**
 * Get phase/layer information for visual grouping
 */
export function getWorkflowPhases(nodes: Node[], edges: Edge[]): Array<{
  level: number;
  nodes: Node[];
  label?: string;
}> {
  const levels = calculateLevels(nodes, edges);
  const groups = groupNodesByLevel(nodes, levels);
  
  const phases: Array<{ level: number; nodes: Node[]; label?: string }> = [];
  
  groups.forEach((levelNodes, level) => {
    // Try to infer phase label from node types/names
    let label: string | undefined;
    
    if (levelNodes.length > 0) {
      const firstNode = levelNodes[0];
      const nodeType = firstNode.type;
      const nodeName = (firstNode.data as any)?.task?.name || (firstNode.data as any)?.label || '';
      
      // Common phase patterns
      if (nodeName.toLowerCase().includes('input') || nodeType === 'input') {
        label = 'Input';
      } else if (nodeName.toLowerCase().includes('output') || nodeType === 'output') {
        label = 'Output';
      } else if (nodeName.toLowerCase().includes('initialize') || nodeName.toLowerCase().includes('init')) {
        label = 'Initialization';
      } else if (nodeName.toLowerCase().includes('opening')) {
        label = 'Opening Phase';
      } else if (nodeName.toLowerCase().includes('discussion')) {
        label = 'Discussion Phase';
      } else if (nodeName.toLowerCase().includes('consensus')) {
        label = 'Consensus Building';
      } else if (nodeName.toLowerCase().includes('documentation') || nodeName.toLowerCase().includes('synthesis')) {
        label = 'Documentation';
      } else if (level === 0) {
        label = 'Start';
      } else if (level === Math.max(...Array.from(groups.keys()))) {
        label = 'End';
      }
    }
    
    phases.push({
      level,
      nodes: levelNodes,
      label,
    });
  });
  
  return phases.sort((a, b) => a.level - b.level);
}

