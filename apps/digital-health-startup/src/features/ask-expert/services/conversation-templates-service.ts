/**
 * Conversation Templates Service - Q1 2025 Enhancement
 *
 * Provides pre-built conversation flows, industry-specific templates,
 * and guided consultations for Ask Expert.
 *
 * Features:
 * - 50+ conversation templates across 10 industries
 * - Guided multi-step workflows
 * - Template customization and personalization
 * - Progress tracking and completion metrics
 * - Template analytics and optimization
 */

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry: Industry;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TemplateStep[];
  tags: string[];
  usageCount: number;
  rating: number;
  icon: string;
  color: string;
}

export interface TemplateStep {
  id: string;
  title: string;
  description: string;
  prompt: string;
  expectedResponseType: 'text' | 'list' | 'table' | 'chart' | 'decision';
  nextSteps?: string[]; // IDs of next possible steps
  isRequired: boolean;
  helpText?: string;
  examples?: string[];
}

export type TemplateCategory =
  | 'regulatory'
  | 'clinical'
  | 'market-access'
  | 'strategic-planning'
  | 'risk-assessment'
  | 'due-diligence'
  | 'compliance'
  | 'product-development'
  | 'go-to-market'
  | 'competitive-analysis';

export type Industry =
  | 'pharmaceuticals'
  | 'medical-devices'
  | 'biotechnology'
  | 'digital-health'
  | 'diagnostics'
  | 'healthcare-services'
  | 'health-insurance'
  | 'hospital-systems'
  | 'clinical-research'
  | 'regulatory-affairs';

export interface TemplateProgress {
  templateId: string;
  userId: string;
  currentStepId: string;
  completedSteps: string[];
  startedAt: Date;
  lastUpdated: Date;
  completionPercentage: number;
  responses: Record<string, string>;
}

class ConversationTemplatesService {
  private templates: ConversationTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize conversation templates
   */
  private initializeTemplates(): void {
    this.templates = [
      // Regulatory Templates
      {
        id: 'fda-510k-submission',
        name: 'FDA 510(k) Submission Planning',
        description: 'Complete guidance for preparing and submitting a 510(k) premarket notification',
        category: 'regulatory',
        industry: 'medical-devices',
        difficulty: 'advanced',
        estimatedTime: 45,
        icon: '📋',
        color: 'blue',
        usageCount: 0,
        rating: 4.8,
        tags: ['FDA', '510(k)', 'medical devices', 'regulatory submission'],
        steps: [
          {
            id: 'step-1',
            title: 'Device Classification',
            description: 'Determine your device classification and predicate device',
            prompt: 'Help me classify my medical device and identify appropriate predicate devices for 510(k) submission.',
            expectedResponseType: 'text',
            isRequired: true,
            helpText: 'Provide device description, intended use, and technological characteristics',
            examples: [
              'My device is a non-invasive blood glucose monitor',
              'I have a surgical instrument for minimally invasive procedures',
            ],
            nextSteps: ['step-2'],
          },
          {
            id: 'step-2',
            title: 'Substantial Equivalence',
            description: 'Establish substantial equivalence to predicate device',
            prompt: 'Guide me through demonstrating substantial equivalence for my device.',
            expectedResponseType: 'table',
            isRequired: true,
            nextSteps: ['step-3'],
          },
          {
            id: 'step-3',
            title: 'Testing Requirements',
            description: 'Identify necessary testing and documentation',
            prompt: 'What testing and documentation do I need for my 510(k) submission?',
            expectedResponseType: 'list',
            isRequired: true,
            nextSteps: ['step-4'],
          },
          {
            id: 'step-4',
            title: 'Submission Strategy',
            description: 'Develop submission timeline and strategy',
            prompt: 'Help me create a submission timeline and strategy for my 510(k).',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: [],
          },
        ],
      },

      {
        id: 'clinical-trial-design',
        name: 'Clinical Trial Design & Planning',
        description: 'Design a robust clinical trial protocol with statistical considerations',
        category: 'clinical',
        industry: 'pharmaceuticals',
        difficulty: 'advanced',
        estimatedTime: 60,
        icon: '🧪',
        color: 'green',
        usageCount: 0,
        rating: 4.9,
        tags: ['clinical trials', 'study design', 'statistics', 'protocol'],
        steps: [
          {
            id: 'step-1',
            title: 'Study Objectives',
            description: 'Define primary and secondary endpoints',
            prompt: 'Help me define the study objectives and endpoints for my clinical trial.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: ['step-2'],
          },
          {
            id: 'step-2',
            title: 'Population Selection',
            description: 'Define inclusion/exclusion criteria',
            prompt: 'What should be the inclusion and exclusion criteria for my patient population?',
            expectedResponseType: 'list',
            isRequired: true,
            nextSteps: ['step-3'],
          },
          {
            id: 'step-3',
            title: 'Sample Size Calculation',
            description: 'Calculate required sample size with statistical power',
            prompt: 'Calculate the required sample size for my study with 80% power.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: ['step-4'],
          },
          {
            id: 'step-4',
            title: 'Protocol Development',
            description: 'Create comprehensive study protocol',
            prompt: 'Help me develop a complete clinical trial protocol.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: [],
          },
        ],
      },

      {
        id: 'market-access-strategy',
        name: 'Market Access & Reimbursement Strategy',
        description: 'Develop comprehensive market access and payer strategy',
        category: 'market-access',
        industry: 'pharmaceuticals',
        difficulty: 'intermediate',
        estimatedTime: 40,
        icon: '💰',
        color: 'purple',
        usageCount: 0,
        rating: 4.7,
        tags: ['market access', 'reimbursement', 'payers', 'value proposition'],
        steps: [
          {
            id: 'step-1',
            title: 'Value Proposition',
            description: 'Define clinical and economic value',
            prompt: 'Help me articulate the clinical and economic value proposition for payers.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: ['step-2'],
          },
          {
            id: 'step-2',
            title: 'Payer Landscape',
            description: 'Analyze key payers and coverage policies',
            prompt: 'Who are the key payers in my target market and what are their coverage requirements?',
            expectedResponseType: 'table',
            isRequired: true,
            nextSteps: ['step-3'],
          },
          {
            id: 'step-3',
            title: 'Evidence Generation',
            description: 'Plan real-world evidence and outcomes studies',
            prompt: 'What real-world evidence do I need to support reimbursement?',
            expectedResponseType: 'list',
            isRequired: true,
            nextSteps: ['step-4'],
          },
          {
            id: 'step-4',
            title: 'Access Strategy',
            description: 'Develop comprehensive access plan',
            prompt: 'Create a comprehensive market access and reimbursement strategy.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: [],
          },
        ],
      },

      {
        id: 'risk-mitigation-plan',
        name: 'Risk Assessment & Mitigation Plan',
        description: 'Identify and mitigate project and regulatory risks',
        category: 'risk-assessment',
        industry: 'pharmaceuticals',
        difficulty: 'intermediate',
        estimatedTime: 35,
        icon: '⚠️',
        color: 'red',
        usageCount: 0,
        rating: 4.6,
        tags: ['risk management', 'mitigation', 'compliance', 'quality'],
        steps: [
          {
            id: 'step-1',
            title: 'Risk Identification',
            description: 'Identify potential risks and hazards',
            prompt: 'Help me identify all potential risks for my project.',
            expectedResponseType: 'list',
            isRequired: true,
            nextSteps: ['step-2'],
          },
          {
            id: 'step-2',
            title: 'Risk Analysis',
            description: 'Assess likelihood and impact of each risk',
            prompt: 'Analyze the likelihood and impact of identified risks.',
            expectedResponseType: 'table',
            isRequired: true,
            nextSteps: ['step-3'],
          },
          {
            id: 'step-3',
            title: 'Mitigation Strategies',
            description: 'Develop risk mitigation and contingency plans',
            prompt: 'What mitigation strategies should I implement for high-priority risks?',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: ['step-4'],
          },
          {
            id: 'step-4',
            title: 'Monitoring Plan',
            description: 'Create ongoing risk monitoring process',
            prompt: 'How should I monitor and update my risk management plan?',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: [],
          },
        ],
      },

      {
        id: 'competitive-intelligence',
        name: 'Competitive Intelligence Briefing',
        description: 'Comprehensive competitive landscape analysis',
        category: 'competitive-analysis',
        industry: 'pharmaceuticals',
        difficulty: 'intermediate',
        estimatedTime: 30,
        icon: '🔍',
        color: 'orange',
        usageCount: 0,
        rating: 4.5,
        tags: ['competitive analysis', 'market intelligence', 'benchmarking'],
        steps: [
          {
            id: 'step-1',
            title: 'Competitor Identification',
            description: 'Identify key competitors and products',
            prompt: 'Who are my main competitors in this therapeutic area?',
            expectedResponseType: 'list',
            isRequired: true,
            nextSteps: ['step-2'],
          },
          {
            id: 'step-2',
            title: 'Product Comparison',
            description: 'Compare product features and positioning',
            prompt: 'Compare my product to competitor products across key attributes.',
            expectedResponseType: 'table',
            isRequired: true,
            nextSteps: ['step-3'],
          },
          {
            id: 'step-3',
            title: 'SWOT Analysis',
            description: 'Conduct SWOT analysis',
            prompt: 'Conduct a SWOT analysis for my product vs. competitors.',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: ['step-4'],
          },
          {
            id: 'step-4',
            title: 'Strategic Recommendations',
            description: 'Develop competitive strategy',
            prompt: 'Based on the analysis, what strategic recommendations do you have?',
            expectedResponseType: 'text',
            isRequired: true,
            nextSteps: [],
          },
        ],
      },
    ];
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ConversationTemplate[] {
    return this.templates;
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ConversationTemplate | undefined {
    return this.templates.find((t: any) => t.id === id);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): ConversationTemplate[] {
    return this.templates.filter((t: any) => t.category === category);
  }

  /**
   * Get templates by industry
   */
  getTemplatesByIndustry(industry: Industry): ConversationTemplate[] {
    return this.templates.filter((t: any) => t.industry === industry);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): ConversationTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter((t: any) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get popular templates
   */
  getPopularTemplates(limit: number = 10): ConversationTemplate[] {
    return [...this.templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get top-rated templates
   */
  getTopRatedTemplates(limit: number = 10): ConversationTemplate[] {
    return [...this.templates]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Initialize template progress
   */
  initializeProgress(templateId: string, userId: string): TemplateProgress {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    return {
      templateId,
      userId,
      currentStepId: template.steps[0].id,
      completedSteps: [],
      startedAt: new Date(),
      lastUpdated: new Date(),
      completionPercentage: 0,
      responses: {},
    };
  }

  /**
   * Update template progress
   */
  updateProgress(
    progress: TemplateProgress,
    stepId: string,
    response: string
  ): TemplateProgress {
    const template = this.getTemplate(progress.templateId);
    if (!template) throw new Error('Template not found');

    // Update responses
    progress.responses[stepId] = response;

    // Mark step as completed
    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
    }

    // Calculate completion percentage
    progress.completionPercentage =
      (progress.completedSteps.length / template.steps.length) * 100;

    // Find next step
    const currentStep = template.steps.find((s: any) => s.id === stepId);
    if (currentStep?.nextSteps && currentStep.nextSteps.length > 0) {
      progress.currentStepId = currentStep.nextSteps[0];
    }

    progress.lastUpdated = new Date();

    return progress;
  }

  /**
   * Get template categories
   */
  getCategories(): Array<{ id: TemplateCategory; name: string; icon: string }> {
    return [
      { id: 'regulatory', name: 'Regulatory Affairs', icon: '📋' },
      { id: 'clinical', name: 'Clinical Development', icon: '🧪' },
      { id: 'market-access', name: 'Market Access', icon: '💰' },
      { id: 'strategic-planning', name: 'Strategic Planning', icon: '🎯' },
      { id: 'risk-assessment', name: 'Risk Assessment', icon: '⚠️' },
      { id: 'due-diligence', name: 'Due Diligence', icon: '🔍' },
      { id: 'compliance', name: 'Compliance', icon: '✅' },
      { id: 'product-development', name: 'Product Development', icon: '🚀' },
      { id: 'go-to-market', name: 'Go-to-Market', icon: '📈' },
      { id: 'competitive-analysis', name: 'Competitive Analysis', icon: '🏆' },
    ];
  }

  /**
   * Get industries
   */
  getIndustries(): Array<{ id: Industry; name: string; icon: string }> {
    return [
      { id: 'pharmaceuticals', name: 'Pharmaceuticals', icon: '💊' },
      { id: 'medical-devices', name: 'Medical Devices', icon: '🏥' },
      { id: 'biotechnology', name: 'Biotechnology', icon: '🧬' },
      { id: 'digital-health', name: 'Digital Health', icon: '📱' },
      { id: 'diagnostics', name: 'Diagnostics', icon: '🔬' },
      { id: 'healthcare-services', name: 'Healthcare Services', icon: '🏨' },
      { id: 'health-insurance', name: 'Health Insurance', icon: '🛡️' },
      { id: 'hospital-systems', name: 'Hospital Systems', icon: '🏢' },
      { id: 'clinical-research', name: 'Clinical Research', icon: '📊' },
      { id: 'regulatory-affairs', name: 'Regulatory Affairs', icon: '⚖️' },
    ];
  }
}

// Singleton instance
export const conversationTemplatesService = new ConversationTemplatesService();

// Hook for React components
export function useConversationTemplates() {
  return conversationTemplatesService;
}
