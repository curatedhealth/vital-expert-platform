import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/chat/route';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      })
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  }))
}));

// Mock OpenAI
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }
  }))
}));

describe('Chat Workflow Integration', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/chat', () => {
    it('should handle manual mode with agent', async () => {
      // Arrange
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'Hello',
          userId: 'test@example.com',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          agent: {
            id: 'test-agent',
            name: 'Test Agent',
            display_name: 'Test Agent',
            system_prompt: 'You are a test agent'
          },
          interactionMode: 'manual',
          autonomousMode: false
        }
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should handle automatic mode without agent', async () => {
      // Arrange
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'What are the symptoms of diabetes?',
          userId: 'test@example.com',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          agent: null,
          interactionMode: 'automatic',
          autonomousMode: false
        }
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should reject invalid requests', async () => {
      // Arrange
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          // Missing required fields
          message: ''
        }
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      // Arrange
      const { req } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          message: 'Hello',
          userId: 'test@example.com',
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          agent: null,
          interactionMode: 'automatic',
          autonomousMode: false
        }
      });

      // Mock authentication failure
      const { createClient } = await import('@/lib/supabase/server');
      const mockCreateClient = vi.mocked(createClient);
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Authentication failed' }
          })
        },
        from: vi.fn(() => ({
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
          update: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      } as any);

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('Authentication');
    });

    it('should handle rate limiting', async () => {
      // Arrange
      const requests = Array(15).fill(null).map((_, i) => 
        createMocks({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            message: `Test message ${i}`,
            userId: 'test@example.com',
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            agent: null,
            interactionMode: 'automatic',
            autonomousMode: false
          }
        })
      );

      // Act
      const responses = await Promise.all(
        requests.map(({ req }) => POST(req))
      );

      // Assert
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
