/**
 * Intent Analyzer Interface - Contract for query intent analysis
 * 
 * This interface defines the contract for analyzing user queries to determine
 * intent, domain, required capabilities, and other factors that influence
 * agent selection.
 */

import { QueryIntent } from '@/core/domain/entities';

export interface IntentAnalysisResult {
  intent: QueryIntent;
  confidence: number;
  reasoning: string;
  extractedEntities: string[];
  suggestedActions: string[];
}

export interface IIntentAnalyzer {
  /**
   * Analyze a user query to determine intent and requirements
   */
  analyze(query: string): Promise<QueryIntent>;

  /**
   * Analyze with detailed results including confidence and reasoning
   */
  analyzeDetailed(query: string): Promise<IntentAnalysisResult>;

  /**
   * Extract entities from the query
   */
  extractEntities(query: string): Promise<string[]>;

  /**
   * Determine the complexity level of the query
   */
  determineComplexity(query: string): Promise<'low' | 'medium' | 'high'>;

  /**
   * Determine the urgency level of the query
   */
  determineUrgency(query: string): Promise<'low' | 'medium' | 'high'>;

  /**
   * Get suggested follow-up questions
   */
  getSuggestedFollowUps(query: string, intent: QueryIntent): Promise<string[]>;
}
