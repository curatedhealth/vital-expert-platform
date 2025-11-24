-- ============================================================================
-- Share Organizational Structure Data (V2 - Copy Approach)
-- ============================================================================
-- Copies ALL existing org structure data to:
-- - VITAL Platform
-- - Pharmaceuticals
-- - Digital Health Startup
-- ============================================================================

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_digital_health_tenant_id UUID;
  v_tenant_id UUID;
  v_tenant_name TEXT;
  v_record RECORD;
  v_old_function_id UUID;
  v_new_function_id UUID;
  v_old_dept_id UUID;
  v_new_dept_id UUID;
  v_function_id_map JSONB := '{}';
  v_dept_id_map JSONB := '{}';
  v_functions_copied INT := 0;
  v_departments_copied INT := 0;
  v_roles_copied INT := 0;
BEGIN
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🔄 ORGANIZATIONAL STRUCTURE DATA SHARING (COPY METHOD)';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
  RAISE NOTICE '';

  -- Get tenant IDs
  SELECT id INTO v_pharma_tenant_id
  FROM public.tenants
  WHERE slug = 'pharmaceuticals';

  SELECT id INTO v_digital_health_tenant_id
  FROM public.tenants
  WHERE slug = 'digital-health-startup';

  IF v_pharma_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Pharmaceuticals tenant not found';
  END IF;

  IF v_digital_health_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Digital Health Startup tenant not found';
  END IF;

  RAISE NOTICE 'Pharma Tenant ID: %', v_pharma_tenant_id;
  RAISE NOTICE 'Digital Health Tenant ID: %', v_digital_health_tenant_id;
  RAISE NOTICE '';

  -- Process each target tenant (INCLUDING platform)
  FOR v_tenant_id, v_tenant_name IN
    SELECT id, name FROM public.tenants
    WHERE id IN (v_platform_tenant_id, v_pharma_tenant_id, v_digital_health_tenant_id)
    ORDER BY
      CASE
        WHEN id = v_platform_tenant_id THEN 1
        ELSE 2
      END, name
  LOOP
    RAISE NOTICE '════════════════════════════════════════════════════════════════';
    RAISE NOTICE '📋 Processing: %', v_tenant_name;
    RAISE NOTICE '════════════════════════════════════════════════════════════════';

    -- Reset ID maps for this tenant
    v_function_id_map := '{}';
    v_dept_id_map := '{}';
    v_functions_copied := 0;
    v_departments_copied := 0;
    v_roles_copied := 0;

    -- 1. Copy Functions from ALL source tenants
    RAISE NOTICE '🏢 Copying functions...';
    DELETE FROM public.org_functions WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT DISTINCT ON (name) *
      FROM public.org_functions
      WHERE tenant_id != v_tenant_id
      ORDER BY name, created_at
    LOOP
      v_old_function_id := v_record.id;
      v_new_function_id := gen_random_uuid();

      -- Store ID mapping
      v_function_id_map := v_function_id_map || jsonb_build_object(v_old_function_id::text, v_new_function_id::text);

      INSERT INTO public.org_functions (
        id, tenant_id, name, slug, description, parent_id, icon, color,
        sort_order, is_active, created_at, updated_at, deleted_at,
        geographic_scope, ta_focus, strategic_priority
      ) VALUES (
        v_new_function_id, v_tenant_id, v_record.name, v_record.slug,
        v_record.description, v_record.parent_id, v_record.icon, v_record.color,
        v_record.sort_order, v_record.is_active, v_record.created_at, v_record.updated_at,
        v_record.deleted_at, v_record.geographic_scope, v_record.ta_focus,
        v_record.strategic_priority
      );

      GET DIAGNOSTICS v_functions_copied = ROW_COUNT;
      IF v_functions_copied > 0 THEN
        v_functions_copied := v_functions_copied + 1;
      END IF;
    END LOOP;

    SELECT COUNT(*) INTO v_functions_copied FROM public.org_functions WHERE tenant_id = v_tenant_id;
    RAISE NOTICE '   ✅ % functions', v_functions_copied;

    -- 2. Copy Departments from ALL source tenants
    RAISE NOTICE '🏬 Copying departments...';
    DELETE FROM public.org_departments WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT DISTINCT ON (name) *
      FROM public.org_departments
      WHERE tenant_id != v_tenant_id
      ORDER BY name, created_at
    LOOP
      v_old_dept_id := v_record.id;
      v_new_dept_id := gen_random_uuid();

      -- Store ID mapping
      v_dept_id_map := v_dept_id_map || jsonb_build_object(v_old_dept_id::text, v_new_dept_id::text);

      -- Map function_id if it exists
      v_new_function_id := NULL;
      IF v_record.function_id IS NOT NULL THEN
        v_new_function_id := (v_function_id_map ->> v_record.function_id::text)::uuid;
      END IF;

      INSERT INTO public.org_departments (
        id, tenant_id, name, slug, description, is_active,
        created_at, updated_at, deleted_at, function_id,
        geographic_scope, ta_focus, typical_team_size_min, typical_team_size_max
      ) VALUES (
        v_new_dept_id, v_tenant_id, v_record.name, v_record.slug,
        v_record.description, v_record.is_active, v_record.created_at,
        v_record.updated_at, v_record.deleted_at, v_new_function_id,
        v_record.geographic_scope, v_record.ta_focus,
        v_record.typical_team_size_min, v_record.typical_team_size_max
      );
    END LOOP;

    SELECT COUNT(*) INTO v_departments_copied FROM public.org_departments WHERE tenant_id = v_tenant_id;
    RAISE NOTICE '   ✅ % departments', v_departments_copied;

    -- 3. Copy Roles from ALL source tenants
    RAISE NOTICE '👔 Copying roles...';
    DELETE FROM public.org_roles WHERE tenant_id = v_tenant_id;

    FOR v_record IN
      SELECT DISTINCT ON (name) *
      FROM public.org_roles
      WHERE tenant_id != v_tenant_id
      ORDER BY name, created_at
    LOOP
      -- Map function_id if it exists
      v_new_function_id := NULL;
      IF v_record.function_id IS NOT NULL THEN
        v_new_function_id := (v_function_id_map ->> v_record.function_id::text)::uuid;
      END IF;

      -- Map department_id if it exists
      v_new_dept_id := NULL;
      IF v_record.department_id IS NOT NULL THEN
        v_new_dept_id := (v_dept_id_map ->> v_record.department_id::text)::uuid;
      END IF;

      INSERT INTO public.org_roles (
        id, tenant_id, name, slug, description, seniority_level,
        reports_to_role_id, is_active, created_at, updated_at, deleted_at,
        function_id, department_id, leadership_level, leadership_level_description,
        geographic_scope, geographic_regions, therapeutic_areas, disease_areas,
        ta_focus, applicable_company_sizes, applicable_company_types,
        minimum_company_size, typical_team_size_min, typical_team_size_max,
        direct_reports_min, direct_reports_max, span_of_control,
        budget_authority_min, budget_authority_max, budget_currency,
        budget_responsibility_type, years_experience_min, years_experience_max,
        typical_background, required_credentials, preferred_credentials,
        product_focus, product_lifecycle_stage, number_of_products_managed,
        internal_stakeholders, external_stakeholders, key_relationships,
        role_type, role_category, is_field_based, is_remote_eligible,
        travel_percentage, reports_to_primary, reports_to_dotted_line,
        matrix_relationships, kpi_categories, success_metrics,
        decision_authority_level, regulatory_oversight, compliance_responsibilities,
        regulatory_interactions, commercial_alignment, market_segment,
        payer_interaction_level, technology_platforms, digital_tools,
        data_analytics_level, career_level, career_path_from, career_path_to,
        typical_tenure_years, ta_complexity, revenue_range_min, revenue_range_max,
        indirect_reports_min, indirect_reports_max, years_in_pharma_min,
        years_in_medical_affairs_min, years_in_leadership_min, pipeline_exposure,
        products_supported_min, products_supported_max, reports_to,
        dotted_line_reports_to, team_size_min, team_size_max, layers_below,
        years_total_min, years_total_max, years_industry_min, years_function_min,
        degree_level_minimum, budget_min_usd, budget_max_usd, budget_authority_type,
        controls_headcount, controls_contractors, approval_limits,
        base_salary_min_usd, base_salary_max_usd, total_comp_min_usd,
        total_comp_max_usd, equity_eligible, bonus_target_percentage,
        ltip_eligible, geographic_scope_type, geographic_primary_region,
        typical_prior_role, typical_next_role, time_in_role_years_min,
        time_in_role_years_max, travel_percentage_min, travel_percentage_max,
        international_travel, overnight_travel_frequency
      ) VALUES (
        gen_random_uuid(), v_tenant_id, v_record.name, v_record.slug,
        v_record.description, v_record.seniority_level, v_record.reports_to_role_id,
        v_record.is_active, v_record.created_at, v_record.updated_at, v_record.deleted_at,
        v_new_function_id, v_new_dept_id, v_record.leadership_level,
        v_record.leadership_level_description, v_record.geographic_scope,
        v_record.geographic_regions, v_record.therapeutic_areas, v_record.disease_areas,
        v_record.ta_focus, v_record.applicable_company_sizes, v_record.applicable_company_types,
        v_record.minimum_company_size, v_record.typical_team_size_min,
        v_record.typical_team_size_max, v_record.direct_reports_min,
        v_record.direct_reports_max, v_record.span_of_control,
        v_record.budget_authority_min, v_record.budget_authority_max,
        v_record.budget_currency, v_record.budget_responsibility_type,
        v_record.years_experience_min, v_record.years_experience_max,
        v_record.typical_background, v_record.required_credentials,
        v_record.preferred_credentials, v_record.product_focus,
        v_record.product_lifecycle_stage, v_record.number_of_products_managed,
        v_record.internal_stakeholders, v_record.external_stakeholders,
        v_record.key_relationships, v_record.role_type, v_record.role_category,
        v_record.is_field_based, v_record.is_remote_eligible, v_record.travel_percentage,
        v_record.reports_to_primary, v_record.reports_to_dotted_line,
        v_record.matrix_relationships, v_record.kpi_categories, v_record.success_metrics,
        v_record.decision_authority_level, v_record.regulatory_oversight,
        v_record.compliance_responsibilities, v_record.regulatory_interactions,
        v_record.commercial_alignment, v_record.market_segment,
        v_record.payer_interaction_level, v_record.technology_platforms,
        v_record.digital_tools, v_record.data_analytics_level, v_record.career_level,
        v_record.career_path_from, v_record.career_path_to, v_record.typical_tenure_years,
        v_record.ta_complexity, v_record.revenue_range_min, v_record.revenue_range_max,
        v_record.indirect_reports_min, v_record.indirect_reports_max,
        v_record.years_in_pharma_min, v_record.years_in_medical_affairs_min,
        v_record.years_in_leadership_min, v_record.pipeline_exposure,
        v_record.products_supported_min, v_record.products_supported_max,
        v_record.reports_to, v_record.dotted_line_reports_to, v_record.team_size_min,
        v_record.team_size_max, v_record.layers_below, v_record.years_total_min,
        v_record.years_total_max, v_record.years_industry_min, v_record.years_function_min,
        v_record.degree_level_minimum, v_record.budget_min_usd, v_record.budget_max_usd,
        v_record.budget_authority_type, v_record.controls_headcount,
        v_record.controls_contractors, v_record.approval_limits,
        v_record.base_salary_min_usd, v_record.base_salary_max_usd,
        v_record.total_comp_min_usd, v_record.total_comp_max_usd, v_record.equity_eligible,
        v_record.bonus_target_percentage, v_record.ltip_eligible,
        v_record.geographic_scope_type, v_record.geographic_primary_region,
        v_record.typical_prior_role, v_record.typical_next_role,
        v_record.time_in_role_years_min, v_record.time_in_role_years_max,
        v_record.travel_percentage_min, v_record.travel_percentage_max,
        v_record.international_travel, v_record.overnight_travel_frequency
      );
    END LOOP;

    SELECT COUNT(*) INTO v_roles_copied FROM public.org_roles WHERE tenant_id = v_tenant_id;
    RAISE NOTICE '   ✅ % roles', v_roles_copied;

    RAISE NOTICE '';
  END LOOP;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ Organizational structure successfully shared with all tenants';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;

-- Verification Query
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 VERIFICATION - ORGANIZATIONAL STRUCTURE DISTRIBUTION';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;

SELECT
  t.name as tenant_name,
  t.slug as tenant_slug,
  (SELECT COUNT(*) FROM public.org_functions WHERE tenant_id = t.id) as functions,
  (SELECT COUNT(*) FROM public.org_departments WHERE tenant_id = t.id) as departments,
  (SELECT COUNT(*) FROM public.org_roles WHERE tenant_id = t.id) as roles,
  (SELECT COUNT(*) FROM public.org_functions WHERE tenant_id = t.id) +
  (SELECT COUNT(*) FROM public.org_departments WHERE tenant_id = t.id) +
  (SELECT COUNT(*) FROM public.org_roles WHERE tenant_id = t.id) as total_items
FROM public.tenants t
WHERE t.slug IN ('vital-platform', 'pharmaceuticals', 'digital-health-startup')
ORDER BY total_items DESC;
