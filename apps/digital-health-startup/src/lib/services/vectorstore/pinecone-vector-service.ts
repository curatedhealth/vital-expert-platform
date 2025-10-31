/**
 * Pinecone Vector Store Service
 * Handles all vector operations using Pinecone
 * Metadata is stored in Supabase, vectors in Pinecone
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEmbeddingService } from '../embeddings/embedding-service-factory';

export interface PineconeVectorRecord {
  id: string;
  values: number[];
  metadata: {
    chunk_id: string;
    document_id: string;
    content: string;
    domain?: string; // Legacy field for backward compatibility
    domain_id?: string; // New field: primary domain identifier
    parent_domain_id?: string; // New field: for hierarchy fallback
    domain_scope?: string; // New field: global/enterprise/user
    access_policy?: string; // New field: access control level
    rag_priority_weight?: number; // New field: priority for ranking (0-1)
    enterprise_id?: string; // New field: for multi-tenant filtering
    owner_user_id?: string; // New field: for user-scoped content
    tier?: number; // New field: domain tier (1=Core, 2=Specialized, 3=Emerging)
    maturity_level?: string; // New field: domain maturity
    source_title?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface VectorSearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  metadata: any;
  source_title?: string;
  domain?: string; // Legacy field
  domain_id?: string; // New field
  rag_priority_weight?: number; // Priority weight for ranking
}

export interface VectorSearchQuery {
  text?: string;
  embedding?: number[];
  filter?: Record<string, any>;
  topK?: number;
  minScore?: number;
  namespace?: string;
}

export class PineconeVectorService {
  private pinecone: Pinecone;
  private supabase: SupabaseClient;
  private indexName: string;
  private dimension: number;
  private knowledgeNamespace: string = 'domains-knowledge'; // Named namespace for all knowledge chunks

  constructor(config?: {
    pineconeApiKey?: string;
    indexName?: string;
    supabaseUrl?: string;
    supabaseKey?: string;
    dimension?: number;
  }) {
    // Initialize Pinecone
    const apiKey = config?.pineconeApiKey || process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is required');
    }

    this.pinecone = new Pinecone({ apiKey });
    this.indexName = config?.indexName || process.env.PINECONE_INDEX_NAME || 'vital-knowledge';
    this.dimension = config?.dimension || 3072; // text-embedding-3-large

    // Initialize Supabase for metadata
    this.supabase = createClient(
      config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      config?.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log(`✅ Pinecone Vector Service initialized (index: ${this.indexName})`);
  }

  /**
   * Initialize Pinecone index if it doesn't exist
   */
  async initializeIndex(): Promise<void> {
    try {
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === this.indexName);

      if (!indexExists) {
        console.log(`Creating Pinecone index: ${this.indexName}...`);

        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: this.dimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });

        console.log('✅ Pinecone index created');
      } else {
        console.log('✅ Pinecone index already exists');
      }
    } catch (error) {
      console.error('Failed to initialize Pinecone index:', error);
      throw error;
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  async upsertVectors(
    vectors: Array<{
      id: string;
      values: number[];
      metadata: Record<string, any>;
    }>,
    namespace?: string
  ): Promise<void> {
    const index = this.pinecone.Index(this.indexName);

    try {
      // Pinecone has a limit of 100 vectors per upsert
      const batchSize = 100;

      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);

        await index.namespace(namespace || this.knowledgeNamespace).upsert(batch);

        console.log(`  Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      }

      console.log(`✅ Upserted ${vectors.length} vectors to Pinecone`);
    } catch (error) {
      console.error('Failed to upsert vectors:', error);
      throw error;
    }
  }

  /**
   * Search vectors in Pinecone
   */
  async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    const index = this.pinecone.Index(this.indexName);

    try {
      // Generate embedding if text provided via API Gateway
      let queryVector: number[];
      if (query.embedding) {
        queryVector = query.embedding;
      } else if (query.text) {
        const embeddingService = getEmbeddingService({
          provider: 'openai',
          model: 'text-embedding-3-large',
        });
        const result = await embeddingService.generateEmbedding(query.text, {
          useCache: true,
        });
        queryVector = result.embedding;
      } else {
        throw new Error('Either text or embedding must be provided');
      }

      // Perform vector search in Pinecone
      const filter =
        query.filter && Object.keys(query.filter).length > 0
          ? query.filter
          : undefined;

      const searchResponse = await index.namespace(query.namespace || this.knowledgeNamespace).query({
        vector: queryVector,
        topK: query.topK || 10,
        includeMetadata: true,
        filter,
      });

      // Filter by minimum score
      const filtered = searchResponse.matches?.filter(
        match => match.score! >= (query.minScore || 0.7)
      ) || [];

      // Convert to our result format
      const results: VectorSearchResult[] = filtered.map(match => ({
        chunk_id: match.metadata?.chunk_id as string,
        document_id: match.metadata?.document_id as string,
        content: match.metadata?.content as string,
        similarity: match.score!,
        metadata: match.metadata,
        source_title: match.metadata?.source_title as string,
        domain: match.metadata?.domain as string, // Legacy field
        domain_id: match.metadata?.domain_id as string, // New field
        rag_priority_weight: match.metadata?.rag_priority_weight as number | undefined, // Priority weight
      }));

      console.log(`🔍 Found ${results.length} results in Pinecone`);

      return results;

    } catch (error) {
      console.error('Pinecone search failed:', error);
      throw error;
    }
  }

  /**
   * Hybrid search: Pinecone for vectors + Supabase for metadata filtering
   */
  async hybridSearch(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    // Step 1: Get candidates from Pinecone (cast wider net)
    const pineconeResults = await this.search({
      ...query,
      topK: (query.topK || 10) * 3, // Get 3x candidates
      minScore: Math.max((query.minScore || 0.7) - 0.1, 0.5), // Lower threshold
    });

    // Step 2: Enrich with Supabase metadata and apply filters
    const chunkIds = pineconeResults.map((r: any) => r.chunk_id);

    if (chunkIds.length === 0) return [];

    const { data: chunks, error } = await this.supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        metadata,
        document_id,
        domain_id,
        access_policy,
        rag_priority_weight,
        knowledge_documents!inner(
          id,
          title,
          domain,
          domain_id,
          tags,
          status
        )
      `)
      .in('id', chunkIds);

    if (error) {
      console.error('Supabase metadata query failed:', error);
      return pineconeResults; // Return Pinecone results without enrichment
    }

    // Step 3: Merge Pinecone scores with Supabase metadata
    const enrichedResults = pineconeResults.map(pineconeResult => {
      const supabaseData = chunks?.find((c: any) => c.id === pineconeResult.chunk_id);

      if (!supabaseData) return pineconeResult;

      return {
        ...pineconeResult,
        content: supabaseData.content || pineconeResult.content,
        metadata: {
          ...pineconeResult.metadata,
          ...supabaseData.metadata,
        },
        source_title: supabaseData.knowledge_documents?.title,
        domain: supabaseData.knowledge_documents?.domain, // Legacy field
        domain_id: supabaseData.domain_id || supabaseData.knowledge_documents?.domain_id || supabaseData.knowledge_documents?.domain,
        rag_priority_weight: supabaseData.rag_priority_weight || pineconeResult.metadata?.rag_priority_weight,
      };
    });

    // Step 4: Apply additional filters from Supabase (support both domain and domain_id)
    let filtered = enrichedResults;

    // Support both legacy 'domain' and new 'domain_id' filters
    if (query.filter?.domain) {
      filtered = filtered.filter((r: any) => 
        r.domain === query.filter!.domain || 
        r.domain_id === query.filter!.domain
      );
    }
    
    // Support explicit domain_id filter
    if (query.filter?.domain_id) {
      filtered = filtered.filter((r: any) => r.domain_id === query.filter!.domain_id);
    }

    if (query.filter?.tags) {
      filtered = filtered.filter((r: any) => {
        const chunkData = chunks?.find((c: any) => c.id === r.chunk_id);
        const docTags = chunkData?.knowledge_documents?.tags || [];
        return query.filter!.tags.some((tag: string) => docTags.includes(tag));
      });
    }

    // Step 5: Return top K results
    return filtered.slice(0, query.topK || 10);
  }

  /**
   * Agent-optimized search with domain boosting
   */
  async searchForAgent(
    agentId: string,
    queryText: string,
    topK: number = 10
  ): Promise<VectorSearchResult[]> {
    // Get agent metadata from Supabase
    const { data: agent } = await this.supabase
      .from('agents')
      .select('metadata, capabilities, name')
      .eq('id', agentId)
      .single();

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentDomain = typeof agent.metadata?.primary_domain === 'string'
      ? agent.metadata.primary_domain.trim()
      : 'general';

    // Perform search without enforcing a filter to keep broader recall
    const results = await this.hybridSearch({
      text: queryText,
      topK: topK * 2, // Get more candidates
    });

    // Apply domain boosting
    const boosted = results.map((result: any) => {
      let boost = 1.0;

      // 30% boost for matching domain
      if (result.domain === agentDomain) {
        boost = 1.3;
      }
      // 15% boost for related capabilities
      else if (agent.capabilities?.includes(result.domain)) {
        boost = 1.15;
      }

      return {
        ...result,
        similarity: result.similarity * boost,
      };
    });

    // Re-sort and return top K
    return boosted
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Delete vectors from Pinecone
   */
  async deleteVectors(ids: string[], namespace?: string): Promise<void> {
    const index = this.pinecone.Index(this.indexName);

    try {
      await index.namespace(namespace || this.knowledgeNamespace).deleteMany(ids);
      console.log(`✅ Deleted ${ids.length} vectors from Pinecone`);
    } catch (error) {
      console.error('Failed to delete vectors:', error);
      throw error;
    }
  }

  /**
   * Delete all vectors in a namespace
   */
  async deleteNamespace(namespace: string): Promise<void> {
    const index = this.pinecone.Index(this.indexName);

    try {
      await index.namespace(namespace).deleteAll();
      console.log(`✅ Deleted all vectors in namespace: ${namespace}`);
    } catch (error) {
      console.error('Failed to delete namespace:', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(namespace?: string): Promise<{
    dimension: number;
    indexFullness: number;
    totalVectorCount: number;
    namespaces?: Record<string, { vectorCount: number }>;
  }> {
    const index = this.pinecone.Index(this.indexName);

    try {
      const stats = await index.describeIndexStats();

      return {
        dimension: stats.dimension || this.dimension,
        indexFullness: stats.indexFullness || 0,
        totalVectorCount: stats.totalRecordCount || 0,
        namespaces: stats.namespaces,
      };
    } catch (error) {
      console.error('Failed to get index stats:', error);
      throw error;
    }
  }

  /**
   * Sync document chunk to Pinecone
   * Call this after adding/updating a chunk in Supabase
   */
  async syncChunkToPinecone(chunkId: string): Promise<void> {
    // Get chunk from Supabase
    const { data: chunk, error } = await this.supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        embedding,
        metadata,
        document_id,
        knowledge_documents(
          id,
          title,
          domain
        )
      `)
      .eq('id', chunkId)
      .single();

    if (error || !chunk) {
      throw new Error(`Chunk ${chunkId} not found`);
    }

    if (!chunk.embedding) {
      throw new Error(`Chunk ${chunkId} has no embedding`);
    }

    // Upsert to Pinecone
    await this.upsertVectors([
      {
        id: chunk.id,
        values: chunk.embedding,
        metadata: {
          chunk_id: chunk.id,
          document_id: chunk.document_id,
          content: chunk.content,
          domain: chunk.knowledge_documents?.domain, // Legacy field
          domain_id: chunk.domain_id || chunk.knowledge_documents?.domain_id || chunk.knowledge_documents?.domain, // New field
          source_title: chunk.knowledge_documents?.title,
          timestamp: new Date().toISOString(),
          // Add new architecture fields if available
          ...(chunk.access_policy && { access_policy: chunk.access_policy }),
          ...(chunk.rag_priority_weight !== undefined && { rag_priority_weight: chunk.rag_priority_weight }),
          ...chunk.metadata,
        },
      },
    ]);

    console.log(`✅ Synced chunk ${chunkId} to Pinecone`);
  }

  /**
   * Bulk sync all chunks from Supabase to Pinecone
   */
  async bulkSyncFromSupabase(
    options: {
      batchSize?: number;
      namespace?: string;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 100;

    // Get total count
    const { count } = await this.supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    console.log(`📊 Starting bulk sync of ${count} chunks to Pinecone...`);

    let offset = 0;
    let completed = 0;

    while (offset < (count || 0)) {
      // Fetch batch from Supabase
      const { data: chunks, error } = await this.supabase
        .from('document_chunks')
        .select(`
          id,
          content,
          embedding,
          metadata,
          document_id,
          domain_id,
          access_policy,
          rag_priority_weight,
          knowledge_documents(
            id,
            title,
            domain,
            domain_id
          )
        `)
        .not('embedding', 'is', null)
        .range(offset, offset + batchSize - 1);

      if (error || !chunks || chunks.length === 0) break;

      // Convert to Pinecone format
      const vectors = chunks.map(chunk => ({
        id: chunk.id,
        values: chunk.embedding,
        metadata: {
          chunk_id: chunk.id,
          document_id: chunk.document_id,
          content: chunk.content.substring(0, 40000), // Pinecone metadata limit
          domain: chunk.knowledge_documents?.domain, // Legacy field
          domain_id: chunk.domain_id || chunk.knowledge_documents?.domain_id || chunk.knowledge_documents?.domain, // New field
          source_title: chunk.knowledge_documents?.title,
          timestamp: new Date().toISOString(),
          // Add new architecture fields if available
          ...(chunk.access_policy && { access_policy: chunk.access_policy }),
          ...(chunk.rag_priority_weight !== undefined && { rag_priority_weight: chunk.rag_priority_weight }),
        },
      }));

      // Upsert to Pinecone (defaults to domains-knowledge namespace)
      await this.upsertVectors(vectors, options.namespace || this.knowledgeNamespace);

      completed += chunks.length;
      offset += batchSize;

      if (options.onProgress) {
        options.onProgress(completed, count || 0);
      }

      console.log(`  Progress: ${completed}/${count} chunks synced`);
    }

    console.log(`✅ Bulk sync complete: ${completed} chunks synced to Pinecone`);
  }

  // ============================================================================
  // AGENT EMBEDDING METHODS (GraphRAG)
  // ============================================================================

  /**
   * Sync agent embedding to Pinecone
   * Stores agent in 'agents' namespace for GraphRAG search
   */
  async syncAgentToPinecone(agentEmbedding: {
    agentId: string;
    embedding: number[];
    metadata: Record<string, any>;
  }): Promise<void> {
    const index = this.pinecone.Index(this.indexName);
    const namespace = 'agents'; // Separate namespace for agents

    try {
      await index.namespace(namespace).upsert([
        {
          id: agentEmbedding.agentId,
          values: agentEmbedding.embedding,
          metadata: {
            ...agentEmbedding.metadata,
            entity_type: 'agent',
            timestamp: new Date().toISOString(),
          },
        },
      ]);

      console.log(`✅ Synced agent ${agentEmbedding.agentId} to Pinecone (agents namespace)`);
    } catch (error) {
      console.error(`❌ Failed to sync agent to Pinecone:`, error);
      throw error;
    }
  }

  /**
   * Search agents in Pinecone using vector similarity
   */
  async searchAgents(
    query: {
      text?: string;
      embedding?: number[];
      topK?: number;
      minScore?: number;
      filter?: Record<string, any>;
    }
  ): Promise<Array<{
    agentId: string;
    similarity: number;
    metadata: Record<string, any>;
  }>> {
    const index = this.pinecone.Index(this.indexName);
    const namespace = 'agents';

    try {
      // Generate embedding if text provided
      let queryVector: number[];
      if (query.embedding) {
        queryVector = query.embedding;
      } else if (query.text) {
        const { embeddingService } = await import('@/lib/services/embeddings/openai-embedding-service');
        const result = await embeddingService.generateEmbedding(query.text, {
          useCache: true,
        });
        queryVector = result.embedding;
      } else {
        throw new Error('Either text or embedding must be provided');
      }

      // Perform vector search
      const searchResponse = await index.namespace(namespace).query({
        vector: queryVector,
        topK: query.topK || 10,
        includeMetadata: true,
        filter: query.filter ? {
          $or: Object.entries(query.filter).map(([key, value]) => ({
            [key]: { $eq: value },
          })),
        } : undefined,
      });

      // Filter by minimum score
      const minScore = query.minScore || 0.7;
      const filtered = searchResponse.matches?.filter(match => match.score! >= minScore) || [];

      // Convert to result format
      const results = filtered.map(match => ({
        agentId: match.id,
        similarity: match.score!,
        metadata: match.metadata as Record<string, any>,
      }));

      console.log(`🔍 Found ${results.length} agents in Pinecone (similarity >= ${minScore})`);
      return results;
    } catch (error) {
      console.error('❌ Pinecone agent search failed:', error);
      throw error;
    }
  }

  /**
   * Hybrid agent search: Pinecone (vectors) + Supabase (metadata filtering)
   */
  async hybridAgentSearch(query: {
    text?: string;
    embedding?: number[];
    topK?: number;
    minScore?: number;
    filters?: {
      tier?: number;
      status?: string;
      business_function?: string;
      knowledge_domain?: string;
    };
  }): Promise<Array<{
    agentId: string;
    similarity: number;
    agent: any; // Full agent data from Supabase
    metadata: Record<string, any>;
  }>> {
    // Step 1: Get candidates from Pinecone
    const pineconeResults = await this.searchAgents({
      ...query,
      topK: (query.topK || 10) * 2, // Get more candidates for filtering
      minScore: Math.max((query.minScore || 0.7) - 0.1, 0.5), // Lower threshold
    });

    if (pineconeResults.length === 0) {
      return [];
    }

    // Step 2: Fetch full agent data from Supabase and apply filters
    const agentIds = pineconeResults.map(r => r.agentId);

    let supabaseQuery = this.supabase
      .from('agents')
      .select('*')
      .in('id', agentIds);

    // Apply filters
    if (query.filters?.tier) {
      supabaseQuery = supabaseQuery.eq('tier', query.filters.tier);
    }

    if (query.filters?.status) {
      supabaseQuery = supabaseQuery.eq('status', query.filters.status);
    }

    if (query.filters?.business_function) {
      supabaseQuery = supabaseQuery.eq('business_function', query.filters.business_function);
    }

    if (query.filters?.knowledge_domain) {
      supabaseQuery = supabaseQuery.contains('knowledge_domains', [query.filters.knowledge_domain]);
    }

    const { data: agents, error } = await supabaseQuery;

    if (error) {
      console.error('❌ Supabase agent query failed:', error);
      // Return Pinecone results without enrichment
      return pineconeResults.map(result => ({
        agentId: result.agentId,
        similarity: result.similarity,
        agent: null,
        metadata: result.metadata,
      }));
    }

    // Step 3: Merge Pinecone scores with Supabase data
    const enrichedResults = pineconeResults
      .map(pineconeResult => {
        const agent = agents?.find((a: any) => a.id === pineconeResult.agentId);
        if (!agent) return null;

        return {
          agentId: pineconeResult.agentId,
          similarity: pineconeResult.similarity,
          agent,
          metadata: {
            ...pineconeResult.metadata,
            ...agent.metadata,
          },
        };
      })
      .filter((result): result is NonNullable<typeof result> => result !== null);

    // Step 4: Re-sort by similarity and return top K
    return enrichedResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, query.topK || 10);
  }

  /**
   * Bulk sync all agents to Pinecone
   */
  async bulkSyncAgentsToPinecone(
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<void> {
    const { agentEmbeddingService } = await import('../agents/agent-embedding-service');

    // Get all active agents from Supabase
    const { data: agents, error, count } = await this.supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .in('status', ['active', 'testing']);

    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }

    if (!agents || agents.length === 0) {
      console.log('⚠️ No agents found to sync');
      return;
    }

    console.log(`📊 Starting bulk sync of ${agents.length} agents to Pinecone...`);

    // Generate embeddings for all agents
    const embeddings = await agentEmbeddingService.generateAgentEmbeddingsBatch(
      agents,
      options.onProgress
    );

    // Sync to Pinecone in batches
    const batchSize = options.batchSize || 10;
    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize);

      await Promise.all(
        batch.map(embedding =>
          this.syncAgentToPinecone({
            agentId: embedding.agentId,
            embedding: embedding.embedding,
            metadata: embedding.metadata,
          })
        )
      );

      console.log(`  Progress: ${Math.min(i + batchSize, embeddings.length)}/${embeddings.length} agents synced`);
    }

    console.log(`✅ Bulk sync complete: ${embeddings.length} agents synced to Pinecone`);
  }

  /**
   * Delete agent from Pinecone
   */
  async deleteAgentFromPinecone(agentId: string): Promise<void> {
    const index = this.pinecone.Index(this.indexName);
    const namespace = 'agents';

    try {
      await index.namespace(namespace).deleteMany([agentId]);
      console.log(`✅ Deleted agent ${agentId} from Pinecone`);
    } catch (error) {
      console.error(`❌ Failed to delete agent from Pinecone:`, error);
      throw error;
    }
  }
}

// Singleton instance
let pineconeVectorServiceInstance: PineconeVectorService | null = null;

export function getPineconeVectorService(): PineconeVectorService {
  if (!pineconeVectorServiceInstance) {
    pineconeVectorServiceInstance = new PineconeVectorService();
  }
  return pineconeVectorServiceInstance;
}

export const pineconeVectorService = getPineconeVectorService();
