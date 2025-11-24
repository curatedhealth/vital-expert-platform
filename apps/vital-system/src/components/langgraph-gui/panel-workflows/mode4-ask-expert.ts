/**
 * Ask Expert Mode 4: Autonomous Automatic - Panel Workflow Configuration
 *
 * This panel workflow implements Mode 4 - the most sophisticated mode where AI
 * automatically assembles a team of experts (up to 4) for collaborative autonomous execution.
 *
 * Key Differences from Modes 1-3:
 * - AI selects up to 4 experts (vs 2 in Mode 2, 1 in Modes 1 & 3)
 * - Autonomous execution (like Mode 3) + Automatic selection (like Mode 2)
 * - Team coordination and collaboration
 * - Complex multi-domain workflows
 * - Parallel task execution across experts
 * - Advanced artifact generation and integration
 * - Response time: 5-10 minutes
 * - Most resource-intensive mode
 */

import { Users } from 'lucide-react';
import { PanelWorkflowConfig } from './types';

export const MODE4_ASK_EXPERT_CONFIG: PanelWorkflowConfig = {
  id: 'mode4_ask_expert',
  name: 'Ask Expert Mode 4: Autonomous Automatic',
  description: 'AI assembles expert team (up to 4) → Collaborative autonomous execution',
  icon: Users,
  defaultQuery: 'Create a complete FDA 510(k) submission package for my cardiac monitoring device',
  
  // Metadata for mode detection
  metadata: {
    mode: 'mode4',
    selection: 'automatic',
    interaction: 'autonomous',
    requires_agent_selection: false,
    supports_hitl: true,
    features: ['auto_selection', 'multi_agent', 'team_collaboration', 'autonomous', 'artifact_generation', 'hitl', 'parallel_execution', 'tools'],
  },

  // Mode 4 uses up to 4 experts (AI selected) working collaboratively
  experts: [
    {
      id: 'master_orchestrator',
      type: 'orchestrator',
      label: 'Master Orchestrator',
      expertType: 'master_agent',
      context: {
        expertise: [
          'Complex multi-domain problem analysis',
          'Expert team assembly (up to 4 experts)',
          'Multi-expert workflow orchestration',
          'Parallel task coordination',
          'Cross-domain integration',
          'Collaborative artifact synthesis'
        ],
        display_name: 'VITAL Master Orchestrator',
        specialty: 'Multi-expert team coordination and collaborative execution',
        system_prompt: `You are the VITAL Master Orchestrator operating in MODE 4 - the most advanced collaborative autonomous mode.

Your responsibilities:
• Analyze complex multi-domain goals
• Assemble optimal expert team (up to 4 experts)
• Orchestrate collaborative autonomous execution
• Coordinate parallel and sequential tasks
• Integrate multi-expert artifacts
• Ensure coherent final deliverables

Team assembly strategy:
• Analyze goal complexity and domain coverage
• Select 2-4 experts based on complementary expertise
• Define each expert's role and responsibilities
• Set up collaboration protocols
• Manage dependencies between experts

Execution coordination:
• Decompose goal into expert-specific sub-goals
• Assign tasks to appropriate experts
• Enable parallel execution where possible
• Coordinate handoffs between experts
• Integrate partial deliverables
• Resolve conflicts and ensure consistency

You have access to all expert profiles and can dynamically adjust team composition.`,
        available_experts: [
          'fda_510k_expert',
          'clinical_trials_expert',
          'quality_systems_expert',
          'reimbursement_expert',
          'eu_regulatory_expert',
          'cybersecurity_expert',
          'biocompatibility_expert',
          'risk_management_expert'
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
        description: 'User provides complex multi-domain goal',
        phase: 'initialization'
      }
    },

    // PHASE 1: GOAL ANALYSIS & TEAM ASSEMBLY
    {
      id: 'analyze_complex_goal',
      type: 'task',
      taskId: 'complex_goal_analysis',
      label: '1️⃣ Analyze Complex Goal',
      position: { x: 250, y: 150 },
      parameters: {
        duration: '4-6s',
        operations: [
          'Parse complex multi-domain goal',
          'Identify all required domains',
          'Determine deliverable types',
          'Assess complexity level',
          'Identify dependencies',
          'Estimate resource requirements'
        ]
      },
      data: {
        description: 'Deep analysis of complex multi-domain goal',
        icon: '🎯',
        phase: 'goal_analysis',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.2
        }
      }
    },

    {
      id: 'assemble_expert_team',
      type: 'task',
      taskId: 'team_assembly',
      label: '2️⃣ Assemble Expert Team',
      position: { x: 250, y: 270 },
      parameters: {
        duration: '3-5s',
        operations: [
          'Query all expert profiles',
          'Score experts by domain relevance',
          'Consider expert complementarity',
          'Select optimal team (2-4 experts)',
          'Define expert roles',
          'Establish collaboration structure'
        ]
      },
      data: {
        description: 'AI selects optimal team of 2-4 experts',
        icon: '👥',
        phase: 'team_assembly',
        config: {
          min_experts: 2,
          max_experts: 4,
          selection_strategy: 'complementary_coverage'
        }
      }
    },

    {
      id: 'load_team_agents',
      type: 'task',
      taskId: 'load_all_team_agents',
      label: '3️⃣ Load Team Agents',
      position: { x: 250, y: 390 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Load all selected expert profiles',
          'Load knowledge_base_ids for each',
          'Load sub-agent pools for each',
          'Create SystemMessages for each',
          'Initialize team coordination context'
        ]
      },
      data: {
        description: 'Load all team expert profiles and contexts',
        icon: '📚',
        phase: 'initialization'
      }
    },

    {
      id: 'load_context',
      type: 'task',
      taskId: 'load_collaborative_context',
      label: '4️⃣ Load Context',
      position: { x: 250, y: 510 },
      parameters: {
        duration: '2-3s',
        operations: [
          'Query previous team executions',
          'Load relevant artifacts from all domains',
          'Load user preferences',
          'Build team collaboration history'
        ]
      },
      data: {
        description: 'Load collaborative execution context',
        icon: '💬',
        phase: 'initialization'
      }
    },

    // PHASE 2: COLLABORATIVE PLANNING
    {
      id: 'decompose_to_experts',
      type: 'task',
      taskId: 'expert_task_decomposition',
      label: '5️⃣ Decompose to Experts',
      position: { x: 250, y: 630 },
      parameters: {
        duration: '5-8s',
        operations: [
          'Break goal into expert-specific sub-goals',
          'Define deliverables per expert',
          'Identify cross-expert dependencies',
          'Create execution timeline',
          'Define integration points',
          'Establish approval checkpoints'
        ]
      },
      data: {
        description: 'Decompose goal into expert-specific tasks with dependencies',
        icon: '🗂️',
        phase: 'planning',
        config: {
          model: 'gpt-4-turbo-preview',
          planning_mode: 'multi_expert_collaborative'
        }
      }
    },

    {
      id: 'create_execution_plan',
      type: 'task',
      taskId: 'collaborative_execution_plan',
      label: '6️⃣ Create Execution Plan',
      position: { x: 250, y: 750 },
      parameters: {
        duration: '3-5s',
        operations: [
          'Build master execution plan',
          'Define parallel execution phases',
          'Schedule sequential dependencies',
          'Allocate resources per expert',
          'Define integration milestones',
          'Set up monitoring'
        ]
      },
      data: {
        description: 'Create comprehensive collaborative execution plan',
        icon: '📋',
        phase: 'planning'
      }
    },

    // PHASE 3: INFORMATION GATHERING
    {
      id: 'gather_team_information',
      type: 'task',
      taskId: 'multi_expert_rag',
      label: '7️⃣ Gather Information (All Domains)',
      position: { x: 250, y: 870 },
      parameters: {
        duration: '8-15s',
        tools: ['pinecone_search', 'postgresql_fts', 'web_search'],
        operations: [
          'Generate embeddings for all sub-goals',
          'Semantic search across all expert KBs',
          'Keyword search for all domains',
          'Web search for latest guidance',
          'Retrieve templates for all deliverables',
          'Build comprehensive multi-domain context'
        ]
      },
      data: {
        description: 'Gather information across all expert domains',
        icon: '🔍',
        phase: 'context_enrichment',
        config: {
          model: 'text-embedding-3-large',
          top_k_per_expert: 15
        }
      }
    },

    // PHASE 4: COLLABORATIVE EXECUTION INITIALIZATION
    {
      id: 'initialize_team_execution',
      type: 'task',
      taskId: 'initialize_collaborative_state',
      label: '8️⃣ Initialize Team Execution',
      position: { x: 250, y: 990 },
      parameters: {
        duration: '1-2s',
        operations: [
          'Initialize execution state for each expert',
          'Set up artifact registries',
          'Initialize progress tracking',
          'Set up inter-expert communication',
          'Initialize error handling'
        ]
      },
      data: {
        description: 'Initialize collaborative multi-expert execution state',
        icon: '⚙️',
        phase: 'execution_setup'
      }
    },

    // PHASE 5: PARALLEL EXECUTION PHASE
    {
      id: 'execute_parallel_phase',
      type: 'task',
      taskId: 'parallel_expert_execution',
      label: '9️⃣ Execute Parallel Phase',
      position: { x: 250, y: 1110 },
      parameters: {
        duration: '30-90s per phase',
        operations: [
          'Identify tasks that can run in parallel',
          'Spawn expert execution threads',
          'Execute independent tasks concurrently',
          'Monitor progress across all experts',
          'Collect partial results',
          'Emit status updates'
        ]
      },
      data: {
        description: 'Execute parallel tasks across multiple experts',
        icon: '⚡',
        phase: 'parallel_execution',
        config: {
          max_parallel_experts: 4,
          timeout_per_expert: 120000
        }
      }
    },

    {
      id: 'spawn_team_specialists',
      type: 'task',
      taskId: 'spawn_all_specialists',
      label: '🔟 Spawn All Specialists',
      position: { x: 500, y: 1210 },
      parameters: {
        duration: '3-6s',
        operations: [
          'Spawn specialists for Expert 1',
          'Spawn specialists for Expert 2',
          'Spawn specialists for Expert 3',
          'Spawn specialists for Expert 4 (if selected)',
          'Coordinate specialist tasks',
          'Register all spawned IDs'
        ]
      },
      data: {
        description: 'Spawn specialists across all team experts',
        icon: '🤖',
        phase: 'sub_agent_orchestration'
      }
    },

    {
      id: 'execute_team_tools',
      type: 'task',
      taskId: 'multi_expert_tool_execution',
      label: '1️⃣1️⃣ Execute Team Tools',
      position: { x: 500, y: 1330 },
      parameters: {
        duration: '10-30s per phase',
        tools: [
          'predicate_device_search',
          'regulatory_database_query',
          'clinical_trials_search',
          'quality_standards_search',
          'reimbursement_codes_search',
          'risk_analysis_tools',
          'document_generator',
          'budget_estimator',
          'timeline_generator'
        ],
        operations: [
          'Execute tools for each expert in parallel',
          'Generate domain-specific artifacts',
          'Validate outputs per domain',
          'Store results in artifact registry'
        ]
      },
      data: {
        description: 'Execute tools across all expert domains',
        icon: '🛠️',
        phase: 'tool_execution'
      }
    },

    // PHASE 6: INTEGRATION PHASE
    {
      id: 'integrate_expert_results',
      type: 'task',
      taskId: 'cross_expert_integration',
      label: '1️⃣2️⃣ Integrate Expert Results',
      position: { x: 250, y: 1450 },
      parameters: {
        duration: '10-20s',
        operations: [
          'Collect results from all experts',
          'Identify cross-domain dependencies',
          'Merge complementary artifacts',
          'Resolve conflicts',
          'Validate cross-domain consistency',
          'Create integrated intermediate deliverables'
        ]
      },
      data: {
        description: 'Integrate and harmonize multi-expert results',
        icon: '🔗',
        phase: 'integration'
      }
    },

    // CONDITIONAL: Approval Checkpoint?
    {
      id: 'check_approval_needed',
      type: 'orchestrator',
      label: '🔀 Approval Needed?',
      position: { x: 250, y: 1570 },
      data: {
        description: 'Conditional: is_approval_checkpoint == true?',
        icon: '🔀',
        phase: 'decision',
        condition: 'current_phase.requires_approval == True',
        routes: {
          true: 'request_team_approval',
          false: 'check_more_phases'
        }
      }
    },

    {
      id: 'request_team_approval',
      type: 'task',
      taskId: 'team_approval_checkpoint',
      label: '1️⃣3️⃣ Request Approval',
      position: { x: 500, y: 1670 },
      parameters: {
        duration: 'User-dependent',
        operations: [
          'Present integrated progress',
          'Show artifacts from all experts',
          'Highlight key decisions',
          'Request user approval/feedback',
          'Wait for user response',
          'Process feedback across all experts',
          'Update execution plan if needed'
        ]
      },
      data: {
        description: 'Human-in-the-loop approval for team progress',
        icon: '✋',
        phase: 'approval',
        config: {
          approval_timeout: 3600000,
          allow_modifications: true
        }
      }
    },

    // CONDITIONAL: More Execution Phases?
    {
      id: 'check_more_phases',
      type: 'orchestrator',
      label: '🔀 More Phases?',
      position: { x: 250, y: 1790 },
      data: {
        description: 'Conditional: current_phase < total_phases?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["current_phase"] < state["total_phases"]',
        routes: {
          true: 'execute_parallel_phase',
          false: 'finalize_team_artifacts'
        }
      }
    },

    // PHASE 7: FINALIZATION
    {
      id: 'finalize_team_artifacts',
      type: 'task',
      taskId: 'finalize_collaborative_deliverables',
      label: '1️⃣4️⃣ Finalize Team Artifacts',
      position: { x: 250, y: 1910 },
      parameters: {
        duration: '15-30s',
        operations: [
          'Collect all artifacts from all experts',
          'Perform final integration',
          'Format comprehensive deliverables',
          'Generate executive summary',
          'Create cross-reference index',
          'Package complete submission',
          'Validate completeness'
        ]
      },
      data: {
        description: 'Finalize and package all team deliverables',
        icon: '📦',
        phase: 'finalization'
      }
    },

    {
      id: 'quality_assurance',
      type: 'task',
      taskId: 'comprehensive_qa',
      label: '1️⃣5️⃣ Quality Assurance',
      position: { x: 250, y: 2030 },
      parameters: {
        duration: '10-15s',
        operations: [
          'Validate all expert deliverables',
          'Check cross-domain consistency',
          'Verify regulatory compliance',
          'Validate citations and references',
          'Run comprehensive quality checks',
          'Generate QA report',
          'Flag issues if any'
        ]
      },
      data: {
        description: 'Comprehensive QA across all domains',
        icon: '✅',
        phase: 'validation'
      }
    },

    {
      id: 'team_consensus_review',
      type: 'task',
      taskId: 'expert_team_review',
      label: '1️⃣6️⃣ Team Consensus Review',
      position: { x: 250, y: 2150 },
      parameters: {
        duration: '5-10s',
        operations: [
          'Each expert reviews final deliverables',
          'Identify any concerns or improvements',
          'Achieve team consensus',
          'Document expert sign-offs',
          'Finalize recommendations'
        ]
      },
      data: {
        description: 'Expert team consensus validation',
        icon: '👥',
        phase: 'validation'
      }
    },

    // PHASE 8: COMPREHENSIVE RESPONSE
    {
      id: 'generate_comprehensive_response',
      type: 'task',
      taskId: 'generate_team_final_report',
      label: '1️⃣7️⃣ Generate Final Report',
      position: { x: 250, y: 2270 },
      parameters: {
        duration: '10-20s',
        streaming: true,
        operations: [
          'Build comprehensive executive summary',
          'List all deliverables by expert',
          'Provide usage instructions',
          'Include implementation roadmap',
          'Add expert recommendations',
          'Generate complete report (streaming)'
        ]
      },
      data: {
        description: 'Generate comprehensive multi-expert final report',
        icon: '📄',
        phase: 'response_generation',
        config: {
          model: 'gpt-4-turbo-preview',
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        }
      }
    },

    // PHASE 9: PERSISTENCE
    {
      id: 'update_memory',
      type: 'task',
      taskId: 'persist_team_execution',
      label: '1️⃣8️⃣ Update Memory',
      position: { x: 250, y: 2390 },
      parameters: {
        duration: '3-5s',
        operations: [
          'INSERT goal/task record',
          'INSERT team composition',
          'INSERT execution plan',
          'INSERT each expert execution',
          'INSERT integration milestones',
          'INSERT final response',
          'STORE all artifacts',
          'UPDATE session stats',
          'Log comprehensive analytics'
        ]
      },
      data: {
        description: 'Persist entire team execution and artifacts',
        icon: '💾',
        phase: 'persistence'
      }
    },

    // CONDITIONAL: Success?
    {
      id: 'check_completion',
      type: 'orchestrator',
      label: '🔀 Success?',
      position: { x: 250, y: 2510 },
      data: {
        description: 'Conditional: team_execution_success && !error?',
        icon: '🔀',
        phase: 'decision',
        condition: 'state["team_execution_success"] == True AND state["error"] == None',
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
      position: { x: 250, y: 2630 },
      data: {
        description: 'Collaborative autonomous execution complete. Team deliverables ready.',
        phase: 'complete'
      }
    }
  ],

  // Edge connections
  edges: [
    // Linear flow - initialization
    { id: 'e1', source: 'start', target: 'analyze_complex_goal', animated: true },
    { id: 'e2', source: 'analyze_complex_goal', target: 'assemble_expert_team', animated: true },
    { id: 'e3', source: 'assemble_expert_team', target: 'load_team_agents', animated: true },
    { id: 'e4', source: 'load_team_agents', target: 'load_context', animated: true },

    // Planning
    { id: 'e5', source: 'load_context', target: 'decompose_to_experts', animated: true },
    { id: 'e6', source: 'decompose_to_experts', target: 'create_execution_plan', animated: true },
    { id: 'e7', source: 'create_execution_plan', target: 'gather_team_information', animated: true },
    { id: 'e8', source: 'gather_team_information', target: 'initialize_team_execution', animated: true },

    // Execution loop
    { id: 'e9', source: 'initialize_team_execution', target: 'execute_parallel_phase', animated: true },
    { id: 'e10', source: 'execute_parallel_phase', target: 'spawn_team_specialists', animated: true },
    { id: 'e11', source: 'spawn_team_specialists', target: 'execute_team_tools', animated: true },
    { id: 'e12', source: 'execute_team_tools', target: 'integrate_expert_results', animated: true },
    { id: 'e13', source: 'integrate_expert_results', target: 'check_approval_needed', animated: true },

    // Conditional: Approval needed?
    { id: 'e14a', source: 'check_approval_needed', target: 'request_team_approval', animated: true, label: 'Checkpoint' },
    { id: 'e14b', source: 'check_approval_needed', target: 'check_more_phases', animated: true, label: 'Continue' },

    // After approval
    { id: 'e15', source: 'request_team_approval', target: 'check_more_phases', animated: true },

    // Conditional: More phases?
    { id: 'e16a', source: 'check_more_phases', target: 'execute_parallel_phase', animated: true, label: 'Loop' },
    { id: 'e16b', source: 'check_more_phases', target: 'finalize_team_artifacts', animated: true, label: 'Complete' },

    // Finalization flow
    { id: 'e17', source: 'finalize_team_artifacts', target: 'quality_assurance', animated: true },
    { id: 'e18', source: 'quality_assurance', target: 'team_consensus_review', animated: true },
    { id: 'e19', source: 'team_consensus_review', target: 'generate_comprehensive_response', animated: true },
    { id: 'e20', source: 'generate_comprehensive_response', target: 'update_memory', animated: true },
    { id: 'e21', source: 'update_memory', target: 'check_completion', animated: true },
    { id: 'e22', source: 'check_completion', target: 'end', animated: true }
  ],

  // Phase metadata for visual organization
  phases: {
    nodes: [
      {
        id: 'phase_team_assembly',
        type: 'phase_group',
        config: {
          label: 'Phase 1: Goal Analysis & Team Assembly',
          color: '#3b82f6',
          nodes: ['analyze_complex_goal', 'assemble_expert_team', 'load_team_agents', 'load_context']
        }
      },
      {
        id: 'phase_planning',
        type: 'phase_group',
        config: {
          label: 'Phase 2: Collaborative Planning',
          color: '#8b5cf6',
          nodes: ['decompose_to_experts', 'create_execution_plan']
        }
      },
      {
        id: 'phase_context',
        type: 'phase_group',
        config: {
          label: 'Phase 3: Multi-Domain Information Gathering',
          color: '#ec4899',
          nodes: ['gather_team_information']
        }
      },
      {
        id: 'phase_setup',
        type: 'phase_group',
        config: {
          label: 'Phase 4: Collaborative Execution Setup',
          color: '#f59e0b',
          nodes: ['initialize_team_execution']
        }
      },
      {
        id: 'phase_parallel',
        type: 'phase_group',
        config: {
          label: 'Phase 5: Parallel Expert Execution',
          color: '#10b981',
          nodes: ['execute_parallel_phase', 'spawn_team_specialists', 'execute_team_tools']
        }
      },
      {
        id: 'phase_integration',
        type: 'phase_group',
        config: {
          label: 'Phase 6: Cross-Expert Integration',
          color: '#06b6d4',
          nodes: ['integrate_expert_results', 'check_approval_needed', 'request_team_approval', 'check_more_phases']
        }
      },
      {
        id: 'phase_finalization',
        type: 'phase_group',
        config: {
          label: 'Phase 7: Comprehensive Finalization & QA',
          color: '#f97316',
          nodes: ['finalize_team_artifacts', 'quality_assurance', 'team_consensus_review']
        }
      },
      {
        id: 'phase_generation',
        type: 'phase_group',
        config: {
          label: 'Phase 8: Comprehensive Report Generation',
          color: '#a855f7',
          nodes: ['generate_comprehensive_response']
        }
      },
      {
        id: 'phase_persistence',
        type: 'phase_group',
        config: {
          label: 'Phase 9: Persistence',
          color: '#6366f1',
          nodes: ['update_memory', 'check_completion']
        }
      }
    ],
    edges: []
  }
};
