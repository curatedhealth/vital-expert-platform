/**
 * Persona Agent Runner Service
 * Executes persona prompts with citation-required enforcement
 * Based on LangGraph Implementation Guide for Pharma
 */

import { EvidenceSource } from './evidence-pack-builder';

export interface AgentReply {
  agentId: string;
  persona: string;
  answer: string;
  citations: EvidenceSource[];
  confidence: number; // 0-1
  flags: string[];
  reasoning?: string;
}

export interface PersonaPromptParams {
  persona: string;
  question: string;
  evidenceSummary: string;
  agentId?: string;
}

/**
 * Citation enforcement decorator
 * Validates that response includes at least one citation
 */
function requireCitations(response: string): boolean {
  // Check for Harvard-style citations: (Author Year) or [1]
  const citationPatterns = [
    /\([A-Z][a-z]+\s+\d{4}\)/,  // (Smith 2024)
    /\[\d+\]/,                   // [1]
    /\([A-Z]+\s+\d{4}\)/         // (EMA 2024)
  ];

  return citationPatterns.some(pattern => pattern.test(response));
}

/**
 * Extract confidence score from response
 */
function extractConfidence(response: string): number {
  const match = response.match(/confidence[:\s]+([0-9.]+)/i);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0.7; // Default moderate confidence
}

/**
 * Extract flags/warnings from response
 */
function extractFlags(response: string): string[] {
  const flags: string[] = [];

  if (response.toLowerCase().includes('needs human review')) {
    flags.push('Needs Human Review');
  }
  if (response.toLowerCase().includes('data ambiguity') ||
      response.toLowerCase().includes('insufficient evidence')) {
    flags.push('Data Ambiguity');
  }
  if (response.toLowerCase().includes('assumption')) {
    flags.push('Contains Assumptions');
  }

  return flags;
}

/**
 * Persona role prompt template
 */
const PERSONA_PROMPT_TEMPLATE = `You are {role} for a pharmaceutical advisory board.

Answer the QUESTION concisely (≤200 words). You MUST include 1-3 Harvard-style citations in parentheses (e.g., (EMA 2025) or (Smith 2024)). List 1-2 risks or assumptions.

If evidence is insufficient, explicitly say so and request specific data.

QUESTION: {question}

EVIDENCE (structured):
{evidence_summary}

Constraints:
- Comply with GDPR/AI Act
- Avoid PHI/PII
- Mark uncertainties clearly
- State your confidence level (0-1)

Format your response as:
Answer: [your answer with citations]
Confidence: [0-1]
Risks/Assumptions: [list]
`;

export class PersonaAgentRunner {
  /**
   * Execute persona agent with citation enforcement
   */
  async runPersona(params: PersonaPromptParams): Promise<AgentReply> {
    const { persona, question, evidenceSummary, agentId } = params;

    // Build prompt
    const prompt = PERSONA_PROMPT_TEMPLATE
      .replace('{role}', persona)
      .replace('{question}', question)
      .replace('{evidence_summary}', evidenceSummary);

    // In production, this would call LLM
    // For now, return mock response
    const mockResponse = this.generateMockResponse(persona, question);

    // Enforce citations
    if (!requireCitations(mockResponse)) {
      throw new Error(`Citation required for ${persona} response. Response must include at least one Harvard-style citation.`);
    }

    // Parse response
    const confidence = extractConfidence(mockResponse);
    const flags = extractFlags(mockResponse);

    return {
      agentId: agentId || 'mock-agent',
      persona,
      answer: mockResponse,
      citations: [], // Would be extracted from evidence sources
      confidence,
      flags
    };
  }

  /**
   * Generate mock response for testing
   * In production, this would be replaced with actual LLM call
   */
  private generateMockResponse(persona: string, question: string): string {
    return `Based on the evidence provided, the ${persona.toLowerCase()} perspective suggests that ${question.slice(0, 50)}... requires careful consideration of regulatory precedents (EMA 2024) and clinical trial design principles (ICH 2023).

Key considerations include:
1. Regulatory alignment with established guidelines
2. Patient safety monitoring protocols
3. Statistical power and endpoint selection

Confidence: 0.75

Risks/Assumptions:
- Assumes current regulatory framework remains stable
- Limited long-term safety data available`;
  }

  /**
   * Run multiple personas in parallel
   */
  async runParallel(
    personas: string[],
    question: string,
    evidenceSummary: string
  ): Promise<AgentReply[]> {
    const promises = personas.map(persona =>
      this.runPersona({ persona, question, evidenceSummary })
    );

    return Promise.all(promises);
  }

  /**
   * Run personas sequentially, building on prior responses
   */
  async runSequential(
    personas: string[],
    question: string,
    evidenceSummary: string
  ): Promise<AgentReply[]> {
    const replies: AgentReply[] = [];

    for (const persona of personas) {
      // Build context from previous replies
      const priorContext = replies.length > 0
        ? `\n\nPrevious expert responses:\n${replies.map((r: any) => `${r.persona}: ${r.answer.slice(0, 100)}...`).join('\n')}`
        : '';

      const enhancedEvidence = evidenceSummary + priorContext;

      const reply = await this.runPersona({
        persona,
        question,
        evidenceSummary: enhancedEvidence
      });

      replies.push(reply);
    }

    return replies;
  }
}

// Singleton instance
export const personaAgentRunner = new PersonaAgentRunner();
