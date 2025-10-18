import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { embeddingService, EmbeddingResult } from './lib/services/embeddings/openai-embedding-service';
import { 
  RAGError, 
  DatabaseError, 
  ConfigurationError, 
  MissingEnvironmentVariableError,
  EmbeddingGenerationError,
  VectorSearchError,
  ValidationError,
  InvalidEmbeddingError,
  RAGErrorFactory,
  withErrorHandling
} from './lib/errors/rag-errors';
import { getLogger } from './lib/logging/logger';
import { 
  getTenantContextManager, 
  getTenantService, 
  TenantContext,
  TenantPermissions 
} from './lib/tenant/tenant-context';

export interface RAGKnowledgeSource {
  id: string;
  tenant_id: string;
  name: string;
  title?: string;
  description?: string;
  source_type: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  content_hash?: string;
  domain: 'medical_affairs' | 'regulatory_compliance' | 'digital_health' | 'clinical_research' | 'market_access' | 'commercial_strategy' | 'methodology_frameworks' | 'technology_platforms';
  prism_suite?: 'RULES' | 'TRIALS' | 'GUARD' | 'VALUE' | 'BRIDGE' | 'PROOF' | 'CRAFT' | 'SCOUT';
  medical_specialty?: string;
  therapeutic_area?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived';
  quality_score?: number;
  confidence_score?: number;
  access_count: number;
  last_accessed?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface RAGKnowledgeChunk {
  id: string;
  source_id: string;
  content: string;
  content_type: string;
  chunk_index: number;
  embedding?: number[];
  section_title?: string;
  page_number?: number;
  word_count?: number;
  medical_context: Record<string, unknown>;
  regulatory_context: Record<string, unknown>;
  clinical_context: Record<string, unknown>;
  quality_score?: number;
  semantic_density?: number;
  created_at: string;
}

export interface RAGSearchResult {
  chunk_id: string;
  source_id: string;
  content: string;
  similarity: number;
  source_name: string;
  domain: string;
  prism_suite?: string;
  section_title?: string;
  medical_context: Record<string, unknown>;
  regulatory_context: Record<string, unknown>;
}

export interface RAGSearchOptions {
  threshold?: number;
  limit?: number;
  domain?: string;
  prism_suite?: string;
  include_metadata?: boolean;
}

class RAGService {
  private supabase: SupabaseClient | null = null;
  private defaultTenantId: string | null = null;
  private isInitialized = false;
  private logger = getLogger();

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    const startTime = Date.now();
    this.logger.info('Initializing RAG Service', { component: 'rag-service', operation: 'initialize' });

    try {
      // Initialize Supabase client
      if (!this.supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl) {
          throw new MissingEnvironmentVariableError('NEXT_PUBLIC_SUPABASE_URL');
        }
        
        if (!supabaseKey) {
          throw new MissingEnvironmentVariableError('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        this.logger.info('Supabase client created', { 
          component: 'rag-service', 
          operation: 'initialize',
          supabaseUrl: supabaseUrl.substring(0, 30) + '...'
        });
      }

      // Test connection
      this.logger.debug('Testing database connection', { component: 'rag-service', operation: 'initialize' });
      const { data: connectionTest, error: connectionError } = await this.supabase
        .from('rag_tenants')
        .select('id')
        .limit(1);

      if (connectionError) {
        throw new DatabaseError(`Database connection failed: ${connectionError.message}`, {
          supabaseError: connectionError
        });
      }

      // Get default tenant ID
      this.logger.debug('Getting default tenant ID', { component: 'rag-service', operation: 'initialize' });
      const { data, error } = await this.supabase.rpc('get_default_rag_tenant_id');
      if (error) {
        throw new DatabaseError(`Failed to get default tenant ID: ${error.message}`, {
          supabaseError: error
        });
      }
      
      this.defaultTenantId = data;
      this.isInitialized = true;

      const duration = Date.now() - startTime;
      this.logger.info('RAG Service initialized successfully', { 
        component: 'rag-service', 
        operation: 'initialize',
        duration,
        defaultTenantId: this.defaultTenantId
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to initialize RAG Service', { 
        component: 'rag-service', 
        operation: 'initialize',
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw RAGErrorFactory.fromUnknown(error, { operation: 'initialize' });
    }
  }

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      throw new ConfigurationError('RAG Service not initialized. Call initialize() first.', {
        component: 'rag-service',
        operation: 'getSupabaseClient'
      });
    }
    return this.supabase;
  }

  async getKnowledgeSources(options: {
    domain?: string;
    prism_suite?: string;
    processing_status?: string;
    limit?: number;
  } = { /* TODO: implement */ }): Promise<RAGKnowledgeSource[]> {
    await this.initialize();

    let query = this.getSupabaseClient()
      .from('rag_knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.domain) {
      query = query.eq('domain', options.domain);
    }

    if (options.prism_suite) {
      query = query.eq('prism_suite', options.prism_suite);
    }

    if (options.processing_status) {
      query = query.eq('processing_status', options.processing_status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      // console.error('Failed to fetch knowledge sources:', error);
      throw error;
    }

    return data || [];
  }

  async createKnowledgeSource(source: Partial<RAGKnowledgeSource>): Promise<RAGKnowledgeSource> {
    await this.initialize();

    const { data, error } = await this.getSupabaseClient()
      .from('rag_knowledge_sources')
      .insert([{
        ...source,
        tenant_id: this.defaultTenantId
      }])
      .select()
      .single();

    if (error) {
      // console.error('Failed to create knowledge source:', error);
      throw error;
    }

    return data;
  }

  async updateKnowledgeSource(id: string, updates: Partial<RAGKnowledgeSource>): Promise<RAGKnowledgeSource> {
    const { data, error } = await this.getSupabaseClient()
      .from('rag_knowledge_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // console.error('Failed to update knowledge source:', error);
      throw error;
    }

    return data;
  }

  async deleteKnowledgeSource(id: string): Promise<void> {
    const { error } = await this.getSupabaseClient()
      .from('rag_knowledge_sources')
      .delete()
      .eq('id', id);

    if (error) {
      // console.error('Failed to delete knowledge source:', error);
      throw error;
    }
  }

  async addKnowledgeChunk(chunk: Partial<RAGKnowledgeChunk>): Promise<RAGKnowledgeChunk> {
    const { data, error } = await this.getSupabaseClient()
      .from('rag_knowledge_chunks')
      .insert([chunk])
      .select()
      .single();

    if (error) {
      // console.error('Failed to add knowledge chunk:', error);
      throw error;
    }

    return data;
  }

  async addKnowledgeChunks(chunks: Partial<RAGKnowledgeChunk>[]): Promise<RAGKnowledgeChunk[]> {
    const { data, error } = await this.getSupabaseClient()
      .from('rag_knowledge_chunks')
      .insert(chunks)
      .select();

    if (error) {
      // console.error('Failed to add knowledge chunks:', error);
      throw error;
    }

    return data || [];
  }

  async searchKnowledge(
    queryText: string,
    queryEmbedding: number[],
    options: RAGSearchOptions = {}
  ): Promise<RAGSearchResult[]> {
    const startTime = Date.now();
    const {
      threshold = 0.7,
      limit = 10,
      domain,
      prism_suite
    } = options;

    // Get tenant context
    const tenantManager = getTenantContextManager();
    const tenantId = tenantManager.getCurrentTenantId();

    this.logger.debug('Starting vector search', { 
      component: 'rag-service', 
      operation: 'searchKnowledge',
      tenantId,
      queryLength: queryText.length,
      threshold,
      limit,
      domain,
      prism_suite
    });

    try {
      // Validate tenant access
      tenantManager.validateAccess('canSearch', `domain:${domain}`);

      // Validate inputs
      if (!queryText || queryText.trim().length === 0) {
        throw new ValidationError('Query text cannot be empty', { queryText });
      }

      if (!queryEmbedding || queryEmbedding.length !== 3072) {
        throw new InvalidEmbeddingError(queryEmbedding?.length || 0, 3072, {
          queryText: queryText.substring(0, 100)
        });
      }

      // Apply tenant filters
      const tenantFilters = tenantManager.getTenantFilters();
      const finalDomain = domain || tenantFilters.domain;
      const finalPrismSuite = prism_suite || tenantFilters.prism_suite;

      const { data, error } = await this.getSupabaseClient().rpc('search_rag_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_domain: finalDomain || null,
        filter_prism_suite: finalPrismSuite || null,
        filter_tenant_id: tenantId
      });

      if (error) {
        throw new DatabaseError(`Vector search failed: ${error.message}`, {
          supabaseError: error,
          queryText: queryText.substring(0, 100),
          threshold,
          limit,
          tenantId
        });
      }

      const results = data || [];
      const duration = Date.now() - startTime;

      // Log search analytics
      this.logSearchAnalytics(queryText, queryEmbedding, domain, results.length);

      // Update tenant usage
      const tenantService = getTenantService();
      await tenantService.updateUsage(tenantId, 'search', 1);

      this.logger.vectorSearch(queryText, results.length, duration, {
        component: 'rag-service',
        operation: 'searchKnowledge',
        tenantId,
        threshold,
        limit,
        domain: finalDomain,
        prism_suite: finalPrismSuite
      });

      return results;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Vector search failed', { 
        component: 'rag-service', 
        operation: 'searchKnowledge',
        duration,
        tenantId,
        queryText: queryText.substring(0, 100),
        threshold,
        limit,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof RAGError) {
        throw error;
      }
      
      throw new VectorSearchError(queryText, error instanceof Error ? error.message : 'Unknown error', {
        threshold,
        limit,
        duration,
        tenantId
      });
    }
  }

  async logSearchAnalytics(
    queryText: string,
    queryEmbedding: number[],
    queryDomain?: string,
    resultsCount: number = 0
  ): Promise<void> {
    try {
      await this.initialize();

      await this.getSupabaseClient()
        .from('rag_search_analytics')
        .insert([{
          tenant_id: this.defaultTenantId,
          query_text: queryText,
          query_embedding: queryEmbedding,
          query_domain: queryDomain,
          results_count: resultsCount,
          search_time_ms: 0, // Would be measured in real implementation
          total_chunks_searched: 0 // Would be tracked in real implementation
        }]);
    } catch (error) {
      // console.warn('Failed to log search analytics:', error);
    }
  }

  async getSearchAnalytics(options: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = { /* TODO: implement */ }): Promise<unknown[]> {
    await this.initialize();

    let query = this.getSupabaseClient()
      .from('rag_search_analytics')
      .select('*')
      .eq('tenant_id', this.defaultTenantId)
      .order('created_at', { ascending: false });

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      // console.error('Failed to fetch search analytics:', error);
      throw error;
    }

    return data || [];
  }

  async getKnowledgeChunks(sourceId: string): Promise<RAGKnowledgeChunk[]> {
    const { data, error } = await this.getSupabaseClient()
      .from('rag_knowledge_chunks')
      .select('*')
      .eq('source_id', sourceId)
      .order('chunk_index', { ascending: true });

    if (error) {
      // console.error('Failed to fetch knowledge chunks:', error);
      throw error;
    }

    return data || [];
  }

  async updateProcessingStatus(
    sourceId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
  ): Promise<void> {
    const updates: Record<string, string> = {
      processing_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updates.processed_at = new Date().toISOString();
    }

    const { error } = await this.getSupabaseClient()
      .from('rag_knowledge_sources')
      .update(updates)
      .eq('id', sourceId);

    if (error) {
      // console.error('Failed to update processing status:', error);
      throw error;
    }
  }

  // Generate real embeddings using OpenAI text-embedding-3-large
  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();
    this.logger.debug('Generating embedding', { 
      component: 'rag-service', 
      operation: 'generateEmbedding',
      textLength: text.length
    });

    try {
      if (!text || text.trim().length === 0) {
        throw new ValidationError('Text cannot be empty for embedding generation', {
          textLength: text?.length || 0
        });
      }

      const result: EmbeddingResult = await embeddingService.generateEmbedding(text, {
        model: 'text-embedding-3-large',
        dimensions: 3072
      });

      // Validate embedding dimensions
      if (result.embedding.length !== 3072) {
        throw new InvalidEmbeddingError(result.embedding.length, 3072, {
          textLength: text.length,
          actualDimensions: result.embedding.length
        });
      }

      const duration = Date.now() - startTime;
      this.logger.embedding('Generated embedding', text.length, result.embedding.length, duration, {
        component: 'rag-service',
        operation: 'generateEmbedding'
      });

      return result.embedding;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Failed to generate embedding', { 
        component: 'rag-service', 
        operation: 'generateEmbedding',
        duration,
        textLength: text.length,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof RAGError) {
        throw error;
      }
      
      throw new EmbeddingGenerationError(text, error instanceof Error ? error.message : 'Unknown error', {
        textLength: text.length,
        duration
      });
    }
  }

  // Helper method to chunk text content
  chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start = end - overlap;
    }

    return chunks;
  }

  // Process a document into chunks with embeddings
  async processDocument(
    sourceId: string,
    content: string,
    options: {
      chunkSize?: number;
      overlap?: number;
      sectionTitle?: string;
      medicalContext?: Record<string, unknown>;
      regulatoryContext?: Record<string, unknown>;
      clinicalContext?: Record<string, unknown>;
    } = { /* TODO: implement */ }
  ): Promise<void> {
    const {
      chunkSize = 1000,
      overlap = 200,
      sectionTitle,
      medicalContext = { /* TODO: implement */ },
      regulatoryContext = { /* TODO: implement */ },
      clinicalContext = { /* TODO: implement */ }
    } = options;

    try {
      // Update status to processing
      await this.updateProcessingStatus(sourceId, 'processing');

      // Chunk the content
      const chunks = this.chunkText(content, chunkSize, overlap);

      // Process chunks in batches
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const processedChunks = await Promise.all(batch.map(async (chunkContent, batchIndex) => {
          const chunkIndex = i + batchIndex;
          const embedding = await this.generateEmbedding(chunkContent);

          return {
            source_id: sourceId,
            content: chunkContent,
            content_type: 'text',
            chunk_index: chunkIndex,
            embedding,
            section_title: sectionTitle,
            word_count: chunkContent.split(/\s+/).length,
            medical_context: medicalContext,
            regulatory_context: regulatoryContext,
            clinical_context: clinicalContext,
            quality_score: this.calculateQualityScore(chunkContent),
            semantic_density: this.calculateSemanticDensity(chunkContent)
          };
        }));

        await this.addKnowledgeChunks(processedChunks);
      }

      // Update status to completed
      await this.updateProcessingStatus(sourceId, 'completed');

    } catch (error) {
      // console.error('Failed to process document:', error);
      await this.updateProcessingStatus(sourceId, 'failed');
      throw error;
    }
  }

  private calculateQualityScore(content: string): number {
    // Simple quality score based on content length and structure
    const lengthScore = Math.min(content.length / 1000, 1);
    const hasStructure = /[.!?]/.test(content);
    const structureScore = hasStructure ? 1 : 0.5;

    // Normalize to 0-1 scale
    return (lengthScore + structureScore) / 2;
  }

  private calculateSemanticDensity(content: string): number {
    // Simple semantic density calculation
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
  }
}

export const ragService = new RAGService();
export default ragService;