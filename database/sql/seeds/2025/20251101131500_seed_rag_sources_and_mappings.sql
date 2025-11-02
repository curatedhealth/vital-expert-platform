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
)
-- Map tasks to the seeded RAG sources (idempotent inserts)
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
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-001-T1-1',
  rs.unique_id,
  ARRAY['3.1','4.2']::text[],
  'Regulatory context for PRO-driven objectives.',
  jsonb_build_object('max_chunks', 5),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-001-T1-1' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'FDA_PRO_2009' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-001-T2-1',
  rs.unique_id,
  ARRAY['5.1']::text[],
  'Regulatory precedent for comparator selection.',
  jsonb_build_object('max_chunks', 5),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-001-T2-1' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'FDA_PRO_2009' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-001-T3-1',
  rs.unique_id,
  ARRAY['V2','V3']::text[],
  'Digital biomarker validation requirements.',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-001-T3-1' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-001-T4-1',
  rs.unique_id,
  ARRAY['5.1','5.2']::text[],
  'Psychometric properties and statistical justification.',
  jsonb_build_object('max_chunks', 4),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-001-T4-1' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'ICH_E9_STAT_GUIDE' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-001-T5-2',
  rs.unique_id,
  ARRAY['4.2','6.1']::text[],
  'Final endpoint recommendation regulatory framing.',
  jsonb_build_object('max_chunks', 4),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-001-T5-2' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'FDA_PRO_2009' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

-- Digital biomarker validation tasks (UC_CD_002)
INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T1',
  rs.unique_id,
  ARRAY['V1']::text[],
  'Define intended use using DiMe verification guidance.',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T1' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T2',
  rs.unique_id,
  ARRAY['V1']::text[],
  'Design verification study aligned to DiMe V1 expectations.',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T2' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T3',
  rs.unique_id,
  ARRAY['V1']::text[],
  'Execute verification analyses referencing DiMe guidance.',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T3' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T4',
  rs.unique_id,
  ARRAY['V2']::text[],
  'Plan analytical validation study (DiMe V2).',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T4' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T5',
  rs.unique_id,
  ARRAY['V2']::text[],
  'Execute analytical validation (DiMe V2).',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T5' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T6',
  rs.unique_id,
  ARRAY['V3']::text[],
  'Design clinical validation study (DiMe V3).',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T6' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T7',
  rs.unique_id,
  ARRAY['V3']::text[],
  'Execute clinical validation and MCID determination.',
  jsonb_build_object('max_chunks', 6),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T7' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'DIME_V3_FRAMEWORK' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T8',
  rs.unique_id,
  ARRAY['Negotiation','Objections']::text[],
  'Incorporate enterprise HTA playbook when preparing FDA pre-submission.',
  jsonb_build_object('max_chunks', 3),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T8' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'HTA_PLAYBOOK_ENTX' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);

INSERT INTO dh_task_rag (
  tenant_id, task_id, rag_source_id, task_unique_id, rag_unique_id,
  sections, query_context, search_config, citation_required, is_required
)
SELECT
  ten.id,
  t.id,
  rs.id,
  'TSK-CD-002-T9',
  rs.unique_id,
  ARRAY['Negotiation']::text[],
  'Use enterprise HTA insights when compiling final report and manuscript.',
  jsonb_build_object('max_chunks', 3),
  TRUE,
  TRUE
FROM (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1) AS ten
JOIN dh_task t ON t.unique_id = 'TSK-CD-002-T9' AND t.tenant_id = ten.id
JOIN dh_rag_source rs ON rs.code = 'HTA_PLAYBOOK_ENTX' AND rs.tenant_id = ten.id
WHERE NOT EXISTS (
  SELECT 1 FROM dh_task_rag existing
  WHERE existing.tenant_id = ten.id
    AND existing.task_id = t.id
    AND existing.rag_source_id = rs.id
);
