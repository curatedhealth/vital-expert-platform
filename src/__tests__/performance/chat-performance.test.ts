import { performance } from 'perf_hooks';
import { ToolRegistry } from '@/lib/services/tool-registry';

describe('Chat Performance Tests', () => {
  let registry: ToolRegistry;

  beforeAll(() => {
    registry = ToolRegistry.getInstance();
  });

  describe('Tool Registry Performance', () => {
    it('should load tools quickly', () => {
      const start = performance.now();
      const tools = registry.getTools();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should load in under 100ms
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should filter tools by category quickly', () => {
      const start = performance.now();
      const researchTools = registry.getToolsByCategory('research');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should filter in under 50ms
      expect(researchTools.every(tool => tool.category === 'research')).toBe(true);
    });

    it('should handle concurrent tool execution', async () => {
      const start = performance.now();
      
      const promises = Array.from({ length: 10 }, (_, i) => 
        registry.executeTool('web-search', { query: `test query ${i}` })
      );
      
      const results = await Promise.all(promises);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(results).toHaveLength(10);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        registry.getTools();
        registry.getToolsByCategory('research');
        registry.getEnabledTools();
      }
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Response Time', () => {
    it('should respond to API requests quickly', async () => {
      const start = performance.now();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test message',
          interactionMode: 'automatic'
        })
      });
      
      const end = performance.now();
      
      expect(response.status).toBe(200);
      expect(end - start).toBeLessThan(5000); // Should respond in under 5 seconds
    });
  });

  describe('Concurrent Users', () => {
    it('should handle multiple concurrent requests', async () => {
      const start = performance.now();
      
      const promises = Array.from({ length: 20 }, (_, i) => 
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Test message ${i}`,
            interactionMode: 'automatic'
          })
        })
      );
      
      const responses = await Promise.all(promises);
      const end = performance.now();
      
      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(end - start).toBeLessThan(10000); // Should handle 20 concurrent requests in under 10 seconds
    });
  });
});
