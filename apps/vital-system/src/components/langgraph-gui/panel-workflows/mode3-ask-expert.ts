/**
 * Ask Expert Mode 3: Autonomous Manual - Panel Workflow Configuration
 *
 * This panel workflow implements Mode 3 where user selects a specific expert
 * who then executes an autonomous, goal-driven workflow with multi-step execution.
 *
 * Key Differences from Mode 1:
 * - User selects expert (like Mode 1) BUT provides a goal/task
 * - Autonomous execution instead of conversation
 * - Multi-step workflow execution
 * - Goal decomposition into sub-tasks
 * - Human approval checkpoints
 * - Artifact generation (documents, reports, protocols)
 * - Response time: 3-5 minutes
 */

import { Users } from 'lucide-react';
import { PanelWorkflowConfig } from './types';

export const MODE3_ASK_EXPERT_CONFIG: PanelWorkflowConfig = {
  id: 'mode3_ask_expert',
  name: 'Ask Expert Mode 3: Autonomous Manual',
  description: 'User selects expert → Autonomous multi-step execution with tool usage',
  icon: Users,
  defaultQuery: 'Create a Phase II study protocol for my cardiac monitoring device',
  
  // Metadata for mode detection
  metadata: {
    mode: 'mode3',
    selection: 'manual',
    interaction: 'autonomous',
    requires_agent_selection: true,
    supports_hitl: true,
    features: ['goal_driven', 'autonomous', 'multi_step', 'artifact_generation', 'hitl', 'tools'],
  },

  // Mode 3 uses one expert (user selected) for autonomous execution
  experts: [
    {
      id: 'clinical_trials_expert',
      type: 'expert',
      label: 'Clinical Trials Expert',
      expertType: 'clinical_trials_expert',
      context: {
        expertise: [
          'Clinical trial design and protocols',
          'Phase I/II/III/IV study planning',
          'IRB submission preparation',
          'Statistical analysis plans',
          'Patient recruitment strategies',
          'CRF (Case Report Form) design'
        ],
        display_name: 'Dr. Michael Chen',
        specialty: 'Clinical Trials Design & Execution',
        system_prompt: `You are Dr. Michael Chen, a clinical trials expert with 15+ years of experience designing and managing medical device clinical studies.

In Mode 3, you operate in AUTONOMOUS mode:
• You receive a goal/task from the user
• You decompose the goal into executable sub-tasks
• You execute each sub-task methodically
• You use tools to gather information and generate artifacts
• You create deliverables (protocols, plans, documents)
• You check in with the user at key milestones

Your autonomous workflow capabilities:
• Goal decomposition and planning
• Multi-step execution with state tracking
• Tool usage (research, database queries, document generation)
• Artifact creation (study protocols, statistical plans, budget estimates)
• Quality assurance and validation
• Human-in-the-loop approval checkpoints

When executing autonomously:
1. Analyze the goal and break it into steps
2. Execute each step with appropriate tools
3. Generate artifacts as deliverables
4. Request approval before major decisions
5. Iterate based on feedback
6. Deliver comprehensive final output`,
        knowledge_base_ids: [
          'clinical-trials-library',
          'fda-trial-guidance',
          'ich-gcp-guidelines',
          'statistical-methods',
          'protocol-templates'
        ],
        sub_agents: [
          'protocol_writer_specialist',
          'statistical_design_specialist',
          'irb_compliance_specialist',
          'recruitment_specialist'
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
        description: 'User selects expert and provides goal/task',
        phase: 'initialization'
      }
    },

    // PHASE 1: INITIALIZATION
    {
      id: 'load_agent',
      type: 'task',
      taskId: 'load_autonomous_agent',
      label: '1️⃣ Load Agent',
      position: { x: 250, y: 150 },
      parameters: {
        duration: '1-2s',
        operations: [
          'Query agents table',
          'Load agent profile',
          'Load knowledge_base_ids',
          'Load sub-agent pool',
          'Initialize autonomous execution context'
        ]
      },
      data: {
        description: 'Fetch expert profile for autonomous execution',
        icon: '👤',
        phase: 'initialization'
      }
    },

    {
      id: 'load_context',
      type: 'task',
      taskId: 'load_execution_context',
      label: '2️⃣ Load Context',
      position: { x: 250, y: 270 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Query previous autonomous tasks by this expert',
          'Load relevant artifacts',
          'Load user preferences',
          'Calculate context statistics'
        ]
      },
      data: {
        description: 'Load historical autonomous executions and artifacts',
        icon: '💬',
        phase: 'initialization'
      }
    },

    // PHASE 2: GOAL ANALYSIS & DECOMPOSITION
    {
      id: 'analyze_goal',
      type: 'task',
      taskId: 'goal_analysis',
      label: '3️⃣ Analyze Goal',
      position: { x: 250, y: 390 },
      parameters: {
        duration: '3-5s',
        operations: [
          'Parse goal statement',
          'Identify deliverables required',
          'Determine complexity level',
          'Identify domain requirements',
          'Assess feasibility'
        ]
      },
      data: {
        description: 'Analyze goal to understand requirements and deliverables',
        icon: '🎯',
        phase: 'goal_analysis',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.3
        }
      }
    },

    {
      id: 'decompose_goal',
      type: 'task',
      taskId: 'goal_decomposition',
      label: '4️⃣ Decompose into Steps',
      position: { x: 250, y: 510 },
      parameters: {
        duration: '4-6s',
        operations: [
          'Break goal into sub-tasks',
          'Define execution sequence',
          'Identify dependencies',
          'Estimate time per step',
          'Define approval checkpoints',
          'Create execution plan'
        ]
      },
      data: {
        description: 'Decompose goal into executable sub-tasks with plan',
        icon: '📋',
        phase: 'planning',
        config: {
          model: 'gpt-4-turbo-preview',
          max_steps: 10
        }
      }
    },

    // PHASE 3: CONTEXT ENRICHMENT
    {
      id: 'gather_information',
      type: 'task',
      taskId: 'rag_information_gathering',
      label: '5️⃣ Gather Information',
      position: { x: 250, y: 630 },
      parameters: {
        duration: '5-10s',
        tools: ['pinecone_search', 'postgresql_fts', 'web_search'],
        operations: [
          'Generate embedding for goal',
          'Semantic search across knowledge bases',
          'Keyword search for relevant standards',
          'Web search for latest guidance',
          'Retrieve protocol templates',
          'Build comprehensive context window'
        ]
      },
      data: {
        description: 'Gather all information needed for autonomous execution',
        icon: '🔍',
        phase: 'context_enrichment',
        config: {
          model: 'text-embedding-3-large',
          top_k: 20
        }
      }
    },

    // PHASE 4: EXECUTION LOOP INITIALIZATION
    {
      id: 'initialize_execution',
      type: 'task',
      taskId: 'initialize_execution_state',
      label: '6️⃣ Initialize Execution',
      position: { x: 250, y: 750 },
      parameters: {
        duration: '1-2s',
        operations: [
          'Set current_step = 0',
          'Initialize execution state',
          'Create artifact registry',
          'Set up progress tracking',
          'Initialize error handling'
        ]
      },
      data: {
        description: 'Initialize multi-step execution state',
        icon: '⚙️',
        phase: 'execution_setup'
      }
    },

    // PHASE 5: EXECUTION LOOP (Repeatable)
    {
      id: 'execute_current_step',
      type: 'task',
      taskId: 'execute_autonomous_step',
      label: '7️⃣ Execute Step [Loop]',
      position: { x: 250, y: 870 },
      parameters: {
        duration: '10-30s per step',
        operations: [
          'Load current step from plan',
          'Execute step with tools',
          'Generate partial artifacts',
          'Update execution state',
          'Log progress',
          'Emit status updates'
        ]
      },
      data: {
        description: 'Execute current step of autonomous workflow',
        icon: '⚡',
        phase: 'execution_loop',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.5,
          max_tokens: 3000
        }
      }
    },

    {
      id: 'spawn_specialists',
      type: 'task',
      taskId: 'spawn_step_specialists',
      label: '8️⃣ Spawn Specialists',
      position: { x: 500, y: 970 },
      parameters: {
        duration: '2-4s',
        operations: [
          'Determine specialists needed for current step',
          'Initialize Protocol Writer Specialist',
          'Initialize Statistical Design Specialist',
          'Initialize IRB Compliance Specialist',
          'Assign step-specific tasks',
          'Register spawned IDs'
        ]
      },
      data: {
        description: 'Spawn specialists for complex step execution',
        icon: '🤖',
        phase: 'sub_agent_orchestration'
      }
    },

    {
      id: 'tool_execution',
      type: 'task',
      taskId: 'execute_step_tools',
      label: '9️⃣ Execute Tools',
      position: { x: 500, y: 1090 },
      parameters: {
        duration: '5-15s per step',
        tools: [
          'clinical_trials_search',
          'protocol_template_generator',
          'statistical_calculator',
          'budget_estimator',
          'timeline_generator',
          'document_generator'
        ],
        operations: [
          'Execute tools needed for current step',
          'Generate intermediate artifacts',
          'Validate outputs',
          'Store results'
        ]
      },
      data: {
        description: 'Execute tools to complete current step',
        icon: '🛠️',
        phase: 'tool_execution'
      }
    },

    // CONDITIONAL: Check Approval Needed?
    {
      id: 'check_approval_needed',
      type: 'orchestrator',
      label: '🔀 Approval Needed?',
      position: { x: 250, y: 1210 },
      data: {
        description: 'Conditional: is_approval_checkpoint == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'current_step.requires_approval == True',
        routes: {
          true: 'request_approval',
          false: 'check_more_steps'
        }
      }
    },

    {
      id: 'request_approval',
      type: 'task',
      taskId: 'human_approval_checkpoint',
      label: '🔟 Request Approval',
      position: { x: 500, y: 1310 },
      parameters: {
        duration: 'User-dependent',
        operations: [
          'Present current progress',
          'Show generated artifacts',
          'Request user approval/feedback',
          'Wait for user response',
          'Process feedback',
          'Update execution plan if needed'
        ]
      },
      data: {
        description: 'Human-in-the-loop approval checkpoint',
        icon: '✋',
        phase: 'approval',
        config: {
          approval_timeout: 3600000, // 1 hour
          allow_modifications: true
        }
      }
    },

    // CONDITIONAL: More Steps?
    {
      id: 'check_more_steps',
      type: 'orchestrator',
      label: '🔀 More Steps?',
      position: { x: 250, y: 1430 },
      data: {
        description: 'Conditional: current_step < total_steps?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["current_step"] < state["total_steps"]',
        routes: {
          true: 'execute_current_step',
          false: 'finalize_artifacts'
        }
      }
    },

    // PHASE 6: FINALIZATION
    {
      id: 'finalize_artifacts',
      type: 'task',
      taskId: 'finalize_deliverables',
      label: '1️⃣1️⃣ Finalize Artifacts',
      position: { x: 250, y: 1550 },
      parameters: {
        duration: '10-20s',
        operations: [
          'Merge all partial artifacts',
          'Format final deliverables',
          'Generate executive summary',
          'Create artifact metadata',
          'Package deliverables',
          'Validate completeness'
        ]
      },
      data: {
        description: 'Compile and finalize all artifacts into deliverables',
        icon: '📦',
        phase: 'finalization'
      }
    },

    {
      id: 'quality_assurance',
      type: 'task',
      taskId: 'qa_validation',
      label: '1️⃣2️⃣ Quality Assurance',
      position: { x: 250, y: 1670 },
      parameters: {
        duration: '5-10s',
        operations: [
          'Validate artifact completeness',
          'Check regulatory compliance',
          'Verify citations and references',
          'Run quality checks',
          'Generate QA report',
          'Flag issues if any'
        ]
      },
      data: {
        description: 'Quality assurance and validation of deliverables',
        icon: '✅',
        phase: 'validation'
      }
    },

    // PHASE 7: RESPONSE GENERATION
    {
      id: 'generate_response',
      type: 'task',
      taskId: 'generate_final_report',
      label: '1️⃣3️⃣ Generate Final Report',
      position: { x: 250, y: 1790 },
      parameters: {
        duration: '5-10s',
        streaming: true,
        operations: [
          'Build executive summary',
          'List all deliverables',
          'Provide usage instructions',
          'Include next steps',
          'Add expert recommendations',
          'Generate report (streaming)'
        ]
      },
      data: {
        description: 'Generate comprehensive final report with artifacts',
        icon: '📄',
        phase: 'response_generation',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          max_tokens: 3000,
          stream: true
        }
      }
    },

    // PHASE 8: PERSISTENCE
    {
      id: 'update_memory',
      type: 'task',
      taskId: 'persist_autonomous_execution',
      label: '1️⃣4️⃣ Update Memory',
      position: { x: 250, y: 1910 },
      parameters: {
        duration: '2-3s',
        operations: [
          'INSERT goal/task record',
          'INSERT execution plan',
          'INSERT each step execution',
          'INSERT final response',
          'STORE all artifacts',
          'UPDATE session stats',
          'Log analytics event with execution metrics'
        ]
      },
      data: {
        description: 'Persist entire autonomous execution and artifacts',
        icon: '💾',
        phase: 'persistence'
      }
    },

    // CONDITIONAL DECISION: Success?
    {
      id: 'check_completion',
      type: 'orchestrator',
      label: '🔀 Success?',
      position: { x: 250, y: 2030 },
      data: {
        description: 'Conditional: execution_success && !error?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["execution_success"] == True AND state["error"] == None',
        routes: {
          success: 'end',
          error: 'end'
        }
      }
    },

    // END
    {
      id: 'end',
      type: 'output',
      label: '🏁 END',
      position: { x: 250, y: 2150 },
      data: {
        description: 'Autonomous execution complete. Artifacts delivered.',
        phase: 'complete'
      }
    }
  ],

  // Edge connections
  edges: [
    // Linear flow - initialization
    { id: 'e1', source: 'start', target: 'load_agent', animated: true },
    { id: 'e2', source: 'load_agent', target: 'load_context', animated: true },
    { id: 'e3', source: 'load_context', target: 'analyze_goal', animated: true },
    { id: 'e4', source: 'analyze_goal', target: 'decompose_goal', animated: true },
    { id: 'e5', source: 'decompose_goal', target: 'gather_information', animated: true },
    { id: 'e6', source: 'gather_information', target: 'initialize_execution', animated: true },

    // Execution loop
    { id: 'e7', source: 'initialize_execution', target: 'execute_current_step', animated: true },
    { id: 'e8', source: 'execute_current_step', target: 'spawn_specialists', animated: true },
    { id: 'e9', source: 'spawn_specialists', target: 'tool_execution', animated: true },
    { id: 'e10', source: 'tool_execution', target: 'check_approval_needed', animated: true },

    // Conditional: Approval needed?
    { id: 'e11a', source: 'check_approval_needed', target: 'request_approval', animated: true, label: 'Checkpoint' },
    { id: 'e11b', source: 'check_approval_needed', target: 'check_more_steps', animated: true, label: 'Continue' },

    // After approval
    { id: 'e12', source: 'request_approval', target: 'check_more_steps', animated: true },

    // Conditional: More steps?
    { id: 'e13a', source: 'check_more_steps', target: 'execute_current_step', animated: true, label: 'Loop' },
    { id: 'e13b', source: 'check_more_steps', target: 'finalize_artifacts', animated: true, label: 'Complete' },

    // Finalization flow
    { id: 'e14', source: 'finalize_artifacts', target: 'quality_assurance', animated: true },
    { id: 'e15', source: 'quality_assurance', target: 'generate_response', animated: true },
    { id: 'e16', source: 'generate_response', target: 'update_memory', animated: true },
    { id: 'e17', source: 'update_memory', target: 'check_completion', animated: true },
    { id: 'e18', source: 'check_completion', target: 'end', animated: true }
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
        id: 'phase_planning',
        type: 'phase_group',
        config: {
          label: 'Phase 2: Goal Analysis & Decomposition',
          color: '#8b5cf6',
          nodes: ['analyze_goal', 'decompose_goal']
        }
      },
      {
        id: 'phase_context',
        type: 'phase_group',
        config: {
          label: 'Phase 3: Information Gathering',
          color: '#ec4899',
          nodes: ['gather_information']
        }
      },
      {
        id: 'phase_setup',
        type: 'phase_group',
        config: {
          label: 'Phase 4: Execution Setup',
          color: '#f59e0b',
          nodes: ['initialize_execution']
        }
      },
      {
        id: 'phase_execution',
        type: 'phase_group',
        config: {
          label: 'Phase 5: Multi-Step Execution Loop',
          color: '#10b981',
          nodes: ['execute_current_step', 'spawn_specialists', 'tool_execution', 'check_approval_needed', 'request_approval', 'check_more_steps']
        }
      },
      {
        id: 'phase_finalization',
        type: 'phase_group',
        config: {
          label: 'Phase 6: Finalization & QA',
          color: '#06b6d4',
          nodes: ['finalize_artifacts', 'quality_assurance']
        }
      },
      {
        id: 'phase_generation',
        type: 'phase_group',
        config: {
          label: 'Phase 7: Final Report Generation',
          color: '#f97316',
          nodes: ['generate_response']
        }
      },
      {
        id: 'phase_persistence',
        type: 'phase_group',
        config: {
          label: 'Phase 8: Persistence',
          color: '#6366f1',
          nodes: ['update_memory', 'check_completion']
        }
      }
    ],
    edges: []
  }
};
