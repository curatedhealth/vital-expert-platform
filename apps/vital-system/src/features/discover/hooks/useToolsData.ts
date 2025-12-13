'use client';

/**
 * useToolsData Hook - Brand Guidelines v6.0
 *
 * Manages tools data fetching and stats calculation
 * Extracted from /discover/tools/page.tsx
 *
 * @since December 2025
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

// Tool type from service
export interface Tool {
  id: string;
  name: string;
  code?: string;
  description?: string;
  tool_description?: string;
  category?: string;
  category_parent?: string;
  lifecycle_stage?: string;
  implementation_type?: string;
  tool_type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface ToolStats {
  total: number;
  healthcare: number;
  research: number;
  production: number;
  testing: number;
  development: number;
  langchainTools: number;
  tier1: number;
  fhir: number;
  nlp: number;
  deidentification: number;
}

const DEFAULT_STATS: ToolStats = {
  total: 0,
  healthcare: 0,
  research: 0,
  production: 0,
  testing: 0,
  development: 0,
  langchainTools: 0,
  tier1: 0,
  fhir: 0,
  nlp: 0,
  deidentification: 0,
};

interface UseToolsDataResult {
  tools: Tool[];
  stats: ToolStats;
  loading: boolean;
  error: string | null;
  loadTools: () => Promise<void>;
  refreshTools: () => Promise<void>;
}

// Filter tools based on URL params
export function filterToolsByParams(
  tools: Tool[],
  category: string | null,
  status: string | null,
  type: string | null
): Tool[] {
  let filtered = [...tools];

  if (category) {
    const categoryLower = category.toLowerCase();
    filtered = filtered.filter((t) => {
      const toolCategory = (t.category || '').toLowerCase();
      switch (categoryLower) {
        case 'healthcare':
          return (
            toolCategory.startsWith('healthcare') ||
            t.category_parent === 'Healthcare' ||
            ['edc_system', 'ctms', 'pro_registry'].includes(toolCategory)
          );
        case 'research':
          return toolCategory === 'research' || toolCategory.startsWith('research');
        case 'fhir':
          return toolCategory === 'healthcare/fhir' || toolCategory === 'fhir';
        default:
          return toolCategory.includes(categoryLower);
      }
    });
  }

  if (status) {
    filtered = filtered.filter((t) => t.lifecycle_stage === status);
  }

  if (type) {
    const typeLower = type.toLowerCase();
    filtered = filtered.filter((t) => {
      switch (typeLower) {
        case 'langchain':
          return t.implementation_type === 'langchain_tool';
        case 'api':
          return t.tool_type === 'api' || t.implementation_type === 'api';
        default:
          return (t.tool_type || '').toLowerCase() === typeLower;
      }
    });
  }

  return filtered;
}

export function useToolsData(): UseToolsDataResult {
  const [tools, setTools] = useState<Tool[]>([]);
  const [stats, setStats] = useState<ToolStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useToolsData] Loading tools...');

      const response = await fetch('/api/tools-crud');
      if (!response.ok) throw new Error('Failed to fetch tools');

      const data = await response.json();
      const allTools = data.tools || [];

      console.log('[useToolsData] Loaded', allTools.length, 'tools');

      setTools(allTools);

      // Calculate stats
      const healthcareTools = allTools.filter(
        (t: Tool) => t.category?.startsWith('Healthcare') || t.category_parent === 'Healthcare'
      );
      const researchTools = allTools.filter(
        (t: Tool) => t.category === 'Research' || t.category?.startsWith('RESEARCH')
      );

      setStats({
        total: allTools.length,
        healthcare: healthcareTools.length,
        research: researchTools.length,
        production: allTools.filter((t: Tool) => t.lifecycle_stage === 'production').length,
        testing: allTools.filter((t: Tool) => t.lifecycle_stage === 'testing').length,
        development: allTools.filter((t: Tool) => t.lifecycle_stage === 'development').length,
        langchainTools: allTools.filter((t: Tool) => t.implementation_type === 'langchain_tool').length,
        tier1: allTools.filter((t: Tool) => t.metadata?.tier === 1).length,
        fhir: allTools.filter((t: Tool) => t.category?.includes('FHIR')).length,
        nlp: allTools.filter((t: Tool) => t.category?.includes('NLP')).length,
        deidentification: allTools.filter((t: Tool) => t.category?.includes('De-identification')).length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tools';
      console.error('[useToolsData] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alias for semantic clarity
  const refreshTools = loadTools;

  // Load data on mount
  useEffect(() => {
    loadTools();
  }, [loadTools]);

  return {
    tools,
    stats,
    loading,
    error,
    loadTools,
    refreshTools,
  };
}
