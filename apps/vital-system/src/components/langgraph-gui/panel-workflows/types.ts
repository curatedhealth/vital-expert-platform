import { Node, Edge } from 'reactflow';
import { TaskDefinition } from '../TaskLibrary';
import { LucideIcon } from 'lucide-react';

/**
 * Configuration for an expert in a panel workflow
 */
export interface ExpertConfig {
  id: string;
  type: string;
  label: string;
  context?: {
    expertise?: string[];
    [key: string]: any;
  };
  expertType?: string;
}

/**
 * Configuration for a node in a panel workflow
 */
export interface PanelNodeConfig {
  id: string;
  type: 'input' | 'output' | 'task' | 'orchestrator' | 'agent';
  taskId?: string; // For task nodes, the task definition ID
  label?: string;
  position?: { x: number; y: number };
  parameters?: Record<string, any>;
  data?: Record<string, any>;
  expertConfig?: ExpertConfig;
}

/**
 * Configuration for an edge in a panel workflow
 */
export interface PanelEdgeConfig {
  id: string;
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight' | 'step' | 'default';
  animated?: boolean;
  label?: string; // Optional label for conditional edges
}

/**
 * Configuration for workflow phase metadata
 */
export interface WorkflowPhaseConfig {
  nodes: Array<{
    id: string;
    type: string;
    config?: Record<string, any>;
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

/**
 * Complete panel workflow configuration
 */
export interface PanelWorkflowConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultQuery: string;
  experts: ExpertConfig[];
  nodes: PanelNodeConfig[];
  edges: PanelEdgeConfig[];
  phases: WorkflowPhaseConfig;
  metadata?: {
    mode?: string;
    selection?: 'manual' | 'automatic';
    interaction?: 'interactive' | 'autonomous';
    requires_agent_selection?: boolean;
    supports_hitl?: boolean;
    features?: string[];
    [key: string]: any;
  };
}

/**
 * Result of creating a panel workflow
 */
export interface PanelWorkflowResult {
  nodes: Node[];
  edges: Edge[];
  phases: WorkflowPhaseConfig;
  workflowName: string;
  metadata?: {
    mode?: string;
    selection?: 'manual' | 'automatic';
    interaction?: 'interactive' | 'autonomous';
    requires_agent_selection?: boolean;
    supports_hitl?: boolean;
    features?: string[];
    [key: string]: any;
  };
}

