# Persona Schema Deployment Guide

**Version**: 2.0.0  
**Last Updated**: November 28, 2025  
**Status**: Ready for Deployment

---

## Overview

This guide covers the deployment of the **Gold Standard Persona Schema** - a fully normalized, scalable database design for the VITAL platform's persona system.

## Pre-Deployment Checklist

- [ ] Backup existing database
- [ ] Review migration file: `20251128000001_persona_gold_standard_schema.sql`
- [ ] Verify Supabase project is running
- [ ] Test migration on development branch first

## Migration File Location

```
supabase/migrations/20251128000001_persona_gold_standard_schema.sql
```

## What This Migration Creates

### 1. Enum Types (5)

| Enum | Values |
|------|--------|
| `archetype_enum` | AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC |
| `work_pattern_enum` | routine, strategic, mixed |
| `budget_authority_enum` | none, limited, moderate, significant, high |
| `gen_ai_readiness_enum` | beginner, developing, intermediate, advanced |
| `service_layer_enum` | ASK_EXPERT, ASK_PANEL, WORKFLOWS, SOLUTION_BUILDER, MIXED |

### 2. Lookup Tables (10)

| Table | Purpose | Records |
|-------|---------|---------|
| `lookup_seniority_levels` | Career levels | 9 |
| `lookup_organization_sizes` | Company sizes | 5 |
| `lookup_technology_adoption` | Rogers' curve | 5 |
| `lookup_risk_tolerance` | Risk appetite | 5 |
| `lookup_change_readiness` | Change acceptance | 5 |
| `lookup_geographic_scopes` | Territory coverage | 5 |
| `lookup_pain_point_categories` | Pain categories | 7 |
| `lookup_severity_levels` | Impact severity | 4 |
| `lookup_frequency_levels` | Occurrence frequency | 4 |
| `lookup_timeframes` | Time horizons | 5 |

### 3. Persona Junction Tables (21)

| Table | Records/Persona | Purpose |
|-------|-----------------|---------|
| `persona_pain_points` | 5-10 | Frustrations |
| `persona_goals` | 3-7 | Objectives |
| `persona_motivations` | 3-5 | Drivers |
| `persona_typical_day` | 6-12 | Daily activities |
| `persona_challenges` | 3-7 | Workplace issues |
| `persona_tools_used` | 5-10 | Technology stack |
| `persona_information_sources` | 3-7 | Learning sources |
| `persona_education` | 1-3 | Degrees |
| `persona_certifications` | 0-5 | Credentials |
| `persona_success_metrics` | 3-5 | KPIs |
| `persona_vpanes_scoring` | 1 | Priority scores |
| `persona_aspirations` | 2-4 | Career goals |
| `persona_personality_traits` | 3-5 | Characteristics |
| `persona_values` | 3-5 | Core beliefs |
| `persona_buying_process` | 1 | Purchase behavior |
| `persona_buying_triggers` | 3-5 | Purchase triggers |
| `persona_objections` | 3-5 | Common objections |
| `persona_adoption_barriers` | 3-5 | AI barriers |
| `persona_communication_preferences` | 2-4 | Channel prefs |
| `persona_content_preferences` | 3-5 | Content prefs |
| `persona_jtbd` | 3-7 | Jobs to be done |

### 4. Role-Level Tables (3)

| Table | Purpose |
|-------|---------|
| `role_responsibilities` | Shared responsibilities |
| `role_skills` | Required skills |
| `role_kpis` | Performance metrics |

### 5. Views (3)

| View | Purpose |
|------|---------|
| `v_personas_complete` | Full persona with all JOINs |
| `v_personas_summary` | Lightweight listing |
| `v_archetype_distribution` | Analytics by archetype |

### 6. Functions (4)

| Function | Purpose |
|----------|---------|
| `calculate_gen_ai_readiness_level()` | Score calculation |
| `infer_preferred_service_layer()` | Service routing |
| `trigger_calculate_gen_ai_readiness()` | Auto-calculate on insert |
| `trigger_sync_persona_org_names()` | Sync denormalized names |

### 7. Indexes (40+)

Comprehensive indexes on all foreign keys, common query patterns, and lookup codes.

---

## Deployment Steps

### Option 1: Via Supabase CLI (Recommended)

```bash
# Navigate to project root
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path

# Apply migration
npx supabase db push
```

### Option 2: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `20251128000001_persona_gold_standard_schema.sql`
3. Paste and execute

### Option 3: Via MCP Tool

```sql
-- Run via mcp_supabase_apply_migration
-- Name: persona_gold_standard_schema
-- Query: [contents of migration file]
```

---

## Post-Deployment Verification

### 1. Check Enum Types

```sql
SELECT typname, enumlabel 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE typname LIKE '%enum%'
ORDER BY typname, enumsortorder;
```

### 2. Check Lookup Tables

```sql
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM lookup_seniority_levels) as seniority_count,
    (SELECT COUNT(*) FROM lookup_organization_sizes) as org_size_count,
    (SELECT COUNT(*) FROM lookup_technology_adoption) as tech_adoption_count
FROM pg_tables
WHERE tablename LIKE 'lookup_%'
LIMIT 1;
```

### 3. Check Junction Tables

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c 
     WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name LIKE 'persona_%'
ORDER BY table_name;
```

### 4. Check Views

```sql
SELECT viewname FROM pg_views 
WHERE viewname LIKE 'v_persona%';
```

### 5. Check Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%persona%' 
   OR routine_name LIKE '%gen_ai%';
```

### 6. Check Triggers

```sql
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'personas';
```

---

## Rollback Plan

If issues occur, rollback by:

```sql
-- Drop views
DROP VIEW IF EXISTS v_personas_complete CASCADE;
DROP VIEW IF EXISTS v_personas_summary CASCADE;
DROP VIEW IF EXISTS v_archetype_distribution CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_gen_ai_readiness ON personas;
DROP TRIGGER IF EXISTS trigger_sync_persona_org_names ON personas;

-- Note: Lookup tables and junction tables should NOT be dropped
-- as they may contain data. Only drop if empty.
```

---

## Data Migration (If Needed)

If you have existing persona data in old format:

```sql
-- Example: Migrate goals from JSONB to junction table
INSERT INTO persona_goals (persona_id, tenant_id, goal_text, goal_type, timeframe)
SELECT 
    p.id,
    p.tenant_id,
    goal_item->>'text',
    goal_item->>'type',
    goal_item->>'timeframe'
FROM personas p,
LATERAL jsonb_array_elements(p.goals) AS goal_item
WHERE p.goals IS NOT NULL;
```

---

## Testing Seed Data

After migration, test with a sample persona:

```sql
-- Insert test persona
INSERT INTO personas (
    tenant_id, name, slug, title, archetype,
    ai_maturity_score, work_complexity_score,
    technology_adoption, risk_tolerance, change_readiness,
    seniority_level, is_active
) VALUES (
    (SELECT id FROM tenants WHERE slug = 'pharma'),
    'Test Persona - Automator',
    'test-persona-automator',
    'Test Role',
    'AUTOMATOR',
    78.0, 45.0,
    'early_adopter', 'moderate', 'high',
    'director', true
) RETURNING id, gen_ai_readiness_level, preferred_service_layer;

-- Verify auto-calculated fields
-- Expected: gen_ai_readiness_level = 'intermediate' or 'advanced'
-- Expected: preferred_service_layer = 'WORKFLOWS'
```

---

## Related Documentation

| Document | Location |
|----------|----------|
| Master Strategy | `PERSONA_MASTER_STRATEGY.md` |
| Seed Template | `seeds/PERSONA_SEED_TEMPLATE.sql` |
| Schema Discovery | `seeds/SCHEMA_DISCOVERY.md` |
| Naming Convention | `.claude/NAMING_CONVENTION.md` |

---

## Support

For issues with this migration:
1. Check Supabase logs: Dashboard → Logs → Postgres
2. Review error messages for constraint violations
3. Verify foreign key references exist
4. Check for enum value mismatches

---

**Migration Author**: VITAL Platform Team  
**Review Status**: Ready for Production

