import { useState, useEffect } from 'react';
import { ControlRequest, ControlResponse } from '@/types/expert-consultation';

interface UseExecutionControlOptions {
  sessionId: string;
  onStatusChange?: (status: string) => void;
}

export function useExecutionControl({ sessionId, onStatusChange }: UseExecutionControlOptions) {
  const [status, setStatus] = useState<string>('unknown');
  const [canPause, setCanPause] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [canStop, setCanStop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch execution status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/ask-expert/control/${sessionId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      
      const data = await response.json();
      setStatus(data.status);
      setCanPause(data.can_pause);
      setCanResume(data.can_resume);
      setCanStop(data.can_stop);
      setError(null);
      
      onStatusChange?.(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  // Pause execution
  const pause = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ask-expert/control/${sessionId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to pause execution');
      }
      
      const data: ControlResponse = await response.json();
      setStatus('paused');
      setCanPause(false);
      setCanResume(true);
      setCanStop(true);
      
      onStatusChange?.('paused');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause execution');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Resume execution
  const resume = async (guidance?: Record<string, any>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestBody: ControlRequest = {
        action: 'resume',
        guidance
      };
      
      const response = await fetch(`/api/ask-expert/control/${sessionId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to resume execution');
      }
      
      const data: ControlResponse = await response.json();
      setStatus('running');
      setCanPause(true);
      setCanResume(false);
      setCanStop(true);
      
      onStatusChange?.('running');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume execution');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Stop execution
  const stop = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ask-expert/control/${sessionId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop execution');
      }
      
      const data: ControlResponse = await response.json();
      setStatus('stopped');
      setCanPause(false);
      setCanResume(false);
      setCanStop(false);
      
      onStatusChange?.('stopped');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop execution');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Request intervention
  const requestIntervention = async (intervention: Record<string, any>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const requestBody: ControlRequest = {
        action: 'intervene',
        guidance: intervention
      };
      
      const response = await fetch(`/api/ask-expert/control/${sessionId}/intervene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to request intervention');
      }
      
      const data: ControlResponse = await response.json();
      // Status will be updated by the stream
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request intervention');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Poll status periodically
  useEffect(() => {
    if (!sessionId) return;
    
    // Initial fetch
    fetchStatus();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  return {
    status,
    canPause,
    canResume,
    canStop,
    isLoading,
    error,
    pause,
    resume,
    stop,
    requestIntervention,
    refreshStatus: fetchStatus
  };
}
