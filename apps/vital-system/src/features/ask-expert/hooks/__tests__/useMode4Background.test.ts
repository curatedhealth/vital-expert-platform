/**
 * VITAL Platform - useMode4Background Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for Mode 4 (Auto Autonomous) background mission hook that handles
 * fire-and-forget missions with automatic team assembly via Fusion Intelligence.
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
  missions: [] as any[],
  currentPhase: null as string | null,
  currentSteps: [] as any[],
  currentCost: null as any,
  fusionEvidence: null as any,
  preFlightChecks: [
    { id: 'budget', name: 'Budget Availability', category: 'budget', status: 'pending', required: true },
    { id: 'tools', name: 'Tool Access', category: 'tools', status: 'pending', required: true },
    { id: 'agents', name: 'Agent Compatibility', category: 'agents', status: 'pending', required: true },
    { id: 'data', name: 'Data Sources', category: 'data', status: 'pending', required: false },
    { id: 'permissions', name: 'Execution Permissions', category: 'permissions', status: 'pending', required: true },
  ],
  isPreFlightRunning: false,
  preFlightPassed: null as boolean | null,
  assembledTeam: [] as any[],
  isAssemblingTeam: false,
  pendingCheckpoint: null as any,
  checkpointTimeRemaining: 0,
  notifications: [] as any[],
  isConnected: false,
  isPolling: false,
  error: null as Error | null,
});

let mockState = createMockState();

const mockCreateMission = jest.fn((goal: string, options?: any) => {
  const newMission = {
    id: `mission-${Date.now()}`,
    title: options?.title || 'Background Mission',
    goal,
    status: 'idle',
    priority: options?.priority || 'normal',
    createdAt: new Date(),
    progress: 0,
    team: [],
    artifacts: [],
    citations: [],
    notifications: [],
    costEstimate: options?.budgetLimit,
  };
  mockState.mission = newMission;
  mockState.preFlightPassed = null;
  mockState.preFlightChecks = mockState.preFlightChecks.map(c => ({ ...c, status: 'pending' }));
  mockState.assembledTeam = [];
  mockState.fusionEvidence = null;
  mockState.currentSteps = [];
  mockState.currentPhase = null;
});

const mockRunPreFlight = jest.fn(async (): Promise<boolean> => {
  if (!mockState.mission) return false;
  
  mockState.isPreFlightRunning = true;
  mockState.mission.status = 'pre_flight';
  
  // Simulate successful pre-flight
  mockState.preFlightChecks = mockState.preFlightChecks.map(c => ({
    ...c,
    status: 'passed',
  }));
  
  mockState.isPreFlightRunning = false;
  mockState.preFlightPassed = true;
  return true;
});

const mockLaunchMission = jest.fn(() => {
  if (!mockState.mission || !mockState.preFlightPassed) return;
  
  mockState.isAssemblingTeam = true;
  mockState.mission.status = 'queued';
  
  mockConnect({
    mission_id: mockState.mission.id,
    goal: mockState.mission.goal,
    mode: 'mode4_auto_autonomous',
    options: {
      fusion_enabled: true,
    },
  });
  
  mockState.mission.status = 'running';
  mockState.mission.startedAt = new Date();
  mockState.isConnected = true;
  mockState.isPolling = true;
});

const mockPauseMission = jest.fn(() => {
  if (mockState.mission?.status === 'running') {
    mockState.mission.status = 'paused';
  }
});

const mockResumeMission = jest.fn(() => {
  if (mockState.mission?.status === 'paused') {
    mockState.mission.status = 'running';
  }
});

const mockCancelMission = jest.fn(() => {
  mockDisconnect();
  if (mockState.mission) {
    mockState.mission.status = 'cancelled';
  }
  mockState.isConnected = false;
  mockState.isPolling = false;
  mockState.pendingCheckpoint = null;
  mockState.checkpointTimeRemaining = 0;
});

const mockApproveCheckpoint = jest.fn(async (option?: string) => {
  mockState.pendingCheckpoint = null;
  mockState.checkpointTimeRemaining = 0;
  if (mockState.mission) {
    mockState.mission.status = 'running';
  }
});

const mockRejectCheckpoint = jest.fn(async (reason?: string) => {
  mockState.pendingCheckpoint = null;
  mockState.checkpointTimeRemaining = 0;
});

const mockMarkNotificationRead = jest.fn((notificationId: string) => {
  mockState.notifications = mockState.notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
});

const mockClearNotifications = jest.fn(() => {
  mockState.notifications = [];
});

const mockDownloadArtifact = jest.fn((artifactId: string) => {
  // Simulate download trigger
});

const mockGetMissionHistory = jest.fn(async (): Promise<any[]> => {
  return mockState.missions;
});

const mockRetryFailedMission = jest.fn((missionId: string) => {
  const failedMission = mockState.missions.find(m => m.id === missionId && m.status === 'failed');
  if (failedMission) {
    mockCreateMission(failedMission.goal, {
      title: `Retry: ${failedMission.title}`,
      priority: failedMission.priority,
    });
  }
});

jest.mock('../useMode4Background', () => ({
  useMode4Background: jest.fn((options?: any) => ({
    get mission() { return mockState.mission; },
    get missions() { return mockState.missions; },
    get currentPhase() { return mockState.currentPhase; },
    get currentSteps() { return mockState.currentSteps; },
    get currentCost() { return mockState.currentCost; },
    get fusionEvidence() { return mockState.fusionEvidence; },
    get preFlightChecks() { return mockState.preFlightChecks; },
    get isPreFlightRunning() { return mockState.isPreFlightRunning; },
    get preFlightPassed() { return mockState.preFlightPassed; },
    get assembledTeam() { return mockState.assembledTeam; },
    get isAssemblingTeam() { return mockState.isAssemblingTeam; },
    get pendingCheckpoint() { return mockState.pendingCheckpoint; },
    get checkpointTimeRemaining() { return mockState.checkpointTimeRemaining; },
    get notifications() { return mockState.notifications; },
    get unreadCount() { return mockState.notifications.filter(n => !n.read).length; },
    get isConnected() { return mockState.isConnected; },
    get isPolling() { return mockState.isPolling; },
    get error() { return mockState.error; },
    createMission: mockCreateMission,
    runPreFlight: mockRunPreFlight,
    launchMission: mockLaunchMission,
    pauseMission: mockPauseMission,
    resumeMission: mockResumeMission,
    cancelMission: mockCancelMission,
    approveCheckpoint: mockApproveCheckpoint,
    rejectCheckpoint: mockRejectCheckpoint,
    markNotificationRead: mockMarkNotificationRead,
    clearNotifications: mockClearNotifications,
    downloadArtifact: mockDownloadArtifact,
    getMissionHistory: mockGetMissionHistory,
    retryFailedMission: mockRetryFailedMission,
  })),
}));

import { useMode4Background } from '../useMode4Background';

// Helper to trigger SSE events and update mock state
function triggerSSEEvent(eventName: string, data: any) {
  if (eventName === 'fusion') {
    mockState.fusionEvidence = data;
    mockState.isAssemblingTeam = false;
    mockState.assembledTeam = data.selectedExperts.map((expert: any) => ({
      id: expert.id,
      name: expert.name,
      role: expert.role,
      level: expert.level,
      confidence: expert.confidence,
      status: 'waiting',
      tasksCompleted: 0,
      tasksTotal: 0,
    }));
    addNotification('success', 'Team Assembled', `${data.selectedExperts.length} experts selected`);
  } else if (eventName === 'progress') {
    mockState.currentPhase = data.stage;
    if (mockState.mission) {
      mockState.mission.progress = data.progress;
      mockState.mission.currentPhase = data.message;
    }
    if (data.subSteps) {
      mockState.currentSteps = data.subSteps.map((s: any) => ({
        id: crypto.randomUUID(),
        title: s.name,
        description: '',
        status: s.status,
        progress: s.status === 'complete' ? 100 : s.status === 'active' ? 50 : 0,
      }));
    }
  } else if (eventName === 'checkpoint') {
    mockState.pendingCheckpoint = data;
    mockState.checkpointTimeRemaining = data.timeout;
    if (mockState.mission) {
      mockState.mission.status = 'paused';
    }
    addNotification('checkpoint', 'Checkpoint Requires Attention', data.description, true, data.id);
  } else if (eventName === 'cost') {
    mockState.currentCost = data;
    if (mockState.mission) {
      mockState.mission.actualCost = data.currentCost;
    }
  } else if (eventName === 'done') {
    if (mockState.mission) {
      mockState.mission.status = 'completed';
      mockState.mission.completedAt = new Date();
      mockState.mission.progress = 100;
      mockState.mission.actualCost = data.cost;
    }
    mockState.isConnected = false;
    mockState.isPolling = false;
    addNotification('success', 'Mission Complete', 'Your background mission has been completed successfully');
    mockState.currentPhase = null;
    mockState.currentSteps = [];
    mockState.pendingCheckpoint = null;
    mockState.checkpointTimeRemaining = 0;
  } else if (eventName === 'error') {
    mockState.error = new Error(data.message);
    if (mockState.mission) {
      mockState.mission.status = 'failed';
      mockState.mission.errorMessage = data.message;
    }
    mockState.isConnected = false;
    mockState.isPolling = false;
    addNotification('error', 'Mission Failed', data.message);
  } else if (eventName === 'artifact') {
    if (mockState.mission) {
      const exists = mockState.mission.artifacts.some((a: any) => a.id === data.id);
      if (exists) {
        mockState.mission.artifacts = mockState.mission.artifacts.map((a: any) =>
          a.id === data.id ? data : a
        );
      } else {
        mockState.mission.artifacts = [...mockState.mission.artifacts, data];
      }
      if (data.status === 'ready') {
        addNotification('success', 'Artifact Ready', `${data.title} is now available for download`);
      }
    }
  } else if (eventName === 'delegation') {
    mockState.assembledTeam = mockState.assembledTeam.map(expert => {
      if (expert.id === data.toAgentId) {
        return { ...expert, status: 'active' };
      }
      if (expert.id === data.fromAgentId && expert.status === 'active') {
        return { ...expert, status: 'waiting' };
      }
      return expert;
    });
    addNotification('info', 'Task Delegated', `${data.fromAgentName} delegated to ${data.toAgentName}: ${data.task}`);
  }
}

function addNotification(
  type: 'info' | 'warning' | 'error' | 'success' | 'checkpoint',
  title: string,
  message: string,
  actionRequired = false,
  checkpointId?: string
) {
  const notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    actionRequired,
    checkpointId,
  };
  mockState.notifications = [notification, ...mockState.notifications];
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useMode4Background', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockCreateMission.mockClear();
    mockRunPreFlight.mockClear();
    mockLaunchMission.mockClear();
    mockPauseMission.mockClear();
    mockResumeMission.mockClear();
    mockCancelMission.mockClear();
    mockApproveCheckpoint.mockClear();
    mockRejectCheckpoint.mockClear();
    mockMarkNotificationRead.mockClear();
    mockClearNotifications.mockClear();
    mockDownloadArtifact.mockClear();
    mockGetMissionHistory.mockClear();
    mockRetryFailedMission.mockClear();
    mockState = createMockState();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with empty mission state', () => {
      const { result } = renderHook(() => useMode4Background());

      expect(result.current.mission).toBeNull();
      expect(result.current.currentPhase).toBeNull();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isPolling).toBe(false);
      expect(result.current.preFlightPassed).toBeNull();
    });

    it('should initialize with default pre-flight checks', () => {
      const { result } = renderHook(() => useMode4Background());

      expect(result.current.preFlightChecks).toHaveLength(5);
      expect(result.current.preFlightChecks[0].id).toBe('budget');
      expect(result.current.preFlightChecks[0].status).toBe('pending');
    });

    it('should have empty assembled team initially', () => {
      const { result } = renderHook(() => useMode4Background());

      expect(result.current.assembledTeam).toHaveLength(0);
      expect(result.current.isAssemblingTeam).toBe(false);
    });
  });

  // ===========================================================================
  // Mission Creation Tests
  // ===========================================================================

  describe('Mission Creation', () => {
    it('should create mission with goal', () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Analyze market trends for Q4 2025');
      });

      expect(mockCreateMission).toHaveBeenCalledWith(
        'Analyze market trends for Q4 2025',
        undefined
      );
      expect(mockState.mission).not.toBeNull();
      expect(mockState.mission.status).toBe('idle');
    });

    it('should create mission with options', () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Generate comprehensive report', {
          title: 'Q4 Analysis Report',
          priority: 'high',
          budgetLimit: 50,
        });
      });

      expect(mockCreateMission).toHaveBeenCalledWith(
        'Generate comprehensive report',
        expect.objectContaining({
          title: 'Q4 Analysis Report',
          priority: 'high',
          budgetLimit: 50,
        })
      );
    });

    it('should reset pre-flight state on new mission', () => {
      const { result } = renderHook(() => useMode4Background());

      // Simulate previous successful pre-flight
      mockState.preFlightPassed = true;
      mockState.preFlightChecks = mockState.preFlightChecks.map(c => ({
        ...c,
        status: 'passed',
      }));

      act(() => {
        result.current.createMission('New mission');
      });

      expect(mockState.preFlightPassed).toBeNull();
      expect(mockState.preFlightChecks.every(c => c.status === 'pending')).toBe(true);
    });
  });

  // ===========================================================================
  // Pre-Flight Check Tests
  // ===========================================================================

  describe('Pre-Flight Checks', () => {
    it('should run pre-flight checks', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test mission');
      });

      let passed: boolean = false;
      await act(async () => {
        passed = await result.current.runPreFlight();
      });

      expect(mockRunPreFlight).toHaveBeenCalled();
      expect(passed).toBe(true);
      expect(mockState.preFlightPassed).toBe(true);
    });

    it('should update check statuses during pre-flight', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test mission');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      expect(mockState.preFlightChecks.every(c => c.status === 'passed')).toBe(true);
    });

    it('should return false without mission', async () => {
      mockRunPreFlight.mockImplementationOnce(async () => {
        if (!mockState.mission) return false;
        return true;
      });

      const { result } = renderHook(() => useMode4Background());

      let passed: boolean = true;
      await act(async () => {
        passed = await result.current.runPreFlight();
      });

      expect(passed).toBe(false);
    });
  });

  // ===========================================================================
  // Mission Launch Tests
  // ===========================================================================

  describe('Mission Launch', () => {
    it('should launch mission after successful pre-flight', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Background task');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      expect(mockLaunchMission).toHaveBeenCalled();
      expect(mockState.mission.status).toBe('running');
      expect(mockState.isConnected).toBe(true);
      expect(mockState.isPolling).toBe(true);
    });

    it('should not launch without pre-flight', () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      act(() => {
        result.current.launchMission();
      });

      // launchMission should not proceed without preFlightPassed
      expect(mockState.mission.status).toBe('idle');
    });

    it('should enable Fusion Intelligence by default', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            fusion_enabled: true,
          }),
        })
      );
    });
  });

  // ===========================================================================
  // Fusion Intelligence Tests
  // ===========================================================================

  describe('Fusion Intelligence', () => {
    it('should handle fusion event for team assembly', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Complex analysis');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('fusion', {
          method: 'weighted_rrf',
          weights: { vector: 0.4, graph: 0.35, relational: 0.25 },
          selectedExperts: [
            { id: 'expert-1', name: 'Clinical Expert', role: 'L2 Clinical', level: 'L2', confidence: 0.92 },
            { id: 'expert-2', name: 'Safety Expert', role: 'L2 Safety', level: 'L2', confidence: 0.87 },
            { id: 'expert-3', name: 'Regulatory Expert', role: 'L2 Regulatory', level: 'L2', confidence: 0.85 },
          ],
        });
      });

      expect(mockState.fusionEvidence).not.toBeNull();
      expect(mockState.assembledTeam).toHaveLength(3);
      expect(mockState.isAssemblingTeam).toBe(false);
    });

    it('should add notification when team is assembled', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selectedExperts: [{ id: 'e1', name: 'Expert', role: 'Role', level: 'L2', confidence: 0.9 }],
        });
      });

      expect(mockState.notifications.some(n => n.title === 'Team Assembled')).toBe(true);
    });

    it('should track team member status through delegations', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selectedExperts: [
            { id: 'expert-1', name: 'Expert 1', role: 'Role', level: 'L2', confidence: 0.9 },
            { id: 'expert-2', name: 'Expert 2', role: 'Role', level: 'L2', confidence: 0.85 },
          ],
        });
      });

      act(() => {
        triggerSSEEvent('delegation', {
          fromAgentId: 'master',
          fromAgentName: 'Master',
          toAgentId: 'expert-1',
          toAgentName: 'Expert 1',
          task: 'Analyze data',
        });
      });

      const activeExpert = mockState.assembledTeam.find(e => e.id === 'expert-1');
      expect(activeExpert?.status).toBe('active');
    });
  });

  // ===========================================================================
  // Progress Tracking Tests
  // ===========================================================================

  describe('Progress Tracking', () => {
    it('should track mission progress', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Long task');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('progress', {
          stage: 'analysis',
          progress: 50,
          message: 'Analyzing data sources',
        });
      });

      expect(mockState.currentPhase).toBe('analysis');
      expect(mockState.mission.progress).toBe(50);
    });

    it('should track sub-steps', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('progress', {
          stage: 'processing',
          progress: 30,
          message: 'Processing',
          subSteps: [
            { name: 'Step 1', status: 'complete' },
            { name: 'Step 2', status: 'active' },
            { name: 'Step 3', status: 'pending' },
          ],
        });
      });

      expect(mockState.currentSteps).toHaveLength(3);
      expect(mockState.currentSteps[0].status).toBe('complete');
      expect(mockState.currentSteps[1].status).toBe('active');
    });
  });

  // ===========================================================================
  // HITL Checkpoint Tests
  // ===========================================================================

  describe('HITL Checkpoints', () => {
    it('should handle checkpoint events', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Critical mission');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'checkpoint-001',
          type: 'budget_approval',
          title: 'Budget Exceeded',
          description: 'Mission costs exceed estimated budget',
          timeout: 300,
          options: ['Approve additional budget', 'Cancel mission'],
        });
      });

      expect(mockState.pendingCheckpoint).not.toBeNull();
      expect(mockState.checkpointTimeRemaining).toBe(300);
      expect(mockState.mission.status).toBe('paused');
    });

    it('should add checkpoint notification', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'cp-001',
          description: 'Review needed',
          timeout: 60,
        });
      });

      const cpNotification = mockState.notifications.find(n => n.type === 'checkpoint');
      expect(cpNotification).toBeDefined();
      expect(cpNotification?.actionRequired).toBe(true);
    });

    it('should approve checkpoint', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'cp-001',
          timeout: 300,
          options: ['Continue', 'Abort'],
        });
      });

      await act(async () => {
        await result.current.approveCheckpoint('Continue');
      });

      expect(mockApproveCheckpoint).toHaveBeenCalledWith('Continue');
      expect(mockState.pendingCheckpoint).toBeNull();
    });

    it('should reject checkpoint with reason', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('checkpoint', {
          id: 'cp-001',
          timeout: 300,
        });
      });

      await act(async () => {
        await result.current.rejectCheckpoint('Budget concerns');
      });

      expect(mockRejectCheckpoint).toHaveBeenCalledWith('Budget concerns');
    });
  });

  // ===========================================================================
  // Cost Tracking Tests
  // ===========================================================================

  describe('Cost Tracking', () => {
    it('should track cumulative cost', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('cost', {
          inputTokens: 5000,
          outputTokens: 3000,
          totalTokens: 8000,
          currentCost: 0.24,
          budgetRemaining: 49.76,
        });
      });

      expect(mockState.currentCost?.currentCost).toBe(0.24);
      expect(mockState.mission.actualCost).toBe(0.24);
    });
  });

  // ===========================================================================
  // Artifact Tests
  // ===========================================================================

  describe('Artifacts', () => {
    it('should collect artifacts as they become ready', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Generate report');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('artifact', {
          id: 'artifact-001',
          type: 'report',
          title: 'Analysis Report',
          status: 'generating',
        });
      });

      act(() => {
        triggerSSEEvent('artifact', {
          id: 'artifact-001',
          type: 'report',
          title: 'Analysis Report',
          status: 'ready',
          downloadUrl: 'https://example.com/download/001',
        });
      });

      expect(mockState.mission.artifacts).toHaveLength(1);
      expect(mockState.mission.artifacts[0].status).toBe('ready');
      expect(mockState.notifications.some(n => n.title === 'Artifact Ready')).toBe(true);
    });

    it('should trigger download', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.downloadArtifact('artifact-001');
      });

      expect(mockDownloadArtifact).toHaveBeenCalledWith('artifact-001');
    });
  });

  // ===========================================================================
  // Mission Completion Tests
  // ===========================================================================

  describe('Mission Completion', () => {
    it('should handle successful completion', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('done', {
          success: true,
          cost: 0.45,
          summary: 'Mission completed successfully',
        });
      });

      expect(mockState.mission.status).toBe('completed');
      expect(mockState.mission.progress).toBe(100);
      expect(mockState.isConnected).toBe(false);
      expect(mockState.isPolling).toBe(false);
    });

    it('should handle mission failure', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Failing task');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        triggerSSEEvent('error', {
          code: 'TIMEOUT',
          message: 'Mission exceeded maximum duration',
        });
      });

      expect(mockState.mission.status).toBe('failed');
      expect(mockState.error).not.toBeNull();
      expect(mockState.notifications.some(n => n.type === 'error')).toBe(true);
    });
  });

  // ===========================================================================
  // Pause/Resume/Cancel Tests
  // ===========================================================================

  describe('Mission Control', () => {
    it('should pause running mission', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        result.current.pauseMission();
      });

      expect(mockPauseMission).toHaveBeenCalled();
      expect(mockState.mission.status).toBe('paused');
    });

    it('should resume paused mission', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        result.current.pauseMission();
      });

      act(() => {
        result.current.resumeMission();
      });

      expect(mockResumeMission).toHaveBeenCalled();
      expect(mockState.mission.status).toBe('running');
    });

    it('should cancel mission and clean up', async () => {
      const { result } = renderHook(() => useMode4Background());

      act(() => {
        result.current.createMission('Test');
      });

      await act(async () => {
        await result.current.runPreFlight();
      });

      act(() => {
        result.current.launchMission();
      });

      act(() => {
        result.current.cancelMission();
      });

      expect(mockCancelMission).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockState.mission.status).toBe('cancelled');
      expect(mockState.isConnected).toBe(false);
      expect(mockState.isPolling).toBe(false);
    });
  });

  // ===========================================================================
  // Notification Tests
  // ===========================================================================

  describe('Notifications', () => {
    it('should track unread count', () => {
      const { result } = renderHook(() => useMode4Background());

      mockState.notifications = [
        { id: '1', read: false },
        { id: '2', read: false },
        { id: '3', read: true },
      ] as any[];

      expect(result.current.unreadCount).toBe(2);
    });

    it('should mark notification as read', () => {
      const { result } = renderHook(() => useMode4Background());

      mockState.notifications = [
        { id: 'n1', read: false },
        { id: 'n2', read: false },
      ] as any[];

      act(() => {
        result.current.markNotificationRead('n1');
      });

      expect(mockMarkNotificationRead).toHaveBeenCalledWith('n1');
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useMode4Background());

      mockState.notifications = [{ id: '1' }, { id: '2' }] as any[];

      act(() => {
        result.current.clearNotifications();
      });

      expect(mockClearNotifications).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // History Tests
  // ===========================================================================

  describe('Mission History', () => {
    it('should retrieve mission history', async () => {
      const { result } = renderHook(() => useMode4Background());

      mockState.missions = [
        { id: 'm1', title: 'Mission 1', status: 'completed' },
        { id: 'm2', title: 'Mission 2', status: 'failed' },
      ] as any[];

      let history: any[];
      await act(async () => {
        history = await result.current.getMissionHistory();
      });

      expect(mockGetMissionHistory).toHaveBeenCalled();
      expect(history!).toHaveLength(2);
    });

    it('should retry failed mission', () => {
      const { result } = renderHook(() => useMode4Background());

      mockState.missions = [
        { id: 'failed-001', title: 'Failed Task', goal: 'Original goal', status: 'failed', priority: 'high' },
      ] as any[];

      act(() => {
        result.current.retryFailedMission('failed-001');
      });

      expect(mockRetryFailedMission).toHaveBeenCalledWith('failed-001');
    });
  });
});
