-- ============================================================================
-- Performance Index Migration (CORRECTED for actual schema)
-- Adds critical indexes to improve query performance across the platform
-- Author: Backend Audit Security Hardening
-- Date: 2025-10-25 (Corrected)
-- ============================================================================

-- ============================================================================
-- AGENTS TABLE INDEXES
-- ============================================================================

-- Note: idx_agents_status already exists from schema creation
-- Note: idx_agents_tier_priority already exists from schema creation

-- Composite index for filtered agent lists (status + tier + business_function)
CREATE INDEX IF NOT EXISTS idx_agents_status_tier_business
ON agents(status, tier, business_function)
WHERE status = 'active'::agent_status;

-- Index for business function filtering
CREATE INDEX IF NOT EXISTS idx_agents_business_function
ON agents(business_function)
WHERE business_function IS NOT NULL;

-- Index for organizational role lookups
CREATE INDEX IF NOT EXISTS idx_agents_role
ON agents(role)
WHERE role IS NOT NULL;

-- Index for user-owned agents
CREATE INDEX IF NOT EXISTS idx_agents_user_id_status
ON agents(user_id, status)
WHERE user_id IS NOT NULL;

-- Index for knowledge domain searches (GIN for array)
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains
ON agents USING GIN(knowledge_domains)
WHERE knowledge_domains IS NOT NULL AND array_length(knowledge_domains, 1) > 0;

-- Index for capability searches (GIN for array)
CREATE INDEX IF NOT EXISTS idx_agents_capabilities
ON agents USING GIN(capabilities)
WHERE capabilities IS NOT NULL AND array_length(capabilities, 1) > 0;

-- Index for agent name text search (for fuzzy matching)
CREATE INDEX IF NOT EXISTS idx_agents_name_text
ON agents USING gin(to_tsvector('english', name || ' ' || display_name));

-- Index for created_at (chronological sorting)
CREATE INDEX IF NOT EXISTS idx_agents_created_at
ON agents(created_at DESC);

-- ============================================================================
-- KNOWLEDGE_DOCUMENTS TABLE INDEXES
-- ============================================================================

-- Index for agent-specific document lookups
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_agent_id
ON knowledge_documents(agent_id)
WHERE agent_id IS NOT NULL;

-- Index for document status filtering (check if status column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents'
    AND column_name = 'status'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status
             ON knowledge_documents(status)';
  END IF;
END $$;

-- Composite index for document retrieval (agent + created_at)
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_agent_created
ON knowledge_documents(agent_id, created_at DESC)
WHERE agent_id IS NOT NULL;

-- Index for document source URL lookups (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source_url
ON knowledge_documents(source_url)
WHERE source_url IS NOT NULL;

-- Index for document type filtering
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents'
    AND column_name = 'source_type'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source_type
             ON knowledge_documents(source_type)
             WHERE source_type IS NOT NULL';
  END IF;
END $$;

-- Index for document metadata searches (JSONB GIN)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents'
    AND column_name = 'metadata'
    AND data_type = 'jsonb'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_knowledge_docs_metadata_gin
             ON knowledge_documents USING gin(metadata)';
  END IF;
END $$;

-- Vector similarity search index (if pgvector extension is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents'
    AND column_name = 'embedding'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding_ivfflat
             ON knowledge_documents USING ivfflat (embedding vector_cosine_ops)
             WITH (lists = 100)
             WHERE embedding IS NOT NULL';
  END IF;
END $$;

-- ============================================================================
-- CHATS TABLE INDEXES
-- ============================================================================

-- Index for user chat history
CREATE INDEX IF NOT EXISTS idx_chats_user_id_created
ON chats(user_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- Index for agent conversation history
CREATE INDEX IF NOT EXISTS idx_chats_agent_id_created
ON chats(agent_id, created_at DESC)
WHERE agent_id IS NOT NULL;

-- Composite index for user + agent conversations
CREATE INDEX IF NOT EXISTS idx_chats_user_agent_created
ON chats(user_id, agent_id, created_at DESC);

-- ============================================================================
-- MESSAGES TABLE INDEXES (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Index for message history by chat
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created
             ON messages(chat_id, created_at ASC)';

    -- Index for user message history
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_user_id_created
             ON messages(user_id, created_at DESC)
             WHERE user_id IS NOT NULL';
  END IF;
END $$;

-- ============================================================================
-- PROMPTS TABLE INDEXES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    -- Index for prompt lookups by capability
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'capability_id'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prompts_capability_id
               ON prompts(capability_id)
               WHERE capability_id IS NOT NULL';
    END IF;

    -- Index for prompt version tracking
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'version'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prompts_version
               ON prompts(version DESC, updated_at DESC)';
    END IF;

    -- Index for metadata searches (if JSONB)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts'
      AND column_name = 'metadata'
      AND data_type = 'jsonb'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prompts_metadata_gin
               ON prompts USING gin(metadata)';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- CAPABILITIES TABLE INDEXES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capabilities') THEN
    -- Index for capability category filtering
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'capabilities' AND column_name = 'category'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_capabilities_category
               ON capabilities(category)
               WHERE category IS NOT NULL';
    END IF;

    -- Index for capability name lookups
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_capabilities_name
             ON capabilities(name)';
  END IF;
END $$;

-- ============================================================================
-- ORGANIZATIONAL STRUCTURE INDEXES
-- ============================================================================

-- Business Functions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_functions') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'business_functions' AND column_name = 'code'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_business_functions_code
               ON business_functions(code)
               WHERE code IS NOT NULL';
    END IF;
  END IF;
END $$;

-- Departments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'departments') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'departments' AND column_name = 'business_function_id'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_departments_business_function
               ON departments(business_function_id)
               WHERE business_function_id IS NOT NULL';
    END IF;
  END IF;
END $$;

-- Organizational Roles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizational_roles') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'organizational_roles' AND column_name = 'level'
    ) THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_org_roles_level
               ON organizational_roles(level)
               WHERE level IS NOT NULL';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- USAGE TRACKING INDEXES
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'llm_usage') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_llm_usage_user_created
             ON llm_usage(user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_llm_usage_agent_created
             ON llm_usage(agent_id, created_at DESC)
             WHERE agent_id IS NOT NULL';
  END IF;
END $$;

-- ============================================================================
-- INDEX USAGE STATISTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW index_usage_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

ANALYZE agents;
ANALYZE knowledge_documents;
ANALYZE chats;

-- Analyze other tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    EXECUTE 'ANALYZE prompts';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capabilities') THEN
    EXECUTE 'ANALYZE capabilities';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    EXECUTE 'ANALYZE messages';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE indexname LIKE 'idx_%'
  AND schemaname = 'public';

  RAISE NOTICE '================================================';
  RAISE NOTICE 'Performance indexes migration completed';
  RAISE NOTICE 'Total custom indexes in database: %', index_count;
  RAISE NOTICE '================================================';
END $$;
