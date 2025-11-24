-- ============================================================================
-- Work Hierarchy Complete Attribute Reference
-- All fields with purpose, data type, and examples
-- ZERO JSONB - Fully Normalized
-- Date: 2025-11-19
-- ============================================================================

SELECT
    attribute,
    purpose,
    data_type,
    examples
FROM (VALUES

    -- ========================================================================
    -- OPERATIONS DOMAIN
    -- ========================================================================

    -- ------------------------------------------------------------------------
    -- LEVEL 1: PROCESSES
    -- ------------------------------------------------------------------------
    ('processes.id', 'Primary key identifier', 'uuid', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
    ('processes.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('processes.code', 'Unique process code', 'text', 'PRC-MA-001, PRC-COM-002'),
    ('processes.name', 'Process name', 'text', 'Patient Onboarding, KOL Engagement'),
    ('processes.description', 'Detailed description', 'text', 'End-to-end process for...'),
    ('processes.version', 'Process version number', 'text', '1.0, 2.1, 3.0'),
    ('processes.process_category', 'APQC Level 1 category', 'text', 'operate, manage, support'),
    ('processes.process_group', 'APQC Level 2 group', 'text', 'Customer Service, R&D'),
    ('processes.functional_area', 'Business function', 'text', 'medical_affairs, commercial, regulatory'),
    ('processes.status', 'Lifecycle status', 'text', 'draft, active, under_review, deprecated, archived'),
    ('processes.effective_date', 'When process becomes active', 'date', '2025-01-01'),
    ('processes.review_date', 'Next review date', 'date', '2025-06-01'),
    ('processes.process_owner_id', 'Owner user reference', 'uuid', 'FK to user_profiles'),
    ('processes.organization_id', 'Organization reference', 'uuid', 'FK to organizations'),
    ('processes.primary_jtbd_id', 'Primary JTBD this fulfills', 'uuid', 'FK to jobs_to_be_done'),
    ('processes.target_cycle_time', 'Target end-to-end duration', 'interval', '7 days, 2 weeks'),
    ('processes.target_cost', 'Target cost per execution', 'numeric(12,2)', '5000.00, 25000.00'),

    -- Process SLA Targets (normalized)
    ('process_sla_targets.process_id', 'Parent process reference', 'uuid', 'FK to processes'),
    ('process_sla_targets.sla_name', 'SLA metric name', 'text', 'Response Time, Accuracy'),
    ('process_sla_targets.metric_type', 'Type of metric', 'text', 'time, quality, cost, compliance'),
    ('process_sla_targets.target_value', 'Target to achieve', 'text', '< 24 hours, > 99%'),
    ('process_sla_targets.unit_of_measure', 'Measurement unit', 'text', 'hours, percentage, count'),
    ('process_sla_targets.measurement_frequency', 'How often measured', 'text', 'real-time, daily, weekly'),

    -- Process KPIs (normalized)
    ('process_kpis.process_id', 'Parent process reference', 'uuid', 'FK to processes'),
    ('process_kpis.kpi_name', 'KPI name', 'text', 'Cycle Time, First Pass Yield'),
    ('process_kpis.kpi_description', 'KPI description', 'text', 'Average time from start to completion'),
    ('process_kpis.target_value', 'Target to achieve', 'text', '< 5 days, > 95%'),
    ('process_kpis.current_value', 'Current performance', 'text', '7 days, 88%'),
    ('process_kpis.unit_of_measure', 'Measurement unit', 'text', 'days, percentage'),
    ('process_kpis.measurement_frequency', 'How often measured', 'text', 'weekly, monthly'),
    ('process_kpis.data_source', 'Where data comes from', 'text', 'Salesforce, Manual Entry'),

    -- ------------------------------------------------------------------------
    -- LEVEL 2: ACTIVITIES (within Process)
    -- ------------------------------------------------------------------------
    ('process_activities.id', 'Primary key identifier', 'uuid', 'gen_random_uuid()'),
    ('process_activities.process_id', 'Parent process reference', 'uuid', 'FK to processes'),
    ('process_activities.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('process_activities.sequence_order', 'Order within process', 'integer', '1, 2, 3, 4'),
    ('process_activities.code', 'Activity code', 'text', 'ACT-001, ACT-002'),
    ('process_activities.name', 'Activity name', 'text', 'Collect Patient Data, Verify Eligibility'),
    ('process_activities.description', 'Detailed description', 'text', 'Gather all required patient information'),
    ('process_activities.purpose_statement', 'Why this activity exists', 'text', 'To ensure complete patient records'),
    ('process_activities.typical_duration', 'Expected duration', 'interval', '2 hours, 1 day'),
    ('process_activities.is_milestone', 'Represents key checkpoint', 'boolean', 'true, false'),
    ('process_activities.activity_owner_role', 'Role responsible', 'text', 'Data Analyst, Medical Writer'),
    ('process_activities.jtbd_stage_id', 'Link to JTBD stage', 'uuid', 'FK to jtbd_workflow_stages'),

    -- Activity Entry Criteria (normalized)
    ('activity_entry_criteria.activity_id', 'Parent activity reference', 'uuid', 'FK to process_activities'),
    ('activity_entry_criteria.criterion_text', 'Entry criterion description', 'text', 'Patient consent form signed'),
    ('activity_entry_criteria.is_mandatory', 'Must be met to start', 'boolean', 'true, false'),
    ('activity_entry_criteria.verification_method', 'How to verify', 'text', 'Document check, System validation'),

    -- Activity Exit Criteria (normalized)
    ('activity_exit_criteria.activity_id', 'Parent activity reference', 'uuid', 'FK to process_activities'),
    ('activity_exit_criteria.criterion_text', 'Exit criterion description', 'text', 'All data validated and stored'),
    ('activity_exit_criteria.is_mandatory', 'Must be met to complete', 'boolean', 'true, false'),
    ('activity_exit_criteria.verification_method', 'How to verify', 'text', 'QC review, Automated check'),

    -- Activity Deliverables (normalized)
    ('activity_deliverables.activity_id', 'Parent activity reference', 'uuid', 'FK to process_activities'),
    ('activity_deliverables.deliverable_name', 'Deliverable name', 'text', 'Patient Profile Document'),
    ('activity_deliverables.deliverable_type', 'Type of deliverable', 'text', 'document, data, decision, approval'),
    ('activity_deliverables.description', 'Deliverable description', 'text', 'Complete patient record with demographics'),
    ('activity_deliverables.is_mandatory', 'Required output', 'boolean', 'true, false'),

    -- Activity Pain Points (normalized)
    ('activity_pain_points.activity_id', 'Parent activity reference', 'uuid', 'FK to process_activities'),
    ('activity_pain_points.pain_point_text', 'Pain point description', 'text', 'Manual data entry is error-prone'),
    ('activity_pain_points.pain_point_type', 'Type of pain point', 'text', 'technical, resource, process, knowledge'),
    ('activity_pain_points.severity', 'Impact severity', 'text', 'low, medium, high, critical'),
    ('activity_pain_points.frequency', 'How often occurs', 'text', 'always, often, sometimes, rarely'),

    -- ========================================================================
    -- PROJECTS DOMAIN
    -- ========================================================================

    -- ------------------------------------------------------------------------
    -- LEVEL 1: PROJECTS (columns to add)
    -- ------------------------------------------------------------------------
    ('projects.project_type', 'Methodology type', 'text', 'waterfall, agile, hybrid'),
    ('projects.primary_jtbd_id', 'Primary JTBD this delivers', 'uuid', 'FK to jobs_to_be_done'),
    ('projects.budget', 'Total project budget', 'numeric(12,2)', '500000.00, 1000000.00'),

    -- Project Objectives (normalized)
    ('project_objectives.project_id', 'Parent project reference', 'uuid', 'FK to projects'),
    ('project_objectives.objective_text', 'Objective description', 'text', 'Launch telehealth module by Q2'),
    ('project_objectives.objective_type', 'Type of objective', 'text', 'business, technical, compliance, quality'),
    ('project_objectives.is_primary', 'Primary objective', 'boolean', 'true, false'),
    ('project_objectives.success_metric', 'How to measure success', 'text', 'User adoption rate'),
    ('project_objectives.target_value', 'Target to achieve', 'text', '> 80% adoption'),

    -- Project Deliverables (normalized)
    ('project_deliverables.project_id', 'Parent project reference', 'uuid', 'FK to projects'),
    ('project_deliverables.deliverable_name', 'Deliverable name', 'text', 'Telehealth Portal MVP'),
    ('project_deliverables.description', 'Deliverable description', 'text', 'Fully functional video consultation'),
    ('project_deliverables.deliverable_type', 'Type of deliverable', 'text', 'software, document, training'),
    ('project_deliverables.due_date', 'Target delivery date', 'date', '2025-06-30'),
    ('project_deliverables.acceptance_criteria', 'How to accept', 'text', 'Passes UAT with < 5 critical bugs'),
    ('project_deliverables.status', 'Delivery status', 'text', 'pending, in_progress, delivered, accepted'),

    -- Project Success Criteria (normalized)
    ('project_success_criteria.project_id', 'Parent project reference', 'uuid', 'FK to projects'),
    ('project_success_criteria.criterion_text', 'Success criterion', 'text', 'Deployed to production with 99% uptime'),
    ('project_success_criteria.measurement_method', 'How to measure', 'text', 'Monitoring dashboard'),
    ('project_success_criteria.target_value', 'Target value', 'text', '99.9%'),
    ('project_success_criteria.is_mandatory', 'Required for success', 'boolean', 'true, false'),

    -- ------------------------------------------------------------------------
    -- LEVEL 2: PROJECT PHASES
    -- ------------------------------------------------------------------------
    ('project_phases.id', 'Primary key identifier', 'uuid', 'gen_random_uuid()'),
    ('project_phases.project_id', 'Parent project reference', 'uuid', 'FK to projects'),
    ('project_phases.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('project_phases.phase_number', 'Sequence order', 'integer', '1, 2, 3, 4'),
    ('project_phases.name', 'Phase name', 'text', 'Discovery, Design, Build, Deploy'),
    ('project_phases.description', 'Phase description', 'text', 'Define requirements and scope'),
    ('project_phases.planned_start_date', 'Planned start', 'date', '2025-01-15'),
    ('project_phases.planned_end_date', 'Planned end', 'date', '2025-02-15'),
    ('project_phases.actual_start_date', 'Actual start', 'date', '2025-01-20'),
    ('project_phases.actual_end_date', 'Actual end', 'date', '2025-02-20'),
    ('project_phases.milestone_name', 'Key milestone', 'text', 'Requirements Approved'),
    ('project_phases.is_gate_review', 'Requires gate review', 'boolean', 'true, false'),
    ('project_phases.gate_criteria', 'Gate review criteria', 'text', 'All deliverables signed off'),
    ('project_phases.status', 'Phase status', 'text', 'not_started, in_progress, completed, on_hold'),
    ('project_phases.jtbd_stage_id', 'Link to JTBD stage', 'uuid', 'FK to jtbd_workflow_stages'),

    -- Phase Entry/Exit Criteria (normalized)
    ('phase_entry_criteria.phase_id', 'Parent phase reference', 'uuid', 'FK to project_phases'),
    ('phase_entry_criteria.criterion_text', 'Entry criterion', 'text', 'Project charter approved'),
    ('phase_exit_criteria.phase_id', 'Parent phase reference', 'uuid', 'FK to project_phases'),
    ('phase_exit_criteria.criterion_text', 'Exit criterion', 'text', 'Design documents signed off'),

    -- Phase Deliverables (normalized)
    ('phase_deliverables.phase_id', 'Parent phase reference', 'uuid', 'FK to project_phases'),
    ('phase_deliverables.deliverable_name', 'Deliverable name', 'text', 'Requirements Document'),
    ('phase_deliverables.deliverable_type', 'Type of deliverable', 'text', 'document, prototype, code'),
    ('phase_deliverables.is_mandatory', 'Required for gate', 'boolean', 'true, false'),

    -- ------------------------------------------------------------------------
    -- LEVEL 3: WORK PACKAGES
    -- ------------------------------------------------------------------------
    ('work_packages.id', 'Primary key identifier', 'uuid', 'gen_random_uuid()'),
    ('work_packages.phase_id', 'Parent phase reference', 'uuid', 'FK to project_phases'),
    ('work_packages.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('work_packages.wbs_code', 'WBS identifier', 'text', '1.2.3, 2.1.1'),
    ('work_packages.name', 'Work package name', 'text', 'Build Patient Portal UI'),
    ('work_packages.description', 'Work package description', 'text', 'Develop user interface components'),
    ('work_packages.scope_statement', 'Scope definition', 'text', 'Includes login, dashboard, profile pages'),
    ('work_packages.owner_id', 'Package owner', 'uuid', 'FK to user_profiles'),
    ('work_packages.responsible_team', 'Assigned team', 'text', 'Frontend Development Team'),
    ('work_packages.estimated_effort_hours', 'Estimated hours', 'numeric(8,2)', '120.00, 240.00'),
    ('work_packages.estimated_cost', 'Estimated cost', 'numeric(12,2)', '15000.00'),
    ('work_packages.planned_start_date', 'Planned start', 'date', '2025-03-01'),
    ('work_packages.planned_end_date', 'Planned end', 'date', '2025-03-15'),
    ('work_packages.actual_start_date', 'Actual start', 'date', '2025-03-02'),
    ('work_packages.actual_end_date', 'Actual end', 'date', '2025-03-18'),
    ('work_packages.status', 'Package status', 'text', 'not_started, in_progress, completed'),
    ('work_packages.percent_complete', 'Completion percentage', 'integer', '0, 25, 50, 75, 100'),

    -- Work Package Acceptance Criteria (normalized)
    ('work_package_acceptance_criteria.work_package_id', 'Parent work package', 'uuid', 'FK to work_packages'),
    ('work_package_acceptance_criteria.criterion_text', 'Acceptance criterion', 'text', 'All pages responsive on mobile'),
    ('work_package_acceptance_criteria.verification_method', 'How to verify', 'text', 'Cross-browser testing'),
    ('work_package_acceptance_criteria.is_met', 'Criterion satisfied', 'boolean', 'true, false'),

    -- ========================================================================
    -- SHARED LEVELS (Task & Step)
    -- ========================================================================

    -- ------------------------------------------------------------------------
    -- LEVEL: TASKS (shared between domains)
    -- ------------------------------------------------------------------------
    ('tasks.activity_id', 'Parent activity (Operations)', 'uuid', 'FK to process_activities'),
    ('tasks.work_package_id', 'Parent work package (Projects)', 'uuid', 'FK to work_packages'),
    ('tasks.jtbd_activity_id', 'Link to JTBD activity', 'uuid', 'FK to jtbd_workflow_activities'),
    ('tasks.priority', 'Task priority', 'text', 'low, medium, high, critical'),
    ('tasks.estimated_duration_minutes', 'Estimated duration', 'integer', '30, 60, 120, 480'),

    -- Task Inputs (normalized)
    ('task_inputs.task_id', 'Parent task reference', 'uuid', 'FK to tasks'),
    ('task_inputs.input_name', 'Input name', 'text', 'Patient Demographics File'),
    ('task_inputs.input_type', 'Type of input', 'text', 'data, document, approval, parameter'),
    ('task_inputs.description', 'Input description', 'text', 'CSV file with patient records'),
    ('task_inputs.is_required', 'Required to start', 'boolean', 'true, false'),
    ('task_inputs.source', 'Where it comes from', 'text', 'Previous task, External system'),

    -- Task Outputs (normalized)
    ('task_outputs.task_id', 'Parent task reference', 'uuid', 'FK to tasks'),
    ('task_outputs.output_name', 'Output name', 'text', 'Validated Patient Records'),
    ('task_outputs.output_type', 'Type of output', 'text', 'data, document, notification, artifact'),
    ('task_outputs.description', 'Output description', 'text', 'Cleaned and validated records'),
    ('task_outputs.destination', 'Where it goes', 'text', 'Next task, Database, Notification'),

    -- Task Dependencies (normalized)
    ('task_dependencies.task_id', 'Dependent task', 'uuid', 'FK to tasks'),
    ('task_dependencies.depends_on_task_id', 'Predecessor task', 'uuid', 'FK to tasks'),
    ('task_dependencies.dependency_type', 'Type of dependency', 'text', 'finish_to_start, start_to_start'),
    ('task_dependencies.lag_minutes', 'Delay after predecessor', 'integer', '0, 30, 60'),

    -- ------------------------------------------------------------------------
    -- LEVEL: STEPS (within Tasks)
    -- ------------------------------------------------------------------------
    ('task_steps.id', 'Primary key identifier', 'uuid', 'gen_random_uuid()'),
    ('task_steps.task_id', 'Parent task reference', 'uuid', 'FK to tasks'),
    ('task_steps.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('task_steps.sequence_order', 'Order within task', 'integer', '1, 2, 3'),
    ('task_steps.name', 'Step name', 'text', 'Query Database, Validate Format'),
    ('task_steps.description', 'Step description', 'text', 'Execute SQL to retrieve records'),
    ('task_steps.step_type', 'Type of step', 'text', 'api_call, db_operation, validation, notification'),
    ('task_steps.tool_id', 'Tool used', 'uuid', 'FK to tools'),
    ('task_steps.is_conditional', 'Has condition', 'boolean', 'true, false'),
    ('task_steps.condition_expression', 'When to execute', 'text', 'record_count > 0'),
    ('task_steps.on_success_action', 'Action on success', 'text', 'continue'),
    ('task_steps.on_failure_action', 'Action on failure', 'text', 'stop, retry, skip, escalate'),
    ('task_steps.max_retries', 'Maximum retry attempts', 'integer', '0, 3, 5'),
    ('task_steps.timeout_seconds', 'Execution timeout', 'integer', '30, 60, 300'),
    ('task_steps.estimated_duration_seconds', 'Expected duration', 'integer', '5, 30, 120'),

    -- Step Parameters (normalized)
    ('step_parameters.step_id', 'Parent step reference', 'uuid', 'FK to task_steps'),
    ('step_parameters.parameter_name', 'Parameter name', 'text', 'query_limit, output_format'),
    ('step_parameters.parameter_value', 'Parameter value', 'text', '1000, json'),
    ('step_parameters.parameter_type', 'Data type', 'text', 'string, number, boolean, array'),
    ('step_parameters.is_required', 'Required parameter', 'boolean', 'true, false'),
    ('step_parameters.default_value', 'Default if not provided', 'text', '100, csv'),

    -- ========================================================================
    -- LINKING TABLES
    -- ========================================================================
    ('jtbd_process_mapping.jtbd_id', 'JTBD reference', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_process_mapping.process_id', 'Process reference', 'uuid', 'FK to processes'),
    ('jtbd_process_mapping.mapping_type', 'Relationship type', 'text', 'primary, secondary, supporting'),

    ('jtbd_project_mapping.jtbd_id', 'JTBD reference', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_project_mapping.project_id', 'Project reference', 'uuid', 'FK to projects'),
    ('jtbd_project_mapping.mapping_type', 'Relationship type', 'text', 'primary, secondary, supporting')

) AS t(attribute, purpose, data_type, examples)
ORDER BY
    CASE
        -- Operations domain
        WHEN attribute LIKE 'processes.%' THEN 1
        WHEN attribute LIKE 'process_sla%' THEN 2
        WHEN attribute LIKE 'process_kpis%' THEN 3
        WHEN attribute LIKE 'process_activities%' THEN 4
        WHEN attribute LIKE 'activity_entry%' THEN 5
        WHEN attribute LIKE 'activity_exit%' THEN 6
        WHEN attribute LIKE 'activity_deliverables%' THEN 7
        WHEN attribute LIKE 'activity_pain%' THEN 8
        -- Projects domain
        WHEN attribute LIKE 'projects.%' THEN 10
        WHEN attribute LIKE 'project_objectives%' THEN 11
        WHEN attribute LIKE 'project_deliverables%' THEN 12
        WHEN attribute LIKE 'project_success%' THEN 13
        WHEN attribute LIKE 'project_phases%' THEN 14
        WHEN attribute LIKE 'phase_%' THEN 15
        WHEN attribute LIKE 'work_packages%' THEN 16
        WHEN attribute LIKE 'work_package_acceptance%' THEN 17
        -- Shared
        WHEN attribute LIKE 'tasks.%' THEN 20
        WHEN attribute LIKE 'task_inputs%' THEN 21
        WHEN attribute LIKE 'task_outputs%' THEN 22
        WHEN attribute LIKE 'task_dependencies%' THEN 23
        WHEN attribute LIKE 'task_steps%' THEN 24
        WHEN attribute LIKE 'step_parameters%' THEN 25
        -- Linking
        WHEN attribute LIKE 'jtbd_%mapping%' THEN 30
        ELSE 99
    END,
    attribute;
