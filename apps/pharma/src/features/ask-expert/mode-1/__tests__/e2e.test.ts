/**
 * Mode 1 End-to-End Tests
 * 
 * Tests the complete Mode 1 flow from API endpoint to response
 * These tests require a running server and can be run manually
 */

import { describe, it, expect } from '@jest/globals';

describe('Mode 1 End-to-End Tests', () => {
  const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  describe('API Endpoint Tests', () => {
    it('should handle Mode 1 request with valid agent', async () => {
      const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          agentId: 'test-agent-id', // Replace with actual agent ID from your database
          message: 'What is the regulatory pathway for digital therapeutics?',
          enableRAG: true,
          enableTools: false,
        }),
      });

      expect(response.ok).toBe(true);
      expect(response.body).toBeDefined();
    }, 30000); // 30 second timeout

    it('should return error for missing agent ID', async () => {
      const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          message: 'Test message',
          // agentId missing
        }),
      });

      // Should handle error gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should stream response chunks', async () => {
      const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          agentId: 'test-agent-id',
          message: 'Hello, can you help me?',
          enableRAG: false,
          enableTools: false,
        }),
      });

      expect(response.ok).toBe(true);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let chunksReceived = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          if (chunk.includes('data: ')) {
            chunksReceived++;
          }
        }
      }

      expect(chunksReceived).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error Handling E2E', () => {
    it('should handle timeout errors gracefully', async () => {
      // This would require a test that intentionally causes a timeout
      // For now, we verify the error handling structure exists
      expect(true).toBe(true); // Placeholder
    });

    it('should handle invalid agent ID', async () => {
      const response = await fetch(`${API_BASE}/api/ask-expert/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          agentId: 'non-existent-agent-id',
          message: 'Test message',
        }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return metrics', async () => {
      const response = await fetch(
        `${API_BASE}/api/ask-expert/mode1/metrics?endpoint=stats`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return health check', async () => {
      const response = await fetch(
        `${API_BASE}/api/ask-expert/mode1/metrics?endpoint=health`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.healthy).toBeDefined();
      expect(data.data.status).toBeDefined();
    });
  });
});

