-- =====================================================================
-- Populate Organizational Structure Data
-- Inserts business functions, departments, and roles into the new
-- org_functions, org_departments, and org_roles tables
-- =====================================================================

-- =====================================================================
-- 1. INSERT BUSINESS FUNCTIONS (org_functions)
-- =====================================================================

INSERT INTO org_functions (unique_id, department_name, description, migration_ready) VALUES
('regulatory-affairs', 'Regulatory Affairs', 'FDA, EMA, and global regulatory guidance and submissions. Manages regulatory strategy, submissions, and compliance.', true),
('clinical-development', 'Clinical Development', 'Clinical trial design, execution, and management. Oversees clinical operations, biostatistics, and data management.', true),
('medical-affairs', 'Medical Affairs', 'Medical information, medical writing, publications, and medical science liaison activities.', true),
('commercial', 'Commercial', 'Market access, HEOR, payer relations, and value & access strategies for product commercialization.', true),
('safety', 'Safety', 'Pharmacovigilance, drug safety monitoring, signal detection, and risk management.', true),
('quality', 'Quality', 'Quality management systems, quality control, compliance, and auditing for GMP and regulatory standards.', true)
ON CONFLICT (unique_id) DO UPDATE SET
    department_name = EXCLUDED.department_name,
    description = EXCLUDED.description,
    migration_ready = EXCLUDED.migration_ready,
    updated_at = NOW();

-- =====================================================================
-- 2. INSERT DEPARTMENTS (org_departments)
-- =====================================================================

-- Get function IDs for reference
DO $$
DECLARE
    reg_affairs_id UUID;
    clinical_dev_id UUID;
    medical_affairs_id UUID;
    commercial_id UUID;
    safety_id UUID;
    quality_id UUID;
BEGIN
    -- Get function IDs
    SELECT id INTO reg_affairs_id FROM org_functions WHERE unique_id = 'regulatory-affairs';
    SELECT id INTO clinical_dev_id FROM org_functions WHERE unique_id = 'clinical-development';
    SELECT id INTO medical_affairs_id FROM org_functions WHERE unique_id = 'medical-affairs';
    SELECT id INTO commercial_id FROM org_functions WHERE unique_id = 'commercial';
    SELECT id INTO safety_id FROM org_functions WHERE unique_id = 'safety';
    SELECT id INTO quality_id FROM org_functions WHERE unique_id = 'quality';

    -- Regulatory Affairs Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('reg-strategy', 'Regulatory Strategy', 'Regulatory Affairs', reg_affairs_id, 'Strategic regulatory planning and pathway development', true),
    ('reg-operations', 'Regulatory Operations', 'Regulatory Affairs', reg_affairs_id, 'Day-to-day regulatory submissions and filings', true),
    ('reg-intelligence', 'Regulatory Intelligence', 'Regulatory Affairs', reg_affairs_id, 'Competitive intelligence and regulatory landscape monitoring', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Clinical Development Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('clinical-ops', 'Clinical Operations', 'Clinical Development', clinical_dev_id, 'Clinical trial execution and site management', true),
    ('clinical-science', 'Clinical Science', 'Clinical Development', clinical_dev_id, 'Medical monitoring and clinical strategy', true),
    ('biostatistics', 'Biostatistics', 'Clinical Development', clinical_dev_id, 'Statistical analysis and programming', true),
    ('data-mgmt', 'Data Management', 'Clinical Development', clinical_dev_id, 'Clinical data collection and database management', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Medical Affairs Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('med-info', 'Medical Information', 'Medical Affairs', medical_affairs_id, 'Medical information requests and scientific support', true),
    ('med-writing', 'Medical Writing', 'Medical Affairs', medical_affairs_id, 'Clinical and regulatory document preparation', true),
    ('publications', 'Publications', 'Medical Affairs', medical_affairs_id, 'Scientific publications and communications', true),
    ('msl', 'Medical Science Liaison', 'Medical Affairs', medical_affairs_id, 'Field-based medical education and KOL engagement', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Commercial Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('market-access', 'Market Access', 'Commercial', commercial_id, 'Market access strategy and execution', true),
    ('heor', 'HEOR', 'Commercial', commercial_id, 'Health economics and outcomes research', true),
    ('payer-relations', 'Payer Relations', 'Commercial', commercial_id, 'Payer contracting and account management', true),
    ('value-access', 'Value & Access', 'Commercial', commercial_id, 'Value dossiers and access strategy', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Safety Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('pharmacovigilance', 'Pharmacovigilance', 'Safety', safety_id, 'Adverse event monitoring and safety reporting', true),
    ('drug-safety', 'Drug Safety', 'Safety', safety_id, 'Drug safety assessment and management', true),
    ('signal-detection', 'Signal Detection', 'Safety', safety_id, 'Safety signal identification and evaluation', true),
    ('risk-mgmt', 'Risk Management', 'Safety', safety_id, 'Risk management planning and execution', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Quality Departments
    INSERT INTO org_departments (unique_id, department_name, function_area, function_id, description, migration_ready) VALUES
    ('qms', 'Quality Management Systems', 'Quality', quality_id, 'QMS architecture and ISO 13485 compliance', true),
    ('qc', 'Quality Control', 'Quality', quality_id, 'Quality control testing and validation', true),
    ('compliance-audit', 'Compliance & Auditing', 'Quality', quality_id, 'Compliance oversight and internal audits', true),
    ('qa', 'Quality Assurance', 'Quality', quality_id, 'Quality assurance and GMP compliance', true)
    ON CONFLICT (unique_id) DO UPDATE SET
        department_name = EXCLUDED.department_name,
        function_area = EXCLUDED.function_area,
        function_id = EXCLUDED.function_id,
        description = EXCLUDED.description,
        updated_at = NOW();
END $$;

-- =====================================================================
-- 3. INSERT ROLES (org_roles)
-- =====================================================================

DO $$
DECLARE
    dept_id UUID;
    func_id UUID;
BEGIN
    -- Regulatory Affairs Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'regulatory-affairs';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'reg-strategy';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('reg-strategy-director', 'Strategy Director', 'Regulatory Affairs', 'Regulatory Strategy', func_id, dept_id, 'Director', true),
    ('reg-strategist', 'Regulatory Strategist', 'Regulatory Affairs', 'Regulatory Strategy', func_id, dept_id, 'Senior', true),
    ('sr-reg-mgr', 'Senior Regulatory Affairs Manager', 'Regulatory Affairs', 'Regulatory Strategy', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'reg-operations';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('reg-affairs-mgr', 'Regulatory Affairs Manager', 'Regulatory Affairs', 'Regulatory Operations', func_id, dept_id, 'Mid', true),
    ('reg-specialist', 'Regulatory Specialist', 'Regulatory Affairs', 'Regulatory Operations', func_id, dept_id, 'Mid', true),
    ('reg-coordinator', 'Regulatory Coordinator', 'Regulatory Affairs', 'Regulatory Operations', func_id, dept_id, 'Junior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'reg-intelligence';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('reg-intel-mgr', 'Regulatory Intelligence Manager', 'Regulatory Affairs', 'Regulatory Intelligence', func_id, dept_id, 'Senior', true),
    ('intel-analyst', 'Intelligence Analyst', 'Regulatory Affairs', 'Regulatory Intelligence', func_id, dept_id, 'Mid', true),
    ('comp-intel-specialist', 'Competitive Intelligence Specialist', 'Regulatory Affairs', 'Regulatory Intelligence', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    -- Clinical Development Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'clinical-development';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'clinical-ops';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('clinical-ops-mgr', 'Clinical Operations Manager', 'Clinical Development', 'Clinical Operations', func_id, dept_id, 'Senior', true),
    ('cra', 'Clinical Research Associate', 'Clinical Development', 'Clinical Operations', func_id, dept_id, 'Mid', true),
    ('cra-supervisor', 'CRA Supervisor', 'Clinical Development', 'Clinical Operations', func_id, dept_id, 'Senior', true),
    ('clinical-trial-mgr', 'Clinical Trial Manager', 'Clinical Development', 'Clinical Operations', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'clinical-science';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('medical-director', 'Medical Director', 'Clinical Development', 'Clinical Science', func_id, dept_id, 'Director', true),
    ('clinical-scientist', 'Clinical Scientist', 'Clinical Development', 'Clinical Science', func_id, dept_id, 'Senior', true),
    ('clinical-pharmacologist', 'Clinical Pharmacologist', 'Clinical Development', 'Clinical Science', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'biostatistics';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('biostatistician', 'Biostatistician', 'Clinical Development', 'Biostatistics', func_id, dept_id, 'Mid', true),
    ('sr-biostatistician', 'Senior Biostatistician', 'Clinical Development', 'Biostatistics', func_id, dept_id, 'Senior', true),
    ('stat-programmer', 'Statistical Programmer', 'Clinical Development', 'Biostatistics', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'data-mgmt';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('data-manager', 'Data Manager', 'Clinical Development', 'Data Management', func_id, dept_id, 'Senior', true),
    ('clinical-data-coord', 'Clinical Data Coordinator', 'Clinical Development', 'Data Management', func_id, dept_id, 'Mid', true),
    ('db-admin', 'Database Administrator', 'Clinical Development', 'Data Management', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    -- Medical Affairs Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'medical-affairs';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'med-info';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('med-info-specialist', 'Medical Information Specialist', 'Medical Affairs', 'Medical Information', func_id, dept_id, 'Mid', true),
    ('med-info-mgr', 'Medical Information Manager', 'Medical Affairs', 'Medical Information', func_id, dept_id, 'Senior', true),
    ('sr-med-reviewer', 'Senior Medical Reviewer', 'Medical Affairs', 'Medical Information', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'med-writing';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('medical-writer', 'Medical Writer', 'Medical Affairs', 'Medical Writing', func_id, dept_id, 'Mid', true),
    ('sr-medical-writer', 'Senior Medical Writer', 'Medical Affairs', 'Medical Writing', func_id, dept_id, 'Senior', true),
    ('med-writing-mgr', 'Medical Writing Manager', 'Medical Affairs', 'Medical Writing', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'publications';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('publications-mgr', 'Publications Manager', 'Medical Affairs', 'Publications', func_id, dept_id, 'Senior', true),
    ('publications-specialist', 'Publications Specialist', 'Medical Affairs', 'Publications', func_id, dept_id, 'Mid', true),
    ('sci-comm-lead', 'Scientific Communications Lead', 'Medical Affairs', 'Publications', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'msl';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('msl', 'MSL', 'Medical Affairs', 'Medical Science Liaison', func_id, dept_id, 'Mid', true),
    ('sr-msl', 'Senior MSL', 'Medical Affairs', 'Medical Science Liaison', func_id, dept_id, 'Senior', true),
    ('msl-mgr', 'MSL Manager', 'Medical Affairs', 'Medical Science Liaison', func_id, dept_id, 'Senior', true),
    ('field-med-director', 'Field Medical Director', 'Medical Affairs', 'Medical Science Liaison', func_id, dept_id, 'Director', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    -- Commercial Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'commercial';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'market-access';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('market-access-director', 'Market Access Director', 'Commercial', 'Market Access', func_id, dept_id, 'Director', true),
    ('market-access-mgr', 'Market Access Manager', 'Commercial', 'Market Access', func_id, dept_id, 'Senior', true),
    ('reimbursement-specialist', 'Reimbursement Specialist', 'Commercial', 'Market Access', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'heor';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('heor-director', 'HEOR Director', 'Commercial', 'HEOR', func_id, dept_id, 'Director', true),
    ('heor-mgr', 'HEOR Manager', 'Commercial', 'HEOR', func_id, dept_id, 'Senior', true),
    ('health-econ-analyst', 'Health Economics Analyst', 'Commercial', 'HEOR', func_id, dept_id, 'Mid', true),
    ('outcomes-research-scientist', 'Outcomes Research Scientist', 'Commercial', 'HEOR', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'payer-relations';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('payer-relations-mgr', 'Payer Relations Manager', 'Commercial', 'Payer Relations', func_id, dept_id, 'Senior', true),
    ('account-mgr', 'Account Manager', 'Commercial', 'Payer Relations', func_id, dept_id, 'Mid', true),
    ('contracting-specialist', 'Contracting Specialist', 'Commercial', 'Payer Relations', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'value-access';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('value-access-lead', 'Value & Access Lead', 'Commercial', 'Value & Access', func_id, dept_id, 'Senior', true),
    ('value-dossier-mgr', 'Value Dossier Manager', 'Commercial', 'Value & Access', func_id, dept_id, 'Senior', true),
    ('access-strategy-mgr', 'Access Strategy Manager', 'Commercial', 'Value & Access', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    -- Safety Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'safety';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'pharmacovigilance';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('pv-director', 'Pharmacovigilance Director', 'Safety', 'Pharmacovigilance', func_id, dept_id, 'Director', true),
    ('pv-mgr', 'Pharmacovigilance Manager', 'Safety', 'Pharmacovigilance', func_id, dept_id, 'Senior', true),
    ('pv-specialist', 'PV Specialist', 'Safety', 'Pharmacovigilance', func_id, dept_id, 'Mid', true),
    ('safety-scientist', 'Safety Scientist', 'Safety', 'Pharmacovigilance', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'drug-safety';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('drug-safety-officer', 'Drug Safety Officer', 'Safety', 'Drug Safety', func_id, dept_id, 'Senior', true),
    ('safety-physician', 'Safety Physician', 'Safety', 'Drug Safety', func_id, dept_id, 'Senior', true),
    ('drug-safety-associate', 'Drug Safety Associate', 'Safety', 'Drug Safety', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'signal-detection';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('signal-detection-mgr', 'Signal Detection Manager', 'Safety', 'Signal Detection', func_id, dept_id, 'Senior', true),
    ('safety-signal-analyst', 'Safety Signal Analyst', 'Safety', 'Signal Detection', func_id, dept_id, 'Mid', true),
    ('safety-data-analyst', 'Safety Data Analyst', 'Safety', 'Signal Detection', func_id, dept_id, 'Mid', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'risk-mgmt';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('risk-mgmt-mgr', 'Risk Management Manager', 'Safety', 'Risk Management', func_id, dept_id, 'Senior', true),
    ('risk-mgmt-specialist', 'Risk Management Specialist', 'Safety', 'Risk Management', func_id, dept_id, 'Mid', true),
    ('rmp-lead', 'RMP Lead', 'Safety', 'Risk Management', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    -- Quality Roles
    SELECT id INTO func_id FROM org_functions WHERE unique_id = 'quality';

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'qms';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('qms-architect', 'QMS Architect', 'Quality', 'Quality Management Systems', func_id, dept_id, 'Senior', true),
    ('qms-mgr', 'QMS Manager', 'Quality', 'Quality Management Systems', func_id, dept_id, 'Senior', true),
    ('iso-13485-specialist', 'ISO 13485 Specialist', 'Quality', 'Quality Management Systems', func_id, dept_id, 'Mid', true),
    ('design-controls-lead', 'Design Controls Lead', 'Quality', 'Quality Management Systems', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'qc';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('quality-analyst', 'Quality Analyst', 'Quality', 'Quality Control', func_id, dept_id, 'Mid', true),
    ('qc-mgr', 'QC Manager', 'Quality', 'Quality Control', func_id, dept_id, 'Senior', true),
    ('testing-specialist', 'Testing Specialist', 'Quality', 'Quality Control', func_id, dept_id, 'Mid', true),
    ('validation-engineer', 'Validation Engineer', 'Quality', 'Quality Control', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'compliance-audit';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('compliance-officer', 'Compliance Officer', 'Quality', 'Compliance & Auditing', func_id, dept_id, 'Senior', true),
    ('internal-auditor', 'Internal Auditor', 'Quality', 'Compliance & Auditing', func_id, dept_id, 'Mid', true),
    ('reg-compliance-specialist', 'Regulatory Compliance Specialist', 'Quality', 'Compliance & Auditing', func_id, dept_id, 'Mid', true),
    ('audit-mgr', 'Audit Manager', 'Quality', 'Compliance & Auditing', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

    SELECT id INTO dept_id FROM org_departments WHERE unique_id = 'qa';
    INSERT INTO org_roles (unique_id, role_name, function_area, department_name, function_id, department_id, seniority_level, is_active) VALUES
    ('qa-mgr', 'QA Manager', 'Quality', 'Quality Assurance', func_id, dept_id, 'Senior', true),
    ('qa-specialist', 'Quality Assurance Specialist', 'Quality', 'Quality Assurance', func_id, dept_id, 'Mid', true),
    ('qa-lead', 'QA Lead', 'Quality', 'Quality Assurance', func_id, dept_id, 'Senior', true),
    ('sr-specialist', 'Senior Specialist', 'Quality', 'Quality Assurance', func_id, dept_id, 'Senior', true)
    ON CONFLICT (unique_id) DO UPDATE SET role_name = EXCLUDED.role_name, updated_at = NOW();

END $$;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify data was inserted
DO $$
DECLARE
    func_count INT;
    dept_count INT;
    role_count INT;
BEGIN
    SELECT COUNT(*) INTO func_count FROM org_functions;
    SELECT COUNT(*) INTO dept_count FROM org_departments;
    SELECT COUNT(*) INTO role_count FROM org_roles;

    RAISE NOTICE 'Organizational Structure Population Complete:';
    RAISE NOTICE '  Functions: % records', func_count;
    RAISE NOTICE '  Departments: % records', dept_count;
    RAISE NOTICE '  Roles: % records', role_count;
END $$;
