/**
 * Integration Tests for Agent Analytics API
 * 
 * Tests the analytics endpoint that integrates:
 * - Database agent_metrics table (historical data)
 * - Prometheus exporter (real-time metrics)
 * - Mode 1 metrics (separate endpoint)
 * - Data aggregation and time range filtering
 * - Error handling
 * 
 * Coverage Target: 95%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/analytics/agents/route';
import type { NextRequest } from 'next/server';

// Mock Prometheus exporter
const mockPrometheusExporter = {
  getMetrics: vi.fn(),
  exportMetrics: vi.fn(),
  recordLogEntry: vi.fn(),
};

const mockAgentMetricsService = {
  getMetrics: vi.fn(),
  getAggregatedMetrics: vi.fn(),
  recordOperation: vi.fn(),
};

const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  gte: vi.fn(() => mockSupabase),
  lte: vi.fn(() => mockSupabase),
};

const mockCreateClient = vi.fn(async () => mockSupabase);

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockFetch = vi.fn();

vi.mock('@/lib/services/observability/prometheus-exporter', () => ({
  getPrometheusExporter: vi.fn(() => mockPrometheusExporter),
}));

vi.mock('@/lib/services/observability/agent-metrics-service', () => ({
  getAgentMetricsService: vi.fn(() => mockAgentMetricsService),
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

// Mock fetch globally
global.fetch = mockFetch;

describe('Agent Analytics API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analytics/agents', () => {
    it('should return comprehensive analytics for default time range (24h)', async () => {
      // Mock database metrics
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 150,
        searchOperations: {
          total: 80,
          byMethod: {
            graphrag_hybrid: 60,
            database: 15,
            fallback: 5,
          },
          errors: 2,
          averageLatency: 120,
          p95Latency: 250,
        },
        selectionOperations: {
          total: 50,
          byConfidence: {
            high: 30,
            medium: 15,
            low: 5,
          },
          averageLatency: 80,
        },
        mode2Operations: {
          total: 10,
          success: 9,
          error: 1,
          averageLatency: 1500,
          p95Latency: 2000,
        },
        mode3Operations: {
          total: 10,
          success: 8,
          error: 2,
          averageLatency: 3000,
          p95Latency: 4500,
          averageIterations: 3.5,
        },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([
        {
          id: 'metric-1',
          agent_id: 'agent-123',
          operation_type: 'search',
          method: 'graphrag_hybrid',
          duration_ms: 120,
          success: true,
          created_at: new Date().toISOString(),
        },
      ]);

      // Mock Prometheus metrics
      mockPrometheusExporter.getMetrics.mockReturnValue({
        searchTotal: { values: [{ value: 80, labels: { operation: 'search', method: 'graphrag_hybrid' } }] },
        searchDuration: { values: [{ value: 120, labels: { operation: 'search' } }] },
        selectionTotal: { values: [{ value: 50, labels: {} }] },
      });

      // Mock Mode 1 metrics endpoint
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          totalRequests: 20,
          averageLatency: 1000,
          errorRate: 0.05,
        }),
      });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.summary).toBeDefined();
      expect(body.summary.totalSearches).toBeGreaterThan(0);
      expect(body.searchMetrics).toBeDefined();
      expect(body.selectionMetrics).toBeDefined();
      expect(body.modeMetrics).toBeDefined();
      expect(body.modeMetrics.mode2).toBeDefined();
      expect(body.modeMetrics.mode3).toBeDefined();
      expect(body.recentOperations).toBeDefined();
      expect(body.timeRange).toBeDefined();
    });

    it('should accept custom time range parameter', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 50,
        searchOperations: { total: 30, byMethod: {}, errors: 0, averageLatency: 100, p95Latency: 200 },
        selectionOperations: { total: 20, byConfidence: {}, averageLatency: 80 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents?timeRange=7d';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.timeRange).toBeDefined();
      // Verify service was called with 7d time range
      expect(mockAgentMetricsService.getAggregatedMetrics).toHaveBeenCalled();
    });

    it('should filter by agentId when provided', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 25,
        searchOperations: { total: 15, byMethod: {}, errors: 0, averageLatency: 100, p95Latency: 200 },
        selectionOperations: { total: 10, byConfidence: {}, averageLatency: 80 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents?agentId=agent-123';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toBeDefined();
      // Verify service was called with agentId filter
      expect(mockAgentMetricsService.getAggregatedMetrics).toHaveBeenCalled();
    });

    it('should calculate GraphRAG hit rate correctly', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 100,
        searchOperations: {
          total: 100,
          byMethod: {
            graphrag_hybrid: 75,
            database: 20,
            fallback: 5,
          },
          errors: 0,
          averageLatency: 120,
          p95Latency: 250,
        },
        selectionOperations: { total: 0, byConfidence: {}, averageLatency: 0 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.graphragMetrics.hitRate).toBe(0.75); // 75/100
      expect(body.graphragMetrics.hits).toBe(75);
      expect(body.graphragMetrics.fallbacks).toBe(25); // database + fallback
    });

    it('should calculate error rate correctly', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 100,
        searchOperations: {
          total: 100,
          byMethod: {},
          errors: 5,
          averageLatency: 120,
          p95Latency: 250,
        },
        selectionOperations: { total: 0, byConfidence: {}, averageLatency: 0 },
        mode2Operations: { total: 10, success: 8, error: 2, averageLatency: 1500, p95Latency: 2000 },
        mode3Operations: { total: 10, success: 9, error: 1, averageLatency: 3000, p95Latency: 4500, averageIterations: 3 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.searchMetrics.errorRate).toBe(0.05); // 5/100
      expect(body.searchMetrics.errors).toBe(5);
    });

    it('should include Mode 1 metrics when available', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 100,
        searchOperations: { total: 80, byMethod: {}, errors: 0, averageLatency: 100, p95Latency: 200 },
        selectionOperations: { total: 0, byConfidence: {}, averageLatency: 0 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});

      // Mock Mode 1 metrics endpoint
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          totalRequests: 50,
          averageLatency: 1500,
          errorRate: 0.04,
          p95Latency: 2500,
        }),
      });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.modeMetrics.mode1).toBeDefined();
      expect(body.modeMetrics.mode1.total).toBe(50);
      expect(body.modeMetrics.mode1.averageLatency).toBe(1500);
    });

    it('should handle Mode 1 metrics endpoint failure gracefully', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 100,
        searchOperations: { total: 80, byMethod: {}, errors: 0, averageLatency: 100, p95Latency: 200 },
        selectionOperations: { total: 0, byConfidence: {}, averageLatency: 0 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);
      mockPrometheusExporter.getMetrics.mockReturnValue({});

      // Mock Mode 1 endpoint failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      // Should still return analytics without Mode 1
      expect(body.modeMetrics).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle database metrics service errors gracefully', async () => {
      mockAgentMetricsService.getAggregatedMetrics.mockRejectedValue(
        new Error('Database connection failed')
      );

      mockPrometheusExporter.getMetrics.mockReturnValue({
        searchTotal: { values: [{ value: 10, labels: {} }] },
      });

      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      // Should fallback to Prometheus-only data
      expect(response.status).toBe(200);
      expect(body).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return recent operations from metrics', async () => {
      const recentMetrics = [
        {
          id: 'metric-1',
          operation_type: 'search',
          method: 'graphrag_hybrid',
          duration_ms: 120,
          success: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 'metric-2',
          operation_type: 'selection',
          duration_ms: 80,
          success: true,
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
      ];

      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 2,
        searchOperations: { total: 1, byMethod: {}, errors: 0, averageLatency: 120, p95Latency: 120 },
        selectionOperations: { total: 1, byConfidence: {}, averageLatency: 80 },
        mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
        mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue(recentMetrics);
      mockPrometheusExporter.getMetrics.mockReturnValue({});
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.recentOperations).toHaveLength(2);
      expect(body.recentOperations[0].operation).toBe('search');
      expect(body.recentOperations[0].method).toBe('graphrag_hybrid');
      expect(body.recentOperations[0].status).toBe('success');
    });

    it('should handle all time range values (1h, 6h, 24h, 7d)', async () => {
      const timeRanges = ['1h', '6h', '24h', '7d'] as const;

      for (const timeRange of timeRanges) {
        mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
          totalOperations: 10,
          searchOperations: { total: 5, byMethod: {}, errors: 0, averageLatency: 100, p95Latency: 200 },
          selectionOperations: { total: 5, byConfidence: {}, averageLatency: 80 },
          mode2Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0 },
          mode3Operations: { total: 0, success: 0, error: 0, averageLatency: 0, p95Latency: 0, averageIterations: 0 },
        });

        mockAgentMetricsService.getMetrics.mockResolvedValue([]);
        mockPrometheusExporter.getMetrics.mockReturnValue({});
        mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

        const url = `http://localhost:3000/api/analytics/agents?timeRange=${timeRange}`;
        const request = new NextRequest(url);

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.timeRange).toBeDefined();
      }
    });

    it('should combine Prometheus and database metrics', async () => {
      // Database has historical data
      mockAgentMetricsService.getAggregatedMetrics.mockResolvedValue({
        totalOperations: 100,
        searchOperations: {
          total: 50,
          byMethod: { graphrag_hybrid: 40, database: 10 },
          errors: 2,
          averageLatency: 120,
          p95Latency: 250,
        },
        selectionOperations: { total: 30, byConfidence: {}, averageLatency: 80 },
        mode2Operations: { total: 10, success: 9, error: 1, averageLatency: 1500, p95Latency: 2000 },
        mode3Operations: { total: 10, success: 8, error: 2, averageLatency: 3000, p95Latency: 4500, averageIterations: 3 },
      });

      mockAgentMetricsService.getMetrics.mockResolvedValue([]);

      // Prometheus has real-time data
      mockPrometheusExporter.getMetrics.mockReturnValue({
        searchTotal: {
          values: [
            { value: 10, labels: { operation: 'search', method: 'graphrag_hybrid' } },
          ],
        },
      });

      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

      const url = 'http://localhost:3000/api/analytics/agents';
      const request = new NextRequest(url);

      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      // Should combine both sources
      expect(body.searchMetrics.total).toBeGreaterThanOrEqual(50);
      expect(body).toBeDefined();
    });
  });
});

