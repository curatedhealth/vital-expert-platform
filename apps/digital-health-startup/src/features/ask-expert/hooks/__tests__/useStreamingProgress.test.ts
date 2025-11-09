/**
 * Unit Tests for useStreamingProgress Hook
 * 
 * Tests streaming progress tracking, stage management, and time estimation
 * Target: 85%+ coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamingProgress } from '../useStreamingProgress';

describe('useStreamingProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with idle state', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      expect(result.current.stage).toBe('idle');
      expect(result.current.percentComplete).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.totalTokens).toBe(0);
      expect(result.current.tokensPerSecond).toBe(0);
      expect(result.current.elapsedTimeMs).toBe(0);
    });
    
    it('should accept expected tokens configuration', () => {
      const { result } = renderHook(() => useStreamingProgress({
        expectedTotalTokens: 1000,
      }));
      
      expect(result.current.expectedTokens).toBe(1000);
    });
  });
  
  // ============================================================================
  // STAGE MANAGEMENT
  // ============================================================================
  
  describe('stage management', () => {
    it('should start with thinking stage', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.stage).toBe('thinking');
      expect(result.current.isActive).toBe(true);
      expect(result.current.startTime).not.toBeNull();
    });
    
    it('should skip thinking stage if disabled', () => {
      const { result } = renderHook(() => useStreamingProgress({
        showThinkingStage: false,
      }));
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.stage).toBe('streaming');
    });
    
    it('should change stages', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.setStage('streaming');
      });
      
      expect(result.current.stage).toBe('streaming');
      
      act(() => {
        result.current.setStage('tools');
      });
      
      expect(result.current.stage).toBe('tools');
    });
    
    it('should call onStageChange callback', () => {
      const onStageChange = jest.fn();
      const { result } = renderHook(() => useStreamingProgress({ onStageChange }));
      
      act(() => {
        result.current.start();
      });
      
      expect(onStageChange).toHaveBeenCalledWith('thinking');
      
      act(() => {
        result.current.setStage('streaming');
      });
      
      expect(onStageChange).toHaveBeenCalledWith('streaming');
    });
    
    it('should complete streaming', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useStreamingProgress({ onComplete }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.complete();
      });
      
      expect(result.current.stage).toBe('complete');
      expect(result.current.percentComplete).toBe(100);
      expect(result.current.isActive).toBe(false);
      expect(onComplete).toHaveBeenCalled();
    });
    
    it('should set error state', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.setError('Connection failed');
      });
      
      expect(result.current.stage).toBe('error');
      expect(result.current.isActive).toBe(false);
      expect(result.current.stageMessage).toBe('Connection failed');
    });
  });
  
  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================
  
  describe('progress tracking', () => {
    it('should update progress manually', () => {
      const onProgressUpdate = jest.fn();
      const { result } = renderHook(() => useStreamingProgress({ onProgressUpdate }));
      
      act(() => {
        result.current.updateProgress(50);
      });
      
      expect(result.current.percentComplete).toBe(50);
      expect(onProgressUpdate).toHaveBeenCalledWith(50);
    });
    
    it('should clamp progress between 0-100', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.updateProgress(150);
      });
      
      expect(result.current.percentComplete).toBe(100);
      
      act(() => {
        result.current.updateProgress(-50);
      });
      
      expect(result.current.percentComplete).toBe(0);
    });
    
    it('should calculate progress from tokens if expected tokens is set', () => {
      const { result } = renderHook(() => useStreamingProgress({
        expectedTotalTokens: 100,
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.recordToken();
        }
      });
      
      expect(result.current.percentComplete).toBe(50);
    });
  });
  
  // ============================================================================
  // TOKEN TRACKING
  // ============================================================================
  
  describe('token tracking', () => {
    it('should record single token', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.recordToken();
      });
      
      expect(result.current.totalTokens).toBe(1);
    });
    
    it('should record multiple tokens', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.recordTokens(10);
      });
      
      expect(result.current.totalTokens).toBe(10);
    });
    
    it('should calculate tokens per second', async () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      // Record tokens over time
      act(() => {
        result.current.recordTokens(50);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
      
      act(() => {
        result.current.recordTokens(50);
      });
      
      // Should have some TPS calculated
      expect(result.current.tokensPerSecond).toBeGreaterThan(0);
    });
    
    it('should calculate average tokens per second', async () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.recordTokens(100);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
      
      expect(result.current.avgTokensPerSecond).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // TIME TRACKING
  // ============================================================================
  
  describe('time tracking', () => {
    it('should track elapsed time', async () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(3000);
        await Promise.resolve();
      });
      
      expect(result.current.elapsedTimeMs).toBeGreaterThanOrEqual(3000);
    });
    
    it('should estimate time remaining', () => {
      const { result } = renderHook(() => useStreamingProgress({
        expectedTotalTokens: 100,
        estimateCompletionTime: true,
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.recordTokens(50);
      });
      
      jest.advanceTimersByTime(1000);
      
      act(() => {
        result.current.recordToken();
      });
      
      // Should have some time estimate
      expect(result.current.estimatedTimeMs).not.toBeNull();
    });
    
    it('should not estimate time if disabled', () => {
      const { result } = renderHook(() => useStreamingProgress({
        expectedTotalTokens: 100,
        estimateCompletionTime: false,
      }));
      
      act(() => {
        result.current.start();
      });
      
      act(() => {
        result.current.recordTokens(50);
      });
      
      expect(result.current.estimatedTimeMs).toBeNull();
    });
  });
  
  // ============================================================================
  // STAGE DURATIONS
  // ============================================================================
  
  describe('stage durations', () => {
    it('should track stage durations', async () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
      
      act(() => {
        result.current.setStage('streaming');
      });
      
      expect(result.current.stageDurations.thinking).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // RESET
  // ============================================================================
  
  describe('reset', () => {
    it('should reset to idle state', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.start();
        result.current.recordTokens(50);
        result.current.updateProgress(50);
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.stage).toBe('idle');
      expect(result.current.percentComplete).toBe(0);
      expect(result.current.totalTokens).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.elapsedTimeMs).toBe(0);
    });
  });
  
  // ============================================================================
  // EXPECTED TOKENS
  // ============================================================================
  
  describe('expected tokens', () => {
    it('should set expected tokens', () => {
      const { result } = renderHook(() => useStreamingProgress());
      
      act(() => {
        result.current.setExpectedTokens(500);
      });
      
      expect(result.current.expectedTokens).toBe(500);
    });
  });
  
  // ============================================================================
  // INTEGRATION
  // ============================================================================
  
  describe('integration scenarios', () => {
    it('should handle full streaming lifecycle', async () => {
      const { result } = renderHook(() => useStreamingProgress({
        expectedTotalTokens: 100,
      }));
      
      // Start
      act(() => {
        result.current.start();
      });
      
      expect(result.current.stage).toBe('thinking');
      
      // Move to streaming
      act(() => {
        result.current.setStage('streaming');
      });
      
      expect(result.current.stage).toBe('streaming');
      
      // Receive tokens
      act(() => {
        result.current.recordTokens(50);
      });
      
      expect(result.current.totalTokens).toBe(50);
      expect(result.current.percentComplete).toBe(50);
      
      // More tokens
      act(() => {
        result.current.recordTokens(50);
      });
      
      expect(result.current.totalTokens).toBe(100);
      expect(result.current.percentComplete).toBe(100);
      
      // Complete
      act(() => {
        result.current.complete();
      });
      
      expect(result.current.stage).toBe('complete');
      expect(result.current.isActive).toBe(false);
    });
  });
});

