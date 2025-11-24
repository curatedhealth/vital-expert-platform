-- Check existing ai_maturity_levels AND vpanes_dimensions schemas
SELECT 'ai_maturity_levels' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'ai_maturity_levels'
ORDER BY ordinal_position

UNION ALL

SELECT 'vpanes_dimensions', column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vpanes_dimensions'
ORDER BY ordinal_position;

