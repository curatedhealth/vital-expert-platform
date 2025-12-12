'use client';

import { useChat, useCompletion } from '@ai-sdk/react';
import { useState, useCallback, useMemo } from 'react';

/**
 * useAskExpert - Hook for Ask Expert 4-Mode System
 * 
 * Integrates with Vercel AI SDK for:
 * - Streaming responses
 * - Multi-turn conversations
 * - Tool calling
 * - Generative UI
 * 
 * @see https://ai-sdk.dev/
 */

export type AskExpertMode = 1 | 2 | 3 | 4;

export interface AskExpertOptions {
  mode: AskExpertMode;
  tenantId: string;
  sessionId?: string;
  onAgentUpdate?: (agent: AgentInfo) => void;
  onFusionUpdate?: (evidence: FusionEvidence) => void;
  onError?: (error: Error) => void;
}

export interface AgentInfo {
  id: string;
  name: string;
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  domain?: string;
  status: 'idle' | 'thinking' | 'responding' | 'delegating';
}

export interface FusionEvidence {
  vectorScores: { agentId: string; score: number }[];
  graphPaths: { path: string; relevance: number }[];
  relationalPatterns: { pattern: string; success: number }[];
  weights: { vector: number; graph: number; relational: number };
  retrievalTimeMs: number;
}

export interface ReasoningStep {
  id: string;
  step: string;
  content: string;
  status: 'pending' | 'processing' | 'complete';
  agentLevel?: string;
  duration?: number;
}

const MODE_ENDPOINTS: Record<AskExpertMode, string> = {
  1: '/api/expert/mode1/stream',
  2: '/api/expert/mode2/stream',
  3: '/api/expert/mode3/stream',
  4: '/api/expert/mode4/stream',
};

export function useAskExpert(options: AskExpertOptions) {
  const { mode, tenantId, sessionId, onAgentUpdate, onFusionUpdate, onError } = options;

  const [currentAgent, setCurrentAgent] = useState<AgentInfo | null>(null);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [fusionEvidence, setFusionEvidence] = useState<FusionEvidence | null>(null);

  // Use Vercel AI SDK's useChat for conversation management
  const {
    messages,
    input,
    setInput,
    append,
    reload,
    stop,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: MODE_ENDPOINTS[mode],
    id: sessionId,
    body: {
      tenant_id: tenantId,
      mode,
    },
    onResponse: (response) => {
      // Parse streaming headers for agent updates
      const agentHeader = response.headers.get('X-Agent-Info');
      if (agentHeader) {
        try {
          const agent = JSON.parse(agentHeader);
          setCurrentAgent(agent);
          onAgentUpdate?.(agent);
        } catch (e) {
          console.error('Failed to parse agent info:', e);
        }
      }
    },
    onFinish: (message) => {
      // Extract fusion evidence from final message
      if (message.annotations) {
        const fusion = message.annotations.find(
          (a: Record<string, unknown>) => a.type === 'fusion_evidence'
        );
        if (fusion) {
          setFusionEvidence(fusion.data as FusionEvidence);
          onFusionUpdate?.(fusion.data as FusionEvidence);
        }
      }
    },
    onError: (error) => {
      console.error('Ask Expert error:', error);
      onError?.(error);
    },
  });

  // Submit a question to the expert
  const askExpert = useCallback(
    async (question: string, context?: Record<string, unknown>) => {
      setReasoningSteps([]);
      setFusionEvidence(null);
      
      await append({
        role: 'user',
        content: question,
        data: context,
      });
    },
    [append]
  );

  // Reset the conversation
  const reset = useCallback(() => {
    setMessages([]);
    setCurrentAgent(null);
    setReasoningSteps([]);
    setFusionEvidence(null);
  }, [setMessages]);

  // Computed status
  const status = useMemo(() => {
    if (error) return 'error';
    if (isLoading) return 'streaming';
    if (messages.length > 0) return 'idle';
    return 'empty';
  }, [error, isLoading, messages.length]);

  return {
    // Conversation state
    messages,
    input,
    setInput,
    status,
    error,
    
    // Agent state
    currentAgent,
    reasoningSteps,
    fusionEvidence,
    
    // Actions
    askExpert,
    reload,
    stop,
    reset,
    
    // Loading state
    isLoading,
  };
}

/**
 * useExpertCompletion - Single-turn expert query
 * Use for Mode 1 (simple direct answers)
 */
export function useExpertCompletion(options: Pick<AskExpertOptions, 'tenantId' | 'onError'>) {
  const { tenantId, onError } = options;

  const {
    completion,
    input,
    setInput,
    complete,
    stop,
    isLoading,
    error,
  } = useCompletion({
    api: '/api/expert/mode1/stream',
    body: {
      tenant_id: tenantId,
    },
    onError: (error) => {
      console.error('Expert completion error:', error);
      onError?.(error);
    },
  });

  const status = useMemo(() => {
    if (error) return 'error';
    if (isLoading) return 'streaming';
    if (completion) return 'complete';
    return 'idle';
  }, [error, isLoading, completion]);

  return {
    completion,
    input,
    setInput,
    complete,
    stop,
    isLoading,
    error,
    status,
  };
}

export type { AskExpertOptions };
