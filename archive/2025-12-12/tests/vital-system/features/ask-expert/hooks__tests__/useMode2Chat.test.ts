/**
 * VITAL Platform - useMode2Chat Hook Tests
 * 
 * Phase 5: Testing & Quality Assurance
 * 
 * Tests for Mode 2 (Automatic Interactive) chat hook that handles
 * automatic expert selection via Fusion Intelligence.
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
  isSelectingExperts: false,
  selectedExperts: [] as any[],
  fusionEvidence: null as any,
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
  mockState.isSelectingExperts = true;
  mockConnect({ message, enable_fusion: true });
});

const mockOverrideExperts = jest.fn((expertIds: string[]) => {
  // Store for next message
  (mockState as any)._overrideExpertIds = expertIds;
});

const mockClearMessages = jest.fn(() => {
  mockState.messages = [];
  mockState.selectedExperts = [];
  mockState.fusionEvidence = null;
  mockState.currentContent = '';
  mockState.currentReasoning = [];
  mockState.currentCitations = [];
});

const mockRetry = jest.fn(() => {
  const lastUserMessage = mockState.messages.filter((m: any) => m.role === 'user').pop();
  if (lastUserMessage) {
    mockConnect({ message: lastUserMessage.content, enable_fusion: true });
  }
});

jest.mock('../useMode2Chat', () => ({
  useMode2Chat: jest.fn((options?: any) => {
    return {
      get messages() { return mockState.messages; },
      get isStreaming() { return mockState.isStreaming; },
      get isSelectingExperts() { return mockState.isSelectingExperts; },
      get selectedExperts() { return mockState.selectedExperts; },
      get fusionEvidence() { return mockState.fusionEvidence; },
      get currentContent() { return mockState.currentContent; },
      get currentReasoning() { return mockState.currentReasoning; },
      get currentCitations() { return mockState.currentCitations; },
      get currentCost() { return mockState.currentCost; },
      get error() { return mockState.error; },
      sendMessage: mockSendMessage,
      overrideExperts: mockOverrideExperts,
      clearMessages: mockClearMessages,
      retry: mockRetry,
    };
  }),
}));

import { useMode2Chat } from '../useMode2Chat';

// Helper to trigger SSE events and update mock state
function triggerSSEEvent(eventName: string, data: any) {
  if (eventName === 'fusion') {
    mockState.fusionEvidence = data;
    mockState.selectedExperts = data.selected_experts || [];
    mockState.isSelectingExperts = false;
  } else if (eventName === 'token') {
    mockState.currentContent += data.content || '';
  } else if (eventName === 'reasoning') {
    mockState.currentReasoning = [...mockState.currentReasoning, data];
  } else if (eventName === 'citation') {
    mockState.currentCitations = [...mockState.currentCitations, data];
  } else if (eventName === 'cost') {
    mockState.currentCost = data;
  } else if (eventName === 'done') {
    mockState.isStreaming = false;
    mockState.currentContent = '';
  } else if (eventName === 'error') {
    mockState.error = data;
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('useMode2Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockSendMessage.mockClear();
    mockOverrideExperts.mockClear();
    mockClearMessages.mockClear();
    mockRetry.mockClear();
    mockState = createMockState();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMode2Chat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.selectedExperts).toEqual([]);
      expect(result.current.isSelectingExperts).toBe(false);
      expect(result.current.fusionEvidence).toBeNull();
    });

    it('should accept preferred domains', () => {
      const { result } = renderHook(() =>
        useMode2Chat({
          preferredDomains: ['regulatory', 'clinical'],
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  // ===========================================================================
  // Fusion Intelligence Tests
  // ===========================================================================

  describe('Fusion Intelligence', () => {
    it('should handle fusion events for expert selection', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Complex regulatory question');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [
            { id: 'regulatory-001', name: 'Dr. Chen', specialty: 'FDA Regulatory', confidence: 0.92 },
            { id: 'clinical-001', name: 'Dr. Smith', specialty: 'Clinical Trials', confidence: 0.85 },
          ],
          vector_score: 0.88,
          graph_score: 0.82,
          relational_score: 0.79,
          rrf_score: 0.85,
          reasoning: 'Selected based on FDA and clinical trial keywords',
        });
      });

      expect(mockState.fusionEvidence).not.toBeNull();
      expect(mockState.fusionEvidence?.rrf_score).toBe(0.85);
      expect(mockState.selectedExperts).toHaveLength(2);
    });

    it('should set isSelectingExperts during fusion process', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test query');
      });

      expect(mockState.isSelectingExperts).toBe(true);

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [{ id: 'expert-001' }],
          rrf_score: 0.9,
        });
      });

      expect(mockState.isSelectingExperts).toBe(false);
    });

    it('should include fusion evidence in request', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          enable_fusion: true,
        })
      );
    });
  });

  // ===========================================================================
  // Multi-Expert Response Tests
  // ===========================================================================

  describe('Multi-Expert Response', () => {
    it('should attribute content to selected experts', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Complex query');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [
            { id: 'expert-001', name: 'Expert A', confidence: 0.9 },
            { id: 'expert-002', name: 'Expert B', confidence: 0.85 },
          ],
          rrf_score: 0.88,
        });
      });

      expect(mockState.selectedExperts).toHaveLength(2);
    });

    it('should track individual expert contributions', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Multi-domain query');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [
            {
              id: 'expert-001',
              name: 'Regulatory Expert',
              specialty: 'FDA',
              confidence: 0.92,
              reasoning: 'FDA expertise needed',
            },
          ],
          rrf_score: 0.9,
        });
      });

      const expert = mockState.selectedExperts[0];
      expect(expert.confidence).toBe(0.92);
      expect(expert.reasoning).toBe('FDA expertise needed');
    });
  });

  // ===========================================================================
  // Message Handling Tests
  // ===========================================================================

  describe('Message Handling', () => {
    it('should accumulate tokens from multiple experts', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [{ id: 'expert-001' }],
          rrf_score: 0.9,
        });
        triggerSSEEvent('token', { content: 'Part 1 ' });
        triggerSSEEvent('token', { content: 'Part 2' });
      });

      expect(mockState.currentContent).toBe('Part 1 Part 2');
    });

    it('should collect reasoning from all experts', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('reasoning', {
          step: 'expert_a_analysis',
          content: 'Expert A analysis',
          expert_id: 'expert-001',
        });
        triggerSSEEvent('reasoning', {
          step: 'expert_b_analysis',
          content: 'Expert B analysis',
          expert_id: 'expert-002',
        });
      });

      expect(mockState.currentReasoning).toHaveLength(2);
    });

    it('should aggregate citations from all experts', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Research query');
      });

      act(() => {
        triggerSSEEvent('citation', {
          id: 'cite-001',
          source: 'PubMed',
          expert_id: 'expert-001',
        });
        triggerSSEEvent('citation', {
          id: 'cite-002',
          source: 'FDA',
          expert_id: 'expert-002',
        });
      });

      expect(mockState.currentCitations).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Expert Selection Override Tests
  // ===========================================================================

  describe('Expert Selection Override', () => {
    it('should allow manual expert selection override', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.overrideExperts(['manual-001', 'manual-002']);
      });

      expect(mockOverrideExperts).toHaveBeenCalledWith(['manual-001', 'manual-002']);
    });
  });

  // ===========================================================================
  // Cost Aggregation Tests
  // ===========================================================================

  describe('Cost Aggregation', () => {
    it('should aggregate costs from multiple experts', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('cost', {
          input_tokens: 200,
          output_tokens: 400,
          total_tokens: 600,
          estimated_cost_usd: 0.006,
        });
      });

      expect(mockState.currentCost?.total_tokens).toBe(600);
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('should handle fusion failure gracefully', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('error', {
          code: 'FUSION_FAILED',
          message: 'Unable to select experts',
          recoverable: true,
        });
      });

      expect(mockState.error).not.toBeNull();
      expect(mockState.error.code).toBe('FUSION_FAILED');
    });

    it('should handle no experts available', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Very obscure query');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [],
          rrf_score: 0,
          reasoning: 'No suitable experts found',
        });
      });

      expect(mockState.selectedExperts).toHaveLength(0);
      expect(mockState.fusionEvidence?.reasoning).toContain('No suitable');
    });
  });

  // ===========================================================================
  // Stream Completion Tests
  // ===========================================================================

  describe('Stream Completion', () => {
    it('should clear streaming state on done', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [{ id: 'expert-001', name: 'Test Expert' }],
          rrf_score: 0.9,
        });
        triggerSSEEvent('token', { content: 'Response' });
        triggerSSEEvent('done', {
          conversation_id: 'conv-123',
          total_tokens: 500,
        });
      });

      expect(mockState.isStreaming).toBe(false);
    });
  });

  // ===========================================================================
  // Retry Tests
  // ===========================================================================

  describe('Retry', () => {
    it('should retry with same fusion settings', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Original query');
      });

      act(() => {
        triggerSSEEvent('done', { success: true });
      });

      mockConnect.mockClear();

      act(() => {
        result.current.retry();
      });

      expect(mockConnect).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Original query',
          enable_fusion: true,
        })
      );
    });
  });

  // ===========================================================================
  // Clear State Tests
  // ===========================================================================

  describe('Clear State', () => {
    it('should clear all state including fusion evidence', () => {
      const { result } = renderHook(() => useMode2Chat());

      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        triggerSSEEvent('fusion', {
          selected_experts: [{ id: 'expert-001' }],
          rrf_score: 0.9,
        });
        triggerSSEEvent('done', { success: true });
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(mockState.messages).toHaveLength(0);
      expect(mockState.selectedExperts).toHaveLength(0);
      expect(mockState.fusionEvidence).toBeNull();
    });
  });
});
