-- Subdomain-based Multitenancy Migration
-- Adds function to fetch tenant context by tenant_key (subdomain)

/**
 * Get Tenant Context by Tenant Key (Subdomain)
 *
 * This function loads tenant data based on the subdomain/tenant_key
 * instead of the user's organization assignment.
 *
 * Allows any authenticated user to access any tenant based on subdomain.
 *
 * @param p_tenant_key - The tenant key (e.g., 'system', 'digital_health', 'pharmaceuticals')
 * @param p_user_id - The authenticated user's ID (for audit/logging)
 * @returns JSONB with organization, config, apps, and features
 */
CREATE OR REPLACE FUNCTION get_tenant_context_by_key(
  p_tenant_key TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_tenant_id UUID;
BEGIN
  -- Find the organization by tenant_key
  SELECT id INTO v_tenant_id
  FROM organizations
  WHERE tenant_key = p_tenant_key
    AND is_active = true
  LIMIT 1;

  -- If no tenant found, return empty object
  IF v_tenant_id IS NULL THEN
    RAISE WARNING 'Tenant not found for key: %', p_tenant_key;
    RETURN '{}'::jsonb;
  END IF;

  -- Build the complete tenant context
  SELECT jsonb_build_object(
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'slug', o.slug,
      'tenant_type', o.tenant_type,
      'tenant_key', o.tenant_key,
      'is_active', o.is_active,
      'created_at', o.created_at
    ),
    'config', COALESCE(
      jsonb_build_object(
        'id', tc.id,
        'tenant_id', tc.tenant_id,
        'ui_config', tc.ui_config,
        'enabled_features', tc.enabled_features,
        'enabled_apps', tc.enabled_apps,
        'enabled_agent_tiers', tc.enabled_agent_tiers,
        'limits', tc.limits,
        'compliance_settings', tc.compliance_settings
      ),
      '{}'::jsonb
    ),
    'apps', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ta.id,
            'tenant_id', ta.tenant_id,
            'app_key', ta.app_key,
            'app_name', ta.app_name,
            'app_description', ta.app_description,
            'app_icon', ta.app_icon,
            'app_route', ta.app_route,
            'is_enabled', ta.is_enabled,
            'is_visible', ta.is_visible,
            'display_order', ta.display_order,
            'required_role', ta.required_role,
            'config', ta.config
          )
          ORDER BY ta.display_order ASC
        )
        FROM tenant_apps ta
        WHERE ta.tenant_id = v_tenant_id
          AND ta.is_enabled = true
      ),
      '[]'::jsonb
    ),
    'features', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', tff.id,
            'tenant_id', tff.tenant_id,
            'feature_flag_id', tff.feature_flag_id,
            'flag_key', ff.flag_key,
            'name', ff.name,
            'description', ff.description,
            'enabled', tff.enabled,
            'config', tff.config
          )
        )
        FROM tenant_feature_flags tff
        JOIN feature_flags ff ON ff.id = tff.feature_flag_id
        WHERE tff.tenant_id = v_tenant_id
      ),
      '[]'::jsonb
    ),
    'user', CASE
      WHEN p_user_id IS NOT NULL THEN
        COALESCE(
          (
            SELECT jsonb_build_object(
              'id', p.id,
              'email', p.email,
              'full_name', p.full_name,
              'role', p.role,
              'tenant_id', p.tenant_id
            )
            FROM profiles p
            WHERE p.id = p_user_id
          ),
          '{}'::jsonb
        )
      ELSE
        '{}'::jsonb
    END
  )
  INTO v_result
  FROM organizations o
  LEFT JOIN tenant_configurations tc ON tc.tenant_id = o.id
  WHERE o.id = v_tenant_id;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_tenant_context_by_key(TEXT, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_tenant_context_by_key IS
  'Fetches tenant context based on tenant_key (subdomain) for subdomain-based multitenancy';

-- Add index on tenant_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_key
ON organizations(tenant_key)
WHERE is_active = true;

-- Validation: Test the function
DO $$
DECLARE
  v_system_context JSONB;
  v_digital_health_context JSONB;
  v_pharma_context JSONB;
BEGIN
  -- Test system tenant (tenant_key = 'vital-system')
  SELECT get_tenant_context_by_key('vital-system', NULL) INTO v_system_context;
  IF v_system_context IS NULL OR v_system_context = '{}'::jsonb THEN
    RAISE WARNING 'VITAL System tenant context is empty';
  ELSE
    RAISE NOTICE 'VITAL System tenant loaded successfully';
  END IF;

  -- Test digital_health tenant (tenant_key = 'digital-health')
  SELECT get_tenant_context_by_key('digital-health', NULL) INTO v_digital_health_context;
  IF v_digital_health_context IS NULL OR v_digital_health_context = '{}'::jsonb THEN
    RAISE WARNING 'Digital Health tenant context is empty';
  ELSE
    RAISE NOTICE 'Digital Health tenant loaded successfully';
  END IF;

  -- Test pharmaceuticals tenant (tenant_key = 'pharma')
  SELECT get_tenant_context_by_key('pharma', NULL) INTO v_pharma_context;
  IF v_pharma_context IS NULL OR v_pharma_context = '{}'::jsonb THEN
    RAISE WARNING 'Pharmaceuticals tenant context is empty';
  ELSE
    RAISE NOTICE 'Pharmaceuticals tenant loaded successfully';
  END IF;
END $$;
