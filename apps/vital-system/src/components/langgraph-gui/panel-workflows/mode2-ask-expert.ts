/**
 * Ask Expert Mode 2: Interactive Automatic - Panel Workflow Configuration
 *
 * This panel workflow implements Mode 2 where AI automatically selects best expert(s)
 * for multi-turn conversation with dynamic expert switching capabilities.
 *
 * Key Differences from Mode 1:
 * - AI selects expert(s) automatically (up to 2)
 * - Expert selection node added before conversation
 * - Dynamic expert switching during conversation
 * - Multi-expert coordination
 * - Response time: 45-60 seconds
 */

import { Users } from 'lucide-react';
import { PanelWorkflowConfig } from './types';

export const MODE2_ASK_EXPERT_CONFIG: PanelWorkflowConfig = {
  id: 'mode2_ask_expert',
  name: 'Ask Expert Mode 2: Interactive Automatic',
  description: 'AI selects best expert(s) → Multi-turn conversation with dynamic expert switching',
  icon: Users,
  defaultQuery: 'I need advice on entering the EU market with my medical device',
  
  // Metadata for mode detection
  metadata: {
    mode: 'mode2',
    selection: 'automatic',
    interaction: 'interactive',
    requires_agent_selection: false,
    supports_hitl: false,
    features: ['auto_selection', 'multi_agent', 'dynamic_switching', 'rag', 'tools'],
  },

  // Mode 2 can use up to 2 experts (AI selected)
  experts: [
    {
      id: 'master_orchestrator',
      type: 'orchestrator',
      label: 'Master Orchestrator',
      expertType: 'master_agent',
      context: {
        expertise: [
          'Expert selection and routing',
          'Multi-expert coordination',
          'Dynamic expert switching',
          'Query analysis and decomposition'
        ],
        display_name: 'VITAL Master Orchestrator',
        specialty: 'Intelligent expert selection and coordination',
        system_prompt: `You are the VITAL Master Orchestrator, responsible for analyzing user queries and selecting the most appropriate expert(s) to handle them.

Your responsibilities:
• Analyze user queries to understand intent, domain, and complexity
• Select 1-2 most appropriate experts from the pool
• Coordinate multiple experts when needed
• Dynamically switch experts if conversation shifts
• Ensure seamless multi-expert collaboration

Expert selection criteria:
• Domain expertise match
• Query complexity level
• Historical success rate
• Expert availability and load

You have access to all expert profiles and can route queries dynamically.`,
        available_experts: [
          'fda_510k_expert',
          'clinical_trials_expert',
          'quality_systems_expert',
          'reimbursement_expert',
          'eu_regulatory_expert',
          'cybersecurity_expert'
        ]
      }
    }
  ],

  // LangGraph state machine nodes
  nodes: [
    // START
    {
      id: 'start',
      type: 'input',
      label: '🚀 START',
      position: { x: 250, y: 50 },
      data: {
        description: 'User asks question without selecting expert',
        phase: 'initialization'
      }
    },

    // PHASE 1: INITIALIZATION & EXPERT SELECTION
    {
      id: 'analyze_query',
      type: 'task',
      taskId: 'query_analysis',
      label: '1️⃣ Analyze Query',
      position: { x: 250, y: 150 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Parse user query',
          'Extract intent and domains',
          'Determine complexity level',
          'Identify required expertise areas'
        ]
      },
      data: {
        description: 'Analyze query to determine expert needs',
        icon: '🔍',
        phase: 'initialization',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.3
        }
      }
    },

    {
      id: 'select_experts',
      type: 'task',
      taskId: 'automatic_expert_selection',
      label: '2️⃣ Select Experts (AI)',
      position: { x: 250, y: 270 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Query expert profiles',
          'Score experts by relevance',
          'Select top 1-2 experts',
          'Load expert personas',
          'Initialize expert contexts'
        ]
      },
      data: {
        description: 'AI selects best expert(s) from pool (max 2)',
        icon: '🤖',
        phase: 'expert_selection',
        config: {
          max_experts: 2,
          selection_strategy: 'relevance_scoring'
        }
      }
    },

    {
      id: 'load_agent',
      type: 'task',
      taskId: 'load_selected_agents',
      label: '3️⃣ Load Selected Agents',
      position: { x: 250, y: 390 },
      parameters: {
        duration: '1-2s',
        operations: [
          'Load primary expert profile',
          'Load secondary expert (if selected)',
          'Load knowledge_base_ids',
          'Load sub-agent pools',
          'Create SystemMessages'
        ]
      },
      data: {
        description: 'Fetch selected expert profiles, personas, knowledge bases',
        icon: '👤',
        phase: 'initialization'
      }
    },

    {
      id: 'load_context',
      type: 'task',
      taskId: 'load_conversation_history',
      label: '4️⃣ Load Context',
      position: { x: 250, y: 510 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Query last 10 conversation turns',
          'Build message history',
          'Track expert switches',
          'Calculate context statistics'
        ]
      },
      data: {
        description: 'Load conversation history (last 10 turns)',
        icon: '💬',
        phase: 'initialization'
      }
    },

    // PHASE 2: CONTEXT ENRICHMENT
    {
      id: 'update_context',
      type: 'task',
      taskId: 'rag_hybrid_search_multi_expert',
      label: '5️⃣ Update Context (RAG)',
      position: { x: 250, y: 630 },
      parameters: {
        duration: '3-5s',
        tools: ['pinecone_search', 'postgresql_fts'],
        operations: [
          'Add current message',
          'Generate embedding',
          'Semantic search across multiple expert KBs',
          'Keyword search (PostgreSQL)',
          'Hybrid fusion (RRF)',
          'Build multi-expert context window'
        ]
      },
      data: {
        description: 'Hybrid RAG search across selected expert knowledge bases',
        icon: '🔍',
        phase: 'context_enrichment',
        config: {
          model: 'text-embedding-3-large',
          top_k: 10,
          fusion_weights: { semantic: 0.7, keyword: 0.3 }
        }
      }
    },

    // PHASE 3: REASONING & PLANNING
    {
      id: 'agent_reasoning',
      type: 'task',
      taskId: 'multi_expert_reasoning',
      label: '6️⃣ Multi-Expert Reasoning',
      position: { x: 250, y: 750 },
      parameters: {
        duration: '4-6s',
        operations: [
          'Build reasoning prompt for each expert',
          'Primary expert analyzes query',
          'Secondary expert provides perspective',
          'Determine tool needs',
          'Determine specialist needs',
          'Check if expert switch needed',
          'Plan coordinated response strategy'
        ]
      },
      data: {
        description: 'Chain-of-thought analysis with multi-expert coordination',
        icon: '🧠',
        phase: 'reasoning',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
          reasoning_mode: 'multi_expert_chain_of_thought'
        }
      }
    },

    // CONDITIONAL DECISION 1: Expert Switch?
    {
      id: 'check_expert_switch',
      type: 'orchestrator',
      label: '🔀 Switch Expert?',
      position: { x: 250, y: 870 },
      data: {
        description: 'Conditional: needs_expert_switch == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["needs_expert_switch"] == True',
        routes: {
          true: 'select_experts',
          false: 'check_specialist_need'
        }
      }
    },

    // CONDITIONAL DECISION 2: Specialists?
    {
      id: 'check_specialist_need',
      type: 'orchestrator',
      label: '🔀 Specialists?',
      position: { x: 250, y: 990 },
      data: {
        description: 'Conditional: needs_specialists == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["needs_specialists"] == True',
        routes: {
          true: 'spawn_specialists',
          false: 'check_tools_need'
        }
      }
    },

    // PHASE 4: SUB-AGENT ORCHESTRATION
    {
      id: 'spawn_specialists',
      type: 'task',
      taskId: 'spawn_multi_expert_specialists',
      label: '7️⃣ Spawn Specialists',
      position: { x: 500, y: 1090 },
      parameters: {
        duration: '2-4s',
        operations: [
          'Initialize specialists for primary expert',
          'Initialize specialists for secondary expert (if any)',
          'Assign coordinated tasks',
          'Register spawned IDs',
          'Set up inter-specialist communication'
        ]
      },
      data: {
        description: 'Spawn Level 3 specialists across multiple experts',
        icon: '🤖',
        phase: 'sub_agent_orchestration'
      }
    },

    // CONDITIONAL DECISION 3: Tools?
    {
      id: 'check_tools_need',
      type: 'orchestrator',
      label: '🔀 Tools?',
      position: { x: 250, y: 1210 },
      data: {
        description: 'Conditional: needs_tools == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["needs_tools"] == True',
        routes: {
          true: 'tool_execution',
          false: 'coordinate_experts'
        }
      }
    },

    // PHASE 5: TOOL EXECUTION
    {
      id: 'tool_execution',
      type: 'task',
      taskId: 'execute_multi_expert_tools',
      label: '8️⃣ Tool Execution',
      position: { x: 500, y: 1310 },
      parameters: {
        duration: '3-7s',
        tools: [
          'predicate_device_search',
          'regulatory_database_query',
          'standards_search',
          'web_search',
          'document_analysis',
          'clinical_trials_search',
          'eu_regulatory_search'
        ],
        operations: [
          'Execute tools for primary expert',
          'Execute tools for secondary expert',
          'Parallel execution when possible',
          'Merge tool results'
        ]
      },
      data: {
        description: 'Execute tools across multiple expert domains',
        icon: '🛠️',
        phase: 'tool_execution'
      }
    },

    // PHASE 6: EXPERT COORDINATION
    {
      id: 'coordinate_experts',
      type: 'task',
      taskId: 'coordinate_multi_expert_input',
      label: '9️⃣ Coordinate Experts',
      position: { x: 250, y: 1430 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Merge insights from multiple experts',
          'Resolve conflicting perspectives',
          'Create unified response outline',
          'Determine primary responder',
          'Prepare expert attribution'
        ]
      },
      data: {
        description: 'Coordinate and merge multi-expert perspectives',
        icon: '🤝',
        phase: 'coordination'
      }
    },

    // PHASE 7: RESPONSE GENERATION
    {
      id: 'generate_response',
      type: 'task',
      taskId: 'generate_multi_expert_response',
      label: '🔟 Generate Response',
      position: { x: 250, y: 1550 },
      parameters: {
        duration: '5-10s',
        streaming: true,
        operations: [
          'Build comprehensive multi-expert prompt',
          'LLM generates unified response (streaming)',
          'Attribute insights to experts',
          'Extract citations',
          'Calculate metrics'
        ]
      },
      data: {
        description: 'Synthesize unified expert response with attribution',
        icon: '✍️',
        phase: 'response_generation',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          max_tokens: 2500,
          stream: true
        }
      }
    },

    // PHASE 8: PERSISTENCE
    {
      id: 'update_memory',
      type: 'task',
      taskId: 'persist_multi_expert_conversation',
      label: '1️⃣1️⃣ Update Memory',
      position: { x: 250, y: 1670 },
      parameters: {
        duration: '1-2s',
        operations: [
          'INSERT user message',
          'INSERT assistant message with expert attribution',
          'UPDATE session stats',
          'Track expert usage',
          'Log analytics event',
          'Optional: Cache response'
        ]
      },
      data: {
        description: 'Persist conversation with expert tracking',
        icon: '💾',
        phase: 'persistence'
      }
    },

    // CONDITIONAL DECISION 4: Continue?
    {
      id: 'check_continuation',
      type: 'orchestrator',
      label: '🔀 Continue?',
      position: { x: 250, y: 1790 },
      data: {
        description: 'Conditional: continue && !error?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["continue_conversation"] == True AND state["error"] == None',
        routes: {
          continue: 'end',
          error: 'end'
        }
      }
    },

    // END
    {
      id: 'end',
      type: 'output',
      label: '🏁 END',
      position: { x: 250, y: 1910 },
      data: {
        description: 'Message complete. Ready for next input.',
        phase: 'complete'
      }
    }
  ],

  // Edge connections
  edges: [
    // Linear flow - initialization
    { id: 'e1', source: 'start', target: 'analyze_query', animated: true },
    { id: 'e2', source: 'analyze_query', target: 'select_experts', animated: true },
    { id: 'e3', source: 'select_experts', target: 'load_agent', animated: true },
    { id: 'e4', source: 'load_agent', target: 'load_context', animated: true },
    { id: 'e5', source: 'load_context', target: 'update_context', animated: true },
    { id: 'e6', source: 'update_context', target: 'agent_reasoning', animated: true },
    { id: 'e7', source: 'agent_reasoning', target: 'check_expert_switch', animated: true },

    // Conditional: Expert switch?
    { id: 'e8a', source: 'check_expert_switch', target: 'select_experts', animated: true, label: 'Switch' },
    { id: 'e8b', source: 'check_expert_switch', target: 'check_specialist_need', animated: true, label: 'Continue' },

    // Conditional: Spawn specialists?
    { id: 'e9a', source: 'check_specialist_need', target: 'spawn_specialists', animated: true },
    { id: 'e9b', source: 'check_specialist_need', target: 'check_tools_need', animated: true },

    // After specialists
    { id: 'e10', source: 'spawn_specialists', target: 'check_tools_need', animated: true },

    // Conditional: Execute tools?
    { id: 'e11a', source: 'check_tools_need', target: 'tool_execution', animated: true },
    { id: 'e11b', source: 'check_tools_need', target: 'coordinate_experts', animated: true },

    // After tools
    { id: 'e12', source: 'tool_execution', target: 'coordinate_experts', animated: true },

    // Linear to end
    { id: 'e13', source: 'coordinate_experts', target: 'generate_response', animated: true },
    { id: 'e14', source: 'generate_response', target: 'update_memory', animated: true },
    { id: 'e15', source: 'update_memory', target: 'check_continuation', animated: true },
    { id: 'e16', source: 'check_continuation', target: 'end', animated: true }
  ],

  // Phase metadata for visual organization
  phases: {
    nodes: [
      {
        id: 'phase_initialization',
        type: 'phase_group',
        config: {
          label: 'Phase 1: Initialization & Expert Selection',
          color: '#3b82f6',
          nodes: ['analyze_query', 'select_experts', 'load_agent', 'load_context']
        }
      },
      {
        id: 'phase_context',
        type: 'phase_group',
        config: {
          label: 'Phase 2: Context Enrichment',
          color: '#8b5cf6',
          nodes: ['update_context']
        }
      },
      {
        id: 'phase_reasoning',
        type: 'phase_group',
        config: {
          label: 'Phase 3: Multi-Expert Reasoning',
          color: '#ec4899',
          nodes: ['agent_reasoning', 'check_expert_switch', 'check_specialist_need']
        }
      },
      {
        id: 'phase_orchestration',
        type: 'phase_group',
        config: {
          label: 'Phase 4: Sub-Agent Orchestration',
          color: '#f59e0b',
          nodes: ['spawn_specialists']
        }
      },
      {
        id: 'phase_tools',
        type: 'phase_group',
        config: {
          label: 'Phase 5: Tool Execution',
          color: '#10b981',
          nodes: ['check_tools_need', 'tool_execution']
        }
      },
      {
        id: 'phase_coordination',
        type: 'phase_group',
        config: {
          label: 'Phase 6: Expert Coordination',
          color: '#f97316',
          nodes: ['coordinate_experts']
        }
      },
      {
        id: 'phase_generation',
        type: 'phase_group',
        config: {
          label: 'Phase 7: Response Generation',
          color: '#06b6d4',
          nodes: ['generate_response']
        }
      },
      {
        id: 'phase_persistence',
        type: 'phase_group',
        config: {
          label: 'Phase 8: Persistence',
          color: '#6366f1',
          nodes: ['update_memory', 'check_continuation']
        }
      }
    ],
    edges: []
  }
};
