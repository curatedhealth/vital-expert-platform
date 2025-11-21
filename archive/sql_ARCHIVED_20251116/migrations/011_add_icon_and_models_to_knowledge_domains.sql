-- ============================================================================
-- ADD MISSING COLUMNS TO knowledge_domains TABLE
-- ============================================================================
-- Adds icon and recommended_models columns if they don't exist
-- Then populates all 30 knowledge domains
-- ============================================================================

-- Add icon column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'knowledge_domains'
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.knowledge_domains ADD COLUMN icon TEXT DEFAULT 'book';
    RAISE NOTICE 'Added icon column to knowledge_domains';
  END IF;
END $$;

-- Add recommended_models column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'knowledge_domains'
    AND column_name = 'recommended_models'
  ) THEN
    ALTER TABLE public.knowledge_domains ADD COLUMN recommended_models JSONB DEFAULT '{
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
    }'::jsonb;
    RAISE NOTICE 'Added recommended_models column to knowledge_domains';
  END IF;
END $$;

-- ============================================================================
-- INSERT 30 KNOWLEDGE DOMAINS
-- ============================================================================

-- TIER 1: CORE DOMAINS (15 domains - mission-critical)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon, is_active) VALUES
('REG_AFFAIRS', 'Regulatory Affairs', 'regulatory_affairs',
 'FDA, EMA, and global regulatory submissions, approvals, and compliance',
 1, 1,
 ARRAY['regulatory', 'fda', 'ema', 'submission', 'approval', 'compliance', '510k', 'pma', 'nda', 'bla'],
 '#DC2626', 'shield-check', true),

('CLIN_DEV', 'Clinical Development', 'clinical_development',
 'Clinical trial design, protocol development, and study execution',
 1, 2,
 ARRAY['clinical trial', 'protocol', 'study design', 'phase 1', 'phase 2', 'phase 3', 'cro', 'investigator'],
 '#2563EB', 'flask', true),

('PHARMACOVIG', 'Pharmacovigilance', 'pharmacovigilance',
 'Drug safety monitoring, adverse event reporting, and risk management',
 1, 3,
 ARRAY['safety', 'adverse event', 'pharmacovigilance', 'signal detection', 'icsr', 'psur', 'pbrer'],
 '#DC2626', 'alert-triangle', true),

('QUALITY_MGMT', 'Quality Assurance', 'quality_assurance',
 'GMP, quality control, validation, and manufacturing compliance',
 1, 4,
 ARRAY['gmp', 'quality', 'validation', 'capa', 'audit', 'deviation', 'manufacturing'],
 '#059669', 'check-circle', true),

('MED_AFFAIRS', 'Medical Affairs', 'medical_affairs',
 'Medical information, scientific communication, and KOL engagement',
 1, 5,
 ARRAY['medical affairs', 'msl', 'kol', 'scientific communication', 'publication', 'congress'],
 '#7C3AED', 'user-md', true),

('DRUG_SAFETY', 'Drug Safety', 'drug_safety',
 'Safety surveillance, causality assessment, and benefit-risk analysis',
 1, 6,
 ARRAY['drug safety', 'adr', 'adverse drug reaction', 'safety surveillance', 'causality'],
 '#DC2626', 'shield', true),

('CLIN_OPS', 'Clinical Operations', 'clinical_operations',
 'Site management, monitoring, and clinical data collection',
 1, 7,
 ARRAY['clinical operations', 'site monitoring', 'data management', 'ctms', 'edc', 'recruitment'],
 '#0891B2', 'briefcase', true),

('MED_WRITING', 'Medical Writing', 'medical_writing',
 'Clinical study reports, protocols, and regulatory documents',
 1, 8,
 ARRAY['medical writing', 'csr', 'protocol', 'investigator brochure', 'regulatory document'],
 '#4F46E5', 'file-text', true),

('BIOSTAT', 'Biostatistics', 'biostatistics',
 'Statistical analysis, sample size calculation, and study design',
 1, 9,
 ARRAY['biostatistics', 'statistical analysis', 'sample size', 'sap', 'interim analysis'],
 '#7C3AED', 'bar-chart', true),

('DATA_MGMT', 'Data Management', 'data_management',
 'Clinical data management, CDISC standards, and data quality',
 1, 10,
 ARRAY['data management', 'cdm', 'cdisc', 'sdtm', 'adam', 'data cleaning'],
 '#0891B2', 'database', true),

('TRANS_MED', 'Translational Medicine', 'translational_medicine',
 'Biomarkers, precision medicine, and bench-to-bedside research',
 1, 11,
 ARRAY['translational medicine', 'biomarker', 'precision medicine', 'companion diagnostic'],
 '#7C3AED', 'activity', true),

('MARKET_ACCESS', 'Market Access', 'market_access',
 'Pricing, reimbursement, and payer negotiations',
 1, 12,
 ARRAY['market access', 'pricing', 'reimbursement', 'payer', 'hta', 'value dossier'],
 '#059669', 'dollar-sign', true),

('LABELING_ADV', 'Labeling & Advertising', 'labeling_advertising',
 'Product labeling, promotional materials, and compliance',
 1, 13,
 ARRAY['labeling', 'advertising', 'promotional', 'product label', 'package insert'],
 '#D97706', 'tag', true),

('POST_MARKET', 'Post-Market Surveillance', 'post_market_surveillance',
 'Post-approval safety monitoring and lifecycle management',
 1, 14,
 ARRAY['post-market', 'surveillance', 'rems', 'risk management', 'lifecycle'],
 '#DC2626', 'eye', true),

('PATIENT_ENG', 'Patient Engagement', 'patient_engagement',
 'Patient recruitment, retention, and patient-reported outcomes',
 1, 15,
 ARRAY['patient engagement', 'recruitment', 'retention', 'pro', 'patient-centered'],
 '#EC4899', 'users', true)
ON CONFLICT (slug) DO NOTHING;

-- TIER 2: SPECIALIZED DOMAINS (10 domains - high value)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon, is_active) VALUES
('SCI_PUB', 'Scientific Publications', 'scientific_publications',
 'Manuscript writing, peer review, and scientific publishing',
 2, 16,
 ARRAY['publication', 'manuscript', 'journal', 'peer review', 'abstract', 'poster'],
 '#4F46E5', 'book-open', true),

('NONCLIN_SCI', 'Nonclinical Sciences', 'nonclinical_sciences',
 'Preclinical research, toxicology, and pharmacology studies',
 2, 17,
 ARRAY['preclinical', 'toxicology', 'pharmacology', 'in vitro', 'in vivo', 'animal study'],
 '#7C3AED', 'microscope', true),

('RISK_MGMT', 'Risk Management', 'risk_management',
 'Risk assessment, mitigation strategies, and risk management plans',
 2, 18,
 ARRAY['risk management', 'risk assessment', 'rmp', 'risk mitigation', 'benefit-risk'],
 '#DC2626', 'alert-octagon', true),

('SUBMISSIONS', 'Submissions & Filings', 'submissions_and_filings',
 'IND, NDA, BLA, and regulatory submission strategies',
 2, 19,
 ARRAY['submission', 'ind', 'nda', 'bla', 'maa', 'dossier', 'ctd', 'ectd'],
 '#DC2626', 'upload', true),

('HEOR', 'Health Economics', 'health_economics',
 'Health economics, outcomes research, and value assessment',
 2, 20,
 ARRAY['heor', 'health economics', 'cost effectiveness', 'qaly', 'value dossier'],
 '#059669', 'trending-up', true),

('MED_DEVICES', 'Medical Devices', 'medical_devices',
 'Medical device regulations, 510k, PMA, and device classification',
 2, 21,
 ARRAY['medical device', 'ivd', '510k', 'pma', 'mdr', 'ivdr', 'class i', 'class ii', 'class iii'],
 '#D97706', 'cpu', true),

('BIOINFORMATICS', 'Bioinformatics', 'bioinformatics',
 'Genomics, proteomics, and computational biology',
 2, 22,
 ARRAY['bioinformatics', 'genomics', 'proteomics', 'ngs', 'biomarker', 'omics'],
 '#7C3AED', 'code', true),

('COMP_DIAG', 'Companion Diagnostics', 'companion_diagnostics',
 'Companion diagnostic development and validation',
 2, 23,
 ARRAY['companion diagnostic', 'cdx', 'biomarker testing', 'patient selection', 'precision medicine'],
 '#4F46E5', 'target', true),

('REG_INTEL', 'Regulatory Intelligence', 'regulatory_intelligence',
 'Regulatory landscape monitoring and competitive intelligence',
 2, 24,
 ARRAY['regulatory intelligence', 'competitive intelligence', 'landscape', 'guideline monitoring'],
 '#0891B2', 'search', true),

('LIFECYCLE_MGMT', 'Lifecycle Management', 'lifecycle_management',
 'Product lifecycle strategies and portfolio management',
 2, 25,
 ARRAY['lifecycle management', 'portfolio', 'strategy', 'product development'],
 '#059669', 'refresh-cw', true)
ON CONFLICT (slug) DO NOTHING;

-- TIER 3: EMERGING DOMAINS (5 domains - future-focused)
-- ============================================================================

INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, color, icon, is_active) VALUES
('DIGITAL_HEALTH', 'Digital Health', 'digital_health',
 'Digital therapeutics, mHealth, wearables, and connected devices',
 3, 26,
 ARRAY['digital health', 'mobile health', 'mhealth', 'wearable', 'digital therapeutic', 'remote monitoring'],
 '#10B981', 'smartphone', true),

('PRECISION_MED', 'Precision Medicine', 'precision_medicine',
 'Personalized therapy, genetic profiling, and targeted treatments',
 3, 27,
 ARRAY['precision medicine', 'personalized medicine', 'genetic profiling', 'targeted therapy'],
 '#7C3AED', 'crosshair', true),

('AI_ML_HEALTH', 'AI/ML in Healthcare', 'ai_ml_healthcare',
 'Artificial intelligence and machine learning in drug development',
 3, 28,
 ARRAY['ai', 'machine learning', 'deep learning', 'predictive model', 'clinical decision support'],
 '#6366F1', 'brain', true),

('TELEMEDICINE', 'Telemedicine', 'telemedicine',
 'Remote healthcare delivery and virtual consultations',
 3, 29,
 ARRAY['telemedicine', 'telehealth', 'remote consultation', 'virtual visit', 'remote patient monitoring'],
 '#0891B2', 'video', true),

('SUSTAINABILITY', 'Sustainability', 'sustainability',
 'Environmental impact, green pharma, and sustainable practices',
 3, 30,
 ARRAY['sustainability', 'environmental', 'green pharma', 'carbon footprint', 'eco-design'],
 '#059669', 'leaf', true)
ON CONFLICT (slug) DO NOTHING;

-- Update recommended_models for key Tier 1 domains with specialized models
-- ============================================================================

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

-- Add table comments
COMMENT ON COLUMN public.knowledge_domains.icon IS 'Icon identifier for UI display';
COMMENT ON COLUMN public.knowledge_domains.recommended_models IS 'Recommended LLM models for this domain (embedding + chat models)';

-- Verification query
SELECT
  tier,
  COUNT(*) as domain_count,
  STRING_AGG(name, ', ' ORDER BY priority) as domains
FROM public.knowledge_domains
GROUP BY tier
ORDER BY tier;

-- Success message
DO $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.knowledge_domains;
  RAISE NOTICE '✅ Successfully populated knowledge_domains table!';
  RAISE NOTICE '   Total domains: %', total_count;
  RAISE NOTICE '   - Tier 1 (Core): 15 domains';
  RAISE NOTICE '   - Tier 2 (Specialized): 10 domains';
  RAISE NOTICE '   - Tier 3 (Emerging): 5 domains';
END $$;
