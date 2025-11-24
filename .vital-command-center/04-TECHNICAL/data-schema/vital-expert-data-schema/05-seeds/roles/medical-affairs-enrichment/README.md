# Medical Affairs Role Enrichment - Command Center

**Location:** `.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/`
**Status:** Phase 1 Complete - Ready for Deployment
**Date:** 2025-11-22

---

## Directory Purpose

This directory contains all templates, seed files, and enrichment data for Medical Affairs organizational roles. It serves as the single source of truth for Medical Affairs role metadata, including:

- Reference data (regulatory frameworks, GxP training, clinical competencies)
- Role enrichment templates and data
- Deployment guides and documentation
- Schema mappings and attribute definitions

---

## File Inventory

### 📋 Schema & Planning

| File | Purpose | Status |
|------|---------|--------|
| `org_roles_complete_attribute_mapping.md` | Complete 54-attribute schema mapping | ✅ Complete |
| `PHASE1_DELIVERY_SUMMARY.md` | Executive summary and delivery details | ✅ Complete |
| `README_PHASE1_DEPLOYMENT.md` | Deployment guide with step-by-step instructions | ✅ Complete |

### 🗄️ Reference Data Seeds (Foundation)

**Run these FIRST before enrichment:**

| File | Records | Purpose |
|------|---------|---------|
| `00_run_all_reference_data_seeds.sql` | Master | Orchestrates all 3 reference seeds |
| `01_seed_regulatory_frameworks.sql` | 20 | ICH GCP, FDA, PhRMA Code, HIPAA, GDPR |
| `02_seed_gxp_training_modules.sql` | 15 | GCP, pharmacovigilance, compliance training |
| `03_seed_clinical_competencies.sql` | 36 | MAPS framework competencies |

**Total Reference Records:** 71

### 📊 Phase 1 Enrichment Data

| File | Content | Format |
|------|---------|--------|
| `phase1_field_medical_enrichment.json` | 15 Field Medical roles with complete enrichment | JSON |

**Roles Included:**
- 6 MSL roles (Global/Regional/Local MSL + Senior MSL)
- 3 Field Team Lead roles (Global/Regional/Local)
- 3 Medical Scientific Manager roles (Global/Regional/Local)
- 3 Field Medical Director roles (Global/Regional/Local)

**Enrichment Data per Role:**
- 54 attributes (descriptions, skills, certifications, GxP, travel, KPIs, etc.)
- Regulatory frameworks mappings (3-5 per role)
- GxP training modules (3-6 per role)
- Clinical competencies (5-9 per role)
- KPIs (2-6 per role)

---

## Quick Start

### 1. Prerequisites

Ensure migration applied:
```bash
# Check enrichment columns exist
psql -c "SELECT column_name FROM information_schema.columns
WHERE table_name = 'org_roles'
AND column_name IN ('gxp_role_type', 'pharmacovigilance_responsibility');"
```

### 2. Seed Reference Data

```bash
# Run from project root
psql -f .vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/00_run_all_reference_data_seeds.sql
```

### 3. Deploy Enrichment

See `README_PHASE1_DEPLOYMENT.md` for:
- Two deployment options (manual SQL or automated Python)
- Validation queries
- Troubleshooting guide

---

## Data Structure

### Reference Tables (Master Data)

```
regulatory_frameworks (20 records)
├── ICH GCP E6(R2)
├── FDA 21 CFR Part 312
├── PhRMA Code
├── HIPAA Privacy Rule
└── ... (16 more)

gxp_training_modules (15 records)
├── GCP Fundamentals
├── Pharmacovigilance Basics
├── Adverse Event Reporting for MSLs
└── ... (12 more)

clinical_competencies (36 records)
├── Therapeutic Area Expertise
├── KOL Identification & Engagement
├── Scientific Communication
└── ... (33 more)
```

### Role Enrichment Structure

```json
{
  "role_id": "actual-uuid-from-database",
  "role_name": "Global Medical Science Liaison (MSL)",

  "enrichment": {
    "description": "...",
    "required_skills": [...],
    "required_certifications": [...],
    "years_experience_min": 3,
    "gxp_role_type": "gcp",
    "travel_percentage_min": 60,

    "regulatory_frameworks": [
      {"name": "ICH GCP E6(R2)", "proficiency_level": "advanced"}
    ],

    "gxp_training_modules": [
      {"name": "GCP Fundamentals", "is_mandatory": true, "due_within_days_of_hire": 90}
    ],

    "clinical_competencies": [
      {"name": "Therapeutic Area Expertise", "proficiency_level": "expert"}
    ],

    "kpis": [
      {"kpi_name": "Tier 1 KOL interactions", "target_value": "100-120 per year"}
    ]
  }
}
```

---

## Integration with Database Schema

### Direct Columns (org_roles table)

**Updated by enrichment:**
- `description` - Role description (2-3 paragraphs)
- `required_skills` - TEXT[] array (8-10 skills)
- `required_certifications` - TEXT[] array (3-5 certifications)
- `years_experience_min/max` - INTEGER
- `gxp_role_type` - ENUM (gcp, gvp, gmp, etc.)
- `pharmacovigilance_responsibility` - BOOLEAN
- `travel_percentage_min/max` - INTEGER
- ... (27 additional enrichment fields)

### Junction Tables (Many-to-Many)

**Populated by enrichment:**
- `role_regulatory_frameworks` - Links roles to regulatory frameworks
- `role_gxp_training` - Maps required training modules
- `role_clinical_competencies` - Associates clinical competencies
- `role_kpis` - Defines role KPIs

---

## Next Phases

### Phase 2: Medical Information (18 roles)
- Medical Information Specialist
- Medical Information Manager
- Medical Info Scientist
- Medical Info Associate

### Phase 3: Scientific Communications & Publications (18 roles)
- Medical Writer
- Scientific Communications Manager
- Publications Manager
- Publications Lead

### Phase 4: HEOR, Clinical Ops, Medical Education, Governance, Leadership (49 roles)
- HEOR roles
- Clinical Operations Liaison
- Medical Education roles
- Medical Governance Officer
- Medical Director, CMO, VP Medical Affairs

**Total Goal:** 100 Medical Affairs roles fully enriched

---

## Validation

After deployment, run these queries to verify:

```sql
-- 1. Check reference data
SELECT
  (SELECT COUNT(*) FROM regulatory_frameworks WHERE is_current = true) as frameworks,
  (SELECT COUNT(*) FROM gxp_training_modules) as training,
  (SELECT COUNT(*) FROM clinical_competencies) as competencies;
-- Expected: 20 | 15 | 36

-- 2. Check enriched roles
SELECT
  name,
  CASE WHEN description IS NOT NULL THEN '✓' ELSE '✗' END as has_description,
  array_length(required_skills, 1) as skills_count,
  gxp_role_type
FROM org_roles
WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
ORDER BY name;
-- Expected: 15 rows, all with '✓'

-- 3. Check junction tables
SELECT
  'Regulatory Frameworks' as table_name,
  COUNT(*) as records
FROM role_regulatory_frameworks
WHERE role_id IN (
  SELECT id FROM org_roles
  WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
)
UNION ALL
SELECT 'GxP Training', COUNT(*)
FROM role_gxp_training
WHERE role_id IN (
  SELECT id FROM org_roles
  WHERE department_id = 'ca5503b6-7821-4f65-8162-2b75952d5363'
);
-- Expected: ~60 frameworks, ~75 training
```

---

## Quality Standards

### ✅ Industry Standards
- MAPS (Medical Affairs Professional Society) Competency Framework
- ICH (International Council for Harmonisation) Guidelines
- PhRMA Code compliance requirements
- Real-world pharmaceutical role benchmarks

### ✅ Data Quality
- No placeholder or dummy data
- All fields validated against schema
- Consistent terminology across roles
- Geographic scope differentiation (Global/Regional/Local)

### ✅ Completeness
- 54 attributes per role
- 71 reference records
- 280+ data points across 15 roles
- ~280 junction table relationships

---

## Support & Maintenance

**For deployment issues:**
1. Review `README_PHASE1_DEPLOYMENT.md`
2. Check validation queries
3. Verify migration applied: `20251122000001_role_enrichment_phase1_foundation.sql`

**For data structure questions:**
1. Review `org_roles_complete_attribute_mapping.md`
2. Check reference data seeds
3. Examine `phase1_field_medical_enrichment.json` structure

**For next phases:**
1. Use Phase 1 as template
2. Follow same data quality standards
3. Maintain consistent structure

---

## Related Documentation

- **Main Schema:** `../.vital-command-center/04-TECHNICAL/data-schema/`
- **Migration:** `supabase/migrations/20251122000001_role_enrichment_phase1_foundation.sql`
- **Master Roles Seed:** `../populate_roles_01_medical_affairs.sql`
- **Org Structure:** `../../org-structure/`

---

**Version:** 1.0
**Status:** ✅ Complete & Production Ready
**Estimated Deployment Time:** 15-30 minutes
**Next Update:** Phase 2 - Medical Information roles
