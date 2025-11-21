# JSON Persona Templates - Comprehensive Guide

## Overview

This directory contains JSON templates that match the **exact database schema** for persona data. All fields are **fully normalized** - no JSONB columns, everything maps to proper relational tables.

## Template File

**[COMPREHENSIVE_PERSONA_TEMPLATE.json](COMPREHENSIVE_PERSONA_TEMPLATE.json)** - Complete template with all fields and database mappings

## Database Schema Mapping

### Main Personas Table
Maps to: `personas` table

Core fields stored directly in the main table:
- `name`, `title`, `slug`
- `age`, `location`, `education_level`
- `years_experience`, `seniority_level`
- `employment_status`, `company_size`, `industry_segment`
- Demographics, work context, psychographics
- Foreign keys: `tenant_id`, `function_id`, `department_id`, `role_id`

### Junction Tables (Normalized Arrays)

Each array in the JSON maps to a separate table with `persona_id` foreign key:

| JSON Array | Database Table | Key Fields |
|------------|----------------|------------|
| `goals` | `persona_goals` | goal_text, priority, timeframe, sequence_order |
| `pain_points` | `persona_pain_points` | pain_point_text, severity, frequency, sequence_order |
| `challenges` | `persona_challenges` | challenge_text, impact_level, sequence_order |
| `responsibilities` | `persona_responsibilities` | responsibility_text, time_allocation, sequence_order |
| `frustrations` | `persona_frustrations` | frustration_text, emotional_impact, sequence_order |
| `quotes` | `persona_quotes` | quote_text, context, sequence_order |
| `tools` | `persona_tools` | tool_name, usage_frequency, proficiency, satisfaction |
| `communication_channels` | `persona_communication_channels` | channel_name, frequency, preference |
| `decision_makers` | `persona_decision_makers` | decision_maker_role, influence_level, relationship |
| `success_metrics` | `persona_success_metrics` | metric_name, target_value, measurement_frequency, importance |
| `motivations` | `persona_motivations` | motivation_text, intensity, sequence_order |
| `personality_traits` | `persona_personality_traits` | trait_name, trait_description, strength |
| `values` | `persona_values` | value_name, value_description, importance |
| `education` | `persona_education` | degree, field_of_study, institution, year_completed, honors |
| `certifications` | `persona_certifications` | certification_name, issuing_organization, year_obtained |
| `typical_day` | `persona_typical_day` | time_of_day, activity_description, sequence_order |
| `organization_type` | `persona_organization_types` | organization_type (simple array) |
| `typical_locations` | `persona_typical_locations` | location_name, is_primary |
| `evidence_sources` | `persona_evidence_sources` | source_type, citation, key_finding, sample_size, methodology, publication_date, confidence_level, url |

### VPANES Scoring
Maps to: `persona_vpanes_scoring` table

Single record per persona with:
- `value_score`, `priority_score`, `addressability_score`
- `need_score`, `engagement_score`, `scale_score`
- `overall_score`, `score_rationale`

## Field Requirements

### Required vs Optional

**Always Required:**
- `name` (personas.name)
- `title` (personas.title)
- `slug` (personas.slug - must be unique)
- `tenant_id` (via metadata)
- `function_slug`, `department_slug`, `role_slug` (for foreign keys)

**Highly Recommended:**
- All core_profile fields
- At least 3-5 items in: goals, pain_points, challenges, responsibilities
- VPANES scoring (all 6 dimensions)
- Evidence sources (for credibility)

**Optional:**
- All junction table arrays can be empty `[]`
- Extended attributes (demographics, certifications, etc.)

### Data Types

**Text Fields:** All text columns are `TEXT` type (unlimited length)
- Use for: names, descriptions, quotes, etc.

**Integer Fields:**
- `age`, `team_size`, `budget_responsibility`
- `years_experience`, `years_in_current_role`, etc.
- `sample_size` in evidence_sources
- All VPANES scores (0-10)

**Date Fields:**
- `publication_date` in evidence_sources
- Format: `YYYY-MM-DD` or just year (converted to `YYYY-01-01`)

**Enum/Text Constrained:**
- `seniority_level`: junior, mid, senior, director, executive
- `employment_status`: full_time, part_time, contract, consultant
- `company_size`: startup, small, medium, large, enterprise
- `work_model`: remote, hybrid, onsite
- And many more (see template for examples)

## JSON Structure Rules

### 1. No JSONB - All Normalized

❌ **Don't do this:**
```json
{
  "goals": {
    "primary": ["goal1", "goal2"],
    "secondary": ["goal3"]
  }
}
```

✅ **Do this:**
```json
{
  "goals": [
    {"goal": "goal1", "priority": "high"},
    {"goal": "goal2", "priority": "high"},
    {"goal": "goal3", "priority": "medium"}
  ]
}
```

### 2. Simple Arrays for Simple Data

For tables with just `persona_id, tenant_id, value`:
```json
{
  "organization_type": [
    "Large Pharma",
    "Multinational Corporation"
  ]
}
```

### 3. Object Arrays for Complex Data

For tables with multiple columns:
```json
{
  "tools": [
    {
      "tool": "Veeva Vault",
      "usage_frequency": "daily",
      "proficiency": "expert",
      "satisfaction": "high"
    }
  ]
}
```

### 4. Evidence Sources - Complete Objects

All fields mapped to database columns:
```json
{
  "evidence_sources": [
    {
      "type": "industry_survey",              // → source_type
      "title": "MAPS 2024 Study",             // → citation
      "citation": "Full citation text",       // → citation (if title not provided)
      "year": 2024,                           // → publication_date (YYYY-01-01)
      "sample_size": 450,                     // → sample_size (integer)
      "methodology": "Online survey",         // → methodology
      "confidence": "high",                   // → confidence_level
      "key_finding": "Main insight",          // → key_finding
      "url": "https://..."                    // → url
    }
  ]
}
```

## Usage

### 1. Copy Template
```bash
cp COMPREHENSIVE_PERSONA_TEMPLATE.json my_personas.json
```

### 2. Fill in Your Data
- Update metadata section
- Add your personas
- Ensure all slugs are unique
- Match function/department/role slugs to your org structure

### 3. Transform to SQL
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/transform_persona_json_to_sql.py my_personas.json
```

### 4. Load to Database
```bash
psql $DB_URL -c "\set ON_ERROR_STOP on" -f sql/seeds/03_content/my_personas.sql
```

## Validation Checklist

Before loading your JSON:

- [ ] All `slug` fields are unique and lowercase with hyphens
- [ ] `function_slug`, `department_slug`, `role_slug` match existing org data
- [ ] `tenant_id` in metadata matches your target tenant
- [ ] VPANES scores are between 0-10
- [ ] Years are 4-digit numbers (e.g., 2024)
- [ ] Email addresses are valid format
- [ ] No JSONB fields - all data is in proper arrays/objects
- [ ] Evidence sources have `type`, `title`, and `year` minimum
- [ ] At least 3 goals, 3 pain_points, 3 challenges per persona

## Field Mapping Reference

### Core Profile → Database Columns

| JSON Path | Database Column | Type | Notes |
|-----------|----------------|------|-------|
| `core_profile.age` | `personas.age` | integer | |
| `core_profile.location` | `personas.location` | text | |
| `core_profile.education_level` | `personas.education_level` | text | |
| `core_profile.years_experience` | `personas.years_experience` | integer | |
| `core_profile.seniority_level` | `personas.seniority_level` | text | |
| `demographics.gender` | `personas.gender` | text | |
| `demographics.ethnicity` | `personas.ethnicity` | text | |
| `professional_context.team_size` | `personas.team_size` | integer | |
| `professional_context.budget_responsibility` | `personas.budget_responsibility` | integer | |
| `experience.years_in_current_role` | `personas.years_in_current_role` | integer | |
| `experience.years_in_industry` | `personas.years_in_industry` | integer | |
| `psychographics.work_style` | `personas.work_style` | text | |
| `psychographics.technology_adoption` | `personas.technology_adoption` | text | |
| `psychographics.risk_tolerance` | `personas.risk_tolerance` | text | |

### Junction Table Objects

Each object in an array becomes one row in the corresponding junction table with `persona_id` and `tenant_id` automatically added.

Example:
```json
{
  "goals": [
    {"goal": "Streamline processes", "priority": "high"}
  ]
}
```

Becomes:
```sql
INSERT INTO persona_goals (persona_id, tenant_id, goal_text, priority, sequence_order)
VALUES (persona_uuid, tenant_uuid, 'Streamline processes', 'high', 1);
```

## Examples

### Minimal Valid Persona
```json
{
  "metadata": {
    "tenant_id": "f7aa6fd4-0af9-4706-8b31-034f1f7accda",
    "function": "Medical Affairs"
  },
  "personas": [
    {
      "name": "Dr. Quick Example",
      "title": "Medical Director",
      "slug": "dr-quick-example-medical-director",
      "core_profile": {
        "seniority_level": "director"
      },
      "professional_context": {
        "function_slug": "medical-affairs",
        "department_slug": "medical-communications",
        "role_slug": "medical-director-director"
      },
      "goals": [
        {"goal": "Improve efficiency"}
      ]
    }
  ]
}
```

### Complete Persona
See [COMPREHENSIVE_PERSONA_TEMPLATE.json](COMPREHENSIVE_PERSONA_TEMPLATE.json) for a fully populated example with all fields.

## Troubleshooting

### "Foreign key violation"
- Check that `function_slug`, `department_slug`, `role_slug` exist in org tables
- Ensure tenant_id matches existing tenant

### "Column does not exist"
- Database schema may have changed
- Run diagnostic: `psql $DB_URL -f sql/seeds/00_PREPARATION/DIAGNOSTIC_COMPLETE_SCHEMA.sql`
- Regenerate template from schema if needed

### "INSERT has more expressions than target columns"
- Template may be outdated
- Transformation script may have wrong column mapping
- Check `scripts/transform_persona_json_to_sql.py` FIELD_MAPPING

## Schema Updates

When database schema changes:

1. Run diagnostic to see new structure
2. Update this template
3. Update transformation script mappings
4. Regenerate all SQL from JSON sources

## Notes

- All text fields support Unicode and special characters
- Empty strings `""` are valid for optional text fields
- `NULL` is used for optional numeric/date fields when not provided
- Sequence order is auto-generated (1, 2, 3, ...) for junction table arrays
- `is_primary` is set to `true` for first item in `typical_locations`

---

**Template Version:** 1.0
**Last Updated:** 2025-11-16
**Database Schema:** Pharma & Digital Health Multi-tenant
**Status:** ✅ Production Ready
