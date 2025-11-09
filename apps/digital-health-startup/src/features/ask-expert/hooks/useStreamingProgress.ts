/**
 * useStreamingProgress Hook
 * 
 * Tracks streaming progress and provides detailed stage information.
 * Supports multiple stages: thinking, streaming, tools, rag, complete.
 * 
 * Features:
 * - Stage tracking (thinking → streaming → complete)
 * - Progress percentage calculation
 * - Time estimation
 * - Tokens per second tracking
 * - Elapsed time monitoring
 * 
 * @example
 * const progress = useStreamingProgress({
 *   estimateCompletionTime: true,
 *   trackTokensPerSecond: true,
 * });
 * 
 * progress.setStage('thinking');
 * progress.setStage('streaming');
 * progress.updateProgress(50);
 * progress.complete();
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type StreamingStage = 
  | 'idle'
  | 'thinking'      // AI is processing the query
  | 'streaming'     // Tokens are being streamed
  | 'tools'         // Tools are executing
  | 'rag'           // RAG sources being retrieved
  | 'complete'      // Streaming finished
  | 'error';        // Error occurred

export interface StreamingProgressConfig {
  /** Enable time estimation (default: true) */
  estimateCompletionTime?: boolean;
  
  /** Track tokens per second (default: true) */
  trackTokensPerSecond?: boolean;
  
  /** Show thinking stage (default: true) */
  showThinkingStage?: boolean;
  
  /** Expected total tokens (for better estimation) */
  expectedTotalTokens?: number;
  
  /** Callback when stage changes */
  onStageChange?: (stage: StreamingStage) => void;
  
  /** Callback when progress updates */
  onProgressUpdate?: (progress: number) => void;
  
  /** Callback when complete */
  onComplete?: () => void;
}

export interface StreamingProgressState {
  /** Current streaming stage */
  stage: StreamingStage;
  
  /** Progress percentage (0-100) */
  percentComplete: number;
  
  /** Estimated time remaining in ms */
  estimatedTimeMs: number | null;
  
  /** Current tokens per second */
  tokensPerSecond: number;
  
  /** Average tokens per second */
  avgTokensPerSecond: number;
  
  /** Total tokens received */
  totalTokens: number;
  
  /** Expected total tokens */
  expectedTokens: number | null;
  
  /** Time when streaming started */
  startTime: number | null;
  
  /** Elapsed time in ms */
  elapsedTimeMs: number;
  
  /** Is currently streaming */
  isActive: boolean;
  
  /** Stage durations */
  stageDurations: Record<StreamingStage, number>;
  
  /** Stage messages */
  stageMessage: string;
}

// ============================================================================
// STAGE MESSAGES
// ============================================================================

const STAGE_MESSAGES: Record<StreamingStage, string> = {
  idle: 'Ready',
  thinking: 'AI is thinking...',
  streaming: 'Streaming response...',
  tools: 'Executing tools...',
  rag: 'Retrieving sources...',
  complete: 'Complete',
  error: 'Error occurred',
};

// ============================================================================
// HOOK
// ============================================================================

export function useStreamingProgress(config: StreamingProgressConfig = {}) {
  const {
    estimateCompletionTime = true,
    trackTokensPerSecond = true,
    showThinkingStage = true,
    expectedTotalTokens,
    onStageChange,
    onProgressUpdate,
    onComplete,
  } = config;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<StreamingProgressState>({
    stage: 'idle',
    percentComplete: 0,
    estimatedTimeMs: null,
    tokensPerSecond: 0,
    avgTokensPerSecond: 0,
    totalTokens: 0,
    expectedTokens: expectedTotalTokens || null,
    startTime: null,
    elapsedTimeMs: 0,
    isActive: false,
    stageDurations: {
      idle: 0,
      thinking: 0,
      streaming: 0,
      tools: 0,
      rag: 0,
      complete: 0,
      error: 0,
    },
    stageMessage: STAGE_MESSAGES.idle,
  });
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const startTimeRef = useRef<number | null>(null);
  const stageStartTimeRef = useRef<number>(Date.now());
  const tokensHistoryRef = useRef<Array<{ timestamp: number; count: number }>>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const calculateTokensPerSecond = useCallback(() => {
    const now = Date.now();
    const recentWindow = 5000; // 5 second window
    
    // Filter to recent tokens
    tokensHistoryRef.current = tokensHistoryRef.current.filter(
      entry => now - entry.timestamp < recentWindow
    );
    
    if (tokensHistoryRef.current.length < 2) return 0;
    
    const oldest = tokensHistoryRef.current[0];
    const newest = tokensHistoryRef.current[tokensHistoryRef.current.length - 1];
    const duration = (newest.timestamp - oldest.timestamp) / 1000;
    const tokenCount = newest.count - oldest.count;
    
    return duration > 0 ? tokenCount / duration : 0;
  }, []);
  
  const calculateAverageTokensPerSecond = useCallback((totalTokens: number, elapsedMs: number) => {
    if (elapsedMs <= 0) return 0;
    return (totalTokens / elapsedMs) * 1000;
  }, []);
  
  const estimateTimeRemaining = useCallback((
    totalTokens: number,
    expectedTokens: number | null,
    avgTps: number
  ): number | null => {
    if (!estimateCompletionTime || !expectedTokens || avgTps <= 0) return null;
    
    const remainingTokens = Math.max(0, expectedTokens - totalTokens);
    return (remainingTokens / avgTps) * 1000; // ms
  }, [estimateCompletionTime]);
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Set the current stage
   */
  const setStage = useCallback((newStage: StreamingStage) => {
    const now = Date.now();
    const stageDuration = now - stageStartTimeRef.current;
    
    setState(prev => ({
      ...prev,
      stage: newStage,
      stageMessage: STAGE_MESSAGES[newStage],
      stageDurations: {
        ...prev.stageDurations,
        [prev.stage]: prev.stageDurations[prev.stage] + stageDuration,
      },
      isActive: newStage !== 'idle' && newStage !== 'complete' && newStage !== 'error',
    }));
    
    stageStartTimeRef.current = now;
    onStageChange?.(newStage);
  }, [onStageChange]);
  
  /**
   * Start streaming (thinking stage)
   */
  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    stageStartTimeRef.current = now;
    
    setState(prev => ({
      ...prev,
      stage: showThinkingStage ? 'thinking' : 'streaming',
      stageMessage: showThinkingStage ? STAGE_MESSAGES.thinking : STAGE_MESSAGES.streaming,
      startTime: now,
      isActive: true,
      percentComplete: 0,
      totalTokens: 0,
      elapsedTimeMs: 0,
    }));
    
    tokensHistoryRef.current = [];
    
    onStageChange?.(showThinkingStage ? 'thinking' : 'streaming');
  }, [showThinkingStage, onStageChange]);
  
  /**
   * Update progress (0-100)
   */
  const updateProgress = useCallback((progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    setState(prev => ({
      ...prev,
      percentComplete: clampedProgress,
    }));
    
    onProgressUpdate?.(clampedProgress);
  }, [onProgressUpdate]);
  
  /**
   * Record a token received
   */
  const recordToken = useCallback(() => {
    const now = Date.now();
    
    setState(prev => {
      const newTotalTokens = prev.totalTokens + 1;
      const elapsedMs = startTimeRef.current ? now - startTimeRef.current : 0;
      const avgTps = calculateAverageTokensPerSecond(newTotalTokens, elapsedMs);
      const tps = calculateTokensPerSecond();
      const estimatedMs = estimateTimeRemaining(newTotalTokens, prev.expectedTokens, avgTps);
      
      // Calculate progress if expected tokens is known
      let percentComplete = prev.percentComplete;
      if (prev.expectedTokens && prev.expectedTokens > 0) {
        percentComplete = Math.min(100, (newTotalTokens / prev.expectedTokens) * 100);
      }
      
      return {
        ...prev,
        totalTokens: newTotalTokens,
        tokensPerSecond: Math.round(tps * 10) / 10,
        avgTokensPerSecond: Math.round(avgTps * 10) / 10,
        estimatedTimeMs: estimatedMs,
        percentComplete,
        elapsedTimeMs: elapsedMs,
      };
    });
    
    // Add to history
    tokensHistoryRef.current.push({
      timestamp: now,
      count: state.totalTokens + 1,
    });
  }, [state.totalTokens, calculateTokensPerSecond, calculateAverageTokensPerSecond, estimateTimeRemaining]);
  
  /**
   * Record multiple tokens at once
   */
  const recordTokens = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      recordToken();
    }
  }, [recordToken]);
  
  /**
   * Set expected total tokens (improves time estimation)
   */
  const setExpectedTokens = useCallback((count: number) => {
    setState(prev => ({
      ...prev,
      expectedTokens: count,
    }));
  }, []);
  
  /**
   * Complete streaming
   */
  const complete = useCallback(() => {
    const now = Date.now();
    const stageDuration = now - stageStartTimeRef.current;
    
    setState(prev => ({
      ...prev,
      stage: 'complete',
      stageMessage: STAGE_MESSAGES.complete,
      percentComplete: 100,
      isActive: false,
      estimatedTimeMs: 0,
      stageDurations: {
        ...prev.stageDurations,
        [prev.stage]: prev.stageDurations[prev.stage] + stageDuration,
      },
    }));
    
    onComplete?.();
  }, [onComplete]);
  
  /**
   * Set error state
   */
  const setError = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      stage: 'error',
      stageMessage: message || STAGE_MESSAGES.error,
      isActive: false,
    }));
  }, []);
  
  /**
   * Reset to idle
   */
  const reset = useCallback(() => {
    startTimeRef.current = null;
    stageStartTimeRef.current = Date.now();
    tokensHistoryRef.current = [];
    
    setState({
      stage: 'idle',
      percentComplete: 0,
      estimatedTimeMs: null,
      tokensPerSecond: 0,
      avgTokensPerSecond: 0,
      totalTokens: 0,
      expectedTokens: expectedTotalTokens || null,
      startTime: null,
      elapsedTimeMs: 0,
      isActive: false,
      stageDurations: {
        idle: 0,
        thinking: 0,
        streaming: 0,
        tools: 0,
        rag: 0,
        complete: 0,
        error: 0,
      },
      stageMessage: STAGE_MESSAGES.idle,
    });
  }, [expectedTotalTokens]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Update elapsed time every second
  useEffect(() => {
    if (state.isActive && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedMs = now - startTimeRef.current!;
        
        setState(prev => ({
          ...prev,
          elapsedTimeMs: elapsedMs,
        }));
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.isActive]);
  
  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // State
    ...state,
    
    // Actions
    start,
    setStage,
    updateProgress,
    recordToken,
    recordTokens,
    setExpectedTokens,
    complete,
    setError,
    reset,
  };
}

