import { Edge } from 'reactflow';
import { PanelEdgeConfig } from './types';

/**
 * Creates a single edge
 */
export function createEdge(
  id: string,
  source: string,
  target: string,
  type: 'smoothstep' | 'straight' | 'step' | 'default' = 'smoothstep',
  animated: boolean = true
): Edge {
  return {
    id,
    source,
    target,
    type,
    animated,
  };
}

/**
 * Creates edges from a sequence of node IDs
 */
export function createEdgesFromSequence(
  nodeIds: string[],
  type: 'smoothstep' | 'straight' | 'step' | 'default' = 'smoothstep',
  animated: boolean = true
): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < nodeIds.length - 1; i++) {
    edges.push(
      createEdge(
        `edge-${i + 1}`,
        nodeIds[i],
        nodeIds[i + 1],
        type,
        animated
      )
    );
  }
  return edges;
}

/**
 * Creates edges from source-target pairs
 */
export function createEdgesFromPairs(
  pairs: Array<{ source: string; target: string }>,
  type: 'smoothstep' | 'straight' | 'step' | 'default' = 'smoothstep',
  animated: boolean = true
): Edge[] {
  return pairs.map((pair, index) =>
    createEdge(`edge-${index + 1}`, pair.source, pair.target, type, animated)
  );
}

/**
 * Builds edges from panel edge configurations
 */
export function buildEdgesFromConfig(edgeConfigs: PanelEdgeConfig[]): Edge[] {
  return edgeConfigs.map((config) =>
    createEdge(
      config.id,
      config.source,
      config.target,
      config.type || 'smoothstep',
      config.animated !== false
    )
  );
}

