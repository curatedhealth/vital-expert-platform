# Knowledge Pipeline - Unified RAG Service Integration

## 🎯 Overview

The knowledge pipeline now integrates with your existing **Unified RAG Service** for content ingestion, ensuring consistent document processing, chunking, and vector storage across your entire platform.

## 🔄 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Pipeline                            │
│                                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐      │
│  │  Scrape  │ -> │  Curate  │ -> │  RAG Integration     │      │
│  │  Content │    │  by      │    │  Uploader            │      │
│  └──────────┘    │  Domain  │    └──────────────────────┘      │
│                   └──────────┘              │                    │
└──────────────────────────────────────────────│──────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Unified RAG Service                           │
│                                                                   │
│  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │   Chunking   │   │   Embeddings    │   │    Metadata     │  │
│  │   Strategy   │ ->│   Generation    │ ->│   Enrichment    │  │
│  └──────────────┘   └─────────────────┘   └─────────────────┘  │
│                                                     │             │
└─────────────────────────────────────────────────────│────────────┘
                                                      │
                      ┌───────────────────────────────┴─────────┐
                      │                                           │
                      ▼                                           ▼
          ┌───────────────────────┐              ┌──────────────────────────┐
          │   Supabase Storage    │              │   Pinecone Vector DB     │
          │                       │              │                          │
          │  • Document metadata  │              │  • Vector embeddings     │
          │  • Full content       │              │  • Chunk metadata        │
          │  • Domain mapping     │              │  • Namespace routing     │
          └───────────────────────┘              └──────────────────────────┘
```

## ✨ Benefits

### 1. **Consistency**
- Same chunking strategy as rest of platform
- Consistent embedding model across all content
- Unified metadata schema

### 2. **Domain Intelligence**
- Automatic domain/namespace routing
- Domain-specific knowledge organization
- Proper domain hierarchy in Pinecone

### 3. **Production-Ready**
- Uses battle-tested RAG service
- Proper error handling and retry logic
- Caching and performance optimization

### 4. **Maintainability**
- Single source of truth for RAG logic
- Changes to RAG service automatically apply
- No duplicate code

## 🚀 Usage

### Default (Recommended): Use RAG Service

```bash
python scripts/knowledge-pipeline.py \
  --config sources.json \
  --embedding-model sentence-transformers/all-MiniLM-L6-v2
```

By default, the pipeline uses the Unified RAG Service.

### Legacy Mode: Direct Upload

If you need the old behavior (direct upload):

```bash
python scripts/knowledge-pipeline.py \
  --config sources.json \
  --legacy-upload
```

## 📊 How It Works

### Step 1: Content Scraping
```python
# Pipeline scrapes web content
scraped_data = {
    'url': 'https://www.fda.gov/...',
    'title': 'FDA Medical Device Guidelines',
    'content': '... full text ...',
    'word_count': 5000,
    'content_hash': 'abc123...'
}
```

### Step 2: RAG Integration Processing

The `RAGIntegrationUploader` performs:

```python
# 1. Get or create domain
domain_id = await get_or_create_domain('regulatory', 'fda_guidelines')

# 2. Store document in Supabase
document_id = await store_document_metadata(
    content=scraped_data['content'],
    metadata={...},
    domain_id=domain_id
)

# 3. Chunk content
chunks = text_splitter.split_text(content)
# Creates: ~5-10 chunks for typical document

# 4. Generate embeddings
embeddings = await rag_service.embed_documents(chunks)

# 5. Upload to Pinecone with proper namespace
await pinecone_rag_index.upsert(
    vectors=vectors,
    namespace='regulatory'  # Auto-mapped from domain_id
)
```

### Step 3: Result

Content is now available for:
- ✅ Semantic search via RAG service
- ✅ Domain-filtered queries
- ✅ Ask Expert feature
- ✅ Agent knowledge retrieval

## 🔧 Configuration

### Environment Variables (Reuses existing)

```bash
# In .env.local or .env.vercel

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Pinecone (Optional)
PINECONE_API_KEY=your_pinecone_key
PINECONE_RAG_INDEX_NAME=vital-rag-production  # Used by RAG service

# Embedding (Configured by RAG service)
EMBEDDING_PROVIDER=huggingface  # or openai
```

### RAG Service Features Used

The integration leverages these RAG service features:

1. **Domain/Namespace Mapping**
   - Automatic namespace routing based on domain
   - Pre-loaded domain mappings
   - Falls back to default namespace

2. **Embedding Service Factory**
   - Auto-detects provider (OpenAI/HuggingFace)
   - Consistent embedding generation
   - Model configuration from environment

3. **Document Storage**
   - Supabase metadata storage
   - Pinecone vector upsert
   - Batch processing optimization

4. **Error Handling**
   - Retry logic for failures
   - Graceful degradation (Supabase-only if Pinecone unavailable)
   - Comprehensive logging

## 📈 Comparison: RAG Service vs Direct Upload

| Feature | RAG Service Integration | Direct Upload (Legacy) |
|---------|------------------------|------------------------|
| Chunking Strategy | ✅ Consistent with platform | ❌ Independent logic |
| Domain Routing | ✅ Automatic namespace mapping | ❌ Manual namespace |
| Embedding Provider | ✅ Configurable (OpenAI/HF) | ❌ HF only |
| Error Handling | ✅ Production-grade | ⚠️ Basic |
| Maintainability | ✅ Single source of truth | ❌ Duplicate code |
| Performance | ✅ Optimized batching | ⚠️ Basic |
| Future-Proof | ✅ Automatic updates | ❌ Manual updates |

## 🔍 Monitoring & Debugging

### Check RAG Service Status

```bash
# Verify RAG service is initialized
curl http://localhost:8000/health
```

### View Logs

```bash
# Knowledge pipeline logs
tail -f knowledge-pipeline.log

# AI Engine logs (includes RAG service)
tail -f services/ai-engine/logs/ai-engine.log
```

### Verify Upload

```python
# Check Supabase
from supabase import create_client
supabase = create_client(url, key)
docs = supabase.table('knowledge_documents').select('*').eq('domain', 'regulatory').execute()
print(f"Found {len(docs.data)} documents")

# Check Pinecone
import pinecone
pinecone.init(api_key=api_key)
index = pinecone.Index('vital-rag-production')
stats = index.describe_index_stats()
print(f"Namespace stats: {stats['namespaces']}")
```

## 🏗️ Domain Architecture

### Automatic Domain Creation

If a domain doesn't exist, it's created automatically:

```sql
INSERT INTO knowledge_domains_new (slug, domain_name, description, is_active)
VALUES ('regulatory', 'Regulatory', 'Domain for fda_guidelines content', true);
```

### Namespace Mapping

Domains map to Pinecone namespaces:

| Domain Slug | Namespace | Use Case |
|-------------|-----------|----------|
| `regulatory` | `regulatory` | FDA/EMA content |
| `research` | `research` | Clinical trials, papers |
| `standards` | `standards` | ISO standards |
| `clinical-trials` | `clinical-trials` | Trial data |

### Benefits

1. **Isolated Knowledge**: Each domain has its own namespace
2. **Filtered Queries**: Query specific domains only
3. **Access Control**: Domain-level permissions (future)
4. **Organization**: Clear content categorization

## 💡 Advanced Usage

### Custom Domain Mapping

Pre-create domains for better control:

```sql
INSERT INTO knowledge_domains_new (
  slug,
  domain_name,
  description,
  is_active,
  parent_domain_id
) VALUES (
  'fda-medical-devices',
  'FDA Medical Devices',
  'FDA regulations specific to medical devices',
  true,
  (SELECT domain_id FROM knowledge_domains_new WHERE slug = 'regulatory')
);
```

### Query Domain-Specific Content

```python
# Via RAG service
results = await rag_service.retrieve(
    query="510k clearance requirements",
    domain_id="regulatory",  # Filters to regulatory namespace
    max_results=10
)
```

### Bulk Re-Processing

Re-process existing documents through RAG service:

```bash
# Export existing docs
python scripts/export-docs-from-supabase.py --output existing-docs.json

# Re-import through RAG integration
python scripts/knowledge-pipeline.py \
  --config existing-docs.json \
  --use-rag-service
```

## 🚨 Troubleshooting

### Issue: "RAG service not initialized"

**Solution:**
```bash
# Ensure AI Engine is running
cd services/ai-engine
python -m uvicorn main:app --reload

# Or initialize manually in script
await rag_uploader.initialize()
```

### Issue: "Domain not found"

**Solution:**
Domains are auto-created. Check logs for errors:
```bash
grep "domain" knowledge-pipeline.log
```

### Issue: "Pinecone namespace not found"

**Solution:**
Namespaces are created automatically on first upsert. Verify:
```python
index.describe_index_stats()['namespaces']
```

### Issue: "Embedding model mismatch"

**Solution:**
Ensure consistent embedding dimensions:
```bash
# Pinecone index dimension
384 for all-MiniLM-L6-v2
768 for all-mpnet-base-v2

# Check your Pinecone index dimension
index.describe_index()
```

## 📚 Related Documentation

- [Unified RAG Service](../services/ai-engine/src/services/unified_rag_service.py)
- [Knowledge Pipeline README](KNOWLEDGE_PIPELINE_README.md)
- [Embedding Models Guide](EMBEDDING_MODELS_GUIDE.md)
- [Environment Setup](KNOWLEDGE_PIPELINE_ENV_SETUP.md)

## 🎯 Best Practices

1. **Always use RAG service integration** (default behavior)
2. **Let domains auto-create** unless you need custom hierarchy
3. **Monitor namespace growth** in Pinecone dashboard
4. **Use consistent embedding models** across scraping sessions
5. **Test with dry-run first** before bulk uploads

## 📊 Performance Metrics

Typical performance with RAG service:

- **Scraping**: ~5-10 pages/minute
- **Chunking**: ~1000 chunks/minute
- **Embedding**: ~100 chunks/minute (HuggingFace CPU)
- **Upload**: ~200 vectors/minute to Pinecone

**Bottleneck**: Usually embedding generation (use GPU for 3-5x speedup)

---

**Last Updated:** 2025-11-05
**Status:** ✅ Production Ready
**Recommended:** Always use RAG service integration

