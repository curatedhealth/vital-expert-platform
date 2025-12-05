
-- Create user_panels table for custom panel definitions
-- This table stores user-created panels with their workflow definitions

CREATE TABLE IF NOT EXISTS user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'panel',
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT false,
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),
  selected_agents TEXT[] NOT NULL,
  suggested_agents TEXT[] DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  workflow_definition JSONB,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT user_panels_has_agents CHECK (array_length(selected_agents, 1) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_base_panel_slug ON user_panels(base_panel_slug);
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_is_favorite ON user_panels(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON user_panels(last_used_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_panels_created_at ON user_panels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_panels_is_public ON user_panels(is_public) WHERE is_public = true;

-- Add comments
COMMENT ON TABLE user_panels IS 'Stores user-created custom panel configurations';
COMMENT ON COLUMN user_panels.user_id IS 'UUID of the user who created this panel';
COMMENT ON COLUMN user_panels.selected_agents IS 'Array of agent IDs selected for this panel';
COMMENT ON COLUMN user_panels.workflow_definition IS 'JSON workflow definition with nodes and edges';
COMMENT ON COLUMN user_panels.mode IS 'Panel execution mode: sequential, collaborative, or hybrid';
COMMENT ON COLUMN user_panels.framework IS 'AI framework to use: langgraph, autogen, or crewai';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_panels_updated_at
  BEFORE UPDATE ON user_panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'user_panels table created successfully!' AS result;
