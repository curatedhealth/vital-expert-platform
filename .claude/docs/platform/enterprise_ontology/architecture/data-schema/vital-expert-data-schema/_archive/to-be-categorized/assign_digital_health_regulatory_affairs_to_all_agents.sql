-- ============================================================================
-- Assign Digital Health and Regulatory Affairs RAG Domains to ALL Agents
-- ============================================================================
-- Purpose: Assign Digital Health and Regulatory Affairs knowledge domains
--          to all existing agents in the system by updating the knowledge_domains
--          TEXT[] column on the agents table
-- Created: 2025-01-XX
-- ============================================================================

DO $$
DECLARE
  -- Agent tracking
  v_agent_count INTEGER;
  v_updated_count INTEGER;
  v_digital_health_count INTEGER;
  v_regulatory_affairs_count INTEGER;
  v_both_count INTEGER;
  v_column_exists BOOLEAN;
  v_has_metadata BOOLEAN;
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Assigning Digital Health and Regulatory Affairs RAG Domains to ALL Agents';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';

  -- ============================================================================
  -- STEP 0: Check if knowledge_domains column exists, create if needed
  -- ============================================================================
  RAISE NOTICE 'Step 0: Checking for knowledge_domains column...';
  
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'knowledge_domains'
  ) INTO v_column_exists;
  
  IF NOT v_column_exists THEN
    RAISE NOTICE '  knowledge_domains column does not exist. Creating it...';
    ALTER TABLE agents ADD COLUMN knowledge_domains TEXT[];
    CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);
    RAISE NOTICE '  ✓ Created knowledge_domains column as TEXT[]';
  ELSE
    RAISE NOTICE '  ✓ knowledge_domains column exists';
  END IF;

  -- Check if metadata column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'agents'
      AND column_name = 'metadata'
  ) INTO v_has_metadata;

  -- ============================================================================
  -- STEP 1: Get Count of All Agents
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1: Getting all existing agents...';
  
  SELECT COUNT(*) INTO v_agent_count
  FROM agents;
  
  RAISE NOTICE '  Found % total agents', v_agent_count;
  
  IF v_agent_count = 0 THEN
    RAISE WARNING '  ⚠ No agents found in the database. Exiting.';
    RETURN;
  END IF;

  -- ============================================================================
  -- STEP 2: Update agents to include Digital Health and Regulatory Affairs
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE 'Step 2: Updating agents knowledge_domains array...';
  
  UPDATE agents
  SET 
    knowledge_domains = (
      -- Start with existing domains (or empty array if null)
      SELECT ARRAY(
        SELECT DISTINCT domain 
        FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain
        WHERE domain IS NOT NULL
      )
      -- Add Digital Health if not present (check various formats)
      || CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
          WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
        ) THEN ARRAY['Digital Health']::TEXT[]
        ELSE ARRAY[]::TEXT[]
      END
      -- Add Regulatory Affairs if not present (check various formats)
      || CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
          WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
        ) THEN ARRAY['Regulatory Affairs']::TEXT[]
        ELSE ARRAY[]::TEXT[]
      END
    ),
    updated_at = NOW()
  WHERE 
    -- Only update agents that don't have both domains
    (
      NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
        WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
      )
      OR NOT EXISTS (
        SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
        WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
      )
      OR knowledge_domains IS NULL
    );
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '  ✓ Updated % agents', v_updated_count;
  
  -- Also update metadata if it exists and contains knowledge_domains
  IF v_has_metadata THEN
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2b: Updating metadata.knowledge_domains (if present)...';
    
    UPDATE agents
    SET 
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{knowledge_domains}',
        (
          SELECT jsonb_agg(DISTINCT domain_value ORDER BY domain_value)
          FROM (
            -- Get existing domains from metadata
            SELECT jsonb_array_elements_text(
              COALESCE(metadata->'knowledge_domains', '[]'::jsonb)
            ) AS domain_value
            UNION ALL
            -- Always add "Digital Health" (distinct will remove duplicates)
            SELECT 'Digital Health'::text AS domain_value
            UNION ALL
            -- Always add "Regulatory Affairs" (distinct will remove duplicates)
            SELECT 'Regulatory Affairs'::text AS domain_value
          ) AS all_domains
        )
      ),
      updated_at = NOW()
    WHERE metadata IS NOT NULL OR metadata IS NULL; -- Update all agents
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Updated metadata for % agents', v_updated_count;
  END IF;

  -- ============================================================================
  -- STEP 3: Update agent_knowledge_domains join table (if it exists)
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE 'Step 3: Updating agent_knowledge_domains join table...';
  
  -- Check if table exists and update for Digital Health
  BEGIN
    INSERT INTO agent_knowledge_domains (agent_id, domain_name, expertise_level)
    SELECT 
      a.id,
      'Digital Health',
      3 -- High expertise level
    FROM agents a
    WHERE 
      NOT EXISTS (
        SELECT 1 
        FROM agent_knowledge_domains akd 
        WHERE akd.agent_id = a.id 
        AND LOWER(akd.domain_name) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
      );
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Added Digital Health to % agent_knowledge_domains records', v_updated_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '  ⚠ agent_knowledge_domains table does not exist, skipping...';
  END;

  -- Update for Regulatory Affairs
  BEGIN
    INSERT INTO agent_knowledge_domains (agent_id, domain_name, expertise_level)
    SELECT 
      a.id,
      'Regulatory Affairs',
      3 -- High expertise level
    FROM agents a
    WHERE 
      NOT EXISTS (
        SELECT 1 
        FROM agent_knowledge_domains akd 
        WHERE akd.agent_id = a.id 
        AND LOWER(akd.domain_name) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
      );
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Added Regulatory Affairs to % agent_knowledge_domains records', v_updated_count;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '  ⚠ agent_knowledge_domains table does not exist, skipping...';
  END;

  -- ============================================================================
  -- STEP 4: Verification and Summary
  -- ============================================================================
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'VERIFICATION SUMMARY';
  RAISE NOTICE '============================================================================';
  
  -- Count agents with Digital Health
  SELECT COUNT(*) INTO v_digital_health_count
  FROM agents
  WHERE EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
  );
  
  RAISE NOTICE 'Agents with Digital Health: % / %', v_digital_health_count, v_agent_count;
  
  -- Count agents with Regulatory Affairs
  SELECT COUNT(*) INTO v_regulatory_affairs_count
  FROM agents
  WHERE EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
  );
  
  RAISE NOTICE 'Agents with Regulatory Affairs: % / %', v_regulatory_affairs_count, v_agent_count;
  
  -- Count agents with both domains
  SELECT COUNT(*) INTO v_both_count
  FROM agents
  WHERE EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
  )
  AND EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
  );
  
  RAISE NOTICE 'Agents with BOTH domains: % / %', v_both_count, v_agent_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✓ Assignment Complete!';
  RAISE NOTICE '============================================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error assigning RAG domains to agents: %', SQLERRM;
END $$;

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

-- Show summary statistics
SELECT 
  'Assignment Statistics' as info,
  COUNT(*) as total_agents,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
    )
  ) as agents_with_digital_health,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
    )
  ) as agents_with_regulatory_affairs,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
    )
    AND EXISTS (
      SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
      WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
    )
  ) as agents_with_both_domains,
  COUNT(*) FILTER (WHERE knowledge_domains IS NULL) as agents_without_domains
FROM agents;

-- Show sample agents with their knowledge domains
SELECT 
  'Sample Agents with Knowledge Domains' as info,
  id,
  name,
  knowledge_domains,
  array_length(knowledge_domains, 1) as domain_count
FROM agents
WHERE 
  EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('digital health', 'digital-health', 'digital_health', 'digitalhealth')
  )
  OR EXISTS (
    SELECT 1 FROM unnest(COALESCE(knowledge_domains, ARRAY[]::TEXT[])) AS domain 
    WHERE LOWER(domain) IN ('regulatory affairs', 'regulatory-affairs', 'regulatory_affairs', 'regulatoryaffairs')
  )
ORDER BY name
LIMIT 20;

