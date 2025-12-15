-- =====================================================
-- Check ALL existing agent-related tables
-- =====================================================
-- This will tell us which relationship tables already exist
-- =====================================================

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE '%agent%'
ORDER BY table_name;

-- Check for tools table
SELECT 
    'tools' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tools') as exists,
    (SELECT COUNT(*) FROM tools WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tools');

-- Check for skills table
SELECT 
    'skills' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills') as exists,
    (SELECT COUNT(*) FROM skills WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'skills');

-- Check for roles table
SELECT 
    'roles' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') as exists,
    (SELECT COUNT(*) FROM roles WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles');

-- Check for functions table
SELECT 
    'functions' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'functions') as exists,
    (SELECT COUNT(*) FROM functions WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'functions');

-- Check for departments table
SELECT 
    'departments' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments') as exists,
    (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'departments');

-- Check for knowledge table
SELECT 
    'knowledge' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'knowledge') as exists,
    (SELECT COUNT(*) FROM knowledge WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'knowledge');

-- Check for JTBDs table
SELECT 
    'jtbds' as table_check,
    EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jtbds') as exists,
    (SELECT COUNT(*) FROM jtbds WHERE deleted_at IS NULL) as active_count
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jtbds');

