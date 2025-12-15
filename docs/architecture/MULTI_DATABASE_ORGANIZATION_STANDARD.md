# Multi-Database Organization Standard

**Version:** 1.0  
**Date:** December 14, 2025  
**Purpose:** World-class standard for organizing multiple databases (Supabase/PostgreSQL, Neo4j, Pinecone) in monorepo

---

## Executive Summary

**Recommendation:** ✅ **Single `/database/` folder with subdirectories by database type**

**Rationale:**
- Industry standard: Most world-class monorepos use single `/database/` or `/databases/` folder
- Clear organization: Subdirectories by database type
- Separation of concerns: Database assets vs. tooling configs
- Scalability: Easy to add new databases

---

## Current State

### Databases in Use

| Database | Type | Current Location | Purpose |
|----------|------|------------------|---------|
| **Supabase/PostgreSQL** | Relational | `/database/` + `/supabase/` | Primary database, RLS, migrations |
| **Neo4j** | Graph | Code only (no folder) | Knowledge graph, relationships |
| **Pinecone** | Vector | Code only (no folder) | Vector embeddings, semantic search |

### Current Structure Issues

1. **Supabase split:** Migrations in `/database/`, CLI config in `/supabase/`
2. **Neo4j:** No dedicated folder for schemas/queries
3. **Pinecone:** No dedicated folder for index configs

---

## World-Class Standard: Recommended Structure

### Option A: Single `/database/` with Subdirectories (✅ RECOMMENDED)

```
database/
├── postgres/                    # PostgreSQL/Supabase
│   ├── migrations/             # SQL migrations (292 files)
│   ├── seeds/                   # Seed data
│   ├── policies/                # RLS policies
│   ├── functions/               # Postgres functions
│   ├── triggers/                # Database triggers
│   ├── views/                   # Materialized views
│   ├── schemas/                 # Schema documentation (NEW)
│   │   ├── GOLD_STANDARD_SCHEMA_VISION.md
│   │   ├── GOLD_STANDARD_SCHEMA_ARD.md
│   │   ├── GOLD_STANDARD_COMPLETE.md
│   │   └── DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
│   └── queries/                 # SQL queries (NEW)
│       └── diagnostics/         # Diagnostic queries
│
├── neo4j/                       # Neo4j Graph Database
│   ├── schemas/                 # Cypher schema definitions
│   ├── queries/                 # Common Cypher queries
│   ├── migrations/              # Graph migrations (if versioned)
│   └── seeds/                   # Graph seed data
│
├── pinecone/                    # Pinecone Vector Database
│   ├── indexes/                 # Index configurations
│   ├── schemas/                 # Vector schema definitions
│   └── seeds/                   # Vector seed data
│
├── sync/                        # Cross-database sync scripts
│   ├── sync_to_neo4j.py
│   ├── sync_agents_to_pinecone.py
│   └── sync_personas_to_pinecone.py
│
└── shared/                      # Shared database utilities
    ├── scripts/
    └── templates/
```

**Keep Separate:**
```
supabase/                        # Supabase CLI tooling only
├── config.toml                  # Supabase CLI configuration
├── .branches/                   # Supabase branching feature
└── .temp/                       # Supabase temporary files
```

### Option B: `/databases/` (Plural) - Alternative

Same structure but with plural name. Less common but acceptable.

---

## Why This Structure?

### ✅ Advantages

1. **Single Source of Truth**
   - All database assets in one place
   - Easy to find and manage
   - Clear ownership

2. **Scalable**
   - Easy to add new databases (Redis, Elasticsearch, etc.)
   - Consistent pattern for all databases

3. **Clear Separation**
   - Database assets (`/database/`) vs. tooling configs (`/supabase/`)
   - Infrastructure code vs. application code

4. **Industry Standard**
   - Matches patterns from: Vercel, Shopify, Stripe monorepos
   - Follows Domain-Driven Design principles

5. **CI/CD Friendly**
   - Single location for database operations
   - Easy to script migrations across all databases

---

## Migration Plan

### Phase 1: Reorganize `/database/` Structure

```bash
# 1. Create new subdirectories
mkdir -p database/postgres database/neo4j database/pinecone database/shared

# 2. Move existing PostgreSQL assets
mv database/migrations database/postgres/migrations
mv database/seeds database/postgres/seeds
mv database/policies database/postgres/policies
mv database/functions database/postgres/functions
mv database/triggers database/postgres/triggers
mv database/views database/postgres/views

# 3. Keep sync scripts at database level (or move to shared/)
# database/sync/ already exists - keep it
```

### Phase 2: Create Neo4j Structure

```bash
# Create Neo4j directories
mkdir -p database/neo4j/{schemas,queries,migrations,seeds}

# Move/create Neo4j assets
# (Currently Neo4j schemas are in code - may need to extract)
```

### Phase 3: Create Pinecone Structure

```bash
# Create Pinecone directories
mkdir -p database/pinecone/{indexes,schemas,seeds}

# Document Pinecone index configurations
# (Currently in code - may need to extract)
```

### Phase 4: Update Scripts and Documentation

- Update all script references
- Update documentation
- Update CI/CD pipelines

---

## Comparison: Current vs. Recommended

| Aspect | Current | Recommended | Benefit |
|--------|---------|-------------|---------|
| **PostgreSQL** | `/database/` + `/supabase/` | `/database/postgres/` + `/supabase/` (configs) | Clear separation |
| **Neo4j** | Code only | `/database/neo4j/` | Organized schemas/queries |
| **Pinecone** | Code only | `/database/pinecone/` | Index configs documented |
| **Sync Scripts** | `/database/sync/` | `/database/sync/` | ✅ Already good |
| **Scalability** | Hard to add DBs | Easy to add | ✅ Better |

---

## Supabase CLI Compatibility

**Question:** Should `/supabase/` stay at root?

**Answer:** ✅ **YES** - Keep `/supabase/` for CLI tooling only

**Why:**
- Supabase CLI expects `supabase/config.toml` at root
- `.branches/` and `.temp/` are CLI-specific
- Separation: Database assets vs. tooling configs

**Structure:**
```
supabase/                        # Supabase CLI tooling
├── config.toml                  # CLI configuration
├── .branches/                   # Branching feature
└── .temp/                       # Temporary files

database/postgres/               # PostgreSQL database assets
├── migrations/                  # SQL migrations
└── [other assets]
```

**Sync Script:** Use `database/shared/scripts/migrations/sync-migrations-to-supabase.sh` to sync `database/postgres/migrations/` → `supabase/migrations/` when needed for CLI.

---

## Final Recommendation

### ✅ **RECOMMENDED: Single `/database/` with Subdirectories**

```
database/
├── postgres/        # PostgreSQL/Supabase assets
├── neo4j/           # Neo4j graph database assets
├── pinecone/        # Pinecone vector database assets
├── sync/            # Cross-database sync scripts
└── shared/          # Shared utilities

supabase/            # Supabase CLI tooling only (keep at root)
├── config.toml
├── .branches/
└── .temp/
```

**Benefits:**
- ✅ Single source of truth for all database assets
- ✅ Clear organization by database type
- ✅ Scalable for future databases
- ✅ Industry-standard pattern
- ✅ Maintains Supabase CLI compatibility

---

## Implementation Checklist

- [ ] Create `database/postgres/`, `database/neo4j/`, `database/pinecone/` subdirectories
- [ ] Move PostgreSQL assets to `database/postgres/`
- [ ] Create Neo4j structure and document schemas
- [ ] Create Pinecone structure and document indexes
- [ ] Update all script references
- [ ] Update documentation
- [ ] Update CI/CD pipelines
- [ ] Keep `/supabase/` for CLI tooling only

---

## References

- **Industry Examples:** Vercel, Shopify, Stripe monorepos use similar patterns
- **Best Practices:** Domain-Driven Design, Monorepo organization standards
- **Current Architecture:** [`VITAL_WORLD_CLASS_STRUCTURE_FINAL.md`](./VITAL_WORLD_CLASS_STRUCTURE_FINAL.md)

---

**Status:** ✅ Recommended Standard  
**Next Step:** Execute migration plan
