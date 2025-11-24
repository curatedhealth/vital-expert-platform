# Document Upload Flow: Pinecone vs PostgreSQL

## 📄 Upload One Document - What Goes Where?

When you upload a document, here's exactly what happens and where the data goes:

---

## 🔄 Complete Upload Flow

### Step 1: Document Upload
**User uploads:** `FDA_Regulations_2024.pdf` (5MB PDF)

**Route:** `POST /api/knowledge/upload`

---

### Step 2: Text Extraction
**Where:** In-memory processing (server)
- Extracts text from PDF: ~50,000 characters
- Parses structure (if available)
- Result: Plain text content string

---

### Step 3: Document Metadata → **PostgreSQL/Supabase**

**Table:** `knowledge_documents`

**What Gets Stored:**

```sql
INSERT INTO knowledge_documents (
  id,                    -- UUID: 'abc-123-def-456'
  title,                  -- 'FDA_Regulations_2024.pdf'
  content,                -- FULL TEXT (50,000 chars) ✅ STORED IN POSTGRES
  domain,                 -- 'regulatory'
  tags,                   -- ['global'] or ['agent:xyz']
  status,                 -- 'processing' → 'completed'
  metadata,               -- JSONB: { source: 'upload', filename: '...', filesize: 5242880, ... }
  created_at,             -- Timestamp
  updated_at              -- Timestamp
) VALUES (...)
```

**In PostgreSQL:**
- ✅ **Full document text** (entire content)
- ✅ **Document metadata** (title, domain, tags, file info)
- ✅ **Status tracking** (processing → completed)
- ✅ **User/access info** (who uploaded, access level)
- ✅ **JSON metadata** (file size, type, upload details)

**NOT in PostgreSQL:**
- ❌ Embeddings (too large, stored in Pinecone)
- ❌ Vector data

---

### Step 4: Document Chunking
**Where:** In-memory processing (server)
- Splits text into chunks: ~1,500 tokens each with 300 token overlap
- Example: 50,000 chars → ~15 chunks
- Each chunk gets: `{ content, index, metadata }`

**Result:** Array of chunk objects (not yet in database)

---

### Step 5: Generate Embeddings
**Where:** OpenAI API call
- Calls `text-embedding-3-large` model
- Input: Array of chunk texts
- Output: Array of embeddings (each is 3072 numbers)

**Example:**
```typescript
chunks: ['chunk 1 text...', 'chunk 2 text...', ...] // 15 chunks
→ embeddings: [
    [0.123, -0.456, 0.789, ...], // 3072 numbers for chunk 1
    [0.234, -0.567, 0.890, ...], // 3072 numbers for chunk 2
    ...
  ]
```

---

### Step 6: Chunks → **PostgreSQL/Supabase**

**Table:** `document_chunks`

**What Gets Stored:**

```sql
INSERT INTO document_chunks (
  id,                    -- UUID for each chunk: 'chunk-1-uuid', 'chunk-2-uuid', ...
  document_id,           -- Links to knowledge_documents.id
  chunk_index,           -- 0, 1, 2, ... (order in document)
  content,               -- FULL CHUNK TEXT ✅ STORED IN POSTGRES
  embedding,             -- Vector (3072 floats) ✅ STORED IN POSTGRES (pgvector)
  metadata,              -- JSONB: chunk-specific metadata
  created_at             -- Timestamp
) VALUES 
  ('chunk-1', 'doc-123', 0, 'chunk text...', [...3072 numbers...], {...}, NOW()),
  ('chunk-2', 'doc-123', 1, 'chunk text...', [...3072 numbers...], {...}, NOW()),
  ... -- 15 rows total
```

**In PostgreSQL:**
- ✅ **Full chunk text** (searchable, retrievable)
- ✅ **Embeddings** (pgvector column for vector similarity in PostgreSQL)
- ✅ **Chunk metadata** (index, position, quality scores)
- ✅ **Links to document** (document_id foreign key)

**Why both Pinecone AND PostgreSQL embeddings?**
- PostgreSQL: For hybrid search (PostgreSQL vector similarity + keyword)
- Pinecone: For fast, scalable semantic search (specialized vector DB)

---

### Step 7: Vectors → **Pinecone**

**Namespace:** `''` (default namespace)

**What Gets Stored:**

```typescript
// For each chunk (15 chunks total), Pinecone stores:
{
  id: 'chunk-1-uuid',              // Same UUID as PostgreSQL chunk.id
  values: [0.123, -0.456, ...],   // 3072-dimensional embedding vector ✅ STORED IN PINECONE
  metadata: {
    chunk_id: 'chunk-1-uuid',      // Link back to PostgreSQL
    document_id: 'doc-123',          // Link to document
    content: 'chunk text...',       // First 40,000 chars ✅ STORED IN PINECONE (metadata)
    domain: 'regulatory',            // Domain for filtering ✅ STORED IN PINECONE (metadata)
    source_title: 'FDA_Regulations_2024.pdf', // Document title ✅ STORED IN PINECONE (metadata)
    timestamp: '2025-01-29T...'    // Upload timestamp
  }
}
```

**In Pinecone:**
- ✅ **Vector embeddings** (3072 numbers per chunk) - PRIMARY STORAGE
- ✅ **Metadata** (chunk_id, document_id, domain, title, truncated content)
- ✅ **Fast semantic search** (optimized vector similarity)

**NOT in Pinecone:**
- ❌ Full chunk text (only first 40,000 chars in metadata)
- ❌ Full document content
- ❌ Rich PostgreSQL metadata

---

## 📊 Summary: What Goes Where

### **PostgreSQL/Supabase Stores:**

| Data | Table | Why |
|------|-------|-----|
| ✅ **Full document text** | `knowledge_documents.content` | Complete source text for retrieval |
| ✅ **Document metadata** | `knowledge_documents.*` | Title, domain, tags, status, user info |
| ✅ **Full chunk text** | `document_chunks.content` | Complete chunk text for display/retrieval |
| ✅ **Chunk embeddings** | `document_chunks.embedding` (pgvector) | For PostgreSQL vector search (hybrid) |
| ✅ **Chunk metadata** | `document_chunks.metadata` | Rich metadata, quality scores, etc. |
| ✅ **Relationships** | Foreign keys | Links between documents and chunks |

**Purpose:** Complete data store, rich metadata, full-text search, hybrid search

---

### **Pinecone Stores:**

| Data | Format | Why |
|------|--------|-----|
| ✅ **Vector embeddings** | 3072-dim vectors | Fast semantic similarity search |
| ✅ **Chunk IDs** | UUID strings | Link back to PostgreSQL |
| ✅ **Domain** | Metadata field | Domain filtering (your value prop!) |
| ✅ **Truncated content** | First 40KB | Quick preview, doesn't need full text |
| ✅ **Document title** | Metadata field | Display in results |

**Purpose:** Fast semantic search, scalable vector operations, domain filtering

---

## 🎯 Key Differences

### PostgreSQL:
- **Full-text search**: Complete chunk content searchable
- **Rich metadata**: All details about documents/chunks
- **Relational data**: Foreign keys, user associations
- **Hybrid search**: Can combine vector + keyword search
- **Single source of truth**: Complete data model

### Pinecone:
- **Fast semantic search**: Optimized for vector similarity
- **Scalability**: Handles millions of vectors efficiently
- **Domain filtering**: Efficient metadata filtering
- **API-optimized**: Built for vector operations
- **Reference data**: Links back to PostgreSQL for full details

---

## 🔍 Query Flow Example

### User queries: "What are FDA requirements for digital health devices?"

1. **Generate query embedding** (OpenAI): `[0.234, -0.567, ...]` (3072 numbers)

2. **Search Pinecone**:
   - Query vector: `[0.234, -0.567, ...]`
   - Filter: `domain = 'regulatory'` (metadata filter)
   - Returns: Top 10 most similar chunks with IDs and metadata

3. **Enrich from PostgreSQL**:
   - Take chunk IDs from Pinecone results
   - Query PostgreSQL: `SELECT content, metadata FROM document_chunks WHERE id IN (...)`
   - Get full chunk text (Pinecone only has truncated version)
   - Get rich metadata

4. **Combine and return**:
   - Pinecone: Similarity scores, domain info, quick preview
   - PostgreSQL: Full text, complete metadata

---

## 💡 Why This Architecture?

1. **Pinecone** = Fast, scalable semantic search (what it's built for)
2. **PostgreSQL** = Complete data store, rich metadata, full-text (relational DB)
3. **Best of both** = Fast search + complete information

---

## 📝 Example: One Document Upload

**Input:** `FDA_Regulations_2024.pdf` (5MB, ~50,000 chars)

**PostgreSQL Results:**
```sql
-- 1 row in knowledge_documents
SELECT * FROM knowledge_documents WHERE id = 'doc-123';
→ 1 document record with full text

-- 15 rows in document_chunks  
SELECT * FROM document_chunks WHERE document_id = 'doc-123';
→ 15 chunk records, each with:
   - Full chunk text (searchable)
   - Embedding vector (3072 floats)
   - Metadata
```

**Pinecone Results:**
```javascript
// 15 vectors in Pinecone index
{
  namespace: '',  // Default namespace
  vectors: 15,    // One vector per chunk
  dimension: 3072 // Each vector is 3072 numbers
}
```

**Storage Breakdown:**
- PostgreSQL: ~50KB document text + ~45KB chunk texts + embeddings (~184KB) = ~279KB
- Pinecone: ~15 vectors × ~12KB each = ~180KB (vectors only)

---

## ✅ Takeaway

- **PostgreSQL**: Complete data, full text, rich metadata, relationships
- **Pinecone**: Fast vectors, semantic search, domain filtering
- **Together**: Complete solution (storage + search)

Both systems are needed and complement each other! 🎯

