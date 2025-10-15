'use client';

import { useState, useEffect } from 'react';

export interface BusinessFunction {
  id: string;
  unique_id: string;
  department_name: string;
  description?: string;
}

export interface Department {
  id: string;
  unique_id: string;
  department_name: string;
  description?: string;
  function_id: string | null;
}

export interface Role {
  id: string;
  unique_id: string;
  role_name: string;
  description?: string;
  department_id: string | null;
  function_id: string | null;
}

export interface OrgStructure {
  functions: BusinessFunction[];
  departments: Department[];
  roles: Role[];
  departmentsByFunction: Record<string, Department[]>;
  rolesByDepartment: Record<string, Role[]>;
  rolesByFunction: Record<string, Role[]>;
}

export function useOrgStructure() {
  const [orgStructure, setOrgStructure] = useState<OrgStructure>({
    functions: [],
    departments: [],
    roles: [],
    departmentsByFunction: {},
    rolesByDepartment: {},
    rolesByFunction: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrgStructure() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/organizational-structure');

        if (!response.ok) {
          throw new Error('Failed to fetch organizational structure');
        }

        const data = await response.json();

        if (data.success && data.data) {
          setOrgStructure(data.data);
        } else {
          throw new Error(data.error || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching org structure:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrgStructure();
  }, []);

  return {
    orgStructure,
    isLoading,
    error,
  };
}
