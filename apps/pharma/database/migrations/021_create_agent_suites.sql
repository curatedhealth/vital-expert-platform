-- ============================================================================
-- Migration: Create Themed Agent Suites (Suites Only)
-- Description: Create professional agent suites structure
-- Note: Members will be added via UI to use the new 'agents' table
-- ============================================================================

-- Step 1: Delete existing default suite
DELETE FROM dh_agent_suite_member WHERE suite_id IN (
  SELECT id FROM dh_agent_suite WHERE unique_id = 'AST-DEFAULT'
);
DELETE FROM dh_agent_suite WHERE unique_id IN ('AST-DEFAULT', 'AST-CLINICAL-EXCELLENCE', 'AST-REGULATORY-FAST-TRACK', 'AST-MARKET-LAUNCH', 'AST-DATA-ANALYTICS', 'AST-DIGITAL-INNOVATION');

-- Step 2: Create themed agent suites
INSERT INTO dh_agent_suite (tenant_id, unique_id, name, description, category, tags, position, is_active) VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'AST-CLINICAL-EXCELLENCE',
    'Clinical Excellence Suite',
    'Best-in-class clinical trial and research experts for designing, executing, and monitoring digital health clinical studies.',
    'clinical',
    ARRAY['clinical-trials', 'research', 'medical', 'protocol'],
    1,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'AST-REGULATORY-FAST-TRACK',
    'Regulatory Fast Track Suite',
    'FDA and international regulatory experts specializing in digital health approvals, breakthrough designations, and compliance.',
    'regulatory',
    ARRAY['fda', 'regulatory', 'compliance', 'approval'],
    2,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'AST-MARKET-LAUNCH',
    'Market Launch Suite',
    'Commercialization experts covering payer strategy, health economics, marketing, and product launch for digital health products.',
    'market_access',
    ARRAY['commercialization', 'payer', 'marketing', 'launch'],
    3,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'AST-DATA-ANALYTICS',
    'Data & Analytics Suite',
    'Biostatistics, data science, and analytics experts for clinical data management, real-world evidence, and outcomes research.',
    'analytical',
    ARRAY['biostatistics', 'data-science', 'analytics', 'evidence'],
    4,
    true
  ),
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'AST-DIGITAL-INNOVATION',
    'Digital Health Innovation Suite',
    'Digital health technology experts covering NLP, data visualization, precision medicine, and cutting-edge digital therapeutics.',
    'technical',
    ARRAY['digital-health', 'technology', 'innovation', 'AI'],
    5,
    true
  );

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_suite_member_suite_id 
  ON dh_agent_suite_member(suite_id);

CREATE INDEX IF NOT EXISTS idx_agent_suite_member_agent_id 
  ON dh_agent_suite_member(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_suite_category 
  ON dh_agent_suite(category) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_agent_suite_position 
  ON dh_agent_suite(position) 
  WHERE is_active = true;

-- Step 9: Verify results
DO $$
DECLARE
  suite_count INTEGER;
  member_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO suite_count FROM dh_agent_suite WHERE is_active = true;
  SELECT COUNT(*) INTO member_count FROM dh_agent_suite_member;
  
  RAISE NOTICE '✅ Created % agent suites with % total members', suite_count, member_count;
  
  -- Log suite details
  FOR suite_record IN 
    SELECT s.name, COUNT(m.id) as member_count
    FROM dh_agent_suite s
    LEFT JOIN dh_agent_suite_member m ON m.suite_id = s.id
    WHERE s.is_active = true
    GROUP BY s.name
    ORDER BY s.position
  LOOP
    RAISE NOTICE '   • %: % members', suite_record.name, suite_record.member_count;
  END LOOP;
END $$;

-- Step 10: Add helpful comments
COMMENT ON TABLE dh_agent_suite IS 'Curated collections of expert agents for specific use cases (clinical trials, regulatory, market access, etc.)';
COMMENT ON TABLE dh_agent_suite_member IS 'Membership relationship between agents and suites, with position ordering';
COMMENT ON COLUMN dh_agent_suite.unique_id IS 'Unique identifier for the suite (e.g., AST-CLINICAL-EXCELLENCE)';
COMMENT ON COLUMN dh_agent_suite_member.primary_flag IS 'Indicates if this is the primary/lead agent in the suite';

