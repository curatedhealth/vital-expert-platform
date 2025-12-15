# Pinecone Vector Database Assets

**Purpose:** Pinecone vector database index configurations and schemas  
**Status:** Structure created - index configs to be documented

---

## Structure

```
pinecone/
├── indexes/            # Index configurations
└── schemas/            # Vector schema definitions
```

---

## Current Implementation

Pinecone is currently configured via:
- Environment variables: `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`
- Client code: `apps/vital-system/src/lib/services/vectorstore/pinecone-vector-service.ts`
- Sync scripts: `database/sync/sync_agents_to_pinecone.py`

---

## Indexes

**Current Indexes:**
- `vital-knowledge` - Main knowledge base index
- `vital-medical` - Medical domain index

**Configuration:**
- Dimension: 3072 (text-embedding-3-large)
- Namespace: `domains-knowledge`

---

## Next Steps

1. Document index configurations in `indexes/`
2. Document vector schemas in `schemas/`
3. Extract index configs from code

---

**See Also:**
- [Multi-Database Organization Standard](../../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)
- Pinecone Service: `apps/vital-system/src/lib/services/vectorstore/pinecone-vector-service.ts`
