/**
 * Service Template Definitions
 * Pre-configured service templates following Ask Expert design patterns
 */

import {
  MessageSquare,
  FileText,
  TrendingUp,
  Shield,
  Lightbulb,
  GitBranch,
  Users,
  CheckCircle2,
  Search,
  Brain,
  Target,
  Sparkles,
} from 'lucide-react';
import { ServiceTemplateConfig } from '@/types/service-templates';

/**
 * Strategic Advisory Templates
 */
export const REGULATORY_ADVISORY_TEMPLATE: ServiceTemplateConfig = {
  id: 'regulatory_advisory',
  name: 'Regulatory Advisory',
  description: 'Get instant regulatory guidance from specialized FDA, EMA, and global regulatory experts',
  category: 'advisory',
  tier: 'expert',
  icon: Shield,
  visual: {
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-500',
  },
  capabilities: [
    'FDA 510(k) & De Novo pathway analysis',
    'CE Mark and IVDR compliance guidance',
    'Global regulatory strategy',
    'Submission documentation review',
    'Regulatory risk assessment',
  ],
  useCases: [
    {
      title: 'Pathway Selection',
      description: 'Determine optimal regulatory pathway for your device or drug',
      icon: '🛤️',
    },
    {
      title: 'Submission Preparation',
      description: 'Get guidance on preparing regulatory submissions',
      icon: '📋',
    },
    {
      title: 'Compliance Review',
      description: 'Review documentation for regulatory compliance',
      icon: '✅',
    },
  ],
  timeToValue: 'Instant',
  complexity: 'medium',
  config: {
    requiredAgents: ['regulatory_expert', 'compliance_specialist'],
    workflowType: 'ask_expert',
    defaultParams: {
      mode: 'automatic',
      autonomous: false,
    },
  },
  route: '/ask-expert?preset=regulatory',
};

export const MARKET_ACCESS_ADVISORY_TEMPLATE: ServiceTemplateConfig = {
  id: 'market_access_advisory',
  name: 'Market Access Advisory',
  description: 'Navigate payer strategies, reimbursement, and pricing with market access experts',
  category: 'advisory',
  tier: 'expert',
  icon: TrendingUp,
  visual: {
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'High Value',
    badgeColor: 'bg-emerald-500',
  },
  capabilities: [
    'Payer coverage strategy',
    'Reimbursement pathway analysis',
    'Value proposition development',
    'Health economics modeling',
    'Market access planning',
  ],
  useCases: [
    {
      title: 'Coverage Strategy',
      description: 'Develop optimal payer coverage strategies',
      icon: '💰',
    },
    {
      title: 'Value Messaging',
      description: 'Craft compelling value propositions for payers',
      icon: '📊',
    },
    {
      title: 'Pricing Strategy',
      description: 'Optimize pricing and reimbursement approach',
      icon: '💵',
    },
  ],
  timeToValue: 'Instant',
  complexity: 'high',
  config: {
    requiredAgents: ['market_access_expert', 'health_economist'],
    workflowType: 'ask_expert',
    defaultParams: {
      mode: 'automatic',
      autonomous: false,
    },
  },
  route: '/ask-expert?preset=market_access',
};

export const CLINICAL_DEVELOPMENT_ADVISORY_TEMPLATE: ServiceTemplateConfig = {
  id: 'clinical_development_advisory',
  name: 'Clinical Development Advisory',
  description: 'Expert guidance on clinical trial design, endpoints, and development strategy',
  category: 'advisory',
  tier: 'expert',
  icon: FileText,
  visual: {
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    badge: 'Clinical',
    badgeColor: 'bg-purple-500',
  },
  capabilities: [
    'Protocol design and optimization',
    'Endpoint selection',
    'Study design consultation',
    'Patient recruitment strategies',
    'Data analysis planning',
  ],
  useCases: [
    {
      title: 'Protocol Review',
      description: 'Get expert feedback on trial protocols',
      icon: '🔬',
    },
    {
      title: 'Endpoint Selection',
      description: 'Select optimal clinical endpoints',
      icon: '🎯',
    },
    {
      title: 'Study Design',
      description: 'Design rigorous clinical studies',
      icon: '📐',
    },
  ],
  timeToValue: 'Instant',
  complexity: 'high',
  config: {
    requiredAgents: ['clinical_expert', 'biostatistician'],
    workflowType: 'ask_expert',
    defaultParams: {
      mode: 'automatic',
      autonomous: false,
    },
  },
  route: '/ask-expert?preset=clinical',
};

/**
 * Analysis & Research Templates
 */
export const COMPETITIVE_INTELLIGENCE_TEMPLATE: ServiceTemplateConfig = {
  id: 'competitive_intelligence',
  name: 'Competitive Intelligence',
  description: 'Continuous monitoring and analysis of competitive landscape',
  category: 'research',
  tier: 'advanced',
  icon: Search,
  visual: {
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
    badge: 'Automated',
    badgeColor: 'bg-orange-500',
  },
  capabilities: [
    'Competitor tracking',
    'Market dynamics analysis',
    'Patent landscape monitoring',
    'Clinical trial tracking',
    'Strategic insights',
  ],
  useCases: [
    {
      title: 'Competitor Analysis',
      description: 'Track competitor moves and strategies',
      icon: '👁️',
    },
    {
      title: 'Market Trends',
      description: 'Identify emerging market trends',
      icon: '📈',
    },
    {
      title: 'Opportunity Identification',
      description: 'Find market gaps and opportunities',
      icon: '💡',
    },
  ],
  timeToValue: '1 hour',
  complexity: 'medium',
  config: {
    requiredAgents: ['market_analyst', 'competitive_intelligence_expert'],
    workflowType: 'autonomous_research',
    defaultParams: {
      mode: 'automatic',
      autonomous: true,
    },
  },
  route: '/ask-expert?preset=competitive_intel',
};

export const LITERATURE_SYNTHESIS_TEMPLATE: ServiceTemplateConfig = {
  id: 'literature_synthesis',
  name: 'Literature Synthesis',
  description: 'Automated synthesis of scientific literature and evidence',
  category: 'research',
  tier: 'advanced',
  icon: Brain,
  visual: {
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    badge: 'Research',
    badgeColor: 'bg-cyan-500',
  },
  capabilities: [
    'Evidence synthesis',
    'Literature review automation',
    'Meta-analysis support',
    'Citation network analysis',
    'Knowledge extraction',
  ],
  useCases: [
    {
      title: 'Systematic Review',
      description: 'Generate comprehensive literature reviews',
      icon: '📚',
    },
    {
      title: 'Evidence Synthesis',
      description: 'Synthesize evidence across studies',
      icon: '🔗',
    },
    {
      title: 'Knowledge Extraction',
      description: 'Extract key insights from papers',
      icon: '💎',
    },
  ],
  timeToValue: '30 minutes',
  complexity: 'medium',
  config: {
    requiredAgents: ['research_analyst', 'clinical_evidence_expert'],
    workflowType: 'autonomous_research',
    defaultParams: {
      mode: 'automatic',
      autonomous: true,
    },
  },
  route: '/ask-expert?preset=literature',
};

/**
 * Workflow & Process Templates
 */
export const EXPERT_PANEL_TEMPLATE: ServiceTemplateConfig = {
  id: 'expert_panel',
  name: 'Expert Panel Discussion',
  description: 'Multi-expert collaborative analysis for complex decisions',
  category: 'workflow',
  tier: 'expert',
  icon: Users,
  visual: {
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    badge: 'Collaborative',
    badgeColor: 'bg-indigo-500',
  },
  capabilities: [
    'Multi-stakeholder analysis',
    'Structured debate',
    'Consensus building',
    'Risk assessment',
    'Decision documentation',
  ],
  useCases: [
    {
      title: 'Strategic Decisions',
      description: 'Make informed strategic decisions',
      icon: '🎯',
    },
    {
      title: 'Risk Assessment',
      description: 'Comprehensive risk evaluation',
      icon: '⚠️',
    },
    {
      title: 'Pathway Selection',
      description: 'Choose optimal development paths',
      icon: '🛤️',
    },
  ],
  timeToValue: '15 minutes',
  complexity: 'high',
  config: {
    workflowType: 'structured_panel',
    defaultParams: {
      numExperts: 3,
      discussionRounds: 3,
    },
  },
  route: '/ask-panel-v1?workflow=structured_panel',
};

export const SOCRATIC_ANALYSIS_TEMPLATE: ServiceTemplateConfig = {
  id: 'socratic_analysis',
  name: 'Socratic Deep Analysis',
  description: 'Iterative questioning methodology for uncovering hidden insights',
  category: 'analysis',
  tier: 'expert',
  icon: MessageSquare,
  visual: {
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'Deep Dive',
    badgeColor: 'bg-violet-500',
  },
  capabilities: [
    'Deep questioning',
    'Assumption testing',
    'Hidden risk identification',
    'Logical analysis',
    'Insight extraction',
  ],
  useCases: [
    {
      title: 'Challenge Assumptions',
      description: 'Test and validate critical assumptions',
      icon: '🤔',
    },
    {
      title: 'Find Blind Spots',
      description: 'Uncover hidden risks and opportunities',
      icon: '🔍',
    },
    {
      title: 'Deep Understanding',
      description: 'Develop deep domain insights',
      icon: '🧠',
    },
  ],
  timeToValue: '20 minutes',
  complexity: 'high',
  config: {
    workflowType: 'socratic_panel',
    defaultParams: {
      numQuestions: 5,
      iterationDepth: 3,
    },
  },
  route: '/ask-panel-v1?workflow=socratic_panel',
};

export const ADVERSARIAL_REVIEW_TEMPLATE: ServiceTemplateConfig = {
  id: 'adversarial_review',
  name: 'Adversarial Review',
  description: 'Structured debate format for rigorous risk assessment',
  category: 'analysis',
  tier: 'expert',
  icon: GitBranch,
  visual: {
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    badge: 'Critical',
    badgeColor: 'bg-rose-500',
  },
  capabilities: [
    'Pro/con analysis',
    'Risk identification',
    'Argument evaluation',
    'Evidence weighing',
    'Balanced decision-making',
  ],
  useCases: [
    {
      title: 'Risk Assessment',
      description: 'Identify and evaluate all risks',
      icon: '⚖️',
    },
    {
      title: 'Decision Validation',
      description: 'Validate critical decisions',
      icon: '✓',
    },
    {
      title: 'Strategy Testing',
      description: 'Test strategies under scrutiny',
      icon: '🛡️',
    },
  ],
  timeToValue: '25 minutes',
  complexity: 'high',
  config: {
    workflowType: 'adversarial_panel',
    defaultParams: {
      numProExperts: 2,
      numConExperts: 2,
    },
  },
  route: '/ask-panel-v1?workflow=adversarial_panel',
};

/**
 * Innovation & Ideation Templates
 */
export const INNOVATION_SANDBOX_TEMPLATE: ServiceTemplateConfig = {
  id: 'innovation_sandbox',
  name: 'Innovation Sandbox',
  description: 'Test bold strategies and innovations in a risk-free environment',
  category: 'innovation',
  tier: 'advanced',
  icon: Lightbulb,
  visual: {
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'Innovative',
    badgeColor: 'bg-amber-500',
  },
  capabilities: [
    'Scenario simulation',
    'Innovation testing',
    'Risk-free experimentation',
    'Outcome prediction',
    'Strategic modeling',
  ],
  useCases: [
    {
      title: 'Test Innovations',
      description: 'Validate new ideas before investment',
      icon: '🧪',
    },
    {
      title: 'Model Scenarios',
      description: 'Simulate different strategic scenarios',
      icon: '🎬',
    },
    {
      title: 'Predict Outcomes',
      description: 'Forecast likely outcomes',
      icon: '🔮',
    },
  ],
  timeToValue: '30 minutes',
  complexity: 'medium',
  config: {
    workflowType: 'open_panel',
    defaultParams: {
      numExperts: 3,
      brainstormingRounds: 2,
    },
  },
  route: '/ask-panel-v1?workflow=open_panel',
};

export const STRATEGIC_FORESIGHT_TEMPLATE: ServiceTemplateConfig = {
  id: 'strategic_foresight',
  name: 'Strategic Foresight',
  description: 'Delphi-style forecasting for market trends and opportunities',
  category: 'innovation',
  tier: 'advanced',
  icon: Target,
  visual: {
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    badge: 'Forecasting',
    badgeColor: 'bg-teal-500',
  },
  capabilities: [
    'Market forecasting',
    'Trend analysis',
    'Consensus building',
    'Expert polling',
    'Strategic planning',
  ],
  useCases: [
    {
      title: 'Market Forecasts',
      description: 'Generate consensus market forecasts',
      icon: '📊',
    },
    {
      title: 'Trend Identification',
      description: 'Identify emerging trends',
      icon: '🔮',
    },
    {
      title: 'Strategic Planning',
      description: 'Plan for future scenarios',
      icon: '🗺️',
    },
  ],
  timeToValue: '45 minutes',
  complexity: 'high',
  config: {
    workflowType: 'delphi_panel',
    defaultParams: {
      numRounds: 3,
      numExperts: 5,
    },
  },
  route: '/ask-panel-v1?workflow=delphi_panel',
};

/**
 * Compliance & Quality Templates
 */
export const COMPLIANCE_REVIEW_TEMPLATE: ServiceTemplateConfig = {
  id: 'compliance_review',
  name: 'Compliance Review',
  description: 'Automated compliance checking and regulatory gap analysis',
  category: 'compliance',
  tier: 'advanced',
  icon: CheckCircle2,
  visual: {
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
    badge: 'Compliance',
    badgeColor: 'bg-green-500',
  },
  capabilities: [
    'Regulatory compliance checking',
    'Gap analysis',
    'Document review',
    'Quality system assessment',
    'Remediation planning',
  ],
  useCases: [
    {
      title: 'Gap Analysis',
      description: 'Identify compliance gaps',
      icon: '🔍',
    },
    {
      title: 'Document Review',
      description: 'Review compliance documentation',
      icon: '📄',
    },
    {
      title: 'Remediation Plan',
      description: 'Create compliance remediation plans',
      icon: '📋',
    },
  ],
  timeToValue: '20 minutes',
  complexity: 'medium',
  config: {
    requiredAgents: ['compliance_specialist', 'quality_expert'],
    workflowType: 'ask_expert',
    defaultParams: {
      mode: 'automatic',
      autonomous: true,
    },
  },
  route: '/ask-expert?preset=compliance',
};

/**
 * All Service Templates
 */
export const SERVICE_TEMPLATES: ServiceTemplateConfig[] = [
  REGULATORY_ADVISORY_TEMPLATE,
  MARKET_ACCESS_ADVISORY_TEMPLATE,
  CLINICAL_DEVELOPMENT_ADVISORY_TEMPLATE,
  COMPETITIVE_INTELLIGENCE_TEMPLATE,
  LITERATURE_SYNTHESIS_TEMPLATE,
  EXPERT_PANEL_TEMPLATE,
  SOCRATIC_ANALYSIS_TEMPLATE,
  ADVERSARIAL_REVIEW_TEMPLATE,
  INNOVATION_SANDBOX_TEMPLATE,
  STRATEGIC_FORESIGHT_TEMPLATE,
  COMPLIANCE_REVIEW_TEMPLATE,
];

/**
 * Service Templates by Category
 */
export const SERVICE_TEMPLATES_BY_CATEGORY = {
  advisory: [
    REGULATORY_ADVISORY_TEMPLATE,
    MARKET_ACCESS_ADVISORY_TEMPLATE,
    CLINICAL_DEVELOPMENT_ADVISORY_TEMPLATE,
  ],
  workflow: [EXPERT_PANEL_TEMPLATE],
  analysis: [SOCRATIC_ANALYSIS_TEMPLATE, ADVERSARIAL_REVIEW_TEMPLATE],
  research: [COMPETITIVE_INTELLIGENCE_TEMPLATE, LITERATURE_SYNTHESIS_TEMPLATE],
  compliance: [COMPLIANCE_REVIEW_TEMPLATE],
  innovation: [INNOVATION_SANDBOX_TEMPLATE, STRATEGIC_FORESIGHT_TEMPLATE],
};

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ServiceTemplateConfig | undefined {
  return SERVICE_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: ServiceTemplateConfig['category']
): ServiceTemplateConfig[] {
  return SERVICE_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get templates by tier
 */
export function getTemplatesByTier(tier: ServiceTemplateConfig['tier']): ServiceTemplateConfig[] {
  return SERVICE_TEMPLATES.filter((template) => template.tier === tier);
}
