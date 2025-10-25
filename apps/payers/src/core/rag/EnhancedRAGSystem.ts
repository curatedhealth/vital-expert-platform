/**
 * Enhanced RAG System v2.0 with Supabase Vector DB
 * Features: Hybrid retrieval, cross-encoder reranking, multi-modal support
 */

import { EventEmitter } from 'events';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
  chunks?: DocumentChunk[];
}

interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: ChunkMetadata;
  document_id: string;
  chunk_index: number;
}

interface DocumentMetadata {
  title?: string;
  source?: string;
  domain?: string;
  evidence_level?: string;
  publication_date?: string;
  authors?: string[];
  medical_specialty?: string;
  conditions?: string[];
  interventions?: string[];
  document_type?: 'clinical_guideline' | 'research_paper' | 'regulatory_doc' | 'protocol';
  validation_status?: 'validated' | 'pending' | 'rejected';
  last_updated?: string;
}

interface ChunkMetadata {
  section?: string;
  page_number?: number;
  confidence_score?: number;
  extraction_method?: string;
  quality_score?: number;
  created_at?: string;
  tags?: string[];
}

interface RetrievalQuery {
  text: string;
  limit?: number;
  filters?: RetrievalFilters;
  options?: RetrievalOptions;
}

interface RetrievalFilters {
  domain?: string[];
  evidence_level?: string[];
  document_type?: string[];
  date_range?: {
    start?: string;
    end?: string;
  };
  medical_specialty?: string[];
  validation_status?: string[];
}

interface RetrievalOptions {
  max_results?: number;
  similarity_threshold?: number;
  use_reranking?: boolean;
  include_metadata?: boolean;
  boost_recent?: boolean;
  deduplicate?: boolean;
  hybrid_search?: boolean;
}

interface RetrievalResult {
  chunks: ScoredChunk[];
  total_found: number;
  query_embedding: number[];
  retrieval_strategy: string;
  processing_time_ms: number;
  reranking_applied: boolean;
}

interface ScoredChunk {
  chunk: DocumentChunk;
  similarity_score: number;
  rerank_score?: number;
  final_score: number;
  explanation?: string;
}

export class EnhancedRAGSystem extends EventEmitter {
  private supabase: SupabaseClient;
  private embeddingCache: Map<string, number[]> = new Map();
  private crossEncoderCache: Map<string, number> = new Map();

  constructor(
    private config: {
      supabaseUrl: string;
      supabaseKey?: string;
      supabaseServiceKey?: string;
      openaiApiKey: string;
      crossEncoderEndpoint?: string;
      enableHybridSearch?: boolean;
      enableReranking?: boolean;
      chunkSize?: number;
      chunkOverlap?: number;
    }
  ) {
    super();
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey || config.supabaseServiceKey || '');
    this.initializeSystem();
  }

  private async initializeSystem(): Promise<void> {
    // Ensure vector extensions are available
    try {
      await this.supabase.rpc('create_extension_if_not_exists', { extension_name: 'vector' });
      await this.createIndexes();
      this.emit('initialized');
    } catch (error) {
      this.emit('error', { context: 'initialization', error });
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    // Create optimized indexes for vector search

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_embedding_cosine
       ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_document_chunks_metadata_gin
       ON document_chunks USING gin (metadata);`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_domain
       ON knowledge_documents (domain);`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_evidence_level
       ON knowledge_documents ((metadata->>'evidence_level'));`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_specialty
       ON knowledge_documents ((metadata->>'medical_specialty'));`
    ];

    for (const query of indexQueries) {
      try {
        await this.supabase.rpc('execute_sql', { sql: query });
      } catch (error) {
        // Index might already exist - continue
        // console.warn('Index creation warning:', error);
      }
    }
  }

  /**
   * Enhanced retrieval with hybrid search and reranking
   */
  async retrieve(query: RetrievalQuery): Promise<RetrievalResult> {

    try {
      // 1. Generate query embedding

      // 2. Execute hybrid search strategy

      let candidates: ScoredChunk[];

      switch (retrievalStrategy) {
        case 'vector_only':
          candidates = await this.vectorSearch(queryEmbedding, query);
          break;
        case 'keyword_only':
          candidates = await this.keywordSearch(query);
          break;
        case 'hybrid':
          candidates = await this.hybridSearch(queryEmbedding, query);
          break;
        default:
          candidates = await this.hybridSearch(queryEmbedding, query);
      }

      // 3. Apply cross-encoder reranking if enabled
      if (query.options?.use_reranking !== false && candidates.length > 1) {
        candidates = await this.applyReranking(query.text, candidates);
      }

      // 4. Post-process results
      candidates = await this.postProcessResults(candidates, query);

      const result: RetrievalResult = {
        chunks: candidates,
        total_found: candidates.length,
        query_embedding: queryEmbedding,
        retrieval_strategy: retrievalStrategy,
        processing_time_ms: processingTime,
        reranking_applied: query.options?.use_reranking !== false
      };

      this.emit('retrieval_completed', {
        query: query.text,
        results_count: candidates.length,
        processing_time_ms: processingTime,
        strategy: retrievalStrategy
      });

      return result;

    } catch (error) {
      this.emit('retrieval_error', { query: query.text, error });
      throw error;
    }
  }

  /**
   * Vector similarity search using Supabase pgvector
   */
  private async vectorSearch(
    queryEmbedding: number[],
    query: RetrievalQuery
  ): Promise<ScoredChunk[]> {

      .from('document_chunks')
      .select(`
        *,
        knowledge_documents!inner(
          id,
          title,
          domain,
          status,
          metadata
        )
      `)
      .order('embedding <-> $1', { ascending: true });

    // Apply filters
    if (query.filters) {
      dbQuery = this.applyFilters(dbQuery, query.filters);
    }

    // Set limit

    dbQuery = dbQuery.limit(maxResults);

    const { data, error } = await this.supabase.rpc('vector_similarity_search', {
      query_embedding: queryEmbedding,
      match_count: maxResults,
      similarity_threshold: query.options?.similarity_threshold || 0.5
    });

    if (error) {
      throw new Error(`Vector search failed: ${error.message}`);
    }

    return data?.map((item: unknown) => ({
      chunk: {
        id: item.id,
        content: item.content,
        embedding: item.embedding,
        metadata: item.metadata,
        document_id: item.document_id,
        chunk_index: item.chunk_index
      },
      similarity_score: this.calculateCosineSimilarity(queryEmbedding, item.embedding),
      final_score: this.calculateCosineSimilarity(queryEmbedding, item.embedding)
    })) || [];
  }

  /**
   * Keyword-based search using full-text search
   */
  private async keywordSearch(query: RetrievalQuery): Promise<ScoredChunk[]> {

      .from('document_chunks')
      .select(`
        *,
        knowledge_documents!inner(
          id,
          title,
          domain,
          status,
          metadata
        )
      `)
      .textSearch('content', query.text, {
        type: 'websearch',
        config: 'english'
      });

    // Apply filters
    if (query.filters) {
      dbQuery = this.applyFilters(dbQuery, query.filters);
    }

    dbQuery = dbQuery.limit(maxResults);

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Keyword search failed: ${error.message}`);
    }

    return data?.map((item: unknown, index: number) => ({
      chunk: {
        id: item.id,
        content: item.content,
        embedding: item.embedding,
        metadata: item.metadata,
        document_id: item.document_id,
        chunk_index: item.chunk_index
      },
      similarity_score: 1.0 - (index * 0.05), // Decreasing score based on rank
      final_score: 1.0 - (index * 0.05)
    })) || [];
  }

  /**
   * Hybrid search combining vector and keyword results
   */
  private async hybridSearch(
    queryEmbedding: number[],
    query: RetrievalQuery
  ): Promise<ScoredChunk[]> {
    // Execute both searches in parallel
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(queryEmbedding, {
        ...query,
        options: { ...query.options, max_results: Math.floor((query.options?.max_results || 20) * 0.7) }
      }),
      this.keywordSearch({
        ...query,
        options: { ...query.options, max_results: Math.floor((query.options?.max_results || 20) * 0.5) }
      })
    ]);

    // Combine and deduplicate results

    // Add vector results with weight
    for (const result of vectorResults) {
      combinedResults.set(result.chunk.id, {
        ...result,
        final_score: result.similarity_score * 0.7 // 70% weight for vector similarity
      });
    }

    // Add keyword results with weight, combining scores if chunk already exists
    for (const result of keywordResults) {

      if (existing) {
        // Combine scores
        existing.final_score = (existing.final_score + (result.similarity_score * 0.3)) / 1.3;
      } else {
        combinedResults.set(result.chunk.id, {
          ...result,
          final_score: result.similarity_score * 0.3 // 30% weight for keyword match
        });
      }
    }

    // Sort by final score and return top results

      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, query.options?.max_results || 20);

    return results;
  }

  /**
   * Cross-encoder reranking for improved relevance
   */
  private async applyReranking(
    queryText: string,
    candidates: ScoredChunk[]
  ): Promise<ScoredChunk[]> {
    try {
      // Batch process for efficiency

      const rerankedCandidates: ScoredChunk[] = [];

      for (let _i = 0; i < candidates.length; i += batchSize) {

        rerankedCandidates.push(...rerankedBatch);
      }

      // Sort by rerank score
      return rerankedCandidates
        .sort((a, b) => (b.rerank_score || 0) - (a.rerank_score || 0))
        .map(candidate => ({
          ...candidate,
          final_score: this.combineScores(
            candidate.similarity_score,
            candidate.rerank_score || 0
          )
        }));

    } catch (error) {
      // console.warn('Reranking failed, using original scores:', error);
      return candidates;
    }
  }

  private async rerankBatch(
    queryText: string,
    candidates: ScoredChunk[]
  ): Promise<ScoredChunk[]> {
    // Check cache first

    if (this.crossEncoderCache.has(cacheKey)) {

      return candidates.map((candidate, index) => ({
        ...candidate,
        // eslint-disable-next-line security/detect-object-injection
        rerank_score: Array.isArray(cachedScores) ? cachedScores[index] : cachedScores
      }));
    }

    // Use OpenAI embedding similarity as cross-encoder proxy
    // In production, use a dedicated cross-encoder model

      candidates.map(async (candidate) => {

          await this.generateEmbedding(candidate.chunk.content);

        return {
          ...candidate,
          rerank_score: rerankScore
        };
      })
    );

    // Cache results

    this.crossEncoderCache.set(cacheKey, scores as unknown);

    return rerankedCandidates;
  }

  /**
   * Post-process results (deduplication, boosting, etc.)
   */
  private async postProcessResults(
    candidates: ScoredChunk[],
    query: RetrievalQuery
  ): Promise<ScoredChunk[]> {

    // Apply similarity threshold
    if (query.options?.similarity_threshold) {
      processedCandidates = processedCandidates.filter(
        c => c.final_score >= query.options?.similarity_threshold!
      );
    }

    // Boost recent documents if requested
    if (query.options?.boost_recent) {
      processedCandidates = this.applyRecencyBoost(processedCandidates);
    }

    // Deduplicate if requested
    if (query.options?.deduplicate) {
      processedCandidates = this.deduplicateResults(processedCandidates);
    }

    // Add explanations for top results
    processedCandidates = processedCandidates.map(candidate => ({
      ...candidate,
      explanation: this.generateExplanation(candidate, query)
    }));

    return processedCandidates;
  }

  private applyRecencyBoost(candidates: ScoredChunk[]): ScoredChunk[] {
    return candidates.map(candidate => {

      if (createdAt) {

          (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Boost more recent documents

        return {
          ...candidate,
          final_score: candidate.final_score * (1 + recencyBoost * 0.1)
        };
      }
      return candidate;
    });
  }

  private deduplicateResults(candidates: ScoredChunk[]): ScoredChunk[] {

    const deduplicated: ScoredChunk[] = [];

    for (const candidate of candidates) {
      // Create a similarity hash for the content

      if (!seen.has(contentHash)) {
        seen.add(contentHash);
        deduplicated.push(candidate);
      }
    }

    return deduplicated;
  }

  private generateExplanation(candidate: ScoredChunk, query: RetrievalQuery): string {

    parts.push(`Similarity: ${(candidate.similarity_score * 100).toFixed(1)}%`);

    if (candidate.rerank_score !== undefined) {
      parts.push(`Relevance: ${(candidate.rerank_score * 100).toFixed(1)}%`);
    }

    if (candidate.chunk.metadata?.tags?.includes('evidence')) {
      parts.push(`Evidence: clinical`);
    } else if (candidate.chunk.metadata?.quality_score && candidate.chunk.metadata.quality_score > 0.8) {
      parts.push(`High Quality: ${(candidate.chunk.metadata.quality_score * 100).toFixed(0)}%`);
    }

    return parts.join(' | ');
  }

  /**
   * Document ingestion with advanced processing
   */
  async ingestDocument(document: Omit<Document, 'id'>): Promise<string> {
    try {
      // 1. Generate document embedding

      // 2. Insert document
      const { data: insertedDoc, error: docError } = await this.supabase
        .from('knowledge_documents')
        .insert({
          title: document.metadata.title || 'Untitled',
          content: document.content,
          domain: document.metadata.domain,
          status: 'processing',
          metadata: document.metadata,
          file_type: document.metadata.document_type || 'text',
          tags: document.metadata.conditions || [],
          embedding: documentEmbedding
        })
        .select()
        .single();

      if (docError) {
        throw new Error(`Failed to insert document: ${docError.message}`);
      }

      // 3. Chunk document intelligently

        document.content,
        document.metadata,
        insertedDoc.id
      );

      // 4. Generate embeddings for chunks

        chunks.map(async (chunk, index) => ({
          document_id: insertedDoc.id,
          chunk_index: index,
          content: chunk.content,
          metadata: {
            ...chunk.metadata,
            quality_score: this.calculateChunkQuality(chunk.content)
          },
          embedding: await this.generateEmbedding(chunk.content)
        }))
      );

      // 5. Insert chunks in batches

      for (let _i = 0; i < chunksWithEmbeddings.length; i += batchSize) {

        const { error: chunkError } = await this.supabase
          .from('document_chunks')
          .insert(batch);

        if (chunkError) {
          throw new Error(`Failed to insert chunks: ${chunkError.message}`);
        }
      }

      // 6. Update document status
      await this.supabase
        .from('knowledge_documents')
        .update({
          status: 'completed',
          chunk_count: chunksWithEmbeddings.length,
          processed_at: new Date().toISOString()
        })
        .eq('id', insertedDoc.id);

      this.emit('document_ingested', {
        document_id: insertedDoc.id,
        chunk_count: chunksWithEmbeddings.length
      });

      return insertedDoc.id;

    } catch (error) {
      this.emit('ingestion_error', { document, error });
      throw error;
    }
  }

  /**
   * Intelligent document chunking
   */
  private async createIntelligentChunks(
    content: string,
    metadata: DocumentMetadata,
    documentId: string
  ): Promise<Array<{ content: string; metadata: ChunkMetadata }>> {
    const chunks: Array<{ content: string; metadata: ChunkMetadata }> = [];

    // Different chunking strategies based on document type
    switch (metadata.document_type) {
      case 'clinical_guideline':
        return this.chunkClinicalGuideline(content);
      case 'research_paper':
        return this.chunkResearchPaper(content);
      case 'regulatory_doc':
        return this.chunkRegulatoryDocument(content);
      default:
        return this.chunkGenericDocument(content);
    }
  }

  private chunkGenericDocument(content: string): Array<{ content: string; metadata: ChunkMetadata }> {
    const chunks: Array<{ content: string; metadata: ChunkMetadata }> = [];

    let currentSentences: string[] = [];

    for (const sentence of sentences) {

      // Aim for chunks of 200-400 words
      if (potentialChunk.split(' ').length > 400 && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            quality_score: this.calculateChunkQuality(currentChunk),
            extraction_method: 'sentence_boundary'
          }
        });

        currentChunk = sentence + '. ';
        currentSentences = [sentence];
      } else {
        currentChunk = potentialChunk;
        currentSentences.push(sentence);
      }
    }

    // Add remaining content
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          quality_score: this.calculateChunkQuality(currentChunk),
          extraction_method: 'sentence_boundary'
        }
      });
    }

    return chunks;
  }

  private chunkClinicalGuideline(content: string): Array<{ content: string; metadata: ChunkMetadata }> {
    // Look for section headers and structure

    return sections
      .filter(section => section.trim().length > 100) // Filter out very short sections
      .map((section, index) => ({
        content: section.trim(),
        metadata: {
          section: this.extractSectionHeader(section),
          quality_score: this.calculateChunkQuality(section),
          extraction_method: 'section_boundary'
        }
      }));
  }

  private chunkResearchPaper(content: string): Array<{ content: string; metadata: ChunkMetadata }> {
    // Research papers have standard sections

      /abstract/i,
      /introduction/i,
      /methods?/i,
      /results?/i,
      /discussion/i,
      /conclusion/i,
      /references?/i
    ];

    // Split by sections first, then by paragraphs if sections are too long

    const chunks: Array<{ content: string; metadata: ChunkMetadata }> = [];

    for (const section of sections) {
      if (section.content.split(' ').length <= 400) {
        chunks.push({
          content: section.content,
          metadata: {
            section: section.title,
            quality_score: this.calculateChunkQuality(section.content),
            extraction_method: 'section_boundary'
          }
        });
      } else {
        // Split large sections into paragraphs

        for (const paragraph of paragraphs) {
          chunks.push({
            content: paragraph.trim(),
            metadata: {
              section: section.title,
              quality_score: this.calculateChunkQuality(paragraph),
              extraction_method: 'paragraph_boundary'
            }
          });
        }
      }
    }

    return chunks;
  }

  private chunkRegulatoryDocument(content: string): Array<{ content: string; metadata: ChunkMetadata }> {
    // Regulatory documents often have numbered sections

    return sections
      .filter(section => section.trim().length > 100)
      .map((section) => ({
        content: section.trim(),
        metadata: {
          section: this.extractSectionNumber(section),
          quality_score: this.calculateChunkQuality(section),
          extraction_method: 'regulatory_section'
        }
      }));
  }

  // Helper methods
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first

    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    try {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8000), // OpenAI limit
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      // Cache the result
      this.embeddingCache.set(cacheKey, embedding);

      return embedding;
    } catch (error) {
      // console.error('Error generating embedding:', error);
      throw error;
    }
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    for (let _i = 0; i < a.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      dotProduct += a[i] * b[i];
      // eslint-disable-next-line security/detect-object-injection
      normA += a[i] * a[i];
      // eslint-disable-next-line security/detect-object-injection
      normB += b[i] * b[i];
    }

    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  private determineRetrievalStrategy(query: RetrievalQuery): string {
    if (query.options?.hybrid_search === false) {
      return 'vector_only';
    }

    // Use hybrid search for most queries
    return 'hybrid';
  }

  private applyFilters(dbQuery: unknown, filters: RetrievalFilters): unknown {
    if (filters.domain && filters.domain.length > 0) {
      dbQuery = dbQuery.in('knowledge_documents.domain', filters.domain);
    }

    if (filters.evidence_level && filters.evidence_level.length > 0) {
      dbQuery = dbQuery.in('knowledge_documents.metadata->>evidence_level', filters.evidence_level);
    }

    if (filters.medical_specialty && filters.medical_specialty.length > 0) {
      dbQuery = dbQuery.in('knowledge_documents.metadata->>medical_specialty', filters.medical_specialty);
    }

    if (filters.validation_status && filters.validation_status.length > 0) {
      dbQuery = dbQuery.in('knowledge_documents.metadata->>validation_status', filters.validation_status);
    }

    if (filters.date_range) {
      if (filters.date_range.start) {
        dbQuery = dbQuery.gte('knowledge_documents.created_at', filters.date_range.start);
      }
      if (filters.date_range.end) {
        dbQuery = dbQuery.lte('knowledge_documents.created_at', filters.date_range.end);
      }
    }

    return dbQuery;
  }

  private combineScores(vectorScore: number, rerankScore: number): number {
    // Weighted combination: 60% vector similarity, 40% rerank score
    return (vectorScore * 0.6) + (rerankScore * 0.4);
  }

  private calculateChunkQuality(content: string): number {

    // Longer chunks are generally better (up to a point)

    if (wordCount > 50 && wordCount < 500) {
      score += 0.2;
    }

    // Presence of medical/technical terms

      content.toLowerCase().includes(term)
    ).length;
    score += Math.min(medicalTermCount * 0.05, 0.3);

    // Presence of references or citations
    if (content.includes('(') && content.includes(')') || content.includes('[') && content.includes(']')) {
      score += 0.1;
    }

    // Avoid chunks that are mostly metadata or formatting
    if (content.includes('Page') || content.includes('Table') || content.includes('Figure')) {
      score -= 0.2;
    }

    return Math.max(0.1, Math.min(1.0, score));
  }

  private hashText(text: string): string {
    // Simple hash function for caching

    for (let _i = 0; i < text.length; i++) {

      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private createContentHash(content: string): string {
    // Create hash for deduplication

    return this.hashText(normalized);
  }

  private extractSectionHeader(content: string): string {

    // If first line looks like a header, return it
    if (firstLine.length < 100 && (
      /^\d+\./.test(firstLine) ||
      firstLine === firstLine.toUpperCase() ||
      firstLine.endsWith(':')
    )) {
      return firstLine;
    }

    return 'Content';
  }

  private extractSections(content: string, patterns: RegExp[]): Array<{title: string, content: string}> {
    const sections: Array<{title: string, content: string}> = [];

    // Simple section extraction - in production, use more sophisticated parsing

    for (const line of lines) {

      // Check if line matches any section pattern

      if (matchedPattern && trimmedLine.length < 100) {
        // Save current section
        if (currentSection.content.trim().length > 0) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: trimmedLine,
          content: ''
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    // Add final section
    if (currentSection.content.trim().length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  private extractSectionNumber(content: string): string {

    return match ? match[1] : 'Section';
  }
}

export default EnhancedRAGSystem;