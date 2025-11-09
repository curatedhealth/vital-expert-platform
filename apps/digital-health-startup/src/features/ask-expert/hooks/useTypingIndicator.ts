/**
 * useTypingIndicator & useTimeEstimation Hooks
 * 
 * Manages typing indicators and time estimation for streaming responses
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPING INDICATOR HOOK
// ============================================================================

export interface TypingIndicatorConfig {
  /** Show typing indicator (default: true) */
  enabled?: boolean;
  
  /** Typing message (default: "AI is typing...") */
  message?: string;
  
  /** Animation style */
  animation?: 'dots' | 'pulse' | 'wave';
}

export function useTypingIndicator(config: TypingIndicatorConfig = {}) {
  const {
    enabled = true,
    message = 'AI is typing...',
    animation = 'dots',
  } = config;
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState(message);
  
  const startTyping = useCallback((customMessage?: string) => {
    setIsTyping(true);
    if (customMessage) setTypingMessage(customMessage);
  }, []);
  
  const stopTyping = useCallback(() => {
    setIsTyping(false);
  }, []);
  
  return {
    isTyping: enabled && isTyping,
    typingMessage,
    animation,
    startTyping,
    stopTyping,
  };
}

// ============================================================================
// TIME ESTIMATION HOOK
// ============================================================================

export interface TimeEstimationConfig {
  /** Enable estimation (default: true) */
  enabled?: boolean;
  
  /** Historical data for better estimates */
  historicalAvgTokensPerSec?: number;
}

export interface TimeEstimate {
  /** Estimated seconds remaining */
  secondsRemaining: number | null;
  
  /** Formatted time string */
  formatted: string;
  
  /** Confidence level (0-100) */
  confidence: number;
}

export function useTimeEstimation(config: TimeEstimationConfig = {}) {
  const {
    enabled = true,
    historicalAvgTokensPerSec = 40,
  } = config;
  
  const [estimate, setEstimate] = useState<TimeEstimate>({
    secondsRemaining: null,
    formatted: '',
    confidence: 0,
  });
  
  const calculateEstimate = useCallback((
    tokensReceived: number,
    expectedTotal: number,
    currentTps: number
  ): TimeEstimate => {
    if (!enabled || expectedTotal <= 0 || tokensReceived >= expectedTotal) {
      return { secondsRemaining: null, formatted: '', confidence: 0 };
    }
    
    const remaining = expectedTotal - tokensReceived;
    const tps = currentTps > 0 ? currentTps : historicalAvgTokensPerSec;
    const seconds = Math.ceil(remaining / tps);
    
    // Confidence based on data points
    const confidence = Math.min(100, (tokensReceived / expectedTotal) * 100);
    
    // Format
    let formatted = '';
    if (seconds < 60) {
      formatted = `~${seconds}s`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      formatted = secs > 0 ? `~${mins}m ${secs}s` : `~${mins}m`;
    }
    
    return {
      secondsRemaining: seconds,
      formatted,
      confidence: Math.round(confidence),
    };
  }, [enabled, historicalAvgTokensPerSec]);
  
  const updateEstimate = useCallback((
    tokensReceived: number,
    expectedTotal: number,
    currentTps: number
  ) => {
    const newEstimate = calculateEstimate(tokensReceived, expectedTotal, currentTps);
    setEstimate(newEstimate);
  }, [calculateEstimate]);
  
  const reset = useCallback(() => {
    setEstimate({ secondsRemaining: null, formatted: '', confidence: 0 });
  }, []);
  
  return {
    estimate,
    updateEstimate,
    reset,
  };
}

