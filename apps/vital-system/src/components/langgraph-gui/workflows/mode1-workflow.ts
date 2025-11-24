/**
 * Ask Expert Mode 1: Interactive Manual - Workflow Definition
 *
 * This file defines the complete ReactFlow workflow for Mode 1 as specified in:
 * MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md
 *
 * Architecture:
 * - 8 Core LangGraph Nodes
 * - 3 Conditional Edge Decision Points
 * - Complete state machine implementation
 * - Average execution time: 15-25 seconds per message
 */

import { Node, Edge } from 'reactflow';

export interface Mode1WorkflowConfig {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    version: string;
    mode: string;
    description: string;
    estimatedExecutionTime: string;
    targetMetrics: {
      responseTimeP50: string;
      responseTimeP95: string;
      responseTimeP99: string;
    };
  };
}

/**
 * Creates the complete Mode 1 workflow with all nodes and edges
 */
export const createMode1Workflow = (): Mode1WorkflowConfig => {
  // Define all nodes with their positions and configurations
  const nodes: Node[] = [
    // START NODE
    {
      id: 'start',
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
        label: '🚀 START',
        description: 'User sends message to selected expert',
        nodeType: 'start',
        config: {
          icon: '🚀',
          color: '#10b981',
          phase: 'initialization'
        }
      }
    },

    // PHASE 1: INITIALIZATION
    {
      id: 'load_agent',
      type: 'task',
      position: { x: 100, y: 200 },
      data: {
        label: '1️⃣ Load Agent',
        description: 'Fetch agent profile, persona, knowledge bases, and sub-agent pool',
        nodeType: 'langgraph_node',
        config: {
          icon: '👤',
          model: 'gpt-4-turbo-preview',
          duration: '1-2s',
          operations: [
            'Query agents table',
            'Load agent profile (name, specialty, system_prompt)',
            'Load knowledge_base_ids',
            'Load sub-agent pool (4 specialists)',
            'Create SystemMessage with persona'
          ],
          outputs: [
            'agent: AgentProfile',
            'agent_persona: string',
            'sub_agent_pool: List[Agent]',
            'messages: [SystemMessage]'
          ],
          phase: 'initialization'
        }
      }
    },

    {
      id: 'load_context',
      type: 'task',
      position: { x: 100, y: 340 },
      data: {
        label: '2️⃣ Load Context',
        description: 'Load conversation history (last 10 turns)',
        nodeType: 'langgraph_node',
        config: {
          icon: '💬',
          model: 'gpt-4-turbo-preview',
          duration: '2-3s',
          operations: [
            'Query ask_expert_messages WHERE session_id',
            'ORDER BY created_at DESC LIMIT 10',
            'Build message history (HumanMessage, AIMessage)',
            'Calculate context statistics (tokens, turns)'
          ],
          outputs: [
            'conversation_history: List[Dict]',
            'messages: [...20 historical messages]',
            'total_tokens: ~5000'
          ],
          phase: 'initialization'
        }
      }
    },

    // PHASE 2: CONTEXT ENRICHMENT
    {
      id: 'update_context',
      type: 'task',
      position: { x: 100, y: 480 },
      data: {
        label: '3️⃣ Update Context (RAG)',
        description: 'Add current message + Hybrid RAG search (semantic + keyword)',
        nodeType: 'langgraph_node',
        config: {
          icon: '🔍',
          model: 'text-embedding-3-large',
          duration: '3-5s',
          tools: ['pinecone_search', 'postgresql_fts'],
          operations: [
            'Add current user message to history',
            'Generate query embedding (1536-dim)',
            'Semantic search (Pinecone) - top 10',
            'Keyword search (PostgreSQL FTS) - top 10',
            'Hybrid fusion (RRF: 0.7*semantic + 0.3*keyword)',
            'Build context_window with top 5 results',
            'Summarize long history if needed'
          ],
          outputs: [
            'messages: [..., HumanMessage]',
            'rag_context: List[5 chunks]',
            'context_window: string'
          ],
          phase: 'context_enrichment'
        }
      }
    },

    // PHASE 3: REASONING & PLANNING
    {
      id: 'agent_reasoning',
      type: 'task',
      position: { x: 100, y: 620 },
      data: {
        label: '4️⃣ Agent Reasoning',
        description: 'Chain-of-thought analysis, determine tools & specialist needs',
        nodeType: 'langgraph_node',
        config: {
          icon: '🧠',
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
          duration: '3-5s',
          operations: [
            'Build reasoning prompt with context',
            'LLM analyzes query complexity',
            'Determine information needs',
            'Decide if tools are needed',
            'Decide if specialists are needed',
            'Plan response strategy'
          ],
          outputs: [
            'needs_tools: boolean',
            'tools_to_use: List[string]',
            'needs_specialists: boolean',
            'specialists_to_spawn: List[string]',
            'thinking_steps: List[Dict]',
            'estimated_complexity: 0.0-1.0'
          ],
          phase: 'reasoning'
        }
      }
    },

    // CONDITIONAL DECISION NODE 1
    {
      id: 'check_specialist_need',
      type: 'default',
      position: { x: 100, y: 760 },
      data: {
        label: '🔀 Check Specialists?',
        description: 'Conditional edge: needs_specialists == true?',
        nodeType: 'conditional',
        config: {
          icon: '🔀',
          color: '#f59e0b',
          condition: 'state["needs_specialists"] == True',
          routes: {
            true: 'spawn_specialists',
            false: 'check_tools_need'
          }
        }
      }
    },

    // PHASE 4: SUB-AGENT ORCHESTRATION
    {
      id: 'spawn_specialists',
      type: 'task',
      position: { x: 400, y: 860 },
      data: {
        label: '5️⃣ Spawn Specialists',
        description: 'Dynamically spawn Level 3 specialist sub-agents',
        nodeType: 'langgraph_node',
        config: {
          icon: '🤖',
          duration: '2-3s',
          operations: [
            'Initialize specialist 1 (Testing Requirements)',
            'Initialize specialist 2 (Predicate Search)',
            'Assign tasks to each specialist',
            'Register spawned specialist IDs'
          ],
          outputs: [
            'spawned_specialist_ids: List[UUID]',
            'spawned_specialists: List[Agent]',
            'specialist_tasks: List[Dict]'
          ],
          phase: 'sub_agent_orchestration'
        }
      }
    },

    // CONDITIONAL DECISION NODE 2
    {
      id: 'check_tools_need',
      type: 'default',
      position: { x: 100, y: 900 },
      data: {
        label: '🔀 Check Tools?',
        description: 'Conditional edge: needs_tools == true?',
        nodeType: 'conditional',
        config: {
          icon: '🔀',
          color: '#f59e0b',
          condition: 'state["needs_tools"] == True',
          routes: {
            true: 'tool_execution',
            false: 'generate_response'
          }
        }
      }
    },

    // PHASE 5: TOOL EXECUTION
    {
      id: 'tool_execution',
      type: 'task',
      position: { x: 400, y: 1000 },
      data: {
        label: '6️⃣ Tool Execution',
        description: 'Execute tools for data retrieval (FDA API, Standards DB)',
        nodeType: 'langgraph_node',
        config: {
          icon: '🛠️',
          duration: '3-7s',
          tools: [
            'predicate_device_search',
            'regulatory_database_query',
            'standards_search',
            'web_search',
            'document_analysis'
          ],
          operations: [
            'Execute Tool 1: predicate_device_search',
            '  → Query FDA 510(k) API',
            '  → Parse K number, testing standards',
            'Execute Tool 2: regulatory_database_query',
            '  → Query internal standards DB',
            '  → Retrieve ISO/IEC details',
            'Parallel execution when possible'
          ],
          outputs: [
            'tool_results: List[Dict]',
            'thinking_steps: [...tool execution logs]'
          ],
          phase: 'tool_execution'
        }
      }
    },

    // PHASE 6: RESPONSE GENERATION
    {
      id: 'generate_response',
      type: 'task',
      position: { x: 100, y: 1100 },
      data: {
        label: '7️⃣ Generate Response',
        description: 'Synthesize final expert response with streaming',
        nodeType: 'langgraph_node',
        config: {
          icon: '✍️',
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          duration: '5-10s',
          streaming: true,
          operations: [
            'Build comprehensive response prompt',
            'Include: agent_persona + context + tools + specialists',
            'LLM generates expert response (streaming)',
            'Extract citations from response',
            'Calculate metrics (tokens, cost, time)'
          ],
          outputs: [
            'response: string (1000-2000 tokens)',
            'citations: List[Dict]',
            'tokens_used: {prompt, completion, total}',
            'estimated_cost: float',
            'confidence_score: 0.0-1.0'
          ],
          phase: 'response_generation'
        }
      }
    },

    // PHASE 7: PERSISTENCE
    {
      id: 'update_memory',
      type: 'task',
      position: { x: 100, y: 1240 },
      data: {
        label: '8️⃣ Update Memory',
        description: 'Persist conversation to database',
        nodeType: 'langgraph_node',
        config: {
          icon: '💾',
          duration: '1-2s',
          operations: [
            'INSERT user message to ask_expert_messages',
            'INSERT assistant message with metadata',
            'UPDATE session statistics',
            'Log analytics event',
            'Optional: Cache response (Redis, 5min TTL)'
          ],
          outputs: [
            'message_ids: {user_id, assistant_id}',
            'continue_conversation: true'
          ],
          phase: 'persistence'
        }
      }
    },

    // CONDITIONAL DECISION NODE 3
    {
      id: 'check_continuation',
      type: 'default',
      position: { x: 100, y: 1380 },
      data: {
        label: '🔀 Check Continuation',
        description: 'Conditional edge: continue_conversation && !error?',
        nodeType: 'conditional',
        config: {
          icon: '🔀',
          color: '#f59e0b',
          condition: 'state["continue_conversation"] == True AND state["error"] == None',
          routes: {
            continue: 'end',
            error: 'end'
          }
        }
      }
    },

    // END NODE
    {
      id: 'end',
      type: 'output',
      position: { x: 100, y: 1500 },
      data: {
        label: '🏁 END',
        description: 'Message processing complete. Ready for next user input.',
        nodeType: 'end',
        config: {
          icon: '🏁',
          color: '#ef4444',
          phase: 'complete'
        }
      }
    }
  ];

  // Define all edges with proper routing
  const edges: Edge[] = [
    // Linear flow
    { id: 'e-start-load_agent', source: 'start', target: 'load_agent', animated: true },
    { id: 'e-load_agent-load_context', source: 'load_agent', target: 'load_context', animated: true },
    { id: 'e-load_context-update_context', source: 'load_context', target: 'update_context', animated: true },
    { id: 'e-update_context-agent_reasoning', source: 'update_context', target: 'agent_reasoning', animated: true },
    { id: 'e-agent_reasoning-check_specialist', source: 'agent_reasoning', target: 'check_specialist_need', animated: true },

    // Conditional: Spawn specialists?
    {
      id: 'e-check_specialist-spawn',
      source: 'check_specialist_need',
      target: 'spawn_specialists',
      label: 'needs_specialists: true',
      animated: true,
      style: { stroke: '#10b981' }
    },
    {
      id: 'e-check_specialist-tools',
      source: 'check_specialist_need',
      target: 'check_tools_need',
      label: 'needs_specialists: false',
      animated: true,
      style: { stroke: '#6b7280' }
    },

    // After spawning specialists, check tools
    {
      id: 'e-spawn-check_tools',
      source: 'spawn_specialists',
      target: 'check_tools_need',
      animated: true
    },

    // Conditional: Execute tools?
    {
      id: 'e-check_tools-execute',
      source: 'check_tools_need',
      target: 'tool_execution',
      label: 'needs_tools: true',
      animated: true,
      style: { stroke: '#10b981' }
    },
    {
      id: 'e-check_tools-generate',
      source: 'check_tools_need',
      target: 'generate_response',
      label: 'needs_tools: false',
      animated: true,
      style: { stroke: '#6b7280' }
    },

    // After tools, generate response
    {
      id: 'e-tools-generate',
      source: 'tool_execution',
      target: 'generate_response',
      animated: true
    },

    // After response, update memory
    {
      id: 'e-generate-memory',
      source: 'generate_response',
      target: 'update_memory',
      animated: true
    },

    // After memory, check continuation
    {
      id: 'e-memory-check_continuation',
      source: 'update_memory',
      target: 'check_continuation',
      animated: true
    },

    // Continuation to end
    {
      id: 'e-continuation-end',
      source: 'check_continuation',
      target: 'end',
      label: 'complete',
      animated: true,
      style: { stroke: '#10b981' }
    }
  ];

  return {
    nodes,
    edges,
    metadata: {
      version: '1.0',
      mode: 'mode_1_interactive_manual',
      description: 'Ask Expert Mode 1: Interactive Manual - User selects expert → Multi-turn conversation',
      estimatedExecutionTime: '15-25 seconds per message',
      targetMetrics: {
        responseTimeP50: '15-20s',
        responseTimeP95: '25-30s',
        responseTimeP99: '35-40s'
      }
    }
  };
};

/**
 * Helper function to get workflow statistics
 */
export const getMode1WorkflowStats = () => {
  const workflow = createMode1Workflow();

  return {
    totalNodes: workflow.nodes.length,
    totalEdges: workflow.edges.length,
    nodesByType: {
      langgraph_nodes: workflow.nodes.filter(n => n.data.nodeType === 'langgraph_node').length,
      conditional_nodes: workflow.nodes.filter(n => n.data.nodeType === 'conditional').length,
      control_nodes: workflow.nodes.filter(n => ['start', 'end'].includes(n.data.nodeType)).length
    },
    phases: {
      initialization: 2,
      context_enrichment: 1,
      reasoning: 1,
      sub_agent_orchestration: 1,
      tool_execution: 1,
      response_generation: 1,
      persistence: 1
    },
    estimatedExecutionTime: workflow.metadata.estimatedExecutionTime
  };
};

/**
 * Export workflow metadata for documentation
 */
export const MODE1_WORKFLOW_METADATA = {
  name: 'Ask Expert Mode 1: Interactive Manual',
  description: 'Conversational AI service where user explicitly selects a specific expert agent for multi-turn conversation with full context retention',
  characteristics: {
    expertSelection: 'Manual (User chooses)',
    interactionType: 'Interactive (Back-and-forth)',
    agentCount: '1 Expert (with potential sub-agents)',
    stateManagement: 'Stateful (Full conversation history)',
    executionMode: 'Conversational (No autonomous workflow)',
    contextWindow: 'Up to 200K tokens'
  },
  architecture: {
    totalNodes: 13,
    langgraphNodes: 8,
    conditionalNodes: 3,
    controlNodes: 2
  },
  performance: {
    averageResponseTime: '15-25s',
    p50: '15-20s',
    p95: '25-30s',
    p99: '35-40s'
  },
  dataFlow: {
    input: 'User message + session context',
    processing: [
      'Load agent profile',
      'Load conversation history',
      'RAG search (hybrid semantic + keyword)',
      'Chain-of-thought reasoning',
      'Optional: Spawn specialist sub-agents',
      'Optional: Execute tools (FDA API, standards DB)',
      'Generate streaming response',
      'Persist to database'
    ],
    output: 'Expert response with citations + metadata'
  }
};
