# RAG Empty Results - Root Cause Analysis

**Date:** 2025-01-05  
**Status:** 🔴 **CRITICAL ISSUE IDENTIFIED**

---

## Problem

Mode 1 is returning **0 RAG sources** (`totalSources: 0`) even though:
- ✅ Documents exist in `knowledge_documents` table
- ✅ Domains are set: `["Digital Health", "Regulatory Affairs"]`
- ✅ RAG service is initialized
- ✅ Tools are active

---

## Root Cause Analysis

### 1. **NO CHUNKS OR EMBEDDINGS** 🔴 **CRITICAL**

**Finding:**
- **364 total documents** in `knowledge_documents` table
- **0 chunks** in `document_chunks` table
- **0 embeddings** in `document_chunks.embedding` column

**Impact:**
- RAG cannot retrieve documents because:
  - Pinecone vector search requires embeddings (vectors)
  - Supabase vector search requires embeddings in `document_chunks.embedding`
  - No chunks = no searchable content

**Evidence:**
```sql
SELECT 
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT c.id) as total_chunks,
    COUNT(DISTINCT CASE WHEN c.embedding IS NOT NULL THEN c.id END) as chunks_with_embeddings
FROM knowledge_documents d
LEFT JOIN document_chunks c ON c.document_id = d.id;
-- Result: {total_documents: 364, total_chunks: 0, chunks_with_embeddings: 0}
```

---

### 2. **Domain Format Mismatch** ⚠️ **HIGH**

**Finding:**
- Workflow passes `selected_domains` like `["Digital Health", "Regulatory Affairs"]` (domain names)
- `knowledge_domains` table has:
  - `domain_id`: UUID (e.g., `c3f33db0-10f5-4b94-b4a1-e231e0d6a20a`)
  - `domain_name`: "Digital Health", "Regulatory Affairs"
  - `code`: "DIGITAL", "regulatory_affairs"
  - `slug`: "digital-health", "regulatory-affairs"
- `knowledge_documents.domain` is a **string** (not a foreign key to `knowledge_domains.domain_id`)
- Pinecone filter expects `domain_id` (UUIDs), not domain names

**Impact:**
- RAG service's `_build_pinecone_filter()` uses `domain_ids[0]` directly without mapping
- Domain names don't match Pinecone metadata `domain_id` field
- Filtering fails silently

**Evidence:**
```sql
-- knowledge_domains table
SELECT domain_id, domain_name, code, slug 
FROM knowledge_domains 
WHERE domain_name IN ('Digital Health', 'Regulatory Affairs');
-- Result: Shows UUIDs for domain_id, but knowledge_documents uses string domain names
```

---

### 3. **Document Status** ⚠️ **MEDIUM**

**Finding:**
- All documents have `status: "failed"` or `status: "processing"`
- No documents have `status: "active"`

**Impact:**
- Documents might be filtered out if RAG service checks `status = 'active'`
- Failed status suggests documents were never successfully processed

**Evidence:**
```sql
SELECT domain, status, COUNT(*) 
FROM knowledge_documents 
WHERE domain IN ('Digital Health', 'Regulatory Affairs')
GROUP BY domain, status;
-- Result: All documents have status='failed' or 'processing'
```

---

## Solution

### Option 1: **Reprocess Documents** (Recommended - 4-6 hours)

1. **Chunk documents**:
   - Create chunks from `knowledge_documents.content`
   - Store in `document_chunks` table
   - Chunk size: 1000 chars, overlap: 200 chars

2. **Generate embeddings**:
   - Use OpenAI `text-embedding-3-large` or `text-embedding-ada-002`
   - Store embeddings in `document_chunks.embedding` (vector type)
   - Also upload to Pinecone index (if using Pinecone)

3. **Update document status**:
   - Set `status = 'active'` for successfully processed documents

4. **Fix domain mapping**:
   - Map domain names to `domain_id` UUIDs from `knowledge_domains` table
   - Update RAG service to accept domain names and convert to domain_ids
   - Or update `knowledge_documents.domain` to use `domain_id` UUIDs

### Option 2: **Use Supabase Vector Search Only** (Quick Fix - 1-2 hours)

1. **Skip Pinecone**:
   - Use `strategy="supabase_only"` in RAG service
   - Rely on Supabase `pgvector` extension for vector search

2. **Quick chunking**:
   - Create chunks directly in Supabase
   - Generate embeddings using Supabase function or Python script
   - Store in `document_chunks.embedding`

3. **Fix domain mapping**:
   - Map domain names to domain_ids in RAG query

---

## Immediate Action Items

1. ✅ **Verify documents exist** - DONE
2. ⏳ **Check if document processing pipeline exists** - IN PROGRESS
3. ⏳ **Create document processing script** - PENDING
4. ⏳ **Fix domain name to domain_id mapping** - PENDING
5. ⏳ **Test RAG queries after processing** - PENDING

---

## Files to Fix

1. `services/ai-engine/src/services/unified_rag_service.py`:
   - Add domain name → domain_id mapping
   - Handle domain name format in `_build_pinecone_filter()`

2. `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`:
   - Map `selected_domains` to `domain_ids` before calling RAG service
   - Or pass domain names and let RAG service handle mapping

3. **Document Processing Script** (NEW):
   - Chunk documents from `knowledge_documents`
   - Generate embeddings
   - Store in `document_chunks` with embeddings
   - Upload to Pinecone (if using)

---

## Next Steps

1. **Check if document processing pipeline exists**
2. **Create/fix document processing script**
3. **Process existing documents**
4. **Fix domain mapping in RAG service**
5. **Test RAG queries**

