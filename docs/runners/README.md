# VITAL Platform: Runners & JTBD Documentation

## Overview

This directory contains the world-class documentation for VITAL's runner architecture and Jobs-to-Be-Done (JTBD) framework.

## Document Hierarchy

```
docs/runners/
├── README.md                              # This file
├── CONCEPTUAL_DESIGN_INDEX.md             # Master index of all documents
├── UNIFIED_CONCEPTUAL_MODEL.md            # Foundational architecture model
├── JTBD_HIERARCHICAL_MODEL.md             # 4-level JTBD framework
├── UNIFIED_RUNNER_STRATEGY.md             # Cross-service runner architecture
├── JTBD_RUNNER_MAPPING.md                 # JTBD → Runner routing guide
├── RUNNER_PACKAGE_ARCHITECTURE.md         # World-class runner package design
├── USER_TEMPLATE_EDITOR_ARCHITECTURE.md   # Database-First template UI/UX
├── TASK_COMPOSITION_ARCHITECTURE.md       # Workflow orchestration patterns
└── RECOMMENDED_PROJECT_STRUCTURE.md       # Code organization guide
```

## Reading Order

For a complete understanding, read in this order:

1. **CONCEPTUAL_DESIGN_INDEX.md** - Start here for overview
2. **UNIFIED_CONCEPTUAL_MODEL.md** - Core architecture (Task Formula)
3. **JTBD_HIERARCHICAL_MODEL.md** - JTBD theory and hierarchy
4. **UNIFIED_RUNNER_STRATEGY.md** - Runner architecture
5. **JTBD_RUNNER_MAPPING.md** - How JTBDs map to runners
6. **RUNNER_PACKAGE_ARCHITECTURE.md** - Runner implementation guide
7. **USER_TEMPLATE_EDITOR_ARCHITECTURE.md** - Database-First UI customization
8. **TASK_COMPOSITION_ARCHITECTURE.md** - Workflow orchestration patterns
9. **RECOMMENDED_PROJECT_STRUCTURE.md** - Code organization

## Key Concepts

### The Task Formula
```
TASK = AGENT + RUNNER + SKILL + KNOWLEDGE + PROMPT
       ─────   ──────   ─────   ─────────   ──────
        WHO     WHAT     HOW      WITH      ABOUT
```

### Runner Types
- **Task Runners (88)**: Atomic cognitive operations
- **Family Runners (8)**: Complex multi-step workflows
- **Pharma Runners (119)**: Domain-specific operations

### Orchestration Patterns (8)
Patterns for composing runners into business workflows:
| # | Pattern | Use Case |
|---|---------|----------|
| 1 | Sequential Pipeline | Linear analysis flows |
| 2 | Fan-out/Fan-in | Parallel analysis with merge |
| 3 | Continuous Monitoring | Ongoing tracking tasks |
| 4 | Conditional Branching | Adaptive decision paths |
| 5 | Iterative Refinement | Quality improvement loops |
| 6 | Generator-Critic | Create → evaluate cycles |
| 7 | Saga (Compensating) | Transactional with rollback |
| 8 | Event-Driven | Reactive automation |

### JTBD Hierarchy
- **Level 0 (Strategic)**: Big Hire - Months to years
- **Level 1 (Solution)**: Capability - Weeks to months
- **Level 2 (Workflow)**: Process Job - Hours to days
- **Level 3 (Task)**: Little Hire - Minutes to hours

## Related Resources

| Resource | Location |
|----------|----------|
| Runner Code | `services/ai-engine/src/langgraph_workflows/task_runners/` |
| Database Schema | `database/postgres/migrations/` |
| API Routes | `services/ai-engine/src/api/routes/` |

### Pattern Architecture Levels

| Level | Pattern Type | Count | Scope |
|-------|-------------|-------|-------|
| **Workflow** | Orchestration Patterns | 8 | How runners connect into workflows |
| **Runner** | LangGraph Archetypes | 6 | How single runners execute internally |
| **LLM** | Prompt Patterns | 5 | How LLM thinks (CoT, ToT, ReAct, etc.) |

---

**Version:** 1.1
**Last Updated:** December 2025
