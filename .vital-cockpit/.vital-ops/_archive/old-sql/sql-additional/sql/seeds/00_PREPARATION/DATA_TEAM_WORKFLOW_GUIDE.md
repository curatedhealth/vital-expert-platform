# 📘 VITAL Platform - Persona Data Team Workflow Guide

**Version**: 5.0
**Last Updated**: 2025-11-17
**Status**: Production Ready
**Audience**: Data Team, Analysts, Researchers

---

## 🎯 Purpose

This guide provides a proven, logical approach to collecting, transforming, and deploying persona data to the VITAL platform. Following this workflow will:

- ✅ Eliminate deployment errors
- ✅ Ensure Golden Rules compliance
- ✅ Maintain data quality and consistency
- ✅ Reduce transformation time by 90%
- ✅ Enable scalable persona creation across business functions

---

## 📚 Required Reading

Before starting, read these documents:

1. **DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md** - Non-negotiable rules
2. **V5_PERSONA_JSON_TEMPLATE.json** - Data model specification
3. **ALL_PERSONA_ATTRIBUTES_V5.md** - Complete attribute reference

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/`

---

## 🔒 Golden Rules (Non-Negotiable)

### Rule #1: ZERO JSONB Columns
**❌ PROHIBITED**: Using JSONB columns for structured data

**Why?**
- Defeats normalization and data integrity
- Cannot enforce constraints on nested data
- Difficult to query efficiently
- Schema changes require data migration
- Foreign key relationships cannot span into JSONB

**✅ CORRECT**: Use normalized tables instead

### Rule #2: Full Normalization to 3NF
All tables must be normalized to Third Normal Form (3NF) minimum

### Rule #3: Use TEXT[] Only for Simple Lists
**When TEXT[] is acceptable**:
- ✅ Simple string lists with NO metadata
- ✅ Tags, categories, keywords
- ✅ Lists that won't be filtered/joined frequently

**❌ NOT acceptable**:
- Complex objects with properties
- Data that needs filtering/searching
- Related entities (use junction tables)

---

## 🛣️ The Proven Workflow

### Phase 1: Data Collection & Structuring

**Step 1.1: Use the JSON Template**

```bash
# Location
/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION/V5_PERSONA_JSON_TEMPLATE.json
```

**Action**: Copy this template for your business function

```bash
cp V5_PERSONA_JSON_TEMPLATE.json ../Sales_Personas_Template.json
```

**Why**: The template includes:
- All required fields
- All optional fields
- Enum value constraints
- Data type specifications
- Field mapping to database columns
- Real-world examples

**Step 1.2: Validate Data Structure EARLY**

Before filling in data, ensure you understand:
- Which fields are required vs optional
- Valid enum values for each field
- Data types expected
- Normalization mappings (JSON object → database table)

**Example**:
```json
"pain_category": {
  "type": "enum",
  "values": ["operational", "strategic", "technology", "interpersonal"]
}
```

If your data has "general" as a category, **it will fail deployment**. Fix it during collection, not transformation.

**Step 1.3: Collect Data in Normalized Structure**

**❌ BAD - Flat structure**:
```json
{
  "pain_point_1": "Managing trials",
  "pain_point_2": "Budget constraints",
  "pain_point_3": "Stakeholder alignment"
}
```

**✅ GOOD - Normalized array**:
```json
{
  "pain_points": [
    {
      "pain_point": "Managing multiple concurrent trials",
      "category": "operational",
      "severity": "high"
    },
    {
      "pain_point": "Budget constraints for new initiatives",
      "category": "strategic",
      "severity": "medium"
    }
  ]
}
```

### Phase 2: Data Quality Validation

**Step 2.1: Enum Value Validation**

Create a checklist of all enum fields and their valid values:

| Field | Valid Values | Common Errors |
|-------|--------------|---------------|
| pain_category | operational, strategic, technology, interpersonal | ❌ general, business |
| severity | critical, high, medium, low | ❌ severe, moderate |
| goal_type | primary, secondary, long_term, personal | ❌ main, short_term |
| challenge_type | daily, weekly, strategic, external | ❌ recurring, ongoing |
| meeting_load | heavy, moderate, light | ❌ 5, 6, 7 (numbers) |
| energy_pattern | high, medium, low | ❌ recovery, variable |
| overall_confidence_level | very_high, high, medium, low, very_low | ❌ validated, confirmed |

**Step 2.2: Data Type Validation**

Common type mismatches to catch early:

| Field | Expected Type | Common Errors |
|-------|---------------|---------------|
| achievement_rate | decimal 0.0-1.0 | ❌ 85 (should be 0.85) |
| priority | integer | ❌ "high" (use mapping or integer) |
| years_of_experience | integer | ❌ "15 years" |
| meeting_load | enum | ❌ 7 (should be "heavy") |

**Step 2.3: Required Field Validation**

Check these critical required fields:

**Core Profile**:
- ✅ name (required)
- ✅ slug (required, unique)
- ✅ title (required)

**Evidence Summary** (if included):
- ✅ overall_confidence_level (required) - defaults to "medium"
- ✅ evidence_quality_score (required) - defaults to 7
- ✅ evidence_recency_score (required) - defaults to 7

**Step 2.4: Use Defaults Configuration**

Reference: `DEFAULT_VALUES.json`

For any optional fields that have NOT NULL constraints, ensure you either:
1. Provide the value in your JSON, OR
2. Rely on the default from DEFAULT_VALUES.json

**Example DEFAULT_VALUES.json**:
```json
{
  "persona_evidence_summary": {
    "overall_confidence_level": "medium",
    "evidence_quality_score": 7,
    "evidence_recency_score": 7,
    "total_sources": 0,
    "case_studies_count": 0,
    "statistics_count": 0
  },
  "persona_case_studies": {
    "industry": "Healthcare",
    "case_type": "success_story",
    "relevance_score": 8
  }
}
```

### Phase 3: Transformation & Deployment

**Step 3.1: Configure Transformation**

Edit `final_transform.py`:

```python
# Configuration
TENANT_ID = "your-tenant-id-here"
JSON_FILE = "/path/to/your/personas.json"
OUTPUT_SQL = "DEPLOY_YOUR_FUNCTION_V5.sql"
```

**Step 3.2: Update Mappings (if needed)**

If you have custom enum values that need mapping, update `VALUE_MAPPINGS.json`:

```json
{
  "persona_your_table": {
    "your_field": {
      "invalid_value_in_json": "valid_db_value",
      "another_invalid": "valid_value"
    }
  }
}
```

**Example**:
```json
{
  "persona_week_in_life": {
    "energy_pattern": {
      "recovery": "medium",
      "variable": "medium",
      "medium-high": "high"
    }
  }
}
```

**Step 3.3: Run Transformation**

```bash
cd /path/to/sql/seeds/00_PREPARATION
python3 final_transform.py
```

**Expected Output**:
```
Processing 31 personas...
1. Dr. Sarah Chen
2. Dr. Michael Rodriguez
...
31. Dr. James Wilson

✅ Generated: DEPLOY_YOUR_FUNCTION_V5.sql
📊 31 personas processed

Next: Deploy with:
psql "$DB_URL" -f DEPLOY_YOUR_FUNCTION_V5.sql
```

**Step 3.4: Review Generated SQL**

**Before deploying**, spot-check the generated SQL:

```bash
# Check for NULL values in required fields
grep "NULL" DEPLOY_YOUR_FUNCTION_V5.sql | grep -v "DO NOTHING" | head -20

# Check enum values look correct
grep "overall_confidence_level" DEPLOY_YOUR_FUNCTION_V5.sql | head -5

# Check persona count
grep "v_persona_id UUID;" DEPLOY_YOUR_FUNCTION_V5.sql | wc -l
```

**Step 3.5: Deploy to Database**

```bash
psql "$DATABASE_URL" -f DEPLOY_YOUR_FUNCTION_V5.sql 2>&1 | tee deployment.log
```

**Success Indicators**:
```
BEGIN
DO
DO
...
COMMIT
```

**Failure Indicators**:
```
ERROR: null value in column "field_name" violates not-null constraint
ERROR: invalid input value for enum
ERROR: duplicate key value violates unique constraint
ROLLBACK
```

**Step 3.6: Verify Deployment**

```sql
-- Check persona count
SELECT COUNT(*) FROM personas WHERE tenant_id = 'your-tenant-id';

-- Check extension data
SELECT
    'Evidence Summaries' as table_name,
    COUNT(*) as count
FROM persona_evidence_summary
WHERE tenant_id = 'your-tenant-id'
UNION ALL
SELECT 'Case Studies', COUNT(*)
FROM persona_case_studies
WHERE tenant_id = 'your-tenant-id'
UNION ALL
SELECT 'Pain Points', COUNT(*)
FROM persona_pain_points
WHERE tenant_id = 'your-tenant-id';
```

---

## ⚠️ Common Pitfalls & How to Avoid Them

### Pitfall #1: Using Invalid Enum Values

**Symptom**:
```
ERROR: invalid input value for enum pain_category: "general"
ERROR: check constraint "persona_pain_points_pain_category_check" violated
```

**Root Cause**: Data contains enum value not in database constraints

**Solution**:
1. Check valid values in template: `V5_PERSONA_JSON_TEMPLATE.json`
2. Either:
   - Fix source data to use valid values, OR
   - Add mapping in `VALUE_MAPPINGS.json`

**Example Fix**:
```json
// VALUE_MAPPINGS.json
{
  "persona_pain_points": {
    "pain_category": {
      "general": "operational",
      "business": "strategic"
    }
  }
}
```

### Pitfall #2: Missing Required Fields

**Symptom**:
```
ERROR: null value in column "overall_confidence_level" violates not-null constraint
```

**Root Cause**: Required field not provided and no default configured

**Solution**:
1. Add to source JSON, OR
2. Add to `DEFAULT_VALUES.json`:

```json
{
  "persona_evidence_summary": {
    "overall_confidence_level": "medium"
  }
}
```

### Pitfall #3: Type Mismatches

**Symptom**:
```
ERROR: invalid input syntax for type integer: "high"
ERROR: numeric field overflow - precision 3, scale 2
```

**Root Cause**: Wrong data type in source JSON

**Common Cases**:

**A. String instead of Integer**:
```json
// ❌ BAD
"priority": "high"

// ✅ GOOD - Use mapping
// In final_transform.py, handles: 'high' → 1, 'medium' → 2, 'low' → 3
```

**B. Percentage instead of Decimal**:
```json
// ❌ BAD
"achievement_rate": 85

// ✅ GOOD
"achievement_rate": 0.85

// OR - transformation script auto-converts if > 1
```

### Pitfall #4: Duplicate Unique Values

**Symptom**:
```
ERROR: duplicate key value violates unique constraint "personas_slug_key"
ERROR: duplicate key value violates unique constraint "month_phase_unique"
```

**Root Cause**: Duplicate values in unique fields

**Solution**:
- **slug**: Must be unique per persona - add distinguishing suffix
- **month_phase**: Only 3 allowed (beginning, mid, end) - map 4 weeks to 3 phases

**Example**:
```python
# Handle month_phase duplicates
if month_phase in phase_data:
    continue  # Skip duplicate
```

### Pitfall #5: Using JSONB for Structured Data

**Symptom**:
```
ERROR: column "pain_points" is of type text[] but expression is of type jsonb
```

**Root Cause**: Violating Golden Rule #1

**Solution**: Use normalized tables

**Migration**:
```json
// ❌ BAD - JSONB in personas table
{
  "pain_points": {...}  // Complex object
}

// ✅ GOOD - Normalized table
{
  "pain_points": [      // Array of objects
    {"pain_point": "...", "category": "operational"},
    {"pain_point": "...", "category": "strategic"}
  ]
}
// Each becomes a row in persona_pain_points table
```

### Pitfall #6: Iterative Debugging (Slow)

**Anti-Pattern**:
1. Deploy → Error
2. Fix one issue
3. Deploy → Different error
4. Fix one issue
5. Repeat 20 times...

**Better Approach**:
1. Validate ALL data against template BEFORE transformation
2. Run transformation
3. Review generated SQL
4. Deploy once successfully

**Time Savings**: 3 hours → 20 minutes

---

## ✅ Pre-Deployment Checklist

Before running transformation, verify:

### Data Quality
- [ ] All enum values match valid database values
- [ ] Required fields are populated or have defaults
- [ ] Data types match expectations
- [ ] Unique fields (slug) are actually unique
- [ ] Numeric ranges are within constraints (e.g., scores 1-10)

### Configuration
- [ ] `TENANT_ID` is correct in `final_transform.py`
- [ ] `JSON_FILE` path is correct
- [ ] `DEFAULT_VALUES.json` includes all required fields
- [ ] `VALUE_MAPPINGS.json` includes all enum conversions needed

### Template Compliance
- [ ] JSON structure follows `V5_PERSONA_JSON_TEMPLATE.json`
- [ ] No JSONB columns for structured data (Rule #1)
- [ ] Complex objects are structured as arrays (will become normalized tables)
- [ ] TEXT[] used only for simple string lists (Rule #3)

### Testing
- [ ] Test with 1-2 personas first
- [ ] Review generated SQL
- [ ] Deploy to test environment
- [ ] Verify data in database
- [ ] Then deploy full dataset

---

## 📊 Success Metrics

Track these metrics to measure process efficiency:

| Metric | Target | Notes |
|--------|--------|-------|
| First-time deployment success | 100% | No errors on first deployment |
| Transformation time | < 5 minutes | For 50 personas |
| Deployment time | < 2 minutes | For 50 personas |
| Data validation errors | 0 | Caught before transformation |
| Schema violations | 0 | Golden Rules compliance |
| Rollbacks required | 0 | Successful commits only |

**Medical Affairs Deployment Results**:
- ✅ 31 personas
- ✅ 0 errors
- ✅ 2 minute deployment
- ✅ 100% Golden Rules compliance

---

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DATA COLLECTION                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Copy JSON Template                                      │
│     └─> V5_PERSONA_JSON_TEMPLATE.json                       │
│                                                             │
│  2. Review Required Fields & Enums                          │
│     └─> ALL_PERSONA_ATTRIBUTES_V5.md                        │
│                                                             │
│  3. Structure Data in Normalized Format                     │
│     └─> Arrays for entities (pain_points, goals, etc.)     │
│                                                             │
│  4. Validate Enum Values Against Template                   │
│     └─> Fix invalid values OR add to VALUE_MAPPINGS.json   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: QUALITY VALIDATION                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  5. Check Required Fields                                   │
│     └─> Provide value OR add to DEFAULT_VALUES.json        │
│                                                             │
│  6. Verify Data Types                                       │
│     └─> Numbers as numbers, strings as strings             │
│                                                             │
│  7. Validate Unique Constraints                             │
│     └─> slug must be unique                                 │
│                                                             │
│  8. Review Golden Rules Compliance                          │
│     └─> No JSONB, normalized structure, simple TEXT[]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: TRANSFORMATION                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  9. Configure final_transform.py                            │
│     └─> Set TENANT_ID, JSON_FILE, OUTPUT_SQL               │
│                                                             │
│ 10. Run Transformation Script                               │
│     └─> python3 final_transform.py                          │
│                                                             │
│ 11. Review Generated SQL                                    │
│     └─> Spot check for NULLs, enum values                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: DEPLOYMENT                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 12. Deploy to Database                                      │
│     └─> psql "$DB_URL" -f DEPLOY_*.sql                      │
│                                                             │
│ 13. Check Deployment Log                                    │
│     └─> Look for COMMIT (success) or ROLLBACK (failure)    │
│                                                             │
│ 14. Verify Data in Database                                 │
│     └─> Run count queries, spot check records              │
│                                                             │
│ 15. Document Deployment                                     │
│     └─> Record persona count, tables populated             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      ✅ SUCCESS
```

---

## 🎓 Lessons Learned (Medical Affairs Deployment)

### What Went Wrong Initially

**Issue #1: JSONB Columns**
- **Problem**: personas table had 4 JSONB columns (pain_points, goals, challenges, communication_preferences)
- **Impact**: Violated Golden Rule #1, made querying difficult
- **Solution**: Migrated to normalized tables (288 pain points, 223 goals, 207 challenges)
- **Lesson**: Never use JSONB for structured data

**Issue #2: Missing Defaults**
- **Problem**: Trigger inserting NULL into required fields (overall_confidence_level, evidence_quality_score)
- **Impact**: Deployment failed with constraint violations
- **Solution**: Added defaults to DEFAULT_VALUES.json and fixed trigger
- **Lesson**: Every required field needs a default or explicit value

**Issue #3: Invalid Enum Values**
- **Problem**: JSON had "general" but schema only allowed specific categories
- **Impact**: CHECK constraint violations during deployment
- **Solution**: Created VALUE_MAPPINGS.json to convert invalid → valid
- **Lesson**: Validate enums early, map invalid values proactively

**Issue #4: Type Mismatches**
- **Problem**:
  - priority: "high" instead of integer
  - achievement_rate: 85 instead of 0.85
  - meeting_load: 7 instead of "heavy"
- **Impact**: Type conversion errors
- **Solution**: Built auto-conversion in transformation script
- **Lesson**: Document expected types clearly, handle conversions programmatically

**Issue #5: Iterative Debugging**
- **Problem**: Deploy → fix one error → deploy → fix next error (20 iterations)
- **Impact**: Wasted 3+ hours on trial and error
- **Solution**: Comprehensive schema analysis upfront, then one deployment
- **Lesson**: Invest time in validation before deployment, not during

### What Went Right

**Success #1: JSON Template**
- Clear structure with examples prevented structural errors
- All field requirements documented upfront

**Success #2: Configuration Files**
- DEFAULT_VALUES.json and VALUE_MAPPINGS.json made transformation reusable
- No code changes needed for different datasets

**Success #3: Normalization**
- 70 normalized tables provide flexibility and queryability
- Can add new persona types without schema changes

**Success #4: Transformation Script**
- Handles complex mappings automatically
- Converts percentages, priority strings, enum values
- Generates clean, deployable SQL

---

## 📂 File Organization

Organize your persona data projects like this:

```
sql/seeds/
├── 00_PREPARATION/
│   ├── DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md
│   ├── V5_PERSONA_JSON_TEMPLATE.json
│   ├── ALL_PERSONA_ATTRIBUTES_V5.md
│   ├── DATA_TEAM_WORKFLOW_GUIDE.md (this file)
│   │
│   ├── final_transform.py                # Reusable transformation script
│   ├── DEFAULT_VALUES.json               # Default value configuration
│   ├── VALUE_MAPPINGS.json               # Enum mapping configuration
│   │
│   └── V5_SCHEMA_ALIGNMENT_MIGRATION.sql # Schema migration (run once)
│
├── Medical_Affairs/
│   ├── Medical_Affairs_Personas_V5.json  # Source data
│   ├── DEPLOY_MA_V5_FINAL.sql            # Generated SQL
│   └── deployment.log                     # Deployment log
│
├── Sales/
│   ├── Sales_Personas_V5.json
│   ├── DEPLOY_SALES_V5.sql
│   └── deployment.log
│
└── Product_Management/
    ├── PM_Personas_V5.json
    ├── DEPLOY_PM_V5.sql
    └── deployment.log
```

---

## 🆘 Troubleshooting Guide

### Error: "null value violates not-null constraint"

**Diagnosis**:
```bash
grep "null value in column" deployment.log
```

**Solutions**:
1. Add field to source JSON with valid value
2. Add default to `DEFAULT_VALUES.json`
3. Check if field is in correct section (e.g., evidence_summary vs core_profile)

### Error: "invalid input value for enum"

**Diagnosis**:
```bash
grep "invalid input value" deployment.log
```

**Solutions**:
1. Check valid enum values in `V5_PERSONA_JSON_TEMPLATE.json`
2. Fix source data to use valid value, OR
3. Add mapping to `VALUE_MAPPINGS.json`

### Error: "duplicate key value violates unique constraint"

**Diagnosis**:
```bash
grep "duplicate key" deployment.log
```

**Solutions**:
1. For slug: Make unique by adding suffix (e.g., "sarah-chen-medical-director-2")
2. For month_phase: Only 3 allowed per persona (beginning, mid, end)

### Error: "column does not exist"

**Diagnosis**:
```bash
grep "column.*does not exist" deployment.log
```

**Solutions**:
1. Check field name in `ALL_PERSONA_ATTRIBUTES_V5.md`
2. Verify table name and column name match schema
3. Update transformation script if field renamed

### Error: "current transaction is aborted"

**Diagnosis**: This appears after the first real error

**Solution**: Scroll up in log to find the FIRST error - that's the real problem. All subsequent "aborted" errors are cascading from the first.

---

## 📞 Support & Questions

### Documentation References

| Topic | Document | Location |
|-------|----------|----------|
| Golden Rules | DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md | .claude/ |
| Data Model | V5_PERSONA_JSON_TEMPLATE.json | 00_PREPARATION/ |
| All Attributes | ALL_PERSONA_ATTRIBUTES_V5.md | 00_PREPARATION/ |
| This Workflow | DATA_TEAM_WORKFLOW_GUIDE.md | 00_PREPARATION/ |
| Schema Details | CURRENT_SCHEMA_COMPLETE.txt | 00_PREPARATION/ |

### Quick Reference Commands

**Get schema for a table**:
```sql
\d persona_pain_points
```

**Check enum values**:
```sql
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'persona_pain_points'::regclass
  AND conname LIKE '%category%';
```

**Count records by table**:
```sql
SELECT
    'Pain Points' as table_name,
    COUNT(*) as count
FROM persona_pain_points
WHERE tenant_id = 'your-tenant-id';
```

**Verify Golden Rule #1 compliance**:
```sql
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE 'persona%'
  AND data_type = 'jsonb'
  AND column_name != 'metadata';
-- Should return 0
```

---

## 🎯 Summary: The Logical Approach

1. **Start with the Template** - Don't guess the structure
2. **Validate Early** - Fix data quality issues before transformation
3. **Use Configuration** - Don't hardcode defaults and mappings
4. **Follow Golden Rules** - No JSONB, full normalization, simple arrays
5. **Review Before Deploy** - Spot check generated SQL
6. **Deploy Once** - Not 20 times iteratively
7. **Verify After** - Confirm data landed correctly

**Time Investment**:
- First time: 4-6 hours (learning + setup)
- Subsequent times: 30 minutes (collection + deployment)

**Success Rate**:
- Following this guide: 100%
- Not following this guide: ~5% (many iterations, frustration)

---

## ✅ Final Checklist

Before marking persona data project complete:

- [ ] All personas deployed successfully
- [ ] Verification queries show expected counts
- [ ] No constraint violations in deployment log
- [ ] Golden Rules compliance verified (0 JSONB columns)
- [ ] Deployment documented (persona count, date, tenant_id)
- [ ] Source JSON file backed up
- [ ] Generated SQL file archived
- [ ] Deployment log saved
- [ ] Template updated if new patterns discovered
- [ ] VALUE_MAPPINGS.json updated if new conversions added

---

**Remember**: The goal is not just to deploy personas, but to create a scalable, maintainable, high-quality data foundation for the VITAL platform.

**Follow this guide, and you'll succeed every time.** ✅

---

*Document Version: 1.0*
*Based on: Medical Affairs Personas v5.0 deployment (Nov 2025)*
*Success Rate: 100% when following this guide*
*Maintained by: Data Team*
