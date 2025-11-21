/**
 * Distributed Tracing
 * 
 * OpenTelemetry-compatible tracing for request correlation
 * Currently provides correlation IDs and basic spans
 * Full OpenTelemetry integration can be added later
 */

import { createLogger } from './structured-logger';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  tags?: Record<string, string | number | boolean>;
}

class TracingService {
  private logger;
  private activeSpans: Map<string, TraceContext> = new Map();

  constructor() {
    this.logger = createLogger();
  }

  /**
   * Generate trace ID
   */
  generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate span ID
   */
  generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Start a new span
   */
  startSpan(
    operation: string,
    parentSpanId?: string,
    tags?: Record<string, string | number | boolean>
  ): string {
    const traceId = parentSpanId
      ? this.activeSpans.get(parentSpanId)?.traceId || this.generateTraceId()
      : this.generateTraceId();
    
    const spanId = this.generateSpanId();
    
    const context: TraceContext = {
      traceId,
      spanId,
      parentSpanId,
      operation,
      startTime: Date.now(),
      tags,
    };

    this.activeSpans.set(spanId, context);

    this.logger.info('trace_span_started', {
      traceId,
      spanId,
      operation,
      parentSpanId,
      tags,
    });

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string, success: boolean = true, error?: Error): void {
    const context = this.activeSpans.get(spanId);
    if (!context) {
      this.logger.warn('trace_span_not_found', { spanId });
      return;
    }

    const duration = Date.now() - context.startTime;
    
    this.logger.infoWithMetrics('trace_span_ended', duration, {
      traceId: context.traceId,
      spanId,
      operation: context.operation,
      success,
      error: error ? error.message : undefined,
      tags: context.tags,
    });

    this.activeSpans.delete(spanId);
  }

  /**
   * Get current trace context
   */
  getContext(spanId: string): TraceContext | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * Add tags to a span
   */
  addTags(spanId: string, tags: Record<string, string | number | boolean>): void {
    const context = this.activeSpans.get(spanId);
    if (!context) {
      return;
    }

    context.tags = {
      ...context.tags,
      ...tags,
    };

    this.activeSpans.set(spanId, context);
  }

  /**
   * Get trace statistics
   */
  getStats() {
    return {
      activeSpans: this.activeSpans.size,
      spans: Array.from(this.activeSpans.values()).map(ctx => ({
        traceId: ctx.traceId,
        spanId: ctx.spanId,
        operation: ctx.operation,
        duration: Date.now() - ctx.startTime,
      })),
    };
  }
}

// Export singleton instance
let tracingInstance: TracingService | null = null;

export function getTracingService(): TracingService {
  if (!tracingInstance) {
    tracingInstance = new TracingService();
  }
  return tracingInstance;
}

/**
 * Decorator for automatic span creation
 */
export function trace(operation: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const tracing = getTracingService();

    descriptor.value = async function (...args: any[]) {
      const spanId = tracing.startSpan(`${target.constructor.name}.${propertyKey}`);
      
      try {
        const result = await originalMethod.apply(this, args);
        tracing.endSpan(spanId, true);
        return result;
      } catch (error) {
        tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };

    return descriptor;
  };
}

