# Process Documents with HuggingFace Embeddings

This script processes documents using **HuggingFace embeddings** instead of OpenAI, avoiding API rate limits and costs.

## 🎯 Why HuggingFace?

- **FREE** - No API costs, no rate limits
- **Fast** - Local processing, no network latency
- **High Quality** - Top performers on MTEB leaderboard (67.4 score)
- **No Limits** - Process as many documents as you want

## 📋 Prerequisites

1. Install required Python packages:
```bash
pip install sentence-transformers torch numpy
```

2. Ensure environment variables are set (from `.env.vercel` or `.env.local`):
   - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
   - `PINECONE_API_KEY` (optional, for Pinecone sync)
   - `OPENAI_API_KEY` (optional, only needed if syncing to Pinecone with 3072 dimensions)

## 🚀 Usage

### Basic Usage (Process All Pending/Failed Documents)

```bash
cd services/ai-engine/src
python scripts/process_documents_huggingface.py --all
```

### Process Specific Domains

```bash
python scripts/process_documents_huggingface.py --domains "Digital Health" "Regulatory Affairs"
```

### Process Specific Statuses

```bash
python scripts/process_documents_huggingface.py --status "pending" "failed"
```

### Process with Custom Settings

```bash
python scripts/process_documents_huggingface.py \
  --all \
  --model mxbai-embed-large-v1 \
  --chunk-size 1000 \
  --chunk-overlap 200 \
  --batch-size 50 \
  --workers 4 \
  --limit 100
```

### Process Without Pinecone Sync (Faster)

```bash
python scripts/process_documents_huggingface.py --all --no-sync-pinecone
```

## 📊 Available Models

| Model | Dimensions | Quality | Speed | Best For |
|-------|-----------|---------|-------|----------|
| `mxbai-embed-large-v1` | 1024 | Excellent (67.4 MTEB) | Medium | General purpose, top quality |
| `e5-large-v2` | 1024 | Excellent | Medium | RAG, instruction-tuned |
| `bge-large-en-v1.5` | 1024 | Excellent | Medium | High quality results |
| `bge-base-en-v1.5` | 768 | Very Good | Fast | Best balance |
| `bge-small-en-v1.5` | 384 | Good | Very Fast | High volume, fast processing |
| `all-MiniLM-L6-v2` | 384 | Good | Ultra Fast | Lightweight, minimal resources |
| `pubmedbert` | 768 | Very Good (Medical) | Fast | Medical literature, scientific papers |
| `biobert` | 768 | Very Good (Biomedical) | Fast | Biomedical literature, clinical research |

## ⚙️ Options

- `--all` - Process all unprocessed documents (pending, failed, or null status)
- `--domains DOMAIN1 DOMAIN2` - Process documents from specific domains
- `--status STATUS1 STATUS2` - Process documents with specific statuses (default: pending, failed)
- `--limit N` - Limit number of documents to process
- `--chunk-size N` - Chunk size in characters (default: 1000)
- `--chunk-overlap N` - Chunk overlap in characters (default: 200)
- `--batch-size N` - Batch size for embeddings (default: 50)
- `--workers N` - Number of parallel workers (default: 2)
- `--model MODEL` - HuggingFace model name (default: mxbai-embed-large-v1)
- `--sync-pinecone` - Sync to Pinecone (default: True)
- `--no-sync-pinecone` - Do NOT sync to Pinecone

## 📝 What It Does

1. **Fetches Documents** - Gets unprocessed documents from Supabase
2. **Chunks Content** - Splits documents into overlapping chunks
3. **Generates Embeddings** - Uses HuggingFace (free, no rate limits!)
4. **Stores in Supabase** - Saves chunks with embeddings to `document_chunks` table
5. **Syncs to Pinecone** - Optionally syncs to Pinecone with domain-specific namespaces
6. **Updates Status** - Marks documents as 'active' or 'failed'

## 💡 Tips

- **Start Small**: Process a few documents first to test: `--limit 10`
- **Parallel Processing**: Increase `--workers` for faster processing (be careful with memory)
- **Fast Processing**: Use `bge-small-en-v1.5` or `all-MiniLM-L6-v2` for speed
- **Best Quality**: Use `mxbai-embed-large-v1` or `e5-large-v2` for best results
- **Medical Content**: Use `pubmedbert` or `biobert` for medical/scientific documents
- **Skip Pinecone**: Use `--no-sync-pinecone` if you only need Supabase storage

## 🔍 Troubleshooting

### "No documents found to process"
- Check document statuses in Supabase
- Documents need `status` = 'pending', 'failed', or NULL
- Documents need non-empty `content`

### "Failed to generate embeddings"
- Check internet connection (for model download)
- Ensure `sentence-transformers` is installed
- Try a smaller model like `bge-small-en-v1.5`

### "Out of memory"
- Reduce `--batch-size` (e.g., `--batch-size 25`)
- Reduce `--workers` (e.g., `--workers 1`)
- Use a smaller model like `bge-small-en-v1.5`

### "Pinecone sync failed"
- Check `PINECONE_API_KEY` is set
- If dimensions don't match (HuggingFace 1024 vs Pinecone 3072), ensure `OPENAI_API_KEY` is set for conversion

## 📈 Performance

- **Speed**: ~100-500 chunks/second (depending on model and hardware)
- **Cost**: $0.00 (completely free!)
- **Quality**: Comparable to OpenAI embeddings (67.4 MTEB score)

## 🎯 Example Workflows

### Process 100 Failed Documents with Fast Model

```bash
python scripts/process_documents_huggingface.py \
  --status failed \
  --limit 100 \
  --model bge-small-en-v1.5 \
  --workers 4
```

### Process Medical Documents with Specialized Model

```bash
python scripts/process_documents_huggingface.py \
  --domains "Clinical Development" "Medical Devices" \
  --model pubmedbert \
  --chunk-size 512 \
  --chunk-overlap 100
```

### Process Everything with Best Quality Model

```bash
python scripts/process_documents_huggingface.py \
  --all \
  --model mxbai-embed-large-v1 \
  --batch-size 50 \
  --workers 2 \
  --sync-pinecone
```

