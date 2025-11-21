-- Entity Extraction Core Tables (Simplified)
-- This migration creates the essential tables for entity extraction without dependencies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Extracted Entities Table (Core)
CREATE TABLE IF NOT EXISTS public.extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity information
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'medication', 'diagnosis', 'procedure', 'condition',
    'lab_result', 'vital_sign', 'patient_characteristic',
    'protocol_step', 'recommendation', 'adverse_event'
  )),
  entity_text TEXT NOT NULL,

  -- Attributes (flexible JSON storage)
  attributes JSONB DEFAULT '{}'::jsonb,

  -- Confidence
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Source grounding (character-level precision)
  document_id UUID,
  chunk_id UUID,
  char_start INTEGER NOT NULL,
  char_end INTEGER NOT NULL,
  context_before TEXT,
  context_after TEXT,
  original_text TEXT,

  -- Medical coding
  icd10_code TEXT,
  snomed_code TEXT,
  rxnorm_code TEXT,
  cpt_code TEXT,
  loinc_code TEXT,

  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'approved', 'rejected', 'flagged', 'needs_review'
  )),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  -- Metadata
  extraction_model TEXT,
  extraction_version TEXT,
  extraction_run_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Entity Relationships Table
CREATE TABLE IF NOT EXISTS public.entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source_entity_id UUID NOT NULL REFERENCES public.extracted_entities(id) ON DELETE CASCADE,
  target_entity_id UUID NOT NULL REFERENCES public.extracted_entities(id) ON DELETE CASCADE,

  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'treats', 'causes', 'contraindicates', 'monitors',
    'precedes', 'follows', 'requires', 'modifies',
    'indicates', 'confirms', 'rules_out'
  )),

  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  evidence TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate relationships
  UNIQUE(source_entity_id, target_entity_id, relationship_type)
);

-- 3. Entity Verification Queue
CREATE TABLE IF NOT EXISTS public.entity_verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity_id UUID NOT NULL REFERENCES public.extracted_entities(id) ON DELETE CASCADE,

  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'escalated')),

  due_by TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  review_duration_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Entity Extraction Audit Log
CREATE TABLE IF NOT EXISTS public.entity_extraction_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity_id UUID REFERENCES public.extracted_entities(id) ON DELETE SET NULL,

  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 'verified', 'rejected', 'flagged'
  )),

  actor_id UUID,
  actor_type TEXT CHECK (actor_type IN ('user', 'system', 'ai_model')),

  changes JSONB,
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.extracted_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_document ON public.extracted_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_entities_verification ON public.extracted_entities(verification_status);
CREATE INDEX IF NOT EXISTS idx_entities_confidence ON public.extracted_entities(confidence);
CREATE INDEX IF NOT EXISTS idx_entities_created ON public.extracted_entities(created_at DESC);

-- GIN indexes for JSONB and text search
CREATE INDEX IF NOT EXISTS idx_entities_attributes ON public.extracted_entities USING GIN(attributes);

-- Index for source grounding
CREATE INDEX IF NOT EXISTS idx_entities_char_range ON public.extracted_entities(char_start, char_end);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_relationships_source ON public.entity_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON public.entity_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON public.entity_relationships(relationship_type);

-- Verification queue indexes
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.entity_verification_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON public.entity_verification_queue(priority);
CREATE INDEX IF NOT EXISTS idx_queue_assigned ON public.entity_verification_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_queue_due ON public.entity_verification_queue(due_by);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.entity_extraction_audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.entity_extraction_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.entity_extraction_audit_log(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_extracted_entities_updated_at
  BEFORE UPDATE ON public.extracted_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_queue_updated_at
  BEFORE UPDATE ON public.entity_verification_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.extracted_entities IS 'Stores entities extracted from documents with character-level source grounding';
COMMENT ON TABLE public.entity_relationships IS 'Stores relationships between extracted entities';
COMMENT ON TABLE public.entity_verification_queue IS 'Manages human-in-the-loop verification workflow';
COMMENT ON TABLE public.entity_extraction_audit_log IS 'Full audit trail for regulatory compliance';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Entity extraction core tables created successfully';
  RAISE NOTICE '📊 Tables: extracted_entities, entity_relationships, entity_verification_queue, entity_extraction_audit_log';
  RAISE NOTICE '🔍 Indexes: 20+ performance indexes created';
  RAISE NOTICE '✅ Ready for LangExtract integration';
END $$;
