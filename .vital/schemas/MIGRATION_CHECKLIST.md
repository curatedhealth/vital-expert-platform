# Pharmaceutical Role Enrichment - Migration Execution Checklist

**Migration Version**: 2.0.0
**Target Date**: TBD
**Estimated Duration**: 2-4 hours (includes testing)
**Risk Level**: Medium (due to data migration in Phase 4)

---

## Pre-Migration Checklist

### Environment Preparation

- [ ] **Backup Production Database**
  - [ ] Full database backup created
  - [ ] Backup verified and can be restored
  - [ ] Backup stored in secure location
  - [ ] Backup retention policy confirmed

- [ ] **Development Environment Ready**
  - [ ] Local database matches production schema
  - [ ] Test data loaded
  - [ ] Migration files copied to local environment
  - [ ] Database connection strings verified

- [ ] **Staging Environment Ready**
  - [ ] Staging database matches production schema
  - [ ] Staging data is recent copy of production
  - [ ] Migration files deployed to staging
  - [ ] Access credentials verified

### Documentation Review

- [ ] **Schema Documentation Read**
  - [ ] `PHARMA_ROLE_ENRICHMENT_SCHEMA_MAPPING.md` reviewed
  - [ ] `SCHEMA_DIAGRAM.md` reviewed
  - [ ] `QUICK_REFERENCE.md` reviewed
  - [ ] `org_roles.json` specification reviewed

- [ ] **Migration Files Ready**
  - [ ] `20251122000001_pharma_roles_reference_tables.sql` - Phase 1
  - [ ] `20251122000002_pharma_roles_junction_tables.sql` - Phase 2
  - [ ] `20251122000003_pharma_roles_extend_org_roles.sql` - Phase 3
  - [ ] `20251122000004_pharma_roles_migrate_array_data.sql` - Phase 4
  - [ ] `20251122000005_pharma_roles_seed_core_data.sql` - Phase 5

- [ ] **Rollback Files Ready**
  - [ ] `20251122000001_pharma_roles_reference_tables.rollback.sql`
  - [ ] `20251122000002_pharma_roles_junction_tables.rollback.sql`
  - [ ] `20251122000003_pharma_roles_extend_org_roles.rollback.sql`
  - [ ] `20251122000004_pharma_roles_migrate_array_data.rollback.sql`
  - [ ] `20251122000005_pharma_roles_seed_core_data.rollback.sql`

### Stakeholder Alignment

- [ ] **Business Approval**
  - [ ] Schema changes approved by product team
  - [ ] Pharma-specific requirements validated by SMEs
  - [ ] Timeline approved by stakeholders
  - [ ] Communication plan in place

- [ ] **Technical Review**
  - [ ] Database team reviewed migration files
  - [ ] Backend team reviewed API impacts
  - [ ] Frontend team reviewed UI impacts
  - [ ] DevOps team ready for deployment

### Data Preparation

- [ ] **Seed Data Collected**
  - [ ] Skills data prepared (~200 records)
  - [ ] Certifications data prepared (~50 records)
  - [ ] Competencies data prepared (~30 records)
  - [ ] KPIs data prepared (~50 records)
  - [ ] Therapeutic areas data prepared (~30 records)
  - [ ] Other reference data prepared
  - [ ] All seed data validated

- [ ] **Array Data Analyzed**
  - [ ] Current `required_skills` data examined
  - [ ] Current `required_certifications` data examined
  - [ ] Data mapping strategy confirmed
  - [ ] Edge cases identified and handled

---

## Phase 1: Core Reference Tables

**Migration File**: `20251122000001_pharma_roles_reference_tables.sql`
**Estimated Time**: 5 minutes
**Risk Level**: Low

### Execution Steps

- [ ] **Run Migration**
  ```bash
  psql -h localhost -d vital -f 20251122000001_pharma_roles_reference_tables.sql
  ```

- [ ] **Verify Table Creation**
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'skills', 'certifications', 'competencies', 'kpis',
      'training_programs', 'regulatory_requirements',
      'systems', 'deliverables', 'therapeutic_areas',
      'stakeholder_types', 'career_paths'
    );
  ```
  Expected: 11 tables

- [ ] **Verify Indexes Created**
  ```sql
  SELECT tablename, indexname
  FROM pg_indexes
  WHERE tablename IN (
    'skills', 'certifications', 'competencies', 'kpis',
    'training_programs', 'regulatory_requirements',
    'systems', 'deliverables', 'therapeutic_areas',
    'stakeholder_types', 'career_paths'
  )
  ORDER BY tablename, indexname;
  ```
  Expected: ~30+ indexes

- [ ] **Verify Triggers Created**
  ```sql
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE event_object_table IN (
    'skills', 'certifications', 'competencies', 'kpis',
    'training_programs', 'regulatory_requirements',
    'systems', 'deliverables', 'therapeutic_areas',
    'stakeholder_types', 'career_paths'
  );
  ```
  Expected: 11 triggers (update_updated_at)

- [ ] **Verify RLS Policies**
  ```sql
  SELECT tablename, policyname
  FROM pg_policies
  WHERE tablename IN (
    'skills', 'certifications', 'competencies', 'kpis',
    'training_programs', 'regulatory_requirements',
    'systems', 'deliverables', 'therapeutic_areas',
    'stakeholder_types', 'career_paths'
  );
  ```
  Expected: 11+ policies

### Rollback (if needed)

- [ ] **Execute Rollback**
  ```bash
  psql -h localhost -d vital -f 20251122000001_pharma_roles_reference_tables.rollback.sql
  ```

- [ ] **Verify Tables Dropped**
  ```sql
  SELECT count(*)
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'skills', 'certifications', 'competencies', 'kpis',
      'training_programs', 'regulatory_requirements',
      'systems', 'deliverables', 'therapeutic_areas',
      'stakeholder_types', 'career_paths'
    );
  ```
  Expected: 0

---

## Phase 2: Junction Tables

**Migration File**: `20251122000002_pharma_roles_junction_tables.sql`
**Estimated Time**: 5 minutes
**Risk Level**: Low

### Execution Steps

- [ ] **Run Migration**
  ```bash
  psql -h localhost -d vital -f 20251122000002_pharma_roles_junction_tables.sql
  ```

- [ ] **Verify Junction Tables Created**
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'role_skills', 'role_certifications', 'role_competencies',
      'role_kpis', 'role_training_programs',
      'role_regulatory_requirements', 'role_systems',
      'role_deliverables', 'role_therapeutic_areas',
      'role_stakeholder_interactions', 'role_career_paths'
    );
  ```
  Expected: 11 tables

- [ ] **Verify Foreign Keys**
  ```sql
  SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name LIKE 'role_%'
    AND tc.table_name IN (
      'role_skills', 'role_certifications', 'role_competencies',
      'role_kpis', 'role_training_programs',
      'role_regulatory_requirements', 'role_systems',
      'role_deliverables', 'role_therapeutic_areas',
      'role_stakeholder_interactions', 'role_career_paths'
    );
  ```
  Expected: 22+ foreign keys (2 per junction table minimum)

- [ ] **Verify Unique Constraints**
  ```sql
  SELECT
    tc.table_name,
    tc.constraint_name
  FROM information_schema.table_constraints AS tc
  WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_name LIKE 'role_%'
    AND tc.table_name IN (
      'role_skills', 'role_certifications', 'role_competencies',
      'role_kpis', 'role_training_programs',
      'role_regulatory_requirements', 'role_systems',
      'role_deliverables', 'role_therapeutic_areas',
      'role_stakeholder_interactions', 'role_career_paths'
    );
  ```
  Expected: 11 unique constraints

- [ ] **Verify Indexes on FK Columns**
  ```sql
  SELECT tablename, indexname
  FROM pg_indexes
  WHERE tablename LIKE 'role_%'
    AND tablename IN (
      'role_skills', 'role_certifications', 'role_competencies',
      'role_kpis', 'role_training_programs',
      'role_regulatory_requirements', 'role_systems',
      'role_deliverables', 'role_therapeutic_areas',
      'role_stakeholder_interactions', 'role_career_paths'
    )
  ORDER BY tablename, indexname;
  ```
  Expected: 22+ indexes (at least 2 per table: role_id and reference_id)

### Rollback (if needed)

- [ ] **Execute Rollback**
  ```bash
  psql -h localhost -d vital -f 20251122000002_pharma_roles_junction_tables.rollback.sql
  ```

- [ ] **Verify Tables Dropped**
  ```sql
  SELECT count(*)
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE 'role_%'
    AND table_name IN (
      'role_skills', 'role_certifications', 'role_competencies',
      'role_kpis', 'role_training_programs',
      'role_regulatory_requirements', 'role_systems',
      'role_deliverables', 'role_therapeutic_areas',
      'role_stakeholder_interactions', 'role_career_paths'
    );
  ```
  Expected: 0

---

## Phase 3: Extend org_roles

**Migration File**: `20251122000003_pharma_roles_extend_org_roles.sql`
**Estimated Time**: 2 minutes
**Risk Level**: Low

### Execution Steps

- [ ] **Run Migration**
  ```bash
  psql -h localhost -d vital -f 20251122000003_pharma_roles_extend_org_roles.sql
  ```

- [ ] **Verify New Columns Added**
  ```sql
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'org_roles'
    AND column_name IN (
      'role_type', 'regulatory_oversight', 'gxp_critical',
      'patient_facing', 'safety_critical', 'travel_requirement_pct',
      'remote_eligible', 'oncall_required', 'salary_band_min',
      'salary_band_max', 'salary_currency', 'job_family',
      'career_level', 'succession_planning_priority', 'metadata'
    )
  ORDER BY ordinal_position;
  ```
  Expected: 15 columns

- [ ] **Verify Check Constraints**
  ```sql
  SELECT
    tc.constraint_name,
    cc.check_clause
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.check_constraints AS cc
    ON tc.constraint_name = cc.constraint_name
  WHERE tc.table_name = 'org_roles'
    AND tc.constraint_name LIKE 'org_roles_%';
  ```
  Expected: Include new constraints for role_type, travel_requirement_pct, etc.

- [ ] **Verify Indexes on New Columns**
  ```sql
  SELECT indexname
  FROM pg_indexes
  WHERE tablename = 'org_roles'
    AND indexname LIKE '%role_type%'
       OR indexname LIKE '%gxp%'
       OR indexname LIKE '%regulatory%';
  ```
  Expected: 3 new indexes

- [ ] **Test Insert with New Columns**
  ```sql
  INSERT INTO org_roles (
    unique_id, role_name, role_type,
    gxp_critical, regulatory_oversight
  ) VALUES (
    'TEST-001', 'Test Role', 'Clinical',
    true, true
  ) RETURNING id;
  ```
  Expected: Success with UUID returned

- [ ] **Cleanup Test Data**
  ```sql
  DELETE FROM org_roles WHERE unique_id = 'TEST-001';
  ```

### Rollback (if needed)

- [ ] **Execute Rollback**
  ```bash
  psql -h localhost -d vital -f 20251122000003_pharma_roles_extend_org_roles.rollback.sql
  ```

- [ ] **Verify Columns Dropped**
  ```sql
  SELECT count(*)
  FROM information_schema.columns
  WHERE table_name = 'org_roles'
    AND column_name IN (
      'role_type', 'regulatory_oversight', 'gxp_critical',
      'patient_facing', 'safety_critical', 'travel_requirement_pct',
      'remote_eligible', 'oncall_required', 'salary_band_min',
      'salary_band_max', 'salary_currency', 'job_family',
      'career_level', 'succession_planning_priority', 'metadata'
    );
  ```
  Expected: 0

---

## Phase 4: Data Migration (CRITICAL)

**Migration File**: `20251122000004_pharma_roles_migrate_array_data.sql`
**Estimated Time**: 10-30 minutes (depends on data volume)
**Risk Level**: Medium (data transformation)

### Pre-Migration Data Snapshot

- [ ] **Count Roles with Skills**
  ```sql
  SELECT count(*) FROM org_roles WHERE required_skills IS NOT NULL AND array_length(required_skills, 1) > 0;
  ```
  Record count: _________

- [ ] **Count Roles with Certifications**
  ```sql
  SELECT count(*) FROM org_roles WHERE required_certifications IS NOT NULL AND array_length(required_certifications, 1) > 0;
  ```
  Record count: _________

- [ ] **Sample Data Review**
  ```sql
  SELECT id, role_name, required_skills, required_certifications
  FROM org_roles
  WHERE (required_skills IS NOT NULL AND array_length(required_skills, 1) > 0)
     OR (required_certifications IS NOT NULL AND array_length(required_certifications, 1) > 0)
  LIMIT 10;
  ```
  Review output and confirm data looks correct

- [ ] **Create Backup of org_roles**
  ```sql
  CREATE TABLE org_roles_backup_20251122 AS SELECT * FROM org_roles;
  ```

### Execution Steps

- [ ] **Run Migration**
  ```bash
  psql -h localhost -d vital -f 20251122000004_pharma_roles_migrate_array_data.sql
  ```

- [ ] **Verify Skills Migration**
  ```sql
  SELECT count(*) FROM role_skills;
  ```
  Expected: Should match total number of skills across all roles

  ```sql
  SELECT
    r.role_name,
    count(rs.id) as skill_count,
    array_length(r.required_skills_deprecated, 1) as original_count
  FROM org_roles r
  LEFT JOIN role_skills rs ON r.id = rs.role_id
  WHERE r.required_skills_deprecated IS NOT NULL
  GROUP BY r.id, r.role_name, r.required_skills_deprecated
  HAVING count(rs.id) != array_length(r.required_skills_deprecated, 1);
  ```
  Expected: 0 rows (all skills migrated)

- [ ] **Verify Certifications Migration**
  ```sql
  SELECT count(*) FROM role_certifications;
  ```
  Expected: Should match total number of certifications across all roles

  ```sql
  SELECT
    r.role_name,
    count(rc.id) as cert_count,
    array_length(r.required_certifications_deprecated, 1) as original_count
  FROM org_roles r
  LEFT JOIN role_certifications rc ON r.id = rc.role_id
  WHERE r.required_certifications_deprecated IS NOT NULL
  GROUP BY r.id, r.role_name, r.required_certifications_deprecated
  HAVING count(rc.id) != array_length(r.required_certifications_deprecated, 1);
  ```
  Expected: 0 rows (all certifications migrated)

- [ ] **Verify Deprecated Columns Renamed**
  ```sql
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'org_roles'
    AND (column_name = 'required_skills_deprecated'
         OR column_name = 'required_certifications_deprecated');
  ```
  Expected: 2 columns (renamed with _deprecated suffix)

- [ ] **Spot Check Data Quality**
  ```sql
  SELECT
    r.role_name,
    s.name as skill_name,
    rs.required_proficiency,
    rs.is_required
  FROM org_roles r
  JOIN role_skills rs ON r.id = rs.role_id
  JOIN skills s ON rs.skill_id = s.id
  LIMIT 20;
  ```
  Review: Skills look correct and properly linked

- [ ] **Check for Orphaned Data**
  ```sql
  SELECT count(*) FROM role_skills WHERE role_id NOT IN (SELECT id FROM org_roles);
  ```
  Expected: 0

  ```sql
  SELECT count(*) FROM role_certifications WHERE role_id NOT IN (SELECT id FROM org_roles);
  ```
  Expected: 0

### Rollback (if needed)

- [ ] **Execute Rollback**
  ```bash
  psql -h localhost -d vital -f 20251122000004_pharma_roles_migrate_array_data.rollback.sql
  ```

- [ ] **Verify Data Restored**
  ```sql
  SELECT column_name
  FROM information_schema.columns
  WHERE table_name = 'org_roles'
    AND (column_name = 'required_skills'
         OR column_name = 'required_certifications');
  ```
  Expected: 2 columns (original names restored)

- [ ] **Verify Junction Data Cleared**
  ```sql
  SELECT count(*) FROM role_skills;
  SELECT count(*) FROM role_certifications;
  ```
  Expected: 0 for both (or minimal if seed data was loaded)

---

## Phase 5: Seed Core Data

**Migration File**: `20251122000005_pharma_roles_seed_core_data.sql`
**Estimated Time**: 10-15 minutes
**Risk Level**: Low

### Execution Steps

- [ ] **Run Migration**
  ```bash
  psql -h localhost -d vital -f 20251122000005_pharma_roles_seed_core_data.sql
  ```

- [ ] **Verify Seed Data Counts**
  ```sql
  SELECT 'skills' as table_name, count(*) as row_count FROM skills
  UNION ALL
  SELECT 'certifications', count(*) FROM certifications
  UNION ALL
  SELECT 'competencies', count(*) FROM competencies
  UNION ALL
  SELECT 'kpis', count(*) FROM kpis
  UNION ALL
  SELECT 'training_programs', count(*) FROM training_programs
  UNION ALL
  SELECT 'regulatory_requirements', count(*) FROM regulatory_requirements
  UNION ALL
  SELECT 'systems', count(*) FROM systems
  UNION ALL
  SELECT 'deliverables', count(*) FROM deliverables
  UNION ALL
  SELECT 'therapeutic_areas', count(*) FROM therapeutic_areas
  UNION ALL
  SELECT 'stakeholder_types', count(*) FROM stakeholder_types
  UNION ALL
  SELECT 'career_paths', count(*) FROM career_paths;
  ```
  Expected: See counts matching seed data specifications

- [ ] **Verify Pharma-Specific Data**
  ```sql
  SELECT name, is_pharma_specific FROM skills WHERE is_pharma_specific = true LIMIT 10;
  SELECT name, is_gxp_training FROM training_programs WHERE is_gxp_training = true LIMIT 10;
  SELECT name, regulatory_body FROM regulatory_requirements LIMIT 10;
  ```
  Review: Data looks pharma-specific and accurate

- [ ] **Verify Full-Text Search**
  ```sql
  SELECT name FROM skills WHERE search_vector @@ to_tsquery('clinical & trial') LIMIT 5;
  ```
  Expected: Returns relevant skills

### Rollback (if needed)

- [ ] **Execute Rollback**
  ```bash
  psql -h localhost -d vital -f 20251122000005_pharma_roles_seed_core_data.rollback.sql
  ```

- [ ] **Verify Seed Data Removed**
  ```sql
  SELECT 'skills' as table_name, count(*) as row_count FROM skills
  UNION ALL
  SELECT 'certifications', count(*) FROM certifications;
  -- etc.
  ```
  Expected: 0 for all tables (or minimal if other data was added)

---

## Post-Migration Validation

### Data Integrity Checks

- [ ] **Foreign Key Integrity**
  ```sql
  SELECT
    tc.table_name,
    tc.constraint_name
  FROM information_schema.table_constraints AS tc
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name LIKE 'role_%';
  ```
  All constraints should be valid (no violations)

- [ ] **Referential Integrity**
  ```sql
  -- Check for orphaned records in junction tables
  SELECT 'role_skills' as junction_table, count(*) as orphaned_count
  FROM role_skills rs
  WHERE NOT EXISTS (SELECT 1 FROM org_roles WHERE id = rs.role_id)
     OR NOT EXISTS (SELECT 1 FROM skills WHERE id = rs.skill_id)
  UNION ALL
  SELECT 'role_certifications', count(*)
  FROM role_certifications rc
  WHERE NOT EXISTS (SELECT 1 FROM org_roles WHERE id = rc.role_id)
     OR NOT EXISTS (SELECT 1 FROM certifications WHERE id = rc.certification_id);
  -- etc. for all junction tables
  ```
  Expected: 0 orphaned records

- [ ] **Unique Constraints**
  ```sql
  -- Test unique constraints in junction tables
  SELECT role_id, skill_id, count(*)
  FROM role_skills
  GROUP BY role_id, skill_id
  HAVING count(*) > 1;
  ```
  Expected: 0 duplicates

### Performance Validation

- [ ] **Index Usage Check**
  ```sql
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE tablename LIKE 'role_%' OR tablename IN ('skills', 'certifications', 'competencies', 'kpis')
  ORDER BY tablename, indexname;
  ```
  Record baseline for future monitoring

- [ ] **Query Performance Test**
  ```sql
  EXPLAIN ANALYZE
  SELECT
    r.id,
    r.role_name,
    json_agg(DISTINCT s.name) as skills
  FROM org_roles r
  LEFT JOIN role_skills rs ON r.id = rs.role_id
  LEFT JOIN skills s ON rs.skill_id = s.id
  WHERE r.is_active = true
  GROUP BY r.id
  LIMIT 100;
  ```
  Expected: Execution time < 50ms

- [ ] **Full-Text Search Performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT name, description
  FROM skills
  WHERE search_vector @@ to_tsquery('clinical & trial');
  ```
  Expected: Uses GIN index, execution time < 100ms

### Security Validation

- [ ] **RLS Policies Active**
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'skills', 'certifications', 'competencies', 'kpis',
      'training_programs', 'regulatory_requirements',
      'systems', 'deliverables', 'therapeutic_areas',
      'stakeholder_types', 'career_paths'
    );
  ```
  Expected: All should have rowsecurity = true

- [ ] **Tenant Isolation Test**
  ```sql
  -- Set tenant context
  SET app.current_tenant_id = '00000000-0000-0000-0000-000000000000';

  -- Try to access data
  SELECT count(*) FROM skills;

  -- Should only see tenant-scoped data or public data
  ```

### Application Integration

- [ ] **API Endpoints Updated**
  - [ ] GET /api/roles/:id returns new fields
  - [ ] GET /api/roles/:id/skills returns junction data
  - [ ] GET /api/roles/:id/certifications returns junction data
  - [ ] POST /api/roles accepts new fields
  - [ ] PUT /api/roles/:id updates new fields

- [ ] **UI Components Updated**
  - [ ] Role detail page shows new fields
  - [ ] Role edit form includes new fields
  - [ ] Skills management interface works
  - [ ] Certifications management interface works
  - [ ] Search includes new fields

- [ ] **Type Definitions Current**
  ```bash
  npm run schema:generate-types
  ```
  - [ ] TypeScript types generated
  - [ ] Zod schemas generated
  - [ ] No type errors in application

---

## Post-Migration Tasks

### Monitoring

- [ ] **Set Up Alerts**
  - [ ] Query performance monitoring
  - [ ] Index usage monitoring
  - [ ] Table size monitoring
  - [ ] Error rate monitoring

- [ ] **Create Dashboard**
  - [ ] Table row counts
  - [ ] Junction table growth
  - [ ] Query performance metrics
  - [ ] Index hit rates

### Documentation

- [ ] **Update Documentation**
  - [ ] API documentation updated
  - [ ] Database schema docs updated
  - [ ] User guides updated
  - [ ] Training materials updated

- [ ] **Create Runbook**
  - [ ] Common queries documented
  - [ ] Troubleshooting guide created
  - [ ] Performance tuning tips documented
  - [ ] Rollback procedures documented

### Communication

- [ ] **Stakeholder Notification**
  - [ ] Product team notified
  - [ ] Development team notified
  - [ ] Data team notified
  - [ ] Users notified (if applicable)

- [ ] **Release Notes**
  - [ ] Schema changes documented
  - [ ] New features listed
  - [ ] Breaking changes noted (if any)
  - [ ] Migration instructions provided

---

## Rollback Decision Tree

### When to Rollback

**Immediate Rollback Required**:
- Data loss detected
- Critical data corruption
- Application completely broken
- Security vulnerability introduced

**Consider Rollback**:
- Performance significantly degraded
- Unexpected errors in production
- Data quality issues discovered
- User-facing functionality broken

**Fix Forward**:
- Minor data quality issues
- Non-critical performance issues
- Edge case bugs
- Cosmetic issues

### Rollback Procedure

1. **Stop Application** (if needed)
2. **Execute Rollback Migrations** (in reverse order: Phase 5 → Phase 1)
3. **Verify Rollback Success**
4. **Restore from Backup** (if rollback migrations fail)
5. **Restart Application**
6. **Verify Application Functionality**
7. **Notify Stakeholders**
8. **Post-Mortem Analysis**

---

## Success Criteria

Migration is considered successful when:

- [ ] All 5 migration phases completed without errors
- [ ] All validation checks pass
- [ ] No data loss or corruption
- [ ] Query performance meets targets (<50ms for role profiles)
- [ ] Application integration complete
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Production stable for 24 hours post-migration

---

## Contact Information

**Database Team**: database-team@vital.com
**DevOps Team**: devops@vital.com
**On-Call Engineer**: +1-XXX-XXX-XXXX
**Escalation**: CTO

---

## Notes & Issues

**Date**: _________
**Executed By**: _________
**Start Time**: _________
**End Time**: _________
**Issues Encountered**:

_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Resolution**:

_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

**Checklist Version**: 1.0.0
**Last Updated**: 2025-11-22
**Status**: Ready for Execution
