/**
 * VITAL Platform - useMode3Mission Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for Mode 3 (Manual Autonomous) mission hook that handles
 * goal-driven missions with Human-in-the-Loop checkpoints.
 */

import { renderHook, act } from '@testing-library/react';

// =============================================================================
// MOCKS
// =============================================================================

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

// Mutable state for testing
const createMockState = () => ({
  mission: null as any,
  currentStep: null as any,
  isExecuting: false,
  isPaused: false,
  selectedExpert: null as any,
  progress: null as any,
  currentDelegations: [] as any[],
  currentCost: null as any,
  error: null as any,
  checkpointState: {
    isOpen: false,
    checkpoint: null as any,
    timeRemaining: 0,
    isSubmitting: false,
  },
});

let mockState = createMockState();

const mockStartMission = jest.fn((options: any) => {
  if (mockState.isExecuting) return;
  mockState.isExecuting = true;
  mockState.mission = {
    id: `mission-${Date.now()}`,
    goal: options.goal,
    status: 'running',
    artifacts: [],
  };
  mockConnect({
    goal: options.goal,
    expert_id: mockState.selectedExpert?.id,
    max_iterations: options.maxIterations,
    enable_rag: options.enableRag,
    enable_web_search: options.enableWebSearch,
    confidence_threshold: options.confidenceThreshold,
    hitl_enabled: true,
    hitl_checkpoints: options.hitlCheckpoints,
  });
});

const mockSelectExpert = jest.fn((expert: any) => {
  mockState.selectedExpert = expert;
});

const mockPauseMission = jest.fn(() => {
  mockState.isPaused = true;
});

const mockResumeMission = jest.fn(() => {
  mockState.isPaused = false;
});

const mockCancelMission = jest.fn(() => {
  mockDisconnect();
  mockState.isExecuting = false;
  if (mockState.mission) {
    mockState.mission.status = 'cancelled';
  }
});

const mockResetMission = jest.fn(() => {
  mockState.mission = null;
  mockState.currentStep = null;
  mockState.currentDelegations = [];
  mockState.progress = null;
});

const mockApproveCheckpoint = jest.fn(async () => {
  mockState.checkpointState.isOpen = false;
  mockState.checkpointState.checkpoint = null;
  mockState.isPaused = false;
});

const mockRejectCheckpoint = jest.fn(async (reason?: string) => {
  mockState.checkpointState.isOpen = false;
  mockState.checkpointState.checkpoint = null;
});

const mockModifyCheckpoint = jest.fn(async (modifications: any) => {
  mockState.checkpointState.isOpen = false;
  mockState.checkpointState.checkpoint = null;
});

jest.mock('../useMode3Mission', () => ({
  useMode3Mission: jest.fn((options?: any) => {
    if (options?.expertId) {
      mockState.selectedExpert = { id: options.expertId };
    }
    return {
      get mission() { return mockState.mission; },
      get currentStep() { return mockState.currentStep; },
      get isExecuting() { return mockState.isExecuting; },
      get isPaused() { return mockState.isPaused; },
      get selectedExpert() { return mockState.selectedExpert; },
      get progress() { return mockState.progress; },
      get currentDelegations() { return mockState.currentDelegations; },
      get currentCost() { return mockState.currentCost; },
      get error() { return mockState.error; },
      get checkpointState() { return mockState.checkpointState; },
      startMission: mockStartMission,
      selectExpert: mockSelectExpert,
      pauseMission: mockPauseMission,
      resumeMission: mockResumeMission,
      cancelMission: mockCancelMission,
      resetMission: mockResetMission,
      approveCheckpoint: mockApproveCheckpoint,
      rejectCheckpoint: mockRejectCheckpoint,
      modifyCheckpoint: mockModifyCheckpoint,
    };
  }),
}));

import { useMode3Mission } from '../useMode3Mission';

// Helper to trigger SSE events and update mock state
function triggerSSEEvent(eventName: string, data: any) {
  if (eventName === 'progress') {
    mockState.progress = data;
    mockState.currentStep = data.current_step;
  } else if (eventName === 'checkpoint') {
    mockState.checkpointState = {
      isOpen: true,
      checkpoint: data,
      timeRemaining: data.timeout_seconds || 300,
      isSubmitting: false,
    };
    mockState.isPaused = true;
  } else if (eventName === 'delegation') {
    const existingIdx = mockState.currentDelegations.findIndex((d: any) => d.id === data.id);
    if (existingIdx >= 0) {
      mockState.currentDelegations[existingIdx] = data;
    } else {
      mockState.currentDelegations = [...mockState.currentDelegations, data];
    }
  } else if (eventName === 'cost') {
    mockState.currentCost = data;
  } else if (eventName === 'done') {
    mockState.isExecuting = false;
    if (mockState.mission) {
      mockState.mission.status = 'completed';
      mockState.mission.artifacts = data.artifacts || [];
    }
  } else if (eventName === 'error') {
    mockState.error = data;
    mockState.isExecuting = false;
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useMode3Mission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockStartMission.mockClear();
    mockSelectExpert.mockClear();
    mockPauseMission.mockClear();
    mockResumeMission.mockClear();
    mockCancelMission.mockClear();
    mockResetMission.mockClear();
    mockApproveCheckpoint.mockClear();
    mockRejectCheckpoint.mockClear();
    mockModifyCheckpoint.mockClear();
    mockState = createMockState();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with empty mission state', () => {
      const { result } = renderHook(() => useMode3Mission());

      expect(result.current.mission).toBeNull();
      expect(result.current.currentStep).toBeNull();
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.checkpointState.isOpen).toBe(false);
    });

    it('should accept expert ID for manual selection', () => {
      const { result } = renderHook(() =>
        useMode3Mission({ expertId: 'expert-001' })
      );

      expect(mockState.selectedExpert).toEqual({ id: 'expert-001' });
    });
  });

  // ===========================================================================
  // Mission Start Tests
  // ===========================================================================

  describe('Start Mission', () => {
    it('should start mission with goal', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({
          goal: 'Analyze competitive landscape for Drug X',
        });
      });

      expect(mockStartMission).toHaveBeenCalledWith(
        expect.objectContaining({
          goal: 'Analyze competitive landscape for Drug X',
        })
      );
      expect(mockState.isExecuting).toBe(true);
    });

    it('should include mission options', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({
          goal: 'Research task',
          maxIterations: 15,
          enableRag: true,
          enableWebSearch: true,
          confidenceThreshold: 0.85,
        });
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          max_iterations: 15,
          enable_rag: true,
          enable_web_search: true,
          confidence_threshold: 0.85,
        })
      );
    });

    it('should set isExecuting to true', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test mission' });
      });

      expect(mockState.isExecuting).toBe(true);
    });

    it('should not start if already executing', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'First mission' });
      });

      mockConnect.mockClear();

      act(() => {
        result.current.startMission({ goal: 'Second mission' });
      });

      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Progress Tracking Tests
  // ===========================================================================

  describe('Progress Tracking', () => {
    it('should track mission progress', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('progress', {
          current_step: 2,
          total_steps: 5,
          percentage: 40,
          description: 'Analyzing data sources',
        });
      });

      expect(mockState.progress?.current_step).toBe(2);
      expect(mockState.progress?.total_steps).toBe(5);
      expect(mockState.progress?.percentage).toBe(40);
    });

    it('should update current step on step events', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Multi-step mission' });
      });

      act(() => {
        triggerSSEEvent('progress', {
          current_step: 1,
          total_steps: 3,
          step_name: 'data_collection',
          step_status: 'completed',
        });
      });

      expect(mockState.currentStep).toBe(1);
    });
  });

  // ===========================================================================
  // HITL Checkpoint Tests
  // ===========================================================================

  describe('HITL Checkpoints', () => {
    it('should handle checkpoint events', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Autonomous research' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'plan_approval',
          title: 'Review Research Plan',
          description: 'Please review the proposed research plan',
          timeout_seconds: 300,
        });
      });

      expect(mockState.checkpointState.isOpen).toBe(true);
      expect(mockState.checkpointState.checkpoint?.id).toBe('checkpoint-001');
    });

    it('should pause mission at checkpoint', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 300,
        });
      });

      expect(mockState.isPaused).toBe(true);
    });

    it('should track checkpoint timeout countdown', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      expect(mockState.checkpointState.timeRemaining).toBe(60);
    });

    it('should approve checkpoint', async () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 300,
        });
      });

      await act(async () => {
        await result.current.approveCheckpoint();
      });

      expect(mockState.checkpointState.isOpen).toBe(false);
      expect(mockState.isPaused).toBe(false);
    });

    it('should reject checkpoint', async () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 300,
        });
      });

      await act(async () => {
        await result.current.rejectCheckpoint('Incorrect approach');
      });

      expect(mockRejectCheckpoint).toHaveBeenCalledWith('Incorrect approach');
    });

    it('should modify checkpoint with feedback', async () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'plan_approval',
          timeout_seconds: 300,
        });
      });

      await act(async () => {
        await result.current.modifyCheckpoint({
          feedback: 'Please also include safety data',
          modifications: { include_safety: true },
        });
      });

      expect(mockModifyCheckpoint).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Delegation Tests
  // ===========================================================================

  describe('Delegation Events', () => {
    it('should track delegation to sub-agents', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Complex analysis' });
      });

      act(() => {
        triggerSSEEvent('delegation', {
          id: 'delegation-001',
          from_agent: 'master_orchestrator',
          to_agent: 'regulatory_specialist',
          task: 'Analyze FDA requirements',
          status: 'started',
        });
      });

      expect(mockState.currentDelegations).toHaveLength(1);
      expect(mockState.currentDelegations[0].to_agent).toBe('regulatory_specialist');
    });

    it('should update delegation status', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('delegation', {
          id: 'delegation-001',
          to_agent: 'specialist',
          status: 'started',
        });
        triggerSSEEvent('delegation', {
          id: 'delegation-001',
          to_agent: 'specialist',
          status: 'completed',
          result: 'Analysis complete',
        });
      });

      const delegation = mockState.currentDelegations.find(
        (d: any) => d.id === 'delegation-001'
      );
      expect(delegation?.status).toBe('completed');
    });
  });

  // ===========================================================================
  // Artifact Generation Tests
  // ===========================================================================

  describe('Artifact Generation', () => {
    it('should collect generated artifacts', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Generate report' });
      });

      act(() => {
        triggerSSEEvent('done', {
          success: true,
          artifacts: [
            {
              id: 'artifact-001',
              type: 'document',
              title: 'Research Report',
              format: 'markdown',
              content: '# Report\n\nFindings...',
            },
            {
              id: 'artifact-002',
              type: 'data',
              title: 'Analysis Results',
              format: 'json',
              content: '{"results": [...]}',
            },
          ],
        });
      });

      expect(mockState.mission?.artifacts).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Mission Completion Tests
  // ===========================================================================

  describe('Mission Completion', () => {
    it('should finalize mission on done event', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Complete task' });
      });

      act(() => {
        triggerSSEEvent('done', {
          mission_id: 'mission-123',
          status: 'completed',
          summary: 'Mission completed successfully',
        });
      });

      expect(mockState.mission?.status).toBe('completed');
      expect(mockState.isExecuting).toBe(false);
    });

    it('should handle mission failure', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Failing task' });
      });

      act(() => {
        triggerSSEEvent('error', {
          code: 'MISSION_FAILED',
          message: 'Unable to complete objective',
          recoverable: false,
        });
      });

      expect(mockState.error).not.toBeNull();
      expect(mockState.isExecuting).toBe(false);
    });
  });

  // ===========================================================================
  // Pause/Resume Tests
  // ===========================================================================

  describe('Pause and Resume', () => {
    it('should pause mission execution', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Long running task' });
      });

      act(() => {
        result.current.pauseMission();
      });

      expect(mockState.isPaused).toBe(true);
    });

    it('should resume paused mission', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        result.current.pauseMission();
      });

      act(() => {
        result.current.resumeMission();
      });

      expect(mockState.isPaused).toBe(false);
    });
  });

  // ===========================================================================
  // Cancellation Tests
  // ===========================================================================

  describe('Mission Cancellation', () => {
    it('should cancel running mission', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Long task' });
      });

      act(() => {
        result.current.cancelMission();
      });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockState.isExecuting).toBe(false);
      expect(mockState.mission?.status).toBe('cancelled');
    });
  });

  // ===========================================================================
  // Expert Selection Tests
  // ===========================================================================

  describe('Expert Selection', () => {
    it('should allow expert selection for mission', () => {
      const { result } = renderHook(() => useMode3Mission());

      const expert = {
        id: 'expert-002',
        name: 'Dr. Research',
        specialty: 'Deep Analysis',
      };

      act(() => {
        result.current.selectExpert(expert);
      });

      expect(mockSelectExpert).toHaveBeenCalledWith(expert);
      expect(mockState.selectedExpert).toEqual(expert);
    });

    it('should include selected expert in mission start', () => {
      const { result } = renderHook(() => useMode3Mission());

      const expert = {
        id: 'expert-003',
        name: 'Dr. Expert',
        specialty: 'Research',
      };

      act(() => {
        result.current.selectExpert(expert);
      });

      act(() => {
        result.current.startMission({ goal: 'Research task' });
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          expert_id: 'expert-003',
        })
      );
    });
  });

  // ===========================================================================
  // Cost Tracking Tests
  // ===========================================================================

  describe('Cost Tracking', () => {
    it('should track cumulative mission cost', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Expensive task' });
      });

      act(() => {
        triggerSSEEvent('cost', {
          input_tokens: 1000,
          output_tokens: 2000,
          total_tokens: 3000,
          estimated_cost_usd: 0.03,
          model: 'claude-sonnet-4',
        });
      });

      expect(mockState.currentCost?.total_tokens).toBe(3000);
    });
  });

  // ===========================================================================
  // Clear State Tests
  // ===========================================================================

  describe('Clear State', () => {
    it('should reset all mission state', () => {
      const { result } = renderHook(() => useMode3Mission());

      act(() => {
        result.current.startMission({ goal: 'Test' });
      });

      act(() => {
        triggerSSEEvent('progress', { current_step: 1, total_steps: 3 });
        triggerSSEEvent('delegation', { id: 'del-001', to_agent: 'agent' });
        triggerSSEEvent('done', { success: true });
      });

      act(() => {
        result.current.resetMission();
      });

      expect(mockState.mission).toBeNull();
      expect(mockState.currentStep).toBeNull();
      expect(mockState.currentDelegations).toHaveLength(0);
      expect(mockState.progress).toBeNull();
    });
  });
});
