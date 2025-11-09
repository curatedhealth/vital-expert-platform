/**
 * Node Type Definitions
 * Custom node components for the workflow editor
 */

import { TaskNode } from './node-types/TaskNode';
import { ConditionalNode } from './node-types/ConditionalNode';
import { LoopNode } from './node-types/LoopNode';
import { AgentNode } from './node-types/AgentNode';
import { RAGNode } from './node-types/RAGNode';
import { ParallelTaskNode } from './node-types/ParallelTaskNode';
import { HumanReviewNode } from './node-types/HumanReviewNode';
import { APINode } from './node-types/APINode';

export const nodeTypes = {
  task: TaskNode,
  conditional: ConditionalNode,
  loop: LoopNode,
  agent: AgentNode,
  rag: RAGNode,
  'parallel-task': ParallelTaskNode,
  'human-review': HumanReviewNode,
  api: APINode,
};

