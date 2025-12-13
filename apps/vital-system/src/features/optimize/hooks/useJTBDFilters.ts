'use client';

/**
 * useJTBDFilters Hook
 *
 * Manages JTBD filtering, sorting, and URL state synchronization
 * Extracted from /optimize/jobs-to-be-done/page.tsx
 *
 * @since December 2025
 * @brand Brand Guidelines v6.0
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type JTBD } from '@/components/jtbd';

export type ViewMode = 'grid' | 'list' | 'categories';
export type SortKey = 'priority' | 'opportunity' | 'name' | 'status';
export type Priority = 'high' | 'medium' | 'low';
export type Status = 'active' | 'planned' | 'completed' | 'draft';

interface JTBDFiltersState {
  searchQuery: string;
  category: string;
  priority: string;
  status: string;
}

interface UseJTBDFiltersResult {
  // URL-driven state
  viewMode: ViewMode;
  sortKey: SortKey;

  // Local filter state
  searchQuery: string;
  selectedCategory: string;
  selectedPriority: string;
  selectedStatus: string;

  // Derived data
  filteredJTBDs: JTBD[];
  uniqueCategories: string[];

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedStatus: (status: string) => void;
  updateURL: (params: Record<string, string>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useJTBDFilters(jtbds: JTBD[]): UseJTBDFiltersResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const sortKey = (searchParams.get('sort') as SortKey) || 'priority';

  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // URL update helper
  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      const newURL = newParams.toString() ? `?${newParams.toString()}` : '';
      router.replace(`/optimize/jobs-to-be-done${newURL}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Unique categories from data
  const uniqueCategories = useMemo(() => {
    const categories = new Set(jtbds.map((j) => j.category).filter(Boolean));
    return Array.from(categories).sort() as string[];
  }, [jtbds]);

  // Memoized filtering and sorting
  const filteredJTBDs = useMemo(() => {
    let filtered = [...jtbds];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (jtbd) =>
          jtbd.job_statement.toLowerCase().includes(query) ||
          jtbd.description?.toLowerCase().includes(query) ||
          jtbd.category?.toLowerCase().includes(query) ||
          jtbd.functional_area?.toLowerCase().includes(query) ||
          jtbd.code?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.priority === selectedPriority);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((jtbd) => jtbd.status === selectedStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortKey) {
        case 'priority': {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority || 'low'] ?? 2) - (priorityOrder[b.priority || 'low'] ?? 2);
        }
        case 'opportunity':
          return (b.opportunity_score || 0) - (a.opportunity_score || 0);
        case 'name':
          return a.job_statement.localeCompare(b.job_statement);
        case 'status': {
          const statusOrder: Record<string, number> = { active: 0, planned: 1, draft: 2, completed: 3 };
          return (statusOrder[a.status || 'draft'] ?? 2) - (statusOrder[b.status || 'draft'] ?? 2);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [jtbds, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortKey]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      selectedCategory !== 'all' ||
      selectedPriority !== 'all' ||
      selectedStatus !== 'all'
    );
  }, [searchQuery, selectedCategory, selectedPriority, selectedStatus]);

  return {
    viewMode,
    sortKey,
    searchQuery,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    filteredJTBDs,
    uniqueCategories,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPriority,
    setSelectedStatus,
    updateURL,
    resetFilters,
    hasActiveFilters,
  };
}
