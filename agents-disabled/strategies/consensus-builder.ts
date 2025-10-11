/**
 * Consensus Builder Strategy
 * Implements advanced consensus building algorithms for agent conflict resolution
 */

import type { AgentResponse } from '@/types/agent.types';
import type { AgentConflict, ConflictResolution } from '../core/conflict-resolver';

export interface ConsensusAlgorithm {
  name: string;
  description: string;
  calculateConsensus: (responses: AgentResponse[]) => ConsensusResult;
  weightFactors: {
    confidence: number;
    authority: number;
    relevance: number;
    consistency: number;
  };
}

export interface ConsensusResult {
  consensusScore: number; // 0-1
  consensusLevel: 'low' | 'medium' | 'high' | 'unanimous';
  commonElements: string[];
  conflictingElements: string[];
  recommendedAction: 'accept' | 'synthesize' | 'escalate' | 'vote';
  reasoning: string;
}

export interface ConsensusMetrics {
  algorithm: string;
  inputResponses: number;
  consensusScore: number;
  processingTime: number;
  success: boolean;
  metadata: Record<string, any>;
}

export class ConsensusBuilder {
  private algorithms: Map<string, ConsensusAlgorithm> = new Map();
  private metrics: ConsensusMetrics[] = [];

  constructor() {
    this.initializeAlgorithms();
  }

  /**
   * Initialize consensus algorithms
   */
  private initializeAlgorithms(): void {
    // Weighted Average Consensus
    this.algorithms.set('weighted_average', {
      name: 'weighted_average',
      description: 'Weighted average based on confidence and authority',
      calculateConsensus: this.calculateWeightedAverageConsensus.bind(this),
      weightFactors: {
        confidence: 0.4,
        authority: 0.3,
        relevance: 0.2,
        consistency: 0.1
      }
    });

    // Majority Rule Consensus
    this.algorithms.set('majority_rule', {
      name: 'majority_rule',
      description: 'Majority rule with tie-breaking mechanisms',
      calculateConsensus: this.calculateMajorityRuleConsensus.bind(this),
      weightFactors: {
        confidence: 0.3,
        authority: 0.4,
        relevance: 0.2,
        consistency: 0.1
      }
    });

    // Semantic Similarity Consensus
    this.algorithms.set('semantic_similarity', {
      name: 'semantic_similarity',
      description: 'Consensus based on semantic similarity of responses',
      calculateConsensus: this.calculateSemanticSimilarityConsensus.bind(this),
      weightFactors: {
        confidence: 0.2,
        authority: 0.2,
        relevance: 0.3,
        consistency: 0.3
      }
    });

    // Expert Weighted Consensus
    this.algorithms.set('expert_weighted', {
      name: 'expert_weighted',
      description: 'Consensus weighted by agent expertise and specialization',
      calculateConsensus: this.calculateExpertWeightedConsensus.bind(this),
      weightFactors: {
        confidence: 0.25,
        authority: 0.35,
        relevance: 0.25,
        consistency: 0.15
      }
    });
  }

  /**
   * Build consensus using the best algorithm for the conflict
   */
  async buildConsensus(conflict: AgentConflict): Promise<ConsensusResult> {
    const startTime = Date.now();
    
    try {
      // Select the best algorithm for this conflict
      const algorithm = this.selectBestAlgorithm(conflict);
      
      // Calculate consensus
      const result = algorithm.calculateConsensus(conflict.responses);
      
      // Record metrics
      const processingTime = Date.now() - startTime;
      this.recordMetrics({
        algorithm: algorithm.name,
        inputResponses: conflict.responses.length,
        consensusScore: result.consensusScore,
        processingTime,
        success: true,
        metadata: {
          conflictType: conflict.conflictType,
          severity: conflict.severity,
          agentCount: conflict.agents.length
        }
      });

      return result;
    } catch (error) {
      console.error('Consensus building failed:', error);
      
      // Record failure metrics
      this.recordMetrics({
        algorithm: 'unknown',
        inputResponses: conflict.responses.length,
        consensusScore: 0,
        processingTime: Date.now() - startTime,
        success: false,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      // Return fallback consensus
      return this.createFallbackConsensus(conflict);
    }
  }

  /**
   * Select the best algorithm for a conflict
   */
  private selectBestAlgorithm(conflict: AgentConflict): ConsensusAlgorithm {
    // Simple selection logic - can be enhanced with ML
    if (conflict.agents.length <= 2) {
      return this.algorithms.get('weighted_average')!;
    }
    
    if (conflict.conflictType === 'contradiction') {
      return this.algorithms.get('majority_rule')!;
    }
    
    if (conflict.conflictType === 'overlap') {
      return this.algorithms.get('semantic_similarity')!;
    }
    
    if (conflict.severity === 'critical') {
      return this.algorithms.get('expert_weighted')!;
    }
    
    return this.algorithms.get('weighted_average')!;
  }

  /**
   * Weighted Average Consensus Algorithm
   */
  private calculateWeightedAverageConsensus(responses: AgentResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return this.createEmptyConsensus();
    }

    if (responses.length === 1) {
      return {
        consensusScore: 1.0,
        consensusLevel: 'unanimous',
        commonElements: this.extractKeyElements(responses[0]),
        conflictingElements: [],
        recommendedAction: 'accept',
        reasoning: 'Single response - unanimous consensus'
      };
    }

    // Calculate weighted scores
    const weights = this.calculateWeights(responses);
    const weightedScore = responses.reduce((sum, response, index) => {
      const confidence = response.confidence || 0.5;
      const weight = weights[index];
      return sum + (confidence * weight);
    }, 0);

    const consensusScore = Math.min(1.0, weightedScore);
    const consensusLevel = this.determineConsensusLevel(consensusScore);
    
    // Find common and conflicting elements
    const commonElements = this.findCommonElements(responses);
    const conflictingElements = this.findConflictingElements(responses);
    
    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(consensusScore, commonElements, conflictingElements);

    return {
      consensusScore,
      consensusLevel,
      commonElements,
      conflictingElements,
      recommendedAction,
      reasoning: `Weighted average consensus: ${consensusScore.toFixed(3)} based on ${responses.length} responses`
    };
  }

  /**
   * Majority Rule Consensus Algorithm
   */
  private calculateMajorityRuleConsensus(responses: AgentResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return this.createEmptyConsensus();
    }

    // Group responses by similarity
    const responseGroups = this.groupSimilarResponses(responses);
    const largestGroup = responseGroups.reduce((max, group) => 
      group.length > max.length ? group : max
    );

    const consensusScore = largestGroup.length / responses.length;
    const consensusLevel = this.determineConsensusLevel(consensusScore);
    
    // Extract elements from the majority group
    const commonElements = this.findCommonElements(largestGroup);
    const conflictingElements = this.findConflictingElements(responses);
    
    const recommendedAction = consensusScore >= 0.5 ? 'accept' : 'escalate';

    return {
      consensusScore,
      consensusLevel,
      commonElements,
      conflictingElements,
      recommendedAction,
      reasoning: `Majority rule: ${largestGroup.length}/${responses.length} responses in agreement`
    };
  }

  /**
   * Semantic Similarity Consensus Algorithm
   */
  private calculateSemanticSimilarityConsensus(responses: AgentResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return this.createEmptyConsensus();
    }

    // Calculate pairwise similarities
    const similarities: number[][] = [];
    for (let i = 0; i < responses.length; i++) {
      similarities[i] = [];
      for (let j = 0; j < responses.length; j++) {
        if (i === j) {
          similarities[i][j] = 1.0;
        } else {
          similarities[i][j] = this.calculateSemanticSimilarity(responses[i], responses[j]);
        }
      }
    }

    // Calculate average similarity
    const avgSimilarity = this.calculateAverageSimilarity(similarities);
    const consensusScore = avgSimilarity;
    const consensusLevel = this.determineConsensusLevel(consensusScore);
    
    const commonElements = this.findCommonElements(responses);
    const conflictingElements = this.findConflictingElements(responses);
    
    const recommendedAction = consensusScore >= 0.7 ? 'accept' : 
                            consensusScore >= 0.4 ? 'synthesize' : 'escalate';

    return {
      consensusScore,
      consensusLevel,
      commonElements,
      conflictingElements,
      recommendedAction,
      reasoning: `Semantic similarity consensus: ${consensusScore.toFixed(3)} average similarity`
    };
  }

  /**
   * Expert Weighted Consensus Algorithm
   */
  private calculateExpertWeightedConsensus(responses: AgentResponse[]): ConsensusResult {
    if (responses.length === 0) {
      return this.createEmptyConsensus();
    }

    // Calculate expert weights based on agent capabilities and authority
    const expertWeights = responses.map((response, index) => {
      const agent = responses[index]; // This would be the actual agent object
      const authority = this.getAgentAuthority(agent);
      const expertise = this.getAgentExpertise(agent);
      const relevance = this.getResponseRelevance(response);
      
      return (authority * 0.4) + (expertise * 0.3) + (relevance * 0.3);
    });

    // Normalize weights
    const totalWeight = expertWeights.reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = expertWeights.map(weight => weight / totalWeight);

    // Calculate weighted consensus
    const consensusScore = responses.reduce((sum, response, index) => {
      const confidence = response.confidence || 0.5;
      const weight = normalizedWeights[index];
      return sum + (confidence * weight);
    }, 0);

    const consensusLevel = this.determineConsensusLevel(consensusScore);
    const commonElements = this.findCommonElements(responses);
    const conflictingElements = this.findConflictingElements(responses);
    
    const recommendedAction = consensusScore >= 0.8 ? 'accept' : 
                            consensusScore >= 0.6 ? 'synthesize' : 'escalate';

    return {
      consensusScore,
      consensusLevel,
      commonElements,
      conflictingElements,
      recommendedAction,
      reasoning: `Expert weighted consensus: ${consensusScore.toFixed(3)} based on agent expertise`
    };
  }

  // Helper methods
  private calculateWeights(responses: AgentResponse[]): number[] {
    // Simple equal weighting - can be enhanced with agent-specific weights
    return responses.map(() => 1.0 / responses.length);
  }

  private determineConsensusLevel(score: number): 'low' | 'medium' | 'high' | 'unanimous' {
    if (score >= 0.95) return 'unanimous';
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  private findCommonElements(responses: AgentResponse[]): string[] {
    if (responses.length === 0) return [];
    
    // Extract keywords from all responses
    const allKeywords = responses.flatMap(response => 
      this.extractKeywords(response.content)
    );
    
    // Count keyword frequency
    const keywordCounts = allKeywords.reduce((counts, keyword) => {
      counts[keyword] = (counts[keyword] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // Return keywords that appear in multiple responses
    return Object.entries(keywordCounts)
      .filter(([, count]) => count > 1)
      .map(([keyword]) => keyword);
  }

  private findConflictingElements(responses: AgentResponse[]): string[] {
    // Simple implementation - find contradictory keywords
    const contradictions: string[] = [];
    const opposites = [
      ['yes', 'no'], ['true', 'false'], ['correct', 'incorrect'],
      ['should', 'should not'], ['recommend', 'not recommend']
    ];
    
    for (const [positive, negative] of opposites) {
      const hasPositive = responses.some(r => r.content.toLowerCase().includes(positive));
      const hasNegative = responses.some(r => r.content.toLowerCase().includes(negative));
      
      if (hasPositive && hasNegative) {
        contradictions.push(`${positive}/${negative}`);
      }
    }
    
    return contradictions;
  }

  private determineRecommendedAction(
    consensusScore: number, 
    commonElements: string[], 
    conflictingElements: string[]
  ): 'accept' | 'synthesize' | 'escalate' | 'vote' {
    if (consensusScore >= 0.8 && conflictingElements.length === 0) {
      return 'accept';
    }
    
    if (consensusScore >= 0.5 && commonElements.length > 0) {
      return 'synthesize';
    }
    
    if (conflictingElements.length > 0) {
      return 'vote';
    }
    
    return 'escalate';
  }

  private extractKeyElements(response: AgentResponse): string[] {
    return this.extractKeywords(response.content);
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall'
    ]);
    return stopWords.has(word);
  }

  private groupSimilarResponses(responses: AgentResponse[]): AgentResponse[][] {
    const groups: AgentResponse[][] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < responses.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [responses[i]];
      processed.add(i);
      
      for (let j = i + 1; j < responses.length; j++) {
        if (processed.has(j)) continue;
        
        const similarity = this.calculateSemanticSimilarity(responses[i], responses[j]);
        if (similarity >= 0.7) {
          group.push(responses[j]);
          processed.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  private calculateSemanticSimilarity(response1: AgentResponse, response2: AgentResponse): number {
    // Simple similarity calculation based on common words
    const words1 = this.extractKeywords(response1.content);
    const words2 = this.extractKeywords(response2.content);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private calculateAverageSimilarity(similarities: number[][]): number {
    let total = 0;
    let count = 0;
    
    for (let i = 0; i < similarities.length; i++) {
      for (let j = i + 1; j < similarities[i].length; j++) {
        total += similarities[i][j];
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  private getAgentAuthority(agent: any): number {
    // Simplified authority calculation
    return agent.tier ? (4 - agent.tier) / 3 : 0.5; // Tier 1 = 1.0, Tier 3 = 0.33
  }

  private getAgentExpertise(agent: any): number {
    // Simplified expertise calculation
    return agent.metadata?.experience || 0.5;
  }

  private getResponseRelevance(response: AgentResponse): number {
    // Simplified relevance calculation based on confidence
    return response.confidence || 0.5;
  }

  private createEmptyConsensus(): ConsensusResult {
    return {
      consensusScore: 0,
      consensusLevel: 'low',
      commonElements: [],
      conflictingElements: [],
      recommendedAction: 'escalate',
      reasoning: 'No responses to analyze'
    };
  }

  private createFallbackConsensus(conflict: AgentConflict): ConsensusResult {
    return {
      consensusScore: 0.3,
      consensusLevel: 'low',
      commonElements: [],
      conflictingElements: ['consensus_building_failed'],
      recommendedAction: 'escalate',
      reasoning: 'Consensus building failed - escalation required'
    };
  }

  private recordMetrics(metrics: ConsensusMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get consensus building metrics
   */
  getMetrics(): ConsensusMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get algorithm performance statistics
   */
  getAlgorithmStats(): Record<string, { success: number; avgScore: number; avgTime: number }> {
    const stats: Record<string, { success: number; avgScore: number; avgTime: number }> = {};
    
    for (const metric of this.metrics) {
      if (!stats[metric.algorithm]) {
        stats[metric.algorithm] = { success: 0, avgScore: 0, avgTime: 0 };
      }
      
      if (metric.success) {
        stats[metric.algorithm].success++;
      }
      
      stats[metric.algorithm].avgScore += metric.consensusScore;
      stats[metric.algorithm].avgTime += metric.processingTime;
    }
    
    // Calculate averages
    for (const algorithm in stats) {
      const count = this.metrics.filter(m => m.algorithm === algorithm).length;
      if (count > 0) {
        stats[algorithm].avgScore /= count;
        stats[algorithm].avgTime /= count;
      }
    }
    
    return stats;
  }
}

export const consensusBuilder = new ConsensusBuilder();
