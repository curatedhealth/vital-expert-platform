# VITAL Platform - Work Hierarchy Gold Standard

**Date:** 2025-11-19
**Standards:** APQC PCF, ISO 9001, PMBOK, PRINCE2

---

## Executive Summary

The VITAL platform maintains **two parallel hierarchies**:

1. **Operations (Process-Based)** - Recurring, repeatable, capability-based work
2. **Projects (Change-Based)** - Temporary, outcome-based initiatives

Both share common lower levels (Task, Step) but differ at higher levels.

---

## Dual Hierarchy Structure

### Operations Hierarchy (APQC/ISO Standard)

```
PROCESS
    ↓
ACTIVITY
    ↓
TASK
    ↓
STEP
```

| Level | Definition | Duration | Owner | Example |
|-------|------------|----------|-------|---------|
| **Process** | End-to-end value stream | Days-Weeks | Process Owner | "Patient Onboarding" |
| **Activity** | Major building block within process | Hours-Days | Activity Lead | "Collect Patient Data" |
| **Task** | Discrete unit performed by role/system | Minutes-Hours | Agent/Human | "Verify Consent Form" |
| **Step** | Atomic action, indivisible | Seconds-Minutes | System | "Check Signature Date" |

### Projects Hierarchy (PMBOK/PRINCE2 Standard)

```
PROJECT
    ↓
PHASE
    ↓
WORK PACKAGE
    ↓
TASK
    ↓
STEP
```

| Level | Definition | Duration | Owner | Example |
|-------|------------|----------|-------|---------|
| **Project** | Temporary endeavor, unique output | Weeks-Months | Project Manager | "Launch Telehealth Module" |
| **Phase** | Logical time sequence | Days-Weeks | Phase Lead | "Design Phase" |
| **Work Package** | Decomposed WBS unit, owned end-to-end | Hours-Days | Team Lead | "Build Patient Portal UI" |
| **Task** | Schedulable work with duration/effort | Minutes-Hours | Agent/Human | "Create Login Screen" |
| **Step** | Micro action by one person/system | Seconds-Minutes | System | "Render Form Component" |

---

## Visual Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VITAL WORK HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  OPERATIONS DOMAIN                    PROJECTS DOMAIN                    │
│  (Process-Based)                      (Change-Based)                     │
│  ════════════════                     ═══════════════                    │
│                                                                          │
│  ┌─────────────┐                      ┌─────────────┐                   │
│  │   PROCESS   │                      │   PROJECT   │                   │
│  │ Value stream│                      │ Unique output│                   │
│  └──────┬──────┘                      └──────┬──────┘                   │
│         │                                    │                           │
│         ▼                                    ▼                           │
│  ┌─────────────┐                      ┌─────────────┐                   │
│  │  ACTIVITY   │                      │    PHASE    │                   │
│  │ Building blk│                      │ Time sequence│                   │
│  └──────┬──────┘                      └──────┬──────┘                   │
│         │                                    │                           │
│         │                                    ▼                           │
│         │                             ┌─────────────┐                   │
│         │                             │WORK PACKAGE │                   │
│         │                             │ WBS unit    │                   │
│         │                             └──────┬──────┘                   │
│         │                                    │                           │
│         └──────────────┬─────────────────────┘                          │
│                        │                                                 │
│                        ▼                                                 │
│                 ┌─────────────┐                                          │
│                 │    TASK     │                                          │
│                 │ Schedulable │                                          │
│                 └──────┬──────┘                                          │
│                        │                                                 │
│                        ▼                                                 │
│                 ┌─────────────┐                                          │
│                 │    STEP     │                                          │
│                 │   Atomic    │                                          │
│                 └─────────────┘                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## JTBD Integration Mapping

```
JTBD FRAMEWORK                    WORK HIERARCHY
═══════════════                   ══════════════

jobs_to_be_done ─────────────────► Process / Project
    │
    ├── jtbd_workflow_stages ────► Activity / Phase
    │
    ├── jtbd_workflow_activities ► Task
    │
    ├── jtbd_outcomes ───────────► Task success criteria
    │
    ├── jtbd_obstacles ──────────► Task constraints
    │
    └── jtbd_kpis ───────────────► Process/Activity metrics
```

---

## Enterprise Glossary

### Operations Terms

| Term | Definition | Synonym |
|------|------------|---------|
| **Process** | End-to-end value stream that delivers an outcome to a customer | Value Chain, Workflow |
| **Activity** | Major building block within a process; groups related tasks | Procedure, Sub-process |
| **Task** | Discrete unit of work with clear input/output | Work Item, Job |
| **Step** | Atomic action that cannot be further decomposed | Instruction, Action |

### Project Terms

| Term | Definition | Synonym |
|------|------------|---------|
| **Project** | Temporary endeavor to create unique product/service/result | Initiative, Program |
| **Phase** | Logical grouping of project activities ending in milestone | Stage, Gate |
| **Work Package** | Lowest WBS level; assigned to single team/owner | Deliverable Package |
| **Task** | Schedulable work with duration, effort, dependencies | Activity (PMI) |
| **Step** | Micro-level action by single person | Sub-task |

---

## Key Principles

### 1. Activities Decompose INTO Tasks

```
CORRECT:                          INCORRECT:
Activity → Task → Step            Task → Activity → Step
```

### 2. Process vs Project Distinction

| Aspect | Process (Operations) | Project (Change) |
|--------|---------------------|------------------|
| Nature | Stable, repeatable | Temporary, unique |
| Duration | Ongoing | Has end date |
| Goal | Maintain capability | Deliver outcome |
| Success | Efficiency, SLA | On-time, on-budget |
| Change | Continuous improvement | Progressive elaboration |

### 3. Integration Rules

- Project tasks map to impacted operational process/activity
- Project output → Operational adoption handover
- Shared Task and Step levels enable consistent tracking

---

## Framework Alignment

| Framework | Hierarchy | VITAL Mapping |
|-----------|-----------|---------------|
| **APQC PCF** | Process → Activity → Task | Operations hierarchy |
| **ISO 9001** | Process → Procedure → Work Instruction → Step | Activity ≈ Procedure |
| **PMBOK** | Project → Phase → Work Package → Task → Activity | Projects hierarchy |
| **PRINCE2** | Project → Stage → Work Package → Task | Phase ≈ Stage |
| **Scaled Agile** | Epic → Capability → Feature → Story → Task | Maps to Work Package → Task |

---

## Data Schema Tables

### Operations Domain

| Table | Level | Purpose |
|-------|-------|---------|
| `processes` | Process | End-to-end value streams |
| `process_activities` | Activity | Building blocks within process |
| `tasks` | Task | Discrete work units |
| `task_steps` | Step | Atomic actions |

### Projects Domain

| Table | Level | Purpose |
|-------|-------|---------|
| `projects` | Project | Temporary initiatives |
| `project_phases` | Phase | Time-sequenced sections |
| `work_packages` | Work Package | WBS decomposition units |
| `tasks` | Task | Schedulable work items |
| `task_steps` | Step | Atomic actions |

### Shared/Junction Tables

| Table | Purpose |
|-------|---------|
| `activity_tasks` | Links activities to tasks |
| `work_package_tasks` | Links work packages to tasks |
| `task_agents` | Agent assignments to tasks |
| `task_skills` | Skills required for tasks |
| `task_tools` | Tools used in tasks |
| `task_dependencies` | Task predecessor relationships |

---

## Anti-Patterns to Avoid

1. **Mixing terminology** - Using "activity" and "task" interchangeably
2. **Wrong decomposition** - Calling a large deliverable a "task" (should be work package)
3. **Hierarchy in job descriptions** - Embedding in roles instead of process maps
4. **Function-specific taxonomies** - Each department inventing their own → fragmentation
5. **JSONB fields** - Storing structured data as JSON instead of normalized tables

---

## Implementation Checklist

- [ ] Define single enterprise glossary with clear definitions
- [ ] Adopt APQC as backbone for operational processes
- [ ] Adopt PMI/PRINCE2 for project structures
- [ ] Establish mapping rules: project deliverables → operational processes
- [ ] Codify in central knowledge base with examples
- [ ] Normalize all JSONB fields into relational tables
- [ ] Pilot in one domain before scaling
- [ ] Train all teams on consistent terminology

---

## Next Steps

1. **Create normalized schema migration** - Zero JSONB
2. **Create attribute reference** - All fields documented
3. **Map existing data** - Align current tables to new hierarchy
4. **Build views** - v_operations_hierarchy, v_project_hierarchy

---

*Aligned with APQC Process Classification Framework, ISO 9001, PMBOK 7th Edition, PRINCE2*
