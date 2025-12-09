/**
 * VITAL Protocol - Node Type Constants
 * 
 * These are the official node types supported by the Visual Workflow Designer.
 * Each node type maps to a specific Python handler in the backend registry.
 * 
 * @see services/ai-engine/src/modules/translator/registry.py
 */

export const NODE_TYPES = {
  // Entry/Exit Nodes
  START: 'start',
  END: 'end',
  
  // AI Agent Nodes
  EXPERT: 'expert',
  PANEL: 'panel',
  
  // Tool Nodes
  TOOL: 'tool',
  RAG_QUERY: 'rag_query',
  WEB_SEARCH: 'web_search',
  
  // Control Flow Nodes
  ROUTER: 'router',
  CONDITION: 'condition',
  PARALLEL: 'parallel',
  MERGE: 'merge',
  
  // Human-in-the-Loop Nodes
  HUMAN_INPUT: 'human_input',
  APPROVAL: 'approval',
  
  // Data Nodes
  TRANSFORM: 'transform',
  AGGREGATE: 'aggregate',
  
  // Utility Nodes
  DELAY: 'delay',
  LOG: 'log',
  WEBHOOK: 'webhook',
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

export const NODE_TYPE_VALUES = Object.values(NODE_TYPES);

/**
 * Node categories for UI organization
 */
export const NODE_CATEGORIES = {
  ENTRY_EXIT: ['start', 'end'],
  AI_AGENTS: ['expert', 'panel'],
  TOOLS: ['tool', 'rag_query', 'web_search'],
  CONTROL_FLOW: ['router', 'condition', 'parallel', 'merge'],
  HUMAN_IN_LOOP: ['human_input', 'approval'],
  DATA: ['transform', 'aggregate'],
  UTILITY: ['delay', 'log', 'webhook'],
} as const;

/**
 * Node metadata for UI rendering
 */
export const NODE_METADATA: Record<NodeType, {
  label: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}> = {
  start: {
    label: 'Start',
    description: 'Entry point for the workflow',
    icon: 'play',
    color: '#22c55e',
    category: 'Entry/Exit',
  },
  end: {
    label: 'End',
    description: 'Exit point for the workflow',
    icon: 'stop',
    color: '#ef4444',
    category: 'Entry/Exit',
  },
  expert: {
    label: 'Expert Agent',
    description: 'AI expert that processes queries with domain knowledge',
    icon: 'brain',
    color: '#8b5cf6',
    category: 'AI Agents',
  },
  panel: {
    label: 'Expert Panel',
    description: 'Multi-agent panel for consensus-based responses',
    icon: 'users',
    color: '#6366f1',
    category: 'AI Agents',
  },
  tool: {
    label: 'Tool',
    description: 'Execute a specific tool or function',
    icon: 'wrench',
    color: '#f59e0b',
    category: 'Tools',
  },
  rag_query: {
    label: 'RAG Query',
    description: 'Query the knowledge base using RAG',
    icon: 'database',
    color: '#06b6d4',
    category: 'Tools',
  },
  web_search: {
    label: 'Web Search',
    description: 'Search the web for information',
    icon: 'globe',
    color: '#3b82f6',
    category: 'Tools',
  },
  router: {
    label: 'Router',
    description: 'Route to different paths based on conditions',
    icon: 'git-branch',
    color: '#ec4899',
    category: 'Control Flow',
  },
  condition: {
    label: 'Condition',
    description: 'Evaluate a condition and branch',
    icon: 'git-merge',
    color: '#f97316',
    category: 'Control Flow',
  },
  parallel: {
    label: 'Parallel',
    description: 'Execute multiple branches in parallel',
    icon: 'layers',
    color: '#14b8a6',
    category: 'Control Flow',
  },
  merge: {
    label: 'Merge',
    description: 'Merge results from parallel branches',
    icon: 'git-pull-request',
    color: '#84cc16',
    category: 'Control Flow',
  },
  human_input: {
    label: 'Human Input',
    description: 'Wait for human input',
    icon: 'user',
    color: '#a855f7',
    category: 'Human-in-the-Loop',
  },
  approval: {
    label: 'Approval',
    description: 'Wait for human approval to continue',
    icon: 'check-circle',
    color: '#10b981',
    category: 'Human-in-the-Loop',
  },
  transform: {
    label: 'Transform',
    description: 'Transform data between nodes',
    icon: 'shuffle',
    color: '#64748b',
    category: 'Data',
  },
  aggregate: {
    label: 'Aggregate',
    description: 'Aggregate data from multiple sources',
    icon: 'layers',
    color: '#78716c',
    category: 'Data',
  },
  delay: {
    label: 'Delay',
    description: 'Add a delay before continuing',
    icon: 'clock',
    color: '#94a3b8',
    category: 'Utility',
  },
  log: {
    label: 'Log',
    description: 'Log data for debugging',
    icon: 'file-text',
    color: '#71717a',
    category: 'Utility',
  },
  webhook: {
    label: 'Webhook',
    description: 'Call an external webhook',
    icon: 'send',
    color: '#0ea5e9',
    category: 'Utility',
  },
};
