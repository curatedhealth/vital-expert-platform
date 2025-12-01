-- =====================================================================
-- L0: DOMAIN KNOWLEDGE LAYER (RAG Integration)
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-28
-- Purpose: Thin reference tables linking to RAG content
--          NOT content storage - references only
-- Dependencies: None (foundation layer)
-- =====================================================================
--
-- ARCHITECTURE PRINCIPLE:
-- L0 tables hold IDs and minimal metadata for joining, not content.
-- Domain content lives in RAG (Pinecone namespaces, document stores).
-- These tables enable:
--   1. Entity resolution for queries
--   2. Graph node creation for Neo4j
--   3. Filtering/routing by domain context
--   4. Cross-layer relationships (L0 → L1, L0 → L2, etc.)
-- =====================================================================

-- =====================================================================
-- THERAPEUTIC AREAS (References RAG Domain)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID, -- Multi-tenant support (NULL = global reference)
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20), -- Standard code (e.g., ATC level 1)

  -- Hierarchy
  parent_ta_id UUID REFERENCES l0_therapeutic_areas(id),
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 3),

  -- Classification
  disease_burden_rank INTEGER,
  regulatory_complexity VARCHAR(20) CHECK (regulatory_complexity IN (
    'standard', 'elevated', 'high', 'orphan', 'breakthrough'
  )),

  -- RAG Integration (key fields)
  rag_collection_id VARCHAR(255), -- Reference to RAG collection/namespace
  rag_namespace VARCHAR(100), -- Namespace in vector store
  external_ids JSONB DEFAULT '{}', -- {"mesh": "...", "snomed": "..."}

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- DISEASES / INDICATIONS (References RAG Domain)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20),

  -- Classification Codes (for entity resolution)
  icd10_codes TEXT[],
  icd11_codes TEXT[],
  orphanet_id VARCHAR(20),
  mesh_id VARCHAR(20),

  -- Clinical Context (minimal - details in RAG)
  disease_category VARCHAR(50) CHECK (disease_category IN (
    'chronic', 'acute', 'rare', 'infectious', 'genetic',
    'autoimmune', 'oncologic', 'metabolic', 'neurologic', 'other'
  )),
  unmet_need_level VARCHAR(20) CHECK (unmet_need_level IN (
    'low', 'moderate', 'high', 'critical'
  )),

  -- Hierarchy
  therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),

  -- RAG Integration
  rag_collection_id VARCHAR(255),
  rag_namespace VARCHAR(100),
  external_ids JSONB DEFAULT '{}',

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PRODUCTS (Tenant-specific, References RAG Domain)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- Products are always tenant-specific
  unique_id VARCHAR(100) UNIQUE NOT NULL,

  -- Core Identity
  product_code VARCHAR(50) NOT NULL,
  generic_name VARCHAR(255) NOT NULL,
  brand_names TEXT[],

  -- Classification
  product_type VARCHAR(50) CHECK (product_type IN (
    'small_molecule', 'biologic', 'cell_therapy', 'gene_therapy',
    'device', 'combination', 'digital_therapeutic', 'vaccine'
  )),
  administration_routes TEXT[],

  -- Lifecycle
  lifecycle_stage VARCHAR(50) CHECK (lifecycle_stage IN (
    'discovery', 'preclinical', 'phase1', 'phase2', 'phase3',
    'regulatory_review', 'approved', 'mature', 'loe', 'discontinued'
  )),
  first_approval_date DATE,
  patent_expiry_date DATE,

  -- Primary Domain
  primary_therapeutic_area_id UUID REFERENCES l0_therapeutic_areas(id),

  -- RAG Integration
  rag_collection_id VARCHAR(255),
  rag_namespace VARCHAR(100),
  external_ids JSONB DEFAULT '{}', -- {"ndc": "...", "ema": "..."}

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, product_code)
);

-- =====================================================================
-- EVIDENCE TYPES (Reference Data)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_evidence_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL, -- 'RCT', 'Meta-analysis', 'RWE', 'Case Study'
  code VARCHAR(20),

  -- Classification
  evidence_category VARCHAR(50) CHECK (evidence_category IN (
    'clinical_trial', 'real_world', 'observational', 'meta_analysis',
    'systematic_review', 'case_study', 'registry', 'claims_data'
  )),
  evidence_level VARCHAR(10) CHECK (evidence_level IN (
    '1a', '1b', '2a', '2b', '3', '4', '5' -- Oxford CEBM
  )),

  -- Characteristics
  payer_relevance_score INTEGER CHECK (payer_relevance_score BETWEEN 1 AND 10),
  regulatory_acceptance TEXT[], -- FDA, EMA, NICE, etc.

  -- RAG Integration
  rag_collection_id VARCHAR(255),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- STAKEHOLDER TYPES (KOL Categories, HCP Types)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_stakeholder_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20),

  -- Classification
  stakeholder_category VARCHAR(50) CHECK (stakeholder_category IN (
    'hcp', 'payer', 'regulator', 'patient', 'caregiver',
    'advocacy', 'academic', 'policy', 'media'
  )),

  -- Engagement Context (minimal - details in RAG)
  typical_engagement_channels TEXT[],
  decision_influence_areas TEXT[],

  -- Compliance
  interaction_restrictions TEXT[],

  -- RAG Integration
  rag_collection_id VARCHAR(255),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- REGULATORY JURISDICTIONS (Reference Data)
-- =====================================================================

CREATE TABLE IF NOT EXISTS l0_regulatory_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL, -- ISO country code or region

  -- Authority
  regulatory_body VARCHAR(255) NOT NULL,
  regulatory_body_acronym VARCHAR(20), -- FDA, EMA, PMDA, etc.

  -- Classification
  jurisdiction_type VARCHAR(20) CHECK (jurisdiction_type IN (
    'national', 'regional', 'supranational'
  )),
  region VARCHAR(50),

  -- Expedited Pathways
  expedited_pathways TEXT[], -- Breakthrough, Fast Track, etc.

  -- RAG Integration
  rag_collection_id VARCHAR(255),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- L0 RELATIONSHIP TABLES (Junction Tables)
-- =====================================================================

-- TA-Disease Mapping
CREATE TABLE IF NOT EXISTS l0_ta_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapeutic_area_id UUID NOT NULL REFERENCES l0_therapeutic_areas(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES l0_diseases(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(therapeutic_area_id, disease_id)
);

-- Product-TA Mapping (multiple TAs per product)
CREATE TABLE IF NOT EXISTS l0_product_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES l0_products(id) ON DELETE CASCADE,
  therapeutic_area_id UUID NOT NULL REFERENCES l0_therapeutic_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, therapeutic_area_id)
);

-- Product-Disease Indications
CREATE TABLE IF NOT EXISTS l0_product_indications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES l0_products(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES l0_diseases(id) ON DELETE CASCADE,

  -- Approval Context
  approval_status VARCHAR(20) CHECK (approval_status IN (
    'approved', 'pending', 'investigational', 'withdrawn'
  )),
  approval_date DATE,
  approval_regions TEXT[],

  -- Line of Therapy
  line_of_therapy VARCHAR(20) CHECK (line_of_therapy IN (
    '1L', '2L', '3L', '4L+', 'adjuvant', 'neoadjuvant', 'maintenance'
  )),

  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(product_id, disease_id, line_of_therapy)
);

-- Disease-Evidence Requirements
CREATE TABLE IF NOT EXISTS l0_disease_evidence_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id UUID NOT NULL REFERENCES l0_diseases(id) ON DELETE CASCADE,
  evidence_type_id UUID NOT NULL REFERENCES l0_evidence_types(id) ON DELETE CASCADE,

  requirement_level VARCHAR(20) CHECK (requirement_level IN (
    'mandatory', 'recommended', 'supplementary'
  )),
  context TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(disease_id, evidence_type_id)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

-- Therapeutic Areas
CREATE INDEX IF NOT EXISTS idx_l0_ta_code ON l0_therapeutic_areas(code);
CREATE INDEX IF NOT EXISTS idx_l0_ta_parent ON l0_therapeutic_areas(parent_ta_id);
CREATE INDEX IF NOT EXISTS idx_l0_ta_tenant ON l0_therapeutic_areas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_l0_ta_rag ON l0_therapeutic_areas(rag_collection_id);

-- Diseases
CREATE INDEX IF NOT EXISTS idx_l0_disease_code ON l0_diseases(code);
CREATE INDEX IF NOT EXISTS idx_l0_disease_ta ON l0_diseases(therapeutic_area_id);
CREATE INDEX IF NOT EXISTS idx_l0_disease_category ON l0_diseases(disease_category);
CREATE INDEX IF NOT EXISTS idx_l0_disease_rag ON l0_diseases(rag_collection_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_l0_product_tenant ON l0_products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_l0_product_code ON l0_products(tenant_id, product_code);
CREATE INDEX IF NOT EXISTS idx_l0_product_lifecycle ON l0_products(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_l0_product_ta ON l0_products(primary_therapeutic_area_id);
CREATE INDEX IF NOT EXISTS idx_l0_product_rag ON l0_products(rag_collection_id);

-- Evidence Types
CREATE INDEX IF NOT EXISTS idx_l0_evidence_category ON l0_evidence_types(evidence_category);
CREATE INDEX IF NOT EXISTS idx_l0_evidence_level ON l0_evidence_types(evidence_level);

-- Stakeholders
CREATE INDEX IF NOT EXISTS idx_l0_stakeholder_category ON l0_stakeholder_types(stakeholder_category);

-- Regulatory
CREATE INDEX IF NOT EXISTS idx_l0_regulatory_code ON l0_regulatory_jurisdictions(code);

-- Junction Tables
CREATE INDEX IF NOT EXISTS idx_l0_ta_diseases_ta ON l0_ta_diseases(therapeutic_area_id);
CREATE INDEX IF NOT EXISTS idx_l0_ta_diseases_disease ON l0_ta_diseases(disease_id);
CREATE INDEX IF NOT EXISTS idx_l0_product_ta_product ON l0_product_therapeutic_areas(product_id);
CREATE INDEX IF NOT EXISTS idx_l0_product_ta_ta ON l0_product_therapeutic_areas(therapeutic_area_id);
CREATE INDEX IF NOT EXISTS idx_l0_indications_product ON l0_product_indications(product_id);
CREATE INDEX IF NOT EXISTS idx_l0_indications_disease ON l0_product_indications(disease_id);

-- =====================================================================
-- CDC SUPPORT (for Neo4j projection)
-- =====================================================================
-- Note: Ensure these tables are included in Debezium connector config

COMMENT ON TABLE l0_therapeutic_areas IS 'L0: Therapeutic areas - thin reference to RAG content';
COMMENT ON TABLE l0_diseases IS 'L0: Diseases/indications - thin reference to RAG content';
COMMENT ON TABLE l0_products IS 'L0: Products (tenant-specific) - thin reference to RAG content';
COMMENT ON TABLE l0_evidence_types IS 'L0: Evidence type taxonomy - reference data';
COMMENT ON TABLE l0_stakeholder_types IS 'L0: Stakeholder/KOL categories - reference data';
COMMENT ON TABLE l0_regulatory_jurisdictions IS 'L0: Regulatory jurisdictions - reference data';

-- =====================================================================
-- SEED DATA: Core Evidence Types
-- =====================================================================

INSERT INTO l0_evidence_types (unique_id, name, code, evidence_category, evidence_level, payer_relevance_score, regulatory_acceptance)
VALUES
  ('EVD-RCT-PIVOTAL', 'Pivotal Randomized Controlled Trial', 'RCT-PIV', 'clinical_trial', '1b', 10, ARRAY['FDA', 'EMA', 'PMDA']),
  ('EVD-RCT-PHASE3', 'Phase 3 Clinical Trial', 'RCT-P3', 'clinical_trial', '1b', 10, ARRAY['FDA', 'EMA', 'PMDA']),
  ('EVD-RCT-PHASE2', 'Phase 2 Clinical Trial', 'RCT-P2', 'clinical_trial', '2a', 7, ARRAY['FDA', 'EMA']),
  ('EVD-META', 'Meta-Analysis', 'META', 'meta_analysis', '1a', 9, ARRAY['FDA', 'EMA', 'NICE', 'ICER']),
  ('EVD-SYSREV', 'Systematic Review', 'SYSREV', 'systematic_review', '1a', 8, ARRAY['NICE', 'ICER']),
  ('EVD-RWE', 'Real-World Evidence', 'RWE', 'real_world', '2b', 7, ARRAY['FDA', 'EMA']),
  ('EVD-OBS', 'Observational Study', 'OBS', 'observational', '2b', 6, ARRAY['FDA', 'EMA']),
  ('EVD-REGISTRY', 'Registry Study', 'REG', 'registry', '2b', 7, ARRAY['FDA', 'EMA']),
  ('EVD-CLAIMS', 'Claims Data Analysis', 'CLAIMS', 'claims_data', '3', 6, ARRAY['payers']),
  ('EVD-CASE', 'Case Series/Report', 'CASE', 'case_study', '4', 3, ARRAY['FDA'])
ON CONFLICT (unique_id) DO UPDATE SET
  name = EXCLUDED.name,
  evidence_level = EXCLUDED.evidence_level;

-- =====================================================================
-- SEED DATA: Core Regulatory Jurisdictions
-- =====================================================================

INSERT INTO l0_regulatory_jurisdictions (unique_id, name, code, regulatory_body, regulatory_body_acronym, jurisdiction_type, region, expedited_pathways)
VALUES
  ('REG-US-FDA', 'United States', 'US', 'Food and Drug Administration', 'FDA', 'national', 'North America', ARRAY['Breakthrough Therapy', 'Fast Track', 'Priority Review', 'Accelerated Approval']),
  ('REG-EU-EMA', 'European Union', 'EU', 'European Medicines Agency', 'EMA', 'supranational', 'Europe', ARRAY['PRIME', 'Accelerated Assessment', 'Conditional Marketing Authorization']),
  ('REG-JP-PMDA', 'Japan', 'JP', 'Pharmaceuticals and Medical Devices Agency', 'PMDA', 'national', 'Asia Pacific', ARRAY['SAKIGAKE', 'Conditional Early Approval']),
  ('REG-UK-MHRA', 'United Kingdom', 'GB', 'Medicines and Healthcare products Regulatory Agency', 'MHRA', 'national', 'Europe', ARRAY['ILAP', 'Rolling Review']),
  ('REG-CN-NMPA', 'China', 'CN', 'National Medical Products Administration', 'NMPA', 'national', 'Asia Pacific', ARRAY['Priority Review', 'Breakthrough Therapy']),
  ('REG-CA-HC', 'Canada', 'CA', 'Health Canada', 'HC', 'national', 'North America', ARRAY['Priority Review', 'Notice of Compliance with Conditions']),
  ('REG-AU-TGA', 'Australia', 'AU', 'Therapeutic Goods Administration', 'TGA', 'national', 'Asia Pacific', ARRAY['Priority Review'])
ON CONFLICT (unique_id) DO UPDATE SET
  expedited_pathways = EXCLUDED.expedited_pathways;

-- =====================================================================
-- SEED DATA: Major Therapeutic Areas
-- =====================================================================

INSERT INTO l0_therapeutic_areas (unique_id, name, code, level, regulatory_complexity)
VALUES
  ('TA-ONCOLOGY', 'Oncology', 'L-ATC', 1, 'high'),
  ('TA-IMMUNOLOGY', 'Immunology', 'L-IMM', 1, 'elevated'),
  ('TA-NEUROLOGY', 'Neurology', 'N', 1, 'elevated'),
  ('TA-CARDIOLOGY', 'Cardiovascular', 'C', 1, 'standard'),
  ('TA-METABOLIC', 'Metabolic/Endocrine', 'A-H', 1, 'standard'),
  ('TA-RESPIRATORY', 'Respiratory', 'R', 1, 'standard'),
  ('TA-INFECTIOUS', 'Infectious Disease', 'J', 1, 'elevated'),
  ('TA-RARE', 'Rare Diseases', 'ORPHAN', 1, 'orphan'),
  ('TA-HEMATOLOGY', 'Hematology', 'B', 1, 'elevated'),
  ('TA-DERMATOLOGY', 'Dermatology', 'D', 1, 'standard'),
  ('TA-GI', 'Gastroenterology', 'A', 1, 'standard'),
  ('TA-OPHTHALMOLOGY', 'Ophthalmology', 'S01', 1, 'standard'),
  ('TA-NEPHROLOGY', 'Nephrology', 'C03', 1, 'standard'),
  ('TA-PSYCHIATRY', 'Psychiatry', 'N05-N06', 1, 'standard'),
  ('TA-VACCINES', 'Vaccines', 'J07', 1, 'elevated')
ON CONFLICT (unique_id) DO UPDATE SET
  regulatory_complexity = EXCLUDED.regulatory_complexity;

-- =====================================================================
-- SEED DATA: Core Stakeholder Types
-- =====================================================================

INSERT INTO l0_stakeholder_types (unique_id, name, code, stakeholder_category, typical_engagement_channels, decision_influence_areas)
VALUES
  ('STK-KOL', 'Key Opinion Leader', 'KOL', 'hcp', ARRAY['advisory boards', 'congresses', 'publications', '1:1 meetings'], ARRAY['clinical practice', 'treatment guidelines', 'peer influence']),
  ('STK-HCP-SPECIALIST', 'Specialist Physician', 'HCP-SPEC', 'hcp', ARRAY['1:1 meetings', 'congresses', 'webinars'], ARRAY['prescribing decisions', 'patient care']),
  ('STK-HCP-PCP', 'Primary Care Physician', 'HCP-PCP', 'hcp', ARRAY['rep visits', 'digital channels', 'CME'], ARRAY['referrals', 'chronic care management']),
  ('STK-PAYER-PHARMACY', 'Pharmacy Benefit Manager', 'PBM', 'payer', ARRAY['P&T committees', 'value dossiers', 'contracting'], ARRAY['formulary', 'access', 'pricing']),
  ('STK-PAYER-MCO', 'Managed Care Organization', 'MCO', 'payer', ARRAY['P&T committees', 'value dossiers'], ARRAY['coverage policy', 'prior auth']),
  ('STK-REGULATOR', 'Regulatory Authority', 'REG', 'regulator', ARRAY['submissions', 'meetings', 'inspections'], ARRAY['approval', 'labeling', 'post-marketing']),
  ('STK-PATIENT-ADVOCACY', 'Patient Advocacy Group', 'PAG', 'advocacy', ARRAY['partnerships', 'grants', 'awareness campaigns'], ARRAY['patient voice', 'access advocacy', 'disease awareness']),
  ('STK-ACADEMIC', 'Academic Researcher', 'ACAD', 'academic', ARRAY['ISS/IIS', 'publications', 'congresses'], ARRAY['research direction', 'publication', 'education'])
ON CONFLICT (unique_id) DO UPDATE SET
  typical_engagement_channels = EXCLUDED.typical_engagement_channels;
