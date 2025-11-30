-- ============================================================================
-- DIAGNOSTIC: Check Current Persona Schema State
-- ============================================================================

-- 1. Check if personas table exists
SELECT 
    'personas_table_exists' as check_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') as result;

-- 2. Check critical columns
SELECT 
    'critical_columns' as check_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'personas' 
    AND column_name IN ('id', 'tenant_id', 'role_id', 'function_id', 'department_id', 'archetype', 'work_pattern', 'ai_maturity_score')
ORDER BY column_name;

-- 3. Check if junction tables exist
SELECT 
    'junction_tables' as check_name,
    table_name
FROM information_schema.tables 
WHERE table_name LIKE 'persona_%'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 4. Check if views exist
SELECT 
    'views' as check_name,
    table_name as view_name
FROM information_schema.views 
WHERE table_name LIKE '%persona%'
ORDER BY table_name;

-- 5. Check enum types
SELECT 
    'enum_types' as check_name,
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('archetype_enum', 'work_pattern_enum', 'service_layer_preference', 'gen_ai_readiness_level', 'budget_authority_level')
GROUP BY t.typname
ORDER BY t.typname;

-- 6. Check lookup tables
SELECT 
    'lookup_tables' as check_name,
    table_name
FROM information_schema.tables 
WHERE table_name LIKE 'lookup_%'
ORDER BY table_name;

-- 7. Check triggers on personas
SELECT 
    'triggers' as check_name,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'personas'
ORDER BY trigger_name;

