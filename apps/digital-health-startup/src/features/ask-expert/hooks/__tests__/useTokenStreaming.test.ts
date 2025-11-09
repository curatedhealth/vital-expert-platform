/**
 * Unit Tests for useTokenStreaming Hook
 * 
 * Tests token-by-token streaming with animation and backpressure
 * Target: 85%+ coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTokenStreaming } from '../useTokenStreaming';

describe('useTokenStreaming', () => {
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
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.bufferSize).toBe(0);
      expect(result.current.isBufferFull).toBe(false);
      expect(result.current.tokensEmitted).toBe(0);
      expect(result.current.tokensReceived).toBe(0);
      expect(result.current.tokensPerSecond).toBe(0);
      expect(result.current.startTime).toBe(null);
    });
    
    it('should accept custom configuration', () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 50,
        enableAnimation: false,
        maxBufferSize: 200,
      }));
      
      expect(result.current.isStreaming).toBe(false);
    });
  });
  
  // ============================================================================
  // TOKEN ADDITION
  // ============================================================================
  
  describe('token addition', () => {
    it('should add token to buffer', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.addToken('Hello');
      });
      
      expect(result.current.bufferSize).toBe(1);
      expect(result.current.tokensReceived).toBe(1);
    });
    
    it('should add multiple tokens', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.addTokens(['Hello', ' ', 'world']);
      });
      
      expect(result.current.bufferSize).toBe(3);
      expect(result.current.tokensReceived).toBe(3);
    });
    
    it('should emit tokens immediately when animation is disabled', () => {
      const { result } = renderHook(() => useTokenStreaming({
        enableAnimation: false,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addToken('Hello');
      });
      
      expect(callback).toHaveBeenCalledWith('Hello');
      expect(result.current.tokensEmitted).toBe(1);
    });
  });
  
  // ============================================================================
  // STREAMING
  // ============================================================================
  
  describe('streaming', () => {
    it('should start streaming', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.start();
      });
      
      expect(result.current.isStreaming).toBe(true);
      expect(result.current.startTime).not.toBeNull();
    });
    
    it('should pause streaming', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.start();
        result.current.pause();
      });
      
      expect(result.current.isPaused).toBe(true);
    });
    
    it('should resume streaming', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.start();
        result.current.pause();
        result.current.resume();
      });
      
      expect(result.current.isPaused).toBe(false);
    });
    
    it('should stop streaming and clear buffer', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.addTokens(['Hello', ' ', 'world']);
        result.current.start();
      });
      
      act(() => {
        result.current.stop();
      });
      
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.bufferSize).toBe(0);
      expect(result.current.tokensEmitted).toBe(0);
      expect(result.current.tokensReceived).toBe(0);
    });
  });
  
  // ============================================================================
  // TOKEN EMISSION
  // ============================================================================
  
  describe('token emission', () => {
    it('should emit tokens with delay', async () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 30,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['H', 'e', 'l', 'l', 'o']);
        result.current.start();
      });
      
      // Advance time to emit all tokens
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          jest.advanceTimersByTime(30);
          await Promise.resolve(); // Let animation frame execute
        }
      });
      
      expect(callback).toHaveBeenCalledTimes(5);
    });
    
    it('should respect delay between tokens', async () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 50,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B']);
        result.current.start();
      });
      
      // After 40ms, nothing should be emitted
      await act(async () => {
        jest.advanceTimersByTime(40);
        await Promise.resolve();
      });
      
      expect(callback).not.toHaveBeenCalled();
      
      // After 50ms, first token emitted
      await act(async () => {
        jest.advanceTimersByTime(10);
        await Promise.resolve();
      });
      
      expect(callback).toHaveBeenCalledWith('A');
    });
    
    it('should not emit when paused', async () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 30,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
        result.current.start();
        result.current.pause();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
  
  // ============================================================================
  // BACKPRESSURE
  // ============================================================================
  
  describe('backpressure', () => {
    it('should detect buffer full', () => {
      const { result } = renderHook(() => useTokenStreaming({
        maxBufferSize: 3,
      }));
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
      });
      
      expect(result.current.isBufferFull).toBe(true);
    });
    
    it('should call onBufferFull callback', () => {
      const onBufferFull = jest.fn();
      const { result } = renderHook(() => useTokenStreaming({
        maxBufferSize: 2,
        onBufferFull,
      }));
      
      act(() => {
        result.current.addTokens(['A', 'B']);
      });
      
      expect(onBufferFull).toHaveBeenCalled();
    });
    
    it('should call onBufferReady when space available', async () => {
      const onBufferReady = jest.fn();
      const { result } = renderHook(() => useTokenStreaming({
        maxBufferSize: 2,
        delayBetweenTokens: 10,
        onBufferReady,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B']);
        result.current.start();
      });
      
      // Emit one token to free space
      await act(async () => {
        jest.advanceTimersByTime(10);
        await Promise.resolve();
      });
      
      expect(onBufferReady).toHaveBeenCalled();
    });
  });
  
  // ============================================================================
  // METRICS
  // ============================================================================
  
  describe('metrics', () => {
    it('should track tokens emitted', async () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 10,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
        result.current.start();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(30);
        await Promise.resolve();
      });
      
      expect(result.current.tokensEmitted).toBe(3);
    });
    
    it('should calculate tokens per second', async () => {
      const { result } = renderHook(() => useTokenStreaming({
        delayBetweenTokens: 100, // 10 tokens/sec
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C', 'D', 'E']);
        result.current.start();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(500);
        await Promise.resolve();
      });
      
      // Should be around 10 tokens/sec
      expect(result.current.tokensPerSecond).toBeGreaterThan(0);
    });
    
    it('should track elapsed time', async () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.start();
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve();
      });
      
      expect(result.current.elapsedTimeMs).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // BUFFER MANAGEMENT
  // ============================================================================
  
  describe('buffer management', () => {
    it('should clear buffer', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
      });
      
      expect(result.current.bufferSize).toBe(3);
      
      act(() => {
        result.current.clearBuffer();
      });
      
      expect(result.current.bufferSize).toBe(0);
    });
    
    it('should flush buffer immediately', () => {
      const { result } = renderHook(() => useTokenStreaming());
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
      });
      
      act(() => {
        result.current.flush();
      });
      
      expect(callback).toHaveBeenCalledTimes(3);
      expect(result.current.bufferSize).toBe(0);
    });
    
    it('should reset metrics', () => {
      const { result } = renderHook(() => useTokenStreaming({
        enableAnimation: false,
      }));
      
      act(() => {
        result.current.addTokens(['A', 'B', 'C']);
      });
      
      expect(result.current.tokensEmitted).toBe(3);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.tokensEmitted).toBe(0);
      expect(result.current.tokensReceived).toBe(0);
    });
  });
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  describe('event handlers', () => {
    it('should register token callback', () => {
      const { result } = renderHook(() => useTokenStreaming({
        enableAnimation: false,
      }));
      
      const callback = jest.fn();
      result.current.onToken(callback);
      
      act(() => {
        result.current.addToken('Hello');
      });
      
      expect(callback).toHaveBeenCalledWith('Hello');
    });
    
    it('should support multiple callbacks', () => {
      const { result } = renderHook(() => useTokenStreaming({
        enableAnimation: false,
      }));
      
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      result.current.onToken(callback1);
      result.current.onToken(callback2);
      
      act(() => {
        result.current.addToken('Test');
      });
      
      expect(callback1).toHaveBeenCalledWith('Test');
      expect(callback2).toHaveBeenCalledWith('Test');
    });
    
    it('should unsubscribe callback', () => {
      const { result } = renderHook(() => useTokenStreaming({
        enableAnimation: false,
      }));
      
      const callback = jest.fn();
      const unsubscribe = result.current.onToken(callback);
      
      act(() => {
        unsubscribe();
      });
      
      act(() => {
        result.current.addToken('Test');
      });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

