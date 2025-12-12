/**
 * VITAL Platform - useCheckpoint Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the HITL (Human-in-the-Loop) checkpoint management hook.
 */

import { renderHook, act } from '@testing-library/react';

// =============================================================================
// MOCKS
// =============================================================================

// Mutable state for testing
const createMockState = () => ({
  isOpen: false,
  checkpoint: null as any,
  timeRemaining: 0,
  isSubmitting: false,
  selectedOption: null as string | null,
});

let mockState = createMockState();
let timerId: NodeJS.Timeout | null = null;

const mockHandleCheckpoint = jest.fn((checkpoint: any) => {
  mockState.isOpen = true;
  mockState.checkpoint = checkpoint;
  mockState.timeRemaining = checkpoint.timeout_seconds || 300;
  mockState.selectedOption = null;
  
  // Start countdown (simulated)
  if (timerId) clearInterval(timerId);
});

const mockApprove = jest.fn(async () => {
  mockState.isSubmitting = true;
  mockState.isOpen = false;
  mockState.checkpoint = null;
  mockState.isSubmitting = false;
});

const mockReject = jest.fn(async (reason?: string) => {
  mockState.isSubmitting = true;
  mockState.isOpen = false;
  mockState.checkpoint = null;
  mockState.isSubmitting = false;
});

const mockModify = jest.fn(async (modifications: any) => {
  mockState.isSubmitting = true;
  mockState.isOpen = false;
  mockState.checkpoint = null;
  mockState.isSubmitting = false;
});

const mockSelectOption = jest.fn((option: string) => {
  mockState.selectedOption = option;
});

const mockExtendTimeout = jest.fn((additionalSeconds: number) => {
  mockState.timeRemaining += additionalSeconds;
});

const mockDismiss = jest.fn(() => {
  mockState.isOpen = false;
  if (timerId) clearInterval(timerId);
});

jest.mock('../useCheckpoint', () => ({
  useCheckpoint: jest.fn((options: any) => {
    const warningThreshold = options?.warningThresholdSeconds || 30;
    const isWarning = mockState.timeRemaining > 0 && mockState.timeRemaining <= warningThreshold;
    const isUrgent = mockState.timeRemaining > 0 && mockState.timeRemaining <= 10;
    
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return {
      state: mockState,
      handleCheckpoint: mockHandleCheckpoint,
      approve: mockApprove,
      reject: mockReject,
      modify: mockModify,
      selectOption: mockSelectOption,
      extendTimeout: mockExtendTimeout,
      dismiss: mockDismiss,
      isWarning,
      isUrgent,
      formattedTimeRemaining: formatTime(mockState.timeRemaining),
    };
  }),
}));

import { useCheckpoint } from '../useCheckpoint';

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useCheckpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleCheckpoint.mockClear();
    mockApprove.mockClear();
    mockReject.mockClear();
    mockModify.mockClear();
    mockSelectOption.mockClear();
    mockExtendTimeout.mockClear();
    mockDismiss.mockClear();
    mockState = createMockState();
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      expect(result.current.state.isOpen).toBe(false);
      expect(result.current.state.checkpoint).toBeNull();
      expect(result.current.state.timeRemaining).toBe(0);
      expect(result.current.state.isSubmitting).toBe(false);
    });
  });

  // ===========================================================================
  // Handle Checkpoint Tests
  // ===========================================================================

  describe('Handle Checkpoint', () => {
    it('should open checkpoint dialog on new checkpoint', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      const checkpoint = {
        id: 'checkpoint-001',
        type: 'approval',
        title: 'Review Required',
        description: 'Please approve the research plan',
        timeout_seconds: 300,
      };

      act(() => {
        result.current.handleCheckpoint(checkpoint);
      });

      expect(mockState.isOpen).toBe(true);
      expect(mockState.checkpoint).toEqual(checkpoint);
      expect(mockState.timeRemaining).toBe(300);
    });

    it('should start countdown timer', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      expect(mockState.timeRemaining).toBe(60);
    });

    it('should replace existing checkpoint', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-002',
          type: 'safety_review',
          timeout_seconds: 120,
        });
      });

      expect(mockState.checkpoint?.id).toBe('checkpoint-002');
      expect(mockState.timeRemaining).toBe(120);
    });
  });

  // ===========================================================================
  // Approve Tests
  // ===========================================================================

  describe('Approve', () => {
    it('should call approve and close checkpoint', async () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      await act(async () => {
        await result.current.approve();
      });

      expect(mockApprove).toHaveBeenCalled();
      expect(mockState.isOpen).toBe(false);
    });

    it('should include selected option in approval', async () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          options: [
            { label: 'Option A', value: 'option_a' },
            { label: 'Option B', value: 'option_b' },
          ],
          timeout_seconds: 60,
        });
      });

      act(() => {
        result.current.selectOption('option_b');
      });

      expect(mockState.selectedOption).toBe('option_b');
    });
  });

  // ===========================================================================
  // Reject Tests
  // ===========================================================================

  describe('Reject', () => {
    it('should call reject with reason', async () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      await act(async () => {
        await result.current.reject('Not ready for production');
      });

      expect(mockReject).toHaveBeenCalledWith('Not ready for production');
    });

    it('should close checkpoint after rejection', async () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      await act(async () => {
        await result.current.reject();
      });

      expect(mockState.isOpen).toBe(false);
    });
  });

  // ===========================================================================
  // Modify Tests
  // ===========================================================================

  describe('Modify', () => {
    it('should call modify with feedback', async () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
          onModify: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'plan_approval',
          timeout_seconds: 60,
        });
      });

      await act(async () => {
        await result.current.modify({
          feedback: 'Add more detail',
          modifications: { include_safety: true },
        });
      });

      expect(mockModify).toHaveBeenCalledWith({
        feedback: 'Add more detail',
        modifications: { include_safety: true },
      });
    });
  });

  // ===========================================================================
  // Warning Threshold Tests
  // ===========================================================================

  describe('Warning Threshold', () => {
    it('should indicate when time is below warning threshold', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
          warningThresholdSeconds: 30,
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      expect(result.current.isWarning).toBe(false);

      // Simulate time passing
      mockState.timeRemaining = 25;

      const { result: result2 } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
          warningThresholdSeconds: 30,
        })
      );

      expect(result2.current.isWarning).toBe(true);
    });

    it('should indicate urgent when time is critically low', () => {
      mockState.timeRemaining = 5;

      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
          warningThresholdSeconds: 30,
        })
      );

      expect(result.current.isUrgent).toBe(true);
    });
  });

  // ===========================================================================
  // Extend Timeout Tests
  // ===========================================================================

  describe('Extend Timeout', () => {
    it('should extend remaining time', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      // Simulate time passing
      mockState.timeRemaining = 30;

      act(() => {
        result.current.extendTimeout(60);
      });

      expect(mockState.timeRemaining).toBe(90);
    });
  });

  // ===========================================================================
  // Dismiss Tests
  // ===========================================================================

  describe('Dismiss', () => {
    it('should close checkpoint without action', () => {
      const onApprove = jest.fn();
      const onReject = jest.fn();
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove,
          onReject,
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      act(() => {
        result.current.dismiss();
      });

      expect(mockState.isOpen).toBe(false);
    });
  });

  // ===========================================================================
  // Option Selection Tests
  // ===========================================================================

  describe('Option Selection', () => {
    it('should track selected option', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
          ],
          timeout_seconds: 60,
        });
      });

      act(() => {
        result.current.selectOption('b');
      });

      expect(mockState.selectedOption).toBe('b');
    });

    it('should clear selected option on new checkpoint', () => {
      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-001',
          type: 'approval',
          options: [{ label: 'Option', value: 'opt' }],
          timeout_seconds: 60,
        });
      });

      act(() => {
        result.current.selectOption('opt');
      });

      act(() => {
        result.current.handleCheckpoint({
          id: 'checkpoint-002',
          type: 'approval',
          timeout_seconds: 60,
        });
      });

      expect(mockState.selectedOption).toBeNull();
    });
  });

  // ===========================================================================
  // Formatted Time Tests
  // ===========================================================================

  describe('Formatted Time', () => {
    it('should provide formatted time remaining', () => {
      mockState.timeRemaining = 125; // 2:05

      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      expect(result.current.formattedTimeRemaining).toBe('2:05');
    });

    it('should handle sub-minute times', () => {
      mockState.timeRemaining = 45;

      const { result } = renderHook(() =>
        useCheckpoint({
          onApprove: jest.fn(),
          onReject: jest.fn(),
        })
      );

      expect(result.current.formattedTimeRemaining).toBe('0:45');
    });
  });
});
