-- ============================================================================
-- REASSIGN PROMPTS TO CORRECT SUITES - Using category, domain, tags, metadata
-- ============================================================================
-- Purpose: Properly distribute 1,000 prompts across 10 PRISM suites using
-- existing categorization fields (category, domain, tags, metadata)
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- First, check if prompts have category, domain, tags columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompts'
    AND column_name IN ('category', 'domain', 'tags', 'metadata')
  ) THEN

    -- Reassign suites based on multiple fields for better accuracy
    WITH suite_updates AS (
      SELECT
        id,
        CASE
          -- RULES™ - Regulatory
          WHEN
            LOWER(category) LIKE '%regulatory%' OR
            LOWER(domain) LIKE '%regulatory%' OR
            LOWER(name) LIKE '%regulatory%' OR LOWER(name) LIKE '%fda%' OR LOWER(name) LIKE '%ema%' OR LOWER(name) LIKE '%compliance%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'rules' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%regulatory%' OR LOWER(tag) LIKE '%compliance%')
          THEN 'RULES™'

          -- TRIALS™ - Clinical
          WHEN
            LOWER(category) LIKE '%clinical%' OR
            LOWER(domain) LIKE '%clinical%' OR
            LOWER(name) LIKE '%clinical%' OR LOWER(name) LIKE '%trial%' OR LOWER(name) LIKE '%protocol%' OR LOWER(name) LIKE '%study%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'trials' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%clinical%' OR LOWER(tag) LIKE '%trial%')
          THEN 'TRIALS™'

          -- GUARD™ - Safety
          WHEN
            LOWER(category) LIKE '%safety%' OR
            LOWER(domain) LIKE '%safety%' OR
            LOWER(name) LIKE '%safety%' OR LOWER(name) LIKE '%pharmacovigilance%' OR LOWER(name) LIKE '%adverse%' OR LOWER(name) LIKE '%pv%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'guard' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%safety%' OR LOWER(tag) LIKE '%pharmacovig%')
          THEN 'GUARD™'

          -- VALUE™ - HEOR / Market Access
          WHEN
            LOWER(category) LIKE '%heor%' OR LOWER(category) LIKE '%market%' OR LOWER(category) LIKE '%commercial%' OR
            LOWER(domain) LIKE '%heor%' OR LOWER(domain) LIKE '%commercial%' OR
            LOWER(name) LIKE '%heor%' OR LOWER(name) LIKE '%payer%' OR LOWER(name) LIKE '%market access%' OR LOWER(name) LIKE '%value%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'value' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%heor%' OR LOWER(tag) LIKE '%payer%')
          THEN 'VALUE™'

          -- BRIDGE™ - Medical Affairs / Stakeholder Engagement
          WHEN
            LOWER(category) LIKE '%medical affairs%' OR LOWER(category) LIKE '%engagement%' OR
            LOWER(domain) LIKE '%medical affairs%' OR
            LOWER(name) LIKE '%medical affairs%' OR LOWER(name) LIKE '%kol%' OR LOWER(name) LIKE '%msl%' OR LOWER(name) LIKE '%stakeholder%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'bridge' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%medical affairs%' OR LOWER(tag) LIKE '%kol%')
          THEN 'BRIDGE™'

          -- PROOF™ - Analytics / Evidence / Data
          WHEN
            LOWER(category) LIKE '%analytics%' OR LOWER(category) LIKE '%data%' OR LOWER(category) LIKE '%evidence%' OR
            LOWER(domain) LIKE '%analytics%' OR LOWER(domain) LIKE '%data%' OR
            LOWER(name) LIKE '%analytics%' OR LOWER(name) LIKE '%data%' OR LOWER(name) LIKE '%evidence%' OR LOWER(name) LIKE '%rwe%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'proof' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%analytics%' OR LOWER(tag) LIKE '%data%' OR LOWER(tag) LIKE '%evidence%')
          THEN 'PROOF™'

          -- CRAFT™ - Medical Writing / Publications
          WHEN
            LOWER(category) LIKE '%writing%' OR LOWER(category) LIKE '%publication%' OR
            LOWER(domain) LIKE '%writing%' OR
            LOWER(name) LIKE '%writing%' OR LOWER(name) LIKE '%publication%' OR LOWER(name) LIKE '%manuscript%' OR LOWER(name) LIKE '%document%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'craft' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%writing%' OR LOWER(tag) LIKE '%publication%')
          THEN 'CRAFT™'

          -- SCOUT™ - Competitive Intelligence
          WHEN
            LOWER(category) LIKE '%competitive%' OR LOWER(category) LIKE '%intelligence%' OR
            LOWER(domain) LIKE '%competitive%' OR LOWER(domain) LIKE '%intelligence%' OR
            LOWER(name) LIKE '%competitive%' OR LOWER(name) LIKE '%intelligence%' OR LOWER(name) LIKE '%market analysis%' OR LOWER(name) LIKE '%landscape%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'scout' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%competitive%' OR LOWER(tag) LIKE '%intelligence%')
          THEN 'SCOUT™'

          -- PROJECT™ - Project Management / Operations
          WHEN
            LOWER(category) LIKE '%project%' OR LOWER(category) LIKE '%management%' OR LOWER(category) LIKE '%operations%' OR
            LOWER(domain) LIKE '%operations%' OR LOWER(domain) LIKE '%project%' OR
            LOWER(name) LIKE '%project%' OR LOWER(name) LIKE '%management%' OR LOWER(name) LIKE '%portfolio%' OR LOWER(name) LIKE '%planning%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'project' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%project%' OR LOWER(tag) LIKE '%management%')
          THEN 'PROJECT™'

          -- FORGE™ - Digital Health / DTx
          WHEN
            LOWER(category) LIKE '%digital%' OR LOWER(category) LIKE '%dtx%' OR
            LOWER(domain) LIKE '%digital%' OR
            LOWER(name) LIKE '%digital%' OR LOWER(name) LIKE '%dtx%' OR LOWER(name) LIKE '%samd%' OR LOWER(name) LIKE '%app%' OR
            LOWER(COALESCE((metadata->>'suite')::TEXT, '')) = 'forge' OR
            EXISTS (SELECT 1 FROM unnest(tags) tag WHERE LOWER(tag) LIKE '%digital%' OR LOWER(tag) LIKE '%dtx%')
          THEN 'FORGE™'

          -- Default: Distribute remaining based on general category
          WHEN LOWER(category) LIKE '%general%' THEN
            CASE (id::text::bigint % 10)
              WHEN 0 THEN 'RULES™'
              WHEN 1 THEN 'TRIALS™'
              WHEN 2 THEN 'GUARD™'
              WHEN 3 THEN 'VALUE™'
              WHEN 4 THEN 'BRIDGE™'
              WHEN 5 THEN 'PROOF™'
              WHEN 6 THEN 'CRAFT™'
              WHEN 7 THEN 'SCOUT™'
              WHEN 8 THEN 'PROJECT™'
              ELSE 'FORGE™'
            END
          ELSE 'RULES™'
        END as assigned_suite
      FROM prompts
      WHERE status = 'active'
    )
    UPDATE prompts p
    SET suite = su.assigned_suite
    FROM suite_updates su
    WHERE p.id = su.id;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Reassigned suites for % prompts', updated_count;

  ELSE
    RAISE NOTICE '⚠️  Required columns (category, domain, tags, metadata) not found';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION REPORT
-- ============================================================================

DO $$
DECLARE
  suite_record RECORD;
  total_prompts INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_prompts FROM prompts WHERE status = 'active';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUITE REASSIGNMENT COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Active Prompts: %', total_prompts;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Distribution by Suite:';
  RAISE NOTICE '----------------------------------------';

  FOR suite_record IN
    SELECT
      suite,
      COUNT(*) as prompt_count,
      ROUND(COUNT(*) * 100.0 / total_prompts, 1) as percentage
    FROM prompts
    WHERE status = 'active' AND suite IS NOT NULL
    GROUP BY suite
    ORDER BY suite
  LOOP
    RAISE NOTICE '% % prompts (%%)',
      RPAD(suite_record.suite, 12),
      LPAD(suite_record.prompt_count::text, 4),
      LPAD(suite_record.percentage::text, 5);
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Frontend ready at: /prism';
  RAISE NOTICE '========================================';
END $$;
