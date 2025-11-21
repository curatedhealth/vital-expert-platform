-- =====================================================================
-- Enhanced AI Agent Template - Database Migration
-- Version: 2.0
-- Date: 2025-10-06
-- Description: Add fields to support comprehensive agent template
-- =====================================================================

-- =====================================================================
-- PHASE 1: Add New Dedicated Columns
-- =====================================================================

-- Add architecture and reasoning fields
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS architecture_pattern VARCHAR(50) DEFAULT 'REACTIVE',
ADD COLUMN IF NOT EXISTS reasoning_method VARCHAR(50) DEFAULT 'DIRECT',
ADD COLUMN IF NOT EXISTS communication_tone VARCHAR(200),
ADD COLUMN IF NOT EXISTS communication_style VARCHAR(200),
ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(200),
ADD COLUMN IF NOT EXISTS primary_mission TEXT,
ADD COLUMN IF NOT EXISTS value_proposition TEXT;

-- Add comments for documentation
COMMENT ON COLUMN agents.architecture_pattern IS 'Agent architecture: REACTIVE, HYBRID, DELIBERATIVE';
COMMENT ON COLUMN agents.reasoning_method IS 'Primary reasoning method: DIRECT, COT, REACT, HYBRID';
COMMENT ON COLUMN agents.communication_tone IS 'Communication tone and style descriptor';
COMMENT ON COLUMN agents.communication_style IS 'Communication style (e.g., Structured, analytical)';
COMMENT ON COLUMN agents.complexity_level IS 'Target audience complexity level';
COMMENT ON COLUMN agents.primary_mission IS 'Agent primary mission statement';
COMMENT ON COLUMN agents.value_proposition IS 'Core value proposition';

-- =====================================================================
-- PHASE 2: Create Indexes for Performance
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_agents_architecture_pattern
ON agents(architecture_pattern);

CREATE INDEX IF NOT EXISTS idx_agents_reasoning_method
ON agents(reasoning_method);

CREATE INDEX IF NOT EXISTS idx_agents_tier_status
ON agents(tier, status);

-- GIN index for JSONB metadata searches
CREATE INDEX IF NOT EXISTS idx_agents_metadata_gin
ON agents USING gin(metadata);

-- =====================================================================
-- PHASE 3: Add Check Constraints
-- =====================================================================

-- Ensure architecture_pattern has valid values
ALTER TABLE agents DROP CONSTRAINT IF EXISTS chk_architecture_pattern;
ALTER TABLE agents ADD CONSTRAINT chk_architecture_pattern
CHECK (architecture_pattern IN ('REACTIVE', 'HYBRID', 'DELIBERATIVE', 'MULTI_AGENT'));

-- Ensure reasoning_method has valid values
ALTER TABLE agents DROP CONSTRAINT IF EXISTS chk_reasoning_method;
ALTER TABLE agents ADD CONSTRAINT chk_reasoning_method
CHECK (reasoning_method IN ('DIRECT', 'COT', 'REACT', 'HYBRID', 'MULTI_PATH'));

-- =====================================================================
-- PHASE 4: Update Default Metadata Structure
-- =====================================================================

-- Function to initialize enhanced metadata for existing agents
CREATE OR REPLACE FUNCTION initialize_enhanced_metadata()
RETURNS void AS $$
DECLARE
  agent_record RECORD;
BEGIN
  -- Loop through all agents and add enhanced metadata structure if missing
  FOR agent_record IN SELECT id, metadata, tier FROM agents
  LOOP
    UPDATE agents
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{capabilities_detail}',
      jsonb_build_object(
        'expert', '[]'::jsonb,
        'competent', '[]'::jsonb,
        'limitations', '[]'::jsonb
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'capabilities_detail');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{behavioral_directives}',
      jsonb_build_object(
        'operating_principles', '[]'::jsonb,
        'decision_framework', '[]'::jsonb,
        'communication_protocol', '{}'::jsonb
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'behavioral_directives');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{reasoning_frameworks}',
      jsonb_build_object(
        'primary_method', CASE
          WHEN agent_record.tier >= 3 THEN 'REACT'
          WHEN agent_record.tier = 2 THEN 'COT'
          ELSE 'DIRECT'
        END,
        'cot_config', jsonb_build_object(
          'enabled', true,
          'activation_triggers', '[]'::jsonb,
          'steps_template', '[]'::jsonb
        ),
        'react_config', jsonb_build_object(
          'enabled', agent_record.tier >= 2,
          'max_iterations', 5,
          'loop_pattern', 'THOUGHT → ACTION → OBSERVATION → REFLECTION → ANSWER'
        ),
        'self_consistency_verification', jsonb_build_object(
          'enabled', agent_record.tier >= 3,
          'num_paths', 3,
          'consensus_threshold', 0.80
        ),
        'metacognitive_monitoring', jsonb_build_object(
          'enabled', true,
          'check_questions', '[]'::jsonb
        )
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'reasoning_frameworks');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{safety_compliance}',
      jsonb_build_object(
        'prohibitions', '[]'::jsonb,
        'mandatory_protections', '[]'::jsonb,
        'regulatory_standards', '[]'::jsonb,
        'compliance_frameworks', '[]'::jsonb
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'safety_compliance');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{escalation_config}',
      jsonb_build_object(
        'triggers', '[]'::jsonb,
        'uncertainty_handling', jsonb_build_object(
          'low_confidence_threshold', 0.70,
          'medium_confidence_threshold', 0.85,
          'high_confidence_threshold', 0.95
        )
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'escalation_config');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{output_specifications}',
      jsonb_build_object(
        'standard_format', jsonb_build_object(
          'include_confidence', true,
          'include_reasoning_trace', true,
          'include_evidence', true,
          'include_recommendations', true
        ),
        'citation_format', 'APA 7th Edition',
        'confidence_scale', '{}'::jsonb
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'output_specifications');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{quality_metrics}',
      jsonb_build_object(
        'accuracy_target', CASE
          WHEN agent_record.tier >= 3 THEN 0.95
          WHEN agent_record.tier = 2 THEN 0.92
          ELSE 0.90
        END,
        'response_time_target_ms', 2000,
        'completeness_target', 0.90,
        'user_satisfaction_target', 4.5
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'quality_metrics');

    UPDATE agents
    SET metadata = jsonb_set(
      metadata,
      '{version_control}',
      jsonb_build_object(
        'current_version', '2.0',
        'previous_version', '1.0',
        'change_log', 'Enhanced with comprehensive template fields',
        'compatibility', 'BACKWARD_COMPATIBLE'
      ),
      true
    )
    WHERE id = agent_record.id
    AND NOT (metadata ? 'version_control');

  END LOOP;

  RAISE NOTICE 'Enhanced metadata initialized for all agents';
END;
$$ LANGUAGE plpgsql;

-- Execute the initialization
SELECT initialize_enhanced_metadata();

-- =====================================================================
-- PHASE 5: Update Architecture Pattern Based on Tier
-- =====================================================================

UPDATE agents
SET architecture_pattern = CASE
  WHEN tier >= 3 THEN 'DELIBERATIVE'
  WHEN tier = 2 THEN 'HYBRID'
  ELSE 'REACTIVE'
END
WHERE architecture_pattern IS NULL OR architecture_pattern = 'REACTIVE';

UPDATE agents
SET reasoning_method = CASE
  WHEN tier >= 3 THEN 'REACT'
  WHEN tier = 2 THEN 'COT'
  ELSE 'DIRECT'
END
WHERE reasoning_method IS NULL OR reasoning_method = 'DIRECT';

-- =====================================================================
-- PHASE 6: Create Helper Functions
-- =====================================================================

-- Function to get agent's reasoning configuration
CREATE OR REPLACE FUNCTION get_agent_reasoning_config(agent_id UUID)
RETURNS JSONB AS $$
  SELECT metadata->'reasoning_frameworks'
  FROM agents
  WHERE id = agent_id;
$$ LANGUAGE SQL STABLE;

-- Function to get agent's capabilities detail
CREATE OR REPLACE FUNCTION get_agent_capabilities_detail(agent_id UUID)
RETURNS JSONB AS $$
  SELECT metadata->'capabilities_detail'
  FROM agents
  WHERE id = agent_id;
$$ LANGUAGE SQL STABLE;

-- Function to get agent's safety compliance config
CREATE OR REPLACE FUNCTION get_agent_safety_config(agent_id UUID)
RETURNS JSONB AS $$
  SELECT metadata->'safety_compliance'
  FROM agents
  WHERE id = agent_id;
$$ LANGUAGE SQL STABLE;

-- Function to get agent's escalation triggers
CREATE OR REPLACE FUNCTION get_agent_escalation_triggers(agent_id UUID)
RETURNS JSONB AS $$
  SELECT metadata->'escalation_config'->'triggers'
  FROM agents
  WHERE id = agent_id;
$$ LANGUAGE SQL STABLE;

-- =====================================================================
-- PHASE 7: Create View for Enhanced Agent Details
-- =====================================================================

CREATE OR REPLACE VIEW enhanced_agent_details AS
SELECT
  a.id,
  a.name,
  a.display_name,
  a.tier,
  a.architecture_pattern,
  a.reasoning_method,
  a.communication_tone,
  a.communication_style,
  a.complexity_level,
  a.primary_mission,
  a.value_proposition,

  -- Extract metadata fields
  a.metadata->'capabilities_detail' as capabilities_detail,
  a.metadata->'behavioral_directives' as behavioral_directives,
  a.metadata->'reasoning_frameworks' as reasoning_frameworks,
  a.metadata->'tools_detail' as tools_detail,
  a.metadata->'safety_compliance' as safety_compliance,
  a.metadata->'escalation_config' as escalation_config,
  a.metadata->'output_specifications' as output_specifications,
  a.metadata->'quality_metrics' as quality_metrics,
  a.metadata->'version_control' as version_control,

  -- Original fields
  a.description,
  a.capabilities,
  a.tools,
  a.model,
  a.status,
  a.created_at,
  a.updated_at
FROM agents a;

COMMENT ON VIEW enhanced_agent_details IS 'Flattened view of agents with enhanced template fields';

-- =====================================================================
-- PHASE 8: Add Validation Functions
-- =====================================================================

-- Validate that expert capabilities have proficiency scores
CREATE OR REPLACE FUNCTION validate_expert_capabilities(agent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expert_caps JSONB;
  cap JSONB;
BEGIN
  SELECT metadata->'capabilities_detail'->'expert'
  INTO expert_caps
  FROM agents WHERE id = agent_id;

  IF expert_caps IS NULL THEN
    RETURN true; -- No expert capabilities defined yet
  END IF;

  -- Check each expert capability has required fields
  FOR cap IN SELECT * FROM jsonb_array_elements(expert_caps)
  LOOP
    IF NOT (cap ? 'name' AND cap ? 'proficiency' AND cap ? 'application') THEN
      RETURN false;
    END IF;

    -- Check proficiency is between 0 and 1
    IF (cap->>'proficiency')::float < 0 OR (cap->>'proficiency')::float > 1 THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Validate escalation triggers have required fields
CREATE OR REPLACE FUNCTION validate_escalation_triggers(agent_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  triggers JSONB;
  trigger_item JSONB;
BEGIN
  SELECT metadata->'escalation_config'->'triggers'
  INTO triggers
  FROM agents WHERE id = agent_id;

  IF triggers IS NULL THEN
    RETURN true;
  END IF;

  FOR trigger_item IN SELECT * FROM jsonb_array_elements(triggers)
  LOOP
    IF NOT (trigger_item ? 'trigger' AND trigger_item ? 'route_to_tier') THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================================
-- PHASE 9: Add Trigger for Automatic Metadata Validation
-- =====================================================================

CREATE OR REPLACE FUNCTION validate_agent_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate expert capabilities if present
  IF NEW.metadata ? 'capabilities_detail' THEN
    IF NOT validate_expert_capabilities(NEW.id) THEN
      RAISE EXCEPTION 'Invalid expert capabilities: must have name, proficiency (0-1), and application';
    END IF;
  END IF;

  -- Validate escalation triggers if present
  IF NEW.metadata ? 'escalation_config' THEN
    IF NOT validate_escalation_triggers(NEW.id) THEN
      RAISE EXCEPTION 'Invalid escalation triggers: must have trigger and route_to_tier';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_agent_metadata ON agents;
CREATE TRIGGER trg_validate_agent_metadata
  BEFORE INSERT OR UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION validate_agent_metadata();

-- =====================================================================
-- PHASE 10: Migration Summary and Verification
-- =====================================================================

-- Create a summary table to track migration
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL,
  migration_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'SUCCESS',
  notes TEXT
);

-- Log this migration
INSERT INTO migration_log (migration_name, status, notes)
VALUES (
  '20251006_add_enhanced_agent_fields',
  'SUCCESS',
  'Added architecture_pattern, reasoning_method, communication fields, and enhanced metadata structure'
);

-- Verification query
DO $$
DECLARE
  total_agents INTEGER;
  agents_with_enhanced_metadata INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_agents FROM agents;

  SELECT COUNT(*) INTO agents_with_enhanced_metadata
  FROM agents
  WHERE metadata ? 'capabilities_detail'
    AND metadata ? 'behavioral_directives'
    AND metadata ? 'reasoning_frameworks';

  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  RAISE NOTICE 'Total agents: %', total_agents;
  RAISE NOTICE 'Agents with enhanced metadata: %', agents_with_enhanced_metadata;
  RAISE NOTICE 'Coverage: %', ROUND((agents_with_enhanced_metadata::float / total_agents * 100), 2);
  RAISE NOTICE '==============================';
END $$;

-- =====================================================================
-- ROLLBACK SCRIPT (Commented out - uncomment if needed to rollback)
-- =====================================================================

/*
-- Rollback Phase 1: Remove new columns
ALTER TABLE agents
DROP COLUMN IF EXISTS architecture_pattern,
DROP COLUMN IF EXISTS reasoning_method,
DROP COLUMN IF EXISTS communication_tone,
DROP COLUMN IF EXISTS communication_style,
DROP COLUMN IF EXISTS complexity_level,
DROP COLUMN IF EXISTS primary_mission,
DROP COLUMN IF EXISTS value_proposition;

-- Rollback Phase 2: Remove indexes
DROP INDEX IF EXISTS idx_agents_architecture_pattern;
DROP INDEX IF EXISTS idx_agents_reasoning_method;
DROP INDEX IF EXISTS idx_agents_tier_status;
DROP INDEX IF EXISTS idx_agents_metadata_gin;

-- Rollback Phase 3: Remove functions
DROP FUNCTION IF EXISTS initialize_enhanced_metadata();
DROP FUNCTION IF EXISTS get_agent_reasoning_config(UUID);
DROP FUNCTION IF EXISTS get_agent_capabilities_detail(UUID);
DROP FUNCTION IF EXISTS get_agent_safety_config(UUID);
DROP FUNCTION IF EXISTS get_agent_escalation_triggers(UUID);
DROP FUNCTION IF EXISTS validate_expert_capabilities(UUID);
DROP FUNCTION IF EXISTS validate_escalation_triggers(UUID);
DROP FUNCTION IF EXISTS validate_agent_metadata();

-- Rollback Phase 4: Remove view
DROP VIEW IF EXISTS enhanced_agent_details;

-- Rollback Phase 5: Remove trigger
DROP TRIGGER IF EXISTS trg_validate_agent_metadata ON agents;

-- Rollback Phase 6: Remove metadata fields (optional - data will be lost)
-- UPDATE agents SET metadata = metadata - 'capabilities_detail' - 'behavioral_directives' - 'reasoning_frameworks' - 'safety_compliance' - 'escalation_config' - 'output_specifications' - 'quality_metrics' - 'version_control';

-- Log rollback
INSERT INTO migration_log (migration_name, status, notes)
VALUES ('20251006_add_enhanced_agent_fields_ROLLBACK', 'SUCCESS', 'Rolled back enhanced agent fields migration');
*/

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
