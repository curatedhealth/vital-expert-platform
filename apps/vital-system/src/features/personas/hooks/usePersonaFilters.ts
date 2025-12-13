'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Persona, PersonaFiltersType } from '@/components/personas/types';

type SortKey = 'priority' | 'ai' | 'work' | 'jtbd' | 'name';

interface UsePersonaFiltersResult {
  filteredPersonas: Persona[];
  sortedPersonas: Persona[];
  filters: PersonaFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<PersonaFiltersType>>;
  sortKey: SortKey;
  setSortKey: (key: SortKey) => void;
}

const defaultFilters: PersonaFiltersType = {
  searchQuery: '',
  selectedRole: 'all',
  selectedDepartment: 'all',
  selectedFunction: 'all',
  selectedSeniority: 'all',
  selectedArchetype: 'all',
  selectedServiceLayer: 'all',
};

/**
 * Hook for filtering and sorting personas
 * Syncs with sidebar filter events and calculates priority scores
 */
export function usePersonaFilters(
  personas: Persona[],
  initialSortKey: SortKey = 'priority'
): UsePersonaFiltersResult {
  const [filters, setFilters] = useState<PersonaFiltersType>(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>(initialSortKey);

  // Sync filters with sidebar events
  useEffect(() => {
    const handleFilterChange = (e: CustomEvent) => {
      setFilters(e.detail.filters);
    };
    window.addEventListener('personas-filters-change' as any, handleFilterChange);
    return () => window.removeEventListener('personas-filters-change' as any, handleFilterChange);
  }, []);

  // Priority score calculation
  const computePriorityScore = useCallback((persona: Persona, maxJtbd: number) => {
    const ai = typeof persona.ai_readiness_score === 'number'
      ? persona.ai_readiness_score
      : typeof persona.ai_readiness_score === 'string'
        ? parseFloat(persona.ai_readiness_score)
        : 0;
    const work = typeof persona.work_complexity_score === 'number'
      ? persona.work_complexity_score
      : typeof persona.work_complexity_score === 'string'
        ? parseFloat(persona.work_complexity_score)
        : 0;
    const jtbdWeight = maxJtbd > 0 ? Math.min((persona.jtbds_count || 0) / maxJtbd, 1) : 0;
    return (ai * 0.5) + (work * 0.35) + (jtbdWeight * 0.15);
  }, []);

  // Filtered personas
  const filteredPersonas = useMemo(() => {
    let filtered = [...personas];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(persona =>
        persona.name.toLowerCase().includes(query) ||
        persona.title?.toLowerCase().includes(query) ||
        persona.tagline?.toLowerCase().includes(query) ||
        persona.derived_archetype?.toLowerCase().includes(query)
      );
    }

    if (filters.selectedRole !== 'all') {
      filtered = filtered.filter(p => p.role_id === filters.selectedRole);
    }
    if (filters.selectedDepartment !== 'all') {
      filtered = filtered.filter(p => p.department_id === filters.selectedDepartment);
    }
    if (filters.selectedFunction !== 'all') {
      filtered = filtered.filter(p => p.function_id === filters.selectedFunction);
    }
    if (filters.selectedSeniority !== 'all') {
      filtered = filtered.filter(p => p.seniority_level === filters.selectedSeniority);
    }
    if (filters.selectedArchetype && filters.selectedArchetype !== 'all') {
      filtered = filtered.filter(p => p.derived_archetype === filters.selectedArchetype);
    }
    if (filters.selectedServiceLayer && filters.selectedServiceLayer !== 'all') {
      filtered = filtered.filter(p => p.preferred_service_layer === filters.selectedServiceLayer);
    }

    return filtered;
  }, [personas, filters]);

  // Sorted personas
  const sortedPersonas = useMemo(() => {
    const maxJtbd = Math.max(...filteredPersonas.map(p => p.jtbds_count || 0), 0);
    const scored = filteredPersonas.map(p => ({
      persona: p,
      score: computePriorityScore(p, maxJtbd),
      ai: typeof p.ai_readiness_score === 'number' ? p.ai_readiness_score : parseFloat(String(p.ai_readiness_score || 0)),
      work: typeof p.work_complexity_score === 'number' ? p.work_complexity_score : parseFloat(String(p.work_complexity_score || 0)),
      jtbd: p.jtbds_count || 0,
    }));

    const comparator: Record<SortKey, (a: any, b: any) => number> = {
      priority: (a, b) => b.score - a.score,
      ai: (a, b) => b.ai - a.ai,
      work: (a, b) => b.work - a.work,
      jtbd: (a, b) => b.jtbd - a.jtbd,
      name: (a, b) => a.persona.name.localeCompare(b.persona.name),
    };

    return scored.sort(comparator[sortKey]).map(entry => entry.persona);
  }, [filteredPersonas, sortKey, computePriorityScore]);

  // Notify sidebar of filter updates
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('personas-filters-update', {
      detail: { filters, filteredCount: filteredPersonas.length },
    }));
  }, [filters, filteredPersonas.length]);

  return {
    filteredPersonas,
    sortedPersonas,
    filters,
    setFilters,
    sortKey,
    setSortKey,
  };
}
