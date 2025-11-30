# Persona Seeding - Complete Guide

## Overview

This guide provides everything needed to seed personas into the VITAL database using the Gold Standard schema.

**Status**: ✅ Schema exists in database  
**Version**: 1.0.0  
**Last Updated**: 2025-11-28

---

## Quick Start

### 1. **Use the Template**

Copy the seed template and customize it:

```bash
cp .claude/docs/platform/personas/seeds/PERSONA_SEED_TEMPLATE.sql \
   .claude/docs/platform/personas/seeds/medical_affairs/NEW_ROLE_PERSONAS_SEED.sql
```

### 2. **Replace Placeholders**

| Placeholder | Example | Description |
|------------|---------|-------------|
| `{TENANT_SLUG}` | `pharma` | Tenant identifier |
| `{ROLE_NAME}` | `Medical Science Liaison` | Full role name |
| `{ROLE_SLUG}` | `medical-science-liaison` | URL-safe role identifier |
| `{FUNCTION_NAME}` | `Medical Affairs` | Business function |
| `{DEPARTMENT_NAME}` | `Field Medical` | Department |

### 3. **Run the Seed File**

```sql
-- Using Supabase MCP tool
mcp_supabase_execute_sql --query "$(cat path/to/seed_file.sql)"

-- Or via Supabase CLI
supabase db exec --file path/to/seed_file.sql
```

---

## MECE Archetype Framework

Every role requires **exactly 4 personas** representing the 2x2 archetype matrix:

| Archetype | AI Maturity | Work Complexity | Service Layer |
|-----------|-------------|-----------------|---------------|
| **AUTOMATOR** | 70-85 (High) | 20-45 (Routine) | WORKFLOWS |
| **ORCHESTRATOR** | 80-95 (High) | 70-90 (Strategic) | ASK_PANEL / SOLUTION_BUILDER |
| **LEARNER** | 20-40 (Low) | 20-45 (Routine) | ASK_EXPERT |
| **SKEPTIC** | 20-35 (Low) | 70-90 (Strategic) | ASK_PANEL |

---

## Seed File Structure

```sql
BEGIN;

-- 1. DISABLE TRIGGERS
ALTER TABLE personas DISABLE TRIGGER trigger_update_gen_ai_readiness;

-- 2. LOOKUP & VARIABLES
DO $$
DECLARE
    v_tenant_id UUID;
    -- ... other variables
BEGIN
    -- Lookup tenant, function, department, role
    
    -- 3. CLEANUP (Idempotent)
    DELETE FROM personas WHERE role_name = '{ROLE_NAME}';
    
    -- 4. CREATE 4 PERSONAS
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_automator_id;
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_orchestrator_id;
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_learner_id;
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_skeptic_id;
    
    -- 5. JUNCTION TABLES
    INSERT INTO persona_pain_points (...) VALUES (...);
    INSERT INTO persona_goals (...) VALUES (...);
    INSERT INTO persona_vpanes_scoring (...) VALUES (...);
    -- ... more junction tables
    
END $$;

-- 6. RE-ENABLE TRIGGERS
ALTER TABLE personas ENABLE TRIGGER trigger_update_gen_ai_readiness;

-- 7. VERIFICATION
SELECT * FROM personas WHERE role_name = '{ROLE_NAME}';

COMMIT;
```

---

## Required Fields

### Core Identity (Required)
- `name` - Full name with archetype suffix
- `slug` - Unique identifier (use archetype suffix)
- `title` - Job title
- `tagline` - One-sentence descriptor
- `archetype` - Must be: AUTOMATOR, ORCHESTRATOR, LEARNER, or SKEPTIC

### Scores (Required)
- `ai_maturity_score` - Numeric (0-100)
- `work_complexity_score` - Numeric (0-100)
- `archetype_confidence` - Numeric (0.70-0.95 recommended)

### Organizational (Required)
- `tenant_id` - UUID from tenants table
- `role_name`, `function_name`, `department_name` - For denormalized queries

### Optional But Recommended
- `role_id`, `function_id`, `department_id` - Foreign keys (if available)
- `seniority_level` - entry, mid, senior, director, vp, c_level
- `years_of_experience` - Integer
- `preferred_service_layer` - Inferred from archetype if omitted
- `background_story` - Narrative context
- `a_day_in_the_life` - Typical day activities

---

## Junction Tables

### Available Junction Tables

| Table | Purpose | Typical Count |
|-------|---------|---------------|
| `persona_pain_points` | Frustrations & problems | 3-5 per persona |
| `persona_goals` | Objectives & aspirations | 2-4 per persona |
| `persona_motivations` | Drivers & incentives | 2-3 per persona |
| `persona_challenges` | Obstacles | 3-4 per persona |
| `persona_typical_day` | Day-in-life activities | 8-12 per persona |
| `persona_tools_used` | Tech stack | 5-8 per persona |
| `persona_stakeholders` | Key relationships | 4-6 per persona |
| `persona_vpanes_scoring` | VPANES scores | 1 per persona |
| `persona_success_metrics` | KPIs | 3-5 per persona |
| `persona_education` | Background | 1-3 per persona |
| `persona_certifications` | Credentials | 0-5 per persona |

### Junction Table Pattern

```sql
INSERT INTO persona_pain_points (
    persona_id, tenant_id, pain_point, category, 
    severity, frequency, is_ai_addressable, sequence_order
) VALUES
    (v_automator_id, v_tenant_id, 
     'Manual CRM data entry consumes 8+ hours weekly', 
     'process', 'high', 'constantly', true, 1),
    (v_automator_id, v_tenant_id, 
     'Repetitive literature searches for each KOL meeting', 
     'time', 'moderate', 'frequently', true, 2);
```

---

## Common Issues & Solutions

### Issue 1: "Column does not exist"

**Cause**: The schema hasn't been migrated yet, or column name mismatch  
**Solution**: 
1. Check current schema: Run `check_current_persona_schema.sql`
2. Verify column names match the export in `personas_rows (1).sql`
3. The schema already exists - no migration needed!

### Issue 2: "Trigger function does not exist"

**Cause**: The `trigger_update_gen_ai_readiness` trigger has type mismatches  
**Solution**: Disable the trigger at the start of the seed file:

```sql
ALTER TABLE personas DISABLE TRIGGER trigger_update_gen_ai_readiness;
-- ... seed data ...
ALTER TABLE personas ENABLE TRIGGER trigger_update_gen_ai_readiness;
```

### Issue 3: "Foreign key constraint violation"

**Cause**: Referenced entity (tenant, role, function, department) doesn't exist  
**Solution**: 
1. Check entity exists first:
```sql
SELECT id FROM tenants WHERE slug = 'pharma';
SELECT id FROM org_roles WHERE slug = 'medical-science-liaison';
```
2. Use NULL for foreign keys if entity doesn't exist (rely on denormalized names)

### Issue 4: "Enum value invalid"

**Cause**: Using wrong enum value for columns like `preferred_service_layer`, `archetype`  
**Solution**: Valid values are:
- `archetype`: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
- `preferred_service_layer`: ASK_EXPERT, ASK_PANEL, WORKFLOWS, SOLUTION_BUILDER, MIXED
- `budget_authority_level`: none, limited, moderate, significant, high
- `gen_ai_readiness_level`: beginner, developing, proficient, advanced, expert

---

## Verification Checklist

After running a seed file, verify:

- [ ] **4 personas created** - One for each archetype
- [ ] **Archetype scores** - AI maturity and work complexity align with archetype
- [ ] **Unique slugs** - No slug collisions
- [ ] **Pain points** - At least 3 per persona
- [ ] **Goals** - At least 2 per persona
- [ ] **VPANES scores** - Calculated for each persona
- [ ] **Typical day** - Activities mapped for at least Automator
- [ ] **No triggers disabled** - All triggers re-enabled at the end

### Verification Query

```sql
-- Check persona creation
SELECT 
    name,
    archetype,
    ai_maturity_score,
    work_complexity_score,
    preferred_service_layer,
    (SELECT COUNT(*) FROM persona_pain_points WHERE persona_id = p.id) as pain_points,
    (SELECT COUNT(*) FROM persona_goals WHERE persona_id = p.id) as goals
FROM personas p
WHERE role_name = '{ROLE_NAME}'
ORDER BY 
    CASE archetype
        WHEN 'AUTOMATOR' THEN 1
        WHEN 'ORCHESTRATOR' THEN 2
        WHEN 'LEARNER' THEN 3
        WHEN 'SKEPTIC' THEN 4
    END;
```

---

## File Naming Convention

Follow the VITAL naming convention:

```
{LEVEL}_{ENTITY}_{DESCRIPTIVE_NAME}.{EXT}

Examples:
- 01_msl_personas_seed.sql
- 02_medical_director_personas_seed.sql
- 03_regulatory_affairs_personas_seed.sql
```

**Location**: `.claude/docs/platform/personas/seeds/{function_name}/`

---

## Next Steps

1. ✅ Copy `PERSONA_SEED_TEMPLATE.sql` for your role
2. ✅ Replace all placeholders with actual values
3. ✅ Fill in the 4 archetype personas
4. ✅ Add junction table data (pain points, goals, etc.)
5. ✅ Run the seed file
6. ✅ Verify with the verification query
7. ✅ Update `validation_status` to 'validated' when reviewed

---

## Related Documentation

- [PERSONA_MASTER_STRATEGY.md](../PERSONA_MASTER_STRATEGY.md) - Complete strategy document
- [PERSONA_SCHEMA_GOLD_STANDARD.md](../PERSONA_SCHEMA_GOLD_STANDARD.md) - Schema reference
- [SCHEMA_DISCOVERY.md](./SCHEMA_DISCOVERY.md) - Schema versions and troubleshooting
- [MSL_PERSONAS_SEED.sql](./medical_affairs/MSL_PERSONAS_SEED.sql) - Working example

---

## Support

For issues or questions:
1. Check [Common Issues](#common-issues--solutions) section
2. Review working examples in `medical_affairs/` directory
3. Run `check_current_persona_schema.sql` to diagnose schema state
4. Consult [PERSONA_MASTER_STRATEGY.md](../PERSONA_MASTER_STRATEGY.md) for strategic context

