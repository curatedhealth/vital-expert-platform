'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AgentFilters {
  selectedAgentLevel: string;
  selectedStatus: string;
  selectedBusinessFunction: string;
  selectedDepartment: string;
  selectedRole: string;
}

interface AgentsFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: AgentFilters;
  setFilters: (filters: AgentFilters) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const AgentsFilterContext = createContext<AgentsFilterContextType | undefined>(undefined);

export function AgentsFilterProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AgentFilters>({
    selectedAgentLevel: 'all',
    selectedStatus: 'all',
    selectedBusinessFunction: 'all',
    selectedDepartment: 'all',
    selectedRole: 'all',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <AgentsFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        viewMode,
        setViewMode,
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
