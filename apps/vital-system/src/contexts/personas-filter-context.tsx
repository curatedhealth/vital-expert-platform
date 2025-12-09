'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { PersonaFilters } from '@/components/personas/types';

interface PersonasFilterContextType {
  filters: PersonaFilters;
  setFilters: (filters: PersonaFilters) => void;
  filteredCount: number;
  totalCount: number;
  setFilteredCount: (count: number) => void;
  setTotalCount: (count: number) => void;
}

const PersonasFilterContext = createContext<PersonasFilterContextType | undefined>(undefined);

export function PersonasFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<PersonaFilters>({
    searchQuery: '',
    selectedRole: 'all',
    selectedDepartment: 'all',
    selectedFunction: 'all',
    selectedSeniority: 'all',
  });
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  return (
    <PersonasFilterContext.Provider
      value={{
        filters,
        setFilters,
        filteredCount,
        totalCount,
        setFilteredCount,
        setTotalCount,
      }}
    >
      {children}
    </PersonasFilterContext.Provider>
  );
}

export function usePersonasFilters() {
  const context = useContext(PersonasFilterContext);
  if (context === undefined) {
    throw new Error('usePersonasFilters must be used within a PersonasFilterProvider');
  }
  return context;
}

















