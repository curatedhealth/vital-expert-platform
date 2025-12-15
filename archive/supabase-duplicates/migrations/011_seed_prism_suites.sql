-- ============================================================================
-- PRISM™ Framework - Seed Data for Prompt Suites and Sub-Suites
-- ============================================================================
-- Purpose: Populate prompt_suites and prompt_sub_suites with PRISM framework data
-- Version: 1.0.0
-- Date: 2025-12-02
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED PROMPT SUITES (10 PRISM Suites)
-- ----------------------------------------------------------------------------

INSERT INTO prompt_suites (suite_code, suite_name, suite_full_name, tagline, description, purpose, target_roles, coverage_areas, icon, color, sort_order, is_active)
VALUES
  ('RULES', 'RULES™', 'Regulatory Excellence Suite', 
   'Navigate regulatory landscapes with confidence',
   'Comprehensive regulatory intelligence and compliance guidance for pharmaceutical and digital health products',
   'Enable regulatory professionals to navigate complex global regulatory requirements efficiently',
   ARRAY['Regulatory Affairs', 'CMC', 'Quality Assurance', 'Compliance'],
   ARRAY['FDA', 'EMA', 'PMDA', 'NMPA', 'Health Canada', 'TGA'],
   '🏛️', 'bg-blue-500', 1, TRUE),

  ('TRIALS', 'TRIALS™', 'Clinical Development Suite',
   'Accelerate clinical excellence',
   'End-to-end clinical trial design, operations, and data management support',
   'Support clinical development teams in designing and executing successful clinical trials',
   ARRAY['Clinical Operations', 'Medical Monitor', 'Biostatistics', 'Data Management'],
   ARRAY['Protocol Design', 'Site Selection', 'Patient Recruitment', 'Data Analysis'],
   '🔬', 'bg-violet-500', 2, TRUE),

  ('GUARD', 'GUARD™', 'Safety Framework Suite',
   'Protect patients through vigilance',
   'Pharmacovigilance, safety monitoring, and risk management intelligence',
   'Enable proactive safety surveillance and risk management throughout product lifecycle',
   ARRAY['Pharmacovigilance', 'Drug Safety', 'Medical Safety', 'Risk Management'],
   ARRAY['Signal Detection', 'Aggregate Reports', 'Risk Evaluation', 'Safety Database'],
   '🛡️', 'bg-red-500', 3, TRUE),

  ('VALUE', 'VALUE™', 'Market Access Suite',
   'Demonstrate value, secure access',
   'Health economics, pricing strategy, and payer engagement support',
   'Help market access teams demonstrate product value and secure optimal reimbursement',
   ARRAY['Market Access', 'HEOR', 'Pricing', 'Payer Relations'],
   ARRAY['HTA Submissions', 'Value Dossiers', 'Budget Impact', 'Cost-Effectiveness'],
   '💎', 'bg-emerald-500', 4, TRUE),

  ('BRIDGE', 'BRIDGE™', 'Stakeholder Engagement Suite',
   'Connect science with practice',
   'Medical affairs, MSL activities, and KOL engagement optimization',
   'Empower medical affairs teams to build meaningful scientific relationships',
   ARRAY['Medical Affairs', 'MSL', 'Medical Information', 'Scientific Communications'],
   ARRAY['KOL Engagement', 'Advisory Boards', 'Medical Education', 'Field Medical'],
   '🌉', 'bg-orange-500', 5, TRUE),

  ('PROOF', 'PROOF™', 'Evidence Analytics Suite',
   'Transform data into insights',
   'Real-world evidence generation, systematic reviews, and data analytics',
   'Enable evidence-based decision making through rigorous data analysis',
   ARRAY['RWE', 'Biostatistics', 'Epidemiology', 'Outcomes Research'],
   ARRAY['Database Analysis', 'Systematic Reviews', 'Meta-Analysis', 'PRO Studies'],
   '📊', 'bg-cyan-500', 6, TRUE),

  ('CRAFT', 'CRAFT™', 'Medical Writing Suite',
   'Communicate science effectively',
   'Medical writing, publications strategy, and scientific communications',
   'Support medical writers in creating high-quality scientific documents',
   ARRAY['Medical Writing', 'Publications', 'Regulatory Writing', 'Scientific Communications'],
   ARRAY['CSRs', 'Manuscripts', 'Abstracts', 'Regulatory Documents'],
   '✍️', 'bg-purple-500', 7, TRUE),

  ('SCOUT', 'SCOUT™', 'Competitive Intelligence Suite',
   'Stay ahead of the competition',
   'Market research, competitive analysis, and strategic insights',
   'Provide actionable competitive intelligence for strategic decision-making',
   ARRAY['Competitive Intelligence', 'Market Research', 'Strategic Planning', 'Brand Management'],
   ARRAY['Pipeline Analysis', 'Market Trends', 'Competitor Tracking', 'Launch Planning'],
   '🔍', 'bg-lime-500', 8, TRUE),

  ('PROJECT', 'PROJECT™', 'Project Management Suite',
   'Deliver on time, every time',
   'Project coordination, resource planning, and operational excellence',
   'Enable project managers to deliver complex pharmaceutical projects efficiently',
   ARRAY['Project Management', 'Operations', 'Program Management', 'Resource Planning'],
   ARRAY['Timeline Management', 'Risk Mitigation', 'Resource Allocation', 'Milestone Tracking'],
   '📋', 'bg-indigo-500', 9, TRUE),

  ('FORGE', 'FORGE™', 'Digital Health Suite',
   'Pioneer digital therapeutics',
   'Digital health product development, SaMD regulatory, and AI/ML validation',
   'Support digital health innovators in developing and validating digital therapeutics',
   ARRAY['Digital Health', 'Product Development', 'Software Engineering', 'Clinical Validation'],
   ARRAY['DTx Development', 'SaMD Regulatory', 'AI/ML Validation', 'Digital Biomarkers'],
   '⚡', 'bg-amber-500', 10, TRUE)

ON CONFLICT (suite_code) DO UPDATE SET
  suite_name = EXCLUDED.suite_name,
  suite_full_name = EXCLUDED.suite_full_name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  purpose = EXCLUDED.purpose,
  target_roles = EXCLUDED.target_roles,
  coverage_areas = EXCLUDED.coverage_areas,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 2. SEED PROMPT SUB-SUITES
-- ----------------------------------------------------------------------------

-- RULES™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('RULES-FDA', 'FDA Submissions', 'FDA Regulatory Submissions', 'NDA, BLA, 510(k), and other FDA submission guidance', 'Navigate FDA regulatory pathways', 1),
  ('RULES-EMA', 'EMA Procedures', 'EMA Regulatory Procedures', 'MAA, variations, and EMA-specific regulatory guidance', 'Master EMA regulatory requirements', 2),
  ('RULES-CMC', 'CMC Documentation', 'Chemistry Manufacturing Controls', 'CMC section development and quality documentation', 'Ensure CMC compliance', 3),
  ('RULES-GXP', 'GxP Compliance', 'Good Practice Compliance', 'GMP, GCP, GLP, and GDP compliance guidance', 'Maintain GxP standards', 4)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'RULES'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- TRIALS™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('TRIALS-DESIGN', 'Protocol Design', 'Clinical Protocol Design', 'Study design, endpoints, and protocol development', 'Design optimal clinical trials', 1),
  ('TRIALS-OPS', 'Clinical Operations', 'Clinical Trial Operations', 'Site management, monitoring, and trial execution', 'Execute trials efficiently', 2),
  ('TRIALS-DATA', 'Data Management', 'Clinical Data Management', 'EDC, data cleaning, and database management', 'Ensure data quality', 3),
  ('TRIALS-STATS', 'Biostatistics', 'Statistical Analysis', 'SAP development, analysis, and reporting', 'Deliver robust statistics', 4)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'TRIALS'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- GUARD™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('GUARD-PV', 'Pharmacovigilance', 'Pharmacovigilance Operations', 'Case processing, signal detection, and safety reporting', 'Monitor drug safety', 1),
  ('GUARD-RISK', 'Risk Management', 'Safety Risk Management', 'RMPs, REMS, and risk mitigation strategies', 'Manage safety risks', 2),
  ('GUARD-AGG', 'Aggregate Reports', 'Safety Aggregate Reporting', 'PSUR, PBRER, and periodic safety reports', 'Compile safety summaries', 3)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'GUARD'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- VALUE™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('VALUE-HEOR', 'HEOR Studies', 'Health Economics & Outcomes Research', 'Cost-effectiveness, budget impact, and outcomes studies', 'Generate health economic evidence', 1),
  ('VALUE-HTA', 'HTA Submissions', 'Health Technology Assessment', 'NICE, AMNOG, pCODR submission preparation', 'Navigate HTA processes', 2),
  ('VALUE-PAYER', 'Payer Strategy', 'Payer Engagement Strategy', 'Payer value messaging and contracting', 'Secure optimal access', 3),
  ('VALUE-PRICE', 'Pricing Strategy', 'Global Pricing Strategy', 'Launch pricing and price optimization', 'Optimize pricing', 4)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'VALUE'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- BRIDGE™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('BRIDGE-MSL', 'MSL Excellence', 'Medical Science Liaison', 'MSL training, territory planning, and engagement', 'Empower MSL teams', 1),
  ('BRIDGE-KOL', 'KOL Management', 'Key Opinion Leader Engagement', 'KOL identification, mapping, and relationship building', 'Build KOL relationships', 2),
  ('BRIDGE-ADV', 'Advisory Boards', 'Scientific Advisory Boards', 'Advisory board planning and execution', 'Gather expert insights', 3),
  ('BRIDGE-MI', 'Medical Information', 'Medical Information Services', 'Medical inquiries and standard responses', 'Provide accurate information', 4)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'BRIDGE'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- PROOF™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('PROOF-RWE', 'Real-World Evidence', 'RWE Generation', 'RWD analysis and RWE study design', 'Generate real-world insights', 1),
  ('PROOF-SLR', 'Systematic Reviews', 'Literature Reviews', 'SLRs, meta-analyses, and evidence synthesis', 'Synthesize evidence', 2),
  ('PROOF-EPI', 'Epidemiology', 'Epidemiological Studies', 'Disease burden, natural history, and population studies', 'Understand disease patterns', 3)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'PROOF'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- CRAFT™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('CRAFT-REG', 'Regulatory Writing', 'Regulatory Document Writing', 'CTD modules, briefing documents, and responses', 'Create regulatory documents', 1),
  ('CRAFT-PUB', 'Publications', 'Scientific Publications', 'Manuscripts, abstracts, and congress materials', 'Publish research', 2),
  ('CRAFT-CSR', 'Clinical Reports', 'Clinical Study Reports', 'CSRs and clinical summaries', 'Document clinical findings', 3)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'CRAFT'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- SCOUT™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('SCOUT-CI', 'Competitive Intel', 'Competitive Intelligence', 'Competitor analysis and pipeline tracking', 'Monitor competition', 1),
  ('SCOUT-MKT', 'Market Research', 'Market Analysis', 'Market sizing, segmentation, and forecasting', 'Understand markets', 2),
  ('SCOUT-LAUNCH', 'Launch Planning', 'Product Launch Strategy', 'Launch sequencing and market preparation', 'Plan successful launches', 3)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'SCOUT'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- PROJECT™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('PROJECT-PLAN', 'Project Planning', 'Project Plan Development', 'Timeline development and milestone planning', 'Plan projects effectively', 1),
  ('PROJECT-RISK', 'Risk Management', 'Project Risk Management', 'Risk identification and mitigation', 'Manage project risks', 2),
  ('PROJECT-RES', 'Resource Planning', 'Resource Allocation', 'Team planning and resource optimization', 'Optimize resources', 3)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'PROJECT'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- FORGE™ Sub-Suites
INSERT INTO prompt_sub_suites (suite_id, sub_suite_code, sub_suite_name, sub_suite_full_name, description, purpose, sort_order, is_active)
SELECT 
  ps.id,
  s.code,
  s.name,
  s.full_name,
  s.description,
  s.purpose,
  s.sort_order,
  TRUE
FROM prompt_suites ps
CROSS JOIN (VALUES
  ('FORGE-DTX', 'DTx Development', 'Digital Therapeutics Development', 'DTx product design and clinical validation', 'Develop digital therapeutics', 1),
  ('FORGE-SAMD', 'SaMD Regulatory', 'Software as Medical Device', 'SaMD classification and regulatory strategy', 'Navigate SaMD regulations', 2),
  ('FORGE-AIML', 'AI/ML Validation', 'AI/ML Model Validation', 'Algorithm validation and FDA AI/ML guidance', 'Validate AI/ML systems', 3),
  ('FORGE-DCT', 'Decentralized Trials', 'Decentralized Clinical Trials', 'DCT design and digital endpoint validation', 'Enable decentralized trials', 4)
) AS s(code, name, full_name, description, purpose, sort_order)
WHERE ps.suite_code = 'FORGE'
ON CONFLICT (suite_id, sub_suite_code) DO UPDATE SET
  sub_suite_name = EXCLUDED.sub_suite_name,
  sub_suite_full_name = EXCLUDED.sub_suite_full_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 3. UPDATE PROMPT COUNTS
-- ----------------------------------------------------------------------------

-- Update suite prompt counts
UPDATE prompt_suites ps
SET prompt_count = (
  SELECT COUNT(DISTINCT sp.prompt_id)
  FROM suite_prompts sp
  WHERE sp.suite_id = ps.id
);

-- Update sub-suite prompt counts
UPDATE prompt_sub_suites pss
SET prompt_count = (
  SELECT COUNT(DISTINCT sp.prompt_id)
  FROM suite_prompts sp
  WHERE sp.sub_suite_id = pss.id
);

-- ----------------------------------------------------------------------------
-- 4. COMPLETION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  suite_count INTEGER;
  sub_suite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO suite_count FROM prompt_suites WHERE is_active = TRUE;
  SELECT COUNT(*) INTO sub_suite_count FROM prompt_sub_suites WHERE is_active = TRUE;

  RAISE NOTICE '✅ PRISM™ Suite Data Seeded Successfully';
  RAISE NOTICE '   - Prompt Suites: %', suite_count;
  RAISE NOTICE '   - Prompt Sub-Suites: %', sub_suite_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next Step: Link existing prompts to suites using suite_prompts table';
END $$;

