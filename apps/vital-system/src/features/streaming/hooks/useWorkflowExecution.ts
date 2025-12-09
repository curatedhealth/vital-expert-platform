/**
 * useWorkflowExecution Hook
 * 
 * React hook for executing workflows with real-time streaming.
 * Integrates with the backend SSE streaming API.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkflowDefinition } from '../../workflow-designer/types/workflow';

export type ExecutionEventType =
  | 'execution_started'
  | 'node_started'
  | 'node_completed'
  | 'node_failed'
  | 'token_generated'
  | 'progress_update'
  | 'execution_completed'
  | 'execution_failed'
  | 'result'
  | 'error'
  | 'heartbeat';

export interface ExecutionEvent {
  type: ExecutionEventType;
  data: Record<string, unknown>;
  timestamp?: string;
}

export interface NodeExecution {
  nodeId: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  output?: unknown;
  error?: string;
}

export interface ExecutionProgress {
  currentStep: number;
  totalSteps?: number;
  percentComplete?: number;
  description?: string;
}

export interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled';
  output?: Record<string, unknown>;
  error?: string;
  metrics?: {
    durationMs: number;
    totalTokens: number;
    nodesExecuted: number;
  };
  nodeResults: Record<string, unknown>;
}

export interface UseWorkflowExecutionOptions {
  onNodeStart?: (nodeId: string, nodeType: string) => void;
  onNodeComplete?: (nodeId: string, output: unknown) => void;
  onNodeFail?: (nodeId: string, error: string) => void;
  onProgress?: (progress: ExecutionProgress) => void;
  onComplete?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
  baseUrl?: string;
}

export interface UseWorkflowExecutionReturn {
  execute: (workflow: WorkflowDefinition, inputData?: Record<string, unknown>) => Promise<void>;
  executeById: (workflowId: string, inputData?: Record<string, unknown>) => Promise<void>;
  cancel: () => void;
  isExecuting: boolean;
  executionId: string | null;
  progress: ExecutionProgress | null;
  nodeExecutions: Map<string, NodeExecution>;
  result: ExecutionResult | null;
  error: Error | null;
  currentTokens: string;
}

export function useWorkflowExecution({
  onNodeStart,
  onNodeComplete,
  onNodeFail,
  onProgress,
  onComplete,
  onError,
  baseUrl = '/api/v1',
}: UseWorkflowExecutionOptions = {}): UseWorkflowExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);
  const [nodeExecutions, setNodeExecutions] = useState<Map<string, NodeExecution>>(new Map());
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentTokens, setCurrentTokens] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const processEvent = useCallback((event: ExecutionEvent) => {
    switch (event.type) {
      case 'execution_started':
        setExecutionId(event.data.execution_id as string);
        setNodeExecutions(new Map());
        setResult(null);
        setError(null);
        setCurrentTokens('');
        break;

      case 'node_started':
        const startNodeId = event.data.node_id as string;
        const startNodeType = event.data.node_type as string;
        
        setNodeExecutions(prev => {
          const updated = new Map(prev);
          updated.set(startNodeId, {
            nodeId: startNodeId,
            nodeType: startNodeType,
            status: 'running',
            startTime: new Date(),
          });
          return updated;
        });
        
        onNodeStart?.(startNodeId, startNodeType);
        break;

      case 'node_completed':
        const completeNodeId = event.data.node_id as string;
        const output = event.data.output;
        
        setNodeExecutions(prev => {
          const updated = new Map(prev);
          const existing = updated.get(completeNodeId);
          if (existing) {
            updated.set(completeNodeId, {
              ...existing,
              status: 'completed',
              endTime: new Date(),
              output,
            });
          }
          return updated;
        });
        
        onNodeComplete?.(completeNodeId, output);
        break;

      case 'node_failed':
        const failNodeId = event.data.node_id as string;
        const nodeError = event.data.error as string;
        
        setNodeExecutions(prev => {
          const updated = new Map(prev);
          const existing = updated.get(failNodeId);
          if (existing) {
            updated.set(failNodeId, {
              ...existing,
              status: 'failed',
              endTime: new Date(),
              error: nodeError,
            });
          }
          return updated;
        });
        
        onNodeFail?.(failNodeId, nodeError);
        break;

      case 'token_generated':
        const token = event.data.token as string;
        setCurrentTokens(prev => prev + token);
        break;

      case 'progress_update':
        const progressData: ExecutionProgress = {
          currentStep: event.data.currentStep as number,
          totalSteps: event.data.totalSteps as number | undefined,
          percentComplete: event.data.percentComplete as number | undefined,
          description: event.data.description as string | undefined,
        };
        setProgress(progressData);
        onProgress?.(progressData);
        break;

      case 'execution_completed':
      case 'result':
        setIsExecuting(false);
        const completedResult: ExecutionResult = {
          executionId: event.data.execution_id as string || executionId || '',
          status: 'completed',
          output: event.data.output as Record<string, unknown>,
          metrics: event.data.metrics as ExecutionResult['metrics'],
          nodeResults: event.data.node_results as Record<string, unknown> || {},
        };
        setResult(completedResult);
        onComplete?.(completedResult);
        break;

      case 'execution_failed':
      case 'error':
        setIsExecuting(false);
        const errorMessage = event.data.error as string;
        const err = new Error(errorMessage);
        setError(err);
        setResult({
          executionId: executionId || '',
          status: 'failed',
          error: errorMessage,
          nodeResults: {},
        });
        onError?.(err);
        break;

      case 'heartbeat':
        // Keep-alive, no action needed
        break;
    }
  }, [executionId, onNodeStart, onNodeComplete, onNodeFail, onProgress, onComplete, onError]);

  const execute = useCallback(async (
    workflow: WorkflowDefinition,
    inputData: Record<string, unknown> = {},
  ) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setProgress(null);
    setNodeExecutions(new Map());
    setResult(null);
    setError(null);
    setCurrentTokens('');

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${baseUrl}/stream/workflow/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          workflow_id: workflow.id,
          workflow_definition: workflow,
          input_data: inputData,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsExecuting(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Parse SSE events
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const eventBlock of lines) {
          if (!eventBlock.trim()) continue;

          const eventLines = eventBlock.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of eventLines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7);
            } else if (line.startsWith('data: ')) {
              eventData += line.slice(6);
            }
          }

          if (eventType && eventData) {
            try {
              const parsed: ExecutionEvent = {
                type: eventType as ExecutionEventType,
                data: JSON.parse(eventData),
              };
              processEvent(parsed);
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
      setIsExecuting(false);
    }
  }, [baseUrl, isExecuting, processEvent, onError]);

  const executeById = useCallback(async (
    workflowId: string,
    inputData: Record<string, unknown> = {},
  ) => {
    // Create minimal workflow definition with just ID
    const workflow: WorkflowDefinition = {
      id: workflowId,
      name: '',
      nodes: [],
      edges: [],
      config: {},
    };
    
    await execute(workflow, inputData);
  }, [execute]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsExecuting(false);
    setResult({
      executionId: executionId || '',
      status: 'cancelled',
      nodeResults: {},
    });
  }, [executionId]);

  return {
    execute,
    executeById,
    cancel,
    isExecuting,
    executionId,
    progress,
    nodeExecutions,
    result,
    error,
    currentTokens,
  };
}


