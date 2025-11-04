/**
 * MODE 2: AUTOMATIC AGENT SELECTION
 * 
 * Intelligent orchestrator that automatically selects the best agent for user queries,
 * then delegates to Mode 1 for execution with the same interactive features.
 * 
 * Features:
 * - Automatic agent selection via Pinecone semantic search
 * - Domain classification for agent filtering
 * - Intent analysis for capability matching
 * - Same RAG/Tools/Chat capabilities as Mode 1
 * - LangGraph workflow for orchestration
 * - Streaming responses with agent selection metadata
 */

import { StateGraph, START, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { Mode1ManualInteractiveHandler, type Mode1Config } from './mode1-manual-interactive';
import { agentSelectorService, type Agent, type QueryAnalysis, type AgentSelectionResult } from './agent-selector-service';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getAgentMetricsService } from '@/lib/services/observability/agent-metrics-service';
import {
  AgentSelectionError,
  serializeError,
  getErrorStatusCode,
} from '@/lib/errors/agent-errors';

// ============================================================================
// TYPES
// ============================================================================

export interface Mode2Config {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
}

/**
 * Mode 2 State Definition for LangGraph Workflow
 * 
 * This interface defines the complete state that flows through the Mode 2 LangGraph workflow.
 * Each node in the workflow can read from and write to this state.
 */
export interface Mode2State {
  // Input
  query: string;                    // User query text
  conversationHistory: BaseMessage[]; // Conversation history in LangChain format
  config: Mode2Config;             // Configuration object
  
  // Agent Selection Process
  detectedIntent: string;          // Extracted intent from query analysis
  detectedDomains: string[];       // Extracted domains from query analysis
  queryAnalysis: QueryAnalysis;    // Complete query analysis result
  candidateAgents: Agent[];        // Agents found via Pinecone search
  selectedAgent: Agent;            // Best agent selected by ranking
  agentSelectionReason: string;     // Human-readable reason for selection
  selectionConfidence: number;     // Confidence score (0-1)
  
  // Mode 1 Execution
  mode1Response: string;           // Aggregated textual response
  mode1Chunks: string[];           // Raw streaming chunks from Mode 1 (includes metadata markers)
  mode1Config: Mode1Config;        // Configuration passed to Mode 1
  
  // Metadata
  executionTime: number;           // Total execution time in ms
  timestamp: string;               // ISO timestamp
  error?: string;                  // Error message if workflow fails
}

export interface Mode2StreamChunk {
  type: 'agent_selection' | 'selection_reason' | 'chunk' | 'done';
  content?: string;
  selectedAgent?: Agent;
  selectionReason?: string;
  confidence?: number;
  timestamp?: string;
}

// ============================================================================
// MODE 2 HANDLER CLASS
// ============================================================================

export class Mode2AutomaticAgentSelectionHandler {
  private mode1Handler: Mode1ManualInteractiveHandler;
  private logger;

  constructor(options?: { requestId?: string; userId?: string }) {
    this.mode1Handler = new Mode1ManualInteractiveHandler();
    this.logger = createLogger({
      requestId: options?.requestId,
      userId: options?.userId,
    });
  }

  /**
   * Main entry point for Mode 2
   * Returns streaming generator with agent selection and response
   */
  async execute(config: Mode2Config): Promise<AsyncGenerator<Mode2StreamChunk>> {
    const workflowId = `mode2_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const startTime = Date.now();

    this.logger.info('mode2_execution_started', {
      operation: 'Mode2Execute',
      workflowId,
      queryPreview: config.message.substring(0, 100),
      enableRAG: config.enableRAG ?? true,
      enableTools: config.enableTools ?? true,
      model: config.model || 'default',
      userId: config.userId,
    });

    try {
      // Convert conversation history to BaseMessage format
      const baseMessages: BaseMessage[] = (config.conversationHistory || []).map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      // Initialize state
      const initialState: Mode2State = {
        query: config.message,
        conversationHistory: baseMessages,
        config,
        detectedIntent: '',
        detectedDomains: [],
        queryAnalysis: {} as QueryAnalysis,
        candidateAgents: [],
        selectedAgent: {} as Agent,
        agentSelectionReason: '',
        selectionConfidence: 0,
        mode1Response: '',
        mode1Chunks: [],
        mode1Config: {} as Mode1Config,
        executionTime: 0,
        timestamp: new Date().toISOString()
      };

      // Execute LangGraph workflow
      const workflow = this.buildMode2Workflow();
      const result = await workflow.invoke(initialState);

      // Calculate execution time
      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      // Record Mode 2 execution metrics (fire-and-forget)
      if (config.tenantId && result.selectedAgent?.id) {
        const metricsService = getAgentMetricsService();
        metricsService.recordOperation({
          agentId: result.selectedAgent.id,
          tenantId: config.tenantId,
          operationType: 'mode2',
          responseTimeMs: executionTime,
          success: true,
          queryText: config.message.substring(0, 1000),
          selectedAgentId: result.selectedAgent.id,
          confidenceScore: result.selectionConfidence,
          sessionId: config.sessionId,
          userId: config.userId || null,
          metadata: {
            workflowId,
            candidateCount: result.candidateAgents?.length || 0,
            selectionReason: result.agentSelectionReason,
            executionTime,
          },
        }).catch(() => {
          // Silent fail - metrics should never break main flow
        });
      }

      this.logger.infoWithMetrics('mode2_execution_completed', executionTime, {
        operation: 'Mode2Execute',
        workflowId,
        selectedAgent: result.selectedAgent.name,
        agentId: result.selectedAgent.id,
        confidence: result.selectionConfidence,
      });

      // Return streaming generator
      return this.createStreamingGenerator(result);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        'mode2_execution_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'Mode2Execute',
          workflowId,
          executionTime,
          queryPreview: config.message.substring(0, 100),
        }
      );
      throw error;
    }
  }

  /**
   * Build proper LangGraph workflow for Mode 2
   * 
   * This creates a StateGraph with proper schema following LangGraph best practices:
   * - Uses BaseMessage[] for conversation history
   * - Proper state management with channels
   * - Clear node definitions and edges
   * - Error handling and recovery
   */
  private buildMode2Workflow() {
    const workflow = new StateGraph<Mode2State>({
      channels: {
        query: { value: (x: string, y: string) => y ?? x },
        conversationHistory: { value: (x: BaseMessage[], y: BaseMessage[]) => y ?? x },
        config: { value: (x: Mode2Config, y: Mode2Config) => y ?? x },
        detectedIntent: { value: (x: string, y: string) => y ?? x },
        detectedDomains: { value: (x: string[], y: string[]) => y ?? x },
        queryAnalysis: { value: (x: QueryAnalysis, y: QueryAnalysis) => y ?? x },
        candidateAgents: { value: (x: Agent[], y: Agent[]) => y ?? x },
        selectedAgent: { value: (x: Agent, y: Agent) => y ?? x },
        agentSelectionReason: { value: (x: string, y: string) => y ?? x },
        selectionConfidence: { value: (x: number, y: number) => y ?? x },
        mode1Response: { value: (x: string, y: string) => y ?? x },
        mode1Chunks: { value: (x: string[], y: string[]) => y ?? x },
        mode1Config: { value: (x: Mode1Config, y: Mode1Config) => y ?? x },
        executionTime: { value: (x: number, y: number) => y ?? x },
        timestamp: { value: (x: string, y: string) => y ?? x },
        error: { value: (x: string | undefined, y: string | undefined) => y ?? x }
      }
    });

    // Add workflow nodes
    workflow.addNode('analyze_query', this.analyzeQueryNode.bind(this));
    workflow.addNode('find_candidates', this.findCandidatesNode.bind(this));
    workflow.addNode('rank_and_select', this.rankAndSelectNode.bind(this));
    workflow.addNode('execute_mode1', this.executeMode1Node.bind(this));

    // Define workflow edges
    workflow.addEdge(START, 'analyze_query');
    workflow.addEdge('analyze_query', 'find_candidates');
    workflow.addEdge('find_candidates', 'rank_and_select');
    workflow.addEdge('rank_and_select', 'execute_mode1');
    workflow.addEdge('execute_mode1', END);

    return workflow.compile();
  }

  /**
   * Node 1: Analyze query to extract intent and domains
   */
  private async analyzeQueryNode(state: Mode2State): Promise<Partial<Mode2State>> {
    this.logger.info('mode2_query_analysis_started', {
      operation: 'analyzeQuery',
      queryPreview: state.query.substring(0, 100),
    });

    try {
      const analysis = await agentSelectorService.analyzeQuery(state.query);

      this.logger.info('mode2_query_analysis_completed', {
        operation: 'analyzeQuery',
        intent: analysis.intent,
        domains: analysis.domains,
        complexity: analysis.complexity,
        confidence: analysis.confidence,
      });

      return {
        detectedIntent: analysis.intent,
        detectedDomains: analysis.domains,
        queryAnalysis: analysis
      };

    } catch (error) {
      this.logger.error(
        'mode2_query_analysis_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'analyzeQuery' }
      );
      
      // Fallback analysis
      return {
        detectedIntent: 'general',
        detectedDomains: [],
        queryAnalysis: {
          intent: 'general',
          domains: [],
          complexity: 'medium',
          keywords: [],
          medicalTerms: [],
          confidence: 0.5
        }
      };
    }
  }

  /**
   * Node 2: Find candidate agents using Pinecone semantic search
   */
  private async findCandidatesNode(state: Mode2State): Promise<Partial<Mode2State>> {
    this.logger.info('mode2_agent_search_started', {
      operation: 'searchCandidateAgents',
      domains: state.detectedDomains,
    });

    try {
      const candidates = await agentSelectorService.findCandidateAgents(
        state.query,
        state.detectedDomains,
        10
      );

      this.logger.info('mode2_agent_search_completed', {
        operation: 'searchCandidateAgents',
        candidateCount: candidates.length,
      });

      return {
        candidateAgents: candidates
      };

    } catch (error) {
      this.logger.error(
        'mode2_agent_search_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'searchCandidateAgents' }
      );
      
      // Return empty array as fallback
      return {
        candidateAgents: []
      };
    }
  }

  /**
   * Node 3: Rank agents and select the best one
   */
  private async rankAndSelectNode(state: Mode2State): Promise<Partial<Mode2State>> {
    this.logger.info('mode2_agent_ranking_started', {
      operation: 'rankAndSelectAgent',
      candidateCount: state.candidateAgents.length,
    });

    try {
      if (state.candidateAgents.length === 0) {
        throw new Error('No candidate agents found');
      }

      const rankings = agentSelectorService.rankAgents(
        state.candidateAgents,
        state.query,
        state.queryAnalysis
      );

      const selectedAgent = rankings[0];
      const confidence = Math.min(selectedAgent.score + state.queryAnalysis.confidence, 1);

      this.logger.info('mode2_agent_selection_completed', {
        operation: 'rankAndSelectAgent',
        selectedAgent: selectionResult.selectedAgent.name,
        agentId: selectionResult.selectedAgent.id,
        confidence: selectionResult.confidence,
        alternativeCount: selectionResult.alternativeAgents.length,
      });

      return {
        selectedAgent: selectedAgent.agent,
        agentSelectionReason: selectedAgent.reason,
        selectionConfidence: confidence
      };

    } catch (error) {
      this.logger.error(
        'mode2_agent_ranking_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'rankAndSelectAgent' }
      );
      
      // Fallback to first available agent
      if (state.candidateAgents.length > 0) {
        const fallbackAgent = state.candidateAgents[0];
        return {
          selectedAgent: fallbackAgent,
          agentSelectionReason: 'fallback selection due to ranking error',
          selectionConfidence: 0.3
        };
      }

      throw new Error('No agents available for selection');
    }
  }

  /**
   * Node 4: Execute with Mode 1 handler
   */
  private async executeMode1Node(state: Mode2State): Promise<Partial<Mode2State>> {
    this.logger.info('mode2_mode1_execution_started', {
      operation: 'executeMode1',
      selectedAgent: state.selectedAgent.name,
      agentId: state.selectedAgent.id,
    });

    try {
      // Create Mode 1 configuration
      const mode1Config: Mode1Config = {
        agentId: state.selectedAgent.id,
        message: state.query,
        conversationHistory: state.conversationHistory.map(msg => ({
          role: msg.constructor.name === 'HumanMessage' ? 'user' as const : 'assistant' as const,
          content: msg.content as string
        })),
        enableRAG: state.config.enableRAG ?? true,
        enableTools: state.config.enableTools ?? false,
        model: state.config.model,
        temperature: state.config.temperature ?? 0.7,
        maxTokens: state.config.maxTokens ?? 2000,
        selectedByOrchestrator: true
      };

      // Execute Mode 1 and collect response
      const mode1Stream = await this.mode1Handler.execute(mode1Config);
      const mode1Chunks: string[] = [];
      let fullResponse = '';

      for await (const chunk of mode1Stream) {
        mode1Chunks.push(chunk);
        if (typeof chunk === 'string' && !chunk.startsWith('__mode1_meta__')) {
          fullResponse += chunk;
        }
      }

      this.logger.info('mode2_mode1_execution_completed', {
        operation: 'executeMode1',
        selectedAgent: state.selectedAgent.name,
      });

      return {
        mode1Response: fullResponse,
        mode1Chunks,
        mode1Config
      };

    } catch (error) {
      this.logger.error(
        'mode2_mode1_execution_failed',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'executeMode1', selectedAgent: state.selectedAgent.name }
      );
      
      return {
        mode1Response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mode1Chunks: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        mode1Config: {} as Mode1Config
      };
    }
  }

  /**
   * Create streaming generator for real-time updates
   */
  private async *createStreamingGenerator(result: Mode2State): AsyncGenerator<Mode2StreamChunk> {
    // Stream agent selection info
    yield {
      type: 'agent_selection',
      selectedAgent: result.selectedAgent,
      confidence: result.selectionConfidence,
      timestamp: result.timestamp
    };

    // Stream selection reason
    yield {
      type: 'selection_reason',
      content: `Selected ${result.selectedAgent.name}: ${result.agentSelectionReason}`,
      selectionReason: result.agentSelectionReason,
      timestamp: result.timestamp
    };

    // Stream the actual response from Mode 1
    // For now, we'll stream the full response, but in a real implementation
    // we might want to stream it chunk by chunk as it's generated
    for (const chunk of result.mode1Chunks ?? []) {
      if (!chunk) {
        continue;
      }
      yield {
        type: 'chunk',
        content: chunk,
        timestamp: new Date().toISOString()
      };
    }

    // Stream completion
    yield {
      type: 'done',
      timestamp: result.timestamp
    };
  }

  /**
   * Get agent selection statistics for monitoring
   */
  getSelectionStats(result: Mode2State) {
    return {
      selectedAgent: result.selectedAgent.name,
      confidence: result.selectionConfidence,
      reasoning: result.agentSelectionReason,
      executionTime: result.executionTime,
      candidateCount: result.candidateAgents.length,
      queryAnalysis: {
        intent: result.detectedIntent,
        domains: result.detectedDomains,
        complexity: result.queryAnalysis.complexity
      }
    };
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Execute Mode 2 with automatic agent selection
 */
// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3001'; // Default to API Gateway (proper flow)

const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  '00000000-0000-0000-0000-000000000001';

interface Mode2AutomaticApiResponse {
  agent_id: string;
  content: string;
  confidence: number;
  citations: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  processing_time_ms: number;
  agent_selection: {
    selected_agent_id: string;
    selected_agent_name: string;
    selection_method: string;
    candidate_count: number;
    selection_confidence: number;
  };
}

/**
 * Build metadata chunk string to keep the UI streaming helpers working.
 */
function buildMetadataChunk(eventPayload: Record<string, unknown>): string {
  return `__mode2_meta__${JSON.stringify(eventPayload)}`;
}

/**
 * Convert Python response citations into the structure expected by the UI.
 */
function mapCitationsToSources(citations: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return citations.map((citation, index) => ({
    id: String(citation.id ?? `source-${index + 1}`),
    url: citation.url ?? citation.link ?? '#',
    title: citation.title ?? citation.name ?? `Source ${index + 1}`,
    excerpt: citation.relevant_quote ?? citation.excerpt ?? citation.summary ?? '',
    similarity: citation.similarity ?? citation.confidence_score ?? undefined,
    domain: citation.domain,
    evidenceLevel: citation.evidence_level ?? citation.evidenceLevel ?? 'Unknown',
    organization: citation.organization,
    reliabilityScore: citation.reliabilityScore,
    lastUpdated: citation.lastUpdated,
  }));
}

export async function* executeMode2(config: Mode2Config): AsyncGenerator<Mode2StreamChunk> {
  const requestId = `mode2_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const payload = {
      message: config.message,
      enable_rag: config.enableRAG !== false,
      enable_tools: config.enableTools ?? false,
      selected_rag_domains: config.selectedRagDomains ?? [],
      requested_tools: config.requestedTools ?? [],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      user_id: config.userId,
      tenant_id: config.tenantId,
      session_id: config.sessionId,
      conversation_history: config.conversationHistory ?? [],
    };

    // Call via API Gateway to comply with Golden Rule (Python services via gateway)
    const response = await fetch(`${API_GATEWAY_URL}/api/mode2/automatic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || errorBody.error || `API Gateway responded with status ${response.status}`);
    }

    const result = (await response.json()) as Mode2AutomaticApiResponse;

    // Emit agent selection metadata
    if (result.agent_selection) {
      yield {
        type: 'agent_selection',
        selectedAgent: {
          id: result.agent_selection.selected_agent_id,
          name: result.agent_selection.selected_agent_name,
        } as Agent,
        confidence: result.agent_selection.selection_confidence,
        timestamp: new Date().toISOString(),
      };

      yield {
        type: 'selection_reason',
        content: `Selected ${result.agent_selection.selected_agent_name} (${(result.agent_selection.selection_confidence * 100).toFixed(1)}% confidence)`,
        selectionReason: `Selected via ${result.agent_selection.selection_method}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Emit RAG sources if available
    const sources = mapCitationsToSources(result.citations || []);
    if (sources.length > 0) {
      yield buildMetadataChunk({
        event: 'rag_sources',
        total: sources.length,
        sources,
        strategy: 'python_orchestrator',
        cacheHit: false,
        domains: config.selectedRagDomains ?? [],
      });
    }

    // Emit final metadata
    yield buildMetadataChunk({
      event: 'final',
      confidence: result.confidence,
      rag: {
        totalSources: sources.length,
        strategy: 'python_orchestrator',
        domains: config.selectedRagDomains ?? [],
        cacheHit: false,
        retrievalTimeMs: result.processing_time_ms,
      },
      agent_selection: result.agent_selection,
      citations: result.citations ?? [],
      reasoning: result.reasoning ?? [],  // ✅ Add reasoning from API response
    });

    // Emit response content - stream word-by-word
    const words = result.content.split(' ');
    const wordsPerChunk = 3; // Stream 3 words at a time
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkContent = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
      yield {
        type: 'chunk',
        content: chunkContent,
        timestamp: new Date().toISOString(),
      };
      // Small delay for smoother streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Emit completion
    yield {
      type: 'done',
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield {
      type: 'chunk',
      content: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }
}

/**
 * Get agent selection result without streaming (for testing)
 */
export async function selectAgentForQuery(query: string): Promise<AgentSelectionResult> {
  return agentSelectorService.selectBestAgent(query);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate Mode 2 configuration
 */
export function validateMode2Config(config: Mode2Config): string[] {
  const errors: string[] = [];

  if (!config.message || config.message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (config.message && config.message.length > 4000) {
    errors.push('Message is too long (max 4000 characters)');
  }

  if (config.conversationHistory && config.conversationHistory.length > 50) {
    errors.push('Conversation history is too long (max 50 messages)');
  }

  if (config.temperature && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (config.maxTokens && (config.maxTokens < 100 || config.maxTokens > 8000)) {
    errors.push('Max tokens must be between 100 and 8000');
  }

  return errors;
}

/**
 * Format agent selection for display
 */
export function formatAgentSelection(agent: Agent, reason: string, confidence: number): string {
  return `${agent.name} (${(confidence * 100).toFixed(1)}% confidence) - ${reason}`;
}
