-- =====================================================
-- Cleanup Duplicate Master Agents
-- =====================================================
-- Removes old 5 Master Agents, keeps the 9 department-based ones
-- =====================================================

DO $$
DECLARE
    v_agent_level_master UUID;
    v_deleted_count INTEGER := 0;
BEGIN
    -- Get Master agent level ID
    SELECT id INTO v_agent_level_master FROM agent_levels WHERE slug = 'master' LIMIT 1;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cleaning up duplicate Master Agents';
    RAISE NOTICE '========================================';
    
    -- Delete duplicates by slug (keep the most recently created one)
    WITH duplicates AS (
        SELECT 
            id,
            slug,
            ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at DESC) as rn
        FROM agents
        WHERE agent_level_id = v_agent_level_master
          AND deleted_at IS NULL
    )
    DELETE FROM agents
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % duplicate Master Agents', v_deleted_count;
    
    -- Also delete the old agents by specific slugs that don't match our new naming
    DELETE FROM agents
    WHERE agent_level_id = v_agent_level_master
      AND slug IN (
          'medical-affairs-strategy-master',  -- Old, keep 'medical-leadership-master'
          'clinical-operations-master',        -- Old, keep 'clinical-operations-support-master'
          'evidence-heor-strategy-master',     -- Old, keep 'heor-evidence-master'
          'field-medical-operations-master'    -- Old, keep 'field-medical-master'
      )
      AND deleted_at IS NULL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % old Master Agents with outdated naming', v_deleted_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cleanup complete!';
    RAISE NOTICE '========================================';
    
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

-- Show remaining Master Agents (should be exactly 9)
SELECT 
    'Master Agents (Department Heads)' as summary,
    COUNT(*) as total_count
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'master'
  AND a.deleted_at IS NULL;

-- Detailed list
SELECT 
    a.name,
    a.slug,
    a.department_name,
    a.role_name,
    a.created_at
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE al.slug = 'master'
  AND a.deleted_at IS NULL
ORDER BY a.department_name;

