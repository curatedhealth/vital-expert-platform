-- ============================================================================
-- CREATE KNOWLEDGE DOMAINS TABLE AND POPULATE WITH 30 DOMAINS
-- ============================================================================
-- This script creates the knowledge_domains table with tier filtering
-- and populates it with 30 healthcare knowledge domains
-- ============================================================================

-- Step 1: Create the table
-- ============================================================================

DROP TABLE IF EXISTS public.knowledge_domains CASCADE;

CREATE TABLE public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1, -- 1=Core, 2=Specialized, 3=Emerging
  priority INTEGER NOT NULL DEFAULT 1, -- Display/sorting priority (1-30)
  keywords TEXT[] DEFAULT '{}', -- Search keywords for matching
  sub_domains TEXT[] DEFAULT '{}', -- Sub-domain categories
  agent_count_estimate INTEGER DEFAULT 0, -- Estimated number of agents
  color TEXT DEFAULT '#3B82F6', -- UI color code
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX idx_knowledge_domains_code ON public.knowledge_domains(code);
CREATE INDEX idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX idx_knowledge_domains_active ON public.knowledge_domains(is_active);
CREATE INDEX idx_knowledge_domains_keywords ON public.knowledge_domains USING GIN(keywords);

-- Enable RLS
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow service role to manage knowledge_domains" ON public.knowledge_domains;
CREATE POLICY "Allow service role to manage knowledge_domains"
  ON public.knowledge_domains
  FOR ALL
  USING (auth.role() = 'service_role');

-- Step 2: Insert the 30 knowledge domains
-- ============================================================================

-- TIER 1: CORE DOMAINS (15)
INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, sub_domains, agent_count_estimate, color) VALUES
('REG_AFFAIRS', 'Regulatory Affairs', 'regulatory_affairs', 'FDA, EMA, ICH guidelines, regulatory strategy, submissions, and compliance', 1, 1, ARRAY['fda', 'ema', 'ich', 'regulatory', 'compliance', 'submissions', 'guidance'], ARRAY['fda_regulations', 'ema_regulations', 'ich_guidelines', 'regulatory_strategy', 'submission_management'], 85, '#3B82F6'),
('CLIN_DEV', 'Clinical Development', 'clinical_development', 'Clinical trial design, protocol development, study management, and clinical operations', 1, 2, ARRAY['clinical trials', 'protocols', 'study design', 'endpoints', 'site management'], ARRAY['protocol_design', 'clinical_operations', 'study_management', 'endpoint_selection', 'site_management'], 37, '#8B5CF6'),
('PV', 'Pharmacovigilance', 'pharmacovigilance', 'Drug safety monitoring, adverse event reporting, signal detection, and risk management', 1, 3, ARRAY['safety', 'adverse events', 'signal detection', 'pvg', 'safety surveillance'], ARRAY['adverse_event_reporting', 'signal_detection', 'risk_management', 'safety_surveillance', 'benefit_risk_assessment'], 25, '#EF4444'),
('QM', 'Quality Management', 'quality_management', 'Quality assurance, quality control, GMP compliance, validation, and auditing', 1, 4, ARRAY['quality', 'qa', 'qc', 'gmp', 'validation', 'audit'], ARRAY['quality_assurance', 'quality_control', 'gmp_compliance', 'validation', 'audit_management'], 20, '#10B981'),
('MED_AFF', 'Medical Affairs', 'medical_affairs', 'Medical science liaisons, medical writing, scientific communication, and publication planning', 1, 5, ARRAY['msl', 'medical writing', 'scientific communication', 'publications', 'medical information'], ARRAY['medical_information', 'scientific_communication', 'medical_writing', 'msl_activities', 'publication_planning'], 15, '#06B6D4'),
('COMM_STRAT', 'Commercial Strategy', 'commercial_strategy', 'Market access, reimbursement, pricing strategy, brand management, and launch planning', 1, 6, ARRAY['market access', 'reimbursement', 'pricing', 'brand', 'commercial', 'launch'], ARRAY['market_access', 'reimbursement', 'pricing_strategy', 'brand_management', 'launch_planning'], 29, '#F59E0B'),
('DRUG_DEV', 'Drug Development', 'drug_development', 'Drug discovery, preclinical development, translational medicine, and formulation', 1, 7, ARRAY['discovery', 'preclinical', 'translational', 'r&d', 'research', 'development'], ARRAY['drug_discovery', 'preclinical_development', 'translational_medicine', 'biomarker_research', 'formulation_development'], 39, '#8B5CF6'),
('CLIN_DATA', 'Clinical Data Analytics', 'clinical_data_analytics', 'Biostatistics, data management, statistical analysis, and clinical programming', 1, 8, ARRAY['biostatistics', 'data management', 'statistics', 'sas', 'clinical data'], ARRAY['biostatistics', 'data_management', 'statistical_analysis', 'clinical_programming', 'data_visualization'], 18, '#6366F1'),
('MFG_OPS', 'Manufacturing Operations', 'manufacturing_operations', 'Drug product/substance manufacturing, process development, scale-up, and tech transfer', 1, 9, ARRAY['manufacturing', 'cmc', 'process', 'production', 'scale-up'], ARRAY['drug_product_manufacturing', 'drug_substance_manufacturing', 'process_development', 'scale_up', 'tech_transfer'], 17, '#78716C'),
('MED_DEV', 'Medical Devices', 'medical_devices', 'Device classification, 510(k) pathway, PMA submissions, design controls, and device regulation', 1, 10, ARRAY['medical devices', '510k', 'pma', 'device', 'classification'], ARRAY['device_classification', '510k_pathway', 'pma_submissions', 'design_controls', 'post_market_surveillance'], 12, '#EC4899'),
('DIGITAL_HEALTH', 'Digital Health', 'digital_health', 'Health technology, AI/ML applications, SaMD regulation, connected health, and digital therapeutics', 1, 11, ARRAY['digital health', 'ai', 'ml', 'samd', 'software', 'health tech'], ARRAY['health_technology', 'ai_ml_applications', 'samd_regulation', 'connected_health', 'digital_therapeutics'], 34, '#14B8A6'),
('SUPPLY_CHAIN', 'Supply Chain', 'supply_chain', 'Supply planning, distribution, cold chain logistics, inventory optimization, and vendor management', 1, 12, ARRAY['supply chain', 'logistics', 'distribution', 'inventory', 'cold chain'], ARRAY['supply_planning', 'distribution_management', 'cold_chain_logistics', 'inventory_optimization', 'vendor_management'], 15, '#84CC16'),
('LEGAL_COMP', 'Legal & Compliance', 'legal_compliance', 'Healthcare law, HIPAA compliance, intellectual property, contract management, and data privacy', 1, 13, ARRAY['legal', 'compliance', 'hipaa', 'privacy', 'contracts', 'ip'], ARRAY['healthcare_law', 'hipaa_compliance', 'intellectual_property', 'contract_management', 'data_privacy'], 10, '#64748B'),
('HEOR', 'Health Economics & Outcomes Research', 'health_economics', 'Health outcomes research, economic modeling, cost-effectiveness, value demonstration', 1, 14, ARRAY['heor', 'health economics', 'outcomes', 'cost-effectiveness', 'value'], ARRAY['health_outcomes_research', 'economic_modeling', 'cost_effectiveness_analysis', 'value_demonstration', 'comparative_effectiveness'], 12, '#22C55E'),
('BIZ_STRAT', 'Business Strategy', 'business_strategy', 'Strategic planning, licensing, partnerships, competitive intelligence, and portfolio management', 1, 15, ARRAY['business development', 'strategy', 'licensing', 'partnerships', 'bd'], ARRAY['strategic_planning', 'licensing', 'partnerships', 'competitive_intelligence', 'portfolio_management'], 10, '#F97316');

-- TIER 2: SPECIALIZED DOMAINS (10)
INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, sub_domains, agent_count_estimate, color) VALUES
('PROD_LABEL', 'Product Labeling', 'product_labeling', 'Labeling requirements, prescribing information, patient information, and IFU', 2, 16, ARRAY['labeling', 'prescribing information', 'package insert', 'patient information'], ARRAY['prescribing_information', 'patient_labeling', 'ifu', 'labeling_changes'], 8, '#A855F7'),
('POST_MKT', 'Post-Market Activities', 'post_market_activities', 'Real-world evidence, post-market surveillance, periodic safety reports, and PMCF', 2, 17, ARRAY['post-market', 'rwe', 'real-world', 'surveillance', 'psur'], ARRAY['real_world_evidence', 'surveillance', 'periodic_safety_reports', 'pmcf'], 10, '#FB923C'),
('CDX', 'Companion Diagnostics', 'companion_diagnostics', 'Biomarkers, diagnostic development, personalized medicine, and companion diagnostic tests', 2, 18, ARRAY['companion diagnostics', 'biomarkers', 'personalized medicine', 'cdx'], ARRAY['biomarker_discovery', 'diagnostic_development', 'personalized_medicine', 'cdx_regulation'], 6, '#EC4899'),
('NONCLIN_SCI', 'Nonclinical Sciences', 'nonclinical_sciences', 'Pharmacology, toxicology, pharmacokinetics, and safety assessment', 2, 19, ARRAY['pharmacology', 'toxicology', 'pk', 'pd', 'safety assessment'], ARRAY['pharmacology', 'toxicology', 'pharmacokinetics', 'safety_assessment'], 12, '#7C3AED'),
('PATIENT_ENG', 'Patient Engagement', 'patient_focus', 'Patient engagement, patient centricity, patient education, and advocacy', 2, 20, ARRAY['patient engagement', 'patient centricity', 'patient education', 'advocacy'], ARRAY['patient_engagement', 'patient_education', 'advocacy', 'patient_reported_outcomes'], 5, '#F472B6'),
('RISK_MGMT', 'Risk Management', 'risk_management', 'Risk assessment, REMS, risk mitigation strategies, and benefit-risk evaluation', 2, 21, ARRAY['risk management', 'rems', 'risk assessment', 'benefit-risk'], ARRAY['risk_assessment', 'rems', 'risk_mitigation', 'benefit_risk_evaluation'], 8, '#DC2626'),
('SCI_PUB', 'Scientific Publications', 'scientific_publications', 'Publications, abstracts, presentations, scientific writing, and peer review', 2, 22, ARRAY['publications', 'abstracts', 'presentations', 'scientific writing', 'peer review'], ARRAY['manuscript_writing', 'abstracts', 'presentations', 'peer_review', 'publication_planning'], 7, '#0EA5E9'),
('KOL_ENG', 'KOL & Stakeholder Engagement', 'stakeholder_engagement', 'KOL management, advisory boards, medical education, and thought leader engagement', 2, 23, ARRAY['kol', 'advisory board', 'medical education', 'thought leaders', 'stakeholders'], ARRAY['kol_management', 'advisory_boards', 'medical_education', 'thought_leadership'], 6, '#8B5CF6'),
('EVID_GEN', 'Evidence Generation', 'evidence_generation', 'Comparative effectiveness, indirect comparisons, network meta-analysis, and systematic reviews', 2, 24, ARRAY['comparative effectiveness', 'indirect comparison', 'network meta-analysis', 'systematic review'], ARRAY['comparative_studies', 'indirect_comparisons', 'network_meta_analysis', 'systematic_reviews'], 5, '#059669'),
('GLOBAL_ACCESS', 'Global Market Access', 'global_access', 'International pricing, HTA submissions, payer negotiations, and global reimbursement', 2, 25, ARRAY['hta', 'international pricing', 'payer', 'global access', 'reimbursement'], ARRAY['international_pricing', 'hta_submissions', 'payer_negotiations', 'global_reimbursement'], 8, '#D97706');

-- TIER 3: EMERGING DOMAINS (5)
INSERT INTO public.knowledge_domains (code, name, slug, description, tier, priority, keywords, sub_domains, agent_count_estimate, color) VALUES
('RWD', 'Real-World Data & Evidence', 'real_world_data', 'Real-world data, real-world evidence, observational studies, and claims data analysis', 3, 26, ARRAY['rwd', 'rwe', 'real-world', 'observational', 'claims data'], ARRAY['rwd_sources', 'rwe_generation', 'observational_studies', 'claims_analysis'], 8, '#0891B2'),
('PRECISION_MED', 'Precision Medicine', 'precision_medicine', 'Genomics, biomarkers, targeted therapies, and personalized treatment approaches', 3, 27, ARRAY['precision medicine', 'genomics', 'targeted therapy', 'personalized treatment'], ARRAY['genomics', 'biomarker_guided_therapy', 'targeted_therapies', 'pharmacogenomics'], 6, '#9333EA'),
('TELEMEDICINE', 'Telemedicine & Remote Care', 'telemedicine', 'Remote monitoring, telehealth, virtual care, and decentralized clinical trials', 3, 28, ARRAY['telemedicine', 'telehealth', 'remote monitoring', 'virtual care', 'dct'], ARRAY['remote_monitoring', 'telehealth', 'virtual_care', 'decentralized_trials'], 5, '#10B981'),
('SUSTAINABILITY', 'Sustainability & ESG', 'sustainability', 'Environmental impact, green chemistry, sustainable packaging, and corporate responsibility', 3, 29, ARRAY['sustainability', 'esg', 'green chemistry', 'environmental', 'carbon footprint'], ARRAY['environmental_impact', 'green_chemistry', 'sustainable_packaging', 'esg_reporting'], 3, '#16A34A'),
('RARE_DISEASES', 'Rare Diseases & Orphan Drugs', 'rare_diseases', 'Orphan designation, ultra-rare diseases, small population studies, and accelerated pathways', 3, 30, ARRAY['rare diseases', 'orphan drugs', 'ultra-rare', 'small populations'], ARRAY['orphan_designation', 'ultra_rare', 'small_populations', 'accelerated_pathways'], 4, '#BE185D');

-- Step 3: Verify the setup
-- ============================================================================

-- Show summary
SELECT
  tier,
  COUNT(*) as domain_count,
  CASE
    WHEN tier = 1 THEN 'Core'
    WHEN tier = 2 THEN 'Specialized'
    WHEN tier = 3 THEN 'Emerging'
  END as tier_name
FROM public.knowledge_domains
GROUP BY tier
ORDER BY tier;

-- Show all domains
SELECT
  priority,
  code,
  name,
  slug,
  tier,
  agent_count_estimate
FROM public.knowledge_domains
ORDER BY priority;
