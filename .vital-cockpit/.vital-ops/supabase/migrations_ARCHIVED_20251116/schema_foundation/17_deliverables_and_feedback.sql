-- =============================================================================
-- PHASE 17: Deliverables & Feedback
-- =============================================================================
-- PURPOSE: Track outputs, artifacts, and user feedback
-- TABLES: 6 tables (deliverables, artifacts, consultation_feedback, votes, vote_records, deliverable_versions)
-- TIME: ~10 minutes
-- =============================================================================

-- =============================================================================
-- TABLE 1: deliverables (workflow/consultation outputs)
-- =============================================================================
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Source (one of these)
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panel_discussions(id) ON DELETE CASCADE,

  -- Deliverable Details
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT, -- 'report', 'analysis', 'recommendation', 'document', 'presentation'
  format TEXT DEFAULT 'markdown', -- 'markdown', 'pdf', 'docx', 'html', 'json'

  -- Content
  content TEXT,
  content_url TEXT, -- Link to file in storage

  -- Template
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'final', 'archived'
  version TEXT DEFAULT '1.0.0',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_deliverables_tenant ON deliverables(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deliverables_workflow ON deliverables(workflow_execution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deliverables_consultation ON deliverables(consultation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deliverables_panel ON deliverables(panel_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deliverables_type ON deliverables(deliverable_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_deliverables_status ON deliverables(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE deliverables IS 'Output deliverables from workflows and consultations';

-- =============================================================================
-- TABLE 2: artifacts (intermediate outputs)
-- =============================================================================
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Source
  execution_step_id UUID REFERENCES workflow_execution_steps(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,

  -- Artifact Details
  name TEXT NOT NULL,
  artifact_type TEXT, -- 'data', 'chart', 'table', 'image', 'file'
  mime_type TEXT,

  -- Content
  content JSONB,
  file_url TEXT,
  file_size_bytes BIGINT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_artifacts_tenant ON artifacts(tenant_id);
CREATE INDEX idx_artifacts_step ON artifacts(execution_step_id);
CREATE INDEX idx_artifacts_deliverable ON artifacts(deliverable_id);
CREATE INDEX idx_artifacts_type ON artifacts(artifact_type);

COMMENT ON TABLE artifacts IS 'Intermediate artifacts and attachments';

-- =============================================================================
-- TABLE 3: consultation_feedback (user ratings and feedback)
-- =============================================================================
CREATE TABLE consultation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source (one of these)
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panel_discussions(id) ON DELETE CASCADE,
  workflow_execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,

  -- Feedback
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,

  -- Categories
  was_helpful BOOLEAN,
  was_accurate BOOLEAN,
  was_complete BOOLEAN,

  -- Detailed Ratings
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  relevance_rating INTEGER CHECK (relevance_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_feedback_consultation ON consultation_feedback(consultation_id);
CREATE INDEX idx_feedback_panel ON consultation_feedback(panel_id);
CREATE INDEX idx_feedback_workflow ON consultation_feedback(workflow_execution_id);
CREATE INDEX idx_feedback_user ON consultation_feedback(user_id);
CREATE INDEX idx_feedback_rating ON consultation_feedback(rating);

COMMENT ON TABLE consultation_feedback IS 'User feedback and ratings for consultations and workflows';

-- =============================================================================
-- TABLE 4: votes (generic voting system)
-- =============================================================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Vote Context
  vote_context TEXT NOT NULL, -- 'deliverable', 'recommendation', 'decision'
  context_id UUID NOT NULL, -- ID of the thing being voted on

  -- Vote Details
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vote_type TEXT, -- 'upvote', 'downvote', 'approve', 'reject'
  vote_weight INTEGER DEFAULT 1,

  -- Rationale
  comment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(vote_context, context_id, user_id)
);

-- Indexes
CREATE INDEX idx_votes_tenant ON votes(tenant_id);
CREATE INDEX idx_votes_context ON votes(vote_context, context_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_type ON votes(vote_type);

COMMENT ON TABLE votes IS 'Generic voting system for various contexts';

-- =============================================================================
-- TABLE 5: vote_records (audit trail for votes)
-- =============================================================================
CREATE TABLE vote_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,

  -- Change Details
  previous_vote_type TEXT,
  new_vote_type TEXT,
  change_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_vote_records_vote ON vote_records(vote_id);
CREATE INDEX idx_vote_records_created ON vote_records(created_at DESC);

COMMENT ON TABLE vote_records IS 'Audit trail for vote changes';

-- =============================================================================
-- TABLE 6: deliverable_versions (version history)
-- =============================================================================
CREATE TABLE deliverable_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,

  -- Version Details
  version TEXT NOT NULL,
  content TEXT,
  content_url TEXT,

  -- Change Tracking
  change_summary TEXT,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(deliverable_id, version)
);

-- Indexes
CREATE INDEX idx_deliverable_versions_deliverable ON deliverable_versions(deliverable_id);
CREATE INDEX idx_deliverable_versions_created ON deliverable_versions(created_at DESC);

COMMENT ON TABLE deliverable_versions IS 'Version history for deliverables';

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
    AND tablename IN ('deliverables', 'artifacts', 'consultation_feedback', 'votes', 'vote_records', 'deliverable_versions');

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 17 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Cumulative Progress: 94 tables created';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 18-25 (Governance & Monitoring)';
    RAISE NOTICE '';
END $$;
