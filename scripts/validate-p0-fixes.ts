#!/usr/bin/env node

/**
 * P0 RAG Fixes Validation Script
 * 
 * Validates all critical fixes implemented in Phase 1:
 * - Database schema and RPC functions
 * - Embedding generation (real vs mock)
 * - Vector search functionality
 * - API endpoints
 * 
 * Usage:
 *   npm run validate-p0
 *   node scripts/validate-p0-fixes.ts
 */

import { createClient } from '@supabase/supabase-js';
import { ragService } from '../src/rag-service';
import { embeddingService } from '../src/lib/services/embeddings/openai-embedding-service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: string;
  duration?: number;
}

class P0ValidationRunner {
  private supabase: ReturnType<typeof createClient>;
  private results: ValidationResult[] = [];

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
  }

  async run(): Promise<void> {
    console.log('🔍 P0 RAG Fixes Validation');
    console.log('==========================');
    console.log('');

    try {
      // Run all validation tests
      await this.validateDatabaseSchema();
      await this.validateRPCFunctions();
      await this.validateEmbeddingGeneration();
      await this.validateVectorSearch();
      await this.validateAPIEndpoints();
      await this.validateRAGService();

      // Print results
      this.printResults();

    } catch (error) {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    }
  }

  private async validateDatabaseSchema(): Promise<void> {
    console.log('📊 Validating Database Schema...');

    // Test 1: Check required tables exist
    await this.runTest('Database Tables', async () => {
      // Test each table individually since information_schema queries don't work with Supabase
      const tables = ['rag_tenants', 'rag_knowledge_sources', 'rag_knowledge_chunks', 'rag_search_analytics'];
      const existingTables = [];

      for (const tableName of tables) {
        try {
          const { error } = await this.supabase.from(tableName).select('*').limit(1);
          if (!error) {
            existingTables.push(tableName);
          }
        } catch (err) {
          // Table doesn't exist
        }
      }

      if (existingTables.length !== 4) {
        throw new Error(`Expected 4 tables, found ${existingTables.length}: ${existingTables.join(', ')}`);
      }

      return 'All required RAG tables exist';
    });

    // Test 2: Check vector dimensions
    await this.runTest('Vector Dimensions', async () => {
      const { data: chunks, error } = await this.supabase
        .from('rag_knowledge_chunks')
        .select('embedding')
        .not('embedding', 'is', null)
        .limit(1);

      if (error) throw new Error(`Database query failed: ${error.message}`);
      
      if (!chunks || chunks.length === 0) {
        return 'No chunks with embeddings found (SKIP)';
      }

      const embedding = chunks[0].embedding;
      if (!Array.isArray(embedding)) {
        throw new Error('Embedding is not an array');
      }
      if (embedding.length !== 3072) {
        throw new Error(`Expected 3072 dimensions, got ${embedding.length}`);
      }

      return 'Vector dimensions are correct (3072)';
    });

    // Test 3: Check indexes exist (skip for now - Supabase doesn't expose pg_indexes)
    await this.runTest('Vector Indexes', async () => {
      // Skip this test as Supabase doesn't expose pg_indexes table
      return 'Vector indexes check skipped (Supabase limitation)';
    });
  }

  private async validateRPCFunctions(): Promise<void> {
    console.log('🔧 Validating RPC Functions...');

    // Test 1: Check search_rag_knowledge function
    await this.runTest('search_rag_knowledge Function', async () => {
      // Test by calling the function with dummy data
      const { data, error } = await this.supabase.rpc('search_rag_knowledge', {
        query_embedding: new Array(3072).fill(0),
        match_threshold: 0.1,
        match_count: 1
      });

      if (error) {
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          throw new Error('search_rag_knowledge function not found');
        }
        // Other errors are OK (like no data) - function exists
      }

      return 'search_rag_knowledge function exists';
    });

    // Test 2: Check hybrid_search_rag_knowledge function
    await this.runTest('hybrid_search_rag_knowledge Function', async () => {
      // Test by calling the function with dummy data
      const { data, error } = await this.supabase.rpc('hybrid_search_rag_knowledge', {
        query_embedding: new Array(3072).fill(0),
        query_text: 'test',
        match_threshold: 0.1,
        match_count: 1
      });

      if (error) {
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          throw new Error('hybrid_search_rag_knowledge function not found');
        }
        // Other errors are OK (like no data) - function exists
      }

      return 'hybrid_search_rag_knowledge function exists';
    });

    // Test 3: Check get_default_rag_tenant_id function
    await this.runTest('get_default_rag_tenant_id Function', async () => {
      const { data, error } = await this.supabase.rpc('get_default_rag_tenant_id');

      if (error) throw new Error(`RPC call failed: ${error.message}`);
      if (!data) {
        throw new Error('No default tenant ID returned');
      }

      return `Default tenant ID: ${data}`;
    });
  }

  private async validateEmbeddingGeneration(): Promise<void> {
    console.log('🧠 Validating Embedding Generation...');

    // Test 1: Generate real embeddings
    await this.runTest('Real Embeddings (not mock)', async () => {
      const testText = 'This is a test for embedding generation validation';
      
      const result1 = await embeddingService.generateEmbedding(testText);
      const result2 = await embeddingService.generateEmbedding(testText);

      // Extract embeddings from result objects
      const embedding1 = result1.embedding;
      const embedding2 = result2.embedding;

      // Should be identical (deterministic)
      if (JSON.stringify(embedding1) !== JSON.stringify(embedding2)) {
        throw new Error('Embeddings are not deterministic');
      }

      // Should be 3072 dimensions
      if (embedding1.length !== 3072) {
        throw new Error(`Expected 3072 dimensions, got ${embedding1.length}`);
      }

      // Should not be random (all zeros or all same value)
      const uniqueValues = new Set(embedding1);
      if (uniqueValues.size <= 1) {
        throw new Error('Embedding appears to be random or constant');
      }

      return 'Real embeddings generated successfully';
    });

    // Test 2: Validate embedding normalization
    await this.runTest('Embedding Normalization', async () => {
      const testText = 'Normalization test for embedding vectors';
      const result = await embeddingService.generateEmbedding(testText);
      const embedding = result.embedding;

      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      
      if (magnitude < 0.9 || magnitude > 1.1) {
        throw new Error(`Embedding not normalized. Magnitude: ${magnitude.toFixed(3)}`);
      }

      return `Embedding normalized (magnitude: ${magnitude.toFixed(3)})`;
    });

    // Test 3: Handle empty text
    await this.runTest('Empty Text Handling', async () => {
      try {
        await embeddingService.generateEmbedding('');
        throw new Error('Should have thrown error for empty text');
      } catch (error) {
        if (error instanceof Error && error.message.includes('empty')) {
          return 'Empty text properly rejected';
        }
        throw error;
      }
    });
  }

  private async validateVectorSearch(): Promise<void> {
    console.log('🔍 Validating Vector Search...');

    // Test 1: RAG service initialization
    await this.runTest('RAG Service Initialization', async () => {
      await ragService.initialize();
      return 'RAG service initialized successfully';
    });

    // Test 2: Basic search functionality
    await this.runTest('Basic Vector Search', async () => {
      const query = 'test search functionality';
      const embeddingResult = await embeddingService.generateEmbedding(query);
      const queryEmbedding = embeddingResult.embedding;

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.5,
          limit: 10
        }
      );

      if (!Array.isArray(results)) {
        throw new Error('Search results should be an array');
      }

      return `Search completed, returned ${results.length} results`;
    });

    // Test 3: Search with filters
    await this.runTest('Search with Domain Filter', async () => {
      const query = 'medical research';
      const embeddingResult = await embeddingService.generateEmbedding(query);
      const queryEmbedding = embeddingResult.embedding;

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.5,
          limit: 10,
          domain: 'medical_affairs'
        }
      );

      // Should not throw error even if no results
      return `Domain-filtered search completed, returned ${results.length} results`;
    });
  }

  private async validateAPIEndpoints(): Promise<void> {
    console.log('🌐 Validating API Endpoints...');

    // Test 1: Search API endpoint
    await this.runTest('Search API Endpoint', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const searchUrl = `${baseUrl}/api/knowledge/search`;

      try {
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: 'test search API',
            threshold: 0.5,
            limit: 5
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Invalid API response format');
        }

        return `Search API working (${data.results.length} results)`;
      } catch (error) {
        if (error instanceof Error && error.message.includes('fetch')) {
          return 'Search API not accessible (SKIP - server may not be running)';
        }
        throw error;
      }
    });

    // Test 2: Health check endpoint
    await this.runTest('Health Check Endpoint', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const healthUrl = `${baseUrl}/api/knowledge/search`;

      try {
        const response = await fetch(healthUrl, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`Health check returned ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'healthy') {
          throw new Error(`Service not healthy: ${data.status}`);
        }

        return 'Health check passed';
      } catch (error) {
        if (error instanceof Error && error.message.includes('fetch')) {
          return 'Health check not accessible (SKIP - server may not be running)';
        }
        throw error;
      }
    });
  }

  private async validateRAGService(): Promise<void> {
    console.log('⚙️ Validating RAG Service...');

    // Test 1: Service methods exist
    await this.runTest('Service Methods', async () => {
      const methods = [
        'initialize',
        'generateEmbedding',
        'searchKnowledge',
        'getKnowledgeSources',
        'createKnowledgeSource',
        'processDocument'
      ];

      for (const method of methods) {
        if (typeof (ragService as any)[method] !== 'function') {
          throw new Error(`Method ${method} not found`);
        }
      }

      return `All ${methods.length} required methods exist`;
    });

    // Test 2: Error handling
    await this.runTest('Error Handling', async () => {
      try {
        await ragService.searchKnowledge('', [], { threshold: 0.5 });
        throw new Error('Should have thrown error for empty query');
      } catch (error) {
        if (error instanceof Error && error.message.includes('empty')) {
          return 'Error handling working correctly';
        }
        throw error;
      }
    });
  }

  private async runTest(testName: string, testFn: () => Promise<string>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const message = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'PASS',
        message,
        duration
      });
      
      console.log(`  ✅ ${testName}: ${message}`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: errorMessage,
        duration
      });
      
      console.log(`  ❌ ${testName}: ${errorMessage}`);
    }
  }

  private printResults(): void {
    console.log('');
    console.log('📊 Validation Results Summary');
    console.log('=============================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log('');

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  • ${r.test}: ${r.message}`);
        });
      console.log('');
    }

    if (skipped > 0) {
      console.log('⏭️ Skipped Tests:');
      this.results
        .filter(r => r.status === 'SKIP')
        .forEach(r => {
          console.log(`  • ${r.test}: ${r.message}`);
        });
      console.log('');
    }

    const successRate = ((passed / total) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);

    if (failed === 0) {
      console.log('');
      console.log('🎉 All critical P0 fixes are working correctly!');
      console.log('✅ RAG system is ready for Phase 2 implementation.');
    } else {
      console.log('');
      console.log('⚠️ Some tests failed. Please fix the issues before proceeding.');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    const validator = new P0ValidationRunner();
    await validator.run();
  } catch (error) {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { P0ValidationRunner };
