-- =====================================================================================
-- VITAL Platform - SQL Templates Reference
-- Comprehensive INSERT templates with exact schema requirements
-- Date: 2025-11-19
-- =====================================================================================
--
-- This file contains validated INSERT templates for all JTBD and Work Hierarchy tables.
-- All column names have been verified against the actual deployed database schema.
--
-- =====================================================================================

-- =====================================================================================
-- SECTION 1: FOUNDATION TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 1.1 tenants
-- -----------------------------------------------------------------------------
INSERT INTO tenants (id, name, slug, tenant_path, tenant_level)
VALUES (
    'uuid-here',           -- id: UUID PRIMARY KEY
    'Tenant Name',         -- name: TEXT NOT NULL
    'tenant-slug',         -- slug: TEXT NOT NULL UNIQUE
    'tenant-path',         -- tenant_path: TEXT
    0                      -- tenant_level: INTEGER
);

-- -----------------------------------------------------------------------------
-- 1.2 project_types (Reference Table - Normalized)
-- -----------------------------------------------------------------------------
INSERT INTO project_types (id, tenant_id, code, name, description, category, is_active, display_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    NULL,                           -- tenant_id: UUID (NULL for global, tenant_id for tenant-specific)
    'type_code',                    -- code: TEXT NOT NULL
    'Type Name',                    -- name: TEXT NOT NULL
    'Type description',             -- description: TEXT
    'category',                     -- category: TEXT (e.g., 'digital_health', 'clinical', 'analytics')
    true,                           -- is_active: BOOLEAN DEFAULT true
    1                               -- display_order: INTEGER DEFAULT 0
);

-- =====================================================================================
-- SECTION 2: ORGANIZATIONAL STRUCTURE
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 2.1 org_functions
-- -----------------------------------------------------------------------------
INSERT INTO org_functions (id, tenant_id, name, slug, description)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL
    'Function Name'::functional_area_type,  -- name: functional_area_type ENUM
    'function-slug',                -- slug: TEXT
    'Function description'          -- description: TEXT
);

-- -----------------------------------------------------------------------------
-- 2.2 org_departments
-- -----------------------------------------------------------------------------
INSERT INTO org_departments (id, tenant_id, name, slug, function_id, description)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL
    'Department Name',              -- name: TEXT NOT NULL
    'department-slug',              -- slug: TEXT
    'function-uuid',                -- function_id: UUID FK to org_functions
    'Department description'        -- description: TEXT
);

-- -----------------------------------------------------------------------------
-- 2.3 org_roles
-- -----------------------------------------------------------------------------
INSERT INTO org_roles (id, tenant_id, name, slug, department_id, function_id, description)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL
    'Role Name',                    -- name: VARCHAR NOT NULL
    'role-slug',                    -- slug: VARCHAR NOT NULL
    'department-uuid',              -- department_id: UUID FK to org_departments
    'function-uuid',                -- function_id: UUID FK to org_functions
    'Role description'              -- description: TEXT
);

-- -----------------------------------------------------------------------------
-- 2.4 personas
-- -----------------------------------------------------------------------------
INSERT INTO personas (id, tenant_id, name, role_id, department_id, function_id, description)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL
    'Persona Name',                 -- name: TEXT NOT NULL
    'role-uuid',                    -- role_id: UUID FK to org_roles
    'department-uuid',              -- department_id: UUID FK to org_departments
    'function-uuid',                -- function_id: UUID FK to org_functions
    'Persona description'           -- description: TEXT
);

-- =====================================================================================
-- SECTION 3: JTBD CORE TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 3.1 jobs_to_be_done
-- -----------------------------------------------------------------------------
INSERT INTO jobs_to_be_done (
    id, tenant_id, code, name, description, functional_area, job_category,
    complexity, frequency, priority_score, status, validation_score,
    job_statement, functional_job, emotional_job, social_job, job_context
)
VALUES (
    'jtbd-uuid',                    -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL
    'JTBD-001',                     -- code: TEXT NOT NULL
    'JTBD Name',                    -- name: TEXT NOT NULL
    'JTBD description',             -- description: TEXT
    'medical_affairs',              -- functional_area: functional_area_type ENUM
    'operational',                  -- job_category: TEXT ('strategic', 'operational', 'tactical')
    'medium',                       -- complexity: TEXT ('low', 'medium', 'high', 'very_high')
    'daily',                        -- frequency: TEXT ('daily', 'weekly', 'monthly', 'quarterly', 'annually')
    8,                              -- priority_score: INTEGER (1-10)
    'active',                       -- status: TEXT ('draft', 'validated', 'active', 'deprecated')
    0.85,                           -- validation_score: NUMERIC(3,2) (0.00-1.00)
    'Job statement text',           -- job_statement: TEXT
    'Functional job text',          -- functional_job: TEXT
    'Emotional job text',           -- emotional_job: TEXT
    'Social job text',              -- social_job: TEXT
    'Job context text'              -- job_context: TEXT
);

-- -----------------------------------------------------------------------------
-- 3.2 jtbd_roles (JTBD-Role Mapping - Preferred Pattern)
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_roles (id, jtbd_id, role_id, relevance_score, is_primary, notes, mapping_source)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK to jobs_to_be_done
    'role-uuid',                    -- role_id: UUID NOT NULL FK to org_roles
    0.95,                           -- relevance_score: DECIMAL(3,2) (0.00-1.00)
    true,                           -- is_primary: BOOLEAN DEFAULT false
    'Additional notes',             -- notes: TEXT
    'manual'                        -- mapping_source: TEXT ('manual', 'ai_suggested', 'imported', 'derived')
);
-- UNIQUE constraint on (jtbd_id, role_id)

-- =====================================================================================
-- SECTION 4: JTBD ATTRIBUTE TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 4.1 jtbd_pain_points
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_pain_points (id, jtbd_id, tenant_id, issue, severity, pain_point_type, frequency, impact_description)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Pain point description',       -- issue: TEXT NOT NULL
    'high',                         -- severity: TEXT ('low', 'medium', 'high', 'critical')
    'technical',                    -- pain_point_type: TEXT ('technical', 'resource', 'process', 'political', 'knowledge', 'compliance')
    'often',                        -- frequency: TEXT ('always', 'often', 'sometimes', 'rarely')
    'Impact description'            -- impact_description: TEXT
);

-- -----------------------------------------------------------------------------
-- 4.2 jtbd_desired_outcomes
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_desired_outcomes (id, jtbd_id, tenant_id, outcome, importance, outcome_type, current_satisfaction, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Outcome description',          -- outcome: TEXT NOT NULL
    9,                              -- importance: INTEGER (1-10)
    'speed',                        -- outcome_type: TEXT ('speed', 'stability', 'output', 'cost', 'risk')
    4,                              -- current_satisfaction: INTEGER (1-10)
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 4.3 jtbd_outcomes (ODI Framework)
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_outcomes (id, jtbd_id, tenant_id, outcome_id, outcome_statement, outcome_type, importance_score, satisfaction_score)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'OUT-001',                      -- outcome_id: TEXT NOT NULL
    'Minimize time to...',          -- outcome_statement: TEXT NOT NULL
    'speed',                        -- outcome_type: TEXT ('speed', 'stability', 'output', 'cost', 'risk')
    9,                              -- importance_score: NUMERIC (0-10)
    4                               -- satisfaction_score: NUMERIC (0-10)
    -- opportunity_score is GENERATED
);

-- -----------------------------------------------------------------------------
-- 4.4 jtbd_obstacles
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_obstacles (id, jtbd_id, tenant_id, obstacle_text, obstacle_type, severity)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Obstacle description',         -- obstacle_text: TEXT NOT NULL
    'technical',                    -- obstacle_type: TEXT ('technical', 'resource', 'process', 'political', 'knowledge')
    'high'                          -- severity: TEXT ('low', 'medium', 'high', 'critical')
);

-- -----------------------------------------------------------------------------
-- 4.5 jtbd_kpis
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_kpis (id, jtbd_id, tenant_id, kpi_code, kpi_name, kpi_description, target_value, current_value)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'KPI-001',                      -- kpi_code: TEXT NOT NULL (required!)
    'KPI Name',                     -- kpi_name: TEXT NOT NULL
    'KPI description',              -- kpi_description: TEXT
    95,                             -- target_value: NUMERIC
    87                              -- current_value: NUMERIC
);

-- -----------------------------------------------------------------------------
-- 4.6 jtbd_success_criteria
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_success_criteria (id, jtbd_id, tenant_id, criterion_text)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Success criterion description' -- criterion_text: TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4.7 jtbd_competitive_alternatives
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_competitive_alternatives (id, jtbd_id, tenant_id, alternative_name, description)
VALUES (
    'uuid-here',                    -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Alternative Name',             -- alternative_name: TEXT NOT NULL
    'Alternative description'       -- description: TEXT
);

-- -----------------------------------------------------------------------------
-- 4.8 jtbd_competitive_strengths
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_competitive_strengths (id, alternative_id, tenant_id, strength_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'alternative-uuid',             -- alternative_id: UUID NOT NULL FK to jtbd_competitive_alternatives
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Strength description',         -- strength_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 4.9 jtbd_competitive_weaknesses
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_competitive_weaknesses (id, alternative_id, tenant_id, weakness_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'alternative-uuid',             -- alternative_id: UUID NOT NULL FK to jtbd_competitive_alternatives
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Weakness description',         -- weakness_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 4.10 jtbd_value_drivers
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_value_drivers (id, jtbd_id, tenant_id, value_description, quantified_impact, beneficiary)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Value description',            -- value_description: TEXT NOT NULL
    '$75,000 annual savings',       -- quantified_impact: TEXT
    'Department Name'               -- beneficiary: TEXT
);

-- =====================================================================================
-- SECTION 5: JTBD WORKFLOW TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 5.1 jtbd_workflow_stages
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_workflow_stages (id, jtbd_id, tenant_id, stage_name, stage_order, description, duration_estimate, success_criteria)
VALUES (
    'stage-uuid',                   -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Stage Name',                   -- stage_name: TEXT NOT NULL
    1,                              -- stage_order: INTEGER NOT NULL
    'Stage description',            -- description: TEXT
    '2 hours',                      -- duration_estimate: TEXT
    'Stage success criteria'        -- success_criteria: TEXT
);

-- -----------------------------------------------------------------------------
-- 5.2 jtbd_stage_key_activities
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_stage_key_activities (id, workflow_stage_id, tenant_id, activity_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'stage-uuid',                   -- workflow_stage_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Activity description',         -- activity_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 5.3 jtbd_stage_pain_points
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_stage_pain_points (id, workflow_stage_id, tenant_id, pain_point_text)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'stage-uuid',                   -- workflow_stage_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Stage pain point description'  -- pain_point_text: TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 5.4 jtbd_workflow_activities
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_workflow_activities (id, jtbd_id, workflow_stage_id, tenant_id, activity_name, description, sequence_order, estimated_duration, is_automatable, automation_potential)
VALUES (
    'activity-uuid',                -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'stage-uuid',                   -- workflow_stage_id: UUID FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Activity Name',                -- activity_name: TEXT NOT NULL
    'Activity description',         -- description: TEXT
    1,                              -- sequence_order: INTEGER
    '30 minutes',                   -- estimated_duration: TEXT
    true,                           -- is_automatable: BOOLEAN
    8                               -- automation_potential: INTEGER (1-10)
);

-- -----------------------------------------------------------------------------
-- 5.5 jtbd_activity_tools
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_activity_tools (id, workflow_activity_id, tenant_id, tool_name, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- workflow_activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Tool Name',                    -- tool_name: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 5.6 jtbd_activity_outputs
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_activity_outputs (id, workflow_activity_id, tenant_id, output_name, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- workflow_activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Output Name',                  -- output_name: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- =====================================================================================
-- SECTION 6: JTBD GEN AI TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 6.1 jtbd_gen_ai_opportunities
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_gen_ai_opportunities (id, jtbd_id, tenant_id, automation_potential_score, augmentation_potential_score, total_estimated_value, implementation_complexity, recommended_approach)
VALUES (
    'opportunity-uuid',             -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK (UNIQUE)
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    7.5,                            -- automation_potential_score: NUMERIC
    8.5,                            -- augmentation_potential_score: NUMERIC
    '$150,000 annual savings',      -- total_estimated_value: TEXT
    'medium',                       -- implementation_complexity: TEXT ('low', 'medium', 'high')
    'Recommended approach text'     -- recommended_approach: TEXT
);

-- -----------------------------------------------------------------------------
-- 6.2 jtbd_gen_ai_capabilities
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_gen_ai_capabilities (id, opportunity_id, tenant_id, capability_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'opportunity-uuid',             -- opportunity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'AI capability description',    -- capability_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 6.3 jtbd_gen_ai_risks
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_gen_ai_risks (id, opportunity_id, tenant_id, risk_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'opportunity-uuid',             -- opportunity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Risk description',             -- risk_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- -----------------------------------------------------------------------------
-- 6.4 jtbd_gen_ai_mitigations
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_gen_ai_mitigations (id, opportunity_id, tenant_id, mitigation_text, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'opportunity-uuid',             -- opportunity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Mitigation strategy',          -- mitigation_text: TEXT NOT NULL
    1                               -- sequence_order: INTEGER
);

-- =====================================================================================
-- SECTION 7: OPERATIONS DOMAIN (PROCESSES)
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 7.1 processes
-- -----------------------------------------------------------------------------
INSERT INTO processes (
    id, tenant_id, code, name, description, version, process_category, process_group,
    functional_area, status, effective_date, review_date, primary_jtbd_id,
    target_cycle_time, target_cost
)
VALUES (
    'process-uuid',                 -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'PROC-001',                     -- code: TEXT NOT NULL
    'Process Name',                 -- name: TEXT NOT NULL
    'Process description',          -- description: TEXT
    '1.0',                          -- version: TEXT DEFAULT '1.0'
    'operate',                      -- process_category: TEXT NOT NULL ('operate', 'manage', 'support')
    'Customer Service',             -- process_group: TEXT
    'medical_affairs',              -- functional_area: TEXT
    'active',                       -- status: TEXT NOT NULL DEFAULT 'draft'
    '2024-01-01',                   -- effective_date: DATE
    '2025-01-01',                   -- review_date: DATE
    'jtbd-uuid',                    -- primary_jtbd_id: UUID FK
    '24 hours',                     -- target_cycle_time: INTERVAL
    150.00                          -- target_cost: NUMERIC
);

-- -----------------------------------------------------------------------------
-- 7.2 process_sla_targets
-- -----------------------------------------------------------------------------
INSERT INTO process_sla_targets (id, process_id, tenant_id, sla_name, metric_type, target_value, unit_of_measure, measurement_frequency)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'process-uuid',                 -- process_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'SLA Name',                     -- sla_name: TEXT NOT NULL
    'time',                         -- metric_type: TEXT NOT NULL ('time', 'quality', 'cost', 'compliance')
    '24',                           -- target_value: TEXT NOT NULL
    'hours',                        -- unit_of_measure: TEXT NOT NULL
    'weekly'                        -- measurement_frequency: TEXT
);

-- -----------------------------------------------------------------------------
-- 7.3 process_kpis
-- -----------------------------------------------------------------------------
INSERT INTO process_kpis (id, process_id, tenant_id, kpi_name, kpi_description, target_value, current_value, unit_of_measure, measurement_frequency, data_source)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'process-uuid',                 -- process_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'KPI Name',                     -- kpi_name: TEXT NOT NULL
    'KPI description',              -- kpi_description: TEXT
    '95',                           -- target_value: TEXT
    '87',                           -- current_value: TEXT
    'percentage',                   -- unit_of_measure: TEXT
    'weekly',                       -- measurement_frequency: TEXT
    'System Name'                   -- data_source: TEXT
);

-- -----------------------------------------------------------------------------
-- 7.4 process_activities
-- -----------------------------------------------------------------------------
INSERT INTO process_activities (
    id, process_id, tenant_id, sequence_order, code, name, description,
    purpose_statement, typical_duration, is_milestone, activity_owner_role, jtbd_stage_id
)
VALUES (
    'activity-uuid',                -- id: UUID PRIMARY KEY
    'process-uuid',                 -- process_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    1,                              -- sequence_order: INTEGER NOT NULL
    'ACT-001',                      -- code: TEXT NOT NULL
    'Activity Name',                -- name: TEXT NOT NULL
    'Activity description',         -- description: TEXT
    'Purpose statement',            -- purpose_statement: TEXT
    '30 minutes',                   -- typical_duration: INTERVAL
    false,                          -- is_milestone: BOOLEAN DEFAULT false
    'Role Name',                    -- activity_owner_role: TEXT
    'jtbd-stage-uuid'               -- jtbd_stage_id: UUID FK
);

-- -----------------------------------------------------------------------------
-- 7.5 activity_entry_criteria
-- -----------------------------------------------------------------------------
INSERT INTO activity_entry_criteria (id, activity_id, tenant_id, criterion_text, is_mandatory, verification_method, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Entry criterion',              -- criterion_text: TEXT NOT NULL
    true,                           -- is_mandatory: BOOLEAN DEFAULT true
    'Verification method',          -- verification_method: TEXT
    1                               -- sequence_order: INTEGER DEFAULT 1
);

-- -----------------------------------------------------------------------------
-- 7.6 activity_exit_criteria
-- -----------------------------------------------------------------------------
INSERT INTO activity_exit_criteria (id, activity_id, tenant_id, criterion_text, is_mandatory, verification_method, sequence_order)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Exit criterion',               -- criterion_text: TEXT NOT NULL
    true,                           -- is_mandatory: BOOLEAN DEFAULT true
    'Verification method',          -- verification_method: TEXT
    1                               -- sequence_order: INTEGER DEFAULT 1
);

-- -----------------------------------------------------------------------------
-- 7.7 activity_deliverables
-- -----------------------------------------------------------------------------
INSERT INTO activity_deliverables (id, activity_id, tenant_id, deliverable_name, deliverable_type, description, is_mandatory)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Deliverable Name',             -- deliverable_name: TEXT NOT NULL
    'document',                     -- deliverable_type: TEXT
    'Deliverable description',      -- description: TEXT
    true                            -- is_mandatory: BOOLEAN DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 7.8 activity_pain_points
-- -----------------------------------------------------------------------------
INSERT INTO activity_pain_points (id, activity_id, tenant_id, pain_point_text, pain_point_type, severity, frequency)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'activity-uuid',                -- activity_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Pain point description',       -- pain_point_text: TEXT NOT NULL
    'technical',                    -- pain_point_type: TEXT
    'high',                         -- severity: TEXT
    'often'                         -- frequency: TEXT
);

-- =====================================================================================
-- SECTION 8: PROJECTS DOMAIN
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 8.1 projects
-- -----------------------------------------------------------------------------
INSERT INTO projects (id, name, description, organization_id, project_type_id, primary_jtbd_id, budget)
VALUES (
    'project-uuid',                 -- id: UUID PRIMARY KEY
    'Project Name',                 -- name: TEXT NOT NULL
    'Project description',          -- description: TEXT
    'organization-uuid',            -- organization_id: UUID FK
    get_project_type_id('clinical_decision_support'),  -- project_type_id: UUID FK to project_types
    'jtbd-uuid',                    -- primary_jtbd_id: UUID FK
    500000.00                       -- budget: NUMERIC
);
-- NOTE: project_type text column is DEPRECATED, use project_type_id instead

-- -----------------------------------------------------------------------------
-- 8.2 project_objectives
-- -----------------------------------------------------------------------------
INSERT INTO project_objectives (id, project_id, tenant_id, objective_text, objective_type, is_primary, success_metric, target_value)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'project-uuid',                 -- project_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Objective description',        -- objective_text: TEXT NOT NULL
    'business',                     -- objective_type: TEXT ('business', 'technical', 'compliance', 'quality')
    true,                           -- is_primary: BOOLEAN DEFAULT false
    'Metric name',                  -- success_metric: TEXT
    'Target value'                  -- target_value: TEXT
);

-- -----------------------------------------------------------------------------
-- 8.3 project_deliverables
-- -----------------------------------------------------------------------------
INSERT INTO project_deliverables (id, project_id, tenant_id, deliverable_name, description, deliverable_type, due_date, acceptance_criteria, status)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'project-uuid',                 -- project_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Deliverable Name',             -- deliverable_name: TEXT NOT NULL
    'Deliverable description',      -- description: TEXT
    'software',                     -- deliverable_type: TEXT
    '2024-06-30',                   -- due_date: DATE
    'Acceptance criteria',          -- acceptance_criteria: TEXT
    'pending'                       -- status: TEXT DEFAULT 'pending'
);

-- -----------------------------------------------------------------------------
-- 8.4 project_success_criteria
-- -----------------------------------------------------------------------------
INSERT INTO project_success_criteria (id, project_id, tenant_id, criterion_text, measurement_method, target_value, is_mandatory)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'project-uuid',                 -- project_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Success criterion',            -- criterion_text: TEXT NOT NULL
    'Measurement method',           -- measurement_method: TEXT
    'Target value',                 -- target_value: TEXT
    true                            -- is_mandatory: BOOLEAN DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 8.5 project_phases
-- -----------------------------------------------------------------------------
INSERT INTO project_phases (
    id, project_id, tenant_id, phase_number, name, description,
    planned_start_date, planned_end_date, milestone_name, is_gate_review, gate_criteria, status, jtbd_stage_id
)
VALUES (
    'phase-uuid',                   -- id: UUID PRIMARY KEY
    'project-uuid',                 -- project_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    1,                              -- phase_number: INTEGER NOT NULL
    'Phase Name',                   -- name: TEXT NOT NULL
    'Phase description',            -- description: TEXT
    '2024-01-01',                   -- planned_start_date: DATE
    '2024-03-31',                   -- planned_end_date: DATE
    'Milestone Name',               -- milestone_name: TEXT
    true,                           -- is_gate_review: BOOLEAN DEFAULT false
    'Gate criteria',                -- gate_criteria: TEXT
    'not_started',                  -- status: TEXT DEFAULT 'not_started'
    'jtbd-stage-uuid'               -- jtbd_stage_id: UUID FK
);

-- -----------------------------------------------------------------------------
-- 8.6 phase_entry_criteria
-- -----------------------------------------------------------------------------
INSERT INTO phase_entry_criteria (id, phase_id, tenant_id, criterion_text, is_mandatory, verification_method)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'phase-uuid',                   -- phase_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Entry criterion',              -- criterion_text: TEXT NOT NULL
    true,                           -- is_mandatory: BOOLEAN DEFAULT true
    'Verification method'           -- verification_method: TEXT
);

-- -----------------------------------------------------------------------------
-- 8.7 phase_exit_criteria
-- -----------------------------------------------------------------------------
INSERT INTO phase_exit_criteria (id, phase_id, tenant_id, criterion_text, is_mandatory, verification_method)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'phase-uuid',                   -- phase_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Exit criterion',               -- criterion_text: TEXT NOT NULL
    true,                           -- is_mandatory: BOOLEAN DEFAULT true
    'Verification method'           -- verification_method: TEXT
);

-- -----------------------------------------------------------------------------
-- 8.8 phase_deliverables
-- -----------------------------------------------------------------------------
INSERT INTO phase_deliverables (id, phase_id, tenant_id, deliverable_name, deliverable_type, description, is_mandatory)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'phase-uuid',                   -- phase_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Deliverable Name',             -- deliverable_name: TEXT NOT NULL
    'document',                     -- deliverable_type: TEXT
    'Deliverable description',      -- description: TEXT
    true                            -- is_mandatory: BOOLEAN DEFAULT true
);

-- -----------------------------------------------------------------------------
-- 8.9 work_packages
-- -----------------------------------------------------------------------------
INSERT INTO work_packages (
    id, phase_id, tenant_id, wbs_code, name, description, scope_statement,
    responsible_team, estimated_effort_hours, estimated_cost,
    planned_start_date, planned_end_date, status, percent_complete
)
VALUES (
    'wp-uuid',                      -- id: UUID PRIMARY KEY
    'phase-uuid',                   -- phase_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    '1.1.1',                        -- wbs_code: TEXT NOT NULL
    'Work Package Name',            -- name: TEXT NOT NULL
    'WP description',               -- description: TEXT
    'Scope statement',              -- scope_statement: TEXT
    'Team Name',                    -- responsible_team: TEXT
    160,                            -- estimated_effort_hours: NUMERIC
    25000,                          -- estimated_cost: NUMERIC
    '2024-01-15',                   -- planned_start_date: DATE
    '2024-02-28',                   -- planned_end_date: DATE
    'not_started',                  -- status: TEXT DEFAULT 'not_started'
    0                               -- percent_complete: INTEGER DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- 8.10 work_package_acceptance_criteria
-- -----------------------------------------------------------------------------
INSERT INTO work_package_acceptance_criteria (id, work_package_id, tenant_id, criterion_text, verification_method, is_met)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'wp-uuid',                      -- work_package_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Acceptance criterion',         -- criterion_text: TEXT NOT NULL
    'Verification method',          -- verification_method: TEXT
    false                           -- is_met: BOOLEAN DEFAULT false
);

-- =====================================================================================
-- SECTION 9: SHARED TABLES (TASKS & STEPS)
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 9.1 tasks
-- -----------------------------------------------------------------------------
INSERT INTO tasks (id, tenant_id, name, slug, description, activity_id, work_package_id, priority, estimated_duration_minutes)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'tenant-uuid',                  -- tenant_id: UUID
    'Task Name',                    -- name: TEXT NOT NULL
    'task-slug',                    -- slug: TEXT NOT NULL (required!)
    'Task description',             -- description: TEXT
    'activity-uuid',                -- activity_id: UUID FK to process_activities
    'wp-uuid',                      -- work_package_id: UUID FK to work_packages
    'high',                         -- priority: TEXT DEFAULT 'medium' ('low', 'medium', 'high', 'critical')
    30                              -- estimated_duration_minutes: INTEGER
);
-- NOTE: slug is required and must be unique

-- -----------------------------------------------------------------------------
-- 9.2 task_inputs
-- -----------------------------------------------------------------------------
INSERT INTO task_inputs (id, task_id, tenant_id, input_name, input_type, description, is_required, source)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'task-uuid',                    -- task_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Input Name',                   -- input_name: TEXT NOT NULL
    'data',                         -- input_type: TEXT ('data', 'document', 'parameter', 'artifact')
    'Input description',            -- description: TEXT
    true,                           -- is_required: BOOLEAN DEFAULT true
    'Source system'                 -- source: TEXT
);

-- -----------------------------------------------------------------------------
-- 9.3 task_outputs
-- -----------------------------------------------------------------------------
INSERT INTO task_outputs (id, task_id, tenant_id, output_name, output_type, description, destination)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'task-uuid',                    -- task_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'Output Name',                  -- output_name: TEXT NOT NULL
    'data',                         -- output_type: TEXT ('data', 'document', 'notification', 'artifact')
    'Output description',           -- description: TEXT
    'Destination system'            -- destination: TEXT
);

-- -----------------------------------------------------------------------------
-- 9.4 task_steps
-- -----------------------------------------------------------------------------
INSERT INTO task_steps (
    id, task_id, tenant_id, sequence_order, name, description, step_type,
    is_conditional, on_failure_action, timeout_seconds, estimated_duration_seconds
)
VALUES (
    'step-uuid',                    -- id: UUID PRIMARY KEY
    'task-uuid',                    -- task_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    1,                              -- sequence_order: INTEGER NOT NULL
    'Step Name',                    -- name: TEXT NOT NULL
    'Step description',             -- description: TEXT
    'action',                       -- step_type: TEXT ('action', 'decision', 'validation', 'transformation')
    false,                          -- is_conditional: BOOLEAN DEFAULT false
    'stop',                         -- on_failure_action: TEXT DEFAULT 'stop'
    300,                            -- timeout_seconds: INTEGER
    60                              -- estimated_duration_seconds: INTEGER
);

-- -----------------------------------------------------------------------------
-- 9.5 step_parameters
-- -----------------------------------------------------------------------------
INSERT INTO step_parameters (id, step_id, tenant_id, parameter_name, parameter_value, parameter_type, is_required, default_value)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'step-uuid',                    -- step_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'parameter_name',               -- parameter_name: TEXT NOT NULL
    'parameter_value',              -- parameter_value: TEXT
    'string',                       -- parameter_type: TEXT ('string', 'number', 'boolean', 'date', 'json')
    true,                           -- is_required: BOOLEAN DEFAULT true
    'default'                       -- default_value: TEXT
);

-- =====================================================================================
-- SECTION 10: MAPPING TABLES
-- =====================================================================================

-- -----------------------------------------------------------------------------
-- 10.1 jtbd_process_mapping
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_process_mapping (id, jtbd_id, process_id, tenant_id, mapping_type)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'process-uuid',                 -- process_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'primary'                       -- mapping_type: TEXT DEFAULT 'primary' ('primary', 'secondary', 'supporting')
);

-- -----------------------------------------------------------------------------
-- 10.2 jtbd_project_mapping
-- -----------------------------------------------------------------------------
INSERT INTO jtbd_project_mapping (id, jtbd_id, project_id, tenant_id, mapping_type)
VALUES (
    gen_random_uuid(),              -- id: UUID PRIMARY KEY
    'jtbd-uuid',                    -- jtbd_id: UUID NOT NULL FK
    'project-uuid',                 -- project_id: UUID NOT NULL FK
    'tenant-uuid',                  -- tenant_id: UUID NOT NULL FK
    'primary'                       -- mapping_type: TEXT DEFAULT 'primary' ('primary', 'secondary', 'supporting')
);

-- =====================================================================================
-- SECTION 11: HELPER FUNCTIONS
-- =====================================================================================

-- Get project type ID by code
-- Usage: get_project_type_id('clinical_decision_support')
-- SELECT get_project_type_id('health_analytics', 'tenant-uuid');

-- Get JTBDs by role
-- Usage: SELECT * FROM get_jtbds_by_role('role-uuid');

-- Get roles by JTBD
-- Usage: SELECT * FROM get_roles_by_jtbd('jtbd-uuid');

-- Get JTBDs for persona via role
-- Usage: SELECT * FROM get_jtbds_for_persona_via_role('persona-uuid');

-- =====================================================================================
-- END OF SQL TEMPLATES REFERENCE
-- =====================================================================================
