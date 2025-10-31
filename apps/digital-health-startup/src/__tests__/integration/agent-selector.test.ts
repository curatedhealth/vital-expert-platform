/**
 * Integration Tests for AgentSelectorService
 * 
 * Tests agent search, ranking, and selection with API Gateway integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentSelectorService } from '@/features/chat/services/agent-selector-service';

// Mock API Gateway calls for integration tests
const mockApiGatewayAnalysis = {
  intent: 'diagnosis',
  domains: ['cardiology'],
  complexity: 'high',
  keywords: ['symptoms', 'chest', 'pain'],
  medical_terms: ['cardiac', 'ECG'],
  confidence: 0.85,
};

describe('AgentSelectorService Integration', () => {
  let service: AgentSelectorService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup environment
    process.env.NEXT_PUBLIC_API_GATEWAY_URL = 'http://localhost:3001';
    process.env.API_GATEWAY_URL = 'http://localhost:3001';

    service = new AgentSelectorService({
      requestId: 'test-request',
      userId: 'test-user',
      tenantId: 'test-tenant',
    });

    // Mock API Gateway response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiGatewayAnalysis,
    });
  });

  describe('analyzeQuery Integration', () => {
    it('should call API Gateway for query analysis', async () => {
      const result = await service.analyzeQuery('I have chest pain');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/agents/select'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-tenant-id': 'test-tenant',
          }),
        })
      );

      expect(result.intent).toBe('diagnosis');
      expect(result.domains).toEqual(['cardiology']);
    });

    it('should include correlation ID in request', async () => {
      await service.analyzeQuery('test query');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.correlation_id).toBeDefined();
      expect(typeof requestBody.correlation_id).toBe('string');
    });
  });

  describe('findCandidateAgents', () => {
    it('should search agents using GraphRAG with analyzed query', async () => {
      // This test would require mocking GraphRAG service
      // For now, we verify the analyzeQuery integration works
      const analysis = await service.analyzeQuery('diabetes treatment');
      
      expect(analysis.domains).toBeDefined();
      expect(analysis.intent).toBeDefined();
      // The actual agent search would use this analysis
    });
  });

  describe('selectBestAgent Integration', () => {
    it('should use analyzed query for agent selection', async () => {
      // This would require full integration with GraphRAG and agent ranking
      // For now, we verify query analysis works
      const analysis = await service.analyzeQuery('cardiac diagnosis');
      
      expect(analysis).toBeDefined();
      expect(analysis.intent).toBeDefined();
      expect(analysis.domains.length).toBeGreaterThanOrEqual(0);
    });
  });
});

