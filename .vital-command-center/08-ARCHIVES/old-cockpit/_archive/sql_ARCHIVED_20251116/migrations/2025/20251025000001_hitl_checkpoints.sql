-- ============================================================================
-- Human-in-the-Loop (HITL) Checkpoints Schema
--
-- Tables for:
-- - Risk assessment and classification
-- - Human review workflows
-- - Approval checkpoints
-- - Audit trails
-- - Compliance logging
--
-- Created: 2025-10-25
-- Phase: 4 Week 3 - HITL Checkpoints
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. RISK ASSESSMENT TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Context
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    conversation_id UUID,

    -- Risk classification
    risk_level TEXT NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'minimal')),
    risk_category TEXT NOT NULL,  -- medical_advice, dosage, diagnosis, procedure, etc.

    -- Risk factors
    confidence_score NUMERIC(3, 2),  -- Agent's confidence in response
    evidence_quality TEXT,  -- From evidence detector
    entity_risk_flags JSONB DEFAULT '[]'::jsonb,  -- High-risk entities detected
    keyword_triggers TEXT[],  -- Keywords that triggered risk assessment

    -- Content being assessed
    content_type TEXT NOT NULL CHECK (content_type IN ('message', 'recommendation', 'diagnosis', 'treatment_plan', 'prescription')),
    content_text TEXT NOT NULL,
    content_metadata JSONB DEFAULT '{}'::jsonb,

    -- Assessment details
    risk_score NUMERIC(3, 2) NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
    risk_factors JSONB NOT NULL,  -- Detailed breakdown of risk factors
    mitigation_suggestions TEXT[],  -- Suggested mitigations

    -- Decision
    requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    auto_approved BOOLEAN NOT NULL DEFAULT FALSE,
    auto_rejected BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Indexes
    CONSTRAINT valid_risk_score CHECK (risk_score BETWEEN 0 AND 1),
    CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1)
);

-- Indexes for risk_assessments
CREATE INDEX idx_risk_assessments_session ON risk_assessments (session_id, assessed_at DESC);
CREATE INDEX idx_risk_assessments_user ON risk_assessments (user_id, assessed_at DESC);
CREATE INDEX idx_risk_assessments_agent ON risk_assessments (agent_id, risk_level, assessed_at DESC);
CREATE INDEX idx_risk_assessments_level ON risk_assessments (risk_level, requires_review);
CREATE INDEX idx_risk_assessments_review_pending ON risk_assessments (requires_review, assessed_at)
    WHERE requires_review = TRUE AND auto_approved = FALSE AND auto_rejected = FALSE;

-- ----------------------------------------------------------------------------
-- 2. REVIEW QUEUE TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS review_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reference to risk assessment
    risk_assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,

    -- Context
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

    -- Priority and routing
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),  -- 10 = highest
    queue_name TEXT NOT NULL DEFAULT 'default',  -- default, medical, regulatory, technical
    assigned_to TEXT,  -- Reviewer user ID

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')),

    -- Review details
    review_type TEXT NOT NULL CHECK (review_type IN ('safety', 'accuracy', 'compliance', 'quality')),
    review_notes TEXT,

    -- Deadlines
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,

    -- SLA tracking
    sla_minutes INTEGER NOT NULL DEFAULT 60,  -- Default 1 hour SLA
    sla_breached BOOLEAN GENERATED ALWAYS AS (
        CASE
            WHEN reviewed_at IS NULL AND NOW() > (created_at + (sla_minutes || ' minutes')::INTERVAL)
            THEN TRUE
            ELSE FALSE
        END
    ) STORED,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 10)
);

-- Indexes for review_queue
CREATE INDEX idx_review_queue_status ON review_queue (status, priority DESC, created_at);
CREATE INDEX idx_review_queue_assigned ON review_queue (assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_review_queue_pending ON review_queue (queue_name, priority DESC, created_at)
    WHERE status = 'pending';
CREATE INDEX idx_review_queue_sla ON review_queue (sla_breached, created_at) WHERE sla_breached = TRUE;
CREATE INDEX idx_review_queue_agent ON review_queue (agent_id, status);

-- ----------------------------------------------------------------------------
-- 3. REVIEW DECISIONS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS review_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reference
    review_queue_id UUID NOT NULL REFERENCES review_queue(id) ON DELETE CASCADE,
    risk_assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,

    -- Reviewer
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT,
    reviewer_role TEXT,  -- medical_expert, safety_officer, compliance_officer

    -- Decision
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'approved_with_changes', 'rejected', 'escalated', 'needs_more_info')),
    decision_rationale TEXT NOT NULL,

    -- Changes/suggestions
    suggested_changes TEXT,
    required_actions TEXT[],

    -- Escalation
    escalated_to TEXT,  -- User ID of person escalated to
    escalation_reason TEXT,

    -- Timestamps
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for review_decisions
CREATE INDEX idx_review_decisions_queue ON review_decisions (review_queue_id);
CREATE INDEX idx_review_decisions_reviewer ON review_decisions (reviewer_id, decided_at DESC);
CREATE INDEX idx_review_decisions_decision ON review_decisions (decision, decided_at DESC);

-- ----------------------------------------------------------------------------
-- 4. HITL CHECKPOINTS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hitl_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Context
    session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    conversation_id UUID,

    -- Checkpoint details
    checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN (
        'before_diagnosis', 'before_treatment', 'before_prescription',
        'before_procedure', 'before_referral', 'high_risk_response',
        'regulatory_compliance', 'custom'
    )),
    checkpoint_trigger TEXT NOT NULL,  -- What triggered the checkpoint

    -- Content requiring approval
    pending_action TEXT NOT NULL,
    pending_content JSONB NOT NULL,  -- The content awaiting approval

    -- Risk context
    risk_assessment_id UUID REFERENCES risk_assessments(id) ON DELETE SET NULL,
    risk_level TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'bypassed', 'expired')),

    -- Approval
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,

    -- Rejection
    rejected_by TEXT,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Timeout
    timeout_minutes INTEGER NOT NULL DEFAULT 30,
    expires_at TIMESTAMPTZ GENERATED ALWAYS AS (created_at + (timeout_minutes || ' minutes')::INTERVAL) STORED,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for hitl_checkpoints
CREATE INDEX idx_hitl_checkpoints_session ON hitl_checkpoints (session_id, created_at DESC);
CREATE INDEX idx_hitl_checkpoints_status ON hitl_checkpoints (status, created_at);
CREATE INDEX idx_hitl_checkpoints_pending ON hitl_checkpoints (user_id, status, created_at)
    WHERE status = 'pending';
CREATE INDEX idx_hitl_checkpoints_expired ON hitl_checkpoints (expires_at)
    WHERE status = 'pending' AND expires_at < NOW();

-- Auto-expire checkpoints
CREATE OR REPLACE FUNCTION auto_expire_checkpoints()
RETURNS INTEGER AS $$
DECLARE
    v_expired_count INTEGER;
BEGIN
    UPDATE hitl_checkpoints
    SET status = 'expired',
        resolved_at = NOW()
    WHERE status = 'pending'
        AND expires_at < NOW();

    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 5. AUDIT TRAIL TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Context
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Event details
    event_type TEXT NOT NULL,  -- risk_assessed, review_created, decision_made, checkpoint_triggered, etc.
    event_category TEXT NOT NULL,  -- safety, compliance, quality, security

    -- Actor
    actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'user', 'agent', 'reviewer', 'admin')),
    actor_id TEXT,
    actor_name TEXT,

    -- Action
    action TEXT NOT NULL,
    action_target TEXT,  -- What was acted upon
    action_result TEXT,  -- Result of action

    -- Before/after state
    state_before JSONB,
    state_after JSONB,

    -- References
    reference_id UUID,  -- ID of related record (risk_assessment, review_queue, etc.)
    reference_type TEXT,  -- Type of referenced record

    -- Risk and compliance
    risk_level TEXT,
    compliance_tags TEXT[],

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Client info
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for audit_trail
CREATE INDEX idx_audit_trail_user ON audit_trail (user_id, created_at DESC);
CREATE INDEX idx_audit_trail_agent ON audit_trail (agent_id, created_at DESC);
CREATE INDEX idx_audit_trail_type ON audit_trail (event_type, created_at DESC);
CREATE INDEX idx_audit_trail_category ON audit_trail (event_category, created_at DESC);
CREATE INDEX idx_audit_trail_actor ON audit_trail (actor_type, actor_id, created_at DESC);
CREATE INDEX idx_audit_trail_reference ON audit_trail (reference_type, reference_id);
CREATE INDEX idx_audit_trail_risk ON audit_trail (risk_level, created_at DESC) WHERE risk_level IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 6. COMPLIANCE REPORTS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Report details
    report_type TEXT NOT NULL,  -- daily, weekly, monthly, annual, incident
    report_period_start TIMESTAMPTZ NOT NULL,
    report_period_end TIMESTAMPTZ NOT NULL,

    -- Scope
    agent_ids UUID[],  -- Specific agents (NULL = all)
    user_ids TEXT[],  -- Specific users (NULL = all)

    -- Metrics
    total_risk_assessments INTEGER NOT NULL DEFAULT 0,
    high_risk_count INTEGER NOT NULL DEFAULT 0,
    reviews_required INTEGER NOT NULL DEFAULT 0,
    reviews_completed INTEGER NOT NULL DEFAULT 0,
    approval_rate NUMERIC(5, 2),  -- Percentage
    avg_review_time_minutes INTEGER,
    sla_breach_count INTEGER NOT NULL DEFAULT 0,

    -- Issues
    critical_issues JSONB DEFAULT '[]'::jsonb,
    warnings JSONB DEFAULT '[]'::jsonb,

    -- Generated
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by TEXT,

    -- Export
    report_data JSONB NOT NULL,
    report_url TEXT,  -- URL to full report

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_period CHECK (report_period_end >= report_period_start)
);

-- Indexes for compliance_reports
CREATE INDEX idx_compliance_reports_type ON compliance_reports (report_type, report_period_end DESC);
CREATE INDEX idx_compliance_reports_period ON compliance_reports (report_period_start, report_period_end);

-- ----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function: Create review from risk assessment
CREATE OR REPLACE FUNCTION create_review_from_risk_assessment(
    p_risk_assessment_id UUID,
    p_queue_name TEXT DEFAULT 'default',
    p_priority INTEGER DEFAULT 5,
    p_sla_minutes INTEGER DEFAULT 60
)
RETURNS UUID AS $$
DECLARE
    v_review_id UUID;
    v_risk_record RECORD;
BEGIN
    -- Get risk assessment details
    SELECT * INTO v_risk_record
    FROM risk_assessments
    WHERE id = p_risk_assessment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Risk assessment % not found', p_risk_assessment_id;
    END IF;

    -- Determine review type based on risk category
    INSERT INTO review_queue (
        risk_assessment_id,
        session_id,
        user_id,
        agent_id,
        priority,
        queue_name,
        review_type,
        sla_minutes
    ) VALUES (
        p_risk_assessment_id,
        v_risk_record.session_id,
        v_risk_record.user_id,
        v_risk_record.agent_id,
        p_priority,
        p_queue_name,
        CASE
            WHEN v_risk_record.risk_category IN ('medical_advice', 'diagnosis', 'treatment')
            THEN 'safety'
            WHEN v_risk_record.risk_category IN ('regulatory', 'hipaa')
            THEN 'compliance'
            ELSE 'quality'
        END,
        p_sla_minutes
    )
    RETURNING id INTO v_review_id;

    -- Update risk assessment
    UPDATE risk_assessments
    SET requires_review = TRUE
    WHERE id = p_risk_assessment_id;

    RETURN v_review_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Record audit event
CREATE OR REPLACE FUNCTION record_audit_event(
    p_user_id TEXT,
    p_event_type TEXT,
    p_event_category TEXT,
    p_actor_type TEXT,
    p_action TEXT,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_trail (
        user_id,
        event_type,
        event_category,
        actor_type,
        action,
        reference_id,
        reference_type,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_category,
        p_actor_type,
        p_action,
        p_reference_id,
        p_reference_type,
        p_metadata
    )
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get pending reviews for reviewer
CREATE OR REPLACE FUNCTION get_pending_reviews(
    p_reviewer_id TEXT DEFAULT NULL,
    p_queue_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    review_id UUID,
    risk_level TEXT,
    risk_category TEXT,
    content_text TEXT,
    priority INTEGER,
    created_at TIMESTAMPTZ,
    sla_breached BOOLEAN,
    minutes_until_breach INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rq.id AS review_id,
        ra.risk_level,
        ra.risk_category,
        ra.content_text,
        rq.priority,
        rq.created_at,
        rq.sla_breached,
        EXTRACT(EPOCH FROM (rq.created_at + (rq.sla_minutes || ' minutes')::INTERVAL - NOW()))::INTEGER / 60 AS minutes_until_breach
    FROM review_queue rq
    JOIN risk_assessments ra ON rq.risk_assessment_id = ra.id
    WHERE rq.status = 'pending'
        AND (p_reviewer_id IS NULL OR rq.assigned_to = p_reviewer_id)
        AND (p_queue_name IS NULL OR rq.queue_name = p_queue_name)
    ORDER BY
        rq.priority DESC,
        rq.sla_breached DESC,
        rq.created_at
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get review queue statistics
CREATE OR REPLACE FUNCTION get_review_queue_stats(
    p_queue_name TEXT DEFAULT NULL
)
RETURNS TABLE (
    queue_name TEXT,
    total_pending INTEGER,
    total_in_review INTEGER,
    avg_review_time_minutes NUMERIC,
    sla_breach_count INTEGER,
    oldest_pending_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rq.queue_name,
        COUNT(*) FILTER (WHERE rq.status = 'pending')::INTEGER AS total_pending,
        COUNT(*) FILTER (WHERE rq.status = 'in_review')::INTEGER AS total_in_review,
        AVG(EXTRACT(EPOCH FROM (rq.reviewed_at - rq.created_at)) / 60) FILTER (WHERE rq.reviewed_at IS NOT NULL) AS avg_review_time_minutes,
        COUNT(*) FILTER (WHERE rq.sla_breached)::INTEGER AS sla_breach_count,
        MAX(EXTRACT(EPOCH FROM (NOW() - rq.created_at)) / 3600) FILTER (WHERE rq.status = 'pending') AS oldest_pending_hours
    FROM review_queue rq
    WHERE p_queue_name IS NULL OR rq.queue_name = p_queue_name
    GROUP BY rq.queue_name;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 8. TRIGGERS
-- ----------------------------------------------------------------------------

-- Trigger: Auto-create audit trail on risk assessment
CREATE OR REPLACE FUNCTION trigger_audit_risk_assessment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_trail (
        user_id,
        agent_id,
        event_type,
        event_category,
        actor_type,
        action,
        reference_id,
        reference_type,
        risk_level,
        metadata
    ) VALUES (
        NEW.user_id,
        NEW.agent_id,
        'risk_assessed',
        'safety',
        'system',
        'Risk assessment completed',
        NEW.id,
        'risk_assessment',
        NEW.risk_level,
        jsonb_build_object(
            'risk_score', NEW.risk_score,
            'requires_review', NEW.requires_review
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_after_risk_assessment
    AFTER INSERT ON risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_risk_assessment();

-- Trigger: Auto-create audit trail on review decision
CREATE OR REPLACE FUNCTION trigger_audit_review_decision()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_trail (
        user_id,
        event_type,
        event_category,
        actor_type,
        actor_id,
        action,
        reference_id,
        reference_type,
        metadata
    )
    SELECT
        rq.user_id,
        'review_decision_made',
        'compliance',
        'reviewer',
        NEW.reviewer_id,
        'Review decision: ' || NEW.decision,
        NEW.id,
        'review_decision',
        jsonb_build_object(
            'decision', NEW.decision,
            'review_queue_id', NEW.review_queue_id
        )
    FROM review_queue rq
    WHERE rq.id = NEW.review_queue_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_after_review_decision
    AFTER INSERT ON review_decisions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_audit_review_decision();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'risk_assessments',
        'review_queue',
        'review_decisions',
        'hitl_checkpoints',
        'audit_trail',
        'compliance_reports'
    )
ORDER BY table_name;
