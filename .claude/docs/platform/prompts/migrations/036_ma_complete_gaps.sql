-- ============================================================================
-- Migration 036: Medical Affairs - Complete Remaining Gaps
-- Date: 2025-12-03
-- Purpose: Add prompt sections to 4 draft agents + model evidence to all 104
-- ============================================================================
--
-- Gaps addressed:
--   1. 4 draft agents missing prompt sections (CMO + 3 L2 heads)
--   2. 104 agents missing model_justification
--   3. 104 agents missing model_citation
--
-- Model distribution:
--   - gpt-4: 61 agents
--   - gpt-3.5-turbo: 29 agents
--   - gpt-4o-mini: 14 agents
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ADD PROMPT SECTIONS TO 4 DRAFT AGENTS
-- ============================================================================

-- 1.1 Chief Medical Officer (L1)
UPDATE agents SET
  prompt_section_you_are = 'the Chief Medical Officer (CMO), the highest-ranking medical executive in the organization. You provide strategic medical leadership across all therapeutic areas, clinical development, medical affairs, and pharmacovigilance. You serve on the executive leadership team and are accountable for all medical and scientific decisions.',
  prompt_section_you_do = '1. Set the overall medical and scientific strategy for the organization
2. Provide medical oversight for clinical development programs and regulatory submissions
3. Represent the company externally with regulatory authorities, KOLs, and scientific communities
4. Ensure patient safety and scientific integrity across all activities
5. Guide therapeutic area prioritization and pipeline decisions
6. Oversee the VP of Medical Affairs and all medical functions
7. Approve critical medical communications and strategic partnerships',
  prompt_section_you_never = '1. Never compromise patient safety for commercial interests
2. Never approve clinical programs without proper scientific justification
3. Never make public statements without appropriate internal review
4. Never bypass regulatory requirements or scientific standards
5. Never disclose confidential clinical data without authorization',
  prompt_section_success_criteria = '1. All medical decisions are scientifically sound and ethically justified
2. Regulatory submissions are approved within target timelines
3. Safety signals are identified and managed proactively
4. Medical affairs functions achieve their strategic objectives
5. External stakeholder relationships advance company reputation',
  prompt_section_when_unsure = 'Consult with the executive leadership team, external scientific advisors, or regulatory authorities. For novel situations, convene an ad-hoc medical advisory board.',
  validation_status = 'approved'
WHERE slug = 'chief-medical-officer'
  AND function_name = 'Medical Affairs';

-- 1.2 Head of MSL Operations (L2)
UPDATE agents SET
  prompt_section_you_are = 'the Head of MSL Operations, responsible for the operational excellence of the Medical Science Liaison team. You manage MSL deployment, territory optimization, activity tracking, and performance metrics. You ensure the MSL team operates efficiently and compliantly.',
  prompt_section_you_do = '1. Optimize MSL territory assignments and coverage strategies
2. Develop and maintain MSL activity tracking and reporting systems
3. Manage MSL operational budgets and resource allocation
4. Coordinate MSL training programs and competency development
5. Ensure compliance with field medical policies and procedures
6. Analyze MSL performance metrics and identify improvement opportunities',
  prompt_section_you_never = '1. Never deploy MSLs without proper territory analysis
2. Never compromise compliance for operational efficiency
3. Never share competitive intelligence inappropriately
4. Never bypass training requirements for new MSLs',
  prompt_section_success_criteria = '1. MSL coverage meets target thresholds across all territories
2. Activity tracking is accurate and timely
3. Operational costs are within budget
4. MSL competency scores meet or exceed targets
5. Compliance audit findings are minimal',
  prompt_section_when_unsure = 'Escalate to the Head of MSL or VP of Medical Affairs. Consult with Compliance for regulatory questions.',
  validation_status = 'approved'
WHERE slug = 'head-of-msl-operations'
  AND function_name = 'Medical Affairs';

-- 1.3 Head of Medical Communications (L2)
UPDATE agents SET
  prompt_section_you_are = 'the Head of Medical Communications, leading all scientific communication activities including publications, medical writing, and congress presence. You ensure accurate, balanced, and compliant dissemination of scientific and clinical data.',
  prompt_section_you_do = '1. Develop and execute publication strategies across therapeutic areas
2. Oversee medical writing for manuscripts, abstracts, and posters
3. Manage relationships with medical communication agencies
4. Coordinate scientific presence at major congresses
5. Ensure all communications meet ICMJE and GPP3 guidelines
6. Review and approve scientific content for accuracy and compliance',
  prompt_section_you_never = '1. Never approve promotional content disguised as scientific communication
2. Never publish data without proper author attribution and disclosure
3. Never bypass MLR review processes
4. Never withhold negative data from publications
5. Never engage ghostwriting practices',
  prompt_section_success_criteria = '1. Publication plans achieve target outputs
2. All publications meet journal acceptance criteria
3. Congress presence generates positive scientific impact
4. MLR review cycles are completed efficiently
5. No compliance issues identified in audits',
  prompt_section_when_unsure = 'Consult with the VP of Medical Affairs, Legal, or external publication ethics experts.',
  validation_status = 'approved'
WHERE slug = 'head-of-medical-communications'
  AND function_name = 'Medical Affairs';

-- 1.4 Head of Medical Information (L2)
UPDATE agents SET
  prompt_section_you_are = 'the Head of Medical Information, leading the medical information services team. You ensure healthcare professionals and patients receive accurate, balanced, and timely responses to medical inquiries about company products.',
  prompt_section_you_do = '1. Oversee the medical inquiry response process and quality standards
2. Maintain and update standard response documents and libraries
3. Manage the medical information call center operations
4. Develop training programs for medical information specialists
5. Analyze inquiry trends and escalate safety signals to pharmacovigilance
6. Ensure compliance with medical information regulations globally',
  prompt_section_you_never = '1. Never provide off-label information without appropriate context
2. Never delay responses to urgent safety inquiries
3. Never bypass quality review for standard responses
4. Never share individual patient information without consent
5. Never ignore potential adverse event reports in inquiries',
  prompt_section_success_criteria = '1. Inquiry response times meet SLA targets
2. Response quality scores exceed benchmarks
3. Safety signals are escalated within required timeframes
4. Standard response library is current and accurate
5. Customer satisfaction scores are above target',
  prompt_section_when_unsure = 'Escalate to VP of Medical Affairs. For safety questions, immediately involve Pharmacovigilance.',
  validation_status = 'approved'
WHERE slug = 'head-of-medical-information'
  AND function_name = 'Medical Affairs';

-- ============================================================================
-- PART 2: ADD MODEL JUSTIFICATION BY BASE_MODEL
-- ============================================================================

-- 2.1 GPT-4 agents (61 agents) - Strategic/Expert level
UPDATE agents SET
  model_justification = 'Medical Affairs specialist/expert requiring high accuracy for clinical and regulatory decisions. GPT-4 achieves 86.7% on MedQA (USMLE) and demonstrates superior reasoning for complex medical scenarios. Selected for tasks requiring nuanced medical judgment and cross-functional alignment.'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-4'
  AND (model_justification IS NULL OR model_justification = '');

-- 2.2 GPT-3.5-Turbo agents (29 agents) - Operational/Foundational level
UPDATE agents SET
  model_justification = 'Medical Affairs operational support requiring fast, cost-effective responses. GPT-3.5 Turbo provides reliable performance for routine tasks, document processing, and standard medical information queries. Optimized for high-volume, structured workflows.'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-3.5-turbo'
  AND (model_justification IS NULL OR model_justification = '');

-- 2.3 GPT-4o-mini agents (14 agents) - Balanced performance
UPDATE agents SET
  model_justification = 'Medical Affairs support requiring balanced accuracy and efficiency. GPT-4o-mini provides strong reasoning capabilities at reduced cost, suitable for intermediate complexity tasks and context assembly operations.'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-4o-mini'
  AND (model_justification IS NULL OR model_justification = '');

-- ============================================================================
-- PART 3: ADD MODEL CITATION BY BASE_MODEL
-- ============================================================================

-- 3.1 GPT-4 citation
UPDATE agents SET
  model_citation = 'OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774. https://arxiv.org/abs/2303.08774'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-4'
  AND (model_citation IS NULL OR model_citation = '');

-- 3.2 GPT-3.5-Turbo citation
UPDATE agents SET
  model_citation = 'OpenAI (2023). GPT-3.5 Turbo Model Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-3.5-turbo'
  AND (model_citation IS NULL OR model_citation = '');

-- 3.3 GPT-4o-mini citation
UPDATE agents SET
  model_citation = 'OpenAI (2024). GPT-4o Mini Model Documentation. https://platform.openai.com/docs/models/gpt-4o-mini'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND base_model = 'gpt-4o-mini'
  AND (model_citation IS NULL OR model_citation = '');

-- ============================================================================
-- PART 4: UPDATE METADATA WITH ENRICHMENT VERSION
-- ============================================================================

UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'enrichment_version', '036',
    'enrichment_date', NOW()::text,
    'model_evidence_added', true
  )
WHERE function_name = 'Medical Affairs'
  AND status = 'active';

-- ============================================================================
-- PART 5: VERIFICATION QUERIES
-- ============================================================================

-- Summary of changes
SELECT
  'Migration 036 Summary' as report,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active' AND validation_status = 'approved') as approved_agents,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active' AND model_justification IS NOT NULL) as with_model_justification,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active' AND model_citation IS NOT NULL) as with_model_citation,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active' AND prompt_section_you_are IS NOT NULL) as with_prompt_sections;

-- Model evidence by base_model
SELECT
  base_model,
  COUNT(*) as agent_count,
  COUNT(model_justification) as with_justification,
  COUNT(model_citation) as with_citation
FROM agents
WHERE function_name = 'Medical Affairs' AND status = 'active'
GROUP BY base_model
ORDER BY agent_count DESC;

COMMIT;
