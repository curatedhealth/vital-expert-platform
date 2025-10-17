import { useState, useEffect, useCallback, useRef } from 'react';
import { AutonomousExecutionResult } from '@/features/autonomous/autonomous-state';

export interface StreamEvent {
  type: 'status' | 'goal' | 'tasks' | 'task_started' | 'task_completed' | 'task_failed' | 
        'evidence' | 'memory' | 'progress' | 'safety' | 'complete' | 'error';
  data?: any;
  message?: string;
  timestamp: string;
}

export interface AutonomousStreamOptions {
  query: string;
  mode?: 'manual' | 'automatic';
  agentId?: string;
  selectedAgent?: any;
  selectedTools?: string[];
  chatHistory?: any[];
  maxIterations?: number;
  maxCost?: number;
  supervisionLevel?: 'low' | 'medium' | 'high';
  userId?: string;
  sessionId?: string;
  enableRealTimeUpdates?: boolean;
}

export interface AutonomousStreamState {
  isConnected: boolean;
  isExecuting: boolean;
  events: StreamEvent[];
  currentGoal: any;
  currentTasks: any[];
  completedTasks: any[];
  evidence: any[];
  memory: any;
  progress: any;
  result: AutonomousExecutionResult | null;
  error: string | null;
  metrics: {
    totalEvents: number;
    tasksCompleted: number;
    tasksFailed: number;
    evidenceCollected: number;
    memoryUpdates: number;
  };
}

export function useAutonomousStream() {
  const [state, setState] = useState<AutonomousStreamState>({
    isConnected: false,
    isExecuting: false,
    events: [],
    currentGoal: null,
    currentTasks: [],
    completedTasks: [],
    evidence: [],
    memory: null,
    progress: null,
    result: null,
    error: null,
    metrics: {
      totalEvents: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      evidenceCollected: 0,
      memoryUpdates: 0
    }
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const connect = useCallback(async (options: AutonomousStreamOptions) => {
    try {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Reset state
      setState(prev => ({
        ...prev,
        isConnected: false,
        isExecuting: true,
        events: [],
        currentGoal: null,
        currentTasks: [],
        completedTasks: [],
        evidence: [],
        memory: null,
        progress: null,
        result: null,
        error: null,
        metrics: {
          totalEvents: 0,
          tasksCompleted: 0,
          tasksFailed: 0,
          evidenceCollected: 0,
          memoryUpdates: 0
        }
      }));

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Start autonomous execution with streaming
      const response = await fetch('/api/chat/autonomous/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create EventSource for Server-Sent Events
      const eventSource = new EventSource('/api/chat/autonomous/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true }));
      };

      eventSource.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data);
          
          setState(prev => {
            const newEvents = [...prev.events, streamEvent];
            const newMetrics = { ...prev.metrics, totalEvents: prev.metrics.totalEvents + 1 };

            // Update state based on event type
            switch (streamEvent.type) {
              case 'goal':
                return {
                  ...prev,
                  events: newEvents,
                  currentGoal: streamEvent.data,
                  metrics: newMetrics
                };

              case 'tasks':
                return {
                  ...prev,
                  events: newEvents,
                  currentTasks: streamEvent.data || [],
                  metrics: newMetrics
                };

              case 'task_completed':
                return {
                  ...prev,
                  events: newEvents,
                  completedTasks: [...prev.completedTasks, streamEvent.data],
                  metrics: {
                    ...newMetrics,
                    tasksCompleted: prev.metrics.tasksCompleted + 1
                  }
                };

              case 'task_failed':
                return {
                  ...prev,
                  events: newEvents,
                  metrics: {
                    ...newMetrics,
                    tasksFailed: prev.metrics.tasksFailed + 1
                  }
                };

              case 'evidence':
                return {
                  ...prev,
                  events: newEvents,
                  evidence: [...prev.evidence, streamEvent.data],
                  metrics: {
                    ...newMetrics,
                    evidenceCollected: prev.metrics.evidenceCollected + 1
                  }
                };

              case 'memory':
                return {
                  ...prev,
                  events: newEvents,
                  memory: streamEvent.data,
                  metrics: {
                    ...newMetrics,
                    memoryUpdates: prev.metrics.memoryUpdates + 1
                  }
                };

              case 'progress':
                return {
                  ...prev,
                  events: newEvents,
                  progress: streamEvent.data,
                  metrics: newMetrics
                };

              case 'complete':
                return {
                  ...prev,
                  events: newEvents,
                  isExecuting: false,
                  result: streamEvent.data,
                  metrics: newMetrics
                };

              case 'error':
                return {
                  ...prev,
                  events: newEvents,
                  isExecuting: false,
                  error: streamEvent.error || streamEvent.message || 'Unknown error',
                  metrics: newMetrics
                };

              default:
                return {
                  ...prev,
                  events: newEvents,
                  metrics: newMetrics
                };
            }
          });

        } catch (error) {
          console.error('❌ [Autonomous Stream] Error parsing event:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to parse stream event',
            isExecuting: false
          }));
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ [Autonomous Stream] EventSource error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isExecuting: false,
          error: 'Connection lost'
        }));
      };

    } catch (error) {
      console.error('❌ [Autonomous Stream] Connection error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        isExecuting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isExecuting: false
    }));
  }, []);

  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: [],
      currentGoal: null,
      currentTasks: [],
      completedTasks: [],
      evidence: [],
      memory: null,
      progress: null,
      result: null,
      error: null,
      metrics: {
        totalEvents: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        evidenceCollected: 0,
        memoryUpdates: 0
      }
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    clearEvents
  };
}
