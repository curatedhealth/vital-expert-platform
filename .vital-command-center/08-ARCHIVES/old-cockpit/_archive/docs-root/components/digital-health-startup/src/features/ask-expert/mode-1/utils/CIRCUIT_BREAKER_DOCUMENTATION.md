# Circuit Breaker Configuration Documentation

## Overview

Circuit breakers are implemented for Mode 1 to prevent cascading failures by monitoring service health and temporarily stopping requests when services are down.

## State Transitions

1. **CLOSED** → **OPEN**: When failure threshold is exceeded
2. **OPEN** → **HALF_OPEN**: After reset timeout period
3. **HALF_OPEN** → **CLOSED**: After success threshold is met
4. **HALF_OPEN** → **OPEN**: If failures occur during recovery testing

## Configuration

### LLM Circuit Breaker
- **Failure Threshold**: 5 failures
- **Success Threshold**: 2 successes (to close from HALF_OPEN)
- **Reset Timeout**: 60 seconds
- **Monitoring Window**: 60 seconds

### RAG Circuit Breaker
- **Failure Threshold**: 3 failures
- **Success Threshold**: 1 success
- **Reset Timeout**: 30 seconds
- **Monitoring Window**: 60 seconds

### Tool Circuit Breaker
- **Failure Threshold**: 3 failures
- **Success Threshold**: 1 success
- **Reset Timeout**: 30 seconds
- **Monitoring Window**: 60 seconds

## Usage

All LLM, RAG, and Tool calls are automatically wrapped with circuit breakers:

```typescript
import { llmCircuitBreaker, ragCircuitBreaker, toolCircuitBreaker } from './circuit-breaker';

// LLM call with circuit breaker
const result = await llmCircuitBreaker.execute(
  async () => {
    return await llm.invoke(messages);
  },
  async () => {
    // Fallback when circuit is OPEN
    return fallbackResponse();
  }
);
```

## Metrics Tracking

Circuit breaker state changes are automatically tracked via the Mode1MetricsService:

- State transitions (CLOSED → OPEN → HALF_OPEN → CLOSED)
- Failure counts
- Timestamps of state changes
- Reasons for state changes

## Fallback Mechanisms

When a circuit breaker is OPEN:
- **LLM**: Returns empty stream or error message
- **RAG**: Returns null/empty context
- **Tools**: Returns error result indicating tool unavailable

## Manual Reset

Circuit breakers can be manually reset:

```typescript
llmCircuitBreaker.reset();
```

## Monitoring

Circuit breaker state changes are logged and can be monitored via:
- Console logs with structured format
- Mode1MetricsService for programmatic access
- Future integration with monitoring services (DataDog, New Relic, etc.)

