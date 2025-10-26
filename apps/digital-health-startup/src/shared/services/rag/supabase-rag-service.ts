import { supabase } from '@vital/sdk/client';
import { agentService } from '@/shared/services/agents/agent-service';

// Types for RAG system - using fallback types for missing tables
export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  source_type: string;
  created_at: string;
}
export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: unknown;
  created_at: string;
}
export interface KnowledgeDomain {
  id: string;
  name: string;
  description: string;
}
export interface QueryLog {
  id: string;
  query: string;
  response: string;
  created_at: string;
}

export interface EmbeddingModels {
  openai: number[]; // 1536 dimensions
  clinical: number[]; // 768 dimensions
  legal: number[]; // 768 dimensions
  scientific: number[]; // 768 dimensions
}

export interface SearchResult {
  chunk_id: string;
  source_id: string;
  content: string;
  similarity: number;
  source_title: string;
  domain: string;
  metadata: {
    section_title?: string;
    page_number?: number;
    keywords?: string[];
    entities?: Record<string, string[]>;
  };
}

export interface RAGQuery {
  text: string;
  agent_id?: string;
  domain?: string;
  embedding_model?: 'openai' | 'clinical' | 'legal' | 'scientific';
  max_results?: number;
  similarity_threshold?: number;
  filters?: Record<string, unknown>;
}

export interface ProcessingJob {
  id: string;
  source_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error_message?: string;
}

export class SupabaseRAGService {
  private supabase = supabase;

  // ===== KNOWLEDGE SOURCE MANAGEMENT =====

  /**
   * Add a new knowledge source to the system
   */
  async addKnowledgeSource(source: {
    name: string;
    source_type: string;
    source_url?: string;
    file_path?: string;
    title: string;
    description?: string;
    authors?: string[];
    publication_date?: string;
    domain: string;
    category: string;
    tags?: string[];
    confidence_score?: number;
    is_public?: boolean;
    access_level?: string;
  }): Promise<KnowledgeSource> {
    const { data, error } = await this.supabase
      .from('knowledge_sources')
      .insert({
        ...source,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // console.error('Error adding knowledge source:', error);
      throw new Error('Failed to add knowledge source');
    }

    return data;
  }

  /**
   * Get knowledge sources by domain
   */
  async getKnowledgeSourcesByDomain(domain: string): Promise<KnowledgeSource[]> {
    const { data, error } = await this.supabase
      .from('knowledge_sources')
      .select('*')
      .eq('domain', domain)
      .eq('status', 'active')
      .order('publication_date', { ascending: false });

    if (error) {
      // console.error('Error fetching knowledge sources:', error);
      throw new Error('Failed to fetch knowledge sources');
    }

    return data || [];
  }

  /**
   * Search knowledge sources
   */
  async searchKnowledgeSources(
    searchTerm: string,
    domain?: string,
    category?: string
  ): Promise<KnowledgeSource[]> {
    let query = this.supabase
      .from('knowledge_sources')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

    if (domain) {
      query = query.eq('domain', domain);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('relevance_score', { ascending: false })
      .order('publication_date', { ascending: false });

    if (error) {
      // console.error('Error searching knowledge sources:', error);
      throw new Error('Failed to search knowledge sources');
    }

    return data || [];
  }

  // ===== DOCUMENT CHUNK MANAGEMENT =====

  /**
   * Add document chunks with embeddings
   */
  async addDocumentChunks(chunks: {
    knowledge_source_id: string;
    content: string;
    chunk_index: number;
    section_title?: string;
    page_number?: number;
    embeddings: Partial<EmbeddingModels>;
    keywords?: string[];
    entities?: Record<string, string[]>;
    quality_score?: number;
  }[]): Promise<DocumentChunk[]> {
    const chunksToInsert = chunks.map((chunk) => ({
      knowledge_source_id: chunk.knowledge_source_id,
      content: chunk.content,
      content_length: chunk.content.length,
      chunk_index: chunk.chunk_index,
      section_title: chunk.section_title,
      page_number: chunk.page_number,
      embedding_openai: chunk.embeddings.openai ? JSON.stringify(chunk.embeddings.openai) : null,
      embedding_clinical: chunk.embeddings.clinical ? JSON.stringify(chunk.embeddings.clinical) : null,
      embedding_legal: chunk.embeddings.legal ? JSON.stringify(chunk.embeddings.legal) : null,
      embedding_scientific: chunk.embeddings.scientific ? JSON.stringify(chunk.embeddings.scientific) : null,
      keywords: chunk.keywords || [],
      entities: chunk.entities || { /* TODO: implement */ },
      chunk_quality_score: chunk.quality_score || 1.0,
      embedding_model_versions: {
        openai: chunk.embeddings.openai ? 'text-embedding-ada-002' : null,
        clinical: chunk.embeddings.clinical ? 'clinical-bert-base' : null,
        legal: chunk.embeddings.legal ? 'legal-bert-base' : null,
        scientific: chunk.embeddings.scientific ? 'scibert-base' : null,
      }
    }));

    const { data, error } = await this.supabase
      .from('document_chunks')
      .insert(chunksToInsert)
      .select();

    if (error) {
      // console.error('Error adding document chunks:', error);
      throw new Error('Failed to add document chunks');
    }

    return data || [];
  }

  // ===== VECTOR SEARCH =====

  /**
   * Perform semantic search using embeddings
   */
  async searchKnowledge(query: RAGQuery): Promise<SearchResult[]> {
    const {
      text,
      agent_id,
      domain,
      embedding_model = 'openai',
      max_results = 10,
      similarity_threshold = 0.7
    } = query;

    // First, get the embedding for the query text
    // In a real implementation, you would call your embedding service here
    const queryEmbedding = await this.getQueryEmbedding(text, embedding_model);

    // Log the query for analytics
    if (agent_id) {
      await this.logQuery({
        agent_id,
        query_text: text,
        query_embedding: queryEmbedding.openai || [], // Store primary embedding
        query_domain: domain,
        embedding_model,
        top_k: max_results,
        filters: query.filters || { /* TODO: implement */ }
      });
    }

    // Use Supabase function for vector search
    const { data, error } = await this.supabase.rpc('search_knowledge_by_embedding', {
      query_embedding: JSON.stringify(queryEmbedding[embedding_model] || queryEmbedding.openai),
      domain_filter: domain || null,
      embedding_model,
      max_results,
      similarity_threshold
    });

    if (error) {
      // console.error('Error in vector search:', error);
      throw new Error('Failed to perform vector search');
    }

    return data || [];
  }

  /**
   * Perform agent-optimized search with relevance boosting
   */
  async searchForAgent(
    agentId: string,
    queryText: string,
    maxResults: number = 10
  ): Promise<SearchResult[]> {
    // Get agent's primary domain and capabilities
    const agent = await agentService.getAgentById(agentId);

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get query embedding
    const queryEmbedding = await this.getQueryEmbedding(queryText, 'openai');

    // Use the agent-optimized search function
    const { data, error } = await this.supabase.rpc('search_knowledge_for_agent', {
      agent_id_param: agentId,
      query_text_param: queryText,
      query_embedding_param: JSON.stringify(queryEmbedding.openai),
      max_results: maxResults
    });

    if (error) {
      // console.error('Error in agent-optimized search:', error);
      throw new Error('Failed to perform agent search');
    }

    // Update access patterns
    if (data && data.length > 0) {
      await this.updateAgentKnowledgeAccess(agentId, data.map((r: unknown) => r.source_id));
    }

    return data?.map((item: unknown) => ({
      chunk_id: item.chunk_id,
      source_id: item.source_id || '', // Handle potential null
      content: item.content,
      similarity: item.relevance_boost, // Use boosted similarity
      source_title: item.source_title,
      domain: '', // Will be filled by join in real implementation
      metadata: { /* TODO: implement */ } // Will be filled by join in real implementation
    })) || [];
  }

  /**
   * Get contextual search results with conversation history
   */
  async searchWithContext(
    query: RAGQuery,
    conversationHistory: string[],
    contextWeight: number = 0.3
  ): Promise<SearchResult[]> {
    // Combine query with recent conversation context
    const contextualQuery = [
      ...conversationHistory.slice(-3), // Last 3 messages
      query.text
    ].join(' ');

    // Perform search with enhanced context
    const results = await this.searchKnowledge({
      ...query,
      text: contextualQuery
    });

    // Re-rank results based on context relevance
    return this.rerankWithContext(results, query.text, conversationHistory, contextWeight);
  }

  // ===== ANALYTICS & FEEDBACK =====

  /**
   * Log a query for analytics
   */
  private async logQuery(queryData: {
    agent_id: string;
    query_text: string;
    query_embedding: number[];
    query_domain?: string;
    embedding_model: string;
    top_k: number;
    filters: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('query_logs')
      .insert({
        agent_id: queryData.agent_id,
        query_text: queryData.query_text,
        query_embedding: JSON.stringify(queryData.query_embedding),
        query_domain: queryData.query_domain,
        embedding_model: queryData.embedding_model,
        top_k: queryData.top_k,
        filters: queryData.filters,
        retrieval_time_ms: 0, // Will be updated after search completes
      });

    if (error) {
      // console.error('Error logging query:', error);
    }
  }

  /**
   * Update agent knowledge access patterns
   */
  private async updateAgentKnowledgeAccess(
    agentId: string,
    sourceIds: string[]
  ): Promise<void> {
    for (const sourceId of sourceIds) {
      const { error } = await this.supabase
        .from('agent_knowledge_access')
        .upsert({
          agent_id: agentId,
          knowledge_source_id: sourceId,
          access_count: 1, // Will be incremented by database trigger
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: 'agent_id,knowledge_source_id'
        });

      if (error) {
        // console.error('Error updating access patterns:', error);
      }
    }
  }

  /**
   * Record user feedback on search results
   */
  async recordFeedback(
    queryId: string,
    rating: number,
    feedback: string,
    relevantChunkIds: string[]
  ): Promise<void> {
    const { error } = await this.supabase
      .from('query_logs')
      .update({
        user_rating: rating,
        user_feedback: feedback,
        relevance_score: rating / 5.0
      })
      .eq('id', queryId);

    if (error) {
      // console.error('Error recording feedback:', error);
      throw new Error('Failed to record feedback');
    }

    // Update chunk feedback scores
    for (const chunkId of relevantChunkIds) {
      await this.updateChunkFeedback(chunkId, rating / 5.0);
    }
  }

  private async updateChunkFeedback(chunkId: string, score: number): Promise<void> {
    const { error } = await this.supabase
      .from('document_chunks')
      .update({
        feedback_score: score
        // Note: retrieval_count increment would need to be handled via RPC or separate query
      })
      .eq('id', chunkId);

    if (error) {
      // console.error('Error updating chunk feedback:', error);
    }
  }

  // ===== DOMAIN MANAGEMENT =====

  /**
   * Get knowledge domains
   */
  async getKnowledgeDomains(): Promise<KnowledgeDomain[]> {
    const { data, error } = await this.supabase
      .from('knowledge_domains')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // console.error('Error fetching knowledge domains:', error);
      throw new Error('Failed to fetch knowledge domains');
    }

    return data || [];
  }

  /**
   * Update domain statistics
   */
  async updateDomainStats(domainName: string): Promise<void> {
    const { data: stats } = await this.supabase
      .from('knowledge_sources')
      .select('id')
      .eq('domain', domainName)
      .eq('status', 'active');

    const { data: chunkStats } = await this.supabase
      .from('document_chunks')
      .select('id, content_length')
      .in('knowledge_source_id', stats?.map((s: any) => s.id) || []);

    const totalSources = stats?.length || 0;
    const totalChunks = chunkStats?.length || 0;
    const totalSizeMB = (chunkStats?.reduce((sum, chunk) => sum + (chunk.content_length || 0), 0) || 0) / (1024 * 1024);

    await this.supabase
      .from('knowledge_domains')
      .update({
        total_sources: totalSources,
        total_chunks: totalChunks,
        total_size_mb: totalSizeMB,
        last_updated: new Date().toISOString()
      })
      .eq('name', domainName);
  }

  // ===== HELPER METHODS =====

  /**
   * Get embedding for query text using OpenAI
   */
  private async getQueryEmbedding(text: string, model: string): Promise<Partial<EmbeddingModels>> {
    try {
      // Import embedding service
      const { embeddingService } = await import('@/lib/services/embeddings/openai-embedding-service');

      // Generate OpenAI embedding
      const result = await embeddingService.generateEmbedding(text);

      return {
        openai: result.embedding,
        // Note: For clinical, legal, scientific embeddings,
        // you would need to integrate specialized models
        // For now, we use OpenAI as the primary embedding
      };
    } catch (error) {
      console.error('Failed to generate embedding:', error);

      // Fallback: Return null to trigger text search
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Re-rank results based on conversation context
   */
  private rerankWithContext(
    results: SearchResult[],
    originalQuery: string,
    context: string[],
    contextWeight: number
  ): SearchResult[] {
    // Simple context re-ranking - in production, use more sophisticated methods
    return results.map((result: any) => ({
      ...result,
      similarity: result.similarity * (1 - contextWeight) +
                 this.calculateContextRelevance(result.content, context) * contextWeight
    })).sort((a, b) => b.similarity - a.similarity);
  }

  private calculateContextRelevance(content: string, context: string[]): number {
    // Simple keyword overlap scoring
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    const contextWords = new Set(context.join(' ').toLowerCase().split(/\s+/));
    const overlap = [...contentWords].filter(word => contextWords.has(word)).length;

    return overlap / Math.max(contentWords.size, 1);
  }

  // ===== BATCH OPERATIONS =====

  /**
   * Batch process documents for embedding
   */
  async batchProcessDocuments(sourceIds: string[]): Promise<ProcessingJob[]> {
    const jobs: ProcessingJob[] = [];

    for (const sourceId of sourceIds) {
      // Update processing status
      await this.supabase
        .from('knowledge_sources')
        .update({ processing_status: 'processing' })
        .eq('id', sourceId);

      const job: ProcessingJob = {
        id: `job_${sourceId}_${Date.now()}`,
        source_id: sourceId,
        status: 'processing',
        progress: 0
      };

      jobs.push(job);

      // In production, this would trigger background processing
      // For now, we'll simulate it
      this.processDocumentAsync(job);
    }

    return jobs;
  }

  private async processDocumentAsync(job: ProcessingJob): Promise<void> {
    try {
      // Simulate document processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job status
      job.status = 'completed';
      job.progress = 100;

      // Update source status
      await this.supabase
        .from('knowledge_sources')
        .update({
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', job.source_id);

    } catch (error) {
      job.status = 'error';
      job.error_message = error instanceof Error ? error.message : 'Unknown error';

      await this.supabase
        .from('knowledge_sources')
        .update({ processing_status: 'error' })
        .eq('id', job.source_id);
    }
  }

  // ===== HEALTH & MONITORING =====

  /**
   * Get system health metrics
   */
  async getHealthMetrics(): Promise<{
    total_sources: number;
    total_chunks: number;
    total_size_gb: number;
    processing_queue: number;
    avg_query_time_ms: number;
    domains: Record<string, number>;
  }> {
    const [
      sourcesCount,
      chunksCount,
      processingCount,
      avgQueryTime,
      domainStats
    ] = await Promise.all([
      this.supabase.from('knowledge_sources').select('id', { count: 'exact' }),
      this.supabase.from('document_chunks').select('id, content_length', { count: 'exact' }),
      this.supabase.from('knowledge_sources').select('id').eq('processing_status', 'pending'),
      this.supabase.from('query_logs').select('retrieval_time_ms').order('created_at', { ascending: false }).limit(100),
      this.supabase.from('knowledge_sources').select('domain').eq('status', 'active')
    ]);

    const domainCounts: Record<string, number> = { /* TODO: implement */ };
    domainStats.data?.forEach(source => {
      domainCounts[source.domain] = (domainCounts[source.domain] || 0) + 1;
    });

    const totalSize = chunksCount.data?.reduce((sum, chunk) => sum + (chunk.content_length || 0), 0) || 0;
    const avgTime = avgQueryTime.data?.reduce((sum, log) => sum + (log.retrieval_time_ms || 0), 0) / Math.max(avgQueryTime.data?.length || 1, 1);

    return {
      total_sources: sourcesCount.count || 0,
      total_chunks: chunksCount.count || 0,
      total_size_gb: totalSize / (1024 * 1024 * 1024),
      processing_queue: processingCount.data?.length || 0,
      avg_query_time_ms: avgTime,
      domains: domainCounts
    };
  }

  /**
   * Enhanced search method for backward compatibility
   * Used by the LLM query API
   */
  async enhancedSearch(question: string, options: {
    agentType?: string;
    phase?: string;
    maxResults?: number;
    similarityThreshold?: number;
    includeMetadata?: boolean;
  }): Promise<{
    context: string;
    sources: SearchResult[];
  }> {
    try {
      // Use the existing searchKnowledge method
      const results = await this.searchKnowledge({
        text: question,
        domain: options.agentType,
        max_results: options.maxResults || 5,
        similarity_threshold: options.similarityThreshold || 0.7,
        filters: {
          phase: options.phase
        }
      });

      // Build context from results
      const context = results
        .map((result, index) =>
          `Source ${index + 1}: ${result.source_title}\n${result.content}\n`
        )
        .join('\n');

      return {
        context,
        sources: results
      };
    } catch (error) {
      // console.error('Error in enhanced search:', error);
      return {
        context: '',
        sources: []
      };
    }
  }
}

export const __supabaseRAGService = new SupabaseRAGService();