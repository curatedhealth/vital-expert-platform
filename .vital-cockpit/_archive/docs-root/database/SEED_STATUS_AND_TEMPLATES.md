# **SEED DATA STATUS & TEMPLATES**

**Last Updated:** November 2, 2025  
**Purpose:** Track what's been seeded and provide templates for future use cases

---

## **📋 CURRENT SEED STATUS**

### **✅ FOUNDATION DATA (COMPLETE - Reusable Across All Use Cases)**

| File | Status | Count | Description |
|------|--------|-------|-------------|
| `00_foundation_agents.sql` | ✅ **SEEDED** | 17 agents | AI agents (executors, validators, specialists, orchestrators, retrievers, synthesizers) |
| `01_foundation_personas.sql` | ✅ **SEEDED** | 33 personas | Human experts across all domains (Clinical Dev, Regulatory, Product, Biostatistics, HEOR, QA, etc.) |
| `02_foundation_tools.sql` | ✅ **SEEDED** | 17 tools | Statistical software, EDC systems, research databases, regulatory tools, AI tools |
| `03_foundation_rag_sources.sql` | ✅ **SEEDED** | 24 sources | FDA guidance, ICH/EMA guidance, clinical standards, data standards, research databases |
| `04_foundation_kpis.sql` | ✅ **SEEDED** | ~50 KPIs | Performance metrics across all domains |
| `05_foundation_prompts.sql` | ✅ **SEEDED** | 9 prompts | UC_CD_002 prompts (V1/V2/V3 validation workflow prompts) |

**Foundation Status:** ✅ **100% COMPLETE** - No need to recreate these for new use cases!

---

### **✅ DOMAIN & USE CASE DEFINITIONS**

| File | Status | Count | Description |
|------|--------|-------|-------------|
| `01_all_domains_and_usecases.sql` | ✅ **SEEDED** | 4 domains, Multiple use cases | Clinical Development, Regulatory Affairs, Market Access, Product & Engineering |

**Note:** This file defines use case metadata but NOT workflows/tasks/assignments.

---

### **✅ USE CASE IMPLEMENTATIONS (Workflows + Tasks + Assignments)**

#### **UC_CD_001: DTx Clinical Endpoint Selection & Validation**

| File | Status | Content | Counts |
|------|--------|---------|--------|
| `06_cd_001_endpoint_selection_part1.sql` | ✅ **SEEDED** | Workflows + Tasks | 3 workflows, 13 tasks |
| `06_cd_001_endpoint_selection_part2.sql` | ⚠️ **MISSING** | Assignments | Not yet created |

**UC-01 Status:** 🟡 **PARTIAL** (Workflows/Tasks ✅, Assignments ⚠️)

---

#### **UC_CD_002: Digital Biomarker Validation Strategy (DiMe V3 Framework)**

| File | Status | Content | Counts |
|------|--------|---------|--------|
| `07_cd_002_biomarker_validation.sql` | ✅ **SEEDED** | Workflows + Tasks | 3 workflows (V1, V2, V3), 9 tasks |
| `07_cd_002_biomarker_validation_part2.sql` | ✅ **SEEDED** | Assignments | 9 dependencies, 28 agent assignments, 31 persona assignments, 17 tool mappings, 13 RAG mappings |

**UC-02 Status:** ✅ **100% COMPLETE** (Workflows ✅, Tasks ✅, Assignments ✅)

**Total Assignments:** 98 relationships seeded!

---

### **🎯 TEMPLATE FILES FOR FUTURE USE CASES**

Use **UC_CD_002** as the gold standard template:

#### **Part 1 Template:** `07_cd_002_biomarker_validation.sql`
- ✅ Session configuration (temp table for tenant_id)
- ✅ Workflow seeding with `unique_id` generation
- ✅ Task seeding with `unique_id` generation
- ✅ Comprehensive metadata in JSONB fields
- ✅ Verification queries
- ✅ All schema constraints validated

#### **Part 2 Template:** `07_cd_002_biomarker_validation_part2.sql`
- ✅ Task dependencies (`dh_task_dependency`)
- ✅ Task-Agent assignments (`dh_task_agent`) with valid `assignment_type` values
- ✅ Task-Persona assignments (`dh_task_persona`) with valid `responsibility` and `review_timing` values
- ✅ Task-Tool mappings (`dh_task_tool`)
- ✅ Task-RAG mappings (`dh_task_rag`)
- ✅ All ON CONFLICT clauses match actual unique constraints
- ✅ All column names match actual schema
- ✅ Verification queries (no nested aggregates!)

---

## **📊 WHAT WE'VE SEEDED - SUMMARY**

### **Foundation Layer (Reusable)**
```
✅ 17 AI Agents
✅ 33 Human Personas
✅ 17 Tools
✅ 24 RAG Sources
✅ ~50 KPIs
✅ 9 Prompts (UC_CD_002)
━━━━━━━━━━━━━━━━━━━━━
   150+ Foundation Entities
```

### **Use Case Layer**
```
✅ UC_CD_001 (DTx Clinical Endpoint Selection)
   - 3 Workflows
   - 13 Tasks
   - ⚠️ 0 Assignments (not yet created)

✅ UC_CD_002 (Digital Biomarker Validation)
   - 3 Workflows (V1 Verification, V2 Analytical, V3 Clinical)
   - 9 Tasks
   - 98 Assignments (dependencies, agents, personas, tools, RAG)
━━━━━━━━━━━━━━━━━━━━━
   6 Workflows
   22 Tasks
   98 Assignments
```

### **Grand Total**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 150+ Foundation Entities (reusable)
✅ 6 Workflows
✅ 22 Tasks
✅ 98 Assignments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   276+ Database Records Seeded!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## **🚀 NEXT STEPS - REMAINING USE CASES TO IMPLEMENT**

Based on your provided documentation, here are the remaining use cases:

### **Clinical Development Domain**

| Use Case | Priority | Complexity | Estimated Files |
|----------|----------|------------|-----------------|
| ✅ **UC_CD_001** | HIGH | ADVANCED | Part1 ✅, Part2 ⚠️ |
| ✅ **UC_CD_002** | HIGH | EXPERT | Part1 ✅, Part2 ✅ |
| ⚠️ **UC_CD_003** (RCT Design for DTx) | HIGH | EXPERT | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_CD_004** (Formulary Positioning) | MEDIUM | ADVANCED | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_CD_005** (PRO Instrument Selection) | HIGH | EXPERT | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_CD_006** (Adaptive Trial Design) | MEDIUM | EXPERT | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_CD_007** (Real-World Evidence) | MEDIUM | ADVANCED | Part1 ⚠️, Part2 ⚠️ |

### **Regulatory Affairs Domain**

| Use Case | Priority | Complexity | Estimated Files |
|----------|----------|------------|-----------------|
| ⚠️ **UC_RA_001** (FDA Software Classification) | HIGH | ADVANCED | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_RA_002** (510(k) vs De Novo) | HIGH | EXPERT | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_RA_003** (FDA Pre-Submission) | HIGH | ADVANCED | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_RA_004** (EMA Qualification) | MEDIUM | EXPERT | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_RA_005** (Post-Market Surveillance) | MEDIUM | ADVANCED | Part1 ⚠️, Part2 ⚠️ |

### **Market Access Domain**

| Use Case | Priority | Complexity | Estimated Files |
|----------|----------|------------|-----------------|
| ⚠️ **UC_MA_001** (Value Dossier) | HIGH | ADVANCED | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_MA_002** (Payer Evidence) | HIGH | ADVANCED | Part1 ⚠️, Part2 ⚠️ |
| ⚠️ **UC_MA_003** (Reimbursement Strategy) | MEDIUM | ADVANCED | Part1 ⚠️, Part2 ⚠️ |

---

## **📝 HOW TO CREATE NEW USE CASE SEED FILES**

### **Step 1: Copy the Templates**
```bash
# Copy UC_CD_002 templates as starting point
cp 07_cd_002_biomarker_validation.sql 08_cd_XXX_new_usecase.sql
cp 07_cd_002_biomarker_validation_part2.sql 08_cd_XXX_new_usecase_part2.sql
```

### **Step 2: Update Part 1 (Workflows + Tasks)**

#### **A. Update Header**
```sql
-- =====================================================================================
-- 08_cd_XXX_new_usecase.sql
-- UC-XX: Your Use Case Title
-- =====================================================================================
-- Purpose: Seed workflows and tasks for UC_CD_XXX
-- Based on: UC_CD_XXX documentation
-- Dependencies:
--   - Use case UC_CD_XXX must exist in dh_use_case table
--   - Foundation tables (agents, personas, tools, RAG sources, KPIs)
-- =====================================================================================
```

#### **B. Update Workflow Queries**
- Update `use_case_id` filter: `WHERE uc.code = 'UC_CD_XXX'`
- Update `unique_id` pattern: `'WFL-CD-XXX-001'`, `'WFL-CD-XXX-002'`, etc.
- Update workflow names, descriptions, metadata

#### **C. Update Task Queries**
- Update task codes: `'TSK-CD-XXX-P1-01'`, etc.
- Update `unique_id` (same as task code)
- Update task titles, objectives, metadata
- Update workflow name matching: `WHERE wf.name = t_data.workflow_name`

#### **D. Update Verification Queries**
- Update all use case filters: `WHERE code = 'UC_CD_XXX'`

### **Step 3: Update Part 2 (Assignments)**

#### **A. Update Header**
```sql
-- =====================================================================================
-- 08_cd_XXX_new_usecase_part2.sql
-- UC-XX: Your Use Case Title - Assignments
-- =====================================================================================
-- Dependencies:
--   - 08_cd_XXX_new_usecase.sql (workflows and tasks)
--   - Foundation tables: agents, personas, tools, RAG sources, KPIs
-- =====================================================================================
```

#### **B. Update Task Dependencies**
- Reference your task codes: `'TSK-CD-XXX-P1-01'`, etc.
- Ensure dependency logic matches your workflow

#### **C. Update Task-Agent Assignments**
- Reference your task codes
- Reference existing agent codes from `00_foundation_agents.sql`
- Use valid `assignment_type`: `'PRIMARY_EXECUTOR'`, `'VALIDATOR'`, `'FALLBACK'`, `'REVIEWER'`, `'CO_EXECUTOR'`
- Reference existing persona codes for `approval_persona_code`

#### **D. Update Task-Persona Assignments**
- Reference your task codes
- Reference existing persona codes from `01_foundation_personas.sql`
- Use valid `responsibility`: `'APPROVE'`, `'REVIEW'`, `'PROVIDE_INPUT'`, `'INFORM'`, `'VALIDATE'`, `'CONSULT'`
- Use valid `review_timing`: `'BEFORE_AGENT_RUNS'`, `'AFTER_AGENT_RUNS'`, `'PARALLEL'`, `'ON_AGENT_ERROR'` (or NULL)

#### **E. Update Task-Tool Mappings**
- Reference your task codes
- Reference existing tool codes from `02_foundation_tools.sql`
- Provide clear `purpose` for each tool usage

#### **F. Update Task-RAG Mappings**
- Reference your task codes
- Reference existing RAG source codes from `03_foundation_rag_sources.sql`
- Provide `query_context` (query template string)
- Provide `search_config` JSONB with purpose and other metadata
- **DO NOT** include `purpose` as a direct column (it doesn't exist!)

#### **G. Update Verification Queries**
- Update all use case filters: `WHERE code = 'UC_CD_XXX'`

---

## **✅ CRITICAL SCHEMA RULES (LEARNED FROM UC-01 & UC-02)**

### **Always Reference:**
**`SEED_SCHEMA_REFERENCE.md`** - The definitive schema guide

### **Key Rules:**

#### **1. Workflows (`dh_workflow`)**
- ✅ **NO** `code` column
- ✅ `unique_id` must be provided manually (e.g., `'WFL-CD-002-001'`)
- ✅ ON CONFLICT: `(tenant_id, unique_id)`
- ✅ `metadata` JSONB for extra fields (like `estimated_duration_hours`)

#### **2. Tasks (`dh_task`)**
- ✅ Use `title` and `objective` (NOT `name` and `description`)
- ✅ `unique_id` must be provided manually (usually same as `code`)
- ✅ ON CONFLICT: `(workflow_id, code)`
- ✅ `extra` JSONB for metadata (NOT `metadata`)

#### **3. Task Dependencies (`dh_task_dependency`)**
- ✅ ON CONFLICT: `(task_id, depends_on_task_id)` - NO `tenant_id`, NO `updated_at`

#### **4. Task-Agent (`dh_task_agent`)**
- ✅ ON CONFLICT: `(tenant_id, task_id, agent_id, assignment_type)`
- ✅ Valid `assignment_type`: `'PRIMARY_EXECUTOR'`, `'VALIDATOR'`, `'FALLBACK'`, `'REVIEWER'`, `'CO_EXECUTOR'`
- ✅ Column: `requires_human_approval` (NOT `require_human_approval`)
- ✅ Column: `approval_persona_code` (NOT `approval_persona_id`)
- ✅ Column: `metadata` (NOT `extra`)

#### **5. Task-Persona (`dh_task_persona`)**
- ✅ ON CONFLICT: `(tenant_id, task_id, persona_id, responsibility)`
- ✅ Valid `responsibility`: `'APPROVE'`, `'REVIEW'`, `'PROVIDE_INPUT'`, `'INFORM'`, `'VALIDATE'`, `'CONSULT'`
- ✅ Valid `review_timing`: `'BEFORE_AGENT_RUNS'`, `'AFTER_AGENT_RUNS'`, `'PARALLEL'`, `'ON_AGENT_ERROR'` (or NULL)
- ✅ Column: `metadata` (NOT `extra`)

#### **6. Task-Tool (`dh_task_tool`)**
- ✅ ON CONFLICT: `(task_id, tool_id)` - NO `tenant_id`, NO `updated_at`
- ✅ Column: `connection_config` (NOT `extra`)

#### **7. Task-RAG (`dh_task_rag`)**
- ✅ ON CONFLICT: `(task_id, rag_source_id)` - NO `tenant_id`, NO `updated_at`
- ✅ **NO** `purpose` column! Move purpose text into `search_config` JSONB
- ✅ Column: `query_context` (query template string)
- ✅ Column: `search_config` JSONB (metadata about the search)

---

## **🎯 RECOMMENDED NEXT USE CASE**

Based on user-provided documentation, I recommend:

### **UC_CD_005: PRO Instrument Selection**
- ✅ Complete documentation available
- ✅ HIGH priority
- ✅ EXPERT complexity
- ✅ Builds on UC_CD_001 and UC_CD_002 learnings
- ✅ Can reuse most foundation agents, personas, tools, RAG sources

---

## **📚 AVAILABLE DOCUMENTATION FOR SEEDING**

You have provided complete documentation for these use cases (ready to seed):

1. ✅ **UC_CD_001**: DTx Clinical Endpoint Selection (`UC01_DTx_Clinical_Endpoint_Selection_COMPLETE.md`)
2. ✅ **UC_CD_002**: Digital Biomarker Validation (`UC_CD_002: Digital Biomarker Validation Strategy (DiMe V3 Framework)`)
3. ✅ **UC_CD_004**: Formulary Positioning Strategy (`UC04_Formulary_Positioning_Strategy_COMPLETE.md`)
4. ✅ **UC_CD_005**: PRO Instrument Selection (`UC05_PRO_Instrument_Selection_COMPLETE.md`)
5. ✅ **UC_MA_016**: Payer Formulary PT Strategy (`UC16_Payer_Formulary_PT_Strategy_COMPLETE.md`)

---

## **🚀 LET'S CONTINUE!**

**Next Action:** Pick the next use case to seed, and I'll create both Part1 and Part2 files using the UC_CD_002 template!

**Recommended:** UC_CD_005 (PRO Instrument Selection) - You have complete documentation and it's high priority.

Just say the word! 🎯

