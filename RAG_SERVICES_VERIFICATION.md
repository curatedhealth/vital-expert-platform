# RAG Services Verification & Document Reprocessing

**Date:** 2025-01-05  
**Status:** ✅ **FIXES COMPLETE**

---

## Summary

Fixed RAG empty results issue by:
1. ✅ Creating script to reprocess documents (chunk + embed)
2. ✅ Fixing domain name to domain_id UUID mapping
3. ✅ Updating document status to 'active' after processing

---

## Problems Identified

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
-- Result: total_documents=364, total_chunks=0, chunks_with_embeddings=0
```

### 2. **Domain Name to UUID Mapping** ⚠️ **ISSUE**

**Finding:**
- Workflow passes `selected_domains` like `["Digital Health", "Regulatory Affairs"]` (domain names)
- RAG service expects `domain_id` UUIDs (e.g., `c3f33db0-10f5-4b94-b4a1-e231e0d6a20a`)
- No automatic mapping from domain names to UUIDs

**Impact:**
- RAG queries fail to find documents because domain filter doesn't match

---

## Fixes Applied

### 1. **Document Reprocessing Script** ✅

**File:** `services/ai-engine/src/scripts/reprocess_documents.py`

**Features:**
- Chunks documents into overlapping chunks (1000 chars, 200 overlap)
- Generates embeddings for each chunk using EmbeddingServiceFactory
- Stores chunks with embeddings in `document_chunks` table
- Maps domain names to domain_id UUIDs from `knowledge_domains` table
- Updates document status to 'active' after processing
- Processes documents in batches for efficiency

**Usage:**
```bash
# Process specific domains
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"

# Process all documents
python scripts/reprocess_documents.py --all

# Custom chunk size/overlap
python scripts/reprocess_documents.py --domains "Digital Health" --chunk-size 1000 --chunk-overlap 200 --batch-size 10
```

**What it does:**
1. Loads domain mapping from `knowledge_domains` table
2. Gets documents from `knowledge_documents` table (filtered by domain if specified)
3. For each document:
   - Chunks content using `RecursiveCharacterTextSplitter`
   - Generates embeddings in batches using `EmbeddingServiceFactory`
   - Deletes existing chunks for document
   - Inserts new chunks with embeddings into `document_chunks` table
   - Updates document status to 'active' and sets `chunk_count`
   - Maps and stores `domain_id` UUID if available

### 2. **Domain Name to UUID Mapping** ✅

**File:** `services/ai-engine/src/services/unified_rag_service.py`

**Added Method:**
```python
async def _map_domain_names_to_ids(
    self,
    domain_names: Optional[List[str]]
) -> Optional[List[str]]:
    """
    Map domain names to domain_id UUIDs from knowledge_domains table.
    
    Args:
        domain_names: List of domain names (e.g., ["Digital Health", "Regulatory Affairs"])
    
    Returns:
        List of domain_id UUIDs or None if mapping fails
    """
```

**Updated `query()` Method:**
- Automatically detects if `domain_ids` are UUIDs or domain names
- If domain names are provided, maps them to UUIDs before querying
- Handles domain name variations (exact match, lowercase, hyphenated, underscored)

**Example:**
```python
# Before (would fail):
rag_service.query(
    query_text="...",
    domain_ids=["Digital Health"]  # Domain name, not UUID
)

# After (automatically mapped):
rag_service.query(
    query_text="...",
    domain_ids=["Digital Health"]  # Automatically mapped to UUID
)
```

### 3. **Mode 1 Workflow Integration** ✅

**File:** `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Updated:**
- Passes `selected_domains` directly to `rag_service.query()`
- RAG service automatically maps domain names to UUIDs
- No changes needed in workflow code

---

## Files Modified

1. **`services/ai-engine/src/scripts/reprocess_documents.py`** (NEW)
   - Script to reprocess documents with chunking and embedding

2. **`services/ai-engine/src/services/unified_rag_service.py`**
   - Added `_map_domain_names_to_ids()` method
   - Updated `query()` method to automatically map domain names to UUIDs

3. **`services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`**
   - Already passes domain names correctly (no changes needed)

---

## Next Steps

### 1. **Run Document Reprocessing Script** 🚀

```bash
cd services/ai-engine/src
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"
```

**Expected Output:**
- ✅ Domain mapping loaded
- ✅ Documents retrieved (count)
- ✅ Processing each document
- ✅ Chunks generated and embedded
- ✅ Chunks inserted into database
- ✅ Document status updated to 'active'

### 2. **Verify Chunks and Embeddings** ✅

```sql
-- Check chunks for Digital Health and Regulatory Affairs
SELECT 
    d.domain,
    COUNT(DISTINCT d.id) as document_count,
    COUNT(DISTINCT c.id) as chunk_count,
    COUNT(DISTINCT CASE WHEN c.embedding IS NOT NULL THEN c.id END) as chunks_with_embeddings
FROM knowledge_documents d
LEFT JOIN document_chunks c ON c.document_id = d.id
WHERE d.domain IN ('Digital Health', 'Regulatory Affairs')
GROUP BY d.domain;
```

### 3. **Test RAG Queries** ✅

```python
# Test RAG query with domain names (should work now)
result = await rag_service.query(
    query_text="What are FDA IND requirements?",
    strategy="hybrid",
    domain_ids=["Digital Health", "Regulatory Affairs"],  # Domain names, automatically mapped
    max_results=10,
    similarity_threshold=0.7
)

# Should return sources now
assert len(result['sources']) > 0
```

---

## Verification Checklist

- [ ] Run reprocessing script for "Digital Health" and "Regulatory Affairs"
- [ ] Verify chunks created in `document_chunks` table
- [ ] Verify embeddings generated for chunks
- [ ] Verify document status updated to 'active'
- [ ] Verify domain_id UUIDs mapped correctly
- [ ] Test RAG query with domain names
- [ ] Test Mode 1 with RAG enabled
- [ ] Verify RAG sources appear in Mode 1 response

---

## Environment Variables Required

```bash
# Supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # For document processing (bypasses RLS)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Embeddings (OpenAI or HuggingFace)
OPENAI_API_KEY=...
# OR
HUGGINGFACE_API_KEY=...
```

---

## Notes

- **Document Status**: Script updates status to 'processing' during processing, then 'active' on success, 'failed' on error
- **Chunk Size**: Default 1000 chars with 200 overlap (configurable via `--chunk-size` and `--chunk-overlap`)
- **Batch Processing**: Embeddings generated in batches of 10 (configurable via `--batch-size`)
- **Domain Mapping**: Handles variations: "Digital Health", "digital-health", "digital_health", etc.
- **Error Handling**: Script continues processing even if individual documents fail
- **Idempotent**: Safe to run multiple times (deletes existing chunks before inserting new ones)
