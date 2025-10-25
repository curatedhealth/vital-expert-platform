# RAG System Migration Guide

## Overview

This guide helps you migrate from the old RAG service implementations to the new unified RAG system.

## What Changed?

### Consolidated Services

**Before (Multiple Services):**
- `supabase-rag-service.ts` - Supabase-specific implementation
- `enhanced-rag-service.ts` - Advanced features
- `cloud-rag-service.ts` - Cloud-based implementation
- `cached-rag-service.ts` - Caching layer
- Mock embedding implementations

**After (Single Service):**
- `unified-rag-service.ts` - All-in-one production-ready service
- `openai-embedding-service.ts` - Real embedding generation
- Integrated caching, vector search, and multiple strategies

### New Database Functions

Added 7 new SQL functions for vector search:
1. `search_knowledge_by_embedding` - General semantic search
2. `search_knowledge_for_agent` - Agent-optimized search
3. `search_knowledge_base` - Flexible filtered search
4. `match_user_memory_with_filters` - Enhanced user memory
5. `hybrid_search` - Combined vector + full-text
6. `get_similar_documents` - Document similarity
7. `update_knowledge_statistics` - Auto-update stats

## Migration Steps

### Step 1: Apply Database Migrations

```bash
# Run the new SQL migration
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f database/sql/migrations/2025/20250125000000_create_missing_vector_search_functions.sql
```

### Step 2: Seed Knowledge Base

```bash
# Install dependencies if needed
npm install

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run seeding script
node scripts/seed-regulatory-knowledge-base.js
```

### Step 3: Update Import Statements

**Old Code:**
```typescript
import { __supabaseRAGService } from '@/shared/services/rag/supabase-rag-service';
import { enhancedRAGService } from '@/features/rag/services/enhanced-rag-service';

// Query using old service
const result = await __supabaseRAGService.enhancedSearch(query, options);
```

**New Code:**
```typescript
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

// Query using new service
const result = await unifiedRAGService.query({
  text: query,
  strategy: 'hybrid', // or 'semantic', 'keyword', 'agent-optimized'
  maxResults: 5,
  similarityThreshold: 0.7,
});
```

### Step 4: Update RAG Query Patterns

#### Basic Query

**Before:**
```typescript
const { context, sources } = await ragService.enhancedSearch(
  question,
  { agentType: 'regulatory', maxResults: 5 }
);
```

**After:**
```typescript
const result = await unifiedRAGService.query({
  text: question,
  domain: 'regulatory_affairs',
  maxResults: 5,
  strategy: 'hybrid',
});

const { context, sources } = result;
```

#### Agent-Optimized Search

**Before:**
```typescript
const results = await ragService.searchForAgent(agentId, query, 10);
```

**After:**
```typescript
const result = await unifiedRAGService.query({
  text: query,
  agentId: agentId,
  maxResults: 10,
  strategy: 'agent-optimized',
});
```

#### Batch Queries

**Before:**
```typescript
const promises = queries.map(q => ragService.searchKnowledge(q));
const results = await Promise.all(promises);
```

**After:**
```typescript
const results = await unifiedRAGService.batchQuery(
  queries.map(q => ({ text: q, strategy: 'hybrid' }))
);
```

### Step 5: Update Embedding Generation

**Before (Mock):**
```typescript
private async getQueryEmbedding(text: string): Promise<number[]> {
  // Mock implementation
  return Array.from({ length: 1536 }, () => Math.random());
}
```

**After (Real):**
```typescript
import { embeddingService } from '@/lib/services/embeddings/openai-embedding-service';

const embedding = await embeddingService.generateEmbedding(text);
// Returns actual OpenAI embeddings
```

### Step 6: Update LangChain Integration

**Before:**
```typescript
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
```

**After:**
```typescript
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-large', // Latest model
});
```

## API Reference

### UnifiedRAGService

#### `query(query: RAGQuery): Promise<RAGResult>`

Main query method with multiple strategies.

**Parameters:**
```typescript
interface RAGQuery {
  text: string;                    // Query text
  agentId?: string;               // Agent ID for optimization
  userId?: string;                // User ID for personalization
  sessionId?: string;             // Session ID for context
  domain?: string;                // Filter by domain
  phase?: string;                 // Filter by phase
  maxResults?: number;            // Max results (default: 5)
  similarityThreshold?: number;   // Min similarity (default: 0.7)
  strategy?: string;              // Search strategy
  includeMetadata?: boolean;      // Include metadata
}
```

**Returns:**
```typescript
interface RAGResult {
  sources: Document[];            // Retrieved documents
  context: string;                // Formatted context
  metadata: {
    strategy: string;             // Strategy used
    responseTime: number;         // Time in ms
    cached: boolean;              // From cache?
    totalSources: number;         // Number of sources
  };
}
```

**Strategies:**
- `semantic` - Pure vector similarity search
- `hybrid` - Vector + full-text search (recommended)
- `keyword` - Full-text search only
- `agent-optimized` - Boosted for agent capabilities

#### `addDocument(doc): Promise<string>`

Add document to knowledge base.

```typescript
const docId = await unifiedRAGService.addDocument({
  title: 'FDA Guidance Document',
  content: 'Document content...',
  domain: 'regulatory_affairs',
  tags: ['fda', 'guidance', '510k'],
  metadata: { source: 'fda.gov' },
});
```

#### `batchQuery(queries: RAGQuery[]): Promise<RAGResult[]>`

Process multiple queries efficiently.

```typescript
const results = await unifiedRAGService.batchQuery([
  { text: 'What is 510k?', strategy: 'hybrid' },
  { text: 'EMA requirements', strategy: 'semantic' },
]);
```

#### `getHealthMetrics(): Promise<HealthMetrics>`

Get system health and statistics.

```typescript
const health = await unifiedRAGService.getHealthMetrics();
console.log(`Status: ${health.status}`);
console.log(`Documents: ${health.totalDocuments}`);
console.log(`Chunks: ${health.totalChunks}`);
```

## Environment Variables

Required:
```bash
OPENAI_API_KEY=sk-...                           # OpenAI API key
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=...                   # Service role key
```

Optional:
```bash
RAG_ENABLE_CACHING=true                         # Enable caching
RAG_MAX_CACHE_SIZE=1000                         # Max cache entries
RAG_DEFAULT_STRATEGY=hybrid                     # Default strategy
```

## Performance Optimization

### Caching

The unified service includes built-in caching:
- LRU cache with configurable size
- 1-hour TTL (time-to-live)
- Automatic cache eviction
- ~10-50ms response time for cached queries

### Batch Processing

Use batch queries for multiple questions:
```typescript
// Instead of this (slow):
for (const query of queries) {
  await ragService.query({ text: query });
}

// Do this (fast):
await ragService.batchQuery(
  queries.map(q => ({ text: q }))
);
```

### Embedding Cost Optimization

```typescript
// Estimate costs before generating
const estimate = embeddingService.estimateCost(texts);
console.log(`Estimated cost: $${estimate.estimatedCost.toFixed(4)}`);

// Use caching to reduce costs
const embedding = await embeddingService.generateEmbedding(text, {
  useCache: true, // Reuse previously generated embeddings
});
```

## Testing

### Unit Tests

```typescript
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

describe('Unified RAG Service', () => {
  it('should perform semantic search', async () => {
    const result = await unifiedRAGService.query({
      text: 'FDA 510k requirements',
      strategy: 'semantic',
      maxResults: 3,
    });

    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.context).toContain('510k');
  });
});
```

### Integration Tests

```bash
# Test database functions
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "
  SELECT * FROM search_knowledge_by_embedding(
    (SELECT embedding FROM document_chunks LIMIT 1),
    'regulatory_affairs',
    'openai',
    5,
    0.7
  );
"
```

## Troubleshooting

### Issue: Vector store not initialized

**Solution:**
```typescript
// Check Supabase connection
const health = await unifiedRAGService.getHealthMetrics();
console.log(health.vectorStoreStatus); // Should be 'connected'
```

### Issue: No embeddings generated

**Solution:**
1. Check OpenAI API key is set
2. Verify API key has sufficient quota
3. Check for rate limiting errors

```typescript
// Test connection
const isConnected = await embeddingService.testConnection();
if (!isConnected) {
  console.error('OpenAI connection failed');
}
```

### Issue: No search results

**Solution:**
1. Verify knowledge base is seeded
2. Check similarity threshold (lower it)
3. Try different strategies

```typescript
// Check document count
const health = await unifiedRAGService.getHealthMetrics();
console.log(`Documents: ${health.totalDocuments}`);

// If 0, run seeding script
```

## Migration Checklist

- [ ] Apply database migrations
- [ ] Seed knowledge base with documents
- [ ] Update import statements
- [ ] Replace old RAG service calls
- [ ] Update embedding generation
- [ ] Test semantic search
- [ ] Test hybrid search
- [ ] Test agent-optimized search
- [ ] Verify caching works
- [ ] Run integration tests
- [ ] Monitor performance metrics
- [ ] Update documentation

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API reference
3. Check database logs: `docker logs vital-supabase`
4. Review application logs for errors

## Next Steps

1. **Add More Documents**: Expand knowledge base with domain-specific content
2. **Fine-tune Strategies**: Adjust weights in hybrid search
3. **Monitor Performance**: Track query latency and cache hit rates
4. **A/B Testing**: Compare strategy performance
5. **Custom Domains**: Add organization-specific knowledge domains
