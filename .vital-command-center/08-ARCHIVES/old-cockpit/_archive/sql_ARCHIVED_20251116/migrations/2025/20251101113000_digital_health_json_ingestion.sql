-- ============================================================================
-- Digital Health JSON Ingestion (enhanced metadata)
-- Date: 2025-11-01
-- Purpose: Ingest workflow JSON payloads (see services/ai-engine/examples) into
--          the dh_* tables with full governance / compliance metadata.
-- ============================================================================

CREATE OR REPLACE FUNCTION dh_ingest_workflow(p_tenant_id uuid, p_payload jsonb)
RETURNS uuid AS $$
DECLARE
  v_domain_name   text;
  v_domain_code   text;
  v_domain_id     uuid;
  v_uc_code       text;
  v_uc_title      text;
  v_uc_summary    text;
  v_uc_complexity text;
  v_use_case_id   uuid;

  v_org_id        text;
  v_project_id    text;
  v_product_id    text;
  v_environment   text;
  v_therapeutic_area text;
  v_indication    text;
  v_phase         text;
  v_version       text;
  v_status        text;
  v_tags          jsonb;
  v_owners        jsonb;
  v_reviewers     jsonb;
  v_approvers     jsonb;
  v_change_log    jsonb;
  v_regulatory_refs jsonb;
  v_compliance_flags jsonb;
  v_data_classification jsonb;
  v_sla           jsonb;
  v_kpi_targets   jsonb;
  v_permissions   jsonb;
  v_integrations  jsonb;
  v_milestones    jsonb;
  v_risk_register jsonb;
  v_templates     jsonb;
  v_rag_sources   jsonb;
  v_rag_citations jsonb;
  v_audit         jsonb;

  wf_rec          record;
  wf              jsonb;
  v_workflow_id   uuid;
  v_wf_tags       jsonb;
  v_wf_sla        jsonb;
  v_wf_templates  jsonb;
  v_wf_rag_sources jsonb;
  v_wf_integrations jsonb;
  v_wf_milestones jsonb;
  v_wf_risk_register jsonb;

  task_rec        record;
  t               jsonb;
  v_task_id       uuid;
  v_position      integer;
  v_duration      integer;
  v_effort        numeric(8,2);
  v_task_state    text;
  v_task_run_policy jsonb;
  v_task_schedule jsonb;
  v_task_assignees jsonb;
  v_task_logs     jsonb;
  v_task_webhooks jsonb;
  v_task_guardrails jsonb;
  v_task_model_config jsonb;
  v_task_rollout  text;
  v_task_permissions jsonb;
  v_task_integrations jsonb;

  v_dep_code      text;
  v_dep_task_id   uuid;

  v_agent_code    text;
  v_tool_code     text;

  v_input         jsonb;
  v_input_name    text;
  v_input_type    text;
  v_input_description text;
  v_input_content_type text;
  v_input_schema_uri text;
  v_input_uri     text;
  v_input_required boolean;
  v_input_source  jsonb;
  v_input_link_type text;
  v_input_link    text;
  v_input_version text;
  v_input_validation jsonb;
  v_input_metadata jsonb;

  v_output        jsonb;
  v_output_name   text;
  v_output_type   text;
  v_output_description text;
  v_output_artifact_kind text;
  v_output_content_type text;
  v_output_schema_uri text;
  v_output_uri    text;
  v_output_format text;
  v_output_link_type text;
  v_output_link   text;
  v_output_version text;
  v_output_validation jsonb;
  v_output_metadata jsonb;
  v_output_template_id text;

  v_prompt        jsonb;
  v_prompt_owner  jsonb;
  v_prompt_model_config jsonb;
  v_prompt_guardrails jsonb;
  v_prompt_evals  jsonb;
  v_prompt_rollout text;
  v_prompt_identifier text;
  v_prompt_version_label text;
  v_prompt_id     uuid;

  v_kpi_key       text;
  v_kpi_code      text;
  v_kpi_value     jsonb;
  v_kpi_value_numeric numeric;
  v_kpi_note      text;

  v_payload_tenant text;
BEGIN
  v_payload_tenant := p_payload->>'tenant_id';

  -- Extract top-level fields
  v_domain_name   := p_payload->> 'domain';
  v_uc_code       := p_payload #>> '{use_case,code}';
  v_uc_title      := p_payload #>> '{use_case,title}';
  v_uc_summary    := p_payload #>> '{use_case,summary}';
  v_uc_complexity := COALESCE(NULLIF(p_payload #>> '{use_case,complexity}', ''), 'Advanced');

  v_org_id        := NULLIF(p_payload->>'org_id', '');
  v_project_id    := NULLIF(p_payload->>'project_id', '');
  v_product_id    := NULLIF(p_payload->>'product_id', '');
  v_environment   := LOWER(COALESCE(NULLIF(p_payload->>'environment', ''), 'dev'));
  IF v_environment NOT IN ('dev','staging','prod') THEN
    v_environment := 'dev';
  END IF;

  v_therapeutic_area := NULLIF(p_payload #>> '{use_case,therapeutic_area}', '');
  v_indication       := NULLIF(p_payload #>> '{use_case,indication}', '');
  v_phase            := NULLIF(p_payload #>> '{use_case,phase}', '');
  v_version          := NULLIF(p_payload #>> '{use_case,version}', '');
  v_status           := LOWER(COALESCE(NULLIF(p_payload #>> '{use_case,status}', ''), 'draft'));
  IF v_status NOT IN ('draft','in_review','approved','archived') THEN
    v_status := 'draft';
  END IF;

  v_tags             := COALESCE(p_payload #> '{use_case,tags}', '[]'::jsonb);
  v_owners           := COALESCE(p_payload #> '{use_case,owners}', '[]'::jsonb);
  v_reviewers        := COALESCE(p_payload #> '{use_case,reviewers}', '[]'::jsonb);
  v_approvers        := COALESCE(p_payload #> '{use_case,approvers}', '[]'::jsonb);
  v_change_log       := COALESCE(p_payload #> '{use_case,change_log}', '[]'::jsonb);
  v_regulatory_refs  := COALESCE(p_payload #> '{use_case,regulatory_references}', '[]'::jsonb);
  v_compliance_flags := COALESCE(p_payload #> '{use_case,compliance_flags}', '{}'::jsonb);
  v_data_classification := COALESCE(p_payload #> '{use_case,data_classification}', '{}'::jsonb);
  v_sla              := COALESCE(p_payload #> '{use_case,sla}', '{}'::jsonb);
  v_kpi_targets      := COALESCE(p_payload #> '{use_case,kpi_targets}', '{}'::jsonb);
  v_permissions      := COALESCE(p_payload #> '{use_case,permissions}', '{}'::jsonb);
  v_integrations     := COALESCE(p_payload #> '{use_case,integrations}', '[]'::jsonb);
  v_milestones       := COALESCE(p_payload #> '{use_case,milestones}', '[]'::jsonb);
  v_risk_register    := COALESCE(p_payload #> '{use_case,risk_register}', '[]'::jsonb);
  v_templates        := COALESCE(p_payload #> '{use_case,templates}', '{}'::jsonb);
  v_rag_sources      := COALESCE(p_payload #> '{use_case,rag_sources}', '[]'::jsonb);
  v_rag_citations    := COALESCE(p_payload #> '{use_case,rag_citations}', '[]'::jsonb);
  v_audit            := COALESCE(p_payload #> '{use_case,audit}', '{}'::jsonb);

  -- Compute domain code from name when not explicitly provided
  v_domain_code := CASE upper(v_domain_name)
    WHEN 'CLINICAL DEVELOPMENT' THEN 'CD'
    WHEN 'REGULATORY AFFAIRS' THEN 'RA'
    WHEN 'MARKET ACCESS' THEN 'MA'
    WHEN 'PRODUCT DEVELOPMENT' THEN 'PD'
    WHEN 'EVIDENCE GENERATION' THEN 'EG'
    ELSE (
      SELECT string_agg(substr(w,1,1), '')
      FROM unnest(string_to_array(regexp_replace(v_domain_name, '\s+', ' ', 'g'), ' ')) AS w
    )
  END;

  -- Upsert domain
  INSERT INTO dh_domain (tenant_id, code, name, description)
  VALUES (p_tenant_id, v_domain_code, v_domain_name, NULL)
  ON CONFLICT (tenant_id, code) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING id INTO v_domain_id;

  -- Upsert use case with extended metadata
  INSERT INTO dh_use_case (
    tenant_id, domain_id, code, title, summary, complexity,
    org_id, project_id, product_id, environment,
    therapeutic_area, indication, phase,
    version, status, tags, owners, reviewers, approvers,
    change_log, regulatory_references, compliance_flags,
    data_classification, sla, kpi_targets, permissions,
    integrations, milestones, risk_register, templates,
    rag_sources, rag_citations, audit
  )
  VALUES (
    p_tenant_id, v_domain_id, v_uc_code, v_uc_title, v_uc_summary, v_uc_complexity,
    v_org_id, v_project_id, v_product_id, v_environment,
    v_therapeutic_area, v_indication, v_phase,
    v_version, v_status, v_tags, v_owners, v_reviewers, v_approvers,
    v_change_log, v_regulatory_refs, v_compliance_flags,
    v_data_classification, v_sla, v_kpi_targets, v_permissions,
    v_integrations, v_milestones, v_risk_register, v_templates,
    v_rag_sources, v_rag_citations, v_audit
  )
  ON CONFLICT (tenant_id, code) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    complexity = EXCLUDED.complexity,
    org_id = EXCLUDED.org_id,
    project_id = EXCLUDED.project_id,
    product_id = EXCLUDED.product_id,
    environment = EXCLUDED.environment,
    therapeutic_area = EXCLUDED.therapeutic_area,
    indication = EXCLUDED.indication,
    phase = EXCLUDED.phase,
    version = EXCLUDED.version,
    status = EXCLUDED.status,
    tags = EXCLUDED.tags,
    owners = EXCLUDED.owners,
    reviewers = EXCLUDED.reviewers,
    approvers = EXCLUDED.approvers,
    change_log = EXCLUDED.change_log,
    regulatory_references = EXCLUDED.regulatory_references,
    compliance_flags = EXCLUDED.compliance_flags,
    data_classification = EXCLUDED.data_classification,
    sla = EXCLUDED.sla,
    kpi_targets = EXCLUDED.kpi_targets,
    permissions = EXCLUDED.permissions,
    integrations = EXCLUDED.integrations,
    milestones = EXCLUDED.milestones,
    risk_register = EXCLUDED.risk_register,
    templates = EXCLUDED.templates,
    rag_sources = EXCLUDED.rag_sources,
    rag_citations = EXCLUDED.rag_citations,
    audit = EXCLUDED.audit
  RETURNING id INTO v_use_case_id;

  -- Iterate workflows (preserve ordering via ordinality)
  FOR wf_rec IN
    SELECT elem, (ord::int - 1) AS position
    FROM jsonb_array_elements(p_payload #> '{use_case,workflows}') WITH ORDINALITY AS e(elem, ord)
  LOOP
    wf := wf_rec.elem;

    v_wf_tags := COALESCE(wf->'tags', '[]'::jsonb);
    v_wf_sla  := COALESCE(wf->'sla', '{}'::jsonb);
    v_wf_templates := COALESCE(wf->'templates', '{}'::jsonb);
    v_wf_rag_sources := COALESCE(wf->'rag_sources', '[]'::jsonb);
    v_wf_integrations := COALESCE(wf->'integrations', '[]'::jsonb);
    v_wf_milestones := COALESCE(wf->'milestones', '[]'::jsonb);
    v_wf_risk_register := COALESCE(wf->'risk_register', '[]'::jsonb);

    INSERT INTO dh_workflow (
      tenant_id, use_case_id, name, description, position,
      metadata, tags, sla, templates, rag_sources, integrations, milestones, risk_register
    )
    VALUES (
      p_tenant_id,
      v_use_case_id,
      wf->>'name',
      wf->>'description',
      COALESCE((wf->>'position')::int, wf_rec.position),
      COALESCE(wf->'metadata', '{}'::jsonb),
      v_wf_tags,
      v_wf_sla,
      v_wf_templates,
      v_wf_rag_sources,
      v_wf_integrations,
      v_wf_milestones,
      v_wf_risk_register
    )
    ON CONFLICT (use_case_id, name) DO UPDATE SET
      description = EXCLUDED.description,
      position = EXCLUDED.position,
      metadata = EXCLUDED.metadata,
      tags = EXCLUDED.tags,
      sla = EXCLUDED.sla,
      templates = EXCLUDED.templates,
      rag_sources = EXCLUDED.rag_sources,
      integrations = EXCLUDED.integrations,
      milestones = EXCLUDED.milestones,
      risk_register = EXCLUDED.risk_register
    RETURNING id INTO v_workflow_id;

    -- First pass: upsert tasks
    FOR task_rec IN
      SELECT elem, (ord::int - 1) AS position
      FROM jsonb_array_elements(wf->'tasks') WITH ORDINALITY AS e(elem, ord)
    LOOP
      t := task_rec.elem;
      v_position := COALESCE((t->>'position')::int, task_rec.position);

      v_duration := CASE
        WHEN t ? 'duration_estimate_minutes'
             AND (t->>'duration_estimate_minutes') ~ '^-?[0-9]+$'
          THEN (t->>'duration_estimate_minutes')::int
        ELSE NULL
      END;

      v_effort := CASE
        WHEN t ? 'effort_hours'
             AND (t->>'effort_hours') ~ '^-?[0-9]+(\.[0-9]+)?$'
          THEN (t->>'effort_hours')::numeric
        ELSE NULL
      END;

      v_task_state := LOWER(COALESCE(NULLIF(t->>'state',''),'planned'));
      IF v_task_state NOT IN ('planned','in_progress','blocked','done','failed') THEN
        v_task_state := 'planned';
      END IF;

      v_task_run_policy := COALESCE(t->'run_policy', '{}'::jsonb);
      v_task_schedule := COALESCE(t->'schedule', '{}'::jsonb);

      v_task_assignees := CASE
        WHEN t ? 'assignees' THEN
          CASE jsonb_typeof(t->'assignees')
            WHEN 'array' THEN t->'assignees'
            WHEN 'string' THEN jsonb_build_array(t->>'assignees')
            ELSE '[]'::jsonb
          END
        ELSE '[]'::jsonb
      END;

      v_task_logs := CASE
        WHEN t ? 'logs' THEN
          CASE jsonb_typeof(t->'logs')
            WHEN 'array' THEN t->'logs'
            WHEN 'string' THEN jsonb_build_array(t->>'logs')
            ELSE '[]'::jsonb
          END
        ELSE '[]'::jsonb
      END;

      v_task_webhooks := CASE
        WHEN t ? 'webhooks' THEN
          CASE jsonb_typeof(t->'webhooks')
            WHEN 'array' THEN t->'webhooks'
            WHEN 'string' THEN jsonb_build_array(t->>'webhooks')
            ELSE '[]'::jsonb
          END
        ELSE '[]'::jsonb
      END;

      v_task_guardrails := COALESCE(t->'guardrails', '{}'::jsonb);
      v_task_model_config := COALESCE(t->'model_config', '{}'::jsonb);
      v_task_rollout := LOWER(COALESCE(NULLIF(t->>'rollout',''),'stable'));
      IF v_task_rollout NOT IN ('stable','canary','deprecated') THEN
        v_task_rollout := 'stable';
      END IF;

      v_task_permissions := COALESCE(t->'permissions', '{}'::jsonb);
      v_task_integrations := COALESCE(t->'integrations', '[]'::jsonb);

      INSERT INTO dh_task (
        tenant_id, workflow_id, code, title, objective, position, extra,
        duration_estimate_minutes, effort_hours, run_policy, state,
        assignees, logs, webhooks, schedule, guardrails, model_config,
        rollout, permissions, integrations
      )
      VALUES (
        p_tenant_id,
        v_workflow_id,
        t->>'code',
        t->>'title',
        t->>'objective',
        COALESCE(v_position, 0),
        COALESCE(t->'extra', '{}'::jsonb),
        v_duration,
        v_effort,
        v_task_run_policy,
        v_task_state,
        v_task_assignees,
        v_task_logs,
        v_task_webhooks,
        v_task_schedule,
        v_task_guardrails,
        v_task_model_config,
        v_task_rollout,
        v_task_permissions,
        v_task_integrations
      )
      ON CONFLICT (workflow_id, code) DO UPDATE SET
        title = EXCLUDED.title,
        objective = EXCLUDED.objective,
        position = EXCLUDED.position,
        extra = EXCLUDED.extra,
        duration_estimate_minutes = EXCLUDED.duration_estimate_minutes,
        effort_hours = EXCLUDED.effort_hours,
        run_policy = EXCLUDED.run_policy,
        state = EXCLUDED.state,
        assignees = EXCLUDED.assignees,
        logs = EXCLUDED.logs,
        webhooks = EXCLUDED.webhooks,
        schedule = EXCLUDED.schedule,
        guardrails = EXCLUDED.guardrails,
        model_config = EXCLUDED.model_config,
        rollout = EXCLUDED.rollout,
        permissions = EXCLUDED.permissions,
        integrations = EXCLUDED.integrations
      RETURNING id INTO v_task_id;

      -- Agents → dh_role + dh_task_role (default responsibility: Contributor)
      IF (t ? 'agents') THEN
        FOR v_agent_code IN SELECT jsonb_array_elements_text(t->'agents') LOOP
          INSERT INTO dh_role (tenant_id, code, name, agent_type)
          VALUES (p_tenant_id, v_agent_code, v_agent_code, CASE WHEN position('AI' in upper(v_agent_code)) > 0 THEN 'AI' ELSE 'Human' END)
          ON CONFLICT (tenant_id, code) DO NOTHING;

          INSERT INTO dh_task_role (tenant_id, task_id, role_id, responsibility)
          SELECT p_tenant_id, v_task_id, r.id, 'Contributor'
          FROM dh_role r
          WHERE r.tenant_id = p_tenant_id AND r.code = v_agent_code
          ON CONFLICT (task_id, role_id, responsibility) DO NOTHING;
        END LOOP;
      END IF;

      -- Tools → dh_tool + dh_task_tool
      IF (t ? 'tools') THEN
        FOR v_tool_code IN SELECT jsonb_array_elements_text(t->'tools') LOOP
          INSERT INTO dh_tool (tenant_id, code, name, category)
          VALUES (p_tenant_id, v_tool_code, v_tool_code, NULL)
          ON CONFLICT (tenant_id, code) DO NOTHING;

          INSERT INTO dh_task_tool (tenant_id, task_id, tool_id, purpose)
          SELECT p_tenant_id, v_task_id, tl.id, NULL
          FROM dh_tool tl
          WHERE tl.tenant_id = p_tenant_id AND tl.code = v_tool_code
          ON CONFLICT (task_id, tool_id) DO NOTHING;
        END LOOP;
      END IF;

      -- Inputs with rich metadata
      IF (t ? 'inputs') THEN
        FOR v_input IN SELECT jsonb_array_elements(t->'inputs') LOOP
          IF jsonb_typeof(v_input) = 'object' THEN
            v_input_name := v_input->>'name';
            IF v_input_name IS NULL THEN
              CONTINUE;
            END IF;
            v_input_description := v_input->>'description';
            v_input_content_type := v_input->>'content_type';
            v_input_schema_uri := v_input->>'schema_uri';
            v_input_uri := v_input->>'link';
            v_input_required := COALESCE((v_input->>'required')::boolean, true);
            v_input_source := COALESCE(v_input->'source', '{}'::jsonb);
            v_input_link_type := v_input->>'link_type';
            v_input_link := COALESCE(v_input->>'link', v_input->>'uri');
            v_input_version := v_input->>'version';
            v_input_validation := COALESCE(v_input->'validation', '{}'::jsonb);
            v_input_metadata := COALESCE(v_input->'metadata', '{}'::jsonb);
            v_input_type := COALESCE(NULLIF(v_input->>'input_type',''), 'document');
          ELSE
            v_input_name := trim(both '"' from v_input::text);
            v_input_description := NULL;
            v_input_content_type := NULL;
            v_input_schema_uri := NULL;
            v_input_uri := NULL;
            v_input_required := true;
            v_input_source := '{}'::jsonb;
            v_input_link_type := NULL;
            v_input_link := NULL;
            v_input_version := NULL;
            v_input_validation := '{}'::jsonb;
            v_input_metadata := '{}'::jsonb;
            v_input_type := 'document';
          END IF;

          INSERT INTO dh_task_input (
            tenant_id, task_id, name, input_type, uri, source_task_id, required,
            metadata, description, content_type, schema_uri, source, link_type,
            link, version, validation
          )
          VALUES (
            p_tenant_id, v_task_id, v_input_name, v_input_type, v_input_uri,
            NULL, v_input_required, v_input_metadata, v_input_description,
            v_input_content_type, v_input_schema_uri, v_input_source,
            v_input_link_type, v_input_link, v_input_version, v_input_validation
          )
          ON CONFLICT (task_id, name) DO UPDATE SET
            input_type = EXCLUDED.input_type,
            uri = EXCLUDED.uri,
            required = EXCLUDED.required,
            metadata = EXCLUDED.metadata,
            description = EXCLUDED.description,
            content_type = EXCLUDED.content_type,
            schema_uri = EXCLUDED.schema_uri,
            source = EXCLUDED.source,
            link_type = EXCLUDED.link_type,
            link = EXCLUDED.link,
            version = EXCLUDED.version,
            validation = EXCLUDED.validation;
        END LOOP;
      END IF;

      -- Outputs with rich metadata
      IF (t ? 'outputs') THEN
        FOR v_output IN SELECT jsonb_array_elements(t->'outputs') LOOP
          IF jsonb_typeof(v_output) = 'object' THEN
            v_output_name := v_output->>'name';
            IF v_output_name IS NULL THEN
              CONTINUE;
            END IF;
            v_output_description := v_output->>'description';
            v_output_artifact_kind := v_output->>'artifact_kind';
            v_output_content_type := v_output->>'content_type';
            v_output_schema_uri := v_output->>'schema_uri';
            v_output_uri := v_output->>'link';
            v_output_format := v_output->>'format';
            v_output_link_type := v_output->>'link_type';
            v_output_version := v_output->>'version';
            v_output_validation := COALESCE(v_output->'validation', '{}'::jsonb);
            v_output_metadata := COALESCE(v_output->'metadata', '{}'::jsonb);
            v_output_template_id := v_output->>'template_id';
            v_output_type := COALESCE(NULLIF(v_output->>'output_type',''), 'document');
          ELSE
            v_output_name := trim(both '"' from v_output::text);
            v_output_description := NULL;
            v_output_artifact_kind := NULL;
            v_output_content_type := NULL;
            v_output_schema_uri := NULL;
            v_output_uri := NULL;
            v_output_format := NULL;
            v_output_link_type := NULL;
            v_output_version := NULL;
            v_output_validation := '{}'::jsonb;
            v_output_metadata := '{}'::jsonb;
            v_output_template_id := NULL;
            v_output_type := 'document';
          END IF;

          INSERT INTO dh_task_output (
            tenant_id, task_id, name, output_type, uri, format, metadata,
            description, artifact_kind, content_type, schema_uri, link_type,
            link, version, validation, template_id
          )
          VALUES (
            p_tenant_id, v_task_id, v_output_name, v_output_type, v_output_uri,
            v_output_format, v_output_metadata, v_output_description,
            v_output_artifact_kind, v_output_content_type, v_output_schema_uri,
            v_output_link_type, v_output_uri, v_output_version,
            v_output_validation, v_output_template_id
          )
          ON CONFLICT (task_id, name) DO UPDATE SET
            output_type = EXCLUDED.output_type,
            uri = EXCLUDED.uri,
            format = EXCLUDED.format,
            metadata = EXCLUDED.metadata,
            description = EXCLUDED.description,
            artifact_kind = EXCLUDED.artifact_kind,
            content_type = EXCLUDED.content_type,
            schema_uri = EXCLUDED.schema_uri,
            link_type = EXCLUDED.link_type,
            link = EXCLUDED.link,
            version = EXCLUDED.version,
            validation = EXCLUDED.validation,
            template_id = EXCLUDED.template_id;
        END LOOP;
      END IF;

      -- Prompts
      IF (t ? 'prompts') THEN
        FOR v_prompt IN SELECT jsonb_array_elements(t->'prompts')::jsonb LOOP
          v_prompt_identifier := v_prompt->>'prompt_id';
          v_prompt_version_label := COALESCE(v_prompt->>'version', v_prompt->>'version_label');

          IF v_prompt ? 'owner' THEN
            IF jsonb_typeof(v_prompt->'owner') = 'string' THEN
              v_prompt_owner := jsonb_build_array(v_prompt->>'owner');
            ELSE
              v_prompt_owner := v_prompt->'owner';
            END IF;
          ELSIF v_prompt ? 'owners' THEN
            v_prompt_owner := v_prompt->'owners';
          ELSE
            v_prompt_owner := '[]'::jsonb;
          END IF;

          v_prompt_model_config := COALESCE(v_prompt->'model_config', '{}'::jsonb);
          v_prompt_guardrails := COALESCE(v_prompt->'guardrails', '{}'::jsonb);
          v_prompt_evals := COALESCE(v_prompt->'evals', '{}'::jsonb);
          v_prompt_rollout := LOWER(COALESCE(NULLIF(v_prompt->>'rollout',''),'stable'));
          IF v_prompt_rollout NOT IN ('stable','canary','deprecated') THEN
            v_prompt_rollout := 'stable';
          END IF;

          INSERT INTO dh_prompt (
            tenant_id, task_id, name, pattern, system_prompt, user_template,
            metadata, prompt_identifier, version_label, owner, model_config,
            guardrails, evals, rollout
          )
          VALUES (
            p_tenant_id,
            v_task_id,
            v_prompt->>'name',
            COALESCE(NULLIF(v_prompt->>'pattern',''), 'CoT'),
            COALESCE(v_prompt->>'system_prompt',''),
            COALESCE(v_prompt->>'user_template',''),
            COALESCE(v_prompt->'metadata','{}'::jsonb),
            v_prompt_identifier,
            v_prompt_version_label,
            v_prompt_owner,
            v_prompt_model_config,
            v_prompt_guardrails,
            v_prompt_evals,
            v_prompt_rollout
          )
          ON CONFLICT (tenant_id, name, task_id) DO UPDATE SET
            pattern = EXCLUDED.pattern,
            system_prompt = EXCLUDED.system_prompt,
            user_template = EXCLUDED.user_template,
            metadata = EXCLUDED.metadata,
            prompt_identifier = EXCLUDED.prompt_identifier,
            version_label = EXCLUDED.version_label,
            owner = EXCLUDED.owner,
            model_config = EXCLUDED.model_config,
            guardrails = EXCLUDED.guardrails,
            evals = EXCLUDED.evals,
            rollout = EXCLUDED.rollout
          RETURNING id INTO v_prompt_id;
        END LOOP;
      END IF;

      -- KPIs
      IF (t ? 'kpis') THEN
        FOR v_kpi_key IN SELECT jsonb_object_keys(t->'kpis') LOOP
          v_kpi_value := t->'kpis'->v_kpi_key;
          v_kpi_code := upper(regexp_replace(v_kpi_key, '[^A-Za-z0-9]+', '_', 'g'));

          INSERT INTO dh_kpi (tenant_id, code, name, unit)
          VALUES (p_tenant_id, v_kpi_code, v_kpi_key, NULL)
          ON CONFLICT (tenant_id, code) DO NOTHING;

          v_kpi_value_numeric := NULL;
          v_kpi_note := NULL;
          IF jsonb_typeof(v_kpi_value) = 'number' THEN
            v_kpi_value_numeric := (v_kpi_value)::numeric;
          ELSE
            v_kpi_note := trim(both '"' from v_kpi_value::text);
          END IF;

          INSERT INTO dh_task_kpi_target (
            tenant_id, task_id, kpi_id, target_value, target_note
          )
          SELECT p_tenant_id, v_task_id, kk.id,
                 v_kpi_value_numeric,
                 v_kpi_note
          FROM dh_kpi kk
          WHERE kk.tenant_id = p_tenant_id AND kk.code = v_kpi_code
          ON CONFLICT (task_id, kpi_id) DO UPDATE SET
            target_value = EXCLUDED.target_value,
            target_note = EXCLUDED.target_note;
        END LOOP;
      END IF;
    END LOOP; -- tasks first pass

    -- Second pass: dependencies (requires all tasks to exist)
    FOR t IN SELECT jsonb_array_elements(wf->'tasks') LOOP
      v_task_id := (
        SELECT id FROM dh_task
        WHERE tenant_id = p_tenant_id AND workflow_id = v_workflow_id AND code = t->> 'code'
      );

      IF (t ? 'dependencies') THEN
        FOR v_dep_code IN SELECT jsonb_array_elements_text(t->'dependencies') LOOP
          v_dep_task_id := (
            SELECT id FROM dh_task
            WHERE tenant_id = p_tenant_id AND workflow_id = v_workflow_id AND code = v_dep_code
          );
          IF v_dep_task_id IS NOT NULL THEN
            INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
            VALUES (p_tenant_id, v_task_id, v_dep_task_id)
            ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;
          END IF;
        END LOOP;
      END IF;
    END LOOP; -- tasks dependency pass

  END LOOP; -- workflows

  RETURN v_use_case_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dh_ingest_workflow(uuid, jsonb) IS 'Ingests a use_case workflow JSON into dh_* tables for given tenant_id (enhanced metadata).';

