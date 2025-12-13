'use client';

/**
 * usePromptsData Hook - Brand Guidelines v6.0
 *
 * Manages prompt data fetching, stats calculation, and filtering
 * Extracted from /prompts/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Prompt } from '@/lib/forms/schemas';
import type { VitalAsset } from '@vital/ai-ui';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { getSuiteByCode, type SubSuite } from '../components';

// Complexity badges with Brand v6.0 colors
export const COMPLEXITY_BADGES: Record<
  string,
  { color: string; bgColor: string; icon: typeof CheckCircle2; label: string }
> = {
  basic: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle2, label: 'Basic' },
  intermediary: { color: 'text-sky-700', bgColor: 'bg-sky-100', icon: Clock, label: 'Intermediary' },
  intermediate: { color: 'text-sky-700', bgColor: 'bg-sky-100', icon: Clock, label: 'Intermediate' },
  advanced: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Zap, label: 'Advanced' },
  expert: { color: 'text-rose-700', bgColor: 'bg-rose-100', icon: AlertCircle, label: 'Expert' },
};

export interface PromptStats {
  total: number;
  active: number;
  validated: number;
  ragEnabled: number;
  bySuite: Record<string, number>;
  byComplexity: Record<string, number>;
}

interface UsePromptsDataResult {
  // Data
  prompts: Prompt[];
  subSuites: SubSuite[];
  stats: PromptStats;
  assets: VitalAsset[];

  // Loading state
  loading: boolean;
  error: string | null;

  // Actions
  loadPrompts: () => Promise<void>;

  // Filtering
  filterPromptsByParams: (
    suite: string | null,
    subSuite: string | null,
    complexity: string | null,
    status: string | null,
    search: string | null
  ) => Prompt[];
}

// Convert prompt to VitalAsset format
export function promptToAsset(prompt: Prompt): VitalAsset {
  const suiteConfig = getSuiteByCode(prompt.suite?.replace('™', '') || null);
  const complexity = prompt.complexity || prompt.complexity_level || 'basic';
  const complexityConfig = COMPLEXITY_BADGES[complexity] || COMPLEXITY_BADGES.basic;

  return {
    id: prompt.id || '',
    name: prompt.display_name || prompt.title || prompt.name,
    slug: prompt.id || '',
    asset_type: 'prompt',
    description: prompt.description || '',
    category: prompt.suite || prompt.domain || 'General',
    lifecycle_stage: prompt.status || 'active',
    is_active: prompt.is_active ?? true,
    created_at: prompt.created_at,
    updated_at: prompt.updated_at,
    metadata: {
      suite: prompt.suite,
      sub_suite: prompt.sub_suite,
      complexity,
      expert_validated: prompt.expert_validated,
      rag_enabled: prompt.rag_enabled,
      tags: prompt.tags,
      suiteIcon: suiteConfig?.icon,
      suiteColor: suiteConfig?.color,
      complexityLabel: complexityConfig.label,
      complexityColor: complexityConfig.bgColor,
    },
  } as VitalAsset;
}

// Filter prompts based on params
export function filterPromptsByParams(
  prompts: Prompt[],
  suite: string | null,
  subSuite: string | null,
  complexity: string | null,
  status: string | null
): Prompt[] {
  let filtered = [...prompts];

  if (suite) {
    const suiteWithTM = suite.includes('™') ? suite : suite + '™';
    filtered = filtered.filter((p) => {
      const promptSuite = p.suite || '';
      return promptSuite === suiteWithTM || promptSuite === suite || promptSuite.replace('™', '') === suite;
    });
  }

  if (subSuite) {
    filtered = filtered.filter((p) => p.sub_suite === subSuite);
  }

  if (complexity) {
    filtered = filtered.filter((p) => {
      const promptComplexity = p.complexity || p.complexity_level || 'basic';
      return promptComplexity === complexity;
    });
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status || (status === 'active' && p.is_active));
  }

  return filtered;
}

// Apply search filter
export function applySearchFilter(prompts: Prompt[], search: string | null): Prompt[] {
  if (!search) return prompts;
  const query = search.toLowerCase();
  return prompts.filter(p =>
    (p.display_name || p.name || '').toLowerCase().includes(query) ||
    (p.description || '').toLowerCase().includes(query) ||
    (p.tags || []).some(tag => tag.toLowerCase().includes(query))
  );
}

export function usePromptsData(): UsePromptsDataResult {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [subSuites, setSubSuites] = useState<SubSuite[]>([]);
  const [stats, setStats] = useState<PromptStats>({
    total: 0,
    active: 0,
    validated: 0,
    ragEnabled: 0,
    bySuite: {},
    byComplexity: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load prompts
      const response = await fetch('/api/prompts-crud?showAll=true');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      const allPrompts = data.prompts || [];
      setPrompts(allPrompts);

      // Try to load sub-suites from PRISM API
      try {
        const prismResponse = await fetch('/api/prism');
        if (prismResponse.ok) {
          const prismData = await prismResponse.json();
          if (prismData.subSuites) {
            setSubSuites(prismData.subSuites);
          }
        }
      } catch {
        // Sub-suites are optional
      }

      // Calculate stats
      const bySuite: Record<string, number> = {};
      const byComplexity: Record<string, number> = {};

      allPrompts.forEach((prompt: Prompt) => {
        const suite = prompt.suite || 'Unknown';
        bySuite[suite] = (bySuite[suite] || 0) + 1;

        const complexity = prompt.complexity || prompt.complexity_level || 'basic';
        byComplexity[complexity] = (byComplexity[complexity] || 0) + 1;
      });

      setStats({
        total: allPrompts.length,
        active: allPrompts.filter((p: Prompt) => p.is_active !== false).length,
        validated: allPrompts.filter((p: Prompt) => p.expert_validated).length,
        ragEnabled: allPrompts.filter((p: Prompt) => p.rag_enabled).length,
        bySuite,
        byComplexity,
      });
    } catch (err) {
      console.error('[usePromptsData] Error loading prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Convert all prompts to assets
  const assets = useMemo(() => prompts.map(promptToAsset), [prompts]);

  // Create a filtering function that applies all filters
  const filterByParams = useCallback(
    (
      suite: string | null,
      subSuite: string | null,
      complexity: string | null,
      status: string | null,
      search: string | null
    ) => {
      const filtered = filterPromptsByParams(prompts, suite, subSuite, complexity, status);
      return applySearchFilter(filtered, search);
    },
    [prompts]
  );

  return {
    prompts,
    subSuites,
    stats,
    assets,
    loading,
    error,
    loadPrompts,
    filterPromptsByParams: filterByParams,
  };
}
