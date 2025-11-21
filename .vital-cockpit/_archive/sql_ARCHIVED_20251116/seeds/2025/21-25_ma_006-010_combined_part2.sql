-- ==================================================================================
-- 21-25_ma_006-010_combined_part2.sql - ALL ASSIGNMENTS for UC_MA_006 through UC_MA_010
-- ==================================================================================
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT); DELETE FROM session_config;
INSERT INTO session_config SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- ========== UC_MA_006: Budget Impact Model ==========
INSERT INTO dh_task_dependency (tenant_id,task_id,depends_on_task_id,note) SELECT sc.tenant_id,t.id,dt.id,dep_data.note FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-006-02','TSK-MA-006-01','Pop estimate requires scope'),('TSK-MA-006-03','TSK-MA-006-02','Uptake based on population'),
('TSK-MA-006-04','TSK-MA-006-03','Cost modeling uses uptake'),('TSK-MA-006-05','TSK-MA-006-04','PMPM calculated from costs'),('TSK-MA-006-06','TSK-MA-006-05','Sensitivity on final PMPM'))
AS dep_data(task_code,depends_on_code,note) INNER JOIN dh_task t ON t.code=dep_data.task_code AND t.tenant_id=sc.tenant_id
INNER JOIN dh_task dt ON dt.code=dep_data.depends_on_code AND dt.tenant_id=sc.tenant_id ON CONFLICT (task_id,depends_on_task_id) DO UPDATE SET note=EXCLUDED.note;

INSERT INTO dh_task_agent (tenant_id,task_id,agent_id,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
SELECT sc.tenant_id,t.id,a.id,agent_data.assignment_type,agent_data.execution_order,agent_data.requires_human_approval,agent_data.max_retries,agent_data.retry_strategy,agent_data.is_parallel,agent_data.approval_persona_code,agent_data.approval_stage,agent_data.on_failure,agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-006-01','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-006-02','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-006-03','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-006-04','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-006-05','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-006-06','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb))
AS agent_data(task_code,agent_code,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
INNER JOIN dh_task t ON t.code=agent_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_agent a ON a.code=agent_data.agent_code AND a.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,agent_id,assignment_type) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO dh_task_persona (tenant_id,task_id,persona_id,responsibility,review_timing,escalation_to_persona_code,metadata)
SELECT sc.tenant_id,t.id,p.id,persona_data.responsibility,persona_data.review_timing,persona_data.escalation_to_persona_code,persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-006-01','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-006-02','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-006-04','P22_HEOR','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),('TSK-MA-006-05','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-006-06','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb))
AS persona_data(task_code,persona_code,responsibility,review_timing,escalation_to_persona_code,metadata)
INNER JOIN dh_task t ON t.code=persona_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_persona p ON p.code=persona_data.persona_code AND p.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,persona_id,responsibility) DO UPDATE SET metadata=EXCLUDED.metadata;

-- ========== UC_MA_007: Comparative Effectiveness ==========
INSERT INTO dh_task_dependency (tenant_id,task_id,depends_on_task_id,note) SELECT sc.tenant_id,t.id,dt.id,dep_data.note FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-007-02','TSK-MA-007-01','SLR follows strategy'),('TSK-MA-007-03','TSK-MA-007-02','Analysis requires literature'),
('TSK-MA-007-04','TSK-MA-007-03','Quality assessment of analysis'),('TSK-MA-007-05','TSK-MA-007-04','Synthesis after quality check'),('TSK-MA-007-06','TSK-MA-007-05','Visuals from synthesis'))
AS dep_data(task_code,depends_on_code,note) INNER JOIN dh_task t ON t.code=dep_data.task_code AND t.tenant_id=sc.tenant_id
INNER JOIN dh_task dt ON dt.code=dep_data.depends_on_code AND dt.tenant_id=sc.tenant_id ON CONFLICT (task_id,depends_on_task_id) DO UPDATE SET note=EXCLUDED.note;

INSERT INTO dh_task_agent (tenant_id,task_id,agent_id,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
SELECT sc.tenant_id,t.id,a.id,agent_data.assignment_type,agent_data.execution_order,agent_data.requires_human_approval,agent_data.max_retries,agent_data.retry_strategy,agent_data.is_parallel,agent_data.approval_persona_code,agent_data.approval_stage,agent_data.on_failure,agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-007-01','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-007-02','AGT-LITERATURE-SEARCH','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-007-03','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-007-04','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-007-05','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-007-06','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb))
AS agent_data(task_code,agent_code,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
INNER JOIN dh_task t ON t.code=agent_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_agent a ON a.code=agent_data.agent_code AND a.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,agent_id,assignment_type) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO dh_task_persona (tenant_id,task_id,persona_id,responsibility,review_timing,escalation_to_persona_code,metadata)
SELECT sc.tenant_id,t.id,p.id,persona_data.responsibility,persona_data.review_timing,persona_data.escalation_to_persona_code,persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-007-01','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-007-02','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-007-03','P22_HEOR','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),('TSK-MA-007-04','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-007-05','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-007-06','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb))
AS persona_data(task_code,persona_code,responsibility,review_timing,escalation_to_persona_code,metadata)
INNER JOIN dh_task t ON t.code=persona_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_persona p ON p.code=persona_data.persona_code AND p.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,persona_id,responsibility) DO UPDATE SET metadata=EXCLUDED.metadata;

-- ========== UC_MA_008: Value-Based Contracting ==========
INSERT INTO dh_task_dependency (tenant_id,task_id,depends_on_task_id,note) SELECT sc.tenant_id,t.id,dt.id,dep_data.note FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-008-02','TSK-MA-008-01','Metrics after feasibility'),('TSK-MA-008-03','TSK-MA-008-02','Payment model uses metrics'),
('TSK-MA-008-04','TSK-MA-008-03','Model financial scenarios'),('TSK-MA-008-05','TSK-MA-008-02','Monitoring plan for metrics'),
('TSK-MA-008-06','TSK-MA-008-03','Contract terms from payment model'),('TSK-MA-008-07','TSK-MA-008-06','Package after contracts'))
AS dep_data(task_code,depends_on_code,note) INNER JOIN dh_task t ON t.code=dep_data.task_code AND t.tenant_id=sc.tenant_id
INNER JOIN dh_task dt ON dt.code=dep_data.depends_on_code AND dt.tenant_id=sc.tenant_id ON CONFLICT (task_id,depends_on_task_id) DO UPDATE SET note=EXCLUDED.note;

INSERT INTO dh_task_agent (tenant_id,task_id,agent_id,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
SELECT sc.tenant_id,t.id,a.id,agent_data.assignment_type,agent_data.execution_order,agent_data.requires_human_approval,agent_data.max_retries,agent_data.retry_strategy,agent_data.is_parallel,agent_data.approval_persona_code,agent_data.approval_stage,agent_data.on_failure,agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-008-01','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-02','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-03','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-04','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-05','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P12_CLINICAL_OPS','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-06','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P05_REGAFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-008-07','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb))
AS agent_data(task_code,agent_code,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
INNER JOIN dh_task t ON t.code=agent_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_agent a ON a.code=agent_data.agent_code AND a.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,agent_id,assignment_type) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO dh_task_persona (tenant_id,task_id,persona_id,responsibility,review_timing,escalation_to_persona_code,metadata)
SELECT sc.tenant_id,t.id,p.id,persona_data.responsibility,persona_data.review_timing,persona_data.escalation_to_persona_code,persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-008-01','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-008-02','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-008-03','P22_HEOR','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),('TSK-MA-008-04','P22_HEOR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-008-05','P12_CLINICAL_OPS','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-008-06','P05_REGAFF','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-008-07','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb))
AS persona_data(task_code,persona_code,responsibility,review_timing,escalation_to_persona_code,metadata)
INNER JOIN dh_task t ON t.code=persona_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_persona p ON p.code=persona_data.persona_code AND p.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,persona_id,responsibility) DO UPDATE SET metadata=EXCLUDED.metadata;

-- ========== UC_MA_009: HTA Submission ==========
INSERT INTO dh_task_dependency (tenant_id,task_id,depends_on_task_id,note) SELECT sc.tenant_id,t.id,dt.id,dep_data.note FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-009-02','TSK-MA-009-01','Requirements after targeting'),('TSK-MA-009-03','TSK-MA-009-02','Evidence package per requirements'),
('TSK-MA-009-04','TSK-MA-009-02','Economic model per requirements'),('TSK-MA-009-05','TSK-MA-009-01','Patient input for target bodies'),
('TSK-MA-009-06','TSK-MA-009-03','Dossier requires evidence'),('TSK-MA-009-06','TSK-MA-009-04','Dossier requires model'),
('TSK-MA-009-07','TSK-MA-009-06','Review complete dossier'),('TSK-MA-009-08','TSK-MA-009-07','Submit after review'))
AS dep_data(task_code,depends_on_code,note) INNER JOIN dh_task t ON t.code=dep_data.task_code AND t.tenant_id=sc.tenant_id
INNER JOIN dh_task dt ON dt.code=dep_data.depends_on_code AND dt.tenant_id=sc.tenant_id ON CONFLICT (task_id,depends_on_task_id) DO UPDATE SET note=EXCLUDED.note;

INSERT INTO dh_task_agent (tenant_id,task_id,agent_id,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
SELECT sc.tenant_id,t.id,a.id,agent_data.assignment_type,agent_data.execution_order,agent_data.requires_human_approval,agent_data.max_retries,agent_data.retry_strategy,agent_data.is_parallel,agent_data.approval_persona_code,agent_data.approval_stage,agent_data.on_failure,agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-009-01','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-02','AGT-LITERATURE-SEARCH','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P05_REGAFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-03','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-04','AGT-BIOSTATISTICS','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P22_HEOR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-05','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P23_MED_AFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-06','AGT-CLINICAL-REPORT-WRITER','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P05_REGAFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-07','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-009-08','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P05_REGAFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb))
AS agent_data(task_code,agent_code,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
INNER JOIN dh_task t ON t.code=agent_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_agent a ON a.code=agent_data.agent_code AND a.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,agent_id,assignment_type) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO dh_task_persona (tenant_id,task_id,persona_id,responsibility,review_timing,escalation_to_persona_code,metadata)
SELECT sc.tenant_id,t.id,p.id,persona_data.responsibility,persona_data.review_timing,persona_data.escalation_to_persona_code,persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-009-01','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-009-02','P05_REGAFF','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-009-03','P22_HEOR','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),('TSK-MA-009-04','P22_HEOR','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),
('TSK-MA-009-05','P23_MED_AFF','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-009-06','P05_REGAFF','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),
('TSK-MA-009-07','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-009-08','P05_REGAFF','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb))
AS persona_data(task_code,persona_code,responsibility,review_timing,escalation_to_persona_code,metadata)
INNER JOIN dh_task t ON t.code=persona_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_persona p ON p.code=persona_data.persona_code AND p.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,persona_id,responsibility) DO UPDATE SET metadata=EXCLUDED.metadata;

-- ========== UC_MA_010: Patient Assistance Program ==========
INSERT INTO dh_task_dependency (tenant_id,task_id,depends_on_task_id,note) SELECT sc.tenant_id,t.id,dt.id,dep_data.note FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-010-02','TSK-MA-010-01','Structure based on barriers'),('TSK-MA-010-03','TSK-MA-010-02','Eligibility for program type'),
('TSK-MA-010-04','TSK-MA-010-03','Compliance with eligibility'),('TSK-MA-010-05','TSK-MA-010-04','Operations after compliance'))
AS dep_data(task_code,depends_on_code,note) INNER JOIN dh_task t ON t.code=dep_data.task_code AND t.tenant_id=sc.tenant_id
INNER JOIN dh_task dt ON dt.code=dep_data.depends_on_code AND dt.tenant_id=sc.tenant_id ON CONFLICT (task_id,depends_on_task_id) DO UPDATE SET note=EXCLUDED.note;

INSERT INTO dh_task_agent (tenant_id,task_id,agent_id,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
SELECT sc.tenant_id,t.id,a.id,agent_data.assignment_type,agent_data.execution_order,agent_data.requires_human_approval,agent_data.max_retries,agent_data.retry_strategy,agent_data.is_parallel,agent_data.approval_persona_code,agent_data.approval_stage,agent_data.on_failure,agent_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-010-01','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-010-02','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-010-03','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-010-04','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P05_REGAFF','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb),
('TSK-MA-010-05','AGT-WORKFLOW-ORCHESTRATOR','PRIMARY_EXECUTOR',1,true,2,'EXPONENTIAL_BACKOFF',false,'P21_MA_DIR','AFTER_EXECUTION','ESCALATE_TO_HUMAN','{}'::jsonb))
AS agent_data(task_code,agent_code,assignment_type,execution_order,requires_human_approval,max_retries,retry_strategy,is_parallel,approval_persona_code,approval_stage,on_failure,metadata)
INNER JOIN dh_task t ON t.code=agent_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_agent a ON a.code=agent_data.agent_code AND a.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,agent_id,assignment_type) DO UPDATE SET metadata=EXCLUDED.metadata;

INSERT INTO dh_task_persona (tenant_id,task_id,persona_id,responsibility,review_timing,escalation_to_persona_code,metadata)
SELECT sc.tenant_id,t.id,p.id,persona_data.responsibility,persona_data.review_timing,persona_data.escalation_to_persona_code,persona_data.metadata FROM session_config sc
CROSS JOIN (VALUES ('TSK-MA-010-01','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-010-02','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),
('TSK-MA-010-03','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb),('TSK-MA-010-04','P05_REGAFF','APPROVE','AFTER_AGENT_RUNS','P21_MA_DIR','{}'::jsonb),
('TSK-MA-010-05','P21_MA_DIR','APPROVE','AFTER_AGENT_RUNS',NULL,'{}'::jsonb))
AS persona_data(task_code,persona_code,responsibility,review_timing,escalation_to_persona_code,metadata)
INNER JOIN dh_task t ON t.code=persona_data.task_code AND t.tenant_id=sc.tenant_id INNER JOIN dh_persona p ON p.code=persona_data.persona_code AND p.tenant_id=sc.tenant_id
ON CONFLICT (tenant_id,task_id,persona_id,responsibility) DO UPDATE SET metadata=EXCLUDED.metadata;

SELECT 'MA-006 through MA-010 Part 2 Complete' as status,
  (SELECT COUNT(*) FROM dh_task_dependency WHERE task_id IN (SELECT id FROM dh_task WHERE code LIKE 'TSK-MA-%')) as total_dependencies,
  (SELECT COUNT(*) FROM dh_task_agent WHERE task_id IN (SELECT id FROM dh_task WHERE code LIKE 'TSK-MA-%')) as total_agent_assignments;

