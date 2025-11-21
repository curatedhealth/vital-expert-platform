-- Add healthcare-specific fields to agents table for medical AI compliance
-- This migration adds fields needed for healthcare compliance and medical validation

ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_specialty text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS clinical_validation_status varchar(20) DEFAULT 'pending'
  CHECK (clinical_validation_status IN ('pending', 'in_review', 'validated', 'rejected'));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_accuracy_score decimal(4,3) DEFAULT 0.95
  CHECK (medical_accuracy_score >= 0 AND medical_accuracy_score <= 1);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS citation_accuracy decimal(4,3)
  CHECK (citation_accuracy IS NULL OR (citation_accuracy >= 0 AND citation_accuracy <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hallucination_rate decimal(4,3)
  CHECK (hallucination_rate IS NULL OR (hallucination_rate >= 0 AND hallucination_rate <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS hipaa_compliant boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS pharma_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS verify_enabled boolean DEFAULT false;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fda_samd_class varchar(20)
  CHECK (fda_samd_class IS NULL OR fda_samd_class IN ('', 'I', 'II', 'III', 'IV'));

-- Add business and role fields if they don't exist
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_function text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS role text;

-- Add audit and performance tracking fields
ALTER TABLE agents ADD COLUMN IF NOT EXISTS audit_trail jsonb;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS average_latency_ms integer;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cost_per_query decimal(10,4);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_clinical_review timestamptz;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_error_rate decimal(4,3)
  CHECK (medical_error_rate IS NULL OR (medical_error_rate >= 0 AND medical_error_rate <= 1));
ALTER TABLE agents ADD COLUMN IF NOT EXISTS medical_reviewer_id uuid REFERENCES auth.users(id);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_validation_status ON agents(clinical_validation_status);
CREATE INDEX IF NOT EXISTS idx_agents_hipaa_compliant ON agents(hipaa_compliant);
CREATE INDEX IF NOT EXISTS idx_agents_pharma_enabled ON agents(pharma_enabled);
CREATE INDEX IF NOT EXISTS idx_agents_fda_samd_class ON agents(fda_samd_class);
CREATE INDEX IF NOT EXISTS idx_agents_business_function ON agents(business_function);
CREATE INDEX IF NOT EXISTS idx_agents_medical_reviewer_id ON agents(medical_reviewer_id);

-- Add comments for documentation
COMMENT ON COLUMN agents.medical_specialty IS 'Medical specialty focus area for healthcare agents';
COMMENT ON COLUMN agents.clinical_validation_status IS 'Validation status for clinical use';
COMMENT ON COLUMN agents.medical_accuracy_score IS 'Measured accuracy score for medical responses (0-1)';
COMMENT ON COLUMN agents.citation_accuracy IS 'Accuracy of medical citations provided (0-1)';
COMMENT ON COLUMN agents.hallucination_rate IS 'Rate of factual errors or hallucinations (0-1)';
COMMENT ON COLUMN agents.hipaa_compliant IS 'Whether agent meets HIPAA compliance requirements';
COMMENT ON COLUMN agents.pharma_enabled IS 'Whether agent is enabled for pharmaceutical use cases';
COMMENT ON COLUMN agents.verify_enabled IS 'Whether agent responses require verification';
COMMENT ON COLUMN agents.fda_samd_class IS 'FDA Software as Medical Device classification';
COMMENT ON COLUMN agents.business_function IS 'Primary business function the agent serves';
COMMENT ON COLUMN agents.role IS 'Specific role or job function the agent fulfills';
COMMENT ON COLUMN agents.audit_trail IS 'JSON audit trail for compliance tracking';
COMMENT ON COLUMN agents.average_latency_ms IS 'Average response time in milliseconds';
COMMENT ON COLUMN agents.cost_per_query IS 'Average cost per query execution';
COMMENT ON COLUMN agents.last_clinical_review IS 'Timestamp of last clinical review';
COMMENT ON COLUMN agents.medical_error_rate IS 'Rate of medical errors in responses (0-1)';
COMMENT ON COLUMN agents.medical_reviewer_id IS 'ID of medical professional who reviewed this agent';