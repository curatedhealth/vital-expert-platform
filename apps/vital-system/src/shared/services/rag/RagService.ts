/**
 * RAG Service
 * Service layer for managing RAG knowledge bases and agent assignments
 */

import { supabase } from '@vital/sdk/client';

export interface RagKnowledgeBase {
  id: string;
  name: string;
  display_name: string;
  description: string;
  purpose_description: string;
  rag_type: 'global' | 'agent_specific';
  vector_store_config?: Record<string, unknown>;
  embedding_model?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  similarity_threshold?: number;
  document_count: number;
  total_chunks?: number;
  knowledge_domains: string[];
  content_types?: string[];
  data_sources?: string[];
  is_public?: boolean;
  access_level?: 'public' | 'organization' | 'private';
  created_by?: string;
  last_indexed_at?: string;
  index_status?: 'indexing' | 'ready' | 'error' | 'updating';
  quality_score?: number;
  performance_metrics?: Record<string, unknown>;
  contains_phi?: boolean;
  hipaa_compliant?: boolean;
  data_retention_days?: number;
  encryption_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'archived';
  // For UI components
  is_assigned?: boolean;
  assignment_priority?: number;
}

export interface AgentRagAssignment {
  id: string;
  agent_id: string;
  rag_id: string;
  is_primary: boolean;
  priority: number;
  usage_context?: string;
  query_filters: Record<string, unknown>;
  usage_count: number;
  avg_relevance_score?: number;
  last_used_at?: string;
  max_results: number;
  custom_prompt_instructions?: string;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
}

export interface RagDocument {
  id: string;
  rag_id: string;
  document_name: string;
  original_filename?: string;
  file_path?: string;
  document_type: string;
  content_hash?: string;
  file_size_bytes?: number;
  page_count?: number;
  word_count?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  chunk_count: number;
  embedding_count: number;
  content_categories: string[];
  extracted_entities: Record<string, unknown>;
  key_topics: string[];
  confidence_score?: number;
  readability_score?: number;
  relevance_score?: number;
  completeness_score?: number;
  contains_phi: boolean;
  redaction_applied: boolean;
  compliance_tags: string[];
  uploaded_by?: string;
  uploaded_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RagUsageAnalytics {
  id: string;
  rag_id: string;
  agent_id?: string;
  query_text: string;
  query_embedding_model?: string;
  query_timestamp: string;
  results_count: number;
  top_relevance_score?: number;
  avg_relevance_score?: number;
  response_time_ms?: number;
  conversation_id?: string;
  user_id?: string;
  query_intent?: string;
  cache_hit: boolean;
  tokens_used?: number;
  cost_estimate?: number;
  user_rating?: number;
  user_feedback?: string;
  relevance_confirmed?: boolean;
  created_at: string;
}

export class RagService {
  /**
   * Get all global RAG knowledge bases
   */
  static async getGlobalRagDatabases(): Promise<RagKnowledgeBase[]> {
    try {
      const { data, error } = await supabase.rpc('get_global_rag_databases');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get RAG databases available for an agent
   */
  static async getAvailableRagForAgent(agentName: string): Promise<RagKnowledgeBase[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_rag_for_agent', {
        agent_name_param: agentName
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get RAG databases assigned to an agent
   */
  static async getAgentAssignedRag(agentName: string): Promise<AgentRagAssignment[]> {
    try {
      const { data, error } = await supabase.rpc('get_agent_assigned_rag', {
        agent_name_param: agentName
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new RAG knowledge base
   */
  static async createRagKnowledgeBase(ragData: Partial<RagKnowledgeBase>): Promise<RagKnowledgeBase> {
    try {
      const { data, error } = await supabase
        .from('rag_knowledge_bases')
        .insert([{
          name: ragData.name,
          display_name: ragData.display_name,
          description: ragData.description,
          purpose_description: ragData.purpose_description,
          rag_type: ragData.rag_type,
          embedding_model: ragData.embedding_model || 'text-embedding-ada-002',
          chunk_size: ragData.chunk_size || 1000,
          chunk_overlap: ragData.chunk_overlap || 200,
          similarity_threshold: ragData.similarity_threshold || 0.7,
          knowledge_domains: ragData.knowledge_domains || [],
          is_public: ragData.is_public || false,
          access_level: ragData.access_level || 'organization',
          contains_phi: ragData.contains_phi || false,
          hipaa_compliant: ragData.hipaa_compliant || true,
          created_by: ragData.created_by
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Assign a RAG database to an agent
   */
  static async assignRagToAgent(
    agentId: string,
    ragId: string,
    assignment: Partial<AgentRagAssignment>
  ): Promise<AgentRagAssignment> {
    try {
      const { data, error } = await supabase
        .from('agent_rag_assignments')
        .insert([{
          agent_id: agentId,
          rag_id: ragId,
          is_primary: assignment.is_primary || false,
          priority: assignment.priority || 50,
          usage_context: assignment.usage_context,
          custom_prompt_instructions: assignment.custom_prompt_instructions,
          max_results: assignment.max_results || 5,
          assigned_by: assignment.assigned_by
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update agent RAG assignment
   */
  static async updateAgentRagAssignment(
    assignmentId: string,
    updates: Partial<AgentRagAssignment>
  ): Promise<AgentRagAssignment> {
    try {
      const { data, error } = await supabase
        .from('agent_rag_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove RAG assignment from agent
   */
  static async unassignRagFromAgent(agentId: string, ragId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_rag_assignments')
        .delete()
        .eq('agent_id', agentId)
        .eq('rag_id', ragId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get documents in a RAG knowledge base
   */
  static async getRagDocuments(ragId: string): Promise<RagDocument[]> {
    try {
      const { data, error } = await supabase
        .from('rag_documents')
        .select('*')
        .eq('rag_id', ragId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add document to RAG knowledge base
   */
  static async addDocumentToRag(ragId: string, document: Partial<RagDocument>): Promise<RagDocument> {
    try {
      const { data, error } = await supabase
        .from('rag_documents')
        .insert([{
          rag_id: ragId,
          document_name: document.document_name,
          original_filename: document.original_filename,
          file_path: document.file_path,
          document_type: document.document_type || 'unknown',
          content_hash: document.content_hash,
          file_size_bytes: document.file_size_bytes,
          page_count: document.page_count,
          word_count: document.word_count,
          content_categories: document.content_categories || [],
          contains_phi: document.contains_phi || false,
          compliance_tags: document.compliance_tags || [],
          uploaded_by: document.uploaded_by
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query RAG knowledge base
   */
  static async queryRag(
    ragId: string,
    query: string,
    options: {
      maxResults?: number;
      similarityThreshold?: number;
      filters?: Record<string, unknown>;
      agentId?: string;
      conversationId?: string;
    } = {}
  ): Promise<{
    results: Array<{
      content: string;
      metadata: Record<string, unknown>;
      score: number;
      document_id: string;
    }>;
    analytics: {
      query_id: string;
      response_time_ms: number;
      results_count: number;
      top_score: number;
      avg_score: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // In a real implementation, this would:
      // 1. Generate embeddings for the query
      // 2. Perform vector similarity search
      // 3. Apply filters and ranking
      // 4. Log analytics
      // 5. Return formatted results

      // Simulate vector search results
      const mockResults = [
        {
          content: 'Sample relevant content from the RAG database...',
          metadata: {
            document_name: 'FDA Guidance Document',
            page: 12,
            section: 'Clinical Trial Requirements'
          },
          score: 0.87,
          document_id: 'doc_123'
        }
      ];

      const responseTime = Date.now() - startTime;

      // Log analytics
      await this.logRagUsage({
        rag_id: ragId,
        agent_id: options.agentId,
        query_text: query,
        results_count: mockResults.length,
        top_relevance_score: mockResults[0]?.score,
        avg_relevance_score: mockResults.reduce((sum, r) => sum + r.score, 0) / mockResults.length,
        response_time_ms: responseTime,
        conversation_id: options.conversationId
      });

      return {
        results: mockResults,
        analytics: {
          query_id: `query_${Date.now()}`,
          response_time_ms: responseTime,
          results_count: mockResults.length,
          top_score: mockResults[0]?.score || 0,
          avg_score: mockResults.reduce((sum, r) => sum + r.score, 0) / mockResults.length
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log RAG usage analytics
   */
  static async logRagUsage(analytics: Partial<RagUsageAnalytics>): Promise<void> {
    try {
      const { error } = await supabase
        .from('rag_usage_analytics')
        .insert([analytics]);

      if (error) {
        // Don't throw here to avoid breaking the main query flow
      }
    } catch (error) {
      // Silent fail for analytics logging
    }
  }

  /**
   * Get RAG usage analytics
   */
  static async getRagAnalytics(
    ragId?: string,
    agentId?: string,
    timeRange?: {
      startDate: string;
      endDate: string;
    }
  ): Promise<RagUsageAnalytics[]> {
    try {
      let query = supabase
        .from('rag_usage_analytics')
        .select('*');

      if (ragId) {
        query = query.eq('rag_id', ragId);
      }

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (timeRange) {
        query = query
          .gte('query_timestamp', timeRange.startDate)
          .lte('query_timestamp', timeRange.endDate);
      }

      const { data, error } = await query.order('query_timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get agent context for RAG usage
   * Returns RAG descriptions and usage instructions for the agent
   */
  static async getAgentRagContext(agentName: string): Promise<{
    assigned_rags: Array<{
      id: string;
      name: string;
      description: string;
      purpose_description: string;
      usage_context?: string;
      custom_prompt_instructions?: string;
      priority: number;
      is_primary: boolean;
    }>;
    context_summary: string;
  }> {
    try {
      const assignedRags = await this.getAgentAssignedRag(agentName);

      // Generate context summary for the agent
      const contextSummary = this.generateRagContextSummary(assignedRags);

      return {
        assigned_rags: assignedRags.map(rag => ({
          id: rag.rag_id,
          name: rag.rag_id, // In real implementation, would join with rag_knowledge_bases
          description: 'RAG database description', // Would come from joined data
          purpose_description: 'Purpose description', // Would come from joined data
          usage_context: rag.usage_context,
          custom_prompt_instructions: rag.custom_prompt_instructions,
          priority: rag.priority,
          is_primary: rag.is_primary
        })),
        context_summary: contextSummary
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate RAG context summary for agent prompts
   */
  private static generateRagContextSummary(assignments: AgentRagAssignment[]): string {
    if (assignments.length === 0) {
      return 'No RAG knowledge bases assigned to this agent.';
    }

    const primaryRag = assignments.find(a => a.is_primary);
    let summary = `You have access to ${assignments.length} knowledge base(s). `;

    if (primaryRag) {
      summary += `Your primary knowledge base should be used for most queries. `;
    }

    summary += `Each knowledge base has specific usage instructions that should guide when and how to use them. `;
    summary += `Always consider the relevance and priority of each knowledge base when answering questions.`;

    return summary;
  }
}
