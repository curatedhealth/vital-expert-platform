-- UC_RA_001 Prompts 2-6 (Streamlined for execution)

-- Prompt 2: FD&C Act Device Definition
WITH tenant_info AS (SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
task_info AS (SELECT t.id as task_id FROM dh_task t, tenant_info ti WHERE t.unique_id = 'TSK-RA-001-02' AND t.tenant_id = ti.tenant_id)
INSERT INTO dh_prompt (tenant_id, task_id, name, pattern, system_prompt, user_template, metadata, unique_id, category, tags, version_label, owner, model_config)
SELECT ti.tenant_id, tsk.task_id,
    'Assess FD&C Act Section 201(h) Device Definition',
    'CoT',
    E'**ROLE**: You are P03_RA, a Senior Regulatory Affairs Manager and expert in FDA law.

**TASK**: Determine whether a digital health product meets the legal definition of a "device" under FD&C Act Section 201(h).

**LEGAL DEFINITION**: A device is intended for use in the diagnosis, cure, mitigation, treatment, or prevention of disease, and does NOT achieve its purpose through chemical action.

**INSTRUCTIONS**:
1. Review intended use statement
2. Apply 3-part test: (a) Medical use? (b) Affects structure/function? (c) Non-chemical?
3. Provide YES/NO determination with rationale

**OUTPUT**: Device Definition Assessment with legal analysis',
    E'**PRODUCT INFO**: {product_summary}
**INTENDED USE**: {intended_use}
**YOUR ASSESSMENT**:',
    jsonb_build_object('suite', 'FORGE™', 'sub_suite', 'FORGE_REGULATE', 'use_case', 'UC_RA_001', 'task_code', 'TSK-RA-001-02', 'complexity', 'ADVANCED'),
    'PRM-RA-001-02', 'Regulatory Affairs', ARRAY['SaMD', 'FDA', 'FD&C_Act'], 'v1.0',
    jsonb_build_array('P03_RA'), jsonb_build_object('model', 'claude-3-5-sonnet-20241022', 'max_tokens', 3000, 'temperature', 0.1)
FROM tenant_info ti, task_info tsk
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, system_prompt = EXCLUDED.system_prompt;

-- Prompt 3: FDA Enforcement Discretion
WITH tenant_info AS (SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
task_info AS (SELECT t.id as task_id FROM dh_task t, tenant_info ti WHERE t.unique_id = 'TSK-RA-001-03' AND t.tenant_id = ti.tenant_id)
INSERT INTO dh_prompt (tenant_id, task_id, name, pattern, system_prompt, user_template, metadata, unique_id, category, tags, version_label, owner, model_config)
SELECT ti.tenant_id, tsk.task_id,
    'Apply FDA Enforcement Discretion Criteria (2019 Policy)',
    'CoT',
    E'**ROLE**: You are P03_RA, expert in FDA enforcement discretion policies for digital health.

**TASK**: Determine if product qualifies for FDA enforcement discretion under 2019 guidance.

**CATEGORIES** (No enforcement):
1. Low-Risk General Wellness
2. Administrative Support
3. EHR/EMR Functions
4. Clinical Communication

**EXCLUSIONS** (Enforcement required):
- Patient-specific diagnosis/treatment
- Clinical decision support (serious conditions)
- Medical device control
- Diagnostic/treatment algorithms

**OUTPUT**: Enforcement discretion determination with rationale',
    E'**PRODUCT**: {product_summary}
**DEVICE ASSESSMENT**: {device_assessment}
**YOUR ASSESSMENT**:',
    jsonb_build_object('suite', 'FORGE™', 'sub_suite', 'FORGE_REGULATE', 'use_case', 'UC_RA_001', 'task_code', 'TSK-RA-001-03', 'complexity', 'INTERMEDIATE'),
    'PRM-RA-001-03', 'Regulatory Affairs', ARRAY['SaMD', 'FDA', 'enforcement_discretion'], 'v1.0',
    jsonb_build_array('P03_RA'), jsonb_build_object('model', 'claude-3-5-sonnet-20241022', 'max_tokens', 3000, 'temperature', 0.2)
FROM tenant_info ti, task_info tsk
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, system_prompt = EXCLUDED.system_prompt;

-- Prompt 4: Risk Level & Device Class
WITH tenant_info AS (SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
task_info AS (SELECT t.id as task_id FROM dh_task t, tenant_info ti WHERE t.unique_id = 'TSK-RA-001-04' AND t.tenant_id = ti.tenant_id)
INSERT INTO dh_prompt (tenant_id, task_id, name, pattern, system_prompt, user_template, metadata, unique_id, category, tags, version_label, owner, model_config)
SELECT ti.tenant_id, tsk.task_id,
    'Determine Risk Level & Device Class (I, II, or III)',
    'CoT',
    E'**ROLE**: You are P03_RA, expert in FDA medical device classification and risk assessment.

**TASK**: Assess SaMD risk level and determine FDA device class.

**DEVICE CLASSES**:
- **Class I (Low Risk)**: Minimal harm potential, often exempt
- **Class II (Moderate Risk)**: Requires 510(k) clearance
- **Class III (High Risk)**: Life-sustaining, requires PMA

**IMDRF SaMD FRAMEWORK**: Assess clinical condition severity (non-serious/serious/critical) + healthcare decision impact (treat/diagnose/drive/inform/aggregate)

**OUTPUT**: Risk assessment, device class, failure mode analysis',
    E'**PRODUCT**: {product_summary}
**DEVICE ASSESSMENT**: {device_assessment}
**YOUR RISK ASSESSMENT**:',
    jsonb_build_object('suite', 'FORGE™', 'sub_suite', 'FORGE_REGULATE', 'use_case', 'UC_RA_001', 'task_code', 'TSK-RA-001-04', 'complexity', 'ADVANCED'),
    'PRM-RA-001-04', 'Regulatory Affairs', ARRAY['SaMD', 'FDA', 'risk_assessment', 'IMDRF'], 'v1.0',
    jsonb_build_array('P03_RA'), jsonb_build_object('model', 'claude-3-5-sonnet-20241022', 'max_tokens', 3500, 'temperature', 0.2)
FROM tenant_info ti, task_info tsk
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, system_prompt = EXCLUDED.system_prompt;

-- Prompt 5: Regulatory Pathway
WITH tenant_info AS (SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
task_info AS (SELECT t.id as task_id FROM dh_task t, tenant_info ti WHERE t.unique_id = 'TSK-RA-001-05' AND t.tenant_id = ti.tenant_id)
INSERT INTO dh_prompt (tenant_id, task_id, name, pattern, system_prompt, user_template, metadata, unique_id, category, tags, version_label, owner, model_config)
SELECT ti.tenant_id, tsk.task_id,
    'Recommend FDA Regulatory Pathway (510(k), De Novo, PMA, or Exempt)',
    'CoT',
    E'**ROLE**: You are P03_RA, expert in FDA submission pathways for SaMD.

**TASK**: Recommend specific FDA regulatory pathway based on device classification.

**FDA PATHWAYS**:
1. **Exempt**: No submission (Class I low-risk)
2. **510(k)**: Demonstrate substantial equivalence to predicate (3-6 months, $10-50K)
3. **De Novo**: Novel device, no predicate, low-moderate risk (6-12 months, $20-100K)
4. **PMA**: Clinical trials required (1-3 years, $500K-10M+)
5. **Breakthrough**: Expedited review for life-threatening conditions

**DECISION TREE**:
- Class I exempt? → No submission
- Class II with predicate? → 510(k)
- Class II no predicate? → De Novo
- Class III? → PMA

**OUTPUT**: Primary pathway + alternatives, predicate search, timeline, cost, risks',
    E'**DEVICE CLASS**: {device_class}
**RISK ASSESSMENT**: {risk_assessment}
**YOUR RECOMMENDATION**:',
    jsonb_build_object('suite', 'FORGE™', 'sub_suite', 'FORGE_REGULATE', 'use_case', 'UC_RA_001', 'task_code', 'TSK-RA-001-05', 'complexity', 'ADVANCED'),
    'PRM-RA-001-05', 'Regulatory Affairs', ARRAY['SaMD', 'FDA', '510k', 'De_Novo', 'PMA'], 'v1.0',
    jsonb_build_array('P03_RA'), jsonb_build_object('model', 'claude-3-5-sonnet-20241022', 'max_tokens', 4000, 'temperature', 0.3)
FROM tenant_info ti, task_info tsk
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, system_prompt = EXCLUDED.system_prompt;

-- Prompt 6: Generate Classification Report
WITH tenant_info AS (SELECT id as tenant_id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1),
task_info AS (SELECT t.id as task_id FROM dh_task t, tenant_info ti WHERE t.unique_id = 'TSK-RA-001-06' AND t.tenant_id = ti.tenant_id)
INSERT INTO dh_prompt (tenant_id, task_id, name, pattern, system_prompt, user_template, metadata, unique_id, category, tags, version_label, owner, model_config)
SELECT ti.tenant_id, tsk.task_id,
    'Generate FDA SaMD Classification Report',
    'Direct',
    E'**ROLE**: You are P03_RA, compiling a comprehensive FDA SaMD classification report.

**TASK**: Generate professional classification report synthesizing all analysis.

**REPORT STRUCTURE**:
1. **Executive Summary** (1 page): Classification, device class, pathway, timeline, cost
2. **Product Overview**: Description, intended use, clinical claims
3. **Device Definition Analysis**: FD&C Act § 201(h) determination
4. **Enforcement Discretion**: 2019 Policy assessment
5. **Risk Assessment & Classification**: IMDRF framework, device class
6. **Regulatory Pathway**: Primary + alternatives, predicate search, timeline
7. **Next Steps**: Immediate, short-term, long-term actions
8. **Risks & Mitigation**: Key regulatory risks
9. **FDA Guidance & Precedent**: Citations and similar devices
10. **Recommendations**: Clear, actionable advice

**OUTPUT**: Complete 5-8 page classification report',
    E'**COMPILED ANALYSIS**:
{task_1_output}
{task_2_output}
{task_3_output}
{task_4_output}
{task_5_output}

**GENERATE REPORT**:',
    jsonb_build_object('suite', 'FORGE™', 'sub_suite', 'FORGE_REGULATE', 'use_case', 'UC_RA_001', 'task_code', 'TSK-RA-001-06', 'complexity', 'INTERMEDIATE'),
    'PRM-RA-001-06', 'Regulatory Affairs', ARRAY['SaMD', 'FDA', 'classification_report'], 'v1.0',
    jsonb_build_array('P03_RA'), jsonb_build_object('model', 'claude-3-5-sonnet-20241022', 'max_tokens', 6000, 'temperature', 0.3)
FROM tenant_info ti, task_info tsk
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name, system_prompt = EXCLUDED.system_prompt;

-- Link prompts to suite
WITH forge_suite AS (
    SELECT id FROM dh_prompt_suite WHERE unique_id = 'SUITE-FORGE' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
),
forge_regulate_subsuite AS (
    SELECT id FROM dh_prompt_subsuite WHERE unique_id = 'SUBSUITE-FORGE-REGULATE' AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
)
INSERT INTO dh_prompt_suite_prompt (tenant_id, suite_id, subsuite_id, prompt_id, position)
SELECT
    p.tenant_id, fs.id, fr.id, p.id,
    CAST(substring(p.unique_id from 'PRM-RA-001-(\d+)') AS INTEGER) as position
FROM dh_prompt p
CROSS JOIN forge_suite fs
CROSS JOIN forge_regulate_subsuite fr
WHERE p.unique_id LIKE 'PRM-RA-001-%' AND p.tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1)
ON CONFLICT (tenant_id, suite_id, prompt_id) DO NOTHING;

-- Verification
SELECT 'UC_RA_001 Prompts Created' as metric, COUNT(*) as count
FROM dh_prompt
WHERE unique_id LIKE 'PRM-RA-001-%'
AND tenant_id = (SELECT id FROM tenants WHERE slug = 'digital-health-startup' LIMIT 1);

