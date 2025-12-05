# VITAL Platform Prompt Architecture

## Overview

The VITAL platform uses a hierarchical prompt system that connects:
- **Prompt Starters** (quick conversation initiators)
- **Rich Prompts** (detailed prompt templates with context)
- **Prompt Suites** (grouped prompts by domain)
- **Agents** (AI agents that use prompts)

## Data Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROMPT HIERARCHY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  prompt_suites (10)                                                 │
│       │                                                             │
│       ├── suite_industries (many-to-many with industries)           │
│       ├── suite_tenants (many-to-many with tenants)                │
│       ├── suite_functions (many-to-many with functions)            │
│       │                                                             │
│       └── prompt_sub_suites (51)                                   │
│               │                                                     │
│               └── suite_prompts                                     │
│                       │                                             │
│                       └── prompts (1,623)                          │
│                               │                                     │
│                               └── agent_prompt_starters             │
│                                       │                             │
│                                       └── agents (1,138)           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tables

### Core Tables

| Table | Purpose | Count |
|-------|---------|-------|
| `prompts` | Rich detailed prompts with full context | 1,623 |
| `agent_prompt_starters` | Quick starters linked to agents | 7,871 |
| `prompt_suites` | Domain groupings (RULES™, TRIALS™, etc.) | 10 |
| `prompt_sub_suites` | Sub-groupings within suites | 51 |

### Junction Tables

| Table | Purpose |
|-------|---------|
| `suite_prompts` | Links prompts to suites/sub-suites |
| `suite_industries` | Maps suites to industries (shared resources) |
| `suite_tenants` | Maps suites to tenants |
| `suite_functions` | Maps suites to business functions |
| `suite_departments` | Maps suites to departments |

## Prompt Suites

| Code | Name | Domain |
|------|------|--------|
| RULES™ | Regulatory Intelligence | Regulatory Affairs |
| TRIALS™ | Clinical Development | Clinical Operations |
| GUARD™ | Safety & Pharmacovigilance | Drug Safety |
| VALUE™ | Market Access & HEOR | Market Access |
| BRIDGE™ | Medical Affairs | Medical Affairs |
| PROOF™ | Evidence Generation | Real-World Evidence |
| CRAFT™ | Medical Writing | Scientific Communications |
| SCOUT™ | Competitive Intelligence | Strategy |
| PROJECT™ | Project Management | Operations |
| FORGE™ | Digital Health | Innovation |

## Level-Appropriate Prompts

Prompts are aligned with agent levels based on the **VITAL 5-Level Hierarchy**:

```
┌─────────┬───────────────────────┬───────────────┬──────────────────────────────────┐
│ Level   │ Role                  │ Seniority     │ Prompt Scope                     │
├─────────┼───────────────────────┼───────────────┼──────────────────────────────────┤
│ L1      │ Head of FUNCTION      │ VP/Chief      │ Strategic, cross-department      │
│ L2      │ Head of DEPARTMENT    │ Director      │ Departmental, team coordination  │
│ L3      │ SPECIALIST            │ Manager       │ Domain expertise, task execution │
│ L4      │ WORKER                │ Entry         │ Repetitive, process execution    │
│ L5      │ TOOL                  │ Intern        │ Single-function, clear I/O       │
└─────────┴───────────────────────┴───────────────┴──────────────────────────────────┘
```

### L1 Master (Head of Function - VP/Chief Level)
- **Scope:** Function-wide strategic decisions
- **Examples:** CMO, VP Medical Affairs
- Strategic planning and resource allocation
- Cross-departmental coordination
- C-suite interface and board presentations
- Crisis response and organizational transformation
- **Char length:** 150-300 chars

### L2 Expert (Head of Department - Director Level)
- **Scope:** Department-wide tactical execution
- **Examples:** Head of MSL Ops, Head of Publications
- Team resource planning and coordination
- Departmental KPIs and performance
- Cross-team collaboration
- Launch execution and capacity planning
- **Char length:** 120-200 chars

### L3 Specialist (Domain Expert - Manager Level)
- **Scope:** Domain expertise application
- **Examples:** Clinical Pharmacologist, Regulatory Specialist
- Expert analysis and recommendations
- Evidence-based deliverables
- Domain-specific task execution
- Quality and compliance work
- **Char length:** 80-150 chars

### L4 Worker (Entry Level - Cross-Functional)
- **Scope:** Repetitive, process-driven tasks
- **Examples:** Medical Info Specialist, Data Entry Coordinator
- SOP-based task execution
- Document processing and formatting
- Activity logging and tracking
- Report generation
- **Char length:** 60-100 chars

### L5 Tool (Intern Level - Cross-Functional Utilities)
- **Scope:** Single-function utilities
- **Examples:** PubMed Search, Dosing Calculator
- Literature search and lookups
- Statistical calculations
- Code/status lookups
- Format conversion
- **Char length:** 50-100 chars

## Key Relationships

### Agent → Starters → Rich Prompts

```sql
-- Each agent has 4-6 prompt starters
agent_prompt_starters (
  agent_id UUID REFERENCES agents(id),
  prompt_id UUID REFERENCES prompts(id),  -- Links to rich prompt
  text TEXT,           -- Short starter text
  icon TEXT,           -- Display icon
  category TEXT,       -- clinical, regulatory, safety, etc.
  sequence_order INT   -- Display order
)
```

### Suite → Industries (Shared Resources)

```sql
-- Suites are shared across industries
suite_industries (
  suite_id UUID REFERENCES prompt_suites(id),
  industry_id UUID REFERENCES industries(id),
  is_primary BOOLEAN,
  relevance_score INT  -- 1-10
)
```

## Files in This Directory

```
prompts/
├── PROMPT_ARCHITECTURE.md           (this file)
├── PROMPT_STARTER_STANDARDS.md      (quality guidelines)
├── USER_PROMPT_GOLD_STANDARD.md     (comprehensive L1-L5 user prompt templates)
├── migrations/
│   ├── 015_medical_affairs_prompt_starters.sql
│   └── 016_medical_affairs_rich_prompts_v3.sql
├── templates/
│   ├── L1_MASTER_TEMPLATES.md       (Head of Function - VP/Chief)
│   ├── L2_EXPERT_TEMPLATES.md       (Head of Department - Director)
│   ├── L3_SPECIALIST_TEMPLATES.md   (Domain Expert - Manager)
│   ├── L4_WORKER_TEMPLATES.md       (Entry Level - Cross-Functional)
│   └── L5_TOOL_TEMPLATES.md         (Intern Level - Utilities)
└── standards/
    └── QUALITY_CHECKLIST.md
```
