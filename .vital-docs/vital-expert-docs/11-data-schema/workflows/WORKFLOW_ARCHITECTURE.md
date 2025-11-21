# Workflow Architecture & JTBD Integration

**Last Updated**: 2024-11-21  
**Status**: Production Ready  
**Related Files**: 
- Migration: `06-migrations/workflow_normalization.sql`
- JTBD Docs: `jtbds/COMPLETE_JTBD_ARCHITECTURE.md`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Work Mode Taxonomy](#work-mode-taxonomy)
3. [Workflow Model](#workflow-model)
4. [LangGraph Integration](#langgraph-integration)
5. [JTBD-Workflow Binding](#jtbd-workflow-binding)
6. [Query Patterns](#query-patterns)
7. [Migration from Legacy](#migration-from-legacy)

---

## Architecture Overview

### Unified Workflow Model

The VITAL platform uses a **unified, normalized workflow model** that supports:
- **Routine operational workflows** (daily/weekly processes)
- **Project-based workflows** (one-time/strategic initiatives)
- **Ad-hoc automation workflows** (on-demand, standalone)

All workflows integrate seamlessly with the JTBD system for demand-driven design.

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JTBD (Demand Side)                       │
│  What needs to be done + Why + Desired outcomes            │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   ROUTINE    │ │   PROJECT    │ │    ADHOC     │
│  Workflows   │ │  Workflows   │ │  Workflows   │
│              │ │              │ │              │
│ work_mode=   │ │ work_mode=   │ │ work_mode=   │
│  'routine'   │ │  'project'   │ │  'adhoc'     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  WORKFLOW TEMPLATES          │
         │  (Normalized Structure)      │
         │  • Stages                    │
         │  • Tasks                     │
         │  • Steps                     │
         │  • Components                │
         └──────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  LANGGRAPH EXECUTION         │
         │  (Runtime Orchestration)     │
         └──────────────────────────────┘
```

---

## Work Mode Taxonomy

### Three Primary Modes

| Work Mode | Description | Binding | Frequency | Examples |
|-----------|-------------|---------|-----------|----------|
| **`routine`** | Recurring operational work | `process` | Daily, weekly, monthly | Safety report generation, patient follow-up, inventory check |
| **`project`** | Time-bound strategic initiatives | `project` | One-time, phased | Clinical trial setup, market entry, system implementation |
| **`adhoc`** | On-demand standalone automation | `standalone` | As needed | Data analysis, document generation, ad-hoc queries |

### work_mode in Schema

#### `workflow_templates.work_mode`
Defines the primary mode for the entire workflow.

```sql
CREATE TYPE work_mode_type AS ENUM ('routine', 'project', 'adhoc');

ALTER TABLE workflow_templates 
  ADD COLUMN work_mode work_mode_type;
```

#### `tasks.work_mode`
Defines whether a task is used in routine, project, or both contexts.

```sql
ALTER TABLE tasks
  ADD COLUMN work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'both'));
```

**Examples:**
- `'routine'`: "Generate daily safety report" (only in operational workflows)
- `'project'`: "Conduct market feasibility study" (only in project workflows)
- `'both'`: "Review and approve document" (used in both contexts)

---

## Workflow Model

### Core Tables

#### `workflow_templates`
The canonical workflow definition.

**Key Columns:**
```sql
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  jtbd_id UUID REFERENCES jtbd(id), -- Demand linkage
  
  -- Work mode classification
  work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'adhoc')),
  binding_type TEXT CHECK (binding_type IN ('process', 'project', 'standalone')),
  
  -- Bindings
  process_id UUID REFERENCES processes(id), -- For routine work
  project_type_id UUID REFERENCES project_types(id), -- For project work
  
  -- Workflow structure
  workflow_type TEXT CHECK (workflow_type IN ('standard', 'conditional', 'parallel', 'sequential')),
  description TEXT,
  ...
);
```

**Usage:**
- **Routine workflows**: `work_mode='routine'`, `binding_type='process'`, `process_id` set
- **Project workflows**: `work_mode='project'`, `binding_type='project'`, `project_type_id` set
- **Adhoc workflows**: `work_mode='adhoc'`, `binding_type='standalone'`, no binding ID

#### `workflow_stages`
Logical phases within a workflow.

```sql
CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES workflow_templates(id),
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  description TEXT,
  ...
);
```

#### `workflow_tasks`
Concrete tasks within each stage.

```sql
CREATE TABLE workflow_tasks (
  id UUID PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES workflow_stages(id),
  task_id UUID REFERENCES tasks(id), -- Links to canonical task
  task_number INTEGER NOT NULL,
  task_name TEXT NOT NULL,
  task_type TEXT,
  estimated_duration_minutes INTEGER,
  depends_on_task_id UUID REFERENCES workflow_tasks(id), -- Task dependencies
  ...
);
```

#### `tasks` (Canonical Task Catalog)
Reusable task definitions.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Work mode for reusability
  work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'both')),
  typical_frequency TEXT,
  
  -- Task configuration (now normalized)
  -- input_schema, output_schema moved to task_input_definitions / task_output_definitions
  ...
);
```

#### `task_steps`
Normalized step-level execution units.

```sql
CREATE TABLE task_steps (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  sequence_order INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'api_call', 'db_operation', 'llm_call', 'manual', etc.
  component_id UUID REFERENCES lang_components(id), -- LangGraph component
  ...
);
```

#### `step_parameters`
Parameterization for each step.

```sql
CREATE TABLE step_parameters (
  id UUID PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES task_steps(id),
  parameter_name TEXT NOT NULL,
  parameter_value TEXT,
  parameter_type TEXT, -- 'literal', 'context', 'computed', 'user_input'
  is_required BOOLEAN DEFAULT TRUE,
  default_value TEXT,
  ...
);
```

---

## LangGraph Integration

### Component Registry

The `lang_components` table serves as a **catalog of reusable LangGraph nodes**.

```sql
CREATE TABLE lang_components (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- 'openai-chat', 'vector-retriever', etc.
  component_type TEXT CHECK (component_type IN ('tool', 'llm_chain', 'router', 'parallel', 'subgraph', 'condition', 'transform')),
  
  -- Python binding
  python_module TEXT NOT NULL, -- 'langchain.chat_models'
  callable_name TEXT NOT NULL, -- 'ChatOpenAI'
  version TEXT DEFAULT '1.0.0',
  
  -- Schema (JSONB allowed here for dynamic components)
  input_schema JSONB,
  output_schema JSONB,
  config_schema JSONB,
  ...
);
```

### Runtime Execution Flow

1. **Load Workflow**: Query `workflow_templates` by `jtbd_id` or `process_id`
2. **Resolve Structure**: Join to `workflow_stages` → `workflow_tasks` → `tasks`
3. **Build Graph**:
   - For each `task`, load `task_steps`
   - For each `step`, resolve `component_id` → `lang_components`
   - Load `step_parameters` for runtime binding
4. **Instantiate Components**:
   - Dynamically import `python_module.callable_name`
   - Pass resolved parameters from `step_parameters`
5. **Execute**: Run LangGraph with constructed nodes and edges

### Component Examples

**Seeded Components** (from migration):
- `openai-chat`: OpenAI chat completion
- `claude-chat`: Anthropic Claude chat
- `vector-retriever`: Vector store retrieval
- `sql-database`: SQL database queries
- `python-repl`: Python code execution
- `http-request`: HTTP API calls
- `conditional-router`: Conditional branching
- `parallel-exec`: Parallel execution
- `data-transform`: Data transformation

**Adding Custom Components**:
```sql
INSERT INTO lang_components (name, slug, component_type, python_module, callable_name)
VALUES (
  'Custom Safety Analyzer',
  'safety-analyzer',
  'tool',
  'vital.ai.tools',
  'SafetyAnalyzer'
);
```

---

## JTBD-Workflow Binding

### Demand-Driven Workflow Design

Every workflow can (and should) be linked to a JTBD to establish **demand-side rationale**.

```sql
-- Example: Safety Review workflow linked to JTBD
INSERT INTO workflow_templates (name, jtbd_id, work_mode, binding_type, process_id)
VALUES (
  'Daily Safety Signal Review',
  (SELECT id FROM jtbd WHERE code = 'MA-034'), -- "Monitor and assess safety signals"
  'routine',
  'process',
  (SELECT id FROM processes WHERE name = 'Pharmacovigilance Operations')
);
```

### Three Binding Patterns

#### Pattern 1: Routine Process Workflows

**Use Case**: Recurring operational work

```sql
-- Routine workflow bound to a process
workflow_templates:
  work_mode = 'routine'
  binding_type = 'process'
  process_id = <uuid>
  jtbd_id = <uuid> (optional but recommended)
```

**Query Example**:
```sql
SELECT * FROM v_routine_workflows
WHERE process_name = 'Clinical Trial Management';
```

#### Pattern 2: Project Workflows

**Use Case**: Strategic initiatives, one-time projects

```sql
-- Project workflow bound to project type
workflow_templates:
  work_mode = 'project'
  binding_type = 'project'
  project_type_id = <uuid>
  jtbd_id = <uuid> (optional but recommended)
```

**Query Example**:
```sql
SELECT * FROM v_project_workflows
WHERE project_type_name = 'Market Entry';
```

#### Pattern 3: Adhoc Standalone Workflows

**Use Case**: On-demand automation, utilities

```sql
-- Adhoc workflow, no process/project binding
workflow_templates:
  work_mode = 'adhoc'
  binding_type = 'standalone'
  jtbd_id = <uuid> (optional but recommended)
```

---

## Query Patterns

### Get All Workflows for a JTBD

```sql
SELECT 
  wt.name as workflow_name,
  wt.work_mode,
  wt.binding_type,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wtask.id) as task_count
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON wt.id = ws.template_id
LEFT JOIN workflow_tasks wtask ON ws.id = wtask.stage_id
WHERE wt.jtbd_id = '<jtbd-uuid>'
GROUP BY wt.id, wt.name, wt.work_mode, wt.binding_type;
```

### Get Routine Workflows for a Process

```sql
SELECT * FROM v_routine_workflows
WHERE process_id = '<process-uuid>'
ORDER BY name;
```

### Get Complete Workflow Structure

```sql
-- Use the comprehensive view
SELECT * FROM v_workflow_complete
WHERE workflow_id = '<workflow-uuid>'
ORDER BY stage_number, task_number;
```

### Get JTBD Coverage by Workflows

```sql
SELECT * FROM v_jtbd_workflow_coverage
WHERE workflow_count > 0
ORDER BY total_tasks DESC;
```

### Find Tasks Suitable for Both Routine and Project

```sql
SELECT name, description, typical_frequency
FROM tasks
WHERE work_mode = 'both'
ORDER BY name;
```

### Get LangGraph Components by Type

```sql
SELECT name, slug, component_type, python_module, callable_name
FROM lang_components
WHERE component_type = 'tool' AND is_active = TRUE
ORDER BY name;
```

---

## Migration from Legacy

### Legacy JTBD Workflow Tables

**Deprecated Tables** (still exist but no longer primary):
- `jtbd_workflow_stages` - Had arrays: `key_activities`, `pain_points`
- `jtbd_workflow_activities` - Had arrays: `required_skills`, `required_tools`, `required_data`

**Migration Strategy**:
1. ✅ Keep existing data for backward compatibility
2. ✅ Use `workflow_templates` + `workflow_stages` + `workflow_tasks` for all new workflows
3. ✅ Views can bridge old and new models if needed
4. 🔄 Gradually migrate JTBD workflows to new model (script in `workflow_normalization.sql`)

### Migration Script Pattern

```sql
-- Migrate JTBD-specific workflows to workflow_templates
INSERT INTO workflow_templates (name, jtbd_id, work_mode, workflow_type, description)
SELECT 
  CONCAT(j.name, ' - Workflow') as name,
  j.id as jtbd_id,
  CASE 
    WHEN j.frequency IN ('daily', 'weekly') THEN 'routine'
    WHEN j.frequency IN ('monthly', 'quarterly') THEN 'routine'
    ELSE 'adhoc'
  END as work_mode,
  'standard' as workflow_type,
  j.description
FROM jtbd j
WHERE EXISTS (SELECT 1 FROM jtbd_workflow_stages WHERE jtbd_id = j.id)
ON CONFLICT DO NOTHING;

-- Migrate stages
INSERT INTO workflow_stages (template_id, stage_number, stage_name, description)
SELECT 
  wt.id,
  jws.stage_number,
  jws.stage_name,
  jws.stage_description
FROM jtbd_workflow_stages jws
JOIN workflow_templates wt ON jws.jtbd_id = wt.jtbd_id
ON CONFLICT DO NOTHING;

-- Migrate activities to tasks
INSERT INTO workflow_tasks (stage_id, task_number, task_name, task_type, description)
SELECT 
  ws.id,
  jwa.sequence_order,
  jwa.activity_name,
  jwa.activity_type,
  jwa.activity_description
FROM jtbd_workflow_activities jwa
JOIN jtbd_workflow_stages jws ON jwa.stage_id = jws.id
JOIN workflow_templates wt ON jws.jtbd_id = wt.jtbd_id
JOIN workflow_stages ws ON wt.id = ws.template_id AND ws.stage_number = jws.stage_number
ON CONFLICT DO NOTHING;
```

### Legacy Task/Step Tables

**Deprecated** (JSONB-heavy):
- `steps` - Had `condition_expression jsonb`, `loop_config jsonb`, `metadata jsonb`
- `workflow_steps` / `workflow_step_definitions` - Had multiple JSONB config fields

**Current Model** (normalized):
- `task_steps` + `step_parameters` - Fully normalized, LangGraph-ready
- `lang_components` - Component catalog

**Strategy**: Use `task_steps` + `step_parameters` as the canonical model going forward.

---

## Best Practices

### 1. Always Link Workflows to JTBDs

**Why**: Establishes demand-side rationale and enables demand-driven analytics.

```sql
-- ✅ GOOD: Workflow linked to JTBD
INSERT INTO workflow_templates (name, jtbd_id, ...)
VALUES ('Safety Review Workflow', '<jtbd-uuid>', ...);

-- ❌ BAD: Orphan workflow
INSERT INTO workflow_templates (name, ...)
VALUES ('Some Workflow', ...); -- No JTBD linkage
```

### 2. Set work_mode Explicitly

**Why**: Enables proper routing, analytics, and AI opportunity scoring.

```sql
-- ✅ GOOD: Explicit work_mode
work_mode = 'routine'
binding_type = 'process'

-- ❌ BAD: NULL work_mode
work_mode = NULL -- Ambiguous
```

### 3. Reuse Tasks via `tasks` Table

**Why**: DRY principle, consistency, easier maintenance.

```sql
-- ✅ GOOD: Reference canonical task
INSERT INTO workflow_tasks (stage_id, task_id, ...)
VALUES ('<stage-uuid>', '<canonical-task-uuid>', ...);

-- ❌ BAD: Duplicate task definition
INSERT INTO workflow_tasks (stage_id, task_name, ...)
VALUES ('<stage-uuid>', 'Review Document', ...); -- No reuse
```

### 4. Use Components for Steps

**Why**: Enables dynamic LangGraph execution, versioning, and component reuse.

```sql
-- ✅ GOOD: Step linked to component
INSERT INTO task_steps (task_id, component_id, ...)
VALUES ('<task-uuid>', '<component-uuid>', ...);

-- ❌ BAD: Hard-coded step logic
-- (no component linkage)
```

### 5. Normalize Step Parameters

**Why**: Enables runtime parameterization, configuration management.

```sql
-- ✅ GOOD: Parameters in step_parameters table
INSERT INTO step_parameters (step_id, parameter_name, parameter_value, parameter_type)
VALUES 
  ('<step-uuid>', 'model', 'gpt-4', 'literal'),
  ('<step-uuid>', 'temperature', '0.7', 'literal'),
  ('<step-uuid>', 'context', 'user_input', 'context');

-- ❌ BAD: JSONB config blob
-- (no queryability, no type safety)
```

---

## Next Steps

1. **Backfill work_mode**: Run backfill queries to classify existing workflows
2. **Migrate JTBD Workflows**: Use migration script to move JTBD-specific workflows
3. **Populate Components**: Add domain-specific LangGraph components to `lang_components`
4. **Build Execution Engine**: Implement LangGraph builder that reads from normalized schema
5. **Create Analytics**: Build dashboards using `v_routine_workflows`, `v_project_workflows`, `v_jtbd_workflow_coverage`

---

## Related Documentation

- **JTBD Architecture**: `jtbds/COMPLETE_JTBD_ARCHITECTURE.md`
- **Data Ownership**: `jtbds/DATA_OWNERSHIP_GUIDE.md`
- **Query Examples**: `jtbds/QUERY_EXAMPLES.md`
- **Migration Script**: `06-migrations/workflow_normalization.sql`

---

**Document Version**: 1.0  
**Last Reviewed**: 2024-11-21  
**Status**: ✅ Production Ready

