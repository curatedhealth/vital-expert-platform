-- ============================================================================
-- PROMPT ENHANCEMENT CONFIGURATION TABLE
-- ============================================================================
-- Migration: Create table for storing prompt enhancement settings
-- Description: Allows admins to configure LLM provider and model for prompt enhancement
-- Author: VITAL Path AI Team
-- Date: 2024-11-06

-- Create prompt_enhancement_config table
CREATE TABLE IF NOT EXISTS public.prompt_enhancement_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- LLM Configuration
    llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'anthropic', 'google')),
    llm_model TEXT NOT NULL,
    temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 2048 CHECK (max_tokens > 0 AND max_tokens <= 8000),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Additional settings (JSON for flexibility)
    additional_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Description
    description TEXT,
    config_name TEXT UNIQUE,
    
    -- Constraints
    CONSTRAINT valid_openai_model CHECK (
        llm_provider != 'openai' OR 
        llm_model IN ('gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o', 'gpt-4o-mini')
    ),
    CONSTRAINT valid_anthropic_model CHECK (
        llm_provider != 'anthropic' OR 
        llm_model IN ('claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307')
    ),
    CONSTRAINT valid_google_model CHECK (
        llm_provider != 'google' OR 
        llm_model IN ('gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash')
    )
);

-- Create index for active configs
CREATE INDEX IF NOT EXISTS idx_prompt_enhancement_config_active 
ON public.prompt_enhancement_config(is_active, updated_at DESC);

-- Create index for config name
CREATE INDEX IF NOT EXISTS idx_prompt_enhancement_config_name 
ON public.prompt_enhancement_config(config_name);

-- Enable Row Level Security
ALTER TABLE public.prompt_enhancement_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.prompt_enhancement_config;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON public.prompt_enhancement_config;
DROP POLICY IF EXISTS "Allow admins to manage configs" ON public.prompt_enhancement_config;

-- Create RLS policies
-- 1. Public read access for active configs (so frontend can read settings)
CREATE POLICY "Allow public read access" 
ON public.prompt_enhancement_config
FOR SELECT
TO public
USING (is_active = true);

-- 2. Authenticated users can read all configs
CREATE POLICY "Allow authenticated users to read" 
ON public.prompt_enhancement_config
FOR SELECT
TO authenticated
USING (true);

-- 3. Only admins can insert/update/delete
CREATE POLICY "Allow admins to manage configs" 
ON public.prompt_enhancement_config
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_prompt_enhancement_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_prompt_enhancement_config_updated_at_trigger 
ON public.prompt_enhancement_config;

CREATE TRIGGER update_prompt_enhancement_config_updated_at_trigger
    BEFORE UPDATE ON public.prompt_enhancement_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_prompt_enhancement_config_updated_at();

-- Insert default configuration
INSERT INTO public.prompt_enhancement_config (
    llm_provider,
    llm_model,
    temperature,
    max_tokens,
    is_active,
    config_name,
    description
) VALUES (
    'anthropic',
    'claude-3-5-sonnet-20241022',
    0.7,
    2048,
    true,
    'default',
    'Default configuration using Claude 3.5 Sonnet for high-quality enhancements'
) ON CONFLICT (config_name) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE public.prompt_enhancement_config IS 
'Configuration settings for AI-powered prompt enhancement feature. Allows admins to select LLM provider and model.';

COMMENT ON COLUMN public.prompt_enhancement_config.llm_provider IS 
'LLM provider: openai, anthropic, or google';

COMMENT ON COLUMN public.prompt_enhancement_config.llm_model IS 
'Specific model name for the selected provider';

COMMENT ON COLUMN public.prompt_enhancement_config.temperature IS 
'Temperature setting for LLM generation (0.0 to 2.0). Higher = more creative, Lower = more focused';

COMMENT ON COLUMN public.prompt_enhancement_config.max_tokens IS 
'Maximum tokens for LLM response (100 to 8000)';

COMMENT ON COLUMN public.prompt_enhancement_config.is_active IS 
'Whether this configuration is currently active. Only one config should be active at a time.';

COMMENT ON COLUMN public.prompt_enhancement_config.additional_settings IS 
'JSON field for additional provider-specific settings';

-- Grant permissions
GRANT SELECT ON public.prompt_enhancement_config TO anon;
GRANT ALL ON public.prompt_enhancement_config TO authenticated;
GRANT ALL ON public.prompt_enhancement_config TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View current configuration
-- SELECT * FROM public.prompt_enhancement_config WHERE is_active = true ORDER BY updated_at DESC LIMIT 1;

-- View all configurations
-- SELECT id, config_name, llm_provider, llm_model, is_active, created_at FROM public.prompt_enhancement_config ORDER BY created_at DESC;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS update_prompt_enhancement_config_updated_at_trigger ON public.prompt_enhancement_config;
-- DROP FUNCTION IF EXISTS public.update_prompt_enhancement_config_updated_at();
-- DROP TABLE IF EXISTS public.prompt_enhancement_config CASCADE;

