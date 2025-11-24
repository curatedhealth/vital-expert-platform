-- =====================================================
-- VITAL Path - Organizational Structure Migration
-- =====================================================
-- Description: Creates the complete organizational hierarchy:
--   - org_functions (12 business functions)
--   - org_departments (35 departments)
--   - org_roles (126 roles)
--   - org_responsibilities (500+ responsibilities)
-- Author: System
-- Date: 2025-10-02
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE FUNCTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS org_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    migration_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- =====================================================
-- 2. CREATE DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    department_id VARCHAR(50),
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    department_type VARCHAR(100),
    function_area TEXT,
    compliance_requirements TEXT,
    critical_systems TEXT,
    data_classification VARCHAR(100),
    migration_ready BOOLEAN DEFAULT FALSE,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- =====================================================
-- 3. CREATE ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS org_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. CREATE RESPONSIBILITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS org_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mapped_to_vital_path_use_cases TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. CREATE JUNCTION TABLES FOR MANY-TO-MANY RELATIONSHIPS
-- =====================================================

-- Roles to Responsibilities (many-to-many)
CREATE TABLE IF NOT EXISTS role_responsibilities (
    role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
    responsibility_id UUID REFERENCES org_responsibilities(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, responsibility_id)
);

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_org_departments_function_id ON org_departments(function_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_department_id ON org_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_function_id ON org_roles(function_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_role_id ON role_responsibilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_responsibilities_responsibility_id ON role_responsibilities(responsibility_id);

-- =====================================================
-- 7. UPDATE AGENTS TABLE TO REFERENCE ORG STRUCTURE
-- =====================================================

-- Add foreign key columns to agents table (if they don't exist)
DO $$
BEGIN
    -- Add function_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'function_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL;
    END IF;

    -- Add department_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'department_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;
    END IF;

    -- Add role_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes on agents foreign keys
CREATE INDEX IF NOT EXISTS idx_agents_function_id ON agents(function_id);
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_role_id ON agents(role_id);

-- =====================================================
-- 8. INSERT FUNCTIONS DATA (12 business functions)
-- =====================================================
INSERT INTO org_functions (unique_id, department_name, description, migration_ready, created_by, updated_by) VALUES
('FUNC-001', 'Research & Development', 'Drug discovery, preclinical and translational research activities focused on identifying and developing new therapeutic candidates', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-002', 'Clinical Development', 'Planning, execution, and management of clinical trials from Phase I through Phase IV, including data management and biostatistics', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-003', 'Regulatory Affairs', 'Regulatory strategy, submissions, compliance, and interaction with global health authorities', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-004', 'Manufacturing', 'Drug substance and product manufacturing, supply chain management, and distribution', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-005', 'Quality', 'Quality assurance, quality control, compliance, and validation across all GxP areas', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-006', 'Medical Affairs', 'Scientific engagement, medical information, publications, and KOL management', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-007', 'Pharmacovigilance', 'Drug safety monitoring, signal detection, risk management, and adverse event reporting', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-008', 'Commercial', 'Marketing, sales, market access, pricing, reimbursement, and health economics', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-009', 'Business Development', 'Licensing, partnerships, M&A, portfolio management, and strategic planning', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-010', 'Legal', 'Legal affairs, intellectual property, contracts, compliance, and litigation management', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-011', 'Finance', 'Financial planning, accounting, treasury, budgeting, and financial reporting', FALSE, 'Hicham Naim', 'Hicham Naim'),
('FUNC-012', 'IT/Digital', 'Information technology, digital transformation, data analytics, and cybersecurity', FALSE, 'Hicham Naim', 'Hicham Naim')
ON CONFLICT (unique_id) DO NOTHING;

-- =====================================================
-- 9. INSERT DEPARTMENTS DATA (35 departments)
-- =====================================================
INSERT INTO org_departments (unique_id, department_id, department_name, description, department_type, function_area, compliance_requirements, critical_systems, data_classification, migration_ready, function_id, created_by, updated_by)
SELECT
    'DEPT-001', 'VP-DEPT-5', 'Drug Discovery',
    'Target identification, lead generation, and optimization of drug candidates',
    NULL, NULL, NULL, NULL, NULL, FALSE,
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'),
    'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-001');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-002', 'VP-DEPT-6', 'Preclinical Development',
    'In vitro and in vivo studies, toxicology, DMPK, and early formulation development',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-002');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-003', 'VP-DEPT-7', 'Translational Medicine',
    'Bridge between preclinical and clinical, biomarker development, and patient stratification',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-003');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-004', 'VP-DEPT-8', 'Clinical Operations',
    'Clinical trial execution, site management, patient recruitment, and monitoring',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-004');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-005', 'VP-DEPT-9', 'Clinical Development',
    'Study design, protocol development, medical monitoring, and therapeutic area strategy',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-005');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-006', 'VP-DEPT-10', 'Data Management',
    'Clinical data collection, cleaning, database management, and CDISC standards',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-006');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-007', 'VP-DEPT-11', 'Biostatistics',
    'Statistical analysis plans, sample size calculations, and clinical study reports',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-007');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-008', 'VP-DEPT-12', 'Global Regulatory',
    'Regulatory strategy, submissions (IND/NDA/MAA), and health authority interactions',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-008');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-009', 'VP-DEPT-13', 'Regulatory CMC',
    'Chemistry, manufacturing, and controls regulatory documentation and compliance',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-009');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-010', 'VP-DEPT-14', 'Regulatory Intelligence',
    'Monitoring regulatory landscape, competitive intelligence, and policy analysis',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-010');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-011', 'VP-DEPT-15', 'Drug Substance',
    'API manufacturing, process development, scale-up, and technology transfer',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-011');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-012', 'VP-DEPT-16', 'Drug Product',
    'Formulation development, packaging, stability studies, and analytical development',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-012');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-013', 'VP-DEPT-17', 'Supply Chain',
    'Demand planning, supply planning, distribution, and cold chain management',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-013');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-014', 'VP-DEPT-18', 'Quality Assurance',
    'Quality systems, SOP management, validation, audits, and CAPA management',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-014');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-015', 'VP-DEPT-19', 'Quality Control',
    'Release testing, raw material testing, environmental monitoring, and stability testing',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-015');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-016', 'VP-DEPT-20', 'Quality Compliance',
    'GxP compliance, data integrity, computer validation, and inspection readiness',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-016');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-017', 'VP-DEPT-21', 'Medical Science Liaisons',
    'KOL engagement, scientific exchange, advisory boards, and field medical activities',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-017');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-018', 'VP-DEPT-22', 'Medical Information',
    'Response to medical inquiries, literature services, and standard response documents',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-018');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-019', 'VP-DEPT-23', 'Medical Communications',
    'Publication planning, congress management, medical education, and digital content',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-019');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-020', 'VP-DEPT-24', 'Drug Safety',
    'Adverse event processing, signal detection, safety database management, and reporting',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-020');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-021', 'VP-DEPT-25', 'Risk Management',
    'Risk management plans, REMS development, risk minimization, and safety communications',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-021');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-022', 'VP-DEPT-26', 'Epidemiology',
    'Real-world evidence studies, observational research, and post-marketing surveillance',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-022');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-023', 'VP-DEPT-27', 'Marketing',
    'Brand strategy, launch planning, promotional materials, and digital marketing',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-023');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-024', 'VP-DEPT-28', 'Sales',
    'Field sales force, territory management, key account management, and sales training',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-024');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-025', 'VP-DEPT-29', 'Market Access',
    'Pricing strategy, reimbursement, payer negotiations, and access strategies',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-025');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-026', 'VP-DEPT-30', 'HEOR',
    'Health economics modeling, outcomes research, HTA submissions, and value demonstration',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-026');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-027', 'VP-DEPT-31', 'BD&L',
    'In-licensing, out-licensing, partnerships, M&A evaluation, and deal structuring',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-027');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-028', 'VP-DEPT-32', 'Strategic Planning',
    'Corporate strategy, portfolio planning, competitive analysis, and market assessment',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-028');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-029', 'VP-DEPT-33', 'Legal Affairs',
    'Legal counsel, patent strategy, contracts, compliance oversight, and IP protection',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-029');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-030', 'VP-DEPT-34', 'Finance & Accounting',
    'Financial planning, budgeting, cost accounting, treasury, and financial reporting',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-030');

INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT
    'DEPT-031', 'VP-DEPT-35', 'Information Technology',
    'IT infrastructure, digital strategy, data analytics, cybersecurity, and system integration',
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012'), FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-031');

-- Launch departments (special case - from the CSV)
INSERT INTO org_departments (unique_id, department_id, department_name, department_type, function_area, compliance_requirements, critical_systems, data_classification, migration_ready, created_by, updated_by)
SELECT
    'DEPT-032', 'VP-DEPT-1', 'Launch Excellence Office',
    'Commercial', 'Operational, Revenue Generating, Strategic',
    'FDA Part 11, GxP, HIPAA', 'CRM, DMS, ERP', 'Confidential', TRUE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-032');

INSERT INTO org_departments (unique_id, department_id, department_name, department_type, function_area, compliance_requirements, critical_systems, data_classification, migration_ready, function_id, created_by, updated_by)
SELECT
    'DEPT-033', 'VP-DEPT-2', 'Market Access & Reimbursement',
    'Commercial', 'Revenue Generating, Strategic',
    'FDA Part 11, HIPAA', 'CRM, DMS', 'Confidential', TRUE,
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'), 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-033');

INSERT INTO org_departments (unique_id, department_id, department_name, department_type, function_area, compliance_requirements, critical_systems, data_classification, migration_ready, function_id, created_by, updated_by)
SELECT
    'DEPT-034', 'VP-DEPT-3', 'Medical Affairs - Launch',
    'Medical Affairs', 'Compliance, Strategic, Technical',
    'FDA Part 11, GxP, HIPAA', 'CRM, DMS, EDC', 'Restricted', TRUE,
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'), 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-034');

INSERT INTO org_departments (unique_id, department_id, department_name, department_type, function_area, compliance_requirements, critical_systems, data_classification, migration_ready, function_id, created_by, updated_by)
SELECT
    'DEPT-035', 'VP-DEPT-4', 'Supply Chain - Launch Operations',
    'Commercial', 'Operational, Technical',
    'FDA Part 11, GxP, ISO 13485', 'ERP, LIMS, QMS', 'Internal', TRUE,
    (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'), 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-035');

COMMIT;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Organizational structure tables created successfully';
    RAISE NOTICE 'Functions: % rows', (SELECT COUNT(*) FROM org_functions);
    RAISE NOTICE 'Departments: % rows', (SELECT COUNT(*) FROM org_departments);
    RAISE NOTICE 'Ready for roles and responsibilities data import';
END $$;
