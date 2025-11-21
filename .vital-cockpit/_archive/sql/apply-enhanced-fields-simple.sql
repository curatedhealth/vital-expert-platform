-- Simple version: Just add the new columns and metadata structure
-- This assumes the agents table already exists

-- Check if agents table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agents') THEN
    RAISE EXCEPTION 'agents table does not exist. Please run base schema migrations first.';
  END IF;
END
$$;

-- Add new columns (safe - will not error if already exist)
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS architecture_pattern VARCHAR(50) DEFAULT 'REACTIVE';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS reasoning_method VARCHAR(50) DEFAULT 'DIRECT';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS communication_tone VARCHAR(200);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS communication_style VARCHAR(200);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(200);
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS primary_mission TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS value_proposition TEXT;

-- Update existing agents based on tier
UPDATE public.agents
SET architecture_pattern = CASE
  WHEN tier >= 3 THEN 'DELIBERATIVE'
  WHEN tier = 2 THEN 'HYBRID'
  ELSE 'REACTIVE'
END
WHERE architecture_pattern IS NULL OR architecture_pattern = 'REACTIVE';

UPDATE public.agents
SET reasoning_method = CASE
  WHEN tier >= 3 THEN 'REACT'
  WHEN tier = 2 THEN 'COT'
  ELSE 'DIRECT'
END
WHERE reasoning_method IS NULL OR reasoning_method = 'DIRECT';

-- Initialize enhanced metadata for existing agents (safe - only adds if missing)
UPDATE public.agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'capabilities_detail', jsonb_build_object(
    'expert', '[]'::jsonb,
    'competent', '[]'::jsonb,
    'limitations', '[]'::jsonb
  ),
  'behavioral_directives', jsonb_build_object(
    'operating_principles', '[]'::jsonb,
    'decision_framework', '[]'::jsonb,
    'communication_protocol', '{}'::jsonb
  ),
  'reasoning_frameworks', jsonb_build_object(
    'primary_method', CASE
      WHEN tier >= 3 THEN 'REACT'
      WHEN tier = 2 THEN 'COT'
      ELSE 'DIRECT'
    END,
    'cot_config', jsonb_build_object(
      'enabled', true,
      'activation_triggers', '[]'::jsonb
    ),
    'react_config', jsonb_build_object(
      'enabled', tier >= 2,
      'max_iterations', 5
    )
  ),
  'safety_compliance', jsonb_build_object(
    'prohibitions', '[]'::jsonb,
    'mandatory_protections', '[]'::jsonb,
    'regulatory_standards', '[]'::jsonb
  ),
  'escalation_config', jsonb_build_object(
    'triggers', '[]'::jsonb,
    'uncertainty_handling', jsonb_build_object(
      'low_confidence_threshold', 0.70,
      'medium_confidence_threshold', 0.85,
      'high_confidence_threshold', 0.95
    )
  ),
  'output_specifications', jsonb_build_object(
    'standard_format', jsonb_build_object(
      'include_confidence', true,
      'include_reasoning_trace', true
    ),
    'citation_format', 'APA 7th Edition'
  ),
  'quality_metrics', jsonb_build_object(
    'accuracy_target', CASE
      WHEN tier >= 3 THEN 0.95
      WHEN tier = 2 THEN 0.92
      ELSE 0.90
    END,
    'response_time_target_ms', 2000
  )
)
WHERE NOT (metadata ? 'capabilities_detail');

SELECT 'Migration applied successfully! Enhanced ' || COUNT(*) || ' agents with new fields.' as result
FROM public.agents;
