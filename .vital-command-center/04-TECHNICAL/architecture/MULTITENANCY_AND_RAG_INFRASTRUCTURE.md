# Multitenancy and RAG Infrastructure

## Overview

This document describes the subdomain-based multitenancy system and RAG (Retrieval-Augmented Generation) infrastructure implemented for the VITAL platform.

## Multitenancy System

### Tenant Configuration

Three MVP tenants are configured:

| Tenant | Tenant Key | Tenant ID | Type |
|--------|-----------|-----------|------|
| VITAL Expert Platform | vital-system | c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 | system |
| Digital Health | digital-health | 684f6c2c-b50d-4726-ad92-c76c3b785a89 | digital_health |
| Pharmaceuticals | pharma | c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b | pharmaceuticals |

### Subdomain Detection

The tenant is detected via subdomain in `middleware.ts`:
- `vital-system.localhost:3000` → VITAL Expert Platform
- `digital-health.localhost:3000` → Digital Health
- `pharma.localhost:3000` → Pharmaceuticals

### Data Access Control

All key data tables use an `allowed_tenants UUID[]` column for multi-tenant access:

```sql
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS allowed_tenants UUID[];
CREATE INDEX idx_table_allowed_tenants ON table_name USING GIN (allowed_tenants);
```

#### Tenant Access Matrix

| Table | VITAL | Digital Health | Pharma |
|-------|-------|----------------|--------|
| org_functions | ✅ | ❌ | ✅ |
| org_departments | ✅ | ❌ | ✅ |
| org_roles | ✅ | ❌ | ✅ |
| personas | ✅ | ❌ | ✅ |
| tools | ✅ | ✅ | ✅ |
| prompts | ✅ | ✅ | ✅ |
| agents | ✅ | ✅ | ✅ |
| knowledge_domains | ✅ | ✅ | ✅ |

### API Filtering

All CRUD APIs use Supabase `.contains()` for tenant filtering:

```typescript
query = query.contains('allowed_tenants', [profile.tenant_id]);
```

## RAG Infrastructure

### Database Tables

#### 1. knowledge_documents
Main document storage table:
- `id` - UUID primary key
- `title` - Document title
- `content` - Full document content
- `domain` / `domain_id` - Knowledge domain
- `status` - processing status (pending, processing, completed, failed)
- `allowed_tenants` - Tenant access control
- `chunk_count` - Number of chunks after processing

#### 2. document_chunks
Chunked content with vector embeddings:
- `document_id` - Reference to parent document
- `chunk_index` - Position in document
- `content` - Chunk text content
- `embedding` - vector(1536) for text-embedding-3-small
- `domain_id` - Inherited from parent document

#### 3. extracted_entities
LangExtract entity storage:
- `chunk_id` / `document_id` - References
- `entity_type` - Type of extracted entity
- `entity_text` - Extracted text
- `confidence` - Extraction confidence score
- `attributes` - Additional entity attributes

#### 4. knowledge_sources (View)
Compatibility view for documents API, maps to knowledge_documents.

### Vector Embeddings

- **Model**: text-embedding-3-small (1536 dimensions)
- **Index**: IVFFlat with 100 lists
- **Search**: Cosine similarity

Note: pgvector has a 2000 dimension limit for indexed vectors. text-embedding-3-large (3072d) cannot be used with indexes.

### Unified RAG Service

Location: `apps/vital-system/src/lib/services/rag/unified-rag-service.ts`

Features:
- Semantic search using vector similarity (Pinecone)
- Hybrid search combining vector and full-text search
- Agent-optimized search with relevance boosting
- Entity-aware search using LangExtract
- In-memory caching with LRU eviction
- Circuit breaker protection for external services

### Search Strategies

1. **semantic** - Pure vector similarity search
2. **hybrid** - Vector + full-text search
3. **keyword** - PostgreSQL full-text search
4. **agent-optimized** - Relevance boosting for specific agents
5. **entity-aware** - Uses extracted entities for enhanced retrieval

## Migration Files

### Multitenancy
- `20251118170000_subdomain_multitenancy.sql` - Core multitenancy setup
- `20251118171000_seed_tenant_feature_flags.sql` - Feature flags per tenant
- `complete_tenant_mapping.sql` - Adds allowed_tenants to all tables

### RAG Infrastructure
- `20251118200000_rag_infrastructure.sql` - Complete RAG tables and indexes

## API Endpoints

### Knowledge Domains
- `GET /api/knowledge-domains` - Fetch all domains with tenant filtering

### Knowledge Documents
- `GET /api/knowledge/documents` - Fetch documents (requires authentication)
- `GET /api/knowledge/analytics` - RAG analytics dashboard

### CRUD APIs (with tenant filtering)
- `/api/agents-crud`
- `/api/tools-crud`
- `/api/prompts-crud`
- `/api/personas`

## Environment Setup

### Local Development

Add to `/etc/hosts`:
```
127.0.0.1   vital-system.localhost
127.0.0.1   digital-health.localhost
127.0.0.1   pharma.localhost
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=vital-knowledge
```

## Data Counts (After Deduplication)

- Agents: 319
- Personas: 997
- Tools: 94
- Prompts: 1595
- Knowledge Domains: 34
- Org Functions: 42
- Org Departments: 294
- Org Roles: 1389

## Troubleshooting

### Empty Results
Check that:
1. `allowed_tenants` contains the current tenant's UUID
2. The tenant cookie is being set correctly
3. API is using `.contains()` not `.eq()` for tenant filtering

### RLS Errors
The service role key bypasses RLS. Client-side queries need RLS policies configured.

### Vector Index Errors
pgvector only supports up to 2000 dimensions for indexes. Use 1536d models (text-embedding-3-small).
