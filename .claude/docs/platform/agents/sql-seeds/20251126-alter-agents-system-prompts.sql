-- ============================================================================
-- AgentOS 3.0: Link Agents to System Prompt Templates
-- Migration: 20251126_alter_agents_for_system_prompts.sql
-- Purpose: Add foreign key to link agents with prompt templates
-- ============================================================================

-- Add system prompt template reference
ALTER TABLE agents ADD COLUMN IF NOT EXISTS system_prompt_template_id UUID 
    REFERENCES system_prompt_templates(id) ON DELETE SET NULL;

-- Add prompt override capability for testing/customization
ALTER TABLE agents ADD COLUMN IF NOT EXISTS system_prompt_override TEXT;

-- Add agent-specific variables for template rendering
ALTER TABLE agents ADD COLUMN IF NOT EXISTS prompt_variables JSONB DEFAULT '{}'::jsonb;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_agents_system_prompt_template 
    ON agents(system_prompt_template_id);

-- Add comments
COMMENT ON COLUMN agents.system_prompt_template_id IS 'Reference to gold standard system prompt template (AgentOS 3.0)';
COMMENT ON COLUMN agents.system_prompt_override IS 'Complete prompt override for testing or agent-specific customization';
COMMENT ON COLUMN agents.prompt_variables IS 'Agent-specific variables for dynamic template rendering (e.g., domain, specialty, tone)';

-- Success message
DO $$ BEGIN
    RAISE NOTICE '✅ Agents table updated for AgentOS 3.0';
    RAISE NOTICE '📋 Added columns: system_prompt_template_id, system_prompt_override, prompt_variables';
    RAISE NOTICE '🔗 Agents can now reference system prompt templates';
END $$;

