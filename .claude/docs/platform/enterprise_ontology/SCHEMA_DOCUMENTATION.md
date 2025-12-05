# VITAL Enterprise Ontology - Schema Documentation

> **Version:** 1.0.0
> **Last Updated:** 2025-12-03
> **Database:** Supabase PostgreSQL
> **Graph Database:** Neo4j (sync pending)

## Overview

The VITAL Enterprise Ontology provides a comprehensive 8-layer semantic model for pharmaceutical organizational structure, Jobs-to-be-Done (JTBD), and AI transformation value mapping.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VITAL ONTOLOGY ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 1: Functions      │  15 pharma functions (Medical Affairs)  │
│  Layer 2: Departments    │  9+ depts per function                  │
│  Layer 3: Roles          │  5-15 roles per department              │
│  Layer 4: JTBDs          │  100+ jobs-to-be-done                   │
│  Layer 5: Value          │  6 categories, 30+ drivers              │
│  Layer 6: AI Suitability │  Automation, Augmentation, Redesign     │
│  Layer 7: Personas       │  4 MECE archetypes per role             │
│  Layer 8: Workflows      │  Multi-stage workflow templates         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Core Tables](#1-core-tables)
2. [Junction Tables](#2-junction-tables)
3. [PostgreSQL Views (17 Total)](#3-postgresql-views)
4. [API Endpoints](#4-api-endpoints)
5. [GDS Query Templates](#5-gds-query-templates)
6. [Data Flow Diagram](#6-data-flow-diagram)

---

## 1. Core Tables

### 1.1 Organizational Structure

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `org_functions` | L1 - Pharmaceutical functions | `id`, `name`, `slug`, `mission_statement`, `regulatory_sensitivity` |
| `org_departments` | L2 - Departments within functions | `id`, `name`, `function_id`, `operating_model`, `field_vs_office_mix` |
| `org_roles` | L3 - Organizational roles | `id`, `name`, `job_code`, `department_id`, `function_id`, `seniority_level`, `hcp_facing`, `gxp_critical` |
| `personas` | L7 - Behavioral personas | `id`, `persona_name`, `source_role_id`, `derived_archetype`, `ai_readiness_score`, `work_complexity_score` |

### 1.2 Jobs-to-be-Done

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `jtbd` | L4 - Core JTBD definitions | `id`, `code`, `name`, `job_statement`, `job_category`, `complexity`, `frequency`, `odi_tier`, `importance_score`, `satisfaction_score`, `opportunity_score` |
| `jtbd_ai_suitability` | L6 - AI readiness scores | `jtbd_id`, `rag_score`, `summary_score`, `generation_score`, `automation_score`, `overall_ai_readiness`, `intervention_type_name` |

### 1.3 Value Framework

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `value_categories` | L5 - Six value dimensions | `id`, `code`, `name`, `description`, `color`, `sort_order` |
| `value_drivers` | L5 - Specific value drivers | `id`, `code`, `name`, `value_category`, `primary_category_id`, `impact_weight`, `is_active` |

### 1.4 Workflows

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `workflow_templates` | L8 - Workflow definitions | `id`, `name`, `jtbd_id`, `total_stages`, `estimated_duration_hours` |
| `workflow_stages` | Stage definitions | `id`, `template_id`, `stage_name`, `stage_number`, `stage_type` |
| `workflow_tasks` | Task definitions | `id`, `stage_id`, `task_name`, `task_order` |

---

## 2. Junction Tables

### 2.1 JTBD Mappings (ID + NAME Pattern)

All JTBD junction tables cache both ID and NAME for join-free queries:

| Junction Table | Connects | Additional Columns |
|----------------|----------|-------------------|
| `jtbd_functions` | JTBD ↔ Function | `function_name`, `relevance_score` |
| `jtbd_departments` | JTBD ↔ Department | `department_name`, `relevance_score` |
| `jtbd_roles` | JTBD ↔ Role | `role_name`, `relevance_score`, `importance`, `frequency`, `is_primary` |
| `jtbd_value_categories` | JTBD ↔ Value Category | `category_name`, `relevance_score` |
| `jtbd_value_drivers` | JTBD ↔ Value Driver | `driver_name`, `impact_score` |

### 2.2 Multi-Tenant Mappings

| Junction Table | Purpose |
|----------------|---------|
| `function_tenants` | Map functions to tenants |
| `department_tenants` | Map departments to tenants |
| `role_tenants` | Map roles to tenants |
| `persona_tenants` | Map personas to tenants |

---

## 3. PostgreSQL Views (17 Total)

### 3.1 Base Ontology Views (6 Views)

Deployed in `deploy_views.sql`:

| View | Purpose | Key Joins |
|------|---------|-----------|
| `v_persona_work_mix` | Persona analysis with JTBD categorization | personas → org_roles → jtbd_roles → jtbd |
| `v_jtbd_complete` | Complete JTBD with all mappings | jtbd → all junction tables |
| `v_ontology_summary` | Entity counts by type | All core tables |
| `v_medical_affairs_coverage` | MA function coverage | org_functions → org_departments → org_roles |
| `v_jtbd_odi_opportunities` | ODI-scored opportunities | jtbd → jtbd_ai_suitability |
| `v_value_coverage` | Value category coverage | value_categories → jtbd_value_categories |

### 3.2 Effective Views (11 Views)

Deployed in `deploy_effective_views.sql`:

#### JTBD Views

| View | Purpose | Key Features |
|------|---------|--------------|
| `v_effective_jtbd_hierarchy` | JTBD organizational mapping | Aggregates functions, departments, roles per JTBD |
| `v_effective_jtbd_value` | JTBD value delivery | Value categories and drivers with impact scores |
| `v_effective_jtbd_ai` | JTBD AI readiness | All AI suitability scores, intervention types |

#### Value Views

| View | Purpose | Key Features |
|------|---------|--------------|
| `v_effective_value_driver_hierarchy` | Recursive value driver tree | Uses CTE for parent-child hierarchy |
| `v_effective_value_impact` | Value driver impact analysis | Average impact, connected JTBDs |
| `v_effective_jtbd_value_matrix` | JTBD × Value Category matrix | Pivot-ready for visualization |

#### Workflow Views

| View | Purpose | Key Features |
|------|---------|--------------|
| `v_effective_workflow_complete` | Full workflow with stages | Aggregated stage names, tool requirements |
| `v_effective_workflow_jtbd` | Workflow-JTBD alignment | Links workflows to JTBD opportunity scores |

#### Organizational Views

| View | Purpose | Key Features |
|------|---------|--------------|
| `v_effective_role_jtbd` | Role-JTBD analysis | Role with all assigned JTBDs |
| `v_effective_org_hierarchy` | Complete org structure | Function → Department → Role hierarchy |

#### AI Views

| View | Purpose | Key Features |
|------|---------|--------------|
| `v_effective_ai_opportunity` | AI opportunity analysis | Combines JTBD scores with organizational context |

---

## 4. API Endpoints

### 4.1 Base Ontology API (`/api/v1/ontology`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions` | GET | List all organizational functions |
| `/functions/{id}` | GET | Get single function by ID |
| `/departments` | GET | List departments (filter by function_id) |
| `/departments/{id}` | GET | Get single department by ID |
| `/roles` | GET | List roles (filter by function_id, department_id, etc.) |
| `/roles/{id}` | GET | Get single role by ID |
| `/hierarchy` | GET | Get full ontology hierarchy with counts |

### 4.2 Extended Ontology API (`/api/v1/ontology-extended`)

#### JTBD Endpoints

| Endpoint | Method | Description | View Used |
|----------|--------|-------------|-----------|
| `/jtbd` | GET | List all JTBDs | `jtbd` |
| `/jtbd-hierarchy` | GET | JTBD with org hierarchy | `v_effective_jtbd_hierarchy` |
| `/jtbd-ai` | GET | JTBD with AI scores | `v_effective_jtbd_ai` |

#### Value Driver Endpoints

| Endpoint | Method | Description | View Used |
|----------|--------|-------------|-----------|
| `/value-categories` | GET | List value categories | `value_categories` |
| `/value-drivers` | GET | List value drivers | `value_drivers` |
| `/value-drivers/hierarchy` | GET | Value driver tree | `v_effective_value_driver_hierarchy` |
| `/value-drivers/impact` | GET | Impact analysis | `v_effective_value_impact` |

#### Workflow Endpoints

| Endpoint | Method | Description | View Used |
|----------|--------|-------------|-----------|
| `/workflows` | GET | List workflow templates | `workflow_templates` |
| `/workflows-complete` | GET | Complete workflows | `v_effective_workflow_complete` |

#### AI Opportunity Endpoints

| Endpoint | Method | Description | View Used |
|----------|--------|-------------|-----------|
| `/ai-opportunities` | GET | AI opportunities | `v_effective_ai_opportunity` |
| `/ai-opportunities/by-function` | GET | Grouped by function | Aggregated query |

#### Summary Endpoints

| Endpoint | Method | Description | View Used |
|----------|--------|-------------|-----------|
| `/summary` | GET | Ontology summary stats | `v_ontology_summary` |
| `/value-coverage` | GET | Value coverage analysis | `v_value_coverage` |
| `/jtbd-value-matrix` | GET | JTBD × Value matrix | `v_effective_jtbd_value_matrix` |
| `/role-jtbd` | GET | Role-JTBD mappings | `v_effective_role_jtbd` |
| `/org-hierarchy` | GET | Org structure | `v_effective_org_hierarchy` |

---

## 5. GDS Query Templates

Neo4j Graph Data Science templates are available in `gds_query_templates.cypher`:

| Category | Queries | Purpose |
|----------|---------|---------|
| Graph Projections | 3 | Create in-memory graphs for analysis |
| Centrality Analysis | 3 | PageRank, Betweenness, Degree centrality |
| Community Detection | 3 | Louvain, Label Propagation, WCC |
| Similarity Analysis | 2 | Node similarity, KNN |
| Path Analysis | 2 | Shortest paths for value delivery |
| AI Readiness Scoring | 2 | Custom algorithms for transformation |
| Utility Queries | 4 | Graph statistics and maintenance |
| Medical Affairs Specific | 3 | Focused analysis for MA function |

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  Functions   │───▶│ Departments  │───▶│    Roles     │         │
│  │   (L1)       │    │    (L2)      │    │    (L3)      │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                   │                   │                  │
│         │                   │                   ▼                  │
│         │                   │          ┌──────────────┐           │
│         │                   │          │   Personas   │           │
│         │                   │          │    (L7)      │           │
│         │                   │          └──────────────┘           │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│  ┌────────────────────────────────────────────────┐               │
│  │              JTBD Junction Tables               │               │
│  │  jtbd_functions │ jtbd_departments │ jtbd_roles │               │
│  └────────────────────────────────────────────────┘               │
│                           │                                        │
│                           ▼                                        │
│                   ┌──────────────┐                                 │
│                   │    JTBDs     │                                 │
│                   │    (L4)      │                                 │
│                   └──────────────┘                                 │
│                     │         │                                    │
│         ┌───────────┘         └───────────┐                       │
│         ▼                                 ▼                        │
│  ┌──────────────┐                ┌──────────────┐                 │
│  │    Value     │                │      AI      │                 │
│  │ Categories   │◀──────────────▶│  Suitability │                 │
│  │   (L5)       │                │    (L6)      │                 │
│  └──────────────┘                └──────────────┘                 │
│         │                                                          │
│         ▼                                                          │
│  ┌──────────────┐                                                 │
│  │    Value     │                                                 │
│  │   Drivers    │                                                 │
│  │   (L5)       │                                                 │
│  └──────────────┘                                                 │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  Workflows   │───▶│   Stages     │───▶│    Tasks     │         │
│  │   (L8)       │    │              │    │              │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                                                          │
│         ▼                                                          │
│  Links to JTBD via jtbd_id                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Principles

### 1. Role-Centric Architecture
- Roles define structural truth (responsibilities, tools, budget, scope)
- Personas are behavioral deltas (overrides, additions)
- Use effective views to combine role baseline + persona deltas

### 2. ID + NAME Pattern
- All junction tables cache both ID and NAME
- Enables join-free queries for better performance
- Example: `WHERE function_name = 'Medical Affairs'` (no joins needed)

### 3. Zero JSONB for Queryable Data
- All multi-valued attributes use junction tables
- JSONB allowed only for experimental metadata
- Ensures proper indexing and querying

### 4. Multi-Tenant via Junction Tables
- `*_tenants` junction tables for tenant mapping
- One role/function can serve multiple tenants
- Never hardcode `tenant_id` in main tables

### 5. ODI Scoring Framework
- Importance Score (1-10): How critical is this job?
- Satisfaction Score (1-10): How well is it done today?
- Opportunity Score: `Importance + (Importance - Satisfaction)`
- Tiers: extreme (≥15), high (≥12), promising (≥10), moderate (≥7), low (<7)

---

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `deploy_views.sql` | 6 base ontology views | `sql/` |
| `deploy_effective_views.sql` | 11 effective views | `sql/` |
| `gds_query_templates.cypher` | Neo4j GDS queries | `sql/` |
| `ontology.py` | Base API router | `ai-engine/src/api/routers/enterprise_ontology/` |
| `ontology_extended.py` | Extended API router | `ai-engine/src/api/routers/enterprise_ontology/` |
| `SCHEMA_DOCUMENTATION.md` | This document | Current location |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-03 | Initial documentation with 17 views, API endpoints, GDS templates |
