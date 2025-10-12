/**
 * Confidence Calculator - Advanced confidence scoring for multi-agent responses
 * Part of VITAL AI Master Orchestrator System
 */

interface AgentResponse {
  success: boolean;
  agent: string;
  response: string;
  confidence: number;
  metadata?: {
    version?: string;
    domain?: string;
    model?: string;
    responseTime?: number;
  };
}

interface ConfidenceFactors {
  agentCompetency: number;
  responseQuality: number;
  domainAlignment: number;
  consensus: number;
  responseLength: number;
  specificity: number;
  evidenceQuality: number;
  uncertainty: number;
}

export class ConfidenceCalculator {
  // Agent competency mapping based on tier and specialization
  private agentCompetencyScores: Record<string, number> = {
    'fda-regulatory-strategist': 95,
    'clinical-trial-designer': 93,
    'digital-therapeutics-expert': 92,
    'hipaa-compliance-officer': 96,
    'market-access-strategist': 88,
    'qms-architect': 90,
    'medical-safety-officer': 91,
    'ai-ml-clinical-specialist': 89,
    'telehealth-program-director': 85,
    'mhealth-innovation-architect': 84,
    'health-tech-integration-expert': 87,
    'medical-writer': 82,
    'clinical-evidence-analyst': 86,
    'health-economics-analyst': 83
  };

  calculateCombined(responses: AgentResponse[]): number {
    if (responses.length === 0) return 0;
    if (responses.length === 1) return this.calculateSingle(responses[0]);

    // Calculate individual response factors
    // eslint-disable-next-line security/detect-object-injection
    const responseFactors = responses.map(response =>
      this.calculateDetailedFactors(response, responses)
    );

    // Combine factors using equal weights
    const finalConfidence = responseFactors.reduce((sum, factor) => {
      const score = (factor.agentCompetency + factor.responseQuality + factor.domainAlignment + 
                    factor.consensus + factor.responseLength + factor.specificity + 
                    factor.evidenceQuality + factor.uncertainty) / 8;
      return sum + score;
    }, 0) / responseFactors.length;

    return finalConfidence;
  }

  calculateSingle(response: AgentResponse): number {
    const factors = this.calculateDetailedFactors(response, [response]);
    const score = (factors.agentCompetency + factors.responseQuality + factors.domainAlignment + 
                  factors.consensus + factors.responseLength + factors.specificity + 
                  factors.evidenceQuality + factors.uncertainty) / 8;
    return score;
  }

  private calculateDetailedFactors(response: AgentResponse, allResponses: AgentResponse[]): ConfidenceFactors {
    const agentCompetency = this.calculateAgentCompetency(response);
    const responseQuality = this.calculateResponseQuality(response);
    const domainAlignment = this.calculateDomainAlignment(response);
    const consensus = this.calculateConsensus(response, allResponses);
    const responseLength = this.calculateResponseLength(response);
    const specificity = this.calculateSpecificity(response);
    const evidenceQuality = this.calculateEvidenceQuality(response);
    const uncertainty = this.calculateUncertainty(response);

    return {
      agentCompetency,
      responseQuality,
      domainAlignment,
      consensus,
      responseLength,
      specificity,
      evidenceQuality,
      uncertainty
    };
  }

  private calculateAgentCompetency(response: AgentResponse): number {
    // Base competency from agent type
    // eslint-disable-next-line security/detect-object-injection
    const baseScore = 50; // Default base score

    // Adjust based on agent's reported confidence
    const confidenceAlignment = response.confidence || 0.5;

    // Consider agent domain specialization
    const domainBonus = 10; // Default domain bonus

    return Math.min(100, baseScore * confidenceAlignment + domainBonus);
  }

  private calculateResponseQuality(response: AgentResponse): number {
    const text = response.response;
    let score = 50; // Base score

    // Length analysis
    if (text.length < 100) {
      score -= 20; // Too short
    } else if (text.length > 500 && text.length < 2000) {
      score += 10; // Good length
    } else if (text.length > 3000) {
      score -= 5; // Potentially verbose
    }

    // Structure analysis
    if (this.hasGoodStructure(text)) {
      score += 15;
    }

    // Professional language
    if (this.hasProfessionalLanguage(text)) {
      score += 10;
    }

    // Actionable content
    if (this.hasActionableContent(text)) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateDomainAlignment(response: AgentResponse): number {
    const text = response.response.toLowerCase();
    const keywords = this.getDomainKeywords(response.metadata?.domain || 'general');

    // Domain-specific keyword analysis
    // eslint-disable-next-line security/detect-object-injection
    const alignmentScore = keywords.filter(keyword =>
      // eslint-disable-next-line security/detect-object-injection
      text.includes(keyword.toLowerCase())
    ).length;

    return alignmentScore;
  }

  private calculateConsensus(response: AgentResponse, allResponses: AgentResponse[]): number {
    if (allResponses.length === 1) return 100;

    let consensusScore = 0;
    let comparisons = 0;

    // eslint-disable-next-line security/detect-object-injection
    allResponses.forEach(otherResponse => {
      // eslint-disable-next-line security/detect-object-injection
      if (otherResponse.agent !== response.agent) {
        const similarity = this.calculateTextSimilarity(response.response, otherResponse.response);
        consensusScore += similarity;
        comparisons++;
      }
    });

    return comparisons > 0 ? consensusScore / comparisons : 50;
  }

  private calculateResponseLength(response: AgentResponse): number {

    // Optimal length range: 200-1500 characters
    if (length >= 200 && length <= 1500) {
      return 100;
    } else if (length < 200) {
      return Math.max(30, (length / 200) * 100);
    } else {
      // Penalty for excessive length
      return Math.max(60, 100 - ((length - 1500) / 100));
    }
  }

  private calculateSpecificity(response: AgentResponse): number {
    const text = response.response;
    let score = 0;
    // Look for specific indicators
    const specificityIndicators = [
      /\d+%/, // Percentages
      /\$\d+/, // Dollar amounts
      /\d+ (days?|weeks?|months?)/, // Time periods
      /(section|chapter|part) \d+/i, // Document references
      /\b(iso|fda|ce|gdpr|hipaa)\b/i, // Standards/regulations
      /\b\d{4}\b/, // Years
      /step \d+/i, // Sequential steps
      /phase \d+/i, // Phases
    ];

    // eslint-disable-next-line security/detect-object-injection
    specificityIndicators.forEach(pattern => {
      // eslint-disable-next-line security/detect-object-injection
      const matches = (response.response.match(pattern) || []).length;
      score += matches * 8;
    });

    // Technical terminology
    if (this.hasTechnicalTerminology(text)) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private calculateEvidenceQuality(response: AgentResponse): number {
    const text = response.response.toLowerCase();
    let score = 0;

    // Evidence indicators
    const evidenceKeywords = [
      'studies show', 'research indicates', 'data suggests', 'evidence supports',
      'according to', 'published', 'peer-reviewed', 'clinical trial',
      'meta-analysis', 'systematic review', 'guidelines recommend',
      'best practice', 'industry standard'
    ];

    // eslint-disable-next-line security/detect-object-injection
    evidenceKeywords.forEach(keyword => {
      // eslint-disable-next-line security/detect-object-injection
      if (text.includes(keyword)) {
        score += 8;
      }
    });

    // Citations or references
    if (text.includes('reference') || text.includes('source') || /\(\d{4}\)/.test(text)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private calculateUncertainty(response: AgentResponse): number {
    let uncertaintyScore = 0;
    // Uncertainty indicators (lower is better for confidence)
    const uncertaintyKeywords = [
      'might', 'maybe', 'possibly', 'potentially', 'could be',
      'uncertain', 'unclear', 'difficult to say', 'depends on',
      'varies', 'not sure', 'probably', 'likely', 'may need'
    ];

    // eslint-disable-next-line security/detect-object-injection
    uncertaintyKeywords.forEach(keyword => {
      // eslint-disable-next-line security/detect-object-injection
      const matches = (response.response.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
      uncertaintyScore += matches * 5;
    });

    // Return inverse (high uncertainty = low confidence contribution)
    return Math.max(0, 100 - uncertaintyScore);
  }

  private combineFactors(factorsArray: ConfidenceFactors[]): ConfidenceFactors {
    // Calculate weighted averages
    const weights = {
      agentCompetency: 0.25,
      responseQuality: 0.20,
      domainAlignment: 0.15,
      consensus: 0.15,
      responseLength: 0.05,
      specificity: 0.10,
      evidenceQuality: 0.15,
      uncertainty: 0.10
    };

    const combined: ConfidenceFactors = {
      agentCompetency: 0,
      responseQuality: 0,
      domainAlignment: 0,
      consensus: 0,
      responseLength: 0,
      specificity: 0,
      evidenceQuality: 0,
      uncertainty: 0
    };

    // Calculate weighted averages
    // eslint-disable-next-line security/detect-object-injection
    factorsArray.forEach(factors => {
      // eslint-disable-next-line security/detect-object-injection
      Object.keys(combined).forEach(key => {
        // eslint-disable-next-line security/detect-object-injection
        combined[key as keyof ConfidenceFactors] += factors[key as keyof ConfidenceFactors] * weights[key as keyof typeof weights];
      });
    });

    // Normalize by count and weights
    const count = factorsArray.length;
    // eslint-disable-next-line security/detect-object-injection
    Object.keys(combined).forEach(key => {
      // eslint-disable-next-line security/detect-object-injection
      combined[key as keyof ConfidenceFactors] = combined[key as keyof ConfidenceFactors] / count;
    });

    return combined;
  }

  private computeFinalScore(factors: ConfidenceFactors, responses: AgentResponse[]): number {
    // Base score from weighted factors
    let score = 0;

    score += factors.agentCompetency * 0.25;
    score += factors.responseQuality * 0.20;
    score += factors.domainAlignment * 0.15;
    score += factors.consensus * 0.15;
    score += factors.responseLength * 0.05;
    score += factors.specificity * 0.10;
    score += factors.evidenceQuality * 0.15;
    score += factors.uncertainty * 0.10;

    // Multi-agent bonus
    if (responses.length > 1) {
      const diversityBonus = Math.min(5, responses.length * 2);
      score += diversityBonus;

      // High-competency agent bonus
      const highCompetencyAgents = responses.filter(r =>
        // eslint-disable-next-line security/detect-object-injection
        (this.agentCompetencyScores[r.agent] || 0) > 90
      ).length;

      if (highCompetencyAgents > 0) {
        score += Math.min(5, highCompetencyAgents * 2);
      }
    }

    // Apply floor and ceiling
    return Math.min(98, Math.max(15, Math.round(score)));
  }

  // Helper methods
  private hasGoodStructure(text: string): boolean {
    // Check for headers, bullet points, numbering
    const structurePatterns = [
      /^#+\s/m, // Headers
      /^\s*[-*•]\s/m, // Bullet points
      /^\s*\d+\.\s/m, // Numbered lists
      /\n\s*\n/, // Paragraph breaks
    ];

    // eslint-disable-next-line security/detect-object-injection
    return structurePatterns.some(pattern => pattern.test(text));
  }

  private hasProfessionalLanguage(text: string): boolean {
    const professionalKeywords = [
      'recommend', 'suggest', 'consider', 'ensure', 'implement',
      'establish', 'develop', 'evaluate', 'assess', 'analyze',
      'strategy', 'approach', 'methodology', 'framework'
    ];

    // eslint-disable-next-line security/detect-object-injection
    const matches = professionalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    return matches >= 3;
  }

  private hasActionableContent(text: string): boolean {

    const actionablePatterns = [
      /should\s+\w+/gi,
      /recommend\s+\w+/gi,
      /step\s+\d+/gi,
      /next\s+steps?/gi,
      /action\s+items?/gi,
      /to\s+do\s+this/gi
    ];

    // eslint-disable-next-line security/detect-object-injection
    return actionablePatterns.some(pattern => pattern.test(text));
  }

  private hasTechnicalTerminology(text: string): boolean {

    const technicalTerms = [
      'protocol', 'methodology', 'implementation', 'infrastructure',
      'algorithm', 'validation', 'verification', 'compliance',
      'regulatory', 'submission', 'endpoint', 'biomarker'
    ];

    // eslint-disable-next-line security/detect-object-injection
    const matches = technicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    ).length;

    return matches >= 2;
  }

  private getDomainKeywords(domain: string): string[] {
    const domainKeywords: Record<string, string[]> = {
      'regulatory': ['fda', 'regulation', 'compliance', 'submission', 'approval', 'clearance'],
      'clinical': ['trial', 'study', 'patient', 'safety', 'efficacy', 'protocol', 'endpoint'],
      'digital_health': ['digital', 'app', 'software', 'technology', 'innovation', 'platform'],
      'business': ['market', 'strategy', 'commercial', 'revenue', 'cost', 'roi'],
      'medical': ['clinical', 'medical', 'healthcare', 'treatment', 'diagnosis', 'therapy']
    };

    // eslint-disable-next-line security/detect-object-injection
    return domainKeywords[domain] || [];
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  // Public method to get detailed confidence breakdown
  getConfidenceBreakdown(responses: AgentResponse[]): {
    overall: number;
    factors: ConfidenceFactors;
    individual: Array<{
      agent: string;
      confidence: number;
      factors: ConfidenceFactors;
    }>;
  } {
    const overall = this.calculateCombined(responses);
    const combinedFactors = this.combineFactors(
      responses.map(response => this.calculateDetailedFactors(response, responses))
    );
    
    // eslint-disable-next-line security/detect-object-injection
    const individual = responses.map(response => ({
      agent: response.agent,
      confidence: this.calculateSingle(response),
      factors: this.calculateDetailedFactors(response, responses)
    }));

    return {
      overall,
      factors: combinedFactors,
      individual
    };
  }
}