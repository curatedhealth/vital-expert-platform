-- ============================================================================
-- Create dh_task_full_vw convenience view for analytics & BI
-- Date: 2025-11-01
-- ============================================================================

CREATE OR REPLACE VIEW dh_task_full_vw AS
SELECT
  uc.tenant_id,
  d.id   AS domain_id,
  d.code AS domain_code,
  d.name AS domain_name,
  uc.id  AS use_case_id,
  uc.code AS use_case_code,
  uc.title AS use_case_title,
  uc.summary AS use_case_summary,
  uc.complexity,
  wf.id AS workflow_id,
  wf.name AS workflow_name,
  wf.description AS workflow_description,
  t.id  AS task_id,
  t.code AS task_code,
  t.title AS task_title,
  t.objective,
  t.position,
  t.extra,
  array_remove(array_agg(DISTINCT dr.code) FILTER (WHERE dr.id IS NOT NULL), NULL) AS role_codes,
  array_remove(array_agg(DISTINCT dr.name) FILTER (WHERE dr.id IS NOT NULL), NULL) AS role_names,
  array_remove(array_agg(DISTINCT dt.code) FILTER (WHERE dt.id IS NOT NULL), NULL) AS tool_codes,
  array_remove(array_agg(DISTINCT dt.name) FILTER (WHERE dt.id IS NOT NULL), NULL) AS tool_names,
  array_remove(array_agg(DISTINCT rp.name) FILTER (WHERE rp.id IS NOT NULL), NULL) AS prompt_names,
  jsonb_agg(DISTINCT jsonb_build_object(
      'name', rp.name,
      'pattern', rp.pattern,
      'system_prompt', rp.system_prompt,
      'user_template', rp.user_template
    )
  ) FILTER (WHERE rp.id IS NOT NULL) AS prompts,
  jsonb_agg(DISTINCT jsonb_build_object(
      'input', di.name,
      'type', di.input_type,
      'required', di.required
    )
  ) FILTER (WHERE di.id IS NOT NULL) AS inputs,
  jsonb_agg(DISTINCT jsonb_build_object(
      'output', do.name,
      'type', do.output_type
    )
  ) FILTER (WHERE do.id IS NOT NULL) AS outputs,
  jsonb_agg(DISTINCT jsonb_build_object(
      'kpi', k.name,
      'code', k.code,
      'target_value', tk.target_value,
      'target_note', tk.target_note
    )
  ) FILTER (WHERE tk.id IS NOT NULL) AS kpis
FROM dh_use_case uc
JOIN dh_domain d ON d.id = uc.domain_id
JOIN dh_workflow wf ON wf.use_case_id = uc.id
JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_role tr ON tr.task_id = t.id AND tr.tenant_id = uc.tenant_id
LEFT JOIN dh_role dr ON dr.id = tr.role_id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id AND tt.tenant_id = uc.tenant_id
LEFT JOIN dh_tool dt ON dt.id = tt.tool_id
LEFT JOIN dh_prompt rp ON rp.task_id = t.id AND rp.tenant_id = uc.tenant_id
LEFT JOIN dh_task_input di ON di.task_id = t.id AND di.tenant_id = uc.tenant_id
LEFT JOIN dh_task_output do ON do.task_id = t.id AND do.tenant_id = uc.tenant_id
LEFT JOIN dh_task_kpi_target tk ON tk.task_id = t.id AND tk.tenant_id = uc.tenant_id
LEFT JOIN dh_kpi k ON k.id = tk.kpi_id
GROUP BY
  uc.tenant_id,
  d.id, d.code, d.name,
  uc.id, uc.code, uc.title, uc.summary, uc.complexity,
  wf.id, wf.name, wf.description,
  t.id, t.code, t.title, t.objective, t.position, t.extra;

COMMENT ON VIEW dh_task_full_vw IS 'Flattened view of tasks with associated roles, tools, prompts, inputs, outputs, and KPIs';

