'use client';

import { useState, useCallback } from 'react';

interface StartSessionRequest {
  user_id: string;
  interaction_mode: 'interactive' | 'autonomous';
  agent_mode: 'automatic' | 'manual';
  selected_agent_id?: string;
  context?: Record<string, any>;
}

interface SwitchModeRequest {
  interaction_mode: 'interactive' | 'autonomous';
  agent_mode: 'automatic' | 'manual';
  selected_agent_id?: string;
  preserve_context?: boolean;
}

interface Session {
  session_id: string;
  interaction_mode: string;
  agent_mode: string;
  selected_agent?: any;
  created_at: string;
  status: string;
}

export function useModeManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (request: StartSessionRequest): Promise<Session> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ask-expert/modes/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const session = await response.json();
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processQuery = useCallback(async (sessionId: string, query: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ask-expert/modes/sessions/${sessionId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process query: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchMode = useCallback(async (sessionId: string, request: SwitchModeRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ask-expert/modes/sessions/${sessionId}/switch-mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to switch mode: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch mode';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/sessions/${sessionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get session: ${response.statusText}`);
      }

      const session = await response.json();
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session';
      setError(errorMessage);
      return null;
    }
  }, []);

  const getAvailableAgents = useCallback(async (sessionId: string, filters: any = {}): Promise<any[]> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/sessions/${sessionId}/agents/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`Failed to get agents: ${response.statusText}`);
      }

      const data = await response.json();
      return data.agents || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get agents';
      setError(errorMessage);
      return [];
    }
  }, []);

  const getModeRecommendation = useCallback(async (query: string, context?: Record<string, any>): Promise<any> => {
    try {
      const response = await fetch('/api/ask-expert/modes/recommend-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendation: ${response.statusText}`);
      }

      const recommendation = await response.json();
      return recommendation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendation';
      setError(errorMessage);
      return null;
    }
  }, []);

  const endSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/ask-expert/modes/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to end session: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    startSession,
    processQuery,
    switchMode,
    getSession,
    getAvailableAgents,
    getModeRecommendation,
    endSession,
    isLoading,
    error,
  };
}
