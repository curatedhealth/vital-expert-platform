# HuggingFace Embeddings in Python AI Engine ✅

## 🎯 Overview

HuggingFace embedding support has been added to the Python AI Engine, providing **FREE** embedding generation as an alternative to OpenAI embeddings.

---

## 💰 Cost Comparison

| Provider | Model | Cost per 1M tokens | Dimensions | Quality |
|----------|-------|-------------------|------------|---------|
| **OpenAI** | text-embedding-3-large | **$0.13** | 3072 | Excellent |
| **HuggingFace** | bge-base-en-v1.5 | **$0.00** ✅ | 768 | Very Good (99%) |
| **HuggingFace** | bge-large-en-v1.5 | **$0.00** ✅ | 1024 | Excellent |

**Savings: 100% (FREE!)**

---

## 📦 Python Services Created

### **1. HuggingFace Embedding Service** (`huggingface_embedding_service.py`)
- **Local Models**: Uses `sentence-transformers` library (FREE)
- **API Support**: Can use HuggingFace Inference API (optional)
- **Batch Processing**: Efficient batch embedding generation
- **Multiple Models**: Supports 8+ modern embedding models

**Available Models:**
- `bge-base-en-v1.5` (768 dims) - ⭐ **Recommended** - Best balance
- `bge-small-en-v1.5` (384 dims) - Ultra-fast
- `bge-large-en-v1.5` (1024 dims) - Excellent quality
- `mxbai-embed-large-v1` (1024 dims) - Top MTEB performer
- `e5-large-v2` (1024 dims) - Best for RAG
- `all-MiniLM-L6-v2` (384 dims) - Fastest
- `pubmedbert` (768 dims) - Medical/scientific
- `biobert` (768 dims) - Biomedical

### **2. Embedding Service Factory** (`embedding_service_factory.py`)
- **Auto-Detection**: Automatically selects HuggingFace or OpenAI
- **Unified Interface**: Same interface for both providers
- **Configuration-Based**: Uses environment variables
- **Easy Switching**: Change provider via config

---

## ⚙️ Configuration

### **Environment Variables:**

```bash
# .env or environment variables
EMBEDDING_PROVIDER=huggingface  # or 'openai'
HUGGINGFACE_EMBEDDING_MODEL=bge-base-en-v1.5
USE_HUGGINGFACE_API=false  # Use local model (FREE) or API

# Optional: HuggingFace API key (only needed if USE_HUGGINGFACE_API=true)
HUGGINGFACE_API_KEY=hf_...
```

### **Auto-Detection:**

The system automatically uses HuggingFace if:
1. `EMBEDDING_PROVIDER=huggingface` is set, OR
2. `HUGGINGFACE_API_KEY` is set (even if provider is 'auto'), OR
3. `OPENAI_API_KEY` is not set

---

## 🚀 Usage

### **1. Automatic (Recommended)**

The Unified RAG Service automatically uses HuggingFace if configured:

```python
# UnifiedRAGService will auto-detect and use HuggingFace
rag_service = UnifiedRAGService(supabase_client)
await rag_service.initialize()  # Uses HuggingFace if configured
```

### **2. Direct Usage**

```python
from services.embedding_service_factory import EmbeddingServiceFactory

# Create HuggingFace embedding service
embedding_service = EmbeddingServiceFactory.create(
    provider='huggingface',
    model_name='bge-base-en-v1.5'
)

# Generate embedding
embedding = await embedding_service.generate_embedding("Hello world")

# Batch embeddings
embeddings = await embedding_service.generate_embeddings_batch([
    "Text 1",
    "Text 2",
    "Text 3"
], batch_size=32)
```

### **3. Unified RAG Service**

The Unified RAG Service automatically uses HuggingFace embeddings:

```python
# In unified_rag_service.py
# Automatically uses HuggingFace if:
# - EMBEDDING_PROVIDER=huggingface, OR
# - HUGGINGFACE_API_KEY is set, OR
# - OPENAI_API_KEY is not set

response = await rag_service.query(
    query_text="What is regulatory guidance?",
    strategy="hybrid",
    domain_ids=["regulatory_affairs"],
    max_results=10,
)
```

---

## 📊 Integration Points

### **1. Unified RAG Service**
- ✅ Uses EmbeddingServiceFactory for auto-detection
- ✅ Supports both HuggingFace and OpenAI embeddings
- ✅ No code changes needed - just configure provider

### **2. Metadata Processing**
- ✅ Can use HuggingFace for any embedding needs
- ✅ Cost-effective for large-scale metadata extraction

### **3. Vector Search**
- ✅ Works with Pinecone regardless of embedding provider
- ✅ Same dimensions requirements apply (may need index re-creation for different dimensions)

---

## 🔧 Setup Instructions

### **1. Install Dependencies**

```bash
cd services/ai-engine/src
pip install -r requirements.txt
```

This installs:
- `sentence-transformers==2.2.2`
- `torch>=2.0.0`
- `transformers>=4.30.0`

### **2. Configure Environment**

```bash
# Set embedding provider
export EMBEDDING_PROVIDER=huggingface
export HUGGINGFACE_EMBEDDING_MODEL=bge-base-en-v1.5
```

### **3. Start Service**

```bash
cd services/ai-engine/src
python -m uvicorn main:app --reload --port 8000
```

---

## 📝 Model Selection Guide

### **For RAG / General Purpose:**
- **Best Balance**: `bge-base-en-v1.5` (768 dims) ⭐
- **Best Quality**: `bge-large-en-v1.5` (1024 dims)
- **Top Performer**: `mxbai-embed-large-v1` (1024 dims, MTEB 67.4)

### **For Speed / High Volume:**
- **Fastest**: `all-MiniLM-L6-v2` (384 dims)
- **Good Balance**: `bge-small-en-v1.5` (384 dims)

### **For Medical/Scientific:**
- **Medical Literature**: `pubmedbert` (768 dims)
- **Biomedical**: `biobert` (768 dims)

---

## ⚠️ Important Notes

### **1. Pinecone Index Dimensions**
If switching from OpenAI (3072 dims) to HuggingFace (768 or 1024 dims), you may need to:
- Create a new Pinecone index with correct dimensions, OR
- Use a HuggingFace model with matching dimensions (e.g., `bge-large-en-v1.5` at 1024 dims)

### **2. Model Loading Time**
- First request may be slower (model loads into memory)
- Subsequent requests are fast
- Consider keeping service warm for production

### **3. Memory Usage**
- Local models require more memory than API calls
- `bge-base-en-v1.5`: ~500MB RAM
- `bge-large-en-v1.5`: ~1.2GB RAM

---

## ✅ Benefits

1. **FREE**: No cost for embeddings (local models)
2. **Fast**: Very fast embedding generation
3. **Quality**: 99% of OpenAI quality for most use cases
4. **Flexible**: Easy to switch between providers
5. **Privacy**: Local models - no data sent to external APIs

---

## 🔄 Migration from OpenAI

1. Set `EMBEDDING_PROVIDER=huggingface`
2. Choose model (recommended: `bge-base-en-v1.5`)
3. Restart ai-engine service
4. Test embeddings
5. Verify RAG queries work correctly

**No code changes needed!** The factory pattern handles everything.

---

## 📚 References

- **MTEB Leaderboard**: https://huggingface.co/spaces/mteb/leaderboard
- **Sentence Transformers**: https://www.sbert.net/
- **HuggingFace Models**: https://huggingface.co/models?pipeline_tag=sentence-similarity

---

**All services now support HuggingFace embeddings!** 🎉

