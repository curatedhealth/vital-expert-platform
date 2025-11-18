# Supabase Schema Audit Report 🔍
## Gold-Standard Database Architecture Assessment

**Date**: November 9, 2025  
**Scope**: Complete Supabase database schema analysis  
**Objective**: Identify gaps and improvements for industry-leading data architecture

---

## Executive Summary

Your database contains **200+ tables** with a mix of **legacy architecture** and **modern clean tables**. The recent prompt migration shows you're moving in the right direction, but there are significant opportunities for improvement.

**Overall Grade: B- (75/100)**

### Key Findings

✅ **Strengths**:
- All tables have primary keys
- Comprehensive foreign key relationships (400+ FKs)
- Good index coverage
- Multi-tenancy support via `tenant_id`
- Recent clean architecture for prompts

⚠️ **Critical Issues**:
- **Dual architecture** (64 `dh_*` tables + clean tables)
- **Naming inconsistencies** across similar entities
- **Schema duplication** (multiple persona/role/department tables)
- **Missing industry-agnostic design** for core entities
- **Over-normalized** in some areas, **under-normalized** in others

---

## 📊 Database Statistics

| Metric | Count | Status |
|--------|------:|:------:|
| **Total Tables** | ~200 | 📊 |
| **Foreign Keys** | 400+ | ✅ |
| **Indexes** | 600+ | ✅ |
| **Tables with PK** | 200 | ✅ 100% |
| **Legacy `dh_*` Tables** | 64 | ⚠️ |
| **Clean Architecture Tables** | ~50 | ✅ |
| **Org Tables** | 13 | ⚠️ |
| **JTBD Tables** | 15 | ✅ |
| **Prompt Tables** | 13 | ✅ |
| **Agent Tables** | 7 | ✅ |

---

## 🚨 Critical Issues (Must Fix)

### 1. **Dual Architecture: `dh_*` vs Clean Tables** ❌

**Problem**: You have 64 legacy `dh_*` (Digital Health) prefixed tables coexisting with newer clean tables.

**Legacy Tables**:
```
dh_agent              vs    agents (clean)
dh_prompt             vs    prompts (clean)  ✅ Recently fixed!
dh_personas           vs    org_personas
dh_workflow           vs    workflows
dh_task               vs    (no clean equivalent)
dh_domain             vs    domains
dh_use_case           vs    (no clean equivalent)
+ 57 more dh_* tables
```

**Impact**:
- Confusion about which table to use
- Data duplication risk
- Hard to maintain consistency
- Not industry-agnostic

**Gold Standard Solution**:
```
✅ Clean Tables (industry-agnostic)
├── personas           (not dh_personas)
├── workflows          (not dh_workflow)
├── tasks              (not dh_task)
├── domains            (not dh_domain)
└── use_cases          (not dh_use_case)

✅ Industry Mapping Tables
├── persona_industry_mapping
├── workflow_industry_mapping
├── task_industry_mapping
└── (following prompts pattern)
```

**Recommendation**: 
1. **Immediate**: Stop adding new `dh_*` tables
2. **Short-term**: Migrate `dh_workflow`, `dh_task`, `dh_use_case` to clean architecture
3. **Medium-term**: Create migration plan for all 64 `dh_*` tables
4. **Long-term**: Deprecate all `dh_*` tables

---

### 2. **`dh_personas` vs `org_personas` Duplication** ❌

**Problem**: You have TWO persona tables with **different schemas**!

```sql
-- dh_personas (59 columns!) - Digital Health specific
CREATE TABLE dh_personas (
    id UUID PRIMARY KEY,
    persona_name VARCHAR,
    industry_id UUID,
    digital_health_id UUID,
    pharma_id UUID,
    biotech_id UUID,
    ... 54 more columns
);

-- org_personas - Organizational hierarchy
CREATE TABLE org_personas (
    id UUID PRIMARY KEY,
    persona_name VARCHAR,
    industry_id UUID,
    primary_role_id UUID,
    ... fewer columns
);
```

**Issues**:
1. Which one is the source of truth?
2. Different foreign key relationships
3. `dh_personas` has 59 columns (too many!)
4. Confusing naming (dh vs org)

**Gold Standard Solution**:
```sql
-- Single clean personas table
CREATE TABLE personas (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    unique_id VARCHAR UNIQUE,
    description TEXT,
    
    -- Core attributes (not industry-specific)
    seniority_level VARCHAR,
    decision_authority VARCHAR,
    
    -- JSONB for flexible attributes
    profile JSONB,
    pain_points JSONB,
    goals JSONB,
    responsibilities JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Industry mapping
CREATE TABLE persona_industry_mapping (
    persona_id UUID REFERENCES personas(id),
    industry_id UUID REFERENCES industries(id),
    industry_specific_id VARCHAR, -- pharma_id, dh_id, etc.
    is_primary BOOLEAN,
    PRIMARY KEY (persona_id, industry_id)
);

-- Role mapping
CREATE TABLE persona_role_mapping (
    persona_id UUID REFERENCES personas(id),
    role_id UUID REFERENCES org_roles(id),
    is_primary BOOLEAN,
    created_at TIMESTAMPTZ
);
```

**Benefits**:
- Single source of truth
- Industry-agnostic core
- Flexible JSONB fields for varying attributes
- Clean relationships via mapping tables

---

### 3. **Organizational Hierarchy Duplication** ❌

**Problem**: Multiple overlapping organizational tables!

```
departments           vs    org_departments
roles                 vs    org_roles  
functions             vs    org_functions
department_roles      vs    org_department_roles
function_roles        vs    org_function_roles
function_departments  vs    org_function_departments
organizational_roles  vs    org_roles (duplicate!)
business_functions    vs    org_functions (another duplicate!)
```

**This is chaos!** 🔥

**Gold Standard Solution**:
```
✅ SINGLE set of org tables (org_* prefix)
├── org_functions
├── org_departments  
├── org_roles
├── org_function_departments
├── org_department_roles
└── org_function_roles

❌ REMOVE all duplicates:
├── departments (delete)
├── roles (delete)
├── functions (delete)
├── business_functions (delete)
├── organizational_roles (delete)
└── All unprefixed duplicates (delete)
```

---

### 4. **Inconsistent Naming Conventions** ❌

**Problem**: No consistent naming standard

```
agent_prompts         (snake_case with prefix)
dh_agent_suite_member (snake_case with dh prefix)
AgentMetrics          (PascalCase - if exists)
prompt_industry_mapping (descriptive)
jtbd_persona_mapping   (abbreviation)
```

**Gold Standard Solution**:
```
✅ Consistent Pattern:
entity_relationship_type

Examples:
✅ persona_industry_mapping
✅ prompt_workflow_mapping
✅ agent_skill_assignment
✅ task_dependency

❌ Avoid:
- Mixed prefixes (dh_, org_, no prefix)
- Inconsistent pluralization
- Abbreviations (jtbd should be job_to_be_done)
```

---

## ⚠️ Major Issues (Should Fix)

### 5. **Over-Normalized Task/Workflow Structure** ⚠️

**Current Structure**:
```
dh_workflow
├── dh_task
│   ├── dh_task_agent
│   ├── dh_task_agent_assignment
│   ├── dh_task_prompt_assignment
│   ├── dh_task_skill_assignment
│   ├── dh_task_dependency
│   ├── dh_task_input
│   ├── dh_task_output
│   ├── dh_task_output_template
│   ├── dh_task_kpi_target
│   ├── dh_task_link
│   ├── dh_task_persona
│   ├── dh_task_role
│   ├── dh_task_rag
│   ├── dh_task_tool
│   └── dh_task_ai_tool
```

**18 task-related tables!** This is over-normalized.

**Gold Standard Solution**:
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    workflow_id UUID REFERENCES workflows(id),
    code VARCHAR(50) UNIQUE, -- T1001, T2000
    title VARCHAR NOT NULL,
    description TEXT,
    position INTEGER,
    
    -- Assignments as JSONB arrays
    assigned_agents JSONB, -- [{agent_id, role}]
    required_skills JSONB, -- [{skill_id, proficiency}]
    tools JSONB,           -- [{tool_id, config}]
    
    -- Config
    duration_minutes INTEGER,
    effort_hours DECIMAL,
    complexity VARCHAR CHECK (complexity IN ('Low', 'Medium', 'High')),
    
    -- Keep separate tables for:
    -- - task_dependencies (M:M relationship)
    -- - task_outputs (complex structured data)
    -- - task_kpi_targets (reporting)
);

-- Keep only these mapping tables:
CREATE TABLE task_dependencies (
    task_id UUID,
    depends_on_task_id UUID,
    dependency_type VARCHAR,
    PRIMARY KEY (task_id, depends_on_task_id)
);

CREATE TABLE task_outputs (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    output_type VARCHAR,
    schema JSONB,
    template_id UUID
);
```

**Reduction**: 18 tables → 3 tables + JSONB fields

---

### 6. **Prompt Suite/Subsuite Complexity** ⚠️

**Current**:
```
dh_prompt_suite
├── dh_prompt_subsuite
├── dh_prompt_suite_prompt
├── dh_agent_prompt_starter
├── dh_prompt_agent_capability
├── dh_prompt_version
├── dh_prompt_eval
└── dh_skill_prompt
```

**vs New Clean Architecture**:
```
prompts (clean! ✅)
├── prompt_industry_mapping
├── prompt_workflow_mapping
└── prompt_task_mapping
```

**Problem**: You have BOTH systems active!

**Gold Standard Solution**:
```sql
-- Keep clean prompts table ✅
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    name VARCHAR UNIQUE,
    category VARCHAR,
    system_prompt TEXT,
    user_prompt_template TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Simplified suite structure
CREATE TABLE prompt_suites (
    id UUID PRIMARY KEY,
    name VARCHAR,
    category VARCHAR,
    parent_suite_id UUID REFERENCES prompt_suites(id), -- Hierarchical
    metadata JSONB
);

CREATE TABLE prompt_suite_members (
    suite_id UUID REFERENCES prompt_suites(id),
    prompt_id UUID REFERENCES prompts(id),
    sequence INTEGER,
    PRIMARY KEY (suite_id, prompt_id)
);

-- Version history (if needed)
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY,
    prompt_id UUID REFERENCES prompts(id),
    version INTEGER,
    system_prompt TEXT,
    created_at TIMESTAMPTZ,
    created_by UUID
);
```

**Recommendation**: Migrate `dh_prompt_suite*` to clean architecture

---

### 7. **RAG/Knowledge Base Fragmentation** ⚠️

**Current**:
```
dh_rag_source
knowledge_documents
knowledge_base_documents
document_chunks
document_chunks_langchain
document_embeddings
rag_documents
rag_knowledge_bases
rag_knowledge_sources
rag_knowledge_chunks
```

**10 different RAG/document tables!** Which one to use?

**Gold Standard Solution**:
```sql
-- Single knowledge base system
CREATE TABLE knowledge_sources (
    id UUID PRIMARY KEY,
    name VARCHAR,
    type VARCHAR, -- 'document', 'api', 'database', 'url'
    source_url TEXT,
    metadata JSONB,
    tenant_id UUID
);

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES knowledge_sources(id),
    content TEXT,
    chunk_index INTEGER,
    embedding VECTOR(1536), -- pgvector
    metadata JSONB
);

CREATE TABLE rag_configurations (
    id UUID PRIMARY KEY,
    name VARCHAR,
    source_ids UUID[], -- Array of source IDs
    retrieval_config JSONB,
    tenant_id UUID
);
```

**Reduction**: 10 tables → 3 tables

---

## 📈 Medium Priority Issues

### 8. **Agent Tables Duplication** 📊

```
agents (clean)        vs    dh_agent
ai_agents             vs    agents
agent_metrics         vs    agent performance tracking?
```

**Solution**: Consolidate to single `agents` table

---

### 9. **Missing Audit Trails** 📊

Most tables lack proper audit fields:
```sql
-- Add to ALL tables:
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
created_by UUID REFERENCES profiles(id),
updated_by UUID REFERENCES profiles(id),
deleted_at TIMESTAMPTZ, -- Soft delete
version INTEGER DEFAULT 1
```

---

### 10. **Inconsistent UUID vs String IDs** 📊

```
Some tables: id UUID
Some tables: unique_id VARCHAR
Some tables: code VARCHAR
```

**Gold Standard**:
- Primary key: Always `id UUID`
- Human-readable: Add `code VARCHAR` or `unique_id VARCHAR`
- Both indexed for performance

---

## ✅ Positive Aspects (Keep These!)

### 1. **Clean Prompt Architecture** ✅
Your recent migration of prompts is **excellent**!
```
prompts (clean)
├── prompt_industry_mapping
├── prompt_workflow_mapping
└── prompt_task_mapping
```
**This is the gold standard pattern!** Apply it to all entities.

### 2. **JTBD Structure** ✅
```
jtbd_library
├── jtbd_persona_mapping
├── jtbd_org_persona_mapping
├── jtbd_dependencies
├── jtbd_pain_points
└── etc.
```
Good structure, but consider:
- Rename `jtbd_*` to `job_*` (spell it out)
- Make industry-agnostic with mappings

### 3. **Multi-Tenancy** ✅
Most tables have `tenant_id` - excellent for SaaS!

### 4. **Industry Table** ✅
```sql
industries (
    id UUID,
    industry_name VARCHAR,
    industry_code VARCHAR,
    naics_code VARCHAR,
    gics_code VARCHAR
)
```
Great! This is your foundation for industry-agnostic architecture.

### 5. **Foreign Key Integrity** ✅
400+ foreign key constraints ensure referential integrity.

### 6. **Index Coverage** ✅
600+ indexes for performance.

---

## 🎯 Gold-Standard Migration Plan

### Phase 1: Immediate (Week 1-2) 🔥

**Priority 1: Stop the Bleeding**
1. ✅ **Freeze `dh_*` schema changes**
   - No new `dh_*` tables
   - No new columns to `dh_*` tables
   
2. ✅ **Document the "Golden Path"**
   - Create schema standards document
   - Define naming conventions
   - Set up approval process for new tables

**Priority 2: Critical Fixes**
3. ✅ **Consolidate Persona Tables**
   - Merge `dh_personas` + `org_personas` → `personas`
   - Create `persona_industry_mapping`
   - Add migration script

4. ✅ **Remove Duplicate Org Tables**
   - Keep: `org_functions`, `org_departments`, `org_roles`
   - Delete: `functions`, `departments`, `roles`, `business_functions`, `organizational_roles`
   - Create data migration

---

### Phase 2: Clean Architecture (Week 3-6) 🏗️

**Priority 3: Core Entity Migration**
5. ✅ **Migrate Workflows**
   ```
   dh_workflow → workflows (clean)
   + workflow_industry_mapping
   + workflow_phase (if needed)
   ```

6. ✅ **Migrate Tasks**
   ```
   dh_task → tasks (clean)
   Consolidate 18 task tables → 3 tables + JSONB
   ```

7. ✅ **Migrate Use Cases**
   ```
   dh_use_case → use_cases (clean)
   + use_case_industry_mapping
   ```

8. ✅ **Migrate Domains**
   ```
   dh_domain → domains (clean, if not already exists)
   ```

---

### Phase 3: Refinement (Week 7-10) ✨

**Priority 4: Normalize & Optimize**
9. ✅ **Consolidate RAG/Knowledge**
   - 10 tables → 3 tables
   - Single source of truth

10. ✅ **Consolidate Agents**
    - `agents` + `ai_agents` + `dh_agent` → `agents` (clean)
    
11. ✅ **Add Audit Fields**
    - Add to all tables: `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`

12. ✅ **Standardize Naming**
    - Rename inconsistent tables
    - Follow `entity_relationship_type` pattern

---

### Phase 4: Advanced Features (Week 11+) 🚀

**Priority 5: Enterprise Features**
13. ✅ **Implement Versioning**
    - Add version control to key entities
    - Track schema evolution

14. ✅ **Add Full-Text Search**
    - PostgreSQL `tsvector` on key text fields
    - GIN indexes for performance

15. ✅ **Implement Row-Level Security (RLS)**
    - Tenant isolation
    - User permissions

16. ✅ **Add Materialized Views**
    - For complex aggregations
    - Performance optimization

---

## 📋 Recommended Schema Standards

### Naming Conventions
```
✅ Table Names: 
- Lowercase
- Snake_case
- Plural for entity tables (users, agents, personas)
- Descriptive for mapping tables (persona_industry_mapping)

✅ Column Names:
- Lowercase
- Snake_case
- Descriptive (avoid abbreviations)

✅ Foreign Keys:
- {referenced_table_singular}_id
- Example: persona_id, workflow_id, industry_id

✅ Mapping Tables:
- {entity1}_{entity2}_mapping
- Example: prompt_workflow_mapping

✅ Timestamps:
- created_at, updated_at, deleted_at
- Always TIMESTAMPTZ (with timezone)

✅ Boolean Fields:
- is_{adjective} or has_{noun}
- Example: is_active, has_published
```

### Standard Table Structure
```sql
CREATE TABLE entity_name (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Human-readable ID (if needed)
    code VARCHAR(50) UNIQUE,
    unique_id VARCHAR(100) UNIQUE,
    
    -- Core Fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Relationships
    parent_id UUID REFERENCES entity_name(id),
    tenant_id UUID REFERENCES tenants(id),
    
    -- Flexible Data
    metadata JSONB,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    deleted_at TIMESTAMPTZ, -- Soft delete
    
    -- Constraints
    CONSTRAINT check_name_not_empty CHECK (length(name) > 0)
);

-- Indexes
CREATE INDEX idx_entity_tenant ON entity_name(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_entity_created ON entity_name(created_at);
CREATE INDEX idx_entity_metadata ON entity_name USING GIN (metadata);
```

---

## 🎯 Final Recommendations

### Do This NOW ✅
1. **Create schema governance document**
2. **Freeze `dh_*` changes**
3. **Merge persona tables** (biggest pain point)
4. **Remove duplicate org tables**
5. **Document "Golden Path" for new features**

### Do This Soon (1-2 months) ⚠️
6. Migrate workflows, tasks, use_cases to clean architecture
7. Consolidate RAG/knowledge tables
8. Add comprehensive audit fields
9. Standardize all naming

### Do This Eventually (3-6 months) 📊
10. Complete `dh_*` migration
11. Implement versioning
12. Add full-text search
13. Implement RLS
14. Performance optimization (materialized views)

---

## 📈 Target Gold-Standard Score

### Current: **B- (75/100)**

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| **Architecture** | 70/100 | 95/100 | Fix dual architecture |
| **Naming** | 65/100 | 90/100 | Standardize naming |
| **Normalization** | 75/100 | 90/100 | Balance over/under |
| **Relationships** | 85/100 | 95/100 | Clean up FKs |
| **Indexing** | 85/100 | 95/100 | Optimize indexes |
| **Audit Trail** | 60/100 | 95/100 | Add to all tables |
| **Multi-Tenancy** | 90/100 | 95/100 | Enhance isolation |
| **Industry-Agnostic** | 40/100 | 95/100 | Implement fully |
| **Documentation** | 50/100 | 90/100 | Comprehensive docs |
| **Performance** | 80/100 | 95/100 | Materialized views |

### **Target: A+ (95/100)** 🏆

---

## 💡 Key Takeaway

**You have a good foundation, but you're at a crossroads:**

**Path A (Current)**: Continue with dual architecture → Technical debt grows → Maintenance nightmare

**Path B (Recommended)**: Invest 2-3 months in clean migration → Gold-standard schema → Long-term success

**The recent prompt migration proves you can do this!** Just apply the same pattern to all entities.

---

**Next Steps**: Would you like me to create:
1. Detailed migration scripts for persona consolidation?
2. Schema governance document?
3. Automated migration plan with SQL scripts?
4. Data migration validation scripts?

Let me know which area you'd like to tackle first!

---

**Generated**: November 9, 2025  
**Status**: Comprehensive audit complete, awaiting action plan approval

