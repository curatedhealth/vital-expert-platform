-- =====================================================================
-- NORMALIZE ORG-STRUCTURE SCHEMA TO ZERO JSONB
-- Gold Standard: Fully Normalized (3NF) Organizational Structure
-- =====================================================================
-- This migration removes all JSONB columns and replaces them with
-- proper relational tables and junction tables for maximum queryability
-- =====================================================================

BEGIN;

-- =====================================================================
-- PART 1: CREATE MASTER DATA TABLES (DIMENSIONS)
-- =====================================================================

-- 1. Geographic Scope Master
-- Note: Table already exists, ensure it has required columns
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geographic_scopes') THEN
        CREATE TABLE public.geographic_scopes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            scope_code varchar(50) NOT NULL UNIQUE,
            name varchar(100) NOT NULL,
            description text,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now()
        );
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'geographic_scopes' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.geographic_scopes ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 2. Geographic Regions Master
-- Note: Table already exists, ensure it has required columns
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geographic_regions') THEN
        CREATE TABLE public.geographic_regions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            code varchar(50) NOT NULL UNIQUE,
            name varchar(100) NOT NULL,
            parent_region_id uuid REFERENCES public.geographic_regions(id),
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'geographic_regions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.geographic_regions ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 3. Seniority Levels Master
CREATE TABLE IF NOT EXISTS public.seniority_levels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE, -- e.g., 'EXECUTIVE', 'SENIOR', 'MID', 'JUNIOR', 'ENTRY'
    name varchar(100) NOT NULL,
    level_order integer NOT NULL, -- For sorting (1=Executive, 5=Entry)
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Stakeholder Types Master
-- Note: Table may already exist with different structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stakeholder_types') THEN
        CREATE TABLE public.stakeholder_types (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            code varchar(50) NOT NULL UNIQUE,
            name varchar(100) NOT NULL,
            category varchar(50) NOT NULL CHECK (category IN ('INTERNAL', 'EXTERNAL')),
            description text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
    
    -- Add missing columns if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stakeholder_types') THEN
        -- Note: Existing table uses stakeholder_code and stakeholder_category
        -- Don't add code/category if stakeholder_code exists
        
        -- Add updated_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'stakeholder_types' 
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.stakeholder_types ADD COLUMN updated_at timestamptz DEFAULT now();
        END IF;
    END IF;
END $$;

-- 5. KPI Definitions Library
CREATE TABLE IF NOT EXISTS public.kpi_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE,
    name varchar(100) NOT NULL,
    category varchar(50), -- e.g., 'FINANCIAL', 'OPERATIONAL', 'CLINICAL', 'COMMERCIAL'
    measurement_unit varchar(50), -- e.g., 'PERCENTAGE', 'COUNT', 'DOLLARS', 'DAYS'
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Relationship Types Master
CREATE TABLE IF NOT EXISTS public.relationship_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE, -- e.g., 'DOTTED_LINE', 'FUNCTIONAL', 'ADMINISTRATIVE', 'PROJECT'
    name varchar(100) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. Transition Types Master (for career paths)
CREATE TABLE IF NOT EXISTS public.transition_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE, -- e.g., 'PROMOTION', 'LATERAL', 'ROTATION', 'DEMOTION'
    name varchar(100) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================================
-- PART 2: SEED MASTER DATA
-- =====================================================================

-- Geographic Scopes
-- Only insert if they don't already exist
INSERT INTO public.geographic_scopes (scope_code, name, description, is_active) 
SELECT * FROM (VALUES
    ('GLOBAL', 'Global', 'Global scope covering all regions', true),
    ('REGIONAL', 'Regional', 'Regional scope covering multiple countries', true),
    ('LOCAL', 'Local', 'Local scope covering single country or market', true)
) AS v(scope_code, name, description, is_active)
WHERE NOT EXISTS (
    SELECT 1 FROM public.geographic_scopes WHERE geographic_scopes.scope_code = v.scope_code
);

-- Geographic Regions
-- Only insert if they don't already exist
-- Note: geographic_regions table requires region_type (NOT NULL)
DO $$
DECLARE
    has_is_active BOOLEAN;
    has_region_type BOOLEAN;
BEGIN
    -- Check if is_active column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'geographic_regions' 
        AND column_name = 'is_active'
    ) INTO has_is_active;
    
    -- Check if region_type column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'geographic_regions' 
        AND column_name = 'region_type'
    ) INTO has_region_type;
    
    IF has_region_type AND has_is_active THEN
        INSERT INTO public.geographic_regions (code, name, region_type, is_active) 
        SELECT * FROM (VALUES
            ('GLOBAL', 'Global', 'GLOBAL', true),
            ('NORTH_AMERICA', 'North America', 'REGIONAL', true),
            ('EMEA', 'EMEA', 'REGIONAL', true),
            ('APAC', 'Asia Pacific', 'REGIONAL', true),
            ('LATAM', 'Latin America', 'REGIONAL', true)
        ) AS v(code, name, region_type, is_active)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.geographic_regions WHERE geographic_regions.code = v.code
        );
    ELSIF has_region_type THEN
        INSERT INTO public.geographic_regions (code, name, region_type) 
        SELECT * FROM (VALUES
            ('GLOBAL', 'Global', 'GLOBAL'),
            ('NORTH_AMERICA', 'North America', 'REGIONAL'),
            ('EMEA', 'EMEA', 'REGIONAL'),
            ('APAC', 'Asia Pacific', 'REGIONAL'),
            ('LATAM', 'Latin America', 'REGIONAL')
        ) AS v(code, name, region_type)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.geographic_regions WHERE geographic_regions.code = v.code
        );
    ELSIF has_is_active THEN
        INSERT INTO public.geographic_regions (code, name, is_active) 
        SELECT * FROM (VALUES
            ('GLOBAL', 'Global', true),
            ('NORTH_AMERICA', 'North America', true),
            ('EMEA', 'EMEA', true),
            ('APAC', 'Asia Pacific', true),
            ('LATAM', 'Latin America', true)
        ) AS v(code, name, is_active)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.geographic_regions WHERE geographic_regions.code = v.code
        );
    ELSE
        INSERT INTO public.geographic_regions (code, name) 
        SELECT * FROM (VALUES
            ('GLOBAL', 'Global'),
            ('NORTH_AMERICA', 'North America'),
            ('EMEA', 'EMEA'),
            ('APAC', 'Asia Pacific'),
            ('LATAM', 'Latin America')
        ) AS v(code, name)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.geographic_regions WHERE geographic_regions.code = v.code
        );
    END IF;
END $$;

-- Seniority Levels
INSERT INTO public.seniority_levels (code, name, level_order, description) VALUES
('EXECUTIVE', 'Executive', 1, 'C-level and VP roles'),
('SENIOR', 'Senior', 2, 'Director and Senior Manager roles'),
('MID', 'Mid-Level', 3, 'Manager and Specialist roles'),
('JUNIOR', 'Junior', 4, 'Associate and Coordinator roles'),
('ENTRY', 'Entry', 5, 'Entry-level positions')
ON CONFLICT (code) DO NOTHING;

-- Stakeholder Types
-- Note: Table uses stakeholder_code and stakeholder_category columns
DO $$
DECLARE
    has_stakeholder_code BOOLEAN;
    has_stakeholder_category BOOLEAN;
    has_is_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholder_types' 
        AND column_name = 'stakeholder_code'
    ) INTO has_stakeholder_code;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholder_types' 
        AND column_name = 'stakeholder_category'
    ) INTO has_stakeholder_category;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'stakeholder_types' 
        AND column_name = 'is_active'
    ) INTO has_is_active;
    
    IF has_stakeholder_code AND has_stakeholder_category AND has_is_active THEN
        INSERT INTO public.stakeholder_types (stakeholder_code, name, stakeholder_category, description, is_active) 
        SELECT * FROM (VALUES
            ('KOL', 'Key Opinion Leader', 'EXTERNAL', 'Medical thought leaders and experts', true),
            ('PAYER', 'Payer', 'EXTERNAL', 'Insurance companies and payers', true),
            ('REGULATOR', 'Regulator', 'EXTERNAL', 'Regulatory bodies (FDA, EMA, etc.)', true),
            ('PATIENT', 'Patient', 'EXTERNAL', 'Patients and patient advocacy groups', true),
            ('PROVIDER', 'Healthcare Provider', 'EXTERNAL', 'Physicians, nurses, and healthcare providers', true),
            ('INTERNAL_EXECUTIVE', 'Internal Executive', 'INTERNAL', 'C-level executives', true),
            ('INTERNAL_PEER', 'Internal Peer', 'INTERNAL', 'Peer roles in other functions', true),
            ('INTERNAL_SUBORDINATE', 'Internal Subordinate', 'INTERNAL', 'Direct reports and team members', true)
        ) AS v(stakeholder_code, name, stakeholder_category, description, is_active)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.stakeholder_types WHERE stakeholder_types.stakeholder_code = v.stakeholder_code
        );
    ELSIF has_stakeholder_code AND has_stakeholder_category THEN
        INSERT INTO public.stakeholder_types (stakeholder_code, name, stakeholder_category, description) 
        SELECT * FROM (VALUES
            ('KOL', 'Key Opinion Leader', 'EXTERNAL', 'Medical thought leaders and experts'),
            ('PAYER', 'Payer', 'EXTERNAL', 'Insurance companies and payers'),
            ('REGULATOR', 'Regulator', 'EXTERNAL', 'Regulatory bodies (FDA, EMA, etc.)'),
            ('PATIENT', 'Patient', 'EXTERNAL', 'Patients and patient advocacy groups'),
            ('PROVIDER', 'Healthcare Provider', 'EXTERNAL', 'Physicians, nurses, and healthcare providers'),
            ('INTERNAL_EXECUTIVE', 'Internal Executive', 'INTERNAL', 'C-level executives'),
            ('INTERNAL_PEER', 'Internal Peer', 'INTERNAL', 'Peer roles in other functions'),
            ('INTERNAL_SUBORDINATE', 'Internal Subordinate', 'INTERNAL', 'Direct reports and team members')
        ) AS v(stakeholder_code, name, stakeholder_category, description)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.stakeholder_types WHERE stakeholder_types.stakeholder_code = v.stakeholder_code
        );
    ELSIF has_stakeholder_code THEN
        INSERT INTO public.stakeholder_types (stakeholder_code, name, description) 
        SELECT * FROM (VALUES
            ('KOL', 'Key Opinion Leader', 'Medical thought leaders and experts'),
            ('PAYER', 'Payer', 'Insurance companies and payers'),
            ('REGULATOR', 'Regulator', 'Regulatory bodies (FDA, EMA, etc.)'),
            ('PATIENT', 'Patient', 'Patients and patient advocacy groups'),
            ('PROVIDER', 'Healthcare Provider', 'Physicians, nurses, and healthcare providers'),
            ('INTERNAL_EXECUTIVE', 'Internal Executive', 'C-level executives'),
            ('INTERNAL_PEER', 'Internal Peer', 'Peer roles in other functions'),
            ('INTERNAL_SUBORDINATE', 'Internal Subordinate', 'Direct reports and team members')
        ) AS v(stakeholder_code, name, description)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.stakeholder_types WHERE stakeholder_types.stakeholder_code = v.stakeholder_code
        );
    END IF;
END $$;

-- Relationship Types
INSERT INTO public.relationship_types (code, name, description) VALUES
('SOLID_LINE', 'Solid Line', 'Direct reporting relationship'),
('DOTTED_LINE', 'Dotted Line', 'Matrix reporting relationship'),
('FUNCTIONAL', 'Functional', 'Functional reporting relationship'),
('ADMINISTRATIVE', 'Administrative', 'Administrative reporting relationship'),
('PROJECT', 'Project', 'Project-based reporting relationship')
ON CONFLICT (code) DO NOTHING;

-- Transition Types
INSERT INTO public.transition_types (code, name, description) VALUES
('PROMOTION', 'Promotion', 'Advancement to higher level role'),
('LATERAL', 'Lateral Move', 'Move to similar level role'),
('ROTATION', 'Rotation', 'Temporary assignment to different role'),
('DEMOTION', 'Demotion', 'Move to lower level role'),
('ENTRY', 'Entry', 'Entry into organization')
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- PART 3: UPDATE ORG_ROLES TABLE (Remove JSONB, Add FKs)
-- =====================================================================

-- Add new foreign key columns
ALTER TABLE public.org_roles 
    ADD COLUMN IF NOT EXISTS seniority_level_id uuid REFERENCES public.seniority_levels(id),
    ADD COLUMN IF NOT EXISTS geographic_scope_id uuid REFERENCES public.geographic_scopes(id),
    ADD COLUMN IF NOT EXISTS job_code varchar(50),
    ADD COLUMN IF NOT EXISTS grade_level integer,
    ADD COLUMN IF NOT EXISTS fte_count_budget numeric(10,2),
    ADD COLUMN IF NOT EXISTS budget_authority_limit numeric(15,2),
    ADD COLUMN IF NOT EXISTS currency_code varchar(3) DEFAULT 'USD';

-- Migrate seniority_level text to seniority_level_id
UPDATE public.org_roles r
SET seniority_level_id = (
    SELECT id FROM public.seniority_levels 
    WHERE UPPER(code) = UPPER(r.seniority_level)
    LIMIT 1
)
WHERE r.seniority_level IS NOT NULL 
    AND r.seniority_level_id IS NULL;

-- Migrate geographic_scope text to geographic_scope_id
UPDATE public.org_roles r
SET geographic_scope_id = (
    SELECT id FROM public.geographic_scopes 
    WHERE UPPER(scope_code) = UPPER(r.geographic_scope)
    LIMIT 1
)
WHERE r.geographic_scope IS NOT NULL 
    AND r.geographic_scope_id IS NULL;

-- =====================================================================
-- PART 4: CREATE JUNCTION TABLES
-- =====================================================================

-- A. Geographic Coverage
-- Note: Check if similar table exists (role_geographic_regions, role_countries, etc.)
DO $$
BEGIN
    -- Create role_geographic_coverage if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_geographic_coverage'
    ) THEN
        CREATE TABLE public.role_geographic_coverage (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            region_id uuid REFERENCES public.geographic_regions(id),
            country_id uuid REFERENCES public.countries(id),
            is_primary boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT ck_role_geo_target CHECK (region_id IS NOT NULL OR country_id IS NOT NULL)
        );
    END IF;
END $$;

-- Create indexes for role_geographic_coverage (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_geographic_coverage') THEN
        CREATE INDEX IF NOT EXISTS idx_role_geo_coverage_role ON public.role_geographic_coverage(role_id);
        CREATE INDEX IF NOT EXISTS idx_role_geo_coverage_region ON public.role_geographic_coverage(region_id);
        CREATE INDEX IF NOT EXISTS idx_role_geo_coverage_country ON public.role_geographic_coverage(country_id);
    END IF;
END $$;

-- B. Therapeutic Focus
-- Note: role_therapeutic_areas may already exist with different structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_therapeutic_focus'
    ) THEN
        CREATE TABLE public.role_therapeutic_focus (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            therapeutic_area_id uuid NOT NULL REFERENCES public.therapeutic_areas(id),
            expertise_level varchar(50) CHECK (expertise_level IN ('EXPERT', 'GENERALIST', 'NOVICE')),
            is_primary boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- Create indexes for role_therapeutic_focus (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_therapeutic_focus') THEN
        CREATE INDEX IF NOT EXISTS idx_role_therapeutic_focus_role ON public.role_therapeutic_focus(role_id);
        CREATE INDEX IF NOT EXISTS idx_role_therapeutic_focus_ta ON public.role_therapeutic_focus(therapeutic_area_id);
    END IF;
END $$;

-- C. Matrix Reporting Relationships
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_reporting_relationships'
    ) THEN
        CREATE TABLE public.role_reporting_relationships (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            subject_role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            manager_role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            relationship_type_id uuid NOT NULL REFERENCES public.relationship_types(id),
            description text,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT ck_role_reporting_different CHECK (subject_role_id != manager_role_id)
        );
    END IF;
END $$;

-- Create indexes for role_reporting_relationships
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_reporting_relationships') THEN
        CREATE INDEX IF NOT EXISTS idx_role_reporting_subject ON public.role_reporting_relationships(subject_role_id);
        CREATE INDEX IF NOT EXISTS idx_role_reporting_manager ON public.role_reporting_relationships(manager_role_id);
        CREATE INDEX IF NOT EXISTS idx_role_reporting_type ON public.role_reporting_relationships(relationship_type_id);
    END IF;
END $$;

-- D. Stakeholder Interactions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_stakeholder_interactions'
    ) THEN
        CREATE TABLE public.role_stakeholder_interactions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            stakeholder_type_id uuid REFERENCES public.stakeholder_types(id),
            target_specific_role_id uuid REFERENCES public.org_roles(id), -- For internal stakeholder interactions
            interaction_frequency varchar(50) CHECK (interaction_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'AD_HOC')),
            interaction_nature varchar(50) CHECK (interaction_nature IN ('INFLUENCE', 'DECISION', 'INFORM', 'COLLABORATE', 'MANAGE')),
            description text,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT ck_role_stakeholder_target CHECK (stakeholder_type_id IS NOT NULL OR target_specific_role_id IS NOT NULL)
        );
    END IF;
END $$;

-- Create indexes for role_stakeholder_interactions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_stakeholder_interactions') THEN
        CREATE INDEX IF NOT EXISTS idx_role_stakeholder_role ON public.role_stakeholder_interactions(role_id);
        CREATE INDEX IF NOT EXISTS idx_role_stakeholder_type ON public.role_stakeholder_interactions(stakeholder_type_id);
        CREATE INDEX IF NOT EXISTS idx_role_stakeholder_target_role ON public.role_stakeholder_interactions(target_specific_role_id);
    END IF;
END $$;

-- E. Success Metrics / KPIs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_success_metrics'
    ) THEN
        CREATE TABLE public.role_success_metrics (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            kpi_id uuid NOT NULL REFERENCES public.kpi_definitions(id),
            target_value_desc text, -- e.g., 'Increase by 10%', 'Maintain <5%'
            weight_percentage integer CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
            is_mandatory boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- Create indexes for role_success_metrics
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_success_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_role_success_metrics_role ON public.role_success_metrics(role_id);
        CREATE INDEX IF NOT EXISTS idx_role_success_metrics_kpi ON public.role_success_metrics(kpi_id);
    END IF;
END $$;

-- F. Career Paths
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'role_career_paths'
    ) THEN
        CREATE TABLE public.role_career_paths (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            from_role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            to_role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
            transition_type_id uuid NOT NULL REFERENCES public.transition_types(id),
            typical_tenure_years_required numeric(4,1),
            readiness_score_requirement integer CHECK (readiness_score_requirement >= 0 AND readiness_score_requirement <= 100),
            description text,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            CONSTRAINT ck_role_career_path_different CHECK (from_role_id != to_role_id)
        );
    END IF;
END $$;

-- Create indexes for role_career_paths
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_career_paths') THEN
        CREATE INDEX IF NOT EXISTS idx_role_career_path_from ON public.role_career_paths(from_role_id);
        CREATE INDEX IF NOT EXISTS idx_role_career_path_to ON public.role_career_paths(to_role_id);
        CREATE INDEX IF NOT EXISTS idx_role_career_path_type ON public.role_career_paths(transition_type_id);
    END IF;
END $$;

-- =====================================================================
-- PART 5: ENHANCED USER ROLE ASSIGNMENTS (Temporal)
-- =====================================================================

-- Create enhanced user role assignments with temporal support
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    is_acting boolean DEFAULT false, -- Acting/Interim roles
    is_primary boolean DEFAULT true, -- User might have multiple hats
    
    effective_from date NOT NULL DEFAULT CURRENT_DATE,
    effective_to date, -- NULL means current
    
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES public.user_profiles(id),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT uq_user_role_tenant UNIQUE (user_id, role_id, tenant_id, effective_from)
);

-- Create exclusion constraint to prevent overlapping primary roles
-- Note: This requires btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user ON public.user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_role ON public.user_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_tenant ON public.user_role_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_dates ON public.user_role_assignments(effective_from, effective_to);

-- Exclusion constraint for primary roles (prevents overlapping primary role assignments)
-- Note: This may fail if there's existing overlapping data - handle separately
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'uq_user_primary_role_timeline'
    ) THEN
        ALTER TABLE public.user_role_assignments
        ADD CONSTRAINT uq_user_primary_role_timeline 
        EXCLUDE USING GIST (
            user_id WITH =, 
            tenant_id WITH =, 
            daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
        ) WHERE (is_primary = true);
    END IF;
END $$;

-- =====================================================================
-- PART 6: DATA MIGRATION FROM JSONB (If JSONB columns exist)
-- =====================================================================

-- Note: This section migrates data from existing JSONB columns
-- Run only if you have existing JSONB data to migrate

-- Example: Migrate geographic_regions JSONB to role_geographic_coverage
-- This is a template - adjust based on your actual JSONB structure
/*
DO $$
DECLARE
    role_rec RECORD;
    region_code TEXT;
    region_id_val UUID;
BEGIN
    FOR role_rec IN 
        SELECT id, geographic_regions 
        FROM org_roles 
        WHERE geographic_regions IS NOT NULL 
        AND jsonb_typeof(geographic_regions) = 'array'
    LOOP
        FOR region_code IN 
            SELECT jsonb_array_elements_text(role_rec.geographic_regions)
        LOOP
            SELECT id INTO region_id_val 
            FROM geographic_regions 
            WHERE code = region_code;
            
            IF region_id_val IS NOT NULL THEN
                INSERT INTO role_geographic_coverage (role_id, region_id, is_primary)
                VALUES (role_rec.id, region_id_val, false)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;
*/

-- =====================================================================
-- PART 7: CREATE HELPER VIEWS FOR COMMON QUERIES
-- =====================================================================

-- View: Complete role information with all relationships
CREATE OR REPLACE VIEW public.v_roles_complete AS
SELECT 
    r.id,
    r.tenant_id,
    r.name,
    r.slug,
    r.description,
    f.name as function_name,
    d.name as department_name,
    sl.name as seniority_level,
    gs.name as geographic_scope,
    r.reports_to_role_id,
    r.is_active,
    r.created_at
FROM org_roles r
LEFT JOIN org_functions f ON r.function_id = f.id
LEFT JOIN org_departments d ON r.department_id = d.id
LEFT JOIN seniority_levels sl ON r.seniority_level_id = sl.id
LEFT JOIN geographic_scopes gs ON r.geographic_scope_id = gs.id;

-- View: Role with geographic coverage
CREATE OR REPLACE VIEW public.v_roles_geographic_coverage AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.tenant_id,
    gr.code as region_code,
    gr.name as region_name,
    c.code as country_code,
    c.name as country_name,
    rgc.is_primary
FROM org_roles r
INNER JOIN role_geographic_coverage rgc ON r.id = rgc.role_id
LEFT JOIN geographic_regions gr ON rgc.region_id = gr.id
LEFT JOIN countries c ON rgc.country_id = c.id;

-- View: Role reporting relationships (including matrix)
CREATE OR REPLACE VIEW public.v_roles_reporting_structure AS
SELECT 
    subject.id as subject_role_id,
    subject.name as subject_role_name,
    manager.id as manager_role_id,
    manager.name as manager_role_name,
    rt.code as relationship_type,
    rt.name as relationship_name,
    rrr.description,
    rrr.is_active
FROM role_reporting_relationships rrr
INNER JOIN org_roles subject ON rrr.subject_role_id = subject.id
INNER JOIN org_roles manager ON rrr.manager_role_id = manager.id
INNER JOIN relationship_types rt ON rrr.relationship_type_id = rt.id;

-- =====================================================================
-- PART 8: CLEANUP - Remove JSONB columns (After migration verified)
-- =====================================================================

-- WARNING: Only run this after verifying data migration is complete
-- Uncomment when ready to remove JSONB columns

/*
ALTER TABLE public.org_roles 
    DROP COLUMN IF EXISTS geographic_regions,
    DROP COLUMN IF EXISTS therapeutic_areas,
    DROP COLUMN IF EXISTS disease_areas,
    DROP COLUMN IF EXISTS reports_to_dotted_line,
    DROP COLUMN IF EXISTS career_path_from,
    DROP COLUMN IF EXISTS career_path_to,
    DROP COLUMN IF EXISTS kpi_categories,
    DROP COLUMN IF EXISTS internal_stakeholders,
    DROP COLUMN IF EXISTS external_stakeholders,
    DROP COLUMN IF EXISTS key_relationships,
    DROP COLUMN IF EXISTS geographic_scope, -- Keep if still using as text, or migrate to geographic_scope_id
    DROP COLUMN IF EXISTS seniority_level; -- Keep if still using as text, or migrate to seniority_level_id
*/

COMMIT;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

SELECT '=== NORMALIZATION COMPLETE ===' as status;

SELECT 
    'Master Tables' as category,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'geographic_scopes', 'geographic_regions', 'seniority_levels',
        'stakeholder_types', 'kpi_definitions', 'relationship_types', 'transition_types'
    );

SELECT 
    'Junction Tables' as category,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'role_geographic_coverage', 'role_therapeutic_focus',
        'role_reporting_relationships', 'role_stakeholder_interactions',
        'role_success_metrics', 'role_career_paths'
    );

