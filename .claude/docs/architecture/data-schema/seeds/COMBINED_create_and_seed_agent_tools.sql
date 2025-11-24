-- ============================================================================
-- COMBINED: Create Agent-Tool Table + Seed Mappings
-- This file does everything in the correct order
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TABLE
-- ============================================================================

-- Create agent_tool_assignments table
CREATE TABLE IF NOT EXISTS public.agent_tool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,

  -- Assignment configuration
  is_enabled BOOLEAN DEFAULT TRUE,
  auto_use BOOLEAN DEFAULT FALSE,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,

  -- Usage limits
  max_uses_per_conversation INTEGER,
  max_uses_per_day INTEGER,
  current_day_usage INTEGER DEFAULT 0,

  -- Performance tracking
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_user_satisfaction DECIMAL(3, 2),

  -- Metadata
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (agent_id, tool_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_agent ON public.agent_tool_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_tool ON public.agent_tool_assignments(tool_id);
CREATE INDEX IF NOT EXISTS idx_agent_tool_assignments_enabled ON public.agent_tool_assignments(is_enabled);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_agent_tool_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_agent_tool_assignments_updated_at ON public.agent_tool_assignments;
CREATE TRIGGER trigger_update_agent_tool_assignments_updated_at
  BEFORE UPDATE ON public.agent_tool_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_tool_assignments_updated_at();

-- Verify table created
DO $$
BEGIN
    RAISE NOTICE '✅ Table agent_tool_assignments created successfully';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- PART 2: SEED DATA
-- ============================================================================

DO $$
DECLARE
    v_mapped_count INTEGER := 0;
    v_total_mapped INTEGER := 0;
BEGIN
    RAISE NOTICE '🔧 Starting Agent-to-Tools Mapping...';
    RAISE NOTICE '';

    -- ========================================================================
    -- LEVEL 1: MASTER AGENTS (9 agents) - ALL tools
    -- ========================================================================
    RAISE NOTICE '📊 Level 1 (Masters): Mapping ALL tools...';
    
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        false,
        10
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    CROSS JOIN tools t
    WHERE al.level_number = 1
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 1: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 2: EXPERT AGENTS (45 agents) - Research & Evidence tools
    -- ========================================================================
    RAISE NOTICE '📊 Level 2 (Experts): Mapping by category...';
    
    -- Research & Evidence tools
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Evidence Research', 'Medical Research', 'Research')
        OR t.name ILIKE '%pubmed%'
        OR t.name ILIKE '%clinical trial%'
        OR t.name ILIKE '%evidence%'
    )
    WHERE al.level_number = 2
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  ├─ Research tools: % assignments', v_mapped_count;
    
    -- Regulatory tools
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Regulatory & Standards', 'Regulatory', 'Compliance')
        OR t.name ILIKE '%fda%'
        OR t.name ILIKE '%ema%'
        OR t.name ILIKE '%regulatory%'
        OR t.name ILIKE '%guideline%'
    )
    WHERE al.level_number = 2
        AND (
            a.department_name ILIKE '%compliance%'
            OR a.department_name ILIKE '%regulatory%'
            OR a.department_name ILIKE '%excellence%'
            OR a.department_name ILIKE '%clinical%'
        )
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  ├─ Regulatory tools: % assignments', v_mapped_count;
    
    -- Knowledge & General tools
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        8
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.category IN ('Knowledge Management', 'Computation', 'General Research')
        OR t.name ILIKE '%knowledge%'
        OR t.name ILIKE '%calculator%'
        OR t.name ILIKE '%search%'
    )
    WHERE al.level_number = 2
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '  └─ Knowledge tools: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 3: SPECIALIST AGENTS (43 agents) - Focused tools
    -- ========================================================================
    RAISE NOTICE '📊 Level 3 (Specialists): Mapping focused tools...';
    
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        6
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON (
        t.name ILIKE '%pubmed%'
        OR t.name ILIKE '%clinical trial%'
        OR t.name ILIKE '%knowledge%'
    )
    WHERE al.level_number = 3
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 3: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 4: WORKER AGENTS (18 agents) - Minimal tools
    -- ========================================================================
    RAISE NOTICE '📊 Level 4 (Workers): Mapping minimal tools...';
    
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        4
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.name ILIKE '%knowledge%'
    WHERE al.level_number = 4
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 4: % assignments', v_mapped_count;

    -- ========================================================================
    -- LEVEL 5: TOOL AGENTS (50 agents) - Single tool each
    -- ========================================================================
    RAISE NOTICE '📊 Level 5 (Tool Agents): Mapping single tools...';
    
    -- Give all tool agents at least knowledge base
    INSERT INTO agent_tool_assignments (agent_id, tool_id, is_enabled, auto_use, priority)
    SELECT 
        a.id,
        t.id,
        true,
        true,
        2
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    JOIN tools t ON t.name ILIKE '%knowledge%'
    WHERE al.level_number = 5
        AND a.deleted_at IS NULL
        AND t.is_active = true
        AND t.deleted_at IS NULL
    ON CONFLICT (agent_id, tool_id) DO NOTHING;
    
    GET DIAGNOSTICS v_mapped_count = ROW_COUNT;
    v_total_mapped := v_total_mapped + v_mapped_count;
    RAISE NOTICE '✅ Level 5: % assignments', v_mapped_count;

    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOTAL MAPPINGS CREATED: %', v_total_mapped;
    RAISE NOTICE '';

END $$;

-- ============================================================================
-- PART 3: VERIFICATION
-- ============================================================================

-- Summary by level
SELECT 
    '=== SUMMARY BY AGENT LEVEL ===' as section,
    al.name as level_name,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(ata.id) as total_assignments,
    COALESCE(ROUND(AVG(tool_count), 1), 0) as avg_tools_per_agent
FROM agent_levels al
LEFT JOIN agents a ON a.agent_level_id = al.id AND a.deleted_at IS NULL
LEFT JOIN agent_tool_assignments ata ON ata.agent_id = a.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as tool_count
    FROM agent_tool_assignments
    WHERE agent_id = a.id
) tc ON true
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

-- Final summary
SELECT 
    '=== FINAL SUMMARY ===' as section,
    (SELECT COUNT(*) FROM agents WHERE deleted_at IS NULL) as total_agents,
    COUNT(DISTINCT ata.agent_id) as agents_with_tools,
    COUNT(DISTINCT ata.tool_id) as unique_tools_used,
    COUNT(*) as total_assignments
FROM agent_tool_assignments ata;

