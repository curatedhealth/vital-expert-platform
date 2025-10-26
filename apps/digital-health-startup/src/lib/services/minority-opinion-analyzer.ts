/**
 * Minority Opinion Analyzer
 * Detects and preserves valuable dissenting opinions in advisory board discussions
 * Critical for healthcare decisions where minority voices often identify crucial risks
 */

export interface MinorityPosition {
  expertName: string;
  position: string;
  reasoning: string;
  supportLevel: number; // 0-1, percentage of board supporting this view
  confidence: number; // Expert's confidence in their position
  valueScore: number; // Assessed value of this minority opinion (0-1)
  riskIfIgnored: string;
  recommendation: string;
  isHighValue: boolean;
}

export interface MinorityAnalysisResult {
  minorityPositions: MinorityPosition[];
  hasHighValueDissent: boolean;
  dissentThemes: string[];
  recommendedActions: string[];
}

export interface AgentReply {
  persona: string;
  message: string;
  confidence: number;
  reasoning?: string;
}

export class MinorityOpinionAnalyzer {
  private minorityThreshold: number = 0.3; // Opinions supported by < 30% are minority
  private highValueThreshold: number = 0.7; // Value score > 0.7 is high-value dissent

  /**
   * Analyze board responses to identify and assess minority opinions
   */
  public analyzeMinorityOpinions(
    replies: AgentReply[],
    question: string
  ): MinorityAnalysisResult {
    if (replies.length === 0) {
      return this.emptyResult();
    }

    // Group similar positions
    const positionGroups = this.groupSimilarPositions(replies);

    // Identify minority positions (< threshold support)
    const minorityPositions: MinorityPosition[] = [];

    for (const [position, supporting] of positionGroups.entries()) {
      const supportLevel = supporting.length / replies.length;

      if (supportLevel < this.minorityThreshold && supportLevel > 0) {
        // This is a minority position
        for (const reply of supporting) {
          const valueScore = this.assessMinorityValue(
            reply,
            supportLevel,
            replies,
            question
          );

          minorityPositions.push({
            expertName: reply.persona,
            position,
            reasoning: reply.reasoning || reply.message,
            supportLevel,
            confidence: reply.confidence,
            valueScore,
            riskIfIgnored: this.identifyRiskIfIgnored(reply, question),
            recommendation: this.generateRecommendation(reply, valueScore),
            isHighValue: valueScore >= this.highValueThreshold
          });
        }
      }
    }

    // Sort by value score (highest first)
    minorityPositions.sort((a, b) => b.valueScore - a.valueScore);

    // Extract dissent themes
    const dissentThemes = this.extractDissentThemes(minorityPositions);

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(minorityPositions);

    return {
      minorityPositions,
      hasHighValueDissent: minorityPositions.some((p: any) => p.isHighValue),
      dissentThemes,
      recommendedActions
    };
  }

  /**
   * Group replies by similar positions using simple keyword matching
   * In production, use embeddings for semantic similarity
   */
  private groupSimilarPositions(replies: AgentReply[]): Map<string, AgentReply[]> {
    const groups = new Map<string, AgentReply[]>();

    // Keywords indicating different positions
    const keywords = {
      'proceed': ['proceed', 'approve', 'go ahead', 'support', 'recommend'],
      'caution': ['caution', 'careful', 'concern', 'risk', 'warning'],
      'delay': ['delay', 'wait', 'postpone', 'additional data', 'more time'],
      'reject': ['reject', 'oppose', 'not ready', 'insufficient', 'inadequate']
    };

    for (const reply of replies) {
      const message = reply.message.toLowerCase();
      let assigned = false;

      for (const [position, words] of Object.entries(keywords)) {
        if (words.some(word => message.includes(word))) {
          if (!groups.has(position)) {
            groups.set(position, []);
          }
          groups.get(position)!.push(reply);
          assigned = true;
          break;
        }
      }

      // If no keyword match, create unique position
      if (!assigned) {
        const uniqueKey = `position_${reply.persona}`;
        groups.set(uniqueKey, [reply]);
      }
    }

    return groups;
  }

  /**
   * Assess the value of a minority opinion
   * Higher value = more important to preserve and consider
   */
  private assessMinorityValue(
    reply: AgentReply,
    supportLevel: number,
    allReplies: AgentReply[],
    question: string
  ): number {
    let valueScore = 0;

    // Factor 1: Expert confidence (30% weight)
    valueScore += reply.confidence * 0.3;

    // Factor 2: Specificity of reasoning (20% weight)
    const hasSpecificReasoning = this.hasSpecificReasoning(reply);
    if (hasSpecificReasoning) {
      valueScore += 0.2;
    }

    // Factor 3: Mentions safety or risk (25% weight)
    const mentionsSafety = this.mentionsSafetyOrRisk(reply);
    if (mentionsSafety) {
      valueScore += 0.25;
    }

    // Factor 4: Provides evidence or data reference (15% weight)
    const hasEvidence = this.referencesEvidence(reply);
    if (hasEvidence) {
      valueScore += 0.15;
    }

    // Factor 5: Contrarian but not outlier (10% weight)
    // Very isolated opinions (< 10% support) get slight penalty
    if (supportLevel < 0.1) {
      valueScore += 0.05;
    } else {
      valueScore += 0.1;
    }

    return Math.min(valueScore, 1.0);
  }

  /**
   * Check if reply has specific reasoning (not vague)
   */
  private hasSpecificReasoning(reply: AgentReply): boolean {
    const specificIndicators = [
      'n=', 'study', 'trial', 'data', 'evidence', 'precedent',
      'timeline', 'months', 'years', '%', 'percent', 'analysis'
    ];

    return specificIndicators.some(indicator =>
      reply.message.toLowerCase().includes(indicator) ||
      (reply.reasoning || '').toLowerCase().includes(indicator)
    );
  }

  /**
   * Check if reply mentions safety or risk concerns
   */
  private mentionsSafetyOrRisk(reply: AgentReply): boolean {
    const safetyKeywords = [
      'safety', 'risk', 'adverse', 'harm', 'danger', 'concern',
      'patient', 'mortality', 'morbidity', 'side effect', 'complication'
    ];

    const text = (reply.message + ' ' + (reply.reasoning || '')).toLowerCase();
    return safetyKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if reply references evidence, studies, or data
   */
  private referencesEvidence(reply: AgentReply): boolean {
    const evidenceKeywords = [
      'study', 'trial', 'research', 'data', 'evidence', 'publication',
      'journal', 'fda', 'nct', 'clinical', 'phase'
    ];

    const text = (reply.message + ' ' + (reply.reasoning || '')).toLowerCase();
    return evidenceKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Identify potential risk if minority opinion is ignored
   */
  private identifyRiskIfIgnored(reply: AgentReply, question: string): string {
    const text = reply.message.toLowerCase();

    // Pattern matching for common risks
    if (text.includes('safety') || text.includes('adverse')) {
      return 'Potential post-market safety issues or patient harm';
    }
    if (text.includes('regulatory') || text.includes('fda')) {
      return 'Regulatory approval delays or rejection';
    }
    if (text.includes('data') || text.includes('evidence')) {
      return 'Insufficient evidence for confident decision-making';
    }
    if (text.includes('timeline') || text.includes('delay')) {
      return 'Project delays and timeline impacts';
    }
    if (text.includes('cost') || text.includes('budget')) {
      return 'Budget overruns or financial impacts';
    }

    return 'Potential unidentified risks from overlooking this perspective';
  }

  /**
   * Generate recommendation for handling minority opinion
   */
  private generateRecommendation(reply: AgentReply, valueScore: number): string {
    if (valueScore >= 0.8) {
      return 'CRITICAL: Strongly consider this perspective before final decision';
    } else if (valueScore >= 0.7) {
      return 'HIGH: Address this concern in decision documentation';
    } else if (valueScore >= 0.5) {
      return 'MODERATE: Evaluate and document if feasible';
    } else {
      return 'LOW: Document for completeness';
    }
  }

  /**
   * Extract common themes from minority positions
   */
  private extractDissentThemes(positions: MinorityPosition[]): string[] {
    if (positions.length === 0) return [];

    const themes = new Set<string>();

    for (const position of positions) {
      const text = (position.position + ' ' + position.reasoning).toLowerCase();

      if (text.includes('safety') || text.includes('adverse')) {
        themes.add('Safety Concerns');
      }
      if (text.includes('regulatory') || text.includes('compliance')) {
        themes.add('Regulatory Risk');
      }
      if (text.includes('timeline') || text.includes('delay')) {
        themes.add('Timeline Feasibility');
      }
      if (text.includes('data') || text.includes('evidence')) {
        themes.add('Evidence Sufficiency');
      }
      if (text.includes('cost') || text.includes('financial')) {
        themes.add('Financial Impact');
      }
    }

    return Array.from(themes);
  }

  /**
   * Generate recommended actions based on minority opinions
   */
  private generateRecommendedActions(positions: MinorityPosition[]): string[] {
    const actions: string[] = [];

    const highValuePositions = positions.filter((p: any) => p.isHighValue);

    if (highValuePositions.length > 0) {
      actions.push(`Review ${highValuePositions.length} high-value dissenting opinion(s) before finalizing decision`);
    }

    const safetyDissent = positions.some((p: any) =>
      p.riskIfIgnored.toLowerCase().includes('safety')
    );
    if (safetyDissent) {
      actions.push('Conduct additional safety analysis to address concerns');
    }

    const regulatoryDissent = positions.some((p: any) =>
      p.riskIfIgnored.toLowerCase().includes('regulatory')
    );
    if (regulatoryDissent) {
      actions.push('Verify regulatory strategy with FDA/EMA guidance');
    }

    const evidenceDissent = positions.some((p: any) =>
      p.riskIfIgnored.toLowerCase().includes('evidence')
    );
    if (evidenceDissent) {
      actions.push('Consider gathering additional evidence/data');
    }

    if (actions.length === 0) {
      actions.push('Document minority opinions for audit trail');
    }

    return actions;
  }

  /**
   * Format minority analysis for inclusion in synthesis
   */
  public formatMinorityReport(analysis: MinorityAnalysisResult): string {
    if (analysis.minorityPositions.length === 0) {
      return '';
    }

    let report = '\n\n## 🔍 Minority Opinion Report\n\n';
    report += `**${analysis.minorityPositions.length} dissenting opinion(s) identified** `;
    report += `(${analysis.minorityPositions.filter((p: any) => p.isHighValue).length} high-value)\n\n`;

    if (analysis.hasHighValueDissent) {
      report += '⚠️ **HIGH-VALUE DISSENT DETECTED** - Review recommended before final decision\n\n';
    }

    // Show high-value dissents first
    const highValue = analysis.minorityPositions.filter((p: any) => p.isHighValue);
    if (highValue.length > 0) {
      report += '### High-Value Dissenting Opinions\n\n';
      for (const position of highValue) {
        report += this.formatPosition(position);
      }
    }

    // Show other dissents
    const other = analysis.minorityPositions.filter((p: any) => !p.isHighValue);
    if (other.length > 0) {
      report += '\n### Additional Dissenting Views\n\n';
      for (const position of other) {
        report += this.formatPosition(position);
      }
    }

    // Dissent themes
    if (analysis.dissentThemes.length > 0) {
      report += '\n### Dissent Themes\n';
      for (const theme of analysis.dissentThemes) {
        report += `- ${theme}\n`;
      }
    }

    // Recommended actions
    if (analysis.recommendedActions.length > 0) {
      report += '\n### Recommended Actions\n';
      for (const action of analysis.recommendedActions) {
        report += `- ${action}\n`;
      }
    }

    return report;
  }

  private formatPosition(position: MinorityPosition): string {
    let formatted = `**Expert:** ${position.expertName} (${(position.supportLevel * 100).toFixed(0)}% support)\n`;
    formatted += `**Position:** ${position.position}\n`;
    formatted += `**Reasoning:** ${position.reasoning}\n`;
    formatted += `**Risk if Ignored:** ${position.riskIfIgnored}\n`;
    formatted += `**Recommendation:** ${position.recommendation}\n`;
    formatted += `**Value Score:** ${(position.valueScore * 100).toFixed(0)}% | `;
    formatted += `**Confidence:** ${(position.confidence * 100).toFixed(0)}%\n\n`;
    return formatted;
  }

  private emptyResult(): MinorityAnalysisResult {
    return {
      minorityPositions: [],
      hasHighValueDissent: false,
      dissentThemes: [],
      recommendedActions: []
    };
  }
}

// Singleton instance
export const minorityOpinionAnalyzer = new MinorityOpinionAnalyzer();
