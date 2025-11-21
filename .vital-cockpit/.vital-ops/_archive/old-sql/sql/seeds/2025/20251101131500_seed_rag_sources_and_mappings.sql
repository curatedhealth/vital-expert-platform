-- ============================================================================
-- Seed core RAG sources and map workflows, tasks, and agents
-- Date: 2025-11-01
-- Notes:
--   * Targets tenant slug `digital-health-startup`.
--   * Ensures RAG sources, task mappings, and agent capabilities are idempotent.
--   * Requires helper resolution functions from 20251101123000 migration.
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_task_id UUID;
  v_rag_id UUID;
  v_agent_id UUID;
  v_prompt_id UUID;
  rec_task RECORD;
  rec_agent RECORD;
  rec_prompt RECORD;
  rec_task_domain RECORD;
  v_has_required_knowledge BOOLEAN := false;
BEGIN
  SELECT id
  INTO v_tenant_id
  FROM tenants
  WHERE slug = 'digital-health-startup'
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Tenant % not found; skipping RAG workflow seed.', 'digital-health-startup';
    RETURN;
  END IF;

  -- Check whether dh_task_agent_assignment.required_knowledge exists (older deployments may not have migration)
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'dh_task_agent_assignment'
      AND column_name = 'required_knowledge'
  )
  INTO v_has_required_knowledge;

  -- -------------------------------------------------------------------------
  -- RAG source catalog (idempotent upsert)
  -- -------------------------------------------------------------------------
  INSERT INTO dh_rag_source (
    tenant_id,
    code,
    unique_id,
    name,
    source_type,
    uri,
    description,
    metadata
  )
  SELECT
    v_tenant_id,
    src.code,
    src.unique_id,
    src.name,
    src.source_type,
    src.uri,
    src.description,
    src.metadata
  FROM (
    VALUES
      (
        'FDA_PRO_2009',
        'RAG-REG-FDA-PRO-2009',
        'FDA PRO Guidance (2009)',
        'guidance',
        'https://www.fda.gov/media/77832/download',
        'Foundational FDA guidance covering patient-reported outcome measures for clinical trials.',
        jsonb_build_object(
          'authority', 'FDA',
          'publication_year', 2009,
          'sections', jsonb_build_array('3.1', '4.2', '5.3'),
          'regulatory_exposure', 'High',
          'pii_sensitivity', 'Low'
        )
      ),
      (
        'DIME_V3_FRAMEWORK',
        'RAG-FWK-DIME-V3',
        'Digital Medicine Society (DiMe) V3 Validation Framework',
        'guidance',
        'https://www.dimesociety.org/resources/v3-validation/',
        'Industry-standard framework outlining verification, analytical validation, and clinical validation for digital measures.',
        jsonb_build_object(
          'authority', 'DiMe Society',
          'publication_year', 2021,
          'sections', jsonb_build_array('V1', 'V2', 'V3'),
          'regulatory_exposure', 'Medium',
          'pii_sensitivity', 'Medium'
        )
      ),
      (
        'ICH_E9_STAT_GUIDE',
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
      ),
      (
        'HTA_PLAYBOOK_ENTX',
        'RAG-HTA-PLAYBOOK-ENTX',
        'Enterprise X HTA Negotiation Playbook',
        'document',
        NULL,
        'Enterprise-specific negotiation playbook capturing payer objections, pricing corridors, and escalation procedures.',
        jsonb_build_object(
          'authority', 'Enterprise X Market Access',
          'publication_year', 2025,
          'confidential', true,
          'pii_sensitivity', 'High'
        )
      ),
      (
        'ISPOR_BIM_GUIDE',
        'RAG-HTA-ISPOR-BIM',
        'ISPOR Budget Impact Analysis Reference Guide',
        'guidance',
        'https://www.ispor.org/docs/default-source/value-outcomes-spotlight/nov-dec-2014-bimtoolkit.pdf',
        'Professional guidance for payer-ready budget impact models including scenario planning and sensitivity analysis.',
        jsonb_build_object(
          'authority', 'ISPOR',
          'publication_year', 2014,
          'sections', jsonb_build_array('3.0', '4.0', '6.0'),
          'regulatory_exposure', 'Medium',
          'pii_sensitivity', 'Low'
        )
      )
  ) AS src(code, unique_id, name, source_type, uri, description, metadata)
  ON CONFLICT (tenant_id, code) DO UPDATE
  SET name = EXCLUDED.name,
      source_type = EXCLUDED.source_type,
      uri = EXCLUDED.uri,
      description = EXCLUDED.description,
      metadata = EXCLUDED.metadata,
      unique_id = EXCLUDED.unique_id,
      updated_at = now();

  -- -------------------------------------------------------------------------
  -- Task → RAG source mappings (portable identifiers)
  -- -------------------------------------------------------------------------
  FOR rec_task IN
    SELECT *
    FROM (
      VALUES
        ('TSK-CD-001-T1-1', 'RAG-REG-FDA-PRO-2009', ARRAY['3.1','4.2']::text[], 'Regulatory context for PRO-driven objectives.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE),
        ('TSK-CD-001-T2-1', 'RAG-REG-FDA-PRO-2009', ARRAY['5.1']::text[], 'Comparator selection precedent across digital therapeutics.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE),
        ('TSK-CD-001-T3-1', 'RAG-FWK-DIME-V3', ARRAY['V2','V3']::text[], 'Digital biomarker validation requirements (DiMe V3).', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-001-T4-1', 'RAG-STD-ICH-E9', ARRAY['5.1','5.2']::text[], 'Psychometric and statistical justification references.', jsonb_build_object('max_chunks', 4, 'semantic', true), 4, TRUE, TRUE),
        ('TSK-CD-001-T5-2', 'RAG-REG-FDA-PRO-2009', ARRAY['4.2','6.1']::text[], 'Finalize endpoint recommendation aligned to PRO guidance.', jsonb_build_object('max_chunks', 4, 'semantic', true), 4, TRUE, TRUE),
        ('TSK-CD-002-T1', 'RAG-FWK-DIME-V3', ARRAY['V1']::text[], 'Define intended use leveraging DiMe verification guidance.', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T2', 'RAG-FWK-DIME-V3', ARRAY['V1']::text[], 'Design verification study aligned to V1 expectations.', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T3', 'RAG-FWK-DIME-V3', ARRAY['V1']::text[], 'Execute verification analyses referencing DiMe guidance.', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T4', 'RAG-FWK-DIME-V3', ARRAY['V2']::text[], 'Plan analytical validation study (DiMe V2).', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T5', 'RAG-FWK-DIME-V3', ARRAY['V2']::text[], 'Execute analytical validation (DiMe V2).', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T6', 'RAG-FWK-DIME-V3', ARRAY['V3']::text[], 'Design clinical validation study (DiMe V3).', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T7', 'RAG-FWK-DIME-V3', ARRAY['V3']::text[], 'Execute clinical validation and MCID determination.', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-CD-002-T8', 'RAG-HTA-PLAYBOOK-ENTX', ARRAY['Negotiation','Objections']::text[], 'Incorporate HTA playbook when preparing regulatory engagement.', jsonb_build_object('max_chunks', 3, 'semantic', true), 3, TRUE, TRUE),
        ('TSK-CD-002-T9', 'RAG-HTA-PLAYBOOK-ENTX', ARRAY['Negotiation']::text[], 'Apply HTA insights to final report and publication.', jsonb_build_object('max_chunks', 3, 'semantic', true), 3, TRUE, TRUE),
        ('TSK-CD-003-T1', 'RAG-REG-FDA-PRO-2009', ARRAY['Hypotheses','Endpoints']::text[], 'Ground hypotheses in accepted FDA PRO expectations.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE),
        ('TSK-CD-003-T2', 'RAG-REG-FDA-PRO-2009', ARRAY['Comparator','Blinding']::text[], 'Reference comparator and blinding precedents for DTx trials.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE),
        ('TSK-CD-003-T5', 'RAG-STD-ICH-E9', ARRAY['Power','Sample Size']::text[], 'Sample-size justification anchored to ICH E9 statistical principles.', jsonb_build_object('max_chunks', 6, 'semantic', true), 6, TRUE, TRUE),
        ('TSK-MA-006-T1', 'RAG-HTA-PLAYBOOK-ENTX', ARRAY['Population','Eligibility']::text[], 'Align eligible population with payer negotiation playbook.', jsonb_build_object('max_chunks', 4, 'semantic', true), 4, TRUE, TRUE),
        ('TSK-MA-006-T5', 'RAG-HTA-ISPOR-BIM', ARRAY['Budget','Scenarios']::text[], 'Budget impact modeling best practices from ISPOR guide.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE),
        ('TSK-MA-006-T6', 'RAG-HTA-ISPOR-BIM', ARRAY['Sensitivity','Analysis']::text[], 'Sensitivity analysis techniques recommended by ISPOR.', jsonb_build_object('max_chunks', 5, 'semantic', true), 5, TRUE, TRUE)
    ) AS v(task_unique_id, rag_unique_id, sections, query_context, search_config, max_chunks, citation_required, is_required)
  LOOP
    SELECT dh_resolve_task_unique_id(v_tenant_id, rec_task.task_unique_id) INTO v_task_id;
    IF v_task_id IS NULL THEN
      RAISE NOTICE 'Skipping task_rag mapping: task % not found for tenant %.', rec_task.task_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    SELECT dh_resolve_rag_unique_id(v_tenant_id, rec_task.rag_unique_id) INTO v_rag_id;
    IF v_rag_id IS NULL THEN
      RAISE NOTICE 'Skipping task_rag mapping: RAG source % not found for tenant %.', rec_task.rag_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    INSERT INTO dh_task_rag (
      tenant_id,
      task_id,
      rag_source_id,
      task_unique_id,
      rag_unique_id,
      sections,
      query_context,
      search_config,
      max_chunks,
      citation_required,
      is_required
    )
    VALUES (
      v_tenant_id,
      v_task_id,
      v_rag_id,
      rec_task.task_unique_id,
      rec_task.rag_unique_id,
      rec_task.sections,
      rec_task.query_context,
      rec_task.search_config,
      rec_task.max_chunks,
      rec_task.citation_required,
      rec_task.is_required
    )
    ON CONFLICT (task_id, rag_source_id) DO UPDATE
    SET sections = EXCLUDED.sections,
        query_context = EXCLUDED.query_context,
        search_config = EXCLUDED.search_config,
        max_chunks = EXCLUDED.max_chunks,
        citation_required = EXCLUDED.citation_required,
        is_required = EXCLUDED.is_required,
        task_unique_id = EXCLUDED.task_unique_id,
        rag_unique_id = EXCLUDED.rag_unique_id;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- Task ↔ agent assignments (normalized table)
  -- -------------------------------------------------------------------------
  FOR rec_agent IN
    SELECT *
    FROM (
      VALUES
        ('TSK-CD-001-T1-1', 'AGT-P01-CMO',       'lead',        1, 'Clinical leadership drives endpoint hypothesis framing.', ARRAY['Clinical Strategy']::text[]),
        ('TSK-CD-001-T1-1', 'AGT-P10-PATADV',    'contributor', 2, 'Patient advocate ensures outcomes reflect patient voice.', ARRAY['Patient Advocacy']::text[]),
        ('TSK-CD-001-T2-1', 'AGT-P05-REGDIR',    'lead',        1, 'Regulatory director owns comparator precedent alignment.', ARRAY['Regulatory Affairs']::text[]),
        ('TSK-CD-001-T3-1', 'AGT-P01-CMO',       'lead',        1, 'Chief medical officer curates endpoint candidates.', ARRAY['Clinical Strategy']::text[]),
        ('TSK-CD-001-T3-1', 'AGT-P04-BIOSTAT',   'reviewer',    2, 'Biostatistics review ensures measurability.', ARRAY['Biostatistics']::text[]),
        ('TSK-CD-001-T4-1', 'AGT-P04-BIOSTAT',   'lead',        1, 'Biostatistics lead handles validation design.', ARRAY['Biostatistics']::text[]),
        ('TSK-CD-001-T5-2', 'AGT-P05-REGDIR',    'lead',        1, 'Regulatory lead finalizes endpoint recommendation.', ARRAY['Regulatory Affairs']::text[]),
        ('TSK-CD-002-T1',   'AGT-P02-VPCLIN',    'lead',        1, 'Clinical VP defines verification intent.', ARRAY['Clinical Development']::text[]),
        ('TSK-CD-002-T1',   'AGT-P05-REGDIR',    'reviewer',    2, 'Regulatory review confirms verification scope.', ARRAY['Regulatory Affairs']::text[]),
        ('TSK-CD-002-T4',   'AGT-P04-BIOSTAT',   'lead',        1, 'Biostatistics lead analytical validation planning.', ARRAY['Biostatistics']::text[]),
        ('TSK-CD-002-T8',   'AGT-P05-REGDIR',    'lead',        1, 'Regulatory lead prepares HTA negotiation strategy.', ARRAY['Regulatory Affairs']::text[]),
        ('TSK-CD-003-T1',   'AGT-P01-CMO',       'lead',        1, 'Clinical leadership frames trial hypotheses.', ARRAY['Clinical Strategy']::text[]),
        ('TSK-CD-003-T1',   'AGT-P04-BIOSTAT',   'reviewer',    2, 'Biostatistics review ensures statistical viability.', ARRAY['Biostatistics']::text[]),
        ('TSK-CD-003-T2',   'AGT-P05-REGDIR',    'lead',        1, 'Regulatory director crafts comparator strategy.', ARRAY['Regulatory Affairs']::text[]),
        ('TSK-CD-003-T2',   'AGT-P01-CMO',       'reviewer',    2, 'Clinical lead validates clinical rationale.', ARRAY['Clinical Strategy']::text[]),
        ('TSK-CD-003-T5',   'AGT-P04-BIOSTAT',   'lead',        1, 'Biostatistician leads sample size modelling.', ARRAY['Biostatistics']::text[]),
        ('TSK-CD-003-T5',   'AGT-DTX-VALIDATOR', 'contributor', 3, 'AI validator cross-checks statistical assumptions.', ARRAY['AI Validation']::text[]),
        ('TSK-MA-006-T1',   'AGT-P21-HEOR',      'lead',        1, 'HEOR lead estimates eligible population.', ARRAY['Health Economics']::text[]),
        ('TSK-MA-006-T1',   'AGT-P22-MADIRECT',  'reviewer',    2, 'Market access director validates payer alignment.', ARRAY['Market Access']::text[]),
        ('TSK-MA-006-T5',   'AGT-P21-HEOR',      'lead',        1, 'HEOR analyst builds scenario-based PMPM outputs.', ARRAY['Health Economics']::text[]),
        ('TSK-MA-006-T5',   'AGT-P24-FINANCE',   'reviewer',    2, 'Finance partner validates budgeting assumptions.', ARRAY['Finance']::text[]),
        ('TSK-MA-006-T6',   'AGT-P21-HEOR',      'lead',        1, 'HEOR lead executes sensitivity testing.', ARRAY['Health Economics']::text[]),
        ('TSK-MA-006-T6',   'AGT-P24-FINANCE',   'reviewer',    2, 'Finance partner audits scenario stress tests.', ARRAY['Finance']::text[])
    ) AS v(task_unique_id, agent_unique_id, role_type, sequence, assignment_rationale, required_expertise)
  LOOP
    SELECT dh_resolve_task_unique_id(v_tenant_id, rec_agent.task_unique_id) INTO v_task_id;
    IF v_task_id IS NULL THEN
      RAISE NOTICE 'Skipping agent assignment: task % not found for tenant %.', rec_agent.task_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    SELECT dh_resolve_agent_unique_id(v_tenant_id, rec_agent.agent_unique_id) INTO v_agent_id;
    IF v_agent_id IS NULL THEN
      RAISE NOTICE 'Skipping agent assignment: agent % not found for tenant %.', rec_agent.agent_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    INSERT INTO dh_task_agent_assignment (
      tenant_id,
      task_id,
      agent_id,
      task_unique_id,
      agent_unique_id,
      role_type,
      sequence,
      config_overrides,
      assignment_rationale,
      required_expertise,
      is_required
    )
    VALUES (
      v_tenant_id,
      v_task_id,
      v_agent_id,
      rec_agent.task_unique_id,
      rec_agent.agent_unique_id,
      rec_agent.role_type,
      rec_agent.sequence,
      '{}'::jsonb,
      rec_agent.assignment_rationale,
      rec_agent.required_expertise,
      TRUE
    )
    ON CONFLICT (task_id, agent_id, role_type) DO UPDATE
    SET sequence = EXCLUDED.sequence,
        config_overrides = EXCLUDED.config_overrides,
        assignment_rationale = EXCLUDED.assignment_rationale,
        required_expertise = EXCLUDED.required_expertise,
        task_unique_id = EXCLUDED.task_unique_id,
        agent_unique_id = EXCLUDED.agent_unique_id,
        is_required = EXCLUDED.is_required;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- Prompt ↔ agent capability registry (supports Agent Store orchestration)
  -- -------------------------------------------------------------------------
  FOR rec_prompt IN
    SELECT *
    FROM (
      VALUES
        ('PRM-DEFINE-HYPOTHESES-PROMPT',      'AGT-P01-CMO',       'primary'),
        ('PRM-DEFINE-HYPOTHESES-PROMPT',      'AGT-P04-BIOSTAT',   'supported'),
        ('PRM-COMPARATOR-BLINDING-CHECKLIST', 'AGT-P05-REGDIR',    'primary'),
        ('PRM-COMPARATOR-BLINDING-CHECKLIST', 'AGT-P01-CMO',       'supported'),
        ('PRM-SAMPLE-SIZE-PROMPT',            'AGT-P04-BIOSTAT',   'primary'),
        ('PRM-SAMPLE-SIZE-PROMPT',            'AGT-DTX-VALIDATOR', 'supported'),
        ('PRM-POPULATION-SIZE-PROMPT',        'AGT-P21-HEOR',      'primary'),
        ('PRM-POPULATION-SIZE-PROMPT',        'AGT-P22-MADIRECT',  'supported'),
        ('PRM-SCENARIO-MODEL-PROMPT',         'AGT-P21-HEOR',      'primary'),
        ('PRM-SCENARIO-MODEL-PROMPT',         'AGT-P24-FINANCE',   'supported'),
        ('PRM-SENSITIVITY-PROMPT',            'AGT-P21-HEOR',      'primary'),
        ('PRM-SENSITIVITY-PROMPT',            'AGT-P24-FINANCE',   'supported')
    ) AS v(prompt_unique_id, agent_unique_id, capability_level)
  LOOP
    SELECT dh_resolve_prompt_unique_id(v_tenant_id, rec_prompt.prompt_unique_id) INTO v_prompt_id;
    IF v_prompt_id IS NULL THEN
      RAISE NOTICE 'Skipping prompt capability: prompt % not found for tenant %.', rec_prompt.prompt_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    SELECT dh_resolve_agent_unique_id(v_tenant_id, rec_prompt.agent_unique_id) INTO v_agent_id;
    IF v_agent_id IS NULL THEN
      RAISE NOTICE 'Skipping prompt capability: agent % not found for tenant %.', rec_prompt.agent_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    INSERT INTO dh_prompt_agent_capability (
      tenant_id,
      prompt_id,
      agent_id,
      prompt_unique_id,
      agent_unique_id,
      capability_level,
      metadata,
      notes
    )
    VALUES (
      v_tenant_id,
      v_prompt_id,
      v_agent_id,
      rec_prompt.prompt_unique_id,
      rec_prompt.agent_unique_id,
      rec_prompt.capability_level,
      jsonb_build_object(
        'seed', 'digital_health_rag_mapping',
        'capability_level', rec_prompt.capability_level
      ),
      'Seeded from digital health workflow RAG orchestration.'
    )
    ON CONFLICT (tenant_id, prompt_id, agent_id) DO UPDATE
    SET capability_level = EXCLUDED.capability_level,
        metadata = EXCLUDED.metadata,
        notes = EXCLUDED.notes,
        updated_at = now();
  END LOOP;

  -- -------------------------------------------------------------------------
  -- Task ↔ RAG domain tagging (knowledge domains + search scopes)
  -- -------------------------------------------------------------------------
  FOR rec_task_domain IN
    SELECT *
    FROM (
      VALUES
        ('TSK-CD-001-T1-1', ARRAY['clinical-development','regulatory-affairs']::TEXT[]),
        ('TSK-CD-001-T2-1', ARRAY['regulatory-affairs','medical_devices']::TEXT[]),
        ('TSK-CD-001-T3-1', ARRAY['clinical-development','evidence_generation']::TEXT[]),
        ('TSK-CD-001-T4-1', ARRAY['clinical-development','biostatistics']::TEXT[]),
        ('TSK-CD-001-T5-2', ARRAY['regulatory-affairs','medical_devices']::TEXT[]),
        ('TSK-CD-002-T1',   ARRAY['clinical-development','medical_devices']::TEXT[]),
        ('TSK-CD-002-T2',   ARRAY['clinical-development','medical_devices']::TEXT[]),
        ('TSK-CD-002-T3',   ARRAY['clinical-development','medical_devices']::TEXT[]),
        ('TSK-CD-002-T4',   ARRAY['clinical-development','evidence_generation']::TEXT[]),
        ('TSK-CD-002-T5',   ARRAY['clinical-development','evidence_generation']::TEXT[]),
        ('TSK-CD-002-T6',   ARRAY['clinical-development','medical-affairs']::TEXT[]),
        ('TSK-CD-002-T7',   ARRAY['clinical-development','medical-affairs']::TEXT[]),
        ('TSK-CD-002-T8',   ARRAY['health_economics','commercial_strategy']::TEXT[]),
        ('TSK-CD-002-T9',   ARRAY['health_economics','business_strategy']::TEXT[]),
        ('TSK-CD-003-T1',   ARRAY['clinical-development','regulatory-affairs']::TEXT[]),
        ('TSK-CD-003-T2',   ARRAY['regulatory-affairs','medical_devices']::TEXT[]),
        ('TSK-CD-003-T5',   ARRAY['clinical-development','biostatistics']::TEXT[]),
        ('TSK-MA-006-T1',   ARRAY['health_economics','medical-affairs']::TEXT[]),
        ('TSK-MA-006-T5',   ARRAY['health_economics','business_strategy']::TEXT[]),
        ('TSK-MA-006-T6',   ARRAY['health_economics','business_strategy']::TEXT[])
    ) AS v(task_unique_id, domain_ids)
  LOOP
    SELECT dh_resolve_task_unique_id(v_tenant_id, rec_task_domain.task_unique_id) INTO v_task_id;
    IF v_task_id IS NULL THEN
      RAISE NOTICE 'Skipping RAG domain tagging: task % not found for tenant %.', rec_task_domain.task_unique_id, v_tenant_id;
      CONTINUE;
    END IF;

    -- Persist rag_domains on task metadata
    UPDATE dh_task
    SET extra = jsonb_set(
      COALESCE(extra, '{}'::jsonb),
      '{rag_domains}',
      to_jsonb(rec_task_domain.domain_ids),
      true
    )
    WHERE id = v_task_id;

    -- Extend task-level RAG configuration with domain scope filters
    UPDATE dh_task_rag
    SET search_config = jsonb_set(
      COALESCE(search_config, '{}'::jsonb),
      '{domains}',
      to_jsonb(rec_task_domain.domain_ids),
      true
    )
    WHERE tenant_id = v_tenant_id
      AND task_id = v_task_id;

    -- Record required knowledge domains for assigned agents
    IF v_has_required_knowledge THEN
      UPDATE dh_task_agent_assignment
      SET required_knowledge = rec_task_domain.domain_ids
      WHERE tenant_id = v_tenant_id
        AND task_id = v_task_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'RAG workflow seed completed for tenant %.', v_tenant_id;
END
$$ LANGUAGE plpgsql;
