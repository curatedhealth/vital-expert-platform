-- ============================================================================
-- Create User Panels Table for Custom Panel Management
-- ============================================================================
-- This migration creates the user_panels table to store user-created custom panels
-- based on template panels, with customizations like selected agents, settings, etc.

-- Create user_panels table
CREATE TABLE IF NOT EXISTS public.user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  organization_id UUID,
  
  -- Panel Identity
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Template Reference (optional - can be based on a template or fully custom)
  base_panel_slug TEXT REFERENCES public.panels(slug) ON DELETE SET NULL,
  is_template_based BOOLEAN DEFAULT false,
  
  -- Panel Configuration
  mode TEXT NOT NULL CHECK (mode IN ('sequential', 'collaborative', 'hybrid')),
  framework TEXT NOT NULL CHECK (framework IN ('langgraph', 'autogen', 'crewai')),
  
  -- Custom Agent Selection (user can select 2, 5, 10, etc. instead of template's default)
  selected_agents TEXT[] NOT NULL DEFAULT '{}',
  suggested_agents TEXT[] DEFAULT '{}', -- Keep template suggestions for reference
  
  -- Custom Settings (override template defaults)
  custom_settings JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}', -- Keep template defaults for reference
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Sharing & Visibility
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_panels_name_not_empty CHECK (char_length(name) > 0),
  CONSTRAINT user_panels_has_agents CHECK (array_length(selected_agents, 1) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON public.user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_tenant_id ON public.user_panels(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_panels_base_panel_slug ON public.user_panels(base_panel_slug) WHERE base_panel_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON public.user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_favorite ON public.user_panels(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_panels_last_used ON public.user_panels(user_id, last_used_at DESC) WHERE last_used_at IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_user_panels_updated_at
  BEFORE UPDATE ON public.user_panels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_panels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own panels
CREATE POLICY "Users can read own panels"
  ON public.user_panels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can read public panels
CREATE POLICY "Users can read public panels"
  ON public.user_panels
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- RLS Policy: Users can create their own panels
CREATE POLICY "Users can create own panels"
  ON public.user_panels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own panels
CREATE POLICY "Users can update own panels"
  ON public.user_panels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own panels
CREATE POLICY "Users can delete own panels"
  ON public.user_panels
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Service role has full access
CREATE POLICY "Service role can manage user panels"
  ON public.user_panels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.user_panels IS 'User-created custom panels based on templates or fully custom';
COMMENT ON COLUMN public.user_panels.base_panel_slug IS 'Reference to template panel this was based on (if any)';
COMMENT ON COLUMN public.user_panels.selected_agents IS 'User-selected agents for this panel (can be 2, 5, 10, etc.)';
COMMENT ON COLUMN public.user_panels.custom_settings IS 'User-customized settings overriding template defaults';

