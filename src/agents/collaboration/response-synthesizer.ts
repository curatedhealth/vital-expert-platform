/**
 * Response Synthesizer
 * Advanced response synthesis strategies for multi-agent collaboration
 */

import type { AgentResponse } from '@/types/agent';

export interface SynthesisStrategy {
  name: string;
  description: string;
  synthesize: (responses: AgentResponse[], context: SynthesisContext) => Promise<SynthesizedResponse>;
  requirements: {
    minResponses: number;
    maxResponses: number;
    conflictTolerance: 'low' | 'medium' | 'high';
  };
}

export interface SynthesisContext {
  query: string;
  intent: string;
  entities: string[];
  domain: string;
  userPreferences?: {
    detailLevel: 'summary' | 'detailed' | 'comprehensive';
    format: 'narrative' | 'structured' | 'bullet-points';
    focus: string[];
  };
  constraints?: {
    maxLength?: number;
    includeSources?: boolean;
    includeConfidence?: boolean;
  };
}

export interface SynthesizedResponse {
  id: string;
  content: string;
  confidence: number;
  sources: ResponseSource[];
  metadata: {
    synthesisStrategy: string;
    participantCount: number;
    conflictCount: number;
    resolutionCount: number;
    qualityScore: number;
    processingTime: number;
  };
  timestamp: Date;
}

export interface ResponseSource {
  agentId: string;
  agentName: string;
  contribution: string;
  confidence: number;
  relevance: number;
}

export interface ConflictResolution {
  type: 'contradiction' | 'inconsistency' | 'ambiguity' | 'completeness';
  severity: 'low' | 'medium' | 'high';
  participants: string[];
  resolution: string;
  confidence: number;
}

export class ResponseSynthesizer {
  private strategies: Map<string, SynthesisStrategy> = new Map();
  private conflictResolver: ConflictResolver;

  constructor() {
    this.initializeStrategies();
    this.conflictResolver = new ConflictResolver();
  }

  /**
   * Initialize synthesis strategies
   */
  private initializeStrategies(): void {
    // Consensus Strategy
    this.strategies.set('consensus', {
      name: 'consensus',
      description: 'Build consensus through iterative refinement and voting',
      synthesize: this.synthesizeConsensus.bind(this),
      requirements: {
        minResponses: 2,
        maxResponses: 10,
        conflictTolerance: 'low'
      }
    });

    // Hierarchical Strategy
    this.strategies.set('hierarchical', {
      name: 'hierarchical',
      description: 'Primary agent leads with specialist contributions',
      synthesize: this.synthesizeHierarchical.bind(this),
      requirements: {
        minResponses: 2,
        maxResponses: 15,
        conflictTolerance: 'medium'
      }
    });

    // Weighted Strategy
    this.strategies.set('weighted', {
      name: 'weighted',
      description: 'Weight responses based on agent expertise and confidence',
      synthesize: this.synthesizeWeighted.bind(this),
      requirements: {
        minResponses: 2,
        maxResponses: 20,
        conflictTolerance: 'high'
      }
    });

    // Narrative Strategy
    this.strategies.set('narrative', {
      name: 'narrative',
      description: 'Create coherent narrative from multiple perspectives',
      synthesize: this.synthesizeNarrative.bind(this),
      requirements: {
        minResponses: 2,
        maxResponses: 8,
        conflictTolerance: 'medium'
      }
    });

    // Structured Strategy
    this.strategies.set('structured', {
      name: 'structured',
      description: 'Organize responses into structured format with clear sections',
      synthesize: this.synthesizeStructured.bind(this),
      requirements: {
        minResponses: 2,
        maxResponses: 12,
        conflictTolerance: 'low'
      }
    });
  }

  /**
   * Synthesize multiple agent responses
   */
  async synthesize(
    responses: AgentResponse[],
    context: SynthesisContext,
    strategyName?: string
  ): Promise<SynthesizedResponse> {
    const startTime = Date.now();

    try {
      // Filter valid responses
      const validResponses = responses.filter(r => r && r.content && r.content.trim().length > 0);
      
      if (validResponses.length === 0) {
        throw new Error('No valid responses to synthesize');
      }

      // Select synthesis strategy
      const strategy = strategyName 
        ? this.strategies.get(strategyName)
        : this.selectOptimalStrategy(validResponses, context);

      if (!strategy) {
        throw new Error('No suitable synthesis strategy found');
      }

      console.log(`🔄 Synthesizing ${validResponses.length} responses using ${strategy.name} strategy`);

      // Detect and resolve conflicts
      const conflicts = this.detectConflicts(validResponses, context);
      const resolvedResponses = await this.resolveConflicts(validResponses, conflicts);

      // Synthesize responses
      const synthesized = await strategy.synthesize(resolvedResponses, context);

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(synthesized, validResponses, conflicts);

      // Create final response
      const result: SynthesizedResponse = {
        ...synthesized,
        metadata: {
          ...synthesized.metadata,
          synthesisStrategy: strategy.name,
          participantCount: validResponses.length,
          conflictCount: conflicts.length,
          resolutionCount: conflicts.filter(c => c.resolution).length,
          qualityScore,
          processingTime: Date.now() - startTime
        }
      };

      console.log(`✅ Response synthesis completed with quality score: ${(qualityScore * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('❌ Response synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Select optimal synthesis strategy
   */
  private selectOptimalStrategy(
    responses: AgentResponse[],
    context: SynthesisContext
  ): SynthesisStrategy | null {
    const availableStrategies = Array.from(this.strategies.values())
      .filter(strategy => 
        responses.length >= strategy.requirements.minResponses &&
        responses.length <= strategy.requirements.maxResponses
      );

    if (availableStrategies.length === 0) {
      return null;
    }

    // Score strategies based on context and response characteristics
    const scoredStrategies = availableStrategies.map(strategy => ({
      strategy,
      score: this.calculateStrategyScore(strategy, responses, context)
    }));

    // Return highest scoring strategy
    return scoredStrategies
      .sort((a, b) => b.score - a.score)[0]
      .strategy;
  }

  /**
   * Calculate strategy score
   */
  private calculateStrategyScore(
    strategy: SynthesisStrategy,
    responses: AgentResponse[],
    context: SynthesisContext
  ): number {
    let score = 0;

    // Base score from requirements match
    score += 50;

    // User preference match
    if (context.userPreferences) {
      if (context.userPreferences.format === 'narrative' && strategy.name === 'narrative') {
        score += 30;
      }
      if (context.userPreferences.format === 'structured' && strategy.name === 'structured') {
        score += 30;
      }
      if (context.userPreferences.detailLevel === 'comprehensive' && strategy.name === 'weighted') {
        score += 20;
      }
    }

    // Response count optimization
    const responseCount = responses.length;
    const optimalCount = (strategy.requirements.minResponses + strategy.requirements.maxResponses) / 2;
    const countScore = 20 - Math.abs(responseCount - optimalCount) * 2;
    score += Math.max(0, countScore);

    return score;
  }

  /**
   * Detect conflicts between responses
   */
  private detectConflicts(responses: AgentResponse[], context: SynthesisContext): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const response1 = responses[i];
        const response2 = responses[j];

        // Check for contradictions
        const contradiction = this.detectContradiction(response1, response2);
        if (contradiction) {
          conflicts.push({
            type: 'contradiction',
            severity: contradiction.severity,
            participants: [response1.agentId, response2.agentId],
            resolution: '',
            confidence: contradiction.confidence
          });
        }

        // Check for inconsistencies
        const inconsistency = this.detectInconsistency(response1, response2);
        if (inconsistency) {
          conflicts.push({
            type: 'inconsistency',
            severity: inconsistency.severity,
            participants: [response1.agentId, response2.agentId],
            resolution: '',
            confidence: inconsistency.confidence
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect contradiction between two responses
   */
  private detectContradiction(response1: AgentResponse, response2: AgentResponse): any {
    // Simple contradiction detection based on content analysis
    const content1 = response1.content.toLowerCase();
    const content2 = response2.content.toLowerCase();

    // Check for direct contradictions
    const contradictions = [
      ['yes', 'no'], ['true', 'false'], ['correct', 'incorrect'],
      ['safe', 'unsafe'], ['effective', 'ineffective'], ['approved', 'rejected']
    ];

    for (const [word1, word2] of contradictions) {
      if ((content1.includes(word1) && content2.includes(word2)) ||
          (content1.includes(word2) && content2.includes(word1))) {
        return {
          severity: 'high' as const,
          confidence: 0.8
        };
      }
    }

    return null;
  }

  /**
   * Detect inconsistency between two responses
   */
  private detectInconsistency(response1: AgentResponse, response2: AgentResponse): any {
    // Check confidence levels
    const confidenceDiff = Math.abs(response1.confidence - response2.confidence);
    if (confidenceDiff > 0.5) {
      return {
        severity: 'medium' as const,
        confidence: 0.6
      };
    }

    return null;
  }

  /**
   * Resolve conflicts between responses
   */
  private async resolveConflicts(
    responses: AgentResponse[],
    conflicts: ConflictResolution[]
  ): Promise<AgentResponse[]> {
    if (conflicts.length === 0) {
      return responses;
    }

    console.log(`🔧 Resolving ${conflicts.length} conflicts...`);

    // Use conflict resolver to resolve conflicts
    const resolvedConflicts = await this.conflictResolver.resolveConflicts(conflicts, responses);

    // Apply resolutions to responses
    const resolvedResponses = responses.map(response => {
      const relevantConflicts = resolvedConflicts.filter(c => 
        c.participants.includes(response.agentId)
      );

      if (relevantConflicts.length === 0) {
        return response;
      }

      // Apply resolution (simplified - in production, this would be more sophisticated)
      const resolution = relevantConflicts[0].resolution;
      return {
        ...response,
        content: `${response.content}\n\n[Resolution: ${resolution}]`
      };
    });

    return resolvedResponses;
  }

  /**
   * Calculate quality score for synthesized response
   */
  private calculateQualityScore(
    synthesized: SynthesizedResponse,
    originalResponses: AgentResponse[],
    conflicts: ConflictResolution[]
  ): number {
    let score = 0;

    // Base score from confidence
    score += synthesized.confidence * 40;

    // Penalty for conflicts
    const conflictPenalty = conflicts.length * 5;
    score -= conflictPenalty;

    // Bonus for high participant count
    const participantBonus = Math.min(originalResponses.length * 2, 20);
    score += participantBonus;

    // Bonus for resolution rate
    const resolutionRate = conflicts.length > 0 
      ? conflicts.filter(c => c.resolution).length / conflicts.length 
      : 1;
    score += resolutionRate * 20;

    return Math.max(0, Math.min(1, score / 100));
  }

  // Synthesis Strategy Implementations

  /**
   * Consensus synthesis strategy
   */
  private async synthesizeConsensus(
    responses: AgentResponse[],
    context: SynthesisContext
  ): Promise<SynthesizedResponse> {
    // Build consensus through iterative refinement
    let consensus = responses[0].content;
    
    for (let i = 1; i < responses.length; i++) {
      consensus = this.mergeContent(consensus, responses[i].content, 'consensus');
    }

    const sources = responses.map(r => ({
      agentId: r.agentId,
      agentName: r.metadata?.agentName || r.agentId,
      contribution: r.content.substring(0, 100) + '...',
      confidence: r.confidence,
      relevance: 1.0
    }));

    return {
      id: `consensus-${Date.now()}`,
      content: `Consensus Analysis:\n\n${consensus}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      sources,
      metadata: {
        synthesisStrategy: 'consensus',
        participantCount: responses.length,
        conflictCount: 0,
        resolutionCount: 0,
        qualityScore: 0,
        processingTime: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Hierarchical synthesis strategy
   */
  private async synthesizeHierarchical(
    responses: AgentResponse[],
    context: SynthesisContext
  ): Promise<SynthesizedResponse> {
    // Sort by confidence and tier
    const sortedResponses = responses.sort((a, b) => b.confidence - a.confidence);
    const primaryResponse = sortedResponses[0];
    const specialistResponses = sortedResponses.slice(1);

    const primaryContent = `Primary Analysis (${primaryResponse.metadata?.agentName || primaryResponse.agentId}):\n${primaryResponse.content}`;
    
    const specialistContent = specialistResponses
      .map(r => `\nSpecialist Input (${r.metadata?.agentName || r.agentId}):\n${r.content}`)
      .join('\n');

    const sources = responses.map(r => ({
      agentId: r.agentId,
      agentName: r.metadata?.agentName || r.agentId,
      contribution: r.content.substring(0, 100) + '...',
      confidence: r.confidence,
      relevance: r === primaryResponse ? 1.0 : 0.8
    }));

    return {
      id: `hierarchical-${Date.now()}`,
      content: `${primaryContent}${specialistContent}`,
      confidence: primaryResponse.confidence,
      sources,
      metadata: {
        synthesisStrategy: 'hierarchical',
        participantCount: responses.length,
        conflictCount: 0,
        resolutionCount: 0,
        qualityScore: 0,
        processingTime: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Weighted synthesis strategy
   */
  private async synthesizeWeighted(
    responses: AgentResponse[],
    context: SynthesisContext
  ): Promise<SynthesizedResponse> {
    // Calculate weights based on confidence and expertise
    const weights = responses.map(r => r.confidence);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Weighted content synthesis
    let weightedContent = '';
    for (let i = 0; i < responses.length; i++) {
      const weight = weights[i] / totalWeight;
      const contribution = `[Weight: ${(weight * 100).toFixed(1)}%] ${responses[i].content}`;
      weightedContent += contribution + '\n\n';
    }

    const sources = responses.map((r, i) => ({
      agentId: r.agentId,
      agentName: r.metadata?.agentName || r.agentId,
      contribution: r.content.substring(0, 100) + '...',
      confidence: r.confidence,
      relevance: weights[i] / totalWeight
    }));

    return {
      id: `weighted-${Date.now()}`,
      content: `Weighted Analysis:\n\n${weightedContent}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence * r.confidence, 0) / totalWeight,
      sources,
      metadata: {
        synthesisStrategy: 'weighted',
        participantCount: responses.length,
        conflictCount: 0,
        resolutionCount: 0,
        qualityScore: 0,
        processingTime: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Narrative synthesis strategy
   */
  private async synthesizeNarrative(
    responses: AgentResponse[],
    context: SynthesisContext
  ): Promise<SynthesizedResponse> {
    // Create coherent narrative
    const narrative = responses
      .map((r, i) => `From the perspective of ${r.metadata?.agentName || r.agentId}: ${r.content}`)
      .join('\n\nBuilding on this analysis, ');

    const sources = responses.map(r => ({
      agentId: r.agentId,
      agentName: r.metadata?.agentName || r.agentId,
      contribution: r.content.substring(0, 100) + '...',
      confidence: r.confidence,
      relevance: 1.0
    }));

    return {
      id: `narrative-${Date.now()}`,
      content: `Comprehensive Analysis:\n\n${narrative}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      sources,
      metadata: {
        synthesisStrategy: 'narrative',
        participantCount: responses.length,
        conflictCount: 0,
        resolutionCount: 0,
        qualityScore: 0,
        processingTime: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Structured synthesis strategy
   */
  private async synthesizeStructured(
    responses: AgentResponse[],
    context: SynthesisContext
  ): Promise<SynthesizedResponse> {
    // Organize into structured sections
    const sections = responses.map((r, i) => ({
      title: `Analysis ${i + 1}: ${r.metadata?.agentName || r.agentId}`,
      content: r.content,
      confidence: r.confidence
    }));

    const structuredContent = sections
      .map(s => `## ${s.title}\n\n${s.content}\n\n*Confidence: ${(s.confidence * 100).toFixed(1)}%*`)
      .join('\n\n---\n\n');

    const sources = responses.map(r => ({
      agentId: r.agentId,
      agentName: r.metadata?.agentName || r.agentId,
      contribution: r.content.substring(0, 100) + '...',
      confidence: r.confidence,
      relevance: 1.0
    }));

    return {
      id: `structured-${Date.now()}`,
      content: `# Multi-Agent Analysis\n\n${structuredContent}`,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      sources,
      metadata: {
        synthesisStrategy: 'structured',
        participantCount: responses.length,
        conflictCount: 0,
        resolutionCount: 0,
        qualityScore: 0,
        processingTime: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * Merge content from two responses
   */
  private mergeContent(content1: string, content2: string, strategy: string): string {
    // Simple content merging - in production, this would be more sophisticated
    switch (strategy) {
      case 'consensus':
        return `${content1}\n\nAdditionally: ${content2}`;
      default:
        return `${content1}\n\n${content2}`;
    }
  }
}

/**
 * Conflict Resolver
 * Handles conflict resolution between agent responses
 */
class ConflictResolver {
  async resolveConflicts(
    conflicts: ConflictResolution[],
    responses: AgentResponse[]
  ): Promise<ConflictResolution[]> {
    const resolvedConflicts: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict, responses);
      resolvedConflicts.push({
        ...conflict,
        resolution: resolution.text,
        confidence: resolution.confidence
      });
    }

    return resolvedConflicts;
  }

  private async resolveConflict(
    conflict: ConflictResolution,
    responses: AgentResponse[]
  ): Promise<{ text: string; confidence: number }> {
    // Simple conflict resolution - in production, this would use AI/ML
    const participants = responses.filter(r => 
      conflict.participants.includes(r.agentId)
    );

    if (participants.length === 0) {
      return { text: 'No resolution available', confidence: 0 };
    }

    // Use highest confidence response as resolution
    const highestConfidence = participants.reduce((max, p) => 
      p.confidence > max.confidence ? p : max
    );

    return {
      text: `Resolved in favor of ${highestConfidence.metadata?.agentName || highestConfidence.agentId} based on higher confidence (${(highestConfidence.confidence * 100).toFixed(1)}%)`,
      confidence: highestConfidence.confidence
    };
  }
}

export const responseSynthesizer = new ResponseSynthesizer();
