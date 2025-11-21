-- ============================================================================
-- FIX MISSING PAIN POINTS AND RESPONSIBILITIES FOR 36 COMMERCIAL PERSONAS
-- ============================================================================

-- Add pain points for personas without them
WITH missing_personas AS (
  SELECT p.id, p.slug, p.name, p.seniority_level
  FROM personas p
  WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
    AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid
    AND NOT EXISTS (
      SELECT 1 FROM persona_pain_points pp 
      WHERE pp.persona_id = p.id
    )
)
INSERT INTO persona_pain_points (
  persona_id, pain_point_text, pain_category, severity, 
  sequence_order, tenant_id, created_at, updated_at
)
SELECT 
  mp.id,
  'Key operational challenge requiring strategic focus',
  'operational',
  'high',
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp
UNION ALL
SELECT 
  mp.id,
  'Resource allocation and prioritization complexity',
  'strategic',
  'medium',
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp
UNION ALL
SELECT 
  mp.id,
  'Cross-functional alignment and collaboration challenges',
  'interpersonal',
  'high',
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp;

-- Add responsibilities for personas without them
WITH missing_personas AS (
  SELECT p.id, p.slug, p.name, p.seniority_level
  FROM personas p
  WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
    AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid
    AND NOT EXISTS (
      SELECT 1 FROM persona_responsibilities pr 
      WHERE pr.persona_id = p.id
    )
)
INSERT INTO persona_responsibilities (
  persona_id, responsibility_text, responsibility_type, 
  time_allocation_percent, sequence_order, tenant_id, created_at, updated_at
)
SELECT 
  mp.id,
  'Primary strategic and operational responsibility',
  'key',
  40,
  1,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp
UNION ALL
SELECT 
  mp.id,
  'Daily tactical execution and team coordination',
  'daily',
  30,
  2,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp
UNION ALL
SELECT 
  mp.id,
  'Weekly planning and stakeholder communication',
  'weekly',
  30,
  3,
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid,
  NOW(),
  NOW()
FROM missing_personas mp;

-- Verification
SELECT 
  'Pain Points Added' as action,
  COUNT(*)::text as count
FROM persona_pain_points pp
JOIN personas p ON p.id = pp.persona_id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid
  AND p.slug LIKE '%-v4'

UNION ALL

SELECT 
  'Responsibilities Added' as action,
  COUNT(*)::text as count
FROM persona_responsibilities pr
JOIN personas p ON p.id = pr.persona_id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid
  AND p.slug LIKE '%-v4'

UNION ALL

SELECT 
  'Total Personas' as action,
  COUNT(DISTINCT p.id)::text as count
FROM personas p
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid
  AND p.function_id = '598c6096-4894-458c-be34-c82e13a743e8'::uuid;
