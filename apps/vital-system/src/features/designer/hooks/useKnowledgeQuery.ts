'use client';

/**
 * useKnowledgeQuery Hook - Brand Guidelines v6.0
 *
 * Manages search functionality for the Knowledge Designer Query tab
 * Extracted from QueryManager component in /designer/knowledge/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback } from 'react';
import type {
  SearchResult,
  SearchStrategy,
  KnowledgeDomain,
} from '../types/knowledge-designer.types';

interface SearchStats {
  time: number;
  strategy: SearchStrategy;
}

interface UseKnowledgeQueryResult {
  // State
  query: string;
  strategy: SearchStrategy;
  selectedDomain: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searchStats: SearchStats | null;

  // Actions
  setQuery: (query: string) => void;
  setStrategy: (strategy: SearchStrategy) => void;
  setSelectedDomain: (domain: string) => void;
  handleSearch: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;

  // Helpers
  getScoreColor: (score: number) => string;
  resultsToCitations: (results: SearchResult[]) => {
    id: string;
    type: 'knowledge-base';
    title: string;
    source: string;
    url: string;
    relevance: number;
    date?: string;
  }[];
}

export function useKnowledgeQuery(
  domains: KnowledgeDomain[] = []
): UseKnowledgeQueryResult {
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState<SearchStrategy>('hybrid');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);

  // Convert SearchResult to Citation format for CitationDisplay
  const resultsToCitations = useCallback((searchResults: SearchResult[]) => {
    return searchResults.map((result, idx) => ({
      id: result.chunk_id || `result-${idx}`,
      type: 'knowledge-base' as const,
      title: result.source_title || `Document Chunk ${idx + 1}`,
      source: result.domain || 'Knowledge Base',
      url: `/knowledge/documents/${result.document_id}`,
      relevance: result.scores.combined,
      date: (result.metadata?.uploadedAt as string) || undefined,
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/knowledge/hybrid-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: query,
          domain: selectedDomain || undefined,
          strategy,
          maxResults: 20,
          similarityThreshold: 0.6,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchStats({
        time: Date.now() - startTime,
        strategy,
      });
    } catch (err) {
      console.error('[useKnowledgeQuery] Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedDomain, strategy]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  const getScoreColor = useCallback((score: number) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-amber-500';
    return 'bg-orange-500';
  }, []);

  return {
    // State
    query,
    strategy,
    selectedDomain,
    results,
    loading,
    error,
    searchStats,

    // Actions
    setQuery,
    setStrategy,
    setSelectedDomain,
    handleSearch,
    handleKeyPress,

    // Helpers
    getScoreColor,
    resultsToCitations,
  };
}
