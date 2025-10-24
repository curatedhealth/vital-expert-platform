/**
 * Semantic Chunking Service
 * Implements advanced chunking strategies for better context preservation
 */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

export interface ChunkingConfig {
  strategy: 'recursive' | 'semantic' | 'adaptive' | 'medical';
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
  enableSemanticChunking: boolean;
  similarityThreshold: number;
  maxChunkSize: number;
  minChunkSize: number;
}

export interface ChunkingResult {
  chunks: Document[];
  metadata: {
    totalChunks: number;
    averageChunkSize: number;
    strategy: string;
    processingTime: number;
    qualityScore: number;
  };
}

export class SemanticChunkingService {
  private embeddings: OpenAIEmbeddings;
  private config: ChunkingConfig;

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = {
      strategy: 'adaptive',
      chunkSize: 2000,
      chunkOverlap: 300,
      separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ' ', ''],
      enableSemanticChunking: true,
      similarityThreshold: 0.7,
      maxChunkSize: 3000,
      minChunkSize: 500,
      ...config
    };

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-large',
    });
  }

  /**
   * Chunk documents using the configured strategy
   */
  async chunkDocuments(
    documents: Document[],
    strategy?: string
  ): Promise<ChunkingResult> {
    const startTime = Date.now();
    const selectedStrategy = strategy || this.config.strategy;

    console.log(`📄 Chunking ${documents.length} documents using ${selectedStrategy} strategy...`);

    let chunks: Document[] = [];

    switch (selectedStrategy) {
      case 'recursive':
        chunks = await this.recursiveChunking(documents);
        break;
      case 'semantic':
        chunks = await this.semanticChunking(documents);
        break;
      case 'adaptive':
        chunks = await this.adaptiveChunking(documents);
        break;
      case 'medical':
        chunks = await this.medicalChunking(documents);
        break;
      default:
        chunks = await this.recursiveChunking(documents);
    }

    const processingTime = Date.now() - startTime;
    const qualityScore = this.calculateChunkQuality(chunks);

    const result: ChunkingResult = {
      chunks,
      metadata: {
        totalChunks: chunks.length,
        averageChunkSize: this.calculateAverageChunkSize(chunks),
        strategy: selectedStrategy,
        processingTime,
        qualityScore,
      },
    };

    console.log(`✅ Chunking complete: ${chunks.length} chunks, ${qualityScore.toFixed(1)}% quality`);

    return result;
  }

  /**
   * Recursive character text splitting (baseline)
   */
  private async recursiveChunking(documents: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap,
      separators: this.config.separators,
    });

    const chunks: Document[] = [];
    for (const doc of documents) {
      const docChunks = await splitter.splitDocuments([doc]);
      chunks.push(...docChunks);
    }

    return chunks;
  }

  /**
   * Semantic chunking based on content similarity
   */
  private async semanticChunking(documents: Document[]): Promise<Document[]> {
    if (!this.config.enableSemanticChunking) {
      return this.recursiveChunking(documents);
    }

    const chunks: Document[] = [];

    for (const doc of documents) {
      // First, create initial chunks with recursive splitting
      const initialChunks = await this.recursiveChunking([doc]);
      
      if (initialChunks.length <= 1) {
        chunks.push(...initialChunks);
        continue;
      }

      // Generate embeddings for all chunks
      const embeddings = await this.embeddings.embedDocuments(
        initialChunks.map(chunk => chunk.pageContent)
      );

      // Group similar chunks together
      const semanticChunks = this.groupSimilarChunks(initialChunks, embeddings);
      chunks.push(...semanticChunks);
    }

    return chunks;
  }

  /**
   * Adaptive chunking based on content type
   */
  private async adaptiveChunking(documents: Document[]): Promise<Document[]> {
    const chunks: Document[] = [];

    for (const doc of documents) {
      const contentType = this.detectContentType(doc);
      let docChunks: Document[] = [];

      switch (contentType) {
        case 'regulatory':
          docChunks = await this.regulatoryChunking(doc);
          break;
        case 'clinical':
          docChunks = await this.clinicalChunking(doc);
          break;
        case 'scientific':
          docChunks = await this.scientificChunking(doc);
          break;
        case 'legal':
          docChunks = await this.legalChunking(doc);
          break;
        default:
          docChunks = await this.recursiveChunking([doc]);
      }

      chunks.push(...docChunks);
    }

    return chunks;
  }

  /**
   * Medical-specific chunking
   */
  private async medicalChunking(documents: Document[]): Promise<Document[]> {
    const medicalSeparators = [
      '\n\n## ', // Headers
      '\n\n### ', // Subheaders
      '\n\n**', // Bold text
      '\n\n• ', // Bullet points
      '\n\n- ', // Dashes
      '\n\n1. ', // Numbered lists
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      ' ', // Words
      ''
    ];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2500, // Larger chunks for medical content
      chunkOverlap: 400,
      separators: medicalSeparators,
    });

    const chunks: Document[] = [];
    for (const doc of documents) {
      const docChunks = await splitter.splitDocuments([doc]);
      chunks.push(...docChunks);
    }

    return chunks;
  }

  /**
   * Group similar chunks based on embeddings
   */
  private groupSimilarChunks(
    chunks: Document[],
    embeddings: number[][]
  ): Document[] {
    const groups: Document[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < chunks.length; i++) {
      if (used.has(i)) continue;

      const group = [chunks[i]];
      used.add(i);

      for (let j = i + 1; j < chunks.length; j++) {
        if (used.has(j)) continue;

        const similarity = this.calculateCosineSimilarity(embeddings[i], embeddings[j]);
        if (similarity > this.config.similarityThreshold) {
          group.push(chunks[j]);
          used.add(j);
        }
      }

      groups.push(group);
    }

    // Merge groups into single chunks
    return groups.map(group => this.mergeChunks(group));
  }

  /**
   * Merge multiple chunks into one
   */
  private mergeChunks(chunks: Document[]): Document {
    if (chunks.length === 1) return chunks[0];

    const mergedContent = chunks.map(chunk => chunk.pageContent).join('\n\n');
    const mergedMetadata = {
      ...chunks[0].metadata,
      merged_from: chunks.length,
      original_chunks: chunks.map(chunk => chunk.metadata),
    };

    return new Document({
      pageContent: mergedContent,
      metadata: mergedMetadata,
    });
  }

  /**
   * Detect content type for adaptive chunking
   */
  private detectContentType(doc: Document): string {
    const content = doc.pageContent.toLowerCase();
    const metadata = doc.metadata;

    // Check metadata first
    if (metadata.domain) {
      if (metadata.domain.includes('regulatory')) return 'regulatory';
      if (metadata.domain.includes('clinical')) return 'clinical';
      if (metadata.domain.includes('scientific')) return 'scientific';
      if (metadata.domain.includes('legal')) return 'legal';
    }

    // Check content keywords
    if (content.includes('fda') || content.includes('510(k)') || content.includes('pma')) {
      return 'regulatory';
    }
    if (content.includes('clinical trial') || content.includes('patient') || content.includes('study')) {
      return 'clinical';
    }
    if (content.includes('research') || content.includes('study') || content.includes('data')) {
      return 'scientific';
    }
    if (content.includes('legal') || content.includes('compliance') || content.includes('regulation')) {
      return 'legal';
    }

    return 'general';
  }

  /**
   * Regulatory document chunking
   */
  private async regulatoryChunking(doc: Document): Promise<Document[]> {
    const regulatorySeparators = [
      '\n\n## ', // Section headers
      '\n\n### ', // Subsection headers
      '\n\n**', // Bold text
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      ' ', // Words
      ''
    ];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000, // Larger chunks for regulatory content
      chunkOverlap: 500,
      separators: regulatorySeparators,
    });

    return splitter.splitDocuments([doc]);
  }

  /**
   * Clinical document chunking
   */
  private async clinicalChunking(doc: Document): Promise<Document[]> {
    const clinicalSeparators = [
      '\n\n## ', // Section headers
      '\n\n### ', // Subsection headers
      '\n\n**', // Bold text
      '\n\n• ', // Bullet points
      '\n\n- ', // Dashes
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      ' ', // Words
      ''
    ];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2500,
      chunkOverlap: 400,
      separators: clinicalSeparators,
    });

    return splitter.splitDocuments([doc]);
  }

  /**
   * Scientific document chunking
   */
  private async scientificChunking(doc: Document): Promise<Document[]> {
    const scientificSeparators = [
      '\n\n## ', // Section headers
      '\n\n### ', // Subsection headers
      '\n\n**', // Bold text
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      ' ', // Words
      ''
    ];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 300,
      separators: scientificSeparators,
    });

    return splitter.splitDocuments([doc]);
  }

  /**
   * Legal document chunking
   */
  private async legalChunking(doc: Document): Promise<Document[]> {
    const legalSeparators = [
      '\n\n## ', // Section headers
      '\n\n### ', // Subsection headers
      '\n\n**', // Bold text
      '\n\n', // Paragraph breaks
      '\n', // Line breaks
      '. ', // Sentences
      ' ', // Words
      ''
    ];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3500, // Larger chunks for legal content
      chunkOverlap: 600,
      separators: legalSeparators,
    });

    return splitter.splitDocuments([doc]);
  }

  /**
   * Calculate chunk quality score
   */
  private calculateChunkQuality(chunks: Document[]): number {
    if (chunks.length === 0) return 0;

    let totalScore = 0;

    for (const chunk of chunks) {
      let score = 0;

      // Length score (optimal range)
      const length = chunk.pageContent.length;
      if (length >= this.config.minChunkSize && length <= this.config.maxChunkSize) {
        score += 40;
      } else if (length < this.config.minChunkSize) {
        score += 20; // Too short
      } else {
        score += 30; // Too long
      }

      // Completeness score (ends with sentence)
      if (chunk.pageContent.match(/[.!?]\s*$/)) {
        score += 30;
      } else {
        score += 15;
      }

      // Coherence score (has structure)
      if (chunk.pageContent.includes('\n') || chunk.pageContent.includes('•')) {
        score += 20;
      } else {
        score += 10;
      }

      // Metadata score
      if (chunk.metadata && Object.keys(chunk.metadata).length > 0) {
        score += 10;
      }

      totalScore += Math.min(score, 100);
    }

    return totalScore / chunks.length;
  }

  /**
   * Calculate average chunk size
   */
  private calculateAverageChunkSize(chunks: Document[]): number {
    if (chunks.length === 0) return 0;
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0);
    return Math.round(totalSize / chunks.length);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Update chunking configuration
   */
  updateConfig(newConfig: Partial<ChunkingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get chunking statistics
   */
  getChunkingStats(): {
    config: ChunkingConfig;
    strategies: string[];
  } {
    return {
      config: this.config,
      strategies: ['recursive', 'semantic', 'adaptive', 'medical'],
    };
  }
}

// Export singleton instance
export const semanticChunkingService = new SemanticChunkingService({
  strategy: 'adaptive',
  chunkSize: 2000,
  chunkOverlap: 300,
  enableSemanticChunking: true,
  similarityThreshold: 0.7,
  maxChunkSize: 3000,
  minChunkSize: 500,
});
