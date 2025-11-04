/**
 * Agent Service Unit Tests
 * 
 * Tests for agent retrieval, search, and filtering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAgents, getAgent, searchAgents, getAgentSuites } from '@/features/ask-panel/services/agent-service';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: mockAgent,
            error: null
          }))
        })),
        order: vi.fn(() => Promise.resolve({
          data: mockAgents,
          error: null
        })),
        limit: vi.fn(() => Promise.resolve({
          data: mockAgents,
          error: null
        }))
      }))
    }))
  }))
}));

const mockAgent = {
  id: '1',
  title: 'Clinical Trial Designer',
  slug: 'clinical-trial-designer',
  description: 'Expert in clinical trial design',
  category: 'clinical',
  expertise: ['trial-design', 'protocols'],
  specialties: ['Phase I', 'Phase II'],
  rating: 4.8,
  total_consultations: 150,
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockAgents = [
  mockAgent,
  {
    ...mockAgent,
    id: '2',
    title: 'FDA Strategist',
    slug: 'fda-strategist',
    category: 'regulatory'
  }
];

describe('Agent Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgents', () => {
    it('should fetch all agents successfully', async () => {
      const agents = await getAgents();
      
      expect(agents).toBeDefined();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
    });

    it('should filter agents by category', async () => {
      const agents = await getAgents({ category: 'clinical' });
      
      expect(agents).toBeDefined();
      agents.forEach(agent => {
        expect(agent.category).toBe('clinical');
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock error
      vi.mocked(createClient).mockReturnValueOnce({
        from: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          }))
        }))
      } as any);

      await expect(getAgents()).rejects.toThrow();
    });
  });

  describe('getAgent', () => {
    it('should fetch agent by ID', async () => {
      const agent = await getAgent('1');
      
      expect(agent).toBeDefined();
      expect(agent?.id).toBe('1');
      expect(agent?.title).toBe('Clinical Trial Designer');
    });

    it('should fetch agent by slug', async () => {
      const agent = await getAgent('clinical-trial-designer');
      
      expect(agent).toBeDefined();
      expect(agent?.slug).toBe('clinical-trial-designer');
    });

    it('should return null for non-existent agent', async () => {
      vi.mocked(createClient).mockReturnValueOnce({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Not found' }
              }))
            }))
          }))
        }))
      } as any);

      const agent = await getAgent('non-existent');
      expect(agent).toBeNull();
    });
  });

  describe('searchAgents', () => {
    it('should search agents by query', async () => {
      const results = await searchAgents({ query: 'clinical' });
      
      expect(results).toBeDefined();
      expect(results.agents).toBeDefined();
      expect(Array.isArray(results.agents)).toBe(true);
    });

    it('should return facets', async () => {
      const results = await searchAgents({ query: 'trial' });
      
      expect(results.facets).toBeDefined();
      expect(results.facets?.categories).toBeDefined();
      expect(Array.isArray(results.facets?.categories)).toBe(true);
    });
  });

  describe('getAgentSuites', () => {
    it('should fetch all agent suites', async () => {
      const suites = await getAgentSuites();
      
      expect(suites).toBeDefined();
      expect(Array.isArray(suites)).toBe(true);
    });
  });
});

