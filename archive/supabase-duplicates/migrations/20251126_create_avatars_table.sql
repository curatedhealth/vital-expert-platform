-- ============================================================================
-- AVATARS TABLE - SVG Avatar Management System
-- ============================================================================
-- Stores metadata for SVG avatars with proper categorization for agent assignment
-- Replaces old PNG-based icon system with new branded SVG avatars
-- ============================================================================

-- Create avatars table
CREATE TABLE IF NOT EXISTS public.avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- File identification
    filename TEXT NOT NULL UNIQUE,
    storage_path TEXT NOT NULL,  -- Path in Supabase storage
    public_url TEXT NOT NULL,    -- Full public URL to the avatar

    -- Categorization (extracted from filename)
    persona_type TEXT NOT NULL,  -- expert, foresight, medical, pharma, startup
    business_function TEXT NOT NULL,  -- analytics_insights, commercial_marketing, market_access, medical_affairs, product_innovation
    variant_number INTEGER NOT NULL,  -- 1-20

    -- Display metadata
    display_name TEXT NOT NULL,
    description TEXT,

    -- Color/style metadata
    primary_color TEXT,  -- Hex color extracted from SVG

    -- Agent tier mapping (for automatic assignment)
    recommended_tier INTEGER DEFAULT 2,  -- 1=Worker/Tool, 2=Specialist, 3=Expert/Master

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_avatars_persona_type ON public.avatars(persona_type);
CREATE INDEX IF NOT EXISTS idx_avatars_business_function ON public.avatars(business_function);
CREATE INDEX IF NOT EXISTS idx_avatars_recommended_tier ON public.avatars(recommended_tier);
CREATE INDEX IF NOT EXISTS idx_avatars_is_active ON public.avatars(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_avatars_filename ON public.avatars(filename);

-- Add unique constraint on category combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_avatars_unique_combo
ON public.avatars(persona_type, business_function, variant_number);

-- Add comments
COMMENT ON TABLE public.avatars IS 'SVG avatar management system for agent assignment';
COMMENT ON COLUMN public.avatars.persona_type IS 'Avatar style type: expert, foresight, medical, pharma, startup';
COMMENT ON COLUMN public.avatars.business_function IS 'Business area: analytics_insights, commercial_marketing, market_access, medical_affairs, product_innovation';
COMMENT ON COLUMN public.avatars.variant_number IS 'Variant number within category (1-20)';
COMMENT ON COLUMN public.avatars.recommended_tier IS 'Suggested agent tier for this avatar style';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS avatars_updated_at_trigger ON public.avatars;
CREATE TRIGGER avatars_updated_at_trigger
    BEFORE UPDATE ON public.avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_avatars_updated_at();

-- Enable RLS
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - avatars are public for reading
CREATE POLICY "avatars_select_public" ON public.avatars
    FOR SELECT USING (true);

-- Only authenticated users can insert (for admin tools)
CREATE POLICY "avatars_insert_authenticated" ON public.avatars
    FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Only service role can update/delete
CREATE POLICY "avatars_update_service_role" ON public.avatars
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "avatars_delete_service_role" ON public.avatars
    FOR DELETE USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.avatars TO authenticated;
GRANT SELECT ON public.avatars TO anon;
GRANT ALL ON public.avatars TO service_role;

-- ============================================================================
-- Create view for easy avatar selection by agent type
-- ============================================================================
CREATE OR REPLACE VIEW public.v_avatars_by_category AS
SELECT
    id,
    filename,
    public_url,
    persona_type,
    business_function,
    variant_number,
    display_name,
    recommended_tier,
    -- Computed categories for UI filtering
    CASE persona_type
        WHEN 'expert' THEN 'Expert Agents'
        WHEN 'foresight' THEN 'Foresight/Strategy Agents'
        WHEN 'medical' THEN 'Medical/Clinical Agents'
        WHEN 'pharma' THEN 'Pharmaceutical Agents'
        WHEN 'startup' THEN 'Innovation/Startup Agents'
    END AS persona_label,
    CASE business_function
        WHEN 'analytics_insights' THEN 'Analytics & Insights'
        WHEN 'commercial_marketing' THEN 'Commercial & Marketing'
        WHEN 'market_access' THEN 'Market Access'
        WHEN 'medical_affairs' THEN 'Medical Affairs'
        WHEN 'product_innovation' THEN 'Product Innovation'
    END AS function_label
FROM public.avatars
WHERE is_active = true
ORDER BY persona_type, business_function, variant_number;

GRANT SELECT ON public.v_avatars_by_category TO authenticated;
GRANT SELECT ON public.v_avatars_by_category TO anon;

-- ============================================================================
-- Function to get random avatar by criteria
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_random_avatar(
    p_persona_type TEXT DEFAULT NULL,
    p_business_function TEXT DEFAULT NULL,
    p_tier INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    filename TEXT,
    public_url TEXT,
    persona_type TEXT,
    business_function TEXT,
    display_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.filename,
        a.public_url,
        a.persona_type,
        a.business_function,
        a.display_name
    FROM public.avatars a
    WHERE
        a.is_active = true
        AND (p_persona_type IS NULL OR a.persona_type = p_persona_type)
        AND (p_business_function IS NULL OR a.business_function = p_business_function)
        AND (p_tier IS NULL OR a.recommended_tier = p_tier)
    ORDER BY random()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to suggest avatar based on agent metadata
-- ============================================================================
CREATE OR REPLACE FUNCTION public.suggest_avatar_for_agent(
    p_agent_name TEXT,
    p_tier INTEGER DEFAULT 2,
    p_knowledge_domains TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
    id UUID,
    filename TEXT,
    public_url TEXT,
    match_score INTEGER
) AS $$
DECLARE
    v_persona_type TEXT;
    v_business_function TEXT;
BEGIN
    -- Determine persona type based on agent name/domains
    v_persona_type := CASE
        WHEN p_agent_name ILIKE '%medical%' OR p_agent_name ILIKE '%clinical%' THEN 'medical'
        WHEN p_agent_name ILIKE '%pharma%' OR p_agent_name ILIKE '%drug%' THEN 'pharma'
        WHEN p_agent_name ILIKE '%innovation%' OR p_agent_name ILIKE '%startup%' THEN 'startup'
        WHEN p_agent_name ILIKE '%strategy%' OR p_agent_name ILIKE '%foresight%' THEN 'foresight'
        ELSE 'expert'
    END;

    -- Determine business function
    v_business_function := CASE
        WHEN p_agent_name ILIKE '%analytics%' OR p_agent_name ILIKE '%insight%' OR p_agent_name ILIKE '%data%' THEN 'analytics_insights'
        WHEN p_agent_name ILIKE '%market%' AND p_agent_name ILIKE '%access%' THEN 'market_access'
        WHEN p_agent_name ILIKE '%commercial%' OR p_agent_name ILIKE '%marketing%' OR p_agent_name ILIKE '%sales%' THEN 'commercial_marketing'
        WHEN p_agent_name ILIKE '%medical%' OR p_agent_name ILIKE '%affairs%' OR p_agent_name ILIKE '%msl%' THEN 'medical_affairs'
        WHEN p_agent_name ILIKE '%product%' OR p_agent_name ILIKE '%innovation%' OR p_agent_name ILIKE '%r&d%' THEN 'product_innovation'
        ELSE 'analytics_insights'  -- Default
    END;

    RETURN QUERY
    SELECT
        a.id,
        a.filename,
        a.public_url,
        CASE
            WHEN a.persona_type = v_persona_type AND a.business_function = v_business_function THEN 100
            WHEN a.persona_type = v_persona_type THEN 75
            WHEN a.business_function = v_business_function THEN 50
            ELSE 25
        END AS match_score
    FROM public.avatars a
    WHERE
        a.is_active = true
        AND (p_tier IS NULL OR a.recommended_tier = p_tier)
    ORDER BY match_score DESC, random()
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create storage bucket for avatars (run this via Supabase dashboard or API)
-- ============================================================================
-- NOTE: This SQL doesn't create the bucket - you need to do this via:
-- 1. Supabase Dashboard: Storage > Create new bucket > Name: "avatars" > Public: true
-- 2. Or via the management API

-- ============================================================================
-- Summary
-- ============================================================================
-- Created:
-- - avatars table with full categorization
-- - Indexes for efficient querying
-- - RLS policies (public read, authenticated insert, service update/delete)
-- - v_avatars_by_category view for UI
-- - get_random_avatar() function
-- - suggest_avatar_for_agent() function
--
-- Next steps:
-- 1. Create 'avatars' storage bucket in Supabase dashboard (set to public)
-- 2. Run the upload script to populate avatars table and storage
-- 3. Update agents to use new avatar URLs
-- ============================================================================
