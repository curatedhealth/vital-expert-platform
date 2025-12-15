# PostgreSQL/Supabase Database Assets

**Purpose:** All PostgreSQL and Supabase database assets  
**Source of Truth:** This directory contains all migrations, seeds, policies, and functions

---

## Structure

```
postgres/
├── migrations/          # SQL migrations (292 files)
├── seeds/              # Seed data
├── policies/           # RLS policies
├── functions/          # Postgres functions
├── triggers/           # Database triggers
├── views/              # Materialized views
├── queries/            # Common queries
├── sql/                # SQL utilities
├── templates/          # Database templates
└── data/               # Data files
```

---

## Migrations

**Location:** `postgres/migrations/`  
**Total Files:** 292 SQL migrations  
**Usage:** Apply via `supabase db push` or direct SQL execution

**Sync Script:** Use `database/shared/scripts/migrations/sync-migrations-to-supabase.sh` to sync to `supabase/migrations/` for Supabase CLI compatibility.

---

## Seeds

**Location:** `postgres/seeds/`  
**Purpose:** Seed data for development and testing

---

## Policies

**Location:** `postgres/policies/`  
**Purpose:** Row Level Security (RLS) policies for multi-tenant isolation

---

**See Also:**
- [Multi-Database Organization Standard](../../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)
- [Database Cleanup Complete](../../docs/architecture/DATABASE_CLEANUP_COMPLETE.md)
