# Medical Affairs Role Enrichment - Gap Analysis & Action Plan

## 📊 Current Status (All ✅ PASS)

### What We Have ✅
- **15 Functions** - Fully populated with basic attributes
- **100+ Departments** - Mapped to functions
- **693 Roles** - With geographic scope, seniority, and category
- **Clean Schema** - Gold standard, normalized, role-centric design
- **Multi-tenant Ready** - Junction tables in place

### Quality Checks ✅
```
✓ PASS - All departments have roles
✓ PASS - All roles have seniority levels
✓ PASS - All roles have categories
✓ PASS - All functions have departments
```

---

## 🎯 Gaps to Fill for Medical Affairs (108 Roles)

### 1. **Role-Level Attributes** (Partially Complete)
Current status from `org_roles` table:

| Attribute | Status | Needs |
|-----------|--------|-------|
| `description` | ❌ NULL | Role purpose and key activities |
| `role_type` | ❌ NULL | Classification (e.g., "Scientific Liaison") |
| `leadership_level` | ⚠️ Default | Actual leadership level per role |
| `job_code` | ❌ NULL | Internal job codes |
| `grade_level` | ❌ NULL | Compensation grade (1-10) |
| `team_size_min/max` | ❌ NULL | Team size managed |
| `direct_reports_min/max` | ❌ NULL | Number of direct reports |
| `indirect_reports_min/max` | ❌ NULL | Indirect reports |
| `layers_below` | ⚠️ Default (0) | Organization layers |
| `travel_percentage_min/max` | ❌ NULL | Travel requirements (0-100%) |
| `international_travel` | ⚠️ Default (false) | International travel flag |
| `overnight_travel_frequency` | ❌ NULL | Frequency description |
| `budget_min_usd/max_usd` | ❌ NULL | Budget managed |
| `budget_authority_type` | ⚠️ Default (none) | Budget authority type |
| `budget_authority_limit` | ❌ NULL | Spending authority limit |
| `years_experience_min/max` | ❌ NULL | Experience requirements |
| `reports_to_role_id` | ❌ NULL | Reporting structure |

### 2. **Junction Table Data** (All Empty)

| Junction Table | Current | Needed Per Role |
|----------------|---------|-----------------|
| `role_responsibilities` | ❌ 0 | 3-7 responsibilities with time allocation |
| `role_kpis` | ❌ 0 | 3-5 KPIs with targets |
| `role_skills` | ❌ 0 | 5-10 skills with proficiency levels |
| `role_tools` | ❌ 0 | 3-8 tools with usage frequency |
| `role_internal_stakeholders` | ❌ 0 | 4-8 internal stakeholders |
| `role_external_stakeholders` | ❌ 0 | 3-6 external stakeholders |
| `role_therapeutic_areas` | ❌ 0 | 1-3 therapeutic areas |
| `role_company_sizes` | ❌ 0 | 1-3 applicable company sizes |
| `role_ai_maturity` | ❌ 0 | AI maturity assessment (1 per role) |
| `role_vpanes_scores` | ❌ 0 | VPANES scores (6 dimensions) |

### 3. **Reference Data** (Need to Populate First)

Before enriching roles, we need to populate reference tables:

| Reference Table | Status | Count Needed |
|-----------------|--------|--------------|
| `skills` | ❓ Unknown | 50-100 pharma skills |
| `tools` | ❓ Unknown | 30-50 pharma tools |
| `stakeholders` | ❌ Empty | 20-30 stakeholder types |
| `responsibilities` | ❌ Empty | 40-60 responsibility types |
| `kpi_definitions` | ❌ Empty | 30-50 KPI types |
| `therapeutic_areas` | ❌ Empty | 15-20 therapeutic areas |
| `disease_areas` | ❌ Empty | 50-100 disease areas |
| `company_sizes` | ❌ Empty | 4-5 company size categories |
| `ai_maturity_levels` | ❌ Empty | 5 maturity levels |
| `vpanes_dimensions` | ❌ Empty | 6 VPANES dimensions |

---

## 📋 Action Plan

### Phase 1: Prepare Reference Data (MUST DO FIRST)
```sql
-- Create and run these scripts:
1. populate_reference_skills.sql (50-100 pharma skills)
2. populate_reference_tools.sql (30-50 tools)
3. populate_reference_stakeholders.sql (20-30 types)
4. populate_reference_responsibilities.sql (40-60 types)
5. populate_reference_kpis.sql (30-50 KPIs)
6. populate_reference_therapeutic_areas.sql (15-20 areas)
7. populate_reference_company_sizes.sql (4-5 sizes)
8. populate_reference_ai_maturity.sql (5 levels)
9. populate_reference_vpanes.sql (6 dimensions)
```

### Phase 2: Get Medical Affairs IDs
```bash
# Option A: Run SQL script
psql -f get_medical_affairs_structure_for_template.sql > medical_affairs_ids.json

# Option B: Run Python script (requires Supabase credentials)
export SUPABASE_URL="your-url"
export SUPABASE_KEY="your-key"
python3 generate_medical_affairs_enrichment_template.py
```

### Phase 3: Research & Fill Template
For EACH of the 108 Medical Affairs roles:

1. **Web Research** - Look up actual job descriptions, salary data, requirements
2. **Fill Attributes** - Complete all role-level attributes
3. **Map Responsibilities** - Assign 3-7 from reference table
4. **Set KPIs** - Define 3-5 measurable success metrics
5. **Assign Skills** - Map 5-10 required skills with proficiency
6. **List Tools** - Identify 3-8 tools used daily/weekly
7. **Map Stakeholders** - Internal (4-8) and external (3-6)
8. **Set Therapeutic Areas** - 1-3 areas per role
9. **AI Maturity Score** - Based on work complexity and AI readiness
10. **VPANES Scores** - All 6 dimensions (0-100 scale)

### Phase 4: Import Enriched Data
```sql
-- Create and run:
import_medical_affairs_enrichment.sql
```

### Phase 5: Verify
```sql
-- Run comprehensive verification:
verify_medical_affairs_enrichment.sql
```

---

## 📝 Data Collection Guidelines

### For Each Role Research:

**1. Job Market Research:**
- LinkedIn job postings
- Glassdoor salary data
- Industry salary surveys
- Professional associations

**2. Responsibilities (3-7 per role):**
- Core duties (40-60% time)
- Strategic work (15-25% time)
- Administrative (10-15% time)
- Development (5-10% time)

**3. KPIs (3-5 per role):**
- 1-2 primary KPIs (business critical)
- 2-3 secondary KPIs (quality/efficiency)
- All must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)

**4. Skills (5-10 per role):**
- Technical/domain expertise (3-5 skills)
- Soft skills (2-3 skills)
- Digital/technology (1-2 skills)
- Set realistic proficiency expectations

**5. Budget Ranges:**
- Entry: $10K-$50K
- Mid: $50K-$200K
- Senior: $200K-$500K
- Director: $500K-$2M
- Executive: $2M-$10M+

**6. Travel Ranges:**
- Office: 0-10%
- Hybrid: 10-30%
- Field (local): 30-50%
- Field (regional): 50-70%
- Field (global): 70-90%

---

## 🎯 Expected Output

After completion, each role will have:

```
✓ 20+ role attributes filled
✓ 3-7 responsibilities with time allocation
✓ 3-5 KPIs with measurable targets
✓ 5-10 skills with proficiency levels
✓ 3-8 tools with usage frequency
✓ 4-8 internal stakeholders mapped
✓ 3-6 external stakeholders mapped
✓ 1-3 therapeutic areas assigned
✓ 1-3 company sizes applicable
✓ AI maturity assessment complete
✓ 6 VPANES dimension scores set
```

**Total Data Points per Role: ~80-120**
**Total for 108 Medical Affairs Roles: ~8,640-12,960 data points**

---

## 📁 Files Created

1. `MEDICAL_AFFAIRS_ROLE_ENRICHMENT_TEMPLATE.json` - Example with 1 role fully populated
2. `generate_medical_affairs_enrichment_template.py` - Auto-generates template with actual IDs
3. `get_medical_affairs_structure_for_template.sql` - SQL to fetch IDs
4. `verify_complete_org_structure.sql` - Quality checks

---

## 🚀 Quick Start

```bash
# 1. Get the structure with IDs
psql your_db < get_medical_affairs_structure_for_template.sql

# 2. Review the example template
cat MEDICAL_AFFAIRS_ROLE_ENRICHMENT_TEMPLATE.json

# 3. Generate template with actual IDs (if you have Supabase access)
python3 generate_medical_affairs_enrichment_template.py

# 4. Fill in the template (this is the manual work!)
# Use web research for each of the 108 roles

# 5. Import the enriched data
# (Script to be created based on your completed template)
```

---

## ⚠️ Important Notes

1. **Reference Data First** - You MUST populate reference tables before enriching roles
2. **Consistency** - Keep naming conventions consistent across all roles
3. **Validation** - Ensure percentages sum to 100, ranges are valid (min < max)
4. **Sources** - Document your research sources for audit trail
5. **Iterations** - Start with 1 department (Field Medical) as proof of concept

---

## 💡 Recommendation

**Start Small:**
1. Populate all reference tables (Phase 1)
2. Enrich 1 department completely (Field Medical - 15 roles)
3. Verify data quality
4. Create automation/templates
5. Scale to remaining 8 departments (93 roles)

This approach reduces risk and allows you to refine the process before scaling.
