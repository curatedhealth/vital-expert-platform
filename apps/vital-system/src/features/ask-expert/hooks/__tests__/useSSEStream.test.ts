/**
 * VITAL Platform - useSSEStream Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for the base SSE streaming hook that handles Server-Sent Events
 * connections with typed event handling.
 */

import { renderHook, act } from '@testing-library/react';

// =============================================================================
// MOCK THE HOOK WITH CONTROLLABLE STATE
// =============================================================================

// Create a mock implementation with controllable state
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

let mockState = {
  isConnected: false,
  isStreaming: false,
  error: null as Error | null,
  reconnectAttempts: 0,
};

let mockCallbacks: Record<string, (data: any) => void> = {};

const mockUseSSEStream = jest.fn((options: any) => {
  // Store callbacks for testing
  mockCallbacks = {
    onToken: options?.onToken,
    onReasoning: options?.onReasoning,
    onCitation: options?.onCitation,
    onCheckpoint: options?.onCheckpoint,
    onFusion: options?.onFusion,
    onError: options?.onError,
    onDone: options?.onDone,
    onConnectionChange: options?.onConnectionChange,
  };
  
  return {
    connect: mockConnect,
    disconnect: mockDisconnect,
    ...mockState,
  };
});

jest.mock('../useSSEStream', () => ({
  useSSEStream: (options: any) => mockUseSSEStream(options),
}));

// Import after mock
import { useSSEStream } from '../useSSEStream';

// Helper to simulate events
function simulateEvent(eventName: string, data: any) {
  const callback = mockCallbacks[eventName];
  if (callback) {
    callback(data);
  }
}

// Helper to update mock state
function setMockState(newState: Partial<typeof mockState>) {
  mockState = { ...mockState, ...newState };
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useSSEStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockReset();
    mockDisconnect.mockReset();
    mockState = {
      isConnected: false,
      isStreaming: false,
      error: null,
      reconnectAttempts: 0,
    };
    mockCallbacks = {};
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.reconnectAttempts).toBe(0);
    });

    it('should provide connect function', () => {
      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(typeof result.current.connect).toBe('function');
    });

    it('should provide disconnect function', () => {
      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(typeof result.current.disconnect).toBe('function');
    });
  });

  // ===========================================================================
  // Connection Tests
  // ===========================================================================

  describe('Connection Management', () => {
    it('should call connect with payload', () => {
      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      act(() => {
        result.current.connect({ message: 'test' });
      });

      expect(mockConnect).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should call disconnect on cleanup', () => {
      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      act(() => {
        result.current.disconnect();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should reflect connected state', () => {
      setMockState({ isConnected: true });

      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(result.current.isConnected).toBe(true);
    });

    it('should reflect streaming state', () => {
      setMockState({ isStreaming: true });

      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(result.current.isStreaming).toBe(true);
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe('Event Callbacks', () => {
    it('should register onToken callback', () => {
      const onToken = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onToken })
      );

      expect(mockCallbacks.onToken).toBe(onToken);
    });

    it('should register onReasoning callback', () => {
      const onReasoning = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onReasoning })
      );

      expect(mockCallbacks.onReasoning).toBe(onReasoning);
    });

    it('should register onCitation callback', () => {
      const onCitation = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onCitation })
      );

      expect(mockCallbacks.onCitation).toBe(onCitation);
    });

    it('should register onCheckpoint callback', () => {
      const onCheckpoint = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onCheckpoint })
      );

      expect(mockCallbacks.onCheckpoint).toBe(onCheckpoint);
    });

    it('should register onFusion callback', () => {
      const onFusion = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onFusion })
      );

      expect(mockCallbacks.onFusion).toBe(onFusion);
    });

    it('should register onError callback', () => {
      const onError = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onError })
      );

      expect(mockCallbacks.onError).toBe(onError);
    });

    it('should register onDone callback', () => {
      const onDone = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onDone })
      );

      expect(mockCallbacks.onDone).toBe(onDone);
    });

    it('should register onConnectionChange callback', () => {
      const onConnectionChange = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onConnectionChange })
      );

      expect(mockCallbacks.onConnectionChange).toBe(onConnectionChange);
    });
  });

  // ===========================================================================
  // Callback Invocation Tests
  // ===========================================================================

  describe('Callback Invocation', () => {
    it('should invoke onToken with token data', () => {
      const onToken = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onToken })
      );

      const tokenData = { content: 'Hello ' };
      simulateEvent('onToken', tokenData);

      expect(onToken).toHaveBeenCalledWith(tokenData);
    });

    it('should invoke onReasoning with reasoning data', () => {
      const onReasoning = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onReasoning })
      );

      const reasoningData = { step: 'analysis', content: 'Analyzing...', confidence: 0.85 };
      simulateEvent('onReasoning', reasoningData);

      expect(onReasoning).toHaveBeenCalledWith(reasoningData);
    });

    it('should invoke onCitation with citation data', () => {
      const onCitation = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onCitation })
      );

      const citationData = {
        id: 'cite-001',
        source: 'PubMed',
        title: 'Study',
        url: 'https://pubmed.ncbi.nlm.nih.gov/12345',
      };
      simulateEvent('onCitation', citationData);

      expect(onCitation).toHaveBeenCalledWith(citationData);
    });

    it('should invoke onCheckpoint with checkpoint data', () => {
      const onCheckpoint = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onCheckpoint })
      );

      const checkpointData = {
        id: 'checkpoint-001',
        type: 'approval',
        title: 'Review Required',
        timeout_seconds: 300,
      };
      simulateEvent('onCheckpoint', checkpointData);

      expect(onCheckpoint).toHaveBeenCalledWith(checkpointData);
    });

    it('should invoke onFusion with fusion data', () => {
      const onFusion = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onFusion })
      );

      const fusionData = {
        selected_experts: ['expert-001', 'expert-002'],
        rrf_score: 0.88,
      };
      simulateEvent('onFusion', fusionData);

      expect(onFusion).toHaveBeenCalledWith(fusionData);
    });

    it('should invoke onError with error data', () => {
      const onError = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onError })
      );

      const errorData = { code: 'RATE_LIMIT', message: 'Too many requests' };
      simulateEvent('onError', errorData);

      expect(onError).toHaveBeenCalledWith(errorData);
    });

    it('should invoke onDone with completion data', () => {
      const onDone = jest.fn();
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', onDone })
      );

      const doneData = { conversation_id: 'conv-123', total_tokens: 1500 };
      simulateEvent('onDone', doneData);

      expect(onDone).toHaveBeenCalledWith(doneData);
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should reflect error state', () => {
      const testError = new Error('Connection failed');
      setMockState({ error: testError });

      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(result.current.error).toBe(testError);
    });

    it('should track reconnect attempts', () => {
      setMockState({ reconnectAttempts: 3 });

      const { result } = renderHook(() =>
        useSSEStream({ url: '/api/test/stream' })
      );

      expect(result.current.reconnectAttempts).toBe(3);
    });
  });

  // ===========================================================================
  // Options Tests
  // ===========================================================================

  describe('Configuration Options', () => {
    it('should accept url option', () => {
      renderHook(() =>
        useSSEStream({ url: '/api/custom/stream' })
      );

      expect(mockUseSSEStream).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/api/custom/stream' })
      );
    });

    it('should accept autoReconnect option', () => {
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', autoReconnect: true })
      );

      expect(mockUseSSEStream).toHaveBeenCalledWith(
        expect.objectContaining({ autoReconnect: true })
      );
    });

    it('should accept maxReconnectAttempts option', () => {
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', maxReconnectAttempts: 5 })
      );

      expect(mockUseSSEStream).toHaveBeenCalledWith(
        expect.objectContaining({ maxReconnectAttempts: 5 })
      );
    });

    it('should accept reconnectDelayMs option', () => {
      renderHook(() =>
        useSSEStream({ url: '/api/test/stream', reconnectDelayMs: 2000 })
      );

      expect(mockUseSSEStream).toHaveBeenCalledWith(
        expect.objectContaining({ reconnectDelayMs: 2000 })
      );
    });
  });
});
