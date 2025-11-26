# Complete Agent Enrichment Plan - Full Schema Coverage

**Date**: November 24, 2025  
**Total Agents**: 489  
**Target**: 100% schema coverage across all agent-related tables

---

## 📊 Current Status Summary

### ✅ COMPLETED (Phase 1 - Basic Fields)

| Table/Field | Coverage | Status |
|-------------|----------|--------|
| **agents.name** | 489/489 (100%) | ✅ Complete |
| **agents.slug** | 489/489 (100%) | ✅ Complete |
| **agents.tagline** | 489/489 (100%) | ✅ Complete |
| **agents.title** | 489/489 (100%) | ✅ Complete |
| **agents.description** | 489/489 (100%) | ✅ Complete |
| **agents.years_of_experience** | 489/489 (100%) | ✅ Complete |
| **agents.expertise_level** | 489/489 (100%) | ✅ Complete |
| **agents.communication_style** | 489/489 (100%) | ✅ Complete |
| **agents.avatar_description** | 489/489 (100%) | ✅ Complete |
| **agents.system_prompt** | 489/489 (100%) | ✅ Complete |
| **agents.agent_level_id** | 489/489 (100%) | ✅ Complete |
| **agents.function_id/name** | 489/489 (100%) | ✅ Complete |
| **agents.department_id/name** | 489/489 (100%) | ✅ Complete |
| **agents.role_id/name** | 489/489 (100%) | ✅ Complete |

### ⚠️ PARTIALLY COMPLETE

| Table/Field | Coverage | Status |
|-------------|----------|--------|
| **agent_skills** | 165/489 (33.7%) | ⚠️ Need 324 more agents |
| **agents.avatar_url** | 254/489 (51.9%) | ⚠️ Need 235 more avatars |
| **agents.metadata** | 319/489 (65.2%) | ⚠️ Need cleanup/enrichment |
| **agents.documentation_path** | 165/489 (33.7%) | ⚠️ Need 324 more docs |
| **agents.documentation_url** | 165/489 (33.7%) | ⚠️ Need 324 more URLs |

### ❌ NOT STARTED

| Table/Field | Coverage | Priority |
|-------------|----------|----------|
| **agent_knowledge_domains** | 0/489 (0%) | 🔴 HIGH |
| **agent_category_assignments** | 0/489 (0%) | 🔴 HIGH |
| **agent_industries** | 0/489 (0%) | 🟡 MEDIUM |
| **agent_rag_policies** | 0/489 (0%) | 🔴 HIGH |
| **agent_kg_views** | 0/489 (0%) | 🔴 HIGH |
| **agent_memory_instructions** | 0/489 (0%) | 🟡 MEDIUM |
| **agent_hierarchies** | 0/489 (0%) | 🔴 HIGH |
| **agent_graph_assignments** | 0/489 (0%) | 🟡 MEDIUM |
| **agents.persona_id** | 0/489 (0%) | 🟢 LOW |
| **agents.average_rating** | 0/489 (0%) | 🟢 LOW (runtime) |

---

## 🎯 Phase 2: Essential Enrichment (Priority Order)

### **Phase 2A: Knowledge & RAG (CRITICAL)** 🔴

#### 1. **agent_knowledge_domains** (0/489)
**Schema**:
```sql
CREATE TABLE agent_knowledge_domains (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  domain_name text NOT NULL,
  proficiency_level text CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_primary_domain boolean DEFAULT false,
  expertise_level integer CHECK (expertise_level >= 1 AND expertise_level <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Map agents to knowledge domains based on function/role
- Examples:
  - Medical Affairs → Clinical Medicine, Pharmacology, Evidence-Based Medicine
  - Regulatory Affairs → Regulatory Compliance, FDA Guidelines, EMA Regulations
  - Market Access → Health Economics, Pricing & Reimbursement, HTA

**Proficiency by Level**:
- Master: expert (5)
- Expert: expert (4-5)
- Specialist: advanced (3-4)
- Worker: intermediate (2-3)
- Tool: basic (1-2)

---

#### 2. **agent_rag_policies** (0/489)
**Schema**:
```sql
CREATE TABLE agent_rag_policies (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  rag_profile_id uuid REFERENCES rag_profiles(id),
  agent_specific_top_k integer,
  agent_specific_threshold numeric,
  agent_specific_fusion_weights jsonb,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Assign RAG profiles to agents based on level:
  - Master: `graphrag_entity` (deep graph traversal)
  - Expert: `hybrid_enhanced` (vector + keyword)
  - Specialist: `semantic_standard` (vector-only)
  - Worker: `semantic_standard` (basic)
  - Tool: None (direct API)

---

#### 3. **agent_kg_views** (0/489)
**Schema**:
```sql
CREATE TABLE agent_kg_views (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  rag_profile_id uuid,
  include_node_types uuid[],
  include_edge_types uuid[],
  max_hops integer DEFAULT 3,
  depth_strategy text CHECK (depth_strategy IN ('breadth', 'depth', 'entity-centric')),
  graph_limit integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Define KG views for Master/Expert level agents
- Node types: Drug, Disease, Clinical Trial, Publication, Guideline
- Edge types: TREATS, CAUSES, PUBLISHED_IN, REFERENCES

---

### **Phase 2B: Skills & Categories (HIGH PRIORITY)** 🔴

#### 4. **Complete agent_skills** (165/489 → 489/489)
**Current**: Only 165 agents have skills assigned

**Action Required**:
- Assign skills to remaining 324 agents based on their level and role
- Use existing `assign_skills_by_agent_level.sql` script
- Verify proficiency levels match agent level

---

#### 5. **agent_category_assignments** (0/489)
**Schema**:
```sql
CREATE TABLE agent_category_assignments (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  category_id uuid REFERENCES agent_categories(id),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Create agent categories:
  - Clinical & Medical
  - Regulatory & Compliance
  - Market Access & HEOR
  - Operations & Analytics
  - Safety & Pharmacovigilance
- Assign agents to 1-3 categories based on function/role

---

### **Phase 2C: Hierarchies & Relationships (HIGH PRIORITY)** 🔴

#### 6. **agent_hierarchies** (0/489)
**Schema**:
```sql
CREATE TABLE agent_hierarchies (
  id uuid PRIMARY KEY,
  parent_agent_id uuid REFERENCES agents(id),
  child_agent_id uuid REFERENCES agents(id),
  relationship_type text CHECK (relationship_type IN (
    'delegates_to', 'supervises', 'collaborates_with', 
    'consults', 'escalates_to'
  )),
  delegation_trigger text,
  auto_delegate boolean DEFAULT false,
  confidence_threshold numeric,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Create hierarchical relationships:
  - Master → Expert (supervises, escalates_to)
  - Expert → Specialist (delegates_to)
  - Specialist → Worker (delegates_to)
  - Worker → Tool (delegates_to)
- Set confidence thresholds for auto-delegation

---

### **Phase 2D: Industries & Context (MEDIUM PRIORITY)** 🟡

#### 7. **agent_industries** (0/489)
**Schema**:
```sql
CREATE TABLE agent_industries (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  industry_id uuid REFERENCES industries(id),
  relevance_score numeric CHECK (relevance_score >= 0 AND relevance_score <= 1),
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Map agents to pharmaceutical industry segments:
  - Biopharmaceuticals
  - Specialty Pharma
  - Generic Drugs
  - Medical Devices
  - Diagnostics

---

#### 8. **agent_graph_assignments** (0/489)
**Schema**:
```sql
CREATE TABLE agent_graph_assignments (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  graph_id uuid REFERENCES agent_graphs(id),
  is_primary_graph boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Create default workflow graphs for each agent level
- Assign agents to appropriate graphs based on complexity

---

#### 9. **agent_memory_instructions** (0/489)
**Schema**:
```sql
CREATE TABLE agent_memory_instructions (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  instruction text NOT NULL,
  instruction_type text CHECK (instruction_type IN (
    'preference', 'constraint', 'style', 'domain_rule'
  )),
  priority integer DEFAULT 0,
  scope text CHECK (scope IN ('global', 'domain', 'context', 'session')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Action Required**:
- Add global instructions per agent level:
  - Master: "Always consider strategic organizational impact"
  - Expert: "Provide evidence-based reasoning with citations"
  - Specialist: "Focus on domain-specific best practices"
  - Worker: "Follow established procedures and protocols"
  - Tool: "Return structured data only"

---

### **Phase 2E: Documentation & Assets (MEDIUM PRIORITY)** 🟡

#### 10. **agents.documentation_path** (165/489)
**Action Required**:
- Generate documentation paths for remaining 324 agents
- Pattern: `{level}/{department}/{slug}.md`
- Example: `02-experts/clinical-operations-support/global-medical-liaison.md`

---

#### 11. **agents.documentation_url** (165/489)
**Action Required**:
- Upload markdown documentation to Supabase Storage
- Generate public URLs
- Link to agents table

---

#### 12. **agents.avatar_url** (254/489)
**Action Required**:
- Generate avatar URLs for remaining 235 agents
- Options:
  - Use UI Avatars API: `https://ui-avatars.com/api/?name={name}`
  - Use DiceBear API: `https://api.dicebear.com/7.x/{style}/svg?seed={slug}`
  - Upload custom avatars to Supabase Storage

---

### **Phase 2F: Metadata Cleanup (LOW PRIORITY)** 🟢

#### 13. **agents.metadata** (319/489 have data, needs standardization)
**Action Required**:
- Standardize metadata structure
- Move structured data out of metadata to proper columns
- Keep only experimental/runtime data in metadata

---

#### 14. **agents.persona_id** (0/489)
**Action Required**:
- Link agents to personas table if applicable
- May not be needed if agents are standalone

---

## 📈 Estimated Effort & Timeline

| Phase | Tasks | Agents | Estimated Time | Priority |
|-------|-------|--------|----------------|----------|
| **2A: Knowledge & RAG** | 3 tables | 489 | 4-6 hours | 🔴 CRITICAL |
| **2B: Skills & Categories** | 2 tables | 489 | 2-3 hours | 🔴 HIGH |
| **2C: Hierarchies** | 1 table | ~1500 relationships | 2-3 hours | 🔴 HIGH |
| **2D: Industries & Graphs** | 2 tables | 489 | 2-3 hours | 🟡 MEDIUM |
| **2E: Documentation** | 2 fields | 324 | 3-4 hours | 🟡 MEDIUM |
| **2F: Metadata** | 1 field | 489 | 1-2 hours | 🟢 LOW |
| **TOTAL** | **11 enrichments** | **489 agents** | **14-21 hours** | - |

---

## 🚀 Recommended Execution Order

### **Week 1: Critical RAG & Knowledge Setup**
1. ✅ agent_knowledge_domains (all 489)
2. ✅ agent_rag_policies (all 489)
3. ✅ agent_kg_views (Master + Expert only: ~134)

### **Week 2: Skills, Categories & Hierarchies**
4. ✅ Complete agent_skills (324 remaining)
5. ✅ agent_category_assignments (all 489)
6. ✅ agent_hierarchies (~1500 relationships)

### **Week 3: Context & Documentation**
7. ✅ agent_industries (all 489)
8. ✅ agent_graph_assignments (all 489)
9. ✅ Documentation paths and URLs (324 remaining)

### **Week 4: Polish & Testing**
10. ✅ agent_memory_instructions (level-based defaults)
11. ✅ Avatar URLs (235 remaining)
12. ✅ Metadata cleanup
13. ✅ End-to-end testing

---

## 📊 Success Criteria

**Full Schema Coverage**:
- ✅ All 489 agents have knowledge domains (3-5 per agent)
- ✅ All 489 agents have RAG policies
- ✅ All 489 agents have skills assigned
- ✅ All 489 agents have category assignments
- ✅ All agent hierarchies established (Master → Expert → Specialist → Worker → Tool)
- ✅ All 489 agents have documentation
- ✅ All 489 agents have avatar URLs
- ✅ 100% production-ready data

---

## 🛠️ Next Steps

**Immediate Actions**:
1. Review and approve this enrichment plan
2. Start with Phase 2A (Knowledge & RAG) - highest priority
3. Create scripts for each enrichment phase
4. Execute phase by phase with validation

**Would you like me to start with Phase 2A (Knowledge Domains, RAG Policies, KG Views)?**

---

**Status**: 📋 **PLAN READY - AWAITING APPROVAL**  
**Current Completion**: ~40% (basic fields only)  
**Target Completion**: 100% (all schema fields populated)


