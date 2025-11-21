# Pinecone Knowledge Base Storage Strategy

## 🎯 Current State

- **Agents**: Stored in `agents` namespace (260 vectors)
- **Knowledge**: Currently using **default namespace** (`''`) with domain in metadata
- **Total Knowledge Domains**: 54 domains
- **Embedding Model**: Same for all (text-embedding-3-large, 3072 dimensions)

## 📊 Option Comparison

### Option 1: Single Namespace with Metadata Filtering ✅ **RECOMMENDED**

**Structure:**
```
Index: vital-knowledge
├── Namespace: '' (default)
│   └── All knowledge chunks with domain in metadata
└── Namespace: 'agents'
    └── Agent embeddings
```

**Pros:**
- ✅ **Cross-domain queries**: Easy to search across multiple domains
- ✅ **Simpler management**: One namespace to manage
- ✅ **Better for multi-domain agents**: Agents often need knowledge from multiple domains
- ✅ **Lower cost**: No namespace overhead
- ✅ **Pinecone metadata filtering**: Efficient domain filtering via `filter: { domain: { '$eq': 'regulatory' } }`
- ✅ **Already implemented**: Current code uses this pattern
- ✅ **Flexible**: Easy to add new domains without namespace management

**Cons:**
- ⚠️ Slightly more complex queries (need metadata filters)
- ⚠️ Can't delete entire domain at once (must use metadata filters)

**Query Example:**
```typescript
// Single domain
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: { domain: { '$eq': 'regulatory' } },
  topK: 10
});

// Multiple domains
await pineconeVectorService.search({
  text: 'clinical trials',
  filter: { 
    '$or': [
      { domain: { '$eq': 'clinical' } },
      { domain: { '$eq': 'regulatory' } }
    ]
  },
  topK: 20
});
```

---

### Option 2: One Namespace Per Domain

**Structure:**
```
Index: vital-knowledge
├── Namespace: 'knowledge-regulatory'
├── Namespace: 'knowledge-clinical'
├── Namespace: 'knowledge-pharmacovigilance'
├── ... (54 namespaces total)
└── Namespace: 'agents'
```

**Pros:**
- ✅ **Clear isolation**: Each domain completely separated
- ✅ **Easy deletion**: Delete entire domain by deleting namespace
- ✅ **Domain-specific optimization**: Could tune each namespace independently
- ✅ **Clear organization**: Easy to see what's in each domain

**Cons:**
- ❌ **Cross-domain queries complex**: Must query multiple namespaces and merge results
- ❌ **Management overhead**: 54 namespaces to manage
- ❌ **Less flexible**: Hard to change domain assignments
- ❌ **Namespace limits**: Pinecone has practical limits on namespace count
- ❌ **Performance**: Querying 54 namespaces for multi-domain search is slow
- ❌ **Cost**: More complex = potentially higher costs

**Query Example (Multi-domain):**
```typescript
// Would need to query all relevant namespaces
const domains = ['regulatory', 'clinical'];
const results = await Promise.all(
  domains.map(domain => 
    pineconeVectorService.search({
      text: 'FDA trials',
      namespace: `knowledge-${domain}`,
      topK: 10
    })
  )
);
// Then merge and re-rank results
```

---

### Option 3: Hybrid Approach (Group Related Domains)

**Structure:**
```
Index: vital-knowledge
├── Namespace: 'knowledge-core' (Tier 1 domains: regulatory, clinical, etc.)
├── Namespace: 'knowledge-specialized' (Tier 2 domains)
├── Namespace: 'knowledge-emerging' (Tier 3 domains)
└── Namespace: 'agents'
```

**Pros:**
- ✅ Better than 54 namespaces, worse than 1
- ✅ Some organization by tier

**Cons:**
- ⚠️ Still requires multi-namespace queries for cross-tier searches
- ⚠️ Domain changes require moving vectors between namespaces
- ⚠️ Extra complexity for minimal benefit

---

## 🏆 **RECOMMENDATION: Option 1 (Single Namespace with Domain-Specific RAG Interface)**

### Why?

1. **Your use case**: Agents often need multi-domain knowledge
   - Example: A Regulatory Affairs agent might need Clinical + Regulatory knowledge
   - Cross-domain queries are common in healthcare/RAG systems

2. **Current implementation**: Already using this pattern
   - `sync-supabase-to-pinecone.js` uses default namespace
   - Domain filtering already works via metadata

3. **Pinecone best practices**: Metadata filtering is efficient
   - Pinecone optimizes metadata queries
   - Single namespace = simpler = faster = cheaper

4. **Scalability**: 
   - 54 namespaces = operational burden
   - Single namespace = easier to scale

### Implementation

**Current code is already correct!** ✅

The key insight: **You can have separate RAG interfaces for each domain while using a single namespace!**

#### Storage Layer (Efficient):
```typescript
// Single namespace for all knowledge - efficient and scalable
await index.namespace('').upsert(vectors); // Default namespace
```

#### Application Layer (Domain-Specific):
```typescript
// Use DomainSpecificRAGService to create domain-specific interfaces
import { domainSpecificRAGService } from '@/lib/services/rag/domain-specific-rag-service';

// Query Regulatory domain RAG (feels like separate RAG)
const regulatoryResults = await domainSpecificRAGService.queryDomainRAG({
  text: 'FDA regulations',
  domain: 'regulatory',
  topK: 10
});

// Query Clinical domain RAG (feels like separate RAG)
const clinicalResults = await domainSpecificRAGService.queryDomainRAG({
  text: 'Clinical trial design',
  domain: 'clinical',
  topK: 10
});

// Query multiple domains (shows richness!)
const multiDomainResults = await domainSpecificRAGService.queryMultiDomainRAG({
  text: 'Clinical trials regulations',
  domain: ['regulatory', 'clinical'],
  topK: 20
});

// Show domain richness (your value proposition!)
const domainStats = await domainSpecificRAGService.getAllDomainsStats();
// Returns: [{ domain: 'regulatory', totalDocuments: 150, ... }, ...]
```

#### API Endpoints (User-Facing):
```typescript
// GET /api/rag/domain?domain=regulatory&query=...
// POST /api/rag/domain/multi { query: "...", domains: ["regulatory", "clinical"] }
// GET /api/rag/domain/stats/all (shows all domain richness)
```

**This gives you:**
- ✅ **Operational efficiency**: Single namespace storage
- ✅ **User value**: Domain-specific RAG interfaces
- ✅ **Richness display**: Easy to show domain coverage/comparison
- ✅ **Flexibility**: Multi-domain queries when needed
- ✅ **Best of both worlds**: Efficiency + UX value

---

## 📝 Implementation Checklist

- [x] Current sync uses default namespace
- [x] Domain stored in metadata
- [x] Search supports domain filtering
- [x] Domain-specific RAG service created
- [x] API endpoints for domain-specific queries
- [x] Domain stats/coverage endpoints
- [x] Documentation updated
- [x] Sync script comments updated
- [ ] **Next: Create UI components that showcase domain richness**

---

## 🔄 Migration Path (If You Change Your Mind)

If you ever need to switch to per-domain namespaces:

1. Create migration script that:
   - Reads all vectors from default namespace
   - Groups by domain from metadata
   - Upserts to `knowledge-{domain}` namespaces
   
2. Update search code to:
   - Query relevant namespaces
   - Merge and re-rank results

3. **But**: This adds complexity without clear benefit for your use case

---

## 💡 When to Use Per-Domain Namespaces

Consider per-domain namespaces if:
- You need **absolute domain isolation** (compliance requirement)
- Domains use **different embedding models/dimensions**
- You frequently **delete entire domains**
- You have **domain-specific SLA requirements**

For your 54 healthcare domains with same embedding model → **Single namespace is better** ✅

