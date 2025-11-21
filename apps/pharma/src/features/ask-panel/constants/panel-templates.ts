/**
 * Panel Use Case Templates
 * 
 * Pre-configured panel templates for common healthcare scenarios
 */

import type { PanelTemplate } from '../types/agent';

// ============================================================================
// USE CASE TEMPLATES
// ============================================================================

export const PANEL_TEMPLATES: PanelTemplate[] = [
  // ==========================================================================
  // CLINICAL TRIAL TEMPLATES
  // ==========================================================================
  {
    id: 'clinical-trial-design',
    name: 'Clinical Trial Design',
    description: 'Design and plan digital health clinical trials with expert guidance on protocol, statistics, and regulatory requirements.',
    useCase: 'clinical_trial',
    suggestedAgents: [
      'clinical-trial-designer',
      'biostatistician-digital-health',
      'clinical-protocol-writer',
      'fda-regulatory-strategist',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 10,
      requireConsensus: false,
    },
    icon: '🔬',
    category: 'clinical',
    tags: ['clinical-trial', 'protocol', 'research', 'study-design'],
    popularity: 95,
  },
  {
    id: 'dct-planning',
    name: 'Decentralized Clinical Trial (DCT) Planning',
    description: 'Plan and execute decentralized/remote clinical trials with experts in virtual operations and digital endpoints.',
    useCase: 'clinical_trial',
    suggestedAgents: [
      'clinical-trial-designer',
      'clinical-operations-coordinator',
      'clinical-data-manager',
      'biostatistician-digital-health',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 12,
      requireConsensus: true,
    },
    icon: '🌐',
    category: 'clinical',
    tags: ['dct', 'remote-trial', 'virtual', 'decentralized'],
    popularity: 85,
  },
  
  // ==========================================================================
  // REGULATORY TEMPLATES
  // ==========================================================================
  {
    id: 'fda-submission-strategy',
    name: 'FDA Submission Strategy',
    description: 'Develop comprehensive FDA regulatory submission strategy for digital health products including SaMD classification and pathway selection.',
    useCase: 'regulatory',
    suggestedAgents: [
      'fda-regulatory-strategist',
      'breakthrough-therapy-advisor',
      'clinical-trial-designer',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 15,
      requireConsensus: true,
    },
    icon: '📋',
    category: 'regulatory',
    tags: ['fda', 'submission', 'regulatory', 'approval'],
    popularity: 90,
  },
  {
    id: 'breakthrough-designation',
    name: 'Breakthrough Therapy Designation',
    description: 'Pursue FDA Breakthrough Therapy Designation with strategic guidance on eligibility, application, and evidence requirements.',
    useCase: 'regulatory',
    suggestedAgents: [
      'breakthrough-therapy-advisor',
      'fda-regulatory-strategist',
      'clinical-trial-designer',
      'evidence-generation-planner',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 8,
      requireConsensus: false,
    },
    icon: '🚀',
    category: 'regulatory',
    tags: ['breakthrough', 'btd', 'fda', 'expedited'],
    popularity: 80,
  },
  {
    id: 'hipaa-compliance-review',
    name: 'HIPAA & Privacy Compliance',
    description: 'Comprehensive HIPAA compliance review and digital health privacy strategy for PHI-handling applications.',
    useCase: 'regulatory',
    suggestedAgents: [
      'hipaa-compliance-officer',
      'fda-regulatory-strategist',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 6,
      requireConsensus: false,
    },
    icon: '🔒',
    category: 'regulatory',
    tags: ['hipaa', 'privacy', 'compliance', 'security'],
    popularity: 75,
  },
  
  // ==========================================================================
  // MARKET ACCESS TEMPLATES
  // ==========================================================================
  {
    id: 'product-launch',
    name: 'Digital Health Product Launch',
    description: 'Comprehensive product launch strategy covering payer engagement, market access, commercialization, and marketing.',
    useCase: 'market_access',
    suggestedAgents: [
      'product-launch-strategist',
      'payer-strategy-advisor',
      'health-economics-modeler',
      'digital-marketing-strategist',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 15,
      requireConsensus: true,
    },
    icon: '🚀',
    category: 'market_access',
    tags: ['launch', 'commercialization', 'marketing', 'gtm'],
    popularity: 88,
  },
  {
    id: 'payer-strategy',
    name: 'Payer & Reimbursement Strategy',
    description: 'Develop payer engagement and reimbursement strategy including medical policy, contracting, and value demonstration.',
    useCase: 'market_access',
    suggestedAgents: [
      'payer-strategy-advisor',
      'health-economics-modeler',
      'product-launch-strategist',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 10,
      requireConsensus: false,
    },
    icon: '💰',
    category: 'market_access',
    tags: ['payer', 'reimbursement', 'contracting', 'coverage'],
    popularity: 82,
  },
  {
    id: 'heor-evidence',
    name: 'HEOR & Value Evidence',
    description: 'Design health economics and outcomes research studies to demonstrate clinical and economic value.',
    useCase: 'market_access',
    suggestedAgents: [
      'health-economics-modeler',
      'real-world-evidence-analyst',
      'biostatistician-digital-health',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 12,
      requireConsensus: true,
    },
    icon: '📊',
    category: 'market_access',
    tags: ['heor', 'health-economics', 'value', 'evidence'],
    popularity: 78,
  },
  
  // ==========================================================================
  // DATA & ANALYTICS TEMPLATES
  // ==========================================================================
  {
    id: 'rwe-study-design',
    name: 'Real-World Evidence Study',
    description: 'Design real-world evidence studies using observational data, EMR, claims, and patient-generated health data.',
    useCase: 'general',
    suggestedAgents: [
      'real-world-evidence-analyst',
      'biostatistician-digital-health',
      'evidence-generation-planner',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 10,
      requireConsensus: false,
    },
    icon: '🌍',
    category: 'analytical',
    tags: ['rwe', 'real-world', 'observational', 'evidence'],
    popularity: 72,
  },
  {
    id: 'data-strategy',
    name: 'Clinical Data Management Strategy',
    description: 'Develop comprehensive data management strategy including EDC, CDISC standards, and data quality.',
    useCase: 'general',
    suggestedAgents: [
      'clinical-data-manager',
      'biostatistician-digital-health',
      'data-visualization-specialist',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 8,
      requireConsensus: false,
    },
    icon: '💾',
    category: 'analytical',
    tags: ['data-management', 'cdisc', 'edc', 'quality'],
    popularity: 68,
  },
  
  // ==========================================================================
  // DIGITAL HEALTH INNOVATION TEMPLATES
  // ==========================================================================
  {
    id: 'digital-therapeutic-dev',
    name: 'Digital Therapeutic Development',
    description: 'End-to-end guidance for developing digital therapeutics from concept through clinical validation and regulatory approval.',
    useCase: 'general',
    suggestedAgents: [
      'clinical-trial-designer',
      'fda-regulatory-strategist',
      'personalized-medicine-specialist',
      'product-launch-strategist',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 20,
      requireConsensus: true,
    },
    icon: '💊',
    category: 'technical',
    tags: ['dtx', 'digital-therapeutic', 'development', 'innovation'],
    popularity: 92,
  },
  {
    id: 'precision-medicine',
    name: 'Precision Medicine Strategy',
    description: 'Develop personalized medicine approaches using digital phenotyping, AI, and adaptive interventions.',
    useCase: 'general',
    suggestedAgents: [
      'personalized-medicine-specialist',
      'nlp-expert',
      'biostatistician-digital-health',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 12,
      requireConsensus: false,
    },
    icon: '🧬',
    category: 'technical',
    tags: ['precision-medicine', 'personalized', 'ai', 'adaptive'],
    popularity: 70,
  },
  
  // ==========================================================================
  // SPECIALIZED POPULATION TEMPLATES
  // ==========================================================================
  {
    id: 'geriatric-digital-health',
    name: 'Geriatric Digital Health',
    description: 'Design digital health solutions for older adults with focus on accessibility, usability, and age-appropriate engagement.',
    useCase: 'general',
    suggestedAgents: [
      'geriatric-clinical-specialist',
      'clinical-trial-designer',
      'data-visualization-specialist',
    ],
    mode: 'sequential',
    framework: 'langgraph',
    defaultSettings: {
      userGuidance: 'high',
      allowDebate: false,
      maxRounds: 8,
      requireConsensus: false,
    },
    icon: '👴',
    category: 'clinical',
    tags: ['geriatric', 'elderly', 'accessibility', 'aging'],
    popularity: 65,
  },
  {
    id: 'rare-disease-program',
    name: 'Rare Disease Development',
    description: 'Specialized guidance for rare disease digital health programs including natural history studies and patient registries.',
    useCase: 'general',
    suggestedAgents: [
      'rare-disease-specialist',
      'clinical-trial-designer',
      'fda-regulatory-strategist',
    ],
    mode: 'collaborative',
    framework: 'autogen',
    defaultSettings: {
      userGuidance: 'medium',
      allowDebate: true,
      maxRounds: 12,
      requireConsensus: true,
    },
    icon: '🦋',
    category: 'clinical',
    tags: ['rare-disease', 'orphan-drug', 'registry', 'ultra-rare'],
    popularity: 60,
  },
];

// ============================================================================
// TEMPLATE HELPERS
// ============================================================================

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PanelTemplate | undefined {
  return PANEL_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PanelTemplate[] {
  return PANEL_TEMPLATES.filter(t => t.category === category)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

/**
 * Get templates by use case
 */
export function getTemplatesByUseCase(useCase: string): PanelTemplate[] {
  return PANEL_TEMPLATES.filter(t => t.useCase === useCase)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

/**
 * Get top templates
 */
export function getTopTemplates(limit: number = 5): PanelTemplate[] {
  return [...PANEL_TEMPLATES]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): PanelTemplate[] {
  const queryLower = query.toLowerCase();
  return PANEL_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(queryLower) ||
    t.description.toLowerCase().includes(queryLower) ||
    t.tags.some(tag => tag.toLowerCase().includes(queryLower))
  );
}

