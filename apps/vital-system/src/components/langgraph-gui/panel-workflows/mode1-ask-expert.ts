/**
 * Ask Expert Mode 1: Interactive Manual - Panel Workflow Configuration
 *
 * This panel workflow implements the Mode 1 LangGraph state machine as specified in:
 * MODE_1_DETAILED_WORKFLOW_VISUALIZATION.md
 *
 * User selects expert → Multi-turn conversation → Single expert maintains persona
 */

import { Users } from 'lucide-react';
import { PanelWorkflowConfig } from './types';

export const MODE1_ASK_EXPERT_CONFIG: PanelWorkflowConfig = {
  id: 'mode1_ask_expert',
  name: 'Ask Expert Mode 1: Interactive Manual',
  description: 'User selects specific expert → Multi-turn conversation with full context retention',
  icon: Users,
  defaultQuery: 'What testing is required for a Class II device similar to the Smith Cardiac Monitor?',

  // Mode 1 uses one expert (user selected), but can spawn specialists
  experts: [
    {
      id: 'fda_510k_expert',
      type: 'expert',
      label: 'FDA 510(k) Regulatory Expert',
      expertType: 'regulatory_expert',
      context: {
        expertise: [
          'FDA 510(k) premarket notifications',
          'Predicate device selection',
          'Substantial equivalence determination',
          'Testing protocol development',
          'FDA response strategies'
        ],
        display_name: 'Dr. Sarah Mitchell',
        specialty: 'FDA 510(k) Premarket Notification',
        system_prompt: `You are Dr. Sarah Mitchell, a regulatory affairs expert with over 20 years of experience in FDA 510(k) submissions.

Your communication style:
• Clear and organized
• Cite specific FDA guidance documents and CFR sections
• Provide practical, actionable recommendations
• Share real-world examples from past submissions
• Proactively identify potential regulatory challenges

Your expertise areas:
• Predicate device selection and analysis
• Substantial equivalence determinations
• Testing protocol development
• 510(k) submission package assembly
• FDA response strategies (Additional Information requests)
• Special 510(k) pathways (Traditional, Special, Abbreviated)`,
        knowledge_base_ids: [
          'fda-510k-database',
          'fda-guidance-library',
          'cfr-title-21',
          'iso-iec-standards',
          'device-classification'
        ],
        sub_agents: [
          'testing_requirements_specialist',
          'predicate_search_specialist',
          'substantial_equivalence_specialist',
          'fda_response_specialist'
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
        description: 'User sends message to selected expert',
        phase: 'initialization'
      }
    },

    // PHASE 1: INITIALIZATION
    {
      id: 'load_agent',
      type: 'task',
      taskId: 'rag_query', // Using existing task as placeholder
      label: '1️⃣ Load Agent',
      position: { x: 250, y: 150 },
      parameters: {
        duration: '1-2s',
        operations: [
          'Query agents table',
          'Load agent profile',
          'Load knowledge_base_ids',
          'Load sub-agent pool',
          'Create SystemMessage'
        ]
      },
      data: {
        description: 'Fetch agent profile, persona, knowledge bases',
        icon: '👤',
        phase: 'initialization',
        config: {
          model: 'gpt-4-turbo-preview'
        }
      }
    },

    {
      id: 'load_context',
      type: 'task',
      taskId: 'rag_query', // Using existing task as placeholder
      label: '2️⃣ Load Context',
      position: { x: 250, y: 270 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Query last 10 conversation turns',
          'Build message history',
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
      taskId: 'rag_query', // Using existing RAG task
      label: '3️⃣ Update Context (RAG)',
      position: { x: 250, y: 390 },
      parameters: {
        duration: '3-5s',
        tools: ['pinecone_search', 'postgresql_fts'],
        operations: [
          'Add current message',
          'Generate embedding',
          'Semantic search (Pinecone)',
          'Keyword search (PostgreSQL)',
          'Hybrid fusion (RRF)',
          'Build context window'
        ]
      },
      data: {
        description: 'Hybrid RAG search (semantic + keyword)',
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
      taskId: 'expert_agent', // Using existing expert agent task
      label: '4️⃣ Agent Reasoning',
      position: { x: 250, y: 510 },
      parameters: {
        duration: '3-5s',
        operations: [
          'Build reasoning prompt',
          'LLM analyzes query',
          'Determine tool needs',
          'Determine specialist needs',
          'Plan response strategy'
        ]
      },
      data: {
        description: 'Chain-of-thought analysis, plan response',
        icon: '🧠',
        phase: 'reasoning',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.3,
          reasoning_mode: 'chain_of_thought'
        }
      }
    },

    // CONDITIONAL DECISION 1
    {
      id: 'check_specialist_need',
      type: 'orchestrator',
      label: '🔀 Specialists?',
      position: { x: 250, y: 630 },
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
      taskId: 'expert_agent', // Using existing expert agent task
      label: '5️⃣ Spawn Specialists',
      position: { x: 500, y: 730 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Initialize Testing Requirements Specialist',
          'Initialize Predicate Search Specialist',
          'Assign tasks to specialists',
          'Register spawned IDs'
        ]
      },
      data: {
        description: 'Dynamically spawn Level 3 specialist sub-agents',
        icon: '🤖',
        phase: 'sub_agent_orchestration'
      }
    },

    // CONDITIONAL DECISION 2
    {
      id: 'check_tools_need',
      type: 'orchestrator',
      label: '🔀 Tools?',
      position: { x: 250, y: 850 },
      data: {
        description: 'Conditional: needs_tools == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["needs_tools"] == True',
        routes: {
          true: 'tool_execution',
          false: 'generate_response'
        }
      }
    },

    // PHASE 5: TOOL EXECUTION
    {
      id: 'tool_execution',
      type: 'task',
      taskId: 'fda_search', // Using existing FDA search task
      label: '6️⃣ Tool Execution',
      position: { x: 500, y: 950 },
      parameters: {
        duration: '3-7s',
        tools: [
          'predicate_device_search',
          'regulatory_database_query',
          'standards_search',
          'web_search',
          'document_analysis'
        ],
        operations: [
          'Execute predicate_device_search',
          'Execute regulatory_database_query',
          'Parallel execution when possible'
        ]
      },
      data: {
        description: 'Execute tools (FDA API, Standards DB)',
        icon: '🛠️',
        phase: 'tool_execution'
      }
    },

    // PHASE 6: RESPONSE GENERATION
    {
      id: 'generate_response',
      type: 'task',
      taskId: 'expert_agent', // Using existing expert agent task
      label: '7️⃣ Generate Response',
      position: { x: 250, y: 1070 },
      parameters: {
        duration: '5-10s',
        streaming: true,
        operations: [
          'Build comprehensive prompt',
          'LLM generates response (streaming)',
          'Extract citations',
          'Calculate metrics'
        ]
      },
      data: {
        description: 'Synthesize expert response with streaming',
        icon: '✍️',
        phase: 'response_generation',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        }
      }
    },

    // PHASE 7: PERSISTENCE
    {
      id: 'update_memory',
      type: 'task',
      taskId: 'rag_archive', // Using existing RAG archive task
      label: '8️⃣ Update Memory',
      position: { x: 250, y: 1190 },
      parameters: {
        duration: '1-2s',
        operations: [
          'INSERT user message',
          'INSERT assistant message',
          'UPDATE session stats',
          'Log analytics event',
          'Optional: Cache response'
        ]
      },
      data: {
        description: 'Persist conversation to database',
        icon: '💾',
        phase: 'persistence'
      }
    },

    // CONDITIONAL DECISION 3
    {
      id: 'check_continuation',
      type: 'orchestrator',
      label: '🔀 Continue?',
      position: { x: 250, y: 1310 },
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
      position: { x: 250, y: 1430 },
      data: {
        description: 'Message complete. Ready for next input.',
        phase: 'complete'
      }
    }
  ],

  // Edge connections
  edges: [
    // Linear flow
    { id: 'e1', source: 'start', target: 'load_agent', animated: true },
    { id: 'e2', source: 'load_agent', target: 'load_context', animated: true },
    { id: 'e3', source: 'load_context', target: 'update_context', animated: true },
    { id: 'e4', source: 'update_context', target: 'agent_reasoning', animated: true },
    { id: 'e5', source: 'agent_reasoning', target: 'check_specialist_need', animated: true },

    // Conditional: Spawn specialists?
    { id: 'e6a', source: 'check_specialist_need', target: 'spawn_specialists', animated: true },
    { id: 'e6b', source: 'check_specialist_need', target: 'check_tools_need', animated: true },

    // After specialists
    { id: 'e7', source: 'spawn_specialists', target: 'check_tools_need', animated: true },

    // Conditional: Execute tools?
    { id: 'e8a', source: 'check_tools_need', target: 'tool_execution', animated: true },
    { id: 'e8b', source: 'check_tools_need', target: 'generate_response', animated: true },

    // After tools
    { id: 'e9', source: 'tool_execution', target: 'generate_response', animated: true },

    // Linear to end
    { id: 'e10', source: 'generate_response', target: 'update_memory', animated: true },
    { id: 'e11', source: 'update_memory', target: 'check_continuation', animated: true },
    { id: 'e12', source: 'check_continuation', target: 'end', animated: true }
  ],

  // Phase metadata for visual organization
  phases: {
    nodes: [
      {
        id: 'phase_initialization',
        type: 'phase_group',
        config: {
          label: 'Phase 1: Initialization',
          color: '#3b82f6',
          nodes: ['load_agent', 'load_context']
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
          label: 'Phase 3: Reasoning & Planning',
          color: '#ec4899',
          nodes: ['agent_reasoning', 'check_specialist_need']
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
        id: 'phase_generation',
        type: 'phase_group',
        config: {
          label: 'Phase 6: Response Generation',
          color: '#06b6d4',
          nodes: ['generate_response']
        }
      },
      {
        id: 'phase_persistence',
        type: 'phase_group',
        config: {
          label: 'Phase 7: Persistence',
          color: '#6366f1',
          nodes: ['update_memory', 'check_continuation']
        }
      }
    ],
    edges: []
  }
};
