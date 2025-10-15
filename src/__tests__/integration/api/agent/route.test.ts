import { describe, it, expect, beforeEach, afterEach, jest, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/agent/route';

// Mock the agent service
vi.mock('@/core/services/agent-orchestrator/agent-orchestrator.service', () => ({
  AgentOrchestrator: vi.fn()
}));

// Mock the validation
vi.mock('@/shared/validation/agent.schemas', () => ({
  validateAgentRequest: vi.fn()
}));

// Mock the rate limiter
vi.mock('@/application/middleware/rate-limiter.middleware', () => ({
  chatLimiter: {
    middleware: vi.fn()
  }
}));

import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';
import { validateAgentRequest } from '@/shared/validation/agent.schemas';
import { chatLimiter } from '@/application/middleware/rate-limiter.middleware';

const mockAgentOrchestrator = AgentOrchestrator as vi.MockedClass<typeof AgentOrchestrator>;
const mockValidateAgentRequest = validateAgentRequest as vi.MockedFunction<typeof validateAgentRequest>;
const mockChatLimiter = chatLimiter as any;

describe('GET /api/agent', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock request
    mockRequest = {
      method: 'GET',
      headers: new Map([
        ['content-type', 'application/json'],
        ['x-user-id', 'test-user@example.com']
      ]),
      nextUrl: new URL('http://localhost:3000/api/agent?tier=2&domain=medical')
    } as any;

    // Mock rate limiter to allow
    mockChatLimiter.middleware.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful requests', () => {
    it('should return available agents with filters', async () => {
      // Mock agent orchestrator
      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([
          {
            id: 'medical-1',
            name: 'cardiology-expert',
            displayName: 'Cardiology Expert',
            description: 'Expert in heart conditions',
            tier: 2,
            capabilities: ['medical-knowledge', 'cardiology'],
            knowledgeDomains: ['cardiology', 'cardiac-surgery']
          }
        ])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.agents).toHaveLength(1);
      expect(body.agents[0].name).toBe('cardiology-expert');
      expect(body.agents[0].tier).toBe(2);
    });

    it('should return all agents when no filters provided', async () => {
      const mockRequestNoFilters = {
        ...mockRequest,
        nextUrl: new URL('http://localhost:3000/api/agent')
      };

      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([
          {
            id: 'medical-1',
            name: 'cardiology-expert',
            displayName: 'Cardiology Expert',
            tier: 2
          },
          {
            id: 'general-1',
            name: 'general-assistant',
            displayName: 'General Assistant',
            tier: 1
          }
        ])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequestNoFilters);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.agents).toHaveLength(2);
    });

    it('should handle domain filter correctly', async () => {
      const mockRequestDomain = {
        ...mockRequest,
        nextUrl: new URL('http://localhost:3000/api/agent?domain=cardiology')
      };

      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([
          {
            id: 'medical-1',
            name: 'cardiology-expert',
            displayName: 'Cardiology Expert',
            knowledgeDomains: ['cardiology']
          }
        ])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequestDomain);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.agents).toHaveLength(1);
      expect(body.agents[0].knowledgeDomains).toContain('cardiology');
    });
  });

  describe('Error handling', () => {
    it('should return 500 for orchestrator errors', async () => {
      const mockOrchestrator = {
        suggestAgents: vi.fn().mockRejectedValue(new Error('Orchestrator failed'))
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Orchestrator failed');
    });

    it('should return 429 for rate limited requests', async () => {
      mockChatLimiter.middleware.mockResolvedValue({
        status: 429,
        headers: new Map([['retry-after', '60']]),
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      } as any);

      const response = await GET(mockRequest);

      expect(response.status).toBe(429);
    });

    it('should handle invalid query parameters gracefully', async () => {
      const mockRequestInvalid = {
        ...mockRequest,
        nextUrl: new URL('http://localhost:3000/api/agent?tier=invalid&domain=')
      };

      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequestInvalid);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.agents).toEqual([]);
    });
  });

  describe('Response format', () => {
    it('should return properly formatted response', async () => {
      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([
          {
            id: 'test-agent',
            name: 'test-agent',
            displayName: 'Test Agent',
            description: 'Test agent description',
            tier: 1,
            capabilities: ['test-capability'],
            knowledgeDomains: ['test-domain']
          }
        ])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json');

      const body = await response.json();
      expect(body).toHaveProperty('agents');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('filters');
      expect(Array.isArray(body.agents)).toBe(true);
    });

    it('should include metadata in response', async () => {
      const mockOrchestrator = {
        suggestAgents: vi.fn().mockResolvedValue([])
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await GET(mockRequest);

      const body = await response.json();
      expect(body.total).toBe(0);
      expect(body.filters).toHaveProperty('tier');
      expect(body.filters).toHaveProperty('domain');
    });
  });
});

describe('POST /api/agent', () => {
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
        name: 'test-agent',
        displayName: 'Test Agent',
        description: 'Test agent description',
        systemPrompt: 'You are a test agent.',
        capabilities: ['test-capability'],
        tier: 1,
        knowledgeDomains: ['test-domain'],
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: 2000,
        ragEnabled: false
      })
    } as any;

    // Mock validation to pass
    mockValidateAgentRequest.mockReturnValue({
      name: 'test-agent',
      displayName: 'Test Agent',
      description: 'Test agent description',
      systemPrompt: 'You are a test agent.',
      capabilities: ['test-capability'],
      tier: 1,
      knowledgeDomains: ['test-domain'],
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 2000,
      ragEnabled: false
    });

    // Mock rate limiter to allow
    mockChatLimiter.middleware.mockResolvedValue(null);
  });

  describe('Successful requests', () => {
    it('should create a new agent', async () => {
      const mockOrchestrator = {
        createAgent: vi.fn().mockResolvedValue({
          id: 'new-agent-id',
          name: 'test-agent',
          displayName: 'Test Agent',
          createdAt: new Date().toISOString()
        })
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.agent.id).toBe('new-agent-id');
      expect(body.agent.name).toBe('test-agent');
    });

    it('should validate agent data', async () => {
      const mockOrchestrator = {
        createAgent: vi.fn().mockResolvedValue({ id: 'new-agent-id' })
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      await POST(mockRequest);

      expect(mockValidateAgentRequest).toHaveBeenCalledWith({
        name: 'test-agent',
        displayName: 'Test Agent',
        description: 'Test agent description',
        systemPrompt: 'You are a test agent.',
        capabilities: ['test-capability'],
        tier: 1,
        knowledgeDomains: ['test-domain'],
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: 2000,
        ragEnabled: false
      });
    });
  });

  describe('Error handling', () => {
    it('should return 400 for invalid agent data', async () => {
      mockValidateAgentRequest.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Validation failed');
    });

    it('should return 500 for creation errors', async () => {
      const mockOrchestrator = {
        createAgent: vi.fn().mockRejectedValue(new Error('Creation failed'))
      };
      mockAgentOrchestrator.mockImplementation(() => mockOrchestrator as any);

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Creation failed');
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
  });
});
