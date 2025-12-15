"""
Pytest configuration and fixtures for VITAL Path AI Services tests
"""

import pytest
import os
import asyncio
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock, MagicMock
import numpy as np
import httpx
from httpx import ASGITransport

# Ensure main app has a supabase_client stub for integration tests
import main as main_app  # type: ignore


class _StubSupabase:
    """Minimal Supabase stub for tests expecting supabase_client on app."""

    def table(self, *args, **kwargs):
        return self

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    async def insert(self, *args, **kwargs):
        return {"data": [], "error": None}

    async def update(self, *args, **kwargs):
        return {"data": [], "error": None}

    async def execute(self, *args, **kwargs):
        return {"data": [], "error": None}


if not getattr(main_app, "supabase_client", None):
    main_app.supabase_client = _StubSupabase()

# Set test environment variables
os.environ['OPENAI_API_KEY'] = 'test-key-12345'
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_ANON_KEY'] = 'test-anon-key'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'test-service-role-key'
os.environ['DATABASE_URL'] = 'postgresql://localhost:54322/test_db'

# Confidence calculation test settings
os.environ['CONFIDENCE_RAG_WEIGHT'] = '0.40'
os.environ['CONFIDENCE_ALIGNMENT_WEIGHT'] = '0.40'
os.environ['CONFIDENCE_COMPLETENESS_WEIGHT'] = '0.20'
os.environ['CONFIDENCE_TIER1_BASE'] = '0.75'
os.environ['CONFIDENCE_TIER2_BASE'] = '0.65'
os.environ['CONFIDENCE_TIER3_BASE'] = '0.55'

# RAG configuration test settings
os.environ['SIMILARITY_THRESHOLD_DEFAULT'] = '0.7'
os.environ['MEDICAL_TERM_BOOST'] = '0.05'
os.environ['SPECIALTY_MATCH_BOOST'] = '0.10'


# ============================================================================
# Event Loop Fixtures
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ============================================================================
# Mock Data Fixtures
# ============================================================================

@pytest.fixture
def sample_query() -> str:
    """Sample user query for testing"""
    return "What are the FDA requirements for Class II medical devices?"


@pytest.fixture
def sample_response() -> str:
    """Sample agent response for testing"""
    return """FDA Class II medical devices require 510(k) premarket notification.

Key Requirements:
1. Demonstrate substantial equivalence to a predicate device
2. Submit technical documentation including:
   - Device description and intended use
   - Comparison to predicate device
   - Performance data
   - Biocompatibility testing
   - Software validation (if applicable)

3. FDA review timeline: 90 days standard review

References:
- 21 CFR Part 807
- FDA Guidance on 510(k) submissions

The device must comply with Quality System Regulation (21 CFR Part 820) and applicable performance standards."""


@pytest.fixture
def sample_rag_results() -> List[Dict[str, Any]]:
    """Sample RAG search results for testing"""
    return [
        {
            "content": "FDA 510(k) premarket notification process...",
            "similarity": 0.92,
            "metadata": {
                "source": "FDA Guidance Document",
                "document_type": "regulatory_guidance",
                "specialty": "regulatory_affairs",
                "evidence_level": 1
            }
        },
        {
            "content": "Class II medical device classification...",
            "similarity": 0.88,
            "metadata": {
                "source": "21 CFR Part 807",
                "document_type": "regulation",
                "specialty": "regulatory_affairs",
                "evidence_level": 1
            }
        },
        {
            "content": "Quality System Regulation requirements...",
            "similarity": 0.85,
            "metadata": {
                "source": "21 CFR Part 820",
                "document_type": "regulation",
                "specialty": "quality_assurance",
                "evidence_level": 1
            }
        },
        {
            "content": "Medical device performance testing...",
            "similarity": 0.78,
            "metadata": {
                "source": "ISO 13485 Standard",
                "document_type": "standard",
                "specialty": "quality_assurance",
                "evidence_level": 2
            }
        },
        {
            "content": "Substantial equivalence determination...",
            "similarity": 0.72,
            "metadata": {
                "source": "FDA Guidance",
                "document_type": "guidance",
                "specialty": "regulatory_affairs",
                "evidence_level": 2
            }
        }
    ]


@pytest.fixture
def sample_agent_metadata() -> Dict[str, Any]:
    """Sample agent metadata for testing"""
    return {
        "name": "Regulatory Expert",
        "tier": 1,
        "agent_level": 1,
        "specialties": [
            "fda_regulatory",
            "ema_regulatory",
            "ich_guidelines"
        ]
    }


@pytest.fixture
def tier1_agent_metadata() -> Dict[str, Any]:
    """Tier 1 agent metadata"""
    return {
        "name": "Medical Specialist",
        "tier": 1,
        "agent_level": 1,
        "specialties": ["clinical_research", "regulatory_affairs"]
    }


@pytest.fixture
def tier2_agent_metadata() -> Dict[str, Any]:
    """Tier 2 agent metadata"""
    return {
        "name": "Clinical Researcher",
        "tier": 2,
        "agent_level": 2,
        "specialties": ["clinical_trial_design", "biostatistics"]
    }


@pytest.fixture
def tier3_agent_metadata() -> Dict[str, Any]:
    """Tier 3 agent metadata"""
    return {
        "name": "General Medical Agent",
        "tier": 3,
        "agent_level": 3,
        "specialties": ["general_medicine"]
    }


# ============================================================================
# HTTPX ASGI Client for integration tests
# ============================================================================

@pytest.fixture
async def http_client():
    """ASGI-aware httpx client pointing at FastAPI app."""
    transport = ASGITransport(app=main_app.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


# ============================================================================
# Mock Service Fixtures
# ============================================================================

@pytest.fixture
def mock_openai_embeddings():
    """Mock OpenAI embeddings service"""
    mock = AsyncMock()

    # Generate consistent fake embeddings
    async def fake_embed_query(text: str) -> List[float]:
        # Use text hash for reproducibility
        np.random.seed(hash(text) % (2**32))
        return np.random.rand(1536).tolist()

    mock.aembed_query = fake_embed_query
    mock.embed_query = lambda text: asyncio.run(fake_embed_query(text))

    return mock


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client with comprehensive agent data"""
    mock = MagicMock()
    
    # Mock agent data
    mock_agent_data = {
        "id": "test-agent-id",
        "name": "regulatory-expert",
        "slug": "regulatory-expert",
        "display_name": "Regulatory Expert",
        "description": "Expert in FDA and EMA regulations",
        "system_prompt": "You are a regulatory affairs expert specializing in FDA and EMA submissions.",
        "base_model": "claude-sonnet-4-20250514",
        "personality_type_id": "pt-analytical",
        "agent_levels": {"level_number": 2, "level_name": "Expert"},
        "status": "active",
    }
    
    # Mock personality data
    mock_personality_data = {
        "id": "pt-analytical",
        "slug": "analytical",
        "display_name": "Analytical",
        "temperature": 0.2,
        "top_p": 0.9,
        "verbosity_level": 40,
        "formality_level": 70,
        "technical_level": 80,
        "reasoning_approach": "analytical",
        "tone_keywords": ["precise", "evidence-based"],
    }
    
    # Mock capabilities data
    mock_capabilities_data = [
        {
            "capability_id": "cap-1",
            "proficiency_level": "expert",
            "is_primary": True,
            "capabilities": {
                "id": "cap-1",
                "capability_name": "regulatory-analysis",
                "capability_slug": "regulatory-analysis",
                "display_name": "Regulatory Analysis",
                "category": "regulatory",
                "description": "Analyze regulatory requirements",
            }
        },
        {
            "capability_id": "cap-2",
            "proficiency_level": "proficient",
            "is_primary": False,
            "capabilities": {
                "id": "cap-2",
                "capability_name": "compliance-review",
                "capability_slug": "compliance-review",
                "display_name": "Compliance Review",
                "category": "regulatory",
                "description": "Review compliance status",
            }
        }
    ]
    
    # Mock skills data
    mock_skills_data = [
        {
            "skill_id": "skill-1",
            "importance_level": "core",
            "skills": {
                "id": "skill-1",
                "skill_name": "fda-submission-review",
                "skill_slug": "fda-submission-review",
                "display_name": "FDA Submission Review",
                "category": "regulatory",
                "skill_type": "analytical",
                "invocation_method": "analyze_fda_submission",
            }
        },
        {
            "skill_id": "skill-2",
            "importance_level": "supplementary",
            "skills": {
                "id": "skill-2",
                "skill_name": "ema-guidance-interpretation",
                "skill_slug": "ema-guidance-interpretation",
                "display_name": "EMA Guidance Interpretation",
                "category": "regulatory",
                "skill_type": "analytical",
                "invocation_method": "interpret_ema_guidance",
            }
        }
    ]
    
    # Mock agent skills with proficiency
    mock_agent_skills_data = [
        {"skill_id": "skill-1", "proficiency_level": "expert", "is_primary": True, "usage_count": 150},
        {"skill_id": "skill-2", "proficiency_level": "proficient", "is_primary": False, "usage_count": 75},
    ]
    
    # Mock tools data
    mock_tools_data = [
        {
            "tool_id": "tool-1",
            "is_enabled": True,
            "priority": 1,
            "is_required": False,
            "tools": {
                "id": "tool-1",
                "name": "pubmed-search",
                "display_name": "PubMed Search",
                "description": "Search PubMed for medical literature",
                "tool_type": "search",
                "input_schema": {"query": "string"},
            }
        },
        {
            "tool_id": "tool-2",
            "is_enabled": True,
            "priority": 2,
            "is_required": True,
            "tools": {
                "id": "tool-2",
                "name": "fda-database",
                "display_name": "FDA Database",
                "description": "Search FDA approval database",
                "tool_type": "database",
                "input_schema": {"drug_name": "string"},
            }
        }
    ]
    
    # Mock context data
    mock_context_region = {"code": "FDA", "name": "US FDA"}
    mock_context_domain = {"code": "PHARMA", "name": "Pharmaceuticals"}
    mock_context_ta = {"code": "ONCOLOGY", "name": "Oncology"}
    mock_context_phase = {"code": "PHASE3", "name": "Phase III"}
    
    # Setup chained mock responses
    def setup_table_chain(table_name):
        table_mock = MagicMock()
        select_mock = MagicMock()
        eq_mock = MagicMock()
        single_mock = MagicMock()
        execute_mock = MagicMock()
        order_mock = MagicMock()
        
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.eq.return_value = eq_mock
        eq_mock.single.return_value = single_mock
        eq_mock.order.return_value = order_mock
        eq_mock.execute.return_value = execute_mock
        single_mock.execute.return_value = execute_mock
        order_mock.execute.return_value = execute_mock
        
        # Set data based on table name
        if table_name == 'agents':
            execute_mock.data = mock_agent_data
        elif table_name == 'personality_types':
            execute_mock.data = mock_personality_data
        elif table_name == 'agent_capabilities':
            execute_mock.data = mock_capabilities_data
        elif table_name == 'capability_skills':
            execute_mock.data = mock_skills_data
        elif table_name == 'agent_skills':
            execute_mock.data = mock_agent_skills_data
        elif table_name == 'agent_tool_assignments':
            execute_mock.data = mock_tools_data
        elif table_name == 'agent_tools':
            execute_mock.data = mock_tools_data
        elif table_name == 'context_regions':
            execute_mock.data = mock_context_region
        elif table_name == 'context_domains':
            execute_mock.data = mock_context_domain
        elif table_name == 'context_therapeutic_areas':
            execute_mock.data = mock_context_ta
        elif table_name == 'context_phases':
            execute_mock.data = mock_context_phase
        elif table_name == 'agent_sessions':
            execute_mock.data = {"id": "session-123"}
        else:
            execute_mock.data = []
        
        return table_mock
    
    mock.table = lambda name: setup_table_chain(name)
    
    # Mock RPC calls
    rpc_mock = MagicMock()
    rpc_mock.execute.return_value = MagicMock(data={"success": True})
    mock.rpc.return_value = rpc_mock

    return mock


@pytest.fixture
def mock_agent():
    """Mock agent data for testing"""
    return {
        "id": "test-agent-id",
        "name": "regulatory-expert",
        "slug": "regulatory-expert",
        "display_name": "Regulatory Expert",
        "description": "Expert in FDA and EMA regulations",
        "system_prompt": "You are a regulatory affairs expert specializing in FDA and EMA submissions.",
        "base_model": "claude-sonnet-4-20250514",
        "personality_type_id": "pt-analytical",
        "agent_levels": {"level_number": 2, "level_name": "Expert"},
        "status": "active",
    }


@pytest.fixture
def mock_tenant_id():
    """Mock tenant ID"""
    return "tenant-test-123"


@pytest.fixture
def mock_user_id():
    """Mock user ID"""
    return "user-test-456"


@pytest.fixture
def mock_agent_id():
    """Mock agent ID"""
    return "test-agent-id"


@pytest.fixture
def mock_llm_response():
    """Mock LLM response"""
    mock = MagicMock()
    mock.content = "This is a test response from the LLM."
    return mock


# ============================================================================
# Confidence Calculator Test Data
# ============================================================================

@pytest.fixture
def high_quality_scenario() -> Dict[str, Any]:
    """High quality response scenario (should get 0.85-0.95 confidence)"""
    return {
        "query": "What are FDA requirements for Class II devices?",
        "response": """FDA Class II devices require 510(k) premarket notification.

Key requirements include:
1. Substantial equivalence demonstration
2. Technical documentation (21 CFR Part 807)
3. Performance data and testing
4. Biocompatibility assessment
5. Software validation if applicable

Timeline: 90 days standard review

Quality System Regulation (21 CFR Part 820) compliance required.

References: FDA Guidance on 510(k), 21 CFR Part 807.""",
        "agent_metadata": {
            "name": "Regulatory Expert",
            "tier": 1,
            "agent_level": 1,
            "specialties": ["fda_regulatory", "quality_assurance"]
        },
        "rag_results": [
            {"similarity": 0.92},
            {"similarity": 0.89},
            {"similarity": 0.87},
            {"similarity": 0.84},
            {"similarity": 0.81}
        ],
        "expected_confidence_range": (0.85, 0.95),
        "expected_quality": "high"
    }


@pytest.fixture
def medium_quality_scenario() -> Dict[str, Any]:
    """Medium quality response scenario (should get 0.55-0.70 confidence)"""
    return {
        "query": "How do I start a clinical trial?",
        "response": "You need to submit a protocol to the IRB and get approval. Then you can start recruiting patients.",
        "agent_metadata": {
            "name": "General Agent",
            "tier": 3,
            "agent_level": 3,
            "specialties": ["general_medicine"]
        },
        "rag_results": [
            {"similarity": 0.65},
            {"similarity": 0.62}
        ],
        "expected_confidence_range": (0.55, 0.70),
        "expected_quality": "medium"
    }


@pytest.fixture
def low_quality_scenario() -> Dict[str, Any]:
    """Low quality response scenario (should get 0.30-0.55 confidence)"""
    return {
        "query": "What is a clinical trial?",
        "response": "It's a study.",
        "agent_metadata": {
            "name": "Basic Agent",
            "tier": 3,
            "agent_level": 3,
            "specialties": []
        },
        "rag_results": [
            {"similarity": 0.45}
        ],
        "expected_confidence_range": (0.30, 0.55),
        "expected_quality": "low"
    }


# ============================================================================
# RAG Configuration Test Data
# ============================================================================

@pytest.fixture
def rag_test_scenarios() -> List[Dict[str, Any]]:
    """Various RAG search scenarios for testing"""
    return [
        {
            "name": "high_similarity_l1",
            "tier": 1,
            "agent_level": 1,
            "similarity_scores": [0.92, 0.89, 0.87],
            "expected_threshold": 0.60,
            "expected_pass": True
        },
        {
            "name": "medium_similarity_l2",
            "tier": 2,
            "agent_level": 2,
            "similarity_scores": [0.78, 0.75, 0.72],
            "expected_threshold": 0.75,
            "expected_pass": True
        },
        {
            "name": "low_similarity_l3",
            "tier": 3,
            "agent_level": 3,
            "similarity_scores": [0.80, 0.78],
            "expected_threshold": 0.85,
            "expected_pass": False
        }
    ]


# ============================================================================
# Performance Benchmark Fixtures
# ============================================================================

@pytest.fixture
def benchmark_queries() -> List[str]:
    """Queries for performance benchmarking"""
    return [
        "What are FDA 510(k) requirements?",
        "How to design a Phase 2 clinical trial?",
        "What is the EMA approval process?",
        "Explain ICH-GCP guidelines",
        "What are pharmacovigilance requirements?",
        "How to write a clinical study report?",
        "What is substantial equivalence?",
        "Explain medical device classification",
        "What are post-market surveillance requirements?",
        "How to prepare an IND application?"
    ]


@pytest.fixture
def performance_thresholds() -> Dict[str, float]:
    """Performance thresholds for benchmarking"""
    return {
        "confidence_calculation_ms": 50,    # Max 50ms
        "embedding_generation_ms": 200,     # Max 200ms
        "rag_search_ms": 300,               # Max 300ms
        "agent_response_ms": 3000,          # Max 3s
        "total_latency_p90_ms": 500,        # P90 under 500ms
        "total_latency_p99_ms": 1000        # P99 under 1s
    }


# ============================================================================
# Helper Functions
# ============================================================================

def assert_confidence_in_range(
    confidence: float,
    expected_range: tuple,
    tolerance: float = 0.05
) -> None:
    """Assert confidence is within expected range with tolerance"""
    min_expected, max_expected = expected_range
    assert min_expected - tolerance <= confidence <= max_expected + tolerance, \
        f"Confidence {confidence} not in range {expected_range} ± {tolerance}"


def create_mock_embedding(dimension: int = 1536, seed: int = 42) -> List[float]:
    """Create reproducible mock embedding"""
    np.random.seed(seed)
    return np.random.rand(dimension).tolist()


# ============================================================================
# Test Markers
# ============================================================================

# Mark tests that require API keys
requires_api_key = pytest.mark.skipif(
    not os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY').startswith('test-'),
    reason="Requires valid OpenAI API key"
)

# Mark tests that require database
requires_database = pytest.mark.skipif(
    not os.getenv('DATABASE_URL') or 'test' not in os.getenv('DATABASE_URL', ''),
    reason="Requires test database"
)

# Mark tests that require Supabase
requires_supabase = pytest.mark.skipif(
    not os.getenv('SUPABASE_URL') or 'localhost' not in os.getenv('SUPABASE_URL', ''),
    reason="Requires Supabase instance"
)
