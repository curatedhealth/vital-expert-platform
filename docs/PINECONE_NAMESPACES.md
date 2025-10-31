# Pinecone Namespaces Configuration

## 🎯 Current Namespaces

Your Pinecone index (`vital-knowledge`) uses **2 namespaces**:

### 1. **`'domains-knowledge'` Namespace** (Previously `''` default)
- **Purpose**: Stores all knowledge/document chunks
- **Content**: All document chunks with domain metadata
- **Filtering**: Uses metadata fields (`domain`, `domain_id`, etc.) for filtering

**Usage:**
```typescript
// Upsert knowledge chunks
await index.namespace('domains-knowledge').upsert(vectors);

// Search knowledge chunks
await index.namespace('domains-knowledge').query({
  vector: queryVector,
  topK: 10,
  filter: { domain_id: { $eq: 'regulatory_affairs' } }
});
```

### 2. **`'agents'` Namespace**
- **Purpose**: Stores agent embeddings for GraphRAG search
- **Content**: Agent embeddings (currently ~260 vectors)
- **Usage**: Agent-to-agent similarity search

**Usage:**
```typescript
// Upsert agent embeddings
await index.namespace('agents').upsert([
  {
    id: agentId,
    values: agentEmbedding,
    metadata: { ... }
  }
]);

// Search agents
await index.namespace('agents').query({
  vector: queryVector,
  topK: 10
});
```

## 📊 Current Structure

```
Pinecone Index: vital-knowledge
├── Namespace: 'domains-knowledge' (renamed from default '')
│   └── All knowledge/document chunks
│       ├── Metadata includes: domain, domain_id, access_policy, rag_priority_weight, etc.
│       └── Filtering by domain via metadata filters
│
└── Namespace: 'agents'
    └── Agent embeddings (~260 vectors)
        └── Used for GraphRAG agent-to-agent search
```

## 🔍 How Namespaces Are Used

### Knowledge Storage (Domains-Knowledge Namespace)

**Code Location**: `apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service.ts`

**Namespace Constant:**
```typescript
private knowledgeNamespace: string = 'domains-knowledge';
```

**When uploading documents:**
```typescript
// In unified-rag-service.ts
await this.pinecone.upsertVectors(pineconeVectors);
// Uses 'domains-knowledge' namespace (default)
```

**When searching:**
```typescript
// In pinecone-vector-service.ts
await index.namespace(query.namespace || this.knowledgeNamespace).query({
  vector: queryVector,
  topK: 10,
  filter: { ... }
});
// Defaults to 'domains-knowledge' if no namespace specified
```

### Agent Storage (Agents Namespace)

**Code Location**: `apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service.ts`

**Agent methods explicitly use 'agents' namespace:**
```typescript
async syncAgentToPinecone(agentEmbedding) {
  const namespace = 'agents'; // Explicit namespace
  await index.namespace(namespace).upsert([...]);
}

async searchAgents(query) {
  const namespace = 'agents'; // Explicit namespace
  await index.namespace(namespace).query({...});
}
```

## ✅ Why This Structure?

### Named Namespace for Knowledge (Domains-Knowledge)
- ✅ **Clear naming**: Descriptive namespace name instead of empty string
- ✅ **Cross-domain queries**: Easy to search across multiple domains
- ✅ **Simpler management**: One namespace to manage
- ✅ **Better for multi-domain agents**: Agents often need knowledge from multiple domains
- ✅ **Lower cost**: No namespace overhead
- ✅ **Efficient filtering**: Pinecone metadata filtering is optimized
- ✅ **Flexible**: Easy to add new domains without namespace management

### Separate Namespace for Agents
- ✅ **Clear separation**: Agents are different entity type
- ✅ **GraphRAG optimization**: Agent-to-agent search isolated
- ✅ **Different use case**: Agents vs. knowledge chunks

## 🔄 Namespace Usage in Code

### Knowledge Chunks (Domains-Knowledge Namespace)
```typescript
// Upsert (defaults to 'domains-knowledge')
await pineconeVectorService.upsertVectors(vectors);
// Equivalent to: await index.namespace('domains-knowledge').upsert(vectors);

// Search (defaults to 'domains-knowledge')
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: { domain_id: { $eq: 'regulatory_affairs' } }
});
```

### Agent Embeddings (Agents Namespace)
```typescript
// Upsert agents
await pineconeVectorService.syncAgentToPinecone({
  agentId: 'agent-123',
  embedding: [...],
  metadata: {...}
});
// Uses 'agents' namespace explicitly

// Search agents
await pineconeVectorService.searchAgents({
  text: 'regulatory expert',
  topK: 10
});
// Uses 'agents' namespace explicitly
```

## 📝 Summary

| Namespace | Content | Usage | Filtering |
|-----------|---------|-------|------------|
| `'domains-knowledge'` | All knowledge chunks | Document RAG queries | Metadata (`domain_id`, `domain`, etc.) |
| `'agents'` | Agent embeddings | Agent GraphRAG search | Agent metadata |

**Migration Note**: The default namespace (`''`) has been renamed to `'domains-knowledge'` for better clarity and organization.

**Current Status**: ✅ Using named namespace `'domains-knowledge'` for knowledge chunks, with separate namespace `'agents'` for agent embeddings.
