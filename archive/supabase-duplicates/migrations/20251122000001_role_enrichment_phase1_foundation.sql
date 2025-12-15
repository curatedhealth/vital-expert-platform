-- =====================================================================
-- ROLE ENRICHMENT - PHASE 1: FOUNDATION SCHEMA
-- Date: 2025-11-22
-- Purpose: Add comprehensive pharma/biotech enrichment to org_roles
-- Strategy: /Users/hichamnaim/Downloads/Cursor/VITAL path/.vital-command-center/04-TECHNICAL/data-schema/ORG_ROLES_ENRICHMENT_STRATEGY.md
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: ADD DIRECT COLUMNS TO ORG_ROLES TABLE
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE 'Adding regulatory & compliance columns to org_roles...';

    -- Regulatory & Compliance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'gxp_role_type') THEN
        ALTER TABLE org_roles ADD COLUMN gxp_role_type TEXT CHECK (gxp_role_type IN ('gmp', 'gcp', 'glp', 'gvp', 'gdp', 'non_gxp'));
        COMMENT ON COLUMN org_roles.gxp_role_type IS 'GxP classification: GMP (manufacturing), GCP (clinical), GLP (lab), GVP (pharmacovigilance), GDP (distribution)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'regulatory_inspection_role') THEN
        ALTER TABLE org_roles ADD COLUMN regulatory_inspection_role BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.regulatory_inspection_role IS 'Does this role interact with regulators during inspections/audits?';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'sox_critical') THEN
        ALTER TABLE org_roles ADD COLUMN sox_critical BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.sox_critical IS 'Is this role subject to Sarbanes-Oxley financial controls?';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'cfr_part_11_required') THEN
        ALTER TABLE org_roles ADD COLUMN cfr_part_11_required BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.cfr_part_11_required IS 'Does this role require 21 CFR Part 11 compliance (electronic signatures)?';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'pharmacovigilance_responsibility') THEN
        ALTER TABLE org_roles ADD COLUMN pharmacovigilance_responsibility BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.pharmacovigilance_responsibility IS 'Does this role have adverse event reporting obligations?';
    END IF;

    RAISE NOTICE 'Adding clinical/healthcare context columns to org_roles...';

    -- Clinical/Healthcare Context
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'clinical_trial_phase_focus') THEN
        ALTER TABLE org_roles ADD COLUMN clinical_trial_phase_focus TEXT[];
        COMMENT ON COLUMN org_roles.clinical_trial_phase_focus IS 'Array of clinical trial phases: phase_1, phase_2, phase_3, phase_4, post_marketing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'drug_lifecycle_stage') THEN
        ALTER TABLE org_roles ADD COLUMN drug_lifecycle_stage TEXT[];
        COMMENT ON COLUMN org_roles.drug_lifecycle_stage IS 'Array of drug development stages: discovery, preclinical, clinical, regulatory_submission, commercial, lifecycle_management';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'patient_facing') THEN
        ALTER TABLE org_roles ADD COLUMN patient_facing BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.patient_facing IS 'Does this role interact directly with patients?';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'hcp_facing') THEN
        ALTER TABLE org_roles ADD COLUMN hcp_facing BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.hcp_facing IS 'Does this role interact with healthcare professionals (HCPs)?';
    END IF;

    RAISE NOTICE 'Adding career & development columns to org_roles...';

    -- Career & Development
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_time_in_role_years') THEN
        ALTER TABLE org_roles ADD COLUMN typical_time_in_role_years INTEGER;
        COMMENT ON COLUMN org_roles.typical_time_in_role_years IS 'Average tenure in this role before promotion/transition';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'advancement_potential') THEN
        ALTER TABLE org_roles ADD COLUMN advancement_potential TEXT CHECK (advancement_potential IN ('high', 'moderate', 'limited', 'terminal'));
        COMMENT ON COLUMN org_roles.advancement_potential IS 'Career progression potential from this role';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_entry_point') THEN
        ALTER TABLE org_roles ADD COLUMN typical_entry_point BOOLEAN DEFAULT false;
        COMMENT ON COLUMN org_roles.typical_entry_point IS 'Is this a common entry-level role in the function?';
    END IF;

    RAISE NOTICE 'Adding workflow context columns to org_roles...';

    -- Workflow Context
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'typical_meeting_hours_per_week') THEN
        ALTER TABLE org_roles ADD COLUMN typical_meeting_hours_per_week INTEGER;
        COMMENT ON COLUMN org_roles.typical_meeting_hours_per_week IS 'Typical hours spent in meetings per week';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'administrative_load_percent') THEN
        ALTER TABLE org_roles ADD COLUMN administrative_load_percent INTEGER CHECK (administrative_load_percent >= 0 AND administrative_load_percent <= 100);
        COMMENT ON COLUMN org_roles.administrative_load_percent IS 'Percentage of time spent on administrative tasks (vs. core work)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'strategic_vs_tactical') THEN
        ALTER TABLE org_roles ADD COLUMN strategic_vs_tactical TEXT CHECK (strategic_vs_tactical IN ('strategic', 'tactical', 'balanced'));
        COMMENT ON COLUMN org_roles.strategic_vs_tactical IS 'Primary focus: strategic planning vs. tactical execution';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_roles' AND column_name = 'innovation_vs_execution') THEN
        ALTER TABLE org_roles ADD COLUMN innovation_vs_execution TEXT CHECK (innovation_vs_execution IN ('innovation_focused', 'execution_focused', 'balanced'));
        COMMENT ON COLUMN org_roles.innovation_vs_execution IS 'Primary focus: innovation/creativity vs. execution/delivery';
    END IF;

    RAISE NOTICE 'Successfully added 16 new columns to org_roles table';
END $$;

-- =====================================================================
-- STEP 2: CREATE REFERENCE TABLES (MASTER DATA)
-- =====================================================================

RAISE NOTICE 'Creating reference tables for role enrichment...';

-- 2.1 Regulatory Frameworks
CREATE TABLE IF NOT EXISTS regulatory_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    framework_type TEXT CHECK (framework_type IN ('submission', 'compliance', 'quality', 'safety')),
    region TEXT, -- 'US', 'EU', 'Global', 'APAC', 'LatAm'
    authority TEXT, -- 'FDA', 'EMA', 'PMDA', 'ICH', 'WHO'
    description TEXT,
    effective_date DATE,
    revision_date DATE,
    url TEXT,
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES regulatory_frameworks(id),
    superseded_by_id UUID REFERENCES regulatory_frameworks(id),
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regulatory_frameworks_authority ON regulatory_frameworks(authority);
CREATE INDEX IF NOT EXISTS idx_regulatory_frameworks_region ON regulatory_frameworks(region);
CREATE INDEX IF NOT EXISTS idx_regulatory_frameworks_is_current ON regulatory_frameworks(is_current) WHERE is_current = true;

COMMENT ON TABLE regulatory_frameworks IS 'Master catalog of regulatory frameworks (FDA, EMA, ICH standards)';

-- 2.2 GxP Training Modules
CREATE TABLE IF NOT EXISTS gxp_training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL UNIQUE,
    gxp_category TEXT CHECK (gxp_category IN ('GMP', 'GCP', 'GLP', 'GVP', 'GDP', 'General')),
    required_for_gxp_roles BOOLEAN DEFAULT true,
    training_duration_hours NUMERIC(5,2),
    renewal_frequency_months INTEGER, -- How often training must be refreshed
    regulatory_requirement BOOLEAN DEFAULT true,
    description TEXT,
    learning_objectives TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gxp_training_modules_category ON gxp_training_modules(gxp_category);

COMMENT ON TABLE gxp_training_modules IS 'Master catalog of GxP training modules required for pharmaceutical roles';

-- 2.3 Clinical Competencies
CREATE TABLE IF NOT EXISTS clinical_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_name TEXT NOT NULL UNIQUE,
    category TEXT, -- 'clinical_research', 'medical_science', 'regulatory', 'data_management', 'quality'
    description TEXT,
    typical_roles TEXT[], -- Cached: which roles commonly need this competency
    learning_resources TEXT[], -- Links to training materials
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_competencies_category ON clinical_competencies(category);

COMMENT ON TABLE clinical_competencies IS 'Master catalog of clinical and pharmaceutical competencies';

-- 2.4 Approval Types
CREATE TABLE IF NOT EXISTS approval_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_name TEXT NOT NULL UNIQUE,
    category TEXT CHECK (category IN ('regulatory', 'clinical', 'commercial', 'financial', 'quality', 'safety', 'compliance')),
    regulatory_impact TEXT CHECK (regulatory_impact IN ('high', 'medium', 'low', 'none')),
    typical_turnaround_days INTEGER,
    description TEXT,
    requires_documentation BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_types_category ON approval_types(category);
CREATE INDEX IF NOT EXISTS idx_approval_types_regulatory_impact ON approval_types(regulatory_impact);

COMMENT ON TABLE approval_types IS 'Master catalog of approval types and authorization requirements';

-- 2.5 Process Definitions
CREATE TABLE IF NOT EXISTS process_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_name TEXT NOT NULL UNIQUE,
    process_type TEXT CHECK (process_type IN ('regulatory', 'clinical', 'quality', 'commercial', 'safety', 'operational')),
    typical_duration_days INTEGER,
    complexity_level TEXT CHECK (complexity_level IN ('low', 'medium', 'high', 'very_high')),
    regulatory_requirement BOOLEAN DEFAULT false,
    sop_reference TEXT, -- Link to Standard Operating Procedure
    description TEXT,
    key_milestones TEXT[], -- JSON array of milestone names
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_process_definitions_type ON process_definitions(process_type);
CREATE INDEX IF NOT EXISTS idx_process_definitions_complexity ON process_definitions(complexity_level);

COMMENT ON TABLE process_definitions IS 'Master catalog of pharmaceutical business processes';

-- 2.6 Career Paths
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_name TEXT NOT NULL UNIQUE,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    description TEXT,
    typical_duration_years INTEGER, -- From entry to apex of path
    path_type TEXT CHECK (path_type IN ('individual_contributor', 'people_management', 'technical_specialist', 'executive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_paths_function ON career_paths(function_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_department ON career_paths(department_id);

COMMENT ON TABLE career_paths IS 'Career progression paths within pharmaceutical organization';

-- 2.7 Workflow Activities
CREATE TABLE IF NOT EXISTS workflow_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name TEXT NOT NULL UNIQUE,
    category TEXT CHECK (category IN ('planning', 'execution', 'review', 'communication', 'administrative', 'strategic')),
    typical_frequency TEXT CHECK (typical_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'ad_hoc')),
    typical_duration_hours NUMERIC(5,2),
    requires_collaboration BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_activities_category ON workflow_activities(category);
CREATE INDEX IF NOT EXISTS idx_workflow_activities_frequency ON workflow_activities(typical_frequency);

COMMENT ON TABLE workflow_activities IS 'Master catalog of workflow activities performed by pharmaceutical roles';

RAISE NOTICE 'Successfully created 7 reference tables';

-- =====================================================================
-- STEP 3: CREATE JUNCTION TABLES (MANY-TO-MANY RELATIONSHIPS)
-- =====================================================================

RAISE NOTICE 'Creating junction tables for role enrichment...';

-- 3.1 Role Regulatory Frameworks
CREATE TABLE IF NOT EXISTS role_regulatory_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES regulatory_frameworks(id) ON DELETE CASCADE,
    proficiency_required TEXT CHECK (proficiency_required IN ('awareness', 'working_knowledge', 'advanced', 'expert')),
    is_critical BOOLEAN DEFAULT false,
    assessment_frequency TEXT CHECK (assessment_frequency IN ('upon_hire', 'annual', 'biannual', 'continuous')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, framework_id)
);

CREATE INDEX IF NOT EXISTS idx_role_regulatory_frameworks_role ON role_regulatory_frameworks(role_id);
CREATE INDEX IF NOT EXISTS idx_role_regulatory_frameworks_framework ON role_regulatory_frameworks(framework_id);
CREATE INDEX IF NOT EXISTS idx_role_regulatory_frameworks_proficiency ON role_regulatory_frameworks(proficiency_required);

COMMENT ON TABLE role_regulatory_frameworks IS 'Maps roles to regulatory frameworks with required proficiency levels';

-- 3.2 Role GxP Training
CREATE TABLE IF NOT EXISTS role_gxp_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    training_module_id UUID NOT NULL REFERENCES gxp_training_modules(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true,
    due_within_days_of_hire INTEGER DEFAULT 90,
    renewal_reminder_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, training_module_id)
);

CREATE INDEX IF NOT EXISTS idx_role_gxp_training_role ON role_gxp_training(role_id);
CREATE INDEX IF NOT EXISTS idx_role_gxp_training_module ON role_gxp_training(training_module_id);
CREATE INDEX IF NOT EXISTS idx_role_gxp_training_mandatory ON role_gxp_training(is_mandatory) WHERE is_mandatory = true;

COMMENT ON TABLE role_gxp_training IS 'Maps roles to required GxP training modules with completion requirements';

-- 3.3 Role Clinical Competencies
CREATE TABLE IF NOT EXISTS role_clinical_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES clinical_competencies(id) ON DELETE CASCADE,
    required_proficiency TEXT CHECK (required_proficiency IN ('foundational', 'intermediate', 'advanced', 'expert')),
    years_experience_in_competency INTEGER,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, competency_id)
);

CREATE INDEX IF NOT EXISTS idx_role_clinical_competencies_role ON role_clinical_competencies(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clinical_competencies_competency ON role_clinical_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_role_clinical_competencies_proficiency ON role_clinical_competencies(required_proficiency);

COMMENT ON TABLE role_clinical_competencies IS 'Maps roles to clinical competencies with proficiency requirements';

-- 3.4 Role Approval Authority
CREATE TABLE IF NOT EXISTS role_approval_authority (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    approval_type_id UUID NOT NULL REFERENCES approval_types(id) ON DELETE CASCADE,
    authority_level TEXT CHECK (authority_level IN ('final_approver', 'co_approver', 'recommender', 'reviewer', 'informed')),
    monetary_limit NUMERIC(15,2),
    requires_escalation_above NUMERIC(15,2),
    can_delegate BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, approval_type_id)
);

CREATE INDEX IF NOT EXISTS idx_role_approval_authority_role ON role_approval_authority(role_id);
CREATE INDEX IF NOT EXISTS idx_role_approval_authority_type ON role_approval_authority(approval_type_id);
CREATE INDEX IF NOT EXISTS idx_role_approval_authority_level ON role_approval_authority(authority_level);

COMMENT ON TABLE role_approval_authority IS 'Maps roles to approval authority with delegation limits';

-- 3.5 Role Process Participation
CREATE TABLE IF NOT EXISTS role_process_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES process_definitions(id) ON DELETE CASCADE,
    participation_type TEXT CHECK (participation_type IN ('owner', 'accountable', 'responsible', 'consulted', 'informed')), -- RACI
    typical_involvement_hours INTEGER,
    frequency_per_year INTEGER,
    is_critical_path BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, process_id)
);

CREATE INDEX IF NOT EXISTS idx_role_process_participation_role ON role_process_participation(role_id);
CREATE INDEX IF NOT EXISTS idx_role_process_participation_process ON role_process_participation(process_id);
CREATE INDEX IF NOT EXISTS idx_role_process_participation_type ON role_process_participation(participation_type);

COMMENT ON TABLE role_process_participation IS 'Maps roles to business processes with RACI participation type';

-- 3.6 Career Path Steps
CREATE TABLE IF NOT EXISTS career_path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    step_sequence INTEGER NOT NULL,
    typical_years_at_step INTEGER,
    skills_to_develop TEXT[],
    competencies_to_acquire UUID[], -- References clinical_competencies IDs
    typical_transition_rate NUMERIC(3,2) CHECK (typical_transition_rate >= 0 AND typical_transition_rate <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(career_path_id, step_sequence)
);

CREATE INDEX IF NOT EXISTS idx_career_path_steps_path ON career_path_steps(career_path_id);
CREATE INDEX IF NOT EXISTS idx_career_path_steps_role ON career_path_steps(role_id);
CREATE INDEX IF NOT EXISTS idx_career_path_steps_sequence ON career_path_steps(step_sequence);

COMMENT ON TABLE career_path_steps IS 'Defines sequential steps in career progression paths';

-- 3.7 Role Workflow Activities
CREATE TABLE IF NOT EXISTS role_workflow_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES workflow_activities(id) ON DELETE CASCADE,
    frequency TEXT CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'ad_hoc')),
    time_allocation_percent INTEGER CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100),
    priority INTEGER CHECK (priority >= 1),
    is_mandatory BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_role_workflow_activities_role ON role_workflow_activities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_workflow_activities_activity ON role_workflow_activities(activity_id);
CREATE INDEX IF NOT EXISTS idx_role_workflow_activities_priority ON role_workflow_activities(priority);

COMMENT ON TABLE role_workflow_activities IS 'Maps roles to workflow activities with time allocation and priority';

RAISE NOTICE 'Successfully created 7 junction tables';

-- =====================================================================
-- STEP 4: CREATE UPDATE TRIGGERS
-- =====================================================================

-- Trigger function already exists from previous migrations, but ensure it's applied to new tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'regulatory_frameworks', 'gxp_training_modules', 'clinical_competencies',
            'approval_types', 'process_definitions', 'career_paths', 'workflow_activities',
            'role_regulatory_frameworks', 'role_gxp_training', 'role_clinical_competencies',
            'role_approval_authority', 'role_process_participation', 'career_path_steps', 'role_workflow_activities'
        )
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;

    RAISE NOTICE 'Applied updated_at triggers to all new tables';
END $$;

-- =====================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================================

-- Enable RLS on reference tables
ALTER TABLE regulatory_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gxp_training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on junction tables
ALTER TABLE role_regulatory_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_gxp_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_clinical_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_approval_authority ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_process_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_workflow_activities ENABLE ROW LEVEL SECURITY;

-- Create read policies for authenticated users
CREATE POLICY "Allow read access to authenticated users" ON regulatory_frameworks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON gxp_training_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON clinical_competencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON approval_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON process_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON career_paths FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON workflow_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_regulatory_frameworks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_gxp_training FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_clinical_competencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_approval_authority FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_process_participation FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON career_path_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON role_workflow_activities FOR SELECT TO authenticated USING (true);

RAISE NOTICE 'Enabled RLS and created read policies for all tables';

-- =====================================================================
-- STEP 6: VALIDATION QUERIES
-- =====================================================================

DO $$
DECLARE
    new_columns_count INTEGER;
    new_tables_count INTEGER;
    new_junction_tables_count INTEGER;
BEGIN
    -- Count new columns on org_roles
    SELECT COUNT(*) INTO new_columns_count
    FROM information_schema.columns
    WHERE table_name = 'org_roles'
    AND column_name IN (
        'gxp_role_type', 'regulatory_inspection_role', 'sox_critical', 'cfr_part_11_required',
        'pharmacovigilance_responsibility', 'clinical_trial_phase_focus', 'drug_lifecycle_stage',
        'patient_facing', 'hcp_facing', 'typical_time_in_role_years', 'advancement_potential',
        'typical_entry_point', 'typical_meeting_hours_per_week', 'administrative_load_percent',
        'strategic_vs_tactical', 'innovation_vs_execution'
    );

    -- Count new reference tables
    SELECT COUNT(*) INTO new_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'regulatory_frameworks', 'gxp_training_modules', 'clinical_competencies',
        'approval_types', 'process_definitions', 'career_paths', 'workflow_activities'
    );

    -- Count new junction tables
    SELECT COUNT(*) INTO new_junction_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'role_regulatory_frameworks', 'role_gxp_training', 'role_clinical_competencies',
        'role_approval_authority', 'role_process_participation', 'career_path_steps', 'role_workflow_activities'
    );

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ROLE ENRICHMENT PHASE 1 - VALIDATION REPORT';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'New Columns Added to org_roles: % / 16 expected', new_columns_count;
    RAISE NOTICE 'New Reference Tables Created: % / 7 expected', new_tables_count;
    RAISE NOTICE 'New Junction Tables Created: % / 7 expected', new_junction_tables_count;
    RAISE NOTICE '';

    IF new_columns_count = 16 AND new_tables_count = 7 AND new_junction_tables_count = 7 THEN
        RAISE NOTICE 'SUCCESS: All schema objects created successfully!';
    ELSE
        RAISE WARNING 'INCOMPLETE: Some schema objects may be missing. Review output above.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run seed data migration: 20251122000002_seed_pharma_reference_data.sql';
    RAISE NOTICE '  2. Begin Medical Affairs enrichment (Phase 2)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

COMMIT;
