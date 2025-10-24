/**
 * RAGAs Evaluation Framework
 * Implements industry-standard RAG evaluation metrics
 * Based on RAGAs (RAG Assessment) methodology
 */

import { ChatOpenAI } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { createClient } from '@supabase/supabase-js';

export interface RAGEvaluationInput {
  query: string;
  answer: string;
  contexts: Document[];
  ground_truth?: string;
  retrieval_strategy: string;
  response_time_ms: number;
  session_id: string;
  user_id?: string;
}

export interface RAGEvaluationMetrics {
  // RAGAs Core Metrics
  context_precision: number;    // 0-1: How many retrieved contexts are relevant
  context_recall: number;       // 0-1: How much of the ground truth is covered
  faithfulness: number;         // 0-1: How faithful is the answer to the contexts
  answer_relevancy: number;     // 0-1: How relevant is the answer to the query
  
  // Additional Metrics
  response_time_ms: number;
  context_count: number;
  avg_context_length: number;
  retrieval_strategy: string;
  
  // Overall Score
  overall_score: number;        // 0-100: Weighted average of all metrics
}

export interface RAGEvaluationResult {
  metrics: RAGEvaluationMetrics;
  detailed_analysis: {
    context_analysis: ContextAnalysis;
    answer_analysis: AnswerAnalysis;
    retrieval_analysis: RetrievalAnalysis;
  };
  recommendations: string[];
  timestamp: string;
}

interface ContextAnalysis {
  relevant_contexts: number;
  total_contexts: number;
  relevance_scores: number[];
  coverage_percentage: number;
}

interface AnswerAnalysis {
  faithfulness_score: number;
  relevancy_score: number;
  completeness_score: number;
  hallucination_indicators: string[];
}

interface RetrievalAnalysis {
  strategy_performance: number;
  context_diversity: number;
  retrieval_efficiency: number;
}

export class RAGASEvaluator {
  private llm: ChatOpenAI;
  private supabase: any;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Evaluate RAG system performance using RAGAs methodology
   */
  async evaluate(input: RAGEvaluationInput): Promise<RAGEvaluationResult> {
    console.log('🔍 Starting RAGAs evaluation...');

    // 1. Context Precision - How many retrieved contexts are relevant
    const contextPrecision = await this.calculateContextPrecision(
      input.query,
      input.contexts,
      input.ground_truth
    );

    // 2. Context Recall - How much of ground truth is covered
    const contextRecall = await this.calculateContextRecall(
      input.contexts,
      input.ground_truth
    );

    // 3. Faithfulness - How faithful is answer to contexts
    const faithfulness = await this.calculateFaithfulness(
      input.answer,
      input.contexts
    );

    // 4. Answer Relevancy - How relevant is answer to query
    const answerRelevancy = await this.calculateAnswerRelevancy(
      input.query,
      input.answer
    );

    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore({
      context_precision: contextPrecision,
      context_recall: contextRecall,
      faithfulness: faithfulness,
      answer_relevancy: answerRelevancy,
    });

    // Detailed analysis
    const detailedAnalysis = await this.performDetailedAnalysis(input);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      context_precision: contextPrecision,
      context_recall: contextRecall,
      faithfulness: faithfulness,
      answer_relevancy: answerRelevancy,
      overall_score: overallScore,
    });

    const result: RAGEvaluationResult = {
      metrics: {
        context_precision: contextPrecision,
        context_recall: contextRecall,
        faithfulness: faithfulness,
        answer_relevancy: answerRelevancy,
        response_time_ms: input.response_time_ms,
        context_count: input.contexts.length,
        avg_context_length: this.calculateAvgContextLength(input.contexts),
        retrieval_strategy: input.retrieval_strategy,
        overall_score: overallScore,
      },
      detailed_analysis: detailedAnalysis,
      recommendations,
      timestamp: new Date().toISOString(),
    };

    // Store evaluation results
    await this.storeEvaluationResult(input, result);

    console.log(`✅ RAGAs evaluation complete. Overall score: ${overallScore.toFixed(1)}/100`);

    return result;
  }

  /**
   * Context Precision: Fraction of retrieved contexts that are relevant
   */
  private async calculateContextPrecision(
    query: string,
    contexts: Document[],
    groundTruth?: string
  ): Promise<number> {
    if (contexts.length === 0) return 0;

    const relevancePrompts = contexts.map((context, index) => 
      this.createRelevancePrompt(query, context.pageContent, index + 1)
    );

    const relevanceResults = await Promise.all(
      relevancePrompts.map(prompt => this.llm.invoke(prompt))
    );

    const relevanceScores = relevanceResults.map(result => 
      this.parseRelevanceScore(result.content as string)
    );

    const relevantContexts = relevanceScores.filter(score => score >= 0.7).length;
    return relevantContexts / contexts.length;
  }

  /**
   * Context Recall: Fraction of ground truth covered by retrieved contexts
   */
  private async calculateContextRecall(
    contexts: Document[],
    groundTruth?: string
  ): Promise<number> {
    if (!groundTruth || contexts.length === 0) return 0;

    const recallPrompt = this.createRecallPrompt(groundTruth, contexts);
    const recallResult = await this.llm.invoke(recallPrompt);
    
    return this.parseRecallScore(recallResult.content as string);
  }

  /**
   * Faithfulness: How faithful is the answer to the retrieved contexts
   */
  private async calculateFaithfulness(
    answer: string,
    contexts: Document[]
  ): Promise<number> {
    if (contexts.length === 0) return 0;

    const faithfulnessPrompt = this.createFaithfulnessPrompt(answer, contexts);
    const faithfulnessResult = await this.llm.invoke(faithfulnessPrompt);
    
    return this.parseFaithfulnessScore(faithfulnessResult.content as string);
  }

  /**
   * Answer Relevancy: How relevant is the answer to the query
   */
  private async calculateAnswerRelevancy(
    query: string,
    answer: string
  ): Promise<number> {
    const relevancyPrompt = this.createRelevancyPrompt(query, answer);
    const relevancyResult = await this.llm.invoke(relevancyPrompt);
    
    return this.parseRelevancyScore(relevancyResult.content as string);
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(metrics: {
    context_precision: number;
    context_recall: number;
    faithfulness: number;
    answer_relevancy: number;
  }): number {
    const weights = {
      context_precision: 0.25,
      context_recall: 0.25,
      faithfulness: 0.25,
      answer_relevancy: 0.25,
    };

    const weightedScore = 
      metrics.context_precision * weights.context_precision +
      metrics.context_recall * weights.context_recall +
      metrics.faithfulness * weights.faithfulness +
      metrics.answer_relevancy * weights.answer_relevancy;

    return Math.round(weightedScore * 100);
  }

  /**
   * Perform detailed analysis of RAG performance
   */
  private async performDetailedAnalysis(input: RAGEvaluationInput): Promise<{
    context_analysis: ContextAnalysis;
    answer_analysis: AnswerAnalysis;
    retrieval_analysis: RetrievalAnalysis;
  }> {
    // Context analysis
    const contextAnalysis: ContextAnalysis = {
      relevant_contexts: 0,
      total_contexts: input.contexts.length,
      relevance_scores: [],
      coverage_percentage: 0,
    };

    // Answer analysis
    const answerAnalysis: AnswerAnalysis = {
      faithfulness_score: 0,
      relevancy_score: 0,
      completeness_score: 0,
      hallucination_indicators: [],
    };

    // Retrieval analysis
    const retrievalAnalysis: RetrievalAnalysis = {
      strategy_performance: 0,
      context_diversity: 0,
      retrieval_efficiency: 0,
    };

    return {
      context_analysis: contextAnalysis,
      answer_analysis: answerAnalysis,
      retrieval_analysis: retrievalAnalysis,
    };
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(metrics: {
    context_precision: number;
    context_recall: number;
    faithfulness: number;
    answer_relevancy: number;
    overall_score: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.context_precision < 0.7) {
      recommendations.push('Improve retrieval strategy - consider hybrid search with re-ranking');
    }

    if (metrics.context_recall < 0.6) {
      recommendations.push('Increase retrieval count or improve query expansion');
    }

    if (metrics.faithfulness < 0.8) {
      recommendations.push('Add fact-checking and source verification');
    }

    if (metrics.answer_relevancy < 0.7) {
      recommendations.push('Improve prompt engineering and response generation');
    }

    if (metrics.overall_score < 70) {
      recommendations.push('Consider implementing advanced RAG techniques like RAG Fusion');
    }

    return recommendations;
  }

  /**
   * Store evaluation results in database
   */
  private async storeEvaluationResult(
    input: RAGEvaluationInput,
    result: RAGEvaluationResult
  ): Promise<void> {
    try {
      await this.supabase.from('rag_evaluations').insert({
        query: input.query,
        answer: input.answer,
        retrieval_strategy: input.retrieval_strategy,
        response_time_ms: input.response_time_ms,
        session_id: input.session_id,
        user_id: input.user_id,
        context_precision: result.metrics.context_precision,
        context_recall: result.metrics.context_recall,
        faithfulness: result.metrics.faithfulness,
        answer_relevancy: result.metrics.answer_relevancy,
        overall_score: result.metrics.overall_score,
        context_count: result.metrics.context_count,
        avg_context_length: result.metrics.avg_context_length,
        recommendations: result.recommendations,
        detailed_analysis: result.detailed_analysis,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to store evaluation result:', error);
    }
  }

  // Helper methods for prompt creation and parsing
  private createRelevancePrompt(query: string, context: string, index: number): string {
    return `Rate the relevance of this context to the query on a scale of 0-1.

Query: "${query}"

Context ${index}: "${context.substring(0, 500)}..."

Rate from 0 (completely irrelevant) to 1 (highly relevant). Respond with only a number between 0 and 1.`;
  }

  private createRecallPrompt(groundTruth: string, contexts: Document[]): string {
    const contextTexts = contexts.map((c, i) => `Context ${i + 1}: ${c.pageContent.substring(0, 300)}`).join('\n\n');
    
    return `Analyze how well the retrieved contexts cover the ground truth information.

Ground Truth: "${groundTruth}"

Retrieved Contexts:
${contextTexts}

Rate the coverage from 0 (no coverage) to 1 (complete coverage). Respond with only a number between 0 and 1.`;
  }

  private createFaithfulnessPrompt(answer: string, contexts: Document[]): string {
    const contextTexts = contexts.map((c, i) => `Context ${i + 1}: ${c.pageContent.substring(0, 300)}`).join('\n\n');
    
    return `Rate how faithful the answer is to the provided contexts on a scale of 0-1.

Answer: "${answer}"

Contexts:
${contextTexts}

Rate from 0 (completely unfaithful/hallucinated) to 1 (completely faithful). Respond with only a number between 0 and 1.`;
  }

  private createRelevancyPrompt(query: string, answer: string): string {
    return `Rate how relevant the answer is to the query on a scale of 0-1.

Query: "${query}"

Answer: "${answer}"

Rate from 0 (completely irrelevant) to 1 (highly relevant). Respond with only a number between 0 and 1.`;
  }

  private parseRelevanceScore(response: string): number {
    const match = response.match(/(\d*\.?\d+)/);
    return match ? Math.max(0, Math.min(1, parseFloat(match[1]))) : 0;
  }

  private parseRecallScore(response: string): number {
    const match = response.match(/(\d*\.?\d+)/);
    return match ? Math.max(0, Math.min(1, parseFloat(match[1]))) : 0;
  }

  private parseFaithfulnessScore(response: string): number {
    const match = response.match(/(\d*\.?\d+)/);
    return match ? Math.max(0, Math.min(1, parseFloat(match[1]))) : 0;
  }

  private parseRelevancyScore(response: string): number {
    const match = response.match(/(\d*\.?\d+)/);
    return match ? Math.max(0, Math.min(1, parseFloat(match[1]))) : 0;
  }

  private calculateAvgContextLength(contexts: Document[]): number {
    if (contexts.length === 0) return 0;
    const totalLength = contexts.reduce((sum, doc) => sum + doc.pageContent.length, 0);
    return Math.round(totalLength / contexts.length);
  }
}

/**
 * Batch evaluation for multiple queries
 */
export class BatchRAGEvaluator {
  private evaluator: RAGASEvaluator;

  constructor() {
    this.evaluator = new RAGASEvaluator();
  }

  async evaluateBatch(inputs: RAGEvaluationInput[]): Promise<{
    results: RAGEvaluationResult[];
    summary: BatchEvaluationSummary;
  }> {
    console.log(`🔍 Starting batch evaluation for ${inputs.length} queries...`);

    const results = await Promise.all(
      inputs.map(input => this.evaluator.evaluate(input))
    );

    const summary = this.calculateBatchSummary(results);

    console.log(`✅ Batch evaluation complete. Average score: ${summary.average_score.toFixed(1)}/100`);

    return { results, summary };
  }

  private calculateBatchSummary(results: RAGEvaluationResult[]): BatchEvaluationSummary {
    const total = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.metrics.overall_score, 0) / total;
    const averagePrecision = results.reduce((sum, r) => sum + r.metrics.context_precision, 0) / total;
    const averageRecall = results.reduce((sum, r) => sum + r.metrics.context_recall, 0) / total;
    const averageFaithfulness = results.reduce((sum, r) => sum + r.metrics.faithfulness, 0) / total;
    const averageRelevancy = results.reduce((sum, r) => sum + r.metrics.answer_relevancy, 0) / total;

    return {
      total_queries: total,
      average_score: averageScore,
      average_precision: averagePrecision,
      average_recall: averageRecall,
      average_faithfulness: averageFaithfulness,
      average_relevancy: averageRelevancy,
      score_distribution: this.calculateScoreDistribution(results),
    };
  }

  private calculateScoreDistribution(results: RAGEvaluationResult[]): {
    excellent: number;  // 90-100
    good: number;       // 70-89
    fair: number;       // 50-69
    poor: number;       // 0-49
  } {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    results.forEach(result => {
      const score = result.metrics.overall_score;
      if (score >= 90) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 50) distribution.fair++;
      else distribution.poor++;
    });

    return distribution;
  }
}

export interface BatchEvaluationSummary {
  total_queries: number;
  average_score: number;
  average_precision: number;
  average_recall: number;
  average_faithfulness: number;
  average_relevancy: number;
  score_distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}
