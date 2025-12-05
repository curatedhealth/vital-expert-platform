'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// ============================================================================
// TYPES
// ============================================================================

// Legacy single-select interface (for backward compatibility)
interface AgentFilters {
  selectedAgentLevel: string;
  selectedStatus: string;
  selectedBusinessFunction: string;
  selectedDepartment: string;
  selectedRole: string;
}

// New multi-select interface
interface AgentMultiFilters {
  levels: Set<string>;
  statuses: Set<string>;
  functions: Set<string>;
  departments: Set<string>;
  roles: Set<string>;
}

interface AgentsFilterContextType {
  // Search (immediate for input display)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Debounced search query (for filtering - 300ms delay)
  debouncedSearchQuery: string;

  // Legacy single-select interface (for backward compatibility with AgentsBoard)
  filters: AgentFilters;
  setFilters: (filters: AgentFilters) => void;

  // New multi-select interface
  multiFilters: AgentMultiFilters;
  setFunctions: (selected: Set<string>) => void;
  setDepartments: (selected: Set<string>) => void;
  setRoles: (selected: Set<string>) => void;
  setLevels: (selected: Set<string>) => void;
  setStatuses: (selected: Set<string>) => void;

  // View mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Clear
  clearFilters: () => void;
  activeFilterCount: number;
}

// ============================================================================
// HELPERS
// ============================================================================

// Convert Set to comma-separated URL param
function setToParam(set: Set<string>): string | null {
  if (set.size === 0) return null;
  return Array.from(set).join(',');
}

// Convert comma-separated URL param to Set
function paramToSet(param: string | null): Set<string> {
  if (!param) return new Set();
  return new Set(param.split(',').filter(Boolean));
}

// ============================================================================
// CONTEXT
// ============================================================================

const AgentsFilterContext = createContext<AgentsFilterContextType | undefined>(undefined);

export function AgentsFilterProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search state: immediate for input, debounced for filtering
  const [searchQuery, setSearchQueryInternal] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-select filter state using Sets
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());

  // Debounced URL update for search
  const updateSearchUrl = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    const newUrl = params.toString() ? `/agents?${params.toString()}` : '/agents';
    router.push(newUrl, { scroll: false });
    // Update debounced value after URL update
    setDebouncedSearchQuery(query);
  }, 300);

  // Set search query with debouncing
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryInternal(query); // Immediate update for input
    updateSearchUrl(query); // Debounced update for filtering & URL
  }, [updateSearchUrl]);

  // Sync filters from URL params on mount and when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('q') || '';
    setSearchQueryInternal(urlSearch);
    setDebouncedSearchQuery(urlSearch);
    setSelectedLevels(paramToSet(searchParams.get('levels')));
    setSelectedFunctions(paramToSet(searchParams.get('functions')));
    setSelectedDepartments(paramToSet(searchParams.get('departments')));
    setSelectedRoles(paramToSet(searchParams.get('roles')));
    setSelectedStatuses(paramToSet(searchParams.get('statuses')));
  }, [searchParams]);

  // Update URL when filters change
  const updateUrl = useCallback((updates: Partial<AgentMultiFilters>) => {
    const params = new URLSearchParams(searchParams.toString());

    const newFunctions = updates.functions ?? selectedFunctions;
    const newDepartments = updates.departments ?? selectedDepartments;
    const newRoles = updates.roles ?? selectedRoles;
    const newLevels = updates.levels ?? selectedLevels;
    const newStatuses = updates.statuses ?? selectedStatuses;

    const functionsParam = setToParam(newFunctions);
    const departmentsParam = setToParam(newDepartments);
    const rolesParam = setToParam(newRoles);
    const levelsParam = setToParam(newLevels);
    const statusesParam = setToParam(newStatuses);

    if (functionsParam) params.set('functions', functionsParam);
    else params.delete('functions');

    if (departmentsParam) params.set('departments', departmentsParam);
    else params.delete('departments');

    if (rolesParam) params.set('roles', rolesParam);
    else params.delete('roles');

    if (levelsParam) params.set('levels', levelsParam);
    else params.delete('levels');

    if (statusesParam) params.set('statuses', statusesParam);
    else params.delete('statuses');

    const newUrl = params.toString() ? `/agents?${params.toString()}` : '/agents';
    router.push(newUrl, { scroll: false });
  }, [searchParams, router, selectedFunctions, selectedDepartments, selectedRoles, selectedLevels, selectedStatuses]);

  // Multi-select setters
  const setFunctions = useCallback((selected: Set<string>) => {
    setSelectedFunctions(selected);
    updateUrl({ functions: selected });
  }, [updateUrl]);

  const setDepartments = useCallback((selected: Set<string>) => {
    setSelectedDepartments(selected);
    updateUrl({ departments: selected });
  }, [updateUrl]);

  const setRoles = useCallback((selected: Set<string>) => {
    setSelectedRoles(selected);
    updateUrl({ roles: selected });
  }, [updateUrl]);

  const setLevels = useCallback((selected: Set<string>) => {
    setSelectedLevels(selected);
    updateUrl({ levels: selected });
  }, [updateUrl]);

  const setStatuses = useCallback((selected: Set<string>) => {
    setSelectedStatuses(selected);
    updateUrl({ statuses: selected });
  }, [updateUrl]);

  // Multi-select interface
  const multiFilters: AgentMultiFilters = useMemo(() => ({
    levels: selectedLevels,
    statuses: selectedStatuses,
    functions: selectedFunctions,
    departments: selectedDepartments,
    roles: selectedRoles,
  }), [selectedLevels, selectedStatuses, selectedFunctions, selectedDepartments, selectedRoles]);

  // Legacy single-select interface (converts first selected item or 'all')
  const filters: AgentFilters = useMemo(() => ({
    selectedAgentLevel: selectedLevels.size > 0 ? Array.from(selectedLevels)[0] : 'all',
    selectedStatus: selectedStatuses.size > 0 ? Array.from(selectedStatuses)[0] : 'all',
    selectedBusinessFunction: selectedFunctions.size > 0 ? Array.from(selectedFunctions)[0] : 'all',
    selectedDepartment: selectedDepartments.size > 0 ? Array.from(selectedDepartments)[0] : 'all',
    selectedRole: selectedRoles.size > 0 ? Array.from(selectedRoles)[0] : 'all',
  }), [selectedLevels, selectedStatuses, selectedFunctions, selectedDepartments, selectedRoles]);

  // Legacy setFilters (for backward compatibility)
  const setFilters = useCallback((newFilters: AgentFilters) => {
    const newFunctions = newFilters.selectedBusinessFunction !== 'all'
      ? new Set([newFilters.selectedBusinessFunction])
      : new Set<string>();
    const newDepartments = newFilters.selectedDepartment !== 'all'
      ? new Set([newFilters.selectedDepartment])
      : new Set<string>();
    const newRoles = newFilters.selectedRole !== 'all'
      ? new Set([newFilters.selectedRole])
      : new Set<string>();
    const newLevels = newFilters.selectedAgentLevel !== 'all'
      ? new Set([newFilters.selectedAgentLevel])
      : new Set<string>();
    const newStatuses = newFilters.selectedStatus !== 'all'
      ? new Set([newFilters.selectedStatus])
      : new Set<string>();

    setSelectedFunctions(newFunctions);
    setSelectedDepartments(newDepartments);
    setSelectedRoles(newRoles);
    setSelectedLevels(newLevels);
    setSelectedStatuses(newStatuses);

    updateUrl({
      functions: newFunctions,
      departments: newDepartments,
      roles: newRoles,
      levels: newLevels,
      statuses: newStatuses,
    });
  }, [updateUrl]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedFunctions(new Set());
    setSelectedDepartments(new Set());
    setSelectedRoles(new Set());
    setSelectedLevels(new Set());
    setSelectedStatuses(new Set());
    setSearchQueryInternal('');
    setDebouncedSearchQuery('');
    router.push('/agents', { scroll: false });
  }, [router]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return selectedFunctions.size +
           selectedDepartments.size +
           selectedRoles.size +
           selectedLevels.size +
           selectedStatuses.size;
  }, [selectedFunctions, selectedDepartments, selectedRoles, selectedLevels, selectedStatuses]);

  return (
    <AgentsFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        debouncedSearchQuery,
        filters,
        setFilters,
        multiFilters,
        setFunctions,
        setDepartments,
        setRoles,
        setLevels,
        setStatuses,
        viewMode,
        setViewMode,
        clearFilters,
        activeFilterCount,
      }}
    >
      {children}
    </AgentsFilterContext.Provider>
  );
}

export function useAgentsFilter() {
  const context = useContext(AgentsFilterContext);
  if (context === undefined) {
    throw new Error('useAgentsFilter must be used within an AgentsFilterProvider');
  }
  return context;
}
