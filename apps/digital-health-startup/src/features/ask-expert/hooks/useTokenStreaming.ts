/**
 * useTokenStreaming Hook
 * 
 * Manages token-by-token streaming with smooth animation and backpressure handling.
 * Enhances UX by displaying AI responses character-by-character instead of in chunks.
 * 
 * Features:
 * - Token buffering for smooth rendering
 * - Configurable delay between tokens
 * - Backpressure management (pause/resume)
 * - Animation timing with requestAnimationFrame
 * - Performance monitoring
 * 
 * @example
 * const tokenStreaming = useTokenStreaming({
 *   delayBetweenTokens: 30,
 *   enableAnimation: true,
 *   maxBufferSize: 50,
 * });
 * 
 * tokenStreaming.onToken((token) => {
 *   console.log('New token:', token);
 * });
 * 
 * tokenStreaming.addToken('Hello');
 * tokenStreaming.addToken(' ');
 * tokenStreaming.addToken('world');
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TokenStreamingConfig {
  /** Delay between token emissions in milliseconds (default: 30ms) */
  delayBetweenTokens?: number;
  
  /** Enable smooth animation (default: true) */
  enableAnimation?: boolean;
  
  /** Maximum buffer size before backpressure kicks in (default: 100) */
  maxBufferSize?: number;
  
  /** Enable backpressure management (default: true) */
  enableBackpressure?: boolean;
  
  /** Callback when buffer reaches capacity */
  onBufferFull?: () => void;
  
  /** Callback when buffer has space again */
  onBufferReady?: () => void;
}

export interface TokenStreamingState {
  /** Whether streaming is active */
  isStreaming: boolean;
  
  /** Whether streaming is paused */
  isPaused: boolean;
  
  /** Current buffer size */
  bufferSize: number;
  
  /** Whether buffer is full */
  isBufferFull: boolean;
  
  /** Total tokens emitted */
  tokensEmitted: number;
  
  /** Total tokens received */
  tokensReceived: number;
  
  /** Current tokens per second */
  tokensPerSecond: number;
  
  /** Time streaming started */
  startTime: number | null;
  
  /** Elapsed time in ms */
  elapsedTimeMs: number;
}

export type TokenCallback = (token: string) => void;

// ============================================================================
// HOOK
// ============================================================================

export function useTokenStreaming(config: TokenStreamingConfig = {}) {
  const {
    delayBetweenTokens = 30,
    enableAnimation = true,
    maxBufferSize = 100,
    enableBackpressure = true,
    onBufferFull,
    onBufferReady,
  } = config;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<TokenStreamingState>({
    isStreaming: false,
    isPaused: false,
    bufferSize: 0,
    isBufferFull: false,
    tokensEmitted: 0,
    tokensReceived: 0,
    tokensPerSecond: 0,
    startTime: null,
    elapsedTimeMs: 0,
  });
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const bufferRef = useRef<string[]>([]);
  const callbacksRef = useRef<TokenCallback[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastEmitTimeRef = useRef<number>(0);
  const tokensEmittedRef = useRef<number>(0);
  const tokensReceivedRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const isBufferFull = bufferRef.current.length >= maxBufferSize;
  
  // ============================================================================
  // TOKEN EMISSION (with animation)
  // ============================================================================
  
  const emitNextToken = useCallback(() => {
    if (bufferRef.current.length === 0) {
      // Buffer empty, stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      setState(prev => ({ ...prev, isStreaming: false }));
      return;
    }
    
    if (state.isPaused) {
      // Paused, schedule next check
      animationFrameRef.current = requestAnimationFrame(emitNextToken);
      return;
    }
    
    const now = performance.now();
    const timeSinceLastEmit = now - lastEmitTimeRef.current;
    
    if (timeSinceLastEmit >= delayBetweenTokens) {
      // Emit next token
      const token = bufferRef.current.shift()!;
      tokensEmittedRef.current++;
      lastEmitTimeRef.current = now;
      
      // Notify callbacks
      callbacksRef.current.forEach(callback => callback(token));
      
      // Update state
      const elapsedMs = startTimeRef.current ? now - startTimeRef.current : 0;
      const tps = elapsedMs > 0 ? (tokensEmittedRef.current / elapsedMs) * 1000 : 0;
      
      setState(prev => ({
        ...prev,
        bufferSize: bufferRef.current.length,
        tokensEmitted: tokensEmittedRef.current,
        tokensPerSecond: Math.round(tps * 10) / 10,
        elapsedTimeMs: Math.round(elapsedMs),
        isBufferFull: bufferRef.current.length >= maxBufferSize,
      }));
      
      // Check if buffer has space now
      if (enableBackpressure && bufferRef.current.length < maxBufferSize && state.isBufferFull) {
        onBufferReady?.();
      }
    }
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(emitNextToken);
  }, [delayBetweenTokens, enableBackpressure, maxBufferSize, state.isPaused, state.isBufferFull, onBufferReady]);
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Add a token to the buffer
   */
  const addToken = useCallback((token: string) => {
    if (!enableAnimation) {
      // No animation, emit immediately
      tokensEmittedRef.current++;
      tokensReceivedRef.current++;
      callbacksRef.current.forEach(callback => callback(token));
      
      setState(prev => ({
        ...prev,
        tokensEmitted: tokensEmittedRef.current,
        tokensReceived: tokensReceivedRef.current,
      }));
      return;
    }
    
    // Add to buffer
    bufferRef.current.push(token);
    tokensReceivedRef.current++;
    
    const newBufferSize = bufferRef.current.length;
    const newIsBufferFull = newBufferSize >= maxBufferSize;
    
    setState(prev => ({
      ...prev,
      bufferSize: newBufferSize,
      tokensReceived: tokensReceivedRef.current,
      isBufferFull: newIsBufferFull,
    }));
    
    // Check if buffer is full
    if (enableBackpressure && newIsBufferFull && !state.isBufferFull) {
      onBufferFull?.();
    }
    
    // Start animation if not running
    if (!animationFrameRef.current && !state.isPaused) {
      animationFrameRef.current = requestAnimationFrame(emitNextToken);
    }
  }, [enableAnimation, maxBufferSize, enableBackpressure, state.isPaused, state.isBufferFull, onBufferFull, emitNextToken]);
  
  /**
   * Add multiple tokens at once
   */
  const addTokens = useCallback((tokens: string[]) => {
    tokens.forEach(token => addToken(token));
  }, [addToken]);
  
  /**
   * Start streaming
   */
  const start = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    
    setState(prev => ({ ...prev, isStreaming: true, isPaused: false, startTime: startTimeRef.current }));
    
    if (enableAnimation && bufferRef.current.length > 0 && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(emitNextToken);
    }
  }, [enableAnimation, emitNextToken]);
  
  /**
   * Pause streaming
   */
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);
  
  /**
   * Resume streaming
   */
  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    
    if (enableAnimation && bufferRef.current.length > 0 && !animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(emitNextToken);
    }
  }, [enableAnimation, emitNextToken]);
  
  /**
   * Stop streaming and clear buffer
   */
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    bufferRef.current = [];
    
    setState({
      isStreaming: false,
      isPaused: false,
      bufferSize: 0,
      isBufferFull: false,
      tokensEmitted: 0,
      tokensReceived: 0,
      tokensPerSecond: 0,
      startTime: null,
      elapsedTimeMs: 0,
    });
    
    tokensEmittedRef.current = 0;
    tokensReceivedRef.current = 0;
    startTimeRef.current = null;
  }, []);
  
  /**
   * Reset metrics but keep streaming
   */
  const reset = useCallback(() => {
    tokensEmittedRef.current = 0;
    tokensReceivedRef.current = 0;
    startTimeRef.current = performance.now();
    
    setState(prev => ({
      ...prev,
      tokensEmitted: 0,
      tokensReceived: 0,
      startTime: startTimeRef.current,
      elapsedTimeMs: 0,
    }));
  }, []);
  
  /**
   * Register a token callback
   */
  const onToken = useCallback((callback: TokenCallback) => {
    callbacksRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      callbacksRef.current = callbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);
  
  /**
   * Clear the buffer without stopping
   */
  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
    setState(prev => ({ ...prev, bufferSize: 0, isBufferFull: false }));
  }, []);
  
  /**
   * Flush buffer immediately (emit all tokens without delay)
   */
  const flush = useCallback(() => {
    const tokens = [...bufferRef.current];
    bufferRef.current = [];
    
    tokens.forEach(token => {
      tokensEmittedRef.current++;
      callbacksRef.current.forEach(callback => callback(token));
    });
    
    setState(prev => ({
      ...prev,
      bufferSize: 0,
      isBufferFull: false,
      tokensEmitted: tokensEmittedRef.current,
    }));
  }, []);
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // State
    ...state,
    
    // Actions
    addToken,
    addTokens,
    start,
    pause,
    resume,
    stop,
    reset,
    clearBuffer,
    flush,
    
    // Event handlers
    onToken,
  };
}

