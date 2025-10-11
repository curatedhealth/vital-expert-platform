/**
 * PRISM Prompt Loader for LangGraph Integration
 * Provides TypeScript-friendly access to PRISM prompt library
 */

import { PRISMPromptService, PRISMSuite, KnowledgeDomain, type PRISMPrompt } from '@/shared/services/prism/prism-prompt-service';

export interface AdvisoryBoardPromptConfig {
  mode: 'PARALLEL' | 'SEQUENTIAL' | 'SCRIPTED' | 'DEBATE' | 'FUNNEL' | 'SCENARIO';
  domain: KnowledgeDomain;
  useCase: string;
  personas: string[];
  context?: Record<string, string>;
}

export interface CompiledBoardPrompt {
  facilitatorPrompt: string;
  personaPrompts: Map<string, string>;
  synthesisPrompt: string;
  metadata: {
    suite: PRISMSuite;
    domain: KnowledgeDomain;
    mode: string;
  };
}

/**
 * PRISM Prompt Loader for Advisory Board orchestration
 */
export class PRISMPromptLoader {
  private prismService: PRISMPromptService;

  // Advisory Board orchestration prompt templates
  private readonly orchestrationTemplates = {
    PARALLEL: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Parallel Polling - Each expert responds independently

**Objectives**:
1. Ask the agenda question concisely and clearly
2. Collect independent expert opinions without cross-influence
3. Enforce evidence-based reasoning with citations
4. Note areas of uncertainty or data gaps

**Output Format**:
- 3-5 bullet takeaways per expert
- Confidence level (0-1) per response
- Evidence citations (Harvard style)
- Identified risks and assumptions

**Question**: {{question}}
**Context**: {{context}}`,

      persona: `Act as {{role}} on a pharmaceutical advisory board.

**Instructions**:
- Answer independently (≤200 words)
- Provide 1-3 citations (Harvard style: Author Year)
- State confidence level (0-1)
- List 1-2 risks/assumptions
- Request specific data if uncertain

**Compliance**:
- Follow GDPR/AI Act guidelines
- Avoid PHI/promotional claims
- Be precise and evidence-based

**Question**: {{question}}
**Context**: {{context}}
**Evidence Available**: {{evidence}}`,

      synthesis: `**Parallel Polling Synthesis**

**Expert Responses**:
{{responses}}

**Your Task**:
1. **Executive Summary** (≤120 words, bullets)
   - Key insights from all experts
   - Convergent themes

2. **Consensus Analysis**
   - Points of agreement (with % consensus)
   - Points of disagreement (note dissenting views)

3. **Evidence Assessment**
   - Strength of evidence cited
   - Data gaps identified by experts

4. **Risks & Assumptions**
   - Consolidated risk list
   - Critical assumptions flagged

5. **Recommended Next Steps**
   - What to test/validate
   - Data requests
   - Decision-useful actions`
    },

    SEQUENTIAL: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Sequential Roundtable - Each expert builds on prior responses

**Objectives**:
1. Maintain coherent discussion flow
2. Ensure each speaker references or critiques prior points
3. Add cumulative knowledge with each turn
4. Synthesize evolving consensus

**Rules for Speakers**:
- Must reference at least one prior speaker's point
- Add at least one new citation
- ≤200 words per turn
- Build on or challenge previous reasoning

**Question**: {{question}}
**Context**: {{context}}
**Speaking Order**: {{order}}`,

      persona: `Act as {{role}} on a pharmaceutical advisory board (Sequential Roundtable).

**Prior Discussion**:
{{prior_responses}}

**Your Task**:
- Reference or critique at least one prior point
- Add new evidence or perspective (1-3 citations)
- State confidence level (0-1)
- ≤200 words

**Question**: {{question}}
**Your Expertise**: {{expertise}}`,

      synthesis: `**Sequential Roundtable Synthesis**

**Discussion Thread**:
{{responses}}

**Your Task**:
1. **Discussion Evolution** (≤150 words)
   - How the discussion built over turns
   - Key pivots or refinements

2. **Final Consensus**
   - Convergence points with supporting experts
   - Remaining disagreements

3. **Evidence Quality**
   - Cumulative evidence strength
   - Most compelling citations

4. **Next Actions**
   - Priority recommendations
   - Open questions for follow-up`
    },

    SCRIPTED: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Scripted Interview - Structured question protocol

**Objectives**:
1. Cover all required topics systematically
2. Ensure completeness of coverage
3. Flag gaps for follow-up
4. Maintain timing discipline

**Interview Sections**:
{{sections}}

**Question**: {{question}}
**Context**: {{context}}`,

      persona: `Act as {{role}} on a pharmaceutical advisory board (Scripted Interview).

**Section**: {{section}}
**Probe Questions**:
{{probes}}

**Instructions**:
- Answer each probe systematically
- Provide evidence citations
- Note gaps in available data
- Confidence level per probe

**Context**: {{context}}`,

      synthesis: `**Scripted Interview Synthesis**

**Responses**:
{{responses}}

**Coverage Assessment**:
1. **Completeness Check**
   - All sections covered? (✓/✗)
   - Data gaps by section

2. **Key Findings** (≤120 words)
   - Most important insights per section

3. **Action Items**
   - Required follow-up probes
   - Data requests
   - Expert consultation needs`
    },

    DEBATE: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Free Debate - Dynamic cross-talk and challenge

**Objectives**:
1. Encourage constructive challenge of assumptions
2. Surface dissenting views
3. Test robustness of recommendations
4. Achieve convergence or clarify irreducible disagreements

**Rules**:
- ≤120 words per intervention
- Must cite evidence (≥1 per turn)
- Challenge assumptions explicitly
- Stop after {{max_rounds}} rounds or convergence ≥ {{threshold}}

**Topic**: {{topic}}
**Initial Positions**: {{positions}}`,

      persona: `Act as {{role}} on a pharmaceutical advisory board (Free Debate).

**Debate Topic**: {{topic}}
**Current Discussion**:
{{current_thread}}

**Your Task**:
- Challenge assumptions in prior arguments
- Provide counter-evidence or supporting evidence
- ≤120 words
- At least 1 citation

**Your Expertise**: {{expertise}}`,

      synthesis: `**Debate Synthesis**

**Debate Thread**:
{{responses}}

**Analysis**:
1. **Convergence Score**: {{score}} (0-1)

2. **Final Positions** (≤100 words)
   - Consensus view (if reached)
   - Dissenting positions with rationale

3. **Strongest Arguments**
   - Best-supported position
   - Quality of evidence

4. **Resolution Recommendation**
   - Path forward given current state
   - Additional data needed for resolution`
    },

    FUNNEL: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Funnel & Filter - Generate broad, then narrow systematically

**Phase 1 - Generate**: Parallel generation of 10-15 options
**Phase 2 - Cluster**: Group into 3-5 themes
**Phase 3 - Stress-Test**: 3-expert roundtable per theme

**Current Phase**: {{phase}}
**Question**: {{question}}
**Context**: {{context}}`,

      persona: `Act as {{role}} on a pharmaceutical advisory board (Funnel & Filter - {{phase}}).

**Phase 1 - Generate** (if phase=generate):
- Generate 3-5 diverse options/approaches
- Brief rationale per option (1-2 sentences)
- Evidence level per option

**Phase 3 - Stress-Test** (if phase=test):
- Test assigned theme: {{theme}}
- Identify weaknesses and risks
- Assess feasibility and evidence

**Context**: {{context}}`,

      synthesis: `**Funnel & Filter Synthesis**

**Phase Outputs**:
{{outputs}}

**Final Recommendation** (after all phases):
1. **Top Themes** (3-5 themes)
   - Theme name and rationale
   - Supporting options

2. **Stress-Test Results**
   - Highest-ranked theme(s)
   - Risk assessment per theme

3. **Recommended Path**
   - Priority theme with justification
   - Implementation considerations
   - Risk mitigation for top choice`
    },

    SCENARIO: {
      facilitator: `You are the neutral facilitator of a pharmaceutical advisory board.

**Mode**: Scenario Simulation - Future state exploration

**Scenario**: {{scenario_name}}
**Timeframe**: {{timeframe}}
**Assumptions**: {{assumptions}}

**Objectives**:
1. Role-play stakeholder perspectives in scenario
2. Identify early warning indicators
3. Define no-regret actions
4. Stress-test strategies

**Roles**: {{roles}}
**Question**: {{question}}`,

      persona: `Act as {{role}} in a scenario simulation for a pharmaceutical advisory board.

**Scenario**: {{scenario_name}}
**Your Role**: {{role}}
**Assumptions**: {{assumptions}}

**Your Task**:
- Respond from your stakeholder perspective
- Identify 3 Early Warning Indicators (EWIs)
- Suggest 3 no-regret actions
- Assess strategic implications

**Context**: {{context}}`,

      synthesis: `**Scenario Simulation Synthesis**

**Scenario**: {{scenario}}
**Stakeholder Responses**:
{{responses}}

**Analysis**:
1. **Early Warning Indicators** (top 5)
   - Consolidated EWIs from all stakeholders
   - Trigger thresholds

2. **No-Regret Actions** (top 3)
   - Actions valuable regardless of scenario
   - Rationale and stakeholder consensus

3. **Strategic Implications**
   - High-impact risks
   - Opportunity areas
   - Preparedness recommendations`
    }
  };

  constructor() {
    this.prismService = new PRISMPromptService();
  }

  /**
   * Load and compile prompts for advisory board session
   */
  async loadBoardPrompts(config: AdvisoryBoardPromptConfig): Promise<CompiledBoardPrompt> {
    // Get optimal PRISM prompt for the use case
    const prismPrompt = await this.prismService.selectOptimalPrompt(
      config.useCase,
      JSON.stringify(config.context || {}),
      {
        domain: config.domain,
        query: config.useCase,
        complexityLevel: 'advanced'
      }
    );

    // Get orchestration templates for mode
    const modeTemplate = this.orchestrationTemplates[config.mode];

    // Compile facilitator prompt
    const facilitatorPrompt = this.replacePlaceholders(
      modeTemplate.facilitator,
      {
        question: config.useCase,
        context: JSON.stringify(config.context || {}),
        order: config.personas.join(', '),
        ...config.context
      }
    );

    // Compile persona prompts
    const personaPrompts = new Map<string, string>();
    for (const persona of config.personas) {
      const personaPrompt = this.replacePlaceholders(
        modeTemplate.persona,
        {
          role: persona,
          question: config.useCase,
          context: JSON.stringify(config.context || {}),
          expertise: this.getPersonaExpertise(persona),
          evidence: '(RAG retrieval placeholder)',
          ...config.context
        }
      );
      personaPrompts.set(persona, personaPrompt);
    }

    // Compile synthesis prompt
    const synthesisPrompt = this.replacePlaceholders(
      modeTemplate.synthesis,
      {
        responses: '{{responses}}', // Will be filled at runtime
        ...config.context
      }
    );

    return {
      facilitatorPrompt,
      personaPrompts,
      synthesisPrompt,
      metadata: {
        suite: prismPrompt?.prismSuite || 'BRIDGE',
        domain: config.domain,
        mode: config.mode
      }
    };
  }

  /**
   * Get PRISM prompt by suite and use case
   */
  async getPRISMPrompt(suite: PRISMSuite, useCase: string): Promise<PRISMPrompt | null> {
    const prompts = await this.prismService.getPRISMPrompts({
      prismSuite: suite,
      query: useCase
    });

    return prompts.length > 0 ? prompts[0] : null;
  }

  /**
   * Replace template placeholders with actual values
   */
  private replacePlaceholders(template: string, values: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(values)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }

    return result;
  }

  /**
   * Get expertise description for persona
   */
  private getPersonaExpertise(persona: string): string {
    const expertiseMap: Record<string, string> = {
      'KOL': 'Clinical endpoints, unmet needs, subgroup biology, safety signals',
      'Biostatistician': 'Power analysis, multiplicity, estimands, sensitivity analysis',
      'Payer': 'Cost-effectiveness, comparators, budget impact, equity',
      'Regulator': 'Benefit-risk assessment, precedent labels, post-marketing commitments',
      'Patient Advocate': 'Quality of life, adherence burden, access barriers',
      'Market Access': 'Pricing corridors, contracting levers, launch sequencing',
      'Ethics': 'Consent models, data minimization, bias/fairness checks'
    };

    return expertiseMap[persona] || 'Domain expertise';
  }
}

// Export singleton instance
export const prismLoader = new PRISMPromptLoader();
