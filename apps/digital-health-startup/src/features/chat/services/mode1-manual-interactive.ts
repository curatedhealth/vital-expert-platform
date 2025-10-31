/**
 * MODE 1: MANUAL INTERACTIVE
 *
 * Simple, focused handler for manual agent selection mode.
 * User selects ONE agent, optionally enables RAG/Tools, and chats.
 *
 * Features:
 * - User manually selects agent
 * - Direct LLM call (user's choice: GPT-4, Claude, etc.)
 * - Optional RAG (manual enable/disable)
 * - Optional Tools (manual enable/disable)
 * - Simple LangGraph for tool execution
 * - Streaming responses
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { createClient } from '@supabase/supabase-js';
import { validateMode1Env } from '../../../lib/config/env-validation';
import {
  withTimeout,
  withTimeoutGenerator,
  MODE1_TIMEOUTS,
  TimeoutError,
} from '../../ask-expert/mode-1/utils/timeout-handler';
import { ToolRegistry } from '../../ask-expert/mode-1/tools/tool-registry';
import { convertRegistryToLangChainTools } from '../../ask-expert/mode-1/tools/langchain-tool-adapter';
import { Mode1ErrorHandler, withRetry, Mode1ErrorCode } from '../../ask-expert/mode-1/utils/error-handler';
import { llmCircuitBreaker, ragCircuitBreaker, toolCircuitBreaker } from '../../ask-expert/mode-1/utils/circuit-breaker';
import { mode1MetricsService, Mode1Metrics } from '../../ask-expert/mode-1/services/mode1-metrics';
import { StructuredLogger, LogLevel } from '@/lib/services/observability/structured-logger';
import { getAgentMetricsService } from '../../../lib/services/observability/agent-metrics-service';
import { llmService, LLMService } from '../../ask-expert/mode-1/services/llm-service';
import { messageBuilderService, MessageBuilderService } from '../../ask-expert/mode-1/services/message-builder-service';
import { mode1TracingService, Mode1TracingService } from '../../ask-expert/mode-1/services/mode1-tracing-service';
import { mode1AuditService, Mode1AuditService } from '../../ask-expert/mode-1/services/mode1-audit-service';
import { v4 as uuidv4 } from 'uuid';
import type { EnhancedRAGContext } from '../../ask-expert/mode-1/services/enhanced-rag-service';
import type { WebSearchToolResult } from '../../ask-expert/mode-1/tools/web-search-tool';
import { getAgentMemoryService } from '../../../lib/services/agents/agent-memory-service';

// ============================================================================
// TYPES
// ============================================================================

export interface Mode1Config {
  agentId: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string; // Override from prompt composer
  temperature?: number;
  maxTokens?: number;
  selectedByOrchestrator?: boolean; // Track if selected by Mode 2 orchestrator
  tenantId?: string; // For unified metrics tracking
  sessionId?: string; // For unified metrics tracking
  userId?: string; // For unified metrics tracking
  requestedTools?: string[];
  selectedRagDomains?: string[];
}

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model?: string;
  capabilities?: string[];
  tools?: string[];
  knowledge_domains?: string[]; // RAG domains for this agent (array of domain strings)
  metadata?: any;
}

const DEFAULT_AGENT_TOOLS = ['web_search', 'calculator', 'database_query'];

const WEB_SEARCH_STOP_WORDS = new Set([
  'the',
  'and',
  'with',
  'from',
  'that',
  'this',
  'have',
  'will',
  'your',
  'about',
  'into',
  'upon',
  'what',
  'when',
  'where',
  'which',
  'while',
  'does',
  'should',
  'need',
  'please',
  'latest',
  'current',
  'information',
  'guidance',
  'evidence',
  'using',
  'toward',
  'towards',
  'based',
  'ensure',
  'help',
  'make',
  'provide',
]);

type WebSearchAttempt = {
  query: string;
  searchType: 'general' | 'academic' | 'news' | 'regulatory';
  note: string;
};

type RagSummaryPayload = {
  totalSources: number;
  strategy?: string;
  domains?: string[];
  cacheHit?: boolean;
  warning?: string;
  retrievalTimeMs?: number;
};

type ToolSummaryPayload = {
  allowed: string[];
  used: string[];
  totals: {
    calls: number;
    success: number;
    failure: number;
    totalTimeMs: number;
  };
};

type BranchCitation = {
  number: number;
  text: string;
  sourceId?: string;
};

type BranchSource = {
  id: string;
  title: string;
  url?: string;
  excerpt?: string;
  similarity?: number;
  domain?: string;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D' | 'Unknown';
  organization?: string;
  reliabilityScore?: number;
  lastUpdated?: string;
};

type BranchResult = {
  id: string;
  content: string;
  confidence: number;
  citations: BranchCitation[];
  sources: BranchSource[];
  reasoning?: string[];
  createdAt: string;
};

type ToolEvidenceRecord = {
  title: string;
  url?: string;
  snippet?: string;
  provider?: string;
  gatheredAt: string;
  raw?: unknown;
};

type Mode1ExecutionArtifacts = {
  ragContext?: EnhancedRAGContext | null;
  toolEvidence: ToolEvidenceRecord[];
};

// ============================================================================
// MODE 1 HANDLER CLASS
// ============================================================================

export class Mode1ManualInteractiveHandler {
  private supabase;
  private toolRegistry: ToolRegistry;
  private logger: StructuredLogger;
  private llmService: LLMService;
  private messageBuilderService: MessageBuilderService;
  private tracingService: Mode1TracingService;
  private auditService: Mode1AuditService;
  private agentMemoryService = getAgentMemoryService();

  constructor() {
    // Validate environment variables on initialization
    const env = validateMode1Env();
    
    this.supabase = createClient(env.supabaseUrl, env.supabaseServiceKey);
    
    // Initialize tool registry
    const webSearchOptions = env.tavilyApiKey
      ? { provider: 'tavily' as const, apiKey: env.tavilyApiKey }
      : env.braveApiKey
        ? { provider: 'brave' as const, apiKey: env.braveApiKey }
        : env.googleSearchApiKey && env.googleSearchEngineId
          ? {
              provider: 'google' as const,
              apiKey: env.googleSearchApiKey,
              googleSearchEngineId: env.googleSearchEngineId,
            }
          : undefined;

    this.toolRegistry = new ToolRegistry(
      env.supabaseUrl,
      env.supabaseServiceKey,
      webSearchOptions ? { webSearch: webSearchOptions } : {}
    );

    // Initialize services
    this.llmService = llmService;
    this.messageBuilderService = messageBuilderService;
    this.tracingService = mode1TracingService;
    this.auditService = mode1AuditService;

    // Initialize structured logger
    this.logger = new StructuredLogger({
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }

  /**
   * Main entry point for Mode 1
   */
  async *execute(config: Mode1Config): AsyncGenerator<string> {
    const requestId = uuidv4();
    const startTime = Date.now();
    let agentFetchStart = Date.now();
    let allowedToolNames: string[] = [];
    let selectedRagDomains: string[] = [];
    let shouldUseRAG = false;
    const executionArtifacts: Mode1ExecutionArtifacts = {
      ragContext: null,
      toolEvidence: [],
    };
    let shouldUseTools = false;
    
    // Start trace for request
    const traceContext = this.tracingService.startTrace('mode1_execute', requestId);
    const rootSpanId = traceContext.spanId;
    
    // Set logger context for request tracing
    this.logger.setContext({ requestId });
    
    this.logger.info('Mode 1 execution started', {
      operation: 'mode1_execute',
      agentId: config.agentId,
      executionPath: this.determineExecutionPath(config),
      enableRAG: config.enableRAG,
      enableTools: config.enableTools,
      model: config.model || 'default',
      requestId,
      traceId: traceContext.traceId,
    });

    // Add trace tags
    this.tracingService.addTags(rootSpanId, {
      agentId: config.agentId,
      executionPath: this.determineExecutionPath(config),
      enableRAG: config.enableRAG ? 'true' : 'false',
      enableTools: config.enableTools ? 'true' : 'false',
      model: config.model || 'default',
    });

    // Initialize metrics
    const metrics: Mode1Metrics = {
      requestId,
      agentId: config.agentId,
      executionPath: this.determineExecutionPath(config),
      startTime,
      success: false,
      latency: {
        totalMs: 0,
      },
      metadata: {
        model: config.model,
        temperature: config.temperature,
        enableRAG: config.enableRAG,
        enableTools: config.enableTools,
      },
    };

    try {
      // Step 1: Get agent from database (with error handling, tracing, and audit logging)
      const agent = await this.tracingService.withSpan(
        'agent_fetch',
        async (spanId) => {
          this.tracingService.addTags(spanId, { agentId: config.agentId });
          const fetchedAgent = await withRetry(
            () => this.getAgent(config.agentId, config.tenantId),
            {
              maxRetries: 2,
              retryableErrors: [
                Mode1ErrorCode.DATABASE_CONNECTION_ERROR,
                Mode1ErrorCode.NETWORK_ERROR,
              ],
            }
          );
          
          // Audit log agent access
          if (fetchedAgent) {
            await this.auditService.logAgentAccess({
              userId: config.userId,
              tenantId: config.tenantId,
              agentId: config.agentId,
              requestId,
              executionPath: this.determineExecutionPath(config),
            }, true).catch(() => {
              // Non-blocking audit logging
            });
          }
          
          return fetchedAgent;
        },
        rootSpanId
      );

      metrics.latency.agentFetchMs = Date.now() - agentFetchStart;

      if (!agent) {
        // Audit log failed agent access
        await this.auditService.logAgentAccess({
          userId: config.userId,
          tenantId: config.tenantId,
          agentId: config.agentId,
          requestId,
          executionPath: this.determineExecutionPath(config),
        }, false, 'Agent not found').catch(() => {
          // Non-blocking audit logging
        });
        
        const error = Mode1ErrorHandler.createError(
          new Error(`Agent not found: ${config.agentId}`),
          { agentId: config.agentId, operation: 'getAgent' }
        );
        error.code = Mode1ErrorCode.AGENT_NOT_FOUND;
        error.userMessage = `The requested expert agent could not be found. Please verify the agent ID or select a different agent.`;
        Mode1ErrorHandler.logError(error);
        
        metrics.success = false;
        metrics.errorCode = error.code;
        metrics.latency.totalMs = Date.now() - startTime;
        mode1MetricsService.trackRequest(metrics);
        
        throw error;
      }

    // Log agent's RAG domains
    if (agent.knowledge_domains && agent.knowledge_domains.length > 0) {
      this.logger.debug('Agent RAG domains', {
        operation: 'mode1_agent_loaded',
        agentId: agent.id,
        knowledgeDomains: agent.knowledge_domains,
      });
    }

    selectedRagDomains = Array.isArray(config.selectedRagDomains) && config.selectedRagDomains.length > 0
      ? config.selectedRagDomains
          .map((domain) => (typeof domain === 'string' ? domain.trim() : ''))
          .filter((domain) => domain.length > 0)
      : Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
        : [];

    const agentMemoryRecords = await this.agentMemoryService.getAgentMemory(agent.id);
    const agentMemorySummaries = agentMemoryRecords.map((record) => record.summary).filter(Boolean);

    allowedToolNames = this.resolveAllowedTools(agent, config.requestedTools);
    shouldUseRAG = !!config.enableRAG && selectedRagDomains.length > 0;
    shouldUseTools = !!config.enableTools && allowedToolNames.length > 0;

    const finalExecutionPath: Mode1Metrics['executionPath'] =
      shouldUseRAG && shouldUseTools
        ? 'rag+tools'
        : shouldUseRAG
          ? 'rag'
          : shouldUseTools
            ? 'tools'
            : 'direct';

    metrics.executionPath = finalExecutionPath;
    metrics.metadata.enableRAG = shouldUseRAG;
    metrics.metadata.enableTools = shouldUseTools;
    this.tracingService.addTags(rootSpanId, { executionPath: finalExecutionPath });
    this.logger.debug('Mode 1 capability resolution', {
      operation: 'mode1_capability_resolution',
      agentId: agent.id,
      executionPath: finalExecutionPath,
      shouldUseRAG,
      shouldUseTools,
      requestedTools: config.requestedTools,
      resolvedTools: allowedToolNames,
      selectedRagDomains,
    });

    // Step 2: Initialize LLM (use model from config or agent default) with tracing
      const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
      const llm = await this.tracingService.withSpan(
        'llm_initialize',
        async (spanId) => {
          this.tracingService.addTags(spanId, { model: modelToUse });
          return this.llmService.initializeLLM({
            model: modelToUse,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          });
        },
        rootSpanId
      );

      // Step 3: Build conversation context with context management (with tracing)
      const messages = await this.tracingService.withSpan(
        'message_build',
        async (spanId) => {
          this.tracingService.addMetadata(spanId, {
            messageLength: config.message.length,
            historyLength: config.conversationHistory?.length || 0,
          });
          return await this.messageBuilderService.buildMessages(
            agent,
            config.message,
            config.conversationHistory,
            undefined,
            { 
              model: modelToUse,
              citationRequirement: shouldUseRAG ? 'required' : 'optional',
              agentMemory: agentMemorySummaries,
            }
          );
        },
        rootSpanId
      );

    // Step 4: Execute based on options (with metrics tracking and tracing)
      let executionGenerator: AsyncGenerator<string>;
      let finalAnswerBuffer = '';

      if (config.enableTools && !shouldUseTools) {
        this.logger.debug('Tools requested but not available for agent', {
          operation: 'mode1_tool_resolution',
          agentId: agent.id,
          requestedTools: config.requestedTools,
          agentTools: agent.tools,
        });
      }
      
      if (shouldUseRAG && shouldUseTools) {
        executionGenerator = this.executeWithRAGAndToolsWithMetrics(
          agent,
          messages,
          llm,
          config,
          metrics,
          requestId,
          allowedToolNames,
          selectedRagDomains,
          agentMemorySummaries,
          rootSpanId,
          executionArtifacts
        );
      } else if (shouldUseRAG) {
        executionGenerator = this.executeWithRAGWithMetrics(
          agent,
          messages,
          llm,
          config,
          metrics,
          selectedRagDomains,
          agentMemorySummaries,
          rootSpanId,
          executionArtifacts
        );
      } else if (shouldUseTools) {
        executionGenerator = this.executeWithToolsWithMetrics(
          agent,
          messages,
          llm,
          config,
          metrics,
          requestId,
          allowedToolNames,
          rootSpanId,
          executionArtifacts
        );
      } else {
        executionGenerator = this.executeDirectWithMetrics(messages, llm, metrics, rootSpanId);
      }

      // Yield all chunks while capturing final answer text for agent memory
      for await (const chunk of executionGenerator) {
        if (typeof chunk === 'string' && !chunk.startsWith('__mode1_meta__')) {
          finalAnswerBuffer += chunk;
        }
        yield chunk;
      }

      const finalAnswer = finalAnswerBuffer.trim();

      // End trace successfully
      metrics.success = true;
      metrics.latency.totalMs = Date.now() - startTime;
      mode1MetricsService.trackRequest(metrics);

      // Record unified metrics (fire-and-forget)
      if (config.tenantId && config.agentId) {
        const agentMetricsService = getAgentMetricsService();
        agentMetricsService.recordOperation({
          agentId: config.agentId,
          tenantId: config.tenantId,
          operationType: 'execution',
          responseTimeMs: metrics.latency.totalMs,
          success: true,
          queryText: config.message.substring(0, 1000),
          selectedAgentId: config.agentId,
          sessionId: config.sessionId,
          userId: config.userId || null,
          metadata: {
            requestId,
            executionPath: metrics.executionPath,
            enableRAG: config.enableRAG || false,
            enableTools: config.enableTools || false,
            model: config.model || 'default',
            selectedByOrchestrator: config.selectedByOrchestrator || false,
            mode: 'mode1',
          },
        }).catch(() => {
          // Silent fail - metrics should never break main flow
        });
      }

      const ragSummary = metrics.rag
        ? {
            totalSources: metrics.rag.sourcesFound || 0,
            strategy: metrics.rag.strategy,
            domains: metrics.rag.domainsSearched,
            cacheHit: metrics.rag.cacheHit ?? false,
            retrievalTimeMs: metrics.rag.retrievalTimeMs ?? metrics.latency.ragRetrievalMs,
            warning: metrics.rag.sourcesFound && metrics.rag.sourcesFound > 0
              ? undefined
              : 'Evidence required: responses are blocked until supporting documents are available.',
          }
        : {
            totalSources: 0,
            strategy: undefined,
            domains: selectedRagDomains,
            cacheHit: false,
            retrievalTimeMs: metrics.latency.ragRetrievalMs,
            warning: 'Evidence required: responses are blocked until supporting documents are available.',
          };

      const toolSummary = {
        allowed: allowedToolNames,
        used: metrics.tools?.toolsUsed ?? [],
        totals: {
          calls: metrics.tools?.calls ?? 0,
          success: metrics.tools?.successCount ?? 0,
          failure: metrics.tools?.failureCount ?? 0,
          totalTimeMs: metrics.tools?.totalToolTimeMs ?? 0,
        },
      };

      const branchPayload = await this.generateBranchPayload({
        agent,
        config,
        finalAnswer,
        ragSummary,
        toolSummary,
        artifacts: executionArtifacts,
        llm,
      });
      const activeBranchIndex = branchPayload.currentBranch ?? 0;
      const activeBranch = branchPayload.branches[activeBranchIndex] ?? branchPayload.branches[0];

      yield this.formatMetaEvent({
        event: 'final',
        executionPath: metrics.executionPath,
        durationMs: metrics.latency.totalMs,
        rag: ragSummary,
        tools: toolSummary,
        branches: branchPayload.branches,
        currentBranch: activeBranchIndex,
        confidence: activeBranch?.confidence ?? undefined,
        citations: activeBranch?.citations ?? [],
      });

      if (finalAnswer) {
        this.queueAgentMemory({
          agent,
          config,
          finalAnswer,
          ragSummary,
          toolSummary,
          existingSummaries: agentMemorySummaries,
          requestId,
        });
      }

      this.tracingService.endSpan(rootSpanId, true, undefined, {
        totalDuration: metrics.latency.totalMs,
        executionPath: this.determineExecutionPath(config),
      });
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        requestId,
        agentId: config.agentId,
      });
      metrics.success = false;
      metrics.errorCode = mode1Error.code;
      metrics.latency.totalMs = Date.now() - startTime;
      mode1MetricsService.trackRequest(metrics);

      // Record unified error metrics (fire-and-forget)
      if (config.tenantId && config.agentId) {
        const agentMetricsService = getAgentMetricsService();
        agentMetricsService.recordOperation({
          agentId: config.agentId,
          tenantId: config.tenantId,
          operationType: 'execution',
          responseTimeMs: metrics.latency.totalMs,
          success: false,
          errorOccurred: true,
          errorType: mode1Error.code || 'UnknownError',
          errorMessage: mode1Error.message?.substring(0, 500),
          queryText: config.message.substring(0, 1000),
          sessionId: config.sessionId,
          userId: config.userId || null,
          metadata: {
            requestId,
            executionPath: metrics.executionPath,
            errorCode: mode1Error.code,
            mode: 'mode1',
          },
        }).catch(() => {
          // Silent fail
        });
      }
      
      // End trace on error
      this.tracingService.endSpan(rootSpanId, false, mode1Error);
      
      const ragSummary = metrics.rag
        ? {
            totalSources: metrics.rag.sourcesFound || 0,
            strategy: metrics.rag.strategy,
            domains: metrics.rag.domainsSearched,
            cacheHit: metrics.rag.cacheHit ?? false,
            retrievalTimeMs: metrics.rag.retrievalTimeMs ?? metrics.latency.ragRetrievalMs,
            warning: metrics.rag.sourcesFound && metrics.rag.sourcesFound > 0
              ? undefined
              : 'Evidence required: responses are blocked until supporting documents are available.',
          }
        : {
            totalSources: 0,
            strategy: undefined,
            domains: selectedRagDomains,
            cacheHit: false,
            retrievalTimeMs: metrics.latency.ragRetrievalMs,
            warning: 'Evidence required: responses are blocked until supporting documents are available.',
          };

      const toolSummary = {
        allowed: allowedToolNames,
        used: metrics.tools?.toolsUsed ?? [],
        totals: {
          calls: metrics.tools?.calls ?? 0,
          success: metrics.tools?.successCount ?? 0,
          failure: metrics.tools?.failureCount ?? 0,
          totalTimeMs: metrics.tools?.totalToolTimeMs ?? 0,
        },
      };

      yield this.formatMetaEvent({
        event: 'final',
        executionPath: metrics.executionPath,
        durationMs: metrics.latency.totalMs,
        rag: ragSummary,
        tools: toolSummary,
        error: mode1Error.code || 'UnknownError',
      });

      throw mode1Error;
    }
  }

  /**
   * Determine execution path from config
   */
  private determineExecutionPath(config: Mode1Config): Mode1Metrics['executionPath'] {
    if (config.enableRAG && config.enableTools) return 'rag+tools';
    if (config.enableRAG) return 'rag';
    if (config.enableTools) return 'tools';
    return 'direct';
  }

  private parseStringArray(value: unknown): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item): item is string => item.length > 0);
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item): item is string => item.length > 0);
        }
      } catch {
        // Fall through to comma-separated parsing
      }

      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    if (typeof value === 'object') {
      const entries = Object.values(value as Record<string, unknown>);
      return entries
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item): item is string => item.length > 0);
    }

    return [];
  }

  private resolveAllowedTools(agent: Agent, requestedTools?: string[]): string[] {
    const registryToolNames = new Set(this.toolRegistry.getAvailableToolNames());

    const agentToolNames = Array.isArray(agent.tools)
      ? agent.tools
          .map((tool) => (typeof tool === 'string' ? tool.trim() : ''))
          .filter((tool) => tool.length > 0 && registryToolNames.has(tool))
      : [];

    if (agentToolNames.length === 0) {
      return [];
    }

    const agentToolSet = new Set(agentToolNames);

    const requested = (requestedTools || [])
      .map((tool) => (typeof tool === 'string' ? tool.trim() : ''))
      .filter((tool) => tool.length > 0 && agentToolSet.has(tool));

    if (requested.length > 0) {
      return Array.from(new Set(requested));
    }

    return Array.from(agentToolSet);
  }

  /**
   * Execute direct with metrics tracking
   */
  private async *executeDirectWithMetrics(
    messages: any[],
    llm: any,
    metrics: Mode1Metrics,
    parentSpanId?: string
  ): AsyncGenerator<string> {
    const llmStart = Date.now();
    let success = false;

    try {
      for await (const chunk of this.executeDirect(messages, llm, parentSpanId)) {
        yield chunk;
        success = true;
      }

      metrics.success = true;
      metrics.latency.llmCallMs = Date.now() - llmStart;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
    } catch (error) {
      metrics.success = false;
      metrics.errorCode = Mode1ErrorHandler.createError(error).code;
      metrics.latency.llmCallMs = Date.now() - llmStart;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      throw error;
    } finally {
      // Don't track here - tracked in main execute() method
    }
  }

  /**
   * Execute with RAG and metrics tracking
   */
  private async *executeWithRAGWithMetrics(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    metrics: Mode1Metrics,
    selectedRagDomains: string[],
    agentMemory: string[],
    parentSpanId?: string,
    artifacts?: Mode1ExecutionArtifacts
  ): AsyncGenerator<string> {
    const ragStart = Date.now();
    let ragContext: EnhancedRAGContext | null = null;

    try {
      const ragDomains =
        selectedRagDomains.length > 0
          ? selectedRagDomains
          : Array.isArray(agent.knowledge_domains)
            ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
            : [];

      yield this.emitReasoningStep(
        `Searching knowledge base across ${this.describeDomains(ragDomains)}...`
      );

      ragContext = await this.fetchRAGContext(agent, config, selectedRagDomains, parentSpanId);
      if (artifacts) {
        artifacts.ragContext = ragContext;
      }

      if (ragContext.totalSources === 0) {
        const fallback = await this.tryWebSearchFallback(agent, config, selectedRagDomains);
        if (fallback) {
          ragContext = fallback.ragContext;
          if (artifacts) {
            artifacts.ragContext = ragContext;
          }
          for (const message of fallback.reasoning) {
            yield this.emitReasoningStep(message);
          }
          metrics.latency.ragRetrievalMs = Date.now() - ragStart + (fallback.durationMs ?? 0);
        } else {
          metrics.latency.ragRetrievalMs = Date.now() - ragStart;
          yield this.emitReasoningStep(
            `No evidence found in ${this.describeDomains(ragContext.domainsSearched)}.`
          );
        }
      } else {
        metrics.latency.ragRetrievalMs = Date.now() - ragStart;
        yield this.emitReasoningStep(
          `Retrieved ${ragContext.totalSources} evidence source${ragContext.totalSources === 1 ? '' : 's'} from ${this.describeDomains(ragContext.domainsSearched)}.`
        );
      }

      metrics.rag = {
        sourcesFound: ragContext.totalSources,
        domainsSearched: ragContext.domainsSearched,
        strategy: ragContext.strategy,
        cacheHit: ragContext.cacheHit,
        retrievalTimeMs: ragContext.retrievalTime,
      };

      for await (const chunk of this.executeWithRAG(
        agent,
        messages,
        llm,
        config,
        selectedRagDomains,
        agentMemory,
        parentSpanId,
        ragContext,
        artifacts
      )) {
        yield chunk;
        if (chunk && !chunk.startsWith('Error:')) {
          metrics.success = true;
        }
      }
      metrics.latency.totalMs = Date.now() - metrics.startTime;
    } catch (error) {
      metrics.success = false;
      metrics.errorCode = Mode1ErrorHandler.createError(error).code;
      metrics.latency.ragRetrievalMs = Date.now() - ragStart;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      throw error;
    } finally {
      // Don't track here - tracked in main execute() method
    }
  }

  /**
   * Execute with Tools and metrics tracking
   */
  private async *executeWithToolsWithMetrics(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    metrics: Mode1Metrics,
    requestId: string,
    allowedToolNames: string[],
    parentSpanId?: string,
    artifacts?: Mode1ExecutionArtifacts
  ): AsyncGenerator<string> {
    const toolsStart = Date.now();
    const toolsUsed = new Set<string>();
    const toolEvidence: ToolEvidenceRecord[] = artifacts?.toolEvidence ?? [];
    let toolCalls = 0;
    let toolSuccesses = 0;
    let toolFailures = 0;
    let totalToolDuration = 0;

    try {
      const collectToolEvidence = (payload: { toolName: string; success: boolean; result: unknown }) => {
        if (!payload.success) {
          return;
        }
        const extracted = this.extractToolEvidence(payload.toolName, payload.result);
        if (extracted.length > 0) {
          toolEvidence.push(...extracted);
          if (artifacts) {
            artifacts.toolEvidence = toolEvidence;
          }
        }
      };

      const handleToolResult = (stats: { toolName: string; success: boolean; durationMs: number }) => {
        toolCalls += 1;
        totalToolDuration += stats.durationMs;
        toolsUsed.add(stats.toolName);
        if (stats.success) {
          toolSuccesses += 1;
        } else {
          toolFailures += 1;
        }
      };

      for await (const chunk of this.executeWithTools(
        agent,
        messages,
        llm,
        config,
        requestId,
        allowedToolNames,
        parentSpanId,
        handleToolResult,
        collectToolEvidence
      )) {
        yield chunk;
        metrics.success = true;
      }

      metrics.tools = {
        calls: toolCalls,
        successCount: toolSuccesses,
        failureCount: toolFailures,
        toolsUsed: Array.from(toolsUsed),
        totalToolTimeMs: totalToolDuration || Date.now() - toolsStart,
      };
      metrics.latency.toolExecutionMs = Date.now() - toolsStart;
      metrics.latency.totalMs = Date.now() - metrics.startTime;

      if (toolEvidence.length > 0) {
        yield this.emitReasoningStep('Persisting tool-derived evidence to knowledge base for future use.');
        const persistenceDomains = Array.isArray(config.selectedRagDomains)
          ? config.selectedRagDomains
          : [];
        try {
          await this.persistToolEvidence(toolEvidence, agent, persistenceDomains, config);
        } catch (error) {
          this.logger.warn('Failed to persist tool evidence', {
            operation: 'mode1_tool_persist',
            agentId: agent.id,
          }, error instanceof Error ? error : new Error(String(error)));
        }
      }
    } catch (error) {
      metrics.success = false;
      metrics.errorCode = Mode1ErrorHandler.createError(error).code;
      metrics.latency.toolExecutionMs = Date.now() - toolsStart;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      throw error;
    } finally {
      // Don't track here - tracked in main execute() method
    }
  }

  /**
   * Execute with RAG + Tools and metrics tracking
   */
  private async *executeWithRAGAndToolsWithMetrics(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    metrics: Mode1Metrics,
    requestId: string,
    allowedToolNames: string[],
    selectedRagDomains: string[],
    agentMemory: string[],
    parentSpanId?: string,
    artifacts?: Mode1ExecutionArtifacts
  ): AsyncGenerator<string> {
    const ragStart = Date.now();
    let toolsStart = Date.now();
    let ragContext: EnhancedRAGContext | null = null;
    const toolsUsed = new Set<string>();
    const toolEvidence: ToolEvidenceRecord[] = artifacts?.toolEvidence ?? [];
    let toolCalls = 0;
    let toolSuccesses = 0;
    let toolFailures = 0;
    let totalToolDuration = 0;
    
    try {
      const ragDomains =
        selectedRagDomains.length > 0
          ? selectedRagDomains
          : Array.isArray(agent.knowledge_domains)
            ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
            : [];

      yield this.emitReasoningStep(
        `Searching knowledge base across ${this.describeDomains(ragDomains)} before executing tools...`
      );

      ragContext = await this.fetchRAGContext(agent, config, selectedRagDomains, parentSpanId);
      if (artifacts) {
        artifacts.ragContext = ragContext;
      }

      if (ragContext.totalSources === 0) {
        const fallback = await this.tryWebSearchFallback(agent, config, selectedRagDomains);
        if (fallback) {
          ragContext = fallback.ragContext;
          if (artifacts) {
            artifacts.ragContext = ragContext;
          }
          for (const message of fallback.reasoning) {
            yield this.emitReasoningStep(message);
          }
          metrics.latency.ragRetrievalMs = Date.now() - ragStart + (fallback.durationMs ?? 0);
        } else {
          metrics.latency.ragRetrievalMs = Date.now() - ragStart;
          yield this.emitReasoningStep(
            `No evidence found in ${this.describeDomains(ragContext.domainsSearched)}.`
          );
        }
      } else {
        metrics.latency.ragRetrievalMs = Date.now() - ragStart;
        yield this.emitReasoningStep(
          `Retrieved ${ragContext.totalSources} evidence source${ragContext.totalSources === 1 ? '' : 's'} from ${this.describeDomains(ragContext.domainsSearched)}.`
        );
      }

      metrics.rag = {
        sourcesFound: ragContext.totalSources,
        domainsSearched: ragContext.domainsSearched,
        strategy: ragContext.strategy,
        cacheHit: ragContext.cacheHit,
        retrievalTimeMs: ragContext.retrievalTime,
      };
      toolsStart = Date.now();

      const handleToolResult = (stats: { toolName: string; success: boolean; durationMs: number }) => {
        toolCalls += 1;
        totalToolDuration += stats.durationMs;
        toolsUsed.add(stats.toolName);
        if (stats.success) {
          toolSuccesses += 1;
        } else {
          toolFailures += 1;
        }
      };

      const collectToolEvidence = (payload: { toolName: string; success: boolean; result: unknown }) => {
        if (!payload.success) {
          return;
        }
        const extracted = this.extractToolEvidence(payload.toolName, payload.result);
        if (extracted.length > 0) {
          toolEvidence.push(...extracted);
          if (artifacts) {
            artifacts.toolEvidence = toolEvidence;
          }
        }
      };

      for await (const chunk of this.executeWithRAGAndTools(
        agent,
        messages,
        llm,
        config,
        requestId,
        allowedToolNames,
        selectedRagDomains,
        agentMemory,
        parentSpanId,
        handleToolResult,
        collectToolEvidence,
        ragContext
      )) {
        yield chunk;
        metrics.success = true;
      }

      metrics.latency.toolExecutionMs = Date.now() - toolsStart;
      metrics.tools = {
        calls: toolCalls,
        successCount: toolSuccesses,
        failureCount: toolFailures,
        toolsUsed: Array.from(toolsUsed),
        totalToolTimeMs: totalToolDuration || Date.now() - toolsStart,
      };
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      if (toolEvidence.length > 0) {
        yield this.emitReasoningStep('Persisting tool-derived evidence to knowledge base for future use.');
        try {
          await this.persistToolEvidence(toolEvidence, agent, selectedRagDomains, config);
        } catch (error) {
          this.logger.warn('Failed to persist tool evidence', {
            operation: 'mode1_tool_persist',
            agentId: agent.id,
          }, error instanceof Error ? error : new Error(String(error)));
        }
      }
    } catch (error) {
      metrics.success = false;
      metrics.errorCode = Mode1ErrorHandler.createError(error).code;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      throw error;
    }
  }

  /**
   * Get agent from database (with error handling and tenant isolation)
   */
  private async getAgent(agentId: string, tenantId?: string): Promise<Agent | null> {
    try {
      let query = this.supabase
        .from('agents')
        .select('id, name, system_prompt, model, capabilities, metadata')
        .eq('id', agentId);
      
      // Add tenant isolation if tenantId provided
      // Note: RLS policies should enforce this, but explicit filtering adds defense-in-depth
      if (tenantId) {
        // Check if agent has tenant_id column and filter if available
        // If RLS is enabled, this will be enforced by database policies
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query.single();

      if (error) {
        const mode1Error = Mode1ErrorHandler.createError(error, {
          agentId,
          operation: 'getAgent',
        });
        Mode1ErrorHandler.logError(mode1Error);
        throw mode1Error;
      }

      if (!data) {
        return null;
      }

      // Check if agent is active
      if (data.metadata?.status === 'inactive') {
        const error = Mode1ErrorHandler.createError(
          new Error(`Agent ${agentId} is inactive`),
          { agentId, operation: 'getAgent' }
        );
        error.code = Mode1ErrorCode.AGENT_INACTIVE;
        error.userMessage = 'This expert agent is currently unavailable. Please select a different agent.';
        Mode1ErrorHandler.logError(error);
        throw error;
      }

      const tools = this.parseStringArray(
        data.metadata?.tools ??
        data.metadata?.allowed_tools ??
        data.metadata?.available_tools ??
        (data as Record<string, unknown>)?.tools ??
        (data as Record<string, unknown>)?.tool_access
      );

      const normalizedTools = Array.from(
        new Set([
          ...DEFAULT_AGENT_TOOLS,
          ...tools,
        ])
      );

      const knowledgeDomains = this.parseStringArray(
        data.metadata?.knowledge_domains ??
        data.metadata?.knowledgeDomains ??
        (data as Record<string, unknown>)?.knowledge_domains
      );

      return {
        ...data,
        tools: normalizedTools,
        knowledge_domains: knowledgeDomains
      };
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        agentId,
        operation: 'getAgent',
      });
      throw mode1Error;
    }
  }

  // initializeLLM and buildMessages methods removed - now using LLMService and MessageBuilderService

  /**
   * OPTION 1: Direct LLM call (no RAG, no tools)
   */
  private async *executeDirect(messages: any[], llm: any, parentSpanId?: string): AsyncGenerator<string> {
    this.logger.debug('Executing direct LLM call', {
      operation: 'mode1_execute_direct',
    });

    try {
      yield* this.tracingService.withSpanGenerator(
        'llm_stream_direct',
        async function* (spanId) {
          yield* this.llmService.streamLLM(llm, messages);
        }.bind(this),
        parentSpanId,
        { executionPath: 'direct' }
      );
      
      this.logger.debug('Direct execution completed', {
        operation: 'mode1_execute_direct',
      });
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        operation: 'executeDirect',
      });
      Mode1ErrorHandler.logError(mode1Error);
      yield Mode1ErrorHandler.formatUserMessage(mode1Error);
    }
  }

  /**
   * OPTION 2: With RAG (retrieve relevant context first)
   */
  private async *executeWithRAG(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    selectedRagDomains: string[],
    agentMemory: string[],
    parentSpanId?: string,
    preloadedContext?: EnhancedRAGContext,
    artifacts?: Mode1ExecutionArtifacts
  ): AsyncGenerator<string> {
    this.logger.debug('Executing with RAG', {
      operation: 'mode1_execute_rag',
    });

    try {
      let ragContext = preloadedContext ?? await this.fetchRAGContext(
        agent,
        config,
        selectedRagDomains,
        parentSpanId
      );
      if (artifacts) {
        artifacts.ragContext = ragContext;
      }

      if (ragContext.totalSources === 0) {
        const fallback = await this.tryWebSearchFallback(agent, config, selectedRagDomains);
        if (fallback) {
          ragContext = fallback.ragContext;
          if (artifacts) {
            artifacts.ragContext = ragContext;
          }
          for (const message of fallback.reasoning) {
            yield this.emitReasoningStep(message);
          }
        } else {
          yield this.formatMetaEvent({
            event: 'rag_warning',
            message: 'Evidence required: no supporting documents were retrieved. Please adjust knowledge domains, widen the query, or explicitly allow responses without evidence.',
          });
          this.raiseNoEvidenceError(agent, ragContext, selectedRagDomains);
          return;
        }
      }

      if (ragContext.totalSources > 0) {
        yield this.formatMetaEvent({
          event: 'rag_sources',
          total: ragContext.totalSources,
          strategy: ragContext.strategy,
          domains: ragContext.domainsSearched,
          sources: ragContext.sources,
          cacheHit: ragContext.cacheHit,
          retrievalTimeMs: ragContext.retrievalTime,
        });
      }

      // Rebuild messages with RAG context using MessageBuilderService (with tracing)
      const ragContextForManager = ragContext.context
        ? [{
            content: ragContext.context,
            relevance: 0.9, // High relevance for RAG context
          }]
        : [];
      
      const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
      const enhancedMessages = await this.tracingService.withSpan(
        'message_build_with_rag',
        async (spanId) => {
          return await this.messageBuilderService.buildMessages(
            agent,
            config.message,
            config.conversationHistory,
            ragContextForManager,
            { 
              model: modelToUse,
              agentMemory,
              citationRequirement: 'required',
            }
          );
        },
        parentSpanId
      );

      // Use LLM service for streaming (with tracing)
      yield* this.tracingService.withSpanGenerator(
        'llm_stream_with_rag',
        async function* (spanId) {
          yield this.emitReasoningStep('Synthesizing final response using retrieved evidence.');
          yield* this.llmService.streamLLM(llm, enhancedMessages);
        }.bind(this),
        parentSpanId,
        { executionPath: 'rag' }
      );

      this.logger.debug('RAG execution completed', {
        operation: 'mode1_execute_rag',
      });
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        operation: 'executeWithRAG',
        agentId: agent.id,
      });
      Mode1ErrorHandler.logError(mode1Error);
      yield Mode1ErrorHandler.formatUserMessage(mode1Error);
    }
  }

  /**
   * OPTION 3: With Tools (real execution)
   * Uses LangChain function calling to execute tools dynamically
   */
  private async *executeWithTools(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    requestId: string,
    allowedToolNames: string[],
    parentSpanId?: string,
    onToolResult?: (stats: { toolName: string; success: boolean; durationMs: number }) => void,
    onToolEvidence?: (payload: {
      toolName: string;
      success: boolean;
      result: unknown;
    }) => void
  ): AsyncGenerator<string> {
    this.logger.debug('Executing with tools', {
      operation: 'mode1_execute_tools',
    });

    try {
      // Convert tools to LangChain format
      const langchainTools = convertRegistryToLangChainTools(this.toolRegistry, allowedToolNames);
      
      // Bind tools to LLM for function calling
      const llmWithTools = llm.bindTools(langchainTools);

      // Build enhanced system prompt
      const systemPrompt = `${agent.system_prompt}\n\n## Available Tools:\n${langchainTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nUse tools when you need current information, calculations, or database queries.`;
      const enhancedMessages = [
        new SystemMessage(systemPrompt),
        ...messages.slice(1) // Skip existing system message if any
      ];

      // Execute tool calling loop (max 5 iterations to prevent infinite loops)
      let currentMessages = enhancedMessages;
      let iterations = 0;
      const maxIterations = 5;
      let finalResponse = '';

      while (iterations < maxIterations) {
        iterations++;
        this.logger.debug('Tool execution iteration', {
          operation: 'mode1_tool_iteration',
          iteration: iterations,
          maxIterations,
        });

        // Call LLM with tools using LLM service (returns full response object with tool_calls)
        const response = await this.llmService.invokeLLM(
          llmWithTools,
          currentMessages,
          { tools: langchainTools, timeout: MODE1_TIMEOUTS.LLM_CALL }
        );

        // Check if LLM wants to call a tool
        // In LangChain, tool calls are in response.tool_calls (array)
        const toolCalls = (response as any).tool_calls || [];
        
        if (toolCalls.length === 0) {
          // No tool calls, this is the final response
          finalResponse = response.content;
          break;
        }

        // Execute tool calls
        const toolMessages: ToolMessage[] = [];
        for (const toolCall of toolCalls) {
          const rawToolName = toolCall.name || toolCall.function?.name;
          if (typeof rawToolName !== 'string' || rawToolName.length === 0) {
            this.logger.warn('Received tool call without a valid name', {
              operation: 'mode1_tool_execute',
              toolCallId: toolCall.id,
            });
            continue;
          }

          const toolName = rawToolName;
          const toolArgs = toolCall.args || (toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {});
          const toolCallId = toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`;
          
          this.logger.debug('Executing tool', {
            operation: 'mode1_tool_execute',
            toolName,
            toolArgs: Object.keys(toolArgs),
          });

          const argSummary = Object.keys(toolArgs || {}).length > 0
            ? `arguments (${Object.keys(toolArgs).join(', ')})`
            : 'no arguments';
          yield this.emitReasoningStep(`Tool "${toolName}" invoked with ${argSummary}.`);
          
          try {
            // Use circuit breaker for tool execution
            const toolResult = await toolCircuitBreaker.execute(
              async () => {
                return await withTimeout(
                  this.toolRegistry.executeTool(
                    toolName,
                    toolArgs as Record<string, unknown>,
                    {
                      agent_id: agent.id,
                      tenant_id: config.tenantId,
                      user_id: config.userId,
                    }
                  ),
                  MODE1_TIMEOUTS.TOOL_EXECUTION,
                  `Tool ${toolName} execution timed out`
                );
              },
              async () => {
                // Fallback: return error result when circuit breaker is open
                return {
                  success: false,
                  error: `Tool ${toolName} unavailable (circuit breaker open)`,
                  result: null,
                  duration_ms: 0,
                };
              }
            );

            onToolResult?.({
              toolName,
              success: toolResult.success,
              durationMs: toolResult.duration_ms,
            });

            // Audit log tool execution
            await this.auditService.logToolExecution(
              {
                userId: config.userId,
                tenantId: config.tenantId,
                agentId: agent.id,
                sessionId: config.sessionId,
                requestId,
                executionPath: 'tools',
              },
              toolName,
              toolArgs,
              toolResult
            ).catch(() => {
              // Non-blocking audit logging
            });

            yield this.emitReasoningStep(
              toolResult.success
                ? `Tool "${toolName}" completed successfully.`
                : `Tool "${toolName}" returned an error: ${toolResult.error ?? 'unknown error'}.`
            );

            if (toolResult.success) {
              onToolEvidence?.({
                toolName,
                success: true,
                result: toolResult.result,
              });
            }

            yield this.formatMetaEvent({
              event: 'tool_execution',
              tool: {
                name: toolName,
                argNames: Object.keys(toolArgs || {}),
                success: toolResult.success,
                durationMs: toolResult.duration_ms,
                outputPreview: toolResult.success ? this.formatToolResultPreview(toolResult.result) : undefined,
                error: toolResult.success ? undefined : toolResult.error,
              },
            });

            toolMessages.push(
              new ToolMessage({
                content: toolResult.success 
                  ? JSON.stringify(toolResult.result)
                  : `Error: ${toolResult.error}`,
                tool_call_id: toolCallId,
              })
            );
          } catch (error) {
            // Audit log tool execution failure
            await this.auditService.logToolExecution(
              {
                userId: config.userId,
                tenantId: config.tenantId,
                agentId: agent.id,
                sessionId: config.sessionId,
                requestId,
                executionPath: 'tools',
              },
              toolName,
              toolArgs,
              {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: 0,
              }
            ).catch(() => {
              // Non-blocking audit logging
            });

            onToolResult?.({
              toolName,
              success: false,
              durationMs: 0,
            });

            yield this.emitReasoningStep(
              `Tool "${toolName}" failed: ${error instanceof Error ? error.message : 'unknown error'}.`
            );

            yield this.formatMetaEvent({
              event: 'tool_execution',
              tool: {
                name: toolName,
                argNames: Object.keys(toolArgs || {}),
                success: false,
                durationMs: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            });
            
            toolMessages.push(
              new ToolMessage({
                content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
                tool_call_id: toolCallId,
              })
            );
          }
        }

        // Add response and tool results to messages for next iteration
        currentMessages = [
          ...currentMessages,
          response,
          ...toolMessages,
        ];
      }

      // Stream final response
      if (finalResponse) {
        yield this.emitReasoningStep('Synthesizing final response using gathered evidence and tool results.');
        const words = finalResponse.split(' ');
        for (const word of words) {
          yield word + ' ';
          // Small delay for realistic streaming effect
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } else if (iterations >= maxIterations) {
        yield 'Maximum tool execution iterations reached. Please try with a more specific query.';
      } else {
        yield 'Tool execution completed. Generating response...';
      }

      this.logger.debug('Tool execution completed', {
        operation: 'mode1_execute_tools',
      });
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        operation: 'executeWithTools',
        agentId: agent.id,
      });
      Mode1ErrorHandler.logError(mode1Error);
      yield Mode1ErrorHandler.formatUserMessage(mode1Error);
    }
  }

  /**
   * OPTION 4: With RAG + Tools (real execution)
   * Combines RAG context retrieval with tool execution
   */
  private async *executeWithRAGAndTools(
    agent: Agent,
    messages: any[],
    llm: any,
    config: Mode1Config,
    requestId: string,
    allowedToolNames: string[],
    selectedRagDomains: string[],
    agentMemory: string[],
    parentSpanId?: string,
    onToolResult?: (stats: { toolName: string; success: boolean; durationMs: number }) => void,
    onToolEvidence?: (payload: { toolName: string; success: boolean; result: unknown }) => void,
    preloadedContext?: EnhancedRAGContext
  ): AsyncGenerator<string> {
    this.logger.debug('Executing with RAG + Tools', {
      operation: 'mode1_execute_rag_tools',
    });

    try {
      const ragContext = preloadedContext ?? await this.fetchRAGContext(
        agent,
        config,
        selectedRagDomains,
        parentSpanId
      );

      const ragEmpty = ragContext.totalSources === 0;

      if (!ragEmpty) {
        yield this.formatMetaEvent({
          event: 'rag_sources',
          total: ragContext.totalSources,
          strategy: ragContext.strategy,
          domains: ragContext.domainsSearched,
          sources: ragContext.sources,
          cacheHit: ragContext.cacheHit,
          retrievalTimeMs: ragContext.retrievalTime,
        });
      } else {
        yield this.formatMetaEvent({
          event: 'rag_warning',
          message: 'Knowledge base returned no supporting documents. Switching to live tools to gather evidence.',
        });
        yield this.emitReasoningStep(
          'Knowledge base search was empty. Pivoting to enabled tools (e.g., web search) to collect evidence.'
        );
      }

      const langchainTools = await this.tracingService.withSpan(
        'tool_prepare',
        async (spanId) => {
          this.tracingService.addMetadata(spanId, { toolCount: allowedToolNames.length || this.toolRegistry.getAllTools().length });
          return convertRegistryToLangChainTools(this.toolRegistry, allowedToolNames);
        },
        parentSpanId
      );

      const ragContextForManager = ragContext.context
        ? [{
            content: ragContext.context,
            relevance: 0.9,
          }]
        : [];

      const llmWithTools = llm.bindTools(langchainTools);

      const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
      const optimizedMessages = await this.tracingService.withSpan(
        'message_build_with_rag_and_tools',
        async (spanId) => {
          return await this.messageBuilderService.buildMessages(
            agent,
            config.message,
            config.conversationHistory,
            ragContextForManager,
            { 
              model: modelToUse,
              agentMemory,
              citationRequirement: 'required',
            }
          );
        },
        parentSpanId
      );

      const toolsDirective = ragEmpty
        ? '\n\nNo knowledge base documents were found for this request. You MUST call the appropriate tools (for example, web_search) to gather current evidence before answering. Do not reply until you have tool-derived citations.'
        : '\n\nUse tools when you need current information, calculations, or database queries beyond the provided context.';
      const toolsInfo = `## Available Tools:\n${langchainTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}${toolsDirective}`;

      const enhancedMessages = [
        new SystemMessage(`${optimizedMessages[0].content}\n\n${toolsInfo}`),
        ...optimizedMessages.slice(1)
      ];

      let currentMessages = enhancedMessages;
      let iterations = 0;
      const maxIterations = 5;
      let finalResponse = '';

      while (iterations < maxIterations) {
        iterations++;
        this.logger.debug('RAG + Tools iteration', {
          operation: 'mode1_rag_tools_iteration',
          iteration: iterations,
          maxIterations,
        });

        const response = await this.llmService.invokeLLM(
          llmWithTools,
          currentMessages,
          { tools: langchainTools, timeout: MODE1_TIMEOUTS.LLM_CALL }
        );

        const toolCalls = (response as any).tool_calls || [];

        if (toolCalls.length === 0) {
          finalResponse = response.content as string;
          break;
        }

        const toolMessages: ToolMessage[] = [];
        for (const toolCall of toolCalls) {
          const rawToolName = toolCall.name || toolCall.function?.name;
          if (typeof rawToolName !== 'string' || rawToolName.length === 0) {
            this.logger.warn('Received tool call without a valid name (RAG + Tools)', {
              operation: 'mode1_tool_execute',
              toolCallId: toolCall.id,
            });
            continue;
          }

          const toolName = rawToolName;
          const toolArgs = toolCall.args || (toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {});
          const toolCallId = toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`;

          this.logger.debug('Executing tool', {
            operation: 'mode1_tool_execute',
            toolName,
            toolArgs: Object.keys(toolArgs || {}),
          });

          const argSummary = Object.keys(toolArgs || {}).length > 0
            ? `arguments (${Object.keys(toolArgs).join(', ')})`
            : 'no arguments';
          yield this.emitReasoningStep(`Tool "${toolName}" invoked with ${argSummary}.`);

          try {
            const toolResult = await toolCircuitBreaker.execute(
              async () => {
                return await withTimeout(
                  this.toolRegistry.executeTool(
                    toolName,
                    toolArgs as Record<string, unknown>,
                    {
                      agent_id: agent.id,
                      tenant_id: config.tenantId,
                      user_id: config.userId,
                    }
                  ),
                  MODE1_TIMEOUTS.TOOL_EXECUTION,
                  `Tool ${toolName} execution timed out`
                );
              },
              async () => {
                return {
                  success: false,
                  error: `Tool ${toolName} unavailable (circuit breaker open)`,
                  result: null,
                  duration_ms: 0,
                };
              }
            );

            onToolResult?.({
              toolName,
              success: toolResult.success,
              durationMs: toolResult.duration_ms,
            });

            await this.auditService.logToolExecution(
              {
                userId: config.userId,
                tenantId: config.tenantId,
                agentId: agent.id,
                sessionId: config.sessionId,
                requestId,
                executionPath: 'tools',
              },
              toolName,
              toolArgs,
              toolResult
            ).catch(() => {
              // Non-blocking audit logging
            });

            yield this.emitReasoningStep(
              toolResult.success
                ? `Tool "${toolName}" completed successfully.`
                : `Tool "${toolName}" returned an error: ${toolResult.error ?? 'unknown error'}.`
            );

            yield this.formatMetaEvent({
              event: 'tool_execution',
              tool: {
                name: toolName,
                argNames: Object.keys(toolArgs || {}),
                success: toolResult.success,
                durationMs: toolResult.duration_ms,
                outputPreview: toolResult.success ? this.formatToolResultPreview(toolResult.result) : undefined,
                error: toolResult.success ? undefined : toolResult.error,
              },
            });

            toolMessages.push(
              new ToolMessage({
                content: toolResult.success
                  ? JSON.stringify(toolResult.result)
                  : `Error: ${toolResult.error}`,
                tool_call_id: toolCallId,
              })
            );
          } catch (error) {
            await this.auditService.logToolExecution(
              {
                userId: config.userId,
                tenantId: config.tenantId,
                agentId: agent.id,
                sessionId: config.sessionId,
                requestId,
                executionPath: 'tools',
              },
              toolName,
              toolArgs,
              {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: 0,
              }
            ).catch(() => {
              // Non-blocking audit logging
            });

            onToolResult?.({
              toolName,
              success: false,
              durationMs: 0,
            });

            yield this.emitReasoningStep(
              `Tool "${toolName}" failed: ${error instanceof Error ? error.message : 'unknown error'}.`
            );

            yield this.formatMetaEvent({
              event: 'tool_execution',
              tool: {
                name: toolName,
                argNames: Object.keys(toolArgs || {}),
                success: false,
                durationMs: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            });

            toolMessages.push(
              new ToolMessage({
                content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
                tool_call_id: toolCallId,
              })
            );
          }
        }

        currentMessages = [
          ...currentMessages,
          response,
          ...toolMessages,
        ];
      }

      if (finalResponse) {
        yield this.emitReasoningStep('Synthesizing final response using gathered evidence and tool results.');
        const words = finalResponse.split(' ');
        for (const word of words) {
          yield word + ' ';
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      } else if (iterations >= maxIterations) {
        yield 'Maximum tool execution iterations reached. Please try with a more specific query.';
      } else {
        yield 'RAG + Tool execution completed. Generating response...';
      }

      this.logger.debug('RAG + Tools execution completed', {
        operation: 'mode1_execute_rag_tools',
      });
    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(error, {
        operation: 'executeWithRAGAndTools',
        agentId: agent.id,
      });
      Mode1ErrorHandler.logError(mode1Error);
      yield Mode1ErrorHandler.formatUserMessage(mode1Error);
    }
  }

  private async generateBranchPayload({
    agent,
    config,
    finalAnswer,
    ragSummary,
    toolSummary,
    artifacts,
    llm,
  }: {
    agent: Agent;
    config: Mode1Config;
    finalAnswer: string;
    ragSummary: RagSummaryPayload;
    toolSummary: ToolSummaryPayload;
    artifacts: Mode1ExecutionArtifacts;
    llm: any;
  }): Promise<{ branches: BranchResult[]; currentBranch: number }> {
    const evidenceSources = this.buildEvidenceSources(artifacts, ragSummary, toolSummary);
    const baseBranch: BranchResult = {
      id: `branch-primary-${Date.now()}`,
      content: finalAnswer,
      confidence: this.deriveBaseConfidence(ragSummary, toolSummary),
      citations: evidenceSources.map((source, idx) => ({
        number: idx + 1,
        text: source.title || source.url || `Source ${idx + 1}`,
        sourceId: source.id,
      })),
      sources: evidenceSources,
      reasoning: this.buildBaseReasoning(ragSummary, toolSummary),
      createdAt: new Date().toISOString(),
    };

    const branches: BranchResult[] = [baseBranch];

    if (evidenceSources.length > 0 && finalAnswer.length > 0) {
      try {
        const variantBranches = await this.generateAlternativeBranchVariants({
          agent,
          config,
          llm,
          evidenceSources,
          baseConfidence: baseBranch.confidence,
          baseReasoning: baseBranch.reasoning ?? [],
          prompt: finalAnswer,
        });
        if (variantBranches.length > 0) {
          branches.push(...variantBranches);
        }
      } catch (error) {
        this.logger.warn(
          'mode1_branch_generation_failed',
          error instanceof Error ? error : new Error(String(error)),
          {
            agentId: agent.id,
            requestId: config.sessionId,
          }
        );
      }
    }

    const dedupedBranches = this.deduplicateBranches(branches);
    return {
      branches: dedupedBranches,
      currentBranch: 0,
    };
  }

  private buildEvidenceSources(
    artifacts: Mode1ExecutionArtifacts,
    ragSummary: RagSummaryPayload,
    toolSummary: ToolSummaryPayload
  ): BranchSource[] {
    const sources: BranchSource[] = [];
    const seenKeys = new Set<string>();

    const pushSource = (source: BranchSource) => {
      const key = (source.url || `${source.title}-${source.excerpt ?? ''}`).toLowerCase();
      if (seenKeys.has(key)) {
        return;
      }
      seenKeys.add(key);
      sources.push(source);
    };

    const ragSources = artifacts.ragContext?.sources ?? [];
    ragSources.forEach((source, idx) => {
      pushSource({
        id: source.url
          ? source.url
          : `rag-${idx + 1}`,
        title: source.title || `Evidence ${idx + 1}`,
        url: source.url,
        excerpt: source.excerpt || source.section,
        similarity: source.similarity,
        domain: source.domain,
        organization: source.domain,
        evidenceLevel: this.mapSimilarityToEvidenceLevel(source.similarity),
        reliabilityScore: source.similarity,
        lastUpdated: undefined,
      });
    });

    if (toolSummary.used.length > 0 && artifacts.toolEvidence.length > 0) {
      artifacts.toolEvidence.forEach((evidence, idx) => {
        pushSource({
          id: evidence.url ? evidence.url : `tool-${idx + 1}`,
          title: evidence.title || `Tool evidence ${idx + 1}`,
          url: evidence.url,
          excerpt: evidence.snippet,
          domain: evidence.provider,
          organization: evidence.provider,
          evidenceLevel: 'C',
          reliabilityScore: 0.5,
          lastUpdated: evidence.gatheredAt,
        });
      });
    }

    if (sources.length === 0 && ragSummary.totalSources > 0) {
      // Provide placeholder entries so UI still renders citation placeholders
      for (let i = 0; i < ragSummary.totalSources; i++) {
        pushSource({
          id: `placeholder-${i + 1}`,
          title: `Evidence Source ${i + 1}`,
          evidenceLevel: 'Unknown',
        });
      }
    }

    return sources.slice(0, 10);
  }

  private buildBaseReasoning(
    ragSummary: RagSummaryPayload,
    toolSummary: ToolSummaryPayload
  ): string[] {
    const reasoning: string[] = [];
    if (ragSummary.totalSources > 0) {
      reasoning.push(
        `Synthesized response from ${ragSummary.totalSources} evidence source${ragSummary.totalSources === 1 ? '' : 's'}${ragSummary.strategy ? ` (strategy: ${ragSummary.strategy})` : ''}.`
      );
    } else {
      reasoning.push('No supporting documents were retrieved; response limited by available evidence.');
    }
    if (toolSummary.used.length > 0) {
      reasoning.push(`Leveraged tools: ${toolSummary.used.join(', ')}.`);
    }
    return reasoning;
  }

  private deriveBaseConfidence(
    ragSummary: RagSummaryPayload,
    toolSummary: ToolSummaryPayload
  ): number {
    const base = ragSummary.totalSources > 0 ? 0.68 + Math.min(ragSummary.totalSources, 6) * 0.045 : 0.45;
    const toolBoost = toolSummary.used.length > 0 ? Math.min(toolSummary.used.length, 3) * 0.03 : 0;
    return this.clampConfidence(base + toolBoost, ragSummary.totalSources > 0 ? 0.65 : 0.4);
  }

  private async generateAlternativeBranchVariants({
    agent,
    config,
    llm,
    evidenceSources,
    baseConfidence,
    baseReasoning,
    prompt,
    maxVariants = 2,
  }: {
    agent: Agent;
    config: Mode1Config;
    llm: any;
    evidenceSources: BranchSource[];
    baseConfidence: number;
    baseReasoning: string[];
    prompt: string;
    maxVariants?: number;
  }): Promise<BranchResult[]> {
    if (evidenceSources.length === 0) {
      return [];
    }

    const evidenceList = evidenceSources
      .map((source, idx) => {
        const lines = [
          `${idx + 1}. ${source.title || 'Untitled evidence'}`,
        ];
        if (source.organization || source.domain) {
          lines.push(`   Origin: ${[source.organization, source.domain].filter(Boolean).join(' • ')}`);
        }
        if (source.excerpt) {
          lines.push(`   Key point: ${source.excerpt.slice(0, 220)}`);
        }
        if (source.url) {
          lines.push(`   URL: ${source.url}`);
        }
        return lines.join('\n');
      })
      .join('\n\n');

    const taskPrompt = `
You are supporting a regulated healthcare AI assistant.
User question: "${config.message}"

Primary draft answer (for reference only, do not repeat verbatim):
${prompt}

Evidence library (use this exactly for citations):
${evidenceList}

Create up to ${maxVariants} alternative response branches that provide distinct perspectives (e.g., regulatory compliance emphasis, clinical best-practices focus).

Requirements for each branch:
- Base everything strictly on the evidence library. No new facts.
- Provide Markdown content with inline citations using [1], [2], ... referencing the order of "cited_sources".
- Include 2-3 short reasoning steps explaining the unique angle.
- Assign a confidence score between 0 and 1.
- Cite at most 3 sources per branch to keep focus.
- Do not repeat the exact wording from the primary draft.

Respond ONLY with valid JSON matching:
{
  "branches": [
    {
      "focus": "string",
      "summary": "markdown response with [1] style citations",
      "confidence": 0.0-1.0,
      "reasoning": ["string", "..."],
      "cited_sources": [1, 2, ...]
    }
  ]
}
    `.trim();

    const response = await this.llmService.invokeLLMSimple(
      llm,
      [
        new SystemMessage(
          'You generate transparent, evidence-backed healthcare responses and must NEVER fabricate citations.'
        ),
        new HumanMessage(taskPrompt),
      ],
      { timeout: MODE1_TIMEOUTS.LLM_CALL }
    );

    const parsed = this.safeJsonParse(typeof response === 'string' ? response : JSON.stringify(response));
    const rawBranches: unknown[] =
      (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).branches))
        ? ((parsed as Record<string, unknown>).branches as unknown[])
        : Array.isArray(parsed)
          ? parsed
          : [];

    const variants: BranchResult[] = [];

    rawBranches.slice(0, maxVariants).forEach((rawBranch, idx) => {
      if (!rawBranch || typeof rawBranch !== 'object') {
        return;
      }

      const branchObj = rawBranch as Record<string, unknown>;
      const citedSourcesRaw = Array.isArray(branchObj.cited_sources) ? branchObj.cited_sources : [];
      const citedIndexes = citedSourcesRaw
        .map((value) => {
          const num = Number(value);
          return Number.isFinite(num) && num >= 1 && num <= evidenceSources.length
            ? Math.trunc(num)
            : null;
        })
        .filter((value): value is number => value !== null)
        .slice(0, 3);

      if (citedIndexes.length === 0) {
        return;
      }

      const branchSources = citedIndexes.map((sourceIndex) => evidenceSources[sourceIndex - 1]);
      if (branchSources.some((source) => !source)) {
        return;
      }

      const summary = typeof branchObj.summary === 'string' ? branchObj.summary.trim() : '';
      if (!summary) {
        return;
      }

      const confidenceValue =
        typeof branchObj.confidence === 'number'
          ? branchObj.confidence
          : baseConfidence - 0.05 * (idx + 1);

      const reasoningSteps = Array.isArray(branchObj.reasoning)
        ? branchObj.reasoning.filter((item) => typeof item === 'string').map((item) => item.trim())
        : typeof branchObj.reasoning === 'string'
          ? [branchObj.reasoning]
          : [];

      const focusLabel =
        typeof branchObj.focus === 'string' && branchObj.focus.trim().length > 0
          ? branchObj.focus.trim()
          : `Alternative ${idx + 1}`;

      const citations: BranchCitation[] = branchSources.map((source, citationIdx) => ({
        number: citationIdx + 1,
        text: source.title || source.url || `Source ${citationIdx + 1}`,
        sourceId: source.id,
      }));

      variants.push({
        id: `branch-alt-${Date.now()}-${idx}`,
        content: `### ${focusLabel}\n\n${summary}`,
        confidence: this.clampConfidence(confidenceValue, baseConfidence - 0.1),
        citations,
        sources: branchSources,
        reasoning: reasoningSteps.length > 0 ? reasoningSteps : baseReasoning,
        createdAt: new Date().toISOString(),
      });
    });

    return variants;
  }

  private deduplicateBranches(branches: BranchResult[]): BranchResult[] {
    const unique = new Map<string, BranchResult>();
    for (const branch of branches) {
      const fingerprint = branch.content.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!unique.has(fingerprint)) {
        unique.set(fingerprint, branch);
      }
    }
    return Array.from(unique.values());
  }

  private clampConfidence(value: number, fallback: number): number {
    if (!Number.isFinite(value)) {
      return Math.min(0.99, Math.max(0, fallback));
    }
    return Math.min(0.99, Math.max(0, value));
  }

  private mapSimilarityToEvidenceLevel(similarity?: number): BranchSource['evidenceLevel'] {
    if (typeof similarity !== 'number') {
      return 'Unknown';
    }
    if (similarity >= 0.85) {
      return 'A';
    }
    if (similarity >= 0.7) {
      return 'B';
    }
    if (similarity >= 0.55) {
      return 'C';
    }
    return 'D';
  }

  private formatMetaEvent(event: Record<string, unknown>): string {
    return `__mode1_meta__${JSON.stringify(event)}`;
  }

  private formatReasoningEvent(message: string): string {
    return this.formatMetaEvent({ event: 'reasoning', message });
  }

  private describeDomains(domains: string[]): string {
    if (!domains || domains.length === 0) {
      return 'the general knowledge base';
    }
    if (domains.length === 1) {
      return `domain "${domains[0]}"`;
    }
    const unique = Array.from(new Set(domains));
    if (unique.length === 1) {
      return `domain "${unique[0]}"`;
    }
    const last = unique[unique.length - 1];
   const rest = unique.slice(0, -1);
   return `${rest.map((d) => `"${d}"`).join(', ')} and "${last}"`;
 }

 private emitReasoningStep(message: string): string {
   return this.formatReasoningEvent(message);
 }

  private safeJsonParse(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private queueAgentMemory({
    agent,
    config,
    finalAnswer,
    ragSummary,
    toolSummary,
    existingSummaries,
    requestId,
  }: {
    agent: Agent;
    config: Mode1Config;
    finalAnswer: string;
    ragSummary: RagSummaryPayload;
    toolSummary: ToolSummaryPayload;
    existingSummaries: string[];
    requestId: string;
  }): void {
    const normalizedAnswer = finalAnswer.trim();
    if (!normalizedAnswer || normalizedAnswer.length < 60) {
      return;
    }

    const questionSnippet = this.truncateForMemory(config.message, 120);
    if (!questionSnippet) {
      return;
    }

    const normalizedSummaries = existingSummaries.map((summary) => summary.toLowerCase());
    const fingerprint = questionSnippet.toLowerCase();
    if (normalizedSummaries.some((summary) => summary.includes(fingerprint))) {
      return;
    }

    const hasEvidence = (ragSummary?.totalSources ?? 0) > 0;
    const toolsUsed = Array.isArray(toolSummary?.used)
      ? toolSummary.used.filter((tool) => typeof tool === 'string' && tool.length > 0)
      : [];

    if (!hasEvidence && toolsUsed.length === 0) {
      // Persist memories only when we have evidence or tool-derived outputs.
      return;
    }

    const summarySegments = [
      `Answered "${questionSnippet}"`,
      hasEvidence
        ? `with ${ragSummary.totalSources} evidence source${ragSummary.totalSources === 1 ? '' : 's'}${ragSummary.strategy ? ` (${ragSummary.strategy})` : ''}`
        : undefined,
      toolsUsed.length > 0 ? `Tools: ${Array.from(new Set(toolsUsed)).join(', ')}` : undefined,
    ].filter(Boolean) as string[];

    if (summarySegments.length === 0) {
      return;
    }

    const summary = summarySegments.join('; ');
    const details = this.truncateForMemory(normalizedAnswer, 900);

    this.agentMemoryService.addMemory(agent.id, {
      summary,
      details,
      metadata: {
        requestId,
        question: config.message,
        ragSummary,
        toolSummary,
        timestamp: new Date().toISOString(),
      },
    }).catch((error) => {
      this.logger.warn('Failed to queue agent memory', {
        operation: 'mode1_memory_persist',
        agentId: agent.id,
      }, error instanceof Error ? error : new Error(String(error)));
    });
  }

  private truncateForMemory(text: string, maxLength = 160): string {
    if (!text) {
      return '';
    }
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }
    return `${normalized.slice(0, maxLength - 3)}...`;
  }

  private buildWebSearchAttempts(
    agent: Agent,
    config: Mode1Config,
    selectedRagDomains: string[]
  ): WebSearchAttempt[] {
    const rawQuery = (config.message || '').trim();
    if (!rawQuery) {
      return [];
    }

    const cleanedQuery = rawQuery.replace(/\s+/g, ' ').slice(0, 280);
    const focusDomains = selectedRagDomains
      .map((domain) => (typeof domain === 'string' ? domain.trim() : ''))
      .filter((domain) => domain.length > 0)
      .slice(0, 3);
    const domainDescriptor = focusDomains.length > 0 ? this.describeDomains(focusDomains) : '';
    const domainSearchType: WebSearchAttempt['searchType'] =
      focusDomains.some((domain) => domain.toLowerCase().includes('regulat') || domain.toLowerCase().includes('compliance'))
        ? 'regulatory'
        : focusDomains.some((domain) => domain.toLowerCase().includes('clinical') || domain.toLowerCase().includes('research'))
          ? 'academic'
          : 'general';

    const attempts: WebSearchAttempt[] = [];

    attempts.push({
      query: focusDomains.length > 0
        ? `${cleanedQuery} ${focusDomains.join(' ')}`
        : cleanedQuery,
      searchType: domainSearchType,
      note: focusDomains.length > 0
        ? `Searching for current evidence focused on ${domainDescriptor}.`
        : `Searching for current high-quality evidence relevant to ${agent.name || 'the selected expert'}.`,
    });

    const keywords = this.extractKeywords(rawQuery);
    if (keywords.length >= 3) {
      attempts.push({
        query: `${keywords.join(' ')} clinical evidence summary`,
        searchType: 'academic',
        note: 'Retrying with distilled clinical keywords to capture research-grade sources.',
      });
    }

    if (keywords.length >= 2) {
      const timeframeKeywords = keywords.slice(0, 5).join(' ');
      attempts.push({
        query: `${timeframeKeywords} latest guidelines 2024 2025`,
        searchType: domainSearchType === 'regulatory' ? 'regulatory' : 'news',
        note: 'Final attempt targeting recent guidelines and official advisories.',
      });
    }

    const uniqueAttempts = attempts.filter((attempt, idx, arr) => {
      const normalized = attempt.query.toLowerCase();
      return arr.findIndex((candidate) => candidate.query.toLowerCase() === normalized) === idx;
    });

    return uniqueAttempts;
  }

  private dedupeWebSearchResults(results: Array<any>): Array<any> {
    if (!Array.isArray(results) || results.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const deduped: Array<any> = [];

    for (const item of results) {
      if (!item) {
        continue;
      }
      const url = typeof item.url === 'string' ? item.url.toLowerCase() : '';
      const title = typeof item.title === 'string' ? item.title.toLowerCase() : '';
      const key = url || title;
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(item);
    }

    return deduped;
  }

  private extractKeywords(text: string, max = 8): string[] {
    return Array.from(
      new Set(
        text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 3 && !WEB_SEARCH_STOP_WORDS.has(word))
      )
    ).slice(0, max);
  }

  private async tryWebSearchFallback(
    agent: Agent,
    config: Mode1Config,
    selectedRagDomains: string[]
  ): Promise<{ ragContext: EnhancedRAGContext; reasoning: string[]; durationMs?: number } | null> {
    if (!this.toolRegistry.hasTool('web_search')) {
      this.logger.debug('Web search fallback skipped: web_search tool not registered', {
        operation: 'mode1_web_fallback_missing_tool',
        agentId: agent.id,
      });
      return null;
    }

    const attempts = this.buildWebSearchAttempts(agent, config, selectedRagDomains);
    if (attempts.length === 0) {
      this.logger.debug('Web search fallback skipped: no viable query generated', {
        operation: 'mode1_web_fallback_no_query',
        agentId: agent.id,
      });
      return null;
    }

    const reasoning: string[] = [
      'Knowledge base returned no evidence. Invoking web_search tool to gather external references.',
    ];

    let normalizedResult: WebSearchToolResult | null = null;
    let totalDuration = 0;

    for (const [index, attempt] of attempts.entries()) {
      reasoning.push(
        `Attempt ${index + 1}/${attempts.length}: ${attempt.note}`
      );

      try {
        const toolResult = await this.toolRegistry.executeTool(
          'web_search',
          {
            query: attempt.query,
            max_results: 10,
            search_type: attempt.searchType,
          },
          {
            agent_id: agent.id,
            tenant_id: config.tenantId,
            user_id: config.userId,
          }
        );

        totalDuration += toolResult.duration_ms ?? 0;

        if (!toolResult.success || !toolResult.result) {
          reasoning.push(
            toolResult.error
              ? `Web search provider error: ${toolResult.error}`
              : 'Web search attempt failed without a provider error message.'
          );
          continue;
        }

        const parsedResult =
          typeof toolResult.result === 'string'
            ? (this.safeJsonParse(toolResult.result) as WebSearchToolResult | null)
            : (toolResult.result as WebSearchToolResult | null);

        if (!parsedResult || !Array.isArray(parsedResult.results) || parsedResult.results.length === 0) {
          reasoning.push('Web search returned no usable results.');
          continue;
        }

        parsedResult.results = this.dedupeWebSearchResults(parsedResult.results);

        if (parsedResult.results.length === 0) {
          reasoning.push('Web search results were duplicates of previously gathered evidence.');
          continue;
        }

        normalizedResult = parsedResult;
        reasoning.push(
          `Web search (${parsedResult.provider ?? 'unknown provider'}) found ${parsedResult.results.length} result${parsedResult.results.length === 1 ? '' : 's'}.`
        );
        break;
      } catch (error) {
        this.logger.warn('Web search fallback attempt errored', {
          operation: 'mode1_web_fallback_attempt_error',
          agentId: agent.id,
          attemptIndex: index,
        }, error instanceof Error ? error : new Error(String(error)));
        reasoning.push('Attempt failed due to an unexpected error from the web search provider.');
      }
    }

    if (!normalizedResult) {
      reasoning.push('All web search attempts failed. Unable to gather external evidence automatically.');
      return null;
    }

    const topResults = normalizedResult.results.slice(0, 7);
    const sources = topResults.map((item, index) => ({
      title: item.title || `Web result ${index + 1}`,
      domain: item.source,
      similarity: typeof item.relevance_score === 'number' ? item.relevance_score : 0,
      url: item.url,
      excerpt: this.expandWebResultContent(item, 800),
      page_number: undefined,
      section: undefined,
    }));

    const contextSegments: string[] = [];
    if (normalizedResult.answer) {
      contextSegments.push(`Direct answer summary: ${normalizedResult.answer}`);
    }

    contextSegments.push(
      ...topResults.map((item, index) => {
        const expanded = this.expandWebResultContent(item, 1200);
        return [
          `[${index + 1}] ${item.title || 'Web result'}`,
          expanded,
          item.url ? `URL: ${item.url}` : '',
        ]
          .filter(Boolean)
          .join('\n\n');
      })
    );

    const ragContext: EnhancedRAGContext = {
      context: contextSegments.join('\n\n'),
      sources,
      totalSources: sources.length,
      strategy: 'web-search-fallback',
      retrievalTime: totalDuration,
      domainsSearched: [
        ...(selectedRagDomains.length > 0 ? selectedRagDomains : []),
        'web_search',
      ],
      cacheHit: false,
    };

    const truncatedResult: WebSearchToolResult = {
      ...normalizedResult,
      results: topResults,
      total_results: topResults.length,
    };

    const evidence = this.extractToolEvidence('web_search', truncatedResult);
    if (evidence.length > 0) {
      try {
        await this.persistToolEvidence(evidence, agent, selectedRagDomains, config);
        reasoning.push('Stored web search findings in the knowledge base for future queries.');
      } catch (error) {
        this.logger.warn('Failed to persist web search fallback evidence', {
          operation: 'mode1_web_fallback_persist_error',
          agentId: agent.id,
        }, error instanceof Error ? error : new Error(String(error)));
      }
    }

    return { ragContext, reasoning, durationMs: totalDuration };
  }

  private expandWebResultContent(item: any, maxLength: number): string {
    if (!item) {
      return '';
    }

    const candidateFields = [
      typeof item.snippet === 'string' ? item.snippet : undefined,
      typeof item.content === 'string' ? item.content : undefined,
      typeof item.description === 'string' ? item.description : undefined,
      typeof item.highlight === 'string' ? item.highlight : undefined,
      Array.isArray(item.highlights) ? item.highlights.join(' ') : undefined,
    ];

    const combined = candidateFields
      .filter((segment) => typeof segment === 'string' && segment.trim().length > 0)
      .map((segment) => segment.trim())
      .join('\n\n');

    if (!combined) {
      return '';
    }

    if (combined.length <= maxLength) {
      return combined;
    }

    return `${combined.slice(0, maxLength - 3)}...`;
  }

  private extractToolEvidence(toolName: string, result: unknown): Array<{
    title: string;
    url?: string;
    snippet?: string;
    provider?: string;
    gatheredAt: string;
    raw?: unknown;
  }> {
    if (toolName !== 'web_search' || result === undefined || result === null) {
      return [];
    }

    const normalized =
      typeof result === 'string'
        ? this.safeJsonParse(result)
        : result;

    if (!normalized || typeof normalized !== 'object') {
      return [];
    }

    const provider = (normalized as any)?.provider;
    const resultsArray = Array.isArray((normalized as any)?.results)
      ? (normalized as any).results
      : [];

    return resultsArray.slice(0, 7).map((item: any) => ({
      title: typeof item?.title === 'string' ? item.title : (typeof item?.source === 'string' ? item.source : 'Web result'),
      url: typeof item?.url === 'string' ? item.url : undefined,
      snippet: this.expandWebResultContent(item, 900),
      provider,
      gatheredAt: new Date().toISOString(),
      raw: item,
    }));
  }

  private async persistToolEvidence(
    evidence: Array<{
      title: string;
      url?: string;
      snippet?: string;
      provider?: string;
      gatheredAt: string;
      raw?: unknown;
    }>,
    agent: Agent,
    selectedRagDomains: string[],
    config: Mode1Config
  ): Promise<void> {
    if (!evidence.length) {
      return;
    }

    try {
      const { unifiedRAGService } = await import('../../../lib/services/rag/unified-rag-service');

      const domain =
        selectedRagDomains[0] ||
        (Array.isArray(agent.knowledge_domains) && agent.knowledge_domains.length > 0
          ? agent.knowledge_domains[0]
          : 'web_search');

      const content = evidence
        .map((item, index) => {
          return [
            `Source ${index + 1}: ${item.title}`,
            item.provider ? `Provider: ${item.provider}` : undefined,
            item.url ? `URL: ${item.url}` : undefined,
            item.snippet ? `Summary: ${item.snippet}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');

      const title = `Web Search Findings for "${config.message.substring(0, 80)}"`;

      await unifiedRAGService.addDocument({
        title,
        content,
        domain,
        tags: ['web_search', 'mode1_dynamic'],
        metadata: {
          source_type: 'web_search',
          agent_id: agent.id,
          gathered_at: evidence[0]?.gatheredAt,
          urls: evidence.map((item) => item.url).filter(Boolean),
          provider: evidence[0]?.provider,
          request_message: config.message,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to store tool evidence in RAG', {
        operation: 'mode1_store_evidence_failure',
        agentId: agent.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private raiseNoEvidenceError(agent: Agent, ragContext: EnhancedRAGContext, selectedRagDomains: string[]): never {
    const error = Mode1ErrorHandler.createError(
      new Error('No supporting evidence was retrieved for the current query.'),
      { agentId: agent.id, operation: 'rag_no_results' }
    );
    error.code = Mode1ErrorCode.RAG_NO_RESULTS;
    error.retryable = false;
    error.userMessage =
      'No supporting evidence was found in the knowledge base. Please broaden your query, select additional knowledge domains, enable web search, or explicitly allow answers without evidence.';
    error.metadata = {
      ...(error.metadata || {}),
      agentId: agent.id,
      ragDomains: ragContext.domainsSearched?.length ? ragContext.domainsSearched : selectedRagDomains,
      totalSources: ragContext.totalSources,
      strategy: ragContext.strategy,
      retrievalTimeMs: ragContext.retrievalTime,
    };

    Mode1ErrorHandler.logError(error, { enforcement: 'evidence_required' });
    throw error;
  }

  private async fetchRAGContext(
    agent: Agent,
    config: Mode1Config,
    selectedRagDomains: string[],
    parentSpanId?: string
  ): Promise<EnhancedRAGContext> {
    const ragDomains = selectedRagDomains.length > 0
      ? selectedRagDomains
      : Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
        : [];

    const primaryDomain = ragDomains[0];

    return await this.tracingService.withSpan(
      'rag_retrieve',
      async (spanId) => {
        this.tracingService.addTags(spanId, { domain: primaryDomain || 'general' });
        return await withTimeout(
          this.retrieveRAGContext(config.message, agent, ragDomains),
          MODE1_TIMEOUTS.RAG_RETRIEVAL,
          'RAG retrieval timed out after 10 seconds'
        );
      },
      parentSpanId
    );
  }

  private formatToolResultPreview(result: unknown): string | undefined {
    if (result === undefined || result === null) {
      return undefined;
    }

    try {
      const serialized =
        typeof result === 'string'
          ? result
          : JSON.stringify(result, null, 2);
      return serialized.length > 500 ? `${serialized.slice(0, 497)}...` : serialized;
    } catch {
      return undefined;
    }
  }

  /**
   * Retrieve enhanced RAG context from knowledge base
   * Uses multiple strategies and domains for better results
   */
  private async retrieveRAGContext(query: string, agent: Agent, preferredDomains: string[] = []): Promise<EnhancedRAGContext> {
    const normalizedDomains = preferredDomains.length > 0
      ? preferredDomains
          .map((domain) => (typeof domain === 'string' ? domain.trim() : ''))
          .filter((domain) => domain.length > 0)
      : Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
        : [];

    this.logger.debug('Retrieving enhanced RAG context', {
      operation: 'mode1_rag_retrieve',
      agentId: agent.id,
      queryLength: query.length,
      ragDomains: normalizedDomains,
    });

    try {
      const ragContext = await ragCircuitBreaker.execute(
        async () => {
          const { enhancedRAGService } = await import('../../ask-expert/mode-1/services/enhanced-rag-service');

          return await withRetry(
            async () =>
              enhancedRAGService.retrieveContext({
                query,
                agentId: agent.id,
                knowledgeDomains: normalizedDomains,
                maxResults: 8,
                similarityThreshold: 0.7,
                includeUrls: true,
              }),
            {
              maxRetries: 2,
              retryableErrors: [
                Mode1ErrorCode.RAG_TIMEOUT,
                Mode1ErrorCode.NETWORK_ERROR,
              ],
            }
          );
        },
        async () => {
          this.logger.warn('RAG circuit breaker OPEN - proceeding without RAG context', {
            operation: 'mode1_rag_fallback',
            agentId: agent.id,
          });
          return {
            context: '',
            sources: [],
            totalSources: 0,
            strategy: 'fallback',
            retrievalTime: 0,
            domainsSearched: normalizedDomains,
          };
        }
      );

      if (ragContext.totalSources > 0) {
        this.logger.info('RAG context retrieved successfully', {
          operation: 'mode1_rag_success',
          agentId: agent.id,
          sourcesFound: ragContext.totalSources,
          domainsSearched: ragContext.domainsSearched,
          retrievalTime: ragContext.retrievalTime,
        });
      } else {
        this.logger.debug('No relevant documents found', {
          operation: 'mode1_rag_empty',
          agentId: agent.id,
        });
      }
      return ragContext;
    } catch (error) {
      this.logger.error('Enhanced RAG retrieval error', {
        operation: 'mode1_rag_error',
        agentId: agent.id,
      }, error instanceof Error ? error : new Error(String(error)));

      try {
        const { unifiedRAGService } = await import('../../../lib/services/rag/unified-rag-service');
        const fallbackDomain = normalizedDomains[0];
        const ragResult = await unifiedRAGService.query({
          text: query,
          agentId: agent.id,
          domain: fallbackDomain,
          domains: normalizedDomains.length > 0 ? normalizedDomains : undefined,
          maxResults: 3,
          similarityThreshold: 0.7,
          strategy: 'semantic',
          includeMetadata: true,
        });

        const formattedContext = ragResult.sources && ragResult.sources.length > 0
          ? ragResult.sources
              .map((doc, i) => `[${i + 1}] ${doc.pageContent}\n   Source: ${doc.metadata?.source_title || doc.metadata?.title || 'Document'}`)
              .join('\n\n')
          : '';

        const formattedSources = (ragResult.sources || []).map((doc, idx) => ({
          title: doc.metadata?.source_title || doc.metadata?.title || `Document ${idx + 1}`,
          domain: doc.metadata?.domain,
          similarity: doc.metadata?.similarity || 0,
          url: doc.metadata?.url,
          page_number: doc.metadata?.page_number,
          section: doc.metadata?.section,
        }));

        if (formattedSources.length > 0) {
          this.logger.info('Fallback RAG retrieval successful', {
            operation: 'mode1_rag_fallback_success',
            agentId: agent.id,
            sourcesFound: formattedSources.length,
          });
        }

        return {
          context: formattedContext,
          sources: formattedSources,
          totalSources: formattedSources.length,
          strategy: 'fallback-semantic',
          retrievalTime: 0,
          domainsSearched: normalizedDomains.length > 0 ? normalizedDomains : ['general'],
        };
      } catch (fallbackError) {
        this.logger.error('Fallback RAG retrieval failed', {
          operation: 'mode1_rag_fallback_error',
          agentId: agent.id,
        }, fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
      }

      return {
        context: '',
        sources: [],
        totalSources: 0,
        strategy: 'error',
        retrievalTime: 0,
        domainsSearched: normalizedDomains,
      };
    }
  }

  /**
   * Get embedding for RAG query
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Use OpenAI embeddings
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }


}

// ============================================================================
// EXPORT
// ============================================================================

export async function* executeMode1(config: Mode1Config): AsyncGenerator<string> {
  try {
    const handler = new Mode1ManualInteractiveHandler();
    yield* handler.execute(config);
  } catch (error) {
    // Re-throw with more context if handler creation fails
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[executeMode1] Failed to create handler or execute:', errorMessage, error);
    throw error;
  }
}
