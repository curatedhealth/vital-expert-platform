/**
 * Enhanced Reasoning Stream Hook
 * Provides real-time streaming of autonomous agent reasoning process
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReasoningStep, ReasoningStreamEvent, AutonomousAgentState } from '@/types/reasoning';

interface ReasoningStreamOptions {
  sessionId: string;
  onStep?: (step: ReasoningStep) => void;
  onPhaseChange?: (phase: string, metadata: any) => void;
  onGoalUpdate?: (goals: any) => void;
  onToolCall?: (toolCall: any) => void;
  onComplete?: (finalState: AutonomousAgentState) => void;
  onError?: (error: Error) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

interface ReasoningStreamState {
  steps: ReasoningStep[];
  currentPhase: string;
  currentIteration: number;
  goalProgress: number;
  isStreaming: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  error: Error | null;
}

export function useReasoningStream(options: ReasoningStreamOptions) {
  const {
    sessionId,
    onStep,
    onPhaseChange,
    onGoalUpdate,
    onToolCall,
    onComplete,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000
  } = options;

  const [state, setState] = useState<ReasoningStreamState>({
    steps: [],
    currentPhase: '',
    currentIteration: 0,
    goalProgress: 0,
    isStreaming: false,
    isConnected: false,
    lastUpdate: null,
    error: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔌 [ReasoningStream] Connecting to stream for session:', sessionId);

    try {
      const eventSource = new EventSource(`/api/expert-consultation/stream/${sessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('open', () => {
        console.log('✅ [ReasoningStream] Connection opened');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isStreaming: true,
          error: null
        }));
      });

      eventSource.addEventListener('reasoning_step', (event) => {
        try {
          const step: ReasoningStep = JSON.parse(event.data);
          console.log('📝 [ReasoningStream] New reasoning step:', step);
          
          setState(prev => ({
            ...prev,
            steps: [...prev.steps, step],
            lastUpdate: new Date()
          }));

          onStep?.(step);
        } catch (error) {
          console.error('❌ [ReasoningStream] Error parsing reasoning step:', error);
        }
      });

      eventSource.addEventListener('phase_change', (event) => {
        try {
          const { phase, metadata } = JSON.parse(event.data);
          console.log('🔄 [ReasoningStream] Phase changed:', phase, metadata);
          
          setState(prev => ({
            ...prev,
            currentPhase: phase,
            lastUpdate: new Date()
          }));

          onPhaseChange?.(phase, metadata);
        } catch (error) {
          console.error('❌ [ReasoningStream] Error parsing phase change:', error);
        }
      });

      eventSource.addEventListener('goal_update', (event) => {
        try {
          const goalData = JSON.parse(event.data);
          console.log('🎯 [ReasoningStream] Goal updated:', goalData);
          
          setState(prev => ({
            ...prev,
            goalProgress: goalData.progress || prev.goalProgress,
            lastUpdate: new Date()
          }));

          onGoalUpdate?.(goalData);
        } catch (error) {
          console.error('❌ [ReasoningStream] Error parsing goal update:', error);
        }
      });

      eventSource.addEventListener('tool_call', (event) => {
        try {
          const toolCall = JSON.parse(event.data);
          console.log('🔧 [ReasoningStream] Tool call:', toolCall);
          
          setState(prev => ({
            ...prev,
            lastUpdate: new Date()
          }));

          onToolCall?.(toolCall);
        } catch (error) {
          console.error('❌ [ReasoningStream] Error parsing tool call:', error);
        }
      });

      eventSource.addEventListener('execution_complete', (event) => {
        try {
          const finalState: AutonomousAgentState = JSON.parse(event.data);
          console.log('✅ [ReasoningStream] Execution completed:', finalState);
          
          setState(prev => ({
            ...prev,
            isStreaming: false,
            lastUpdate: new Date()
          }));

          onComplete?.(finalState);
        } catch (error) {
          console.error('❌ [ReasoningStream] Error parsing completion:', error);
        }
      });

      eventSource.addEventListener('error', (event) => {
        console.error('❌ [ReasoningStream] Stream error:', event);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isStreaming: false,
          error: new Error('Stream connection error')
        }));

        onError?.(new Error('Stream connection error'));

        // Attempt to reconnect if auto-reconnect is enabled
        if (autoReconnect && isMountedRef.current) {
          console.log('🔄 [ReasoningStream] Attempting to reconnect...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      });

    } catch (error) {
      console.error('❌ [ReasoningStream] Failed to create connection:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Connection failed')
      }));
      onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }, [sessionId, onStep, onPhaseChange, onGoalUpdate, onToolCall, onComplete, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    console.log('🔌 [ReasoningStream] Disconnecting...');
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isStreaming: false
    }));
  }, []);

  const clearSteps = useCallback(() => {
    setState(prev => ({
      ...prev,
      steps: [],
      currentPhase: '',
      currentIteration: 0,
      goalProgress: 0
    }));
  }, []);

  // Connect on mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    steps: state.steps,
    currentPhase: state.currentPhase,
    currentIteration: state.currentIteration,
    goalProgress: state.goalProgress,
    isStreaming: state.isStreaming,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    
    // Actions
    connect,
    disconnect,
    clearSteps,
    
    // Computed values
    totalSteps: state.steps.length,
    completedSteps: state.steps.filter(step => step.status === 'completed').length,
    failedSteps: state.steps.filter(step => step.status === 'failed').length,
    currentStep: state.steps[state.steps.length - 1],
    isComplete: state.steps.length > 0 && state.steps[state.steps.length - 1]?.phase === 'completion'
  };
}