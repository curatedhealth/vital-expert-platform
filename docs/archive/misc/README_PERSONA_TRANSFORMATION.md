# Persona JSON to SQL Transformation

## Overview

The `transform_persona_json_to_sql.py` script automatically transforms ANY persona JSON file into production-ready SQL seed files by extracting the exact column structure from the gold standard template.

## How It Works

1. **Reads Template Structure** - Extracts exact column definitions from [TEMPLATE_personas_seed.sql](../sql/seeds/TEMPLATES/TEMPLATE_personas_seed.sql)
2. **Parses JSON** - Reads your persona JSON file
3. **Generates SQL** - Creates INSERT statements using the template's exact structure
4. **Validates** - Ensures all columns match what works in production

## Usage

### Basic Usage
```bash
python3 scripts/transform_persona_json_to_sql.py <json_file>
```

### With Custom Output Name
```bash
python3 scripts/transform_persona_json_to_sql.py <json_file> <output_name.sql>
```

### Examples

**Transform Part 2:**
```bash
python3 scripts/transform_persona_json_to_sql.py \
  "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_Part2_of_3_COMPLETE.json"
```

**Transform with custom name:**
```bash
python3 scripts/transform_persona_json_to_sql.py \
  "/Users/hichamnaim/Downloads/Market_Access_Personas.json" \
  "market_access_personas.sql"
```

## Output

The script generates:
- SQL file in `/sql/seeds/03_content/`
- Fully normalized structure
- Exact column compatibility with template
- Ready to load into database

## Required JSON Structure

Your JSON must include:

```json
{
  "metadata": {
    "tenant_id": "uuid-here",
    "function": "slug-here",
    "total_personas": 16,
    "part": "2 of 3",
    "date": "2025-11-15",
    "data_sources": "description"
  },
  "personas": [
    {
      "core_info": {
        "name": "Dr. Name",
        "slug": "persona-slug",
        "title": "Job Title",
        "department_slug": "dept-slug",
        "role_slug": "role-slug",
        "seniority_level": "executive"
      },
      "professional_profile": { ... },
      "vpanes_scoring": { ... },
      "goals": [...],
      "pain_points": [...],
      "challenges": [...],
      ...
    }
  ]
}
```

## Columns Extracted From Template

The script automatically extracts these table structures:

| Table | Columns |
|-------|---------|
| **persona_goals** | persona_id, tenant_id, goal_text, sequence_order |
| **persona_pain_points** | persona_id, tenant_id, pain_point_text, sequence_order |
| **persona_challenges** | persona_id, tenant_id, challenge_text, sequence_order |
| **persona_responsibilities** | persona_id, tenant_id, responsibility_text, sequence_order |
| **persona_frustrations** | persona_id, tenant_id, frustration_text, sequence_order |
| **persona_quotes** | persona_id, tenant_id, quote_text, sequence_order |
| **persona_tools** | persona_id, tenant_id, tool_name, sequence_order |
| **persona_communication_channels** | persona_id, tenant_id, channel_name, sequence_order |
| **persona_decision_makers** | persona_id, tenant_id, decision_maker_role, sequence_order |
| **persona_success_metrics** | persona_id, tenant_id, metric_name, sequence_order |
| **persona_motivations** | persona_id, tenant_id, motivation_text, sequence_order |
| **persona_personality_traits** | persona_id, tenant_id, trait_name, trait_description, sequence_order |
| **persona_values** | persona_id, tenant_id, value_name, value_description, sequence_order |
| **persona_education** | persona_id, tenant_id, degree, field_of_study, institution, year_completed, sequence_order |
| **persona_certifications** | persona_id, tenant_id, certification_name, issuing_organization, year_obtained, sequence_order |
| **persona_typical_day** | persona_id, tenant_id, time_of_day, activity_description, sequence_order |
| **persona_organization_types** | persona_id, tenant_id, organization_type, is_primary, sequence_order |
| **persona_typical_locations** | persona_id, tenant_id, location_name, is_primary, sequence_order |
| **persona_evidence_sources** | persona_id, tenant_id, source_type, citation, key_finding, sequence_order |
| **persona_vpanes_scoring** | persona_id, tenant_id, value_score, priority_score, addressability_score, need_score, engagement_score, scale_score, scoring_rationale |

## Loading Generated SQL

### Option 1: Direct psql
```bash
export PGPASSWORD='your-password'
psql postgresql://postgres:your-password@host:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "/path/to/output.sql"
```

### Option 2: Using Load Script
```bash
cd sql/seeds/03_content
./LOAD_PART2.sh  # or whatever load script you created
```

## Troubleshooting

### Error: "column does not exist"
**Cause:** Your JSON has fields that don't exist in the database schema.
**Solution:** The script only uses columns that exist in the template. Extra JSON fields are safely ignored.

### Error: "Template not found"
**Cause:** TEMPLATE_personas_seed.sql is missing.
**Solution:** Ensure the template exists at: `/sql/seeds/TEMPLATES/TEMPLATE_personas_seed.sql`

### Error: "function not found"
**Cause:** The org_functions table doesn't have the required function slug.
**Solution:** Load organizational structure first using the org templates.

## Template Updates

If the database schema changes:
1. Update TEMPLATE_personas_seed.sql
2. Re-run this script
3. The script automatically extracts the new structure

No code changes needed!

## Benefits

✅ **Template-Driven** - Always uses the exact structure that works in production
✅ **Self-Updating** - Reads column structure from template automatically
✅ **Repeatable** - Same process for any persona JSON file
✅ **Error-Proof** - Only generates columns that exist in the template
✅ **Fast** - Transforms 16 personas in <1 second

## Example Output

```
📖 Reading template structure...
  ✓ persona_goals: 4 columns
  ✓ persona_pain_points: 4 columns
  ✓ persona_challenges: 4 columns
  ...
  ✓ persona_vpanes_scoring: 9 columns

📄 Reading Medical_Affairs_Personas_Part2_of_3_COMPLETE.json...
  ✓ Found 16 personas
  ✓ Part: 2 of 3

🔨 Generating SQL...

✅ Success!
  📝 Generated 2851 lines of SQL
  💾 Output: /sql/seeds/03_content/medical_affairs_personas_part2_FIXED.sql
```

---

**Created:** 2025-11-16
**Status:** ✅ Production Ready
**Maintainer:** Auto-syncs with TEMPLATE_personas_seed.sql
