# Automatic Pinecone Sync - Implementation Complete ✅

## Answer to Your Question

**Yes!** When you load new documents using `reprocess_documents.py`, they will **automatically sync to Pinecone** with domain-based namespaces.

## How It Works

### Automatic Sync Flow

1. **Document Processing** (`reprocess_documents.py`):
   - Chunks document content
   - Generates embeddings with `text-embedding-3-small` (1536 dims) for Supabase
   - Stores chunks in Supabase `document_chunks` table

2. **Automatic Pinecone Sync** (NEW):
   - Regenerates embeddings with `text-embedding-3-large` (3072 dims) for Pinecone
   - Maps domain_id to namespace slug (e.g., `digital-health`, `regulatory-affairs`)
   - Upserts chunks to Pinecone RAG index (`vital-rag-production`) with domain-specific namespace
   - **Happens automatically** during document processing

### Configuration

**Default Behavior:**
- ✅ **Automatic Pinecone sync is ENABLED by default**
- New documents automatically sync to Pinecone during processing

**To Disable Sync:**
```bash
python scripts/reprocess_documents.py --all --no-sync-pinecone
```

**To Explicitly Enable:**
```bash
python scripts/reprocess_documents.py --all --sync-pinecone
```

## Example Usage

### Process New Documents with Auto-Sync

```bash
# Process all documents (auto-syncs to Pinecone)
python scripts/reprocess_documents.py --all

# Process specific domains (auto-syncs to Pinecone)
python scripts/reprocess_documents.py --domains "Digital Health" "Regulatory Affairs"

# Process without Pinecone sync (if needed)
python scripts/reprocess_documents.py --all --no-sync-pinecone
```

## What Happens When You Load a New Document

1. **Document Upload** → Stored in Supabase `knowledge_documents`
2. **Run `reprocess_documents.py`** → Processes the document:
   - ✅ Chunks content
   - ✅ Generates embeddings (1536D for Supabase)
   - ✅ Stores chunks in Supabase
   - ✅ **Automatically syncs to Pinecone** (3072D, domain namespace)
3. **Result**: Document is available in both Supabase and Pinecone

## Technical Details

### Dual Embedding Strategy

- **Supabase**: Uses `text-embedding-3-small` (1536 dimensions)
  - Stored in `document_chunks.embedding` column
  - Used for Supabase vector search fallback

- **Pinecone**: Uses `text-embedding-3-large` (3072 dimensions)
  - Stored in Pinecone RAG index
  - Used for primary RAG retrieval
  - Automatically regenerated during sync

### Domain Namespace Mapping

Each domain gets its own namespace:
- `c3f33db0-10f5-4b94-b4a1-e231e0d6a20a` → `digital-health`
- `861d8be3-7fb9-4222-893b-13db783f83d1` → `regulatory-affairs`
- etc.

Namespaces are created automatically on first upsert.

## Requirements

For automatic sync to work, ensure these environment variables are set:

```bash
# Required for Pinecone sync
PINECONE_API_KEY=pcsk_6B4sVX_3WkUSw4xggc1k5w18FGxKhA3264v2yE3FuoeUHufUTRFuWr6n2AUkjenDSRt5PK
PINECONE_RAG_INDEX_NAME=vital-rag-production

# Required for embedding generation
OPENAI_API_KEY=your_openai_key_here
```

## Summary

✅ **Automatic sync is enabled by default**
✅ **New documents automatically sync to Pinecone during processing**
✅ **Domain-based namespaces are created automatically**
✅ **No manual sync step needed**

Just run `reprocess_documents.py` and your documents will be automatically synced to Pinecone! 🚀

