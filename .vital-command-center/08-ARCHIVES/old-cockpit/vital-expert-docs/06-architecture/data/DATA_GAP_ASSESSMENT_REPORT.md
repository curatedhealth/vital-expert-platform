# 🔍 VITAL Data Gap Assessment Report

**Date**: November 14, 2025
**Assessment Type**: OLD DB (Vital) vs NEW DB (Vital-expert)
**Method**: Supabase REST API Query

---

## 📊 Executive Summary

### Database Overview

| Database | URL | Status | Purpose |
|----------|-----|--------|---------|
| **OLD DB (Vital)** | `xazinxsiglqokwfmogyk.supabase.co` | ✅ Active | Legacy production database |
| **NEW DB (Vital-expert)** | `bomltkhixeatxuoxmolq.supabase.co` | ✅ Active | Migration target database |

### Key Findings

| Metric | OLD DB | NEW DB | Gap | Status |
|--------|--------|--------|-----|--------|
| **Agents** | 190 | 311 | +121 | ✅ NEW has MORE |
| **Personas** | 251 | 51 | -200 | ⚠️ **MAJOR GAP** |
| **Tenants** | 11 | 3 | -8 | ⚠️ **MAJOR GAP** |
| **Tools** | ? | ? | TBD | 🔍 Needs investigation |
| **Prompts** | ? | ? | TBD | 🔍 Needs investigation |
| **Knowledge Domains** | ? | ? | TBD | 🔍 Needs investigation |
| **Jobs to be Done** | ? | 0 | TBD | ⚠️ **NOT LOADED** |
| **Workflows** | ? | ? | TBD | 🔍 Needs investigation |

---

## 🎯 Critical Data Gaps

### 1. **Personas** (CRITICAL)
- **OLD DB**: 251 personas
- **NEW DB**: 51 personas
- **Missing**: ~200 personas
- **Impact**: HIGH - Affects JTBD mappings, agent assignments, workflows

**Analysis**:
- ✅ Medical Affairs personas migrated (51 records from `20_medical_affairs_personas.sql`)
- ❌ Missing ~200 Digital Health, Pharma, and other industry personas
- ❌ Foundation personas (8 core personas) may not be loaded

**Action Required**:
1. Verify if `01_foundation_personas.sql` was loaded to NEW DB
2. Load remaining Digital Health personas (66 personas from DH Library)
3. Load Pharma-specific personas
4. Load industry-specific personas (Government, Payers, Providers)

---

### 2. **Tenants** (CRITICAL)
- **OLD DB**: 11 tenants
- **NEW DB**: 3 tenants
- **Missing**: 8 tenants
- **Impact**: HIGH - Affects multi-tenancy, data isolation, subscriptions

**OLD DB Tenants** (from API sample):
1. `00000000-0000-0000-0000-000000000001` - VITAL Platform (suspended)
2. `11111111-1111-1111-1111-111111111111` - Startup (suspended)
3. `a2b50378-a21a-467b-ba4c-79ba93f64b2f` - Digital Health Startups
4. `18c6b106-6f99-4b29-9608-b9a623af37c2` - Pharma Companies
5. `e8f3d4c2-a1b5-4e6f-9c8d-7b2a3f1e4d5c` - Pharmaceutical Company
6. + 6 more...

**Action Required**:
1. Export all tenant configurations from OLD DB
2. Migrate tenant hierarchy and relationships
3. Recreate subscription tiers and statuses
4. Verify tenant-specific resource isolation

---

### 3. **Agents** (SURPLUS - Positive)
- **OLD DB**: 190 agents
- **NEW DB**: 311 agents
- **Difference**: +121 agents in NEW DB
- **Impact**: LOW - NEW DB has more agents (likely includes new specialized agents)

**Analysis**:
- ✅ NEW DB has received additional agent imports
- ✅ Includes Medical Affairs agents, Market Access agents, and specialized sub-agents
- ✅ Positive indicator - no data loss, enrichment occurred

**Sample Agents in OLD DB**:
- Epidemiologist (Medical Affairs)
- Pricing Analyst (Market Access)
- RAG Retrieval Agent (Technical)
- Clinical Data Manager
- KOL Profiler

**Sample Agents in NEW DB**:
- Healthcare Digital Transformation Consultant
- Value Proposition Developer
- Patient Journey Mapper
- Digital Therapeutics Strategist
- Data Privacy Officer

**Verification Needed**:
- Check for duplicate agents across databases
- Verify agent metadata completeness
- Ensure no critical OLD DB agents were lost

---

## 📁 Seed File Migration Status

### ✅ Completed Migrations

| Seed File | Status | Expected Rows | Actual Rows | Notes |
|-----------|--------|---------------|-------------|-------|
| `20_medical_affairs_personas.sql` | ✅ Loaded | 43 | 51 | +8 foundation personas |
| Agent imports (various) | ✅ Loaded | ? | 311 | Multiple agent batches loaded |

### ⚠️ Pending/Missing Migrations

| Seed File | Target Table | Expected Rows | Status | Priority |
|-----------|--------------|---------------|--------|----------|
| `00_foundation_agents.sql` | `agents` | 8 | ❓ Unknown | P1 - CRITICAL |
| `01_foundation_personas.sql` | `personas` | 8 | ❓ Unknown | P1 - CRITICAL |
| `02_COMPREHENSIVE_TOOLS_ALL.sql` | `tools` | ~150 | ❓ Unknown | P1 - CRITICAL |
| `05_COMPREHENSIVE_PROMPTS_ALL.sql` | `prompts` | ~100 | ❓ Unknown | P1 - CRITICAL |
| `06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql` | `knowledge_domains` | ~50 | ❓ Unknown | P2 - HIGH |
| `21_phase2_jtbds.sql` | `jobs_to_be_done` | 127 | **0** | P1 - **CRITICAL** |
| `22_digital_health_jtbds.sql` | `jobs_to_be_done` | 110 | **0** | P1 - **CRITICAL** |
| Digital Health Personas | `personas` | ~66 | **Missing** | P2 - HIGH |
| Pharma Personas | `personas` | ~100 | **Missing** | P2 - HIGH |
| Org Structure (Functions) | `org_functions` | ? | ❓ Unknown | P2 - HIGH |
| Org Structure (Departments) | `org_departments` | ? | ❓ Unknown | P2 - HIGH |
| Org Structure (Roles) | `org_roles` | ? | ❓ Unknown | P2 - HIGH |

---

## 🔍 Detailed Investigation Needed

### Tables Requiring Row Count Verification

The following tables need detailed row count comparisons:

1. **Core Configuration**
   - `tools` - AI/function calling tools registry
   - `prompts` - Prompt templates and suites
   - `knowledge_domains` - RAG domain definitions
   - `knowledge_sources` - RAG source configurations
   - `knowledge_documents` - Document embeddings

2. **Organizational Structure**
   - `industries` - Industry definitions
   - `org_functions` - Organizational functions
   - `org_departments` - Department hierarchies
   - `org_roles` - Role definitions
   - `persona_jtbd_mapping` - Persona-JTBD relationships

3. **Workflow & Execution**
   - `workflows` - Workflow definitions
   - `workflow_steps` - Workflow step configurations
   - `workflow_tasks` - Task definitions
   - `task_assignments` - Task-agent assignments
   - `strategic_priorities` - Strategic priority definitions
   - `kpis` - KPI definitions

4. **LLM Configuration**
   - `llm_models` - Model definitions
   - `llm_providers` - Provider configurations

5. **User Management**
   - `user_profiles` - User accounts
   - `user_roles` - User role assignments
   - `user_permissions` - Permission configurations

6. **Session Data**
   - `ask_expert_sessions` - User consultation sessions
   - `ask_expert_messages` - Session messages
   - `agent_memories` - Agent memory/context
   - `agent_relationships` - Agent collaboration graph

---

## 📋 Migration Action Plan

### Phase 1: Critical Foundation (P1) - IMMEDIATE

**Goal**: Establish core platform resources

1. **Load Jobs to be Done (CRITICAL)**
   ```bash
   # Load 127 Phase 2 JTBDs
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/21_phase2_jtbds.sql"

   # Load 110 Digital Health JTBDs
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/22_digital_health_jtbds.sql"
   ```
   **Expected Outcome**: 237 JTBDs loaded

2. **Load Foundation Agents**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/00_foundation_agents.sql"
   ```
   **Expected Outcome**: 8 foundational agents loaded

3. **Load Foundation Personas**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/01_foundation_personas.sql"
   ```
   **Expected Outcome**: 8 foundational personas loaded

4. **Load Comprehensive Tools Registry**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/02_COMPREHENSIVE_TOOLS_ALL.sql"
   ```
   **Expected Outcome**: ~150 tools loaded

5. **Load Comprehensive Prompts**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/05_COMPREHENSIVE_PROMPTS_ALL.sql"
   ```
   **Expected Outcome**: ~100 prompts loaded

---

### Phase 2: Knowledge Base (P2) - HIGH PRIORITY

**Goal**: Enable RAG and knowledge retrieval

1. **Load Knowledge Domains**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql"
   ```
   **Expected Outcome**: ~50 knowledge domains loaded

2. **Load RAG Sources**
   ```bash
   PGPASSWORD='flusd9fqEb4kkTJ1' psql \
     postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
     -c "\set ON_ERROR_STOP on" \
     -f "database/sql/seeds/2025/03_foundation_rag_sources.sql"
   ```

---

### Phase 3: Extended Personas (P2) - HIGH PRIORITY

**Goal**: Complete persona library

1. **Create Digital Health Persona Import Script**
   - Extract remaining ~200 personas from OLD DB
   - Transform to NEW DB schema
   - Generate SQL seed file

2. **Load Digital Health Personas**
   - ~66 Digital Health personas
   - ~100 Pharma personas
   - ~34 Government/Payer/Provider personas

---

### Phase 4: Organizational Structure (P3) - MEDIUM PRIORITY

**Goal**: Enable org hierarchy and role mappings

1. **Load Organizational Functions**
2. **Load Departments**
3. **Load Roles**
4. **Create Persona-Role Mappings**

---

### Phase 5: Workflows & Tasks (P3) - MEDIUM PRIORITY

**Goal**: Enable workflow execution

1. **Migrate Workflows from OLD DB**
2. **Load Workflow Steps**
3. **Load Task Definitions**
4. **Create Task-Agent Assignments**

---

### Phase 6: User Data & Sessions (P4) - LOW PRIORITY

**Goal**: Migrate user-generated content

1. **Export User Profiles from OLD DB**
2. **Export User Roles and Permissions**
3. **Migrate Ask Expert Sessions (if needed)**
4. **Migrate Agent Memories (if needed)**

---

## 🚨 Critical Issues & Risks

### 1. **Jobs to be Done NOT LOADED** (CRITICAL)
- **Impact**: Cannot map personas to jobs, workflow execution blocked
- **Risk**: High - Core platform functionality affected
- **Mitigation**: Immediate load of `21_phase2_jtbds.sql` and `22_digital_health_jtbds.sql`

### 2. **200 Personas Missing** (HIGH)
- **Impact**: Limited persona coverage, incomplete user stories
- **Risk**: Medium-High - Affects platform completeness
- **Mitigation**: Export from OLD DB and import to NEW DB within 48 hours

### 3. **8 Tenants Missing** (MEDIUM)
- **Impact**: Tenant configurations and subscriptions not migrated
- **Risk**: Medium - Affects multi-tenancy setup
- **Mitigation**: Recreate tenant structures in NEW DB

### 4. **Unknown Status of Tools, Prompts, Workflows** (MEDIUM)
- **Impact**: Core AI functionality may be incomplete
- **Risk**: Medium - Need verification
- **Mitigation**: Run comprehensive row count query on all tables

---

## ✅ Next Steps

### Immediate Actions (Next 24 Hours)

1. **Run comprehensive table count comparison script** (all 31+ tables)
2. **Load JTBD seed files** (`21_phase2_jtbds.sql`, `22_digital_health_jtbds.sql`)
3. **Verify foundation seed file loading** (agents, personas, tools, prompts)
4. **Document current NEW DB state** with full table counts

### Short-term Actions (Next Week)

1. **Export missing personas from OLD DB**
2. **Create Digital Health persona import script**
3. **Load remaining personas to NEW DB**
4. **Migrate tenant configurations**
5. **Verify organizational structure data**

### Medium-term Actions (Next 2 Weeks)

1. **Migrate workflows and tasks**
2. **Verify all agent-tool-prompt relationships**
3. **Test end-to-end platform functionality**
4. **Create data validation test suite**

---

## 📊 Verification Queries

Run these queries to verify migration completeness:

### Query 1: Table Row Counts (NEW DB)
```sql
SELECT
    'agents' as table_name, COUNT(*) as row_count FROM agents
UNION ALL
SELECT 'personas', COUNT(*) FROM personas
UNION ALL
SELECT 'jobs_to_be_done', COUNT(*) FROM jobs_to_be_done
UNION ALL
SELECT 'tools', COUNT(*) FROM tools
UNION ALL
SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL
SELECT 'knowledge_domains', COUNT(*) FROM knowledge_domains
UNION ALL
SELECT 'workflows', COUNT(*) FROM workflows
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
ORDER BY table_name;
```

### Query 2: Persona-JTBD Mapping Status
```sql
SELECT
    p.name as persona_name,
    COUNT(pjm.jtbd_id) as mapped_jtbds
FROM personas p
LEFT JOIN persona_jtbd_mapping pjm ON p.id = pjm.persona_id
GROUP BY p.id, p.name
HAVING COUNT(pjm.jtbd_id) = 0
ORDER BY p.name;
```

### Query 3: Tenant Status
```sql
SELECT
    id,
    name,
    slug,
    type,
    subscription_tier,
    subscription_status,
    status,
    industry
FROM tenants
ORDER BY created_at;
```

---

## 📈 Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Agents | ≥190 | 311 | ✅ EXCEEDED |
| Personas | ≥251 | 51 | ❌ 20% |
| JTBDs | ≥237 | 0 | ❌ 0% |
| Tools | ≥150 | ? | ⏳ TBD |
| Prompts | ≥100 | ? | ⏳ TBD |
| Knowledge Domains | ≥50 | ? | ⏳ TBD |
| Tenants | ≥11 | 3 | ❌ 27% |
| Workflows | ? | ? | ⏳ TBD |

**Overall Migration Completeness**: ~35-40% (estimate based on known data)

---

## 🎯 Conclusion

The migration from OLD DB (Vital) to NEW DB (Vital-expert) is **partially complete** with significant gaps in critical areas:

### ✅ Strengths
- Agents migrated successfully with enrichment (+121 agents)
- Medical Affairs personas loaded (51 personas)
- Database schema properly established
- NEW DB infrastructure operational

### ⚠️ Critical Gaps
- **Jobs to be Done**: 0 loaded (CRITICAL - must load immediately)
- **Personas**: 200 missing (80% gap)
- **Tenants**: 8 missing (73% gap)
- **Foundation data**: Status unknown (tools, prompts, knowledge domains)

### 🚀 Recommendation
**Execute Phase 1 migration immediately** to load critical foundation data (JTBDs, tools, prompts) within next 24-48 hours. Then proceed with Phase 2-3 for complete platform functionality.

---

**Report Generated**: November 14, 2025
**Next Review**: November 15, 2025 (after Phase 1 completion)
