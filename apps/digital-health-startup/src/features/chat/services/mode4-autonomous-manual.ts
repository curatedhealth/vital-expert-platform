/**
 * Mode 4: Autonomous-Manual Service
 * 
 * This service implements autonomous reasoning with manual agent selection.
 * Uses Python AI Engine via API Gateway (Golden Rule compliant).
 * 
 * Architecture:
 * User Query + Selected Agent → API Gateway → Python AI Engine → Response
 */

import { 
  Mode4Config, 
  AutonomousStreamChunk,
} from './autonomous-types';

// Use API Gateway URL for compliance with Golden Rule (Python services via gateway)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3001'; // Default to API Gateway (proper flow)

const DEFAULT_TENANT_ID =
  process.env.API_GATEWAY_TENANT_ID ||
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ||
  '00000000-0000-0000-0000-000000000001';

interface Mode4AutonomousManualApiResponse {
  agent_id: string;
  content: string;
  confidence: number;
  citations: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  processing_time_ms: number;
  autonomous_reasoning: {
    iterations: number;
    tools_used: string[];
    reasoning_steps: string[];
    confidence_threshold: number;
    max_iterations: number;
  };
  reasoning?: Array<Record<string, unknown>>;
}

/**
 * Build metadata chunk string to keep the UI streaming helpers working.
 */
function buildMetadataChunk(eventPayload: Record<string, unknown>): string {
  return `__mode4_meta__${JSON.stringify(eventPayload)}`;
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

/**
 * Execute Mode 4: Autonomous-Manual
 * 
 * This function calls the Python AI Engine via API Gateway (Golden Rule compliant).
 * The Python services handle autonomous reasoning with ReAct + Chain-of-Thought methodology.
 */
export async function* executeMode4(
  config: Mode4Config
): AsyncGenerator<AutonomousStreamChunk> {
  const requestId = `mode4_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const startTime = Date.now();

  try {
    const payload = {
      agent_id: config.agentId,
      message: config.message,
      enable_rag: config.enableRAG !== false,
      enable_tools: config.enableTools ?? true,
      selected_rag_domains: config.selectedRagDomains ?? [],
      requested_tools: config.requestedTools ?? [],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      max_iterations: config.maxIterations ?? 10,
      confidence_threshold: config.confidenceThreshold ?? 0.95,
      user_id: config.userId,
      tenant_id: config.tenantId,
      session_id: config.sessionId,
      conversation_history: config.conversationHistory ?? [],
    };

    const response = await fetch(
      `${API_GATEWAY_URL}/api/mode4/autonomous-manual`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': config.tenantId || DEFAULT_TENANT_ID,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.detail ||
          errorBody.error ||
          `API Gateway responded with status ${response.status}`
      );
    }

    const result =
      (await response.json()) as Mode4AutonomousManualApiResponse;

    if (result.autonomous_reasoning) {
      yield {
        type: 'reasoning_start',
        metadata: {
          max_iterations: result.autonomous_reasoning.max_iterations,
          confidence_threshold:
            result.autonomous_reasoning.confidence_threshold,
          agent_id: result.agent_id,
        },
        timestamp: new Date().toISOString(),
      };
    }

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
      autonomous_reasoning: result.autonomous_reasoning,
      citations: result.citations ?? [],
      reasoning: result.reasoning ?? [],
    });

    // Emit response content - stream word-by-word
    const words = result.content.split(' ');
    const wordsPerChunk = 3; // Stream 3 words at a time
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkContent = words.slice(i, i + wordsPerChunk).join(' ') + (i + wordsPerChunk < words.length ? ' ' : '');
      yield {
        type: 'content',
        content: chunkContent,
        metadata: {
          confidence: result.confidence,
          iterations: result.autonomous_reasoning?.iterations ?? 0,
          toolsUsed: result.autonomous_reasoning?.tools_used ?? [],
          agentId: result.agent_id,
        },
        timestamp: new Date().toISOString(),
      };
      // Small delay for smoother streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    yield {
      type: 'done',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    yield {
      type: 'error',
      content: `Error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
    throw error;
  }
}
