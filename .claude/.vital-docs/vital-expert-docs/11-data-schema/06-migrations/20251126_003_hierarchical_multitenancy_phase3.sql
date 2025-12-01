-- ============================================================================
-- HIERARCHICAL MULTI-TENANCY MIGRATION - PHASE 3
-- ============================================================================
-- Description: Add constraints, indexes, and helper functions
-- Author: VITAL Database Architect
-- Date: 2025-11-26
-- Status: Safe to run (adds constraints after data validation)
-- Prerequisites: Phase 1 and 2 must be completed and verified
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add NOT NULL constraints
-- ============================================================================

DO $$
BEGIN
  -- Organizations
  ALTER TABLE organizations
    ALTER COLUMN organization_type SET NOT NULL,
    ALTER COLUMN slug SET NOT NULL;

  RAISE NOTICE '✓ Set NOT NULL constraints on organizations table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on organizations: %', SQLERRM;
    RAISE WARNING '  Run these queries to find NULL values:';
    RAISE WARNING '    SELECT * FROM organizations WHERE organization_type IS NULL;';
    RAISE WARNING '    SELECT * FROM organizations WHERE slug IS NULL;';
    RAISE EXCEPTION 'Fix NULL values before continuing';
END$$;

-- Agents
DO $$
BEGIN
  ALTER TABLE agents
    ALTER COLUMN owner_organization_id SET NOT NULL,
    ALTER COLUMN sharing_scope SET NOT NULL,
    ALTER COLUMN sharing_scope SET DEFAULT 'organization'::sharing_scope_type;

  RAISE NOTICE '✓ Set NOT NULL constraints on agents table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on agents: %', SQLERRM;
    RAISE WARNING '  SELECT COUNT(*) FROM agents WHERE owner_organization_id IS NULL OR sharing_scope IS NULL;';
    RAISE EXCEPTION 'Fix NULL values in Phase 2 before continuing';
END$$;

-- Knowledge documents
DO $$
BEGIN
  ALTER TABLE knowledge_documents
    ALTER COLUMN owner_organization_id SET NOT NULL,
    ALTER COLUMN sharing_scope SET NOT NULL,
    ALTER COLUMN sharing_scope SET DEFAULT 'organization'::sharing_scope_type;

  RAISE NOTICE '✓ Set NOT NULL constraints on knowledge_documents table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on knowledge_documents: %', SQLERRM;
END$$;

-- Conversations (owner_organization_id only, no sharing_scope)
DO $$
BEGIN
  ALTER TABLE conversations
    ALTER COLUMN owner_organization_id SET NOT NULL;

  RAISE NOTICE '✓ Set NOT NULL constraints on conversations table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on conversations: %', SQLERRM;
END$$;

-- Prompts (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    ALTER TABLE prompts
      ALTER COLUMN owner_organization_id SET NOT NULL,
      ALTER COLUMN sharing_scope SET NOT NULL,
      ALTER COLUMN sharing_scope SET DEFAULT 'organization'::sharing_scope_type;

    RAISE NOTICE '✓ Set NOT NULL constraints on prompts table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on prompts: %', SQLERRM;
END$$;

-- Workflows (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    ALTER TABLE workflows
      ALTER COLUMN owner_organization_id SET NOT NULL,
      ALTER COLUMN sharing_scope SET NOT NULL,
      ALTER COLUMN sharing_scope SET DEFAULT 'organization'::sharing_scope_type;

    RAISE NOTICE '✓ Set NOT NULL constraints on workflows table';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '⚠ Could not set NOT NULL on workflows: %', SQLERRM;
END$$;

-- ============================================================================
-- STEP 2: Add hierarchy validation constraints
-- ============================================================================

-- Hierarchy depth validation
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS org_hierarchy_valid;

ALTER TABLE organizations
  ADD CONSTRAINT org_hierarchy_valid CHECK (
    (organization_type = 'platform' AND parent_organization_id IS NULL) OR
    (organization_type != 'platform' AND parent_organization_id IS NOT NULL)
  );

COMMENT ON CONSTRAINT org_hierarchy_valid ON organizations IS
  'Platform must have no parent, tenants and organizations must have a parent';

RAISE NOTICE '✓ Added hierarchy validation constraint';

-- ============================================================================
-- STEP 3: Add foreign key constraints with proper cascade
-- ============================================================================

-- Organizations parent FK
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS fk_parent_organization;

ALTER TABLE organizations
  ADD CONSTRAINT fk_parent_organization
  FOREIGN KEY (parent_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT; -- Prevent deletion if children exist

COMMENT ON CONSTRAINT fk_parent_organization ON organizations IS
  'Self-referential FK with RESTRICT to prevent accidental deletion of parent orgs';

-- Agents owner FK
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS fk_agents_owner_organization;

ALTER TABLE agents
  ADD CONSTRAINT fk_agents_owner_organization
  FOREIGN KEY (owner_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT; -- Prevent deletion if agents exist

-- Knowledge documents owner FK
ALTER TABLE knowledge_documents
  DROP CONSTRAINT IF EXISTS fk_knowledge_owner_organization;

ALTER TABLE knowledge_documents
  ADD CONSTRAINT fk_knowledge_owner_organization
  FOREIGN KEY (owner_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT;

-- Conversations owner FK
ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS fk_conversations_owner_organization;

ALTER TABLE conversations
  ADD CONSTRAINT fk_conversations_owner_organization
  FOREIGN KEY (owner_organization_id)
  REFERENCES organizations(id)
  ON DELETE RESTRICT;

RAISE NOTICE '✓ Added foreign key constraints with ON DELETE RESTRICT';

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_parent
  ON organizations(parent_organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_type
  ON organizations(organization_type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_slug
  ON organizations(slug)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_active
  ON organizations(is_active, organization_type)
  WHERE deleted_at IS NULL;

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_owner_org
  ON agents(owner_organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_agents_sharing_scope
  ON agents(sharing_scope)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_agents_org_scope
  ON agents(owner_organization_id, sharing_scope, status)
  INCLUDE (id, name, display_name, tier, avatar_url)
  WHERE deleted_at IS NULL;

-- Covering index for common agent queries
CREATE INDEX IF NOT EXISTS idx_agents_list_by_org
  ON agents(owner_organization_id, status, tier)
  INCLUDE (id, name, display_name, sharing_scope, avatar_url)
  WHERE deleted_at IS NULL AND status = 'active';

-- Knowledge documents indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_owner_org
  ON knowledge_documents(owner_organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_sharing_scope
  ON knowledge_documents(sharing_scope)
  WHERE deleted_at IS NULL;

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_owner_org
  ON conversations(owner_organization_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_user_org
  ON conversations(user_id, owner_organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- User organizations indexes (if not already exists)
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_active
  ON user_organizations(user_id, is_active)
  INCLUDE (organization_id, role)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_orgs_org_active
  ON user_organizations(organization_id, is_active)
  WHERE is_active = true;

RAISE NOTICE '✓ Created performance indexes';

-- ============================================================================
-- STEP 5: Create helper functions
-- ============================================================================

-- Function: Get organization hierarchy path
CREATE OR REPLACE FUNCTION get_organization_hierarchy(p_organization_id UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  organization_type organization_type,
  level INTEGER
) AS $$
WITH RECURSIVE org_tree AS (
  -- Start with the given organization
  SELECT
    id,
    name,
    organization_type,
    parent_organization_id,
    0 as level
  FROM organizations
  WHERE id = p_organization_id
    AND deleted_at IS NULL

  UNION ALL

  -- Recursively get parents
  SELECT
    o.id,
    o.name,
    o.organization_type,
    o.parent_organization_id,
    ot.level + 1
  FROM organizations o
  JOIN org_tree ot ON o.id = ot.parent_organization_id
  WHERE o.deleted_at IS NULL
)
SELECT id, name, organization_type, level
FROM org_tree
ORDER BY level DESC; -- Platform first, then tenant, then org
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_organization_hierarchy IS
  'Returns full hierarchy path from organization up to platform';

-- Function: Get organization tenant
CREATE OR REPLACE FUNCTION get_organization_tenant(p_organization_id UUID)
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  WITH RECURSIVE org_tree AS (
    SELECT id, parent_organization_id, organization_type
    FROM organizations
    WHERE id = p_organization_id
      AND deleted_at IS NULL

    UNION ALL

    SELECT o.id, o.parent_organization_id, o.organization_type
    FROM organizations o
    JOIN org_tree ot ON o.id = ot.parent_organization_id
    WHERE o.deleted_at IS NULL
  )
  SELECT id INTO v_tenant_id
  FROM org_tree
  WHERE organization_type = 'tenant'
  LIMIT 1;

  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_organization_tenant IS
  'Returns the tenant UUID for any organization in hierarchy';

-- Function: Get all accessible organization IDs for a user
CREATE OR REPLACE FUNCTION get_user_accessible_organizations(p_user_id UUID)
RETURNS TABLE (organization_id UUID, access_level TEXT) AS $$
WITH RECURSIVE org_memberships AS (
  -- Direct memberships
  SELECT
    uo.organization_id,
    uo.role as access_level,
    o.parent_organization_id
  FROM user_organizations uo
  JOIN organizations o ON o.id = uo.organization_id
  WHERE uo.user_id = p_user_id
    AND uo.is_active = true
    AND o.deleted_at IS NULL

  UNION ALL

  -- Parent organizations (inherit access)
  SELECT
    o.id,
    'inherited' as access_level,
    o.parent_organization_id
  FROM organizations o
  JOIN org_memberships om ON om.parent_organization_id = o.id
  WHERE o.deleted_at IS NULL
)
SELECT DISTINCT organization_id, access_level FROM org_memberships;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION get_user_accessible_organizations IS
  'Returns all organization IDs accessible to user (direct + inherited from hierarchy)';

-- Function: Check if user can access resource
CREATE OR REPLACE FUNCTION can_user_access_resource(
  p_user_id UUID,
  p_resource_owner_org_id UUID,
  p_resource_sharing_scope sharing_scope_type
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_org_ids UUID[];
  v_resource_tenant_id UUID;
  v_user_tenant_ids UUID[];
BEGIN
  -- Platform scope: accessible to all authenticated users
  IF p_resource_sharing_scope = 'platform' THEN
    RETURN true;
  END IF;

  -- Get user's organization IDs
  SELECT array_agg(organization_id) INTO v_user_org_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  -- Organization scope: user must be in same organization
  IF p_resource_sharing_scope = 'organization' THEN
    RETURN p_resource_owner_org_id = ANY(v_user_org_ids);
  END IF;

  -- Tenant scope: user must be in same tenant hierarchy
  IF p_resource_sharing_scope = 'tenant' THEN
    -- Get resource's tenant
    SELECT get_organization_tenant(p_resource_owner_org_id) INTO v_resource_tenant_id;

    -- Get user's tenants
    SELECT array_agg(DISTINCT get_organization_tenant(organization_id))
    INTO v_user_tenant_ids
    FROM user_organizations
    WHERE user_id = p_user_id AND is_active = true;

    RETURN v_resource_tenant_id = ANY(v_user_tenant_ids);
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION can_user_access_resource IS
  'Check if user can access resource based on sharing scope (platform/tenant/organization)';

-- Function: Get accessible agents for user
CREATE OR REPLACE FUNCTION get_accessible_agents(p_user_id UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_name VARCHAR,
  agent_display_name VARCHAR,
  sharing_scope sharing_scope_type,
  owner_organization_id UUID,
  tier agent_tier,
  access_reason TEXT
) AS $$
DECLARE
  v_user_org_ids UUID[];
  v_user_tenant_ids UUID[];
BEGIN
  -- Get user's organization IDs
  SELECT array_agg(organization_id) INTO v_user_org_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  -- Get user's tenant IDs
  SELECT array_agg(DISTINCT get_organization_tenant(organization_id))
  INTO v_user_tenant_ids
  FROM user_organizations
  WHERE user_id = p_user_id AND is_active = true;

  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.display_name,
    a.sharing_scope,
    a.owner_organization_id,
    a.tier,
    CASE
      WHEN a.sharing_scope = 'platform' THEN 'platform-wide'
      WHEN a.sharing_scope = 'tenant' THEN 'tenant-wide'
      WHEN a.sharing_scope = 'organization' THEN 'organization-private'
    END as access_reason
  FROM agents a
  WHERE a.deleted_at IS NULL
    AND a.status = 'active'
    AND (
      -- Platform-wide agents
      a.sharing_scope = 'platform'

      -- Tenant-wide agents (user in same tenant)
      OR (
        a.sharing_scope = 'tenant'
        AND get_organization_tenant(a.owner_organization_id) = ANY(v_user_tenant_ids)
      )

      -- Organization-private agents (user in same org)
      OR (
        a.sharing_scope = 'organization'
        AND a.owner_organization_id = ANY(v_user_org_ids)
      )
    )
  ORDER BY a.priority DESC, a.tier, a.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_accessible_agents IS
  'Returns all agents accessible to user based on sharing scope (most common query)';

RAISE NOTICE '✓ Created helper functions';

-- ============================================================================
-- STEP 6: Create validation triggers
-- ============================================================================

-- Trigger: Validate organization hierarchy depth
CREATE OR REPLACE FUNCTION validate_organization_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_depth INTEGER;
  v_max_depth INTEGER := 3; -- Platform (1) > Tenant (2) > Organization (3)
BEGIN
  -- Count depth of hierarchy
  WITH RECURSIVE org_tree AS (
    SELECT id, parent_organization_id, 1 as depth
    FROM organizations
    WHERE id = NEW.id

    UNION ALL

    SELECT o.id, o.parent_organization_id, ot.depth + 1
    FROM organizations o
    JOIN org_tree ot ON o.id = ot.parent_organization_id
  )
  SELECT MAX(depth) INTO v_depth FROM org_tree;

  IF v_depth > v_max_depth THEN
    RAISE EXCEPTION 'Organization hierarchy cannot exceed % levels (Platform > Tenant > Organization)', v_max_depth;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_organization_hierarchy ON organizations;
CREATE TRIGGER check_organization_hierarchy
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION validate_organization_hierarchy();

COMMENT ON FUNCTION validate_organization_hierarchy IS
  'Ensures organization hierarchy does not exceed 3 levels';

RAISE NOTICE '✓ Created validation triggers';

-- ============================================================================
-- STEP 7: Create updated_at triggers
-- ============================================================================

-- Create or replace update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to organizations
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to agents (if not exists)
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to knowledge_documents
DROP TRIGGER IF EXISTS update_knowledge_updated_at ON knowledge_documents;
CREATE TRIGGER update_knowledge_updated_at
  BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

RAISE NOTICE '✓ Created updated_at triggers';

-- ============================================================================
-- STEP 8: Create materialized view for organization stats
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS organization_stats AS
SELECT
  o.id as organization_id,
  o.name as organization_name,
  o.organization_type,
  o.slug,
  p.name as parent_organization_name,

  -- Agent counts
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'organization') as private_agents_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'tenant') as tenant_agents_count,
  COUNT(DISTINCT a.id) FILTER (WHERE a.sharing_scope = 'platform') as platform_agents_count,
  COUNT(DISTINCT a.id) as total_agents_count,

  -- Other resource counts
  COUNT(DISTINCT kd.id) as knowledge_docs_count,
  COUNT(DISTINCT c.id) as conversations_count,
  COUNT(DISTINCT uo.user_id) as active_users_count,

  -- Last activity
  MAX(c.created_at) as last_conversation_at,
  MAX(a.created_at) as last_agent_created_at,

  NOW() as refreshed_at

FROM organizations o
LEFT JOIN organizations p ON o.parent_organization_id = p.id
LEFT JOIN agents a ON a.owner_organization_id = o.id AND a.deleted_at IS NULL
LEFT JOIN knowledge_documents kd ON kd.owner_organization_id = o.id AND kd.deleted_at IS NULL
LEFT JOIN conversations c ON c.owner_organization_id = o.id AND c.deleted_at IS NULL
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.is_active = true
WHERE o.deleted_at IS NULL
GROUP BY o.id, o.name, o.organization_type, o.slug, p.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_stats_org_id ON organization_stats(organization_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_organization_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY organization_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW organization_stats IS
  'Aggregated statistics per organization (refresh with refresh_organization_stats())';

RAISE NOTICE '✓ Created materialized view organization_stats';

-- ============================================================================
-- STEP 9: Final validation
-- ============================================================================

DO $$
DECLARE
  v_platform_count INTEGER;
  v_tenant_count INTEGER;
  v_org_count INTEGER;
  v_orphaned_orgs INTEGER;
  v_invalid_hierarchy INTEGER;
  v_null_slugs INTEGER;
  v_duplicate_slugs INTEGER;
  v_agents_null_owner INTEGER;
  v_agents_null_scope INTEGER;
  v_missing_indexes INTEGER;
BEGIN
  -- Count organizations
  SELECT COUNT(*) INTO v_platform_count
  FROM organizations WHERE organization_type = 'platform' AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_tenant_count
  FROM organizations WHERE organization_type = 'tenant' AND deleted_at IS NULL;

  SELECT COUNT(*) INTO v_org_count
  FROM organizations WHERE organization_type = 'organization' AND deleted_at IS NULL;

  -- Check for orphaned organizations (no parent, but not platform)
  SELECT COUNT(*) INTO v_orphaned_orgs
  FROM organizations
  WHERE organization_type != 'platform'
    AND parent_organization_id IS NULL
    AND deleted_at IS NULL;

  -- Check for NULL slugs
  SELECT COUNT(*) INTO v_null_slugs
  FROM organizations
  WHERE slug IS NULL OR slug = ''
    AND deleted_at IS NULL;

  -- Check for duplicate slugs
  SELECT COUNT(*) INTO v_duplicate_slugs
  FROM (
    SELECT slug FROM organizations
    WHERE deleted_at IS NULL
    GROUP BY slug HAVING COUNT(*) > 1
  ) dups;

  -- Check agents
  SELECT COUNT(*) INTO v_agents_null_owner
  FROM agents WHERE owner_organization_id IS NULL;

  SELECT COUNT(*) INTO v_agents_null_scope
  FROM agents WHERE sharing_scope IS NULL;

  -- Validation summary
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ PHASE 3 MIGRATION COMPLETED';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Organization Summary:';
  RAISE NOTICE '  - Platform: %', v_platform_count;
  RAISE NOTICE '  - Tenants: %', v_tenant_count;
  RAISE NOTICE '  - Organizations: %', v_org_count;
  RAISE NOTICE '';

  -- Warnings
  IF v_orphaned_orgs > 0 THEN
    RAISE WARNING '⚠ WARNING: % orphaned organizations (non-platform with no parent)', v_orphaned_orgs;
  END IF;

  IF v_null_slugs > 0 THEN
    RAISE WARNING '⚠ WARNING: % organizations with NULL slugs', v_null_slugs;
  END IF;

  IF v_duplicate_slugs > 0 THEN
    RAISE WARNING '⚠ WARNING: % duplicate slugs found', v_duplicate_slugs;
  END IF;

  IF v_agents_null_owner > 0 THEN
    RAISE WARNING '⚠ WARNING: % agents with NULL owner_organization_id', v_agents_null_owner;
  END IF;

  IF v_agents_null_scope > 0 THEN
    RAISE WARNING '⚠ WARNING: % agents with NULL sharing_scope', v_agents_null_scope;
  END IF;

  -- Success conditions
  IF v_platform_count > 0 AND v_orphaned_orgs = 0 AND
     v_null_slugs = 0 AND v_agents_null_owner = 0 AND v_agents_null_scope = 0 THEN
    RAISE NOTICE '✅ All validations passed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema is ready for:';
    RAISE NOTICE '  - RLS policy updates (Phase 4)';
    RAISE NOTICE '  - Application code migration';
    RAISE NOTICE '  - Testing data isolation';
  ELSE
    RAISE WARNING '⚠ Some validations failed - review warnings above';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Available Helper Functions:';
  RAISE NOTICE '  - get_organization_hierarchy(org_id)';
  RAISE NOTICE '  - get_organization_tenant(org_id)';
  RAISE NOTICE '  - get_user_accessible_organizations(user_id)';
  RAISE NOTICE '  - can_user_access_resource(user_id, owner_org_id, scope)';
  RAISE NOTICE '  - get_accessible_agents(user_id)';
  RAISE NOTICE '  - refresh_organization_stats()';
  RAISE NOTICE '';
END$$;

COMMIT;

-- ============================================================================
-- TEST QUERIES (run separately to test helper functions)
-- ============================================================================
/*

-- Test get_organization_hierarchy
SELECT * FROM get_organization_hierarchy(
  (SELECT id FROM organizations WHERE slug = 'novartis' LIMIT 1)
);

-- Test get_organization_tenant
SELECT get_organization_tenant(
  (SELECT id FROM organizations WHERE slug = 'novartis' LIMIT 1)
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
);

-- Refresh organization stats
SELECT refresh_organization_stats();
SELECT * FROM organization_stats ORDER BY organization_type, organization_name;

*/
