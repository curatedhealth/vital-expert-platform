/**
 * Agent Graph Service
 * 
 * Enterprise-grade service for managing agent relationship graphs and knowledge nodes.
 * Enables multi-hop reasoning, collaboration discovery, and agent team building.
 * 
 * Features:
 * - Relationship management (collaborates, supervises, delegates, consults, reports_to)
 * - Knowledge graph node management (skills, domains, tools, knowledge areas)
 * - Graph traversal for multi-hop reasoning
 * - Team building algorithms
 * - Expertise discovery
 * 
 * Follows industry best practices from LangChain and OpenAI patterns.
 * 
 * @module lib/services/agents/agent-graph-service
 */

import { supabase } from '@vital/sdk/client';
import { createLogger } from '@/lib/services/observability/structured-logger';
import { getTracingService } from '@/lib/services/observability/tracing';

/**
 * Agent Relationship Types
 */
export type AgentRelationshipType =
  | 'collaborates'
  | 'supervises'
  | 'delegates'
  | 'consults'
  | 'reports_to';

/**
 * Agent Relationship
 */
export interface AgentRelationship {
  id: string;
  source_agent_id: string;
  target_agent_id: string;
  relationship_type: AgentRelationshipType;
  weight: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Knowledge Graph Node Types
 */
export type KnowledgeEntityType = 'skill' | 'domain' | 'tool' | 'knowledge_area';

/**
 * Agent Knowledge Graph Node
 */
export interface AgentKnowledgeGraphNode {
  id: string;
  agent_id: string;
  entity_type: KnowledgeEntityType;
  entity_name: string;
  confidence: number;
  embedding?: number[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Agent Graph Service
 * 
 * Provides methods for managing agent relationships and knowledge graphs
 */
export class AgentGraphService {
  private logger;
  private tracing;

  constructor() {
    this.logger = createLogger();
    this.tracing = getTracingService();
  }

  /**
   * Create a relationship between two agents
   * 
   * @param sourceAgentId - Source agent ID
   * @param targetAgentId - Target agent ID
   * @param relationshipType - Type of relationship
   * @param weight - Relationship strength (0.0 to 1.0)
   * @param metadata - Optional metadata
   * @returns Created relationship
   */
  async createRelationship(
    sourceAgentId: string,
    targetAgentId: string,
    relationshipType: AgentRelationshipType,
    weight: number = 1.0,
    metadata?: Record<string, any>
  ): Promise<AgentRelationship> {
    const spanId = this.tracing.startSpan(
      'AgentGraphService.createRelationship',
      undefined,
      {
        sourceAgentId,
        targetAgentId,
        relationshipType,
        weight,
      }
    );

    const startTime = Date.now();
    const operationId = `graph_create_relationship_${Date.now()}`;

    this.logger.info('graph_create_relationship_started', {
      operation: 'createRelationship',
      operationId,
      sourceAgentId,
      targetAgentId,
      relationshipType,
    });

    try {
      // Use imported supabase client

      // Validate weights
      if (weight < 0 || weight > 1) {
        throw new Error('Weight must be between 0.0 and 1.0');
      }

      // Prevent self-relationships
      if (sourceAgentId === targetAgentId) {
        throw new Error('Cannot create self-relationship');
      }

      const { data, error } = await supabase
        .from('agent_relationships')
        .insert({
          source_agent_id: sourceAgentId,
          target_agent_id: targetAgentId,
          relationship_type: relationshipType,
          weight,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('graph_create_relationship_completed', duration, {
        operation: 'createRelationship',
        operationId,
        relationshipId: data.id,
      });

      this.tracing.endSpan(spanId, true);

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'graph_create_relationship_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'createRelationship',
          operationId,
          duration,
        }
      );

      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Find agents that collaborate with a given agent
   * 
   * @param agentId - Agent ID
   * @returns Array of collaborating agent IDs
   */
  async findCollaborators(agentId: string): Promise<string[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.findCollaborators', undefined, {
      agentId,
    });

    try {
      // Use imported supabase client

      const { data, error } = await supabase
        .from('agent_relationships')
        .select('target_agent_id')
        .eq('source_agent_id', agentId)
        .eq('relationship_type', 'collaborates')
        .order('weight', { ascending: false });

      if (error) {
        throw error;
      }

      const collaboratorIds = (data || []).map((r) => r.target_agent_id);

      this.tracing.endSpan(spanId, true);

      return collaboratorIds;
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Find agents that supervise a given agent
   * 
   * @param agentId - Agent ID
   * @returns Array of supervising agent IDs
   */
  async findSupervisors(agentId: string): Promise<string[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.findSupervisors', undefined, {
      agentId,
    });

    try {
      // Use imported supabase client

      const { data, error } = await supabase
        .from('agent_relationships')
        .select('source_agent_id')
        .eq('target_agent_id', agentId)
        .eq('relationship_type', 'supervises')
        .order('weight', { ascending: false });

      if (error) {
        throw error;
      }

      const supervisorIds = (data || []).map((r) => r.source_agent_id);

      this.tracing.endSpan(spanId, true);

      return supervisorIds;
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Find agents that a given agent can delegate to
   * 
   * @param agentId - Agent ID
   * @returns Array of delegatable agent IDs
   */
  async findDelegationTargets(agentId: string): Promise<string[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.findDelegationTargets', undefined, {
      agentId,
    });

    try {
      // Use imported supabase client

      const { data, error } = await supabase
        .from('agent_relationships')
        .select('target_agent_id')
        .eq('source_agent_id', agentId)
        .eq('relationship_type', 'delegates')
        .order('weight', { ascending: false });

      if (error) {
        throw error;
      }

      const targetIds = (data || []).map((r) => r.target_agent_id);

      this.tracing.endSpan(spanId, true);

      return targetIds;
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Build agent team for complex queries
   * 
   * Uses graph traversal to find a team of agents that can work together.
   * 
   * @param leadAgentId - Lead agent ID
   * @param maxTeamSize - Maximum team size (default: 5)
   * @returns Array of team member agent IDs (including lead)
   */
  async buildAgentTeam(
    leadAgentId: string,
    maxTeamSize: number = 5
  ): Promise<string[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.buildAgentTeam', undefined, {
      leadAgentId,
      maxTeamSize,
    });

    const startTime = Date.now();

    try {
      // Use imported supabase client

      // Get all relationships for the lead agent
      const { data: relationships, error } = await supabase
        .from('agent_relationships')
        .select('*')
        .or(
          `source_agent_id.eq.${leadAgentId},target_agent_id.eq.${leadAgentId}`
        )
        .order('weight', { ascending: false })
        .limit(maxTeamSize * 2); // Get more candidates than needed

      if (error) {
        throw error;
      }

      const team = new Set<string>([leadAgentId]);
      const processedRelationships = new Set<string>();

      // Process relationships by weight (strongest first)
      for (const rel of relationships || []) {
        if (team.size >= maxTeamSize) {
          break;
        }

        const relKey = `${rel.source_agent_id}-${rel.target_agent_id}-${rel.relationship_type}`;
        if (processedRelationships.has(relKey)) {
          continue;
        }

        processedRelationships.add(relKey);

        // Add the other agent in the relationship
        if (rel.source_agent_id === leadAgentId) {
          team.add(rel.target_agent_id);
        } else {
          team.add(rel.source_agent_id);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.infoWithMetrics('graph_build_team_completed', duration, {
        operation: 'buildAgentTeam',
        leadAgentId,
        teamSize: team.size,
        maxTeamSize,
      });

      this.tracing.endSpan(spanId, true);

      return Array.from(team);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'graph_build_team_failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'buildAgentTeam',
          leadAgentId,
          duration,
        }
      );

      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Add knowledge graph node for an agent
   * 
   * @param agentId - Agent ID
   * @param entityType - Entity type (skill, domain, tool, knowledge_area)
   * @param entityName - Entity name
   * @param confidence - Confidence score (0.0 to 1.0)
   * @param embedding - Optional embedding vector
   * @param metadata - Optional metadata
   * @returns Created knowledge node
   */
  async addKnowledgeNode(
    agentId: string,
    entityType: KnowledgeEntityType,
    entityName: string,
    confidence: number = 1.0,
    embedding?: number[],
    metadata?: Record<string, any>
  ): Promise<AgentKnowledgeGraphNode> {
    const spanId = this.tracing.startSpan('AgentGraphService.addKnowledgeNode', undefined, {
      agentId,
      entityType,
      entityName,
    });

    try {
      // Use imported supabase client

      // Validate confidence
      if (confidence < 0 || confidence > 1) {
        throw new Error('Confidence must be between 0.0 and 1.0');
      }

      const { data, error } = await supabase
        .from('agent_knowledge_graph')
        .insert({
          agent_id: agentId,
          entity_type: entityType,
          entity_name: entityName,
          confidence,
          embedding: embedding || null,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);

      return data;
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get agent expertise graph
   * 
   * @param agentId - Agent ID
   * @returns Array of knowledge nodes
   */
  async getAgentExpertise(agentId: string): Promise<AgentKnowledgeGraphNode[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.getAgentExpertise', undefined, {
      agentId,
    });

    try {
      // Use imported supabase client

      const { data, error } = await supabase
        .from('agent_knowledge_graph')
        .select('*')
        .eq('agent_id', agentId)
        .order('confidence', { ascending: false });

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);

      return data || [];
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Find agents by expertise
   * 
   * Searches knowledge graph for agents with specific expertise.
   * 
   * @param entityName - Entity name to search for
   * @param entityType - Optional entity type filter
   * @param minConfidence - Minimum confidence threshold (default: 0.5)
   * @returns Array of agents with their confidence scores
   */
  async findAgentsByExpertise(
    entityName: string,
    entityType?: KnowledgeEntityType,
    minConfidence: number = 0.5
  ): Promise<Array<{ agent_id: string; confidence: number; entity_type: string }>> {
    const spanId = this.tracing.startSpan('AgentGraphService.findAgentsByExpertise', undefined, {
      entityName,
      entityType,
      minConfidence,
    });

    try {
      // Use imported supabase client

      let query = supabase
        .from('agent_knowledge_graph')
        .select('agent_id, confidence, entity_type')
        .ilike('entity_name', `%${entityName}%`)
        .gte('confidence', minConfidence);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error } = await query.order('confidence', {
        ascending: false,
      });

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);

      return data || [];
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get all relationships for an agent
   * 
   * @param agentId - Agent ID
   * @returns Array of relationships
   */
  async getAgentRelationships(agentId: string): Promise<AgentRelationship[]> {
    const spanId = this.tracing.startSpan('AgentGraphService.getAgentRelationships', undefined, {
      agentId,
    });

    try {
      // Use imported supabase client

      const { data, error } = await supabase
        .from('agent_relationships')
        .select('*')
        .or(`source_agent_id.eq.${agentId},target_agent_id.eq.${agentId}`)
        .order('weight', { ascending: false });

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);

      return data || [];
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Delete a relationship
   * 
   * @param relationshipId - Relationship ID
   */
  async deleteRelationship(relationshipId: string): Promise<void> {
    const spanId = this.tracing.startSpan('AgentGraphService.deleteRelationship', undefined, {
      relationshipId,
    });

    try {
      // Use imported supabase client

      const { error } = await supabase
        .from('agent_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Delete a knowledge node
   * 
   * @param nodeId - Knowledge node ID
   */
  async deleteKnowledgeNode(nodeId: string): Promise<void> {
    const spanId = this.tracing.startSpan('AgentGraphService.deleteKnowledgeNode', undefined, {
      nodeId,
    });

    try {
      // Use imported supabase client

      const { error } = await supabase
        .from('agent_knowledge_graph')
        .delete()
        .eq('id', nodeId);

      if (error) {
        throw error;
      }

      this.tracing.endSpan(spanId, true);
    } catch (error) {
      this.tracing.endSpan(spanId, false, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

// Singleton instance
let agentGraphServiceInstance: AgentGraphService | null = null;

export function getAgentGraphService(): AgentGraphService {
  if (!agentGraphServiceInstance) {
    agentGraphServiceInstance = new AgentGraphService();
  }
  return agentGraphServiceInstance;
}

export const agentGraphService = getAgentGraphService();

