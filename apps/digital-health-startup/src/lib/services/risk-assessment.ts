/**
 * Risk Assessment Matrix Service
 * Analyzes panel discussions to extract, score, and visualize risks
 *
 * Generates probability × impact risk matrices for executive decision-making
 */

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskImpact = 'low' | 'medium' | 'high';
export type RiskCategory = 'regulatory' | 'clinical' | 'commercial' | 'operational' | 'financial' | 'reputational' | 'technical' | 'market';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  probability: RiskProbability;
  impact: RiskImpact;
  probabilityScore: number; // 0-1
  impactScore: number; // 0-1
  riskScore: number; // probability × impact (0-1)
  mitigationStrategies: string[];
  owner?: string;
  timeline?: string;
  detectedBy?: string; // Which expert identified this risk
  confidence: number; // 0-1
}

export interface RiskMatrix {
  risks: Risk[];
  matrixData: RiskMatrixCell[][];
  summary: {
    totalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    topCategories: string[];
  };
  recommendations: string[];
}

export interface RiskMatrixCell {
  probability: RiskProbability;
  impact: RiskImpact;
  risks: Risk[];
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// RISK ASSESSMENT SERVICE
// ============================================================================

export class RiskAssessmentService {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3, // Lower temperature for consistent risk assessment
      openAIApiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Extract and assess risks from panel discussion
   */
  async assessRisks(
    question: string,
    expertReplies: Array<{ persona: string; text: string; confidence: number }>,
    synthesis: string
  ): Promise<RiskMatrix> {
    // Extract risks from discussion
    const extractedRisks = await this.extractRisks(question, expertReplies, synthesis);

    // Score each risk (probability × impact)
    const scoredRisks = extractedRisks.map(risk => this.scoreRisk(risk));

    // Build risk matrix
    const matrix = this.buildRiskMatrix(scoredRisks);

    // Generate mitigation strategies for high-priority risks
    const risksWithMitigation = await this.addMitigationStrategies(scoredRisks);

    return {
      risks: risksWithMitigation,
      matrixData: matrix,
      summary: this.generateSummary(risksWithMitigation),
      recommendations: this.generateRecommendations(risksWithMitigation, matrix)
    };
  }

  /**
   * Extract risks from expert discussion using LLM
   */
  private async extractRisks(
    question: string,
    expertReplies: Array<{ persona: string; text: string; confidence: number }>,
    synthesis: string
  ): Promise<Partial<Risk>[]> {
    const discussionText = expertReplies
      .map(r => `${r.persona}: ${r.text}`)
      .join('\n\n');

    const prompt = `You are a risk assessment expert analyzing a pharmaceutical advisory board discussion.

**Question**: ${question}

**Expert Discussion**:
${discussionText}

**Synthesis**:
${synthesis}

Extract ALL potential risks mentioned or implied in this discussion. For each risk, provide:
1. Title (brief, clear)
2. Description (detailed explanation)
3. Category (regulatory, clinical, commercial, operational, financial, reputational, technical, market)
4. Probability (low/medium/high) - likelihood it will occur
5. Impact (low/medium/high) - severity if it occurs
6. Which expert identified it
7. Confidence (0-1) - how confident you are this is a real risk

Return as JSON array:
[
  {
    "title": "Regulatory approval delay",
    "description": "FDA may require additional safety data...",
    "category": "regulatory",
    "probability": "medium",
    "impact": "high",
    "detectedBy": "Regulatory Affairs Expert",
    "confidence": 0.85
  }
]`;

    const response = await this.llm.invoke([
      new SystemMessage('You are a risk assessment expert. Extract risks from discussions and return valid JSON only.'),
      new HumanMessage(prompt)
    ]);

    try {
      const content = response.content.toString();
      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON found in LLM response');
        return [];
      }

      const risks = JSON.parse(jsonMatch[0]);
      return risks.map((risk: any, index: number) => ({
        id: `risk-${Date.now()}-${index}`,
        ...risk
      }));
    } catch (error) {
      console.error('Failed to parse risks from LLM:', error);
      return [];
    }
  }

  /**
   * Score risk based on probability and impact
   */
  private scoreRisk(risk: Partial<Risk>): Risk {
    // Convert categorical to numeric
    const probMapping: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };
    const impactMapping: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8 };

    const probabilityScore = probMapping[risk.probability || 'medium'];
    const impactScore = impactMapping[risk.impact || 'medium'];
    const riskScore = probabilityScore * impactScore;

    return {
      id: risk.id || `risk-${Date.now()}`,
      title: risk.title || 'Unknown risk',
      description: risk.description || '',
      category: risk.category || 'operational',
      probability: risk.probability || 'medium',
      impact: risk.impact || 'medium',
      probabilityScore,
      impactScore,
      riskScore,
      mitigationStrategies: [],
      detectedBy: risk.detectedBy,
      confidence: risk.confidence || 0.7
    };
  }

  /**
   * Build 3x3 risk matrix
   */
  private buildRiskMatrix(risks: Risk[]): RiskMatrixCell[][] {
    const probabilities: RiskProbability[] = ['low', 'medium', 'high'];
    const impacts: RiskImpact[] = ['low', 'medium', 'high'];

    // Initialize 3x3 matrix (prob on Y-axis, impact on X-axis)
    const matrix: RiskMatrixCell[][] = probabilities.reverse().map(prob =>
      impacts.map(impact => {
        const cellRisks = risks.filter(r => r.probability === prob && r.impact === impact);
        return {
          probability: prob,
          impact,
          risks: cellRisks,
          count: cellRisks.length,
          severity: this.getCellSeverity(prob, impact)
        };
      })
    );

    return matrix;
  }

  /**
   * Determine cell severity based on position in matrix
   */
  private getCellSeverity(probability: RiskProbability, impact: RiskImpact): 'critical' | 'high' | 'medium' | 'low' {
    if (probability === 'high' && impact === 'high') return 'critical';
    if ((probability === 'high' && impact === 'medium') || (probability === 'medium' && impact === 'high')) return 'high';
    if (probability === 'low' && impact === 'low') return 'low';
    return 'medium';
  }

  /**
   * Add mitigation strategies for high-priority risks
   */
  private async addMitigationStrategies(risks: Risk[]): Promise<Risk[]> {
    // Focus on high-impact or high-probability risks
    const highPriorityRisks = risks.filter(r =>
      r.probability === 'high' || r.impact === 'high' || r.riskScore > 0.4
    );

    if (highPriorityRisks.length === 0) {
      return risks;
    }

    const prompt = `For each of these pharmaceutical risks, suggest 2-3 specific, actionable mitigation strategies:

${highPriorityRisks.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join('\n')}

Return as JSON array of arrays (mitigation strategies for each risk):
[
  ["Strategy 1 for risk 1", "Strategy 2 for risk 1"],
  ["Strategy 1 for risk 2", "Strategy 2 for risk 2"]
]`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage('You are a risk mitigation expert. Suggest specific, actionable strategies. Return valid JSON only.'),
        new HumanMessage(prompt)
      ]);

      const content = response.content.toString();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return risks;
      }

      const mitigations = JSON.parse(jsonMatch[0]);

      // Add mitigations to risks
      const risksWithMitigation = risks.map(risk => {
        const index = highPriorityRisks.findIndex(r => r.id === risk.id);
        if (index !== -1 && mitigations[index]) {
          return { ...risk, mitigationStrategies: mitigations[index] };
        }
        return risk;
      });

      return risksWithMitigation;

    } catch (error) {
      console.error('Failed to generate mitigation strategies:', error);
      return risks;
    }
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(risks: Risk[]) {
    const highRisks = risks.filter(r => r.riskScore > 0.4).length;
    const mediumRisks = risks.filter(r => r.riskScore > 0.2 && r.riskScore <= 0.4).length;
    const lowRisks = risks.filter(r => r.riskScore <= 0.2).length;

    // Count by category
    const categoryCount: Record<string, number> = {};
    risks.forEach(r => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    return {
      totalRisks: risks.length,
      highRisks,
      mediumRisks,
      lowRisks,
      topCategories
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(risks: Risk[], matrix: RiskMatrixCell[][]): string[] {
    const recommendations: string[] = [];

    // Critical risks (high prob + high impact)
    const criticalCell = matrix[0]?.[2]; // Top-right cell
    if (criticalCell && criticalCell.count > 0) {
      recommendations.push(`🚨 CRITICAL: ${criticalCell.count} high-probability, high-impact risk(s) require immediate attention`);
    }

    // High-probability risks
    const highProbRisks = risks.filter(r => r.probability === 'high');
    if (highProbRisks.length > 0) {
      recommendations.push(`⚠️  ${highProbRisks.length} high-probability risk(s) detected - develop preventive measures`);
    }

    // High-impact risks
    const highImpactRisks = risks.filter(r => r.impact === 'high');
    if (highImpactRisks.length > 0) {
      recommendations.push(`⚡ ${highImpactRisks.length} high-impact risk(s) identified - prepare contingency plans`);
    }

    // Category-specific
    const summary = this.generateSummary(risks);
    if (summary.topCategories.includes('regulatory')) {
      recommendations.push(`📋 Regulatory risks dominant - engage early with FDA/EMA`);
    }

    if (summary.topCategories.includes('clinical')) {
      recommendations.push(`🔬 Clinical risks require additional study design review`);
    }

    return recommendations;
  }
}

// Singleton instance
export const riskAssessmentService = new RiskAssessmentService();
