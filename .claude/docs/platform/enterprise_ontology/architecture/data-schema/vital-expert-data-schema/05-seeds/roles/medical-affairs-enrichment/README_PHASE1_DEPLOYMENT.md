# Phase 1: Field Medical Role Enrichment - Deployment Guide

**Created:** 2025-11-22
**Scope:** 15 Field Medical roles enrichment
**Department:** Field Medical (ca5503b6-7821-4f65-8162-2b75952d5363)
**Function:** Medical Affairs (06127088-4d52-40aa-88c9-93f4e79e085a)

---

## Overview

This deployment guide provides step-by-step instructions for enriching 15 Field Medical roles with comprehensive metadata including:

- **Direct column enrichments:** descriptions, skills, certifications, GxP classifications, regulatory data, career progression, workflow context, travel requirements
- **Junction table data:** regulatory frameworks, GxP training modules, clinical competencies, KPIs
- **Reference data:** 71 records across 3 tables (regulatory_frameworks, gxp_training_modules, clinical_competencies)

---

## File Inventory

### 1. Reference Data Seeds (Run First)

| File | Records | Purpose |
|------|---------|---------|
| `01_seed_regulatory_frameworks.sql` | 20 | ICH GCP, FDA regulations, PhRMA Code, HIPAA, GDPR |
| `02_seed_gxp_training_modules.sql` | 15 | GCP training, pharmacovigilance, compliance training |
| `03_seed_clinical_competencies.sql` | 36 | MAPS framework competencies for Medical Affairs |
| `00_run_all_reference_data_seeds.sql` | Master | Executes all 3 seeds in sequence with validation |

### 2. Phase 1 Enrichment Data

| File | Content | Format |
|------|---------|--------|
| `phase1_field_medical_enrichment.json` | 15 Field Medical roles | JSON (ready for import) |

---

## Deployment Steps

### Step 1: Prerequisites Verification

Before starting, verify the following:

```sql
-- 1. Check that role enrichment migration has been applied
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'org_roles'
  AND column_name IN ('gxp_role_type', 'regulatory_inspection_role', 'pharmacovigilance_responsibility');

-- Expected: 3 rows returned (confirms enrichment columns exist)

-- 2. Check that reference tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('regulatory_frameworks', 'gxp_training_modules', 'clinical_competencies');

-- Expected: 3 rows returned

-- 3. Verify the 15 Field Medical roles exist
SELECT id, name, geographic_scope, seniority_level, role_category
FROM org_roles
WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
ORDER BY name;

-- Expected: 15 rows returned
```

**If any checks fail:**
- Apply migration: `supabase/migrations/20251122000001_role_enrichment_phase1_foundation.sql`
- Contact database administrator

---

### Step 2: Seed Reference Data

**Duration:** ~30 seconds
**Command:** Run in Supabase SQL Editor or psql

```bash
# Option A: Run master script (recommended)
psql -f database/seeds/00_run_all_reference_data_seeds.sql

# Option B: Run individually in Supabase Editor
# Copy and paste each SQL file in sequence:
# 1. database/seeds/01_seed_regulatory_frameworks.sql
# 2. database/seeds/02_seed_gxp_training_modules.sql
# 3. database/seeds/03_seed_clinical_competencies.sql
```

**Validation:**

```sql
-- Check reference data counts
SELECT
  (SELECT COUNT(*) FROM regulatory_frameworks WHERE is_current = true) as frameworks_count,
  (SELECT COUNT(*) FROM gxp_training_modules) as training_count,
  (SELECT COUNT(*) FROM clinical_competencies) as competencies_count;

-- Expected output:
-- frameworks_count | training_count | competencies_count
--        20        |       15       |        36
```

---

### Step 3: Transform JSON to SQL (Two Options)

You have two options for importing the enrichment data:

#### Option A: Manual SQL Generation (Recommended for transparency)

Create a SQL file from the JSON data. Here's a template for one role:

```sql
-- Example: Global Medical Science Liaison (MSL)
-- Role ID: f7547f96-8e01-48ad-9c25-609050bd8f68

BEGIN;

-- 1. Update direct columns
UPDATE org_roles
SET
  description = 'Field-based medical professional who serves as a scientific peer and resource to key healthcare providers...',
  required_skills = ARRAY[
    'Therapeutic area expertise (Oncology/Immunology/Neurology/Cardiology)',
    'Scientific communication and presentation',
    'Key Opinion Leader (KOL) identification and engagement',
    'Clinical trial design and methodology',
    'Medical literature review and critical appraisal',
    'Peer-to-peer medical dialogue',
    'Adverse event recognition and reporting (24-hour expedited reporting)',
    'Data interpretation and analysis',
    'CRM systems (Veeva, Salesforce)',
    'Stakeholder relationship management'
  ],
  required_certifications = ARRAY[
    'Advanced degree (MD, PhD, PharmD, or equivalent)',
    'Board certification in relevant therapeutic area (preferred)',
    'GCP certification (ICH E6 R2)',
    'PhRMA Code compliance certification'
  ],
  years_experience_min = 3,
  years_experience_max = 7,
  gxp_role_type = 'gcp',
  regulatory_inspection_role = false,
  sox_critical = false,
  cfr_part_11_required = false,
  pharmacovigilance_responsibility = true,
  clinical_trial_phase_focus = ARRAY['Phase 2', 'Phase 3', 'Phase 4'],
  drug_lifecycle_stage = ARRAY['Clinical Development', 'Launch', 'Growth', 'Maturity'],
  patient_facing = false,
  hcp_facing = true,
  typical_time_in_role_years = 3,
  advancement_potential = 'high',
  typical_entry_point = false,
  typical_meeting_hours_per_week = 15,
  administrative_load_percent = 20,
  strategic_vs_tactical = 'balanced',
  innovation_vs_execution = 'balanced',
  travel_percentage_min = 60,
  travel_percentage_max = 80,
  international_travel = true,
  overnight_travel_frequency = 'weekly'
WHERE id = 'f7547f96-8e01-48ad-9c25-609050bd8f68';

-- 2. Insert regulatory frameworks junction data
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, last_updated)
SELECT
  'f7547f96-8e01-48ad-9c25-609050bd8f68',
  id,
  CASE name
    WHEN 'ICH GCP E6(R2)' THEN 'advanced'
    WHEN 'PhRMA Code on Interactions with Healthcare Professionals' THEN 'expert'
    WHEN 'FDA Physician Payments Sunshine Act (PPSA)' THEN 'working_knowledge'
    WHEN 'ICH E2A' THEN 'working_knowledge'
    WHEN 'FDA 21 CFR Part 314.80' THEN 'awareness'
  END,
  CURRENT_TIMESTAMP
FROM regulatory_frameworks
WHERE name IN (
  'ICH GCP E6(R2)',
  'PhRMA Code on Interactions with Healthcare Professionals',
  'FDA Physician Payments Sunshine Act (PPSA)',
  'ICH E2A',
  'FDA 21 CFR Part 314.80'
);

-- 3. Insert GxP training modules junction data
INSERT INTO role_gxp_training (role_id, training_module_id, is_mandatory, due_within_days_of_hire, last_completed)
SELECT
  'f7547f96-8e01-48ad-9c25-609050bd8f68',
  id,
  CASE module_name
    WHEN 'GCP Fundamentals' THEN true
    WHEN 'Pharmacovigilance Basics' THEN true
    WHEN 'Adverse Event Reporting for MSLs' THEN true
    WHEN 'PhRMA Code Compliance for Field Medical' THEN true
    WHEN 'Sunshine Act & Transparency Reporting' THEN true
    WHEN 'Scientific Communication Skills for MSLs' THEN false
  END,
  CASE module_name
    WHEN 'GCP Fundamentals' THEN 90
    WHEN 'Pharmacovigilance Basics' THEN 90
    WHEN 'Adverse Event Reporting for MSLs' THEN 30
    WHEN 'PhRMA Code Compliance for Field Medical' THEN 30
    WHEN 'Sunshine Act & Transparency Reporting' THEN 90
    WHEN 'Scientific Communication Skills for MSLs' THEN 180
  END,
  NULL
FROM gxp_training_modules
WHERE module_name IN (
  'GCP Fundamentals',
  'Pharmacovigilance Basics',
  'Adverse Event Reporting for MSLs',
  'PhRMA Code Compliance for Field Medical',
  'Sunshine Act & Transparency Reporting',
  'Scientific Communication Skills for MSLs'
);

-- 4. Insert clinical competencies junction data
INSERT INTO role_clinical_competencies (role_id, competency_id, proficiency_level, last_assessed)
SELECT
  'f7547f96-8e01-48ad-9c25-609050bd8f68',
  id,
  CASE competency_name
    WHEN 'Therapeutic Area Expertise' THEN 'expert'
    WHEN 'Scientific Communication & Presentation' THEN 'advanced'
    WHEN 'Peer-to-Peer Medical Dialogue' THEN 'advanced'
    WHEN 'KOL (Key Opinion Leader) Identification & Engagement' THEN 'advanced'
    WHEN 'Medical Literature Review & Critical Appraisal' THEN 'advanced'
    WHEN 'Clinical Trial Design & Methodology' THEN 'intermediate'
    WHEN 'Data Interpretation & Analysis' THEN 'intermediate'
    WHEN 'Adverse Event Recognition & Reporting' THEN 'advanced'
    WHEN 'CRM & Field Force Tools' THEN 'intermediate'
  END,
  NULL
FROM clinical_competencies
WHERE competency_name IN (
  'Therapeutic Area Expertise',
  'Scientific Communication & Presentation',
  'Peer-to-Peer Medical Dialogue',
  'KOL (Key Opinion Leader) Identification & Engagement',
  'Medical Literature Review & Critical Appraisal',
  'Clinical Trial Design & Methodology',
  'Data Interpretation & Analysis',
  'Adverse Event Recognition & Reporting',
  'CRM & Field Force Tools'
);

-- 5. Insert KPIs junction data
INSERT INTO role_kpis (role_id, kpi_name, target_value, measurement_frequency)
VALUES
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Tier 1 KOL interactions', '100-120 per year', 'quarterly'),
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Scientific exchange quality score', '85%+', 'quarterly'),
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Medical insights submitted', '8-12 per quarter', 'quarterly'),
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Advisory board attendance', '4-6 per year', 'annually'),
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Medical education programs supported', '10-15 per year', 'quarterly'),
  ('f7547f96-8e01-48ad-9c25-609050bd8f68', 'Clinical trial enrollment support', '2-4 sites per year', 'semi-annually');

COMMIT;
```

**Repeat the above pattern for all 15 roles** using data from `phase1_field_medical_enrichment.json`.

#### Option B: Python Script for Automated SQL Generation

If you prefer automation, here's a Python script to generate SQL from the JSON:

```python
#!/usr/bin/env python3
import json

# Load the JSON enrichment file
with open('database/seeds/phase1_field_medical_enrichment.json', 'r') as f:
    data = json.load(f)

sql_statements = []
sql_statements.append("-- Phase 1: Field Medical Role Enrichment")
sql_statements.append("-- Generated: 2025-11-22")
sql_statements.append("-- Total Roles: 15")
sql_statements.append("")
sql_statements.append("BEGIN;")
sql_statements.append("")

for role in data['roles']:
    role_id = role['role_id']
    role_name = role['role_name']
    enrich = role['enrichment']

    sql_statements.append(f"-- ========================================")
    sql_statements.append(f"-- Role: {role_name}")
    sql_statements.append(f"-- ID: {role_id}")
    sql_statements.append(f"-- ========================================")
    sql_statements.append("")

    # 1. UPDATE org_roles (direct columns)
    skills_array = "ARRAY['" + "', '".join(enrich.get('required_skills', [])).replace("'", "''") + "']"
    certs_array = "ARRAY['" + "', '".join(enrich.get('required_certifications', [])).replace("'", "''") + "']"

    update_sql = f"""UPDATE org_roles
SET
  description = '{enrich.get('description', '').replace("'", "''")}',
  required_skills = {skills_array},
  required_certifications = {certs_array},
  years_experience_min = {enrich.get('years_experience_min', 'NULL')},
  years_experience_max = {enrich.get('years_experience_max', 'NULL')},
  gxp_role_type = '{enrich.get('gxp_role_type', '')}',
  pharmacovigilance_responsibility = {str(enrich.get('pharmacovigilance_responsibility', False)).lower()},
  hcp_facing = {str(enrich.get('hcp_facing', False)).lower()},
  travel_percentage_min = {enrich.get('travel_percentage_min', 'NULL')},
  travel_percentage_max = {enrich.get('travel_percentage_max', 'NULL')}
WHERE id = '{role_id}';
"""
    sql_statements.append(update_sql)
    sql_statements.append("")

    # 2. INSERT regulatory frameworks
    if 'regulatory_frameworks' in enrich and enrich['regulatory_frameworks']:
        framework_names = [f"'{fw['name']}'" for fw in enrich['regulatory_frameworks']]
        framework_cases = "\n    ".join([
            f"WHEN '{fw['name']}' THEN '{fw['proficiency_level']}'"
            for fw in enrich['regulatory_frameworks']
        ])

        insert_frameworks = f"""INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, last_updated)
SELECT
  '{role_id}',
  id,
  CASE name
    {framework_cases}
  END,
  CURRENT_TIMESTAMP
FROM regulatory_frameworks
WHERE name IN ({', '.join(framework_names)});
"""
        sql_statements.append(insert_frameworks)
        sql_statements.append("")

    # Similar logic for GxP training and competencies...
    # (abbreviated for README brevity)

sql_statements.append("COMMIT;")
sql_statements.append("")
sql_statements.append("-- Validation")
sql_statements.append("SELECT 'Phase 1 enrichment completed successfully!' AS status;")

# Write to file
with open('database/seeds/04_phase1_field_medical_enrichment.sql', 'w') as f:
    f.write('\n'.join(sql_statements))

print("SQL file generated: database/seeds/04_phase1_field_medical_enrichment.sql")
```

---

### Step 4: Execute Enrichment SQL

```bash
# Run the generated SQL file
psql -f database/seeds/04_phase1_field_medical_enrichment.sql

# Or copy/paste into Supabase SQL Editor
```

---

### Step 5: Validation

Run these validation queries to confirm successful enrichment:

```sql
-- 1. Check direct column enrichment
SELECT
  name,
  CASE WHEN description IS NOT NULL THEN '✓' ELSE '✗' END as has_description,
  array_length(required_skills, 1) as skills_count,
  array_length(required_certifications, 1) as certs_count,
  gxp_role_type,
  pharmacovigilance_responsibility as pv_role,
  years_experience_min as min_exp,
  years_experience_max as max_exp
FROM org_roles
WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
ORDER BY name;

-- Expected: 15 rows, all with '✓' for has_description, skills_count > 0, certs_count > 0

-- 2. Check junction tables
SELECT
  'Regulatory Frameworks' as table_name,
  COUNT(*) as junction_records
FROM role_regulatory_frameworks
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363')

UNION ALL

SELECT
  'GxP Training',
  COUNT(*)
FROM role_gxp_training
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363')

UNION ALL

SELECT
  'Clinical Competencies',
  COUNT(*)
FROM role_clinical_competencies
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363')

UNION ALL

SELECT
  'KPIs',
  COUNT(*)
FROM role_kpis
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363');

-- Expected counts (approximate):
-- Regulatory Frameworks: 50-70 records (3-5 per role × 15 roles)
-- GxP Training: 60-90 records (4-6 per role × 15 roles)
-- Clinical Competencies: 60-120 records (4-8 per role × 15 roles)
-- KPIs: 30-60 records (2-4 per role × 15 roles)

-- 3. Sample detailed view for one role
SELECT
  r.name as role_name,
  r.description,
  r.gxp_role_type,
  r.required_skills,
  r.required_certifications,
  (SELECT COUNT(*) FROM role_regulatory_frameworks WHERE role_id = r.id) as frameworks_count,
  (SELECT COUNT(*) FROM role_gxp_training WHERE role_id = r.id) as training_count,
  (SELECT COUNT(*) FROM role_clinical_competencies WHERE role_id = r.id) as competencies_count,
  (SELECT COUNT(*) FROM role_kpis WHERE role_id = r.id) as kpis_count
FROM org_roles r
WHERE r.id = 'f7547f96-8e01-48ad-9c25-609050bd8f68'; -- Global MSL

-- 4. Verify no NULL critical fields
SELECT
  name,
  CASE
    WHEN description IS NULL THEN 'Missing description'
    WHEN array_length(required_skills, 1) IS NULL THEN 'Missing skills'
    WHEN array_length(required_certifications, 1) IS NULL THEN 'Missing certifications'
    WHEN gxp_role_type IS NULL THEN 'Missing GxP type'
    ELSE 'OK'
  END as validation_status
FROM org_roles
WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
  AND (
    description IS NULL
    OR array_length(required_skills, 1) IS NULL
    OR array_length(required_certifications, 1) IS NULL
    OR gxp_role_type IS NULL
  );

-- Expected: 0 rows (all roles should be fully enriched)
```

---

## Troubleshooting

### Issue: Reference tables are empty

**Symptom:** Junction table inserts fail with foreign key violations

**Solution:**
```sql
-- Verify reference data exists
SELECT COUNT(*) FROM regulatory_frameworks;
SELECT COUNT(*) FROM gxp_training_modules;
SELECT COUNT(*) FROM clinical_competencies;

-- If any return 0, re-run Step 2
```

### Issue: Duplicate key errors in junction tables

**Symptom:** `ERROR: duplicate key value violates unique constraint`

**Solution:**
```sql
-- Clear existing junction data for Field Medical roles
DELETE FROM role_regulatory_frameworks
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363');

DELETE FROM role_gxp_training
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363');

DELETE FROM role_clinical_competencies
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363');

DELETE FROM role_kpis
WHERE role_id IN (SELECT id FROM org_roles WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363');

-- Then re-run Step 4
```

### Issue: Array syntax errors

**Symptom:** `ERROR: syntax error at or near "ARRAY"`

**Solution:** Ensure PostgreSQL array syntax is correct:
```sql
-- Correct:
ARRAY['value1', 'value2', 'value3']

-- Incorrect:
['value1', 'value2', 'value3']  -- Missing ARRAY keyword
```

---

## Next Steps (Phase 2-4)

After successful Phase 1 deployment, proceed with:

- **Phase 2:** Medical Information roles (18 roles)
- **Phase 3:** Scientific Communications & Publications roles (18 roles)
- **Phase 4:** HEOR, Clinical Operations, Medical Education, Governance, Leadership roles (49 roles)

Total: 100 Medical Affairs roles fully enriched

---

## Support

For questions or issues:
1. Review `org_roles_complete_attribute_mapping.md` for schema details
2. Check `database/seeds/00_PREPARATION/` documentation
3. Verify migration `20251122000001_role_enrichment_phase1_foundation.sql` is applied
4. Contact: Medical Affairs Data Team

---

**Document Version:** 1.0
**Last Updated:** 2025-11-22
**Status:** Ready for deployment
