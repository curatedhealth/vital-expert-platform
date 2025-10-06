import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';
import { Document } from 'langchain/document';
import { createClient } from '@supabase/supabase-js';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseRetriever } from '@langchain/core/retrievers';
import { VectorStore } from '@langchain/core/vectorstores';
import {
  calculateFileHash,
  extractMetadataFromContent,
  areDocumentsDuplicate,
  type DocumentMetadata
} from '@/lib/document-utils';

// Import advanced retrievers
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';

// Import BM25 for hybrid search
import natural from 'natural';
const { TfIdf } = natural;

// Import Cohere for re-ranking
import { CohereClient } from 'cohere-ai';

// Import structured output parsers
import {
  RegulatoryAnalysisParser,
  ClinicalTrialDesignParser,
  MarketAccessStrategyParser,
  LiteratureReviewParser,
  RiskAssessmentParser,
  CompetitiveAnalysisParser,
  parseWithAutoFix,
  type RegulatoryAnalysis,
  type ClinicalTrialDesign,
  type MarketAccessStrategy,
  type LiteratureReview,
  type RiskAssessment,
  type CompetitiveAnalysis,
} from '@/features/chat/parsers/structured-output';

// Import long-term memory
import {
  LongTermMemory,
  createAutoLearningMemory,
  type UserFact,
} from '@/features/chat/memory/long-term-memory';

// Import tools
import {
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
} from '@/features/chat/tools/fda-tools';

import {
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointsTool,
} from '@/features/chat/tools/clinical-trials-tools';

import {
  tavilySearchTool,
  wikipediaTool,
  arxivTool,
  pubmedTool,
} from '@/features/chat/tools/external-api-tools';

import { DynamicStructuredTool } from '@langchain/core/tools';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';

// Import LangGraph
import { StateGraph, END } from '@langchain/langgraph';
import { RunnableConfig } from '@langchain/core/runnables';

// Import LangSmith
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { LLMResult } from '@langchain/core/outputs';

// Import Agent Tool Loader
import { agentToolLoader } from './agent-tool-loader';

// Token Tracking Callback for LangSmith
class TokenTrackingCallback extends BaseCallbackHandler {
  name = 'token_tracking_callback';

  private userId: string;
  private sessionId: string;
  private totalTokens: number = 0;
  private totalCost: number = 0;

  constructor(userId: string, sessionId: string) {
    super();
    this.userId = userId;
    this.sessionId = sessionId;
  }

  async handleLLMEnd(output: LLMResult): Promise<void> {
    const tokenUsage = output.llmOutput?.tokenUsage;

    if (tokenUsage) {
      const promptTokens = tokenUsage.promptTokens || 0;
      const completionTokens = tokenUsage.completionTokens || 0;
      const totalTokens = tokenUsage.totalTokens || (promptTokens + completionTokens);

      // Calculate cost (OpenAI GPT-3.5-turbo pricing)
      const cost = (promptTokens * 0.0015 + completionTokens * 0.002) / 1000;

      this.totalTokens += totalTokens;
      this.totalCost += cost;

      console.log(`🔢 Token usage: ${promptTokens} prompt + ${completionTokens} completion = ${totalTokens} total ($${cost.toFixed(4)})`);

      // Log to database
      try {
        await supabase.from('token_usage').insert({
          user_id: this.userId,
          session_id: this.sessionId,
          model: 'gpt-3.5-turbo',
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
          estimated_cost: cost,
          request_type: 'chat',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to log token usage:', error);
      }
    }
  }

  getTotalUsage() {
    return {
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
    };
  }
}

// RAG Fusion Retriever Implementation
class RAGFusionRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers', 'rag_fusion'];

  private vectorStore: VectorStore;
  private llm: ChatOpenAI;
  private k: number;

  constructor(vectorStore: VectorStore, llm: ChatOpenAI, k: number = 6) {
    super();
    this.vectorStore = vectorStore;
    this.llm = llm;
    this.k = k;
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    // Generate query variations
    const queryVariations = await this.generateQueryVariations(query);

    // Perform parallel searches
    const allResults = await Promise.all(
      queryVariations.map(q => this.vectorStore.similaritySearchWithScore(q, 5))
    );

    // Apply Reciprocal Rank Fusion
    return this.reciprocalRankFusion(allResults);
  }

  private async generateQueryVariations(query: string): Promise<string[]> {
    const prompt = `Generate 3 different search queries that capture various aspects of this question:

Original Question: "${query}"

Requirements:
- Each query should focus on a different aspect or perspective
- Keep queries focused and specific
- Return only the queries, one per line

Queries:`;

    const result = await this.llm.invoke(prompt);
    const variations = (result.content as string)
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3);

    return [query, ...variations];
  }

  private reciprocalRankFusion(results: Array<Array<[Document, number]>>): Document[] {
    const k = 60; // RRF constant
    const docScores = new Map<string, { doc: Document; score: number }>();

    results.forEach((queryResults) => {
      queryResults.forEach(([doc, _], rank) => {
        const docId = doc.metadata.id || doc.pageContent.substring(0, 100);
        const rrfScore = 1 / (k + rank + 1);

        if (docScores.has(docId)) {
          const existing = docScores.get(docId)!;
          existing.score += rrfScore;
        } else {
          docScores.set(docId, { doc, score: rrfScore });
        }
      });
    });

    return Array.from(docScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, this.k)
      .map(item => item.doc);
  }
}

// Hybrid Search Retriever (Vector + BM25)
class HybridSearchRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers', 'hybrid_search'];

  private vectorStore: VectorStore;
  private documents: Document[];
  private tfidf: any;
  private k: number;
  private vectorWeight: number;
  private bm25Weight: number;

  constructor(
    vectorStore: VectorStore,
    documents: Document[],
    k: number = 6,
    vectorWeight: number = 0.6,
    bm25Weight: number = 0.4
  ) {
    super();
    this.vectorStore = vectorStore;
    this.documents = documents;
    this.k = k;
    this.vectorWeight = vectorWeight;
    this.bm25Weight = bm25Weight;

    // Initialize TF-IDF for BM25-like search
    this.tfidf = new TfIdf();
    documents.forEach(doc => {
      this.tfidf.addDocument(doc.pageContent);
    });
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    // 1. Vector search
    const vectorResults = await this.vectorStore.similaritySearchWithScore(query, this.k * 2);

    // 2. BM25 keyword search
    const bm25Results = this.bm25Search(query, this.k * 2);

    // 3. Combine scores using weighted fusion
    const combinedScores = this.weightedFusion(vectorResults, bm25Results);

    // 4. Return top k documents
    return combinedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, this.k)
      .map(item => item.doc);
  }

  private bm25Search(query: string, k: number): Array<{ doc: Document; score: number }> {
    const scores: Array<{ doc: Document; score: number; index: number }> = [];

    this.tfidf.tfidfs(query, (i: number, measure: number) => {
      if (i < this.documents.length) {
        scores.push({
          doc: this.documents[i],
          score: measure,
          index: i
        });
      }
    });

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ doc, score }) => ({ doc, score }));
  }

  private weightedFusion(
    vectorResults: Array<[Document, number]>,
    bm25Results: Array<{ doc: Document; score: number }>
  ): Array<{ doc: Document; score: number }> {
    const docScores = new Map<string, { doc: Document; score: number }>();

    // Normalize and add vector scores
    const maxVectorScore = Math.max(...vectorResults.map(([_, score]) => score), 1);
    vectorResults.forEach(([doc, score]) => {
      const docId = doc.metadata.id || doc.pageContent.substring(0, 100);
      const normalizedScore = (score / maxVectorScore) * this.vectorWeight;
      docScores.set(docId, { doc, score: normalizedScore });
    });

    // Normalize and add BM25 scores
    const maxBM25Score = Math.max(...bm25Results.map(r => r.score), 1);
    bm25Results.forEach(({ doc, score }) => {
      const docId = doc.metadata.id || doc.pageContent.substring(0, 100);
      const normalizedScore = (score / maxBM25Score) * this.bm25Weight;

      if (docScores.has(docId)) {
        const existing = docScores.get(docId)!;
        existing.score += normalizedScore;
      } else {
        docScores.set(docId, { doc, score: normalizedScore });
      }
    });

    return Array.from(docScores.values());
  }
}

// Cohere Re-ranking Retriever
class CohereRerankRetriever extends BaseRetriever {
  lc_namespace = ['langchain', 'retrievers', 'cohere_rerank'];

  private baseRetriever: BaseRetriever;
  private cohereClient: CohereClient | null = null;
  private topN: number;
  private enabled: boolean = false;

  constructor(baseRetriever: BaseRetriever, topN: number = 5) {
    super();
    this.baseRetriever = baseRetriever;
    this.topN = topN;

    // Initialize Cohere client if API key is available
    if (process.env.COHERE_API_KEY) {
      this.cohereClient = new CohereClient({
        token: process.env.COHERE_API_KEY,
      });
      this.enabled = true;
      console.log('✅ Cohere re-ranking enabled');
    } else {
      console.log('⚠️ Cohere re-ranking disabled (no API key)');
    }
  }

  async _getRelevantDocuments(query: string): Promise<Document[]> {
    // Get initial results from base retriever
    const docs = await this.baseRetriever.invoke(query);

    // If Cohere is not enabled, return base results
    if (!this.enabled || !this.cohereClient) {
      return docs;
    }

    try {
      // Re-rank with Cohere
      const reranked = await this.cohereClient.rerank({
        query,
        documents: docs.map(doc => doc.pageContent),
        topN: Math.min(this.topN, docs.length),
        model: 'rerank-english-v3.0',
      });

      // Return re-ranked documents
      return reranked.results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .map(result => docs[result.index]);
    } catch (error) {
      console.error('Cohere re-ranking failed, falling back to base results:', error);
      return docs.slice(0, this.topN);
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-ada-002',
});

export class LangChainRAGService {
  private vectorStore: SupabaseVectorStore;
  private textSplitter: RecursiveCharacterTextSplitter;
  private llm: ChatOpenAI;

  constructor() {
    this.vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'rag_knowledge_chunks',
      // Don't specify queryName - let LangChain use its own similaritySearchVectorWithScore
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, // Increased chunk size to reduce total chunks
      chunkOverlap: 300, // Reasonable overlap to maintain context
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });
  }

  async processDocuments(files: File[], metadata: {
    agentId?: string;
    isGlobal: boolean;
    domain: string;
  }): Promise<{
    success: boolean;
    results: Array<{
      fileName: string;
      chunksProcessed: number;
      status: 'success' | 'error' | 'duplicate' | 'skipped';
      error?: string;
      estimatedTime?: string;
      duplicateReason?: string;
      extractedMetadata?: Partial<DocumentMetadata>;
    }>;
  }> {
    const results = [];

    // First pass: Check for duplicates by calculating hashes
    console.log('🔍 Checking for duplicate documents...');
    const fileHashes = new Map<string, string>();
    const duplicateChecks = [];

    for (const file of files) {
      try {
        const hash = await calculateFileHash(file);
        fileHashes.set(file.name, hash);

        // Check against existing documents in database
        const { data: existingDocs, error } = await supabase
          .from('rag_knowledge_sources')
          .select('name, file_size, content_hash, title')
          .or(`content_hash.eq.${hash},name.eq.${file.name}`);

        if (!error && existingDocs && existingDocs.length > 0) {
          for (const existingDoc of existingDocs) {
            const duplicateCheck = areDocumentsDuplicate(
              { hash, name: file.name, size: file.size },
              {
                hash: existingDoc.content_hash || '',
                name: existingDoc.name,
                size: existingDoc.file_size,
                title: existingDoc.title
              }
            );

            if (duplicateCheck.isDuplicate) {
              duplicateChecks.push({ file, reason: duplicateCheck.reason });
              break;
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check duplicates for ${file.name}:`, error);
      }
    }

    // Process each file
    for (const file of files) {
      const startTime = Date.now();
      const hash = fileHashes.get(file.name) || '';

      // Check if this file was marked as duplicate
      const duplicateCheck = duplicateChecks.find(check => check.file.name === file.name);
      if (duplicateCheck) {
        console.log(`⚠️ Skipping duplicate: ${file.name} (${duplicateCheck.reason})`);
        results.push({
          fileName: file.name,
          chunksProcessed: 0,
          status: 'duplicate' as const,
          duplicateReason: duplicateCheck.reason,
          estimatedTime: '0ms',
        });
        continue;
      }

      try {
        console.log(`🔄 Processing ${file.name} with enhanced metadata extraction...`);

        // Estimate processing time based on file size
        const estimatedChunks = Math.ceil(file.size / 2000);
        const estimatedTimeMs = estimatedChunks * 300;
        const estimatedTimeStr = estimatedTimeMs > 10000
          ? `${Math.round(estimatedTimeMs / 1000)}s`
          : `${estimatedTimeMs}ms`;

        console.log(`📊 Estimated processing time: ${estimatedTimeStr} (${estimatedChunks} chunks)`);

        // Load document content
        const documents = await this.loadDocument(file);

        // Extract comprehensive metadata from content
        const fullContent = documents.map(doc => doc.pageContent).join('\n\n');
        const extractedMetadata = extractMetadataFromContent(fullContent, file.name);

        console.log(`📋 Extracted metadata for ${file.name}:`, {
          title: extractedMetadata.title,
          documentType: extractedMetadata.documentType,
          researchType: extractedMetadata.researchType,
          topics: extractedMetadata.topics?.slice(0, 3),
          author: extractedMetadata.author,
          publishedDate: extractedMetadata.publishedDate,
          doi: extractedMetadata.doi,
        });

        // Enhanced document metadata
        const enhancedMetadata = {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileHash: hash,
          domain: metadata.domain,
          agentId: metadata.agentId,
          isGlobal: metadata.isGlobal,
          uploadedAt: new Date().toISOString(),
          ...extractedMetadata,
        };

        // Add metadata to each document
        const documentsWithMetadata = documents.map(doc => {
          return new Document({
            pageContent: doc.pageContent,
            metadata: {
              ...doc.metadata,
              ...enhancedMetadata,
            },
          });
        });

        // Split documents into chunks
        const chunks = await this.textSplitter.splitDocuments(documentsWithMetadata);

        console.log(`✂️ Split ${file.name} into ${chunks.length} chunks`);

        // Store metadata in knowledge_sources table first
        const knowledgeSource = await this.createKnowledgeSourceWithMetadata({
          ...enhancedMetadata,
          chunksProcessed: chunks.length,
        });

        // Store in vector database manually
        await this.storeChunksManually(chunks, metadata, knowledgeSource.id);

        const processingTime = Date.now() - startTime;
        const processingTimeStr = processingTime > 1000
          ? `${(processingTime / 1000).toFixed(1)}s`
          : `${processingTime}ms`;

        console.log(`✅ Completed ${file.name} in ${processingTimeStr}`);

        results.push({
          fileName: file.name,
          chunksProcessed: chunks.length,
          status: 'success' as const,
          estimatedTime: processingTimeStr,
          extractedMetadata,
        });

      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        const processingTime = Date.now() - startTime;
        const processingTimeStr = processingTime > 1000
          ? `${(processingTime / 1000).toFixed(1)}s`
          : `${processingTime}ms`;

        results.push({
          fileName: file.name,
          chunksProcessed: 0,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          estimatedTime: processingTimeStr,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const duplicateCount = results.filter(r => r.status === 'duplicate').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`📊 Processing summary: ${successCount} processed, ${duplicateCount} duplicates skipped, ${errorCount} errors`);

    return {
      success: results.some(r => r.status === 'success'),
      results,
    };
  }

  private async loadDocument(file: File): Promise<Document[]> {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        // Create a Blob from the file for WebPDFLoader
        const blob = new Blob([file], { type: 'application/pdf' });
        const loader = new WebPDFLoader(blob);
        const documents = await loader.load();

        console.log(`LangChain PDF loaded: ${documents.length} pages`);
        return documents;
      } catch (error) {
        console.error('LangChain PDF loading failed:', error);
        // Fallback: create a document with metadata
        return [
          new Document({
            pageContent: `PDF Document: ${file.name}\nSize: ${file.size} bytes\nUploaded: ${new Date().toISOString()}\n\n[PDF content could not be extracted with LangChain - file processed as metadata only]`,
            metadata: {
              source: file.name,
              type: 'pdf',
              size: file.size,
            },
          }),
        ];
      }
    } else if (
      file.type.startsWith('text/') ||
      file.type === 'application/json' ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt')
    ) {
      // Handle text files
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return [
        new Document({
          pageContent: text,
          metadata: {
            source: file.name,
            type: 'text',
          },
        }),
      ];
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private async storeChunksManually(chunks: Document[], metadata: {
    agentId?: string;
    isGlobal: boolean;
    domain: string;
  }, knowledgeSourceId: string) {
    console.log(`Storing ${chunks.length} chunks manually with batch processing...`);

    const BATCH_SIZE = 10; // Process 10 chunks at a time for optimal performance
    const batches = [];

    // Split chunks into batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      batches.push(chunks.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} chunks each...`);

    let totalProcessed = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} chunks)`);

      try {
        // Generate embeddings for all chunks in the batch concurrently
        const embeddingPromises = batch.map(chunk =>
          embeddings.embedQuery(chunk.pageContent)
        );

        const batchEmbeddings = await Promise.all(embeddingPromises);

        // Prepare all chunk data for the batch
        const batchData = batch.map((chunk, index) => ({
          source_id: knowledgeSourceId,
          content: chunk.pageContent,
          content_type: 'text',
          chunk_index: totalProcessed + index,
          embedding: batchEmbeddings[index],
          word_count: chunk.pageContent.split(/\s+/).length,
          medical_context: {},
          regulatory_context: {},
        }));

        // Insert the entire batch at once
        const { error } = await supabase
          .from('rag_knowledge_chunks')
          .insert(batchData);

        if (error) {
          console.error(`Error inserting batch ${batchIndex + 1}:`, error);
          throw error;
        }

        totalProcessed += batch.length;
        console.log(`✅ Batch ${batchIndex + 1} complete: ${totalProcessed}/${chunks.length} chunks processed`);

      } catch (error) {
        console.error(`Failed to process batch ${batchIndex + 1}:`, error);
        throw error;
      }
    }

    console.log(`✅ Successfully stored all ${chunks.length} chunks using batch processing`);
  }

  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateChunkQuality(content: string): number {
    let score = 1.0;

    if (content.length < 100) score -= 0.3;

    const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
    if (specialCharRatio > 0.3) score -= 0.2;

    const sentenceCount = (content.match(/[.!?]+/g) || []).length;
    if (sentenceCount > 2) score += 0.1;

    return Math.max(0.1, Math.min(1.0, score));
  }

  private async createKnowledgeSource(fileInfo: {
    title: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    domain: string;
    agentId?: string;
    isGlobal: boolean;
    chunksProcessed: number;
  }) {
    const insertData = {
      name: fileInfo.title,
      source_type: 'uploaded_file',
      file_path: fileInfo.fileName,
      file_size: fileInfo.fileSize,
      mime_type: fileInfo.mimeType,
      title: fileInfo.title,
      description: `LangChain processed file: ${fileInfo.fileName}${fileInfo.agentId ? ` for agent: ${fileInfo.agentId}` : ''}`,
      domain: fileInfo.domain,
      category: 'uploaded_document',
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
      is_public: fileInfo.isGlobal,
      access_level: fileInfo.isGlobal ? 'public' : 'agent-specific',
    };

    const { data, error } = await supabase
      .from('rag_knowledge_sources')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create knowledge source: ${error.message}`);
    }

    return data;
  }

  private async createKnowledgeSourceWithMetadata(metadata: any) {
    // Get default tenant ID
    const { data: tenant } = await supabase
      .from('rag_tenants')
      .select('id')
      .eq('domain', 'default.vitalpath.com')
      .single();

    if (!tenant) {
      throw new Error('Default tenant not found');
    }

    // Map UI domain values to database enum values
    const domainMap: Record<string, string> = {
      'regulatory': 'regulatory_compliance',
      'digital-health': 'digital_health',
      'clinical': 'clinical_research',
      'market-access': 'market_access',
      'commercial': 'commercial_strategy',
      'methodology': 'methodology_frameworks',
      'technology': 'technology_platforms',
    };

    const mappedDomain = domainMap[metadata.domain] || metadata.domain || 'medical_affairs';

    const insertData = {
      tenant_id: tenant.id,
      name: metadata.title || metadata.fileName,
      title: metadata.title || metadata.fileName.replace(/\.[^/.]+$/, ""),
      description: this.generateDescription(metadata),
      source_type: 'uploaded_file',
      file_path: metadata.fileName,
      file_size: metadata.fileSize,
      content_hash: metadata.fileHash,
      mime_type: metadata.mimeType,
      domain: mappedDomain,
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
      tags: metadata.topics || [],
      metadata: {
        isGlobal: metadata.isGlobal,
        author: metadata.author,
        publishedDate: metadata.publishedDate,
      },
    };

    const { data, error } = await supabase
      .from('rag_knowledge_sources')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create enhanced knowledge source: ${error.message}`);
    }

    return data;
  }

  private generateDescription(metadata: any): string {
    const parts = [];

    if (metadata.documentType) {
      parts.push(metadata.documentType.replace('-', ' '));
    }

    if (metadata.researchType) {
      parts.push(`(${metadata.researchType.replace('-', ' ')})`);
    }

    if (metadata.author) {
      parts.push(`by ${metadata.author}`);
    }

    if (metadata.publishedDate) {
      parts.push(`published ${metadata.publishedDate}`);
    }

    if (metadata.journal) {
      parts.push(`in ${metadata.journal}`);
    }

    if (metadata.topics && metadata.topics.length > 0) {
      parts.push(`covering ${metadata.topics.slice(0, 3).join(', ')}`);
    }

    const description = parts.join(' ');
    return description || `Document: ${metadata.fileName}`;
  }

  private parseValidDate(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    // Remove common non-date text that might be extracted incorrectly
    const cleanedDate = dateString.trim();

    // Skip obvious non-dates
    if (cleanedDate.toLowerCase().includes('room') ||
        cleanedDate.length < 4 ||
        cleanedDate.length > 50 ||
        /^[A-Za-z\s]+$/.test(cleanedDate)) {
      return null;
    }

    try {
      // Try to parse as various date formats
      const date = new Date(cleanedDate);

      // Check if it's a valid date and not too far in the future or past
      if (isNaN(date.getTime())) {
        return null;
      }

      const currentYear = new Date().getFullYear();
      const year = date.getFullYear();

      // Reasonable date range for documents (1900 to current year + 5)
      if (year < 1900 || year > currentYear + 5) {
        return null;
      }

      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      return null;
    }
  }

  /**
   * Get available tools for agent based on agent ID (loads from database)
   * Falls back to agent type-based tools if no database tools found
   */
  async getToolsForAgent(agentId: string, agentType?: string): Promise<DynamicStructuredTool[]> {
    try {
      // Try to load tools from database based on agent ID
      console.log(`[LangChain Service] Loading tools for agent: ${agentId}`);
      const dbTools = await agentToolLoader.loadToolsForAgent(agentId);

      if (dbTools.length > 0) {
        console.log(`✅ Loaded ${dbTools.length} tool(s) from database for agent ${agentId}`);
        return dbTools as DynamicStructuredTool[];
      }

      // Fallback: Use default tools if no database tools assigned
      console.log(`⚠️  No database tools found for agent ${agentId}, using fallback tools`);

    } catch (error) {
      console.error('[LangChain Service] Error loading tools from database:', error);
      console.log('Using fallback tools...');
    }

    // Fallback: Default tools based on agent type
    const allTools = [
      // FDA Tools
      fdaDatabaseTool,
      fdaGuidanceTool,
      regulatoryCalculatorTool,

      // Clinical Trials Tools
      clinicalTrialsSearchTool,
      studyDesignTool,
      endpointsTool,

      // External API Tools
      tavilySearchTool,
      // wikipediaTool is disabled - agents should use Tavily for current web search
      // arxivTool and pubmedTool are database-assigned tools only
    ];

    // Filter tools based on agent type
    if (!agentType) {
      return allTools;
    }

    const agentToolMapping: Record<string, string[]> = {
      'regulatory-expert': ['fda_database_search', 'fda_guidance_lookup', 'regulatory_calculator', 'tavily_search_results_json'],
      'clinical-researcher': ['clinical_trials_search', 'study_design_advisor', 'endpoints_recommender', 'pubmed_literature_search', 'arxiv_research_search'],
      'market-access': ['tavily_search_results_json'],
      'technical-architect': ['tavily_search_results_json', 'arxiv_research_search'],
      'business-strategist': ['tavily_search_results_json'],
    };

    const allowedToolNames = agentToolMapping[agentType] || [];

    if (allowedToolNames.length === 0) {
      return allTools;
    }

    return allTools.filter(tool => allowedToolNames.includes(tool.name));
  }

  /**
   * Create advanced retriever based on strategy
   */
  async createAdvancedRetriever(
    agentId: string,
    strategy: 'multi_query' | 'compression' | 'hybrid' | 'hybrid_rerank' | 'self_query' | 'rag_fusion' | 'rag_fusion_rerank' | 'basic' = 'rag_fusion'
  ): Promise<BaseRetriever> {
    const baseRetriever = this.vectorStore.asRetriever({
      searchType: 'similarity',
      k: 6,
      filter: {
        $or: [
          { isGlobal: { $eq: true } },
          { agentId: { $eq: agentId } },
        ],
      },
    });

    switch (strategy) {
      case 'rag_fusion':
        return new RAGFusionRetriever(this.vectorStore, this.llm, 6);

      case 'rag_fusion_rerank':
        // RAG Fusion + Cohere re-ranking (best quality)
        const ragFusion = new RAGFusionRetriever(this.vectorStore, this.llm, 12);
        return new CohereRerankRetriever(ragFusion, 6);

      case 'hybrid':
        // True hybrid search: Vector + BM25
        const docs = await this.loadDocumentsForHybrid(agentId);
        return new HybridSearchRetriever(this.vectorStore, docs, 6, 0.6, 0.4);

      case 'hybrid_rerank':
        // Hybrid + Cohere re-ranking (production-grade)
        const hybridDocs = await this.loadDocumentsForHybrid(agentId);
        const hybridRetriever = new HybridSearchRetriever(this.vectorStore, hybridDocs, 12, 0.6, 0.4);
        return new CohereRerankRetriever(hybridRetriever, 6);

      case 'multi_query':
        return MultiQueryRetriever.fromLLM({
          llm: this.llm,
          retriever: baseRetriever,
          verbose: true,
        });

      case 'compression':
        const compressor = LLMChainExtractor.fromLLM(this.llm);
        return new ContextualCompressionRetriever({
          baseCompressor: compressor,
          baseRetriever: baseRetriever,
        });

      case 'basic':
      default:
        return baseRetriever;
    }
  }

  /**
   * Load documents for hybrid search BM25 index
   */
  private async loadDocumentsForHybrid(agentId: string): Promise<Document[]> {
    try {
      // Load all relevant documents from the database
      const { data, error } = await supabase
        .from('rag_knowledge_chunks')
        .select('content, metadata')
        .or(`isGlobal.eq.true,agentId.eq.${agentId}`)
        .limit(1000); // Limit for performance

      if (error) {
        console.error('Failed to load documents for hybrid search:', error);
        return [];
      }

      return (data || []).map(
        (row: any) =>
          new Document({
            pageContent: row.content,
            metadata: row.metadata || {},
          })
      );
    } catch (error) {
      console.error('Error loading documents for hybrid search:', error);
      return [];
    }
  }

  async createConversationalChain(
    agentId: string,
    systemPrompt: string,
    retrievalStrategy: 'multi_query' | 'compression' | 'hybrid' | 'hybrid_rerank' | 'self_query' | 'rag_fusion' | 'rag_fusion_rerank' | 'basic' = 'rag_fusion'
  ) {
    // Create advanced retriever based on strategy
    const retriever = await this.createAdvancedRetriever(agentId, retrievalStrategy);

    // Create custom prompt template string
    const qaPromptString = `
${systemPrompt}

Context from knowledge base:
{context}

Chat History:
{chat_history}
Human Question: {question}

Based on the context and chat history above, provide a comprehensive and accurate response. If you reference information from the context, please cite it appropriately.`;

    // Create memory for conversation history
    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
    });

    // Create the conversational chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
      this.llm,
      retriever,
      {
        memory,
        qaTemplate: qaPromptString,
        returnSourceDocuments: true,
      }
    );

    return chain;
  }

  async queryKnowledge(
    query: string,
    agentId: string,
    chatHistory: any[] = [],
    agent?: any,
    sessionId?: string,
    options?: {
      retrievalStrategy?: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion' | 'basic';
      enableLearning?: boolean;
    }
  ): Promise<{
    answer: string;
    sources: any[];
    citations: string[];
    intermediateSteps?: any[];
    toolExecutions?: any[];
    metadata?: any;
  }> {
    try {
      console.log(`🔍 Searching for knowledge with embedding for agent: ${agentId}`);
      console.log(`🎯 Agent knowledge domains: ${JSON.stringify(agent?.knowledge_domains || agent?.knowledgeDomains)}`);
      console.log(`🚀 Using retrieval strategy: ${options?.retrievalStrategy || 'rag_fusion'}`);

      // Initialize long-term memory if sessionId is provided
      let longTermContext = '';
      let autoLearning: ReturnType<typeof createAutoLearningMemory> | null = null;

      if (sessionId && options?.enableLearning !== false) {
        try {
          // Extract user ID from sessionId or use a default
          const userId = sessionId.split('-')[0] || 'anonymous';
          autoLearning = createAutoLearningMemory(userId, true);

          // Get personalized context from long-term memory
          const enhancedContext = await autoLearning.getEnhancedContext(query);
          longTermContext = `

User Context from Long-Term Memory:
${enhancedContext.contextSummary}

Recent Projects: ${enhancedContext.activeProjects.map((p: any) => p.name).join(', ') || 'None'}
Active Goals: ${enhancedContext.activeGoals.map((g: any) => g.title).join(', ') || 'None'}
`;
          console.log(`🧠 Long-term memory context added (${enhancedContext.relevantFacts.length} facts)`);
        } catch (memoryError) {
          console.warn('Failed to load long-term memory:', memoryError);
        }
      }

      // Create advanced retriever
      const retriever = await this.createAdvancedRetriever(
        agentId,
        options?.retrievalStrategy || 'rag_fusion'
      );

      // Use advanced retriever for search
      const retrievedDocs = await retriever.getRelevantDocuments(query);

      // Convert to search results format
      const searchResults: Array<[Document, number]> = retrievedDocs.map((doc, index) => [
        doc,
        0.9 - (index * 0.1) // Simulated similarity scores
      ]);

      let ragContext = '';
      let sources: any[] = [];

      if (searchResults && searchResults.length > 0) {
        console.log(`✅ Found ${searchResults.length} relevant chunks from LangChain vectorStore`);

        // Filter by agent's knowledge domains if specified
        let filteredResults = searchResults;
        if (agent?.knowledge_domains || agent?.knowledgeDomains) {
          const domains = agent.knowledge_domains || agent.knowledgeDomains;
          filteredResults = searchResults.filter(([doc]) => {
            const docDomain = doc.metadata?.domain;
            return domains.includes(docDomain);
          });
          console.log(`📊 Filtered to ${filteredResults.length} chunks matching agent domains`);
        }

        // If no results after filtering, use all results
        if (filteredResults.length === 0) {
          console.log(`⚠️  No chunks matched agent domains, using all results`);
          filteredResults = searchResults;
        }

        ragContext = filteredResults.map(([doc]) => doc.pageContent).join('\n\n');
        sources = filteredResults.map(([doc, score], index) => ({
          id: doc.metadata?.id || index,
          content: doc.pageContent,
          title: doc.metadata?.source_name || doc.metadata?.title || 'Document Chunk',
          excerpt: doc.pageContent.substring(0, 200) + '...',
          similarity: score,
          citation: `[${index + 1}]`,
          domain: doc.metadata?.domain,
          source_id: doc.metadata?.source_id
        }));

        console.log(`📚 Using ${sources.length} sources for RAG context`);
      } else {
        console.log('⚠️  No relevant chunks found, using basic LLM response');
      }

      // Prepare enhanced prompt with RAG context
      const chatHistoryStr = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Build system prompt with agent context
      let systemPrompt = '';
      if (agent?.systemPrompt) {
        systemPrompt = agent.systemPrompt + '\n\n';
      }

      let prompt = `${systemPrompt}${longTermContext}

Chat History:
${chatHistoryStr}

Human Question: ${query}`;

      if (ragContext) {
        // Create numbered source references for the AI
        const sourceReferences = sources.map((source, index) =>
          `[${index + 1}] ${source.title}`
        ).join('\n');

        prompt += `

IMPORTANT: You have access to the following knowledge base sources. You MUST cite these sources inline using the format [1], [2], etc. when you reference information from them.

Available Sources:
${sourceReferences}

Knowledge Base Content:
${ragContext}

INSTRUCTIONS:
- Answer the user's question comprehensively using the knowledge base context above
- ALWAYS add inline citations [1], [2], [3] immediately after statements that come from the sources
- Example: "Clinical trials showed 85% efficacy in treating anxiety [1]. The FDA approval was granted in 2023 [2]."
- You MUST use citations throughout your response, not just at the end
- If information comes from multiple sources, cite all relevant sources like [1][2]
- Only use information from the sources provided above when citing`;
      } else {
        prompt += `

Please provide a comprehensive and accurate response based on your knowledge as a ${agent?.name || 'specialist'}.`;
      }

      console.log('Invoking LangChain LLM with prompt length:', prompt.length);

      // Create token tracking callback
      const userId = sessionId?.split('-')[0] || 'anonymous';
      const tokenCallback = new TokenTrackingCallback(userId, sessionId || 'no-session');

      // Try to use tools if agent has tools assigned
      let answer: string;
      let tokenUsage: any;
      let intermediateSteps: any[] = [];
      let toolExecutions: any[] = [];
      let toolSources: any[] = [];

      try {
        // Check if agent has tools assigned
        const tools = await this.getToolsForAgent(agentId, agent?.type || agent?.agentType);

        if (tools.length > 0) {
          console.log(`🔧 Agent has ${tools.length} tools, using agent executor`);

          // Use executeAgentWithTools for tool-enabled responses
          const agentResult = await this.executeAgentWithTools(
            query,
            agentId,
            agent?.type || agent?.agentType || 'general',
            chatHistory,
            prompt,
            {
              maxIterations: 15,
              enableRAG: false, // RAG context already retrieved above
            }
          );

          answer = agentResult.output;
          intermediateSteps = agentResult.intermediateSteps || [];
          toolExecutions = agentResult.toolExecutions || [];
          toolSources = agentResult.sources || [];
          tokenUsage = tokenCallback.getTotalUsage(); // Tools track their own usage
        } else {
          console.log('📝 No tools assigned, using direct LLM response');

          // Invoke LangChain LLM with callback for token tracking
          const result = await this.llm.invoke(prompt, {
            callbacks: [tokenCallback],
          });
          answer = result.content as string;
          tokenUsage = tokenCallback.getTotalUsage();
        }
      } catch (toolError) {
        console.warn('⚠️  Tool execution failed, falling back to direct LLM:', toolError);

        // Fallback to direct LLM
        const result = await this.llm.invoke(prompt, {
          callbacks: [tokenCallback],
        });
        answer = result.content as string;
        tokenUsage = tokenCallback.getTotalUsage();
      }

      console.log(`LangChain LLM returned response, length: ${answer.length}, tokens: ${tokenUsage.totalTokens}, cost: $${tokenUsage.totalCost.toFixed(4)}`);

      // Auto-learn from conversation if enabled
      if (autoLearning && query && answer) {
        try {
          const extractedFacts = await autoLearning.extractFactsFromConversation(query, answer);
          console.log(`📚 Auto-learned ${extractedFacts.length} new facts from conversation`);
        } catch (learningError) {
          console.warn('Failed to auto-learn from conversation:', learningError);
        }
      }

      // Merge tool sources with RAG sources
      const allSources = [...toolSources, ...sources];

      return {
        answer,
        sources: allSources,
        citations: this.extractCitations(answer, allSources),
        intermediateSteps,
        toolExecutions,
        metadata: {
          longTermMemoryUsed: !!autoLearning,
          retrievalStrategy: options?.retrievalStrategy || 'rag_fusion',
          tokenUsage: tokenUsage,
          toolSourcesCount: toolSources.length,
          ragSourcesCount: sources.length,
        },
      };

    } catch (error) {
      console.error('Database query error:', error);
      // Fallback to basic LLM response if RAG fails
      try {
        const chatHistoryStr = chatHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');

        let fallbackSystemPrompt = '';
        if (agent?.systemPrompt) {
          fallbackSystemPrompt = agent.systemPrompt + '\n\n';
        }

        const fallbackPrompt = `${fallbackSystemPrompt}Chat History:
${chatHistoryStr}

Human Question: ${query}

Please provide a comprehensive and accurate response based on your knowledge as a ${agent?.name || 'specialist'}.`;

          console.log('Invoking LangChain LLM fallback with prompt length:', fallbackPrompt.length);

        // Invoke LangChain LLM for fallback
        const fallbackResult = await this.llm.invoke(fallbackPrompt);
        const answer = fallbackResult.content as string;

        console.log('LangChain LLM fallback returned response, length:', answer.length);
        // const response = await this.llm.invoke(fallbackPrompt);
        // console.log('LangChain LLM fallback response received:', response?.content ? 'Success' : 'Empty');
        // const answer = response.content as string;

        return {
          answer,
          sources: [],
          citations: [],
        };
      } catch (fallbackError) {
        console.error('LangChain knowledge query error:', fallbackError);
        throw fallbackError;
      }
    }
  }

  private extractCitations(response: string, sources: any[]): string[] {
    const citations: string[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const citationNum = parseInt(match[1]);
      if (citationNum <= sources.length && !citations.includes(match[0])) {
        citations.push(match[0]);
      }
    }

    return citations;
  }

  /**
   * Query knowledge with structured output parsing
   */
  async queryKnowledgeWithStructuredOutput<T>(
    query: string,
    agentId: string,
    chatHistory: any[] = [],
    agent?: any,
    sessionId?: string,
    outputFormat?: 'regulatory' | 'clinical' | 'market_access' | 'literature' | 'risk' | 'competitive',
    options?: {
      retrievalStrategy?: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion' | 'basic';
      enableLearning?: boolean;
    }
  ): Promise<{
    answer: string;
    sources: any[];
    citations: string[];
    parsedOutput?: T;
    metadata?: any;
  }> {
    // First get the regular response
    const result = await this.queryKnowledge(query, agentId, chatHistory, agent, sessionId, options);

    // If output format is specified, parse the response
    if (outputFormat && result.answer) {
      try {
        let parsedOutput: T | undefined;

        switch (outputFormat) {
          case 'regulatory':
            parsedOutput = await parseWithAutoFix<RegulatoryAnalysis>(
              result.answer,
              RegulatoryAnalysisParser,
              this.llm
            ) as T;
            break;

          case 'clinical':
            parsedOutput = await parseWithAutoFix<ClinicalTrialDesign>(
              result.answer,
              ClinicalTrialDesignParser,
              this.llm
            ) as T;
            break;

          case 'market_access':
            parsedOutput = await parseWithAutoFix<MarketAccessStrategy>(
              result.answer,
              MarketAccessStrategyParser,
              this.llm
            ) as T;
            break;

          case 'literature':
            parsedOutput = await parseWithAutoFix<LiteratureReview>(
              result.answer,
              LiteratureReviewParser,
              this.llm
            ) as T;
            break;

          case 'risk':
            parsedOutput = await parseWithAutoFix<RiskAssessment>(
              result.answer,
              RiskAssessmentParser,
              this.llm
            ) as T;
            break;

          case 'competitive':
            parsedOutput = await parseWithAutoFix<CompetitiveAnalysis>(
              result.answer,
              CompetitiveAnalysisParser,
              this.llm
            ) as T;
            break;
        }

        return {
          ...result,
          parsedOutput,
          metadata: {
            ...result.metadata,
            outputFormat,
            parsed: !!parsedOutput,
          },
        };
      } catch (parseError) {
        console.error('Failed to parse structured output:', parseError);
        return {
          ...result,
          metadata: {
            ...result.metadata,
            outputFormat,
            parsed: false,
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          },
        };
      }
    }

    return result;
  }

  /**
   * Execute LangGraph workflow with budget check and state management
   */
  async executeWithLangGraph(
    query: string,
    agentId: string,
    agentType: string,
    chatHistory: any[] = [],
    systemPrompt?: string,
    userId?: string,
    options?: {
      maxIterations?: number;
      enableRAG?: boolean;
      retrievalStrategy?: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion' | 'basic';
      budgetLimit?: number;
    }
  ): Promise<{
    output: string;
    state: any;
    budgetUsed: number;
    stepsExecuted: string[];
  }> {
    try {
      console.log(`🔄 Executing LangGraph workflow for ${agentType}`);

      // Define workflow state interface
      interface WorkflowState {
        query: string;
        agentId: string;
        agentType: string;
        chatHistory: any[];
        ragContext: string;
        budgetUsed: number;
        budgetLimit: number;
        output: string;
        stepsExecuted: string[];
        error?: string;
      }

      // Budget check node
      const budgetCheckNode = async (state: WorkflowState) => {
        console.log('💰 Checking budget...');
        const estimatedCost = 0.5; // Estimated cost per query

        if (userId) {
          try {
            const { data: budgetCheck } = await supabase.rpc('check_user_budget', {
              p_user_id: userId,
              p_estimated_cost: estimatedCost,
            });

            if (!budgetCheck?.allowed) {
              return {
                ...state,
                error: 'Budget limit exceeded',
                stepsExecuted: [...state.stepsExecuted, 'budget_check_failed'],
              };
            }
          } catch (error) {
            console.warn('Budget check failed:', error);
          }
        }

        return {
          ...state,
          budgetUsed: state.budgetUsed + estimatedCost,
          stepsExecuted: [...state.stepsExecuted, 'budget_check_passed'],
        };
      };

      // RAG retrieval node
      const ragRetrievalNode = async (state: WorkflowState) => {
        console.log('📚 Retrieving knowledge...');
        let ragContext = '';

        if (options?.enableRAG !== false) {
          const retriever = await this.createAdvancedRetriever(
            state.agentId,
            options?.retrievalStrategy || 'rag_fusion'
          );
          const retrievedDocs = await retriever.getRelevantDocuments(state.query);
          ragContext = retrievedDocs.map(doc => doc.pageContent).join('\n\n');
        }

        return {
          ...state,
          ragContext,
          stepsExecuted: [...state.stepsExecuted, 'rag_retrieval_completed'],
        };
      };

      // Agent execution node
      const agentExecutionNode = async (state: WorkflowState) => {
        console.log('🤖 Executing agent...');

        const result = await this.executeAgentWithTools(
          state.query,
          state.agentId,
          state.agentType,
          state.chatHistory,
          systemPrompt,
          {
            maxIterations: options?.maxIterations,
            enableRAG: false, // Already retrieved in previous node
          }
        );

        return {
          ...state,
          output: result.output,
          stepsExecuted: [...state.stepsExecuted, 'agent_execution_completed'],
        };
      };

      // Conditional routing based on budget check
      const shouldContinue = (state: WorkflowState) => {
        if (state.error) {
          return END;
        }
        return 'rag_retrieval';
      };

      // Create state graph
      const workflow = new StateGraph<WorkflowState>({
        channels: {
          query: { value: (x?: string, y?: string) => y ?? x ?? '' },
          agentId: { value: (x?: string, y?: string) => y ?? x ?? '' },
          agentType: { value: (x?: string, y?: string) => y ?? x ?? '' },
          chatHistory: { value: (x?: any[], y?: any[]) => y ?? x ?? [] },
          ragContext: { value: (x?: string, y?: string) => y ?? x ?? '' },
          budgetUsed: { value: (x?: number, y?: number) => y ?? x ?? 0 },
          budgetLimit: { value: (x?: number, y?: number) => y ?? x ?? 100 },
          output: { value: (x?: string, y?: string) => y ?? x ?? '' },
          stepsExecuted: { value: (x?: string[], y?: string[]) => y ?? x ?? [] },
          error: { value: (x?: string, y?: string) => y ?? x },
        },
      });

      // Add nodes
      workflow.addNode('budget_check', budgetCheckNode);
      workflow.addNode('rag_retrieval', ragRetrievalNode);
      workflow.addNode('agent_execution', agentExecutionNode);

      // Add edges
      workflow.addConditionalEdges('budget_check', shouldContinue);
      workflow.addEdge('rag_retrieval', 'agent_execution');
      workflow.addEdge('agent_execution', END);

      // Set entry point
      workflow.setEntryPoint('budget_check');

      // Compile workflow
      const app = workflow.compile();

      // Execute workflow
      const initialState: WorkflowState = {
        query,
        agentId,
        agentType,
        chatHistory,
        ragContext: '',
        budgetUsed: 0,
        budgetLimit: options?.budgetLimit || 100,
        output: '',
        stepsExecuted: [],
      };

      const finalState = await app.invoke(initialState);

      console.log(`✅ LangGraph workflow complete. Steps: ${finalState.stepsExecuted.join(' → ')}`);

      return {
        output: finalState.output || '',
        state: finalState,
        budgetUsed: finalState.budgetUsed,
        stepsExecuted: finalState.stepsExecuted,
      };
    } catch (error) {
      console.error('LangGraph workflow error:', error);
      throw error;
    }
  }

  /**
   * Execute React Agent with tools for autonomous research
   */
  async executeAgentWithTools(
    query: string,
    agentId: string,
    agentType: string,
    chatHistory: any[] = [],
    systemPrompt?: string,
    options?: {
      maxIterations?: number;
      enableRAG?: boolean;
      retrievalStrategy?: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion' | 'basic';
    }
  ): Promise<{
    output: string;
    intermediateSteps: any[];
    toolExecutions: any[];
    sources?: any[];
  }> {
    try {
      console.log(`🤖 Executing React Agent for ${agentType} with tools`);

      // Get tools for this agent (from database or fallback)
      const tools = await this.getToolsForAgent(agentId, agentType);
      console.log(`🔧 Loaded ${tools.length} tools for agent`);

      // Get RAG context if enabled
      let ragContext = '';
      if (options?.enableRAG !== false) {
        const retriever = await this.createAdvancedRetriever(
          agentId,
          options?.retrievalStrategy || 'rag_fusion'
        );
        const retrievedDocs = await retriever.getRelevantDocuments(query);
        ragContext = retrievedDocs.map(doc => doc.pageContent).join('\n\n');
      }

      // Build agent prompt
      const chatHistoryStr = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const agentPromptTemplate = `${systemPrompt || 'You are a helpful AI assistant.'}

Chat History:
${chatHistoryStr}

${ragContext ? `Knowledge Base Context:\n${ragContext}\n\n` : ''}

You have access to the following tools. Use them ONCE to gather current information, then provide your final answer.

{tools}

TOOL USAGE GUIDELINES:
- Call each tool ONLY ONCE with a clear, specific query
- After receiving tool results, immediately synthesize a Final Answer
- Do NOT call the same tool multiple times with slight variations
- Do NOT call tools if you already have sufficient information

CITATION REQUIREMENTS (MANDATORY):
- You MUST cite ALL sources from your tool results using inline [1], [2], [3], [4], [5] format
- Place citations immediately after EVERY specific claim, data point, or fact
- Each source in your tool results corresponds to a number (1st result = [1], 2nd = [2], etc.)
- Use DIFFERENT citations for different facts - cite each unique source at least once
- Example: "DiGA certification requires clinical evidence [1] and must meet BfArM standards [2]. The process takes 3 months [3]."
- Be DETAILED and SPECIFIC - include regulatory steps, timelines, requirements, and authorities involved
- DO NOT add ANY "References:", "Citations:", or "Sources:" section - ONLY use inline [1][2][3] citations
- DO NOT list sources, URLs, or create a bibliography - just cite inline with numbers
- The reference list will be automatically generated at the end

Use the following format STRICTLY:

Question: the input question you must answer
Thought: I need current information about [topic]
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action (be specific and concise)
Observation: the result of the action
Thought: I now have the information needed to answer the question
Final Answer: [Detailed answer with INLINE CITATIONS [1][2][3] DISTRIBUTED THROUGHOUT THE TEXT after specific facts. NEVER group citations at the end. Include: regulatory bodies, specific requirements, timelines, processes, and practical guidance. DO NOT add a "Citations:" section.]

CRITICAL: After ONE tool call, you MUST provide a "Final Answer:" with:
1. Inline citations [1][2] IMMEDIATELY after EACH factual claim - NOT grouped at the end
2. Example: "DiGA requires certification [1]. The BfArM evaluates applications [2]. Processing takes 3 months [3]."
3. Detailed, comprehensive information (not high-level summaries)
4. Specific regulatory steps, authorities, requirements, and timelines

Begin!

Question: {input}
Thought: {agent_scratchpad}`;

      // Create React Agent
      const prompt = PromptTemplate.fromTemplate(agentPromptTemplate);
      const agent = await createReactAgent({
        llm: this.llm,
        tools,
        prompt,
      });

      // Create Agent Executor with custom error handling
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        maxIterations: options?.maxIterations || 10,
        verbose: true,
        returnIntermediateSteps: true,
        handleParsingErrors: (error: Error) => {
          console.log('⚠️  Parsing error caught, returning error message:', error.message);
          // Extract the actual LLM response from the error message
          const match = error.message.match(/Could not parse LLM output: (.+?)(?:\n|$)/);
          if (match && match[1]) {
            return match[1];
          }
          return `I encountered an error formatting my response: ${error.message}`;
        },
      });

      // Execute agent
      let result;
      try {
        result = await agentExecutor.invoke({
          input: query,
        });
      } catch (error: any) {
        console.error('❌ Agent executor error:', error);
        // If execution failed but we have intermediate steps in the error, try to extract them
        if (error.intermediateSteps) {
          result = {
            output: error.message || '',
            intermediateSteps: error.intermediateSteps || [],
          };
        } else {
          throw error;
        }
      }

      // Extract tool executions from intermediate steps with full source data
      const toolExecutions = (result.intermediateSteps || []).map((step: any) => ({
        tool: step.action?.tool || 'unknown',
        input: step.action?.toolInput || {},
        output: step.observation || '',
        timestamp: new Date().toISOString(),
      }));

      console.log(`✅ Agent execution complete with ${toolExecutions.length} tool executions`);

      // Extract structured sources from tool executions
      const sources: any[] = [];

      if (toolExecutions.length > 0) {
        console.log('📝 Extracting sources from tool results');

        for (const execution of toolExecutions) {
          try {
            const parsedOutput = typeof execution.output === 'string'
              ? JSON.parse(execution.output)
              : execution.output;

            if (Array.isArray(parsedOutput)) {
              parsedOutput.forEach((item: any) => {
                if (item.url) {
                  sources.push({
                    url: item.url,
                    title: item.title || '',
                    description: item.content || item.description || '',
                    date: item.published_date || new Date().toISOString(),
                  });
                }
              });
            }
          } catch (e) {
            console.error('⚠️  Error parsing tool output:', e);
          }
        }
      }

      // If we have tool executions, append Chicago-style references
      let finalOutput = result.output || '';

      if (sources.length > 0) {
        console.log(`📚 Formatting ${sources.length} sources in Chicago style`);

        // Find which citations are actually used in the text
        const usedCitations = new Set<number>();
        for (let i = 1; i <= sources.length; i++) {
          if (finalOutput.includes(`[${i}]`)) {
            usedCitations.add(i);
          }
        }

        console.log(`📌 Found ${usedCitations.size} cited sources out of ${sources.length} total`);

        // Only format sources that were actually cited in Chicago style
        const citedSources = Array.from(usedCitations)
          .sort((a, b) => a - b)
          .map(citationNum => {
            const source = sources[citationNum - 1];
            const hostname = new URL(source.url).hostname.replace('www.', '');
            const year = source.date ? new Date(source.date).getFullYear() : new Date().getFullYear();
            const title = source.title || 'Untitled';

            // Chicago style: Author/Organization. "Title." Website Name. Year. URL.
            return `${citationNum}. ${hostname}. "${title}." Accessed ${year}. ${source.url}.`;
          })
          .join('\n\n');

        // Remove any LLM-generated reference sections
        finalOutput = finalOutput.replace(/\n\n(References?|Citations?|Sources?):\s*\n[\s\S]*?(?=\n\n##|$)/gi, '');

        // Append references if we have cited sources
        if (citedSources && !finalOutput.includes('## References')) {
          finalOutput += `\n\n## References\n\n${citedSources}`;
        }
      }

      return {
        output: finalOutput,
        intermediateSteps: result.intermediateSteps || [],
        toolExecutions,
        sources, // Include structured sources for inline citations
      };
    } catch (error) {
      console.error('Agent execution error:', error);
      throw error;
    }
  }

  // Method to test LangChain setup
  async testSetup(): Promise<boolean> {
    try {
      // Test embedding generation
      const testEmbedding = await embeddings.embedQuery('test query');
      console.log('✅ Embeddings working, dimension:', testEmbedding.length);

      // Test LLM
      const testResponse = await this.llm.invoke('Say "LangChain setup successful"');
      console.log('✅ LLM working:', testResponse.content);

      return true;
    } catch (error) {
      console.error('❌ LangChain setup test failed:', error);
      return false;
    }
  }

  async searchKnowledge(query: string, options: {
    domain?: string;
    isGlobal?: boolean;
    limit?: number;
    agentId?: string;
  } = {}): Promise<{ chunks: any[] }> {
    console.log('🔍 Searching knowledge base:', { query, options });

    try {
      // If database is available, try to use vector search
      if (supabase) {
        console.log('Attempting vector search with Supabase...');
        try {
          const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: [],
            match_threshold: 0.7,
            match_count: options.limit || 10
          });

          if (error) {
            console.warn('Vector search failed:', error);
          } else if (data && data.length > 0) {
            console.log(`Found ${data.length} results from vector search`);
            return {
              chunks: data.map((item: any, index: number) => ({
                id: `chunk_${index}`,
                content: item.content || '',
                title: item.metadata?.title || `Document ${index + 1}`,
                source: item.metadata?.source || 'Unknown',
                sourceType: item.metadata?.type || 'Unknown',
                domain: item.metadata?.domain || options.domain || 'digital-health',
                similarity: item.similarity || 0.8,
                isGlobal: item.metadata?.isGlobal !== false,
                metadata: {
                  page: item.metadata?.page,
                  section: item.metadata?.section,
                  uploadedAt: item.metadata?.uploadedAt || new Date().toISOString(),
                  chunkIndex: index,
                },
              }))
            };
          }
        } catch (vectorError) {
          console.warn('Vector search error:', vectorError);
        }
      }

      // Fallback to mock data for development/demo
      console.log('Using mock search results');
      const mockResults = [
        {
          id: 'mock_1',
          content: `Digital health technologies must undergo rigorous validation processes to ensure safety and efficacy. The FDA has established specific guidelines for software as medical devices (SaMD) that outline the requirements for clinical evidence, risk management, and post-market surveillance. These guidelines emphasize the importance of real-world evidence and continuous monitoring of device performance. Query context: "${query}"`,
          title: 'FDA Digital Health Guidelines - Software as Medical Device',
          source: 'FDA Digital Health Guidelines.pdf',
          sourceType: 'PDF',
          domain: 'digital-health',
          similarity: 0.95,
          isGlobal: true,
          metadata: {
            page: 23,
            section: 'Software as Medical Device (SaMD)',
            uploadedAt: '2024-01-15T10:30:00Z',
            chunkIndex: 1,
          },
        },
        {
          id: 'mock_2',
          content: `Clinical trial design for digital therapeutics requires special consideration of digital endpoints and remote monitoring capabilities. Traditional endpoint measurement may not capture the full therapeutic benefit of digital interventions. Researchers should consider incorporating patient-reported outcomes, behavioral analytics, and real-time physiological data to create a comprehensive efficacy profile. Query context: "${query}"`,
          title: 'Clinical Trial Design Best Practices - Digital Endpoints',
          source: 'Clinical Trial Design Best Practices.docx',
          sourceType: 'Word Document',
          domain: 'clinical-research',
          similarity: 0.88,
          isGlobal: true,
          metadata: {
            section: 'Digital Endpoints and Remote Monitoring',
            uploadedAt: '2024-01-14T14:20:00Z',
            chunkIndex: 2,
          },
        },
        {
          id: 'mock_3',
          content: `Market access strategies for digital health solutions must address unique value propositions that traditional pharmaceuticals do not offer. Payers are increasingly interested in real-world outcomes, cost-effectiveness data, and the ability to demonstrate population health improvements. Digital solutions should emphasize their ability to provide continuous care, reduce healthcare utilization, and improve patient engagement. Query context: "${query}"`,
          title: 'Market Access Strategies - Digital Health Value Proposition',
          source: 'Market Access Strategies.pdf',
          sourceType: 'PDF',
          domain: 'market-access',
          similarity: 0.82,
          isGlobal: false,
          agentId: 'market-access',
          metadata: {
            page: 45,
            section: 'Digital Health Value Proposition',
            uploadedAt: '2024-01-13T09:15:00Z',
            chunkIndex: 3,
          },
        },
      ];

      // Filter mock results based on options and agent knowledge domains
      const filteredResults = mockResults.filter(result => {
        const domainMatch = !options.domain || result.domain === options.domain;
        const scopeMatch = options.isGlobal === undefined || result.isGlobal === options.isGlobal;

        // Filter by agent's knowledge domains if agentId is provided
        if (options.agentId) {
          // For now, we'll use the domain filtering since we can't import client-side stores in server-side code
          // The actual filtering by agent domains would be implemented in the database query
          // This is a simplified version that filters based on the domain parameter
          return domainMatch && scopeMatch;
        }

        return domainMatch && scopeMatch;
      });

      const limitedResults = filteredResults.slice(0, options.limit || 10);

      return { chunks: limitedResults };

    } catch (error) {
      console.error('Knowledge search error:', error);
      return { chunks: [] };
    }
  }
}

// Export singleton instance
export const langchainRAGService = new LangChainRAGService();
