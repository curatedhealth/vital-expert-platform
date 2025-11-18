# Pinecone Migration Complete ✅

## Summary

Successfully migrated all document chunks from Supabase to Pinecone RAG index with domain-based namespaces.

## Configuration

### Two Separate Pinecone Indexes

1. **Agents Index**: `vital-knowledge`
   - **Purpose**: Store agent profiles for GraphRAG
   - **Namespace**: `agent` (singular)
   - **Dimension**: 3072
   - **Status**: ✅ Configured and ready

2. **RAG Documents Index**: `vital-rag-production`
   - **Purpose**: Store knowledge document chunks for RAG retrieval
   - **Namespaces**: One namespace per knowledge domain (using domain slug)
   - **Dimension**: 3072 (text-embedding-3-large)
   - **Status**: ✅ Migrated successfully

### Environment Variables

```bash
# Pinecone API Key
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK

# Agents Index
PINECONE_AGENTS_INDEX_NAME=vital-knowledge

# RAG Documents Index
PINECONE_RAG_INDEX_NAME=vital-rag-production
```

## Migration Results

### RAG Documents Index: `vital-rag-production`

- **Total Vectors**: 110 (107 new + 3 existing)
- **Dimension**: 3072 (text-embedding-3-large)
- **Namespaces Created**: 1 (digital-health)
- **Status**: ✅ All chunks synced successfully

### Domain-Based Namespaces

- **54 domains** mapped to namespace slugs
- **Current namespace**: `digital-health` (107 chunks)
- **Future namespaces**: Will be created automatically as documents are added to other domains

Examples of domain → namespace mappings:
- `c3f33db0-10f5-4b94-b4a1-e231e0d6a20a` → `digital-health`
- `861d8be3-7fb9-4222-893b-13db783f83d1` → `regulatory-affairs`
- `c830eeec-679b-4a6f-ac55-dca7bcc4463d` → `blockchain-healthcare`
- `2d0524c1-be96-453f-b88d-dda4c33a33c8` → `ai-ml-healthcare`

## Technical Details

### Embedding Model

- **Model**: `text-embedding-3-large`
- **Dimensions**: 3072
- **Reason**: Pinecone index is configured for 3072 dimensions
- **Note**: Chunks in Supabase were originally 1536 dimensions (text-embedding-3-small), but embeddings were regenerated during sync to match the index

### Scripts Created/Updated

1. **`sync_chunks_to_pinecone.py`**
   - Fetches chunks from Supabase
   - Regenerates embeddings with text-embedding-3-large (3072 dims)
   - Groups chunks by domain_id → namespace
   - Syncs to Pinecone RAG index with domain-specific namespaces

2. **`sync_agents_to_pinecone.py`**
   - Syncs agents from Supabase to Pinecone `vital-knowledge` index
   - Uses `agent` namespace
   - Generates embeddings for agent profiles

3. **`verify_pinecone_agents.py`**
   - Verifies Pinecone connection
   - Checks namespace stats
   - Queries sample vectors

### RAG Service Updates

- `UnifiedRAGService` now uses separate indexes:
  - `self.pinecone_index` → Agents index (`vital-knowledge`)
  - `self.pinecone_rag_index` → RAG documents index (`vital-rag-production`)
- Domain namespace mapping loaded from Supabase `knowledge_domains` table
- RAG queries automatically use domain-specific namespaces

## Next Steps

1. ✅ **Agents Index**: Ready for GraphRAG agent search
2. ✅ **RAG Documents Index**: Ready for domain-based document retrieval
3. ⏳ **Future**: Add more documents to other domains → namespaces will be created automatically
4. ⏳ **Monitor**: Track namespace usage and vector counts per domain

## Verification

To verify the migration:

```bash
# Check RAG index stats
python3 services/ai-engine/src/scripts/verify_pinecone_agents.py

# Check specific namespace
python3 -c "
from pinecone import Pinecone
import os
pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
index = pc.Index('vital-rag-production')
stats = index.describe_index_stats(namespace='digital-health')
print(f'Digital Health Namespace: {stats.get(\"total_vector_count\", 0)} vectors')
"
```

## Notes

- **Embedding Regeneration**: Chunks were regenerated with text-embedding-3-large (3072 dims) to match the Pinecone index dimension
- **Namespace Creation**: Namespaces are created automatically on first upsert
- **Future Documents**: New documents will be automatically synced to their domain-specific namespaces
- **Supabase Chunks**: Original chunks in Supabase remain unchanged (1536 dims) for backward compatibility

