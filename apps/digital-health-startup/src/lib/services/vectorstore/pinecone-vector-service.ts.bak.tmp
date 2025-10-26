/**
 * Pinecone Vector Store Service
 * Handles all vector operations using Pinecone
 * Metadata is stored in Supabase, vectors in Pinecone
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { embeddingService } from '../embeddings/openai-embedding-service';

export interface PineconeVectorRecord {
  id: string;
  values: number[];
  metadata: {
    chunk_id: string;
    document_id: string;
    content: string;
    domain?: string;
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
  domain?: string;
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

        await index.namespace(namespace || '').upsert(batch);

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
      // Generate embedding if text provided
      let queryVector: number[];
      if (query.embedding) {
        queryVector = query.embedding;
      } else if (query.text) {
        const result = await embeddingService.generateEmbedding(query.text, {
          useCache: true,
        });
        queryVector = result.embedding;
      } else {
        throw new Error('Either text or embedding must be provided');
      }

      // Perform vector search in Pinecone
      const searchResponse = await index.namespace(query.namespace || '').query({
        vector: queryVector,
        topK: query.topK || 10,
        includeMetadata: true,
        filter: query.filter,
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
        domain: match.metadata?.domain as string,
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
    const chunkIds = pineconeResults.map(r => r.chunk_id);

    if (chunkIds.length === 0) return [];

    const { data: chunks, error } = await this.supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        metadata,
        document_id,
        knowledge_documents!inner(
          id,
          title,
          domain,
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
      const supabaseData = chunks?.find(c => c.id === pineconeResult.chunk_id);

      if (!supabaseData) return pineconeResult;

      return {
        ...pineconeResult,
        content: supabaseData.content || pineconeResult.content,
        metadata: {
          ...pineconeResult.metadata,
          ...supabaseData.metadata,
        },
        source_title: supabaseData.knowledge_documents?.title,
        domain: supabaseData.knowledge_documents?.domain,
      };
    });

    // Step 4: Apply additional filters from Supabase
    let filtered = enrichedResults;

    if (query.filter?.domain) {
      filtered = filtered.filter(r => r.domain === query.filter!.domain);
    }

    if (query.filter?.tags) {
      filtered = filtered.filter(r => {
        const chunkData = chunks?.find(c => c.id === r.chunk_id);
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

    const agentDomain = agent.metadata?.primary_domain || 'general';

    // Perform search with domain filter
    const results = await this.hybridSearch({
      text: queryText,
      topK: topK * 2, // Get more candidates
      filter: {
        // Prefer agent's domain but don't require it
      },
    });

    // Apply domain boosting
    const boosted = results.map(result => {
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
      await index.namespace(namespace || '').deleteMany(ids);
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
          domain: chunk.knowledge_documents?.domain,
          source_title: chunk.knowledge_documents?.title,
          timestamp: new Date().toISOString(),
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
          knowledge_documents(
            id,
            title,
            domain
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
          domain: chunk.knowledge_documents?.domain,
          source_title: chunk.knowledge_documents?.title,
          timestamp: new Date().toISOString(),
        },
      }));

      // Upsert to Pinecone
      await this.upsertVectors(vectors, options.namespace);

      completed += chunks.length;
      offset += batchSize;

      if (options.onProgress) {
        options.onProgress(completed, count || 0);
      }

      console.log(`  Progress: ${completed}/${count} chunks synced`);
    }

    console.log(`✅ Bulk sync complete: ${completed} chunks synced to Pinecone`);
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
