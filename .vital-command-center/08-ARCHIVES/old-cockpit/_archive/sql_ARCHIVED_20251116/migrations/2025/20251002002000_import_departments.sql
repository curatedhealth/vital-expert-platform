-- =====================================================
-- VITAL Path - Import Departments from CSV
-- =====================================================
-- Description: Imports 35 departments with proper function mappings
-- Author: System
-- Date: 2025-10-02
-- =====================================================

BEGIN;

-- Drug Discovery
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-001', 'VP-DEPT-5', 'Drug Discovery',
       'Target identification, lead generation, and optimization of drug candidates',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-001');

-- Preclinical Development
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-002', 'VP-DEPT-6', 'Preclinical Development',
       'In vitro and in vivo studies, toxicology, DMPK, and early formulation development',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-002');

-- Translational Medicine
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-003', 'VP-DEPT-7', 'Translational Medicine',
       'Bridge between preclinical and clinical, biomarker development, and patient stratification',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-003');

-- Clinical Operations
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-004', 'VP-DEPT-8', 'Clinical Operations',
       'Clinical trial execution, site management, patient recruitment, and monitoring',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-004');

-- Clinical Development
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-005', 'VP-DEPT-9', 'Clinical Development',
       'Study design, protocol development, medical monitoring, and therapeutic area strategy',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-005');

-- Data Management
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-006', 'VP-DEPT-10', 'Data Management',
       'Clinical data collection, cleaning, database management, and CDISC standards',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-006');

-- Biostatistics
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-007', 'VP-DEPT-11', 'Biostatistics',
       'Statistical analysis plans, sample size calculations, and clinical study reports',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-007');

-- Global Regulatory
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-008', 'VP-DEPT-12', 'Global Regulatory',
       'Regulatory strategy, submissions (IND/NDA/MAA), and health authority interactions',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-008');

-- Regulatory CMC
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-009', 'VP-DEPT-13', 'Regulatory CMC',
       'Chemistry, manufacturing, and controls regulatory documentation and compliance',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-009');

-- Regulatory Intelligence
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-010', 'VP-DEPT-14', 'Regulatory Intelligence',
       'Monitoring regulatory landscape, competitive intelligence, and policy analysis',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-010');

-- Drug Substance
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-011', 'VP-DEPT-15', 'Drug Substance',
       'API manufacturing, process development, scale-up, and technology transfer',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-011');

-- Drug Product
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-012', 'VP-DEPT-16', 'Drug Product',
       'Formulation development, packaging, stability studies, and analytical development',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-012');

-- Supply Chain
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-013', 'VP-DEPT-17', 'Supply Chain',
       'Demand planning, supply planning, distribution, and cold chain management',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-013');

-- Quality Assurance
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-014', 'VP-DEPT-18', 'Quality Assurance',
       'Quality systems, SOP management, validation, audits, and CAPA management',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-014');

-- Quality Control
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-015', 'VP-DEPT-19', 'Quality Control',
       'Release testing, raw material testing, environmental monitoring, and stability testing',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-015');

-- Quality Compliance
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-016', 'VP-DEPT-20', 'Quality Compliance',
       'GxP compliance, data integrity, computer validation, and inspection readiness',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-016');

-- Medical Science Liaisons
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-017', 'VP-DEPT-21', 'Medical Science Liaisons',
       'KOL engagement, scientific exchange, advisory boards, and field medical activities',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-017');

-- Medical Information
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-018', 'VP-DEPT-22', 'Medical Information',
       'Response to medical inquiries, literature services, and standard response documents',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-018');

-- Medical Communications
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-019', 'VP-DEPT-23', 'Medical Communications',
       'Publication planning, congress management, medical education, and digital content',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-019');

-- Drug Safety
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-020', 'VP-DEPT-24', 'Drug Safety',
       'Adverse event processing, signal detection, safety database management, and reporting',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-020');

-- Risk Management
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-021', 'VP-DEPT-25', 'Risk Management',
       'Risk management plans, REMS development, risk minimization, and safety communications',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-021');

-- Epidemiology
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-022', 'VP-DEPT-26', 'Epidemiology',
       'Real-world evidence studies, observational research, and post-marketing surveillance',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-022');

-- Marketing
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-023', 'VP-DEPT-27', 'Marketing',
       'Brand strategy, launch planning, promotional materials, and digital marketing',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-023');

-- Sales
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-024', 'VP-DEPT-28', 'Sales',
       'Field sales force, territory management, key account management, and sales training',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-024');

-- Market Access
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-025', 'VP-DEPT-29', 'Market Access',
       'Pricing strategy, reimbursement, payer negotiations, and access strategies',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-025');

-- HEOR
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-026', 'VP-DEPT-30', 'HEOR',
       'Health economics modeling, outcomes research, HTA submissions, and value demonstration',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-026');

-- BD&L
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-027', 'VP-DEPT-31', 'BD&L',
       'In-licensing, out-licensing, partnerships, M&A evaluation, and deal structuring',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-027');

-- Strategic Planning
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-028', 'VP-DEPT-32', 'Strategic Planning',
       'Corporate strategy, portfolio planning, competitive analysis, and market assessment',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-028');

-- Legal Affairs
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-029', 'VP-DEPT-33', 'Legal Affairs',
       'Legal counsel, patent strategy, contracts, compliance oversight, and IP protection',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-029');

-- Finance & Accounting
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-030', 'VP-DEPT-34', 'Finance & Accounting',
       'Financial planning, budgeting, cost accounting, treasury, and financial reporting',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-030');

-- Information Technology
INSERT INTO org_departments (unique_id, department_id, department_name, description, function_id, migration_ready, created_by, updated_by)
SELECT 'DEPT-031', 'VP-DEPT-35', 'Information Technology',
       'IT infrastructure, digital strategy, data analytics, cybersecurity, and system integration',
       (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012'),
       FALSE, 'Hicham Naim', 'Hicham Naim'
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE unique_id = 'DEPT-031');

COMMIT;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Departments imported successfully: % rows', (SELECT COUNT(*) FROM org_departments);
    RAISE NOTICE 'Next step: Update roles with department and function references';
END $$;
