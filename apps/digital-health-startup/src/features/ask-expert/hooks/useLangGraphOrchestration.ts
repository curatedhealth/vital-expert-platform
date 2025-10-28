/**
 * useLangGraphOrchestration Hook
 *
 * Connects the Ask Expert UI components to the LangGraph 5-mode orchestrator.
 * Provides real-time streaming of workflow steps, reasoning, and response generation.
 *
 * @see unified-langgraph-orchestrator.ts for backend implementation
 * @see EnhancedModeSelector.tsx for mode selection UI
 * @see AdvancedStreamingWindow.tsx for streaming visualization
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { OrchestrationMode } from '@/features/chat/services/unified-langgraph-orchestrator';

// ===== TYPE DEFINITIONS =====

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  startTime?: Date;
  endTime?: Date;
  metadata?: Record<string, any>;
}

export interface ReasoningStep {
  id: string;
  type: 'thought' | 'action' | 'observation';
  content: string;
  confidence?: number;
  timestamp: Date;
}

export interface StreamingMetrics {
  tokensGenerated: number;
  tokensPerSecond: number;
  elapsedTime: number;
  estimatedTimeRemaining?: number;
}

export interface OrchestrationInput {
  query: string;
  mode: OrchestrationMode;
  userId: string;
  conversationId?: string;
  manualAgentId?: string | null;
  persistentAgentId?: string | null;
  humanApproval?: boolean;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface OrchestrationResponse {
  conversationId: string;
  response: string;
  agents: Array<{
    id: string;
    name: string;
    contribution: string;
  }>;
  workflowSteps: WorkflowStep[];
  reasoning?: ReasoningStep[];
  metrics?: StreamingMetrics;
  sources?: Array<{
    id: string;
    title: string;
    url: string;
    excerpt: string;
    similarity: number;
  }>;
  taskPlan?: {
    goal: string;
    steps: Array<{
      id: string;
      description: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
    }>;
    currentStep: number;
  };
  checkpoints?: Array<{
    id: string;
    type: 'approval' | 'review' | 'decision' | 'safety';
    description: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

export interface UseLangGraphOrchestrationReturn {
  // State
  isStreaming: boolean;
  response: string | null;
  workflowSteps: WorkflowStep[];
  reasoningSteps: ReasoningStep[];
  metrics: StreamingMetrics | null;
  error: string | null;
  conversationId: string | null;

  // Actions
  sendQuery: (input: OrchestrationInput) => Promise<void>;
  approveCheckpoint: (checkpointId: string) => Promise<void>;
  rejectCheckpoint: (checkpointId: string) => Promise<void>;
  pauseStreaming: () => void;
  resumeStreaming: () => void;
  cancelQuery: () => void;
  reset: () => void;
}

// ===== LANGGRAPH NODE TO WORKFLOW STEP MAPPING =====

const LANGGRAPH_NODE_NAMES: Record<string, { name: string; description: string }> = {
  classify_intent: {
    name: 'Intent Classification',
    description: 'Analyzing query intent and complexity'
  },
  detect_domains: {
    name: 'Domain Detection',
    description: 'Identifying knowledge domains and specializations'
  },
  select_agents: {
    name: 'Agent Selection',
    description: 'Selecting optimal expert agents for consultation'
  },
  retrieve_context: {
    name: 'Context Retrieval',
    description: 'Gathering relevant context from knowledge base'
  },
  execute_single: {
    name: 'Single Agent Execution',
    description: 'Expert generating response'
  },
  execute_multi: {
    name: 'Multi-Agent Execution',
    description: 'Multiple experts generating parallel responses'
  },
  execute_panel: {
    name: 'Panel Execution',
    description: 'Expert panel generating consensus response'
  },
  plan_task: {
    name: 'Task Planning',
    description: 'Breaking down goal into actionable steps'
  },
  execute_agent: {
    name: 'Agent Tool Execution',
    description: 'Executing agent with tool integration'
  },
  check_approval: {
    name: 'Checkpoint Approval',
    description: 'Awaiting human approval to proceed'
  },
  synthesize: {
    name: 'Response Synthesis',
    description: 'Synthesizing final response and citations'
  }
};

// ===== HOOK IMPLEMENTATION =====

export function useLangGraphOrchestration(): UseLangGraphOrchestrationReturn {
  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [metrics, setMetrics] = useState<StreamingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamStartTimeRef = useRef<number>(0);

  // Initialize workflow steps based on mode
  const initializeWorkflowSteps = useCallback((mode: OrchestrationMode): WorkflowStep[] => {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'classify_intent',
        name: LANGGRAPH_NODE_NAMES.classify_intent.name,
        description: LANGGRAPH_NODE_NAMES.classify_intent.description,
        status: 'pending'
      },
      {
        id: 'detect_domains',
        name: LANGGRAPH_NODE_NAMES.detect_domains.name,
        description: LANGGRAPH_NODE_NAMES.detect_domains.description,
        status: 'pending'
      },
      {
        id: 'select_agents',
        name: LANGGRAPH_NODE_NAMES.select_agents.name,
        description: LANGGRAPH_NODE_NAMES.select_agents.description,
        status: 'pending'
      },
      {
        id: 'retrieve_context',
        name: LANGGRAPH_NODE_NAMES.retrieve_context.name,
        description: LANGGRAPH_NODE_NAMES.retrieve_context.description,
        status: 'pending'
      }
    ];

    // Mode-specific execution steps
    switch (mode) {
      case 'query_automatic':
        baseSteps.push({
          id: 'execute_multi',
          name: LANGGRAPH_NODE_NAMES.execute_multi.name,
          description: LANGGRAPH_NODE_NAMES.execute_multi.description,
          status: 'pending'
        });
        break;

      case 'query_manual':
      case 'chat_manual':
        baseSteps.push({
          id: 'execute_single',
          name: LANGGRAPH_NODE_NAMES.execute_single.name,
          description: LANGGRAPH_NODE_NAMES.execute_single.description,
          status: 'pending'
        });
        break;

      case 'chat_automatic':
        baseSteps.push({
          id: 'execute_multi',
          name: LANGGRAPH_NODE_NAMES.execute_multi.name,
          description: 'Dynamic expert consultation with context accumulation',
          status: 'pending'
        });
        break;

      case 'agent':
        baseSteps.push(
          {
            id: 'plan_task',
            name: LANGGRAPH_NODE_NAMES.plan_task.name,
            description: LANGGRAPH_NODE_NAMES.plan_task.description,
            status: 'pending'
          },
          {
            id: 'execute_agent',
            name: LANGGRAPH_NODE_NAMES.execute_agent.name,
            description: LANGGRAPH_NODE_NAMES.execute_agent.description,
            status: 'pending'
          },
          {
            id: 'check_approval',
            name: LANGGRAPH_NODE_NAMES.check_approval.name,
            description: LANGGRAPH_NODE_NAMES.check_approval.description,
            status: 'pending'
          }
        );
        break;
    }

    // Final synthesis step
    baseSteps.push({
      id: 'synthesize',
      name: LANGGRAPH_NODE_NAMES.synthesize.name,
      description: LANGGRAPH_NODE_NAMES.synthesize.description,
      status: 'pending'
    });

    return baseSteps;
  }, []);

  // Update workflow step status
  const updateWorkflowStep = useCallback((
    stepId: string,
    updates: Partial<WorkflowStep>
  ) => {
    setWorkflowSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  }, []);

  // Send query to orchestrator
  const sendQuery = useCallback(async (input: OrchestrationInput) => {
    try {
      // Reset state
      setError(null);
      setResponse(null);
      setReasoningSteps([]);
      setMetrics(null);
      setIsStreaming(true);
      streamStartTimeRef.current = Date.now();

      // Initialize workflow steps based on mode
      const steps = initializeWorkflowSteps(input.mode);
      setWorkflowSteps(steps);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Call API endpoint with Server-Sent Events
      const response = await fetch('/api/ask-expert/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(input),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              setIsStreaming(false);
              break;
            }

            try {
              const event = JSON.parse(data);
              handleStreamEvent(event);
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      }

      setIsStreaming(false);

    } catch (err: any) {
      console.error('Orchestration error:', err);

      if (err.name === 'AbortError') {
        setError('Query cancelled');
      } else {
        setError(err.message || 'An error occurred');
      }

      setIsStreaming(false);
    }
  }, [initializeWorkflowSteps]);

  // Handle streaming events from SSE
  const handleStreamEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'workflow_step':
        updateWorkflowStep(event.stepId, {
          status: event.status,
          progress: event.progress,
          startTime: event.startTime ? new Date(event.startTime) : undefined,
          endTime: event.endTime ? new Date(event.endTime) : undefined,
          metadata: event.metadata
        });
        break;

      case 'reasoning':
        setReasoningSteps(prev => [
          ...prev,
          {
            id: event.id,
            type: event.reasoningType,
            content: event.content,
            confidence: event.confidence,
            timestamp: new Date(event.timestamp)
          }
        ]);
        break;

      case 'response_chunk':
        setResponse(prev => (prev || '') + event.chunk);
        break;

      case 'response_complete':
        setResponse(event.response);
        setConversationId(event.conversationId);
        break;

      case 'metrics':
        const elapsed = Date.now() - streamStartTimeRef.current;
        setMetrics({
          tokensGenerated: event.tokensGenerated,
          tokensPerSecond: event.tokensPerSecond,
          elapsedTime: elapsed,
          estimatedTimeRemaining: event.estimatedTimeRemaining
        });
        break;

      case 'error':
        setError(event.message);
        setIsStreaming(false);
        break;

      default:
        console.log('Unknown event type:', event.type);
    }
  }, [updateWorkflowStep]);

  // Approve checkpoint (Mode 5)
  const approveCheckpoint = useCallback(async (checkpointId: string) => {
    if (!conversationId) return;

    try {
      await fetch('/api/ask-expert/checkpoint/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, checkpointId })
      });

      // Resume streaming after approval
      setIsStreaming(true);
    } catch (err) {
      console.error('Failed to approve checkpoint:', err);
      setError('Failed to approve checkpoint');
    }
  }, [conversationId]);

  // Reject checkpoint (Mode 5)
  const rejectCheckpoint = useCallback(async (checkpointId: string) => {
    if (!conversationId) return;

    try {
      await fetch('/api/ask-expert/checkpoint/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, checkpointId })
      });

      setIsStreaming(false);
    } catch (err) {
      console.error('Failed to reject checkpoint:', err);
      setError('Failed to reject checkpoint');
    }
  }, [conversationId]);

  // Pause streaming
  const pauseStreaming = useCallback(() => {
    // Implementation depends on backend support
    console.log('Pause streaming requested');
  }, []);

  // Resume streaming
  const resumeStreaming = useCallback(() => {
    // Implementation depends on backend support
    console.log('Resume streaming requested');
  }, []);

  // Cancel query
  const cancelQuery = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIsStreaming(false);
    setResponse(null);
    setWorkflowSteps([]);
    setReasoningSteps([]);
    setMetrics(null);
    setError(null);
    setConversationId(null);
    abortControllerRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    // State
    isStreaming,
    response,
    workflowSteps,
    reasoningSteps,
    metrics,
    error,
    conversationId,

    // Actions
    sendQuery,
    approveCheckpoint,
    rejectCheckpoint,
    pauseStreaming,
    resumeStreaming,
    cancelQuery,
    reset
  };
}
