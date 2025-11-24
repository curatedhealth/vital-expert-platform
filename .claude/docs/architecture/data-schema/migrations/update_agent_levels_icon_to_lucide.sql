-- =====================================================
-- Update agent_levels: Rename icon_emoji to icon_name
-- =====================================================
-- Changes icon column from emoji to Lucide React icon names
-- =====================================================

-- Rename column
ALTER TABLE agent_levels 
RENAME COLUMN icon_emoji TO icon_name;

-- Update existing values to Lucide React icon names
UPDATE agent_levels
SET icon_name = CASE 
    WHEN level_number = 1 THEN 'Target'
    WHEN level_number = 2 THEN 'Award'
    WHEN level_number = 3 THEN 'Settings'
    WHEN level_number = 4 THEN 'Wrench'
    WHEN level_number = 5 THEN 'Plug'
    ELSE icon_name
END
WHERE icon_name IN ('🎯', '🏅', '⚙️', '🔧', '🔌');

-- Verification
SELECT 
    level_number,
    name,
    icon_name,
    color_hex
FROM agent_levels
ORDER BY level_number;

