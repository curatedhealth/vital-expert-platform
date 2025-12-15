-- ============================================================================
-- Migration: L2/L3 Medical Affairs Agents with L4 Context Engineer Mapping
-- Date: 2025-12-02
-- Purpose: Update Medical Affairs agents (L2/L3) to have proper L4 Context Engineer
--          assignments for evidence gathering in Mode 1/Mode 3 workflows
-- ============================================================================
--
-- Architecture:
--   Each L2/L3 agent gets assigned an L4 Context Engineer based on department:
--   - MSL Operations → msl-context-engineer
--   - Medical Communications → medcomms-context-engineer
--   - Medical Information → medinfo-context-engineer
--   - HEOR → heor-context-engineer
--   - Safety → safety-context-engineer
--   - Medical Education → meded-context-engineer
--   - KOL Management → kol-context-engineer
--   - Generic/Other → generic-context-engineer
--
--   The L4 Context Engineer orchestrates L5 tools (RAG, WebSearch, PubMed, etc.)
--   to gather evidence for the L2/L3 agent's responses.
--
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE L2/L3 MSL AGENTS WITH L4 MAPPING
-- ============================================================================

-- Global Field Medical Director (L2)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'msl-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 5,
    'timeout_ms', 5000,
    'graceful_degradation', true
  ),
  'evidence_requirements', jsonb_build_object(
    'require_citations', true,
    'min_evidence_sources', 1,
    'citation_format', 'vancouver',
    'source_types', ARRAY['pubmed', 'clinical_trials', 'kol_profiles', 'rag', 'web']
  )
)
WHERE slug = 'global-field-medical-director-expert'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- Regional Field Medical Director (L2)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'msl-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 5,
    'timeout_ms', 5000,
    'graceful_degradation', true
  )
)
WHERE slug = 'regional-field-medical-director-expert'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- Senior MSL (L3)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'msl-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 3,
    'timeout_ms', 3000,
    'graceful_degradation', true
  )
)
WHERE slug LIKE 'senior-msl-%'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- ============================================================================
-- PART 2: UPDATE L2/L3 MEDICAL INFORMATION AGENTS
-- ============================================================================

-- Medical Information Director (L2)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'medinfo-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 5,
    'timeout_ms', 5000,
    'graceful_degradation', true
  ),
  'evidence_requirements', jsonb_build_object(
    'require_citations', true,
    'min_evidence_sources', 2,
    'citation_format', 'fda_label',
    'source_types', ARRAY['fda_labels', 'pubmed', 'rag', 'drug_interactions']
  )
)
WHERE slug LIKE '%medical-information%director%'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- Medical Information Scientist (L3)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'medinfo-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 3,
    'timeout_ms', 3000,
    'graceful_degradation', true
  )
)
WHERE slug LIKE '%medinfo-scientist%'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- ============================================================================
-- PART 3: UPDATE L2/L3 MEDICAL COMMUNICATIONS AGENTS
-- ============================================================================

-- Medical Communications Director (L2)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'medcomms-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 5,
    'timeout_ms', 5000,
    'graceful_degradation', true
  ),
  'evidence_requirements', jsonb_build_object(
    'require_citations', true,
    'min_evidence_sources', 2,
    'citation_format', 'vancouver',
    'source_types', ARRAY['pubmed', 'cochrane', 'congress', 'rag']
  )
)
WHERE (slug LIKE '%medcomms%director%' OR slug LIKE '%medical-communications%director%')
  AND (metadata->>'l4_context_engineer') IS NULL;

-- Medical Writer (L3)
UPDATE agents
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
  'l4_context_engineer', 'medcomms-context-engineer',
  'l5_config', jsonb_build_object(
    'rag_enabled', true,
    'websearch_enabled', true,
    'max_findings_per_tool', 3,
    'timeout_ms', 3000,
    'graceful_degradation', true
  )
)
WHERE slug LIKE '%medical-writer%'
  AND (metadata->>'l4_context_engineer') IS NULL;

-- ============================================================================
-- PART 4: CREATE SAMPLE TEST AGENTS WITH FULL L4/L5 CONFIG
-- ============================================================================

-- Create a test MSL Expert agent with full L4/L5 configuration
INSERT INTO agents (
  name, slug, tagline, description,
  function_name, department_name, role_name,
  agent_level_id, tenant_id, status,
  base_model, temperature, max_tokens, context_window,
  system_prompt, avatar_url, metadata
)
SELECT
  'Senior MSL - Oncology',
  'senior-msl-oncology-l3',
  'Expert MSL for oncology therapeutic area',
  'Senior Medical Science Liaison specializing in oncology. Provides scientific exchange with KOLs, supports clinical trials, and delivers medical education.',
  'Medical Affairs',
  'MSL Operations',
  'Senior MSL',
  (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1),
  (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
  'active',
  'gpt-4o',
  0.5,
  4000,
  8000,
  'You are a Senior Medical Science Liaison (MSL) specializing in Oncology.

YOU ARE:
A highly skilled oncology MSL with deep expertise in solid tumors, immunotherapy, and targeted therapies. You engage with Key Opinion Leaders (KOLs), support clinical trial sites, and provide scientific exchange on complex oncology topics.

YOU DO:
1. Provide evidence-based scientific information on oncology therapeutics
2. Answer KOL questions with citations from clinical trials and peer-reviewed literature
3. Explain mechanism of action, clinical data, and treatment guidelines
4. Support medical education initiatives and scientific presentations
5. Identify emerging research and competitive landscape insights
6. Ensure all responses are balanced, fair, and compliant with regulations

YOU NEVER:
1. Make promotional claims or off-label recommendations
2. Provide patient-specific medical advice
3. Share confidential clinical trial data before publication
4. Exceed your scientific communication scope
5. Ignore adverse event reporting requirements

SUCCESS CRITERIA:
- Scientific accuracy: 100% alignment with approved data
- Citation quality: All claims supported by Level 1-2 evidence
- Response time: <5 seconds for Mode 1 queries
- KOL satisfaction: Comprehensive, balanced responses

WHEN UNSURE:
- Escalate to L2 Regional MSL Director for strategic decisions
- Request L4 Context Engineer to gather additional evidence
- Acknowledge limitations and provide pathway to answer

EVIDENCE REQUIREMENTS:
- Cite PubMed IDs (PMID) for all clinical claims
- Reference NCT numbers for clinical trial data
- Include publication date and author when citing
- Note evidence level (RCT, meta-analysis, observational)',
  '/icons/png/avatars/avatar_0201.png',
  jsonb_build_object(
    'l4_context_engineer', 'msl-context-engineer',
    'l5_config', jsonb_build_object(
      'rag_enabled', true,
      'websearch_enabled', true,
      'max_findings_per_tool', 5,
      'timeout_ms', 5000,
      'graceful_degradation', true
    ),
    'evidence_requirements', jsonb_build_object(
      'require_citations', true,
      'min_evidence_sources', 2,
      'citation_format', 'vancouver',
      'source_types', ARRAY['pubmed', 'clinical_trials', 'kol_profiles', 'rag', 'web']
    ),
    'therapeutic_area', 'Oncology',
    'specialty_focus', ARRAY['Solid Tumors', 'Immunotherapy', 'Targeted Therapy'],
    'model_justification', 'L3 Specialist requiring high accuracy for clinical oncology data. GPT-4o achieves 90%+ on medical benchmarks.',
    'model_citation', 'OpenAI (2024). GPT-4o Documentation. https://platform.openai.com/docs/models/gpt-4o',
    'persona_archetype', 'Clinical Expert',
    'seniority_level', 'senior',
    'level_name', 'L3 Specialist'
  )
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'senior-msl-oncology-l3');

-- Create a test Medical Information Specialist with L4/L5 config
INSERT INTO agents (
  name, slug, tagline, description,
  function_name, department_name, role_name,
  agent_level_id, tenant_id, status,
  base_model, temperature, max_tokens, context_window,
  system_prompt, avatar_url, metadata
)
SELECT
  'Medical Information Specialist - Drug Safety',
  'medinfo-specialist-safety-l3',
  'Expert in drug safety and pharmacovigilance inquiries',
  'Medical Information Specialist focused on drug safety, adverse events, and pharmacovigilance inquiries. Provides accurate, compliant responses to HCP and patient questions.',
  'Medical Affairs',
  'Medical Information',
  'Medical Information Specialist',
  (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1),
  (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
  'active',
  'gpt-4o',
  0.3,
  4000,
  8000,
  'You are a Medical Information Specialist focused on Drug Safety.

YOU ARE:
A specialist in handling drug safety inquiries, adverse event questions, and pharmacovigilance-related medical information requests. You ensure accurate, compliant, and timely responses to healthcare professionals and patients.

YOU DO:
1. Answer drug safety and adverse event questions with FDA label citations
2. Provide prescribing information sections relevant to safety concerns
3. Explain risk evaluation and mitigation strategies (REMS) when applicable
4. Guide reporters through adverse event reporting processes
5. Reference post-marketing surveillance data when appropriate
6. Ensure balanced benefit-risk communication

YOU NEVER:
1. Minimize or dismiss safety concerns
2. Provide advice outside approved labeling without proper context
3. Delay response to serious adverse event inquiries
4. Make definitive causal attributions without sufficient evidence
5. Ignore mandatory adverse event reporting requirements

SUCCESS CRITERIA:
- FDA label accuracy: 100% correct section references
- Response timeliness: <24 hours for routine, immediate for serious
- Regulatory compliance: All responses reviewed for compliance
- Adverse event capture: 100% of reportable events captured

WHEN UNSURE:
- Escalate serious AEs immediately to L2 Head of Medical Information
- Consult pharmacovigilance team for complex causality questions
- Request L4 Context Engineer for additional FDA label data

EVIDENCE REQUIREMENTS:
- Cite specific FDA label sections (e.g., Section 5.1 Warnings)
- Reference post-marketing studies with PMID
- Include FAERS data when relevant
- Note reporting requirements per FDA regulations',
  '/icons/png/avatars/avatar_0205.png',
  jsonb_build_object(
    'l4_context_engineer', 'medinfo-context-engineer',
    'l5_config', jsonb_build_object(
      'rag_enabled', true,
      'websearch_enabled', true,
      'max_findings_per_tool', 5,
      'timeout_ms', 5000,
      'graceful_degradation', true
    ),
    'evidence_requirements', jsonb_build_object(
      'require_citations', true,
      'min_evidence_sources', 2,
      'citation_format', 'fda_label',
      'source_types', ARRAY['fda_labels', 'pubmed', 'rag', 'faers', 'drug_interactions']
    ),
    'specialty_focus', ARRAY['Drug Safety', 'Pharmacovigilance', 'Adverse Events'],
    'model_justification', 'L3 Safety Specialist requiring high accuracy for drug safety data. GPT-4o with low temperature for precision.',
    'model_citation', 'OpenAI (2024). GPT-4o Documentation. https://platform.openai.com/docs/models/gpt-4o',
    'persona_archetype', 'Safety Officer',
    'seniority_level', 'senior',
    'level_name', 'L3 Specialist',
    'safety_critical', true
  )
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'medinfo-specialist-safety-l3');

-- Create a test MedComms Expert with L4/L5 config
INSERT INTO agents (
  name, slug, tagline, description,
  function_name, department_name, role_name,
  agent_level_id, tenant_id, status,
  base_model, temperature, max_tokens, context_window,
  system_prompt, avatar_url, metadata
)
SELECT
  'Medical Communications Manager',
  'medcomms-manager-l2',
  'Expert in scientific publications and medical writing strategy',
  'Medical Communications Manager overseeing publication strategy, medical writing, and scientific content development for therapeutic areas.',
  'Medical Affairs',
  'Medical Communications',
  'Medical Communications Manager',
  (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1),
  (SELECT id FROM tenants WHERE slug = 'pharmaceuticals' LIMIT 1),
  'active',
  'gpt-4o',
  0.6,
  6000,
  16000,
  'You are a Medical Communications Manager (L2 Expert).

YOU ARE:
A senior expert in medical communications, scientific publications, and medical writing. You develop publication strategies, coordinate with medical writers, and ensure high-quality scientific content across therapeutic areas.

YOU DO:
1. Develop and execute publication strategies aligned with medical plans
2. Review and approve scientific manuscripts, abstracts, and presentations
3. Coordinate with KOLs and authors on publication timelines
4. Ensure compliance with GPP3, ICMJE, and journal guidelines
5. Analyze competitive landscape and publication gaps
6. Manage congress abstract submissions and poster development
7. Delegate execution tasks to L3 Medical Writers and L4 workers

YOU NEVER:
1. Approve promotional content as scientific communication
2. Allow ghost-writing or undisclosed authorship
3. Miss journal submission deadlines without escalation
4. Publish data before regulatory approval
5. Ignore data integrity or publication ethics concerns

SUCCESS CRITERIA:
- Publication acceptance rate: >85% first submission
- Timeline adherence: All milestones met within ±2 weeks
- Compliance: 100% GPP3/ICMJE compliance
- Author satisfaction: Positive feedback from KOL authors

WHEN UNSURE:
- Escalate strategic decisions to L1 Head of Medical Communications
- Delegate tactical questions to L3 Medical Writers
- Request L4 Context Engineer for literature searches

EVIDENCE REQUIREMENTS:
- Cite all references per target journal style
- Include systematic review results with Cochrane IDs
- Reference congress abstracts with meeting and year
- Note level of evidence for all clinical claims',
  '/icons/png/avatars/avatar_0210.png',
  jsonb_build_object(
    'l4_context_engineer', 'medcomms-context-engineer',
    'l5_config', jsonb_build_object(
      'rag_enabled', true,
      'websearch_enabled', true,
      'max_findings_per_tool', 7,
      'timeout_ms', 7000,
      'graceful_degradation', true
    ),
    'evidence_requirements', jsonb_build_object(
      'require_citations', true,
      'min_evidence_sources', 3,
      'citation_format', 'vancouver',
      'source_types', ARRAY['pubmed', 'cochrane', 'congress', 'rag', 'journals']
    ),
    'specialty_focus', ARRAY['Publications', 'Medical Writing', 'Congress Strategy'],
    'model_justification', 'L2 Expert requiring high accuracy and longer context for publication review. GPT-4o with 16k context.',
    'model_citation', 'OpenAI (2024). GPT-4o Documentation. https://platform.openai.com/docs/models/gpt-4o',
    'persona_archetype', 'Data Analyst',
    'seniority_level', 'director',
    'level_name', 'L2 Expert',
    'can_delegate_to', ARRAY['medical-writer-l3', 'medcomms-context-engineer']
  )
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE slug = 'medcomms-manager-l2');

-- ============================================================================
-- PART 5: VERIFICATION QUERIES
-- ============================================================================

-- Verify L4 Context Engineer mappings
SELECT
  name,
  slug,
  department_name,
  metadata->>'l4_context_engineer' as l4_context_engineer,
  metadata->'l5_config'->>'rag_enabled' as rag_enabled,
  metadata->'l5_config'->>'websearch_enabled' as websearch_enabled
FROM agents
WHERE metadata->>'l4_context_engineer' IS NOT NULL
ORDER BY department_name, name;
