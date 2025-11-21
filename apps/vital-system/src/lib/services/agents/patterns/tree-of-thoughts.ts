/**
 * Tree of Thoughts (ToT) Pattern Implementation
 * 
 * Enables exploration of multiple reasoning paths with evaluation and pruning.
 * Implements research-backed ToT methodology for complex problem solving.
 * 
 * Features:
 * - Multiple reasoning path generation
 * - Path evaluation and scoring
 * - Automatic pruning of low-scoring branches
 * - Best path selection based on confidence
 * 
 * Architecture Principles:
 * - SOLID: Single responsibility, dependency injection, clean interfaces
 * - Type Safety: Full TypeScript with discriminated unions
 * - Observability: Structured logging, distributed tracing
 * - Resilience: Circuit breakers, retries, graceful degradation
 * - Performance: Parallel path exploration where possible
 * 
 * @module lib/services/agents/patterns/tree-of-thoughts
 * @version 1.0.0
 */

import { ChatOpenAI, ChatAnthropic } from '@langchain/openai';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getTracingService } from '@/lib/services/observability/tracing';
import { withRetry } from '@/lib/services/resilience/retry';
import { getSupabaseCircuitBreaker } from '@/lib/services/resilience/circuit-breaker';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Thought node in the tree
 */
export interface ThoughtNode {
  id: string;
  content: string;
  score: number; // 0-1 confidence score
  depth: number; // Depth in tree (0 = root)
  parent: ThoughtNode | null;
  children: ThoughtNode[];
  metadata: {
    timestamp: Date;
    agentId: string;
    reasoningType: 'initial' | 'expansion' | 'evaluation' | 'pruned';
    evaluationScores?: {
      logicalCoherence: number;
      progressTowardGoal: number;
      novelty: number;
      feasibility: number;
    };
  };
}

/**
 * Tree of Thoughts configuration
 */
export interface TreeOfThoughtsConfig {
  maxDepth?: number; // Maximum tree depth (default: 5)
  maxBranches?: number; // Maximum branches per node (default: 3)
  pruneThreshold?: number; // Minimum score to keep branch (default: 0.3)
  evaluationCriteria?: string[]; // Custom evaluation criteria
  enableParallelExpansion?: boolean; // Expand branches in parallel (default: true)
  llmProvider?: 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
}

/**
 * Path through tree (from root to leaf)
 */
export interface ThoughtPath {
  nodes: ThoughtNode[];
  totalScore: number; // Average of all node scores
  length: number; // Number of nodes
  confidence: number; // Overall confidence (0-1)
}

/**
 * ToT execution result
 */
export interface TreeOfThoughtsResult {
  root: ThoughtNode;
  bestPath: ThoughtPath;
  allPaths: ThoughtPath[];
  prunedCount: number;
  totalNodes: number;
  executionTime: number; // milliseconds
  metadata: {
    finalConfidence: number;
    reasoningSteps: string[];
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<Omit<TreeOfThoughtsConfig, 'evaluationCriteria'>> = {
  maxDepth: 5,
  maxBranches: 3,
  pruneThreshold: 0.3,
  enableParallelExpansion: true,
  llmProvider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
};

const DEFAULT_EVALUATION_CRITERIA = [
  'Logical coherence',
  'Progress toward goal',
  'Novelty and creativity',
  'Practical feasibility',
];

// ============================================================================
// TREE OF THOUGHTS CLASS
// ============================================================================

/**
 * Tree of Thoughts Implementation
 * 
 * Enables exploration of multiple reasoning paths with systematic evaluation.
 */
export class TreeOfThoughts {
  private root: ThoughtNode | null = null;
  private config: Required<Omit<TreeOfThoughtsConfig, 'evaluationCriteria'>> & {
    evaluationCriteria: string[];
  };
  private logger;
  private tracing;
  private circuitBreaker;
  private llm: ChatOpenAI | ChatAnthropic;

  constructor(config: TreeOfThoughtsConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      evaluationCriteria: config.evaluationCriteria || DEFAULT_EVALUATION_CRITERIA,
    };

    this.logger = createLogger();
    this.tracing = getTracingService();
    this.circuitBreaker = getSupabaseCircuitBreaker();

    // Initialize LLM
    if (this.config.llmProvider === 'anthropic') {
      this.llm = new ChatAnthropic({
        modelName: this.config.model,
        temperature: this.config.temperature,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else {
      this.llm = new ChatOpenAI({
        modelName: this.config.model,
        temperature: this.config.temperature,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Initialize tree with root thought
   * 
   * @param initialThought - The initial query or problem statement
   * @param agentId - ID of agent using ToT (for tracking)
   */
  async initialize(
    initialThought: string,
    agentId: string = 'system'
  ): Promise<void> {
    const spanId = this.tracing.startSpan('TreeOfThoughts.initialize', undefined, {
      agentId,
      thoughtPreview: initialThought.substring(0, 100),
    });

    try {
      this.root = {
        id: 'root',
        content: initialThought,
        score: 1.0, // Root always has full confidence
        depth: 0,
        parent: null,
        children: [],
        metadata: {
          timestamp: new Date(),
          agentId,
          reasoningType: 'initial',
        },
      };

      this.logger.info('tree_of_thoughts_initialized', {
        agentId,
        rootId: this.root.id,
        initialThought: initialThought.substring(0, 200),
      });

      this.tracing.endSpan(spanId, true);
    } catch (error) {
      this.logger.error(
        'tree_of_thoughts_initialize_failed',
        error instanceof Error ? error : new Error(String(error)),
        { agentId }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Expand a thought node with multiple branches
   * 
   * Uses LLM to generate diverse continuations or approaches.
   * 
   * @param node - Node to expand
   * @returns Array of new child nodes
   */
  async expand(node: ThoughtNode): Promise<ThoughtNode[]> {
    if (node.depth >= this.config.maxDepth) {
      this.logger.debug('tree_of_thoughts_max_depth_reached', {
        nodeId: node.id,
        depth: node.depth,
      });
      return [];
    }

    const spanId = this.tracing.startSpan('TreeOfThoughts.expand', undefined, {
      nodeId: node.id,
      depth: node.depth,
      maxBranches: this.config.maxBranches,
    });

    const startTime = Date.now();

    try {
      const prompt = `
Given this thought: "${node.content}"

Generate ${this.config.maxBranches} different continuations or approaches:
1. One that extends the current line of reasoning
2. One that challenges or questions it
3. One that takes an alternative approach

For each branch, provide:
THOUGHT N: [content]
REASONING: [why this approach]
CONFIDENCE: [0-1 score indicating confidence in this path]

Format each as:
THOUGHT 1: ...
REASONING: ...
CONFIDENCE: ...

THOUGHT 2: ...
REASONING: ...
CONFIDENCE: ...

THOUGHT 3: ...
REASONING: ...
CONFIDENCE: ...
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are a creative reasoning agent. Generate diverse, valuable thought continuations.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('tree_of_thoughts_expand_retry', {
              nodeId: node.id,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const branches = this.parseBranches(response.content.toString());
      const newNodes: ThoughtNode[] = [];

      for (let i = 0; i < branches.length && i < this.config.maxBranches; i++) {
        const branch = branches[i];
        const newNode: ThoughtNode = {
          id: `${node.id}-${newNodes.length}`,
          content: branch.content,
          score: branch.confidence * node.score, // Inherit and multiply parent score
          depth: node.depth + 1,
          parent: node,
          children: [],
          metadata: {
            timestamp: new Date(),
            agentId: node.metadata.agentId,
            reasoningType: 'expansion',
          },
        };

        node.children.push(newNode);
        newNodes.push(newNode);
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('tree_of_thoughts_expanded', duration, {
        nodeId: node.id,
        newNodesCount: newNodes.length,
        depth: node.depth + 1,
      });

      this.tracing.endSpan(spanId, true);

      return newNodes;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'tree_of_thoughts_expand_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          nodeId: node.id,
          duration,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return empty array
      return [];
    }
  }

  /**
   * Evaluate and score a thought path
   * 
   * Uses LLM to evaluate path quality against criteria.
   * 
   * @param node - Terminal node in path (evaluates full path from root)
   * @returns Score (0-1)
   */
  async evaluate(node: ThoughtNode): Promise<number> {
    const path = this.getPath(node);

    const spanId = this.tracing.startSpan('TreeOfThoughts.evaluate', undefined, {
      nodeId: node.id,
      pathLength: path.length,
    });

    const startTime = Date.now();

    try {
      const pathText = path
        .map((n, i) => `Step ${i + 1}: ${n.content}`)
        .join('\n');

      const criteriaText = this.config.evaluationCriteria
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n');

      const prompt = `
Evaluate this reasoning path:
${pathText}

Score on:
${criteriaText}

For each criterion, provide a score 0-10.
Then provide an overall score 0-1.

Format:
SCORES:
- Criterion 1: X/10
- Criterion 2: X/10
- ...

OVERALL_SCORE: [0-1]
REASONING: [Brief explanation of score]
      `.trim();

      const response = await withRetry(
        async () => {
          return this.circuitBreaker.execute(async () => {
            return await this.llm.invoke([
              new SystemMessage(
                'You are an evaluator. Assess reasoning paths objectively and rigorously.'
              ),
              new HumanMessage(prompt),
            ]);
          });
        },
        {
          maxRetries: 2,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            this.logger.warn('tree_of_thoughts_evaluate_retry', {
              nodeId: node.id,
              attempt,
              error: error instanceof Error ? error.message : String(error),
            });
          },
        }
      );

      const score = this.parseScore(response.content.toString());
      node.score = score;

      // Store evaluation details in metadata
      const scoreMatch = response.content.toString().match(/SCORES:([\s\S]*?)OVERALL_SCORE:/);
      if (scoreMatch) {
        const scores = scoreMatch[1]
          .match(/\d+/g)
          ?.map((s) => parseInt(s))
          .filter((s) => s >= 0 && s <= 10);

        if (scores && scores.length === this.config.evaluationCriteria.length) {
          node.metadata.evaluationScores = {
            logicalCoherence: scores[0] ?? 5,
            progressTowardGoal: scores[1] ?? 5,
            novelty: scores[2] ?? 5,
            feasibility: scores[3] ?? 5,
          };
        }
      }

      const duration = Date.now() - startTime;
      this.logger.debug('tree_of_thoughts_evaluated', {
        nodeId: node.id,
        score,
        duration,
      });

      this.tracing.endSpan(spanId, true);

      return score;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.warn('tree_of_thoughts_evaluate_failed', {
        nodeId: node.id,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      // Graceful degradation: return node's current score
      return node.score;
    }
  }

  /**
   * Prune low-scoring branches
   * 
   * Recursively removes branches below threshold.
   */
  prune(): void {
    if (!this.root) {
      return;
    }

    const spanId = this.tracing.startSpan('TreeOfThoughts.prune', undefined, {
      threshold: this.config.pruneThreshold,
    });

    const beforeCount = this.countNodes(this.root);

    try {
      this.pruneNode(this.root);

      const afterCount = this.countNodes(this.root);
      const prunedCount = beforeCount - afterCount;

      this.logger.info('tree_of_thoughts_pruned', {
        beforeNodes: beforeCount,
        afterNodes: afterCount,
        prunedCount,
        threshold: this.config.pruneThreshold,
      });

      this.tracing.endSpan(spanId, true);
    } catch (error) {
      this.logger.error(
        'tree_of_thoughts_prune_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Recursively prune node's children
   * 
   * @param node - Node to prune
   */
  private pruneNode(node: ThoughtNode): void {
    // Prune children first (bottom-up)
    node.children.forEach((child) => {
      this.pruneNode(child);
    });

    // Filter children based on threshold
    node.children = node.children.filter((child) => {
      if (child.score < this.config.pruneThreshold) {
        child.metadata.reasoningType = 'pruned';
        return false;
      }
      return true;
    });
  }

  /**
   * Select best path through tree
   * 
   * @returns Best path with highest average score
   */
  selectBestPath(): ThoughtPath | null {
    if (!this.root) {
      return null;
    }

    const spanId = this.tracing.startSpan('TreeOfThoughts.selectBestPath', undefined, {});

    try {
      const allPaths = this.getAllPaths(this.root);

      if (allPaths.length === 0) {
        this.tracing.endSpan(spanId, true);
        return null;
      }

      // Score each complete path
      const scoredPaths = allPaths.map((path) => {
        const totalScore = path.reduce((sum, node) => sum + node.score, 0);
        const avgScore = totalScore / path.length;
        const confidence = Math.min(1.0, avgScore);

        return {
          nodes: path,
          totalScore: avgScore,
          length: path.length,
          confidence,
        } as ThoughtPath;
      });

      // Sort by score (descending)
      scoredPaths.sort((a, b) => b.totalScore - a.totalScore);

      const bestPath = scoredPaths[0];

      this.logger.info('tree_of_thoughts_best_path_selected', {
        pathLength: bestPath.length,
        confidence: bestPath.confidence,
        totalScore: bestPath.totalScore,
        totalPaths: scoredPaths.length,
      });

      this.tracing.endSpan(spanId, true);

      return bestPath;
    } catch (error) {
      this.logger.error(
        'tree_of_thoughts_select_best_path_failed',
        error instanceof Error ? error : new Error(String(error)),
        {}
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      return null;
    }
  }

  /**
   * Execute full ToT workflow
   * 
   * Expands, evaluates, prunes, and selects best path.
   * 
   * @param initialThought - Starting query
   * @param agentId - Agent ID for tracking
   * @returns Complete ToT result
   */
  async execute(
    initialThought: string,
    agentId: string = 'system'
  ): Promise<TreeOfThoughtsResult> {
    const executionStart = Date.now();
    const spanId = this.tracing.startSpan('TreeOfThoughts.execute', undefined, {
      agentId,
      maxDepth: this.config.maxDepth,
    });

    try {
      // Initialize
      await this.initialize(initialThought, agentId);
      if (!this.root) {
        throw new Error('Failed to initialize tree');
      }

      // Expand and evaluate in breadth-first fashion
      let currentLevel: ThoughtNode[] = [this.root];
      let prunedCount = 0;

      for (let depth = 0; depth < this.config.maxDepth; depth++) {
        if (currentLevel.length === 0) {
          break;
        }

        // Expand all nodes at current level
        const expansionPromises = this.config.enableParallelExpansion
          ? currentLevel.map((node) => this.expand(node))
          : currentLevel.map(async (node) => await this.expand(node));

        const expansionResults = await Promise.all(expansionPromises);
        const newNodes = expansionResults.flat();

        if (newNodes.length === 0) {
          break; // No more expansion possible
        }

        // Evaluate all new nodes
        const evaluationPromises = this.config.enableParallelExpansion
          ? newNodes.map((node) => this.evaluate(node))
          : newNodes.map(async (node) => await this.evaluate(node));

        await Promise.all(evaluationPromises);

        // Prune before next level
        const beforePrune = this.countNodes(this.root!);
        this.prune();
        const afterPrune = this.countNodes(this.root!);
        prunedCount += beforePrune - afterPrune;

        // Get next level
        currentLevel = newNodes.filter(
          (node) => node.metadata.reasoningType !== 'pruned'
        );
      }

      // Select best path
      const bestPath = this.selectBestPath();

      if (!bestPath) {
        throw new Error('No valid path found in tree');
      }

      const executionTime = Date.now() - executionStart;
      const totalNodes = this.countNodes(this.root);

      const result: TreeOfThoughtsResult = {
        root: this.root,
        bestPath,
        allPaths: this.getAllPaths(this.root).map((nodes) => ({
          nodes,
          totalScore: nodes.reduce((sum, n) => sum + n.score, 0) / nodes.length,
          length: nodes.length,
          confidence: nodes.reduce((sum, n) => sum + n.score, 0) / nodes.length,
        })),
        prunedCount,
        totalNodes,
        executionTime,
        metadata: {
          finalConfidence: bestPath.confidence,
          reasoningSteps: bestPath.nodes.map((n) => n.content),
        },
      };

      this.logger.infoWithMetrics('tree_of_thoughts_executed', executionTime, {
        agentId,
        totalNodes,
        prunedCount,
        bestPathConfidence: bestPath.confidence,
        bestPathLength: bestPath.length,
      });

      this.tracing.endSpan(spanId, true);

      return result;
    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(
        'tree_of_thoughts_execute_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId,
          executionTime,
        }
      );

      this.tracing.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );

      throw error;
    }
  }

  /**
   * Get all paths from root to leaves
   * 
   * @param node - Starting node (usually root)
   * @returns Array of all complete paths
   */
  private getAllPaths(node: ThoughtNode, currentPath: ThoughtNode[] = []): ThoughtNode[][] {
    const newPath = [...currentPath, node];

    if (node.children.length === 0) {
      return [newPath];
    }

    const paths: ThoughtNode[][] = [];
    for (const child of node.children) {
      paths.push(...this.getAllPaths(child, newPath));
    }

    return paths;
  }

  /**
   * Get path from root to node
   * 
   * @param node - Target node
   * @returns Array of nodes from root to target
   */
  private getPath(node: ThoughtNode): ThoughtNode[] {
    const path: ThoughtNode[] = [];
    let current: ThoughtNode | null = node;

    while (current !== null) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  /**
   * Count total nodes in tree
   * 
   * @param node - Root node
   * @returns Total node count
   */
  private countNodes(node: ThoughtNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Parse branches from LLM response
   * 
   * @param response - LLM response text
   * @returns Array of parsed branches
   */
  private parseBranches(response: string): Array<{
    content: string;
    confidence: number;
    reasoning: string;
  }> {
    const branches: Array<{ content: string; confidence: number; reasoning: string }> = [];

    // Match THOUGHT N: ... REASONING: ... CONFIDENCE: ... pattern
    const thoughtPattern =
      /THOUGHT\s+(\d+):\s*(.+?)(?=REASONING:|THOUGHT\s+\d+:|$)/gis;
    const reasoningPattern = /REASONING:\s*(.+?)(?=CONFIDENCE:|THOUGHT\s+\d+:|$)/gis;
    const confidencePattern = /CONFIDENCE:\s*([\d.]+)/gi;

    const thoughtMatches = Array.from(response.matchAll(thoughtPattern));
    const reasoningMatches = Array.from(response.matchAll(reasoningPattern));
    const confidenceMatches = Array.from(response.matchAll(confidencePattern));

    for (let i = 0; i < thoughtMatches.length; i++) {
      const content = thoughtMatches[i][2]?.trim() || '';
      const reasoning = reasoningMatches[i]?.[1]?.trim() || '';
      const confidenceMatch = confidenceMatches[i];
      const confidence = confidenceMatch
        ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1])))
        : 0.7; // Default confidence

      if (content) {
        branches.push({ content, confidence, reasoning });
      }
    }

    return branches;
  }

  /**
   * Parse score from evaluator response
   * 
   * @param response - Evaluator response text
   * @returns Score (0-1)
   */
  private parseScore(response: string): number {
    const scoreMatch = response.match(/OVERALL_SCORE:\s*([\d.]+)/i);
    if (scoreMatch) {
      return Math.min(1.0, Math.max(0.0, parseFloat(scoreMatch[1])));
    }

    // Fallback: try to find any number between 0-1
    const fallbackMatch = response.match(/\b0?\.\d+\b/);
    if (fallbackMatch) {
      return Math.min(1.0, Math.max(0.0, parseFloat(fallbackMatch[0])));
    }

    return 0.5; // Default score if parsing fails
  }

  /**
   * Get tree statistics
   * 
   * @returns Tree statistics
   */
  getStats() {
    if (!this.root) {
      return {
        nodeCount: 0,
        depth: 0,
        paths: 0,
        averageScore: 0,
      };
    }

    const allPaths = this.getAllPaths(this.root);
    const allNodes = this.getAllNodes(this.root);
    const avgScore =
      allNodes.reduce((sum, n) => sum + n.score, 0) / allNodes.length;

    return {
      nodeCount: allNodes.length,
      depth: Math.max(...allNodes.map((n) => n.depth)),
      paths: allPaths.length,
      averageScore: avgScore,
    };
  }

  /**
   * Get all nodes in tree
   * 
   * @param node - Root node
   * @returns All nodes
   */
  private getAllNodes(node: ThoughtNode): ThoughtNode[] {
    const nodes = [node];
    for (const child of node.children) {
      nodes.push(...this.getAllNodes(child));
    }
    return nodes;
  }
}

