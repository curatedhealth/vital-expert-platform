# Persona Schema Normalization Plan

**Version**: 1.0.0
**Last Updated**: November 27, 2025
**Status**: Planning

---

## Executive Summary

The current persona schema has normalization issues that need to be addressed before reliable data seeding can occur.

---

## Issue 1: Denormalized Columns in `personas` Table

### Current State
The `personas` table has redundant columns that duplicate data from related tables:

| Column | Type | Issue | Source Table |
|--------|------|-------|--------------|
| `role_id` | UUID | ✅ Correct FK | `org_roles` |
| `role_name` | TEXT | ❌ Duplicate | Should come from `org_roles.name` |
| `role_slug` | TEXT | ❌ Duplicate | Should come from `org_roles.slug` |
| `function_id` | UUID | ✅ Correct FK | `org_functions` |
| `function_name` | TEXT | ❌ Duplicate | Should come from `org_functions.name` |
| `function_slug` | TEXT | ❌ Duplicate | Should come from `org_functions.slug` |
| `department_id` | UUID | ✅ Correct FK | `org_departments` |
| `department_name` | TEXT | ❌ Duplicate | Should come from `org_departments.name` |
| `department_slug` | TEXT | ❌ Duplicate | Should come from `org_departments.slug` |
| `persona_id` | UUID | ❌ Redundant | Same as `id` |

### Recommendation
**Option A (Preferred)**: Remove duplicate columns, use JOINs
- Drop: `role_name`, `role_slug`, `function_name`, `function_slug`, `department_name`, `department_slug`, `persona_id`
- Create VIEW for backward compatibility

**Option B**: Keep as denormalized cache with trigger sync
- Keep columns but ensure trigger `trigger_sync_persona_org_names` keeps them in sync
- This is already partially implemented

### Decision Needed
- [ ] Choose Option A (full normalization) or Option B (keep cache)

---

## Issue 2: Check Constraints vs Lookup Tables

### Current State
Over 100 check constraints hardcode allowed values. This makes:
- Adding new values require schema migration
- No way to store metadata about values (descriptions, display order, etc.)
- Inconsistent naming conventions across tables

### Examples of Inconsistent Naming

| Table | Column | Values |
|-------|--------|--------|
| `persona_aspirations` | `timeframe` | `short_term`, `medium_term`, `long_term` |
| `persona_buying_process` | `approval_process_complexity` | `simple`, `moderate`, `complex`, `very_complex` |
| `persona_buying_triggers` | `urgency_level` | `immediate`, `high`, `medium`, `low` |
| `persona_challenges` | `impact` | `critical`, `high`, `medium`, `low` |
| `persona_fears` | `likelihood` | `high`, `medium`, `low` |

### Recommendation
**Phase 1**: Document all valid values (immediate need for seeding)
**Phase 2**: Create lookup tables for frequently used value sets
**Phase 3**: Migrate check constraints to FK references

---

## Issue 3: Missing Trigger Function

The trigger `trigger_update_gen_ai_readiness` calls `calculate_gen_ai_readiness_level()` with incorrect argument types.

### Current Error
```
function calculate_gen_ai_readiness_level(numeric, text, text, text) does not exist
```

### Expected Signature
```sql
calculate_gen_ai_readiness_level(
    p_ai_maturity_score numeric,
    p_technology_adoption technology_adoption,  -- ENUM, not TEXT
    p_risk_tolerance risk_tolerance,            -- ENUM, not TEXT
    p_change_readiness change_readiness         -- ENUM, not TEXT
)
```

### Solution
Either:
1. Fix the function to accept TEXT types, OR
2. Ensure personas table uses proper enum types, OR
3. Disable trigger during seeding (current workaround)

---

## Valid Values Reference (For Seeding)

### High-Priority Tables for Medical Affairs Personas

#### `persona_aspirations.timeframe`
- `short_term`
- `medium_term`
- `long_term`

#### `persona_buying_process.approval_process_complexity`
- `simple`
- `moderate`
- `complex`
- `very_complex`

#### `persona_buying_triggers.trigger_type`
- `regulatory`
- `competitive`
- `internal_initiative`
- `crisis`
- `growth`

#### `persona_buying_triggers.urgency_level`
- `immediate`
- `high`
- `medium`
- `low`

#### `persona_challenges.challenge_type`
- `technical`
- `organizational`
- `resource`
- `strategic`
- `operational`

#### `persona_challenges.impact`
- `critical`
- `high`
- `medium`
- `low`

#### `persona_goals.goal_type`
- `professional`
- `personal`
- `organizational`
- `career`

#### `persona_annual_conferences.conference_type`
- `industry`
- `technical`
- `leadership`
- `networking`
- `regulatory`

#### `persona_annual_conferences.role`
- `attendee`
- `speaker`
- `exhibitor`
- `organizer`

#### `persona_annual_conferences.networking_importance`
- `critical`
- `high`
- `medium`
- `low`

#### `persona_annual_conferences.typical_quarter`
- `Q1`
- `Q2`
- `Q3`
- `Q4`

#### `personas.budget_authority_level` (ENUM)
- `none`
- `limited`
- `moderate`
- `significant`
- `high`

#### `personas.preferred_service_layer` (ENUM)
- `ASK_EXPERT`
- `ASK_PANEL`
- `WORKFLOWS`
- `SOLUTION_BUILDER`
- `MIXED`

---

## Migration Priority

### Immediate (Before Seeding)
1. ✅ Document all valid constraint values (this document)
2. ⏳ Fix seed files to use correct values
3. ⏳ Test seeding with corrected values

### Short-Term (Post-Seeding)
1. Create migration to add missing lookup tables
2. Fix trigger function argument types
3. Add indexes for frequently queried columns

### Long-Term
1. Evaluate removing denormalized columns
2. Create comprehensive data validation layer
3. Add audit logging for persona changes

---

## Next Steps

1. [ ] Update `MEDICAL_DIRECTOR_PERSONAS_SEED.sql` with correct constraint values
2. [ ] Test complete seeding flow
3. [ ] Create reusable template with documented constraints
4. [ ] Update `SCHEMA_DISCOVERY.md` with constraint reference

---

**Maintained By**: VITAL Platform Team
**Last Review**: 2025-11-27

