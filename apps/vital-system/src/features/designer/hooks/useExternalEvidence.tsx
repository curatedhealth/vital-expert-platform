'use client';

/**
 * useExternalEvidence Hook - Brand Guidelines v6.0
 *
 * Manages external evidence source searching for the Knowledge Designer
 * Extracted from ConnectionsManager component in /designer/knowledge/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback } from 'react';
import {
  FlaskConical,
  Shield,
  Globe,
  HeartPulse,
  BookOpen,
} from 'lucide-react';
import type { ExternalSource } from '../types/knowledge-designer.types';

interface UseExternalEvidenceResult {
  // State
  selectedSource: string | null;
  searchQuery: string;
  searchResults: unknown | null;
  searching: boolean;
  searchError: string | null;

  // Data
  externalSources: ExternalSource[];

  // Actions
  setSelectedSource: (source: string | null) => void;
  setSearchQuery: (query: string) => void;
  handleExternalSearch: (sourceId: string) => Promise<void>;
  clearSearch: () => void;
}

// External evidence sources configuration - Brand v6.0 colors
const EXTERNAL_SOURCES_CONFIG: Omit<ExternalSource, 'icon'>[] = [
  {
    id: 'clinicaltrials',
    name: 'ClinicalTrials.gov',
    description: 'Search clinical trials by condition, intervention, or sponsor',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    status: 'connected',
    apiAvailable: true,
    searchExample: 'psoriasis biologic phase 3',
  },
  {
    id: 'fda',
    name: 'FDA Approvals',
    description: 'Search FDA OpenFDA database for drug approvals and labels',
    color: 'text-rose-600 bg-rose-100 dark:bg-rose-900',
    status: 'connected',
    apiAvailable: true,
    searchExample: 'adalimumab',
  },
  {
    id: 'ema',
    name: 'EMA (European)',
    description: 'European Medicines Agency regulatory information',
    color: 'text-sky-600 bg-sky-100 dark:bg-sky-900',
    status: 'available',
    apiAvailable: false,
    searchExample: 'Humira',
  },
  {
    id: 'who',
    name: 'WHO Essential Medicines',
    description: 'World Health Organization Essential Medicines List',
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900',
    status: 'available',
    apiAvailable: false,
    searchExample: 'metformin',
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    description: 'Search biomedical literature from NCBI/NIH',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
    status: 'connected',
    apiAvailable: true,
    searchExample: 'COVID-19 vaccine efficacy',
  },
];

// Icon mapping for sources
function getSourceIcon(sourceId: string): React.ReactNode {
  switch (sourceId) {
    case 'clinicaltrials':
      return <FlaskConical className="h-6 w-6" />;
    case 'fda':
      return <Shield className="h-6 w-6" />;
    case 'ema':
      return <Globe className="h-6 w-6" />;
    case 'who':
      return <HeartPulse className="h-6 w-6" />;
    case 'pubmed':
      return <BookOpen className="h-6 w-6" />;
    default:
      return null;
  }
}

export function useExternalEvidence(): UseExternalEvidenceResult {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Build external sources with icons
  const externalSources: ExternalSource[] = EXTERNAL_SOURCES_CONFIG.map((source) => ({
    ...source,
    icon: getSourceIcon(source.id),
  }));

  const handleExternalSearch = useCallback(
    async (sourceId: string) => {
      if (!searchQuery.trim()) return;

      setSearching(true);
      setSearchError(null);
      setSearchResults(null);

      try {
        const response = await fetch('/api/evidence/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: sourceId,
            query: searchQuery,
            maxResults: 10,
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('[useExternalEvidence] Search failed:', err);
        setSearchError(err instanceof Error ? err.message : 'Search failed');
        // Show placeholder response for demonstration
        setSearchResults({
          note: 'API endpoint not configured. Showing placeholder response.',
          source: sourceId,
          query: searchQuery,
        });
      } finally {
        setSearching(false);
      }
    },
    [searchQuery]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchError(null);
  }, []);

  const handleSourceSelect = useCallback(
    (source: string | null) => {
      setSelectedSource(source);
      clearSearch();
    },
    [clearSearch]
  );

  return {
    // State
    selectedSource,
    searchQuery,
    searchResults,
    searching,
    searchError,

    // Data
    externalSources,

    // Actions
    setSelectedSource: handleSourceSelect,
    setSearchQuery,
    handleExternalSearch,
    clearSearch,
  };
}
