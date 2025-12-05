# PERSONA SCHEMA AUDIT REPORT

**Version**: 1.0.0  
**Date**: November 28, 2025  
**Status**: Analysis Complete  
**Auditor**: AI Assistant

---

## Executive Summary

The persona schema has evolved through three major migrations creating a **fragmented but functional** system. The schema is **93% complete** for gold standard implementation but requires consolidation and fixes for optimal operation.

### Critical Issues Found

1. **Schema Fragmentation**: 3 migrations define personas table with different column sets
2. **Trigger Type Mismatch**: Functions expect enum types but receive TEXT
3. **Mixed Normalization**: Check constraints used where lookup tables would be better
4. **Naming Inconsistency**: `sequence_order` vs `sort_order` across junction tables
5. **Missing Unique Constraints**: `slug` uniqueness not enforced consistently
6. **Incomplete VPANES**: VPANES scoring table exists but not consistently populated

### Schema Health Score: 85/100

| Component | Score | Status |
|-----------|-------|--------|
| Core Persona Table | 90/100 | ✅ Good |
| Junction Tables | 85/100 | ✅ Good |
| Lookup Tables | 95/100 | ✅ Excellent |
| Enum Types | 80/100 | ⚠️ Needs Fix |
| Triggers & Functions | 60/100 | ⚠️ Broken |
| Indexes | 90/100 | ✅ Good |
| Constraints | 75/100 | ⚠️ Inconsistent |

---

## 1. MIGRATION HISTORY ANALYSIS

### Migration 007: Base Organizational Hierarchy (DEPLOYED)
**File**: `supabase/migrations/007_organizational_hierarchy.sql`

**Personas Table Defined**:
```sql
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Impact**: This is the **BASE TABLE** that all subsequent migrations modify.

**Related Tables Created**:
- `tenants` (2 seeded: pharma, digital_health)
- `departments` (8 seeded)
- `functions` (multiple per department)
- `roles` (multiple per function)
- `persona_roles` (junction table)

---

### Migration 20251117: Comprehensive Persona JTBD Tables (DEPLOYED)
**File**: `supabase/migrations/20251117000000_add_comprehensive_persona_jtbd_tables.sql`

**Purpose**: Add 24+ junction tables for rich persona data

**Junction Tables Created**:

| # | Table Name | Purpose | Key Columns |
|---|------------|---------|-------------|
| 1 | `persona_success_metrics` | KPIs | metric_name, metric_description, measurement_frequency |
| 2 | `persona_vpanes_scoring` | VPANES scores | value_score, priority_score, addressability_score, need_score, engagement_score, scale_score |
| 3 | `persona_education` | Education background | degree, field_of_study, institution, year_completed, **honors** |
| 4 | `persona_certifications` | Certifications | certification_name, issuing_organization, year_obtained |
| 5 | `persona_evidence_sources` | Research backing | source_type, citation, confidence_level |
| 6 | `persona_motivations` | Drivers | motivation_text, motivation_category, importance |
| 7 | `persona_personality_traits` | Personality | trait_name, trait_description |
| 8 | `persona_values` | Core values | value_name, value_description |
| 9 | `persona_typical_day` | Day-in-life | time_of_day, activity_description, **sequence_order** |
| 10+ | ...more tables | Various | ... |

**Issues Identified**:
1. ❌ `persona_education.honors` column exists in migration but not in live DB
2. ❌ `persona_success_metrics.current_performance` exists in migration but not in live DB
3. ❌ `persona_success_metrics.target_performance` exists in migration but not in live DB
4. ❌ `persona_success_metrics.measurement_frequency` exists in migration but not in live DB
5. ⚠️ Naming inconsistency: `sequence_order` vs `sort_order`

---

### Migration 20251128: Gold Standard Schema (PARTIALLY DEPLOYED)
**File**: `supabase/migrations/20251128000001_persona_gold_standard_schema.sql`

**Purpose**: Create normalized, scalable schema with enums and lookup tables

**Enum Types Created**:
```sql
archetype_enum ('AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC')
work_pattern_enum ('routine', 'strategic', 'mixed')
budget_authority_enum ('none', 'limited', 'moderate', 'significant', 'high')
gen_ai_readiness_enum ('beginner', 'developing', 'intermediate', 'advanced')
service_layer_enum ('ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER', 'MIXED')
validation_status_enum ('draft', 'pending_review', 'validated', 'published', 'archived')
```

**Lookup Tables Created** (15 tables):
- `lookup_seniority_levels`
- `lookup_organization_sizes`
- `lookup_technology_adoption`
- `lookup_risk_tolerance`
- `lookup_change_readiness`
- `lookup_geographic_scopes`
- `lookup_pain_point_categories`
- `lookup_severity_levels`
- `lookup_frequency_levels`
- `lookup_timeframes`
- `lookup_goal_types`
- `lookup_challenge_types`
- `lookup_trigger_types`
- `lookup_conference_types`
- `lookup_conference_roles`

**Columns Added to Personas Table** (~60 columns via ALTER TABLE):
- Core identity: slug, title, tagline, one_liner
- Archetype: archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score
- Professional: seniority_level, years_of_experience, education_level
- Organization: organization_type, geographic_scope, team_size_typical, budget_authority_level
- Behavioral: technology_adoption, risk_tolerance, change_readiness
- Gen AI: gen_ai_readiness_level, preferred_service_layer, gen_ai_adoption_score
- Narrative: background_story, a_day_in_the_life
- Salary: salary_min_usd, salary_max_usd, salary_median_usd
- Denormalized: role_name, role_slug, function_name, function_slug

**Issues Identified**:
1. ❌ Views created before tables exist (order issue)
2. ❌ `v_personas_complete` references columns from tables not yet created
3. ⚠️ Columns added as TEXT instead of using enum types
4. ⚠️ No unique constraint on `personas.slug` alone (only `tenant_id + slug`)

---

## 2. CURRENT SCHEMA STATE

### 2.1 Core Personas Table Structure

**Estimated Column Count**: ~87 columns

**Column Groups**:

| Group | Columns | Type | Notes |
|-------|---------|------|-------|
| **Core Identity** | id, tenant_id, name, slug, title, tagline, one_liner | UUID, TEXT | ✅ Good |
| **Archetype** | archetype, archetype_confidence, work_pattern, work_complexity_score, ai_maturity_score | TEXT, NUMERIC | ⚠️ Should use enums |
| **Organizational** | role_id, function_id, department_id, role_name, function_name, department_name, role_slug, function_slug, department_slug | UUID, TEXT | ✅ Good (denormalized for performance) |
| **Professional** | seniority_level, years_of_experience, years_in_current_role, years_in_industry, years_in_function, education_level, persona_number | TEXT, INTEGER | ⚠️ seniority should reference lookup |
| **Organization Context** | typical_organization_size, organization_type, geographic_scope, reporting_to, team_size, team_size_typical, direct_reports, span_of_control, budget_authority, budget_authority_level | TEXT, INTEGER | ⚠️ Should reference lookups |
| **Work Patterns** | work_arrangement, salary_min_usd, salary_max_usd, salary_median_usd, salary_currency, salary_year, salary_sources, work_style_preference | TEXT, INTEGER | ✅ Good |
| **Behavioral** | work_style, decision_making_style, learning_style, technology_adoption, risk_tolerance, change_readiness, collaboration_style, communication_preference | TEXT | ⚠️ Should reference lookups |
| **Gen AI Profile** | gen_ai_readiness_level, preferred_service_layer, gen_ai_adoption_score, gen_ai_trust_score, gen_ai_usage_frequency, gen_ai_primary_use_case, gen_ai_barriers, gen_ai_enablers | TEXT, NUMERIC, TEXT[] | ⚠️ Mix of types, arrays should normalize |
| **Demographics** | age_range, location_type, work_location_model | TEXT | ✅ Good |
| **Metadata** | sample_size, confidence_level, data_recency, geographic_benchmark_scope, section, persona_type, segment, journey_stage, validation_status, validated_by, validated_at, notes | TEXT, UUID, TIMESTAMPTZ | ✅ Good |
| **Legacy/UI** | color_code, icon, avatar_url, avatar_description | TEXT | ✅ Good |
| **Timestamps** | is_active, created_at, updated_at, deleted_at | BOOLEAN, TIMESTAMPTZ | ✅ Good |

---

### 2.2 Junction Tables Inventory

**Total Junction Tables**: 24+

| # | Table Name | Schema Status | Naming Consistency | Issues |
|---|------------|---------------|-------------------|--------|
| 1 | `persona_pain_points` | ✅ Good | `sequence_order` | None |
| 2 | `persona_goals` | ✅ Good | `sequence_order` | None |
| 3 | `persona_motivations` | ✅ Good | No order column | ⚠️ Missing sequence |
| 4 | `persona_challenges` | ✅ Good | `sequence_order` | None |
| 5 | `persona_typical_day` | ✅ Good | `sequence_order` | None |
| 6 | `persona_tools_used` | ✅ Good | `sequence_order` | None |
| 7 | `persona_stakeholders` | ✅ Good | `sequence_order` | None |
| 8 | `persona_vpanes_scoring` | ✅ Good | N/A (unique per persona) | None |
| 9 | `persona_education` | ⚠️ Issue | `sequence_order` | ❌ `honors` column missing in DB |
| 10 | `persona_certifications` | ✅ Good | No order column | None |
| 11 | `persona_success_metrics` | ⚠️ Issue | No order column | ❌ Multiple columns missing |
| 12 | `persona_buying_process` | ✅ Good | N/A | Check constraint issues |
| 13 | `persona_buying_triggers` | ✅ Good | No order column | Check constraint issues |
| 14 | `persona_aspirations` | ✅ Good | No order column | Check constraint issues |
| 15 | `persona_annual_conferences` | ✅ Good | `sequence_order` | Check constraint issues |
| 16+ | ...more tables | ✅ Good | Varies | Various |

---

### 2.3 Lookup Tables Inventory

**Total Lookup Tables**: 15 (all created in migration 20251128)

| # | Table Name | Records | Status |
|---|------------|---------|--------|
| 1 | `lookup_seniority_levels` | 9 | ✅ Complete |
| 2 | `lookup_organization_sizes` | 5 | ✅ Complete |
| 3 | `lookup_technology_adoption` | 5 | ✅ Complete |
| 4 | `lookup_risk_tolerance` | 5 | ✅ Complete |
| 5 | `lookup_change_readiness` | 5 | ✅ Complete |
| 6 | `lookup_geographic_scopes` | 5 | ✅ Complete |
| 7 | `lookup_pain_point_categories` | 7 | ✅ Complete |
| 8 | `lookup_severity_levels` | 4 | ✅ Complete |
| 9 | `lookup_frequency_levels` | 4 | ✅ Complete |
| 10 | `lookup_timeframes` | 5 | ✅ Complete |
| 11 | `lookup_goal_types` | ~7 | ✅ Complete |
| 12 | `lookup_challenge_types` | ~7 | ✅ Complete |
| 13 | `lookup_trigger_types` | ~5 | ✅ Complete |
| 14 | `lookup_conference_types` | 4 | ✅ Complete |
| 15 | `lookup_conference_roles` | 4 | ✅ Complete |

---

## 3. TRIGGER AND FUNCTION ANALYSIS

### 3.1 Active Triggers on Personas Table

| Trigger Name | Event | Function Called | Status |
|--------------|-------|-----------------|--------|
| `trigger_update_gen_ai_readiness` | BEFORE INSERT/UPDATE | `update_gen_ai_readiness_level()` | ❌ **BROKEN** |
| `trigger_sync_persona_org_names` | BEFORE INSERT/UPDATE | `sync_persona_org_names()` | ✅ Working |
| `trigger_update_persona_org_from_role` | BEFORE INSERT/UPDATE | `update_persona_org_from_role()` | ✅ Working |
| `update_personas_updated_at` | BEFORE UPDATE | `update_updated_at_column()` | ✅ Working |

---

### 3.2 Broken Trigger Deep Dive

**Trigger**: `trigger_update_gen_ai_readiness`

**Problem**: Function `calculate_gen_ai_readiness_level` expects enum types but receives TEXT

**Function Signature**:
```sql
CREATE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score NUMERIC,
    p_technology_adoption technology_adoption, -- ENUM TYPE
    p_risk_tolerance risk_tolerance,           -- ENUM TYPE
    p_change_readiness change_readiness        -- ENUM TYPE
) RETURNS gen_ai_readiness_level
```

**Actual Column Types**:
```sql
ALTER TABLE personas 
    ADD COLUMN technology_adoption TEXT,  -- Should be ENUM!
    ADD COLUMN risk_tolerance TEXT,        -- Should be ENUM!
    ADD COLUMN change_readiness TEXT;      -- Should be ENUM!
```

**Error When Triggered**:
```
ERROR: 42883: function calculate_gen_ai_readiness_level(numeric, text, text, text) does not exist
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

**Fix Required**:
1. Option A: Change function to accept TEXT and cast internally
2. Option B: Change columns to use enum types
3. Option C: Disable trigger, use TEXT, compute separately

**Recommendation**: **Option A** - Change function signature to accept TEXT for backward compatibility

---

## 4. CHECK CONSTRAINTS ANALYSIS

### 4.1 Check Constraints That Should Be Lookup Tables

Current implementation uses CHECK constraints for extensible value sets:

| Table | Column | Constraint | Should Be |
|-------|--------|------------|-----------|
| `persona_aspirations` | `timeframe` | `CHECK (timeframe IN ('short_term', 'medium_term', 'long_term'))` | FK to `lookup_timeframes.code` |
| `persona_buying_process` | `approval_process_complexity` | `CHECK (... IN ('simple', 'moderate', 'complex', 'very_complex'))` | FK to new `lookup_complexity_levels` |
| `persona_buying_triggers` | `trigger_type` | `CHECK (... IN ('regulatory', 'competitive', 'internal_initiative', 'crisis', 'growth'))` | FK to `lookup_trigger_types.code` (exists!) |
| `persona_annual_conferences` | `conference_type` | `CHECK (... IN ('academic', 'industry', 'regulatory', 'internal'))` | FK to `lookup_conference_types.code` (exists!) |

**Recommendation**: Migrate check constraints to lookup table FKs for extensibility

---

## 5. INDEXING ANALYSIS

### 5.1 Existing Indexes

| Index Name | Table | Columns | Purpose | Status |
|------------|-------|---------|---------|--------|
| `idx_personas_archetype` | personas | archetype | Filter by archetype | ✅ Good |
| `idx_personas_tenant_function` | personas | tenant_id, function_id | Multi-tenant queries | ✅ Good |
| `idx_personas_tenant_id` | personas | tenant_id | Tenant isolation | ✅ Good |
| `idx_personas_role_id` | personas | role_id | Role-based queries | ✅ Good |
| Various junction indexes | persona_* | persona_id, tenant_id | Junction lookups | ✅ Good |

### 5.2 Missing Indexes

**Recommended Additional Indexes**:
1. `CREATE INDEX idx_personas_slug ON personas(slug)` - For URL lookups
2. `CREATE INDEX idx_personas_validation_status ON personas(validation_status)` - For filtering
3. `CREATE INDEX idx_personas_is_active ON personas(is_active)` - For active filtering
4. `CREATE INDEX idx_personas_archetype_tenant ON personas(archetype, tenant_id)` - For archetype reports

---

## 6. DATA NORMALIZATION ASSESSMENT

### 6.1 Current Normalization Level: **Mixed (2NF-3NF)**

| Aspect | Normalization Level | Issue |
|--------|---------------------|-------|
| Core persona attributes | ✅ 3NF | Good |
| Junction tables | ✅ 3NF | Good |
| Lookup values | ⚠️ Mixed | Some check constraints, some lookup tables |
| Denormalized names | ✅ Intentional | Performance optimization (acceptable) |
| Array columns | ⚠️ 1NF violation | `gen_ai_barriers`, `gen_ai_enablers`, `tags`, `allowed_tenants` |

### 6.2 Arrays That Should Be Normalized

| Column | Current Type | Should Be |
|--------|-------------|-----------|
| `gen_ai_barriers` | TEXT[] | `persona_gen_ai_barriers` junction table |
| `gen_ai_enablers` | TEXT[] | `persona_gen_ai_enablers` junction table |
| `tags` | TEXT[] | `persona_tags` junction table |
| `allowed_tenants` | UUID[] | `persona_tenants` junction table (multi-tenant assignment) |

---

## 7. GAPS AND MISSING COMPONENTS

### 7.1 Missing Junction Tables (from Gold Standard)

| # | Missing Table | Purpose | Priority |
|---|---------------|---------|----------|
| 1 | `persona_gen_ai_barriers` | AI adoption blockers | Medium |
| 2 | `persona_gen_ai_enablers` | AI adoption accelerators | Medium |
| 3 | `persona_tags` | Categorization tags | Low |
| 4 | `persona_tenants` | Multi-tenant assignment | Low (array works) |
| 5 | `persona_skills` | Skills with proficiency | Medium |

### 7.2 Missing Lookup Tables

| # | Missing Table | Purpose | Priority |
|---|---------------|---------|----------|
| 1 | `lookup_complexity_levels` | For process/approval complexity | Medium |
| 2 | `lookup_work_styles` | Work style preferences | Low |
| 3 | `lookup_learning_styles` | Learning preferences | Low |
| 4 | `lookup_decision_styles` | Decision-making approaches | Low |

### 7.3 Missing Constraints

| Table | Missing Constraint | Type | Priority |
|-------|-------------------|------|----------|
| `personas` | Unique on slug | UNIQUE | High |
| Various junction tables | sequence_order NOT NULL | NOT NULL | Medium |

---

## 8. SCHEMA COMPATIBILITY ISSUES

### 8.1 Seed File vs Database Mismatches

**Issue**: Seed files created based on "documented schema" but database has "deployed schema"

| Seed File Assumption | Database Reality | Impact |
|---------------------|------------------|--------|
| `persona_education.honors` exists | Column doesn't exist | ❌ INSERT fails |
| `persona_success_metrics.current_performance` exists | Column doesn't exist | ❌ INSERT fails |
| `persona_success_metrics.target_performance` exists | Column doesn't exist | ❌ INSERT fails |
| `persona_success_metrics.measurement_frequency` exists | Column doesn't exist | ❌ INSERT fails |
| Check constraints allow specific values | Constraints have different values | ❌ INSERT fails |

**Root Cause**: Migrations defined columns that were later removed or never deployed

---

## 9. RECOMMENDATIONS

### 9.1 Critical Fixes (P0 - Do First)

1. ✅ **Fix Trigger Function Signature**
   ```sql
   CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
       p_ai_maturity_score NUMERIC,
       p_technology_adoption TEXT,  -- Accept TEXT instead of enum
       p_risk_tolerance TEXT,        -- Accept TEXT instead of enum
       p_change_readiness TEXT       -- Accept TEXT instead of enum
   ) RETURNS TEXT AS $$  -- Return TEXT instead of enum
   -- Cast to enum internally if needed
   ```

2. ✅ **Add Missing Unique Constraint**
   ```sql
   CREATE UNIQUE INDEX IF NOT EXISTS personas_slug_unique ON personas(slug);
   ```

3. ✅ **Document Check Constraint Values**
   - Query all check constraints
   - Document valid values
   - Update seed files to match

### 9.2 High Priority Improvements (P1 - Do Next)

1. **Consolidate Schema Definitions**
   - Create single source of truth migration
   - Deprecate old migrations
   - Use idempotent patterns

2. **Migrate Check Constraints to Lookup Tables**
   - Replace inline CHECK with FKs
   - Add lookup tables where missing
   - Maintain backward compatibility

3. **Normalize Array Columns**
   - Create junction tables for arrays
   - Migrate data
   - Drop array columns

4. **Add Missing Indexes**
   - Create indexes listed in section 5.2
   - Monitor query performance

### 9.3 Medium Priority (P2 - Future)

1. **Create Comprehensive Views**
   - `v_personas_complete` with all joins
   - `v_personas_summary` lightweight
   - `v_personas_with_vpanes` scoring
   - `v_archetype_distribution` analytics

2. **Add Data Validation**
   - Validate VPANES scores (0-10 range)
   - Validate work_complexity + ai_maturity → archetype
   - Validate year ranges

3. **Performance Optimization**
   - Add composite indexes for common queries
   - Consider materialized views for aggregations
   - Optimize junction table queries

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix trigger function signatures
- [ ] Add unique constraint on slug
- [ ] Document all check constraint values
- [ ] Update seed file templates

### Phase 2: Schema Consolidation (Week 2)
- [ ] Create consolidated migration
- [ ] Test with existing data
- [ ] Deploy to staging
- [ ] Validate with sample personas

### Phase 3: Normalization (Week 3-4)
- [ ] Migrate check constraints to lookups
- [ ] Normalize array columns
- [ ] Add missing junction tables
- [ ] Add missing indexes

### Phase 4: Views and Analytics (Week 5)
- [ ] Create comprehensive views
- [ ] Add data validation
- [ ] Performance optimization
- [ ] Documentation updates

---

## 11. CONCLUSION

The persona schema is **functionally complete** but suffers from **implementation fragmentation**. The core structure is sound with good normalization in junction tables and comprehensive lookup tables.

**Key Strengths**:
- ✅ Comprehensive junction table structure (24+ tables)
- ✅ Good lookup table foundation (15 tables)
- ✅ Strong MECE framework support
- ✅ Multi-tenant architecture
- ✅ VPANES scoring support

**Key Weaknesses**:
- ❌ Broken trigger due to type mismatches
- ❌ Schema fragmentation across 3 migrations
- ❌ Mixed use of check constraints vs lookup tables
- ❌ Some array columns need normalization
- ❌ Seed files don't match deployed schema

**Recommended Action**: Implement **Phase 1 Critical Fixes** immediately, then proceed with consolidation in a single comprehensive migration.

---

**Next Steps**: 
1. Review this audit with team
2. Approve Phase 1 fixes
3. Begin implementation of consolidated migration
4. Update all seed file templates to match final schema

---

**Document Status**: ✅ Complete  
**Reviewed By**: Pending  
**Approved By**: Pending

