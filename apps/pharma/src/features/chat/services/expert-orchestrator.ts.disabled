'use client';

import { ragService } from '@/shared/services/rag/rag-service';

export interface ExpertAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  expertise: {
    primary: string[];
    secondary: string[];
    domains: string[];
  };
  credentials: {
    education: string[];
    certifications: string[];
    experience: string;
    publications: number;
  };
  performance: {
    casesHandled: number;
    avgRating: number;
    consensusRate: number;
    responseTime: number;
    specializations: string[];
  };
  availability: {
    status: 'available' | 'busy' | 'offline';
    nextAvailable: Date;
    timezone: string;
    preferredHours: TimeRange[];
  };
  traits: {
    communicationStyle: 'analytical' | 'collaborative' | 'directive';
    decisionMaking: 'conservative' | 'balanced' | 'innovative';
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface VirtualPanel {
  id: string;
  experts: ExpertAgent[];
  sessionType: SessionType;
  facilitationStrategy: FacilitationStrategy;
  consensus?: PanelConsensus;
}

export interface SessionContext {
  query: string;
  domain: string;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  urgency: 'low' | 'standard' | 'high' | 'urgent';
  requiredExpertise: string[];
  previousResponses: ExpertResponse[];
}

export interface ExpertResponse {
  expertId: string;
  content: string;
  confidence: number;
  reasoning: string;
  evidence: string[];
  timestamp: Date;
}

export interface PanelConsensus {
  primaryRecommendation: string;
  confidence: number;
  dissenting: string[];
  nextSteps: string[];
  evidence: string[];
  voting?: VotingResult;
}

export interface VotingResult {
  question: string;
  options: VoteOption[];
  results: Map<string, number>;
  consensus: boolean;
  threshold: number;
}

export interface VoteOption {
  id: string;
  label: string;
  description?: string;
}

export type SessionType = 'ADVISORY' | 'PROBLEM_SOLVING' | 'STRATEGIC' | 'CLINICAL_VALIDATION';
export type UseCaseType = 'medical-board' | 'regulatory-panel' | 'clinical-experts' | 'strategic-advisory';

export interface FacilitationStrategy {
  type: 'STRUCTURED_QA' | 'GUIDED_DISCOVERY' | 'ADVISORY_BOARD' | 'PROBLEM_SOLVING';
  phases: PhaseConfig[];
  facilitation: 'directive' | 'adaptive' | 'collaborative' | 'analytical';
}

export interface PhaseConfig {
  name: string;
  duration: number;
  objective: string;
  questions: FacilitationQuestion[];
}

export interface FacilitationQuestion {
  id: string;
  text: string;
  type: 'open' | 'multiple_choice' | 'rating' | 'ranking';
  targetExperts?: string[];
  followUp?: boolean;
}

export interface SessionOutput {
  executiveSummary: string;
  consensusPoints: ConsensusPoint[];
  divergencePoints: DivergencePoint[];
  recommendations: Recommendation[];
  deliverables: Deliverable[];
  nextSteps: NextStep[];
}

export interface ConsensusPoint {
  topic: string;
  statement: string;
  agreementLevel: number;
  expertsInAgreement: string[];
  confidence: number;
  supportingEvidence: string[];
}

export interface DivergencePoint {
  topic: string;
  issue: string;
  perspectives: Perspective[];
  impactAssessment: string;
  resolutionPath: string;
}

export interface Perspective {
  expert: ExpertAgent;
  position: string;
  rationale: string;
  evidence: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
  owner?: string;
  dependencies?: string[];
}

export interface Deliverable {
  type: 'EXECUTIVE_SUMMARY' | 'DETAILED_REPORT' | 'STRATEGY_DOCUMENT' | 'ACTION_PLAN' | 'VISUAL_SUMMARY';
  format: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'PNG';
  content: string;
  metadata: Record<string, unknown>;
}

export interface NextStep {
  id: string;
  description: string;
  owner: string;
  deadline: Date;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export class ExpertOrchestrator {
  private expertLibrary: ExpertAgent[] = [];
  private activePanel: VirtualPanel | null = null;
  private sessionContext: SessionContext | null = null;

  constructor(
    private facilitationEngine: FacilitationEngine,
    private agentsStore?: unknown
  ) {
    this.initializeExpertLibrary();
  }

  private initializeExpertLibrary() {
    this.expertLibrary = [
      {
        id: 'dr-sarah-chen',
        name: 'Dr. Sarah Chen',
        avatar: '👩‍⚕️',
        role: 'Chief Medical Officer',
        expertise: {
          primary: ['Clinical Strategy', 'Patient Safety', 'Oncology'],
          secondary: ['Regulatory Affairs', 'Quality Assurance'],
          domains: ['Medical', 'Clinical', 'Regulatory']
        },
        credentials: {
          education: ['MD - Harvard Medical School', 'MBA - Wharton'],
          certifications: ['Board Certified Oncologist', 'Clinical Research Certification'],
          experience: '15+ years in clinical medicine and pharmaceutical development',
          publications: 127
        },
        performance: {
          casesHandled: 234,
          avgRating: 4.8,
          consensusRate: 0.89,
          responseTime: 18,
          specializations: ['Oncology', 'Clinical Trials', 'Patient Safety']
        },
        availability: {
          status: 'available',
          nextAvailable: new Date(),
          timezone: 'PST',
          preferredHours: [{ start: '09:00', end: '17:00' }]
        },
        traits: {
          communicationStyle: 'collaborative',
          decisionMaking: 'balanced',
          riskTolerance: 'medium'
        }
      },
      {
        id: 'dr-michael-smith',
        name: 'Dr. Michael Smith',
        avatar: '👨‍💼',
        role: 'FDA Regulatory Specialist',
        expertise: {
          primary: ['FDA Regulations', '510(k) Submissions', 'Pre-Market Approval'],
          secondary: ['Quality Systems', 'Medical Device Regulation'],
          domains: ['Regulatory', 'Compliance', 'Legal']
        },
        credentials: {
          education: ['JD - Georgetown Law', 'MS Regulatory Affairs - Johns Hopkins'],
          certifications: ['RAC - Regulatory Affairs Certification'],
          experience: '12+ years in FDA regulatory affairs',
          publications: 45
        },
        performance: {
          casesHandled: 189,
          avgRating: 4.9,
          consensusRate: 0.92,
          responseTime: 22,
          specializations: ['FDA Guidance', 'Regulatory Strategy', 'Compliance']
        },
        availability: {
          status: 'available',
          nextAvailable: new Date(),
          timezone: 'EST',
          preferredHours: [{ start: '08:00', end: '16:00' }]
        },
        traits: {
          communicationStyle: 'analytical',
          decisionMaking: 'conservative',
          riskTolerance: 'low'
        }
      },
      // Add more experts as needed
    ];
  }

  async assemblePanelForQuery(
    query: string,
    useCase: UseCaseType
  ): Promise<VirtualPanel> {

    return this.buildOptimalPanel(expertMatches, {
      minExperts: 3,
      maxExperts: 7,
      diversityRequired: true,
      consensusThreshold: 0.75
    });
  }

  async buildCustomPanel(
    selectedExperts: string[],
    sessionType: SessionType
  ): Promise<VirtualPanel> {

    return {
      id: `panel-${Date.now()}`,
      experts,
      sessionType,
      facilitationStrategy
    };
  }

  async facilitateSession(
    panel: VirtualPanel,
    sessionType: SessionType
  ): Promise<SessionOutput> {
    this.activePanel = panel;

    const discussion = await this.facilitateDiscussion(
      panel,
      facilitationStrategy
    );

    return await this.synthesizeOutputs(discussion);
  }

  private async analyzeExpertiseNeeds(query: string): Promise<string[]> {

    const requiredExpertise: string[] = [];

    try {
      // Use RAG to enhance domain understanding
      const ragResults = await this.ragService.searchSimilar(query, {
        threshold: 0.7,
        limit: 3
      });

      // Extract domain insights from RAG results
      const ragDomains = ragResults.map(result => result.domain || 'general');

      // Map RAG domains to required expertise
      ragDomains.forEach(domain => {
        switch (domain) {
          case 'clinical_research':
            requiredExpertise.push('Clinical Medicine', 'Clinical Research');
            break;
          case 'regulatory_compliance':
            requiredExpertise.push('Regulatory Affairs', 'FDA Compliance');
            break;
          case 'market_access':
            requiredExpertise.push('Health Economics', 'Market Access');
            break;
          case 'digital_health':
            requiredExpertise.push('Digital Health', 'Health Technology');
            break;
        }
      });

      // Map PRISM suites to expertise
      ragSuites.forEach(suite => {
        switch (suite) {
          case 'RULES':
            requiredExpertise.push('Regulatory Affairs', 'Compliance');
            break;
          case 'TRIALS':
            requiredExpertise.push('Clinical Research', 'Biostatistics');
            break;
          case 'VALUE':
            requiredExpertise.push('Health Economics', 'Market Access');
            break;
          case 'GUARD':
            requiredExpertise.push('Patient Safety', 'Risk Management');
            break;
        }
      });
    } catch (error) {
      // console.warn('RAG expertise analysis failed, falling back to keyword analysis:', error);
    }

    // Fallback keyword analysis
    const keywords = query.toLowerCase().split(' ');
    
    // Medical/Clinical keywords
    if (keywords.includes('clinical') || keywords.includes('patient') || keywords.includes('treatment')) {
      requiredExpertise.push('Clinical Medicine');
    }

    // Regulatory keywords
    if (keywords.includes('fda') || keywords.includes('regulatory') || keywords.includes('approval')) {
      requiredExpertise.push('Regulatory Affairs');
    }

    // Statistical keywords
    if (keywords.includes('data') || keywords.includes('analysis') || keywords.includes('statistical')) {
      requiredExpertise.push('Biostatistics');
    }

    // Quality keywords
    if (keywords.includes('quality') || keywords.includes('compliance') || keywords.includes('audit')) {
      requiredExpertise.push('Quality Assurance');
    }

    return requiredExpertise.length > 0 ? requiredExpertise : ['General Medical'];
  }

  private async matchExperts(requiredExpertise: string[]): Promise<ExpertAgent[]> {
    return this.expertLibrary.filter(expert =>
      expert.expertise.primary.some(exp =>
        requiredExpertise.some(req =>
          exp.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(exp.toLowerCase())
        )
      )
    );
  }

  private buildOptimalPanel(
    expertMatches: ExpertAgent[],
    config: {
      minExperts: number;
      maxExperts: number;
      diversityRequired: boolean;
      consensusThreshold: number;
    }
  ): VirtualPanel {
    // Sort by performance and select optimal mix
    const sortedExperts = matchedExperts
      .sort((a, b) => b.performance.avgRating - a.performance.avgRating)
      .slice(0, config.maxExperts);

    const facilitationStrategy = this.selectFacilitationStrategy('ADVISORY');
    
    return {
      id: `panel-${Date.now()}`,
      experts: sortedExperts,
      sessionType: 'ADVISORY',
      facilitationStrategy
    };
  }

  private selectFacilitationStrategy(sessionType: SessionType): FacilitationStrategy {
    switch (sessionType) {
      case 'ADVISORY':
        return {
          type: 'ADVISORY_BOARD',
          phases: [
            {
              name: 'Context Setting',
              duration: 5,
              objective: 'Establish context and objectives',
              questions: [
                {
                  id: 'context-1',
                  text: 'What are your initial thoughts on this topic?',
                  type: 'open'
                }
              ]
            },
            {
              name: 'Expert Input',
              duration: 30,
              objective: 'Gather expert perspectives',
              questions: [
                {
                  id: 'input-1',
                  text: 'From your expertise, what are the critical factors to consider?',
                  type: 'open'
                }
              ]
            },
            {
              name: 'Discussion',
              duration: 20,
              objective: 'Build understanding and consensus',
              questions: [
                {
                  id: 'discussion-1',
                  text: 'Based on our discussion, where do we have consensus?',
                  type: 'open'
                }
              ]
            },
            {
              name: 'Recommendations',
              duration: 15,
              objective: 'Formulate actionable recommendations',
              questions: [
                {
                  id: 'rec-1',
                  text: 'What are your top 3 recommendations?',
                  type: 'open'
                }
              ]
            }
          ],
          facilitation: 'collaborative'
        };

      default:
        return this.createDefaultFacilitationStrategy();
    }
  }

  private createDefaultFacilitationStrategy(): FacilitationStrategy {
    return {
      type: 'STRUCTURED_QA',
      phases: [
        {
          name: 'Introduction',
          duration: 5,
          objective: 'Set context',
          questions: []
        }
      ],
      facilitation: 'directive'
    };
  }

  private async loadExperts(expertIds: string[]): Promise<ExpertAgent[]> {
    // If we have an agents store, load real agents and convert them to ExpertAgent format
    if (this.agentsStore) {
      const realAgents = await this.agentsStore.getAgentsByIds(expertIds);
      return realAgents.map(agent => this.convertToExpertAgent(agent));
    }

    // Fallback to mock experts
    return this.expertLibrary.filter(expert => expertIds.includes(expert.id));
  }

  private convertToExpertAgent(agent: unknown): ExpertAgent {
    return {
      id: agent.id,
      name: agent.display_name || agent.name,
      avatar: agent.avatar || '🤖',
      role: agent.role || 'Expert',
      expertise: {
        primary: agent.knowledge_domains || ['General'],
        secondary: agent.capabilities || [],
        domains: [agent.business_function || 'Healthcare'].filter(Boolean)
      },
      credentials: {
        education: [],
        certifications: [],
        experience: agent.description || 'Expert in healthcare and medical domains',
        publications: 0
      },
      performance: {
        casesHandled: 0,
        avgRating: 4.5,
        consensusRate: 0.85,
        responseTime: 20,
        specializations: agent.capabilities || []
      },
      availability: {
        status: 'available',
        nextAvailable: new Date(),
        timezone: 'UTC',
        preferredHours: [{ start: '09:00', end: '17:00' }]
      },
      traits: {
        communicationStyle: 'collaborative',
        decisionMaking: 'balanced',
        riskTolerance: 'medium'
      }
    };
  }

  private async runFacilitation(
    panel: VirtualPanel,
    strategy: FacilitationStrategy
  ): Promise<unknown> {
    // Simulate facilitation process
    return {
      phases: strategy.phases,
      responses: panel.experts.map(expert => ({
        expertId: expert.id,
        responses: ['Sample response from ' + expert.name],
        confidence: 0.85
      }))
    };
  }

  private async synthesizeOutputs(discussion: unknown): Promise<SessionOutput> {

    try {
      // Enhance responses with RAG context

      // Analyze consensus and divergence with RAG context

      // Generate executive summary

        consensusPoints,
        divergencePoints,
        recommendations,
        panelExperts
      );

      return {
        executiveSummary,
        consensusPoints,
        divergencePoints,
        recommendations,
        deliverables: this.generateDeliverables(recommendations, consensusPoints),
        nextSteps: this.generateNextSteps(recommendations)
      };

    } catch (error) {
      // console.warn('RAG enhancement failed, using standard synthesis:', error);

      // Fallback to standard analysis

      // Generate executive summary

        consensusPoints,
        divergencePoints,
        recommendations,
        panelExperts
      );

      return {
        executiveSummary,
        consensusPoints,
        divergencePoints,
        recommendations,
        deliverables: this.generateDeliverables(recommendations, consensusPoints),
        nextSteps: this.generateNextSteps(recommendations)
      };
    }
  }

  private async enhanceWithRAGContext(expertResponses: ExpertResponse[], query: string): Promise<ExpertResponse[]> {
    try {
      // Get relevant knowledge context

        threshold: 0.7,
        limit: 5
      });

      // Enhance each response with relevant knowledge

        ...response,
        evidence: [
          ...response.evidence,
          ...ragResults.map(result => `Knowledge Source: ${result.source_name} - ${result.content.substring(0, 200)}...`)
        ]
      }));

      return enhancedResponses;
    } catch (error) {
      // console.warn('Failed to enhance responses with RAG context:', error);
      return expertResponses;
    }
  }

  private analyzeConsensus(responses: unknown[], experts: ExpertAgent[]): ConsensusPoint[] {
    const consensusPoints: ConsensusPoint[] = [];

    // Simulated consensus analysis - in reality, this would analyze actual responses
    if (responses.length > 0) {
      consensusPoints.push({
        topic: 'Primary Approach',
        statement: 'The panel agrees on the fundamental approach to addressing the issue',
        agreementLevel: 0.87,
        expertsInAgreement: experts.slice(0, Math.floor(experts.length * 0.87)).map(e => e.id),
        confidence: 0.85,
        supportingEvidence: [
          'Clinical evidence supports this approach',
          'Regulatory precedent exists',
          'Risk-benefit analysis favorable'
        ]
      });

      if (experts.length > 3) {
        consensusPoints.push({
          topic: 'Implementation Strategy',
          statement: 'Phased implementation approach is recommended',
          agreementLevel: 0.75,
          expertsInAgreement: experts.slice(0, Math.floor(experts.length * 0.75)).map(e => e.id),
          confidence: 0.78,
          supportingEvidence: [
            'Reduces implementation risk',
            'Allows for iterative improvements',
            'Enables early feedback incorporation'
          ]
        });
      }
    }

    return consensusPoints;
  }

  private analyzeDivergence(responses: unknown[], experts: ExpertAgent[]): DivergencePoint[] {
    const divergencePoints: DivergencePoint[] = [];

    if (experts.length > 2) {
      // Simulated divergence analysis

        e.expertise.primary.some(p => p.toLowerCase().includes('regulatory'))
      );

        e.expertise.primary.some(p => p.toLowerCase().includes('clinical'))
      );

      if (regulatoryExperts.length > 0 && clinicalExperts.length > 0) {
        divergencePoints.push({
          topic: 'Timeline Expectations',
          issue: 'Disagreement on implementation timeline',
          perspectives: [
            {
              expert: regulatoryExperts[0],
              position: 'Conservative 18-month timeline',
              rationale: 'Regulatory approval processes require thorough documentation',
              evidence: ['FDA guidance timelines', 'Historical approval data']
            },
            {
              expert: clinicalExperts[0],
              position: 'Aggressive 12-month timeline',
              rationale: 'Patient need urgency and clinical data availability',
              evidence: ['Existing clinical evidence', 'Patient outcome data']
            }
          ],
          impactAssessment: 'Timeline differences could affect resource allocation and stakeholder expectations',
          resolutionPath: 'Recommend detailed project planning session to align on realistic milestones'
        });
      }
    }

    return divergencePoints;
  }

  private generateRecommendations(responses: unknown[]): Recommendation[] {
    return [
      {
        id: 'rec-1',
        title: 'Establish Cross-Functional Working Group',
        description: 'Form a dedicated team with representatives from each expert domain to ensure coordinated implementation',
        priority: 'high',
        timeline: '2 weeks',
        owner: 'Project Lead',
        dependencies: []
      },
      {
        id: 'rec-2',
        title: 'Develop Detailed Implementation Plan',
        description: 'Create comprehensive project plan addressing regulatory, clinical, and operational requirements',
        priority: 'high',
        timeline: '4 weeks',
        dependencies: ['rec-1']
      },
      {
        id: 'rec-3',
        title: 'Conduct Stakeholder Alignment Session',
        description: 'Present findings and recommendations to key stakeholders for approval and resource commitment',
        priority: 'medium',
        timeline: '6 weeks',
        dependencies: ['rec-2']
      }
    ];
  }

  private generateExecutiveSummary(
    consensus: ConsensusPoint[],
    divergence: DivergencePoint[],
    recommendations: Recommendation[],
    experts: ExpertAgent[]
  ): string {

    return `
**Expert Panel Session Summary**

A panel of ${expertCount} experts conducted a comprehensive review, resulting in ${consensusCount} areas of strong consensus and ${divergenceCount} points requiring further consideration.

**Key Consensus Areas:**
${consensus.map(c => `• ${c.statement} (${Math.round(c.agreementLevel * 100)}% agreement)`).join('\n')}

**Areas of Divergence:**
${divergence.length > 0
  ? divergence.map(d => `• ${d.issue} - requires alignment session`).join('\n')
  : '• No significant divergence identified'
}

**Immediate Actions:**
${highPriorityRecs} high-priority recommendations have been identified for immediate implementation.

**Overall Assessment:**
The panel demonstrates strong alignment on fundamental approach with tactical differences that can be resolved through structured follow-up sessions.
    `.trim();
  }

  private generateDeliverables(recommendations: Recommendation[], consensus: ConsensusPoint[]): Deliverable[] {
    return [
      {
        type: 'EXECUTIVE_SUMMARY',
        format: 'PDF',
        content: 'Comprehensive summary of expert panel findings and recommendations',
        metadata: {
          pageCount: 3,
          sections: ['Executive Summary', 'Consensus Analysis', 'Recommendations'],
          createdDate: new Date().toISOString()
        }
      },
      {
        type: 'ACTION_PLAN',
        format: 'XLSX',
        content: 'Detailed action plan with timelines, owners, and dependencies',
        metadata: {
          recommendationCount: recommendations.length,
          highPriorityActions: recommendations.filter(r => r.priority === 'high').length
        }
      }
    ];
  }

  private generateNextSteps(recommendations: Recommendation[]): NextStep[] {
    return recommendations.slice(0, 3).map((rec, index) => ({
      id: `next-${index + 1}`,
      description: rec.title,
      owner: rec.owner || 'Project Manager',
      deadline: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
      dependencies: rec.dependencies || [],
      status: 'pending' as const
    }));
  }
}

export class FacilitationEngine {
  async facilitatePhase(
    phase: string,
    experts: ExpertAgent[],
    context: SessionContext
  ): Promise<unknown> {

    return {
      synthesis,
      consensus: this.findConsensus(responses),
      divergence: this.findDivergence(responses),
      keyInsights: this.extractKeyInsights(responses)
    };
  }

  private async generateQuestions(phase: string, context: SessionContext): Promise<FacilitationQuestion[]> {
    // Generate contextual questions based on phase and context
    return [
      {
        id: `${phase}-q1`,
        text: `Based on your expertise, what are your thoughts on ${context.query}?`,
        type: 'open'
      }
    ];
  }

  private async collectResponses(experts: ExpertAgent[], questions: FacilitationQuestion[]): Promise<unknown[]> {
    // Simulate collecting responses from experts
    return experts.map(expert => ({
      expertId: expert.id,
      responses: questions.map(q => `Response from ${expert.name} to ${q.text}`)
    }));
  }

  private async synthesizePhase(responses: unknown[]): Promise<string> {
    return 'Phase synthesis based on expert responses';
  }

  private findConsensus(responses: unknown[]): unknown[] {
    return [];
  }

  private findDivergence(responses: unknown[]): unknown[] {
    return [];
  }

  private extractKeyInsights(responses: unknown[]): unknown[] {
    return [];
  }
}