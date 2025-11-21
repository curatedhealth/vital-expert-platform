-- ============================================================================
-- Entity Extraction Tables for LangExtract Integration
--
-- Tables for:
-- - Extracted entities from documents
-- - Entity relationships
-- - Entity verification workflows
-- - Medical terminology mapping
--
-- Created: 2025-01-25
-- Integration: LangExtract + Gemini + Pinecone
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. EXTRACTED ENTITIES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS extracted_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Source references
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,

    -- Entity classification
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'medication',
        'diagnosis',
        'procedure',
        'protocol_step',
        'patient_population',
        'monitoring_requirement',
        'adverse_event',
        'contraindication',
        'regulatory_requirement',
        'validation_criteria',
        'device',
        'biomarker',
        'symptom',
        'therapeutic_area'
    )),

    -- Entity content
    entity_text TEXT NOT NULL,
    normalized_text TEXT,  -- Standardized form (e.g., "Acetylsalicylic Acid" for "aspirin")

    -- Attributes (JSON for flexibility)
    attributes JSONB DEFAULT '{}'::jsonb,
    -- Examples:
    -- For medication: {"dose": "100mg", "frequency": "daily", "route": "oral"}
    -- For diagnosis: {"icd10": "I21.0", "severity": "moderate"}
    -- For procedure: {"cpt_code": "99213", "duration": "30min"}

    -- Confidence and quality
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    extraction_quality TEXT DEFAULT 'pending' CHECK (extraction_quality IN (
        'pending',
        'high',      -- Confidence > 0.9, clear context
        'medium',    -- Confidence 0.7-0.9
        'low',       -- Confidence < 0.7
        'flagged'    -- Requires review
    )),

    -- Source grounding (character-level precision for regulatory compliance)
    char_start INTEGER NOT NULL,
    char_end INTEGER NOT NULL,
    context_before TEXT,  -- 50 chars before
    context_after TEXT,   -- 50 chars after
    original_text TEXT,   -- Full sentence/paragraph containing the entity

    -- Medical coding (if applicable)
    icd10_code TEXT,      -- International Classification of Diseases
    snomed_code TEXT,     -- SNOMED CT code
    rxnorm_code TEXT,     -- RxNorm code for medications
    loinc_code TEXT,      -- LOINC code for lab tests
    cpt_code TEXT,        -- Current Procedural Terminology

    -- Verification workflow
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN (
        'pending',
        'approved',
        'rejected',
        'flagged',
        'auto_verified'
    )),
    verified_by UUID,  -- User who verified
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,

    -- Audit trail
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    extraction_model TEXT DEFAULT 'gemini-1.5-flash',
    extraction_version TEXT,  -- Prompt version for reproducibility
    extraction_run_id UUID,   -- Links multiple entities from same extraction run

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_confidence CHECK (confidence BETWEEN 0 AND 1),
    CONSTRAINT valid_char_positions CHECK (char_start >= 0 AND char_end > char_start)
);

-- Indexes for extracted_entities
CREATE INDEX idx_entities_chunk ON extracted_entities(chunk_id);
CREATE INDEX idx_entities_document ON extracted_entities(document_id);
CREATE INDEX idx_entities_type ON extracted_entities(entity_type);
CREATE INDEX idx_entities_text ON extracted_entities USING gin(to_tsvector('english', entity_text));
CREATE INDEX idx_entities_normalized ON extracted_entities USING gin(to_tsvector('english', normalized_text)) WHERE normalized_text IS NOT NULL;
CREATE INDEX idx_entities_confidence ON extracted_entities(confidence DESC) WHERE confidence >= 0.7;
CREATE INDEX idx_entities_verification ON extracted_entities(verification_status) WHERE verification_status = 'pending';
CREATE INDEX idx_entities_quality ON extracted_entities(extraction_quality) WHERE extraction_quality IN ('low', 'flagged');
CREATE INDEX idx_entities_extraction_run ON extracted_entities(extraction_run_id);
CREATE INDEX idx_entities_attributes ON extracted_entities USING gin(attributes);

-- Medical coding indexes
CREATE INDEX idx_entities_icd10 ON extracted_entities(icd10_code) WHERE icd10_code IS NOT NULL;
CREATE INDEX idx_entities_snomed ON extracted_entities(snomed_code) WHERE snomed_code IS NOT NULL;
CREATE INDEX idx_entities_rxnorm ON extracted_entities(rxnorm_code) WHERE rxnorm_code IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. ENTITY RELATIONSHIPS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationship endpoints
    source_entity_id UUID REFERENCES extracted_entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES extracted_entities(id) ON DELETE CASCADE,

    -- Relationship type
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'treats',                    -- medication treats diagnosis
        'causes',                    -- medication causes adverse_event
        'contraindicates',          -- diagnosis contraindicates medication
        'monitors',                 -- procedure monitors biomarker
        'requires',                 -- procedure requires medication
        'precedes',                 -- protocol_step precedes protocol_step
        'alternative_to',           -- medication alternative_to medication
        'interacts_with',           -- medication interacts_with medication
        'indicates',                -- symptom indicates diagnosis
        'includes',                 -- patient_population includes criteria
        'regulates',                -- regulatory_requirement regulates procedure
        'validates'                 -- validation_criteria validates procedure
    )),

    -- Relationship metadata
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    directionality TEXT DEFAULT 'unidirectional' CHECK (directionality IN ('unidirectional', 'bidirectional')),

    -- Evidence
    evidence_text TEXT,  -- Text supporting this relationship
    evidence_source TEXT,  -- Citation or source

    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT no_self_relationship CHECK (source_entity_id != target_entity_id),
    CONSTRAINT valid_confidence CHECK (confidence BETWEEN 0 AND 1)
);

-- Indexes for entity_relationships
CREATE INDEX idx_entity_rels_source ON entity_relationships(source_entity_id);
CREATE INDEX idx_entity_rels_target ON entity_relationships(target_entity_id);
CREATE INDEX idx_entity_rels_type ON entity_relationships(relationship_type);
CREATE INDEX idx_entity_rels_confidence ON entity_relationships(confidence DESC);
CREATE INDEX idx_entity_rels_verified ON entity_relationships(verified) WHERE verified = FALSE;

-- Composite index for relationship lookups
CREATE INDEX idx_entity_rels_source_type ON entity_relationships(source_entity_id, relationship_type);
CREATE INDEX idx_entity_rels_bidirectional ON entity_relationships(source_entity_id, target_entity_id);

-- ----------------------------------------------------------------------------
-- 3. ENTITY VERIFICATION QUEUE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entity_verification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Entity reference
    entity_id UUID REFERENCES extracted_entities(id) ON DELETE CASCADE,

    -- Priority
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),

    -- Reason for review
    review_reason TEXT NOT NULL,  -- Low confidence, conflicting entities, etc.
    review_notes TEXT,

    -- Assignment
    assigned_to UUID,
    assigned_at TIMESTAMPTZ,

    -- SLA tracking
    due_by TIMESTAMPTZ NOT NULL,
    overdue BOOLEAN GENERATED ALWAYS AS (due_by < NOW()) STORED,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'escalated')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for verification queue
CREATE INDEX idx_verification_queue_entity ON entity_verification_queue(entity_id);
CREATE INDEX idx_verification_queue_status ON entity_verification_queue(status) WHERE status IN ('pending', 'in_review');
CREATE INDEX idx_verification_queue_priority ON entity_verification_queue(priority, due_by);
CREATE INDEX idx_verification_queue_assigned ON entity_verification_queue(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_verification_queue_overdue ON entity_verification_queue(overdue, priority) WHERE overdue = TRUE;

-- ----------------------------------------------------------------------------
-- 4. ENTITY EXTRACTION RUNS (for batch tracking)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS entity_extraction_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Document context
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,

    -- Run configuration
    extraction_type TEXT NOT NULL,  -- 'regulatory_medical', 'clinical_trial', etc.
    model_used TEXT NOT NULL,
    prompt_version TEXT NOT NULL,

    -- Statistics
    total_entities_extracted INTEGER DEFAULT 0,
    high_confidence_count INTEGER DEFAULT 0,
    medium_confidence_count INTEGER DEFAULT 0,
    low_confidence_count INTEGER DEFAULT 0,
    relationships_extracted INTEGER DEFAULT 0,

    -- Performance
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost_usd NUMERIC(10, 6),

    -- Status
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for extraction runs
CREATE INDEX idx_extraction_runs_document ON entity_extraction_runs(document_id);
CREATE INDEX idx_extraction_runs_status ON entity_extraction_runs(status);
CREATE INDEX idx_extraction_runs_started ON entity_extraction_runs(started_at DESC);

-- ----------------------------------------------------------------------------
-- 5. MEDICAL TERMINOLOGY MAPPING (for normalization)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS medical_terminology_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Term variants
    raw_term TEXT NOT NULL,
    normalized_term TEXT NOT NULL,
    term_type TEXT NOT NULL,  -- medication, diagnosis, etc.

    -- Medical codes
    icd10_code TEXT,
    snomed_code TEXT,
    rxnorm_code TEXT,
    loinc_code TEXT,

    -- Metadata
    source TEXT,  -- Where this mapping came from
    confidence NUMERIC(3,2) DEFAULT 1.0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_raw_term_type UNIQUE(raw_term, term_type)
);

-- Indexes for terminology mapping
CREATE INDEX idx_terminology_raw ON medical_terminology_mapping USING gin(to_tsvector('english', raw_term));
CREATE INDEX idx_terminology_normalized ON medical_terminology_mapping(normalized_term);
CREATE INDEX idx_terminology_type ON medical_terminology_mapping(term_type);
CREATE INDEX idx_terminology_icd10 ON medical_terminology_mapping(icd10_code) WHERE icd10_code IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 6. TRIGGERS
-- ----------------------------------------------------------------------------

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_extracted_entities_updated_at
    BEFORE UPDATE ON extracted_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_relationships_updated_at
    BEFORE UPDATE ON entity_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terminology_mapping_updated_at
    BEFORE UPDATE ON medical_terminology_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-assign verification queue based on extraction quality
CREATE OR REPLACE FUNCTION auto_assign_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If entity has low confidence or is flagged, add to verification queue
    IF NEW.extraction_quality IN ('low', 'flagged') OR NEW.confidence < 0.7 THEN
        INSERT INTO entity_verification_queue (
            entity_id,
            priority,
            review_reason,
            due_by
        ) VALUES (
            NEW.id,
            CASE
                WHEN NEW.confidence < 0.5 THEN 'high'
                WHEN NEW.confidence < 0.7 THEN 'medium'
                ELSE 'low'
            END,
            CASE
                WHEN NEW.extraction_quality = 'flagged' THEN 'Flagged for manual review'
                WHEN NEW.confidence < 0.5 THEN 'Very low confidence'
                ELSE 'Low confidence extraction'
            END,
            NOW() + INTERVAL '24 hours'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_verification
    AFTER INSERT ON extracted_entities
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_verification();

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to get entities by type for a document
CREATE OR REPLACE FUNCTION get_document_entities(
    doc_id UUID,
    entity_type_filter TEXT DEFAULT NULL,
    min_confidence NUMERIC DEFAULT 0.7
)
RETURNS TABLE (
    entity_id UUID,
    entity_text TEXT,
    entity_type TEXT,
    confidence NUMERIC,
    attributes JSONB,
    verification_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.entity_text,
        e.entity_type,
        e.confidence,
        e.attributes,
        e.verification_status
    FROM extracted_entities e
    WHERE e.document_id = doc_id
        AND (entity_type_filter IS NULL OR e.entity_type = entity_type_filter)
        AND e.confidence >= min_confidence
    ORDER BY e.confidence DESC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get entity relationships
CREATE OR REPLACE FUNCTION get_entity_relationships(
    entity_id_param UUID,
    relationship_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    relationship_id UUID,
    related_entity_id UUID,
    related_entity_text TEXT,
    related_entity_type TEXT,
    relationship_type TEXT,
    confidence NUMERIC,
    direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Outgoing relationships
    SELECT
        r.id,
        e.id,
        e.entity_text,
        e.entity_type,
        r.relationship_type,
        r.confidence,
        'outgoing'::TEXT
    FROM entity_relationships r
    JOIN extracted_entities e ON r.target_entity_id = e.id
    WHERE r.source_entity_id = entity_id_param
        AND (relationship_type_filter IS NULL OR r.relationship_type = relationship_type_filter)

    UNION ALL

    -- Incoming relationships (if bidirectional)
    SELECT
        r.id,
        e.id,
        e.entity_text,
        e.entity_type,
        r.relationship_type,
        r.confidence,
        'incoming'::TEXT
    FROM entity_relationships r
    JOIN extracted_entities e ON r.source_entity_id = e.id
    WHERE r.target_entity_id = entity_id_param
        AND r.directionality = 'bidirectional'
        AND (relationship_type_filter IS NULL OR r.relationship_type = relationship_type_filter)

    ORDER BY confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search entities by text
CREATE OR REPLACE FUNCTION search_entities(
    search_query TEXT,
    entity_type_filter TEXT DEFAULT NULL,
    min_confidence NUMERIC DEFAULT 0.7,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    entity_id UUID,
    entity_text TEXT,
    normalized_text TEXT,
    entity_type TEXT,
    confidence NUMERIC,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.entity_text,
        e.normalized_text,
        e.entity_type,
        e.confidence,
        ts_rank(
            to_tsvector('english', COALESCE(e.normalized_text, e.entity_text)),
            plainto_tsquery('english', search_query)
        ) AS relevance
    FROM extracted_entities e
    WHERE
        (to_tsvector('english', COALESCE(e.normalized_text, e.entity_text)) @@ plainto_tsquery('english', search_query))
        AND (entity_type_filter IS NULL OR e.entity_type = entity_type_filter)
        AND e.confidence >= min_confidence
    ORDER BY relevance DESC, e.confidence DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE extracted_entities IS 'LangExtract extracted entities with character-level source grounding for regulatory compliance';
COMMENT ON TABLE entity_relationships IS 'Relationships between extracted entities (e.g., medication treats diagnosis)';
COMMENT ON TABLE entity_verification_queue IS 'Human verification queue for low-confidence or flagged entities';
COMMENT ON TABLE entity_extraction_runs IS 'Batch tracking for entity extraction jobs';
COMMENT ON TABLE medical_terminology_mapping IS 'Normalization mapping for medical terms to standard codes';

COMMENT ON COLUMN extracted_entities.char_start IS 'Character offset where entity begins (0-indexed)';
COMMENT ON COLUMN extracted_entities.char_end IS 'Character offset where entity ends (exclusive)';
COMMENT ON COLUMN extracted_entities.context_before IS '50 characters before entity for context';
COMMENT ON COLUMN extracted_entities.context_after IS '50 characters after entity for context';
COMMENT ON COLUMN extracted_entities.original_text IS 'Full sentence/paragraph containing the entity';
COMMENT ON COLUMN extracted_entities.icd10_code IS 'International Classification of Diseases v10 code';
COMMENT ON COLUMN extracted_entities.snomed_code IS 'SNOMED CT clinical terminology code';
COMMENT ON COLUMN extracted_entities.rxnorm_code IS 'RxNorm medication code';
COMMENT ON COLUMN extracted_entities.loinc_code IS 'LOINC laboratory test code';
