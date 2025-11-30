# JTBD Gold Standard L3 Schema - Quick Reference

**Version**: 3.0 | **Date**: November 29, 2024 | **Status**: Production-Ready

---

## Table of Contents
1. [Schema Summary](#schema-summary)
2. [JSONB Violations Fixed](#jsonb-violations-fixed)
3. [Key Improvements](#key-improvements)
4. [Quick Lookup Tables](#quick-lookup-tables)
5. [Common Queries](#common-queries)

---

## Schema Summary

### Total Tables: 27

| Layer | Count | Tables |
|-------|-------|--------|
| **Core** | 1 | `jtbd` |
| **Categorization** | 3 | `jtbd_categories`, `strategic_pillars`, `jtbd_category_mappings` |
| **L0 Context** | 1 | `jtbd_l0_context` |
| **ODI** | 4 | `jtbd_outcomes`, `jtbd_pain_points`, `jtbd_obstacles`, `jtbd_constraints` |
| **Value** | 4 | `value_categories`, `value_drivers`, `jtbd_value_categories`, `jtbd_value_drivers` |
| **AI** | 4 | `ai_intervention_types`, `jtbd_ai_suitability`, `ai_opportunities`, `ai_use_cases` |
| **Service** | 3 | `jtbd_service_mappings`, `service_panel_members`, `service_compliance_gates` |
| **Workflow** | 3 | `workflow_phase_gates`, `workflow_task_outputs`, `workflow_task_dependencies` |
| **Org** | 3 | `jtbd_functions`, `jtbd_departments`, `jtbd_roles` |
| **Persona** | 1 | `persona_ai_preferences` |

---

## JSONB Violations Fixed

### Before vs After

| # | Table | Column | Type | **Status** | **Solution** |
|---|-------|--------|------|------------|--------------|
| 1 | `jtbd_service_mappings` | `panel_composition` | JSONB | ❌ Violation | ✅ `service_panel_members` table |
| 2 | `jtbd_service_mappings` | `compliance_gates` | JSONB | ❌ Violation | ✅ `service_compliance_gates` table |
| 3 | `jtbd_persona_mappings` | `ai_delivery_preferences` | JSONB | ❌ Violation | ✅ `persona_ai_preferences` table |
| 4 | `workflow_phases` | `gate_config` | JSONB | ❌ Violation | ✅ `workflow_phase_gates` table |
| 5 | `workflow_tasks` | `outputs` | TEXT[] | ❌ Violation | ✅ `workflow_task_outputs` table |
| 6 | `workflow_tasks` | `tools` | TEXT[] | ✅ Already fixed | ✅ `workflow_task_tools` table |
| 7 | `workflow_tasks` | `dependencies` | UUID[] | ❌ Violation | ✅ `workflow_task_dependencies` table |
| 8 | `jtbd` | `metadata` | JSONB | ❌ Violation | ✅ Renamed to `experimental_metadata` |

**Total Violations Remediated**: 8/8 (100%)

---

## Key Improvements

### 1. Computed Opportunity Score (ODI)
```sql
-- GOLD STANDARD: GENERATED ALWAYS AS STORED
opportunity_score NUMERIC(4,1) GENERATED ALWAYS AS (
  importance_score + GREATEST(importance_score - satisfaction_score, 0)
) STORED
```

**Benefits:**
- Always accurate (auto-computed)
- Indexed for fast queries
- No manual calculation needed

---

### 2. 3-Tier Friction Model
```
Pain Points → Current frustrations (annoying but not blocking)
Obstacles → Blockers preventing completion (can be removed)
Constraints → Limitations that cannot be removed (must work within)
```

**Example:**
- **Pain Point**: "Searching for documents takes too long" (annoying)
- **Obstacle**: "System crashes during peak hours" (blocking, can fix)
- **Constraint**: "FDA requires 21 CFR Part 11 compliance" (cannot remove)

---

### 3. 5 AI Intervention Types (vs 2)
```
ASSIST      → AI suggests (low impact)
AUGMENT     → AI enhances (medium impact)
AUTOMATE    → AI executes (high impact)
ORCHESTRATE → AI coordinates workflows (high impact)
REDESIGN    → AI transforms process (transformative)
```

**Example Use Case:**
- **ASSIST**: "Suggest similar publications based on this abstract"
- **AUGMENT**: "Highlight key adverse events while you read the report"
- **AUTOMATE**: "Automatically classify incoming medical information requests"
- **ORCHESTRATE**: "Coordinate multi-step HTA submission across 12 countries"
- **REDESIGN**: "Replace manual literature review with AI-powered synthesis"

---

### 4. Polymorphic L0 Context Linking
```sql
-- Links JTBD to ANY L0 entity (tenant, industry, geography, etc.)
CREATE TABLE jtbd_l0_context (
  jtbd_id UUID,
  l0_entity_type TEXT, -- 'tenant', 'industry', 'geography', etc.
  l0_entity_id UUID,
  l0_entity_name TEXT  -- Cached for performance
);
```

**Example:**
```sql
-- JTBD "Prepare HTA Dossier" is relevant to:
INSERT INTO jtbd_l0_context VALUES
  ('jtbd-uuid', 'industry', 'pharma-uuid', 'Pharmaceuticals'),
  ('jtbd-uuid', 'geography', 'eu-uuid', 'European Union'),
  ('jtbd-uuid', 'regulatory_framework', 'ema-uuid', 'EMA Regulations');
```

---

### 5. Strategic Pillars (SP01-SP07)
From JTBD_TEMPLATE.json, now first-class entities:

```
SP01: Scientific Excellence
SP02: Operational Efficiency
SP03: Regulatory Compliance
SP04: Stakeholder Engagement
SP05: Data-Driven Decision Making
SP06: Innovation & Agility
SP07: Patient-Centricity
```

**Usage:**
```sql
-- Which JTBDs support "Scientific Excellence"?
SELECT j.name
FROM jtbd j
JOIN jtbd_category_mappings cm ON j.id = cm.jtbd_id
JOIN strategic_pillars sp ON cm.pillar_id = sp.id
WHERE sp.code = 'SP01';
```

---

## Quick Lookup Tables

### Service Layer Routing
| Service Layer | Use Case | Panel Size |
|---------------|----------|------------|
| `ask_me` | Simple lookup, FAQ | 1 agent (foundational) |
| `ask_expert` | Domain-specific question | 1 agent (specialist) |
| `ask_panel` | Complex, multi-perspective | 3-7 agents (panel) |
| `workflow` | Multi-step process | N/A (workflow orchestration) |

### AI Suitability Scores (0-1 scale)
| Score Type | Description | Example High-Scoring JTBD |
|------------|-------------|---------------------------|
| `rag_score` | Retrieval-Augmented Generation | "Find relevant clinical trial data for indication X" |
| `summary_score` | Document summarization | "Summarize 50-page HTA dossier into 2 pages" |
| `generation_score` | Content generation | "Draft medical information response letter" |
| `classification_score` | Categorization tasks | "Classify adverse event reports by severity" |
| `reasoning_score` | Complex reasoning | "Determine optimal pricing strategy for new market" |
| `automation_score` | Full automation potential | "Extract structured data from unstructured forms" |

### Opportunity Priority (ODI)
| Priority | Opportunity Score | Meaning |
|----------|-------------------|---------|
| **High** | > 12 | Underserved, high-value opportunity (automate first) |
| **Medium** | 8-12 | Moderate opportunity (augment or improve) |
| **Low** | < 8 | Adequately served (maintain current state) |

**Formula:**
```
opportunity_score = importance + MAX(importance - satisfaction, 0)

Example:
  importance = 9 (very important)
  satisfaction = 3 (poorly served)
  → opportunity_score = 9 + (9 - 3) = 15 (HIGH priority)
```

---

## Common Queries

### 1. Find High-Value AI Opportunities
```sql
SELECT
  j.name,
  ais.overall_score AS ai_suitability,
  ais.recommended_intervention_type,
  COUNT(auc.id) AS use_case_count
FROM jtbd j
JOIN jtbd_ai_suitability ais ON j.id = ais.jtbd_id
LEFT JOIN ai_use_cases auc ON j.id = auc.jtbd_id
WHERE ais.overall_score > 0.7
GROUP BY j.id, ais.overall_score, ais.recommended_intervention_type
ORDER BY ais.overall_score DESC;
```

### 2. Find Underserved Outcomes (High Opportunity)
```sql
SELECT
  j.name AS jtbd_name,
  o.outcome_statement,
  o.importance_score,
  o.satisfaction_score,
  o.opportunity_score,
  o.opportunity_priority
FROM jtbd_outcomes o
JOIN jtbd j ON j.id = o.jtbd_id
WHERE o.opportunity_priority = 'high'
ORDER BY o.opportunity_score DESC
LIMIT 10;
```

### 3. Get Complete JTBD Context (One Query)
```sql
SELECT *
FROM v_jtbd_gold_standard_complete
WHERE code = 'JTBD-MA-001';
```

### 4. Find JTBDs by Strategic Pillar
```sql
SELECT
  j.code,
  j.name,
  sp.name AS strategic_pillar,
  cm.relevance_score
FROM jtbd j
JOIN jtbd_category_mappings cm ON j.id = cm.jtbd_id
JOIN strategic_pillars sp ON cm.pillar_id = sp.id
WHERE sp.code = 'SP05' -- Data-Driven Decision Making
ORDER BY cm.relevance_score DESC;
```

### 5. Find Critical Obstacles Blocking JTBDs
```sql
SELECT
  j.name AS jtbd_name,
  obs.obstacle_text,
  obs.obstacle_type,
  obs.severity,
  obs.workaround
FROM jtbd_obstacles obs
JOIN jtbd j ON j.id = obs.jtbd_id
WHERE obs.severity = 'critical'
  AND obs.is_removable = true
ORDER BY j.name;
```

### 6. Service Panel Composition
```sql
SELECT
  sm.service_layer,
  spm.role_in_panel,
  a.name AS agent_name,
  a.tier,
  spm.sequence_order
FROM jtbd_service_mappings sm
JOIN service_panel_members spm ON sm.id = spm.service_mapping_id
JOIN agents a ON spm.agent_id = a.id
WHERE sm.jtbd_id = 'your-jtbd-uuid'
ORDER BY spm.role_in_panel, spm.sequence_order;
```

### 7. Persona AI Preferences
```sql
SELECT
  p.name AS persona_name,
  pap.preference_type,
  pap.preference_value,
  pap.is_default
FROM persona_ai_preferences pap
JOIN personas p ON pap.persona_id = p.id
WHERE p.name = 'Dr. Sarah Chen'
ORDER BY pap.preference_type;
```

### 8. Workflow Task Dependencies (Critical Path)
```sql
WITH RECURSIVE task_hierarchy AS (
  -- Anchor: Tasks with no dependencies
  SELECT
    wt.id,
    wt.task_name,
    0 AS depth,
    ARRAY[wt.id] AS path
  FROM workflow_tasks wt
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_task_dependencies wtd
    WHERE wtd.workflow_task_id = wt.id
  )

  UNION ALL

  -- Recursive: Tasks depending on previous tasks
  SELECT
    wt.id,
    wt.task_name,
    th.depth + 1,
    th.path || wt.id
  FROM workflow_tasks wt
  JOIN workflow_task_dependencies wtd ON wt.id = wtd.workflow_task_id
  JOIN task_hierarchy th ON wtd.depends_on_task_id = th.id
  WHERE NOT (wt.id = ANY(th.path)) -- Prevent cycles
)
SELECT
  depth,
  task_name,
  array_length(path, 1) AS path_length
FROM task_hierarchy
ORDER BY depth, task_name;
```

---

## Migration Checklist

### Pre-Migration
- [ ] Create backup schema (`jtbd_backup_YYYYMMDD`)
- [ ] Document all JSONB field schemas
- [ ] Test migration scripts on staging
- [ ] Verify foreign key relationships

### Migration
- [ ] Phase 1: Create new tables (11 tables)
- [ ] Phase 2: Seed reference data (pillars, intervention types)
- [ ] Phase 3: Migrate JSONB → normalized tables
- [ ] Phase 4: Drop old JSONB columns
- [ ] Phase 5: Create comprehensive views
- [ ] Phase 6: Final verification

### Post-Migration
- [ ] Verify data integrity (row counts match)
- [ ] Test all queries (< 1s response time)
- [ ] Update application code
- [ ] Deploy to production
- [ ] Monitor performance

---

## File Locations

| File | Purpose |
|------|---------|
| `JTBD_GOLD_STANDARD_L3_SCHEMA.md` | Complete architecture & DDL |
| `MIGRATION_TO_GOLD_STANDARD_L3.sql` | Migration script (6 phases) |
| `GOLD_STANDARD_QUICK_REFERENCE.md` | This file (quick lookup) |
| `JTBD_SCHEMA_REFERENCE.md` | Current schema documentation |
| `JTBD_NORMALIZED_ARCHITECTURE.md` | Normalization principles |

---

## Support & Questions

**Documentation**: `.claude/docs/platform/jtbds/`
**Agent**: `vital-data-strategist`
**Status**: ✅ Production-Ready
**Version**: 3.0
**Last Updated**: November 29, 2024
