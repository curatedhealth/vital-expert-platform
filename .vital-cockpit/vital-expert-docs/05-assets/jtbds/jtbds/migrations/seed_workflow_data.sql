-- ============================================================================
-- Work Hierarchy Seed Data Template
-- Comprehensive sample data for Operations and Projects domains
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- PREREQUISITES: Run seed_jtbd_data.sql first for JTBD references
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
-- STEP 1: ENSURE TENANTS EXIST
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

-- ============================================================================
-- STEP 2: LIST ALL AVAILABLE TENANTS
-- ============================================================================

SELECT 'Available Tenants:' as info;
SELECT id, name, created_at FROM tenants ORDER BY name;

-- ============================================================================
-- STEP 3: VERIFY JTBD DATA EXISTS
-- ============================================================================

DO $$
DECLARE
    v_jtbd_count integer;
BEGIN
    SELECT COUNT(*) INTO v_jtbd_count
    FROM jobs_to_be_done
    WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1);

    RAISE NOTICE 'Seeding workflow data for:';
    RAISE NOTICE '  1. Vital System (00000000-0000-0000-0000-000000000001) - ALWAYS';
    RAISE NOTICE '  2. Pharmaceuticals (00000000-0000-0000-0000-000000000002) - Default customer';
    RAISE NOTICE 'Found % JTBDs for Pharmaceuticals tenant', v_jtbd_count;

    IF v_jtbd_count = 0 THEN
        RAISE WARNING 'No JTBDs found. Run seed_jtbd_data.sql first for complete data.';
    END IF;
END $$;

-- ============================================================================
-- PART 1: OPERATIONS DOMAIN - PROCESSES
-- ============================================================================

INSERT INTO processes (
    id, tenant_id, code, name, description, version, process_category, process_group,
    functional_area, status, effective_date, review_date, primary_jtbd_id,
    target_cycle_time, target_cost
) VALUES
-- Process 1: Medical Information Response Process
(
    '01a1b2c3-d4e5-f678-90ab-cdef12345678',
    (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
    'PROC-MA-001',
    'Medical Information Response Process',
    'End-to-end process for handling medical information inquiries from healthcare professionals',
    '2.0',
    'operate',
    'Customer Service',
    'medical_affairs',
    'active',
    '2024-01-01',
    '2025-01-01',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '24 hours',
    150.00
),
-- Process 2: Literature Surveillance Process
(
    '02b2c3d4-e5f6-7890-abcd-ef1234567890',
    (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
    'PROC-MA-002',
    'Scientific Literature Surveillance Process',
    'Systematic monitoring and review of scientific publications for safety signals and medical insights',
    '1.5',
    'operate',
    'Knowledge Management',
    'medical_affairs',
    'active',
    '2024-03-01',
    '2025-03-01',
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    '7 days',
    500.00
),
-- Process 3: KOL Engagement Process
(
    '03c3d4e5-f6a7-8901-bcde-f23456789012',
    (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
    'PROC-MA-003',
    'Key Opinion Leader Engagement Process',
    'Process for identifying, profiling, and engaging key opinion leaders for scientific exchange',
    '1.0',
    'manage',
    'Stakeholder Management',
    'medical_affairs',
    'active',
    '2024-06-01',
    '2025-06-01',
    'c3d4e5f6-a7b8-9012-cdef-345678901234',
    '30 days',
    2000.00
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: PROCESS SLA TARGETS
-- ============================================================================

INSERT INTO process_sla_targets (id, process_id, tenant_id, sla_name, metric_type, target_value, unit_of_measure, measurement_frequency)
VALUES
-- SLAs for Medical Information Process
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Standard Response Time', 'time', '48', 'hours', 'per inquiry'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Urgent Response Time', 'time', '24', 'hours', 'per inquiry'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Response Quality Score', 'quality', '4.5', 'score (1-5)', 'monthly'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compliance Rate', 'compliance', '100', 'percentage', 'monthly'),

-- SLAs for Literature Surveillance
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Completion', 'time', '7', 'days', 'weekly'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Signal Detection Time', 'time', '24', 'hours', 'per signal'),

-- SLAs for KOL Engagement
(gen_random_uuid(), '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Profile Completion', 'time', '5', 'business days', 'per KOL'),
(gen_random_uuid(), '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Engagement Response Rate', 'quality', '70', 'percentage', 'quarterly')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 3: PROCESS KPIs
-- ============================================================================

INSERT INTO process_kpis (id, process_id, tenant_id, kpi_name, kpi_description, target_value, current_value, unit_of_measure, measurement_frequency, data_source)
VALUES
-- KPIs for Medical Information Process
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inquiry Volume', 'Total inquiries received', NULL, '250', 'inquiries/month', 'monthly', 'MI System'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'SLA Compliance Rate', 'Percentage within SLA', '95', '87', 'percentage', 'weekly', 'MI System'),
(gen_random_uuid(), '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'First Contact Resolution', 'Resolved without follow-up', '85', '72', 'percentage', 'monthly', 'MI System'),

-- KPIs for Literature Surveillance
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Publications Screened', 'Weekly screening volume', NULL, '500', 'publications/week', 'weekly', 'Literature DB'),
(gen_random_uuid(), '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Signal Detection Rate', 'Signals per 1000 pubs', '5', '3', 'signals/1000', 'monthly', 'Safety DB'),

-- KPIs for KOL Engagement
(gen_random_uuid(), '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Active KOL Relationships', 'KOLs with recent engagement', '50', '42', 'KOLs', 'quarterly', 'CRM'),
(gen_random_uuid(), '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Engagement Score', 'Average engagement score', '4.0', '3.6', 'score (1-5)', 'quarterly', 'Survey')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 4: PROCESS ACTIVITIES
-- ============================================================================

INSERT INTO process_activities (
    id, process_id, tenant_id, sequence_order, code, name, description,
    purpose_statement, typical_duration, is_milestone, activity_owner_role
) VALUES
-- Activities for Medical Information Process
('a101a1b2-c3d4-e5f6-7890-abcdef123456', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'ACT-001', 'Inquiry Reception', 'Receive and log incoming medical inquiries',
 'To ensure all inquiries are captured and triaged appropriately', '15 minutes', false, 'MI Coordinator'),
('a201b2c3-d4e5-f6a7-8901-bcdef2345678', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'ACT-002', 'Information Research', 'Search and retrieve relevant medical information',
 'To gather accurate and complete information for response', '2 hours', false, 'MI Specialist'),
('a301c3d4-e5f6-a7b8-9012-cdef34567890', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'ACT-003', 'Response Development', 'Draft response using approved content',
 'To create accurate, compliant response documents', '1 hour', false, 'MI Specialist'),
('a401d4e5-f6a7-b890-1234-def456789012', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'ACT-004', 'Medical Review', 'Review response for accuracy and compliance',
 'To ensure medical accuracy and regulatory compliance', '4 hours', true, 'Medical Reviewer'),
('a501e5f6-a7b8-9012-3456-ef0567890123', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 5, 'ACT-005', 'Response Delivery', 'Send response and document completion',
 'To deliver response and maintain complete records', '30 minutes', true, 'MI Coordinator'),

-- Activities for Literature Surveillance Process
('a102f6a7-b890-1234-5678-f01678901234', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'ACT-101', 'Search Execution', 'Execute literature searches across databases',
 'To capture all relevant new publications', '1 hour', false, 'Literature Analyst'),
('a202a7b8-9012-3456-7890-012789012345', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'ACT-102', 'Abstract Screening', 'Screen abstracts for relevance',
 'To filter publications requiring full review', '4 hours', false, 'Literature Analyst'),
('a302b8c9-0123-4567-8901-123890123456', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'ACT-103', 'Full-Text Review', 'Review complete articles',
 'To extract key findings and identify signals', '8 hours', false, 'Medical Scientist'),
('a402c9d0-1234-5678-9012-234901234567', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'ACT-104', 'Impact Assessment', 'Assess findings and determine actions',
 'To prioritize and route findings appropriately', '2 hours', true, 'Medical Director'),

-- Activities for KOL Engagement Process
('a103d0e1-2345-6789-0123-345012345678', '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'ACT-201', 'KOL Identification', 'Identify potential KOLs for engagement',
 'To build comprehensive KOL candidate list', '2 days', false, 'Medical Liaison'),
('a203e1f2-3456-7890-1234-456123456789', '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'ACT-202', 'KOL Profiling', 'Create detailed KOL profiles',
 'To understand KOL expertise and influence', '1 day', false, 'Medical Liaison'),
('a303f2a3-4567-8901-2345-567234567890', '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'ACT-203', 'Engagement Planning', 'Develop engagement strategy',
 'To create tailored engagement approach', '2 days', true, 'Medical Director'),
('a403a3b4-5678-9012-3456-678345678901', '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'ACT-204', 'Engagement Execution', 'Execute planned engagements',
 'To conduct meaningful scientific exchange', '5 days', false, 'Medical Liaison')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 5: ACTIVITY ENTRY CRITERIA
-- ============================================================================

INSERT INTO activity_entry_criteria (id, activity_id, tenant_id, criterion_text, is_mandatory, verification_method, sequence_order)
VALUES
-- Entry criteria for Information Research
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inquiry logged in MI system', true, 'System check', 1),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inquiry categorized by therapeutic area', true, 'System check', 2),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Priority and SLA assigned', true, 'System check', 3),

-- Entry criteria for Medical Review
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Draft response completed', true, 'Document check', 1),
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All references cited', true, 'Document check', 2),
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Template properly populated', true, 'Document check', 3),

-- Entry criteria for Abstract Screening
(gen_random_uuid(), 'a202a7b8-9012-3456-7890-012789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All searches completed', true, 'System check', 1),
(gen_random_uuid(), 'a202a7b8-9012-3456-7890-012789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Results deduplicated', true, 'System check', 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 6: ACTIVITY EXIT CRITERIA
-- ============================================================================

INSERT INTO activity_exit_criteria (id, activity_id, tenant_id, criterion_text, is_mandatory, verification_method, sequence_order)
VALUES
-- Exit criteria for Information Research
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All relevant sources searched', true, 'Checklist', 1),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'References compiled and verified', true, 'Document review', 2),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search strategy documented', false, 'Document check', 3),

-- Exit criteria for Medical Review
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Medical accuracy confirmed', true, 'Reviewer signature', 1),
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compliance verified', true, 'Compliance check', 2),
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Approval documented', true, 'System record', 3),

-- Exit criteria for Impact Assessment
(gen_random_uuid(), 'a402c9d0-1234-5678-9012-234901234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All findings categorized', true, 'Report review', 1),
(gen_random_uuid(), 'a402c9d0-1234-5678-9012-234901234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Actions assigned with owners', true, 'Action tracker', 2)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 7: ACTIVITY DELIVERABLES
-- ============================================================================

INSERT INTO activity_deliverables (id, activity_id, tenant_id, deliverable_name, deliverable_type, description, is_mandatory)
VALUES
-- Deliverables for Information Research
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reference List', 'document', 'Compiled list of relevant references', true),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Log', 'document', 'Documentation of databases searched', true),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'PDF Articles', 'data', 'Full-text articles for reference', false),

-- Deliverables for Response Development
(gen_random_uuid(), 'a301c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Draft Response', 'document', 'Completed response document', true),
(gen_random_uuid(), 'a301c3d4-e5f6-a7b8-9012-cdef34567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Attachments', 'document', 'Supporting documents for response', false),

-- Deliverables for Medical Review
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Approved Response', 'document', 'Reviewed and approved response', true),
(gen_random_uuid(), 'a401d4e5-f6a7-b890-1234-def456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Review Comments', 'document', 'Reviewer feedback if applicable', false),

-- Deliverables for Literature Activities
(gen_random_uuid(), 'a102f6a7-b890-1234-5678-f01678901234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Results Export', 'data', 'Raw search results from all databases', true),
(gen_random_uuid(), 'a302b8c9-0123-4567-8901-123890123456', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Literature Summary Report', 'document', 'Summary of key findings', true),
(gen_random_uuid(), 'a402c9d0-1234-5678-9012-234901234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Action Items List', 'document', 'Required follow-up actions', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: ACTIVITY PAIN POINTS
-- ============================================================================

INSERT INTO activity_pain_points (id, activity_id, tenant_id, pain_point_text, pain_point_type, severity, frequency)
VALUES
-- Pain points for Information Research
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Multiple system logins required', 'technical', 'medium', 'always'),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search results often not relevant', 'process', 'high', 'often'),
(gen_random_uuid(), 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Difficult to track what was searched', 'technical', 'medium', 'often'),

-- Pain points for Abstract Screening
(gen_random_uuid(), 'a202a7b8-9012-3456-7890-012789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'High volume causes reviewer fatigue', 'resource', 'high', 'always'),
(gen_random_uuid(), 'a202a7b8-9012-3456-7890-012789012345', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inconsistent screening criteria application', 'knowledge', 'medium', 'often'),

-- Pain points for KOL Identification
(gen_random_uuid(), 'a103d0e1-2345-6789-0123-345012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Data scattered across multiple sources', 'technical', 'high', 'always'),
(gen_random_uuid(), 'a103d0e1-2345-6789-0123-345012345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Difficult to validate influence metrics', 'process', 'medium', 'often')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 9: PROJECTS DOMAIN
-- ============================================================================

INSERT INTO projects (
    id, name, description, organization_id, project_type_id, primary_jtbd_id, budget
) VALUES
-- Project 1: AI Medical Information Platform
(
    'e1a1b2c3-d4e5-f678-90ab-cdef12345671',
    'AI-Powered Medical Information Platform',
    'Implement AI capabilities to enhance medical information response process',
    (SELECT id FROM organizations LIMIT 1),
    get_project_type_id('clinical_decision_support'),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    500000.00
),
-- Project 2: Literature Surveillance Automation
(
    'e2b2c3d4-e5f6-7890-abcd-ef1234567892',
    'Literature Surveillance Automation Initiative',
    'Automate literature screening using NLP and machine learning',
    (SELECT id FROM organizations LIMIT 1),
    get_project_type_id('health_analytics'),
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    350000.00
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 10: PROJECT OBJECTIVES
-- ============================================================================

INSERT INTO project_objectives (id, project_id, tenant_id, objective_text, objective_type, is_primary, success_metric, target_value)
VALUES
-- Objectives for AI Medical Information Platform
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce average response time by 50%', 'business', true, 'Response Time', '24 hours'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Improve response quality score', 'quality', false, 'Quality Score', '4.5/5.0'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Achieve 95% SLA compliance', 'business', false, 'SLA Compliance', '95%'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Ensure full regulatory compliance', 'compliance', false, 'Compliance Rate', '100%'),

-- Objectives for Literature Automation
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Reduce screening time by 80%', 'business', true, 'Screening Time', '1 hour/100 abstracts'),
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Maintain 99% sensitivity for signals', 'quality', true, 'Sensitivity', '99%'),
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Expand coverage to 3x publications', 'business', false, 'Coverage', '60000/year')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 11: PROJECT DELIVERABLES
-- ============================================================================

INSERT INTO project_deliverables (id, project_id, tenant_id, deliverable_name, description, deliverable_type, due_date, acceptance_criteria, status)
VALUES
-- Deliverables for AI Medical Information Platform
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'AI Search Engine', 'Semantic search across medical databases', 'technical', '2025-03-31',
 'Successfully searches and ranks results with >90% relevance', 'in_progress'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Response Draft Generator', 'AI-powered response drafting system', 'technical', '2025-06-30',
 'Generates compliant drafts requiring minimal edits', 'pending'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Integration with MI System', 'Connect AI components to existing workflow', 'technical', '2025-08-31',
 'Seamless data flow with no manual intervention', 'pending'),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'User Training Program', 'Training materials and sessions', 'documentation', '2025-09-30',
 'All users trained and certified', 'pending'),

-- Deliverables for Literature Automation
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'NLP Classification Model', 'ML model for abstract relevance scoring', 'technical', '2025-04-30',
 'F1 score >0.95 on validation set', 'in_progress'),
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Screening Dashboard', 'UI for reviewers to validate AI results', 'technical', '2025-05-31',
 'Supports 1000+ abstracts per session', 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 12: PROJECT SUCCESS CRITERIA
-- ============================================================================

INSERT INTO project_success_criteria (id, project_id, tenant_id, criterion_text, measurement_method, target_value, is_mandatory)
VALUES
-- Success criteria for AI Medical Information Platform
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'System achieves target response time reduction', 'Performance testing', '50% reduction', true),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'User satisfaction meets threshold', 'Survey', '4.0/5.0', true),
(gen_random_uuid(), 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'ROI achieved within 12 months', 'Financial analysis', 'Positive ROI', false),

-- Success criteria for Literature Automation
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'No critical signals missed', 'Retrospective audit', '0 missed', true),
(gen_random_uuid(), 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Throughput target achieved', 'System metrics', '80% reduction', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 13: PROJECT PHASES
-- ============================================================================

INSERT INTO project_phases (
    id, project_id, tenant_id, phase_number, name, description,
    planned_start_date, planned_end_date, milestone_name, is_gate_review, gate_criteria, status
) VALUES
-- Phases for AI Medical Information Platform
('f1010101-b2c3-d4e5-f678-90abcdef1234', 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'Discovery & Design', 'Requirements gathering and solution design',
 '2025-01-01', '2025-02-28', 'Design Approved', true, 'Design documents approved by stakeholders', 'completed'),
('f2010102-c3d4-e5f6-7890-abcdef234567', 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'Development', 'Build AI components and integrations',
 '2025-03-01', '2025-07-31', 'Development Complete', true, 'All components pass testing', 'in_progress'),
('f3010103-d4e5-f6a7-8901-bcdef3456789', 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'Testing & Validation', 'System testing and validation',
 '2025-08-01', '2025-09-15', 'Validation Complete', true, 'All test cases pass', 'not_started'),
('f4010104-e5f6-a7b8-9012-cdef45678901', 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 4, 'Deployment & Training', 'System deployment and user training',
 '2025-09-16', '2025-10-31', 'Go Live', true, 'System live and users trained', 'not_started'),

-- Phases for Literature Automation
('f1020105-f6a7-b890-1234-def567890123', 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 1, 'Model Development', 'Build and train NLP classification model',
 '2025-02-01', '2025-04-30', 'Model Validated', true, 'Model meets performance criteria', 'in_progress'),
('f2020106-a7b8-9012-3456-ef0678901234', 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 2, 'Integration & UI', 'Build UI and integrate with literature systems',
 '2025-05-01', '2025-06-30', 'Integration Complete', true, 'End-to-end workflow functional', 'not_started'),
('f3020107-b890-1234-5678-f01789012345', 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 3, 'Pilot & Refinement', 'Pilot with users and refine based on feedback',
 '2025-07-01', '2025-08-31', 'Pilot Success', true, 'User acceptance achieved', 'not_started')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 14: PHASE ENTRY/EXIT CRITERIA
-- ============================================================================

INSERT INTO phase_entry_criteria (id, phase_id, tenant_id, criterion_text, is_mandatory, verification_method)
VALUES
-- Entry criteria for Development phase
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Design documents approved', true, 'Sign-off document'),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Development team assigned', true, 'Resource plan'),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Development environment ready', true, 'Environment checklist'),

-- Entry criteria for Testing phase
(gen_random_uuid(), 'f3010103-d4e5-f6a7-8901-bcdef3456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All development complete', true, 'Code complete sign-off'),
(gen_random_uuid(), 'f3010103-d4e5-f6a7-8901-bcdef3456789', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Test cases documented', true, 'Test plan review')
ON CONFLICT DO NOTHING;

INSERT INTO phase_exit_criteria (id, phase_id, tenant_id, criterion_text, is_mandatory, verification_method)
VALUES
-- Exit criteria for Design phase
(gen_random_uuid(), 'f1010101-b2c3-d4e5-f678-90abcdef1234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All design documents approved', true, 'Stakeholder sign-off'),
(gen_random_uuid(), 'f1010101-b2c3-d4e5-f678-90abcdef1234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Technical architecture finalized', true, 'Architecture review'),

-- Exit criteria for Development phase
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All components developed', true, 'Code review complete'),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Unit tests pass', true, 'Test report'),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Code deployed to test environment', true, 'Deployment log')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 15: PHASE DELIVERABLES
-- ============================================================================

INSERT INTO phase_deliverables (id, phase_id, tenant_id, deliverable_name, deliverable_type, description, is_mandatory)
VALUES
-- Deliverables for Design phase
(gen_random_uuid(), 'f1010101-b2c3-d4e5-f678-90abcdef1234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Requirements Document', 'document', 'Detailed functional and non-functional requirements', true),
(gen_random_uuid(), 'f1010101-b2c3-d4e5-f678-90abcdef1234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Technical Architecture', 'document', 'System architecture and technology stack', true),
(gen_random_uuid(), 'f1010101-b2c3-d4e5-f678-90abcdef1234', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'UI/UX Designs', 'document', 'Wireframes and UI specifications', true),

-- Deliverables for Development phase
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Source Code', 'data', 'All application source code', true),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'API Documentation', 'document', 'API specifications and examples', true),
(gen_random_uuid(), 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Unit Test Suite', 'data', 'Automated unit tests', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 16: WORK PACKAGES
-- ============================================================================

INSERT INTO work_packages (
    id, phase_id, tenant_id, wbs_code, name, description, scope_statement,
    responsible_team, estimated_effort_hours, estimated_cost, planned_start_date, planned_end_date,
    status, percent_complete
) VALUES
-- Work packages for Development phase
('d1f2a1b2-c3d4-e5f6-7890-abcdef123401', 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '2.1', 'AI Search Engine Development', 'Build semantic search capability',
 'Develop AI-powered search engine that can semantically search across medical databases',
 'AI Development Team', 400, 80000, '2025-03-01', '2025-04-30', 'in_progress', 60),
('d2f2b2c3-d4e5-f6a7-8901-bcdef2345602', 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '2.2', 'Response Generator Development', 'Build AI response drafting system',
 'Develop system to generate response drafts using templates and AI',
 'AI Development Team', 500, 100000, '2025-04-01', '2025-06-30', 'not_started', 0),
('d3f2c3d4-e5f6-a7b8-9012-cdef34567803', 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '2.3', 'System Integration', 'Integrate AI with existing MI system',
 'Connect AI components to existing medical information workflow',
 'Integration Team', 300, 60000, '2025-05-01', '2025-07-31', 'not_started', 0),
('d4f2d4e5-f6a7-b890-1234-def456789004', 'f2010102-c3d4-e5f6-7890-abcdef234567', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '2.4', 'Compliance Validation Layer', 'Build compliance checking system',
 'Develop system to validate AI outputs against compliance rules',
 'Compliance Tech Team', 200, 40000, '2025-06-01', '2025-07-15', 'not_started', 0),

-- Work packages for Model Development phase (Literature project)
('d1f1e5f6-a7b8-9012-3456-ef0567890105', 'f1020105-f6a7-b890-1234-def567890123', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '1.1', 'Training Data Preparation', 'Prepare labeled dataset for model training',
 'Collect and label historical abstracts for model training',
 'Data Science Team', 200, 40000, '2025-02-01', '2025-03-15', 'completed', 100),
('d2f1f6a7-b890-1234-5678-f01678901206', 'f1020105-f6a7-b890-1234-def567890123', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '1.2', 'Model Architecture & Training', 'Design and train NLP model',
 'Build transformer-based classification model for abstract screening',
 'ML Engineering Team', 300, 60000, '2025-03-01', '2025-04-15', 'in_progress', 50),
('d3f1a7b8-9012-3456-7890-012789012307', 'f1020105-f6a7-b890-1234-def567890123', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 '1.3', 'Model Validation', 'Validate model performance',
 'Test model against validation set and tune parameters',
 'ML Engineering Team', 100, 20000, '2025-04-01', '2025-04-30', 'not_started', 0)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 17: WORK PACKAGE ACCEPTANCE CRITERIA
-- ============================================================================

INSERT INTO work_package_acceptance_criteria (id, work_package_id, tenant_id, criterion_text, verification_method, is_met)
VALUES
-- Acceptance criteria for AI Search Engine
(gen_random_uuid(), 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search returns results in <2 seconds', 'Performance test', false),
(gen_random_uuid(), 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Relevance score >90% on test queries', 'Accuracy test', false),
(gen_random_uuid(), 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Handles 100 concurrent searches', 'Load test', false),

-- Acceptance criteria for Response Generator
(gen_random_uuid(), 'd2f2b2c3-d4e5-f6a7-8901-bcdef2345602', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Generates draft in <30 seconds', 'Performance test', false),
(gen_random_uuid(), 'd2f2b2c3-d4e5-f6a7-8901-bcdef2345602', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Drafts require <20% editing', 'User testing', false),
(gen_random_uuid(), 'd2f2b2c3-d4e5-f6a7-8901-bcdef2345602', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'All templates supported', 'Feature test', false),

-- Acceptance criteria for Model Training
(gen_random_uuid(), 'd2f1f6a7-b890-1234-5678-f01678901206', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'F1 score >0.95', 'Model evaluation', false),
(gen_random_uuid(), 'd2f1f6a7-b890-1234-5678-f01678901206', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Sensitivity >99% for signals', 'Model evaluation', false),
(gen_random_uuid(), 'd2f1f6a7-b890-1234-5678-f01678901206', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Inference time <100ms per abstract', 'Performance test', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 18: TASKS (Link to Activities and Work Packages)
-- ============================================================================

-- Update existing tasks to link to activities (if tasks table exists)
-- Or insert new tasks linked to activities and work packages

-- Note: This assumes tasks table exists with activity_id and work_package_id columns
-- If not, run work_hierarchy_normalized_schema.sql first

INSERT INTO tasks (id, tenant_id, name, slug, description, activity_id, work_package_id, priority, estimated_duration_minutes)
VALUES
-- Tasks for Information Research activity
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search PubMed', 'search-pubmed', 'Execute PubMed search for inquiry topic',
 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', NULL, 'high', 30),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Search Internal KB', 'search-internal-kb', 'Search internal knowledge base',
 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', NULL, 'high', 20),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Review Product Labeling', 'review-product-labeling', 'Check current product labeling',
 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', NULL, 'medium', 15),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Compile References', 'compile-references', 'Create reference list for response',
 'a201b2c3-d4e5-f6a7-8901-bcdef2345678', NULL, 'medium', 15),

-- Tasks for AI Search Engine work package
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Design Search Architecture', 'design-search-architecture', 'Design semantic search architecture',
 NULL, 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', 'high', 480),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Implement Vector Store', 'implement-vector-store', 'Set up vector database for embeddings',
 NULL, 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', 'high', 960),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Build Search API', 'build-search-api', 'Develop REST API for search',
 NULL, 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', 'high', 720),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Implement Result Ranking', 'implement-result-ranking', 'Add relevance ranking algorithm',
 NULL, 'd1f2a1b2-c3d4-e5f6-7890-abcdef123401', 'medium', 480),

-- Tasks for Model Training work package
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Fine-tune BERT Model', 'fine-tune-bert-model', 'Fine-tune pre-trained BERT for classification',
 NULL, 'd2f1f6a7-b890-1234-5678-f01678901206', 'critical', 1200),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Hyperparameter Tuning', 'hyperparameter-tuning', 'Optimize model hyperparameters',
 NULL, 'd2f1f6a7-b890-1234-5678-f01678901206', 'high', 480),
(gen_random_uuid(), (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
 'Cross-Validation Testing', 'cross-validation-testing', 'Perform k-fold cross validation',
 NULL, 'd2f1f6a7-b890-1234-5678-f01678901206', 'high', 240)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 19: TASK INPUTS/OUTPUTS
-- ============================================================================

-- Get task IDs for reference (using names as we generated random UUIDs above)
-- In production, you would use actual task IDs

-- For demonstration, inserting with subqueries
INSERT INTO task_inputs (id, task_id, tenant_id, input_name, input_type, description, is_required, source)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    'Medical Inquiry Details',
    'data',
    'Original inquiry text and metadata',
    true,
    'MI Tracking System'
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_inputs (id, task_id, tenant_id, input_name, input_type, description, is_required, source)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    'Search Keywords',
    'parameter',
    'Keywords extracted from inquiry',
    true,
    'Triage Activity'
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_outputs (id, task_id, tenant_id, output_name, output_type, description, destination)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    'PubMed Results',
    'data',
    'List of relevant PubMed articles',
    'Reference Compilation'
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_outputs (id, task_id, tenant_id, output_name, output_type, description, destination)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    'Search Log Entry',
    'data',
    'Documentation of search executed',
    'Audit Trail'
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 20: TASK STEPS
-- ============================================================================

-- Steps for Search PubMed task
INSERT INTO task_steps (id, task_id, tenant_id, sequence_order, name, description, step_type, is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    1,
    'Connect to PubMed',
    'Establish API connection to PubMed',
    'api_call',
    false,
    'retry',
    30,
    5
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_steps (id, task_id, tenant_id, sequence_order, name, description, step_type, is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    2,
    'Execute Search Query',
    'Run search with medical terms',
    'api_call',
    false,
    'stop',
    60,
    30
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_steps (id, task_id, tenant_id, sequence_order, name, description, step_type, is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    3,
    'Parse Results',
    'Extract relevant fields from results',
    'computation',
    false,
    'stop',
    30,
    10
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_steps (id, task_id, tenant_id, sequence_order, name, description, step_type, is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    4,
    'Filter by Relevance',
    'Apply relevance scoring to results',
    'computation',
    false,
    'skip',
    30,
    15
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO task_steps (id, task_id, tenant_id, sequence_order, name, description, step_type, is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds)
SELECT
    gen_random_uuid(),
    t.id,
    t.tenant_id,
    5,
    'Store Results',
    'Save results to database',
    'db_operation',
    false,
    'stop',
    30,
    5
FROM tasks t WHERE t.name = 'Search PubMed' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 21: STEP PARAMETERS
-- ============================================================================

-- Parameters for Execute Search Query step
INSERT INTO step_parameters (id, step_id, tenant_id, parameter_name, parameter_value, parameter_type, is_required, default_value)
SELECT
    gen_random_uuid(),
    s.id,
    s.tenant_id,
    'max_results',
    '100',
    'number',
    false,
    '50'
FROM task_steps s WHERE s.name = 'Execute Search Query' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO step_parameters (id, step_id, tenant_id, parameter_name, parameter_value, parameter_type, is_required, default_value)
SELECT
    gen_random_uuid(),
    s.id,
    s.tenant_id,
    'date_range',
    '5y',
    'string',
    false,
    '10y'
FROM task_steps s WHERE s.name = 'Execute Search Query' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO step_parameters (id, step_id, tenant_id, parameter_name, parameter_value, parameter_type, is_required, default_value)
SELECT
    gen_random_uuid(),
    s.id,
    s.tenant_id,
    'sort_by',
    'relevance',
    'string',
    false,
    'date'
FROM task_steps s WHERE s.name = 'Execute Search Query' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 22: JTBD MAPPINGS
-- ============================================================================

INSERT INTO jtbd_process_mapping (id, jtbd_id, process_id, tenant_id, mapping_type)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '01a1b2c3-d4e5-f678-90ab-cdef12345678', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1), 'primary'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', '02b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1), 'primary'),
(gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-345678901234', '03c3d4e5-f6a7-8901-bcde-f23456789012', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1), 'primary')
ON CONFLICT DO NOTHING;

INSERT INTO jtbd_project_mapping (id, jtbd_id, project_id, tenant_id, mapping_type)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'e1a1b2c3-d4e5-f678-90ab-cdef12345671', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1), 'primary'),
(gen_random_uuid(), 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'e2b2c3d4-e5f6-7890-abcd-ef1234567892', (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1), 'primary')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Workflow Seed Data Summary' as report;

SELECT 'Project Types' as table_name, COUNT(*) as record_count FROM project_types
UNION ALL
SELECT 'Processes', COUNT(*) FROM processes
UNION ALL
SELECT 'Process SLA Targets', COUNT(*) FROM process_sla_targets
UNION ALL
SELECT 'Process KPIs', COUNT(*) FROM process_kpis
UNION ALL
SELECT 'Process Activities', COUNT(*) FROM process_activities
UNION ALL
SELECT 'Activity Entry Criteria', COUNT(*) FROM activity_entry_criteria
UNION ALL
SELECT 'Activity Exit Criteria', COUNT(*) FROM activity_exit_criteria
UNION ALL
SELECT 'Activity Deliverables', COUNT(*) FROM activity_deliverables
UNION ALL
SELECT 'Activity Pain Points', COUNT(*) FROM activity_pain_points
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Project Objectives', COUNT(*) FROM project_objectives
UNION ALL
SELECT 'Project Deliverables', COUNT(*) FROM project_deliverables
UNION ALL
SELECT 'Project Success Criteria', COUNT(*) FROM project_success_criteria
UNION ALL
SELECT 'Project Phases', COUNT(*) FROM project_phases
UNION ALL
SELECT 'Phase Entry Criteria', COUNT(*) FROM phase_entry_criteria
UNION ALL
SELECT 'Phase Exit Criteria', COUNT(*) FROM phase_exit_criteria
UNION ALL
SELECT 'Phase Deliverables', COUNT(*) FROM phase_deliverables
UNION ALL
SELECT 'Work Packages', COUNT(*) FROM work_packages
UNION ALL
SELECT 'WP Acceptance Criteria', COUNT(*) FROM work_package_acceptance_criteria
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Task Inputs', COUNT(*) FROM task_inputs
UNION ALL
SELECT 'Task Outputs', COUNT(*) FROM task_outputs
UNION ALL
SELECT 'Task Steps', COUNT(*) FROM task_steps
UNION ALL
SELECT 'Step Parameters', COUNT(*) FROM step_parameters
UNION ALL
SELECT 'JTBD Process Mappings', COUNT(*) FROM jtbd_process_mapping
UNION ALL
SELECT 'JTBD Project Mappings', COUNT(*) FROM jtbd_project_mapping
ORDER BY table_name;

-- ============================================================================
-- END OF WORKFLOW SEED DATA
-- ============================================================================
