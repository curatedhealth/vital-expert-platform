-- ============================================================================
-- JTBD Complete Attribute Reference
-- All fields with purpose, data type, and examples
-- Date: 2025-11-19
-- ============================================================================

SELECT
    attribute,
    purpose,
    data_type,
    examples
FROM (VALUES
    -- ========================================================================
    -- CORE TABLE: jobs_to_be_done
    -- ========================================================================
    ('jobs_to_be_done.id', 'Primary key identifier', 'uuid', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
    ('jobs_to_be_done.tenant_id', 'Multi-tenant isolation', 'uuid', 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'),
    ('jobs_to_be_done.code', 'Short unique code', 'text', 'JTBD-MA-001, JTBD-COM-003'),
    ('jobs_to_be_done.jtbd_code', 'Standardized code pattern', 'varchar', 'PHARMA_MA_RWE_001, PHARMA_COM_HTA_001'),
    ('jobs_to_be_done.unique_id', 'Human-readable unique ID', 'varchar', 'pharma_ma_scientific_intelligence_001'),
    ('jobs_to_be_done.name', 'JTBD title', 'text', 'Accelerate Real-World Evidence Generation'),
    ('jobs_to_be_done.description', 'Detailed JTBD description', 'text', 'When analyzing clinical trial data, I want to...'),
    ('jobs_to_be_done.functional_area', 'Business function area', 'enum', 'medical_affairs, market_access, commercial, regulatory_affairs'),
    ('jobs_to_be_done.job_category', 'Strategic classification', 'enum', 'strategic, operational, tactical'),
    ('jobs_to_be_done.complexity', 'Difficulty level', 'enum', 'low, medium, high, very_high'),
    ('jobs_to_be_done.frequency', 'How often performed', 'enum', 'daily, weekly, monthly, quarterly, annually, ad_hoc'),
    ('jobs_to_be_done.status', 'Lifecycle status', 'enum', 'draft, active, under_review, archived, deprecated'),
    ('jobs_to_be_done.validation_score', 'Evidence validation level', 'numeric(3,2)', '0.85, 0.70, 0.95'),
    ('jobs_to_be_done.success_criteria', 'Array of success measures', 'text[]', '["Reduce time by 50%", "Improve accuracy to 95%"]'),
    ('jobs_to_be_done.kpis', 'KPI definitions', 'jsonb', '{"time_to_complete": "2 weeks", "accuracy": "95%"}'),
    ('jobs_to_be_done.pain_points', 'Pain point objects', 'jsonb', '[{"issue": "Manual data entry", "severity": "high"}]'),
    ('jobs_to_be_done.desired_outcomes', 'Outcome definitions', 'jsonb', '[{"outcome": "Faster analysis", "importance": 9}]'),
    ('jobs_to_be_done.industry_id', 'Link to industry', 'uuid', 'FK to industries table'),
    ('jobs_to_be_done.org_function_id', 'Link to org function', 'uuid', 'FK to org_functions table'),
    ('jobs_to_be_done.domain_id', 'Link to business domain', 'uuid', 'FK to domains table'),
    ('jobs_to_be_done.strategic_priority_id', 'Link to strategic priority', 'uuid', 'FK to strategic_priorities table'),

    -- ========================================================================
    -- TABLE: jtbd_personas
    -- ========================================================================
    ('jtbd_personas.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_personas.persona_id', 'Link to persona', 'uuid', 'FK to personas'),
    ('jtbd_personas.relevance_score', 'How relevant JTBD is to persona (0-1)', 'numeric(3,2)', '0.95, 0.80, 0.65'),
    ('jtbd_personas.is_primary', 'Primary persona for this JTBD', 'boolean', 'true, false'),
    ('jtbd_personas.notes', 'Additional context', 'text', 'Primary user, performs daily'),
    ('jtbd_personas.mapping_source', 'How mapping was created', 'enum', 'manual, ai_generated, hybrid'),

    -- ========================================================================
    -- TABLE: jtbd_outcomes (ODI Framework)
    -- ========================================================================
    ('jtbd_outcomes.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_outcomes.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_outcomes.outcome_id', 'Unique outcome identifier', 'text', 'OUT-001, OUT-002, OUT-003'),
    ('jtbd_outcomes.outcome_statement', 'ODI-formatted outcome statement', 'text', 'Minimize time to finalize contract terms'),
    ('jtbd_outcomes.outcome_type', 'Category of outcome', 'enum', 'speed, stability, output, cost, risk'),
    ('jtbd_outcomes.importance_score', 'How important (0-10)', 'numeric(3,1)', '9.0, 7.5, 8.0'),
    ('jtbd_outcomes.satisfaction_score', 'How well served today (0-10)', 'numeric(3,1)', '4.0, 6.0, 3.5'),
    ('jtbd_outcomes.opportunity_score', 'Calculated: importance + MAX(importance-satisfaction, 0)', 'numeric(4,1)', '14.0, 9.0, 12.5'),
    ('jtbd_outcomes.opportunity_priority', 'Priority based on score', 'text', 'high (>12), medium (8-12), low (<8)'),
    ('jtbd_outcomes.evidence_source', 'Where scoring data came from', 'text', 'Customer interviews Q3 2024'),
    ('jtbd_outcomes.sequence_order', 'Display order', 'integer', '1, 2, 3'),

    -- ========================================================================
    -- TABLE: jtbd_obstacles
    -- ========================================================================
    ('jtbd_obstacles.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_obstacles.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_obstacles.obstacle_text', 'Description of obstacle', 'text', 'Manual data collection from multiple sources'),
    ('jtbd_obstacles.obstacle_type', 'Category of obstacle', 'enum', 'technical, resource, process, political, knowledge'),
    ('jtbd_obstacles.severity', 'Impact severity', 'enum', 'low, medium, high, critical'),

    -- ========================================================================
    -- TABLE: jtbd_constraints
    -- ========================================================================
    ('jtbd_constraints.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_constraints.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_constraints.constraint_text', 'Description of constraint', 'text', 'Must comply with FDA 21 CFR Part 11'),
    ('jtbd_constraints.constraint_type', 'Category of constraint', 'enum', 'regulatory, budget, technical, resource, time'),
    ('jtbd_constraints.impact', 'Impact level', 'enum', 'low, medium, high, critical'),

    -- ========================================================================
    -- TABLE: jtbd_workflow_stages
    -- ========================================================================
    ('jtbd_workflow_stages.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_workflow_stages.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_workflow_stages.stage_number', 'Sequential order', 'integer', '1, 2, 3, 4'),
    ('jtbd_workflow_stages.stage_name', 'Name of stage', 'text', 'Data Collection, Analysis, Review, Submission'),
    ('jtbd_workflow_stages.stage_description', 'Detailed description', 'text', 'Gather data from clinical sites and EHR systems'),
    ('jtbd_workflow_stages.typical_duration', 'Expected time to complete', 'text', '2-4 weeks, 3 days, 1 month'),
    ('jtbd_workflow_stages.key_activities', 'Main activities in stage', 'text[]', '["Extract data", "Clean data", "Validate"]'),
    ('jtbd_workflow_stages.pain_points', 'Pain points in this stage', 'text[]', '["Manual entry", "Data inconsistency"]'),

    -- ========================================================================
    -- TABLE: jtbd_workflow_activities
    -- ========================================================================
    ('jtbd_workflow_activities.workflow_stage_id', 'Link to workflow stage', 'uuid', 'FK to jtbd_workflow_stages'),
    ('jtbd_workflow_activities.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_workflow_activities.activity_name', 'Name of activity', 'text', 'Extract patient demographics'),
    ('jtbd_workflow_activities.activity_description', 'Detailed description', 'text', 'Query EHR system for patient data'),
    ('jtbd_workflow_activities.sequence_order', 'Order within stage', 'integer', '1, 2, 3'),
    ('jtbd_workflow_activities.estimated_duration', 'Time estimate', 'text', '2 hours, 1 day'),
    ('jtbd_workflow_activities.responsible_role', 'Who performs this', 'text', 'Data Analyst, Medical Writer'),
    ('jtbd_workflow_activities.tools_used', 'Tools/systems used', 'text[]', '["Excel", "SAS", "Veeva"]'),
    ('jtbd_workflow_activities.outputs', 'Deliverables produced', 'text[]', '["Clean dataset", "Analysis report"]'),
    ('jtbd_workflow_activities.depends_on_activity_id', 'Dependency on prior activity', 'uuid', 'FK to jtbd_workflow_activities'),

    -- ========================================================================
    -- TABLE: jtbd_value_drivers
    -- ========================================================================
    ('jtbd_value_drivers.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_value_drivers.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_value_drivers.value_description', 'What value is created', 'text', 'Reduced manual data processing time'),
    ('jtbd_value_drivers.quantified_impact', 'Measurable impact', 'text', 'Save 10 hours per week, $50K annually'),
    ('jtbd_value_drivers.beneficiary', 'Who benefits', 'text', 'Medical Affairs team, Patients'),

    -- ========================================================================
    -- TABLE: jtbd_competitive_alternatives
    -- ========================================================================
    ('jtbd_competitive_alternatives.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_competitive_alternatives.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_competitive_alternatives.alternative_name', 'Name of alternative', 'text', 'Manual Excel analysis, Outsourced CRO'),
    ('jtbd_competitive_alternatives.description', 'How alternative works', 'text', 'Analysts manually compile data in spreadsheets'),
    ('jtbd_competitive_alternatives.strengths', 'What it does well', 'text[]', '["Familiar", "No training needed"]'),
    ('jtbd_competitive_alternatives.weaknesses', 'Limitations', 'text[]', '["Slow", "Error-prone", "Not scalable"]'),

    -- ========================================================================
    -- TABLE: jtbd_solution_requirements
    -- ========================================================================
    ('jtbd_solution_requirements.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_solution_requirements.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_solution_requirements.requirement_text', 'Requirement description', 'text', 'Must integrate with existing EHR systems'),
    ('jtbd_solution_requirements.requirement_category', 'Type of requirement', 'enum', 'functional, technical, operational, compliance'),
    ('jtbd_solution_requirements.priority', 'Priority level', 'enum', 'low, medium, high, critical'),

    -- ========================================================================
    -- TABLE: jtbd_gen_ai_opportunities
    -- ========================================================================
    ('jtbd_gen_ai_opportunities.jtbd_id', 'Link to JTBD (1:1)', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_gen_ai_opportunities.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_gen_ai_opportunities.automation_potential_score', 'AI automation potential (0-10)', 'numeric(3,1)', '8.5, 6.0, 9.0'),
    ('jtbd_gen_ai_opportunities.augmentation_potential_score', 'AI augmentation potential (0-10)', 'numeric(3,1)', '9.0, 7.5, 8.0'),
    ('jtbd_gen_ai_opportunities.total_estimated_value', 'Expected annual value', 'text', '$500K annually, $1.2M over 3 years'),
    ('jtbd_gen_ai_opportunities.implementation_complexity', 'Difficulty to implement', 'enum', 'low, medium, high, very_high'),
    ('jtbd_gen_ai_opportunities.time_to_value', 'Time to realize benefits', 'text', '3-6 months, 1 year'),
    ('jtbd_gen_ai_opportunities.key_ai_capabilities', 'Required AI capabilities', 'text[]', '["NLP", "Document Analysis", "Summarization"]'),
    ('jtbd_gen_ai_opportunities.recommended_approach', 'Implementation strategy', 'text', 'Start with document summarization, expand to analysis'),
    ('jtbd_gen_ai_opportunities.risks', 'Implementation risks', 'text[]', '["Data quality", "User adoption", "Compliance"]'),
    ('jtbd_gen_ai_opportunities.mitigation_strategies', 'Risk mitigation plans', 'text[]', '["Data validation pipeline", "Training program"]'),

    -- ========================================================================
    -- TABLE: jtbd_gen_ai_use_cases
    -- ========================================================================
    ('jtbd_gen_ai_use_cases.gen_ai_opportunity_id', 'Link to AI opportunity', 'uuid', 'FK to jtbd_gen_ai_opportunities'),
    ('jtbd_gen_ai_use_cases.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_gen_ai_use_cases.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_gen_ai_use_cases.use_case_id', 'Unique use case identifier', 'text', 'UC-001, UC-002'),
    ('jtbd_gen_ai_use_cases.use_case_name', 'Name of use case', 'text', 'Automated Literature Review'),
    ('jtbd_gen_ai_use_cases.use_case_description', 'Detailed description', 'text', 'AI scans and summarizes relevant publications'),
    ('jtbd_gen_ai_use_cases.ai_technology', 'AI technology used', 'text', 'Large Language Models, Computer Vision'),
    ('jtbd_gen_ai_use_cases.specific_capability', 'Specific AI capability', 'text', 'Document summarization, Entity extraction'),
    ('jtbd_gen_ai_use_cases.time_savings', 'Time saved', 'text', '70% reduction, 5 hours per week'),
    ('jtbd_gen_ai_use_cases.quality_improvement', 'Quality gains', 'text', '25% more comprehensive coverage'),
    ('jtbd_gen_ai_use_cases.estimated_cost', 'Implementation cost', 'text', '$50K setup, $10K/year'),
    ('jtbd_gen_ai_use_cases.roi_estimate', 'Return on investment', 'text', '300% ROI in first year'),
    ('jtbd_gen_ai_use_cases.sequence_order', 'Implementation order', 'integer', '1, 2, 3'),

    -- ========================================================================
    -- TABLE: jtbd_evidence_sources
    -- ========================================================================
    ('jtbd_evidence_sources.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_evidence_sources.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_evidence_sources.source_type', 'Type of evidence', 'enum', 'primary_research, secondary_research, expert_interview, industry_report, survey_data, case_study'),
    ('jtbd_evidence_sources.citation', 'Source citation', 'text', 'McKinsey Healthcare Report 2024'),
    ('jtbd_evidence_sources.key_finding', 'Main insight from source', 'text', '60% of teams spend >10 hrs/week on manual data'),
    ('jtbd_evidence_sources.sample_size', 'Research sample size', 'integer', '150, 500, 1000'),
    ('jtbd_evidence_sources.methodology', 'Research methodology', 'text', 'Online survey, Phone interviews'),
    ('jtbd_evidence_sources.publication_date', 'When published', 'date', '2024-03-15'),
    ('jtbd_evidence_sources.confidence_level', 'Confidence in findings', 'enum', 'low, medium, high, very_high'),
    ('jtbd_evidence_sources.url', 'Link to source', 'text', 'https://example.com/report'),

    -- ========================================================================
    -- TABLE: jtbd_kpis
    -- ========================================================================
    ('jtbd_kpis.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_kpis.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_kpis.kpi_name', 'Name of KPI', 'text', 'Time to Complete, Accuracy Rate'),
    ('jtbd_kpis.kpi_description', 'KPI description', 'text', 'Average time from start to final deliverable'),
    ('jtbd_kpis.target_value', 'Target to achieve', 'text', '< 2 weeks, > 95%'),
    ('jtbd_kpis.current_value', 'Current performance', 'text', '4 weeks, 82%'),
    ('jtbd_kpis.unit_of_measure', 'Measurement unit', 'text', 'days, percentage, count'),
    ('jtbd_kpis.measurement_frequency', 'How often measured', 'text', 'weekly, monthly, quarterly'),

    -- ========================================================================
    -- TABLE: jtbd_success_criteria
    -- ========================================================================
    ('jtbd_success_criteria.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_success_criteria.tenant_id', 'Multi-tenant isolation', 'uuid', 'FK to tenants'),
    ('jtbd_success_criteria.criterion_text', 'Success criterion description', 'text', 'Deliverable approved by medical review board'),
    ('jtbd_success_criteria.is_mandatory', 'Required for success', 'boolean', 'true, false'),
    ('jtbd_success_criteria.verification_method', 'How to verify', 'text', 'Sign-off document, System log'),

    -- ========================================================================
    -- TABLE: jtbd_dependencies
    -- ========================================================================
    ('jtbd_dependencies.source_jtbd_id', 'JTBD that blocks', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_dependencies.dependent_jtbd_id', 'JTBD that is blocked', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_dependencies.dependency_type', 'Type of dependency', 'text', 'blocks, requires, enables'),
    ('jtbd_dependencies.notes', 'Additional context', 'text', 'Data collection must complete before analysis'),

    -- ========================================================================
    -- TABLE: capability_jtbd_mapping
    -- ========================================================================
    ('capability_jtbd_mapping.capability_id', 'Link to capability', 'uuid', 'FK to capabilities'),
    ('capability_jtbd_mapping.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('capability_jtbd_mapping.relevance_score', 'How relevant capability is (0-1)', 'numeric(3,2)', '0.90, 0.75, 0.60'),
    ('capability_jtbd_mapping.is_required', 'Capability required for JTBD', 'boolean', 'true, false'),

    -- ========================================================================
    -- NORMALIZED FROM JSONB - JTBD Core
    -- ========================================================================

    -- From jobs_to_be_done.pain_points (jsonb)
    ('jtbd_pain_points.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_pain_points.issue', 'Pain point description', 'text', 'Manual data entry is error-prone'),
    ('jtbd_pain_points.severity', 'Impact severity', 'text', 'low, medium, high, critical'),
    ('jtbd_pain_points.pain_point_type', 'Category of pain point', 'text', 'technical, resource, process, political, knowledge'),
    ('jtbd_pain_points.frequency', 'How often occurs', 'text', 'always, often, sometimes, rarely'),
    ('jtbd_pain_points.impact_description', 'Description of impact', 'text', 'Causes 2-hour delay per case'),

    -- From jobs_to_be_done.desired_outcomes (jsonb)
    ('jtbd_desired_outcomes.jtbd_id', 'Link to JTBD', 'uuid', 'FK to jobs_to_be_done'),
    ('jtbd_desired_outcomes.outcome', 'Desired outcome description', 'text', 'Faster analysis completion'),
    ('jtbd_desired_outcomes.importance', 'Importance rating (1-10)', 'integer', '9, 7, 8'),
    ('jtbd_desired_outcomes.outcome_type', 'Type of outcome', 'text', 'speed, stability, output, cost, risk'),
    ('jtbd_desired_outcomes.current_satisfaction', 'Current satisfaction (1-10)', 'integer', '4, 6, 3'),
    ('jtbd_desired_outcomes.sequence_order', 'Display order', 'integer', '1, 2, 3'),

    -- ========================================================================
    -- NORMALIZED FROM ARRAYS - Workflow Stages
    -- ========================================================================

    -- From jtbd_workflow_stages.key_activities (text[])
    ('jtbd_stage_key_activities.workflow_stage_id', 'Link to workflow stage', 'uuid', 'FK to jtbd_workflow_stages'),
    ('jtbd_stage_key_activities.activity_text', 'Activity description', 'text', 'Extract data from source systems'),
    ('jtbd_stage_key_activities.sequence_order', 'Order within stage', 'integer', '1, 2, 3'),
    ('jtbd_stage_key_activities.is_critical', 'Critical path activity', 'boolean', 'true, false'),
    ('jtbd_stage_key_activities.estimated_duration', 'Expected duration', 'text', '2 hours, 1 day'),
    ('jtbd_stage_key_activities.responsible_role', 'Role responsible', 'text', 'Data Analyst, Medical Writer'),

    -- From jtbd_workflow_stages.pain_points (text[])
    ('jtbd_stage_pain_points.workflow_stage_id', 'Link to workflow stage', 'uuid', 'FK to jtbd_workflow_stages'),
    ('jtbd_stage_pain_points.pain_point', 'Pain point description', 'text', 'Manual data reconciliation'),
    ('jtbd_stage_pain_points.severity', 'Impact severity', 'text', 'low, medium, high, critical'),
    ('jtbd_stage_pain_points.mitigation', 'Current mitigation approach', 'text', 'Double-check by second analyst'),

    -- ========================================================================
    -- NORMALIZED FROM ARRAYS - Competitive Alternatives
    -- ========================================================================

    -- From jtbd_competitive_alternatives.strengths (text[])
    ('jtbd_competitive_strengths.competitive_alternative_id', 'Link to alternative', 'uuid', 'FK to jtbd_competitive_alternatives'),
    ('jtbd_competitive_strengths.strength', 'Strength description', 'text', 'Well-known, no training needed'),
    ('jtbd_competitive_strengths.importance_level', 'How important this strength is', 'text', 'low, medium, high'),

    -- From jtbd_competitive_alternatives.weaknesses (text[])
    ('jtbd_competitive_weaknesses.competitive_alternative_id', 'Link to alternative', 'uuid', 'FK to jtbd_competitive_alternatives'),
    ('jtbd_competitive_weaknesses.weakness', 'Weakness description', 'text', 'Slow, error-prone, not scalable'),
    ('jtbd_competitive_weaknesses.severity', 'Severity of weakness', 'text', 'low, medium, high, critical'),
    ('jtbd_competitive_weaknesses.exploitability', 'How we can leverage this', 'text', 'Our solution 10x faster'),

    -- ========================================================================
    -- NORMALIZED FROM ARRAYS - Gen AI Opportunities
    -- ========================================================================

    -- From jtbd_gen_ai_opportunities.key_ai_capabilities (text[])
    ('jtbd_gen_ai_capabilities.gen_ai_opportunity_id', 'Link to AI opportunity', 'uuid', 'FK to jtbd_gen_ai_opportunities'),
    ('jtbd_gen_ai_capabilities.capability', 'AI capability name', 'text', 'NLP, Document Analysis, Summarization'),
    ('jtbd_gen_ai_capabilities.capability_category', 'Category of capability', 'text', 'nlp, vision, analytics, automation, generation'),
    ('jtbd_gen_ai_capabilities.importance_level', 'Importance for this opportunity', 'text', 'required, preferred, nice_to_have'),
    ('jtbd_gen_ai_capabilities.maturity_level', 'Technology maturity', 'text', 'emerging, developing, mature'),

    -- From jtbd_gen_ai_opportunities.risks (text[])
    ('jtbd_gen_ai_risks.gen_ai_opportunity_id', 'Link to AI opportunity', 'uuid', 'FK to jtbd_gen_ai_opportunities'),
    ('jtbd_gen_ai_risks.risk', 'Risk description', 'text', 'Data quality issues may affect accuracy'),
    ('jtbd_gen_ai_risks.risk_category', 'Category of risk', 'text', 'technical, data, compliance, adoption, cost, security'),
    ('jtbd_gen_ai_risks.likelihood', 'Probability of occurrence', 'text', 'low, medium, high'),
    ('jtbd_gen_ai_risks.impact', 'Impact if occurs', 'text', 'low, medium, high, critical'),
    ('jtbd_gen_ai_risks.risk_score', 'Calculated: likelihood × impact', 'integer', '1-12 (auto-calculated)'),

    -- From jtbd_gen_ai_opportunities.mitigation_strategies (text[])
    ('jtbd_gen_ai_mitigations.gen_ai_risk_id', 'Link to specific risk', 'uuid', 'FK to jtbd_gen_ai_risks'),
    ('jtbd_gen_ai_mitigations.mitigation_strategy', 'Mitigation approach', 'text', 'Implement data validation pipeline'),
    ('jtbd_gen_ai_mitigations.owner_role', 'Role responsible', 'text', 'Data Engineering Lead'),
    ('jtbd_gen_ai_mitigations.timeline', 'When to implement', 'text', 'Before pilot, Phase 1'),
    ('jtbd_gen_ai_mitigations.estimated_cost', 'Cost estimate', 'text', '$10K, 40 hours'),
    ('jtbd_gen_ai_mitigations.status', 'Implementation status', 'text', 'planned, in_progress, completed, deferred'),
    ('jtbd_gen_ai_mitigations.effectiveness', 'Expected effectiveness', 'text', 'low, medium, high'),

    -- ========================================================================
    -- NORMALIZED FROM ARRAYS - Workflow Activities
    -- ========================================================================

    -- From jtbd_workflow_activities.tools_used (text[])
    ('jtbd_activity_tools.workflow_activity_id', 'Link to activity', 'uuid', 'FK to jtbd_workflow_activities'),
    ('jtbd_activity_tools.tool_name', 'Tool name', 'text', 'Excel, SAS, Veeva, Salesforce'),
    ('jtbd_activity_tools.tool_id', 'Link to tools table', 'uuid', 'FK to tools'),
    ('jtbd_activity_tools.tool_category', 'Type of tool', 'text', 'software, hardware, service, manual'),
    ('jtbd_activity_tools.is_required', 'Required for activity', 'boolean', 'true, false'),
    ('jtbd_activity_tools.proficiency_required', 'Skill level needed', 'text', 'basic, intermediate, advanced, expert'),

    -- From jtbd_workflow_activities.outputs (text[])
    ('jtbd_activity_outputs.workflow_activity_id', 'Link to activity', 'uuid', 'FK to jtbd_workflow_activities'),
    ('jtbd_activity_outputs.output_name', 'Output name', 'text', 'Clean dataset, Analysis report'),
    ('jtbd_activity_outputs.output_type', 'Type of output', 'text', 'data, document, decision, notification, artifact'),
    ('jtbd_activity_outputs.description', 'Output description', 'text', 'Validated patient records in CSV format'),
    ('jtbd_activity_outputs.format', 'Output format', 'text', 'PDF, CSV, JSON, XLSX'),
    ('jtbd_activity_outputs.destination', 'Where output goes', 'text', 'Next activity, Database, Email'),
    ('jtbd_activity_outputs.is_mandatory', 'Required output', 'boolean', 'true, false'),

    -- ========================================================================
    -- NORMALIZED FROM jtbd_value_drivers
    -- ========================================================================

    ('jtbd_value_impacts.value_driver_id', 'Link to value driver', 'uuid', 'FK to jtbd_value_drivers'),
    ('jtbd_value_impacts.impact_description', 'Description of impact', 'text', 'Reduced processing time'),
    ('jtbd_value_impacts.impact_type', 'Category of impact', 'text', 'time_savings, cost_reduction, quality_improvement, risk_reduction'),
    ('jtbd_value_impacts.quantified_value', 'Quantified impact', 'text', '10 hours, $50K'),
    ('jtbd_value_impacts.unit_of_measure', 'Unit', 'text', 'hours, dollars, percentage'),
    ('jtbd_value_impacts.time_period', 'Time frame', 'text', 'per week, annually, one-time'),
    ('jtbd_value_impacts.confidence_level', 'Confidence in estimate', 'text', 'low, medium, high, validated')

) AS t(attribute, purpose, data_type, examples)
ORDER BY
    CASE
        WHEN attribute LIKE 'jobs_to_be_done%' THEN 1
        WHEN attribute LIKE 'jtbd_personas%' THEN 2
        WHEN attribute LIKE 'jtbd_outcomes%' THEN 3
        WHEN attribute LIKE 'jtbd_obstacles%' THEN 4
        WHEN attribute LIKE 'jtbd_constraints%' THEN 5
        WHEN attribute LIKE 'jtbd_workflow_stages%' THEN 6
        WHEN attribute LIKE 'jtbd_workflow_activities%' THEN 7
        WHEN attribute LIKE 'jtbd_value_drivers%' THEN 8
        WHEN attribute LIKE 'jtbd_competitive%' THEN 9
        WHEN attribute LIKE 'jtbd_solution%' THEN 10
        WHEN attribute LIKE 'jtbd_gen_ai_opportunities%' THEN 11
        WHEN attribute LIKE 'jtbd_gen_ai_use_cases%' THEN 12
        WHEN attribute LIKE 'jtbd_evidence%' THEN 13
        WHEN attribute LIKE 'jtbd_kpis%' THEN 14
        WHEN attribute LIKE 'jtbd_success%' THEN 15
        WHEN attribute LIKE 'jtbd_dependencies%' THEN 16
        WHEN attribute LIKE 'capability%' THEN 17
        ELSE 99
    END,
    attribute;
