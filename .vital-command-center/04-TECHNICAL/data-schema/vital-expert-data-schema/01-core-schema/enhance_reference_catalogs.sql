-- =====================================================================
-- PHASE 1.2: ENHANCE REFERENCE CATALOGS
-- Ensures all master reference tables exist with proper structure
-- Renames jobs_to_be_done to jtbd for consistency
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ENHANCING REFERENCE CATALOGS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. RENAME jobs_to_be_done TO jtbd
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Renaming jobs_to_be_done to jtbd...'; END $$;

DO $$
BEGIN
    -- Check if jobs_to_be_done exists and jtbd doesn't
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs_to_be_done')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        
        -- Rename the table
        ALTER TABLE public.jobs_to_be_done RENAME TO jtbd;
        RAISE NOTICE '  ✓ Renamed jobs_to_be_done to jtbd';
        
        -- Rename constraints
        ALTER TABLE public.jtbd RENAME CONSTRAINT jobs_to_be_done_pkey TO jtbd_pkey;
        
        -- Update indexes
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_function RENAME TO idx_jtbd_function;
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_function_name RENAME TO idx_jtbd_function_name;
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_department RENAME TO idx_jtbd_department;
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_department_name RENAME TO idx_jtbd_department_name;
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_role RENAME TO idx_jtbd_role;
        ALTER INDEX IF EXISTS idx_jobs_to_be_done_role_name RENAME TO idx_jtbd_role_name;
        
        RAISE NOTICE '  ✓ Updated constraints and indexes';
        
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jtbd') THEN
        RAISE NOTICE '  ✓ jtbd table already exists';
    ELSE
        RAISE NOTICE '  ⚠ Neither jobs_to_be_done nor jtbd table exists - will create jtbd';
    END IF;
END $$;

-- =====================================================================
-- 2. ENSURE JTBD TABLE EXISTS WITH PROPER STRUCTURE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Ensuring jtbd table structure...'; END $$;

CREATE TABLE IF NOT EXISTS public.jtbd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- JTBD Components
    job_statement TEXT, -- "When I..., I want to..., so that..."
    functional_job TEXT,
    emotional_job TEXT,
    social_job TEXT,
    
    -- Categorization
    category TEXT,
    job_type TEXT CHECK (job_type IN ('main', 'related', 'consumption_chain')),
    
    -- Context
    circumstance TEXT, -- "When..." context
    desired_outcome TEXT, -- "So that..." goal
    
    -- Org mapping (from add_org_mapping_to_all_tables.sql)
    function_id UUID,
    function_name TEXT,
    department_id UUID,
    department_name TEXT,
    role_id UUID,
    role_name TEXT,
    tenant_id UUID REFERENCES public.tenants(id),
    
    -- Status
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'category') THEN
        ALTER TABLE public.jtbd ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'job_type') THEN
        ALTER TABLE public.jtbd ADD COLUMN job_type TEXT CHECK (job_type IN ('main', 'related', 'consumption_chain'));
        RAISE NOTICE '  ✓ Added job_type column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'circumstance') THEN
        ALTER TABLE public.jtbd ADD COLUMN circumstance TEXT;
        RAISE NOTICE '  ✓ Added circumstance column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jtbd' AND column_name = 'desired_outcome') THEN
        ALTER TABLE public.jtbd ADD COLUMN desired_outcome TEXT;
        RAISE NOTICE '  ✓ Added desired_outcome column';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jtbd_category ON public.jtbd(category);
CREATE INDEX IF NOT EXISTS idx_jtbd_job_type ON public.jtbd(job_type);
CREATE INDEX IF NOT EXISTS idx_jtbd_tenant ON public.jtbd(tenant_id);

DO $$ BEGIN RAISE NOTICE '  ✓ jtbd table structure ensured'; END $$;

-- =====================================================================
-- 3. COMMUNICATION CHANNELS REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating communication_channels reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    channel_type TEXT CHECK (channel_type IN ('digital', 'in_person', 'phone', 'written', 'social_media')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.communication_channels (channel_name, slug, channel_type) VALUES
    ('Email', 'email', 'digital'),
    ('Video Conference', 'video-conference', 'digital'),
    ('Phone Call', 'phone-call', 'phone'),
    ('In-Person Meeting', 'in-person-meeting', 'in_person'),
    ('Instant Messaging', 'instant-messaging', 'digital'),
    ('Conference Call', 'conference-call', 'phone'),
    ('LinkedIn', 'linkedin', 'social_media'),
    ('Twitter/X', 'twitter', 'social_media'),
    ('Slack', 'slack', 'digital'),
    ('Teams', 'teams', 'digital'),
    ('Written Report', 'written-report', 'written'),
    ('Presentation', 'presentation', 'in_person')
ON CONFLICT (channel_name) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '  ✓ communication_channels created'; END $$;

-- =====================================================================
-- 4. SUCCESS METRICS REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating success_metrics reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    metric_type TEXT CHECK (metric_type IN ('quantitative', 'qualitative', 'composite')),
    measurement_unit TEXT,
    measurement_frequency TEXT CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.success_metrics (metric_name, slug, metric_type, measurement_unit, measurement_frequency) VALUES
    ('KOL Engagement Rate', 'kol-engagement-rate', 'quantitative', 'percentage', 'quarterly'),
    ('Publication Impact', 'publication-impact', 'quantitative', 'citations', 'annually'),
    ('Stakeholder Satisfaction', 'stakeholder-satisfaction', 'qualitative', 'score', 'quarterly'),
    ('Response Time', 'response-time', 'quantitative', 'hours', 'monthly'),
    ('Budget Utilization', 'budget-utilization', 'quantitative', 'percentage', 'monthly'),
    ('Team Performance Score', 'team-performance-score', 'composite', 'score', 'quarterly'),
    ('Project Completion Rate', 'project-completion-rate', 'quantitative', 'percentage', 'monthly'),
    ('Quality Score', 'quality-score', 'composite', 'score', 'quarterly')
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '  ✓ success_metrics created'; END $$;

-- =====================================================================
-- 5. AI MATURITY LEVELS REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating ai_maturity_levels reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.ai_maturity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 5),
    ai_maturity_level_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    characteristics TEXT[],
    typical_tools TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
DECLARE
    has_level_name BOOLEAN;
    has_description BOOLEAN;
    has_characteristics BOOLEAN;
BEGIN
    -- Check what columns exist
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'level_name') INTO has_level_name;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'description') INTO has_description;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'characteristics') INTO has_characteristics;
    
    -- Old schema path: has level_name but may not have description
    IF has_level_name THEN
        RAISE NOTICE '  ✓ Detected existing schema with level_name column';
        
        -- Add missing columns if needed
        IF NOT has_description THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN description TEXT;
            RAISE NOTICE '  ✓ Added description column';
        END IF;
        
        IF NOT has_characteristics THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN characteristics TEXT[];
            RAISE NOTICE '  ✓ Added characteristics column';
        END IF;
        
        -- Insert using level_name (existing column) and description (not level_description)
        INSERT INTO public.ai_maturity_levels (level_number, level_name, description, characteristics) VALUES
            (1, 'Awareness', 'Basic awareness of AI capabilities, minimal or no usage', ARRAY['Aware of AI tools', 'No regular usage', 'Manual processes predominate']),
            (2, 'Experimentation', 'Testing AI tools on specific tasks, inconsistent usage', ARRAY['Testing AI tools', 'Inconsistent usage', 'Learning best practices']),
            (3, 'Integration', 'AI integrated into regular workflows, moderate usage', ARRAY['Regular AI usage', 'Workflow integration', 'Established practices']),
            (4, 'Optimization', 'AI-driven workflows, advanced usage patterns', ARRAY['AI-first approach', 'Advanced techniques', 'High proficiency']),
            (5, 'Innovation', 'Leading AI adoption, creating new AI-enabled processes', ARRAY['AI innovation', 'Creating new workflows', 'Thought leadership'])
        ON CONFLICT (level_number) DO NOTHING;
        RAISE NOTICE '  ✓ Populated ai_maturity_levels (existing schema with level_name)';
        
    ELSE
        -- New schema path: use ai_maturity_level_name
        RAISE NOTICE '  ✓ Creating new schema with ai_maturity_level_name column';
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'ai_maturity_level_name') THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN ai_maturity_level_name TEXT;
            RAISE NOTICE '  ✓ Added ai_maturity_level_name column';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_maturity_levels' AND column_name = 'slug') THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN slug TEXT;
            RAISE NOTICE '  ✓ Added slug column';
        END IF;
        
        IF NOT has_description THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN description TEXT;
            RAISE NOTICE '  ✓ Added description column';
        END IF;
        
        IF NOT has_characteristics THEN
            ALTER TABLE public.ai_maturity_levels ADD COLUMN characteristics TEXT[];
            RAISE NOTICE '  ✓ Added characteristics column';
        END IF;
        
        -- Insert with new schema
        INSERT INTO public.ai_maturity_levels (level_number, ai_maturity_level_name, slug, description, characteristics) VALUES
            (1, 'Awareness', 'awareness', 'Basic awareness of AI capabilities, minimal or no usage', ARRAY['Aware of AI tools', 'No regular usage', 'Manual processes predominate']),
            (2, 'Experimentation', 'experimentation', 'Testing AI tools on specific tasks, inconsistent usage', ARRAY['Testing AI tools', 'Inconsistent usage', 'Learning best practices']),
            (3, 'Integration', 'integration', 'AI integrated into regular workflows, moderate usage', ARRAY['Regular AI usage', 'Workflow integration', 'Established practices']),
            (4, 'Optimization', 'optimization', 'AI-driven workflows, advanced usage patterns', ARRAY['AI-first approach', 'Advanced techniques', 'High proficiency']),
            (5, 'Innovation', 'innovation', 'Leading AI adoption, creating new AI-enabled processes', ARRAY['AI innovation', 'Creating new workflows', 'Thought leadership'])
        ON CONFLICT (level_number) DO NOTHING;
        RAISE NOTICE '  ✓ Populated ai_maturity_levels (new schema with ai_maturity_level_name/slug)';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '  ✓ ai_maturity_levels created'; END $$;

-- =====================================================================
-- 6. VPANES DIMENSIONS REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating vpanes_dimensions reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.vpanes_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_code TEXT NOT NULL UNIQUE CHECK (dimension_code IN ('V', 'P', 'A', 'N', 'E', 'S')),
    dimension_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    scoring_guidance TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'dimension_name') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN dimension_name TEXT;
        RAISE NOTICE '  ✓ Added dimension_name column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'slug') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN slug TEXT;
        RAISE NOTICE '  ✓ Added slug column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'description') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN description TEXT;
        RAISE NOTICE '  ✓ Added description column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'scoring_guidance') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN scoring_guidance TEXT;
        RAISE NOTICE '  ✓ Added scoring_guidance column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vpanes_dimensions' AND column_name = 'weight') THEN
        ALTER TABLE public.vpanes_dimensions ADD COLUMN weight DECIMAL(3,2) DEFAULT 1.00;
        RAISE NOTICE '  ✓ Added weight column';
    END IF;
END $$;

INSERT INTO public.vpanes_dimensions (dimension_code, dimension_name, slug, description, scoring_guidance, weight) VALUES
    ('V', 'Value', 'value', 'Business value and ROI potential', 'Score based on revenue impact, cost savings, strategic importance', 1.00),
    ('P', 'Priority', 'priority', 'Strategic priority and urgency', 'Score based on alignment with strategic goals and timeline', 1.00),
    ('A', 'Addressability', 'addressability', 'Feasibility and reach', 'Score based on market size, accessibility, and technical feasibility', 1.00),
    ('N', 'Need', 'need', 'User need intensity and frequency', 'Score based on pain severity, frequency of need, and urgency', 1.00),
    ('E', 'Engagement', 'engagement', 'User engagement and adoption potential', 'Score based on willingness to adopt, ease of use, and stickiness', 1.00),
    ('S', 'Scale', 'scale', 'Scalability and growth potential', 'Score based on ability to scale, growth trajectory, and expansion opportunities', 1.00)
ON CONFLICT (dimension_code) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '  ✓ vpanes_dimensions created'; END $$;

-- =====================================================================
-- 7. GEOGRAPHIES REFERENCE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Creating geographies reference...'; END $$;

CREATE TABLE IF NOT EXISTS public.geographies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geography_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    geography_type TEXT NOT NULL CHECK (geography_type IN ('global', 'region', 'country', 'state', 'city')),
    parent_geography_id UUID REFERENCES public.geographies(id),
    iso_code TEXT, -- ISO 3166 codes for countries
    timezone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.geographies (geography_name, slug, geography_type, iso_code) VALUES
    ('Global', 'global', 'global', NULL),
    ('North America', 'north-america', 'region', NULL),
    ('EMEA', 'emea', 'region', NULL),
    ('APAC', 'apac', 'region', NULL),
    ('Latin America', 'latin-america', 'region', NULL),
    ('United States', 'united-states', 'country', 'US'),
    ('United Kingdom', 'united-kingdom', 'country', 'GB'),
    ('Germany', 'germany', 'country', 'DE'),
    ('France', 'france', 'country', 'FR'),
    ('China', 'china', 'country', 'CN'),
    ('Japan', 'japan', 'country', 'JP')
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '  ✓ geographies created'; END $$;

-- =====================================================================
-- 8. ENSURE TOOLS TABLE EXISTS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '8. Ensuring tools table exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    vendor TEXT,
    url TEXT,
    is_enterprise BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'category') THEN
        ALTER TABLE public.tools ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column to tools';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'vendor') THEN
        ALTER TABLE public.tools ADD COLUMN vendor TEXT;
        RAISE NOTICE '  ✓ Added vendor column to tools';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'url') THEN
        ALTER TABLE public.tools ADD COLUMN url TEXT;
        RAISE NOTICE '  ✓ Added url column to tools';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tools' AND column_name = 'is_enterprise') THEN
        ALTER TABLE public.tools ADD COLUMN is_enterprise BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✓ Added is_enterprise column to tools';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_vendor ON public.tools(vendor);

DO $$ BEGIN RAISE NOTICE '  ✓ tools table ensured'; END $$;

-- =====================================================================
-- 9. ENSURE SKILLS TABLE EXISTS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '9. Ensuring skills table exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    is_core BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'category') THEN
        ALTER TABLE public.skills ADD COLUMN category TEXT;
        RAISE NOTICE '  ✓ Added category column to skills';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'complexity_level') THEN
        ALTER TABLE public.skills ADD COLUMN complexity_level TEXT CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert'));
        RAISE NOTICE '  ✓ Added complexity_level column to skills';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'skills' AND column_name = 'is_core') THEN
        ALTER TABLE public.skills ADD COLUMN is_core BOOLEAN DEFAULT false;
        RAISE NOTICE '  ✓ Added is_core column to skills';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_complexity ON public.skills(complexity_level);

DO $$ BEGIN RAISE NOTICE '  ✓ skills table ensured'; END $$;

-- =====================================================================
-- 10. ENSURE STAKEHOLDERS TABLE EXISTS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '10. Ensuring stakeholders table exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stakeholder_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    stakeholder_type TEXT CHECK (stakeholder_type IN ('internal', 'external', 'regulatory', 'customer')),
    typical_role TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stakeholders' AND column_name = 'stakeholder_type') THEN
        ALTER TABLE public.stakeholders ADD COLUMN stakeholder_type TEXT CHECK (stakeholder_type IN ('internal', 'external', 'regulatory', 'customer'));
        RAISE NOTICE '  ✓ Added stakeholder_type column to stakeholders';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'stakeholders' AND column_name = 'typical_role') THEN
        ALTER TABLE public.stakeholders ADD COLUMN typical_role TEXT;
        RAISE NOTICE '  ✓ Added typical_role column to stakeholders';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stakeholders_type ON public.stakeholders(stakeholder_type);

DO $$ BEGIN RAISE NOTICE '  ✓ stakeholders table ensured'; END $$;

-- =====================================================================
-- 11. ENSURE RESPONSIBILITIES TABLE EXISTS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '11. Ensuring responsibilities table exists...'; END $$;

CREATE TABLE IF NOT EXISTS public.responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    responsibility_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    responsibility_type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'responsibilities' AND column_name = 'responsibility_type') THEN
        ALTER TABLE public.responsibilities ADD COLUMN responsibility_type TEXT;
        RAISE NOTICE '  ✓ Added responsibility_type column to responsibilities';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_responsibilities_type ON public.responsibilities(responsibility_type);

DO $$ BEGIN RAISE NOTICE '  ✓ responsibilities table ensured'; END $$;

-- =====================================================================
-- 12. SUMMARY
-- =====================================================================

DO $$
DECLARE
    jtbd_count INTEGER;
    comm_channels INTEGER;
    success_metrics INTEGER;
    ai_levels INTEGER;
    vpanes_dims INTEGER;
    geo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO jtbd_count FROM public.jtbd WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO comm_channels FROM public.communication_channels;
    SELECT COUNT(*) INTO success_metrics FROM public.success_metrics;
    SELECT COUNT(*) INTO ai_levels FROM public.ai_maturity_levels;
    SELECT COUNT(*) INTO vpanes_dims FROM public.vpanes_dimensions;
    SELECT COUNT(*) INTO geo_count FROM public.geographies;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'REFERENCE CATALOGS ENHANCED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created/Enhanced:';
    RAISE NOTICE '  ✓ jtbd (renamed from jobs_to_be_done) - % records', jtbd_count;
    RAISE NOTICE '  ✓ communication_channels - % records', comm_channels;
    RAISE NOTICE '  ✓ success_metrics - % records', success_metrics;
    RAISE NOTICE '  ✓ ai_maturity_levels - % levels (1-5)', ai_levels;
    RAISE NOTICE '  ✓ vpanes_dimensions - % dimensions (V,P,A,N,E,S)', vpanes_dims;
    RAISE NOTICE '  ✓ geographies - % records', geo_count;
    RAISE NOTICE '  ✓ tools (ensured exists)';
    RAISE NOTICE '  ✓ skills (ensured exists)';
    RAISE NOTICE '  ✓ stakeholders (ensured exists)';
    RAISE NOTICE '  ✓ responsibilities (ensured exists)';
    RAISE NOTICE '';
    RAISE NOTICE 'All reference catalogs ready for role and persona junctions!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

