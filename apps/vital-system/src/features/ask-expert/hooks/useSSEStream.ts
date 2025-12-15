'use client';

/**
 * VITAL Platform - Base SSE Stream Hook
 * 
 * Robust Server-Sent Events connection handler with:
 * - Typed event handling for all VITAL AI event types
 * - Buffer management for partial events
 * - Connection state tracking
 * - Automatic cleanup on unmount
 * - Error recovery support
 * 
 * Phase 4: Integration & Streaming
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@vital/utils';

// =============================================================================
// SSE EVENT TYPES
// =============================================================================

export type SSEEventType =
  | 'token'           // Streaming text token
  | 'reasoning'       // Agent reasoning step
  | 'thinking'        // Backend alias for reasoning (workflow progress)
  | 'plan'            // Mission plan emitted up-front
  | 'step_progress'   // Mission step progress updates
  | 'ui_updates'      // Misc UI events (artifacts, checkpoints, preflight)
  | 'artifact'        // Artifact generation event
  | 'sources'         // Citation bundle
  | 'citation'        // Evidence citation
  | 'tool_call'       // L5 tool invocation
  | 'tool'            // Backend alias for tool_call
  | 'status'          // Status updates (planning/running/etc.)
  | 'tool_result'     // L5 tool result
  | 'delegation'      // Agent delegation
  | 'checkpoint'      // HITL checkpoint
  | 'progress'        // Progress update
  | 'fusion'          // Fusion Intelligence evidence
  | 'cost'            // Cost tracking update
  | 'error'           // Error event
  | 'done'            // Stream complete
  | 'heartbeat';      // Keep-alive

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}

// =============================================================================
// EVENT DATA TYPES
// =============================================================================

export interface TokenEvent {
  content: string;
  tokenIndex: number;
  nodeId?: string;
}

export interface ReasoningEvent {
  id: string;
  step: string;
  stepIndex: number;
  agentLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  agentId: string;
  agentName: string;
  content: string;
  status: 'thinking' | 'complete' | 'error';
  durationMs?: number;
}

export interface CitationEvent {
  id: string;
  index: number;
  source: 'pubmed' | 'fda' | 'clinical_trial' | 'web' | 'document' | 'rag' | 'cochrane' | 'drugbank';
  title: string;
  excerpt: string;
  url?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ToolCallEvent {
  id: string;
  toolId: string;
  toolName: string;
  toolType: string;
  status: 'calling' | 'success' | 'error';
  input?: Record<string, unknown>;
  output?: unknown;
  durationMs?: number;
  error?: string;
}

export interface DelegationEvent {
  fromAgentId: string;
  fromAgentName: string;
  fromLevel: string;
  toAgentId: string;
  toAgentName: string;
  toLevel: string;
  task: string;
  reason: string;
}

export interface CheckpointEvent {
  id: string;
  type: 'plan_approval' | 'tool_approval' | 'sub_agent_approval' | 'critical_decision' | 'final_review';
  title: string;
  description: string;
  context: Record<string, unknown>;
  options: string[];
  risks?: string[];
  recommendations?: string[];
  timeout: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProgressEvent {
  stage: string;
  progress: number; // 0-100
  message: string;
  status?: string;
  subSteps?: Array<{ name: string; status: 'pending' | 'active' | 'complete' | 'error' }>;
}

export interface StatusEvent {
  status: string;
  message?: string;
}

export interface PlanEvent {
  plan: Array<{ id?: string; name?: string; description?: string; status?: string }>;
  plan_confidence?: number | null;
  status?: string;
  message?: string;
}

export interface StepProgressEvent {
  step?: string;
  step_number?: number;
  total_steps?: number;
  percentage?: number;
  message?: string;
  status?: string;
  stage?: string;
}

export interface ArtifactEvent {
  id: string;
  artifactType?: string;
  title?: string;
  content?: string;
  format?: string;
  downloadUrl?: string;
  citations?: CitationEvent[];
}

export interface FusionEvent {
  selectedExperts: Array<{
    id: string;
    name: string;
    role: string;
    confidence: number;
    level: string;
  }>;
  evidence: {
    vectorScores: Record<string, number>;
    graphPaths: string[];
    relationalPatterns: Record<string, number>;
  };
  weights: {
    vector: number;
    graph: number;
    relational: number;
  };
  reasoning: string;
  retrievalTimeMs: number;
}

export interface CostEvent {
  currentCost: number;
  budgetLimit?: number;
  breakdown: {
    llm: number;
    tools: number;
    other: number;
  };
  estimatedTotal: number;
}

export interface ErrorEvent {
  code: string;
  message: string;
  recoverable: boolean;
  retryAfterMs?: number;
}

export interface DoneEvent {
  messageId?: string;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  durationMs?: number;
  citationCount?: number;
  toolCallCount?: number;
  status?: string;
  message?: string;
  final?: unknown;
  artifacts?: unknown;
}

// =============================================================================
// HOOK OPTIONS & RETURN TYPES
// =============================================================================

export interface UseSSEStreamOptions {
  url: string;
  headers?: Record<string, string>;
  onToken?: (event: TokenEvent) => void;
  onReasoning?: (event: ReasoningEvent) => void;
  onPlan?: (event: PlanEvent) => void;
  onStatus?: (event: StatusEvent) => void;
  onCitation?: (event: CitationEvent) => void;
  onToolCall?: (event: ToolCallEvent) => void;
  onDelegation?: (event: DelegationEvent) => void;
  onCheckpoint?: (event: CheckpointEvent) => void;
  onProgress?: (event: ProgressEvent) => void;
  onArtifact?: (event: ArtifactEvent) => void;
  onFusion?: (event: FusionEvent) => void;
  onCost?: (event: CostEvent) => void;
  onError?: (event: ErrorEvent) => void;
  onDone?: (event: DoneEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

export interface UseSSEStreamReturn {
  connect: (body: Record<string, unknown>) => void;
  disconnect: () => void;
  isConnected: boolean;
  isStreaming: boolean;
  error: Error | null;
  reconnectAttempts: number;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useSSEStream(options: UseSSEStreamOptions): UseSSEStreamReturn {
  const {
    url,
    headers = {},
    onToken,
    onReasoning,
    onPlan,
    onStatus,
    onCitation,
    onToolCall,
    onDelegation,
    onCheckpoint,
    onProgress,
    onArtifact,
    onFusion,
    onCost,
    onError,
    onDone,
    onConnectionChange,
    autoReconnect = false,
    maxReconnectAttempts = 3,
    reconnectDelayMs = 1000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const lastBodyRef = useRef<Record<string, unknown> | null>(null);
  const isConnectingRef = useRef(false); // Guard against race conditions

  // Handle individual events
  const handleEvent = useCallback(
    (event: SSEEvent) => {
      switch (event.type) {
        case 'token':
        case 'content': // Backend sometimes emits 'content' instead of 'token'
        case 'message': // Fallback alias
          {
            // Normalize token event data - backend may send 'text' or 'content'
            const tokenData = event.data as Record<string, unknown>;
            const normalizedToken: TokenEvent = {
              // Handle both 'content' and 'text' field names from backend
              content: (tokenData.content as string) || (tokenData.text as string) || '',
              tokenIndex: (tokenData.tokenIndex as number) ?? (tokenData.tokens as number) ?? 0,
              nodeId: tokenData.nodeId as string | undefined,
            };
            // Only call onToken if we have actual content
            if (normalizedToken.content) {
              // Debug: trace onToken dispatch
              if (process.env.NODE_ENV !== 'production' && normalizedToken.tokenIndex <= 5) {
                // eslint-disable-next-line no-console
                console.debug('[useSSEStream] dispatching onToken:', normalizedToken.content);
              }
              onToken?.(normalizedToken);
            }
          }
          break;
        case 'reasoning':
        case 'thinking':  // Backend sends 'thinking', frontend expects 'reasoning'
          onReasoning?.(normalizeReasoning(event.data));
          break;
        case 'plan': {
          const planEvent = event.data as PlanEvent;
          onPlan?.(planEvent);
          if (onProgress) {
            const subSteps = (planEvent.plan || []).map((step, idx) => ({
              name: step.name || step.description || `Step ${idx + 1}`,
              status: (step.status as 'pending' | 'active' | 'complete') || 'pending',
            }));
            onProgress({
              stage: 'planning',
              progress: 0,
              message: planEvent.message || 'Plan generated',
              status: planEvent.status || 'planning',
              subSteps,
            });
          }
          break;
        }
        case 'step_progress': {
          const progressEvent = event.data as StepProgressEvent;
          onProgress?.({
            stage: progressEvent.stage || progressEvent.step || 'execution',
            progress: progressEvent.percentage ?? 0,
            message: progressEvent.message || 'Executing mission',
            status: progressEvent.status,
            subSteps: undefined,
          });
          break;
        }
        case 'ui_updates': {
          const items = (event.data as any)?.items || [];
          items.forEach((item: any) => {
            if (item?.type === 'checkpoint' && onCheckpoint) {
              onCheckpoint(normalizeCheckpoint(item.payload));
            }
            if (item?.type === 'artifact' && onArtifact) {
              onArtifact(normalizeArtifact(item.payload));
            }
            if (item?.type === 'preflight' && onProgress) {
              onProgress({
                stage: 'preflight',
                progress: 10,
                message: 'Preflight checks completed',
              } as ProgressEvent);
            }
          });
          break;
        }
        case 'artifact':
          onArtifact?.(normalizeArtifact(event.data));
          break;
        case 'sources': {
          const citations = (event.data as any)?.items || [];
          citations.forEach((citation: any, idx: number) => {
            onCitation?.(normalizeCitation(citation, idx));
          });
          break;
        }
        case 'citation':
          onCitation?.(event.data as CitationEvent);
          break;
        case 'tool_call':
        case 'tool_result':
        case 'tool':
          onToolCall?.(normalizeToolCall(event.data));
          break;
        case 'delegation':
          onDelegation?.(event.data as DelegationEvent);
          break;
        case 'checkpoint':
          onCheckpoint?.(event.data as CheckpointEvent);
          break;
        case 'status':
          onStatus?.(event.data as StatusEvent);
          break;
        case 'progress':
          onProgress?.(event.data as ProgressEvent);
          break;
        case 'fusion':
          onFusion?.(event.data as FusionEvent);
          break;
        case 'cost':
          onCost?.(event.data as CostEvent);
          break;
        case 'error':
          onError?.(event.data as ErrorEvent);
          break;
        case 'done':
          onDone?.(event.data as DoneEvent);
          setIsStreaming(false);
          break;
        case 'heartbeat':
          // Keep-alive, no action needed
          break;
      }
    },
    [onToken, onReasoning, onCitation, onToolCall, onDelegation, onCheckpoint, onProgress, onFusion, onCost, onError, onDone]
  );

  // Connect and start streaming
  const connect = useCallback(
    async (body: Record<string, unknown>) => {
      // Guard against race conditions from rapid connect() calls
      if (isConnectingRef.current) {
        logger.warn('useSSEStream connect already in progress, ignoring duplicate call');
        return;
      }
      isConnectingRef.current = true;

      // Clean up any existing connection
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      lastBodyRef.current = body;
      setError(null);
      setIsStreaming(true);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...headers,
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status}: ${response.statusText}${errText ? ` | ${errText}` : ''}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        setIsConnected(true);
        setReconnectAttempts(0);
        onConnectionChange?.(true);

        // Process the stream
        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete events (SSE events are separated by double newlines)
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const eventText of lines) {
            if (!eventText.trim()) continue;

            const event = parseSSEEvent(eventText);
            if (event) {
              // Debug trace for difficult streaming cases
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[useSSEStream] event', event.type, event.data);
              }
              handleEvent(event);
            } else if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.warn('[useSSEStream] unparsed SSE chunk', eventText);
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          const errorObj = err as Error;
          setError(errorObj);
          onError?.({
            code: 'CONNECTION_ERROR',
            message: errorObj.message,
            recoverable: true,
          });

          // Auto-reconnect logic
          if (autoReconnect && reconnectAttempts < maxReconnectAttempts && lastBodyRef.current) {
            setReconnectAttempts((prev) => prev + 1);
            setTimeout(() => {
              if (lastBodyRef.current) {
                connect(lastBodyRef.current);
              }
            }, reconnectDelayMs * Math.pow(2, reconnectAttempts)); // Exponential backoff
          }
        }
      } finally {
        isConnectingRef.current = false; // Reset guard for next connection
        setIsConnected(false);
        setIsStreaming(false);
        onConnectionChange?.(false);
      }
    },
    [url, headers, handleEvent, onConnectionChange, onError, autoReconnect, maxReconnectAttempts, reconnectDelayMs, reconnectAttempts]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    isConnectingRef.current = false; // Reset guard on disconnect
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.cancel();
    }
    setIsConnected(false);
    setIsStreaming(false);
    setReconnectAttempts(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isStreaming,
    error,
    reconnectAttempts,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse SSE event from text
 */
function parseSSEEvent(text: string): SSEEvent | null {
  const lines = text.split('\n');
  let eventType: SSEEventType | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim() as SSEEventType;
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  const data = dataLines.join('\n');
  const resolvedEvent: SSEEventType | null = eventType || (data ? 'token' : null);

  if (resolvedEvent && data) {
    try {
      return {
        type: resolvedEvent,
        data: JSON.parse(data),
        timestamp: Date.now(),
      };
    } catch {
      // Fallback: if JSON.parse fails, pass through raw string
      return {
        type: resolvedEvent,
        data,
        timestamp: Date.now(),
      };
    }
  }

  return null;
}

// =============================================================================
// NORMALIZATION HELPERS
// =============================================================================

function normalizeArtifact(data: any): ArtifactEvent {
  const citations = Array.isArray(data?.citations)
    ? data.citations.map((c: any, idx: number) => normalizeCitation(c, idx))
    : undefined;

  return {
    id: data?.id || data?.artifact_id || `artifact-${Date.now()}`,
    artifactType: data?.artifactType || data?.type,
    title: data?.title || data?.name || data?.step || 'Artifact',
    // Backend sends summary for missions, content for documents
    content: data?.content || data?.summary || data?.text || '',
    format: data?.format,
    downloadUrl: data?.downloadUrl || data?.artifactPath,
    citations,
  };
}

function normalizeCitation(data: any, idx: number): CitationEvent {
  return {
    id: data?.id || data?.source_id || `citation-${idx}-${Date.now()}`,
    index: data?.index ?? idx + 1,
    source: (data?.source || data?.source_type || 'rag') as CitationEvent['source'],
    title: data?.title || data?.name || 'Citation',
    excerpt: data?.excerpt || data?.content_snippet || data?.snippet || '',
    url: data?.url,
    confidence: data?.confidence ?? data?.score ?? 0.8,
    metadata: data?.metadata,
  };
}

function normalizeCheckpoint(data: any): CheckpointEvent {
  return {
    id: data?.id || data?.checkpoint_id || `checkpoint-${Date.now()}`,
    type: (data?.type || data?.checkpoint_type || 'plan_approval') as CheckpointEvent['type'],
    title: data?.title || 'Checkpoint',
    description: data?.description || data?.details?.description || '',
    context: data?.context || data?.details || {},
    options: data?.options || data?.allowed_actions || ['approve', 'reject'],
    risks: data?.risks,
    recommendations: data?.recommendations,
    timeout: data?.timeout || data?.timeout_seconds || 300,
    urgency: (data?.urgency || 'medium') as CheckpointEvent['urgency'],
  };
}

function normalizeToolCall(data: any): ToolCallEvent {
  return {
    id: data?.id || data?.tool_id || `tool-${Date.now()}`,
    toolId: data?.tool_id || data?.id || '',
    toolName: data?.toolName || data?.tool_name || data?.tool_id || 'tool',
    toolType: data?.toolType || data?.tool_type || 'tool',
    status: (data?.status === 'starting' ? 'calling' : data?.status) || 'calling',
    input: data?.input,
    output: data?.output,
    durationMs: data?.durationMs || data?.duration_ms,
    error: data?.error,
  };
}

function normalizeReasoning(data: any): ReasoningEvent {
  return {
    id: data?.id || data?.step || `reasoning-${Date.now()}`,
    step: data?.step || data?.stage || 'thinking',
    stepIndex: data?.stepIndex ?? data?.step_index ?? 0,
    agentLevel: (data?.agentLevel || data?.agent_level || 'L1') as ReasoningEvent['agentLevel'],
    agentId: data?.agentId || data?.agent_id || 'orchestrator',
    agentName: data?.agentName || data?.agent_name || 'Orchestrator',
    content: data?.content || data?.message || '',
    status: (data?.status || 'thinking') as ReasoningEvent['status'],
    durationMs: data?.durationMs || data?.duration_ms,
  };
}

export default useSSEStream;
