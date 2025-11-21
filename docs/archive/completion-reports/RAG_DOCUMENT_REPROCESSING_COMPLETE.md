# RAG Document Reprocessing - Complete

**Date:** 2025-01-05  
**Status:** ✅ **READY TO RUN**

---

## Summary

Created script and fixes to reprocess existing documents:
1. ✅ **Script Created**: `services/ai-engine/src/scripts/reprocess_documents.py`
2. ✅ **Domain Mapping Fixed**: Automatic mapping from domain names to UUIDs
3. ✅ **Status Updates**: Documents set to 'active' after successful processing

---

## Quick Start

### 1. **Set Environment Variables**

Make sure your `.env.local` has:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for writes
# OR
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  # Read-only fallback

# Embeddings (choose one)
OPENAI_API_KEY=your_openai_key
# OR
HUGGINGFACE_API_KEY=your_huggingface_key
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is required for document processing (bypasses RLS).  
If only `SUPABASE_ANON_KEY` is available, the script will warn but may fail on writes.

### 2. **Run Reprocessing Script**

```bash
cd services/ai-engine/src
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"
```

**Expected Output:**
```
🚀 Starting document reprocessing
📋 Configuration: chunk_size=1000, chunk_overlap=200, batch_size=10
✅ Supabase client initialized successfully
✅ Domain mapping loaded
✅ Documents retrieved: count=27
📄 Processing document 1/27 ...
📦 Document abc123 chunked: chunks=15, domain=Digital Health
✅ Chunks inserted for document abc123: total_chunks=15
✅ Document abc123 processed successfully
...
✅ Document reprocessing completed: total=27, successful=27, failed=0
```

### 3. **Verify Results**

```sql
-- Check chunks created
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

---

## What the Script Does

### For Each Document:

1. **Load Domain Mapping**
   - Queries `knowledge_domains` table
   - Maps domain names to domain_id UUIDs
   - Handles variations: "Digital Health", "digital-health", "digital_health"

2. **Chunk Content**
   - Uses `RecursiveCharacterTextSplitter`
   - Default: 1000 chars per chunk, 200 overlap
   - Configurable via `--chunk-size` and `--chunk-overlap`

3. **Generate Embeddings**
   - Uses `EmbeddingServiceFactory` (auto-detects OpenAI or HuggingFace)
   - Processes in batches (default: 10 chunks per batch)
   - Configurable via `--batch-size`

4. **Store Chunks**
   - Deletes existing chunks for document (idempotent)
   - Inserts chunks with embeddings into `document_chunks` table
   - Stores `domain_id` UUID if available

5. **Update Document Status**
   - Sets status to 'processing' during processing
   - Sets status to 'active' on success
   - Sets status to 'failed' on error
   - Updates `chunk_count` field

---

## Command-Line Options

```bash
# Process specific domains (default)
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"

# Process all documents
python scripts/reprocess_documents.py --all

# Custom chunk size and overlap
python scripts/reprocess_documents.py --domains "Digital Health" --chunk-size 800 --chunk-overlap 150

# Custom batch size for embeddings
python scripts/reprocess_documents.py --domains "Digital Health" --batch-size 20

# Combine options
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs" --chunk-size 1000 --chunk-overlap 200 --batch-size 10
```

---

## Domain Mapping Fix

### Before (Would Fail):
```python
# Mode 1 workflow passes domain names
rag_service.query(
    query_text="...",
    domain_ids=["Digital Health"]  # Domain name, not UUID
)
# Result: 0 sources (domain filter doesn't match)
```

### After (Automatically Mapped):
```python
# Mode 1 workflow still passes domain names
rag_service.query(
    query_text="...",
    domain_ids=["Digital Health"]  # Domain name
)
# RAG service automatically maps to UUID:
# domain_ids=["Digital Health"] → ["c3f33db0-10f5-4b94-b4a1-e231e0d6a20a"]
# Result: Sources found! ✅
```

**Implementation:**
- Added `_map_domain_names_to_ids()` method to `UnifiedRAGService`
- Updated `query()` method to automatically detect and map domain names
- Handles domain name variations (exact match, lowercase, hyphenated, underscored)

---

## Files Created/Modified

1. **`services/ai-engine/src/scripts/reprocess_documents.py`** (NEW)
   - Document reprocessing script with chunking and embedding

2. **`services/ai-engine/src/services/unified_rag_service.py`** (MODIFIED)
   - Added `_map_domain_names_to_ids()` method
   - Updated `query()` to automatically map domain names to UUIDs

3. **`RAG_SERVICES_VERIFICATION.md`** (NEW)
   - Detailed documentation of fixes and verification steps

4. **`RAG_DOCUMENT_REPROCESSING_COMPLETE.md`** (NEW)
   - Quick start guide and usage instructions

---

## Troubleshooting

### Issue: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"

**Solution:**
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Or use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (read-only)

### Issue: "Failed to initialize Supabase client"

**Solution:**
- Check Supabase credentials are correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` has write permissions (bypasses RLS)
- If using `SUPABASE_ANON_KEY`, some write operations may fail

### Issue: "No documents found to process"

**Solution:**
- Check domain names match exactly (case-sensitive)
- Try `--all` to process all documents
- Verify documents exist in `knowledge_documents` table

### Issue: "Failed to generate embeddings"

**Solution:**
- Check `OPENAI_API_KEY` or `HUGGINGFACE_API_KEY` is set
- Verify API key is valid and has credits
- Check network connection

---

## Next Steps

1. ✅ **Run Script**: Process "Digital Health" and "Regulatory Affairs" documents
2. ✅ **Verify Chunks**: Check `document_chunks` table has chunks with embeddings
3. ✅ **Test RAG**: Test Mode 1 with RAG enabled - should return sources now
4. ✅ **Verify Sources**: Check `totalSources > 0` in Mode 1 response

---

## Success Criteria

- [ ] Script runs without errors
- [ ] Chunks created in `document_chunks` table
- [ ] Embeddings generated for all chunks
- [ ] Document status updated to 'active'
- [ ] Domain_id UUIDs mapped correctly
- [ ] RAG queries return sources (not 0)
- [ ] Mode 1 shows `totalSources > 0` in response

---

## Notes

- **Idempotent**: Safe to run multiple times (deletes existing chunks first)
- **Batch Processing**: Processes embeddings in batches to avoid rate limits
- **Error Handling**: Continues processing even if individual documents fail
- **Domain Variations**: Handles "Digital Health", "digital-health", "digital_health", etc.
- **Status Tracking**: Updates document status during processing for visibility

