# Pinecone Mapping - New RAG Domain Architecture

## ✅ Updated Pinecone Integration

The Pinecone vector service has been updated to support the new unified RAG domain architecture.

## 📋 Changes Made

### 1. **Pinecone Metadata Structure**

**Updated `PineconeVectorRecord` interface:**
```typescript
{
  id: string;
  values: number[];
  metadata: {
    chunk_id: string;
    document_id: string;
    content: string;
    
    // Domain fields (new architecture)
    domain_id?: string;        // ✅ NEW: Primary domain identifier
    parent_domain_id?: string; // ✅ NEW: For hierarchy fallback
    domain_scope?: string;     // ✅ NEW: global/enterprise/user
    domain?: string;           // Legacy field (backward compatibility)
    
    // Access control
    access_policy?: string;    // ✅ NEW: Access control level
    enterprise_id?: string;    // ✅ NEW: Multi-tenant filtering
    owner_user_id?: string;    // ✅ NEW: User-scoped content
    
    // Ranking
    rag_priority_weight?: number; // ✅ NEW: Priority for ranking (0-1)
    tier?: number;                // ✅ NEW: Domain tier
    maturity_level?: string;      // ✅ NEW: Domain maturity
    
    // Legacy fields
    source_title?: string;
    timestamp?: string;
  }
}
```

### 2. **Query Filter Updates**

**Before:**
```typescript
filter: { domain: { '$eq': 'regulatory_affairs' } }
```

**After (supports both):**
```typescript
filter: {
  $or: [
    { domain_id: { '$eq': 'regulatory_affairs' } },
    { domain: { '$eq': 'regulatory_affairs' } }
  ]
}
```

**Multiple domains:**
```typescript
filter: {
  $or: [
    { domain_id: { '$in': ['regulatory_affairs', 'clinical'] } },
    { domain: { '$in': ['regulatory_affairs', 'clinical'] } }
  ]
}
```

### 3. **Vector Search Results**

**Updated `VectorSearchResult` interface:**
```typescript
{
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  domain?: string;           // Legacy field
  domain_id?: string;        // ✅ NEW field
  rag_priority_weight?: number; // ✅ NEW: For priority-based ranking
  // ...
}
```

### 4. **Hybrid Search Updates**

The `hybridSearch` method now:
- ✅ Fetches `domain_id` from Supabase
- ✅ Supports filtering by both `domain` and `domain_id`
- ✅ Includes `rag_priority_weight` in results for ranking

### 5. **Chunk Synchronization**

When syncing chunks to Pinecone:
- ✅ Includes `domain_id` in metadata
- ✅ Includes `access_policy` if available
- ✅ Includes `rag_priority_weight` if available
- ✅ Maintains `domain` field for backward compatibility

### 6. **Bulk Sync Updates**

The `bulkSyncFromSupabase` method:
- ✅ Fetches `domain_id` from chunks
- ✅ Includes new architecture fields in Pinecone metadata
- ✅ Maintains backward compatibility with `domain` field

## 🔍 How Queries Work

### Single Domain Query
```typescript
await pineconeVectorService.search({
  text: 'FDA regulations',
  filter: {
    $or: [
      { domain_id: { '$eq': 'regulatory_affairs' } },
      { domain: { '$eq': 'regulatory_affairs' } }
    ]
  },
  topK: 10
});
```

### Multi-Domain Query
```typescript
await pineconeVectorService.search({
  text: 'clinical trials',
  filter: {
    $or: [
      { domain_id: { '$in': ['regulatory_affairs', 'clinical'] } },
      { domain: { '$in': ['regulatory_affairs', 'clinical'] } }
    ]
  },
  topK: 20
});
```

### With Access Control
```typescript
await pineconeVectorService.search({
  text: 'patient data',
  filter: {
    $or: [
      { domain_id: { '$eq': 'clinical' } },
      { domain: { '$eq': 'clinical' } }
    ],
    access_policy: { '$in': ['public', 'enterprise_confidential'] },
    enterprise_id: { '$in': [null, userEnterpriseId] }
  },
  topK: 10
});
```

## 🎯 Priority-Based Ranking

Results can now be re-ranked using `rag_priority_weight`:

```typescript
const results = await pineconeVectorService.search({...});

// Re-rank by priority weight
results.sort((a, b) => {
  const weightA = a.rag_priority_weight || 0.5;
  const weightB = b.rag_priority_weight || 0.5;
  
  // Combine similarity score with priority weight
  const scoreA = a.similarity * (1 + weightA);
  const scoreB = b.similarity * (1 + weightB);
  
  return scoreB - scoreA;
});
```

## 🔄 Data Flow

1. **Document Upload**:
   - Document saved with `domain_id` in Supabase
   - Chunks inherit `domain_id`, `access_policy`, `rag_priority_weight`
   
2. **Chunk to Pinecone**:
   - Chunks synced with `domain_id` in metadata
   - New architecture fields included
   - Legacy `domain` field maintained

3. **Query**:
   - Query supports both `domain_id` and `domain` filters
   - Results include `domain_id` and `rag_priority_weight`
   - Can be filtered by `access_policy`, `domain_scope`, etc.

## ✅ Backward Compatibility

All changes maintain backward compatibility:
- ✅ Legacy `domain` field still works
- ✅ Queries without `domain_id` still function
- ✅ Existing Pinecone vectors still queryable
- ✅ Gradual migration possible

## 🚀 Next Steps

1. **Priority-based ranking**: Implement re-ranking using `rag_priority_weight`
2. **Access control filtering**: Add RBAC filtering in queries
3. **Domain hierarchy**: Support parent domain fallback in queries
4. **Multi-tenant filtering**: Filter by `enterprise_id` in queries

## 📝 Migration Notes

Existing Pinecone vectors will continue to work with the `domain` field. New uploads will include both `domain` and `domain_id` for smooth transition. You can run a bulk sync to update existing vectors with new fields if needed.

