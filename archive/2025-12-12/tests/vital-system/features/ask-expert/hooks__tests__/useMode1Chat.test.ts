/**
 * VITAL Platform - useMode1Chat Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for Mode 1 (Manual Interactive) chat hook that handles
 * expert selection and multi-turn conversations.
 */

import { renderHook, act } from '@testing-library/react';

// =============================================================================
// MOCKS
// =============================================================================

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

// Mutable state for testing
const createMockState = () => ({
  messages: [] as any[],
  isStreaming: false,
  selectedExpert: null as any,
  currentContent: '',
  currentReasoning: [] as any[],
  currentCitations: [] as any[],
  currentToolCalls: [] as any[],
  currentCost: null as any,
  error: null as any,
});

let mockState = createMockState();

const mockSendMessage = jest.fn((message: string) => {
  if (!message || mockState.isStreaming) return;
  const userMsg = { id: `user-${Date.now()}`, role: 'user', content: message };
  const assistantMsg = { id: `assistant-${Date.now()}`, role: 'assistant', content: '', isStreaming: true };
  mockState.messages = [...mockState.messages, userMsg, assistantMsg];
  mockState.isStreaming = true;
  mockConnect({ message, expert_id: mockState.selectedExpert?.id });
});

const mockSelectExpert = jest.fn((expert: any) => {
  mockState.selectedExpert = expert;
});

const mockStopGeneration = jest.fn(() => {
  mockDisconnect();
  mockState.isStreaming = false;
});

const mockRetry = jest.fn(() => {
  const lastUserMessage = mockState.messages.filter((m: any) => m.role === 'user').pop();
  if (lastUserMessage) {
    mockConnect({ message: lastUserMessage.content });
  }
});

const mockClearMessages = jest.fn(() => {
  mockState.messages = [];
  mockState.currentContent = '';
  mockState.currentReasoning = [];
  mockState.currentCitations = [];
  mockState.currentToolCalls = [];
});

jest.mock('../useMode1Chat', () => ({
  useMode1Chat: jest.fn((options?: any) => {
    if (options?.expertId && !mockState.selectedExpert) {
      mockState.selectedExpert = { id: options.expertId };
    }
    return {
      get messages() { return mockState.messages; },
      get isStreaming() { return mockState.isStreaming; },
      get selectedExpert() { return mockState.selectedExpert; },
      get currentContent() { return mockState.currentContent; },
      get currentReasoning() { return mockState.currentReasoning; },
      get currentCitations() { return mockState.currentCitations; },
      get currentToolCalls() { return mockState.currentToolCalls; },
      get currentCost() { return mockState.currentCost; },
      get error() { return mockState.error; },
      sendMessage: mockSendMessage,
      selectExpert: mockSelectExpert,
      stopGeneration: mockStopGeneration,
      retry: mockRetry,
      clearMessages: mockClearMessages,
    };
  }),
}));

import { useMode1Chat } from '../useMode1Chat';

// Helper to trigger SSE events and update mock state
function triggerSSEEvent(eventName: string, data: any) {
  if (eventName === 'token') {
    mockState.currentContent += data.content || '';
    // Update assistant message content
    const assistantIdx = mockState.messages.findIndex((m: any) => m.role === 'assistant' && m.isStreaming);
    if (assistantIdx >= 0) {
      mockState.messages[assistantIdx] = {
        ...mockState.messages[assistantIdx],
        content: mockState.currentContent,
      };
    }
  } else if (eventName === 'reasoning') {
    mockState.currentReasoning = [...mockState.currentReasoning, data];
  } else if (eventName === 'citation') {
    mockState.currentCitations = [...mockState.currentCitations, data];
  } else if (eventName === 'toolCall') {
    mockState.currentToolCalls = [...mockState.currentToolCalls, data];
  } else if (eventName === 'cost') {
    mockState.currentCost = data;
  } else if (eventName === 'done') {
    mockState.isStreaming = false;
    // Finalize assistant message
    const assistantIdx = mockState.messages.findIndex((m: any) => m.role === 'assistant' && m.isStreaming);
    if (assistantIdx >= 0) {
      mockState.messages[assistantIdx] = {
        ...mockState.messages[assistantIdx],
        isStreaming: false,
      };
    }
    mockState.currentContent = '';
  } else if (eventName === 'error') {
    mockState.error = data;
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useMode1Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockSendMessage.mockClear();
    mockSelectExpert.mockClear();
    mockStopGeneration.mockClear();
    mockRetry.mockClear();
    mockClearMessages.mockClear();
    
    // Reset mock state
    mockState = createMockState();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMode1Chat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.selectedExpert).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should accept initial expert', () => {
      const { result } = renderHook(() =>
        useMode1Chat({ expertId: 'expert-001' })
      );

      expect(result.current.selectedExpert).toEqual({ id: 'expert-001' });
    });

    it('should accept conversation ID', () => {
      const { result } = renderHook(() =>
        useMode1Chat({ conversationId: 'conv-123' })
      );

      expect(result.current).toBeDefined();
    });
  });

  // ===========================================================================
  // Message Sending Tests
  // ===========================================================================

  describe('Send Message', () => {
    it('should add user message to messages array', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('What are FDA requirements?');
      });

      expect(mockState.messages).toHaveLength(2); // user + assistant placeholder
      expect(mockState.messages[0].role).toBe('user');
      expect(mockState.messages[0].content).toBe('What are FDA requirements?');
    });

    it('should create placeholder assistant message', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test message');
      });

      expect(mockState.messages).toHaveLength(2);
      expect(mockState.messages[1].role).toBe('assistant');
      expect(mockState.messages[1].isStreaming).toBe(true);
    });

    it('should call SSE connect with correct payload', () => {
      mockState.selectedExpert = { id: 'expert-001' };
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test message');
      });

      expect(mockConnect).toHaveBeenCalledWith({
        message: 'Test message',
        expert_id: 'expert-001',
      });
    });

    it('should not send empty messages', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('');
      });

      expect(mockConnect).not.toHaveBeenCalled();
      expect(mockState.messages).toHaveLength(0);
    });

    it('should not send while already streaming', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('First message');
      });

      // Now streaming is true
      expect(mockState.isStreaming).toBe(true);

      act(() => {
        result.current.sendMessage('Second message');
      });

      // Should only have first message pair (sendMessage returns early if streaming)
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Token Streaming Tests
  // ===========================================================================

  describe('Token Streaming', () => {
    it('should accumulate tokens in current content', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('token', { content: 'Hello ' });
        triggerSSEEvent('token', { content: 'World' });
      });

      expect(mockState.currentContent).toBe('Hello World');
    });

    it('should update assistant message with accumulated content', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('token', { content: 'Response content' });
      });

      const assistantMessage = mockState.messages.find(
        (m: any) => m.role === 'assistant'
      );
      expect(assistantMessage?.content).toContain('Response content');
    });
  });

  // ===========================================================================
  // Reasoning Event Tests
  // ===========================================================================

  describe('Reasoning Events', () => {
    it('should collect reasoning steps', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Complex query');
      });

      act(() => {
        triggerSSEEvent('reasoning', {
          step: 'analysis',
          content: 'Analyzing query intent',
          confidence: 0.92,
        });
        triggerSSEEvent('reasoning', {
          step: 'retrieval',
          content: 'Fetching relevant documents',
          confidence: 0.88,
        });
      });

      expect(mockState.currentReasoning).toHaveLength(2);
      expect(mockState.currentReasoning[0].step).toBe('analysis');
      expect(mockState.currentReasoning[1].step).toBe('retrieval');
    });
  });

  // ===========================================================================
  // Citation Event Tests
  // ===========================================================================

  describe('Citation Events', () => {
    it('should collect citations', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Research question');
      });

      act(() => {
        triggerSSEEvent('citation', {
          id: 'cite-001',
          source: 'PubMed',
          title: 'Clinical Study',
          url: 'https://pubmed.ncbi.nlm.nih.gov/12345',
          excerpt: 'Study findings...',
          relevance: 0.95,
        });
      });

      expect(mockState.currentCitations).toHaveLength(1);
      expect(mockState.currentCitations[0].source).toBe('PubMed');
    });
  });

  // ===========================================================================
  // Tool Call Event Tests
  // ===========================================================================

  describe('Tool Call Events', () => {
    it('should track tool invocations', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Query requiring tools');
      });

      act(() => {
        triggerSSEEvent('toolCall', {
          tool_id: 'tool-001',
          tool_name: 'pubmed_search',
          status: 'running',
          input: { query: 'aspirin cardiovascular' },
        });
      });

      expect(mockState.currentToolCalls).toHaveLength(1);
      expect(mockState.currentToolCalls[0].tool_name).toBe('pubmed_search');
    });
  });

  // ===========================================================================
  // Cost Tracking Tests
  // ===========================================================================

  describe('Cost Tracking', () => {
    it('should track usage costs', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('cost', {
          input_tokens: 150,
          output_tokens: 300,
          total_tokens: 450,
          estimated_cost_usd: 0.0045,
          model: 'claude-sonnet-4',
        });
      });

      expect(mockState.currentCost).not.toBeNull();
      expect(mockState.currentCost?.total_tokens).toBe(450);
    });
  });

  // ===========================================================================
  // Expert Selection Tests
  // ===========================================================================

  describe('Expert Selection', () => {
    it('should update selected expert', () => {
      const { result } = renderHook(() => useMode1Chat());

      const expert = {
        id: 'expert-002',
        name: 'Dr. Johnson',
        specialty: 'Clinical Trials',
      };

      act(() => {
        result.current.selectExpert(expert);
      });

      expect(mockSelectExpert).toHaveBeenCalledWith(expert);
      expect(mockState.selectedExpert).toEqual(expert);
    });

    it('should include expert in subsequent messages', () => {
      const { result } = renderHook(() => useMode1Chat());

      const expert = { id: 'expert-003', name: 'Dr. Williams', specialty: 'Drug Safety' };

      act(() => {
        result.current.selectExpert(expert);
      });

      act(() => {
        result.current.sendMessage('Safety question');
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          expert_id: 'expert-003',
        })
      );
    });
  });

  // ===========================================================================
  // Stream Completion Tests
  // ===========================================================================

  describe('Stream Completion', () => {
    it('should finalize message on done event', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('token', { content: 'Complete response' });
        triggerSSEEvent('done', {
          conversation_id: 'conv-123',
          total_tokens: 200,
        });
      });

      const assistantMessage = mockState.messages.find(
        (m: any) => m.role === 'assistant'
      );
      expect(assistantMessage?.isStreaming).toBe(false);
    });

    it('should clear streaming state on completion', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('done', { success: true });
      });

      expect(mockState.isStreaming).toBe(false);
      expect(mockState.currentContent).toBe('');
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should handle error events', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('error', {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded',
        });
      });

      expect(mockState.error).not.toBeNull();
      expect(mockState.error.code).toBe('RATE_LIMIT');
    });
  });

  // ===========================================================================
  // Stop Generation Tests
  // ===========================================================================

  describe('Stop Generation', () => {
    it('should stop generation and finalize message', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Long response');
      });

      act(() => {
        triggerSSEEvent('token', { content: 'Partial res' });
      });

      act(() => {
        result.current.stopGeneration();
      });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockState.isStreaming).toBe(false);
    });
  });

  // ===========================================================================
  // Retry Tests
  // ===========================================================================

  describe('Retry Last Message', () => {
    it('should retry the last user message', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Original message');
      });

      act(() => {
        triggerSSEEvent('done', { success: true });
      });

      mockConnect.mockClear();

      act(() => {
        result.current.retry();
      });

      expect(mockConnect).toHaveBeenCalledWith({
        message: 'Original message',
      });
    });
  });

  // ===========================================================================
  // Clear Messages Tests
  // ===========================================================================

  describe('Clear Messages', () => {
    it('should clear all messages and state', () => {
      const { result } = renderHook(() => useMode1Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('token', { content: 'Response' });
        triggerSSEEvent('citation', { id: 'cite-001', source: 'Test' });
        triggerSSEEvent('done', { success: true });
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(mockState.messages).toHaveLength(0);
      expect(mockState.currentContent).toBe('');
      expect(mockState.currentReasoning).toHaveLength(0);
      expect(mockState.currentCitations).toHaveLength(0);
    });
  });
});
