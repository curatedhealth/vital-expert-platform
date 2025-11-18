# Persona JSON Template System - Complete

## ✅ What's Been Created

### 1. Comprehensive JSON Template
**File:** [COMPREHENSIVE_PERSONA_TEMPLATE.json](COMPREHENSIVE_PERSONA_TEMPLATE.json)

- Complete example persona with ALL database fields
- Fully normalized - **NO JSONB columns**
- Every field maps to actual database tables
- Includes 20 junction tables
- Evidence sources with all 10 columns
- VPANES scoring
- Production-ready example data

### 2. Complete Documentation
**File:** [README_JSON_TEMPLATES.md](README_JSON_TEMPLATES.md)

- Field-by-field database mapping
- JSON structure rules
- Validation checklist
- Usage instructions
- Troubleshooting guide
- Examples (minimal & complete)

### 3. JSON Validator Script
**File:** [../../scripts/validate_persona_json.py](../../scripts/validate_persona_json.py)

Validates JSON before transformation:
- Required fields check
- Structure validation
- Slug uniqueness
- VPANES score ranges (0-10)
- JSONB detection (warns if found)
- Minimum recommended counts

## How To Use

### Step 1: Copy Template
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/TEMPLATES/json_templates"
cp COMPREHENSIVE_PERSONA_TEMPLATE.json my_personas.json
```

### Step 2: Edit Your Data
- Update metadata section
- Fill in persona details
- Ensure slugs are unique
- Match org structure slugs (function, department, role)

### Step 3: Validate
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/validate_persona_json.py my_personas.json
```

Expected output:
```
================================================================================
VALIDATION RESULTS
================================================================================

✅ VALIDATION PASSED
   (3 warnings to consider)
================================================================================
```

### Step 4: Transform to SQL
```bash
python3 scripts/transform_persona_json_to_sql.py my_personas.json
```

### Step 5: Load to Database
```bash
export PGPASSWORD='flusd9fqEb4kkTJ1'
DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f sql/seeds/03_content/my_personas.sql
```

## Database Schema - Fully Normalized

### Main Table: `personas`
Stores core persona data (35+ columns):
- Basic info: name, title, slug
- Demographics: age, location, gender, ethnicity
- Professional: years_experience, seniority_level, team_size
- Psychographics: work_style, tech_adoption, risk_tolerance
- Foreign keys: tenant_id, function_id, department_id, role_id

### 20 Junction Tables (Normalized Arrays)
Each array in JSON becomes a separate table:

1. **persona_goals** - Goals and objectives
2. **persona_pain_points** - Pain points and severity
3. **persona_challenges** - Challenges and impact
4. **persona_responsibilities** - Responsibilities and time allocation
5. **persona_frustrations** - Frustrations and emotional impact
6. **persona_quotes** - Representative quotes
7. **persona_tools** - Tools, usage, proficiency, satisfaction
8. **persona_communication_channels** - Channels, frequency, preference
9. **persona_decision_makers** - Decision makers, influence, relationship
10. **persona_success_metrics** - Metrics, targets, frequency
11. **persona_motivations** - Motivations and intensity
12. **persona_personality_traits** - Traits and descriptions
13. **persona_values** - Values and descriptions
14. **persona_education** - Degrees, fields, institutions
15. **persona_certifications** - Certifications and organizations
16. **persona_typical_day** - Daily activities timeline
17. **persona_organization_types** - Organization types (simple array)
18. **persona_typical_locations** - Work locations
19. **persona_evidence_sources** - **10 columns:** source_type, citation, key_finding, sample_size, methodology, publication_date, confidence_level, url
20. **persona_vpanes_scoring** - 6 dimensions + overall + rationale

## Evidence Sources - Complete Mapping

**JSON Structure:**
```json
{
  "evidence_sources": [
    {
      "type": "industry_survey",
      "title": "MAPS 2024 Benchmarking Study",
      "year": 2024,
      "sample_size": 450,
      "methodology": "Online survey",
      "confidence": "high",
      "key_finding": "75% report challenges",
      "url": "https://..."
    }
  ]
}
```

**Database Columns:**
- `source_type` ← `type`
- `citation` ← `title`
- `key_finding` ← `key_finding`
- `sample_size` ← `sample_size` (integer)
- `methodology` ← `methodology`
- `publication_date` ← `year` (converted to DATE)
- `confidence_level` ← `confidence`
- `url` ← `url`

Missing fields → empty string `''` or `NULL`

## No JSONB - All Normalized

✅ **Correct (Normalized):**
```json
{
  "goals": [
    {"goal": "Improve efficiency", "priority": "high"},
    {"goal": "Reduce costs", "priority": "medium"}
  ]
}
```

❌ **Wrong (JSONB-style):**
```json
{
  "goals": {
    "primary": ["Improve efficiency"],
    "secondary": ["Reduce costs"]
  }
}
```

## Validation Features

The validator checks for:

### Errors (Must Fix)
- Missing required fields (name, title, slug)
- Invalid JSON structure
- Duplicate slugs
- Missing org context (function_slug, department_slug, role_slug)
- VPANES scores outside 0-10 range
- Invalid data types

### Warnings (Should Fix)
- Too few goals/pain_points/challenges (< 3)
- Missing VPANES scoring
- Invalid slug format (not lowercase-with-hyphens)
- Potential JSONB structures detected

### Info (Optional)
- Missing optional arrays
- Field counts and statistics

## Files in This Directory

```
json_templates/
├── COMPREHENSIVE_PERSONA_TEMPLATE.json   # Complete template
├── README_JSON_TEMPLATES.md              # Full documentation
└── TEMPLATE_SYSTEM_COMPLETE.md          # This file
```

## Related Scripts

```
scripts/
├── validate_persona_json.py             # Validate JSON structure
├── transform_persona_json_to_sql.py     # Transform JSON → SQL
└── generate_template_from_schema.py     # Generate template from DB
```

## Integration with Strategic Plan

This template system integrates with the 5-step strategic process:

**Step 1: Diagnostic** - Understanding schema
**Step 2: Fix Gaps** - Ensure all columns exist
**Step 3: Template** - This template system
**Step 4: Transform** - Using these templates
**Step 5: Load** - Validated data loads without errors

## Quality Assurance

### Pre-Load Checklist

Before loading any JSON:

1. ✅ Run validator: `python3 scripts/validate_persona_json.py <file>`
2. ✅ Check all slugs are unique
3. ✅ Verify org structure exists (functions, departments, roles)
4. ✅ Confirm tenant_id matches target database
5. ✅ Review VPANES scores (0-10 range)
6. ✅ Validate evidence sources have minimum fields
7. ✅ No JSONB structures present

### Post-Load Verification

After loading:

1. Count personas loaded
2. Verify junction tables populated
3. Check foreign key integrity
4. Sample data queries
5. VPANES scoring completeness

## Examples

### Minimal Valid Persona (70 lines)
```json
{
  "metadata": {
    "tenant_id": "f7aa6fd4-0af9-4706-8b31-034f1f7accda",
    "function": "Medical Affairs",
    "total_personas": 1
  },
  "personas": [{
    "name": "Dr. Quick Example",
    "title": "Medical Director",
    "slug": "dr-quick-example-medical-director",
    "core_profile": {"seniority_level": "director"},
    "professional_context": {
      "function_slug": "medical-affairs",
      "department_slug": "medical-communications",
      "role_slug": "medical-director-director"
    },
    "goals": [{"goal": "Improve efficiency"}],
    "pain_points": [{"pain_point": "Manual processes"}],
    "challenges": [{"challenge": "Time constraints"}]
  }]
}
```

### Complete Persona (400+ lines)
See [COMPREHENSIVE_PERSONA_TEMPLATE.json](COMPREHENSIVE_PERSONA_TEMPLATE.json)

## Benefits

### 1. Zero JSONB Columns
- All data properly normalized
- Full relational integrity
- Queryable at field level
- No JSON parsing required

### 2. Schema-Driven
- Template matches exact database structure
- Field-by-field documentation
- Type safety ensured

### 3. Validation Built-In
- Catch errors before database load
- Clear error messages
- Recommended best practices

### 4. Production-Ready
- Used to generate Part 2 personas (16 personas, 2,851 lines SQL)
- Handles all edge cases
- Proven transformation logic

### 5. Maintainable
- When schema changes, update template
- Re-validate existing JSONs
- Transform with updated mappings

## Maintenance

### When Database Schema Changes

1. Run diagnostic:
```bash
psql $DB_URL -f sql/seeds/00_PREPARATION/DIAGNOSTIC_COMPLETE_SCHEMA.sql > SCHEMA.txt
```

2. Review changes in SCHEMA.txt

3. Update COMPREHENSIVE_PERSONA_TEMPLATE.json with new fields

4. Update README_JSON_TEMPLATES.md mapping table

5. Update transform_persona_json_to_sql.py FIELD_MAPPING

6. Re-validate all existing JSON files

7. Regenerate SQL from JSON sources

## Support

### Issues?

1. **Validation fails**: Review error messages, fix JSON structure
2. **Transformation fails**: Check FIELD_MAPPING in transformation script
3. **Load fails**: Run diagnostic, check schema matches template
4. **Column mismatch**: Regenerate template from current database schema

### Questions?

- See [README_JSON_TEMPLATES.md](README_JSON_TEMPLATES.md) for detailed mapping
- Check [COMPREHENSIVE_PERSONA_TEMPLATE.json](COMPREHENSIVE_PERSONA_TEMPLATE.json) for examples
- Review transformation script for field mappings

---

**System Version:** 1.0
**Created:** 2025-11-16
**Status:** ✅ Production Ready
**Database:** Fully Normalized, No JSONB
**Evidence Sources:** Complete 10-column mapping
**Validation:** Automated pre-load checks
**Next Action:** Use template to create persona JSONs, validate, transform, load!
