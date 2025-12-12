/**
 * useAssetFilters - Shared hook for URL-based asset filtering
 *
 * Used by: Tools, Skills, Prompts, Workflows pages
 */
'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type ViewMode = 'overview' | 'grid' | 'list' | 'table' | 'kanban';

export interface UseAssetFiltersOptions {
  basePath: string;
  filterKeys?: string[];
}

export interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

export interface UseAssetFiltersReturn {
  // View mode
  viewParam: ViewMode | null;
  isOverviewMode: boolean;
  handleViewModeChange: (mode: ViewMode) => void;

  // Search
  searchParam: string | null;
  handleSearchChange: (value: string) => void;

  // Filters
  getFilterParam: (key: string) => string | null;
  activeFilters: ActiveFilter[];
  removeFilter: (key: string) => void;
  clearAllFilters: () => void;
  setFilter: (key: string, value: string) => void;

  // URL helpers
  buildUrl: (params: Record<string, string | null>) => string;
}

export function useAssetFilters({
  basePath,
  filterKeys = [],
}: UseAssetFiltersOptions): UseAssetFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View mode
  const viewParam = searchParams.get('view') as ViewMode | null;
  const isOverviewMode = !viewParam || viewParam === 'overview';

  // Search
  const searchParam = searchParams.get('search');

  // Get filter param
  const getFilterParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  // Build active filters array
  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];
    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        // Capitalize first letter for label
        const label = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        filters.push({ key, value, label });
      }
    });
    return filters;
  }, [searchParams, filterKeys]);

  // Build URL with params
  const buildUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      const queryString = newParams.toString();
      return `${basePath}${queryString ? '?' + queryString : ''}`;
    },
    [basePath, searchParams]
  );

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      router.push(buildUrl({ view: mode }));
    },
    [router, buildUrl]
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (value: string) => {
      router.push(buildUrl({ search: value || null }));
    },
    [router, buildUrl]
  );

  // Remove a single filter
  const removeFilter = useCallback(
    (key: string) => {
      router.push(buildUrl({ [key]: null }));
    },
    [router, buildUrl]
  );

  // Clear all filters (keep view mode)
  const clearAllFilters = useCallback(() => {
    const params: Record<string, string | null> = {};
    filterKeys.forEach((key) => {
      params[key] = null;
    });
    params.search = null;
    router.push(buildUrl(params));
  }, [router, buildUrl, filterKeys]);

  // Set a filter
  const setFilter = useCallback(
    (key: string, value: string) => {
      router.push(buildUrl({ [key]: value }));
    },
    [router, buildUrl]
  );

  return {
    viewParam,
    isOverviewMode,
    handleViewModeChange,
    searchParam,
    handleSearchChange,
    getFilterParam,
    activeFilters,
    removeFilter,
    clearAllFilters,
    setFilter,
    buildUrl,
  };
}

export default useAssetFilters;
