-- ============================================================================
-- JTBD Seed Data Template
-- Comprehensive sample data for all JTBD normalized tables
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- TENANT CONFIGURATION
-- ============================================================================

-- VITAL SYSTEM TENANT (Default - always receives seed data)
-- ID: 00000000-0000-0000-0000-000000000001
-- Name: Vital System

-- PHARMACEUTICALS TENANT (Example customer tenant)
-- ID: 00000000-0000-0000-0000-000000000002
-- Name: Pharmaceuticals

-- ============================================================================
-- STEP 1: CREATE TENANTS IF NOT EXISTS
-- ============================================================================

-- Insert Vital System tenant if not exists
INSERT INTO tenants (id, name, slug, tenant_path, tenant_level)
SELECT '00000000-0000-0000-0000-000000000001', 'Vital System', 'vital-system', 'vital-system', 0
WHERE NOT EXISTS (
    SELECT 1 FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001' OR slug = 'vital-system'
);

-- Insert Pharmaceuticals tenant if not exists
INSERT INTO tenants (id, name, slug, tenant_path, tenant_level)
SELECT '00000000-0000-0000-0000-000000000002', 'Pharmaceuticals', 'pharmaceuticals', 'pharmaceuticals', 0
WHERE NOT EXISTS (
    SELECT 1 FROM tenants WHERE slug = 'pharmaceuticals'
);

-- If Pharmaceuticals slug exists but with different ID, get that ID
DO $$
DECLARE
    v_pharma_id uuid;
BEGIN
    SELECT id INTO v_pharma_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;
    IF v_pharma_id IS NOT NULL AND v_pharma_id != (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1) THEN
        RAISE NOTICE 'Using existing Pharmaceuticals tenant with ID: %', v_pharma_id;
        RAISE NOTICE 'Update the seed file to use this ID instead of 00000000-0000-0000-0000-000000000002';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: LIST ALL AVAILABLE TENANTS
-- ============================================================================

SELECT 'Available Tenants:' as info;
SELECT id, name, created_at FROM tenants ORDER BY name;

-- ============================================================================
-- STEP 3: SET YOUR TARGET TENANT
-- By default, data is added to BOTH Vital System AND Pharmaceuticals
-- ============================================================================

-- Vital System tenant (ALWAYS receives data)
-- ID: 00000000-0000-0000-0000-000000000001

-- Pharmaceuticals tenant (default customer tenant)
-- ID: 00000000-0000-0000-0000-000000000002

DO $$
BEGIN
    RAISE NOTICE 'Seeding data for:';
    RAISE NOTICE '  1. Vital System (00000000-0000-0000-0000-000000000001) - ALWAYS';
    RAISE NOTICE '  2. Pharmaceuticals (00000000-0000-0000-0000-000000000002) - Default customer';
END $$;

-- ============================================================================
-- PART 0: ORG STRUCTURE (Prerequisites for Personas)
-- Using DO block to handle all inserts with proper FK resolution
-- ============================================================================

DO $$
DECLARE
    v_tenant_id uuid;
    v_function_id uuid;
    v_dept_mis_id uuid;
    v_dept_scicomm_id uuid;
    v_role_mim_id uuid;
    v_role_msl_id uuid;
    v_role_mad_id uuid;
    v_persona_mim_id uuid;
    v_persona_msl_id uuid;
    v_persona_mad_id uuid;
    v_jtbd_001_id uuid;
    v_jtbd_002_id uuid;
    v_jtbd_003_id uuid;
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;

    -- 0. Clean up existing JTBDs with these codes (to ensure consistent IDs)
    DELETE FROM jobs_to_be_done
    WHERE tenant_id = v_tenant_id
    AND code IN ('JTBD-MA-001', 'JTBD-MA-002', 'JTBD-MA-003');

    RAISE NOTICE 'Cleaned up existing JTBDs for re-seeding';

    -- 1. Insert or get Org Function (unique constraint is on tenant_id, name)
    SELECT id INTO v_function_id FROM org_functions
    WHERE name = 'Medical Affairs'::functional_area_type AND tenant_id = v_tenant_id LIMIT 1;

    IF v_function_id IS NULL THEN
        INSERT INTO org_functions (id, tenant_id, name, slug, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Affairs'::functional_area_type,
            'medical-affairs',
            'Medical Affairs function responsible for scientific exchange and medical information'
        )
        RETURNING id INTO v_function_id;
    END IF;

    -- 2. Insert or get Org Departments (need function_id)
    SELECT id INTO v_dept_mis_id FROM org_departments
    WHERE slug = 'medical-information-services' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_dept_mis_id IS NULL THEN
        INSERT INTO org_departments (id, tenant_id, name, slug, function_id, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Information Services',
            'medical-information-services',
            v_function_id,
            'Department handling medical inquiries and information requests'
        )
        RETURNING id INTO v_dept_mis_id;
    END IF;

    SELECT id INTO v_dept_scicomm_id FROM org_departments
    WHERE slug = 'scientific-communications' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_dept_scicomm_id IS NULL THEN
        INSERT INTO org_departments (id, tenant_id, name, slug, function_id, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Scientific Communications',
            'scientific-communications',
            v_function_id,
            'Department managing scientific publications and KOL engagement'
        )
        RETURNING id INTO v_dept_scicomm_id;
    END IF;

    -- 3. Insert or get Org Roles (need function_id and department_id)
    SELECT id INTO v_role_mim_id FROM org_roles
    WHERE slug = 'medical-information-manager' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_role_mim_id IS NULL THEN
        INSERT INTO org_roles (id, tenant_id, name, slug, function_id, department_id, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Information Manager',
            'medical-information-manager',
            v_function_id,
            v_dept_mis_id,
            'Manages medical information requests and response processes'
        )
        RETURNING id INTO v_role_mim_id;
    END IF;

    SELECT id INTO v_role_msl_id FROM org_roles
    WHERE slug = 'medical-science-liaison' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_role_msl_id IS NULL THEN
        INSERT INTO org_roles (id, tenant_id, name, slug, function_id, department_id, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Science Liaison',
            'medical-science-liaison',
            v_function_id,
            v_dept_scicomm_id,
            'Field-based medical expert engaging with KOLs and HCPs'
        )
        RETURNING id INTO v_role_msl_id;
    END IF;

    SELECT id INTO v_role_mad_id FROM org_roles
    WHERE slug = 'medical-affairs-director' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_role_mad_id IS NULL THEN
        INSERT INTO org_roles (id, tenant_id, name, slug, function_id, department_id, description)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Affairs Director',
            'medical-affairs-director',
            v_function_id,
            v_dept_scicomm_id,
            'Senior leader overseeing medical affairs strategy and operations'
        )
        RETURNING id INTO v_role_mad_id;
    END IF;

    -- 4. Insert Personas (need function_id, department_id, role_id)
    -- Note: personas uses validation_status, not status
    SELECT id INTO v_persona_mim_id FROM personas
    WHERE slug = 'persona-mim' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_persona_mim_id IS NULL THEN
        INSERT INTO personas (id, tenant_id, name, slug, department_id, function_id, role_id)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Information Manager',
            'persona-mim',
            v_dept_mis_id,
            v_function_id,
            v_role_mim_id
        )
        RETURNING id INTO v_persona_mim_id;
    END IF;

    SELECT id INTO v_persona_msl_id FROM personas
    WHERE slug = 'persona-msl' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_persona_msl_id IS NULL THEN
        INSERT INTO personas (id, tenant_id, name, slug, department_id, function_id, role_id)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Science Liaison',
            'persona-msl',
            v_dept_scicomm_id,
            v_function_id,
            v_role_msl_id
        )
        RETURNING id INTO v_persona_msl_id;
    END IF;

    SELECT id INTO v_persona_mad_id FROM personas
    WHERE slug = 'persona-mad' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_persona_mad_id IS NULL THEN
        INSERT INTO personas (id, tenant_id, name, slug, department_id, function_id, role_id)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Medical Affairs Director',
            'persona-mad',
            v_dept_scicomm_id,
            v_function_id,
            v_role_mad_id
        )
        RETURNING id INTO v_persona_mad_id;
    END IF;

    -- 5. Insert or get JTBDs (using SELECT/INSERT pattern like org_functions)

    -- JTBD-MA-001
    SELECT id INTO v_jtbd_001_id FROM jobs_to_be_done
    WHERE code = 'JTBD-MA-001' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_jtbd_001_id IS NULL THEN
        INSERT INTO jobs_to_be_done (
            id, tenant_id, code, name, description, functional_area, org_function_id
        ) VALUES (
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            v_tenant_id,
            'JTBD-MA-001',
            'Respond to Medical Information Inquiries',
            'When I receive a medical inquiry from an HCP, I want to provide accurate, compliant, and timely responses so that I can support evidence-based clinical decisions while maintaining regulatory compliance.',
            'Medical Affairs'::functional_area_type,
            v_function_id
        )
        RETURNING id INTO v_jtbd_001_id;
    END IF;

    -- JTBD-MA-002
    SELECT id INTO v_jtbd_002_id FROM jobs_to_be_done
    WHERE code = 'JTBD-MA-002' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_jtbd_002_id IS NULL THEN
        INSERT INTO jobs_to_be_done (
            id, tenant_id, code, name, description, functional_area, org_function_id
        ) VALUES (
            'b2c3d4e5-f6a7-8901-bcde-f23456789012',
            v_tenant_id,
            'JTBD-MA-002',
            'Monitor Scientific Literature',
            'When new scientific publications emerge, I want to systematically identify and assess relevant literature so that I can keep medical knowledge current and identify safety signals.',
            'Medical Affairs'::functional_area_type,
            v_function_id
        )
        RETURNING id INTO v_jtbd_002_id;
    END IF;

    -- JTBD-MA-003
    SELECT id INTO v_jtbd_003_id FROM jobs_to_be_done
    WHERE code = 'JTBD-MA-003' AND tenant_id = v_tenant_id LIMIT 1;

    IF v_jtbd_003_id IS NULL THEN
        INSERT INTO jobs_to_be_done (
            id, tenant_id, code, name, description, functional_area, org_function_id
        ) VALUES (
            'c3d4e5f6-a7b8-9012-cdef-345678901234',
            v_tenant_id,
            'JTBD-MA-003',
            'Engage Key Opinion Leaders',
            'When planning scientific engagement, I want to identify and build relationships with relevant KOLs so that I can facilitate scientific exchange and gather insights.',
            'Medical Affairs'::functional_area_type,
            v_function_id
        )
        RETURNING id INTO v_jtbd_003_id;
    END IF;

    -- 6. Insert JTBD-Role mappings (personas inherit JTBDs from their roles)
    -- JTBD-MA-001: Medical Information → Medical Information Manager (primary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_001_id, v_role_mim_id, 0.95, true)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-001 also relevant to Medical Affairs Director (secondary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_001_id, v_role_mad_id, 0.60, false)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-002: Literature Surveillance → Medical Information Manager (primary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_002_id, v_role_mim_id, 0.95, true)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-002 also relevant to MSL (secondary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_002_id, v_role_msl_id, 0.70, false)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-002 also relevant to Medical Affairs Director (secondary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_002_id, v_role_mad_id, 0.50, false)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-003: KOL Engagement → Medical Science Liaison (primary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_003_id, v_role_msl_id, 0.95, true)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    -- JTBD-MA-003 also relevant to Medical Affairs Director (secondary)
    INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary)
    VALUES (v_jtbd_003_id, v_role_mad_id, 0.80, false)
    ON CONFLICT (jtbd_id, role_id) DO NOTHING;

    RAISE NOTICE 'JTBD IDs created: %, %, %', v_jtbd_001_id, v_jtbd_002_id, v_jtbd_003_id;

    RAISE NOTICE 'Org structure, personas, JTBDs, and mappings created successfully';
    RAISE NOTICE 'Function ID: %', v_function_id;
    RAISE NOTICE 'Persona MIM ID: %', v_persona_mim_id;
    RAISE NOTICE 'Persona MSL ID: %', v_persona_msl_id;
    RAISE NOTICE 'Persona MAD ID: %', v_persona_mad_id;
END $$;

-- ============================================================================
-- PART 2: PAIN POINTS (Normalized from JSONB)
-- ============================================================================

INSERT INTO jtbd_pain_points (id, jtbd_id, tenant_id, issue, severity, pain_point_type, frequency, impact_description)
VALUES
-- Pain points for JTBD-MA-001 (Medical Information)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Manual search across multiple databases is time-consuming', 'high', 'process', 'always',
 'Delays response time and reduces productivity'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent response quality across team members', 'medium', 'knowledge', 'often',
 'Risk of compliance issues and customer dissatisfaction'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Difficulty tracking response metrics and SLA compliance', 'high', 'technical', 'always',
 'Cannot demonstrate value or identify improvement areas'),

-- Pain points for JTBD-MA-002 (Literature Surveillance)
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'High volume of publications to review manually', 'critical', 'resource', 'always',
 'Risk of missing important publications'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent relevance scoring criteria', 'medium', 'process', 'often',
 'Subjectivity in prioritization decisions'),

-- Pain points for JTBD-MA-003 (KOL Engagement)
(gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Fragmented KOL data across multiple systems', 'high', 'technical', 'always',
 'Incomplete view of KOL relationships and activities'),
(gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Difficulty measuring engagement effectiveness', 'medium', 'process', 'often',
 'Cannot optimize engagement strategy')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 3: DESIRED OUTCOMES (Normalized from JSONB)
-- ============================================================================

INSERT INTO jtbd_desired_outcomes (id, jtbd_id, tenant_id, outcome, importance, outcome_type, current_satisfaction, sequence_order)
VALUES
-- Outcomes for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce time to find relevant medical information', 9, 'speed', 4, 1),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Ensure 100% compliance with response guidelines', 10, 'stability', 7, 2),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Increase response consistency across team', 8, 'output', 5, 3),

-- Outcomes for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce time to identify relevant publications', 9, 'speed', 3, 1),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Minimize risk of missing critical safety signals', 10, 'risk', 6, 2),

-- Outcomes for JTBD-MA-003
(gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Increase accuracy of KOL identification', 8, 'output', 5, 1),
(gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce cost of KOL profiling activities', 7, 'cost', 4, 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 4: WORKFLOW STAGES
-- ============================================================================

INSERT INTO jtbd_workflow_stages (
    id, jtbd_id, tenant_id, stage_number, stage_name, stage_description, typical_duration
) VALUES
-- Stages for JTBD-MA-001 (Medical Information Response)
('01a1b2c3-d4e5-f678-90ab-cdef12345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'Inquiry Receipt & Triage', 'Receive and categorize incoming medical inquiries', '15 minutes'),
('02b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'Information Search & Retrieval', 'Search databases and retrieve relevant information', '2 hours'),
('03c3d4e5-f6a7-8901-bcde-f23456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'Response Drafting', 'Draft response using approved templates and content', '1 hour'),
('04d4e5f6-a7b8-9012-cdef-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'Medical Review & Approval', 'Review response for medical accuracy and compliance', '4 hours'),
('05e5f6a7-b890-1234-cdef-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 5, 'Response Delivery & Documentation', 'Send response and document in tracking system', '30 minutes'),

-- Stages for JTBD-MA-002 (Literature Surveillance)
('06f6a7b8-9012-3456-cdef-789012345678', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'Search Execution', 'Execute predefined search strategies across databases', '1 hour'),
('07a7b8c9-0123-4567-def0-890123456789', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'Abstract Screening', 'Screen abstracts for relevance', '4 hours'),
('08b8c9d0-1234-5678-ef01-901234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'Full-Text Review', 'Review full text of relevant articles', '8 hours'),
('09c9d0e1-2345-6789-f012-012345678901', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'Impact Assessment', 'Assess impact and determine actions', '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 5: STAGE KEY ACTIVITIES (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_stage_key_activities (id, workflow_stage_id, tenant_id, activity_text, sequence_order, is_critical, estimated_duration, responsible_role)
VALUES
-- Activities for Stage 1: Inquiry Receipt & Triage
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Log inquiry in tracking system', 1, true, '5 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Categorize by therapeutic area and complexity', 2, true, '5 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Assign priority and due date', 3, true, '3 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Route to appropriate specialist', 4, false, '2 minutes', 'Medical Information Specialist'),

-- Activities for Stage 2: Information Search & Retrieval
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search internal knowledge base', 1, true, '30 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search PubMed and other databases', 2, true, '45 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Review product labeling and clinical data', 3, true, '30 minutes', 'Medical Information Specialist'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compile relevant references', 4, false, '15 minutes', 'Medical Information Specialist'),

-- Activities for Stage 6: Search Execution (Literature)
(gen_random_uuid(), '06f6a7b8-9012-3456-cdef-789012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Execute PubMed search strategy', 1, true, '15 minutes', 'Literature Specialist'),
(gen_random_uuid(), '06f6a7b8-9012-3456-cdef-789012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Execute Embase search strategy', 2, true, '15 minutes', 'Literature Specialist'),
(gen_random_uuid(), '06f6a7b8-9012-3456-cdef-789012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search conference abstracts', 3, false, '20 minutes', 'Literature Specialist'),
(gen_random_uuid(), '06f6a7b8-9012-3456-cdef-789012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Deduplicate results', 4, true, '10 minutes', 'Literature Specialist')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 6: STAGE PAIN POINTS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_stage_pain_points (id, workflow_stage_id, tenant_id, pain_point, severity, mitigation)
VALUES
-- Pain points for Information Search stage
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Multiple systems require separate logins', 'medium', 'Implement SSO'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search results not always relevant', 'high', 'Improve search algorithms'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Difficult to track which sources were searched', 'medium', 'Implement search logging'),

-- Pain points for Abstract Screening stage
(gen_random_uuid(), '07a7b8c9-0123-4567-def0-890123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'High volume causes fatigue and errors', 'high', 'Implement AI-assisted screening'),
(gen_random_uuid(), '07a7b8c9-0123-4567-def0-890123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent inclusion/exclusion criteria application', 'medium', 'Standardize criteria training')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 7: WORKFLOW ACTIVITIES
-- ============================================================================

INSERT INTO jtbd_workflow_activities (
    id, workflow_stage_id, tenant_id, activity_name, sequence_order, activity_description
) VALUES
-- Activities for Inquiry Receipt stage
('aa1a1b2c-3d4e-5f67-890a-bcdef1234567', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Parse Inquiry Content', 1, 'Extract key information from inquiry'),
('aa2b2c3d-4e5f-6789-0abc-def123456789', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Categorize Request', 2, 'Assign therapeutic area and request type'),
('aa3c3d4e-5f6a-7890-1bcd-ef1234567890', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Priority Assignment', 3, 'Determine urgency and assign SLA'),

-- Activities for Search stage
('aa4d4e5f-6a7b-8901-2cde-f23456789012', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Execute Database Searches', 1, 'Run searches across medical databases'),
('aa5e5f6a-7b89-0123-4def-345678901234', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Evaluate Search Results', 2, 'Review and select relevant results'),
('aa6f6a7b-8901-2345-6ef0-456789012345', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compile References', 3, 'Organize selected references')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: ACTIVITY TOOLS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_activity_tools (id, workflow_activity_id, tenant_id, tool_name, tool_category, proficiency_required)
VALUES
-- Tools for Parse Inquiry Content
(gen_random_uuid(), 'aa1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Medical Information System', 'software', 'intermediate'),
(gen_random_uuid(), 'aa1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Email Client', 'software', 'basic'),

-- Tools for Database Searches
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'PubMed', 'software', 'advanced'),
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Embase', 'software', 'advanced'),
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Internal Knowledge Base', 'software', 'intermediate'),
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Clinical Trial Registry', 'software', 'intermediate'),

-- Tools for Compile References
(gen_random_uuid(), 'aa6f6a7b-8901-2345-6ef0-456789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reference Manager', 'software', 'intermediate'),
(gen_random_uuid(), 'aa6f6a7b-8901-2345-6ef0-456789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Microsoft Word', 'software', 'basic')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 9: ACTIVITY OUTPUTS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_activity_outputs (id, workflow_activity_id, tenant_id, output_name, output_type, description)
VALUES
-- Outputs for Parse Inquiry Content
(gen_random_uuid(), 'aa1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Structured Inquiry Record', 'data', 'All required fields populated'),
(gen_random_uuid(), 'aa1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inquiry Classification', 'data', 'Correct therapeutic area assigned'),

-- Outputs for Database Searches
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Results List', 'data', 'Deduplicated and relevant'),
(gen_random_uuid(), 'aa4d4e5f-6a7b-8901-2cde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Strategy Documentation', 'document', 'Complete and reproducible'),

-- Outputs for Compile References
(gen_random_uuid(), 'aa6f6a7b-8901-2345-6ef0-456789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reference List', 'document', 'Properly formatted citations'),
(gen_random_uuid(), 'aa6f6a7b-8901-2345-6ef0-456789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Supporting Documents', 'document', 'PDF copies attached')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 10: OUTCOMES (ODI Framework)
-- ============================================================================

INSERT INTO jtbd_outcomes (
    id, jtbd_id, tenant_id, outcome_id, outcome_statement, outcome_type,
    importance_score, satisfaction_score
) VALUES
-- Outcomes for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-001', 'Minimize the time to locate relevant medical information', 'speed',
 9, 4),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-002', 'Minimize the likelihood of providing non-compliant information', 'risk',
 10, 8),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-003', 'Minimize the variation in response quality', 'stability',
 8, 5),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-004', 'Maximize the accuracy of information provided', 'output',
 10, 7),

-- Outcomes for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-005', 'Minimize the time to screen publications', 'speed',
 9, 3),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'OUT-006', 'Minimize the risk of missing critical publications', 'risk',
 10, 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 11: OBSTACLES
-- ============================================================================

INSERT INTO jtbd_obstacles (
    id, jtbd_id, tenant_id, obstacle_text, obstacle_type, severity
) VALUES
-- Obstacles for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Information scattered across multiple systems', 'technical', 'high'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Lack of standardized response templates', 'process', 'medium'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Limited training on compliance requirements', 'knowledge', 'medium'),

-- Obstacles for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Volume of publications exceeds review capacity', 'resource', 'critical'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent search strategies across team', 'process', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 12: KPIs
-- ============================================================================

INSERT INTO jtbd_kpis (
    id, jtbd_id, tenant_id, kpi_code, kpi_name, kpi_description, target_value, current_value
) VALUES
-- KPIs for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'KPI-MA-001', 'Response Time SLA Compliance', 'Percentage of responses delivered within SLA (measured weekly)', 95, 87),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'KPI-MA-002', 'Response Quality Score', 'Average quality score 1-5 from medical review (measured monthly)', 4.5, 4.1),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'KPI-MA-003', 'First Contact Resolution Rate', 'Percentage resolved without follow-up (measured monthly)', 85, 72),

-- KPIs for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'KPI-MA-004', 'Screening Throughput', 'Abstracts screened per FTE per day (measured weekly)', 100, 65),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'KPI-MA-005', 'Signal Detection Rate', 'Signals identified per 1000 publications (measured monthly)', 5, 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 13: SUCCESS CRITERIA
-- ============================================================================

INSERT INTO jtbd_success_criteria (
    id, jtbd_id, tenant_id, criterion_text
) VALUES
-- Success criteria for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All responses medically accurate (mandatory - verified by medical review audit)'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All responses compliant with regulations (mandatory - verified by compliance audit)'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Response delivered within SLA (verified by system tracking)'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'HCP satisfaction score above target (verified by survey)'),

-- Success criteria for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'No critical publications missed (mandatory - verified by retrospective audit)'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All signals escalated appropriately (mandatory - verified by signal tracking)')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 14: COMPETITIVE ALTERNATIVES
-- ============================================================================

INSERT INTO jtbd_competitive_alternatives (
    id, jtbd_id, tenant_id, alternative_name, description
) VALUES
-- Alternatives for JTBD-MA-001
('ca1a1b2c-3d4e-5f67-890a-bcdef1234567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Manual Search (Current)', 'Current manual process for medical information retrieval'),
('ca2b2c3d-4e5f-6789-0abc-def123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Outsourced Medical Information', 'Third-party service for medical information management'),
('ca3c3d4e-5f6a-7890-1bcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Competitor AI Solution', 'Alternative AI-powered medical information system'),

-- Alternatives for JTBD-MA-002
('ca4d4e5f-6a7b-8901-2cde-f23456789012', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Manual Literature Review', 'Traditional manual literature screening process'),
('ca5e5f6a-7b89-0123-4def-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Third-party Literature Service', 'Outsourced literature surveillance service')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 15: COMPETITIVE STRENGTHS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_competitive_strengths (id, competitive_alternative_id, tenant_id, strength, importance_level)
VALUES
-- Strengths for Manual Search
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Full control over process', 'high'),
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'No additional cost', 'medium'),
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Familiar to team', 'medium'),

-- Strengths for Outsourced Service
(gen_random_uuid(), 'ca2b2c3d-4e5f-6789-0abc-def123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Scalable capacity', 'high'),
(gen_random_uuid(), 'ca2b2c3d-4e5f-6789-0abc-def123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Specialized expertise', 'high'),

-- Strengths for Competitor AI
(gen_random_uuid(), 'ca3c3d4e-5f6a-7890-1bcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Fast search capability', 'high'),
(gen_random_uuid(), 'ca3c3d4e-5f6a-7890-1bcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Consistent output', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 16: COMPETITIVE WEAKNESSES (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_competitive_weaknesses (id, competitive_alternative_id, tenant_id, weakness, severity, exploitability)
VALUES
-- Weaknesses for Manual Search
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Time-consuming and labor-intensive', 'critical', 'Automate search and retrieval'),
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent quality', 'high', 'Standardize with AI assistance'),
(gen_random_uuid(), 'ca1a1b2c-3d4e-5f67-890a-bcdef1234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Not scalable', 'high', 'Offer elastic capacity'),

-- Weaknesses for Outsourced
(gen_random_uuid(), 'ca2b2c3d-4e5f-6789-0abc-def123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Loss of internal expertise', 'high', 'Maintain control with AI augmentation'),
(gen_random_uuid(), 'ca2b2c3d-4e5f-6789-0abc-def123456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'High ongoing cost', 'medium', 'Lower TCO with automation'),

-- Weaknesses for Competitor AI
(gen_random_uuid(), 'ca3c3d4e-5f6a-7890-1bcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Limited customization', 'medium', 'Offer tailored workflows'),
(gen_random_uuid(), 'ca3c3d4e-5f6a-7890-1bcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compliance concerns', 'high', 'Built-in compliance validation')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 17: GEN AI OPPORTUNITIES
-- ============================================================================

INSERT INTO jtbd_gen_ai_opportunities (
    id, jtbd_id, tenant_id, automation_potential_score, augmentation_potential_score,
    total_estimated_value, implementation_complexity, recommended_approach
) VALUES
-- Opportunities for JTBD-MA-001
('a0a1a1b2-c3d4-e5f6-7890-abcdef123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 7.5, 8.5, '$150,000 annual savings', 'medium', 'Start with AI-powered search and summarization'),

-- Opportunities for JTBD-MA-002
('a0a3c3d4-e5f6-a7b8-9012-cdef34567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 8.0, 7.0, '$200,000 annual savings', 'medium', 'Implement AI abstract screening with human review')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 18: GEN AI CAPABILITIES (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_gen_ai_capabilities (id, gen_ai_opportunity_id, tenant_id, capability, capability_category, importance_level, maturity_level)
VALUES
-- Capabilities for AI Information Retrieval (JTBD-MA-001)
(gen_random_uuid(), 'a0a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Semantic Search', 'nlp', 'required', 'mature'),
(gen_random_uuid(), 'a0a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Document Summarization', 'nlp', 'required', 'mature'),
(gen_random_uuid(), 'a0a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Citation Extraction', 'extraction', 'preferred', 'developing'),

-- Capabilities for Abstract Screening (JTBD-MA-002)
(gen_random_uuid(), 'a0a3c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Text Classification', 'classification', 'required', 'mature'),
(gen_random_uuid(), 'a0a3c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Relevance Scoring', 'analytics', 'required', 'mature'),
(gen_random_uuid(), 'a0a3c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Entity Extraction', 'extraction', 'preferred', 'mature')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 19: GEN AI RISKS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_gen_ai_risks (id, gen_ai_opportunity_id, tenant_id, risk, risk_category, likelihood, impact)
VALUES
-- Risks for AI Information Retrieval (JTBD-MA-001)
('a1a1a1b2-c3d4-e5f6-7890-abcdef123456', 'a0a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'AI may miss relevant information', 'technical', 'medium', 'high'),
('a1a2b2c3-d4e5-f6a7-8901-bcdef2345678', 'a0a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Data privacy concerns with cloud AI', 'security', 'low', 'critical'),

-- Risks for Abstract Screening (JTBD-MA-002)
('a1a6f6a7-b890-1234-5678-f01678901234', 'a0a3c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'False negatives may miss safety signals', 'technical', 'low', 'critical'),
('a1a7a7b8-9012-3456-7890-012789012345', 'a0a3c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Model drift over time', 'technical', 'medium', 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 20: GEN AI MITIGATIONS (Normalized from text[])
-- ============================================================================

INSERT INTO jtbd_gen_ai_mitigations (id, gen_ai_risk_id, tenant_id, mitigation_strategy, owner_role, timeline, estimated_cost, status, effectiveness)
VALUES
-- Mitigations for Information Retrieval risks
(gen_random_uuid(), 'a1a1a1b2-c3d4-e5f6-7890-abcdef123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Implement human-in-the-loop review', 'Medical Reviewer', '3 months', '$20,000', 'planned', 'high'),
(gen_random_uuid(), 'a1a2b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Use on-premise or private cloud deployment', 'IT Security', '6 months', '$50,000', 'planned', 'high'),

-- Mitigations for Abstract Screening risks
(gen_random_uuid(), 'a1a6f6a7-b890-1234-5678-f01678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Conservative threshold settings', 'Data Scientist', '1 month', '$5,000', 'planned', 'medium'),
(gen_random_uuid(), 'a1a7a7b8-9012-3456-7890-012789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Quarterly model retraining', 'ML Engineer', 'Ongoing', '$15,000/year', 'planned', 'high')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 21: VALUE DRIVERS
-- ============================================================================

INSERT INTO jtbd_value_drivers (
    id, jtbd_id, tenant_id, value_description, quantified_impact, beneficiary
) VALUES
-- Value drivers for JTBD-MA-001
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce labor cost per response from $150 to $75', '$75,000 annual savings on 2000 responses', 'Medical Information Department'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce response cycle time from 48 to 24 hours', '50% improvement in customer satisfaction', 'Healthcare Providers'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce compliance risk score from 15% to 5%', '66% reduction in compliance incidents', 'Compliance Team'),

-- Value drivers for JTBD-MA-002
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce screening cost from $5 to $1 per abstract', '$80,000 annual savings on 20000 articles', 'Literature Review Team'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce signal identification time from 30 to 7 days', '77% faster safety signal detection', 'Pharmacovigilance Team')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'JTBD Seed Data Summary' as report;

SELECT 'Core JTBDs' as table_name, COUNT(*) as record_count FROM jobs_to_be_done
UNION ALL
SELECT 'JTBD-Role Mappings', COUNT(*) FROM jtbd_roles
UNION ALL
SELECT 'Pain Points', COUNT(*) FROM jtbd_pain_points
UNION ALL
SELECT 'Desired Outcomes', COUNT(*) FROM jtbd_desired_outcomes
UNION ALL
SELECT 'Workflow Stages', COUNT(*) FROM jtbd_workflow_stages
UNION ALL
SELECT 'Stage Key Activities', COUNT(*) FROM jtbd_stage_key_activities
UNION ALL
SELECT 'Stage Pain Points', COUNT(*) FROM jtbd_stage_pain_points
UNION ALL
SELECT 'Workflow Activities', COUNT(*) FROM jtbd_workflow_activities
UNION ALL
SELECT 'Activity Tools', COUNT(*) FROM jtbd_activity_tools
UNION ALL
SELECT 'Activity Outputs', COUNT(*) FROM jtbd_activity_outputs
UNION ALL
SELECT 'Outcomes (ODI)', COUNT(*) FROM jtbd_outcomes
UNION ALL
SELECT 'Obstacles', COUNT(*) FROM jtbd_obstacles
UNION ALL
SELECT 'KPIs', COUNT(*) FROM jtbd_kpis
UNION ALL
SELECT 'Success Criteria', COUNT(*) FROM jtbd_success_criteria
UNION ALL
SELECT 'Competitive Alternatives', COUNT(*) FROM jtbd_competitive_alternatives
UNION ALL
SELECT 'Competitive Strengths', COUNT(*) FROM jtbd_competitive_strengths
UNION ALL
SELECT 'Competitive Weaknesses', COUNT(*) FROM jtbd_competitive_weaknesses
UNION ALL
SELECT 'Gen AI Opportunities', COUNT(*) FROM jtbd_gen_ai_opportunities
UNION ALL
SELECT 'Gen AI Capabilities', COUNT(*) FROM jtbd_gen_ai_capabilities
UNION ALL
SELECT 'Gen AI Risks', COUNT(*) FROM jtbd_gen_ai_risks
UNION ALL
SELECT 'Gen AI Mitigations', COUNT(*) FROM jtbd_gen_ai_mitigations
UNION ALL
SELECT 'Value Drivers', COUNT(*) FROM jtbd_value_drivers
ORDER BY table_name;

-- ============================================================================
-- END OF JTBD SEED DATA
-- ============================================================================
