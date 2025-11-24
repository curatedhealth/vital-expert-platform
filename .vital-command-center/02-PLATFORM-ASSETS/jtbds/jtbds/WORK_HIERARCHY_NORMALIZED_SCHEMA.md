# VITAL Platform - Work Hierarchy Normalized Schema Reference

**Date:** 2025-11-19
**Architecture:** ZERO JSONB - Fully Normalized
**Standards:** APQC PCF, ISO 9001, PMBOK, PRINCE2

---

## Executive Summary

The VITAL platform maintains **two parallel work hierarchies**:

1. **Operations Domain** (Process-Based) - Recurring, repeatable, capability-based work
2. **Projects Domain** (Change-Based) - Temporary, outcome-based initiatives

Both share common lower levels (Task, Step) but differ at higher levels.

---

## Dual Hierarchy Structure

### Operations Hierarchy (APQC/ISO Standard)

```
PROCESS (End-to-end value stream)
    ↓
ACTIVITY (Major building block)
    ↓
TASK (Discrete work unit)
    ↓
STEP (Atomic action)
```

### Projects Hierarchy (PMBOK/PRINCE2 Standard)

```
PROJECT (Temporary endeavor)
    ↓
PHASE (Time sequence)
    ↓
WORK PACKAGE (WBS unit)
    ↓
TASK (Schedulable work)
    ↓
STEP (Atomic action)
```

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

## Operations Domain Tables

### 1. processes

End-to-end value streams (APQC aligned).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | Multi-tenant isolation |
| code | text | Unique identifier (e.g., "PROC-001") |
| name | text | Process name |
| description | text | Process description |
| version | text | Version number |
| process_category | text | 'operate', 'manage', 'support' (APQC Level 1) |
| process_group | text | APQC Level 2 grouping |
| functional_area | text | Business area (e.g., 'medical_affairs') |
| status | text | 'draft', 'active', 'under_review', 'deprecated', 'archived' |
| effective_date | date | When process becomes effective |
| review_date | date | Next review date |
| process_owner_id | uuid | FK to user_profiles |
| organization_id | uuid | FK to organizations |
| primary_jtbd_id | uuid | FK to jobs_to_be_done |
| target_cycle_time | interval | Target completion time |
| target_cost | numeric | Target cost |
| created_at | timestamptz | Audit timestamp |
| updated_at | timestamptz | Audit timestamp |
| created_by | uuid | FK to user_profiles |

### 2. process_sla_targets

SLA targets for processes (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| process_id | uuid | FK to processes |
| tenant_id | uuid | Multi-tenant isolation |
| sla_name | text | SLA name |
| metric_type | text | 'time', 'quality', 'cost', 'compliance' |
| target_value | text | Target value |
| unit_of_measure | text | Unit |
| measurement_frequency | text | How often measured |

### 3. process_kpis

Process KPIs (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| process_id | uuid | FK to processes |
| tenant_id | uuid | Multi-tenant isolation |
| kpi_name | text | KPI name |
| kpi_description | text | Description |
| target_value | text | Target |
| current_value | text | Current performance |
| unit_of_measure | text | Unit |
| measurement_frequency | text | Frequency |
| data_source | text | Data source |

### 4. process_activities

Major building blocks within a process.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| process_id | uuid | FK to processes |
| tenant_id | uuid | Multi-tenant isolation |
| sequence_order | integer | Order in process |
| code | text | Activity code |
| name | text | Activity name |
| description | text | Description |
| purpose_statement | text | "To ensure..." |
| typical_duration | interval | Typical duration |
| is_milestone | boolean | Is this a milestone |
| activity_owner_role | text | Role responsible |
| jtbd_stage_id | uuid | FK to jtbd_workflow_stages |

### 5. activity_entry_criteria

Entry criteria for activities (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| activity_id | uuid | FK to process_activities |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion description |
| is_mandatory | boolean | Is mandatory |
| verification_method | text | How to verify |
| sequence_order | integer | Display order |

### 6. activity_exit_criteria

Exit criteria for activities (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| activity_id | uuid | FK to process_activities |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion description |
| is_mandatory | boolean | Is mandatory |
| verification_method | text | How to verify |
| sequence_order | integer | Display order |

### 7. activity_deliverables

Deliverables from activities (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| activity_id | uuid | FK to process_activities |
| tenant_id | uuid | Multi-tenant isolation |
| deliverable_name | text | Deliverable name |
| deliverable_type | text | 'document', 'data', 'decision', 'approval' |
| description | text | Description |
| template_id | uuid | Reference to template |
| is_mandatory | boolean | Is mandatory |

### 8. activity_pain_points

Pain points in activities (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| activity_id | uuid | FK to process_activities |
| tenant_id | uuid | Multi-tenant isolation |
| pain_point_text | text | Pain point description |
| pain_point_type | text | 'technical', 'resource', 'process', 'knowledge', 'compliance' |
| severity | text | 'low', 'medium', 'high', 'critical' |
| frequency | text | How often it occurs |

---

## Projects Domain Tables

### 9. project_types (NEW - Reference Table)

Normalized reference table for project types. Dynamic and evolvable.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tenant_id | uuid | NULL for global types, tenant_id for tenant-specific |
| code | text | Machine-readable code (e.g., 'clinical_decision_support') |
| name | text | Display name |
| description | text | Type description |
| category | text | Grouping (e.g., 'digital_health', 'clinical', 'analytics') |
| is_active | boolean | Whether type is active |
| display_order | integer | UI ordering |

**Initial Values:**
- `digital_therapeutic` - Software-based therapeutic interventions
- `ai_diagnostic` - AI-powered diagnostic tools
- `clinical_decision_support` - Systems supporting clinical decisions
- `remote_monitoring` - Remote patient monitoring solutions
- `telemedicine_platform` - Virtual care delivery platforms
- `health_analytics` - Healthcare data analytics solutions

**Helper Function:** `get_project_type_id(code, tenant_id)` - Resolves type code to UUID

### 10. projects (existing table enhanced)

Added columns to existing projects table:

| Column | Type | Description |
|--------|------|-------------|
| project_type_id | uuid | FK to project_types (replaces project_type text) |
| project_type | text | DEPRECATED - use project_type_id |
| primary_jtbd_id | uuid | FK to jobs_to_be_done |
| budget | numeric | Project budget |

### 11. project_objectives

Project objectives (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| tenant_id | uuid | Multi-tenant isolation |
| objective_text | text | Objective description |
| objective_type | text | 'business', 'technical', 'compliance', 'quality' |
| is_primary | boolean | Is primary objective |
| success_metric | text | How to measure |
| target_value | text | Target |

### 12. project_deliverables

Project deliverables (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| tenant_id | uuid | Multi-tenant isolation |
| deliverable_name | text | Deliverable name |
| description | text | Description |
| deliverable_type | text | Type |
| due_date | date | Due date |
| acceptance_criteria | text | Acceptance criteria |
| status | text | Status |

### 13. project_success_criteria

Success criteria (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion description |
| measurement_method | text | How to measure |
| target_value | text | Target |
| is_mandatory | boolean | Is mandatory |

### 14. project_phases

Time-sequenced project sections.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| tenant_id | uuid | Multi-tenant isolation |
| phase_number | integer | Phase sequence |
| name | text | Phase name |
| description | text | Description |
| planned_start_date | date | Planned start |
| planned_end_date | date | Planned end |
| actual_start_date | date | Actual start |
| actual_end_date | date | Actual end |
| milestone_name | text | Milestone name |
| is_gate_review | boolean | Has gate review |
| gate_criteria | text | Gate criteria |
| status | text | 'not_started', 'in_progress', 'completed', 'on_hold', 'cancelled' |
| jtbd_stage_id | uuid | FK to jtbd_workflow_stages |

### 15. phase_entry_criteria

Phase entry criteria (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| phase_id | uuid | FK to project_phases |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion |
| is_mandatory | boolean | Is mandatory |
| verification_method | text | Verification method |

### 16. phase_exit_criteria

Phase exit criteria (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| phase_id | uuid | FK to project_phases |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion |
| is_mandatory | boolean | Is mandatory |
| verification_method | text | Verification method |

### 17. phase_deliverables

Phase deliverables (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| phase_id | uuid | FK to project_phases |
| tenant_id | uuid | Multi-tenant isolation |
| deliverable_name | text | Deliverable name |
| deliverable_type | text | Type |
| description | text | Description |
| is_mandatory | boolean | Is mandatory |

### 18. work_packages

WBS decomposition units.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| phase_id | uuid | FK to project_phases |
| tenant_id | uuid | Multi-tenant isolation |
| wbs_code | text | WBS code (e.g., "1.2.3") |
| name | text | Work package name |
| description | text | Description |
| scope_statement | text | Scope statement |
| owner_id | uuid | FK to user_profiles |
| responsible_team | text | Responsible team |
| estimated_effort_hours | numeric | Estimated effort |
| estimated_cost | numeric | Estimated cost |
| planned_start_date | date | Planned start |
| planned_end_date | date | Planned end |
| actual_start_date | date | Actual start |
| actual_end_date | date | Actual end |
| status | text | 'not_started', 'in_progress', 'completed', 'on_hold', 'cancelled' |
| percent_complete | integer | 0-100 completion |

### 19. work_package_acceptance_criteria

Acceptance criteria (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| work_package_id | uuid | FK to work_packages |
| tenant_id | uuid | Multi-tenant isolation |
| criterion_text | text | Criterion |
| verification_method | text | Verification method |
| is_met | boolean | Is criterion met |

---

## Shared Tables (Task & Step)

### 20. tasks (existing table enhanced)

Added columns for dual hierarchy support:

| Column | Type | Description |
|--------|------|-------------|
| activity_id | uuid | FK to process_activities (Operations) |
| work_package_id | uuid | FK to work_packages (Projects) |
| jtbd_activity_id | uuid | FK to jtbd_workflow_activities |
| priority | text | 'low', 'medium', 'high', 'critical' |
| estimated_duration_minutes | integer | Estimated duration |

### 21. task_inputs

Task inputs (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to tasks |
| tenant_id | uuid | Multi-tenant isolation |
| input_name | text | Input name |
| input_type | text | 'data', 'document', 'approval', 'parameter' |
| description | text | Description |
| is_required | boolean | Is required |
| source | text | Where it comes from |

### 22. task_outputs

Task outputs (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to tasks |
| tenant_id | uuid | Multi-tenant isolation |
| output_name | text | Output name |
| output_type | text | 'data', 'document', 'notification', 'artifact' |
| description | text | Description |
| destination | text | Where it goes |

### 23. task_dependencies

Task dependencies (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to tasks (dependent) |
| depends_on_task_id | uuid | FK to tasks (predecessor) |
| tenant_id | uuid | Multi-tenant isolation |
| dependency_type | text | 'finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish' |
| lag_minutes | integer | Lag time |

### 24. task_steps

Atomic actions within tasks.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| task_id | uuid | FK to tasks |
| tenant_id | uuid | Multi-tenant isolation |
| sequence_order | integer | Step sequence |
| name | text | Step name |
| description | text | Description |
| step_type | text | 'api_call', 'db_operation', 'file_operation', 'computation', 'validation', 'notification', 'wait', 'decision', 'manual' |
| tool_id | uuid | FK to tools |
| is_conditional | boolean | Has condition |
| condition_expression | text | Condition logic |
| on_success_action | text | Action on success |
| on_failure_action | text | 'stop', 'retry', 'skip', 'escalate' |
| max_retries | integer | Max retry count |
| timeout_seconds | integer | Timeout |
| estimated_duration_seconds | integer | Estimated duration |

### 25. step_parameters

Step parameters (normalized).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| step_id | uuid | FK to task_steps |
| tenant_id | uuid | Multi-tenant isolation |
| parameter_name | text | Parameter name |
| parameter_value | text | Value |
| parameter_type | text | 'string', 'number', 'boolean', 'array', 'object' |
| is_required | boolean | Is required |
| default_value | text | Default value |

---

## JTBD Integration Tables

### 26. jtbd_process_mapping

Links JTBDs to Processes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| process_id | uuid | FK to processes |
| tenant_id | uuid | Multi-tenant isolation |
| mapping_type | text | 'primary', 'secondary', 'supporting' |

### 27. jtbd_project_mapping

Links JTBDs to Projects.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| jtbd_id | uuid | FK to jobs_to_be_done |
| project_id | uuid | FK to projects |
| tenant_id | uuid | Multi-tenant isolation |
| mapping_type | text | 'primary', 'secondary', 'supporting' |

---

## Hierarchy Views

### v_operations_hierarchy

Complete operations hierarchy view.

```sql
SELECT
    process_id, process_code, process_name, process_category,
    functional_area, process_status,
    activity_id, activity_sequence, activity_code, activity_name,
    task_id, task_name,
    step_id, step_sequence, step_name, step_type,
    jtbd_id, jtbd_code, jtbd_name,
    tenant_id
FROM v_operations_hierarchy
ORDER BY process_name, activity_sequence, task_name, step_sequence;
```

### v_projects_hierarchy

Complete projects hierarchy view.

```sql
SELECT
    project_id, project_name,
    phase_id, phase_number, phase_name, phase_status,
    work_package_id, wbs_code, work_package_name, work_package_status, percent_complete,
    task_id, task_name,
    step_id, step_sequence, step_name, step_type,
    jtbd_id, jtbd_code, jtbd_name,
    tenant_id
FROM v_projects_hierarchy
ORDER BY project_name, phase_number, wbs_code, task_name, step_sequence;
```

---

## Key Indexes

```sql
-- Processes
idx_processes_tenant ON processes(tenant_id)
idx_processes_status ON processes(status)
idx_processes_jtbd ON processes(primary_jtbd_id)

-- Activities
idx_activities_process ON process_activities(process_id)
idx_activities_sequence ON process_activities(process_id, sequence_order)

-- Phases
idx_phases_project ON project_phases(project_id)
idx_phases_sequence ON project_phases(project_id, phase_number)

-- Work Packages
idx_work_packages_phase ON work_packages(phase_id)
idx_work_packages_status ON work_packages(status)

-- Tasks
idx_tasks_activity ON tasks(activity_id)
idx_tasks_work_package ON tasks(work_package_id)
idx_tasks_priority ON tasks(priority)

-- Steps
idx_steps_task ON task_steps(task_id)
idx_steps_sequence ON task_steps(task_id, sequence_order)
```

---

## Example Queries

### Get complete operations hierarchy
```sql
SELECT * FROM v_operations_hierarchy
WHERE tenant_id = 'your-tenant-id'
  AND process_status = 'active'
ORDER BY process_name, activity_sequence, task_name, step_sequence;
```

### Get project progress by work package
```sql
SELECT
    pr.name as project_name,
    ph.name as phase_name,
    wp.wbs_code,
    wp.name as work_package_name,
    wp.status,
    wp.percent_complete,
    COUNT(t.id) as task_count
FROM projects pr
JOIN project_phases ph ON ph.project_id = pr.id
JOIN work_packages wp ON wp.phase_id = ph.id
LEFT JOIN tasks t ON t.work_package_id = wp.id
WHERE pr.id = 'your-project-id'
GROUP BY pr.name, ph.name, ph.phase_number, wp.wbs_code, wp.name, wp.status, wp.percent_complete
ORDER BY ph.phase_number, wp.wbs_code;
```

### Get all deliverables for an activity
```sql
SELECT
    p.name as process_name,
    a.name as activity_name,
    d.deliverable_name,
    d.deliverable_type,
    d.is_mandatory
FROM processes p
JOIN process_activities a ON a.process_id = p.id
JOIN activity_deliverables d ON d.activity_id = a.id
WHERE a.id = 'your-activity-id'
ORDER BY d.deliverable_name;
```

### Get task dependencies
```sql
SELECT
    t1.name as task_name,
    t2.name as depends_on,
    td.dependency_type,
    td.lag_minutes
FROM task_dependencies td
JOIN tasks t1 ON t1.id = td.task_id
JOIN tasks t2 ON t2.id = td.depends_on_task_id
WHERE t1.work_package_id = 'your-work-package-id'
ORDER BY t1.name;
```

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

## Anti-Patterns to Avoid

1. **Mixing terminology** - Using "activity" and "task" interchangeably
2. **Wrong decomposition** - Calling a large deliverable a "task" (should be work package)
3. **Skipping levels** - Going directly from Process to Task without Activity
4. **JSONB fields** - All arrays/objects should be in normalized tables
5. **Missing tenant_id** - Every table must have tenant isolation

---

## RLS Enabled Tables

All tables have Row Level Security enabled:
- processes
- process_sla_targets
- process_kpis
- process_activities
- activity_entry_criteria
- activity_exit_criteria
- activity_deliverables
- activity_pain_points
- project_phases
- phase_entry_criteria
- phase_exit_criteria
- phase_deliverables
- work_packages
- work_package_acceptance_criteria
- task_inputs
- task_outputs
- task_dependencies
- task_steps
- step_parameters

---

*Aligned with APQC Process Classification Framework, ISO 9001, PMBOK 7th Edition, PRINCE2*
