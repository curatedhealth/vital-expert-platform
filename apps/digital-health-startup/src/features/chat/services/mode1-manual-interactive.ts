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
            { model: modelToUse }
          );
        },
        rootSpanId
      );

    // Step 4: Execute based on options (with metrics tracking and tracing)
      let executionGenerator: AsyncGenerator<string>;

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
          rootSpanId
        );
      } else if (shouldUseRAG) {
        executionGenerator = this.executeWithRAGWithMetrics(
          agent,
          messages,
          llm,
          config,
          metrics,
          selectedRagDomains,
          rootSpanId
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
          rootSpanId
        );
      } else {
        executionGenerator = this.executeDirectWithMetrics(messages, llm, metrics, rootSpanId);
      }

      // Yield all chunks using yield* delegation, then end trace on success
      yield* executionGenerator;

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
    parentSpanId?: string
  ): AsyncGenerator<string> {
    const ragStart = Date.now();
    let ragContextRetrieved = false;
    let ragSourcesCount = 0;

    try {
      for await (const chunk of this.executeWithRAG(agent, messages, llm, config, selectedRagDomains, parentSpanId)) {
        yield chunk;
        if (chunk && !chunk.startsWith('Error:')) {
          metrics.success = true;
        }
      }

      // Try to get RAG metrics if available
      const ragContext = await this.retrieveRAGContext(config.message, agent, selectedRagDomains);
      if (ragContext) {
        ragContextRetrieved = true;
        // Estimate sources from context (rough approximation)
        ragSourcesCount = (ragContext.match(/\[Source/g) || []).length;
      }

      metrics.rag = {
        sourcesFound: ragSourcesCount,
        domainsSearched: selectedRagDomains,
        strategy: 'agent-optimized',
        cacheHit: false, // Would be set by RAG service
      };
      metrics.latency.ragRetrievalMs = Date.now() - ragStart;
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
    parentSpanId?: string
  ): AsyncGenerator<string> {
    const toolsStart = Date.now();
    const toolsUsed = new Set<string>();
    let toolCalls = 0;
    let toolSuccesses = 0;
    let toolFailures = 0;
    let totalToolDuration = 0;

    try {
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
        handleToolResult
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
    parentSpanId?: string
  ): AsyncGenerator<string> {
    const ragStart = Date.now();
    const toolsStart = Date.now();
    const toolsUsed = new Set<string>();
    let toolCalls = 0;
    let toolSuccesses = 0;
    let toolFailures = 0;
    let totalToolDuration = 0;
    
    try {
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

      for await (const chunk of this.executeWithRAGAndTools(
        agent,
        messages,
        llm,
        config,
        requestId,
        allowedToolNames,
        selectedRagDomains,
        parentSpanId,
        handleToolResult
      )) {
        yield chunk;
        metrics.success = true;
      }

      metrics.latency.ragRetrievalMs = Date.now() - ragStart;
      metrics.latency.toolExecutionMs = Date.now() - toolsStart;
      metrics.tools = {
        calls: toolCalls,
        successCount: toolSuccesses,
        failureCount: toolFailures,
        toolsUsed: Array.from(toolsUsed),
        totalToolTimeMs: totalToolDuration || Date.now() - toolsStart,
      };
      metrics.rag = {
        sourcesFound: metrics.rag?.sourcesFound ?? 0,
        domainsSearched: selectedRagDomains,
        strategy: 'agent-optimized',
        cacheHit: metrics.rag?.cacheHit ?? false,
      };
      metrics.latency.totalMs = Date.now() - metrics.startTime;
    } catch (error) {
      metrics.success = false;
      metrics.errorCode = Mode1ErrorHandler.createError(error).code;
      metrics.latency.totalMs = Date.now() - metrics.startTime;
      throw error;
    } finally {
      mode1MetricsService.trackRequest(metrics);
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
    parentSpanId?: string
  ): AsyncGenerator<string> {
    this.logger.debug('Executing with RAG', {
      operation: 'mode1_execute_rag',
    });

    try {
      const ragDomains = selectedRagDomains.length > 0
        ? selectedRagDomains
        : Array.isArray(agent.knowledge_domains)
          ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
          : [];

      const primaryDomain = ragDomains[0];

      // Retrieve relevant context with timeout (using preferred domains) with tracing
      const ragContextString = await this.tracingService.withSpan(
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

      // Rebuild messages with RAG context using MessageBuilderService (with tracing)
      const ragContextForManager = ragContextString ? [{
        content: ragContextString,
        relevance: 0.9, // High relevance for RAG context
      }] : [];
      
      const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
      const enhancedMessages = await this.tracingService.withSpan(
        'message_build_with_rag',
        async (spanId) => {
          return await this.messageBuilderService.buildMessages(
            agent,
            config.message,
            config.conversationHistory,
            ragContextForManager,
            { model: modelToUse }
          );
        },
        parentSpanId
      );

      // Use LLM service for streaming (with tracing)
      yield* this.tracingService.withSpanGenerator(
        'llm_stream_with_rag',
        async function* (spanId) {
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
    onToolResult?: (stats: { toolName: string; success: boolean; durationMs: number }) => void
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
        // Simulate streaming by yielding in chunks (word by word for realistic effect)
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
    parentSpanId?: string,
    onToolResult?: (stats: { toolName: string; success: boolean; durationMs: number }) => void
  ): AsyncGenerator<string> {
    this.logger.debug('Executing with RAG + Tools', {
      operation: 'mode1_execute_rag_tools',
    });

    try {
      const ragDomains = selectedRagDomains.length > 0
        ? selectedRagDomains
        : Array.isArray(agent.knowledge_domains)
          ? agent.knowledge_domains.filter((domain): domain is string => typeof domain === 'string' && domain.trim().length > 0)
          : [];
      const primaryDomain = ragDomains[0];

      // Get RAG context with timeout (using selected knowledge domains) with tracing
      const ragContextString = await this.tracingService.withSpan(
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

      // Convert tools to LangChain format (with tracing)
      const langchainTools = await this.tracingService.withSpan(
        'tool_prepare',
        async (spanId) => {
          this.tracingService.addMetadata(spanId, { toolCount: allowedToolNames.length || this.toolRegistry.getAllTools().length });
          return convertRegistryToLangChainTools(this.toolRegistry, allowedToolNames);
        },
        parentSpanId
      );
      
      // Bind tools to LLM for function calling
      const llmWithTools = llm.bindTools(langchainTools);

      // Rebuild messages with RAG context using MessageBuilderService (with tracing)
      const ragContextForManager = ragContextString ? [{
        content: ragContextString,
        relevance: 0.9, // High relevance for RAG context
      }] : [];
      
      const modelToUse = config.model || agent.model || 'gpt-4-turbo-preview';
      const optimizedMessages = await this.tracingService.withSpan(
        'message_build_with_rag_and_tools',
        async (spanId) => {
          return await this.messageBuilderService.buildMessages(
            agent,
            config.message,
            config.conversationHistory,
            ragContextForManager,
            { model: modelToUse }
          );
        },
        parentSpanId
      );

      // Build enhanced system prompt with tools information
      const toolsInfo = `## Available Tools:\n${langchainTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}\n\nUse tools when you need current information, calculations, or database queries beyond the provided context.`;
      
      // Add tools info to system message
      const enhancedMessages = [
        new SystemMessage(`${optimizedMessages[0].content}\n\n${toolsInfo}`),
        ...optimizedMessages.slice(1) // Rest of the optimized messages
      ];

      // Execute tool calling loop (max 5 iterations)
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

        // Call LLM with tools using LLM service (returns full response object)
        const response = await this.llmService.invokeLLM(
          llmWithTools,
          currentMessages,
          { tools: langchainTools, timeout: MODE1_TIMEOUTS.LLM_CALL }
        );
        
        // Check if LLM wants to call a tool
        const toolCalls = (response as any).tool_calls || [];
        
        if (toolCalls.length === 0) {
          // No tool calls, this is the final response
          finalResponse = response.content as string;
          break;
        }

        // Execute tool calls
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
            toolArgs: Object.keys(toolArgs),
          });
          
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

  /**
   * Retrieve enhanced RAG context from knowledge base
   * Uses multiple strategies and domains for better results
   */
  private async retrieveRAGContext(query: string, agent: Agent, preferredDomains: string[] = []): Promise<string> {
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
                maxResults: 5,
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
        return ragContext.context;
      }

      this.logger.debug('No relevant documents found', {
        operation: 'mode1_rag_empty',
        agentId: agent.id,
      });
      return '';
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

        if (ragResult.sources && ragResult.sources.length > 0) {
          const context = ragResult.sources
            .map((doc, i) => `[${i + 1}] ${doc.pageContent}\n   Source: ${doc.metadata?.source_title || doc.metadata?.title || 'Document'}`)
            .join('\n\n');
          this.logger.info('Fallback RAG retrieval successful', {
            operation: 'mode1_rag_fallback_success',
            agentId: agent.id,
            sourcesFound: ragResult.sources.length,
          });
          return context;
        }
      } catch (fallbackError) {
        this.logger.error('Fallback RAG retrieval failed', {
          operation: 'mode1_rag_fallback_error',
          agentId: agent.id,
        }, fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
      }

      return '';
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
