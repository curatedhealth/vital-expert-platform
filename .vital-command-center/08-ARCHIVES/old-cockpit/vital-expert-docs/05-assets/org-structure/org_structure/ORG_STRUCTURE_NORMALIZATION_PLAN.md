# Org-Structure Schema Normalization Plan
## Zero JSONB - Gold Standard Implementation

**Status**: 🚧 **IN PROGRESS**  
**Target**: Fully Normalized (3NF) Schema with Zero JSONB

---

## Current State Audit

### Issues Identified

| Entity | JSONB Column | Issue | Impact |
|--------|--------------|-------|--------|
| **org_roles** | `geographic_regions` | Cannot index or join on specific regions | Hard to query "All roles in EMEA" |
| **org_roles** | `therapeutic_areas` | Cannot enforce referential integrity | No FK validation for TAs |
| **org_roles** | `reports_to_dotted_line` | Reporting hierarchy opaque to SQL | Cannot generate org charts dynamically |
| **org_roles** | `career_path_from/to` | Career pathing logic buried | Difficult succession planning |
| **org_roles** | `kpi_categories` | Analytics impossible without JSON parsing | No BI tool integration |
| **org_roles** | `internal_stakeholders` | Stakeholder mapping analysis expensive | Network graph queries slow |
| **org_roles** | `external_stakeholders` | Same as above | Same as above |

---

## Target Schema Design

### 1. Master Data Tables (Dimensions)

✅ **geographic_scopes** - Global, Regional, Local  
✅ **geographic_regions** - EMEA, APAC, LATAM, North America  
✅ **seniority_levels** - Executive, Senior, Mid, Junior, Entry  
✅ **stakeholder_types** - KOL, Payer, Regulator, Internal Executive, etc.  
✅ **kpi_definitions** - KPI library with categories  
✅ **relationship_types** - Solid Line, Dotted Line, Functional, etc.  
✅ **transition_types** - Promotion, Lateral, Rotation, etc.  

### 2. Junction Tables (Many-to-Many)

✅ **role_geographic_coverage** - Links roles to regions/countries  
✅ **role_therapeutic_focus** - Links roles to therapeutic areas  
✅ **role_reporting_relationships** - Matrix reporting (dotted lines)  
✅ **role_stakeholder_interactions** - Stakeholder mapping  
✅ **role_success_metrics** - KPI assignments to roles  
✅ **role_career_paths** - Career progression paths  

### 3. Enhanced Tables

✅ **org_roles** - Updated with FK columns, removed JSONB  
✅ **user_role_assignments** - Temporal assignments with effective dating  

---

## Migration Steps

### Phase 1: Create Master Data ✅
- [x] Create all master data tables
- [x] Seed initial master data
- [x] Verify master data integrity

### Phase 2: Create Junction Tables ✅
- [x] Create all junction tables
- [x] Add proper indexes
- [x] Add constraints

### Phase 3: Update org_roles Table
- [ ] Add new FK columns (seniority_level_id, geographic_scope_id)
- [ ] Migrate existing text fields to FK references
- [ ] Add new scalar columns (job_code, grade_level, etc.)

### Phase 4: Data Migration
- [ ] Migrate geographic_regions JSONB → role_geographic_coverage
- [ ] Migrate therapeutic_areas JSONB → role_therapeutic_focus
- [ ] Migrate reports_to_dotted_line JSONB → role_reporting_relationships
- [ ] Migrate stakeholder JSONB → role_stakeholder_interactions
- [ ] Migrate kpi_categories JSONB → role_success_metrics
- [ ] Migrate career_path JSONB → role_career_paths

### Phase 5: Verification
- [ ] Verify all data migrated correctly
- [ ] Run integrity checks
- [ ] Test common queries

### Phase 6: Cleanup
- [ ] Remove JSONB columns from org_roles
- [ ] Update application code
- [ ] Update API endpoints

---

## Benefits of Normalization

### 1. Queryability
**Before**: 
```sql
-- Cannot efficiently query JSONB
SELECT * FROM org_roles 
WHERE geographic_regions @> '["EMEA"]'::jsonb;
```

**After**:
```sql
-- Standard JOIN, fully indexable
SELECT r.* 
FROM org_roles r
INNER JOIN role_geographic_coverage rgc ON r.id = rgc.role_id
INNER JOIN geographic_regions gr ON rgc.region_id = gr.id
WHERE gr.code = 'EMEA';
```

### 2. Data Integrity
- Foreign keys prevent invalid data
- Cannot assign non-existent regions/TAs
- Referential integrity enforced at DB level

### 3. Analytics Ready
- BI tools can directly query tables
- No ETL needed to parse JSON
- Standard SQL for all queries

### 4. Performance
- Indexes on all relationship columns
- JOIN operations optimized by query planner
- No JSON parsing overhead

---

## Example Queries (After Normalization)

### Find all Global roles with dotted-line reporting to Medical Affairs
```sql
SELECT DISTINCT r.*
FROM org_roles r
INNER JOIN role_geographic_coverage rgc ON r.id = rgc.role_id
INNER JOIN geographic_regions gr ON rgc.region_id = gr.id
INNER JOIN role_reporting_relationships rrr ON r.id = rrr.subject_role_id
INNER JOIN org_roles ma_role ON rrr.manager_role_id = ma_role.id
INNER JOIN relationship_types rt ON rrr.relationship_type_id = rt.id
WHERE gr.code = 'GLOBAL'
  AND rt.code = 'DOTTED_LINE'
  AND ma_role.name LIKE '%Medical Affairs%';
```

### Find all roles that interact with KOLs
```sql
SELECT DISTINCT r.*
FROM org_roles r
INNER JOIN role_stakeholder_interactions rsi ON r.id = rsi.role_id
INNER JOIN stakeholder_types st ON rsi.stakeholder_type_id = st.id
WHERE st.code = 'KOL';
```

### Career path analysis
```sql
SELECT 
    from_role.name as from_role,
    to_role.name as to_role,
    tt.name as transition_type,
    rcp.typical_tenure_years_required
FROM role_career_paths rcp
INNER JOIN org_roles from_role ON rcp.from_role_id = from_role.id
INNER JOIN org_roles to_role ON rcp.to_role_id = to_role.id
INNER JOIN transition_types tt ON rcp.transition_type_id = tt.id
WHERE from_role.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';
```

---

## Files

- `normalize_org_structure_zero_jsonb.sql` - Main migration script
- `ORG_STRUCTURE_NORMALIZATION_PLAN.md` - This document

---

## Next Steps

1. Review the migration script
2. Test on a development database
3. Execute Phase 3-4 (data migration)
4. Verify data integrity
5. Remove JSONB columns (Phase 6)
6. Update application code

---

## Notes

- The migration preserves all existing data
- JSONB columns are only removed after verification
- All relationships are properly indexed
- Temporal support added for user role assignments

