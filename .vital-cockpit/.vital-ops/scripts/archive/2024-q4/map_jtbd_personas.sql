-- ============================================================================
-- MAP JTBD ↔ PERSONA RELATIONSHIPS
-- Create mappings between Jobs-to-be-Done and Personas
-- ============================================================================

BEGIN;

-- All 10 JTBDs are Market Access related
-- Map them to HEALTH ECONOMICS DIRECTOR persona (primary)

-- Get persona ID
DO $$
DECLARE
  heor_director_id UUID;
BEGIN
  SELECT id INTO heor_director_id
  FROM personas
  WHERE title = 'HEALTH ECONOMICS DIRECTOR' AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

  -- Map all 10 Market Access JTBDs to HEOR Director
  INSERT INTO jtbd_personas (id, jtbd_id, persona_id, relevance_score, is_primary, mapping_source, created_at)
  SELECT
    gen_random_uuid(),
    j.id,
    heor_director_id,
    0.95,  -- High relevance
    TRUE,  -- Primary persona for these JTBDs
    'manual',
    NOW()
  FROM jobs_to_be_done j
  WHERE j.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND j.functional_area = 'Market Access';
END $$;

COMMIT;

-- Verification
SELECT
  'JTBD-Persona Mappings' as entity,
  COUNT(*) as total_mappings,
  COUNT(*) FILTER (WHERE is_primary = TRUE) as primary_mappings
FROM jtbd_personas;

-- Show the mappings
SELECT
  j.code,
  j.name as jtbd_name,
  p.title as persona_title,
  jp.relevance_score,
  jp.is_primary
FROM jtbd_personas jp
JOIN jobs_to_be_done j ON jp.jtbd_id = j.id
JOIN personas p ON jp.persona_id = p.id
ORDER BY j.code;

-- ✅ JTBD-Persona mappings complete
