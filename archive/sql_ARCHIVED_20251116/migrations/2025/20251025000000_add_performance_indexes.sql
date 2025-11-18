-- ============================================================================
-- Performance Index Migration
-- Adds critical indexes to improve query performance across the platform
-- Author: Backend Audit Security Hardening
-- Date: 2025-10-25
-- ============================================================================

-- ============================================================================
-- AGENTS TABLE INDEXES
-- ============================================================================

-- Index for agent status filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_agents_status
ON agents(status)
WHERE status IN ('active', 'testing');

-- Index for tier-based queries (used in agent selection)
CREATE INDEX IF NOT EXISTS idx_agents_tier
ON agents(tier)
WHERE tier IS NOT NULL;

-- Composite index for filtered agent lists (status + tier + business_function)
CREATE INDEX IF NOT EXISTS idx_agents_status_tier_business
ON agents(status, tier, business_function)
WHERE status = 'active';

-- Index for business function filtering
CREATE INDEX IF NOT EXISTS idx_agents_business_function
ON agents(business_function)
WHERE business_function IS NOT NULL;

-- Index for organizational role lookups
CREATE INDEX IF NOT EXISTS idx_agents_role
ON agents(role)
WHERE role IS NOT NULL;

-- Index for agent priority ordering
CREATE INDEX IF NOT EXISTS idx_agents_priority
ON agents(priority ASC, tier ASC)
WHERE status = 'active';

-- Index for custom agents (user-created)
CREATE INDEX IF NOT EXISTS idx_agents_custom_user
ON agents(is_custom, created_by)
WHERE is_custom = true;

-- Index for knowledge domain searches
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains
ON agents USING GIN(knowledge_domains)
WHERE knowledge_domains IS NOT NULL;

-- Index for capability searches
CREATE INDEX IF NOT EXISTS idx_agents_capabilities
ON agents USING GIN(capabilities)
WHERE capabilities IS NOT NULL;

-- ============================================================================
-- KNOWLEDGE_DOCUMENTS TABLE INDEXES
-- ============================================================================

-- Index for agent-specific document lookups
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_agent_id
ON knowledge_documents(agent_id)
WHERE agent_id IS NOT NULL;

-- Index for document status filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status
ON knowledge_documents(status)
WHERE status = 'processed';

-- Composite index for document retrieval (agent + status + created_at)
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_agent_status_created
ON knowledge_documents(agent_id, status, created_at DESC)
WHERE status = 'processed';

-- Index for document source URL lookups (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source_url
ON knowledge_documents(source_url)
WHERE source_url IS NOT NULL;

-- Index for document type filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_source_type
ON knowledge_documents(source_type)
WHERE source_type IS NOT NULL;

-- Vector similarity search index (if pgvector extension is enabled)
-- Note: This requires pgvector extension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding_ivfflat
    ON knowledge_documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
    WHERE embedding IS NOT NULL;
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

-- Index for chat session lookups
CREATE INDEX IF NOT EXISTS idx_chats_session_id
ON chats(session_id)
WHERE session_id IS NOT NULL;

-- ============================================================================
-- MESSAGES TABLE INDEXES (if exists)
-- ============================================================================

-- Check if messages table exists first
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

    -- Index for message role filtering
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_role
             ON messages(role)
             WHERE role IN (''user'', ''assistant'')';
  END IF;
END $$;

-- ============================================================================
-- PROMPTS TABLE INDEXES
-- ============================================================================

-- Index for prompt lookups by capability
CREATE INDEX IF NOT EXISTS idx_prompts_capability_id
ON prompts(capability_id)
WHERE capability_id IS NOT NULL;

-- Index for prompt status filtering
CREATE INDEX IF NOT EXISTS idx_prompts_status
ON prompts(status)
WHERE status = 'active';

-- Composite index for active prompts by capability
CREATE INDEX IF NOT EXISTS idx_prompts_capability_status
ON prompts(capability_id, status)
WHERE status = 'active';

-- Index for prompt version tracking
CREATE INDEX IF NOT EXISTS idx_prompts_version
ON prompts(version DESC, updated_at DESC);

-- ============================================================================
-- CAPABILITIES TABLE INDEXES
-- ============================================================================

-- Index for capability category filtering
CREATE INDEX IF NOT EXISTS idx_capabilities_category
ON capabilities(category)
WHERE category IS NOT NULL;

-- Index for capability status
CREATE INDEX IF NOT EXISTS idx_capabilities_status
ON capabilities(status)
WHERE status = 'active';

-- Composite index for active capabilities by category
CREATE INDEX IF NOT EXISTS idx_capabilities_category_status
ON capabilities(category, status)
WHERE status = 'active';

-- ============================================================================
-- ORGANIZATIONAL STRUCTURE INDEXES
-- ============================================================================

-- Business Functions
CREATE INDEX IF NOT EXISTS idx_business_functions_code
ON business_functions(code)
WHERE code IS NOT NULL;

-- Departments by business function
CREATE INDEX IF NOT EXISTS idx_departments_business_function
ON departments(business_function_id)
WHERE business_function_id IS NOT NULL;

-- Organizational Roles
CREATE INDEX IF NOT EXISTS idx_org_roles_level
ON organizational_roles(level)
WHERE level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_roles_business_function
ON organizational_roles(business_function_id)
WHERE business_function_id IS NOT NULL;

-- ============================================================================
-- AGENT RELATIONSHIPS INDEXES
-- ============================================================================

-- Agent Tools (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_tools') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id
             ON agent_tools(agent_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_agent_tools_tool_id
             ON agent_tools(tool_id)';
  END IF;
END $$;

-- Agent Prompt Starters (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_prompt_starters') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_agent_prompt_starters_agent_id
             ON agent_prompt_starters(agent_id)';
  END IF;
END $$;

-- ============================================================================
-- USAGE TRACKING INDEXES (for analytics)
-- ============================================================================

-- LLM Usage (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'llm_usage') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_llm_usage_user_created
             ON llm_usage(user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_llm_usage_agent_created
             ON llm_usage(agent_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_llm_usage_model_created
             ON llm_usage(model, created_at DESC)';
  END IF;
END $$;

-- ============================================================================
-- AUDIT LOG INDEXES
-- ============================================================================

-- Audit logs by user
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
             ON audit_logs(user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_action
             ON audit_logs(action, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
             ON audit_logs(resource_type, resource_id)';
  END IF;
END $$;

-- ============================================================================
-- EXPLAIN ANALYZE HELPER FUNCTION
-- ============================================================================

-- Function to analyze slow queries (for debugging)
CREATE OR REPLACE FUNCTION explain_query(query_text TEXT)
RETURNS TABLE(query_plan TEXT) AS $$
BEGIN
  RETURN QUERY EXECUTE 'EXPLAIN ANALYZE ' || query_text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEX USAGE STATISTICS VIEW
-- ============================================================================

-- View to monitor index usage
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
ORDER BY idx_scan DESC;

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================

-- To check index usage:
-- SELECT * FROM index_usage_stats WHERE index_scans < 100;

-- To identify missing indexes:
-- SELECT
--   schemaname, tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
--   seq_scan, idx_scan
-- FROM pg_stat_user_tables
-- WHERE seq_scan > 1000 AND idx_scan < seq_scan / 10
-- ORDER BY seq_scan DESC;

-- To rebuild indexes (if fragmented):
-- REINDEX TABLE agents;
-- REINDEX TABLE knowledge_documents;

-- To analyze tables after index creation:
ANALYZE agents;
ANALYZE knowledge_documents;
ANALYZE chats;
ANALYZE prompts;
ANALYZE capabilities;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Performance indexes migration completed successfully';
  RAISE NOTICE 'Total indexes created: %', (
    SELECT COUNT(*) FROM pg_indexes
    WHERE indexname LIKE 'idx_%'
    AND schemaname = 'public'
  );
END $$;
