# RAG Domains Enhancement - Current Structure Analysis

## 📊 Executive Summary

This document provides a comprehensive analysis of the current RAG domain structure across **Supabase** (PostgreSQL) and **Pinecone** (Vector Database).

---

## 🗄️ **Supabase (PostgreSQL) Structure**

### 1. **Knowledge Domains Table** (`knowledge_domains`)

**Schema:**
```sql
CREATE TABLE public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,              -- e.g., "REG_AFFAIRS"
  name TEXT NOT NULL UNIQUE,               -- e.g., "Regulatory Affairs"
  slug TEXT NOT NULL UNIQUE,               -- e.g., "regulatory_affairs"
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1,         -- 1=Core, 2=Specialized, 3=Emerging
  priority INTEGER NOT NULL DEFAULT 1,     -- Display priority (1-30)
  keywords TEXT[] DEFAULT '{}',             -- Search keywords
  sub_domains TEXT[] DEFAULT '{}',          -- Sub-domain categories
  agent_count_estimate INTEGER DEFAULT 0,    -- Estimated agent usage
  color TEXT DEFAULT '#3B82F6',             -- UI color code
  icon TEXT DEFAULT 'book',                 -- UI icon
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',              -- Flexible metadata
  recommended_models JSONB DEFAULT '{}',   -- Domain-specific model configs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ **30 domains** organized in **3 tiers**:
  - **Tier 1 (Core)**: 15 domains - Essential domains with highest agent coverage
  - **Tier 2 (Specialized)**: 10 domains - High-value specialized functions
  - **Tier 3 (Emerging)**: 5 domains - Future-focused domains
- ✅ **Indexes**: slug, code, tier, priority, active status, keywords (GIN index)
- ✅ **RLS Policies**: Public read access, service role full access
- ✅ **Model recommendations**: Each domain can specify preferred embedding/chat models

**Current Domain Distribution:**
```
Total Domains: 30
├── Tier 1 (Core): 15 domains
│   ├── Regulatory Affairs (85 agents)
│   ├── Clinical Development (37 agents)
│   ├── Pharmacovigilance (25 agents)
│   ├── Quality Management (20 agents)
│   ├── Medical Affairs (15 agents)
│   ├── Commercial Strategy (29 agents)
│   ├── Drug Development (39 agents)
│   ├── Clinical Data Analytics (18 agents)
│   ├── Manufacturing Operations (17 agents)
│   ├── Medical Devices (12 agents)
│   ├── Digital Health (34 agents)
│   ├── Supply Chain (15 agents)
│   ├── Legal & Compliance (10 agents)
│   ├── Health Economics (12 agents)
│   └── Business Strategy (10 agents)
├── Tier 2 (Specialized): 10 domains
│   ├── Product Labeling (8 agents)
│   ├── Post-Market Activities (10 agents)
│   ├── Companion Diagnostics (6 agents)
│   ├── Nonclinical Sciences (12 agents)
│   ├── Patient Engagement (5 agents)
│   ├── Risk Management (8 agents)
│   ├── Scientific Publications (7 agents)
│   ├── KOL & Stakeholder Engagement (6 agents)
│   ├── Evidence Generation (5 agents)
│   └── Global Market Access (8 agents)
└── Tier 3 (Emerging): 5 domains
    ├── Real-World Data & Evidence (8 agents)
    ├── Precision Medicine (6 agents)
    ├── Telemedicine & Remote Care (5 agents)
    ├── AI & Machine Learning (4 agents)
    └── Patient-Centric Trials (4 agents)
```

---

### 2. **Knowledge Documents Table** (`knowledge_documents`)

**Schema (Multiple Versions - Inconsistency Detected):**

**Version A (UUID Foreign Key):**
```sql
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  domain_id UUID REFERENCES knowledge_domains(id),  -- ❗ UUID foreign key
  document_type TEXT DEFAULT 'text',
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  organization_id UUID,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Version B (Text Field - Current Implementation):**
```sql
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  domain TEXT,                                    -- ✅ TEXT field (current code uses this)
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'processing',              -- 'processing' | 'completed' | 'failed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**⚠️ ISSUE IDENTIFIED:**
- **Inconsistency**: Migrations use `domain_id` (UUID FK), but actual code uses `domain` (TEXT)
- **Current Code Behavior**: Uses `domain` as TEXT field storing domain slug (e.g., `'regulatory_affairs'`)
- **Recommendation**: Standardize on TEXT field or migrate to UUID FK with proper joins

**Current Linking Method:**
```typescript
// From unified-rag-service.ts
await this.supabase
  .from('knowledge_documents')
  .insert({
    title: doc.title,
    content: doc.content,
    domain: doc.domain,  // ✅ Uses TEXT slug, not UUID
    tags: doc.tags || [],
    status: 'processing',
    metadata: doc.metadata || {},
  })
```

---

### 3. **Document Chunks Table** (`document_chunks`)

**Schema:**
```sql
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,              -- Order in document (0, 1, 2, ...)
  content TEXT NOT NULL,                     -- Full chunk text
  embedding vector(3072),                    -- pgvector embedding (text-embedding-3-large)
  metadata JSONB DEFAULT '{}',               -- Chunk-specific metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Domain Relationship:**
- Chunks inherit domain from parent document via JOIN:
  ```sql
  SELECT dc.*, kd.domain
  FROM document_chunks dc
  JOIN knowledge_documents kd ON dc.document_id = kd.id
  WHERE kd.domain = 'regulatory_affairs'
  ```

**Indexes:**
- `document_id` (foreign key index)
- `embedding` (vector similarity index using ivfflat or hnsw)
- Composite indexes on `(document_id, chunk_index)`

---

## 🔍 **Pinecone (Vector Database) Structure**

### 1. **Index Organization**

```
Pinecone Index: vital-knowledge
├── Namespace: '' (default)
│   └── All knowledge chunks
│       └── Domain stored in metadata
└── Namespace: 'agents'
    └── Agent embeddings (260 vectors)
```

**Current Strategy: Single Namespace with Metadata Filtering** ✅

### 2. **Vector Metadata Structure**

**Knowledge Chunks (Default Namespace):**
```typescript
{
  id: 'chunk-uuid',                    // Same as PostgreSQL chunk.id
  values: [0.123, -0.456, ...],       // 3072-dimensional embedding
  metadata: {
    chunk_id: 'chunk-uuid',            // Link back to PostgreSQL
    document_id: 'doc-uuid',            // Link to document
    content: 'chunk text...',          // First 40,000 chars (Pinecone limit)
    domain: 'regulatory_affairs',      // ✅ Domain as TEXT (slug)
    source_title: 'FDA Regulations 2024',
    tags: ['global', 'regulatory'],
    timestamp: '2024-01-15T10:30:00Z',
    ...additional_metadata
  }
}
```

**Agent Embeddings (Agents Namespace):**
```typescript
{
  id: 'agent-uuid',
  values: [0.234, -0.567, ...],       // Agent profile embedding
  metadata: {
    entity_type: 'agent',
    agent_id: 'agent-uuid',
    name: 'Regulatory Affairs Specialist',
    domain: 'regulatory_affairs',
    capabilities: ['fda_submissions', 'ema_compliance'],
    timestamp: '2024-01-15T10:30:00Z'
  }
}
```

### 3. **Query Pattern**

**Single Domain Query:**
```typescript
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: { 
    domain: { '$eq': 'regulatory_affairs' }  // ✅ Metadata filter
  },
  topK: 10,
  namespace: ''  // Default namespace
});
```

**Multi-Domain Query:**
```typescript
await pineconeVectorService.search({
  text: 'clinical trials regulations',
  filter: {
    '$or': [
      { domain: { '$eq': 'regulatory_affairs' } },
      { domain: { '$eq': 'clinical_development' } }
    ]
  },
  topK: 20,
  namespace: ''
});
```

---

## 🔗 **Domain Linking Architecture**

### **Data Flow:**

```
1. Document Upload
   ↓
2. knowledge_documents.domain = 'regulatory_affairs' (TEXT)
   ↓
3. Document Chunking
   ↓
4. document_chunks (inherits via JOIN with knowledge_documents)
   ↓
5. Embedding Generation
   ↓
6. Pinecone Upsert:
   - Vector: embedding values
   - Metadata.domain = 'regulatory_affairs' (TEXT slug)
   ↓
7. Query:
   - Filter by metadata.domain
   - Retrieve matching chunks
   - Join back to PostgreSQL for full content
```

### **Domain Resolution Path:**

```
Pinecone Query
  → Filter by metadata.domain
  → Get chunk_ids
  → Query Supabase document_chunks by id
  → JOIN knowledge_documents to get domain context
  → Return enriched results
```

---

## 📈 **Current Implementation Status**

### ✅ **What's Working:**

1. **Domain Storage**: Domains stored as TEXT slugs in both Supabase and Pinecone
2. **Domain Filtering**: Pinecone metadata filtering works for single/multi-domain queries
3. **Domain-Specific RAG Service**: `DomainSpecificRAGService` provides domain interfaces
4. **Cross-Domain Queries**: Supports querying multiple domains simultaneously
5. **Domain Statistics**: Can retrieve stats per domain (document/chunk counts)

### ⚠️ **Issues Identified:**

1. **Schema Inconsistency**:
   - Migrations define `domain_id` (UUID FK), but code uses `domain` (TEXT)
   - **Impact**: Potential confusion, works but not normalized
   - **Recommendation**: Standardize on TEXT slug or migrate to UUID FK

2. **Domain Validation**:
   - No foreign key constraint when using TEXT `domain` field
   - **Impact**: Could store invalid domain slugs
   - **Recommendation**: Add CHECK constraint or migrate to FK

3. **Domain Resolution**:
   - Queries rely on TEXT matching rather than JOINs
   - **Impact**: Less efficient, potential inconsistencies
   - **Recommendation**: Use JOINs if migrating to UUID FK

### 💡 **Enhancement Opportunities:**

1. **Domain Metadata Enrichment**:
   - Add domain-specific embedding model preferences
   - Store domain coverage metrics
   - Track domain usage statistics

2. **Domain Hierarchy Support**:
   - Some domains have `parent_id` in migrations (not used)
   - Could support hierarchical domain relationships
   - Enable sub-domain filtering

3. **Domain Cross-References**:
   - Track related domains (e.g., Regulatory ↔ Clinical)
   - Suggest complementary domains in queries
   - Show domain relationship graph

4. **Domain-Specific Optimization**:
   - Different chunk sizes per domain
   - Domain-specific embedding models
   - Custom similarity thresholds per domain

---

## 🔄 **Recommended Enhancements**

### **Priority 1: Schema Standardization**

**Option A: Migrate to UUID Foreign Key (Recommended)**
```sql
-- Migration to add domain_id with FK
ALTER TABLE knowledge_documents 
  ADD COLUMN domain_id UUID REFERENCES knowledge_domains(id);

-- Backfill from slug
UPDATE knowledge_documents kd
SET domain_id = (
  SELECT id FROM knowledge_domains 
  WHERE slug = kd.domain
);

-- Drop TEXT domain column
ALTER TABLE knowledge_documents DROP COLUMN domain;

-- Update code to use JOINs instead of TEXT matching
```

**Option B: Keep TEXT but Add Validation**
```sql
-- Add CHECK constraint
ALTER TABLE knowledge_documents
  ADD CONSTRAINT valid_domain_slug 
  CHECK (domain IN (
    SELECT slug FROM knowledge_domains WHERE is_active = true
  ));

-- Add index for performance
CREATE INDEX idx_knowledge_documents_domain 
  ON knowledge_documents(domain);
```

### **Priority 2: Enhanced Domain Metadata**

```sql
-- Add domain-specific configuration to knowledge_domains
ALTER TABLE knowledge_domains
  ADD COLUMN rag_config JSONB DEFAULT '{
    "chunk_size": 1500,
    "chunk_overlap": 300,
    "similarity_threshold": 0.7,
    "embedding_model": "text-embedding-3-large",
    "max_results": 10
  }'::jsonb;

-- Add domain relationships
ALTER TABLE knowledge_domains
  ADD COLUMN related_domains UUID[] DEFAULT '{}';

-- Add domain usage statistics
CREATE TABLE domain_usage_stats (
  domain_id UUID REFERENCES knowledge_domains(id),
  query_count INTEGER DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Priority 3: Improved Query Performance**

```sql
-- Composite index for domain filtering
CREATE INDEX idx_knowledge_documents_domain_status 
  ON knowledge_documents(domain, status) 
  WHERE status = 'completed';

-- Materialized view for domain statistics
CREATE MATERIALIZED VIEW domain_stats AS
SELECT 
  kd.id AS domain_id,
  kd.slug,
  kd.name,
  COUNT(DISTINCT kdoc.id) AS document_count,
  COUNT(dc.id) AS chunk_count,
  MAX(kdoc.updated_at) AS last_updated
FROM knowledge_domains kd
LEFT JOIN knowledge_documents kdoc ON kdoc.domain = kd.slug
LEFT JOIN document_chunks dc ON dc.document_id = kdoc.id
WHERE kd.is_active = true
GROUP BY kd.id, kd.slug, kd.name;

-- Refresh periodically
CREATE INDEX idx_domain_stats_slug ON domain_stats(slug);
```

---

## 📊 **Metrics & Statistics**

### **Current Coverage:**

- **Total Domains**: 30
- **Tier Distribution**: 15 (Tier 1) + 10 (Tier 2) + 5 (Tier 3)
- **Agent Coverage**: 254+ agents mapped to domains
- **Pinecone Index**: `vital-knowledge`
- **Namespaces**: 2 (`''` for knowledge, `'agents'` for agents)
- **Embedding Model**: `text-embedding-3-large` (3072 dimensions)

### **Storage Efficiency:**

- **Supabase**: Domain stored as TEXT slug (minimal storage)
- **Pinecone**: Domain in metadata (efficient filtering)
- **Strategy**: Single namespace = simpler = faster = cheaper ✅

---

## 🎯 **Conclusion**

The current RAG domain structure is **functional** but has **architectural inconsistencies** between migrations and code. The Pinecone implementation using single namespace with metadata filtering is **optimal** for this use case.

**Key Strengths:**
- ✅ Domain-specific RAG interfaces work well
- ✅ Single namespace strategy is efficient
- ✅ Cross-domain queries are supported
- ✅ Domain statistics are available

**Areas for Improvement:**
- ⚠️ Standardize domain linking (UUID FK vs TEXT slug)
- ⚠️ Add domain validation
- 💡 Enhance domain metadata and relationships
- 💡 Optimize query performance with proper indexes

**Next Steps:**
1. Decide on schema approach (UUID FK vs TEXT validation)
2. Create migration to standardize domain storage
3. Enhance domain metadata with richer configuration
4. Add domain relationship tracking
5. Implement domain usage analytics

