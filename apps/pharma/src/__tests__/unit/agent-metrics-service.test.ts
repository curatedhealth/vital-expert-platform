/**
 * Unit Tests for AgentMetricsService
 * 
 * Tests metric recording, querying, and aggregation functionality
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentMetricsService } from '@/lib/services/observability/agent-metrics-service';
import type { AgentOperationMetrics } from '@/lib/services/observability/agent-metrics-service';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock structured logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
};

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

describe('AgentMetricsService', () => {
  let service: AgentMetricsService;
  let mockQuery: any;
  let mockInsert: any;
  let mockSelect: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup query builder mocks
    mockQuery = {
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
    };

    mockInsert = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSelect = {
      select: vi.fn().mockReturnValue(mockQuery),
    };

    mockSupabase.from.mockReturnValue(mockSelect);
    mockSelect.insert = vi.fn().mockReturnValue(mockInsert);

    service = new AgentMetricsService();
  });

  describe('recordOperation', () => {
    const validMetrics: AgentOperationMetrics = {
      agentId: '550e8400-e29b-41d4-a716-446655440000',
      tenantId: '660e8400-e29b-41d4-a716-446655440000',
      operationType: 'search',
      responseTimeMs: 150,
      success: true,
      queryText: 'test query',
    };

    it('should record a valid operation successfully', async () => {
      mockInsert.insert.mockResolvedValue({ error: null });

      await service.recordOperation(validMetrics);

      expect(mockSupabase.from).toHaveBeenCalledWith('agent_metrics');
      expect(mockInsert.insert).toHaveBeenCalledTimes(1);
      
      const insertCall = mockInsert.insert.mock.calls[0][0];
      expect(insertCall.agent_id).toBe(validMetrics.agentId);
      expect(insertCall.tenant_id).toBe(validMetrics.tenantId);
      expect(insertCall.operation_type).toBe(validMetrics.operationType);
      expect(insertCall.response_time_ms).toBe(validMetrics.responseTimeMs);
      expect(insertCall.success).toBe(validMetrics.success);
    });

    it('should record operation with all optional fields', async () => {
      const fullMetrics: AgentOperationMetrics = {
        ...validMetrics,
        userId: '770e8400-e29b-41d4-a716-446655440000',
        conversationId: '880e8400-e29b-41d4-a716-446655440000',
        sessionId: 'session-123',
        tokensInput: 100,
        tokensOutput: 200,
        costUsd: 0.0025,
        satisfactionScore: 5,
        confidenceScore: 0.95,
        searchMethod: 'graphrag_hybrid',
        graphragHit: true,
        graphragFallback: false,
        graphTraversalDepth: 2,
        metadata: { workflowId: 'test-workflow' },
      };

      await service.recordOperation(fullMetrics);

      const insertCall = mockInsert.insert.mock.calls[0][0];
      expect(insertCall.user_id).toBe(fullMetrics.userId);
      expect(insertCall.conversation_id).toBe(fullMetrics.conversationId);
      expect(insertCall.session_id).toBe(fullMetrics.sessionId);
      expect(insertCall.tokens_input).toBe(fullMetrics.tokensInput);
      expect(insertCall.tokens_output).toBe(fullMetrics.tokensOutput);
      expect(insertCall.cost_usd).toBe(fullMetrics.costUsd);
      expect(insertCall.satisfaction_score).toBe(fullMetrics.satisfactionScore);
      expect(insertCall.confidence_score).toBe(fullMetrics.confidenceScore);
      expect(insertCall.search_method).toBe(fullMetrics.searchMethod);
      expect(insertCall.graphrag_hit).toBe(fullMetrics.graphragHit);
      expect(insertCall.graphrag_fallback).toBe(fullMetrics.graphragFallback);
      expect(insertCall.graph_traversal_depth).toBe(fullMetrics.graphTraversalDepth);
      expect(insertCall.metadata).toEqual(fullMetrics.metadata);
    });

    it('should record error operation correctly', async () => {
      const errorMetrics: AgentOperationMetrics = {
        ...validMetrics,
        success: false,
        errorOccurred: true,
        errorType: 'NetworkError',
        errorMessage: 'Connection timeout',
      };

      await service.recordOperation(errorMetrics);

      const insertCall = mockInsert.insert.mock.calls[0][0];
      expect(insertCall.success).toBe(false);
      expect(insertCall.error_occurred).toBe(true);
      expect(insertCall.error_type).toBe(errorMetrics.errorType);
      expect(insertCall.error_message).toBe(errorMetrics.errorMessage);
    });

    it('should handle database errors gracefully (silent fail)', async () => {
      const dbError = { code: 'PGRST116', message: 'Database error' };
      mockInsert.insert.mockResolvedValue({ error: dbError });

      // Should not throw
      await expect(service.recordOperation(validMetrics)).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'agent_metrics_record_failed',
        expect.any(Error),
        expect.objectContaining({
          metrics: expect.objectContaining({
            agentId: validMetrics.agentId,
          }),
        })
      );
    });

    it('should validate metrics with Zod schema', async () => {
      const invalidMetrics = {
        agentId: 'not-a-uuid',
        tenantId: 'also-not-a-uuid',
        operationType: 'invalid_type',
      };

      await service.recordOperation(invalidMetrics as any);

      // Should log validation error
      expect(mockLogger.error).toHaveBeenCalledWith(
        'agent_metrics_validation_or_db_error',
        expect.any(Error),
        expect.objectContaining({
          rawMetrics: invalidMetrics,
        })
      );

      // Should not call database
      expect(mockInsert.insert).not.toHaveBeenCalled();
    });

    it('should truncate query text to 1000 characters', async () => {
      const longQuery = 'a'.repeat(2000);
      const metrics: AgentOperationMetrics = {
        ...validMetrics,
        queryText: longQuery,
      };

      await service.recordOperation(metrics);

      // Query text should be truncated to 1000 chars in service
      const insertCall = mockInsert.insert.mock.calls[0][0];
      expect(insertCall.query_text).toBeDefined();
      expect(insertCall.query_text?.length).toBeLessThanOrEqual(1000);
    });

    it('should default metadata to empty object if not provided', async () => {
      await service.recordOperation(validMetrics);

      const insertCall = mockInsert.insert.mock.calls[0][0];
      expect(insertCall.metadata).toEqual({});
    });
  });

  describe('getMetrics', () => {
    const mockMetricsData = [
      {
        id: '1',
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'search',
        response_time_ms: 100,
        success: true,
        created_at: '2025-01-29T10:00:00Z',
      },
      {
        id: '2',
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'selection',
        response_time_ms: 150,
        success: true,
        created_at: '2025-01-29T11:00:00Z',
      },
    ];

    beforeEach(() => {
      mockQuery.select.mockResolvedValue({
        data: mockMetricsData,
        error: null,
      });
    });

    it('should fetch metrics without filters', async () => {
      const result = await service.getMetrics({});

      expect(mockSupabase.from).toHaveBeenCalledWith('agent_metrics');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockMetricsData);
    });

    it('should filter by agentId', async () => {
      const agentId = 'agent-1';
      await service.getMetrics({ agentId });

      expect(mockQuery.eq).toHaveBeenCalledWith('agent_id', agentId);
    });

    it('should filter by tenantId', async () => {
      const tenantId = 'tenant-1';
      await service.getMetrics({ tenantId });

      expect(mockQuery.eq).toHaveBeenCalledWith('tenant_id', tenantId);
    });

    it('should filter by userId', async () => {
      const userId = 'user-1';
      await service.getMetrics({ userId });

      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should filter by operationType', async () => {
      await service.getMetrics({ operationType: 'search' });

      expect(mockQuery.eq).toHaveBeenCalledWith('operation_type', 'search');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-29T00:00:00Z');
      const endDate = new Date('2025-01-29T23:59:59Z');

      await service.getMetrics({ startDate, endDate });

      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', startDate.toISOString());
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', endDate.toISOString());
    });

    it('should apply limit', async () => {
      await service.getMetrics({ limit: 10 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should order by created_at descending', async () => {
      await service.getMetrics({});

      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array on database error', async () => {
      mockQuery.select.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Table not found' },
      });

      const result = await service.getMetrics({});

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle exceptions gracefully', async () => {
      mockQuery.select.mockRejectedValue(new Error('Network error'));

      const result = await service.getMetrics({});

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getAggregatedMetrics', () => {
    const mockMetricsData = [
      {
        id: '1',
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'search',
        response_time_ms: 100,
        success: true,
        error_occurred: false,
        tokens_input: 50,
        tokens_output: 100,
        cost_usd: 0.001,
        satisfaction_score: 5,
        confidence_score: 0.9,
        graphrag_hit: true,
        graphrag_fallback: false,
        search_method: 'graphrag_hybrid',
        created_at: '2025-01-29T10:00:00Z',
      },
      {
        id: '2',
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'search',
        response_time_ms: 200,
        success: true,
        error_occurred: false,
        tokens_input: 60,
        tokens_output: 120,
        cost_usd: 0.002,
        satisfaction_score: 4,
        confidence_score: 0.85,
        graphrag_hit: false,
        graphrag_fallback: true,
        search_method: 'database',
        created_at: '2025-01-29T11:00:00Z',
      },
      {
        id: '3',
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'selection',
        response_time_ms: 50,
        success: false,
        error_occurred: true,
        tokens_input: null,
        tokens_output: null,
        cost_usd: null,
        satisfaction_score: null,
        confidence_score: null,
        graphrag_hit: null,
        graphrag_fallback: null,
        search_method: null,
        created_at: '2025-01-29T12:00:00Z',
      },
    ];

    beforeEach(() => {
      mockQuery.select.mockResolvedValue({
        data: mockMetricsData,
        error: null,
      });
    });

    it('should calculate correct aggregates for 24h period', async () => {
      const result = await service.getAggregatedMetrics(
        'agent-1',
        'tenant-1',
        '24h'
      );

      expect(result).toMatchObject({
        totalOperations: 3,
        successfulOperations: 2,
        failedOperations: 1,
        errorRate: expect.closeTo(33.33, 1),
        averageLatencyMs: expect.closeTo(116.67, 1),
        totalTokensInput: 110,
        totalTokensOutput: 220,
        totalCostUsd: 0.003,
        graphragHits: 1,
        graphragFallbacks: 1,
        graphragHitRate: 50,
      });
    });

    it('should calculate P95 latency correctly', async () => {
      // Add more data points for P95 calculation
      const moreData = Array.from({ length: 20 }, (_, i) => ({
        id: `id-${i}`,
        agent_id: 'agent-1',
        tenant_id: 'tenant-1',
        operation_type: 'search',
        response_time_ms: (i + 1) * 10, // 10, 20, 30, ..., 200
        success: true,
        error_occurred: false,
        tokens_input: null,
        tokens_output: null,
        cost_usd: null,
        satisfaction_score: null,
        confidence_score: null,
        graphrag_hit: null,
        graphrag_fallback: null,
        search_method: null,
        created_at: new Date().toISOString(),
      }));

      mockQuery.select.mockResolvedValue({
        data: moreData,
        error: null,
      });

      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      // P95 should be around 190 (95th percentile of sorted latencies)
      expect(result?.p95LatencyMs).toBeGreaterThan(180);
      expect(result?.p95LatencyMs).toBeLessThanOrEqual(200);
    });

    it('should handle empty metrics gracefully', async () => {
      mockQuery.select.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result).toMatchObject({
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        errorRate: 0,
        averageLatencyMs: 0,
        p95LatencyMs: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalCostUsd: 0,
        averageSatisfactionScore: 0,
        averageConfidenceScore: 0,
        graphragHits: 0,
        graphragFallbacks: 0,
        graphragHitRate: 0,
        operationsBySearchMethod: {},
        operationsByType: {},
      });
    });

    it('should calculate operationsBySearchMethod correctly', async () => {
      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result?.operationsBySearchMethod).toEqual({
        graphrag_hybrid: 1,
        database: 1,
      });
    });

    it('should calculate operationsByType correctly', async () => {
      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result?.operationsByType).toEqual({
        search: 2,
        selection: 1,
      });
    });

    it('should handle different time ranges', async () => {
      const timeRanges: Array<'1h' | '6h' | '24h' | '7d' | '30d'> = ['1h', '6h', '24h', '7d', '30d'];

      for (const timeRange of timeRanges) {
        await service.getAggregatedMetrics('agent-1', 'tenant-1', timeRange);
        
        // Verify date filtering was applied
        expect(mockQuery.gte).toHaveBeenCalled();
        expect(mockQuery.lte).toHaveBeenCalled();
      }
    });

    it('should filter null values when calculating averages', async () => {
      const dataWithNulls = [
        {
          ...mockMetricsData[0],
          satisfaction_score: null,
          confidence_score: null,
        },
        {
          ...mockMetricsData[1],
          satisfaction_score: 4,
          confidence_score: 0.85,
        },
      ];

      mockQuery.select.mockResolvedValue({
        data: dataWithNulls,
        error: null,
      });

      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result?.averageSatisfactionScore).toBe(4);
      expect(result?.averageConfidenceScore).toBeCloseTo(0.85);
    });

    it('should return null on database error', async () => {
      mockQuery.select.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Database error' },
      });

      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle exceptions gracefully', async () => {
      mockQuery.select.mockRejectedValue(new Error('Network error'));

      const result = await service.getAggregatedMetrics('agent-1', 'tenant-1', '24h');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle very large query text', async () => {
      const metrics: AgentOperationMetrics = {
        agentId: 'agent-1',
        tenantId: 'tenant-1',
        operationType: 'search',
        queryText: 'a'.repeat(5000), // Very long query
      };

      // Zod should validate and reject or truncate
      await service.recordOperation(metrics);

      // Should handle gracefully (either via validation or truncation)
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle negative response times (should not happen but validate)', async () => {
      const metrics: AgentOperationMetrics = {
        agentId: 'agent-1',
        tenantId: 'tenant-1',
        operationType: 'search',
        responseTimeMs: -100, // Invalid
      };

      // Zod schema should reject negative values
      await service.recordOperation(metrics);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'agent_metrics_validation_or_db_error',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle satisfaction score out of range', async () => {
      const metrics: AgentOperationMetrics = {
        agentId: 'agent-1',
        tenantId: 'tenant-1',
        operationType: 'search',
        satisfactionScore: 10, // Out of range (should be 1-5)
      };

      await service.recordOperation(metrics);

      // Zod should validate range
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle confidence score out of range', async () => {
      const metrics: AgentOperationMetrics = {
        agentId: 'agent-1',
        tenantId: 'tenant-1',
        operationType: 'search',
        confidenceScore: 2.0, // Out of range (should be 0-1)
      };

      await service.recordOperation(metrics);

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

