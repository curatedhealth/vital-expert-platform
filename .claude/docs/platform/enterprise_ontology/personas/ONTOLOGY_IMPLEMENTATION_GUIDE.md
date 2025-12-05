# ONTOLOGY IMPLEMENTATION GUIDE

**Practical step-by-step guide for implementing the Medical Affairs knowledge graph**

---

## QUICK START: 5-DAY SPRINT

### Day 1: Schema Setup (2-3 hours)

**Goal:** Deploy all tables and create archetype foundation.

#### Step 1.1: Deploy Gold Standard Schema
```bash
cd /Users/hichamnaim/Downloads/Cursor/VITAL
psql -d your_database -f .claude/docs/platform/personas/seeds/medical_affairs/001_gold_standard_schema.sql
```

**Validates:**
- All reference tables created (ref_skills, ref_competencies, etc.)
- Junction tables created (role_skills, role_competencies, etc.)
- org_roles extended with persona fields
- personas table created

#### Step 1.2: Deploy Ontology Schema
```bash
psql -d your_database -f .claude/docs/platform/personas/seeds/medical_affairs/002_ontology_schema.sql
```

**Validates:**
- ref_archetypes table with 4 archetypes seeded
- ref_service_layers table with 4 layers seeded
- All ontology tables created (ref_tools, ref_pain_points, ref_goals, etc.)
- Junction tables created (persona_tools, persona_pain_points, etc.)
- Views created (v_persona_pain_opportunities, etc.)

#### Step 1.3: Verify Setup
```sql
-- Check archetype count (should be 4)
SELECT COUNT(*) FROM ref_archetypes;

-- Check service layers (should be 4)
SELECT COUNT(*) FROM ref_service_layers;

-- List all ontology tables
SELECT tablename FROM pg_tables
WHERE tablename LIKE 'ref_%' OR tablename LIKE 'persona_%'
ORDER BY tablename;
```

---

### Day 2: Seed Reference Data - Part 1 (3-4 hours)

**Goal:** Populate tools, pain points, and their relationships.

#### Step 2.1: Seed Tools (40 entities)

Create file: `seed_tools.sql`

```sql
-- Medical Affairs Tools
INSERT INTO ref_tools (unique_id, tool_name, tool_category, vendor, is_ai_enabled, automation_capability, pharma_specific, cost_tier, learning_curve_weeks)
VALUES
  -- CRM & Field Medical
  ('TOOL-CRM-001', 'Veeva CRM', 'CRM & Field Medical', 'Veeva Systems', false, 'medium', true, 'enterprise', 4),
  ('TOOL-CRM-002', 'IQVIA OCE', 'CRM & Field Medical', 'IQVIA', false, 'medium', true, 'enterprise', 6),

  -- Medical Information
  ('TOOL-MI-001', 'Veeva Vault MedComms', 'Medical Information', 'Veeva Systems', false, 'low', true, 'enterprise', 2),
  ('TOOL-MI-002', 'iMed Response Platform', 'Medical Information', 'iMed', true, 'medium', true, 'high', 3),

  -- Safety & Pharmacovigilance
  ('TOOL-SAFE-001', 'Argus Safety', 'Pharmacovigilance', 'Oracle', false, 'low', true, 'enterprise', 8),
  ('TOOL-SAFE-002', 'Oracle Empirica Signal', 'Pharmacovigilance', 'Oracle', true, 'medium', true, 'enterprise', 6),

  -- Analytics & BI
  ('TOOL-BI-001', 'Tableau', 'Analytics & BI', 'Salesforce', false, 'low', false, 'high', 3),
  ('TOOL-BI-002', 'Power BI', 'Analytics & BI', 'Microsoft', false, 'low', false, 'medium', 2),

  -- Document Management
  ('TOOL-DOC-001', 'Veeva Vault PromoMats', 'Document Management', 'Veeva Systems', false, 'low', true, 'enterprise', 2),
  ('TOOL-DOC-002', 'SharePoint', 'Document Management', 'Microsoft', false, 'low', false, 'low', 1),

  -- Literature & Evidence
  ('TOOL-LIT-001', 'PubMed', 'Literature & Evidence', 'NCBI', false, 'none', false, 'free', 1),
  ('TOOL-LIT-002', 'Embase', 'Literature & Evidence', 'Elsevier', false, 'low', true, 'high', 2),
  ('TOOL-LIT-003', 'Scopus', 'Literature & Evidence', 'Elsevier', false, 'low', false, 'high', 2),

  -- Communication & Collaboration
  ('TOOL-COMM-001', 'Microsoft Teams', 'Communication', 'Microsoft', false, 'low', false, 'low', 1),
  ('TOOL-COMM-002', 'Slack', 'Communication', 'Salesforce', false, 'low', false, 'medium', 1),
  ('TOOL-COMM-003', 'Zoom', 'Communication', 'Zoom', false, 'none', false, 'low', 1),

  -- AI & Automation
  ('TOOL-AI-001', 'ChatGPT', 'AI & Automation', 'OpenAI', true, 'high', false, 'low', 1),
  ('TOOL-AI-002', 'Claude', 'AI & Automation', 'Anthropic', true, 'high', false, 'low', 1),
  ('TOOL-AI-003', 'Perplexity', 'AI & Automation', 'Perplexity AI', true, 'medium', false, 'low', 1),
  ('TOOL-AI-004', 'VITAL Medical Agent', 'AI & Automation', 'VITAL Platform', true, 'high', true, 'enterprise', 2)
ON CONFLICT (unique_id) DO UPDATE SET
  tool_name = EXCLUDED.tool_name,
  description = EXCLUDED.description;
```

Run: `psql -d your_database -f seed_tools.sql`

Verify: `SELECT COUNT(*) FROM ref_tools; -- Should be 20+`

#### Step 2.2: Seed Pain Points (40 entities)

Create file: `seed_pain_points.sql`

```sql
-- Medical Affairs Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, pain_subcategory, is_systemic, solvability, pharma_specific, estimated_time_cost_hours_per_week)
VALUES
  -- Process Pain Points
  ('PAIN-PROC-001', 'Manual data entry in Veeva CRM', 'Process', 'Data Entry', true, 'moderate', true, 3.0),
  ('PAIN-PROC-002', 'Duplicative reporting across systems', 'Process', 'Reporting', true, 'moderate', false, 2.5),
  ('PAIN-PROC-003', 'Approval workflow delays', 'Process', 'Approval', true, 'difficult', false, 1.5),
  ('PAIN-PROC-004', 'Inconsistent KOL engagement tracking', 'Process', 'Data Entry', true, 'moderate', true, 2.0),
  ('PAIN-PROC-005', 'Manual congress planning', 'Process', 'Workflow', false, 'easy', false, 4.0),

  -- Technology Pain Points
  ('PAIN-TECH-001', 'Data silos between CRM and Safety DB', 'Technology', 'Integration', true, 'difficult', true, 3.0),
  ('PAIN-TECH-002', 'Complex Veeva CRM user interface', 'Technology', 'User Experience', false, 'moderate', true, 1.0),
  ('PAIN-TECH-003', 'No API access for custom integrations', 'Technology', 'Automation Gaps', true, 'difficult', false, 0.0),
  ('PAIN-TECH-004', 'Slow Veeva CRM performance', 'Technology', 'User Experience', true, 'difficult', true, 1.5),

  -- Communication Pain Points
  ('PAIN-COMM-001', 'Email overload from internal requests', 'Communication', 'Internal', true, 'moderate', false, 5.0),
  ('PAIN-COMM-002', 'Delayed HCP follow-up due to approval', 'Communication', 'External', false, 'moderate', true, 1.0),
  ('PAIN-COMM-003', 'Lack of cross-territory collaboration', 'Communication', 'Internal', true, 'moderate', false, 0.0),
  ('PAIN-COMM-004', 'Commercial/Medical firewall confusion', 'Communication', 'Cross-functional', false, 'difficult', true, 0.5),

  -- Compliance Pain Points
  ('PAIN-COMP-001', 'Excessive GxP training burden', 'Compliance', 'GxP', true, 'structural', true, 2.0),
  ('PAIN-COMP-002', 'Uncertainty about promotional vs medical', 'Compliance', 'Documentation', false, 'moderate', true, 0.0),
  ('PAIN-COMP-003', 'Adverse event reporting complexity', 'Compliance', 'GxP', true, 'difficult', true, 1.5),
  ('PAIN-COMP-004', 'Sunshine Act reporting burden', 'Compliance', 'Documentation', true, 'easy', true, 1.0),
  ('PAIN-COMP-005', 'Uncertainty about off-label discussions', 'Compliance', 'GxP', false, 'structural', true, 0.0),
  ('PAIN-COMP-006', 'Audit anxiety and documentation burden', 'Compliance', 'Audit Trail', true, 'difficult', true, 2.0),

  -- Resource Pain Points
  ('PAIN-RES-001', 'Insufficient time for strategic work', 'Resource', 'Time', true, 'structural', false, 0.0),
  ('PAIN-RES-002', 'Limited budget for congress attendance', 'Resource', 'Budget', false, 'structural', false, 0.0),
  ('PAIN-RES-003', 'Limited access to KOLs', 'Resource', 'Expertise', false, 'difficult', true, 0.0),
  ('PAIN-RES-004', 'High travel fatigue', 'Resource', 'Time', false, 'moderate', false, 0.0),

  -- Knowledge Pain Points
  ('PAIN-KNOW-001', 'Lack of onboarding for new MSLs', 'Knowledge', 'Training', true, 'moderate', true, 0.0),
  ('PAIN-KNOW-002', 'Knowledge silos across territories', 'Knowledge', 'Access to Info', true, 'moderate', false, 1.0),
  ('PAIN-KNOW-003', 'Outdated therapeutic area training', 'Knowledge', 'Training', false, 'moderate', true, 0.0),
  ('PAIN-KNOW-004', 'No centralized response letter library', 'Knowledge', 'Access to Info', true, 'easy', true, 2.0)
ON CONFLICT (unique_id) DO UPDATE SET
  pain_point_name = EXCLUDED.pain_point_name,
  description = EXCLUDED.description;
```

Run: `psql -d your_database -f seed_pain_points.sql`

Verify: `SELECT COUNT(*) FROM ref_pain_points; -- Should be 25+`

---

### Day 3: Seed Reference Data - Part 2 (3-4 hours)

**Goal:** Populate goals, motivations, activities.

#### Step 3.1: Seed Goals (30 entities)

Create file: `seed_goals.sql`

```sql
INSERT INTO ref_goals (unique_id, goal_name, goal_category, goal_type, measurability, typical_timeframe, typical_metric)
VALUES
  -- Efficiency Goals
  ('GOAL-EFF-001', 'Reduce administrative time by 30%', 'Efficiency', 'outcome', 'quantitative', 'Quarterly', 'Hours per week on admin tasks'),
  ('GOAL-EFF-002', 'Automate repetitive reporting tasks', 'Efficiency', 'capability', 'qualitative', 'Annual', 'Number of automated reports'),
  ('GOAL-EFF-003', 'Streamline KOL engagement planning', 'Efficiency', 'process', 'mixed', 'Quarterly', 'Hours to create engagement plan'),

  -- Quality Goals
  ('GOAL-QUAL-001', 'Improve field insight quality scores', 'Quality', 'outcome', 'quantitative', 'Quarterly', 'Average quality score (1-5)'),
  ('GOAL-QUAL-002', 'Enhance HCP satisfaction with interactions', 'Quality', 'relationship', 'mixed', 'Annual', 'HCP satisfaction survey score'),
  ('GOAL-QUAL-003', 'Increase publication acceptance rate', 'Quality', 'outcome', 'quantitative', 'Annual', 'Percentage of publications accepted'),

  -- Growth Goals
  ('GOAL-GROW-001', 'Advance to MSL Manager role', 'Growth', 'outcome', 'qualitative', 'Annual', 'Role transition achieved'),
  ('GOAL-GROW-002', 'Master new therapeutic area', 'Growth', 'capability', 'mixed', 'Annual', 'TA proficiency score'),
  ('GOAL-GROW-003', 'Develop leadership skills', 'Growth', 'capability', 'mixed', 'Annual', 'Leadership assessment score'),
  ('GOAL-GROW-004', 'Obtain MAPS MSL certification', 'Growth', 'outcome', 'quantitative', 'Annual', 'Certification achieved'),

  -- Compliance Goals
  ('GOAL-COMP-001', 'Achieve 100% AE reporting compliance', 'Compliance', 'outcome', 'quantitative', 'Monthly', 'Percentage of AEs reported on time'),
  ('GOAL-COMP-002', 'Zero audit findings', 'Compliance', 'outcome', 'quantitative', 'Annual', 'Number of audit findings'),
  ('GOAL-COMP-003', 'Complete all GxP training on time', 'Compliance', 'process', 'quantitative', 'Quarterly', 'Percentage of training completed'),

  -- Innovation Goals
  ('GOAL-INNOV-001', 'Pilot AI tools for literature review', 'Innovation', 'capability', 'mixed', 'Quarterly', 'AI tools tested and adopted'),
  ('GOAL-INNOV-002', 'Implement new KOL engagement model', 'Innovation', 'process', 'qualitative', 'Annual', 'New model implemented'),

  -- Relationship Goals
  ('GOAL-REL-001', 'Build trusted KOL relationships', 'Relationship', 'relationship', 'mixed', 'Ongoing', 'KOL relationship depth score'),
  ('GOAL-REL-002', 'Improve cross-functional collaboration', 'Relationship', 'relationship', 'mixed', 'Quarterly', 'Cross-functional satisfaction score'),
  ('GOAL-REL-003', 'Strengthen regional team cohesion', 'Relationship', 'relationship', 'mixed', 'Annual', 'Team engagement score')
ON CONFLICT (unique_id) DO UPDATE SET
  goal_name = EXCLUDED.goal_name;
```

#### Step 3.2: Seed Motivations (25 entities)

Create file: `seed_motivations.sql`

```sql
INSERT INTO ref_motivations (unique_id, motivation_name, motivation_category, motivation_type, psychological_driver, typical_behaviors)
VALUES
  -- Intrinsic Motivations
  ('MOT-INTR-001', 'Intellectual curiosity about science', 'Intrinsic', 'mastery', 'Self-actualization', ARRAY['Reads latest publications', 'Attends scientific conferences', 'Asks probing questions']),
  ('MOT-INTR-002', 'Patient impact and outcomes', 'Intrinsic', 'purpose', 'Purpose', ARRAY['Discusses patient stories', 'Focuses on real-world evidence', 'Volunteers for patient advocacy']),
  ('MOT-INTR-003', 'Scientific excellence and rigor', 'Intrinsic', 'mastery', 'Self-actualization', ARRAY['Critiques methodology', 'Demands data quality', 'Reviews evidence thoroughly']),
  ('MOT-INTR-004', 'Autonomy and flexibility', 'Intrinsic', 'autonomy', 'Autonomy', ARRAY['Prefers remote work', 'Self-directed learning', 'Resists micromanagement']),

  -- Extrinsic Motivations
  ('MOT-EXTR-001', 'Competitive compensation', 'Extrinsic', 'recognition', 'Security/Status', ARRAY['Negotiates salary', 'Compares to market', 'Seeks bonuses']),
  ('MOT-EXTR-002', 'Career advancement', 'Extrinsic', 'recognition', 'Achievement', ARRAY['Applies for promotions', 'Seeks high-visibility projects', 'Networks with leadership']),
  ('MOT-EXTR-003', 'Industry reputation', 'Extrinsic', 'recognition', 'Status', ARRAY['Speaks at conferences', 'Publishes frequently', 'Active on LinkedIn']),

  -- Social Motivations
  ('MOT-SOC-001', 'KOL relationships and trust', 'Social', 'belonging', 'Belonging', ARRAY['Regular KOL outreach', 'Values peer feedback', 'Long-term relationship building']),
  ('MOT-SOC-002', 'Team collaboration', 'Social', 'belonging', 'Belonging', ARRAY['Volunteers for team projects', 'Shares knowledge freely', 'Seeks peer input']),
  ('MOT-SOC-003', 'Peer respect from medical community', 'Social', 'recognition', 'Status', ARRAY['Cites colleagues work', 'Seeks endorsements', 'Collaborates on publications']),

  -- Achievement Motivations
  ('MOT-ACH-001', 'Thought leadership in TA', 'Achievement', 'mastery', 'Achievement', ARRAY['Develops expertise', 'Presents at congresses', 'Publishes original research']),
  ('MOT-ACH-002', 'Publication authorship', 'Achievement', 'mastery', 'Achievement', ARRAY['Writes manuscripts', 'Co-authors with KOLs', 'Tracks citations']),

  -- Security Motivations
  ('MOT-SEC-001', 'Job security and stability', 'Security', 'security', 'Security', ARRAY['Avoids risk', 'Follows procedures', 'Values tenure']),
  ('MOT-SEC-002', 'Compliance and audit readiness', 'Security', 'security', 'Security', ARRAY['Documents meticulously', 'Completes training early', 'Avoids gray areas']),
  ('MOT-SEC-003', 'Risk mitigation', 'Security', 'security', 'Security', ARRAY['Escalates concerns', 'Seeks legal review', 'Conservative decision-making'])
ON CONFLICT (unique_id) DO UPDATE SET
  motivation_name = EXCLUDED.motivation_name;
```

#### Step 3.3: Seed Activities (40 entities)

Create file: `seed_activities.sql`

```sql
INSERT INTO ref_activities (unique_id, activity_name, activity_category, typical_duration_minutes, frequency, automation_potential, collaboration_level, cognitive_load, value_add_type)
VALUES
  -- Administrative Activities
  ('ACT-ADMIN-001', 'Enter HCP interactions in Veeva CRM', 'Administrative', 20, 'Daily', 'high', 'solo', 'low', 'compliance'),
  ('ACT-ADMIN-002', 'Complete expense reports', 'Administrative', 45, 'Weekly', 'high', 'solo', 'low', 'overhead'),
  ('ACT-ADMIN-003', 'Complete GxP training modules', 'Administrative', 90, 'Quarterly', 'low', 'solo', 'medium', 'compliance'),
  ('ACT-ADMIN-004', 'Prepare field insights', 'Administrative', 45, 'Weekly', 'high', 'solo', 'medium', 'enabling'),

  -- Clinical Activities
  ('ACT-CLIN-001', 'Review clinical trial data', 'Clinical', 150, 'Weekly', 'medium', 'solo', 'high', 'direct'),
  ('ACT-CLIN-002', 'Conduct literature review', 'Clinical', 75, 'Daily', 'high', 'solo', 'high', 'direct'),
  ('ACT-CLIN-003', 'Interpret efficacy/safety data', 'Clinical', 105, 'Weekly', 'medium', 'pair', 'high', 'direct'),
  ('ACT-CLIN-004', 'Report adverse events', 'Clinical', 45, 'As-needed', 'low', 'solo', 'high', 'compliance'),

  -- Strategic Activities
  ('ACT-STRAT-001', 'Develop KOL engagement plan', 'Strategic', 150, 'Quarterly', 'medium', 'team', 'high', 'enabling'),
  ('ACT-STRAT-002', 'Territory planning and prioritization', 'Strategic', 210, 'Quarterly', 'medium', 'pair', 'high', 'enabling'),
  ('ACT-STRAT-003', 'Publication planning', 'Strategic', 180, 'Quarterly', 'low', 'cross-functional', 'high', 'direct'),

  -- Communication Activities
  ('ACT-COMM-001', 'Scientific exchange with HCPs', 'Communication', 75, 'Daily', 'low', 'pair', 'high', 'direct'),
  ('ACT-COMM-002', 'Internal team meetings', 'Communication', 60, 'Weekly', 'low', 'team', 'medium', 'enabling'),
  ('ACT-COMM-003', 'Email correspondence', 'Communication', 105, 'Daily', 'medium', 'solo', 'medium', 'enabling'),
  ('ACT-COMM-004', 'Prepare scientific presentations', 'Communication', 210, 'Monthly', 'medium', 'solo', 'high', 'direct'),

  -- Travel Activities
  ('ACT-TRAV-001', 'Territory field visits', 'Travel', 480, 'Weekly', 'none', 'solo', 'medium', 'direct'),
  ('ACT-TRAV-002', 'Congress attendance', 'Travel', 480, 'Quarterly', 'none', 'team', 'high', 'direct'),

  -- Development Activities
  ('ACT-DEV-001', 'Therapeutic area self-study', 'Development', 75, 'Weekly', 'low', 'solo', 'high', 'enabling'),
  ('ACT-DEV-002', 'Attend internal training', 'Development', 180, 'Monthly', 'low', 'team', 'medium', 'enabling')
ON CONFLICT (unique_id) DO UPDATE SET
  activity_name = EXCLUDED.activity_name;
```

Run all Day 3 files:
```bash
psql -d your_database -f seed_goals.sql
psql -d your_database -f seed_motivations.sql
psql -d your_database -f seed_activities.sql
```

---

### Day 4: Seed JTBDs, Outcomes, Opportunities (3-4 hours)

**Goal:** Complete reference data seeding.

#### Step 4.1: Seed JTBDs (30 entities)

Create file: `seed_jtbds.sql`

```sql
INSERT INTO ref_jtbds (unique_id, jtbd_statement, job_category, job_type, situation_context, desired_motivation, desired_outcome, success_criteria, failure_modes, odi_importance_baseline, odi_satisfaction_baseline)
VALUES
  ('JTBD-FUNC-001',
   'When I return from a KOL meeting, I want to quickly document the interaction in Veeva CRM, so I can meet compliance requirements without losing field time',
   'Functional', 'core',
   'Post-KOL meeting',
   'Quickly document interaction',
   'Meet compliance without field time loss',
   ARRAY['Documented within 15 minutes', 'All required fields completed', 'No errors'],
   ARRAY['Forgotten details', 'Veeva system slow', 'Missing required data'],
   9.0, 4.0),

  ('JTBD-FUNC-002',
   'When I receive a medical inquiry, I want to provide an accurate, evidence-based response within 24 hours, so I can maintain HCP trust and meet regulatory timelines',
   'Functional', 'core',
   'Medical inquiry received',
   'Provide accurate response in 24h',
   'Maintain HCP trust and regulatory compliance',
   ARRAY['Response within 24 hours', 'Medically accurate', 'Properly referenced'],
   ARRAY['Response delayed', 'Inaccurate information', 'Missing references'],
   9.5, 6.0),

  ('JTBD-EMOT-001',
   'When I interact with a renowned KOL, I want to feel confident in my scientific knowledge, so I can establish credibility and build a trusted relationship',
   'Emotional', 'emotional',
   'Meeting with renowned KOL',
   'Feel scientifically confident',
   'Establish credibility and trust',
   ARRAY['KOL respects my expertise', 'I answer questions confidently', 'Relationship deepens'],
   ARRAY['KOL doubts my knowledge', 'I cannot answer questions', 'Relationship stagnates'],
   9.0, 6.0)
-- Add 27 more JTBDs...
ON CONFLICT (unique_id) DO UPDATE SET
  jtbd_statement = EXCLUDED.jtbd_statement;
```

#### Step 4.2: Seed Outcomes (30 entities)

Create file: `seed_outcomes.sql`

```sql
INSERT INTO ref_outcomes (unique_id, outcome_statement, outcome_category, outcome_type, measurability, direction, typical_metric, target_value)
VALUES
  ('OUT-SPEED-001', 'Minimize time to document HCP interactions', 'Speed', 'desired', 'quantitative', 'minimize', 'Minutes per interaction', '<10 minutes'),
  ('OUT-SPEED-002', 'Minimize medical inquiry response time', 'Speed', 'desired', 'quantitative', 'minimize', 'Hours to response', '<24 hours'),
  ('OUT-QUAL-001', 'Maximize HCP satisfaction with interactions', 'Quality', 'desired', 'mixed', 'maximize', 'Score (1-5)', '>4.5/5.0'),
  ('OUT-QUAL-002', 'Maximize field insight actionability', 'Quality', 'desired', 'mixed', 'maximize', '% insights actioned', '>60%'),
  ('OUT-RISK-001', 'Minimize compliance violations', 'Risk', 'undesired', 'quantitative', 'minimize', '# violations per year', '0'),
  ('OUT-COMP-001', 'Maximize GxP training completion rate', 'Compliance', 'desired', 'quantitative', 'maximize', '% completion', '100%')
-- Add 24 more outcomes...
ON CONFLICT (unique_id) DO UPDATE SET
  outcome_statement = EXCLUDED.outcome_statement;
```

#### Step 4.3: Seed Opportunities (25 entities)

Create file: `seed_opportunities.sql`

```sql
INSERT INTO ref_opportunities (unique_id, opportunity_name, opportunity_type, description, value_proposition, implementation_complexity, expected_impact, time_to_value, required_capabilities, estimated_cost_range)
VALUES
  ('OPP-AUTO-001', 'AI-powered Veeva CRM auto-documentation', 'Automation',
   'Use AI to capture meeting notes via voice/email and auto-populate Veeva CRM',
   'Reduce documentation time by 70%',
   'medium', 'high', '3-6 months',
   ARRAY['AI integration', 'Veeva API access', 'Voice recognition'],
   '$50K-$150K'),

  ('OPP-INTEG-001', 'CRM-Safety database integration', 'Integration',
   'Bi-directional sync between Veeva CRM and safety database to eliminate manual re-entry',
   'Eliminate duplicate AE entry, reduce errors by 80%',
   'high', 'high', '6-12 months',
   ARRAY['System integration expertise', 'GxP validation', 'API access'],
   '$100K-$300K'),

  ('OPP-AUTO-002', 'Automated literature synthesis', 'Automation',
   'AI-powered tool to summarize 50+ papers in minutes with key findings',
   'Reduce literature review time by 60%',
   'low', 'high', '1-3 months',
   ARRAY['AI API access', 'PubMed integration'],
   '$10K-$30K')
-- Add 22 more opportunities...
ON CONFLICT (unique_id) DO UPDATE SET
  opportunity_name = EXCLUDED.opportunity_name;
```

Run Day 4 files:
```bash
psql -d your_database -f seed_jtbds.sql
psql -d your_database -f seed_outcomes.sql
psql -d your_database -f seed_opportunities.sql
```

---

### Day 5: Relationship Mapping (4-5 hours)

**Goal:** Connect entities via junction tables.

#### Step 5.1: Map Pain Points to Opportunities

Create file: `map_pain_opportunity.sql`

```sql
-- Map Pain Points to Opportunities
INSERT INTO pain_point_opportunities (pain_point_id, opportunity_id, resolution_effectiveness, implementation_effort, roi_estimate)
SELECT
  pp.id,
  o.id,
  8.5,  -- Resolution effectiveness (0-10)
  'medium',
  '6-12 months payback'
FROM ref_pain_points pp
CROSS JOIN ref_opportunities o
WHERE pp.unique_id = 'PAIN-PROC-001'  -- Manual Veeva entry
  AND o.unique_id = 'OPP-AUTO-001';    -- AI auto-documentation

-- Repeat for other pain-opportunity pairs
INSERT INTO pain_point_opportunities (pain_point_id, opportunity_id, resolution_effectiveness, implementation_effort, roi_estimate)
SELECT pp.id, o.id, 9.0, 'high', '12-18 months payback'
FROM ref_pain_points pp
CROSS JOIN ref_opportunities o
WHERE pp.unique_id = 'PAIN-TECH-001'  -- Data silos
  AND o.unique_id = 'OPP-INTEG-001';   -- CRM-Safety integration

-- Add 50+ more mappings...
```

#### Step 5.2: Map Opportunities to Service Layers

Create file: `map_opportunity_servicelayer.sql`

```sql
-- Map Opportunities to Service Layers
INSERT INTO opportunity_service_layers (opportunity_id, service_layer_id, routing_priority, fit_score, conditions)
SELECT
  o.id,
  sl.id,
  1,  -- Routing priority (1=highest)
  9.0,  -- Fit score (0-10)
  '{"archetype": "AUTOMATOR", "vpanes_min": 40}'::jsonb
FROM ref_opportunities o
CROSS JOIN ref_service_layers sl
WHERE o.unique_id = 'OPP-AUTO-001'  -- AI auto-documentation
  AND sl.unique_id = 'SL-WORKFLOWS';  -- Routes to Workflows

-- Add more mappings...
```

#### Step 5.3: Map JTBDs to Outcomes

Create file: `map_jtbd_outcome.sql`

```sql
-- Map JTBDs to Outcomes
INSERT INTO jtbd_outcomes (jtbd_id, outcome_id, outcome_priority, importance_weight)
SELECT
  j.id,
  o.id,
  1,  -- Priority
  1.0  -- Importance weight
FROM ref_jtbds j
CROSS JOIN ref_outcomes o
WHERE j.unique_id = 'JTBD-FUNC-001'  -- Document interactions quickly
  AND o.unique_id = 'OUT-SPEED-001';  -- Minimize time to document

-- Add more mappings...
```

Run Day 5 files:
```bash
psql -d your_database -f map_pain_opportunity.sql
psql -d your_database -f map_opportunity_servicelayer.sql
psql -d your_database -f map_jtbd_outcome.sql
```

---

## WEEK 2: PERSONA LINKAGE (10-15 hours)

### Day 6-7: Link Personas to Entities

**Goal:** Populate persona-entity junction tables with archetype-specific weights.

#### Link Personas to Tools

Create file: `link_persona_tools.sql`

```sql
-- MSL persona uses Veeva CRM
INSERT INTO persona_tools (persona_id, tool_id, proficiency_level, usage_frequency, satisfaction_score, pain_level, automation_desire,
                           weight_automator, weight_orchestrator, weight_learner, weight_skeptic)
SELECT
  p.id,
  t.id,
  'Intermediate',
  'Daily',
  5.0,  -- Satisfaction
  6.0,  -- Pain level
  8.0,  -- Automation desire
  1.8,  -- AUTOMATOR: high pain
  0.7,  -- ORCHESTRATOR: delegates
  1.3,  -- LEARNER: learning curve
  1.0   -- SKEPTIC: accepts as necessary
FROM personas p
CROSS JOIN ref_tools t
WHERE p.unique_id = 'PERSONA-MSL-001'
  AND t.unique_id = 'TOOL-CRM-001';

-- Repeat for all persona-tool combinations (120+ edges)
```

#### Link Personas to Pain Points with VPANES

Create file: `link_persona_painpoints.sql`

```sql
-- MSL AUTOMATOR archetype experiences "Manual Veeva entry" pain
INSERT INTO persona_pain_points (
  persona_id, pain_point_id, severity, frequency, impact_score, emotional_intensity,
  weight_automator, weight_orchestrator, weight_learner, weight_skeptic,
  vpanes_visibility, vpanes_pain, vpanes_actions, vpanes_needs, vpanes_emotions, vpanes_scenarios
)
SELECT
  p.id,
  pp.id,
  'high',
  'always',
  8.0,  -- Business impact
  7.0,  -- Emotional intensity
  1.9, 0.7, 1.3, 1.0,  -- Archetype weights
  9, 8, 9, 8, 7, 9  -- VPANES scores (AUTOMATOR profile)
FROM personas p
CROSS JOIN ref_pain_points pp
WHERE p.unique_id = 'PERSONA-MSL-001'
  AND p.persona_type = 'AUTOMATOR'
  AND pp.unique_id = 'PAIN-PROC-001';

-- For same pain but ORCHESTRATOR archetype:
INSERT INTO persona_pain_points (...)
SELECT ...
  1.9, 0.7, 1.3, 1.0,  -- Same weights
  5, 3, 2, 3, 2, 5  -- Different VPANES (low engagement for ORCHESTRATOR)
WHERE p.persona_type = 'ORCHESTRATOR'
  AND pp.unique_id = 'PAIN-PROC-001';

-- Repeat for 40 pain points x 4 archetypes = 160 edges
```

#### Link Personas to JTBDs with ODI

Create file: `link_persona_jtbds.sql`

```sql
-- MSL AUTOMATOR performs "Document interactions quickly" JTBD
INSERT INTO persona_jtbds (
  persona_id, jtbd_id, frequency,
  importance_score, satisfaction_score,
  importance_automator, satisfaction_automator,
  importance_orchestrator, satisfaction_orchestrator,
  importance_learner, satisfaction_learner,
  importance_skeptic, satisfaction_skeptic
)
SELECT
  p.id,
  j.id,
  'Daily',
  9.0, 4.0,  -- Overall importance, satisfaction
  9.0, 4.0,  -- AUTOMATOR: I=9, S=4 → Opp=14
  7.0, 6.0,  -- ORCHESTRATOR: I=7, S=6 → Opp=8
  8.5, 3.5,  -- LEARNER: I=8.5, S=3.5 → Opp=13
  7.5, 5.5   -- SKEPTIC: I=7.5, S=5.5 → Opp=9.5
FROM personas p
CROSS JOIN ref_jtbds j
WHERE p.unique_id = 'PERSONA-MSL-001'
  AND j.unique_id = 'JTBD-FUNC-001';

-- Repeat for 30 JTBDs x 6 personas = 180 edges
```

Run persona linkage files:
```bash
psql -d your_database -f link_persona_tools.sql
psql -d your_database -f link_persona_painpoints.sql
psql -d your_database -f link_persona_jtbds.sql
```

---

## VALIDATION QUERIES

### Check Entity Counts

```sql
-- Entity counts
SELECT 'Archetypes' AS entity, COUNT(*) AS count FROM ref_archetypes
UNION ALL
SELECT 'Service Layers', COUNT(*) FROM ref_service_layers
UNION ALL
SELECT 'Tools', COUNT(*) FROM ref_tools
UNION ALL
SELECT 'Pain Points', COUNT(*) FROM ref_pain_points
UNION ALL
SELECT 'Goals', COUNT(*) FROM ref_goals
UNION ALL
SELECT 'Motivations', COUNT(*) FROM ref_motivations
UNION ALL
SELECT 'Activities', COUNT(*) FROM ref_activities
UNION ALL
SELECT 'JTBDs', COUNT(*) FROM ref_jtbds
UNION ALL
SELECT 'Outcomes', COUNT(*) FROM ref_outcomes
UNION ALL
SELECT 'Opportunities', COUNT(*) FROM ref_opportunities;

-- Expected:
-- Archetypes: 4
-- Service Layers: 4
-- Tools: 20-40
-- Pain Points: 25-80
-- Goals: 18-40
-- Motivations: 14-25
-- Activities: 19-60
-- JTBDs: 3-30
-- Outcomes: 6-40
-- Opportunities: 3-25
```

### Check Relationship Counts

```sql
-- Relationship edge counts
SELECT 'Pain → Opportunity' AS relationship, COUNT(*) AS count FROM pain_point_opportunities
UNION ALL
SELECT 'Opportunity → Service Layer', COUNT(*) FROM opportunity_service_layers
UNION ALL
SELECT 'JTBD → Outcome', COUNT(*) FROM jtbd_outcomes
UNION ALL
SELECT 'Persona → Tool', COUNT(*) FROM persona_tools
UNION ALL
SELECT 'Persona → Pain Point', COUNT(*) FROM persona_pain_points
UNION ALL
SELECT 'Persona → Goal', COUNT(*) FROM persona_goals
UNION ALL
SELECT 'Persona → JTBD', COUNT(*) FROM persona_jtbds;

-- Expected (after full seeding):
-- Pain → Opportunity: 50-100
-- Opportunity → Service Layer: 30-60
-- JTBD → Outcome: 40-80
-- Persona → Tool: 60-120
-- Persona → Pain Point: 120-240
-- Persona → Goal: 60-180
-- Persona → JTBD: 60-180
```

### Validate VPANES Scoring

```sql
-- Check VPANES scores are within valid range (0-60)
SELECT
  p.persona_name,
  pp.pain_point_name,
  ppp.vpanes_visibility,
  ppp.vpanes_pain,
  ppp.vpanes_actions,
  ppp.vpanes_needs,
  ppp.vpanes_emotions,
  ppp.vpanes_scenarios,
  (ppp.vpanes_visibility + ppp.vpanes_pain + ppp.vpanes_actions +
   ppp.vpanes_needs + ppp.vpanes_emotions + ppp.vpanes_scenarios) AS total_vpanes,
  CASE
    WHEN (ppp.vpanes_visibility + ppp.vpanes_pain + ppp.vpanes_actions +
          ppp.vpanes_needs + ppp.vpanes_emotions + ppp.vpanes_scenarios) >= 41 THEN 'HIGH'
    WHEN (ppp.vpanes_visibility + ppp.vpanes_pain + ppp.vpanes_actions +
          ppp.vpanes_needs + ppp.vpanes_emotions + ppp.vpanes_scenarios) >= 21 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS engagement_level
FROM persona_pain_points ppp
JOIN personas p ON ppp.persona_id = p.id
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
ORDER BY total_vpanes DESC
LIMIT 10;
```

### Validate ODI Scoring

```sql
-- Check ODI opportunity scores are calculated correctly
SELECT
  j.jtbd_statement,
  pj.importance_score,
  pj.satisfaction_score,
  pj.opportunity_score,
  (pj.importance_score + GREATEST(pj.importance_score - pj.satisfaction_score, 0)) AS calculated_opp_score,
  CASE
    WHEN pj.opportunity_score >= 15 THEN 'CRITICAL'
    WHEN pj.opportunity_score >= 12 THEN 'HIGH'
    WHEN pj.opportunity_score >= 9 THEN 'MEDIUM-HIGH'
    ELSE 'LOWER'
  END AS priority
FROM persona_jtbds pj
JOIN ref_jtbds j ON pj.jtbd_id = j.id
ORDER BY pj.opportunity_score DESC
LIMIT 10;
```

---

## PERFORMANCE OPTIMIZATION

### Add Missing Indexes

```sql
-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_persona_pain_vpanes_total
  ON persona_pain_points ((vpanes_visibility + vpanes_pain + vpanes_actions + vpanes_needs + vpanes_emotions + vpanes_scenarios));

CREATE INDEX IF NOT EXISTS idx_persona_jtbds_opportunity
  ON persona_jtbds (opportunity_score DESC);

CREATE INDEX IF NOT EXISTS idx_pain_point_opportunities_effectiveness
  ON pain_point_opportunities (resolution_effectiveness DESC);

-- Composite indexes for graph traversal
CREATE INDEX IF NOT EXISTS idx_persona_pain_persona_pain
  ON persona_pain_points (persona_id, pain_point_id);

CREATE INDEX IF NOT EXISTS idx_pain_opp_pain_opp
  ON pain_point_opportunities (pain_point_id, opportunity_id);
```

### Query Performance Benchmarks

```sql
-- Test query performance (should be <1s)
EXPLAIN ANALYZE
SELECT
  pp.pain_point_name,
  ppp.vpanes_total,
  o.opportunity_name,
  sl.layer_name
FROM persona_pain_points ppp
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
JOIN ref_opportunities o ON ppo.opportunity_id = o.id
JOIN opportunity_service_layers osl ON o.id = osl.opportunity_id
JOIN ref_service_layers sl ON osl.service_layer_id = sl.id
WHERE ppp.vpanes_total >= 40
ORDER BY ppp.vpanes_total DESC
LIMIT 10;
```

---

## NEXT STEPS

After completing the 5-day sprint:

1. **Week 2-3:** Complete persona linkage for all 6 Medical Affairs personas
2. **Week 4:** Create analytics views and stored procedures
3. **Week 5-6:** AI agent integration and routing logic
4. **Week 7+:** Extend to Commercial function

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-27
**Maintained By:** Data Strategist Agent
