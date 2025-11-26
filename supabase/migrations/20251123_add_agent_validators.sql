-- ============================================================================
-- Migration: Add Agent Validators & Safety Enforcement
-- Date: 2025-11-23
-- Purpose: Enable declarative validator configuration for agent nodes
-- Priority: LOW
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing tables if they exist (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.agent_validator_executions CASCADE;
DROP TABLE IF EXISTS public.agent_node_validators CASCADE;
DROP TABLE IF EXISTS public.agent_validators CASCADE;

-- ============================================================================
-- 2. Agent Validators Table
-- ============================================================================

CREATE TABLE public.agent_validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Validator metadata
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  validator_type TEXT NOT NULL CHECK (validator_type IN (
    'safety',          -- Safety policy enforcement
    'compliance',      -- Regulatory compliance
    'factuality',      -- Fact checking
    'hallucination',   -- Hallucination detection
    'bias',            -- Bias detection
    'toxicity',        -- Toxicity detection
    'privacy',         -- PII/PHI detection
    'quality'          -- Output quality validation
  )),
  
  -- Implementation
  implementation_ref TEXT NOT NULL, -- e.g., 'validators.safety.HIPAAValidator'
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Rules
  validation_rules JSONB DEFAULT '[]'::jsonb,
  failure_action TEXT DEFAULT 'reject' CHECK (failure_action IN (
    'reject',          -- Reject output
    'escalate',        -- Escalate to human
    'revise',          -- Request revision
    'warn'             -- Log warning but allow
  )),
  
  -- Performance
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  author UUID REFERENCES auth.users(id),
  tenant_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. Agent Node Validators (Assignment Table)
-- ============================================================================

CREATE TABLE public.agent_node_validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  node_id UUID NOT NULL REFERENCES public.agent_graph_nodes(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES public.agent_validators(id) ON DELETE CASCADE,
  
  -- Execution order
  priority INTEGER DEFAULT 0,
  execution_order TEXT DEFAULT 'post' CHECK (execution_order IN ('pre', 'post', 'both')),
  
  -- Override config
  override_config JSONB DEFAULT '{}'::jsonb,
  
  -- Conditional application
  apply_when JSONB DEFAULT '{}'::jsonb, -- conditions for when to apply
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_node_validator UNIQUE(node_id, validator_id)
);

-- ============================================================================
-- 4. Validator Execution Log
-- ============================================================================

CREATE TABLE public.agent_validator_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  node_id UUID REFERENCES public.agent_graph_nodes(id) ON DELETE SET NULL,
  validator_id UUID NOT NULL REFERENCES public.agent_validators(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  step_index INTEGER,
  
  -- Execution
  input_text TEXT,
  validation_result JSONB NOT NULL,
  
  -- Result
  passed BOOLEAN NOT NULL,
  violations JSONB DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(3, 2),
  
  -- Action taken
  action_taken TEXT CHECK (action_taken IN ('allowed', 'rejected', 'escalated', 'revised', 'warned')),
  escalated_to UUID REFERENCES auth.users(id),
  
  -- Performance
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_validators_type ON public.agent_validators(validator_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_validators_tenant ON public.agent_validators(tenant_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_agent_node_validators_node ON public.agent_node_validators(node_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_node_validators_validator ON public.agent_node_validators(validator_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_node_validators_priority ON public.agent_node_validators(priority DESC) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_agent_validator_executions_session ON public.agent_validator_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_validator_executions_validator ON public.agent_validator_executions(validator_id);
CREATE INDEX IF NOT EXISTS idx_agent_validator_executions_passed ON public.agent_validator_executions(passed);
CREATE INDEX IF NOT EXISTS idx_agent_validator_executions_action ON public.agent_validator_executions(action_taken);
CREATE INDEX IF NOT EXISTS idx_agent_validator_executions_created ON public.agent_validator_executions(created_at DESC);

-- ============================================================================
-- 6. Seed Standard Validators
-- ============================================================================

INSERT INTO public.agent_validators (name, description, validator_type, implementation_ref, config, validation_rules) VALUES
  -- Safety validators
  ('HIPAA Compliance', 'Validates HIPAA compliance for healthcare data', 'safety', 
   'validators.safety.HIPAAValidator',
   '{"strict_mode": true, "check_phi": true}',
   '[{"rule": "no_phi_in_output", "severity": "critical"}]'),
  
  ('Clinical Safety Guard', 'Enforces clinical safety constraints', 'safety',
   'validators.safety.ClinicalSafetyGuard',
   '{"escalate_on_critical": true}',
   '[{"rule": "no_diagnosis_without_disclaimer", "severity": "high"}]'),
  
  -- Compliance validators
  ('FDA Regulatory', 'Validates FDA regulatory compliance', 'compliance',
   'validators.compliance.FDAValidator',
   '{"check_claims": true, "check_labeling": true}',
   '[{"rule": "no_off_label_promotion", "severity": "critical"}]'),
  
  ('Privacy Shield', 'Detects and masks PII/PHI', 'privacy',
   'validators.privacy.PrivacyShield',
   '{"auto_redact": true, "detection_threshold": 0.8}',
   '[{"rule": "no_unredacted_pii", "severity": "critical"}]'),
  
  -- Quality validators
  ('Factuality Checker', 'Validates factual accuracy against knowledge base', 'factuality',
   'validators.quality.FactualityChecker',
   '{"confidence_threshold": 0.7, "sources": ["pubmed", "fda", "ema"]}',
   '[{"rule": "citation_required", "severity": "medium"}]'),
  
  ('Hallucination Detector', 'Detects hallucinated content', 'hallucination',
   'validators.quality.HallucinationDetector',
   '{"detection_method": "self_consistency", "threshold": 0.6}',
   '[{"rule": "no_unsupported_claims", "severity": "high"}]'),
  
  ('Bias Detector', 'Detects demographic or clinical bias', 'bias',
   'validators.quality.BiasDetector',
   '{"check_demographics": true, "check_treatment": true}',
   '[{"rule": "fair_recommendations", "severity": "medium"}]'),
  
  ('Toxicity Filter', 'Filters toxic or inappropriate content', 'toxicity',
   'validators.safety.ToxicityFilter',
   '{"threshold": 0.7, "categories": ["hate", "violence", "sexual"]}',
   '[{"rule": "no_toxic_content", "severity": "high"}]')
  
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 7. Helper Functions
-- ============================================================================

-- Function to get validators for a node
CREATE OR REPLACE FUNCTION get_node_validators(
  p_node_id UUID,
  p_execution_order TEXT DEFAULT 'post'
)
RETURNS TABLE (
  validator_id UUID,
  validator_name TEXT,
  validator_type TEXT,
  implementation_ref TEXT,
  config JSONB,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.validator_type,
    v.implementation_ref,
    COALESCE(nv.override_config, v.config) as config,
    nv.priority
  FROM public.agent_node_validators nv
  JOIN public.agent_validators v ON v.id = nv.validator_id
  WHERE nv.node_id = p_node_id
    AND nv.is_active = true
    AND v.is_active = true
    AND (p_execution_order = 'both' OR nv.execution_order IN (p_execution_order, 'both'))
  ORDER BY nv.priority DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. Comments
-- ============================================================================

COMMENT ON TABLE public.agent_validators IS 'Registry of validation functions for agent outputs';
COMMENT ON TABLE public.agent_node_validators IS 'Assignment of validators to specific agent graph nodes';
COMMENT ON TABLE public.agent_validator_executions IS 'Execution log for validator runs';

COMMENT ON COLUMN public.agent_validators.validator_type IS 'Type of validation: safety, compliance, factuality, etc.';
COMMENT ON COLUMN public.agent_validators.failure_action IS 'Action to take on validation failure: reject, escalate, revise, warn';

COMMENT ON COLUMN public.agent_node_validators.execution_order IS 'When to apply: pre (before node), post (after node), or both';
COMMENT ON COLUMN public.agent_node_validators.priority IS 'Execution priority (higher runs first)';

COMMENT ON FUNCTION get_node_validators IS 'Get all active validators for a node in priority order';

COMMIT;

-- Verification
SELECT 'agent_validators' AS table_name, COUNT(*) AS row_count FROM public.agent_validators
UNION ALL
SELECT 'agent_node_validators', COUNT(*) FROM public.agent_node_validators
UNION ALL
SELECT 'agent_validator_executions', COUNT(*) FROM public.agent_validator_executions;

