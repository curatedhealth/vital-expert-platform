# Medical Affairs Personas - Complete Setup Guide
**Database**: bomltkhixeatxuoxmolq (Vital-expert)
**Date**: 2025-11-16
**Status**: ✅ READY FOR EXECUTION
**Golden Rule**: ✅ NO JSONB - Everything Normalized

---

## 📋 Overview

Complete setup for Medical Affairs Personas with comprehensive v3.0 template support (27 sections per persona).

### What's Included
- **16 personas** in Part 1 (Leadership, Field Medical, Medical Information)
- **35+ new columns** added to base `personas` table
- **11 new junction tables** for full normalization
- **~576 junction table rows** for Part 1
- **100% JSONB-free** schema design

---

## 🗂️ Files Generated

### 1. Schema Analysis
**File**: `PERSONA_SCHEMA_MAPPING_ANALYSIS.md`
**Purpose**: Complete mapping of JSON structure to database tables
**Contents**:
- 27-section JSON structure breakdown
- Current vs. required schema comparison
- Missing tables and columns identification
- Action plan and row count estimates

### 2. Schema Migration
**File**: `migrations/COMPLETE_PERSONAS_NORMALIZATION.sql`
**Purpose**: Add all missing columns and tables
**Changes**:
- Extends `personas` table with 35+ new columns
- Creates 11 new normalized junction tables
- Removes JSONB violations
- Adds indexes for performance

**New Tables Created**:
1. `persona_goals` - Professional/organizational goals
2. `persona_pain_points` - Specific pain points with severity/impact
3. `persona_challenges` - Challenges with complexity/urgency
4. `persona_responsibilities` - Key responsibilities with time allocation
5. `persona_tools` - Tools/platforms with usage frequency
6. `persona_communication_channels` - Preferred communication methods
7. `persona_decision_makers` - Decision influence mapping
8. `persona_frustrations` - Day-to-day frustrations
9. `persona_quotes` - Representative quotes
10. `persona_organization_types` - Organization types they work in
11. `persona_typical_locations` - Geographic locations

### 3. Data Generator Script
**File**: `scripts/generate_medical_affairs_personas_normalized.py`
**Purpose**: Convert JSON to normalized SQL
**Features**:
- Fully automated SQL generation
- Handles all 27 JSON sections
- Generates normalized inserts for all junction tables
- Supports upsert logic (ON CONFLICT)
- Command-line arguments for flexibility

**Usage**:
```bash
python3 scripts/generate_medical_affairs_personas_normalized.py \
    /path/to/Medical_Affairs_Personas_Part1.json \
    /path/to/output.sql
```

### 4. Generated Seed Data
**File**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part1_normalized.sql`
**Purpose**: Load Part 1 personas into database
**Contents**:
- 16 complete persona records
- ~576 related junction table rows
- Full VPANES scoring data
- All 27 sections mapped to normalized tables

---

## 🚀 Execution Steps

### Step 1: Run Schema Migration
```bash
# Execute the normalization migration
psql postgresql://postgres:PASSWORD@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
    -f database/sql/migrations/COMPLETE_PERSONAS_NORMALIZATION.sql
```

**Expected Output**:
```
NOTICE: ✅ Added 35+ new columns to personas table
NOTICE: ✅ Created 11 normalized junction tables
NOTICE: GOLDEN RULE COMPLIANCE: ✅ ALL DATA NORMALIZED (NO JSONB)
```

### Step 2: Load Persona Data
```bash
# Execute the seed data
psql postgresql://postgres:PASSWORD@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
    -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part1_normalized.sql
```

**Expected Output**:
```
NOTICE: Importing Medical Affairs Personas - 1 of 3...
NOTICE: Total personas to import: 16
NOTICE: Imported persona 1 - Dr. Sarah Chen
...
NOTICE: Imported persona 16 - Dr. Jennifer Martinez
NOTICE: MEDICAL AFFAIRS PERSONAS 1 of 3 - IMPORT COMPLETE
NOTICE: Total personas imported: 16
```

### Step 3: Verify Data
```sql
-- Check personas imported
SELECT COUNT(*) as total_personas
FROM personas
WHERE function_id IN (
    SELECT id FROM org_functions WHERE slug = 'medical-affairs'
);

-- Check junction table row counts
SELECT
    'persona_goals' as table_name, COUNT(*) as row_count FROM persona_goals
UNION ALL
SELECT 'persona_pain_points', COUNT(*) FROM persona_pain_points
UNION ALL
SELECT 'persona_challenges', COUNT(*) FROM persona_challenges
UNION ALL
SELECT 'persona_responsibilities', COUNT(*) FROM persona_responsibilities
UNION ALL
SELECT 'persona_tools', COUNT(*) FROM persona_tools
UNION ALL
SELECT 'persona_communication_channels', COUNT(*) FROM persona_communication_channels
UNION ALL
SELECT 'persona_decision_makers', COUNT(*) FROM persona_decision_makers
UNION ALL
SELECT 'persona_frustrations', COUNT(*) FROM persona_frustrations
UNION ALL
SELECT 'persona_quotes', COUNT(*) FROM persona_quotes
UNION ALL
SELECT 'persona_vpanes_scoring', COUNT(*) FROM persona_vpanes_scoring
UNION ALL
SELECT 'persona_success_metrics', COUNT(*) FROM persona_success_metrics
ORDER BY table_name;
```

---

## 📊 Data Structure

### Base Personas Table - New Columns

**Core Info** (4 columns):
- `role_slug`, `function_slug`, `department_slug`, `persona_number`

**Professional Profile** (5 columns):
- `years_in_current_role`, `years_in_industry`, `years_in_function`
- `geographic_scope`

**Organization Context** (6 columns):
- `reporting_to`, `team_size`, `team_size_typical`
- `budget_authority`, `direct_reports`, `span_of_control`

**Demographics** (4 columns):
- `age_range`, `education_level`, `location_type`, `work_arrangement`

**Quantitative Benchmarks** (10 columns):
- `salary_min_usd`, `salary_max_usd`, `salary_median_usd`
- `salary_currency`, `salary_year`, `salary_sources`
- `sample_size`, `confidence_level`, `data_recency`, `geographic_benchmark_scope`

**Work Style** (5 columns):
- `work_style_preference`, `learning_style`
- `technology_adoption`, `risk_tolerance`, `change_readiness`

**Narrative** (2 columns):
- `one_liner`, `background_story`

**Section Metadata** (1 column):
- `section`

---

## 🔍 Example Queries

### Get Complete Persona Profile
```sql
SELECT
    p.name,
    p.title,
    p.seniority_level,
    p.salary_median_usd,
    pvs.total_score as vpanes_total,
    pvs.priority_tier,
    COUNT(DISTINCT pg.id) as goals_count,
    COUNT(DISTINCT pp.id) as pain_points_count,
    COUNT(DISTINCT pr.id) as responsibilities_count
FROM personas p
LEFT JOIN persona_vpanes_scoring pvs ON p.id = pvs.persona_id
LEFT JOIN persona_goals pg ON p.id = pg.persona_id
LEFT JOIN persona_pain_points pp ON p.id = pp.persona_id
LEFT JOIN persona_responsibilities pr ON p.id = pr.persona_id
WHERE p.slug = 'pharma-dr-sarah-chen-cmo'
GROUP BY p.id, p.name, p.title, p.seniority_level, p.salary_median_usd, pvs.total_score, pvs.priority_tier;
```

### Get All Pain Points for a Persona
```sql
SELECT
    pain_point_text,
    pain_category,
    severity,
    impact,
    sequence_order
FROM persona_pain_points
WHERE persona_id = (
    SELECT id FROM personas WHERE slug = 'pharma-dr-sarah-chen-cmo'
)
ORDER BY sequence_order;
```

### Get Top Priority Personas by VPANES Score
```sql
SELECT
    p.name,
    p.title,
    p.section,
    pvs.total_score,
    pvs.priority_tier
FROM personas p
JOIN persona_vpanes_scoring pvs ON p.id = pvs.persona_id
WHERE p.function_id IN (
    SELECT id FROM org_functions WHERE slug = 'medical-affairs'
)
ORDER BY pvs.total_score DESC
LIMIT 10;
```

---

## 🎯 Golden Rule Compliance

### ✅ What We Did Right
- **NO JSONB fields** for structured data
- **Proper normalization** with junction tables
- **Foreign key constraints** for referential integrity
- **Indexes** for query performance
- **Check constraints** for data validation
- **Sequence ordering** for list items

### ❌ What We Avoided
- Storing arrays in TEXT[] for relational data
- Using JSONB for structured, queryable data
- Denormalized data storage
- Unvalidated enum values

---

## 📈 Next Steps

### Process Part 2 and Part 3
Use the same generator script for remaining personas:

```bash
# Part 2
python3 scripts/generate_medical_affairs_personas_normalized.py \
    /path/to/Medical_Affairs_Personas_Part2.json \
    database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part2_normalized.sql

# Part 3
python3 scripts/generate_medical_affairs_personas_normalized.py \
    /path/to/Medical_Affairs_Personas_Part3.json \
    database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part3_normalized.sql
```

### Apply Same Pattern to Other Functions
- Market Access Personas
- Commercial Personas
- Digital Health Personas
- etc.

---

## 📞 Support

### Troubleshooting

**Issue**: Migration fails on missing table
- **Solution**: Ensure base migrations (20251115000000) are applied first

**Issue**: Foreign key constraint violation
- **Solution**: Verify tenant_id and function IDs exist before running seeds

**Issue**: Duplicate key error
- **Solution**: Seed file has ON CONFLICT handling; safe to re-run

### Performance Considerations
- All junction tables have indexes on `persona_id` and `tenant_id`
- Use `WHERE deleted_at IS NULL` for soft-deleted filtering
- Consider partitioning if persona count exceeds 10,000

---

## ✅ Checklist

- [ ] Review `PERSONA_SCHEMA_MAPPING_ANALYSIS.md`
- [ ] Execute `COMPLETE_PERSONAS_NORMALIZATION.sql` migration
- [ ] Verify migration success (check for new tables/columns)
- [ ] Execute `medical_affairs_personas_part1_normalized.sql` seed
- [ ] Run verification queries
- [ ] Process Part 2 and Part 3
- [ ] Update application code to use normalized tables
- [ ] Remove old JSONB fields (after data migration)

---

**Generated**: 2025-11-16
**Database**: bomltkhixeatxuoxmolq (Vital-expert)
**Compliance**: ✅ 100% Normalized (NO JSONB)
