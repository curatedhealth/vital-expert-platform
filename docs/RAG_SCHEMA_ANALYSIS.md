# VITAL RAG System - Database Schema Analysis
**Date**: October 18, 2025
**Status**: Critical Issues Identified

## Executive Summary

**Finding**: The VITAL Path database has **MULTIPLE CONFLICTING RAG SCHEMAS** across migrations, creating data fragmentation and incompatibility issues.

### Critical Issues Found

1. **🔴 TRIPLE SCHEMA CONFLICT** - Three different table structures exist:
   - Schema A: `knowledge_base_documents` (migration 20251003)
   - Schema B: `rag_knowledge_sources` + `rag_knowledge_chunks` (migration 20250924)
   - Schema C: `knowledge_documents` + `document_embeddings` (migration 20251008)

2. **🔴 WRONG VECTOR DIMENSIONS** - All schemas use 1536 dimensions (ada-002)
   - Should be: 3072 dimensions (text-embedding-3-large)
   - Impact: Incompatible with current OpenAI embedding model

3. **🔴 RPC FUNCTION MISMATCH**:
   - Code expects: `search_rag_knowledge()`
   - Database has: `search_rag_knowledge_chunks()` + `match_documents()`
   - Result: Runtime errors when searching

## Detailed Schema Inventory

### Schema A: knowledge_base_documents (Migration 20251003)

**Table**: `knowledge_base_documents`

```sql
CREATE TABLE knowledge_base_documents (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),  -- ❌ Wrong dimension
  metadata JSONB,
  category TEXT,
  source TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RPC Function**: `match_documents(query_embedding vector(1536), ...)`

**Issues**:
- ❌ No tenant isolation
- ❌ No PRISM domain classification
- ❌ No chunk management (single large documents)
- ❌ 1536 dimensions (outdated model)
- ⚠️ Simple structure, might be for tool calling only

---

### Schema B: rag_knowledge_sources + rag_knowledge_chunks (Migration 20250924) ✅ RECOMMENDED

**Tables**:

```sql
CREATE TABLE rag_tenants (
  id UUID PRIMARY KEY,
  domain VARCHAR(255) UNIQUE,
  ...
);

CREATE TABLE rag_knowledge_sources (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES rag_tenants(id),
  name VARCHAR(500),
  domain knowledge_domain,  -- ✅ PRISM classification
  prism_suite prism_suite,  -- ✅ PRISM suite
  processing_status processing_status,
  embedding vector(1536),  -- ❌ Wrong dimension
  ...
);

CREATE TABLE rag_knowledge_chunks (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES rag_knowledge_sources(id),
  content TEXT,
  chunk_index INTEGER,
  embedding vector(1536),  -- ❌ Wrong dimension
  medical_context JSONB,
  regulatory_context JSONB,
  clinical_context JSONB,
  ...
);

CREATE TABLE rag_search_analytics (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES rag_tenants(id),
  query_text TEXT,
  query_embedding vector(1536),  -- ❌ Wrong dimension
  ...
);
```

**RPC Function**: `search_rag_knowledge_chunks()`

```sql
CREATE FUNCTION search_rag_knowledge_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_domain knowledge_domain DEFAULT NULL,
    filter_prism_suite prism_suite DEFAULT NULL
) RETURNS TABLE (
    chunk_id UUID,
    source_id UUID,
    content TEXT,
    similarity float,
    source_name VARCHAR(500),
    domain knowledge_domain,
    prism_suite prism_suite,
    section_title VARCHAR(500),
    medical_context JSONB,
    regulatory_context JSONB
) ...
```

**Strengths**:
- ✅ Tenant isolation via `rag_tenants`
- ✅ PRISM domain classification (8 suites)
- ✅ Medical/regulatory/clinical context fields
- ✅ Proper chunking strategy
- ✅ Search analytics tracking
- ✅ RLS policies implemented
- ✅ Quality scoring fields

**Issues**:
- ❌ Wrong vector dimensions (1536 vs 3072)
- ❌ RPC function name doesn't match code expectations
- ⚠️ No hybrid search function
- ⚠️ No tenant_id parameter in RPC function

---

### Schema C: knowledge_documents + document_embeddings (Migration 20251008)

**Tables**:

```sql
CREATE TABLE knowledge_domains (
  id UUID PRIMARY KEY,
  name TEXT,
  slug TEXT UNIQUE,
  ...
);

CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  domain_id UUID REFERENCES knowledge_domains(id),
  organization_id UUID REFERENCES organizations(id),
  ...
);

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id),
  chunk_index INTEGER,
  chunk_text TEXT,
  embedding_data JSONB,  -- ❌ Stored as JSONB not vector!
  ...
);
```

**Issues**:
- ❌ Embeddings stored as JSONB, not vector type (can't use pgvector)
- ❌ No vector similarity search possible
- ❌ Different naming convention (knowledge_ vs rag_)
- ⚠️ Might be for different feature (document management)

---

## Code References Analysis

### TypeScript Service (src/rag-service.ts)

**Expected Schema**:
- Tables: `rag_knowledge_sources`, `rag_knowledge_chunks`, `rag_search_analytics`
- RPC: `search_rag_knowledge_chunks()` ✅ Matches Schema B
- Tenant: Uses `get_default_rag_tenant_id()` ✅ Matches Schema B

**Match**: **Schema B (rag_knowledge_sources)** ✅

### Python Service (backend/python-ai-services/services/medical_rag.py)

**Expected Schema**:
- RPC: `search_rag_knowledge()` ❌ DOESN'T EXIST!
- Should be: `search_rag_knowledge_chunks()`

**Issue**: Function name mismatch

### LangChain Tool (src/lib/services/tools/rag-search.ts)

**Expected**: Calls `/api/tools/rag-search` 
**Issue**: API endpoint doesn't exist

---

## Recommendation: Consolidation Strategy

### Phase 1: Immediate Fix (This Week)

1. **Standardize on Schema B** (rag_knowledge_sources + rag_knowledge_chunks)
   - Most complete implementation
   - Tenant isolation already built
   - PRISM classification ready

2. **Create Migration to Fix Critical Issues**:

```sql
-- supabase/migrations/20251018_rag_critical_fixes.sql

-- Step 1: Upgrade vector dimensions
ALTER TABLE rag_knowledge_chunks 
  ALTER COLUMN embedding TYPE vector(3072);

ALTER TABLE rag_search_analytics
  ALTER COLUMN query_embedding TYPE vector(3072);

-- Step 2: Create correct RPC function
CREATE OR REPLACE FUNCTION search_rag_knowledge(
    query_embedding vector(3072),  -- Updated dimension
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_domain knowledge_domain DEFAULT NULL,
    filter_prism_suite prism_suite DEFAULT NULL,
    filter_tenant_id UUID DEFAULT NULL  -- Added tenant parameter
) RETURNS TABLE (...) AS $$
  -- Implementation (copy from search_rag_knowledge_chunks, update dimensions)
$$ LANGUAGE plpgsql STABLE;

-- Step 3: Keep old function for compatibility
-- Don't drop search_rag_knowledge_chunks() yet

-- Step 4: Add hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search_rag_knowledge(
    query_embedding vector(3072),
    query_text TEXT,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    vector_weight float DEFAULT 0.6,
    text_weight float DEFAULT 0.4,
    filter_domain knowledge_domain DEFAULT NULL
) RETURNS TABLE (...) AS $$
  -- Hybrid vector + full-text search
$$ LANGUAGE plpgsql STABLE;
```

3. **Deprecate Other Schemas**:
   - Mark `knowledge_base_documents` as deprecated (add comment)
   - Mark `knowledge_documents` + `document_embeddings` as non-RAG (clarify purpose)
   - Don't drop tables (preserve data), just document

### Phase 2: Code Updates (This Week)

1. Fix `src/rag-service.ts`:
   - Initialize Supabase client ✅
   - Replace mock embeddings with real OpenAI ✅
   - Update RPC call from `search_rag_knowledge_chunks()` to `search_rag_knowledge()` ✅

2. Fix Python service:
   - Update RPC call to `search_rag_knowledge()` ✅

3. Create search API endpoint:
   - `src/app/api/knowledge/search/route.ts` ✅

### Phase 3: Data Migration (Next Week)

1. **Migrate existing data** to new 3072 dimensions:
   - Create script to re-generate embeddings using text-embedding-3-large
   - Batch process to avoid API limits
   - Provide cost estimate before running

2. **Consolidate scattered data**:
   - If `knowledge_base_documents` has data → migrate to `rag_knowledge_chunks`
   - Update all embeddings to 3072 dimensions

---

## Comparison Table

| Feature | Schema A (knowledge_base) | Schema B (rag_*) ✅ | Schema C (knowledge_docs) |
|---------|---------------------------|---------------------|---------------------------|
| **Tenant Isolation** | ❌ No | ✅ Yes (`rag_tenants`) | ⚠️ Via `organization_id` |
| **Vector Type** | ✅ vector(1536) | ✅ vector(1536) | ❌ JSONB |
| **Vector Search** | ✅ Yes | ✅ Yes | ❌ No |
| **Chunking** | ❌ Single doc | ✅ Proper chunks | ✅ Chunks |
| **PRISM Classification** | ❌ No | ✅ Yes (8 suites) | ❌ No |
| **Medical Context** | ❌ No | ✅ Yes (3 contexts) | ❌ No |
| **Search Analytics** | ❌ No | ✅ Yes | ❌ No |
| **RLS Policies** | ⚠️ Basic | ✅ Complete | ⚠️ Basic |
| **Quality Scoring** | ❌ No | ✅ Yes | ❌ No |
| **Production Ready** | ❌ No | ⚠️ Almost (fix dims) | ❌ No |

**Winner: Schema B (rag_knowledge_sources + rag_knowledge_chunks)** with dimension fixes

---

## Action Items (Priority Order)

### P0 - Critical (Must Do This Week)

- [ ] Create migration `20251018_rag_critical_fixes.sql`:
  - [ ] Upgrade vectors to 3072 dimensions
  - [ ] Create `search_rag_knowledge()` RPC function
  - [ ] Create `hybrid_search_rag_knowledge()` RPC function
  - [ ] Recreate vector indexes for new dimensions
- [ ] Fix `src/rag-service.ts`:
  - [ ] Initialize Supabase client
  - [ ] Replace mock embeddings
  - [ ] Update RPC function call
- [ ] Create search API endpoint
- [ ] Test end-to-end: upload → embed → search

### P1 - High (Do This Week)

- [ ] Create data migration script for existing embeddings
- [ ] Run cost analysis for re-embedding existing data
- [ ] Add documentation comments to deprecated schemas
- [ ] Create validation script to verify all fixes

### P2 - Medium (Next Week)

- [ ] Consolidate data from other schemas if needed
- [ ] Set up monitoring for search performance
- [ ] Add cache layer (Redis)
- [ ] Implement medical re-ranking

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | High | Create backup tables, test on staging |
| API downtime | Medium | Medium | Maintain old RPC functions during transition |
| Embedding cost overrun | Medium | Medium | Dry-run cost calculation, batch limits |
| Schema conflicts | High | High | **Already happening** - fix immediately |

---

## Conclusion

**Current State**: 🔴 **BROKEN** - Multiple conflicting schemas, wrong dimensions, function mismatches

**Target State**: 🟢 **PRODUCTION READY** - Standardized on Schema B with 3072 dimensions

**Effort Required**: 
- Critical fixes: ~10 hours
- Full migration: ~40 hours (Phase 1 of implementation plan)

**Recommendation**: **Proceed immediately with Phase 1 implementation** to fix critical blockers before building new features.

---

**Next Step**: Create `20251018_rag_critical_fixes.sql` migration following this analysis.

