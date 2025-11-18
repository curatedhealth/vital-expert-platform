-- ============================================================================
-- EVENLY DISTRIBUTE PROMPTS ACROSS 10 SUITES
-- ============================================================================
-- Purpose: Distribute prompts evenly across all 10 PRISM suites
-- Uses modulo-based distribution for even split
-- ============================================================================

DO $$
DECLARE
  updated_count INTEGER := 0;
  prompt_record RECORD;
  suite_names TEXT[] := ARRAY[
    'RULES™',
    'TRIALS™',
    'GUARD™',
    'VALUE™',
    'BRIDGE™',
    'PROOF™',
    'CRAFT™',
    'SCOUT™',
    'PROJECT™',
    'FORGE™'
  ];
  counter INTEGER := 0;
BEGIN
  -- Distribute prompts evenly using round-robin assignment
  FOR prompt_record IN
    SELECT id FROM prompts WHERE status = 'active' ORDER BY created_at
  LOOP
    UPDATE prompts
    SET suite = suite_names[(counter % 10) + 1]
    WHERE id = prompt_record.id;

    counter := counter + 1;
  END LOOP;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Evenly distributed % prompts across 10 suites', updated_count;
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
  RAISE NOTICE '✅ SUITE DISTRIBUTION COMPLETE!';
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
    RAISE NOTICE '%: % prompts (%)',
      suite_record.suite,
      suite_record.prompt_count,
      suite_record.percentage || '%';
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Frontend ready at: /prism';
  RAISE NOTICE '========================================';
END $$;
