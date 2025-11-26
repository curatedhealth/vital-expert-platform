# Hierarchical Multi-Tenancy Implementation Checklist

## Overview

This document provides a step-by-step checklist for implementing the hierarchical multi-tenant schema in VITAL's production environment.

## Pre-Implementation Checklist

### 1. Environment Preparation

- [ ] **Backup Production Database**
  - [ ] Full database dump created
  - [ ] Backup stored in secure location
  - [ ] Backup restoration tested in staging
  - [ ] Backup retention policy documented

- [ ] **Staging Environment Ready**
  - [ ] Staging database is clone of production
  - [ ] Staging has same PostgreSQL version as production
  - [ ] Staging has same extensions enabled (uuid-ossp, pgcrypto, etc.)
  - [ ] Connection pool configuration matches production

- [ ] **Access & Permissions**
  - [ ] Database admin credentials available
  - [ ] Service role access confirmed
  - [ ] RLS policies can be modified
  - [ ] Ability to create functions and triggers

### 2. Code Review & Validation

- [ ] **Migration Scripts Reviewed**
  - [ ] Phase 1: Add columns migration reviewed
  - [ ] Phase 2: Backfill data migration reviewed
  - [ ] Phase 3: Add constraints migration reviewed
  - [ ] All SQL syntax validated
  - [ ] Rollback scripts prepared

- [ ] **Documentation Complete**
  - [ ] Schema design document read and approved
  - [ ] ERD diagram understood by team
  - [ ] Helper functions documented
  - [ ] RLS policies documented

### 3. Testing Plan Prepared

- [ ] **Test Data Created**
  - [ ] Test organizations created (platform, tenants, orgs)
  - [ ] Test users created for each organization
  - [ ] Test agents with different sharing scopes
  - [ ] Test conversations and messages

- [ ] **Test Scenarios Defined**
  - [ ] Data isolation tests written
  - [ ] Access control tests defined
  - [ ] Performance benchmarks established
  - [ ] Rollback procedure tested

## Phase 1: Add Columns (Non-Breaking)

### Execution

- [ ] **Run Phase 1 Migration in Staging**
  ```bash
  # Connect to staging database
  psql -U postgres -d vital_staging
  \i 20251126_001_hierarchical_multitenancy_phase1.sql
  ```

- [ ] **Verify Phase 1 Completion**
  ```sql
  -- Check new columns exist
  SELECT
    column_name,
    data_type,
    is_nullable
  FROM information_schema.columns
  WHERE table_name = 'organizations'
    AND column_name IN ('parent_organization_id', 'organization_type', 'slug', 'deleted_at');

  -- Check ENUMs created
  SELECT typname, typtype
  FROM pg_type
  WHERE typname IN ('organization_type', 'sharing_scope_type');

  -- Check agents table
  SELECT
    column_name,
    data_type,
    is_nullable
  FROM information_schema.columns
  WHERE table_name = 'agents'
    AND column_name IN ('owner_organization_id', 'sharing_scope', 'deleted_at');
  ```

- [ ] **Verify Application Still Works**
  - [ ] Frontend loads without errors
  - [ ] Users can log in
  - [ ] Agents are visible
  - [ ] Chat functionality works
  - [ ] No database errors in logs

### Rollback Checkpoint

- [ ] Document current state
- [ ] If issues found, execute Phase 1 rollback script
- [ ] Application tested after rollback

## Phase 2: Backfill Data (Reversible)

### Pre-Execution Checks

- [ ] **Verify Data Quality**
  ```sql
  -- Check for organizations with missing names
  SELECT COUNT(*) FROM organizations WHERE name IS NULL OR name = '';

  -- Check for agents without organization
  SELECT COUNT(*) FROM agents WHERE owner_organization_id IS NULL;

  -- Check for conversations without organization
  SELECT COUNT(*) FROM conversations WHERE owner_organization_id IS NULL;
  ```

- [ ] **Review Current tenant_type Distribution**
  ```sql
  SELECT tenant_type, COUNT(*)
  FROM organizations
  WHERE tenant_type IS NOT NULL
  GROUP BY tenant_type;
  ```

### Execution

- [ ] **Run Phase 2 Migration in Staging**
  ```bash
  psql -U postgres -d vital_staging
  \i 20251126_002_hierarchical_multitenancy_phase2.sql
  ```

- [ ] **Verify Phase 2 Completion**
  ```sql
  -- Check organization hierarchy
  SELECT
    o.id,
    o.name,
    o.slug,
    o.organization_type,
    p.name as parent_name
  FROM organizations o
  LEFT JOIN organizations p ON o.parent_organization_id = p.id
  ORDER BY
    CASE o.organization_type
      WHEN 'platform' THEN 1
      WHEN 'tenant' THEN 2
      WHEN 'organization' THEN 3
    END,
    o.name;

  -- Check sharing_scope distribution
  SELECT
    sharing_scope,
    COUNT(*) as agent_count
  FROM agents
  GROUP BY sharing_scope;

  -- Verify NO NULL values remain
  SELECT COUNT(*) FROM agents WHERE owner_organization_id IS NULL;
  SELECT COUNT(*) FROM agents WHERE sharing_scope IS NULL;
  SELECT COUNT(*) FROM organizations WHERE organization_type IS NULL;
  SELECT COUNT(*) FROM organizations WHERE slug IS NULL OR slug = '';
  ```

- [ ] **Run Verification Queries**
  ```sql
  -- Agent distribution by organization
  SELECT
    o.name as organization,
    o.organization_type,
    a.sharing_scope,
    COUNT(*) as agent_count
  FROM agents a
  JOIN organizations o ON a.owner_organization_id = o.id
  GROUP BY o.name, o.organization_type, a.sharing_scope
  ORDER BY o.organization_type, a.sharing_scope;

  -- Check for duplicate slugs
  SELECT slug, COUNT(*)
  FROM organizations
  GROUP BY slug
  HAVING COUNT(*) > 1;
  ```

### Data Quality Validation

- [ ] **Verify Platform Organization**
  ```sql
  SELECT * FROM organizations
  WHERE id = '00000000-0000-0000-0000-000000000001'
    AND organization_type = 'platform'
    AND parent_organization_id IS NULL;
  ```

- [ ] **Verify Tenant Organizations**
  ```sql
  SELECT
    id,
    name,
    slug,
    organization_type,
    parent_organization_id
  FROM organizations
  WHERE organization_type = 'tenant';
  ```

- [ ] **Verify Child Organizations**
  ```sql
  SELECT
    o.name,
    o.slug,
    o.organization_type,
    p.name as parent_name,
    p.organization_type as parent_type
  FROM organizations o
  JOIN organizations p ON o.parent_organization_id = p.id
  WHERE o.organization_type = 'organization';
  ```

### Rollback Checkpoint

- [ ] If data looks incorrect, document issues
- [ ] Restore from backup if needed
- [ ] Re-run Phase 2 with corrections

## Phase 3: Add Constraints & Indexes (Validation Required)

### Pre-Execution Checks

- [ ] **Validate All NULL Values Fixed**
  ```sql
  -- This must return 0 for all
  SELECT 'organizations.organization_type' as column, COUNT(*) as null_count
  FROM organizations WHERE organization_type IS NULL
  UNION ALL
  SELECT 'organizations.slug', COUNT(*)
  FROM organizations WHERE slug IS NULL
  UNION ALL
  SELECT 'agents.owner_organization_id', COUNT(*)
  FROM agents WHERE owner_organization_id IS NULL
  UNION ALL
  SELECT 'agents.sharing_scope', COUNT(*)
  FROM agents WHERE sharing_scope IS NULL;
  ```

- [ ] **Validate Hierarchy Constraints**
  ```sql
  -- Platform must have no parent
  SELECT COUNT(*) as violations
  FROM organizations
  WHERE organization_type = 'platform'
    AND parent_organization_id IS NOT NULL;

  -- Non-platform must have parent
  SELECT COUNT(*) as violations
  FROM organizations
  WHERE organization_type != 'platform'
    AND parent_organization_id IS NULL;
  ```

- [ ] **Validate Foreign Keys**
  ```sql
  -- Check agents point to valid organizations
  SELECT COUNT(*) as orphaned_agents
  FROM agents a
  LEFT JOIN organizations o ON a.owner_organization_id = o.id
  WHERE o.id IS NULL;

  -- Check organizations point to valid parents
  SELECT COUNT(*) as orphaned_orgs
  FROM organizations o
  LEFT JOIN organizations p ON o.parent_organization_id = p.id
  WHERE o.parent_organization_id IS NOT NULL
    AND p.id IS NULL;
  ```

### Execution

- [ ] **Run Phase 3 Migration in Staging**
  ```bash
  psql -U postgres -d vital_staging
  \i 20251126_003_hierarchical_multitenancy_phase3.sql
  ```

- [ ] **Verify Phase 3 Completion**
  ```sql
  -- Check constraints added
  SELECT
    conname as constraint_name,
    contype as constraint_type
  FROM pg_constraint
  WHERE conrelid = 'organizations'::regclass
    AND conname IN ('org_hierarchy_valid', 'fk_parent_organization');

  -- Check indexes created
  SELECT
    indexname,
    indexdef
  FROM pg_indexes
  WHERE tablename = 'organizations'
    AND indexname LIKE 'idx_organizations_%';

  SELECT
    indexname,
    indexdef
  FROM pg_indexes
  WHERE tablename = 'agents'
    AND indexname LIKE 'idx_agents_%';
  ```

- [ ] **Test Helper Functions**
  ```sql
  -- Test get_organization_hierarchy
  SELECT * FROM get_organization_hierarchy(
    (SELECT id FROM organizations WHERE slug = 'novartis' LIMIT 1)
  );

  -- Test get_organization_tenant
  SELECT get_organization_tenant(
    (SELECT id FROM organizations WHERE organization_type = 'organization' LIMIT 1)
  ) as tenant_id;

  -- Test get_user_accessible_organizations
  SELECT * FROM get_user_accessible_organizations(
    (SELECT id FROM users LIMIT 1)
  );

  -- Test get_accessible_agents
  SELECT
    agent_name,
    sharing_scope,
    access_reason
  FROM get_accessible_agents(
    (SELECT id FROM users LIMIT 1)
  )
  LIMIT 10;
  ```

- [ ] **Verify Materialized View**
  ```sql
  -- Check organization_stats exists
  SELECT * FROM organization_stats
  ORDER BY organization_type, organization_name;

  -- Test refresh function
  SELECT refresh_organization_stats();
  ```

### Performance Validation

- [ ] **Benchmark Common Queries**
  ```sql
  -- Query 1: Get accessible agents for user (should use indexes)
  EXPLAIN ANALYZE
  SELECT * FROM get_accessible_agents('some-user-id'::UUID);
  -- Expected: < 50ms for < 1000 agents

  -- Query 2: List agents by organization
  EXPLAIN ANALYZE
  SELECT id, name, display_name, tier, sharing_scope
  FROM agents
  WHERE owner_organization_id = 'some-org-id'::UUID
    AND status = 'active'
    AND deleted_at IS NULL;
  -- Expected: Index Scan on idx_agents_org_list

  -- Query 3: Get organization hierarchy
  EXPLAIN ANALYZE
  SELECT * FROM get_organization_hierarchy('some-org-id'::UUID);
  -- Expected: < 10ms for 3-level hierarchy
  ```

- [ ] **Check Index Usage**
  ```sql
  -- Verify indexes are being used
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE tablename IN ('organizations', 'agents', 'user_organizations')
  ORDER BY idx_scan DESC;
  ```

## Phase 4: Update RLS Policies (Security Critical)

### Pre-Execution

- [ ] **Review Current RLS Policies**
  ```sql
  -- List current policies
  SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
  FROM pg_policies
  WHERE tablename IN ('agents', 'knowledge_documents', 'conversations')
  ORDER BY tablename, policyname;
  ```

- [ ] **Test New RLS Policy Logic**
  ```sql
  -- Create test function to simulate RLS
  CREATE OR REPLACE FUNCTION test_rls_access(
    p_user_id UUID,
    p_agent_id UUID
  ) RETURNS BOOLEAN AS $$
  DECLARE
    v_agent_owner_org UUID;
    v_agent_sharing_scope sharing_scope_type;
    v_can_access BOOLEAN;
  BEGIN
    SELECT owner_organization_id, sharing_scope
    INTO v_agent_owner_org, v_agent_sharing_scope
    FROM agents WHERE id = p_agent_id;

    SELECT can_user_access_resource(
      p_user_id,
      v_agent_owner_org,
      v_agent_sharing_scope
    ) INTO v_can_access;

    RETURN v_can_access;
  END;
  $$ LANGUAGE plpgsql;

  -- Test with known user/agent combinations
  SELECT test_rls_access(
    (SELECT id FROM users WHERE email = 'alice@novartis.com'),
    (SELECT id FROM agents WHERE name = 'Novartis RA Agent')
  ) as should_be_true;
  ```

### Execution

- [ ] **Update RLS Policies for Agents**
  ```sql
  -- Drop old policies
  DROP POLICY IF EXISTS "users_view_public_agents" ON agents;
  DROP POLICY IF EXISTS "users_view_tenant_agents" ON agents;

  -- Create new multi-tenant policies
  CREATE POLICY "users_view_accessible_agents"
    ON agents FOR SELECT
    TO authenticated
    USING (
      deleted_at IS NULL
      AND (
        sharing_scope = 'platform'
        OR (
          sharing_scope = 'tenant'
          AND get_organization_tenant(owner_organization_id) IN (
            SELECT get_organization_tenant(organization_id)
            FROM user_organizations
            WHERE user_id = auth.uid() AND is_active = true
          )
        )
        OR (
          sharing_scope = 'organization'
          AND owner_organization_id IN (
            SELECT organization_id
            FROM user_organizations
            WHERE user_id = auth.uid() AND is_active = true
          )
        )
      )
    );

  CREATE POLICY "users_create_agents"
    ON agents FOR INSERT
    TO authenticated
    WITH CHECK (
      owner_organization_id IN (
        SELECT organization_id
        FROM user_organizations
        WHERE user_id = auth.uid() AND is_active = true
      )
      AND created_by = auth.uid()
    );

  CREATE POLICY "users_update_agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (
      deleted_at IS NULL
      AND (
        created_by = auth.uid()
        OR owner_organization_id IN (
          SELECT organization_id
          FROM user_organizations
          WHERE user_id = auth.uid()
            AND is_active = true
            AND role = 'admin'
        )
      )
    );
  ```

- [ ] **Update RLS for Knowledge Documents**
  ```sql
  -- Similar pattern to agents
  -- (See full RLS patterns in schema design document)
  ```

- [ ] **Update RLS for Conversations**
  ```sql
  -- Conversations are special: no sharing_scope
  CREATE POLICY "users_view_own_conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid()
      AND deleted_at IS NULL
    );
  ```

### Validation

- [ ] **Test RLS Policies**
  ```sql
  -- Set user context
  SET ROLE authenticated;
  SET request.jwt.claim.sub = 'user-id-here';

  -- Test agent visibility
  SELECT COUNT(*) as visible_agents FROM agents;

  -- Test agent creation
  INSERT INTO agents (
    owner_organization_id,
    sharing_scope,
    name,
    display_name,
    description,
    system_prompt,
    created_by
  ) VALUES (
    'org-id',
    'organization',
    'Test Agent',
    'Test Agent',
    'Testing',
    'Test',
    'user-id'
  );

  -- Reset role
  RESET ROLE;
  ```

- [ ] **Test Data Isolation**
  ```sql
  -- Create test scenario
  -- User A from Novartis should NOT see Pfizer-only agents
  -- User A from Novartis SHOULD see Pharma-wide agents
  -- (See full test suite in schema design document)
  ```

## Production Deployment

### Pre-Deployment

- [ ] **Staging Fully Tested**
  - [ ] All 4 phases completed successfully
  - [ ] All tests passing
  - [ ] Performance benchmarks met
  - [ ] RLS policies working correctly

- [ ] **Deployment Plan Approved**
  - [ ] Database team reviewed migration
  - [ ] Engineering team reviewed changes
  - [ ] Product team aware of deployment
  - [ ] Rollback plan documented

- [ ] **Maintenance Window Scheduled**
  - [ ] Users notified of maintenance
  - [ ] Downtime window agreed upon (or zero-downtime plan)
  - [ ] On-call engineers available

### Deployment Steps

- [ ] **1. Final Backup**
  ```bash
  pg_dump -h prod-db -U postgres -d vital_prod -F c -b -v \
    -f vital_prod_backup_$(date +%Y%m%d_%H%M%S).dump
  ```

- [ ] **2. Enable Maintenance Mode** (if applicable)
  - [ ] Frontend shows maintenance banner
  - [ ] API endpoints return 503 for writes
  - [ ] Background jobs paused

- [ ] **3. Run Phase 1 in Production**
  ```bash
  psql -h prod-db -U postgres -d vital_prod \
    -f 20251126_001_hierarchical_multitenancy_phase1.sql \
    2>&1 | tee migration_phase1_prod.log
  ```

- [ ] **4. Verify Phase 1 in Production**
  - [ ] Check migration log for errors
  - [ ] Run verification queries
  - [ ] Application still works

- [ ] **5. Run Phase 2 in Production**
  ```bash
  psql -h prod-db -U postgres -d vital_prod \
    -f 20251126_002_hierarchical_multitenancy_phase2.sql \
    2>&1 | tee migration_phase2_prod.log
  ```

- [ ] **6. Verify Phase 2 in Production**
  - [ ] Check migration log
  - [ ] Verify data backfill
  - [ ] NO NULL values remain
  - [ ] Hierarchy looks correct

- [ ] **7. Run Phase 3 in Production**
  ```bash
  psql -h prod-db -U postgres -d vital_prod \
    -f 20251126_003_hierarchical_multitenancy_phase3.sql \
    2>&1 | tee migration_phase3_prod.log
  ```

- [ ] **8. Verify Phase 3 in Production**
  - [ ] Check migration log
  - [ ] Test helper functions
  - [ ] Verify indexes created
  - [ ] Run performance benchmarks

- [ ] **9. Deploy Application Code Changes**
  - [ ] Backend API updated to use new schema
  - [ ] Frontend updated (if needed)
  - [ ] Background jobs updated

- [ ] **10. Update RLS Policies (Phase 4)**
  - [ ] Run RLS policy updates
  - [ ] Test with real user accounts
  - [ ] Verify data isolation

- [ ] **11. Disable Maintenance Mode**
  - [ ] Re-enable API writes
  - [ ] Remove maintenance banner
  - [ ] Resume background jobs

### Post-Deployment Monitoring

- [ ] **Monitor Database Performance**
  ```sql
  -- Check slow queries
  SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
  FROM pg_stat_statements
  WHERE query LIKE '%agents%'
    OR query LIKE '%organizations%'
  ORDER BY mean_time DESC
  LIMIT 20;

  -- Check index usage
  SELECT * FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;

  -- Check table bloat
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  ```

- [ ] **Monitor Application Metrics**
  - [ ] API response times normal
  - [ ] Error rates normal
  - [ ] Agent load times acceptable
  - [ ] Conversation creation working

- [ ] **Verify Data Isolation**
  - [ ] Spot check: Novartis user cannot see Pfizer data
  - [ ] Spot check: Tenant-wide resources visible
  - [ ] Spot check: Platform-wide resources visible to all

- [ ] **Check Audit Logs**
  ```sql
  -- Verify audit logging working
  SELECT
    resource_type,
    action,
    COUNT(*) as event_count
  FROM audit_logs
  WHERE created_at > NOW() - INTERVAL '1 hour'
  GROUP BY resource_type, action
  ORDER BY event_count DESC;
  ```

## Rollback Procedures

### If Issues Found in Phase 1

- [ ] **Rollback Phase 1**
  ```sql
  BEGIN;

  -- Remove new columns
  ALTER TABLE organizations
    DROP COLUMN IF EXISTS parent_organization_id,
    DROP COLUMN IF EXISTS organization_type,
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS deleted_at;

  ALTER TABLE agents
    DROP COLUMN IF EXISTS sharing_scope,
    DROP COLUMN IF EXISTS deleted_at;

  -- Drop ENUMs
  DROP TYPE IF EXISTS organization_type;
  DROP TYPE IF EXISTS sharing_scope_type;

  COMMIT;
  ```

### If Issues Found in Phase 2

- [ ] **Restore from Backup**
  ```bash
  # Stop application
  # Restore database
  pg_restore -h prod-db -U postgres -d vital_prod \
    -c vital_prod_backup_TIMESTAMP.dump

  # Restart application
  ```

### If Issues Found After Full Deployment

- [ ] **Emergency Rollback Plan**
  1. Stop application writes
  2. Restore database from pre-migration backup
  3. Deploy previous application version
  4. Re-enable application
  5. Post-mortem analysis

## Success Criteria

- [ ] **Schema Updated**
  - [ ] All tables have new columns
  - [ ] All constraints in place
  - [ ] All indexes created
  - [ ] All functions working

- [ ] **Data Quality**
  - [ ] No NULL values in critical columns
  - [ ] Hierarchy correctly structured
  - [ ] Sharing scopes correctly assigned
  - [ ] All resources owned by valid organizations

- [ ] **Performance**
  - [ ] Common queries < 50ms
  - [ ] Agent list queries use covering indexes
  - [ ] Hierarchy queries < 10ms
  - [ ] No table scans on large tables

- [ ] **Security**
  - [ ] RLS policies enforce data isolation
  - [ ] Users cannot see unauthorized data
  - [ ] Audit logging captures all changes
  - [ ] No SQL injection vulnerabilities

- [ ] **Functionality**
  - [ ] Users can log in
  - [ ] Agents load correctly
  - [ ] Conversations work
  - [ ] Knowledge documents accessible
  - [ ] No application errors

## Post-Migration Tasks

- [ ] **Documentation Updates**
  - [ ] Update API documentation
  - [ ] Update database schema docs
  - [ ] Update team wiki
  - [ ] Create runbook for common operations

- [ ] **Team Training**
  - [ ] Engineering team trained on new schema
  - [ ] Support team aware of changes
  - [ ] Documentation shared with stakeholders

- [ ] **Monitoring Setup**
  - [ ] Dashboard created for org hierarchy
  - [ ] Alerts set for slow queries
  - [ ] Metrics tracked for resource distribution

- [ ] **Optimization**
  - [ ] Analyze query patterns after 1 week
  - [ ] Add indexes if needed
  - [ ] Tune RLS policies for performance
  - [ ] Refresh materialized views on schedule

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Author**: VITAL Database Architect Agent
**Status**: Ready for Use
