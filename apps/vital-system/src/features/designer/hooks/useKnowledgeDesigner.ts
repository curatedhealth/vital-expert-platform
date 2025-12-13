'use client';

/**
 * useKnowledgeDesigner Hook - Brand Guidelines v6.0
 *
 * Manages data fetching, state management, and actions for the Knowledge Designer
 * Extracted from /designer/knowledge/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  KnowledgeDomain,
  KnowledgeDocument,
  KnowledgeStats,
  KnowledgeDesignerTab,
} from '../types/knowledge-designer.types';

interface UseKnowledgeDesignerResult {
  // Data state
  domains: KnowledgeDomain[];
  documents: KnowledgeDocument[];
  stats: KnowledgeStats;
  loading: boolean;
  error: string | null;

  // UI state
  activeTab: KnowledgeDesignerTab;
  selectedDomain: KnowledgeDomain | null;

  // Actions
  fetchData: () => Promise<void>;
  handleTabChange: (tab: string) => void;
  setSelectedDomain: (domain: KnowledgeDomain | null) => void;
  handleUploadComplete: () => void;
}

const DEFAULT_STATS: KnowledgeStats = {
  totalDomains: 0,
  totalDocuments: 0,
  totalChunks: 0,
  recentUploads: 0,
};

export function useKnowledgeDesigner(): UseKnowledgeDesignerResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as KnowledgeDesignerTab) || 'overview';

  // Data state
  const [domains, setDomains] = useState<KnowledgeDomain[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | null>(null);

  // Fetch all data (domains + documents)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch domains and documents in parallel
      const [domainsResponse, documentsResponse] = await Promise.all([
        fetch('/api/knowledge-domains'),
        fetch('/api/knowledge/documents'),
      ]);

      // Process domains
      let rawDomains: { id: string; name: string }[] = [];
      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        rawDomains = domainsData.domains || [];
      }

      // Process documents
      let rawDocuments: KnowledgeDocument[] = [];
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        if (documentsData.success) {
          rawDocuments = documentsData.documents || [];
        }
      }

      // Calculate document counts per domain
      const domainCounts: Record<string, number> = {};
      rawDocuments.forEach((doc) => {
        const domainKey = doc.domain || 'unassigned';
        domainCounts[domainKey] = (domainCounts[domainKey] || 0) + 1;
      });

      // Build enhanced domain objects
      const enhancedDomains: KnowledgeDomain[] = rawDomains.map((d, index) => ({
        domain_id: d.id || d.name,
        domain_name: d.name,
        description: `Knowledge domain for ${d.name}`,
        tier: index < 3 ? 1 : index < 8 ? 2 : 3, // Auto-assign tiers based on order
        priority: index + 1,
        document_count: domainCounts[d.name] || 0,
        is_active: true,
        function_name: 'General',
        embedding_model: 'text-embedding-3-small',
      }));

      // Add domains discovered from documents (not in domain list)
      const existingDomainNames = new Set(rawDomains.map((d) => d.name));
      Object.keys(domainCounts).forEach((domainName) => {
        if (!existingDomainNames.has(domainName) && domainName !== 'unassigned') {
          enhancedDomains.push({
            domain_id: domainName,
            domain_name: domainName,
            description: `Auto-discovered domain from documents`,
            tier: 3,
            priority: enhancedDomains.length + 1,
            document_count: domainCounts[domainName],
            is_active: true,
            function_name: 'Discovered',
            embedding_model: 'text-embedding-3-small',
          });
        }
      });

      // Calculate stats
      const totalChunks = rawDocuments.reduce((sum, doc) => sum + (doc.chunks || 0), 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = rawDocuments.filter(
        (doc) => new Date(doc.uploadedAt) > sevenDaysAgo
      ).length;

      setDomains(enhancedDomains);
      setDocuments(rawDocuments);
      setStats({
        totalDomains: enhancedDomains.length,
        totalDocuments: rawDocuments.length,
        totalChunks,
        recentUploads,
      });
    } catch (err) {
      console.error('[useKnowledgeDesigner] Failed to fetch knowledge data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle tab change (accepts string for Tabs compatibility)
  const handleTabChange = useCallback(
    (tab: string) => {
      router.push(`/designer/knowledge?tab=${tab}`);
    },
    [router]
  );

  // Handle upload complete
  const handleUploadComplete = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data state
    domains,
    documents,
    stats,
    loading,
    error,

    // UI state
    activeTab,
    selectedDomain,

    // Actions
    fetchData,
    handleTabChange,
    setSelectedDomain,
    handleUploadComplete,
  };
}
