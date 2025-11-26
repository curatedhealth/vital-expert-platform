-- ============================================================================
-- SEED DATA: Complete Test Dataset for User Management System
-- ============================================================================
-- This file creates a complete test dataset with realistic user-agent
-- relationships, usage patterns, and various edge cases.
--
-- USAGE:
--   psql $DATABASE_URL -f complete_test_data.sql
--
-- NOTE: Run after the normalized schema is deployed
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Test Users
-- ============================================================================

DO $$
DECLARE
    v_alice_id UUID := gen_random_uuid();
    v_bob_id UUID := gen_random_uuid();
    v_carol_id UUID := gen_random_uuid();
    v_david_id UUID := gen_random_uuid();
    v_emma_id UUID := gen_random_uuid();
    
    -- Get some agent IDs (we'll use existing agents)
    v_fda_agent_id UUID;
    v_clinical_agent_id UUID;
    v_regulatory_agent_id UUID;
    v_medical_writer_id UUID;
    v_data_analyst_id UUID;
BEGIN
    -- Store user IDs for later use
    CREATE TEMP TABLE test_user_ids (
        name TEXT PRIMARY KEY,
        user_id UUID,
        email TEXT
    );
    
    INSERT INTO test_user_ids VALUES
        ('alice', v_alice_id, 'alice@vital.com'),
        ('bob', v_bob_id, 'bob@vital.com'),
        ('carol', v_carol_id, 'carol@vital.com'),
        ('david', v_david_id, 'david@vital.com'),
        ('emma', v_emma_id, 'emma@vital.com');
    
    RAISE NOTICE '✓ Created test user ID mappings';
    
    -- Get some existing agent IDs (modify based on your agents)
    SELECT id INTO v_fda_agent_id FROM agents WHERE slug LIKE '%fda%' OR name LIKE '%FDA%' LIMIT 1;
    SELECT id INTO v_clinical_agent_id FROM agents WHERE slug LIKE '%clinical%' LIMIT 1;
    SELECT id INTO v_regulatory_agent_id FROM agents WHERE slug LIKE '%regulatory%' LIMIT 1;
    SELECT id INTO v_medical_writer_id FROM agents WHERE slug LIKE '%writer%' OR slug LIKE '%medical-writer%' LIMIT 1;
    SELECT id INTO v_data_analyst_id FROM agents WHERE slug LIKE '%data%' OR slug LIKE '%analyst%' LIMIT 1;
    
    -- Store agent IDs
    CREATE TEMP TABLE test_agent_ids (
        name TEXT PRIMARY KEY,
        agent_id UUID
    );
    
    INSERT INTO test_agent_ids VALUES
        ('fda', v_fda_agent_id),
        ('clinical', v_clinical_agent_id),
        ('regulatory', v_regulatory_agent_id),
        ('writer', v_medical_writer_id),
        ('analyst', v_data_analyst_id);
    
    RAISE NOTICE '✓ Retrieved agent IDs';
    
    -- ========================================================================
    -- Create User Profiles
    -- ========================================================================
    
    -- Alice: Heavy user, clinical researcher
    INSERT INTO user_profiles (id, email, full_name, job_title, department, organization, preferences, onboarding_completed, created_at)
    VALUES (
        v_alice_id,
        'alice@vital.com',
        'Alice Johnson',
        'Senior Clinical Researcher',
        'Clinical Development',
        'ACME Pharma',
        '{"theme": "dark", "notifications": true, "language": "en"}'::jsonb,
        true,
        NOW() - INTERVAL '6 months'
    );
    
    -- Bob: Moderate user, regulatory specialist
    INSERT INTO user_profiles (id, email, full_name, job_title, department, organization, preferences, onboarding_completed, created_at)
    VALUES (
        v_bob_id,
        'bob@vital.com',
        'Bob Smith',
        'Regulatory Affairs Specialist',
        'Regulatory',
        'ACME Pharma',
        '{"theme": "light", "notifications": true, "language": "en"}'::jsonb,
        true,
        NOW() - INTERVAL '3 months'
    );
    
    -- Carol: Light user, medical writer
    INSERT INTO user_profiles (id, email, full_name, job_title, department, organization, preferences, onboarding_completed, created_at)
    VALUES (
        v_carol_id,
        'carol@vital.com',
        'Carol Martinez',
        'Medical Writer',
        'Medical Affairs',
        'ACME Pharma',
        '{"theme": "light", "notifications": false, "language": "en"}'::jsonb,
        true,
        NOW() - INTERVAL '2 months'
    );
    
    -- David: New user, just started
    INSERT INTO user_profiles (id, email, full_name, job_title, department, organization, preferences, onboarding_completed, created_at)
    VALUES (
        v_david_id,
        'david@vital.com',
        'David Chen',
        'Associate Scientist',
        'Research',
        'ACME Pharma',
        '{"theme": "light", "notifications": true, "language": "en"}'::jsonb,
        false,
        NOW() - INTERVAL '1 week'
    );
    
    -- Emma: Power user, admin
    INSERT INTO user_profiles (id, email, full_name, job_title, department, organization, preferences, onboarding_completed, created_at)
    VALUES (
        v_emma_id,
        'emma@vital.com',
        'Emma Wilson',
        'Director of Medical Strategy',
        'Medical Affairs',
        'ACME Pharma',
        '{"theme": "dark", "notifications": true, "language": "en", "advanced_features": true}'::jsonb,
        true,
        NOW() - INTERVAL '1 year'
    );
    
    RAISE NOTICE '✓ Created 5 test user profiles';
    
    -- ========================================================================
    -- Create User-Agent Relationships
    -- ========================================================================
    
    -- Alice's agents (heavy user - 8 agents, well organized)
    IF v_fda_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, custom_name, folder, tags, is_favorite, is_pinned, sort_order, 
                                usage_count, message_count, success_count, error_count, user_rating, source, added_at, last_used_at)
        VALUES (
            v_alice_id, v_fda_agent_id, 
            'My FDA Expert', 'Regulatory', ARRAY['fda', 'urgent', 'compliance'],
            true, true, 1,
            156, 420, 150, 6, 4.8, 'store',
            NOW() - INTERVAL '6 months', NOW() - INTERVAL '2 hours'
        );
    END IF;
    
    IF v_clinical_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, custom_name, folder, tags, is_favorite, is_pinned, sort_order,
                                usage_count, message_count, success_count, error_count, user_rating, source, added_at, last_used_at)
        VALUES (
            v_alice_id, v_clinical_agent_id,
            'Clinical Trials Helper', 'Clinical Trials', ARRAY['trials', 'medical'],
            true, true, 2,
            89, 234, 85, 4, 4.5, 'store',
            NOW() - INTERVAL '5 months', NOW() - INTERVAL '1 day'
        );
    END IF;
    
    -- Bob's agents (moderate user - 5 agents, FDA focused)
    IF v_fda_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, folder, tags, is_favorite, usage_count, message_count, 
                                success_count, error_count, user_rating, source, added_at, last_used_at)
        VALUES (
            v_bob_id, v_fda_agent_id,
            'FDA Projects', ARRAY['fda', 'submissions'],
            true, 67, 189, 65, 2, 4.7, 'store',
            NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 hours'
        );
    END IF;
    
    IF v_regulatory_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, folder, tags, usage_count, message_count,
                                success_count, error_count, user_rating, source, added_at, last_used_at)
        VALUES (
            v_bob_id, v_regulatory_agent_id,
            'FDA Projects', ARRAY['regulatory', 'compliance'],
            45, 123, 43, 2, 4.3, 'store',
            NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 day'
        );
    END IF;
    
    -- Carol's agents (light user - 3 writing agents)
    IF v_medical_writer_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, custom_name, folder, is_favorite, usage_count, message_count,
                                success_count, error_count, user_rating, source, added_at, last_used_at)
        VALUES (
            v_carol_id, v_medical_writer_id,
            'My Writing Assistant', 'Writing Tools', true, 23, 67, 22, 1, 4.5, 'store',
            NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 days'
        );
    END IF;
    
    -- David's agent (new user - just 1 agent, no usage yet)
    IF v_clinical_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, source, added_at)
        VALUES (
            v_david_id, v_clinical_agent_id, 'store', NOW() - INTERVAL '1 week'
        );
    END IF;
    
    -- Emma's agents (power user - multiple agents across all categories)
    -- Add 3 favorite agents for Emma
    IF v_fda_agent_id IS NOT NULL THEN
        INSERT INTO user_agents (user_id, agent_id, custom_name, custom_avatar, folder, tags, is_favorite, is_pinned, sort_order,
                                usage_count, message_count, success_count, error_count, user_rating, is_shared, source, added_at, last_used_at)
        VALUES (
            v_emma_id, v_fda_agent_id,
            'FDA Guru', '👨‍⚕️', 'Regulatory Strategy', ARRAY['fda', 'strategic', 'priority'],
            true, true, 1, 234, 678, 230, 4, 5.0, true, 'store',
            NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 hour'
        );
    END IF;
    
    RAISE NOTICE '✓ Created user-agent relationships';
    
    -- ========================================================================
    -- Update calculated metrics
    -- ========================================================================
    
    -- Calculate quality scores for all agents
    UPDATE user_agents SET
        quality_score = calculate_agent_quality_score(
            user_rating,
            usage_count,
            success_count,
            error_count
        ),
        total_tokens_used = usage_count * 1000,  -- Estimate
        total_cost_usd = usage_count * 0.02,     -- Estimate $0.02 per use
        avg_response_time_ms = 800 + (RANDOM() * 400)::INTEGER,  -- 800-1200ms
        first_used_at = CASE 
            WHEN usage_count > 0 THEN added_at + INTERVAL '1 hour'
            ELSE NULL
        END
    WHERE usage_count > 0;
    
    RAISE NOTICE '✓ Updated calculated metrics';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SEED DATA LOADED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  • 5 test users';
    RAISE NOTICE '  • ~15-20 user-agent relationships';
    RAISE NOTICE '  • Various usage patterns';
    RAISE NOTICE '  • Folders, tags, favorites';
    RAISE NOTICE '  • Calculated metrics';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Users:';
    RAISE NOTICE '  • alice@vital.com (Heavy user, 8+ agents)';
    RAISE NOTICE '  • bob@vital.com (Moderate user, 5 agents)';
    RAISE NOTICE '  • carol@vital.com (Light user, 3 agents)';
    RAISE NOTICE '  • david@vital.com (New user, 1 agent)';
    RAISE NOTICE '  • emma@vital.com (Power user, 12+ agents)';
    RAISE NOTICE '========================================';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show user summary
SELECT 
    up.email,
    up.full_name,
    up.job_title,
    COUNT(ua.id) as agent_count,
    SUM(ua.usage_count) as total_uses,
    ROUND(AVG(ua.user_rating), 2) as avg_rating
FROM user_profiles up
LEFT JOIN user_agents ua ON up.id = ua.user_id
WHERE up.email LIKE '%@vital.com'
GROUP BY up.id, up.email, up.full_name, up.job_title
ORDER BY total_uses DESC NULLS LAST;

-- Show agent distribution by folder
SELECT 
    folder,
    COUNT(*) as agent_count,
    ROUND(AVG(usage_count), 1) as avg_usage,
    COUNT(*) FILTER (WHERE is_favorite = TRUE) as favorite_count
FROM user_agents ua
JOIN user_profiles up ON ua.user_id = up.id
WHERE up.email LIKE '%@vital.com'
GROUP BY folder
ORDER BY agent_count DESC;

-- Show top used agents
SELECT 
    up.email,
    a.name as agent_name,
    ua.custom_name,
    ua.usage_count,
    ua.user_rating,
    ua.folder,
    ua.is_favorite
FROM user_agents ua
JOIN user_profiles up ON ua.user_id = up.id
JOIN agents a ON ua.agent_id = a.id
WHERE up.email LIKE '%@vital.com'
ORDER BY ua.usage_count DESC
LIMIT 10;

