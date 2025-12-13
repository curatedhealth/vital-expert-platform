'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Persona, PersonaStats } from '@/components/personas/types';

interface OrgDepartment {
  id: string;
  name: string;
  department_code?: string;
}

interface UsePersonaDataResult {
  personas: Persona[];
  allDepartments: OrgDepartment[];
  stats: PersonaStats;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const defaultStats: PersonaStats = {
  total: 0,
  byRole: {},
  byDepartment: {},
  byFunction: {},
  bySeniority: {},
};

/**
 * Hook for fetching persona list data and org structure
 * Manages loading states, error handling, and stats calculation
 */
export function usePersonaData(): UsePersonaDataResult {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [allDepartments, setAllDepartments] = useState<OrgDepartment[]>([]);
  const [stats, setStats] = useState<PersonaStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPersonas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/personas');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please sign in to view personas.');
        }
        throw new Error(errorData.error || `Failed to fetch personas: ${response.statusText}`);
      }

      const data = await response.json();
      const allPersonas = data.personas || [];
      const apiStats = data.stats || {};

      setPersonas(allPersonas);

      // Calculate stats
      const byRole: Record<string, number> = {};
      const byDepartment: Record<string, number> = {};
      const byFunction: Record<string, number> = {};
      const bySeniority: Record<string, number> = {};

      allPersonas.forEach((persona: Persona) => {
        if (persona.role_slug) byRole[persona.role_slug] = (byRole[persona.role_slug] || 0) + 1;
        if (persona.department_slug) byDepartment[persona.department_slug] = (byDepartment[persona.department_slug] || 0) + 1;
        if (persona.function_slug) byFunction[persona.function_slug] = (byFunction[persona.function_slug] || 0) + 1;
        if (persona.seniority_level) bySeniority[persona.seniority_level] = (bySeniority[persona.seniority_level] || 0) + 1;
      });

      setStats({
        total: apiStats.totalPersonas || allPersonas.length,
        totalRoles: apiStats.totalRoles || Object.keys(byRole).length,
        totalDepartments: apiStats.totalDepartments || Object.keys(byDepartment).length,
        totalFunctions: apiStats.totalFunctions || Object.keys(byFunction).length,
        byRole,
        byDepartment,
        byFunction,
        bySeniority,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load personas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrgStructure = useCallback(async () => {
    try {
      const response = await fetch('/api/org-structure');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.departments) {
          setAllDepartments(data.data.departments || []);
        }
      }
    } catch {
      // Optional data - don't set error
    }
  }, []);

  useEffect(() => {
    loadPersonas();
    loadOrgStructure();
  }, [loadPersonas, loadOrgStructure]);

  return { personas, allDepartments, stats, loading, error, reload: loadPersonas };
}
