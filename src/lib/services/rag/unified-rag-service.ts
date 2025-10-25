/**
 * Unified RAG Service
 * Consolidates all RAG functionality into a single, production-ready service
 * Replaces: supabase-rag-service, enhanced-rag-service, cloud-rag-service
 */

import { Document } from '@langchain/core/documents';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { embeddingService } from '../embeddings/openai-embedding-service';
import { pineconeVectorService, PineconeVectorService } from '../vectorstore/pinecone-vector-service';
import { redisCacheService } from '../../../features/rag/caching/redis-cache-service';

export interface RAGQuery {
  text: string;
  agentId?: string;
  userId?: string;
  sessionId?: string;
  domain?: string;
  phase?: string;
  maxResults?: number;
  similarityThreshold?: number;
  strategy?: 'semantic' | 'hybrid' | 'keyword' | 'agent-optimized' | 'entity-aware';
  includeMetadata?: boolean;
}

export interface RAGResult {
  answer?: string;
  sources: Document[];
  context: string;
  metadata: {
    strategy: string;
    responseTime: number;
    cached: boolean;
    similarity?: number;
    totalSources: number;
    queryCost?: number;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: {
    title?: string;
    source?: string;
    domain?: string;
    phase?: string;
    document_type?: string;
    page_number?: number;
    section?: string;
  };
}

export interface RAGServiceConfig {
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  openaiApiKey?: string;
  enableCaching?: boolean;
  enableEvaluation?: boolean;
  defaultStrategy?: string;
  maxCacheSize?: number;
}

export class UnifiedRAGService {
  private supabase: SupabaseClient;
  private pinecone: PineconeVectorService;
  private cache: Map<string, { result: RAGResult; timestamp: number }>;
  private config: Required<RAGServiceConfig>;

  constructor(config: RAGServiceConfig = {}) {
    // Initialize configuration
    this.config = {
      supabaseUrl: config.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseServiceKey: config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY!,
      enableCaching: config.enableCaching ?? true,
      enableEvaluation: config.enableEvaluation ?? false,
      defaultStrategy: config.defaultStrategy || 'hybrid',
      maxCacheSize: config.maxCacheSize || 1000,
    };

    // Initialize Supabase client (for metadata only)
    this.supabase = createClient(
      this.config.supabaseUrl,
      this.config.supabaseServiceKey
    );

    // Initialize Pinecone (for vectors)
    this.pinecone = pineconeVectorService;

    // Initialize cache
    this.cache = new Map();

    console.log('✅ Unified RAG Service initialized (Pinecone + Supabase)');
  }

  /**
   * Main query method - routes to appropriate strategy
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    const startTime = Date.now();
    const strategy = query.strategy || this.config.defaultStrategy;

    try {
      // Check Redis cache first (exact match)
      if (this.config.enableCaching) {
        const exactCached = await redisCacheService.getCachedRAGResult(query.text, strategy);
        if (exactCached) {
          console.log('📦 Returning Redis cached result (exact match)');
          return {
            ...exactCached,
            metadata: {
              ...exactCached.metadata,
              cached: true,
              responseTime: Date.now() - startTime,
            },
          };
        }

        // Check semantic cache (similar queries with 85% similarity)
        const semanticCached = await redisCacheService.findSimilarQuery(query.text, strategy);
        if (semanticCached) {
          console.log(`🔍 Returning Redis semantic cache hit (${(semanticCached.similarity * 100).toFixed(1)}% similar)`);
          return {
            ...semanticCached.result,
            metadata: {
              ...semanticCached.result.metadata,
              cached: true,
              similarity: semanticCached.similarity,
              responseTime: Date.now() - startTime,
            },
          };
        }

        // Fallback to in-memory cache
        const memCached = this.getFromCache(query.text);
        if (memCached) {
          console.log('📦 Returning in-memory cached result');
          return {
            ...memCached,
            metadata: {
              ...memCached.metadata,
              cached: true,
              responseTime: Date.now() - startTime,
            },
          };
        }
      }

      // Route to appropriate strategy
      let result: RAGResult;

      switch (strategy) {
        case 'agent-optimized':
          result = await this.agentOptimizedSearch(query);
          break;
        case 'hybrid':
          result = await this.hybridSearch(query);
          break;
        case 'semantic':
          result = await this.semanticSearch(query);
          break;
        case 'keyword':
          result = await this.keywordSearch(query);
          break;
        case 'entity-aware':
          result = await this.entityAwareSearch(query);
          break;
        default:
          result = await this.hybridSearch(query);
      }

      // Add timing metadata
      result.metadata.responseTime = Date.now() - startTime;
      result.metadata.cached = false;

      // Cache the result in Redis with semantic similarity
      if (this.config.enableCaching) {
        await redisCacheService.cacheWithSemanticSimilarity(query.text, result, strategy);
        this.addToCache(query.text, result); // Also cache in-memory
      }

      console.log(`✅ Query completed in ${result.metadata.responseTime}ms using ${strategy} strategy`);

      return result;

    } catch (error) {
      console.error('❌ Query failed:', error);
      return this.handleQueryError(error, Date.now() - startTime);
    }
  }

  /**
   * Semantic search using vector similarity (Pinecone)
   */
  private async semanticSearch(query: RAGQuery): Promise<RAGResult> {
    // Generate query embedding
    const embedding = await embeddingService.generateQueryEmbedding(query.text);

    // Perform vector search using Pinecone
    const results = await this.pinecone.search({
      embedding: embedding,
      topK: query.maxResults || 10,
      minScore: query.similarityThreshold || 0.7,
      filter: query.domain ? { domain: query.domain } : undefined,
    });

    // Convert to Document format
    const sources = results.map(result => new Document({
      pageContent: result.content,
      metadata: {
        id: result.chunk_id,
        document_id: result.document_id,
        title: result.source_title,
        domain: result.domain,
        similarity: result.similarity,
        ...result.metadata,
      },
    }));

    // Generate context
    const context = this.generateContext(sources);

    return {
      sources,
      context,
      metadata: {
        strategy: 'semantic',
        responseTime: 0, // Will be set by caller
        cached: false,
        totalSources: sources.length,
      },
    };
  }

  /**
   * Agent-optimized search with relevance boosting (Pinecone)
   */
  private async agentOptimizedSearch(query: RAGQuery): Promise<RAGResult> {
    if (!query.agentId) {
      throw new Error('Agent ID required for agent-optimized search');
    }

    // Perform agent-optimized search using Pinecone
    const results = await this.pinecone.searchForAgent(
      query.agentId,
      query.text,
      query.maxResults || 10
    );

    // Convert to Document format
    const sources = results.map(result => new Document({
      pageContent: result.content,
      metadata: {
        id: result.chunk_id,
        document_id: result.document_id,
        title: result.source_title,
        domain: result.domain,
        similarity: result.similarity,
        ...result.metadata,
      },
    }));

    const context = this.generateContext(sources);

    return {
      sources,
      context,
      metadata: {
        strategy: 'agent-optimized',
        responseTime: 0,
        cached: false,
        totalSources: sources.length,
      },
    };
  }

  /**
   * Hybrid search combining vector and full-text search (Pinecone + Supabase)
   */
  private async hybridSearch(query: RAGQuery): Promise<RAGResult> {
    try {
      // Perform hybrid search using Pinecone (which enriches with Supabase metadata)
      const results = await this.pinecone.hybridSearch({
        text: query.text,
        topK: query.maxResults || 10,
        minScore: query.similarityThreshold || 0.7,
        filter: query.domain ? { domain: query.domain } : undefined,
      });

      // Convert to Document format
      const sources = results.map(result => new Document({
        pageContent: result.content,
        metadata: {
          id: result.chunk_id,
          document_id: result.document_id,
          title: result.source_title,
          domain: result.domain,
          similarity: result.similarity,
          ...result.metadata,
        },
      }));

      const context = this.generateContext(sources);

      return {
        sources,
        context,
        metadata: {
          strategy: 'hybrid',
          responseTime: 0,
          cached: false,
          totalSources: sources.length,
        },
      };
    } catch (error) {
      console.warn('Hybrid search failed, falling back to semantic search:', error);
      return this.semanticSearch(query);
    }
  }

  /**
   * Keyword-based full-text search
   */
  private async keywordSearch(query: RAGQuery): Promise<RAGResult> {
    const { data, error } = await this.supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        metadata,
        document_id,
        knowledge_documents!inner(
          title,
          domain,
          tags
        )
      `)
      .textSearch('content', query.text, {
        type: 'websearch',
        config: 'english',
      })
      .limit(query.maxResults || 10);

    if (error) {
      throw new Error(`Keyword search failed: ${error.message}`);
    }

    const sources = this.convertToDocuments(data || []);
    const context = this.generateContext(sources);

    return {
      sources,
      context,
      metadata: {
        strategy: 'keyword',
        responseTime: 0,
        cached: false,
        totalSources: sources.length,
      },
    };
  }

  /**
   * Entity-aware search using LangExtract (triple-strategy: vector + keyword + entity)
   */
  private async entityAwareSearch(query: RAGQuery): Promise<RAGResult> {
    // Check if LangExtract is enabled
    if (process.env.ENABLE_LANGEXTRACT !== 'true') {
      console.warn('⚠️  LangExtract not enabled, falling back to hybrid search');
      return this.hybridSearch(query);
    }

    try {
      const { EntityAwareHybridSearch } = await import('../search/entity-aware-hybrid-search');
      const entitySearch = new EntityAwareHybridSearch();

      // Perform entity-aware search
      const results = await entitySearch.search({
        text: query.text,
        agentId: query.agentId,
        userId: query.userId,
        domain: query.domain,
        phase: query.phase,
        maxResults: query.maxResults || 10,
        similarityThreshold: query.similarityThreshold || 0.7,
        strategy: 'hybrid', // Use triple search strategy
      });

      // Convert to Document format
      const sources = results.map(result => new Document({
        pageContent: result.content,
        metadata: {
          id: result.chunk_id,
          document_id: result.document_id,
          title: result.source_title,
          domain: result.domain,
          scores: result.scores,
          matched_entities: result.matched_entities,
          ...result.metadata,
        },
      }));

      const context = this.generateContext(sources);

      return {
        sources,
        context,
        metadata: {
          strategy: 'entity-aware',
          responseTime: 0, // Will be set by caller
          cached: false,
          totalSources: sources.length,
        },
      };

    } catch (error) {
      console.error('❌ Entity-aware search failed:', error);
      console.warn('⚠️  Falling back to hybrid search');
      return this.hybridSearch(query);
    }
  }

  /**
   * Enhanced search with query expansion
   */
  async enhancedSearch(query: RAGQuery): Promise<RAGResult> {
    // TODO: Implement query expansion using LLM
    // For now, delegate to hybrid search
    return this.hybridSearch(query);
  }

  /**
   * Batch query multiple questions
   */
  async batchQuery(queries: RAGQuery[]): Promise<RAGResult[]> {
    console.log(`🔄 Processing ${queries.length} queries in batch...`);

    const results = await Promise.all(
      queries.map(query => this.query(query).catch(error => ({
        sources: [],
        context: '',
        metadata: {
          strategy: 'error',
          responseTime: 0,
          cached: false,
          totalSources: 0,
          error: error.message,
        },
      })))
    );

    return results;
  }

  /**
   * Add document to knowledge base
   */
  async addDocument(doc: {
    title: string;
    content: string;
    domain: string;
    tags?: string[];
    metadata?: any;
  }): Promise<string> {
    // Insert document
    const { data: document, error: docError } = await this.supabase
      .from('knowledge_documents')
      .insert({
        title: doc.title,
        content: doc.content,
        domain: doc.domain,
        tags: doc.tags || [],
        status: 'processing',
        metadata: doc.metadata || {},
      })
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to add document: ${docError.message}`);
    }

    // Chunk and process in background
    this.processDocumentAsync(document.id, doc.content);

    return document.id;
  }

  /**
   * Process document asynchronously (chunking + embedding + Pinecone sync)
   */
  private async processDocumentAsync(documentId: string, content: string): Promise<void> {
    try {
      // Chunk the content
      const chunks = this.chunkText(content, 1500, 300);

      // Generate embeddings for all chunks
      const texts = chunks.map(chunk => chunk.content);
      const batchResult = await embeddingService.generateBatchEmbeddings(texts);

      // Insert chunks with embeddings into Supabase
      const chunkInserts = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: index,
        content: chunk.content,
        embedding: batchResult.embeddings[index],
        metadata: chunk.metadata,
      }));

      const { data: insertedChunks, error } = await this.supabase
        .from('document_chunks')
        .insert(chunkInserts)
        .select('id');

      if (error) {
        throw new Error(`Failed to insert chunks: ${error.message}`);
      }

      // Get document metadata for Pinecone
      const { data: document } = await this.supabase
        .from('knowledge_documents')
        .select('title, domain')
        .eq('id', documentId)
        .single();

      // Sync all chunks to Pinecone
      if (insertedChunks && insertedChunks.length > 0) {
        const pineconeVectors = insertedChunks.map((chunk, index) => ({
          id: chunk.id,
          values: batchResult.embeddings[index],
          metadata: {
            chunk_id: chunk.id,
            document_id: documentId,
            content: chunks[index].content.substring(0, 40000), // Pinecone metadata limit
            domain: document?.domain,
            source_title: document?.title,
            timestamp: new Date().toISOString(),
          },
        }));

        await this.pinecone.upsertVectors(pineconeVectors);
        console.log(`  ✅ Synced ${pineconeVectors.length} chunks to Pinecone`);
      }

      // Extract entities with LangExtract if enabled
      if (process.env.ENABLE_LANGEXTRACT === 'true' && insertedChunks && insertedChunks.length > 0) {
        try {
          console.log('  🧬 Extracting entities with LangExtract...');

          const { getLangExtractPipeline } = await import('../extraction/langextract-pipeline');
          const { Document } = await import('@langchain/core/documents');

          const langExtract = getLangExtractPipeline();

          // Convert chunks to LangChain Document format for extraction
          const chunkDocuments = chunks.map((chunk, index) => new Document({
            pageContent: chunk.content,
            metadata: {
              chunk_index: index,
              chunk_id: insertedChunks[index]?.id,
              document_id: documentId,
            },
          }));

          // Extract entities using appropriate schema based on domain
          const extractionType = document?.domain === 'regulatory_affairs'
            ? 'regulatory_medical'
            : 'medical_general';

          const extraction = await langExtract.extract(chunkDocuments, extractionType);

          console.log(`  📊 Extracted ${extraction.entities.length} entities`);

          // Store extracted entities in database
          if (extraction.entities.length > 0) {
            const entityInserts = extraction.entities.map(entity => {
              // Find the corresponding chunk ID
              const chunkIndex = parseInt(entity.source.document_id) || 0;
              const chunkId = insertedChunks[chunkIndex]?.id;

              return {
                chunk_id: chunkId,
                document_id: documentId,
                entity_type: entity.type,
                entity_text: entity.text,
                attributes: entity.attributes,
                confidence: entity.confidence,
                char_start: entity.source.char_start,
                char_end: entity.source.char_end,
                context_before: entity.source.context_before,
                context_after: entity.source.context_after,
                original_text: entity.source.original_text,
                verification_status: entity.verification_status,
                extraction_model: extraction.audit_trail.model_used,
                extraction_version: extraction.audit_trail.prompt_version,
                extraction_run_id: extraction.audit_trail.extraction_id,
              };
            });

            const { error: entityError } = await this.supabase
              .from('extracted_entities')
              .insert(entityInserts);

            if (entityError) {
              console.error('  ⚠️  Failed to insert entities:', entityError.message);
            } else {
              console.log(`  ✅ Stored ${entityInserts.length} entities`);
            }
          }

          // Store entity relationships if any
          if (extraction.relationships && extraction.relationships.length > 0) {
            // Note: We'll need to fetch the entity IDs after insertion to create relationships
            // For now, we'll skip relationship storage or handle it in a follow-up
            console.log(`  📎 Found ${extraction.relationships.length} entity relationships`);
          }

        } catch (extractionError) {
          console.error('  ⚠️  Entity extraction failed:', extractionError);
          // Don't fail the entire document processing if extraction fails
        }
      }

      // Update document status
      await this.supabase
        .from('knowledge_documents')
        .update({
          status: 'completed',
          chunk_count: chunks.length,
          processed_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      console.log(`✅ Document ${documentId} processed successfully (Supabase + Pinecone)`);

    } catch (error) {
      console.error(`❌ Failed to process document ${documentId}:`, error);

      // Update document status to error
      await this.supabase
        .from('knowledge_documents')
        .update({ status: 'failed' })
        .eq('id', documentId);
    }
  }

  /**
   * Get health metrics
   */
  async getHealthMetrics(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    totalDocuments: number;
    totalChunks: number;
    cacheSize: number;
    vectorStoreStatus: string;
    pineconeStats?: any;
    redisStats?: any;
  }> {
    const [docsCount, chunksCount, pineconeStats, redisStats] = await Promise.all([
      this.supabase.from('knowledge_documents').select('*', { count: 'exact', head: true }),
      this.supabase.from('document_chunks').select('*', { count: 'exact', head: true }),
      this.pinecone.getIndexStats().catch(() => null),
      redisCacheService.getCacheStats().catch(() => null),
    ]);

    const isPineconeHealthy = pineconeStats !== null;
    const isSupabaseHealthy = docsCount.count !== null && chunksCount.count !== null;
    const isRedisHealthy = redisStats !== null && redisStats.totalKeys >= 0;

    return {
      status: isPineconeHealthy && isSupabaseHealthy ? 'healthy' : 'degraded',
      totalDocuments: docsCount.count || 0,
      totalChunks: chunksCount.count || 0,
      cacheSize: this.cache.size,
      vectorStoreStatus: isPineconeHealthy ? 'connected (Pinecone)' : 'disconnected',
      pineconeStats,
      redisStats: isRedisHealthy ? redisStats : { status: 'disconnected' },
    };
  }

  /**
   * Clear cache (both Redis and in-memory)
   */
  async clearCache(pattern?: string): Promise<void> {
    this.cache.clear();
    await redisCacheService.clearCache(pattern);
    console.log('🗑️ RAG cache cleared (Redis + in-memory)');
  }

  // Private helper methods

  private chunkText(
    text: string,
    chunkSize: number,
    overlap: number
  ): Array<{ content: string; metadata: any }> {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);

      chunks.push({
        content: chunk,
        metadata: {
          chunk_size: chunk.length,
          start_pos: start,
          end_pos: end,
        },
      });

      start += chunkSize - overlap;
    }

    return chunks;
  }

  private convertToDocuments(results: any[]): Document[] {
    return results.map(result => new Document({
      pageContent: result.content,
      metadata: {
        id: result.id || result.chunk_id,
        document_id: result.document_id,
        title: result.knowledge_documents?.title || result.source_title || result.title,
        domain: result.knowledge_documents?.domain || result.domain,
        tags: result.knowledge_documents?.tags,
        similarity: result.similarity,
        ...result.metadata,
      },
    }));
  }

  private generateContext(sources: Document[]): string {
    if (sources.length === 0) {
      return 'No relevant context found.';
    }

    return sources
      .map((source, index) => {
        const title = source.metadata.title || 'Unknown source';
        return `[${index + 1}] ${title}:\n${source.pageContent}\n`;
      })
      .join('\n');
  }

  private getFromCache(queryText: string): RAGResult | null {
    const cacheKey = this.getCacheKey(queryText);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check if cache entry is still valid (1 hour)
    const ageMs = Date.now() - cached.timestamp;
    if (ageMs > 3600000) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  private addToCache(queryText: string, result: RAGResult): void {
    const cacheKey = this.getCacheKey(queryText);

    // Implement LRU cache eviction
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
  }

  private getCacheKey(queryText: string): string {
    return queryText.toLowerCase().trim().slice(0, 100);
  }

  private handleQueryError(error: any, responseTime: number): RAGResult {
    return {
      sources: [],
      context: '',
      metadata: {
        strategy: 'error',
        responseTime,
        cached: false,
        totalSources: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Export singleton instance
export const unifiedRAGService = new UnifiedRAGService();
