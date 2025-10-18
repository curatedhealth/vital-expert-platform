#!/usr/bin/env node

/**
 * RAG Embedding Regeneration Script
 * 
 * Regenerates all embeddings in the database using OpenAI text-embedding-3-large
 * to upgrade from 1536 to 3072 dimensions.
 * 
 * Usage:
 *   npm run regenerate-embeddings
 *   npm run regenerate-embeddings -- --dry-run
 *   npm run regenerate-embeddings -- --source-id=uuid
 *   npm run regenerate-embeddings -- --limit=100
 */

import { createClient } from '@supabase/supabase-js';
import { embeddingService } from '../src/lib/services/embeddings/openai-embedding-service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface RegenerationOptions {
  dryRun: boolean;
  sourceId?: string;
  limit?: number;
  batchSize: number;
  delayMs: number;
}

interface ChunkToProcess {
  id: string;
  source_id: string;
  content: string;
  current_embedding?: number[];
}

interface ProcessingStats {
  totalChunks: number;
  processedChunks: number;
  successfulChunks: number;
  failedChunks: number;
  skippedChunks: number;
  startTime: Date;
  endTime?: Date;
  estimatedCost: number;
  actualCost: number;
}

class EmbeddingRegenerator {
  private supabase: ReturnType<typeof createClient>;
  private stats: ProcessingStats;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Check environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    this.stats = {
      totalChunks: 0,
      processedChunks: 0,
      successfulChunks: 0,
      failedChunks: 0,
      skippedChunks: 0,
      startTime: new Date(),
      estimatedCost: 0,
      actualCost: 0
    };
  }

  async run(options: RegenerationOptions): Promise<void> {
    console.log('🚀 Starting RAG Embedding Regeneration');
    console.log('=====================================');
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`Source ID filter: ${options.sourceId || 'All sources'}`);
    console.log(`Limit: ${options.limit || 'No limit'}`);
    console.log(`Batch size: ${options.batchSize}`);
    console.log(`Delay between batches: ${options.delayMs}ms`);
    console.log('');

    try {
      // Get chunks to process
      const chunks = await this.getChunksToProcess(options);
      this.stats.totalChunks = chunks.length;

      if (chunks.length === 0) {
        console.log('✅ No chunks found to process');
        return;
      }

      console.log(`📊 Found ${chunks.length} chunks to process`);

      // Calculate cost estimate
      const estimatedCost = this.calculateCostEstimate(chunks);
      this.stats.estimatedCost = estimatedCost;
      console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}`);

      if (options.dryRun) {
        console.log('🔍 DRY RUN - No embeddings will be updated');
        this.printChunkSummary(chunks);
        return;
      }

      // Confirm before proceeding
      console.log('');
      console.log('⚠️  This will regenerate ALL embeddings in the database.');
      console.log('⚠️  This operation cannot be undone.');
      console.log('⚠️  Make sure you have a database backup before proceeding.');
      console.log('');

      // Process chunks in batches
      await this.processChunksInBatches(chunks, options);

      // Print final statistics
      this.printFinalStats();

    } catch (error) {
      console.error('❌ Regeneration failed:', error);
      throw error;
    }
  }

  private async getChunksToProcess(options: RegenerationOptions): Promise<ChunkToProcess[]> {
    let query = this.supabase
      .from('rag_knowledge_chunks')
      .select('id, source_id, content, embedding')
      .not('content', 'is', null)
      .order('created_at', { ascending: true });

    if (options.sourceId) {
      query = query.eq('source_id', options.sourceId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch chunks: ${error.message}`);
    }

    return data || [];
  }

  private calculateCostEstimate(chunks: ChunkToProcess[]): number {
    // OpenAI text-embedding-3-large pricing: $0.00013 per 1K tokens
    // Average tokens per chunk: ~200 (rough estimate)
    const avgTokensPerChunk = 200;
    const pricePer1KTokens = 0.00013;
    
    const totalTokens = chunks.length * avgTokensPerChunk;
    return (totalTokens / 1000) * pricePer1KTokens;
  }

  private printChunkSummary(chunks: ChunkToProcess[]): void {
    console.log('\n📋 Chunks to be processed:');
    console.log('----------------------------');
    
    const sourceGroups = chunks.reduce((acc, chunk) => {
      if (!acc[chunk.source_id]) {
        acc[chunk.source_id] = [];
      }
      acc[chunk.source_id].push(chunk);
      return acc;
    }, {} as Record<string, ChunkToProcess[]>);

    Object.entries(sourceGroups).forEach(([sourceId, sourceChunks]) => {
      console.log(`Source ${sourceId}: ${sourceChunks.length} chunks`);
    });
  }

  private async processChunksInBatches(
    chunks: ChunkToProcess[], 
    options: RegenerationOptions
  ): Promise<void> {
    const batches = this.createBatches(chunks, options.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} chunks)`);

      try {
        await this.processBatch(batch, options);
        
        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          console.log(`⏳ Waiting ${options.delayMs}ms before next batch...`);
          await this.delay(options.delayMs);
        }

      } catch (error) {
        console.error(`❌ Batch ${i + 1} failed:`, error);
        // Continue with next batch instead of failing completely
        continue;
      }
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(
    chunks: ChunkToProcess[], 
    options: RegenerationOptions
  ): Promise<void> {
    const batchPromises = chunks.map(chunk => this.processChunk(chunk, options));
    const results = await Promise.allSettled(batchPromises);

    results.forEach((result, index) => {
      this.stats.processedChunks++;
      
      if (result.status === 'fulfilled') {
        this.stats.successfulChunks++;
      } else {
        this.stats.failedChunks++;
        console.error(`❌ Failed to process chunk ${chunks[index].id}:`, result.reason);
      }
    });

    console.log(`✅ Batch completed: ${this.stats.successfulChunks}/${this.stats.processedChunks} successful`);
  }

  private async processChunk(
    chunk: ChunkToProcess, 
    options: RegenerationOptions
  ): Promise<void> {
    try {
      // Skip if already has 3072-dimensional embedding
      if (chunk.current_embedding && chunk.current_embedding.length === 3072) {
        this.stats.skippedChunks++;
        return;
      }

      // Generate new embedding
      const embedding = await embeddingService.generateEmbedding(chunk.content, {
        model: 'text-embedding-3-large',
        dimensions: 3072
      });

      // Update database
      const { error } = await this.supabase
        .from('rag_knowledge_chunks')
        .update({ embedding })
        .eq('id', chunk.id);

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }

      // Update cost tracking
      const tokens = Math.ceil(chunk.content.length / 4); // Rough token estimation
      this.stats.actualCost += (tokens / 1000) * 0.00013;

    } catch (error) {
      throw new Error(`Chunk processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private printFinalStats(): void {
    this.stats.endTime = new Date();
    const duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();

    console.log('\n📊 Regeneration Complete!');
    console.log('==========================');
    console.log(`Total chunks: ${this.stats.totalChunks}`);
    console.log(`Processed: ${this.stats.processedChunks}`);
    console.log(`Successful: ${this.stats.successfulChunks}`);
    console.log(`Failed: ${this.stats.failedChunks}`);
    console.log(`Skipped: ${this.stats.skippedChunks}`);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Estimated cost: $${this.stats.estimatedCost.toFixed(4)}`);
    console.log(`Actual cost: $${this.stats.actualCost.toFixed(4)}`);
    console.log('');

    if (this.stats.failedChunks > 0) {
      console.log('⚠️  Some chunks failed to process. Check the logs above for details.');
    } else {
      console.log('✅ All chunks processed successfully!');
    }
  }
}

// Parse command line arguments
function parseArgs(): RegenerationOptions {
  const args = process.argv.slice(2);
  
  const options: RegenerationOptions = {
    dryRun: false,
    batchSize: 10,
    delayMs: 100
  };

  args.forEach(arg => {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--source-id=')) {
      options.sourceId = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--delay=')) {
      options.delayMs = parseInt(arg.split('=')[1], 10);
    }
  });

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const regenerator = new EmbeddingRegenerator();
    await regenerator.run(options);
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { EmbeddingRegenerator };
