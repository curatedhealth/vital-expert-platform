'use client';

/**
 * VITAL Platform - Mode 4 Background Hook
 * 
 * Mode 4: Auto Autonomous (Background Dashboard)
 * - System AUTOMATICALLY selects expert team via Fusion Intelligence
 * - Autonomous goal-driven execution (ReAct pattern)
 * - HITL checkpoints for critical decisions
 * - Multi-step reasoning with sub-agent delegation
 * - Real-time streaming (foreground visible)
 * - Polling + notifications
 * - Pre-flight validation
 * - Target latency: 1-30min depending on complexity
 * 
 * Extends useBaseAutonomous with:
 * - Fusion Intelligence auto-selection
 * - Pre-flight check (budget, permissions, tools)
 * - Team assembly visualization
 * 
 * Architecture: Mode 4 = Mode 3 + Fusion Auto-Selection
 */

import { useCallback, useState } from 'react';
import {
  useBaseAutonomous,
  UseBaseAutonomousOptions,
  BaseAutonomousState,
  BaseAutonomousActions,
  MissionResult,
  MissionStep,
  MissionArtifact,
  Expert,
  CheckpointState,
  PreFlightResult,
  PreFlightCheck,
  StartMissionOptions,
} from './useBaseAutonomous';

// Re-export types for consumers
export type { 
  MissionResult, 
  MissionStep, 
  MissionArtifact, 
  Expert, 
  CheckpointState,
  PreFlightResult,
  PreFlightCheck,
  StartMissionOptions,
};

// =============================================================================
// TYPES
// =============================================================================

export interface UseMode4BackgroundOptions {
  missionId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onCheckpoint?: (checkpoint: any) => void;
  onStepComplete?: (step: MissionStep) => void;
  onMissionComplete?: (result: MissionResult) => void;
  onFusionComplete?: (experts: Expert[]) => void;
  onArtifact?: (artifact: MissionArtifact) => void;
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onPreFlightComplete?: (result: PreFlightResult) => void;
  baseUrl?: string;
  // Mode 4 specific options
  autoPreFlight?: boolean;
  maxTeamSize?: number;
  budgetLimit?: number;
}

export interface UseMode4BackgroundReturn extends BaseAutonomousState, BaseAutonomousActions {
  // Mode 4 specific: Fusion and pre-flight state
  isFusionRunning: boolean;
  fusionExperts: Expert[];
  isTeamAssembling: boolean;
  
  // Pre-flight
  preFlightPassed: boolean;
  
  // Mode 4 specific actions
  launchWithPreFlight: (goal: string, options?: StartMissionOptions) => Promise<void>;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useMode4Background(options: UseMode4BackgroundOptions = {}): UseMode4BackgroundReturn {
  const {
    missionId,
    tenantId,
    onError,
    onCheckpoint,
    onStepComplete,
    onMissionComplete,
    onFusionComplete,
    onArtifact,
    onNotification,
    onPreFlightComplete,
    baseUrl = '/api/expert',
    autoPreFlight = true,
    maxTeamSize = 5,
    budgetLimit,
  } = options;

  // Mode 4 specific state
  const [isFusionRunning, setIsFusionRunning] = useState(false);
  const [fusionExperts, setFusionExperts] = useState<Expert[]>([]);
  const [isTeamAssembling, setIsTeamAssembling] = useState(false);

  // Handle fusion completion
  const handleFusionComplete = useCallback((experts: Expert[]) => {
    setFusionExperts(experts);
    setIsFusionRunning(false);
    setIsTeamAssembling(false);
    onFusionComplete?.(experts);
  }, [onFusionComplete]);

  // Use base autonomous hook with Mode 4 configuration
  const baseHook = useBaseAutonomous({
    missionId,
    tenantId,
    onError,
    onCheckpoint,
    onStepComplete,
    onMissionComplete,
    onFusionComplete: handleFusionComplete,
    onArtifact,
    onNotification,
    baseUrl,
    mode: 'mode4_auto_autonomous',
  });

  // Check if pre-flight passed
  const preFlightPassed = baseHook.preFlightResult?.passed ?? false;

  // Mode 4 specific: Launch with pre-flight check
  const launchWithPreFlight = useCallback(
    async (goal: string, missionOptions?: StartMissionOptions) => {
      if (autoPreFlight) {
        onNotification?.('Running pre-flight checks...', 'info');
        
        try {
          const result = await baseHook.runPreFlight(goal);
          onPreFlightComplete?.(result);
          
          if (!result.passed) {
            const failedChecks = result.checks.filter(c => c.status === 'failed');
            const message = `Pre-flight failed: ${failedChecks.map(c => c.name).join(', ')}`;
            onError?.(new Error(message));
            onNotification?.(message, 'error');
            return;
          }
          
          onNotification?.('Pre-flight passed. Assembling team...', 'success');
        } catch (error) {
          onError?.(error as Error);
          onNotification?.('Pre-flight check failed', 'error');
          return;
        }
      }
      
      // Start team assembly (fusion)
      setIsFusionRunning(true);
      setIsTeamAssembling(true);
      setFusionExperts([]);
      
      // Add Mode 4 specific options
      const enhancedOptions: StartMissionOptions = {
        ...missionOptions,
        budgetLimit: missionOptions?.budgetLimit ?? budgetLimit,
      };
      
      baseHook.startMission(goal, enhancedOptions);
    },
    [baseHook.runPreFlight, baseHook.startMission, autoPreFlight, budgetLimit, onError, onNotification, onPreFlightComplete]
  );

  // Override startMission for simpler launch (skip pre-flight)
  const startMissionWithFusion = useCallback(
    (goal: string, missionOptions?: StartMissionOptions) => {
      setIsFusionRunning(true);
      setIsTeamAssembling(true);
      setFusionExperts([]);
      
      const enhancedOptions: StartMissionOptions = {
        ...missionOptions,
        budgetLimit: missionOptions?.budgetLimit ?? budgetLimit,
      };
      
      baseHook.startMission(goal, enhancedOptions);
    },
    [baseHook.startMission, budgetLimit]
  );

  return {
    ...baseHook,
    startMission: startMissionWithFusion,
    
    // Mode 4 specific state
    isFusionRunning,
    fusionExperts,
    isTeamAssembling,
    preFlightPassed,
    
    // Mode 4 specific actions
    launchWithPreFlight,
  };
}

export default useMode4Background;
