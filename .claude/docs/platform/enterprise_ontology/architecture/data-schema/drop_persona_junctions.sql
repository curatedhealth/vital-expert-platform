-- =====================================================================
-- DROP EXISTING PERSONA JUNCTION TABLES
-- Clears out any existing persona junction tables that might have schema issues
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DROPPING EXISTING PERSONA JUNCTION TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    
    -- Drop all persona junction tables
    DROP TABLE IF EXISTS public.persona_responsibilities CASCADE;
    DROP TABLE IF EXISTS public.persona_tools CASCADE;
    DROP TABLE IF EXISTS public.persona_skills CASCADE;
    DROP TABLE IF EXISTS public.persona_stakeholders CASCADE;
    DROP TABLE IF EXISTS public.persona_ai_maturity CASCADE;
    DROP TABLE IF EXISTS public.persona_vpanes_scores CASCADE;
    DROP TABLE IF EXISTS public.persona_goals CASCADE;
    DROP TABLE IF EXISTS public.persona_pain_points CASCADE;
    DROP TABLE IF EXISTS public.persona_challenges CASCADE;
    DROP TABLE IF EXISTS public.persona_tenants CASCADE;
    DROP TABLE IF EXISTS public.persona_gen_ai_barriers CASCADE;
    DROP TABLE IF EXISTS public.persona_gen_ai_enablers CASCADE;
    
    RAISE NOTICE '✓ Dropped all existing persona junction tables';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now run create_persona_junctions.sql safely!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

