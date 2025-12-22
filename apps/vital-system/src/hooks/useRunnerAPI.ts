// PRODUCTION_TAG: PRODUCTION_READY
// LAST_VERIFIED: 2025-12-19
// PURPOSE: React hooks for VITAL Runners API (88 task + 8 family runners)

'use client';

import { useCallback, useMemo } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import type {
  RunnerInfo,
  RunnerListResponse,
  RunnerDetailResponse,
  RunnerExecuteRequest,
  RunnerExecuteResponse,
  JTBDRunnerMapping,
  JTBDRunnerMatrix,
  FamilyRunnerInfo,
  JTBDLevel,
  JobStep,
  RunnerCategory,
} from '@/types/runners';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000';

const DEFAULT_SWR_CONFIG: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
};

// =============================================================================
// Fetcher Functions
// =============================================================================

async function fetcher<T>(url: string, tenantId: string = 'default'): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

async function postFetcher<T, R>(
  url: string,
  data: T,
  tenantId: string = 'default'
): Promise<R> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

// =============================================================================
// List Hooks
// =============================================================================

/**
 * List all runners with optional filtering.
 *
 * @param options - Filter options (runner_type, category)
 * @param tenantId - Tenant identifier
 * @returns SWR response with runner list
 *
 * @example
 * const { data, isLoading, error } = useRunnerList({ runner_type: 'task' });
 */
export function useRunnerList(
  options?: {
    runner_type?: 'task' | 'family' | 'orchestrator';
    category?: string;
  },
  tenantId: string = 'default'
) {
  const params = new URLSearchParams();
  if (options?.runner_type) params.set('runner_type', options.runner_type);
  if (options?.category) params.set('category', options.category);

  const queryString = params.toString();
  const url = `${API_BASE}/api/runners/list${queryString ? `?${queryString}` : ''}`;

  return useSWR<RunnerListResponse>(
    url,
    (u) => fetcher<RunnerListResponse>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

/**
 * List task runners only.
 *
 * @param category - Optional cognitive category filter
 * @param tenantId - Tenant identifier
 * @returns SWR response with task runners
 *
 * @example
 * const { data } = useTaskRunners('EVALUATE');
 */
export function useTaskRunners(
  category?: RunnerCategory,
  tenantId: string = 'default'
) {
  return useRunnerList(
    { runner_type: 'task', category: category?.toUpperCase() },
    tenantId
  );
}

/**
 * List family runners only.
 *
 * @param tenantId - Tenant identifier
 * @returns SWR response with family runners
 *
 * @example
 * const { data } = useFamilyRunners();
 */
export function useFamilyRunners(tenantId: string = 'default') {
  return useRunnerList({ runner_type: 'family' }, tenantId);
}

/**
 * List all 22 cognitive categories.
 *
 * @param tenantId - Tenant identifier
 * @returns SWR response with category list
 *
 * @example
 * const { data: categories } = useRunnerCategories();
 */
export function useRunnerCategories(tenantId: string = 'default') {
  return useSWR<string[]>(
    `${API_BASE}/api/runners/categories`,
    (u) => fetcher<string[]>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

/**
 * List all 8 family types with reasoning patterns.
 *
 * @param tenantId - Tenant identifier
 * @returns SWR response with family info
 *
 * @example
 * const { data: families } = useRunnerFamilies();
 */
export function useRunnerFamilies(tenantId: string = 'default') {
  return useSWR<FamilyRunnerInfo[]>(
    `${API_BASE}/api/runners/families`,
    (u) => fetcher<FamilyRunnerInfo[]>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

// =============================================================================
// Detail Hooks
// =============================================================================

/**
 * Get details for a specific runner.
 *
 * @param runnerId - Runner identifier
 * @param tenantId - Tenant identifier
 * @returns SWR response with runner details
 *
 * @example
 * const { data: runner } = useRunner('critique_runner');
 */
export function useRunner(
  runnerId: string | null | undefined,
  tenantId: string = 'default'
) {
  return useSWR<RunnerDetailResponse>(
    runnerId ? `${API_BASE}/api/runners/${runnerId}` : null,
    (u) => fetcher<RunnerDetailResponse>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

// =============================================================================
// JTBD Mapping Hooks
// =============================================================================

/**
 * Get the runner mapping for a JTBD level and job step.
 *
 * @param level - JTBD level (strategic, solution, workflow, task)
 * @param step - Job step (define, locate, prepare, confirm, execute, monitor, modify, conclude)
 * @param tenantId - Tenant identifier
 * @returns SWR response with runner mapping
 *
 * @example
 * const { data: mapping } = useJTBDRunner('workflow', 'execute');
 */
export function useJTBDRunner(
  level: JTBDLevel | null | undefined,
  step: JobStep | null | undefined,
  tenantId: string = 'default'
) {
  return useSWR<JTBDRunnerMapping>(
    level && step ? `${API_BASE}/api/runners/jtbd/${level}/${step}` : null,
    (u) => fetcher<JTBDRunnerMapping>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

/**
 * Get the complete JTBD × Job Step → Runner matrix.
 *
 * @param tenantId - Tenant identifier
 * @returns SWR response with full matrix
 *
 * @example
 * const { data: matrix } = useJTBDRunnerMatrix();
 * const runner = matrix?.workflow?.execute?.runner_id;
 */
export function useJTBDRunnerMatrix(tenantId: string = 'default') {
  return useSWR<JTBDRunnerMatrix>(
    `${API_BASE}/api/runners/jtbd/matrix`,
    (u) => fetcher<JTBDRunnerMatrix>(u, tenantId),
    DEFAULT_SWR_CONFIG
  );
}

// =============================================================================
// Execution Hooks
// =============================================================================

/**
 * Hook for executing runners.
 *
 * @returns Object with executeRunner function
 *
 * @example
 * const { executeRunner, isExecuting } = useRunnerExecution();
 *
 * const result = await executeRunner('critique_runner', {
 *   input_data: { content: 'Text to critique' }
 * });
 */
export function useRunnerExecution() {
  const executeRunner = useCallback(
    async (
      runnerId: string,
      request: RunnerExecuteRequest,
      tenantId: string = 'default'
    ): Promise<RunnerExecuteResponse> => {
      return postFetcher<RunnerExecuteRequest, RunnerExecuteResponse>(
        `${API_BASE}/api/runners/${runnerId}/execute`,
        request,
        tenantId
      );
    },
    []
  );

  return { executeRunner };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Get runners grouped by category.
 *
 * @param tenantId - Tenant identifier
 * @returns Object with runners organized by category
 *
 * @example
 * const { runnersByCategory } = useRunnersByCategory();
 * const evaluateRunners = runnersByCategory?.EVALUATE;
 */
export function useRunnersByCategory(tenantId: string = 'default') {
  const { data: runnersData, ...rest } = useTaskRunners(undefined, tenantId);

  const runnersByCategory = useMemo(() => {
    if (!runnersData?.runners) return null;

    const grouped: Record<string, RunnerInfo[]> = {};

    for (const runner of runnersData.runners) {
      const category = runner.category || 'UNCATEGORIZED';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(runner);
    }

    return grouped;
  }, [runnersData]);

  return { runnersByCategory, ...rest };
}

/**
 * Search runners by name or description.
 *
 * @param query - Search query
 * @param tenantId - Tenant identifier
 * @returns Filtered runners matching query
 *
 * @example
 * const { filteredRunners } = useRunnerSearch('critique');
 */
export function useRunnerSearch(
  query: string,
  tenantId: string = 'default'
) {
  const { data: runnersData, ...rest } = useRunnerList(undefined, tenantId);

  const filteredRunners = useMemo(() => {
    if (!runnersData?.runners || !query.trim()) {
      return runnersData?.runners || [];
    }

    const lowerQuery = query.toLowerCase();

    return runnersData.runners.filter(
      (runner) =>
        runner.name.toLowerCase().includes(lowerQuery) ||
        runner.runner_id.toLowerCase().includes(lowerQuery) ||
        runner.description?.toLowerCase().includes(lowerQuery) ||
        runner.category?.toLowerCase().includes(lowerQuery)
    );
  }, [runnersData, query]);

  return { filteredRunners, ...rest };
}

/**
 * Get recommended runners for a JTBD level.
 *
 * Returns all runners mapped to the 8 job steps for a given level.
 *
 * @param level - JTBD level
 * @param tenantId - Tenant identifier
 * @returns Runners for all job steps at the given level
 *
 * @example
 * const { runnersForLevel } = useRunnersForJTBDLevel('workflow');
 */
export function useRunnersForJTBDLevel(
  level: JTBDLevel | null | undefined,
  tenantId: string = 'default'
) {
  const { data: matrix, ...rest } = useJTBDRunnerMatrix(tenantId);

  const runnersForLevel = useMemo(() => {
    if (!matrix || !level) return null;
    return matrix[level] || null;
  }, [matrix, level]);

  return { runnersForLevel, ...rest };
}

// =============================================================================
// Exports
// =============================================================================

export {
  API_BASE,
  fetcher,
  postFetcher,
};
