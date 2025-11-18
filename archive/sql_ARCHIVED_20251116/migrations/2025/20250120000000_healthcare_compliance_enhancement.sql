-- Healthcare Compliance Enhancement for VITALpath Agent Library
-- Based on SCAFFOLD Framework Phase 3 requirements
-- Implements HIPAA, FDA 21 CFR Part 11, and clinical validation standards

-- 1. Enhance existing agents table with medical compliance fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_specialty varchar(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_validation_status varchar(50) DEFAULT 'pending' CHECK (clinical_validation_status IN ('pending', 'validated', 'expired', 'under_review'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_accuracy_score decimal(3,2) DEFAULT 0.00 CHECK (medical_accuracy_score >= 0 AND medical_accuracy_score <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS citation_accuracy decimal(3,2) DEFAULT 0.00 CHECK (citation_accuracy >= 0 AND citation_accuracy <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hallucination_rate decimal(5,4) DEFAULT 0.0000 CHECK (hallucination_rate >= 0 AND hallucination_rate <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_error_rate decimal(5,4) DEFAULT 0.0000 CHECK (medical_error_rate >= 0 AND medical_error_rate <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fda_samd_class varchar(10); -- 'I', 'IIa', 'IIb', 'III'
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hipaa_compliant boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS pharma_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS verify_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_clinical_review timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_reviewer_id uuid REFERENCES auth.users(id);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cost_per_query decimal(10,4) DEFAULT 0.0000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS average_latency_ms integer DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS audit_trail jsonb DEFAULT '{}'; -- FDA 21 CFR Part 11 compliance

-- 2. Enhance capabilities table with medical compliance
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS medical_domain varchar(100); -- 'Oncology', 'Cardiology', 'Regulatory'
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS accuracy_threshold decimal(3,2) DEFAULT 0.95 CHECK (accuracy_threshold >= 0 AND accuracy_threshold <= 1);
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS citation_required boolean DEFAULT true;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS pharma_protocol jsonb DEFAULT NULL;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS verify_protocol jsonb DEFAULT NULL;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS fda_classification varchar(50);
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS hipaa_relevant boolean DEFAULT false;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS validation_rules jsonb DEFAULT '{}';
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS clinical_validation_status varchar(50) DEFAULT 'pending';
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS last_clinical_review timestamptz;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS system_prompt_template text;
ALTER TABLE capabilities ADD COLUMN IF NOT EXISTS audit_trail jsonb DEFAULT '{}';

-- 3. Create competencies table (sub-capabilities with medical requirements)
CREATE TABLE IF NOT EXISTS competencies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    prompt_snippet text, -- Snippet to inject into system prompt
    medical_accuracy_requirement decimal(3,2) DEFAULT 0.95 CHECK (medical_accuracy_requirement >= 0 AND medical_accuracy_requirement <= 1),
    evidence_level varchar(50), -- 'Level I', 'Level II', 'Expert Opinion'
    clinical_guidelines_reference text[], -- Array of guideline references
    required_knowledge jsonb DEFAULT '{}', -- Required medical knowledge domains
    quality_metrics jsonb DEFAULT '{}',
    icd_codes text[], -- Relevant ICD-10 codes
    snomed_codes text[], -- Relevant SNOMED CT codes
    order_priority integer DEFAULT 0,
    is_required boolean DEFAULT false,
    requires_medical_review boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    audit_log jsonb DEFAULT '{}' -- Audit trail for changes
);

-- 4. Create healthcare business functions table
CREATE TABLE IF NOT EXISTS business_functions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    department varchar(100), -- 'Clinical Affairs', 'Regulatory', 'Medical Writing'
    healthcare_category varchar(100), -- 'Patient Care', 'Research', 'Compliance'
    description text,
    regulatory_requirements text[], -- FDA, EMA, etc.
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Create healthcare roles table
CREATE TABLE IF NOT EXISTS roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    clinical_title varchar(100), -- 'Physician', 'Clinical Research Coordinator'
    seniority_level varchar(50), -- 'Junior', 'Senior', 'Director', 'VP'
    department varchar(100),
    requires_medical_license boolean DEFAULT false,
    default_capabilities jsonb DEFAULT '[]',
    compliance_requirements text[], -- HIPAA training, GCP, etc.
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Create medical tools registry
CREATE TABLE IF NOT EXISTS tools (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE,
    tool_type varchar(100), -- 'clinical_search', 'regulatory_database', 'medical_calculator'
    api_endpoint text,
    configuration jsonb DEFAULT '{}',
    medical_database varchar(100), -- 'PubMed', 'ClinicalTrials.gov', 'FDA'
    data_classification varchar(50), -- 'PHI', 'Public', 'Confidential'
    hipaa_compliant boolean DEFAULT false,
    required_permissions jsonb DEFAULT '{}',
    rate_limits jsonb DEFAULT '{}',
    validation_endpoint text, -- For medical fact checking
    is_active boolean DEFAULT true,
    last_validation_check timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Create capability-tool mapping
CREATE TABLE IF NOT EXISTS capability_tools (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    configuration jsonb DEFAULT '{}',
    is_required boolean DEFAULT false,
    auto_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(capability_id, tool_id)
);

-- 8. Enhanced agent capabilities mapping with medical configuration
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS competency_ids uuid[] DEFAULT '{}'; -- Array of selected competency IDs
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS medical_validation_required boolean DEFAULT true;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS clinical_accuracy_threshold decimal(3,2) DEFAULT 0.95;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS pharma_config jsonb DEFAULT NULL;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS verify_config jsonb DEFAULT NULL;
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES auth.users(id);
ALTER TABLE agent_capabilities ADD COLUMN IF NOT EXISTS validation_date timestamptz;

-- 9. Create system prompt generation audit table (HIPAA/FDA Compliant)
CREATE TABLE IF NOT EXISTS system_prompts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    generated_prompt text NOT NULL,
    capability_contributions jsonb DEFAULT '{}', -- Track which capabilities contributed
    tool_configurations jsonb DEFAULT '{}',
    pharma_protocol_included boolean DEFAULT true,
    verify_protocol_included boolean DEFAULT true,
    medical_disclaimers text[] DEFAULT '{}',
    version integer DEFAULT 1,
    clinical_validation_status varchar(50) DEFAULT 'pending',
    is_active boolean DEFAULT true,
    generated_at timestamptz DEFAULT now() NOT NULL,
    generated_by uuid REFERENCES auth.users(id),
    approved_by uuid REFERENCES auth.users(id), -- Medical professional who approved
    approval_date timestamptz,
    audit_log jsonb DEFAULT '{}' -- Complete change history for FDA compliance
);

-- 10. Create medical validation records table
CREATE TABLE IF NOT EXISTS medical_validations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type varchar(50) NOT NULL, -- 'agent', 'capability', 'competency'
    entity_id uuid NOT NULL,
    validation_type varchar(50), -- 'accuracy', 'safety', 'compliance'
    validation_result jsonb DEFAULT '{}',
    accuracy_score decimal(3,2),
    validator_id uuid REFERENCES auth.users(id), -- Medical professional ID
    validator_credentials text,
    validation_date timestamptz DEFAULT now() NOT NULL,
    expiration_date timestamptz,
    notes text,
    audit_trail jsonb DEFAULT '{}'
);

-- 11. Create PHI access logging table (HIPAA Requirement)
CREATE TABLE IF NOT EXISTS phi_access_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id uuid REFERENCES agents(id),
    user_id uuid REFERENCES auth.users(id),
    access_type varchar(50), -- 'read', 'write', 'process'
    data_classification varchar(50), -- 'PHI', 'De-identified'
    purpose text,
    patient_id_hash varchar(255), -- Hashed patient ID if applicable
    timestamp timestamptz DEFAULT now() NOT NULL,
    ip_address inet,
    session_id uuid,
    audit_metadata jsonb DEFAULT '{}'
);

-- 12. Create performance indexes for medical queries
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_validation ON agents(clinical_validation_status);
CREATE INDEX IF NOT EXISTS idx_agents_medical_accuracy ON agents(medical_accuracy_score);
CREATE INDEX IF NOT EXISTS idx_agents_hipaa_compliant ON agents(hipaa_compliant);
CREATE INDEX IF NOT EXISTS idx_capabilities_medical_domain ON capabilities(medical_domain);
CREATE INDEX IF NOT EXISTS idx_capabilities_accuracy_threshold ON capabilities(accuracy_threshold);
CREATE INDEX IF NOT EXISTS idx_competencies_capability ON competencies(capability_id);
CREATE INDEX IF NOT EXISTS idx_competencies_medical_accuracy ON competencies(medical_accuracy_requirement);
CREATE INDEX IF NOT EXISTS idx_medical_validations_entity ON medical_validations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_medical_validations_date ON medical_validations(validation_date);
CREATE INDEX IF NOT EXISTS idx_phi_access_log_agent ON phi_access_log(agent_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_system_prompts_agent ON system_prompts(agent_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_trail_agents ON agents USING GIN(audit_trail);
CREATE INDEX IF NOT EXISTS idx_audit_trail_capabilities ON capabilities USING GIN(audit_trail);

-- 13. Enable RLS for new tables
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE phi_access_log ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for medical tables
-- Read access for authenticated users
CREATE POLICY "competencies_read_policy" ON competencies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "business_functions_read_policy" ON business_functions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "roles_read_policy" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tools_read_policy" ON tools
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "capability_tools_read_policy" ON capability_tools
  FOR SELECT USING (auth.role() = 'authenticated');

-- System prompts - users can see active prompts for agents they have access to
CREATE POLICY "system_prompts_read_policy" ON system_prompts
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Medical validations - read-only for authenticated users
CREATE POLICY "medical_validations_read_policy" ON medical_validations
  FOR SELECT USING (auth.role() = 'authenticated');

-- PHI access log - users can only see their own access logs
CREATE POLICY "phi_access_log_user_policy" ON phi_access_log
  FOR SELECT USING (auth.uid() = user_id);

-- Admin write policies for medical tables
CREATE POLICY "competencies_admin_write_policy" ON competencies
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

CREATE POLICY "tools_admin_write_policy" ON tools
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

CREATE POLICY "medical_validations_admin_write_policy" ON medical_validations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- 15. Create updated_at triggers for new tables
CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Insert initial healthcare business functions
INSERT INTO business_functions (name, department, healthcare_category, description, regulatory_requirements) VALUES
('regulatory_affairs', 'Regulatory Affairs', 'Compliance', 'FDA, EMA, and global regulatory guidance and submissions', ARRAY['FDA 21 CFR', 'EU MDR', 'ICH Guidelines']),
('clinical_development', 'Clinical Affairs', 'Research', 'Clinical trial design, execution, and management', ARRAY['GCP', 'ICH E6', 'FDA IND']),
('market_access', 'Commercial', 'Business', 'Reimbursement strategy and payer engagement', ARRAY['HEOR Guidelines', 'HTA Requirements']),
('medical_writing', 'Medical Affairs', 'Documentation', 'Clinical and regulatory document preparation', ARRAY['ICH E3', 'CONSORT', 'Medical Writing Standards']),
('safety_pharmacovigilance', 'Safety', 'Patient Safety', 'Adverse event monitoring and safety reporting', ARRAY['ICH E2A', 'FDA FAERS', 'EU EUDRA']),
('quality_assurance', 'Quality', 'Compliance', 'GMP, quality systems, and compliance monitoring', ARRAY['FDA GMP', 'EU GMP', 'ISO 13485'])
ON CONFLICT (name) DO NOTHING;

-- 17. Insert initial healthcare roles
INSERT INTO roles (name, clinical_title, seniority_level, department, requires_medical_license, compliance_requirements) VALUES
('regulatory_manager', 'Regulatory Affairs Manager', 'Senior', 'Regulatory Affairs', false, ARRAY['FDA Training', 'GxP Certification']),
('clinical_researcher', 'Clinical Research Associate', 'Mid', 'Clinical Affairs', false, ARRAY['GCP Training', 'HIPAA Training']),
('medical_director', 'Medical Director', 'Director', 'Medical Affairs', true, ARRAY['Board Certification', 'GCP Training']),
('biostatistician', 'Biostatistician', 'Senior', 'Biostatistics', false, ARRAY['Statistical Software Certification']),
('medical_writer', 'Medical Writer', 'Mid', 'Medical Affairs', false, ARRAY['Medical Writing Certification']),
('safety_officer', 'Pharmacovigilance Officer', 'Senior', 'Safety', false, ARRAY['PV Training', 'Adverse Event Reporting'])
ON CONFLICT (name) DO NOTHING;

-- 18. Insert initial medical tools
INSERT INTO tools (name, tool_type, medical_database, data_classification, hipaa_compliant, configuration) VALUES
('pubmed_search', 'clinical_search', 'PubMed', 'Public', true, '{"api_key_required": false, "rate_limit": 3}'),
('fda_database', 'regulatory_database', 'FDA', 'Public', true, '{"api_key_required": true, "rate_limit": 10}'),
('clinicaltrials_gov', 'clinical_search', 'ClinicalTrials.gov', 'Public', true, '{"api_key_required": false, "rate_limit": 5}'),
('medical_calculator', 'medical_calculator', 'Internal', 'Confidential', true, '{"calculations": ["BMI", "eGFR", "QRISK"]}'),
('drug_interaction_checker', 'safety_tool', 'DrugBank', 'Public', true, '{"api_key_required": true, "rate_limit": 100}'),
('icd_lookup', 'coding_tool', 'WHO ICD-10', 'Public', true, '{"version": "2024", "languages": ["en"]}')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE agents IS 'Enhanced agents table with healthcare compliance fields for HIPAA, FDA 21 CFR Part 11';
COMMENT ON TABLE capabilities IS 'Enhanced capabilities table with medical domains and clinical validation';
COMMENT ON TABLE competencies IS 'Medical competencies within capabilities with clinical requirements';
COMMENT ON TABLE medical_validations IS 'Clinical validation records for agents, capabilities, and competencies';
COMMENT ON TABLE phi_access_log IS 'HIPAA-compliant audit logging for PHI access by agents';
COMMENT ON TABLE system_prompts IS 'FDA 21 CFR Part 11 compliant system prompt generation audit trail';