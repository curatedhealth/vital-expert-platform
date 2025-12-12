/**
 * Unit Tests for AgentGraphService
 * 
 * Tests agent relationship graph management, team building, and knowledge graph operations.
 * 
 * Coverage Target: 90%+
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentGraphService } from '@/lib/services/agents/agent-graph-service';
import type {
  AgentRelationship,
  AgentRelationshipType,
  AgentKnowledgeGraphNode,
  KnowledgeEntityType,
} from '@/lib/services/agents/agent-graph-service';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  infoWithMetrics: vi.fn(),
};

const mockTracing = {
  startSpan: vi.fn(() => 'span-id'),
  endSpan: vi.fn(),
  addTags: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/lib/services/observability/structured-logger', () => ({
  createLogger: vi.fn(() => mockLogger),
}));

vi.mock('@/lib/services/observability/tracing', () => ({
  getTracingService: vi.fn(() => mockTracing),
}));

describe('AgentGraphService', () => {
  let service: AgentGraphService;
  let mockQueryBuilder: any;
  let mockInsert: any;
  let mockSelect: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup query builder mocks
    mockQueryBuilder = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    mockInsert = {
      insert: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    mockSelect = {
      select: vi.fn().mockReturnValue(mockQueryBuilder),
      insert: vi.fn().mockReturnValue(mockQueryBuilder),
      delete: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    mockSupabase.from.mockReturnValue(mockSelect);

    service = new AgentGraphService();
  });

  describe('createRelationship', () => {
    const mockRelationship: AgentRelationship = {
      id: 'rel-1',
      source_agent_id: 'agent-1',
      target_agent_id: 'agent-2',
      relationship_type: 'collaborates',
      weight: 0.8,
      metadata: { context: 'test' },
      created_at: '2025-01-29T00:00:00Z',
      updated_at: '2025-01-29T00:00:00Z',
    };

    it('should create a relationship successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockRelationship,
        error: null,
      });

      const result = await service.createRelationship(
        'agent-1',
        'agent-2',
        'collaborates',
        0.8,
        { context: 'test' }
      );

      expect(result).toEqual(mockRelationship);
      expect(mockSupabase.from).toHaveBeenCalledWith('agent_relationships');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          source_agent_id: 'agent-1',
          target_agent_id: 'agent-2',
          relationship_type: 'collaborates',
          weight: 0.8,
          metadata: { context: 'test' },
        })
      );
    });

    it('should validate weight range', async () => {
      await expect(
        service.createRelationship('agent-1', 'agent-2', 'collaborates', -0.1)
      ).rejects.toThrow('Weight must be between 0.0 and 1.0');

      await expect(
        service.createRelationship('agent-1', 'agent-2', 'collaborates', 1.5)
      ).rejects.toThrow('Weight must be between 0.0 and 1.0');
    });

    it('should prevent self-relationships', async () => {
      await expect(
        service.createRelationship('agent-1', 'agent-1', 'collaborates', 0.8)
      ).rejects.toThrow('Cannot create self-relationship');
    });

    it('should handle all relationship types', async () => {
      const relationshipTypes: AgentRelationshipType[] = [
        'collaborates',
        'supervises',
        'delegates',
        'consults',
        'reports_to',
      ];

      for (const type of relationshipTypes) {
        mockQueryBuilder.single.mockResolvedValue({
          data: { ...mockRelationship, relationship_type: type },
          error: null,
        });

        const result = await service.createRelationship(
          'agent-1',
          'agent-2',
          type,
          0.8
        );

        expect(result.relationship_type).toBe(type);
      }
    });

    it('should default metadata to empty object if not provided', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockRelationship,
        error: null,
      });

      await service.createRelationship('agent-1', 'agent-2', 'collaborates', 0.8);

      const insertCall = mockQueryBuilder.insert.mock.calls[0][0];
      expect(insertCall.metadata).toEqual({});
    });

    it('should handle database errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Duplicate key' },
      });

      await expect(
        service.createRelationship('agent-1', 'agent-2', 'collaborates', 0.8)
      ).rejects.toBeDefined();

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log metrics on successful creation', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockRelationship,
        error: null,
      });

      await service.createRelationship('agent-1', 'agent-2', 'collaborates', 0.8);

      expect(mockLogger.infoWithMetrics).toHaveBeenCalledWith(
        'graph_create_relationship_completed',
        expect.any(Number),
        expect.objectContaining({
          relationshipId: 'rel-1',
        })
      );
    });
  });

  describe('findCollaborators', () => {
    it('should find agents that collaborate with a given agent', async () => {
      const mockCollaborators = [
        { target_agent_id: 'agent-2' },
        { target_agent_id: 'agent-3' },
        { target_agent_id: 'agent-4' },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockCollaborators,
        error: null,
      });

      const collaborators = await service.findCollaborators('agent-1');

      expect(collaborators).toEqual(['agent-2', 'agent-3', 'agent-4']);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'source_agent_id',
        'agent-1'
      );
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'relationship_type',
        'collaborates'
      );
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('weight', {
        ascending: false,
      });
    });

    it('should return empty array if no collaborators found', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const collaborators = await service.findCollaborators('agent-1');

      expect(collaborators).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Table not found' },
      });

      await expect(service.findCollaborators('agent-1')).rejects.toBeDefined();
    });
  });

  describe('findSupervisors', () => {
    it('should find agents that supervise a given agent', async () => {
      const mockSupervisors = [
        { source_agent_id: 'agent-5' },
        { source_agent_id: 'agent-6' },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockSupervisors,
        error: null,
      });

      const supervisors = await service.findSupervisors('agent-1');

      expect(supervisors).toEqual(['agent-5', 'agent-6']);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'target_agent_id',
        'agent-1'
      );
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'relationship_type',
        'supervises'
      );
    });
  });

  describe('findDelegationTargets', () => {
    it('should find agents that can be delegated to', async () => {
      const mockTargets = [
        { target_agent_id: 'agent-7' },
        { target_agent_id: 'agent-8' },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockTargets,
        error: null,
      });

      const targets = await service.findDelegationTargets('agent-1');

      expect(targets).toEqual(['agent-7', 'agent-8']);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith(
        'relationship_type',
        'delegates'
      );
    });
  });

  describe('buildAgentTeam', () => {
    const mockRelationships = [
      {
        id: 'rel-1',
        source_agent_id: 'agent-1',
        target_agent_id: 'agent-2',
        relationship_type: 'collaborates',
        weight: 0.9,
      },
      {
        id: 'rel-2',
        source_agent_id: 'agent-1',
        target_agent_id: 'agent-3',
        relationship_type: 'delegates',
        weight: 0.8,
      },
      {
        id: 'rel-3',
        target_agent_id: 'agent-1',
        source_agent_id: 'agent-4',
        relationship_type: 'supervises',
        weight: 0.7,
      },
      {
        id: 'rel-4',
        source_agent_id: 'agent-1',
        target_agent_id: 'agent-5',
        relationship_type: 'collaborates',
        weight: 0.6,
      },
      {
        id: 'rel-5',
        source_agent_id: 'agent-1',
        target_agent_id: 'agent-6',
        relationship_type: 'collaborates',
        weight: 0.5,
      },
    ];

    it('should build a team from relationships', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: mockRelationships,
        error: null,
      });

      const team = await service.buildAgentTeam('agent-1', 5);

      expect(team).toContain('agent-1'); // Lead agent included
      expect(team.length).toBeLessThanOrEqual(5);
      expect(team.length).toBeGreaterThan(1);

      // Should include agents from relationships
      expect(team.some((id) => ['agent-2', 'agent-3', 'agent-4'].includes(id))).toBe(
        true
      );
    });

    it('should respect maxTeamSize limit', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: mockRelationships,
        error: null,
      });

      const team = await service.buildAgentTeam('agent-1', 3);

      expect(team.length).toBeLessThanOrEqual(3);
    });

    it('should order team members by relationship weight', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: mockRelationships,
        error: null,
      });

      const team = await service.buildAgentTeam('agent-1', 5);

      // agent-1 (lead) should always be included
      expect(team[0]).toBe('agent-1');
    });

    it('should handle bidirectional relationships', async () => {
      const bidirectionalRels = [
        {
          id: 'rel-1',
          source_agent_id: 'agent-1',
          target_agent_id: 'agent-2',
          relationship_type: 'collaborates',
          weight: 0.9,
        },
        {
          id: 'rel-2',
          source_agent_id: 'agent-2',
          target_agent_id: 'agent-1',
          relationship_type: 'collaborates',
          weight: 0.8,
        },
      ];

      mockQueryBuilder.limit.mockResolvedValue({
        data: bidirectionalRels,
        error: null,
      });

      const team = await service.buildAgentTeam('agent-1', 5);

      expect(team).toContain('agent-2');
      // Should deduplicate
      const agent2Count = team.filter((id) => id === 'agent-2').length;
      expect(agent2Count).toBe(1);
    });

    it('should return only lead agent if no relationships exist', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const team = await service.buildAgentTeam('agent-1', 5);

      expect(team).toEqual(['agent-1']);
    });

    it('should handle database errors', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Database error' },
      });

      await expect(service.buildAgentTeam('agent-1', 5)).rejects.toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should log team building metrics', async () => {
      mockQueryBuilder.limit.mockResolvedValue({
        data: mockRelationships,
        error: null,
      });

      await service.buildAgentTeam('agent-1', 5);

      expect(mockLogger.infoWithMetrics).toHaveBeenCalledWith(
        'graph_build_team_completed',
        expect.any(Number),
        expect.objectContaining({
          leadAgentId: 'agent-1',
          teamSize: expect.any(Number),
          maxTeamSize: 5,
        })
      );
    });
  });

  describe('addKnowledgeNode', () => {
    const mockKnowledgeNode: AgentKnowledgeGraphNode = {
      id: 'node-1',
      agent_id: 'agent-1',
      entity_type: 'skill',
      entity_name: 'Cardiology Diagnosis',
      confidence: 0.95,
      embedding: [0.1, 0.2, 0.3],
      metadata: { verified: true },
      created_at: '2025-01-29T00:00:00Z',
      updated_at: '2025-01-29T00:00:00Z',
    };

    it('should add a knowledge node successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockKnowledgeNode,
        error: null,
      });

      const result = await service.addKnowledgeNode(
        'agent-1',
        'skill',
        'Cardiology Diagnosis',
        0.95,
        [0.1, 0.2, 0.3],
        { verified: true }
      );

      expect(result).toEqual(mockKnowledgeNode);
      expect(mockSupabase.from).toHaveBeenCalledWith('agent_knowledge_graph');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          agent_id: 'agent-1',
          entity_type: 'skill',
          entity_name: 'Cardiology Diagnosis',
          confidence: 0.95,
          embedding: [0.1, 0.2, 0.3],
          metadata: { verified: true },
        })
      );
    });

    it('should validate confidence range', async () => {
      await expect(
        service.addKnowledgeNode('agent-1', 'skill', 'Test', -0.1)
      ).rejects.toThrow('Confidence must be between 0.0 and 1.0');

      await expect(
        service.addKnowledgeNode('agent-1', 'skill', 'Test', 1.5)
      ).rejects.toThrow('Confidence must be between 0.0 and 1.0');
    });

    it('should handle all entity types', async () => {
      const entityTypes: KnowledgeEntityType[] = [
        'skill',
        'domain',
        'tool',
        'knowledge_area',
      ];

      for (const type of entityTypes) {
        mockQueryBuilder.single.mockResolvedValue({
          data: { ...mockKnowledgeNode, entity_type: type },
          error: null,
        });

        const result = await service.addKnowledgeNode(
          'agent-1',
          type,
          'Test',
          0.8
        );

        expect(result.entity_type).toBe(type);
      }
    });

    it('should default embedding to null if not provided', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: { ...mockKnowledgeNode, embedding: null },
        error: null,
      });

      await service.addKnowledgeNode('agent-1', 'skill', 'Test', 0.8);

      const insertCall = mockQueryBuilder.insert.mock.calls[0][0];
      expect(insertCall.embedding).toBeNull();
    });

    it('should default metadata to empty object if not provided', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockKnowledgeNode,
        error: null,
      });

      await service.addKnowledgeNode('agent-1', 'skill', 'Test', 0.8);

      const insertCall = mockQueryBuilder.insert.mock.calls[0][0];
      expect(insertCall.metadata).toEqual({});
    });
  });

  describe('getAgentExpertise', () => {
    it('should retrieve all knowledge nodes for an agent', async () => {
      const mockNodes: AgentKnowledgeGraphNode[] = [
        {
          id: 'node-1',
          agent_id: 'agent-1',
          entity_type: 'skill',
          entity_name: 'Cardiology',
          confidence: 0.95,
          created_at: '2025-01-29T00:00:00Z',
          updated_at: '2025-01-29T00:00:00Z',
        },
        {
          id: 'node-2',
          agent_id: 'agent-1',
          entity_type: 'domain',
          entity_name: 'Heart Disease',
          confidence: 0.9,
          created_at: '2025-01-29T00:00:00Z',
          updated_at: '2025-01-29T00:00:00Z',
        },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockNodes,
        error: null,
      });

      const expertise = await service.getAgentExpertise('agent-1');

      expect(expertise).toHaveLength(2);
      expect(expertise[0].confidence).toBeGreaterThanOrEqual(expertise[1].confidence);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('agent_id', 'agent-1');
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('confidence', {
        ascending: false,
      });
    });

    it('should return empty array if agent has no expertise', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const expertise = await service.getAgentExpertise('agent-1');

      expect(expertise).toEqual([]);
    });
  });

  describe('findAgentsByExpertise', () => {
    it('should find agents with specific expertise', async () => {
      const mockResults = [
        { agent_id: 'agent-1', confidence: 0.95, entity_type: 'skill' },
        { agent_id: 'agent-2', confidence: 0.85, entity_type: 'skill' },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockResults,
        error: null,
      });

      const agents = await service.findAgentsByExpertise('Cardiology');

      expect(agents).toHaveLength(2);
      expect(agents[0].confidence).toBeGreaterThanOrEqual(agents[1].confidence);
      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith(
        'entity_name',
        '%Cardiology%'
      );
      expect(mockQueryBuilder.gte).toHaveBeenCalledWith('confidence', 0.5);
    });

    it('should filter by entity type if provided', async () => {
      const mockResults = [
        { agent_id: 'agent-1', confidence: 0.95, entity_type: 'skill' },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockResults,
        error: null,
      });

      await service.findAgentsByExpertise('Cardiology', 'skill');

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('entity_type', 'skill');
    });

    it('should respect minimum confidence threshold', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await service.findAgentsByExpertise('Cardiology', undefined, 0.9);

      expect(mockQueryBuilder.gte).toHaveBeenCalledWith('confidence', 0.9);
    });

    it('should return empty array if no agents found', async () => {
      mockQueryBuilder.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const agents = await service.findAgentsByExpertise('NonExistent');

      expect(agents).toEqual([]);
    });
  });

  describe('getAgentRelationships', () => {
    it('should get all relationships for an agent', async () => {
      const mockRelationships = [
        {
          id: 'rel-1',
          source_agent_id: 'agent-1',
          target_agent_id: 'agent-2',
          relationship_type: 'collaborates',
          weight: 0.9,
          created_at: '2025-01-29T00:00:00Z',
          updated_at: '2025-01-29T00:00:00Z',
        },
      ];

      mockQueryBuilder.order.mockResolvedValue({
        data: mockRelationships,
        error: null,
      });

      const relationships = await service.getAgentRelationships('agent-1');

      expect(relationships).toHaveLength(1);
      expect(mockQueryBuilder.or).toHaveBeenCalledWith(
        'source_agent_id.eq.agent-1,target_agent_id.eq.agent-1'
      );
    });
  });

  describe('deleteRelationship', () => {
    it('should delete a relationship', async () => {
      mockQueryBuilder.delete.mockResolvedValue({
        error: null,
      });

      await service.deleteRelationship('rel-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('agent_relationships');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'rel-1');
    });

    it('should handle deletion errors', async () => {
      mockQueryBuilder.delete.mockResolvedValue({
        error: { code: 'PGRST116', message: 'Not found' },
      });

      await expect(service.deleteRelationship('rel-1')).rejects.toBeDefined();
    });
  });

  describe('deleteKnowledgeNode', () => {
    it('should delete a knowledge node', async () => {
      mockQueryBuilder.delete.mockResolvedValue({
        error: null,
      });

      await service.deleteKnowledgeNode('node-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('agent_knowledge_graph');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'node-1');
    });
  });
});

