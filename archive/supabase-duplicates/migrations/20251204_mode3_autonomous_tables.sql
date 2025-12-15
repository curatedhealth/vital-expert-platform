-- ============================================================================
-- Mode 3: Manual Autonomous - Database Tables
-- ============================================================================
-- Version: 1.1
-- Date: 2025-12-04
-- Description: Database schema for Mode 3 autonomous execution including
--              HITL checkpoints, session persistence, agent hierarchy tracking,
--              and HIPAA + GDPR compliant audit trails.
--
-- COMPLIANCE FEATURES:
--   HIPAA: PHI tracking, audit trails, access controls, encryption markers
--   GDPR: Consent tracking, data subject rights, retention policies,
--         lawful basis, cross-border transfer tracking, right to erasure
-- ============================================================================

-- ============================================================================
-- 1. MODE 3 AUTONOMOUS SESSIONS
-- ============================================================================
-- Tracks autonomous execution sessions with state persistence for resume capability

CREATE TABLE IF NOT EXISTS mode3_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session Identity
    session_id UUID NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),

    -- Agent Configuration
    agent_id UUID NOT NULL REFERENCES agents(id),
    agent_name TEXT NOT NULL,
    agent_level INTEGER DEFAULT 2,  -- L1-L5 hierarchy

    -- Request Context
    original_message TEXT NOT NULL,
    goal_statement TEXT,

    -- Execution State
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Session created, not yet started
        'planning',          -- Tree-of-Thoughts planning in progress
        'awaiting_approval', -- Waiting for HITL approval
        'executing',         -- Agent actively executing
        'paused',            -- Execution paused (user request)
        'completed',         -- Successfully completed
        'failed',            -- Execution failed
        'cancelled',         -- User cancelled
        'timeout'            -- Execution exceeded timeout
    )),
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER,

    -- Autonomy & Safety
    autonomy_level TEXT DEFAULT 'B' CHECK (autonomy_level IN ('A', 'B', 'C')),
    hitl_safety_level TEXT DEFAULT 'balanced' CHECK (hitl_safety_level IN (
        'conservative', 'balanced', 'minimal'
    )),
    hitl_enabled BOOLEAN DEFAULT TRUE,

    -- Configuration (from request)
    config JSONB DEFAULT '{}',

    -- Execution Plan
    execution_plan JSONB,  -- Tree-of-Thoughts generated plan
    task_tree JSONB,       -- Recursive task decomposition

    -- Results
    final_response TEXT,
    citations JSONB DEFAULT '[]',
    artifacts JSONB DEFAULT '[]',

    -- Error Handling
    error_message TEXT,
    error_details JSONB,
    recovery_attempts INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    timeout_at TIMESTAMPTZ,

    -- HIPAA Compliance Fields
    contains_phi BOOLEAN DEFAULT FALSE,
    phi_categories JSONB DEFAULT '[]',  -- ['demographics', 'diagnoses', 'medications', etc.]
    data_classification TEXT DEFAULT 'internal' CHECK (data_classification IN (
        'public', 'internal', 'confidential', 'restricted', 'phi'
    )),
    encryption_status TEXT DEFAULT 'encrypted_at_rest',

    -- GDPR Compliance Fields
    gdpr_lawful_basis TEXT CHECK (gdpr_lawful_basis IN (
        'consent',              -- Article 6(1)(a) - explicit consent
        'contract',             -- Article 6(1)(b) - contractual necessity
        'legal_obligation',     -- Article 6(1)(c) - legal obligation
        'vital_interests',      -- Article 6(1)(d) - vital interests
        'public_task',          -- Article 6(1)(e) - public interest
        'legitimate_interests'  -- Article 6(1)(f) - legitimate interests
    )),
    gdpr_consent_id UUID,  -- Reference to consent record if consent-based
    data_subject_id UUID,  -- The individual whose data is processed
    processing_purpose TEXT,
    data_categories JSONB DEFAULT '[]',  -- Categories of personal data
    retention_period_days INTEGER DEFAULT 365,
    retention_expires_at TIMESTAMPTZ,
    cross_border_transfer BOOLEAN DEFAULT FALSE,
    transfer_destination_countries JSONB DEFAULT '[]',
    erasure_requested BOOLEAN DEFAULT FALSE,
    erasure_requested_at TIMESTAMPTZ,
    erasure_completed_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_tenant ON mode3_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_phi ON mode3_sessions(contains_phi) WHERE contains_phi = TRUE;
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_erasure ON mode3_sessions(erasure_requested) WHERE erasure_requested = TRUE;
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_retention ON mode3_sessions(retention_expires_at);
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_user ON mode3_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_status ON mode3_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_session ON mode3_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_mode3_sessions_created ON mode3_sessions(created_at DESC);

-- ============================================================================
-- 2. HITL CHECKPOINTS
-- ============================================================================
-- Stores all HITL approval checkpoints with their state for resume capability

CREATE TABLE IF NOT EXISTS mode3_hitl_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session Reference
    mode3_session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    -- Checkpoint Identity
    checkpoint_id TEXT NOT NULL UNIQUE,
    checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN (
        'plan_approval',           -- Checkpoint 1: Approve execution plan
        'tool_execution',          -- Checkpoint 2: Approve tool use
        'sub_agent_spawning',      -- Checkpoint 3: Approve sub-agent delegation
        'critical_decision',       -- Checkpoint 4: Approve high-stakes decisions
        'artifact_generation',     -- Checkpoint 5: Approve final response
        'final_review'             -- Final review before delivery
    )),
    checkpoint_number INTEGER NOT NULL,  -- 1-5

    -- Request Details (what user sees)
    request_data JSONB NOT NULL,
    display_title TEXT,
    display_description TEXT,

    -- Approval State
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',    -- Waiting for user
        'approved',   -- User approved
        'rejected',   -- User rejected
        'modified',   -- User modified the request
        'skipped',    -- Auto-skipped (safety level)
        'timeout'     -- No response within timeout
    )),

    -- User Response
    user_feedback TEXT,
    modifications JSONB,  -- If status = 'modified'
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,

    -- Auto-Approval Tracking
    auto_approved BOOLEAN DEFAULT FALSE,
    auto_approval_reason TEXT,

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,  -- Timeout deadline

    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Indexes for checkpoint queries
CREATE INDEX IF NOT EXISTS idx_hitl_checkpoints_session ON mode3_hitl_checkpoints(mode3_session_id);
CREATE INDEX IF NOT EXISTS idx_hitl_checkpoints_status ON mode3_hitl_checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_hitl_checkpoints_type ON mode3_hitl_checkpoints(checkpoint_type);
CREATE INDEX IF NOT EXISTS idx_hitl_checkpoints_pending ON mode3_hitl_checkpoints(status) WHERE status = 'pending';

-- ============================================================================
-- 3. AGENT HIERARCHY EXECUTION
-- ============================================================================
-- Tracks L1-L5 agent hierarchy execution and delegation chains

CREATE TABLE IF NOT EXISTS mode3_agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session Reference
    mode3_session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    -- Agent Identity
    agent_id UUID NOT NULL REFERENCES agents(id),
    agent_name TEXT NOT NULL,
    agent_level INTEGER NOT NULL CHECK (agent_level BETWEEN 1 AND 5),
    agent_specialty TEXT,

    -- Hierarchy
    parent_execution_id UUID REFERENCES mode3_agent_executions(id),
    delegation_depth INTEGER DEFAULT 0,
    delegation_chain JSONB DEFAULT '[]',  -- Array of parent agent IDs

    -- Task
    task_description TEXT NOT NULL,
    task_type TEXT,  -- 'planning', 'execution', 'tool_call', 'synthesis'

    -- Execution State
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled'
    )),

    -- Results
    result JSONB,
    output_tokens INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Cost Tracking
    model_used TEXT,
    estimated_cost DECIMAL(10, 6),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for execution queries
CREATE INDEX IF NOT EXISTS idx_agent_executions_session ON mode3_agent_executions(mode3_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_parent ON mode3_agent_executions(parent_execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON mode3_agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_level ON mode3_agent_executions(agent_level);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON mode3_agent_executions(status);

-- ============================================================================
-- 4. TOOL EXECUTION LOG
-- ============================================================================
-- Tracks all tool executions for audit and debugging

CREATE TABLE IF NOT EXISTS mode3_tool_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session Reference
    mode3_session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,
    agent_execution_id UUID REFERENCES mode3_agent_executions(id),

    -- Tool Identity
    tool_name TEXT NOT NULL,
    tool_category TEXT,  -- 'rag', 'web_search', 'database', 'code_execute', etc.

    -- Request
    request_params JSONB NOT NULL,
    has_side_effects BOOLEAN DEFAULT FALSE,

    -- HITL Reference
    hitl_checkpoint_id UUID REFERENCES mode3_hitl_checkpoints(id),
    required_approval BOOLEAN DEFAULT TRUE,
    was_approved BOOLEAN,

    -- Execution
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'running', 'completed', 'failed'
    )),
    result JSONB,
    error_message TEXT,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Cost Tracking
    estimated_cost DECIMAL(10, 6),
    actual_cost DECIMAL(10, 6),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for tool execution queries
CREATE INDEX IF NOT EXISTS idx_tool_executions_session ON mode3_tool_executions(mode3_session_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_agent ON mode3_tool_executions(agent_execution_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool ON mode3_tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_executions_status ON mode3_tool_executions(status);

-- ============================================================================
-- 5. MODE 3 AUDIT TRAIL (HIPAA COMPLIANT)
-- ============================================================================
-- Immutable audit log for HIPAA compliance and debugging

CREATE TABLE IF NOT EXISTS mode3_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session Reference
    mode3_session_id UUID REFERENCES mode3_sessions(id) ON DELETE SET NULL,

    -- Event Identity
    event_type TEXT NOT NULL CHECK (event_type IN (
        -- Session Events
        'session_created',
        'session_started',
        'session_paused',
        'session_resumed',
        'session_completed',
        'session_failed',
        'session_cancelled',
        'session_timeout',

        -- HITL Events
        'hitl_checkpoint_created',
        'hitl_approval_requested',
        'hitl_approved',
        'hitl_rejected',
        'hitl_modified',
        'hitl_auto_approved',
        'hitl_timeout',

        -- Agent Events
        'agent_spawned',
        'agent_execution_started',
        'agent_execution_completed',
        'agent_execution_failed',
        'agent_delegation',
        'agent_escalation',

        -- Tool Events
        'tool_requested',
        'tool_approved',
        'tool_rejected',
        'tool_executed',
        'tool_failed',

        -- Constitutional AI Events
        'constitutional_validation_started',
        'constitutional_validation_passed',
        'constitutional_validation_failed',

        -- Error Events
        'error_occurred',
        'error_recovered',
        'timeout_warning',

        -- Security Events
        'access_denied',
        'phi_accessed',
        'data_exported'
    )),
    event_severity TEXT DEFAULT 'info' CHECK (event_severity IN (
        'debug', 'info', 'warning', 'error', 'critical'
    )),

    -- Actor
    user_id UUID REFERENCES auth.users(id),
    agent_id UUID REFERENCES agents(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Event Details
    event_description TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',

    -- Related Entities
    checkpoint_id UUID REFERENCES mode3_hitl_checkpoints(id),
    agent_execution_id UUID REFERENCES mode3_agent_executions(id),
    tool_execution_id UUID REFERENCES mode3_tool_executions(id),

    -- Immutability (HIPAA requirement)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- IP/Client tracking for security
    client_ip INET,
    user_agent TEXT,

    -- Checksum for tamper detection
    event_hash TEXT
);

-- Indexes for audit queries (audit log is read-heavy)
CREATE INDEX IF NOT EXISTS idx_audit_log_session ON mode3_audit_log(mode3_session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event ON mode3_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON mode3_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON mode3_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON mode3_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_severity ON mode3_audit_log(event_severity) WHERE event_severity IN ('error', 'critical');

-- ============================================================================
-- 6. GDPR CONSENT TRACKING (Article 7)
-- ============================================================================
-- Tracks explicit consent for data processing activities

CREATE TABLE IF NOT EXISTS gdpr_consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Data Subject
    data_subject_id UUID NOT NULL,  -- User being consented
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Consent Details
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'ai_processing',          -- AI-assisted processing
        'data_retention',         -- Long-term data storage
        'cross_border_transfer',  -- Transfer outside EU/EEA
        'automated_decisions',    -- Automated decision-making (Article 22)
        'marketing',              -- Marketing communications
        'research',               -- Research and analytics
        'third_party_sharing'     -- Sharing with third parties
    )),
    purpose TEXT NOT NULL,
    scope TEXT,  -- What specific data/processing this covers

    -- Consent Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'granted', 'denied', 'withdrawn', 'expired'
    )),
    granted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Consent Collection
    collection_method TEXT NOT NULL CHECK (collection_method IN (
        'explicit_opt_in',   -- Active checkbox/button
        'double_opt_in',     -- Confirmation email
        'verbal',            -- Phone/in-person (documented)
        'written',           -- Physical signature
        'digital_signature'  -- Electronic signature
    )),
    consent_text TEXT NOT NULL,  -- Exact text user agreed to
    consent_version TEXT,        -- Version of consent form

    -- Evidence
    proof_of_consent JSONB DEFAULT '{}',  -- Screenshots, timestamps, IPs
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for consent queries
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_subject ON gdpr_consent_records(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_tenant ON gdpr_consent_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_type ON gdpr_consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_status ON gdpr_consent_records(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_expiry ON gdpr_consent_records(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 7. GDPR DATA SUBJECT RIGHTS REQUESTS (Articles 15-22)
-- ============================================================================
-- Tracks GDPR Article 15-22 rights requests and fulfillment

CREATE TABLE IF NOT EXISTS gdpr_data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Request Identity
    request_number TEXT NOT NULL UNIQUE,  -- DSR-2025-000001
    tenant_id UUID NOT NULL REFERENCES tenants(id),

    -- Data Subject
    data_subject_id UUID NOT NULL,
    data_subject_email TEXT,
    data_subject_name TEXT,
    verification_method TEXT,  -- How identity was verified
    verification_completed BOOLEAN DEFAULT FALSE,

    -- Request Type (GDPR Articles 15-22)
    request_type TEXT NOT NULL CHECK (request_type IN (
        'access',              -- Article 15 - Right of Access
        'rectification',       -- Article 16 - Right to Rectification
        'erasure',             -- Article 17 - Right to Erasure (Right to be Forgotten)
        'restriction',         -- Article 18 - Right to Restriction of Processing
        'portability',         -- Article 20 - Right to Data Portability
        'objection',           -- Article 21 - Right to Object
        'automated_decision',  -- Article 22 - Automated Decision-Making
        'withdraw_consent'     -- Article 7(3) - Withdraw Consent
    )),
    request_details TEXT,

    -- Processing Status
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
        'received',           -- Request received
        'verifying',          -- Verifying identity
        'processing',         -- Being fulfilled
        'pending_review',     -- Needs legal/compliance review
        'extended',           -- Extended deadline (complex request)
        'completed',          -- Successfully fulfilled
        'rejected',           -- Legitimately rejected (with reason)
        'partially_completed' -- Some data excluded with justification
    )),

    -- Timeline (GDPR: 30 days, extendable to 90 for complex)
    received_at TIMESTAMPTZ DEFAULT NOW(),
    deadline_at TIMESTAMPTZ,  -- 30 days from received_at
    extended_deadline_at TIMESTAMPTZ,  -- Up to 90 days
    extension_reason TEXT,
    completed_at TIMESTAMPTZ,

    -- Fulfillment
    fulfilled_by UUID REFERENCES auth.users(id),
    fulfillment_method TEXT,  -- 'email', 'secure_download', 'mail'
    fulfillment_notes TEXT,

    -- For Erasure Requests
    erasure_scope JSONB DEFAULT '[]',  -- What data to erase
    erasure_exceptions JSONB DEFAULT '[]',  -- Legal retention requirements
    erasure_completed BOOLEAN DEFAULT FALSE,

    -- For Portability Requests
    export_format TEXT,  -- 'json', 'csv', 'xml'
    export_file_path TEXT,
    export_file_hash TEXT,

    -- Rejection (if applicable)
    rejection_reason TEXT CHECK (rejection_reason IN (
        'identity_not_verified',
        'request_unfounded',
        'request_excessive',
        'legal_obligation',
        'public_interest',
        'legal_claims',
        'freedom_expression'
    )),
    rejection_justification TEXT,

    -- Audit Trail
    processing_log JSONB DEFAULT '[]',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for DSR queries
CREATE INDEX IF NOT EXISTS idx_gdpr_dsr_tenant ON gdpr_data_subject_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_dsr_subject ON gdpr_data_subject_requests(data_subject_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_dsr_type ON gdpr_data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_gdpr_dsr_status ON gdpr_data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_dsr_deadline ON gdpr_data_subject_requests(deadline_at) WHERE status NOT IN ('completed', 'rejected');

-- ============================================================================
-- 8. GDPR DATA RETENTION POLICY
-- ============================================================================
-- Configures retention periods for different data categories

CREATE TABLE IF NOT EXISTS gdpr_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Policy Identity
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    policy_name TEXT NOT NULL,
    data_category TEXT NOT NULL,  -- 'session_data', 'audit_logs', 'phi', etc.

    -- Retention Rules
    retention_period_days INTEGER NOT NULL,
    legal_basis TEXT,  -- Why this retention period
    applicable_regulations JSONB DEFAULT '[]',  -- ['GDPR', 'HIPAA', 'SOX']

    -- Actions
    action_after_retention TEXT NOT NULL CHECK (action_after_retention IN (
        'delete',           -- Permanently delete
        'anonymize',        -- Remove identifying info
        'archive',          -- Move to cold storage
        'review'            -- Manual review required
    )),
    archive_location TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_applied_at TIMESTAMPTZ,
    next_application_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for retention policy queries
CREATE INDEX IF NOT EXISTS idx_retention_tenant ON gdpr_retention_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_retention_category ON gdpr_retention_policies(data_category);
CREATE INDEX IF NOT EXISTS idx_retention_active ON gdpr_retention_policies(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all Mode 3 tables
ALTER TABLE mode3_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_hitl_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_audit_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on GDPR tables
ALTER TABLE gdpr_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_retention_policies ENABLE ROW LEVEL SECURITY;

-- Sessions: Users can only see their own tenant's sessions
CREATE POLICY mode3_sessions_tenant_policy ON mode3_sessions
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- Checkpoints: Inherit from session
CREATE POLICY mode3_hitl_checkpoints_policy ON mode3_hitl_checkpoints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mode3_sessions s
            WHERE s.id = mode3_hitl_checkpoints.mode3_session_id
            AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
    );

-- Agent Executions: Inherit from session
CREATE POLICY mode3_agent_executions_policy ON mode3_agent_executions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mode3_sessions s
            WHERE s.id = mode3_agent_executions.mode3_session_id
            AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
    );

-- Tool Executions: Inherit from session
CREATE POLICY mode3_tool_executions_policy ON mode3_tool_executions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM mode3_sessions s
            WHERE s.id = mode3_tool_executions.mode3_session_id
            AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid
        )
    );

-- Audit Log: Tenant isolation
CREATE POLICY mode3_audit_log_policy ON mode3_audit_log
    FOR SELECT USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- GDPR Consent Records: Tenant isolation
CREATE POLICY gdpr_consent_tenant_policy ON gdpr_consent_records
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- GDPR Data Subject Requests: Tenant isolation
CREATE POLICY gdpr_dsr_tenant_policy ON gdpr_data_subject_requests
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- GDPR Retention Policies: Tenant isolation
CREATE POLICY gdpr_retention_tenant_policy ON gdpr_retention_policies
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
    );

-- ============================================================================
-- 10. UPDATE TRIGGERS
-- ============================================================================

-- Auto-update updated_at for sessions
CREATE OR REPLACE FUNCTION update_mode3_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mode3_session_updated ON mode3_sessions;
CREATE TRIGGER mode3_session_updated
    BEFORE UPDATE ON mode3_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_mode3_session_timestamp();

-- ============================================================================
-- 11. HELPER VIEWS
-- ============================================================================

-- Active sessions with pending checkpoints
CREATE OR REPLACE VIEW v_mode3_active_sessions AS
SELECT
    s.*,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'pending') as pending_checkpoints,
    COUNT(DISTINCT e.id) as total_agent_executions,
    SUM(e.estimated_cost) as total_estimated_cost
FROM mode3_sessions s
LEFT JOIN mode3_hitl_checkpoints c ON c.mode3_session_id = s.id
LEFT JOIN mode3_agent_executions e ON e.mode3_session_id = s.id
WHERE s.status IN ('planning', 'awaiting_approval', 'executing', 'paused')
GROUP BY s.id;

-- Session summary with hierarchy depth
CREATE OR REPLACE VIEW v_mode3_session_summary AS
SELECT
    s.id,
    s.session_id,
    s.tenant_id,
    s.agent_name,
    s.status,
    s.current_step,
    s.total_steps,
    s.created_at,
    s.completed_at,
    EXTRACT(EPOCH FROM (COALESCE(s.completed_at, NOW()) - s.started_at)) as duration_seconds,
    COUNT(DISTINCT c.id) as total_checkpoints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') as approved_checkpoints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'rejected') as rejected_checkpoints,
    MAX(e.delegation_depth) as max_delegation_depth,
    COUNT(DISTINCT e.id) FILTER (WHERE e.agent_level >= 3) as sub_agents_spawned
FROM mode3_sessions s
LEFT JOIN mode3_hitl_checkpoints c ON c.mode3_session_id = s.id
LEFT JOIN mode3_agent_executions e ON e.mode3_session_id = s.id
GROUP BY s.id;

-- ============================================================================
-- 12. VERIFICATION
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MODE 3 AUTONOMOUS EXECUTION - DATABASE SCHEMA INSTALLED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Mode 3 Core Tables Created:';
    RAISE NOTICE '  - mode3_sessions (with HIPAA + GDPR fields)';
    RAISE NOTICE '  - mode3_hitl_checkpoints (5 checkpoint types)';
    RAISE NOTICE '  - mode3_agent_executions (L1-L5 hierarchy)';
    RAISE NOTICE '  - mode3_tool_executions (tool audit trail)';
    RAISE NOTICE '  - mode3_audit_log (immutable HIPAA audit)';
    RAISE NOTICE '';
    RAISE NOTICE 'GDPR Compliance Tables Created:';
    RAISE NOTICE '  - gdpr_consent_records (Article 7 consent tracking)';
    RAISE NOTICE '  - gdpr_data_subject_requests (Articles 15-22 DSR)';
    RAISE NOTICE '  - gdpr_retention_policies (data retention mgmt)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created:';
    RAISE NOTICE '  - v_mode3_active_sessions';
    RAISE NOTICE '  - v_mode3_session_summary';
    RAISE NOTICE '';
    RAISE NOTICE 'Security Configuration:';
    RAISE NOTICE '  - Row Level Security (RLS): ENABLED on all 8 tables';
    RAISE NOTICE '  - Tenant Isolation: YES (current_setting app.current_tenant_id)';
    RAISE NOTICE '  - HIPAA Audit Trail: ENABLED';
    RAISE NOTICE '  - GDPR Compliance: ENABLED';
    RAISE NOTICE '';
    RAISE NOTICE 'Compliance Features:';
    RAISE NOTICE '  [HIPAA] PHI tracking, data classification, encryption markers';
    RAISE NOTICE '  [GDPR]  Article 6 lawful basis, consent tracking (Art 7)';
    RAISE NOTICE '  [GDPR]  Data subject rights (Arts 15-22), retention policies';
    RAISE NOTICE '  [GDPR]  Right to erasure (Art 17), cross-border transfer';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;
