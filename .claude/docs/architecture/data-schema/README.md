# VITAL Database Schema - Gold Standard

**Version**: 1.0.0
**Last Updated**: November 23, 2025
**Status**: Active
**Purpose**: Single source of truth for all database tables, relationships, and constraints
**Production Status**: ✅ Production (31,342 lines of SQL migrations)

---

## Quick Reference

| Resource | Location |
|----------|----------|
| **📖 Gold Standard Schema** | `GOLD_STANDARD_SCHEMA.md` ⭐ **START HERE** |
| **🔄 Migrations** | `06-migrations/` |
| **📊 ER Diagrams** | `diagrams/` |
| **📝 Table Specifications** | Individual `.md` files per domain |

---

## Overview

The VITAL database contains **85+ tables** organized into **12 domains**:

```
VITAL Database (PostgreSQL + Supabase)
│
├── 🔐 Core (auth, tenants, profiles)          8 tables
├── 👥 Organization (roles, teams, hierarchy)   12 tables
├── 🤖 Agents (136+ expert agents)             15 tables
├── 👤 Personas (user personas, VPANES)        24 tables
├── 🎯 JTBDs (jobs-to-be-done, ODI framework)  20 tables
├── 📚 Knowledge (RAG, documents, chunks)      10 tables  
├── 💬 Services (Ask Expert, Panel, Committee)  8 tables
├── 🔄 Workflows (LangGraph, orchestration)     6 tables
├── 📊 Analytics (metrics, events, feedback)    5 tables
├── 🏷️ Taxonomy (domains, capabilities, skills) 8 tables
├── 🔍 Search (vector search, graph)            4 tables
└── 📋 Templates (panel archetypes, prompts)    5 tables
```

---

## Key Tables

### Multi-Tenancy (Subdomain-Based)

```sql
-- Core tenant model
tenants (
  id, name, subdomain,
  tier: 'free'|'pro'|'enterprise',
  settings JSONB
)

-- Row-Level Security (RLS)
-- Every table has tenant_id with RLS policies
```

**Example**:
- `acme.vitalexpert.ai` → tenant_id = uuid1
- `pharmaco.vitalexpert.ai` → tenant_id = uuid2

### Agents (136+ Experts)

```sql
agents (
  id, name, slug, domain, subdomain,
  description, capabilities[],
  persona_id, jtbd_id[], system_prompt,
  status: 'active'|'draft'|'archived'
)

-- 21 fully profiled agents seeded
-- Framework supports 136+ total
```

### Ask Expert

```sql
ask_expert_sessions (
  id, user_id, tenant_id,
  mode: 1|2|3|4,
  selected_agent_id, query, status
)

ask_expert_messages (
  id, session_id, role: 'user'|'assistant',
  content, metadata JSONB -- citations, confidence
)
```

### Personas (Evidence-Based)

```sql
personas (
  id, name, role_title,
  vpanes_scores JSONB  -- Visibility, Pain, Actions, Needs, Emotions, Scenarios
)

persona_typical_day_activities (6-13 per persona)
persona_evidence_sources (5-10 per persona)
persona_motivations, persona_values, persona_frustrations...
-- 24 junction tables total
```

### JTBDs (Outcome-Driven Innovation)

```sql
jtbds (
  id, job_executor (persona_id),
  job_statement: "When [situation], I want to [motivation], so I can [outcome]"
)

jtbd_desired_outcomes (5-12 per JTBD)
  → importance_score (1-10)
  → satisfaction_score (1-10)
  → opportunity_score = importance + max(importance - satisfaction, 0)

jtbd_gen_ai_opportunities
jtbd_gen_ai_use_cases (3-5 per opportunity)
-- 20+ junction tables total
```

### Knowledge (RAG)

```sql
rag_documents (
  id, tenant_id, title, content,
  metadata JSONB, embedding vector(1536)
)

rag_knowledge_chunks (
  document_id, chunk_text,
  embedding vector(1536), chunk_index
)

-- Vector search via Pinecone (external)
-- Graph data via Neo4j (external)
```

---

## Migrations

**Location**: `06-migrations/`

**Key Migrations**:
- `20251117000000_add_comprehensive_persona_jtbd_tables.sql` - 31,342 lines
- `20251119000000_update_personas_from_roles.sql` - Persona migration
- `20251119000001_add_digital_health_to_org_structure.sql` - Org structure

**Migration Strategy**:
- Sequential migrations (timestamp-based)
- Idempotent (can run multiple times safely)
- Rollback scripts for each migration

---

## Schema Principles

### 1. Multi-Tenancy Everywhere
Every table (except auth) has `tenant_id` with RLS policies:
```sql
CREATE POLICY tenant_isolation ON table_name
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

### 2. JSONB for Flexibility
Use JSONB for:
- Settings/config (flexible schemas)
- Metadata (agent capabilities, citations)
- Scores/metrics (VPANES, opportunity scores)

### 3. Audit Trails
Standard fields on all tables:
```sql
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
created_by UUID REFERENCES profiles(id)
```

### 4. Soft Deletes
Critical tables use `deleted_at` instead of DELETE:
```sql
deleted_at TIMESTAMP NULL
```

---

## Development Workflow

### Adding a New Table

1. **Design**: Document in `new-table-spec.md`
2. **Create Migration**: 
   ```bash
   supabase migration new add_table_name
   ```
3. **Write SQL**:
   ```sql
   CREATE TABLE table_name (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     tenant_id UUID REFERENCES tenants(id) NOT NULL,
     -- columns...
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- RLS Policy
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   CREATE POLICY tenant_isolation ON table_name
     USING (tenant_id = auth.jwt() ->> 'tenant_id');
   
   -- Indexes
   CREATE INDEX idx_table_tenant ON table_name(tenant_id);
   ```
4. **Test Locally**:
   ```bash
   supabase db reset  # Reset to clean state
   supabase db push   # Apply migrations
   ```
5. **Update Schema Docs**: Add to `GOLD_STANDARD_SCHEMA.md`

### Modifying Existing Table

1. **Create Alter Migration**:
   ```bash
   supabase migration new alter_table_name_add_column
   ```
2. **Write ALTER SQL**:
   ```sql
   ALTER TABLE table_name ADD COLUMN new_column TEXT;
   ```
3. **Update Docs**: Update `GOLD_STANDARD_SCHEMA.md`

---

## Performance Optimization

### Indexes

**Already Indexed**:
- All `tenant_id` columns (RLS performance)
- All foreign keys
- Common query columns (`status`, `created_at`)

**Index Strategy**:
- B-tree for equality/range queries
- GIN for JSONB queries
- GiST for vector similarity (if using pgvector)

### Query Optimization

**Best Practices**:
- Always filter by `tenant_id` first (RLS + index)
- Use `EXPLAIN ANALYZE` to check query plans
- Limit result sets (pagination)
- Use indexes for ORDER BY columns

**Example**:
```sql
-- Good: Uses tenant_id index
SELECT * FROM agents
WHERE tenant_id = 'uuid'
  AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- Bad: Full table scan
SELECT * FROM agents
WHERE status = 'active';  -- Missing tenant_id filter!
```

---

## Validation & Compliance

### Schema Validators

**Location**: `07-TOOLING/validators/validate-schema.sh`

**Checks**:
- ✅ All tables have `tenant_id` (except auth)
- ✅ All tables have RLS enabled
- ✅ All foreign keys have indexes
- ✅ All tables have `created_at`
- ✅ Migrations are sequential (no gaps in timestamps)

**Run Validation**:
```bash
./07-TOOLING/validators/validate-schema.sh
```

---

## Backup & Recovery

**Automated Backups** (Supabase):
- Point-in-time recovery (PITR) - 7 days
- Daily snapshots - retained 30 days
- Manual snapshots - retained 90 days

**Manual Backup**:
```bash
pg_dump -h db.xxx.supabase.co -U postgres vital_db > backup.sql
```

**Restore**:
```bash
psql -h db.xxx.supabase.co -U postgres vital_db < backup.sql
```

---

## Related Documentation

- **PRD**: `00-STRATEGIC/prd/` - What we're building (requirements)
- **ARD**: `00-STRATEGIC/ard/` - How we're building it (architecture)
- **API Docs**: `04-TECHNICAL/api/` - How to access data
- **Services**: `03-SERVICES/` - How services use the schema

---

**Maintained By**: Data Architecture Expert, SQL/Supabase Specialist
**Questions?**: See [CATALOGUE.md](../../CATALOGUE.md) or ask Data Architecture Expert
