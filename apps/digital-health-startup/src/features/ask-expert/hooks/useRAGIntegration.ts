/**
 * useRAGIntegration Hook
 * 
 * Manages RAG (Retrieval Augmented Generation) integration
 * - Source retrieval and management
 * - Citation tracking
 * - Evidence level tracking
 * - Source deduplication
 * 
 * @extracted from ask-expert/page.tsx
 */

import { useState, useCallback, useMemo } from 'react';
import type { Source, CitationMeta } from '../types';
import { normalizeSourceRecord, normalizeSourcesFromCitations, deduplicateByKey } from '../utils';

export interface UseRAGIntegrationOptions {
  enableAutoDeduplication?: boolean;
}

export interface UseRAGIntegrationReturn {
  // Sources
  sources: Source[];
  addSources: (sources: Source[]) => void;
  addSource: (source: Source) => void;
  updateSource: (sourceId: string, updates: Partial<Source>) => void;
  clearSources: () => void;
  getSourceById: (id: string) => Source | undefined;
  getSourceByNumber: (number: number) => Source | undefined;
  
  // Citations
  citations: CitationMeta[];
  addCitations: (citations: CitationMeta[]) => void;
  addCitation: (citation: CitationMeta) => void;
  clearCitations: () => void;
  getCitationById: (id: string) => CitationMeta | undefined;
  getCitationByNumber: (number: number | string) => CitationMeta | undefined;
  
  // Normalization
  normalizeSources: (rawSources: any[]) => Source[];
  normalizeFromCitations: (rawCitations: any[]) => Source[];
  
  // Metadata
  totalSources: number;
  totalCitations: number;
  hasSources: boolean;
  hasCitations: boolean;
  sourcesByDomain: Record<string, Source[]>;
  sourcesByEvidenceLevel: Record<string, Source[]>;
}

/**
 * Custom hook for managing RAG integration
 */
export function useRAGIntegration(
  options: UseRAGIntegrationOptions = {}
): UseRAGIntegrationReturn {
  const { enableAutoDeduplication = true } = options;
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [sources, setSources] = useState<Source[]>([]);
  const [citations, setCitations] = useState<CitationMeta[]>([]);
  
  // ============================================================================
  // SOURCE MANAGEMENT
  // ============================================================================
  
  /**
   * Add multiple sources
   */
  const addSources = useCallback(
    (newSources: Source[]) => {
      setSources(prev => {
        const combined = [...prev, ...newSources];
        return enableAutoDeduplication
          ? deduplicateByKey(combined, 'id')
          : combined;
      });
    },
    [enableAutoDeduplication]
  );
  
  /**
   * Add a single source
   */
  const addSource = useCallback(
    (source: Source) => {
      setSources(prev => {
        // Check for duplicates
        if (enableAutoDeduplication && prev.some(s => s.id === source.id)) {
          return prev;
        }
        return [...prev, source];
      });
    },
    [enableAutoDeduplication]
  );
  
  /**
   * Update a source by ID
   */
  const updateSource = useCallback(
    (sourceId: string, updates: Partial<Source>) => {
      setSources(prev =>
        prev.map(source =>
          source.id === sourceId ? { ...source, ...updates } : source
        )
      );
    },
    []
  );
  
  /**
   * Clear all sources
   */
  const clearSources = useCallback(() => {
    setSources([]);
  }, []);
  
  /**
   * Get a source by ID
   */
  const getSourceById = useCallback(
    (id: string): Source | undefined => {
      return sources.find(source => source.id === id);
    },
    [sources]
  );
  
  /**
   * Get a source by number
   */
  const getSourceByNumber = useCallback(
    (number: number): Source | undefined => {
      return sources.find(source => source.number === number);
    },
    [sources]
  );
  
  // ============================================================================
  // CITATION MANAGEMENT
  // ============================================================================
  
  /**
   * Add multiple citations
   */
  const addCitations = useCallback(
    (newCitations: CitationMeta[]) => {
      setCitations(prev => {
        const combined = [...prev, ...newCitations];
        return enableAutoDeduplication
          ? deduplicateByKey(combined, 'id')
          : combined;
      });
    },
    [enableAutoDeduplication]
  );
  
  /**
   * Add a single citation
   */
  const addCitation = useCallback(
    (citation: CitationMeta) => {
      setCitations(prev => {
        // Check for duplicates
        if (enableAutoDeduplication && prev.some(c => c.id === citation.id)) {
          return prev;
        }
        return [...prev, citation];
      });
    },
    [enableAutoDeduplication]
  );
  
  /**
   * Clear all citations
   */
  const clearCitations = useCallback(() => {
    setCitations([]);
  }, []);
  
  /**
   * Get a citation by ID
   */
  const getCitationById = useCallback(
    (id: string): CitationMeta | undefined => {
      return citations.find(citation => citation.id === id);
    },
    [citations]
  );
  
  /**
   * Get a citation by number
   */
  const getCitationByNumber = useCallback(
    (number: number | string): CitationMeta | undefined => {
      return citations.find(citation => citation.number === number);
    },
    [citations]
  );
  
  // ============================================================================
  // NORMALIZATION
  // ============================================================================
  
  /**
   * Normalize raw sources to Source objects
   */
  const normalizeSources = useCallback((rawSources: any[]): Source[] => {
    if (!Array.isArray(rawSources)) return [];
    return rawSources.map((source, idx) => normalizeSourceRecord(source, idx));
  }, []);
  
  /**
   * Normalize sources from citations
   */
  const normalizeFromCitations = useCallback(
    (rawCitations: any[]): Source[] => {
      return normalizeSourcesFromCitations(rawCitations);
    },
    []
  );
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const totalSources = useMemo(() => sources.length, [sources]);
  const totalCitations = useMemo(() => citations.length, [citations]);
  const hasSources = useMemo(() => sources.length > 0, [sources]);
  const hasCitations = useMemo(() => citations.length > 0, [citations]);
  
  /**
   * Group sources by domain
   */
  const sourcesByDomain = useMemo(() => {
    const grouped: Record<string, Source[]> = {};
    sources.forEach(source => {
      const domain = source.domain || 'unknown';
      if (!grouped[domain]) {
        grouped[domain] = [];
      }
      grouped[domain].push(source);
    });
    return grouped;
  }, [sources]);
  
  /**
   * Group sources by evidence level
   */
  const sourcesByEvidenceLevel = useMemo(() => {
    const grouped: Record<string, Source[]> = {};
    sources.forEach(source => {
      const level = source.evidenceLevel || 'Unknown';
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(source);
    });
    return grouped;
  }, [sources]);
  
  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Sources
    sources,
    addSources,
    addSource,
    updateSource,
    clearSources,
    getSourceById,
    getSourceByNumber,
    
    // Citations
    citations,
    addCitations,
    addCitation,
    clearCitations,
    getCitationById,
    getCitationByNumber,
    
    // Normalization
    normalizeSources,
    normalizeFromCitations,
    
    // Metadata
    totalSources,
    totalCitations,
    hasSources,
    hasCitations,
    sourcesByDomain,
    sourcesByEvidenceLevel,
  };
}


