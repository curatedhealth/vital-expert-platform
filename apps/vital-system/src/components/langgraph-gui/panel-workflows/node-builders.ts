import { Node } from 'reactflow';
import { TaskDefinition, TASK_DEFINITIONS } from '../TaskLibrary';
import { ExpertConfig, PanelNodeConfig } from './types';
import type { Agent } from '@/lib/stores/agents-store';

/**
 * Creates an input node for panel workflows
 */
export function createInputNode(
  id: string,
  label: string,
  defaultQuery: string,
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'input',
    position: position || { x: 100, y: 50 },
    data: {
      label,
      parameters: {
        default_value: defaultQuery,
      },
    },
  };
}

/**
 * Creates an output node for panel workflows
 */
export function createOutputNode(
  id: string,
  label: string,
  format: string = 'markdown',
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'output',
    position: position || { x: 300, y: 600 },
    data: {
      label,
      parameters: {
        format,
      },
    },
  };
}

/**
 * Creates an expert agent node
 */
export function createExpertNode(
  id: string,
  expertTask: TaskDefinition,
  label: string,
  expertType?: string,
  context?: { expertise?: string[]; [key: string]: any },
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'task',
    position: position || { x: 300, y: 150 },
    data: {
      task: expertTask,
      label,
      _original_type: 'task',
      expertType,
      context,
    },
  };
}

/**
 * Creates a moderator node
 */
export function createModeratorNode(
  id: string,
  moderatorTask: TaskDefinition,
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'task',
    position: position || { x: 100, y: 150 },
    data: {
      task: moderatorTask,
      label: moderatorTask.name,
      _original_type: 'task',
    },
  };
}

/**
 * Creates a generic task node
 */
export function createTaskNode(
  id: string,
  task: TaskDefinition,
  label?: string,
  config?: Record<string, any>,
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'task',
    position: position || { x: 100, y: 300 },
    data: {
      task,
      label: label || task.name,
      _original_type: 'task',
      ...config,
    },
  };
}

/**
 * Creates an agent node
 *
 * Agent nodes represent AI agents that can be assigned to workflow steps.
 * They are visually distinct (purple theme) and configurable.
 *
 * @param id - Unique node ID
 * @param agent - Optional Agent object with full configuration
 * @param agentId - Optional agent ID to reference an agent from the store
 * @param label - Display label for the node
 * @param position - Node position on canvas
 * @returns ReactFlow Node configured as an agent
 */
export function createAgentNode(
  id: string,
  agent?: Agent,
  agentId?: string,
  label?: string,
  position?: { x: number; y: number }
): Node {
  return {
    id,
    type: 'agent',
    position: position || { x: 300, y: 200 },
    data: {
      agent,
      agentId: agentId || agent?.id,
      agentName: agent?.name,
      label: label || agent?.display_name || 'Agent',
      configured: !!agent,
      enabled: true,
      _original_type: 'agent',
    },
  };
}

/**
 * Creates an agent node from a minimal configuration
 * Useful when you only have an agent ID and need to reference the agent store
 */
export function createAgentNodeFromId(
  nodeId: string,
  agentId: string,
  label?: string,
  position?: { x: number; y: number }
): Node {
  return {
    id: nodeId,
    type: 'agent',
    position: position || { x: 300, y: 200 },
    data: {
      agentId,
      label: label || 'Agent',
      configured: false,
      enabled: true,
      _original_type: 'agent',
    },
  };
}

/**
 * Builds nodes from panel node configurations
 */
export function buildNodesFromConfig(
  nodeConfigs: PanelNodeConfig[],
  taskDefinitions: TaskDefinition[] = TASK_DEFINITIONS
): Node[] {
  const nodes: Node[] = [];
  let yOffset = 50;
  let xOffset = 100;

  for (const config of nodeConfigs) {
    let node: Node;

    switch (config.type) {
      case 'input':
        node = createInputNode(
          config.id,
          config.label || 'Input',
          config.parameters?.default_value || '',
          config.position || { x: xOffset, y: yOffset }
        );
        break;

      case 'output':
        node = createOutputNode(
          config.id,
          config.label || 'Output',
          config.parameters?.format || 'markdown',
          config.position || { x: xOffset, y: yOffset }
        );
        break;

      case 'task':
        if (!config.taskId) {
          throw new Error(`Task node ${config.id} requires taskId`);
        }
        const task = taskDefinitions.find((t) => t.id === config.taskId);
        if (!task) {
          throw new Error(`Task definition not found: ${config.taskId}`);
        }

        if (config.taskId === 'moderator') {
          const moderatorNode = createModeratorNode(
            config.id,
            task,
            config.position || { x: xOffset, y: yOffset }
          );
          // Merge any custom data (like systemPrompt) into the node data
          if (config.data) {
            moderatorNode.data = { ...moderatorNode.data, ...config.data };
          }
          if (config.label) {
            moderatorNode.data.label = config.label;
          }
          node = moderatorNode;
        } else if (config.taskId === 'expert_agent') {
          // Use expertConfig if provided, otherwise use label from config
          const expertLabel = config.expertConfig?.label || config.label || task.name;
          const expertType = config.expertConfig?.expertType;
          const expertContext = config.expertConfig?.context;
          node = createExpertNode(
            config.id,
            task,
            expertLabel,
            expertType,
            expertContext,
            config.position || { x: xOffset, y: yOffset }
          );
        } else {
          node = createTaskNode(
            config.id,
            task,
            config.label,
            config.data,
            config.position || { x: xOffset, y: yOffset }
          );
        }
        break;

      case 'orchestrator':
        // Create orchestrator node (conditional decision node)
        node = {
          id: config.id,
          type: 'orchestrator',
          position: config.position || { x: xOffset, y: yOffset },
          data: {
            label: config.label || 'Orchestrator',
            _original_type: 'orchestrator',
            ...config.data,
          },
        };
        break;

      case 'agent':
        // Create agent node
        node = createAgentNode(
          config.id,
          config.data?.agent,
          config.data?.agentId,
          config.label,
          config.position || { x: xOffset, y: yOffset }
        );
        break;

      default:
        throw new Error(`Unknown node type: ${config.type}`);
    }

    nodes.push(node);
    yOffset += 150;
  }

  return nodes;
}

