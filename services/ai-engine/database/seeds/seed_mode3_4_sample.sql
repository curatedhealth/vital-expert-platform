-- Sample seeds for Mode 3/4 missions, steps, and artifacts (optional placeholders)
-- Tenant: default platform tenant
-- If you need a different tenant, replace the UUIDs below.
-- Default tenant UUID:
-- 00000000-0000-0000-0000-000000000001

-- =========================
-- Mission 1 (Mode 3 - Manual Autonomous)
-- =========================
WITH mission_ins AS (
  INSERT INTO missions (
    tenant_id, user_id, mode, goal, expert_id, status, config, metadata, title, objective
  )
  VALUES (
    coalesce(current_setting('app.tenant_id', true)::uuid, gen_random_uuid()),
    coalesce(current_setting('app.user_id', true)::uuid, gen_random_uuid()),
    3,
    'Assess reimbursement strategy for oral TYK2 inhibitor in BE (psoriasis + UC)',
    NULL,
    'pending',
    jsonb_build_object('budget_limit', 10.0),
    jsonb_build_object('template_slug', 'market_access_strategy', 'family', 'market_access'),
    'BE TYK2 reimbursement strategy',
    'Develop comprehensive reimbursement strategy for TYK2 in BE'
  )
  RETURNING id
)
INSERT INTO mission_steps (
  mission_id, step_index, title, description, agent_level, agent_code, status, input_data
)
SELECT id, s.step_index, s.title, s.description, s.agent_level, s.agent_code, 'pending', s.input_data
FROM mission_ins, (
  VALUES
    (0, 'Frame the objective', 'Summarize indication, label, comparators, endpoints', 'L3', 'context_specialist', jsonb_build_object()),
    (1, 'Evidence retrieval', 'Retrieve HTA precedents and Belgian pricing constraints', 'L4', 'evidence', jsonb_build_object()),
    (2, 'Synthesis', 'Draft reimbursement strategy tailored to INAMI/RIZIV', 'L2', 'domain_lead', jsonb_build_object())
) AS s(step_index, title, description, agent_level, agent_code, input_data);


-- =========================
-- Mission 2 (Mode 4 - Auto Autonomous)
-- =========================
WITH mission_ins AS (
  INSERT INTO missions (
    tenant_id, user_id, mode, goal, expert_id, status, config, metadata, title, objective
  )
  VALUES (
    coalesce(current_setting('app.tenant_id', true)::uuid, gen_random_uuid()),
    coalesce(current_setting('app.user_id', true)::uuid, gen_random_uuid()),
    4,
    'Automate safety signal review for new label expansion (oncology)',
    NULL,
    'pending',
    jsonb_build_object('budget_limit', 8.0),
    jsonb_build_object('template_slug', 'safety_signal_review', 'family', 'safety'),
    'Safety signal review automation',
    'Automate safety signal detection and assessment for label expansion'
  )
  RETURNING id
)
INSERT INTO mission_steps (
  mission_id, step_index, title, description, agent_level, agent_code, status, input_data
)
SELECT id, s.step_index, s.title, s.description, s.agent_level, s.agent_code, 'pending', s.input_data
FROM mission_ins, (
  VALUES
    (0, 'Ingest sources', 'Collect FAERS/EudraVigilance and internal SAE listings', 'L3', 'context_specialist', jsonb_build_object()),
    (1, 'Signal detection', 'Run disproportionality analysis and cluster review', 'L4', 'safety_worker', jsonb_build_object()),
    (2, 'Assessment', 'Summarize signals and recommend actions', 'L2', 'safety_lead', jsonb_build_object())
) AS s(step_index, title, description, agent_level, agent_code, input_data);


-- =========================
-- (Optional) Example artifacts for Mission 1 step 2 (comment out if not needed)
-- =========================
-- INSERT INTO mission_artifacts (
--   mission_id, step_id, artifact_type, title, description, content_type, content, metadata
-- )
-- SELECT
--   ms.mission_id,
--   ms.id,
--   'document',
--   'Belgian HTA comparator analysis',
--   'Key precedents and pricing constraints',
--   'application/json',
--   jsonb_build_object('summary', 'Sample content for demo'),
--   jsonb_build_object('sources', 'placeholder')
-- FROM mission_steps ms
-- WHERE ms.step_index = 1
--   AND ms.mission_id IN (SELECT id FROM missions WHERE tenant_id = :'tenant_id' ORDER BY created_at DESC LIMIT 2);
