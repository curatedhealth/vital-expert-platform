# Pinecone Namespace Limits

## 📊 Official Pinecone Limits (2025)

### Namespace Size Limits
- **Maximum Size per Namespace:** 500 GB
- **Number of Namespaces:**
  - **Starter Plan:** Up to 100 namespaces per index
  - **Standard/Enterprise Plans:** Up to 100,000 namespaces per index

### Request Size Limits
- **Maximum Request Size:** 2-4 MB per upsert request
- **Error Message:** "Request size XMB exceeds the maximum supported size of 2MB"
- **Error Code:** HTTP 400 with message "Error, message length too large: found X bytes, the limit is: 4194304 bytes" (4MB)

### Upsert Batch Limits
- **Maximum Vectors per Upsert:** 100 vectors per request (recommended)
- **Safe Batch Size:** 50 vectors per request (to account for metadata size)

### Rate Limits
- **Delete by Metadata:** 5 requests per second per namespace
- **Other Operations:** Varies by plan

## 🔍 How Request Size is Calculated

For each vector in a batch:
```
Request Size = (vector_id size + vector_values size + metadata size) × number_of_vectors
```

Example calculation:
- Vector ID: ~50 bytes (UUID string)
- Vector Values: 3072 dimensions × 4 bytes = 12,288 bytes
- Metadata: ~500-1000 bytes (chunk_id, document_id, content preview, etc.)
- **Total per vector:** ~13,000 bytes (13 KB)

**Safe batch size:**
- 50 vectors × 13 KB = 650 KB ✅ (under 2MB limit)
- 100 vectors × 13 KB = 1.3 MB ✅ (under 2MB limit)
- 200 vectors × 13 KB = 2.6 MB ❌ (exceeds 2MB limit)

## ⚠️ Common Issues

### Issue 1: Single Document with Many Chunks
**Problem:** Large documents (e.g., 744 chunks) fail when upserted all at once.

**Solution:** Batch upserts into smaller chunks (50-100 vectors per batch).

```python
pinecone_batch_size = 50  # Conservative batch size
for i in range(0, len(vectors), pinecone_batch_size):
    batch = vectors[i:i + pinecone_batch_size]
    pinecone_index.upsert(vectors=batch, namespace=namespace)
```

### Issue 2: Large Metadata
**Problem:** Metadata content too large (Pinecone metadata limit: 40KB per vector).

**Solution:** Truncate content in metadata:
```python
'metadata': {
    'content': chunk_data['content'][:1000],  # Limit to 1000 chars
    ...
}
```

### Issue 3: Dimension Mismatch
**Problem:** Vector dimensions don't match index dimensions.

**Solution:** Ensure embeddings match index dimensions:
- Pinecone RAG index: 3072 dimensions (text-embedding-3-large)
- Supabase: 1536 dimensions (text-embedding-3-small)

## ✅ Best Practices

1. **Batch Size:** Use 50 vectors per batch for safety
2. **Metadata Size:** Keep metadata under 1KB per vector
3. **Error Handling:** Catch and retry failed batches
4. **Progress Tracking:** Log batch progress for large operations
5. **Dimension Consistency:** Always verify embedding dimensions match index

## 📝 Current Implementation

Our `process_documents_huggingface.py` script now:
- ✅ Batches Pinecone upserts into 50-vector chunks
- ✅ Handles large documents (744+ chunks) by splitting into multiple batches
- ✅ Logs progress for each batch
- ✅ Continues processing even if some batches fail

## 🎯 Example: Processing Large Document

Document with 744 chunks:
```
Batch 1:  chunks 0-49   (50 chunks)   ✅
Batch 2:  chunks 50-99  (50 chunks)   ✅
...
Batch 15: chunks 700-744 (45 chunks)  ✅

Total: 15 batches, 744 chunks synced
```

