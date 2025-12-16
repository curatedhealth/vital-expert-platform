'use client';

/**
 * useMode3 Hook - Mode 3 Deep Research State Management
 *
 * Provides:
 * - SSE connection management for real-time updates
 * - API methods for all Mode 3 operations
 * - State management for mission lifecycle
 * - Error handling and recovery
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  MissionGoal,
  PlanPhase,
  MissionConfig,
  Deliverable,
  TeamMember,
  MissionDraft,
  MissionTemplate,
  CanonicalSSEEvent,
  Mode3OrchestratorPhase
} from '../mode-3/types/mode3.types';

// ============================================================================
// Types
// ============================================================================

export interface UseMode3Options {
  tenantId: string;
  userId: string;
  agentId: string;
  baseUrl?: string;
  onEvent?: (event: CanonicalSSEEvent) => void;
  onError?: (error: string) => void;
}

export interface UseMode3Return {
  // State
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  missionId: string | null;
  conversationId: string | null;
  phase: Mode3OrchestratorPhase;

  // Pre-launch Methods (client-side preparation)
  parseGoals: (prompt: string) => Promise<MissionGoal[]>;
  generatePlan: (goals: MissionGoal[]) => Promise<PlanPhase[]>;
  assembleTeam: (plan: PlanPhase[]) => Promise<{ team: TeamMember[]; deliverables: Deliverable[] }>;

  // Mission Lifecycle
  launchMission: (config: MissionConfig) => Promise<string>;
  cancelMission: () => Promise<void>;

  // HITL Checkpoint Resolution
  resolveCheckpoint: (
    checkpointId: string,
    action: 'approve' | 'reject' | 'modify' | 'skip',
    feedback?: string,
    modifications?: Record<string, unknown>
  ) => Promise<void>;
  requestRevision: (feedback: string, deliverableIds?: string[]) => Promise<void>;
  acceptDeliverables: () => Promise<void>;

  // Draft/Template Methods
  saveDraft: (name: string, config: Partial<MissionConfig>, checkpoint: string) => Promise<string>;
  loadDraft: (draftId: string) => Promise<MissionDraft>;
  deleteDraft: (draftId: string) => Promise<void>;
  saveTemplate: (name: string, description: string, config: Partial<MissionConfig>) => Promise<string>;
  loadTemplate: (templateId: string) => Promise<MissionTemplate>;
  listTemplates: () => Promise<MissionTemplate[]>;

  // SSE Methods
  connect: (missionId: string) => void;
  disconnect: () => void;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// API Endpoints - Unified with Mode 3/4 Autonomous Routes
// ============================================================================

// Mode 3 preparation endpoints use Next.js API routes that proxy to Python backend
// This allows proper handling of AI_ENGINE_URL on the server side
const ENDPOINTS = {
  // Mode 3 Preparation (LLM-powered HITL checkpoint prep) - via Next.js proxy
  parseGoals: '/api/mode3/parse-goals',
  generatePlan: '/api/mode3/generate-plan',
  assembleTeam: '/api/mode3/assemble-team',

  // Mission lifecycle (shared with Mode 4)
  createMission: '/api/ask-expert/missions',
  getMission: (id: string) => `/api/ask-expert/missions/${id}`,
  cancelMission: (id: string) => `/api/ask-expert/missions/${id}/cancel`,
  pauseMission: (id: string) => `/api/ask-expert/missions/${id}/pause`,
  resumeMission: (id: string) => `/api/ask-expert/missions/${id}/resume`,

  // HITL checkpoint resolution
  resolveCheckpoint: (missionId: string, checkpointId: string) =>
    `/api/ask-expert/missions/${missionId}/checkpoints/${checkpointId}/resolve`,

  // SSE streaming
  sseStream: (missionId: string) => `/api/ask-expert/missions/${missionId}/stream`,

  // Templates (shared)
  listTemplates: '/api/ask-expert/missions/templates',
  loadTemplate: (id: string) => `/api/ask-expert/missions/templates/${id}`,

  // Drafts (user-specific, via Next.js API)
  saveDraft: '/api/mode3/drafts',
  loadDraft: (id: string) => `/api/mode3/drafts/${id}`,
  deleteDraft: (id: string) => `/api/mode3/drafts/${id}`,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMode3(options: UseMode3Options): UseMode3Return {
  const {
    tenantId,
    userId,
    agentId,
    baseUrl = '',
    onEvent,
    onError
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Mode3OrchestratorPhase>('initial');

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Helper: API Request
  // ============================================================================

  const apiRequest = useCallback(async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'X-User-ID': userId
      };

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      onError?.(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, tenantId, userId, onError]);

  // ============================================================================
  // SSE Connection Management
  // ============================================================================

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback((missionIdToConnect: string) => {
    // Disconnect any existing connection
    disconnect();

    setMissionId(missionIdToConnect);
    const url = `${baseUrl}${ENDPOINTS.sseStream(missionIdToConnect)}`;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          // Raw SSE event from backend - may include more event types than CanonicalSSEEventType
          interface RawSSEEvent {
            type: string;
            conversation_id?: string;
            mission_id?: string;
            timestamp?: string;
            payload?: {
              checkpoint_id?: string;
              checkpoint_type?: string;
              [key: string]: unknown;
            };
            error?: string;
          }

          const rawData: RawSSEEvent = JSON.parse(event.data);
          // Pass to callback as CanonicalSSEEvent if types match
          onEvent?.(rawData as unknown as CanonicalSSEEvent);

          // Extract checkpoint info from payload
          const checkpointId = rawData.payload?.checkpoint_id;
          const checkpointType = rawData.payload?.checkpoint_type;

          // Update phase and track checkpoint based on event type
          switch (rawData.type) {
            // LangGraph node events (match backend node names)
            case 'mission_started':
              setPhase('execution');
              break;
            case 'preflight_completed':
              // Initialization done, waiting for planning
              break;
            case 'query_decomposed':
            case 'goals_parsed':
              setPhase('goal_confirmation');
              break;
            case 'plan_ready':
            case 'plan_generated':
              setPhase('plan_confirmation');
              break;
            case 'team_selected':
            case 'team_assembled':
              setPhase('mission_validation');
              break;
            case 'checkpoint_reached':
              // Track checkpoint ID for resolution
              if (checkpointId) {
                currentCheckpointIdRef.current = checkpointId;
              }
              // Update phase based on checkpoint type
              if (checkpointType === 'goal_confirmation') {
                setPhase('goal_confirmation');
              } else if (checkpointType === 'plan_confirmation') {
                setPhase('plan_confirmation');
              } else if (checkpointType === 'mission_validation') {
                setPhase('mission_validation');
              } else if (checkpointType === 'deliverable_review') {
                setPhase('deliverable_review');
              }
              break;
            case 'checkpoint_resolved':
              // Checkpoint approved, continue execution
              setPhase('execution');
              break;
            case 'execution_started':
              setPhase('execution');
              break;
            case 'task_started':
            case 'task_progress':
            case 'task_completed':
            case 'execution_progress':
              // Progress events during execution
              break;
            case 'artifact_created':
              // Artifact produced
              break;
            case 'deliverables_ready':
              setPhase('deliverable_review');
              break;
            case 'revision_started':
              setPhase('revision');
              break;
            case 'synthesis_complete':
              // Final synthesis done
              break;
            case 'mission_completed':
              setPhase('completed');
              if (rawData.mission_id) {
                setMissionId(rawData.mission_id);
              }
              break;
            case 'mission_failed':
              setPhase('failed');
              setError(rawData.error || 'Mission failed');
              break;
            case 'mission_paused':
              // Mission waiting for HITL
              break;
            case 'mission_cancelled':
              setPhase('cancelled');
              break;
          }
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);

        // Attempt reconnection after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connect(missionIdToConnect);
          }
        }, 3000);
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to SSE';
      setError(message);
      onError?.(message);
    }
  }, [baseUrl, onEvent, onError, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Parse user prompt into mission goals using LLM.
   *
   * Calls the backend /api/mode3/parse-goals endpoint which uses GPT-4
   * to extract structured, actionable goals from the user's research prompt.
   */
  const parseGoals = useCallback(async (prompt: string): Promise<MissionGoal[]> => {
    setPhase('goal_parsing');

    // API response has different structure than MissionGoal
    interface APIGoal {
      id: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      status: string;
      success_criteria?: string[];
      estimated_complexity?: 'simple' | 'moderate' | 'complex';
    }

    const response = await apiRequest<{ goals: APIGoal[]; summary: string; estimated_duration_minutes: number }>(
      ENDPOINTS.parseGoals,
      'POST',
      { prompt, agent_id: agentId }
    );

    // Transform API response to MissionGoal format
    const transformedGoals: MissionGoal[] = response.goals.map((g, idx) => ({
      id: g.id,
      text: g.description,
      priority: g.priority === 'high' ? 5 : g.priority === 'medium' ? 3 : 1,
      order: idx,
      category: 'research' as const, // Default to research for parsed goals
      confidence: g.estimated_complexity === 'simple' ? 0.9 : g.estimated_complexity === 'moderate' ? 0.75 : 0.6,
    }));

    setPhase('goal_confirmation');
    return transformedGoals;
  }, [apiRequest, agentId]);

  /**
   * Generate execution plan from confirmed goals using LLM.
   *
   * Calls the backend /api/mode3/generate-plan endpoint which uses GPT-4
   * to create a phased execution plan with specific tasks.
   */
  const generatePlan = useCallback(async (goals: MissionGoal[]): Promise<PlanPhase[]> => {
    setPhase('plan_generation');

    // API response has different structure than frontend PlanPhase
    interface APITask {
      id: string;
      name: string;
      type: string; // research, analysis, synthesis, generation, validation
      status: string;
      estimated_minutes?: number;
    }

    interface APIPhase {
      id: string;
      name: string;
      description: string;
      tasks: APITask[];
      status: string;
      dependencies?: string[];
    }

    // Transform goals to API format (text → description)
    const apiGoals = goals.map(g => ({
      id: g.id,
      description: g.text,
      priority: g.priority >= 4 ? 'high' : g.priority >= 2 ? 'medium' : 'low',
      status: 'pending',
      success_criteria: [],
      estimated_complexity: g.confidence && g.confidence >= 0.8 ? 'simple' : g.confidence && g.confidence >= 0.6 ? 'moderate' : 'complex',
    }));

    const response = await apiRequest<{ phases: APIPhase[]; total_tasks: number; estimated_duration_minutes: number }>(
      ENDPOINTS.generatePlan,
      'POST',
      { goals: apiGoals, agent_id: agentId }
    );

    // Transform API response to frontend PlanPhase format
    const transformedPhases: PlanPhase[] = response.phases.map((phase, phaseIdx) => ({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      steps: phase.tasks.map((task, taskIdx) => ({
        id: task.id,
        name: task.name,
        description: `${task.type.charAt(0).toUpperCase() + task.type.slice(1)} task: ${task.name}`,
        estimated_duration_minutes: task.estimated_minutes || 15,
        dependencies: phaseIdx > 0 && taskIdx === 0 ? [response.phases[phaseIdx - 1].tasks.slice(-1)[0]?.id].filter(Boolean) : [],
        order: taskIdx,
      })),
      estimated_duration_minutes: phase.tasks.reduce((sum, t) => sum + (t.estimated_minutes || 15), 0),
      order: phaseIdx,
      parallel_allowed: false,
    }));

    setPhase('plan_confirmation');
    return transformedPhases;
  }, [apiRequest, agentId]);

  /**
   * Assemble team and define deliverables for the mission using LLM.
   *
   * Calls the backend /api/mode3/assemble-team endpoint which uses GPT-4
   * to determine team composition and expected deliverables.
   */
  const assembleTeam = useCallback(async (
    plan: PlanPhase[]
  ): Promise<{ team: TeamMember[]; deliverables: Deliverable[] }> => {
    setPhase('team_assembly');

    // API response has different structure than frontend types
    interface APITeamMember {
      id: string;
      role: string;
      name: string;
      capabilities: string[];
      assigned_phases?: string[];
    }

    interface APIDeliverable {
      id: string;
      name: string;
      type: string; // markdown, csv, json, pdf, pptx
      description?: string;
      status: string;
      phase_id?: string;
    }

    // Transform plan to API format (steps → tasks)
    const apiPlan = plan.map(phase => ({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      tasks: phase.steps.map(step => ({
        id: step.id,
        name: step.name,
        type: 'research', // Default type
        status: 'pending',
        estimated_minutes: step.estimated_duration_minutes,
      })),
      status: 'pending',
      dependencies: null,
    }));

    const response = await apiRequest<{ team: APITeamMember[]; deliverables: APIDeliverable[]; resource_summary: string }>(
      ENDPOINTS.assembleTeam,
      'POST',
      { plan: apiPlan, agent_id: agentId }
    );

    // Transform API team to frontend TeamMember format
    const transformedTeam: TeamMember[] = response.team.map((member, idx) => ({
      id: `team_member_${idx}`,
      agent_id: member.id,
      agent_name: member.name,
      role: member.role,
      responsibilities: member.capabilities,
      tier: member.role === 'Lead Expert' ? 2 : 3,
    }));

    // Transform API deliverables to frontend Deliverable format
    const transformedDeliverables: Deliverable[] = response.deliverables.map(d => ({
      id: d.id,
      name: d.name,
      type: (d.type as Deliverable['type']) || 'markdown',
      status: 'pending' as const,
      quality_score: undefined,
      content: undefined,
      preview: d.description || `${d.name} - ${d.type} deliverable`,
    }));

    setPhase('mission_validation');
    return { team: transformedTeam, deliverables: transformedDeliverables };
  }, [apiRequest, agentId]);

  const launchMission = useCallback(async (config: MissionConfig): Promise<string> => {
    setPhase('execution');

    // Create mission using unified autonomous endpoint
    // Mode 3: agent_id is provided (manual selection)
    const response = await apiRequest<{ id: string; template_id: string; goal: string; status: string }>(
      ENDPOINTS.createMission,
      'POST',
      {
        template_id: config.metadata?.mission_name || 'mode3-custom',
        goal: config.goals.map(g => g.text).join('. '),
        agent_id: agentId,  // Mode 3: explicit agent selection
        inputs: {
          goals: config.goals,
          plan: config.plan,
          team: config.team,
          deliverables: config.deliverables,
        },
        budget_limit: config.budget_limit,
        timeout_minutes: config.time_limit_minutes,
        auto_approve_checkpoints: false,  // Mode 3 requires HITL approval
      }
    );

    const newMissionId = response.id;
    setMissionId(newMissionId);
    setConversationId(newMissionId);  // Use mission ID as conversation ID

    // Connect to SSE for real-time updates
    connect(newMissionId);

    return newMissionId;
  }, [apiRequest, agentId, connect]);

  // Track current checkpoint for resolution
  const currentCheckpointIdRef = useRef<string | null>(null);

  const requestRevision = useCallback(async (
    feedback: string,
    deliverableIds?: string[]
  ): Promise<void> => {
    if (!missionId) throw new Error('No active mission');
    const checkpointId = currentCheckpointIdRef.current || 'deliverable_review';

    setPhase('revision');
    await apiRequest<{ status: string; message: string }>(
      ENDPOINTS.resolveCheckpoint(missionId, checkpointId),
      'POST',
      {
        action: 'modify',
        feedback,
        modifications: { deliverable_ids: deliverableIds }
      }
    );
  }, [apiRequest, missionId]);

  const acceptDeliverables = useCallback(async (): Promise<void> => {
    if (!missionId) throw new Error('No active mission');
    const checkpointId = currentCheckpointIdRef.current || 'deliverable_review';

    await apiRequest<{ status: string; message: string }>(
      ENDPOINTS.resolveCheckpoint(missionId, checkpointId),
      'POST',
      {
        action: 'approve',
        feedback: 'Deliverables accepted'
      }
    );
    setPhase('completed');
  }, [apiRequest, missionId]);

  const cancelMission = useCallback(async (): Promise<void> => {
    if (!missionId) throw new Error('No active mission');

    await apiRequest<{ status: string; message: string }>(
      ENDPOINTS.cancelMission(missionId),
      'POST',
      {}
    );
    setPhase('cancelled');
    disconnect();
  }, [apiRequest, missionId, disconnect]);

  // Method to resolve any HITL checkpoint (for the 4-checkpoint journey)
  const resolveCheckpoint = useCallback(async (
    checkpointId: string,
    action: 'approve' | 'reject' | 'modify' | 'skip',
    feedback?: string,
    modifications?: Record<string, unknown>
  ): Promise<void> => {
    if (!missionId) throw new Error('No active mission');

    await apiRequest<{ status: string; message: string }>(
      ENDPOINTS.resolveCheckpoint(missionId, checkpointId),
      'POST',
      {
        action,
        feedback,
        modifications
      }
    );

    // Update phase based on action
    if (action === 'reject') {
      setPhase('cancelled');
      disconnect();
    }
  }, [apiRequest, missionId, disconnect]);

  // ============================================================================
  // Draft/Template Methods
  // ============================================================================

  const saveDraft = useCallback(async (
    name: string,
    config: Partial<MissionConfig>,
    checkpoint: string
  ): Promise<string> => {
    const response = await apiRequest<{ draft_id: string }>(
      ENDPOINTS.saveDraft,
      'POST',
      {
        name,
        config,
        checkpoint,
        agent_id: agentId,
        tenant_id: tenantId,
        user_id: userId
      }
    );
    return response.draft_id;
  }, [apiRequest, agentId, tenantId, userId]);

  const loadDraft = useCallback(async (draftId: string): Promise<MissionDraft> => {
    return apiRequest<MissionDraft>(ENDPOINTS.loadDraft(draftId), 'GET');
  }, [apiRequest]);

  const deleteDraft = useCallback(async (draftId: string): Promise<void> => {
    await apiRequest<void>(ENDPOINTS.deleteDraft(draftId), 'DELETE');
  }, [apiRequest]);

  const saveTemplate = useCallback(async (
    _name: string,
    _description: string,
    _config: Partial<MissionConfig>
  ): Promise<string> => {
    // Templates are typically admin-managed, not user-created
    // This would require a separate admin endpoint
    throw new Error('Template creation is not available in Mode 3. Use existing templates.');
  }, []);

  const loadTemplate = useCallback(async (templateId: string): Promise<MissionTemplate> => {
    return apiRequest<MissionTemplate>(ENDPOINTS.loadTemplate(templateId), 'GET');
  }, [apiRequest]);

  const listTemplates = useCallback(async (): Promise<MissionTemplate[]> => {
    // The backend returns templates directly as an array
    const templates = await apiRequest<MissionTemplate[]>(
      ENDPOINTS.listTemplates,
      'GET'
    );
    return templates;
  }, [apiRequest]);

  // ============================================================================
  // Utilities
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setIsLoading(false);
    setError(null);
    setMissionId(null);
    setConversationId(null);
    setPhase('initial');
  }, [disconnect]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    isConnected,
    isLoading,
    error,
    missionId,
    conversationId,
    phase,

    // Pre-launch Methods (client-side preparation)
    parseGoals,
    generatePlan,
    assembleTeam,

    // Mission Lifecycle
    launchMission,
    cancelMission,

    // HITL Checkpoint Resolution
    resolveCheckpoint,
    requestRevision,
    acceptDeliverables,

    // Draft/Template Methods
    saveDraft,
    loadDraft,
    deleteDraft,
    saveTemplate,
    loadTemplate,
    listTemplates,

    // SSE Methods
    connect,
    disconnect,

    // Utilities
    clearError,
    reset
  };
}

export default useMode3;
