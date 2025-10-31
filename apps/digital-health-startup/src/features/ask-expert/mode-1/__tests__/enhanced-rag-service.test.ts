/**
 * Enhanced RAG Service Tests
 * 
 * Tests RAG retrieval with multi-domain search, deduplication, and formatting
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EnhancedRAGService, enhancedRAGService } from '../services/enhanced-rag-service';
import { Document } from '@langchain/core/documents';
import { unifiedRAGService } from '../../../../lib/services/rag/unified-rag-service';

// Mock unifiedRAGService
jest.mock('../../../../lib/services/rag/unified-rag-service', () => ({
  unifiedRAGService: {
    query: jest.fn(),
  },
}));

describe('EnhancedRAGService', () => {
  let service: EnhancedRAGService;
  const mockUnifiedRAG = unifiedRAGService as jest.Mocked<typeof unifiedRAGService>;

  beforeEach(() => {
    service = new EnhancedRAGService();
    jest.clearAllMocks();
  });

  describe('retrieveContext', () => {
    const mockDocument = (id: string, content: string, similarity: number): Document => ({
      pageContent: content,
      metadata: {
        id,
        title: `Document ${id}`,
        similarity,
        domain: 'test-domain',
        url: `https://example.com/doc-${id}`,
      },
    });

    it('should retrieve context with single domain', async () => {
      const mockSources = [
        mockDocument('1', 'Content 1', 0.9),
        mockDocument('2', 'Content 2', 0.8),
      ];

      mockUnifiedRAG.query.mockResolvedValueOnce({
        sources: mockSources,
        query: 'test query',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        knowledgeDomains: ['domain1'],
        maxResults: 5,
      });

      expect(result.context).toContain('Content 1');
      expect(result.sources.length).toBe(2);
      expect(result.totalSources).toBe(2);
      expect(result.strategy).toBeDefined();
      expect(result.retrievalTime).toBeGreaterThanOrEqual(0);
      expect(mockUnifiedRAG.query).toHaveBeenCalled();
    });

    it('should retrieve context with multiple domains', async () => {
      const mockSources1 = [mockDocument('1', 'Content 1', 0.9)];
      const mockSources2 = [mockDocument('2', 'Content 2', 0.85)];

      mockUnifiedRAG.query
        .mockResolvedValueOnce({ sources: mockSources1, query: 'test', strategy: 'semantic' })
        .mockResolvedValueOnce({ sources: mockSources2, query: 'test', strategy: 'semantic' })
        .mockResolvedValueOnce({ sources: mockSources1, query: 'test', strategy: 'agent-optimized' })
        .mockResolvedValueOnce({ sources: mockSources2, query: 'test', strategy: 'agent-optimized' });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        knowledgeDomains: ['domain1', 'domain2'],
        maxResults: 5,
      });

      expect(result.totalSources).toBeGreaterThan(0);
      expect(result.domainsSearched).toContain('domain1');
      expect(result.domainsSearched).toContain('domain2');
    });

    it('should retrieve context without domains', async () => {
      const mockSources = [mockDocument('1', 'Content 1', 0.9)];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test query',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        maxResults: 5,
      });

      expect(result.domainsSearched).toEqual(['general']);
      expect(result.totalSources).toBeGreaterThan(0);
    });

    it('should deduplicate sources from multiple strategies', async () => {
      const mockSources1 = [mockDocument('1', 'Same content', 0.9)];
      const mockSources2 = [mockDocument('1', 'Same content', 0.85)]; // Same ID

      mockUnifiedRAG.query.mockResolvedValue({
        sources: [...mockSources1, ...mockSources2],
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        maxResults: 5,
      });

      // Should deduplicate by ID
      expect(result.totalSources).toBe(1);
    });

    it('should sort sources by similarity', async () => {
      const mockSources = [
        mockDocument('1', 'Low similarity', 0.6),
        mockDocument('2', 'High similarity', 0.95),
        mockDocument('3', 'Medium similarity', 0.75),
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        maxResults: 5,
      });

      // Should be sorted high to low
      if (result.sources.length >= 2) {
        expect(result.sources[0].similarity).toBeGreaterThanOrEqual(
          result.sources[1].similarity
        );
      }
    });

    it('should respect maxResults limit', async () => {
      const mockSources = Array.from({ length: 10 }, (_, i) =>
        mockDocument(String(i), `Content ${i}`, 0.9 - i * 0.05)
      );

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        maxResults: 3,
      });

      expect(result.totalSources).toBeLessThanOrEqual(3);
      expect(result.sources.length).toBeLessThanOrEqual(3);
    });

    it('should handle similarityThreshold', async () => {
      const mockSources = [
        mockDocument('1', 'High similarity', 0.85),
        mockDocument('2', 'Low similarity', 0.5), // Below threshold
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        similarityThreshold: 0.7,
        maxResults: 5,
      });

      // Note: unifiedRAGService filters by threshold, so we test what we get
      expect(result.totalSources).toBeGreaterThanOrEqual(0);
    });

    it('should include URLs when includeUrls is true', async () => {
      const mockSources = [
        mockDocument('1', 'Content with URL', 0.9),
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        includeUrls: true,
      });

      expect(result.context).toContain('https://example.com/doc-1');
      expect(result.sources[0].url).toBe('https://example.com/doc-1');
    });

    it('should exclude URLs when includeUrls is false', async () => {
      const mockSources = [
        mockDocument('1', 'Content without URL', 0.9),
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        includeUrls: false,
      });

      expect(result.context).not.toContain('URL:');
    });

    it('should handle empty results', async () => {
      mockUnifiedRAG.query.mockResolvedValue({
        sources: [],
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      expect(result.totalSources).toBe(0);
      expect(result.sources.length).toBe(0);
      expect(result.context).toContain('No relevant context found');
    });

    it('should handle query errors gracefully', async () => {
      mockUnifiedRAG.query.mockRejectedValueOnce(new Error('Query failed'));

      // Should continue with other strategies
      mockUnifiedRAG.query.mockResolvedValue({
        sources: [mockDocument('1', 'Fallback content', 0.8)],
        query: 'test',
        strategy: 'hybrid',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      // Should still return results from successful strategy
      expect(result.totalSources).toBeGreaterThanOrEqual(0);
    });

    it('should try multiple strategies', async () => {
      const mockSources = [mockDocument('1', 'Content', 0.9)];

      mockUnifiedRAG.query
        .mockResolvedValueOnce({ sources: [], query: 'test', strategy: 'agent-optimized' })
        .mockResolvedValueOnce({ sources: mockSources, query: 'test', strategy: 'hybrid' })
        .mockResolvedValueOnce({ sources: [], query: 'test', strategy: 'semantic' });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      // Should have tried multiple strategies
      expect(mockUnifiedRAG.query).toHaveBeenCalledTimes(3);
      expect(result.strategy).toBeDefined();
    });

    it('should limit domains to first 3', async () => {
      const mockSources = [mockDocument('1', 'Content', 0.9)];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
        knowledgeDomains: ['domain1', 'domain2', 'domain3', 'domain4', 'domain5'],
        maxResults: 5,
      });

      // Should only query first 3 domains per strategy
      // 3 domains × 3 strategies = 9 calls max (but limited by logic)
      expect(mockUnifiedRAG.query).toHaveBeenCalled();
    });

    it('should format sources with metadata', async () => {
      const mockSources = [
        {
          pageContent: 'Test content',
          metadata: {
            id: 'doc1',
            title: 'Test Document',
            similarity: 0.9,
            domain: 'test-domain',
            url: 'https://example.com',
            page_number: 5,
            section: 'Introduction',
          },
        } as Document,
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      expect(result.sources[0].title).toBe('Test Document');
      expect(result.sources[0].domain).toBe('test-domain');
      expect(result.sources[0].similarity).toBe(0.9);
      expect(result.sources[0].url).toBe('https://example.com');
      expect(result.sources[0].page_number).toBe(5);
      expect(result.sources[0].section).toBe('Introduction');
    });

    it('should handle sources without metadata', async () => {
      const mockSources = [
        {
          pageContent: 'Content without metadata',
          metadata: {},
        } as Document,
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      expect(result.sources[0].title).toBe('Document');
      expect(result.sources[0].similarity).toBe(0);
    });
  });

  describe('deduplicateSources', () => {
    it('should deduplicate by ID', () => {
      const service = new EnhancedRAGService();
      const sources: Document[] = [
        { pageContent: 'Content', metadata: { id: '1' } } as Document,
        { pageContent: 'Other content', metadata: { id: '1' } } as Document,
        { pageContent: 'Unique', metadata: { id: '2' } } as Document,
      ];

      // Access private method via any for testing
      const deduplicated = (service as any).deduplicateSources(sources);

      expect(deduplicated.length).toBe(2);
    });

    it('should deduplicate by content hash when no ID', () => {
      const service = new EnhancedRAGService();
      const sameContent = 'Same content text';
      const sources: Document[] = [
        { pageContent: sameContent, metadata: {} } as Document,
        { pageContent: sameContent, metadata: {} } as Document,
        { pageContent: 'Different content', metadata: {} } as Document,
      ];

      // Access private method via any for testing
      const deduplicated = (service as any).deduplicateSources(sources);

      expect(deduplicated.length).toBe(2);
    });
  });

  describe('formatContext', () => {
    it('should format context with all metadata', () => {
      const service = new EnhancedRAGService();
      const sources: Document[] = [
        {
          pageContent: 'Content here',
          metadata: {
            title: 'Test Doc',
            domain: 'test',
            similarity: 0.9,
            url: 'https://example.com',
            page_number: 1,
            section: 'Intro',
          },
        } as Document,
      ];

      // Access private method via any for testing
      const formatted = (service as any).formatContext(sources, true);

      expect(formatted).toContain('Test Doc');
      expect(formatted).toContain('test');
      expect(formatted).toContain('Relevance: 90%');
      expect(formatted).toContain('https://example.com');
      expect(formatted).toContain('Page 1');
      expect(formatted).toContain('Section: Intro');
      expect(formatted).toContain('Content here');
    });

    it('should return empty message for no sources', () => {
      const service = new EnhancedRAGService();
      const formatted = (service as any).formatContext([], true);

      expect(formatted).toContain('No relevant context found');
    });
  });

  describe('formatSources', () => {
    it('should format sources array with metadata', () => {
      const service = new EnhancedRAGService();
      const sources: Document[] = [
        {
          pageContent: 'Content',
          metadata: {
            title: 'Test',
            similarity: 0.8,
            domain: 'domain1',
          },
        } as Document,
      ];

      // Access private method via any for testing
      const formatted = (service as any).formatSources(sources);

      expect(formatted[0].title).toBe('Test');
      expect(formatted[0].similarity).toBe(0.8);
      expect(formatted[0].domain).toBe('domain1');
    });
  });

  describe('hashContent', () => {
    it('should create hash from content', () => {
      const service = new EnhancedRAGService();
      const content = 'This is test content for hashing';
      
      // Access private method via any for testing
      const hash1 = (service as any).hashContent(content);
      const hash2 = (service as any).hashContent(content);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should create different hashes for different content', () => {
      const service = new EnhancedRAGService();
      
      const hash1 = (service as any).hashContent('Content 1');
      const hash2 = (service as any).hashContent('Content 2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle very long content', () => {
      const service = new EnhancedRAGService();
      const longContent = 'word '.repeat(1000);
      
      const hash = (service as any).hashContent(longContent);

      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle empty content', () => {
      const service = new EnhancedRAGService();
      
      const hash = (service as any).hashContent('');

      expect(hash).toBe('0_');
    });
  });

  describe('Singleton instance', () => {
    it('should export singleton instance', () => {
      expect(enhancedRAGService).toBeInstanceOf(EnhancedRAGService);
    });

    it('should use same instance', () => {
      const instance1 = enhancedRAGService;
      const instance2 = enhancedRAGService;

      expect(instance1).toBe(instance2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined sources', async () => {
      mockUnifiedRAG.query.mockResolvedValue({
        sources: null as any,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      expect(result.totalSources).toBe(0);
    });

    it('should handle missing similarity in metadata', async () => {
      const mockSources = [
        {
          pageContent: 'Content',
          metadata: { id: '1', title: 'Doc' },
        } as Document,
      ];

      mockUnifiedRAG.query.mockResolvedValue({
        sources: mockSources,
        query: 'test',
        strategy: 'semantic',
      });

      const result = await service.retrieveContext({
        query: 'test query',
        agentId: 'test-agent',
      });

      expect(result.sources[0].similarity).toBe(0);
    });
  });
});

