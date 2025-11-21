-- =====================================================================
-- POPULATE ALL REFERENCE TABLES FOR PHARMACEUTICAL ROLES
-- Creates master data for skills, tools, stakeholders, KPIs, etc.
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING ALL REFERENCE TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. THERAPEUTIC AREAS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Therapeutic Areas...'; END $$;

INSERT INTO public.therapeutic_areas (name, description) VALUES
('Oncology', 'Cancer treatment and research'),
('Immunology', 'Immune system disorders and treatments'),
('Cardiovascular', 'Heart and blood vessel diseases'),
('Neurology', 'Nervous system disorders'),
('Rare Diseases', 'Orphan drugs and rare conditions'),
('Infectious Diseases', 'Bacterial, viral, and fungal infections'),
('Respiratory', 'Lung and breathing disorders'),
('Metabolic Disorders', 'Diabetes, obesity, and metabolic conditions'),
('Gastroenterology', 'Digestive system diseases'),
('Dermatology', 'Skin conditions and treatments'),
('Ophthalmology', 'Eye diseases and vision care'),
('Hematology', 'Blood disorders'),
('Endocrinology', 'Hormonal disorders'),
('Rheumatology', 'Arthritis and autoimmune diseases'),
('Vaccines', 'Preventive immunization'),
('Pain Management', 'Chronic and acute pain treatment')
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE ta_count INTEGER; BEGIN
    SELECT COUNT(*) INTO ta_count FROM public.therapeutic_areas;
    RAISE NOTICE '✓ Created % therapeutic areas', ta_count;
END $$;

-- =====================================================================
-- 2. DISEASE AREAS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Disease Areas...'; END $$;

INSERT INTO public.disease_areas (name, therapeutic_area_id, description)
SELECT 'Breast Cancer', id, 'Malignant breast tumors' FROM public.therapeutic_areas WHERE name = 'Oncology'
UNION ALL SELECT 'Lung Cancer', id, 'Malignant lung tumors' FROM public.therapeutic_areas WHERE name = 'Oncology'
UNION ALL SELECT 'Rheumatoid Arthritis', id, 'Chronic inflammatory arthritis' FROM public.therapeutic_areas WHERE name = 'Rheumatology'
UNION ALL SELECT 'Psoriasis', id, 'Chronic skin condition' FROM public.therapeutic_areas WHERE name = 'Dermatology'
UNION ALL SELECT 'Type 2 Diabetes', id, 'Chronic metabolic disorder' FROM public.therapeutic_areas WHERE name = 'Metabolic Disorders'
UNION ALL SELECT 'HIV/AIDS', id, 'Human immunodeficiency virus' FROM public.therapeutic_areas WHERE name = 'Infectious Diseases'
UNION ALL SELECT 'Multiple Sclerosis', id, 'Autoimmune neurological disease' FROM public.therapeutic_areas WHERE name = 'Neurology'
UNION ALL SELECT 'Asthma', id, 'Chronic respiratory condition' FROM public.therapeutic_areas WHERE name = 'Respiratory'
UNION ALL SELECT 'COPD', id, 'Chronic obstructive pulmonary disease' FROM public.therapeutic_areas WHERE name = 'Respiratory'
UNION ALL SELECT 'Alzheimers Disease', id, 'Neurodegenerative disorder' FROM public.therapeutic_areas WHERE name = 'Neurology'
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE da_count INTEGER; BEGIN
    SELECT COUNT(*) INTO da_count FROM public.disease_areas;
    RAISE NOTICE '✓ Created % disease areas', da_count;
END $$;

-- =====================================================================
-- 3. COMPANY SIZES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Company Sizes...'; END $$;

INSERT INTO public.company_sizes (name, description, employee_min, employee_max, revenue_min_usd, revenue_max_usd) VALUES
('Startup (<100)', 'Early-stage pharmaceutical startups', 1, 99, 0, 10000000),
('Small (100-999)', 'Small pharmaceutical companies', 100, 999, 10000000, 100000000),
('Mid-size (1K-10K)', 'Mid-size pharmaceutical companies', 1000, 9999, 100000000, 1000000000),
('Large Enterprise (10K+)', 'Large pharmaceutical enterprises', 10000, 999999, 1000000000, 999999999999),
('Big Pharma (50K+)', 'Major pharmaceutical corporations', 50000, 999999, 10000000000, 999999999999)
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE cs_count INTEGER; BEGIN
    SELECT COUNT(*) INTO cs_count FROM public.company_sizes;
    RAISE NOTICE '✓ Created % company sizes', cs_count;
END $$;

-- =====================================================================
-- 4. AI MATURITY LEVELS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating AI Maturity Levels...'; END $$;

INSERT INTO public.ai_maturity_levels (level_name, level_number, description, score_min, score_max) VALUES
('Emerging', 1, 'Initial exploration of AI tools', 0, 20),
('Developing', 2, 'Experimenting with AI in limited use cases', 21, 40),
('Intermediate', 3, 'Moderate AI adoption across workflows', 41, 60),
('Advanced', 4, 'Significant AI integration in daily work', 61, 80),
('Leading', 5, 'AI-native workflows and processes', 81, 100)
ON CONFLICT (level_name) DO NOTHING;

DO $$ DECLARE ai_count INTEGER; BEGIN
    SELECT COUNT(*) INTO ai_count FROM public.ai_maturity_levels;
    RAISE NOTICE '✓ Created % AI maturity levels', ai_count;
END $$;

-- =====================================================================
-- 5. VPANES DIMENSIONS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating VPANES Dimensions...'; END $$;

INSERT INTO public.vpanes_dimensions (dimension_name, dimension_code, description, weight) VALUES
('Volume (Addressability)', 'V', 'Size of target user population', 0.20),
('Priority (Business Criticality)', 'P', 'Strategic importance to organization', 0.25),
('Adoption (AI Readiness)', 'A', 'Willingness and ability to adopt AI', 0.15),
('Need (Pain Points)', 'N', 'Severity of current challenges', 0.20),
('Engagement (Sponsor Interest)', 'E', 'Leadership and stakeholder support', 0.10),
('Strategic Alignment', 'S', 'Alignment with company strategy', 0.10)
ON CONFLICT (dimension_code) DO NOTHING;

DO $$ DECLARE vp_count INTEGER; BEGIN
    SELECT COUNT(*) INTO vp_count FROM public.vpanes_dimensions;
    RAISE NOTICE '✓ Created % VPANES dimensions', vp_count;
END $$;

-- =====================================================================
-- 6. STAKEHOLDERS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Stakeholder Types...'; END $$;

INSERT INTO public.stakeholders (name, description, is_internal) VALUES
-- Internal Stakeholders
('Medical Affairs Leadership', 'VP, Directors of Medical Affairs', true),
('Clinical Development Team', 'Clinical trial and development teams', true),
('Regulatory Affairs', 'Regulatory compliance and submissions teams', true),
('Commercial Team', 'Sales and marketing functions', true),
('Market Access Team', 'Payer relations and reimbursement teams', true),
('R&D Leadership', 'Research and development leadership', true),
('Quality Assurance', 'QA and compliance teams', true),
('Legal Department', 'Legal counsel and compliance', true),
('Finance Department', 'Financial planning and analysis', true),
('HR Department', 'Human resources and talent management', true),
('IT Department', 'Information technology and systems', true),
('Executive Leadership', 'C-suite and executive team', true),
('Operations Team', 'Operational and process teams', true),
('Data & Analytics Team', 'Business intelligence and analytics', true),
('Pharmacovigilance', 'Drug safety and adverse event monitoring', true),
-- External Stakeholders
('Key Opinion Leaders (KOLs)', 'Thought leaders in therapeutic areas', false),
('Healthcare Professionals', 'Physicians, nurses, pharmacists', false),
('Patients', 'End users of pharmaceutical products', false),
('Patient Advocacy Groups', 'Disease-specific patient organizations', false),
('Payers', 'Insurance companies and health plans', false),
('Regulatory Authorities', 'FDA, EMA, and other regulatory bodies', false),
('Academic Institutions', 'Universities and research centers', false),
('Healthcare Systems', 'Hospitals and integrated delivery networks', false),
('Pharmacy Benefit Managers', 'PBMs managing drug benefits', false),
('Wholesalers & Distributors', 'Supply chain partners', false),
('Contract Research Organizations', 'CROs supporting clinical trials', false),
('Medical Societies', 'Professional medical associations', false)
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE sh_count INTEGER; BEGIN
    SELECT COUNT(*) INTO sh_count FROM public.stakeholders;
    RAISE NOTICE '✓ Created % stakeholder types', sh_count;
END $$;

-- =====================================================================
-- 7. RESPONSIBILITIES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Responsibilities Catalog...'; END $$;

INSERT INTO public.responsibilities (name, category, description, complexity_level) VALUES
-- Strategic Responsibilities
('Strategic Planning', 'strategic', 'Develop long-term strategic plans', 'high'),
('Business Development', 'strategic', 'Identify and pursue growth opportunities', 'high'),
('Market Analysis', 'strategic', 'Analyze market trends and competitive landscape', 'medium'),
('Portfolio Management', 'strategic', 'Manage product portfolio and pipeline', 'high'),
-- Core Operational
('Scientific Exchange', 'core', 'Engage in scientific discussions with HCPs', 'high'),
('Clinical Data Communication', 'core', 'Present and discuss clinical trial results', 'high'),
('Medical Information Response', 'core', 'Respond to medical information requests', 'medium'),
('Literature Review', 'core', 'Review and synthesize medical literature', 'medium'),
('Field Visits', 'core', 'Conduct field visits to healthcare facilities', 'medium'),
('KOL Engagement', 'core', 'Build and maintain KOL relationships', 'high'),
('Advisory Board Support', 'core', 'Support and organize advisory boards', 'medium'),
('Congress Support', 'core', 'Support medical congresses and conferences', 'medium'),
('Insights Gathering', 'core', 'Collect and report field insights', 'medium'),
('Medical Writing', 'core', 'Write medical and scientific documents', 'high'),
('Publication Planning', 'core', 'Plan and execute publication strategies', 'high'),
('Clinical Trial Support', 'core', 'Support clinical trial operations', 'high'),
('Safety Monitoring', 'core', 'Monitor drug safety and adverse events', 'high'),
('Regulatory Submissions', 'core', 'Prepare and submit regulatory documents', 'high'),
('Compliance Monitoring', 'core', 'Ensure regulatory compliance', 'high'),
('Quality Assurance', 'core', 'Maintain quality standards', 'medium'),
-- Training & Development
('Training Delivery', 'development', 'Deliver training to internal and external audiences', 'medium'),
('Educational Content Development', 'development', 'Create educational materials', 'medium'),
('Mentoring', 'development', 'Mentor junior team members', 'low'),
-- Collaboration & Communication
('Cross-functional Collaboration', 'collaboration', 'Work across organizational boundaries', 'medium'),
('Stakeholder Management', 'collaboration', 'Manage stakeholder relationships', 'medium'),
('Internal Communication', 'collaboration', 'Communicate with internal teams', 'low'),
('External Communication', 'collaboration', 'Communicate with external partners', 'medium'),
-- Analysis & Reporting
('Data Analysis', 'analysis', 'Analyze data and generate insights', 'high'),
('Report Generation', 'analysis', 'Create reports and presentations', 'medium'),
('Metrics Tracking', 'analysis', 'Track and report on KPIs', 'low'),
-- Budget & Resource Management
('Budget Management', 'management', 'Manage departmental budgets', 'high'),
('Resource Allocation', 'management', 'Allocate resources effectively', 'medium'),
('Vendor Management', 'management', 'Manage external vendors and partners', 'medium'),
('Team Leadership', 'management', 'Lead and manage teams', 'high'),
('Performance Management', 'management', 'Manage team performance', 'medium'),
-- Administrative
('Meeting Coordination', 'administrative', 'Schedule and coordinate meetings', 'low'),
('Documentation', 'administrative', 'Maintain documentation and records', 'low'),
('Expense Management', 'administrative', 'Manage travel and expenses', 'low'),
('CRM Management', 'administrative', 'Maintain CRM system data', 'low')
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE resp_count INTEGER; BEGIN
    SELECT COUNT(*) INTO resp_count FROM public.responsibilities;
    RAISE NOTICE '✓ Created % responsibility types', resp_count;
END $$;

-- =====================================================================
-- 8. KPI DEFINITIONS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating KPI Definitions...'; END $$;

INSERT INTO public.kpi_definitions (name, category, description, measurement_unit) VALUES
-- Engagement KPIs
('HCP Engagement Rate', 'engagement', 'Number of meaningful HCP interactions', 'interactions/period'),
('KOL Interaction Frequency', 'engagement', 'Frequency of KOL engagements', 'meetings/quarter'),
('Advisory Board Participation', 'engagement', 'Number of advisory boards supported', 'boards/year'),
('Congress Attendance', 'engagement', 'Medical congresses attended', 'congresses/year'),
-- Quality KPIs
('Scientific Quality Score', 'quality', 'Quality of scientific interactions', 'score (1-5)'),
('Response Accuracy Rate', 'quality', 'Accuracy of medical information responses', 'percentage'),
('Publication Quality Score', 'quality', 'Quality of publications', 'score (1-5)'),
('Compliance Rate', 'quality', 'Adherence to compliance requirements', 'percentage'),
-- Output KPIs
('Insights Submitted', 'output', 'Number of field insights reported', 'insights/quarter'),
('Publications Authored', 'output', 'Number of publications contributed to', 'publications/year'),
('Presentations Delivered', 'output', 'Number of presentations given', 'presentations/quarter'),
('Training Sessions Delivered', 'output', 'Training sessions conducted', 'sessions/quarter'),
-- Impact KPIs
('Customer Satisfaction Score', 'impact', 'Satisfaction rating from stakeholders', 'score (1-10)'),
('Scientific Impact Factor', 'impact', 'Impact of scientific contributions', 'score'),
('Market Share Influence', 'impact', 'Influence on market share', 'percentage change'),
('Brand Awareness Impact', 'impact', 'Impact on brand awareness', 'percentage'),
-- Efficiency KPIs
('Response Time', 'efficiency', 'Time to respond to inquiries', 'hours/days'),
('Budget Utilization', 'efficiency', 'Percentage of budget utilized', 'percentage'),
('Travel Efficiency', 'efficiency', 'Cost per engagement', 'USD/interaction'),
('Cycle Time', 'efficiency', 'Time to complete processes', 'days'),
-- Strategic KPIs
('Pipeline Contribution', 'strategic', 'Contribution to product pipeline', 'score'),
('Strategic Initiative Progress', 'strategic', 'Progress on strategic initiatives', 'percentage'),
('Market Access Success Rate', 'strategic', 'Success rate in market access', 'percentage'),
('Launch Readiness Score', 'strategic', 'Preparedness for product launches', 'score (1-10)')
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE kpi_count INTEGER; BEGIN
    SELECT COUNT(*) INTO kpi_count FROM public.kpi_definitions;
    RAISE NOTICE '✓ Created % KPI definitions', kpi_count;
END $$;

-- =====================================================================
-- FINAL SUMMARY
-- =====================================================================

DO $$
DECLARE
    ta_count INTEGER;
    da_count INTEGER;
    cs_count INTEGER;
    ai_count INTEGER;
    vp_count INTEGER;
    sh_count INTEGER;
    resp_count INTEGER;
    kpi_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ta_count FROM public.therapeutic_areas;
    SELECT COUNT(*) INTO da_count FROM public.disease_areas;
    SELECT COUNT(*) INTO cs_count FROM public.company_sizes;
    SELECT COUNT(*) INTO ai_count FROM public.ai_maturity_levels;
    SELECT COUNT(*) INTO vp_count FROM public.vpanes_dimensions;
    SELECT COUNT(*) INTO sh_count FROM public.stakeholders;
    SELECT COUNT(*) INTO resp_count FROM public.responsibilities;
    SELECT COUNT(*) INTO kpi_count FROM public.kpi_definitions;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ALL REFERENCE TABLES POPULATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Reference Data Created:';
    RAISE NOTICE '  ✓ % Therapeutic Areas', ta_count;
    RAISE NOTICE '  ✓ % Disease Areas', da_count;
    RAISE NOTICE '  ✓ % Company Sizes', cs_count;
    RAISE NOTICE '  ✓ % AI Maturity Levels', ai_count;
    RAISE NOTICE '  ✓ % VPANES Dimensions', vp_count;
    RAISE NOTICE '  ✓ % Stakeholder Types', sh_count;
    RAISE NOTICE '  ✓ % Responsibility Types', resp_count;
    RAISE NOTICE '  ✓ % KPI Definitions', kpi_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Total Reference Records: %', ta_count + da_count + cs_count + ai_count + vp_count + sh_count + resp_count + kpi_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables Ready:';
    RAISE NOTICE '  ✓ role_therapeutic_areas';
    RAISE NOTICE '  ✓ role_disease_areas';
    RAISE NOTICE '  ✓ role_company_sizes';
    RAISE NOTICE '  ✓ role_responsibilities';
    RAISE NOTICE '  ✓ role_kpis';
    RAISE NOTICE '  ✓ role_tools';
    RAISE NOTICE '  ✓ role_internal_stakeholders';
    RAISE NOTICE '  ✓ role_external_stakeholders';
    RAISE NOTICE '  ✓ role_ai_maturity';
    RAISE NOTICE '  ✓ role_vpanes_scores';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Begin role enrichment using these reference tables';
    RAISE NOTICE '  2. Map roles to responsibilities, KPIs, tools, etc.';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

