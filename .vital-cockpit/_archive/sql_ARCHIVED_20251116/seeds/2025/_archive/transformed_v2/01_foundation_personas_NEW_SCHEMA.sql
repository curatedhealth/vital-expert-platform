-- =====================================================================================
-- FOUNDATION PERSONAS - NEW DB SCHEMA
-- =====================================================================================
-- Manually adapted for NEW DB (Vital-expert) schema
-- Target tenant: digital-health-startup (11111111-1111-1111-1111-111111111111)
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants WHERE id = v_tenant_id) THEN
    RAISE EXCEPTION 'Tenant with ID % not found. Please create tenant first.', v_tenant_id;
  END IF;

  RAISE NOTICE 'Using tenant: digital-health-startup (ID: %)', v_tenant_id;
END $$;

-- =====================================================================================
-- FOUNDATION PERSONAS
-- =====================================================================================

INSERT INTO personas (
  tenant_id,
  name,
  slug,
  title,
  tagline,
  seniority_level,
  years_of_experience,
  typical_organization_size,
  key_responsibilities,
  pain_points,
  goals,
  challenges,
  preferred_tools,
  communication_preferences,
  decision_making_style,
  is_active,
  validation_status,
  tags,
  metadata
)
VALUES
-- 1. Clinical Research Director
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Clinical Research Director',
  'clinical-research-director',
  'Director of Clinical Research',
  'Oversees clinical trial strategy and execution',
  'executive',
  15,
  'large',
  ARRAY['Strategic planning for clinical programs', 'Managing clinical trial portfolio', 'Ensuring regulatory compliance', 'Team leadership and development', 'Budget management']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Managing multiple concurrent trials', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Ensuring data quality and compliance', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Recruitment challenges', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Accelerate trial timelines', 'priority', 'high'),
    jsonb_build_object('goal', 'Improve data quality', 'priority', 'high'),
    jsonb_build_object('goal', 'Enhance team productivity', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Complex regulatory requirements', 'impact', 'high'),
    jsonb_build_object('challenge', 'Limited resources', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Technology integration', 'impact', 'medium')
  ),
  ARRAY['CTMS', 'EDC', 'eTMF', 'IRT', 'ePRO']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'weekly',
    'reporting_style', 'executive summary'
  ),
  'data-driven and strategic',
  true,
  'approved',
  ARRAY['clinical_development', 'leadership', 'strategy']::TEXT[],
  jsonb_build_object(
    'domain', 'clinical_development',
    'industry_focus', 'pharmaceuticals',
    'therapeutic_areas', ARRAY['oncology', 'neurology', 'cardiology']
  )
),

-- 2. Regulatory Affairs Manager
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Regulatory Affairs Manager',
  'regulatory-affairs-manager',
  'Regulatory Affairs Manager',
  'Manages regulatory submissions and compliance',
  'senior',
  10,
  'large',
  ARRAY['Preparing regulatory submissions', 'Maintaining regulatory compliance', 'Agency communications', 'Regulatory strategy development', 'Team coordination']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Complex and changing regulations', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Document management across regions', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Tight submission deadlines', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Streamline submission process', 'priority', 'high'),
    jsonb_build_object('goal', 'Ensure regulatory compliance', 'priority', 'high'),
    jsonb_build_object('goal', 'Build strong agency relationships', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Multi-regional submissions', 'impact', 'high'),
    jsonb_build_object('challenge', 'Resource constraints', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Keeping up with regulatory changes', 'impact', 'high')
  ),
  ARRAY['RIM', 'eCTD software', 'RIMS', 'Document management systems']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'bi-weekly',
    'reporting_style', 'detailed'
  ),
  'methodical and detail-oriented',
  true,
  'approved',
  ARRAY['regulatory_affairs', 'compliance', 'submissions']::TEXT[],
  jsonb_build_object(
    'domain', 'regulatory_affairs',
    'regions', ARRAY['US', 'EU', 'APAC'],
    'submission_types', ARRAY['IND', 'NDA', 'BLA', 'MAA']
  )
),

-- 3. Medical Science Liaison
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Medical Science Liaison',
  'medical-science-liaison',
  'Medical Science Liaison (MSL)',
  'Bridges clinical research and medical community',
  'mid',
  7,
  'medium',
  ARRAY['Engaging with key opinion leaders', 'Providing scientific support', 'Gathering medical insights', 'Supporting clinical trials', 'Educational presentations']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Managing large territory', 'severity', 'medium'),
    jsonb_build_object('pain_point', 'Staying current with scientific literature', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Balancing multiple stakeholder needs', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Build strong KOL relationships', 'priority', 'high'),
    jsonb_build_object('goal', 'Provide high-quality scientific information', 'priority', 'high'),
    jsonb_build_object('goal', 'Support clinical trial enrollment', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Time management', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Complex scientific information', 'impact', 'high'),
    jsonb_build_object('challenge', 'Compliance requirements', 'impact', 'medium')
  ),
  ARRAY['CRM', 'Medical information databases', 'Slide decks', 'Literature databases']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'face-to-face',
    'meeting_frequency', 'weekly',
    'reporting_style', 'summary with insights'
  ),
  'relationship-focused and scientifically rigorous',
  true,
  'approved',
  ARRAY['medical_affairs', 'KOL_engagement', 'scientific_communication']::TEXT[],
  jsonb_build_object(
    'domain', 'medical_affairs',
    'therapeutic_areas', ARRAY['oncology', 'immunology'],
    'kol_tier', 'tier_1_and_2'
  )
),

-- 4. Clinical Data Manager
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Clinical Data Manager',
  'clinical-data-manager',
  'Clinical Data Manager',
  'Ensures integrity and quality of clinical trial data',
  'senior',
  8,
  'medium',
  ARRAY['Overseeing data management activities', 'Database design and validation', 'Data quality monitoring', 'Query management', 'Database lock preparation']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Data quality issues', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Complex data structures', 'severity', 'medium'),
    jsonb_build_object('pain_point', 'Tight database lock timelines', 'severity', 'high')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Maintain high data quality', 'priority', 'high'),
    jsonb_build_object('goal', 'Meet database lock deadlines', 'priority', 'high'),
    jsonb_build_object('goal', 'Streamline data cleaning', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Managing large datasets', 'impact', 'high'),
    jsonb_build_object('challenge', 'Protocol amendments', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Resource allocation', 'impact', 'medium')
  ),
  ARRAY['EDC', 'SAS', 'CDMS', 'Data validation tools']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'weekly',
    'reporting_style', 'metrics-focused'
  ),
  'detail-oriented and process-driven',
  true,
  'approved',
  ARRAY['clinical_data_management', 'data_quality', 'EDC']::TEXT[],
  jsonb_build_object(
    'domain', 'clinical_development',
    'standards', ARRAY['CDISC', 'CDASH', 'SDTM'],
    'system_expertise', ARRAY['Medidata Rave', 'Oracle InForm']
  )
),

-- 5. Pharmacovigilance Scientist
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Pharmacovigilance Scientist',
  'pharmacovigilance-scientist',
  'Pharmacovigilance Scientist',
  'Monitors and evaluates drug safety',
  'mid',
  6,
  'medium',
  ARRAY['Safety data review', 'Signal detection', 'Case processing', 'Risk assessment', 'Regulatory safety reporting']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'High case volume', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Tight reporting timelines', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Complex causality assessment', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Ensure patient safety', 'priority', 'high'),
    jsonb_build_object('goal', 'Meet regulatory reporting deadlines', 'priority', 'high'),
    jsonb_build_object('goal', 'Detect signals early', 'priority', 'high')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Data quality from spontaneous reports', 'impact', 'high'),
    jsonb_build_object('challenge', 'Global reporting requirements', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Resource limitations', 'impact', 'medium')
  ),
  ARRAY['Safety database', 'Signal detection tools', 'MedDRA', 'WHO-DD']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'weekly',
    'reporting_style', 'structured'
  ),
  'analytical and detail-focused',
  true,
  'approved',
  ARRAY['pharmacovigilance', 'drug_safety', 'adverse_events']::TEXT[],
  jsonb_build_object(
    'domain', 'medical_affairs',
    'regulations', ARRAY['ICH E2A-E2F', 'EU Pharmacovigilance Directive'],
    'reporting_systems', ARRAY['FDA FAERS', 'EudraVigilance']
  )
),

-- 6. Biostatistician
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Biostatistician',
  'biostatistician',
  'Senior Biostatistician',
  'Designs analyses and interprets clinical trial data',
  'senior',
  9,
  'large',
  ARRAY['Statistical analysis planning', 'Protocol development', 'SAP writing', 'Data analysis', 'Results interpretation']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Complex study designs', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Protocol amendments affecting statistics', 'severity', 'medium'),
    jsonb_build_object('pain_point', 'Tight analysis timelines', 'severity', 'high')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Ensure statistical rigor', 'priority', 'high'),
    jsonb_build_object('goal', 'Support regulatory submissions', 'priority', 'high'),
    jsonb_build_object('goal', 'Optimize study designs', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Missing data handling', 'impact', 'high'),
    jsonb_build_object('challenge', 'Multiplicity issues', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Adaptive design complexities', 'impact', 'high')
  ),
  ARRAY['SAS', 'R', 'PASS', 'nQuery', 'WinNonlin']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'bi-weekly',
    'reporting_style', 'technical and detailed'
  ),
  'analytical and methodical',
  true,
  'approved',
  ARRAY['biostatistics', 'clinical_trials', 'statistical_analysis']::TEXT[],
  jsonb_build_object(
    'domain', 'clinical_development',
    'methods_expertise', ARRAY['MMRM', 'survival analysis', 'Bayesian methods'],
    'software_proficiency', ARRAY['SAS', 'R']
  )
),

-- 7. Clinical Operations Manager
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Clinical Operations Manager',
  'clinical-operations-manager',
  'Clinical Operations Manager',
  'Manages day-to-day clinical trial operations',
  'senior',
  10,
  'medium',
  ARRAY['Site management', 'Trial execution', 'Vendor oversight', 'Budget management', 'Timeline monitoring']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Site performance variability', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Managing multiple vendors', 'severity', 'medium'),
    jsonb_build_object('pain_point', 'Budget overruns', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Ensure on-time trial completion', 'priority', 'high'),
    jsonb_build_object('goal', 'Maintain quality standards', 'priority', 'high'),
    jsonb_build_object('goal', 'Optimize operational efficiency', 'priority', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Recruitment and retention', 'impact', 'high'),
    jsonb_build_object('challenge', 'Protocol complexity', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Resource constraints', 'impact', 'medium')
  ),
  ARRAY['CTMS', 'Project management software', 'Budget tracking tools']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'phone',
    'meeting_frequency', 'weekly',
    'reporting_style', 'dashboard with KPIs'
  ),
  'results-oriented and collaborative',
  true,
  'approved',
  ARRAY['clinical_operations', 'trial_management', 'site_management']::TEXT[],
  jsonb_build_object(
    'domain', 'clinical_development',
    'trial_phases', ARRAY['Phase II', 'Phase III'],
    'geographic_scope', 'global'
  )
),

-- 8. Medical Writer
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Medical Writer',
  'medical-writer',
  'Senior Medical Writer',
  'Creates regulatory and clinical documents',
  'senior',
  8,
  'medium',
  ARRAY['Writing clinical documents', 'Regulatory submissions', 'Publication development', 'Document review', 'Style guide adherence']::TEXT[],
  jsonb_build_array(
    jsonb_build_object('pain_point', 'Tight deadlines', 'severity', 'high'),
    jsonb_build_object('pain_point', 'Complex technical information', 'severity', 'medium'),
    jsonb_build_object('pain_point', 'Multiple review cycles', 'severity', 'medium')
  ),
  jsonb_build_array(
    jsonb_build_object('goal', 'Produce high-quality documents', 'priority', 'high'),
    jsonb_build_object('goal', 'Meet submission timelines', 'priority', 'high'),
    jsonb_build_object('goal', 'Ensure regulatory compliance', 'priority', 'high')
  ),
  jsonb_build_array(
    jsonb_build_object('challenge', 'Diverse document types', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Rapidly evolving guidelines', 'impact', 'medium'),
    jsonb_build_object('challenge', 'Managing multiple projects', 'impact', 'high')
  ),
  ARRAY['Microsoft Word', 'Document management systems', 'Reference managers', 'eCTD software']::TEXT[],
  jsonb_build_object(
    'preferred_channel', 'email',
    'meeting_frequency', 'weekly',
    'reporting_style', 'progress-focused'
  ),
  'detail-oriented and organized',
  true,
  'approved',
  ARRAY['medical_writing', 'regulatory_documents', 'publications']::TEXT[],
  jsonb_build_object(
    'domain', 'regulatory_affairs',
    'document_expertise', ARRAY['CSR', 'IB', 'Protocol', 'ICF', 'CTD'],
    'therapeutic_areas', ARRAY['oncology', 'cardiology']
  )
)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Verification
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM personas
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;

  RAISE NOTICE '✅ Foundation personas loaded: % personas', v_count;
END $$;
