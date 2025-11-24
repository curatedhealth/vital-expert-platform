-- =====================================================================
-- PHASE 3: Create AI Layer (First-Class Entity)
-- =====================================================================
-- Purpose: Create AI-focused tables to capture:
-- - AI Intervention Types (Automation, Augmentation, Redesign)
-- - AI Suitability Scores (by capability type)
-- - AI Opportunities (consolidated from fragmented tables)
-- - AI Use Cases, Capabilities, Risks

-- =====================================================================
-- AI Intervention Types
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ai_intervention_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard intervention types
INSERT INTO ai_intervention_types (code, name, description, sort_order) VALUES
  ('AUTOMATION', 'Automation', 'Fully automate repetitive tasks with minimal human intervention', 1),
  ('AUGMENTATION', 'Augmentation', 'Enhance and assist human capabilities and decision-making', 2),
  ('REDESIGN', 'Redesign', 'Fundamentally transform and redesign the process or workflow', 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_ai_intervention_types_code ON ai_intervention_types(code);

COMMENT ON TABLE ai_intervention_types IS 'Standard AI intervention patterns (Automation, Augmentation, Redesign)';

-- =====================================================================
-- JTBD AI Suitability Scores (Multi-dimensional)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.jtbd_ai_suitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL UNIQUE,
  
  -- Suitability scores by AI capability (0-1 scale)
  rag_score NUMERIC(3,2) CHECK (rag_score BETWEEN 0 AND 1),
  summary_score NUMERIC(3,2) CHECK (summary_score BETWEEN 0 AND 1),
  generation_score NUMERIC(3,2) CHECK (generation_score BETWEEN 0 AND 1),
  classification_score NUMERIC(3,2) CHECK (classification_score BETWEEN 0 AND 1),
  reasoning_score NUMERIC(3,2) CHECK (reasoning_score BETWEEN 0 AND 1),
  automation_score NUMERIC(3,2) CHECK (automation_score BETWEEN 0 AND 1),
  
  -- Overall assessment
  overall_score NUMERIC(3,2) CHECK (overall_score BETWEEN 0 AND 1),
  overall_ai_readiness NUMERIC(3,2) CHECK (overall_ai_readiness BETWEEN 0 AND 1),
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
  
  -- Recommended intervention
  intervention_type_id UUID REFERENCES ai_intervention_types(id),
  intervention_type_name TEXT,  -- Cached
  
  -- Rationale
  rationale TEXT,
  limitations TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suit_jtbd ON jtbd_ai_suitability(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suit_overall ON jtbd_ai_suitability(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_ai_suit_intervention ON jtbd_ai_suitability(intervention_type_id);

COMMENT ON TABLE jtbd_ai_suitability IS 'Multi-dimensional AI suitability scores for each JTBD';

-- =====================================================================
-- Consolidated AI Opportunities
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ai_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  tenant_id UUID,
  
  -- Opportunity identity
  code TEXT,
  opportunity_name TEXT NOT NULL,
  description TEXT,
  
  -- Potential scores
  automation_potential NUMERIC(3,2) CHECK (automation_potential BETWEEN 0 AND 1),
  augmentation_potential NUMERIC(3,2) CHECK (augmentation_potential BETWEEN 0 AND 1),
  time_savings_percent NUMERIC(5,2),
  quality_improvement_percent NUMERIC(5,2),
  
  -- Intervention type
  intervention_type_id UUID REFERENCES ai_intervention_types(id),
  intervention_type_name TEXT,  -- Cached
  
  -- Complexity & effort
  complexity TEXT CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  implementation_effort TEXT CHECK (implementation_effort IN ('low', 'medium', 'high', 'very_high')),
  technical_feasibility TEXT CHECK (technical_feasibility IN ('low', 'medium', 'high', 'very_high')),
  
  -- Value
  value_estimate NUMERIC,
  value_unit TEXT DEFAULT 'USD',
  roi_estimate NUMERIC,
  
  -- Prioritization
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'validated', 'planned', 'in_progress', 'implemented', 'deprecated')),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_opp_jtbd ON ai_opportunities(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_ai_opp_tenant ON ai_opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_opp_priority ON ai_opportunities(priority);
CREATE INDEX IF NOT EXISTS idx_ai_opp_status ON ai_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_ai_opp_intervention ON ai_opportunities(intervention_type_id);

COMMENT ON TABLE ai_opportunities IS 'Consolidated AI opportunities mapped to JTBDs (replaces jtbd_gen_ai_opportunities)';

-- =====================================================================
-- AI Use Cases (linked to opportunities)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.ai_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES ai_opportunities(id) ON DELETE CASCADE,
  
  -- Use case identity
  code TEXT,
  use_case_name TEXT NOT NULL,
  description TEXT,
  
  -- Service layer targeting
  service_layer TEXT CHECK (service_layer IN ('Ask Me', 'Ask Expert', 'Ask Panel', 'Workflows', 'Process Mining')),
  ai_capability_type TEXT,  -- e.g., 'RAG', 'Summary', 'Generation'
  
  -- Implementation
  technical_approach TEXT,
  required_capabilities TEXT[],
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_use_cases_opp ON ai_use_cases(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_ai_use_cases_layer ON ai_use_cases(service_layer);

COMMENT ON TABLE ai_use_cases IS 'Specific AI use cases within an opportunity, mapped to service layers';

-- =====================================================================
-- JTBD Context (Preconditions, Postconditions, Triggers)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.jtbd_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID NOT NULL,
  
  context_type TEXT NOT NULL CHECK (context_type IN ('precondition', 'postcondition', 'trigger', 'constraint')),
  context_text TEXT NOT NULL,
  sequence_order INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jtbd_context_jtbd ON jtbd_context(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_context_type ON jtbd_context(context_type);

COMMENT ON TABLE jtbd_context IS 'Preconditions, postconditions, and triggers for JTBD execution';

-- =====================================================================
-- Auto-sync triggers for cached names
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_ai_opportunity_intervention_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.intervention_type_id IS NOT NULL AND (NEW.intervention_type_name IS NULL OR NEW.intervention_type_name = '') THEN
    SELECT name INTO NEW.intervention_type_name
    FROM ai_intervention_types
    WHERE id = NEW.intervention_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_ai_opp_intervention_name ON ai_opportunities;
CREATE TRIGGER trigger_sync_ai_opp_intervention_name
  BEFORE INSERT OR UPDATE OF intervention_type_id ON ai_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION sync_ai_opportunity_intervention_name();

CREATE OR REPLACE FUNCTION sync_jtbd_ai_suitability_intervention_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.intervention_type_id IS NOT NULL AND (NEW.intervention_type_name IS NULL OR NEW.intervention_type_name = '') THEN
    SELECT name INTO NEW.intervention_type_name
    FROM ai_intervention_types
    WHERE id = NEW.intervention_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_jtbd_ai_suit_intervention_name ON jtbd_ai_suitability;
CREATE TRIGGER trigger_sync_jtbd_ai_suit_intervention_name
  BEFORE INSERT OR UPDATE OF intervention_type_id ON jtbd_ai_suitability
  FOR EACH ROW
  EXECUTE FUNCTION sync_jtbd_ai_suitability_intervention_name();

DO $$
BEGIN
  RAISE NOTICE '=== AI LAYER CREATED ===';
  RAISE NOTICE '✓ AI intervention types table created and seeded (3 types)';
  RAISE NOTICE '✓ JTBD AI suitability table created (multi-dimensional scores)';
  RAISE NOTICE '✓ AI opportunities table created (consolidated)';
  RAISE NOTICE '✓ AI use cases table created';
  RAISE NOTICE '✓ JTBD context table created (preconditions/postconditions/triggers)';
  RAISE NOTICE '✓ Auto-sync triggers enabled for intervention type names';
END $$;

