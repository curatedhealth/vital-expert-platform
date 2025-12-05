# Medical Affairs L1-L5 Agent Hierarchy

**Created:** 2025-12-02
**Status:** Production-Ready
**Total Agents:** 47 new agents across 5 levels
**Function:** Medical Affairs

---

## Overview

This document describes the complete 5-level agent hierarchy for Medical Affairs, implementing a fully connected orchestration system with routing, delegation, and coordination capabilities.

## Architecture Diagram

```
                              L1 MASTER (VP Level)
                              ┌─────────────────────┐
                              │   VP Medical Affairs │
                              │   (vp-medical-affairs)│
                              └──────────┬──────────┘
                                         │ routes to
           ┌─────────────────────────────┼─────────────────────────────┐
           │                             │                             │
           ▼                             ▼                             ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  Head of MSL     │        │  Head of Safety  │        │  Head of HEOR    │
│  (head-of-msl)   │        │  (head-of-safety)│        │  (head-of-heor)  │
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         │ L2 EXPERTS (Department Heads) - 8 Total               │
         │                           │                           │
         ▼                           ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│  MSL Specialist  │        │ Safety Scientist │        │ Health Economist │
│ (msl-specialist) │        │(safety-scientist)│        │(health-economist)│
└────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
         │                           │                           │
         │ L3 SPECIALISTS (Manager Level) - 9 Total              │
         │                           │                           │
    ┌────┴────┐                 ┌────┴────┐                 ┌────┴────┐
    ▼         ▼                 ▼         ▼                 ▼         ▼
┌───────┐ ┌───────┐       ┌───────┐ ┌───────┐       ┌───────┐ ┌───────┐
│Context│ │Worker │       │Context│ │Worker │       │Context│ │Worker │
│Enginee│ │       │       │Enginee│ │       │       │Enginee│ │       │
└───┬───┘ └───────┘       └───┬───┘ └───────┘       └───┬───┘ └───────┘
    │                         │                         │
    │ L4 WORKERS (Entry Level) - 7 Workers + 9 Context Engineers
    │                         │                         │
    ▼                         ▼                         ▼
┌───────┐                 ┌───────┐                 ┌───────┐
│ Tools │                 │ Tools │                 │ Tools │
│(L5)   │                 │(L5)   │                 │(L5)   │
└───────┘                 └───────┘                 └───────┘

L5 TOOLS - 13 Total (PubMed, FAERS, FDA Label, NICE, etc.)
```

---

## Level 1: Master (VP Level)

### vp-medical-affairs

| Attribute | Value |
|-----------|-------|
| **Name** | VP Medical Affairs |
| **Slug** | `vp-medical-affairs` |
| **Level** | L1 Master |
| **Department** | Executive |
| **Model** | gpt-4 |
| **Temperature** | 0.2 |
| **Avatar** | `/icons/png/avatars/avatar_0401.png` |

**Responsibilities:**
- Route queries to appropriate L2 Department Heads
- Make enterprise-level Medical Affairs decisions
- Cross-functional coordination with R&D, Commercial, Regulatory
- Budget approval and resource allocation
- Resolve escalations from L2 Heads

**Routing Rules:**
| Keywords | Routes To |
|----------|-----------|
| safety, adverse, AE, signal | head-of-safety (PRIORITY 1) |
| msl, field, territory | head-of-msl |
| inquiry, response, label | head-of-medinfo |
| publication, manuscript | head-of-medcomms |
| economic, HTA, NICE, ICER | head-of-heor |
| kol, thought leader, advisory | head-of-kol |
| education, CME, training | head-of-meded |
| strategy, competitive, pipeline | head-of-medstrategy |

---

## Level 2: Experts (Department Heads)

| Slug | Name | Department | Budget Authority |
|------|------|------------|------------------|
| `head-of-msl` | Head of MSL Operations | MSL Operations | $500,000 |
| `head-of-medinfo` | Head of Medical Information | Medical Information | $300,000 |
| `head-of-medcomms` | Head of Medical Communications | Medical Communications | $400,000 |
| `head-of-safety` | Head of Pharmacovigilance | Pharmacovigilance | $600,000 |
| `head-of-heor` | Head of HEOR | HEOR | $800,000 |
| `head-of-kol` | Head of KOL Management | KOL Management | $700,000 |
| `head-of-meded` | Head of Medical Education | Medical Education | $500,000 |
| `head-of-medstrategy` | Head of Medical Strategy | Medical Strategy | $400,000 |

### L2 Configuration
- **Model:** gpt-4
- **Temperature:** 0.3
- **Max Tokens:** 4,000
- **Context Window:** 12,000
- **Cost per Query:** $0.25

### L2 Responsibilities
- Strategic decision-making for department
- Orchestrate L3 Specialists
- Approve budgets, contracts, plans
- Quality oversight
- Report to VP Medical Affairs

---

## Level 3: Specialists (Manager Level)

| Slug | Name | Department | Delegates To |
|------|------|------------|--------------|
| `msl-specialist` | MSL Specialist | MSL Operations | msl-context-engineer, msl-activity-coordinator |
| `medinfo-scientist` | Medical Information Scientist | Medical Information | medinfo-context-engineer, medical-information-specialist |
| `medical-writer` | Medical Writer | Medical Communications | medcomms-context-engineer, publication-coordinator |
| `safety-scientist` | Safety Scientist | Pharmacovigilance | safety-context-engineer, safety-case-processor |
| `health-economist` | Health Economist | HEOR | heor-context-engineer, heor-coordinator |
| `kol-strategist` | KOL Strategist | KOL Management | kol-context-engineer, kol-engagement-coordinator |
| `meded-specialist` | Medical Education Specialist | Medical Education | meded-context-engineer, meded-coordinator |
| `medstrategy-analyst` | Medical Strategy Analyst | Medical Strategy | medstrategy-context-engineer, strategy-coordinator |
| `medaffairs-generalist` | Medical Affairs Generalist | General | generic-context-engineer |

### L3 Configuration
- **Model:** gpt-4
- **Temperature:** 0.4
- **Max Tokens:** 3,000
- **Context Window:** 8,000
- **Cost per Query:** $0.12

### L3 Responsibilities
- Domain expertise and decision-making
- Delegate to L4 Workers and Context Engineers
- Quality review and task approval
- Escalate to L2 when needed

---

## Level 4: Workers & Context Engineers

### L4 Context Engineers (Data Retrieval Orchestrators)

| Slug | Department | Coordinates Tools | Coordinates Workers |
|------|------------|-------------------|---------------------|
| `msl-context-engineer` | MSL Operations | PubMed, ClinicalTrials, KOL, Web | msl-activity-coordinator |
| `medinfo-context-engineer` | Medical Information | FDA Label, RAG, PubMed, Drug Interaction | medical-information-specialist |
| `medcomms-context-engineer` | Medical Communications | PubMed, Congress Calendar, Cochrane | publication-coordinator |
| `safety-context-engineer` | Pharmacovigilance | FAERS, MedDRA, WHO-UMC, PubMed | safety-case-processor |
| `heor-context-engineer` | HEOR | NICE, ICER, PubMed, Cochrane | heor-coordinator |
| `kol-context-engineer` | KOL Management | KOL Profile, PubMed, Congress | kol-engagement-coordinator |
| `meded-context-engineer` | Medical Education | PubMed, RAG, Web, Congress | meded-coordinator |
| `medstrategy-context-engineer` | Medical Strategy | ClinicalTrials, Web, PubMed | strategy-coordinator |
| `generic-context-engineer` | General | Web Search, RAG, Calculator | - |

### L4 Workers (Task Executors)

| Slug | Name | Department | Task Types |
|------|------|------------|------------|
| `msl-activity-coordinator` | MSL Activity Coordinator | MSL Operations | log_engagement, update_crm, track_kol_interaction |
| `medical-information-specialist` | Medical Information Specialist | Medical Information | log_inquiry, process_response, track_sla |
| `publication-coordinator` | Publication Coordinator | Medical Communications | track_manuscript, update_status, alert_deadline |
| `medcomms-coordinator` | MedComms Coordinator | Medical Communications | log_submission, track_author_forms |
| `safety-case-processor` | Safety Case Processor | Pharmacovigilance | log_case, code_meddra, track_expedited |
| `heor-coordinator` | HEOR Coordinator | HEOR | log_model_input, track_hta_submission |
| `kol-engagement-coordinator` | KOL Engagement Coordinator | KOL Management | log_interaction, update_profile, schedule_followup |
| `meded-coordinator` | MedEd Coordinator | Medical Education | log_program, track_attendance, update_assessments |
| `strategy-coordinator` | Strategy Coordinator | Medical Strategy | log_competitive_intel, update_landscape |

### L4 Configuration
- **Model:** gpt-3.5-turbo
- **Temperature:** 0.3-0.5
- **Max Tokens:** 1,500-2,000
- **Context Window:** 3,000-4,000
- **Cost per Query:** $0.015

---

## Level 5: Tools (Atomic Operations)

### Generic Tools
| Slug | Purpose | Response Time |
|------|---------|---------------|
| `web-search-tool` | General web search | 2000ms |
| `rag-search-tool` | Internal knowledge retrieval | 1000ms |
| `calculator-tool` | Arithmetic operations | 500ms |

### Safety Tools
| Slug | Purpose | Response Time |
|------|---------|---------------|
| `faers-search-tool` | FDA Adverse Event search | 3000ms |
| `meddra-lookup-tool` | MedDRA term lookup | 1000ms |
| `who-umc-tool` | WHO-UMC signal database | 3000ms |
| `drug-interaction-tool` | Drug interaction check | 1000ms |

### HTA/HEOR Tools
| Slug | Purpose | Response Time |
|------|---------|---------------|
| `nice-evidence-tool` | NICE Evidence Search | 2000ms |
| `icer-database-tool` | ICER value assessments | 2000ms |
| `cochrane-search-tool` | Cochrane systematic reviews | 2000ms |

### Clinical Tools
| Slug | Purpose | Response Time |
|------|---------|---------------|
| `pubmed-search-tool` | PubMed literature search | 2000ms |
| `clinicaltrials-search-tool` | ClinicalTrials.gov search | 2000ms |
| `fda-label-tool` | FDA drug label lookup | 1500ms |
| `kol-profile-tool` | KOL profile retrieval | 1000ms |
| `congress-calendar-tool` | Congress/conference dates | 1000ms |

### L5 Configuration
- **Model:** gpt-3.5-turbo
- **Temperature:** 0.2
- **Max Tokens:** 500
- **Response Time:** <1000ms target
- **Cost per Query:** $0.005

---

## Database Tables

### Hierarchy Relationship Tables

```sql
-- L1 → L2 Routing
l1_l2_routing (
  master_id UUID,
  expert_id UUID,
  routing_keywords TEXT[],
  routing_priority INT
)

-- L2 → L3 Orchestration
l2_l3_orchestration (
  expert_id UUID,
  specialist_id UUID,
  delegation_types TEXT[],
  is_primary BOOLEAN
)

-- L3 → L4 Delegation
l3_l4_delegation (
  specialist_id UUID,
  worker_id UUID,
  worker_type TEXT,  -- 'context_engineer' | 'worker'
  task_types TEXT[]
)

-- L4 Context Engineer → L5 Tool Permissions
l4_l5_tool_permissions (
  context_engineer_id UUID,
  tool_id UUID,
  is_primary BOOLEAN,
  usage_priority INT,
  timeout_ms INT
)

-- L4 Context Engineer → L4 Worker Coordination
l4_worker_coordination (
  context_engineer_id UUID,
  worker_id UUID,
  task_types TEXT[],
  is_required BOOLEAN
)
```

### Hierarchy View

```sql
-- Query the complete hierarchy
SELECT * FROM v_medical_affairs_hierarchy
ORDER BY level_num, department_name;
```

---

## System Prompt Framework

All agents use the 6-Section System Prompt Framework:

### 1. YOU ARE
Specific role and unique positioning

### 2. YOU DO
3-7 specific capabilities with measurable outcomes

### 3. YOU NEVER
3-5 safety-critical boundaries with rationale

### 4. SUCCESS CRITERIA
Measurable performance targets

### 5. WHEN UNSURE
Escalation protocol with confidence thresholds

### 6. EVIDENCE REQUIREMENTS
- What sources to cite
- Evidence hierarchy
- Confidence requirements

---

## Migration Files

| Migration | Contents |
|-----------|----------|
| `020_l4_context_engineers_department_specific.sql` | 9 L4 Context Engineers |
| `020a_context_engineers_worker_coordination.sql` | Worker coordination updates |
| `021_l5_tools_comprehensive.sql` | 13 L5 Tools |
| `022_l4_coordination_mapping.sql` | Coordination tables & views |
| `023_l4_workers_missing.sql` | 7 L4 Workers |
| `024_l3_specialists_department_specific.sql` | 9 L3 Specialists |
| `025_l2_experts_department_heads.sql` | 8 L2 Experts |
| `026_l1_master_vp_medical_affairs.sql` | 1 L1 Master + hierarchy tables |

---

## Usage Examples

### Query Routing (L1)
```
User: "I received an adverse event report"
VP Medical Affairs: Routes to head-of-safety (priority routing for safety)
```

### Delegation Chain (Full)
```
1. L1 VP → Routes "HTA submission for NICE" to head-of-heor
2. L2 Head of HEOR → Delegates to health-economist
3. L3 Health Economist → Requests data from heor-context-engineer
4. L4 Context Engineer → Orchestrates nice-evidence-tool, icer-database-tool
5. L5 Tools → Return search results
6. Data flows back up: L5 → L4 → L3 → L2 → User
```

### Safety Critical Path
```
Safety-related queries ALWAYS:
1. Route immediately to head-of-safety (priority 1)
2. safety-scientist uses safety-context-engineer
3. safety-case-processor logs all cases
4. Expedited reporting tracked automatically
```

---

## Appendix: Agent Counts by Level

| Level | Role | Count |
|-------|------|-------|
| L1 | Master (VP) | 1 |
| L2 | Expert (Director) | 8 |
| L3 | Specialist (Manager) | 9 |
| L4 | Worker | 7 |
| L4 | Context Engineer | 9 |
| L5 | Tool | 13 |
| **Total** | | **47** |

---

*Last Updated: 2025-12-02*
