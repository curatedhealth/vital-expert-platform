/**
 * A/B Testing Framework for RAG Strategies
 * Enables systematic comparison of different RAG approaches
 */

import { createClient } from '@supabase/supabase-js';
import { CloudRAGService } from '../services/cloud-rag-service';
import { CachedRAGService } from '../services/cached-rag-service';
import { RAGASEvaluator, RAGEvaluationInput } from '../evaluation/ragas-evaluator';

export interface ABTestConfig {
  testName: string;
  description: string;
  strategies: string[];
  testQueries: Array<{
    query: string;
    ground_truth?: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  sampleSize: number;
  confidenceLevel: number; // 0.95 for 95% confidence
  maxDuration: number; // in hours
  evaluationMetrics: string[];
}

export interface ABTestResult {
  testId: string;
  testName: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  results: {
    [strategy: string]: {
      totalQueries: number;
      averageScore: number;
      averagePrecision: number;
      averageRecall: number;
      averageFaithfulness: number;
      averageRelevancy: number;
      averageResponseTime: number;
      winRate: number;
      confidenceInterval: {
        lower: number;
        upper: number;
      };
    };
  };
  winner: {
    strategy: string;
    score: number;
    statisticalSignificance: number;
  };
  recommendations: string[];
}

export interface QueryResult {
  query: string;
  strategy: string;
  answer: string;
  sources: any[];
  responseTime: number;
  evaluation: any;
  timestamp: string;
}

export class ABTestingFramework {
  private supabase: any;
  private ragService: CloudRAGService;
  private cachedRAGService: CachedRAGService;
  private evaluator: RAGASEvaluator;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.ragService = new CloudRAGService();
    this.cachedRAGService = new CachedRAGService();
    this.evaluator = new RAGASEvaluator();
  }

  /**
   * Create and start a new A/B test
   */
  async createABTest(config: ABTestConfig): Promise<string> {
    try {
      console.log(`🧪 Creating A/B test: ${config.testName}`);

      // Store test configuration
      const { data, error } = await this.supabase
        .from('rag_evaluation_benchmarks')
        .insert({
          benchmark_name: config.testName,
          description: config.description,
          retrieval_strategies: config.strategies,
          test_queries: config.testQueries,
          evaluation_criteria: {
            sample_size: config.sampleSize,
            confidence_level: config.confidenceLevel,
            max_duration: config.maxDuration,
            evaluation_metrics: config.evaluationMetrics,
          },
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const testId = data.id;
      console.log(`✅ A/B test created with ID: ${testId}`);

      // Start the test in background
      this.runABTest(testId, config).catch(error => {
        console.error('A/B test failed:', error);
        this.updateTestStatus(testId, 'failed');
      });

      return testId;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      throw error;
    }
  }

  /**
   * Run the A/B test
   */
  private async runABTest(testId: string, config: ABTestConfig): Promise<void> {
    console.log(`🚀 Starting A/B test: ${config.testName}`);

    const results: QueryResult[] = [];
    const startTime = Date.now();

    try {
      // Run queries for each strategy
      for (const strategy of config.strategies) {
        console.log(`📊 Testing strategy: ${strategy}`);

        // Sample queries for this strategy
        const sampledQueries = this.sampleQueries(config.testQueries, config.sampleSize);

        for (const queryConfig of sampledQueries) {
          try {
            const result = await this.executeQuery(queryConfig.query, strategy);
            
            // Evaluate the result
            const evaluation = await this.evaluateQuery(
              queryConfig.query,
              result,
              strategy,
              queryConfig.ground_truth
            );

            results.push({
              query: queryConfig.query,
              strategy,
              answer: result.answer,
              sources: result.sources,
              responseTime: result.responseTime || 0,
              evaluation,
              timestamp: new Date().toISOString(),
            });

            // Store individual result
            await this.storeQueryResult(testId, {
              query: queryConfig.query,
              strategy,
              answer: result.answer,
              sources: result.sources,
              responseTime: result.responseTime || 0,
              evaluation,
              timestamp: new Date().toISOString(),
            });

          } catch (error) {
            console.error(`Failed to execute query for strategy ${strategy}:`, error);
          }
        }
      }

      // Analyze results
      const analysis = await this.analyzeResults(results, config);
      
      // Update test with results
      await this.updateTestResults(testId, analysis);

      console.log(`✅ A/B test completed: ${config.testName}`);
      console.log(`🏆 Winner: ${analysis.winner.strategy} (${analysis.winner.score.toFixed(1)}%)`);

    } catch (error) {
      console.error('A/B test execution failed:', error);
      await this.updateTestStatus(testId, 'failed');
      throw error;
    }
  }

  /**
   * Execute a single query with a strategy
   */
  private async executeQuery(query: string, strategy: string): Promise<any> {
    try {
      // Use cached RAG service for better performance
      return await this.cachedRAGService.queryRAGWithCaching(query, strategy);
    } catch (error) {
      console.error(`Query execution failed for strategy ${strategy}:`, error);
      throw error;
    }
  }

  /**
   * Evaluate a query result
   */
  private async evaluateQuery(
    query: string,
    result: any,
    strategy: string,
    groundTruth?: string
  ): Promise<any> {
    try {
      const evaluationInput: RAGEvaluationInput = {
        query,
        answer: result.answer,
        contexts: result.sources || [],
        ground_truth: groundTruth,
        retrieval_strategy: strategy,
        response_time_ms: result.responseTime || 0,
        session_id: 'ab-test',
      };

      return await this.evaluator.evaluate(evaluationInput);
    } catch (error) {
      console.error('Query evaluation failed:', error);
      return null;
    }
  }

  /**
   * Analyze test results
   */
  private async analyzeResults(
    results: QueryResult[],
    config: ABTestConfig
  ): Promise<ABTestResult> {
    const strategyResults: { [strategy: string]: any[] } = {};

    // Group results by strategy
    for (const result of results) {
      if (!strategyResults[result.strategy]) {
        strategyResults[result.strategy] = [];
      }
      strategyResults[result.strategy].push(result);
    }

    // Calculate metrics for each strategy
    const strategyMetrics: { [strategy: string]: any } = {};

    for (const [strategy, strategyResults] of Object.entries(strategyResults)) {
      const metrics = this.calculateStrategyMetrics(strategyResults);
      strategyMetrics[strategy] = metrics;
    }

    // Determine winner
    const winner = this.determineWinner(strategyMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(strategyMetrics, winner);

    return {
      testId: '', // Will be set by caller
      testName: config.testName,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      results: strategyMetrics,
      winner,
      recommendations,
    };
  }

  /**
   * Calculate metrics for a strategy
   */
  private calculateStrategyMetrics(results: QueryResult[]): any {
    const totalQueries = results.length;
    const validResults = results.filter(r => r.evaluation);

    if (validResults.length === 0) {
      return {
        totalQueries,
        averageScore: 0,
        averagePrecision: 0,
        averageRecall: 0,
        averageFaithfulness: 0,
        averageRelevancy: 0,
        averageResponseTime: 0,
        winRate: 0,
        confidenceInterval: { lower: 0, upper: 0 },
      };
    }

    const averageScore = validResults.reduce((sum, r) => 
      sum + (r.evaluation?.metrics?.overall_score || 0), 0) / validResults.length;

    const averagePrecision = validResults.reduce((sum, r) => 
      sum + (r.evaluation?.metrics?.context_precision || 0), 0) / validResults.length;

    const averageRecall = validResults.reduce((sum, r) => 
      sum + (r.evaluation?.metrics?.context_recall || 0), 0) / validResults.length;

    const averageFaithfulness = validResults.reduce((sum, r) => 
      sum + (r.evaluation?.metrics?.faithfulness || 0), 0) / validResults.length;

    const averageRelevancy = validResults.reduce((sum, r) => 
      sum + (r.evaluation?.metrics?.answer_relevancy || 0), 0) / validResults.length;

    const averageResponseTime = results.reduce((sum, r) => 
      sum + r.responseTime, 0) / results.length;

    // Calculate confidence interval
    const scores = validResults.map(r => r.evaluation?.metrics?.overall_score || 0);
    const confidenceInterval = this.calculateConfidenceInterval(scores, 0.95);

    return {
      totalQueries,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePrecision: Math.round(averagePrecision * 1000) / 1000,
      averageRecall: Math.round(averageRecall * 1000) / 1000,
      averageFaithfulness: Math.round(averageFaithfulness * 1000) / 1000,
      averageRelevancy: Math.round(averageRelevancy * 1000) / 1000,
      averageResponseTime: Math.round(averageResponseTime),
      winRate: 0, // Will be calculated later
      confidenceInterval,
    };
  }

  /**
   * Determine the winning strategy
   */
  private determineWinner(strategyMetrics: { [strategy: string]: any }): {
    strategy: string;
    score: number;
    statisticalSignificance: number;
  } {
    const strategies = Object.entries(strategyMetrics);
    
    if (strategies.length === 0) {
      return { strategy: 'none', score: 0, statisticalSignificance: 0 };
    }

    // Sort by average score
    strategies.sort((a, b) => b[1].averageScore - a[1].averageScore);

    const winner = strategies[0];
    const runnerUp = strategies[1];

    // Calculate statistical significance
    const significance = this.calculateStatisticalSignificance(
      winner[1].averageScore,
      runnerUp?.[1]?.averageScore || 0,
      winner[1].totalQueries,
      runnerUp?.[1]?.totalQueries || 0
    );

    return {
      strategy: winner[0],
      score: winner[1].averageScore,
      statisticalSignificance: significance,
    };
  }

  /**
   * Calculate statistical significance
   */
  private calculateStatisticalSignificance(
    score1: number,
    score2: number,
    n1: number,
    n2: number
  ): number {
    if (n1 === 0 || n2 === 0) return 0;

    // Simplified t-test calculation
    const pooledVariance = ((n1 - 1) * 1 + (n2 - 1) * 1) / (n1 + n2 - 2);
    const standardError = Math.sqrt(pooledVariance * (1/n1 + 1/n2));
    const tStatistic = Math.abs(score1 - score2) / standardError;

    // Approximate p-value (simplified)
    if (tStatistic > 2.576) return 0.99; // 99% confidence
    if (tStatistic > 1.96) return 0.95;  // 95% confidence
    if (tStatistic > 1.645) return 0.90; // 90% confidence
    return 0.80; // 80% confidence
  }

  /**
   * Calculate confidence interval
   */
  private calculateConfidenceInterval(scores: number[], confidence: number): {
    lower: number;
    upper: number;
  } {
    if (scores.length === 0) return { lower: 0, upper: 0 };

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardError = Math.sqrt(variance / scores.length);

    // Z-score for confidence level
    const zScore = confidence === 0.95 ? 1.96 : 1.645;
    const margin = zScore * standardError;

    return {
      lower: Math.max(0, mean - margin),
      upper: Math.min(100, mean + margin),
    };
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(
    strategyMetrics: { [strategy: string]: any },
    winner: { strategy: string; score: number; statisticalSignificance: number }
  ): string[] {
    const recommendations: string[] = [];

    // Winner recommendation
    if (winner.statisticalSignificance > 0.95) {
      recommendations.push(`Strong evidence that ${winner.strategy} is the best strategy (${winner.score.toFixed(1)}% score)`);
    } else if (winner.statisticalSignificance > 0.90) {
      recommendations.push(`Moderate evidence that ${winner.strategy} is the best strategy (${winner.score.toFixed(1)}% score)`);
    } else {
      recommendations.push(`Inconclusive results. Consider running more tests or increasing sample size.`);
    }

    // Performance recommendations
    const strategies = Object.entries(strategyMetrics);
    const avgResponseTime = strategies.reduce((sum, [_, metrics]) => sum + metrics.averageResponseTime, 0) / strategies.length;

    strategies.forEach(([strategy, metrics]) => {
      if (metrics.averageResponseTime > avgResponseTime * 1.5) {
        recommendations.push(`${strategy} has high response time (${metrics.averageResponseTime}ms). Consider optimization.`);
      }
      if (metrics.averagePrecision < 0.7) {
        recommendations.push(`${strategy} has low precision (${metrics.averagePrecision.toFixed(3)}). Consider improving retrieval.`);
      }
      if (metrics.averageRecall < 0.6) {
        recommendations.push(`${strategy} has low recall (${metrics.averageRecall.toFixed(3)}). Consider increasing retrieval count.`);
      }
    });

    return recommendations;
  }

  /**
   * Sample queries for testing
   */
  private sampleQueries(queries: any[], sampleSize: number): any[] {
    if (queries.length <= sampleSize) return queries;

    // Stratified sampling by difficulty
    const easyQueries = queries.filter(q => q.difficulty === 'easy');
    const mediumQueries = queries.filter(q => q.difficulty === 'medium');
    const hardQueries = queries.filter(q => q.difficulty === 'hard');

    const easySample = Math.ceil(sampleSize * 0.3);
    const mediumSample = Math.ceil(sampleSize * 0.5);
    const hardSample = sampleSize - easySample - mediumSample;

    const sampled = [
      ...this.randomSample(easyQueries, easySample),
      ...this.randomSample(mediumQueries, mediumSample),
      ...this.randomSample(hardQueries, hardSample),
    ];

    return sampled.slice(0, sampleSize);
  }

  /**
   * Random sample from array
   */
  private randomSample<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  /**
   * Store individual query result
   */
  private async storeQueryResult(testId: string, result: QueryResult): Promise<void> {
    try {
      await this.supabase
        .from('rag_evaluations')
        .insert({
          query: result.query,
          answer: result.answer,
          retrieval_strategy: result.strategy,
          response_time_ms: result.responseTime,
          session_id: `ab-test-${testId}`,
          context_precision: result.evaluation?.metrics?.context_precision || 0,
          context_recall: result.evaluation?.metrics?.context_recall || 0,
          faithfulness: result.evaluation?.metrics?.faithfulness || 0,
          answer_relevancy: result.evaluation?.metrics?.answer_relevancy || 0,
          overall_score: result.evaluation?.metrics?.overall_score || 0,
          context_count: result.sources?.length || 0,
          avg_context_length: result.sources?.reduce((sum, s) => sum + (s.pageContent?.length || 0), 0) / (result.sources?.length || 1) || 0,
          created_at: result.timestamp,
        });
    } catch (error) {
      console.error('Failed to store query result:', error);
    }
  }

  /**
   * Update test results
   */
  private async updateTestResults(testId: string, results: ABTestResult): Promise<void> {
    try {
      await this.supabase
        .from('rag_evaluation_benchmarks')
        .update({
          results: results.results,
          winner_strategy: results.winner.strategy,
          statistical_significance: results.winner.statisticalSignificance,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', testId);
    } catch (error) {
      console.error('Failed to update test results:', error);
    }
  }

  /**
   * Update test status
   */
  private async updateTestStatus(testId: string, status: string): Promise<void> {
    try {
      await this.supabase
        .from('rag_evaluation_benchmarks')
        .update({ status })
        .eq('id', testId);
    } catch (error) {
      console.error('Failed to update test status:', error);
    }
  }

  /**
   * Get test results
   */
  async getTestResults(testId: string): Promise<ABTestResult | null> {
    try {
      const { data, error } = await this.supabase
        .from('rag_evaluation_benchmarks')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;

      return {
        testId: data.id,
        testName: data.benchmark_name,
        status: data.status,
        startTime: data.started_at,
        endTime: data.completed_at,
        results: data.results || {},
        winner: {
          strategy: data.winner_strategy || 'none',
          score: 0,
          statisticalSignificance: data.statistical_significance || 0,
        },
        recommendations: [],
      };
    } catch (error) {
      console.error('Failed to get test results:', error);
      return null;
    }
  }

  /**
   * List all tests
   */
  async listTests(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('rag_evaluation_benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to list tests:', error);
      return [];
    }
  }
}

// Export singleton instance
export const abTestingFramework = new ABTestingFramework();
