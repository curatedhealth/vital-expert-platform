'use client';

/**
 * VITAL Platform - Base Autonomous Hook
 * 
 * Shared foundation for Mode 3 & Mode 4 (Autonomous modes)
 * - Goal-driven multi-step execution
 * - HITL checkpoints
 * - Sub-agent delegation
 * - Real-time streaming (foreground visible)
 * - Polling + notifications
 * - Pause/Resume/Cancel
 * - Artifact generation
 * 
 * Mode 3 extends this: + Manual expert selection
 * Mode 4 extends this: + Fusion auto-selection + Pre-flight check
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { logger } from '@vital/utils';
import {
  useSSEStream,
  TokenEvent,
  ReasoningEvent,
  CitationEvent,
  ToolCallEvent,
  DelegationEvent,
  CheckpointEvent,
  ProgressEvent,
  FusionEvent,
  CostEvent,
  DoneEvent,
  ErrorEvent,
  ArtifactEvent,
} from './useSSEStream';

// =============================================================================
// CSRF TOKEN HELPER
// =============================================================================

/**
 * Get CSRF token from cookie (client-side)
 * Supports __Host-csrf-token and csrf_token cookie names
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie?.split(';') || [];
  for (const c of parts) {
    const [name, ...rest] = c.trim().split('=');
    if (!name) continue;
    if (name === '__Host-csrf-token' || name === 'csrf_token') {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

// =============================================================================
// SHARED TYPES (Autonomous Modes)
// =============================================================================

export interface MissionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  agentId?: string;
  agentName?: string;
  reasoning?: ReasoningEvent[];
  output?: string;
}

export interface MissionArtifact {
  id: string;
  type: 'document' | 'report' | 'analysis' | 'code' | 'data';
  title: string;
  content: string;
  format?: string;
  downloadUrl?: string;
}

export interface MissionResult {
  id: string;
  goal: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  steps: MissionStep[];
  finalOutput?: string;
  artifacts?: MissionArtifact[];
  citations?: CitationEvent[];
  totalCost?: number;
  durationMs?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Expert {
  id: string;
  name: string;
  domain: string;
  level: 'L1' | 'L2' | 'L3';
  avatar?: string;
  specialty?: string;
  confidence?: number;
}

export interface CheckpointState {
  isOpen: boolean;
  checkpoint: CheckpointEvent | null;
  timeRemaining: number;
}

export interface PreFlightCheck {
  id: string;
  name: string;
  category: 'budget' | 'permissions' | 'tools' | 'agents' | 'data';
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning';
  message?: string;
  required: boolean;
}

export interface PreFlightResult {
  passed: boolean;
  checks: PreFlightCheck[];
  estimatedCost?: number;
  estimatedDuration?: number; // seconds
  recommendedTeamSize?: number;
}

export interface StartMissionOptions {
  enableRag?: boolean;
  enableWebSearch?: boolean;
  maxIterations?: number;
  confidenceThreshold?: number;
  hitlEnabled?: boolean;
  budgetLimit?: number;
  templateId?: string;
}

export interface UseBaseAutonomousOptions {
  missionId?: string;
  agentId?: string;
  /** @deprecated Use agentId instead */
  expertId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onCheckpoint?: (checkpoint: CheckpointEvent) => void;
  onStepComplete?: (step: MissionStep) => void;
  onMissionComplete?: (result: MissionResult) => void;
  onFusionComplete?: (experts: Expert[]) => void; // Mode 4 only
  onArtifact?: (artifact: MissionArtifact) => void;
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  baseUrl?: string;           // Legacy mode-specific endpoints (/api/expert)
  streamBaseUrl?: string;     // Unified streaming endpoint base (/api/ask-expert)
  missionBaseUrl?: string;    // Mission control endpoints (/api/expert/mission)
  mode: 'mode3_manual_autonomous' | 'mode4_auto_autonomous';
  pollingInterval?: number; // ms
}

export interface BaseAutonomousState {
  // Mission state
  mission: MissionResult | null;
  currentStep: MissionStep | null;
  currentContent: string;
  currentReasoning: ReasoningEvent[];
  currentCitations: CitationEvent[];
  currentToolCalls: ToolCallEvent[];
  currentDelegations: DelegationEvent[];
  progress: ProgressEvent | null;
  fusionEvidence: FusionEvent | null;
  currentCost: CostEvent | null;
  artifacts: MissionArtifact[];
  
  // Checkpoint state
  checkpointState: CheckpointState;
  
  // Pre-flight state (Mode 4)
  preFlightResult: PreFlightResult | null;
  isPreFlightRunning: boolean;
  
  // Expert state
  selectedExpert: Expert | null;
  selectedTeam: Expert[];
  
  // Connection state
  isRunning: boolean;
  isPaused: boolean;
  isConnected: boolean;
  error: Error | null;
}

export interface BaseAutonomousActions {
  // Mission control
  startMission: (goal: string, options?: StartMissionOptions) => void;
  pauseMission: () => Promise<void>;
  resumeMission: () => Promise<void>;
  cancelMission: () => Promise<void>;
  
  // Expert selection (Mode 3)
  selectExpert: (expert: Expert) => void;
  
  // Pre-flight (Mode 4)
  runPreFlight: (goal: string) => Promise<PreFlightResult>;
  
  // Checkpoint handling
  approveCheckpoint: (option?: string) => Promise<void>;
  rejectCheckpoint: (reason?: string) => Promise<void>;
  extendCheckpointTimeout: (seconds: number) => void;
  
  // Polling
  refreshStatus: () => Promise<void>;
}

// =============================================================================
// MAIN HOOK - SHARED LOGIC
// =============================================================================

export function useBaseAutonomous(
  options: UseBaseAutonomousOptions
): BaseAutonomousState & BaseAutonomousActions {
  const {
    missionId: initialMissionId,
    agentId,
    expertId, // Deprecated - use agentId
    tenantId,
    onError,
    onCheckpoint,
    onStepComplete,
    onMissionComplete,
    onFusionComplete,
    onArtifact,
    onNotification,
    baseUrl = '/api/expert',
    streamBaseUrl = '/api/missions',
    missionBaseUrl = '/api/expert/mission',
    mode,
    pollingInterval = 5000,
  } = options;

  // Resolve effective agent ID (agentId takes precedence over deprecated expertId)
  const effectiveAgentId = agentId || expertId;

  // Determine endpoints based on mode
  const modePrefix = mode === 'mode3_manual_autonomous' ? 'mode3' : 'mode4';
  // Missions stream (aligned to backend /api/missions/stream)
  const resolvedStreamBase =
    process.env.NEXT_PUBLIC_MISSIONS_STREAM_BASE ||
    streamBaseUrl ||
    '/api/ask-expert';
  const streamUrl = `${resolvedStreamBase.replace(/\/$/, '')}/stream`;

  // ==========================================================================
  // STATE
  // ==========================================================================
  
  // Mission state
  const [mission, setMission] = useState<MissionResult | null>(null);
  const [currentStep, setCurrentStep] = useState<MissionStep | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [currentReasoning, setCurrentReasoning] = useState<ReasoningEvent[]>([]);
  const [currentCitations, setCurrentCitations] = useState<CitationEvent[]>([]);
  const [currentToolCalls, setCurrentToolCalls] = useState<ToolCallEvent[]>([]);
  const [currentDelegations, setCurrentDelegations] = useState<DelegationEvent[]>([]);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [fusionEvidence, setFusionEvidence] = useState<FusionEvent | null>(null);
  const [currentCost, setCurrentCost] = useState<CostEvent | null>(null);
  const [artifacts, setArtifacts] = useState<MissionArtifact[]>([]);
  
  // Checkpoint state
  const [checkpointState, setCheckpointState] = useState<CheckpointState>({
    isOpen: false,
    checkpoint: null,
    timeRemaining: 0,
  });
  
  // Pre-flight state (Mode 4)
  const [preFlightResult, setPreFlightResult] = useState<PreFlightResult | null>(null);
  const [isPreFlightRunning, setIsPreFlightRunning] = useState(false);
  
  // Expert state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Expert[]>([]);
  
  // Control state
  const [isPaused, setIsPaused] = useState(false);
  
  // Refs
  const missionIdRef = useRef<string | undefined>(initialMissionId);
  const checkpointTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================================================
  // POLLING (Shared for both modes - foreground visible)
  // ==========================================================================

  const refreshStatus = useCallback(async () => {
    if (!missionIdRef.current) return;
    
    try {
      const response = await fetch(`${missionBaseUrl}/status/${missionIdRef.current}?mode=${mode}`);
      if (response.ok) {
        const data = await response.json();
        setMission((prev) => prev ? { ...prev, ...data, status: data.status } : null);
        
        // Update progress
        if (data.progress !== undefined) {
          setProgress((prev) => prev ? { ...prev, progress: data.progress } : null);
        }
      }
    } catch (error) {
      logger.error('Status polling error', { error });
    }
  }, [missionBaseUrl, mode]);

  // Start polling when mission is running
  useEffect(() => {
    if (mission?.status === 'running' && !isPaused) {
      pollingTimerRef.current = setInterval(refreshStatus, pollingInterval);
    } else {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    }
    
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [mission?.status, isPaused, refreshStatus, pollingInterval]);

  // Cleanup checkpoint timer on unmount (fixes memory leak)
  useEffect(() => {
    return () => {
      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
        checkpointTimerRef.current = null;
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);

  // ==========================================================================
  // EVENT HANDLERS (Shared)
  // ==========================================================================

  const handleToken = useCallback((event: TokenEvent) => {
    setCurrentContent((prev) => prev + event.content);
  }, []);

  const handleReasoning = useCallback((event: ReasoningEvent) => {
    setCurrentReasoning((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === event.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = event;
        return updated;
      }
      return [...prev, event];
    });
  }, []);

  const handleCitation = useCallback((event: CitationEvent) => {
    setCurrentCitations((prev) => {
      if (prev.some((c) => c.id === event.id)) return prev;
      return [...prev, event];
    });
  }, []);

  const handleToolCall = useCallback((event: ToolCallEvent) => {
    setCurrentToolCalls((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === event.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = event;
        return updated;
      }
      return [...prev, event];
    });
  }, []);

  const handleDelegation = useCallback((event: DelegationEvent) => {
    setCurrentDelegations((prev) => [...prev, event]);
    onNotification?.(`Task delegated to ${event.toAgentName}`, 'info');
  }, [onNotification]);

  // Mode 4: Fusion event handler
  const handleFusion = useCallback((event: FusionEvent) => {
    setFusionEvidence(event);
    
    if (mode === 'mode4_auto_autonomous' && event.selectedExperts) {
      const experts: Expert[] = event.selectedExperts.map((e: any) => ({
        id: e.id,
        name: e.name,
        domain: e.domain || e.specialty || '',
        level: e.level || 'L2',
        confidence: e.confidence,
      }));
      setSelectedTeam(experts);
      
      if (experts.length > 0) {
        setSelectedExpert(experts[0]);
      }
      
      onFusionComplete?.(experts);
      onNotification?.(`Team of ${experts.length} experts assembled`, 'success');
    }
  }, [mode, onFusionComplete, onNotification]);

  // Checkpoint handler (HITL gate)
  const handleCheckpoint = useCallback(
    (event: CheckpointEvent) => {
      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }

      setCheckpointState({
        isOpen: true,
        checkpoint: event,
        timeRemaining: event.timeout,
      });

      setIsPaused(true);
      onCheckpoint?.(event);
      onNotification?.(`Checkpoint: ${event.title}`, 'warning');

      // Start countdown
      checkpointTimerRef.current = setInterval(() => {
        setCheckpointState((prev) => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            clearInterval(checkpointTimerRef.current!);
            return { ...prev, isOpen: false, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    },
    [onCheckpoint, onNotification]
  );

  const handleProgress = useCallback((event: ProgressEvent) => {
    setProgress(event);
    setMission((prev) => prev ? { ...prev, progress: event.progress } : null);

    // Update current step based on progress
    if (event.subSteps) {
      const activeStep = event.subSteps.find((s) => s.status === 'active');
      if (activeStep) {
        setCurrentStep((prev) =>
          prev?.title === activeStep.name
            ? prev
            : {
                id: crypto.randomUUID(),
                title: activeStep.name,
                description: event.message,
                status: 'active',
                startTime: new Date(),
              }
        );
      }
    }
  }, []);

  const handleArtifact = useCallback((event: ArtifactEvent) => {
    const artifact: MissionArtifact = {
      id: event.id,
      type: event.artifactType as MissionArtifact['type'],
      title: event.title || 'Artifact',
      content: event.content || '',
      format: event.format,
      downloadUrl: event.downloadUrl,
    };
    setArtifacts((prev) => [...prev, artifact]);

    // Missions backend sends content via artifacts, not tokens
    // Accumulate artifact content to show in real-time
    const artifactContent = event.content || (event as any).summary || '';
    if (artifactContent) {
      setCurrentContent((prev) => {
        const separator = prev ? '\n\n---\n\n' : '';
        return prev + separator + artifactContent;
      });
    }

    onArtifact?.(artifact);
    onNotification?.(`Artifact generated: ${artifact.title}`, 'success');
  }, [onArtifact, onNotification]);

  const handleCost = useCallback((event: CostEvent) => {
    setCurrentCost(event);
  }, []);

  const handleDone = useCallback(
    (event: DoneEvent) => {
      // Clear polling
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }

      // Extract final content from done event or artifacts
      // Missions backend sends artifacts in done event, not tokens
      let finalContent = currentContent;
      if (!finalContent && event.artifacts) {
        // Combine artifact summaries/content as final output
        const artifactList = Array.isArray(event.artifacts) ? event.artifacts : [];
        finalContent = artifactList
          .map((a: any) => a.summary || a.content || '')
          .filter(Boolean)
          .join('\n\n');
      }
      if (!finalContent && event.final) {
        // Try final.content if available
        finalContent = (event.final as any)?.content || '';
      }

      // Finalize current step
      if (currentStep) {
        const completedStep: MissionStep = {
          ...currentStep,
          status: 'complete',
          endTime: new Date(),
          output: finalContent,
          reasoning: [...currentReasoning],
        };

        onStepComplete?.(completedStep);

        setMission((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                progress: 100,
                steps: [...prev.steps, completedStep],
                finalOutput: finalContent,
                citations: currentCitations,
                artifacts,
                totalCost: event.cost,
                durationMs: event.durationMs,
                completedAt: new Date(),
              }
            : null
        );
      }

      if (mission) {
        const completedMission = {
          ...mission,
          status: 'completed' as const,
          progress: 100,
          finalOutput: finalContent,
          citations: currentCitations,
          artifacts,
          totalCost: event.cost,
          durationMs: event.durationMs,
          completedAt: new Date(),
        };
        onMissionComplete?.(completedMission);
        onNotification?.('Mission completed successfully!', 'success');
      }

      // Reset current state
      resetCurrentState();
    },
    [mission, currentStep, currentContent, currentReasoning, currentCitations, artifacts, onStepComplete, onMissionComplete, onNotification]
  );

  const handleError = useCallback(
    (event: ErrorEvent) => {
      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
      setMission((prev) => (prev ? { ...prev, status: 'failed' } : null));
      onError?.(new Error(event.message));
      onNotification?.(event.message, 'error');
    },
    [onError, onNotification]
  );

  // ==========================================================================
  // SSE CONNECTION
  // ==========================================================================

  // Build headers with tenant ID and CSRF token
  const sseHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    return Object.keys(headers).length > 0 ? headers : undefined;
  }, [tenantId]);

  const { connect, disconnect, isConnected, isStreaming, error } = useSSEStream({
    url: streamUrl,
    headers: sseHeaders,
    onToken: handleToken,
    onReasoning: handleReasoning,
    onCitation: handleCitation,
    onToolCall: handleToolCall,
    onDelegation: handleDelegation,
    onCheckpoint: handleCheckpoint,
    onProgress: handleProgress,
    onFusion: handleFusion,
    onArtifact: handleArtifact,
    onCost: handleCost,
    onDone: handleDone,
    onError: handleError,
  });

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const resetCurrentState = useCallback(() => {
    setCurrentContent('');
    setCurrentReasoning([]);
    setCurrentCitations([]);
    setCurrentToolCalls([]);
    setCurrentDelegations([]);
    setCurrentStep(null);
    setProgress(null);
    setCurrentCost(null);
  }, []);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  // Pre-flight check (Mode 4 only, but available for both)
  const runPreFlight = useCallback(async (goal: string): Promise<PreFlightResult> => {
    setIsPreFlightRunning(true);
    
    // Mode 3 currently reuses Mode 4 safety checks; short-circuit with a
    // permissive pass to avoid 404s until backend exposes Mode 3 preflight.
    if (mode === 'mode3_manual_autonomous') {
      const fallback: PreFlightResult = {
        passed: true,
        checks: [],
      };
      setPreFlightResult(fallback);
      setIsPreFlightRunning(false);
      return fallback;
    }
    
    try {
      const response = await fetch(`${baseUrl}/${modePrefix}/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: crypto.randomUUID(),
          goal,
          tenant_id: tenantId,
          mode,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Pre-flight check failed');
      }
      
      const result: PreFlightResult = await response.json();
      setPreFlightResult(result);
      return result;
    } finally {
      setIsPreFlightRunning(false);
    }
  }, [baseUrl, modePrefix, tenantId, mode]);

  const startMission = useCallback(
    (goal: string, missionOptions?: StartMissionOptions) => {
      if (!goal.trim() || isStreaming) return;
      
      // Mode 3: Require agent selection
      if (mode === 'mode3_manual_autonomous' && !selectedExpert && !effectiveAgentId) {
        onError?.(new Error('Please select an agent before starting the mission'));
        return;
      }

      // Initialize mission
      missionIdRef.current = crypto.randomUUID();
      const newMission: MissionResult = {
        id: missionIdRef.current,
        goal,
        status: 'running',
        progress: 0,
        steps: [],
        startedAt: new Date(),
      };
      setMission(newMission);
      setIsPaused(false);
      setArtifacts([]);

      // Build request payload
      const modeNumber = mode === 'mode3_manual_autonomous' ? 3 : 4;
      const payload: Record<string, any> = {
        mission_id: missionIdRef.current,
        goal,
        message: goal,
        mode: modeNumber,
        tenant_id: tenantId,
        template_id: missionOptions?.templateId,
        options: {
          enable_rag: missionOptions?.enableRag ?? true,
          enable_websearch: missionOptions?.enableWebSearch ?? true,
          max_iterations: missionOptions?.maxIterations ?? 10,
          confidence_threshold: missionOptions?.confidenceThreshold ?? 0.8,
          hitl_enabled: missionOptions?.hitlEnabled ?? true,
          budget_limit: missionOptions?.budgetLimit,
        },
      };

      // Mode 3: Include selected agent
      if (mode === 'mode3_manual_autonomous') {
        payload.agent_id = selectedExpert?.id || effectiveAgentId;
      }
      // Mode 4: Fusion will auto-select team

      connect(payload);
      onNotification?.('Mission started', 'info');
    },
    [connect, effectiveAgentId, tenantId, selectedExpert, isStreaming, mode, onError, onNotification]
  );

  const selectExpert = useCallback((expert: Expert) => {
    setSelectedExpert(expert);
  }, []);

  const pauseMission = useCallback(async () => {
    setIsPaused(true);
    setMission((prev) => prev ? { ...prev, status: 'paused' } : null);
    
    await fetch(`${missionBaseUrl}/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionIdRef.current, mode }),
    });
    
    onNotification?.('Mission paused', 'info');
  }, [missionBaseUrl, mode, onNotification]);

  const resumeMission = useCallback(async () => {
    setIsPaused(false);
    setMission((prev) => prev ? { ...prev, status: 'running' } : null);
    
    await fetch(`${missionBaseUrl}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionIdRef.current, mode }),
    });
    
    onNotification?.('Mission resumed', 'info');
  }, [missionBaseUrl, mode, onNotification]);

  const cancelMission = useCallback(async () => {
    disconnect();
    
    if (checkpointTimerRef.current) {
      clearInterval(checkpointTimerRef.current);
    }
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
    
    setMission((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    setIsPaused(false);
    setCheckpointState({ isOpen: false, checkpoint: null, timeRemaining: 0 });
    
    await fetch(`${missionBaseUrl}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionIdRef.current, mode }),
    });
    
    onNotification?.('Mission cancelled', 'warning');
  }, [disconnect, missionBaseUrl, mode, onNotification]);

  const approveCheckpoint = useCallback(
    async (option?: string) => {
      if (!checkpointState.checkpoint) return;

      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }

      await fetch(`${missionBaseUrl}/checkpoint/${checkpointState.checkpoint.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          option: option || checkpointState.checkpoint.options[0],
          mission_id: missionIdRef.current,
          mode,
        }),
      });

      setCheckpointState({ isOpen: false, checkpoint: null, timeRemaining: 0 });
      setIsPaused(false);
      onNotification?.('Checkpoint approved', 'success');
    },
    [checkpointState.checkpoint, missionBaseUrl, mode, onNotification]
  );

  const rejectCheckpoint = useCallback(
    async (reason?: string) => {
      if (!checkpointState.checkpoint) return;

      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }

      await fetch(`${missionBaseUrl}/checkpoint/${checkpointState.checkpoint.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          reason,
          mission_id: missionIdRef.current,
          mode,
        }),
      });

      setCheckpointState({ isOpen: false, checkpoint: null, timeRemaining: 0 });
      onNotification?.('Checkpoint rejected', 'warning');
    },
    [checkpointState.checkpoint, missionBaseUrl, mode, onNotification]
  );

  const extendCheckpointTimeout = useCallback((seconds: number) => {
    setCheckpointState((prev) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + seconds,
    }));
  }, []);

  return {
    // Mission state
    mission,
    currentStep,
    currentContent,
    currentReasoning,
    currentCitations,
    currentToolCalls,
    currentDelegations,
    progress,
    fusionEvidence,
    currentCost,
    artifacts,
    
    // Checkpoint state
    checkpointState,
    
    // Pre-flight state
    preFlightResult,
    isPreFlightRunning,
    
    // Expert state
    selectedExpert,
    selectedTeam,
    
    // Connection state
    isRunning: isStreaming,
    isPaused,
    isConnected,
    error,
    
    // Actions
    startMission,
    selectExpert,
    pauseMission,
    resumeMission,
    cancelMission,
    runPreFlight,
    approveCheckpoint,
    rejectCheckpoint,
    extendCheckpointTimeout,
    refreshStatus,
  };
}

export default useBaseAutonomous;
