"""
Agent OS Test Fixtures

Shared fixtures for Agent OS unit and integration tests.
"""

import pytest
from typing import Dict, Any, List
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime, timedelta
import uuid


# ============================================================================
# Agent OS Mock Data
# ============================================================================

@pytest.fixture
def mock_tenant_id() -> str:
    """Standard test tenant ID."""
    return "550e8400-e29b-41d4-a716-446655440000"


@pytest.fixture
def mock_user_id() -> str:
    """Standard test user ID."""
    return "660e8400-e29b-41d4-a716-446655440001"


@pytest.fixture
def mock_agent_id() -> str:
    """Standard test agent ID."""
    return "770e8400-e29b-41d4-a716-446655440002"


# ============================================================================
# Personality Types
# ============================================================================

@pytest.fixture
def mock_personality_types() -> List[Dict[str, Any]]:
    """Mock personality type data."""
    return [
        {
            "id": "pt-analytical",
            "slug": "analytical",
            "display_name": "Analytical Expert",
            "category": "general",
            "temperature": 0.2,
            "top_p": 0.9,
            "default_max_tokens": 2048,
            "verbosity_level": 40,
            "formality_level": 70,
            "directness_level": 80,
            "warmth_level": 30,
            "technical_level": 80,
            "reasoning_approach": "analytical",
            "proactivity_level": 50,
            "tone_keywords": ["precise", "methodical", "data-driven"],
        },
        {
            "id": "pt-creative",
            "slug": "creative",
            "display_name": "Creative Innovator",
            "category": "general",
            "temperature": 0.7,
            "top_p": 0.95,
            "default_max_tokens": 4096,
            "verbosity_level": 70,
            "formality_level": 40,
            "directness_level": 50,
            "warmth_level": 70,
            "technical_level": 50,
            "reasoning_approach": "creative",
            "proactivity_level": 80,
            "tone_keywords": ["innovative", "exploratory", "imaginative"],
        },
        {
            "id": "pt-cautious",
            "slug": "cautious",
            "display_name": "Cautious Evaluator",
            "category": "medical",
            "temperature": 0.2,
            "top_p": 0.85,
            "default_max_tokens": 2048,
            "verbosity_level": 50,
            "formality_level": 80,
            "directness_level": 60,
            "warmth_level": 40,
            "technical_level": 70,
            "reasoning_approach": "cautious",
            "proactivity_level": 30,
            "tone_keywords": ["careful", "thorough", "risk-aware"],
        },
    ]


@pytest.fixture
def mock_analytical_personality(mock_personality_types) -> Dict[str, Any]:
    """Get analytical personality fixture."""
    return mock_personality_types[0]


# ============================================================================
# Context Data
# ============================================================================

@pytest.fixture
def mock_regions() -> List[Dict[str, Any]]:
    """Mock regulatory regions."""
    return [
        {"id": "reg-fda", "code": "FDA", "name": "US Food and Drug Administration"},
        {"id": "reg-ema", "code": "EMA", "name": "European Medicines Agency"},
        {"id": "reg-pmda", "code": "PMDA", "name": "Pharmaceuticals and Medical Devices Agency"},
    ]


@pytest.fixture
def mock_domains() -> List[Dict[str, Any]]:
    """Mock product domains."""
    return [
        {"id": "dom-pharma", "code": "PHARMA", "name": "Pharmaceuticals"},
        {"id": "dom-devices", "code": "DEVICES", "name": "Medical Devices"},
        {"id": "dom-biologics", "code": "BIOLOGICS", "name": "Biologics"},
    ]


@pytest.fixture
def mock_therapeutic_areas() -> List[Dict[str, Any]]:
    """Mock therapeutic areas."""
    return [
        {"id": "ta-oncology", "code": "ONCOLOGY", "name": "Oncology"},
        {"id": "ta-cardio", "code": "CARDIO", "name": "Cardiovascular"},
        {"id": "ta-neuro", "code": "NEURO", "name": "Neurology"},
    ]


@pytest.fixture
def mock_phases() -> List[Dict[str, Any]]:
    """Mock development phases."""
    return [
        {"id": "phase-discovery", "code": "DISCOVERY", "name": "Discovery"},
        {"id": "phase-preclinical", "code": "PRECLINICAL", "name": "Pre-Clinical"},
        {"id": "phase-1", "code": "PHASE1", "name": "Phase I"},
        {"id": "phase-2", "code": "PHASE2", "name": "Phase II"},
        {"id": "phase-3", "code": "PHASE3", "name": "Phase III"},
    ]


# ============================================================================
# Agent Data
# ============================================================================

@pytest.fixture
def mock_agent() -> Dict[str, Any]:
    """Mock agent data."""
    return {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "regulatory_expert",
        "display_name": "Regulatory Expert",
        "description": "Expert in FDA and EMA regulatory requirements",
        "level_id": "level-l2",
        "personality_type_id": "pt-analytical",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
        "is_active": True,
        "base_model": "claude-sonnet-4-20250514",
        "system_prompt": "You are a regulatory expert specializing in FDA and EMA submissions.",
        "domains": ["regulatory", "compliance"],
        "capabilities": ["510k_review", "ema_dossier", "ich_guidelines"],
        "agent_levels": {
            "level_number": 2,
            "name": "L2 Expert",
            "description": "Domain expert with deep knowledge",
        },
        "personality_types": {
            "slug": "analytical",
            "display_name": "Analytical Expert",
            "temperature": 0.2,
        },
    }


@pytest.fixture
def mock_agents_list(mock_agent) -> List[Dict[str, Any]]:
    """List of mock agents for testing."""
    return [
        mock_agent,
        {
            **mock_agent,
            "id": "agent-clinical",
            "name": "clinical_expert",
            "display_name": "Clinical Expert",
            "description": "Expert in clinical trials",
            "domains": ["clinical", "trials"],
            "capabilities": ["trial_design", "protocol_review"],
        },
        {
            **mock_agent,
            "id": "agent-safety",
            "name": "safety_expert",
            "display_name": "Safety Expert",
            "description": "Expert in pharmacovigilance",
            "domains": ["safety", "pharmacovigilance"],
            "capabilities": ["adverse_events", "signal_detection"],
        },
    ]


# ============================================================================
# Session Data
# ============================================================================

@pytest.fixture
def mock_session() -> Dict[str, Any]:
    """Mock session data."""
    return {
        "id": str(uuid.uuid4()),
        "agent_id": "770e8400-e29b-41d4-a716-446655440002",
        "user_id": "660e8400-e29b-41d4-a716-446655440001",
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
        "context_region_id": "reg-fda",
        "context_domain_id": "dom-pharma",
        "context_therapeutic_area_id": "ta-oncology",
        "context_phase_id": "phase-3",
        "personality_type_id": "pt-analytical",
        "session_mode": "interactive",
        "status": "active",
        "started_at": datetime.utcnow().isoformat(),
        "query_count": 5,
        "total_input_tokens": 1500,
        "total_output_tokens": 3000,
        "total_cost_usd": 0.045,
        "avg_response_time_ms": 2500,
        "satisfaction_score": 0.85,
    }


@pytest.fixture
def mock_sessions_list(mock_session) -> List[Dict[str, Any]]:
    """List of mock sessions for analytics testing."""
    sessions = []
    base_time = datetime.utcnow() - timedelta(days=30)
    
    for i in range(20):
        session = mock_session.copy()
        session["id"] = str(uuid.uuid4())
        session["started_at"] = (base_time + timedelta(days=i)).isoformat()
        session["query_count"] = 3 + (i % 5)
        session["total_cost_usd"] = 0.02 + (i % 10) * 0.01
        session["satisfaction_score"] = 0.7 + (i % 3) * 0.1
        sessions.append(session)
    
    return sessions


# ============================================================================
# Synergy Data
# ============================================================================

@pytest.fixture
def mock_synergy() -> Dict[str, Any]:
    """Mock synergy data."""
    return {
        "agent_a_id": "agent-regulatory",
        "agent_b_id": "agent-clinical",
        "synergy_score": 0.75,
        "co_occurrence_count": 25,
        "success_rate": 0.88,
        "complementary_score": 0.82,
        "conflict_score": 0.05,
        "is_recommended": True,
        "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
    }


# ============================================================================
# Mock Supabase Client
# ============================================================================

@pytest.fixture
def mock_supabase_client(
    mock_agent,
    mock_agents_list,
    mock_personality_types,
    mock_regions,
    mock_domains,
    mock_therapeutic_areas,
    mock_phases,
    mock_sessions_list,
):
    """Comprehensive mock Supabase client."""
    mock = MagicMock()
    
    def create_table_mock(table_name):
        table_mock = MagicMock()
        
        # Default execute returns
        def execute_select():
            result = MagicMock()
            if table_name == "agents":
                result.data = mock_agents_list
            elif table_name == "personality_types":
                result.data = mock_personality_types
            elif table_name == "context_regions":
                result.data = mock_regions
            elif table_name == "context_domains":
                result.data = mock_domains
            elif table_name == "context_therapeutic_areas":
                result.data = mock_therapeutic_areas
            elif table_name == "context_phases":
                result.data = mock_phases
            elif table_name == "agent_sessions":
                result.data = mock_sessions_list
            else:
                result.data = []
            return result
        
        def execute_single():
            result = MagicMock()
            if table_name == "agents":
                result.data = mock_agent
            elif table_name == "personality_types":
                result.data = mock_personality_types[0]
            elif table_name == "context_regions":
                result.data = mock_regions[0]
            else:
                result.data = {}
            return result
        
        table_mock.select.return_value.execute = execute_select
        table_mock.select.return_value.eq.return_value.execute = execute_select
        table_mock.select.return_value.eq.return_value.single.return_value.execute = execute_single
        table_mock.select.return_value.eq.return_value.gte.return_value.execute = execute_select
        table_mock.select.return_value.eq.return_value.eq.return_value.execute = execute_select
        table_mock.select.return_value.in_.return_value.execute = execute_select
        
        # Insert mock
        insert_result = MagicMock()
        insert_result.data = {"id": str(uuid.uuid4())}
        table_mock.insert.return_value.execute = MagicMock(return_value=insert_result)
        
        # Upsert mock
        table_mock.upsert.return_value.execute = MagicMock(return_value=insert_result)
        
        # Update mock
        table_mock.update.return_value.eq.return_value.execute = MagicMock(return_value=insert_result)
        
        return table_mock
    
    mock.table = create_table_mock
    
    # RPC mock
    rpc_result = MagicMock()
    rpc_result.data = 0.75  # Default synergy score
    mock.rpc.return_value.execute = MagicMock(return_value=rpc_result)
    
    return mock


# ============================================================================
# Mock Neo4j Driver
# ============================================================================

@pytest.fixture
def mock_neo4j_driver():
    """Mock Neo4j async driver."""
    mock = MagicMock()
    
    # Mock session context manager
    session_mock = MagicMock()
    session_mock.__aenter__ = AsyncMock(return_value=session_mock)
    session_mock.__aexit__ = AsyncMock(return_value=None)
    
    # Mock run results
    run_result = MagicMock()
    run_result.single = AsyncMock(return_value={
        "agents": 10,
        "concepts": 25,
        "relationships": 50,
    })
    session_mock.run = AsyncMock(return_value=run_result)
    
    mock.session.return_value = session_mock
    
    return mock


# ============================================================================
# Mock Pinecone
# ============================================================================

@pytest.fixture
def mock_pinecone_index():
    """Mock Pinecone index."""
    mock = MagicMock()
    
    # Mock describe_index_stats
    stats = MagicMock()
    stats.total_vector_count = 100
    stats.dimension = 3072
    stats.namespaces = {"global": MagicMock(vector_count=100)}
    mock.describe_index_stats.return_value = stats
    
    # Mock query
    query_result = MagicMock()
    query_result.matches = [
        MagicMock(id="agent-1", score=0.95, metadata={"name": "Agent 1"}),
        MagicMock(id="agent-2", score=0.88, metadata={"name": "Agent 2"}),
    ]
    mock.query.return_value = query_result
    
    # Mock upsert
    mock.upsert.return_value = None
    
    return mock


# ============================================================================
# Mock OpenAI Client
# ============================================================================

@pytest.fixture
def mock_openai_client():
    """Mock OpenAI async client."""
    mock = AsyncMock()
    
    # Mock embeddings
    embedding_response = MagicMock()
    embedding_response.data = [
        MagicMock(embedding=[0.1] * 3072)
    ]
    mock.embeddings.create = AsyncMock(return_value=embedding_response)
    
    return mock
