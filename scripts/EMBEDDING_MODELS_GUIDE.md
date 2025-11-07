# Hugging Face Embedding Models for Knowledge Pipeline

This document lists recommended Hugging Face embedding models for use with the knowledge pipeline, optimized for different use cases.

## Quick Reference

| Model | Dimensions | Speed | Quality | Use Case |
|-------|-----------|-------|---------|----------|
| all-MiniLM-L6-v2 | 384 | ⚡⚡⚡ | ⭐⭐⭐ | Default, fast, good balance |
| all-mpnet-base-v2 | 768 | ⚡⚡ | ⭐⭐⭐⭐ | Best quality, slower |
| all-MiniLM-L12-v2 | 384 | ⚡⚡ | ⭐⭐⭐⭐ | Better quality, still fast |
| multi-qa-mpnet-base | 768 | ⚡⚡ | ⭐⭐⭐⭐ | Optimized for Q&A |
| paraphrase-multilingual | 384 | ⚡⚡⚡ | ⭐⭐⭐ | Multi-language support |

## Recommended Models

### 1. **all-MiniLM-L6-v2** (Default) ⭐ RECOMMENDED

**Best for:** General purpose, fast inference, production use

```bash
python knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/all-MiniLM-L6-v2
```

**Specs:**
- Dimensions: 384
- Size: ~80MB
- Speed: ~14,000 sentences/sec (CPU)
- Quality: 58.80% on MTEB benchmark

**Pros:**
✅ Very fast inference
✅ Small model size
✅ Good balance of quality and speed
✅ Low memory footprint

**Cons:**
❌ Lower quality than larger models
❌ Not optimized for domain-specific tasks

---

### 2. **all-mpnet-base-v2** (Best Quality)

**Best for:** Maximum embedding quality, research, when speed is less critical

```bash
python knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2
```

**Specs:**
- Dimensions: 768
- Size: ~420MB
- Speed: ~2,800 sentences/sec (CPU)
- Quality: 63.30% on MTEB benchmark

**Pros:**
✅ Highest quality embeddings
✅ Best for semantic similarity
✅ Better for complex documents

**Cons:**
❌ Slower inference
❌ Larger storage requirements (768 dims)
❌ Higher Pinecone costs

---

### 3. **multi-qa-mpnet-base-dot-v1** (Q&A Optimized)

**Best for:** Question-answering, RAG systems, search applications

```bash
python knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/multi-qa-mpnet-base-dot-v1
```

**Specs:**
- Dimensions: 768
- Size: ~420MB
- Speed: ~2,800 sentences/sec (CPU)
- Quality: Optimized for Q&A retrieval

**Pros:**
✅ Optimized for question-answer matching
✅ Excellent for RAG systems
✅ Better asymmetric search (query vs document)

**Cons:**
❌ Slower inference
❌ Higher dimensionality

**Use Case:** Perfect for your "Ask Expert" feature where users ask questions and you retrieve relevant documents.

---

### 4. **all-MiniLM-L12-v2** (Balanced)

**Best for:** Better quality without sacrificing too much speed

```bash
python knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/all-MiniLM-L12-v2
```

**Specs:**
- Dimensions: 384
- Size: ~120MB
- Speed: ~7,500 sentences/sec (CPU)
- Quality: 60.82% on MTEB benchmark

**Pros:**
✅ Better quality than L6
✅ Still relatively fast
✅ Same dimensions as L6 (easier migration)

**Cons:**
❌ Slower than L6
❌ Larger model size

---

### 5. **paraphrase-multilingual-MiniLM-L12-v2** (Multilingual)

**Best for:** International content, multiple languages

```bash
python knowledge-pipeline.py --config sources.json \
  --embedding-model sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

**Specs:**
- Dimensions: 384
- Size: ~420MB
- Speed: ~7,000 sentences/sec (CPU)
- Languages: 50+ languages

**Pros:**
✅ Supports 50+ languages
✅ Good cross-lingual retrieval
✅ Reasonable speed

**Cons:**
❌ Slightly lower quality for English-only
❌ Larger model size

---

## Domain-Specific Models

### Medical/Healthcare

#### **pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb**
```bash
--embedding-model pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb
```
- Optimized for biomedical and clinical text
- Better understanding of medical terminology
- Trained on medical literature

#### **microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext**
```bash
--embedding-model microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext
```
- Pre-trained on PubMed abstracts and papers
- Excellent for regulatory and research documents

---

### Legal/Regulatory

#### **nlpaueb/legal-bert-base-uncased**
```bash
--embedding-model nlpaueb/legal-bert-base-uncased
```
- Trained on legal documents
- Good for FDA/EMA regulatory content

---

## Performance Comparison

### Inference Speed (on CPU)

| Model | Sentences/sec | Batch Processing (1000 docs) |
|-------|--------------|------------------------------|
| all-MiniLM-L6-v2 | ~14,000 | ~71 seconds |
| all-MiniLM-L12-v2 | ~7,500 | ~133 seconds |
| all-mpnet-base-v2 | ~2,800 | ~357 seconds |
| multi-qa-mpnet | ~2,800 | ~357 seconds |

### With GPU (NVIDIA T4)

| Model | Sentences/sec | Speedup |
|-------|--------------|---------|
| all-MiniLM-L6-v2 | ~50,000 | 3.5x |
| all-mpnet-base-v2 | ~15,000 | 5.3x |

---

## Storage & Cost Implications

### Pinecone Storage Costs

Based on 10,000 chunks:

| Model | Dimensions | Storage/month | Query Cost |
|-------|-----------|---------------|------------|
| MiniLM-L6 (384) | 384 | $0.096 | Lower |
| MPNet (768) | 768 | $0.192 | Higher |

**Recommendation:** Start with 384-dim models (MiniLM-L6-v2) to minimize costs.

---

## Model Selection Guide

### Choose **all-MiniLM-L6-v2** if:
- ✅ You need fast processing
- ✅ Processing large volumes
- ✅ Cost is a concern
- ✅ General purpose use case

### Choose **all-mpnet-base-v2** if:
- ✅ Quality is paramount
- ✅ Smaller document collection
- ✅ Complex semantic relationships
- ✅ Can afford higher costs

### Choose **multi-qa-mpnet-base** if:
- ✅ Building Q&A system (like Ask Expert)
- ✅ RAG application
- ✅ Asymmetric search (query vs docs)
- ✅ Quality matters more than speed

### Choose **Medical/Legal models** if:
- ✅ Domain-specific terminology
- ✅ Technical accuracy critical
- ✅ Specialized content

---

## Usage Examples

### Basic Usage (Default Model)
```bash
python scripts/knowledge-pipeline.py --config sources.json
```

### High Quality
```bash
python scripts/knowledge-pipeline.py \
  --config sources.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2
```

### Medical Content
```bash
python scripts/knowledge-pipeline.py \
  --config medical-sources.json \
  --embedding-model pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb
```

### Multilingual Content
```bash
python scripts/knowledge-pipeline.py \
  --config international-sources.json \
  --embedding-model sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
```

---

## GPU Acceleration

To use GPU (if available):

```python
# Automatically detected in the script
# Requires: pip install torch torchvision
```

Check GPU availability:
```bash
python -c "import torch; print(f'GPU Available: {torch.cuda.is_available()}')"
```

---

## Benchmarks (MTEB)

| Model | Average Score | Retrieval | Classification | Clustering |
|-------|--------------|-----------|----------------|------------|
| all-mpnet-base-v2 | 63.30 | 57.02 | 68.07 | 49.18 |
| all-MiniLM-L12-v2 | 60.82 | 54.34 | 66.58 | 44.69 |
| all-MiniLM-L6-v2 | 58.80 | 51.83 | 63.05 | 42.35 |

---

## Recommendation for VITAL Platform

**For Production:**
```bash
--embedding-model sentence-transformers/multi-qa-mpnet-base-dot-v1
```

**Why:**
1. Optimized for Q&A (your main use case)
2. Best retrieval performance
3. Good balance of quality and speed
4. Perfect for RAG systems

**For Development/Testing:**
```bash
--embedding-model sentence-transformers/all-MiniLM-L6-v2
```

**Why:**
1. Fast iteration
2. Lower costs
3. Good enough quality for testing
4. Easy to upgrade later

---

## Migration Guide

If you need to switch models:

1. **Create new Pinecone index** with appropriate dimensions
2. **Re-run pipeline** with new model
3. **Update search queries** to use new index
4. **Test retrieval quality**

```bash
# Step 1: Re-embed with new model
python scripts/knowledge-pipeline.py \
  --config sources.json \
  --embedding-model sentence-transformers/all-mpnet-base-v2

# Step 2: Update your search service to use new model
```

---

**Last Updated:** 2025-11-05
**Recommended Default:** `sentence-transformers/multi-qa-mpnet-base-dot-v1` (for Ask Expert)
**Fast Alternative:** `sentence-transformers/all-MiniLM-L6-v2`

