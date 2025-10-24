/**
 * Hook to map function_id to business function names
 */

'use client';

import { useState, useEffect } from 'react';

interface BusinessFunction {
  id: string;
  unique_id: string;
  department_name: string;
  description?: string;
}

export function useBusinessFunctionMap() {
  const [functionMap, setFunctionMap] = useState<Map<string, BusinessFunction>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFunctions() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/organizational-structure');
        if (!response.ok) throw new Error('Failed to fetch business functions');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to load functions');

        const functions = data.data.functions || [];
        const map = new Map<string, BusinessFunction>();

        functions.forEach((func: BusinessFunction) => {
          map.set(func.id, func);
        });

        setFunctionMap(map);
      } catch (err) {
        console.error('[useBusinessFunctionMap] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadFunctions();
  }, []);

  // Helper function to get function name by ID
  const getFunctionName = (functionId: string | null | undefined): string | null => {
    if (!functionId) return null;
    return functionMap.get(functionId)?.department_name || null;
  };

  return {
    functionMap,
    getFunctionName,
    isLoading,
    error
  };
}
