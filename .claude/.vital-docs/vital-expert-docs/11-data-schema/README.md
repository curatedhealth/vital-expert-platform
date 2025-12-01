# Hierarchical Multi-Tenant Database Schema - Complete Documentation

## Overview

This directory contains the complete database schema design and implementation guide for VITAL's 3-level hierarchical multi-tenant architecture.

## Quick Links

- **[Schema Design Document](./HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md)** - Complete technical specification
- **[ERD Diagram](./MULTI_TENANT_ERD_DIAGRAM.md)** - Visual entity relationships
- **[Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)** - Step-by-step deployment guide
- **[Migration Scripts](./06-migrations/)** - SQL migration files

## Architecture Summary

### 3-Level Hierarchy

```
Platform (VITAL Expert Platform)
  ├─ Tenant: Pharmaceuticals
  │   ├─ Organization: Novartis
  │   └─ Organization: Pfizer
  │
  └─ Tenant: Digital Health
      ├─ Organization: Mayo Clinic
      └─ Organization: Kaiser Permanente
```

### Key Design Decisions

1. **Unified Organizations Table**
   - Single table with `parent_organization_id` for hierarchy
   - `organization_type` ENUM: 'platform', 'tenant', 'organization'
   - Self-referential FK with ON DELETE RESTRICT

2. **Sharing Scope Pattern**
   - Every resource has `owner_organization_id` + `sharing_scope`
   - `sharing_scope` ENUM: 'platform', 'tenant', 'organization'
   - Clear, explicit data visibility

3. **Standard Column Naming**
   - `owner_organization_id` everywhere (not `tenant_id`)
   - Consistent pattern across all multi-tenant tables
   - Clear ownership semantics

4. **Data Safety**
   - ON DELETE RESTRICT for all organization FKs
   - Soft deletes with `deleted_at` for compliance
   - Comprehensive audit logging

5. **User Membership**
   - `user_organizations` table with explicit roles
   - Hierarchical access via helper functions
   - RLS policies enforce isolation

## Document Index

### Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md](./HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md) | Complete schema specification with all tables, constraints, indexes, and helper functions | Database Architects, Backend Engineers |
| [MULTI_TENANT_ERD_DIAGRAM.md](./MULTI_TENANT_ERD_DIAGRAM.md) | Visual entity-relationship diagrams showing table relationships and data flow | All Engineers, Product Managers |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Step-by-step deployment checklist with validation queries and rollback procedures | DevOps, Database Admins |

### Migration Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| [20251126_001_hierarchical_multitenancy_phase1.sql](./06-migrations/20251126_001_hierarchical_multitenancy_phase1.sql) | Add new columns (non-breaking) | Safe to run |
| [20251126_002_hierarchical_multitenancy_phase2.sql](./06-migrations/20251126_002_hierarchical_multitenancy_phase2.sql) | Backfill data (reversible) | Requires Phase 1 |
| [20251126_003_hierarchical_multitenancy_phase3.sql](./06-migrations/20251126_003_hierarchical_multitenancy_phase3.sql) | Add constraints & indexes | Requires Phase 1 & 2 |

## Quick Start

### For Database Architects

1. Read [HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md](./HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md) in full
2. Review [MULTI_TENANT_ERD_DIAGRAM.md](./MULTI_TENANT_ERD_DIAGRAM.md) for relationships
3. Understand design decisions and trade-offs
4. Review migration scripts for technical correctness

### For Backend Engineers

1. Review [MULTI_TENANT_ERD_DIAGRAM.md](./MULTI_TENANT_ERD_DIAGRAM.md) for table structure
2. Study the "Multi-Tenant Resource Pattern" section
3. Learn helper functions: `get_accessible_agents()`, `can_user_access_resource()`
4. Update application code to use new columns and patterns

### For DevOps / Database Admins

1. Follow [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) step-by-step
2. Run migrations in staging first
3. Validate data quality and performance
4. Execute production deployment during maintenance window
5. Monitor post-deployment metrics

## Migration Phases

### Phase 1: Add Columns (Non-Breaking)

- Adds `parent_organization_id`, `organization_type`, `slug` to organizations
- Adds `sharing_scope` to all multi-tenant tables
- Renames `tenant_id` to `owner_organization_id` where needed
- **Impact**: Zero downtime, application continues working

### Phase 2: Backfill Data (Reversible)

- Sets platform organization (ID: 00000000-0000-0000-0000-000000000001)
- Identifies tenant organizations from existing data
- Assigns sharing scopes based on current patterns
- Generates unique slugs for all organizations
- **Impact**: Application continues working, data is being prepared

### Phase 3: Add Constraints & Indexes (Performance)

- Adds NOT NULL constraints
- Creates foreign key constraints with ON DELETE RESTRICT
- Creates performance indexes (covering, GIN, etc.)
- Adds helper functions and triggers
- Creates materialized view for org stats
- **Impact**: Improved query performance, data integrity enforced

### Phase 4: Update RLS Policies (Security)

- Updates Row-Level Security policies for new schema
- Enforces data isolation at database level
- **Impact**: Enhanced security, proper multi-tenant isolation

## Key Tables

### Organizations

**Purpose**: 3-level hierarchy (platform > tenant > organization)

**Key Columns**:
- `id` - UUID primary key
- `parent_organization_id` - Self-referential FK
- `organization_type` - 'platform', 'tenant', or 'organization'
- `slug` - URL-safe unique identifier
- `deleted_at` - Soft delete timestamp

**Constraints**:
- Platform must have `parent_organization_id = NULL`
- Tenants and orgs must have a parent
- Max hierarchy depth = 3

### User Organizations

**Purpose**: User membership in organizations with roles

**Key Columns**:
- `user_id` - FK to users
- `organization_id` - FK to organizations
- `role` - 'admin', 'member', 'viewer'
- `is_active` - Membership status

**Usage**: Determines which resources users can access

### Agents

**Purpose**: AI expert agents with hierarchical sharing

**Key Columns**:
- `owner_organization_id` - Organization that owns this agent
- `sharing_scope` - 'platform', 'tenant', or 'organization'
- `tier`, `status`, `knowledge_domains`, `capabilities`

**Sharing Logic**:
- `platform` → visible to all users
- `tenant` → visible to all orgs in same tenant
- `organization` → visible only to owner organization users

### Knowledge Documents

**Purpose**: RAG knowledge base with controlled sharing

**Key Columns**:
- `owner_organization_id` - Owner organization
- `sharing_scope` - Visibility level
- `domain_id` - Knowledge domain classification
- `status` - Processing status

### Prompts

**Purpose**: Prompt engineering library with versioning

**Key Columns**:
- `owner_organization_id` - Owner
- `sharing_scope` - Visibility
- `version`, `parent_prompt_id` - Version tracking
- `prerequisite_prompts`, `prerequisite_capabilities` - Dependencies

### Workflows

**Purpose**: JTBD-based agent workflows

**Key Columns**:
- `owner_organization_id` - Owner
- `sharing_scope` - Visibility
- `framework` - 'langgraph', 'autogen', 'crewai'
- `workflow_definition` - JSONB workflow spec
- `use_case_id` - Associated use case

### Conversations

**Purpose**: User chat sessions (NO sharing, always private)

**Key Columns**:
- `owner_organization_id` - Organization where chat occurred
- `user_id` - User who created conversation
- NO `sharing_scope` - conversations are never shared

**Important**: Conversations are always private to the creating user within their organization

## Helper Functions

### get_organization_hierarchy(org_id)

Returns the full hierarchy path from organization to platform.

**Usage**:
```sql
SELECT * FROM get_organization_hierarchy(
  (SELECT id FROM organizations WHERE slug = 'novartis')
);
```

**Returns**: organization_id, organization_name, organization_type, level

### get_organization_tenant(org_id)

Returns the tenant UUID for any organization.

**Usage**:
```sql
SELECT get_organization_tenant(
  (SELECT id FROM organizations WHERE slug = 'novartis')
);
```

**Returns**: UUID of parent tenant

### get_user_accessible_organizations(user_id)

Returns all organization IDs accessible to user (direct + inherited).

**Usage**:
```sql
SELECT * FROM get_user_accessible_organizations(auth.uid());
```

**Returns**: organization_id, access_level

### can_user_access_resource(user_id, owner_org_id, sharing_scope)

Checks if user can access a resource based on sharing scope.

**Usage**:
```sql
SELECT can_user_access_resource(
  auth.uid(),
  agent.owner_organization_id,
  agent.sharing_scope
);
```

**Returns**: BOOLEAN

### get_accessible_agents(user_id)

Returns all agents accessible to user (most common query).

**Usage**:
```sql
SELECT * FROM get_accessible_agents(auth.uid())
ORDER BY tier, priority DESC;
```

**Returns**: agent_id, agent_name, sharing_scope, tier, access_reason

## RLS Policy Patterns

### Standard Multi-Tenant Resource Pattern

Applied to: agents, knowledge_documents, prompts, workflows, use_cases, capabilities

```sql
-- View policy: Check sharing scope
CREATE POLICY "users_view_accessible_{resource}"
  ON {resource} FOR SELECT
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

-- Create policy: Must own organization
CREATE POLICY "users_create_{resource}"
  ON {resource} FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid() AND is_active = true
    )
    AND created_by = auth.uid()
  );
```

### Conversations Pattern (No Sharing)

```sql
-- Conversations are private to user
CREATE POLICY "users_view_own_conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  );
```

## Performance Considerations

### Critical Indexes

```sql
-- Organizations
idx_organizations_parent (parent_organization_id)
idx_organizations_type (organization_type)
idx_organizations_slug (slug) UNIQUE

-- Agents
idx_agents_owner_org (owner_organization_id)
idx_agents_sharing_scope (sharing_scope)
idx_agents_org_list (owner_org, status, tier) COVERING (id, name, display_name...)

-- User Organizations
idx_user_orgs_user (user_id, is_active) COVERING (organization_id, role)
```

### Materialized View

```sql
-- organization_stats
-- Aggregates agent counts, user counts, activity per organization
-- Refresh with: SELECT refresh_organization_stats();
```

### Query Optimization

- Use `get_accessible_agents(user_id)` for listing agents (optimized)
- Covering indexes minimize table lookups
- RLS policies use indexed columns for fast filtering
- Recursive queries use CTEs for efficiency

## Security & Compliance

### Data Isolation

- **Organization Level**: Novartis CANNOT see Pfizer's data
- **Tenant Level**: All pharma orgs CAN see pharma-wide resources
- **Platform Level**: All users CAN see platform resources

### Audit Logging

- All changes to multi-tenant resources logged
- Partitioned by month for performance
- 7-year retention for HIPAA compliance
- Tracks: user, action, resource, before/after state

### Encryption

- PHI columns encrypted at application layer (pgcrypto)
- Connections use TLS
- Backups encrypted at rest
- Keys rotated regularly

## Testing

### Data Isolation Tests

```sql
-- Test: Novartis user cannot see Pfizer agents
-- Expected: 0 rows
SELECT COUNT(*) FROM agents
WHERE owner_organization_id = (SELECT id FROM organizations WHERE slug = 'pfizer')
  AND sharing_scope = 'organization'
  AND id IN (
    SELECT agent_id FROM get_accessible_agents(
      (SELECT id FROM users WHERE email = 'alice@novartis.com')
    )
  );
```

### Performance Benchmarks

```sql
-- Test: Get accessible agents < 50ms
EXPLAIN ANALYZE
SELECT * FROM get_accessible_agents('user-id');

-- Expected: < 50ms for < 1000 agents
-- Expected: Uses idx_agents_owner_org, idx_agents_sharing_scope
```

## Common Operations

### Create New Organization

```sql
INSERT INTO organizations (
  name,
  slug,
  organization_type,
  parent_organization_id
) VALUES (
  'Acme Corp',
  'acme-corp',
  'organization',
  (SELECT id FROM organizations WHERE slug = 'pharma-tenant')
);
```

### Add User to Organization

```sql
INSERT INTO user_organizations (
  user_id,
  organization_id,
  role
) VALUES (
  'user-uuid',
  'org-uuid',
  'member'
);
```

### Create Platform-Wide Agent

```sql
INSERT INTO agents (
  owner_organization_id,
  sharing_scope,
  name,
  display_name,
  description,
  system_prompt,
  tier,
  knowledge_domains,
  created_by
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- platform
  'platform',
  'VITAL Guide',
  'VITAL Platform Guide',
  'General platform assistant',
  'You are a helpful assistant...',
  'tier_3',
  ARRAY['general'],
  auth.uid()
);
```

### Create Tenant-Wide Knowledge Document

```sql
INSERT INTO knowledge_documents (
  owner_organization_id,
  sharing_scope,
  title,
  content,
  domain_id,
  created_by
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'pharma-tenant'),
  'tenant',
  'FDA Regulatory Guidelines',
  'Content here...',
  (SELECT id FROM knowledge_domains WHERE slug = 'regulatory-affairs'),
  auth.uid()
);
```

## Troubleshooting

### User Cannot See Expected Agents

**Check**:
1. Is user a member of correct organization?
   ```sql
   SELECT * FROM user_organizations WHERE user_id = 'user-id';
   ```

2. What is agent's sharing scope?
   ```sql
   SELECT owner_organization_id, sharing_scope FROM agents WHERE id = 'agent-id';
   ```

3. What can user access?
   ```sql
   SELECT * FROM get_accessible_agents('user-id');
   ```

### Slow Agent Queries

**Check**:
1. Are indexes being used?
   ```sql
   EXPLAIN ANALYZE SELECT * FROM agents WHERE owner_organization_id = 'org-id';
   ```

2. Is RLS policy optimized?
   ```sql
   EXPLAIN ANALYZE SELECT * FROM agents;
   -- Should use idx_agents_owner_org or idx_agents_sharing_scope
   ```

### NULL owner_organization_id Errors

**Fix**:
```sql
-- Find orphaned resources
SELECT COUNT(*) FROM agents WHERE owner_organization_id IS NULL;

-- Assign to platform or default org
UPDATE agents
SET owner_organization_id = '00000000-0000-0000-0000-000000000001'
WHERE owner_organization_id IS NULL;
```

## Maintenance

### Regular Tasks

**Daily**:
- Monitor slow query log
- Check index usage stats
- Review error logs

**Weekly**:
- Refresh materialized views
- Analyze table statistics
- Check for missing indexes

**Monthly**:
- Create new audit log partition
- Archive old audit logs
- Vacuum and analyze all tables
- Review and optimize RLS policies

### Monitoring Queries

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

## Support & Questions

For questions about this schema design:

1. **Schema Design Questions**: Review [HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md](./HIERARCHICAL_MULTITENANCY_SCHEMA_DESIGN.md)
2. **Implementation Questions**: Check [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
3. **Relationship Questions**: See [MULTI_TENANT_ERD_DIAGRAM.md](./MULTI_TENANT_ERD_DIAGRAM.md)
4. **Database Team**: Contact database-team@vital.ai
5. **Emergency**: Escalate to on-call database engineer

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-26 | VITAL Database Architect Agent | Initial schema design and documentation |

## License & Confidentiality

This document contains proprietary information about VITAL's database architecture and should be treated as confidential. Distribution outside of VITAL engineering team requires approval.

---

**Document Maintained By**: Database Architecture Team
**Last Review Date**: 2025-11-26
**Next Review Date**: 2026-02-26
