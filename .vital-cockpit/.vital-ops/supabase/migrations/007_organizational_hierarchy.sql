-- ============================================================================
-- Migration 007: Organizational Hierarchy & Tenant Mapping
-- ============================================================================
-- Creates organizational structure tables and maps all agents
-- Structure: TENANTS → AGENTS
--            DEPARTMENTS → FUNCTIONS → ROLES → AGENTS
--            PERSONAS → ROLES → AGENTS
-- ============================================================================

BEGIN;

-- ============================================================================
-- TENANT TABLES
-- ============================================================================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent-Tenant mapping (M:M)
CREATE TABLE IF NOT EXISTS agent_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_tenant UNIQUE(agent_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tenants_agent ON agent_tenants(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tenants_tenant ON agent_tenants(tenant_id);

-- ============================================================================
-- SEED TENANTS
-- ============================================================================

INSERT INTO tenants (tenant_key, display_name, description) VALUES
('pharma', 'Pharmaceutical/Biotech', 'Traditional pharmaceutical and biotech companies')
ON CONFLICT (tenant_key) DO NOTHING;

INSERT INTO tenants (tenant_key, display_name, description) VALUES
('digital_health', 'Digital Health', 'Digital health startups and health tech companies')
ON CONFLICT (tenant_key) DO NOTHING;

-- ============================================================================
-- ORGANIZATIONAL TABLES
-- ============================================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Functions table (sub-units within departments)
CREATE TABLE IF NOT EXISTS functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    function_key TEXT NOT NULL UNIQUE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Roles table (specific job roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key TEXT NOT NULL UNIQUE,
    function_id UUID NOT NULL REFERENCES functions(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    seniority_level TEXT CHECK (seniority_level IN ('entry', 'mid', 'senior', 'lead', 'director', 'vp', 'executive')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Personas table (user personas)
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent-Role mapping (M:M)
CREATE TABLE IF NOT EXISTS agent_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_agent_role UNIQUE(agent_id, role_id)
);

-- Persona-Role mapping (M:M)
CREATE TABLE IF NOT EXISTS persona_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_persona_role UNIQUE(persona_id, role_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_functions_department ON functions(department_id);
CREATE INDEX IF NOT EXISTS idx_roles_function ON roles(function_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_agent ON agent_roles(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_roles_role ON agent_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_persona_roles_persona ON persona_roles(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_roles_role ON persona_roles(role_id);

-- ============================================================================
-- SEED DEPARTMENTS
-- ============================================================================

INSERT INTO departments (department_key, display_name, description) VALUES
('medical_affairs', 'Medical Affairs', 'Medical strategy, scientific communication, and evidence generation')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('regulatory_affairs', 'Regulatory Affairs', 'Regulatory strategy, submissions, and compliance')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('clinical_development', 'Clinical Development', 'Clinical trial design, execution, and data management')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('market_access', 'Market Access & HEOR', 'Health economics, outcomes research, payer strategy')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('manufacturing_cmc', 'Manufacturing & CMC', 'Chemistry, manufacturing, controls, and quality')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('commercial', 'Commercial', 'Marketing, sales, and brand management')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('research_development', 'Research & Development', 'Drug discovery and translational research')
ON CONFLICT (department_key) DO NOTHING;

INSERT INTO departments (department_key, display_name, description) VALUES
('operations', 'Operations & Project Management', 'Project management, workflow orchestration, coordination')
ON CONFLICT (department_key) DO NOTHING;

-- ============================================================================
-- SEED PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description) VALUES
('executive_leader', 'Executive Leader', 'VP/SVP/Director level strategic decision maker')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('functional_manager', 'Functional Manager', 'Manager of specific function or team')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('senior_expert', 'Senior Expert', 'Deep domain expert with 10+ years experience')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('specialist', 'Specialist', 'Focused specialist in narrow domain')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('analyst', 'Analyst', 'Data analyst or research analyst')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('coordinator', 'Coordinator', 'Operational coordinator')
ON CONFLICT (persona_key) DO NOTHING;

INSERT INTO personas (persona_key, display_name, description) VALUES
('strategist', 'Strategist', 'Strategic planner or advisor')
ON CONFLICT (persona_key) DO NOTHING;

-- ============================================================================
-- SEED FUNCTIONS (BY DEPARTMENT)
-- ============================================================================

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'HEOR, payer strategy, pricing, patient access', id, 'Heor, Payer Strategy, Pricing, Patient Access'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'HEOR', id, 'Heor'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'payer strategy', id, 'Payer Strategy'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Project management, orchestration', id, 'Project Management, Orchestration'
FROM departments WHERE department_key = 'operations'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'pricing', id, 'Pricing'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'patient access', id, 'Patient Access'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Project management', id, 'Project Management'
FROM departments WHERE department_key = 'operations'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Regulatory submissions, compliance', id, 'Regulatory Submissions, Compliance'
FROM departments WHERE department_key = 'regulatory_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'MSL', id, 'Msl'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Medical strategy, MSL, medical education', id, 'Medical Strategy, Msl, Medical Education'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'medical education', id, 'Medical Education'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Medical education', id, 'Medical Education'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'data management', id, 'Data Management'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'translational medicine', id, 'Translational Medicine'
FROM departments WHERE department_key = 'research_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Clinical trials, data management, safety', id, 'Clinical Trials, Data Management, Safety'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'quality', id, 'Quality'
FROM departments WHERE department_key = 'manufacturing_cmc'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Medical strategy', id, 'Medical Strategy'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'operations', id, 'Operations'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Brand', id, 'Brand'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'marketing', id, 'Marketing'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'orchestration', id, 'Orchestration'
FROM departments WHERE department_key = 'operations'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'compliance', id, 'Compliance'
FROM departments WHERE department_key = 'regulatory_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'CMC, quality, manufacturing', id, 'Cmc, Quality, Manufacturing'
FROM departments WHERE department_key = 'manufacturing_cmc'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'clinical trials', id, 'Clinical Trials'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'safety', id, 'Safety'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'market research', id, 'Market Research'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Drug discovery', id, 'Drug Discovery'
FROM departments WHERE department_key = 'research_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Genotoxicity assessment in clinical trials', id, 'Genotoxicity Assessment In Clinical Trials'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Drug discovery, translational medicine', id, 'Drug Discovery, Translational Medicine'
FROM departments WHERE department_key = 'research_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'KOL engagement and communication', id, 'Kol Engagement And Communication'
FROM departments WHERE department_key = 'medical_affairs'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'CMC', id, 'Cmc'
FROM departments WHERE department_key = 'manufacturing_cmc'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'sales', id, 'Sales'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'Reproductive Toxicology', id, 'Reproductive Toxicology'
FROM departments WHERE department_key = 'clinical_development'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'brand', id, 'Brand'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'analytics', id, 'Analytics'
FROM departments WHERE department_key = 'commercial'
ON CONFLICT (function_key) DO NOTHING;

INSERT INTO functions (function_key, department_id, display_name)
SELECT 'payers strategy', id, 'Payers Strategy'
FROM departments WHERE department_key = 'market_access'
ON CONFLICT (function_key) DO NOTHING;

-- ============================================================================
-- SEED ROLES
-- ============================================================================

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'heor_director', id, 'HEOR Director', 'director'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'health_economics_manager', id, 'Health Economics Manager', 'lead'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'outcomes_research_specialist', id, 'Outcomes Research Specialist', 'senior'
FROM functions WHERE function_key = 'HEOR'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'hta_submission_specialist', id, 'HTA Submission Specialist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'evidence_synthesis_lead', id, 'Evidence Synthesis Lead', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'heor_analyst', id, 'HEOR Analyst', 'mid'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'payer_strategy_director', id, 'Payer Strategy Director', 'director'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'national_account_director', id, 'National Account Director', 'director'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'contracting_strategy_lead', id, 'Contracting Strategy Lead', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'formulary_access_manager', id, 'Formulary Access Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'value_based_contracting_specialist', id, 'Value-Based Contracting Specialist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'contract_analyst', id, 'Contract Analyst', 'mid'
FROM functions WHERE function_key = 'Project management, orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pricing_strategy_director', id, 'Pricing Strategy Director', 'director'
FROM functions WHERE function_key = 'pricing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'global_pricing_lead', id, 'Global Pricing Lead', 'lead'
FROM functions WHERE function_key = 'pricing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'reimbursement_strategy_manager', id, 'Reimbursement Strategy Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pricing_analyst', id, 'Pricing Analyst', 'mid'
FROM functions WHERE function_key = 'pricing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'gross_to_net_analyst', id, 'Gross-to-Net Analyst', 'mid'
FROM functions WHERE function_key = 'pricing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'patient_access_director', id, 'Patient Access Director', 'director'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'hub_services_manager', id, 'Hub Services Manager', 'lead'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'prior_authorization_manager', id, 'Prior Authorization Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'copay_program_manager', id, 'Copay Program Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'patient_access_coordinator', id, 'Patient Access Coordinator', 'mid'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'policy_&_advocacy_director', id, 'Policy & Advocacy Director', 'director'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'government_affairs_manager', id, 'Government Affairs Manager', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'healthcare_policy_analyst', id, 'Healthcare Policy Analyst', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'market_access_communications_lead', id, 'Market Access Communications Lead', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'payer_marketing_manager', id, 'Payer Marketing Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'market_access_operations_director', id, 'Market Access Operations Director', 'director'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'access_analytics_manager', id, 'Access Analytics Manager', 'lead'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'market_access_data_analyst', id, 'Market Access Data Analyst', 'mid'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_science_liaison', id, 'Medical Science Liaison', 'senior'
FROM functions WHERE function_key = 'MSL'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regional_medical_director', id, 'Regional Medical Director', 'director'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'field_medical_trainer', id, 'Field Medical Trainer', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_information_specialist', id, 'Medical Information Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_librarian', id, 'Medical Librarian', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_content_manager', id, 'Medical Content Manager', 'lead'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'publication_strategy_lead', id, 'Publication Strategy Lead', 'lead'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_education_director', id, 'Medical Education Director', 'director'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_writer', id, 'Medical Writer', 'senior'
FROM functions WHERE function_key = 'Medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_writer___regulatory', id, 'Medical Writer - Regulatory', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_communications_manager', id, 'Medical Communications Manager', 'lead'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_editor', id, 'Medical Editor', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'congress_&_events_manager', id, 'Congress & Events Manager', 'lead'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'real_world_evidence_specialist', id, 'Real-World Evidence Specialist', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'health_economics_specialist', id, 'Health Economics Specialist', 'senior'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'biostatistician', id, 'Biostatistician', 'senior'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'epidemiologist', id, 'Epidemiologist', 'senior'
FROM functions WHERE function_key = 'translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'outcomes_research_manager', id, 'Outcomes Research Manager', 'lead'
FROM functions WHERE function_key = 'HEOR'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_study_liaison', id, 'Clinical Study Liaison', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_monitor', id, 'Medical Monitor', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_data_manager', id, 'Clinical Data Manager', 'lead'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_disclosure_manager', id, 'Clinical Trial Disclosure Manager', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_excellence_director', id, 'Medical Excellence Director', 'director'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_review_committee_coordinator', id, 'Medical Review Committee Coordinator', 'mid'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_quality_assurance_manager', id, 'Medical Quality Assurance Manager', 'lead'
FROM functions WHERE function_key = 'quality'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_affairs_strategist', id, 'Medical Affairs Strategist', 'senior'
FROM functions WHERE function_key = 'Medical strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'therapeutic_area_expert', id, 'Therapeutic Area Expert', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'global_medical_advisor', id, 'Global Medical Advisor', 'senior'
FROM functions WHERE function_key = 'Medical strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_affairs_operations_manager', id, 'Medical Affairs Operations Manager', 'lead'
FROM functions WHERE function_key = 'operations'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'brand_strategy_director', id, 'Brand Strategy Director', 'director'
FROM functions WHERE function_key = 'Brand'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'brand_manager', id, 'Brand Manager', 'lead'
FROM functions WHERE function_key = 'Brand'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'digital_strategy_director', id, 'Digital Strategy Director', 'director'
FROM functions WHERE function_key = 'Brand'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'marketing_analytics_director', id, 'Marketing Analytics Director', 'director'
FROM functions WHERE function_key = 'marketing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'project_coordinator', id, 'Project Coordinator', 'mid'
FROM functions WHERE function_key = 'orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_compliance_specialist', id, 'Regulatory Compliance Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_literature_researcher', id, 'Medical Literature Researcher', 'senior'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_affairs_specialist', id, 'Regulatory Affairs Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_designer', id, 'Clinical Trial Designer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'anticoagulation_specialist', id, 'Anticoagulation Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'hipaa_compliance_officer', id, 'HIPAA Compliance Officer', 'senior'
FROM functions WHERE function_key = 'compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'reimbursement_strategist', id, 'Reimbursement Strategist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'formulation_development_scientist', id, 'Formulation Development Scientist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pediatric_dosing_specialist', id, 'Pediatric Dosing Specialist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_affairs_strategist', id, 'Regulatory Affairs Strategist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'drug_information_specialist', id, 'Drug Information Specialist', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'oligonucleotide_therapy_specialist', id, 'Oligonucleotide Therapy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pharmacokinetics_specialist', id, 'Pharmacokinetics Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'nda/bla_coordinator', id, 'NDA/BLA Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'mass_spectrometry_imaging_specialist', id, 'Mass Spectrometry Imaging Specialist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'infectious_disease_pharmacist', id, 'Infectious Disease Pharmacist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'promotional_material_developer', id, 'Promotional Material Developer', 'senior'
FROM functions WHERE function_key = 'marketing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_intelligence_analyst', id, 'Regulatory Intelligence Analyst', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medication_reconciliation_specialist', id, 'Medication Reconciliation Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'validation_specialist', id, 'Validation Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'gmp_compliance_advisor', id, 'GMP Compliance Advisor', 'senior'
FROM functions WHERE function_key = 'compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_pharmacist', id, 'Clinical Pharmacist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'quality_systems_auditor', id, 'Quality Systems Auditor', 'senior'
FROM functions WHERE function_key = 'quality'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'psur/pbrer_writer', id, 'PSUR/PBRER Writer', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'immunosuppression_specialist', id, 'Immunosuppression Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pediatric_regulatory_advisor', id, 'Pediatric Regulatory Advisor', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_budget_manager', id, 'Clinical Trial Budget Manager', 'lead'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pain_management_specialist', id, 'Pain Management Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'cmc_regulatory_specialist', id, 'CMC Regulatory Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'supplier_quality_manager', id, 'Supplier Quality Manager', 'lead'
FROM functions WHERE function_key = 'quality'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_protocol_writer', id, 'Clinical Protocol Writer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'document_control_specialist', id, 'Document Control Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_strategy_advisor', id, 'Regulatory Strategy Advisor', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'study_closeout_specialist', id, 'Study Closeout Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_study_reviewer', id, 'Clinical Study Reviewer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_reporting_coordinator', id, 'Safety Reporting Coordinator', 'mid'
FROM functions WHERE function_key = 'safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'post_marketing_surveillance_coordinator', id, 'Post-Marketing Surveillance Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'equipment_qualification_specialist', id, 'Equipment Qualification Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pricing_strategy_advisor', id, 'Pricing Strategy Advisor', 'senior'
FROM functions WHERE function_key = 'pricing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'patient_reported_outcomes_specialist', id, 'Patient-Reported Outcomes Specialist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'companion_diagnostic_regulatory_specialist', id, 'Companion Diagnostic Regulatory Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_database_manager', id, 'Safety Database Manager', 'lead'
FROM functions WHERE function_key = 'safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'congress_planning_specialist', id, 'Congress Planning Specialist', 'senior'
FROM functions WHERE function_key = 'Project management, orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'vaccine_clinical_specialist', id, 'Vaccine Clinical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'aggregate_report_coordinator', id, 'Aggregate Report Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'reimbursement_analyst', id, 'Reimbursement Analyst', 'mid'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'oncology_clinical_specialist', id, 'Oncology Clinical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'gene_therapy_clinical_expert', id, 'Gene Therapy Clinical Expert', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'stability_study_designer', id, 'Stability Study Designer', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'sterile_manufacturing_specialist', id, 'Sterile Manufacturing Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'market_research_analyst', id, 'Market Research Analyst', 'mid'
FROM functions WHERE function_key = 'market research'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'omnichannel_marketing_strategist', id, 'Omnichannel Marketing Strategist', 'senior'
FROM functions WHERE function_key = 'marketing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'contract_manufacturing_manager', id, 'Contract Manufacturing Manager', 'lead'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'stem_cell_clinical_research_specialist', id, 'Stem Cell Clinical Research Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'oncolytic_virus_clinical_research_scientist', id, 'Oncolytic Virus Clinical Research Scientist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_operations_coordinator', id, 'Clinical Operations Coordinator', 'mid'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'companion_diagnostic_developer', id, 'Companion Diagnostic Developer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'digital_therapeutic_specialist', id, 'Digital Therapeutic Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'intranasal_delivery_specialist', id, 'Intranasal Delivery Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'formulary_strategy_specialist', id, 'Formulary Strategy Specialist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'ai_drug_discovery_specialist', id, 'AI Drug Discovery Specialist', 'senior'
FROM functions WHERE function_key = 'Drug discovery'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'genotoxicity_specialist', id, 'Genotoxicity Specialist', 'senior'
FROM functions WHERE function_key = 'Genotoxicity assessment in clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'distribution_network_designer', id, 'Distribution Network Designer', 'senior'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_simulation_expert', id, 'Clinical Trial Simulation Expert', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'peptide_therapeutics_specialist', id, 'Peptide Therapeutics Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'antibody_drug_conjugate_specialist', id, 'Antibody-Drug Conjugate Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'radiopharmaceutical_specialist', id, 'Radiopharmaceutical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'senolytic_therapy_specialist', id, 'Senolytic Therapy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'site_selection_advisor', id, 'Site Selection Advisor', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'patient_recruitment_strategist', id, 'Patient Recruitment Strategist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'quality_metrics_analyst', id, 'Quality Metrics Analyst', 'mid'
FROM functions WHERE function_key = 'quality'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'evidence_generation_planner', id, 'Evidence Generation Planner', 'senior'
FROM functions WHERE function_key = 'Drug discovery, translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'materials_management_coordinator', id, 'Materials Management Coordinator', 'mid'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'payer_strategy_advisor', id, 'Payer Strategy Advisor', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'biomarker_strategy_advisor', id, 'Biomarker Strategy Advisor', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_lifecycle_manager', id, 'Regulatory Lifecycle Manager', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'excipient_compatibility_expert', id, 'Excipient Compatibility Expert', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'carcinogenicity_study_designer', id, 'Carcinogenicity Study Designer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_study_planner', id, 'Clinical Study Planner', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT '3rs_implementation_specialist', id, '3Rs Implementation Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'in_vitro_model_specialist', id, 'In Vitro Model Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'digital_marketing_strategist', id, 'Digital Marketing Strategist', 'senior'
FROM functions WHERE function_key = 'marketing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'inventory_optimization_specialist', id, 'Inventory Optimization Specialist', 'senior'
FROM functions WHERE function_key = 'Project management, orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'benefit_risk_assessor', id, 'Benefit-Risk Assessor', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'machine_learning_engineer', id, 'Machine Learning Engineer', 'senior'
FROM functions WHERE function_key = 'Drug discovery, translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_labeling_specialist', id, 'Safety Labeling Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'data_visualization_specialist', id, 'Data Visualization Specialist', 'senior'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'etl_developer', id, 'ETL Developer', 'senior'
FROM functions WHERE function_key = 'Project management, orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'gene_therapy_clinical_research_scientist', id, 'Gene Therapy Clinical Research Scientist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'ethics_committee_liaison', id, 'Ethics Committee Liaison', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'production_scheduler', id, 'Production Scheduler', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'rna_interference_specialist', id, 'RNA Interference Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'endpoint_committee_coordinator', id, 'Endpoint Committee Coordinator', 'mid'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_communication_specialist', id, 'Safety Communication Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_manager', id, 'Clinical Trial Manager', 'lead'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT '3d_bioprinting_specialist', id, '3D Bioprinting Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'crispr_therapeutic_specialist', id, 'CRISPR Therapeutic Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'neurodegenerative_disease_clinical_research_specialist', id, 'Neurodegenerative Disease Clinical Research Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'manufacturing_capacity_planner', id, 'Manufacturing Capacity Planner', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'multi_omics_integration_specialist', id, 'Multi-Omics Integration Specialist', 'senior'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'managed_care_contracting_specialist', id, 'Managed Care Contracting Specialist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_affairs_metrics_analyst', id, 'Medical Affairs Metrics Analyst', 'mid'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_pharmacologist', id, 'Clinical Pharmacologist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_submissions_quality_lead', id, 'Regulatory Submissions Quality Lead', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'kol_engagement_coordinator', id, 'KOL Engagement Coordinator', 'mid'
FROM functions WHERE function_key = 'KOL engagement and communication'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_research_scientist', id, 'Clinical Research Scientist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'process_optimization_analyst', id, 'Process Optimization Analyst', 'mid'
FROM functions WHERE function_key = 'CMC'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_imaging_specialist', id, 'Clinical Imaging Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'global_regulatory_strategist', id, 'Global Regulatory Strategist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'publication_planner', id, 'Publication Planner', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'scale_up_specialist', id, 'Scale-Up Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'value_dossier_developer', id, 'Value Dossier Developer', 'senior'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'combination_product_specialist', id, 'Combination Product Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'cleaning_validation_specialist', id, 'Cleaning Validation Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pediatric_clinical_specialist', id, 'Pediatric Clinical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_risk_assessment_specialist', id, 'Regulatory Risk Assessment Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'translational_medicine_specialist', id, 'Translational Medicine Specialist', 'senior'
FROM functions WHERE function_key = 'translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'manufacturing_deviation_specialist', id, 'Manufacturing Deviation Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'prior_authorization_specialist', id, 'Prior Authorization Specialist', 'senior'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'risk_benefit_assessment_specialist', id, 'Risk-Benefit Assessment Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'basket/umbrella_trial_specialist', id, 'Basket/Umbrella Trial Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_affairs_lead', id, 'Regulatory Affairs Lead', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'demand_analyst', id, 'Demand Analyst', 'mid'
FROM functions WHERE function_key = 'HEOR'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'regulatory_strategist', id, 'Regulatory Strategist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'analytical_method_developer', id, 'Analytical Method Developer', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medication_therapy_advisor', id, 'Medication Therapy Advisor', 'senior'
FROM functions WHERE function_key = 'Medical strategy, MSL, medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'quality_by_design_specialist', id, 'Quality by Design Specialist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'signal_detection_analyst', id, 'Signal Detection Analyst', 'mid'
FROM functions WHERE function_key = 'safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'territory_design_specialist', id, 'Territory Design Specialist', 'senior'
FROM functions WHERE function_key = 'sales'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'post_marketing_commitment_coordinator', id, 'Post-Marketing Commitment Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'organ_on_chip_specialist', id, 'Organ-on-Chip Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'quantum_chemistry_specialist', id, 'Quantum Chemistry Specialist', 'senior'
FROM functions WHERE function_key = 'Drug discovery'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'process_development_engineer', id, 'Process Development Engineer', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'toxicology_study_designer', id, 'Toxicology Study Designer', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'supplier_relationship_manager', id, 'Supplier Relationship Manager', 'lead'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'medical_affairs_commercial_liaison', id, 'Medical Affairs Commercial Liaison', 'senior'
FROM functions WHERE function_key = 'Medical strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'biomarker_validation_specialist', id, 'Biomarker Validation Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'drug_substance_characterization_specialist', id, 'Drug Substance Characterization Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'immunotoxicology_specialist', id, 'Immunotoxicology Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'study_coordinator', id, 'Study Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'transportation_manager', id, 'Transportation Manager', 'lead'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'continuous_manufacturing_specialist', id, 'Continuous Manufacturing Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'reproductive_toxicology_specialist', id, 'Reproductive Toxicology Specialist', 'senior'
FROM functions WHERE function_key = 'Reproductive Toxicology'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'payor_account_strategist', id, 'Payor Account Strategist', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'returns_&_recall_coordinator', id, 'Returns & Recall Coordinator', 'mid'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'dmpk_specialist', id, 'DMPK Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_trial_transparency_officer', id, 'Clinical Trial Transparency Officer', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'product_launch_strategist', id, 'Product Launch Strategist', 'senior'
FROM functions WHERE function_key = 'brand'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'key_account_manager', id, 'Key Account Manager', 'lead'
FROM functions WHERE function_key = 'sales'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'import/export_compliance_specialist', id, 'Import/Export Compliance Specialist', 'senior'
FROM functions WHERE function_key = 'compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'car_t_cell_therapy_specialist', id, 'CAR-T Cell Therapy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'sales_force_effectiveness_analyst', id, 'Sales Force Effectiveness Analyst', 'mid'
FROM functions WHERE function_key = 'sales'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'serialization_&_track_trace_specialist', id, 'Serialization & Track-Trace Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'evidence_synthesis_specialist', id, 'Evidence Synthesis Specialist', 'senior'
FROM functions WHERE function_key = 'Drug discovery, translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'customer_insights_analyst', id, 'Customer Insights Analyst', 'mid'
FROM functions WHERE function_key = 'analytics'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'supply_chain_risk_manager', id, 'Supply Chain Risk Manager', 'lead'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'ai/ml_model_validator', id, 'AI/ML Model Validator', 'senior'
FROM functions WHERE function_key = 'Drug discovery, translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'warehouse_operations_specialist', id, 'Warehouse Operations Specialist', 'senior'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'statistical_programmer', id, 'Statistical Programmer', 'senior'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'batch_record_reviewer', id, 'Batch Record Reviewer', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pharmacogenomics_specialist', id, 'Pharmacogenomics Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'predictive_modeling_specialist', id, 'Predictive Modeling Specialist', 'senior'
FROM functions WHERE function_key = 'Drug discovery, translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'compliance_officer', id, 'Compliance Officer', 'senior'
FROM functions WHERE function_key = 'compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_data_scientist', id, 'Clinical Data Scientist', 'senior'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'personalized_medicine_specialist', id, 'Personalized Medicine Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'global_trade_compliance_specialist', id, 'Global Trade Compliance Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'metabolic_reprogramming_specialist', id, 'Metabolic Reprogramming Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'business_intelligence_analyst', id, 'Business Intelligence Analyst', 'mid'
FROM functions WHERE function_key = 'analytics'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'privacy_officer', id, 'Privacy Officer', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'clinical_research_specialist', id, 'Clinical Research Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'spatial_transcriptomics_specialist', id, 'Spatial Transcriptomics Specialist', 'senior'
FROM functions WHERE function_key = 'translational medicine'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'formulary_advisor', id, 'Formulary Advisor', 'senior'
FROM functions WHERE function_key = 'payer strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'oncology_medication_specialist', id, 'Oncology Medication Specialist', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'ind_application_specialist', id, 'IND Application Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'informed_consent_specialist', id, 'Informed Consent Specialist', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'deviation_investigator', id, 'Deviation Investigator', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'capa_coordinator', id, 'CAPA Coordinator', 'mid'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'change_control_manager', id, 'Change Control Manager', 'lead'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'training_coordinator', id, 'Training Coordinator', 'mid'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_signal_evaluator', id, 'Safety Signal Evaluator', 'senior'
FROM functions WHERE function_key = 'safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'advisory_board_organizer', id, 'Advisory Board Organizer', 'senior'
FROM functions WHERE function_key = 'medical education'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'needs_assessment_coordinator', id, 'Needs Assessment Coordinator', 'mid'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'technology_transfer_coordinator', id, 'Technology Transfer Coordinator', 'mid'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'health_economics_outcomes_research_analyst', id, 'Health Economics Outcomes Research Analyst', 'mid'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'dsmb_liaison', id, 'DSMB Liaison', 'senior'
FROM functions WHERE function_key = 'clinical trials'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'real_world_evidence_analyst', id, 'Real-World Evidence Analyst', 'mid'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'geriatric_clinical_specialist', id, 'Geriatric Clinical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'cell_therapy_clinical_specialist', id, 'Cell Therapy Clinical Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'post_approval_change_manager', id, 'Post-Approval Change Manager', 'lead'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'biosimilar_regulatory_specialist', id, 'Biosimilar Regulatory Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'international_regulatory_affairs_specialist', id, 'International Regulatory Affairs Specialist', 'senior'
FROM functions WHERE function_key = 'Regulatory submissions, compliance'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'pharmaceutical_technology_specialist', id, 'Pharmaceutical Technology Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'container_closure_specialist', id, 'Container Closure Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'lyophilization_specialist', id, 'Lyophilization Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'safety_pharmacology_expert', id, 'Safety Pharmacology Expert', 'senior'
FROM functions WHERE function_key = 'safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'bioanalytical_method_developer', id, 'Bioanalytical Method Developer', 'senior'
FROM functions WHERE function_key = 'CMC'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'in_vivo_model_specialist', id, 'In Vivo Model Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'competitive_intelligence_specialist', id, 'Competitive Intelligence Specialist', 'senior'
FROM functions WHERE function_key = 'payers strategy'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'patient_advocacy_manager', id, 'Patient Advocacy Manager', 'lead'
FROM functions WHERE function_key = 'patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'cold_chain_specialist', id, 'Cold Chain Specialist', 'senior'
FROM functions WHERE function_key = 'CMC, quality, manufacturing'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'procurement_strategist', id, 'Procurement Strategist', 'senior'
FROM functions WHERE function_key = 'Project management, orchestration'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'supply_planning_analyst', id, 'Supply Planning Analyst', 'mid'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'real_world_data_analyst', id, 'Real-World Data Analyst', 'mid'
FROM functions WHERE function_key = 'data management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'data_quality_analyst', id, 'Data Quality Analyst', 'mid'
FROM functions WHERE function_key = 'Project management'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'population_health_analyst', id, 'Population Health Analyst', 'mid'
FROM functions WHERE function_key = 'HEOR, payer strategy, pricing, patient access'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'rare_disease_specialist', id, 'Rare Disease Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'bispecific_antibody_specialist', id, 'Bispecific Antibody Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'tissue_engineering_specialist', id, 'Tissue Engineering Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'microbiome_clinical_research_scientist', id, 'Microbiome Clinical Research Scientist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'exosome_therapy_specialist', id, 'Exosome Therapy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'liquid_biopsy_specialist', id, 'Liquid Biopsy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'epigenetic_therapy_specialist', id, 'Epigenetic Therapy Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'fragment_based_drug_design_specialist', id, 'Fragment-Based Drug Design Specialist', 'senior'
FROM functions WHERE function_key = 'Drug discovery'
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO roles (role_key, function_id, display_name, seniority_level)
SELECT 'single_cell_analysis_specialist', id, 'Single-Cell Analysis Specialist', 'senior'
FROM functions WHERE function_key = 'Clinical trials, data management, safety'
ON CONFLICT (role_key) DO NOTHING;

-- ============================================================================
-- UPDATE AGENT NAMES WITH TIER PREFIX
-- ============================================================================

UPDATE agents SET name = 'Expert - HEOR Director' WHERE name = 'HEOR Director';
UPDATE agents SET name = 'EXPERT - Health Economics Manager' WHERE name = 'Health Economics Manager';
UPDATE agents SET name = 'EXPERT - Outcomes Research Specialist' WHERE name = 'Outcomes Research Specialist';
UPDATE agents SET name = 'EXPERT - HTA Submission Specialist' WHERE name = 'HTA Submission Specialist';
UPDATE agents SET name = 'EXPERT - Evidence Synthesis Lead' WHERE name = 'Evidence Synthesis Lead';
UPDATE agents SET name = 'SPECIALIST - HEOR Analyst' WHERE name = 'HEOR Analyst';
UPDATE agents SET name = 'Expert - Payer Strategy Director' WHERE name = 'Payer Strategy Director';
UPDATE agents SET name = 'EXPERT - National Account Director' WHERE name = 'National Account Director';
UPDATE agents SET name = 'EXPERT - Contracting Strategy Lead' WHERE name = 'Contracting Strategy Lead';
UPDATE agents SET name = 'EXPERT - Formulary Access Manager' WHERE name = 'Formulary Access Manager';
UPDATE agents SET name = 'EXPERT - Value-Based Contracting Specialist' WHERE name = 'Value-Based Contracting Specialist';
UPDATE agents SET name = 'SPECIALIST - Contract Analyst' WHERE name = 'Contract Analyst';
UPDATE agents SET name = 'EXPERT - Pricing Strategy Director' WHERE name = 'Pricing Strategy Director';
UPDATE agents SET name = 'EXPERT - Global Pricing Lead' WHERE name = 'Global Pricing Lead';
UPDATE agents SET name = 'EXPERT - Reimbursement Strategy Manager' WHERE name = 'Reimbursement Strategy Manager';
UPDATE agents SET name = 'Specialist - Pricing Analyst' WHERE name = 'Pricing Analyst';
UPDATE agents SET name = 'SPECIALIST - Gross-to-Net Analyst' WHERE name = 'Gross-to-Net Analyst';
UPDATE agents SET name = 'EXPERT - Patient Access Director' WHERE name = 'Patient Access Director';
UPDATE agents SET name = 'WORKER - Hub Services Manager' WHERE name = 'Hub Services Manager';
UPDATE agents SET name = 'EXPERT - Prior Authorization Manager' WHERE name = 'Prior Authorization Manager';
UPDATE agents SET name = 'EXPERT - Copay Program Manager' WHERE name = 'Copay Program Manager';
UPDATE agents SET name = 'SPECIALIST - Patient Access Coordinator' WHERE name = 'Patient Access Coordinator';
UPDATE agents SET name = 'EXPERT - Policy & Advocacy Director' WHERE name = 'Policy & Advocacy Director';
UPDATE agents SET name = 'EXPERT - Government Affairs Manager' WHERE name = 'Government Affairs Manager';
UPDATE agents SET name = 'EXPERT - Healthcare Policy Analyst' WHERE name = 'Healthcare Policy Analyst';
UPDATE agents SET name = 'EXPERT - Market Access Communications Lead' WHERE name = 'Market Access Communications Lead';
UPDATE agents SET name = 'SPECIALIST - Payer Marketing Manager' WHERE name = 'Payer Marketing Manager';
UPDATE agents SET name = 'EXPERT - Market Access Operations Director' WHERE name = 'Market Access Operations Director';
UPDATE agents SET name = 'EXPERT - Access Analytics Manager' WHERE name = 'Access Analytics Manager';
UPDATE agents SET name = 'SPECIALIST - Market Access Data Analyst' WHERE name = 'Market Access Data Analyst';
UPDATE agents SET name = 'EXPERT - Medical Science Liaison Advisor' WHERE name = 'Medical Science Liaison Advisor';
UPDATE agents SET name = 'EXPERT - Regional Medical Director' WHERE name = 'Regional Medical Director';
UPDATE agents SET name = 'EXPERT - Therapeutic Area MSL Lead' WHERE name = 'Therapeutic Area MSL Lead';
UPDATE agents SET name = 'SPECIALIST - Field Medical Trainer' WHERE name = 'Field Medical Trainer';
UPDATE agents SET name = 'EXPERT - Medical Information Specialist' WHERE name = 'Medical Information Specialist';
UPDATE agents SET name = 'SPECIALIST - Medical Librarian' WHERE name = 'Medical Librarian';
UPDATE agents SET name = 'EXPERT - Medical Content Manager' WHERE name = 'Medical Content Manager';
UPDATE agents SET name = 'EXPERT - Publication Strategy Lead' WHERE name = 'Publication Strategy Lead';
UPDATE agents SET name = 'EXPERT - Medical Education Director' WHERE name = 'Medical Education Director';
UPDATE agents SET name = 'SPECIALIST - Medical Writer - Scientific' WHERE name = 'Medical Writer - Scientific';
UPDATE agents SET name = 'EXPERT - Medical Writer - Regulatory' WHERE name = 'Medical Writer - Regulatory';
UPDATE agents SET name = 'EXPERT - Medical Communications Manager' WHERE name = 'Medical Communications Manager';
UPDATE agents SET name = 'EXPERT - Medical Editor' WHERE name = 'Medical Editor';
UPDATE agents SET name = 'SPECIALIST - Congress & Events Manager' WHERE name = 'Congress & Events Manager';
UPDATE agents SET name = 'EXPERT - Real-World Evidence Specialist' WHERE name = 'Real-World Evidence Specialist';
UPDATE agents SET name = 'EXPERT - Health Economics Specialist' WHERE name = 'Health Economics Specialist';
UPDATE agents SET name = 'Expert - Biostatistician' WHERE name = 'Biostatistician';
UPDATE agents SET name = 'EXPERT - Epidemiologist' WHERE name = 'Epidemiologist';
UPDATE agents SET name = 'EXPERT - Outcomes Research Manager' WHERE name = 'Outcomes Research Manager';
UPDATE agents SET name = 'Expert - Clinical Study Liaison' WHERE name = 'Clinical Study Liaison';
UPDATE agents SET name = 'Expert - Medical Monitor' WHERE name = 'Medical Monitor';
UPDATE agents SET name = 'EXPERT - Clinical Data Manager' WHERE name = 'Clinical Data Manager';
UPDATE agents SET name = 'EXPERT - Clinical Trial Disclosure Manager' WHERE name = 'Clinical Trial Disclosure Manager';
UPDATE agents SET name = 'EXPERT - Medical Excellence Director' WHERE name = 'Medical Excellence Director';
UPDATE agents SET name = 'SPECIALIST - Medical Review Committee Coordinator' WHERE name = 'Medical Review Committee Coordinator';
UPDATE agents SET name = 'EXPERT - Medical Quality Assurance Manager' WHERE name = 'Medical Quality Assurance Manager';
UPDATE agents SET name = 'EXPERT - Medical Affairs Strategist' WHERE name = 'Medical Affairs Strategist';
UPDATE agents SET name = 'Expert - Therapeutic Area Expert' WHERE name = 'Therapeutic Area Expert';
UPDATE agents SET name = 'EXPERT - Global Medical Advisor' WHERE name = 'Global Medical Advisor';
UPDATE agents SET name = 'WORKER - Medical Affairs Operations Manager' WHERE name = 'Medical Affairs Operations Manager';
UPDATE agents SET name = 'Expert - Brand Strategy Director' WHERE name = 'Brand Strategy Director';
UPDATE agents SET name = 'WORKER - Brand Manager' WHERE name = 'Brand Manager';
UPDATE agents SET name = 'EXPERT - Digital Strategy Director' WHERE name = 'Digital Strategy Director';
UPDATE agents SET name = 'EXPERT - Marketing Analytics Director' WHERE name = 'Marketing Analytics Director';
UPDATE agents SET name = 'MASTER - Workflow Orchestration Agent' WHERE name = 'Workflow Orchestration Agent';
UPDATE agents SET name = 'WORKER - Project Coordination Agent' WHERE name = 'Project Coordination Agent';
UPDATE agents SET name = 'SPECIALIST - Clinical Data Analyst Agent' WHERE name = 'Clinical Data Analyst Agent';
UPDATE agents SET name = 'EXPERT - Regulatory Compliance Validator' WHERE name = 'Regulatory Compliance Validator';
UPDATE agents SET name = 'SPECIALIST - Medical Literature Researcher' WHERE name = 'Medical Literature Researcher';
UPDATE agents SET name = 'SPECIALIST - Document Generator' WHERE name = 'Document Generator';
UPDATE agents SET name = 'EXPERT - Safety Signal Detector' WHERE name = 'Safety Signal Detector';
UPDATE agents SET name = 'EXPERT - Clinical Trial Protocol Designer' WHERE name = 'Clinical Trial Protocol Designer';
UPDATE agents SET name = 'Expert - Anticoagulation Specialist' WHERE name = 'Anticoagulation Specialist';
UPDATE agents SET name = 'Expert - Clinical Trial Designer' WHERE name = 'Clinical Trial Designer';
UPDATE agents SET name = 'EXPERT - HIPAA Compliance Officer' WHERE name = 'HIPAA Compliance Officer';
UPDATE agents SET name = 'EXPERT - Reimbursement Strategist' WHERE name = 'Reimbursement Strategist';
UPDATE agents SET name = 'SPECIALIST - formulation_development_scientist' WHERE name = 'formulation_development_scientist';
UPDATE agents SET name = 'EXPERT - Pediatric Dosing Specialist' WHERE name = 'Pediatric Dosing Specialist';
UPDATE agents SET name = 'EXPERT - Accelerated Approval Strategist' WHERE name = 'Accelerated Approval Strategist';
UPDATE agents SET name = 'Expert - comparability_study_designer' WHERE name = 'comparability_study_designer';
UPDATE agents SET name = 'EXPERT - Drug Information Specialist' WHERE name = 'Drug Information Specialist';
UPDATE agents SET name = 'EXPERT - oligonucleotide_therapy_specialist' WHERE name = 'oligonucleotide_therapy_specialist';
UPDATE agents SET name = 'Expert - Pharmacokinetics Advisor' WHERE name = 'Pharmacokinetics Advisor';
UPDATE agents SET name = 'EXPERT - NDA/BLA Coordinator' WHERE name = 'NDA/BLA Coordinator';
UPDATE agents SET name = 'SPECIALIST - Dosing Calculator' WHERE name = 'Dosing Calculator';
UPDATE agents SET name = 'Expert - Mass Spectrometry Imaging Expert' WHERE name = 'Mass Spectrometry Imaging Expert';
UPDATE agents SET name = 'EXPERT - Infectious Disease Pharmacist' WHERE name = 'Infectious Disease Pharmacist';
UPDATE agents SET name = 'SPECIALIST - Promotional Material Developer' WHERE name = 'Promotional Material Developer';
UPDATE agents SET name = 'EXPERT - Regulatory Intelligence Analyst' WHERE name = 'Regulatory Intelligence Analyst';
UPDATE agents SET name = 'EXPERT - Medication Reconciliation Assistant' WHERE name = 'Medication Reconciliation Assistant';
UPDATE agents SET name = 'Expert - Validation Specialist' WHERE name = 'Validation Specialist';
UPDATE agents SET name = 'Expert - GMP Compliance Advisor' WHERE name = 'GMP Compliance Advisor';
UPDATE agents SET name = 'EXPERT - Geriatric Medication Specialist' WHERE name = 'Geriatric Medication Specialist';
UPDATE agents SET name = 'Expert - Quality Systems Auditor' WHERE name = 'Quality Systems Auditor';
UPDATE agents SET name = 'EXPERT - PSUR/PBRER Writer' WHERE name = 'PSUR/PBRER Writer';
UPDATE agents SET name = 'SPECIALIST - Immunosuppression Specialist' WHERE name = 'Immunosuppression Specialist';
UPDATE agents SET name = 'EXPERT - Pediatric Regulatory Advisor' WHERE name = 'Pediatric Regulatory Advisor';
UPDATE agents SET name = 'EXPERT - Clinical Trial Budget Estimator' WHERE name = 'Clinical Trial Budget Estimator';
UPDATE agents SET name = 'SPECIALIST - Pain Management Specialist' WHERE name = 'Pain Management Specialist';
UPDATE agents SET name = 'EXPERT - CMC Regulatory Specialist' WHERE name = 'CMC Regulatory Specialist';
UPDATE agents SET name = 'EXPERT - Supplier Quality Manager' WHERE name = 'Supplier Quality Manager';
UPDATE agents SET name = 'EXPERT - Breakthrough Therapy Advisor' WHERE name = 'Breakthrough Therapy Advisor';
UPDATE agents SET name = 'Expert - Clinical Protocol Writer' WHERE name = 'Clinical Protocol Writer';
UPDATE agents SET name = 'SPECIALIST - Document Control Specialist' WHERE name = 'Document Control Specialist';
UPDATE agents SET name = 'Expert - Regulatory Strategy Advisor' WHERE name = 'Regulatory Strategy Advisor';
UPDATE agents SET name = 'EXPERT - Study Closeout Specialist' WHERE name = 'Study Closeout Specialist';
UPDATE agents SET name = 'EXPERT - Investigator-Initiated Study Reviewer' WHERE name = 'Investigator-Initiated Study Reviewer';
UPDATE agents SET name = 'SPECIALIST - Safety Reporting Coordinator' WHERE name = 'Safety Reporting Coordinator';
UPDATE agents SET name = 'SPECIALIST - Post-Marketing Surveillance Coordinator' WHERE name = 'Post-Marketing Surveillance Coordinator';
UPDATE agents SET name = 'Expert - Equipment Qualification Specialist' WHERE name = 'Equipment Qualification Specialist';
UPDATE agents SET name = 'Expert - Pricing Strategy Advisor' WHERE name = 'Pricing Strategy Advisor';
UPDATE agents SET name = 'Expert - Patient-Reported Outcomes Specialist' WHERE name = 'Patient-Reported Outcomes Specialist';
UPDATE agents SET name = 'EXPERT - Companion Diagnostic Regulatory Specialist' WHERE name = 'Companion Diagnostic Regulatory Specialist';
UPDATE agents SET name = 'EXPERT - Safety Database Manager' WHERE name = 'Safety Database Manager';
UPDATE agents SET name = 'Expert - Congress Planning Specialist' WHERE name = 'Congress Planning Specialist';
UPDATE agents SET name = 'EXPERT - Vaccine Clinical Specialist' WHERE name = 'Vaccine Clinical Specialist';
UPDATE agents SET name = 'SPECIALIST - Aggregate Report Coordinator' WHERE name = 'Aggregate Report Coordinator';
UPDATE agents SET name = 'SPECIALIST - Medical Science Liaison Coordinator' WHERE name = 'Medical Science Liaison Coordinator';
UPDATE agents SET name = 'SPECIALIST - Reimbursement Analyst' WHERE name = 'Reimbursement Analyst';
UPDATE agents SET name = 'EXPERT - Oncology Clinical Specialist' WHERE name = 'Oncology Clinical Specialist';
UPDATE agents SET name = 'Expert - Gene Therapy Clinical Expert' WHERE name = 'Gene Therapy Clinical Expert';
UPDATE agents SET name = 'EXPERT - Stability Study Designer' WHERE name = 'Stability Study Designer';
UPDATE agents SET name = 'Expert - Impurity Assessment Expert' WHERE name = 'Impurity Assessment Expert';
UPDATE agents SET name = 'EXPERT - Sterile Manufacturing Specialist' WHERE name = 'Sterile Manufacturing Specialist';
UPDATE agents SET name = 'SPECIALIST - Market Research Analyst' WHERE name = 'Market Research Analyst';
UPDATE agents SET name = 'EXPERT - Omnichannel Strategist' WHERE name = 'Omnichannel Strategist';
UPDATE agents SET name = 'EXPERT - Contract Manufacturing Manager' WHERE name = 'Contract Manufacturing Manager';
UPDATE agents SET name = 'EXPERT - Database Architect' WHERE name = 'Database Architect';
UPDATE agents SET name = 'Expert - Stem Cell Therapy Expert' WHERE name = 'Stem Cell Therapy Expert';
UPDATE agents SET name = 'Expert - Oncolytic Virus Expert' WHERE name = 'Oncolytic Virus Expert';
UPDATE agents SET name = 'SPECIALIST - Clinical Operations Coordinator' WHERE name = 'Clinical Operations Coordinator';
UPDATE agents SET name = 'EXPERT - Companion Diagnostic Developer' WHERE name = 'Companion Diagnostic Developer';
UPDATE agents SET name = 'Expert - Digital Therapeutic Specialist' WHERE name = 'Digital Therapeutic Specialist';
UPDATE agents SET name = 'EXPERT - Intranasal Delivery Expert' WHERE name = 'Intranasal Delivery Expert';
UPDATE agents SET name = 'Expert - Formulary Strategy Specialist' WHERE name = 'Formulary Strategy Specialist';
UPDATE agents SET name = 'EXPERT - AI Drug Discovery Specialist' WHERE name = 'AI Drug Discovery Specialist';
UPDATE agents SET name = 'SPECIALIST - Genotoxicity Specialist' WHERE name = 'Genotoxicity Specialist';
UPDATE agents SET name = 'Expert - Distribution Network Designer' WHERE name = 'Distribution Network Designer';
UPDATE agents SET name = 'Expert - Clinical Trial Simulation Expert' WHERE name = 'Clinical Trial Simulation Expert';
UPDATE agents SET name = 'EXPERT - Peptide Therapeutics Specialist' WHERE name = 'Peptide Therapeutics Specialist';
UPDATE agents SET name = 'EXPERT - Antibody-Drug Conjugate Specialist' WHERE name = 'Antibody-Drug Conjugate Specialist';
UPDATE agents SET name = 'Expert - Radiopharmaceutical Specialist' WHERE name = 'Radiopharmaceutical Specialist';
UPDATE agents SET name = 'Expert - Senolytic Therapy Specialist' WHERE name = 'Senolytic Therapy Specialist';
UPDATE agents SET name = 'EXPERT - FDA Guidance Interpreter' WHERE name = 'FDA Guidance Interpreter';
UPDATE agents SET name = 'EXPERT - Site Selection Advisor' WHERE name = 'Site Selection Advisor';
UPDATE agents SET name = 'EXPERT - Patient Recruitment Strategist' WHERE name = 'Patient Recruitment Strategist';
UPDATE agents SET name = 'SPECIALIST - Quality Metrics Analyst' WHERE name = 'Quality Metrics Analyst';
UPDATE agents SET name = 'EXPERT - Evidence Generation Planner' WHERE name = 'Evidence Generation Planner';
UPDATE agents SET name = 'SPECIALIST - Materials Management Coordinator' WHERE name = 'Materials Management Coordinator';
UPDATE agents SET name = 'Expert - Payer Strategy Advisor' WHERE name = 'Payer Strategy Advisor';
UPDATE agents SET name = 'EXPERT - Biomarker Strategy Advisor' WHERE name = 'Biomarker Strategy Advisor';
UPDATE agents SET name = 'EXPERT - Regulatory Lifecycle Manager' WHERE name = 'Regulatory Lifecycle Manager';
UPDATE agents SET name = 'Expert - Regulatory Dossier Architect' WHERE name = 'Regulatory Dossier Architect';
UPDATE agents SET name = 'Expert - Excipient Compatibility Expert' WHERE name = 'Excipient Compatibility Expert';
UPDATE agents SET name = 'EXPERT - Carcinogenicity Study Designer' WHERE name = 'Carcinogenicity Study Designer';
UPDATE agents SET name = 'SPECIALIST - Pharmacology Study Planner' WHERE name = 'Pharmacology Study Planner';
UPDATE agents SET name = 'EXPERT - 3Rs Implementation Specialist' WHERE name = '3Rs Implementation Specialist';
UPDATE agents SET name = 'SPECIALIST - In Vitro Model Specialist' WHERE name = 'In Vitro Model Specialist';
UPDATE agents SET name = 'EXPERT - Digital Marketing Strategist' WHERE name = 'Digital Marketing Strategist';
UPDATE agents SET name = 'SPECIALIST - Inventory Optimization Specialist' WHERE name = 'Inventory Optimization Specialist';
UPDATE agents SET name = 'Expert - Benefit-Risk Assessor' WHERE name = 'Benefit-Risk Assessor';
UPDATE agents SET name = 'SPECIALIST - Machine Learning Engineer' WHERE name = 'Machine Learning Engineer';
UPDATE agents SET name = 'Expert - In Silico Clinical Trial Expert' WHERE name = 'In Silico Clinical Trial Expert';
UPDATE agents SET name = 'Expert - Safety Labeling Specialist' WHERE name = 'Safety Labeling Specialist';
UPDATE agents SET name = 'SPECIALIST - Data Visualization Specialist' WHERE name = 'Data Visualization Specialist';
UPDATE agents SET name = 'SPECIALIST - ETL Developer' WHERE name = 'ETL Developer';
UPDATE agents SET name = 'Expert - Gene Therapy Expert' WHERE name = 'Gene Therapy Expert';
UPDATE agents SET name = 'EXPERT - Ethics Committee Liaison' WHERE name = 'Ethics Committee Liaison';
UPDATE agents SET name = 'EXPERT - FDA Regulatory Strategist' WHERE name = 'FDA Regulatory Strategist';
UPDATE agents SET name = 'EXPERT - Production Scheduler' WHERE name = 'Production Scheduler';
UPDATE agents SET name = 'EXPERT - RNA Interference Specialist' WHERE name = 'RNA Interference Specialist';
UPDATE agents SET name = 'Expert - Cancer Vaccine Expert' WHERE name = 'Cancer Vaccine Expert';
UPDATE agents SET name = 'EXPERT - Endpoint Committee Coordinator' WHERE name = 'Endpoint Committee Coordinator';
UPDATE agents SET name = 'EXPERT - Safety Communication Specialist' WHERE name = 'Safety Communication Specialist';
UPDATE agents SET name = 'Expert - Organoid Platform Expert' WHERE name = 'Organoid Platform Expert';
UPDATE agents SET name = 'EXPERT - 3D Bioprinting Expert' WHERE name = '3D Bioprinting Expert';
UPDATE agents SET name = 'SPECIALIST - Medical Writer' WHERE name = 'Medical Writer';
UPDATE agents SET name = 'EXPERT - CRISPR Therapeutic Specialist' WHERE name = 'CRISPR Therapeutic Specialist';
UPDATE agents SET name = 'EXPERT - Drug Interaction Checker' WHERE name = 'Drug Interaction Checker';
UPDATE agents SET name = 'Expert - Neurodegenerative Disease Specialist' WHERE name = 'Neurodegenerative Disease Specialist';
UPDATE agents SET name = 'Expert - DNA-Encoded Library Expert' WHERE name = 'DNA-Encoded Library Expert';
UPDATE agents SET name = 'SPECIALIST - Manufacturing Capacity Planner' WHERE name = 'Manufacturing Capacity Planner';
UPDATE agents SET name = 'Specialist - Multi-Omics Integration Specialist' WHERE name = 'Multi-Omics Integration Specialist';
UPDATE agents SET name = 'EXPERT - Managed Care Contracting Specialist' WHERE name = 'Managed Care Contracting Specialist';
UPDATE agents SET name = 'SPECIALIST - Medical Affairs Metrics Analyst' WHERE name = 'Medical Affairs Metrics Analyst';
UPDATE agents SET name = 'Expert - Clinical Pharmacologist' WHERE name = 'Clinical Pharmacologist';
UPDATE agents SET name = 'EXPERT - Regulatory Submissions Quality Lead' WHERE name = 'Regulatory Submissions Quality Lead';
UPDATE agents SET name = 'EXPERT - Dissolution Testing Expert' WHERE name = 'Dissolution Testing Expert';
UPDATE agents SET name = 'SPECIALIST - KOL Engagement Coordinator' WHERE name = 'KOL Engagement Coordinator';
UPDATE agents SET name = 'EXPERT - PROTAC Expert' WHERE name = 'PROTAC Expert';
UPDATE agents SET name = 'SPECIALIST - Process Optimization Analyst' WHERE name = 'Process Optimization Analyst';
UPDATE agents SET name = 'Expert - Clinical Imaging Specialist' WHERE name = 'Clinical Imaging Specialist';
UPDATE agents SET name = 'EXPERT - Global Regulatory Strategist' WHERE name = 'Global Regulatory Strategist';
UPDATE agents SET name = 'Expert - Publication Planner' WHERE name = 'Publication Planner';
UPDATE agents SET name = 'Expert - Scale-Up Specialist' WHERE name = 'Scale-Up Specialist';
UPDATE agents SET name = 'EXPERT - Value Dossier Developer' WHERE name = 'Value Dossier Developer';
UPDATE agents SET name = 'Expert - Combination Product Specialist' WHERE name = 'Combination Product Specialist';
UPDATE agents SET name = 'EXPERT - Cleaning Validation Specialist' WHERE name = 'Cleaning Validation Specialist';
UPDATE agents SET name = 'Expert - Pediatric Clinical Specialist' WHERE name = 'Pediatric Clinical Specialist';
UPDATE agents SET name = 'EXPERT - Regulatory Risk Assessment Specialist' WHERE name = 'Regulatory Risk Assessment Specialist';
UPDATE agents SET name = 'Expert - Translational Medicine Specialist' WHERE name = 'Translational Medicine Specialist';
UPDATE agents SET name = 'SPECIALIST - Manufacturing Deviation Handler' WHERE name = 'Manufacturing Deviation Handler';
UPDATE agents SET name = 'SPECIALIST - Prior Authorization Navigator' WHERE name = 'Prior Authorization Navigator';
UPDATE agents SET name = 'EXPERT - Adaptive Trial Designer' WHERE name = 'Adaptive Trial Designer';
UPDATE agents SET name = 'EXPERT - Risk-Benefit Assessment Expert' WHERE name = 'Risk-Benefit Assessment Expert';
UPDATE agents SET name = 'Expert - Basket/Umbrella Trial Specialist' WHERE name = 'Basket/Umbrella Trial Specialist';
UPDATE agents SET name = 'EXPERT - Regulatory Deficiency Response Lead' WHERE name = 'Regulatory Deficiency Response Lead';
UPDATE agents SET name = 'SPECIALIST - Demand Forecaster' WHERE name = 'Demand Forecaster';
UPDATE agents SET name = 'EXPERT - Adverse Event Reporter' WHERE name = 'Adverse Event Reporter';
UPDATE agents SET name = 'Expert - Agency Meeting Strategist' WHERE name = 'Agency Meeting Strategist';
UPDATE agents SET name = 'SPECIALIST - Analytical Method Developer' WHERE name = 'Analytical Method Developer';
UPDATE agents SET name = 'EXPERT - Medication Therapy Advisor' WHERE name = 'Medication Therapy Advisor';
UPDATE agents SET name = 'EXPERT - Advanced Therapy Regulatory Expert' WHERE name = 'Advanced Therapy Regulatory Expert';
UPDATE agents SET name = 'EXPERT - Quality by Design Specialist' WHERE name = 'Quality by Design Specialist';
UPDATE agents SET name = 'SPECIALIST - Signal Detection Analyst' WHERE name = 'Signal Detection Analyst';
UPDATE agents SET name = 'Expert - Expedited Program Expert' WHERE name = 'Expedited Program Expert';
UPDATE agents SET name = 'EXPERT - Territory Design Specialist' WHERE name = 'Territory Design Specialist';
UPDATE agents SET name = 'EXPERT - Post-Marketing Commitment Coordinator' WHERE name = 'Post-Marketing Commitment Coordinator';
UPDATE agents SET name = 'Expert - Organ-on-Chip Specialist' WHERE name = 'Organ-on-Chip Specialist';
UPDATE agents SET name = 'Expert - Quantum Chemistry Expert' WHERE name = 'Quantum Chemistry Expert';
UPDATE agents SET name = 'SPECIALIST - Process Development Engineer' WHERE name = 'Process Development Engineer';
UPDATE agents SET name = 'EXPERT - Toxicology Study Designer' WHERE name = 'Toxicology Study Designer';
UPDATE agents SET name = 'EXPERT - Orphan Drug Designator' WHERE name = 'Orphan Drug Designator';
UPDATE agents SET name = 'EXPERT - Supplier Relationship Manager' WHERE name = 'Supplier Relationship Manager';
UPDATE agents SET name = 'EXPERT - Medical Affairs Commercial Liaison' WHERE name = 'Medical Affairs Commercial Liaison';
UPDATE agents SET name = 'EXPERT - Biomarker Validation Expert' WHERE name = 'Biomarker Validation Expert';
UPDATE agents SET name = 'SPECIALIST - Drug Substance Characterization Specialist' WHERE name = 'Drug Substance Characterization Specialist';
UPDATE agents SET name = 'Expert - Immunotoxicology Expert' WHERE name = 'Immunotoxicology Expert';
UPDATE agents SET name = 'SPECIALIST - IND-Enabling Study Coordinator' WHERE name = 'IND-Enabling Study Coordinator';
UPDATE agents SET name = 'SPECIALIST - Transportation Manager' WHERE name = 'Transportation Manager';
UPDATE agents SET name = 'Expert - Continuous Manufacturing Expert' WHERE name = 'Continuous Manufacturing Expert';
UPDATE agents SET name = 'EXPERT - Reproductive Toxicology Specialist' WHERE name = 'Reproductive Toxicology Specialist';
UPDATE agents SET name = 'EXPERT - Payor Account Strategist' WHERE name = 'Payor Account Strategist';
UPDATE agents SET name = 'SPECIALIST - Returns & Recall Coordinator' WHERE name = 'Returns & Recall Coordinator';
UPDATE agents SET name = 'SPECIALIST - DMPK Specialist' WHERE name = 'DMPK Specialist';
UPDATE agents SET name = 'Expert - Clinical Trial Transparency Officer' WHERE name = 'Clinical Trial Transparency Officer';
UPDATE agents SET name = 'Expert - Product Launch Strategist' WHERE name = 'Product Launch Strategist';
UPDATE agents SET name = 'EXPERT - Key Account Manager Support' WHERE name = 'Key Account Manager Support';
UPDATE agents SET name = 'Expert - Import/Export Compliance Specialist' WHERE name = 'Import/Export Compliance Specialist';
UPDATE agents SET name = 'Expert - CAR-T Cell Therapy Specialist' WHERE name = 'CAR-T Cell Therapy Specialist';
UPDATE agents SET name = 'SPECIALIST - Sales Force Effectiveness Analyst' WHERE name = 'Sales Force Effectiveness Analyst';
UPDATE agents SET name = 'Expert - Serialization & Track-Trace Expert' WHERE name = 'Serialization & Track-Trace Expert';
UPDATE agents SET name = 'SPECIALIST - Evidence Synthesis Specialist' WHERE name = 'Evidence Synthesis Specialist';
UPDATE agents SET name = 'EXPERT - Base/Prime Editing Expert' WHERE name = 'Base/Prime Editing Expert';
UPDATE agents SET name = 'SPECIALIST - Customer Insights Analyst' WHERE name = 'Customer Insights Analyst';
UPDATE agents SET name = 'SPECIALIST - Supply Chain Risk Manager' WHERE name = 'Supply Chain Risk Manager';
UPDATE agents SET name = 'EXPERT - Natural Language Processing Expert' WHERE name = 'Natural Language Processing Expert';
UPDATE agents SET name = 'SPECIALIST - AI/ML Model Validator' WHERE name = 'AI/ML Model Validator';
UPDATE agents SET name = 'SPECIALIST - Warehouse Operations Specialist' WHERE name = 'Warehouse Operations Specialist';
UPDATE agents SET name = 'SPECIALIST - Statistical Programmer' WHERE name = 'Statistical Programmer';
UPDATE agents SET name = 'EXPERT - Batch Record Reviewer' WHERE name = 'Batch Record Reviewer';
UPDATE agents SET name = 'EXPERT - Pharmacogenomics Expert' WHERE name = 'Pharmacogenomics Expert';
UPDATE agents SET name = 'Expert - Targeted Protein Degradation Expert' WHERE name = 'Targeted Protein Degradation Expert';
UPDATE agents SET name = 'SPECIALIST - Predictive Modeling Specialist' WHERE name = 'Predictive Modeling Specialist';
UPDATE agents SET name = 'EXPERT - Compliance Officer' WHERE name = 'Compliance Officer';
UPDATE agents SET name = 'SPECIALIST - Clinical Data Scientist' WHERE name = 'Clinical Data Scientist';
UPDATE agents SET name = 'EXPERT - Personalized Medicine Specialist' WHERE name = 'Personalized Medicine Specialist';
UPDATE agents SET name = 'EXPERT - Anti-Corruption Specialist' WHERE name = 'Anti-Corruption Specialist';
UPDATE agents SET name = 'Expert - Structure-Based Design Expert' WHERE name = 'Structure-Based Design Expert';
UPDATE agents SET name = 'EXPERT - Global Trade Compliance Specialist' WHERE name = 'Global Trade Compliance Specialist';
UPDATE agents SET name = 'EXPERT - Metabolic Reprogramming Specialist' WHERE name = 'Metabolic Reprogramming Specialist';
UPDATE agents SET name = 'SPECIALIST - Business Intelligence Analyst' WHERE name = 'Business Intelligence Analyst';
UPDATE agents SET name = 'EXPERT - Privacy Officer' WHERE name = 'Privacy Officer';
UPDATE agents SET name = 'Expert - Mitochondrial Medicine Expert' WHERE name = 'Mitochondrial Medicine Expert';
UPDATE agents SET name = 'Expert - Immunometabolism Expert' WHERE name = 'Immunometabolism Expert';
UPDATE agents SET name = 'EXPERT - Macrocycle Therapeutics Specialist' WHERE name = 'Macrocycle Therapeutics Specialist';
UPDATE agents SET name = 'Expert - Spatial Transcriptomics Specialist' WHERE name = 'Spatial Transcriptomics Specialist';
UPDATE agents SET name = 'EXPERT - Formulary Advisor' WHERE name = 'Formulary Advisor';
UPDATE agents SET name = 'EXPERT - Oncology Medication Specialist' WHERE name = 'Oncology Medication Specialist';
UPDATE agents SET name = 'EXPERT - IND Application Specialist' WHERE name = 'IND Application Specialist';
UPDATE agents SET name = 'EXPERT - Informed Consent Developer' WHERE name = 'Informed Consent Developer';
UPDATE agents SET name = 'EXPERT - Monitoring Plan Developer' WHERE name = 'Monitoring Plan Developer';
UPDATE agents SET name = 'EXPERT - Deviation Investigator' WHERE name = 'Deviation Investigator';
UPDATE agents SET name = 'SPECIALIST - CAPA Coordinator' WHERE name = 'CAPA Coordinator';
UPDATE agents SET name = 'EXPERT - Change Control Manager' WHERE name = 'Change Control Manager';
UPDATE agents SET name = 'SPECIALIST - Training Coordinator' WHERE name = 'Training Coordinator';
UPDATE agents SET name = 'EXPERT - Risk Management Plan Developer' WHERE name = 'Risk Management Plan Developer';
UPDATE agents SET name = 'EXPERT - Safety Signal Evaluator' WHERE name = 'Safety Signal Evaluator';
UPDATE agents SET name = 'EXPERT - Advisory Board Organizer' WHERE name = 'Advisory Board Organizer';
UPDATE agents SET name = 'SPECIALIST - Needs Assessment Coordinator' WHERE name = 'Needs Assessment Coordinator';
UPDATE agents SET name = 'SPECIALIST - Technology Transfer Coordinator' WHERE name = 'Technology Transfer Coordinator';
UPDATE agents SET name = 'EXPERT - Health Economics Modeler' WHERE name = 'Health Economics Modeler';
UPDATE agents SET name = 'EXPERT - DSMB Liaison' WHERE name = 'DSMB Liaison';
UPDATE agents SET name = 'SPECIALIST - Real-World Evidence Analyst' WHERE name = 'Real-World Evidence Analyst';
UPDATE agents SET name = 'EXPERT - Geriatric Clinical Specialist' WHERE name = 'Geriatric Clinical Specialist';
UPDATE agents SET name = 'Expert - Rare Disease Clinical Expert' WHERE name = 'Rare Disease Clinical Expert';
UPDATE agents SET name = 'EXPERT - Cell Therapy Clinical Specialist' WHERE name = 'Cell Therapy Clinical Specialist';
UPDATE agents SET name = 'EXPERT - Post-Approval Change Manager' WHERE name = 'Post-Approval Change Manager';
UPDATE agents SET name = 'EXPERT - Biosimilar Regulatory Specialist' WHERE name = 'Biosimilar Regulatory Specialist';
UPDATE agents SET name = 'EXPERT - International Regulatory Harmonization Expert' WHERE name = 'International Regulatory Harmonization Expert';
UPDATE agents SET name = 'EXPERT - Pharmaceutical Technology Specialist' WHERE name = 'Pharmaceutical Technology Specialist';
UPDATE agents SET name = 'Expert - Container Closure Specialist' WHERE name = 'Container Closure Specialist';
UPDATE agents SET name = 'SPECIALIST - Lyophilization Specialist' WHERE name = 'Lyophilization Specialist';
UPDATE agents SET name = 'Expert - Safety Pharmacology Expert' WHERE name = 'Safety Pharmacology Expert';
UPDATE agents SET name = 'SPECIALIST - Bioanalytical Method Developer' WHERE name = 'Bioanalytical Method Developer';
UPDATE agents SET name = 'Expert - In Vivo Model Specialist' WHERE name = 'In Vivo Model Specialist';
UPDATE agents SET name = 'EXPERT - Competitive Intelligence Specialist' WHERE name = 'Competitive Intelligence Specialist';
UPDATE agents SET name = 'EXPERT - Patient Journey Mapper' WHERE name = 'Patient Journey Mapper';
UPDATE agents SET name = 'EXPERT - Patient Advocacy Relations' WHERE name = 'Patient Advocacy Relations';
UPDATE agents SET name = 'EXPERT - Cold Chain Specialist' WHERE name = 'Cold Chain Specialist';
UPDATE agents SET name = 'EXPERT - Procurement Strategist' WHERE name = 'Procurement Strategist';
UPDATE agents SET name = 'SPECIALIST - Supply Planning Analyst' WHERE name = 'Supply Planning Analyst';
UPDATE agents SET name = 'SPECIALIST - Real-World Data Analyst' WHERE name = 'Real-World Data Analyst';
UPDATE agents SET name = 'SPECIALIST - Data Quality Analyst' WHERE name = 'Data Quality Analyst';
UPDATE agents SET name = 'SPECIALIST - Population Health Analyst' WHERE name = 'Population Health Analyst';
UPDATE agents SET name = 'Expert - Rare Disease Specialist' WHERE name = 'Rare Disease Specialist';
UPDATE agents SET name = 'Expert - Bispecific Antibody Expert' WHERE name = 'Bispecific Antibody Expert';
UPDATE agents SET name = 'Expert - mRNA Vaccine Expert' WHERE name = 'mRNA Vaccine Expert';
UPDATE agents SET name = 'EXPERT - Tissue Engineering Specialist' WHERE name = 'Tissue Engineering Specialist';
UPDATE agents SET name = 'Expert - Nanomedicine Expert' WHERE name = 'Nanomedicine Expert';
UPDATE agents SET name = 'Expert - Microbiome Therapeutics Expert' WHERE name = 'Microbiome Therapeutics Expert';
UPDATE agents SET name = 'EXPERT - Exosome Therapy Specialist' WHERE name = 'Exosome Therapy Specialist';
UPDATE agents SET name = 'EXPERT - Immune Checkpoint Inhibitor Specialist' WHERE name = 'Immune Checkpoint Inhibitor Specialist';
UPDATE agents SET name = 'Expert - Liquid Biopsy Specialist' WHERE name = 'Liquid Biopsy Specialist';
UPDATE agents SET name = 'EXPERT - Artificial Organ Developer' WHERE name = 'Artificial Organ Developer';
UPDATE agents SET name = 'Expert - Epigenetic Therapy Expert' WHERE name = 'Epigenetic Therapy Expert';
UPDATE agents SET name = 'Expert - Blood-Brain Barrier Specialist' WHERE name = 'Blood-Brain Barrier Specialist';
UPDATE agents SET name = 'EXPERT - Fragment-Based Drug Design Specialist' WHERE name = 'Fragment-Based Drug Design Specialist';
UPDATE agents SET name = 'EXPERT - Single-Cell Analysis Expert' WHERE name = 'Single-Cell Analysis Expert';

-- ============================================================================
-- MAP AGENTS TO ROLES
-- ============================================================================

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - HEOR Director' AND r.role_key = 'heor_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Health Economics Manager' AND r.role_key = 'health_economics_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Outcomes Research Specialist' AND r.role_key = 'outcomes_research_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - HTA Submission Specialist' AND r.role_key = 'hta_submission_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Evidence Synthesis Lead' AND r.role_key = 'evidence_synthesis_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - HEOR Analyst' AND r.role_key = 'heor_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Payer Strategy Director' AND r.role_key = 'payer_strategy_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - National Account Director' AND r.role_key = 'national_account_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Contracting Strategy Lead' AND r.role_key = 'contracting_strategy_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Formulary Access Manager' AND r.role_key = 'formulary_access_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Value-Based Contracting Specialist' AND r.role_key = 'value_based_contracting_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Contract Analyst' AND r.role_key = 'contract_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Pricing Strategy Director' AND r.role_key = 'pricing_strategy_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Global Pricing Lead' AND r.role_key = 'global_pricing_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Reimbursement Strategy Manager' AND r.role_key = 'reimbursement_strategy_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Specialist - Pricing Analyst' AND r.role_key = 'pricing_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Gross-to-Net Analyst' AND r.role_key = 'gross_to_net_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Patient Access Director' AND r.role_key = 'patient_access_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'WORKER - Hub Services Manager' AND r.role_key = 'hub_services_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Prior Authorization Manager' AND r.role_key = 'prior_authorization_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Copay Program Manager' AND r.role_key = 'copay_program_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Patient Access Coordinator' AND r.role_key = 'patient_access_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Policy & Advocacy Director' AND r.role_key = 'policy_&_advocacy_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Government Affairs Manager' AND r.role_key = 'government_affairs_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Healthcare Policy Analyst' AND r.role_key = 'healthcare_policy_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Market Access Communications Lead' AND r.role_key = 'market_access_communications_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Payer Marketing Manager' AND r.role_key = 'payer_marketing_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Market Access Operations Director' AND r.role_key = 'market_access_operations_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Access Analytics Manager' AND r.role_key = 'access_analytics_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Market Access Data Analyst' AND r.role_key = 'market_access_data_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Science Liaison Advisor' AND r.role_key = 'medical_science_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regional Medical Director' AND r.role_key = 'regional_medical_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Therapeutic Area MSL Lead' AND r.role_key = 'medical_science_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Field Medical Trainer' AND r.role_key = 'field_medical_trainer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Information Specialist' AND r.role_key = 'medical_information_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Librarian' AND r.role_key = 'medical_librarian'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Content Manager' AND r.role_key = 'medical_content_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Publication Strategy Lead' AND r.role_key = 'publication_strategy_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Education Director' AND r.role_key = 'medical_education_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Writer - Scientific' AND r.role_key = 'medical_writer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Writer - Regulatory' AND r.role_key = 'medical_writer___regulatory'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Communications Manager' AND r.role_key = 'medical_communications_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Editor' AND r.role_key = 'medical_editor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Congress & Events Manager' AND r.role_key = 'congress_&_events_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Real-World Evidence Specialist' AND r.role_key = 'real_world_evidence_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Health Economics Specialist' AND r.role_key = 'health_economics_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Biostatistician' AND r.role_key = 'biostatistician'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Epidemiologist' AND r.role_key = 'epidemiologist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Outcomes Research Manager' AND r.role_key = 'outcomes_research_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Study Liaison' AND r.role_key = 'clinical_study_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Medical Monitor' AND r.role_key = 'medical_monitor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Clinical Data Manager' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Clinical Trial Disclosure Manager' AND r.role_key = 'clinical_trial_disclosure_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Excellence Director' AND r.role_key = 'medical_excellence_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Review Committee Coordinator' AND r.role_key = 'medical_review_committee_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Quality Assurance Manager' AND r.role_key = 'medical_quality_assurance_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Affairs Strategist' AND r.role_key = 'medical_affairs_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Therapeutic Area Expert' AND r.role_key = 'therapeutic_area_expert'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Global Medical Advisor' AND r.role_key = 'global_medical_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'WORKER - Medical Affairs Operations Manager' AND r.role_key = 'medical_affairs_operations_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Brand Strategy Director' AND r.role_key = 'brand_strategy_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'WORKER - Brand Manager' AND r.role_key = 'brand_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Digital Strategy Director' AND r.role_key = 'digital_strategy_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Marketing Analytics Director' AND r.role_key = 'marketing_analytics_director'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'MASTER - Workflow Orchestration Agent' AND r.role_key = 'project_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'WORKER - Project Coordination Agent' AND r.role_key = 'project_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Clinical Data Analyst Agent' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Compliance Validator' AND r.role_key = 'regulatory_compliance_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Literature Researcher' AND r.role_key = 'medical_literature_researcher'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Document Generator' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Safety Signal Detector' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Clinical Trial Protocol Designer' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Anticoagulation Specialist' AND r.role_key = 'anticoagulation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Trial Designer' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - HIPAA Compliance Officer' AND r.role_key = 'hipaa_compliance_officer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Reimbursement Strategist' AND r.role_key = 'reimbursement_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - formulation_development_scientist' AND r.role_key = 'formulation_development_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Pediatric Dosing Specialist' AND r.role_key = 'pediatric_dosing_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Accelerated Approval Strategist' AND r.role_key = 'regulatory_affairs_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - comparability_study_designer' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Drug Information Specialist' AND r.role_key = 'drug_information_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - oligonucleotide_therapy_specialist' AND r.role_key = 'oligonucleotide_therapy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Pharmacokinetics Advisor' AND r.role_key = 'pharmacokinetics_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - NDA/BLA Coordinator' AND r.role_key = 'nda/bla_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Dosing Calculator' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Mass Spectrometry Imaging Expert' AND r.role_key = 'mass_spectrometry_imaging_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Infectious Disease Pharmacist' AND r.role_key = 'infectious_disease_pharmacist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Promotional Material Developer' AND r.role_key = 'promotional_material_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Intelligence Analyst' AND r.role_key = 'regulatory_intelligence_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medication Reconciliation Assistant' AND r.role_key = 'medication_reconciliation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Validation Specialist' AND r.role_key = 'validation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - GMP Compliance Advisor' AND r.role_key = 'gmp_compliance_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Geriatric Medication Specialist' AND r.role_key = 'clinical_pharmacist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Quality Systems Auditor' AND r.role_key = 'quality_systems_auditor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - PSUR/PBRER Writer' AND r.role_key = 'psur/pbrer_writer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Immunosuppression Specialist' AND r.role_key = 'immunosuppression_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Pediatric Regulatory Advisor' AND r.role_key = 'pediatric_regulatory_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Clinical Trial Budget Estimator' AND r.role_key = 'clinical_trial_budget_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Pain Management Specialist' AND r.role_key = 'pain_management_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - CMC Regulatory Specialist' AND r.role_key = 'cmc_regulatory_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Supplier Quality Manager' AND r.role_key = 'supplier_quality_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Breakthrough Therapy Advisor' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Protocol Writer' AND r.role_key = 'clinical_protocol_writer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Document Control Specialist' AND r.role_key = 'document_control_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Regulatory Strategy Advisor' AND r.role_key = 'regulatory_strategy_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Study Closeout Specialist' AND r.role_key = 'study_closeout_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Investigator-Initiated Study Reviewer' AND r.role_key = 'clinical_study_reviewer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Safety Reporting Coordinator' AND r.role_key = 'safety_reporting_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Post-Marketing Surveillance Coordinator' AND r.role_key = 'post_marketing_surveillance_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Equipment Qualification Specialist' AND r.role_key = 'equipment_qualification_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Pricing Strategy Advisor' AND r.role_key = 'pricing_strategy_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Patient-Reported Outcomes Specialist' AND r.role_key = 'patient_reported_outcomes_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Companion Diagnostic Regulatory Specialist' AND r.role_key = 'companion_diagnostic_regulatory_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Safety Database Manager' AND r.role_key = 'safety_database_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Congress Planning Specialist' AND r.role_key = 'congress_planning_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Vaccine Clinical Specialist' AND r.role_key = 'vaccine_clinical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Aggregate Report Coordinator' AND r.role_key = 'aggregate_report_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Science Liaison Coordinator' AND r.role_key = 'medical_science_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Reimbursement Analyst' AND r.role_key = 'reimbursement_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Oncology Clinical Specialist' AND r.role_key = 'oncology_clinical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Gene Therapy Clinical Expert' AND r.role_key = 'gene_therapy_clinical_expert'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Stability Study Designer' AND r.role_key = 'stability_study_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Impurity Assessment Expert' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Sterile Manufacturing Specialist' AND r.role_key = 'sterile_manufacturing_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Market Research Analyst' AND r.role_key = 'market_research_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Omnichannel Strategist' AND r.role_key = 'omnichannel_marketing_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Contract Manufacturing Manager' AND r.role_key = 'contract_manufacturing_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Database Architect' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Stem Cell Therapy Expert' AND r.role_key = 'stem_cell_clinical_research_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Oncolytic Virus Expert' AND r.role_key = 'oncolytic_virus_clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Clinical Operations Coordinator' AND r.role_key = 'clinical_operations_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Companion Diagnostic Developer' AND r.role_key = 'companion_diagnostic_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Digital Therapeutic Specialist' AND r.role_key = 'digital_therapeutic_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Intranasal Delivery Expert' AND r.role_key = 'intranasal_delivery_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Formulary Strategy Specialist' AND r.role_key = 'formulary_strategy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - AI Drug Discovery Specialist' AND r.role_key = 'ai_drug_discovery_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Genotoxicity Specialist' AND r.role_key = 'genotoxicity_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Distribution Network Designer' AND r.role_key = 'distribution_network_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Trial Simulation Expert' AND r.role_key = 'clinical_trial_simulation_expert'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Peptide Therapeutics Specialist' AND r.role_key = 'peptide_therapeutics_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Antibody-Drug Conjugate Specialist' AND r.role_key = 'antibody_drug_conjugate_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Radiopharmaceutical Specialist' AND r.role_key = 'radiopharmaceutical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Senolytic Therapy Specialist' AND r.role_key = 'senolytic_therapy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - FDA Guidance Interpreter' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Site Selection Advisor' AND r.role_key = 'site_selection_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Patient Recruitment Strategist' AND r.role_key = 'patient_recruitment_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Quality Metrics Analyst' AND r.role_key = 'quality_metrics_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Evidence Generation Planner' AND r.role_key = 'evidence_generation_planner'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Materials Management Coordinator' AND r.role_key = 'materials_management_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Payer Strategy Advisor' AND r.role_key = 'payer_strategy_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Biomarker Strategy Advisor' AND r.role_key = 'biomarker_strategy_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Lifecycle Manager' AND r.role_key = 'regulatory_lifecycle_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Regulatory Dossier Architect' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Excipient Compatibility Expert' AND r.role_key = 'excipient_compatibility_expert'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Carcinogenicity Study Designer' AND r.role_key = 'carcinogenicity_study_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Pharmacology Study Planner' AND r.role_key = 'clinical_study_planner'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - 3Rs Implementation Specialist' AND r.role_key = '3rs_implementation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - In Vitro Model Specialist' AND r.role_key = 'in_vitro_model_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Digital Marketing Strategist' AND r.role_key = 'digital_marketing_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Inventory Optimization Specialist' AND r.role_key = 'inventory_optimization_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Benefit-Risk Assessor' AND r.role_key = 'benefit_risk_assessor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Machine Learning Engineer' AND r.role_key = 'machine_learning_engineer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - In Silico Clinical Trial Expert' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Safety Labeling Specialist' AND r.role_key = 'safety_labeling_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Data Visualization Specialist' AND r.role_key = 'data_visualization_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - ETL Developer' AND r.role_key = 'etl_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Gene Therapy Expert' AND r.role_key = 'gene_therapy_clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Ethics Committee Liaison' AND r.role_key = 'ethics_committee_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - FDA Regulatory Strategist' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Production Scheduler' AND r.role_key = 'production_scheduler'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - RNA Interference Specialist' AND r.role_key = 'rna_interference_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Cancer Vaccine Expert' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Endpoint Committee Coordinator' AND r.role_key = 'endpoint_committee_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Safety Communication Specialist' AND r.role_key = 'safety_communication_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Organoid Platform Expert' AND r.role_key = 'clinical_trial_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - 3D Bioprinting Expert' AND r.role_key = '3d_bioprinting_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Writer' AND r.role_key = 'medical_writer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - CRISPR Therapeutic Specialist' AND r.role_key = 'crispr_therapeutic_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Drug Interaction Checker' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Neurodegenerative Disease Specialist' AND r.role_key = 'neurodegenerative_disease_clinical_research_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - DNA-Encoded Library Expert' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Manufacturing Capacity Planner' AND r.role_key = 'manufacturing_capacity_planner'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Specialist - Multi-Omics Integration Specialist' AND r.role_key = 'multi_omics_integration_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Managed Care Contracting Specialist' AND r.role_key = 'managed_care_contracting_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Medical Affairs Metrics Analyst' AND r.role_key = 'medical_affairs_metrics_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Pharmacologist' AND r.role_key = 'clinical_pharmacologist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Submissions Quality Lead' AND r.role_key = 'regulatory_submissions_quality_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Dissolution Testing Expert' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - KOL Engagement Coordinator' AND r.role_key = 'kol_engagement_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - PROTAC Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Process Optimization Analyst' AND r.role_key = 'process_optimization_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Imaging Specialist' AND r.role_key = 'clinical_imaging_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Global Regulatory Strategist' AND r.role_key = 'global_regulatory_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Publication Planner' AND r.role_key = 'publication_planner'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Scale-Up Specialist' AND r.role_key = 'scale_up_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Value Dossier Developer' AND r.role_key = 'value_dossier_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Combination Product Specialist' AND r.role_key = 'combination_product_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Cleaning Validation Specialist' AND r.role_key = 'cleaning_validation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Pediatric Clinical Specialist' AND r.role_key = 'pediatric_clinical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Risk Assessment Specialist' AND r.role_key = 'regulatory_risk_assessment_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Translational Medicine Specialist' AND r.role_key = 'translational_medicine_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Manufacturing Deviation Handler' AND r.role_key = 'manufacturing_deviation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Prior Authorization Navigator' AND r.role_key = 'prior_authorization_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Adaptive Trial Designer' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Risk-Benefit Assessment Expert' AND r.role_key = 'risk_benefit_assessment_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Basket/Umbrella Trial Specialist' AND r.role_key = 'basket/umbrella_trial_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Regulatory Deficiency Response Lead' AND r.role_key = 'regulatory_affairs_lead'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Demand Forecaster' AND r.role_key = 'demand_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Adverse Event Reporter' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Agency Meeting Strategist' AND r.role_key = 'regulatory_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Analytical Method Developer' AND r.role_key = 'analytical_method_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medication Therapy Advisor' AND r.role_key = 'medication_therapy_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Advanced Therapy Regulatory Expert' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Quality by Design Specialist' AND r.role_key = 'quality_by_design_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Signal Detection Analyst' AND r.role_key = 'signal_detection_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Expedited Program Expert' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Territory Design Specialist' AND r.role_key = 'territory_design_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Post-Marketing Commitment Coordinator' AND r.role_key = 'post_marketing_commitment_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Organ-on-Chip Specialist' AND r.role_key = 'organ_on_chip_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Quantum Chemistry Expert' AND r.role_key = 'quantum_chemistry_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Process Development Engineer' AND r.role_key = 'process_development_engineer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Toxicology Study Designer' AND r.role_key = 'toxicology_study_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Orphan Drug Designator' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Supplier Relationship Manager' AND r.role_key = 'supplier_relationship_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Medical Affairs Commercial Liaison' AND r.role_key = 'medical_affairs_commercial_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Biomarker Validation Expert' AND r.role_key = 'biomarker_validation_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Drug Substance Characterization Specialist' AND r.role_key = 'drug_substance_characterization_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Immunotoxicology Expert' AND r.role_key = 'immunotoxicology_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - IND-Enabling Study Coordinator' AND r.role_key = 'study_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Transportation Manager' AND r.role_key = 'transportation_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Continuous Manufacturing Expert' AND r.role_key = 'continuous_manufacturing_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Reproductive Toxicology Specialist' AND r.role_key = 'reproductive_toxicology_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Payor Account Strategist' AND r.role_key = 'payor_account_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Returns & Recall Coordinator' AND r.role_key = 'returns_&_recall_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - DMPK Specialist' AND r.role_key = 'dmpk_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Clinical Trial Transparency Officer' AND r.role_key = 'clinical_trial_transparency_officer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Product Launch Strategist' AND r.role_key = 'product_launch_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Key Account Manager Support' AND r.role_key = 'key_account_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Import/Export Compliance Specialist' AND r.role_key = 'import/export_compliance_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - CAR-T Cell Therapy Specialist' AND r.role_key = 'car_t_cell_therapy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Sales Force Effectiveness Analyst' AND r.role_key = 'sales_force_effectiveness_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Serialization & Track-Trace Expert' AND r.role_key = 'serialization_&_track_trace_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Evidence Synthesis Specialist' AND r.role_key = 'evidence_synthesis_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Base/Prime Editing Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Customer Insights Analyst' AND r.role_key = 'customer_insights_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Supply Chain Risk Manager' AND r.role_key = 'supply_chain_risk_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Natural Language Processing Expert' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - AI/ML Model Validator' AND r.role_key = 'ai/ml_model_validator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Warehouse Operations Specialist' AND r.role_key = 'warehouse_operations_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Statistical Programmer' AND r.role_key = 'statistical_programmer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Batch Record Reviewer' AND r.role_key = 'batch_record_reviewer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Pharmacogenomics Expert' AND r.role_key = 'pharmacogenomics_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Targeted Protein Degradation Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Predictive Modeling Specialist' AND r.role_key = 'predictive_modeling_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Compliance Officer' AND r.role_key = 'compliance_officer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Clinical Data Scientist' AND r.role_key = 'clinical_data_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Personalized Medicine Specialist' AND r.role_key = 'personalized_medicine_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Anti-Corruption Specialist' AND r.role_key = 'regulatory_compliance_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Structure-Based Design Expert' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Global Trade Compliance Specialist' AND r.role_key = 'global_trade_compliance_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Metabolic Reprogramming Specialist' AND r.role_key = 'metabolic_reprogramming_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Business Intelligence Analyst' AND r.role_key = 'business_intelligence_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Privacy Officer' AND r.role_key = 'privacy_officer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Mitochondrial Medicine Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Immunometabolism Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Macrocycle Therapeutics Specialist' AND r.role_key = 'clinical_research_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Spatial Transcriptomics Specialist' AND r.role_key = 'spatial_transcriptomics_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Formulary Advisor' AND r.role_key = 'formulary_advisor'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Oncology Medication Specialist' AND r.role_key = 'oncology_medication_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - IND Application Specialist' AND r.role_key = 'ind_application_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Informed Consent Developer' AND r.role_key = 'informed_consent_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Monitoring Plan Developer' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Deviation Investigator' AND r.role_key = 'deviation_investigator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - CAPA Coordinator' AND r.role_key = 'capa_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Change Control Manager' AND r.role_key = 'change_control_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Training Coordinator' AND r.role_key = 'training_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Risk Management Plan Developer' AND r.role_key = 'regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Safety Signal Evaluator' AND r.role_key = 'safety_signal_evaluator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Advisory Board Organizer' AND r.role_key = 'advisory_board_organizer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Needs Assessment Coordinator' AND r.role_key = 'needs_assessment_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Technology Transfer Coordinator' AND r.role_key = 'technology_transfer_coordinator'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Health Economics Modeler' AND r.role_key = 'health_economics_outcomes_research_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - DSMB Liaison' AND r.role_key = 'dsmb_liaison'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Real-World Evidence Analyst' AND r.role_key = 'real_world_evidence_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Geriatric Clinical Specialist' AND r.role_key = 'geriatric_clinical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Rare Disease Clinical Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Cell Therapy Clinical Specialist' AND r.role_key = 'cell_therapy_clinical_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Post-Approval Change Manager' AND r.role_key = 'post_approval_change_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Biosimilar Regulatory Specialist' AND r.role_key = 'biosimilar_regulatory_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - International Regulatory Harmonization Expert' AND r.role_key = 'international_regulatory_affairs_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Pharmaceutical Technology Specialist' AND r.role_key = 'pharmaceutical_technology_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Container Closure Specialist' AND r.role_key = 'container_closure_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Lyophilization Specialist' AND r.role_key = 'lyophilization_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Safety Pharmacology Expert' AND r.role_key = 'safety_pharmacology_expert'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Bioanalytical Method Developer' AND r.role_key = 'bioanalytical_method_developer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - In Vivo Model Specialist' AND r.role_key = 'in_vivo_model_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Competitive Intelligence Specialist' AND r.role_key = 'competitive_intelligence_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Patient Journey Mapper' AND r.role_key = 'clinical_data_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Patient Advocacy Relations' AND r.role_key = 'patient_advocacy_manager'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Cold Chain Specialist' AND r.role_key = 'cold_chain_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Procurement Strategist' AND r.role_key = 'procurement_strategist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Supply Planning Analyst' AND r.role_key = 'supply_planning_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Real-World Data Analyst' AND r.role_key = 'real_world_data_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Data Quality Analyst' AND r.role_key = 'data_quality_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'SPECIALIST - Population Health Analyst' AND r.role_key = 'population_health_analyst'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Rare Disease Specialist' AND r.role_key = 'rare_disease_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Bispecific Antibody Expert' AND r.role_key = 'bispecific_antibody_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - mRNA Vaccine Expert' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Tissue Engineering Specialist' AND r.role_key = 'tissue_engineering_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Nanomedicine Expert' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Microbiome Therapeutics Expert' AND r.role_key = 'microbiome_clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Exosome Therapy Specialist' AND r.role_key = 'exosome_therapy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Immune Checkpoint Inhibitor Specialist' AND r.role_key = 'clinical_research_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Liquid Biopsy Specialist' AND r.role_key = 'liquid_biopsy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Artificial Organ Developer' AND r.role_key = 'clinical_trial_designer'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Epigenetic Therapy Expert' AND r.role_key = 'epigenetic_therapy_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'Expert - Blood-Brain Barrier Specialist' AND r.role_key = 'clinical_research_scientist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Fragment-Based Drug Design Specialist' AND r.role_key = 'fragment_based_drug_design_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role_id, is_primary)
SELECT a.id, r.id, true
FROM agents a, roles r
WHERE a.name = 'EXPERT - Single-Cell Analysis Expert' AND r.role_key = 'single_cell_analysis_specialist'
ON CONFLICT (agent_id, role_id) DO NOTHING;

-- ============================================================================
-- MAP AGENTS TO TENANTS
-- ============================================================================

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - HEOR Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Health Economics Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Outcomes Research Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - HTA Submission Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Evidence Synthesis Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - HEOR Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Payer Strategy Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - National Account Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Contracting Strategy Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Formulary Access Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Value-Based Contracting Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Contract Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Pricing Strategy Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Global Pricing Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Reimbursement Strategy Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Specialist - Pricing Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Gross-to-Net Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Patient Access Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Hub Services Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Hub Services Manager' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Prior Authorization Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Copay Program Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Patient Access Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Policy & Advocacy Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Government Affairs Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Healthcare Policy Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Market Access Communications Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Payer Marketing Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Market Access Operations Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Access Analytics Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Market Access Data Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Science Liaison Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regional Medical Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Therapeutic Area MSL Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Field Medical Trainer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Information Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Librarian' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Content Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Publication Strategy Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Education Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Writer - Scientific' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Writer - Regulatory' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Communications Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Editor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Congress & Events Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Real-World Evidence Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Health Economics Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Biostatistician' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Epidemiologist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Outcomes Research Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Study Liaison' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Medical Monitor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Clinical Data Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Clinical Trial Disclosure Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Excellence Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Review Committee Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Quality Assurance Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Affairs Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Therapeutic Area Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Global Medical Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Medical Affairs Operations Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Brand Strategy Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Brand Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Digital Strategy Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Digital Strategy Director' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Marketing Analytics Director' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Marketing Analytics Director' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'MASTER - Workflow Orchestration Agent' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'MASTER - Workflow Orchestration Agent' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Project Coordination Agent' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'WORKER - Project Coordination Agent' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Clinical Data Analyst Agent' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Compliance Validator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Literature Researcher' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Document Generator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Safety Signal Detector' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Clinical Trial Protocol Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Anticoagulation Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Trial Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - HIPAA Compliance Officer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Reimbursement Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - formulation_development_scientist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Pediatric Dosing Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Accelerated Approval Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - comparability_study_designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Drug Information Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - oligonucleotide_therapy_specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Pharmacokinetics Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - NDA/BLA Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Dosing Calculator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Mass Spectrometry Imaging Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Infectious Disease Pharmacist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Promotional Material Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Intelligence Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medication Reconciliation Assistant' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Validation Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - GMP Compliance Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Geriatric Medication Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Quality Systems Auditor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - PSUR/PBRER Writer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Immunosuppression Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Pediatric Regulatory Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Clinical Trial Budget Estimator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Pain Management Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - CMC Regulatory Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Supplier Quality Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Breakthrough Therapy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Protocol Writer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Document Control Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Regulatory Strategy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Study Closeout Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Investigator-Initiated Study Reviewer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Safety Reporting Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Post-Marketing Surveillance Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Equipment Qualification Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Pricing Strategy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Patient-Reported Outcomes Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Companion Diagnostic Regulatory Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Safety Database Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Congress Planning Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Vaccine Clinical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Aggregate Report Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Science Liaison Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Reimbursement Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Oncology Clinical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Gene Therapy Clinical Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Stability Study Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Impurity Assessment Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Sterile Manufacturing Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Market Research Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Omnichannel Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Omnichannel Strategist' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Contract Manufacturing Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Database Architect' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Stem Cell Therapy Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Oncolytic Virus Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Clinical Operations Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Companion Diagnostic Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Digital Therapeutic Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Digital Therapeutic Specialist' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Intranasal Delivery Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Formulary Strategy Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - AI Drug Discovery Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Genotoxicity Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Distribution Network Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Trial Simulation Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Peptide Therapeutics Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Antibody-Drug Conjugate Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Radiopharmaceutical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Senolytic Therapy Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - FDA Guidance Interpreter' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Site Selection Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Patient Recruitment Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Quality Metrics Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Evidence Generation Planner' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Materials Management Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Payer Strategy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Biomarker Strategy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Lifecycle Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Regulatory Dossier Architect' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Excipient Compatibility Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Carcinogenicity Study Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Pharmacology Study Planner' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - 3Rs Implementation Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - In Vitro Model Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Digital Marketing Strategist' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Inventory Optimization Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Benefit-Risk Assessor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Machine Learning Engineer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Machine Learning Engineer' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - In Silico Clinical Trial Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Safety Labeling Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Data Visualization Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Data Visualization Specialist' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - ETL Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - ETL Developer' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Gene Therapy Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Ethics Committee Liaison' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - FDA Regulatory Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Production Scheduler' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - RNA Interference Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Cancer Vaccine Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Endpoint Committee Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Safety Communication Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Organoid Platform Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - 3D Bioprinting Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Writer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - CRISPR Therapeutic Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Drug Interaction Checker' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Neurodegenerative Disease Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - DNA-Encoded Library Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Manufacturing Capacity Planner' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Specialist - Multi-Omics Integration Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Managed Care Contracting Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Medical Affairs Metrics Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Pharmacologist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Submissions Quality Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Dissolution Testing Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - KOL Engagement Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - PROTAC Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Process Optimization Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Imaging Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Global Regulatory Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Publication Planner' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Scale-Up Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Value Dossier Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Combination Product Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Cleaning Validation Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Pediatric Clinical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Risk Assessment Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Translational Medicine Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Manufacturing Deviation Handler' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Prior Authorization Navigator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Adaptive Trial Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Risk-Benefit Assessment Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Basket/Umbrella Trial Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Regulatory Deficiency Response Lead' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Demand Forecaster' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Adverse Event Reporter' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Agency Meeting Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Analytical Method Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medication Therapy Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Advanced Therapy Regulatory Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Quality by Design Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Signal Detection Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Expedited Program Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Territory Design Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Post-Marketing Commitment Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Organ-on-Chip Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Quantum Chemistry Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Process Development Engineer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Toxicology Study Designer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Orphan Drug Designator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Supplier Relationship Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Medical Affairs Commercial Liaison' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Biomarker Validation Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Drug Substance Characterization Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Immunotoxicology Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - IND-Enabling Study Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Transportation Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Continuous Manufacturing Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Reproductive Toxicology Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Payor Account Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Returns & Recall Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - DMPK Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Clinical Trial Transparency Officer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Product Launch Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Key Account Manager Support' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Import/Export Compliance Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - CAR-T Cell Therapy Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Sales Force Effectiveness Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Serialization & Track-Trace Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Evidence Synthesis Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Base/Prime Editing Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Customer Insights Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Customer Insights Analyst' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Supply Chain Risk Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Natural Language Processing Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Natural Language Processing Expert' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - AI/ML Model Validator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - AI/ML Model Validator' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Warehouse Operations Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Statistical Programmer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Batch Record Reviewer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Pharmacogenomics Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Targeted Protein Degradation Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Predictive Modeling Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Compliance Officer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Clinical Data Scientist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Personalized Medicine Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Anti-Corruption Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Structure-Based Design Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Global Trade Compliance Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Metabolic Reprogramming Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Business Intelligence Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Business Intelligence Analyst' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Privacy Officer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Mitochondrial Medicine Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Immunometabolism Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Macrocycle Therapeutics Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Spatial Transcriptomics Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Formulary Advisor' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Oncology Medication Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - IND Application Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Informed Consent Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Monitoring Plan Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Deviation Investigator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - CAPA Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Change Control Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Training Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Risk Management Plan Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Safety Signal Evaluator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Advisory Board Organizer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Needs Assessment Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Technology Transfer Coordinator' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Health Economics Modeler' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - DSMB Liaison' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Real-World Evidence Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Geriatric Clinical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Rare Disease Clinical Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Cell Therapy Clinical Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Post-Approval Change Manager' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Biosimilar Regulatory Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - International Regulatory Harmonization Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Pharmaceutical Technology Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Container Closure Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Lyophilization Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Safety Pharmacology Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Bioanalytical Method Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - In Vivo Model Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Competitive Intelligence Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Patient Journey Mapper' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Patient Advocacy Relations' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Cold Chain Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Procurement Strategist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Supply Planning Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Real-World Data Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Data Quality Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Population Health Analyst' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'SPECIALIST - Population Health Analyst' AND t.tenant_key = 'digital_health'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Rare Disease Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Bispecific Antibody Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - mRNA Vaccine Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Tissue Engineering Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Nanomedicine Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Microbiome Therapeutics Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Exosome Therapy Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Immune Checkpoint Inhibitor Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Liquid Biopsy Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Artificial Organ Developer' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Epigenetic Therapy Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'Expert - Blood-Brain Barrier Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Fragment-Based Drug Design Specialist' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;

INSERT INTO agent_tenants (agent_id, tenant_id)
SELECT a.id, t.id
FROM agents a, tenants t
WHERE a.name = 'EXPERT - Single-Cell Analysis Expert' AND t.tenant_key = 'pharma'
ON CONFLICT (agent_id, tenant_id) DO NOTHING;


COMMIT;
