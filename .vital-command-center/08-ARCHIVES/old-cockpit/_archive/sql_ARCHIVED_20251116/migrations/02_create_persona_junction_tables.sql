-- =====================================================================================
-- STEP 2: Create normalized junction tables for personas
-- =====================================================================================
-- Run this file AFTER running 01_add_personas_columns.sql
-- =====================================================================================

-- 1. persona_goals
CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    goal_text TEXT NOT NULL,
    goal_category TEXT CHECK (goal_category IN ('professional', 'organizational', 'personal', 'team')),
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    time_horizon TEXT CHECK (time_horizon IN ('immediate', 'short_term', 'medium_term', 'long_term')),
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_goals_persona ON persona_goals(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_goals_tenant ON persona_goals(tenant_id);

-- 2. persona_pain_points
CREATE TABLE IF NOT EXISTS persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    pain_point_text TEXT NOT NULL,
    pain_category TEXT CHECK (pain_category IN ('process', 'technology', 'resource', 'knowledge', 'compliance', 'collaboration')),
    severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'constant')),
    impact TEXT CHECK (impact IN ('low', 'medium', 'high', 'very_high')),
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_persona ON persona_pain_points(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_pain_points_tenant ON persona_pain_points(tenant_id);

-- 3. persona_challenges
CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    challenge_text TEXT NOT NULL,
    challenge_type TEXT CHECK (challenge_type IN ('strategic', 'operational', 'tactical', 'organizational')),
    complexity TEXT CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'immediate')),
    impact_level TEXT CHECK (impact_level IN ('individual', 'team', 'department', 'organization', 'ecosystem')),
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_challenges_persona ON persona_challenges(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_challenges_tenant ON persona_challenges(tenant_id);

-- 4. persona_responsibilities
CREATE TABLE IF NOT EXISTS persona_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    responsibility_text TEXT NOT NULL,
    responsibility_category TEXT CHECK (responsibility_category IN ('strategic', 'operational', 'administrative', 'people_management', 'technical')),
    time_allocation_percentage INTEGER CHECK (time_allocation_percentage BETWEEN 0 AND 100),
    is_primary BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_persona ON persona_responsibilities(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_responsibilities_tenant ON persona_responsibilities(tenant_id);

-- 5. persona_tools
CREATE TABLE IF NOT EXISTS persona_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    tool_name TEXT NOT NULL,
    tool_category TEXT CHECK (tool_category IN ('crm', 'analytics', 'communication', 'documentation', 'project_management', 'specialized_clinical', 'data_visualization', 'other')),
    usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'occasionally', 'rarely')),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_required BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_tools_persona ON persona_tools(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_tools_tenant ON persona_tools(tenant_id);

-- 6. persona_communication_channels
CREATE TABLE IF NOT EXISTS persona_communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    channel_name TEXT NOT NULL,
    channel_type TEXT CHECK (channel_type IN ('synchronous', 'asynchronous', 'formal', 'informal')),
    preference_level TEXT CHECK (preference_level IN ('preferred', 'acceptable', 'limited', 'avoided')),
    use_case TEXT,
    frequency TEXT CHECK (frequency IN ('primary', 'frequent', 'occasional', 'rare')),
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_comm_channels_persona ON persona_communication_channels(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_comm_channels_tenant ON persona_communication_channels(tenant_id);

-- 7. persona_decision_makers
CREATE TABLE IF NOT EXISTS persona_decision_makers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    decision_maker_role TEXT NOT NULL,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'stakeholder', 'influencer', 'collaborator', 'approver')),
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    decision_scope TEXT,
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_decision_makers_persona ON persona_decision_makers(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_decision_makers_tenant ON persona_decision_makers(tenant_id);

-- 8. persona_frustrations
CREATE TABLE IF NOT EXISTS persona_frustrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    frustration_text TEXT NOT NULL,
    frustration_source TEXT CHECK (frustration_source IN ('process', 'technology', 'people', 'policy', 'resources', 'time', 'information')),
    intensity TEXT CHECK (intensity IN ('mild', 'moderate', 'significant', 'severe')),
    frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'daily')),
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_frustrations_persona ON persona_frustrations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_frustrations_tenant ON persona_frustrations(tenant_id);

-- 9. persona_quotes
CREATE TABLE IF NOT EXISTS persona_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    quote_text TEXT NOT NULL,
    quote_context TEXT,
    quote_category TEXT CHECK (quote_category IN ('pain_point', 'goal', 'aspiration', 'frustration', 'success', 'philosophy')),
    is_featured BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persona_quotes_persona ON persona_quotes(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_quotes_tenant ON persona_quotes(tenant_id);

-- 10. persona_organization_types
CREATE TABLE IF NOT EXISTS persona_organization_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    organization_type TEXT NOT NULL,
    is_typical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, organization_type)
);
CREATE INDEX IF NOT EXISTS idx_persona_org_types_persona ON persona_organization_types(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_org_types_tenant ON persona_organization_types(tenant_id);

-- 11. persona_typical_locations
CREATE TABLE IF NOT EXISTS persona_typical_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    location_name TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('city', 'region', 'country', 'hub')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, location_name)
);
CREATE INDEX IF NOT EXISTS idx_persona_locations_persona ON persona_typical_locations(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_locations_tenant ON persona_typical_locations(tenant_id);

-- Verification
DO $$
DECLARE
  v_table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'persona_goals', 'persona_pain_points', 'persona_challenges',
      'persona_responsibilities', 'persona_tools', 'persona_communication_channels',
      'persona_decision_makers', 'persona_frustrations', 'persona_quotes',
      'persona_organization_types', 'persona_typical_locations'
    );

  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'STEP 2 COMPLETE - Created % normalized junction tables', v_table_count;
  RAISE NOTICE '=====================================================================================';
  RAISE NOTICE 'GOLDEN RULE COMPLIANCE: ✅ ALL DATA NORMALIZED (NO JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run seed data script for Medical Affairs Personas Part 1';
  RAISE NOTICE '  File: database/sql/seeds/2025/PRODUCTION_TEMPLATES/03_content/medical_affairs_personas_part1_normalized.sql';
  RAISE NOTICE '=====================================================================================';
END $$;
