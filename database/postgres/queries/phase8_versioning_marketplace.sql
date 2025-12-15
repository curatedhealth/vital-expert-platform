-- ==========================================
-- FILE: phase8_versioning_marketplace.sql
-- PURPOSE: Add agent versioning, changelog, marketplace discovery, ratings, and categories
-- PHASE: 8 of 9 - Versioning, Discovery & Marketplace
-- DEPENDENCIES: agents table
-- GOLDEN RULES: Complete lifecycle tracking, marketplace-ready
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 8: VERSIONING, DISCOVERY & MARKETPLACE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 1: CREATE AGENT VERSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Version info
    version_number TEXT NOT NULL,
    version_tag TEXT CHECK (version_tag IN ('alpha', 'beta', 'rc', 'stable', 'deprecated')),
    
    -- Snapshot of configuration
    snapshot_system_prompt TEXT,
    snapshot_base_model TEXT,
    snapshot_temperature NUMERIC(3,2),
    snapshot_max_tokens INTEGER,
    
    -- Change tracking
    changelog TEXT NOT NULL,
    breaking_changes BOOLEAN DEFAULT false,
    
    -- Deployment
    deployed_at TIMESTAMPTZ,
    deprecated_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, version_number)
);

COMMENT ON TABLE agent_versions IS 'Agent version history with configuration snapshots';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_versions table';
END $$;

-- ==========================================
-- SECTION 2: CREATE AGENT CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Category info
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    
    -- Hierarchy
    parent_category_id UUID REFERENCES agent_categories(id) ON DELETE SET NULL,
    
    -- Display
    display_order INTEGER DEFAULT 0,
    color TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE agent_categories IS 'Hierarchical categories for agent marketplace';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_categories table';
END $$;

-- ==========================================
-- SECTION 3: CREATE AGENT CATEGORY ASSIGNMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES agent_categories(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    is_primary BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, category_id)
);

COMMENT ON TABLE agent_category_assignments IS 'Maps agents to marketplace categories';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_category_assignments table';
END $$;

-- ==========================================
-- SECTION 4: CREATE AGENT USE CASES
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Use case definition
    use_case_title TEXT NOT NULL,
    use_case_description TEXT,
    example_query TEXT,
    expected_outcome TEXT,
    
    -- Metadata
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_time_minutes INTEGER,
    sequence_order INTEGER,
    
    -- Status
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE agent_use_cases IS 'Example use cases for agents';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_use_cases table';
END $$;

-- ==========================================
-- SECTION 5: CREATE AGENT RATINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    
    -- Context
    conversation_id UUID,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id, user_id)
);

COMMENT ON TABLE agent_ratings IS 'User ratings and reviews for agents';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_ratings table';
END $$;

-- ==========================================
-- SECTION 6: CREATE AGENT CHANGELOG
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    version_id UUID REFERENCES agent_versions(id) ON DELETE SET NULL,
    
    -- Change details
    change_type TEXT CHECK (change_type IN ('feature', 'bugfix', 'improvement', 'deprecation', 'breaking')),
    change_title TEXT NOT NULL,
    change_description TEXT,
    
    -- Metadata
    changed_by UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE agent_changelog IS 'Detailed change log for agent updates';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_changelog table';
END $$;

-- ==========================================
-- SECTION 7: CREATE AGENT MESSAGES
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Communication endpoints
    sender_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    receiver_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Message content
    message_type TEXT CHECK (message_type IN ('request', 'response', 'delegation', 'escalation', 'notification')),
    message_content TEXT NOT NULL,
    
    -- Context
    conversation_id UUID,
    parent_message_id UUID REFERENCES agent_messages(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'processed')) DEFAULT 'sent',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);

COMMENT ON TABLE agent_messages IS 'Multi-agent communication messages';

DO $$
BEGIN
    RAISE NOTICE '✓ Created agent_messages table';
END $$;

-- ==========================================
-- SECTION 8: SEED AGENT CATEGORIES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- Seeding Agent Categories ---';
END $$;

INSERT INTO agent_categories (name, slug, description, display_order)
VALUES 
    ('Regulatory & Compliance', 'regulatory-compliance', 'Agents for regulatory affairs and compliance', 1),
    ('Clinical Research', 'clinical-research', 'Agents for clinical trial design and execution', 2),
    ('Market Access', 'market-access', 'Agents for market access and reimbursement', 3),
    ('Medical Information', 'medical-information', 'Agents for medical information and queries', 4),
    ('Data Analysis', 'data-analysis', 'Agents for data analysis and insights', 5),
    ('Content Generation', 'content-generation', 'Agents for creating and editing content', 6),
    ('Project Management', 'project-management', 'Agents for project planning and execution', 7)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM agent_categories;
    RAISE NOTICE '✓ Seeded % agent categories', category_count;
END $$;

-- ==========================================
-- SECTION 9: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- Creating Indexes ---';
END $$;

-- Agent versions
CREATE INDEX IF NOT EXISTS idx_agent_versions_agent ON agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_versions_active ON agent_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_versions_tag ON agent_versions(version_tag);

-- Agent categories
CREATE INDEX IF NOT EXISTS idx_agent_categories_parent ON agent_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_agent_categories_slug ON agent_categories(slug);

-- Agent category assignments
CREATE INDEX IF NOT EXISTS idx_agent_category_assignments_agent ON agent_category_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_category_assignments_category ON agent_category_assignments(category_id);
CREATE INDEX IF NOT EXISTS idx_agent_category_assignments_primary ON agent_category_assignments(is_primary);

-- Agent use cases
CREATE INDEX IF NOT EXISTS idx_agent_use_cases_agent ON agent_use_cases(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_use_cases_featured ON agent_use_cases(is_featured);

-- Agent ratings
CREATE INDEX IF NOT EXISTS idx_agent_ratings_agent ON agent_ratings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_user ON agent_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_rating ON agent_ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_agent_ratings_public ON agent_ratings(is_public);

-- Agent changelog
CREATE INDEX IF NOT EXISTS idx_agent_changelog_agent ON agent_changelog(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_changelog_version ON agent_changelog(version_id);
CREATE INDEX IF NOT EXISTS idx_agent_changelog_type ON agent_changelog(change_type);

-- Agent messages
CREATE INDEX IF NOT EXISTS idx_agent_messages_sender ON agent_messages(sender_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_receiver ON agent_messages(receiver_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_status ON agent_messages(status);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    version_count INTEGER;
    category_count INTEGER;
    use_case_count INTEGER;
    rating_count INTEGER;
    changelog_count INTEGER;
    message_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO version_count FROM agent_versions;
    SELECT COUNT(*) INTO category_count FROM agent_categories;
    SELECT COUNT(*) INTO use_case_count FROM agent_use_cases;
    SELECT COUNT(*) INTO rating_count FROM agent_ratings;
    SELECT COUNT(*) INTO changelog_count FROM agent_changelog;
    SELECT COUNT(*) INTO message_count FROM agent_messages;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 8 COMPLETE ===';
    RAISE NOTICE 'Agent versions: %', version_count;
    RAISE NOTICE 'Categories: %', category_count;
    RAISE NOTICE 'Use cases: %', use_case_count;
    RAISE NOTICE 'Ratings: %', rating_count;
    RAISE NOTICE 'Changelog entries: %', changelog_count;
    RAISE NOTICE 'Agent messages: %', message_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 8 COMPLETE: VERSIONING, DISCOVERY & MARKETPLACE';
    RAISE NOTICE '=================================================================';
END $$;

SELECT 
    'Agent Versions' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM agent_versions
UNION ALL
SELECT 'Categories', COUNT(*), COUNT(*)
FROM agent_categories
UNION ALL
SELECT 'Category Assignments', COUNT(*), COUNT(*) FILTER (WHERE is_primary = true)
FROM agent_category_assignments
UNION ALL
SELECT 'Use Cases', COUNT(*), COUNT(*) FILTER (WHERE is_featured = true)
FROM agent_use_cases
UNION ALL
SELECT 'Ratings', COUNT(*), COUNT(*) FILTER (WHERE is_public = true)
FROM agent_ratings
UNION ALL
SELECT 'Changelog Entries', COUNT(*), COUNT(*)
FROM agent_changelog
UNION ALL
SELECT 'Agent Messages', COUNT(*), COUNT(*) FILTER (WHERE status = 'processed')
FROM agent_messages;

