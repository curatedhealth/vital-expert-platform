'use client';

/**
 * VITAL Platform - HITL Checkpoint Hook
 * 
 * Human-in-the-Loop checkpoint management for Mode 3/4 autonomous workflows.
 * Handles:
 * - Checkpoint approval/rejection flow
 * - Countdown timer with timeout handling
 * - Option selection
 * - Timeout extension
 * 
 * Checkpoint Types:
 * - plan_approval: Approve execution plan
 * - tool_approval: Approve tool/API call
 * - sub_agent_approval: Approve sub-agent delegation
 * - critical_decision: Approve critical decision point
 * - final_review: Final artifact review
 * 
 * Phase 4: Integration & Streaming
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { CheckpointEvent } from './useSSEStream';

// =============================================================================
// TYPES
// =============================================================================

export interface CheckpointState {
  isOpen: boolean;
  checkpoint: CheckpointEvent | null;
  timeRemaining: number;
  selectedOption: string | null;
  isSubmitting: boolean;
}

export interface UseCheckpointOptions {
  onApprove: (checkpointId: string, option: string, feedback?: string) => Promise<void>;
  onReject: (checkpointId: string, reason?: string) => Promise<void>;
  onTimeout: (checkpointId: string) => void;
  onModify?: (checkpointId: string, modifications: Record<string, unknown>) => Promise<void>;
  defaultTimeoutAction?: 'approve' | 'reject' | 'pause';
  warningThresholdSeconds?: number;
}

export interface UseCheckpointReturn {
  state: CheckpointState;
  handleCheckpoint: (checkpoint: CheckpointEvent) => void;
  approve: (option?: string, feedback?: string) => Promise<void>;
  reject: (reason?: string) => Promise<void>;
  modify: (modifications: Record<string, unknown>) => Promise<void>;
  dismiss: () => void;
  extendTimeout: (seconds: number) => void;
  selectOption: (option: string) => void;
  isWarning: boolean;
  isCritical: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useCheckpoint(options: UseCheckpointOptions): UseCheckpointReturn {
  const {
    onApprove,
    onReject,
    onTimeout,
    onModify,
    defaultTimeoutAction = 'pause',
    warningThresholdSeconds = 10,
  } = options;

  const [state, setState] = useState<CheckpointState>({
    isOpen: false,
    checkpoint: null,
    timeRemaining: 0,
    selectedOption: null,
    isSubmitting: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef({ onApprove, onReject, onTimeout, onModify });
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onApprove, onReject, onTimeout, onModify };
  }, [onApprove, onReject, onTimeout, onModify]);

  // Computed states
  const isWarning = state.timeRemaining > 0 && state.timeRemaining <= warningThresholdSeconds;
  const isCritical = state.checkpoint?.urgency === 'critical' || state.checkpoint?.urgency === 'high';

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Handle incoming checkpoint
  const handleCheckpoint = useCallback(
    (checkpoint: CheckpointEvent) => {
      clearTimer();

      setState({
        isOpen: true,
        checkpoint,
        timeRemaining: checkpoint.timeout,
        selectedOption: checkpoint.options?.[0] || null,
        isSubmitting: false,
      });

      // Start countdown
      timerRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.timeRemaining - 1;

          if (newTime <= 0) {
            clearTimer();

            // Handle timeout based on default action
            if (prev.checkpoint) {
              const { onApprove, onReject, onTimeout } = callbacksRef.current;
              
              switch (defaultTimeoutAction) {
                case 'approve':
                  onApprove(prev.checkpoint.id, prev.selectedOption || '');
                  break;
                case 'reject':
                  onReject(prev.checkpoint.id, 'Timeout - no response received');
                  break;
                case 'pause':
                default:
                  onTimeout(prev.checkpoint.id);
                  break;
              }
            }

            return {
              isOpen: false,
              checkpoint: null,
              timeRemaining: 0,
              selectedOption: null,
              isSubmitting: false,
            };
          }

          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    },
    [clearTimer, defaultTimeoutAction]
  );

  // Approve checkpoint
  const approve = useCallback(
    async (option?: string, feedback?: string) => {
      if (!state.checkpoint || state.isSubmitting) return;

      clearTimer();
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onApprove(
          state.checkpoint.id,
          option || state.selectedOption || state.checkpoint.options?.[0] || '',
          feedback
        );
      } finally {
        setState({
          isOpen: false,
          checkpoint: null,
          timeRemaining: 0,
          selectedOption: null,
          isSubmitting: false,
        });
      }
    },
    [state.checkpoint, state.selectedOption, state.isSubmitting, clearTimer, onApprove]
  );

  // Reject checkpoint
  const reject = useCallback(
    async (reason?: string) => {
      if (!state.checkpoint || state.isSubmitting) return;

      clearTimer();
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onReject(state.checkpoint.id, reason);
      } finally {
        setState({
          isOpen: false,
          checkpoint: null,
          timeRemaining: 0,
          selectedOption: null,
          isSubmitting: false,
        });
      }
    },
    [state.checkpoint, state.isSubmitting, clearTimer, onReject]
  );

  // Modify checkpoint (optional - allows changes before approval)
  const modify = useCallback(
    async (modifications: Record<string, unknown>) => {
      if (!state.checkpoint || state.isSubmitting || !onModify) return;

      clearTimer();
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onModify(state.checkpoint.id, modifications);
      } finally {
        setState({
          isOpen: false,
          checkpoint: null,
          timeRemaining: 0,
          selectedOption: null,
          isSubmitting: false,
        });
      }
    },
    [state.checkpoint, state.isSubmitting, clearTimer, onModify]
  );

  // Dismiss without action (pauses workflow)
  const dismiss = useCallback(() => {
    clearTimer();

    if (state.checkpoint) {
      onTimeout(state.checkpoint.id);
    }

    setState({
      isOpen: false,
      checkpoint: null,
      timeRemaining: 0,
      selectedOption: null,
      isSubmitting: false,
    });
  }, [state.checkpoint, clearTimer, onTimeout]);

  // Extend timeout
  const extendTimeout = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + seconds,
    }));
  }, []);

  // Select option
  const selectOption = useCallback((option: string) => {
    setState((prev) => ({
      ...prev,
      selectedOption: option,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    state,
    handleCheckpoint,
    approve,
    reject,
    modify,
    dismiss,
    extendTimeout,
    selectOption,
    isWarning,
    isCritical,
  };
}

export default useCheckpoint;
