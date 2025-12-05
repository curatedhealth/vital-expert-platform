# Medical Affairs Personas Documentation

> **Version**: 2.0.0
> **Last Updated**: 2025-11-27
> **Status**: Active
> **Schema**: Normalized (v2.0)

---

## Overview

This directory contains persona documentation for the VITAL Medical Affairs platform. Personas are detailed profiles representing typical users within specific roles, used for product design, AI training, and stakeholder understanding.

**Key Features:**
- Normalized database schema using junction tables
- Reusable reference tables for skills, competencies, KPIs, etc.
- Template-based seeding for consistent data entry
- Linked personas to source roles via `source_role_id`

---

## Available Personas

| Persona | Seed File | Status | Quality Score | Salary |
|---------|-----------|--------|---------------|--------|
| Medical Science Liaison (MSL) | `002_msl_seed.sql` | Complete | 0.95 | ~$176K |
| Senior MSL | `003_senior_msl_seed.sql` | Complete | 0.92 | ~$195K |
| MSL Manager | `004_msl_manager_seed.sql` | Complete | 0.90 | ~$209K |
| Medical Information Specialist | `005_medical_information_specialist_seed.sql` | Complete | 0.90 | ~$120K |
| Medical Director | `006_medical_director_seed.sql` | Complete | 0.92 | ~$232K |
| VP Medical Affairs | `007_vp_medical_affairs_seed.sql` | Complete | 0.88 | ~$324K |

---

## Normalized Schema Architecture

### Why Normalized?

Instead of storing all data in JSONB columns, we use **junction tables** for:
- **Referential integrity**: Foreign keys prevent orphaned data
- **Queryability**: "Find all roles requiring GCP training"
- **Reusability**: Same skill can be linked to multiple roles
- **Data consistency**: Update once, reflected everywhere

### Reference Tables (Reusable Data)

| Table | Purpose | Example Data |
|-------|---------|--------------|
| `ref_skills` | Skills taxonomy | Clinical Data Interpretation, Veeva CRM |
| `ref_competencies` | Competency framework | Clinical Trial Design, Data Interpretation |
| `ref_certifications` | Credentials | PharmD, MAPS MSL Certification |
| `ref_regulatory_frameworks` | Compliance frameworks | FDA 21 CFR, ICH GCP E6 |
| `ref_kpis` | Performance metrics | KOL Interactions, Field Insights |
| `ref_therapeutic_areas` | Disease areas | Oncology, Immunology |
| `ref_training_programs` | Training programs | GCP Fundamentals, MSL Academy |

### Junction Tables (Role-Specific Links)

| Table | Links | Metadata |
|-------|-------|----------|
| `role_skills` | role → skills | proficiency_required, is_required |
| `role_competencies` | role → competencies | proficiency_level, years_to_develop |
| `role_certifications` | role → certifications | is_required, is_preferred |
| `role_regulatory_frameworks` | role → frameworks | proficiency_level |
| `role_kpis_junction` | role → KPIs | target_value, data_source |
| `role_therapeutic_areas` | role → TAs | is_primary |
| `role_training` | role → training | is_mandatory |
| `role_gxp_requirements` | role → GxP types | is_critical, training_frequency |

### What's Still JSONB?

Some data is kept as JSONB for flexibility:
- `daily_activities` - Dynamic time allocation
- `systems_used` - Tool proficiency (changes frequently)
- `stakeholder_interactions` - Relationship patterns
- `goals`, `challenges`, `motivations` - Persona narrative

---

## Directory Structure

```
.claude/docs/platform/personas/
├── README.md                           # This file
├── MSL_PERSONA_TEMPLATE.md             # MSL persona documentation
└── seeds/
    └── medical_affairs/
        ├── 000_TEMPLATE_persona_seed.sql   # ★ Copy for new roles
        ├── 001_gold_standard_schema.sql    # Schema migration (run first!)
        ├── 002_msl_seed.sql                # MSL persona
        ├── 003_senior_msl_seed.sql         # Senior MSL persona
        ├── 004_msl_manager_seed.sql        # MSL Manager persona
        ├── 005_medical_information_specialist_seed.sql  # MIS persona
        ├── 006_medical_director_seed.sql   # Medical Director persona
        └── 007_vp_medical_affairs_seed.sql # VP Medical Affairs persona
```

---

## How to Add a New Persona

### Step 1: Copy Template
```bash
cp 000_TEMPLATE_persona_seed.sql 003_senior_msl_seed.sql
```

### Step 2: Replace Placeholders
Search and replace all `{{PLACEHOLDER}}` values:
- `{{ROLE_NAME}}` → "Senior MSL"
- `{{ROLE_NAME_SHORT}}` → "SrMSL"
- `{{PERSONA_ID}}` → "PERSONA-SRMSL-001"
- etc.

### Step 3: Customize Reference Data
Add role-specific skills, KPIs, training that don't already exist.

### Step 4: Run in Supabase
Execute the SQL in Supabase SQL Editor.

### Step 5: Verify
Run verification queries at the bottom of the seed file.

---

## Query Examples

### Get Persona with Source Role
```sql
SELECT
  p.persona_name,
  p.title,
  r.name as source_role,
  p.data_quality_score
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
WHERE p.unique_id = 'PERSONA-MSL-001';
```

### Get Role's Skills (Normalized)
```sql
SELECT
  r.name as role_name,
  s.skill_name,
  s.skill_category,
  rs.proficiency_required
FROM org_roles r
JOIN role_skills rs ON r.id = rs.role_id
JOIN ref_skills s ON rs.skill_id = s.id
WHERE r.name ILIKE '%MSL%';
```

### Find All Roles Requiring GCP
```sql
SELECT DISTINCT r.name
FROM org_roles r
JOIN role_gxp_requirements rgxp ON r.id = rgxp.role_id
WHERE rgxp.gxp_type = 'GCP';
```

### Complete Role Profile
```sql
WITH target_role AS (
  SELECT id, name FROM org_roles WHERE name ILIKE '%MSL%' LIMIT 1
)
SELECT
  tr.name,
  (SELECT array_agg(s.skill_name) FROM role_skills rs JOIN ref_skills s ON rs.skill_id = s.id WHERE rs.role_id = tr.id) as skills,
  (SELECT array_agg(k.kpi_name) FROM role_kpis_junction rk JOIN ref_kpis k ON rk.kpi_id = k.id WHERE rk.role_id = tr.id) as kpis,
  (SELECT array_agg(t.program_name) FROM role_training rt JOIN ref_training_programs t ON rt.training_id = t.id WHERE rt.role_id = tr.id) as training
FROM target_role tr;
```

---

## Usage Guide

### For Product Design
Use personas to understand user needs, pain points, and workflows when designing features for medical affairs professionals.

### For AI Training
Personas provide context for LLM prompts to generate role-appropriate responses and understand medical affairs domain.

### For Hiring/HR
Benchmark job descriptions and competency requirements against industry-standard persona definitions.

### For Training Programs
Design onboarding and development programs aligned with persona KPIs and career progression paths.

---

## Roadmap

### Phase 1: Core Medical Affairs (Complete)
- [x] Gold standard schema with junction tables
- [x] MSL persona (normalized)
- [x] Senior MSL persona
- [x] MSL Manager persona
- [x] Medical Information Specialist persona
- [x] Medical Director persona
- [x] VP Medical Affairs persona

### Phase 2: Extended Roles (Planned)
- [ ] Medical Writer
- [ ] Publications Manager
- [ ] HEOR Director
- [ ] Regional Medical Director
- [ ] Chief Medical Officer

### Phase 3: Behavioral Personas (Future)
- [ ] Technology Adopter personas
- [ ] Compliance-focused personas
- [ ] Innovation-driven personas

### Phase 4: Pain Points Taxonomy (Complete)
- [x] 60 normalized pain points across 7 categories
- [x] Archetype-specific pain sensitivity weights
- [x] VPANES engagement scoring framework
- [x] 15 solution opportunities mapped
- [x] Database seed file (009_pain_points_taxonomy.sql)

---

## Pain Points Taxonomy

The platform includes a comprehensive pain points taxonomy to enable:
- Pattern discovery across roles and archetypes
- Pain normalization into knowledge graph structure
- User engagement potential assessment (VPANES)
- Solution opportunity mapping
- Cross-role pain identification

### Documentation Files

| File | Purpose | Size |
|------|---------|------|
| **PAIN_POINTS_SUMMARY.md** | Executive summary with key insights | - |
| **PAIN_POINTS_TAXONOMY.md** | Comprehensive documentation | 47KB |
| **PAIN_POINTS_QUICK_REFERENCE.md** | Fast lookup guide | 15KB |
| **pain_points_master_list.csv** | Spreadsheet export | - |
| **seeds/009_pain_points_taxonomy.sql** | Database seed | 817 lines |

### Key Features

**7 Pain Categories**:
- PROCESS (workflow inefficiencies)
- TECHNOLOGY (tool limitations)
- COMMUNICATION (information silos)
- COMPLIANCE (regulatory burden)
- RESOURCE (time/budget constraints)
- KNOWLEDGE (information gaps)
- ORGANIZATIONAL (politics, bureaucracy)

**4 Archetype Weights**:
- AUTOMATOR (High AI + Routine)
- ORCHESTRATOR (High AI + Strategic)
- LEARNER (Low AI + Routine)
- SKEPTIC (Low AI + Strategic)

**VPANES Scoring**:
- Visibility (0-10)
- Pain intensity (0-10)
- Actions taken (0-10)
- Needs urgency (0-10)
- Emotions charge (0-10)
- Scenarios specificity (0-10)

### Quick Stats

- **60 pain points** documented
- **70% pharma-specific**
- **90% systemic** (affect multiple roles)
- **8 shared pain points** (3+ roles)
- **15 solution opportunities** mapped
- **4 critical severity** pain points

### Usage

See **PAIN_POINTS_QUICK_REFERENCE.md** for:
- Pain point ID index
- Archetype sensitivity matrix
- Top opportunities by type
- Role-specific pain priorities
- Quick win opportunities
- Usage checklists

---

## Data Sources

Personas are derived from:
1. **[MSL Society](https://themsls.org/)** - 2024 Salary Survey, MSL role benchmarks
2. **[MAPS](https://medicalaffairs.org/)** - Field Medical KPIs Guidance
3. **[ASHP](https://www.ashp.org/)** - Drug Information Specialist careers
4. **[Pharmacy Times](https://www.pharmacytimes.com/)** - MIS and MSL role comparisons
5. **[ICON](https://careers.iconplc.com/)** - Medical Director responsibilities
6. **Industry Job Postings** - Sun Pharma, GH Research, Takeda

---

## Contact

**Data Agent Team** - Automated persona generation and maintenance
**Medical Affairs SMEs** - Validation and accuracy review

---

*Generated by Data Agent Team | VITAL Medical Affairs Platform*
