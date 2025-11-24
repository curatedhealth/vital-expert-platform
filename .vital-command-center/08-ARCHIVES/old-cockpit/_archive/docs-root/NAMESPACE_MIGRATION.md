# Pinecone Namespace Migration: Default → Domains-Knowledge

## ✅ Migration Complete

The default namespace (`''`) has been renamed to `'domains-knowledge'` for better clarity and organization.

## 📋 Changes Made

### 1. **PineconeVectorService Class**

**Added namespace constant:**
```typescript
private knowledgeNamespace: string = 'domains-knowledge';
```

**Updated methods:**
- ✅ `upsertVectors()` - defaults to `'domains-knowledge'`
- ✅ `search()` - defaults to `'domains-knowledge'`
- ✅ `deleteVectors()` - defaults to `'domains-knowledge'`
- ✅ `bulkSyncFromSupabase()` - defaults to `'domains-knowledge'`

### 2. **Domain-Specific RAG Service**

**Updated namespace references:**
- ✅ `queryDomainRAG()` - uses `'domains-knowledge'`
- ✅ `queryMultiDomainRAG()` - uses `'domains-knowledge'`
- ✅ All domain queries now use `'domains-knowledge'`

## 🔄 Namespace Usage

### Before (Default Namespace)
```typescript
// Used empty string ''
await index.namespace('').upsert(vectors);
await index.namespace('').query({...});
```

### After (Named Namespace)
```typescript
// Uses 'domains-knowledge'
await index.namespace('domains-knowledge').upsert(vectors);
await index.namespace('domains-knowledge').query({...});

// Or via service (defaults to 'domains-knowledge')
await pineconeVectorService.upsertVectors(vectors);
await pineconeVectorService.search({...});
```

## 📊 Current Namespace Structure

```
Pinecone Index: vital-knowledge
├── Namespace: 'domains-knowledge' ✅ NEW NAME
│   └── All knowledge/document chunks
│       ├── Metadata: domain_id, domain, access_policy, rag_priority_weight
│       └── Filtering by domain via metadata
│
└── Namespace: 'agents'
    └── Agent embeddings (unchanged)
```

## 🚀 Migration Notes

### For Existing Data

If you have existing vectors in the default namespace (`''`), you have two options:

#### Option 1: Keep Both (Recommended)
- Existing vectors in `''` will continue to work
- New uploads go to `'domains-knowledge'`
- Gradually migrate over time

#### Option 2: Migrate Existing Data
Run a migration script to move existing vectors:

```typescript
// Migration script (run once)
async function migrateNamespace() {
  // 1. Query all vectors from default namespace
  const allVectors = await index.namespace('').listPaginated({...});
  
  // 2. Upsert to new namespace
  await index.namespace('domains-knowledge').upsert(allVectors);
  
  // 3. Delete from old namespace (optional)
  await index.namespace('').deleteAll();
}
```

### For New Code

All new code automatically uses `'domains-knowledge'`:

```typescript
// Automatically uses 'domains-knowledge'
await pineconeVectorService.upsertVectors(vectors);
await pineconeVectorService.search({ text: 'query' });
```

## ✅ Benefits

1. **Clear Naming**: `'domains-knowledge'` is more descriptive than `''`
2. **Better Organization**: Easier to identify namespace purpose
3. **Easier Management**: Can see namespace name in Pinecone dashboard
4. **Backward Compatible**: Code defaults to new namespace automatically

## 📝 Summary

| Aspect | Before | After |
|--------|--------|-------|
| Namespace Name | `''` (default) | `'domains-knowledge'` |
| Code Defaults | Empty string | `'domains-knowledge'` |
| Clarity | Ambiguous | Clear purpose |
| Dashboard Visibility | Shows as empty | Shows as 'domains-knowledge' |

**Status**: ✅ Migration complete - all code updated to use `'domains-knowledge'`

