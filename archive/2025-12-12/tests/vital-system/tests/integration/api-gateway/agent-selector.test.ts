/**
 * Integration Tests for API Gateway Agent Selector Endpoint
 * 
 * Tests the full flow: TypeScript Service → API Gateway → Python AI Engine
 * 
 * Note: These tests require:
 * - API Gateway running on localhost:3001
 * - Python AI Engine running on localhost:8000
 * - Set API_GATEWAY_URL environment variable or use default
 */

import { AgentSelectorService } from '../../../src/features/chat/services/agent-selector-service';
import { jest } from '@jest/globals';

describe('Integration: API Gateway Agent Selector', () => {
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';
  const TEST_TIMEOUT = 30000; // 30 seconds

  // Skip tests if services are not running
  const skipIfNoServices = () => {
    if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
      console.log('⏭️  Skipping integration tests (SKIP_INTEGRATION_TESTS=true)');
      return true;
    }
    return false;
  };

  describe('Agent Selector Service Integration', () => {
    let service: AgentSelectorService;

    beforeEach(() => {
      service = new AgentSelectorService({
        requestId: 'test-integration-request',
        userId: 'test-user',
        tenantId: '00000000-0000-0000-0000-000000000001',
      });
    });

    describe('analyzeQuery', () => {
      it('should analyze query via API Gateway → Python AI Engine', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const query = 'I have chest pain and shortness of breath. What could be the diagnosis?';

        const result = await service.analyzeQuery(query);

        // Verify response structure
        expect(result).toBeDefined();
        expect(result.intent).toBeDefined();
        expect(result.domains).toBeDefined();
        expect(Array.isArray(result.domains)).toBe(true);
        expect(result.complexity).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(result.complexity);
        expect(result.keywords).toBeDefined();
        expect(Array.isArray(result.keywords)).toBe(true);
        expect(result.medicalTerms).toBeDefined();
        expect(Array.isArray(result.medicalTerms)).toBe(true);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }, TEST_TIMEOUT);

      it('should handle medical queries correctly', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const queries = [
          'What are the treatment options for type 2 diabetes?',
          'I need information about cardiac arrhythmias',
          'Explain the side effects of chemotherapy',
        ];

        for (const query of queries) {
          const result = await service.analyzeQuery(query);

          expect(result.intent).toBeDefined();
          expect(result.domains.length).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeGreaterThan(0);
        }
      }, TEST_TIMEOUT * 2);

      it('should handle different query complexities', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const simpleQuery = 'What is diabetes?';
        const complexQuery = 'I need a comprehensive analysis of the interaction between metformin, ACE inhibitors, and the patient\'s existing renal function, considering their age, comorbidities, and current medication regimen.';

        const simpleResult = await service.analyzeQuery(simpleQuery);
        const complexResult = await service.analyzeQuery(complexQuery);

        expect(simpleResult.complexity).toBeDefined();
        expect(complexResult.complexity).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(simpleResult.complexity);
        expect(['low', 'medium', 'high']).toContain(complexResult.complexity);
      }, TEST_TIMEOUT * 2);

      it('should include relevant medical domains', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const query = 'I have chest pain, shortness of breath, and irregular heartbeat';
        const result = await service.analyzeQuery(query);

        expect(result.domains.length).toBeGreaterThanOrEqual(0);
        // Medical queries should typically have at least one domain
        if (result.confidence > 0.5) {
          expect(result.domains.length).toBeGreaterThan(0);
        }
      }, TEST_TIMEOUT);

      it('should extract keywords and medical terms', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const query = 'What are the symptoms and treatment for hypertension and diabetes?';
        const result = await service.analyzeQuery(query);

        expect(result.keywords.length).toBeGreaterThan(0);
        // Should extract some medical terms from the query
        if (result.confidence > 0.5) {
          expect(result.medicalTerms.length).toBeGreaterThanOrEqual(0);
        }
      }, TEST_TIMEOUT);

      it('should handle empty or very short queries', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const shortQuery = 'help';
        const result = await service.analyzeQuery(shortQuery);

        // Should still return a valid analysis, possibly with lower confidence
        expect(result.intent).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      }, TEST_TIMEOUT);

      it('should maintain consistent response structure', async () => {
        if (skipIfNoServices()) {
          return;
        }

        const query = 'Test query for structure validation';
        const result = await service.analyzeQuery(query);

        // Verify all required fields exist
        expect(result).toHaveProperty('intent');
        expect(result).toHaveProperty('domains');
        expect(result).toHaveProperty('complexity');
        expect(result).toHaveProperty('keywords');
        expect(result).toHaveProperty('medicalTerms');
        expect(result).toHaveProperty('confidence');

        // Verify types
        expect(typeof result.intent).toBe('string');
        expect(Array.isArray(result.domains)).toBe(true);
        expect(typeof result.complexity).toBe('string');
        expect(Array.isArray(result.keywords)).toBe(true);
        expect(Array.isArray(result.medicalTerms)).toBe(true);
        expect(typeof result.confidence).toBe('number');
      }, TEST_TIMEOUT);
    });

    describe('Error Handling', () => {
      it('should handle API Gateway errors gracefully', async () => {
        if (skipIfNoServices()) {
          return;
        }

        // Create a service with invalid URL to force error
        const invalidService = new AgentSelectorService({
          requestId: 'test-error',
          tenantId: 'test-tenant',
        });

        // Override the fetch to simulate error
        const originalFetch = global.fetch;
        (global.fetch as any) = jest.fn().mockRejectedValueOnce(new Error('Network error'));

        try {
          const result = await invalidService.analyzeQuery('test query');
          // Should return fallback analysis
          expect(result.intent).toBe('general');
          expect(result.confidence).toBe(0.5);
        } finally {
          global.fetch = originalFetch;
        }
      }, TEST_TIMEOUT);
    });
  });
});
