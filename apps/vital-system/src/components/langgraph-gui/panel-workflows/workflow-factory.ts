import { Node, Edge } from 'reactflow';
import { PanelWorkflowConfig, PanelWorkflowResult } from './types';
import { buildNodesFromConfig } from './node-builders';
import { buildEdgesFromConfig } from './edge-builders';
import { autoLayoutWorkflow } from '@/lib/langgraph-gui/workflowLayout';

/**
 * Creates a complete panel workflow from a configuration
 */
export function createPanelWorkflow(
  config: PanelWorkflowConfig
): PanelWorkflowResult {
  // Build nodes from configuration
  const nodes = buildNodesFromConfig(config.nodes);

  // Build edges from configuration
  const edges = buildEdgesFromConfig(config.edges);

  // Apply auto-layout
  const laidOutNodes = autoLayoutWorkflow(nodes, edges);

  return {
    nodes: laidOutNodes,
    edges,
    phases: config.phases,
    workflowName: config.name,
    metadata: config.metadata, // Pass through metadata
  };
}

