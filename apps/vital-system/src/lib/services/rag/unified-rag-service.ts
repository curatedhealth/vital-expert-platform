/**
 * Unified RAG Service
 * Consolidates all RAG functionality into a single, production-ready service
 * Replaces: supabase-rag-service, enhanced-rag-service, cloud-rag-service
 */

import { Document } from '@langchain/core/documents';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use factory to support both OpenAI and HuggingFace embeddings
import { getEmbeddingService, EmbeddingServiceFactory } from '../embeddings/embedding-service-factory';
import { getEmbeddingModelForDomain } from '../embeddings/domain-embedding-selector';
import { pineconeVectorService, PineconeVectorService } from '../vectorstore/pinecone-vector-service';
// REMOVED: redisCacheService (uses ioredis which is server-only)
// Replaced with in-memory Map for browser compatibility
import { ragLatencyTracker } from '../monitoring/rag-latency-tracker';
import { ragCostTracker } from '../monitoring/rag-cost-tracker';
import { RAG_CIRCUIT_BREAKERS } from '../monitoring/circuit-breaker';
import { v4 as uuidv4 } from 'uuid';

export interface RAGQuery {
  text: string;
  agentId?: string;
  userId?: string;
  sessionId?: string;
  domain?: string;
  domains?: string[];
  phase?: string;
  maxResults?: number;
  similarityThreshold?: number;
  strategy?: 'semantic' | 'hybrid' | 'keyword' | 'agent-optimized' | 'entity-aware';
  includeMetadata?: boolean;
  filter?: {
    domain?: string;
    domains?: string[];
    tags?: string[];
  };
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
    domain?: string;
    domains?: string[];
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
    // Initialize configuration with fallbacks
    const supabaseUrl = config.supabaseUrl || 
                       process.env.NEXT_PUBLIC_SUPABASE_URL || 
                       process.env.SUPABASE_URL || 
                       process.env.NEW_SUPABASE_URL || 
                       '';
    
    const supabaseServiceKey = config.supabaseServiceKey || 
                              process.env.SUPABASE_SERVICE_ROLE_KEY || 
                              process.env.NEW_SUPABASE_SERVICE_KEY ||
                              process.env.SUPABASE_SERVICE_KEY || 
                              '';
    
    this.config = {
      supabaseUrl,
      supabaseServiceKey,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY || '',
      enableCaching: config.enableCaching ?? true,
      enableEvaluation: config.enableEvaluation ?? false,
      defaultStrategy: config.defaultStrategy || 'hybrid',
      maxCacheSize: config.maxCacheSize || 1000,
    };

    // Initialize Supabase client only if credentials are available
    if (this.config.supabaseUrl && this.config.supabaseServiceKey && 
        this.config.supabaseUrl !== '' && this.config.supabaseServiceKey !== '') {
      try {
        this.supabase = createClient(
          this.config.supabaseUrl,
          this.config.supabaseServiceKey
        );
      } catch (error) {
        console.warn('[UnifiedRAGService] Failed to initialize Supabase client:', error);
        // Set to null and handle gracefully in methods
        this.supabase = null as any;
      }
    } else {
      // Don't create a client if credentials are missing
      console.warn('[UnifiedRAGService] Supabase credentials missing, RAG features will be limited');
      this.supabase = null as any;
    }

    // Initialize Pinecone (for vectors)
    this.pinecone = pineconeVectorService;

    // Initialize cache
    this.cache = new Map();

    console.log('✅ Unified RAG Service initialized (Pinecone + Supabase)');
  }

  private extractDomains(query: RAGQuery): string[] {
    const domains = new Set<string>();

    const addDomain = (value?: string | null) => {
      if (typeof value !== 'string') {
        return;
      }
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        domains.add(trimmed);
      }
    };

    const addDomainArray = (values?: string[] | null) => {
      if (!Array.isArray(values)) {
        return;
      }
      values.forEach(addDomain);
    };

    addDomain(query.domain);
    addDomainArray(query.domains);
    addDomain(query.filter?.domain);
    addDomainArray(query.filter?.domains);

    return Array.from(domains);
  }

  private getPrimaryDomain(query: RAGQuery): string | undefined {
    const domains = this.extractDomains(query);
    return domains.length > 0 ? domains[0] : undefined;
  }

  private buildPineconeFilter(query: RAGQuery): Record<string, unknown> | undefined {
    const domains = this.extractDomains(query);

    if (domains.length === 0) {
      return undefined;
    }

    // Support both legacy 'domain' and new 'domain_id' fields
    // Prefer domain_id if available, fallback to domain for backward compatibility
    if (domains.length === 1) {
      return {
        $or: [
          { domain_id: { $eq: domains[0] } },
          { domain: { $eq: domains[0] } }
        ]
      };
    }

    return {
      $or: [
        { domain_id: { $in: domains } },
        { domain: { $in: domains } }
      ]
    };
  }

  /**
   * Main query method - routes to appropriate strategy
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    const startTime = Date.now();
    const strategy = query.strategy || this.config.defaultStrategy;
    const queryId = uuidv4();

    // Timing trackers for latency breakdown
    let cacheCheckStartTime = startTime;
    let cacheCheckMs = 0;
    let embeddingStartTime = 0;
    let embeddingMs = 0;
    let vectorSearchStartTime = 0;
    let vectorSearchMs = 0;
    let rerankingStartTime = 0;
    let rerankingMs = 0;
    let cacheHit = false;

    try {
      // Check in-memory cache (Redis removed for browser compatibility)
      if (this.config.enableCaching) {
        cacheCheckMs = Date.now() - cacheCheckStartTime;
        
        // Check in-memory cache
        const memCached = this.getFromCache(query.text);
        if (memCached) {
          cacheHit = true;
          console.log('📦 Returning in-memory cached result');

          // Track latency metrics
          const totalRetrievalMs = Date.now() - startTime;
          ragLatencyTracker.trackOperation({
            queryId,
            timestamp: new Date().toISOString(),
            strategy,
            cacheHit: true,
            cacheCheckMs,
            queryEmbeddingMs: 0,
            vectorSearchMs: 0,
            rerankingMs: 0,
            totalRetrievalMs,
          });

          return {
            ...memCached,
            metadata: {
              ...memCached.metadata,
              cached: true,
              responseTime: totalRetrievalMs,
            },
          };
        }
      }

      // Route to appropriate strategy (with timing tracking)
      let result: RAGResult;

      // Track embedding timing
      embeddingStartTime = Date.now();

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

      // Calculate timing (rough estimates - actual embedding/search split varies by strategy)
      const totalStrategyMs = Date.now() - embeddingStartTime;
      embeddingMs = Math.min(totalStrategyMs * 0.3, totalStrategyMs); // ~30% for embedding
      vectorSearchMs = totalStrategyMs - embeddingMs; // Remainder for search

      // Add timing metadata
      const totalRetrievalMs = Date.now() - startTime;
      result.metadata.responseTime = totalRetrievalMs;
      result.metadata.cached = false;

      // Track latency metrics
      ragLatencyTracker.trackOperation({
        queryId,
        timestamp: new Date().toISOString(),
        strategy,
        cacheHit: false,
        cacheCheckMs,
        queryEmbeddingMs: embeddingMs,
        vectorSearchMs,
        rerankingMs: 0, // No re-ranking in basic strategies
        totalRetrievalMs,
      });

      // Cache the result in Redis with semantic similarity
      if (this.config.enableCaching) {
        // Cache result in memory (Redis removed for browser compatibility)
        this.addToCache(query.text, result);
      }

      console.log(`✅ Query completed in ${result.metadata.responseTime}ms using ${strategy} strategy`);

      return result;

    } catch (error) {
      console.error('❌ Query failed:', error);

      // Track failed operation
      const totalRetrievalMs = Date.now() - startTime;
      ragLatencyTracker.trackOperation({
        queryId,
        timestamp: new Date().toISOString(),
        strategy,
        cacheHit: false,
        cacheCheckMs,
        queryEmbeddingMs: 0,
        vectorSearchMs: 0,
        rerankingMs: 0,
        totalRetrievalMs,
      });

      return this.handleQueryError(error, totalRetrievalMs);
    }
  }

  /**
   * Semantic search using vector similarity (Pinecone)
   */
  private async semanticSearch(query: RAGQuery): Promise<RAGResult> {
    const queryId = uuidv4();
    const domains = this.extractDomains(query);
    const primaryDomain = this.getPrimaryDomain(query);
    const pineconeFilter = this.buildPineconeFilter(query);

    // Generate query embedding with circuit breaker protection
    // Use domain-specific model if domain filter is provided
    const embedding = await RAG_CIRCUIT_BREAKERS.openai.execute(
      async () => {
        const embeddingService = getEmbeddingService({
          domain: primaryDomain,
        });
        const result = await embeddingService.generateQueryEmbedding(query.text);

        // Track embedding cost (estimate ~8 tokens per query)
        const estimatedTokens = Math.ceil(query.text.length / 4); // Rough estimate
        ragCostTracker.trackEmbedding(
          queryId,
          'text-embedding-3-large',
          estimatedTokens,
          {
            userId: query.userId,
            agentId: query.agentId,
            sessionId: query.sessionId,
          }
        );

        return result;
      },
      async () => {
        // Fallback: return zero embedding if OpenAI is down
        console.warn('OpenAI circuit breaker open, using fallback');
        return new Array(1536).fill(0);
      }
    );

    // Perform vector search using Pinecone with circuit breaker protection
    const results = await RAG_CIRCUIT_BREAKERS.pinecone.execute(
      async () => {
        const searchResults = await this.pinecone.search({
          embedding: embedding,
          topK: query.maxResults || 10,
          minScore: query.similarityThreshold || 0.7,
          filter: pineconeFilter,
        });

        // Track vector search cost
        ragCostTracker.trackVectorSearch(
          queryId,
          query.maxResults || 10,
          false, // Read operation
          {
            userId: query.userId,
            agentId: query.agentId,
            sessionId: query.sessionId,
          }
        );

        return searchResults;
      },
      async () => {
        // Fallback: return empty results if Pinecone is down
        console.warn('Pinecone circuit breaker open, using fallback');
        return [];
      }
    );

    // Convert to Document format
    const sources = results.map((result: any) => new Document({
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
        domain: primaryDomain,
        domains,
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
    const sources = results.map((result: any) => new Document({
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
      const domains = this.extractDomains(query);
      const primaryDomain = this.getPrimaryDomain(query);
      const pineconeFilter = this.buildPineconeFilter(query);

      // Perform hybrid search using Pinecone (which enriches with Supabase metadata)
      const results = await this.pinecone.hybridSearch({
        text: query.text,
        topK: query.maxResults || 10,
        minScore: query.similarityThreshold || 0.7,
        filter: pineconeFilter,
      });

      // Convert to Document format
      const sources = results.map((result: any) => new Document({
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
          domain: primaryDomain,
          domains,
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
    const domains = this.extractDomains(query);
    const primaryDomain = this.getPrimaryDomain(query);

    let queryBuilder = this.supabase
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
      });

    if (domains.length === 1) {
      queryBuilder = queryBuilder.eq('knowledge_documents.domain', domains[0]);
    } else if (domains.length > 1) {
      queryBuilder = queryBuilder.in('knowledge_documents.domain', domains);
    }

    const { data, error } = await queryBuilder.limit(query.maxResults || 10);

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
        domain: primaryDomain,
        domains,
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
      const domains = this.extractDomains(query);
      const primaryDomain = this.getPrimaryDomain(query);

      // Perform entity-aware search
      const results = await entitySearch.search({
        text: query.text,
        agentId: query.agentId,
        userId: query.userId,
        domain: primaryDomain ?? query.domain,
        phase: query.phase,
        maxResults: query.maxResults || 10,
        similarityThreshold: query.similarityThreshold || 0.7,
        strategy: 'hybrid', // Use triple search strategy
      });

      // Convert to Document format
      const sources = results.map((result: any) => new Document({
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
          domain: primaryDomain,
          domains,
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
    domain: string; // Legacy field
    domain_id?: string; // New field
    tags?: string[];
    metadata?: any;
    access_policy?: string;
    rag_priority_weight?: number;
    domain_scope?: string;
    // Comprehensive metadata fields
    clean_file_name?: string;
    source_name?: string;
    source_url?: string;
    publication_date?: string;
    author?: string;
    authors?: string[];
    organization?: string;
    publisher?: string;
    doi?: string;
    isbn?: string;
    journal?: string;
    document_type?: string;
    language?: string;
    category?: string;
    regulatory_body?: string;
    therapeutic_area?: string;
    product_name?: string;
    indication?: string;
    development_phase?: string;
    geographic_scope?: string;
    summary?: string;
    abstract?: string;
    keywords?: string[];
    content_preview?: string;
    quality_score?: number;
    page_count?: number;
    word_count?: number;
    embedding_model?: string;
    extraction_confidence?: number;
    // Copyright & Compliance
    copyright_status?: string;
    copyright_risk_level?: string;
    copyright_notice?: string;
    copyright_requires_approval?: boolean;
    copyright_issues?: any[];
    attribution_required?: boolean;
    // Data Sanitization
    sanitization_status?: string;
    sanitization_risk_level?: string;
    sanitization_needs_review?: boolean;
    pii_detected?: any[];
    removed_content_summary?: any[];
    // Compliance
    validation_status?: string;
    evidence_level?: string;
    review_date?: string;
    reviewer?: string;
    expiration_date?: string;
  }): Promise<string> {
    // Use domain_id if available, fallback to domain
    const domainId = doc.domain_id || doc.domain;
    
    // Build insert payload with new architecture fields
    const baseMetadata = doc.metadata || {};
    
    // Note: domain_scope is not a column in knowledge_documents table
    // Store it in metadata instead if needed
    if (doc.domain_scope) {
      baseMetadata.domain_scope = doc.domain_scope;
    }
    
    const insertPayload: any = {
      title: doc.title,
      content: doc.content,
      domain: doc.domain, // Legacy field for backward compatibility
      domain_id: domainId, // New field
      tags: doc.tags || [],
      status: 'processing',
      metadata: baseMetadata,
    };
    
    // Add new architecture fields if provided
    if (doc.access_policy) {
      insertPayload.access_policy = doc.access_policy;
    }
    if (doc.rag_priority_weight !== undefined) {
      insertPayload.rag_priority_weight = doc.rag_priority_weight;
    }
    
    // If domain_id is provided, try to fetch domain metadata to inherit missing fields
    if (domainId && (!doc.access_policy || doc.rag_priority_weight === undefined)) {
      try {
        const { data: domainInfo } = await this.supabase
          .from('knowledge_domains_new')
          .select('access_policy, rag_priority_weight, domain_scope, embedding_model')
          .eq('domain_id', domainId)
          .single();
        
        if (domainInfo) {
          // Inherit from domain if not explicitly provided
          if (!doc.access_policy && domainInfo.access_policy) {
            insertPayload.access_policy = domainInfo.access_policy;
          }
          if (doc.rag_priority_weight === undefined && domainInfo.rag_priority_weight !== undefined) {
            insertPayload.rag_priority_weight = domainInfo.rag_priority_weight;
          }
          // Store domain_scope in metadata instead of as a column
          if (!doc.domain_scope && domainInfo.domain_scope) {
            insertPayload.metadata.domain_scope = domainInfo.domain_scope;
          }
        }
      } catch (error) {
        // Silently fail - domain might not exist in new table yet
        console.log('Domain metadata lookup skipped:', error);
      }
    }
    
    // Insert document
    const { data: document, error: docError } = await this.supabase
      .from('knowledge_documents')
      .insert(insertPayload)
      .select()
      .single();

    if (docError) {
      throw new Error(`Failed to add document: ${docError.message}`);
    }

    // Chunk and process in background
    // Pass domain for optimal model selection
    this.processDocumentAsync(document.id, doc.content, domainId);

    return document.id;
  }

  /**
   * Process document asynchronously (chunking + embedding + Pinecone sync)
   */
  private async processDocumentAsync(documentId: string, content: string, domain?: string): Promise<void> {
    try {
      // Chunk the content
      const chunks = this.chunkText(content, 1500, 300);

      // Generate embeddings for all chunks
      // Uses HuggingFace if available (FREE), falls back to OpenAI
      // Auto-selects best model based on document domain
      let documentDomain = domain;
      
      // Fetch domain from DB if not provided (try domain_id first, fallback to domain)
      if (!documentDomain) {
        const { data: document } = await this.supabase
          .from('knowledge_documents')
          .select('domain_id, domain')
          .eq('id', documentId)
          .single();
        documentDomain = document?.domain_id || document?.domain;
      }

      // Get domain-specific embedding service
      const embeddingService = getEmbeddingService({
        domain: documentDomain || undefined,
      });
      
      const texts = chunks.map(chunk => chunk.content);
      const batchResult = await embeddingService.generateBatchEmbeddings(texts);

      // Get document metadata to inherit domain and security settings for chunks
      const { data: docForChunks } = await this.supabase
        .from('knowledge_documents')
        .select('domain_id, access_policy, rag_priority_weight, enterprise_id, owner_user_id')
        .eq('id', documentId)
        .single();
      
      // Insert chunks with embeddings into Supabase (inherit domain and security settings)
      const chunkInserts = chunks.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: index,
        content: chunk.content,
        embedding: batchResult.embeddings[index],
        metadata: chunk.metadata,
        // Inherit domain and security settings from parent document
        domain_id: docForChunks?.domain_id,
        access_policy: docForChunks?.access_policy,
        rag_priority_weight: docForChunks?.rag_priority_weight,
        enterprise_id: docForChunks?.enterprise_id,
        owner_user_id: docForChunks?.owner_user_id,
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
        .select('title, domain_id, domain')
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
            domain: document?.domain, // Legacy field
            domain_id: document?.domain_id || document?.domain, // New field
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
    const [docsCount, chunksCount, pineconeStats] = await Promise.all([
      this.supabase ? this.supabase.from('knowledge_documents').select('*', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
      this.supabase ? this.supabase.from('document_chunks').select('*', { count: 'exact', head: true }) : Promise.resolve({ count: 0 }),
      this.pinecone.getIndexStats().catch(() => null),
      // Redis stats removed (ioredis is server-only)
    ]);

    const isPineconeHealthy = pineconeStats !== null;
    const isSupabaseHealthy = this.supabase && docsCount.count !== null && chunksCount.count !== null;

    return {
      status: isPineconeHealthy && isSupabaseHealthy ? 'healthy' : 'degraded',
      totalDocuments: docsCount.count || 0,
      totalChunks: chunksCount.count || 0,
      cacheSize: this.cache.size,
      vectorStoreStatus: isPineconeHealthy ? 'connected (Pinecone)' : 'disconnected',
      pineconeStats,
      cacheType: 'in-memory', // Changed from Redis
    };
  }

  /**
   * Clear cache (in-memory only - Redis removed for browser compatibility)
   */
  async clearCache(pattern?: string): Promise<void> {
    this.cache.clear();
    console.log('🗑️ RAG cache cleared (in-memory)');
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
    return results.map((result: any) => new Document({
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
// Lazy initialization to prevent module-load-time errors
let _unifiedRAGServiceInstance: UnifiedRAGService | null = null;
export const unifiedRAGService = new Proxy({} as UnifiedRAGService, {
  get(target, prop) {
    if (!_unifiedRAGServiceInstance) {
      _unifiedRAGServiceInstance = new UnifiedRAGService();
    }
    return (_unifiedRAGServiceInstance as any)[prop];
  }
});
