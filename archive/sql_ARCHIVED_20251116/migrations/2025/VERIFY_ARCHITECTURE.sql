-- ============================================================================
-- Verification Script: Unified RAG Domain Architecture
-- ============================================================================
-- Run this to verify your new architecture is properly set up
-- ============================================================================

-- 1. Verify ENUM types exist
-- ============================================================================
SELECT 
  'ENUM Types' as check_type,
  typname as enum_name,
  array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('domain_scope', 'access_policy_level', 'maturity_level', 'exposure_level')
GROUP BY typname
ORDER BY typname;

-- 2. Verify knowledge_domains_new table exists and has all columns
-- ============================================================================
SELECT 
  'Table: knowledge_domains_new' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'knowledge_domains_new'
ORDER BY ordinal_position;

-- 3. Verify indexes on knowledge_domains_new
-- ============================================================================
SELECT 
  'Indexes on knowledge_domains_new' as check_type,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'knowledge_domains_new'
ORDER BY indexname;

-- 4. Verify knowledge_documents has new columns
-- ============================================================================
SELECT 
  'Table: knowledge_documents' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'knowledge_documents'
  AND column_name IN (
    'domain_id', 'enterprise_id', 'owner_user_id', 
    'access_policy', 'rag_priority_weight', 
    'pii_sensitivity', 'regulatory_exposure'
  )
ORDER BY column_name;

-- 5. Verify document_chunks has new columns
-- ============================================================================
SELECT 
  'Table: document_chunks' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'document_chunks'
  AND column_name IN (
    'domain_id', 'enterprise_id', 'owner_user_id', 
    'access_policy', 'rag_priority_weight', 
    'pii_sensitivity', 'regulatory_exposure'
  )
ORDER BY column_name;

-- 6. Verify foreign key constraint on parent_domain_id
-- ============================================================================
SELECT 
  'Foreign Keys' as check_type,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conname = 'knowledge_domains_new_parent_domain_id_fkey';

-- 7. Count domains in new table
-- ============================================================================
SELECT 
  'Domain Count' as check_type,
  COUNT(*) as total_domains,
  COUNT(CASE WHEN domain_scope = 'global' THEN 1 END) as global_domains,
  COUNT(CASE WHEN domain_scope = 'enterprise' THEN 1 END) as enterprise_domains,
  COUNT(CASE WHEN domain_scope = 'user' THEN 1 END) as user_domains
FROM public.knowledge_domains_new;

-- 8. Summary
-- ============================================================================
DO $$
DECLARE
  enum_count INTEGER;
  table_exists BOOLEAN;
  columns_count INTEGER;
  docs_columns_count INTEGER;
  chunks_columns_count INTEGER;
BEGIN
  -- Check ENUMs
  SELECT COUNT(DISTINCT typname) INTO enum_count
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE typname IN ('domain_scope', 'access_policy_level', 'maturity_level', 'exposure_level');
  
  -- Check table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'knowledge_domains_new'
  ) INTO table_exists;
  
  -- Check knowledge_documents columns
  SELECT COUNT(*) INTO docs_columns_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'knowledge_documents'
    AND column_name IN ('domain_id', 'access_policy', 'rag_priority_weight');
  
  -- Check document_chunks columns
  SELECT COUNT(*) INTO chunks_columns_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'document_chunks'
    AND column_name IN ('domain_id', 'access_policy', 'rag_priority_weight');
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ARCHITECTURE VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ENUM Types: % / 4', enum_count;
  RAISE NOTICE 'Table knowledge_domains_new: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'knowledge_documents new columns: % / 3', docs_columns_count;
  RAISE NOTICE 'document_chunks new columns: % / 3', chunks_columns_count;
  RAISE NOTICE '========================================';
  
  IF enum_count = 4 AND table_exists AND docs_columns_count >= 3 AND chunks_columns_count >= 3 THEN
    RAISE NOTICE '✅ Architecture is properly set up!';
  ELSE
    RAISE NOTICE '⚠️  Some components may be missing. Review the detailed output above.';
  END IF;
  RAISE NOTICE '';
END $$;

