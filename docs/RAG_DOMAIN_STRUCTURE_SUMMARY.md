# RAG Domain Structure - Quick Reference Summary

## 🎯 Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG DOMAIN STRUCTURE                     │
└─────────────────────────────────────────────────────────────┘

SUPABASE (PostgreSQL)                    PINECONE (Vector DB)
─────────────────────                    ──────────────────

┌─────────────────────┐                  ┌─────────────────┐
│ knowledge_domains   │                  │ Index:          │
│ ─────────────────  │                  │ vital-knowledge │
│ • id (UUID)         │                  │                 │
│ • code (TEXT)       │                  │ Namespaces:     │
│ • name (TEXT)       │                  │ • '' (default)  │
│ • slug (TEXT)       │                  │ • 'agents'       │
│ • tier (INT)        │                  │                 │
│ • priority (INT)    │                  │ Storage:        │
│ • keywords (TEXT[]) │                  │ • Vectors       │
│ • is_active (BOOL)  │                  │ • Metadata      │
│ • metadata (JSONB)  │                  │   - domain      │
└─────────────────────┘                  │   - chunk_id    │
          │                               │   - content     │
          │                               └─────────────────┘
          │                                          │
          ▼                                          ▼
┌─────────────────────┐                  ┌─────────────────┐
│ knowledge_documents  │                  │ Vector Format:  │
│ ─────────────────   │                  │                 │
│ • id (UUID)         │                  │ {               │
│ • title (TEXT)      │                  │   id: chunk_id  │
│ • content (TEXT)    │                  │   values: [...] │
│ • domain (TEXT) ⚠️  │                  │   metadata: {   │
│ • status (TEXT)     │                  │     domain: "", │
│ • tags (TEXT[])     │                  │     chunk_id,   │
│ • metadata (JSONB)  │                  │     content,    │
└─────────────────────┘                  │     ...         │
          │                               │   }             │
          │                               │ }               │
          ▼                               └─────────────────┘
┌─────────────────────┐
│ document_chunks     │
│ ─────────────────   │
│ • id (UUID)         │
│ • document_id (FK)  │
│ • chunk_index (INT) │
│ • content (TEXT)    │
│ • embedding (VEC)   │
│ • metadata (JSONB)  │
└─────────────────────┘
```

---

## 📊 Domain Statistics

### **30 Domains Organized in 3 Tiers**

```
TIER 1 (CORE) - 15 domains
├─ Regulatory Affairs (85 agents)
├─ Clinical Development (37 agents)
├─ Pharmacovigilance (25 agents)
├─ Quality Management (20 agents)
├─ Medical Affairs (15 agents)
├─ Commercial Strategy (29 agents)
├─ Drug Development (39 agents)
├─ Clinical Data Analytics (18 agents)
├─ Manufacturing Operations (17 agents)
├─ Medical Devices (12 agents)
├─ Digital Health (34 agents)
├─ Supply Chain (15 agents)
├─ Legal & Compliance (10 agents)
├─ Health Economics (12 agents)
└─ Business Strategy (10 agents)

TIER 2 (SPECIALIZED) - 10 domains
├─ Product Labeling (8 agents)
├─ Post-Market Activities (10 agents)
├─ Companion Diagnostics (6 agents)
├─ Nonclinical Sciences (12 agents)
├─ Patient Engagement (5 agents)
├─ Risk Management (8 agents)
├─ Scientific Publications (7 agents)
├─ KOL & Stakeholder Engagement (6 agents)
├─ Evidence Generation (5 agents)
└─ Global Market Access (8 agents)

TIER 3 (EMERGING) - 5 domains
├─ Real-World Data & Evidence (8 agents)
├─ Precision Medicine (6 agents)
├─ Telemedicine & Remote Care (5 agents)
├─ AI & Machine Learning (4 agents)
└─ Patient-Centric Trials (4 agents)
```

---

## 🔍 Key Findings

### ✅ **What's Working Well:**

1. **Single Namespace Strategy** ✅
   - All knowledge chunks in default namespace (`''`)
   - Domain filtering via metadata
   - Efficient cross-domain queries

2. **Domain-Specific RAG Service** ✅
   - `DomainSpecificRAGService` provides domain interfaces
   - Supports single and multi-domain queries
   - Domain statistics and coverage tracking

3. **Pinecone Integration** ✅
   - Domain stored in vector metadata
   - Efficient metadata filtering
   - Separate `agents` namespace for agent embeddings

### ⚠️ **Issues Identified:**

1. **Schema Inconsistency**
   - Migrations use `domain_id` (UUID FK)
   - Code uses `domain` (TEXT slug)
   - **Status**: Works but not normalized

2. **Missing Validation**
   - No foreign key constraint on TEXT `domain` field
   - Could store invalid domain slugs
   - **Impact**: Low (application-level validation exists)

3. **Query Optimization**
   - TEXT matching instead of JOINs
   - Could benefit from composite indexes
   - **Impact**: Medium (performance optimization opportunity)

---

## 🔗 Domain Linking Flow

```
┌─────────────┐
│  Document   │
│   Upload    │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ knowledge_documents       │
│ domain = 'regulatory_...' │  ← TEXT slug stored
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Document Chunking         │
│ (15 chunks generated)     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ document_chunks           │
│ (inherits via JOIN)       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Embedding Generation      │
│ (text-embedding-3-large)  │
│ → 3072-dimensional       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐         ┌─────────────────┐
│ SUPABASE                 │         │ PINECONE        │
│ ─────────────────        │         │ ───────────     │
│ • Full chunk text        │         │ • Vector values │
│ • Embedding (pgvector)   │         │ • Metadata:     │
│ • Metadata               │────────▶│   - domain      │
│                          │         │   - chunk_id    │
│                          │         │   - content     │
└──────────────────────────┘         └─────────────────┘
```

---

## 🔍 Query Pattern

### **Single Domain Query:**

```typescript
// Pinecone metadata filter
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: { 
    domain: { '$eq': 'regulatory_affairs' } 
  },
  topK: 10,
  namespace: ''  // Default namespace
});

// Returns chunks from regulatory_affairs domain only
```

### **Multi-Domain Query:**

```typescript
// Query multiple domains
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

// Returns chunks from both domains, ranked by similarity
```

---

## 💡 Recommendations

### **Priority 1: Schema Standardization**

Choose one approach:
- **Option A**: Migrate to UUID foreign key (`domain_id`)
  - ✅ Normalized
  - ✅ Data integrity
  - ⚠️ Requires code changes

- **Option B**: Keep TEXT but add validation
  - ✅ Simpler
  - ✅ Current code works
  - ⚠️ Less normalized

### **Priority 2: Enhanced Metadata**

- Add domain-specific RAG configuration
- Track domain relationships
- Implement domain usage analytics

### **Priority 3: Performance Optimization**

- Add composite indexes for domain filtering
- Create materialized views for domain stats
- Optimize cross-domain queries

---

## 📈 Current Metrics

- **Total Domains**: 30
- **Total Agents**: 254+
- **Pinecone Index**: `vital-knowledge`
- **Embedding Model**: `text-embedding-3-large` (3072 dims)
- **Storage Strategy**: Single namespace with metadata filtering ✅
- **Cross-Domain Support**: Yes ✅

---

## 🎯 Next Steps

1. ✅ Review analysis document (`RAG_DOMAIN_STRUCTURE_ANALYSIS.md`)
2. 🔄 Decide on schema approach (UUID FK vs TEXT validation)
3. 🔄 Create migration plan if standardizing schema
4. 🔄 Enhance domain metadata structure
5. 🔄 Implement domain relationship tracking
6. 🔄 Add domain usage analytics

---

**Full Analysis**: See `RAG_DOMAIN_STRUCTURE_ANALYSIS.md` for detailed technical analysis.

