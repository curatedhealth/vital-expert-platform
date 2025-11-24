-- ============================================================================
-- SEED KG METADATA: Node Types & Edge Types
-- ============================================================================
-- Purpose: Populate kg_node_types and kg_edge_types with pharmaceutical/medical domain entities
-- Run after: phase0_schema_completion.sql
-- ============================================================================

-- ============================================================================
-- SECTION 1: KG NODE TYPES
-- ============================================================================

INSERT INTO kg_node_types (name, description, properties) VALUES
    -- Clinical Entities
    ('Drug', 'Pharmaceutical drug or medication', '{"required": ["name", "drug_class"], "optional": ["mechanism_of_action", "half_life"]}'),
    ('Disease', 'Medical condition or disease', '{"required": ["name", "icd_code"], "optional": ["prevalence", "mortality_rate"]}'),
    ('Indication', 'Approved use case for a drug', '{"required": ["name", "condition"], "optional": ["population", "line_of_therapy"]}'),
    ('Contraindication', 'Condition preventing drug use', '{"required": ["name", "severity"], "optional": ["mechanism", "alternatives"]}'),
    ('Adverse_Event', 'Side effect or adverse reaction', '{"required": ["name", "severity"], "optional": ["frequency", "onset"]}'),
    ('Biomarker', 'Measurable biological indicator', '{"required": ["name", "type"], "optional": ["measurement_unit", "normal_range"]}'),
    
    -- Research & Evidence
    ('Clinical_Trial', 'Clinical research study', '{"required": ["nct_id", "phase", "status"], "optional": ["enrollment", "primary_endpoint"]}'),
    ('Publication', 'Scientific publication', '{"required": ["pmid", "title", "journal"], "optional": ["impact_factor", "publication_date"]}'),
    ('Guideline', 'Clinical practice guideline', '{"required": ["name", "organization"], "optional": ["version", "publication_year"]}'),
    ('Evidence', 'Evidence supporting a claim', '{"required": ["type", "strength"], "optional": ["source", "quality_score"]}'),
    
    -- Regulatory & Commercial
    ('Regulation', 'Regulatory requirement or ruling', '{"required": ["name", "jurisdiction"], "optional": ["effective_date", "status"]}'),
    ('Label', 'Drug label or prescribing information', '{"required": ["drug_name", "version"], "optional": ["approval_date", "updates"]}'),
    ('Patent', 'Intellectual property protection', '{"required": ["patent_number", "status"], "optional": ["expiry_date", "scope"]}'),
    ('Market', 'Geographic or therapeutic market', '{"required": ["name", "region"], "optional": ["size", "growth_rate"]}'),
    ('Competitor', 'Competing drug or company', '{"required": ["name", "type"], "optional": ["market_share", "strategy"]}'),
    
    -- Stakeholders
    ('KOL', 'Key opinion leader', '{"required": ["name", "specialty"], "optional": ["institution", "h_index"]}'),
    ('Institution', 'Healthcare or research institution', '{"required": ["name", "type"], "optional": ["location", "ranking"]}'),
    ('Payer', 'Insurance or healthcare payer', '{"required": ["name", "type"], "optional": ["coverage_population", "formulary"]}'),
    ('Provider', 'Healthcare provider', '{"required": ["name", "specialty"], "optional": ["location", "network"]}'),
    
    -- Medical Affairs Specific
    ('Medical_Plan', 'Medical affairs strategic plan', '{"required": ["name", "therapeutic_area"], "optional": ["objectives", "timeline"]}'),
    ('Insight', 'Medical or scientific insight', '{"required": ["description", "source"], "optional": ["priority", "action_items"]}'),
    ('Gap', 'Knowledge or evidence gap', '{"required": ["description", "impact"], "optional": ["priority", "mitigation"]}'),
    ('Inquiry', 'Medical information inquiry', '{"required": ["question", "date"], "optional": ["urgency", "resolution"]}')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    properties = EXCLUDED.properties,
    updated_at = NOW();

-- ============================================================================
-- SECTION 2: KG EDGE TYPES
-- ============================================================================

INSERT INTO kg_edge_types (name, description, inverse_name, properties) VALUES
    -- Clinical Relationships
    ('TREATS', 'Drug treats disease or condition', 'TREATED_BY', '{"required": ["efficacy"], "optional": ["line_of_therapy", "population"]}'),
    ('INDICATED_FOR', 'Drug is indicated for condition', 'HAS_INDICATION', '{"required": ["approval_status"], "optional": ["jurisdiction", "date"]}'),
    ('CONTRAINDICATED_WITH', 'Drug contraindicated with condition', 'CONTRAINDICATES', '{"required": ["severity"], "optional": ["mechanism", "alternatives"]}'),
    ('CAUSES', 'Drug causes adverse event', 'CAUSED_BY', '{"required": ["frequency"], "optional": ["severity", "onset"]}'),
    ('INTERACTS_WITH', 'Drug interacts with another drug', 'INTERACTS_WITH', '{"required": ["interaction_type"], "optional": ["severity", "mechanism"]}'),
    ('TARGETS', 'Drug targets biological marker', 'TARGETED_BY', '{"required": ["mechanism"], "optional": ["binding_affinity", "selectivity"]}'),
    
    -- Evidence Relationships
    ('SUPPORTED_BY', 'Claim supported by evidence', 'SUPPORTS', '{"required": ["evidence_strength"], "optional": ["quality_score", "date"]}'),
    ('CITES', 'Publication cites another publication', 'CITED_BY', '{"required": ["context"], "optional": ["citation_count"]}'),
    ('RECOMMENDS', 'Guideline recommends intervention', 'RECOMMENDED_BY', '{"required": ["recommendation_strength"], "optional": ["evidence_level"]}'),
    ('CONTRADICTS', 'Evidence contradicts claim', 'CONTRADICTED_BY', '{"required": ["explanation"], "optional": ["resolution"]}'),
    ('STUDIED_IN', 'Drug studied in clinical trial', 'STUDIES', '{"required": ["phase", "status"], "optional": ["results", "endpoints"]}'),
    
    -- Regulatory & Commercial
    ('REGULATES', 'Regulation applies to entity', 'REGULATED_BY', '{"required": ["jurisdiction"], "optional": ["effective_date", "scope"]}'),
    ('APPROVED_IN', 'Drug approved in market', 'APPROVES', '{"required": ["approval_date"], "optional": ["restrictions", "conditions"]}'),
    ('COMPETES_WITH', 'Competitor competes with entity', 'COMPETES_WITH', '{"required": ["market"], "optional": ["competitive_advantage"]}'),
    ('COVERS', 'Payer covers drug', 'COVERED_BY', '{"required": ["coverage_type"], "optional": ["restrictions", "tier"]}'),
    ('PROTECTS', 'Patent protects invention', 'PROTECTED_BY', '{"required": ["expiry_date"], "optional": ["scope", "claims"]}'),
    
    -- Stakeholder Relationships
    ('AUTHORED_BY', 'Publication authored by KOL', 'AUTHORS', '{"required": ["author_position"], "optional": ["contribution"]}'),
    ('AFFILIATED_WITH', 'KOL affiliated with institution', 'EMPLOYS', '{"required": ["role"], "optional": ["start_date", "end_date"]}'),
    ('PRESCRIBES', 'Provider prescribes drug', 'PRESCRIBED_BY', '{"required": ["frequency"], "optional": ["indication", "volume"]}'),
    ('ENDORSES', 'KOL endorses intervention', 'ENDORSED_BY', '{"required": ["context"], "optional": ["date", "platform"]}'),
    
    -- Medical Affairs Specific
    ('ADDRESSES', 'Plan addresses gap', 'ADDRESSED_BY', '{"required": ["priority"], "optional": ["timeline", "resources"]}'),
    ('GENERATES', 'Activity generates insight', 'GENERATED_BY', '{"required": ["source"], "optional": ["date", "quality"]}'),
    ('INFORMS', 'Insight informs strategy', 'INFORMED_BY', '{"required": ["impact"], "optional": ["action_items"]}'),
    ('RESPONDS_TO', 'Answer responds to inquiry', 'ANSWERED_BY', '{"required": ["resolution_date"], "optional": ["satisfaction"]}')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    inverse_name = EXCLUDED.inverse_name,
    properties = EXCLUDED.properties,
    updated_at = NOW();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    node_count INTEGER;
    edge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO node_count FROM kg_node_types;
    SELECT COUNT(*) INTO edge_count FROM kg_edge_types;
    
    RAISE NOTICE '=== KG METADATA SEED SUMMARY ===';
    RAISE NOTICE 'Node types seeded: % (expected: 23)', node_count;
    RAISE NOTICE 'Edge types seeded: % (expected: 24)', edge_count;
    RAISE NOTICE '';
    
    IF node_count >= 23 AND edge_count >= 24 THEN
        RAISE NOTICE 'STATUS: ✓ KG metadata seeded successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠ Some metadata may be missing';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. Review seeded node and edge types';
    RAISE NOTICE '2. Run seed_agent_kg_views.sql to create agent-specific views';
    RAISE NOTICE '3. Sync metadata to Neo4j using sync service';
END $$;

