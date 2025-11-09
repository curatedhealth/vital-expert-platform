/**
 * useStreamingMetrics Hook
 * 
 * Comprehensive performance monitoring for streaming operations.
 * Tracks TTFT, TPS, connection uptime, error rates, and more.
 * 
 * @example
 * const metrics = useStreamingMetrics();
 * 
 * metrics.recordFirstToken();
 * metrics.recordToken();
 * metrics.recordError('Connection timeout');
 * 
 * console.log(metrics.timeToFirstToken); // 234ms
 * console.log(metrics.avgTokensPerSecond); // 42.5
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface StreamingMetricsState {
  /** Time to first token in ms */
  timeToFirstToken: number | null;
  
  /** Average tokens per second */
  avgTokensPerSecond: number;
  
  /** Peak tokens per second */
  peakTokensPerSecond: number;
  
  /** Total streaming duration in ms */
  totalDuration: number;
  
  /** Connection uptime percentage */
  connectionUptime: number;
  
  /** Total errors */
  totalErrors: number;
  
  /** Error rate (errors per minute) */
  errorRate: number;
  
  /** Total sessions */
  totalSessions: number;
  
  /** Successful sessions */
  successfulSessions: number;
  
  /** Success rate percentage */
  successRate: number;
  
  /** Total tokens received */
  totalTokens: number;
  
  /** Average session duration in ms */
  avgSessionDuration: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useStreamingMetrics() {
  const [metrics, setMetrics] = useState<StreamingMetricsState>({
    timeToFirstToken: null,
    avgTokensPerSecond: 0,
    peakTokensPerSecond: 0,
    totalDuration: 0,
    connectionUptime: 100,
    totalErrors: 0,
    errorRate: 0,
    totalSessions: 0,
    successfulSessions: 0,
    successRate: 100,
    totalTokens: 0,
    avgSessionDuration: 0,
  });
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const sessionStartRef = useRef<number | null>(null);
  const firstTokenTimeRef = useRef<number | null>(null);
  const sessionTokensRef = useRef<number>(0);
  const sessionDurationsRef = useRef<number[]>([]);
  const tpsHistoryRef = useRef<number[]>([]);
  
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  
  const startSession = useCallback(() => {
    sessionStartRef.current = Date.now();
    firstTokenTimeRef.current = null;
    sessionTokensRef.current = 0;
    
    setMetrics(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
    }));
  }, []);
  
  const endSession = useCallback((success: boolean = true) => {
    if (!sessionStartRef.current) return;
    
    const duration = Date.now() - sessionStartRef.current;
    sessionDurationsRef.current.push(duration);
    
    const avgDuration = sessionDurationsRef.current.reduce((a, b) => a + b, 0) / 
                       sessionDurationsRef.current.length;
    
    setMetrics(prev => ({
      ...prev,
      totalDuration: prev.totalDuration + duration,
      avgSessionDuration: Math.round(avgDuration),
      successfulSessions: prev.successfulSessions + (success ? 1 : 0),
      successRate: ((prev.successfulSessions + (success ? 1 : 0)) / prev.totalSessions) * 100,
    }));
    
    sessionStartRef.current = null;
  }, []);
  
  // ============================================================================
  // TOKEN TRACKING
  // ============================================================================
  
  const recordFirstToken = useCallback(() => {
    if (!sessionStartRef.current || firstTokenTimeRef.current) return;
    
    const ttft = Date.now() - sessionStartRef.current;
    firstTokenTimeRef.current = ttft;
    
    setMetrics(prev => ({
      ...prev,
      timeToFirstToken: ttft,
    }));
  }, []);
  
  const recordToken = useCallback((tps?: number) => {
    sessionTokensRef.current++;
    
    setMetrics(prev => {
      const newTotalTokens = prev.totalTokens + 1;
      const duration = prev.totalDuration / 1000; // seconds
      const avgTps = duration > 0 ? newTotalTokens / duration : 0;
      
      // Track peak TPS
      let peakTps = prev.peakTokensPerSecond;
      if (tps && tps > peakTps) {
        peakTps = tps;
        tpsHistoryRef.current.push(tps);
      }
      
      return {
        ...prev,
        totalTokens: newTotalTokens,
        avgTokensPerSecond: Math.round(avgTps * 10) / 10,
        peakTokensPerSecond: peakTps,
      };
    });
  }, []);
  
  // ============================================================================
  // ERROR TRACKING
  // ============================================================================
  
  const recordError = useCallback((error?: string) => {
    setMetrics(prev => {
      const totalMinutes = prev.totalDuration / 60000;
      const errorRate = totalMinutes > 0 ? (prev.totalErrors + 1) / totalMinutes : 0;
      
      return {
        ...prev,
        totalErrors: prev.totalErrors + 1,
        errorRate: Math.round(errorRate * 10) / 10,
      };
    });
  }, []);
  
  // ============================================================================
  // CONNECTION TRACKING
  // ============================================================================
  
  const recordUptime = useCallback((uptimePercent: number) => {
    setMetrics(prev => ({
      ...prev,
      connectionUptime: Math.round(uptimePercent * 10) / 10,
    }));
  }, []);
  
  // ============================================================================
  // RESET
  // ============================================================================
  
  const reset = useCallback(() => {
    sessionStartRef.current = null;
    firstTokenTimeRef.current = null;
    sessionTokensRef.current = 0;
    sessionDurationsRef.current = [];
    tpsHistoryRef.current = [];
    
    setMetrics({
      timeToFirstToken: null,
      avgTokensPerSecond: 0,
      peakTokensPerSecond: 0,
      totalDuration: 0,
      connectionUptime: 100,
      totalErrors: 0,
      errorRate: 0,
      totalSessions: 0,
      successfulSessions: 0,
      successRate: 100,
      totalTokens: 0,
      avgSessionDuration: 0,
    });
  }, []);
  
  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // State
    ...metrics,
    
    // Session actions
    startSession,
    endSession,
    
    // Token actions
    recordFirstToken,
    recordToken,
    
    // Error actions
    recordError,
    
    // Connection actions
    recordUptime,
    
    // Utility
    reset,
  };
}

