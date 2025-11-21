-- ============================================================================
-- UPDATE TENANT LOGOS
-- ============================================================================
-- Updates existing tenant configurations with logo URLs
-- ============================================================================

-- Update VITAL Expert Platform logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/vital-expert.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'vital-system'
);

-- Update Digital Health logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/digital-health.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'digital-health'
);

-- Update Pharmaceuticals logo
UPDATE public.tenant_configurations
SET ui_config = jsonb_set(
    ui_config,
    '{logo_url}',
    '"/logos/pharmaceuticals.png"'
)
WHERE tenant_id IN (
    SELECT id FROM public.organizations WHERE tenant_key = 'pharma'
);

-- Verify updates
SELECT
    o.name as tenant_name,
    o.tenant_key,
    tc.ui_config->>'logo_url' as logo_url
FROM public.organizations o
JOIN public.tenant_configurations tc ON tc.tenant_id = o.id
WHERE o.tenant_type IN ('system', 'digital_health', 'pharmaceuticals')
ORDER BY o.name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Tenant logos updated successfully!';
    RAISE NOTICE '   - VITAL Expert Platform: /logos/vital-expert.png';
    RAISE NOTICE '   - Digital Health: /logos/digital-health.png';
    RAISE NOTICE '   - Pharmaceuticals: /logos/pharmaceuticals.png';
END $$;
