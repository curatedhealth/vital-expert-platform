-- Manual Database Check Script
-- Run this in Supabase SQL editor or psql

-- 1. List all tables in the public schema
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check knowledge_base table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'knowledge_base'
ORDER BY ordinal_position;

-- 3. Count records in knowledge_base
SELECT COUNT(*) as total_knowledge_base_records FROM knowledge_base;

-- 4. Sample knowledge_base records
SELECT id, name, description, knowledge_type, category, tags, is_public, is_active, created_at
FROM knowledge_base
LIMIT 5;

-- 5. Check documents table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- 6. Count records in documents
SELECT COUNT(*) as total_documents_records FROM documents;

-- 7. Sample documents records
SELECT id, name, file_name, document_type, category, processing_status, is_active, created_at
FROM documents
LIMIT 5;

-- 8. Check for any tables that might contain knowledge/document data
SELECT
  schemaname,
  tablename,
  attname as column_name,
  typname as data_type
FROM pg_stats
WHERE schemaname = 'public'
  AND (tablename LIKE '%knowledge%' OR tablename LIKE '%document%' OR tablename LIKE '%file%')
ORDER BY tablename, attname;

-- 9. Look for tables with content-related columns
SELECT DISTINCT table_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (column_name LIKE '%content%'
       OR column_name LIKE '%description%'
       OR column_name LIKE '%text%'
       OR column_name LIKE '%file%'
       OR column_name LIKE '%document%')
ORDER BY table_name;

-- 10. Check agents table for any knowledge-related content
SELECT COUNT(*) as total_agents FROM agents;

-- 11. Sample agents data to see if they contain knowledge
SELECT id, name, description, knowledge_domains, knowledge_sources
FROM agents
LIMIT 3;

-- 12. Check if there are any document_chunks or vector tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE '%chunk%' OR table_name LIKE '%vector%' OR table_name LIKE '%embedding%')
ORDER BY table_name;

-- 13. Look for any data in potential RAG-related tables
SELECT
  'document_chunks' as table_name,
  COUNT(*) as record_count
FROM document_chunks
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_chunks')

UNION ALL

SELECT
  'embeddings' as table_name,
  COUNT(*) as record_count
FROM embeddings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'embeddings')

UNION ALL

SELECT
  'vectors' as table_name,
  COUNT(*) as record_count
FROM vectors
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vectors');

-- 14. Show all non-empty tables
SELECT
  schemaname,
  tablename,
  n_tup_ins as total_inserts,
  n_tup_upd as total_updates,
  n_tup_del as total_deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 0
ORDER BY n_live_tup DESC;