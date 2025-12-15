-- ============================================================================
-- VITAL Platform: Runner Schema v4 (Completely Isolated)
-- Run each section separately if needed
-- ============================================================================

-- ============================================================================
-- SECTION A: DROP AND CREATE TABLES
-- ============================================================================

DROP TABLE IF EXISTS vital_runner_executions CASCADE;
DROP TABLE IF EXISTS vital_runner_agent_compat CASCADE;
DROP TABLE IF EXISTS vital_skills CASCADE;
DROP TABLE IF EXISTS vital_runners CASCADE;
DROP TABLE IF EXISTS vital_runner_categories CASCADE;

CREATE TABLE vital_runner_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_code VARCHAR(50) UNIQUE NOT NULL,
    cat_name VARCHAR(255) NOT NULL,
    cat_description TEXT,
    cat_type VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vital_runners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_code VARCHAR(100) UNIQUE NOT NULL,
    run_name VARCHAR(255) NOT NULL,
    run_description TEXT,
    cat_code VARCHAR(50) NOT NULL,
    algo_core VARCHAR(100),
    complexity VARCHAR(20) DEFAULT 'medium',
    min_level INTEGER DEFAULT 3,
    max_level INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vital_runner_agent_compat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_code VARCHAR(100) NOT NULL,
    agent_lvl INTEGER NOT NULL,
    compat_type VARCHAR(20) NOT NULL,
    match_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vital_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_code VARCHAR(100) UNIQUE NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    run_code VARCHAR(100) NOT NULL,
    agent_archetype VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- SECTION B: SEED CATEGORIES (28)
-- ============================================================================

INSERT INTO vital_runner_categories (cat_code, cat_name, cat_description, cat_type, display_order) VALUES
('UNDERSTAND', 'Understand', 'Comprehension and analysis', 'core', 1),
('EVALUATE', 'Evaluate', 'Critical assessment', 'core', 2),
('DECIDE', 'Decide', 'Decision-making', 'core', 3),
('INVESTIGATE', 'Investigate', 'Deep inquiry', 'core', 4),
('WATCH', 'Watch', 'Monitoring', 'core', 5),
('SOLVE', 'Solve', 'Problem-solving', 'core', 6),
('PREPARE', 'Prepare', 'Preparation', 'core', 7),
('CREATE', 'Create', 'Generation', 'core', 8),
('REFINE', 'Refine', 'Optimization', 'core', 9),
('VALIDATE', 'Validate', 'Verification', 'core', 10),
('SYNTHESIZE', 'Synthesize', 'Integration', 'core', 11),
('PLAN', 'Plan', 'Planning', 'core', 12),
('PREDICT', 'Predict', 'Forecasting', 'core', 13),
('NEGOTIATE', 'Negotiate', 'Bargaining', 'core', 14),
('COMMUNICATE', 'Communicate', 'Messaging', 'core', 15),
('COORDINATE', 'Coordinate', 'Orchestration', 'core', 16),
('PROTECT', 'Protect', 'Risk mitigation', 'core', 17),
('LEARN', 'Learn', 'Knowledge extraction', 'core', 18),
('COMPARE', 'Compare', 'Benchmarking', 'core', 19),
('TRANSFORM', 'Transform', 'Translation', 'core', 20),
('DESIGN', 'Design', 'System design', 'core', 21),
('GOVERN', 'Govern', 'Governance', 'core', 22),
('FORESIGHT', 'Foresight', 'Trend detection', 'pharmaceutical', 23),
('BRAND_STRATEGY', 'Brand Strategy', 'Brand development', 'pharmaceutical', 24),
('MARKET_ACCESS', 'Market Access', 'Payer strategy', 'pharmaceutical', 25),
('MEDICAL_AFFAIRS', 'Medical Affairs', 'Medical strategy', 'pharmaceutical', 26),
('COMMERCIAL_OPS', 'Commercial Ops', 'Launch execution', 'pharmaceutical', 27),
('REGULATORY_STRATEGY', 'Regulatory Strategy', 'Regulatory planning', 'pharmaceutical', 28);


-- ============================================================================
-- SECTION C: SEED RUNNERS (88 Core)
-- ============================================================================

-- UNDERSTAND (8)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('scan', 'Scanner', 'Environmental scan for signals', 'UNDERSTAND', 'Breadth-first', 'light', 3, 5),
('map', 'Mapper', 'Create structured maps', 'UNDERSTAND', 'Graph construction', 'medium', 3, 5),
('decompose', 'Decomposer', 'Break problems into components', 'UNDERSTAND', 'Hierarchical', 'medium', 3, 5),
('contextualize', 'Contextualizer', 'Place in broader context', 'UNDERSTAND', 'Contextual', 'light', 3, 5),
('clarify', 'Clarifier', 'Disambiguate requirements', 'UNDERSTAND', 'Socratic', 'light', 2, 5),
('summarize', 'Summarizer', 'Create concise summaries', 'UNDERSTAND', 'Extractive', 'light', 3, 5),
('interpret', 'Interpreter', 'Interpret meaning', 'UNDERSTAND', 'Hermeneutic', 'medium', 2, 4),
('profile', 'Profiler', 'Build entity profiles', 'UNDERSTAND', 'Multi-faceted', 'medium', 3, 5);

-- EVALUATE (10)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('critique', 'Critic', 'Critical evaluation', 'EVALUATE', 'MCDA', 'medium', 2, 4),
('score', 'Scorer', 'Quantitative scoring', 'EVALUATE', 'Weighted', 'light', 3, 5),
('rank', 'Ranker', 'Rank by criteria', 'EVALUATE', 'Multi-attribute', 'medium', 3, 5),
('assess_risk', 'Risk Assessor', 'Identify risks', 'EVALUATE', 'Risk matrix', 'heavy', 2, 4),
('audit', 'Auditor', 'Systematic audit', 'EVALUATE', 'Compliance', 'heavy', 2, 4),
('benchmark', 'Benchmarker', 'Compare to best practices', 'EVALUATE', 'Gap analysis', 'medium', 2, 4),
('validate_evidence', 'Evidence Validator', 'Assess evidence quality', 'EVALUATE', 'GRADE', 'heavy', 2, 4),
('feasibility_check', 'Feasibility Checker', 'Assess feasibility', 'EVALUATE', 'Feasibility', 'medium', 2, 4),
('impact_assess', 'Impact Assessor', 'Assess impact', 'EVALUATE', 'Impact analysis', 'medium', 2, 4),
('quality_review', 'Quality Reviewer', 'Review quality', 'EVALUATE', 'Quality gates', 'medium', 2, 4);

-- DECIDE (8)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('prioritize', 'Prioritizer', 'Prioritize by value/effort', 'DECIDE', 'Value-effort', 'medium', 2, 4),
('recommend', 'Recommender', 'Generate recommendations', 'DECIDE', 'Decision tree', 'medium', 2, 4),
('tradeoff', 'Tradeoff Analyzer', 'Analyze tradeoffs', 'DECIDE', 'Pareto', 'heavy', 2, 4),
('triage', 'Triager', 'Rapid categorization', 'DECIDE', 'Decision matrix', 'light', 3, 5),
('select', 'Selector', 'Select optimal option', 'DECIDE', 'MCDA', 'medium', 2, 4),
('allocate', 'Allocator', 'Allocate resources', 'DECIDE', 'Optimization', 'heavy', 2, 4),
('sequence', 'Sequencer', 'Optimal sequencing', 'DECIDE', 'Topological', 'medium', 3, 5),
('go_nogo', 'Go/No-Go', 'Go/no-go decisions', 'DECIDE', 'Stage-gate', 'medium', 2, 4);

-- INVESTIGATE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('root_cause', 'Root Cause', 'Find root causes', 'INVESTIGATE', '5 Whys', 'heavy', 2, 4),
('hypothesis_test', 'Hypothesis Tester', 'Test hypotheses', 'INVESTIGATE', 'Scientific', 'heavy', 2, 4),
('forensics', 'Forensic Analyzer', 'Forensic analysis', 'INVESTIGATE', 'Timeline', 'heavy', 2, 4),
('signal_chase', 'Signal Chaser', 'Validate signals', 'INVESTIGATE', 'Signal detection', 'medium', 3, 5),
('gap_identify', 'Gap Identifier', 'Identify gaps', 'INVESTIGATE', 'Gap analysis', 'medium', 2, 4),
('anomaly_detect', 'Anomaly Detector', 'Detect anomalies', 'INVESTIGATE', 'Statistical', 'medium', 3, 5);

-- WATCH (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('horizon_scan', 'Horizon Scanner', 'Scan for trends', 'WATCH', 'Environmental', 'medium', 3, 5),
('competitor_track', 'Competitor Tracker', 'Track competitors', 'WATCH', 'Competitive intel', 'medium', 3, 5),
('trigger_monitor', 'Trigger Monitor', 'Monitor triggers', 'WATCH', 'Event detection', 'light', 4, 5),
('sentiment_track', 'Sentiment Tracker', 'Track sentiment', 'WATCH', 'Sentiment', 'light', 4, 5),
('kpi_monitor', 'KPI Monitor', 'Monitor KPIs', 'WATCH', 'Dashboard', 'light', 4, 5),
('alert_generate', 'Alert Generator', 'Generate alerts', 'WATCH', 'Rule-based', 'light', 4, 5);

-- SOLVE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('brainstorm', 'Brainstormer', 'Generate solutions', 'SOLVE', 'Divergent', 'light', 2, 4),
('obstacle_clear', 'Obstacle Clearer', 'Clear obstacles', 'SOLVE', 'Constraint', 'medium', 2, 4),
('alternative_find', 'Alternative Finder', 'Find alternatives', 'SOLVE', 'Lateral', 'medium', 3, 5),
('workaround', 'Workaround Designer', 'Design workarounds', 'SOLVE', 'Constraint sat', 'medium', 3, 5),
('optimize', 'Optimizer', 'Optimize solutions', 'SOLVE', 'Hill climbing', 'heavy', 3, 5),
('innovate', 'Innovator', 'Innovative solutions', 'SOLVE', 'TRIZ', 'heavy', 2, 4);

-- PREPARE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('brief', 'Briefer', 'Prepare briefings', 'PREPARE', 'Structured', 'medium', 2, 4),
('stakeholder_map', 'Stakeholder Mapper', 'Map stakeholders', 'PREPARE', 'Stakeholder', 'medium', 3, 5),
('agenda_build', 'Agenda Builder', 'Build agendas', 'PREPARE', 'Agenda opt', 'light', 3, 5),
('question_anticipate', 'Question Anticipator', 'Anticipate questions', 'PREPARE', 'Q&A predict', 'medium', 2, 4),
('material_assemble', 'Material Assembler', 'Assemble materials', 'PREPARE', 'Curation', 'light', 3, 5),
('scenario_prepare', 'Scenario Preparer', 'Prepare scenarios', 'PREPARE', 'Scenario', 'heavy', 2, 4);

-- CREATE (8)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('draft', 'Drafter', 'Draft documents', 'CREATE', 'Structured writing', 'medium', 3, 5),
('narrative_build', 'Narrative Builder', 'Build narratives', 'CREATE', 'Story structure', 'medium', 2, 4),
('framework_design', 'Framework Designer', 'Design frameworks', 'CREATE', 'Framework synth', 'heavy', 2, 4),
('template_create', 'Template Creator', 'Create templates', 'CREATE', 'Abstraction', 'medium', 3, 5),
('visualize', 'Visualizer', 'Create visuals', 'CREATE', 'Data viz', 'medium', 3, 5),
('model_build', 'Model Builder', 'Build models', 'CREATE', 'Model construct', 'heavy', 2, 4),
('protocol_design', 'Protocol Designer', 'Design protocols', 'CREATE', 'Process design', 'heavy', 2, 4),
('case_build', 'Case Builder', 'Build cases', 'CREATE', 'Argumentation', 'heavy', 2, 4);

-- REFINE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('edit', 'Editor', 'Edit content', 'REFINE', 'Iterative', 'light', 3, 5),
('polish', 'Polisher', 'Polish deliverables', 'REFINE', 'Enhancement', 'light', 3, 5),
('simplify', 'Simplifier', 'Simplify content', 'REFINE', 'Reduction', 'medium', 3, 5),
('strengthen', 'Strengthener', 'Strengthen arguments', 'REFINE', 'Enhancement', 'medium', 2, 4),
('harmonize', 'Harmonizer', 'Harmonize docs', 'REFINE', 'Consistency', 'medium', 3, 5),
('iterate', 'Iterator', 'Iterate on feedback', 'REFINE', 'Feedback loop', 'medium', 3, 5);

-- VALIDATE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('fact_check', 'Fact Checker', 'Verify facts', 'VALIDATE', 'Source verify', 'medium', 4, 5),
('compliance_check', 'Compliance Checker', 'Check compliance', 'VALIDATE', 'Rule matching', 'heavy', 2, 4),
('consistency_check', 'Consistency Checker', 'Check consistency', 'VALIDATE', 'Logical', 'medium', 3, 5),
('completeness_check', 'Completeness Checker', 'Check completeness', 'VALIDATE', 'Coverage', 'medium', 3, 5),
('assumption_validate', 'Assumption Validator', 'Validate assumptions', 'VALIDATE', 'Testing', 'medium', 2, 4),
('source_verify', 'Source Verifier', 'Verify sources', 'VALIDATE', 'Source analysis', 'medium', 4, 5);

-- SYNTHESIZE (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('integrate', 'Integrator', 'Integrate inputs', 'SYNTHESIZE', 'Fusion', 'medium', 3, 5),
('reconcile', 'Reconciler', 'Reconcile conflicts', 'SYNTHESIZE', 'Resolution', 'heavy', 2, 4),
('distill', 'Distiller', 'Distill insights', 'SYNTHESIZE', 'Extraction', 'medium', 2, 4),
('connect', 'Connector', 'Find connections', 'SYNTHESIZE', 'Association', 'medium', 3, 5),
('aggregate', 'Aggregator', 'Aggregate findings', 'SYNTHESIZE', 'Meta-analysis', 'heavy', 2, 4),
('conclude', 'Concluder', 'Draw conclusions', 'SYNTHESIZE', 'Inference', 'medium', 2, 4);

-- PLAN (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('roadmap', 'Roadmapper', 'Create roadmaps', 'PLAN', 'Timeline', 'heavy', 2, 4),
('milestone_set', 'Milestone Setter', 'Define milestones', 'PLAN', 'Milestone', 'medium', 2, 4),
('contingency_plan', 'Contingency Planner', 'Plan contingencies', 'PLAN', 'Risk-based', 'heavy', 2, 4),
('resource_plan', 'Resource Planner', 'Plan resources', 'PLAN', 'Allocation', 'medium', 3, 5),
('timeline_build', 'Timeline Builder', 'Build timelines', 'PLAN', 'CPM/PERT', 'medium', 3, 5),
('strategy_formulate', 'Strategy Formulator', 'Formulate strategy', 'PLAN', 'Strategic', 'heavy', 1, 3);

-- PREDICT (6)
INSERT INTO vital_runners (run_code, run_name, run_description, cat_code, algo_core, complexity, min_level, max_level) VALUES
('forecast', 'Forecaster', 'Generate forecasts', 'PREDICT', 'Time series', 'heavy', 2, 4),
('scenario_model', 'Scenario Modeler', 'Model scenarios', 'PREDICT', 'Scenario', 'heavy', 2, 4),
('trend_extrapolate', 'Trend Extrapolator', 'Extrapolate trends', 'PREDICT', 'Trend', 'medium', 3, 5),
('outcome_simulate', 'Outcome Simulator', 'Simulate outcomes', 'PREDICT', 'Monte Carlo', 'heavy', 3, 5),
('sensitivity_analyze', 'Sensitivity Analyzer', 'Sensitivity analysis', 'PREDICT', 'Sensitivity', 'heavy', 3, 5),
('probability_estimate', 'Probability Estimator', 'Estimate probability', 'PREDICT', 'Probabilistic', 'medium', 2, 4);


-- ============================================================================
-- SECTION D: SEED AGENT COMPATIBILITY
-- ============================================================================

INSERT INTO vital_runner_agent_compat (run_code, agent_lvl, compat_type, match_score)
SELECT 
    r.run_code,
    lvl.n,
    CASE 
        WHEN lvl.n = 4 THEN 'recommended'
        WHEN lvl.n = 5 THEN 'recommended'
        WHEN lvl.n = 3 THEN 'compatible'
        WHEN lvl.n = 2 THEN 'compatible'
        ELSE 'not_compatible'
    END,
    CASE 
        WHEN lvl.n = 4 THEN 90
        WHEN lvl.n = 5 THEN 85
        WHEN lvl.n = 3 THEN 70
        WHEN lvl.n = 2 THEN 50
        ELSE 20
    END
FROM vital_runners r
CROSS JOIN (SELECT generate_series(1, 5) AS n) lvl;


-- ============================================================================
-- SECTION E: VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW v_vital_runners AS
SELECT 
    r.id,
    r.run_code,
    r.run_name,
    r.run_description,
    r.cat_code,
    c.cat_name,
    c.cat_type,
    r.algo_core,
    r.complexity,
    r.min_level,
    r.max_level
FROM vital_runners r
JOIN vital_runner_categories c ON r.cat_code = c.cat_code
WHERE r.is_active = true;

CREATE OR REPLACE VIEW v_vital_runner_summary AS
SELECT 
    c.cat_code,
    c.cat_name,
    c.cat_type,
    COUNT(r.id) AS runner_count
FROM vital_runner_categories c
LEFT JOIN vital_runners r ON r.cat_code = c.cat_code
GROUP BY c.cat_code, c.cat_name, c.cat_type, c.display_order
ORDER BY c.display_order;


-- ============================================================================
-- SECTION F: SUMMARY QUERY
-- ============================================================================

SELECT 'VITAL Runner Schema Created' AS status;

SELECT 
    'vital_runner_categories' AS tbl, COUNT(*) AS cnt FROM vital_runner_categories
UNION ALL SELECT 
    'vital_runners', COUNT(*) FROM vital_runners
UNION ALL SELECT 
    'vital_runner_agent_compat', COUNT(*) FROM vital_runner_agent_compat;

SELECT * FROM v_vital_runner_summary;
