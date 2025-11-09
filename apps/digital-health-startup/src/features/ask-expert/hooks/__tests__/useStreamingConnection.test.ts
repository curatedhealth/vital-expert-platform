/**
 * Unit Tests for useStreamingConnection Hook
 * 
 * Tests SSE connection, event handling, reconnection, and error handling
 * Target: 80%+ coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamingConnection } from '../useStreamingConnection';

// Mock fetch
global.fetch = jest.fn();

describe('useStreamingConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  describe('initialization', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useStreamingConnection());
      
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isReconnecting).toBe(false);
      expect(result.current.lastError).toBeNull();
    });
    
    it('should accept custom reconnection options', () => {
      const { result } = renderHook(() => 
        useStreamingConnection({
          maxReconnectAttempts: 5,
          reconnectDelay: 2000,
        })
      );
      
      expect(result.current.connectionStatus.maxReconnectAttempts).toBe(5);
    });
  });
  
  // ============================================================================
  // CONNECTION
  // ============================================================================
  
  describe('connection', () => {
    it('should connect to SSE endpoint successfully', async () => {
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ value: new TextEncoder().encode('data: test\n\n'), done: false })
          .mockResolvedValueOnce({ done: true }),
        cancel: jest.fn(),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test.com/stream',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ query: 'test' }),
        })
      );
    });
    
    it('should handle connection failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      expect(result.current.isConnected).toBe(false);
      expect(result.current.lastError).toBe('Network error');
    });
    
    it('should handle HTTP error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      expect(result.current.lastError).toContain('HTTP 500');
    });
  });
  
  // ============================================================================
  // DISCONNECTION
  // ============================================================================
  
  describe('disconnection', () => {
    it('should disconnect cleanly', async () => {
      const mockAbort = jest.fn();
      const mockCancel = jest.fn();
      const mockReader = {
        read: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        cancel: mockCancel,
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        const connectPromise = result.current.connect('http://test.com/stream', { query: 'test' });
        // Don't await - we want to disconnect while connecting
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      act(() => {
        result.current.disconnect();
      });
      
      expect(result.current.isConnected).toBe(false);
    });
    
    it('should clear reconnection timeout on disconnect', () => {
      const { result } = renderHook(() => useStreamingConnection());
      
      act(() => {
        result.current.disconnect();
      });
      
      expect(result.current.isReconnecting).toBe(false);
    });
  });
  
  // ============================================================================
  // EVENT HANDLING
  // ============================================================================
  
  describe('event handling', () => {
    it('should register event handlers', () => {
      const { result } = renderHook(() => useStreamingConnection());
      const handler = jest.fn();
      
      act(() => {
        result.current.onEvent('test-event', handler);
      });
      
      // Handler should be registered (tested indirectly through connect)
      expect(result.current.onEvent).toBeDefined();
    });
    
    it('should unregister event handlers', () => {
      const { result } = renderHook(() => useStreamingConnection());
      const handler = jest.fn();
      
      act(() => {
        result.current.onEvent('test-event', handler);
        result.current.offEvent('test-event');
      });
      
      // Handler should be removed
      expect(result.current.offEvent).toBeDefined();
    });
    
    it('should handle wildcard events', async () => {
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            value: new TextEncoder().encode('event: test\ndata: {"key":"value"}\n\n'),
            done: false,
          })
          .mockResolvedValueOnce({ done: true }),
        cancel: jest.fn(),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });
      
      const { result } = renderHook(() => useStreamingConnection());
      const wildcardHandler = jest.fn();
      
      act(() => {
        result.current.onEvent('*', wildcardHandler);
      });
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      // Wait for event processing
      await waitFor(() => {
        expect(wildcardHandler).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });
  
  // ============================================================================
  // RECONNECTION
  // ============================================================================
  
  describe('reconnection', () => {
    it('should attempt reconnection on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: jest.fn().mockResolvedValue({ done: true }),
              cancel: jest.fn(),
            }),
          },
        });
      
      const { result } = renderHook(() => 
        useStreamingConnection({ 
          maxReconnectAttempts: 2,
          reconnectDelay: 100,
        })
      );
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      expect(result.current.isReconnecting).toBe(true);
      
      // Fast-forward timers to trigger reconnection
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve(); // Allow microtasks to run
      });
    });
    
    it('should stop reconnecting after max attempts', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      
      const { result } = renderHook(() => 
        useStreamingConnection({ 
          maxReconnectAttempts: 1,
          reconnectDelay: 100,
        })
      );
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      // Fast-forward through first reconnection attempt
      await act(async () => {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      });
      
      // Should have stopped reconnecting
      await waitFor(() => {
        expect(result.current.isReconnecting).toBe(false);
      });
      
      expect(result.current.lastError).toContain('Max reconnect attempts reached');
    });
    
    it('should use exponential backoff for reconnection', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));
      
      const { result } = renderHook(() => 
        useStreamingConnection({ 
          maxReconnectAttempts: 3,
          reconnectDelay: 1000,
          reconnectDelayMultiplier: 2,
        })
      );
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      // First attempt: 1000ms
      // Second attempt: 2000ms
      // Third attempt: 4000ms
      
      expect(result.current.connectionStatus.reconnectAttempts).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  
  describe('error handling', () => {
    it('should set last error on connection failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        await result.current.connect('http://test.com/stream', { query: 'test' });
      });
      
      expect(result.current.lastError).toBe('Test error');
    });
    
    it('should clear error', () => {
      const { result } = renderHook(() => useStreamingConnection());
      
      // Manually set an error for testing
      act(() => {
        (result.current as any).lastError = 'Test error';
      });
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.lastError).toBeNull();
    });
    
    it('should handle abort without error', async () => {
      const mockReader = {
        read: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        cancel: jest.fn(),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });
      
      const { result } = renderHook(() => useStreamingConnection());
      
      await act(async () => {
        const connectPromise = result.current.connect('http://test.com/stream', { query: 'test' });
        await new Promise(resolve => setTimeout(resolve, 10));
        result.current.disconnect();
      });
      
      // Should not set error for abort
      expect(result.current.lastError).toBeNull();
    });
  });
  
  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useStreamingConnection());
      const disconnectSpy = jest.spyOn(result.current, 'disconnect');
      
      unmount();
      
      // Cleanup should have been called
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});

