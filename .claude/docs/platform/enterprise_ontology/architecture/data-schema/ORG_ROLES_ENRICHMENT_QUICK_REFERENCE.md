# Org Roles Enrichment - Quick Reference Guide

**Created:** 2025-11-22
**For:** Product teams, data stewards, AI agent developers
**See Also:** ORG_ROLES_ENRICHMENT_STRATEGY.md (comprehensive strategy)

---

## Files Created

| File | Purpose |
|------|---------|
| `ORG_ROLES_ENRICHMENT_STRATEGY.md` | Full strategy document with rationale, phased approach, and usage examples |
| `20251122000001_role_enrichment_phase1_foundation.sql` | Schema migration (tables, columns, indexes) |
| `20251122000002_seed_pharma_reference_data.sql` | Reference data seeding (frameworks, training, competencies) |
| `ORG_ROLES_ENRICHMENT_QUICK_REFERENCE.md` | This file - quick how-to guide |

---

## Quick Start: What Got Added?

### New Columns on `org_roles` Table (16 total)

**Regulatory & Compliance:**
- `gxp_role_type` - GMP, GCP, GLP, GVP, GDP, or non_gxp
- `regulatory_inspection_role` - Does role interact with regulators during audits?
- `sox_critical` - Sarbanes-Oxley financial controls apply?
- `cfr_part_11_required` - 21 CFR Part 11 electronic signature compliance?
- `pharmacovigilance_responsibility` - Adverse event reporting obligations?

**Clinical/Healthcare Context:**
- `clinical_trial_phase_focus` - Array: phase_1, phase_2, phase_3, phase_4, post_marketing
- `drug_lifecycle_stage` - Array: discovery, preclinical, clinical, regulatory_submission, commercial, lifecycle_management
- `patient_facing` - Direct patient interaction?
- `hcp_facing` - Healthcare professional interaction?

**Career & Development:**
- `typical_time_in_role_years` - Average tenure before promotion
- `advancement_potential` - high, moderate, limited, terminal
- `typical_entry_point` - Common first role in function?

**Workflow Context:**
- `typical_meeting_hours_per_week` - Time in meetings
- `administrative_load_percent` - % time on admin vs. core work
- `strategic_vs_tactical` - strategic, tactical, or balanced
- `innovation_vs_execution` - innovation_focused, execution_focused, or balanced

### New Reference Tables (7 total)

1. **`regulatory_frameworks`** - FDA, EMA, ICH standards (22 seeded)
2. **`gxp_training_modules`** - Required GxP training (12 seeded)
3. **`clinical_competencies`** - Clinical/pharma competencies (35 seeded)
4. **`approval_types`** - What requires approval (29 seeded)
5. **`process_definitions`** - Key business processes (13 seeded)
6. **`career_paths`** - Career progression paths (to be seeded)
7. **`workflow_activities`** - Daily/weekly activities (24 seeded)

### New Junction Tables (7 total)

1. **`role_regulatory_frameworks`** - Role → frameworks with proficiency
2. **`role_gxp_training`** - Role → training with due dates
3. **`role_clinical_competencies`** - Role → competencies with proficiency
4. **`role_approval_authority`** - Role → approval types with limits
5. **`role_process_participation`** - Role → processes with RACI
6. **`career_path_steps`** - Career path → roles in sequence
7. **`role_workflow_activities`** - Role → activities with time allocation

---

## Common Use Cases & Queries

### 1. Find All Roles That Need Specific Training

```sql
-- Example: Which roles need "GCP Fundamentals" training?
SELECT
    r.name AS role_name,
    d.name AS department,
    rgt.is_mandatory,
    rgt.due_within_days_of_hire,
    gtm.training_duration_hours
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN role_gxp_training rgt ON r.id = rgt.role_id
JOIN gxp_training_modules gtm ON rgt.training_module_id = gtm.id
WHERE gtm.module_name = 'GCP Fundamentals'
ORDER BY d.name, r.name;
```

### 2. Get Complete Role Profile (All Enrichments)

```sql
SELECT
    r.name,
    r.gxp_role_type,
    r.clinical_trial_phase_focus,
    r.typical_time_in_role_years,

    -- Counts of enrichments
    COUNT(DISTINCT rrf.id) AS regulatory_frameworks,
    COUNT(DISTINCT rgt.id) AS training_modules,
    COUNT(DISTINCT rcc.id) AS competencies,
    COUNT(DISTINCT raa.id) AS approval_authorities,
    COUNT(DISTINCT rpp.id) AS process_participations,
    COUNT(DISTINCT rwa.id) AS workflow_activities

FROM org_roles r
LEFT JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
LEFT JOIN role_gxp_training rgt ON r.id = rgt.role_id
LEFT JOIN role_clinical_competencies rcc ON r.id = rcc.role_id
LEFT JOIN role_approval_authority raa ON r.id = raa.role_id
LEFT JOIN role_process_participation rpp ON r.id = rpp.role_id
LEFT JOIN role_workflow_activities rwa ON r.id = rwa.role_id
WHERE r.slug = 'medical-science-liaison'
GROUP BY r.id;
```

### 3. Find Roles by GxP Classification

```sql
-- All GCP (Good Clinical Practice) roles
SELECT
    r.name,
    d.name AS department,
    r.regulatory_inspection_role,
    r.pharmacovigilance_responsibility
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
WHERE r.gxp_role_type = 'gcp'
ORDER BY d.name, r.name;
```

### 4. Get Approval Authority Matrix

```sql
-- What can each role approve?
SELECT
    r.name AS role_name,
    at.approval_name,
    raa.authority_level,
    raa.monetary_limit,
    raa.can_delegate
FROM org_roles r
JOIN role_approval_authority raa ON r.id = raa.role_id
JOIN approval_types at ON raa.approval_type_id = at.id
WHERE r.slug = 'regulatory-affairs-manager'
ORDER BY
    CASE raa.authority_level
        WHEN 'final_approver' THEN 1
        WHEN 'co_approver' THEN 2
        WHEN 'recommender' THEN 3
        WHEN 'reviewer' THEN 4
        ELSE 5
    END;
```

### 5. Generate RACI Matrix for Process

```sql
-- Who does what for "IND Submission" process?
SELECT
    r.name AS role_name,
    d.name AS department,
    rpp.participation_type AS raci,
    rpp.typical_involvement_hours,
    rpp.is_critical_path
FROM process_definitions p
JOIN role_process_participation rpp ON p.id = rpp.process_id
JOIN org_roles r ON rpp.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
WHERE p.process_name = 'IND Submission'
ORDER BY
    CASE rpp.participation_type
        WHEN 'accountable' THEN 1
        WHEN 'responsible' THEN 2
        WHEN 'consulted' THEN 3
        WHEN 'informed' THEN 4
        ELSE 5
    END,
    d.name;
```

### 6. Find Workflow Time Allocation

```sql
-- How does role spend their time?
SELECT
    wa.activity_name,
    wa.category,
    rwa.time_allocation_percent,
    (rwa.time_allocation_percent / 100.0) * 40 AS hours_per_week,
    rwa.priority
FROM org_roles r
JOIN role_workflow_activities rwa ON r.id = rwa.role_id
JOIN workflow_activities wa ON rwa.activity_id = wa.id
WHERE r.slug = 'medical-science-liaison'
ORDER BY rwa.priority;
```

### 7. Enrichment Coverage Report

```sql
-- Which roles are fully vs. partially enriched?
WITH enrichment_counts AS (
    SELECT
        r.id,
        r.name,
        CASE WHEN r.gxp_role_type IS NOT NULL THEN 1 ELSE 0 END AS has_gxp,
        COUNT(DISTINCT rrf.id) AS frameworks,
        COUNT(DISTINCT rgt.id) AS training,
        COUNT(DISTINCT rcc.id) AS competencies,
        COUNT(DISTINCT raa.id) AS approvals,
        COUNT(DISTINCT rwa.id) AS activities
    FROM org_roles r
    LEFT JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
    LEFT JOIN role_gxp_training rgt ON r.id = rgt.role_id
    LEFT JOIN role_clinical_competencies rcc ON r.id = rcc.role_id
    LEFT JOIN role_approval_authority raa ON r.id = raa.role_id
    LEFT JOIN role_workflow_activities rwa ON r.id = rwa.role_id
    GROUP BY r.id, r.name, r.gxp_role_type
)
SELECT
    name,
    has_gxp,
    frameworks,
    training,
    competencies,
    approvals,
    activities,
    (has_gxp + LEAST(frameworks, 1) + LEAST(training, 1) + LEAST(competencies, 1) +
     LEAST(approvals, 1) + LEAST(activities, 1)) AS enrichment_dimensions_filled,
    CASE
        WHEN (has_gxp + LEAST(frameworks, 1) + LEAST(training, 1) + LEAST(competencies, 1) +
              LEAST(approvals, 1) + LEAST(activities, 1)) >= 5 THEN 'Fully Enriched'
        WHEN (has_gxp + LEAST(frameworks, 1) + LEAST(training, 1) + LEAST(competencies, 1) +
              LEAST(approvals, 1) + LEAST(activities, 1)) >= 3 THEN 'Partially Enriched'
        ELSE 'Minimal Enrichment'
    END AS enrichment_status
FROM enrichment_counts
ORDER BY enrichment_dimensions_filled DESC, name;
```

---

## How to Enrich a Role (Step-by-Step)

### Step 1: Set Direct Attributes

```sql
UPDATE org_roles SET
    gxp_role_type = 'gcp',
    regulatory_inspection_role = false,
    pharmacovigilance_responsibility = true,
    clinical_trial_phase_focus = ARRAY['phase_3', 'phase_4'],
    drug_lifecycle_stage = ARRAY['clinical', 'commercial'],
    patient_facing = false,
    hcp_facing = true,
    typical_time_in_role_years = 3,
    advancement_potential = 'high',
    typical_meeting_hours_per_week = 5,
    administrative_load_percent = 20,
    strategic_vs_tactical = 'tactical',
    innovation_vs_execution = 'balanced'
WHERE slug = 'medical-science-liaison';
```

### Step 2: Map to Regulatory Frameworks

```sql
-- Find framework IDs first
SELECT id, name FROM regulatory_frameworks WHERE name LIKE '%GCP%';

-- Map role to frameworks
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_required, is_critical)
SELECT
    r.id,
    rf.id,
    'working_knowledge',
    true
FROM org_roles r
CROSS JOIN regulatory_frameworks rf
WHERE r.slug = 'medical-science-liaison'
AND rf.name IN ('ICH E6(R3) GCP', 'ICH E2A Clinical Safety');
```

### Step 3: Map to Training Modules

```sql
INSERT INTO role_gxp_training (role_id, training_module_id, is_mandatory, due_within_days_of_hire)
SELECT
    r.id,
    gtm.id,
    true,
    30
FROM org_roles r
CROSS JOIN gxp_training_modules gtm
WHERE r.slug = 'medical-science-liaison'
AND gtm.module_name IN ('GCP Fundamentals', 'Pharmacovigilance Essentials');
```

### Step 4: Map to Competencies

```sql
INSERT INTO role_clinical_competencies (role_id, competency_id, required_proficiency, is_mandatory)
SELECT
    r.id,
    cc.id,
    'expert',
    true
FROM org_roles r
CROSS JOIN clinical_competencies cc
WHERE r.slug = 'medical-science-liaison'
AND cc.competency_name IN (
    'Scientific Communication',
    'Medical Literature Evaluation',
    'Therapeutic Area Expertise'
);
```

### Step 5: Map to Workflow Activities

```sql
INSERT INTO role_workflow_activities (role_id, activity_id, frequency, time_allocation_percent, priority)
SELECT
    r.id,
    wa.id,
    'weekly',
    30,
    1
FROM org_roles r
CROSS JOIN workflow_activities wa
WHERE r.slug = 'medical-science-liaison'
AND wa.activity_name = 'Conduct KOL Engagement';
```

### Step 6: Validate Enrichment

```sql
-- Run coverage query from Section 7 above
```

---

## Data Governance

### Who Owns What?

| Data Domain | Owner | Update Frequency |
|-------------|-------|------------------|
| Regulatory Frameworks | Chief Regulatory Officer | Quarterly |
| GxP Training Modules | Head of Quality Training | Annually |
| Clinical Competencies | VP Medical Affairs | Annually |
| Approval Types | Chief Compliance Officer | As needed |
| Process Definitions | Process Excellence Team | Semi-annually |
| Workflow Activities | Department Heads | As needed |

### Update Triggers

**Update role enrichments when:**
1. New regulatory guidance published (FDA/EMA/ICH)
2. Organizational restructure
3. Job family changes
4. Performance management cycle (annual KPI review)
5. Competency model refresh

---

## AI Agent Integration Example

### Before Enrichment (Generic)

```typescript
const systemPrompt = "You are a helpful assistant for pharmaceutical professionals.";
```

### After Enrichment (Role-Specific)

```typescript
// Fetch role enrichment data
const role = await db.query(`
    SELECT
        r.*,
        json_agg(DISTINCT jsonb_build_object('framework', rf.name, 'proficiency', rrf.proficiency_required)) AS frameworks,
        json_agg(DISTINCT jsonb_build_object('approval', at.approval_name, 'authority', raa.authority_level, 'limit', raa.monetary_limit)) AS approvals
    FROM org_roles r
    LEFT JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
    LEFT JOIN regulatory_frameworks rf ON rrf.framework_id = rf.id
    LEFT JOIN role_approval_authority raa ON r.id = raa.role_id
    LEFT JOIN approval_types at ON raa.approval_type_id = at.id
    WHERE r.slug = 'medical-science-liaison'
    GROUP BY r.id
`);

const systemPrompt = `You are a Medical Science Liaison (MSL) AI assistant with the following context:

ROLE PROFILE:
- GxP Role Type: ${role.gxp_role_type}
- Pharmacovigilance Responsibility: ${role.pharmacovigilance_responsibility}
- HCP Facing: ${role.hcp_facing}
- Clinical Trial Phases: ${role.clinical_trial_phase_focus.join(', ')}

REGULATORY FRAMEWORKS (Working Knowledge Required):
${role.frameworks.map(f => `- ${f.framework}`).join('\n')}

APPROVAL AUTHORITY:
${role.approvals.map(a => `- ${a.approval}: ${a.authority} (limit: $${a.limit})`).join('\n')}

Based on this context:
1. If user requests approval >$${role.approvals.find(a => a.approval === 'Medical Education Grant')?.limit}, escalate to Medical Director
2. If adverse event mentioned, remind user of pharmacovigilance reporting requirements
3. Reference ICH-GCP principles when discussing clinical trials
`;
```

---

## Troubleshooting

### Issue: Junction table insert fails with FK violation

**Cause:** Role ID or reference data ID doesn't exist

**Solution:**
```sql
-- Verify role exists
SELECT id, name FROM org_roles WHERE slug = 'your-role-slug';

-- Verify reference data exists
SELECT id, name FROM regulatory_frameworks WHERE name = 'Your Framework Name';

-- If missing, insert reference data first
```

### Issue: Enrichment coverage is low

**Cause:** Junction tables not populated

**Solution:** Follow Step-by-Step enrichment guide above. Start with direct attributes, then junction tables.

### Issue: Duplicate constraint violation on junction table

**Cause:** Trying to map same role to same reference item twice

**Solution:**
```sql
-- Use ON CONFLICT to upsert instead
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_required)
VALUES ('{role_id}', '{framework_id}', 'expert')
ON CONFLICT (role_id, framework_id)
DO UPDATE SET proficiency_required = EXCLUDED.proficiency_required;
```

---

## Next Steps

1. **Run Migrations:**
   ```bash
   # Apply schema changes
   psql -f supabase/migrations/20251122000001_role_enrichment_phase1_foundation.sql

   # Seed reference data
   psql -f supabase/migrations/20251122000002_seed_pharma_reference_data.sql
   ```

2. **Enrich Medical Affairs Roles (Pilot):**
   - Start with 5 representative roles
   - Use step-by-step guide above
   - Validate with coverage queries

3. **Build UI for Data Stewards:**
   - Form to add/edit reference data
   - Wizard to enrich roles
   - Dashboard showing enrichment coverage

4. **Integrate with Persona System:**
   - Update persona generation to inherit from enriched roles
   - Test AI agent prompts with role context

---

## Resources

- **Full Strategy:** `ORG_ROLES_ENRICHMENT_STRATEGY.md`
- **Schema Migration:** `supabase/migrations/20251122000001_role_enrichment_phase1_foundation.sql`
- **Seed Data:** `supabase/migrations/20251122000002_seed_pharma_reference_data.sql`
- **Gold Standard Schema:** `.vital-command-center/04-TECHNICAL/data-schema/create_gold_standard_org_schema.sql`

---

**Questions?** Contact: VITAL Data Strategist Agent or vital-platform-orchestrator
