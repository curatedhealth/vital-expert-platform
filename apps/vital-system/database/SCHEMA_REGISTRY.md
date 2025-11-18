# VITAL Database Schema Registry

**Last Updated:** 2025-11-18
**Database:** bomltkhixeatxuoxmolq.supabase.co
**Version:** 1.2.0
**Status:** Operational (Multi-tenant isolation PENDING)

---

## Table Name Reference

This is the **SINGLE SOURCE OF TRUTH** for all table names. Update this document when renaming tables.

### Core Platform Tables

| Logical Entity | Actual Table Name | Migration | Status | Notes |
|---------------|-------------------|-----------|---------|-------|
| Tools | `tools` | 001_initial | ✅ Active | 564 rows |
| Personas | `personas` | 001_initial | ✅ Active | 2,991 rows |
| Prompts | `prompts` | 001_initial | ✅ Active | 1,595 rows |
| Agents | `agents` | 001_initial | ✅ Active | 957 rows |
| Tool Categories | **REMOVED** | - | ❌ Deprecated | Now `tools.category` column |

### Organizational Structure Tables

| Logical Entity | Actual Table Name | Migration | Status | Notes |
|---------------|-------------------|-----------|---------|-------|
| Business Functions | `suite_functions` | 001_initial | ✅ Active | - |
| Departments | `org_departments` | 001_initial | ✅ Active | - |
| Organizational Roles | `organizational_levels` | 001_initial | ✅ Active | - |

### Knowledge Management Tables

| Logical Entity | Actual Table Name | Migration | Status | Notes |
|---------------|-------------------|-----------|---------|-------|
| Knowledge Documents | `knowledge_sources` | 004_knowledge | ✅ Active | 0 rows (empty) |
| Knowledge Domains | `knowledge_domains` | 004_knowledge | ✅ Active | - |
| Knowledge Base | `knowledge_base` | 004_knowledge | ✅ Active | - |
| Knowledge Chunks | `knowledge_chunks` | 004_knowledge | ✅ Active | - |

### Chat/Conversation Tables

| Logical Entity | Actual Table Name | Migration | Status | Notes |
|---------------|-------------------|-----------|---------|-------|
| Chat Sessions | `chat_sessions` | 006_chat | ✅ Active | - |
| Chat Messages | `chat_messages` | 006_chat | ✅ Active | - |

### Multi-Tenant Tables (RLS Required)

| Table | tenant_id Column | RLS Enabled | Migration | Status |
|-------|------------------|-------------|-----------|---------|
| `tenants` | - (root table) | ❌ PENDING | 002_rls | 🔶 Required |
| `users` | ✅ YES | ❌ PENDING | 002_rls | 🔶 Required |
| `agents` | ✅ YES (nullable for global agents) | ❌ PENDING | 002_rls | 🔶 Required |
| `tools` | ✅ YES | ❌ PENDING | 002_rls | 🔶 Required |
| `personas` | ✅ YES | ❌ PENDING | 002_rls | 🔶 Required |
| `prompts` | ✅ YES | ❌ PENDING | 002_rls | 🔶 Required |
| `conversations` | ✅ YES | ❌ PENDING | 002_rls | 🔶 Required |
| `messages` | - (via conversation) | ❌ PENDING | 002_rls | 🔶 Required |

---

## Schema Validation Rules

### Rule 1: Table Renames Require Cross-Team Approval

**Process:**
1. Create proposal in this document
2. Search codebase for all references: `grep -r "from('old_table_name')" src/`
3. Update all API endpoints
4. Update all TypeScript types
5. Create migration script
6. Update this registry
7. Deploy atomically (migration + code)

**Example:**
```markdown
### Proposed Rename: departments → org_departments

**Reason:** Clarity and namespace collision avoidance
**Impact Analysis:**
- 3 API endpoints affected
- 2 TypeScript interfaces affected
**Approval:** Product Lead, Data Strategist, Backend Lead
**Date:** 2025-01-15
**Status:** APPROVED
```

### Rule 2: All APIs Must Reference This Registry

**Enforcement:**
- Pre-commit hook validates table names against registry
- CI/CD pipeline runs schema validation tests
- Weekly automated audit of API → schema alignment

### Rule 3: Breaking Changes Require Deprecation Period

**Process:**
1. Mark old table/column as DEPRECATED (add comment)
2. Add deprecation warning to API responses
3. Maintain compatibility for 1 release cycle (minimum 2 weeks)
4. Remove old table/column
5. Update registry

---

## Column Schema Reference

### tools Table

```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- Added in 001_simple_schema_fixes_v2
  is_active BOOLEAN DEFAULT TRUE, -- Added in 001_simple_schema_fixes_v2
  tool_type TEXT, -- Added in 001_simple_schema_fixes_v2
  input_schema JSONB,
  output_schema JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_tools_category` ON category
- `idx_tools_tenant_category` ON (tenant_id, category)
- `idx_tools_is_active` ON is_active WHERE is_active = TRUE

### knowledge_sources Table (EMPTY - Needs Population)

```sql
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  domain TEXT,
  status TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** This table exists but has 0 rows. Needs seed data or user uploads.

---

## API Endpoint → Table Mapping

### ✅ FIXED (2025-11-18)

| API Endpoint | Table(s) Used | Status | Notes |
|-------------|---------------|---------|-------|
| `/api/tools-crud` | `tools` | ✅ Fixed | Removed `tool_categories` JOIN |
| `/api/knowledge/documents` | `knowledge_sources` | ✅ Fixed | Was using `knowledge_documents` |
| `/api/business-functions` | `suite_functions` | ✅ Fixed | Was using `business_functions` |
| `/api/organizational-structure` | `suite_functions`, `org_departments`, `organizational_levels` | ✅ Fixed | Multiple table renames |
| `/api/personas` | `personas` | ✅ OK | No changes needed |
| `/api/prompts-crud` | `prompts` | ✅ OK | No changes needed |
| `/api/agents-crud` | `agents` | ✅ OK | No changes needed |
| `/api/ask-expert` | `chat_messages`, `agents` | ✅ OK | No changes needed (table exists) |

---

## Migration Execution Log

| Migration | Executed | Date | By | Status | Notes |
|-----------|----------|------|-----|---------|-------|
| 001_initial_schema.sql | ✅ YES | 2025-01-27 | System | Complete | Core tables created |
| 001_simple_schema_fixes_v2.sql | ✅ YES | 2025-11-18 | Admin | Complete | Added tools columns |
| 002_row_level_security.sql | ❌ NO | - | - | **PENDING** | **CRITICAL** |
| 003_seed_data.sql | ❌ NO | - | - | Pending | Test data |
| 004_knowledge_base_schema.sql | ✅ YES | ? | System | Complete | Knowledge tables exist |
| 006_chat_management_schema.sql | ✅ YES | ? | System | Complete | Chat tables exist |

---

## Change Log

### 2025-11-18: Schema-API Alignment Recovery

**Changes:**
- Fixed `/api/tools-crud` to use `category` column instead of JOIN
- Fixed `/api/knowledge/documents` to use `knowledge_sources` table
- Fixed `/api/business-functions` to use `suite_functions` table
- Fixed `/api/organizational-structure` to use renamed tables

**Lesson Learned:** Need automated schema validation in CI/CD

### Future Improvements Needed

1. **Schema Versioning**: Implement Flyway or Liquibase for migration tracking
2. **TypeScript Code Generation**: Generate types from database schema automatically
3. **API Contract Testing**: Automated tests that validate API queries against actual schema
4. **Schema Change Notifications**: Slack/Email alerts when migrations are executed
5. **Rollback Procedures**: Automated rollback scripts for each migration

---

## Emergency Contacts

**Data Strategy Issues:** VITAL Data Strategist Agent
**Schema Changes:** Database Architect Agent
**Migration Execution:** DevOps Team
**HIPAA Compliance:** Security & Compliance Team
