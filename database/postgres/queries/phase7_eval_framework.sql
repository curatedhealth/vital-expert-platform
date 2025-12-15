-- ==========================================
-- FILE: phase7_eval_framework.sql
-- PURPOSE: Create comprehensive eval suites, cases, and run tracking for continuous agent evaluation
-- PHASE: 7 of 9 - Evaluation Framework
-- DEPENDENCIES: agents table
-- GOLDEN RULES: Data-driven evaluation, comprehensive tracking
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 7: EVALUATION FRAMEWORK';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 1: CREATE EVAL SUITES
-- ==========================================

CREATE TABLE IF NOT EXISTS eval_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Suite metadata
    suite_type TEXT CHECK (suite_type IN ('accuracy', 'hallucination', 'safety', 'performance', 'comprehensive')),
    target_domain TEXT,
    
    -- Execution config
    auto_run_on_deploy BOOLEAN DEFAULT false,
    run_frequency TEXT CHECK (run_frequency IN ('manual', 'daily', 'weekly', 'on_change')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

COMMENT ON TABLE eval_suites IS 'Evaluation test suites for agent quality assurance';

DO $$
BEGIN
    RAISE NOTICE '✓ Created eval_suites table';
END $$;

-- ==========================================
-- SECTION 2: CREATE EVAL CASES
-- ==========================================

CREATE TABLE IF NOT EXISTS eval_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id UUID NOT NULL REFERENCES eval_suites(id) ON DELETE CASCADE,
    
    -- Case definition
    case_name TEXT NOT NULL,
    case_description TEXT,
    
    -- Input
    input_query TEXT NOT NULL,
    input_context TEXT,
    
    -- Expected output
    expected_answer TEXT,
    expected_categories TEXT[],
    
    -- Evaluation criteria
    eval_type TEXT CHECK (eval_type IN ('exact_match', 'semantic_similarity', 'contains_keywords', 'llm_judge', 'custom')),
    pass_threshold NUMERIC(3,2) CHECK (pass_threshold >= 0 AND pass_threshold <= 1),
    
    -- Metadata
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
    tags TEXT[],
    sequence_order INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(suite_id, case_name)
);

COMMENT ON TABLE eval_cases IS 'Individual test cases with inputs, expected outputs, and eval criteria';

DO $$
BEGIN
    RAISE NOTICE '✓ Created eval_cases table';
END $$;

-- ==========================================
-- SECTION 3: CREATE AGENT EVAL RUNS
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_eval_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    suite_id UUID NOT NULL REFERENCES eval_suites(id) ON DELETE CASCADE,
    
    -- Run metadata
    run_name TEXT,
    agent_version TEXT,
    triggered_by TEXT CHECK (triggered_by IN ('manual', 'deployment', 'scheduled', 'ci_cd')),
    
    -- Run results (aggregated)
    total_cases INTEGER NOT NULL,
    passed_cases INTEGER DEFAULT 0,
    failed_cases INTEGER DEFAULT 0,
    pass_rate NUMERIC(5,2),
    
    -- Performance metrics
    avg_response_time_ms INTEGER,
    total_cost_usd NUMERIC(10,6),
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    
    -- Timestamps
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Error tracking
    error_message TEXT
);

COMMENT ON TABLE agent_eval_runs IS 'Evaluation run tracking with aggregated results';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_eval_runs table';
END $$;

-- ==========================================
-- SECTION 4: CREATE AGENT EVAL CASE RESULTS
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_eval_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eval_run_id UUID NOT NULL REFERENCES agent_eval_runs(id) ON DELETE CASCADE,
    eval_case_id UUID NOT NULL REFERENCES eval_cases(id) ON DELETE CASCADE,
    
    -- Case execution
    actual_answer TEXT,
    
    -- Evaluation results
    passed BOOLEAN,
    score NUMERIC(5,2),
    
    -- Performance
    response_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd NUMERIC(10,6),
    
    -- Metadata
    error_message TEXT,
    evaluation_notes TEXT,
    
    -- Timestamps
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(eval_run_id, eval_case_id)
);

COMMENT ON TABLE agent_eval_cases IS 'Individual case results per eval run';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_eval_cases table';
END $$;

-- ==========================================
-- SECTION 5: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- Creating Indexes ---';
END $$;

-- Eval suites
CREATE INDEX IF NOT EXISTS idx_eval_suites_tenant ON eval_suites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_eval_suites_type ON eval_suites(suite_type);
CREATE INDEX IF NOT EXISTS idx_eval_suites_active ON eval_suites(is_active);
CREATE INDEX IF NOT EXISTS idx_eval_suites_slug ON eval_suites(slug);

-- Eval cases
CREATE INDEX IF NOT EXISTS idx_eval_cases_suite ON eval_cases(suite_id);
CREATE INDEX IF NOT EXISTS idx_eval_cases_active ON eval_cases(is_active);
CREATE INDEX IF NOT EXISTS idx_eval_cases_difficulty ON eval_cases(difficulty_level);

-- Agent eval runs
CREATE INDEX IF NOT EXISTS idx_agent_eval_runs_agent ON agent_eval_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_eval_runs_suite ON agent_eval_runs(suite_id);
CREATE INDEX IF NOT EXISTS idx_agent_eval_runs_status ON agent_eval_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_eval_runs_started ON agent_eval_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_eval_runs_completed ON agent_eval_runs(completed_at DESC);

-- Agent eval cases
CREATE INDEX IF NOT EXISTS idx_agent_eval_cases_run ON agent_eval_cases(eval_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_eval_cases_case ON agent_eval_cases(eval_case_id);
CREATE INDEX IF NOT EXISTS idx_agent_eval_cases_passed ON agent_eval_cases(passed);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    suite_count INTEGER;
    case_count INTEGER;
    run_count INTEGER;
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO suite_count FROM eval_suites;
    SELECT COUNT(*) INTO case_count FROM eval_cases;
    SELECT COUNT(*) INTO run_count FROM agent_eval_runs;
    SELECT COUNT(*) INTO result_count FROM agent_eval_cases;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 7 COMPLETE ===';
    RAISE NOTICE 'Eval suites: %', suite_count;
    RAISE NOTICE 'Eval cases: %', case_count;
    RAISE NOTICE 'Eval runs: %', run_count;
    RAISE NOTICE 'Case results: %', result_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 7 COMPLETE: EVALUATION FRAMEWORK';
    RAISE NOTICE '=================================================================';
END $$;

SELECT 
    'Eval Suites' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM eval_suites
UNION ALL
SELECT 'Eval Cases', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM eval_cases
UNION ALL
SELECT 'Agent Eval Runs', COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
FROM agent_eval_runs
UNION ALL
SELECT 'Case Results', COUNT(*), COUNT(*) FILTER (WHERE passed = true)
FROM agent_eval_cases;

