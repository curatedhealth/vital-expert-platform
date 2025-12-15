-- ==========================================
-- FILE: phase5_routing_policies.sql
-- PURPOSE: Create data-driven routing and policy tables for agent selection and orchestration
-- PHASE: 5 of 9 - Routing Policies & Control Plane
-- DEPENDENCIES: agents, agent_graphs tables
-- GOLDEN RULES: Data-driven routing, no hardcoded agent selection
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 5: ROUTING POLICIES & CONTROL PLANE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 1: CREATE ROUTING POLICIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS routing_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Policy Type
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'intent_based', 'capability_based', 'semantic_match', 
        'tier_based', 'load_balanced', 'round_robin', 'custom'
    )),
    
    -- Routing Logic
    routing_strategy TEXT,
    fallback_strategy TEXT CHECK (fallback_strategy IN ('default_agent', 'escalate', 'fail_gracefully', 'human_handoff')),
    default_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Constraints
    min_confidence_threshold NUMERIC(3,2) DEFAULT 0.5 CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 1),
    max_response_time_ms INTEGER DEFAULT 30000,
    require_capability_match BOOLEAN DEFAULT true,
    require_domain_match BOOLEAN DEFAULT false,
    
    -- Priority & Load Balancing
    priority_order INTEGER DEFAULT 50,
    enable_load_balancing BOOLEAN DEFAULT false,
    max_concurrent_requests INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

COMMENT ON TABLE routing_policies IS 'Data-driven policies for agent routing and selection';

DO $$
BEGIN
    RAISE NOTICE '✓ Created routing_policies table';
END $$;

-- ==========================================
-- SECTION 2: CREATE ROUTING RULES
-- ==========================================

CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES routing_policies(id) ON DELETE CASCADE,
    
    -- Rule definition
    rule_name TEXT NOT NULL,
    rule_order INTEGER NOT NULL,
    
    -- Condition
    condition_type TEXT CHECK (condition_type IN ('keyword_match', 'intent_match', 'semantic_similarity', 'capability_required', 'custom')),
    condition_value TEXT NOT NULL,
    
    -- Action
    target_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    target_graph_id UUID REFERENCES agent_graphs(id) ON DELETE SET NULL,
    weight NUMERIC(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(policy_id, rule_order)
);

COMMENT ON TABLE routing_rules IS 'Individual routing rules with conditions and targets';

DO $$
BEGIN
    RAISE NOTICE '✓ Created routing_rules table';
END $$;

-- ==========================================
-- SECTION 3: CREATE AGENT ROUTING ELIGIBILITY
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_routing_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    routing_policy_id UUID NOT NULL REFERENCES routing_policies(id) ON DELETE CASCADE,
    
    -- Eligibility
    is_eligible BOOLEAN DEFAULT true,
    priority_boost INTEGER DEFAULT 0,
    
    -- Constraints
    max_concurrent_requests INTEGER,
    rate_limit_per_minute INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, routing_policy_id)
);

COMMENT ON TABLE agent_routing_eligibility IS 'Agent eligibility and constraints per routing policy';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_routing_eligibility table';
END $$;

-- ==========================================
-- SECTION 4: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- Creating Indexes ---';
END $$;

CREATE INDEX IF NOT EXISTS idx_routing_policies_tenant ON routing_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_routing_policies_type ON routing_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_routing_policies_active ON routing_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_routing_policies_slug ON routing_policies(slug);

CREATE INDEX IF NOT EXISTS idx_routing_rules_policy ON routing_rules(policy_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_order ON routing_rules(rule_order);
CREATE INDEX IF NOT EXISTS idx_routing_rules_target_agent ON routing_rules(target_agent_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_active ON routing_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_agent_routing_eligibility_agent ON agent_routing_eligibility(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_routing_eligibility_policy ON agent_routing_eligibility(routing_policy_id);
CREATE INDEX IF NOT EXISTS idx_agent_routing_eligibility_eligible ON agent_routing_eligibility(is_eligible);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    policy_count INTEGER;
    rule_count INTEGER;
    eligibility_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM routing_policies;
    SELECT COUNT(*) INTO rule_count FROM routing_rules;
    SELECT COUNT(*) INTO eligibility_count FROM agent_routing_eligibility;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 5 COMPLETE ===';
    RAISE NOTICE 'Routing policies: %', policy_count;
    RAISE NOTICE 'Routing rules: %', rule_count;
    RAISE NOTICE 'Agent eligibility records: %', eligibility_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 5 COMPLETE: ROUTING POLICIES & CONTROL PLANE';
    RAISE NOTICE '=================================================================';
END $$;

SELECT 
    'Routing Policies' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM routing_policies
UNION ALL
SELECT 'Routing Rules', COUNT(*), COUNT(*) FILTER (WHERE is_active = true)
FROM routing_rules
UNION ALL
SELECT 'Agent Routing Eligibility', COUNT(*), COUNT(*) FILTER (WHERE is_eligible = true)
FROM agent_routing_eligibility;

