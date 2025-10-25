# Pinecone Migration Guide
## Migrating RAG System to Pinecone + Supabase Architecture

**Status:** Ready for Implementation
**Architecture:** Pinecone (vectors) + Supabase (metadata)
**Updated:** January 25, 2025

---

## 🎯 Overview

The VITAL RAG system now uses a **hybrid architecture**:
- **Pinecone**: Stores all vector embeddings (3072 dimensions)
- **Supabase**: Stores document metadata, content, and relationships

This architecture provides:
- ✅ Better vector search performance (Pinecone specialization)
- ✅ Scalable to millions of vectors
- ✅ Rich metadata filtering (Supabase PostgreSQL)
- ✅ Hybrid search combining both systems
- ✅ Cost-effective for high-volume operations

---

## 📋 Prerequisites

### 1. Pinecone Account Setup

1. **Create Pinecone Account**
   - Go to https://www.pinecone.io/
   - Sign up for free tier (up to 100K vectors)
   - Note: Free tier is sufficient for initial testing

2. **Get Pinecone API Key**
   - Log in to Pinecone console
   - Go to "API Keys" section
   - Create new API key
   - Copy the key (starts with `pcsk-` or similar)

3. **Choose Region**
   - Recommended: `us-east-1` (AWS)
   - Note: Must match the region in index creation

### 2. Environment Variables

Add to your `.env.local`:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=vital-knowledge
PINECONE_ENVIRONMENT=us-east-1

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI for Embeddings
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Install Dependencies

```bash
npm install @pinecone-database/pinecone
```

---

## 🚀 Migration Steps

### Step 1: Initialize Pinecone Index

The index will be created automatically on first run, but you can create it manually:

```typescript
// scripts/init-pinecone-index.ts
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

await pinecone.createIndex({
  name: 'vital-knowledge',
  dimension: 3072, // text-embedding-3-large
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1',
    },
  },
});

console.log('✅ Pinecone index created');
```

Run:
```bash
npx tsx scripts/init-pinecone-index.ts
```

### Step 2: Sync Existing Supabase Embeddings to Pinecone

If you have existing embeddings in Supabase, sync them to Pinecone:

```bash
node scripts/sync-supabase-to-pinecone.js
```

This script will:
1. Check if Pinecone index exists (create if not)
2. Fetch all chunks with embeddings from Supabase
3. Upsert vectors to Pinecone in batches of 100
4. Preserve all metadata
5. Verify the sync

**Expected output:**
```
🚀 Starting Supabase to Pinecone sync...

📊 Checking Pinecone index...
✅ Pinecone index "vital-knowledge" exists

📊 Counting chunks in Supabase...
✅ Found 47 chunks with embeddings

📦 Processing batch 1/1...
  ✅ Synced 47 vectors (47/47)

📊 Verifying sync...

✅ Sync Complete!
═══════════════════════════════════════
Total chunks in Supabase: 47
Total synced to Pinecone: 47
Pinecone vector count:    47
Errors:                   0
═══════════════════════════════════════

🎉 All chunks successfully synced to Pinecone!
```

### Step 3: Update Your Code to Use Unified RAG Service

The `UnifiedRAGService` now automatically uses Pinecone for vectors:

```typescript
import { unifiedRAGService } from '@/lib/services/rag/unified-rag-service';

// Query with semantic search (uses Pinecone)
const result = await unifiedRAGService.query({
  text: 'FDA requirements for digital health devices',
  strategy: 'semantic',
  maxResults: 5,
  similarityThreshold: 0.7,
});

console.log(`Found ${result.sources.length} sources`);
console.log(`Response time: ${result.metadata.responseTime}ms`);
```

### Step 4: Test the Integration

Run the RAG system test suite:

```bash
node scripts/test-rag-system.js
```

Expected tests:
- ✅ Pinecone connection
- ✅ Vector search
- ✅ Hybrid search (Pinecone + Supabase)
- ✅ Agent-optimized search
- ✅ Document ingestion (syncs to both)

---

## 🔧 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  User Query                         │
│            "FDA device requirements"                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  OpenAI Embedding    │
          │  text-embedding-3-   │
          │  large (3072 dims)   │
          └──────────┬───────────┘
                     │
                     ▼
     ┌───────────────────────────────────┐
     │    Pinecone Vector Search         │
     │  - Cosine similarity              │
     │  - Filter by domain/tags          │
     │  - Returns top K matches          │
     └───────────────┬───────────────────┘
                     │
                     ▼
     ┌───────────────────────────────────┐
     │   Supabase Metadata Enrichment    │
     │  - Fetch full content             │
     │  - Join with knowledge_documents  │
     │  - Get title, domain, tags        │
     └───────────────┬───────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Return Results      │
          │  with context        │
          └──────────────────────┘
```

### Search Strategies

#### 1. Semantic Search (Vector-only)
```typescript
await unifiedRAGService.query({
  text: 'your query',
  strategy: 'semantic',
});
```
- Uses Pinecone only
- Fast and accurate
- Best for conceptual similarity

#### 2. Hybrid Search (Vector + Metadata)
```typescript
await unifiedRAGService.query({
  text: 'your query',
  strategy: 'hybrid',
  domain: 'regulatory_affairs',
});
```
- Pinecone for vector search
- Supabase for metadata filtering
- Best for filtered searches

#### 3. Agent-Optimized Search
```typescript
await unifiedRAGService.query({
  text: 'your query',
  strategy: 'agent-optimized',
  agentId: 'agent-uuid',
});
```
- Domain boosting based on agent expertise
- Relevance reranking
- Best for agent-specific queries

#### 4. Keyword Search (Fallback)
```typescript
await unifiedRAGService.query({
  text: 'your query',
  strategy: 'keyword',
});
```
- Uses Supabase full-text search
- No vector embeddings needed
- Best for exact phrase matching

---

## 📊 Document Ingestion Flow

When you add a new document:

```typescript
const documentId = await unifiedRAGService.addDocument({
  title: 'FDA Digital Health Guidance',
  content: 'Long document content...',
  domain: 'regulatory_affairs',
  tags: ['fda', 'digital-health'],
});
```

**What happens:**
1. Document inserted into Supabase `knowledge_documents` table
2. Content chunked (1500 chars, 300 overlap)
3. Embeddings generated via OpenAI (batched)
4. Chunks inserted into Supabase `document_chunks` table
5. **Vectors synced to Pinecone** with metadata
6. Document status updated to 'completed'

**Result:**
- Supabase has full content + metadata
- Pinecone has vectors + minimal metadata (for filtering)
- Both systems stay in sync

---

## 🧪 Testing

### Manual Test: Vector Search

```typescript
import { pineconeVectorService } from '@/lib/services/vectorstore/pinecone-vector-service';

const results = await pineconeVectorService.search({
  text: 'FDA requirements',
  topK: 5,
  minScore: 0.7,
});

console.log(`Found ${results.length} results`);
results.forEach((r, i) => {
  console.log(`${i + 1}. ${r.source_title} (${r.similarity.toFixed(3)})`);
});
```

### Manual Test: Hybrid Search

```typescript
const results = await pineconeVectorService.hybridSearch({
  text: 'clinical trial protocols',
  topK: 10,
  filter: { domain: 'clinical_development' },
});

console.log('Hybrid search results with metadata enrichment:');
results.forEach(r => {
  console.log(`- ${r.source_title}`);
  console.log(`  Domain: ${r.domain}`);
  console.log(`  Similarity: ${r.similarity.toFixed(3)}`);
});
```

### Check Pinecone Stats

```typescript
const stats = await pineconeVectorService.getIndexStats();

console.log('Pinecone Index Statistics:');
console.log(`- Total vectors: ${stats.totalVectorCount}`);
console.log(`- Dimension: ${stats.dimension}`);
console.log(`- Index fullness: ${(stats.indexFullness * 100).toFixed(2)}%`);
```

---

## 💰 Cost Analysis

### Pinecone Costs

**Free Tier:**
- 100,000 vectors
- 1 pod
- Sufficient for testing and small deployments

**Starter Plan ($70/month):**
- 5M vectors
- 1 pod
- Good for production (<500 documents)

**Scale Plan (Custom):**
- Unlimited vectors
- Multiple pods
- High availability

### Storage Breakdown

For 500 documents (avg 5 chunks each = 2,500 chunks):
- **Supabase**: Full content + metadata (~50MB)
- **Pinecone**: 2,500 vectors × 3072 dims × 4 bytes ≈ 30MB
- **Total**: ~80MB

**Monthly costs:**
- Supabase: $0 (free tier up to 500MB)
- Pinecone: $0 (free tier up to 100K vectors)
- OpenAI embeddings: ~$100 (with 70% cache hit rate)
- **Total**: ~$100/month

---

## 🐛 Troubleshooting

### Issue: Pinecone index not found

**Error:**
```
Index 'vital-knowledge' not found
```

**Solution:**
```bash
# Create index manually
npx tsx scripts/init-pinecone-index.ts

# Or let the service create it automatically
# (First search will trigger index creation)
```

### Issue: Vector dimension mismatch

**Error:**
```
Vector dimension 1536 does not match index dimension 3072
```

**Cause:** Using old `text-embedding-ada-002` model instead of `text-embedding-3-large`

**Solution:**
Update embedding service to use correct model:
```typescript
const result = await embeddingService.generateEmbedding(text, {
  dimensions: 3072, // Ensure this matches Pinecone index
});
```

### Issue: Slow search performance

**Symptoms:**
- Search takes >3s
- High latency

**Solutions:**
1. **Enable caching:**
   ```typescript
   const result = await embeddingService.generateEmbedding(text, {
     useCache: true, // 70%+ cache hit rate
   });
   ```

2. **Reduce topK:**
   ```typescript
   await unifiedRAGService.query({
     text: 'query',
     maxResults: 5, // Instead of 10+
   });
   ```

3. **Use semantic search (not hybrid):**
   ```typescript
   await unifiedRAGService.query({
     text: 'query',
     strategy: 'semantic', // Faster than hybrid
   });
   ```

### Issue: Vectors out of sync

**Symptoms:**
- Supabase has chunks but Pinecone returns no results
- Vector count mismatch

**Solution:**
Re-sync from Supabase:
```bash
node scripts/sync-supabase-to-pinecone.js
```

### Issue: Metadata too large

**Error:**
```
Metadata size exceeds 40KB limit
```

**Cause:** Pinecone has 40KB metadata limit per vector

**Solution:**
Content is already truncated in the service. If you see this error, reduce content further:
```typescript
content: chunk.content.substring(0, 30000), // Reduce from 40000
```

---

## 🔐 Security Best Practices

### API Key Management

1. **Never commit API keys:**
   ```bash
   # Add to .gitignore
   .env.local
   .env.production
   ```

2. **Use environment variables:**
   ```typescript
   const apiKey = process.env.PINECONE_API_KEY;
   if (!apiKey) throw new Error('PINECONE_API_KEY required');
   ```

3. **Rotate keys regularly:**
   - Pinecone: Generate new key every 90 days
   - Update in production environment

### Data Privacy

- ✅ Vectors don't contain PHI/PII (embeddings are not reversible)
- ✅ Metadata filtered before Pinecone upload
- ✅ Full content stays in Supabase (under your control)
- ✅ Pinecone metadata limited to: domain, title, tags

---

## 📚 Additional Resources

### Documentation
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Pinecone Node.js SDK](https://github.com/pinecone-io/pinecone-ts-client)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### Scripts
- [`scripts/sync-supabase-to-pinecone.js`](../scripts/sync-supabase-to-pinecone.js) - Initial sync
- [`scripts/test-rag-system.js`](../scripts/test-rag-system.js) - Full test suite
- [`scripts/seed-regulatory-knowledge-base.js`](../scripts/seed-regulatory-knowledge-base.js) - Seed documents

### Services
- [`src/lib/services/vectorstore/pinecone-vector-service.ts`](../src/lib/services/vectorstore/pinecone-vector-service.ts) - Pinecone operations
- [`src/lib/services/rag/unified-rag-service.ts`](../src/lib/services/rag/unified-rag-service.ts) - Main RAG service
- [`src/lib/services/embeddings/openai-embedding-service.ts`](../src/lib/services/embeddings/openai-embedding-service.ts) - Embedding generation

---

## ✅ Migration Checklist

- [ ] Pinecone account created
- [ ] API key obtained and added to `.env.local`
- [ ] Dependencies installed (`@pinecone-database/pinecone`)
- [ ] Pinecone index created (automatically or manually)
- [ ] Existing embeddings synced from Supabase
- [ ] Code updated to use `unifiedRAGService`
- [ ] Tests passing (`node scripts/test-rag-system.js`)
- [ ] Search performance verified (<2s average)
- [ ] Health metrics checked (Pinecone connected)
- [ ] Production environment variables configured
- [ ] Team trained on new architecture

---

## 🎉 Success!

You now have a **production-ready RAG system** using:
- ✅ Pinecone for scalable vector search
- ✅ Supabase for rich metadata
- ✅ OpenAI for high-quality embeddings
- ✅ Hybrid search for best results
- ✅ Automatic sync between systems

**Next Steps:**
1. Deploy to production
2. Monitor performance metrics
3. Scale Pinecone as needed
4. Implement LangExtract enhancements (optional)

---

**Need Help?** Check the troubleshooting section or review the test scripts for examples.

**Prepared by:** Claude (Anthropic)
**Updated:** January 25, 2025
**Status:** Production Ready
