/**
 * Node Type Definitions and Configuration
 * 
 * Defines all available node types for the workflow designer
 */

import {
  Brain,
  Wrench,
  GitBranch,
  Layers,
  User,
  CheckCircle,
  Play,
  Box,
  ArrowRight,
  Flag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NodeType } from '../types/workflow';

export interface NodeTypeDefinition {
  type: NodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  category: 'flow' | 'agent' | 'tool' | 'control';
  defaultConfig: Record<string, any>;
}

export const NODE_TYPE_DEFINITIONS: Record<NodeType, NodeTypeDefinition> = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Entry point of the workflow',
    icon: Play,
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    category: 'flow',
    defaultConfig: {},
  },
  
  end: {
    type: 'end',
    label: 'End',
    description: 'Exit point of the workflow',
    icon: CheckCircle,
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    category: 'flow',
    defaultConfig: {},
  },
  
  // Legacy types - map to start/end
  input: {
    type: 'input',
    label: 'Input',
    description: 'Workflow input (legacy)',
    icon: ArrowRight,
    color: '#10b981',
    bgColor: '#d1fae5',
    borderColor: '#6ee7b7',
    category: 'flow',
    defaultConfig: {},
  },
  
  output: {
    type: 'output',
    label: 'Output',
    description: 'Workflow output (legacy)',
    icon: Flag,
    color: '#ef4444',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    category: 'flow',
    defaultConfig: {},
  },
  
  agent: {
    type: 'agent',
    label: 'Agent',
    description: 'AI agent that processes information and makes decisions',
    icon: Brain,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    borderColor: '#c4b5fd',
    category: 'agent',
    defaultConfig: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant.',
    },
  },
  
  tool: {
    type: 'tool',
    label: 'Tool',
    description: 'Execute a specific function or API call',
    icon: Wrench,
    color: '#3b82f6',
    bgColor: '#dbeafe',
    borderColor: '#93c5fd',
    category: 'tool',
    defaultConfig: {
      toolName: '',
      toolParams: {},
    },
  },
  
  condition: {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on conditions',
    icon: GitBranch,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    category: 'control',
    defaultConfig: {
      conditionType: 'simple',
      branches: [],
    },
  },
  
  parallel: {
    type: 'parallel',
    label: 'Parallel',
    description: 'Execute multiple branches simultaneously',
    icon: Layers,
    color: '#06b6d4',
    bgColor: '#cffafe',
    borderColor: '#67e8f9',
    category: 'control',
    defaultConfig: {
      parallelBranches: [],
      mergeStrategy: 'all',
    },
  },
  
  human: {
    type: 'human',
    label: 'Human-in-Loop',
    description: 'Pause for human input or approval',
    icon: User,
    color: '#ec4899',
    bgColor: '#fce7f3',
    borderColor: '#f9a8d4',
    category: 'control',
    defaultConfig: {
      humanApprovalRequired: true,
      humanInstructions: 'Please review and approve',
    },
  },
  
  subgraph: {
    type: 'subgraph',
    label: 'Subgraph',
    description: 'Reference another workflow as a subgraph',
    icon: Box,
    color: '#6366f1',
    bgColor: '#e0e7ff',
    borderColor: '#a5b4fc',
    category: 'flow',
    defaultConfig: {
      subgraphId: '',
    },
  },
  
  orchestrator: {
    type: 'orchestrator',
    label: 'Orchestrator',
    description: 'Coordinates agents and tools, handles conditional logic',
    icon: GitBranch,
    color: '#f59e0b',
    bgColor: '#fef3c7',
    borderColor: '#fcd34d',
    category: 'control',
    defaultConfig: {
      logic: 'sequential',
      conditions: [],
    },
  },
};

/**
 * Get node types by category
 */
export function getNodeTypesByCategory(category: 'flow' | 'agent' | 'tool' | 'control'): NodeTypeDefinition[] {
  return Object.values(NODE_TYPE_DEFINITIONS).filter(def => def.category === category);
}

/**
 * Get node type definition with fallback
 */
export function getNodeTypeDefinition(type: NodeType): NodeTypeDefinition {
  const definition = NODE_TYPE_DEFINITIONS[type];
  
  // Fallback to 'agent' if type not found (safety check)
  if (!definition) {
    console.warn(`Node type "${type}" not found, using fallback`);
    return NODE_TYPE_DEFINITIONS['agent'];
  }
  
  return definition;
}

/**
 * Node palette categories for UI
 */
export const NODE_PALETTE_CATEGORIES = [
  {
    id: 'flow',
    label: 'Flow Control',
    description: 'Start, end, and workflow control nodes',
  },
  {
    id: 'agent',
    label: 'Agents',
    description: 'AI agents for processing and decision making',
  },
  {
    id: 'tool',
    label: 'Tools',
    description: 'Functions and API integrations',
  },
  {
    id: 'control',
    label: 'Control Flow',
    description: 'Conditions, parallel execution, and human input',
  },
] as const;

