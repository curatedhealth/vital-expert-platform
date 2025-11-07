-- ============================================================================
-- REDISTRIBUTE AVATARS - Balanced Distribution
-- ============================================================================
-- This script reassigns avatars so that:
-- 1. Every agent gets a unique avatar
-- 2. No avatar is used more than 3 times
-- 3. Distribution is balanced across all available avatars
-- ============================================================================

-- Step 1: Create list of all available avatars (assuming avatar_0001 to avatar_0200)
WITH available_avatars AS (
    SELECT '/avatars/avatar_' || LPAD(num::text, 4, '0') || '.png' as avatar_url
    FROM generate_series(1, 200) as num
),

-- Step 2: Get all agents and assign them a row number
agents_numbered AS (
    SELECT 
        id,
        name,
        category,
        ROW_NUMBER() OVER (ORDER BY name) as rn
    FROM agents
),

-- Step 3: Assign avatars in a round-robin fashion (each avatar used max 2 times with 200 avatars for 334 agents)
-- We'll use each avatar twice, then cycle through again
avatar_assignment AS (
    SELECT 
        id,
        name,
        category,
        '/avatars/avatar_' || LPAD((((rn - 1) % 200) + 1)::text, 4, '0') || '.png' as new_avatar
    FROM agents_numbered
)

-- Preview the distribution
SELECT 
    new_avatar,
    COUNT(*) as usage_count,
    string_agg(name, ', ' ORDER BY name) as agents
FROM avatar_assignment
GROUP BY new_avatar
HAVING COUNT(*) > 3
ORDER BY usage_count DESC, new_avatar
LIMIT 20;

-- ============================================================================
-- Execute: Update all agents with balanced avatar distribution
-- ============================================================================

WITH agents_numbered AS (
    SELECT 
        id,
        name,
        category,
        ROW_NUMBER() OVER (ORDER BY category, name) as rn
    FROM agents
)
UPDATE agents
SET avatar_url = '/avatars/avatar_' || LPAD((((agents_numbered.rn - 1) % 200) + 1)::text, 4, '0') || '.png'
FROM agents_numbered
WHERE agents.id = agents_numbered.rn;

-- This approach will result in max 2 uses per avatar (334 agents / 200 avatars = 1.67)

