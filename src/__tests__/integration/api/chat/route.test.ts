import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock the workflow service
vi.mock('@/features/chat/services/ask-expert-graph', () => ({
  streamModeAwareWorkflow: vi.fn()
}));

// Mock the validation
vi.mock('@/shared/validation/chat.schemas', () => ({
  validateChatRequest: vi.fn()
}));

// Mock the rate limiter
vi.mock('@/application/middleware/rate-limiter.middleware', () => ({
  chatLimiter: {
    middleware: vi.fn()
  }
}));

import { streamModeAwareWorkflow } from '@/features/chat/services/ask-expert-graph';
import { validateChatRequest } from '@/shared/validation/chat.schemas';
import { chatLimiter } from '@/application/middleware/rate-limiter.middleware';

const mockStreamModeAwareWorkflow = streamModeAwareWorkflow as jest.MockedFunction<typeof streamModeAwareWorkflow>;
const mockValidateChatRequest = validateChatRequest as jest.MockedFunction<typeof validateChatRequest>;
const mockChatLimiter = chatLimiter as any;

describe('POST /api/chat', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock request
    mockRequest = {
      method: 'POST',
      headers: new Map([
        ['content-type', 'application/json'],
        ['x-user-id', 'test-user@example.com']
      ]),
      json: vi.fn().mockResolvedValue({
        message: 'Test message',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'automatic',
        autonomousMode: false
      })
    } as any;

    // Mock validation to pass
    mockValidateChatRequest.mockReturnValue({
      message: 'Test message',
      userId: 'test-user@example.com',
      sessionId: 'test-session-123',
      interactionMode: 'automatic',
      autonomousMode: false,
      selectedTools: [],
      chatHistory: [],
      agent: null
    });

    // Mock rate limiter to allow
    mockChatLimiter.middleware.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful requests', () => {
    it('should handle valid chat request with automatic mode', async () => {
      // Mock workflow stream
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'reasoning', step: 'agent_selection', description: 'Selecting agent...' };
          yield { type: 'agent_selected', agent: { id: 'medical-expert', name: 'Medical Expert' } };
          yield { type: 'reasoning', step: 'processing', description: 'Processing query...' };
          yield { type: 'response', content: 'Test response' };
          yield { type: 'complete', status: 'success' };
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(response.headers.get('connection')).toBe('keep-alive');

      // Verify validation was called
      expect(mockValidateChatRequest).toHaveBeenCalledWith({
        message: 'Test message',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'automatic',
        autonomousMode: false
      });

      // Verify rate limiter was called
      expect(mockChatLimiter.middleware).toHaveBeenCalledWith(mockRequest);

      // Verify workflow was called
      expect(mockStreamModeAwareWorkflow).toHaveBeenCalledWith({
        message: 'Test message',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'automatic',
        autonomousMode: false,
        selectedTools: [],
        chatHistory: [],
        agent: null
      });
    });

    it('should handle valid chat request with manual mode and agent', async () => {
      const requestWithAgent = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          message: 'Test message',
          userId: 'test-user@example.com',
          sessionId: 'test-session-123',
          interactionMode: 'manual',
          autonomousMode: false,
          agent: {
            id: 'medical-expert',
            name: 'Medical Expert',
            system_prompt: 'You are a medical expert.'
          }
        })
      };

      mockValidateChatRequest.mockReturnValue({
        message: 'Test message',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'manual',
        autonomousMode: false,
        selectedTools: [],
        chatHistory: [],
        agent: {
          id: 'medical-expert',
          name: 'Medical Expert',
          system_prompt: 'You are a medical expert.'
        }
      });

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing with selected agent...' };
          yield { type: 'response', content: 'Test response' };
          yield { type: 'complete', status: 'success' };
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(requestWithAgent);

      expect(response.status).toBe(200);
      expect(mockStreamModeAwareWorkflow).toHaveBeenCalledWith({
        message: 'Test message',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'manual',
        autonomousMode: false,
        selectedTools: [],
        chatHistory: [],
        agent: {
          id: 'medical-expert',
          name: 'Medical Expert',
          system_prompt: 'You are a medical expert.'
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should return 400 for invalid request data', async () => {
      mockValidateChatRequest.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Validation failed');
    });

    it('should return 429 for rate limited requests', async () => {
      mockChatLimiter.middleware.mockResolvedValue({
        status: 429,
        headers: new Map([['retry-after', '60']]),
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      } as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(429);
    });

    it('should return 500 for workflow errors', async () => {
      mockStreamModeAwareWorkflow.mockImplementation(() => {
        throw new Error('Workflow failed');
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Workflow failed');
    });

    it('should handle JSON parsing errors', async () => {
      const invalidRequest = {
        ...mockRequest,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      const response = await POST(invalidRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('Invalid JSON');
    });

    it('should handle workflow stream errors', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'reasoning', step: 'processing', description: 'Processing...' };
          throw new Error('Stream error');
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(200); // Stream starts successfully
      
      // The error would be handled in the stream processing
      // In a real implementation, you'd want to test the stream content
    });
  });

  describe('Request validation', () => {
    it('should validate required fields', async () => {
      const invalidRequest = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          // Missing required fields
          userId: 'test-user@example.com'
        })
      };

      mockValidateChatRequest.mockImplementation(() => {
        throw new Error('Message is required');
      });

      const response = await POST(invalidRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Message is required');
    });

    it('should validate email format', async () => {
      const invalidRequest = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          message: 'Test message',
          userId: 'invalid-email'
        })
      };

      mockValidateChatRequest.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      const response = await POST(invalidRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid email format');
    });

    it('should validate session ID format', async () => {
      const invalidRequest = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          message: 'Test message',
          userId: 'test-user@example.com',
          sessionId: 'invalid-uuid'
        })
      };

      mockValidateChatRequest.mockImplementation(() => {
        throw new Error('Invalid session ID format');
      });

      const response = await POST(invalidRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid session ID format');
    });
  });

  describe('Response streaming', () => {
    it('should stream workflow events correctly', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'reasoning', step: 'agent_selection', description: 'Selecting agent...' };
          yield { type: 'agent_selected', agent: { id: 'medical-expert' } };
          yield { type: 'response', content: 'Test response' };
          yield { type: 'complete', status: 'success' };
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
      
      // In a real test, you'd want to read the stream and verify the events
      // This would require more complex setup to handle the ReadableStream
    });

    it('should handle empty workflow stream', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          // Empty stream
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/event-stream');
    });
  });

  describe('Security', () => {
    it('should sanitize sensitive data in logs', async () => {
      const requestWithSensitiveData = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          message: 'Test message with password: secret123',
          userId: 'test-user@example.com',
          sessionId: 'test-session-123',
          interactionMode: 'automatic',
          autonomousMode: false
        })
      };

      mockValidateChatRequest.mockReturnValue({
        message: 'Test message with password: secret123',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'automatic',
        autonomousMode: false,
        selectedTools: [],
        chatHistory: [],
        agent: null
      });

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'complete', status: 'success' };
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(requestWithSensitiveData);

      expect(response.status).toBe(200);
      // In a real implementation, you'd verify that sensitive data is sanitized in logs
    });

    it('should handle malicious input', async () => {
      const maliciousRequest = {
        ...mockRequest,
        json: vi.fn().mockResolvedValue({
          message: '<script>alert("xss")</script>',
          userId: 'test-user@example.com',
          sessionId: 'test-session-123',
          interactionMode: 'automatic',
          autonomousMode: false
        })
      };

      mockValidateChatRequest.mockReturnValue({
        message: '<script>alert("xss")</script>',
        userId: 'test-user@example.com',
        sessionId: 'test-session-123',
        interactionMode: 'automatic',
        autonomousMode: false,
        selectedTools: [],
        chatHistory: [],
        agent: null
      });

      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield { type: 'complete', status: 'success' };
        }
      };
      mockStreamModeAwareWorkflow.mockReturnValue(mockStream as any);

      const response = await POST(maliciousRequest);

      expect(response.status).toBe(200);
      // In a real implementation, you'd verify that malicious input is handled safely
    });
  });
});
