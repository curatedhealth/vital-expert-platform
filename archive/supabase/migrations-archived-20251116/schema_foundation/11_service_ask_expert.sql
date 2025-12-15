-- =============================================================================
-- PHASE 11: Service - Ask Expert (1:1 Consultations)
-- =============================================================================
-- PURPOSE: Create 1:1 AI consultant conversation system
-- TABLES: 3 tables (expert_consultations, expert_messages, consultation_sessions)
-- TIME: ~15 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: expert_consultations (1:1 conversations)
-- =============================================================================
CREATE TABLE expert_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Participants
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Context
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL, -- User acting as this persona
  jtbd_id UUID REFERENCES jobs_to_be_done(id) ON DELETE SET NULL, -- Job context

  -- Conversation Details
  title TEXT,
  initial_query TEXT,
  conversation_summary TEXT,

  -- Status
  status conversation_status DEFAULT 'active',

  -- Configuration
  model_config_id UUID REFERENCES model_configurations(id) ON DELETE SET NULL,
  enable_streaming BOOLEAN DEFAULT true,

  -- Metrics
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,2) DEFAULT 0,
  average_response_time_ms INTEGER,

  -- Quality
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  was_helpful BOOLEAN,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for expert_consultations
CREATE INDEX idx_consultations_tenant ON expert_consultations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_user ON expert_consultations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_agent ON expert_consultations(agent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_persona ON expert_consultations(persona_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_jtbd ON expert_consultations(jtbd_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_status ON expert_consultations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultations_rating ON expert_consultations(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX idx_consultations_started ON expert_consultations(started_at DESC);

COMMENT ON TABLE expert_consultations IS '1:1 AI consultant conversations (Ask Expert service)';

-- =============================================================================
-- TABLE 2: expert_messages (conversation messages)
-- =============================================================================
CREATE TABLE expert_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES expert_consultations(id) ON DELETE CASCADE,

  -- Message Details
  role message_role NOT NULL,
  content TEXT NOT NULL,
  message_index INTEGER NOT NULL, -- Position in conversation

  -- AI Response Metadata (for assistant messages)
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  response_time_ms INTEGER,
  cost_usd NUMERIC(10,6),

  -- Function Calling
  function_call JSONB, -- Function call request
  function_response JSONB, -- Function call result

  -- Citations & Sources
  citations JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"source_id": "uuid", "chunk_id": "uuid", "relevance": 0.95}]

  -- Quality
  was_regenerated BOOLEAN DEFAULT false,
  regeneration_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(consultation_id, message_index)
);

-- Indexes for expert_messages
CREATE INDEX idx_messages_consultation ON expert_messages(consultation_id);
CREATE INDEX idx_messages_role ON expert_messages(role);
CREATE INDEX idx_messages_index ON expert_messages(message_index);
CREATE INDEX idx_messages_created ON expert_messages(created_at DESC);

-- Full-text search
CREATE INDEX idx_messages_content_search ON expert_messages USING GIN(to_tsvector('english', content));

COMMENT ON TABLE expert_messages IS 'Individual messages in expert consultations';
COMMENT ON COLUMN expert_messages.citations IS 'JSONB array of knowledge source citations used in response';

-- =============================================================================
-- TABLE 3: consultation_sessions (session management)
-- =============================================================================
CREATE TABLE consultation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES expert_consultations(id) ON DELETE CASCADE,

  -- Session Details
  session_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Activity
  messages_in_session INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,

  -- Context
  context_snapshot JSONB, -- Snapshot of conversation context at session start

  -- Device/Client
  user_agent TEXT,
  ip_address INET,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for consultation_sessions
CREATE INDEX idx_sessions_consultation ON consultation_sessions(consultation_id);
CREATE INDEX idx_sessions_start ON consultation_sessions(session_start DESC);
CREATE INDEX idx_sessions_duration ON consultation_sessions(duration_seconds DESC NULLS LAST);

COMMENT ON TABLE consultation_sessions IS 'User session tracking for consultations (for analytics and context)';

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get consultation history for user
CREATE OR REPLACE FUNCTION get_user_consultations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  agent_name TEXT,
  title TEXT,
  status conversation_status,
  message_count INTEGER,
  started_at TIMESTAMPTZ,
  user_rating INTEGER
)
LANGUAGE SQL STABLE AS $$
  SELECT
    c.id,
    a.name as agent_name,
    c.title,
    c.status,
    c.message_count,
    c.started_at,
    c.user_rating
  FROM expert_consultations c
  JOIN agents a ON c.agent_id = a.id
  WHERE c.user_id = p_user_id
  AND c.deleted_at IS NULL
  ORDER BY c.started_at DESC
  LIMIT p_limit;
$$;

-- Function to get conversation with messages
CREATE OR REPLACE FUNCTION get_consultation_with_messages(p_consultation_id UUID)
RETURNS TABLE(
  consultation_id UUID,
  agent_name TEXT,
  title TEXT,
  status conversation_status,
  message_id UUID,
  role message_role,
  content TEXT,
  message_index INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE AS $$
  SELECT
    c.id,
    a.name,
    c.title,
    c.status,
    m.id,
    m.role,
    m.content,
    m.message_index,
    m.created_at
  FROM expert_consultations c
  JOIN agents a ON c.agent_id = a.id
  LEFT JOIN expert_messages m ON c.id = m.consultation_id
  WHERE c.id = p_consultation_id
  AND c.deleted_at IS NULL
  ORDER BY m.message_index;
$$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('expert_consultations', 'expert_messages', 'consultation_sessions');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 11 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Helper functions: 2';
    RAISE NOTICE '';
    RAISE NOTICE 'Ask Expert Service Features:';
    RAISE NOTICE '  - 1:1 AI consultant conversations';
    RAISE NOTICE '  - Message history with full context';
    RAISE NOTICE '  - Token tracking and cost monitoring';
    RAISE NOTICE '  - Citation support for RAG';
    RAISE NOTICE '  - Session tracking';
    RAISE NOTICE '  - User ratings and feedback';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 59 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 12 (Ask Panel Service)';
    RAISE NOTICE '';
END $$;
