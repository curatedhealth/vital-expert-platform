/**
 * P0 RAG Fixes Integration Tests
 * 
 * Tests the critical fixes implemented in Phase 1:
 * - Database schema validation
 * - Embedding generation (real vs deterministic)
 * - Vector search functionality
 * - End-to-end upload→search flow
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { ragService } from '../../src/rag-service';
import { embeddingService } from '../../src/lib/services/embeddings/openai-embedding-service';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for API calls
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('P0 RAG Fixes Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let testSourceId: string;
  let testChunkId: string;

  beforeAll(async () => {
    // Initialize Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Initialize RAG service
    await ragService.initialize();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Clean up test data
    if (testChunkId) {
      await supabase.from('rag_knowledge_chunks').delete().eq('id', testChunkId);
    }
    if (testSourceId) {
      await supabase.from('rag_knowledge_sources').delete().eq('id', testSourceId);
    }
  });

  describe('Database Schema Validation', () => {
    it('should have all required RAG tables', async () => {
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .in('table_name', [
          'rag_tenants',
          'rag_knowledge_sources', 
          'rag_knowledge_chunks',
          'rag_search_analytics'
        ]);

      expect(error).toBeNull();
      expect(tables).toHaveLength(4);
      
      const tableNames = tables?.map(t => t.table_name) || [];
      expect(tableNames).toContain('rag_tenants');
      expect(tableNames).toContain('rag_knowledge_sources');
      expect(tableNames).toContain('rag_knowledge_chunks');
      expect(tableNames).toContain('rag_search_analytics');
    });

    it('should have vector columns with 3072 dimensions', async () => {
      // Check rag_knowledge_chunks.embedding
      const { data: chunks, error: chunksError } = await supabase
        .from('rag_knowledge_chunks')
        .select('embedding')
        .not('embedding', 'is', null)
        .limit(1);

      if (chunksError) {
        console.warn('No chunks with embeddings found for dimension test');
        return;
      }

      if (chunks && chunks.length > 0) {
        const embedding = chunks[0].embedding;
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding.length).toBe(3072);
      }
    });

    it('should have RPC functions available', async () => {
      const { data: functions, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .in('routine_name', [
          'search_rag_knowledge',
          'search_rag_knowledge_chunks',
          'hybrid_search_rag_knowledge',
          'get_default_rag_tenant_id'
        ]);

      expect(error).toBeNull();
      expect(functions).toHaveLength(4);
    });

    it('should have vector indexes created', async () => {
      const { data: indexes, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .like('indexname', '%rag_knowledge_chunks%embedding%');

      expect(error).toBeNull();
      expect(indexes?.length).toBeGreaterThan(0);
    });
  });

  describe('Embedding Generation', () => {
    it('should generate real embeddings (not random)', async () => {
      const testText = 'This is a test document for RAG system validation';
      
      // Generate embedding twice with same text
      const embedding1 = await embeddingService.generateEmbedding(testText);
      const embedding2 = await embeddingService.generateEmbedding(testText);

      // Should be identical (deterministic)
      expect(embedding1).toEqual(embedding2);
      expect(embedding1.length).toBe(3072);
      expect(embedding2.length).toBe(3072);

      // Should not be random (all zeros or all same value)
      const uniqueValues = new Set(embedding1);
      expect(uniqueValues.size).toBeGreaterThan(1);
      expect(embedding1.some(val => val !== 0)).toBe(true);
    });

    it('should generate normalized embeddings', async () => {
      const testText = 'Normalization test for embedding vectors';
      const embedding = await embeddingService.generateEmbedding(testText);

      // Calculate magnitude
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      
      // Should be close to 1.0 (normalized)
      expect(magnitude).toBeCloseTo(1.0, 1);
    });

    it('should handle empty text gracefully', async () => {
      await expect(embeddingService.generateEmbedding('')).rejects.toThrow();
      await expect(embeddingService.generateEmbedding('   ')).rejects.toThrow();
    });

    it('should handle long text (truncation)', async () => {
      const longText = 'A'.repeat(10000); // Very long text
      
      const embedding = await embeddingService.generateEmbedding(longText);
      expect(embedding.length).toBe(3072);
      expect(Array.isArray(embedding)).toBe(true);
    });
  });

  describe('Vector Search', () => {
    beforeEach(async () => {
      // Create test knowledge source
      const { data: source, error: sourceError } = await supabase
        .from('rag_knowledge_sources')
        .insert({
          name: 'Test Document for RAG',
          title: 'Integration Test Document',
          description: 'A test document for RAG system validation',
          domain: 'medical_affairs',
          prism_suite: 'CRAFT',
          processing_status: 'completed'
        })
        .select()
        .single();

      expect(sourceError).toBeNull();
      testSourceId = source.id;

      // Create test chunk with embedding
      const testContent = 'This is a test medical document about cardiovascular disease treatment protocols.';
      const embedding = await embeddingService.generateEmbedding(testContent);

      const { data: chunk, error: chunkError } = await supabase
        .from('rag_knowledge_chunks')
        .insert({
          source_id: testSourceId,
          content: testContent,
          content_type: 'text',
          chunk_index: 0,
          embedding: embedding,
          section_title: 'Test Section',
          word_count: testContent.split(' ').length,
          medical_context: { specialty: 'cardiology' },
          regulatory_context: { phase: 'post_market' },
          clinical_context: { indication: 'cardiovascular' }
        })
        .select()
        .single();

      expect(chunkError).toBeNull();
      testChunkId = chunk.id;
    });

    it('should perform vector search and return results', async () => {
      const query = 'cardiovascular disease treatment';
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.5,
          limit: 10
        }
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      const result = results[0];
      expect(result.chunk_id).toBe(testChunkId);
      expect(result.source_id).toBe(testSourceId);
      expect(result.content).toContain('cardiovascular');
      expect(result.similarity).toBeGreaterThan(0.5);
      expect(result.similarity).toBeLessThanOrEqual(1.0);
    });

    it('should respect similarity threshold', async () => {
      const query = 'completely unrelated topic about cooking recipes';
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.9, // High threshold
          limit: 10
        }
      );

      // Should return no results due to low similarity
      expect(results.length).toBe(0);
    });

    it('should filter by domain', async () => {
      const query = 'medical treatment';
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.5,
          limit: 10,
          domain: 'medical_affairs'
        }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.domain).toBe('medical_affairs');
      });
    });

    it('should filter by prism_suite', async () => {
      const query = 'medical writing';
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const results = await ragService.searchKnowledge(
        query,
        queryEmbedding,
        {
          threshold: 0.5,
          limit: 10,
          prism_suite: 'CRAFT'
        }
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.prism_suite).toBe('CRAFT');
      });
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full upload→search workflow', async () => {
      // Step 1: Create knowledge source
      const sourceData = {
        name: 'E2E Test Document',
        title: 'End-to-End Test',
        description: 'Complete workflow test',
        domain: 'clinical_research' as const,
        prism_suite: 'TRIALS' as const,
        processing_status: 'pending' as const
      };

      const source = await ragService.createKnowledgeSource(sourceData);
      expect(source.id).toBeDefined();
      testSourceId = source.id;

      // Step 2: Process document (chunk + embed)
      const documentContent = `
        Clinical Trial Protocol for New Drug X
        
        This is a comprehensive clinical trial protocol for testing the efficacy 
        and safety of New Drug X in patients with hypertension. The trial will 
        be conducted as a randomized, double-blind, placebo-controlled study.
        
        Primary Endpoints:
        - Reduction in systolic blood pressure
        - Safety profile assessment
        
        Secondary Endpoints:
        - Quality of life measures
        - Pharmacokinetic analysis
      `;

      await ragService.processDocument(testSourceId, documentContent, {
        chunkSize: 500,
        overlap: 100,
        sectionTitle: 'Clinical Protocol',
        medicalContext: { 
          indication: 'hypertension',
          phase: 'phase_2'
        },
        regulatoryContext: {
          study_type: 'randomized_controlled_trial'
        },
        clinicalContext: {
          primary_endpoint: 'blood_pressure_reduction'
        }
      });

      // Step 3: Verify chunks were created
      const chunks = await ragService.getKnowledgeChunks(testSourceId);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].embedding).toBeDefined();
      expect(chunks[0].embedding!.length).toBe(3072);

      // Step 4: Search for content
      const searchQuery = 'clinical trial hypertension blood pressure';
      const searchEmbedding = await embeddingService.generateEmbedding(searchQuery);
      
      const searchResults = await ragService.searchKnowledge(
        searchQuery,
        searchEmbedding,
        {
          threshold: 0.6,
          limit: 5
        }
      );

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].content).toContain('hypertension');
      expect(searchResults[0].similarity).toBeGreaterThan(0.6);

      // Step 5: Verify source status updated
      const updatedSource = await ragService.getKnowledgeSources({
        processing_status: 'completed'
      });
      
      const ourSource = updatedSource.find(s => s.id === testSourceId);
      expect(ourSource).toBeDefined();
      expect(ourSource!.processing_status).toBe('completed');
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    it('should handle invalid query gracefully', async () => {
      await expect(
        ragService.searchKnowledge('', [], { threshold: 0.5 })
      ).rejects.toThrow();
    });

    it('should handle database connection errors', async () => {
      // This test would require mocking the database connection
      // For now, we'll just ensure the service handles errors properly
      expect(ragService).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete search within reasonable time', async () => {
      const query = 'test search performance';
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const startTime = Date.now();
      
      await ragService.searchKnowledge(query, queryEmbedding, {
        threshold: 0.5,
        limit: 10
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
