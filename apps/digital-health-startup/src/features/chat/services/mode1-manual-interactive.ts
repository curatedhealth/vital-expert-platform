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
  // Additional fields from AI Engine response
  error?: string;
  message?: string;
  reasoning?: Array<Record<string, unknown>>;
  sources?: Array<Record<string, unknown>>;
  requestId?: string;
}

/**
 * ⚠️ LOCAL DEVELOPMENT: Direct AI Engine Connection
 * 
 * For speed in local development, we connect directly to the local AI Engine (port 8080)
 * instead of going through the API Gateway (port 4000 / production URL).
 * 
 * PRODUCTION: Use API Gateway URL from environment variables
 * LOCAL DEV: Use direct AI Engine connection (localhost:8080)
 * 
 * ⚠️ DO NOT MODIFY THIS WITHOUT UPDATING ALL MODE HANDLERS ⚠️
 * - Mode 1, 2, 3, 4 all use this pattern
 * - AI Engine runs on port 8080
 * - API Gateway runs on port 4000 or production URL
 */
const AI_ENGINE_URL =
  process.env.PYTHON_AI_ENGINE_URL ||
  process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL ||
  'http://localhost:8080'; // Direct connection to local AI Engine

// Fallback to API Gateway if explicitly set (for production)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  null; // No default - use AI_ENGINE_URL instead

// Use AI Engine URL directly for local development
const BASE_URL = AI_ENGINE_URL;

const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  '00000000-0000-0000-0000-000000000001';

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
    excerpt: citation.relevant_quote ?? citation.excerpt ?? citation.summary ?? citation.content ?? '',
    similarity: citation.similarity_score ?? citation.similarity ?? citation.confidence_score ?? undefined,
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
        enable_tools: config.enableTools ?? false,
        selected_rag_domains: config.selectedRagDomains ?? [],
        requested_tools: config.requestedTools ?? [],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        user_id: config.userId,
        tenant_id: config.tenantId,
        session_id: config.sessionId,
        conversation_history: config.conversationHistory ?? [],
      };

      // ✅ DEBUG LOGGING - AI Engine Request
      console.group('🔍 [Mode 1] AI Engine Request');
      console.log('Endpoint:', `${BASE_URL}/api/mode1/manual`);
      console.log('agent_id:', payload.agent_id);
      console.log('tenant_id:', payload.tenant_id);
      console.log('enable_rag:', payload.enable_rag);
      console.log('enable_tools:', payload.enable_tools);
      console.log('Full Payload:', payload);
      console.groupEnd();

      // Call AI Engine Mode 1 endpoint directly
      // The AI Engine endpoint is: /api/mode1/manual
      // ⚠️ LOCAL DEV: Connecting directly to AI Engine on port 8080
      const mode1Endpoint = `${BASE_URL}/api/mode1/manual`;
      console.log('[Mode1] Calling AI Engine directly:', mode1Endpoint);
      console.log('[Mode1] Base URL:', BASE_URL, '| AI Engine URL:', AI_ENGINE_URL);
      
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
          `Please ensure the AI Engine server is running on port 8080. ` +
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

      /**
       * ⚠️ CRITICAL: Content Validation
       * 
       * PROBLEM: If result.content is missing or empty, chat completion will be empty.
       * This happens when:
       * 1. AI Engine returns response without content field
       * 2. AI Engine returns empty content string
       * 3. API Gateway fails to forward response correctly
       * 
       * SOLUTION: Validate content before streaming.
       * 
       * ⚠️ DO NOT REMOVE THIS CHECK ⚠️
       * - Always check if result.content exists
       * - Provide fallback error message if content is missing
       * - Log full result for debugging
       */
      if (!result || !result.content) {
        const errorMessage = result?.error || result?.message || 'AI Engine returned empty response';
        console.error('❌ [Mode1] Empty response from AI Engine:', {
          result,
          errorMessage,
          endpoint: mode1Endpoint,
          status: response.status,
        });
        throw new Error(`AI Engine returned empty response: ${errorMessage}`);
      }

      // Validate content is not empty string
      if (typeof result.content !== 'string' || result.content.trim().length === 0) {
        console.error('❌ [Mode1] Empty content in response:', {
          result,
          contentLength: result.content?.length,
          contentType: typeof result.content,
        });
        throw new Error('AI Engine returned empty content. Please try again or check AI Engine logs.');
      }

      metrics.success = true;
      metrics.latency.totalMs = Date.now() - startTime;
      metrics.latency.llmCallMs = result.processing_time_ms;
      metrics.latency.agentFetchMs = metrics.latency.agentFetchMs ?? 0;

      // Update metrics metadata
      if (result.confidence !== undefined) {
        metrics.metadata = {
          ...metrics.metadata,
          confidence: result.confidence,
          citations: result.citations?.length ?? 0,
        };
      } else {
        metrics.metadata = {
          ...metrics.metadata,
          citations: result.citations?.length ?? 0,
        };
      }

      // Emit metadata events so the UI can keep existing visualisations.
      console.log('🔍 [Mode1] AI Engine citations:', JSON.stringify(result.citations, null, 2));
      console.log('🔍 [Mode1] AI Engine sources (if present):', JSON.stringify(result.sources, null, 2));
      console.log('🔍 [Mode1] AI Engine reasoning:', JSON.stringify(result.reasoning, null, 2));
      
      const sources = mapCitationsToSources(result.citations || []);
      console.log('🔍 [Mode1] Mapped sources:', JSON.stringify(sources, null, 2));
      console.log('📊 [Mode1] Sources count:', sources.length);
      
      if (sources.length > 0) {
        console.log('✅ [Mode1] Yielding rag_sources metadata chunk');
        yield buildMetadataChunk({
          event: 'rag_sources',
          total: sources.length,
          sources,
          strategy: 'python_orchestrator',
          cacheHit: false,
          domains: config.selectedRagDomains ?? [],
        });
      } else {
        console.warn('⚠️ [Mode1] No sources to yield - citations array was empty or undefined');
      }

      yield buildMetadataChunk({
        event: 'final',
        ...(result.confidence !== undefined && { confidence: result.confidence }),
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
      // ⚠️ CRITICAL: Content must exist and be non-empty (validated above)
      const words = result.content.split(' ');
      const wordsPerChunk = 3; // Stream 3 words at a time
      
      if (words.length === 0) {
        console.error('❌ [Mode1] No words to stream after split:', {
          content: result.content,
          contentLength: result.content.length,
        });
        throw new Error('AI Engine returned empty content after processing.');
      }
      
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
          ...(requestId && { requestId }),
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
