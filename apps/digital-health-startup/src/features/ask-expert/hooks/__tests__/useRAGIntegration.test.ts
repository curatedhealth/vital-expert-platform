/**
 * Unit Tests for useRAGIntegration Hook
 * 
 * Tests RAG sources, citations, normalization, and grouping
 * Target: 80%+ coverage
 */

import { renderHook, act } from '@testing-library/react';
import { useRAGIntegration } from '../useRAGIntegration';
import type { Source, CitationMeta } from '../../types';

describe('useRAGIntegration', () => {
  // ============================================================================
  // SETUP
  // ============================================================================
  
  const createMockSource = (overrides?: Partial<Source>): Source => ({
    id: `source-${Date.now()}-${Math.random()}`,
    number: 1,
    url: 'https://example.com',
    title: 'Test Source',
    description: 'Test description',
    domain: 'example.com',
    evidenceLevel: 'A',
    ...overrides,
  });
  
  const createMockCitation = (overrides?: Partial<CitationMeta>): CitationMeta => ({
    number: 1,
    id: `citation-${Date.now()}-${Math.random()}`,
    title: 'Test Citation',
    url: 'https://example.com',
    ...overrides,
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with empty sources and citations', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      expect(result.current.sources).toEqual([]);
      expect(result.current.citations).toEqual([]);
      expect(result.current.hasSources).toBe(false);
      expect(result.current.hasCitations).toBe(false);
      expect(result.current.totalSources).toBe(0);
      expect(result.current.totalCitations).toBe(0);
    });
    
    it('should accept deduplication option', () => {
      const { result } = renderHook(() => 
        useRAGIntegration({ enableAutoDeduplication: false })
      );
      
      // Should still initialize empty
      expect(result.current.sources).toEqual([]);
    });
  });
  
  // ============================================================================
  // SOURCE MANAGEMENT
  // ============================================================================
  
  describe('source management', () => {
    it('should add multiple sources', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const sources = [createMockSource(), createMockSource()];
      
      act(() => {
        result.current.addSources(sources);
      });
      
      expect(result.current.sources).toEqual(sources);
      expect(result.current.totalSources).toBe(2);
    });
    
    it('should add a single source', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const source = createMockSource();
      
      act(() => {
        result.current.addSource(source);
      });
      
      expect(result.current.sources).toContain(source);
      expect(result.current.totalSources).toBe(1);
    });
    
    it('should update a source by ID', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const source = createMockSource({ id: 'source-1', title: 'Original' });
      
      act(() => {
        result.current.addSource(source);
      });
      
      act(() => {
        result.current.updateSource('source-1', { title: 'Updated' });
      });
      
      expect(result.current.sources[0].title).toBe('Updated');
    });
    
    it('should clear all sources', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSources([createMockSource(), createMockSource()]);
      });
      
      expect(result.current.totalSources).toBe(2);
      
      act(() => {
        result.current.clearSources();
      });
      
      expect(result.current.sources).toEqual([]);
      expect(result.current.totalSources).toBe(0);
    });
    
    it('should get source by ID', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const source = createMockSource({ id: 'source-1' });
      
      act(() => {
        result.current.addSource(source);
      });
      
      const found = result.current.getSourceById('source-1');
      expect(found).toEqual(source);
    });
    
    it('should get source by number', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const source = createMockSource({ number: 5 });
      
      act(() => {
        result.current.addSource(source);
      });
      
      const found = result.current.getSourceByNumber(5);
      expect(found).toEqual(source);
    });
    
    it('should deduplicate sources by default', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const source1 = createMockSource({ id: 'source-1' });
      const source2 = createMockSource({ id: 'source-1' }); // Duplicate ID
      
      act(() => {
        result.current.addSource(source1);
        result.current.addSource(source2);
      });
      
      expect(result.current.totalSources).toBe(1);
    });
    
    it('should not deduplicate when disabled', () => {
      const { result } = renderHook(() => 
        useRAGIntegration({ enableAutoDeduplication: false })
      );
      const source1 = createMockSource({ id: 'source-1' });
      const source2 = createMockSource({ id: 'source-1' }); // Duplicate ID
      
      act(() => {
        result.current.addSources([source1, source2]);
      });
      
      expect(result.current.totalSources).toBe(2);
    });
  });
  
  // ============================================================================
  // CITATION MANAGEMENT
  // ============================================================================
  
  describe('citation management', () => {
    it('should add multiple citations', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const citations = [createMockCitation(), createMockCitation()];
      
      act(() => {
        result.current.addCitations(citations);
      });
      
      expect(result.current.citations).toEqual(citations);
      expect(result.current.totalCitations).toBe(2);
    });
    
    it('should add a single citation', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const citation = createMockCitation();
      
      act(() => {
        result.current.addCitation(citation);
      });
      
      expect(result.current.citations).toContain(citation);
      expect(result.current.totalCitations).toBe(1);
    });
    
    it('should clear all citations', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addCitations([createMockCitation(), createMockCitation()]);
      });
      
      expect(result.current.totalCitations).toBe(2);
      
      act(() => {
        result.current.clearCitations();
      });
      
      expect(result.current.citations).toEqual([]);
    });
    
    it('should get citation by ID', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const citation = createMockCitation({ id: 'citation-1' });
      
      act(() => {
        result.current.addCitation(citation);
      });
      
      const found = result.current.getCitationById('citation-1');
      expect(found).toEqual(citation);
    });
    
    it('should get citation by number', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const citation = createMockCitation({ number: 5 });
      
      act(() => {
        result.current.addCitation(citation);
      });
      
      const found = result.current.getCitationByNumber(5);
      expect(found).toEqual(citation);
    });
    
    it('should deduplicate citations by default', () => {
      const { result } = renderHook(() => useRAGIntegration());
      const citation1 = createMockCitation({ id: 'citation-1' });
      const citation2 = createMockCitation({ id: 'citation-1' }); // Duplicate ID
      
      act(() => {
        result.current.addCitation(citation1);
        result.current.addCitation(citation2);
      });
      
      expect(result.current.totalCitations).toBe(1);
    });
  });
  
  // ============================================================================
  // NORMALIZATION
  // ============================================================================
  
  describe('normalization', () => {
    it('should normalize raw sources', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      const rawSources = [
        { url: 'https://example.com', title: 'Test' },
        { url: 'https://test.com' },
      ];
      
      const normalized = result.current.normalizeSources(rawSources);
      
      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toHaveProperty('id');
      expect(normalized[0]).toHaveProperty('number');
      expect(normalized[1].title).toContain('Source 2');
    });
    
    it('should normalize from citations', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      const rawCitations = [
        { url: 'https://example.com', title: 'Citation 1', description: 'Test' },
        { url: 'https://test.com', title: 'Citation 2' },
      ];
      
      const normalized = result.current.normalizeFromCitations(rawCitations);
      
      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toHaveProperty('id');
      expect(normalized[0]).toHaveProperty('number');
    });
    
    it('should handle empty arrays', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      const normalized1 = result.current.normalizeSources([]);
      const normalized2 = result.current.normalizeFromCitations([]);
      
      expect(normalized1).toEqual([]);
      expect(normalized2).toEqual([]);
    });
    
    it('should handle invalid input', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      const normalized = result.current.normalizeSources(null as any);
      
      expect(normalized).toEqual([]);
    });
  });
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  describe('computed values', () => {
    it('should calculate hasSources correctly', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      expect(result.current.hasSources).toBe(false);
      
      act(() => {
        result.current.addSource(createMockSource());
      });
      
      expect(result.current.hasSources).toBe(true);
    });
    
    it('should calculate hasCitations correctly', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      expect(result.current.hasCitations).toBe(false);
      
      act(() => {
        result.current.addCitation(createMockCitation());
      });
      
      expect(result.current.hasCitations).toBe(true);
    });
    
    it('should group sources by domain', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSources([
          createMockSource({ domain: 'example.com' }),
          createMockSource({ domain: 'example.com' }),
          createMockSource({ domain: 'test.com' }),
        ]);
      });
      
      expect(result.current.sourcesByDomain['example.com']).toHaveLength(2);
      expect(result.current.sourcesByDomain['test.com']).toHaveLength(1);
    });
    
    it('should group sources by evidence level', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSources([
          createMockSource({ evidenceLevel: 'A' }),
          createMockSource({ evidenceLevel: 'A' }),
          createMockSource({ evidenceLevel: 'B' }),
          createMockSource({ evidenceLevel: 'C' }),
        ]);
      });
      
      expect(result.current.sourcesByEvidenceLevel['A']).toHaveLength(2);
      expect(result.current.sourcesByEvidenceLevel['B']).toHaveLength(1);
      expect(result.current.sourcesByEvidenceLevel['C']).toHaveLength(1);
    });
    
    it('should handle missing domain', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSource(createMockSource({ domain: undefined }));
      });
      
      expect(result.current.sourcesByDomain['unknown']).toHaveLength(1);
    });
    
    it('should handle missing evidence level', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSource(createMockSource({ evidenceLevel: undefined }));
      });
      
      expect(result.current.sourcesByEvidenceLevel['Unknown']).toHaveLength(1);
    });
  });
  
  // ============================================================================
  // INTEGRATION
  // ============================================================================
  
  describe('integration scenarios', () => {
    it('should handle full RAG workflow', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      // Step 1: Normalize raw sources
      const rawSources = [
        { url: 'https://fda.gov', title: 'FDA Guidance', domain: 'fda.gov', evidenceLevel: 'A' },
        { url: 'https://pubmed.gov', title: 'PubMed Study', domain: 'pubmed.gov', evidenceLevel: 'B' },
      ];
      
      const normalized = result.current.normalizeSources(rawSources);
      
      // Step 2: Add normalized sources
      act(() => {
        result.current.addSources(normalized);
      });
      
      expect(result.current.totalSources).toBe(2);
      
      // Step 3: Group by domain
      expect(result.current.sourcesByDomain['fda.gov']).toHaveLength(1);
      expect(result.current.sourcesByDomain['pubmed.gov']).toHaveLength(1);
      
      // Step 4: Group by evidence level
      expect(result.current.sourcesByEvidenceLevel['A']).toHaveLength(1);
      expect(result.current.sourcesByEvidenceLevel['B']).toHaveLength(1);
      
      // Step 5: Query sources
      const fdaSource = result.current.sources.find(s => s.domain === 'fda.gov');
      expect(fdaSource).toBeDefined();
      expect(fdaSource?.evidenceLevel).toBe('A');
    });
    
    it('should handle sources and citations together', () => {
      const { result } = renderHook(() => useRAGIntegration());
      
      act(() => {
        result.current.addSources([createMockSource(), createMockSource()]);
        result.current.addCitations([createMockCitation(), createMockCitation()]);
      });
      
      expect(result.current.totalSources).toBe(2);
      expect(result.current.totalCitations).toBe(2);
      expect(result.current.hasSources).toBe(true);
      expect(result.current.hasCitations).toBe(true);
    });
  });
});

