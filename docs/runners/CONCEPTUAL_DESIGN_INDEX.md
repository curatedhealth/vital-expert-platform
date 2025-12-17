# VITAL Platform: Conceptual Design Index
## Complete Reference for Platform Architecture

**Version:** 1.0
**Date:** December 2025
**Status:** Gold Standard Documentation

---

# Document Overview

This index provides a complete reference to all conceptual design documents for the VITAL platform. These documents define the **world-class architecture** for Jobs-to-Be-Done, Runners, Agents, and Services.

---

# Document Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VITAL CONCEPTUAL DESIGN DOCUMENTS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FOUNDATIONAL                                                                │
│  ════════════                                                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ UNIFIED_CONCEPTUAL_MODEL.md                                          │   │
│  │ ───────────────────────────                                          │   │
│  │ The master document that explains how all components fit together:   │   │
│  │ • Task Formula: AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT          │   │
│  │ • Agent OS Levels (L1-L5)                                            │   │
│  │ • Knowledge Stack                                                     │   │
│  │ • End-to-End Execution Flow                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  JTBD FRAMEWORK                                                              │
│  ══════════════                                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ JTBD_HIERARCHICAL_MODEL.md                                           │   │
│  │ ─────────────────────────                                            │   │
│  │ World-class hierarchical JTBD framework based on Ulwick & Christensen│   │
│  │ • 4-Level Hierarchy (Strategic → Solution → Workflow → Task)         │   │
│  │ • 2D Job Matrix (Level × Step = Runner)                              │   │
│  │ • 3 Job Dimensions (Functional, Emotional, Social)                   │   │
│  │ • Schema Enhancements (emotional_jobs, social_jobs, related_jobs)    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  RUNNER ARCHITECTURE                                                         │
│  ═══════════════════                                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ UNIFIED_RUNNER_STRATEGY.md                                           │   │
│  │ ─────────────────────────                                            │   │
│  │ Complete runner architecture for all services:                       │   │
│  │ • Task Runners (88 atomic cognitive operations)                      │   │
│  │ • Family Runners (8 complex multi-step workflows)                    │   │
│  │ • Unified Registry Architecture                                      │   │
│  │ • Service Integration Patterns                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ JTBD_RUNNER_MAPPING.md                                               │   │
│  │ ─────────────────────                                                │   │
│  │ Practical implementation guide for JTBD → Runner mapping:            │   │
│  │ • Complete 2D Matrix (Level × Step = Runner)                         │   │
│  │ • Routing Logic & Selection Algorithms                               │   │
│  │ • Implementation Patterns                                            │   │
│  │ • Database Schema & Seeds                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  PROJECT STRUCTURE                                                           │
│  ═════════════════                                                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RECOMMENDED_PROJECT_STRUCTURE.md                                     │   │
│  │ ───────────────────────────────                                      │   │
│  │ Complete code organization for ai-engine:                            │   │
│  │ • Directory Structure                                                 │   │
│  │ • Module Organization                                                 │   │
│  │ • 215 Total Runners (8 Family + 88 Cognitive + 119 Pharma)          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  RUNNER IMPLEMENTATION                                                       │
│  ════════════════════                                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RUNNER_PACKAGE_ARCHITECTURE.md                                       │   │
│  │ ─────────────────────────────                                        │   │
│  │ World-class 13-component package structure for all runners:          │   │
│  │ • 5 Prompt Patterns (CoT, ToT, ReAct, Self-Critique, Meta-Prompting)│   │
│  │ • 6 LangGraph Workflow Archetypes                                    │   │
│  │ • Pydantic Schemas, Evaluation, HITL, MCP Integration               │   │
│  │ • Testing, Monitoring, Governance Standards                          │   │
│  │ • Database-First Template Architecture (Part 15)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  USER TEMPLATE CUSTOMIZATION                                                │
│  ═══════════════════════════                                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ USER_TEMPLATE_EDITOR_ARCHITECTURE.md                                 │   │
│  │ ───────────────────────────────────                                  │   │
│  │ Database-First architecture for user template customization:         │   │
│  │ • Frontend UI/UX with Template Browser and Multi-Tab Editor         │   │
│  │ • API Design for template CRUD operations                           │   │
│  │ • Runtime Integration with get_effective_template()                 │   │
│  │ • Version Control and YAML Export (backup only)                     │   │
│  │ • Database Schema: user_runner_templates, prompts, models, etc.     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  WORKFLOW ORCHESTRATION                                                     │
│  ══════════════════════                                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ TASK_COMPOSITION_ARCHITECTURE.md                                     │   │
│  │ ───────────────────────────────                                      │   │
│  │ Orchestrate runners into business workflows:                         │   │
│  │ • TaskDefinition Schema (Pydantic with HITL)                        │   │
│  │ • 8 Orchestration Patterns:                                         │   │
│  │   - Sequential, Fan-out/Fan-in, Monitoring, Conditional             │   │
│  │   - Iterative Refinement, Generator-Critic, Saga, Event-Driven     │   │
│  │ • Database Schema for compositions and executions                    │   │
│  │ • LangGraph Integration with pattern-specific builders              │   │
│  │ • Pre-Composed Workflows (Quick Positioning, Brand Plan, etc.)      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  VISUAL WORKFLOW DESIGNER                                                   │
│  ════════════════════════                                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ WORKFLOW_DESIGNER_RUNNER_INTEGRATION.md                             │   │
│  │ ──────────────────────────────────────                              │   │
│  │ Runners as first-class workflow nodes in ReactFlow designer:        │   │
│  │ • 215 Runners as draggable node types                               │   │
│  │ • Hierarchical palette (22 categories + 8 families)                 │   │
│  │ • Visual → JSON → LangGraph translation pipeline                    │   │
│  │ • RunnerNode schema with input/output mapping                       │   │
│  │ • Backend registry handler for runner execution                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  BACKEND ARCHITECTURE & MIGRATION                                           │
│  ════════════════════════════════                                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GOLD_STANDARD_BACKEND_ARCHITECTURE.md                               │   │
│  │ ────────────────────────────────────                                │   │
│  │ Current state analysis and migration roadmap for ai-engine:         │   │
│  │ • Current State: 709 files, 256 directories mapped                  │   │
│  │ • Gap Analysis: 6 critical gaps identified                          │   │
│  │ • Target State: 8-layer world-class architecture                    │   │
│  │ • Migration Plan: 6 phases with commands and scripts                │   │
│  │ • Service Classification: 80 flat files → organized domains        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# Quick Reference

## The Core Formula

```
TASK = AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT
       ─────   ──────   ─────   ─────────   ──────
        WHO     WHAT     HOW      WITH      ABOUT
```

## The 4-Level JTBD Hierarchy

| Level | Name | Alias | Duration | Service | Runner | AI Mode |
|-------|------|-------|----------|---------|--------|---------|
| **0** | Strategic JTBD | Big Hire | Months-Years | L5 | Orchestrator | REDESIGN |
| **1** | Solution JTBD | Capability | Weeks-Months | L4 | Solution Orch | ORCHESTRATE |
| **2** | Workflow JTBD | Process Job | Hours-Days | L3 | Family Runner | AUTOMATE |
| **3** | Task JTBD | Little Hire | Minutes-Hours | L1-L2 | Task Runner | AUGMENT |

## The 2D Job Matrix

```
                │ DEFINE │ LOCATE │ PREPARE │ CONFIRM │ EXECUTE │ CONCLUDE │
────────────────┼────────┼────────┼─────────┼─────────┼─────────┼──────────│
STRATEGIC (L5)  │ Vision │ Intel  │ Roadmap │ Align   │ Solution│ Review   │
SOLUTION (L4)   │ Scope  │ Gather │ Sequence│ Validate│ Workflow│ Integrate│
WORKFLOW (L3)   │ Goal   │ RAG+Web│ Decompose│ Confirm │ Family  │ Narrate  │
TASK (L1-L2)    │ Input  │ Context│ Compose │ Schema  │ Task    │ Format   │
```

## Agent OS Levels

| Level | Service | Use Case | Runner Type |
|-------|---------|----------|-------------|
| **L1** | Ask Expert | Single expert, quick response | Task Runner |
| **L2** | Ask Panel | Multi-expert, parallel | Task Runners |
| **L3** | Workflow | Multi-step, streaming | Family Runner |
| **L4** | Solution | Multi-workflow, phased | Solution Orchestrator |
| **L5** | Strategic Advisor | Persistent, long-term | Strategic Orchestrator |

## Family Runners (8)

| Family | Reasoning Pattern | Use Case |
|--------|-------------------|----------|
| DEEP_RESEARCH | ToT → CoT → Reflection | Research & Analysis |
| STRATEGY | Scenario → SWOT → Roadmap | Strategic Planning |
| EVALUATION | MCDA Scoring | Decision Support |
| INVESTIGATION | RCA → Bayesian | Root Cause Analysis |
| PROBLEM_SOLVING | Hypothesis → Test → Iterate | Problem Resolution |
| COMMUNICATION | Audience → Format → Review | Content Creation |
| MONITORING | Baseline → Delta → Alert | Tracking |
| GENERIC | Plan → Execute → Review | Default |

## Task Runner Categories (22)

| Category | Purpose | Example Runners |
|----------|---------|-----------------|
| UNDERSTAND | Comprehension | Scan, Explore, Extract |
| EVALUATE | Assessment | Critique, Score, Compare |
| DECIDE | Decision | Frame, Recommend, Tradeoff |
| CREATE | Generation | Draft, Expand, Format |
| SYNTHESIZE | Integration | Collect, Theme, Narrate |
| VALIDATE | QA | FactCheck, ComplianceCheck |
| PLAN | Planning | Decompose, Schedule, Resource |
| WATCH | Monitoring | Baseline, Delta, Alert, Trend |

---

# Implementation Priority

## Phase 1: Schema Enhancements
1. Add hierarchy columns to `jtbd` table
2. Create `jtbd_emotional_jobs` table
3. Create `jtbd_social_jobs` table
4. Create `jtbd_related_jobs` table
5. Create `jtbd_runner_mappings` table

## Phase 2: Runner Unification
1. Create unified runner registry
2. Merge task_runners and modes34/runners
3. Implement `get_runner_for_jtbd()` function
4. Implement family runner selection

## Phase 3: Mode 3 Integration
1. Wire template_family to family runner lookup
2. Replace hardcoded generic runner
3. Add job step tracking
4. Test all 8 family runners

## Phase 4: Complete Service Integration
1. Update Ask Expert modes
2. Update Ask Panel service
3. Update Workflow service
4. Update Solution service

---

# Document Locations

| Document | Path |
|----------|------|
| Unified Conceptual Model | `docs/runners/UNIFIED_CONCEPTUAL_MODEL.md` |
| JTBD Hierarchical Model | `docs/runners/JTBD_HIERARCHICAL_MODEL.md` |
| Unified Runner Strategy | `docs/runners/UNIFIED_RUNNER_STRATEGY.md` |
| JTBD Runner Mapping | `docs/runners/JTBD_RUNNER_MAPPING.md` |
| Runner Package Architecture | `docs/runners/RUNNER_PACKAGE_ARCHITECTURE.md` |
| User Template Editor Architecture | `docs/runners/USER_TEMPLATE_EDITOR_ARCHITECTURE.md` |
| Task Composition Architecture | `docs/runners/TASK_COMPOSITION_ARCHITECTURE.md` |
| Workflow Designer Integration | `docs/runners/WORKFLOW_DESIGNER_RUNNER_INTEGRATION.md` |
| **World-Class Project Structure** | `docs/runners/WORLD_CLASS_PROJECT_STRUCTURE.md` |
| **Gold Standard Backend Architecture** | `docs/runners/GOLD_STANDARD_BACKEND_ARCHITECTURE.md` |
| Recommended Project Structure | `docs/runners/RECOMMENDED_PROJECT_STRUCTURE.md` |
| Conceptual Design Index | `docs/runners/CONCEPTUAL_DESIGN_INDEX.md` (this file) |

---

# Related Platform Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| JTBD Schema | `.claude/docs/platform/jtbds/` | Database schema for JTBD |
| Work Hierarchy Gold Standard | `.claude/docs/platform/jtbds/04-docs/01-gold-standard/` | Work hierarchy standards |
| Ask Expert PRD | `.claude/docs/services/ask-expert/ASK_EXPERT_PRD/` | Product requirements |
| Ask Expert ARD | `.claude/docs/services/ask-expert/ASK_EXPERT_ARD/` | Architecture design |
| Panel/Workflow/Runner Linkages | `database/postgres/migrations/20251217_panel_workflow_task_runner_linkages.sql` | Database migration |
| User Template Tables | `database/postgres/migrations/20251217_user_runner_templates.sql` | User template schema |

---

# Key Insights Summary

## From Tony Ulwick (ODI)
- Every job follows 8 universal steps: Define, Locate, Prepare, Confirm, Execute, Monitor, Modify, Conclude
- These steps apply at EVERY level of the hierarchy
- Outcomes can be measured with ODI opportunity scores

## From Clayton Christensen
- Jobs have 3 dimensions: Functional, Emotional, Social
- "Big Hire" vs "Little Hire" determines service complexity
- Progress is the key metric, not features

## From VITAL Architecture
- Task Formula combines all components into atomic execution
- Agent OS levels map cleanly to JTBD hierarchy
- Runners provide the cognitive algorithms at each level
- Knowledge stack provides domain context

---

# Theoretical Foundation Summary

## Core Academic Sources

All conceptual design documents are grounded in peer-reviewed research and industry best practices:

### Jobs-to-Be-Done (JTBD) Theory

| Source | Key Contribution | Document |
|--------|------------------|----------|
| **Ulwick (2016)** *Jobs to be Done: Theory to Practice* | 8 universal job steps, ODI methodology | JTBD_HIERARCHICAL_MODEL |
| **Christensen (2016)** *Competing Against Luck* | Big Hire/Little Hire, 3 job dimensions | JTBD_HIERARCHICAL_MODEL |
| **Bettencourt & Ulwick (2008)** HBR "Customer-Centered Innovation Map" | Job mapping framework | All documents |

### AI Agent Cognitive Patterns

| Source | Key Contribution | Document |
|--------|------------------|----------|
| **Wei et al. (2022)** "Chain-of-Thought Prompting" NeurIPS | CoT reasoning patterns | UNIFIED_CONCEPTUAL_MODEL |
| **Yao et al. (2023)** "Tree of Thoughts" NeurIPS | ToT deliberate problem solving | JTBD_RUNNER_MAPPING |
| **Yao et al. (2023)** "ReAct" ICLR | Reasoning + Action loops | UNIFIED_RUNNER_STRATEGY |
| **Shinn et al. (2023)** "Reflexion" NeurIPS | Self-reflection patterns | JTBD_RUNNER_MAPPING |

### Enterprise Process Frameworks

| Source | Key Contribution | Document |
|--------|------------------|----------|
| **SAFe 6.0** (Scaled Agile, 2023) | Epic → Story hierarchy | JTBD_HIERARCHICAL_MODEL |
| **APQC PCF v8.0** (2023) | Process classification | JTBD_RUNNER_MAPPING |
| **ISO 9001:2015** | Quality management hierarchy | JTBD_HIERARCHICAL_MODEL |
| **PMBOK 7th Edition** | Work breakdown structure | All documents |

### Decision Analysis

| Source | Key Contribution | Document |
|--------|------------------|----------|
| **Greco et al. (2016)** *Multiple Criteria Decision Analysis* | MCDA methodology | JTBD_RUNNER_MAPPING |
| **Saaty (2008)** AHP method | Decision scoring | UNIFIED_RUNNER_STRATEGY |

## Evidence Summary

### Industry Validation

- **Strategyn (Ulwick):** 86% success rate using ODI vs. 17% industry average
- **SAFe Adoption:** 37% of scaled agile implementations use SAFe hierarchy
- **APQC PCF:** Used by 80% of Fortune 500 for process benchmarking

### AI Research Effectiveness

- **Chain-of-Thought:** +40% accuracy on reasoning tasks
- **Tree-of-Thought:** +74% on complex problem solving
- **ReAct:** +55% on knowledge-intensive tasks
- **RAG augmentation:** +50% factual accuracy

### Pharmaceutical Industry Impact

- Market research time savings: 50-70%
- Competitive intelligence time savings: 40-60%
- Medical writing time savings: 30-50%

---

# Quick Links to Appendices

| Document | Appendix | Content |
|----------|----------|---------|
| JTBD_HIERARCHICAL_MODEL | Appendix A | Theoretical Foundation & Academic Sources |
| JTBD_HIERARCHICAL_MODEL | Appendix B | Empirical Validation |
| UNIFIED_CONCEPTUAL_MODEL | Appendix | Theoretical Foundation |
| JTBD_RUNNER_MAPPING | Appendix B | Theoretical Foundation for Runner Selection |
| JTBD_RUNNER_MAPPING | Appendix C | Complete Category-to-Runner Reference |

---

**Version History:**
- v1.5 (Dec 2025): Added World-Class Project Structure (CANONICAL)
- v1.4 (Dec 2025): Added Workflow Designer Runner Integration document
- v1.3 (Dec 2025): Added Task Composition Architecture document
- v1.2 (Dec 2025): Added User Template Editor Architecture document
- v1.1 (Dec 2025): Added theoretical foundation summary
- v1.0 (Dec 2025): Initial conceptual design index

---

*End of Document*
