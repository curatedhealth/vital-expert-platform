-- Create user_panels table for saving custom panels from workflow designer
-- Safe to run multiple times (uses IF NOT EXISTS guards)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'panel',
  base_panel_slug TEXT,
  is_template_based BOOLEAN DEFAULT FALSE,
  mode TEXT CHECK (mode IN ('sequential', 'collaborative', 'hybrid')) DEFAULT 'sequential',
  framework TEXT CHECK (framework IN ('langgraph', 'autogen', 'crewai')) DEFAULT 'langgraph',
  selected_agents TEXT[] DEFAULT '{}',
  suggested_agents TEXT[] DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}'::jsonb,
  default_settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  workflow_definition JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_panels_user_id ON public.user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_created_at ON public.user_panels(created_at DESC);

-- Optional: basic trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_user_panels_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_panels_updated_at ON public.user_panels;
CREATE TRIGGER trg_user_panels_updated_at
BEFORE UPDATE ON public.user_panels
FOR EACH ROW EXECUTE FUNCTION public.set_user_panels_updated_at();


