-- ============================================================================
-- NEW DB SETUP: JTBD Multi-Level Mappings
-- JTBD can apply at different organizational levels:
--   - Individual (specific role)
--   - Team (department level)
--   - Function (cross-departmental)
--   - Cross-functional (organization-wide)
-- ============================================================================

-- ============================================================================
-- 1. JTBD HIERARCHY & SCOPE
-- ============================================================================

-- Add scope fields to jtbd_library if they don't exist
ALTER TABLE public.jtbd_library
ADD COLUMN IF NOT EXISTS scope_level text CHECK (scope_level IN ('individual', 'team', 'function', 'cross_functional')) DEFAULT 'individual';

ALTER TABLE public.jtbd_library
ADD COLUMN IF NOT EXISTS is_cross_functional boolean DEFAULT false;

ALTER TABLE public.jtbd_library
ADD COLUMN IF NOT EXISTS typical_frequency text CHECK (typical_frequency IN ('multiple_per_day', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'rarely'));

CREATE INDEX IF NOT EXISTS idx_jtbd_library_scope_level ON public.jtbd_library(scope_level);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_cross_functional ON public.jtbd_library(is_cross_functional) WHERE is_cross_functional = true;

COMMENT ON COLUMN public.jtbd_library.scope_level IS 'Organizational level at which this JTBD typically occurs';
COMMENT ON COLUMN public.jtbd_library.is_cross_functional IS 'True if JTBD spans multiple functions';

-- ============================================================================
-- 2. JTBD → ROLE MAPPING (Individual Level)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jtbd_role_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES public.jtbd_library(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,

    -- Mapping metadata
    relevance_score integer CHECK (relevance_score BETWEEN 1 AND 10) DEFAULT 5,
    typical_frequency text CHECK (typical_frequency IN ('multiple_per_day', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'rarely')),
    is_primary_jtbd boolean DEFAULT false, -- Is this a core JTBD for this role?

    -- Context
    typical_context text, -- When/why does this role do this JTBD?
    success_criteria text, -- How does this role measure success?
    common_obstacles text, -- What typically blocks success?

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(jtbd_id, role_id)
);

CREATE INDEX idx_jtbd_role_mapping_jtbd ON public.jtbd_role_mapping(jtbd_id);
CREATE INDEX idx_jtbd_role_mapping_role ON public.jtbd_role_mapping(role_id);
CREATE INDEX idx_jtbd_role_mapping_primary ON public.jtbd_role_mapping(is_primary_jtbd) WHERE is_primary_jtbd = true;
CREATE INDEX idx_jtbd_role_mapping_relevance ON public.jtbd_role_mapping(relevance_score DESC);

COMMENT ON TABLE public.jtbd_role_mapping IS 'Maps JTBD to specific organizational roles (individual level)';

-- ============================================================================
-- 3. JTBD → DEPARTMENT MAPPING (Team Level)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jtbd_department_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES public.jtbd_library(id) ON DELETE CASCADE,
    department_id uuid NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,

    -- Team-level context
    team_ownership text, -- Which team within dept owns this?
    collaboration_required boolean DEFAULT false,
    typical_team_size integer,
    avg_time_investment_hours numeric(10,2), -- Hours per occurrence

    -- Metrics
    success_rate numeric(5,2) CHECK (success_rate BETWEEN 0 AND 100), -- % successful completion
    bottlenecks text, -- Common team-level bottlenecks

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(jtbd_id, department_id)
);

CREATE INDEX idx_jtbd_dept_mapping_jtbd ON public.jtbd_department_mapping(jtbd_id);
CREATE INDEX idx_jtbd_dept_mapping_dept ON public.jtbd_department_mapping(department_id);

COMMENT ON TABLE public.jtbd_department_mapping IS 'Maps JTBD to departments (team level)';

-- ============================================================================
-- 4. JTBD → FUNCTION MAPPING (Function Level)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jtbd_function_mapping (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jtbd_id uuid NOT NULL REFERENCES public.jtbd_library(id) ON DELETE CASCADE,
    function_id uuid NOT NULL REFERENCES public.org_functions(id) ON DELETE CASCADE,

    -- Function-level context
    is_core_function_jtbd boolean DEFAULT false, -- Core to this function's purpose?
    strategic_importance integer CHECK (strategic_importance BETWEEN 1 AND 10),
    automation_potential integer CHECK (automation_potential BETWEEN 1 AND 10),

    -- Cross-department considerations
    requires_cross_dept_collab boolean DEFAULT false,
    typical_stakeholders text[], -- Other functions involved

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(jtbd_id, function_id)
);

CREATE INDEX idx_jtbd_func_mapping_jtbd ON public.jtbd_function_mapping(jtbd_id);
CREATE INDEX idx_jtbd_func_mapping_func ON public.jtbd_function_mapping(function_id);
CREATE INDEX idx_jtbd_func_mapping_core ON public.jtbd_function_mapping(is_core_function_jtbd) WHERE is_core_function_jtbd = true;
CREATE INDEX idx_jtbd_func_mapping_strategic ON public.jtbd_function_mapping(strategic_importance DESC);

COMMENT ON TABLE public.jtbd_function_mapping IS 'Maps JTBD to business functions (function level)';

-- ============================================================================
-- 5. ENHANCED JTBD-PERSONA MAPPING (Keep existing, add context)
-- ============================================================================

-- Add additional context fields to existing jtbd_persona_mapping if it exists
ALTER TABLE public.jtbd_persona_mapping
ADD COLUMN IF NOT EXISTS persona_role_context text; -- How does this persona's role influence their JTBD approach?

ALTER TABLE public.jtbd_persona_mapping
ADD COLUMN IF NOT EXISTS typical_tools_used text[]; -- Tools this persona uses for this JTBD

ALTER TABLE public.jtbd_persona_mapping
ADD COLUMN IF NOT EXISTS success_indicators text; -- How does this persona measure success?

-- ============================================================================
-- 6. CONVENIENCE VIEW: Complete JTBD Context
-- ============================================================================

CREATE OR REPLACE VIEW public.v_jtbd_complete_mapping AS
SELECT
    j.id as jtbd_id,
    j.unique_id as jtbd_unique_id,
    j.title as jtbd_title,
    j.scope_level,
    j.is_cross_functional,

    -- Industries
    i.name as industry_name,
    i.sector as industry_sector,

    -- Functions
    f.name as function_name,
    jfm.is_core_function_jtbd,
    jfm.strategic_importance,

    -- Departments
    d.name as department_name,
    jdm.collaboration_required,

    -- Roles
    r.name as role_name,
    r.unique_id as role_unique_id,
    jrm.is_primary_jtbd,
    jrm.relevance_score,

    -- Personas
    p.name as persona_name,
    p.persona_code,
    jpm.expected_benefit

FROM public.jtbd_library j
LEFT JOIN public.industries i ON j.industry_id = i.id
LEFT JOIN public.org_functions f ON j.org_function_id = f.id
LEFT JOIN public.jtbd_function_mapping jfm ON j.id = jfm.jtbd_id AND f.id = jfm.function_id
LEFT JOIN public.jtbd_department_mapping jdm ON j.id = jdm.jtbd_id
LEFT JOIN public.org_departments d ON jdm.department_id = d.id
LEFT JOIN public.jtbd_role_mapping jrm ON j.id = jrm.jtbd_id
LEFT JOIN public.org_roles r ON jrm.role_id = r.id
LEFT JOIN public.jtbd_persona_mapping jpm ON j.id = jpm.jtbd_id
LEFT JOIN public.personas p ON jpm.persona_id = p.id;

COMMENT ON VIEW public.v_jtbd_complete_mapping IS 'Complete view of JTBD with all organizational levels mapped';

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to get all JTBD for a specific role
CREATE OR REPLACE FUNCTION get_jtbd_for_role(p_role_id uuid)
RETURNS TABLE (
    jtbd_id uuid,
    jtbd_title text,
    relevance_score integer,
    is_primary boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.title,
        jrm.relevance_score,
        jrm.is_primary_jtbd
    FROM public.jtbd_library j
    INNER JOIN public.jtbd_role_mapping jrm ON j.id = jrm.jtbd_id
    WHERE jrm.role_id = p_role_id
    ORDER BY jrm.is_primary_jtbd DESC, jrm.relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all JTBD for a department
CREATE OR REPLACE FUNCTION get_jtbd_for_department(p_dept_id uuid)
RETURNS TABLE (
    jtbd_id uuid,
    jtbd_title text,
    team_ownership text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.title,
        jdm.team_ownership
    FROM public.jtbd_library j
    INNER JOIN public.jtbd_department_mapping jdm ON j.id = jdm.jtbd_id
    WHERE jdm.department_id = p_dept_id
    ORDER BY j.title;
END;
$$ LANGUAGE plpgsql;

-- Function to get all roles that perform a specific JTBD
CREATE OR REPLACE FUNCTION get_roles_for_jtbd(p_jtbd_id uuid)
RETURNS TABLE (
    role_id uuid,
    role_name text,
    relevance_score integer,
    typical_frequency text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        jrm.relevance_score,
        jrm.typical_frequency
    FROM public.org_roles r
    INNER JOIN public.jtbd_role_mapping jrm ON r.id = jrm.role_id
    WHERE jrm.jtbd_id = p_jtbd_id
    ORDER BY jrm.relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.jtbd_role_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jtbd_department_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jtbd_function_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from jtbd_library tenant isolation)
CREATE POLICY jtbd_role_mapping_tenant_isolation ON public.jtbd_role_mapping
    USING (jtbd_id IN (SELECT id FROM public.jtbd_library WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY jtbd_dept_mapping_tenant_isolation ON public.jtbd_department_mapping
    USING (jtbd_id IN (SELECT id FROM public.jtbd_library WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

CREATE POLICY jtbd_func_mapping_tenant_isolation ON public.jtbd_function_mapping
    USING (jtbd_id IN (SELECT id FROM public.jtbd_library WHERE tenant_id = current_setting('app.current_tenant_id')::uuid));

-- ============================================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_jtbd_role_mapping_updated_at BEFORE UPDATE ON public.jtbd_role_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jtbd_dept_mapping_updated_at BEFORE UPDATE ON public.jtbd_department_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jtbd_func_mapping_updated_at BEFORE UPDATE ON public.jtbd_function_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check JTBD distribution across levels:
-- SELECT
--     scope_level,
--     COUNT(*) as num_jtbd,
--     ROUND(AVG(importance), 2) as avg_importance
-- FROM public.jtbd_library
-- GROUP BY scope_level
-- ORDER BY num_jtbd DESC;

-- Find most relevant JTBD for Medical Affairs function:
-- SELECT j.title, jfm.strategic_importance, jfm.is_core_function_jtbd
-- FROM public.jtbd_library j
-- JOIN public.jtbd_function_mapping jfm ON j.id = jfm.jtbd_id
-- JOIN public.org_functions f ON jfm.function_id = f.id
-- WHERE f.name ILIKE '%medical%affairs%'
-- ORDER BY jfm.strategic_importance DESC;

-- Find cross-functional JTBD:
-- SELECT j.title, j.statement, COUNT(DISTINCT jfm.function_id) as num_functions
-- FROM public.jtbd_library j
-- JOIN public.jtbd_function_mapping jfm ON j.id = jfm.jtbd_id
-- WHERE j.is_cross_functional = true
-- GROUP BY j.id, j.title, j.statement
-- HAVING COUNT(DISTINCT jfm.function_id) > 1
-- ORDER BY num_functions DESC;
