# Database Directory

**Purpose:** Centralized database assets for all databases  
**Standard:** [Multi-Database Organization Standard](../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)

---

## Structure

```
database/
├── postgres/           # PostgreSQL/Supabase assets
├── neo4j/              # Neo4j Graph Database assets
├── pinecone/           # Pinecone Vector Database assets
├── sync/               # Cross-database sync scripts
└── shared/             # Shared database utilities
```

---

## Databases

### PostgreSQL/Supabase
**Location:** `postgres/`  
**Purpose:** Primary relational database with RLS  
**Assets:** Migrations, seeds, policies, functions, triggers, views

### Neo4j
**Location:** `neo4j/`  
**Purpose:** Graph database for knowledge relationships  
**Assets:** Schemas, queries, migrations

### Pinecone
**Location:** `pinecone/`  
**Purpose:** Vector database for semantic search  
**Assets:** Index configurations, vector schemas

---

## Sync Scripts

**Location:** `sync/`  
**Purpose:** Cross-database synchronization

- `sync_to_neo4j.py` - Sync PostgreSQL data to Neo4j
- `sync_agents_to_pinecone.py` - Sync agents to Pinecone
- `sync_personas_to_pinecone.py` - Sync personas to Pinecone

---

## Supabase CLI Compatibility

**Note:** Supabase CLI expects migrations in `supabase/migrations/`

**Solution:** Use `database/shared/scripts/migrations/sync-migrations-to-supabase.sh` to sync `postgres/migrations/` → `supabase/migrations/` before running `supabase db push`

---

## Organization Standard

This structure follows the world-class multi-database organization standard:
- ✅ Single source of truth for all database assets
- ✅ Clear separation by database type
- ✅ Scalable for future databases
- ✅ Industry-standard pattern

---

**See Also:**
- [Multi-Database Organization Standard](../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)
- [Database Cleanup Complete](../docs/architecture/DATABASE_CLEANUP_COMPLETE.md)
