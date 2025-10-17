'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chat-store';

interface AutonomousTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  tools: string[];
  evidence?: string[];
  error?: string;
}

interface AutonomousState {
  isAutonomousMode: boolean;
  isRunning: boolean;
  goal: string;
  tasks: AutonomousTask[];
  currentTask?: AutonomousTask;
  progress: {
    completed: number;
    total: number;
    successRate: number;
  };
  metrics: {
    iterations: number;
    cost: number;
    duration: number;
  };
  evidence: {
    count: number;
    verified: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  settings: {
    maxIterations: number;
    maxCost: number;
    supervisionLevel: 'none' | 'low' | 'medium' | 'high';
  };
}

const initialState: AutonomousState = {
  isAutonomousMode: false,
  isRunning: false,
  goal: '',
  tasks: [],
  progress: {
    completed: 0,
    total: 0,
    successRate: 0
  },
  metrics: {
    iterations: 0,
    cost: 0,
    duration: 0
  },
  evidence: {
    count: 0,
    verified: 0,
    quality: 'fair'
  },
  settings: {
    maxIterations: 10,
    maxCost: 25,
    supervisionLevel: 'medium'
  }
};

export function useAutonomousMode() {
  const [state, setState] = useState<AutonomousState>(initialState);
  const { sendMessage, selectedAgent, user } = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // Toggle autonomous mode
  const toggleAutonomousMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isAutonomousMode: enabled,
      isRunning: false,
      goal: '',
      tasks: [],
      progress: { completed: 0, total: 0, successRate: 0 },
      metrics: { iterations: 0, cost: 0, duration: 0 },
      evidence: { count: 0, verified: 0, quality: 'fair' }
    }));
  }, []);

  // Start autonomous execution
  const startAutonomousExecution = useCallback(async (goal: string) => {
    if (!selectedAgent || !user) {
      throw new Error('No agent selected or user not authenticated');
    }

    setState(prev => ({
      ...prev,
      isRunning: true,
      goal,
      tasks: [],
      progress: { completed: 0, total: 0, successRate: 0 },
      metrics: { iterations: 0, cost: 0, duration: 0 },
      evidence: { count: 0, verified: 0, quality: 'fair' }
    }));

    startTimeRef.current = Date.now();

    try {
      // Create abort controller for this execution
      abortControllerRef.current = new AbortController();

      // Send autonomous message
      const response = await fetch('/api/chat/autonomous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: goal,
          agent: {
            id: selectedAgent.id,
            display_name: selectedAgent.display_name || selectedAgent.name,
            business_function: selectedAgent.business_function || 'General',
            system_prompt: selectedAgent.system_prompt || '',
            model: selectedAgent.model || 'gpt-4',
            temperature: selectedAgent.temperature || 0.7,
            max_tokens: selectedAgent.max_tokens || 2000,
            capabilities: selectedAgent.capabilities || [],
            specializations: selectedAgent.knowledge_domains || []
          },
          userId: user.id,
          sessionId: `autonomous-${Date.now()}`,
          autonomousMode: true,
          settings: state.settings
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Autonomous execution failed: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'task_update') {
                setState(prev => ({
                  ...prev,
                  tasks: data.tasks || prev.tasks,
                  currentTask: data.currentTask,
                  progress: data.progress || prev.progress,
                  metrics: data.metrics || prev.metrics,
                  evidence: data.evidence || prev.evidence
                }));
              } else if (data.type === 'completion') {
                setState(prev => ({
                  ...prev,
                  isRunning: false,
                  progress: data.progress || prev.progress,
                  metrics: data.metrics || prev.metrics,
                  evidence: data.evidence || prev.evidence
                }));
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error occurred');
              }
            } catch (parseError) {
              console.warn('Failed to parse autonomous update:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Autonomous execution error:', error);
      setState(prev => ({
        ...prev,
        isRunning: false,
        tasks: prev.tasks.map(task => 
          task.status === 'in_progress' 
            ? { ...task, status: 'failed' as const, error: error.message }
            : task
        )
      }));
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [selectedAgent, user, state.settings]);

  // Pause autonomous execution
  const pauseAutonomousExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Stop autonomous execution
  const stopAutonomousExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      isRunning: false,
      tasks: prev.tasks.map(task => 
        task.status === 'in_progress' 
          ? { ...task, status: 'failed' as const, error: 'Stopped by user' }
          : task
      )
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AutonomousState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    toggleAutonomousMode,
    startAutonomousExecution,
    pauseAutonomousExecution,
    stopAutonomousExecution,
    updateSettings
  };
}
