-- ============================================================================
-- MIGRATION VERIFICATION SCRIPT
-- ============================================================================
-- Run this script to verify the migration was successful
-- Expected results are commented below each query

-- ============================================================================
-- 1. Verify all new tables exist
-- ============================================================================
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'services_registry',
    'template_library',
    'workflow_library', 
    'user_favorites',
    'user_ratings'
  )
ORDER BY table_name;

-- Expected: 5 rows
-- services_registry (should have ~20+ columns now)
-- template_library (new table)
-- workflow_library (new table)
-- user_favorites (new table)
-- user_ratings (new table)

-- ============================================================================
-- 2. Verify services_registry was enhanced with new columns
-- ============================================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services_registry'
  AND column_name IN (
    'icon', 
    'service_category', 
    'service_type', 
    'is_public',
    'tags',
    'version'
  )
ORDER BY column_name;

-- Expected: 6 rows (all the new columns added)

-- ============================================================================
-- 3. Check services_registry data
-- ============================================================================
SELECT 
  service_name,
  display_name,
  service_category,
  service_type,
  icon,
  is_enabled,
  is_public
FROM services_registry
WHERE deleted_at IS NULL
ORDER BY service_name;

-- Expected: 4 services
-- ask_expert - conversation/ai_agent - MessageCircle
-- ask_panel - conversation/ai_agent - Users
-- workflows - execution/workflow - Workflow
-- solutions_marketplace - marketplace/integration - Package

-- ============================================================================
-- 4. Check template_library (should have migrated prompts)
-- ============================================================================
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN source_table = 'prompts' THEN 1 END) as from_prompts,
  COUNT(CASE WHEN is_builtin = TRUE THEN 1 END) as builtin,
  COUNT(CASE WHEN is_public = TRUE THEN 1 END) as public_templates
FROM template_library
WHERE deleted_at IS NULL;

-- Expected: ~10 templates migrated from prompts table

-- ============================================================================
-- 5. View migrated templates
-- ============================================================================
SELECT 
  template_name,
  display_name,
  template_type,
  template_category,
  source_table,
  is_public,
  is_builtin
FROM template_library
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Expected: List of templates migrated from prompts

-- ============================================================================
-- 6. Check workflow_library (should be empty initially)
-- ============================================================================
SELECT COUNT(*) as workflow_library_count FROM workflow_library WHERE deleted_at IS NULL;

-- Expected: 0 (will populate as workflows are enhanced)

-- ============================================================================
-- 7. Check user_favorites (should be empty initially)
-- ============================================================================
SELECT COUNT(*) as favorites_count FROM user_favorites;

-- Expected: 0 (will populate as users add favorites)

-- ============================================================================
-- 8. Check user_ratings (should be empty initially)
-- ============================================================================
SELECT COUNT(*) as ratings_count FROM user_ratings;

-- Expected: 0 (will populate as users rate items)

-- ============================================================================
-- 9. Verify RLS policies exist
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN (
  'services_registry',
  'template_library',
  'workflow_library',
  'user_favorites',
  'user_ratings'
)
ORDER BY tablename, policyname;

-- Expected: Multiple policies for each table (select, insert, update, delete)

-- ============================================================================
-- 10. Verify triggers exist
-- ============================================================================
SELECT 
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table IN (
  'template_library',
  'workflow_library',
  'user_ratings',
  'user_favorites'
)
ORDER BY event_object_table, trigger_name;

-- Expected: 
-- template_library_updated_at (BEFORE UPDATE)
-- workflow_library_updated_at (BEFORE UPDATE)
-- user_ratings_updated_at (BEFORE UPDATE)
-- user_ratings_aggregate_trigger (AFTER INSERT/UPDATE/DELETE)
-- user_favorites_count_trigger (AFTER INSERT/DELETE)

-- ============================================================================
-- 11. Test adding a favorite (optional - replace UUID with real IDs)
-- ============================================================================
-- INSERT INTO user_favorites (user_id, item_type, item_id, notes)
-- VALUES (
--   auth.uid(), 
--   'template', 
--   (SELECT id FROM template_library LIMIT 1),
--   'Testing favorites system'
-- );

-- SELECT * FROM user_favorites WHERE user_id = auth.uid();

-- ============================================================================
-- 12. Test adding a rating (optional - replace UUID with real IDs)
-- ============================================================================
-- INSERT INTO user_ratings (user_id, item_type, item_id, rating, review)
-- VALUES (
--   auth.uid(),
--   'template',
--   (SELECT id FROM template_library LIMIT 1),
--   5,
--   'Great template! Very helpful.'
-- );

-- Check that rating_average was automatically updated
-- SELECT id, template_name, rating_average, rating_count
-- FROM template_library
-- WHERE rating_count > 0;

-- ============================================================================
-- SUMMARY QUERY
-- ============================================================================
SELECT 
  'Migration Status' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_library')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_library')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_favorites')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ratings')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_registry' AND column_name = 'service_category')
    THEN '✅ SUCCESS - All tables and columns created'
    ELSE '❌ FAILED - Some tables or columns missing'
  END as status;

