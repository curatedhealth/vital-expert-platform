-- ============================================================================
-- Migration: Panel → Workflow → Task → Runner Linkages
-- Date: 2025-12-17
-- Purpose: Create the hierarchical linkages between panels, workflows, tasks,
--          and runners to enable proper runner routing based on panel type
--
-- Hierarchy: PANEL → WORKFLOW → TASK → RUNNER
--
-- Panel Types (6):
--   - open (ap_mode_1): Open discussion format
--   - structured (ap_mode_2): Structured response format
--   - consensus (ap_mode_3): Consensus-building format
--   - debate (ap_mode_4): Debate/adversarial format
--   - review (ap_mode_5): Review/critique format
--   - multi_phase (ap_mode_6): Multi-phase complex format
--
-- Runner Categories (28): From vital_runner_categories
-- Runners (88): From vital_runners
-- ============================================================================

-- ============================================================================
-- SECTION 1: PANEL → WORKFLOW LINKAGE
-- ============================================================================

-- 1.1 Create panel_workflows junction table
CREATE TABLE IF NOT EXISTS panel_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Panel identification
    panel_type VARCHAR(50) NOT NULL CHECK (panel_type IN (
        'open', 'structured', 'consensus', 'debate', 'review', 'multi_phase'
    )),
    service_mode_id UUID REFERENCES service_modes(id) ON DELETE SET NULL,

    -- Workflow reference
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,

    -- Execution configuration
    phase VARCHAR(50),                    -- Which phase of the panel uses this workflow
    execution_order INTEGER DEFAULT 1,    -- Order within the phase
    is_required BOOLEAN DEFAULT TRUE,     -- Is this workflow required or optional
    is_default BOOLEAN DEFAULT FALSE,     -- Is this the default workflow for this panel type

    -- Configuration
    config JSONB DEFAULT '{}',            -- Additional configuration

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Constraints
    UNIQUE(panel_type, workflow_id, phase)
);

-- 1.2 Create indexes for panel_workflows
CREATE INDEX IF NOT EXISTS idx_panel_workflows_panel_type ON panel_workflows(panel_type);
CREATE INDEX IF NOT EXISTS idx_panel_workflows_workflow_id ON panel_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_panel_workflows_service_mode_id ON panel_workflows(service_mode_id);
CREATE INDEX IF NOT EXISTS idx_panel_workflows_is_default ON panel_workflows(is_default) WHERE is_default = TRUE;

-- 1.3 Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_panel_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_panel_workflows_updated_at ON panel_workflows;
CREATE TRIGGER trigger_panel_workflows_updated_at
    BEFORE UPDATE ON panel_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_panel_workflows_updated_at();

-- ============================================================================
-- SECTION 2: TASK → RUNNER LINKAGE
-- ============================================================================

-- 2.1 Create workflow_task_runners junction table
CREATE TABLE IF NOT EXISTS workflow_task_runners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Task reference
    task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,

    -- Runner reference (using run_code as the stable identifier)
    run_code VARCHAR(100) NOT NULL,

    -- Execution configuration
    execution_order INTEGER DEFAULT 1,    -- Order when multiple runners per task
    is_primary BOOLEAN DEFAULT TRUE,      -- Is this the primary runner

    -- Fallback configuration
    fallback_run_code VARCHAR(100),       -- Fallback runner if primary fails

    -- Runner configuration overrides
    runner_config JSONB DEFAULT '{}',     -- Override default runner config

    -- Execution parameters
    timeout_seconds INTEGER DEFAULT 300,  -- Task-specific timeout
    max_retries INTEGER DEFAULT 3,        -- Task-specific retry count
    retry_delay_seconds INTEGER DEFAULT 5, -- Delay between retries

    -- Conditional execution
    condition_expression TEXT,            -- When to use this runner (e.g., "complexity > 0.7")

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Constraints
    UNIQUE(task_id, run_code)
);

-- 2.2 Create indexes for workflow_task_runners
CREATE INDEX IF NOT EXISTS idx_workflow_task_runners_task_id ON workflow_task_runners(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_runners_run_code ON workflow_task_runners(run_code);
CREATE INDEX IF NOT EXISTS idx_workflow_task_runners_is_primary ON workflow_task_runners(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_task_runners_fallback ON workflow_task_runners(fallback_run_code) WHERE fallback_run_code IS NOT NULL;

-- 2.3 Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_workflow_task_runners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_workflow_task_runners_updated_at ON workflow_task_runners;
CREATE TRIGGER trigger_workflow_task_runners_updated_at
    BEFORE UPDATE ON workflow_task_runners
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_task_runners_updated_at();

-- ============================================================================
-- SECTION 3: WORKFLOW → RUNNER CATEGORY MAPPING (Optional Optimization)
-- ============================================================================

-- 3.1 Create workflow_runner_categories for workflow-level runner preferences
CREATE TABLE IF NOT EXISTS workflow_runner_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Workflow reference
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,

    -- Runner category reference
    cat_code VARCHAR(50) NOT NULL,

    -- Configuration
    preference_weight DECIMAL(3,2) DEFAULT 1.0,  -- Weight for this category (0.0-1.0)
    is_required BOOLEAN DEFAULT FALSE,            -- Must use runners from this category
    is_excluded BOOLEAN DEFAULT FALSE,            -- Never use runners from this category

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(workflow_id, cat_code)
);

-- 3.2 Create indexes
CREATE INDEX IF NOT EXISTS idx_workflow_runner_categories_workflow_id ON workflow_runner_categories(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runner_categories_cat_code ON workflow_runner_categories(cat_code);

-- ============================================================================
-- SECTION 4: PANEL → RUNNER CATEGORY MAPPING (Direct Panel-Runner Affinity)
-- ============================================================================

-- 4.1 Create panel_runner_categories for panel-type runner preferences
CREATE TABLE IF NOT EXISTS panel_runner_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Panel type
    panel_type VARCHAR(50) NOT NULL CHECK (panel_type IN (
        'open', 'structured', 'consensus', 'debate', 'review', 'multi_phase'
    )),

    -- Runner category reference
    cat_code VARCHAR(50) NOT NULL,

    -- Configuration
    preference_weight DECIMAL(3,2) DEFAULT 1.0,  -- Weight for this category
    is_required BOOLEAN DEFAULT FALSE,            -- Must have runner from this category
    is_excluded BOOLEAN DEFAULT FALSE,            -- Never use runners from this category

    -- Use case notes
    usage_notes TEXT,                             -- When to use this category for this panel

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(panel_type, cat_code)
);

-- 4.2 Create indexes
CREATE INDEX IF NOT EXISTS idx_panel_runner_categories_panel_type ON panel_runner_categories(panel_type);
CREATE INDEX IF NOT EXISTS idx_panel_runner_categories_cat_code ON panel_runner_categories(cat_code);

-- ============================================================================
-- SECTION 5: VIEWS FOR EASY QUERYING
-- ============================================================================

-- 5.1 View: Complete panel-workflow-runner hierarchy
CREATE OR REPLACE VIEW v_panel_workflow_runners AS
SELECT
    pw.id AS panel_workflow_id,
    pw.panel_type,
    pw.phase,
    pw.execution_order AS workflow_order,
    pw.is_required AS workflow_required,
    pw.is_default AS is_default_workflow,

    wt.id AS workflow_id,
    wt.workflow_name,
    wt.workflow_type,
    wt.workflow_category,

    ws.id AS stage_id,
    ws.stage_name,
    ws.stage_number,

    wtask.id AS task_id,
    wtask.task_code,
    wtask.task_name,
    wtask.task_type,
    wtask.task_number,

    wtr.run_code,
    wtr.execution_order AS runner_order,
    wtr.is_primary,
    wtr.fallback_run_code,
    wtr.timeout_seconds,
    wtr.max_retries,

    vr.run_name,
    vr.cat_code,
    vr.algo_core,
    vr.complexity AS runner_complexity,
    vr.min_level,
    vr.max_level,

    vrc.cat_name AS category_name,
    vrc.cat_type AS category_type

FROM panel_workflows pw
JOIN workflow_templates wt ON wt.id = pw.workflow_id
LEFT JOIN workflow_stages ws ON ws.workflow_id = wt.id
LEFT JOIN workflow_tasks wtask ON wtask.stage_id = ws.id
LEFT JOIN workflow_task_runners wtr ON wtr.task_id = wtask.id
LEFT JOIN vital_runners vr ON vr.run_code = wtr.run_code
LEFT JOIN vital_runner_categories vrc ON vrc.cat_code = vr.cat_code
ORDER BY
    pw.panel_type,
    pw.phase,
    pw.execution_order,
    ws.stage_number,
    wtask.task_number,
    wtr.execution_order;

-- 5.2 View: Task runners with full runner details
CREATE OR REPLACE VIEW v_task_runners_full AS
SELECT
    wtask.id AS task_id,
    wtask.task_code,
    wtask.task_name,
    wtask.task_type,

    ws.id AS stage_id,
    ws.stage_name,
    ws.stage_number,

    wt.id AS workflow_id,
    wt.workflow_name,

    wtr.id AS task_runner_id,
    wtr.run_code,
    wtr.execution_order,
    wtr.is_primary,
    wtr.fallback_run_code,
    wtr.runner_config,
    wtr.timeout_seconds,
    wtr.max_retries,
    wtr.condition_expression,

    vr.run_name,
    vr.run_description,
    vr.cat_code,
    vr.algo_core,
    vr.complexity,
    vr.min_level,
    vr.max_level,
    vr.default_timeout,
    vr.default_tokens,

    vrc.cat_name AS category_name,
    vrc.cat_type AS category_type,
    vrc.description AS category_description

FROM workflow_tasks wtask
JOIN workflow_stages ws ON ws.id = wtask.stage_id
JOIN workflow_templates wt ON wt.id = ws.workflow_id
LEFT JOIN workflow_task_runners wtr ON wtr.task_id = wtask.id
LEFT JOIN vital_runners vr ON vr.run_code = wtr.run_code
LEFT JOIN vital_runner_categories vrc ON vrc.cat_code = vr.cat_code
ORDER BY wt.workflow_name, ws.stage_number, wtask.task_number, wtr.execution_order;

-- 5.3 View: Panel types with their preferred runner categories
CREATE OR REPLACE VIEW v_panel_runner_preferences AS
SELECT
    prc.panel_type,
    prc.cat_code,
    vrc.cat_name,
    vrc.cat_type,
    prc.preference_weight,
    prc.is_required,
    prc.is_excluded,
    prc.usage_notes,
    COUNT(vr.run_code) AS available_runners
FROM panel_runner_categories prc
JOIN vital_runner_categories vrc ON vrc.cat_code = prc.cat_code
LEFT JOIN vital_runners vr ON vr.cat_code = prc.cat_code
GROUP BY
    prc.panel_type,
    prc.cat_code,
    vrc.cat_name,
    vrc.cat_type,
    prc.preference_weight,
    prc.is_required,
    prc.is_excluded,
    prc.usage_notes
ORDER BY prc.panel_type, prc.preference_weight DESC;

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- 6.1 Function: Get runners for a specific task
CREATE OR REPLACE FUNCTION get_task_runners(p_task_id UUID)
RETURNS TABLE (
    run_code VARCHAR(100),
    run_name VARCHAR(255),
    cat_code VARCHAR(50),
    algo_core VARCHAR(100),
    is_primary BOOLEAN,
    execution_order INTEGER,
    fallback_run_code VARCHAR(100),
    runner_config JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wtr.run_code,
        vr.run_name,
        vr.cat_code,
        vr.algo_core,
        wtr.is_primary,
        wtr.execution_order,
        wtr.fallback_run_code,
        wtr.runner_config
    FROM workflow_task_runners wtr
    JOIN vital_runners vr ON vr.run_code = wtr.run_code
    WHERE wtr.task_id = p_task_id
    ORDER BY wtr.execution_order;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6.2 Function: Get default workflow for a panel type
CREATE OR REPLACE FUNCTION get_panel_default_workflow(p_panel_type VARCHAR(50))
RETURNS UUID AS $$
DECLARE
    v_workflow_id UUID;
BEGIN
    SELECT workflow_id INTO v_workflow_id
    FROM panel_workflows
    WHERE panel_type = p_panel_type
      AND is_default = TRUE
    LIMIT 1;

    RETURN v_workflow_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6.3 Function: Get all workflows for a panel type and phase
CREATE OR REPLACE FUNCTION get_panel_workflows(
    p_panel_type VARCHAR(50),
    p_phase VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
    workflow_id UUID,
    workflow_name TEXT,
    phase VARCHAR(50),
    execution_order INTEGER,
    is_required BOOLEAN,
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pw.workflow_id,
        wt.workflow_name,
        pw.phase,
        pw.execution_order,
        pw.is_required,
        pw.is_default
    FROM panel_workflows pw
    JOIN workflow_templates wt ON wt.id = pw.workflow_id
    WHERE pw.panel_type = p_panel_type
      AND (p_phase IS NULL OR pw.phase = p_phase)
    ORDER BY pw.execution_order;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6.4 Function: Get recommended runners for a panel type
CREATE OR REPLACE FUNCTION get_panel_recommended_runners(p_panel_type VARCHAR(50))
RETURNS TABLE (
    run_code VARCHAR(100),
    run_name VARCHAR(255),
    cat_code VARCHAR(50),
    cat_name VARCHAR(255),
    preference_weight DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vr.run_code,
        vr.run_name,
        vr.cat_code,
        vrc.cat_name,
        prc.preference_weight
    FROM panel_runner_categories prc
    JOIN vital_runner_categories vrc ON vrc.cat_code = prc.cat_code
    JOIN vital_runners vr ON vr.cat_code = prc.cat_code
    WHERE prc.panel_type = p_panel_type
      AND prc.is_excluded = FALSE
    ORDER BY prc.preference_weight DESC, vr.run_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION 7: SEED DEFAULT PANEL-RUNNER CATEGORY MAPPINGS
-- ============================================================================

-- 7.1 Seed panel_runner_categories with sensible defaults
INSERT INTO panel_runner_categories (panel_type, cat_code, preference_weight, is_required, usage_notes)
VALUES
    -- OPEN panel: flexible, uses understand and create categories
    ('open', 'UNDERSTAND', 0.9, FALSE, 'Scanning and exploring topics freely'),
    ('open', 'CREATE', 0.8, FALSE, 'Drafting and formatting responses'),
    ('open', 'SYNTHESIZE', 0.7, FALSE, 'Collecting and narrating insights'),

    -- STRUCTURED panel: uses evaluate, decide, and validate
    ('structured', 'EVALUATE', 0.9, FALSE, 'Critiquing and scoring inputs'),
    ('structured', 'DECIDE', 0.8, FALSE, 'Framing and recommending options'),
    ('structured', 'VALIDATE', 0.7, FALSE, 'Checking facts and compliance'),

    -- CONSENSUS panel: uses align and synthesize
    ('consensus', 'ALIGN', 0.95, TRUE, 'Finding common ground and consensus'),
    ('consensus', 'SYNTHESIZE', 0.85, FALSE, 'Resolving conflicts and narrating'),
    ('consensus', 'INFLUENCE', 0.7, FALSE, 'Building arguments for positions'),

    -- DEBATE panel: uses influence and evaluate
    ('debate', 'INFLUENCE', 0.95, TRUE, 'Building arguments and counter-arguments'),
    ('debate', 'EVALUATE', 0.85, FALSE, 'Critiquing and comparing positions'),
    ('debate', 'DECIDE', 0.75, FALSE, 'Framing trade-offs'),

    -- REVIEW panel: uses validate and refine
    ('review', 'VALIDATE', 0.95, TRUE, 'Fact checking and compliance'),
    ('review', 'REFINE', 0.9, FALSE, 'Critiquing and verifying quality'),
    ('review', 'EVALUATE', 0.8, FALSE, 'Scoring and benchmarking'),

    -- MULTI_PHASE panel: uses plan and execute
    ('multi_phase', 'PLAN', 0.95, TRUE, 'Decomposing and scheduling phases'),
    ('multi_phase', 'EXECUTE', 0.9, FALSE, 'State transitions and actions'),
    ('multi_phase', 'WATCH', 0.8, FALSE, 'Monitoring progress and alerting')
ON CONFLICT (panel_type, cat_code) DO UPDATE SET
    preference_weight = EXCLUDED.preference_weight,
    is_required = EXCLUDED.is_required,
    usage_notes = EXCLUDED.usage_notes;

-- ============================================================================
-- SECTION 8: RLS POLICIES
-- ============================================================================

-- 8.1 Enable RLS on new tables
ALTER TABLE panel_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_task_runners ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runner_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_runner_categories ENABLE ROW LEVEL SECURITY;

-- 8.2 Create policies for panel_workflows (public read, authenticated write)
CREATE POLICY "panel_workflows_read_policy" ON panel_workflows
    FOR SELECT USING (true);

CREATE POLICY "panel_workflows_insert_policy" ON panel_workflows
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "panel_workflows_update_policy" ON panel_workflows
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "panel_workflows_delete_policy" ON panel_workflows
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8.3 Create policies for workflow_task_runners
CREATE POLICY "workflow_task_runners_read_policy" ON workflow_task_runners
    FOR SELECT USING (true);

CREATE POLICY "workflow_task_runners_insert_policy" ON workflow_task_runners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "workflow_task_runners_update_policy" ON workflow_task_runners
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "workflow_task_runners_delete_policy" ON workflow_task_runners
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8.4 Create policies for workflow_runner_categories
CREATE POLICY "workflow_runner_categories_read_policy" ON workflow_runner_categories
    FOR SELECT USING (true);

CREATE POLICY "workflow_runner_categories_insert_policy" ON workflow_runner_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8.5 Create policies for panel_runner_categories
CREATE POLICY "panel_runner_categories_read_policy" ON panel_runner_categories
    FOR SELECT USING (true);

CREATE POLICY "panel_runner_categories_insert_policy" ON panel_runner_categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- SECTION 9: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE panel_workflows IS 'Links panel types to their associated workflows. Enables routing panels to appropriate workflow templates.';
COMMENT ON TABLE workflow_task_runners IS 'Links workflow tasks to specific runners. Enables task-level runner routing and configuration.';
COMMENT ON TABLE workflow_runner_categories IS 'Workflow-level runner category preferences. Enables workflow-level runner filtering.';
COMMENT ON TABLE panel_runner_categories IS 'Panel type to runner category affinity mapping. Enables panel-type-specific runner recommendations.';

COMMENT ON VIEW v_panel_workflow_runners IS 'Complete denormalized view of panel → workflow → task → runner hierarchy';
COMMENT ON VIEW v_task_runners_full IS 'Task runners with full runner and category details';
COMMENT ON VIEW v_panel_runner_preferences IS 'Panel types with their preferred runner categories and available runner counts';

COMMENT ON FUNCTION get_task_runners IS 'Returns all runners configured for a specific task';
COMMENT ON FUNCTION get_panel_default_workflow IS 'Returns the default workflow ID for a panel type';
COMMENT ON FUNCTION get_panel_workflows IS 'Returns all workflows for a panel type, optionally filtered by phase';
COMMENT ON FUNCTION get_panel_recommended_runners IS 'Returns recommended runners for a panel type based on category preferences';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
