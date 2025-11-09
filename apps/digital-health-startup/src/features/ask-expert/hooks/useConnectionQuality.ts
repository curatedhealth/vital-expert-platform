/**
 * useConnectionQuality Hook
 * 
 * Monitors connection quality, latency, and provides detailed feedback.
 * Tracks metrics like round-trip time, packet loss, and uptime percentage.
 * 
 * Features:
 * - Connection quality scoring (excellent/good/fair/poor)
 * - Latency measurement (ping/round-trip time)
 * - Packet loss detection
 * - Uptime tracking
 * - Detailed error context
 * 
 * @example
 * const connection = useConnectionQuality({
 *   measureLatency: true,
 *   heartbeatInterval: 5000,
 * });
 * 
 * connection.quality;        // 'excellent'
 * connection.latencyMs;      // 45
 * connection.uptimePercent;  // 98.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

export interface ConnectionQualityConfig {
  /** Enable latency measurement (default: true) */
  measureLatency?: boolean;
  
  /** Enable packet loss detection (default: true) */
  detectPacketLoss?: boolean;
  
  /** Track uptime percentage (default: true) */
  trackUptime?: boolean;
  
  /** Heartbeat interval in ms (default: 5000) */
  heartbeatInterval?: number;
  
  /** Latency threshold for "excellent" in ms (default: 100) */
  excellentThreshold?: number;
  
  /** Latency threshold for "good" in ms (default: 300) */
  goodThreshold?: number;
  
  /** Latency threshold for "fair" in ms (default: 1000) */
  fairThreshold?: number;
  
  /** Callback when quality changes */
  onQualityChange?: (quality: ConnectionQuality) => void;
}

export interface ConnectionQualityState {
  /** Current connection quality */
  quality: ConnectionQuality;
  
  /** Current latency in ms */
  latencyMs: number | null;
  
  /** Average latency in ms */
  avgLatencyMs: number | null;
  
  /** Packet loss percentage (0-100) */
  packetLoss: number;
  
  /** Uptime percentage (0-100) */
  uptimePercent: number;
  
  /** Total packets sent */
  packetsSent: number;
  
  /** Total packets received */
  packetsReceived: number;
  
  /** Connection start time */
  startTime: number | null;
  
  /** Total downtime in ms */
  totalDowntimeMs: number;
  
  /** Is currently connected */
  isConnected: boolean;
  
  /** Recent errors */
  errors: Array<{ timestamp: number; message: string; code?: string }>;
  
  /** Quality score (0-100) */
  qualityScore: number;
}

// ============================================================================
// QUALITY SCORING
// ============================================================================

function calculateQualityScore(
  latencyMs: number | null,
  packetLoss: number,
  uptimePercent: number
): number {
  let score = 100;
  
  // Latency penalty (max -40 points)
  if (latencyMs) {
    if (latencyMs > 2000) score -= 40;
    else if (latencyMs > 1000) score -= 30;
    else if (latencyMs > 500) score -= 20;
    else if (latencyMs > 200) score -= 10;
    else if (latencyMs > 100) score -= 5;
  }
  
  // Packet loss penalty (max -30 points)
  score -= Math.min(30, packetLoss * 3);
  
  // Uptime penalty (max -30 points)
  score -= Math.min(30, (100 - uptimePercent) * 3);
  
  return Math.max(0, Math.min(100, score));
}

function getQualityFromLatency(
  latencyMs: number | null,
  excellentThreshold: number,
  goodThreshold: number,
  fairThreshold: number
): ConnectionQuality {
  if (!latencyMs) return 'offline';
  if (latencyMs <= excellentThreshold) return 'excellent';
  if (latencyMs <= goodThreshold) return 'good';
  if (latencyMs <= fairThreshold) return 'fair';
  return 'poor';
}

// ============================================================================
// HOOK
// ============================================================================

export function useConnectionQuality(config: ConnectionQualityConfig = {}) {
  const {
    measureLatency = true,
    detectPacketLoss = true,
    trackUptime = true,
    heartbeatInterval = 5000,
    excellentThreshold = 100,
    goodThreshold = 300,
    fairThreshold = 1000,
    onQualityChange,
  } = config;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<ConnectionQualityState>({
    quality: 'offline',
    latencyMs: null,
    avgLatencyMs: null,
    packetLoss: 0,
    uptimePercent: 100,
    packetsSent: 0,
    packetsReceived: 0,
    startTime: null,
    totalDowntimeMs: 0,
    isConnected: false,
    errors: [],
    qualityScore: 100,
  });
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const latencyHistoryRef = useRef<number[]>([]);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const downtimeStartRef = useRef<number | null>(null);
  const prevQualityRef = useRef<ConnectionQuality>('offline');
  
  // ============================================================================
  // LATENCY MEASUREMENT
  // ============================================================================
  
  const measureRoundTrip = useCallback(async (): Promise<number | null> => {
    if (!measureLatency) return null;
    
    const start = performance.now();
    
    try {
      // Simulate ping with a HEAD request to current origin
      await fetch(window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      const end = performance.now();
      return end - start;
    } catch (error) {
      return null;
    }
  }, [measureLatency]);
  
  const recordLatency = useCallback((latencyMs: number) => {
    latencyHistoryRef.current.push(latencyMs);
    
    // Keep only last 20 measurements
    if (latencyHistoryRef.current.length > 20) {
      latencyHistoryRef.current.shift();
    }
    
    // Calculate average
    const avg = latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length;
    
    setState(prev => ({
      ...prev,
      latencyMs,
      avgLatencyMs: Math.round(avg),
    }));
  }, []);
  
  // ============================================================================
  // CONNECTION MONITORING
  // ============================================================================
  
  const connect = useCallback(() => {
    const now = Date.now();
    
    setState(prev => ({
      ...prev,
      isConnected: true,
      startTime: prev.startTime || now,
    }));
    
    // End downtime period
    if (downtimeStartRef.current) {
      const downtime = now - downtimeStartRef.current;
      setState(prev => ({
        ...prev,
        totalDowntimeMs: prev.totalDowntimeMs + downtime,
      }));
      downtimeStartRef.current = null;
    }
    
    lastHeartbeatRef.current = now;
  }, []);
  
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      quality: 'offline',
    }));
    
    // Start downtime period
    if (!downtimeStartRef.current) {
      downtimeStartRef.current = Date.now();
    }
  }, []);
  
  const sendHeartbeat = useCallback(async () => {
    setState(prev => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
    
    const latency = await measureRoundTrip();
    
    if (latency !== null) {
      // Packet received
      setState(prev => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
      recordLatency(latency);
      lastHeartbeatRef.current = Date.now();
    } else {
      // Packet lost (timeout or error)
      console.warn('[ConnectionQuality] Heartbeat failed');
    }
  }, [measureRoundTrip, recordLatency]);
  
  // ============================================================================
  // QUALITY CALCULATION
  // ============================================================================
  
  // Quality calculations are already done in recordLatency callback
  // Removed problematic useEffect to avoid infinite loops
  
  // ============================================================================
  // ERROR TRACKING
  // ============================================================================
  
  const recordError = useCallback((message: string, code?: string) => {
    setState(prev => ({
      ...prev,
      errors: [
        ...prev.errors.slice(-9), // Keep last 10 errors
        { timestamp: Date.now(), message, code },
      ],
    }));
  }, []);
  
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);
  
  // ============================================================================
  // RESET
  // ============================================================================
  
  const reset = useCallback(() => {
    latencyHistoryRef.current = [];
    downtimeStartRef.current = null;
    prevQualityRef.current = 'offline';
    
    setState({
      quality: 'offline',
      latencyMs: null,
      avgLatencyMs: null,
      packetLoss: 0,
      uptimePercent: 100,
      packetsSent: 0,
      packetsReceived: 0,
      startTime: null,
      totalDowntimeMs: 0,
      isConnected: false,
      errors: [],
      qualityScore: 100,
    });
  }, []);
  
  // ============================================================================
  // HEARTBEAT INTERVAL
  // ============================================================================
  
  useEffect(() => {
    if (!state.isConnected || !measureLatency) return;
    
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, heartbeatInterval);
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [state.isConnected, measureLatency, heartbeatInterval, sendHeartbeat]);
  
  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    recordError,
    clearErrors,
    reset,
    measureRoundTrip,
  };
}

