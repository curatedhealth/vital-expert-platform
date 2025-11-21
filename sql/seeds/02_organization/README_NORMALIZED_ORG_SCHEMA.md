# Normalized Organization Schema - Production Ready

**Date:** 2025-11-15
**Status:** ✅ PRODUCTION READY
**Architecture:** Fully Normalized (NO JSONB)

---

## 📁 Files in This Directory

### 1. `01_NORMALIZED_SCHEMA_SETUP.sql`
**Purpose:** Creates complete normalized schema for organizational structure
**Size:** ~27KB
**Execution Time:** ~5-10 seconds

**Creates:**
- ✅ 11 Master Tables (therapeutic_areas, countries, credentials, stakeholder_types, technology_platforms, etc.)
- ✅ 26 Junction Tables (Function/Department/Role levels)
- ✅ 176+ Master Data Records
- ✅ Scalar columns in org_roles (ta_complexity, revenue_range, product_focus, etc.)
- ✅ All indexes and foreign key constraints

### 2. `02_SEED_ROLES_NORMALIZED.sql`
**Purpose:** Populates 9 Medical Affairs roles with normalized data
**Size:** ~55KB
**Execution Time:** ~3-5 seconds
**Dependencies:** Requires `01_NORMALIZED_SCHEMA_SETUP.sql` to run first

**Updates:**
- ✅ 9 existing Medical Affairs roles with scalar field values
- ✅ Relationships via junction tables (TAs, countries, credentials, tech, stakeholders)
- ✅ Comprehensive verification queries showing data completeness

---

## 🚀 Quick Start

### Execution Order
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/02_organization"

export PGPASSWORD='your_password'
DB_URL="postgresql://postgres:your_password@your_host:5432/postgres"

# Step 1: Create normalized schema
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql"

# Step 2: Seed role data
psql $DB_URL -f "02_SEED_ROLES_NORMALIZED.sql"
```

### Expected Output
```
✅ 11 Master Tables Created & Populated
✅ 26 Junction Tables Created (Function/Department/Role levels)
✅ 176+ Master Data Records Loaded
✅ Leadership Department Created
✅ All Scalar Columns Added to org_roles
✅ 9 Medical Affairs roles populated
✅ Relationships populated via junction tables
```

---

## 📊 Architecture Overview

### Fully Normalized Design - NO JSONB Fields

**Before (JSONB approach):**
```sql
-- ❌ OLD WAY - JSONB fields
org_roles.therapeutic_areas = '["ONCO", "CV", "CNS"]'::jsonb
org_roles.countries = '["USA", "GBR", "DEU"]'::jsonb
```

**After (Normalized approach):**
```sql
-- ✅ NEW WAY - Normalized via junction tables
role_therapeutic_areas:
  - (role_id, therapeutic_area_id, expertise_level, is_primary)
  - (role_id, therapeutic_area_id, expertise_level, is_primary)

role_countries:
  - (role_id, country_id, coverage_percentage, is_primary)
  - (role_id, country_id, coverage_percentage, is_primary)
```

### Benefits
- ✅ **Better Performance:** Indexed foreign keys vs JSONB scans
- ✅ **Data Integrity:** Foreign key constraints enforce valid references
- ✅ **Flexible Querying:** JOIN operations vs JSONB operators
- ✅ **Scalability:** Easy to add metadata (expertise_level, coverage_percentage)
- ✅ **Analytics Ready:** Standard SQL aggregations and reporting

---

## 🗂️ Master Tables (11 Total)

### 1. therapeutic_areas
Therapeutic areas with hierarchy support
- **Columns:** code, name, category, parent_ta_id, description, market_size, growth_rate
- **Records:** ~15 areas (ONCO, CV, CNS, IMMUNO, etc.)

### 2. countries
Geographic coverage
- **Columns:** code, name, iso_alpha2, region_code, is_major_pharma_market
- **Records:** ~30 countries (USA, GBR, DEU, JPN, CHN, etc.)

### 3. credentials
Educational and professional credentials
- **Columns:** credential_code, name, credential_type, issuing_organization, typical_duration
- **Records:** ~20 credentials (MD, PhD, PharmD, MBA, MSc, etc.)

### 4. stakeholder_types
Internal and external stakeholder categories
- **Columns:** stakeholder_code, name, stakeholder_category, description, influence_level
- **Records:** ~25 types (CEO, KOL, FDA, EMA, Payers, etc.)

### 5. technology_platforms
Technology tools and platforms
- **Columns:** platform_code, name, category, vendor, typical_use_cases
- **Records:** ~15 platforms (Veeva, Salesforce, IQVIA, EndNote, etc.)

### 6. regulatory_bodies
Regulatory agencies worldwide
- **Columns:** body_code, name, region, authority_level, website
- **Records:** ~10 bodies (FDA, EMA, PMDA, NMPA, etc.)

### 7. data_sources
Information and data sources
- **Columns:** source_code, name, source_type, reliability_score
- **Records:** ~10 sources (PubMed, ClinicalTrials.gov, etc.)

### 8. communication_channels
Communication methods
- **Columns:** channel_code, name, channel_type, formality_level
- **Records:** ~10 channels (Email, Face-to-face, Virtual, etc.)

### 9. disease_areas
Specific diseases within therapeutic areas
- **Columns:** code, disease_code, name, therapeutic_area_code, severity_level, prevalence_category
- **Records:** ~15 diseases (NSCLC, Melanoma, Heart Failure, etc.)

### 10. product_lifecycle_stages
Product development and lifecycle stages
- **Columns:** stage_code, name, description, typical_duration_months, resource_intensity
- **Records:** ~6 stages (Pre-Launch, Launch, Growth, Mature, LOE, Decline)

### 11. company_size_categories
Company size segmentation (revenue in millions USD)
- **Columns:** size_code, category, employee_min/max, revenue_min/max (in millions)
- **Records:** ~6 categories (Startup, Small, Medium, Large, Enterprise, Mega)

---

## 🔗 Junction Tables (26 Total)

### Function Level (9 tables)
- `function_therapeutic_areas`
- `function_countries`
- `function_credentials_required`
- `function_stakeholders`
- `function_technology_platforms`
- `function_regulatory_bodies`
- `function_data_sources`
- `function_communication_channels`
- `function_disease_areas`

### Department Level (9 tables)
- `department_therapeutic_areas`
- `department_countries`
- `department_credentials_preferred`
- `department_stakeholders`
- `department_technology_platforms`
- `department_regulatory_bodies`
- `department_data_sources`
- `department_communication_channels`
- `department_disease_areas`

### Role Level (8 tables)
- `role_therapeutic_areas` (expertise_level, is_primary)
- `role_countries` (coverage_percentage, is_primary)
- `role_credentials_required` (is_mandatory)
- `role_credentials_preferred` (preference_level)
- `role_technology_platforms` (proficiency_level, usage_frequency, is_required)
- `role_product_lifecycle_stages` (is_primary_focus)
- `role_internal_stakeholders` (interaction_frequency, influence_level)
- `role_external_stakeholders` (interaction_frequency, influence_level)

---

## 📋 Scalar Columns Added to org_roles

### Complexity & Revenue
- `ta_complexity` VARCHAR(100) - e.g., 'Single TA', 'Multi-TA', 'Portfolio'
- `revenue_range_min` DECIMAL(15,2) - Minimum company revenue
- `revenue_range_max` DECIMAL(15,2) - Maximum company revenue

### Team Structure
- `indirect_reports_min` INTEGER
- `indirect_reports_max` INTEGER

### Experience Requirements
- `years_in_pharma_min` INTEGER
- `years_in_medical_affairs_min` INTEGER
- `years_in_leadership_min` INTEGER

### Product Portfolio
- `product_focus` VARCHAR(100) - e.g., 'Portfolio', 'Therapeutic Area', 'Product'
- `pipeline_exposure` VARCHAR(200) - e.g., 'Full Pipeline', 'TA-specific Portfolio'
- `products_supported_min` INTEGER
- `products_supported_max` INTEGER

---

## 🎯 What Was Fixed

### Issues Resolved
1. ✅ **pipeline_complexity removed** - Redundant field; complexity now derived from normalized data
2. ✅ **capex_authority & opex_authority removed** - Non-existent columns
3. ✅ **organizational_structure removed** - Non-existent column
4. ✅ **Column name standardization** - All junction tables use consistent naming
5. ✅ **Revenue in millions** - Changed from full amounts to millions for clarity
6. ✅ **View compatibility** - ALTER TABLE wrapped in conditional DO block
7. ✅ **Missing columns added** - product_focus, pipeline_exposure, products_supported_min/max

### Total Fixes Applied
- **normalize_all_org_roles_fields.sql:** 7 fixes
- **02_SEED_ALL_ROLES_NORMALIZED.sql:** 21 fixes
- **Grand Total:** 28 fixes

---

## 🔍 Verification Queries

After running both files, verify the setup:

```sql
-- Check master tables populated
SELECT
  'Master Tables' as category,
  (SELECT COUNT(*) FROM therapeutic_areas) as therapeutic_areas,
  (SELECT COUNT(*) FROM countries) as countries,
  (SELECT COUNT(*) FROM credentials) as credentials,
  (SELECT COUNT(*) FROM stakeholder_types) as stakeholder_types,
  (SELECT COUNT(*) FROM technology_platforms) as technology_platforms,
  (SELECT COUNT(*) FROM disease_areas) as disease_areas,
  (SELECT COUNT(*) FROM product_lifecycle_stages) as product_lifecycle_stages;

-- Check junction tables created
SELECT
  table_name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'role_%'
ORDER BY table_name;

-- Check roles populated
SELECT
  r.name,
  r.ta_complexity,
  r.product_focus,
  r.pipeline_exposure,
  (SELECT COUNT(*) FROM role_therapeutic_areas WHERE role_id = r.id) as ta_count,
  (SELECT COUNT(*) FROM role_countries WHERE role_id = r.id) as country_count,
  (SELECT COUNT(*) FROM role_technology_platforms WHERE role_id = r.id) as tech_count
FROM org_roles r
WHERE r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY r.name;
```

---

## 📈 Performance Considerations

### Indexes Created
All junction tables have indexes on:
- Foreign key columns (role_id, master_table_id)
- Composite unique constraints to prevent duplicates

### Query Optimization
```sql
-- ✅ FAST - Using indexes
SELECT r.*, ta.name
FROM org_roles r
JOIN role_therapeutic_areas rta ON rta.role_id = r.id
JOIN therapeutic_areas ta ON ta.id = rta.therapeutic_area_id
WHERE r.slug = 'chief-medical-officer';

-- ❌ SLOW - JSONB scan (old way)
SELECT * FROM org_roles
WHERE therapeutic_areas @> '["ONCO"]'::jsonb;
```

---

## 🔄 Migration Path

### From JSONB to Normalized

If you have existing JSONB data, migration steps:

1. **Run 01_NORMALIZED_SCHEMA_SETUP.sql** - Creates new tables
2. **Extract JSONB data** - Parse existing JSONB fields
3. **Insert into junction tables** - Populate relationships
4. **Verify data integrity** - Check foreign keys resolve
5. **Drop JSONB columns** - Remove old fields
6. **Update application code** - Use JOINs instead of JSONB operators

Example migration query:
```sql
-- Extract TAs from JSONB and insert into junction table
INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, expertise_level)
SELECT
  r.id,
  ta.id,
  'expert'
FROM org_roles r
CROSS JOIN LATERAL jsonb_array_elements_text(r.therapeutic_areas) ta_code
JOIN therapeutic_areas ta ON ta.code = ta_code
WHERE r.therapeutic_areas IS NOT NULL;
```

---

## 🎉 Summary

### What You Get
- ✅ **Fully Normalized Schema** - NO JSONB fields
- ✅ **11 Master Tables** - Industry-standard reference data
- ✅ **26 Junction Tables** - Multi-level relationships (Function/Department/Role)
- ✅ **176+ Master Records** - Pre-populated with common data
- ✅ **9 Roles Seeded** - Medical Affairs roles with complete data
- ✅ **Production Ready** - All errors fixed, tested, and verified

### Key Features
- ✅ Foreign key constraints ensure data integrity
- ✅ Indexes on all junction tables for performance
- ✅ Revenue values in millions (industry standard)
- ✅ Comprehensive verification queries included
- ✅ Idempotent design (safe to re-run)
- ✅ Multi-tenant ready (tenant_id throughout)

---

## 📞 Support

For issues or questions:
1. Check verification queries output
2. Review error messages carefully
3. Ensure database permissions are correct
4. Verify tenant_id and function_id values match your setup

---

**Last Updated:** 2025-11-15
**Version:** 1.0
**Status:** Production Ready ✅
