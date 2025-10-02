-- Populate PRISM™ Enterprise Healthcare Prompt Library reference data
-- This migration adds all the necessary reference data for the PRISM™ framework

-- Insert Prompt Systems (with conflict handling)
INSERT INTO prompt_systems (name, display_name, description, format_type, variable_format, execution_mode, training_required, best_for) VALUES
('prism_acronym', 'PRISM™ Acronym Prompts', 'Framework prompts using memorable acronyms for consistent healthcare analysis', 'acronym', '{simple_placeholders}', 'manual', 'minimal', 'Business users who need structured analysis with memorable frameworks'),
('vital_path_agents', 'VITAL Path AI Agents', 'Specialized AI agents with specific roles and expertise in healthcare domains', 'agent_spec', 'structured_schemas', 'semi_automated', 'moderate', 'Technical users requiring specialized domain expertise and automated workflows'),
('digital_health_structured', 'Digital Health Structured Prompts', 'Comprehensive structured templates for complex healthcare processes', 'structured_template', '{{double_braces}}', 'fully_automated', 'technical', 'Specialists and experts requiring detailed, multi-step analysis and documentation')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    format_type = EXCLUDED.format_type,
    variable_format = EXCLUDED.variable_format,
    execution_mode = EXCLUDED.execution_mode,
    training_required = EXCLUDED.training_required,
    best_for = EXCLUDED.best_for,
    updated_at = NOW();

-- Insert Prompt Domains (with conflict handling)
INSERT INTO prompt_domains (name, display_name, description, icon, color, sort_order) VALUES
('medical_affairs', 'Medical Affairs', 'Clinical research, medical writing, scientific communications, and regulatory affairs', 'stethoscope', '#0ea5e9', 1),
('compliance', 'Compliance & Regulatory', 'Regulatory compliance, quality assurance, audit preparation, and policy management', 'shield-check', '#dc2626', 2),
('commercial', 'Commercial Operations', 'Sales enablement, market access, commercial strategy, and business development', 'trending-up', '#059669', 3),
('marketing', 'Marketing & Communications', 'Content marketing, digital campaigns, brand management, and stakeholder engagement', 'megaphone', '#7c3aed', 4),
('patient_advocacy', 'Patient Advocacy & Support', 'Patient engagement, advocacy programs, support services, and education', 'heart', '#ea580c', 5),
('data_analytics', 'Data & Analytics', 'Data analysis, reporting, insights generation, and business intelligence', 'bar-chart', '#0891b2', 6),
('operations', 'Operations & Process', 'Operational efficiency, process optimization, and workflow management', 'cog', '#6b7280', 7)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- Insert Complexity Levels (with conflict handling)
INSERT INTO complexity_levels (name, display_name, description, typical_time_min, typical_time_max, user_level, sort_order) VALUES
('quick_reference', 'Quick Reference', 'Simple prompts for immediate insights and quick answers', 5, 15, 'entry', 1),
('standard_analysis', 'Standard Analysis', 'Structured analysis requiring moderate input and consideration', 15, 45, 'intermediate', 2),
('comprehensive_review', 'Comprehensive Review', 'In-depth analysis with multiple components and deliverables', 45, 120, 'experienced', 3),
('expert_consultation', 'Expert Consultation', 'Complex analysis requiring specialized knowledge and expertise', 120, 240, 'expert', 4),
('strategic_planning', 'Strategic Planning', 'Multi-faceted strategic analysis for decision-making and planning', 240, 480, 'specialist', 5)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    typical_time_min = EXCLUDED.typical_time_min,
    typical_time_max = EXCLUDED.typical_time_max,
    user_level = EXCLUDED.user_level,
    sort_order = EXCLUDED.sort_order;

-- Insert Medical Affairs Categories (with conflict handling)
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'medical_affairs'), 'clinical_research', 'Clinical Research', 'Protocol development, study design, and research analysis', 1),
((SELECT id FROM prompt_domains WHERE name = 'medical_affairs'), 'medical_writing', 'Medical Writing', 'Scientific publications, regulatory documents, and clinical reports', 2),
((SELECT id FROM prompt_domains WHERE name = 'medical_affairs'), 'regulatory_affairs', 'Regulatory Affairs', 'Submission preparation, regulatory strategy, and compliance documentation', 3),
((SELECT id FROM prompt_domains WHERE name = 'medical_affairs'), 'scientific_communication', 'Scientific Communication', 'Conference presentations, scientific posters, and expert communications', 4),
((SELECT id FROM prompt_domains WHERE name = 'medical_affairs'), 'medical_information', 'Medical Information', 'Medical inquiries, safety reporting, and information management', 5)
ON CONFLICT (domain_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Insert Compliance Categories (with conflict handling)
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'compliance'), 'regulatory_compliance', 'Regulatory Compliance', 'FDA, EMA, and other regulatory body compliance requirements', 1),
((SELECT id FROM prompt_domains WHERE name = 'compliance'), 'quality_assurance', 'Quality Assurance', 'QA processes, audits, and quality management systems', 2),
((SELECT id FROM prompt_domains WHERE name = 'compliance'), 'risk_management', 'Risk Management', 'Risk assessment, mitigation strategies, and compliance monitoring', 3),
((SELECT id FROM prompt_domains WHERE name = 'compliance'), 'policy_management', 'Policy Management', 'Policy development, implementation, and training', 4),
((SELECT id FROM prompt_domains WHERE name = 'compliance'), 'audit_preparation', 'Audit Preparation', 'Internal and external audit preparation and response', 5)
ON CONFLICT (domain_id, name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Insert Commercial Categories
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'commercial'), 'sales_enablement', 'Sales Enablement', 'Sales training, tools, and performance optimization', 1),
((SELECT id FROM prompt_domains WHERE name = 'commercial'), 'market_access', 'Market Access', 'Payer engagement, value demonstration, and access strategies', 2),
((SELECT id FROM prompt_domains WHERE name = 'commercial'), 'business_development', 'Business Development', 'Partnership strategies, deal evaluation, and growth planning', 3),
((SELECT id FROM prompt_domains WHERE name = 'commercial'), 'competitive_intelligence', 'Competitive Intelligence', 'Market analysis, competitor monitoring, and strategic insights', 4),
((SELECT id FROM prompt_domains WHERE name = 'commercial'), 'launch_planning', 'Launch Planning', 'Product launch strategies, timeline management, and execution planning', 5);

-- Insert Marketing Categories
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'marketing'), 'content_marketing', 'Content Marketing', 'Educational content, thought leadership, and digital marketing', 1),
((SELECT id FROM prompt_domains WHERE name = 'marketing'), 'brand_management', 'Brand Management', 'Brand strategy, positioning, and messaging consistency', 2),
((SELECT id FROM prompt_domains WHERE name = 'marketing'), 'digital_campaigns', 'Digital Campaigns', 'Online marketing, social media, and digital engagement strategies', 3),
((SELECT id FROM prompt_domains WHERE name = 'marketing'), 'stakeholder_engagement', 'Stakeholder Engagement', 'KOL engagement, advisory boards, and relationship management', 4),
((SELECT id FROM prompt_domains WHERE name = 'marketing'), 'market_research', 'Market Research', 'Customer insights, market analysis, and research methodologies', 5);

-- Insert Patient Advocacy Categories
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'patient_advocacy'), 'patient_engagement', 'Patient Engagement', 'Patient communication, education, and engagement strategies', 1),
((SELECT id FROM prompt_domains WHERE name = 'patient_advocacy'), 'support_programs', 'Support Programs', 'Patient assistance, adherence programs, and support services', 2),
((SELECT id FROM prompt_domains WHERE name = 'patient_advocacy'), 'advocacy_initiatives', 'Advocacy Initiatives', 'Patient advocacy campaigns, policy initiatives, and awareness programs', 3),
((SELECT id FROM prompt_domains WHERE name = 'patient_advocacy'), 'patient_education', 'Patient Education', 'Educational materials, resources, and communication strategies', 4),
((SELECT id FROM prompt_domains WHERE name = 'patient_advocacy'), 'outcomes_research', 'Outcomes Research', 'Patient-reported outcomes, real-world evidence, and impact assessment', 5);

-- Insert Data Analytics Categories
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'data_analytics'), 'business_intelligence', 'Business Intelligence', 'KPI analysis, dashboard development, and performance metrics', 1),
((SELECT id FROM prompt_domains WHERE name = 'data_analytics'), 'predictive_analytics', 'Predictive Analytics', 'Forecasting, trend analysis, and predictive modeling', 2),
((SELECT id FROM prompt_domains WHERE name = 'data_analytics'), 'real_world_evidence', 'Real World Evidence', 'RWE studies, data analysis, and evidence generation', 3),
((SELECT id FROM prompt_domains WHERE name = 'data_analytics'), 'data_visualization', 'Data Visualization', 'Chart creation, infographic development, and visual storytelling', 4),
((SELECT id FROM prompt_domains WHERE name = 'data_analytics'), 'reporting_automation', 'Reporting Automation', 'Automated reporting, data processing, and workflow optimization', 5);

-- Insert Operations Categories
INSERT INTO prompt_categories (domain_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM prompt_domains WHERE name = 'operations'), 'process_optimization', 'Process Optimization', 'Workflow improvement, efficiency analysis, and process redesign', 1),
((SELECT id FROM prompt_domains WHERE name = 'operations'), 'project_management', 'Project Management', 'Project planning, execution, and performance monitoring', 2),
((SELECT id FROM prompt_domains WHERE name = 'operations'), 'resource_management', 'Resource Management', 'Resource allocation, capacity planning, and optimization', 3),
((SELECT id FROM prompt_domains WHERE name = 'operations'), 'vendor_management', 'Vendor Management', 'Supplier evaluation, contract management, and vendor relationships', 4),
((SELECT id FROM prompt_domains WHERE name = 'operations'), 'change_management', 'Change Management', 'Organizational change, transformation planning, and adoption strategies', 5);

-- Insert Prompt Templates
INSERT INTO prompt_templates (name, display_name, description, template_type, content, variables, usage_instructions) VALUES
('prism_framework', 'PRISM™ Analysis Framework', 'Standard PRISM™ acronym-based analysis template', 'framework',
'## PRISM™ Analysis: {analysis_title}

### P - Problem/Purpose
{problem_definition}

### R - Requirements/Resources
{requirements_analysis}

### I - Implementation/Insights
{implementation_plan}

### S - Solutions/Strategies
{solutions_strategies}

### M - Metrics/Monitoring
{metrics_monitoring}

### Summary
{executive_summary}',
'[{"name": "analysis_title", "type": "text", "required": true}, {"name": "problem_definition", "type": "text", "required": true}, {"name": "requirements_analysis", "type": "text", "required": true}, {"name": "implementation_plan", "type": "text", "required": true}, {"name": "solutions_strategies", "type": "text", "required": true}, {"name": "metrics_monitoring", "type": "text", "required": true}, {"name": "executive_summary", "type": "text", "required": false}]',
'Use this template for structured PRISM™ analysis. Fill in each section systematically.'),

('success_criteria', 'Success Criteria Template', 'Standard success measurement framework', 'success_criteria',
'## Success Criteria

### Primary Objectives
- {primary_objective_1}
- {primary_objective_2}
- {primary_objective_3}

### Key Performance Indicators (KPIs)
1. **{kpi_1_name}**: {kpi_1_description}
   - Target: {kpi_1_target}
   - Measurement: {kpi_1_measurement}

2. **{kpi_2_name}**: {kpi_2_description}
   - Target: {kpi_2_target}
   - Measurement: {kpi_2_measurement}

### Timeline
- Milestone 1: {milestone_1} by {date_1}
- Milestone 2: {milestone_2} by {date_2}
- Final Review: {final_review_date}',
'[{"name": "primary_objective_1", "type": "text", "required": true}, {"name": "primary_objective_2", "type": "text", "required": false}, {"name": "primary_objective_3", "type": "text", "required": false}, {"name": "kpi_1_name", "type": "text", "required": true}, {"name": "kpi_1_description", "type": "text", "required": true}, {"name": "kpi_1_target", "type": "text", "required": true}, {"name": "kpi_1_measurement", "type": "text", "required": true}]',
'Define clear success criteria and measurable outcomes for any initiative.'),

('output_format_structured', 'Structured Output Format', 'Standardized output formatting template', 'output_format',
'## Executive Summary
{executive_summary}

## Key Findings
{key_findings}

## Recommendations
### Immediate Actions (0-30 days)
{immediate_actions}

### Short-term Initiatives (1-3 months)
{short_term_initiatives}

### Long-term Strategy (3+ months)
{long_term_strategy}

## Risk Assessment
{risk_assessment}

## Next Steps
{next_steps}',
'[{"name": "executive_summary", "type": "text", "required": true}, {"name": "key_findings", "type": "text", "required": true}, {"name": "immediate_actions", "type": "text", "required": true}, {"name": "short_term_initiatives", "type": "text", "required": false}, {"name": "long_term_strategy", "type": "text", "required": false}, {"name": "risk_assessment", "type": "text", "required": true}, {"name": "next_steps", "type": "text", "required": true}]',
'Use this template to ensure consistent, professional output formatting across all analyses.');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_categories_domain ON prompt_categories(domain_id);
CREATE INDEX IF NOT EXISTS idx_prompt_categories_name ON prompt_categories(name);

-- Add comments for documentation
COMMENT ON TABLE prompt_systems IS 'Reference data: Different prompt systems (PRISM™ Acronym, VITAL Path, Digital Health Structured)';
COMMENT ON TABLE prompt_domains IS 'Reference data: Healthcare domains (Medical Affairs, Compliance, Commercial, etc.)';
COMMENT ON TABLE complexity_levels IS 'Reference data: Complexity levels with time estimates and user requirements';
COMMENT ON TABLE prompt_categories IS 'Reference data: Subcategories within domains for detailed organization';
COMMENT ON TABLE prompt_templates IS 'Reference data: Reusable components for building consistent prompts';