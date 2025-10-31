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
}

const AI_ENGINE_URL =
  process.env.AI_ENGINE_URL ||
  process.env.MODE1_AI_ENGINE_URL ||
  process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
  'http://localhost:8000';

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

      const response = await fetch(`${AI_ENGINE_URL}/api/mode1/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || errorBody.error || `AI engine responded with status ${response.status}`);
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
      });

      yield result.content;

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
