/**
 * Hook for fetching and managing workflow data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useTenant } from './use-tenant';
import type {
  UseCase,
  UseCaseWithWorkflows,
  Workflow,
  WorkflowWithTasks,
  Task,
  TaskWithDetails,
  UseCaseFilters,
  DomainStatistics,
  FoundationStatistics,
  UseCaseDomain,
} from '@/types/workflow.types';

// ============================================================================
// USE CASES
// ============================================================================

/**
 * Fetch all use cases with optional filters
 */
export function useUseCases(filters?: UseCaseFilters): UseQueryResult<UseCase[]> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['useCases', tenantId, filters],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      let query = db.supabase
        .from('dh_use_case')
        .select('*')
        .eq('tenant_id', tenantId);

      if (filters?.domain) {
        query = query.eq('domain', filters.domain);
      }

      if (filters?.complexity) {
        query = query.eq('complexity', filters.complexity);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,code.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order('code', { ascending: true });

      if (error) throw error;
      return data as UseCase[];
    },
    enabled: !!db && !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single use case by code
 */
export function useUseCase(code: string): UseQueryResult<UseCase> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['useCase', tenantId, code],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      const { data, error } = await db.supabase
        .from('dh_use_case')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('code', code)
        .single();

      if (error) throw error;
      return data as UseCase;
    },
    enabled: !!db && !!tenantId && !!code,
  });
}

/**
 * Fetch use case with all workflows
 */
export function useUseCaseWithWorkflows(code: string): UseQueryResult<UseCaseWithWorkflows> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['useCaseWithWorkflows', tenantId, code],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      // Fetch use case
      const { data: useCase, error: useCaseError } = await db.supabase
        .from('dh_use_case')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('code', code)
        .single();

      if (useCaseError) throw useCaseError;

      // Fetch workflows
      const { data: workflows, error: workflowsError } = await db.supabase
        .from('dh_workflow')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('use_case_id', useCase.id)
        .order('position', { ascending: true });

      if (workflowsError) throw workflowsError;

      // Fetch task counts and durations
      const { data: taskStats, error: taskStatsError } = await db.supabase
        .from('dh_task')
        .select('workflow_id, extra')
        .eq('tenant_id', tenantId)
        .in('workflow_id', workflows.map(w => w.id));

      if (taskStatsError) throw taskStatsError;

      const totalTasks = taskStats.length;
      const totalDuration = taskStats.reduce((sum, task) => {
        const extra = task.extra as any;
        return sum + (extra?.duration_minutes || 0);
      }, 0);

      return {
        ...useCase,
        workflows: workflows as Workflow[],
        total_tasks: totalTasks,
        total_duration_minutes: totalDuration,
      } as UseCaseWithWorkflows;
    },
    enabled: !!db && !!tenantId && !!code,
  });
}

// ============================================================================
// WORKFLOWS
// ============================================================================

/**
 * Fetch workflow with all tasks
 */
export function useWorkflowWithTasks(workflowId: string): UseQueryResult<WorkflowWithTasks> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['workflowWithTasks', tenantId, workflowId],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      // Fetch workflow
      const { data: workflow, error: workflowError } = await db.supabase
        .from('dh_workflow')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Fetch use case
      const { data: useCase, error: useCaseError } = await db.supabase
        .from('dh_use_case')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', workflow.use_case_id)
        .single();

      if (useCaseError) throw useCaseError;

      // Fetch tasks
      const { data: tasks, error: tasksError } = await db.supabase
        .from('dh_task')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('workflow_id', workflowId)
        .order('position', { ascending: true });

      if (tasksError) throw tasksError;

      return {
        ...workflow,
        use_case: useCase as UseCase,
        tasks: tasks as Task[],
      } as WorkflowWithTasks;
    },
    enabled: !!db && !!tenantId && !!workflowId,
  });
}

// ============================================================================
// TASKS
// ============================================================================

/**
 * Fetch task with all details (dependencies, agents, personas, etc.)
 */
export function useTaskWithDetails(taskId: string): UseQueryResult<TaskWithDetails> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['taskWithDetails', tenantId, taskId],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      // Fetch task
      const { data: task, error: taskError } = await db.supabase
        .from('dh_task')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Fetch workflow
      const { data: workflow, error: workflowError } = await db.supabase
        .from('dh_workflow')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('id', task.workflow_id)
        .single();

      if (workflowError) throw workflowError;

      // Fetch all related data in parallel
      const [
        { data: dependencies },
        { data: agents },
        { data: personas },
        { data: tools },
        { data: ragSources },
      ] = await Promise.all([
        db.supabase.from('dh_task_dependency').select('*').eq('task_id', taskId),
        db.supabase.from('dh_task_agent').select('*').eq('task_id', taskId).order('execution_order'),
        db.supabase.from('dh_task_persona').select('*').eq('task_id', taskId),
        db.supabase.from('dh_task_tool').select('*').eq('task_id', taskId),
        db.supabase.from('dh_task_rag').select('*').eq('task_id', taskId),
      ]);

      return {
        ...task,
        workflow: workflow as Workflow,
        dependencies: dependencies || [],
        agents: agents || [],
        personas: personas || [],
        tools: tools || [],
        rag_sources: ragSources || [],
      } as TaskWithDetails;
    },
    enabled: !!db && !!tenantId && !!taskId,
  });
}

// ============================================================================
// STATISTICS & AGGREGATIONS
// ============================================================================

/**
 * Fetch domain statistics
 */
export function useDomainStatistics(): UseQueryResult<DomainStatistics[]> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['domainStatistics', tenantId],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      // Fetch all use cases
      const { data: useCases, error: useCasesError } = await db.supabase
        .from('dh_use_case')
        .select('*')
        .eq('tenant_id', tenantId);

      if (useCasesError) throw useCasesError;

      // Group by domain
      const domainMap = new Map<UseCaseDomain, any>();

      for (const uc of useCases as UseCase[]) {
        if (!domainMap.has(uc.domain)) {
          domainMap.set(uc.domain, {
            domain: uc.domain,
            use_case_count: 0,
            workflow_count: 0,
            task_count: 0,
            total_duration_minutes: 0,
            complexity_breakdown: {
              BEGINNER: 0,
              INTERMEDIATE: 0,
              ADVANCED: 0,
              EXPERT: 0,
            },
          });
        }

        const stats = domainMap.get(uc.domain)!;
        stats.use_case_count++;
        stats.total_duration_minutes += uc.estimated_duration_minutes || 0;
        stats.complexity_breakdown[uc.complexity]++;
      }

      // Fetch workflow and task counts for each domain
      for (const [domain, stats] of domainMap.entries()) {
        const domainUseCaseIds = (useCases as UseCase[])
          .filter(uc => uc.domain === domain)
          .map(uc => uc.id);

        // Count workflows
        const { count: workflowCount } = await db.supabase
          .from('dh_workflow')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .in('use_case_id', domainUseCaseIds);

        stats.workflow_count = workflowCount || 0;

        // Count tasks
        const { data: workflows } = await db.supabase
          .from('dh_workflow')
          .select('id')
          .eq('tenant_id', tenantId)
          .in('use_case_id', domainUseCaseIds);

        if (workflows && workflows.length > 0) {
          const { count: taskCount } = await db.supabase
            .from('dh_task')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .in('workflow_id', workflows.map(w => w.id));

          stats.task_count = taskCount || 0;
        }
      }

      return Array.from(domainMap.values()) as DomainStatistics[];
    },
    enabled: !!db && !!tenantId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch foundation entity statistics
 */
export function useFoundationStatistics(): UseQueryResult<FoundationStatistics> {
  const { db, tenantId } = useTenant();

  return useQuery({
    queryKey: ['foundationStatistics', tenantId],
    queryFn: async () => {
      if (!db) throw new Error('Database not initialized');

      const [
        { count: agentCount },
        { count: personaCount },
        { count: toolCount },
        { count: ragCount },
        { count: promptCount },
      ] = await Promise.all([
        db.supabase.from('dh_agent').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        db.supabase.from('dh_persona').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        db.supabase.from('dh_tool').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        db.supabase.from('dh_rag_source').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        db.supabase.from('prompts').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      ]);

      return {
        total_agents: agentCount || 0,
        total_personas: personaCount || 0,
        total_tools: toolCount || 0,
        total_rag_sources: ragCount || 0,
        total_prompts: promptCount || 0,
      } as FoundationStatistics;
    },
    enabled: !!db && !!tenantId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

