import { v4 as uuidv4 } from 'uuid';
import { Mode1ErrorHandler, Mode1ErrorCode } from '../../ask-expert/mode-1/utils/error-handler';
import { mode1MetricsService, Mode1Metrics } from '../../ask-expert/mode-1/services/mode1-metrics';
import { mode1TracingService } from '../../ask-expert/mode-1/services/mode1-tracing-service';
import { mode1AuditService } from '../../ask-expert/mode-1/services/mode1-audit-service';

export interface Mode1Config {
  agentId: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  selectedByOrchestrator?: boolean;
  tenantId?: string;
  sessionId?: string;
  userId?: string;
  requestedTools?: string[];
  selectedRagDomains?: string[];
  useStreaming?: boolean; // Enable true SSE streaming (default: true)
}

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model?: string;
  capabilities?: string[];
  tools?: string[];
  knowledge_domains?: string[];
  metadata?: Record<string, unknown>;
}

interface Mode1ManualApiResponse {
  agent_id: string;
  content: string;
  confidence: number;
  citations: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  processing_time_ms: number;
  // Optional reasoning from Python backend (RAG retrieval steps, tool usage, etc.)
  reasoning?: Array<{
    step: string;
    action: string;
    result: string;
    confidence?: number;
  }>;
}

// SSE Event Types from the streaming endpoint
interface SSEEvent {
  event: 'thinking' | 'token' | 'sources' | 'tool' | 'done' | 'error';
  // Thinking events
  step?: string;
  status?: 'running' | 'completed';
  message?: string;
  // Token events
  content?: string;
  tokens?: number;
  // Sources events
  sources?: Array<Record<string, unknown>>;
  total?: number;
  // Tool events
  action?: 'start' | 'end';
  tool?: string;
  input?: string;
  output?: string;
  // Done events
  agent_id?: string;
  confidence?: number;
  metrics?: {
    processing_time_ms: number;
    tokens_generated: number;
    tokens_per_second: number;
  };
  metadata?: Record<string, unknown>;
  // Error events
  code?: string;
}

// Connect directly to AI Engine for development simplicity
// Port Architecture: Next.js (3000) -> AI Engine (8000)
// In production, use API Gateway via process.env.API_GATEWAY_URL
const AI_ENGINE_URL =
  process.env.AI_ENGINE_URL ||
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:8000'; // Default to AI Engine port directly

const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'; // VITAL System tenant

/**
 * Build metadata chunk string to keep the UI streaming helpers working.
 */
function buildMetadataChunk(eventPayload: Record<string, unknown>): string {
  return `__mode1_meta__${JSON.stringify(eventPayload)}`;
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

export class Mode1ManualInteractiveHandler {
  /**
   * Execute Mode 1 with true Server-Sent Events (SSE) streaming.
   * This provides real-time token delivery for <3s first token latency.
   */
  async *execute(config: Mode1Config): AsyncGenerator<string> {
    const requestId = uuidv4();
    const startTime = Date.now();
    const useStreaming = config.useStreaming !== false; // Default to true

    const tracing = mode1TracingService.startTrace('mode1_manual_interactive', requestId, {
      agentId: config.agentId,
      enableRAG: config.enableRAG !== false,
      enableTools: config.enableTools ?? false,
      streaming: useStreaming,
    });

    const metrics: Mode1Metrics = {
      requestId,
      agentId: config.agentId,
      executionPath: (config.enableRAG && config.enableTools)
        ? 'rag+tools'
        : config.enableRAG
          ? 'rag'
          : config.enableTools
            ? 'tools'
            : 'direct',
      startTime,
      success: false,
      latency: {
        totalMs: 0,
      },
      metadata: {
        model: config.model,
        temperature: config.temperature,
        enableRAG: config.enableRAG !== false,
        enableTools: config.enableTools ?? false,
        streaming: useStreaming,
      },
    };

    try {
      const payload = {
        agent_id: config.agentId,
        message: config.message,
        enable_rag: config.enableRAG !== false,
        enable_tools: config.enableTools !== false,
        selected_rag_domains: config.selectedRagDomains ?? [],
        requested_tools: config.requestedTools ?? [],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        user_id: config.userId,
        tenant_id: config.tenantId,
        session_id: config.sessionId,
        conversation_history: config.conversationHistory ?? [],
      };

      // Use streaming endpoint for real-time token delivery
      const endpoint = useStreaming
        ? `${AI_ENGINE_URL}/api/mode1/manual/stream`
        : `${AI_ENGINE_URL}/api/mode1/manual`;

      console.log(`[Mode1] Calling AI Engine (streaming=${useStreaming}):`, endpoint);

      if (useStreaming) {
        // True SSE streaming mode
        yield* this.executeStreaming(endpoint, payload, config, metrics, requestId);
      } else {
        // Fallback to non-streaming mode
        yield* this.executeNonStreaming(endpoint, payload, config, metrics, requestId);
      }

      metrics.success = true;
      metrics.latency.totalMs = Date.now() - startTime;

      mode1AuditService.logSessionEnded(
        {
          agentId: config.agentId,
          userId: config.userId,
          tenantId: config.tenantId,
          sessionId: config.sessionId ?? requestId,
          executionPath: metrics.executionPath,
        },
        {
          totalMessages: (config.conversationHistory?.length ?? 0) + 1,
          totalTokens: metrics.metadata?.tokensGenerated ?? 0,
          totalCost: 0,
        }
      ).catch(() => undefined);

    } catch (error) {
      const mode1Error = Mode1ErrorHandler.createError(
        error instanceof Error ? error : new Error(String(error)),
        {
          agentId: config.agentId,
          operation: 'python_mode1_manual',
          requestId,
        }
      );
      mode1Error.code = mode1Error.code ?? Mode1ErrorCode.UNKNOWN_ERROR;
      metrics.success = false;
      metrics.errorCode = mode1Error.code;
      metrics.latency.totalMs = Date.now() - startTime;

      Mode1ErrorHandler.logError(mode1Error, { requestId, agentId: config.agentId });

      mode1AuditService.logAgentAccess(
        {
          agentId: config.agentId,
          userId: config.userId,
          tenantId: config.tenantId,
          sessionId: config.sessionId ?? requestId,
          executionPath: metrics.executionPath,
        },
        false,
        mode1Error.message
      ).catch(() => undefined);

      throw mode1Error;
    } finally {
      mode1MetricsService.trackRequest(metrics);
      mode1TracingService.endTrace(tracing.traceId);
    }
  }

  /**
   * Execute with true SSE streaming for real-time token delivery.
   * Events: thinking, token, sources, tool, done, error
   */
  private async *executeStreaming(
    endpoint: string,
    payload: Record<string, unknown>,
    config: Mode1Config,
    metrics: Mode1Metrics,
    requestId: string
  ): AsyncGenerator<string> {
    let response: Response;
    let accumulatedContent = '';
    let tokensReceived = 0;
    let firstTokenTime: number | null = null;
    const sources: Array<Record<string, unknown>> = [];
    const toolsUsed: string[] = [];
    const reasoning: Array<{ step: string; status: string; message?: string }> = [];

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      console.error('[Mode1 SSE] Fetch failed:', fetchError);
      throw new Error(
        `Failed to connect to AI Engine streaming endpoint. ` +
        `Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Streaming request failed: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null - streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[Mode1 SSE] Stream completed');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events (format: "data: {...}\n\n")
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;

          // Extract data from "data: {...}" format
          const dataMatch = eventStr.match(/^data:\s*(.+)$/m);
          if (!dataMatch) continue;

          try {
            const event: SSEEvent = JSON.parse(dataMatch[1]);

            switch (event.event) {
              case 'thinking':
                // Emit thinking events as metadata for UI workflow visualization
                reasoning.push({
                  step: event.step || 'unknown',
                  status: event.status || 'running',
                  message: event.message,
                });
                yield buildMetadataChunk({
                  event: 'thinking',
                  step: event.step,
                  status: event.status,
                  message: event.message,
                });
                break;

              case 'token':
                // Real-time token streaming - yield immediately
                if (event.content) {
                  if (firstTokenTime === null) {
                    firstTokenTime = Date.now();
                    const ttft = firstTokenTime - metrics.startTime;
                    console.log(`[Mode1 SSE] First token in ${ttft}ms`);
                    metrics.latency.firstTokenMs = ttft;
                  }
                  tokensReceived = event.tokens || tokensReceived + 1;
                  accumulatedContent += event.content;
                  yield event.content; // Yield raw content for streaming display
                }
                break;

              case 'sources':
                // RAG sources retrieved - emit as metadata
                if (event.sources && event.sources.length > 0) {
                  sources.push(...event.sources);
                  const mappedSources = mapCitationsToSources(event.sources);
                  yield buildMetadataChunk({
                    event: 'rag_sources',
                    total: event.total || mappedSources.length,
                    sources: mappedSources,
                    strategy: 'sse_streaming',
                    cacheHit: false,
                    domains: config.selectedRagDomains ?? [],
                  });
                }
                break;

              case 'tool':
                // Tool execution events
                if (event.tool && event.action === 'end') {
                  toolsUsed.push(event.tool);
                }
                yield buildMetadataChunk({
                  event: 'tool_execution',
                  action: event.action,
                  tool: event.tool,
                  input: event.input,
                  output: event.output,
                });
                break;

              case 'done':
                // Final completion event with metadata
                // Cast to any for new fields from Python backend (response_source, sources, citations)
                const doneEvent = event as any;
                metrics.latency.llmCallMs = event.metrics?.processing_time_ms;
                metrics.metadata = {
                  ...metrics.metadata,
                  confidence: event.confidence,
                  tokensGenerated: event.metrics?.tokens_generated,
                  tokensPerSecond: event.metrics?.tokens_per_second,
                  responseSource: doneEvent.response_source,
                };

                // FIX: If no tokens were received via streaming, yield the content from done event
                // This handles the case where Python backend sends content in done event (fallback mode)
                if (tokensReceived === 0 && doneEvent.content) {
                  console.log('[Mode1 SSE] No tokens received, streaming content from done event');
                  // Stream word-by-word for visual streaming effect
                  const words = doneEvent.content.split(' ');
                  for (let i = 0; i < words.length; i++) {
                    const word = words[i] + (i < words.length - 1 ? ' ' : '');
                    tokensReceived++;
                    accumulatedContent += word;
                    yield word; // Yield raw content for streaming display
                    // Small delay for visual streaming effect (30ms between words)
                    await new Promise(resolve => setTimeout(resolve, 30));
                  }
                }

                // Merge sources from done event with locally collected sources
                const eventSources = Array.isArray(doneEvent.sources) ? doneEvent.sources : [];
                const eventCitations = Array.isArray(doneEvent.citations) ? doneEvent.citations : [];
                const finalSources = eventSources.length > 0 ? eventSources : sources;
                const finalCitations = eventCitations.length > 0 ? eventCitations : finalSources;

                // Merge backend AI reasoning with local thinking events
                // Backend sends: ai_reasoning: "..." (direct) AND reasoning: [{step: "ai_thinking", content: "...", status: "completed"}]
                // Prioritize the direct ai_reasoning field if available
                let aiReasoningContent = '';

                // First try the direct ai_reasoning field (new format)
                if (typeof doneEvent.ai_reasoning === 'string' && doneEvent.ai_reasoning.trim()) {
                  aiReasoningContent = doneEvent.ai_reasoning.trim();
                  console.log('[Mode1 SSE] Using direct ai_reasoning field:', aiReasoningContent.substring(0, 100) + '...');
                } else {
                  // Fallback to extracting from reasoning array (legacy format)
                  const backendReasoning = Array.isArray(doneEvent.reasoning) ? doneEvent.reasoning : [];
                  aiReasoningContent = backendReasoning
                    .filter((r: any) => r.step === 'ai_thinking' && r.content)
                    .map((r: any) => r.content)
                    .join('\n\n');
                }

                // Combine local thinking events with backend AI reasoning
                // Prioritize backend AI reasoning (actual LLM thinking) if available
                let finalReasoning = reasoning;
                if (aiReasoningContent) {
                  // Add AI reasoning as a dedicated step at the end
                  finalReasoning = [
                    ...reasoning,
                    { step: 'ai_analysis', status: 'completed', message: aiReasoningContent }
                  ];
                }

                yield buildMetadataChunk({
                  event: 'final',
                  confidence: event.confidence ?? 0.85,
                  rag: {
                    totalSources: finalSources.length,
                    strategy: 'sse_streaming',
                    domains: config.selectedRagDomains ?? [],
                    cacheHit: false,
                    retrievalTimeMs: event.metrics?.processing_time_ms,
                  },
                  tools: {
                    allowed: config.requestedTools ?? [],
                    used: toolsUsed,
                    totals: {
                      calls: toolsUsed.length,
                      success: toolsUsed.length,
                      failure: 0,
                      totalTimeMs: 0,
                    },
                  },
                  citations: finalCitations,
                  sources: finalSources,
                  reasoning: finalReasoning,
                  aiReasoning: aiReasoningContent, // Raw AI thinking for reasoning panel
                  metrics: event.metrics,
                  responseSource: doneEvent.response_source ?? 'llm', // Source clarity indicator
                });
                break;

              case 'error':
                console.error('[Mode1 SSE] Error event:', event);
                throw new Error(event.message || 'Unknown streaming error');
            }
          } catch (parseError) {
            // Log but don't fail on parse errors - might be partial data
            if (!(parseError instanceof SyntaxError)) {
              throw parseError;
            }
            console.warn('[Mode1 SSE] Parse error, skipping event:', eventStr);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // If no content was received, throw error
    if (!accumulatedContent) {
      throw new Error('No content received from streaming endpoint');
    }

    console.log(`[Mode1 SSE] Completed: ${tokensReceived} tokens, ${accumulatedContent.length} chars`);
  }

  /**
   * Fallback non-streaming execution with simulated word-by-word streaming.
   */
  private async *executeNonStreaming(
    endpoint: string,
    payload: Record<string, unknown>,
    config: Mode1Config,
    metrics: Mode1Metrics,
    requestId: string
  ): AsyncGenerator<string> {
    let response: Response;

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID,
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      console.error('[Mode1] Fetch failed:', fetchError);
      throw new Error(
        `Failed to connect to AI Engine at ${endpoint}. ` +
        `Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let errorBody;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText || `HTTP ${response.status}` };
      }
      throw new Error(errorBody.detail || errorBody.error || errorBody.message || `HTTP ${response.status}`);
    }

    const result = (await response.json()) as Mode1ManualApiResponse;

    metrics.latency.llmCallMs = result.processing_time_ms;
    metrics.metadata = {
      ...metrics.metadata,
      confidence: result.confidence,
      citations: result.citations?.length ?? 0,
    };

    // Emit metadata events for UI visualizations
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
      tools: {
        allowed: config.requestedTools ?? [],
        used: [],
        totals: {
          calls: 0,
          success: 0,
          failure: 0,
          totalTimeMs: 0,
        },
      },
      citations: result.citations ?? [],
      reasoning: result.reasoning ?? [],
    });

    // Simulated streaming for non-streaming endpoint
    const words = result.content.split(' ');
    const wordsPerChunk = 3;

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
      yield chunk;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

const handler = new Mode1ManualInteractiveHandler();

export async function* executeMode1(config: Mode1Config): AsyncGenerator<string> {
  yield* handler.execute(config);
}
