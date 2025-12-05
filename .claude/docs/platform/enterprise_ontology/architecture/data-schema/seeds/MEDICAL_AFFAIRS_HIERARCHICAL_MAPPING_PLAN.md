# Medical Affairs Agents - Hierarchical Mapping & Integration Plan

## Overview
This document maps the 30 existing Medical Affairs agents to hierarchical structures, identifies missing components, and provides implementation strategy for Phase 1 (GraphRAG) integration.

---

## Current Structure Analysis

### 7 Departments (30 Total Agents)
1. **Field Medical** (4 agents) - Tier 1-3
2. **Medical Information** (3 agents) - Tier 1-2
3. **Medical Communications & Writing** (7 agents) - Tier 1-3
4. **Evidence Generation & HEOR** (5 agents) - Tier 1-2
5. **Clinical Operations Support** (4 agents) - Tier 1-3
6. **Medical Excellence & Governance** (3 agents) - Tier 2-3
7. **Medical Strategy & Operations** (4 agents) - Tier 2-3

---

## Hierarchical Structure Design

### Principle: "Director → Specialists" Pattern

Each department should have:
- **1 Director/Head** (Parent Agent) - Strategic oversight & delegation
- **2-6 Specialists** (Sub-agents) - Domain-specific execution
- **Delegation triggers** based on query keywords and complexity

---

## Department-by-Department Mapping

### 1. Field Medical (4 agents → 5 recommended)

**Current Agents:**
- Regional Medical Director (Tier 2) ✅ **PARENT**
- Medical Science Liaison Advisor (Tier 1)
- Therapeutic Area MSL Lead (Tier 2)
- Field Medical Trainer (Tier 3)

**Recommended Structure:**
```
Regional Medical Director (Parent)
├── Medical Science Liaison Advisor
├── Therapeutic Area MSL Lead
└── Field Medical Trainer
```

**Missing:** None - well-structured

**Delegation Triggers:**
- MSL Advisor: "KOL engagement", "scientific exchange", "HCP education"
- TA MSL Lead: "therapeutic area", "clinical expertise", "scientific platform"
- Trainer: "training", "competency", "onboarding", "development"

---

### 2. Medical Information (3 agents → 4 recommended)

**Current Agents:**
- Medical Information Specialist (Tier 1)
- Medical Librarian (Tier 2)
- Medical Content Manager (Tier 2)

**Recommended Structure:**
```
Director of Medical Information (NEW - Parent)
├── Medical Information Specialist
├── Medical Librarian
└── Medical Content Manager
```

**Missing:** 
- ✨ **Director of Medical Information** (Parent agent for oversight)

**Delegation Triggers:**
- Med Info Specialist: "medical inquiry", "adverse event", "safety", "off-label"
- Librarian: "literature search", "database", "reference", "research"
- Content Manager: "content strategy", "digital", "knowledge management"

---

### 3. Medical Communications & Writing (7 agents → 8 recommended)

**Current Agents:**
- Publication Strategy Lead (Tier 1) ✅ **PARENT CANDIDATE**
- Medical Education Director (Tier 1)
- Medical Writer - Scientific (Tier 1)
- Medical Writer - Regulatory (Tier 1)
- Medical Communications Manager (Tier 2)
- Medical Editor (Tier 2)
- Congress & Events Manager (Tier 3)

**Recommended Structure:**
```
Head of Medical Communications (NEW - Parent)
├── Publication Strategy Lead
├── Medical Education Director
├── Medical Writer - Scientific
├── Medical Writer - Regulatory
├── Medical Communications Manager
├── Medical Editor
└── Congress & Events Manager
```

**Missing:**
- ✨ **Head of Medical Communications** (Parent for department oversight)

**Delegation Triggers:**
- Publication Lead: "publication", "journal", "abstract", "manuscript", "GPP"
- Med Education: "CME", "medical education", "accreditation", "faculty"
- Scientific Writer: "manuscript", "abstract", "poster", "scientific writing"
- Regulatory Writer: "CSR", "protocol", "investigator brochure", "regulatory"
- Comm Manager: "communication strategy", "congress", "medical narrative"
- Editor: "editing", "review", "quality", "style guide"
- Events Manager: "congress", "symposium", "event", "logistics"

---

### 4. Evidence Generation & HEOR (5 agents → 6 recommended)

**Current Agents:**
- Real-World Evidence Specialist (Tier 1) ✅ Already seeded!
- Health Economics Specialist (Tier 1)
- Biostatistician (Tier 1)
- Epidemiologist (Tier 2)
- Outcomes Research Manager (Tier 2)

**Recommended Structure:**
```
Director of Evidence & HEOR (NEW - Parent)
├── Real-World Evidence Specialist (✅ Already in DB!)
├── Health Economics Specialist
├── Biostatistician
├── Epidemiologist
└── Outcomes Research Manager
```

**Missing:**
- ✨ **Director of Evidence & HEOR** (Parent - similar to our "Director of Medical Analytics")

**Note:** We already have "Real-World Evidence Analyst" from our first seed!

**Delegation Triggers:**
- RWE Specialist: "real-world evidence", "observational", "registry", "RWD"
- HEOR Specialist: "cost-effectiveness", "economic model", "budget impact", "HTA"
- Biostatistician: "statistical analysis", "sample size", "meta-analysis"
- Epidemiologist: "disease burden", "epidemiology", "population health"
- Outcomes Manager: "PRO", "quality of life", "patient outcomes"

---

### 5. Clinical Operations Support (4 agents → 5 recommended)

**Current Agents:**
- Medical Monitor (Tier 1) ✅ **PARENT CANDIDATE**
- Clinical Study Liaison (Tier 1)
- Clinical Data Manager (Tier 2)
- Clinical Trial Disclosure Manager (Tier 3)

**Recommended Structure:**
```
Head of Clinical Operations (NEW - Parent)
├── Medical Monitor
├── Clinical Study Liaison
├── Clinical Data Manager
└── Clinical Trial Disclosure Manager
```

**Missing:**
- ✨ **Head of Clinical Operations** (Parent for oversight)

**Delegation Triggers:**
- Medical Monitor: "safety", "medical oversight", "protocol", "patient safety"
- Clinical Liaison: "investigator", "site support", "study startup", "enrollment"
- Data Manager: "clinical data", "database", "CDISC", "data quality"
- Disclosure Manager: "trial registration", "results disclosure", "transparency"

---

### 6. Medical Excellence & Governance (3 agents → 4 recommended)

**Current Agents:**
- Medical Excellence Director (Tier 2) ✅ **PARENT**
- Medical Review Committee Coordinator (Tier 2)
- Medical Quality Assurance Manager (Tier 3)

**Recommended Structure:**
```
Medical Excellence Director (Parent)
├── Medical Review Committee Coordinator
└── Medical Quality Assurance Manager
```

**Missing:** 
- ✨ **Compliance & Ethics Specialist** (for regulatory compliance oversight)

**Delegation Triggers:**
- Committee Coordinator: "review", "approval", "governance", "committee"
- QA Manager: "quality", "audit", "SOP", "CAPA", "compliance"
- Compliance Specialist (NEW): "regulatory compliance", "ethics", "FDA", "EMA"

---

### 7. Medical Strategy & Operations (4 agents → 5 recommended)

**Current Agents:**
- Medical Affairs Strategist (Tier 2) ✅ **PARENT**
- Therapeutic Area Expert (Tier 2)
- Global Medical Advisor (Tier 3)
- Medical Affairs Operations Manager (Tier 3)

**Recommended Structure:**
```
Medical Affairs Strategist (Parent)
├── Therapeutic Area Expert
├── Global Medical Advisor
└── Medical Affairs Operations Manager
```

**Missing:**
- ✨ **Medical Analytics Director** (for data-driven insights - we already created this!)

**Delegation Triggers:**
- TA Expert: "therapeutic area", "clinical trial design", "scientific platform"
- Global Advisor: "global strategy", "regional", "international", "global KOL"
- Operations Manager: "operations", "budget", "process", "resources"
- Analytics Director (EXISTING!): "analytics", "data", "insights", "metrics"

---

## Summary: Missing Components

### New Parent Agents Needed (4):
1. ✨ **Director of Medical Information** (Parent for Med Info dept)
2. ✨ **Head of Medical Communications** (Parent for Med Comm dept)
3. ✨ **Director of Evidence & HEOR** (Parent for Evidence dept)
4. ✨ **Head of Clinical Operations** (Parent for Clinical Ops dept)

### New Specialist Agents Needed (1):
5. ✨ **Compliance & Ethics Specialist** (Sub-agent for Excellence dept)

### Already Created (from our first seed):
- ✅ Director of Medical Analytics (can be mapped to Strategy & Operations)
- ✅ Real-World Evidence Analyst (maps to RWE Specialist)
- ✅ Clinical Data Scientist (can be mapped to Evidence & HEOR)
- ✅ Market Insights Analyst (can be mapped to Strategy & Operations)
- ✅ HCP Engagement Analytics Specialist (can be mapped to Field Medical or Strategy)

---

## Total Agent Count After Completion

- **Existing from JSON:** 30 agents
- **New parent agents:** 4
- **New specialist agents:** 1
- **Already seeded:** 5 (can be integrated or kept separate)

**Final count:** 35 Medical Affairs agents + 5 Analytics agents = **40 total agents**

---

## Implementation Strategy

### Phase A: Create Missing Parent Agents (4 agents)
1. Director of Medical Information
2. Head of Medical Communications
3. Director of Evidence & HEOR
4. Head of Clinical Operations

### Phase B: Create Missing Specialist Agent (1 agent)
5. Compliance & Ethics Specialist

### Phase C: Map Hierarchies (35 relationships)
- Create `agent_hierarchies` entries for all parent → child relationships
- Set `auto_delegate = true` and `confidence_threshold = 0.75`
- Define `delegation_trigger` for each relationship

### Phase D: Add Agent Tools (per department)
**Common Tools for All:**
- Literature search tool
- Email composer
- Document generator
- Calendar/scheduler
- CRM integration

**Department-Specific Tools:**
- **Field Medical:** KOL database, CRM, territory mapper
- **Med Information:** Medical inquiry system, adverse event reporter
- **Med Communications:** Publication tracker, congress planner
- **Evidence & HEOR:** Statistical software, HEOR modeling tools
- **Clinical Operations:** Clinical trial management system, EDC
- **Excellence & Governance:** Audit tracker, SOP repository
- **Strategy & Operations:** Analytics dashboard, budget tracker

### Phase E: Phase 1 (GraphRAG) Integration

**RAG Profile Mapping:**
- **Field Medical agents:** `hybrid_enhanced` (60% vector, 40% keyword)
- **Med Information agents:** `semantic_standard` (100% vector)
- **Med Communications agents:** `hybrid_enhanced` (60% vector, 40% keyword)
- **Evidence & HEOR agents:** `graphrag_entity` (40% vector, 20% keyword, 40% graph)
- **Clinical Operations agents:** `semantic_standard` (100% vector)
- **Excellence & Governance agents:** `agent_optimized` (50% vector, 30% keyword, 20% graph)
- **Strategy & Operations agents:** `graphrag_entity` (40% vector, 20% keyword, 40% graph)

**Agent KG Views:**
- Map each agent to relevant KG node/edge types
- Define `max_hops` and `graph_limit` per agent
- Link to `rag_profiles` table

---

## Next Steps

1. ✅ Create 5 new agents (4 parents + 1 specialist)
2. ✅ Map all 35 hierarchical relationships
3. ✅ Define agent tools for each department
4. ✅ Create GraphRAG profile mappings
5. ✅ Generate comprehensive seed file
6. ✅ Test delegation flow
7. ✅ Integrate with Phase 1 services

---

## Files to Create

1. `02_seed_complete_medical_affairs_agents.sql` - All 35 agents
2. `03_seed_medical_affairs_hierarchies.sql` - All hierarchical relationships
3. `04_seed_agent_tools.sql` - Tool assignments per agent
4. `05_seed_agent_rag_profiles.sql` - RAG profile assignments
5. `06_seed_agent_kg_views.sql` - KG view configurations
6. `MEDICAL_AFFAIRS_IMPLEMENTATION_COMPLETE.md` - Documentation

---

**Ready to proceed with implementation?** 🚀

