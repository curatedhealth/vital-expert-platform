-- =============================================================================
-- PHASE 12: Service - Ask Panel (Multi-Agent Discussions)
-- =============================================================================
-- PURPOSE: Create multi-agent panel discussion system
-- TABLES: 8 tables (panel_discussions, panel_members, panel_messages, panel_rounds, panel_consensus, panel_votes, panel_templates, panel_facilitator_configs)
-- TIME: ~20 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: panel_discussions (multi-agent conversations)
-- =============================================================================
CREATE TABLE panel_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Requester
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,

  -- Context
  jtbd_id UUID REFERENCES jobs_to_be_done(id) ON DELETE SET NULL,
  initial_question TEXT NOT NULL,
  discussion_topic TEXT,

  -- Panel Configuration
  panel_size INTEGER CHECK (panel_size BETWEEN 2 AND 10),
  min_rounds INTEGER DEFAULT 2,
  max_rounds INTEGER DEFAULT 5,
  current_round INTEGER DEFAULT 0,

  -- Facilitation
  enable_facilitator BOOLEAN DEFAULT true, -- AI facilitator to moderate
  facilitator_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  enable_voting BOOLEAN DEFAULT true,
  enable_consensus BOOLEAN DEFAULT true,

  -- Status
  status conversation_status DEFAULT 'active',
  consensus_reached BOOLEAN DEFAULT false,
  consensus_confidence NUMERIC(3,2) CHECK (consensus_confidence BETWEEN 0 AND 1),

  -- Outputs
  final_recommendation TEXT,
  summary TEXT,

  -- Metrics
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10,2) DEFAULT 0,

  -- Quality
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for panel_discussions
CREATE INDEX idx_panels_tenant ON panel_discussions(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_panels_user ON panel_discussions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_panels_jtbd ON panel_discussions(jtbd_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_panels_status ON panel_discussions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_panels_consensus ON panel_discussions(consensus_reached);
CREATE INDEX idx_panels_started ON panel_discussions(started_at DESC);

COMMENT ON TABLE panel_discussions IS 'Multi-agent panel discussions (Ask Panel service)';

-- =============================================================================
-- TABLE 2: panel_members (agents participating in panel)
-- =============================================================================
CREATE TABLE panel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panel_discussions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role in Panel
  panel_role TEXT DEFAULT 'expert', -- 'expert', 'facilitator', 'devil_advocate', 'synthesizer'
  is_facilitator BOOLEAN DEFAULT false,

  -- Participation
  message_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,

  -- Ordering
  join_order INTEGER, -- Order in which member was added

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(panel_id, agent_id)
);

-- Indexes for panel_members
CREATE INDEX idx_panel_members_panel ON panel_members(panel_id);
CREATE INDEX idx_panel_members_agent ON panel_members(agent_id);
CREATE INDEX idx_panel_members_role ON panel_members(panel_role);
CREATE INDEX idx_panel_members_facilitator ON panel_members(is_facilitator) WHERE is_facilitator = true;

COMMENT ON TABLE panel_members IS 'Agents participating in panel discussions';

-- =============================================================================
-- TABLE 3: panel_messages (discussion messages)
-- =============================================================================
CREATE TABLE panel_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panel_discussions(id) ON DELETE CASCADE,
  round_id UUID, -- References panel_rounds (created below)

  -- Author
  member_id UUID REFERENCES panel_members(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Message Details
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'response', -- 'response', 'question', 'counter_argument', 'agreement', 'synthesis'
  message_index INTEGER NOT NULL,
  round_number INTEGER,

  -- AI Metadata
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd NUMERIC(10,6),

  -- References
  in_reply_to_id UUID REFERENCES panel_messages(id) ON DELETE SET NULL,
  citations JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(panel_id, message_index)
);

-- Indexes for panel_messages
CREATE INDEX idx_panel_messages_panel ON panel_messages(panel_id);
CREATE INDEX idx_panel_messages_round ON panel_messages(round_id);
CREATE INDEX idx_panel_messages_member ON panel_messages(member_id);
CREATE INDEX idx_panel_messages_agent ON panel_messages(agent_id);
CREATE INDEX idx_panel_messages_type ON panel_messages(message_type);
CREATE INDEX idx_panel_messages_index ON panel_messages(message_index);
CREATE INDEX idx_panel_messages_round_num ON panel_messages(round_number);

COMMENT ON TABLE panel_messages IS 'Messages in panel discussions';

-- =============================================================================
-- TABLE 4: panel_rounds (discussion rounds)
-- =============================================================================
CREATE TABLE panel_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panel_discussions(id) ON DELETE CASCADE,

  -- Round Details
  round_number INTEGER NOT NULL,
  round_topic TEXT,
  round_goal TEXT, -- 'explore', 'debate', 'synthesize', 'decide'

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'completed'
  message_count INTEGER DEFAULT 0,

  -- Outputs
  round_summary TEXT,
  key_insights JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(panel_id, round_number)
);

-- Indexes for panel_rounds
CREATE INDEX idx_panel_rounds_panel ON panel_rounds(panel_id);
CREATE INDEX idx_panel_rounds_number ON panel_rounds(round_number);
CREATE INDEX idx_panel_rounds_status ON panel_rounds(status);

COMMENT ON TABLE panel_rounds IS 'Discussion rounds within panel conversations';

-- Add FK constraint for panel_messages.round_id (now that table exists)
ALTER TABLE panel_messages ADD CONSTRAINT fk_panel_messages_round
  FOREIGN KEY (round_id) REFERENCES panel_rounds(id) ON DELETE SET NULL;

-- =============================================================================
-- TABLE 5: panel_consensus (consensus tracking)
-- =============================================================================
CREATE TABLE panel_consensus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panel_discussions(id) ON DELETE CASCADE,
  round_id UUID REFERENCES panel_rounds(id) ON DELETE CASCADE,

  -- Consensus Details
  consensus_statement TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  agreement_percentage NUMERIC(5,2),

  -- Support
  supporting_members INTEGER,
  total_members INTEGER,

  -- Analysis
  key_agreements JSONB DEFAULT '[]'::jsonb,
  remaining_disagreements JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  identified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for panel_consensus
CREATE INDEX idx_panel_consensus_panel ON panel_consensus(panel_id);
CREATE INDEX idx_panel_consensus_round ON panel_consensus(round_id);
CREATE INDEX idx_panel_consensus_confidence ON panel_consensus(confidence_score DESC);

COMMENT ON TABLE panel_consensus IS 'Consensus points identified during panel discussions';

-- =============================================================================
-- TABLE 6: panel_votes (member votes on proposals)
-- =============================================================================
CREATE TABLE panel_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  panel_id UUID NOT NULL REFERENCES panel_discussions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES panel_members(id) ON DELETE CASCADE,

  -- Vote Details
  vote_topic TEXT NOT NULL,
  vote_type TEXT, -- 'approval', 'rating', 'ranking', 'binary'
  vote_value JSONB NOT NULL, -- Flexible: true/false, 1-5, array of ranked options

  -- Context
  round_number INTEGER,
  message_id UUID REFERENCES panel_messages(id) ON DELETE SET NULL,

  -- Rationale
  rationale TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(panel_id, member_id, vote_topic, round_number)
);

-- Indexes for panel_votes
CREATE INDEX idx_panel_votes_panel ON panel_votes(panel_id);
CREATE INDEX idx_panel_votes_member ON panel_votes(member_id);
CREATE INDEX idx_panel_votes_type ON panel_votes(vote_type);
CREATE INDEX idx_panel_votes_round ON panel_votes(round_number);

COMMENT ON TABLE panel_votes IS 'Member votes during panel discussions';

-- =============================================================================
-- TABLE 7: panel_templates (pre-configured panel setups)
-- =============================================================================
CREATE TABLE panel_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,

  -- Configuration
  panel_size INTEGER CHECK (panel_size BETWEEN 2 AND 10),
  recommended_agents UUID[] DEFAULT ARRAY[]::UUID[], -- Array of agent IDs
  default_rounds INTEGER DEFAULT 2,

  -- Structure
  round_templates JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"round": 1, "goal": "explore", "topic": "Initial analysis"}]

  -- Settings
  enable_voting BOOLEAN DEFAULT true,
  enable_consensus BOOLEAN DEFAULT true,
  enable_facilitator BOOLEAN DEFAULT true,

  -- Usage
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes for panel_templates
CREATE INDEX idx_panel_templates_tenant ON panel_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_panel_templates_active ON panel_templates(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE panel_templates IS 'Pre-configured panel discussion templates';

-- =============================================================================
-- TABLE 8: panel_facilitator_configs (facilitator AI settings)
-- =============================================================================
CREATE TABLE panel_facilitator_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,

  -- Behavior
  intervention_style TEXT DEFAULT 'moderate', -- 'minimal', 'moderate', 'active'
  consensus_threshold NUMERIC(3,2) DEFAULT 0.8 CHECK (consensus_threshold BETWEEN 0 AND 1),

  -- Facilitation Rules
  max_message_length INTEGER DEFAULT 500,
  encourage_diverse_views BOOLEAN DEFAULT true,
  summarize_rounds BOOLEAN DEFAULT true,
  identify_consensus BOOLEAN DEFAULT true,

  -- Prompts
  opening_prompt TEXT,
  transition_prompt TEXT,
  closing_prompt TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_facilitator_configs_tenant ON panel_facilitator_configs(tenant_id);
CREATE INDEX idx_facilitator_configs_default ON panel_facilitator_configs(is_default) WHERE is_default = true;

COMMENT ON TABLE panel_facilitator_configs IS 'AI facilitator configuration for panel discussions';

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
    AND tablename IN ('panel_discussions', 'panel_members', 'panel_messages', 'panel_rounds', 'panel_consensus', 'panel_votes', 'panel_templates', 'panel_facilitator_configs');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 12 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Ask Panel Service Features:';
    RAISE NOTICE '  - Multi-agent panel discussions';
    RAISE NOTICE '  - Round-based structure';
    RAISE NOTICE '  - Consensus tracking';
    RAISE NOTICE '  - Voting system';
    RAISE NOTICE '  - AI facilitator';
    RAISE NOTICE '  - Panel templates';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 67 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 13 (Workflows Service)';
    RAISE NOTICE '';
END $$;
