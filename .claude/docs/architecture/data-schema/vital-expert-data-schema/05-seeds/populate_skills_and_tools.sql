-- =====================================================================
-- POPULATE SKILLS AND TOOLS REFERENCE TABLES
-- Creates comprehensive pharma skills and tools catalogs
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING SKILLS AND TOOLS REFERENCE TABLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. SKILLS TABLE (if not exists)
-- =====================================================================

-- Check if skills table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skills') THEN
        CREATE TABLE public.skills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            category TEXT,
            description TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_skills_category ON public.skills(category);
        RAISE NOTICE 'Created skills table';
    ELSE
        RAISE NOTICE 'Skills table already exists';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'Populating Skills...'; END $$;

INSERT INTO public.skills (name, category, description) VALUES
-- Scientific & Clinical Skills
('Clinical Research Knowledge', 'scientific', 'Understanding of clinical trial design and execution'),
('Medical Literature Review', 'scientific', 'Ability to review and synthesize medical literature'),
('Scientific Writing', 'scientific', 'Writing scientific and medical documents'),
('Scientific Communication', 'scientific', 'Presenting complex scientific information clearly'),
('Evidence Synthesis', 'scientific', 'Synthesizing clinical and scientific evidence'),
('Clinical Data Analysis', 'scientific', 'Analyzing clinical trial data and outcomes'),
('Pharmacology', 'scientific', 'Knowledge of drug mechanisms and pharmacokinetics'),
('Pharmacovigilance', 'scientific', 'Drug safety monitoring and adverse event reporting'),
('Biostatistics', 'scientific', 'Statistical analysis in biomedical research'),
('Epidemiology', 'scientific', 'Disease patterns and population health analysis'),
('Health Economics', 'scientific', 'HEOR and cost-effectiveness analysis'),
('Regulatory Knowledge', 'scientific', 'Understanding of regulatory requirements'),
-- Communication Skills
('Presentation Skills', 'communication', 'Delivering effective presentations'),
('Public Speaking', 'communication', 'Speaking to large audiences'),
('Medical Writing', 'communication', 'Writing for medical audiences'),
('Technical Writing', 'communication', 'Creating technical documentation'),
('Storytelling', 'communication', 'Narrative communication of data'),
('Cross-cultural Communication', 'communication', 'Communicating across cultures'),
-- Interpersonal Skills
('Relationship Building', 'interpersonal', 'Building and maintaining professional relationships'),
('Stakeholder Management', 'interpersonal', 'Managing diverse stakeholder needs'),
('Negotiation', 'interpersonal', 'Negotiating agreements and resolutions'),
('Conflict Resolution', 'interpersonal', 'Resolving disputes and conflicts'),
('Emotional Intelligence', 'interpersonal', 'Understanding and managing emotions'),
('Active Listening', 'interpersonal', 'Effective listening and comprehension'),
('Collaboration', 'interpersonal', 'Working effectively in teams'),
('Mentoring', 'interpersonal', 'Guiding and developing others'),
-- Leadership & Management
('Strategic Thinking', 'leadership', 'Long-term strategic planning'),
('Team Leadership', 'leadership', 'Leading and motivating teams'),
('People Management', 'leadership', 'Managing team performance'),
('Change Management', 'leadership', 'Leading organizational change'),
('Project Management', 'leadership', 'Managing projects and deliverables'),
('Budget Management', 'leadership', 'Financial planning and management'),
('Decision Making', 'leadership', 'Making effective decisions'),
('Vision Setting', 'leadership', 'Defining strategic vision'),
-- Analytical Skills
('Data Analysis', 'analytical', 'Analyzing quantitative and qualitative data'),
('Critical Thinking', 'analytical', 'Evaluating information objectively'),
('Problem Solving', 'analytical', 'Identifying and solving complex problems'),
('Research Skills', 'analytical', 'Conducting systematic research'),
('Competitive Intelligence', 'analytical', 'Analyzing competitive landscape'),
('Market Analysis', 'analytical', 'Understanding market dynamics'),
-- Digital & Technology
('CRM Systems', 'digital', 'Using customer relationship management systems'),
('Data Visualization', 'digital', 'Creating visual representations of data'),
('Microsoft Office Suite', 'digital', 'Proficiency in Word, Excel, PowerPoint'),
('Database Management', 'digital', 'Managing and querying databases'),
('Digital Collaboration Tools', 'digital', 'Using Teams, Slack, Zoom, etc.'),
('AI Tools', 'digital', 'Using AI-powered tools and platforms'),
('Statistical Software', 'digital', 'Using R, SAS, SPSS, etc.'),
('Medical Information Systems', 'digital', 'Using specialized medical databases'),
-- Business Skills
('Business Acumen', 'business', 'Understanding business operations'),
('Financial Analysis', 'business', 'Analyzing financial data'),
('Sales Enablement', 'business', 'Supporting sales processes'),
('Marketing Knowledge', 'business', 'Understanding marketing principles'),
('Contract Management', 'business', 'Managing contracts and agreements'),
('Procurement', 'business', 'Sourcing and vendor management'),
-- Compliance & Quality
('Regulatory Compliance', 'compliance', 'Ensuring regulatory adherence'),
('Quality Assurance', 'compliance', 'Maintaining quality standards'),
('SOPs & Governance', 'compliance', 'Following standard operating procedures'),
('Audit Readiness', 'compliance', 'Preparing for audits and inspections'),
('Risk Management', 'compliance', 'Identifying and mitigating risks'),
-- Specialized Pharma Skills
('Product Launch', 'pharma_specialized', 'Planning and executing product launches'),
('Payer Relations', 'pharma_specialized', 'Working with payers and health plans'),
('KOL Management', 'pharma_specialized', 'Managing key opinion leader relationships'),
('Advisory Board Management', 'pharma_specialized', 'Organizing and running advisory boards'),
('Congress Management', 'pharma_specialized', 'Managing medical congress activities'),
('Field Force Training', 'pharma_specialized', 'Training field-based teams'),
('Publication Planning', 'pharma_specialized', 'Strategic publication planning')
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE skill_count INTEGER; BEGIN
    SELECT COUNT(*) INTO skill_count FROM public.skills;
    RAISE NOTICE '✓ Created % skills', skill_count;
END $$;

-- =====================================================================
-- 2. TOOLS TABLE (if not exists)
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tools') THEN
        CREATE TABLE public.tools (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            category TEXT,
            description TEXT,
            vendor TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_tools_category ON public.tools(category);
        RAISE NOTICE 'Created tools table';
    ELSE
        RAISE NOTICE 'Tools table already exists';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE 'Populating Tools...'; END $$;

INSERT INTO public.tools (name, category, description, vendor) VALUES
-- CRM & Sales Tools
('Veeva CRM', 'crm', 'Pharmaceutical CRM system', 'Veeva Systems'),
('Salesforce Health Cloud', 'crm', 'Healthcare CRM platform', 'Salesforce'),
('IQVIA OCE', 'crm', 'Omnichannel customer engagement', 'IQVIA'),
-- Medical Information Systems
('Veeva Vault', 'medical_info', 'Content and data management', 'Veeva Systems'),
('Zinc Ahead', 'medical_info', 'Medical information management', 'Zinc'),
('Vodori Platform', 'medical_info', 'Medical affairs platform', 'Vodori'),
-- Literature & Research
('PubMed', 'research', 'Medical literature database', 'NCBI'),
('Embase', 'research', 'Biomedical literature database', 'Elsevier'),
('Cochrane Library', 'research', 'Systematic reviews database', 'Cochrane'),
('ClinicalTrials.gov', 'research', 'Clinical trials registry', 'NIH'),
('Scopus', 'research', 'Abstract and citation database', 'Elsevier'),
-- Data Analysis & Statistics
('SAS', 'analytics', 'Statistical analysis software', 'SAS Institute'),
('R', 'analytics', 'Statistical computing language', 'Open Source'),
('Python', 'analytics', 'Programming language for data science', 'Open Source'),
('SPSS', 'analytics', 'Statistical analysis software', 'IBM'),
('Tableau', 'analytics', 'Data visualization platform', 'Salesforce'),
('Power BI', 'analytics', 'Business intelligence tool', 'Microsoft'),
-- Microsoft Office & Productivity
('Microsoft Word', 'productivity', 'Word processing', 'Microsoft'),
('Microsoft Excel', 'productivity', 'Spreadsheet software', 'Microsoft'),
('Microsoft PowerPoint', 'productivity', 'Presentation software', 'Microsoft'),
('Microsoft Teams', 'productivity', 'Collaboration platform', 'Microsoft'),
('Microsoft Outlook', 'productivity', 'Email and calendar', 'Microsoft'),
('Microsoft SharePoint', 'productivity', 'Document management', 'Microsoft'),
('Microsoft OneNote', 'productivity', 'Note-taking application', 'Microsoft'),
-- Collaboration Tools
('Zoom', 'collaboration', 'Video conferencing', 'Zoom'),
('Slack', 'collaboration', 'Team messaging', 'Salesforce'),
('Webex', 'collaboration', 'Video conferencing', 'Cisco'),
('Miro', 'collaboration', 'Online whiteboard', 'Miro'),
-- Project Management
('Asana', 'project_mgmt', 'Project management platform', 'Asana'),
('Monday.com', 'project_mgmt', 'Work management platform', 'Monday.com'),
('Smartsheet', 'project_mgmt', 'Work execution platform', 'Smartsheet'),
('JIRA', 'project_mgmt', 'Issue tracking', 'Atlassian'),
-- Medical Writing & Publishing
('EndNote', 'medical_writing', 'Reference management', 'Clarivate'),
('Mendeley', 'medical_writing', 'Reference manager', 'Elsevier'),
('Grammarly', 'medical_writing', 'Writing assistant', 'Grammarly'),
('LaTeX', 'medical_writing', 'Document preparation', 'Open Source'),
-- Regulatory & Compliance
('Veeva RIM', 'regulatory', 'Regulatory information management', 'Veeva Systems'),
('MasterControl', 'regulatory', 'Quality and compliance software', 'MasterControl'),
('TrackWise', 'regulatory', 'Quality management system', 'Sparta Systems'),
-- Clinical Trial Management
('Medidata Rave', 'clinical_trials', 'Electronic data capture', 'Medidata'),
('Oracle Clinical', 'clinical_trials', 'Clinical data management', 'Oracle'),
('Veeva Vault CTMS', 'clinical_trials', 'Clinical trial management', 'Veeva Systems'),
-- Safety & Pharmacovigilance
('Oracle Argus', 'safety', 'Safety database', 'Oracle'),
('ArisGlobal', 'safety', 'Pharmacovigilance platform', 'ArisGlobal'),
('Veeva Vault Safety', 'safety', 'Safety data management', 'Veeva Systems'),
-- AI & Advanced Tools
('ChatGPT', 'ai', 'AI language model', 'OpenAI'),
('Claude', 'ai', 'AI assistant', 'Anthropic'),
('Copilot', 'ai', 'AI coding assistant', 'Microsoft'),
('Grammarly AI', 'ai', 'AI writing assistant', 'Grammarly')
ON CONFLICT (name) DO NOTHING;

DO $$ DECLARE tool_count INTEGER; BEGIN
    SELECT COUNT(*) INTO tool_count FROM public.tools;
    RAISE NOTICE '✓ Created % tools', tool_count;
END $$;

-- =====================================================================
-- FINAL SUMMARY
-- =====================================================================

DO $$
DECLARE
    skill_count INTEGER;
    tool_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO skill_count FROM public.skills;
    SELECT COUNT(*) INTO tool_count FROM public.tools;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SKILLS AND TOOLS TABLES POPULATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Reference Data Created:';
    RAISE NOTICE '  ✓ % Skills across 8 categories', skill_count;
    RAISE NOTICE '  ✓ % Tools across 11 categories', tool_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Skill Categories:';
    RAISE NOTICE '  • Scientific & Clinical';
    RAISE NOTICE '  • Communication';
    RAISE NOTICE '  • Interpersonal';
    RAISE NOTICE '  • Leadership & Management';
    RAISE NOTICE '  • Analytical';
    RAISE NOTICE '  • Digital & Technology';
    RAISE NOTICE '  • Business';
    RAISE NOTICE '  • Compliance & Quality';
    RAISE NOTICE '';
    RAISE NOTICE 'Tool Categories:';
    RAISE NOTICE '  • CRM & Sales';
    RAISE NOTICE '  • Medical Information';
    RAISE NOTICE '  • Literature & Research';
    RAISE NOTICE '  • Data Analysis';
    RAISE NOTICE '  • Productivity';
    RAISE NOTICE '  • Collaboration';
    RAISE NOTICE '  • Project Management';
    RAISE NOTICE '  • Medical Writing';
    RAISE NOTICE '  • Regulatory';
    RAISE NOTICE '  • Clinical Trials';
    RAISE NOTICE '  • AI Tools';
    RAISE NOTICE '';
    RAISE NOTICE 'Junction Tables Ready:';
    RAISE NOTICE '  ✓ role_skills';
    RAISE NOTICE '  ✓ role_tools';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

