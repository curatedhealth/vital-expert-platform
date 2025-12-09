'use client';

/**
 * VITAL Platform - Mode 3 Mission Hook
 * 
 * Mode 3: Manual Autonomous (Mission Control)
 * - User MANUALLY selects expert
 * - Autonomous goal-driven execution (ReAct pattern)
 * - HITL checkpoints for critical decisions
 * - Multi-step reasoning with sub-agent delegation
 * - Real-time streaming (foreground visible)
 * - Polling + notifications
 * - Target latency: 30s-5min depending on complexity
 * 
 * Extends useBaseAutonomous with:
 * - Manual expert selection enforcement
 * 
 * Architecture: Mode 4 = Mode 3 + Fusion Auto-Selection
 */

import { useCallback } from 'react';
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
  StartMissionOptions,
} from './useBaseAutonomous';

// Re-export types for consumers
export type { 
  MissionResult, 
  MissionStep, 
  MissionArtifact, 
  Expert, 
  CheckpointState,
  StartMissionOptions,
};

// =============================================================================
// TYPES
// =============================================================================

export interface UseMode3MissionOptions {
  missionId?: string;
  expertId?: string;
  tenantId?: string;
  onError?: (error: Error) => void;
  onCheckpoint?: (checkpoint: any) => void;
  onStepComplete?: (step: MissionStep) => void;
  onMissionComplete?: (result: MissionResult) => void;
  onArtifact?: (artifact: MissionArtifact) => void;
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  baseUrl?: string;
}

export interface UseMode3MissionReturn extends BaseAutonomousState, BaseAutonomousActions {
  // Mode 3 specific: Expert is required
  isExpertSelected: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useMode3Mission(options: UseMode3MissionOptions = {}): UseMode3MissionReturn {
  const {
    missionId,
    expertId,
    tenantId,
    onError,
    onCheckpoint,
    onStepComplete,
    onMissionComplete,
    onArtifact,
    onNotification,
    baseUrl = '/api/expert',
  } = options;

  // Use base autonomous hook with Mode 3 configuration
  const baseHook = useBaseAutonomous({
    missionId,
    expertId,
    tenantId,
    onError,
    onCheckpoint,
    onStepComplete,
    onMissionComplete,
    onArtifact,
    onNotification,
    baseUrl,
    mode: 'mode3_manual_autonomous',
  });

  // Mode 3 specific: Check if expert is selected
  const isExpertSelected = Boolean(baseHook.selectedExpert || expertId);

  // Override startMission to enforce expert selection
  const startMissionWithValidation = useCallback(
    (goal: string, missionOptions?: StartMissionOptions) => {
      if (!isExpertSelected) {
        onError?.(new Error('Please select an expert before starting the mission'));
        return;
      }
      baseHook.startMission(goal, missionOptions);
    },
    [baseHook.startMission, isExpertSelected, onError]
  );

  return {
    ...baseHook,
    startMission: startMissionWithValidation,
    isExpertSelected,
  };
}

export default useMode3Mission;
