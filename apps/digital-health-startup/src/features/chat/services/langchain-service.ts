/**
 * LangChain RAG Service
 * Handles document processing and knowledge base integration
 * Connects to Unified RAG Service for document ingestion
 */

import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

export interface LangChainConfig {
  model: string;
  temperature: number;
}

export interface ProcessDocumentsOptions {
  agentId?: string;
  isGlobal: boolean;
  domain: string;
  embeddingModel: string;
  chatModel: string;
}

export interface ProcessResult {
  filename: string;
  status: 'success' | 'error';
  documentId?: string;
  chunks?: number;
  error?: string;
}

export class LangChainRAGService {
  private config: LangChainConfig;

  constructor(config: LangChainConfig) {
    this.config = config;
  }

  /**
   * Process multiple document files for RAG ingestion
   */
  async processDocuments(
    files: File[],
    options: ProcessDocumentsOptions
  ): Promise<{ success: boolean; results: ProcessResult[] }> {
    console.log(`📄 Processing ${files.length} documents for RAG ingestion`);
    console.log('Options:', {
      domain: options.domain,
      isGlobal: options.isGlobal,
      agentId: options.agentId,
      embeddingModel: options.embeddingModel
    });

    const results: ProcessResult[] = [];

    for (const file of files) {
      try {
        console.log(`  📝 Processing file: ${file.name} (${file.size} bytes)`);

        // Validate file
        if (!file || file.size === 0) {
          results.push({
            filename: file.name,
            status: 'error',
            error: 'File is empty'
          });
          continue;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
          results.push({
            filename: file.name,
            status: 'error',
            error: `Unsupported file type: ${file.type}`
          });
          continue;
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const content = buffer.toString('utf-8');

        // Prepare document for RAG service
        const document = {
          title: file.name,
          content: content,
          domain: options.domain,
          tags: options.isGlobal ? ['global'] : [`agent:${options.agentId}`],
          metadata: {
            source: 'upload',
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            uploadedAt: new Date().toISOString(),
            isGlobal: options.isGlobal,
            agentId: options.agentId,
            embeddingModel: options.embeddingModel,
            chatModel: options.chatModel
          }
        };

        // Add document to unified RAG service
        const documentId = await unifiedRAGService.addDocument(document);

        console.log(`  ✅ Document processed successfully: ${documentId}`);

        results.push({
          filename: file.name,
          status: 'success',
          documentId: documentId,
          chunks: 0 // Will be updated after processing
        });

      } catch (error) {
        console.error(`  ❌ Failed to process ${file.name}:`, error);
        results.push({
          filename: file.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`✅ Document processing complete: ${successCount}/${files.length} successful`);

    return {
      success: successCount > 0,
      results
    };
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(
    query: string,
    options?: {
      limit?: number;
      domain?: string;
      agentId?: string;
    }
  ): Promise<{ chunks: any[] }> {
    try {
      const result = await unifiedRAGService.query({
        text: query,
        agentId: options?.agentId,
        domain: options?.domain,
        maxResults: options?.limit || 10,
        similarityThreshold: 0.7,
        strategy: 'hybrid',
        includeMetadata: true
      });

      return {
        chunks: result.sources.map(source => ({
          content: source.pageContent,
          score: source.metadata?.similarity || 0,
          metadata: source.metadata
        }))
      };
    } catch (error) {
      console.error('Knowledge search failed:', error);
      return { chunks: [] };
    }
  }

  /**
   * Process query with RAG context
   */
  async processQuery(
    query: string,
    options?: {
      domain?: string;
      agentId?: string;
    }
  ): Promise<{ answer: string; sources: string[] }> {
    try {
      const result = await unifiedRAGService.query({
        text: query,
        agentId: options?.agentId,
        domain: options?.domain,
        maxResults: 5,
        similarityThreshold: 0.7,
        strategy: 'hybrid',
        includeMetadata: true
      });

      // Generate answer using context (simplified - in production, use LLM)
      const answer = `Based on ${result.sources.length} relevant sources: ${result.context.substring(0, 200)}...`;

      const sources = result.sources.map(
        source => source.metadata?.title || source.metadata?.source || 'Unknown'
      );

      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('Query processing failed:', error);
      return {
        answer: 'Failed to process query',
        sources: []
      };
    }
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const health = await unifiedRAGService.getHealthMetrics();
      return {
        status: health.status,
        details: {
          totalDocuments: health.totalDocuments,
          totalChunks: health.totalChunks,
          cacheSize: health.cacheSize,
          vectorStore: health.vectorStoreStatus
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

export const langchainRAGService = new LangChainRAGService({
  model: 'gpt-4-turbo-preview',
  temperature: 0.1
});
