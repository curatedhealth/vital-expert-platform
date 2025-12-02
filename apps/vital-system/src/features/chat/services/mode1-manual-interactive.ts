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

// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
// Port Architecture: Next.js (3000) -> API Gateway (4000) -> AI Engine (8000)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:4000'; // Default to API Gateway port

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
  async *execute(config: Mode1Config): AsyncGenerator<string> {
    const requestId = uuidv4();
    const startTime = Date.now();

    const tracing = mode1TracingService.startTrace('mode1_manual_interactive', requestId, {
      agentId: config.agentId,
      enableRAG: config.enableRAG !== false,
      enableTools: config.enableTools ?? false,
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
      },
    };

    try {
      const payload = {
        agent_id: config.agentId,
        message: config.message,
        enable_rag: config.enableRAG !== false,
        enable_tools: config.enableTools !== false, // Tools enabled by default
        selected_rag_domains: config.selectedRagDomains ?? [],
        requested_tools: config.requestedTools ?? [],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        user_id: config.userId,
        tenant_id: config.tenantId,
        session_id: config.sessionId,
        conversation_history: config.conversationHistory ?? [],
      };

      // Call AI Engine Mode 1 endpoint
      // The AI Engine endpoint is: /api/mode1/manual
      const mode1Endpoint = `${API_GATEWAY_URL}/api/mode1/manual`;
      console.log('[Mode1] Calling AI Engine:', mode1Endpoint);
      
      let response: Response;
      try {
        response = await fetch(mode1Endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID,
          },
          body: JSON.stringify(payload),
        });
      } catch (fetchError) {
        console.error('[Mode1] Fetch failed:', {
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
          endpoint: mode1Endpoint,
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
        });
        throw new Error(
          `Failed to connect to AI Engine at ${mode1Endpoint}. ` +
          `Please ensure the AI Engine server is running on port 8000. ` +
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
        console.error('[Mode1] Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          error: errorBody,
        });
        throw new Error(errorBody.detail || errorBody.error || errorBody.message || `API Gateway responded with status ${response.status}`);
      }

      const result = (await response.json()) as Mode1ManualApiResponse;

      metrics.success = true;
      metrics.latency.totalMs = Date.now() - startTime;
      metrics.latency.llmCallMs = result.processing_time_ms;
      metrics.latency.agentFetchMs = metrics.latency.agentFetchMs ?? 0;

      metrics.metadata = {
        ...metrics.metadata,
        confidence: result.confidence,
        citations: result.citations?.length ?? 0,
      };

      // Emit metadata events so the UI can keep existing visualisations.
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
        reasoning: result.reasoning ?? [],  // ✅ Add reasoning from API response
      });

      // ✅ Stream content word-by-word for smooth animation
      const words = result.content.split(' ');
      const wordsPerChunk = 3; // Stream 3 words at a time
      
      for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
        yield chunk;
        // Small delay to simulate streaming (optional - Streamdown handles animation)
        await new Promise(resolve => setTimeout(resolve, 50));
      }

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
          totalTokens: 0,
          totalCost: 0,
        }
      ).catch(() => undefined);

      return;
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
}

const handler = new Mode1ManualInteractiveHandler();

export async function* executeMode1(config: Mode1Config): AsyncGenerator<string> {
  yield* handler.execute(config);
}
