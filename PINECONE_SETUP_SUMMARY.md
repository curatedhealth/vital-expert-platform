# Pinecone Setup Summary

## Configuration

### Two Separate Indexes

1. **Agents Index**: `vital-knowledge`
   - **Purpose**: Store agent profiles for GraphRAG
   - **Namespace**: `agent` (singular)
   - **Usage**: Agent search and selection

2. **RAG Documents Index**: `vital-rag-production`
   - **Purpose**: Store knowledge document chunks for RAG retrieval
   - **Namespaces**: One namespace per knowledge domain (using domain slug)
   - **Usage**: Document search and retrieval

### Environment Variables

```bash
# Pinecone API Key
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK

# Agents Index
PINECONE_AGENTS_INDEX_NAME=vital-knowledge

# RAG Documents Index
PINECONE_RAG_INDEX_NAME=vital-rag-production
```

### Domain-Based Namespaces

Each knowledge domain gets its own namespace in the RAG index:
- Namespace name = domain slug (sanitized)
- Examples:
  - `digital-health` → namespace: `digital-health`
  - `regulatory-affairs` → namespace: `regulatory-affairs`
  - `ai-ml-healthcare` → namespace: `ai-ml-healthcare`

### Scripts

1. **`sync_agents_to_pinecone.py`**
   - Syncs all agents from Supabase to Pinecone `vital-knowledge` index
   - Uses `agent` namespace
   - Generates embeddings for agent profiles

2. **`reprocess_documents.py`** (to be updated)
   - Processes documents: chunks and generates embeddings
   - Stores chunks in Supabase `document_chunks` table
   - Should sync chunks to Pinecone `vital-rag-production` index
   - Uses domain-specific namespaces

3. **`verify_pinecone_agents.py`**
   - Verifies Pinecone connection
   - Checks agent namespace stats
   - Queries sample agents

### Implementation Details

#### UnifiedRAGService Updates

- `self.pinecone_index` → Agents index (`vital-knowledge`)
- `self.pinecone_rag_index` → RAG documents index (`vital-rag-production`)
- `_domain_namespace_cache` → Maps domain_id → namespace slug
- `_get_namespace_for_domain()` → Returns namespace for a domain_id
- `_get_namespaces_for_domains()` → Returns namespaces for multiple domain_ids

#### RAG Query Flow

1. Query comes in with `domain_ids`
2. `_get_namespaces_for_domains()` maps domain_ids to namespace slugs
3. Query is executed against `pinecone_rag_index` with domain-specific namespace
4. If Pinecone fails, falls back to Supabase vector search

### Next Steps

1. ✅ Update `UnifiedRAGService` to use separate indexes
2. ✅ Add domain namespace mapping
3. ✅ Update environment variables
4. ⏳ Update `reprocess_documents.py` to sync chunks to Pinecone RAG index
5. ⏳ Test RAG queries with domain-based namespaces
6. ⏳ Verify agents are synced to Pinecone

