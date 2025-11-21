-- ============================================================================
-- Assign Personas to Pharmaceuticals Tenant
-- ============================================================================

DO $$
DECLARE
  v_platform_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
  v_pharma_tenant_id UUID;
  v_personas_added INT := 0;
BEGIN
  -- Get Pharmaceuticals tenant ID
  SELECT id INTO v_pharma_tenant_id
  FROM public.tenants
  WHERE slug = 'pharmaceuticals';

  IF v_pharma_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Pharmaceuticals tenant not found';
  END IF;

  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '👤 ASSIGNING PERSONAS TO PHARMACEUTICALS';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Platform Tenant ID: %', v_platform_tenant_id;
  RAISE NOTICE 'Pharma Tenant ID: %', v_pharma_tenant_id;
  RAISE NOTICE '';

  -- Delete existing personas for pharma tenant
  DELETE FROM public.personas WHERE tenant_id = v_pharma_tenant_id;

  -- Copy Personas from Platform to Pharma
  INSERT INTO public.personas (
    id, name, slug, description, avatar_url, metadata, tenant_id, created_at, updated_at
  )
  SELECT
    gen_random_uuid(),
    name, slug, description, avatar_url, metadata,
    v_pharma_tenant_id,
    created_at, updated_at
  FROM public.personas
  WHERE tenant_id = v_platform_tenant_id;

  GET DIAGNOSTICS v_personas_added = ROW_COUNT;

  RAISE NOTICE '✅ Added % personas to Pharmaceuticals', v_personas_added;
  RAISE NOTICE '════════════════════════════════════════════════════════════════';

END $$;
