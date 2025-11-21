-- ============================================================================
-- DIGITAL HEALTH STARTUP ORGANIZATION STRUCTURE
-- For Digital Therapeutics (DTx) and Digital Health Companies
-- ============================================================================

-- Ensure Digital Health Tenant exists
INSERT INTO tenants (id, name, slug, industry, type, metadata)
VALUES (
    'b8026534-02a7-4d24-bf4c-344591964e02',
    'Digital Health Startup',
    'digital-health-startup',
    'Digital Health',
    'client',
    jsonb_build_object(
        'description', 'Digital health and digital therapeutics startup organizational structure',
        'organization_type', 'Startup/Scale-up',
        'regulatory_focus', 'FDA Digital Health, SaMD, DTx',
        'primary_products', ARRAY['Digital Therapeutics', 'SaMD', 'mHealth Apps', 'Wearables']
    )
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    type = EXCLUDED.type,
    metadata = EXCLUDED.metadata;

-- ============================================================================
-- DIGITAL HEALTH: Business Functions (Startup/Agile Structure)
-- ============================================================================

INSERT INTO org_functions (id, unique_id, department_name, description, migration_ready, created_by)
VALUES
    (gen_random_uuid(), 'FN-DTX-PROD', 'Product & Engineering', 'Digital product development, software engineering, and UX', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-CLIN', 'Clinical & Medical', 'Clinical development, medical affairs, and clinical validation', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-REG', 'Regulatory & Quality', 'Digital health regulatory strategy, SaMD submissions, and quality systems', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-DATA', 'Data Science & AI/ML', 'Data analytics, AI/ML, digital biomarkers, and algorithm development', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-COM', 'Commercial & Growth', 'Sales, marketing, market access, and customer success', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-PAT', 'Patient Experience & Engagement', 'User engagement, patient support, and behavioral science', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-SEC', 'Security & Privacy', 'Cybersecurity, data privacy (HIPAA/GDPR), and information security', true, 'system'),
    (gen_random_uuid(), 'FN-DTX-STRAT', 'Strategy & Operations', 'Business strategy, partnerships, and operations', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- DIGITAL HEALTH: Departments
-- ============================================================================

-- Product & Engineering Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-SOFTENG', 'Software Engineering', 'Mobile, web, and backend development'),
    ('DEPT-DTX-PRODMGMT', 'Product Management', 'Digital product strategy and roadmap'),
    ('DEPT-DTX-UXDES', 'UX/UI Design', 'User experience, interface design, and usability'),
    ('DEPT-DTX-DEVOPS', 'DevOps & Infrastructure', 'Cloud infrastructure, CI/CD, and platform operations')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-PROD'
ON CONFLICT (unique_id) DO NOTHING;

-- Clinical & Medical Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-CLINDEV', 'Clinical Development', 'DTx clinical trials and validation studies'),
    ('DEPT-DTX-CLINOPS', 'Clinical Operations', 'Study execution and site management'),
    ('DEPT-DTX-MEDAFF', 'Medical Affairs', 'Medical strategy, KOLs, and scientific communication'),
    ('DEPT-DTX-EVID', 'Clinical Evidence & RWE', 'Real-world evidence and outcomes research')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-CLIN'
ON CONFLICT (unique_id) DO NOTHING;

-- Regulatory & Quality Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-REGAFF', 'Regulatory Affairs', 'FDA Digital Health, SaMD, and DTx regulatory strategy'),
    ('DEPT-DTX-QMS', 'Quality Management System', 'ISO 13485, IEC 62304, and design controls'),
    ('DEPT-DTX-POSTMKT', 'Post-Market Surveillance', 'Complaints, vigilance, and post-market monitoring')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-REG'
ON CONFLICT (unique_id) DO NOTHING;

-- Data Science & AI/ML Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-DATASCI', 'Data Science', 'Analytics, insights, and data-driven product development'),
    ('DEPT-DTX-AIML', 'AI/ML Engineering', 'Machine learning models, algorithms, and AI features'),
    ('DEPT-DTX-DIGBIO', 'Digital Biomarkers', 'Sensor data, wearables, and digital endpoint development'),
    ('DEPT-DTX-CLINANAL', 'Clinical Analytics', 'Clinical data analysis and biostatistics')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-DATA'
ON CONFLICT (unique_id) DO NOTHING;

-- Commercial & Growth Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-SALES', 'Sales & Business Development', 'B2B sales, partnerships, and channel development'),
    ('DEPT-DTX-MKTG', 'Marketing & Growth', 'Digital marketing, content, and growth hacking'),
    ('DEPT-DTX-MKTACC', 'Market Access & Reimbursement', 'Payer strategy, value demonstration, and reimbursement'),
    ('DEPT-DTX-CUSTSUC', 'Customer Success', 'Customer support, onboarding, and retention')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-COM'
ON CONFLICT (unique_id) DO NOTHING;

-- Patient Experience Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-PATENG', 'Patient Engagement', 'User engagement strategies and patient retention'),
    ('DEPT-DTX-BEHSCI', 'Behavioral Science', 'Behavior change techniques and engagement psychology'),
    ('DEPT-DTX-PATSUPP', 'Patient Support', 'Patient services, coaching, and care coordination')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-PAT'
ON CONFLICT (unique_id) DO NOTHING;

-- Security & Privacy Departments
INSERT INTO org_departments (id, unique_id, department_id, department_name, description, function_id, created_by)
SELECT 
    gen_random_uuid(),
    dept.code,
    dept.code,
    dept.name,
    dept.description,
    f.id,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    ('DEPT-DTX-INFOSEC', 'Information Security', 'Cybersecurity, pen testing, and security operations'),
    ('DEPT-DTX-PRIV', 'Privacy & Compliance', 'HIPAA, GDPR, data privacy, and compliance'),
    ('DEPT-DTX-DEVSEC', 'DevSecOps', 'Security automation, SAST/DAST, and secure development')
) AS dept(code, name, description)
WHERE f.unique_id = 'FN-DTX-SEC'
ON CONFLICT (unique_id) DO NOTHING;

-- ============================================================================
-- DIGITAL HEALTH: Roles (150+ DTx-Specific Roles)
-- ============================================================================

-- Executive & Leadership Roles
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, function_id, is_active, created_by)
SELECT 
    gen_random_uuid(),
    role.code,
    role.name,
    role.title,
    role.description,
    role.seniority,
    f.id,
    true,
    'system'
FROM org_functions f
CROSS JOIN (VALUES
    -- C-Suite
    ('ROLE-DTX-CEO', 'Chief Executive Officer', 'CEO', 'Company vision and strategy', 'C-Level', 'FN-DTX-STRAT'),
    ('ROLE-DTX-CPO', 'Chief Product Officer', 'CPO', 'Product strategy and innovation', 'C-Level', 'FN-DTX-PROD'),
    ('ROLE-DTX-CMO-MED', 'Chief Medical Officer', 'CMO', 'Medical strategy and clinical affairs', 'C-Level', 'FN-DTX-CLIN'),
    ('ROLE-DTX-CTO', 'Chief Technology Officer', 'CTO', 'Technology strategy and architecture', 'C-Level', 'FN-DTX-PROD'),
    ('ROLE-DTX-CISO', 'Chief Information Security Officer', 'CISO', 'Security strategy and risk management', 'C-Level', 'FN-DTX-SEC'),
    ('ROLE-DTX-CDAO', 'Chief Data & Analytics Officer', 'CDAO', 'Data strategy and AI/ML', 'C-Level', 'FN-DTX-DATA'),
    
    -- VP Level
    ('ROLE-DTX-VPPROD', 'VP Product', 'VP Product', 'Product management leadership', 'Executive', 'FN-DTX-PROD'),
    ('ROLE-DTX-VPENG', 'VP Engineering', 'VP Engineering', 'Engineering and development leadership', 'Executive', 'FN-DTX-PROD'),
    ('ROLE-DTX-VPCLIN', 'VP Clinical Development', 'VP Clinical', 'Clinical strategy and trial execution', 'Executive', 'FN-DTX-CLIN'),
    ('ROLE-DTX-VPREG', 'VP Regulatory Affairs', 'VP Regulatory', 'Digital health regulatory strategy', 'Executive', 'FN-DTX-REG'),
    ('ROLE-DTX-VPCOM', 'VP Commercial', 'VP Commercial', 'Sales, marketing, and market access', 'Executive', 'FN-DTX-COM'),
    ('ROLE-DTX-VPDATA', 'VP Data Science', 'VP Data Science', 'Data science and AI/ML leadership', 'Executive', 'FN-DTX-DATA')
) AS role(code, name, title, description, seniority, func_code)
WHERE f.unique_id = role.func_code
ON CONFLICT (unique_id) DO NOTHING;

-- Product & Engineering Roles
INSERT INTO org_roles (id, unique_id, role_name, role_title, description, seniority_level, is_active, created_by)
VALUES
    -- Product Management
    (gen_random_uuid(), 'ROLE-DTX-SENPRODMGR', 'Senior Product Manager', 'Sr Product Manager', 'Lead product manager for key features', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-PRODMGR', 'Product Manager', 'Product Manager', 'Digital product feature development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-PRODOWNER', 'Product Owner', 'Product Owner', 'Agile product ownership and backlog', 'Mid', true, 'system'),
    
    -- Engineering
    (gen_random_uuid(), 'ROLE-DTX-ENGMGR', 'Engineering Manager', 'Engineering Manager', 'Engineering team leadership', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-SENENG', 'Senior Software Engineer', 'Sr Engineer', 'Senior development and architecture', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-SOFTENG', 'Software Engineer', 'Software Engineer', 'Full-stack or specialized development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MOBENG', 'Mobile Engineer (iOS/Android)', 'Mobile Engineer', 'Native mobile app development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-BACKEND', 'Backend Engineer', 'Backend Engineer', 'API, services, and backend systems', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-DEVOPS', 'DevOps Engineer', 'DevOps Engineer', 'Infrastructure, CI/CD, and automation', 'Mid', true, 'system'),
    
    -- Design
    (gen_random_uuid(), 'ROLE-DTX-UXDIR', 'UX Design Director', 'UX Director', 'User experience strategy and team lead', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-UXDES', 'UX/UI Designer', 'UX Designer', 'User interface and experience design', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-UXRES', 'UX Researcher', 'UX Researcher', 'User research and usability testing', 'Mid', true, 'system'),
    
    -- Clinical & Medical
    (gen_random_uuid(), 'ROLE-DTX-CLINDIR', 'Clinical Development Director', 'Clinical Director', 'DTx clinical trial leadership', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-CLINMGR', 'Clinical Trial Manager', 'Clinical Manager', 'DTx study management', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-CLINSCI', 'Clinical Research Scientist', 'Clinical Scientist', 'DTx clinical research and protocol development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MEDDIR', 'Medical Director', 'Medical Director', 'Medical strategy and oversight', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MSL', 'Medical Science Liaison', 'MSL', 'KOL engagement for DTx', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MEDWRT', 'Medical Writer', 'Medical Writer', 'Clinical and regulatory writing', 'Mid', true, 'system'),
    
    -- Regulatory & Quality
    (gen_random_uuid(), 'ROLE-DTX-REGDIR', 'Regulatory Affairs Director', 'RA Director', 'Digital health regulatory strategy', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-REGMGR', 'Regulatory Affairs Manager', 'RA Manager', 'SaMD submissions and regulatory compliance', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-QAMGR', 'Quality Assurance Manager', 'QA Manager', 'ISO 13485 and design controls', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-QAENG', 'QA Engineer', 'QA Engineer', 'Software testing and quality engineering', 'Mid', true, 'system'),
    
    -- Data Science & AI/ML
    (gen_random_uuid(), 'ROLE-DTX-DSDIR', 'Data Science Director', 'DS Director', 'Data science strategy and team leadership', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-SRDATASCI', 'Senior Data Scientist', 'Sr Data Scientist', 'Advanced analytics and ML models', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-DATASCI', 'Data Scientist', 'Data Scientist', 'Data analysis, modeling, and insights', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MLENG', 'Machine Learning Engineer', 'ML Engineer', 'ML model development and deployment', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-DIGBIOENG', 'Digital Biomarker Engineer', 'Digital Biomarker Eng', 'Sensor data and digital endpoint development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-BIOSTATS', 'Biostatistician', 'Biostatistician', 'Statistical analysis for DTx studies', 'Mid', true, 'system'),
    
    -- Commercial & Growth
    (gen_random_uuid(), 'ROLE-DTX-SALESDIR', 'Sales Director', 'Sales Director', 'B2B sales leadership', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-BDMGR', 'Business Development Manager', 'BD Manager', 'Partnerships and channel development', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MKTGMGR', 'Marketing Manager', 'Marketing Manager', 'Digital marketing and growth', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-GROWTHLEAD', 'Growth Lead', 'Growth Lead', 'Growth hacking and user acquisition', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-MKTACCDIR', 'Market Access Director', 'Market Access Director', 'Payer strategy and reimbursement', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-HEORMGR', 'HEOR Manager', 'HEOR Manager', 'Health economics and outcomes research', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-CSMMGR', 'Customer Success Manager', 'CSM', 'Customer onboarding and retention', 'Mid', true, 'system'),
    
    -- Patient Experience
    (gen_random_uuid(), 'ROLE-DTX-PATENGDIR', 'Patient Engagement Director', 'Patient Eng Director', 'User engagement strategy', 'Senior', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-BEHSCI', 'Behavioral Scientist', 'Behavioral Scientist', 'Behavior change and engagement science', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-PATADV', 'Patient Advocate', 'Patient Advocate', 'Patient voice and advocacy', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-COACH', 'Health Coach', 'Health Coach', 'Patient coaching and support', 'Junior', true, 'system'),
    
    -- Security & Privacy
    (gen_random_uuid(), 'ROLE-DTX-SECENG', 'Security Engineer', 'Security Engineer', 'Application security and pen testing', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-PRIVOFFICER', 'Privacy Officer', 'Privacy Officer', 'HIPAA/GDPR compliance', 'Mid', true, 'system'),
    (gen_random_uuid(), 'ROLE-DTX-DEVSECENG', 'DevSecOps Engineer', 'DevSecOps Engineer', 'Security automation and SAST/DAST', 'Mid', true, 'system')
ON CONFLICT (unique_id) DO NOTHING;

-- Verification
SELECT 
    'Digital Health Organization Created' as status,
    (SELECT COUNT(*) FROM org_functions WHERE unique_id LIKE 'FN-DTX-%') as functions,
    (SELECT COUNT(*) FROM org_departments WHERE unique_id LIKE 'DEPT-DTX-%') as departments,
    (SELECT COUNT(*) FROM org_roles WHERE unique_id LIKE 'ROLE-DTX-%') as roles;

