# Agent Count Comprehensive Audit

**Date**: November 26, 2025  
**Status**: 🔴 Discrepancy Identified - Immediate Action Required

---

## Executive Summary

### Critical Finding: Agent Count Mismatch

**Expected (per AGENT_SCHEMA_SPEC.md)**: 489 total agents  
**Actual Found**: 165 agents (Medical Affairs only)  
**Missing**: 324 agents (66% shortfall)

---

## Detailed Breakdown

### 1. Medical Affairs Agents (Documented) ✅

| Level | Type | Count | Status |
|-------|------|-------|--------|
| L1 | Masters | 9 | ✅ Confirmed (documentation exists) |
| L2 | Experts | 45 | ✅ Confirmed (documentation exists) |
| L3 | Specialists | 43 | ✅ Confirmed (documentation exists) |
| L4 | Workers | 18 | ✅ Confirmed (documentation exists) |
| L5 | Tools | 50 | ✅ Confirmed (documentation exists) |
| **Total** | **Medical Affairs** | **165** | ✅ **Complete** |

**Location**: `.claude/docs/platform/agents/01-masters/` through `05-tools/`

**Functions Covered**:
- Clinical Operations Support
- Field Medical
- HEOR & Evidence
- Medical Education
- Medical Excellence & Compliance
- Medical Information Services
- Medical Leadership
- Publications
- Scientific Communications

---

### 2. Expected Multi-Function Coverage (per Schema)

According to AGENT_SCHEMA_SPEC.md, agents should span **8 organizational functions**:

| Function | Expected Coverage | Current Status |
|----------|------------------|----------------|
| **Medical Affairs** | 165 agents | ✅ Complete (165 agents) |
| **Regulatory Affairs** | ~80-100 agents | ❌ Missing |
| **Clinical Development** | ~80-100 agents | ❌ Missing |
| **Market Access & HEOR** | ~40-60 agents | ❌ Partial (included in Medical Affairs) |
| **Safety & Pharmacovigilance** | ~40-50 agents | ❌ Missing |
| **Manufacturing & Quality** | ~30-40 agents | ❌ Missing |
| **Commercial Operations** | ~30-40 agents | ❌ Missing |
| **Digital Health & Innovation** | ~20-30 agents | ❌ Missing |

**Expected Total**: ~489 agents  
**Actual Total**: 165 agents  
**Gap**: 324 agents (66%)

---

### 3. Database Export Analysis

#### agents-comprehensive.json
```json
{
  "total_agents": 254,
  "by_tier": {
    "1": 7,
    "2": 159,
    "3": 88
  },
  "by_status": {
    "inactive": 243,
    "active": 6,
    "testing": 3,
    "development": 2
  },
  "by_business_function": {
    "IT/Digital": 20,
    "Clinical Development": 26,
    "Regulatory Affairs": 25,
    "Manufacturing": 9,
    "Operations": 74,
    "Research & Development": 38,
    "Commercial": 15,
    "Legal": 9,
    "Quality": 10,
    "Pharmacovigilance": 12,
    "Business Development": 10,
    "Medical Affairs": 6  # ❌ Only 6 active, not 165!
  }
}
```

**Analysis**:
- Database has 254 agents (not 489)
- Only **6 active Medical Affairs agents** (not 165)
- 243 agents are **inactive** (96% inactive rate)
- Other functions exist but most are inactive

**Conclusion**: Database needs massive update/reactivation

---

### 4. Multi-Tenant Analysis

#### Current Tenant Structure

Based on AGENT_SCHEMA_SPEC.md:

**Tenant 1: Pharma** (tenant_key: 'pharma')
- Type: Biopharma
- Expected Agents: 400+
- Functions: 8 (Clinical, Regulatory, Market Access, Medical Affairs, etc.)

**Tenant 2: Digital Health** (tenant_key: 'digital-health')
- Type: Healthtech
- Expected Agents: 89
- Functions: 6 (Product, Engineering, Clinical, Regulatory, etc.)

**Expected Total**: ~489 agents

---

## Root Cause Analysis

### Issue 1: Documentation vs Database Mismatch

**Documentation** (Markdown files):
- 165 Medical Affairs agents fully documented
- High-quality agent definitions
- Complete capability/skill/responsibility mappings

**Database** (PostgreSQL/Supabase):
- Only 254 agents total
- 243 inactive (96%)
- Only 6 active Medical Affairs agents
- Missing 324 agents from other functions

**Root Cause**: Documentation created but NOT seeded into database

---

### Issue 2: Inactive Agent Status

**Problem**: 96% of database agents are inactive

**Possible Reasons**:
1. Agents created during development but not activated
2. Old agent definitions deprecated
3. Multi-tenant isolation (agents belong to different tenants)
4. Migration incomplete

---

### Issue 3: Function Coverage Gap

**Medical Affairs**: ✅ Complete documentation (165 agents)  
**Other 7 Functions**: ❌ Missing documentation + missing database records

**Impact**:
- Agent selection limited to Medical Affairs only
- Cannot support Regulatory, Clinical, Manufacturing queries
- Missing 66% of expected agent coverage

---

## Recommended Actions

### Phase 1: Immediate (Priority 1) 🔴

**Action 1.1: Activate Medical Affairs Agents**
```sql
-- Activate all Medical Affairs agents
UPDATE agents
SET status = 'active',
    validation_status = 'validated'
WHERE function_name = 'Medical Affairs'
  AND status != 'deprecated';
```

**Expected Outcome**: 165 active Medical Affairs agents

---

**Action 1.2: Verify Multi-Tenant Distribution**
```sql
-- Check agent distribution by tenant
SELECT
  o.tenant_key,
  o.organization_name,
  COUNT(a.id) as total_agents,
  COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_agents,
  string_agg(DISTINCT a.function_name, ', ') as functions
FROM organizations o
LEFT JOIN agents a ON o.id = a.tenant_id
GROUP BY o.id, o.tenant_key, o.organization_name
ORDER BY total_agents DESC;
```

**Expected Outcome**: Identify if agents are split across tenants

---

### Phase 2: Short-Term (Days 1-3) 🟡

**Action 2.1: Seed Missing Function Agents**

Create agent definitions for 7 missing functions:

1. **Regulatory Affairs** (80-100 agents)
   - L1: Regulatory Affairs Director, VP Regulatory
   - L2: Senior Regulatory Affairs Specialists (FDA, EMA, CMC, etc.)
   - L3: Regulatory Affairs Associates, Specialists
   - L4: Regulatory Document Coordinators
   - L5: Regulatory Tools (submission checkers, etc.)

2. **Clinical Development** (80-100 agents)
   - L1: Clinical Development Director, VP Clinical Ops
   - L2: Clinical Project Managers, Biostatisticians, Data Managers
   - L3: Clinical Research Associates, Site Monitors
   - L4: Clinical Data Entry, Trial Coordinators
   - L5: Clinical Tools (CTMS, EDC integrations)

3. **Safety & Pharmacovigilance** (40-50 agents)
   - L1: Chief Safety Officer, VP Pharmacovigilance
   - L2: Safety Physicians, PV Managers
   - L3: Drug Safety Associates, Case Processors
   - L4: Safety Data Entry
   - L5: AE Detection Tools

4. **Manufacturing & Quality** (30-40 agents)
5. **Commercial Operations** (30-40 agents)
6. **Digital Health & Innovation** (20-30 agents)
7. **Market Access (expanded)** (20-30 agents)

**Methodology**:
- Use Medical Affairs agent templates
- Adapt capabilities/skills/responsibilities per function
- Map to org_functions, org_departments, org_roles

---

**Action 2.2: Create Seed SQL Scripts**

Generate SQL scripts for each function:

```sql
-- Example: Regulatory Affairs Master Agent
INSERT INTO agents (
  tenant_id, name, slug, title, description,
  agent_level_id, function_id, department_id, role_id,
  system_prompt_template_id, base_model, status
) VALUES (
  (SELECT id FROM organizations WHERE tenant_key = 'pharma'),
  'regulatory-affairs-director',
  'regulatory-affairs-director',
  'Regulatory Affairs Director',
  'Strategic regulatory expert for global submissions and regulatory strategy',
  (SELECT id FROM agent_levels WHERE level_number = 1),
  (SELECT id FROM org_functions WHERE function_name = 'Regulatory Affairs'),
  (SELECT id FROM org_departments WHERE department_name = 'Global Regulatory'),
  (SELECT id FROM org_roles WHERE role_name = 'Director, Regulatory Affairs'),
  (SELECT id FROM system_prompt_templates WHERE agent_level = 'L1'),
  'gpt-4-turbo',
  'active'
) RETURNING id;

-- Assign capabilities
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
SELECT
  (SELECT id FROM agents WHERE slug = 'regulatory-affairs-director'),
  c.id,
  'expert',
  TRUE
FROM capabilities c
WHERE c.capability_slug IN (
  'regulatory-strategy',
  'fda-submissions',
  'regulatory-intelligence'
);
```

---

### Phase 3: Medium-Term (Days 4-7) 🟢

**Action 3.1: Multi-Tenant Agent Seeding**

Seed agents for both tenants:

**Pharma Tenant** (400+ agents):
- Medical Affairs: 165 ✅
- Regulatory Affairs: 100
- Clinical Development: 90
- Safety & PV: 45
- Manufacturing & Quality: 0 (future)
- Commercial: 0 (future)

**Digital Health Tenant** (89 agents):
- Product Management: 20
- Engineering: 25
- Clinical (Digital Health): 15
- Regulatory (Digital): 10
- Data Science: 10
- UX/Design: 9

**Total Expected**: ~489 agents

---

**Action 3.2: Capability/Skill/Responsibility Assignment**

For each new agent:
1. Assign 8-12 capabilities (from 60 defined)
2. Assign 10-20 skills (from 150+ defined)
3. Assign 5-10 responsibilities (from 60 defined)
4. Assign 2-4 knowledge domains

**Estimated Assignments**:
- Capabilities: ~3,900 assignments (489 × 8 avg)
- Skills: ~7,350 assignments (489 × 15 avg)
- Responsibilities: ~3,400 assignments (489 × 7 avg)

---

### Phase 4: Long-Term (Week 2+) 🔵

**Action 4.1: Agent Embeddings Generation**

Generate embeddings for all 489 agents:
```python
# For each agent
agent_profile = f"{agent.name} {agent.title} {agent.description}"
embedding = openai.embeddings.create(
    model="text-embedding-3-large",
    input=agent_profile,
    dimensions=1536
)

# Store in agent_embeddings table
INSERT INTO agent_embeddings (agent_id, embedding_type, embedding)
VALUES (agent.id, 'agent_profile', embedding)
```

---

**Action 4.2: Neo4j Graph Seeding**

Seed Neo4j with agent relationships:
```cypher
// Create agent nodes
CREATE (a:Agent {
  id: $agent_id,
  name: $name,
  level: $level,
  function: $function,
  tenant_id: $tenant_id
})

// Create capability relationships
MATCH (a:Agent {id: $agent_id})
MATCH (c:Capability {slug: $capability_slug})
CREATE (a)-[:HAS_CAPABILITY {proficiency: $proficiency}]->(c)

// Create hierarchy relationships
MATCH (master:Agent {level: 'L1_MASTER'})
MATCH (expert:Agent {level: 'L2_EXPERT'})
WHERE expert.function = master.function
CREATE (master)-[:ORCHESTRATES]->(expert)
```

---

**Action 4.3: Pinecone Vector Index**

Seed Pinecone with agent vectors:
```python
# Upsert to vital-agents index
index = pc.Index("vital-agents")

vectors = [
    {
        "id": agent.id,
        "values": embedding,
        "metadata": {
            "name": agent.name,
            "level": agent.level,
            "function": agent.function,
            "tenant_id": agent.tenant_id,
            "is_active": True
        }
    }
    for agent in agents
]

index.upsert(
    vectors=vectors,
    namespace=f"tenant-{tenant_id}"
)
```

---

## Success Metrics

### Phase 1 (Immediate)
- ✅ 165 active Medical Affairs agents in database
- ✅ Multi-tenant distribution verified
- ✅ Agent selection working for Medical Affairs queries

### Phase 2 (Short-Term)
- ✅ 400+ agents seeded across 4 core functions
- ✅ ~3,000 capability assignments
- ✅ ~6,000 skill assignments
- ✅ Agent selection working for Regulatory + Clinical queries

### Phase 3 (Medium-Term)
- ✅ 489 total agents (Pharma + Digital Health tenants)
- ✅ All 8 functions covered
- ✅ ~3,900 capability assignments
- ✅ ~7,350 skill assignments
- ✅ Evidence-based selection operational

### Phase 4 (Long-Term)
- ✅ All 489 agents have embeddings
- ✅ Neo4j graph fully seeded
- ✅ Pinecone index fully seeded
- ✅ GraphRAG 3-method selection operational
- ✅ >92% top-3 accuracy achieved

---

## Immediate Next Steps

1. **Run database query** to verify actual agent count per tenant
2. **Activate 165 Medical Affairs agents** in database
3. **Implement evidence-based selection** (works with existing 165 agents)
4. **Create agent seeding pipeline** for missing 324 agents
5. **Generate seed SQL scripts** for Regulatory + Clinical functions

---

**Priority Order**:
1. 🔴 **Immediate**: Activate existing Medical Affairs agents (165)
2. 🟡 **Short-Term**: Seed Regulatory Affairs (100 agents)
3. 🟡 **Short-Term**: Seed Clinical Development (90 agents)
4. 🟢 **Medium-Term**: Seed remaining 5 functions (134 agents)
5. 🔵 **Long-Term**: Complete embeddings + graph seeding

---

**End of Report**

