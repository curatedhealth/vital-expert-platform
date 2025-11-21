# Medical Affairs Personas - Schema Mapping Analysis
**Database**: bomltkhixeatxuoxmolq (Vital-expert)
**Source**: Medical_Affairs_Personas_Part1_of_3_COMPLETE.json
**Date**: 2025-11-16
**Golden Rule**: NO JSONB - Everything must be normalized

---

## JSON Structure (27 sections per persona)

### Scalar/Simple Fields (sections 1-9)
1. **section** → TEXT field
2. **persona_number** → INTEGER field
3. **core_info** (dict) → Columns in `personas` table
4. **professional_profile** (dict) → Columns in `personas` table
5. **organization_context** (dict) → Columns in `personas` table
6. **demographics** (dict) → Columns in `personas` table
7. **quantitative_benchmarks** (dict) → Columns in `personas` table
8. **work_style** (dict) → Columns in `personas` table
9. **narrative_fields** (dict) → Columns in `personas` table

### Complex Fields - Requires Junction Tables (sections 10-27)
10. **vpanes_scoring** (dict) → `persona_vpanes_scoring` table ✅ EXISTS
11. **goals** (list) → `persona_goals` table ❌ MISSING
12. **success_metrics** (list) → `persona_success_metrics` table ✅ EXISTS
13. **pain_points** (list) → `persona_pain_points` table ❌ MISSING
14. **challenges** (list) → `persona_challenges` table ❌ MISSING
15. **responsibilities** (list) → `persona_responsibilities` table ❌ MISSING
16. **tools** (list) → `persona_tools` table ❌ MISSING
17. **communication_channels** (list) → `persona_communication_channels` table ❌ MISSING
18. **decision_makers** (list) → `persona_decision_makers` table ❌ MISSING
19. **motivations** (list) → `persona_motivations` table ✅ EXISTS
20. **frustrations** (list) → `persona_frustrations` table ❌ MISSING
21. **quotes** (list) → `persona_quotes` table ❌ MISSING
22. **personality_traits** (list) → `persona_personality_traits` table ✅ EXISTS
23. **values** (list) → `persona_values` table ✅ EXISTS
24. **typical_day** (list) → `persona_typical_day` table ✅ EXISTS
25. **education** (list) → `persona_education` table ✅ EXISTS
26. **certifications** (list) → `persona_certifications` table ✅ EXISTS
27. **evidence_sources** (list) → `persona_evidence_sources` table ✅ EXISTS

---

## Current Database Schema Status

### ✅ EXISTING Tables (from migration 20251115000000)
- `persona_vpanes_scoring`
- `persona_success_metrics`
- `persona_motivations`
- `persona_personality_traits`
- `persona_values`
- `persona_typical_day`
- `persona_education`
- `persona_certifications`
- `persona_evidence_sources`

### ❌ MISSING Tables (need to create)
1. **persona_goals** - Professional/organizational goals
2. **persona_pain_points** - Specific pain points with priority/impact
3. **persona_challenges** - Challenges faced with complexity/urgency
4. **persona_responsibilities** - Key responsibilities
5. **persona_tools** - Tools and platforms used
6. **persona_communication_channels** - Preferred communication methods
7. **persona_decision_makers** - Who influences their decisions
8. **persona_frustrations** - Day-to-day frustrations
9. **persona_quotes** - Representative quotes

---

## Base `personas` Table - Required Columns

### Currently in Schema (from 06_personas_and_jtbds.sql):
```sql
-- Core Identity
id, tenant_id, name, slug, title, tagline

-- Professional Profile
role_id, function_id, department_id, seniority_level

-- Demographics
years_of_experience, typical_organization_size

-- Arrays (NEEDS TO BE NORMALIZED)
key_responsibilities → TEXT[] (should be persona_responsibilities table)
preferred_tools → TEXT[] (should be persona_tools table)

-- JSONB Fields (VIOLATES GOLDEN RULE - MUST REMOVE)
pain_points → JSONB (should be persona_pain_points table)
goals → JSONB (should be persona_goals table)
challenges → JSONB (should be persona_challenges table)
communication_preferences → JSONB (should be persona_communication_channels table)
metadata → JSONB (can keep for truly unstructured data)

-- Other
decision_making_style, avatar_url, avatar_description
is_active, validation_status, tags, created_at, updated_at, deleted_at
```

### ❌ MISSING Columns (need to add to base table):
From `core_info`:
- `role_slug` TEXT
- `function_slug` TEXT
- `department_slug` TEXT

From `professional_profile`:
- `years_in_current_role` INTEGER
- `years_in_industry` INTEGER
- `years_in_function` INTEGER
- `organization_type` TEXT[] or separate table
- `geographic_scope` TEXT

From `organization_context`:
- `reporting_to` TEXT
- `team_size` TEXT
- `team_size_typical` INTEGER
- `budget_authority` TEXT
- `direct_reports` INTEGER
- `span_of_control` TEXT

From `demographics`:
- `age_range` TEXT
- `education_level` TEXT
- `location_type` TEXT
- `typical_locations` TEXT[]
- `work_arrangement` TEXT

From `quantitative_benchmarks`:
- `salary_min_usd` INTEGER
- `salary_max_usd` INTEGER
- `salary_median_usd` INTEGER
- `salary_currency` TEXT DEFAULT 'USD'
- `salary_year` INTEGER
- `salary_sources` TEXT
- `sample_size` TEXT
- `confidence_level` TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high'))
- `data_recency` TEXT

From `work_style`:
- `decision_making_style` TEXT (already exists)
- `work_style_preference` TEXT
- `learning_style` TEXT
- `technology_adoption` TEXT
- `risk_tolerance` TEXT
- `change_readiness` TEXT

From `narrative_fields`:
- `one_liner` TEXT
- `background_story` TEXT

---

## Action Plan

### Phase 1: Extend Base `personas` Table
Add all missing scalar columns listed above

### Phase 2: Create Missing Junction Tables
Create 9 new normalized tables:
1. `persona_goals`
2. `persona_pain_points`
3. `persona_challenges`
4. `persona_responsibilities`
5. `persona_tools`
6. `persona_communication_channels`
7. `persona_decision_makers`
8. `persona_frustrations`
9. `persona_quotes`

### Phase 3: Remove JSONB Violations
- Migrate data from `pain_points` JSONB → `persona_pain_points` table
- Migrate data from `goals` JSONB → `persona_goals` table
- Migrate data from `challenges` JSONB → `persona_challenges` table
- Migrate data from `communication_preferences` JSONB → `persona_communication_channels` table
- Migrate data from `key_responsibilities` TEXT[] → `persona_responsibilities` table
- Migrate data from `preferred_tools` TEXT[] → `persona_tools` table

### Phase 4: Generate Seed Data
Create Python script to generate normalized SQL inserts from JSON

---

## Estimated Table Counts
- Base personas table: 16 personas (Part 1)
- persona_goals: ~64 rows (4 per persona)
- persona_pain_points: ~80 rows (5 per persona)
- persona_challenges: ~48 rows (3 per persona)
- persona_responsibilities: ~80 rows (5 per persona)
- persona_tools: ~64 rows (4 per persona)
- persona_communication_channels: ~64 rows (4 per persona)
- persona_decision_makers: ~80 rows (5 per persona)
- persona_frustrations: ~48 rows (3 per persona)
- persona_quotes: ~48 rows (3 per persona)
- **Total new rows**: ~576 rows across junction tables

---

## Next Steps
1. Create comprehensive schema migration SQL
2. Create Python generator for normalized seed data
3. Test on bomltkhixeatxuoxmolq database
4. Process Part 2 and Part 3 using same structure
