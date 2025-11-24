-- =====================================================================================
-- Agent Hierarchy Mappings
-- =====================================================================================
-- Purpose: Map hierarchical relationships between agents across levels
-- 
-- Hierarchy Pattern:
--   Level 1 (Masters)     → Delegates to → Level 2 (Experts)
--   Level 2 (Experts)     → Delegates to → Level 3 (Specialists)
--   Level 3 (Specialists) → Delegates to → Level 4 (Workers)
--   Level 2 (Experts)     → Delegates to → Level 4 (Workers) (direct)
--   Level 1 (Masters)     → Delegates to → Level 4 (Workers) (strategic)
--
-- Relationship Types:
--   - 'delegates_to': Strategic delegation (L1→L2, L2→L3, L1/L2/L3→L4)
--   - 'supervises': Direct management oversight
--   - 'collaborates_with': Peer collaboration (within same level)
--   - 'consults': Advisory relationships
--   - 'escalates_to': Escalation pathways
-- =====================================================================================

DO $$
DECLARE
    v_master_record RECORD;
    v_expert_record RECORD;
    v_specialist_record RECORD;
    v_worker_id UUID;
    
    v_insert_count INTEGER := 0;
BEGIN

    RAISE NOTICE '=== Starting Agent Hierarchy Mappings ===';

    -- ========================================
    -- Step 1: L1 (Masters) → L2 (Experts)
    -- ========================================
    -- Each Master (Department Head) delegates to Experts in their department
    
    RAISE NOTICE 'Mapping L1 Masters to L2 Experts (by department)...';
    
    FOR v_master_record IN 
        SELECT a.id as master_id, a.name as master_name, a.department_id
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
    LOOP
        -- Find all Experts in the same department
        FOR v_expert_record IN
            SELECT a.id as expert_id, a.name as expert_name
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE al.level_number = 2
            AND a.department_id = v_master_record.department_id
        LOOP
            INSERT INTO agent_hierarchies (
                parent_agent_id,
                child_agent_id,
                relationship_type,
                delegation_trigger,
                auto_delegate,
                confidence_threshold
            ) VALUES (
                v_master_record.master_id,
                v_expert_record.expert_id,
                'delegates_to',
                'Delegate when query requires deep expertise in ' || v_expert_record.expert_name || ' domain',
                true,
                0.75
            );
            
            v_insert_count := v_insert_count + 1;
        END LOOP;
        
        RAISE NOTICE '  ✓ Mapped Master "%" to Experts in department', v_master_record.master_name;
    END LOOP;
    
    RAISE NOTICE '✓ Completed L1→L2 mappings: % relationships', v_insert_count;

    -- ========================================
    -- Step 2: L2 (Experts) → L3 (Specialists)
    -- ========================================
    -- Each Expert delegates to Specialists in their department
    
    v_insert_count := 0;
    RAISE NOTICE 'Mapping L2 Experts to L3 Specialists (by department)...';
    
    FOR v_expert_record IN 
        SELECT a.id as expert_id, a.name as expert_name, a.department_id, a.role_id
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
    LOOP
        -- Find all Specialists in the same department
        FOR v_specialist_record IN
            SELECT a.id as specialist_id, a.name as specialist_name, a.role_name
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE al.level_number = 3
            AND a.department_id = v_expert_record.department_id
        LOOP
            INSERT INTO agent_hierarchies (
                parent_agent_id,
                child_agent_id,
                relationship_type,
                delegation_trigger,
                auto_delegate,
                confidence_threshold
            ) VALUES (
                v_expert_record.expert_id,
                v_specialist_record.specialist_id,
                'delegates_to',
                'Delegate for specialized ' || v_specialist_record.role_name || ' tasks',
                true,
                0.70
            );
            
            v_insert_count := v_insert_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✓ Completed L2→L3 mappings: % relationships', v_insert_count;

    -- ========================================
    -- Step 3: L3 (Specialists) → L4 (Workers)
    -- ========================================
    -- All Specialists can use ALL Worker agents (universal workers)
    
    v_insert_count := 0;
    RAISE NOTICE 'Mapping L3 Specialists to L4 Workers (universal access)...';
    
    FOR v_specialist_record IN 
        SELECT a.id as specialist_id, a.name as specialist_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 3
    LOOP
        -- Map to ALL Worker agents
        FOR v_worker_id IN
            SELECT a.id
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE al.level_number = 4
        LOOP
            INSERT INTO agent_hierarchies (
                parent_agent_id,
                child_agent_id,
                relationship_type,
                delegation_trigger,
                auto_delegate,
                confidence_threshold
            ) VALUES (
                v_specialist_record.specialist_id,
                v_worker_id,
                'delegates_to',
                'Delegate to worker agent for specific task execution',
                false,  -- Manual selection for workers
                0.60
            );
            
            v_insert_count := v_insert_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✓ Completed L3→L4 mappings: % relationships', v_insert_count;

    -- ========================================
    -- Step 4: L2 (Experts) → L4 (Workers)
    -- ========================================
    -- Experts can also directly use Worker agents
    
    v_insert_count := 0;
    RAISE NOTICE 'Mapping L2 Experts to L4 Workers (direct access)...';
    
    FOR v_expert_record IN 
        SELECT a.id as expert_id, a.name as expert_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
    LOOP
        -- Map to ALL Worker agents
        FOR v_worker_id IN
            SELECT a.id
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE al.level_number = 4
        LOOP
            INSERT INTO agent_hierarchies (
                parent_agent_id,
                child_agent_id,
                relationship_type,
                delegation_trigger,
                auto_delegate,
                confidence_threshold
            ) VALUES (
                v_expert_record.expert_id,
                v_worker_id,
                'delegates_to',
                'Expert directly delegates to worker for hands-on execution',
                false,
                0.65
            );
            
            v_insert_count := v_insert_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✓ Completed L2→L4 mappings: % relationships', v_insert_count;

    -- ========================================
    -- Step 5: L1 (Masters) → L4 (Workers)
    -- ========================================
    -- Masters can also directly use Worker agents for strategic tasks
    
    v_insert_count := 0;
    RAISE NOTICE 'Mapping L1 Masters to L4 Workers (strategic access)...';
    
    FOR v_master_record IN 
        SELECT a.id as master_id, a.name as master_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
    LOOP
        -- Map to ALL Worker agents
        FOR v_worker_id IN
            SELECT a.id
            FROM agents a
            JOIN agent_levels al ON a.agent_level_id = al.id
            WHERE al.level_number = 4
        LOOP
            INSERT INTO agent_hierarchies (
                parent_agent_id,
                child_agent_id,
                relationship_type,
                delegation_trigger,
                auto_delegate,
                confidence_threshold
            ) VALUES (
                v_master_record.master_id,
                v_worker_id,
                'delegates_to',
                'Master delegates to worker for strategic oversight tasks',
                false,
                0.70
            );
            
            v_insert_count := v_insert_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '✓ Completed L1→L4 mappings: % relationships', v_insert_count;

    RAISE NOTICE '=== ✅ Agent Hierarchy Mappings Complete ===';

END $$;

-- =====================================================================================
-- Verification Queries
-- =====================================================================================

-- Summary by Relationship Type
SELECT 
    relationship_type,
    COUNT(*) as total_relationships,
    COUNT(DISTINCT parent_agent_id) as unique_parents,
    COUNT(DISTINCT child_agent_id) as unique_children,
    ROUND(AVG(confidence_threshold), 2) as avg_confidence
FROM agent_hierarchies
GROUP BY relationship_type
ORDER BY total_relationships DESC;

-- Hierarchy Depth Analysis
WITH RECURSIVE agent_hierarchy_tree AS (
    -- Base case: Level 1 Masters
    SELECT 
        a.id as agent_id,
        a.name as agent_name,
        al.level_number,
        0 as depth,
        a.id::text as path
    FROM agents a
    JOIN agent_levels al ON a.agent_level_id = al.id
    WHERE al.level_number = 1
    
    UNION ALL
    
    -- Recursive case: Follow hierarchy
    SELECT 
        child.id,
        child.name,
        child_level.level_number,
        aht.depth + 1,
        aht.path || ' → ' || child.id::text
    FROM agent_hierarchy_tree aht
    JOIN agent_hierarchies ah ON ah.parent_agent_id = aht.agent_id
    JOIN agents child ON child.id = ah.child_agent_id
    JOIN agent_levels child_level ON child_level.id = child.agent_level_id
    WHERE aht.depth < 5  -- Prevent infinite loops
)
SELECT 
    level_number,
    COUNT(DISTINCT agent_id) as agents_at_level,
    ROUND(AVG(depth), 1) as avg_hierarchy_depth,
    MAX(depth) as max_depth
FROM agent_hierarchy_tree
GROUP BY level_number
ORDER BY level_number;

-- Most Connected Agents
SELECT 
    parent.name as parent_agent,
    parent_level.name as parent_level,
    COUNT(ah.child_agent_id) as direct_reports,
    STRING_AGG(DISTINCT child_level.name, ', ') as delegates_to_levels
FROM agent_hierarchies ah
JOIN agents parent ON parent.id = ah.parent_agent_id
JOIN agents child ON child.id = ah.child_agent_id
JOIN agent_levels parent_level ON parent_level.id = parent.agent_level_id
JOIN agent_levels child_level ON child_level.id = child.agent_level_id
GROUP BY parent.name, parent_level.name
ORDER BY direct_reports DESC
LIMIT 20;

-- Department Hierarchy Coverage
SELECT 
    d.name as department,
    COUNT(DISTINCT CASE WHEN al.level_number = 1 THEN a.id END) as masters,
    COUNT(DISTINCT CASE WHEN al.level_number = 2 THEN a.id END) as experts,
    COUNT(DISTINCT CASE WHEN al.level_number = 3 THEN a.id END) as specialists,
    COUNT(DISTINCT ah.id) as total_hierarchy_relationships
FROM org_departments d
LEFT JOIN agents a ON a.department_id = d.id
LEFT JOIN agent_levels al ON al.id = a.agent_level_id
LEFT JOIN agent_hierarchies ah ON ah.parent_agent_id = a.id OR ah.child_agent_id = a.id
WHERE d.function_id = '06127088-4d52-40aa-88c9-93f4e79e085a'  -- Medical Affairs
GROUP BY d.name
ORDER BY masters DESC, experts DESC;

