/**
 * ELK.js Auto-Layout Utilities
 * Provides automatic graph layout using the ELK algorithm
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';

const elk = new ELK();

export interface LayoutOptions {
  direction?: 'DOWN' | 'UP' | 'RIGHT' | 'LEFT';
  nodeSpacing?: number;
  layerSpacing?: number;
  algorithm?: 'layered' | 'force' | 'stress' | 'mrtree';
}

const defaultOptions: LayoutOptions = {
  direction: 'DOWN',
  nodeSpacing: 80,
  layerSpacing: 100,
  algorithm: 'layered',
};

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  
  const elkOptions = {
    'elk.algorithm': opts.algorithm,
    'elk.direction': opts.direction,
    'elk.spacing.nodeNode': String(opts.nodeSpacing),
    'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.layerSpacing),
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.nodePlacement.strategy': 'SIMPLE',
  };

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width ?? node.data?.width ?? 280,
      height: node.height ?? node.data?.height ?? 180,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map((node) => {
      const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
      return {
        ...node,
        position: {
          x: layoutedNode?.x ?? node.position.x,
          y: layoutedNode?.y ?? node.position.y,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('Error during layout:', error);
    return { nodes, edges };
  }
}

/**
 * Layout nodes in a hierarchical tree structure
 */
export async function getTreeLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
) {
  return getLayoutedElements(nodes, edges, {
    ...options,
    algorithm: 'mrtree',
    direction: options.direction || 'DOWN',
  });
}

/**
 * Layout nodes using force-directed algorithm
 */
export async function getForceLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
) {
  return getLayoutedElements(nodes, edges, {
    ...options,
    algorithm: 'force',
  });
}

/**
 * Get horizontal layout (left to right)
 */
export async function getHorizontalLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
) {
  return getLayoutedElements(nodes, edges, {
    ...options,
    direction: 'RIGHT',
  });
}

/**
 * Get vertical layout (top to bottom)
 */
export async function getVerticalLayout(
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {}
) {
  return getLayoutedElements(nodes, edges, {
    ...options,
    direction: 'DOWN',
  });
}

