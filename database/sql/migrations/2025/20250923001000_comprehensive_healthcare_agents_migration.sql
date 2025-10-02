-- ========================================
-- VITAL PATH: COMPREHENSIVE HEALTHCARE AGENTS MIGRATION
-- Includes ALL fields for Regulatory AND Clinical Intelligence
-- ========================================

-- Add healthcare-specific fields to agents table for medical AI compliance
-- This migration adds fields needed for healthcare compliance and medical validation

-- Core Healthcare Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_specialty text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_validation_status varchar(20) DEFAULT 'pending'
  CHECK (clinical_validation_status IN ('pending', 'in_review', 'validated', 'rejected'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_accuracy_score decimal(5,4) DEFAULT 0.95
  CHECK (medical_accuracy_score >= 0 AND medical_accuracy_score <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS citation_accuracy decimal(5,4)
  CHECK (citation_accuracy IS NULL OR (citation_accuracy >= 0 AND citation_accuracy <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hallucination_rate decimal(5,4)
  CHECK (hallucination_rate IS NULL OR (hallucination_rate >= 0 AND hallucination_rate <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_error_rate decimal(5,4)
  CHECK (medical_error_rate IS NULL OR (medical_error_rate >= 0 AND medical_error_rate <= 1));

-- Compliance Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hipaa_compliant boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS pharma_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS verify_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fda_samd_class varchar(10)
  CHECK (fda_samd_class IS NULL OR fda_samd_class IN ('', 'I', 'II', 'III', 'IV'));

-- Audit and Performance Tracking
ALTER TABLE agents ADD COLUMN IF NOT EXISTS audit_trail jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS average_latency_ms integer;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cost_per_query decimal(10,4);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_clinical_review timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_reviewer_id uuid;

-- Business and Role Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_function text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS role text;

-- Missing Core Agent Fields (for full agent support)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tools jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS data_sources jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS roi_metrics jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS use_cases jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS target_users jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS required_integrations jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS security_level varchar(50) DEFAULT 'standard';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS compliance_requirements jsonb DEFAULT '[]';

-- Extended Healthcare Fields for Regulatory Agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS regulatory_pathway varchar(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS submission_type varchar(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS regulatory_precedents jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS guidance_version varchar(50);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS regulatory_risk_level varchar(20) DEFAULT 'medium'
  CHECK (regulatory_risk_level IN ('low', 'medium', 'high', 'critical'));

-- Extended Healthcare Fields for Clinical Agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_trial_phase varchar(20);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS patient_population text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS therapeutic_area varchar(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS endpoint_types jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS statistical_methods jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_standards jsonb DEFAULT '[]';

-- Quality and Validation Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_method varchar(100);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_date timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS next_validation_date timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_scope text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validation_evidence jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS validator_names jsonb DEFAULT '[]';

-- Performance and Analytics Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS success_metrics jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS usage_analytics jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS feedback_score decimal(3,2);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS user_satisfaction decimal(3,2);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS recommendation_score decimal(3,2);

-- Regulatory Intelligence Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS regulatory_intelligence jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS market_authorization_status varchar(50);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS submission_timeline jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS regulatory_milestones jsonb DEFAULT '[]';

-- Clinical Intelligence Fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_intelligence jsonb DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS study_design_expertise jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS protocol_templates jsonb DEFAULT '[]';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS biostatistics_capabilities jsonb DEFAULT '[]';

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_validation_status ON agents(clinical_validation_status);
CREATE INDEX IF NOT EXISTS idx_agents_hipaa_compliant ON agents(hipaa_compliant);
CREATE INDEX IF NOT EXISTS idx_agents_pharma_enabled ON agents(pharma_enabled);
CREATE INDEX IF NOT EXISTS idx_agents_verify_enabled ON agents(verify_enabled);
CREATE INDEX IF NOT EXISTS idx_agents_fda_samd_class ON agents(fda_samd_class);
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_medical_reviewer_id ON agents(medical_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_agents_security_level ON agents(security_level);
CREATE INDEX IF NOT EXISTS idx_agents_regulatory_pathway ON agents(regulatory_pathway);
CREATE INDEX IF NOT EXISTS idx_agents_submission_type ON agents(submission_type);
CREATE INDEX IF NOT EXISTS idx_agents_therapeutic_area ON agents(therapeutic_area);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_trial_phase ON agents(clinical_trial_phase);
CREATE INDEX IF NOT EXISTS idx_agents_validation_date ON agents(validation_date);
CREATE INDEX IF NOT EXISTS idx_agents_next_validation_date ON agents(next_validation_date);

-- Add comprehensive comments for documentation
COMMENT ON COLUMN agents.medical_specialty IS 'Medical specialty focus area for healthcare agents';
COMMENT ON COLUMN agents.clinical_validation_status IS 'Validation status for clinical use (pending/in_review/validated/rejected)';
COMMENT ON COLUMN agents.medical_accuracy_score IS 'Measured accuracy score for medical responses (0-1)';
COMMENT ON COLUMN agents.citation_accuracy IS 'Accuracy of medical citations provided (0-1)';
COMMENT ON COLUMN agents.hallucination_rate IS 'Rate of factual errors or hallucinations (0-1)';
COMMENT ON COLUMN agents.medical_error_rate IS 'Rate of medical errors in responses (0-1)';
COMMENT ON COLUMN agents.hipaa_compliant IS 'Whether agent meets HIPAA compliance requirements';
COMMENT ON COLUMN agents.pharma_enabled IS 'Whether agent is enabled for pharmaceutical use cases';
COMMENT ON COLUMN agents.verify_enabled IS 'Whether agent responses require verification';
COMMENT ON COLUMN agents.fda_samd_class IS 'FDA Software as Medical Device classification (I/II/III/IV)';
COMMENT ON COLUMN agents.audit_trail IS 'JSON audit trail for compliance tracking';
COMMENT ON COLUMN agents.average_latency_ms IS 'Average response time in milliseconds';
COMMENT ON COLUMN agents.cost_per_query IS 'Average cost per query execution';
COMMENT ON COLUMN agents.last_clinical_review IS 'Timestamp of last clinical review';
COMMENT ON COLUMN agents.medical_reviewer_id IS 'ID of medical professional who reviewed this agent';
COMMENT ON COLUMN agents.business_function IS 'Primary business function the agent serves';
COMMENT ON COLUMN agents.role IS 'Specific role or job function the agent fulfills';
COMMENT ON COLUMN agents.regulatory_pathway IS 'Regulatory pathway for submissions (510k, PMA, NDA, etc.)';
COMMENT ON COLUMN agents.submission_type IS 'Type of regulatory submission this agent supports';
COMMENT ON COLUMN agents.therapeutic_area IS 'Primary therapeutic area of focus';
COMMENT ON COLUMN agents.clinical_trial_phase IS 'Clinical trial phases this agent supports';
COMMENT ON COLUMN agents.validation_method IS 'Method used for agent validation';
COMMENT ON COLUMN agents.validation_evidence IS 'Evidence supporting agent validation';
COMMENT ON COLUMN agents.regulatory_intelligence IS 'Regulatory intelligence capabilities and data';
COMMENT ON COLUMN agents.clinical_intelligence IS 'Clinical intelligence capabilities and data';

-- Update table statistics
ANALYZE agents;

-- Add RLS policies for healthcare compliance (if not exists)
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Table might already have RLS enabled
END $$;

-- Create healthcare compliance view for easy querying
CREATE OR REPLACE VIEW healthcare_agents_compliance AS
SELECT
    id,
    name,
    display_name,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    fda_samd_class,
    regulatory_pathway,
    submission_type,
    therapeutic_area,
    validation_date,
    next_validation_date,
    validator_names,
    audit_trail,
    compliance_requirements,
    created_at,
    updated_at
FROM agents
WHERE medical_specialty IS NOT NULL
   OR clinical_validation_status IS NOT NULL
   OR hipaa_compliant = true
   OR pharma_enabled = true;

-- Grant appropriate permissions on the view
GRANT SELECT ON healthcare_agents_compliance TO authenticated;

-- Create function to validate healthcare agent data
CREATE OR REPLACE FUNCTION validate_healthcare_agent()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate medical accuracy score
    IF NEW.medical_accuracy_score IS NOT NULL AND (NEW.medical_accuracy_score < 0 OR NEW.medical_accuracy_score > 1) THEN
        RAISE EXCEPTION 'Medical accuracy score must be between 0 and 1';
    END IF;

    -- Validate FDA SaMD class
    IF NEW.fda_samd_class IS NOT NULL AND NEW.fda_samd_class NOT IN ('', 'I', 'II', 'III', 'IV') THEN
        RAISE EXCEPTION 'Invalid FDA SaMD class. Must be I, II, III, or IV';
    END IF;

    -- Validate clinical validation status
    IF NEW.clinical_validation_status IS NOT NULL AND NEW.clinical_validation_status NOT IN ('pending', 'in_review', 'validated', 'rejected') THEN
        RAISE EXCEPTION 'Invalid clinical validation status';
    END IF;

    -- Auto-set validation dates
    IF NEW.clinical_validation_status = 'validated' AND OLD.clinical_validation_status != 'validated' THEN
        NEW.validation_date = NOW();
        NEW.next_validation_date = NOW() + INTERVAL '6 months';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for healthcare validation
DROP TRIGGER IF EXISTS healthcare_agent_validation ON agents;
CREATE TRIGGER healthcare_agent_validation
    BEFORE INSERT OR UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION validate_healthcare_agent();

-- Create indexes on JSONB fields for better performance
CREATE INDEX IF NOT EXISTS idx_agents_capabilities_gin ON agents USING GIN (capabilities);
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains_gin ON agents USING GIN (knowledge_domains);
CREATE INDEX IF NOT EXISTS idx_agents_specializations_gin ON agents USING GIN (specializations);
CREATE INDEX IF NOT EXISTS idx_agents_compliance_requirements_gin ON agents USING GIN (compliance_requirements);
CREATE INDEX IF NOT EXISTS idx_agents_audit_trail_gin ON agents USING GIN (audit_trail);
CREATE INDEX IF NOT EXISTS idx_agents_regulatory_intelligence_gin ON agents USING GIN (regulatory_intelligence);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_intelligence_gin ON agents USING GIN (clinical_intelligence);