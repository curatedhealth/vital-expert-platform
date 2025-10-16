import { useState, useCallback } from 'react';
import { AutomaticAgentOrchestrator, OrchestrationResult } from '@/features/chat/services/automatic-orchestrator';
import { PerformanceTracker } from '@/features/chat/services/performance-tracker';
// Define Agent interface locally to avoid import issues
interface Agent {
  id?: string;
  name: string;
  display_name?: string;
  description: string;
  system_prompt?: string;
  business_function?: string;
  tier?: number;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  capabilities?: string[];
  knowledge_domains?: string[];
  rag_enabled?: boolean;
}

export interface AutomaticModeState {
  isProcessing: boolean;
  orchestrationResult?: OrchestrationResult;
  error?: string;
  performanceTracker: PerformanceTracker;
}

export function useAutomaticMode() {
  const [state, setState] = useState<AutomaticModeState>({
    isProcessing: false,
    performanceTracker: new PerformanceTracker()
  });

  const orchestrator = new AutomaticAgentOrchestrator();

  const processQuery = useCallback(async (query: string): Promise<OrchestrationResult | null> => {
    setState(prev => ({ ...prev, isProcessing: true, error: undefined }));

    try {
      const result = await orchestrator.orchestrate(query);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        orchestrationResult: result
      }));

      return result;
    } catch (error) {
      console.error('Automatic mode error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to process query'
      }));
      return null;
    }
  }, [orchestrator]);

  const confirmAgent = useCallback(async (agent: Agent) => {
    if (!state.orchestrationResult) return;

    // Track performance
    const tracking = await state.performanceTracker.trackQuery(
      `query-${Date.now()}`,
      state.orchestrationResult
    );

    // Update response time
    tracking.updateResponseTime(Date.now() - (state.orchestrationResult.metadata.processingTime || 0));
    
    // Mark as successful
    tracking.updateSuccess(true);
    
    // Complete tracking
    await tracking.complete();

    // Clear orchestration result
    setState(prev => ({
      ...prev,
      orchestrationResult: undefined
    }));

    return agent;
  }, [state.orchestrationResult, state.performanceTracker]);

  const selectAlternativeAgent = useCallback(async (agent: Agent) => {
    if (!state.orchestrationResult) return;

    // Create new orchestration result with selected agent
    const modifiedResult: OrchestrationResult = {
      ...state.orchestrationResult,
      selectedAgent: agent,
      alternativeAgents: state.orchestrationResult.alternativeAgents.filter(a => a.id !== agent.id),
      reasoning: [
        ...state.orchestrationResult.reasoning,
        'User selected alternative agent'
      ]
    };

    setState(prev => ({
      ...prev,
      orchestrationResult: modifiedResult
    }));

    return agent;
  }, [state.orchestrationResult]);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      orchestrationResult: undefined,
      error: undefined
    }));
  }, []);

  const trackUserRating = useCallback(async (rating: number) => {
    if (!state.orchestrationResult) return;

    // Find the tracking for this query and update satisfaction
    // This is a simplified implementation - in production, you'd want to track by query ID
    console.log('User rating:', rating);
  }, [state.orchestrationResult]);

  return {
    ...state,
    processQuery,
    confirmAgent,
    selectAlternativeAgent,
    clearResult,
    trackUserRating
  };
}
