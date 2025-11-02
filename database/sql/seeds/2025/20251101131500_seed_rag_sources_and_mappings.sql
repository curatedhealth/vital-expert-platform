-- ============================================================================
-- Seed core RAG sources and map to workflow tasks (digital-health-startup)
-- Date: 2025-11-01
-- ============================================================================

WITH tenant AS (
  SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1
),
source_defs AS (
  SELECT 'FDA_PRO_2009'::text AS code,
         'RAG-REG-FDA-PRO-2009'::text AS unique_id,
         'FDA PRO Guidance (2009)'::text AS name,
         'guidance'::text AS source_type,
         'https://www.fda.gov/media/77832/download'::text AS uri,
         'Foundational FDA guidance covering patient-reported outcome measures for clinical trials.'::text AS description,
         jsonb_build_object(
           'authority', 'FDA',
           'publication_year', 2009,
           'sections', jsonb_build_array('3.1', '4.2', '5.3'),
           'regulatory_exposure', 'High',
           'pii_sensitivity', 'Low'
         ) AS metadata
  UNION ALL
  SELECT 'DIME_V3_FRAMEWORK',
         'RAG-FWK-DIME-V3',
         'Digital Medicine Society (DiMe) V3 Validation Framework',
         'framework',
         'https://www.dimesociety.org/resources/v3-validation/',
         'Industry-standard framework outlining verification, analytical validation, and clinical validation for digital measures.',
         jsonb_build_object(
           'authority', 'DiMe Society',
           'publication_year', 2021,
           'sections', jsonb_build_array('V1', 'V2', 'V3'),
           'regulatory_exposure', 'Medium',
           'pii_sensitivity', 'Medium'
         )
  UNION ALL
  SELECT 'ICH_E9_STAT_GUIDE',
         'RAG-STD-ICH-E9',
         'ICH E9 Statistical Principles for Clinical Trials',
         'guidance',
         'https://database.ich.org/sites/default/files/E9_Guideline.pdf',
         'International harmonized statistical guidance for design, conduct, analysis, and interpretation of clinical trials.',
         jsonb_build_object(
           'authority', 'ICH',
           'publication_year', 1998,
           'sections', jsonb_build_array('4.1', '5.1', '5.2'),
           'regulatory_exposure', 'High',
           'pii_sensitivity', 'Low'
         )
  UNION ALL
  SELECT 'HTA_PLAYBOOK_ENTX',
         'RAG-HTA-PLAYBOOK-ENTX',
         'Enterprise X HTA Negotiation Playbook',
         'internal',
         NULL,
         'Enterprise-specific negotiation playbook capturing payer objections, pricing corridors, and escalation procedures.',
         jsonb_build_object(
           'authority', 'Enterprise X Market Access',
           'publication_year', 2025,
           'confidential', true,
           'pii_sensitivity', 'High'
         )
),
upsert_sources AS (
  INSERT INTO dh_rag_source (
    tenant_id, code, name, source_type, uri, description, metadata, unique_id
  )
  SELECT tenant.id, s.code, s.name, s.source_type, s.uri, s.description, s.metadata, s.unique_id
  FROM tenant, source_defs s
  ON CONFLICT (tenant_id, code) DO UPDATE
    SET name = EXCLUDED.name,
        source_type = EXCLUDED.source_type,
        uri = EXCLUDED.uri,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        unique_id = EXCLUDED.unique_id,
        updated_at = now()
  RETURNING code, id, unique_id
),
all_sources AS (
  SELECT rs.code, rs.id, rs.unique_id
  FROM upsert_sources rs
  UNION
  SELECT s.code, r.id, r.unique_id
  FROM source_defs s
  JOIN tenant ON true
  JOIN dh_rag_source r
    ON r.tenant_id = tenant.id
   AND r.code = s.code
)
INSERT INTO dh_task_rag (
  tenant_id,
  task_id,
  rag_source_id,
  task_unique_id,
  rag_unique_id,
  sections,
  query_context,
  search_config,
  citation_required,
  is_required
)
SELECT
  tenant.id,
  t.id,
  src.id,
  tm.task_unique_id,
  src.unique_id,
  tm.sections,
  tm.query_context,
  jsonb_build_object('max_chunks', tm.max_chunks),
  tm.citation_required,
  TRUE
FROM tenant
JOIN (
  VALUES
    ('TSK-CD-001-T1-1', 'FDA_PRO_2009', ARRAY['3.1','4.2']::text[], 'Regulatory context for PRO-driven objectives.', 5, TRUE),
    ('TSK-CD-001-T2-1', 'FDA_PRO_2009', ARRAY['5.1']::text[], 'Regulatory precedent for comparator selection.', 5, TRUE),
    ('TSK-CD-001-T3-1', 'DIME_V3_FRAMEWORK', ARRAY['V2','V3']::text[], 'Digital biomarker validation requirements.', 6, TRUE),
    ('TSK-CD-001-T4-1', 'ICH_E9_STAT_GUIDE', ARRAY['5.1','5.2']::text[], 'Psychometric properties and statistical justification.', 4, TRUE),
    ('TSK-CD-001-T5-2', 'FDA_PRO_2009', ARRAY['4.2','6.1']::text[], 'Final endpoint recommendation regulatory framing.', 4, TRUE),
    ('TSK-CD-002-T1', 'DIME_V3_FRAMEWORK', ARRAY['V1']::text[], 'Define intended use using DiMe verification guidance.', 6, TRUE),
    ('TSK-CD-002-T2', 'DIME_V3_FRAMEWORK', ARRAY['V1']::text[], 'Design verification study aligned to DiMe V1 expectations.', 6, TRUE),
    ('TSK-CD-002-T3', 'DIME_V3_FRAMEWORK', ARRAY['V1']::text[], 'Execute verification analyses referencing DiMe guidance.', 6, TRUE),
    ('TSK-CD-002-T4', 'DIME_V3_FRAMEWORK', ARRAY['V2']::text[], 'Plan analytical validation study (DiMe V2).', 6, TRUE),
    ('TSK-CD-002-T5', 'DIME_V3_FRAMEWORK', ARRAY['V2']::text[], 'Execute analytical validation (DiMe V2).', 6, TRUE),
    ('TSK-CD-002-T6', 'DIME_V3_FRAMEWORK', ARRAY['V3']::text[], 'Design clinical validation study (DiMe V3).', 6, TRUE),
    ('TSK-CD-002-T7', 'DIME_V3_FRAMEWORK', ARRAY['V3']::text[], 'Execute clinical validation and MCID determination.', 6, TRUE),
    ('TSK-CD-002-T8', 'HTA_PLAYBOOK_ENTX', ARRAY['Negotiation','Objections']::text[], 'Incorporate enterprise HTA playbook when preparing FDA pre-submission.', 3, TRUE),
    ('TSK-CD-002-T9', 'HTA_PLAYBOOK_ENTX', ARRAY['Negotiation']::text[], 'Use enterprise HTA insights when compiling final report and manuscript.', 3, TRUE)
) AS tm(task_unique_id, source_code, sections, query_context, max_chunks, citation_required)
JOIN all_sources src ON src.code = tm.source_code
JOIN dh_task t ON t.unique_id = tm.task_unique_id
              AND t.tenant_id = tenant.id
ON CONFLICT (task_id, rag_source_id) DO UPDATE
  SET sections = EXCLUDED.sections,
      query_context = EXCLUDED.query_context,
      search_config = EXCLUDED.search_config,
      citation_required = EXCLUDED.citation_required,
      updated_at = now();
