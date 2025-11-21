-- ============================================================================
-- SEED 30 KNOWLEDGE DOMAINS FOR HEALTHCARE AI AGENTS
-- ============================================================================
-- Creates knowledge_domains table and populates with 30 healthcare domains
-- organized in 3 tiers: Core (15), Specialized (10), Emerging (5)
-- ============================================================================

-- Step 1: Create table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1, -- 1=Core, 2=Specialized, 3=Emerging
  priority INTEGER NOT NULL DEFAULT 1, -- Display/sorting priority (1-30)
  keywords TEXT[] DEFAULT '{}', -- Search keywords for matching
  sub_domains TEXT[] DEFAULT '{}', -- Sub-domain categories
  agent_count_estimate INTEGER DEFAULT 0, -- Estimated number of agents using this domain
  color TEXT DEFAULT '#3B82F6', -- UI color code
  icon TEXT DEFAULT 'book', -- Icon name
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  recommended_models JSONB DEFAULT '{
    "embedding": {
      "primary": "text-embedding-3-large",
      "alternatives": ["text-embedding-ada-002"],
      "specialized": null
    },
    "chat": {
      "primary": "gpt-4-turbo-preview",
      "alternatives": ["gpt-3.5-turbo"],
      "specialized": null
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_code ON public.knowledge_domains(code);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_keywords ON public.knowledge_domains USING GIN(keywords);

-- Enable RLS (Row Level Security)
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Allow service role to manage knowledge_domains" ON public.knowledge_domains;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

-- Create policy for service role to insert/update
CREATE POLICY "Allow service role to manage knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (auth.role() = 'service_role');

-- Step 2: Insert 30 Knowledge Domains
-- ============================================================================

-- TIER 1: CORE DOMAINS (15 domains - mission-critical)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon) VALUES
('REG_AFFAIRS', 'Regulatory Affairs', 'regulatory_affairs',
 'FDA, EMA, and global regulatory submissions, approvals, and compliance',
 1, 1,
 ARRAY['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', '510k', 'pma', 'nda', 'bla'],
 '#DC2626', 'shield-check'),

('CLIN_DEV', 'Clinical Development', 'clinical_development',
 'Clinical trial design, protocol development, and study execution',
 1, 2,
 ARRAY['clinical trial', 'protocol', 'study design', 'phase 1', 'phase 2', 'phase 3', 'cro', 'investigator'],
 '#2563EB', 'flask'),

('PHARMACOVIG', 'Pharmacovigilance', 'pharmacovigilance',
 'Drug safety monitoring, adverse event reporting, and risk management',
 1, 3,
 ARRAY['safety', 'adverse event', 'pharmacovigilance', 'signal detection', 'icsr', 'psur', 'pbrer'],
 '#DC2626', 'alert-triangle'),

('QUALITY_MGMT', 'Quality Assurance', 'quality_assurance',
 'GMP, quality control, validation, and manufacturing compliance',
 1, 4,
 ARRAY['gmp', 'quality', 'validation', 'capa', 'audit', 'deviation', 'manufacturing'],
 '#059669', 'check-circle'),

('MED_AFFAIRS', 'Medical Affairs', 'medical_affairs',
 'Medical information, scientific communication, and KOL engagement',
 1, 5,
 ARRAY['medical affairs', 'msl', 'kol', 'scientific communication', 'publication', 'congress'],
 '#7C3AED', 'user-md'),

('DRUG_SAFETY', 'Drug Safety', 'drug_safety',
 'Safety surveillance, causality assessment, and benefit-risk analysis',
 1, 6,
 ARRAY['drug safety', 'adr', 'adverse drug reaction', 'safety surveillance', 'causality'],
 '#DC2626', 'shield'),

('CLIN_OPS', 'Clinical Operations', 'clinical_operations',
 'Site management, monitoring, and clinical data collection',
 1, 7,
 ARRAY['clinical operations', 'site monitoring', 'data management', 'ctms', 'edc', 'recruitment'],
 '#0891B2', 'briefcase'),

('MED_WRITING', 'Medical Writing', 'medical_writing',
 'Clinical study reports, protocols, and regulatory documents',
 1, 8,
 ARRAY['medical writing', 'csr', 'protocol', 'investigator brochure', 'regulatory document'],
 '#4F46E5', 'file-text'),

('BIOSTAT', 'Biostatistics', 'biostatistics',
 'Statistical analysis, sample size calculation, and study design',
 1, 9,
 ARRAY['biostatistics', 'statistical analysis', 'sample size', 'sap', 'interim analysis'],
 '#7C3AED', 'bar-chart'),

('DATA_MGMT', 'Data Management', 'data_management',
 'Clinical data management, CDISC standards, and data quality',
 1, 10,
 ARRAY['data management', 'cdm', 'cdisc', 'sdtm', 'adam', 'data cleaning'],
 '#0891B2', 'database'),

('TRANS_MED', 'Translational Medicine', 'translational_medicine',
 'Biomarkers, precision medicine, and bench-to-bedside research',
 1, 11,
 ARRAY['translational medicine', 'biomarker', 'precision medicine', 'companion diagnostic'],
 '#7C3AED', 'activity'),

('MARKET_ACCESS', 'Market Access', 'market_access',
 'Pricing, reimbursement, and payer negotiations',
 1, 12,
 ARRAY['market access', 'pricing', 'reimbursement', 'payer', 'hta', 'value dossier'],
 '#059669', 'dollar-sign'),

('LABELING_ADV', 'Labeling & Advertising', 'labeling_advertising',
 'Product labeling, promotional materials, and compliance',
 1, 13,
 ARRAY['labeling', 'advertising', 'promotional', 'product label', 'package insert'],
 '#D97706', 'tag'),

('POST_MARKET', 'Post-Market Surveillance', 'post_market_surveillance',
 'Post-approval safety monitoring and lifecycle management',
 1, 14,
 ARRAY['post-market', 'surveillance', 'rems', 'risk management', 'lifecycle'],
 '#DC2626', 'eye'),

('PATIENT_ENG', 'Patient Engagement', 'patient_engagement',
 'Patient recruitment, retention, and patient-reported outcomes',
 1, 15,
 ARRAY['patient engagement', 'recruitment', 'retention', 'pro', 'patient-centered'],
 '#EC4899', 'users');

-- TIER 2: SPECIALIZED DOMAINS (10 domains - high value)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon) VALUES
('SCI_PUB', 'Scientific Publications', 'scientific_publications',
 'Manuscript writing, peer review, and scientific publishing',
 2, 16,
 ARRAY['publication', 'manuscript', 'journal', 'peer review', 'abstract', 'poster'],
 '#4F46E5', 'book-open'),

('NONCLIN_SCI', 'Nonclinical Sciences', 'nonclinical_sciences',
 'Preclinical research, toxicology, and pharmacology studies',
 2, 17,
 ARRAY['preclinical', 'toxicology', 'pharmacology', 'in vitro', 'in vivo', 'animal study'],
 '#7C3AED', 'microscope'),

('RISK_MGMT', 'Risk Management', 'risk_management',
 'Risk assessment, mitigation strategies, and risk management plans',
 2, 18,
 ARRAY['risk management', 'risk assessment', 'rmp', 'risk mitigation', 'benefit-risk'],
 '#DC2626', 'alert-octagon'),

('SUBMISSIONS', 'Submissions & Filings', 'submissions_and_filings',
 'IND, NDA, BLA, and regulatory submission strategies',
 2, 19,
 ARRAY['submission', 'ind', 'nda', 'bla', 'maa', 'dossier', 'ctd', 'ectd'],
 '#DC2626', 'upload'),

('HEOR', 'Health Economics', 'health_economics',
 'Health economics, outcomes research, and value assessment',
 2, 20,
 ARRAY['heor', 'health economics', 'cost effectiveness', 'qaly', 'value dossier'],
 '#059669', 'trending-up'),

('MED_DEVICES', 'Medical Devices', 'medical_devices',
 'Medical device regulations, 510k, PMA, and device classification',
 2, 21,
 ARRAY['medical device', 'ivd', '510k', 'pma', 'mdr', 'ivdr', 'class i', 'class ii', 'class iii'],
 '#D97706', 'cpu'),

('BIOINFORMATICS', 'Bioinformatics', 'bioinformatics',
 'Genomics, proteomics, and computational biology',
 2, 22,
 ARRAY['bioinformatics', 'genomics', 'proteomics', 'ngs', 'biomarker', 'omics'],
 '#7C3AED', 'code'),

('COMP_DIAG', 'Companion Diagnostics', 'companion_diagnostics',
 'Companion diagnostic development and validation',
 2, 23,
 ARRAY['companion diagnostic', 'cdx', 'biomarker testing', 'patient selection', 'precision medicine'],
 '#4F46E5', 'target'),

('REG_INTEL', 'Regulatory Intelligence', 'regulatory_intelligence',
 'Regulatory landscape monitoring and competitive intelligence',
 2, 24,
 ARRAY['regulatory intelligence', 'competitive intelligence', 'landscape', 'guideline monitoring'],
 '#0891B2', 'search'),

('LIFECYCLE_MGMT', 'Lifecycle Management', 'lifecycle_management',
 'Product lifecycle strategies and portfolio management',
 2, 25,
 ARRAY['lifecycle management', 'portfolio', 'strategy', 'product development'],
 '#059669', 'refresh-cw');

-- TIER 3: EMERGING DOMAINS (5 domains - future-focused)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon) VALUES
('DIGITAL_HEALTH', 'Digital Health', 'digital_health',
 'Digital therapeutics, mHealth, wearables, and connected devices',
 3, 26,
 ARRAY['digital health', 'mobile health', 'mhealth', 'wearable', 'digital therapeutic', 'remote monitoring'],
 '#10B981', 'smartphone'),

('PRECISION_MED', 'Precision Medicine', 'precision_medicine',
 'Personalized therapy, genetic profiling, and targeted treatments',
 3, 27,
 ARRAY['precision medicine', 'personalized medicine', 'genetic profiling', 'targeted therapy'],
 '#7C3AED', 'crosshair'),

('AI_ML_HEALTH', 'AI/ML in Healthcare', 'ai_ml_healthcare',
 'Artificial intelligence and machine learning in drug development',
 3, 28,
 ARRAY['ai', 'machine learning', 'deep learning', 'predictive model', 'clinical decision support'],
 '#6366F1', 'brain'),

('TELEMEDICINE', 'Telemedicine', 'telemedicine',
 'Remote healthcare delivery and virtual consultations',
 3, 29,
 ARRAY['telemedicine', 'telehealth', 'remote consultation', 'virtual visit', 'remote patient monitoring'],
 '#0891B2', 'video'),

('SUSTAINABILITY', 'Sustainability', 'sustainability',
 'Environmental impact, green pharma, and sustainable practices',
 3, 30,
 ARRAY['sustainability', 'environmental', 'green pharma', 'carbon footprint', 'eco-design'],
 '#059669', 'leaf')
ON CONFLICT (slug) DO NOTHING;

-- Step 3: Update recommended models for Tier 1 domains
-- ============================================================================

-- Regulatory Affairs - High accuracy required
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002", "biobert-pubmed"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Regulatory text requires high accuracy for compliance"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus", "gpt-4"],
    "specialized": null,
    "rationale": "Complex regulatory reasoning requires most capable models"
  }
}'::jsonb
WHERE slug = 'regulatory_affairs';

-- Clinical Development
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large", "pubmedbert-abstract"],
    "specialized": "clinicalbert",
    "rationale": "Clinical trial protocols benefit from medical-specific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Clinical reasoning requires medical knowledge"
  }
}'::jsonb
WHERE slug = 'clinical_development';

-- Pharmacovigilance
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "pubmedbert-abstract-fulltext",
    "rationale": "Safety data requires medical terminology understanding"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Safety analysis requires high accuracy and medical knowledge"
  }
}'::jsonb
WHERE slug = 'pharmacovigilance';

-- Quality Assurance
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "text-embedding-3-large",
    "alternatives": ["text-embedding-ada-002"],
    "specialized": null,
    "rationale": "Quality documents use standard regulatory language"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-sonnet"],
    "specialized": null,
    "rationale": "Quality processes require detailed reasoning"
  }
}'::jsonb
WHERE slug = 'quality_assurance';

-- Medical Affairs
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "pubmedbert-abstract",
    "alternatives": ["text-embedding-3-large", "biobert-pubmed"],
    "specialized": "scibert",
    "rationale": "Medical literature requires scientific embeddings"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Medical communication requires clinical expertise"
  }
}'::jsonb
WHERE slug = 'medical_affairs';

-- Drug Safety
UPDATE public.knowledge_domains
SET recommended_models = '{
  "embedding": {
    "primary": "biobert-pubmed",
    "alternatives": ["text-embedding-3-large"],
    "specialized": "clinicalbert",
    "rationale": "Safety reports require medical terminology"
  },
  "chat": {
    "primary": "gpt-4-turbo-preview",
    "alternatives": ["claude-3-opus"],
    "specialized": "meditron-70b",
    "rationale": "Safety analysis requires medical expertise"
  }
}'::jsonb
WHERE slug = 'drug_safety';

-- Add comments
COMMENT ON TABLE public.knowledge_domains IS 'Knowledge domain categories for organizing RAG knowledge bases and agent capabilities';
COMMENT ON COLUMN public.knowledge_domains.tier IS 'Domain tier: 1=Core (must have), 2=Specialized (high value), 3=Emerging (future)';
COMMENT ON COLUMN public.knowledge_domains.recommended_models IS 'Recommended LLM models for this domain (embedding + chat models)';

-- Verification query
SELECT
  tier,
  COUNT(*) as domain_count,
  string_agg(name, ', ' ORDER BY priority) as domains
FROM public.knowledge_domains
GROUP BY tier
ORDER BY tier;
