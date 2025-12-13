'use client';

/**
 * useJTBDData Hook
 *
 * Manages JTBD data fetching and stats calculation
 * Extracted from /optimize/jobs-to-be-done/page.tsx
 *
 * @since December 2025
 * @brand Brand Guidelines v6.0
 */

import { useState, useCallback, useEffect } from 'react';
import { type JTBD, type JTBDStats } from '@/components/jtbd';

const DEFAULT_STATS: JTBDStats = {
  total: 0,
  byCategory: {},
  byPriority: { high: 0, medium: 0, low: 0 },
  byStatus: { active: 0, planned: 0, completed: 0, draft: 0 },
  byComplexity: {},
  byJobCategory: {},
  byOdiTier: {},
  avgOpportunityScore: 0,
};

interface UseJTBDDataResult {
  jtbds: JTBD[];
  stats: JTBDStats;
  loading: boolean;
  error: string | null;
  loadJTBDs: () => Promise<void>;
  refreshJTBDs: () => Promise<void>;
}

export function useJTBDData(): UseJTBDDataResult {
  const [jtbds, setJTBDs] = useState<JTBD[]>([]);
  const [stats, setStats] = useState<JTBDStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJTBDs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useJTBDData] Loading jobs-to-be-done...');

      const response = await fetch('/api/jtbd');

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBD: ${response.statusText}`);
      }

      const data = await response.json();
      const allJTBDs = data.jtbd || [];
      const apiStats = data.stats || {};

      console.log('[useJTBDData] Loaded', allJTBDs.length, 'jobs-to-be-done');

      setJTBDs(allJTBDs);
      setStats({
        total: apiStats.total || allJTBDs.length,
        byCategory: apiStats.byCategory || {},
        byPriority: apiStats.byPriority || { high: 0, medium: 0, low: 0 },
        byStatus: apiStats.byStatus || { active: 0, planned: 0, completed: 0, draft: 0 },
        byComplexity: apiStats.byComplexity || {},
        byJobCategory: apiStats.byJobCategory || {},
        byOdiTier: apiStats.byOdiTier || {},
        avgOpportunityScore: apiStats.avgOpportunityScore || 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load JTBD data';
      console.error('[useJTBDData] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias for semantic clarity
  const refreshJTBDs = loadJTBDs;

  // Load data on mount
  useEffect(() => {
    loadJTBDs();
  }, [loadJTBDs]);

  return {
    jtbds,
    stats,
    loading,
    error,
    loadJTBDs,
    refreshJTBDs,
  };
}
