### Reusable Persona Loading System
# Complete Guide to Loading Personas for Any Business Function

**Last Updated**: 2025-11-16
**Status**: Production-Ready Templates

---

## Overview

This system provides reusable templates and scripts to load persona data for any business function into the database. It was battle-tested with Medical Affairs (67 personas successfully loaded).

---

## 📁 Directory Structure

```
database/sql/seeds/2025/PRODUCTION_TEMPLATES/
├── 00_foundation/
│   ├── 00_setup_org_structure_TEMPLATE.sql    # Org structure setup template
│   ├── LOAD_ALL_PERSONAS_TEMPLATE.sh          # Loading script template
│   └── README_PERSONA_LOADING_PROCESS.md      # This file
├── json_data/
│   └── 02_personas/
│       └── {function_name}/                    # Your JSON files here
│           ├── {function}_personas_part1.json
│           ├── {function}_personas_part2.json
│           └── {function}_personas_part3.json
└── 03_content/
    └── {function_slug}_personas_part1.sql     # Generated SQL files
```

---

## 🔄 Complete Loading Process

### Step 1: Prepare Your JSON Data

**Required JSON Structure** (supports both old and new formats):

```json
{
  "name": "Dr. Jane Smith",
  "title": "Director of Market Access",
  "slug": "dr-jane-smith-dma",
  "core_profile": {
    "seniority_level": "executive",
    "years_experience": 15
  },
  "professional_context": {
    "reports_to": "VP Market Access",
    "department": "Market Access Leadership"
  },
  "experience": {
    "years_in_current_role": 3,
    "years_in_industry": 15
  },
  "work_context": {
    "team_size": "20-50",
    "budget_authority": "$5M-$15M"
  },
  "psychographics": {
    "work_style": "collaborative",
    "learning_style": "hands-on",
    "technology_adoption": "early_adopter",
    "risk_tolerance": "moderate",
    "change_readiness": "high"
  },
  "demographics": {
    "age_range": "40-50",
    "education_level": "PharmD/MBA"
  },
  "goals": [
    {
      "goal_text": "Achieve optimal market access outcomes",
      "goal_type": "primary",
      "priority": 1
    }
  ],
  "pain_points": [
    {
      "pain_point_text": "Complex payer landscape",
      "pain_category": "market",
      "severity": "high"
    }
  ],
  "challenges": [
    {
      "challenge_text": "Demonstrating value to payers",
      "challenge_type": "strategic",
      "impact_level": "critical"
    }
  ],
  "tools": [
    {
      "tool_name": "Veeva CRM",
      "tool_category": "CRM",
      "usage_frequency": "daily",
      "proficiency_level": "expert",
      "satisfaction_level": "high"
    }
  ],
  "vpanes_scoring": {
    "value_score": 8.5,
    "priority_score": 8.0,
    "addressability_score": 7.0,
    "need_score": 9.0,
    "engagement_score": 8.5,
    "scale_score": 8.0,
    "total_score": 49.0,
    "priority_tier": "tier_1"
  },
  "evidence_sources": [
    {
      "source_type": "industry_survey",
      "citation": "Market Access Benchmarking 2024",
      "key_finding": "Average team size is 25 professionals",
      "sample_size": 300,
      "methodology": "Online survey",
      "publication_date": "2024-01-01",
      "confidence_level": "high",
      "url": "https://example.com/survey"
    }
  ]
}
```

**Split Large Files** (if needed):
- Part 1: Up to 20 personas
- Part 2: Next 20 personas
- Part 3: Remaining personas

---

### Step 2: Create Organizational Structure

**2.1. Copy Template**
```bash
cp database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_org_structure_TEMPLATE.sql \
   database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_market_access_org.sql
```

**2.2. Replace Placeholders**
- `{{TENANT_ID}}` → Your tenant UUID (e.g., `f7aa6fd4-0af9-4706-8b31-034f1f7accda`)
- `{{FUNCTION_NAME}}` → `Market Access`
- `{{FUNCTION_SLUG}}` → `market-access`
- `{{FUNCTION_DESCRIPTION}}` → Brief description
- `{{DEPARTMENT_*}}` → Your department names/slugs
- `{{CHIEF_ROLE_*}}` → Your chief role details

**2.3. Run Org Setup**
```bash
PGPASSWORD='your_password' psql "your_connection_string" \
  -f database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/00_setup_market_access_org.sql
```

---

### Step 3: Transform JSON to SQL

**3.1. Make Script Executable**
```bash
chmod +x scripts/transform_personas_json_to_sql_GENERIC.py
```

**3.2. Transform Each Part**
```bash
# Part 1
python3 scripts/transform_personas_json_to_sql_GENERIC.py \
  --input "database/sql/seeds/2025/PRODUCTION_TEMPLATES/json_data/02_personas/market_access/market_access_personas_part1.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/market_access_personas_part1.sql" \
  --function-slug "market-access" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 1 \
  --total-parts 3

# Part 2
python3 scripts/transform_personas_json_to_sql_GENERIC.py \
  --input "database/sql/seeds/2025/PRODUCTION_TEMPLATES/json_data/02_personas/market_access/market_access_personas_part2.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/market_access_personas_part2.sql" \
  --function-slug "market-access" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 2 \
  --total-parts 3

# Part 3 (if exists)
python3 scripts/transform_personas_json_to_sql_GENERIC.py \
  --input "database/sql/seeds/2025/PRODUCTION_TEMPLATES/json_data/02_personas/market_access/market_access_personas_part3.json" \
  --output "database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/market_access_personas_part3.sql" \
  --function-slug "market-access" \
  --tenant-id "f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  --part-number 3 \
  --total-parts 3
```

---

### Step 4: Create Loading Script

**4.1. Copy Template**
```bash
cp database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/LOAD_ALL_PERSONAS_TEMPLATE.sh \
   database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_MARKET_ACCESS_PERSONAS.sh
```

**4.2. Replace Placeholders**
- `{{FUNCTION_NAME}}` → `Market Access`
- `{{FUNCTION_SLUG}}` → `market_access`
- `{{TOTAL_PERSONA_COUNT}}` → Total number of personas
- `{{PART1_COUNT}}` → Number in part 1
- `{{PART2_COUNT}}` → Number in part 2
- `{{PART3_COUNT}}` → Number in part 3
- `{{DB_PASSWORD}}` → Your database password
- `{{DB_CONNECTION_STRING}}` → Your PostgreSQL connection string

**4.3. Make Executable**
```bash
chmod +x database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_ALL_MARKET_ACCESS_PERSONAS.sh
```

---

### Step 5: Load All Personas

```bash
cd database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content
./LOAD_ALL_MARKET_ACCESS_PERSONAS.sh
```

**Expected Output**:
```
========================================
Loading All Market Access Personas
========================================

Part 1: Loading 20 personas...
✅ Part 1 loaded successfully

Part 2: Loading 20 personas...
✅ Part 2 loaded successfully

Part 3: Loading 10 personas...
✅ Part 3 loaded successfully

========================================
✅ All personas loaded successfully!
========================================
Total: 50 Market Access personas loaded

Verifying load...
Total personas in database:    156
Total VPANES scores:           113
Total goals:                   463

Load complete!
```

---

## 🔍 Verification Queries

### Check Personas Loaded
```sql
SELECT COUNT(*)
FROM personas p
JOIN org_functions f ON f.id = p.function_id
WHERE f.slug = 'market-access';
```

### View Sample Personas
```sql
SELECT
    p.name,
    p.title,
    p.seniority_level,
    p.years_of_experience,
    v.total_score as vpanes_score,
    v.priority_tier
FROM personas p
JOIN org_functions f ON f.id = p.function_id
LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE f.slug = 'market-access'
ORDER BY v.total_score DESC NULLS LAST
LIMIT 10;
```

### Verify Junction Tables
```sql
SELECT
    (SELECT COUNT(*) FROM persona_goals WHERE persona_id IN (
        SELECT id FROM personas WHERE function_id IN (
            SELECT id FROM org_functions WHERE slug = 'market-access'
        )
    )) as goals_count,
    (SELECT COUNT(*) FROM persona_pain_points WHERE persona_id IN (
        SELECT id FROM personas WHERE function_id IN (
            SELECT id FROM org_functions WHERE slug = 'market-access'
        )
    )) as pain_points_count,
    (SELECT COUNT(*) FROM persona_tools WHERE persona_id IN (
        SELECT id FROM personas WHERE function_id IN (
            SELECT id FROM org_functions WHERE slug = 'market-access'
        )
    )) as tools_count;
```

---

## 🐛 Troubleshooting

### Issue: Function not found
**Error**: `market-access function not found for tenant`
**Solution**: Run the org structure setup script first (Step 2)

### Issue: Duplicate slugs
**Error**: `duplicate key value violates unique constraint`
**Solution**: Ensure all persona slugs are unique in your JSON

### Issue: Invalid enum values
**Error**: `invalid input value for enum`
**Solution**: Check that values like `seniority_level`, `severity`, etc. match allowed values

### Issue: Triple quotes in SQL
**Problem**: Values like `'high'` appearing as `'''high'''`
**Solution**: The generic script handles this correctly - no action needed

### Issue: Missing departments/roles
**Error**: NULL values in department_id or role_id
**Solution**: This is expected if not all personas have department/role mappings

---

## ✅ Best Practices

1. **Always run org setup first** before loading personas
2. **Validate JSON structure** before transformation
3. **Use kebab-case** for all slugs (e.g., `market-access`, not `Market Access`)
4. **Split large files** into parts of ~15-20 personas each
5. **Test with one persona** before loading all
6. **Back up database** before running large loads
7. **Use transactions** (DO $$ blocks handle this automatically)
8. **Verify counts** after each part loads

---

## 📝 Quick Reference

### Essential Commands
```bash
# 1. Setup org structure
psql "$DB_URL" -f 00_setup_market_access_org.sql

# 2. Transform JSON to SQL
python3 transform_personas_json_to_sql_GENERIC.py \
  --input personas.json \
  --output personas.sql \
  --function-slug "market-access" \
  --tenant-id "your-tenant-id"

# 3. Load all personas
./LOAD_ALL_MARKET_ACCESS_PERSONAS.sh

# 4. Verify
psql "$DB_URL" -c "SELECT COUNT(*) FROM personas WHERE function_id IN (
  SELECT id FROM org_functions WHERE slug = 'market-access'
);"
```

---

## 🎯 Success Metrics

After successful load, you should see:
- ✅ All personas in `personas` table
- ✅ VPANES scores in `persona_vpanes_scoring`
- ✅ Goals in `persona_goals` (typically 3-5 per persona)
- ✅ Pain points in `persona_pain_points` (typically 3-5 per persona)
- ✅ Tools in `persona_tools` (typically 3-10 per persona)
- ✅ Evidence in `persona_evidence_sources` (typically 1-3 per persona)
- ✅ All 20 junction tables populated

---

## 📚 Related Documentation

- **SQL Templates**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_foundation/`
- **Transformation Script**: `scripts/transform_personas_json_to_sql_GENERIC.py`
- **Example (Medical Affairs)**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/LOAD_SUCCESS_REPORT.md`
- **Schema Reference**: `database/sql/seeds/2025/PRODUCTION_TEMPLATES/00_PREPARATION/PERSONA_JUNCTION_TABLES_SCHEMA.md`

---

**Ready to Load**: Follow Steps 1-5 above to load personas for any business function!
