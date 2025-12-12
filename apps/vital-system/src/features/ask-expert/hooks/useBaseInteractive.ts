'use client';

/**
 * VITAL Platform - Base Interactive Hook
 * 
 * Shared foundation for Mode 1 & Mode 2 (Interactive modes)
 * - Multi-turn conversation
 * - Single turn execution
 * - Token streaming
 * - Evidence collection
 * 
 * Mode 1 extends this: + Manual expert selection
 * Mode 2 extends this: + Fusion auto-selection
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import {
  useSSEStream,
  TokenEvent,
  ReasoningEvent,
  CitationEvent,
  ToolCallEvent,
  FusionEvent,
  CostEvent,
  DoneEvent,
  ErrorEvent,
} from './useSSEStream';

// =============================================================================
// CSRF TOKEN HELPER
// =============================================================================

/**
 * Get CSRF token from cookie (client-side)
 * Supports __Host-csrf-token and csrf_token cookie names
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie?.split(';') || [];
  for (const c of parts) {
    const [name, ...rest] = c.trim().split('=');
    if (!name) continue;
    if (name === '__Host-csrf-token' || name === 'csrf_token') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

// =============================================================================
// SHARED TYPES (Interactive Modes)
// =============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  expertId?: string;
  expertName?: string;
  expertLevel?: string;
  reasoning?: ReasoningEvent[];
  citations?: CitationEvent[];
  toolCalls?: ToolCallEvent[];
  fusionEvidence?: FusionEvent;
  cost?: number;
  durationMs?: number;
  tokenCount?: number;
}

export interface Expert {
  id: string;
  name: string;
  domain: string;
  level: 'L1' | 'L2' | 'L3';
  avatar?: string;
  specialty?: string;
  description?: string;
  confidence?: number; // For Mode 2 fusion selection
}

export interface SendMessageOptions {
  enableRag?: boolean;
  enableWebSearch?: boolean;
  responseDepth?: 'concise' | 'standard' | 'comprehensive';
}

export interface UseBaseInteractiveOptions {
  conversationId?: string;
  expertId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onMessageComplete?: (message: Message) => void;
  onFusionComplete?: (experts: Expert[]) => void; // Mode 2 only
  baseUrl?: string;
  mode: 'mode1_manual_interactive' | 'mode2_auto_interactive';
}

export interface BaseInteractiveState {
  // Message state
  messages: Message[];
  currentContent: string;
  currentReasoning: ReasoningEvent[];
  currentCitations: CitationEvent[];
  currentToolCalls: ToolCallEvent[];
  fusionEvidence: FusionEvent | null;
  currentCost: CostEvent | null;
  
  // Connection state
  isStreaming: boolean;
  isConnected: boolean;
  error: Error | null;
  
  // Expert state
  selectedExpert: Expert | null;
  selectedTeam: Expert[]; // Mode 2: multiple experts from fusion
}

export interface BaseInteractiveActions {
  sendMessage: (message: string, options?: SendMessageOptions) => void;
  selectExpert: (expert: Expert) => void;
  stopGeneration: () => void;
  clearMessages: () => void;
  retryLastMessage: () => void;
}

// =============================================================================
// MAIN HOOK - SHARED LOGIC
// =============================================================================

export function useBaseInteractive(
  options: UseBaseInteractiveOptions
): BaseInteractiveState & BaseInteractiveActions {
  const {
    conversationId: initialConversationId,
    expertId,
    tenantId,
    onError,
    onMessageComplete,
    onFusionComplete,
    baseUrl = '/api/expert',
    mode,
  } = options;

  // Determine endpoint based on mode
  const streamUrl = mode === 'mode1_manual_interactive' 
    ? `${baseUrl}/mode1/stream`
    : `${baseUrl}/mode2/stream`;

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningEvent[]>([]);
  const [currentCitations, setCurrentCitations] = useState<CitationEvent[]>([]);
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCallEvent[]>([]);
  const [fusionEvidence, setFusionEvidence] = useState<FusionEvent | null>(null);
  const [currentCost, setCurrentCost] = useState<CostEvent | null>(null);
  
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Expert[]>([]);
  
  // Refs
  const pendingMessageIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(initialConversationId);
  const lastUserMessageRef = useRef<string>('');
  const lastOptionsRef = useRef<SendMessageOptions | undefined>(undefined);

  // ==========================================================================
  // EVENT HANDLERS (Shared)
  // ==========================================================================

  const handleToken = useCallback((event: TokenEvent) => {
    setCurrentContent((prev) => prev + event.content);
  }, []);

  const handleReasoning = useCallback((event: ReasoningEvent) => {
    setCurrentReasoning((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === event.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = event;
        return updated;
      }
      return [...prev, event];
    });
  }, []);

  const handleCitation = useCallback((event: CitationEvent) => {
    setCurrentCitations((prev) => {
      if (prev.some((c) => c.id === event.id)) return prev;
      return [...prev, event];
    });
  }, []);

  const handleToolCall = useCallback((event: ToolCallEvent) => {
    setCurrentToolCalls((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === event.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = event;
        return updated;
      }
      return [...prev, event];
    });
  }, []);

  // Mode 2: Fusion event handler
  const handleFusion = useCallback((event: FusionEvent) => {
    setFusionEvidence(event);
    
    // Mode 2: Extract selected experts from fusion
    if (mode === 'mode2_auto_interactive' && event.selectedExperts) {
      const experts: Expert[] = event.selectedExperts.map((e: any) => ({
        id: e.id,
        name: e.name,
        domain: e.domain || e.specialty || '',
        level: e.level || 'L2',
        confidence: e.confidence,
      }));
      setSelectedTeam(experts);
      
      // Set primary expert (highest confidence)
      if (experts.length > 0) {
        setSelectedExpert(experts[0]);
      }
      
      onFusionComplete?.(experts);
    }
  }, [mode, onFusionComplete]);

  const handleCost = useCallback((event: CostEvent) => {
    setCurrentCost(event);
  }, []);

  // Done handler - finalize message
  const handleDone = useCallback(
    (event: DoneEvent) => {
      if (pendingMessageIdRef.current) {
        const newMessage: Message = {
          id: event.messageId || pendingMessageIdRef.current,
          role: 'assistant',
          content: currentContent,
          timestamp: new Date(),
          expertId: selectedExpert?.id,
          expertName: selectedExpert?.name,
          expertLevel: selectedExpert?.level,
          reasoning: currentReasoning.length > 0 ? [...currentReasoning] : undefined,
          citations: currentCitations.length > 0 ? [...currentCitations] : undefined,
          toolCalls: currentToolCalls.length > 0 ? [...currentToolCalls] : undefined,
          fusionEvidence: fusionEvidence || undefined,
          cost: event.cost,
          durationMs: event.durationMs,
          tokenCount: event.totalTokens,
        };

        setMessages((prev) => [...prev, newMessage]);
        onMessageComplete?.(newMessage);

        // Reset current state
        resetCurrentState();
      }
    },
    [currentContent, currentReasoning, currentCitations, currentToolCalls, fusionEvidence, selectedExpert, onMessageComplete]
  );

  const handleError = useCallback(
    (event: ErrorEvent) => {
      onError?.(new Error(event.message));
    },
    [onError]
  );

  // ==========================================================================
  // SSE CONNECTION
  // ==========================================================================

  // Build headers with tenant ID and CSRF token
  const sseHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    return Object.keys(headers).length > 0 ? headers : undefined;
  }, [tenantId]);

  const {
    connect,
    disconnect,
    isConnected,
    isStreaming,
    error,
  } = useSSEStream({
    url: streamUrl,
    headers: sseHeaders,
    onToken: handleToken,
    onReasoning: handleReasoning,
    onCitation: handleCitation,
    onToolCall: handleToolCall,
    onFusion: handleFusion,
    onCost: handleCost,
    onDone: handleDone,
    onError: handleError,
    autoReconnect: false,
  });

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const resetCurrentState = useCallback(() => {
    setCurrentContent('');
    setCurrentReasoning([]);
    setCurrentCitations([]);
    setCurrentToolCalls([]);
    setFusionEvidence(null);
    setCurrentCost(null);
    pendingMessageIdRef.current = null;
  }, []);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const sendMessage = useCallback(
    (message: string, sendOptions?: SendMessageOptions) => {
      if (!message.trim() || isStreaming) return;

      // Mode 1: Require expert selection
      if (mode === 'mode1_manual_interactive' && !selectedExpert && !expertId) {
        onError?.(new Error('Please select an expert before sending a message'));
        return;
      }

      // Store for retry
      lastUserMessageRef.current = message;
      lastOptionsRef.current = sendOptions;

      // Add user message
      const userMessageId = crypto.randomUUID();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Prepare for assistant response
      const assistantMessageId = crypto.randomUUID();
      pendingMessageIdRef.current = assistantMessageId;

      // Generate conversation ID if not set
      if (!conversationIdRef.current) {
        conversationIdRef.current = crypto.randomUUID();
      }

      // Build request payload
      const payload: Record<string, any> = {
        conversation_id: conversationIdRef.current,
        message,
        mode,
        tenant_id: tenantId,
        options: {
          enable_rag: sendOptions?.enableRag ?? true,
          enable_websearch: sendOptions?.enableWebSearch ?? true,
          response_depth: sendOptions?.responseDepth ?? 'standard',
        },
      };

      // Mode 1: Include selected expert ID
      if (mode === 'mode1_manual_interactive') {
        payload.expert_id = selectedExpert?.id || expertId;
      }
      // Mode 2: Fusion will auto-select experts

      connect(payload);
    },
    [connect, expertId, tenantId, selectedExpert, isStreaming, mode, onError]
  );

  const selectExpert = useCallback((expert: Expert) => {
    setSelectedExpert(expert);
  }, []);

  const stopGeneration = useCallback(() => {
    disconnect();

    if (currentContent && pendingMessageIdRef.current) {
      const partialMessage: Message = {
        id: pendingMessageIdRef.current,
        role: 'assistant',
        content: currentContent + '\n\n*[Generation stopped by user]*',
        timestamp: new Date(),
        expertId: selectedExpert?.id,
        expertName: selectedExpert?.name,
        reasoning: currentReasoning.length > 0 ? [...currentReasoning] : undefined,
        citations: currentCitations.length > 0 ? [...currentCitations] : undefined,
        toolCalls: currentToolCalls.length > 0 ? [...currentToolCalls] : undefined,
      };
      setMessages((prev) => [...prev, partialMessage]);
      resetCurrentState();
    }
  }, [disconnect, currentContent, currentReasoning, currentCitations, currentToolCalls, selectedExpert, resetCurrentState]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    resetCurrentState();
    conversationIdRef.current = undefined;
    setSelectedTeam([]);
  }, [resetCurrentState]);

  const retryLastMessage = useCallback(() => {
    if (lastUserMessageRef.current && !isStreaming) {
      setMessages((prev) => {
        // Remove last assistant message if errored
        let filtered = prev;
        if (filtered[filtered.length - 1]?.role === 'assistant') {
          filtered = filtered.slice(0, -1);
        }
        // Remove last user message (will be re-added)
        if (filtered[filtered.length - 1]?.role === 'user' && 
            filtered[filtered.length - 1].content === lastUserMessageRef.current) {
          filtered = filtered.slice(0, -1);
        }
        return filtered;
      });
      
      sendMessage(lastUserMessageRef.current, lastOptionsRef.current);
    }
  }, [sendMessage, isStreaming]);

  return {
    // State
    messages,
    currentContent,
    currentReasoning,
    currentCitations,
    currentToolCalls,
    fusionEvidence,
    currentCost,
    isStreaming,
    isConnected,
    error,
    selectedExpert,
    selectedTeam,
    
    // Actions
    sendMessage,
    selectExpert,
    stopGeneration,
    clearMessages,
    retryLastMessage,
  };
}

export default useBaseInteractive;
