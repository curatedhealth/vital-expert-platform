# Complete Guide to Loading Organizational Roles

**Last Updated**: 2025-11-16
**Status**: Production-Ready Templates

---

## Overview

This system provides reusable templates and scripts to load organizational role data for any business function into the `org_roles` table. It mirrors the proven persona loading system and handles all 111 columns in the org_roles schema.

---

## 📁 Directory Structure

```
database/sql/seeds/2025/PRODUCTION_TEMPLATES/
├── 00_foundation/
│   ├── ROLE_JSON_TEMPLATE.json                # JSON structure template
│   ├── LOAD_ALL_ROLES_TEMPLATE.sh             # Loading script template
│   └── README_ROLE_LOADING_PROCESS.md         # This file
├── json_data/
│   └── 01_roles/
│       └── {function_name}/                    # Your JSON files here
│           ├── {function}_roles_part1.json
│           └── {function}_roles_part2.json
└── 03_content/
    └── {function_slug}_roles_part1.sql        # Generated SQL files
```

---

## 🔄 Complete Loading Process

### Step 1: Prepare Your JSON Data

Use the [ROLE_JSON_TEMPLATE.json](ROLE_JSON_TEMPLATE.json) as your guide. The template includes:

**Core Profile**:
- name, slug, description
- seniority_level (entry, mid, senior, executive, c_level)
- is_leadership, is_individual_contributor, is_active

**Organizational Hierarchy**:
- function_slug, department_slug
- reports_to_role_slug, dotted_line_to_role_slug

**Team Structure**:
- team_size_min/max, direct_reports_min/max
- layers_below, span_of_control_notes

**Budget Authority**:
- budget_min_usd, budget_max_usd
- budget_authority_type (none, limited, moderate, substantial, full)
- approval_limit_usd, approval_limit_type

**Experience Requirements**:
- years_total_min/max, years_industry_min, years_function_min
- years_leadership_min, years_current_level_min

**Compensation**:
- base_salary_min/max_usd, total_comp_min/max_usd
- bonus_target_percentage, equity_eligible
- equity_percentage_min/max

**Geographic Scope**:
- geographic_scope_type (site, city, region, country, national, multi_country, global)
- geographic_primary_region, geographic_regions (array)
- remote_work_eligible, relocation_required
- travel_percentage_min/max, international_travel

**Career Progression**:
- typical_prior_role, typical_next_role
- time_in_role_years_min/max, promotion_potential

**Educational Requirements**:
- education_level_required, additional_degrees_preferred
- certifications_required (array), certifications_preferred (array)

**Decision Authority**:
- decision_making_level, has_p_and_l_responsibility
- has_hiring_authority, has_firing_authority
- autonomous_decision_limit_usd

**Stakeholder Relationships**:
- internal_stakeholders (array), external_stakeholders (array)
- key_relationships (array), reporting_relationships_notes

**Therapeutic Expertise**:
- therapeutic_areas (array), disease_areas (array)
- specialization_required, breadth_vs_depth

**Responsibilities**:
- primary_responsibilities (array), secondary_responsibilities (array)
- accountability_metrics (array)

**Success Metrics**:
- kpis (array), performance_indicators (array)

**Skills**:
- technical_skills (array), leadership_skills (array)
- business_skills (array), soft_skills (array)

**Work Environment**:
- work_model, office_requirement_days_per_week
- typical_work_hours, on_call_requirements
- weekend_work_frequency, flexibility_level

**Critical Competencies**:
- must_have_competencies (array), nice_to_have_competencies (array)

**Challenges**:
- common_challenges (array), stress_factors (array)

**Industry Context**:
- industry_trends_impact (array), competitive_landscape_notes
- regulatory_environment_notes

---

### Step 2: Transform JSON to SQL

**Make Script Executable**:
```bash
chmod +x scripts/transform_roles_json_to_sql_GENERIC.py
```

**Transform Each Part**:
```bash
# Part 1
python3 scripts/transform_roles_json_to_sql_GENERIC.py \
  --input "database/sql/seeds/2025/PRODUCTION_TEMPLATES/json_data/01_roles/medical_affairs/medical_affairs_roles_part1.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_roles_part1.sql" \
  --function-slug "medical-affairs" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 1 \
  --total-parts 2

# Part 2 (if needed)
python3 scripts/transform_roles_json_to_sql_GENERIC.py \
  --input "database/sql/seeds/2025/PRODUCTION_TEMPLATES/json_data/01_roles/medical_affairs/medical_affairs_roles_part2.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_roles_part2.sql" \
  --function-slug "medical-affairs" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 2 \
  --total-parts 2
```

---

### Step 3: Create Loading Script

**Copy Template**:
```bash
cp database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/LOAD_ALL_ROLES_TEMPLATE.sh \
   database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_MEDICAL_AFFAIRS_ROLES.sh
```

**Replace Placeholders**:
- `{{FUNCTION_NAME}}` → `Medical Affairs`
- `{{FUNCTION_SLUG}}` → `medical_affairs`
- `{{FUNCTION_SLUG_KEBAB}}` → `medical-affairs`
- `{{TOTAL_ROLE_COUNT}}` → Total number of roles
- `{{PART1_COUNT}}` → Number in part 1
- `{{PART2_COUNT}}` → Number in part 2 (or 0)
- `{{PART3_COUNT}}` → Number in part 3 (or 0)
- `{{DB_PASSWORD}}` → Your database password
- `{{DB_CONNECTION_STRING}}` → Your PostgreSQL connection string

**Make Executable**:
```bash
chmod +x database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_MEDICAL_AFFAIRS_ROLES.sh
```

---

### Step 4: Load All Roles

```bash
cd database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content
./LOAD_ALL_MEDICAL_AFFAIRS_ROLES.sh
```

**Expected Output**:
```
========================================
Loading All Medical Affairs Roles
========================================

Part 1: Loading 15 roles...
✅ Part 1 loaded successfully

Part 2: Loading 10 roles...
✅ Part 2 loaded successfully

========================================
✅ All roles loaded successfully!
========================================
Total: 25 Medical Affairs roles loaded

Verifying load...
 total_roles | seniority_levels | departments | leadership_roles | ic_roles
-------------+------------------+-------------+------------------+----------
          25 |                5 |           8 |               15 |       10
```

---

## 🔍 Verification Queries

### Check Roles Loaded
```sql
SELECT COUNT(*)
FROM org_roles r
JOIN org_functions f ON f.id = r.function_id
WHERE f.slug = 'medical-affairs';
```

### View Sample Roles
```sql
SELECT
    r.name,
    r.slug,
    r.seniority_level,
    r.is_leadership,
    r.team_size_min,
    r.team_size_max,
    r.budget_authority_type,
    d.name as department_name
FROM org_roles r
JOIN org_functions f ON f.id = r.function_id
LEFT JOIN org_departments d ON d.id = r.department_id
WHERE f.slug = 'medical-affairs'
ORDER BY r.seniority_level DESC, r.name
LIMIT 10;
```

### Verify Role Hierarchy
```sql
SELECT
    r.name as role_name,
    r.seniority_level,
    rr.name as reports_to_role,
    d.name as department
FROM org_roles r
JOIN org_functions f ON f.id = r.function_id
LEFT JOIN org_roles rr ON rr.id = r.reports_to_role_id
LEFT JOIN org_departments d ON d.id = r.department_id
WHERE f.slug = 'medical-affairs'
ORDER BY r.seniority_level DESC;
```

---

## 🐛 Troubleshooting

### Issue: Function not found
**Error**: `medical-affairs function not found for tenant`
**Solution**: Ensure the function exists in org_functions with correct slug

### Issue: Department not found
**Error**: NULL department_id after load
**Solution**: Ensure department_slug matches existing departments in org_departments

### Issue: Invalid enum values
**Error**: `invalid input value for enum`
**Solution**: Check enum values:
- budget_authority_type: none, limited, moderate, substantial, full
- approval_limit_type: no_authority, manager_approved, director_approved, vp_approved, c_level_approved, board_approved
- geographic_scope_type: site, city, region, country, national, multi_country, global

### Issue: Circular reporting relationships
**Error**: Role reports to itself or creates circular dependency
**Solution**: Ensure reports_to_role_slug points to existing roles and doesn't create loops

---

## ✅ Best Practices

1. **Load roles in hierarchy order** - Load senior roles before junior roles they manage
2. **Validate enum values** - Check against allowed values before transformation
3. **Use consistent slugs** - All slugs should be kebab-case
4. **Handle JSONB arrays** - Ensure arrays are properly formatted JSON
5. **Test with one role** - Load a single role first, verify, then load all
6. **Verify relationships** - Check that reports_to_role_id resolves correctly
7. **Document compensation** - Ensure salary ranges are realistic and consistent

---

## 📝 Quick Reference

### Essential Commands

```bash
# 1. Transform JSON to SQL
python3 scripts/transform_roles_json_to_sql_GENERIC.py \
  --input roles.json \
  --output roles.sql \
  --function-slug "medical-affairs" \
  --tenant-id "your-tenant-id"

# 2. Load all roles
./LOAD_ALL_MEDICAL_AFFAIRS_ROLES.sh

# 3. Verify
psql "$DB_URL" -c "SELECT COUNT(*) FROM org_roles WHERE function_id IN (
  SELECT id FROM org_functions WHERE slug = 'medical-affairs'
);"
```

---

## 🎯 Success Metrics

After successful load, you should see:
- ✅ All roles in `org_roles` table
- ✅ Correct seniority_level distribution
- ✅ Department assignments for all roles
- ✅ Reporting relationships properly linked
- ✅ Budget authority appropriately tiered
- ✅ Compensation ranges realistic and consistent
- ✅ JSONB arrays properly formatted (skills, stakeholders, etc.)

---

## 🔗 Related Documentation

- **JSON Template**: `ROLE_JSON_TEMPLATE.json`
- **Transformation Script**: `scripts/transform_roles_json_to_sql_GENERIC.py`
- **Loading Template**: `LOAD_ALL_ROLES_TEMPLATE.sh`
- **Persona Loading Guide**: `README_PERSONA_LOADING_PROCESS.md` (similar process)

---

## 📊 Example Role Counts by Seniority

Typical distribution for a business function:

| Seniority Level | Typical Count | Examples |
|----------------|---------------|----------|
| c_level | 1-2 | Chief Medical Officer, VP Medical Affairs |
| executive | 2-4 | SVP roles, Executive Directors |
| senior | 5-8 | Senior Directors, Senior Managers |
| mid | 8-12 | Managers, Directors |
| entry | 5-10 | Associates, Specialists, Coordinators |

---

**Ready to Load**: Follow Steps 1-4 above to load roles for any business function!
