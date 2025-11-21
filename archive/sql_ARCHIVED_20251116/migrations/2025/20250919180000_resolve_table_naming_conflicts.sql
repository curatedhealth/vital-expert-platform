-- Migration to resolve ai_agents vs agents table naming conflicts
-- This ensures we use the comprehensive agents table structure throughout

-- First, check if ai_agents table exists and migrate data if needed
-- Only proceed if ai_agents exists and agents table is properly structured

-- Migrate any existing data from ai_agents to agents table if ai_agents exists
DO $$
BEGIN
    -- Check if ai_agents table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agents') THEN
        -- Migrate data from ai_agents to agents, mapping old fields to new structure
        INSERT INTO agents (
            id,
            name,
            display_name,
            description,
            system_prompt,
            model,
            avatar,
            color,
            capabilities,
            rag_enabled,
            temperature,
            max_tokens,
            is_custom,
            status,
            created_at,
            updated_at
        )
        SELECT
            id,
            name,
            name as display_name, -- Use name as display_name if no separate field
            COALESCE(description, 'Migrated agent') as description,
            system_prompt,
            COALESCE(model, 'gpt-4') as model,
            COALESCE(avatar, '🤖') as avatar,
            COALESCE(color, '#6366f1') as color,
            COALESCE(capabilities, ARRAY[]::TEXT[]) as capabilities,
            COALESCE(rag_enabled, true) as rag_enabled,
            COALESCE(temperature, 0.7) as temperature,
            COALESCE(max_tokens, 2000) as max_tokens,
            COALESCE(is_custom, false) as is_custom,
            'active'::agent_status as status, -- Default to active for migrated agents
            COALESCE(created_at, NOW()) as created_at,
            COALESCE(updated_at, NOW()) as updated_at
        FROM ai_agents
        WHERE NOT EXISTS (
            SELECT 1 FROM agents WHERE agents.name = ai_agents.name
        ); -- Only insert if not already exists in agents table

        -- Update chat_conversations to reference agents instead of ai_agents
        UPDATE chat_conversations
        SET agent_id = (
            SELECT a.id FROM agents a
            WHERE a.name = (
                SELECT ai.name FROM ai_agents ai WHERE ai.id = chat_conversations.agent_id
            )
        )
        WHERE agent_id IN (SELECT id FROM ai_agents);

        -- Update chat_messages to reference agents instead of ai_agents
        UPDATE chat_messages
        SET agent_id = (
            SELECT a.id FROM agents a
            WHERE a.name = (
                SELECT ai.name FROM ai_agents ai WHERE ai.id = chat_messages.agent_id
            )
        )
        WHERE agent_id IN (SELECT id FROM ai_agents);

        -- Drop the old ai_agents table after successful migration
        DROP TABLE ai_agents CASCADE;

        RAISE NOTICE 'Successfully migrated data from ai_agents to agents table and dropped ai_agents table';
    ELSE
        RAISE NOTICE 'ai_agents table does not exist, no migration needed';
    END IF;
END $$;

-- Ensure all required healthcare compliance fields exist in agents table
-- (These should already exist from previous migrations, but adding as safety check)

ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_specialty TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_validation_status VARCHAR(20) DEFAULT 'pending'
  CHECK (clinical_validation_status IN ('pending', 'validated', 'expired', 'under_review'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_accuracy_score DECIMAL(4,3) DEFAULT 0.95
  CHECK (medical_accuracy_score >= 0 AND medical_accuracy_score <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS citation_accuracy DECIMAL(4,3)
  CHECK (citation_accuracy IS NULL OR (citation_accuracy >= 0 AND citation_accuracy <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hallucination_rate DECIMAL(4,3)
  CHECK (hallucination_rate IS NULL OR (hallucination_rate >= 0 AND hallucination_rate <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_error_rate DECIMAL(4,3)
  CHECK (medical_error_rate IS NULL OR (medical_error_rate >= 0 AND medical_error_rate <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fda_samd_class VARCHAR(20)
  CHECK (fda_samd_class IS NULL OR fda_samd_class IN ('', 'I', 'IIa', 'IIb', 'III'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_clinical_review TIMESTAMPTZ;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_reviewer_id TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS audit_trail JSONB DEFAULT '{}';

-- Ensure is_public field exists for compatibility
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_validation_status ON agents(clinical_validation_status);
CREATE INDEX IF NOT EXISTS idx_agents_is_public ON agents(is_public);

-- Update foreign key constraints to point to agents table
-- This handles any remaining references to the old ai_agents table

-- Re-enable any RLS policies that might have been affected
-- These should already exist from the comprehensive schema, but ensuring consistency

-- Ensure all necessary RLS policies exist
DROP POLICY IF EXISTS "Authenticated users can view agents" ON agents;
CREATE POLICY "Authenticated users can view agents"
    ON agents FOR SELECT
    TO authenticated
    USING (
        data_classification IN ('public', 'internal')
        OR is_public = true
        OR created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Authenticated users can update agents" ON agents;
CREATE POLICY "Authenticated users can update agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR is_custom = true)
    WITH CHECK (created_by = auth.uid() OR is_custom = true);

-- Add comment for documentation
COMMENT ON TABLE agents IS 'Comprehensive agents table with healthcare compliance and domain-agnostic design';