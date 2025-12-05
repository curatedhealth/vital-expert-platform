# Mode 3: Manual Autonomous - Data Architecture & State Management

## Document Information
- **Version:** 1.0
- **Date:** December 4, 2025
- **Status:** Production-Ready Design
- **Owner:** VITAL Data Strategist Agent
- **Related:** [MODE_3_PRD.md](./MODE_3_PRD.md), [MODE_3_ARD.md](./MODE_3_ARD.md)

---

## Executive Summary

This document defines the comprehensive data architecture for Mode 3 (Manual Autonomous) execution, including:
- **Enhanced State Schema** with production-ready fields for 24+ hour sessions
- **Checkpoint Persistence** for HITL resume capability
- **Execution Trace Storage** with HIPAA-compliant audit trails
- **Agent Session State** with long-term memory patterns
- **Multi-Tenant Data Isolation** using Supabase RLS
- **GraphRAG Integration** for evidence-based autonomous reasoning

---

## 1. Enhanced State Schema Design

### 1.1 Current State Analysis

**Existing `UnifiedWorkflowState` (state_schemas.py:283-488)**
```python
class UnifiedWorkflowState(TypedDict):
    # ✅ Has: tenant_id, session_id, agent_id
    # ✅ Has: query, response, citations
    # ✅ Has: agent_responses (multi-agent)
    # ✅ Has: errors, nodes_executed

    # ❌ Missing: checkpoint_id, resume_state
    # ❌ Missing: hitl_checkpoint_history
    # ❌ Missing: execution_trace (structured audit)
    # ❌ Missing: sub_agent_hierarchy
    # ❌ Missing: tool_execution_log
    # ❌ Missing: constitutional_validation_results
    # ❌ Missing: session_persistence_metadata
```

### 1.2 Production-Enhanced State Schema

**File:** `services/ai-engine/src/langgraph_workflows/mode3_state_schema.py` (NEW)

```python
"""
Mode 3 Manual Autonomous - Production State Schema

Extends UnifiedWorkflowState with Mode 3-specific fields for:
- HITL checkpoint management
- Execution trace audit logging
- Long-term session persistence (24+ hours)
- Sub-agent hierarchy tracking
- Constitutional AI validation results
- GraphRAG evidence chains
"""

from typing import TypedDict, List, Dict, Any, Optional, Annotated
from typing_extensions import NotRequired
from datetime import datetime
from enum import Enum
import operator

from langgraph_workflows.state_schemas import UnifiedWorkflowState


# =============================================================================
# MODE 3 ENUMS
# =============================================================================

class HITLCheckpointType(str, Enum):
    """HITL checkpoint types (PRD Section 4.2)"""
    PLAN_APPROVAL = "plan_approval"          # Checkpoint #1
    TOOL_EXECUTION = "tool_execution"        # Checkpoint #2
    SUBAGENT_SPAWN = "subagent_spawn"        # Checkpoint #3
    CRITICAL_DECISION = "critical_decision"  # Checkpoint #4
    FINAL_REVIEW = "final_review"            # Checkpoint #5


class HITLApprovalStatus(str, Enum):
    """HITL approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"      # User modified the request
    TIMEOUT = "timeout"        # HITL timeout exceeded
    SKIPPED = "skipped"        # Permissive mode skip


class SubAgentLevel(str, Enum):
    """Agent hierarchy levels (PRD Section 4.4)"""
    L1_MASTER = "l1_master"         # Task coordinator
    L2_EXPERT = "l2_expert"         # User-selected domain expert
    L3_SPECIALIST = "l3_specialist"  # Spawned sub-domain expert
    L4_WORKER = "l4_worker"          # Parallel task executor
    L5_TOOL = "l5_tool"              # Tool agent (RAG, Code, DB)


class ExecutionTraceType(str, Enum):
    """Execution trace event types"""
    NODE_START = "node_start"
    NODE_COMPLETE = "node_complete"
    NODE_ERROR = "node_error"
    HITL_REQUEST = "hitl_request"
    HITL_RESPONSE = "hitl_response"
    TOOL_INVOCATION = "tool_invocation"
    TOOL_RESULT = "tool_result"
    SUBAGENT_SPAWN = "subagent_spawn"
    SUBAGENT_COMPLETE = "subagent_complete"
    LLM_CALL = "llm_call"
    CACHE_HIT = "cache_hit"
    CACHE_MISS = "cache_miss"
    CONSTITUTIONAL_CHECK = "constitutional_check"
    ESCALATION = "escalation"


# =============================================================================
# CHECKPOINT DATA STRUCTURES
# =============================================================================

class HITLCheckpoint(TypedDict):
    """
    HITL checkpoint data structure

    Stored in both:
    - State (in-memory during execution)
    - Database (for resume capability)
    """
    checkpoint_id: str  # UUID
    checkpoint_type: HITLCheckpointType
    checkpoint_number: int  # 1-5

    # Request context
    request_data: Dict[str, Any]  # What is being requested
    request_reasoning: str  # Why this is needed
    risk_level: str  # low, medium, high, critical

    # State snapshot
    state_snapshot: Dict[str, Any]  # Full state at checkpoint
    node_name: str  # Which node triggered checkpoint

    # Approval tracking
    approval_status: HITLApprovalStatus
    approval_timestamp: Optional[datetime]
    approval_user_id: Optional[str]
    approval_modifications: NotRequired[Dict[str, Any]]

    # Timeout handling
    timeout_seconds: int
    created_at: datetime
    expires_at: datetime

    # Metadata
    metadata: NotRequired[Dict[str, Any]]


class PlanApprovalRequest(TypedDict):
    """
    Plan Approval checkpoint data (Checkpoint #1)
    """
    checkpoint_id: str
    checkpoint_type: HITLCheckpointType  # PLAN_APPROVAL

    # Plan details
    plan_steps: List[Dict[str, Any]]  # From Tree-of-Thoughts
    estimated_duration_seconds: int
    estimated_cost_usd: float

    # Risk assessment
    high_risk_steps: List[str]  # Steps requiring extra caution
    external_api_calls: List[str]  # APIs to be called
    data_access_required: List[str]  # Data sources needed

    # Resources
    sub_agents_to_spawn: List[str]  # L3/L4 agents needed
    tools_to_use: List[str]  # Tools to be invoked

    # User options
    allow_modifications: bool
    timeout_seconds: int


class ToolExecutionApprovalRequest(TypedDict):
    """
    Tool Execution checkpoint data (Checkpoint #2)
    """
    checkpoint_id: str
    checkpoint_type: HITLCheckpointType  # TOOL_EXECUTION

    # Tool details
    tool_name: str
    tool_category: str  # rag, web_search, code_execution, database
    tool_parameters: Dict[str, Any]

    # Risk assessment
    risk_level: str  # low, medium, high
    data_access_scope: str  # read_only, write, admin
    external_api: bool

    # Context
    reasoning: str  # Why tool is needed
    expected_output: str  # What tool will produce

    # Safety
    requires_sandbox: bool
    timeout_seconds: int


class SubAgentApprovalRequest(TypedDict):
    """
    Sub-Agent Spawning checkpoint data (Checkpoint #3)
    """
    checkpoint_id: str
    checkpoint_type: HITLCheckpointType  # SUBAGENT_SPAWN

    # Agent details
    agent_id: str
    agent_name: str
    agent_level: SubAgentLevel  # L3, L4, or L5
    agent_capabilities: List[str]

    # Task assignment
    task_description: str
    task_complexity: str  # low, medium, high
    estimated_duration_seconds: int

    # Coordination
    parent_agent_id: str
    coordination_mode: str  # sequential, parallel, conditional

    # Resources
    tools_authorized: List[str]
    data_access_scope: str
    max_execution_time_seconds: int


class CriticalDecisionApprovalRequest(TypedDict):
    """
    Critical Decision checkpoint data (Checkpoint #4)
    """
    checkpoint_id: str
    checkpoint_type: HITLCheckpointType  # CRITICAL_DECISION

    # Decision context
    decision_type: str  # regulatory_strategy, clinical_protocol, safety_alert
    decision_description: str
    decision_rationale: str

    # Impact assessment
    impact_level: str  # low, medium, high, critical
    affected_stakeholders: List[str]
    regulatory_implications: NotRequired[str]

    # Options
    decision_options: List[Dict[str, Any]]  # Multiple choices
    recommended_option: str
    recommendation_confidence: float

    # Supporting evidence
    evidence_sources: List[str]
    evidence_quality: str  # Level 1A, 1B, 2A, etc.


class FinalReviewRequest(TypedDict):
    """
    Final Review checkpoint data (Checkpoint #5)
    """
    checkpoint_id: str
    checkpoint_type: HITLCheckpointType  # FINAL_REVIEW

    # Response content
    response_text: str
    response_confidence: float

    # Supporting data
    citations: List[Dict[str, Any]]
    sources_used: int
    agents_involved: List[str]

    # Execution summary
    total_duration_seconds: int
    total_cost_usd: float
    nodes_executed: List[str]
    tools_used: List[str]
    sub_agents_spawned: int

    # Quality indicators
    evidence_level: str
    constitutional_compliance: bool
    quality_checks_passed: int
    quality_checks_failed: int

    # User options
    allow_edits: bool
    save_to_history: bool


# =============================================================================
# EXECUTION TRACE STRUCTURES
# =============================================================================

class ExecutionTraceEvent(TypedDict):
    """
    Single execution trace event for audit log

    HIPAA Compliance:
    - Tenant isolation enforced
    - PHI handling logged
    - Access controls tracked
    - Immutable audit trail
    """
    trace_id: str  # UUID
    event_type: ExecutionTraceType
    event_timestamp: datetime

    # Context
    tenant_id: str
    session_id: str
    request_id: str
    node_name: str

    # Event details
    event_data: Dict[str, Any]
    event_duration_ms: NotRequired[int]
    event_success: bool
    event_error: NotRequired[str]

    # Actor tracking
    agent_id: NotRequired[str]
    agent_level: NotRequired[SubAgentLevel]
    user_id: NotRequired[str]

    # Resource usage
    tokens_used: NotRequired[int]
    cost_usd: NotRequired[float]
    cache_hit: NotRequired[bool]

    # Security & Compliance
    data_classification: NotRequired[str]  # public, confidential, restricted, phi
    phi_accessed: NotRequired[bool]
    phi_fields: NotRequired[List[str]]

    # Metadata
    metadata: NotRequired[Dict[str, Any]]


class SubAgentHierarchyNode(TypedDict):
    """
    Tracks sub-agent spawning hierarchy
    """
    agent_id: str
    agent_name: str
    agent_level: SubAgentLevel
    parent_agent_id: NotRequired[str]

    # Task assignment
    task_description: str
    task_status: str  # pending, running, completed, failed

    # Execution
    spawned_at: datetime
    completed_at: NotRequired[datetime]
    duration_seconds: NotRequired[int]

    # Results
    result_data: NotRequired[Dict[str, Any]]
    success: bool
    error_message: NotRequired[str]

    # Resources
    tools_used: List[str]
    tokens_used: int
    cost_usd: float


class ConstitutionalValidationResult(TypedDict):
    """
    Results from Constitutional AI validation
    """
    validation_id: str
    validated_at: datetime

    # Content validated
    content_type: str  # plan, response, decision
    content_snippet: str  # First 500 chars

    # Validation results
    is_valid: bool
    violations: List[str]  # Which principles violated
    severity: str  # low, medium, high, critical

    # Revision
    requires_revision: bool
    suggested_revision: NotRequired[str]
    revision_applied: NotRequired[bool]

    # Principles checked
    principles_checked: List[str]
    principles_passed: List[str]
    principles_failed: List[str]


# =============================================================================
# MODE 3 EXTENDED STATE SCHEMA
# =============================================================================

class Mode3WorkflowState(UnifiedWorkflowState):
    """
    Mode 3-specific state extension

    Extends UnifiedWorkflowState with:
    - HITL checkpoint management
    - Execution trace audit logging
    - Sub-agent hierarchy tracking
    - Constitutional validation results
    - Session persistence for 24+ hour sessions
    - GraphRAG evidence chains

    Golden Rules Compliance:
    ✅ #1: LangGraph StateGraph compatible
    ✅ #2: Caching integrated (checkpoint caching)
    ✅ #3: Tenant isolation enforced
    ✅ #4: RAG/Tools deeply integrated
    ✅ #5: Evidence-based with GraphRAG
    """

    # =========================================================================
    # HITL CHECKPOINT STATE
    # =========================================================================

    # Current checkpoint (if waiting for approval)
    current_checkpoint: NotRequired[HITLCheckpoint]
    current_checkpoint_id: NotRequired[str]

    # Checkpoint history (all checkpoints in this execution)
    checkpoint_history: Annotated[List[HITLCheckpoint], operator.add]

    # Checkpoint persistence
    last_checkpoint_saved_at: NotRequired[datetime]
    checkpoint_storage_key: NotRequired[str]  # S3/Storage key for state snapshot

    # Resume capability
    resume_from_checkpoint_id: NotRequired[str]  # Set when resuming
    resumed_at: NotRequired[datetime]

    # =========================================================================
    # EXECUTION TRACE (AUDIT LOG)
    # =========================================================================

    # Execution trace (all events)
    execution_trace: Annotated[List[ExecutionTraceEvent], operator.add]

    # Trace summary metrics
    trace_event_count: NotRequired[int]
    trace_error_count: NotRequired[int]
    trace_total_duration_ms: NotRequired[int]

    # HIPAA compliance tracking
    phi_accessed_in_session: NotRequired[bool]
    phi_access_events: NotRequired[List[str]]  # List of trace_ids

    # =========================================================================
    # SUB-AGENT HIERARCHY
    # =========================================================================

    # Agent hierarchy tree (all spawned agents)
    sub_agent_hierarchy: Annotated[List[SubAgentHierarchyNode], operator.add]

    # Current active agents
    active_sub_agents: NotRequired[List[str]]  # List of agent_ids

    # Hierarchy metrics
    total_agents_spawned: NotRequired[int]
    max_hierarchy_depth: NotRequired[int]  # Deepest level reached

    # =========================================================================
    # PATTERN AGENT RESULTS
    # =========================================================================

    # Tree-of-Thoughts (ToT) planning
    tot_plan: NotRequired[Dict[str, Any]]  # Structured plan from ToT
    tot_thoughts_evaluated: NotRequired[int]
    tot_plan_confidence: NotRequired[float]

    # ReAct execution
    react_iterations: NotRequired[int]  # Number of Thought→Action→Observation loops
    react_current_thought: NotRequired[str]
    react_current_action: NotRequired[str]
    react_observations: NotRequired[List[str]]

    # Constitutional AI validation
    constitutional_validations: Annotated[
        List[ConstitutionalValidationResult],
        operator.add
    ]
    constitutional_violations_total: NotRequired[int]
    constitutional_revisions_applied: NotRequired[int]

    # =========================================================================
    # TOOL EXECUTION LOG
    # =========================================================================

    # Tools invoked (with results)
    tool_executions: Annotated[List[Dict[str, Any]], operator.add]

    # Tool summary
    tools_used_count: NotRequired[Dict[str, int]]  # {tool_name: count}
    tool_failures: NotRequired[List[str]]  # List of failed tool names

    # =========================================================================
    # SESSION PERSISTENCE (24+ HOURS)
    # =========================================================================

    # Session metadata
    session_started_at: datetime
    session_last_activity_at: datetime
    session_total_duration_seconds: NotRequired[int]

    # Persistence strategy
    persistence_enabled: bool
    persistence_backend: NotRequired[str]  # supabase, s3, redis
    persistence_interval_seconds: NotRequired[int]  # Auto-save interval

    # Session resumption
    session_can_resume: bool
    session_resume_expiry: NotRequired[datetime]  # When resume expires

    # Long-term memory integration
    session_memory_snapshot_id: NotRequired[str]  # SessionMemoryService ID

    # =========================================================================
    # GRAPHRAG EVIDENCE CHAINS (PHASE 4)
    # =========================================================================

    # GraphRAG configuration (from agent metadata)
    graphrag_profile_id: NotRequired[str]
    graphrag_search_methods: NotRequired[List[str]]  # hybrid, entity, relationship

    # Evidence chains (linked citations with provenance)
    graphrag_evidence_chains: Annotated[List[Dict[str, Any]], operator.add]

    # Evidence quality
    evidence_chain_depth: NotRequired[int]  # Max citation chain length
    evidence_total_sources: NotRequired[int]
    evidence_primary_sources: NotRequired[int]  # Direct citations
    evidence_secondary_sources: NotRequired[int]  # Cited by citations

    # GraphRAG metadata
    graphrag_query_count: NotRequired[int]
    graphrag_total_chunks_retrieved: NotRequired[int]
    graphrag_avg_relevance_score: NotRequired[float]

    # =========================================================================
    # PERFORMANCE & COST TRACKING
    # =========================================================================

    # LLM usage (across all agents)
    total_llm_calls: NotRequired[int]
    total_tokens_used: NotRequired[int]
    total_cost_usd: NotRequired[float]

    # Cost breakdown by agent
    cost_by_agent: NotRequired[Dict[str, float]]  # {agent_id: cost_usd}
    cost_by_tier: NotRequired[Dict[str, float]]  # {tier_2: X, tier_3: Y}

    # Performance metrics
    average_node_duration_ms: NotRequired[float]
    slowest_node: NotRequired[str]
    slowest_node_duration_ms: NotRequired[int]

    # Cache efficiency
    cache_hit_rate: NotRequired[float]  # 0.0 to 1.0
    cache_savings_usd: NotRequired[float]

    # =========================================================================
    # ERROR RECOVERY & RETRY
    # =========================================================================

    # Retry tracking (per node)
    node_retry_counts: NotRequired[Dict[str, int]]  # {node_name: retry_count}
    max_retries_exceeded: NotRequired[List[str]]  # Nodes that failed after max retries

    # Escalation tracking
    escalations: Annotated[List[Dict[str, Any]], operator.add]
    escalation_count: NotRequired[int]

    # Recovery checkpoints
    recovery_checkpoint_ids: NotRequired[List[str]]  # Checkpoints saved for recovery

    # =========================================================================
    # SECURITY & COMPLIANCE
    # =========================================================================

    # Data classification (highest sensitivity in session)
    session_data_classification: NotRequired[str]  # public, confidential, restricted, phi

    # HIPAA compliance
    hipaa_compliant_session: bool
    hipaa_audit_required: bool
    hipaa_audit_log_id: NotRequired[str]

    # Access control
    rbac_user_role: NotRequired[str]
    rbac_permissions_granted: NotRequired[List[str]]
    rbac_permissions_denied: NotRequired[List[str]]

    # =========================================================================
    # MODE 3 SPECIFIC CONFIGURATION
    # =========================================================================

    # HITL settings
    hitl_safety_level: str  # strict, balanced, permissive
    hitl_timeout_default_seconds: int
    hitl_auto_approve_low_risk: bool

    # Autonomous settings
    autonomous_enabled: bool
    autonomous_max_iterations: int
    autonomous_current_iteration: NotRequired[int]

    # Agent hierarchy settings
    max_sub_agent_depth: int  # Max L3→L4→L5 depth
    parallel_agent_limit: int  # Max parallel agents

    # Tool execution settings
    tools_require_approval: bool
    tools_sandbox_enabled: bool
    tools_timeout_default_seconds: int


# =============================================================================
# STATE FACTORY FOR MODE 3
# =============================================================================

def create_mode3_initial_state(
    tenant_id: str,
    query: str,
    request_id: str,
    agent_id: str,  # User-selected L2 expert agent
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    hitl_enabled: bool = True,
    hitl_safety_level: str = "balanced",
    **kwargs
) -> Mode3WorkflowState:
    """
    Create initial Mode 3 workflow state

    Args:
        tenant_id: Tenant UUID
        query: User query/goal
        request_id: Unique request ID
        agent_id: User-selected expert agent ID (L2)
        user_id: Optional user ID
        session_id: Optional session ID (for resume)
        hitl_enabled: Enable HITL checkpoints
        hitl_safety_level: strict, balanced, permissive
        **kwargs: Additional configuration

    Returns:
        Initial Mode3WorkflowState
    """
    from langgraph_workflows.state_schemas import create_initial_state, WorkflowMode

    # Create base state
    base_state = create_initial_state(
        tenant_id=tenant_id,
        query=query,
        mode=WorkflowMode.MANUAL_AUTONOMOUS,
        request_id=request_id,
        user_id=user_id,
        session_id=session_id,
        selected_agents=[agent_id],
        **kwargs
    )

    # Add Mode 3 extensions
    now = datetime.utcnow()

    mode3_extensions = {
        # HITL checkpoint state
        "checkpoint_history": [],

        # Execution trace
        "execution_trace": [],

        # Sub-agent hierarchy
        "sub_agent_hierarchy": [],

        # Constitutional validations
        "constitutional_validations": [],

        # Tool executions
        "tool_executions": [],

        # GraphRAG evidence
        "graphrag_evidence_chains": [],

        # Escalations
        "escalations": [],

        # Session persistence
        "session_started_at": now,
        "session_last_activity_at": now,
        "persistence_enabled": True,
        "persistence_backend": "supabase",
        "persistence_interval_seconds": 300,  # Auto-save every 5 minutes
        "session_can_resume": True,
        "session_resume_expiry": now + timedelta(hours=24),

        # HIPAA compliance
        "hipaa_compliant_session": kwargs.get("hipaa_compliant", True),
        "hipaa_audit_required": kwargs.get("hipaa_audit_required", True),

        # Mode 3 config
        "hitl_safety_level": hitl_safety_level,
        "hitl_timeout_default_seconds": 300,
        "hitl_auto_approve_low_risk": hitl_safety_level == "permissive",
        "autonomous_enabled": True,
        "autonomous_max_iterations": 50,
        "max_sub_agent_depth": 3,  # L2→L3→L4→L5
        "parallel_agent_limit": 5,
        "tools_require_approval": hitl_enabled and hitl_safety_level in ["strict", "balanced"],
        "tools_sandbox_enabled": True,
        "tools_timeout_default_seconds": 60,
    }

    # Merge base + extensions
    return {**base_state, **mode3_extensions}
```

---

## 2. Checkpoint Persistence Database Schema

### 2.1 Supabase Table Design

**File:** `supabase/migrations/20251204000001_mode3_checkpoint_system.sql`

```sql
-- =====================================================================
-- MODE 3: HITL CHECKPOINT PERSISTENCE SYSTEM
-- =====================================================================
-- Purpose: Store HITL checkpoints for resume capability
-- Compliance: HIPAA, multi-tenant isolation, audit trail
-- Related: MODE_3_PRD.md Section 4.2 (HITL Approval System)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. HITL Checkpoints Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_hitl_checkpoints (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id TEXT NOT NULL UNIQUE,  -- Application-level ID

  -- Multi-tenant isolation (CRITICAL)
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL,
  request_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),

  -- Checkpoint metadata
  checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN (
    'plan_approval',
    'tool_execution',
    'subagent_spawn',
    'critical_decision',
    'final_review'
  )),
  checkpoint_number INTEGER NOT NULL CHECK (checkpoint_number BETWEEN 1 AND 5),
  node_name TEXT NOT NULL,  -- Which LangGraph node triggered checkpoint

  -- Request data
  request_data JSONB NOT NULL,  -- What is being requested (structured)
  request_reasoning TEXT,  -- Why this is needed
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- State snapshot (for resume)
  state_snapshot JSONB NOT NULL,  -- Full UnifiedWorkflowState at this point
  state_snapshot_size_bytes INTEGER,  -- For monitoring

  -- Approval tracking
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN (
    'pending',
    'approved',
    'rejected',
    'modified',
    'timeout',
    'skipped'
  )),
  approval_timestamp TIMESTAMPTZ,
  approval_user_id UUID REFERENCES users(id),
  approval_modifications JSONB,  -- User edits to request
  approval_notes TEXT,

  -- Timeout handling
  timeout_seconds INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- created_at + timeout_seconds

  -- Resume support
  can_resume_from BOOLEAN DEFAULT TRUE,
  resume_count INTEGER DEFAULT 0,  -- How many times resumed from this checkpoint
  last_resumed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT mode3_checkpoint_session_fk FOREIGN KEY (session_id)
    REFERENCES ask_expert_sessions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_mode3_checkpoints_tenant ON mode3_hitl_checkpoints(tenant_id);
CREATE INDEX idx_mode3_checkpoints_session ON mode3_hitl_checkpoints(session_id);
CREATE INDEX idx_mode3_checkpoints_status ON mode3_hitl_checkpoints(approval_status)
  WHERE approval_status = 'pending';
CREATE INDEX idx_mode3_checkpoints_created ON mode3_hitl_checkpoints(created_at DESC);
CREATE INDEX idx_mode3_checkpoints_expires ON mode3_hitl_checkpoints(expires_at)
  WHERE approval_status = 'pending';

-- Full-text search on request reasoning
CREATE INDEX idx_mode3_checkpoints_reasoning ON mode3_hitl_checkpoints
  USING gin(to_tsvector('english', request_reasoning));

-- ---------------------------------------------------------------------
-- 2. Execution Trace Table (HIPAA Audit Log)
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_execution_trace (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id TEXT NOT NULL UNIQUE,

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL,
  request_id TEXT NOT NULL,

  -- Event metadata
  event_type TEXT NOT NULL CHECK (event_type IN (
    'node_start', 'node_complete', 'node_error',
    'hitl_request', 'hitl_response',
    'tool_invocation', 'tool_result',
    'subagent_spawn', 'subagent_complete',
    'llm_call', 'cache_hit', 'cache_miss',
    'constitutional_check', 'escalation'
  )),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  node_name TEXT NOT NULL,

  -- Event details
  event_data JSONB NOT NULL,
  event_duration_ms INTEGER,
  event_success BOOLEAN NOT NULL,
  event_error TEXT,

  -- Actor tracking
  agent_id UUID REFERENCES agents(id),
  agent_level TEXT CHECK (agent_level IN ('l1_master', 'l2_expert', 'l3_specialist', 'l4_worker', 'l5_tool')),
  user_id UUID REFERENCES users(id),

  -- Resource usage
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  cache_hit BOOLEAN,

  -- Security & Compliance (HIPAA)
  data_classification TEXT CHECK (data_classification IN ('public', 'confidential', 'restricted', 'phi')),
  phi_accessed BOOLEAN DEFAULT FALSE,
  phi_fields TEXT[],  -- Which PHI fields were accessed

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit (immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT mode3_trace_session_fk FOREIGN KEY (session_id)
    REFERENCES ask_expert_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_mode3_trace_tenant ON mode3_execution_trace(tenant_id);
CREATE INDEX idx_mode3_trace_session ON mode3_execution_trace(session_id);
CREATE INDEX idx_mode3_trace_type ON mode3_execution_trace(event_type);
CREATE INDEX idx_mode3_trace_timestamp ON mode3_execution_trace(event_timestamp DESC);
CREATE INDEX idx_mode3_trace_agent ON mode3_execution_trace(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_mode3_trace_phi ON mode3_execution_trace(phi_accessed) WHERE phi_accessed = TRUE;

-- Partition by month for performance (optional, for high volume)
-- CREATE TABLE mode3_execution_trace_2025_12 PARTITION OF mode3_execution_trace
--   FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- ---------------------------------------------------------------------
-- 3. Sub-Agent Hierarchy Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_sub_agent_hierarchy (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL,
  request_id TEXT NOT NULL,

  -- Agent identification
  agent_id UUID NOT NULL REFERENCES agents(id),
  agent_name TEXT NOT NULL,
  agent_level TEXT NOT NULL CHECK (agent_level IN ('l2_expert', 'l3_specialist', 'l4_worker', 'l5_tool')),
  parent_agent_id UUID REFERENCES agents(id),  -- NULL for L2 (root)

  -- Task assignment
  task_description TEXT NOT NULL,
  task_status TEXT NOT NULL DEFAULT 'pending' CHECK (task_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Execution tracking
  spawned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Results
  result_data JSONB,
  success BOOLEAN,
  error_message TEXT,

  -- Resources
  tools_used TEXT[],
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,

  -- Hierarchy metrics
  hierarchy_depth INTEGER NOT NULL,  -- 1 for L2, 2 for L3, etc.
  sibling_order INTEGER,  -- Order among siblings

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT mode3_subagent_session_fk FOREIGN KEY (session_id)
    REFERENCES ask_expert_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_mode3_subagent_tenant ON mode3_sub_agent_hierarchy(tenant_id);
CREATE INDEX idx_mode3_subagent_session ON mode3_sub_agent_hierarchy(session_id);
CREATE INDEX idx_mode3_subagent_parent ON mode3_sub_agent_hierarchy(parent_agent_id)
  WHERE parent_agent_id IS NOT NULL;
CREATE INDEX idx_mode3_subagent_status ON mode3_sub_agent_hierarchy(task_status);
CREATE INDEX idx_mode3_subagent_level ON mode3_sub_agent_hierarchy(agent_level);

-- ---------------------------------------------------------------------
-- 4. Constitutional Validation Results Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_constitutional_validations (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_id TEXT NOT NULL UNIQUE,

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL,
  request_id TEXT NOT NULL,

  -- Validation metadata
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_type TEXT NOT NULL CHECK (content_type IN ('plan', 'response', 'decision', 'tool_output')),
  content_snippet TEXT,  -- First 500 chars

  -- Validation results
  is_valid BOOLEAN NOT NULL,
  violations TEXT[],  -- Which principles violated
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Revision tracking
  requires_revision BOOLEAN NOT NULL,
  suggested_revision TEXT,
  revision_applied BOOLEAN DEFAULT FALSE,
  revised_content TEXT,

  -- Principles
  principles_checked TEXT[] NOT NULL,
  principles_passed TEXT[],
  principles_failed TEXT[],

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT mode3_constitutional_session_fk FOREIGN KEY (session_id)
    REFERENCES ask_expert_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_mode3_constitutional_tenant ON mode3_constitutional_validations(tenant_id);
CREATE INDEX idx_mode3_constitutional_session ON mode3_constitutional_validations(session_id);
CREATE INDEX idx_mode3_constitutional_valid ON mode3_constitutional_validations(is_valid);
CREATE INDEX idx_mode3_constitutional_severity ON mode3_constitutional_validations(severity)
  WHERE severity IN ('high', 'critical');

-- ---------------------------------------------------------------------
-- 5. Session Persistence Snapshots Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_session_snapshots (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id TEXT NOT NULL UNIQUE,

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL,
  request_id TEXT NOT NULL,

  -- Snapshot metadata
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('checkpoint', 'auto_save', 'manual_save', 'final')),
  snapshot_at_node TEXT,

  -- State data
  state_snapshot JSONB NOT NULL,  -- Full Mode3WorkflowState
  state_snapshot_compressed BYTEA,  -- Compressed version for large states
  state_snapshot_size_bytes INTEGER NOT NULL,
  compression_ratio DECIMAL(5, 2),  -- compressed_size / original_size

  -- Storage
  storage_backend TEXT DEFAULT 'supabase' CHECK (storage_backend IN ('supabase', 's3', 'redis')),
  storage_key TEXT,  -- S3 key or Redis key if using external storage

  -- Resume capability
  can_resume_from BOOLEAN DEFAULT TRUE,
  resume_expiry TIMESTAMPTZ,
  resume_count INTEGER DEFAULT 0,
  last_resumed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT mode3_snapshot_session_fk FOREIGN KEY (session_id)
    REFERENCES ask_expert_sessions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_mode3_snapshot_tenant ON mode3_session_snapshots(tenant_id);
CREATE INDEX idx_mode3_snapshot_session ON mode3_session_snapshots(session_id);
CREATE INDEX idx_mode3_snapshot_type ON mode3_session_snapshots(snapshot_type);
CREATE INDEX idx_mode3_snapshot_created ON mode3_session_snapshots(created_at DESC);
CREATE INDEX idx_mode3_snapshot_resume ON mode3_session_snapshots(can_resume_from, resume_expiry)
  WHERE can_resume_from = TRUE;

-- ---------------------------------------------------------------------
-- 6. Row-Level Security (RLS) Policies
-- ---------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE mode3_hitl_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_execution_trace ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_sub_agent_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_constitutional_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode3_session_snapshots ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies (CRITICAL FOR MULTI-TENANCY)

CREATE POLICY mode3_checkpoints_tenant_isolation ON mode3_hitl_checkpoints
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY mode3_trace_tenant_isolation ON mode3_execution_trace
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY mode3_subagent_tenant_isolation ON mode3_sub_agent_hierarchy
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY mode3_constitutional_tenant_isolation ON mode3_constitutional_validations
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY mode3_snapshot_tenant_isolation ON mode3_session_snapshots
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ---------------------------------------------------------------------
-- 7. Functions for Checkpoint Management
-- ---------------------------------------------------------------------

-- Function: Save HITL checkpoint with state snapshot
CREATE OR REPLACE FUNCTION mode3_save_checkpoint(
  p_checkpoint_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_checkpoint_id UUID;
BEGIN
  INSERT INTO mode3_hitl_checkpoints (
    checkpoint_id,
    tenant_id,
    session_id,
    request_id,
    user_id,
    agent_id,
    checkpoint_type,
    checkpoint_number,
    node_name,
    request_data,
    request_reasoning,
    risk_level,
    state_snapshot,
    state_snapshot_size_bytes,
    timeout_seconds,
    expires_at,
    metadata
  ) VALUES (
    (p_checkpoint_data->>'checkpoint_id')::TEXT,
    (p_checkpoint_data->>'tenant_id')::UUID,
    (p_checkpoint_data->>'session_id')::UUID,
    (p_checkpoint_data->>'request_id')::TEXT,
    (p_checkpoint_data->>'user_id')::UUID,
    (p_checkpoint_data->>'agent_id')::UUID,
    (p_checkpoint_data->>'checkpoint_type')::TEXT,
    (p_checkpoint_data->>'checkpoint_number')::INTEGER,
    (p_checkpoint_data->>'node_name')::TEXT,
    p_checkpoint_data->'request_data',
    (p_checkpoint_data->>'request_reasoning')::TEXT,
    (p_checkpoint_data->>'risk_level')::TEXT,
    p_checkpoint_data->'state_snapshot',
    pg_column_size(p_checkpoint_data->'state_snapshot'),
    COALESCE((p_checkpoint_data->>'timeout_seconds')::INTEGER, 300),
    NOW() + INTERVAL '1 second' * COALESCE((p_checkpoint_data->>'timeout_seconds')::INTEGER, 300),
    COALESCE(p_checkpoint_data->'metadata', '{}'::JSONB)
  )
  RETURNING id INTO v_checkpoint_id;

  RETURN v_checkpoint_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve/Reject checkpoint
CREATE OR REPLACE FUNCTION mode3_update_checkpoint_status(
  p_checkpoint_id TEXT,
  p_status TEXT,
  p_user_id UUID,
  p_modifications JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE mode3_hitl_checkpoints
  SET
    approval_status = p_status,
    approval_timestamp = NOW(),
    approval_user_id = p_user_id,
    approval_modifications = p_modifications,
    approval_notes = p_notes,
    updated_at = NOW()
  WHERE checkpoint_id = p_checkpoint_id
    AND approval_status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get pending checkpoints for session
CREATE OR REPLACE FUNCTION mode3_get_pending_checkpoints(
  p_session_id UUID,
  p_tenant_id UUID
) RETURNS SETOF mode3_hitl_checkpoints AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM mode3_hitl_checkpoints
  WHERE session_id = p_session_id
    AND tenant_id = p_tenant_id
    AND approval_status = 'pending'
    AND expires_at > NOW()
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cleanup expired checkpoints
CREATE OR REPLACE FUNCTION mode3_cleanup_expired_checkpoints() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Auto-reject expired pending checkpoints
  UPDATE mode3_hitl_checkpoints
  SET
    approval_status = 'timeout',
    updated_at = NOW()
  WHERE approval_status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('mode3-checkpoint-cleanup', '*/5 * * * *',
--   'SELECT mode3_cleanup_expired_checkpoints()');

-- ---------------------------------------------------------------------
-- 8. Triggers
-- ---------------------------------------------------------------------

-- Trigger: Update updated_at on checkpoint modification
CREATE OR REPLACE FUNCTION update_mode3_checkpoint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mode3_checkpoint_updated_at
  BEFORE UPDATE ON mode3_hitl_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_mode3_checkpoint_updated_at();

-- Trigger: Increment resume_count on checkpoint resume
CREATE OR REPLACE FUNCTION mode3_increment_resume_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
    NEW.resume_count = OLD.resume_count + 1;
    NEW.last_resumed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mode3_checkpoint_resume_counter
  BEFORE UPDATE ON mode3_hitl_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION mode3_increment_resume_count();

-- ---------------------------------------------------------------------
-- 9. Comments for Documentation
-- ---------------------------------------------------------------------

COMMENT ON TABLE mode3_hitl_checkpoints IS
  'HITL approval checkpoints for Mode 3 autonomous execution with resume capability';

COMMENT ON TABLE mode3_execution_trace IS
  'Immutable audit log of all Mode 3 execution events for HIPAA compliance';

COMMENT ON TABLE mode3_sub_agent_hierarchy IS
  'Tracks spawned sub-agents (L3, L4, L5) and their task execution';

COMMENT ON TABLE mode3_constitutional_validations IS
  'Results from Constitutional AI safety validation checks';

COMMENT ON TABLE mode3_session_snapshots IS
  'Compressed state snapshots for session persistence and resume';

COMMENT ON COLUMN mode3_execution_trace.phi_accessed IS
  'HIPAA compliance flag: TRUE if Protected Health Information was accessed';

COMMENT ON COLUMN mode3_hitl_checkpoints.state_snapshot IS
  'Full UnifiedWorkflowState snapshot for resuming workflow from this checkpoint';
```

---

## 3. GraphRAG Integration Patterns

### 3.1 Evidence Chain Storage

**Concept:** Mode 3 autonomous execution requires deep evidence chains where each claim is backed by primary sources, and those sources cite other authoritative sources (evidence provenance).

**Table Extension:** `mode3_execution_trace` already captures GraphRAG queries. Add structured evidence chain table:

```sql
-- GraphRAG Evidence Chains
CREATE TABLE IF NOT EXISTS mode3_graphrag_evidence_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Session context
  session_id UUID NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,

  -- Claim being supported
  claim_text TEXT NOT NULL,
  claim_type TEXT CHECK (claim_type IN ('fact', 'recommendation', 'analysis', 'decision')),

  -- Primary source (direct citation)
  primary_source_id UUID NOT NULL REFERENCES knowledge_documents(id),
  primary_source_title TEXT NOT NULL,
  primary_source_snippet TEXT NOT NULL,  -- Exact quote
  primary_source_relevance_score DECIMAL(5, 4),

  -- Secondary sources (cited by primary)
  secondary_source_ids UUID[],  -- Array of document IDs
  secondary_source_count INTEGER DEFAULT 0,

  -- Evidence quality
  evidence_level TEXT CHECK (evidence_level IN ('1A', '1B', '2A', '2B', '3', '4', '5')),
  evidence_confidence DECIMAL(5, 4),

  -- Graph relationships
  entity_mentions TEXT[],  -- Entities mentioned in claim
  relationship_types TEXT[],  -- Types of relationships used

  -- GraphRAG metadata
  graphrag_profile_id TEXT,
  search_method TEXT CHECK (search_method IN ('hybrid', 'entity', 'relationship', 'semantic')),
  query_text TEXT,

  -- Provenance
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graphrag_evidence_tenant ON mode3_graphrag_evidence_chains(tenant_id);
CREATE INDEX idx_graphrag_evidence_session ON mode3_graphrag_evidence_chains(session_id);
CREATE INDEX idx_graphrag_evidence_primary ON mode3_graphrag_evidence_chains(primary_source_id);

-- Enable RLS
ALTER TABLE mode3_graphrag_evidence_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY graphrag_evidence_tenant_isolation ON mode3_graphrag_evidence_chains
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### 3.2 GraphRAG Query Integration

**Service Integration:** `UnifiedRAGService` → `GraphRAGSelector` → Mode 3 workflow

```python
# services/ai-engine/src/services/mode3_graphrag_integration.py

"""
Mode 3 GraphRAG Integration Service

Orchestrates GraphRAG evidence retrieval for autonomous execution
with evidence chain construction and citation provenance tracking.
"""

from typing import List, Dict, Any, Optional
import structlog
from uuid import UUID

from services.unified_rag_service import UnifiedRAGService
from services.graphrag_selector import GraphRAGSelector

logger = structlog.get_logger()


class Mode3GraphRAGIntegration:
    """
    GraphRAG integration for Mode 3 autonomous execution

    Features:
    - Evidence chain construction (primary → secondary sources)
    - Citation provenance tracking
    - Multi-query evidence aggregation
    - Confidence scoring based on source quality
    """

    def __init__(
        self,
        rag_service: UnifiedRAGService,
        graphrag_selector: GraphRAGSelector,
        supabase_client
    ):
        self.rag_service = rag_service
        self.graphrag_selector = graphrag_selector
        self.supabase = supabase_client

    async def build_evidence_chain(
        self,
        claim: str,
        claim_type: str,
        agent_id: UUID,
        tenant_id: UUID,
        session_id: UUID,
        request_id: str,
        max_chain_depth: int = 2
    ) -> Dict[str, Any]:
        """
        Build evidence chain for a claim with citation provenance

        Process:
        1. Query GraphRAG for primary sources supporting claim
        2. Extract secondary sources (cited by primary)
        3. Score evidence quality based on source hierarchy
        4. Store evidence chain in database
        5. Return structured evidence object

        Args:
            claim: The claim to support with evidence
            claim_type: fact, recommendation, analysis, decision
            agent_id: Agent making the claim
            tenant_id: Tenant ID
            session_id: Current session
            request_id: Request ID
            max_chain_depth: How deep to traverse citation graph

        Returns:
            Evidence chain with primary/secondary sources
        """
        logger.info("Building evidence chain",
                   claim_snippet=claim[:100],
                   claim_type=claim_type)

        # 1. Get GraphRAG profile for agent
        profile = await self.graphrag_selector.get_agent_rag_profile(
            agent_id=str(agent_id)
        )

        if not profile:
            logger.warning("No GraphRAG profile for agent, using default")
            profile = await self.graphrag_selector.get_default_profile()

        # 2. Query GraphRAG with hybrid search
        rag_results = await self.rag_service.query(
            query=claim,
            tenant_id=str(tenant_id),
            domains=profile.get("knowledge_domains", []),
            search_method="hybrid",  # Combine vector + entity + relationship
            top_k=5,
            min_relevance_score=0.7
        )

        if not rag_results["chunks"]:
            logger.warning("No GraphRAG results for claim")
            return {
                "claim": claim,
                "evidence_found": False,
                "primary_sources": [],
                "secondary_sources": [],
                "evidence_level": None
            }

        # 3. Rank sources by relevance and authority
        primary_sources = []
        for chunk in rag_results["chunks"][:3]:  # Top 3 as primary
            primary_source = {
                "document_id": chunk["metadata"]["document_id"],
                "title": chunk["metadata"].get("title", "Unknown"),
                "snippet": chunk["text"],
                "relevance_score": chunk["score"],
                "evidence_level": chunk["metadata"].get("evidence_level", "3"),
                "citation": chunk["metadata"].get("citation", {}),
            }
            primary_sources.append(primary_source)

        # 4. Extract secondary sources (cited by primary)
        secondary_source_ids = []
        for primary in primary_sources:
            cited_docs = primary["citation"].get("references", [])
            for ref in cited_docs:
                if "document_id" in ref:
                    secondary_source_ids.append(ref["document_id"])

        secondary_sources = await self._fetch_secondary_sources(
            secondary_source_ids,
            tenant_id
        )

        # 5. Calculate evidence confidence
        evidence_confidence = self._calculate_evidence_confidence(
            primary_sources,
            secondary_sources
        )

        # 6. Store evidence chain
        evidence_chain_id = await self._store_evidence_chain(
            claim=claim,
            claim_type=claim_type,
            primary_sources=primary_sources,
            secondary_sources=secondary_sources,
            evidence_confidence=evidence_confidence,
            tenant_id=tenant_id,
            session_id=session_id,
            request_id=request_id,
            profile_id=profile.get("id")
        )

        logger.info("Evidence chain built",
                   chain_id=evidence_chain_id,
                   primary_count=len(primary_sources),
                   secondary_count=len(secondary_sources),
                   confidence=evidence_confidence)

        return {
            "claim": claim,
            "evidence_found": True,
            "evidence_chain_id": evidence_chain_id,
            "primary_sources": primary_sources,
            "secondary_sources": secondary_sources,
            "evidence_level": primary_sources[0]["evidence_level"],
            "evidence_confidence": evidence_confidence,
            "graphrag_profile": profile.get("name"),
            "search_method": "hybrid"
        }

    async def _fetch_secondary_sources(
        self,
        document_ids: List[str],
        tenant_id: UUID
    ) -> List[Dict[str, Any]]:
        """Fetch secondary source metadata from database"""
        if not document_ids:
            return []

        result = self.supabase.table("knowledge_documents") \
            .select("id, title, metadata") \
            .in_("id", document_ids) \
            .eq("tenant_id", str(tenant_id)) \
            .execute()

        return result.data if result.data else []

    def _calculate_evidence_confidence(
        self,
        primary_sources: List[Dict],
        secondary_sources: List[Dict]
    ) -> float:
        """
        Calculate evidence confidence score

        Factors:
        - Primary source relevance scores
        - Evidence levels (1A > 1B > 2A, etc.)
        - Number of corroborating sources
        - Presence of secondary citations
        """
        if not primary_sources:
            return 0.0

        # Relevance score (weighted average)
        relevance_avg = sum(s["relevance_score"] for s in primary_sources) / len(primary_sources)

        # Evidence level score (1A=1.0, 5=0.2)
        evidence_map = {"1A": 1.0, "1B": 0.9, "2A": 0.8, "2B": 0.7, "3": 0.6, "4": 0.4, "5": 0.2}
        evidence_avg = sum(evidence_map.get(s["evidence_level"], 0.5) for s in primary_sources) / len(primary_sources)

        # Corroboration bonus (multiple sources)
        corroboration = min(len(primary_sources) / 3.0, 1.0)  # Max at 3 sources

        # Secondary citation bonus
        citation_bonus = min(len(secondary_sources) / 10.0, 0.2)  # Max +0.2

        # Weighted combination
        confidence = (
            0.4 * relevance_avg +
            0.4 * evidence_avg +
            0.1 * corroboration +
            0.1 * citation_bonus
        )

        return round(confidence, 4)

    async def _store_evidence_chain(
        self,
        claim: str,
        claim_type: str,
        primary_sources: List[Dict],
        secondary_sources: List[Dict],
        evidence_confidence: float,
        tenant_id: UUID,
        session_id: UUID,
        request_id: str,
        profile_id: Optional[str]
    ) -> str:
        """Store evidence chain in database"""

        # Store each primary source as a row
        chain_ids = []
        for primary in primary_sources:
            result = self.supabase.table("mode3_graphrag_evidence_chains").insert({
                "tenant_id": str(tenant_id),
                "session_id": str(session_id),
                "request_id": request_id,
                "claim_text": claim,
                "claim_type": claim_type,
                "primary_source_id": primary["document_id"],
                "primary_source_title": primary["title"],
                "primary_source_snippet": primary["snippet"],
                "primary_source_relevance_score": primary["relevance_score"],
                "secondary_source_ids": [s["id"] for s in secondary_sources],
                "secondary_source_count": len(secondary_sources),
                "evidence_level": primary["evidence_level"],
                "evidence_confidence": evidence_confidence,
                "graphrag_profile_id": profile_id,
                "search_method": "hybrid"
            }).execute()

            if result.data:
                chain_ids.append(result.data[0]["id"])

        return chain_ids[0] if chain_ids else None
```

---

## 4. Data Retention Policies

### 4.1 Retention Strategy

**File:** `supabase/migrations/20251204000002_mode3_retention_policies.sql`

```sql
-- =====================================================================
-- MODE 3: DATA RETENTION & CLEANUP POLICIES
-- =====================================================================
-- Purpose: Automated cleanup of old execution data
-- Compliance: HIPAA (6-year minimum), GDPR (right to deletion)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Retention Configuration Table
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mode3_retention_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Retention periods (in days)
  checkpoint_retention_days INTEGER NOT NULL DEFAULT 30,
  execution_trace_retention_days INTEGER NOT NULL DEFAULT 2190,  -- 6 years (HIPAA)
  snapshot_retention_days INTEGER NOT NULL DEFAULT 7,
  evidence_chain_retention_days INTEGER NOT NULL DEFAULT 2190,  -- 6 years

  -- PHI-specific retention
  phi_checkpoint_retention_days INTEGER NOT NULL DEFAULT 2190,  -- 6 years
  phi_trace_retention_days INTEGER NOT NULL DEFAULT 2190,

  -- Cleanup schedule
  cleanup_enabled BOOLEAN DEFAULT TRUE,
  cleanup_cron_schedule TEXT DEFAULT '0 2 * * *',  -- 2 AM daily

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Insert default config
INSERT INTO mode3_retention_config (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. Cleanup Functions
-- ---------------------------------------------------------------------

-- Function: Cleanup expired checkpoints (non-PHI)
CREATE OR REPLACE FUNCTION mode3_cleanup_old_checkpoints() RETURNS INTEGER AS $$
DECLARE
  v_retention_days INTEGER;
  v_deleted_count INTEGER;
BEGIN
  -- Get retention period
  SELECT checkpoint_retention_days INTO v_retention_days
  FROM mode3_retention_config
  LIMIT 1;

  -- Delete non-PHI checkpoints older than retention period
  DELETE FROM mode3_hitl_checkpoints
  WHERE created_at < NOW() - INTERVAL '1 day' * v_retention_days
    AND approval_status IN ('approved', 'rejected', 'timeout', 'skipped')
    AND NOT EXISTS (
      SELECT 1 FROM mode3_execution_trace
      WHERE session_id = mode3_hitl_checkpoints.session_id
        AND phi_accessed = TRUE
    );

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Archive old execution traces (move to cold storage)
CREATE OR REPLACE FUNCTION mode3_archive_old_traces() RETURNS INTEGER AS $$
DECLARE
  v_retention_days INTEGER;
  v_archived_count INTEGER;
BEGIN
  -- Get retention period
  SELECT execution_trace_retention_days INTO v_retention_days
  FROM mode3_retention_config
  LIMIT 1;

  -- Archive traces older than retention (6 years for HIPAA)
  -- Note: In production, this would move to S3 Glacier instead of deleting
  WITH archived AS (
    DELETE FROM mode3_execution_trace
    WHERE event_timestamp < NOW() - INTERVAL '1 day' * v_retention_days
    RETURNING *
  )
  SELECT COUNT(*) INTO v_archived_count FROM archived;

  RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Cleanup old snapshots (keeping only latest per session)
CREATE OR REPLACE FUNCTION mode3_cleanup_old_snapshots() RETURNS INTEGER AS $$
DECLARE
  v_retention_days INTEGER;
  v_deleted_count INTEGER;
BEGIN
  SELECT snapshot_retention_days INTO v_retention_days
  FROM mode3_retention_config
  LIMIT 1;

  -- Keep only latest snapshot per session, delete rest older than retention
  WITH snapshots_to_delete AS (
    SELECT id
    FROM mode3_session_snapshots s1
    WHERE created_at < NOW() - INTERVAL '1 day' * v_retention_days
      AND can_resume_from = FALSE
      AND EXISTS (
        SELECT 1 FROM mode3_session_snapshots s2
        WHERE s2.session_id = s1.session_id
          AND s2.created_at > s1.created_at
      )
  )
  DELETE FROM mode3_session_snapshots
  WHERE id IN (SELECT id FROM snapshots_to_delete);

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Master cleanup (runs all cleanup functions)
CREATE OR REPLACE FUNCTION mode3_run_all_cleanup() RETURNS TABLE (
  function_name TEXT,
  records_processed INTEGER,
  executed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'mode3_cleanup_old_checkpoints'::TEXT,
    mode3_cleanup_old_checkpoints(),
    NOW();

  RETURN QUERY
  SELECT
    'mode3_archive_old_traces'::TEXT,
    mode3_archive_old_traces(),
    NOW();

  RETURN QUERY
  SELECT
    'mode3_cleanup_old_snapshots'::TEXT,
    mode3_cleanup_old_snapshots(),
    NOW();
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 3. Schedule Cleanup (requires pg_cron extension)
-- ---------------------------------------------------------------------

-- SELECT cron.schedule(
--   'mode3-daily-cleanup',
--   '0 2 * * *',  -- 2 AM daily
--   'SELECT mode3_run_all_cleanup()'
-- );

-- ---------------------------------------------------------------------
-- 4. Comments
-- ---------------------------------------------------------------------

COMMENT ON FUNCTION mode3_cleanup_old_checkpoints IS
  'Deletes non-PHI checkpoints older than retention period (default 30 days)';

COMMENT ON FUNCTION mode3_archive_old_traces IS
  'Archives execution traces older than 6 years (HIPAA minimum retention)';

COMMENT ON FUNCTION mode3_cleanup_old_snapshots IS
  'Deletes old session snapshots, keeping only latest per session';
```

---

## 5. Index Strategies for Execution Trace Queries

### 5.1 Common Query Patterns

**Query Pattern 1:** "Show me all HITL checkpoints for a session"
```sql
-- Optimized with: idx_mode3_checkpoints_session
SELECT * FROM mode3_hitl_checkpoints
WHERE session_id = '<session_uuid>'
ORDER BY checkpoint_number;
```

**Query Pattern 2:** "Show execution trace for PHI access events"
```sql
-- Optimized with: idx_mode3_trace_phi (partial index)
SELECT * FROM mode3_execution_trace
WHERE tenant_id = '<tenant_uuid>'
  AND phi_accessed = TRUE
ORDER BY event_timestamp DESC;
```

**Query Pattern 3:** "Agent hierarchy tree for a session"
```sql
-- Optimized with: idx_mode3_subagent_session + recursive CTE
WITH RECURSIVE agent_tree AS (
  -- Root (L2 expert)
  SELECT id, agent_id, agent_name, parent_agent_id, hierarchy_depth, 0 AS tree_order
  FROM mode3_sub_agent_hierarchy
  WHERE session_id = '<session_uuid>' AND parent_agent_id IS NULL

  UNION ALL

  -- Children
  SELECT h.id, h.agent_id, h.agent_name, h.parent_agent_id, h.hierarchy_depth,
         tree_order + 1
  FROM mode3_sub_agent_hierarchy h
  JOIN agent_tree t ON h.parent_agent_id = t.agent_id
)
SELECT * FROM agent_tree ORDER BY tree_order, hierarchy_depth;
```

**Query Pattern 4:** "Full audit trail for HIPAA compliance"
```sql
-- Optimized with: idx_mode3_trace_tenant + idx_mode3_trace_timestamp
SELECT
  t.event_type,
  t.event_timestamp,
  t.node_name,
  t.agent_id,
  t.event_data,
  t.phi_accessed,
  t.phi_fields
FROM mode3_execution_trace t
WHERE t.tenant_id = '<tenant_uuid>'
  AND t.session_id = '<session_uuid>'
  AND t.event_timestamp >= NOW() - INTERVAL '6 years'  -- HIPAA minimum
ORDER BY t.event_timestamp;
```

### 5.2 Performance Tuning

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM mode3_execution_trace
WHERE tenant_id = '<uuid>'
  AND event_type IN ('hitl_request', 'hitl_response')
ORDER BY event_timestamp DESC
LIMIT 100;

-- Create materialized view for common aggregations
CREATE MATERIALIZED VIEW mode3_session_metrics AS
SELECT
  session_id,
  tenant_id,
  COUNT(*) FILTER (WHERE event_type = 'llm_call') AS llm_calls,
  SUM(tokens_used) AS total_tokens,
  SUM(cost_usd) AS total_cost,
  COUNT(*) FILTER (WHERE phi_accessed = TRUE) AS phi_access_count,
  COUNT(*) FILTER (WHERE cache_hit = TRUE) AS cache_hits,
  COUNT(*) FILTER (WHERE event_success = FALSE) AS error_count,
  MIN(event_timestamp) AS session_start,
  MAX(event_timestamp) AS session_end
FROM mode3_execution_trace
GROUP BY session_id, tenant_id;

CREATE INDEX idx_mode3_metrics_session ON mode3_session_metrics(session_id);
CREATE INDEX idx_mode3_metrics_tenant ON mode3_session_metrics(tenant_id);

-- Refresh materialized view (can be scheduled)
REFRESH MATERIALIZED VIEW CONCURRENTLY mode3_session_metrics;
```

---

## 6. Implementation Checklist

### 6.1 Phase 1: Enhanced State Schema (Week 1)
- [ ] Create `mode3_state_schema.py` with `Mode3WorkflowState`
- [ ] Add TypedDict classes for all checkpoint types
- [ ] Implement `create_mode3_initial_state()` factory
- [ ] Update `mode3_manual_autonomous.py` to use new state
- [ ] Add state validation in `build_workflow()`
- [ ] Test state serialization/deserialization

### 6.2 Phase 2: Checkpoint Persistence (Week 2)
- [ ] Run migration `20251204000001_mode3_checkpoint_system.sql`
- [ ] Implement `Mode3CheckpointService` Python class
- [ ] Add `save_checkpoint()` to HITL nodes
- [ ] Add `resume_from_checkpoint()` endpoint
- [ ] Test checkpoint save/load cycle
- [ ] Test timeout expiration handling

### 6.3 Phase 3: Execution Trace & Audit (Week 3)
- [ ] Implement `Mode3ExecutionTracer` service
- [ ] Add trace logging to all nodes
- [ ] Add PHI access detection
- [ ] Create HIPAA audit report generator
- [ ] Test trace query performance
- [ ] Create Grafana dashboards for trace metrics

### 6.4 Phase 4: GraphRAG Integration (Week 4)
- [ ] Create `mode3_graphrag_evidence_chains` table
- [ ] Implement `Mode3GraphRAGIntegration` service
- [ ] Add evidence chain building to nodes
- [ ] Test multi-level citation tracking
- [ ] Validate evidence confidence scoring
- [ ] Add evidence chain visualization to UI

### 6.5 Phase 5: Retention & Cleanup (Week 5)
- [ ] Run migration `20251204000002_mode3_retention_policies.sql`
- [ ] Configure retention periods per tenant
- [ ] Schedule daily cleanup jobs
- [ ] Implement S3 archive for old traces
- [ ] Test GDPR deletion requests
- [ ] Document retention policy for compliance team

---

## 7. Performance Benchmarks

### 7.1 Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Checkpoint Save Time | <500ms | P95 |
| Checkpoint Load Time | <200ms | P95 |
| Trace Event Write | <50ms | P95 |
| Trace Query (1 session) | <1s | P95 |
| Evidence Chain Build | <3s | P95 |
| State Snapshot Size | <1MB | Median |
| RLS Policy Overhead | <10ms | Per query |

### 7.2 Scalability Limits

| Resource | Limit | Mitigation |
|----------|-------|------------|
| Checkpoints per session | 50 | Consolidate low-risk steps |
| Trace events per session | 10,000 | Partition table by month |
| Sub-agents spawned | 20 | Enforce `max_sub_agent_depth` |
| Evidence chains per claim | 5 | Cache evidence results |
| Session snapshot storage | 10GB/tenant | Compress snapshots, archive to S3 |

---

## 8. Security Considerations

### 8.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| **Checkpoint Tampering** | Checkpoints are immutable after creation. Use `approval_modifications` for user edits. |
| **Tenant Data Leakage** | RLS policies enforce tenant isolation. All queries filtered by `tenant_id`. |
| **PHI Exposure in Logs** | `phi_fields` redacted in logs. Full data only in encrypted database. |
| **Checkpoint Replay Attacks** | Checkpoints expire after timeout. `resume_count` prevents infinite retries. |
| **State Injection** | State snapshots validated against schema before load. |

### 8.2 HIPAA Compliance Checklist

- [x] **Encryption at Rest:** Supabase encrypts all data at rest (AES-256)
- [x] **Encryption in Transit:** TLS 1.3 for all API calls
- [x] **Access Controls:** RLS policies + RBAC for user permissions
- [x] **Audit Trail:** `mode3_execution_trace` provides complete audit log
- [x] **PHI Flagging:** `phi_accessed` column tracks PHI access events
- [x] **Data Retention:** 6-year minimum retention for PHI-related traces
- [x] **Right to Deletion:** Cleanup functions support GDPR deletion requests
- [x] **Breach Notification:** Alert on `phi_accessed = TRUE` for unauthorized users

---

## 9. Monitoring & Observability

### 9.1 CloudWatch/Grafana Metrics

```typescript
// CloudWatch metrics to emit from Mode 3 workflow
const METRICS = {
  // Checkpoint metrics
  "mode3.checkpoint.created": { type: "count", dimensions: ["checkpoint_type", "tenant_id"] },
  "mode3.checkpoint.approved": { type: "count", dimensions: ["checkpoint_type", "approval_time_ms"] },
  "mode3.checkpoint.rejected": { type: "count", dimensions: ["checkpoint_type", "reason"] },
  "mode3.checkpoint.timeout": { type: "count", dimensions: ["checkpoint_type"] },

  // Execution metrics
  "mode3.execution.started": { type: "count", dimensions: ["tenant_id", "agent_tier"] },
  "mode3.execution.completed": { type: "count", dimensions: ["duration_seconds", "cost_usd"] },
  "mode3.execution.failed": { type: "count", dimensions: ["error_type", "node_name"] },

  // Resource metrics
  "mode3.subagents.spawned": { type: "count", dimensions: ["agent_level", "task_type"] },
  "mode3.tools.invoked": { type: "count", dimensions: ["tool_name", "success"] },
  "mode3.llm.calls": { type: "count", dimensions: ["model", "tokens_used", "cost_usd"] },

  // Evidence metrics
  "mode3.evidence.chains_built": { type: "count", dimensions: ["claim_type", "source_count"] },
  "mode3.evidence.confidence": { type: "histogram", dimensions: ["evidence_level"] },

  // Compliance metrics
  "mode3.phi.accessed": { type: "count", dimensions: ["phi_field", "user_role"] },
  "mode3.constitutional.violations": { type: "count", dimensions: ["severity", "principle"] },
};
```

### 9.2 Alerting Rules

```yaml
# Grafana alerting rules
alerts:
  - name: "Mode3 Checkpoint Timeout Rate High"
    query: "rate(mode3_checkpoint_timeout[5m]) > 0.1"
    severity: warning
    message: "More than 10% of Mode 3 checkpoints are timing out"

  - name: "Mode3 PHI Access Spike"
    query: "increase(mode3_phi_accessed[1h]) > 100"
    severity: critical
    message: "Unusual spike in PHI access events detected"

  - name: "Mode3 Execution Failure Rate High"
    query: "rate(mode3_execution_failed[15m]) > 0.05"
    severity: warning
    message: "Mode 3 execution failure rate exceeds 5%"

  - name: "Mode3 Database Storage Growth"
    query: "pg_database_size(mode3_execution_trace) > 50GB"
    severity: info
    message: "Mode 3 execution trace table exceeds 50GB, consider archiving"
```

---

## 10. Conclusion

This data architecture provides a production-ready foundation for Mode 3 (Manual Autonomous) execution with:

1. **Enhanced State Management** - `Mode3WorkflowState` with 24+ hour session support
2. **Checkpoint Persistence** - HITL resume capability with state snapshots
3. **Execution Audit Trail** - HIPAA-compliant immutable logs
4. **Sub-Agent Hierarchy Tracking** - Full L2→L3→L4→L5 visibility
5. **GraphRAG Evidence Chains** - Multi-level citation provenance
6. **Data Retention Policies** - Automated cleanup with compliance requirements
7. **Performance Optimization** - Indexed queries, materialized views, partitioning strategies

**Next Steps:**
1. Review with vital-platform-orchestrator for alignment with PRD/ARD
2. Implement Phase 1 (Enhanced State Schema)
3. Test checkpoint save/resume cycle
4. Deploy to staging environment
5. Conduct load testing with 100 concurrent Mode 3 sessions

**Total Implementation Estimate:** 5 weeks (1 week per phase)

---

## Appendix A: Related Files

| File | Path |
|------|------|
| **PRD** | `.claude/docs/services/ask-expert/MODE_3_PRD.md` |
| **ARD** | `.claude/docs/services/ask-expert/MODE_3_ARD.md` |
| **Base State Schema** | `services/ai-engine/src/langgraph_workflows/state_schemas.py` |
| **Mode 3 Workflow** | `services/ai-engine/src/langgraph_workflows/mode3_manual_autonomous.py` |
| **HITL Service** | `services/ai-engine/src/services/hitl_service.py` |
| **Session Memory** | `services/ai-engine/src/services/session_memory_service.py` |
| **GraphRAG Selector** | `services/ai-engine/src/services/graphrag_selector.py` |
| **Unified RAG** | `services/ai-engine/src/services/unified_rag_service.py` |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **HITL** | Human-In-The-Loop approval checkpoints |
| **L2/L3/L4/L5** | Agent hierarchy levels (Expert/Specialist/Worker/Tool) |
| **Checkpoint** | Saved state snapshot for workflow resumption |
| **Evidence Chain** | Primary source → Secondary sources citation graph |
| **GraphRAG** | Graph-based Retrieval Augmented Generation |
| **RLS** | Row-Level Security (Supabase multi-tenant isolation) |
| **Constitutional AI** | Safety validation against ethical principles |
| **ToT** | Tree-of-Thoughts (multi-path planning) |
| **ReAct** | Reasoning + Acting execution loop |
| **PHI** | Protected Health Information (HIPAA) |

---

**Document prepared by:** VITAL Data Strategist Agent
**Version:** 1.0
**Date:** December 4, 2025
