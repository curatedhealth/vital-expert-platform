/**
 * Automatic Board Composer
 * AI-driven board composition based on query analysis
 * Implements Guide Section 3.2: Automatic Board Composition
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface BoardRequirements {
  domain: string;  // clinical, regulatory, market_access, etc.
  complexity: 'low' | 'medium' | 'high';
  stakeholders: string[];
  expertiseAreas: string[];
  suggestedBoardSize: number;
  recommendedFormat: 'structured' | 'debate' | 'parallel' | 'funnel';
}

export interface BoardMemberConfig {
  persona: string;
  role: 'chair' | 'expert' | 'moderator';
  votingWeight: number;
  expertise: string[];
  rationale: string;
}

export interface ComposedBoard {
  name: string;
  members: BoardMemberConfig[];
  requirements: BoardRequirements;
  confidence: number;
}

/**
 * Available agent pool (from existing system)
 */
const AVAILABLE_AGENTS = [
  {
    name: 'Clinical Research Director',
    expertise: ['clinical_trials', 'protocol_design', 'medical_research', 'patient_safety'],
    domains: ['clinical', 'regulatory'],
    suitableRoles: ['chair', 'expert']
  },
  {
    name: 'FDA Regulatory Expert',
    expertise: ['FDA_submissions', 'regulatory_compliance', '510k', 'PMA', 'IND'],
    domains: ['regulatory'],
    suitableRoles: ['expert', 'chair']
  },
  {
    name: 'Market Access Strategist',
    expertise: ['payer_negotiations', 'reimbursement', 'pricing_strategy', 'value_proposition'],
    domains: ['market_access', 'commercial'],
    suitableRoles: ['expert']
  },
  {
    name: 'Health Economics Analyst',
    expertise: ['cost_effectiveness', 'QALY', 'budget_impact', 'pharmacoeconomics'],
    domains: ['market_access', 'health_economics'],
    suitableRoles: ['expert']
  },
  {
    name: 'Patient Advocacy Representative',
    expertise: ['patient_needs', 'accessibility', 'adherence', 'patient_engagement'],
    domains: ['clinical', 'market_access'],
    suitableRoles: ['expert']
  },
  {
    name: 'Data Scientist',
    expertise: ['real_world_evidence', 'statistical_analysis', 'machine_learning', 'data_modeling'],
    domains: ['clinical', 'regulatory', 'market_access'],
    suitableRoles: ['expert']
  },
  {
    name: 'Biostatistician',
    expertise: ['clinical_trial_statistics', 'sample_size', 'endpoints', 'statistical_methods'],
    domains: ['clinical', 'regulatory'],
    suitableRoles: ['expert']
  },
  {
    name: 'Medical Affairs Director',
    expertise: ['medical_strategy', 'KOL_engagement', 'scientific_communication', 'publications'],
    domains: ['clinical', 'commercial'],
    suitableRoles: ['expert', 'chair']
  },
  {
    name: 'Compliance Officer',
    expertise: ['compliance_monitoring', 'GDPR', 'HIPAA', 'ethical_review'],
    domains: ['regulatory', 'legal'],
    suitableRoles: ['expert']
  },
  {
    name: 'Digital Health Specialist',
    expertise: ['digital_therapeutics', 'SaMD', 'mobile_health', 'telehealth'],
    domains: ['digital_health', 'regulatory'],
    suitableRoles: ['expert']
  }
];

export class AutomaticBoardComposer {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3  // Lower temperature for more consistent analysis
    });
  }

  /**
   * Main entry point: Analyze question and compose board
   */
  async composeBoard(question: string): Promise<ComposedBoard> {
    // Step 1: Analyze the question to extract requirements
    const requirements = await this.analyzeTopic(question);

    // Step 2: Match requirements to available agents
    const members = await this.selectBoardMembers(requirements);

    // Step 3: Assign roles and weights
    const configuredMembers = this.assignRolesAndWeights(members, requirements);

    // Step 4: Generate board name
    const boardName = this.generateBoardName(requirements);

    return {
      name: boardName,
      members: configuredMembers,
      requirements,
      confidence: 0.85
    };
  }

  /**
   * Step 1: Analyze topic to extract requirements
   */
  private async analyzeTopic(question: string): Promise<BoardRequirements> {
    const analysisPrompt = `Analyze the following pharmaceutical/healthcare question and extract key requirements for assembling an advisory board:

Question: "${question}"

Provide your analysis in the following JSON format:
{
  "domain": "primary domain (clinical|regulatory|market_access|digital_health|commercial)",
  "complexity": "low|medium|high",
  "stakeholders": ["list of stakeholder types involved"],
  "expertiseAreas": ["specific expertise areas needed"],
  "suggestedBoardSize": number (5-7),
  "recommendedFormat": "structured|debate|parallel|funnel"
}

Consider:
- Technical complexity of the question
- Regulatory implications
- Market access considerations
- Clinical evidence needs
- Stakeholder perspectives required

Respond with only the JSON object.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage('You are an expert in pharmaceutical advisory board composition.'),
        new HumanMessage(analysisPrompt)
      ]);

      const analysisText = response.content.toString();

      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from LLM response');
      }

      const requirements: BoardRequirements = JSON.parse(jsonMatch[0]);

      return requirements;
    } catch (error) {
      console.error('Error analyzing topic:', error);

      // Fallback to default requirements
      return {
        domain: 'clinical',
        complexity: 'medium',
        stakeholders: ['clinicians', 'regulators', 'patients'],
        expertiseAreas: ['clinical_research', 'regulatory_compliance'],
        suggestedBoardSize: 5,
        recommendedFormat: 'structured'
      };
    }
  }

  /**
   * Step 2: Select board members based on requirements
   */
  private async selectBoardMembers(requirements: BoardRequirements): Promise<typeof AVAILABLE_AGENTS> {
    const candidates = AVAILABLE_AGENTS.filter(agent => {
      // Check if agent's domain matches requirements
      const domainMatch = agent.domains.includes(requirements.domain);

      // Check if agent has required expertise
      const expertiseMatch = requirements.expertiseAreas.some(area =>
        agent.expertise.some(exp =>
          exp.toLowerCase().includes(area.toLowerCase()) ||
          area.toLowerCase().includes(exp.toLowerCase())
        )
      );

      return domainMatch || expertiseMatch;
    });

    // Score candidates by relevance
    const scoredCandidates = candidates.map(agent => {
      let score = 0;

      // Domain match score
      if (agent.domains.includes(requirements.domain)) {
        score += 3;
      }

      // Expertise match score
      requirements.expertiseAreas.forEach(area => {
        if (agent.expertise.some(exp => exp.toLowerCase().includes(area.toLowerCase()))) {
          score += 2;
        }
      });

      return { agent, score };
    });

    // Sort by score and select top N
    const selectedAgents = scoredCandidates
      .sort((a, b) => b.score - a.score)
      .slice(0, requirements.suggestedBoardSize)
      .map(item => item.agent);

    return selectedAgents;
  }

  /**
   * Step 3: Assign roles and voting weights
   */
  private assignRolesAndWeights(
    members: typeof AVAILABLE_AGENTS,
    requirements: BoardRequirements
  ): BoardMemberConfig[] {
    const configs: BoardMemberConfig[] = [];

    // First member is typically the chair
    if (members.length > 0 && members[0].suitableRoles.includes('chair')) {
      configs.push({
        persona: members[0].name,
        role: 'chair',
        votingWeight: 1.5,  // Chair has elevated weight
        expertise: members[0].expertise,
        rationale: 'Selected as chair due to broad domain expertise and leadership capability'
      });
    }

    // Assign remaining members as experts
    for (let i = 1; i < members.length; i++) {
      const member = members[i];

      // Higher weight for critical expertise areas
      const weight = this.calculateVotingWeight(member, requirements);

      configs.push({
        persona: member.name,
        role: 'expert',
        votingWeight: weight,
        expertise: member.expertise,
        rationale: `Selected for expertise in ${member.expertise.slice(0, 2).join(', ')}`
      });
    }

    return configs;
  }

  /**
   * Calculate voting weight based on expertise relevance
   */
  private calculateVotingWeight(
    member: typeof AVAILABLE_AGENTS[0],
    requirements: BoardRequirements
  ): number {
    let weight = 1.0;  // Base weight

    // Increase weight for critical expertise areas
    const criticalExpertise = requirements.expertiseAreas.filter(area =>
      member.expertise.some(exp => exp.toLowerCase().includes(area.toLowerCase()))
    );

    if (criticalExpertise.length > 0) {
      weight += 0.2;  // +0.2 per critical expertise match
    }

    // Adjust for complexity
    if (requirements.complexity === 'high') {
      weight += 0.1;  // Slightly higher weights for complex topics
    }

    // Cap at 1.5 (except chair)
    return Math.min(weight, 1.5);
  }

  /**
   * Generate board name from requirements
   */
  private generateBoardName(requirements: BoardRequirements): string {
    const domainNames: Record<string, string> = {
      clinical: 'Clinical Advisory',
      regulatory: 'Regulatory Strategy',
      market_access: 'Market Access',
      digital_health: 'Digital Health Innovation',
      commercial: 'Commercial Strategy'
    };

    const baseName = domainNames[requirements.domain] || 'Expert Advisory';
    return `${baseName} Board`;
  }

  /**
   * Get recommendations for board improvements
   */
  async suggestBoardImprovements(
    currentBoard: BoardMemberConfig[],
    sessionTranscript: string
  ): Promise<string[]> {
    const improvementPrompt = `Based on this board composition and session transcript, suggest improvements:

Current Board:
${currentBoard.map(m => `- ${m.persona} (${m.role}): ${m.expertise.join(', ')}`).join('\n')}

Session Excerpt:
${sessionTranscript.slice(0, 1000)}...

What expertise gaps or improvements do you recommend?`;

    const response = await this.llm.invoke([
      new SystemMessage('You are an expert in optimizing advisory board composition.'),
      new HumanMessage(improvementPrompt)
    ]);

    const suggestions = response.content.toString().split('\n').filter(line => line.trim());
    return suggestions;
  }
}

// Export singleton instance
export const automaticBoardComposer = new AutomaticBoardComposer();
