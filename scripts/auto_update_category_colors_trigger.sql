-- ============================================================================
-- AUTO-UPDATE CATEGORY COLORS - Database Trigger
-- ============================================================================
-- This trigger automatically updates category_color whenever agent_category
-- is changed, ensuring colors always stay in sync
-- ============================================================================

-- Create function to auto-update category_color
CREATE OR REPLACE FUNCTION update_agent_category_color()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign color based on category
  NEW.category_color := CASE NEW.agent_category
    WHEN 'deep_agent' THEN '#9333EA'                    -- 🟣 Purple
    WHEN 'universal_task_subagent' THEN '#10B981'       -- 🟢 Green
    WHEN 'multi_expert_orchestration' THEN '#06B6D4'    -- 🔷 Cyan
    WHEN 'specialized_knowledge' THEN '#3B82F6'         -- 🔵 Blue
    WHEN 'process_automation' THEN '#F97316'            -- 🟠 Orange
    WHEN 'autonomous_problem_solving' THEN '#EF4444'    -- 🔴 Red
    ELSE '#6B7280'                                       -- ⚪ Gray (default)
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires before INSERT or UPDATE
CREATE TRIGGER agent_category_color_update
  BEFORE INSERT OR UPDATE OF agent_category ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_category_color();

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Insert new agent (color auto-assigned)
/*
INSERT INTO agents (name, agent_category, ...)
VALUES ('New Strategic Agent', 'deep_agent', ...);
-- category_color will automatically be set to '#9333EA' (Purple)
*/

-- Example 2: Update agent category (color auto-updates)
/*
UPDATE agents 
SET agent_category = 'universal_task_subagent'
WHERE name = 'My Agent';
-- category_color will automatically change to '#10B981' (Green)
*/

-- Example 3: Verify color assignments
/*
SELECT 
  name,
  agent_category,
  category_color,
  CASE category_color
    WHEN '#9333EA' THEN '🟣 Purple'
    WHEN '#10B981' THEN '🟢 Green'
    WHEN '#06B6D4' THEN '🔷 Cyan'
    WHEN '#3B82F6' THEN '🔵 Blue'
    WHEN '#F97316' THEN '🟠 Orange'
    WHEN '#EF4444' THEN '🔴 Red'
    ELSE '⚪ Gray'
  END as color_emoji
FROM agents
WHERE name = 'My Agent';
*/

-- ============================================================================
-- TESTING THE TRIGGER
-- ============================================================================

-- Test 1: Change category and verify color updates
/*
BEGIN;

-- Before: Check current category and color
SELECT name, agent_category, category_color FROM agents WHERE name = 'Brand Strategy Director';

-- Change category
UPDATE agents SET agent_category = 'autonomous_problem_solving' WHERE name = 'Brand Strategy Director';

-- After: Verify color changed to Red (#EF4444)
SELECT name, agent_category, category_color FROM agents WHERE name = 'Brand Strategy Director';

ROLLBACK; -- Undo test changes
*/

-- ============================================================================
-- MAINTENANCE
-- ============================================================================

-- To drop the trigger (if needed):
-- DROP TRIGGER IF EXISTS agent_category_color_update ON agents;

-- To drop the function (if needed):
-- DROP FUNCTION IF EXISTS update_agent_category_color();

-- To manually update all colors (if needed):
/*
UPDATE agents
SET category_color = CASE agent_category
  WHEN 'deep_agent' THEN '#9333EA'
  WHEN 'universal_task_subagent' THEN '#10B981'
  WHEN 'multi_expert_orchestration' THEN '#06B6D4'
  WHEN 'specialized_knowledge' THEN '#3B82F6'
  WHEN 'process_automation' THEN '#F97316'
  WHEN 'autonomous_problem_solving' THEN '#EF4444'
  ELSE '#6B7280'
END;
*/

