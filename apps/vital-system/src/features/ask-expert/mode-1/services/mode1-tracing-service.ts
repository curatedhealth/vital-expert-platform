/**
 * Mode 1 Tracing Service
 * 
 * Enhanced tracing service specifically for Mode 1 operations
 * Integrates with StructuredLogger for correlation
 * Provides distributed tracing with span hierarchy, duration tracking,
 * rich metadata, and export capability for monitoring systems
 */

import { StructuredLogger, LogLevel } from '@/lib/services/observability/structured-logger';
import { v4 as uuidv4 } from 'uuid';

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: string;
  errorCode?: string;
  tags?: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
  // Enhanced hierarchy tracking
  children?: string[]; // Child span IDs
  level?: number; // Depth in hierarchy (0 = root)
  service?: string; // Service name (e.g., 'mode1', 'rag', 'llm')
}

export interface SpanHierarchy {
  spanId: string;
  operation: string;
  duration: number;
  children: SpanHierarchy[];
  level: number;
}

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

/**
 * Mode 1 Tracing Service
 * Provides distributed tracing for Mode 1 operations
 * with enhanced hierarchy, metrics, and export capability
 */
export class Mode1TracingService {
  private logger: StructuredLogger;
  private activeSpans: Map<string, TraceSpan> = new Map();
  private completedSpans: Map<string, TraceSpan[]> = new Map(); // Trace ID -> completed spans
  private currentTraceId?: string;
  private rootSpanId?: string;
  private spanExporters: Array<(span: TraceSpan) => void> = [];

  constructor() {
    this.logger = new StructuredLogger({
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    });
  }

  /**
   * Register a span exporter for monitoring systems
   */
  registerExporter(exporter: (span: TraceSpan) => void): void {
    this.spanExporters.push(exporter);
  }

  /**
   * Remove a span exporter
   */
  unregisterExporter(exporter: (span: TraceSpan) => void): void {
    const index = this.spanExporters.indexOf(exporter);
    if (index > -1) {
      this.spanExporters.splice(index, 1);
    }
  }

  /**
   * Start a new trace (root span)
   */
  startTrace(
    operation: string,
    requestId?: string,
    tags?: Record<string, string | number | boolean>,
    metadata?: Record<string, unknown>
  ): SpanContext {
    const traceId = requestId || uuidv4();
    const spanId = uuidv4();
    
    this.currentTraceId = traceId;
    this.rootSpanId = spanId;

    // Detect service name from operation
    const service = this.detectServiceName(operation);

    const span: TraceSpan = {
      spanId,
      traceId,
      operation,
      startTime: Date.now(),
      tags: tags || {},
      metadata,
      children: [],
      level: 0,
      service,
    };

    this.activeSpans.set(spanId, span);

    // Set logger context with trace ID
    this.logger.setContext({ requestId: traceId });

    this.logger.debug('Trace started', {
      operation: 'trace_start',
      traceId,
      spanId,
      operationName: operation,
    });

    return { traceId, spanId };
  }

  /**
   * Start a new child span
   */
  startSpan(
    operation: string,
    parentSpanId?: string,
    tags?: Record<string, string | number | boolean>,
    metadata?: Record<string, unknown>
  ): string {
    const traceId = this.currentTraceId || uuidv4();
    const spanId = uuidv4();
    const effectiveParentId = parentSpanId || this.rootSpanId;

    // If no trace exists, start one
    if (!this.currentTraceId) {
      this.currentTraceId = traceId;
      this.rootSpanId = spanId;
    }

    // Calculate hierarchy level (root is 0)
    const parent = effectiveParentId ? this.activeSpans.get(effectiveParentId) : undefined;
    const level = parent ? (parent.level || 0) + 1 : 0;

    // Detect service name from operation
    const service = this.detectServiceName(operation);

    const span: TraceSpan = {
      spanId,
      traceId,
      parentSpanId: effectiveParentId,
      operation,
      startTime: Date.now(),
      tags: tags || {},
      metadata,
      children: [],
      level,
      service,
    };

    this.activeSpans.set(spanId, span);

    // Update parent's children list
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(spanId);
      this.activeSpans.set(effectiveParentId!, parent);
    }

    this.logger.debug('Span started', {
      operation: 'span_start',
      traceId,
      spanId,
      parentSpanId: effectiveParentId,
      operationName: operation,
      level,
      service,
      tags,
    });

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(
    spanId: string,
    success: boolean = true,
    error?: Error | string,
    additionalMetadata?: Record<string, unknown>
  ): TraceSpan | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      this.logger.warn('Span not found when ending', {
        operation: 'span_end_failed',
        spanId,
      });
      return undefined;
    }

    const endTime = Date.now();
    const duration = endTime - span.startTime;

    span.endTime = endTime;
    span.duration = duration;
    span.success = success;
    
    if (error) {
      span.error = error instanceof Error ? error.message : error;
    }

    if (additionalMetadata) {
      span.metadata = {
        ...span.metadata,
        ...additionalMetadata,
      };
    }

    // Log span completion
    this.logger.info('Span ended', {
      operation: 'span_end',
      traceId: span.traceId,
      spanId,
      parentSpanId: span.parentSpanId,
      operationName: span.operation,
      duration,
      success,
      error: span.error,
      tags: span.tags,
      metadata: span.metadata,
    });

    // Export span to registered exporters (non-blocking)
    this.exportSpan(span);

    // Store completed span
    if (!this.completedSpans.has(span.traceId)) {
      this.completedSpans.set(span.traceId, []);
    }
    this.completedSpans.get(span.traceId)!.push(span);

    // Remove from active spans
    this.activeSpans.delete(spanId);

    // If this was the root span, end the trace
    if (spanId === this.rootSpanId) {
      this.endTrace(span.traceId);
    }

    return span;
  }

  /**
   * Export span to registered exporters
   */
  private exportSpan(span: TraceSpan): void {
    for (const exporter of this.spanExporters) {
      try {
        exporter(span);
      } catch (error) {
        // Don't break tracing if exporter fails
        this.logger.warn('Span exporter failed', {
          operation: 'span_export_failed',
          spanId: span.spanId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Detect service name from operation
   */
  private detectServiceName(operation: string): string {
    const op = operation.toLowerCase();
    if (op.includes('rag') || op.includes('retrieve')) return 'rag';
    if (op.includes('llm') || op.includes('invoke') || op.includes('stream')) return 'llm';
    if (op.includes('tool')) return 'tools';
    if (op.includes('agent')) return 'agent';
    if (op.includes('message') || op.includes('build')) return 'message';
    return 'mode1';
  }

  /**
   * End the entire trace
   */
  endTrace(traceId: string): void {
    const remainingSpans = Array.from(this.activeSpans.values())
      .filter(s => s.traceId === traceId);

    if (remainingSpans.length > 0) {
      this.logger.warn('Trace ended with active spans', {
        operation: 'trace_end',
        traceId,
        activeSpans: remainingSpans.length,
      });
    }

    this.logger.info('Trace completed', {
      operation: 'trace_complete',
      traceId,
      totalSpans: this.activeSpans.size,
    });

    // Clear trace context
    if (this.currentTraceId === traceId) {
      this.currentTraceId = undefined;
      this.rootSpanId = undefined;
    }
  }

  /**
   * Add tags to an active span
   */
  addTags(spanId: string, tags: Record<string, string | number | boolean>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      return;
    }

    span.tags = {
      ...span.tags,
      ...tags,
    };

    this.activeSpans.set(spanId, span);
  }

  /**
   * Add metadata to an active span
   */
  addMetadata(spanId: string, metadata: Record<string, unknown>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      return;
    }

    span.metadata = {
      ...span.metadata,
      ...metadata,
    };

    this.activeSpans.set(spanId, span);
  }

  /**
   * Get current trace context
   */
  getTraceContext(): SpanContext | undefined {
    if (!this.currentTraceId || !this.rootSpanId) {
      return undefined;
    }

    return {
      traceId: this.currentTraceId,
      spanId: this.rootSpanId,
    };
  }

  /**
   * Get span by ID
   */
  getSpan(spanId: string): TraceSpan | undefined {
    return this.activeSpans.get(spanId);
  }

  /**
   * Get all spans for a trace (including completed spans)
   */
  getTraceSpans(traceId: string): TraceSpan[] {
    // Combine active and completed spans
    const active = Array.from(this.activeSpans.values())
      .filter(span => span.traceId === traceId);
    const completed = this.completedSpans.get(traceId) || [];
    
    // Merge and deduplicate by spanId
    const spanMap = new Map<string, TraceSpan>();
    for (const span of [...active, ...completed]) {
      spanMap.set(span.spanId, span);
    }
    
    return Array.from(spanMap.values());
  }

  /**
   * Get trace statistics with enhanced metrics
   */
  getTraceStats(traceId: string): {
    totalSpans: number;
    completedSpans: number;
    activeSpans: number;
    totalDuration: number;
    averageSpanDuration: number;
    longestSpan: { operation: string; duration: number } | null;
    spansByService: Record<string, { count: number; totalDuration: number }>;
    spans: Array<{
      operation: string;
      duration: number;
      success?: boolean;
      level: number;
      service?: string;
    }>;
    hierarchy: SpanHierarchy | null;
  } {
    const spans = this.getTraceSpans(traceId);
    const completed = spans.filter(s => s.endTime);
    const active = spans.filter(s => !s.endTime);

    const totalDuration = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSpanDuration = completed.length > 0 ? totalDuration / completed.length : 0;

    const longestSpan = completed.length > 0
      ? completed.reduce((longest, s) => 
          (s.duration || 0) > (longest.duration || 0) ? s : longest
        )
      : null;

    // Group spans by service
    const spansByService: Record<string, { count: number; totalDuration: number }> = {};
    for (const span of completed) {
      const service = span.service || 'unknown';
      if (!spansByService[service]) {
        spansByService[service] = { count: 0, totalDuration: 0 };
      }
      spansByService[service].count++;
      spansByService[service].totalDuration += span.duration || 0;
    }

    // Build hierarchy
    const hierarchy = this.buildHierarchy(completed);

    return {
      totalSpans: spans.length,
      completedSpans: completed.length,
      activeSpans: active.length,
      totalDuration,
      averageSpanDuration: Math.round(averageSpanDuration),
      longestSpan: longestSpan
        ? { operation: longestSpan.operation, duration: longestSpan.duration || 0 }
        : null,
      spansByService,
      spans: completed.map(s => ({
        operation: s.operation,
        duration: s.duration || 0,
        success: s.success,
        level: s.level || 0,
        service: s.service,
      })),
      hierarchy,
    };
  }

  /**
   * Build span hierarchy tree
   */
  private buildHierarchy(spans: TraceSpan[]): SpanHierarchy | null {
    if (spans.length === 0) return null;

    // Find root span (no parent or level 0)
    const root = spans.find(s => !s.parentSpanId || s.level === 0) || spans[0];
    if (!root) return null;

    const buildChildren = (parentSpanId: string): SpanHierarchy[] => {
      return spans
        .filter(s => s.parentSpanId === parentSpanId)
        .map(s => ({
          spanId: s.spanId,
          operation: s.operation,
          duration: s.duration || 0,
          level: s.level || 0,
          children: buildChildren(s.spanId),
        }));
    };

    return {
      spanId: root.spanId,
      operation: root.operation,
      duration: root.duration || 0,
      level: root.level || 0,
      children: buildChildren(root.spanId),
    };
  }

  /**
   * Export trace data for monitoring systems (Prometheus, OpenTelemetry, etc.)
   */
  exportTraceData(traceId: string): {
    traceId: string;
    startTime: number;
    endTime: number;
    duration: number;
    stats: ReturnType<typeof this.getTraceStats>;
    spans: TraceSpan[];
  } | null {
    const spans = this.completedSpans.get(traceId) || [];
    if (spans.length === 0) return null;

    const rootSpan = spans.find(s => s.level === 0 || !s.parentSpanId) || spans[0];
    const endTime = Math.max(...spans.map(s => s.endTime || s.startTime));

    return {
      traceId,
      startTime: rootSpan.startTime,
      endTime,
      duration: endTime - rootSpan.startTime,
      stats: this.getTraceStats(traceId),
      spans,
    };
  }

  /**
   * Create a span wrapper for async operations
   */
  async withSpan<T>(
    operation: string,
    fn: (spanId: string) => Promise<T>,
    parentSpanId?: string,
    tags?: Record<string, string | number | boolean>
  ): Promise<T> {
    const spanId = this.startSpan(operation, parentSpanId, tags);

    try {
      const result = await fn(spanId);
      this.endSpan(spanId, true);
      return result;
    } catch (error) {
      this.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Create a span wrapper for generator operations
   */
  async *withSpanGenerator<T>(
    operation: string,
    generator: (spanId: string) => AsyncGenerator<T>,
    parentSpanId?: string,
    tags?: Record<string, string | number | boolean>
  ): AsyncGenerator<T> {
    const spanId = this.startSpan(operation, parentSpanId, tags);

    try {
      for await (const value of generator(spanId)) {
        yield value;
      }
      this.endSpan(spanId, true);
    } catch (error) {
      this.endSpan(
        spanId,
        false,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }
}

// Export singleton instance
export const mode1TracingService = new Mode1TracingService();
