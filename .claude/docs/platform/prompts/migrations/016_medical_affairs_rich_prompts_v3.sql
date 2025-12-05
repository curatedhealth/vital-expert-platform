-- ============================================================================
-- Migration: Medical Affairs Rich Prompts Library (V3 - ALL REQUIRED FIELDS)
-- Date: 2025-12-02
-- Purpose: Create detailed prompts linked to agent_prompt_starters
-- Fixes:
--   1. Use actual tenant UUID instead of text 'vital-system'
--   2. Include required prompt_code field
--   3. Include required slug field (UNIQUE)
--   4. Include required version field
-- ============================================================================

-- First, add prompt_id column to agent_prompt_starters if not exists
ALTER TABLE agent_prompt_starters
ADD COLUMN IF NOT EXISTS prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_prompt_id
ON agent_prompt_starters(prompt_id);

-- ============================================================================
-- PART 1: L2 EXPERT RICH PROMPTS
-- ============================================================================

-- 1.1 Biomarker Validation Expert - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-BVE-001',
  'Biomarker Validation Expert - Starter #1',
  'ma-bve-001-biomarker-validation-strategy',
  E'Develop a comprehensive biomarker validation strategy for our companion diagnostic program.\n\n## Context Required\n- Therapeutic area and indication\n- Biomarker type (predictive, prognostic, pharmacodynamic)\n- Intended use in clinical development\n- Current assay platform and performance data\n\n## Deliverables\n1. **Analytical Validation Plan**\n   - Accuracy, precision, sensitivity, specificity requirements\n   - Reference standard and calibration approach\n   - Sample stability and storage conditions\n   - Cross-platform bridging if applicable\n\n2. **Clinical Validation Strategy**\n   - Patient selection algorithm\n   - Clinical utility endpoints\n   - Prospective vs retrospective validation approach\n   - Sample size and statistical considerations\n\n3. **Regulatory Pathway**\n   - FDA/EMA guidance alignment\n   - Companion diagnostic vs complementary diagnostic\n   - Pre-submission meeting strategy\n   - IVD regulatory requirements\n\n4. **Timeline and Milestones**\n   - Parallel development with drug program\n   - Critical path activities\n   - Risk mitigation strategies',
  'user', '1.0.0', 'clinical', 'expert',
  ARRAY['biomarker', 'validation', 'companion-diagnostic', 'FDA', 'clinical-development'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-BVE-002',
  'Biomarker Validation Expert - Starter #2',
  'ma-bve-002-analytical-performance-evaluation',
  E'Evaluate the analytical performance characteristics required for our predictive biomarker assay.\n\n## Context Required\n- Biomarker and sample matrix\n- Clinical decision threshold (cutoff)\n- Intended patient population\n- Current assay performance data\n\n## Analysis Framework\n1. **Sensitivity & Specificity**\n   - Clinical sensitivity at decision threshold\n   - Analytical sensitivity (limit of detection)\n   - Specificity for intended patient population\n   - Receiver Operating Characteristic (ROC) analysis\n\n2. **Precision Assessment**\n   - Within-run precision (repeatability)\n   - Between-run precision (intermediate precision)\n   - Between-site precision if multi-site\n   - Total precision at clinical decision point\n\n3. **Accuracy Evaluation**\n   - Reference method comparison\n   - Linearity and analytical measurement range\n   - Recovery and dilution studies\n   - Interference testing\n\n4. **Sample Considerations**\n   - Pre-analytical variables\n   - Sample stability requirements\n   - Matrix effects\n   - Collection and handling specifications',
  'user', '1.0.0', 'clinical', 'advanced',
  ARRAY['biomarker', 'analytical-validation', 'assay-performance', 'precision', 'sensitivity'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- 1.2 Medical Affairs Strategist - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MAS-001',
  'Medical Affairs Strategist - Starter #1',
  'ma-mas-001-integrated-medical-affairs-strategy',
  E'Develop a comprehensive integrated medical affairs strategy for our upcoming oncology launch.\n\n## Context Required\n- Product/indication details\n- Phase 3 data availability timeline\n- Competitive landscape\n- Target HCP segments\n- Commercial launch timeline\n\n## Strategy Components\n\n### 1. Pre-Launch Medical Strategy (12-18 months before launch)\n- **KOL Development**\n  - Tier 1 KOL identification and mapping\n  - Advisory board program design\n  - Investigator-initiated study strategy\n  - Speaker development program\n\n- **Evidence Generation**\n  - Remaining clinical questions\n  - Real-world evidence gaps\n  - Payer evidence requirements\n  - Registry/observational study needs\n\n- **Publication Planning**\n  - Pivotal data manuscripts\n  - Congress presentation strategy\n  - Review articles and educational content\n  - Digital content development\n\n### 2. Launch Medical Strategy\n- MSL deployment and territory optimization\n- Medical education program rollout\n- Medical information service readiness\n- Formulary support materials\n\n### 3. Post-Launch Medical Strategy\n- Long-term evidence generation\n- Label expansion support\n- Medical affairs metrics and KPIs\n- Continuous KOL engagement',
  'user', '1.0.0', 'strategy', 'expert',
  ARRAY['medical-strategy', 'launch', 'oncology', 'KOL', 'evidence-generation'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MAS-002',
  'Medical Affairs Strategist - Starter #2',
  'ma-mas-002-value-proposition-framework',
  E'Create a medical affairs value proposition framework demonstrating our contribution to clinical development, commercial success, and patient outcomes.\n\n## Framework Structure\n\n### 1. Value to Clinical Development\n- **Scientific Input**\n  - Protocol design consultation\n  - Endpoint selection guidance\n  - Investigator site recommendations\n  - Competitive intelligence insights\n\n- **Evidence Gaps**\n  - Unmet medical need articulation\n  - Real-world evidence requirements\n  - Health economic data needs\n\n### 2. Value to Commercial Success\n- **Market Shaping**\n  - Disease awareness initiatives\n  - Treatment guideline influence\n  - KOL advocacy development\n\n- **Launch Excellence**\n  - MSL pre-launch activities\n  - Scientific platform development\n  - Payer evidence packages\n\n### 3. Value to Patients\n- **Access Support**\n  - Patient assistance programs\n  - Adherence support initiatives\n  - Patient education materials\n\n- **Outcomes Focus**\n  - Patient-reported outcomes research\n  - Quality of life improvements\n  - Real-world effectiveness data\n\n### 4. Measurement Framework\n- Activity metrics (reach, frequency)\n- Quality metrics (HCP satisfaction, content accuracy)\n- Impact metrics (prescription influence, guideline changes)\n- Efficiency metrics (cost per engagement, ROI)',
  'user', '1.0.0', 'strategy', 'advanced',
  ARRAY['value-proposition', 'medical-affairs', 'ROI', 'KPI', 'metrics'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- 1.3 Medical Education Director - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MED-001',
  'Medical Education Director - Starter #1',
  'ma-med-001-cme-strategy-framework',
  E'Design a comprehensive continuing medical education (CME) strategy for our therapeutic area.\n\n## Context Required\n- Therapeutic area and indications\n- Target HCP audiences (specialties, practice settings)\n- Current knowledge gaps and educational needs\n- Budget and resource constraints\n- Regulatory/compliance requirements\n\n## CME Strategy Framework\n\n### 1. Needs Assessment\n- **Gap Analysis**\n  - Current practice vs evidence-based guidelines\n  - Knowledge, competence, and performance gaps\n  - Barriers to optimal patient care\n  - Learning preferences by audience segment\n\n- **Stakeholder Input**\n  - KOL advisory input\n  - Professional society priorities\n  - Learner feedback from prior programs\n\n### 2. Educational Design\n- **Learning Objectives**\n  - Knowledge-based objectives\n  - Competence-based objectives\n  - Performance-based objectives\n\n- **Content Development**\n  - Core curriculum modules\n  - Case-based learning\n  - Interactive assessments\n  - Faculty development\n\n### 3. Delivery Channels\n- Live programs (symposia, workshops)\n- Enduring materials (online courses, podcasts)\n- Point-of-care education\n- Simulation-based training\n\n### 4. Outcomes Measurement\n- Participation and completion rates\n- Knowledge gain (pre/post assessment)\n- Competence improvement\n- Practice change and patient outcomes',
  'user', '1.0.0', 'education', 'expert',
  ARRAY['CME', 'medical-education', 'curriculum', 'needs-assessment', 'outcomes'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- 1.4 Medical Writer - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MW-001',
  'Medical Writer - Starter #1',
  'ma-mw-001-clinical-study-report-ich-e3',
  E'Draft a clinical study report (CSR) following ICH E3 guidelines for our completed Phase 2 study.\n\n## Document Structure (ICH E3)\n\n### Title Page and Synopsis\n- Study identification and title\n- Sponsor and investigator information\n- Study dates and phase\n- Synopsis (stand-alone summary)\n\n### Table of Contents and Abbreviations\n\n### Ethics\n- IRB/IEC approval documentation\n- Informed consent process\n- Protocol amendments and rationale\n\n### Investigators and Study Administrative Structure\n\n### Introduction\n- Disease background and unmet need\n- Product development rationale\n- Non-clinical and prior clinical data summary\n\n### Study Objectives\n- Primary, secondary, exploratory objectives\n- Hypotheses and endpoints\n\n### Investigational Plan\n- Study design and rationale\n- Selection of study population\n- Treatments and dosing\n- Efficacy and safety evaluations\n- Statistics\n\n### Study Patients\n- Disposition and protocol deviations\n- Demographics and baseline characteristics\n\n### Efficacy Evaluation\n- Analysis populations\n- Primary endpoint analysis\n- Secondary endpoint analyses\n- Subgroup analyses\n\n### Safety Evaluation\n- Adverse events\n- Laboratory evaluations\n- Vital signs and other safety data\n\n### Discussion and Conclusions\n\n### Appendices\n- Protocol and amendments\n- Sample CRF\n- Patient data listings\n- Publications',
  'user', '1.0.0', 'clinical', 'advanced',
  ARRAY['CSR', 'ICH-E3', 'clinical-study-report', 'regulatory-writing', 'Phase-2'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MW-002',
  'Medical Writer - Starter #2',
  'ma-mw-002-investigator-brochure-update',
  E'Write an investigator brochure update incorporating new safety and efficacy data.\n\n## IB Update Process\n\n### 1. Data Collection\n- New clinical trial data since last update\n- Post-marketing safety data (if applicable)\n- Non-clinical study updates\n- Manufacturing/formulation changes\n\n### 2. Sections Requiring Update\n\n**Section 5: Effects in Humans**\n- Updated clinical pharmacology data\n- New efficacy findings from completed studies\n- Revised dose recommendations if applicable\n\n**Section 6: Summary of Data and Guidance for the Investigator**\n- Updated benefit-risk assessment\n- New safety monitoring recommendations\n- Revised contraindications or warnings\n\n**Section 7: References**\n- New publications and data sources\n\n### 3. Safety Data Integration\n- Aggregate safety data analysis\n- New adverse reaction identification\n- Updated incidence rates\n- Serious adverse event summary\n- Deaths and other significant events\n\n### 4. Track Changes Documentation\n- Summary of substantive changes\n- Rationale for each modification\n- Cross-references to source data\n\n### 5. Distribution Requirements\n- IRB/IEC notification\n- Investigator acknowledgment\n- Regulatory authority notification (if required)',
  'user', '1.0.0', 'clinical', 'intermediate',
  ARRAY['investigator-brochure', 'IB-update', 'safety-data', 'clinical-development'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- 1.5 Medical Science Liaison Advisor - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-MSLA-001',
  'Medical Science Liaison Advisor - Starter #1',
  'ma-msla-001-kol-engagement-strategy',
  E'Develop a scientific engagement strategy for a high-priority KOL.\n\n## KOL Profile Analysis\n\n### 1. Background Assessment\n- Academic/clinical position and affiliations\n- Research focus and publication history\n- Clinical trial participation\n- Speaking and advisory experience\n- Society/guideline committee involvement\n- Social media presence and influence\n\n### 2. Engagement History\n- Previous interactions and outcomes\n- Advisory board participation\n- Consulting agreements\n- Speaking engagements\n- Research collaborations\n\n### 3. Scientific Interests Alignment\n- Areas of research overlap\n- Unmet need perspectives\n- Treatment algorithm preferences\n- Evidence gaps of interest\n\n## Engagement Strategy\n\n### 4. Objective Setting\n- Short-term objectives (6 months)\n- Long-term relationship goals (12-24 months)\n- Mutual value creation opportunities\n\n### 5. Touchpoint Planning\n- Congress attendance and meetings\n- Site visits and presentations\n- Advisory board invitations\n- Research collaboration opportunities\n- Digital engagement channels\n\n### 6. Content Customization\n- Tailored scientific presentations\n- Relevant data updates\n- Publication opportunities\n- Educational program involvement\n\n### 7. Success Metrics\n- Engagement frequency and quality\n- Scientific insights captured\n- Advocacy development progress\n- Collaboration outcomes',
  'user', '1.0.0', 'clinical', 'advanced',
  ARRAY['KOL', 'engagement', 'scientific-strategy', 'MSL', 'thought-leader'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- 1.6 Safety Signal Evaluator - Rich Prompts
INSERT INTO prompts (prompt_code, name, slug, content, role_type, version, category, complexity, tags, allowed_tenants)
SELECT
  'MA-SSE-001',
  'Safety Signal Evaluator - Starter #1',
  'ma-sse-001-safety-signal-evaluation',
  E'Evaluate a potential safety signal identified through disproportionality analysis of our post-marketing data.\n\n## Signal Evaluation Framework\n\n### 1. Signal Characterization\n- **Event Description**\n  - MedDRA preferred term and SOC\n  - Clinical presentation and severity\n  - Time to onset distribution\n  - Outcomes (recovered, ongoing, fatal)\n\n- **Statistical Metrics**\n  - Reporting Odds Ratio (ROR)\n  - Proportional Reporting Ratio (PRR)\n  - Information Component (IC)\n  - Empirical Bayes Geometric Mean (EBGM)\n\n### 2. Case Series Review\n- Number of cases identified\n- Demographic characteristics\n- Concomitant medications\n- Medical history and risk factors\n- Dechallenge/rechallenge data\n- Confounding factors\n\n### 3. Clinical Assessment\n- Biological plausibility\n- Dose-response relationship\n- Temporal relationship\n- Alternative explanations\n- Class effect considerations\n\n### 4. Literature Review\n- Published case reports\n- Competitor product experience\n- Mechanism of action considerations\n- Background incidence rates\n\n### 5. Risk Assessment\n- Signal strength evaluation\n- Public health impact\n- Labeled vs unlabeled status\n- Recommendations for action\n\n### 6. Documentation\n- Signal evaluation report\n- Safety Management Team presentation\n- Regulatory notification assessment',
  'user', '1.0.0', 'safety', 'expert',
  ARRAY['safety-signal', 'pharmacovigilance', 'disproportionality', 'risk-assessment', 'post-marketing'],
  ARRAY[t.id]
FROM tenants t WHERE t.slug = 'vital-system' LIMIT 1
ON CONFLICT (prompt_code) DO NOTHING;

-- ============================================================================
-- PART 2: CREATE VERIFICATION VIEW
-- ============================================================================

CREATE OR REPLACE VIEW v_ma_prompt_coverage AS
SELECT
  al.level_number,
  al.name as level_name,
  a.display_name as agent_name,
  COUNT(aps.id) as starter_count,
  COUNT(aps.prompt_id) as linked_to_rich_prompt,
  AVG(LENGTH(aps.text))::int as avg_starter_length
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
LEFT JOIN agent_prompt_starters aps ON aps.agent_id = a.id
WHERE a.function_name = 'Medical Affairs' AND a.status = 'active'
GROUP BY al.level_number, al.name, a.display_name
ORDER BY al.level_number, a.display_name;

-- Grant permissions (ignore if already exists)
DO $$
BEGIN
  GRANT SELECT ON v_ma_prompt_coverage TO anon, authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- PART 3: VERIFICATION QUERY
-- ============================================================================

SELECT
  level_number,
  level_name,
  COUNT(*) as agents,
  SUM(starter_count) as total_starters,
  ROUND(AVG(starter_count), 1) as avg_starters_per_agent,
  ROUND(AVG(avg_starter_length)) as avg_starter_chars
FROM v_ma_prompt_coverage
GROUP BY level_number, level_name
ORDER BY level_number;
