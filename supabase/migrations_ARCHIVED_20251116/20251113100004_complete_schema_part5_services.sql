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
CREATE TABLE IF NOT EXISTS expert_consultations (
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
CREATE INDEX IF NOT EXISTS idx_consultations_user ON expert_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_agent ON expert_consultations(agent_id);
CREATE INDEX IF NOT EXISTS idx_consultations_persona ON expert_consultations(persona_id);
CREATE INDEX IF NOT EXISTS idx_consultations_jtbd ON expert_consultations(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON expert_consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_rating ON expert_consultations(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_started ON expert_consultations(started_at DESC);

COMMENT ON TABLE expert_consultations IS '1:1 AI consultant conversations (Ask Expert service)';

-- =============================================================================
-- TABLE 2: expert_messages (conversation messages)
-- =============================================================================
CREATE TABLE IF NOT EXISTS expert_messages (
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
CREATE INDEX IF NOT EXISTS idx_messages_consultation ON expert_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON expert_messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_index ON expert_messages(message_index);
CREATE INDEX IF NOT EXISTS idx_messages_created ON expert_messages(created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON expert_messages USING GIN(to_tsvector('english', content));

COMMENT ON TABLE expert_messages IS 'Individual messages in expert consultations';
COMMENT ON COLUMN expert_messages.citations IS 'JSONB array of knowledge source citations used in response';

-- =============================================================================
-- TABLE 3: consultation_sessions (session management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS consultation_sessions (
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
CREATE INDEX IF NOT EXISTS idx_sessions_consultation ON consultation_sessions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON consultation_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_duration ON consultation_sessions(duration_seconds DESC NULLS LAST);

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
CREATE TABLE IF NOT EXISTS panel_discussions (
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
CREATE INDEX IF NOT EXISTS idx_panels_user ON panel_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_panels_jtbd ON panel_discussions(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_panels_status ON panel_discussions(status);
CREATE INDEX IF NOT EXISTS idx_panels_consensus ON panel_discussions(consensus_reached);
CREATE INDEX IF NOT EXISTS idx_panels_started ON panel_discussions(started_at DESC);

COMMENT ON TABLE panel_discussions IS 'Multi-agent panel discussions (Ask Panel service)';

-- =============================================================================
-- TABLE 2: panel_members (agents participating in panel)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_members (
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
CREATE INDEX IF NOT EXISTS idx_panel_members_panel ON panel_members(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_members_agent ON panel_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_panel_members_role ON panel_members(panel_role);
CREATE INDEX IF NOT EXISTS idx_panel_members_facilitator ON panel_members(is_facilitator);

COMMENT ON TABLE panel_members IS 'Agents participating in panel discussions';

-- =============================================================================
-- TABLE 3: panel_messages (discussion messages)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_messages (
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
CREATE INDEX IF NOT EXISTS idx_panel_messages_panel ON panel_messages(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_messages_round ON panel_messages(round_id);
CREATE INDEX IF NOT EXISTS idx_panel_messages_member ON panel_messages(member_id);
CREATE INDEX IF NOT EXISTS idx_panel_messages_agent ON panel_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_panel_messages_type ON panel_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_panel_messages_index ON panel_messages(message_index);
CREATE INDEX IF NOT EXISTS idx_panel_messages_round_num ON panel_messages(round_number);

COMMENT ON TABLE panel_messages IS 'Messages in panel discussions';

-- =============================================================================
-- TABLE 4: panel_rounds (discussion rounds)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_rounds (
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
CREATE INDEX IF NOT EXISTS idx_panel_rounds_panel ON panel_rounds(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_rounds_number ON panel_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_panel_rounds_status ON panel_rounds(status);

COMMENT ON TABLE panel_rounds IS 'Discussion rounds within panel conversations';

-- Add FK constraint for panel_messages.round_id (now that table exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_panel_messages_round'
  ) THEN
    ALTER TABLE panel_messages ADD CONSTRAINT fk_panel_messages_round
      FOREIGN KEY (round_id) REFERENCES panel_rounds(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================================
-- TABLE 5: panel_consensus (consensus tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_consensus (
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
CREATE INDEX IF NOT EXISTS idx_panel_consensus_panel ON panel_consensus(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_consensus_round ON panel_consensus(round_id);
CREATE INDEX IF NOT EXISTS idx_panel_consensus_confidence ON panel_consensus(confidence_score DESC);

COMMENT ON TABLE panel_consensus IS 'Consensus points identified during panel discussions';

-- =============================================================================
-- TABLE 6: panel_votes (member votes on proposals)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_votes (
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
CREATE INDEX IF NOT EXISTS idx_panel_votes_panel ON panel_votes(panel_id);
CREATE INDEX IF NOT EXISTS idx_panel_votes_member ON panel_votes(member_id);
CREATE INDEX IF NOT EXISTS idx_panel_votes_type ON panel_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_panel_votes_round ON panel_votes(round_number);

COMMENT ON TABLE panel_votes IS 'Member votes during panel discussions';

-- =============================================================================
-- TABLE 7: panel_templates (pre-configured panel setups)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_templates (
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
CREATE INDEX IF NOT EXISTS idx_panel_templates_active ON panel_templates(is_active);

COMMENT ON TABLE panel_templates IS 'Pre-configured panel discussion templates';

-- =============================================================================
-- TABLE 8: panel_facilitator_configs (facilitator AI settings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS panel_facilitator_configs (
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
CREATE INDEX IF NOT EXISTS idx_facilitator_configs_default ON panel_facilitator_configs(is_default);

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
-- =============================================================================
-- PHASE 13: Service - Workflows (Multi-Step Automation)
-- =============================================================================
-- PURPOSE: Create workflow orchestration system
-- TABLES: 10 tables (workflows, tasks, steps, workflow_tasks, task_agents, task_tools, task_skills, task_prerequisites, workflow_step_definitions, workflow_step_connections)
-- TIME: ~25 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: workflows (multi-step processes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',

  -- Classification
  workflow_type TEXT, -- 'sequential', 'parallel', 'conditional', 'hybrid'
  category TEXT, -- 'analysis', 'planning', 'execution', 'reporting'
  complexity complexity_type DEFAULT 'medium',

  -- Associations
  jtbd_id UUID REFERENCES jobs_to_be_done(id) ON DELETE SET NULL,
  solution_id UUID REFERENCES solutions(id) ON DELETE SET NULL,

  -- Configuration
  is_template BOOLEAN DEFAULT false,
  allow_manual_override BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,

  -- Execution
  estimated_duration_minutes INTEGER,
  max_concurrent_executions INTEGER DEFAULT 1,

  -- Status
  status workflow_status DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,

  -- Usage
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2),

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug, version)
);

-- Indexes for workflows
-- SKIPPED: Old workflows table has different columns than gold standard
-- Indexes can be added later after schema alignment
DO $$
BEGIN
  RAISE NOTICE 'Skipping workflows indexes - old schema differs from gold standard';
END $$;

COMMENT ON TABLE workflows IS 'Multi-step automated processes';

-- =============================================================================
-- TABLE 2: tasks (individual workflow tasks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Task Configuration
  task_type TEXT, -- 'analysis', 'generation', 'review', 'decision', 'integration'
  execution_mode TEXT DEFAULT 'automatic', -- 'automatic', 'manual', 'approval_required'

  -- Input/Output Specification
  input_schema JSONB,
  output_schema JSONB,
  -- Example:
  -- {
  --   "type": "object",
  --   "properties": {
  --     "product_name": {"type": "string", "required": true},
  --     "launch_date": {"type": "string", "format": "date"}
  --   }
  -- }

  -- Execution
  estimated_duration_minutes INTEGER,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 300,

  -- Model Configuration
  model_config_id UUID REFERENCES model_configurations(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- Indexes for tasks
-- SKIPPED: Old tasks table has different columns than gold standard
-- Indexes can be added later after schema alignment
DO $$
BEGIN
  RAISE NOTICE 'Skipping tasks indexes - old schema differs from gold standard';
END $$;

COMMENT ON TABLE tasks IS 'Reusable task definitions for workflows';

-- =============================================================================
-- TABLE 3: steps (task execution steps)
-- =============================================================================
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,

  -- Step Configuration
  step_type TEXT, -- 'prompt', 'tool_call', 'human_review', 'condition', 'loop'
  instruction TEXT,

  -- Conditional Logic
  condition_expression JSONB, -- JSON logic for branching
  loop_config JSONB, -- Loop configuration if step_type = 'loop'

  -- Tool/Prompt Association
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,

  -- Error Handling
  on_error TEXT DEFAULT 'retry', -- 'retry', 'skip', 'fail', 'continue'
  max_retries INTEGER DEFAULT 3,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, step_order)
);

-- Indexes for steps
CREATE INDEX IF NOT EXISTS idx_steps_task ON steps(task_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON steps(step_order);
CREATE INDEX IF NOT EXISTS idx_steps_type ON steps(step_type);
CREATE INDEX IF NOT EXISTS idx_steps_prompt ON steps(prompt_id);
CREATE INDEX IF NOT EXISTS idx_steps_tool ON steps(tool_id);

COMMENT ON TABLE steps IS 'Execution steps within tasks';

-- =============================================================================
-- JUNCTION TABLE 1: workflow_tasks (tasks in workflows)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Position & Dependencies
  task_order INTEGER NOT NULL,
  depends_on_task_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Prerequisites

  -- Execution Control
  is_required BOOLEAN DEFAULT true,
  is_parallel BOOLEAN DEFAULT false, -- Can run in parallel with siblings

  -- Input/Output Mapping
  input_mapping JSONB, -- How to map workflow inputs to task inputs
  output_mapping JSONB, -- How to map task outputs to workflow context

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(workflow_id, task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_workflow ON workflow_tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_task ON workflow_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_order ON workflow_tasks(task_order);

COMMENT ON TABLE workflow_tasks IS 'Maps tasks to workflows with ordering and dependencies';

-- =============================================================================
-- JUNCTION TABLE 2: task_agents (agents assigned to tasks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role
  agent_role TEXT DEFAULT 'executor', -- 'executor', 'reviewer', 'approver'
  is_primary BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, agent_id, agent_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_agents_task ON task_agents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_agents_agent ON task_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_task_agents_role ON task_agents(agent_role);

COMMENT ON TABLE task_agents IS 'Agents assigned to execute tasks';

-- =============================================================================
-- JUNCTION TABLE 3: task_tools (tools used in tasks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,

  -- Configuration
  is_required BOOLEAN DEFAULT false,
  custom_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, tool_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_tools_task ON task_tools(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tools_tool ON task_tools(tool_id);

COMMENT ON TABLE task_tools IS 'Tools available to tasks';

-- =============================================================================
-- JUNCTION TABLE 4: task_skills (skills required for tasks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Requirements
  required_proficiency expertise_level DEFAULT 'intermediate',
  is_required BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, skill_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_skills_task ON task_skills(task_id);
CREATE INDEX IF NOT EXISTS idx_task_skills_skill ON task_skills(skill_id);

COMMENT ON TABLE task_skills IS 'Skills required for task execution';

-- =============================================================================
-- TABLE 4: task_prerequisites (task dependencies)
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_prerequisites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

  -- Dependency Type
  dependency_type TEXT DEFAULT 'blocking', -- 'blocking', 'informational', 'optional'

  -- Metadata
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(task_id, prerequisite_task_id),
  CHECK (task_id != prerequisite_task_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_prereqs_task ON task_prerequisites(task_id);
CREATE INDEX IF NOT EXISTS idx_task_prereqs_prerequisite ON task_prerequisites(prerequisite_task_id);

COMMENT ON TABLE task_prerequisites IS 'Task dependency relationships';

-- =============================================================================
-- TABLE 5: workflow_step_definitions (visual workflow designer nodes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_step_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Node Details
  node_type TEXT NOT NULL, -- 'start', 'end', 'task', 'decision', 'parallel', 'merge'
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,

  -- Visual Position (for workflow designer UI)
  position_x INTEGER,
  position_y INTEGER,

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_step_defs_workflow ON workflow_step_definitions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_defs_task ON workflow_step_definitions(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_defs_type ON workflow_step_definitions(node_type);

COMMENT ON TABLE workflow_step_definitions IS 'Visual workflow designer node definitions';

-- =============================================================================
-- TABLE 6: workflow_step_connections (edges between nodes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_step_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  from_step_id UUID NOT NULL REFERENCES workflow_step_definitions(id) ON DELETE CASCADE,
  to_step_id UUID NOT NULL REFERENCES workflow_step_definitions(id) ON DELETE CASCADE,

  -- Connection Details
  connection_type TEXT DEFAULT 'default', -- 'default', 'condition_true', 'condition_false', 'error'
  condition_expression JSONB,

  -- Metadata
  label TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(workflow_id, from_step_id, to_step_id, connection_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_connections_workflow ON workflow_step_connections(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_from ON workflow_step_connections(from_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_connections_to ON workflow_step_connections(to_step_id);

COMMENT ON TABLE workflow_step_connections IS 'Connections between workflow nodes (edges in graph)';

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
    AND tablename IN ('workflows', 'tasks', 'steps', 'workflow_tasks', 'task_agents', 'task_tools', 'task_skills', 'task_prerequisites', 'workflow_step_definitions', 'workflow_step_connections');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 13 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Workflows Service Features:';
    RAISE NOTICE '  - Multi-step process automation';
    RAISE NOTICE '  - Task orchestration';
    RAISE NOTICE '  - Dependency management';
    RAISE NOTICE '  - Visual workflow designer';
    RAISE NOTICE '  - Agent/tool/skill assignment';
    RAISE NOTICE '  - Conditional branching';
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 77 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 14 (Solutions Marketplace)';
    RAISE NOTICE '';
END $$;
