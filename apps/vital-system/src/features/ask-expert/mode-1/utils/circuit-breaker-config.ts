/**
 * Circuit Breaker Configuration Constants
 * 
 * Centralized configuration for all Mode 1 circuit breakers
 * Following enterprise best practices with sensible defaults
 */

export const CIRCUIT_BREAKER_CONFIG = {
  LLM: {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
    resetTimeout: 60000, // 60 seconds
    halfOpenMaxAttempts: 2,
    monitoringWindow: 60000, // 60 seconds
  },
  RAG: {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 10000, // 10 seconds
    resetTimeout: 30000, // 30 seconds
    halfOpenMaxAttempts: 1,
    monitoringWindow: 60000, // 60 seconds
  },
  TOOL: {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 15000, // 15 seconds
    resetTimeout: 30000, // 30 seconds
    halfOpenMaxAttempts: 1,
    monitoringWindow: 60000, // 60 seconds
  },
} as const;

export type CircuitBreakerService = keyof typeof CIRCUIT_BREAKER_CONFIG;

