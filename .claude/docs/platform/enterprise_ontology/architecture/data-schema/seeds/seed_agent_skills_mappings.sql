-- =====================================================================================
-- Seed Agent Skills Mappings
-- =====================================================================================
-- Purpose: Map agents to their core skills
-- Strategy: 
--   - Masters: Strategic, Leadership, Cross-functional skills
--   - Experts: Domain expertise, Analysis, Coordination skills
--   - Specialists: Specialized execution, Tactical skills
--   - Workers: Task execution, Support skills
--   - Tools: Atomic, Single-function skills
-- =====================================================================================

DO $$
DECLARE
    v_agent RECORD;
    v_skill_id UUID;
    v_insert_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Creating Agent Skills Mappings ===';

    -- ========================================
    -- Level 1 (Masters) - Strategic Skills
    -- ========================================
    
    -- Create core strategic skills
    FOR v_agent IN 
        SELECT a.id, a.name, a.department_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 1
    LOOP
        -- Strategic Planning
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Strategic Planning', 'cognitive', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Leadership
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Leadership & Team Management', 'interpersonal', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Cross-functional Coordination
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Cross-functional Coordination', 'interpersonal', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Budget Management
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Budget & Resource Management', 'business', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Stakeholder Management
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Stakeholder Management', 'interpersonal', 'expert')
        ON CONFLICT DO NOTHING;
        
        v_insert_count := v_insert_count + 5;
    END LOOP;
    
    RAISE NOTICE '✓ Mapped strategic skills for % Master agents', v_insert_count / 5;

    -- ========================================
    -- Level 2 (Experts) - Domain Expertise
    -- ========================================
    
    v_insert_count := 0;
    
    FOR v_agent IN 
        SELECT a.id, a.name, a.department_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 2
    LOOP
        -- Domain Expertise (department-specific)
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, v_agent.department_name || ' Expertise', 'technical', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Analysis & Problem Solving
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Advanced Analysis & Problem Solving', 'cognitive', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Project Management
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Project Management', 'business', 'advanced')
        ON CONFLICT DO NOTHING;
        
        -- Scientific Communication
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Scientific Communication', 'communication', 'expert')
        ON CONFLICT DO NOTHING;
        
        -- Regulatory Knowledge
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Regulatory Compliance', 'technical', 'advanced')
        ON CONFLICT DO NOTHING;
        
        v_insert_count := v_insert_count + 5;
    END LOOP;
    
    RAISE NOTICE '✓ Mapped domain skills for % Expert agents', v_insert_count / 5;

    -- ========================================
    -- Level 3 (Specialists) - Specialized Skills
    -- ========================================
    
    v_insert_count := 0;
    
    FOR v_agent IN 
        SELECT a.id, a.name, a.role_name
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 3
    LOOP
        -- Specialized Execution
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Specialized Task Execution', 'technical', 'advanced')
        ON CONFLICT DO NOTHING;
        
        -- Data Analysis
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Data Analysis', 'analytical', 'intermediate')
        ON CONFLICT DO NOTHING;
        
        -- Documentation
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, 'Documentation & Reporting', 'communication', 'advanced')
        ON CONFLICT DO NOTHING;
        
        v_insert_count := v_insert_count + 3;
    END LOOP;
    
    RAISE NOTICE '✓ Mapped specialized skills for % Specialist agents', v_insert_count / 3;

    -- ========================================
    -- Level 4 (Workers) - Task Execution Skills
    -- ========================================
    
    v_insert_count := 0;
    
    FOR v_agent IN 
        SELECT a.id, a.name, a.slug
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 4
    LOOP
        -- Assign skills based on worker type
        IF a.slug LIKE '%search%' OR a.slug LIKE '%literature%' THEN
            INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
            VALUES (v_agent.id, 'Information Retrieval', 'technical', 'expert')
            ON CONFLICT DO NOTHING;
        ELSIF a.slug LIKE '%data%' OR a.slug LIKE '%extraction%' THEN
            INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
            VALUES (v_agent.id, 'Data Processing', 'technical', 'expert')
            ON CONFLICT DO NOTHING;
        ELSIF a.slug LIKE '%compliance%' OR a.slug LIKE '%adverse%' THEN
            INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
            VALUES (v_agent.id, 'Compliance Monitoring', 'technical', 'expert')
            ON CONFLICT DO NOTHING;
        ELSIF a.slug LIKE '%slide%' OR a.slug LIKE '%report%' OR a.slug LIKE '%email%' THEN
            INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
            VALUES (v_agent.id, 'Content Creation', 'communication', 'expert')
            ON CONFLICT DO NOTHING;
        ELSE
            INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
            VALUES (v_agent.id, 'Task Automation', 'technical', 'expert')
            ON CONFLICT DO NOTHING;
        END IF;
        
        v_insert_count := v_insert_count + 1;
    END LOOP;
    
    RAISE NOTICE '✓ Mapped task skills for % Worker agents', v_insert_count;

    -- ========================================
    -- Level 5 (Tools) - Atomic Skills
    -- ========================================
    
    v_insert_count := 0;
    
    FOR v_agent IN 
        SELECT a.id, a.name, a.slug
        FROM agents a
        JOIN agent_levels al ON a.agent_level_id = al.id
        WHERE al.level_number = 5
    LOOP
        -- Each tool has one atomic skill matching its function
        INSERT INTO agent_skills (agent_id, skill_name, skill_type, proficiency_level)
        VALUES (v_agent.id, REPLACE(REPLACE(a.name, ' Tool', ''), ' Agent', ''), 'technical', 'expert')
        ON CONFLICT DO NOTHING;
        
        v_insert_count := v_insert_count + 1;
    END LOOP;
    
    RAISE NOTICE '✓ Mapped atomic skills for % Tool agents', v_insert_count;

    RAISE NOTICE '=== ✅ Agent Skills Mapping Complete ===';

END $$;

-- Verification
SELECT 
    al.name as level,
    COUNT(DISTINCT ags.agent_id) as agents_with_skills,
    COUNT(ags.id) as total_skill_mappings,
    ROUND(AVG(skill_count.count), 1) as avg_skills_per_agent
FROM agent_levels al
JOIN agents a ON a.agent_level_id = al.id
LEFT JOIN agent_skills ags ON ags.agent_id = a.id
LEFT JOIN (
    SELECT agent_id, COUNT(*) as count
    FROM agent_skills
    GROUP BY agent_id
) skill_count ON skill_count.agent_id = a.id
GROUP BY al.name, al.level_number
ORDER BY al.level_number;

