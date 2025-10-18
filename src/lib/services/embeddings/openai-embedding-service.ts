import { OpenAI } from 'openai';

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
  batchSize?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIEmbeddingService {
  private openai: OpenAI;
  private readonly defaultModel = 'text-embedding-3-large';
  private readonly defaultDimensions = 3072;
  private readonly batchSize = 10;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable.');
    }

    this.openai = new OpenAI({
      apiKey: key,
    });
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(
    text: string, 
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult> {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      // Truncate text if too long (OpenAI has a limit)
      const maxLength = 8000; // Conservative limit for text-embedding-3-large
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) 
        : text;

      const model = options.model || this.defaultModel;
      const dimensions = options.dimensions || this.defaultDimensions;

      const response = await this.openai.embeddings.create({
        model,
        input: truncatedText,
        dimensions,
      });

      const embedding = response.data[0].embedding;

      // Validate embedding dimensions
      if (embedding.length !== dimensions) {
        throw new Error(`Expected ${dimensions} dimensions, got ${embedding.length}`);
      }

      return {
        embedding,
        model: response.model,
        dimensions: embedding.length,
        usage: response.usage,
      };

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
      }
      throw new Error('Failed to generate embedding: Unknown error');
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateEmbeddingsBatch(
    texts: string[], 
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult[]> {
    const batchSize = options.batchSize || this.batchSize;
    const results: EmbeddingResult[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const batchPromises = batch.map(text => this.generateEmbedding(text, options));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add small delay between batches to respect rate limits
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to process batch ${i}-${i + batchSize}:`, error);
        // Continue with next batch instead of failing completely
        continue;
      }
    }

    return results;
  }

  /**
   * Validate embedding dimensions
   */
  validateEmbedding(embedding: number[], expectedDimensions: number = this.defaultDimensions): boolean {
    return Array.isArray(embedding) && 
           embedding.length === expectedDimensions && 
           embedding.every(val => typeof val === 'number' && !isNaN(val));
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Get service configuration
   */
  getConfig(): EmbeddingOptions {
    return {
      model: this.defaultModel,
      dimensions: this.defaultDimensions,
      batchSize: this.batchSize,
    };
  }
}

// Export singleton instance
export const embeddingService = new OpenAIEmbeddingService();
export default embeddingService;
