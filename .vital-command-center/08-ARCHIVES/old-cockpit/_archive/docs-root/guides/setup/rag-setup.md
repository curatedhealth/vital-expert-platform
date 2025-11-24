# RAG Knowledge Base Setup Guide

**Last Updated**: 2025-10-03
**Purpose**: Configure internal knowledge base for Virtual Advisory Board experts
**Status**: Ready for integration

---

## 🎯 What is RAG?

**RAG** (Retrieval-Augmented Generation) allows experts to query your internal company documents:
- Clinical trial data
- Regulatory submissions
- Internal guidelines
- Safety reports
- Manufacturing protocols
- Market research

---

## 🔧 Option 1: Use Existing RAG System

If you already have a RAG system (Pinecone, Weaviate, Chroma, etc.):

### Add to `.env.local`:

```bash
RAG_ENDPOINT=https://your-rag-endpoint.com/api
RAG_API_KEY=your-rag-api-key-here
```

### Update `expert-tools.ts`:

Replace the placeholder code in `createKnowledgeBaseTool()` (lines 195-256) with your actual RAG integration.

**Example for Pinecone**:
```typescript
const response = await fetch(`${process.env.RAG_ENDPOINT}/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': process.env.RAG_API_KEY!
  },
  body: JSON.stringify({
    queries: [{
      query,
      top_k: topK,
      filter: category ? { category } : undefined
    }]
  })
});
```

---

## 🚀 Option 2: Build Simple RAG with Supabase (Recommended)

You already have Supabase running! Let's use it for RAG.

### Step 1: Enable pgvector Extension

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings
  metadata JSONB,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON knowledge_base_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for category filtering
CREATE INDEX idx_kb_category ON knowledge_base_documents(category);
```

### Step 2: Create RAG Service

Create `/src/lib/services/supabase-rag.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY
});

export async function queryKnowledgeBase(
  query: string,
  category?: string,
  topK: number = 3
) {
  // Generate embedding for query
  const queryEmbedding = await embeddings.embedQuery(query);

  // Search for similar documents
  let queryBuilder = supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_category: category
  });

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`RAG query failed: ${error.message}`);
  }

  return data.map((doc: any) => ({
    content: doc.content,
    source: doc.metadata?.source || 'Unknown',
    relevance: doc.similarity,
    category: doc.category,
    lastUpdated: doc.updated_at
  }));
}

export async function addDocument(
  content: string,
  metadata: any,
  category: string
) {
  // Generate embedding
  const embedding = await embeddings.embedQuery(content);

  // Insert document
  const { data, error } = await supabase
    .from('knowledge_base_documents')
    .insert({
      content,
      embedding,
      metadata,
      category
    });

  if (error) {
    throw new Error(`Failed to add document: ${error.message}`);
  }

  return data;
}
```

### Step 3: Create Similarity Search Function

```sql
-- Create similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count INT DEFAULT 3,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  category TEXT,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base_documents.id,
    knowledge_base_documents.content,
    knowledge_base_documents.metadata,
    knowledge_base_documents.category,
    knowledge_base_documents.updated_at,
    1 - (knowledge_base_documents.embedding <=> query_embedding) as similarity
  FROM knowledge_base_documents
  WHERE
    CASE
      WHEN filter_category IS NOT NULL
      THEN knowledge_base_documents.category = filter_category
      ELSE TRUE
    END
  ORDER BY knowledge_base_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Step 4: Update expert-tools.ts

Replace the knowledge_base tool implementation:

```typescript
import { queryKnowledgeBase } from './supabase-rag';

// In createKnowledgeBaseTool():
func: async ({ query, category, topK = 3 }) => {
  const startTime = Date.now();

  try {
    const results = await queryKnowledgeBase(query, category, topK);
    const duration = Date.now() - startTime;

    return JSON.stringify({
      query,
      category,
      results,
      count: results.length,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    }, null, 2);

  } catch (error: any) {
    console.error('Knowledge base error:', error);
    return JSON.stringify({
      error: error.message || 'Knowledge base search failed',
      query,
      category
    });
  }
}
```

### Step 5: Add Sample Documents

Create `/scripts/seed-knowledge-base.ts`:

```typescript
import { addDocument } from '../src/lib/services/supabase-rag';

async function seedKnowledgeBase() {
  // Sample clinical trial document
  await addDocument(
    `Phase 3 clinical trial NCT04567890 for psoriasis biologic showed
    78% PASI 90 response at week 16. Safety profile comparable to placebo
    with no serious adverse events reported.`,
    {
      source: 'Clinical Trial NCT04567890',
      trial_phase: 'Phase 3',
      indication: 'Psoriasis',
      year: 2024
    },
    'clinical'
  );

  // Sample regulatory document
  await addDocument(
    `FDA approved biologics for moderate-to-severe psoriasis require
    demonstration of efficacy (PASI 75 at week 12-16) and acceptable
    safety profile including cardiovascular and infection risk assessment.`,
    {
      source: 'FDA Guidance Document',
      regulation: 'BLA Requirements',
      year: 2024
    },
    'regulatory'
  );

  console.log('Knowledge base seeded successfully!');
}

seedKnowledgeBase();
```

Run: `npx ts-node scripts/seed-knowledge-base.ts`

### Step 6: Set Environment Variable

```bash
# In .env.local
RAG_ENDPOINT=supabase  # Special flag to use Supabase RAG
# No RAG_API_KEY needed - uses existing Supabase credentials
```

---

## 🧪 Option 3: Use Managed RAG Services

### A. Pinecone (Recommended for Production)

**Pros**: Scalable, fast, managed
**Cons**: $70/month minimum
**Setup**: https://www.pinecone.io

```bash
RAG_ENDPOINT=https://your-index.pinecone.io
RAG_API_KEY=your-pinecone-api-key
```

### B. Weaviate (Open Source Option)

**Pros**: Free, self-hosted, powerful
**Cons**: Need to deploy yourself
**Setup**: https://weaviate.io

```bash
RAG_ENDPOINT=http://localhost:8080/v1
RAG_API_KEY=your-weaviate-api-key
```

### C. Chroma (Simple Local Option)

**Pros**: Free, simple, local
**Cons**: Not production-scale
**Setup**: https://www.trychroma.com

```bash
RAG_ENDPOINT=http://localhost:8000
# No API key needed for local Chroma
```

---

## 📊 Testing RAG Integration

### Test Query:

```bash
curl -X POST http://localhost:3000/api/panel/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "parallel",
    "question": "What are our internal clinical trial results for psoriasis?",
    "personas": ["Clinical Development Lead"]
  }'
```

**Expected**: Expert uses `knowledge_base` tool to query internal documents

### Verify Tool Call:

```bash
curl http://localhost:3000/api/panel/tools?toolName=knowledge_base
```

---

## 🎯 Recommended Approach

**For Development**: Use **Supabase RAG** (Option 2)
- ✅ Already have Supabase running
- ✅ Free (no additional cost)
- ✅ pgvector is production-ready
- ✅ Fast setup (30 minutes)

**For Production**: Upgrade to **Pinecone** (Option 3A)
- ✅ Managed, scalable
- ✅ Better performance at scale
- ✅ Enterprise support
- ⚠️ $70/month minimum

---

## 📝 Current Status

Your `.env.local` has RAG configured as **commented out**:

```bash
# RAG Configuration (Optional - for knowledge base tool)
# RAG_ENDPOINT=https://your-rag-endpoint.com/api
# RAG_API_KEY=your-rag-api-key-here
```

**To enable RAG**:

1. Choose an option (recommend Option 2 - Supabase)
2. Follow setup steps
3. Uncomment and set RAG_ENDPOINT
4. Restart dev server
5. Test with query above

---

## 🚨 No RAG? No Problem!

The system works perfectly without RAG:
- ✅ Web Search (Tavily) for public information
- ✅ PubMed Search for medical literature
- ✅ Calculator for math operations
- ⚠️ Knowledge Base returns "not configured" gracefully

RAG is **optional** but highly valuable for internal company data.

---

**File**: [RAG_SETUP_GUIDE.md](RAG_SETUP_GUIDE.md)
**Last Updated**: 2025-10-03
**Recommended**: Start with Supabase RAG (Option 2)
