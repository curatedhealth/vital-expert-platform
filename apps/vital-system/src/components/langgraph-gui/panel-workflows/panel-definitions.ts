import { MessageSquare, Users, GitBranch, Sparkles, Layers, UserCheck } from 'lucide-react';
import { PanelWorkflowConfig } from './types';
import { MODE1_ASK_EXPERT_CONFIG } from './mode1-ask-expert';
import { MODE2_ASK_EXPERT_CONFIG } from './mode2-ask-expert';
import { MODE3_ASK_EXPERT_CONFIG } from './mode3-ask-expert';
import { MODE4_ASK_EXPERT_CONFIG } from './mode4-ask-expert';

/**
 * Structured Panel Configuration
 * Sequential, moderated discussion for formal decisions
 */
export const STRUCTURED_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'structured_panel',
  name: 'Structured Panel',
  description: 'Sequential, moderated discussion for formal decisions',
  icon: Users,
  defaultQuery: 'Should we pursue 510(k) or De Novo pathway for our continuous glucose monitoring device?',
  experts: [
    {
      id: 'expert-1',
      type: 'expert_agent',
      label: 'Expert Agent 1',
      expertType: 'regulatory_expert',
      context: {
        expertise: ['510k', 'denovo', 'medical_devices'],
      },
    },
    {
      id: 'expert-2',
      type: 'expert_agent',
      label: 'Expert Agent 2',
      expertType: 'clinical_expert',
      context: {
        expertise: ['clinical_trials', 'cgm_devices'],
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Panel Query',
      parameters: {
        default_value: 'Should we pursue 510(k) or De Novo pathway for our continuous glucose monitoring device?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'moderator-1',
      type: 'task',
      taskId: 'moderator',
      position: { x: 100, y: 150 },
    },
    {
      id: 'expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert Agent 1',
      expertConfig: {
        id: 'expert-1',
        type: 'expert_agent',
        label: 'Expert Agent 1',
        expertType: 'regulatory_expert',
        context: {
          expertise: ['510k', 'denovo', 'medical_devices'],
        },
      },
      position: { x: 300, y: 150 },
    },
    {
      id: 'expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert Agent 2',
      expertConfig: {
        id: 'expert-2',
        type: 'expert_agent',
        label: 'Expert Agent 2',
        expertType: 'clinical_expert',
        context: {
          expertise: ['clinical_trials', 'cgm_devices'],
        },
      },
      position: { x: 500, y: 150 },
    },
    {
      id: 'opening-statements-1',
      type: 'task',
      taskId: 'opening_statements',
      position: { x: 100, y: 300 },
    },
    {
      id: 'discussion-round-1',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Discussion Round 1',
      position: { x: 300, y: 300 },
    },
    {
      id: 'consensus-calculator-1',
      type: 'task',
      taskId: 'consensus_calculator',
      position: { x: 500, y: 300 },
    },
    {
      id: 'qna-1',
      type: 'task',
      taskId: 'qna',
      position: { x: 400, y: 400 },
    },
    {
      id: 'documentation-1',
      type: 'task',
      taskId: 'documentation_generator',
      position: { x: 300, y: 500 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Panel Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 300, y: 600 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'moderator-1' },
    { id: 'edge-2', source: 'input-1', target: 'expert-1' },
    { id: 'edge-3', source: 'input-1', target: 'expert-2' },
    { id: 'edge-4', source: 'moderator-1', target: 'opening-statements-1' },
    { id: 'edge-5', source: 'expert-1', target: 'opening-statements-1' },
    { id: 'edge-6', source: 'expert-2', target: 'opening-statements-1' },
    { id: 'edge-7', source: 'opening-statements-1', target: 'discussion-round-1' },
    { id: 'edge-8', source: 'expert-1', target: 'discussion-round-1' },
    { id: 'edge-9', source: 'expert-2', target: 'discussion-round-1' },
    { id: 'edge-10', source: 'discussion-round-1', target: 'consensus-calculator-1' },
    { id: 'edge-11', source: 'consensus-calculator-1', target: 'qna-1' },
    { id: 'edge-12', source: 'qna-1', target: 'documentation-1' },
    { id: 'edge-13', source: 'expert-1', target: 'qna-1' },
    { id: 'edge-14', source: 'expert-2', target: 'qna-1' },
    { id: 'edge-15', source: 'documentation-1', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'initialize', type: 'initialize', config: {} },
      { id: 'opening_statements', type: 'opening_statements', config: {} },
      { id: 'discussion_round_1', type: 'discussion_round', config: { round: 1 } },
      { id: 'consensus_assessment_1', type: 'consensus_assessment', config: { round: 1 } },
      { id: 'discussion_round_2', type: 'discussion_round', config: { round: 2 } },
      { id: 'consensus_assessment_2', type: 'consensus_assessment', config: { round: 2 } },
      { id: 'discussion_round_3', type: 'discussion_round', config: { round: 3 } },
      { id: 'qna', type: 'qna', config: { num_questions: 3 } },
      { id: 'consensus_building', type: 'consensus_building', config: {} },
      { id: 'documentation', type: 'documentation', config: {} },
    ],
    edges: [
      { source: 'initialize', target: 'opening_statements' },
      { source: 'opening_statements', target: 'discussion_round_1' },
      { source: 'discussion_round_1', target: 'consensus_assessment_1' },
      { source: 'consensus_assessment_1', target: 'discussion_round_2' },
      { source: 'discussion_round_2', target: 'consensus_assessment_2' },
      { source: 'consensus_assessment_2', target: 'discussion_round_3' },
      { source: 'discussion_round_3', target: 'qna' },
      { source: 'qna', target: 'consensus_building' },
      { source: 'consensus_building', target: 'documentation' },
      { source: 'documentation', target: 'END' },
    ],
  },
};

/**
 * Open Panel Configuration
 * Parallel collaborative exploration for innovation and brainstorming
 */
export const OPEN_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'open_panel',
  name: 'Open Panel',
  description: 'Parallel collaborative exploration for innovation and brainstorming',
  icon: Users,
  defaultQuery: 'What are innovative approaches to improve patient adherence in chronic disease management?',
  experts: [
    {
      id: 'expert-1',
      type: 'expert_agent',
      label: 'Expert Agent 1',
      expertType: 'digital_health_expert',
      context: {
        expertise: ['digital_health', 'patient_engagement', 'mobile_health'],
      },
    },
    {
      id: 'expert-2',
      type: 'expert_agent',
      label: 'Expert Agent 2',
      expertType: 'behavioral_expert',
      context: {
        expertise: ['behavioral_psychology', 'adherence', 'patient_motivation'],
      },
    },
    {
      id: 'expert-3',
      type: 'expert_agent',
      label: 'Expert Agent 3',
      expertType: 'technology_expert',
      context: {
        expertise: ['ai_ml', 'wearables', 'iot', 'health_tech'],
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Innovation Query',
      parameters: {
        default_value: 'What are innovative approaches to improve patient adherence in chronic disease management?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'moderator-1',
      type: 'task',
      taskId: 'moderator',
      position: { x: 100, y: 150 },
    },
    {
      id: 'expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert Agent 1',
      expertConfig: {
        id: 'expert-1',
        type: 'expert_agent',
        label: 'Expert Agent 1',
        expertType: 'digital_health_expert',
        context: {
          expertise: ['digital_health', 'patient_engagement', 'mobile_health'],
        },
      },
      position: { x: 300, y: 150 },
    },
    {
      id: 'expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert Agent 2',
      expertConfig: {
        id: 'expert-2',
        type: 'expert_agent',
        label: 'Expert Agent 2',
        expertType: 'behavioral_expert',
        context: {
          expertise: ['behavioral_psychology', 'adherence', 'patient_motivation'],
        },
      },
      position: { x: 500, y: 150 },
    },
    {
      id: 'expert-3',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert Agent 3',
      expertConfig: {
        id: 'expert-3',
        type: 'expert_agent',
        label: 'Expert Agent 3',
        expertType: 'technology_expert',
        context: {
          expertise: ['ai_ml', 'wearables', 'iot', 'health_tech'],
        },
      },
      position: { x: 700, y: 150 },
    },
    {
      id: 'documentation-1',
      type: 'task',
      taskId: 'documentation_generator',
      label: 'Synthesis Generator',
      position: { x: 400, y: 350 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Innovation Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 400, y: 450 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'moderator-1' },
    { id: 'edge-2', source: 'moderator-1', target: 'expert-1' },
    { id: 'edge-3', source: 'moderator-1', target: 'expert-2' },
    { id: 'edge-4', source: 'moderator-1', target: 'expert-3' },
    { id: 'edge-5', source: 'expert-1', target: 'documentation-1' },
    { id: 'edge-6', source: 'expert-2', target: 'documentation-1' },
    { id: 'edge-7', source: 'expert-3', target: 'documentation-1' },
    { id: 'edge-8', source: 'documentation-1', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'initialize', type: 'initialize', config: {} },
      { id: 'opening_round', type: 'opening_round', config: {} },
      { id: 'free_dialogue', type: 'free_dialogue', config: { num_turns: 3 } },
      { id: 'theme_clustering', type: 'theme_clustering', config: {} },
      { id: 'final_perspectives', type: 'final_perspectives', config: {} },
      { id: 'synthesis', type: 'synthesis', config: {} },
    ],
    edges: [
      { source: 'initialize', target: 'opening_round' },
      { source: 'opening_round', target: 'free_dialogue' },
      { source: 'free_dialogue', target: 'theme_clustering' },
      { source: 'theme_clustering', target: 'final_perspectives' },
      { source: 'final_perspectives', target: 'synthesis' },
      { source: 'synthesis', target: 'END' },
    ],
  },
};

/**
 * Socratic Panel Configuration
 * Iterative questioning methodology for deep analysis
 */
export const SOCRATIC_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'socratic_panel',
  name: 'Socratic Panel',
  description: 'Iterative questioning methodology for deep analysis',
  icon: MessageSquare,
  defaultQuery: 'Should we pursue pediatric indication expansion for our oncology drug?',
  experts: [
    {
      id: 'expert-1',
      type: 'expert_agent',
      label: 'Pediatric Oncology Expert',
      expertType: 'pediatric_oncology_expert',
      context: {
        expertise: ['pediatric_oncology', 'clinical_trials', 'drug_development'],
      },
    },
    {
      id: 'expert-2',
      type: 'expert_agent',
      label: 'Regulatory Strategist',
      expertType: 'regulatory_strategist',
      context: {
        expertise: ['fda_regulations', 'pediatric_requirements', 'indication_expansion'],
      },
    },
    {
      id: 'expert-3',
      type: 'expert_agent',
      label: 'Clinical Development Lead',
      expertType: 'clinical_development_lead',
      context: {
        expertise: ['clinical_development', 'trial_design', 'pediatric_trials'],
      },
    },
    {
      id: 'expert-4',
      type: 'expert_agent',
      label: 'Market Access Director',
      expertType: 'market_access_director',
      context: {
        expertise: ['market_access', 'payer_strategy', 'commercial_viability'],
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Socratic Query',
      parameters: {
        default_value: 'Should we pursue pediatric indication expansion for our oncology drug?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'moderator-1',
      type: 'task',
      taskId: 'moderator',
      label: 'Socratic Moderator',
      data: {
        systemPrompt: 'You are a Socratic moderator facilitating iterative questioning. Formulate deep questions that test assumptions, challenge reasoning, and uncover hidden risks.',
      },
      position: { x: 100, y: 150 },
    },
    {
      id: 'expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Pediatric Oncology Expert',
      expertConfig: {
        id: 'expert-1',
        type: 'expert_agent',
        label: 'Pediatric Oncology Expert',
        expertType: 'pediatric_oncology_expert',
        context: {
          expertise: ['pediatric_oncology', 'clinical_trials', 'drug_development'],
        },
      },
      position: { x: 300, y: 150 },
    },
    {
      id: 'expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Regulatory Strategist',
      expertConfig: {
        id: 'expert-2',
        type: 'expert_agent',
        label: 'Regulatory Strategist',
        expertType: 'regulatory_strategist',
        context: {
          expertise: ['fda_regulations', 'pediatric_requirements', 'indication_expansion'],
        },
      },
      position: { x: 500, y: 150 },
    },
    {
      id: 'expert-3',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Clinical Development Lead',
      expertConfig: {
        id: 'expert-3',
        type: 'expert_agent',
        label: 'Clinical Development Lead',
        expertType: 'clinical_development_lead',
        context: {
          expertise: ['clinical_development', 'trial_design', 'pediatric_trials'],
        },
      },
      position: { x: 700, y: 150 },
    },
    {
      id: 'expert-4',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Market Access Director',
      expertConfig: {
        id: 'expert-4',
        type: 'expert_agent',
        label: 'Market Access Director',
        expertType: 'market_access_director',
        context: {
          expertise: ['market_access', 'payer_strategy', 'commercial_viability'],
        },
      },
      position: { x: 900, y: 150 },
    },
    {
      id: 'formulate-question',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Formulate Question',
      data: {
        systemPrompt: 'Formulate the next Socratic question based on previous responses and identified assumptions.',
      },
      position: { x: 100, y: 300 },
    },
    {
      id: 'collect-responses',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Collect Responses',
      data: {
        systemPrompt: 'Collect sequential expert responses to the current question.',
      },
      position: { x: 300, y: 300 },
    },
    {
      id: 'analyze-responses',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Analyze Responses',
      data: {
        systemPrompt: 'Analyze expert responses for quality, depth, and agreement.',
      },
      position: { x: 500, y: 300 },
    },
    {
      id: 'test-assumptions',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Test Assumptions',
      data: {
        systemPrompt: 'Test and validate/invalidate assumptions from responses.',
      },
      position: { x: 700, y: 300 },
    },
    {
      id: 'check-convergence',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Check Convergence',
      data: {
        systemPrompt: 'Check if panel has converged on insights based on depth, agreement, and evidence completeness.',
      },
      position: { x: 400, y: 450 },
    },
    {
      id: 'extract-insights',
      type: 'task',
      taskId: 'documentation_generator',
      label: 'Extract Insights',
      data: {
        systemPrompt: 'Extract core insights, blind spots, and recommendations from the Socratic discussion.',
      },
      position: { x: 400, y: 550 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Socratic Analysis Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 400, y: 650 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'moderator-1' },
    { id: 'edge-2', source: 'input-1', target: 'expert-1' },
    { id: 'edge-3', source: 'input-1', target: 'expert-2' },
    { id: 'edge-4', source: 'input-1', target: 'expert-3' },
    { id: 'edge-5', source: 'input-1', target: 'expert-4' },
    { id: 'edge-6', source: 'moderator-1', target: 'formulate-question' },
    { id: 'edge-7', source: 'formulate-question', target: 'collect-responses' },
    { id: 'edge-8', source: 'expert-1', target: 'collect-responses' },
    { id: 'edge-9', source: 'expert-2', target: 'collect-responses' },
    { id: 'edge-10', source: 'expert-3', target: 'collect-responses' },
    { id: 'edge-11', source: 'expert-4', target: 'collect-responses' },
    { id: 'edge-12', source: 'collect-responses', target: 'analyze-responses' },
    { id: 'edge-13', source: 'analyze-responses', target: 'test-assumptions' },
    { id: 'edge-14', source: 'test-assumptions', target: 'check-convergence' },
    { id: 'edge-15', source: 'check-convergence', target: 'extract-insights' },
    { id: 'edge-16', source: 'extract-insights', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'initialize', type: 'initialize', config: {} },
      { id: 'formulate_question', type: 'formulate_question', config: {} },
      { id: 'collect_responses', type: 'collect_responses', config: {} },
      { id: 'analyze_responses', type: 'analyze_responses', config: {} },
      { id: 'test_assumptions', type: 'test_assumptions', config: {} },
      { id: 'check_convergence', type: 'check_convergence', config: {} },
      { id: 'extract_insights', type: 'extract_insights', config: {} },
      { id: 'generate_report', type: 'generate_report', config: {} },
    ],
    edges: [
      { source: 'initialize', target: 'formulate_question' },
      { source: 'formulate_question', target: 'collect_responses' },
      { source: 'collect_responses', target: 'analyze_responses' },
      { source: 'analyze_responses', target: 'test_assumptions' },
      { source: 'test_assumptions', target: 'check_convergence' },
      { source: 'check_convergence', target: 'extract_insights' },
      { source: 'extract_insights', target: 'generate_report' },
      { source: 'generate_report', target: 'END' },
    ],
  },
};

/**
 * Adversarial Panel Configuration
 * Structured debate format for risk assessment
 */
export const ADVERSARIAL_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'adversarial_panel',
  name: 'Adversarial Panel',
  description: 'Structured debate format for risk assessment',
  icon: GitBranch,
  defaultQuery: 'Should we pursue 510(k) or De Novo pathway for our AI-powered diagnostic device?',
  experts: [
    {
      id: 'pro-expert-1',
      type: 'expert_agent',
      label: 'Pro: Regulatory Expert',
      expertType: 'regulatory_expert',
      context: {
        expertise: ['fda_regulations', '510k', 'denovo', 'device_approval'],
        team: 'pro',
      },
    },
    {
      id: 'pro-expert-2',
      type: 'expert_agent',
      label: 'Pro: Clinical Affairs',
      expertType: 'clinical_affairs_specialist',
      context: {
        expertise: ['clinical_affairs', 'device_trials', 'evidence_generation'],
        team: 'pro',
      },
    },
    {
      id: 'con-expert-1',
      type: 'expert_agent',
      label: 'Con: Risk Management',
      expertType: 'risk_management_expert',
      context: {
        expertise: ['risk_assessment', 'regulatory_risks', 'compliance'],
        team: 'con',
      },
    },
    {
      id: 'con-expert-2',
      type: 'expert_agent',
      label: 'Con: Quality Assurance',
      expertType: 'quality_assurance_director',
      context: {
        expertise: ['quality_systems', 'regulatory_compliance', 'risk_mitigation'],
        team: 'con',
      },
    },
    {
      id: 'neutral-expert-1',
      type: 'expert_agent',
      label: 'Neutral Observer',
      expertType: 'senior_medical_device_consultant',
      context: {
        expertise: ['medical_devices', 'regulatory_strategy', 'strategic_planning'],
        team: 'neutral',
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Debate Query',
      parameters: {
        default_value: 'Should we pursue 510(k) or De Novo pathway for our AI-powered diagnostic device?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'pro-expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Pro: Regulatory Expert',
      expertConfig: {
        id: 'pro-expert-1',
        type: 'expert_agent',
        label: 'Pro: Regulatory Expert',
        expertType: 'regulatory_expert',
        context: {
          expertise: ['fda_regulations', '510k', 'denovo', 'device_approval'],
          team: 'pro',
        },
      },
      position: { x: 200, y: 150 },
    },
    {
      id: 'pro-expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Pro: Clinical Affairs',
      expertConfig: {
        id: 'pro-expert-2',
        type: 'expert_agent',
        label: 'Pro: Clinical Affairs',
        expertType: 'clinical_affairs_specialist',
        context: {
          expertise: ['clinical_affairs', 'device_trials', 'evidence_generation'],
          team: 'pro',
        },
      },
      position: { x: 400, y: 150 },
    },
    {
      id: 'con-expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Con: Risk Management',
      expertConfig: {
        id: 'con-expert-1',
        type: 'expert_agent',
        label: 'Con: Risk Management',
        expertType: 'risk_management_expert',
        context: {
          expertise: ['risk_assessment', 'regulatory_risks', 'compliance'],
          team: 'con',
        },
      },
      position: { x: 600, y: 150 },
    },
    {
      id: 'con-expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Con: Quality Assurance',
      expertConfig: {
        id: 'con-expert-2',
        type: 'expert_agent',
        label: 'Con: Quality Assurance',
        expertType: 'quality_assurance_director',
        context: {
          expertise: ['quality_systems', 'regulatory_compliance', 'risk_mitigation'],
          team: 'con',
        },
      },
      position: { x: 800, y: 150 },
    },
    {
      id: 'neutral-expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Neutral Observer',
      expertConfig: {
        id: 'neutral-expert-1',
        type: 'expert_agent',
        label: 'Neutral Observer',
        expertType: 'senior_medical_device_consultant',
        context: {
          expertise: ['medical_devices', 'regulatory_strategy', 'strategic_planning'],
          team: 'neutral',
        },
      },
      position: { x: 500, y: 150 },
    },
    {
      id: 'opening-arguments',
      type: 'task',
      taskId: 'opening_statements',
      label: 'Opening Arguments',
      data: {
        systemPrompt: 'Each team presents their opening arguments (pro and con positions).',
      },
      position: { x: 300, y: 300 },
    },
    {
      id: 'cross-examination',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Cross-Examination',
      data: {
        systemPrompt: 'Teams alternate asking critical questions to challenge opposing arguments.',
      },
      position: { x: 500, y: 300 },
    },
    {
      id: 'rebuttals',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Rebuttals',
      data: {
        systemPrompt: 'Each team provides rebuttals to counter opposing arguments.',
      },
      position: { x: 700, y: 300 },
    },
    {
      id: 'evidence-weighing',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Evidence Weighing',
      data: {
        systemPrompt: 'Score all arguments based on evidence quality, logic, relevance, and rebuttal effectiveness.',
      },
      position: { x: 400, y: 450 },
    },
    {
      id: 'risk-analysis',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Risk Analysis',
      data: {
        systemPrompt: 'Analyze risks and benefits to build decision matrix.',
      },
      position: { x: 600, y: 450 },
    },
    {
      id: 'synthesis',
      type: 'task',
      taskId: 'documentation_generator',
      label: 'Synthesis',
      data: {
        systemPrompt: 'Synthesize debate results into recommendation with confidence level.',
      },
      position: { x: 500, y: 550 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Debate Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 500, y: 650 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'pro-expert-1' },
    { id: 'edge-2', source: 'input-1', target: 'pro-expert-2' },
    { id: 'edge-3', source: 'input-1', target: 'con-expert-1' },
    { id: 'edge-4', source: 'input-1', target: 'con-expert-2' },
    { id: 'edge-5', source: 'input-1', target: 'neutral-expert-1' },
    { id: 'edge-6', source: 'pro-expert-1', target: 'opening-arguments' },
    { id: 'edge-7', source: 'pro-expert-2', target: 'opening-arguments' },
    { id: 'edge-8', source: 'con-expert-1', target: 'opening-arguments' },
    { id: 'edge-9', source: 'con-expert-2', target: 'opening-arguments' },
    { id: 'edge-10', source: 'opening-arguments', target: 'cross-examination' },
    { id: 'edge-11', source: 'pro-expert-1', target: 'cross-examination' },
    { id: 'edge-12', source: 'pro-expert-2', target: 'cross-examination' },
    { id: 'edge-13', source: 'con-expert-1', target: 'cross-examination' },
    { id: 'edge-14', source: 'con-expert-2', target: 'cross-examination' },
    { id: 'edge-15', source: 'cross-examination', target: 'rebuttals' },
    { id: 'edge-16', source: 'rebuttals', target: 'evidence-weighing' },
    { id: 'edge-17', source: 'evidence-weighing', target: 'risk-analysis' },
    { id: 'edge-18', source: 'risk-analysis', target: 'synthesis' },
    { id: 'edge-19', source: 'neutral-expert-1', target: 'synthesis' },
    { id: 'edge-20', source: 'synthesis', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'team_formation', type: 'team_formation', config: {} },
      { id: 'position_development', type: 'position_development', config: {} },
      { id: 'opening_arguments', type: 'opening_arguments', config: {} },
      { id: 'cross_examination', type: 'cross_examination', config: {} },
      { id: 'rebuttals', type: 'rebuttals', config: {} },
      { id: 'evidence_weighing', type: 'evidence_weighing', config: {} },
      { id: 'risk_analysis', type: 'risk_analysis', config: {} },
      { id: 'synthesis', type: 'synthesis', config: {} },
    ],
    edges: [
      { source: 'team_formation', target: 'position_development' },
      { source: 'position_development', target: 'opening_arguments' },
      { source: 'opening_arguments', target: 'cross_examination' },
      { source: 'cross_examination', target: 'rebuttals' },
      { source: 'rebuttals', target: 'evidence_weighing' },
      { source: 'evidence_weighing', target: 'risk_analysis' },
      { source: 'risk_analysis', target: 'synthesis' },
      { source: 'synthesis', target: 'END' },
    ],
  },
};

/**
 * Delphi Panel Configuration
 * Anonymous iterative rounds for consensus building
 */
export const DELPHI_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'delphi_panel',
  name: 'Delphi Panel',
  description: 'Anonymous iterative rounds for consensus building',
  icon: Layers,
  defaultQuery: 'What is the forecasted market size for digital therapeutics in 2026?',
  experts: [
    {
      id: 'expert-1',
      type: 'expert_agent',
      label: 'Expert 1 (Anonymous)',
      expertType: 'market_analyst',
      context: {
        expertise: ['market_analysis', 'forecasting', 'digital_health'],
        anonymous: true,
      },
    },
    {
      id: 'expert-2',
      type: 'expert_agent',
      label: 'Expert 2 (Anonymous)',
      expertType: 'healthcare_economist',
      context: {
        expertise: ['healthcare_economics', 'market_trends', 'reimbursement'],
        anonymous: true,
      },
    },
    {
      id: 'expert-3',
      type: 'expert_agent',
      label: 'Expert 3 (Anonymous)',
      expertType: 'digital_health_strategist',
      context: {
        expertise: ['digital_therapeutics', 'market_strategy', 'technology_trends'],
        anonymous: true,
      },
    },
    {
      id: 'expert-4',
      type: 'expert_agent',
      label: 'Expert 4 (Anonymous)',
      expertType: 'payer_relations_expert',
      context: {
        expertise: ['payer_strategy', 'reimbursement', 'market_access'],
        anonymous: true,
      },
    },
    {
      id: 'expert-5',
      type: 'expert_agent',
      label: 'Expert 5 (Anonymous)',
      expertType: 'clinical_outcomes_researcher',
      context: {
        expertise: ['outcomes_research', 'evidence_generation', 'value_assessment'],
        anonymous: true,
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Forecast Query',
      parameters: {
        default_value: 'What is the forecasted market size for digital therapeutics in 2026?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'moderator-1',
      type: 'task',
      taskId: 'moderator',
      label: 'Delphi Moderator',
      data: {
        systemPrompt: 'You are a Delphi panel moderator. Facilitate anonymous iterative rounds where experts refine their forecasts based on group feedback.',
      },
      position: { x: 100, y: 150 },
    },
    {
      id: 'expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert 1 (Anonymous)',
      expertConfig: {
        id: 'expert-1',
        type: 'expert_agent',
        label: 'Expert 1 (Anonymous)',
        expertType: 'market_analyst',
        context: {
          expertise: ['market_analysis', 'forecasting', 'digital_health'],
          anonymous: true,
        },
      },
      position: { x: 200, y: 250 },
    },
    {
      id: 'expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert 2 (Anonymous)',
      expertConfig: {
        id: 'expert-2',
        type: 'expert_agent',
        label: 'Expert 2 (Anonymous)',
        expertType: 'healthcare_economist',
        context: {
          expertise: ['healthcare_economics', 'market_trends', 'reimbursement'],
          anonymous: true,
        },
      },
      position: { x: 400, y: 250 },
    },
    {
      id: 'expert-3',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert 3 (Anonymous)',
      expertConfig: {
        id: 'expert-3',
        type: 'expert_agent',
        label: 'Expert 3 (Anonymous)',
        expertType: 'digital_health_strategist',
        context: {
          expertise: ['digital_therapeutics', 'market_strategy', 'technology_trends'],
          anonymous: true,
        },
      },
      position: { x: 600, y: 250 },
    },
    {
      id: 'expert-4',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert 4 (Anonymous)',
      expertConfig: {
        id: 'expert-4',
        type: 'expert_agent',
        label: 'Expert 4 (Anonymous)',
        expertType: 'payer_relations_expert',
        context: {
          expertise: ['payer_strategy', 'reimbursement', 'market_access'],
          anonymous: true,
        },
      },
      position: { x: 800, y: 250 },
    },
    {
      id: 'expert-5',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Expert 5 (Anonymous)',
      expertConfig: {
        id: 'expert-5',
        type: 'expert_agent',
        label: 'Expert 5 (Anonymous)',
        expertType: 'clinical_outcomes_researcher',
        context: {
          expertise: ['outcomes_research', 'evidence_generation', 'value_assessment'],
          anonymous: true,
        },
      },
      position: { x: 1000, y: 250 },
    },
    {
      id: 'round-1',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Round 1: Initial Forecasts',
      data: {
        systemPrompt: 'Collect initial anonymous forecasts from all experts.',
      },
      position: { x: 300, y: 400 },
    },
    {
      id: 'consensus-1',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Consensus Calculation 1',
      data: {
        systemPrompt: 'Calculate consensus and provide anonymized feedback to experts.',
      },
      position: { x: 500, y: 400 },
    },
    {
      id: 'round-2',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Round 2: Refined Forecasts',
      data: {
        systemPrompt: 'Collect refined forecasts after experts review group feedback.',
      },
      position: { x: 700, y: 400 },
    },
    {
      id: 'consensus-2',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Consensus Calculation 2',
      data: {
        systemPrompt: 'Calculate updated consensus and provide feedback.',
      },
      position: { x: 400, y: 550 },
    },
    {
      id: 'round-3',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Round 3: Final Forecasts',
      data: {
        systemPrompt: 'Collect final forecasts from experts.',
      },
      position: { x: 600, y: 550 },
    },
    {
      id: 'final-consensus',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Final Consensus',
      data: {
        systemPrompt: 'Calculate final consensus forecast with confidence intervals.',
      },
      position: { x: 500, y: 650 },
    },
    {
      id: 'synthesis',
      type: 'task',
      taskId: 'documentation_generator',
      label: 'Synthesis',
      data: {
        systemPrompt: 'Generate comprehensive forecast report with consensus, range, and expert rationale.',
      },
      position: { x: 500, y: 750 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Delphi Forecast Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 500, y: 850 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'moderator-1' },
    { id: 'edge-2', source: 'input-1', target: 'expert-1' },
    { id: 'edge-3', source: 'input-1', target: 'expert-2' },
    { id: 'edge-4', source: 'input-1', target: 'expert-3' },
    { id: 'edge-5', source: 'input-1', target: 'expert-4' },
    { id: 'edge-6', source: 'input-1', target: 'expert-5' },
    { id: 'edge-7', source: 'moderator-1', target: 'round-1' },
    { id: 'edge-8', source: 'expert-1', target: 'round-1' },
    { id: 'edge-9', source: 'expert-2', target: 'round-1' },
    { id: 'edge-10', source: 'expert-3', target: 'round-1' },
    { id: 'edge-11', source: 'expert-4', target: 'round-1' },
    { id: 'edge-12', source: 'expert-5', target: 'round-1' },
    { id: 'edge-13', source: 'round-1', target: 'consensus-1' },
    { id: 'edge-14', source: 'consensus-1', target: 'round-2' },
    { id: 'edge-15', source: 'expert-1', target: 'round-2' },
    { id: 'edge-16', source: 'expert-2', target: 'round-2' },
    { id: 'edge-17', source: 'expert-3', target: 'round-2' },
    { id: 'edge-18', source: 'expert-4', target: 'round-2' },
    { id: 'edge-19', source: 'expert-5', target: 'round-2' },
    { id: 'edge-20', source: 'round-2', target: 'consensus-2' },
    { id: 'edge-21', source: 'consensus-2', target: 'round-3' },
    { id: 'edge-22', source: 'expert-1', target: 'round-3' },
    { id: 'edge-23', source: 'expert-2', target: 'round-3' },
    { id: 'edge-24', source: 'expert-3', target: 'round-3' },
    { id: 'edge-25', source: 'expert-4', target: 'round-3' },
    { id: 'edge-26', source: 'expert-5', target: 'round-3' },
    { id: 'edge-27', source: 'round-3', target: 'final-consensus' },
    { id: 'edge-28', source: 'final-consensus', target: 'synthesis' },
    { id: 'edge-29', source: 'synthesis', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'initialize', type: 'initialize', config: {} },
      { id: 'round_1', type: 'round_1', config: {} },
      { id: 'consensus_1', type: 'consensus_1', config: {} },
      { id: 'round_2', type: 'round_2', config: {} },
      { id: 'consensus_2', type: 'consensus_2', config: {} },
      { id: 'round_3', type: 'round_3', config: {} },
      { id: 'final_consensus', type: 'final_consensus', config: {} },
      { id: 'synthesis', type: 'synthesis', config: {} },
    ],
    edges: [
      { source: 'initialize', target: 'round_1' },
      { source: 'round_1', target: 'consensus_1' },
      { source: 'consensus_1', target: 'round_2' },
      { source: 'round_2', target: 'consensus_2' },
      { source: 'consensus_2', target: 'round_3' },
      { source: 'round_3', target: 'final_consensus' },
      { source: 'final_consensus', target: 'synthesis' },
      { source: 'synthesis', target: 'END' },
    ],
  },
};

/**
 * Hybrid Human-AI Panel Configuration
 * Combined human + AI experts for critical decisions
 */
export const HYBRID_PANEL_CONFIG: PanelWorkflowConfig = {
  id: 'hybrid_panel',
  name: 'Hybrid Human-AI Panel',
  description: 'Combined human + AI experts for critical decisions',
  icon: UserCheck,
  defaultQuery: 'Should we partner our lead asset or continue full internal development?',
  experts: [
    {
      id: 'human-expert-1',
      type: 'expert_agent',
      label: 'Human: Business Development',
      expertType: 'business_development_lead',
      context: {
        expertise: ['partnerships', 'licensing', 'business_strategy'],
        participant_type: 'human',
      },
    },
    {
      id: 'human-expert-2',
      type: 'expert_agent',
      label: 'Human: Portfolio Strategy',
      expertType: 'portfolio_strategy_director',
      context: {
        expertise: ['portfolio_management', 'strategic_planning', 'resource_allocation'],
        participant_type: 'human',
      },
    },
    {
      id: 'ai-expert-1',
      type: 'expert_agent',
      label: 'AI: Financial Analyst',
      expertType: 'financial_analyst',
      context: {
        expertise: ['financial_modeling', 'npv_analysis', 'risk_assessment'],
        participant_type: 'ai',
      },
    },
    {
      id: 'ai-expert-2',
      type: 'expert_agent',
      label: 'AI: Clinical/Medical Affairs',
      expertType: 'clinical_medical_affairs_lead',
      context: {
        expertise: ['clinical_development', 'medical_affairs', 'regulatory_strategy'],
        participant_type: 'ai',
      },
    },
  ],
  nodes: [
    {
      id: 'input-1',
      type: 'input',
      label: 'Decision Query',
      parameters: {
        default_value: 'Should we partner our lead asset or continue full internal development?',
      },
      position: { x: 100, y: 50 },
    },
    {
      id: 'human-expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Human: Business Development',
      expertConfig: {
        id: 'human-expert-1',
        type: 'expert_agent',
        label: 'Human: Business Development',
        expertType: 'business_development_lead',
        context: {
          expertise: ['partnerships', 'licensing', 'business_strategy'],
          participant_type: 'human',
        },
      },
      position: { x: 200, y: 150 },
    },
    {
      id: 'human-expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'Human: Portfolio Strategy',
      expertConfig: {
        id: 'human-expert-2',
        type: 'expert_agent',
        label: 'Human: Portfolio Strategy',
        expertType: 'portfolio_strategy_director',
        context: {
          expertise: ['portfolio_management', 'strategic_planning', 'resource_allocation'],
          participant_type: 'human',
        },
      },
      position: { x: 400, y: 150 },
    },
    {
      id: 'ai-expert-1',
      type: 'task',
      taskId: 'expert_agent',
      label: 'AI: Financial Analyst',
      expertConfig: {
        id: 'ai-expert-1',
        type: 'expert_agent',
        label: 'AI: Financial Analyst',
        expertType: 'financial_analyst',
        context: {
          expertise: ['financial_modeling', 'npv_analysis', 'risk_assessment'],
          participant_type: 'ai',
        },
      },
      position: { x: 600, y: 150 },
    },
    {
      id: 'ai-expert-2',
      type: 'task',
      taskId: 'expert_agent',
      label: 'AI: Clinical/Medical Affairs',
      expertConfig: {
        id: 'ai-expert-2',
        type: 'expert_agent',
        label: 'AI: Clinical/Medical Affairs',
        expertType: 'clinical_medical_affairs_lead',
        context: {
          expertise: ['clinical_development', 'medical_affairs', 'regulatory_strategy'],
          participant_type: 'ai',
        },
      },
      position: { x: 800, y: 150 },
    },
    {
      id: 'human-phase',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Human Phase',
      data: {
        systemPrompt: 'Human experts provide initial analysis and strategic perspective.',
      },
      position: { x: 300, y: 300 },
    },
    {
      id: 'ai-phase',
      type: 'task',
      taskId: 'discussion_round',
      label: 'AI Phase',
      data: {
        systemPrompt: 'AI experts provide data-driven analysis and quantitative assessment.',
      },
      position: { x: 500, y: 300 },
    },
    {
      id: 'synthesis',
      type: 'task',
      taskId: 'consensus_calculator',
      label: 'Synthesis',
      data: {
        systemPrompt: 'Synthesize human strategic insights with AI quantitative analysis.',
      },
      position: { x: 400, y: 450 },
    },
    {
      id: 'human-review',
      type: 'task',
      taskId: 'discussion_round',
      label: 'Human Review',
      data: {
        systemPrompt: 'Human experts review and validate the synthesized analysis.',
      },
      position: { x: 400, y: 550 },
    },
    {
      id: 'output-1',
      type: 'output',
      label: 'Hybrid Decision Report',
      parameters: {
        format: 'markdown',
      },
      position: { x: 400, y: 650 },
    },
  ],
  edges: [
    { id: 'edge-1', source: 'input-1', target: 'human-expert-1' },
    { id: 'edge-2', source: 'input-1', target: 'human-expert-2' },
    { id: 'edge-3', source: 'input-1', target: 'ai-expert-1' },
    { id: 'edge-4', source: 'input-1', target: 'ai-expert-2' },
    { id: 'edge-5', source: 'human-expert-1', target: 'human-phase' },
    { id: 'edge-6', source: 'human-expert-2', target: 'human-phase' },
    { id: 'edge-7', source: 'human-phase', target: 'ai-phase' },
    { id: 'edge-8', source: 'ai-expert-1', target: 'ai-phase' },
    { id: 'edge-9', source: 'ai-expert-2', target: 'ai-phase' },
    { id: 'edge-10', source: 'ai-phase', target: 'synthesis' },
    { id: 'edge-11', source: 'synthesis', target: 'human-review' },
    { id: 'edge-12', source: 'human-expert-1', target: 'human-review' },
    { id: 'edge-13', source: 'human-expert-2', target: 'human-review' },
    { id: 'edge-14', source: 'human-review', target: 'output-1' },
  ],
  phases: {
    nodes: [
      { id: 'initialize', type: 'initialize', config: {} },
      { id: 'human_phase', type: 'human_phase', config: {} },
      { id: 'ai_phase', type: 'ai_phase', config: {} },
      { id: 'synthesis', type: 'synthesis', config: {} },
      { id: 'human_review', type: 'human_review', config: {} },
    ],
    edges: [
      { source: 'initialize', target: 'human_phase' },
      { source: 'human_phase', target: 'ai_phase' },
      { source: 'ai_phase', target: 'synthesis' },
      { source: 'synthesis', target: 'human_review' },
      { source: 'human_review', target: 'END' },
    ],
  },
};

/**
 * Map of all panel configurations by ID
 */
export const PANEL_CONFIGS: Record<string, PanelWorkflowConfig> = {
  structured_panel: STRUCTURED_PANEL_CONFIG,
  open_panel: OPEN_PANEL_CONFIG,
  socratic_panel: SOCRATIC_PANEL_CONFIG,
  adversarial_panel: ADVERSARIAL_PANEL_CONFIG,
  delphi_panel: DELPHI_PANEL_CONFIG,
  hybrid_panel: HYBRID_PANEL_CONFIG,
  mode1_ask_expert: MODE1_ASK_EXPERT_CONFIG,
  mode2_ask_expert: MODE2_ASK_EXPERT_CONFIG,
  mode3_ask_expert: MODE3_ASK_EXPERT_CONFIG,
  mode4_ask_expert: MODE4_ASK_EXPERT_CONFIG,
};

