-- ============================================================================
-- Create Custom Panels Table
-- ============================================================================
-- This table stores user-created custom panels (separate from user_panels which is a junction table)

CREATE TABLE IF NOT EXISTS public.custom_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  organization_id UUID,

  -- Panel Identity
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'panel',

  -- Template Reference (optional - can be based on a template or fully custom)
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT false,

  -- Panel Configuration
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),

  -- Custom Agent Selection
  selected_agents TEXT[] NOT NULL DEFAULT '{}',
  suggested_agents TEXT[] DEFAULT '{}',

  -- Custom Settings
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Workflow Definition (from designer)
  workflow_definition JSONB DEFAULT '{}'::jsonb,

  -- Sharing & Visibility
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT custom_panels_name_not_empty CHECK (char_length(name) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_panels_user_id ON public.custom_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_panels_tenant_id ON public.custom_panels(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_panels_category ON public.custom_panels(category);
CREATE INDEX IF NOT EXISTS idx_custom_panels_favorite ON public.custom_panels(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_custom_panels_last_used ON public.custom_panels(user_id, last_used_at DESC) WHERE last_used_at IS NOT NULL;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_custom_panels_updated_at ON public.custom_panels;
CREATE TRIGGER update_custom_panels_updated_at
  BEFORE UPDATE ON public.custom_panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.custom_panels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own custom panels" ON public.custom_panels;
CREATE POLICY "Users can read own custom panels"
  ON public.custom_panels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read public custom panels" ON public.custom_panels;
CREATE POLICY "Users can read public custom panels"
  ON public.custom_panels
  FOR SELECT
  TO authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can create own custom panels" ON public.custom_panels;
CREATE POLICY "Users can create own custom panels"
  ON public.custom_panels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own custom panels" ON public.custom_panels;
CREATE POLICY "Users can update own custom panels"
  ON public.custom_panels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own custom panels" ON public.custom_panels;
CREATE POLICY "Users can delete own custom panels"
  ON public.custom_panels
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage custom panels" ON public.custom_panels;
CREATE POLICY "Service role can manage custom panels"
  ON public.custom_panels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ custom_panels table created successfully!';
END $$;
